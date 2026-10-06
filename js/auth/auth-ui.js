import { AUTH_STATES } from "./auth-state.js";

const AUTH_SECTION_IDS = Object.freeze({
  [AUTH_STATES.SESSION_CHECKING]: "auth-session-checking",
  [AUTH_STATES.SIGNED_OUT]: "auth-signed-out",
  [AUTH_STATES.LOGIN]: "auth-login",
  [AUTH_STATES.SIGNUP]: "auth-signup",
  [AUTH_STATES.FORGOT_PASSWORD]: "auth-forgot-password",
  [AUTH_STATES.VERIFICATION_PENDING]: "auth-verification-pending",
  [AUTH_STATES.RESET_REQUESTED]: "auth-reset-requested",
  [AUTH_STATES.UPDATE_PASSWORD]: "auth-update-password",
  [AUTH_STATES.AUTH_ERROR]: "auth-error",
});

const FORM_CONFIG = Object.freeze({
  login: { formId: "login-form", buttonId: "login-submit" },
  signup: { formId: "signup-form", buttonId: "signup-submit" },
  forgot: { formId: "forgot-password-form", buttonId: "forgot-submit" },
  update: { formId: "update-password-form", buttonId: "update-password-submit" },
  logout: { formId: null, buttonId: "logout-button" },
});

function requiredElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required authentication element: #${id}`);
  return element;
}

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

export function createAuthUI(handlers) {
  let state = AUTH_STATES.SESSION_CHECKING;
  let announcementToken = 0;

  const authSections = Object.fromEntries(
    Object.entries(AUTH_SECTION_IDS).map(([authState, id]) => [
      authState,
      requiredElement(id),
    ]),
  );

  const elements = {
    authMain: requiredElement("auth-main"),
    protectedApp: requiredElement("protected-app"),
    accountControls: requiredElement("account-controls"),
    accountEmail: requiredElement("account-email"),
    authAnnouncement: requiredElement("auth-announcement"),
    authErrorMessage: requiredElement("auth-error-message"),
    verificationEmail: requiredElement("verification-email"),
    skipAuth: requiredElement("skip-auth"),
    skipApp: requiredElement("skip-app"),
  };

  function announce(message) {
    announcementToken += 1;
    const token = announcementToken;
    elements.authAnnouncement.textContent = "";
    requestAnimationFrame(() => {
      if (token === announcementToken) {
        elements.authAnnouncement.textContent = message;
      }
    });
  }

  function focusHeading(section) {
    const heading = section.querySelector("h1, h2");
    if (heading) requestAnimationFrame(() => heading.focus());
  }

  function showState(nextState, options = {}) {
    const { focus = true, announcement = null } = options;
    state = nextState;

    for (const section of Object.values(authSections)) section.hidden = true;
    elements.authMain.hidden = false;
    elements.protectedApp.hidden = true;
    elements.accountControls.hidden = true;
    elements.skipAuth.hidden = false;
    elements.skipApp.hidden = true;

    const section = authSections[nextState];
    if (!section) throw new Error(`Unsupported authentication state: ${nextState}`);
    section.hidden = false;

    if (focus) focusHeading(section);
    if (announcement) announce(announcement);
  }

  function showAuthenticated(user, options = {}) {
    state = AUTH_STATES.AUTHENTICATED_ONBOARDING_REQUIRED;
    for (const section of Object.values(authSections)) section.hidden = true;
    elements.authMain.hidden = true;
    elements.protectedApp.hidden = false;
    elements.accountControls.hidden = false;
    elements.accountEmail.textContent = user?.email ?? "Signed in";
    elements.skipAuth.hidden = true;
    elements.skipApp.hidden = false;

    if (options.focus !== false) {
      focusHeading(requiredElement("profile-loading"));
    }
    announce(options.announcement ?? "You are signed in. Loading your profile.");
  }

  function clearPrivateView() {
    elements.accountEmail.textContent = "";
    elements.accountControls.hidden = true;
    elements.protectedApp.hidden = true;
  }

  function clearFormError(formName) {
    const error = requiredElement(`${formName}-error`);
    error.textContent = "";
    error.hidden = true;

    const formId = FORM_CONFIG[formName]?.formId;
    if (!formId) return;
    for (const field of requiredElement(formId).elements) {
      if (field instanceof HTMLElement) field.removeAttribute("aria-invalid");
    }
  }

  function showFormError(formName, message, fieldName = null) {
    clearFormError(formName);
    const error = requiredElement(`${formName}-error`);
    error.textContent = message;
    error.hidden = false;

    const formId = FORM_CONFIG[formName]?.formId;
    const form = formId ? requiredElement(formId) : null;
    const field = fieldName && form ? form.elements.namedItem(fieldName) : null;
    if (field instanceof HTMLElement) {
      field.setAttribute("aria-invalid", "true");
      field.focus();
    }
  }

  function setBusy(operation, isBusy) {
    const config = FORM_CONFIG[operation];
    if (!config) return;

    const button = requiredElement(config.buttonId);
    button.disabled = isBusy;
    button.setAttribute("aria-busy", String(isBusy));

    if (!config.formId) return;
    const form = requiredElement(config.formId);
    for (const field of form.elements) field.disabled = isBusy;
  }

  function resetForms() {
    for (const [formName, config] of Object.entries(FORM_CONFIG)) {
      if (!config.formId) continue;
      requiredElement(config.formId).reset();
      clearFormError(formName);
    }
  }

  for (const button of document.querySelectorAll("[data-auth-view]")) {
    button.addEventListener("click", () => {
      handlers.onNavigate(button.dataset.authView);
    });
  }

  requiredElement("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onLogin(formValues(event.currentTarget));
  });

  requiredElement("signup-form").addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onSignUp(formValues(event.currentTarget));
  });

  requiredElement("forgot-password-form").addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      handlers.onForgotPassword(formValues(event.currentTarget));
    },
  );

  requiredElement("update-password-form").addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      handlers.onUpdatePassword(formValues(event.currentTarget));
    },
  );

  requiredElement("logout-button").addEventListener("click", () => {
    handlers.onLogout();
  });

  return Object.freeze({
    announce,
    clearFormError,
    clearPrivateView,
    getState: () => state,
    resetForms,
    setBusy,
    setVerificationEmail(email) {
      elements.verificationEmail.textContent = email;
    },
    showAuthError(message) {
      elements.authErrorMessage.textContent = message;
      showState(AUTH_STATES.AUTH_ERROR, {
        announcement: `Account error. ${message}`,
      });
    },
    showAuthenticated,
    showFormError,
    showState,
  });
}

