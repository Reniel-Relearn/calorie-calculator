import { initializeApp } from "./app.js";
import { createProfileController } from "./profile/profile-controller.js";
import { createProfileService } from "./profile/profile-service.js";
import { createProfileView } from "./profile/profile-view.js";
import { createFoodLogService } from "./logs/food-log-service.js";
import { createDailyController } from "./dashboard/daily-controller.js";
import { createDailyService } from "./dashboard/daily-service.js";
import { createDailyView } from "./dashboard/daily-view.js";

export function createPrivateApplication(client) {
  let dailyController = null;
  const dailyView = createDailyView({
    onNext: () => dailyController?.next(),
    onPrevious: () => dailyController?.previous(),
    onRetry: () => dailyController?.retry(),
    onSelectDate: (date) => dailyController?.selectDate(date),
    onToday: () => dailyController?.today(),
  });
  dailyController = createDailyController({
    service: createDailyService(client),
    view: dailyView,
  });

  if (typeof document !== "undefined") {
    document.addEventListener("caloriecheck:food-log-saved", (event) => {
      dailyController.handleFoodLogSaved(event.detail);
    });
  }

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
    onProfileReady: (profile) => {
      calculator.activateFoodLogging(profile);
      dailyController.activate(profile);
    },
    onProfileUnavailable: () => {
      calculator.deactivateFoodLogging();
      dailyController.reset();
    },
  });

  return Object.freeze({
    activate: (user, options) => profileController.activate(user, options),
    initialize() {
      profileController.reset();
      calculator.initialize();
    },
  });
}
