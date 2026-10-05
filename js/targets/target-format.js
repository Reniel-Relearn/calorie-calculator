export function roundKcalForDisplay(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.round(value);
}
