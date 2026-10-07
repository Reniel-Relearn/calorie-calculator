import { ENERGY_TARGET_CODES } from "../targets/energy-target.js";
import { roundKcalForDisplay } from "../targets/target-format.js";

const ACTIVITY_LABELS = Object.freeze({
  inactive: "Inactive",
  low_active: "Low active",
  active: "Active",
  very_active: "Very active",
});

const FIELD_IDS = Object.freeze({
  displayName: "profile-display-name",
  dateOfBirth: "profile-date-of-birth",
  sexForEnergyEquation: "profile-equation-sex-female",
  heightCm: "profile-height-cm",
  weightKg: "profile-weight-kg",
  activityCategory: "profile-activity-inactive",
  goalType: "profile-goal-maintain",
  timezoneName: "profile-timezone",
  lifeStageEligibilityConfirmed: "profile-life-stage-confirmation",
});

function requiredElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required profile element: #${id}`);
  return element;
}

function formValues(form) {
  const data = new FormData(form);
  return {
    displayName: data.get("displayName"),
    dateOfBirth: data.get("dateOfBirth"),
    sexForEnergyEquation: data.get("sexForEnergyEquation"),
    heightCm: data.get("heightCm"),
    weightKg: data.get("weightKg"),
    activityCategory: data.get("activityCategory"),
    goalType: data.get("goalType"),
    timezoneName: data.get("timezoneName"),
    lifeStageEligibilityConfirmed: data.has("lifeStageEligibilityConfirmed"),
  };
}

function formatEffectiveDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Current target";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

export function createProfileView(handlers) {
  let announcementToken = 0;

  const elements = {
    announcement: requiredElement("profile-announcement"),
    app: requiredElement("app"),
    error: requiredElement("profile-load-error"),
    errorMessage: requiredElement("profile-error-message"),
    errorSummary: requiredElement("profile-form-error"),
    form: requiredElement("profile-onboarding-form"),
    home: requiredElement("profile-home"),
    homeActivity: requiredElement("profile-home-activity"),
    homeEffective: requiredElement("profile-home-effective"),
    homeGreeting: requiredElement("profile-home-greeting"),
    homeMethod: requiredElement("profile-home-method"),
    homeTarget: requiredElement("profile-home-target"),
    loading: requiredElement("profile-loading"),
    onboarding: requiredElement("profile-onboarding"),
    retry: requiredElement("profile-retry"),
    skipApp: requiredElement("skip-app"),
    submit: requiredElement("profile-submit"),
    timezone: requiredElement("profile-timezone"),
  };

  const sections = [
    elements.loading,
    elements.onboarding,
    elements.error,
    elements.home,
  ];

  function announce(message) {
    if (!message) return;
    announcementToken += 1;
    const token = announcementToken;
    elements.announcement.textContent = "";
    requestAnimationFrame(() => {
      if (token === announcementToken) elements.announcement.textContent = message;
    });
  }

  function focusHeading(section) {
    const heading = section.querySelector("h1, h2");
    if (heading) requestAnimationFrame(() => heading.focus());
  }

  function showOnly(section, { focus = true } = {}) {
    for (const candidate of sections) candidate.hidden = candidate !== section;
    elements.app.hidden = section !== elements.home;
    elements.skipApp.hidden = false;

    if (section === elements.home) {
      elements.skipApp.href = "#daily-tracker";
      elements.skipApp.textContent = "Skip to today's summary";
    } else {
      elements.skipApp.href = `#${section.id}`;
      elements.skipApp.textContent = "Skip to profile setup";
    }

    if (focus) focusHeading(section);
  }

  function clearErrors() {
    elements.errorSummary.textContent = "";
    elements.errorSummary.hidden = true;
    elements.errorMessage.textContent = "";
    elements.errorMessage.hidden = true;

    for (const field of elements.form.elements) {
      if (field instanceof HTMLElement) field.removeAttribute("aria-invalid");
    }
  }

  function showValidationErrors(errors, firstField) {
    const messages = Object.values(errors);
    elements.errorSummary.textContent = `Check your profile: ${messages.join(" ")}`;
    elements.errorSummary.hidden = false;

    for (const fieldName of Object.keys(errors)) {
      const field = requiredElement(FIELD_IDS[fieldName]);
      field.setAttribute("aria-invalid", "true");
    }

    requiredElement(FIELD_IDS[firstField]).focus();
  }

  function showTargetOutcome(result) {
    let message = result.message;
    let field = "profile-form-error";

    if (result.code === ENERGY_TARGET_CODES.GOAL_METHOD_UNAVAILABLE) {
      message = "Lose and gain targets are unavailable in Version 2. Choose Maintain.";
      field = FIELD_IDS.goalType;
    } else if (result.code === ENERGY_TARGET_CODES.LIFE_STAGE_NOT_ELIGIBLE) {
      field = FIELD_IDS.lifeStageEligibilityConfirmed;
    } else if (result.code === ENERGY_TARGET_CODES.UNDERAGE) {
      field = FIELD_IDS.dateOfBirth;
    }

    elements.errorSummary.textContent = message;
    elements.errorSummary.hidden = false;
    requiredElement(field).focus();
  }

  function showHome(profile, target, options = {}) {
    elements.homeGreeting.textContent = `Welcome, ${profile.displayName}`;
    elements.homeTarget.textContent = roundKcalForDisplay(target.targetKcal) ?? "—";
    elements.homeActivity.textContent =
      ACTIVITY_LABELS[target.activityCategory] ?? target.activityCategory;
    elements.homeMethod.textContent =
      target.methodology === "nasem-dri-energy-2023-eer"
        ? `National Academies 2023 EER · version ${target.methodologyVersion}`
        : `${target.methodology} · version ${target.methodologyVersion}`;
    elements.homeEffective.textContent = `Effective ${formatEffectiveDate(target.effectiveFrom)}`;
    showOnly(elements.home, options);
    announce(options.announcement ?? "Your profile and maintenance estimate are ready.");
  }

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onSubmit(formValues(event.currentTarget));
  });
  elements.retry.addEventListener("click", handlers.onRetry);

  return Object.freeze({
    clearErrors,
    reset() {
      clearErrors();
      elements.form.reset();
      elements.timezone.value = "";
      elements.app.hidden = true;
      for (const section of sections) section.hidden = true;
    },
    setBusy(isBusy) {
      for (const field of elements.form.elements) field.disabled = isBusy;
      elements.submit.setAttribute("aria-busy", String(isBusy));
      elements.submit.textContent = isBusy
        ? "Saving your profile…"
        : "Save Profile and Calculate";
    },
    showHome,
    showLoadError() {
      showOnly(elements.error);
      announce("We could not load your private profile.");
    },
    showLoading(options = {}) {
      showOnly(elements.loading, options);
    },
    showOnboarding({ focus = true, timezoneName }) {
      clearErrors();
      if (!elements.timezone.value) elements.timezone.value = timezoneName;
      showOnly(elements.onboarding, { focus });
      announce("Complete your private profile to calculate a maintenance estimate.");
    },
    showSaveError() {
      elements.errorMessage.textContent =
        "We couldn't save your profile. Your information was not partially saved. Check your connection and try again.";
      elements.errorMessage.hidden = false;
      elements.errorMessage.focus();
    },
    showTargetOutcome,
    showValidationErrors,
  });
}
