import assert from "node:assert/strict";
import test from "node:test";

import { createSettingsService } from "../js/settings/settings-service.js";

test("maps profile settings into the atomic RPC", async () => {
  let rpcCall;
  const service = createSettingsService({
    rpc(name, params) {
      rpcCall = { name, params };
      return Promise.resolve({
        data: {
          profile: {
            user_id: "user-a",
            display_name: "Updated",
            date_of_birth: "1990-01-01",
            sex_for_energy_equation: "female",
            height_cm: "165",
            weight_kg: "63",
            activity_category: "low_active",
            goal_type: "maintain",
            timezone_name: "Asia/Manila",
          },
          target: {
            id: "target-a",
            goal_type: "maintain",
            maintenance_kcal: "2000",
            target_kcal: "2000",
            methodology: "nasem-dri-energy-2023-eer",
            methodology_version: "1.0.0",
            activity_category: "low_active",
            input_snapshot: {},
            assumptions: [],
            warnings: [],
            effective_from: "2026-10-07T00:00:00Z",
            effective_to: null,
          },
          targetChanged: false,
        },
        error: null,
      });
    },
  });

  const result = await service.updateProfile({
    profile: {
      displayName: "Updated",
      dateOfBirth: "1990-01-01",
      sexForEnergyEquation: "female",
      heightCm: 165,
      weightKg: 63,
      activityCategory: "low_active",
      goalType: "maintain",
      timezoneName: "Asia/Manila",
    },
    target: null,
  });
  assert.equal(result.ok, true);
  assert.equal(result.targetChanged, false);
  assert.equal(rpcCall.name, "update_profile_settings");
  assert.equal(rpcCall.params.p_target_kcal, null);
});

test("invokes protected hard deletion and clears only local session state", async () => {
  const calls = [];
  const service = createSettingsService({
    auth: {
      signOut(options) {
        calls.push(["signOut", options]);
        return Promise.resolve({ error: null });
      },
    },
    functions: {
      invoke(name, options) {
        calls.push(["invoke", name, options]);
        return Promise.resolve({ data: { deleted: true }, error: null });
      },
    },
  });
  assert.deepEqual(
    await service.deleteAccount({
      currentPassword: "private",
      confirmation: "DELETE",
    }),
    { ok: true },
  );
  assert.equal(calls[0][1], "delete-account");
  assert.deepEqual(calls[1], ["signOut", { scope: "local" }]);
});
