/**
 * Version 1 local demo nutrition data.
 *
 * Nutrients are reported for each food's reference amount and unit. Legacy
 * referenceWeightGrams remains on the original solid records as transitional
 * compatibility metadata; referenceAmount and referenceUnit are authoritative.
 * A numeric zero means the source reports zero; a missing source value must be
 * represented as null.
 */

export const NUTRIENT_FIELDS = Object.freeze([
  "caloriesKcal",
  "proteinG",
  "carbohydratesG",
  "fatG",
  "fiberG",
  "sugarG",
  "sodiumMg",
]);

export const foods = Object.freeze([
  {
    id: "grilled-chicken-breast",
    name: "Grilled Chicken Breast",
    aliases: [
      "grilled chicken breast",
      "chicken breast grilled",
      "grilled breast",
      "chicken breast",
    ],
    preparation: "grilled",
    foodType: "solid",
    measurementBasis: "mass",
    referenceAmount: 100,
    referenceUnit: "g",
    referenceWeightGrams: 100,
    nutritionPerReference: {
      caloriesKcal: 151,
      proteinG: 30.54,
      carbohydratesG: 0,
      fatG: 3.17,
      fiberG: 0,
      sugarG: 0,
      sodiumMg: 52,
    },
    supportedUnits: ["grams", "pieces"],
    servingConversions: {
      pieces: {
        gramsPerUnit: 196,
        description: "1 cooked breast piece",
        sourceReference: "USDA FoodData Central FDC ID 171534 portion data",
      },
    },
    servingDescriptors: {},
    sourceType: "demo",
    sourceName: "USDA FoodData Central",
    sourceReference: "USDA FoodData Central FDC ID 171534; per 100 g",
    sourceFoodId: "171534",
    sourceDescription:
      "Chicken, broiler or fryers, breast, skinless, boneless, meat only, cooked, grilled",
    sourceUrl:
      "https://fdc.nal.usda.gov/fdc-app.html#/food-details/171534/nutrients",
  },
  {
    id: "fried-chicken",
    name: "Fried Chicken",
    aliases: ["fried chicken", "battered fried chicken", "battered chicken"],
    preparation: "fried",
    foodType: "solid",
    measurementBasis: "mass",
    referenceAmount: 100,
    referenceUnit: "g",
    referenceWeightGrams: 100,
    nutritionPerReference: {
      caloriesKcal: 289,
      proteinG: 22.54,
      carbohydratesG: 9.42,
      fatG: 17.35,
      fiberG: 0.3,
      sugarG: 0,
      sodiumMg: 292,
    },
    supportedUnits: ["grams"],
    servingConversions: {},
    servingDescriptors: {},
    sourceType: "demo",
    sourceName: "USDA FoodData Central",
    sourceReference: "USDA FoodData Central FDC ID 171448; per 100 g",
    sourceFoodId: "171448",
    sourceDescription:
      "Chicken, broilers or fryers, meat and skin, cooked, fried, batter",
    sourceUrl:
      "https://fdc.nal.usda.gov/fdc-app.html#/food-details/171448/nutrients",
  },
  {
    id: "roasted-chicken-thigh",
    name: "Roasted Chicken Thigh",
    aliases: [
      "roasted chicken thigh",
      "chicken thigh roasted",
      "roast chicken thigh",
    ],
    preparation: "roasted",
    foodType: "solid",
    measurementBasis: "mass",
    referenceAmount: 100,
    referenceUnit: "g",
    referenceWeightGrams: 100,
    nutritionPerReference: {
      caloriesKcal: 232,
      proteinG: 23.26,
      carbohydratesG: 0,
      fatG: 14.71,
      fiberG: 0,
      sugarG: 0,
      sodiumMg: 102,
    },
    supportedUnits: ["grams", "pieces"],
    servingConversions: {
      pieces: {
        gramsPerUnit: 137,
        description: "1 roasted thigh with skin",
        sourceReference: "USDA FoodData Central FDC ID 173625 portion data",
      },
    },
    servingDescriptors: {},
    sourceType: "demo",
    sourceName: "USDA FoodData Central",
    sourceReference: "USDA FoodData Central FDC ID 173625; per 100 g",
    sourceFoodId: "173625",
    sourceDescription:
      "Chicken, broilers or fryers, thigh, meat and skin, cooked, roasted",
    sourceUrl:
      "https://fdc.nal.usda.gov/fdc-app.html#/food-details/173625/nutrients",
  },
  {
    id: "fried-egg",
    name: "Fried Egg",
    aliases: ["fried egg", "fried eggs", "pan-fried egg"],
    preparation: "fried",
    foodType: "solid",
    measurementBasis: "mass",
    referenceAmount: 100,
    referenceUnit: "g",
    referenceWeightGrams: 100,
    nutritionPerReference: {
      caloriesKcal: 196,
      proteinG: 13.61,
      carbohydratesG: 0.83,
      fatG: 14.84,
      fiberG: 0,
      sugarG: 0.4,
      sodiumMg: 207,
    },
    supportedUnits: ["grams", "pieces"],
    servingConversions: {},
    servingDescriptors: {
      large: {
        unit: "pieces",
        quantity: 1,
        grams: 46,
        sourceReference: "USDA FoodData Central FDC ID 173423 portion data",
      },
    },
    sourceType: "demo",
    sourceName: "USDA FoodData Central",
    sourceReference: "USDA FoodData Central FDC ID 173423; per 100 g",
    sourceFoodId: "173423",
    sourceDescription: "Egg, whole, cooked, fried",
    sourceUrl:
      "https://fdc.nal.usda.gov/fdc-app.html#/food-details/173423/nutrients",
  },
  {
    id: "boiled-egg",
    name: "Boiled Egg",
    aliases: [
      "boiled egg",
      "hard boiled egg",
      "hard-boiled egg",
      "boiled chicken egg",
      "nilagang itlog",
    ],
    preparation: "boiled",
    foodType: "solid",
    measurementBasis: "mass",
    referenceAmount: 100,
    referenceUnit: "g",
    referenceWeightGrams: 100,
    nutritionPerReference: {
      caloriesKcal: 166,
      proteinG: 14,
      carbohydratesG: 0.6,
      fatG: 12,
      fiberG: 0,
      sugarG: 0.4,
      sodiumMg: 136,
    },
    supportedUnits: ["grams"],
    servingConversions: {},
    servingDescriptors: {},
    sourceType: "demo",
    sourceName: "DOST-FNRI Philippine Food Composition Table",
    sourceReference: "PhilFCT Food ID H004; per 100 g edible portion",
    sourceFoodId: "H004",
    sourceDescription: "Egg, chicken, whole, boiled",
    sourceUrl: "https://i.fnri.dost.gov.ph/fct/library/report/4216",
  },
  {
    id: "cooked-white-rice",
    name: "Cooked White Rice",
    aliases: [
      "cooked white rice",
      "white rice",
      "boiled white rice",
      "sinaing",
      "bigas na maputi",
    ],
    preparation: "cooked",
    foodType: "solid",
    measurementBasis: "mass",
    referenceAmount: 100,
    referenceUnit: "g",
    referenceWeightGrams: 100,
    nutritionPerReference: {
      caloriesKcal: 129,
      proteinG: 2.1,
      carbohydratesG: 29.7,
      fatG: 0.2,
      fiberG: 0.4,
      sugarG: 0.1,
      sodiumMg: 3,
    },
    supportedUnits: ["grams", "cups"],
    servingConversions: {
      cups: {
        gramsPerUnit: 158,
        description: "1 cup cooked white rice",
        sourceReference:
          "USDA FoodData Central FNDDS 2021-2023, FDC ID 2708408, food code 56205008; 1 cup cooked = 158 g",
      },
    },
    servingDescriptors: {},
    sourceType: "demo",
    sourceName: "DOST-FNRI Philippine Food Composition Table",
    sourceReference: "PhilFCT Food ID A020; per 100 g edible portion",
    sourceFoodId: "A020",
    sourceDescription: "Rice, well-milled, boiled",
    sourceUrl: "https://i.fnri.dost.gov.ph/fct/library/report/2982",
    measurementSource: "USDA FoodData Central FNDDS 2021-2023",
    measurementReference:
      "FDC ID 2708408, food code 56205008, Rice, white, cooked, no added fat; portion description '1 cup, cooked' = 158 g",
    measurementUrls: [
      "https://fdc.nal.usda.gov/fdc-app.html#/food-details/2708408/nutrients",
    ],
  },
  {
    id: "banana",
    name: "Banana",
    aliases: ["banana", "regular banana"],
    preparation: "raw",
    foodType: "solid",
    measurementBasis: "mass",
    referenceAmount: 100,
    referenceUnit: "g",
    referenceWeightGrams: 100,
    nutritionPerReference: {
      caloriesKcal: 89,
      proteinG: 1.09,
      carbohydratesG: 22.84,
      fatG: 0.33,
      fiberG: 2.6,
      sugarG: 12.23,
      sodiumMg: 1,
    },
    supportedUnits: ["grams", "pieces"],
    servingConversions: {},
    servingDescriptors: {
      small: {
        unit: "pieces",
        quantity: 1,
        grams: 101,
        sourceReference: "USDA FoodData Central FDC ID 173944 portion data",
      },
      medium: {
        unit: "pieces",
        quantity: 1,
        grams: 118,
        sourceReference: "USDA FoodData Central FDC ID 173944 portion data",
      },
      large: {
        unit: "pieces",
        quantity: 1,
        grams: 136,
        sourceReference: "USDA FoodData Central FDC ID 173944 portion data",
      },
    },
    sourceType: "demo",
    sourceName: "USDA FoodData Central",
    sourceReference: "USDA FoodData Central FDC ID 173944; per 100 g",
    sourceFoodId: "173944",
    sourceDescription: "Bananas, raw",
    sourceUrl:
      "https://fdc.nal.usda.gov/fdc-app.html#/food-details/173944/nutrients",
  },
  {
    id: "saba-banana",
    name: "Saba Banana",
    aliases: ["saba", "saba banana", "saging saba", "saging na saba"],
    preparation: "raw",
    foodType: "solid",
    measurementBasis: "mass",
    referenceAmount: 100,
    referenceUnit: "g",
    referenceWeightGrams: 100,
    nutritionPerReference: {
      caloriesKcal: 110,
      proteinG: 1.1,
      carbohydratesG: 25.5,
      fatG: 0.4,
      fiberG: 2.9,
      sugarG: 13.6,
      sodiumMg: 2,
    },
    supportedUnits: ["grams"],
    servingConversions: {},
    servingDescriptors: {},
    sourceType: "demo",
    sourceName: "DOST-FNRI Philippine Food Composition Table",
    sourceReference: "PhilFCT Food ID E014; per 100 g edible portion",
    sourceFoodId: "E014",
    sourceDescription: "Banana, saba",
    sourceUrl: "https://i.fnri.dost.gov.ph/fct/library/report/3596",
  },
  {
    id: "cheeseburger",
    name: "Cheeseburger",
    aliases: ["cheeseburger", "cheeseburger sandwich", "burger with cheese"],
    preparation: "prepared",
    foodType: "solid",
    measurementBasis: "mass",
    referenceAmount: 100,
    referenceUnit: "g",
    referenceWeightGrams: 100,
    nutritionPerReference: {
      caloriesKcal: 250,
      proteinG: 11.2,
      carbohydratesG: 30,
      fatG: 9.5,
      fiberG: 1.7,
      sugarG: 4.2,
      sodiumMg: 441,
    },
    supportedUnits: ["grams"],
    servingConversions: {},
    servingDescriptors: {},
    sourceType: "demo",
    sourceName: "DOST-FNRI Philippine Food Composition Table",
    sourceReference: "PhilFCT Food ID R003; per 100 g edible portion",
    sourceFoodId: "R003",
    sourceDescription: "Cheeseburger sandwich",
    sourceUrl: "https://i.fnri.dost.gov.ph/fct/library/report/4423",
  },
  {
    id: "whole-milk",
    name: "Whole Milk",
    aliases: ["whole milk", "full cream milk", "full-fat milk"],
    preparation: "fluid",
    foodType: "liquid",
    measurementBasis: "volume",
    referenceAmount: 100,
    referenceUnit: "ml",
    nutritionPerReference: {
      caloriesKcal: 62.02,
      proteinG: 3.2,
      carbohydratesG: 4.86,
      fatG: 3.32,
      fiberG: 0,
      sugarG: 5.13,
      sodiumMg: 43.72,
    },
    supportedUnits: ["milliliters"],
    servingConversions: {},
    servingDescriptors: {},
    sourceType: "demo",
    sourceName: "USDA FoodData Central",
    sourceReference:
      "USDA FoodData Central SR Legacy FDC ID 172217; nutrient values per 100 g, normalized to a 100 mL reference using authoritative cup mass and volume data",
    sourceFoodId: "172217",
    sourceDescription:
      "Milk, whole, 3.25% milkfat, without added vitamin A and vitamin D",
    sourceUrl:
      "https://fdc.nal.usda.gov/fdc-app.html#/food-details/172217/nutrients",
    measurementSource:
      "USDA FoodData Central SR Legacy portion data and U.S. FDA metric household-measure guidance",
    measurementReference:
      "FDC ID 172217: 1 cup = 244 g; FDA household-measure guidance: 1 cup = 240 mL",
    measurementUrls: [
      "https://fdc.nal.usda.gov/fdc-app.html#/food-details/172217/nutrients",
      "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-guidelines-determining-metric-equivalents-household-measures",
    ],
    derivation: {
      originalReferenceAmount: 100,
      originalReferenceUnit: "g",
      originalNutritionPerReference: {
        caloriesKcal: 61,
        proteinG: 3.15,
        carbohydratesG: 4.78,
        fatG: 3.27,
        fiberG: 0,
        sugarG: 5.05,
        sodiumMg: 43,
      },
      servingWeightGrams: 244,
      servingVolumeMilliliters: 240,
      formula:
        "valuePer100Ml = valuePer100G * servingWeightGrams / servingVolumeMilliliters",
      resultingReferenceAmount: 100,
      resultingReferenceUnit: "ml",
    },
    quality: "derived-from-authoritative-mass-and-volume-portion-data",
  },
  {
    id: "orange-juice",
    name: "Orange Juice",
    aliases: ["orange juice", "oj"],
    preparation: "raw",
    foodType: "liquid",
    measurementBasis: "volume",
    referenceAmount: 100,
    referenceUnit: "ml",
    nutritionPerReference: {
      caloriesKcal: 46.5,
      proteinG: 0.72,
      carbohydratesG: 10.75,
      fatG: 0.21,
      fiberG: 0.21,
      sugarG: 8.68,
      sodiumMg: 1.03,
    },
    supportedUnits: ["milliliters"],
    servingConversions: {},
    servingDescriptors: {},
    sourceType: "demo",
    sourceName: "USDA FoodData Central",
    sourceReference:
      "USDA FoodData Central SR Legacy FDC ID 169098; nutrient values per 100 g, normalized to a 100 mL reference using authoritative cup mass and volume data",
    sourceFoodId: "169098",
    sourceDescription:
      "Orange juice, raw (Includes foods for USDA's Food Distribution Program)",
    sourceUrl:
      "https://fdc.nal.usda.gov/fdc-app.html#/food-details/169098/nutrients",
    measurementSource:
      "USDA FoodData Central SR Legacy portion data and U.S. FDA metric household-measure guidance",
    measurementReference:
      "FDC ID 169098: 1 cup = 248 g; FDA household-measure guidance: 1 cup = 240 mL",
    measurementUrls: [
      "https://fdc.nal.usda.gov/fdc-app.html#/food-details/169098/nutrients",
      "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-guidelines-determining-metric-equivalents-household-measures",
    ],
    derivation: {
      originalReferenceAmount: 100,
      originalReferenceUnit: "g",
      originalNutritionPerReference: {
        caloriesKcal: 45,
        proteinG: 0.7,
        carbohydratesG: 10.4,
        fatG: 0.2,
        fiberG: 0.2,
        sugarG: 8.4,
        sodiumMg: 1,
      },
      servingWeightGrams: 248,
      servingVolumeMilliliters: 240,
      formula:
        "valuePer100Ml = valuePer100G * servingWeightGrams / servingVolumeMilliliters",
      resultingReferenceAmount: 100,
      resultingReferenceUnit: "ml",
    },
    quality: "derived-from-authoritative-mass-and-volume-portion-data",
  },
]);

function isPositiveFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateFoodDataset(catalog = foods) {
  const errors = [];

  if (!Array.isArray(catalog)) {
    return { ok: false, errors: ["Food catalog must be an array."] };
  }

  const ids = new Set();

  for (const [index, food] of catalog.entries()) {
    const label = isNonEmptyString(food?.id) ? food.id : `record ${index}`;

    if (!food || typeof food !== "object") {
      errors.push(`${label}: food record must be an object.`);
      continue;
    }

    if (!isNonEmptyString(food.id)) {
      errors.push(`${label}: id is required.`);
    } else if (ids.has(food.id)) {
      errors.push(`${label}: id must be unique.`);
    } else {
      ids.add(food.id);
    }

    if (!isNonEmptyString(food.name)) {
      errors.push(`${label}: name is required.`);
    }

    if (!Array.isArray(food.aliases) || food.aliases.length === 0) {
      errors.push(`${label}: at least one alias is required.`);
    } else if (!food.aliases.every(isNonEmptyString)) {
      errors.push(`${label}: aliases must be non-empty strings.`);
    }

    if (!isPositiveFiniteNumber(food.referenceAmount)) {
      errors.push(`${label}: referenceAmount must be greater than zero.`);
    }

    const isMassRecord =
      food.foodType === "solid" &&
      food.measurementBasis === "mass" &&
      food.referenceUnit === "g";
    const isVolumeRecord =
      food.foodType === "liquid" &&
      food.measurementBasis === "volume" &&
      food.referenceUnit === "ml";

    if (!isMassRecord && !isVolumeRecord) {
      errors.push(
        `${label}: foodType, measurementBasis, and referenceUnit are incompatible.`,
      );
    }

    if (!Array.isArray(food.supportedUnits) || food.supportedUnits.length === 0) {
      errors.push(`${label}: supportedUnits must not be empty.`);
    } else if (isMassRecord && !food.supportedUnits.includes("grams")) {
      errors.push(`${label}: mass records must support grams.`);
    } else if (
      isVolumeRecord &&
      !food.supportedUnits.includes("milliliters")
    ) {
      errors.push(`${label}: volume records must support milliliters.`);
    }

    if (
      isMassRecord &&
      Object.hasOwn(food, "referenceWeightGrams") &&
      (!isPositiveFiniteNumber(food.referenceWeightGrams) ||
        food.referenceWeightGrams !== food.referenceAmount)
    ) {
      errors.push(
        `${label}: referenceWeightGrams must match referenceAmount when present.`,
      );
    }

    if (isVolumeRecord && Object.hasOwn(food, "referenceWeightGrams")) {
      errors.push(`${label}: volume records must not define referenceWeightGrams.`);
    }

    if (
      isVolumeRecord &&
      (!isNonEmptyString(food.measurementSource) ||
        !isNonEmptyString(food.measurementReference))
    ) {
      errors.push(`${label}: volume records require measurement provenance.`);
    }

    if (food.derivation !== undefined) {
      const derivation = food.derivation;
      if (
        !derivation ||
        typeof derivation !== "object" ||
        !isPositiveFiniteNumber(derivation.originalReferenceAmount) ||
        !isNonEmptyString(derivation.originalReferenceUnit) ||
        !isPositiveFiniteNumber(derivation.servingWeightGrams) ||
        !isPositiveFiniteNumber(derivation.servingVolumeMilliliters) ||
        !isNonEmptyString(derivation.formula) ||
        derivation.resultingReferenceAmount !== food.referenceAmount ||
        derivation.resultingReferenceUnit !== food.referenceUnit
      ) {
        errors.push(`${label}: measurement derivation is malformed.`);
      }

      for (const nutrient of NUTRIENT_FIELDS) {
        const originalValue = derivation?.originalNutritionPerReference?.[nutrient];
        if (
          originalValue !== null &&
          (typeof originalValue !== "number" ||
            !Number.isFinite(originalValue) ||
            originalValue < 0)
        ) {
          errors.push(
            `${label}: derived ${nutrient} requires a valid original value.`,
          );
        }
      }
    }

    if (
      !food.nutritionPerReference ||
      typeof food.nutritionPerReference !== "object"
    ) {
      errors.push(`${label}: nutritionPerReference is required.`);
    } else {
      for (const nutrient of NUTRIENT_FIELDS) {
        const value = food.nutritionPerReference[nutrient];
        if (
          value !== null &&
          (typeof value !== "number" || !Number.isFinite(value) || value < 0)
        ) {
          errors.push(`${label}: ${nutrient} must be non-negative or null.`);
        }
      }
    }

    for (const [unit, conversion] of Object.entries(
      food.servingConversions ?? {},
    )) {
      if (!food.supportedUnits?.includes(unit)) {
        errors.push(`${label}: ${unit} conversion is not a supported unit.`);
      }
      if (!isPositiveFiniteNumber(conversion?.gramsPerUnit)) {
        errors.push(`${label}: ${unit} conversion requires gramsPerUnit.`);
      }
      if (!isNonEmptyString(conversion?.sourceReference)) {
        errors.push(`${label}: ${unit} conversion requires source provenance.`);
      }
    }

    for (const [descriptor, conversion] of Object.entries(
      food.servingDescriptors ?? {},
    )) {
      if (
        !isPositiveFiniteNumber(conversion?.quantity) ||
        !isPositiveFiniteNumber(conversion?.grams)
      ) {
        errors.push(`${label}: ${descriptor} descriptor is malformed.`);
      }
      if (!isNonEmptyString(conversion?.sourceReference)) {
        errors.push(`${label}: ${descriptor} descriptor requires provenance.`);
      }
    }

    for (const field of [
      "sourceType",
      "sourceName",
      "sourceReference",
      "sourceFoodId",
      "sourceDescription",
    ]) {
      if (!isNonEmptyString(food[field])) {
        errors.push(`${label}: ${field} is required.`);
      }
    }

    if (food.sourceType !== "demo") {
      errors.push(`${label}: sourceType must remain demo.`);
    }
  }

  return { ok: errors.length === 0, errors };
}
