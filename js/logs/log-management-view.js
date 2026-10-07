import { formatLoggedServing } from "../dashboard/daily-view.js";

function requiredElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required log-management element: #${id}`);
  return element;
}

function openDialog(dialog) {
  if (!dialog.open) dialog.showModal();
}

function closeDialog(dialog) {
  if (dialog.open) dialog.close();
}

export function createLogManagementView(handlers) {
  const elements = {
    announcement: requiredElement("log-management-announcement"),
    deleteCancel: requiredElement("log-delete-cancel"),
    deleteConfirm: requiredElement("log-delete-confirm"),
    deleteDialog: requiredElement("log-delete-dialog"),
    deleteError: requiredElement("log-delete-error"),
    deleteName: requiredElement("log-delete-name"),
    editCancel: requiredElement("log-edit-cancel"),
    editDate: requiredElement("log-edit-date"),
    editDialog: requiredElement("log-edit-dialog"),
    editError: requiredElement("log-edit-error"),
    editForm: requiredElement("log-edit-form"),
    editName: requiredElement("log-edit-name"),
    editQuantity: requiredElement("log-edit-quantity"),
    editServing: requiredElement("log-edit-serving"),
    editSubmit: requiredElement("log-edit-submit"),
    editTime: requiredElement("log-edit-time"),
  };

  elements.editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onSubmitEdit({
      localDate: elements.editDate.value,
      localTime: elements.editTime.value,
      quantity: elements.editQuantity.value,
    });
  });
  elements.editCancel.addEventListener("click", handlers.onCancelEdit);
  elements.deleteCancel.addEventListener("click", handlers.onCancelDelete);
  elements.deleteConfirm.addEventListener("click", handlers.onConfirmDelete);
  elements.editDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    handlers.onCancelEdit();
  });
  elements.deleteDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    handlers.onCancelDelete();
  });

  return Object.freeze({
    clearEditError() {
      elements.editError.hidden = true;
      elements.editError.textContent = "";
    },
    closeDelete: () => closeDialog(elements.deleteDialog),
    closeEdit: () => closeDialog(elements.editDialog),
    openDelete(log) {
      elements.deleteError.hidden = true;
      elements.deleteError.textContent = "";
      elements.deleteName.textContent = log.foodNameSnapshot;
      openDialog(elements.deleteDialog);
      requestAnimationFrame(() => elements.deleteCancel.focus());
    },
    openEdit(log, localFields) {
      this.clearEditError();
      elements.editName.textContent = log.foodNameSnapshot;
      elements.editServing.textContent = `Saved serving basis: ${formatLoggedServing(log)}. The unit and source snapshot stay fixed.`;
      elements.editQuantity.value = String(log.enteredQuantity);
      elements.editDate.value = localFields.localDate;
      elements.editTime.value = localFields.localTime;
      openDialog(elements.editDialog);
      requestAnimationFrame(() => elements.editQuantity.focus());
    },
    reset() {
      closeDialog(elements.editDialog);
      closeDialog(elements.deleteDialog);
      elements.announcement.textContent = "";
    },
    setDeleteBusy(isBusy) {
      elements.deleteCancel.disabled = isBusy;
      elements.deleteConfirm.disabled = isBusy;
      elements.deleteConfirm.setAttribute("aria-busy", String(isBusy));
      elements.deleteConfirm.textContent = isBusy ? "Deleting…" : "Delete Entry";
    },
    setEditBusy(isBusy) {
      for (const field of elements.editForm.elements) field.disabled = isBusy;
      elements.editSubmit.setAttribute("aria-busy", String(isBusy));
      elements.editSubmit.textContent = isBusy ? "Saving…" : "Save Changes";
    },
    showDeleteError(message) {
      elements.deleteError.textContent = message;
      elements.deleteError.hidden = false;
      elements.deleteError.focus();
    },
    showEditError(message) {
      elements.editError.textContent = message;
      elements.editError.hidden = false;
      elements.editError.focus();
    },
    showPageMessage(message) {
      elements.announcement.textContent = "";
      requestAnimationFrame(() => {
        elements.announcement.textContent = message;
      });
    },
  });
}
