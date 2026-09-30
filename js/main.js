import { createAuthController } from "./auth/auth-controller.js";
import { readAuthCallback, clearAuthCallbackUrl } from "./auth/auth-routes.js";
import { createAuthService } from "./auth/auth-service.js";
import { createAuthUI } from "./auth/auth-ui.js";
import { initializeApp } from "./app.js";
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
    const service = createAuthService(
      getSupabaseBrowserClient(),
      window.location.origin,
    );

    controller = createAuthController({
      service,
      ui,
      initializePrivateApp: initializeApp,
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

