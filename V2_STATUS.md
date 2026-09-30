# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-P2 — Authentication and Persistent Session Foundation
**Current Phase Status:** BLOCKED — USER ACTION REQUIRED
**Next Phase:** V2-P3 — Database Schema, Migrations, and Row-Level Authorization (not authorized until V2-P2 is verified and marked DONE)
**Overall V2 Status:** IN PROGRESS

## Completed Phases

- V2-P0 — Master Planning and Architecture — completed 2026-09-28
- V2-P1 — Development Platform and Staging Foundation — completed 2026-09-30

## Current Blockers

- The V2-P2 implementation and all required local checks pass, but the new build has not been deployed to staging. The local Vercel CLI has an invalid stored login token, and the Git workflow prohibits Codex from committing or pushing automatically.
- Real staging confirmation-email receipt, confirmation callback, reset-email receipt, and recovery callback have not yet been checked against the deployed V2-P2 build.
- The staging dashboard still needs a human confirmation that email verification is enabled and the minimum password length is at least eight characters.

V2-P2 must remain blocked until these external checks pass. No V2-P3 work has started.

## Required Human Actions

1. Review the current diff. If approved, commit it with `Implement V2 email authentication foundation` and push the branch connected to the staging Vercel project. Do not send or commit any password, confirmation link, recovery link, session token, Supabase secret key, legacy `service_role` key, SMTP credential, or Vercel token.
2. In Vercel, wait for the deployment sourced from that commit to show **Ready**. Open `https://calorie-calculator-gamma-ten.vercel.app/` and confirm that it shows the Log In/Create Account gateway rather than the public calculator.
3. In the staging Supabase dashboard, open **Authentication → URL Configuration**. Keep the Site URL as `https://calorie-calculator-gamma-ten.vercel.app/` and add these exact redirect URLs if they are not already present:
   - `https://calorie-calculator-gamma-ten.vercel.app/?auth=confirm`
   - `https://calorie-calculator-gamma-ten.vercel.app/?auth=recovery`
4. In the staging Supabase Authentication settings, confirm that email/password signup is enabled, **Confirm email** is enabled, and the minimum password length is **8** or greater. Do not configure production SMTP during V2-P2.
5. Use a dedicated synthetic test mailbox you control and a unique test password that is not used anywhere else:
   - Create an account on staging and confirm that the private calculator remains unavailable before email confirmation.
   - Confirm the email arrives. Open its link and confirm it returns to the staging origin, shows the authenticated account-setup notice, and makes the calculator available.
   - Refresh once and confirm the session remains signed in; then log out and confirm the calculator becomes unavailable.
   - Request a password reset, confirm the reset email arrives, open its link, set a new unique test password, and confirm the new password can log in.
6. Report only whether each check passed or the exact visible non-secret error. Do not paste the password, email links, URL fragments, tokens, or provider credentials into chat.

Successful completion looks like both emails arriving, both links returning to the staging origin, refresh restoring the session, logout protecting the calculator, and the new password working without any private-shell flash or raw provider error.

## V2-P2 Local Implementation Summary

- Added signed-out, login, signup, verification-pending, forgot-password, reset-requested, update-password, session-checking, callback-error, and authenticated onboarding-required views.
- Added separate auth state, validation, redirect, error, service, controller, and DOM-binding modules.
- The browser bootstrap resolves and validates the session before constructing or revealing the frozen Version 1 calculator.
- Signup, login, current-session logout, reset request, password update, session restoration, and auth-state listening use Supabase Auth.
- Signup and reset messaging resist account enumeration. Provider errors are mapped to stable messages and never show tokens, stack traces, or raw provider details.
- Confirmation and recovery URLs are fixed to the current application origin; no user-controlled redirect is accepted. Auth callback parameters are removed after processing.
- Duplicate submissions are rejected while an account request is pending.
- Users without a Version 2 profile see a temporary account-setup notice and can use the protected Version 1 calculator. Profile data and onboarding forms remain V2-P3+ work.
- Local Supabase now requires email confirmation and an eight-character minimum password. Local callbacks are restricted to the two Vite development origins.

## Last Verified Tests

- `npm run check` passed: 30 Node tests and the Vite production build succeeded.
- Unit coverage passed for validation, existing/new signup response parity, confirmation misconfiguration, sanitized provider errors, fixed same-origin redirects, callback cleanup, session restoration, expired sessions, valid/invalid login, logout, recovery-session enforcement, duplicate submission, local-scope signout, and deferred auth events.
- `npm run test:auth:local` passed against the real local Supabase Auth service and Mailpit using an isolated 390 × 844 headless Chrome profile.
- The local browser flow passed signup, required confirmation, existing-account response parity, invalid/valid login, refresh restoration, expired-session rejection, logout, reset request, recovery-link password update, changed-password login, and bad/expired-link handling.
- The protected calculator remained hidden before session resolution and while signed out. A valid session exposed it, and `150g grilled chicken breast` still returned the frozen Version 1 result of 227 kcal.
- Mobile checks found no page-level horizontal overflow, all visible buttons met the 44-pixel touch-height check, keyboard activation opened signup, view focus moved to the new heading, and invalid email focus/error announcement behaved correctly.
- The built artifact contains no concrete Supabase secret-key value or JWT-shaped credential.
- Git diff validation reports no whitespace errors after the final source cleanup.

## Next Intended Action

Complete the human staging steps above, then ask Codex to **finish V2-P2 verification**. Codex will inspect the staging behavior, record the evidence, mark V2-P2 DONE only if every acceptance criterion passes, and stop for review. Do not proceed to V2-P3 yet.
