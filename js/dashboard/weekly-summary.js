import {
  addDaysToIsoDate,
  aggregateDailyLogs,
  compareCalories,
  getLocalDate,
  isIsoDate,
  selectTargetForDate,
} from "./daily-summary.js";

function preciseAverage(total, count) {
  return count > 0 ? Number((total / count).toFixed(6)) : null;
}

export function getWeekStartForDate(value) {
  if (!isIsoDate(value)) return null;
  const day = new Date(`${value}T12:00:00.000Z`).getUTCDay();
  return addDaysToIsoDate(value, day === 0 ? -6 : 1 - day);
}

export function getWeekDates(weekStart) {
  if (
    !isIsoDate(weekStart) ||
    getWeekStartForDate(weekStart) !== weekStart
  ) {
    return null;
  }
  return Array.from({ length: 7 }, (_, index) =>
    addDaysToIsoDate(weekStart, index),
  );
}

export function buildWeeklySummary({
  logs,
  targets,
  selectedWeekStart,
  timezoneName,
  now,
}) {
  const today = getLocalDate(now, timezoneName);
  const currentWeekStart = getWeekStartForDate(today);
  const dates = getWeekDates(selectedWeekStart);
  if (
    !today ||
    !currentWeekStart ||
    !dates ||
    selectedWeekStart > currentWeekStart
  ) {
    return { ok: false, code: "INVALID_WEEKLY_CONTEXT" };
  }

  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeTargets = Array.isArray(targets) ? targets : [];
  const rows = dates.map((localDate) => {
    const dayLogs = safeLogs.filter((log) => log.localDate === localDate);
    const totals = aggregateDailyLogs(dayLogs);
    const target = selectTargetForDate(safeTargets, localDate, {
      now,
      timezoneName,
    });
    const targetKcal =
      typeof target?.targetKcal === "number" && Number.isFinite(target.targetKcal)
        ? target.targetKcal
        : null;
    const isFuture = localDate > today;

    return Object.freeze({
      localDate,
      isToday: localDate === today,
      isFuture,
      logs: [...dayLogs],
      totals,
      target,
      targetKcal,
      comparison: isFuture
        ? Object.freeze({ status: "future", amountKcal: null })
        : compareCalories(totals.caloriesKcal, targetKcal),
    });
  });

  const elapsedRows = rows.filter((row) => !row.isFuture);
  const targetRows = elapsedRows.filter(
    (row) => typeof row.targetKcal === "number" && Number.isFinite(row.targetKcal),
  );
  const intakeTotal = elapsedRows.reduce(
    (total, row) => total + row.totals.caloriesKcal,
    0,
  );
  const targetTotal = targetRows.reduce(
    (total, row) => total + row.targetKcal,
    0,
  );
  const targetAvailability =
    targetRows.length === 0
      ? "unavailable"
      : targetRows.length === elapsedRows.length
        ? "complete"
        : "partial";

  return {
    ok: true,
    selectedWeekStart,
    selectedWeekEnd: dates[6],
    currentWeekStart,
    today,
    isCurrentWeek: selectedWeekStart === currentWeekStart,
    rows,
    hasNoHistory: rows.every((row) => row.totals.entryCount === 0),
    elapsedDayCount: elapsedRows.length,
    targetDayCount: targetRows.length,
    averageIntakeKcal: preciseAverage(intakeTotal, elapsedRows.length),
    averageTargetKcal: preciseAverage(targetTotal, targetRows.length),
    targetAvailability,
  };
}
