// Fixed expectations transcribed independently from National Academies 2023
// Tables S-2 and S-3 (DOI 10.17226/26818), accessed 2026-10-05.
const adolescentBase = Object.freeze({
  ageYears: 18.5,
  heightCm: 172,
  weightKg: 68,
});

const adultBase = Object.freeze({
  ageYears: 35,
  heightCm: 170,
  weightKg: 72,
});

export const EER_REFERENCE_CASES = Object.freeze([
  ["adolescent male inactive", adolescentBase, "male", "inactive", 2772.49],
  ["adolescent male low active", adolescentBase, "male", "low_active", 2968.88],
  ["adolescent male active", adolescentBase, "male", "active", 3268.69],
  ["adolescent male very active", adolescentBase, "male", "very_active", 3642.69],
  ["adolescent female inactive", adolescentBase, "female", "inactive", 2274.685],
  ["adolescent female low active", adolescentBase, "female", "low_active", 2508.915],
  ["adolescent female active", adolescentBase, "female", "active", 2685.225],
  ["adolescent female very active", adolescentBase, "female", "very_active", 3001.625],
  ["adult male inactive", adultBase, "male", "inactive", 2494.22],
  ["adult male low active", adultBase, "male", "low_active", 2689.1],
  ["adult male active", adultBase, "male", "active", 2879.69],
  ["adult male very active", adultBase, "male", "very_active", 3132.69],
  ["adult female inactive", adultBase, "female", "inactive", 2155.07],
  ["adult female low active", adultBase, "female", "low_active", 2326.5],
  ["adult female active", adultBase, "female", "active", 2465.18],
  ["adult female very active", adultBase, "female", "very_active", 2712.7],
]);

export const NASEM_WORKED_EXAMPLE = Object.freeze({
  input: Object.freeze({
    ageYears: 22,
    sexForEnergyEquation: "female",
    heightCm: 165,
    weightKg: 63,
    activityCategory: "low_active",
  }),
  calculatedKcal: 2275.37,
  publishedRoundedKcal: 2275,
});
