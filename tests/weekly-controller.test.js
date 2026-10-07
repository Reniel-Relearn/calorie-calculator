import assert from "node:assert/strict";
import test from "node:test";

import { createWeeklyController } from "../js/dashboard/weekly-controller.js";

function fakeView() {
  const calls = [];
  return {
    calls,
    reset() {
      calls.push(["reset"]);
    },
    showError(options) {
      calls.push(["showError", options]);
    },
    showLoading(options) {
      calls.push(["showLoading", options]);
    },
    showSummary(summary) {
      calls.push(["showSummary", summary]);
    },
  };
}

const PROFILE = Object.freeze({ userId: "user-a", timezoneName: "Asia/Manila" });
const TARGET = Object.freeze({
  id: "target-1",
  targetKcal: 2000,
  effectiveFrom: "2026-10-01T00:00:00Z",
});

test("loads the current week and supports previous, next, and current navigation", async () => {
  const requests = [];
  const view = fakeView();
  const controller = createWeeklyController({
    service: {
      async loadWeek(request) {
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
  await controller.previous();
  await controller.current();

  assert.deepEqual(
    requests.map(({ startDate, endDate }) => [startDate, endDate]),
    [
      ["2026-10-05", "2026-10-11"],
      ["2026-09-28", "2026-10-04"],
      ["2026-10-05", "2026-10-11"],
      ["2026-09-28", "2026-10-04"],
      ["2026-10-05", "2026-10-11"],
    ],
  );
  assert.equal(view.calls.filter(([name]) => name === "showSummary").length, 5);
});

test("refreshes only when a saved log belongs to the selected week", async () => {
  let loads = 0;
  const controller = createWeeklyController({
    service: {
      async loadWeek() {
        loads += 1;
        return { ok: true, logs: [], targets: [TARGET] };
      },
    },
    view: fakeView(),
    now: () => new Date("2026-10-07T04:00:00Z"),
  });

  await controller.activate(PROFILE);
  await controller.handleFoodLogSaved({ localDate: "2026-10-04" });
  await controller.handleFoodLogSaved({ localDate: "2026-10-07" });
  assert.equal(loads, 2);
});

test("shows recoverable weekly network and expired-session states", async () => {
  const view = fakeView();
  let attempts = 0;
  const controller = createWeeklyController({
    service: {
      async loadWeek() {
        attempts += 1;
        return attempts === 1
          ? { ok: false, code: "WEEKLY_LOAD_FAILED" }
          : { ok: false, code: "SESSION_REQUIRED" };
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

test("reset prevents stale weekly loads from rendering private data", async () => {
  let resolveLoad;
  const view = fakeView();
  const controller = createWeeklyController({
    service: {
      loadWeek() {
        return new Promise((resolve) => {
          resolveLoad = resolve;
        });
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
