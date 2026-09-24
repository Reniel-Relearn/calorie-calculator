export const CANONICAL_UNITS = Object.freeze([
  "grams",
  "milliliters",
  "pieces",
  "cups",
  "servings",
]);

export const PARSE_ERROR_CODES = Object.freeze({
  EMPTY_INPUT: "EMPTY_INPUT",
  INVALID_INPUT_TYPE: "INVALID_INPUT_TYPE",
  MALFORMED_QUANTITY: "MALFORMED_QUANTITY",
  INVALID_QUANTITY: "INVALID_QUANTITY",
  NON_POSITIVE_QUANTITY: "NON_POSITIVE_QUANTITY",
  MULTIPLE_PREPARATIONS: "MULTIPLE_PREPARATIONS",
  MISSING_FOOD: "MISSING_FOOD",
});

const UNIT_ALIASES = Object.freeze({
  g: "grams",
  gram: "grams",
  grams: "grams",
  ml: "milliliters",
  milliliter: "milliliters",
  milliliters: "milliliters",
  millilitre: "milliliters",
  millilitres: "milliliters",
  piece: "pieces",
  pieces: "pieces",
  pc: "pieces",
  pcs: "pieces",
  cup: "cups",
  cups: "cups",
  serving: "servings",
  servings: "servings",
});

const DESCRIPTOR_ALIASES = Object.freeze({
  small: "small",
  medium: "medium",
  large: "large",
  slice: "slice",
  slices: "slice",
});

const PREPARATION_PATTERNS = Object.freeze([
  { phrase: "hard boiled", value: "boiled" },
  { phrase: "pan fried", value: "fried" },
  { phrase: "grilled", value: "grilled" },
  { phrase: "fried", value: "fried" },
  { phrase: "boiled", value: "boiled" },
  { phrase: "roasted", value: "roasted" },
  { phrase: "cooked", value: "cooked" },
  { phrase: "raw", value: "raw" },
]);

function createError(code, message) {
  return { code, message };
}

export function normalizeInput(value) {
  if (typeof value !== "string") return "";

  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/(\p{L})-(?=\p{L})/gu, "$1 ")
    .replace(/(\d)-(?=\p{L})/gu, "$1 ")
    .replace(/[^\p{L}\p{N}.\-\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanFoodText(value) {
  return value.replace(/[.\-]+/g, " ").replace(/\s+/g, " ").trim();
}

function consumeLeadingWord(value) {
  const match = value.match(/^([a-z]+)(?:\s+|$)/);

  if (!match) return null;

  return {
    word: match[1],
    remaining: value.slice(match[0].length).trim(),
  };
}

function parseServingPrefix(value, hasQuantity) {
  let remaining = value;
  let unit = null;
  let servingDescriptor = null;

  for (let index = 0; index < 2; index += 1) {
    const leading = consumeLeadingWord(remaining);
    if (!leading) break;

    if (hasQuantity && !unit && UNIT_ALIASES[leading.word]) {
      unit = UNIT_ALIASES[leading.word];
      remaining = leading.remaining;
      continue;
    }

    if (!servingDescriptor && DESCRIPTOR_ALIASES[leading.word]) {
      servingDescriptor = DESCRIPTOR_ALIASES[leading.word];
      remaining = leading.remaining;
      continue;
    }

    break;
  }

  remaining = remaining.replace(/^of\b\s*/, "");

  return { remaining, unit, servingDescriptor };
}

function parsePreparation(value) {
  let remaining = value;
  const preparations = new Set();

  for (const { phrase, value: preparation } of PREPARATION_PATTERNS) {
    const pattern = new RegExp(`\\b${phrase.replace(" ", "\\s+")}\\b`, "g");

    if (remaining.match(pattern)) {
      preparations.add(preparation);
      remaining = remaining.replace(pattern, " ");
    }
  }

  return {
    foodText: cleanFoodText(remaining),
    preparation: preparations.size === 1 ? [...preparations][0] : null,
    hasConflict: preparations.size > 1,
  };
}

export function parseFoodInput(input) {
  const rawInput = typeof input === "string" ? input : "";
  const normalizedInput = normalizeInput(rawInput);
  const errors = [];
  let quantity = null;
  let unit = null;
  let servingDescriptor = null;
  let preparation = null;
  let foodText = "";

  if (typeof input !== "string") {
    errors.push(
      createError(
        PARSE_ERROR_CODES.INVALID_INPUT_TYPE,
        "Food input must be text.",
      ),
    );
  }

  if (!normalizedInput) {
    errors.push(
      createError(PARSE_ERROR_CODES.EMPTY_INPUT, "Enter a food first."),
    );

    return {
      rawInput,
      normalizedInput,
      quantity,
      unit,
      servingDescriptor,
      preparation,
      foodText,
      errors,
      isValid: false,
    };
  }

  let remaining = normalizedInput;
  const quantityMatch = remaining.match(
    /^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(?=$|\s|\p{L})/u,
  );

  if (quantityMatch) {
    quantity = Number(quantityMatch[1]);
    remaining = remaining.slice(quantityMatch[0].length).trim();

    if (!Number.isFinite(quantity)) {
      errors.push(
        createError(
          PARSE_ERROR_CODES.INVALID_QUANTITY,
          "Enter a valid numeric amount.",
        ),
      );
    } else if (quantity <= 0) {
      errors.push(
        createError(
          PARSE_ERROR_CODES.NON_POSITIVE_QUANTITY,
          "Amount must be greater than zero.",
        ),
      );
    }
  } else if (/^[+\-.\d]/.test(remaining)) {
    errors.push(
      createError(
        PARSE_ERROR_CODES.MALFORMED_QUANTITY,
        "Enter the amount as a valid number.",
      ),
    );
  }

  const serving = parseServingPrefix(remaining, quantity !== null);
  unit = serving.unit;
  servingDescriptor = serving.servingDescriptor;

  const preparedFood = parsePreparation(serving.remaining);
  preparation = preparedFood.preparation;
  foodText = preparedFood.foodText;

  if (preparedFood.hasConflict) {
    errors.push(
      createError(
        PARSE_ERROR_CODES.MULTIPLE_PREPARATIONS,
        "Enter one preparation method.",
      ),
    );
  }

  if (!foodText) {
    errors.push(
      createError(PARSE_ERROR_CODES.MISSING_FOOD, "Enter a food name."),
    );
  }

  return {
    rawInput,
    normalizedInput,
    quantity,
    unit,
    servingDescriptor,
    preparation,
    foodText,
    errors,
    isValid: errors.length === 0,
  };
}
