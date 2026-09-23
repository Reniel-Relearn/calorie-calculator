import { NUTRIENT_FIELDS } from "../data/foods.js";
import { MAX_NORMALIZED_GRAMS } from "./serving-converter.js";

export const CALCULATION_ERROR_CODES = Object.freeze({
  INVALID_FOOD: "INVALID_FOOD",
  INVALID_NORMALIZED_GRAMS: "INVALID_NORMALIZED_GRAMS",
  NORMALIZED_AMOUNT_TOO_LARGE: "NORMALIZED_AMOUNT_TOO_LARGE",
  INVALID_REFERENCE_WEIGHT: "INVALID_REFERENCE_WEIGHT",
  INVALID_NUTRITION_DATA: "INVALID_NUTRITION_DATA",
});

function createFailure(code, message) {
  return { ok: false, code, message };
}

function toSafePrecision(value) {
  return Number(value.toPrecision(12));
}

export function calculateNutrition(food, grams) {
  if (!food || typeof food !== "object") {
    return createFailure(
      CALCULATION_ERROR_CODES.INVALID_FOOD,
      "A matched food is required for nutrition calculation.",
    );
  }

  if (typeof grams !== "number" || !Number.isFinite(grams) || grams <= 0) {
    return createFailure(
      CALCULATION_ERROR_CODES.INVALID_NORMALIZED_GRAMS,
      "Normalized grams must be a finite number greater than zero.",
    );
  }

  if (grams > MAX_NORMALIZED_GRAMS) {
    return createFailure(
      CALCULATION_ERROR_CODES.NORMALIZED_AMOUNT_TOO_LARGE,
      "Normalized grams must not exceed 5,000.",
    );
  }

  const referenceWeightGrams = food.referenceWeightGrams;
  if (
    typeof referenceWeightGrams !== "number" ||
    !Number.isFinite(referenceWeightGrams) ||
    referenceWeightGrams <= 0
  ) {
    return createFailure(
      CALCULATION_ERROR_CODES.INVALID_REFERENCE_WEIGHT,
      "The food reference weight is invalid.",
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

  const scaleFactor = grams / referenceWeightGrams;
  if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) {
    return createFailure(
      CALCULATION_ERROR_CODES.INVALID_REFERENCE_WEIGHT,
      "The food reference weight does not produce a valid scale factor.",
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
        CALCULATION_ERROR_CODES.INVALID_NUTRITION_DATA,
        `The ${nutrient} value could not be scaled safely.`,
      );
    }

    nutrition[nutrient] = toSafePrecision(scaledValue);
  }

  return {
    ok: true,
    grams: toSafePrecision(grams),
    referenceWeightGrams,
    scaleFactor: toSafePrecision(scaleFactor),
    nutrition,
  };
}
