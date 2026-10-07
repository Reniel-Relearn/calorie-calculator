const NUTRIENT_FIELDS = Object.freeze([
  "caloriesKcal",
  "proteinG",
  "carbohydratesG",
  "fatG",
  "fiberG",
  "sugarG",
  "sodiumMg",
]);

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;
const MAX_STORED_QUANTITY = 99_999_999.999999;

function failure(code, message) {
  return { ok: false, code, message };
}

function copyJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function safePrecision(value) {
  return Number(value.toPrecision(12));
}

function validDate(value) {
  const match = DATE_PATTERN.exec(value ?? "");
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? { year, month, day }
    : null;
}

function validTime(value) {
  const match = TIME_PATTERN.exec(value ?? "");
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 23 && minute <= 59 ? { hour, minute } : null;
}

function zonedParts(instant, timezoneName) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    calendar: "gregory",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    numberingSystem: "latn",
    timeZone: timezoneName,
    year: "numeric",
  }).formatToParts(instant);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function localDateTimeToInstant(localDate, localTime, timezoneName) {
  const date = validDate(localDate);
  const time = validTime(localTime);
  if (!date || !time || typeof timezoneName !== "string") return null;

  const intended = Date.UTC(
    date.year,
    date.month - 1,
    date.day,
    time.hour,
    time.minute,
  );
  let candidate = intended;

  try {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const parts = zonedParts(new Date(candidate), timezoneName);
      const represented = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
      );
      const adjustment = intended - represented;
      candidate += adjustment;
      if (adjustment === 0) break;
    }

    const finalParts = zonedParts(new Date(candidate), timezoneName);
    if (
      Number(finalParts.year) !== date.year ||
      Number(finalParts.month) !== date.month ||
      Number(finalParts.day) !== date.day ||
      Number(finalParts.hour) !== time.hour ||
      Number(finalParts.minute) !== time.minute
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return new Date(candidate);
}

function conversionFactor(snapshot) {
  const serving = snapshot.serving;
  const type = serving?.conversionType;
  const metadata = serving?.conversionMetadata;

  if (type === "direct-grams" && serving.enteredUnit === "grams") return 1;
  if (
    type === "direct-milliliters" &&
    serving.enteredUnit === "milliliters"
  ) {
    return 1;
  }
  if (
    type === "unit" &&
    metadata &&
    typeof metadata.gramsPerUnit === "number" &&
    Number.isFinite(metadata.gramsPerUnit) &&
    metadata.gramsPerUnit > 0
  ) {
    return metadata.gramsPerUnit;
  }
  if (
    type === "descriptor" &&
    metadata &&
    metadata.unit === serving.enteredUnit &&
    typeof metadata.quantity === "number" &&
    Number.isFinite(metadata.quantity) &&
    metadata.quantity > 0 &&
    typeof metadata.grams === "number" &&
    Number.isFinite(metadata.grams) &&
    metadata.grams > 0
  ) {
    return metadata.grams / metadata.quantity;
  }
  return null;
}

export function getFoodLogLocalFields(log) {
  const instant = new Date(log?.consumedAt);
  if (!Number.isFinite(instant.getTime()) || !log?.timezoneAtEntry) return null;
  try {
    const parts = zonedParts(instant, log.timezoneAtEntry);
    return {
      localDate: `${parts.year}-${parts.month}-${parts.day}`,
      localTime: `${parts.hour}:${parts.minute}`,
    };
  } catch {
    return null;
  }
}

export function createFoodLogEditCommand(log, values) {
  const quantity = Number(values?.quantity);
  if (
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    quantity > MAX_STORED_QUANTITY
  ) {
    return failure("INVALID_QUANTITY", "Enter a serving amount greater than zero.");
  }

  const snapshot = log?.calculationSnapshot;
  if (
    !snapshot ||
    snapshot.schemaVersion !== "1.0.0" ||
    snapshot.food?.id !== log.foodId ||
    snapshot.reference?.unit !== log.normalizedUnit
  ) {
    return failure(
      "INVALID_SNAPSHOT",
      "This saved entry does not contain a usable calculation snapshot.",
    );
  }

  const factor = conversionFactor(snapshot);
  const referenceAmount = snapshot.reference.amount;
  const referenceNutrition = snapshot.reference.nutrition;
  if (
    factor === null ||
    typeof referenceAmount !== "number" ||
    !Number.isFinite(referenceAmount) ||
    referenceAmount <= 0 ||
    !referenceNutrition ||
    typeof referenceNutrition !== "object"
  ) {
    return failure(
      "INVALID_SNAPSHOT",
      "This saved entry's serving metadata cannot be recalculated safely.",
    );
  }

  const consumedAt = localDateTimeToInstant(
    values.localDate,
    values.localTime,
    log.timezoneAtEntry,
  );
  if (!consumedAt) {
    return failure(
      "INVALID_DATE_TIME",
      "Enter a valid date and time in the entry's saved timezone.",
    );
  }

  const normalizedAmount = safePrecision(quantity * factor);
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    return failure("INVALID_QUANTITY", "The serving amount cannot be normalized safely.");
  }

  const scaleFactor = safePrecision(normalizedAmount / referenceAmount);
  const nutrition = {};
  for (const field of NUTRIENT_FIELDS) {
    const referenceValue = referenceNutrition[field];
    if (referenceValue === null || referenceValue === undefined) {
      nutrition[field] = null;
      continue;
    }
    if (
      typeof referenceValue !== "number" ||
      !Number.isFinite(referenceValue) ||
      referenceValue < 0
    ) {
      return failure(
        "INVALID_SNAPSHOT",
        "This saved entry's nutrition reference cannot be recalculated safely.",
      );
    }
    nutrition[field] = safePrecision(referenceValue * scaleFactor);
  }
  if (nutrition.caloriesKcal === null) {
    return failure("INVALID_SNAPSHOT", "Calories are missing from this saved entry.");
  }

  const nextSnapshot = copyJson(snapshot);
  nextSnapshot.serving.enteredQuantity = quantity;
  nextSnapshot.serving.normalizedAmount = normalizedAmount;
  nextSnapshot.calculation.scaleFactor = scaleFactor;
  nextSnapshot.calculation.nutrition = nutrition;

  return {
    ok: true,
    command: {
      id: log.id,
      consumedAt: consumedAt.toISOString(),
      timezoneAtEntry: log.timezoneAtEntry,
      localDate: values.localDate,
      enteredQuantity: quantity,
      enteredUnit: log.enteredUnit,
      enteredDescriptor: log.enteredDescriptor,
      normalizedAmount,
      normalizedUnit: log.normalizedUnit,
      ...nutrition,
      calculationSnapshot: nextSnapshot,
    },
  };
}
