import { addDaysToIsoDate, getLocalDate } from "./daily-summary.js";
import {
  buildWeeklySummary,
  getWeekDates,
  getWeekStartForDate,
} from "./weekly-summary.js";

export function createWeeklyController({ service, view, now = () => new Date() }) {
  let profile = null;
  let selectedWeekStart = null;
  let loadToken = 0;

  function currentWeekStart() {
    if (!profile) return null;
    return getWeekStartForDate(getLocalDate(now(), profile.timezoneName));
  }

  async function load(options = {}) {
    const dates = getWeekDates(selectedWeekStart);
    const currentStart = currentWeekStart();
    if (!profile || !dates || !currentStart) return;

    const token = ++loadToken;
    view.showLoading({
      selectedWeekStart,
      selectedWeekEnd: dates[6],
      currentWeekStart: currentStart,
      announce: options.announce !== false,
    });

    let result;
    try {
      result = await service.loadWeek({
        userId: profile.userId,
        startDate: selectedWeekStart,
        endDate: dates[6],
      });
    } catch {
      result = { ok: false, code: "WEEKLY_LOAD_FAILED" };
    }
    if (token !== loadToken || !profile) return;

    if (!result.ok) {
      view.showError({
        selectedWeekStart,
        selectedWeekEnd: dates[6],
        currentWeekStart: currentStart,
        sessionExpired: result.code === "SESSION_REQUIRED",
      });
      return;
    }

    const summary = buildWeeklySummary({
      logs: result.logs,
      targets: result.targets,
      selectedWeekStart,
      timezoneName: profile.timezoneName,
      now: now(),
    });
    if (!summary.ok) {
      view.showError({
        selectedWeekStart,
        selectedWeekEnd: dates[6],
        currentWeekStart: currentStart,
        sessionExpired: false,
      });
      return;
    }
    view.showSummary(summary);
  }

  async function activate(nextProfile) {
    loadToken += 1;
    profile = nextProfile;
    selectedWeekStart = currentWeekStart();
    if (!selectedWeekStart) {
      view.showError({ sessionExpired: false });
      return;
    }
    await load({ announce: false });
  }

  function reset() {
    loadToken += 1;
    profile = null;
    selectedWeekStart = null;
    view.reset();
  }

  return Object.freeze({
    activate,
    current: () => {
      const currentStart = currentWeekStart();
      if (!currentStart || currentStart === selectedWeekStart) return undefined;
      selectedWeekStart = currentStart;
      return load();
    },
    handleFoodLogSaved(detail) {
      const dates = getWeekDates(selectedWeekStart);
      if (
        profile &&
        dates &&
        detail?.localDate >= dates[0] &&
        detail.localDate <= dates[6]
      ) {
        return load({ announce: false });
      }
      return undefined;
    },
    handleFoodLogChanged(detail) {
      const dates = getWeekDates(selectedWeekStart);
      const belongs = (localDate) =>
        typeof localDate === "string" &&
        dates &&
        localDate >= dates[0] &&
        localDate <= dates[6];
      if (
        profile &&
        (belongs(detail?.localDate) || belongs(detail?.previousLocalDate))
      ) {
        return load({ announce: false });
      }
      return undefined;
    },
    next: () => {
      const currentStart = currentWeekStart();
      const nextStart = addDaysToIsoDate(selectedWeekStart, 7);
      if (!nextStart || !currentStart || nextStart > currentStart) return undefined;
      selectedWeekStart = nextStart;
      return load();
    },
    previous: () => {
      const previousStart = addDaysToIsoDate(selectedWeekStart, -7);
      if (!previousStart) return undefined;
      selectedWeekStart = previousStart;
      return load();
    },
    reset,
    retry: () => load(),
  });
}
