import assert from "node:assert/strict";
import test from "node:test";

import {
  hasTargetAffectingProfileChanges,
  validateAccountDeletion,
} from "../js/settings/settings-validation.js";

const PROFILE = Object.freeze({
  displayName: "Test User",
  dateOfBirth: "1990-01-01",
  sexForEnergyEquation: "female",
  heightCm: 165,
  weightKg: 63,
  activityCategory: "low_active",
  goalType: "maintain",
  timezoneName: "Asia/Manila",
});

test("display-name-only changes do not rotate target history", () => {
  assert.equal(
    hasTargetAffectingProfileChanges(PROFILE, {
      ...PROFILE,
      displayName: "Updated Name",
      heightCm: "165.00",
      weightKg: "63",
    }),
    false,
  );
});

test("each canonical target input and timezone is target-affecting", () => {
  for (const change of [
    { dateOfBirth: "1989-01-01" },
    { sexForEnergyEquation: "male" },
    { heightCm: 166 },
    { weightKg: 64 },
    { activityCategory: "active" },
    { goalType: "lose" },
    { timezoneName: "UTC" },
  ]) {
    assert.equal(
      hasTargetAffectingProfileChanges(PROFILE, { ...PROFILE, ...change }),
      true,
    );
  }
});

test("account deletion requires a password and exact confirmation", () => {
  assert.deepEqual(validateAccountDeletion({}), {
    ok: false,
    errors: {
      currentPassword: "Enter your current password.",
      confirmation: "Type DELETE exactly to confirm account deletion.",
    },
    firstField: "currentPassword",
  });
  assert.equal(
    validateAccountDeletion({
      currentPassword: "secret",
      confirmation: "DELETE",
    }).ok,
    true,
  );
});
