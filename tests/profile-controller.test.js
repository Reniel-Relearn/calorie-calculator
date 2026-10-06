import assert from "node:assert/strict";
import test from "node:test";

import { createProfileController } from "../js/profile/profile-controller.js";

function validValues(overrides = {}) {
  return {
    displayName: "Test Person",
    dateOfBirth: "1990-01-01",
    sexForEnergyEquation: "female",
    heightCm: "165",
    weightKg: "63",
    activityCategory: "low_active",
    goalType: "maintain",
    timezoneName: "Asia/Manila",
    lifeStageEligibilityConfirmed: true,
    ...overrides,
  };
}

function fakeView() {
  const calls = [];
  return {
    calls,
    clearErrors() {
      calls.push(["clearErrors"]);
    },
    reset() {
      calls.push(["reset"]);
    },
    setBusy(value) {
      calls.push(["setBusy", value]);
    },
    showHome(profile, target, options) {
      calls.push(["showHome", profile, target, options]);
    },
    showLoadError() {
      calls.push(["showLoadError"]);
    },
    showLoading() {
      calls.push(["showLoading"]);
    },
    showOnboarding(options) {
      calls.push(["showOnboarding", options]);
    },
    showSaveError() {
      calls.push(["showSaveError"]);
    },
    showTargetOutcome(result) {
      calls.push(["showTargetOutcome", result]);
    },
    showValidationErrors(errors, firstField) {
      calls.push(["showValidationErrors", errors, firstField]);
    },
  };
}

test("routes an authenticated user without data to onboarding", async () => {
  const view = fakeView();
  const controller = createProfileController({
    service: {
      async loadProfile() {
        return { ok: true, complete: false };
      },
    },
    view,
    suggestTimeZone: () => "Asia/Manila",
  });

  await controller.activate({ id: "user-1" });
  assert.equal(view.calls[0][0], "showLoading");
  assert.deepEqual(view.calls[1], [
    "showOnboarding",
    { focus: true, timezoneName: "Asia/Manila" },
  ]);
});

test("routes a complete profile to the personalized home", async () => {
  const view = fakeView();
  const profile = { displayName: "Saved Person" };
  const target = { targetKcal: 2000 };
  const controller = createProfileController({
    service: {
      async loadProfile() {
        return { ok: true, complete: true, profile, target };
      },
    },
    view,
  });

  await controller.activate({ id: "user-1" });
  assert.equal(view.calls.at(-1)[0], "showHome");
  assert.equal(view.calls.at(-1)[1], profile);
});

test("persists the profile and target as one command without eligibility status", async () => {
  const view = fakeView();
  let savedCommand = null;
  const profile = { displayName: "Test Person" };
  const target = { targetKcal: 2200 };
  const controller = createProfileController({
    service: {
      async completeOnboarding(command) {
        savedCommand = command;
        return { ok: true, idempotent: false, profile, target };
      },
      async loadProfile() {
        return { ok: true, complete: false };
      },
    },
    view,
    now: () => new Date("2026-10-06T04:00:00Z"),
  });

  await controller.activate({ id: "user-1" });
  await controller.submit(validValues());

  assert.equal(savedCommand.profile.goalType, "maintain");
  assert.equal(savedCommand.target.targetKcal, savedCommand.target.maintenanceKcal);
  assert.equal(
    "lifeStageEligibilityConfirmed" in savedCommand.target.inputSnapshot,
    false,
  );
  assert.equal(
    savedCommand.target.warnings.some(
      (warning) => warning.code === "PREDICTION_UNCERTAINTY",
    ),
    true,
  );
  assert.equal(view.calls.some(([name]) => name === "showHome"), true);
});

test("keeps unsupported goals and excluded life stages out of persistence", async () => {
  const view = fakeView();
  let saves = 0;
  const controller = createProfileController({
    service: {
      async completeOnboarding() {
        saves += 1;
      },
      async loadProfile() {
        return { ok: true, complete: false };
      },
    },
    view,
    now: () => new Date("2026-10-06T04:00:00Z"),
  });

  await controller.activate({ id: "user-1" });
  await controller.submit(validValues({ goalType: "lose" }));
  await controller.submit(validValues({ lifeStageEligibilityConfirmed: false }));

  assert.equal(saves, 0);
  assert.equal(
    view.calls.filter(([name]) => name === "showValidationErrors").length,
    2,
  );
});

test("reports a safe retryable save failure and supports idempotent success", async () => {
  const view = fakeView();
  let attempts = 0;
  const controller = createProfileController({
    service: {
      async completeOnboarding() {
        attempts += 1;
        if (attempts === 1) return { ok: false };
        return {
          ok: true,
          idempotent: true,
          profile: { displayName: "Test Person" },
          target: { targetKcal: 2100 },
        };
      },
      async loadProfile() {
        return { ok: true, complete: false };
      },
    },
    view,
    now: () => new Date("2026-10-06T04:00:00Z"),
  });

  await controller.activate({ id: "user-1" });
  await controller.submit(validValues());
  await controller.submit(validValues());

  assert.equal(view.calls.some(([name]) => name === "showSaveError"), true);
  const homeCall = view.calls.findLast(([name]) => name === "showHome");
  assert.match(homeCall[3].announcement, /already saved/i);
});
