function failure(code, error = null) {
  return { ok: false, code, error };
}

function normalizeProfile(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    displayName: row.display_name,
    dateOfBirth: row.date_of_birth,
    sexForEnergyEquation: row.sex_for_energy_equation,
    heightCm: Number(row.height_cm),
    weightKg: Number(row.weight_kg),
    activityCategory: row.activity_category,
    goalType: row.goal_type,
    timezoneName: row.timezone_name,
    onboardingCompletedAt: row.onboarding_completed_at,
  };
}

function normalizeTarget(row) {
  if (!row) return null;
  return {
    id: row.id,
    goalType: row.goal_type,
    maintenanceKcal: Number(row.maintenance_kcal),
    targetKcal: row.target_kcal === null ? null : Number(row.target_kcal),
    methodology: row.methodology,
    methodologyVersion: row.methodology_version,
    activityCategory: row.activity_category,
    inputSnapshot: row.input_snapshot,
    assumptions: row.assumptions,
    warnings: row.warnings,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
  };
}

const PROFILE_COLUMNS = [
  "user_id",
  "display_name",
  "date_of_birth",
  "sex_for_energy_equation",
  "height_cm",
  "weight_kg",
  "activity_category",
  "goal_type",
  "timezone_name",
  "onboarding_completed_at",
].join(",");

const TARGET_COLUMNS = [
  "id",
  "goal_type",
  "maintenance_kcal",
  "target_kcal",
  "methodology",
  "methodology_version",
  "activity_category",
  "input_snapshot",
  "assumptions",
  "warnings",
  "effective_from",
  "effective_to",
].join(",");

export function createProfileService(client) {
  return Object.freeze({
    async loadProfile(userId) {
      let profileResult;
      let targetResult;
      try {
        [profileResult, targetResult] = await Promise.all([
          client
            .from("profiles")
            .select(PROFILE_COLUMNS)
            .eq("user_id", userId)
            .maybeSingle(),
          client
            .from("calorie_targets")
            .select(TARGET_COLUMNS)
            .eq("user_id", userId)
            .is("effective_to", null)
            .maybeSingle(),
        ]);
      } catch (error) {
        return failure("PROFILE_LOAD_FAILED", error);
      }

      if (profileResult.error || targetResult.error) {
        return failure("PROFILE_LOAD_FAILED", profileResult.error ?? targetResult.error);
      }

      if (!profileResult.data && !targetResult.data) {
        return { ok: true, complete: false, profile: null, target: null };
      }

      if (!profileResult.data || !targetResult.data) {
        return failure("INCOMPLETE_ONBOARDING_DATA");
      }

      return {
        ok: true,
        complete: true,
        profile: normalizeProfile(profileResult.data),
        target: normalizeTarget(targetResult.data),
      };
    },

    async completeOnboarding(command) {
      let result;
      try {
        result = await client.rpc("complete_profile_onboarding", {
          p_activity_category: command.profile.activityCategory,
          p_assumptions: command.target.assumptions,
          p_date_of_birth: command.profile.dateOfBirth,
          p_display_name: command.profile.displayName,
          p_goal_type: command.profile.goalType,
          p_height_cm: command.profile.heightCm,
          p_input_snapshot: command.target.inputSnapshot,
          p_maintenance_kcal: command.target.maintenanceKcal,
          p_methodology: command.target.methodology,
          p_methodology_version: command.target.methodologyVersion,
          p_sex_for_energy_equation: command.profile.sexForEnergyEquation,
          p_target_kcal: command.target.targetKcal,
          p_timezone_name: command.profile.timezoneName,
          p_warnings: command.target.warnings,
          p_weight_kg: command.profile.weightKg,
        });
      } catch (error) {
        return failure("ONBOARDING_SAVE_FAILED", error);
      }

      if (result.error || !result.data?.profile || !result.data?.target) {
        return failure("ONBOARDING_SAVE_FAILED", result.error);
      }

      return {
        ok: true,
        idempotent: result.data.idempotent === true,
        profile: normalizeProfile(result.data.profile),
        target: normalizeTarget(result.data.target),
      };
    },
  });
}
