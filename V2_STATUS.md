# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-P2 — Authentication and Persistent Session Foundation
**Current Phase Status:** DONE
**Next Phase:** V2-P3 — Database Schema, Migrations, and Row-Level Authorization
**Overall V2 Status:** IN PROGRESS

## Completed Phases

- V2-P0 — Master Planning and Architecture — completed 2026-09-28
- V2-P1 — Development Platform and Staging Foundation — completed 2026-09-30
- V2-P2 — Authentication and Persistent Session Foundation — completed 2026-10-02

## Current Blockers

None. V2-P2 passed its local and staging acceptance checks.

The later `too many requests` response from an additional password-reset attempt is an expected hosted Supabase email rate limit. The required reset flow had already passed, so this does not block V2-P2 completion. Wait for the email quota to reset before making one new reset request.

## Required Human Actions

1. Review the V2-P2 completion documentation changes.
2. If approved, commit them with the recommended message `Complete V2-P2 staging verification` and push when ready. Do not commit or share passwords, confirmation links, recovery links, URL fragments, tokens, Supabase secret keys, SMTP credentials, or Vercel tokens.
3. If access to the synthetic staging account is needed before V2-P3, wait for the hosted email quota to reset and make one password-reset request. Repeated requests can extend the disruption.
4. After review, authorize V2-P3 by saying **“Proceed with the next V2 phase.”**

## V2-P2 Implementation Summary

- Added signed-out, login, signup, verification-pending, forgot-password, reset-requested, update-password, session-checking, callback-error, and authenticated onboarding-required views.
- Added separate auth state, validation, redirect, error, service, controller, and DOM-binding modules.
- The browser bootstrap resolves and validates the session before constructing or revealing the frozen Version 1 calculator.
- Signup, login, current-session logout, reset request, password update, session restoration, and auth-state listening use Supabase Auth.
- Signup and reset messaging resist account enumeration. Provider errors are mapped to stable messages and never show tokens, stack traces, or raw provider details.
- Confirmation and recovery URLs are fixed to the current application origin; no user-controlled redirect is accepted. Auth callback parameters are removed after processing.
- Duplicate submissions are rejected while an account request is pending.
- Users without a Version 2 profile see a temporary account-setup notice and can use the protected Version 1 calculator. Profile data and onboarding forms remain V2-P3+ work.
- Local Supabase requires email confirmation and an eight-character minimum password. Local callbacks are restricted to the two Vite development origins.

## Last Verified Tests

- `npm run check` passed: 30 Node tests and the Vite production build succeeded.
- Unit coverage passed for validation, existing/new signup response parity, confirmation misconfiguration, sanitized provider errors, fixed same-origin redirects, callback cleanup, session restoration, expired sessions, valid/invalid login, logout, recovery-session enforcement, duplicate submission, local-scope signout, and deferred auth events.
- `npm run test:auth:local` passed against the real local Supabase Auth service and Mailpit using an isolated 390 × 844 headless Chrome profile.
- The local browser flow passed signup, required confirmation, existing-account response parity, invalid/valid login, refresh restoration, expired-session rejection, logout, reset request, recovery-link password update, changed-password login, and bad/expired-link handling.
- The protected calculator remained hidden before session resolution and while signed out. A valid session exposed it, and `150g grilled chicken breast` still returned the frozen Version 1 result of 227 kcal.
- Mobile checks found no page-level horizontal overflow, all visible buttons met the 44-pixel touch-height check, keyboard activation opened signup, view focus moved to the new heading, and invalid email focus/error announcement behaved correctly.
- The built artifact contains no concrete Supabase secret-key value or JWT-shaped credential.
- The public staging origin returned HTTP 200 with the authentication gateway deployed and the protected calculator shell initially hidden.
- Human staging verification passed account creation, confirmation-email delivery, confirmation callback, protected calculator access, session restoration after refresh, logout protection, reset-email delivery, recovery callback, password update, and login with the changed password.
- Human staging verification also confirmed the required authentication configuration. A later extra reset request reached the hosted email sender rate limit after the required reset scenario had already passed.

## Next Intended Action

Review and optionally commit the V2-P2 completion documentation. V2-P3 has not started. After review, the user can say **“Proceed with the next V2 phase.”**
