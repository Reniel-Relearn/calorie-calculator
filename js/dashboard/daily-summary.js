export const DAILY_NUTRIENTS = Object.freeze([
  "proteinG",
  "carbohydratesG",
  "fatG",
  "fiberG",
  "sugarG",
  "sodiumMg",
]);

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function preciseSum(values) {
  return Number(values.reduce((sum, value) => sum + value, 0).toFixed(6));
}

export function isIsoDate(value) {
  const match = ISO_DATE_PATTERN.exec(value ?? "");
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function addDaysToIsoDate(value, amount) {
  if (!isIsoDate(value) || !Number.isInteger(amount)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return [
    String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function getLocalDate(instant, timezoneName) {
  const date = instant instanceof Date ? instant : new Date(instant);
  if (!Number.isFinite(date.getTime())) return null;

  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      calendar: "gregory",
      day: "2-digit",
      month: "2-digit",
      numberingSystem: "latn",
      timeZone: timezoneName,
      year: "numeric",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    const result = `${values.year}-${values.month}-${values.day}`;
    return isIsoDate(result) ? result : null;
  } catch {
    return null;
  }
}

function aggregateNutrient(logs, field) {
  const available = logs
    .map((log) => log[field])
    .filter((value) => typeof value === "number" && Number.isFinite(value));

  if (available.length === 0) {
    return Object.freeze({ value: null, availability: "unavailable" });
  }

  return Object.freeze({
    value: preciseSum(available),
    availability: available.length === logs.length ? "complete" : "partial",
  });
}

export function aggregateDailyLogs(logs) {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const caloriesKcal = preciseSum(
    safeLogs
      .map((log) => log.caloriesKcal)
      .filter((value) => typeof value === "number" && Number.isFinite(value)),
  );
  const nutrients = Object.fromEntries(
    DAILY_NUTRIENTS.map((field) => [field, aggregateNutrient(safeLogs, field)]),
  );

  return Object.freeze({
    entryCount: safeLogs.length,
    caloriesKcal,
    nutrients: Object.freeze(nutrients),
  });
}

export function selectTargetForDate(
  targets,
  selectedDate,
  { now, timezoneName },
) {
  if (!isIsoDate(selectedDate)) return null;
  const currentInstant = now instanceof Date ? now : new Date(now);
  if (!Number.isFinite(currentInstant.getTime())) return null;
  const today = getLocalDate(currentInstant, timezoneName);
  if (!today) return null;

  return (
    (Array.isArray(targets) ? targets : [])
      .filter((target) => {
        const effectiveInstant = new Date(target.effectiveFrom);
        if (!Number.isFinite(effectiveInstant.getTime())) return false;
        if (selectedDate === today) return effectiveInstant <= currentInstant;
        const effectiveLocalDate = getLocalDate(effectiveInstant, timezoneName);
        return effectiveLocalDate !== null && effectiveLocalDate <= selectedDate;
      })
      .sort(
        (left, right) =>
          new Date(right.effectiveFrom).getTime() -
          new Date(left.effectiveFrom).getTime(),
      )[0] ?? null
  );
}

export function compareCalories(caloriesKcal, targetKcal) {
  if (
    typeof targetKcal !== "number" ||
    !Number.isFinite(targetKcal) ||
    targetKcal <= 0
  ) {
    return Object.freeze({ status: "unavailable", amountKcal: null });
  }

  const difference = Number((targetKcal - caloriesKcal).toFixed(6));
  return difference >= 0
    ? Object.freeze({ status: "remaining", amountKcal: difference })
    : Object.freeze({ status: "above", amountKcal: Math.abs(difference) });
}

export function buildDailySummary({
  logs,
  targets,
  selectedDate,
  timezoneName,
  now,
}) {
  const today = getLocalDate(now, timezoneName);
  if (!today || !isIsoDate(selectedDate)) {
    return { ok: false, code: "INVALID_DAILY_CONTEXT" };
  }

  const totals = aggregateDailyLogs(logs);
  const target = selectTargetForDate(targets, selectedDate, {
    now,
    timezoneName,
  });
  const targetKcal =
    typeof target?.targetKcal === "number" && Number.isFinite(target.targetKcal)
      ? target.targetKcal
      : null;

  return {
    ok: true,
    selectedDate,
    today,
    isToday: selectedDate === today,
    logs: Array.isArray(logs) ? [...logs] : [],
    totals,
    target,
    targetKcal,
    comparison: compareCalories(totals.caloriesKcal, targetKcal),
  };
}
