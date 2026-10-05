export const ENERGY_EQUATION_BRANCHES = Object.freeze({
  ADOLESCENT_14_TO_18_99: "adolescent_14_to_18_99",
  ADULT_19_PLUS: "adult_19_plus",
});

export const ENERGY_ACTIVITY_CATEGORIES = Object.freeze([
  "inactive",
  "low_active",
  "active",
  "very_active",
]);

export const ENERGY_EQUATION_SEXES = Object.freeze(["male", "female"]);

const ADOLESCENT_GROWTH_KCAL = 20;

const EQUATIONS = Object.freeze({
  [ENERGY_EQUATION_BRANCHES.ADOLESCENT_14_TO_18_99]: Object.freeze({
    male: Object.freeze({
      inactive: Object.freeze([-447.51, 3.68, 13.01, 13.15]),
      low_active: Object.freeze([19.12, 3.68, 8.62, 20.28]),
      active: Object.freeze([-388.19, 3.68, 12.66, 20.46]),
      very_active: Object.freeze([-671.75, 3.68, 15.38, 23.25]),
    }),
    female: Object.freeze({
      inactive: Object.freeze([55.59, -22.25, 8.43, 17.07]),
      low_active: Object.freeze([-297.54, -22.25, 12.77, 14.73]),
      active: Object.freeze([-189.55, -22.25, 11.74, 18.34]),
      very_active: Object.freeze([-709.59, -22.25, 18.22, 14.25]),
    }),
  }),
  [ENERGY_EQUATION_BRANCHES.ADULT_19_PLUS]: Object.freeze({
    male: Object.freeze({
      inactive: Object.freeze([753.07, -10.83, 6.5, 14.1]),
      low_active: Object.freeze([581.47, -10.83, 8.3, 14.94]),
      active: Object.freeze([1004.82, -10.83, 6.52, 15.91]),
      very_active: Object.freeze([-517.88, -10.83, 15.61, 19.11]),
    }),
    female: Object.freeze({
      inactive: Object.freeze([584.9, -7.01, 5.72, 11.71]),
      low_active: Object.freeze([575.77, -7.01, 6.6, 12.14]),
      active: Object.freeze([710.25, -7.01, 6.54, 12.34]),
      very_active: Object.freeze([511.83, -7.01, 9.07, 12.56]),
    }),
  }),
});

const PREDICTION_RMSE_KCAL = Object.freeze({
  [ENERGY_EQUATION_BRANCHES.ADOLESCENT_14_TO_18_99]: Object.freeze({
    male: 259,
    female: 237,
  }),
  [ENERGY_EQUATION_BRANCHES.ADULT_19_PLUS]: Object.freeze({
    male: 339,
    female: 246,
  }),
});

export function resolveEnergyEquationBranch(ageYears) {
  if (typeof ageYears !== "number" || !Number.isFinite(ageYears)) return null;
  if (ageYears >= 19) return ENERGY_EQUATION_BRANCHES.ADULT_19_PLUS;
  if (ageYears >= 18) {
    return ENERGY_EQUATION_BRANCHES.ADOLESCENT_14_TO_18_99;
  }
  return null;
}

export function getEnergyEquation(branch, sex, activityCategory) {
  const coefficients = EQUATIONS[branch]?.[sex]?.[activityCategory];
  if (!coefficients) return null;

  return {
    id: `nasem-2023-${branch}-${sex}-${activityCategory}`,
    branch,
    table:
      branch === ENERGY_EQUATION_BRANCHES.ADULT_19_PLUS ? "S-3" : "S-2",
    coefficients: [...coefficients],
    growthKcal:
      branch === ENERGY_EQUATION_BRANCHES.ADOLESCENT_14_TO_18_99
        ? ADOLESCENT_GROWTH_KCAL
        : 0,
    predictionRmseKcal: PREDICTION_RMSE_KCAL[branch][sex],
  };
}

export function evaluateEnergyEquation(
  equation,
  { ageYears, heightCm, weightKg },
) {
  const [intercept, ageCoefficient, heightCoefficient, weightCoefficient] =
    equation.coefficients;

  return (
    intercept +
    ageCoefficient * ageYears +
    heightCoefficient * heightCm +
    weightCoefficient * weightKg +
    equation.growthKcal
  );
}
