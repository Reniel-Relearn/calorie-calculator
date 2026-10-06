import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateAgeYears,
  getLocalDateInTimeZone,
  isSupportedTimeZone,
  validateProfileInput,
} from "../js/profile/profile-validation.js";

function validInput(overrides = {}) {
  return {
    displayName: "  Test   Person  ",
    dateOfBirth: "2008-10-06",
    sexForEnergyEquation: "female",
    heightCm: "165.25",
    weightKg: "63.5",
    activityCategory: "low_active",
    goalType: "maintain",
    timezoneName: "Asia/Manila",
    lifeStageEligibilityConfirmed: true,
    ...overrides,
  };
}

test("calculates exact age boundaries from calendar birthdays", () => {
  assert.equal(calculateAgeYears("2008-10-06", "2026-10-06"), 18);
  assert.ok(calculateAgeYears("2008-10-07", "2026-10-06") < 18);
  assert.equal(calculateAgeYears("2007-10-06", "2026-10-06"), 19);
  assert.ok(calculateAgeYears("2007-10-05", "2026-10-06") > 19);
});

test("validates and normalizes the minimized canonical profile", () => {
  const result = validateProfileInput(validInput(), {
    asOfDate: "2026-10-06",
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.profile, {
    displayName: "Test Person",
    dateOfBirth: "2008-10-06",
    sexForEnergyEquation: "female",
    heightCm: 165.25,
    weightKg: 63.5,
    activityCategory: "low_active",
    goalType: "maintain",
    timezoneName: "Asia/Manila",
  });
  assert.equal(result.targetInput.ageYears, 18);
  assert.equal(result.targetInput.lifeStageEligibilityConfirmed, true);
  assert.equal("lifeStageEligibilityConfirmed" in result.profile, false);
});

test("rejects underage, unsupported, missing, and noncanonical values", () => {
  const result = validateProfileInput(
    validInput({
      activityCategory: "sometimes",
      dateOfBirth: "2008-10-07",
      displayName: " ",
      goalType: "lose",
      heightCm: "0",
      lifeStageEligibilityConfirmed: false,
      sexForEnergyEquation: "unspecified",
      timezoneName: "Not/A_Timezone",
      weightKg: "Infinity",
    }),
    { asOfDate: "2026-10-06" },
  );

  assert.equal(result.ok, false);
  assert.equal(result.firstField, "displayName");
  assert.deepEqual(Object.keys(result.errors), [
    "displayName",
    "sexForEnergyEquation",
    "heightCm",
    "weightKg",
    "activityCategory",
    "goalType",
    "timezoneName",
    "lifeStageEligibilityConfirmed",
  ]);
});

test("rejects a person one day before their eighteenth birthday", () => {
  const result = validateProfileInput(validInput({ dateOfBirth: "2008-10-07" }), {
    asOfDate: "2026-10-06",
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.dateOfBirth, /age 18/i);
});

test("uses recognized IANA timezones and derives the local calendar date", () => {
  assert.equal(isSupportedTimeZone("Asia/Manila"), true);
  assert.equal(isSupportedTimeZone("Not/A_Timezone"), false);
  assert.equal(
    getLocalDateInTimeZone("Asia/Manila", new Date("2026-10-05T16:30:00Z")),
    "2026-10-06",
  );
  assert.equal(
    getLocalDateInTimeZone("America/Los_Angeles", new Date("2026-10-06T01:00:00Z")),
    "2026-10-05",
  );
});
