import test from "node:test";
import assert from "node:assert/strict";
import { calculateFoodInput } from "../js/app.js";
import { createFoodLogController } from "../js/logs/food-log-controller.js";

function resultFor(input = "100g banana") {
  const calculation = calculateFoodInput(input);
  return {
    food: calculation.matches[0],
    servingInput: {
      quantity: calculation.parsedInput.quantity,
      unit: calculation.parsedInput.unit,
      servingDescriptor: calculation.parsedInput.servingDescriptor,
    },
    conversion: calculation.conversion,
    nutritionCalculation: calculation.nutritionCalculation,
  };
}

function createViewRecord() {
  return {
    busy: [],
    errors: [],
    resets: 0,
    successes: [],
    resetFoodLogStatus() { this.resets += 1; },
    setFoodLogBusy(value, options) { this.busy.push({ value, options }); },
    showFoodLogError(message) { this.errors.push(message); },
    showFoodLogSuccess(message) { this.successes.push(message); },
  };
}

function createController(service, overrides = {}) {
  const view = createViewRecord();
  const saved = [];
  const controller = createFoodLogController({
    service,
    view,
    now: () => new Date("2026-10-07T04:30:00.000Z"),
    createRequestId: () => "71000000-0000-0000-0000-000000000001",
    onSaved: (log) => saved.push(log),
    ...overrides,
  });
  controller.activate({ timezoneName: "Asia/Manila" });
  return { controller, saved, view };
}

test("analysis/result availability alone never writes a food log", () => {
  let writes = 0;
  const { controller } = createController({ async create() { writes += 1; } });
  controller.setResult(resultFor());
  assert.equal(writes, 0);
});

test("one explicit action writes once and publishes the saved log", async () => {
  const commands = [];
  const service = {
    async create(command) {
      commands.push(command);
      return { ok: true, idempotent: false, log: { id: command.requestId } };
    },
  };
  const { controller, saved, view } = createController(service);
  controller.setResult(resultFor());
  await controller.save();
  await controller.save();

  assert.equal(commands.length, 1);
  assert.equal(saved.length, 1);
  assert.equal(view.successes[0], "Added to today's log.");
  assert.deepEqual(view.busy.at(-1), { value: false, options: { saved: true } });
});

test("prevents a double-click race while a save is pending", async () => {
  let resolveSave;
  const commands = [];
  const service = {
    create(command) {
      commands.push(command);
      return new Promise((resolve) => { resolveSave = resolve; });
    },
  };
  const { controller } = createController(service);
  controller.setResult(resultFor());
  const first = controller.save();
  const second = controller.save();

  assert.equal(commands.length, 1);
  resolveSave({ ok: true, idempotent: false, log: { id: commands[0].requestId } });
  await Promise.all([first, second]);
  assert.equal(commands.length, 1);
});

test("a network retry reuses the identical request and consumed instant", async () => {
  const commands = [];
  const service = {
    async create(command) {
      commands.push(structuredClone(command));
      return commands.length === 1
        ? { ok: false, code: "LOG_SAVE_FAILED" }
        : { ok: true, idempotent: true, log: { id: command.requestId } };
    },
  };
  const { controller, view } = createController(service);
  controller.setResult(resultFor("250ml whole milk"));
  await controller.save();
  await controller.save();

  assert.equal(commands.length, 2);
  assert.deepEqual(commands[1], commands[0]);
  assert.match(view.errors[0], /try again/i);
  assert.match(view.successes[0], /already added/i);
});

test("an expired session fails safely and keeps the result retryable", async () => {
  let calls = 0;
  const { controller, view } = createController({
    async create() {
      calls += 1;
      return { ok: false, code: "SESSION_REQUIRED" };
    },
  });
  controller.setResult(resultFor());
  await controller.save();
  await controller.save();

  assert.equal(calls, 2);
  assert.match(view.errors[0], /session has ended/i);
});
