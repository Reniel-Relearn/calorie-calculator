import { createFoodLogCommand } from "./food-log-mapper.js";

function createDefaultRequestId() {
  return globalThis.crypto.randomUUID();
}

export function createFoodLogController({
  service,
  view,
  now = () => new Date(),
  createRequestId = createDefaultRequestId,
  onSaved = () => {},
}) {
  let profile = null;
  let currentResult = null;
  let pendingCommand = null;
  let saving = false;
  let saved = false;

  function activate(nextProfile) {
    profile = nextProfile ?? null;
  }

  function clearResult() {
    currentResult = null;
    pendingCommand = null;
    saving = false;
    saved = false;
    view.resetFoodLogStatus();
  }

  function setResult(result) {
    currentResult = result;
    pendingCommand = null;
    saving = false;
    saved = false;
    view.resetFoodLogStatus();
  }

  async function save() {
    if (saving || saved || !currentResult) return;
    if (!profile) {
      view.showFoodLogError("Complete your profile before saving food.");
      return;
    }

    if (!pendingCommand) {
      const mapped = createFoodLogCommand({
        requestId: createRequestId(),
        profile,
        result: currentResult,
        consumedAt: now(),
      });
      if (!mapped.ok) {
        view.showFoodLogError("This result could not be prepared for saving.");
        return;
      }
      pendingCommand = mapped.command;
    }

    saving = true;
    view.setFoodLogBusy(true);
    try {
      let result;
      try {
        result = await service.create(pendingCommand);
      } catch {
        result = { ok: false, code: "LOG_SAVE_FAILED" };
      }

      if (!result.ok) {
        const message =
          result.code === "SESSION_REQUIRED"
            ? "Your session has ended. Log in again before saving."
            : "We couldn't add this food. Check your connection and try again.";
        view.showFoodLogError(message);
        return;
      }

      saved = true;
      view.showFoodLogSuccess(
        result.idempotent
          ? "This food was already added to today's log."
          : "Added to today's log.",
      );
      onSaved(result.log);
    } finally {
      saving = false;
      view.setFoodLogBusy(false, { saved });
    }
  }

  function reset() {
    profile = null;
    clearResult();
  }

  return Object.freeze({ activate, clearResult, reset, save, setResult });
}
