import test from "node:test";
import assert from "node:assert/strict";

import {
  ENERGY_GOAL_TYPES,
  ENERGY_METHODOLOGY,
  ENERGY_TARGET_CODES,
  ENERGY_TARGET_STATUSES,
  calculateEnergyTarget,
} from "../js/targets/energy-target.js";
import {
  ENERGY_EQUATION_BRANCHES,
} from "../js/targets/eer-equations.js";
import { roundKcalForDisplay } from "../js/targets/target-format.js";
import {
  EER_REFERENCE_CASES,
  NASEM_WORKED_EXAMPLE,
} from "./fixtures/eer-reference-cases.js";

function createInput(overrides = {}) {
  return {
    ageYears: 35,
    sexForEnergyEquation: "female",
    heightCm: 165,
    weightKg: 63,
    activityCategory: "low_active",
    goalType: ENERGY_GOAL_TYPES.MAINTAIN,
    lifeStageEligibilityConfirmed: true,
    ...overrides,
  };
}

test("matches fixed reference values for every age, sex, and activity branch", () => {
  for (const [name, base, sex, activityCategory, expectedKcal] of EER_REFERENCE_CASES) {
    const result = calculateEnergyTarget(
      createInput({
        ...base,
        sexForEnergyEquation: sex,
        activityCategory,
      }),
    );

    assert.equal(result.status, ENERGY_TARGET_STATUSES.SUCCESS, name);
    assert.equal(result.maintenanceKcal, expectedKcal, name);
    assert.equal(result.targetKcal, expectedKcal, name);
  }
});

test("matches the National Academies worked example before display rounding", () => {
  const result = calculateEnergyTarget(
    createInput(NASEM_WORKED_EXAMPLE.input),
  );

  assert.equal(result.maintenanceKcal, NASEM_WORKED_EXAMPLE.calculatedKcal);
  assert.equal(
    roundKcalForDisplay(result.maintenanceKcal),
    NASEM_WORKED_EXAMPLE.publishedRoundedKcal,
  );
});

test("uses the adolescent branch from age 18 up to but excluding 19", () => {
  const below18 = calculateEnergyTarget(createInput({ ageYears: 17.999999 }));
  const at18 = calculateEnergyTarget(createInput({ ageYears: 18 }));
  const above18 = calculateEnergyTarget(createInput({ ageYears: 18.000001 }));
  const below19 = calculateEnergyTarget(createInput({ ageYears: 18.999999 }));
  const at19 = calculateEnergyTarget(createInput({ ageYears: 19 }));
  const above19 = calculateEnergyTarget(createInput({ ageYears: 19.000001 }));

  assert.equal(below18.code, ENERGY_TARGET_CODES.UNDERAGE);
  assert.equal(at18.equationBranch, ENERGY_EQUATION_BRANCHES.ADOLESCENT_14_TO_18_99);
  assert.equal(above18.equationBranch, ENERGY_EQUATION_BRANCHES.ADOLESCENT_14_TO_18_99);
  assert.equal(below19.equationBranch, ENERGY_EQUATION_BRANCHES.ADOLESCENT_14_TO_18_99);
  assert.equal(at19.equationBranch, ENERGY_EQUATION_BRANCHES.ADULT_19_PLUS);
  assert.equal(above19.equationBranch, ENERGY_EQUATION_BRANCHES.ADULT_19_PLUS);
});

test("rejects noncanonical, missing, and non-finite measurements", () => {
  const cases = [
    [{ ageYears: Number.NaN }, ENERGY_TARGET_CODES.INVALID_AGE],
    [{ ageYears: Number.POSITIVE_INFINITY }, ENERGY_TARGET_CODES.INVALID_AGE],
    [{ ageYears: 0 }, ENERGY_TARGET_CODES.INVALID_AGE],
    [{ heightCm: "165" }, ENERGY_TARGET_CODES.INVALID_HEIGHT],
    [{ heightCm: 0 }, ENERGY_TARGET_CODES.INVALID_HEIGHT],
    [{ weightKg: Number.NEGATIVE_INFINITY }, ENERGY_TARGET_CODES.INVALID_WEIGHT],
    [{ weightKg: -1 }, ENERGY_TARGET_CODES.INVALID_WEIGHT],
    [{ lifeStageEligibilityConfirmed: null }, ENERGY_TARGET_CODES.MISSING_LIFE_STAGE_CONFIRMATION],
  ];

  for (const [override, expectedCode] of cases) {
    const result = calculateEnergyTarget(createInput(override));
    assert.equal(result.status, ENERGY_TARGET_STATUSES.INVALID);
    assert.equal(result.code, expectedCode);
    assert.equal(result.targetKcal, null);
  }
});

test("fails safely when finite inputs overflow the calculation", () => {
  const result = calculateEnergyTarget(
    createInput({ heightCm: Number.MAX_VALUE, weightKg: Number.MAX_VALUE }),
  );

  assert.equal(result.status, ENERGY_TARGET_STATUSES.INVALID);
  assert.equal(result.code, ENERGY_TARGET_CODES.NON_FINITE_RESULT);
  assert.equal(result.maintenanceKcal, null);
  assert.equal(result.targetKcal, null);
});

test("returns explicit ineligible outcomes for underage and excluded life stages", () => {
  const underage = calculateEnergyTarget(createInput({ ageYears: 17 }));
  const lifeStage = calculateEnergyTarget(
    createInput({ lifeStageEligibilityConfirmed: false }),
  );

  assert.equal(underage.status, ENERGY_TARGET_STATUSES.INELIGIBLE);
  assert.equal(underage.eligible, false);
  assert.equal(underage.code, ENERGY_TARGET_CODES.UNDERAGE);
  assert.equal(lifeStage.status, ENERGY_TARGET_STATUSES.INELIGIBLE);
  assert.equal(lifeStage.eligible, false);
  assert.equal(lifeStage.code, ENERGY_TARGET_CODES.LIFE_STAGE_NOT_ELIGIBLE);
});

test("returns unavailable for categories without a source equation", () => {
  const cases = [
    [
      { sexForEnergyEquation: "another" },
      ENERGY_TARGET_CODES.UNSUPPORTED_EQUATION_SEX,
    ],
    [
      { activityCategory: "athlete" },
      ENERGY_TARGET_CODES.UNSUPPORTED_ACTIVITY_CATEGORY,
    ],
    [{ goalType: "healthy" }, ENERGY_TARGET_CODES.UNSUPPORTED_GOAL],
  ];

  for (const [override, expectedCode] of cases) {
    const result = calculateEnergyTarget(createInput(override));
    assert.equal(result.status, ENERGY_TARGET_STATUSES.UNAVAILABLE);
    assert.equal(result.code, expectedCode);
    assert.equal(result.targetKcal, null);
  }
});

test("keeps loss and gain unavailable without inventing a deficit or surplus", () => {
  for (const goalType of [ENERGY_GOAL_TYPES.LOSE, ENERGY_GOAL_TYPES.GAIN]) {
    const result = calculateEnergyTarget(createInput({ goalType }));

    assert.equal(result.status, ENERGY_TARGET_STATUSES.UNAVAILABLE);
    assert.equal(result.code, ENERGY_TARGET_CODES.GOAL_METHOD_UNAVAILABLE);
    assert.equal(result.maintenanceKcal, 2184.24);
    assert.equal(result.targetKcal, null);
    assert.equal(result.goalMethodology, undefined);
  }
});

test("records stable methodology and omits the nonpersistent eligibility confirmation", () => {
  const result = calculateEnergyTarget(createInput());

  assert.equal(result.methodology.id, ENERGY_METHODOLOGY.id);
  assert.equal(result.methodology.version, ENERGY_METHODOLOGY.version);
  assert.equal(result.methodology.sourceDoi, "10.17226/26818");
  assert.equal(Object.hasOwn(result.normalizedInputs, "lifeStageEligibilityConfirmed"), false);
  assert.equal(Number.isFinite(result.uncertainty.predictionRmseKcal), true);
});

test("is deterministic and does not mutate inputs", () => {
  const input = createInput();
  const before = structuredClone(input);
  const first = calculateEnergyTarget(input);
  const second = calculateEnergyTarget(input);

  assert.deepEqual(input, before);
  assert.deepEqual(first, second);
});

test("keeps presentation rounding outside the calculation engine", () => {
  const result = calculateEnergyTarget(createInput());

  assert.equal(result.maintenanceKcal, 2184.24);
  assert.equal(roundKcalForDisplay(result.maintenanceKcal), 2184);
  assert.equal(roundKcalForDisplay(Number.NaN), null);
});
