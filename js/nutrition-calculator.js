import { NUTRIENT_FIELDS } from "../data/foods.js";

export const CALCULATION_ERROR_CODES = Object.freeze({
  INVALID_FOOD: "INVALID_FOOD",
  INVALID_NORMALIZED_AMOUNT: "INVALID_NORMALIZED_AMOUNT",
  INVALID_REFERENCE_METADATA: "INVALID_REFERENCE_METADATA",
  REFERENCE_UNIT_MISMATCH: "REFERENCE_UNIT_MISMATCH",
  MEASUREMENT_BASIS_MISMATCH: "MEASUREMENT_BASIS_MISMATCH",
  INVALID_NUTRITION_DATA: "INVALID_NUTRITION_DATA",
  NON_FINITE_RESULT: "NON_FINITE_RESULT",
});

const REFERENCE_UNITS = Object.freeze({
  mass: "g",
  volume: "ml",
});

function createFailure(code, message) {
  return { ok: false, code, message };
}

function toSafePrecision(value) {
  return Number(value.toPrecision(12));
}

function resolveNormalizedServing(food, normalizedServing) {
  if (typeof normalizedServing === "number") {
    if (food.measurementBasis !== "mass") return null;

    return {
      normalizedAmount: normalizedServing,
      normalizedUnit: "g",
      measurementBasis: "mass",
    };
  }

  if (!normalizedServing || typeof normalizedServing !== "object") return null;

  return {
    normalizedAmount: normalizedServing.normalizedAmount,
    normalizedUnit: normalizedServing.normalizedUnit,
    measurementBasis: normalizedServing.measurementBasis,
  };
}

export function calculateNutrition(food, normalizedServing) {
  if (!food || typeof food !== "object") {
    return createFailure(
      CALCULATION_ERROR_CODES.INVALID_FOOD,
      "A matched food is required for nutrition calculation.",
    );
  }

  const serving = resolveNormalizedServing(food, normalizedServing);
  if (
    !serving ||
    typeof serving.normalizedAmount !== "number" ||
    !Number.isFinite(serving.normalizedAmount) ||
    serving.normalizedAmount <= 0
  ) {
    return createFailure(
      CALCULATION_ERROR_CODES.INVALID_NORMALIZED_AMOUNT,
      "Normalized amount must be a finite number greater than zero.",
    );
  }

  const expectedReferenceUnit = REFERENCE_UNITS[food.measurementBasis];
  if (!expectedReferenceUnit) {
    return createFailure(
      CALCULATION_ERROR_CODES.INVALID_REFERENCE_METADATA,
      "The food measurement basis is invalid.",
    );
  }

  if (serving.measurementBasis !== food.measurementBasis) {
    return createFailure(
      CALCULATION_ERROR_CODES.MEASUREMENT_BASIS_MISMATCH,
      "The normalized serving measurement basis does not match the food.",
    );
  }

  if (serving.normalizedUnit !== expectedReferenceUnit) {
    return createFailure(
      CALCULATION_ERROR_CODES.MEASUREMENT_BASIS_MISMATCH,
      "The normalized serving unit does not match its measurement basis.",
    );
  }

  const referenceAmount = food.referenceAmount;
  if (
    typeof referenceAmount !== "number" ||
    !Number.isFinite(referenceAmount) ||
    referenceAmount <= 0
  ) {
    return createFailure(
      CALCULATION_ERROR_CODES.INVALID_REFERENCE_METADATA,
      "The food reference amount is invalid.",
    );
  }

  if (food.referenceUnit !== expectedReferenceUnit) {
    return createFailure(
      CALCULATION_ERROR_CODES.REFERENCE_UNIT_MISMATCH,
      "The food reference unit does not match its measurement basis.",
    );
  }

  if (
    !food.nutritionPerReference ||
    typeof food.nutritionPerReference !== "object"
  ) {
    return createFailure(
      CALCULATION_ERROR_CODES.INVALID_NUTRITION_DATA,
      "The food nutrition reference is invalid.",
    );
  }

  const scaleFactor = serving.normalizedAmount / referenceAmount;
  if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) {
    return createFailure(
      CALCULATION_ERROR_CODES.NON_FINITE_RESULT,
      "The normalized serving does not produce a finite scale factor.",
    );
  }

  const nutrition = {};

  for (const nutrient of NUTRIENT_FIELDS) {
    const referenceValue = food.nutritionPerReference[nutrient];

    if (referenceValue === null || referenceValue === undefined) {
      nutrition[nutrient] = null;
      continue;
    }

    if (
      typeof referenceValue !== "number" ||
      !Number.isFinite(referenceValue) ||
      referenceValue < 0
    ) {
      return createFailure(
        CALCULATION_ERROR_CODES.INVALID_NUTRITION_DATA,
        `The ${nutrient} reference value is invalid.`,
      );
    }

    const scaledValue = referenceValue * scaleFactor;
    if (!Number.isFinite(scaledValue)) {
      return createFailure(
        CALCULATION_ERROR_CODES.NON_FINITE_RESULT,
        `The ${nutrient} value could not be scaled to a finite result.`,
      );
    }

    nutrition[nutrient] = toSafePrecision(scaledValue);
  }

  const normalizedAmount = toSafePrecision(serving.normalizedAmount);
  const result = {
    ok: true,
    normalizedAmount,
    normalizedUnit: serving.normalizedUnit,
    measurementBasis: serving.measurementBasis,
    referenceAmount,
    referenceUnit: food.referenceUnit,
    scaleFactor: toSafePrecision(scaleFactor),
    nutrition,
  };

  if (serving.measurementBasis === "mass") {
    result.grams = normalizedAmount;
    result.referenceWeightGrams = referenceAmount;
  }

  if (serving.measurementBasis === "volume") {
    result.milliliters = normalizedAmount;
  }

  return result;
}
