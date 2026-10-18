const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

const CAPTCHA_CONTAINERS = Object.freeze({
  delete: "settings-delete-captcha",
  login: "login-captcha",
  signup: "signup-captcha",
  forgot: "forgot-captcha",
});

function result(ok, details = {}) {
  return Object.freeze({ ok, ...details });
}

export function createAuthCaptcha({
  appEnvironment,
  siteKey,
  documentObject = globalThis.document,
  windowObject = globalThis.window,
} = {}) {
  const localBypass = appEnvironment === "local" && !siteKey;
  const tokens = new Map();
  const widgetIds = new Map();
  let scriptPromise = null;

  function containerFor(operation) {
    const id = CAPTCHA_CONTAINERS[operation];
    return id ? documentObject?.getElementById(id) : null;
  }

  function setStatus(operation, message) {
    const container = containerFor(operation);
    if (container) container.textContent = message;
  }

  function loadTurnstile() {
    if (windowObject?.turnstile) return Promise.resolve(windowObject.turnstile);
    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
      const existing = documentObject?.querySelector(
        `script[src="${TURNSTILE_SCRIPT_URL}"]`,
      );
      const script = existing ?? documentObject?.createElement("script");
      if (!script) {
        reject(new Error("Turnstile cannot load without a document."));
        return;
      }

      const onLoad = () => {
        if (windowObject?.turnstile) resolve(windowObject.turnstile);
        else reject(new Error("Turnstile did not initialize."));
      };
      const onError = () => reject(new Error("Turnstile could not load."));
      script.addEventListener("load", onLoad, { once: true });
      script.addEventListener("error", onError, { once: true });

      if (!existing) {
        script.src = TURNSTILE_SCRIPT_URL;
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
        documentObject.head.append(script);
      }
    });

    return scriptPromise;
  }

  async function prepare(operation) {
    if (!CAPTCHA_CONTAINERS[operation]) return;
    if (localBypass || widgetIds.has(operation)) return;
    if (!siteKey) {
      setStatus(operation, "Security verification is unavailable. Try again later.");
      return;
    }

    try {
      const turnstile = await loadTurnstile();
      const container = containerFor(operation);
      if (!container || widgetIds.has(operation)) return;
      container.textContent = "";
      const widgetId = turnstile.render(container, {
        sitekey: siteKey,
        action: `auth_${operation}`,
        size: "compact",
        callback(token) {
          tokens.set(operation, token);
        },
        "expired-callback"() {
          tokens.delete(operation);
        },
        "error-callback"() {
          tokens.delete(operation);
        },
        "response-field": false,
      });
      widgetIds.set(operation, widgetId);
    } catch {
      setStatus(operation, "Security verification could not load. Try again.");
    }
  }

  function getToken(operation) {
    if (localBypass) return result(true, { token: "local-development" });
    if (!siteKey) return result(false, { code: "CAPTCHA_UNAVAILABLE" });

    const token = tokens.get(operation);
    if (!token) return result(false, { code: "CAPTCHA_REQUIRED" });
    return result(true, { token });
  }

  function reset(operation) {
    tokens.delete(operation);
    const widgetId = widgetIds.get(operation);
    if (widgetId !== undefined && windowObject?.turnstile) {
      windowObject.turnstile.reset(widgetId);
    }
  }

  return Object.freeze({ getToken, prepare, reset });
}
