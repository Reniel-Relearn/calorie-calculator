function roundedMeasurement(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(2)) : null;
}

export function hasTargetAffectingProfileChanges(profile, values) {
  if (!profile || !values) return true;
  return (
    profile.dateOfBirth !== String(values.dateOfBirth ?? "").trim() ||
    profile.sexForEnergyEquation !== values.sexForEnergyEquation ||
    profile.heightCm !== roundedMeasurement(values.heightCm) ||
    profile.weightKg !== roundedMeasurement(values.weightKg) ||
    profile.activityCategory !== values.activityCategory ||
    profile.goalType !== values.goalType ||
    profile.timezoneName !== String(values.timezoneName ?? "").trim()
  );
}

export function validateAccountDeletion(values) {
  const errors = {};
  if (typeof values?.currentPassword !== "string" || !values.currentPassword) {
    errors.currentPassword = "Enter your current password.";
  }
  if (values?.confirmation !== "DELETE") {
    errors.confirmation = "Type DELETE exactly to confirm account deletion.";
  }
  return {
    ok: Object.keys(errors).length === 0,
    errors,
    firstField: errors.currentPassword ? "currentPassword" : "confirmation",
  };
}
