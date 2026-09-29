import test from "node:test";
import assert from "node:assert/strict";

import { calculateFoodInput } from "../js/app.js";
import { APP_STATES } from "../js/state.js";

test("keeps representative mass, cup, and volume calculations working", () => {
  const cases = [
    ["150g grilled chicken breast", "g", 150],
    ["1 cup cooked white rice", "g", 158],
    ["250ml whole milk", "ml", 250],
  ];

  for (const [input, expectedUnit, expectedAmount] of cases) {
    const result = calculateFoodInput(input);

    assert.equal(result.applicationState, APP_STATES.SUCCESS, input);
    assert.equal(result.eligibleForSuccess, true, input);
    assert.equal(result.conversion.normalizedUnit, expectedUnit, input);
    assert.equal(result.conversion.normalizedAmount, expectedAmount, input);
    assert.equal(
      Number.isFinite(result.nutritionCalculation.nutrition.caloriesKcal),
      true,
      input,
    );
  }
});

test("keeps ambiguity and missing-amount states distinct", () => {
  assert.equal(calculateFoodInput("chicken").applicationState, APP_STATES.AMBIGUOUS);
  assert.equal(
    calculateFoodInput("grilled chicken breast").applicationState,
    APP_STATES.NEEDS_AMOUNT,
  );
});

test("does not restore the retired arbitrary serving maximum", () => {
  const result = calculateFoodInput("10000g grilled chicken breast");

  assert.equal(result.applicationState, APP_STATES.SUCCESS);
  assert.equal(result.conversion.normalizedAmount, 10000);
  assert.equal(
    Number.isFinite(result.nutritionCalculation.nutrition.caloriesKcal),
    true,
  );
});

test("keeps incompatible measurement bases invalid", () => {
  const solidAsVolume = calculateFoodInput("250ml grilled chicken breast");
  const liquidAsMass = calculateFoodInput("250g whole milk");

  assert.equal(solidAsVolume.applicationState, APP_STATES.INVALID);
  assert.equal(liquidAsMass.applicationState, APP_STATES.INVALID);
});

test("keeps generic banana and saba banana matching separate", () => {
  const banana = calculateFoodInput("100g banana");
  const saba = calculateFoodInput("100g saba banana");

  assert.equal(banana.matches[0].id, "banana");
  assert.equal(saba.matches[0].id, "saba-banana");
});
