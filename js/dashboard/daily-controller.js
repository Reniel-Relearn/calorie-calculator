import {
  addDaysToIsoDate,
  buildDailySummary,
  getLocalDate,
  isIsoDate,
} from "./daily-summary.js";

export function createDailyController({ service, view, now = () => new Date() }) {
  let profile = null;
  let selectedDate = null;
  let loadToken = 0;

  function currentToday() {
    return profile ? getLocalDate(now(), profile.timezoneName) : null;
  }

  async function load(options = {}) {
    if (!profile || !selectedDate) return;
    const token = ++loadToken;
    const today = currentToday();
    view.showLoading({
      selectedDate,
      today,
      announce: options.announce !== false,
    });

    let result;
    try {
      result = await service.loadDay({
        userId: profile.userId,
        localDate: selectedDate,
      });
    } catch {
      result = { ok: false, code: "DAILY_LOAD_FAILED" };
    }
    if (token !== loadToken || !profile) return;

    if (!result.ok) {
      view.showError({
        selectedDate,
        today,
        sessionExpired: result.code === "SESSION_REQUIRED",
      });
      return;
    }

    const summary = buildDailySummary({
      logs: result.logs,
      targets: result.targets,
      selectedDate,
      timezoneName: profile.timezoneName,
      now: now(),
    });
    if (!summary.ok) {
      view.showError({ selectedDate, today, sessionExpired: false });
      return;
    }
    view.showSummary(summary, { timezoneName: profile.timezoneName });
  }

  async function activate(nextProfile) {
    loadToken += 1;
    profile = nextProfile;
    selectedDate = currentToday();
    if (!selectedDate) {
      view.showError({ sessionExpired: false });
      return;
    }
    await load({ announce: false });
  }

  async function selectDate(nextDate) {
    const today = currentToday();
    if (!isIsoDate(nextDate) || !today || nextDate > today) {
      await load({ announce: false });
      return;
    }
    selectedDate = nextDate;
    await load();
  }

  function reset() {
    loadToken += 1;
    profile = null;
    selectedDate = null;
    view.reset();
  }

  return Object.freeze({
    activate,
    handleFoodLogSaved(detail) {
      if (profile && detail?.localDate === selectedDate) {
        return load({ announce: false });
      }
      return undefined;
    },
    handleFoodLogChanged(detail) {
      if (
        profile &&
        (detail?.localDate === selectedDate ||
          detail?.previousLocalDate === selectedDate)
      ) {
        return load({ announce: false });
      }
      return undefined;
    },
    next: () => {
      const today = currentToday();
      const nextDate = addDaysToIsoDate(selectedDate, 1);
      return nextDate && today && nextDate <= today
        ? selectDate(nextDate)
        : undefined;
    },
    previous: () => selectDate(addDaysToIsoDate(selectedDate, -1)),
    reset,
    retry: () => load(),
    selectDate,
    today: () => selectDate(currentToday()),
  });
}
