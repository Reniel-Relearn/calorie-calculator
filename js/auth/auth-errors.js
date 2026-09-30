const INVALID_SESSION_CODES = new Set([
  "session_not_found",
  "refresh_token_not_found",
  "refresh_token_already_used",
  "bad_jwt",
]);

const INVALID_LINK_CODES = new Set([
  "otp_expired",
  "otp_disabled",
  "invalid_token",
  "flow_state_expired",
  "flow_state_not_found",
]);

function isNetworkError(error) {
  return (
    error?.status === 0 ||
    error?.name === "AuthRetryableFetchError" ||
    /fetch|network/i.test(error?.message ?? "")
  );
}

export function getAuthErrorMessage(error, context = "general") {
  const code = error?.code ?? "";

  if (error?.code === "CONFIRMATION_DISABLED") {
    return "Email confirmation is not enabled for this environment. Account creation has been stopped.";
  }

  if (isNetworkError(error)) {
    return "We couldn't reach the account service. Check your connection and try again.";
  }

  if (INVALID_SESSION_CODES.has(code)) {
    return "Your session has ended. Log in again to continue.";
  }

  if (INVALID_LINK_CODES.has(code) || context === "callback") {
    return "This account link is invalid or has expired. Request a new link and try again.";
  }

  if (code === "email_not_confirmed") {
    return "Confirm your email before logging in.";
  }

  if (code === "weak_password") {
    return "Use a password with at least 8 characters.";
  }

  if (code === "same_password") {
    return "Choose a password you have not used for this account.";
  }

  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit"
  ) {
    return "Too many requests were made. Wait a few minutes, then try again.";
  }

  if (context === "login" || code === "invalid_credentials") {
    return "The email or password is incorrect.";
  }

  if (context === "signup" && code === "user_already_exists") {
    return null;
  }

  if (context === "password-update") {
    return "Your password could not be updated. Request a new reset link and try again.";
  }

  return "We couldn't complete that account request. Try again.";
}

