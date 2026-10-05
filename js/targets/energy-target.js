import {
  ENERGY_ACTIVITY_CATEGORIES,
  ENERGY_EQUATION_SEXES,
  evaluateEnergyEquation,
  getEnergyEquation,
  resolveEnergyEquationBranch,
} from "./eer-equations.js";

export const ENERGY_GOAL_TYPES = Object.freeze({
  MAINTAIN: "maintain",
  LOSE: "lose",
  GAIN: "gain",
});

export const ENERGY_TARGET_STATUSES = Object.freeze({
  SUCCESS: "success",
  INVALID: "invalid",
  INELIGIBLE: "ineligible",
  UNAVAILABLE: "unavailable",
});

export const ENERGY_TARGET_CODES = Object.freeze({
  INVALID_INPUT: "INVALID_INPUT",
  INVALID_AGE: "INVALID_AGE",
  INVALID_HEIGHT: "INVALID_HEIGHT",
  INVALID_WEIGHT: "INVALID_WEIGHT",
  MISSING_LIFE_STAGE_CONFIRMATION: "MISSING_LIFE_STAGE_CONFIRMATION",
  UNDERAGE: "UNDERAGE",
  LIFE_STAGE_NOT_ELIGIBLE: "LIFE_STAGE_NOT_ELIGIBLE",
  UNSUPPORTED_EQUATION_SEX: "UNSUPPORTED_EQUATION_SEX",
  UNSUPPORTED_ACTIVITY_CATEGORY: "UNSUPPORTED_ACTIVITY_CATEGORY",
  UNSUPPORTED_GOAL: "UNSUPPORTED_GOAL",
  NON_FINITE_RESULT: "NON_FINITE_RESULT",
  GOAL_METHOD_UNAVAILABLE: "GOAL_METHOD_UNAVAILABLE",
});

export const ENERGY_METHODOLOGY = Object.freeze({
  id: "nasem-dri-energy-2023-eer",
  version: "1.0.0",
  name: "National Academies 2023 Estimated Energy Requirement",
  sourceOrganization:
    "National Academies of Sciences, Engineering, and Medicine",
  sourceTitle: "Dietary Reference Intakes for Energy",
  sourceYear: 2023,
  sourceDoi: "10.17226/26818",
});

const SUPPORTED_GOALS = Object.freeze(Object.values(ENERGY_GOAL_TYPES));

function toSafePrecision(value) {
  return Number(value.toPrecision(12));
}

function createOutcome(status, code, message, details = {}) {
  return {
    ok: status === ENERGY_TARGET_STATUSES.SUCCESS,
    status,
    code,
    message,
    eligible:
      status === ENERGY_TARGET_STATUSES.INELIGIBLE
        ? false
        : status === ENERGY_TARGET_STATUSES.INVALID
          ? null
          : true,
    available: status === ENERGY_TARGET_STATUSES.SUCCESS,
    maintenanceKcal: null,
    targetKcal: null,
    ...details,
  };
}

function validatePositiveFinite(value, code, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return createOutcome(
      ENERGY_TARGET_STATUSES.INVALID,
      code,
      `${label} must be a finite number greater than zero.`,
    );
  }

  return null;
}

function createNormalizedInputs(input) {
  return {
    ageYears: input.ageYears,
    sexForEnergyEquation: input.sexForEnergyEquation,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    activityCategory: input.activityCategory,
    goalType: input.goalType,
  };
}

function createMaintenanceDetails(input, equation, maintenanceKcal) {
  const adolescent = equation.growthKcal > 0;

  return {
    maintenanceKcal,
    selectedGoal: input.goalType,
    activityCategory: input.activityCategory,
    equationBranch: equation.branch,
    equationId: equation.id,
    normalizedInputs: createNormalizedInputs(input),
    methodology: {
      ...ENERGY_METHODOLOGY,
      sourceTable: equation.table,
    },
    assumptions: [
      "Age is expressed in years, height in centimeters, and weight in kilograms.",
      adolescent
        ? "The adolescent equation includes the source's 20 kcal/day energy cost of growth."
        : "The adult maintenance equation assumes current body weight is stable.",
      "The selected physical activity category is an approximation of usual activity.",
    ],
    uncertainty: {
      predictionRmseKcal: equation.predictionRmseKcal,
      message:
        "Individual energy needs can be materially higher or lower than this population-based estimate.",
    },
    warnings: [
      {
        code: "PAL_SELECTION_UNCERTAINTY",
        message:
          "Selecting a physical activity category is approximate and can change the estimate.",
      },
      {
        code: "MONITOR_WEIGHT_TREND",
        message:
          "The source recommends monitoring weight over time and adjusting intake when maintenance differs from the estimate.",
      },
    ],
  };
}

export function calculateEnergyTarget(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return createOutcome(
      ENERGY_TARGET_STATUSES.INVALID,
      ENERGY_TARGET_CODES.INVALID_INPUT,
      "Energy target inputs are required.",
    );
  }

  const ageFailure = validatePositiveFinite(
    input.ageYears,
    ENERGY_TARGET_CODES.INVALID_AGE,
    "Age",
  );
  if (ageFailure) return ageFailure;

  const heightFailure = validatePositiveFinite(
    input.heightCm,
    ENERGY_TARGET_CODES.INVALID_HEIGHT,
    "Height",
  );
  if (heightFailure) return heightFailure;

  const weightFailure = validatePositiveFinite(
    input.weightKg,
    ENERGY_TARGET_CODES.INVALID_WEIGHT,
    "Weight",
  );
  if (weightFailure) return weightFailure;

  if (typeof input.lifeStageEligibilityConfirmed !== "boolean") {
    return createOutcome(
      ENERGY_TARGET_STATUSES.INVALID,
      ENERGY_TARGET_CODES.MISSING_LIFE_STAGE_CONFIRMATION,
      "Life-stage eligibility must be confirmed before calculating a target.",
    );
  }

  if (input.ageYears < 18) {
    return createOutcome(
      ENERGY_TARGET_STATUSES.INELIGIBLE,
      ENERGY_TARGET_CODES.UNDERAGE,
      "Version 2 energy targets are available only from age 18.",
    );
  }

  if (!input.lifeStageEligibilityConfirmed) {
    return createOutcome(
      ENERGY_TARGET_STATUSES.INELIGIBLE,
      ENERGY_TARGET_CODES.LIFE_STAGE_NOT_ELIGIBLE,
      "Version 2 does not calculate targets for pregnancy or breastfeeding.",
    );
  }

  if (!ENERGY_EQUATION_SEXES.includes(input.sexForEnergyEquation)) {
    return createOutcome(
      ENERGY_TARGET_STATUSES.UNAVAILABLE,
      ENERGY_TARGET_CODES.UNSUPPORTED_EQUATION_SEX,
      "The source equations do not provide a coefficient for this sex category.",
    );
  }

  if (!ENERGY_ACTIVITY_CATEGORIES.includes(input.activityCategory)) {
    return createOutcome(
      ENERGY_TARGET_STATUSES.UNAVAILABLE,
      ENERGY_TARGET_CODES.UNSUPPORTED_ACTIVITY_CATEGORY,
      "The source equations do not provide this physical activity category.",
    );
  }

  if (!SUPPORTED_GOALS.includes(input.goalType)) {
    return createOutcome(
      ENERGY_TARGET_STATUSES.UNAVAILABLE,
      ENERGY_TARGET_CODES.UNSUPPORTED_GOAL,
      "This goal does not have an approved Version 2 method.",
    );
  }

  const equationBranch = resolveEnergyEquationBranch(input.ageYears);
  const equation = getEnergyEquation(
    equationBranch,
    input.sexForEnergyEquation,
    input.activityCategory,
  );

  if (!equation) {
    return createOutcome(
      ENERGY_TARGET_STATUSES.UNAVAILABLE,
      ENERGY_TARGET_CODES.UNSUPPORTED_ACTIVITY_CATEGORY,
      "No approved maintenance equation is available for these inputs.",
    );
  }

  const rawMaintenanceKcal = evaluateEnergyEquation(equation, input);
  if (!Number.isFinite(rawMaintenanceKcal) || rawMaintenanceKcal <= 0) {
    return createOutcome(
      ENERGY_TARGET_STATUSES.INVALID,
      ENERGY_TARGET_CODES.NON_FINITE_RESULT,
      "The supplied inputs did not produce a usable maintenance estimate.",
    );
  }

  const maintenanceKcal = toSafePrecision(rawMaintenanceKcal);
  const details = createMaintenanceDetails(input, equation, maintenanceKcal);

  if (input.goalType !== ENERGY_GOAL_TYPES.MAINTAIN) {
    return createOutcome(
      ENERGY_TARGET_STATUSES.UNAVAILABLE,
      ENERGY_TARGET_CODES.GOAL_METHOD_UNAVAILABLE,
      `No approved Version 2 ${input.goalType} target method is available.`,
      details,
    );
  }

  return createOutcome(
    ENERGY_TARGET_STATUSES.SUCCESS,
    null,
    "Estimated maintenance calories calculated.",
    {
      ...details,
      targetKcal: maintenanceKcal,
    },
  );
}
