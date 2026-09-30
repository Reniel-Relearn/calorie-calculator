import test from "node:test";
import assert from "node:assert/strict";

import { createAuthService } from "../js/auth/auth-service.js";

function createClient(overrides = {}) {
  const calls = [];
  const auth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signUp: async (value) => {
      calls.push(["signUp", value]);
      return { data: { session: null }, error: null };
    },
    signInWithPassword: async (value) => {
      calls.push(["signIn", value]);
      return { data: { session: { user: { id: "1" } } }, error: null };
    },
    resetPasswordForEmail: async (...values) => {
      calls.push(["reset", ...values]);
      return { data: {}, error: null };
    },
    updateUser: async (value) => {
      calls.push(["update", value]);
      return { data: { user: { id: "1" } }, error: null };
    },
    signOut: async (value) => {
      calls.push(["signOut", value]);
      return { error: null };
    },
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe() {} } },
    }),
    ...overrides,
  };
  return { client: { auth }, calls };
}

test("uses fixed callback URLs for signup and password reset", async () => {
  const { client, calls } = createClient();
  const service = createAuthService(client, "https://calorie.example");

  await service.signUp("person@example.com", "password-123");
  await service.requestPasswordReset("person@example.com");

  assert.deepEqual(calls[0], [
    "signUp",
    {
      email: "person@example.com",
      password: "password-123",
      options: { emailRedirectTo: "https://calorie.example/?auth=confirm" },
    },
  ]);
  assert.deepEqual(calls[1], [
    "reset",
    "person@example.com",
    { redirectTo: "https://calorie.example/?auth=recovery" },
  ]);
});

test("validates a stored session against the Auth server before restoring it", async () => {
  const storedSession = { access_token: "not-shown", user: { id: "stale" } };
  const validatedUser = { id: "validated", email: "person@example.com" };
  const { client } = createClient({
    getSession: async () => ({ data: { session: storedSession }, error: null }),
    getUser: async () => ({ data: { user: validatedUser }, error: null }),
  });

  const result = await createAuthService(
    client,
    "https://calorie.example",
  ).restoreSession();
  assert.equal(result.ok, true);
  assert.equal(result.session.user, validatedUser);
});

test("clears an invalid stored session and refuses protected restoration", async () => {
  const { client, calls } = createClient({
    getSession: async () => ({
      data: { session: { user: { id: "stale" } } },
      error: null,
    }),
    getUser: async () => ({
      data: { user: null },
      error: { code: "refresh_token_not_found" },
    }),
  });

  const result = await createAuthService(
    client,
    "https://calorie.example",
  ).restoreSession();
  assert.equal(result.ok, false);
  assert.deepEqual(calls.at(-1), ["signOut", { scope: "local" }]);
});

test("stops signup if provider email confirmation is disabled", async () => {
  const { client, calls } = createClient({
    signUp: async () => ({
      data: { session: { user: { id: "unexpected" } } },
      error: null,
    }),
  });
  const result = await createAuthService(
    client,
    "https://calorie.example",
  ).signUp("person@example.com", "password-123");

  assert.deepEqual(result, {
    ok: false,
    error: { code: "CONFIRMATION_DISABLED" },
  });
  assert.deepEqual(calls.at(-1), ["signOut", { scope: "local" }]);
});

test("uses local signout so other device sessions remain independent", async () => {
  const { client, calls } = createClient();
  await createAuthService(client, "https://calorie.example").signOut();
  assert.deepEqual(calls.at(-1), ["signOut", { scope: "local" }]);
});

test("defers auth event work outside the provider callback", () => {
  let providerCallback;
  let scheduled = null;
  const { client } = createClient({
    onAuthStateChange(callback) {
      providerCallback = callback;
      return { data: { subscription: { unsubscribe() {} } } };
    },
  });
  const service = createAuthService(
    client,
    "https://calorie.example",
    (callback) => {
      scheduled = callback;
    },
  );
  let received = null;
  service.subscribe((event) => {
    received = event;
  });

  providerCallback("SIGNED_IN", { user: { id: "1" } });
  assert.equal(received, null);
  scheduled();
  assert.equal(received, "SIGNED_IN");
});

