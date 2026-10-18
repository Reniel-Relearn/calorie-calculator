import { createAuthController } from "./auth/auth-controller.js";
import { createAuthCaptcha } from "./auth/auth-captcha.js";
import { readAuthCallback, clearAuthCallbackUrl } from "./auth/auth-routes.js";
import { createAuthService } from "./auth/auth-service.js";
import { createAuthUI } from "./auth/auth-ui.js";
import { createPrivateApplication } from "./private-app.js";
import { getSupabaseBrowserClient } from "./services/supabase-client.js";
import { getPublicSecurityConfig } from "./config/environment.js";

export async function initializeApplication() {
  let controller = null;
  let configurationError = null;
  let securityConfig;
  try {
    securityConfig = getPublicSecurityConfig();
  } catch (error) {
    configurationError = error;
    securityConfig = { appEnvironment: "staging", turnstileSiteKey: null };
  }
  const captcha = createAuthCaptcha({
    appEnvironment: securityConfig.appEnvironment,
    siteKey: securityConfig.turnstileSiteKey,
  });
  const ui = createAuthUI({
    onForgotPassword: (values) => controller?.forgotPassword(values),
    onLogin: (values) => controller?.login(values),
    onLogout: () => controller?.logout(),
    onNavigate: (destination) => controller?.navigate(destination),
    onSignUp: (values) => controller?.signUp(values),
    onUpdatePassword: (values) => controller?.updatePassword(values),
  }, captcha);

  try {
    if (configurationError) throw configurationError;
    const callback = readAuthCallback(window.location);
    const client = getSupabaseBrowserClient();
    const service = createAuthService(client, window.location.origin);
    let privateApplication = null;

    controller = createAuthController({
      service,
      ui,
      initializePrivateApp: () => {
        privateApplication ??= createPrivateApplication(client, {
          captcha,
          onAccountDeleted: () => controller?.accountDeleted(),
        });
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

