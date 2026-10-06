import test from "node:test";
import assert from "node:assert/strict";
import { calculateFoodInput } from "../js/app.js";
import {
  createFoodLogCommand,
  FOOD_LOG_SNAPSHOT_VERSION,
} from "../js/logs/food-log-mapper.js";
import { NUTRITION_DATASET_VERSION } from "../data/foods.js";

const PROFILE = Object.freeze({ timezoneName: "Asia/Manila" });
const REQUEST_ID = "71000000-0000-0000-0000-000000000001";

function resultFor(input) {
  const calculation = calculateFoodInput(input);
  assert.equal(calculation.eligibleForSuccess, true);
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

function mapResult(result, options = {}) {
  return createFoodLogCommand({
    requestId: REQUEST_ID,
    profile: PROFILE,
    result,
    consumedAt: new Date("2026-10-07T04:30:00.000Z"),
    ...options,
  });
}

test("maps representative grams, cup, and milliliter results", () => {
  const grams = mapResult(resultFor("150g grilled chicken breast"));
  assert.equal(grams.ok, true);
  assert.equal(grams.command.enteredUnit, "grams");
  assert.equal(grams.command.normalizedAmount, 150);
  assert.equal(grams.command.normalizedUnit, "g");

  const cup = mapResult(resultFor("1 cup cooked white rice"));
  assert.equal(cup.ok, true);
  assert.equal(cup.command.enteredUnit, "cups");
  assert.equal(cup.command.normalizedAmount, 158);
  assert.equal(
    cup.command.calculationSnapshot.serving.conversionMetadata.gramsPerUnit,
    158,
  );

  const volume = mapResult(resultFor("250ml whole milk"));
  assert.equal(volume.ok, true);
  assert.equal(volume.command.enteredUnit, "milliliters");
  assert.equal(volume.command.normalizedAmount, 250);
  assert.equal(volume.command.normalizedUnit, "ml");
});

test("captures versioned source and reference data that can reproduce the result", () => {
  const mapped = mapResult(resultFor("1 cup cooked white rice"));
  const { command } = mapped;
  const snapshot = command.calculationSnapshot;

  assert.equal(snapshot.schemaVersion, FOOD_LOG_SNAPSHOT_VERSION);
  assert.equal(snapshot.dataset.version, NUTRITION_DATASET_VERSION);
  assert.equal(snapshot.food.id, command.foodId);
  assert.equal(snapshot.food.source.sourceReference, command.sourceReference);
  assert.equal(snapshot.reference.amount, 100);
  assert.equal(snapshot.reference.unit, "g");

  const reproducedCalories = Number(
    (
      snapshot.reference.nutrition.caloriesKcal *
      (snapshot.serving.normalizedAmount / snapshot.reference.amount)
    ).toPrecision(12),
  );
  assert.equal(reproducedCalories, snapshot.calculation.nutrition.caloriesKcal);
});

test("preserves explicit zero separately from an unavailable nutrient", () => {
  const result = resultFor("100g banana");
  result.nutritionCalculation = {
    ...result.nutritionCalculation,
    nutrition: {
      ...result.nutritionCalculation.nutrition,
      fiberG: 0,
      sugarG: null,
    },
  };
  const mapped = mapResult(result);

  assert.equal(mapped.command.fiberG, 0);
  assert.equal(mapped.command.sugarG, null);
  assert.equal(mapped.command.calculationSnapshot.calculation.nutrition.fiberG, 0);
  assert.equal(mapped.command.calculationSnapshot.calculation.nutrition.sugarG, null);
});

test("derives the stable local date in the profile timezone", () => {
  const instant = new Date("2026-01-01T16:30:00.000Z");
  const manila = mapResult(resultFor("100g banana"), { consumedAt: instant });
  const losAngeles = mapResult(resultFor("100g banana"), {
    consumedAt: instant,
    profile: { timezoneName: "America/Los_Angeles" },
  });

  assert.equal(manila.command.localDate, "2026-01-02");
  assert.equal(losAngeles.command.localDate, "2026-01-01");
  assert.equal(manila.command.consumedAt, instant.toISOString());
});

test("does not mutate the source food or successful result", () => {
  const result = resultFor("150g grilled chicken breast");
  const before = JSON.stringify(result);
  const mapped = mapResult(result);

  assert.equal(mapped.ok, true);
  assert.equal(JSON.stringify(result), before);
});

test("rejects incomplete results, invalid timezones, and invalid nutrients safely", () => {
  assert.equal(mapResult(null).code, "INVALID_RESULT");
  assert.equal(
    mapResult(resultFor("100g banana"), {
      profile: { timezoneName: "Not/A_Timezone" },
    }).code,
    "INVALID_TIMEZONE",
  );

  const result = resultFor("100g banana");
  result.nutritionCalculation = {
    ...result.nutritionCalculation,
    nutrition: { ...result.nutritionCalculation.nutrition, proteinG: Number.NaN },
  };
  assert.equal(mapResult(result).code, "INVALID_NUTRITION");
});
