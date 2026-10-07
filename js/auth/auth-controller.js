import { getAuthErrorMessage } from "./auth-errors.js";
import { AUTH_STATES } from "./auth-state.js";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "./auth-validation.js";

const NAVIGATION_STATES = Object.freeze({
  "signed-out": AUTH_STATES.SIGNED_OUT,
  login: AUTH_STATES.LOGIN,
  signup: AUTH_STATES.SIGNUP,
  forgot: AUTH_STATES.FORGOT_PASSWORD,
});

export function createAuthController({
  service,
  ui,
  initializePrivateApp,
}) {
  let initialized = false;
  let pendingOperation = null;
  let pendingAuthEvent = null;
  let currentSession = null;
  let currentUserId = null;
  let privateApp = null;
  let recoveryMode = false;
  let unsubscribe = null;

  function clearPrivateState() {
    currentSession = null;
    currentUserId = null;
    recoveryMode = false;
    if (privateApp) privateApp.initialize();
    ui.clearPrivateView();
  }

  function enterAuthenticated(session, options = {}) {
    if (!session?.user) {
      clearPrivateState();
      ui.showState(AUTH_STATES.SIGNED_OUT, {
        announcement: "Log in to use the food calculator.",
      });
      return;
    }

    currentSession = session;
    const isSameUser = currentUserId === session.user.id;
    currentUserId = session.user.id;

    if (!privateApp) privateApp = initializePrivateApp();
    else if (!isSameUser) privateApp.initialize();

    ui.showAuthenticated(session.user, { ...options, focus: false });
    if (typeof privateApp.activate === "function") {
      Promise.resolve(
        privateApp.activate(session.user, {
          ...options,
          focus: options.focus !== false,
        }),
      ).catch(() => {
        ui.announce("Your private profile could not be loaded.");
      });
    }
  }

  function showExpiredSession(error) {
    clearPrivateState();
    ui.showState(AUTH_STATES.LOGIN, {
      announcement: getAuthErrorMessage(error),
    });
    ui.showFormError("login", getAuthErrorMessage(error));
  }

  function handleAuthEvent(event, session) {
    if (!initialized) {
      pendingAuthEvent = { event, session };
      if (event === "PASSWORD_RECOVERY") {
        recoveryMode = true;
        currentSession = session;
      }
      return;
    }

    if (event === "SIGNED_OUT") {
      if (pendingOperation === "signup") return;
      if (ui.getState() === AUTH_STATES.SIGNED_OUT) return;
      clearPrivateState();
      ui.resetForms();
      ui.showState(AUTH_STATES.SIGNED_OUT, {
        announcement: "Your session has ended. Log in to continue.",
      });
      return;
    }

    if (event === "PASSWORD_RECOVERY") {
      recoveryMode = true;
      currentSession = session;
      ui.showState(AUTH_STATES.UPDATE_PASSWORD, {
        announcement: "Password reset link accepted. Enter a new password.",
      });
      return;
    }

    if (event === "TOKEN_REFRESHED") {
      currentSession = session;
      return;
    }

    if (event === "USER_UPDATED") {
      currentSession = session ?? currentSession;
      if (!recoveryMode && session?.user) {
        enterAuthenticated(session, { focus: false });
      }
      return;
    }

    if (event === "SIGNED_IN" && !recoveryMode && session?.user) {
      if (pendingOperation === "signup" || pendingOperation === "login") return;
      enterAuthenticated(session);
    }
  }

  async function runOperation(operation, action) {
    if (pendingOperation) return null;
    pendingOperation = operation;
    ui.setBusy(operation, true);

    try {
      return await action();
    } finally {
      ui.setBusy(operation, false);
      pendingOperation = null;
    }
  }

  async function initialize(callback) {
    ui.showState(AUTH_STATES.SESSION_CHECKING, { focus: false });
    unsubscribe = service.subscribe(handleAuthEvent);

    const result = await service.restoreSession();
    initialized = true;

    if (callback.hasProviderError) {
      clearPrivateState();
      ui.showAuthError(getAuthErrorMessage(null, "callback"));
      return;
    }

    if (!result.ok) {
      const message = getAuthErrorMessage(result.error);
      if (message.startsWith("Your session has ended")) {
        showExpiredSession(result.error);
      } else {
        clearPrivateState();
        ui.showAuthError(message);
      }
      return;
    }

    currentSession = result.session;

    if (callback.flow === "recovery" || pendingAuthEvent?.event === "PASSWORD_RECOVERY") {
      if (!currentSession) {
        ui.showAuthError(getAuthErrorMessage(null, "callback"));
        return;
      }

      recoveryMode = true;
      ui.showState(AUTH_STATES.UPDATE_PASSWORD, {
        announcement: "Password reset link accepted. Enter a new password.",
      });
      return;
    }

    if (callback.flow === "confirm" && !currentSession) {
      ui.showAuthError(getAuthErrorMessage(null, "callback"));
      return;
    }

    if (currentSession?.user) {
      enterAuthenticated(currentSession, {
        announcement:
          callback.flow === "confirm"
            ? "Email confirmed. You are signed in."
            : "Your session was restored.",
      });
      return;
    }

    ui.showState(AUTH_STATES.SIGNED_OUT, {
      focus: false,
      announcement: "Log in or create an account to continue.",
    });
  }

  function navigate(destination) {
    const nextState = NAVIGATION_STATES[destination];
    if (!nextState) return;
    ui.showState(nextState);
  }

  async function login({ email, password }) {
    ui.clearFormError("login");
    const emailError = validateEmail(email);
    if (emailError) return ui.showFormError("login", emailError, "email");

    const passwordError = validatePassword(password);
    if (passwordError) {
      return ui.showFormError("login", passwordError, "password");
    }

    const result = await runOperation("login", () =>
      service.signIn(email.trim(), password),
    );
    if (!result) return;

    if (!result.ok) {
      ui.showFormError("login", getAuthErrorMessage(result.error, "login"));
      return;
    }

    recoveryMode = false;
    enterAuthenticated(result.session, {
      announcement: "You are signed in. Loading your profile.",
    });
  }

  async function signUp({ email, password, passwordConfirmation }) {
    ui.clearFormError("signup");
    const emailError = validateEmail(email);
    if (emailError) return ui.showFormError("signup", emailError, "email");

    const passwordError = validatePassword(password);
    if (passwordError) {
      return ui.showFormError("signup", passwordError, "password");
    }

    const confirmationError = validatePasswordConfirmation(
      password,
      passwordConfirmation,
    );
    if (confirmationError) {
      return ui.showFormError(
        "signup",
        confirmationError,
        "passwordConfirmation",
      );
    }

    const normalizedEmail = email.trim();
    const result = await runOperation("signup", () =>
      service.signUp(normalizedEmail, password),
    );
    if (!result) return;

    const message = result.ok
      ? null
      : getAuthErrorMessage(result.error, "signup");
    if (message) {
      ui.showFormError("signup", message);
      return;
    }

    ui.setVerificationEmail(normalizedEmail);
    ui.showState(AUTH_STATES.VERIFICATION_PENDING, {
      announcement: "Check your email for an account confirmation link.",
    });
  }

  async function forgotPassword({ email }) {
    ui.clearFormError("forgot");
    const emailError = validateEmail(email);
    if (emailError) return ui.showFormError("forgot", emailError, "email");

    const result = await runOperation("forgot", () =>
      service.requestPasswordReset(email.trim()),
    );
    if (!result) return;

    if (!result.ok) {
      ui.showFormError("forgot", getAuthErrorMessage(result.error));
      return;
    }

    ui.showState(AUTH_STATES.RESET_REQUESTED, {
      announcement:
        "If an account uses that email, a password reset link is on its way.",
    });
  }

  async function updatePassword({ password, passwordConfirmation }) {
    ui.clearFormError("update");
    const passwordError = validatePassword(password);
    if (passwordError) {
      return ui.showFormError("update", passwordError, "password");
    }

    const confirmationError = validatePasswordConfirmation(
      password,
      passwordConfirmation,
    );
    if (confirmationError) {
      return ui.showFormError(
        "update",
        confirmationError,
        "passwordConfirmation",
      );
    }

    if (!recoveryMode || !currentSession) {
      ui.showAuthError(getAuthErrorMessage(null, "callback"));
      return;
    }

    const result = await runOperation("update", () =>
      service.updatePassword(password),
    );
    if (!result) return;

    if (!result.ok) {
      ui.showFormError(
        "update",
        getAuthErrorMessage(result.error, "password-update"),
      );
      return;
    }

    recoveryMode = false;
    enterAuthenticated(currentSession, {
      announcement: "Password updated. You are signed in.",
    });
  }

  async function logout() {
    const result = await runOperation("logout", () => service.signOut());
    if (!result) return;

    if (!result.ok) {
      ui.announce(getAuthErrorMessage(result.error));
      return;
    }

    clearPrivateState();
    ui.resetForms();
    ui.showState(AUTH_STATES.SIGNED_OUT, {
      announcement: "You are signed out.",
    });
  }

  return Object.freeze({
    accountDeleted() {
      clearPrivateState();
      ui.resetForms();
      ui.showState(AUTH_STATES.SIGNED_OUT, {
        announcement: "Your account and private data were permanently deleted.",
      });
    },
    destroy() {
      unsubscribe?.();
    },
    forgotPassword,
    initialize,
    login,
    logout,
    navigate,
    signUp,
    updatePassword,
  });
}

