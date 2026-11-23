import test from "node:test";
import assert from "node:assert/strict";

import {
  ENERGY_GOAL_TYPES,
  DIRECTIONAL_ENERGY_METHODOLOGY,
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
    directionalSafetyEligibilityConfirmed: true,
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

test("calculates adult Lose and Gain starting estimates from raw EER and sex-specific SEPV", () => {
  const lose = calculateEnergyTarget(
    createInput({ goalType: ENERGY_GOAL_TYPES.LOSE }),
  );
  const gain = calculateEnergyTarget(
    createInput({ goalType: ENERGY_GOAL_TYPES.GAIN }),
  );

  assert.equal(lose.status, ENERGY_TARGET_STATUSES.SUCCESS);
  assert.equal(lose.maintenanceKcal, 2184.24);
  assert.equal(lose.targetKcal, 1711.88);
  assert.equal(gain.targetKcal, 2656.6);
  assert.equal(lose.methodology.id, DIRECTIONAL_ENERGY_METHODOLOGY.id);
  assert.deepEqual(lose.normalizedInputs.directionalAdjustment, {
    method: "prediction_interval_boundary",
    sepvKcal: 241,
    multiplier: 1.96,
    adjustmentKcal: 472.36,
    direction: "subtract",
    safetyPolicyVersion: "1.0.0",
  });

  const maleLose = calculateEnergyTarget(
    createInput({
      ageYears: 45,
      sexForEnergyEquation: "male",
      heightCm: 175,
      weightKg: 100,
      activityCategory: "low_active",
      goalType: ENERGY_GOAL_TYPES.LOSE,
    }),
  );
  const maleGain = calculateEnergyTarget(
    createInput({
      ageYears: 45,
      sexForEnergyEquation: "male",
      heightCm: 175,
      weightKg: 55,
      activityCategory: "low_active",
      goalType: ENERGY_GOAL_TYPES.GAIN,
    }),
  );

  assert.equal(maleLose.maintenanceKcal, 3040.62);
  assert.equal(maleLose.targetKcal, 2370.3);
  assert.equal(maleGain.maintenanceKcal, 2368.32);
  assert.equal(maleGain.targetKcal, 3038.64);
  assert.equal(
    maleLose.normalizedInputs.directionalAdjustment.sepvKcal,
    342,
  );
});

test("keeps age 18 directional goals unavailable while Maintain remains supported", () => {
  const maintain = calculateEnergyTarget(createInput({ ageYears: 18 }));
  const lose = calculateEnergyTarget(
    createInput({ ageYears: 18.999999, goalType: ENERGY_GOAL_TYPES.LOSE }),
  );

  assert.equal(maintain.status, ENERGY_TARGET_STATUSES.SUCCESS);
  assert.equal(lose.status, ENERGY_TARGET_STATUSES.UNAVAILABLE);
  assert.equal(lose.code, ENERGY_TARGET_CODES.DIRECTIONAL_AGE_UNAVAILABLE);
});

test("fails closed for directional safety, BMI, and low-intake boundaries", () => {
  const missingConfirmation = calculateEnergyTarget(
    createInput({
      goalType: ENERGY_GOAL_TYPES.GAIN,
      directionalSafetyEligibilityConfirmed: undefined,
    }),
  );
  const reportedRisk = calculateEnergyTarget(
    createInput({
      goalType: ENERGY_GOAL_TYPES.GAIN,
      directionalSafetyEligibilityConfirmed: false,
    }),
  );
  const underweightLose = calculateEnergyTarget(
    createInput({
      goalType: ENERGY_GOAL_TYPES.LOSE,
      heightCm: 180,
      weightKg: 58,
    }),
  );
  const severeUnderweightGain = calculateEnergyTarget(
    createInput({
      goalType: ENERGY_GOAL_TYPES.GAIN,
      heightCm: 180,
      weightKg: 50,
    }),
  );
  const belowFloor = calculateEnergyTarget(
    createInput({
      ageYears: 70,
      goalType: ENERGY_GOAL_TYPES.LOSE,
      heightCm: 140,
      weightKg: 37,
      activityCategory: "inactive",
    }),
  );

  assert.equal(
    missingConfirmation.code,
    ENERGY_TARGET_CODES.MISSING_DIRECTIONAL_SAFETY_CONFIRMATION,
  );
  assert.equal(
    reportedRisk.code,
    ENERGY_TARGET_CODES.DIRECTIONAL_SAFETY_NOT_ELIGIBLE,
  );
  assert.equal(
    underweightLose.code,
    ENERGY_TARGET_CODES.DIRECTIONAL_BMI_UNAVAILABLE,
  );
  assert.equal(
    severeUnderweightGain.code,
    ENERGY_TARGET_CODES.DIRECTIONAL_BMI_UNAVAILABLE,
  );
  assert.equal(
    belowFloor.code,
    ENERGY_TARGET_CODES.LOSE_TARGET_BELOW_SAFETY_FLOOR,
  );
  assert.equal(belowFloor.targetKcal, null);
});

test("accepts a Lose target exactly at the 1,200 kcal/day policy boundary", () => {
  const heightCm = 140;
  const ageYears = 70;
  const maintenanceNeeded = 1200 + 472.36;
  const weightKg =
    (maintenanceNeeded - (584.9 - 7.01 * ageYears + 5.72 * heightCm)) /
    11.71;
  const result = calculateEnergyTarget(
    createInput({
      ageYears,
      heightCm,
      weightKg,
      activityCategory: "inactive",
      goalType: ENERGY_GOAL_TYPES.LOSE,
    }),
  );

  assert.equal(result.status, ENERGY_TARGET_STATUSES.SUCCESS);
  assert.equal(result.targetKcal, 1200);
});

test("records stable methodology and omits the nonpersistent eligibility confirmation", () => {
  const result = calculateEnergyTarget(createInput());

  assert.equal(result.methodology.id, ENERGY_METHODOLOGY.id);
  assert.equal(result.methodology.version, ENERGY_METHODOLOGY.version);
  assert.equal(result.methodology.sourceDoi, "10.17226/26818");
  assert.equal(Object.hasOwn(result.normalizedInputs, "lifeStageEligibilityConfirmed"), false);
  assert.equal(
    Object.hasOwn(result.normalizedInputs, "directionalSafetyEligibilityConfirmed"),
    false,
  );
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
