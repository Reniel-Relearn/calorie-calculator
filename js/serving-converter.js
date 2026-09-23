export const MAX_NORMALIZED_GRAMS = 5000;

export const SERVING_ERROR_CODES = Object.freeze({
  INVALID_FOOD: "INVALID_FOOD",
  MISSING_AMOUNT: "MISSING_AMOUNT",
  INVALID_QUANTITY: "INVALID_QUANTITY",
  UNSUPPORTED_UNIT: "UNSUPPORTED_UNIT",
  UNSUPPORTED_DESCRIPTOR: "UNSUPPORTED_DESCRIPTOR",
  UNSUPPORTED_SERVING: "UNSUPPORTED_SERVING",
  NORMALIZED_AMOUNT_TOO_LARGE: "NORMALIZED_AMOUNT_TOO_LARGE",
  INVALID_CONVERSION_METADATA: "INVALID_CONVERSION_METADATA",
});

function createFailure(code, message, servingInput = {}) {
  return {
    ok: false,
    code,
    message,
    originalQuantity: servingInput.quantity ?? null,
    originalUnit: servingInput.unit ?? null,
    descriptor: servingInput.servingDescriptor ?? null,
  };
}

function toSafePrecision(value) {
  return Number(value.toPrecision(12));
}

function validateNormalizedGrams(grams, servingInput) {
  if (!Number.isFinite(grams) || grams <= 0) {
    return createFailure(
      SERVING_ERROR_CODES.INVALID_QUANTITY,
      "The serving amount could not be converted to a valid gram amount.",
      servingInput,
    );
  }

  if (grams > MAX_NORMALIZED_GRAMS) {
    return createFailure(
      SERVING_ERROR_CODES.NORMALIZED_AMOUNT_TOO_LARGE,
      "The normalized amount must not exceed 5,000 grams.",
      servingInput,
    );
  }

  return null;
}

function createSuccess(grams, servingInput, conversionType) {
  return {
    ok: true,
    grams: toSafePrecision(grams),
    originalQuantity: servingInput.quantity,
    originalUnit: servingInput.unit ?? null,
    descriptor: servingInput.servingDescriptor ?? null,
    conversionType,
  };
}

export function convertServingToGrams(food, servingInput = {}) {
  servingInput =
    servingInput && typeof servingInput === "object" ? servingInput : {};

  if (!food || typeof food !== "object") {
    return createFailure(
      SERVING_ERROR_CODES.INVALID_FOOD,
      "A matched food is required for serving conversion.",
      servingInput,
    );
  }

  const quantity = servingInput.quantity;
  const unit = servingInput.unit ?? null;
  const descriptor = servingInput.servingDescriptor ?? null;

  if (quantity === null || quantity === undefined) {
    return createFailure(
      SERVING_ERROR_CODES.MISSING_AMOUNT,
      "Enter an amount before calculating nutrition.",
      servingInput,
    );
  }

  if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity <= 0) {
    return createFailure(
      SERVING_ERROR_CODES.INVALID_QUANTITY,
      "Amount must be a finite number greater than zero.",
      servingInput,
    );
  }

  if (!Array.isArray(food.supportedUnits)) {
    return createFailure(
      SERVING_ERROR_CODES.INVALID_CONVERSION_METADATA,
      "This food has invalid serving-unit metadata.",
      servingInput,
    );
  }

  if (descriptor) {
    const descriptorMap = food.servingDescriptors;
    const hasDescriptor =
      descriptorMap &&
      typeof descriptorMap === "object" &&
      Object.hasOwn(descriptorMap, descriptor);

    if (!hasDescriptor) {
      return createFailure(
        SERVING_ERROR_CODES.UNSUPPORTED_DESCRIPTOR,
        `${food.name} does not support the ${descriptor} descriptor.`,
        servingInput,
      );
    }

    const descriptorMetadata = descriptorMap[descriptor];
    if (!descriptorMetadata || typeof descriptorMetadata !== "object") {
      return createFailure(
        SERVING_ERROR_CODES.INVALID_CONVERSION_METADATA,
        `The ${descriptor} conversion for ${food.name} is invalid.`,
        servingInput,
      );
    }

    const descriptorUnit = descriptorMetadata.unit;
    const descriptorQuantity = descriptorMetadata.quantity;
    const descriptorGrams = descriptorMetadata.grams;

    if (
      typeof descriptorUnit !== "string" ||
      !food.supportedUnits.includes(descriptorUnit) ||
      typeof descriptorQuantity !== "number" ||
      !Number.isFinite(descriptorQuantity) ||
      descriptorQuantity <= 0 ||
      typeof descriptorGrams !== "number" ||
      !Number.isFinite(descriptorGrams) ||
      descriptorGrams <= 0
    ) {
      return createFailure(
        SERVING_ERROR_CODES.INVALID_CONVERSION_METADATA,
        `The ${descriptor} conversion for ${food.name} is invalid.`,
        servingInput,
      );
    }

    if (unit && unit !== descriptorUnit) {
      return createFailure(
        SERVING_ERROR_CODES.UNSUPPORTED_SERVING,
        `The ${descriptor} descriptor for ${food.name} uses ${descriptorUnit}, not ${unit}.`,
        servingInput,
      );
    }

    const grams = quantity * (descriptorGrams / descriptorQuantity);
    const validationFailure = validateNormalizedGrams(grams, servingInput);

    return (
      validationFailure ?? createSuccess(grams, servingInput, "descriptor")
    );
  }

  if (!unit) {
    return createFailure(
      SERVING_ERROR_CODES.UNSUPPORTED_SERVING,
      `Specify a supported unit or descriptor for ${food.name}.`,
      servingInput,
    );
  }

  if (!food.supportedUnits.includes(unit)) {
    return createFailure(
      SERVING_ERROR_CODES.UNSUPPORTED_UNIT,
      `${food.name} does not support ${unit}.`,
      servingInput,
    );
  }

  if (unit === "grams") {
    const validationFailure = validateNormalizedGrams(quantity, servingInput);
    return (
      validationFailure ?? createSuccess(quantity, servingInput, "direct-grams")
    );
  }

  const conversionMap = food.servingConversions;
  const hasConversion =
    conversionMap &&
    typeof conversionMap === "object" &&
    Object.hasOwn(conversionMap, unit);

  if (!hasConversion) {
    return createFailure(
      SERVING_ERROR_CODES.UNSUPPORTED_SERVING,
      `${food.name} requires a supported descriptor or another unit instead of ${unit}.`,
      servingInput,
    );
  }

  const conversion = conversionMap[unit];
  if (
    !conversion ||
    typeof conversion !== "object" ||
    typeof conversion.gramsPerUnit !== "number" ||
    !Number.isFinite(conversion.gramsPerUnit) ||
    conversion.gramsPerUnit <= 0
  ) {
    return createFailure(
      SERVING_ERROR_CODES.INVALID_CONVERSION_METADATA,
      `The ${unit} conversion for ${food.name} is invalid.`,
      servingInput,
    );
  }

  const grams = quantity * conversion.gramsPerUnit;
  const validationFailure = validateNormalizedGrams(grams, servingInput);

  return validationFailure ?? createSuccess(grams, servingInput, "unit");
}
