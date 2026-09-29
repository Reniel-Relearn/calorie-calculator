const APP_ENVIRONMENTS = Object.freeze(["local", "staging", "production"]);
const LOCAL_HOSTNAMES = new Set(["127.0.0.1", "localhost"]);

export class EnvironmentConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "EnvironmentConfigurationError";
  }
}

function requireText(value, variableName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new EnvironmentConfigurationError(
      `${variableName} is required for Supabase-backed Version 2 features.`,
    );
  }

  return value.trim();
}

function validateAppEnvironment(value) {
  const appEnvironment = requireText(value, "VITE_APP_ENV");

  if (!APP_ENVIRONMENTS.includes(appEnvironment)) {
    throw new EnvironmentConfigurationError(
      "VITE_APP_ENV must be local, staging, or production.",
    );
  }

  return appEnvironment;
}

function validateSupabaseUrl(value) {
  const rawUrl = requireText(value, "VITE_SUPABASE_URL");
  let parsedUrl;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new EnvironmentConfigurationError(
      "VITE_SUPABASE_URL must be a valid absolute URL.",
    );
  }

  const isLocalHttp =
    parsedUrl.protocol === "http:" && LOCAL_HOSTNAMES.has(parsedUrl.hostname);
  const isSecureRemote = parsedUrl.protocol === "https:";

  if (!isLocalHttp && !isSecureRemote) {
    throw new EnvironmentConfigurationError(
      "VITE_SUPABASE_URL must use HTTPS, except for localhost development.",
    );
  }

  return parsedUrl.href.replace(/\/$/, "");
}

function validatePublishableKey(value) {
  const publishableKey = requireText(
    value,
    "VITE_SUPABASE_PUBLISHABLE_KEY",
  );

  if (
    !/^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(publishableKey) ||
    publishableKey.includes("REPLACE_WITH")
  ) {
    throw new EnvironmentConfigurationError(
      "VITE_SUPABASE_PUBLISHABLE_KEY must be a current sb_publishable_ key.",
    );
  }

  return publishableKey;
}

export function getPublicSupabaseConfig(environment = import.meta.env) {
  return Object.freeze({
    appEnvironment: validateAppEnvironment(environment?.VITE_APP_ENV),
    supabaseUrl: validateSupabaseUrl(environment?.VITE_SUPABASE_URL),
    supabasePublishableKey: validatePublishableKey(
      environment?.VITE_SUPABASE_PUBLISHABLE_KEY,
    ),
  });
}
