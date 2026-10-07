function failure(code, error = null) {
  return { ok: false, code, error };
}

function isAuthenticationError(error) {
  return error?.code === "42501" || error?.status === 401 || error?.status === 403;
}

function normalizeLog(row) {
  if (!row) return null;
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
    proteinG: row.protein_g === null ? null : Number(row.protein_g),
    carbohydratesG:
      row.carbohydrates_g === null ? null : Number(row.carbohydrates_g),
    fatG: row.fat_g === null ? null : Number(row.fat_g),
    fiberG: row.fiber_g === null ? null : Number(row.fiber_g),
    sugarG: row.sugar_g === null ? null : Number(row.sugar_g),
    sodiumMg: row.sodium_mg === null ? null : Number(row.sodium_mg),
    nutritionDatasetVersion: row.nutrition_dataset_version,
    sourceReference: row.source_reference,
    calculationSnapshot: row.calculation_snapshot,
  };
}

export function createFoodLogService(client) {
  return Object.freeze({
    async create(command) {
      let result;
      try {
        result = await client.rpc("create_food_log", {
          p_calculation_snapshot: command.calculationSnapshot,
          p_calories_kcal: command.caloriesKcal,
          p_carbohydrates_g: command.carbohydratesG,
          p_consumed_at: command.consumedAt,
          p_entered_descriptor: command.enteredDescriptor,
          p_entered_quantity: command.enteredQuantity,
          p_entered_unit: command.enteredUnit,
          p_fat_g: command.fatG,
          p_fiber_g: command.fiberG,
          p_food_id: command.foodId,
          p_food_name_snapshot: command.foodNameSnapshot,
          p_local_date: command.localDate,
          p_normalized_amount: command.normalizedAmount,
          p_normalized_unit: command.normalizedUnit,
          p_nutrition_dataset_version: command.nutritionDatasetVersion,
          p_protein_g: command.proteinG,
          p_request_id: command.requestId,
          p_sodium_mg: command.sodiumMg,
          p_source_reference: command.sourceReference,
          p_sugar_g: command.sugarG,
          p_timezone_at_entry: command.timezoneAtEntry,
        });
      } catch (error) {
        return failure("LOG_SAVE_FAILED", error);
      }

      if (result.error) {
        return failure(
          isAuthenticationError(result.error) ? "SESSION_REQUIRED" : "LOG_SAVE_FAILED",
          result.error,
        );
      }
      if (!result.data?.log) return failure("LOG_SAVE_FAILED");

      return {
        ok: true,
        idempotent: result.data.idempotent === true,
        log: normalizeLog(result.data.log),
      };
    },

    async update(command) {
      let result;
      try {
        result = await client.rpc("update_food_log", {
          p_calculation_snapshot: command.calculationSnapshot,
          p_calories_kcal: command.caloriesKcal,
          p_carbohydrates_g: command.carbohydratesG,
          p_consumed_at: command.consumedAt,
          p_entered_descriptor: command.enteredDescriptor,
          p_entered_quantity: command.enteredQuantity,
          p_entered_unit: command.enteredUnit,
          p_fat_g: command.fatG,
          p_fiber_g: command.fiberG,
          p_local_date: command.localDate,
          p_log_id: command.id,
          p_normalized_amount: command.normalizedAmount,
          p_normalized_unit: command.normalizedUnit,
          p_protein_g: command.proteinG,
          p_sodium_mg: command.sodiumMg,
          p_sugar_g: command.sugarG,
          p_timezone_at_entry: command.timezoneAtEntry,
        });
      } catch (error) {
        return failure("LOG_UPDATE_FAILED", error);
      }

      if (result.error) {
        return failure(
          isAuthenticationError(result.error)
            ? "SESSION_REQUIRED"
            : "LOG_UPDATE_FAILED",
          result.error,
        );
      }
      if (!result.data?.log) return failure("LOG_UPDATE_FAILED");

      return {
        ok: true,
        log: normalizeLog(result.data.log),
        previousLocalDate: result.data.previousLocalDate,
      };
    },

    async delete(logId) {
      let result;
      try {
        result = await client
          .from("food_logs")
          .delete()
          .eq("id", logId)
          .select("id,local_date")
          .maybeSingle();
      } catch (error) {
        return failure("LOG_DELETE_FAILED", error);
      }

      if (result.error) {
        return failure(
          isAuthenticationError(result.error)
            ? "SESSION_REQUIRED"
            : "LOG_DELETE_FAILED",
          result.error,
        );
      }
      if (!result.data) return failure("LOG_NOT_FOUND");

      return {
        ok: true,
        id: result.data.id,
        localDate: result.data.local_date,
      };
    },
  });
}
