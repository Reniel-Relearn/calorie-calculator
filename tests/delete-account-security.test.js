import assert from "node:assert/strict";
import test from "node:test";

import { createDeleteAccountHandler } from "../supabase/functions/delete-account/handler.js";

const ORIGIN = "https://calorie-calculator-gamma-ten.vercel.app";
const PUBLIC_KEY = "public-key";
const SECRET_KEY = "secret-key";
const USER = Object.freeze({ id: "user-1", email: "person@example.com" });

function harness({
  user = USER,
  userError = null,
  throttle = { allowed: true, retryAfterSeconds: 900 },
  throttleError = null,
  passwordAccepted = true,
  deletionError = null,
} = {}) {
  const calls = [];
  const publicClient = {
    auth: {
      async getUser() {
        calls.push(["getUser"]);
        return { data: { user }, error: userError };
      },
      async signInWithPassword(credentials) {
        calls.push(["reauthenticate", credentials]);
        return passwordAccepted
          ? { data: { user }, error: null }
          : { data: { user: null }, error: { code: "invalid_credentials" } };
      },
    },
  };
  const adminClient = {
    async rpc(name, params) {
      calls.push(["rpc", name, params]);
      return { data: throttle, error: throttleError };
    },
    auth: {
      admin: {
        async deleteUser(userId, softDelete) {
          calls.push(["deleteUser", userId, softDelete]);
          return { error: deletionError };
        },
      },
    },
  };
  const handler = createDeleteAccountHandler({
    createClient(_url, key) {
      return key === SECRET_KEY ? adminClient : publicClient;
    },
    getEnv(name) {
      return {
        SUPABASE_URL: "https://project.supabase.co",
        SUPABASE_PUBLISHABLE_KEY: PUBLIC_KEY,
        SUPABASE_SECRET_KEY: SECRET_KEY,
      }[name];
    },
  });
  return { calls, handler };
}

function request(body = {
  captchaToken: "turnstile-token",
  confirmation: "DELETE",
  currentPassword: "password-123",
}, options = {}) {
  return new Request("https://project.supabase.co/functions/v1/delete-account", {
    method: options.method ?? "POST",
    headers: {
      authorization: "Bearer valid-user-token",
      "content-type": "application/json",
      origin: options.origin ?? ORIGIN,
      ...options.headers,
    },
    body: (options.method ?? "POST") === "POST" ? JSON.stringify(body) : undefined,
  });
}

test("allows only exact configured origins and returns no wildcard CORS", async () => {
  const { handler } = harness();
  const forbidden = await handler(request(undefined, { origin: "https://evil.example" }));
  assert.equal(forbidden.status, 403);
  assert.equal(forbidden.headers.get("access-control-allow-origin"), null);

  const preflight = await handler(request(undefined, { method: "OPTIONS" }));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), ORIGIN);
  assert.equal(preflight.headers.get("vary"), "Origin");
});

test("rejects unsupported methods and media types", async () => {
  const { handler } = harness();
  const method = await handler(request(undefined, { method: "GET" }));
  assert.equal(method.status, 405);
  assert.equal(method.headers.get("allow"), "POST, OPTIONS");

  const media = await handler(request(undefined, {
    headers: { "content-type": "text/plain" },
  }));
  assert.equal(media.status, 415);
});

test("rejects malformed, extra-field, and oversized bodies before reauthentication", async () => {
  const first = harness();
  const extra = await first.handler(
    request({ captchaToken: "turnstile-token", confirmation: "DELETE", currentPassword: "password-123", userId: "other" }),
  );
  assert.equal(extra.status, 400);
  assert.equal(first.calls.some(([name]) => name === "rpc"), false);

  const second = harness();
  const oversized = await second.handler(
    request(undefined, { headers: { "content-length": "5000" } }),
  );
  assert.equal(oversized.status, 413);
  assert.equal(second.calls.some(([name]) => name === "rpc"), false);

  const third = harness();
  const missingCaptcha = await third.handler(
    request({ confirmation: "DELETE", currentPassword: "password-123" }),
  );
  assert.equal(missingCaptcha.status, 400);
  assert.deepEqual(await missingCaptcha.json(), { code: "CAPTCHA_REQUIRED" });
  assert.equal(third.calls.some(([name]) => name === "rpc"), false);
});

test("rejects invalid sessions before reading privileged input", async () => {
  const { calls, handler } = harness({ user: null, userError: { code: "bad_jwt" } });
  const response = await handler(request());
  assert.equal(response.status, 401);
  assert.equal(calls.some(([name]) => name === "rpc"), false);
});

test("returns a bounded 429 response before password verification", async () => {
  const { calls, handler } = harness({
    throttle: { allowed: false, retryAfterSeconds: 812 },
  });
  const response = await handler(request());
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "812");
  assert.deepEqual(await response.json(), { code: "TOO_MANY_ATTEMPTS" });
  assert.equal(calls.some(([name]) => name === "reauthenticate"), false);
});

test("fails closed when durable throttle metadata is unavailable", async () => {
  const { handler } = harness({ throttleError: { code: "database_unavailable" } });
  const response = await handler(request());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { code: "ACCOUNT_DELETE_UNAVAILABLE" });
});

test("keeps password verification and hard deletion server-side", async () => {
  const invalid = harness({ passwordAccepted: false });
  assert.equal((await invalid.handler(request())).status, 403);
  assert.equal(invalid.calls.some(([name]) => name === "deleteUser"), false);

  const valid = harness();
  const response = await valid.handler(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { deleted: true });
  assert.deepEqual(valid.calls.find(([name]) => name === "reauthenticate")[1], {
    email: USER.email,
    password: "password-123",
    options: { captchaToken: "turnstile-token" },
  });
  assert.deepEqual(valid.calls.at(-1), ["deleteUser", USER.id, false]);
});
