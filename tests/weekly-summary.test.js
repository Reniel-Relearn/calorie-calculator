import assert from "node:assert/strict";
import test from "node:test";

import {
  buildWeeklySummary,
  getWeekDates,
  getWeekStartForDate,
} from "../js/dashboard/weekly-summary.js";

function log(localDate, caloriesKcal, overrides = {}) {
  return {
    localDate,
    caloriesKcal,
    proteinG: 0,
    carbohydratesG: 0,
    fatG: 0,
    fiberG: null,
    sugarG: null,
    sodiumMg: 0,
    ...overrides,
  };
}

function target(id, targetKcal, effectiveFrom) {
  return { id, targetKcal, effectiveFrom };
}

test("uses fixed Monday-through-Sunday boundaries across month and year edges", () => {
  assert.equal(getWeekStartForDate("2026-10-07"), "2026-10-05");
  assert.equal(getWeekStartForDate("2026-10-11"), "2026-10-05");
  assert.deepEqual(getWeekDates("2025-12-29"), [
    "2025-12-29",
    "2025-12-30",
    "2025-12-31",
    "2026-01-01",
    "2026-01-02",
    "2026-01-03",
    "2026-01-04",
  ]);
  assert.equal(getWeekStartForDate("2024-03-01"), "2024-02-26");
  assert.equal(getWeekDates("2026-10-06"), null);
  assert.equal(getWeekStartForDate("2026-02-30"), null);
});

test("returns seven rows including elapsed zero-log days and future days", () => {
  const summary = buildWeeklySummary({
    logs: [log("2026-10-05", 100), log("2026-10-07", 500)],
    targets: [target("target", 2100, "2026-10-01T00:00:00Z")],
    selectedWeekStart: "2026-10-05",
    timezoneName: "Asia/Manila",
    now: new Date("2026-10-07T04:00:00Z"),
  });

  assert.equal(summary.ok, true);
  assert.equal(summary.rows.length, 7);
  assert.equal(summary.rows[1].totals.entryCount, 0);
  assert.equal(summary.rows[1].totals.caloriesKcal, 0);
  assert.equal(summary.rows[2].isToday, true);
  assert.equal(summary.rows[3].isFuture, true);
  assert.equal(summary.rows[3].comparison.status, "future");
  assert.equal(summary.elapsedDayCount, 3);
  assert.equal(summary.averageIntakeKcal, 200);
  assert.equal(summary.hasNoHistory, false);
});

test("resolves historical target changes per day and documents average coverage", () => {
  const summary = buildWeeklySummary({
    logs: [],
    targets: [
      target("old", 2000, "2026-10-01T00:00:00Z"),
      target("new", 2200, "2026-10-06T00:00:00Z"),
    ],
    selectedWeekStart: "2026-10-05",
    timezoneName: "Asia/Manila",
    now: new Date("2026-10-07T04:00:00Z"),
  });

  assert.deepEqual(
    summary.rows.slice(0, 3).map(({ targetKcal }) => targetKcal),
    [2000, 2200, 2200],
  );
  assert.equal(summary.targetAvailability, "complete");
  assert.equal(summary.targetDayCount, 3);
  assert.equal(summary.averageTargetKcal, 2133.333333);
});

test("keeps missing targets unavailable and averages only applicable target days", () => {
  const unavailable = buildWeeklySummary({
    logs: [],
    targets: [],
    selectedWeekStart: "2026-10-05",
    timezoneName: "Asia/Manila",
    now: new Date("2026-10-07T04:00:00Z"),
  });
  assert.equal(unavailable.targetAvailability, "unavailable");
  assert.equal(unavailable.averageTargetKcal, null);
  assert.equal(unavailable.hasNoHistory, true);

  const partial = buildWeeklySummary({
    logs: [],
    targets: [target("late", 2200, "2026-10-06T00:00:00Z")],
    selectedWeekStart: "2026-10-05",
    timezoneName: "Asia/Manila",
    now: new Date("2026-10-07T04:00:00Z"),
  });
  assert.equal(partial.targetAvailability, "partial");
  assert.equal(partial.targetDayCount, 2);
  assert.equal(partial.averageTargetKcal, 2200);
  assert.equal(partial.rows[0].comparison.status, "unavailable");
});

test("completed weeks average all seven dates including zero-log days", () => {
  const summary = buildWeeklySummary({
    logs: [log("2026-09-28", 7000)],
    targets: [target("target", 2000, "2026-09-01T00:00:00Z")],
    selectedWeekStart: "2026-09-28",
    timezoneName: "Asia/Manila",
    now: new Date("2026-10-07T04:00:00Z"),
  });

  assert.equal(summary.elapsedDayCount, 7);
  assert.equal(summary.averageIntakeKcal, 1000);
  assert.equal(summary.averageTargetKcal, 2000);
  assert.equal(summary.rows[0].comparison.status, "above");
  assert.equal(summary.rows[1].comparison.status, "remaining");
});

test("uses the profile timezone through a DST transition and does not mutate input", () => {
  const logs = [log("2026-03-08", 0, { sodiumMg: null })];
  const targets = [target("target", 2000, "2026-03-01T05:00:00Z")];
  const original = JSON.stringify({ logs, targets });
  const summary = buildWeeklySummary({
    logs,
    targets,
    selectedWeekStart: "2026-03-02",
    timezoneName: "America/New_York",
    now: new Date("2026-03-08T07:30:00Z"),
  });

  assert.equal(summary.today, "2026-03-08");
  assert.equal(summary.rows[6].isToday, true);
  assert.equal(summary.rows[6].totals.caloriesKcal, 0);
  assert.equal(summary.rows[6].totals.nutrients.sodiumMg.value, null);
  assert.equal(JSON.stringify({ logs, targets }), original);
  assert.deepEqual(
    buildWeeklySummary({
      logs,
      targets,
      selectedWeekStart: "2026-03-02",
      timezoneName: "America/New_York",
      now: new Date("2026-03-08T07:30:00Z"),
    }),
    summary,
  );
});

test("rejects future weeks and malformed context", () => {
  assert.equal(
    buildWeeklySummary({
      logs: [],
      targets: [],
      selectedWeekStart: "2026-10-12",
      timezoneName: "Asia/Manila",
      now: new Date("2026-10-07T04:00:00Z"),
    }).code,
    "INVALID_WEEKLY_CONTEXT",
  );
  assert.equal(
    buildWeeklySummary({
      logs: [],
      targets: [],
      selectedWeekStart: "bad-date",
      timezoneName: "Asia/Manila",
      now: new Date("2026-10-07T04:00:00Z"),
    }).ok,
    false,
  );
});
