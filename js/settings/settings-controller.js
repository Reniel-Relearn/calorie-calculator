import {
  calculateEnergyTarget,
  ENERGY_TARGET_STATUSES,
} from "../targets/energy-target.js";
import { createProfileTargetCommand } from "../profile/profile-target-command.js";
import { validateProfileInput } from "../profile/profile-validation.js";
import {
  hasTargetAffectingProfileChanges,
  validateAccountDeletion,
} from "./settings-validation.js";

export function createSettingsController({
  service,
  view,
  calculateTarget = calculateEnergyTarget,
  now = () => new Date(),
  onAccountDeleted = () => {},
  onProfileSaved = () => {},
}) {
  let profile = null;
  let target = null;
  let pending = false;

  async function submit(values) {
    if (!profile || pending) return;
    view.clearProfileErrors();
    const targetChanged = hasTargetAffectingProfileChanges(profile, values);
    const validation = validateProfileInput(values, {
      now: now(),
      requireEligibilityConfirmation: targetChanged,
    });
    if (!validation.ok) {
      view.showProfileErrors(validation.errors, validation.firstField);
      return;
    }

    let nextTarget = null;
    if (targetChanged) {
      const targetResult = calculateTarget(validation.targetInput);
      if (targetResult.status !== ENERGY_TARGET_STATUSES.SUCCESS) {
        view.showProfileError(
          targetResult.message ?? "A maintenance target could not be calculated.",
        );
        return;
      }
      nextTarget = createProfileTargetCommand(
        validation.profile,
        targetResult,
      ).target;
    }

    pending = true;
    view.setProfileBusy(true);
    try {
      const result = await service.updateProfile({
        profile: validation.profile,
        target: nextTarget,
      });
      if (!result.ok) {
        view.showProfileError(
          result.code === "SESSION_REQUIRED"
            ? "Your session has ended. Log in again before saving settings."
            : "We couldn't save your settings. Nothing was partially changed.",
        );
        return;
      }

      profile = result.profile;
      target = result.target;
      view.close();
      onProfileSaved(result.profile, result.target, {
        targetChanged: result.targetChanged,
      });
    } finally {
      pending = false;
      view.setProfileBusy(false);
    }
  }

  async function deleteAccount(values) {
    if (!profile || pending) return;
    view.clearDeleteErrors();
    const validation = validateAccountDeletion(values);
    if (!validation.ok) {
      view.showDeleteErrors(validation.errors, validation.firstField);
      return;
    }

    pending = true;
    view.setDeleteBusy(true);
    try {
      const result = await service.deleteAccount(values);
      if (!result.ok) {
        view.showDeleteError(
          result.code === "ACCOUNT_REAUTHENTICATION_FAILED"
            ? "The current password was not accepted. Your account was not deleted."
            : "We couldn't delete your account. Your account and private data remain available.",
        );
        return;
      }

      profile = null;
      target = null;
      view.reset();
      onAccountDeleted();
    } finally {
      pending = false;
      view.setDeleteBusy(false);
    }
  }

  return Object.freeze({
    activate(nextProfile, nextTarget) {
      profile = nextProfile;
      target = nextTarget;
      view.setProfile(nextProfile, nextTarget);
    },
    close: () => {
      if (!pending) view.close();
    },
    deleteAccount,
    open: () => {
      if (profile && !pending) view.open(profile, target);
    },
    reset() {
      profile = null;
      target = null;
      pending = false;
      view.reset();
    },
    submit,
  });
}
