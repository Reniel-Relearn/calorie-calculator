import { foods } from "../data/foods.js";
import { searchFoods, FOOD_MATCH_STATUSES } from "./food-search.js";
import { parseFoodInput } from "./input-parser.js";
import { APP_STATES } from "./state.js";

// Pure Prompt 5 coordination. UI behavior is introduced in a later prompt.
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
