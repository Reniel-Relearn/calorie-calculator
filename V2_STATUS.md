# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-F0 — Filipino-First Catalog Scope and Plan
**Current Phase Status:** BLOCKED — USER PLAN REVIEW REQUIRED
**Next Phase:** V2-F1 — Candidate Inventory and Source Verification (blocked by V2-F0 approval)
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
- V2-S0 — Public Exposure Security Hardening — completed 2026-10-21

## V2-F0 Planning Evidence

- The user authorized a planning-only Filipino-first catalog expansion on 2026-11-02.
- The proposed program is documented in `V2_FOOD_CATALOG_PLAN.md` and uses one branch, `feature/v2-filipino-catalog-expansion`, and one draft pull request.
- The proposed final catalog range is 60–100 total records, including the existing 11, with a target of 80.
- The catalog remains a curated local **Demo nutrition dataset**; production nutrition APIs, branded products, restaurant menus, and invented nutrition values remain excluded.
- V2-F0 changes documentation only. No food record, nutrition value, alias, conversion, parser, matcher, calculator, UI, database, or provider configuration is changed.
- V2-F1 may begin only after the user approves the plan. V2-F1 must stop for review of an exact source matrix before any new food record is written.

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
- A newly published high-severity Vite 8.3.1 advisory was resolved with the compatible exact patch update to Vite 8.3.4. A subsequent clean `npm ci` completed with zero vulnerabilities, and `npm.cmd run check` passed 132 Node tests, the Vite production build, a zero-vulnerability high-severity audit, and the tracked/build secret scan across 141 files.
- The pre-application linked staging history matched the four previously applied migrations. `npx.cmd supabase db push --dry-run --linked` reported only `20261019090000_harden_account_deletion.sql` pending and made no remote change.
- Pre-application linked `public`, `private`, and `extensions` schema lint reported no errors.
- The pre-deployment public response had HSTS and safe HTML revalidation but lacked the planned CSP, framing, permissions, MIME, referrer, and cross-origin headers; the later production verification below confirmed those headers after deployment.
- Part 12 local verification passed on 2026-10-21: a clean Supabase reset applied all five migrations; 175 pgTAP assertions across 10 files passed; local `public`, `private`, and `extensions` schema lint reported no errors; and the complete authenticated browser integration passed against Vite 8.3.4. The browser harness now explicitly navigates to the application origin before clearing local storage, removing an `about:blank` startup race without changing production behavior.
- Part 14 completed on 2026-10-21: commit 4 was amended as `a400dd8`, branch `security/v2-public-exposure-hardening` was pushed, and pull request #1 was opened against `main`. Security CI, CodeQL, Vercel deployment, and Vercel preview-comment checks all passed. The pull request must remain unmerged until the remaining provider controls, controlled staging rollout, and commit 5 verification record are complete.
- Part 15 completed and verified on 2026-10-21: the active `Protect main` ruleset targets the default branch with no bypass, requires pull requests and resolved conversations, blocks deletion and force pushes, requires strict up-to-date checks, and requires `verify` plus `Analyze JavaScript and TypeScript`. Dependabot security updates, secret scanning, push protection, private vulnerability reporting, and CodeQL are active. CodeQL and secret scanning report zero alerts. Four Dependabot alerts remain visible on the current `main`; pull request #1 updates Vite to 8.3.4 and `source-map-js` to 1.2.2, which meet the advisories' patched versions.
- The pre-approval Part 16 recheck was non-applying: the linked database dry run identified only `20261019090000_harden_account_deletion.sql`; the hosted `delete-account` function was active at version 1 with JWT verification; and the pull-request preview was protected by Vercel authentication.
- The user confirmed Parts 9 through 11 complete and explicitly approved Part 16 on 2026-10-21. The reviewed migration was applied, a subsequent dry run reported the remote database up to date, and linked `public` and `private` schema lint reported no errors. The hardened `delete-account` function is active at version 2 with JWT verification enabled.
- The reviewed security branch was deployed to Vercel production and aliased to `https://calorie-calculator-gamma-ten.vercel.app`. The public origin returns HTTP 200 with the planned CSP, HSTS, frame denial, MIME protection, referrer policy, permissions policy, and cross-origin policies. The deployed production bundle contains the Cloudflare Turnstile runtime. At that checkpoint, hosted Supabase CAPTCHA remained the final manual activation boundary before Part 17 synthetic staging verification.
- Preliminary live Edge Function verification passed: an approved-origin preflight returns 204 with the exact public origin, a forbidden-origin preflight returns 403 `ORIGIN_NOT_ALLOWED`, and an unauthenticated deletion request returns 401 before application processing. No user data was involved.
- Part 17 exposed a production configuration failure before user-flow testing: a clean browser reaches the application's fail-closed **Account access unavailable** state. A secure local shape check of the encrypted Vercel Production environment found `VITE_APP_ENV` valid but `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_TURNSTILE_SITE_KEY` malformed. No values were printed or retained. Those three values must be corrected in Vercel and the production deployment repeated before CAPTCHA verification can continue.
- The user corrected those three Vercel values and the production deployment was repeated successfully. All required public values pass shape validation; a clean browser reaches `auth-signed-out`, opens `auth-login`, loads the Turnstile script/widget container, and reports no runtime or network errors. The public origin remains HTTP 200 with the planned security headers. Temporary environment and diagnostic files were deleted after verification.
- The user confirmed Part 17 passed on 2026-10-21: signup, email confirmation, login, recovery, private-data isolation, successful account deletion, sixth-attempt throttling, mobile behavior, and desktop behavior all passed on the public origin with Turnstile enabled.
- The user approved the V2-S0 closeout, commit 5, protected pull-request merge, production verification, and synchronization of `main` on 2026-10-21.

## Current Blockers

The immediate blocker is review of the proposed V2 Filipino-first catalog plan. The user must approve the total-count interpretation, target count, source policy, category allocation, architecture direction, phase sequence, and exclusions before V2-F1 begins.

The existing external design blocker remains queued after the catalog program:

**Blocker: Requires user's plan and mockups for design.**

The user must supply the written design plan, approved mobile mockups for the required signed-out and authenticated journeys, representative loading/empty/error states, and responsive direction for tablet and desktop. Do not begin V2-D1 or later design implementation until V2-F5 is complete and the V2-D0 baseline is reviewed and explicitly approved.

## Active Program Sequence

1. V2-S0 — Public Exposure Security Hardening — **DONE**
2. V2-F0 — Filipino-First Catalog Scope and Plan — **BLOCKED — USER PLAN REVIEW REQUIRED**
3. V2-F1 — Candidate Inventory and Source Verification — blocked by V2-F0
4. V2-F2 — Catalog Architecture and Validation Foundation — blocked by V2-F1
5. V2-F3 — Curated Food Batches — blocked by V2-F2
6. V2-F4 — Matching, Ambiguity, and Serving Verification — blocked by V2-F3
7. V2-F5 — Integrated Verification and Staging Approval — blocked by V2-F4
8. V2-D0 — User Design Plan and Mockup Approval Gate — blocked by V2-F5 and user design input
9. V2-D1 — Interface Audit and Design Traceability — blocked by V2-D0
10. V2-D2 — Visual Foundations and Shared Components — blocked by V2-D0
11. V2-D3 — Mobile App Shell and Navigation Revision — blocked by V2-D0
12. V2-D4 — Authentication, Onboarding, Calculator, and Today Revision — blocked by V2-D0
13. V2-D5 — Weekly, Settings, and Data-Control Revision — blocked by V2-D0
14. V2-D6 — Integrated Design Verification and Approval — blocked by V2-D0

V2-P10 cannot begin until V2-F0 through V2-F5 and V2-D0 through V2-D6 are complete and the revised interface passes staging review.

## Local Development Port Note

Windows reserved the former default Supabase local port range. The repository's local-only Supabase ports use API `55321`, database `55432`, Studio `55323`, and Mailpit `55324`. Staging URLs and provider configuration are unchanged.

## Next Intended Action

Wait for user review of `V2_FOOD_CATALOG_PLAN.md`. If approved, begin only V2-F1: research and document the exact candidate inventory and source matrix, then stop for source-matrix review before adding food records. Do not begin V2-F2, add catalog records, implement the design revision, or start V2-P10 early.
