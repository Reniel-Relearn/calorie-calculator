# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-S0 — Public Exposure Security Hardening
**Current Phase Status:** BLOCKED — USER ACTION REQUIRED after repository implementation
**Next Phase:** V2-D0 — User Design Plan and Mockup Approval Gate (blocked by V2-S0 completion)
**Overall V2 Status:** IN PROGRESS

## Completed Phases

- V2-P0 — Master Planning and Architecture — completed 2026-09-28
- V2-P1 — Development Platform and Staging Foundation — completed 2026-09-30
- V2-P2 — Authentication and Persistent Session Foundation — completed 2026-10-02
- V2-P3 — Database Schema, Migrations, and Row-Level Authorization — completed 2026-10-05
- V2-P4 — Evidence-Based Energy Target Engine — completed 2026-10-05
- V2-P5 — Profile Onboarding, Personal Data, and Target History — completed 2026-10-06
- V2-P6 — Calculator to Food Log Integration — completed 2026-10-07
- V2-P7 — Daily Calorie Tracker — completed 2026-10-07
- V2-P8 — Weekly Dashboard and History — completed 2026-10-07
- V2-P9 — Profile Settings, Goal Changes, Log Editing, and Account Deletion — completed 2026-10-07

## V2-P9 Completion Evidence

- Profile settings, atomic target-history replacement, captured-snapshot food-log correction, confirmed log deletion, dashboard refresh, and protected hard account deletion passed local verification.
- `npm.cmd run check` passed 110 Node tests and the Vite production build.
- `npm.cmd run test:db` passed all 156 pgTAP assertions across nine files.
- Local `public` and `private` schema lint reported no errors.
- A clean local database reset applied all migrations, including V2-P9.
- The complete local browser integration passed settings, cross-date log correction, delete cancel/confirm, current-password rejection, cascading hard account deletion, failed login for the deleted user, responsive checks, and frozen calculator behavior.
- The linked staging migration and `delete-account` Edge Function were deployed.
- The user confirmed on 2026-10-07: **“V2-P9 staging settings, log correction, and account deletion passed.”**

## V2-S0 Repository Evidence

- The approved branch is `security/v2-public-exposure-hardening`, created from an up-to-date `main`.
- Vercel headers enforce CSP, HSTS, framing denial, MIME protection, referrer and permissions policies, cross-origin isolation behavior, HTML revalidation, and immutable hashed-asset caching.
- Cloudflare Turnstile Free is wired to signup, login, password recovery, and account-deletion reauthentication through the supported Supabase `captchaToken` option. Remote environments fail closed without a public site key; local tests use a local-only adapter.
- `delete-account` now requires an exact allowed origin, JSON, a 4 KiB streamed body limit, exact fields, JWT/user validation, current-password reauthentication, and a durable five-attempt/15-minute per-user throttle with safe 429 behavior.
- A reviewed migration creates private throttle state and grants its security-definer RPC only to `service_role`.
- Dashboard pagination is bounded at five 1,000-row pages per query.
- The high-severity `source-map-js` advisory was resolved through a compatible lockfile update to 1.2.2.
- Security CI, CodeQL, Dependabot, tracked/build secret scanning, private vulnerability reporting, a threat model, provider instructions, incident response, rollback steps, and free-tier limitations are versioned.
- A clean `npm ci` completed with zero vulnerabilities. `npm.cmd run check` passed 132 Node tests, the Vite production build, a second zero-vulnerability high-severity audit, and the tracked/untracked/build secret scan across 141 files.
- Linked staging history matches the four previously applied migrations. `npx.cmd supabase db push --dry-run --linked` reports only `20261019090000_harden_account_deletion.sql` pending and made no remote change.
- Linked `public`, `private`, and `extensions` schema lint reports no errors before the new migration is applied.
- The current public response has HSTS and safe HTML revalidation but lacks the planned CSP, framing, permissions, MIME, referrer, and cross-origin headers; those remain deployment verification items.
- Local Supabase reset, pgTAP, lint, and browser integration remain pending because Docker Desktop is not currently running.

## Current Blockers

V2-S0 is stopped at the approved human-action boundary. The user must complete H1 through H4 in `V2_SECURITY_OPERATIONS.md`, start Docker Desktop for the remaining local database/browser verification, and explicitly approve H6 remote migration/function/deployment application after reviewing the dry runs.

Required categories:

1. Cloudflare Turnstile Free widget, public site key in Vercel, and secret only in Supabase Auth.
2. Supabase administrator MFA/access, CAPTCHA, Auth limits, password/email/redirect settings, advisors, Storage/Realtime, and available SSL/network controls.
3. Vercel preview protection, observed log-mode WAF review, usage/alerts, and incident-only Attack Challenge Mode.
4. GitHub CLI reauthentication, then the `main` ruleset, required checks, Dependabot, secret scanning/push protection, CodeQL, and private reporting where available free.
5. Docker Desktop running so the clean local migration, pgTAP, lint, and browser integration can execute.
6. Explicit approval to apply the reviewed migration and deploy the Edge Function/configuration to staging, followed by bounded synthetic-account verification.

Do not send secrets, current passwords, provider tokens, or personal data in chat.

## Design Program Sequence

1. V2-S0 — Public Exposure Security Hardening — **BLOCKED — USER ACTION REQUIRED**
2. V2-D0 — User Design Plan and Mockup Approval Gate — blocked by V2-S0
3. V2-D1 — Interface Audit and Design Traceability — blocked by V2-D0
4. V2-D2 — Visual Foundations and Shared Components — blocked by V2-D0
5. V2-D3 — Mobile App Shell and Navigation Revision — blocked by V2-D0
6. V2-D4 — Authentication, Onboarding, Calculator, and Today Revision — blocked by V2-D0
7. V2-D5 — Weekly, Settings, and Data-Control Revision — blocked by V2-D0
8. V2-D6 — Integrated Design Verification and Approval — blocked by V2-D0

V2-P10 cannot begin until V2-D0 through V2-D6 are complete and the revised interface passes staging review.

## Local Development Port Note

Windows reserved the former default Supabase local port range. The repository's local-only Supabase ports use API `55321`, database `55432`, Studio `55323`, and Mailpit `55324`. Staging URLs and provider configuration are unchanged.

## Next Intended Action

Wait for the user to complete the V2-S0 actions in `V2_SECURITY_OPERATIONS.md` and start Docker Desktop. Then run the remaining local checks, present linked migration/function/deployment dry runs, obtain explicit remote-application approval, and complete controlled staging verification. Do not begin V2-D0 until V2-S0 is merged into `main`.
