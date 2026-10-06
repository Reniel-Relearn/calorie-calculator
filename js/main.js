import { createAuthController } from "./auth/auth-controller.js";
import { readAuthCallback, clearAuthCallbackUrl } from "./auth/auth-routes.js";
import { createAuthService } from "./auth/auth-service.js";
import { createAuthUI } from "./auth/auth-ui.js";
import { createPrivateApplication } from "./private-app.js";
import { getSupabaseBrowserClient } from "./services/supabase-client.js";

export async function initializeApplication() {
  let controller = null;
  const ui = createAuthUI({
    onForgotPassword: (values) => controller?.forgotPassword(values),
    onLogin: (values) => controller?.login(values),
    onLogout: () => controller?.logout(),
    onNavigate: (destination) => controller?.navigate(destination),
    onSignUp: (values) => controller?.signUp(values),
    onUpdatePassword: (values) => controller?.updatePassword(values),
  });

  try {
    const callback = readAuthCallback(window.location);
    const client = getSupabaseBrowserClient();
    const service = createAuthService(client, window.location.origin);
    let privateApplication = null;

    controller = createAuthController({
      service,
      ui,
      initializePrivateApp: () => {
        privateApplication ??= createPrivateApplication(client);
        return privateApplication;
      },
    });

    await controller.initialize(callback);
  } catch {
    ui.showAuthError(
      "The account service is not configured correctly. Try again later.",
    );
  } finally {
    clearAuthCallbackUrl(window.location, window.history);
  }

  return controller;
}

if (typeof document !== "undefined") initializeApplication();

