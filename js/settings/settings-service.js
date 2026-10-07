import {
  normalizeProfile,
  normalizeTarget,
} from "../profile/profile-service.js";

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

export function createSettingsService(client) {
  return Object.freeze({
    async deleteAccount({ currentPassword, confirmation }) {
      let result;
      try {
        result = await client.functions.invoke("delete-account", {
          body: { currentPassword, confirmation },
        });
      } catch (error) {
        return failure("ACCOUNT_DELETE_FAILED", error);
      }

      if (result.error || result.data?.deleted !== true) {
        const status = result.error?.context?.status;
        return failure(
          status === 401 || status === 403
            ? "ACCOUNT_REAUTHENTICATION_FAILED"
            : "ACCOUNT_DELETE_FAILED",
          result.error,
        );
      }

      try {
        await client.auth.signOut({ scope: "local" });
      } catch {
        // The account is already gone. The application clears private state next.
      }
      return { ok: true };
    },

    async updateProfile(command) {
      const target = command.target;
      let result;
      try {
        result = await client.rpc("update_profile_settings", {
          p_activity_category: command.profile.activityCategory,
          p_assumptions: target?.assumptions ?? null,
          p_date_of_birth: command.profile.dateOfBirth,
          p_display_name: command.profile.displayName,
          p_goal_type: command.profile.goalType,
          p_height_cm: command.profile.heightCm,
          p_input_snapshot: target?.inputSnapshot ?? null,
          p_maintenance_kcal: target?.maintenanceKcal ?? null,
          p_methodology: target?.methodology ?? null,
          p_methodology_version: target?.methodologyVersion ?? null,
          p_sex_for_energy_equation: command.profile.sexForEnergyEquation,
          p_target_kcal: target?.targetKcal ?? null,
          p_timezone_name: command.profile.timezoneName,
          p_warnings: target?.warnings ?? null,
          p_weight_kg: command.profile.weightKg,
        });
      } catch (error) {
        return failure("SETTINGS_SAVE_FAILED", error);
      }

      if (result.error) {
        return failure(
          isAuthenticationError(result.error)
            ? "SESSION_REQUIRED"
            : "SETTINGS_SAVE_FAILED",
          result.error,
        );
      }
      if (!result.data?.profile || !result.data?.target) {
        return failure("SETTINGS_SAVE_FAILED");
      }

      return {
        ok: true,
        profile: normalizeProfile(result.data.profile),
        target: normalizeTarget(result.data.target),
        targetChanged: result.data.targetChanged === true,
      };
    },
  });
}
