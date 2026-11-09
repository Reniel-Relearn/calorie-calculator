export function calculateBmi(weightKg, heightCm) {
  if (
    typeof weightKg !== "number" ||
    !Number.isFinite(weightKg) ||
    weightKg <= 0 ||
    typeof heightCm !== "number" ||
    !Number.isFinite(heightCm) ||
    heightCm <= 0
  ) {
    return null;
  }

  const heightMeters = heightCm / 100;
  const bmi = weightKg / (heightMeters * heightMeters);
  return Number.isFinite(bmi) ? Number(bmi.toPrecision(12)) : null;
}
