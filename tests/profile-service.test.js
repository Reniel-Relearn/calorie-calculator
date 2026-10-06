import assert from "node:assert/strict";
import test from "node:test";

import { createProfileService } from "../js/profile/profile-service.js";

function queryResult(result) {
  return {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    is() {
      return this;
    },
    async maybeSingle() {
      return result;
    },
  };
}

const profileRow = {
  user_id: "user-1",
  display_name: "Test Person",
  date_of_birth: "1990-01-01",
  sex_for_energy_equation: "female",
  height_cm: "165.25",
  weight_kg: "63.50",
  activity_category: "low_active",
  goal_type: "maintain",
  timezone_name: "Asia/Manila",
  onboarding_completed_at: "2026-10-06T00:00:00Z",
};

const targetRow = {
  id: "target-1",
  goal_type: "maintain",
  maintenance_kcal: "2275.37",
  target_kcal: "2275.37",
  methodology: "nasem-dri-energy-2023-eer",
  methodology_version: "1.0.0",
  activity_category: "low_active",
  input_snapshot: { ageYears: 36 },
  assumptions: ["test"],
  warnings: [],
  effective_from: "2026-10-06T00:00:00Z",
  effective_to: null,
};

test("distinguishes incomplete and complete profile routing", async () => {
  const incomplete = createProfileService({
    from(table) {
      return queryResult({ data: null, error: null });
    },
  });
  assert.deepEqual(await incomplete.loadProfile("user-1"), {
    ok: true,
    complete: false,
    profile: null,
    target: null,
  });

  const complete = createProfileService({
    from(table) {
      return queryResult({
        data: table === "profiles" ? profileRow : targetRow,
        error: null,
      });
    },
  });
  const result = await complete.loadProfile("user-1");
  assert.equal(result.ok, true);
  assert.equal(result.complete, true);
  assert.equal(result.profile.displayName, "Test Person");
  assert.equal(result.target.targetKcal, 2275.37);
});

test("fails safely when only one side of onboarding exists", async () => {
  const service = createProfileService({
    from(table) {
      return queryResult({
        data: table === "profiles" ? profileRow : null,
        error: null,
      });
    },
  });

  const result = await service.loadProfile("user-1");
  assert.equal(result.ok, false);
  assert.equal(result.code, "INCOMPLETE_ONBOARDING_DATA");
});

test("turns thrown network failures into safe service outcomes", async () => {
  const service = createProfileService({
    from() {
      throw new Error("network details must not reach the view");
    },
    async rpc() {
      throw new Error("network details must not reach the view");
    },
  });

  assert.equal((await service.loadProfile("user-1")).code, "PROFILE_LOAD_FAILED");
  assert.equal(
    (
      await service.completeOnboarding({
        profile: {},
        target: {},
      })
    ).code,
    "ONBOARDING_SAVE_FAILED",
  );
});

test("maps onboarding to one RPC without sending a user id or eligibility status", async () => {
  let call = null;
  const client = {
    async rpc(name, args) {
      call = { args, name };
      return {
        data: { profile: profileRow, target: targetRow, idempotent: false },
        error: null,
      };
    },
  };
  const service = createProfileService(client);
  const command = {
    profile: {
      displayName: "Test Person",
      dateOfBirth: "1990-01-01",
      sexForEnergyEquation: "female",
      heightCm: 165.25,
      weightKg: 63.5,
      activityCategory: "low_active",
      goalType: "maintain",
      timezoneName: "Asia/Manila",
    },
    target: {
      maintenanceKcal: 2275.37,
      targetKcal: 2275.37,
      methodology: "nasem-dri-energy-2023-eer",
      methodologyVersion: "1.0.0",
      activityCategory: "low_active",
      inputSnapshot: { ageYears: 36 },
      assumptions: [],
      warnings: [],
    },
  };

  const result = await service.completeOnboarding(command);
  assert.equal(result.ok, true);
  assert.equal(call.name, "complete_profile_onboarding");
  assert.equal(call.args.p_display_name, "Test Person");
  assert.equal("user_id" in call.args, false);
  assert.equal("lifeStageEligibilityConfirmed" in call.args, false);
});
