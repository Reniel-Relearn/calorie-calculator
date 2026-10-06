import { initializeApp } from "./app.js";
import { createProfileController } from "./profile/profile-controller.js";
import { createProfileService } from "./profile/profile-service.js";
import { createProfileView } from "./profile/profile-view.js";

export function createPrivateApplication(client) {
  const calculator = initializeApp();
  let profileController = null;
  const profileView = createProfileView({
    onRetry: () => profileController?.retry(),
    onSubmit: (values) => profileController?.submit(values),
  });
  profileController = createProfileController({
    service: createProfileService(client),
    view: profileView,
  });

  return Object.freeze({
    activate: (user, options) => profileController.activate(user, options),
    initialize() {
      profileController.reset();
      calculator.initialize();
    },
  });
}
