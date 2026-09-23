import { foods } from "../data/foods.js";
import { normalizeInput } from "./input-parser.js";
import { APP_STATES } from "./state.js";

export const FOOD_MATCH_STATUSES = Object.freeze({
  MATCH: "MATCH",
  AMBIGUOUS: APP_STATES.AMBIGUOUS,
  NOT_FOUND: APP_STATES.NOT_FOUND,
});

const PREPARATION_MODIFIERS = Object.freeze({
  boiled: "hard",
  fried: "pan",
});

function singularizeToken(token) {
  if (token.length <= 3 || !token.endsWith("s") || token.endsWith("ss")) {
    return token;
  }

  if (token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (/(ches|shes|xes|zes|ses)$/.test(token)) return token.slice(0, -2);

  return token.slice(0, -1);
}

function normalizeSearchPhrase(value) {
  return normalizeInput(value)
    .replace(/[.\-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(singularizeToken)
    .join(" ");
}

function removePreparation(phrase, preparation) {
  const tokens = phrase.split(" ");
  const preparationIndex = tokens.indexOf(preparation);

  if (preparationIndex === -1) return phrase;

  const modifier = PREPARATION_MODIFIERS[preparation];
  if (modifier && tokens[preparationIndex - 1] === modifier) {
    tokens.splice(preparationIndex - 1, 2);
  } else {
    tokens.splice(preparationIndex, 1);
  }

  return tokens.join(" ");
}

function getFoodPhrases(food) {
  return [...new Set([food.name, ...food.aliases].map(normalizeSearchPhrase))];
}

function containsAllQueryTokens(phrase, queryTokens) {
  const phraseTokens = new Set(phrase.split(" "));
  return queryTokens.every((token) => phraseTokens.has(token));
}

function createResult(status, candidates, query, strategy = null) {
  return {
    status,
    matches: candidates.map((candidate) => candidate.food),
    strategy,
    query,
  };
}

export function searchFoods(parsedInput, catalog = foods) {
  const queryText = normalizeSearchPhrase(parsedInput?.foodText ?? "");
  const preparation = parsedInput?.preparation ?? null;
  const query = Object.freeze({ foodText: queryText, preparation });

  if (!queryText || parsedInput?.isValid === false) {
    return createResult(FOOD_MATCH_STATUSES.NOT_FOUND, [], query);
  }

  const candidates = catalog
    .filter((food) => !preparation || food.preparation === preparation)
    .map((food) => {
      const namePhrase = normalizeSearchPhrase(food.name);
      const phrases = getFoodPhrases(food);
      const corePhrases = preparation
        ? phrases.map((phrase) => removePreparation(phrase, preparation))
        : [];
      const coreNamePhrase = preparation
        ? removePreparation(namePhrase, preparation)
        : namePhrase;

      return { food, namePhrase, coreNamePhrase, phrases, corePhrases };
    });

  const exactCandidates = candidates.filter(
    ({ phrases, corePhrases }) =>
      phrases.includes(queryText) || corePhrases.includes(queryText),
  );

  if (exactCandidates.length > 0) {
    return createResult(
      exactCandidates.length === 1
        ? FOOD_MATCH_STATUSES.MATCH
        : FOOD_MATCH_STATUSES.AMBIGUOUS,
      exactCandidates,
      query,
      "exact",
    );
  }

  const queryTokens = queryText.split(" ");
  const nameTokenCandidates = candidates.filter(
    ({ namePhrase, coreNamePhrase }) =>
      [namePhrase, coreNamePhrase].some((phrase) =>
        containsAllQueryTokens(phrase, queryTokens),
      ),
  );
  const tokenCandidates =
    nameTokenCandidates.length > 0
      ? nameTokenCandidates
      : candidates.filter(({ phrases, corePhrases }) =>
          [...phrases, ...corePhrases].some((phrase) =>
            containsAllQueryTokens(phrase, queryTokens),
          ),
        );

  if (tokenCandidates.length === 0) {
    return createResult(FOOD_MATCH_STATUSES.NOT_FOUND, [], query);
  }

  return createResult(
    tokenCandidates.length === 1
      ? FOOD_MATCH_STATUSES.MATCH
      : FOOD_MATCH_STATUSES.AMBIGUOUS,
    tokenCandidates,
    query,
    "token",
  );
}
