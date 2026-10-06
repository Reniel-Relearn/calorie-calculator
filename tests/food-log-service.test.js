import test from "node:test";
import assert from "node:assert/strict";
import { createFoodLogService } from "../js/logs/food-log-service.js";

const COMMAND = Object.freeze({
  requestId: "71000000-0000-0000-0000-000000000001",
  consumedAt: "2026-10-07T04:30:00.000Z",
  timezoneAtEntry: "Asia/Manila",
  localDate: "2026-10-07",
  foodId: "banana",
  foodNameSnapshot: "Banana",
  enteredQuantity: 100,
  enteredUnit: "grams",
  enteredDescriptor: null,
  normalizedAmount: 100,
  normalizedUnit: "g",
  caloriesKcal: 89,
  proteinG: 1.09,
  carbohydratesG: 22.84,
  fatG: 0.33,
  fiberG: 2.6,
  sugarG: 12.23,
  sodiumMg: 1,
  nutritionDatasetVersion: "v1-demo-2026-09-25",
  sourceReference: "USDA test source",
  calculationSnapshot: { schemaVersion: "1.0.0" },
});

function rowFor(command = COMMAND) {
  return {
    id: command.requestId,
    consumed_at: command.consumedAt,
    timezone_at_entry: command.timezoneAtEntry,
    local_date: command.localDate,
    food_id: command.foodId,
    food_name_snapshot: command.foodNameSnapshot,
    entered_quantity: String(command.enteredQuantity),
    entered_unit: command.enteredUnit,
    entered_descriptor: command.enteredDescriptor,
    normalized_amount: String(command.normalizedAmount),
    normalized_unit: command.normalizedUnit,
    calories_kcal: String(command.caloriesKcal),
    protein_g: String(command.proteinG),
    carbohydrates_g: String(command.carbohydratesG),
    fat_g: String(command.fatG),
    fiber_g: String(command.fiberG),
    sugar_g: null,
    sodium_mg: String(command.sodiumMg),
    nutrition_dataset_version: command.nutritionDatasetVersion,
    source_reference: command.sourceReference,
    calculation_snapshot: command.calculationSnapshot,
  };
}

test("saves through the owner-derived RPC without sending a user id", async () => {
  const calls = [];
  const service = createFoodLogService({
    async rpc(name, parameters) {
      calls.push({ name, parameters });
      return { data: { log: rowFor(), idempotent: false }, error: null };
    },
  });

  const result = await service.create(COMMAND);
  assert.equal(result.ok, true);
  assert.equal(result.log.sugarG, null);
  assert.equal(result.log.fiberG, 2.6);
  assert.equal(calls[0].name, "create_food_log");
  assert.equal(calls[0].parameters.p_request_id, COMMAND.requestId);
  assert.equal(Object.hasOwn(calls[0].parameters, "p_user_id"), false);
});

test("preserves the RPC idempotent outcome", async () => {
  const service = createFoodLogService({
    async rpc() {
      return { data: { log: rowFor(), idempotent: true }, error: null };
    },
  });
  const result = await service.create(COMMAND);
  assert.equal(result.ok, true);
  assert.equal(result.idempotent, true);
});

test("maps expired sessions and other failures to safe outcomes", async () => {
  const expired = createFoodLogService({
    async rpc() {
      return { data: null, error: { code: "42501", message: "provider detail" } };
    },
  });
  const failed = createFoodLogService({
    async rpc() {
      throw new Error("network detail");
    },
  });

  assert.equal((await expired.create(COMMAND)).code, "SESSION_REQUIRED");
  assert.equal((await failed.create(COMMAND)).code, "LOG_SAVE_FAILED");
});
