import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const APP_URL = process.env.AUTH_TEST_APP_URL ?? "http://127.0.0.1:5173/";
const CDP_URL = process.env.AUTH_TEST_CDP_URL ?? "http://127.0.0.1:9223";
const MAILPIT_URL = process.env.AUTH_TEST_MAILPIT_URL ?? "http://127.0.0.1:54324";
const PASSWORD = "Local-test-password-123";
const UPDATED_PASSWORD = "Updated-local-password-456";
const EMAIL = `auth-test-${Date.now()}@example.test`;

const CHROME_CANDIDATES = [
  process.env.AUTH_TEST_CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function isCdpReady() {
  try {
    return (await fetch(`${CDP_URL}/json/version`)).ok;
  } catch {
    return false;
  }
}

async function ensureTestBrowser() {
  if (await isCdpReady()) return async () => {};

  let chromePath = null;
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await access(candidate);
      chromePath = candidate;
      break;
    } catch {
      // Continue to the next platform path.
    }
  }
  if (!chromePath) {
    throw new Error(
      "Chrome was not found. Set AUTH_TEST_CHROME_PATH to run local auth integration.",
    );
  }

  const profileDirectory = await mkdtemp(join(tmpdir(), "caloriecheck-auth-"));
  const cdpPort = new URL(CDP_URL).port || "9222";
  const browser = spawn(
    chromePath,
    [
      "--headless=new",
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${profileDirectory}`,
      "--disable-gpu",
      "--disable-breakpad",
      "--disable-crash-reporter",
      "--no-first-run",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline && !(await isCdpReady())) await delay(100);
  if (!(await isCdpReady())) {
    browser.kill();
    throw new Error("Headless Chrome did not expose its test endpoint.");
  }

  return async () => {
    browser.kill();
    if (profileDirectory.startsWith(tmpdir())) {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        try {
          await rm(profileDirectory, { recursive: true, force: true });
          break;
        } catch (error) {
          if (error.code !== "EBUSY" || attempt === 19) throw error;
          await delay(250);
        }
      }
    }
  };
}

async function createPage() {
  const response = await fetch(
    `${CDP_URL}/json/new?${encodeURIComponent(APP_URL)}`,
    { method: "PUT" },
  );
  if (!response.ok) throw new Error("Unable to create a Chrome test page.");
  const target = await response.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let commandId = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  function send(method, params = {}) {
    commandId += 1;
    return new Promise((resolve, reject) => {
      pending.set(commandId, { resolve, reject });
      socket.send(JSON.stringify({ id: commandId, method, params }));
    });
  }

  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text ?? "Browser evaluation failed.");
    }
    return result.result.value;
  }

  async function waitFor(expression, message, timeout = 10_000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await evaluate(expression)) return;
      await delay(100);
    }
    throw new Error(message);
  }

  async function navigate(url) {
    await send("Page.navigate", { url });
    await waitFor(
      "document.readyState === 'complete'",
      `Page did not finish loading: ${url}`,
    );
  }

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await waitFor(
    "document.readyState === 'complete'",
    "Initial application page did not load.",
  );

  return {
    close: async () => {
      socket.close();
      await fetch(`${CDP_URL}/json/close/${target.id}`);
    },
    evaluate,
    navigate,
    pressEnter: async () => {
      await send("Input.dispatchKeyEvent", {
        type: "rawKeyDown",
        key: "Enter",
        code: "Enter",
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13,
      });
      await send("Input.dispatchKeyEvent", {
        type: "char",
        key: "Enter",
        code: "Enter",
        text: "\r",
        unmodifiedText: "\r",
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13,
      });
      await send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "Enter",
        code: "Enter",
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13,
      });
    },
    waitFor,
  };
}

async function setForm(page, values) {
  await page.evaluate(`(() => {
    const values = ${JSON.stringify(values)};
    for (const [selector, value] of Object.entries(values)) {
      const field = document.querySelector(selector);
      if (!field) throw new Error('Missing field: ' + selector);
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return true;
  })()`);
}

async function click(page, selector) {
  await page.evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) throw new Error('Missing element: ' + ${JSON.stringify(selector)});
    element.click();
    return true;
  })()`);
}

async function waitForVisible(page, selector, timeout = 10_000) {
  await page.waitFor(
    `(() => { const element = document.querySelector(${JSON.stringify(selector)}); return Boolean(element && !element.hidden); })()`,
    `Expected visible element: ${selector}`,
    timeout,
  );
}

async function waitForMail(recipient, subjectPattern, afterId = null) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const response = await fetch(`${MAILPIT_URL}/api/v1/messages`);
    const mailbox = await response.json();
    const message = mailbox.messages.find((candidate) => {
      const recipients = candidate.To ?? candidate.to ?? [];
      const addresses = recipients.map((item) => item.Address ?? item.address);
      const subject = candidate.Subject ?? candidate.subject ?? "";
      const id = candidate.ID ?? candidate.Id ?? candidate.id;
      return (
        addresses.includes(recipient) &&
        subjectPattern.test(subject) &&
        (!afterId || id !== afterId)
      );
    });

    if (message) {
      const id = message.ID ?? message.Id ?? message.id;
      const detailResponse = await fetch(`${MAILPIT_URL}/api/v1/message/${id}`);
      return { id, detail: await detailResponse.json() };
    }
    await delay(150);
  }
  throw new Error(`Expected local email was not captured for ${recipient}.`);
}

function getFirstHttpLink(message) {
  const content = [
    message.HTML,
    message.Html,
    message.html,
    message.Text,
    message.text,
  ]
    .filter(Boolean)
    .join("\n")
    .replaceAll("&amp;", "&");
  const match = content.match(/https?:\/\/[^\s"'<>]+/);
  if (!match) throw new Error("The captured email did not contain an HTTP link.");
  return match[0];
}

async function run() {
  const page = await createPage();
  try {
    await page.evaluate("localStorage.clear(); true");
    await page.navigate(APP_URL);
    await waitForVisible(page, "#auth-signed-out");
    assert.equal(await page.evaluate("document.querySelector('#protected-app').hidden"), true);
    assert.equal(
      await page.evaluate("document.documentElement.scrollWidth === document.documentElement.clientWidth"),
      true,
    );

    await page.evaluate("document.querySelector('[data-auth-view=signup]').focus()");
    await page.pressEnter();
    await waitForVisible(page, "#auth-signup");
    await page.waitFor(
      "document.activeElement.id === 'signup-heading'",
      "Signup view did not move focus to its heading.",
    );
    await setForm(page, {
      "#signup-email": "invalid",
      "#signup-password": PASSWORD,
      "#signup-password-confirmation": PASSWORD,
    });
    await click(page, "#signup-submit");
    await page.waitFor(
      "document.activeElement.id === 'signup-email' && !document.querySelector('#signup-error').hidden",
      "Signup validation did not focus and announce the invalid email.",
    );
    await setForm(page, {
      "#signup-email": EMAIL,
      "#signup-password": PASSWORD,
      "#signup-password-confirmation": PASSWORD,
    });
    await click(page, "#signup-submit");
    await waitForVisible(page, "#auth-verification-pending");
    assert.equal(await page.evaluate("document.querySelector('#protected-app').hidden"), true);

    const confirmationMail = await waitForMail(EMAIL, /confirm/i);
    await page.navigate(getFirstHttpLink(confirmationMail.detail));
    await waitForVisible(page, "#protected-app", 15_000);
    assert.equal(await page.evaluate("document.querySelector('#auth-main').hidden"), true);
    assert.equal(
      await page.evaluate("document.documentElement.scrollWidth === document.documentElement.clientWidth"),
      true,
    );
    assert.equal(
      await page.evaluate(`[...document.querySelectorAll('button')]
        .filter((button) => !button.closest('[hidden]'))
        .every((button) => button.getBoundingClientRect().height >= 44)`),
      true,
    );

    await setForm(page, { "#food-query": "150g grilled chicken breast" });
    await click(page, "#analyze-food-button");
    await waitForVisible(page, "#state-success");
    assert.equal(await page.evaluate("document.querySelector('#result-calories').value"), "227");

    await page.navigate(APP_URL);
    await waitForVisible(page, "#protected-app", 15_000);

    await click(page, "#logout-button");
    await waitForVisible(page, "#auth-signed-out");
    assert.equal(await page.evaluate("document.querySelector('#protected-app').hidden"), true);

    await click(page, '[data-auth-view="signup"]');
    await setForm(page, {
      "#signup-email": EMAIL,
      "#signup-password": PASSWORD,
      "#signup-password-confirmation": PASSWORD,
    });
    await click(page, "#signup-submit");
    await waitForVisible(page, "#auth-verification-pending");
    await click(page, '[data-auth-view="login"]');
    await setForm(page, {
      "#login-email": EMAIL,
      "#login-password": "incorrect-password",
    });
    await click(page, "#login-submit");
    await page.waitFor(
      "document.querySelector('#login-error').textContent === 'The email or password is incorrect.'",
      "Invalid login did not return the sanitized message.",
    );

    await setForm(page, {
      "#login-email": EMAIL,
      "#login-password": PASSWORD,
    });
    await click(page, "#login-submit");
    await waitForVisible(page, "#protected-app");

    await page.evaluate(`(() => {
      for (const key of Object.keys(localStorage)) {
        if (!key.startsWith('sb-')) continue;
        const stored = JSON.parse(localStorage.getItem(key));
        stored.access_token = 'expired';
        stored.refresh_token = 'revoked';
        stored.expires_at = 1;
        localStorage.setItem(key, JSON.stringify(stored));
      }
      return true;
    })()`);
    await page.navigate(APP_URL);
    await page.waitFor(
      "!document.querySelector('#auth-login').hidden || !document.querySelector('#auth-signed-out').hidden",
      "Expired session did not return to account access.",
      15_000,
    );
    assert.equal(await page.evaluate("document.querySelector('#protected-app').hidden"), true);

    if (await page.evaluate("!document.querySelector('#auth-signed-out').hidden")) {
      await click(page, '[data-auth-view="login"]');
    }
    await setForm(page, {
      "#login-email": EMAIL,
      "#login-password": PASSWORD,
    });
    await click(page, "#login-submit");
    await waitForVisible(page, "#protected-app");
    await click(page, "#logout-button");
    await waitForVisible(page, "#auth-signed-out");

    await click(page, '[data-auth-view="login"]');
    await click(page, '[data-auth-view="forgot"]');
    await setForm(page, { "#forgot-email": EMAIL });
    await click(page, "#forgot-submit");
    await waitForVisible(page, "#auth-reset-requested");

    const resetMail = await waitForMail(EMAIL, /reset/i, confirmationMail.id);
    await page.navigate(getFirstHttpLink(resetMail.detail));
    await waitForVisible(page, "#auth-update-password", 15_000);
    await setForm(page, {
      "#update-password": UPDATED_PASSWORD,
      "#update-password-confirmation": UPDATED_PASSWORD,
    });
    await click(page, "#update-password-submit");
    await waitForVisible(page, "#protected-app");

    await click(page, "#logout-button");
    await waitForVisible(page, "#auth-signed-out");
    await click(page, '[data-auth-view="login"]');
    await setForm(page, {
      "#login-email": EMAIL,
      "#login-password": UPDATED_PASSWORD,
    });
    await click(page, "#login-submit");
    await waitForVisible(page, "#protected-app");

    await page.navigate(`${APP_URL}?auth=recovery&error_code=otp_expired`);
    await waitForVisible(page, "#auth-error");
    assert.equal(await page.evaluate("document.querySelector('#protected-app').hidden"), true);

    console.log("Local auth integration passed: signup, confirmation, protected calculator, session restore, invalid/valid login, expired session, logout, Mailpit reset, password update, and bad-link handling.");
  } finally {
    await page.close();
  }
}

const closeTestBrowser = await ensureTestBrowser();
try {
  await run();
} finally {
  await closeTestBrowser();
}

