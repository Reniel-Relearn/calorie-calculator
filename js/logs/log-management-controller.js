import {
  createFoodLogEditCommand,
  getFoodLogLocalFields,
} from "./food-log-editor.js";

export function createLogManagementController({
  service,
  view,
  onChanged = () => {},
}) {
  let selectedLog = null;
  let pending = false;

  function edit(log) {
    if (pending) return;
    const localFields = getFoodLogLocalFields(log);
    if (!localFields) {
      view.showPageMessage("This entry's saved date and time cannot be edited safely.");
      return;
    }
    selectedLog = log;
    view.openEdit(log, localFields);
  }

  async function submitEdit(values) {
    if (!selectedLog || pending) return;
    view.clearEditError();
    const mapped = createFoodLogEditCommand(selectedLog, values);
    if (!mapped.ok) {
      view.showEditError(mapped.message);
      return;
    }

    pending = true;
    view.setEditBusy(true);
    try {
      const result = await service.update(mapped.command);
      if (!result.ok) {
        view.showEditError(
          result.code === "SESSION_REQUIRED"
            ? "Your session has ended. Log in again before editing this entry."
            : "We couldn't update this entry. Nothing was partially saved.",
        );
        return;
      }

      const previousLocalDate = result.previousLocalDate;
      selectedLog = null;
      view.closeEdit();
      view.showPageMessage("Food entry updated.");
      onChanged({
        type: "updated",
        localDate: result.log.localDate,
        previousLocalDate,
      });
    } finally {
      pending = false;
      view.setEditBusy(false);
    }
  }

  function requestDelete(log) {
    if (pending) return;
    selectedLog = log;
    view.openDelete(log);
  }

  async function confirmDelete() {
    if (!selectedLog || pending) return;
    pending = true;
    view.setDeleteBusy(true);
    try {
      const result = await service.delete(selectedLog.id);
      if (!result.ok) {
        view.showDeleteError(
          result.code === "SESSION_REQUIRED"
            ? "Your session has ended. Log in again before deleting this entry."
            : "We couldn't delete this entry. Try again.",
        );
        return;
      }

      const localDate = result.localDate;
      selectedLog = null;
      view.closeDelete();
      view.showPageMessage("Food entry deleted.");
      onChanged({ type: "deleted", localDate, previousLocalDate: localDate });
    } finally {
      pending = false;
      view.setDeleteBusy(false);
    }
  }

  return Object.freeze({
    cancelDelete() {
      if (pending) return;
      selectedLog = null;
      view.closeDelete();
    },
    cancelEdit() {
      if (pending) return;
      selectedLog = null;
      view.closeEdit();
    },
    confirmDelete,
    edit,
    requestDelete,
    reset() {
      selectedLog = null;
      pending = false;
      view.reset();
    },
    submitEdit,
  });
}
