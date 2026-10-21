import assert from "node:assert/strict";
import test from "node:test";

import { createAuthCaptcha } from "../js/auth/auth-captcha.js";

test("uses a local-only CAPTCHA adapter when no site key is configured", () => {
  const captcha = createAuthCaptcha({ appEnvironment: "local", siteKey: null });
  assert.deepEqual(captcha.getToken("login"), {
    ok: true,
    token: "local-development",
  });
});

test("fails closed outside local development when no site key is configured", () => {
  const captcha = createAuthCaptcha({ appEnvironment: "staging", siteKey: null });
  assert.deepEqual(captcha.getToken("signup"), {
    ok: false,
    code: "CAPTCHA_UNAVAILABLE",
  });
});

test("requires a completed widget and resets single-use tokens", async () => {
  const container = { textContent: "" };
  let options;
  let resetWidget;
  const windowObject = {
    turnstile: {
      render(element, nextOptions) {
        assert.equal(element, container);
        options = nextOptions;
        return "widget-1";
      },
      reset(widgetId) {
        resetWidget = widgetId;
      },
    },
  };
  const documentObject = {
    getElementById: () => container,
  };
  const captcha = createAuthCaptcha({
    appEnvironment: "staging",
    siteKey: "0x4AAAAAAAA_test_public_site_key",
    documentObject,
    windowObject,
  });

  await captcha.prepare("login");
  assert.deepEqual(captcha.getToken("login"), {
    ok: false,
    code: "CAPTCHA_REQUIRED",
  });
  options.callback("single-use-token");
  assert.deepEqual(captcha.getToken("login"), {
    ok: true,
    token: "single-use-token",
  });
  captcha.reset("login");
  assert.equal(resetWidget, "widget-1");
  assert.equal(captcha.getToken("login").ok, false);
});
