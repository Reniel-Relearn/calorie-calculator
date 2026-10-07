import {
  calculateEnergyTarget,
  ENERGY_TARGET_STATUSES,
} from "../targets/energy-target.js";
import {
  getBrowserTimeZone,
  validateProfileInput,
} from "./profile-validation.js";
import { createProfileTargetCommand } from "./profile-target-command.js";

export function createProfileController({
  service,
  view,
  calculateTarget = calculateEnergyTarget,
  now = () => new Date(),
  suggestTimeZone = getBrowserTimeZone,
  onProfileReady = () => {},
  onProfileUnavailable = () => {},
}) {
  let activeUser = null;
  let activationToken = 0;
  let saving = false;

  async function activate(user, options = {}) {
    const token = ++activationToken;
    activeUser = user;
    onProfileUnavailable();
    view.showLoading({ focus: options.focus !== false });

    let result;
    try {
      result = await service.loadProfile(user.id);
    } catch {
      result = { ok: false };
    }
    if (token !== activationToken || activeUser?.id !== user.id) return;

    if (!result.ok) {
      view.showLoadError();
      return;
    }

    if (!result.complete) {
      view.showOnboarding({
        focus: options.focus !== false,
        timezoneName: suggestTimeZone(),
      });
      return;
    }

    onProfileReady(result.profile, result.target);
    view.showHome(result.profile, result.target, {
      announcement: options.announcement,
      focus: options.focus !== false,
    });
  }

  async function submit(values) {
    if (saving || !activeUser) return;
    view.clearErrors();

    const validation = validateProfileInput(values, { now: now() });
    if (!validation.ok) {
      view.showValidationErrors(validation.errors, validation.firstField);
      return;
    }

    const targetResult = calculateTarget(validation.targetInput);
    if (targetResult.status !== ENERGY_TARGET_STATUSES.SUCCESS) {
      view.showTargetOutcome(targetResult);
      return;
    }

    saving = true;
    view.setBusy(true);
    const userId = activeUser.id;

    try {
      let result;
      try {
        result = await service.completeOnboarding(
          createProfileTargetCommand(validation.profile, targetResult),
        );
      } catch {
        result = { ok: false };
      }

      if (!activeUser || activeUser.id !== userId) return;
      if (!result.ok) {
        view.showSaveError();
        return;
      }

      onProfileReady(result.profile, result.target);
      view.showHome(result.profile, result.target, {
        announcement: result.idempotent
          ? "Your profile was already saved."
          : "Profile saved. Your maintenance estimate is ready.",
      });
    } finally {
      saving = false;
      view.setBusy(false);
    }
  }

  function reset() {
    activationToken += 1;
    activeUser = null;
    saving = false;
    onProfileUnavailable();
    view.reset();
  }

  return Object.freeze({
    activate,
    refresh: (options = {}) =>
      activeUser ? activate(activeUser, options) : undefined,
    reset,
    retry: () => (activeUser ? activate(activeUser) : undefined),
    submit,
  });
}
