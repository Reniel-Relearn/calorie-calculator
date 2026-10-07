const PROFILE_FIELD_IDS = Object.freeze({
  activityCategory: "settings-activity-inactive",
  dateOfBirth: "settings-date-of-birth",
  displayName: "settings-display-name",
  goalType: "settings-goal-maintain",
  heightCm: "settings-height-cm",
  lifeStageEligibilityConfirmed: "settings-life-stage-confirmation",
  sexForEnergyEquation: "settings-equation-sex-female",
  timezoneName: "settings-timezone",
  weightKg: "settings-weight-kg",
});

const DELETE_FIELD_IDS = Object.freeze({
  confirmation: "settings-delete-confirmation",
  currentPassword: "settings-current-password",
});

function requiredElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required settings element: #${id}`);
  return element;
}

function formValues(form) {
  const data = new FormData(form);
  return {
    activityCategory: data.get("activityCategory"),
    dateOfBirth: data.get("dateOfBirth"),
    displayName: data.get("displayName"),
    goalType: data.get("goalType"),
    heightCm: data.get("heightCm"),
    lifeStageEligibilityConfirmed: data.has("lifeStageEligibilityConfirmed"),
    sexForEnergyEquation: data.get("sexForEnergyEquation"),
    timezoneName: data.get("timezoneName"),
    weightKg: data.get("weightKg"),
  };
}

function setRadio(form, name, value) {
  const field = form.querySelector(`[name="${name}"][value="${value}"]`);
  if (field) field.checked = true;
}

export function createSettingsView(handlers) {
  const elements = {
    close: requiredElement("settings-close"),
    deleteConfirmation: requiredElement("settings-delete-confirmation"),
    deleteError: requiredElement("settings-delete-error"),
    deleteForm: requiredElement("settings-delete-form"),
    deletePassword: requiredElement("settings-current-password"),
    deleteSubmit: requiredElement("settings-delete-submit"),
    heading: requiredElement("settings-heading"),
    open: requiredElement("settings-open"),
    panel: requiredElement("settings-panel"),
    profileError: requiredElement("settings-profile-error"),
    profileForm: requiredElement("settings-profile-form"),
    profileSubmit: requiredElement("settings-profile-submit"),
  };

  function clearErrors(errorElement, form) {
    errorElement.hidden = true;
    errorElement.textContent = "";
    for (const field of form.elements) {
      if (field instanceof HTMLElement) field.removeAttribute("aria-invalid");
    }
  }

  function showErrors(errorElement, errors, firstField, ids) {
    errorElement.textContent = Object.values(errors).join(" ");
    errorElement.hidden = false;
    for (const name of Object.keys(errors)) {
      requiredElement(ids[name]).setAttribute("aria-invalid", "true");
    }
    requiredElement(ids[firstField]).focus();
  }

  elements.open.addEventListener("click", handlers.onOpen);
  elements.close.addEventListener("click", handlers.onClose);
  elements.profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onSubmit(formValues(event.currentTarget));
  });
  elements.deleteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    handlers.onDeleteAccount({
      confirmation: data.get("confirmation"),
      currentPassword: data.get("currentPassword"),
    });
  });

  return Object.freeze({
    clearDeleteErrors: () => clearErrors(elements.deleteError, elements.deleteForm),
    clearProfileErrors: () =>
      clearErrors(elements.profileError, elements.profileForm),
    close() {
      elements.panel.hidden = true;
      elements.open.setAttribute("aria-expanded", "false");
      elements.open.focus();
    },
    open(profile) {
      this.setProfile(profile);
      elements.panel.hidden = false;
      elements.open.setAttribute("aria-expanded", "true");
      requestAnimationFrame(() => elements.heading.focus());
    },
    reset() {
      elements.panel.hidden = true;
      elements.open.setAttribute("aria-expanded", "false");
      elements.profileForm.reset();
      elements.deleteForm.reset();
      this.clearProfileErrors();
      this.clearDeleteErrors();
    },
    setDeleteBusy(isBusy) {
      for (const field of elements.deleteForm.elements) field.disabled = isBusy;
      elements.deleteSubmit.setAttribute("aria-busy", String(isBusy));
      elements.deleteSubmit.textContent = isBusy
        ? "Deleting account…"
        : "Permanently Delete Account";
    },
    setProfile(profile) {
      if (!profile) return;
      elements.profileForm.elements.displayName.value = profile.displayName;
      elements.profileForm.elements.dateOfBirth.value = profile.dateOfBirth;
      elements.profileForm.elements.heightCm.value = profile.heightCm;
      elements.profileForm.elements.weightKg.value = profile.weightKg;
      elements.profileForm.elements.timezoneName.value = profile.timezoneName;
      elements.profileForm.elements.lifeStageEligibilityConfirmed.checked = false;
      setRadio(
        elements.profileForm,
        "sexForEnergyEquation",
        profile.sexForEnergyEquation,
      );
      setRadio(
        elements.profileForm,
        "activityCategory",
        profile.activityCategory,
      );
      setRadio(elements.profileForm, "goalType", profile.goalType);
    },
    setProfileBusy(isBusy) {
      for (const field of elements.profileForm.elements) field.disabled = isBusy;
      elements.profileSubmit.setAttribute("aria-busy", String(isBusy));
      elements.profileSubmit.textContent = isBusy ? "Saving…" : "Save Settings";
    },
    showDeleteError(message) {
      elements.deleteError.textContent = message;
      elements.deleteError.hidden = false;
      elements.deleteError.focus();
    },
    showDeleteErrors(errors, firstField) {
      showErrors(
        elements.deleteError,
        errors,
        firstField,
        DELETE_FIELD_IDS,
      );
    },
    showProfileError(message) {
      elements.profileError.textContent = message;
      elements.profileError.hidden = false;
      elements.profileError.focus();
    },
    showProfileErrors(errors, firstField) {
      showErrors(
        elements.profileError,
        errors,
        firstField,
        PROFILE_FIELD_IDS,
      );
    },
  });
}
