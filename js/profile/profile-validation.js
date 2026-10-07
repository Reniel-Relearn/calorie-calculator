import {
  ENERGY_ACTIVITY_CATEGORIES,
  ENERGY_EQUATION_SEXES,
} from "../targets/eer-equations.js";
import { ENERGY_GOAL_TYPES } from "../targets/energy-target.js";

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MAX_CANONICAL_MEASUREMENT = 9999.99;

function parseIsoDate(value) {
  const match = typeof value === "string" ? ISO_DATE_PATTERN.exec(value) : null;
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { day, month, year };
}

function toEpochDay({ day, month, year }) {
  return Date.UTC(year, month - 1, day);
}

function anniversaryForYear(birthDate, year) {
  const epoch = Date.UTC(year, birthDate.month - 1, birthDate.day);
  const date = new Date(epoch);

  if (date.getUTCMonth() !== birthDate.month - 1) {
    return Date.UTC(year, birthDate.month, 1);
  }

  return epoch;
}

export function calculateAgeYears(dateOfBirth, asOfDate) {
  const birthDate = parseIsoDate(dateOfBirth);
  const currentDate = parseIsoDate(asOfDate);
  if (!birthDate || !currentDate) return null;

  const birthEpoch = toEpochDay(birthDate);
  const currentEpoch = toEpochDay(currentDate);
  if (currentEpoch < birthEpoch) return null;

  let completedYears = currentDate.year - birthDate.year;
  let lastBirthday = anniversaryForYear(
    birthDate,
    birthDate.year + completedYears,
  );

  if (currentEpoch < lastBirthday) {
    completedYears -= 1;
    lastBirthday = anniversaryForYear(
      birthDate,
      birthDate.year + completedYears,
    );
  }

  const nextBirthday = anniversaryForYear(
    birthDate,
    birthDate.year + completedYears + 1,
  );
  const fraction = (currentEpoch - lastBirthday) / (nextBirthday - lastBirthday);

  return Number((completedYears + fraction).toPrecision(12));
}

export function isSupportedTimeZone(value) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 64) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value.trim() }).format();
    return true;
  } catch {
    return false;
  }
}

export function getBrowserTimeZone() {
  try {
    const timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isSupportedTimeZone(timeZone) ? timeZone : "UTC";
  } catch {
    return "UTC";
  }
}

export function getLocalDateInTimeZone(timeZone, instant = new Date()) {
  if (!isSupportedTimeZone(timeZone) || !(instant instanceof Date)) return null;
  if (!Number.isFinite(instant.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(instant);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeMeasurement(value) {
  const number = typeof value === "number" ? value : Number(value);
  if (
    !Number.isFinite(number) ||
    number <= 0 ||
    number > MAX_CANONICAL_MEASUREMENT
  ) {
    return null;
  }

  return Number(number.toFixed(2));
}

export function validateProfileInput(values, options = {}) {
  const errors = {};
  const displayName =
    typeof values?.displayName === "string"
      ? values.displayName.trim().replace(/\s+/g, " ")
      : "";
  const dateOfBirth =
    typeof values?.dateOfBirth === "string" ? values.dateOfBirth.trim() : "";
  const sexForEnergyEquation = values?.sexForEnergyEquation;
  const heightCm = normalizeMeasurement(values?.heightCm);
  const weightKg = normalizeMeasurement(values?.weightKg);
  const activityCategory = values?.activityCategory;
  const goalType = values?.goalType;
  const timezoneName =
    typeof values?.timezoneName === "string" ? values.timezoneName.trim() : "";

  if (!displayName) errors.displayName = "Enter the name you want displayed.";
  else if (displayName.length > 80) {
    errors.displayName = "Display name must be 80 characters or fewer.";
  }

  const birthDate = parseIsoDate(dateOfBirth);
  if (!birthDate) errors.dateOfBirth = "Enter a valid date of birth.";

  if (!ENERGY_EQUATION_SEXES.includes(sexForEnergyEquation)) {
    errors.sexForEnergyEquation = "Choose one source equation category.";
  }

  if (heightCm === null) {
    errors.heightCm = "Enter a height greater than 0 in centimeters.";
  }

  if (weightKg === null) {
    errors.weightKg = "Enter a weight greater than 0 in kilograms.";
  }

  if (!ENERGY_ACTIVITY_CATEGORIES.includes(activityCategory)) {
    errors.activityCategory = "Choose the activity description that fits best.";
  }

  if (goalType !== ENERGY_GOAL_TYPES.MAINTAIN) {
    errors.goalType = "Version 2 currently supports maintenance targets only.";
  }

  if (!isSupportedTimeZone(timezoneName)) {
    errors.timezoneName = "Enter a recognized IANA timezone, such as Asia/Manila.";
  }

  if (
    options.requireEligibilityConfirmation !== false &&
    values?.lifeStageEligibilityConfirmed !== true
  ) {
    errors.lifeStageEligibilityConfirmed =
      "Confirm that this estimate is not for pregnancy or breastfeeding.";
  }

  let ageYears = null;
  if (birthDate && !errors.timezoneName) {
    const asOfDate =
      options.asOfDate ?? getLocalDateInTimeZone(timezoneName, options.now);
    ageYears = calculateAgeYears(dateOfBirth, asOfDate);
    if (ageYears === null) {
      errors.dateOfBirth = "Date of birth cannot be in the future.";
    } else if (ageYears < 18) {
      errors.dateOfBirth = "Version 2 calorie targets are available from age 18.";
    }
  }

  const fieldOrder = [
    "displayName",
    "dateOfBirth",
    "sexForEnergyEquation",
    "heightCm",
    "weightKg",
    "activityCategory",
    "goalType",
    "timezoneName",
    "lifeStageEligibilityConfirmed",
  ];
  const firstField = fieldOrder.find((field) => errors[field]) ?? null;

  if (firstField) return { ok: false, errors, firstField };

  return {
    ok: true,
    profile: {
      displayName,
      dateOfBirth,
      sexForEnergyEquation,
      heightCm,
      weightKg,
      activityCategory,
      goalType,
      timezoneName,
    },
    targetInput: {
      ageYears,
      sexForEnergyEquation,
      heightCm,
      weightKg,
      activityCategory,
      goalType,
      lifeStageEligibilityConfirmed:
        values?.lifeStageEligibilityConfirmed === true,
    },
  };
}
