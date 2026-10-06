import { initializeApp } from "./app.js";
import { createProfileController } from "./profile/profile-controller.js";
import { createProfileService } from "./profile/profile-service.js";
import { createProfileView } from "./profile/profile-view.js";
import { createFoodLogService } from "./logs/food-log-service.js";

export function createPrivateApplication(client) {
  const calculator = initializeApp({
    foodLogService: createFoodLogService(client),
    onFoodLogSaved: (log) => {
      if (typeof document === "undefined" || typeof CustomEvent === "undefined") {
        return;
      }
      document.dispatchEvent(
        new CustomEvent("caloriecheck:food-log-saved", {
          detail: { id: log.id, localDate: log.localDate },
        }),
      );
    },
  });
  let profileController = null;
  const profileView = createProfileView({
    onRetry: () => profileController?.retry(),
    onSubmit: (values) => profileController?.submit(values),
  });
  profileController = createProfileController({
    service: createProfileService(client),
    view: profileView,
    onProfileReady: (profile) => calculator.activateFoodLogging(profile),
    onProfileUnavailable: () => calculator.deactivateFoodLogging(),
  });

  return Object.freeze({
    activate: (user, options) => profileController.activate(user, options),
    initialize() {
      profileController.reset();
      calculator.initialize();
    },
  });
}
