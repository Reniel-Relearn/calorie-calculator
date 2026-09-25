import { APP_STATES } from "./state.js";

const MISSING_VALUE = "—";

const STATE_ELEMENT_IDS = Object.freeze({
  [APP_STATES.IDLE]: "state-idle",
  [APP_STATES.ANALYZING]: "state-analyzing",
  [APP_STATES.AMBIGUOUS]: "state-ambiguous",
  [APP_STATES.NEEDS_AMOUNT]: "state-needs-amount",
  [APP_STATES.SUCCESS]: "state-success",
  [APP_STATES.NOT_FOUND]: "state-not-found",
  [APP_STATES.INVALID]: "state-invalid",
});

const STATE_ANNOUNCEMENTS = Object.freeze({
  [APP_STATES.IDLE]: "Food search ready.",
  [APP_STATES.ANALYZING]: "Analyzing your food.",
  [APP_STATES.AMBIGUOUS]: "Food match choices available.",
  [APP_STATES.NEEDS_AMOUNT]: "Amount required.",
  [APP_STATES.SUCCESS]: "Nutrition result ready.",
  [APP_STATES.NOT_FOUND]: "Food not found.",
  [APP_STATES.INVALID]: "Validation error.",
});

function getRequiredElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required UI element: #${id}`);
  return element;
}

function formatNumber(value, maximumFractionDigits) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return MISSING_VALUE;
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatQuantity(value) {
  return formatNumber(value, 2);
}

function formatNutrient(value, maximumFractionDigits, unit) {
  const formattedValue = formatNumber(value, maximumFractionDigits);
  return formattedValue === MISSING_VALUE
    ? MISSING_VALUE
    : `${formattedValue} ${unit}`;
}

function formatUnitQuantity(quantity, unit) {
  if (unit === "grams") return `${formatQuantity(quantity)} g`;
  if (unit === "milliliters") return `${formatQuantity(quantity)} mL`;

  const singularUnits = {
    pieces: "piece",
    cups: "cup",
    servings: "serving",
  };
  const label = quantity === 1 ? singularUnits[unit] ?? unit : unit;
  return `${formatQuantity(quantity)} ${label}`;
}

function formatServing(servingInput, food) {
  if (servingInput.servingDescriptor) {
    const descriptor = food.servingDescriptors?.[servingInput.servingDescriptor];
    const descriptorUnit = descriptor?.unit ?? "pieces";
    const unit =
      servingInput.quantity === 1 && descriptorUnit === "pieces"
        ? "piece"
        : descriptorUnit;
    return `${formatQuantity(servingInput.quantity)} ${servingInput.servingDescriptor} ${unit}`;
  }

  return formatUnitQuantity(servingInput.quantity, servingInput.unit);
}

function formatNormalizedServing(conversion) {
  if (conversion.conversionType.startsWith("direct-")) return null;

  const unit = conversion.normalizedUnit === "ml" ? "mL" : "g";
  return `${formatNumber(conversion.normalizedAmount, 1)} ${unit} normalized`;
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function titleCase(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function getServingChoices(food) {
  const choices = [];

  for (const unit of food.supportedUnits) {
    const isDirectUnit =
      (food.measurementBasis === "mass" && unit === "grams") ||
      (food.measurementBasis === "volume" && unit === "milliliters");
    if (!isDirectUnit && !food.servingConversions?.[unit]) continue;

    const labels = {
      grams: "Grams (g)",
      milliliters: "Milliliters (mL)",
    };
    choices.push({
      value: `unit:${unit}`,
      label: labels[unit] ?? titleCase(unit),
    });
  }

  for (const [descriptor, metadata] of Object.entries(
    food.servingDescriptors ?? {},
  )) {
    const unitLabel = metadata.unit === "pieces" ? "piece" : metadata.unit;
    choices.push({
      value: `descriptor:${descriptor}`,
      label: `${titleCase(descriptor)} (${unitLabel})`,
    });
  }

  return choices;
}

function getAdjustmentPresentation(servingInput) {
  if (servingInput.servingDescriptor) {
    return {
      context: "adjusts by 1",
      step: 1,
      unitLabel: servingInput.servingDescriptor,
    };
  }

  const steps = {
    grams: 10,
    milliliters: 10,
    pieces: 1,
    cups: 0.25,
    servings: 1,
  };

  const unitLabels = {
    grams: "g",
    milliliters: "mL",
    cups: servingInput.quantity === 1 ? "cup" : "cups",
    pieces: servingInput.quantity === 1 ? "piece" : "pieces",
    servings: servingInput.quantity === 1 ? "serving" : "servings",
  };

  const step = steps[servingInput.unit] ?? 1;

  return {
    context: `adjusts by ${formatQuantity(step)}`,
    step,
    unitLabel: unitLabels[servingInput.unit] ?? "serving",
  };
}

export function createUI(handlers) {
  let announcementToken = 0;
  const states = Object.fromEntries(
    Object.entries(STATE_ELEMENT_IDS).map(([state, id]) => [
      state,
      getRequiredElement(id),
    ]),
  );

  const elements = {
    app: getRequiredElement("app"),
    stateAnnouncement: getRequiredElement("state-announcement"),
    foodSearchForm: getRequiredElement("food-search-form"),
    foodQuery: getRequiredElement("food-query"),
    foodQueryError: getRequiredElement("food-query-error"),
    analyzeFoodButton: getRequiredElement("analyze-food-button"),
    advancedDetails: document.querySelector(".advanced-input"),
    advancedForm: getRequiredElement("advanced-input-form"),
    advancedFood: getRequiredElement("advanced-food"),
    advancedAmount: getRequiredElement("advanced-amount"),
    advancedUnit: getRequiredElement("advanced-unit"),
    advancedPreparation: getRequiredElement("advanced-preparation"),
    advancedAnalyzeButton: getRequiredElement("advanced-analyze-button"),
    matchList: getRequiredElement("match-list"),
    editAmbiguousSearch: getRequiredElement("edit-ambiguous-search"),
    needsAmountForm: getRequiredElement("needs-amount-form"),
    needsAmountFood: getRequiredElement("needs-amount-food"),
    needsAmountValue: getRequiredElement("needs-amount-value"),
    needsAmountUnit: getRequiredElement("needs-amount-unit"),
    needsAmountError: getRequiredElement("needs-amount-error"),
    resultFoodName: getRequiredElement("result-food-name"),
    resultDescription: getRequiredElement("result-description"),
    resultCalories: getRequiredElement("result-calories"),
    resultServing: getRequiredElement("result-serving"),
    resultNormalizedServing: getRequiredElement("result-normalized-serving"),
    resultProtein: getRequiredElement("result-protein"),
    resultCarbs: getRequiredElement("result-carbs"),
    resultFat: getRequiredElement("result-fat"),
    resultFiber: getRequiredElement("result-fiber"),
    resultSugar: getRequiredElement("result-sugar"),
    resultSodium: getRequiredElement("result-sodium"),
    resultMatchDescription: getRequiredElement("result-match-description"),
    servingAdjustment: getRequiredElement("serving-adjustment"),
    servingAdjustmentContext: getRequiredElement("serving-adjustment-context"),
    servingAdjustmentUnit: getRequiredElement("serving-adjustment-unit"),
    servingAdjustmentError: getRequiredElement("serving-adjustment-error"),
    decreaseServing: getRequiredElement("decrease-serving"),
    increaseServing: getRequiredElement("increase-serving"),
    analyzeAnother: getRequiredElement("analyze-another"),
    changeAmount: getRequiredElement("change-amount"),
    tryAnotherSearch: getRequiredElement("try-another-search"),
    invalidMessage: getRequiredElement("invalid-message"),
    editInvalidSearch: getRequiredElement("edit-invalid-search"),
  };

  function announce(message) {
    const token = ++announcementToken;
    elements.stateAnnouncement.textContent = "";
    queueMicrotask(() => {
      if (token === announcementToken) {
        elements.stateAnnouncement.textContent = message;
      }
    });
  }

  function showState(
    state,
    { focus = true, announceState = true } = {},
  ) {
    for (const section of Object.values(states)) section.hidden = true;
    states[state].hidden = false;
    elements.app.dataset.appState = state;

    if (announceState) announce(STATE_ANNOUNCEMENTS[state]);

    if (!focus) return;

    const focusTargets = {
      [APP_STATES.IDLE]: elements.foodQuery,
      [APP_STATES.AMBIGUOUS]: elements.matchList.querySelector("button"),
      [APP_STATES.NEEDS_AMOUNT]: elements.needsAmountValue,
      [APP_STATES.SUCCESS]: elements.resultFoodName,
      [APP_STATES.NOT_FOUND]: getRequiredElement("not-found-heading"),
      [APP_STATES.INVALID]: getRequiredElement("invalid-heading"),
    };

    focusTargets[state]?.focus();
  }

  function renderAmbiguous(matches) {
    elements.matchList.replaceChildren();

    for (const food of matches) {
      const button = document.createElement("button");
      button.className = "match-card";
      button.type = "button";
      button.dataset.foodId = food.id;

      const marker = document.createElement("span");
      marker.className = "match-card__marker";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = getInitials(food.name);

      const content = document.createElement("span");
      content.className = "match-card__content";

      const name = document.createElement("strong");
      name.textContent = food.name;

      const description = document.createElement("span");
      description.textContent = titleCase(food.preparation);

      const arrow = document.createElement("span");
      arrow.className = "match-card__arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "›";

      content.append(name, description);
      button.append(marker, content, arrow);
      elements.matchList.append(button);
    }

    showState(APP_STATES.AMBIGUOUS);
  }

  function renderNeedsAmount(food) {
    elements.needsAmountFood.textContent = food.name;
    elements.needsAmountValue.value = "";
    clearAmountError();
    elements.needsAmountUnit.replaceChildren();

    for (const choice of getServingChoices(food)) {
      const option = document.createElement("option");
      option.value = choice.value;
      option.textContent = choice.label;
      elements.needsAmountUnit.append(option);
    }

    showState(APP_STATES.NEEDS_AMOUNT);
  }

  function renderSuccess(
    { food, servingInput, conversion, nutritionCalculation },
    { focus = true } = {},
  ) {
    const nutrition = nutritionCalculation.nutrition;
    const adjustment = getAdjustmentPresentation(servingInput);

    elements.resultFoodName.textContent = food.name;
    elements.resultDescription.textContent = food.sourceDescription;
    elements.resultCalories.textContent = formatNumber(
      Math.round(nutrition.caloriesKcal),
      0,
    );
    elements.resultServing.textContent = formatServing(servingInput, food);
    const normalizedServing = formatNormalizedServing(conversion);
    elements.resultNormalizedServing.textContent = normalizedServing ?? "";
    elements.resultNormalizedServing.hidden = !normalizedServing;
    elements.resultProtein.textContent = formatNutrient(
      nutrition.proteinG,
      1,
      "g",
    );
    elements.resultCarbs.textContent = formatNutrient(
      nutrition.carbohydratesG,
      1,
      "g",
    );
    elements.resultFat.textContent = formatNutrient(
      nutrition.fatG,
      1,
      "g",
    );
    elements.resultFiber.textContent = formatNutrient(
      nutrition.fiberG,
      1,
      "g",
    );
    elements.resultSugar.textContent = formatNutrient(
      nutrition.sugarG,
      1,
      "g",
    );
    elements.resultSodium.textContent = formatNutrient(
      nutrition.sodiumMg,
      0,
      "mg",
    );
    elements.resultMatchDescription.textContent = food.sourceDescription;
    elements.servingAdjustment.value = servingInput.quantity;
    elements.servingAdjustment.step = "any";
    elements.servingAdjustmentContext.textContent = `(${adjustment.context})`;
    elements.servingAdjustmentUnit.textContent = adjustment.unitLabel;
    elements.decreaseServing.disabled =
      servingInput.quantity - adjustment.step <= 0;
    elements.servingAdjustmentError.hidden = true;
    elements.servingAdjustmentError.textContent = "";

    showState(APP_STATES.SUCCESS, {
      focus,
      announceState: focus,
    });
    if (!focus) announce("Nutrition result updated.");
  }

  function showIdleError(message) {
    elements.foodQueryError.textContent = message;
    elements.foodQueryError.hidden = false;
    elements.foodQuery.setAttribute("aria-invalid", "true");
    showState(APP_STATES.IDLE, { focus: false, announceState: false });
    elements.foodQuery.focus();
  }

  function clearAmountError() {
    elements.needsAmountError.textContent = "";
    elements.needsAmountError.hidden = true;
    elements.needsAmountValue.removeAttribute("aria-invalid");
  }

  function showAmountError(message) {
    elements.needsAmountError.textContent = message;
    elements.needsAmountError.hidden = false;
    elements.needsAmountValue.setAttribute("aria-invalid", "true");
    elements.needsAmountValue.focus();
  }

  function showInvalid(message, { recovery = "search" } = {}) {
    elements.invalidMessage.textContent = message;
    elements.editInvalidSearch.dataset.recovery = recovery;
    elements.editInvalidSearch.textContent =
      recovery === "amount" ? "Change Measurement" : "Edit Search";
    showState(APP_STATES.INVALID);
  }

  function showServingError(message, validQuantity) {
    elements.servingAdjustmentError.textContent = message;
    elements.servingAdjustmentError.hidden = false;
    elements.servingAdjustment.value = validQuantity;
    elements.servingAdjustment.focus();
  }

  function clearResult() {
    elements.resultFoodName.textContent = "Food name";
    elements.resultDescription.textContent = "Matched food description";
    elements.resultServing.textContent = "Serving amount";
    elements.resultNormalizedServing.textContent = "";
    elements.resultNormalizedServing.hidden = true;
    elements.resultMatchDescription.textContent = MISSING_VALUE;
    for (const output of [
      elements.resultCalories,
      elements.resultProtein,
      elements.resultCarbs,
      elements.resultFat,
      elements.resultFiber,
      elements.resultSugar,
      elements.resultSodium,
    ]) {
      output.textContent = MISSING_VALUE;
    }
    elements.servingAdjustment.value = "";
    elements.servingAdjustmentUnit.textContent = "unit";
    elements.decreaseServing.disabled = false;
    elements.servingAdjustmentError.hidden = true;
    elements.servingAdjustmentError.textContent = "";
  }

  function reset({ clearSearch = true } = {}) {
    elements.matchList.replaceChildren();
    elements.needsAmountForm.reset();
    elements.needsAmountUnit.replaceChildren();
    clearAmountError();
    elements.advancedForm.reset();
    if (elements.advancedDetails) elements.advancedDetails.open = false;
    elements.foodQueryError.textContent = "";
    elements.foodQueryError.hidden = true;
    elements.foodQuery.removeAttribute("aria-invalid");
    elements.invalidMessage.textContent = "Enter a food first.";
    elements.editInvalidSearch.dataset.recovery = "search";
    elements.editInvalidSearch.textContent = "Edit Search";
    clearResult();

    if (clearSearch) elements.foodSearchForm.reset();
  }

  function setAnalysisBusy(isBusy) {
    elements.foodSearchForm.setAttribute("aria-busy", String(isBusy));
    elements.advancedForm.setAttribute("aria-busy", String(isBusy));
    elements.analyzeFoodButton.disabled = isBusy;
    elements.advancedAnalyzeButton.disabled = isBusy;
    const label = isBusy ? "Analyzing…" : "Analyze Food";
    elements.analyzeFoodButton.textContent = label;
    elements.advancedAnalyzeButton.textContent = label;
  }

  elements.foodSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onAnalyze(elements.foodQuery.value);
  });

  elements.advancedForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onAdvancedAnalyze({
      food: elements.advancedFood.value,
      amount: elements.advancedAmount.value,
      unit: elements.advancedUnit.value,
      preparation: elements.advancedPreparation.value,
    });
  });

  elements.matchList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-food-id]");
    if (button) handlers.onSelectFood(button.dataset.foodId);
  });

  elements.needsAmountForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onProvideAmount({
      amount: elements.needsAmountValue.value,
      servingChoice: elements.needsAmountUnit.value,
    });
  });

  document.querySelectorAll("[data-example-query]").forEach((button) => {
    button.addEventListener("click", () => {
      elements.foodQuery.value = button.dataset.exampleQuery;
      elements.foodQuery.focus();
    });
  });

  elements.editAmbiguousSearch.addEventListener("click", handlers.onEditSearch);
  elements.tryAnotherSearch.addEventListener("click", handlers.onEditSearch);
  elements.editInvalidSearch.addEventListener("click", () =>
    handlers.onRecoverInvalid(elements.editInvalidSearch.dataset.recovery),
  );
  elements.decreaseServing.addEventListener("click", () =>
    handlers.onAdjustServing(-1),
  );
  elements.increaseServing.addEventListener("click", () =>
    handlers.onAdjustServing(1),
  );
  elements.servingAdjustment.addEventListener("change", () =>
    handlers.onSetServingAmount(elements.servingAdjustment.value),
  );
  elements.analyzeAnother.addEventListener("click", handlers.onAnalyzeAnother);
  elements.changeAmount.addEventListener("click", handlers.onChangeAmount);

  return {
    clearAmountError,
    clearResult,
    focusServingAdjustment: () => elements.servingAdjustment.focus(),
    renderAmbiguous,
    renderNeedsAmount,
    renderSuccess,
    reset,
    setAnalysisBusy,
    showAmountError,
    showIdleError,
    showInvalid,
    showNotFound: () => showState(APP_STATES.NOT_FOUND),
    showServingError,
    showState,
  };
}
