export function createProfileTargetCommand(profile, result) {
  return {
    profile,
    target: {
      maintenanceKcal: result.maintenanceKcal,
      targetKcal: result.targetKcal,
      methodology: result.methodology.id,
      methodologyVersion: result.methodology.version,
      activityCategory: result.activityCategory,
      inputSnapshot: result.normalizedInputs,
      assumptions: result.assumptions,
      warnings: [
        ...result.warnings,
        {
          code: "PREDICTION_UNCERTAINTY",
          message: result.uncertainty.message,
          predictionRmseKcal: result.uncertainty.predictionRmseKcal,
        },
      ],
    },
  };
}
