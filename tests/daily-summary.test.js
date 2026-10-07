import assert from "node:assert/strict";
import test from "node:test";

import {
  addDaysToIsoDate,
  aggregateDailyLogs,
  buildDailySummary,
  compareCalories,
  getLocalDate,
  isIsoDate,
  selectTargetForDate,
} from "../js/dashboard/daily-summary.js";
import { formatLoggedServing } from "../js/dashboard/daily-view.js";

function log(overrides = {}) {
  return {
    caloriesKcal: 100,
    proteinG: 10,
    carbohydratesG: 20,
    fatG: 4,
    fiberG: 2,
    sugarG: 3,
    sodiumMg: 50,
    ...overrides,
  };
}

test("aggregates multiple entries while preserving complete nutrient totals", () => {
  const totals = aggregateDailyLogs([
    log(),
    log({ caloriesKcal: 150.25, proteinG: 0, sodiumMg: 25.5 }),
  ]);

  assert.equal(totals.entryCount, 2);
  assert.equal(totals.caloriesKcal, 250.25);
  assert.deepEqual(totals.nutrients.proteinG, {
    value: 10,
    availability: "complete",
  });
  assert.deepEqual(totals.nutrients.sodiumMg, {
    value: 75.5,
    availability: "complete",
  });
});

test("keeps all-null, mixed-null, and explicit zero nutrients distinct", () => {
  const totals = aggregateDailyLogs([
    log({ fiberG: null, sugarG: null, fatG: 0 }),
    log({ fiberG: null, sugarG: 2, fatG: 0 }),
  ]);

  assert.deepEqual(totals.nutrients.fiberG, {
    value: null,
    availability: "unavailable",
  });
  assert.deepEqual(totals.nutrients.sugarG, {
    value: 2,
    availability: "partial",
  });
  assert.deepEqual(totals.nutrients.fatG, {
    value: 0,
    availability: "complete",
  });

  const empty = aggregateDailyLogs([]);
  assert.equal(empty.caloriesKcal, 0);
  assert.equal(empty.nutrients.proteinG.value, null);
});

test("selects the target effective for current and completed local dates", () => {
  const targets = [
    { id: "old", targetKcal: 2000, effectiveFrom: "2026-03-08T04:30:00Z" },
    { id: "new", targetKcal: 2200, effectiveFrom: "2026-03-08T07:30:00Z" },
  ];
  const context = {
    now: new Date("2026-03-08T08:00:00Z"),
    timezoneName: "America/New_York",
  };

  assert.equal(selectTargetForDate(targets, "2026-03-07", context).id, "old");
  assert.equal(selectTargetForDate(targets, "2026-03-08", context).id, "new");
  assert.equal(
    selectTargetForDate(
      [{ id: "future", targetKcal: 2300, effectiveFrom: "2026-03-08T09:00:00Z" }],
      "2026-03-08",
      context,
    ),
    null,
  );
});

test("builds neutral remaining and above-target comparisons", () => {
  const target = {
    id: "target",
    targetKcal: 2000,
    effectiveFrom: "2026-10-01T00:00:00Z",
  };
  const remaining = buildDailySummary({
    logs: [log({ caloriesKcal: 1800 })],
    targets: [target],
    selectedDate: "2026-10-07",
    timezoneName: "Asia/Manila",
    now: new Date("2026-10-07T04:00:00Z"),
  });
  const above = compareCalories(2150, 2000);

  assert.equal(remaining.comparison.status, "remaining");
  assert.equal(remaining.comparison.amountKcal, 200);
  assert.deepEqual(above, { status: "above", amountKcal: 150 });
  assert.deepEqual(compareCalories(100, null), {
    status: "unavailable",
    amountKcal: null,
  });
});

test("handles local midnight, date arithmetic, and malformed dates safely", () => {
  assert.equal(
    getLocalDate(new Date("2026-10-06T16:00:00Z"), "Asia/Manila"),
    "2026-10-07",
  );
  assert.equal(addDaysToIsoDate("2026-03-01", -1), "2026-02-28");
  assert.equal(addDaysToIsoDate("2024-02-28", 1), "2024-02-29");
  assert.equal(isIsoDate("2026-02-30"), false);
  assert.equal(getLocalDate(new Date(), "Invalid/Zone"), null);
});

test("formats mass, volume, cup, and descriptor serving context", () => {
  assert.equal(
    formatLoggedServing({ enteredQuantity: 150, enteredUnit: "grams", enteredDescriptor: null, normalizedAmount: 150, normalizedUnit: "g" }),
    "150 g",
  );
  assert.equal(
    formatLoggedServing({ enteredQuantity: 250, enteredUnit: "milliliters", enteredDescriptor: null, normalizedAmount: 250, normalizedUnit: "ml" }),
    "250 mL",
  );
  assert.equal(
    formatLoggedServing({ enteredQuantity: 1, enteredUnit: "cups", enteredDescriptor: null, normalizedAmount: 158, normalizedUnit: "g" }),
    "1 cup · 158 g",
  );
  assert.equal(
    formatLoggedServing({ enteredQuantity: 1, enteredUnit: "pieces", enteredDescriptor: "large", normalizedAmount: 50, normalizedUnit: "g" }),
    "1 large piece · 50 g",
  );
});
