const supportedScreens = new Set([
  "today",
  "analyze",
  "week",
  "settings",
  "auth",
  "onboarding",
  "states",
]);

const body = document.body;
const main = document.querySelector("#prototype-main");
const screens = [...document.querySelectorAll("[data-screen]")];
const routeLinks = [...document.querySelectorAll("[data-route]")];
const announcer = document.querySelector("[data-announcer]");
const focusedScreens = new Set(["auth", "onboarding"]);

function announce(message) {
  announcer.textContent = "";
  window.requestAnimationFrame(() => {
    announcer.textContent = message;
  });
}

function screenFromUrl() {
  const candidate = new URL(window.location.href).searchParams.get("screen");
  return supportedScreens.has(candidate) ? candidate : "today";
}

function showScreen(name, { push = true, focus = true } = {}) {
  const nextScreen = supportedScreens.has(name) ? name : "today";

  screens.forEach((screen) => {
    screen.hidden = screen.dataset.screen !== nextScreen;
  });

  routeLinks.forEach((link) => {
    if (link.closest(".primary-nav")) {
      link.toggleAttribute("aria-current", link.dataset.route === nextScreen);
      if (link.dataset.route === nextScreen) link.setAttribute("aria-current", "page");
    }
  });

  body.dataset.mode = focusedScreens.has(nextScreen) ? "focused" : "app";

  if (push) {
    const url = new URL(window.location.href);
    url.searchParams.set("screen", nextScreen);
    window.history.pushState({ screen: nextScreen }, "", url);
  }

  if (focus) {
    window.scrollTo({ top: 0, behavior: "instant" });
    main.focus({ preventScroll: true });
  }

  announce(`${nextScreen} prototype screen opened.`);
}

function showDestination(name) {
  showScreen(name);
  if (name === "today") showTodayState("populated");
  if (name === "week") showWeekState("populated");
  if (name === "analyze") {
    showAnalyzeState("intro");
    showLogState("ready");
  }
  if (name === "auth") showAuthPanel("login");
  if (name === "settings") showFeedbackState("[data-settings-feedback]", "none");
}

routeLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showDestination(link.dataset.route);
  });
});

document.querySelectorAll("[data-route-button]").forEach((button) => {
  button.addEventListener("click", () => showDestination(button.dataset.routeButton));
});

window.addEventListener("popstate", () => showScreen(screenFromUrl(), { push: false }));

document.querySelectorAll("[data-open-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(`#${button.dataset.openDialog}`);
    const parentDialog = button.closest("dialog");
    if (parentDialog?.open) parentDialog.close();
    if (target?.id === "edit-dialog") showFeedbackState("[data-edit-feedback]", "none");
    if (target?.id === "delete-dialog") showFeedbackState("[data-delete-feedback]", "none");
    if (target?.id === "account-dialog") showFeedbackState("[data-account-feedback]", "none");
    target?.showModal();
  });
});

document.querySelectorAll("[data-preview-screen]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#preview-dialog")?.close();
    showScreen(button.dataset.previewScreen);
    if (button.dataset.previewScreen === "onboarding") {
      onboardingStep = 1;
      renderOnboardingStep();
      showFeedbackState("[data-onboarding-feedback]", "none");
    }
    if (button.dataset.previewScreen === "settings") {
      showFeedbackState("[data-settings-feedback]", "none");
    }
  });
});

const authPanels = [...document.querySelectorAll("[data-auth-panel]")];

function showAuthPanel(name) {
  authPanels.forEach((panel) => {
    panel.hidden = panel.dataset.authPanel !== name;
  });
  const active = authPanels.find((panel) => panel.dataset.authPanel === name);
  const heading = active?.querySelector("h1");
  heading?.setAttribute("tabindex", "-1");
  heading?.focus();
  announce(`${heading?.textContent ?? "Account"} prototype view opened.`);
}

document.querySelectorAll("[data-auth-view]").forEach((button) => {
  button.addEventListener("click", () => showAuthPanel(button.dataset.authView));
});

document.querySelectorAll("[data-preview-auth]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#preview-dialog")?.close();
    showScreen("auth");
    showAuthPanel(button.dataset.previewAuth);
  });
});

const analyzeForm = document.querySelector("#analyze-form");
const foodQuery = document.querySelector("#food-query");
const analyzeStates = [...document.querySelectorAll("[data-analyze-state]")];

function showAnalyzeState(name) {
  analyzeStates.forEach((state) => {
    state.hidden = state.dataset.analyzeState !== name;
  });
  const active = analyzeStates.find((state) => state.dataset.analyzeState === name);
  active?.scrollIntoView({ behavior: "smooth", block: "start" });
}

analyzeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = foodQuery.value.trim().toLowerCase();

  if (!query) {
    foodQuery.setAttribute("aria-invalid", "true");
    foodQuery.focus();
    announce("Enter a food and amount before analyzing.");
    return;
  }

  foodQuery.removeAttribute("aria-invalid");
  showAnalyzeState("analyzing");
  announce("Analyzing the food and serving amount.");

  window.setTimeout(() => {
    if (/^\s*(?:0|-\d)/.test(query)) {
      showAnalyzeState("invalid");
      announce("The serving amount must be positive.");
      return;
    }

    if (query.includes("grilled chicken breast") && !/\d/.test(query)) {
      showAnalyzeState("needs-amount");
      announce("Grilled Chicken Breast found. A serving amount is required.");
      return;
    }

    if (query.includes("grilled chicken breast") && /\d/.test(query)) {
      document.querySelector("[data-result-food]").textContent = "Grilled Chicken Breast";
      showAnalyzeState("result");
      showLogState("ready");
      announce("Food result ready for Grilled Chicken Breast.");
      return;
    }

    if (query.includes("chicken")) {
      showAnalyzeState("matches");
      announce("Three preparation-specific chicken matches found.");
      return;
    }

    showAnalyzeState("not-found");
    announce("Food not found in the demo dataset.");
  }, 450);
});

document.querySelectorAll("[data-select-match]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("[data-result-food]").textContent = button.dataset.selectMatch;
    showAnalyzeState("result");
    showLogState("ready");
    announce(`${button.dataset.selectMatch} selected.`);
  });
});

document.querySelectorAll("[data-edit-search]").forEach((button) => {
  button.addEventListener("click", () => {
    showAnalyzeState("intro");
    foodQuery.focus();
  });
});

document.querySelectorAll("[data-preview-analyze]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#preview-dialog")?.close();
    showScreen("analyze");
    showAnalyzeState(button.dataset.previewAnalyze);
  });
});

const servingInput = document.querySelector("#serving-amount");
const resultAmount = document.querySelector("[data-result-amount]");
const resultCalories = document.querySelector("[data-result-calories]");

function updatePrototypeServing(value) {
  const amount = Math.max(10, Number(value) || 10);
  servingInput.value = String(amount);
  resultAmount.textContent = `${amount} g`;
  resultCalories.textContent = String(Math.round((248 / 150) * amount));
}

document.querySelectorAll("[data-serving-change]").forEach((button) => {
  button.addEventListener("click", () => {
    updatePrototypeServing(Number(servingInput.value) + Number(button.dataset.servingChange));
  });
});
servingInput.addEventListener("change", () => updatePrototypeServing(servingInput.value));

const addLogButton = document.querySelector("[data-add-log]");
const logStates = [...document.querySelectorAll("[data-log-state]")];

function showLogState(name) {
  logStates.forEach((state) => {
    state.hidden = state.dataset.logState !== name;
  });
  const isPendingOrSaved = name === "saving" || name === "saved";
  addLogButton.disabled = isPendingOrSaved;
  addLogButton.textContent = name === "saved" ? "Added to today’s log" : "Add to today’s log";
}

function demonstrateLogSave() {
  showLogState("saving");
  announce("Adding the food to today’s log.");
  window.setTimeout(() => {
    showLogState("saved");
    announce("Added to today’s log in the prototype. No data was saved.");
  }, 600);
}

addLogButton.addEventListener("click", demonstrateLogSave);
document.querySelector("[data-log-retry]").addEventListener("click", demonstrateLogSave);

document.querySelectorAll("[data-preview-log]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#preview-dialog")?.close();
    showScreen("analyze");
    showAnalyzeState("result");
    showLogState(button.dataset.previewLog);
  });
});

document.querySelector("#auth-form").addEventListener("submit", (event) => {
  event.preventDefault();
  showScreen("today");
  announce("Prototype login complete. No account request was sent.");
});

document.querySelectorAll("[data-demo-submit]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    showAuthPanel(form.dataset.demoSubmit);
  });
});

let onboardingStep = 1;
const onboardingSections = [...document.querySelectorAll("[data-onboarding-step]")];
const stepCurrent = document.querySelector("[data-step-current]");
const stepProgress = document.querySelector("[data-step-progress]");
const stepBack = document.querySelector("[data-step-back]");
const stepNext = document.querySelector("[data-step-next]");
const profileHeight = document.querySelector("[data-profile-height]");
const profileWeight = document.querySelector("[data-profile-weight]");
const goalWeight = document.querySelector("[data-goal-weight]");
const goalDate = document.querySelector("[data-goal-date]");
const goalInputs = document.querySelector("[data-goal-inputs]");

const goalPrototypeContent = {
  maintain: {
    label: "Maintain Weight",
    heading: "Your estimated maintenance target",
    calories: "2,050",
    method: "National Academies 2023 EER",
    note: "Maintenance uses the currently approved estimate in the production product. BMI remains context only and does not set the calorie target.",
  },
  lose: {
    label: "Lose Weight",
    heading: "Your Lose Weight planning estimate",
    calories: "1,750",
    method: "Pending scientific validation",
    note: "This screen demonstrates the intended Lose Weight experience. The 1,750 kcal value is sample design content, not a production recommendation. Production must use an independently validated weight-change method.",
  },
  gain: {
    label: "Gain Weight",
    heading: "Your Gain Weight planning estimate",
    calories: "2,300",
    method: "Pending scientific validation",
    note: "This screen demonstrates the intended Gain Weight experience. The 2,300 kcal value is sample design content, not a production recommendation. Production must use an independently validated weight-change method.",
  },
};

function selectedGoal() {
  return document.querySelector("[data-goal-option]:checked")?.value ?? "maintain";
}

function calculateBmi(weightKg, heightCm) {
  const heightMeters = Number(heightCm) / 100;
  const weight = Number(weightKg);
  if (!Number.isFinite(heightMeters) || heightMeters <= 0 || !Number.isFinite(weight) || weight <= 0) return null;
  return weight / (heightMeters ** 2);
}

function formatBmi(value) {
  return Number.isFinite(value) ? value.toFixed(1) : "—";
}

function formatPrototypeDate(value) {
  if (!value) return "Not selected";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Not selected";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function updateGoalPrototype() {
  const goal = selectedGoal();
  const content = goalPrototypeContent[goal];
  const currentWeight = Number(profileWeight.value);
  const selectedGoalWeight = goal === "maintain" ? currentWeight : Number(goalWeight.value);
  const currentBmi = calculateBmi(currentWeight, profileHeight.value);
  const targetBmi = calculateBmi(selectedGoalWeight, profileHeight.value);

  goalInputs.hidden = goal === "maintain";
  document.querySelector("[data-current-bmi]").textContent = formatBmi(currentBmi);
  document.querySelector("[data-goal-bmi]").textContent = formatBmi(targetBmi);
  document.querySelector("[data-review-heading]").textContent = content.heading;
  document.querySelector("[data-review-calories]").textContent = content.calories;
  document.querySelector("[data-review-goal]").textContent = content.label;
  document.querySelector("[data-review-weight]").textContent = goal === "maintain"
    ? `${currentWeight || "—"} kg (maintain)`
    : `${currentWeight || "—"} kg → ${selectedGoalWeight || "—"} kg`;
  document.querySelector("[data-review-bmi]").textContent = goal === "maintain"
    ? formatBmi(currentBmi)
    : `${formatBmi(currentBmi)} → ${formatBmi(targetBmi)}`;
  document.querySelector("[data-review-date]").textContent = goal === "maintain" ? "Not required" : formatPrototypeDate(goalDate.value);
  document.querySelector("[data-review-method]").textContent = content.method;
  document.querySelector("[data-review-note]").textContent = content.note;
}

document.querySelectorAll("[data-goal-option]").forEach((input) => input.addEventListener("change", updateGoalPrototype));
[profileHeight, profileWeight, goalWeight, goalDate].forEach((input) => input.addEventListener("input", updateGoalPrototype));

function renderOnboardingStep() {
  updateGoalPrototype();
  onboardingSections.forEach((section) => {
    section.hidden = Number(section.dataset.onboardingStep) !== onboardingStep;
  });
  stepCurrent.textContent = String(onboardingStep);
  stepProgress.style.width = `${onboardingStep * 20}%`;
  stepBack.disabled = onboardingStep === 1;
  stepNext.textContent = onboardingStep === 5 ? "Complete onboarding" : "Continue";
  const heading = onboardingSections[onboardingStep - 1].querySelector("h1");
  heading.setAttribute("tabindex", "-1");
  heading.focus();
  announce(`Onboarding step ${onboardingStep} of 5: ${heading.textContent}.`);
}

updateGoalPrototype();

stepBack.addEventListener("click", () => {
  if (onboardingStep > 1) {
    onboardingStep -= 1;
    renderOnboardingStep();
  }
});

stepNext.addEventListener("click", () => {
  if (onboardingStep < 5) {
    onboardingStep += 1;
    renderOnboardingStep();
  } else {
    showScreen("today");
    announce("Prototype onboarding complete. No profile data was saved.");
  }
});

document.querySelectorAll("[data-week-change]").forEach((button) => {
  button.addEventListener("click", () => {
    const weekLabel = document.querySelector("[data-week-label]");
    const isPrevious = button.dataset.weekChange === "previous";
    weekLabel.textContent = isPrevious ? "Oct 20 – Oct 26" : "Oct 27 – Nov 2";
    document.querySelector('[data-week-change="previous"]').disabled = isPrevious;
    document.querySelector('[data-week-change="next"]').disabled = !isPrevious;
    announce(`Showing week ${weekLabel.textContent}. Sample values remain unchanged in this visual prototype.`);
  });
});

const weekStatePanels = [...document.querySelectorAll("[data-week-state-panel]")];

function showWeekState(name) {
  weekStatePanels.forEach((panel) => {
    panel.hidden = panel.dataset.weekStatePanel !== name;
  });
  announce(`${name.replace("-", " ")} week prototype state opened.`);
}

document.querySelectorAll("[data-preview-week]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#preview-dialog")?.close();
    showScreen("week");
    showWeekState(button.dataset.previewWeek);
  });
});

const todayStatePanels = [...document.querySelectorAll("[data-today-state-panel]")];

function showTodayState(name) {
  todayStatePanels.forEach((panel) => {
    panel.hidden = panel.dataset.todayStatePanel !== name;
  });
  announce(`${name.replace("-", " ")} Today prototype state opened.`);
}

document.querySelectorAll("[data-preview-today]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#preview-dialog")?.close();
    showScreen("today");
    showTodayState(button.dataset.previewToday);
  });
});

function showFeedbackState(selector, name) {
  document.querySelectorAll(selector).forEach((panel) => {
    const stateName = panel.dataset.onboardingFeedback
      ?? panel.dataset.settingsFeedback
      ?? panel.dataset.editFeedback
      ?? panel.dataset.deleteFeedback
      ?? panel.dataset.accountFeedback;
    panel.hidden = stateName !== name;
  });
}

document.querySelectorAll("[data-preview-onboarding]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#preview-dialog")?.close();
    showScreen("onboarding");
    onboardingStep = button.dataset.previewOnboarding === "validation" ? 1 : 5;
    renderOnboardingStep();
    showFeedbackState("[data-onboarding-feedback]", button.dataset.previewOnboarding);
  });
});

document.querySelectorAll("[data-preview-settings]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#preview-dialog")?.close();
    showScreen("settings");
    showFeedbackState("[data-settings-feedback]", button.dataset.previewSettings);
  });
});

function openFeedbackDialog(dialogId, selector, stateName) {
  document.querySelector("#preview-dialog")?.close();
  showFeedbackState(selector, stateName);
  document.querySelector(dialogId)?.showModal();
}

document.querySelectorAll("[data-preview-delete]").forEach((button) => {
  button.addEventListener("click", () => openFeedbackDialog("#delete-dialog", "[data-delete-feedback]", button.dataset.previewDelete));
});

document.querySelectorAll("[data-preview-edit]").forEach((button) => {
  button.addEventListener("click", () => openFeedbackDialog("#edit-dialog", "[data-edit-feedback]", button.dataset.previewEdit));
});

document.querySelectorAll("[data-preview-account]").forEach((button) => {
  button.addEventListener("click", () => openFeedbackDialog("#account-dialog", "[data-account-feedback]", button.dataset.previewAccount));
});

let reviewingPreviousDay = false;
document.querySelectorAll("[data-today-change]").forEach((button) => {
  button.addEventListener("click", () => {
    reviewingPreviousDay = button.dataset.todayChange === "previous";
    document.querySelector("[data-today-date]").textContent = reviewingPreviousDay ? "Previous day" : "Today";
    document.querySelector("[data-today-full-date]").textContent = reviewingPreviousDay ? "Saturday, November 1" : "Sunday, November 2";
    document.querySelector('[data-today-change="previous"]').disabled = reviewingPreviousDay;
    document.querySelector('[data-today-change="next"]').disabled = !reviewingPreviousDay;
    announce(`Showing ${document.querySelector("[data-today-full-date]").textContent}. Sample values remain unchanged in this visual prototype.`);
  });
});

showScreen(screenFromUrl(), { push: false, focus: false });
