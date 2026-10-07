import { initializeApp } from "./app.js";
import { createProfileController } from "./profile/profile-controller.js";
import { createProfileService } from "./profile/profile-service.js";
import { createProfileView } from "./profile/profile-view.js";
import { createFoodLogService } from "./logs/food-log-service.js";
import { createDailyController } from "./dashboard/daily-controller.js";
import { createDailyService } from "./dashboard/daily-service.js";
import { createDailyView } from "./dashboard/daily-view.js";
import { createWeeklyController } from "./dashboard/weekly-controller.js";
import { createWeeklyService } from "./dashboard/weekly-service.js";
import { createWeeklyView } from "./dashboard/weekly-view.js";
import { createLogManagementController } from "./logs/log-management-controller.js";
import { createLogManagementView } from "./logs/log-management-view.js";
import { createSettingsController } from "./settings/settings-controller.js";
import { createSettingsService } from "./settings/settings-service.js";
import { createSettingsView } from "./settings/settings-view.js";

export function createPrivateApplication(client, options = {}) {
  let dailyController = null;
  let logManagementController = null;
  let profileController = null;
  let settingsController = null;
  let weeklyController = null;
  const dailyView = createDailyView({
    onDeleteLog: (log) => logManagementController?.requestDelete(log),
    onEditLog: (log) => logManagementController?.edit(log),
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
  const weeklyView = createWeeklyView({
    onCurrent: () => weeklyController?.current(),
    onNext: () => weeklyController?.next(),
    onPrevious: () => weeklyController?.previous(),
    onRetry: () => weeklyController?.retry(),
  });
  weeklyController = createWeeklyController({
    service: createWeeklyService(client),
    view: weeklyView,
  });
  const logManagementView = createLogManagementView({
    onCancelDelete: () => logManagementController?.cancelDelete(),
    onCancelEdit: () => logManagementController?.cancelEdit(),
    onConfirmDelete: () => logManagementController?.confirmDelete(),
    onSubmitEdit: (values) => logManagementController?.submitEdit(values),
  });
  logManagementController = createLogManagementController({
    service: createFoodLogService(client),
    view: logManagementView,
    onChanged: (detail) => {
      dailyController.handleFoodLogChanged(detail);
      weeklyController.handleFoodLogChanged(detail);
    },
  });
  const settingsView = createSettingsView({
    onClose: () => settingsController?.close(),
    onDeleteAccount: (values) => settingsController?.deleteAccount(values),
    onOpen: () => settingsController?.open(),
    onSubmit: (values) => settingsController?.submit(values),
  });
  settingsController = createSettingsController({
    service: createSettingsService(client),
    view: settingsView,
    onAccountDeleted: options.onAccountDeleted,
    onProfileSaved: (_profile, _target, result) =>
      profileController?.refresh({
        announcement: result.targetChanged
          ? "Settings saved. A new maintenance target is now effective."
          : "Display name updated.",
        focus: false,
      }),
  });

  if (typeof document !== "undefined") {
    document.addEventListener("caloriecheck:food-log-saved", (event) => {
      dailyController.handleFoodLogSaved(event.detail);
      weeklyController.handleFoodLogSaved(event.detail);
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
  const profileView = createProfileView({
    onRetry: () => profileController?.retry(),
    onSubmit: (values) => profileController?.submit(values),
  });
  profileController = createProfileController({
    service: createProfileService(client),
    view: profileView,
    onProfileReady: (profile, target) => {
      calculator.activateFoodLogging(profile);
      dailyController.activate(profile);
      weeklyController.activate(profile);
      settingsController.activate(profile, target);
    },
    onProfileUnavailable: () => {
      calculator.deactivateFoodLogging();
      dailyController.reset();
      weeklyController.reset();
      logManagementController.reset();
      settingsController.reset();
    },
  });

  return Object.freeze({
    activate: (user, options) => profileController.activate(user, options),
    initialize() {
      profileController.reset();
      logManagementController.reset();
      settingsController.reset();
      calculator.initialize();
    },
  });
}
