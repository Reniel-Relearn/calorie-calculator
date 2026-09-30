const AUTH_FLOWS = new Set(["confirm", "recovery"]);
const CALLBACK_PARAMETERS = Object.freeze([
  "auth",
  "access_token",
  "code",
  "error",
  "error_code",
  "error_description",
  "expires_at",
  "expires_in",
  "provider_refresh_token",
  "provider_token",
  "refresh_token",
  "token",
  "token_hash",
  "type",
]);

function parseApplicationOrigin(origin) {
  let url;

  try {
    url = new URL(origin);
  } catch {
    throw new TypeError("The application origin must be a valid URL.");
  }

  const isLocalHttp =
    url.protocol === "http:" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1");

  if (url.origin === "null" || (!isLocalHttp && url.protocol !== "https:")) {
    throw new TypeError(
      "Authentication redirects require HTTPS or a local development origin.",
    );
  }

  return url.origin;
}

export function createAuthRedirectUrl(origin, flow) {
  if (!AUTH_FLOWS.has(flow)) {
    throw new TypeError("Unsupported authentication redirect flow.");
  }

  const url = new URL(parseApplicationOrigin(origin));
  url.searchParams.set("auth", flow);
  return url.href;
}

export function readAuthCallback(locationLike) {
  const url = new URL(locationLike.href);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const queryFlow = url.searchParams.get("auth");
  const hashType = hash.get("type");
  const requestedFlow = AUTH_FLOWS.has(queryFlow)
    ? queryFlow
    : hashType === "recovery"
      ? "recovery"
      : hashType === "signup"
        ? "confirm"
        : null;

  return Object.freeze({
    flow: requestedFlow,
    hasProviderError: Boolean(
      url.searchParams.get("error") ||
        url.searchParams.get("error_code") ||
        hash.get("error") ||
        hash.get("error_code"),
    ),
  });
}

export function clearAuthCallbackUrl(locationLike, historyLike) {
  const url = new URL(locationLike.href);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const hasCallbackData =
    CALLBACK_PARAMETERS.some((parameter) => url.searchParams.has(parameter)) ||
    CALLBACK_PARAMETERS.some((parameter) => hash.has(parameter));

  if (!hasCallbackData) return false;

  for (const parameter of CALLBACK_PARAMETERS) {
    url.searchParams.delete(parameter);
  }
  url.hash = "";
  historyLike.replaceState({}, "", `${url.pathname}${url.search}`);
  return true;
}

