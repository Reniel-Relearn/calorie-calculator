const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MINIMUM_PASSWORD_LENGTH = 8;

export function validateEmail(email) {
  const normalizedEmail = typeof email === "string" ? email.trim() : "";

  if (!normalizedEmail) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return "Enter a valid email address.";
  }
  return null;
}

export function validatePassword(password) {
  if (typeof password !== "string" || password.length === 0) {
    return "Enter your password.";
  }
  if (password.length < MINIMUM_PASSWORD_LENGTH) {
    return `Use at least ${MINIMUM_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export function validatePasswordConfirmation(password, confirmation) {
  if (confirmation !== password) return "The passwords do not match.";
  return null;
}

