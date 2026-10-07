const LOG_COLUMNS = [
  "id",
  "consumed_at",
  "timezone_at_entry",
  "local_date",
  "food_id",
  "food_name_snapshot",
  "entered_quantity",
  "entered_unit",
  "entered_descriptor",
  "normalized_amount",
  "normalized_unit",
  "calories_kcal",
  "protein_g",
  "carbohydrates_g",
  "fat_g",
  "fiber_g",
  "sugar_g",
  "sodium_mg",
].join(",");

const TARGET_COLUMNS = [
  "id",
  "target_kcal",
  "maintenance_kcal",
  "goal_type",
  "methodology",
  "methodology_version",
  "effective_from",
  "effective_to",
].join(",");

const PAGE_SIZE = 1000;

function failure(code, error = null) {
  return { ok: false, code, error };
}

function isAuthenticationError(error) {
  return (
    error?.code === "42501" ||
    error?.code === "PGRST301" ||
    error?.status === 401 ||
    error?.status === 403
  );
}

function numberOrNull(value) {
  return value === null || value === undefined ? null : Number(value);
}

function normalizeLog(row) {
  return {
    id: row.id,
    consumedAt: row.consumed_at,
    timezoneAtEntry: row.timezone_at_entry,
    localDate: row.local_date,
    foodId: row.food_id,
    foodNameSnapshot: row.food_name_snapshot,
    enteredQuantity: Number(row.entered_quantity),
    enteredUnit: row.entered_unit,
    enteredDescriptor: row.entered_descriptor,
    normalizedAmount: Number(row.normalized_amount),
    normalizedUnit: row.normalized_unit,
    caloriesKcal: Number(row.calories_kcal),
    proteinG: numberOrNull(row.protein_g),
    carbohydratesG: numberOrNull(row.carbohydrates_g),
    fatG: numberOrNull(row.fat_g),
    fiberG: numberOrNull(row.fiber_g),
    sugarG: numberOrNull(row.sugar_g),
    sodiumMg: numberOrNull(row.sodium_mg),
  };
}

function normalizeTarget(row) {
  return {
    id: row.id,
    targetKcal: numberOrNull(row.target_kcal),
    maintenanceKcal: Number(row.maintenance_kcal),
    goalType: row.goal_type,
    methodology: row.methodology,
    methodologyVersion: row.methodology_version,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
  };
}

async function fetchPages(createQuery) {
  const rows = [];
  for (let start = 0; ; start += PAGE_SIZE) {
    const result = await createQuery().range(start, start + PAGE_SIZE - 1);
    if (result.error) return failure("QUERY_FAILED", result.error);
    const page = result.data ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return { ok: true, rows };
  }
}

export function createDailyService(client) {
  return Object.freeze({
    async loadDay({ userId, localDate }) {
      let logsResult;
      let targetsResult;
      try {
        [logsResult, targetsResult] = await Promise.all([
          fetchPages(() =>
            client
              .from("food_logs")
              .select(LOG_COLUMNS)
              .eq("user_id", userId)
              .eq("local_date", localDate)
              .order("consumed_at", { ascending: false }),
          ),
          fetchPages(() =>
            client
              .from("calorie_targets")
              .select(TARGET_COLUMNS)
              .eq("user_id", userId)
              .order("effective_from", { ascending: false }),
          ),
        ]);
      } catch (error) {
        return failure("DAILY_LOAD_FAILED", error);
      }

      const queryError = logsResult.error ?? targetsResult.error;
      if (!logsResult.ok || !targetsResult.ok) {
        return failure(
          isAuthenticationError(queryError)
            ? "SESSION_REQUIRED"
            : "DAILY_LOAD_FAILED",
          queryError,
        );
      }

      return {
        ok: true,
        logs: logsResult.rows.map(normalizeLog),
        targets: targetsResult.rows.map(normalizeTarget),
      };
    },
  });
}
