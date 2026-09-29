import test from "node:test";
import assert from "node:assert/strict";

import {
  EnvironmentConfigurationError,
  getPublicSupabaseConfig,
} from "../js/config/environment.js";

const validEnvironment = Object.freeze({
  VITE_APP_ENV: "staging",
  VITE_SUPABASE_URL: "https://caloriecheck-staging.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY:
    "sb_publishable_test_value_that_is_long_enough",
});

test("accepts current public Supabase configuration", () => {
  assert.deepEqual(getPublicSupabaseConfig(validEnvironment), {
    appEnvironment: "staging",
    supabaseUrl: "https://caloriecheck-staging.supabase.co",
    supabasePublishableKey: "sb_publishable_test_value_that_is_long_enough",
  });
});

test("accepts localhost HTTP for the local Supabase stack", () => {
  const result = getPublicSupabaseConfig({
    ...validEnvironment,
    VITE_APP_ENV: "local",
    VITE_SUPABASE_URL: "http://127.0.0.1:54321/",
  });

  assert.equal(result.supabaseUrl, "http://127.0.0.1:54321");
});

test("rejects missing public configuration without exposing values", () => {
  assert.throws(
    () => getPublicSupabaseConfig({}),
    (error) =>
      error instanceof EnvironmentConfigurationError &&
      error.message ===
        "VITE_APP_ENV is required for Supabase-backed Version 2 features.",
  );
});

test("rejects insecure remote URLs", () => {
  assert.throws(
    () =>
      getPublicSupabaseConfig({
        ...validEnvironment,
        VITE_SUPABASE_URL: "http://caloriecheck-staging.supabase.co",
      }),
    /must use HTTPS/,
  );
});

test("rejects legacy or placeholder client keys", () => {
  for (const key of [
    "eyJhbGciOiJIUzI1NiJ9.legacy-anon-key",
    "sb_publishable_too_short",
    "sb_publishable_REPLACE_WITH_PROVIDER_VALUE",
  ]) {
    assert.throws(
      () =>
        getPublicSupabaseConfig({
          ...validEnvironment,
          VITE_SUPABASE_PUBLISHABLE_KEY: key,
        }),
      /must be a current sb_publishable_ key/,
    );
  }
});
