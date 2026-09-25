import { foods } from "../data/foods.js";
import { searchFoods, FOOD_MATCH_STATUSES } from "./food-search.js";
import { parseFoodInput } from "./input-parser.js";
import { calculateNutrition } from "./nutrition-calculator.js";
import { convertServing } from "./serving-converter.js";
import { APP_STATES } from "./state.js";
import { createUI } from "./ui.js";

const MEASUREMENT_ERROR_CODES = Object.freeze([
  "UNSUPPORTED_UNIT",
  "UNSUPPORTED_DESCRIPTOR",
  "UNSUPPORTED_SERVING",
  "MEASUREMENT_BASIS_MISMATCH",
]);

function isMeasurementError(code) {
  return MEASUREMENT_ERROR_CODES.includes(code);
}

// Pure analysis remains available independently of the DOM controller.
export function analyzeFoodInput(rawInput, catalog = foods) {
  const parsedInput = parseFoodInput(rawInput);

  if (!parsedInput.isValid) {
    return {
      status: APP_STATES.INVALID,
      parsedInput,
      matches: [],
      strategy: null,
      amountProvided: parsedInput.quantity !== null,
      needsAmount: false,
      applicationState: APP_STATES.INVALID,
    };
  }

  const matchResult = searchFoods(parsedInput, catalog);
  const amountProvided = parsedInput.quantity !== null;
  const needsAmount =
    matchResult.status === FOOD_MATCH_STATUSES.MATCH && !amountProvided;

  let applicationState = null;
  if (matchResult.status === FOOD_MATCH_STATUSES.AMBIGUOUS) {
    applicationState = APP_STATES.AMBIGUOUS;
  } else if (matchResult.status === FOOD_MATCH_STATUSES.NOT_FOUND) {
    applicationState = APP_STATES.NOT_FOUND;
  } else if (needsAmount) {
    applicationState = APP_STATES.NEEDS_AMOUNT;
  }

  return {
    ...matchResult,
    parsedInput,
    amountProvided,
    needsAmount,
    applicationState,
  };
}

export function calculateFoodInput(rawInput, catalog = foods) {
  const analysis = analyzeFoodInput(rawInput, catalog);
  const baseResult = {
    ...analysis,
    conversion: null,
    nutritionCalculation: null,
    eligibleForSuccess: false,
  };

  if (
    analysis.status !== FOOD_MATCH_STATUSES.MATCH ||
    analysis.needsAmount
  ) {
    return baseResult;
  }

  const food = analysis.matches[0];
  const conversion = convertServing(food, {
    quantity: analysis.parsedInput.quantity,
    unit: analysis.parsedInput.unit,
    servingDescriptor: analysis.parsedInput.servingDescriptor,
  });

  if (!conversion.ok) {
    return {
      ...baseResult,
      conversion,
      applicationState: APP_STATES.INVALID,
    };
  }

  const nutritionCalculation = calculateNutrition(food, conversion);

  if (!nutritionCalculation.ok) {
    return {
      ...baseResult,
      conversion,
      nutritionCalculation,
      applicationState: APP_STATES.INVALID,
    };
  }

  return {
    ...baseResult,
    conversion,
    nutritionCalculation,
    eligibleForSuccess: true,
    applicationState: APP_STATES.SUCCESS,
  };
}

function formatList(items) {
  if (items.length < 2) return items[0] ?? "a supported measurement";
  if (items.length === 2) return `${items[0]} or ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, or ${items.at(-1)}`;
}

function getSupportedMeasurementMessage(food) {
  if (!food) return "Choose a measurement supported by this food.";

  const labels = [];
  for (const unit of food.supportedUnits ?? []) {
    const isDirectUnit =
      (food.measurementBasis === "mass" && unit === "grams") ||
      (food.measurementBasis === "volume" && unit === "milliliters");
    if (isDirectUnit || food.servingConversions?.[unit]) labels.push(unit);
  }

  for (const [descriptor, metadata] of Object.entries(
    food.servingDescriptors ?? {},
  )) {
    const unit = metadata.unit === "pieces" ? "pieces" : metadata.unit;
    labels.push(`${descriptor} ${unit}`);
  }

  return `${food.name} supports ${formatList(labels)} in the current demo dataset.`;
}

function getUserMessage(failure, food = null) {
  if (!failure) return "We couldn't complete that calculation.";

  if (isMeasurementError(failure.code)) {
    return getSupportedMeasurementMessage(food);
  }

  const messages = {
    MISSING_AMOUNT: "Enter an amount before calculating nutrition.",
    INVALID_QUANTITY: "Enter an amount greater than zero.",
    INVALID_NORMALIZED_AMOUNT: "Enter an amount greater than zero.",
    INVALID_CONVERSION_METADATA:
      "Serving information is unavailable for this food.",
    INVALID_REFERENCE_METADATA:
      "Nutrition reference information is unavailable for this food.",
    REFERENCE_UNIT_MISMATCH:
      "Nutrition reference units are unavailable for this food.",
    INVALID_NUTRITION_DATA:
      "Nutrition information is unavailable for this food.",
    NON_FINITE_RESULT:
      "That amount could not be calculated as a finite nutrition result.",
  };

  return messages[failure.code] ?? failure.message;
}

function parseServingChoice(value) {
  const [type, name] = value.split(":");

  if (type === "descriptor") {
    return { unit: null, servingDescriptor: name };
  }

  return { unit: name ?? null, servingDescriptor: null };
}

function getAdjustmentStep(servingInput) {
  if (servingInput.servingDescriptor) return 1;

  return {
    grams: 10,
    milliliters: 10,
    pieces: 1,
    cups: 0.25,
    servings: 1,
  }[servingInput.unit] ?? 1;
}

function validateDiscreteServing(servingInput) {
  if (
    (servingInput.servingDescriptor || servingInput.unit === "pieces") &&
    !Number.isInteger(servingInput.quantity)
  ) {
    return "Use a whole number for pieces or described servings.";
  }

  return null;
}

export function createApplicationController(ui, catalog = foods) {
  const session = {
    rawInput: "",
    parsedInput: null,
    candidates: [],
    selectedFood: null,
    servingInput: null,
    conversion: null,
    nutritionCalculation: null,
  };

  const schedule =
    typeof requestAnimationFrame === "function"
      ? requestAnimationFrame
      : (callback) => callback();
  let analysisInProgress = false;
  let analysisToken = 0;

  function clearSession() {
    session.rawInput = "";
    session.parsedInput = null;
    session.candidates = [];
    session.selectedFood = null;
    session.servingInput = null;
    session.conversion = null;
    session.nutritionCalculation = null;
  }

  function showInvalid(message, options = {}) {
    ui.showInvalid(message || "Check your entry and try again.", options);
  }

  function calculateSelectedFood(
    servingInput,
    { focus = true, onValidationError = null } = {},
  ) {
    const reportValidationError = (message, failure = null) => {
      if (onValidationError) {
        onValidationError(message);
        return;
      }

      const recovery =
        session.selectedFood && isMeasurementError(failure?.code)
          ? "amount"
          : "search";
      showInvalid(message, { recovery });
    };

    const discreteServingError = validateDiscreteServing(servingInput);
    if (discreteServingError) {
      reportValidationError(discreteServingError);
      return false;
    }

    const conversion = convertServing(
      session.selectedFood,
      servingInput,
    );
    if (!conversion.ok) {
      reportValidationError(
        getUserMessage(conversion, session.selectedFood),
        conversion,
      );
      return false;
    }

    const nutritionCalculation = calculateNutrition(
      session.selectedFood,
      conversion,
    );
    if (!nutritionCalculation.ok) {
      reportValidationError(
        getUserMessage(nutritionCalculation, session.selectedFood),
        nutritionCalculation,
      );
      return false;
    }

    session.servingInput = { ...servingInput };
    session.conversion = conversion;
    session.nutritionCalculation = nutritionCalculation;

    ui.renderSuccess(
      {
        food: session.selectedFood,
        servingInput: session.servingInput,
        conversion,
        nutritionCalculation,
      },
      { focus },
    );
    return true;
  }

  function continueWithSelectedFood() {
    if (!session.selectedFood || !session.parsedInput) {
      showInvalid("Choose a food before calculating nutrition.");
      return;
    }

    if (session.parsedInput.quantity === null) {
      ui.renderNeedsAmount(session.selectedFood);
      return;
    }

    calculateSelectedFood({
      quantity: session.parsedInput.quantity,
      unit: session.parsedInput.unit,
      servingDescriptor: session.parsedInput.servingDescriptor,
    });
  }

  function routeAnalysis(rawInput, token) {
    if (token !== analysisToken) return;

    const analysis = analyzeFoodInput(rawInput, catalog);
    session.rawInput = rawInput;
    session.parsedInput = analysis.parsedInput;
    session.candidates = analysis.matches;

    if (analysis.status === APP_STATES.INVALID) {
      showInvalid(analysis.parsedInput.errors[0]?.message);
      return;
    }

    if (analysis.status === FOOD_MATCH_STATUSES.AMBIGUOUS) {
      ui.renderAmbiguous(analysis.matches);
      return;
    }

    if (analysis.status === FOOD_MATCH_STATUSES.NOT_FOUND) {
      ui.showNotFound();
      return;
    }

    session.selectedFood = analysis.matches[0];
    continueWithSelectedFood();
  }

  function analyze(rawInput) {
    if (analysisInProgress) return;

    if (typeof rawInput !== "string" || rawInput.trim() === "") {
      clearSession();
      ui.reset({ clearSearch: false });
      ui.showIdleError("Enter a food and amount to continue.");
      return;
    }

    clearSession();
    ui.reset({ clearSearch: false });
    const token = ++analysisToken;
    analysisInProgress = true;
    ui.setAnalysisBusy(true);
    ui.showState(APP_STATES.ANALYZING, { focus: false });
    schedule(() => {
      try {
        routeAnalysis(rawInput, token);
      } finally {
        if (token === analysisToken) {
          analysisInProgress = false;
          ui.setAnalysisBusy(false);
        }
      }
    });
  }

  function analyzeAdvanced({ food, amount, unit, preparation }) {
    const serving = amount.trim() ? `${amount.trim()} ${unit}` : "";
    const rawInput = [serving, preparation, food.trim()]
      .filter(Boolean)
      .join(" ");
    analyze(rawInput);
  }

  function selectFood(foodId) {
    session.selectedFood =
      session.candidates.find((food) => food.id === foodId) ?? null;
    continueWithSelectedFood();
  }

  function provideAmount({ amount, servingChoice }) {
    const quantity = amount.trim() === "" ? null : Number(amount);
    const serving = parseServingChoice(servingChoice);

    ui.clearAmountError();
    calculateSelectedFood(
      {
        quantity,
        ...serving,
      },
      { onValidationError: (message) => ui.showAmountError(message) },
    );
  }

  function recalculateServing(quantity) {
    if (!session.selectedFood || !session.servingInput) return;

    const nextServingInput = {
      ...session.servingInput,
      quantity,
    };
    const discreteServingError = validateDiscreteServing(nextServingInput);
    if (discreteServingError) {
      ui.showServingError(discreteServingError, session.servingInput.quantity);
      return;
    }

    const conversion = convertServing(
      session.selectedFood,
      nextServingInput,
    );
    if (!conversion.ok) {
      ui.showServingError(
        getUserMessage(conversion, session.selectedFood),
        session.servingInput.quantity,
      );
      return;
    }

    const nutritionCalculation = calculateNutrition(
      session.selectedFood,
      conversion,
    );
    if (!nutritionCalculation.ok) {
      ui.showServingError(
        getUserMessage(nutritionCalculation, session.selectedFood),
        session.servingInput.quantity,
      );
      return;
    }

    session.servingInput = nextServingInput;
    session.conversion = conversion;
    session.nutritionCalculation = nutritionCalculation;
    ui.renderSuccess(
      {
        food: session.selectedFood,
        servingInput: session.servingInput,
        conversion,
        nutritionCalculation,
      },
      { focus: false },
    );
  }

  function adjustServing(direction) {
    if (!session.servingInput) return;
    const nextQuantity = Number(
      (
        session.servingInput.quantity +
        direction * getAdjustmentStep(session.servingInput)
      ).toPrecision(12),
    );
    if (nextQuantity <= 0) return;
    recalculateServing(nextQuantity);
  }

  function setServingAmount(rawAmount) {
    const quantity = rawAmount.trim() === "" ? Number.NaN : Number(rawAmount);
    recalculateServing(quantity);
  }

  function editSearch() {
    analysisToken += 1;
    analysisInProgress = false;
    ui.setAnalysisBusy(false);
    clearSession();
    ui.reset({ clearSearch: false });
    ui.showState(APP_STATES.IDLE);
  }

  function analyzeAnother() {
    analysisToken += 1;
    analysisInProgress = false;
    ui.setAnalysisBusy(false);
    clearSession();
    ui.reset({ clearSearch: true });
    ui.showState(APP_STATES.IDLE);
  }

  function changeAmount() {
    if (!session.selectedFood) return;
    ui.renderNeedsAmount(session.selectedFood);
  }

  function recoverInvalid(recovery) {
    if (recovery === "amount" && session.selectedFood) {
      ui.renderNeedsAmount(session.selectedFood);
      return;
    }

    editSearch();
  }

  return {
    adjustServing,
    analyze,
    analyzeAdvanced,
    analyzeAnother,
    changeAmount,
    editSearch,
    initialize: () => {
      ui.setAnalysisBusy(false);
      ui.reset({ clearSearch: true });
      ui.showState(APP_STATES.IDLE, {
        focus: false,
        announceState: false,
      });
    },
    provideAmount,
    recoverInvalid,
    selectFood,
    setServingAmount,
  };
}

export function initializeApp() {
  let controller;
  const ui = createUI({
    onAdjustServing: (direction) => controller.adjustServing(direction),
    onAdvancedAnalyze: (fields) => controller.analyzeAdvanced(fields),
    onAnalyze: (rawInput) => controller.analyze(rawInput),
    onAnalyzeAnother: () => controller.analyzeAnother(),
    onChangeAmount: () => controller.changeAmount(),
    onEditSearch: () => controller.editSearch(),
    onProvideAmount: (serving) => controller.provideAmount(serving),
    onRecoverInvalid: (recovery) => controller.recoverInvalid(recovery),
    onSelectFood: (foodId) => controller.selectFood(foodId),
    onSetServingAmount: (amount) => controller.setServingAmount(amount),
  });

  controller = createApplicationController(ui);
  controller.initialize();
  return controller;
}

if (typeof document !== "undefined") initializeApp();
