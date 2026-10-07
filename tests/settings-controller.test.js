import assert from "node:assert/strict";
import test from "node:test";

import { createSettingsController } from "../js/settings/settings-controller.js";

const PROFILE = Object.freeze({
  userId: "user-a",
  displayName: "Test User",
  dateOfBirth: "1990-01-01",
  sexForEnergyEquation: "female",
  heightCm: 165,
  weightKg: 63,
  activityCategory: "low_active",
  goalType: "maintain",
  timezoneName: "Asia/Manila",
});
const TARGET = Object.freeze({ id: "target-a", targetKcal: 2000 });

function values(overrides = {}) {
  return {
    ...PROFILE,
    lifeStageEligibilityConfirmed: false,
    ...overrides,
  };
}

function fakeView() {
  const calls = [];
  return {
    calls,
    clearDeleteErrors: () => calls.push(["clearDeleteErrors"]),
    clearProfileErrors: () => calls.push(["clearProfileErrors"]),
    close: () => calls.push(["close"]),
    open: () => calls.push(["open"]),
    reset: () => calls.push(["reset"]),
    setDeleteBusy: (busy) => calls.push(["setDeleteBusy", busy]),
    setProfile: (profile, target) => calls.push(["setProfile", profile, target]),
    setProfileBusy: (busy) => calls.push(["setProfileBusy", busy]),
    showDeleteError: (message) => calls.push(["showDeleteError", message]),
    showDeleteErrors: (errors, first) =>
      calls.push(["showDeleteErrors", errors, first]),
    showProfileError: (message) => calls.push(["showProfileError", message]),
    showProfileErrors: (errors, first) =>
      calls.push(["showProfileErrors", errors, first]),
  };
}

test("saves a name-only update without replacing the target", async () => {
  const commands = [];
  const saved = [];
  const view = fakeView();
  const controller = createSettingsController({
    service: {
      async updateProfile(command) {
        commands.push(command);
        return {
          ok: true,
          profile: { ...PROFILE, displayName: "Renamed" },
          target: TARGET,
          targetChanged: false,
        };
      },
    },
    view,
    onProfileSaved: (...args) => saved.push(args),
    now: () => new Date("2026-10-07T04:00:00Z"),
  });
  controller.activate(PROFILE, TARGET);
  await controller.submit(values({ displayName: "Renamed" }));

  assert.equal(commands[0].target, null);
  assert.equal(saved[0][2].targetChanged, false);
  assert.equal(view.calls.some(([name]) => name === "close"), true);
});

test("requires eligibility confirmation and creates target metadata for a target change", async () => {
  const commands = [];
  const view = fakeView();
  const controller = createSettingsController({
    service: {
      async updateProfile(command) {
        commands.push(command);
        return {
          ok: true,
          profile: { ...PROFILE, weightKg: 64 },
          target: TARGET,
          targetChanged: true,
        };
      },
    },
    view,
    now: () => new Date("2026-10-07T04:00:00Z"),
  });
  controller.activate(PROFILE, TARGET);
  await controller.submit(values({ weightKg: 64 }));
  assert.equal(commands.length, 0);
  assert.equal(
    view.calls.some(
      ([name, errors]) =>
        name === "showProfileErrors" && errors.lifeStageEligibilityConfirmed,
    ),
    true,
  );

  await controller.submit(
    values({ weightKg: 64, lifeStageEligibilityConfirmed: true }),
  );
  assert.equal(commands.length, 1);
  assert.equal(commands[0].target.methodology, "nasem-dri-energy-2023-eer");
  assert.equal(commands[0].target.inputSnapshot.weightKg, 64);
});

test("deletes only after exact confirmation and reports completion", async () => {
  let deletes = 0;
  let completed = 0;
  const view = fakeView();
  const controller = createSettingsController({
    service: {
      async deleteAccount() {
        deletes += 1;
        return { ok: true };
      },
    },
    view,
    onAccountDeleted: () => {
      completed += 1;
    },
  });
  controller.activate(PROFILE, TARGET);
  await controller.deleteAccount({ currentPassword: "secret", confirmation: "delete" });
  assert.equal(deletes, 0);
  await controller.deleteAccount({ currentPassword: "secret", confirmation: "DELETE" });
  assert.equal(deletes, 1);
  assert.equal(completed, 1);
});
