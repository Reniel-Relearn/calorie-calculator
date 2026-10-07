import assert from "node:assert/strict";
import test from "node:test";

import {
  createFoodLogEditCommand,
  getFoodLogLocalFields,
} from "../js/logs/food-log-editor.js";

function savedLog(overrides = {}) {
  return {
    id: "log-1",
    consumedAt: "2026-10-07T04:00:00.000Z",
    timezoneAtEntry: "Asia/Manila",
    localDate: "2026-10-07",
    foodId: "cooked-white-rice",
    foodNameSnapshot: "Cooked White Rice",
    enteredQuantity: 1,
    enteredUnit: "cups",
    enteredDescriptor: null,
    normalizedAmount: 158,
    normalizedUnit: "g",
    calculationSnapshot: {
      schemaVersion: "1.0.0",
      dataset: { name: "Demo", version: "1.1.0" },
      food: { id: "cooked-white-rice", name: "Cooked White Rice" },
      reference: {
        amount: 100,
        unit: "g",
        nutrition: {
          caloriesKcal: 130,
          proteinG: 2.69,
          carbohydratesG: 28.17,
          fatG: 0.28,
          fiberG: 0,
          sugarG: null,
          sodiumMg: 1,
        },
      },
      serving: {
        enteredQuantity: 1,
        enteredUnit: "cups",
        enteredDescriptor: null,
        normalizedAmount: 158,
        normalizedUnit: "g",
        conversionType: "unit",
        conversionMetadata: { gramsPerUnit: 158, source: "USDA" },
      },
      calculation: { scaleFactor: 1.58, nutrition: {} },
    },
    ...overrides,
  };
}

test("recalculates serving nutrition from the captured snapshot", () => {
  const log = savedLog();
  const original = JSON.stringify(log);
  const result = createFoodLogEditCommand(log, {
    quantity: "2",
    localDate: "2026-10-08",
    localTime: "00:30",
  });

  assert.equal(result.ok, true);
  assert.equal(result.command.normalizedAmount, 316);
  assert.equal(result.command.caloriesKcal, 410.8);
  assert.equal(result.command.fiberG, 0);
  assert.equal(result.command.sugarG, null);
  assert.equal(result.command.consumedAt, "2026-10-07T16:30:00.000Z");
  assert.equal(result.command.localDate, "2026-10-08");
  assert.equal(result.command.calculationSnapshot.serving.enteredQuantity, 2);
  assert.equal(JSON.stringify(log), original);
});

test("formats the saved instant in its captured timezone", () => {
  assert.deepEqual(getFoodLogLocalFields(savedLog()), {
    localDate: "2026-10-07",
    localTime: "12:00",
  });
});

test("supports direct volume snapshots without consulting current foods", () => {
  const log = savedLog({
    foodId: "whole-milk",
    enteredUnit: "milliliters",
    normalizedAmount: 250,
    normalizedUnit: "ml",
    calculationSnapshot: {
      ...savedLog().calculationSnapshot,
      food: { id: "whole-milk", name: "Whole Milk" },
      reference: {
        amount: 100,
        unit: "ml",
        nutrition: {
          caloriesKcal: 61,
          proteinG: 3.15,
          carbohydratesG: 4.8,
          fatG: 3.25,
          fiberG: 0,
          sugarG: 5.05,
          sodiumMg: 43,
        },
      },
      serving: {
        enteredQuantity: 250,
        enteredUnit: "milliliters",
        enteredDescriptor: null,
        normalizedAmount: 250,
        normalizedUnit: "ml",
        conversionType: "direct-milliliters",
        conversionMetadata: null,
      },
    },
  });
  const result = createFoodLogEditCommand(log, {
    quantity: 300,
    localDate: "2026-10-07",
    localTime: "12:00",
  });
  assert.equal(result.ok, true);
  assert.equal(result.command.normalizedAmount, 300);
  assert.equal(result.command.caloriesKcal, 183);
});

test("rejects malformed snapshots, invalid quantities, and nonexistent local times", () => {
  assert.equal(
    createFoodLogEditCommand(savedLog(), {
      quantity: 0,
      localDate: "2026-10-07",
      localTime: "12:00",
    }).code,
    "INVALID_QUANTITY",
  );
  assert.equal(
    createFoodLogEditCommand(savedLog({ calculationSnapshot: {} }), {
      quantity: 1,
      localDate: "2026-10-07",
      localTime: "12:00",
    }).code,
    "INVALID_SNAPSHOT",
  );
  assert.equal(
    createFoodLogEditCommand(
      savedLog({ timezoneAtEntry: "America/New_York" }),
      {
        quantity: 1,
        localDate: "2026-03-08",
        localTime: "02:30",
      },
    ).code,
    "INVALID_DATE_TIME",
  );
});
