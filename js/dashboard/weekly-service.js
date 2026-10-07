import {
  DASHBOARD_LOG_COLUMNS,
  DASHBOARD_TARGET_COLUMNS,
  fetchDashboardPages,
  isDashboardAuthenticationError,
  normalizeDashboardLog,
  normalizeDashboardTarget,
} from "./dashboard-data.js";

function failure(code, error = null) {
  return { ok: false, code, error };
}

export function createWeeklyService(client) {
  return Object.freeze({
    async loadWeek({ userId, startDate, endDate }) {
      let logsResult;
      let targetsResult;
      try {
        [logsResult, targetsResult] = await Promise.all([
          fetchDashboardPages(() =>
            client
              .from("food_logs")
              .select(DASHBOARD_LOG_COLUMNS)
              .eq("user_id", userId)
              .gte("local_date", startDate)
              .lte("local_date", endDate)
              .order("local_date", { ascending: true })
              .order("consumed_at", { ascending: true }),
          ),
          fetchDashboardPages(() =>
            client
              .from("calorie_targets")
              .select(DASHBOARD_TARGET_COLUMNS)
              .eq("user_id", userId)
              .order("effective_from", { ascending: false }),
          ),
        ]);
      } catch (error) {
        return failure("WEEKLY_LOAD_FAILED", error);
      }

      const queryError = logsResult.error ?? targetsResult.error;
      if (!logsResult.ok || !targetsResult.ok) {
        return failure(
          isDashboardAuthenticationError(queryError)
            ? "SESSION_REQUIRED"
            : "WEEKLY_LOAD_FAILED",
          queryError,
        );
      }

      return {
        ok: true,
        logs: logsResult.rows.map(normalizeDashboardLog),
        targets: targetsResult.rows.map(normalizeDashboardTarget),
      };
    },
  });
}
