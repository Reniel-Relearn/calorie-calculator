import { NUTRITION_DATASET_VERSION } from "../../data/foods.js";

export const FOOD_LOG_SNAPSHOT_VERSION = "1.0.0";

const NUTRIENT_COLUMNS = Object.freeze({
  caloriesKcal: "caloriesKcal",
  proteinG: "proteinG",
  carbohydratesG: "carbohydratesG",
  fatG: "fatG",
  fiberG: "fiberG",
  sugarG: "sugarG",
  sodiumMg: "sodiumMg",
});

function failure(code, message) {
  return { ok: false, code, message };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function isNonNegativeFiniteOrNull(value) {
  return value === null ||
    (typeof value === "number" && Number.isFinite(value) && value >= 0);
}

function copyJson(value) {
  return value === undefined ? null : JSON.parse(JSON.stringify(value));
}

function getLocalDate(instant, timezoneName) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    calendar: "gregory",
    day: "2-digit",
    month: "2-digit",
    numberingSystem: "latn",
    timeZone: timezoneName,
    year: "numeric",
  }).formatToParts(instant);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function getEnteredUnit(food, servingInput) {
  if (!servingInput.servingDescriptor) return servingInput.unit;
  return food.servingDescriptors?.[servingInput.servingDescriptor]?.unit ?? null;
}

function getConversionMetadata(food, servingInput, conversion) {
  if (conversion.conversionType === "descriptor") {
    return copyJson(food.servingDescriptors?.[servingInput.servingDescriptor]);
  }
  if (conversion.conversionType === "unit") {
    return copyJson(food.servingConversions?.[servingInput.unit]);
  }
  return null;
}

export function createFoodLogCommand({
  requestId,
  profile,
  result,
  consumedAt = new Date(),
}) {
  if (!isNonEmptyString(requestId)) {
    return failure("INVALID_REQUEST_ID", "A log request ID is required.");
  }

  if (!profile || !isNonEmptyString(profile.timezoneName)) {
    return failure("INVALID_PROFILE", "A completed profile timezone is required.");
  }

  if (!(consumedAt instanceof Date) || !Number.isFinite(consumedAt.getTime())) {
    return failure("INVALID_CONSUMED_AT", "A valid consumed time is required.");
  }

  const { food, servingInput, conversion, nutritionCalculation } = result ?? {};
  const nutrition = nutritionCalculation?.nutrition;
  if (
    !food ||
    !servingInput ||
    conversion?.ok !== true ||
    nutritionCalculation?.ok !== true ||
    !nutrition
  ) {
    return failure("INVALID_RESULT", "A complete successful calculation is required.");
  }

  const enteredUnit = getEnteredUnit(food, servingInput);
  const supportedEnteredUnits = ["grams", "cups", "milliliters", "pieces"];
  if (
    typeof servingInput.quantity !== "number" ||
    !Number.isFinite(servingInput.quantity) ||
    servingInput.quantity <= 0 ||
    !supportedEnteredUnits.includes(enteredUnit) ||
    !["g", "ml"].includes(conversion.normalizedUnit) ||
    typeof conversion.normalizedAmount !== "number" ||
    !Number.isFinite(conversion.normalizedAmount) ||
    conversion.normalizedAmount <= 0
  ) {
    return failure("INVALID_SERVING", "The calculated serving cannot be logged safely.");
  }

  for (const nutrient of Object.keys(NUTRIENT_COLUMNS)) {
    if (!isNonNegativeFiniteOrNull(nutrition[nutrient])) {
      return failure("INVALID_NUTRITION", "The calculated nutrition cannot be logged safely.");
    }
  }
  if (nutrition.caloriesKcal === null) {
    return failure("INVALID_NUTRITION", "Calories are required for a food log.");
  }

  let localDate;
  try {
    localDate = getLocalDate(consumedAt, profile.timezoneName);
  } catch {
    return failure("INVALID_TIMEZONE", "The profile timezone is not supported.");
  }

  const source = {
    sourceType: food.sourceType,
    sourceName: food.sourceName,
    sourceReference: food.sourceReference,
    sourceFoodId: food.sourceFoodId,
    sourceDescription: food.sourceDescription,
    sourceUrl: food.sourceUrl ?? null,
  };
  const calculationSnapshot = {
    schemaVersion: FOOD_LOG_SNAPSHOT_VERSION,
    dataset: {
      name: "CalorieCheck Version 1 demo nutrition dataset",
      version: NUTRITION_DATASET_VERSION,
    },
    food: {
      id: food.id,
      name: food.name,
      preparation: food.preparation,
      foodType: food.foodType,
      measurementBasis: food.measurementBasis,
      source,
    },
    reference: {
      amount: food.referenceAmount,
      unit: food.referenceUnit,
      nutrition: copyJson(food.nutritionPerReference),
    },
    serving: {
      enteredQuantity: servingInput.quantity,
      enteredUnit,
      enteredDescriptor: servingInput.servingDescriptor ?? null,
      normalizedAmount: conversion.normalizedAmount,
      normalizedUnit: conversion.normalizedUnit,
      conversionType: conversion.conversionType,
      conversionMetadata: getConversionMetadata(food, servingInput, conversion),
    },
    calculation: {
      scaleFactor: nutritionCalculation.scaleFactor,
      nutrition: copyJson(nutrition),
    },
  };

  return {
    ok: true,
    command: {
      requestId,
      consumedAt: consumedAt.toISOString(),
      timezoneAtEntry: profile.timezoneName,
      localDate,
      foodId: food.id,
      foodNameSnapshot: food.name,
      enteredQuantity: servingInput.quantity,
      enteredUnit,
      enteredDescriptor: servingInput.servingDescriptor ?? null,
      normalizedAmount: conversion.normalizedAmount,
      normalizedUnit: conversion.normalizedUnit,
      caloriesKcal: nutrition.caloriesKcal,
      proteinG: nutrition.proteinG,
      carbohydratesG: nutrition.carbohydratesG,
      fatG: nutrition.fatG,
      fiberG: nutrition.fiberG,
      sugarG: nutrition.sugarG,
      sodiumMg: nutrition.sodiumMg,
      nutritionDatasetVersion: NUTRITION_DATASET_VERSION,
      sourceReference: food.sourceReference,
      calculationSnapshot,
    },
  };
}
