import assert from "node:assert/strict";
import test from "node:test";

import { createDailyController } from "../js/dashboard/daily-controller.js";

function fakeView() {
  const calls = [];
  return {
    calls,
    reset() { calls.push(["reset"]); },
    showError(options) { calls.push(["showError", options]); },
    showLoading(options) { calls.push(["showLoading", options]); },
    showSummary(summary) { calls.push(["showSummary", summary]); },
  };
}

const PROFILE = Object.freeze({ userId: "user-a", timezoneName: "Asia/Manila" });
const TARGET = Object.freeze({ id: "target-1", targetKcal: 2000, effectiveFrom: "2026-10-01T00:00:00Z" });

test("loads today and supports previous, next, and today navigation", async () => {
  const requests = [];
  const view = fakeView();
  const controller = createDailyController({
    service: {
      async loadDay(request) {
        requests.push(request);
        return { ok: true, logs: [], targets: [TARGET] };
      },
    },
    view,
    now: () => new Date("2026-10-07T04:00:00Z"),
  });

  await controller.activate(PROFILE);
  await controller.previous();
  await controller.next();
  await controller.next();

  assert.deepEqual(requests.map(({ localDate }) => localDate), ["2026-10-07", "2026-10-06", "2026-10-07"]);
  assert.equal(view.calls.filter(([name]) => name === "showSummary").length, 3);
});

test("refreshes only when a saved log belongs to the selected date", async () => {
  let loads = 0;
  const controller = createDailyController({
    service: {
      async loadDay() {
        loads += 1;
        return { ok: true, logs: [], targets: [TARGET] };
      },
    },
    view: fakeView(),
    now: () => new Date("2026-10-07T04:00:00Z"),
  });

  await controller.activate(PROFILE);
  await controller.handleFoodLogSaved({ localDate: "2026-10-06" });
  await controller.handleFoodLogSaved({ localDate: "2026-10-07" });
  assert.equal(loads, 2);
});

test("shows recoverable network and expired-session states", async () => {
  const view = fakeView();
  let attempts = 0;
  const controller = createDailyController({
    service: {
      async loadDay() {
        attempts += 1;
        return attempts === 1 ? { ok: false, code: "DAILY_LOAD_FAILED" } : { ok: false, code: "SESSION_REQUIRED" };
      },
    },
    view,
    now: () => new Date("2026-10-07T04:00:00Z"),
  });

  await controller.activate(PROFILE);
  await controller.retry();
  const errors = view.calls.filter(([name]) => name === "showError");
  assert.equal(errors[0][1].sessionExpired, false);
  assert.equal(errors[1][1].sessionExpired, true);
});

test("reset prevents stale loads from rendering private data", async () => {
  let resolveLoad;
  const view = fakeView();
  const controller = createDailyController({
    service: {
      loadDay() {
        return new Promise((resolve) => { resolveLoad = resolve; });
      },
    },
    view,
    now: () => new Date("2026-10-07T04:00:00Z"),
  });

  const activation = controller.activate(PROFILE);
  controller.reset();
  resolveLoad({ ok: true, logs: [], targets: [TARGET] });
  await activation;

  assert.equal(view.calls.at(-1)[0], "reset");
  assert.equal(view.calls.some(([name]) => name === "showSummary"), false);
});
