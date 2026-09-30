import test from "node:test";
import assert from "node:assert/strict";

import { createAuthController } from "../js/auth/auth-controller.js";
import { getAuthErrorMessage } from "../js/auth/auth-errors.js";
import {
  clearAuthCallbackUrl,
  createAuthRedirectUrl,
  readAuthCallback,
} from "../js/auth/auth-routes.js";
import { AUTH_STATES } from "../js/auth/auth-state.js";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "../js/auth/auth-validation.js";

function createFakeUI() {
  const record = {
    state: null,
    authenticatedUser: null,
    announcement: null,
    errors: [],
    busy: [],
    verificationEmail: null,
    privateClears: 0,
  };

  return {
    record,
    announce(message) {
      record.announcement = message;
    },
    clearFormError() {},
    clearPrivateView() {
      record.privateClears += 1;
    },
    getState: () => record.state,
    resetForms() {},
    setBusy(operation, busy) {
      record.busy.push([operation, busy]);
    },
    setVerificationEmail(email) {
      record.verificationEmail = email;
    },
    showAuthError(message) {
      record.state = AUTH_STATES.AUTH_ERROR;
      record.errors.push({ form: "auth", message });
    },
    showAuthenticated(user, options = {}) {
      record.state = AUTH_STATES.AUTHENTICATED_ONBOARDING_REQUIRED;
      record.authenticatedUser = user;
      record.announcement = options.announcement ?? null;
    },
    showFormError(form, message, field = null) {
      record.errors.push({ form, message, field });
    },
    showState(state, options = {}) {
      record.state = state;
      record.announcement = options.announcement ?? null;
    },
  };
}

function createFakeService(overrides = {}) {
  return {
    restoreSession: async () => ({ ok: true, session: null }),
    subscribe() {
      return () => {};
    },
    signIn: async () => ({ ok: false, error: { code: "invalid_credentials" } }),
    signUp: async () => ({ ok: true }),
    requestPasswordReset: async () => ({ ok: true }),
    updatePassword: async () => ({ ok: true }),
    signOut: async () => ({ ok: true }),
    ...overrides,
  };
}

function createController(service, ui = createFakeUI()) {
  const privateApp = { initializeCalls: 0, initialize() { this.initializeCalls += 1; } };
  const controller = createAuthController({
    service,
    ui,
    initializePrivateApp: () => privateApp,
  });
  return { controller, ui, privateApp };
}

test("builds only fixed same-origin confirmation and recovery redirects", () => {
  assert.equal(
    createAuthRedirectUrl("https://calorie.example", "confirm"),
    "https://calorie.example/?auth=confirm",
  );
  assert.equal(
    createAuthRedirectUrl("http://localhost:5173", "recovery"),
    "http://localhost:5173/?auth=recovery",
  );
  assert.throws(
    () => createAuthRedirectUrl("https://calorie.example", "https://evil.test"),
    /Unsupported/,
  );
  assert.throws(
    () => createAuthRedirectUrl("http://calorie.example", "confirm"),
    /HTTPS/,
  );
});

test("reads callback intent without exposing provider details and clears callback data", () => {
  const location = {
    href: "https://calorie.example/?auth=recovery&error=access_denied#error_description=secret",
  };
  const callback = readAuthCallback(location);
  assert.deepEqual(callback, { flow: "recovery", hasProviderError: true });

  let replacement = null;
  assert.equal(
    clearAuthCallbackUrl(location, {
      replaceState(_state, _title, value) {
        replacement = value;
      },
    }),
    true,
  );
  assert.equal(replacement, "/");
});

test("preserves unrelated application anchors", () => {
  let replacement = null;
  assert.equal(
    clearAuthCallbackUrl(
      { href: "https://calorie.example/#calculator" },
      { replaceState: (...values) => { replacement = values; } },
    ),
    false,
  );
  assert.equal(replacement, null);
});

test("recognizes and removes implicit recovery credentials", () => {
  const location = {
    href: "https://calorie.example/#access_token=test-token&refresh_token=test-refresh&type=recovery",
  };
  assert.deepEqual(readAuthCallback(location), {
    flow: "recovery",
    hasProviderError: false,
  });
  let replacement = null;
  assert.equal(
    clearAuthCallbackUrl(location, {
      replaceState(_state, _title, value) {
        replacement = value;
      },
    }),
    true,
  );
  assert.equal(replacement, "/");
});

test("validates email, password length, and confirmation", () => {
  assert.equal(validateEmail("bad"), "Enter a valid email address.");
  assert.equal(validateEmail(" person@example.com "), null);
  assert.equal(validatePassword("short"), "Use at least 8 characters.");
  assert.equal(validatePassword("long-enough"), null);
  assert.equal(
    validatePasswordConfirmation("long-enough", "different"),
    "The passwords do not match.",
  );
});

test("sanitizes provider errors and keeps login responses enumeration-resistant", () => {
  assert.equal(
    getAuthErrorMessage({ code: "invalid_credentials", message: "provider detail" }, "login"),
    "The email or password is incorrect.",
  );
  assert.equal(
    getAuthErrorMessage({ code: "user_already_exists" }, "signup"),
    null,
  );
  assert.equal(
    getAuthErrorMessage({ code: "unknown", message: "token=secret" }),
    "We couldn't complete that account request. Try again.",
  );
});

test("keeps protected content hidden when no session exists", async () => {
  const { controller, ui } = createController(createFakeService());
  await controller.initialize({ flow: null, hasProviderError: false });

  assert.equal(ui.record.state, AUTH_STATES.SIGNED_OUT);
  assert.equal(ui.record.authenticatedUser, null);
});

test("restores a validated session into the authenticated onboarding-required shell", async () => {
  const user = { id: "user-1", email: "person@example.com" };
  const session = { user };
  const { controller, ui } = createController(
    createFakeService({
      restoreSession: async () => ({ ok: true, session }),
    }),
  );

  await controller.initialize({ flow: null, hasProviderError: false });
  assert.equal(
    ui.record.state,
    AUTH_STATES.AUTHENTICATED_ONBOARDING_REQUIRED,
  );
  assert.equal(ui.record.authenticatedUser, user);
});

test("shows the same verification-pending response for new and existing emails", async () => {
  for (const signUpResult of [
    { ok: true },
    { ok: false, error: { code: "user_already_exists" } },
  ]) {
    const { controller, ui } = createController(
      createFakeService({ signUp: async () => signUpResult }),
    );
    await controller.initialize({ flow: null, hasProviderError: false });
    await controller.signUp({
      email: "person@example.com",
      password: "password-123",
      passwordConfirmation: "password-123",
    });

    assert.equal(ui.record.state, AUTH_STATES.VERIFICATION_PENDING);
    assert.equal(ui.record.verificationEmail, "person@example.com");
  }
});

test("does not reveal an unconfirmed shell when confirmation is misconfigured", async () => {
  let authListener;
  const service = createFakeService({
    subscribe(listener) {
      authListener = listener;
      return () => {};
    },
    async signUp() {
      authListener("SIGNED_IN", {
        user: { id: "unexpected", email: "person@example.com" },
      });
      authListener("SIGNED_OUT", null);
      return { ok: false, error: { code: "CONFIRMATION_DISABLED" } };
    },
  });
  const { controller, ui } = createController(service);
  await controller.initialize({ flow: null, hasProviderError: false });
  controller.navigate("signup");
  await controller.signUp({
    email: "person@example.com",
    password: "password-123",
    passwordConfirmation: "password-123",
  });

  assert.notEqual(
    ui.record.state,
    AUTH_STATES.AUTHENTICATED_ONBOARDING_REQUIRED,
  );
  assert.equal(ui.record.state, AUTH_STATES.SIGNUP);
  assert.match(ui.record.errors.at(-1).message, /confirmation is not enabled/i);
});

test("handles invalid login and valid login without leaking provider messages", async () => {
  const invalid = createController(createFakeService());
  await invalid.controller.initialize({ flow: null, hasProviderError: false });
  await invalid.controller.login({
    email: "person@example.com",
    password: "password-123",
  });
  assert.equal(
    invalid.ui.record.errors.at(-1).message,
    "The email or password is incorrect.",
  );

  const session = { user: { id: "user-1", email: "person@example.com" } };
  const valid = createController(
    createFakeService({ signIn: async () => ({ ok: true, session }) }),
  );
  await valid.controller.initialize({ flow: null, hasProviderError: false });
  await valid.controller.login({
    email: "person@example.com",
    password: "password-123",
  });
  assert.equal(
    valid.ui.record.state,
    AUTH_STATES.AUTHENTICATED_ONBOARDING_REQUIRED,
  );
});

test("requires a valid recovery session before password update", async () => {
  const noSession = createController(createFakeService());
  await noSession.controller.initialize({
    flow: "recovery",
    hasProviderError: false,
  });
  assert.equal(noSession.ui.record.state, AUTH_STATES.AUTH_ERROR);

  const session = { user: { id: "user-1", email: "person@example.com" } };
  let updatedPassword = null;
  const valid = createController(
    createFakeService({
      restoreSession: async () => ({ ok: true, session }),
      updatePassword: async (password) => {
        updatedPassword = password;
        return { ok: true };
      },
    }),
  );
  await valid.controller.initialize({
    flow: "recovery",
    hasProviderError: false,
  });
  assert.equal(valid.ui.record.state, AUTH_STATES.UPDATE_PASSWORD);
  await valid.controller.updatePassword({
    password: "new-password-123",
    passwordConfirmation: "new-password-123",
  });
  assert.equal(updatedPassword, "new-password-123");
  assert.equal(
    valid.ui.record.state,
    AUTH_STATES.AUTHENTICATED_ONBOARDING_REQUIRED,
  );
});

test("clears private state on logout and expired session restoration", async () => {
  const session = { user: { id: "user-1", email: "person@example.com" } };
  const active = createController(
    createFakeService({
      restoreSession: async () => ({ ok: true, session }),
    }),
  );
  await active.controller.initialize({ flow: null, hasProviderError: false });
  await active.controller.logout();
  assert.equal(active.ui.record.state, AUTH_STATES.SIGNED_OUT);
  assert.equal(active.privateApp.initializeCalls, 1);

  const expired = createController(
    createFakeService({
      restoreSession: async () => ({
        ok: false,
        error: { code: "refresh_token_not_found" },
      }),
    }),
  );
  await expired.controller.initialize({ flow: null, hasProviderError: false });
  assert.equal(expired.ui.record.state, AUTH_STATES.LOGIN);
  assert.match(expired.ui.record.errors.at(-1).message, /session has ended/i);
});

test("prevents duplicate form submission while an auth request is pending", async () => {
  let resolveLogin;
  let calls = 0;
  const deferred = new Promise((resolve) => {
    resolveLogin = resolve;
  });
  const { controller } = createController(
    createFakeService({
      signIn: async () => {
        calls += 1;
        return deferred;
      },
    }),
  );
  await controller.initialize({ flow: null, hasProviderError: false });

  const credentials = {
    email: "person@example.com",
    password: "password-123",
  };
  const first = controller.login(credentials);
  const second = controller.login(credentials);
  assert.equal(calls, 1);
  resolveLogin({
    ok: true,
    session: { user: { id: "user-1", email: credentials.email } },
  });
  await Promise.all([first, second]);
});

