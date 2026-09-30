# CalorieCheck Version 2 — Complete Phase Plan

This plan is executable without a new detailed prompt. After human review of a completed phase, the instruction **“Proceed with the next V2 phase.”** authorizes Codex to read the control documents and execute only the next unfinished phase.

## Phase Execution Rules

For every phase:

1. Read `AGENTS.md`, `V2_MASTER_SPEC.md`, this plan, `V2_STATUS.md`, `V2_DECISIONS.md`, and relevant `V2_RESEARCH.md` entries.
2. Confirm the frozen V1 baseline and inspect current git status before changes.
3. Perform only the active phase and its necessary fixes/documentation.
4. Use current official documentation for time-sensitive provider or scientific behavior.
5. Build security, privacy, mobile usability, and accessibility into the phase.
6. Run all required tests and fix failures within scope.
7. Mark the phase `DONE` only when every acceptance criterion passes.
8. Update `V2_STATUS.md`, applicable V2 documents, and existing documents only when facts changed.
9. Inspect the final diff and git status; do not commit, push, tag, merge, or create a branch.
10. Report results, recommend the listed commit message (adjusted only if the actual scope differs), identify the next phase, and stop for review.

A phase with an unmet mandatory external action or acceptance criterion is `BLOCKED — USER ACTION REQUIRED`, never `DONE`.

---

## V2-P0 — Master Planning and Architecture

**Status:** DONE  
**Objective:** Establish the source-backed Version 2 product, architecture, decisions, and complete autonomous phase roadmap without production implementation.  
**Why this phase exists:** Authentication, personal data, energy estimates, and deployment require decisions before code or provider resources are created.  
**Dependencies:** Frozen Version 1 and explicit user approval to plan Version 2.  
**Files likely involved:** `V2_MASTER_SPEC.md`, `V2_PLAN.md`, `V2_STATUS.md`, `V2_DECISIONS.md`, `V2_RESEARCH.md`, `AGENTS.md`, `PROJECT.md`, `ROADMAP.md`, `README.md`.  
**Exact implementation scope:** Audit V1; research energy methods, backend/auth, RLS, build tooling, hosting, timezones, and deletion; define the product/data/security/deployment architecture; create all V2 control documents; revise project status documents.  
**Explicit non-goals:** No SDK install, build conversion, UI, database, provider project, migration, target engine, or deployment.  
**Required research:** National Academies 2023 DRI for Energy; NIH/NIDDK dynamic weight model; current Supabase, Firebase, Vite, Vercel, Netlify, Cloudflare Pages, PostgreSQL, and browser timezone documentation.  
**Required tests:** Documentation completeness; internal link/file checks; cross-document status and decision consistency; git diff/status; proof no runtime source was modified.  
**Acceptance criteria:** All five V2 documents exist; every requested scope area and phase field is present; backend, host, build, snapshot, history, timezone, week, privacy, and RLS decisions are recorded; scientific uncertainty is explicit; `V2_STATUS.md` points to V2-P1; no V2 production code exists.  
**Documentation updates:** This phase creates the V2 documentation set and updates `AGENTS.md`, `PROJECT.md`, `ROADMAP.md`, and `README.md`.  
**External/user actions:** Review the plan; optionally commit and push after review.  
**Stop conditions:** A required authoritative source cannot be accessed, the V1 baseline is not actually frozen/clean, or a planning contradiction cannot be resolved without user direction.  
**Recommended commit message:** `Plan CalorieCheck Version 2 architecture`

---

## V2-P1 — Development Platform and Staging Foundation

**Status:** DONE
**Objective:** Convert the development workflow to Vite, establish reproducible local tooling, configure Supabase/Vercel environment boundaries, and publish a safe staging baseline that preserves V1 behavior.  
**Why this phase exists:** Auth and persistence need dependency management, environment configuration, redirects, migrations, and an early real HTTPS origin.  
**Dependencies:** V2-P0; supported Node/npm; human access to Supabase, Vercel, and the Git repository.  
**Files likely involved:** `package.json`, lockfile, `.gitignore`, `.env.example`, `index.html`, existing asset/module paths, `vite.config.js` only if necessary, `js/config/*`, `js/services/supabase-client.js`, `supabase/config.toml`, `README.md`, V2 documents.  
**Exact implementation scope:** Recheck current Vite/Supabase requirements; add pinned Vite, Supabase JS, and Supabase CLI tooling; add `dev`, `build`, `preview`, and test/check scripts; preserve the V1 entry point and module boundaries; add fail-fast validation for the public Supabase URL/publishable key; initialize version-controlled Supabase local configuration without tables; ensure `.env.local` and provider metadata are ignored; document public versus privileged values; create a staging Supabase project and staging Vercel project; configure staging public values and auth Site/redirect URLs; deploy the unchanged V1 experience as a Vite build to staging. Use synthetic test data only.  
**Explicit non-goals:** No auth screens, user tables, RLS policies, onboarding, logging, dashboard, production project, or target formula.  
**Required research:** Current Node/Vite compatibility, Supabase CLI installation, current publishable-key terminology, Vercel Vite settings, preview/staging URL behavior, and current plan/usage terms.  
**Required tests:** Clean install; local dev server; production build; local preview; existing V1 calculator regression; missing/malformed public config failure; asset/import integrity; built-bundle scan for unexpected secrets; staging HTTPS load on phone and desktop; console/network error check.  
**Acceptance criteria:** A fresh checkout can install and build; V1 behavior and UI remain intact; environment placeholders are documented; no privileged value is in the repo or bundle; local Supabase config is reproducible; the staging URL loads the Vite build over HTTPS; staging points only to the staging Supabase project; production is untouched.  
**Documentation updates:** README setup/build/staging instructions, `.env.example`, `V2_STATUS.md`, and decision/research notes only if provider facts changed.  
**External/user actions:** Create or authorize the staging Supabase and Vercel projects; connect the repository; enter the actual Supabase URL and publishable key in local/Vercel environment settings; configure the stated staging auth URLs. Codex must provide exact dashboard steps and must not request or expose a secret key.  
**Stop conditions:** Required accounts/permissions are unavailable; staging values or URL do not exist; the build changes V1 behavior; a secret appears in source/bundle; provider terms do not fit intended use. Record a precise blocker after completing all local work.  
**Recommended commit message:** `Establish V2 Vite and staging foundation`

---

## V2-P2 — Authentication and Persistent Session Foundation

**Status:** NOT STARTED — NEXT
**Objective:** Implement complete email/password authentication and the protected application boundary on local and staging environments.  
**Why this phase exists:** Every later profile and log operation needs a trustworthy authenticated identity and predictable session lifecycle.  
**Dependencies:** V2-P1 staging origin and Supabase client configuration.  
**Files likely involved:** `index.html`, `js/app.js`, `js/state.js`, `js/auth/*`, `js/navigation/*`, `js/services/supabase-client.js`, `js/ui.js` or new view modules, CSS modules, auth callback routing/config, tests, V2 docs.  
**Exact implementation scope:** Add accessible signup, email-verification-pending, login, forgot-password, update-password, signed-out, session-checking, and authenticated-shell states; implement signup/login/logout/reset through Supabase Auth; restore sessions before rendering protected content; listen for auth state changes; sanitize provider errors into useful messages; configure and validate allow-listed local/staging redirects; require remote email confirmation; direct an authenticated user without a profile to a temporary onboarding-required state; retain the V1 calculator behind the authenticated shell without redesign. Prevent open redirects and duplicate form submission.  
**Explicit non-goals:** No social login, public calculator mode, profile form, database tables, target calculation, food logging, dashboard totals, account deletion, or production SMTP.  
**Required research:** Current Supabase JS Auth APIs and event semantics, password policy options, confirmation/reset flows, session persistence, redirect configuration, and enumeration-resistant messaging.  
**Required tests:** Signup validation; existing/new email responses; required confirmation; valid/invalid login; logout; refresh session restoration; expired/revoked session; reset request and update; wrong/expired recovery link; direct protected-route visit; keyboard/focus/error announcement; local Mailpit and real staging email flow; V1 regression after auth.  
**Acceptance criteria:** All required auth flows work locally and on staging; private shell does not flash before session resolution; signed-out/expired users cannot use protected views; refresh restores a valid session; logout clears private state; errors expose no token or stack; primary forms work on mobile and by keyboard.  
**Documentation updates:** Auth setup/redirect instructions in README or an appropriate V2 document, test evidence in `V2_STATUS.md`, research/decision updates if the provider behavior differs.  
**External/user actions:** Confirm staging email receipt; configure staging Site URL and exact redirect paths; adjust provider password/email settings if instructed. Production SMTP remains deferred.  
**Stop conditions:** Email flow or redirect cannot be configured; session restoration is unreliable; protected content is reachable signed out; auth secrets/tokens leak.  
**Recommended commit message:** `Implement V2 email authentication foundation`

---

## V2-P3 — Database Schema, Migrations, and Row-Level Authorization

**Status:** NOT STARTED  
**Objective:** Create reproducible private-data tables, constraints, indexes, grants, RLS policies, and explicit allow/deny tests.  
**Why this phase exists:** UI work must not precede database-enforced ownership and historical integrity.  
**Dependencies:** V2-P1 local/staging Supabase tooling; V2-P2 authenticated test identities.  
**Files likely involved:** `supabase/migrations/*.sql`, `supabase/tests/*.sql`, `supabase/seed.sql` for synthetic local data only, optional database type/schema documentation, `V2_DECISIONS.md`, `V2_STATUS.md`.  
**Exact implementation scope:** Implement `profiles`, `calorie_targets`, and `food_logs` from the master spec; use canonical units, nullable nutrient fields, sanitized JSON snapshots, `timestamptz`, IANA timezone fields, stable `local_date`, audit timestamps, UUID keys, checks, foreign keys, cascade deletion, owner/date and effective-target indexes, and a one-current-target invariant. Revoke broad defaults; grant only needed operations to `authenticated`; enable RLS; add separate owner policies for SELECT/INSERT/UPDATE/DELETE as needed; give `anon` no private-table access. Add safe updated-at behavior if justified. Apply from a clean local reset, then staging through reviewed migration commands.  
**Explicit non-goals:** No UI, profile persistence service, target formula, dashboard query module, real user seed, summary table, production database, or privileged account deletion function.  
**Required research:** Current Supabase migrations, grants, RLS, `auth.uid()`, pgTAP/test helpers, managed auth foreign-key guidance, JSON constraints, and PostgreSQL timezone/index behavior.  
**Required tests:** Clean `supabase db reset`; schema/constraint/index tests; User A own-row allow tests for every granted operation; User A → User B deny tests; unauthenticated deny tests; ownership reassignment denial; invalid units/amounts/nutrients/time ranges rejection; one-current-target invariant; cascade deletion in a safe local transaction; migration dry-run/staging verification.  
**Acceptance criteria:** Migrations reproduce the schema; all private tables have least-privilege grants and RLS; every allow and deny test passes; invalid/history-breaking data is rejected; no dashboard-only security assumption exists; staging migration history matches repository files.  
**Documentation updates:** Data dictionary/policy notes in V2 docs as needed; `V2_STATUS.md`; decisions only if the implemented schema differs materially.  
**External/user actions:** Authorize/link the staging Supabase project and allow migration application after Codex shows the dry-run plan. No production action.  
**Stop conditions:** Any cross-user or anonymous access succeeds; migration reset is not reproducible; schema requires an unresolved scientific field; staging differs from reviewed migrations.  
**Recommended commit message:** `Add V2 schema migrations and RLS policies`

---

## V2-P4 — Evidence-Based Energy Target Engine

**Status:** NOT STARTED  
**Objective:** Finish the scientific gate and implement a pure, versioned, deterministic target engine with authoritative reference tests.  
**Why this phase exists:** Personal targets are high-impact calculations and must be validated separately from forms, persistence, and rendering.  
**Dependencies:** V2-P0 scientific direction; V2-P1 test/build tooling. Database schema may exist but the engine cannot depend on it.  
**Files likely involved:** `js/targets/*`, pure validation/unit conversion modules, reference fixtures/tests, `V2_RESEARCH.md`, `V2_DECISIONS.md`, `V2_MASTER_SPEC.md` if the research gate changes scope.  
**Exact implementation scope:** Re-verify and transcribe National Academies equations for age 18–18.99 and 19+, activity categories, units, boundaries, and precision; define structured eligibility/success/error output; implement maintenance EER as a pure function; preserve full precision internally and define presentation rounding outside the core. Research and prototype the published NIDDK/Hall model independently; determine required goal weight/timeframe inputs, supported domains, license boundary, reference vectors, and whether loss and gain can be accepted. Implement goal-specific code only for methods that pass. Return explicit unavailable outcomes otherwise. Record methodology IDs/versions and assumptions.  
**Explicit non-goals:** No onboarding UI, profile/database writes, arbitrary deficit/surplus, goal recommendation, medical advice, pregnancy adjustment, dashboard, or LLM calculation.  
**Required research:** Primary National Academies tables/application guidance; NIDDK research page, Hall appendix/paper, public-tool eligibility, licensing, model domains, loss/gain evidence, and independently reproducible expected values.  
**Required tests:** Authoritative reference cases for every sex/PAL/age branch; exact tests immediately below/at/above age 18 and 19; canonical unit and finite-value validation; underage and life-stage exclusions; determinism/non-mutation; methodology metadata; activity mapping; precision/rounding separation; model convergence and invalid-goal tests; independent loss/gain vectors if accepted.  
**Acceptance criteria:** Maintenance output matches verified sources; no adult coefficient is extended below 19; unsupported categories return unavailable; no fixed ±500 rule exists; every enabled weight-change method has primary-source justification and independent vectors; uncertain gain remains unavailable; decisions/spec are updated with the final supported goal set.  
**Documentation updates:** Final scientific findings and source access dates in `V2_RESEARCH.md`; promote or reject V2-ADR-011 in `V2_DECISIONS.md`; update spec/plan/status only for evidence-driven scope changes.  
**External/user actions:** If loss or gain cannot meet the gate, review the evidence and approve the documented scope choice before the phase can be marked done.  
**Stop conditions:** Coefficients or reference outputs cannot be independently verified; model/license applicability is unclear; a required goal remains scientifically unsupported without user-approved scope adjustment; outputs are non-finite or unsafe to present.  
**Recommended commit message:** `Implement evidence-based V2 calorie target engine`

---

## V2-P5 — Profile Onboarding, Personal Data, and Target History

**Status:** NOT STARTED  
**Objective:** Implement mobile-first onboarding and settings-grade profile persistence, then atomically create the first effective calorie target.  
**Why this phase exists:** Authenticated identity becomes useful only after minimized profile inputs produce a transparent, auditable target.  
**Dependencies:** V2-P2 auth, V2-P3 protected schema, V2-P4 accepted engine and goal set.  
**Files likely involved:** `index.html`, `js/profile/*`, `js/targets/*`, `js/services/*`, `js/navigation/*`, `js/ui.js` or view modules, CSS, integration/E2E tests, V2 docs.  
**Exact implementation scope:** Build accessible onboarding for display name, date of birth, equation sex, height, weight, PAL, supported goal, timezone suggestion/correction, and non-persistent life-stage eligibility confirmation; validate client inputs and database constraints; explain source terminology and uncertainty; persist canonical units; call the target engine; atomically insert/update the profile and create the first target history row; route incomplete profiles back to onboarding; show the display-name greeting and target summary in a minimal authenticated home shell; handle target unavailable, network failure, and retry without duplicate target rows.  
**Explicit non-goals:** No food logging, daily/weekly list, full profile editor, account deletion, imperial storage, health-condition collection, or unsupported goal enablement.  
**Required research:** Current Supabase transaction/RPC pattern for atomic profile-plus-target creation, IANA timezone validation, activity wording, and sensitive-field UX.  
**Required tests:** Required/invalid fields; 18/19 birthday boundary; underage; unsupported sex coefficient; life-stage exclusion; canonical conversion if alternate entry is offered; browser timezone fallback/correction; incomplete profile routing; atomic success/rollback; retry idempotence; target snapshot/effective dates; other-user denial; greeting; mobile/keyboard/focus/error behavior.  
**Acceptance criteria:** A verified user completes onboarding and receives an accepted transparent target; only minimized canonical profile data is stored; profile and first target cannot partially persist; target history contains methodology/input snapshot; incomplete or ineligible states are clear; greeting uses display name; RLS remains effective.  
**Documentation updates:** Setup/user-flow notes where useful, final field descriptions, test evidence and phase state.  
**External/user actions:** Use a staging test account to review terminology and complete the real email/onboarding path; no personal real-world data is required.  
**Stop conditions:** Atomicity cannot be guaranteed; unsupported users receive a value; sensitive data is collected without need; target engine and persisted snapshot disagree; RLS denial fails.  
**Recommended commit message:** `Add V2 profile onboarding and target history`

---

## V2-P6 — Calculator to Food Log Integration

**Status:** NOT STARTED  
**Objective:** Add an explicit, secure persistence path from a V1 `SUCCESS` result to a user-owned historical food-log snapshot.  
**Why this phase exists:** A calculation is not consumption; this phase creates the deliberate boundary without duplicating calculator logic.  
**Dependencies:** V2-P3 food-log schema/RLS; V2-P5 authenticated complete profile/timezone; frozen V1 result contract.  
**Files likely involved:** `js/app.js`, `js/ui.js`, `js/logs/*`, `js/services/*`, result markup/CSS, tests, dataset version metadata, V2 docs.  
**Exact implementation scope:** Define and validate a mapping from the existing successful calculation to the food-log insert command; include food/source/dataset, original and normalized serving, nullable nutrients, reference calculation snapshot, current instant, entry timezone, and derived local date; add **Add to Today's Log** only for authenticated/onboarded `SUCCESS`; require explicit activation; disable while pending; prevent duplicate clicks; persist through an owner-scoped repository; show success and recoverable failure; keep the result available for retry; publish an event/callback for dashboard refresh.  
**Explicit non-goals:** No automatic logging, daily dashboard list, weekly view, log editing/deletion, meal grouping, current-dataset recalculation of history, or offline queue.  
**Required research:** Current insert/return behavior, retry/idempotency options, timezone-to-local-date implementation, and sanitized JSON snapshot size/shape.  
**Required tests:** No write on analyze; exactly one write on explicit action; double-click/race prevention; grams/cups/mL records; missing nutrient null versus zero; source/dataset snapshot; timezone boundary; network retry; expired session; owner ID cannot be spoofed; User B denial; source food/result objects remain unmodified; V1 state and recalculation regressions.  
**Acceptance criteria:** Explicit logging works locally/staging for representative mass, cup, and volume results; analysis alone writes nothing; saved scalars match V1 output; snapshot can reproduce an edit; missing nutrients remain null; failures do not lose the result or create duplicate confirmed entries; cross-user insertion/access is denied.  
**Documentation updates:** Snapshot contract/data dictionary and test evidence; status update.  
**External/user actions:** Exercise staging inserts with synthetic accounts if remote testing is required.  
**Stop conditions:** Any automatic/duplicate write occurs; snapshot lacks enough edit provenance; timezone day is ambiguous; owner can be spoofed; V1 behavior regresses.  
**Recommended commit message:** `Connect V1 results to explicit V2 food logging`

---

## V2-P7 — Daily Calorie Tracker

**Status:** NOT STARTED  
**Objective:** Present a correct, neutral, mobile-first daily view derived from logs and the target effective for the selected local date.  
**Why this phase exists:** Daily feedback is the primary value of persistent logging.  
**Dependencies:** V2-P5 target history and V2-P6 saved logs.  
**Files likely involved:** `js/dashboard/*`, `js/logs/*`, authenticated home view/UI modules, CSS, query/aggregation tests, V2 docs.  
**Exact implementation scope:** Query only the current user's logs for a selected stable `local_date`; sum calories and available nutrient fields on demand; resolve the applicable target; calculate remaining/above without judgment; display today's summary, macro/supporting totals, and a semantic food list with serving context; add accessible previous/next/today date navigation; refresh after a successful log; implement empty, loading, incomplete-profile, unavailable-target, session-expired, and network-error states. Preserve null-aware nutrient semantics and avoid presenting incomplete nutrient totals as measured zero.  
**Explicit non-goals:** No weekly chart, edit/delete actions, summary table, meal categories, streaks, badges, recommendations, or offline cache.  
**Required research:** PostgreSQL/Supabase date filtering, null aggregate behavior, accessible progress semantics, and neutral language.  
**Required tests:** Multiple entries/totals; empty day; all-null and mixed-null nutrients; explicit zeros; target effective-date selection; remaining/exceeded calculations; local midnight/DST zones; refresh after insert; query failure/retry; signed-out and cross-user isolation; mobile reflow, touch, keyboard, screen-reader labels.  
**Acceptance criteria:** Daily calories and applicable target are exact; remaining/above language is neutral; logged items show useful serving context; null is never converted to zero; every empty/error state is informative; data is private; no horizontal overflow at required sizes.  
**Documentation updates:** Dashboard behavior/aggregation notes and phase test evidence.  
**External/user actions:** Review staging language and layout on a phone-sized device.  
**Stop conditions:** Totals or effective target are wrong; server timezone defines the day; null becomes zero; inaccessible progress/list; private data leak.  
**Recommended commit message:** `Add V2 daily calorie tracker`

---

## V2-P8 — Weekly Dashboard and History

**Status:** NOT STARTED  
**Objective:** Add an accessible Monday-through-Sunday seven-day view with historical targets and on-demand totals.  
**Why this phase exists:** Users need short-term context without turning the product into a complex fitness platform.  
**Dependencies:** V2-P7 daily aggregation and states; effective target history.  
**Files likely involved:** `js/dashboard/*`, weekly view/UI modules, CSS/SVG if used, queries/tests, V2 docs.  
**Exact implementation scope:** Compute Monday/Sunday boundaries from profile timezone and selected week; query the user's seven local dates; produce one row per date including zero-log days; resolve each day's target; show consumed/target/remaining-or-above and seven-day average intake/target; add previous/next/current-week navigation; implement an optional lightweight native visualization with a semantic table/list equivalent and non-color cues; support no-history, partial-history, unavailable-target, and network states.  
**Explicit non-goals:** No monthly/yearly analytics, prediction, streaks, weight chart, comparison with other users, downloadable report, summary table, or chart library by default.  
**Required research:** Reliable local-date week boundary implementation, accessible SVG/chart patterns if used, and locale-independent date labels while retaining fixed Monday start.  
**Required tests:** Monday/Sunday boundaries; month/year/DST crossings; seven rows including empty days; changing historical targets; average denominator policy; null targets; large/zero totals; textual/visual equivalence; keyboard/screen-reader/non-color/reduced-motion checks; mobile/tablet/desktop reflow; RLS isolation.  
**Acceptance criteria:** Exactly seven correct local dates appear; historical targets are not overwritten by current profile values; average policy is documented and correct; textual information is complete without the chart; chart adds no dependency unless justified; empty/error states work.  
**Documentation updates:** Week/average rules and phase evidence; decisions only if visualization design changes.  
**External/user actions:** Review staging weekly information density and language.  
**Stop conditions:** Week boundaries vary implicitly by server/locale; historic targets are wrong; chart is the only information source; mobile layout becomes unusable.  
**Recommended commit message:** `Add accessible V2 weekly dashboard`

---

## V2-P9 — Profile Settings, Goal Changes, Log Editing, and Account Deletion

**Status:** NOT STARTED  
**Objective:** Give users full control over editable personal data, goals, logged mistakes, timezone, and account removal while preserving history.  
**Why this phase exists:** Persistent data must be correctable and user-controlled.  
**Dependencies:** V2-P5 profile/targets, V2-P6 snapshots, V2-P7/P8 refresh behavior, accepted V2-P4 goal set.  
**Files likely involved:** `js/profile/*`, `js/targets/*`, `js/logs/*`, settings/edit view modules, Supabase migration/RPC if atomic target replacement needs refinement, `supabase/functions/delete-account/*`, tests, docs.  
**Exact implementation scope:** Add profile/settings screens; update display name independently; for target-affecting fields, validate and atomically close the old target/create a new effective target; explain that timezone changes affect future entries; edit a log's date/time and serving using its captured reference/conversion snapshot, then replace scalar snapshot fields; delete a log with confirmation; refresh daily/weekly totals; implement protected hard account deletion through a server-side function with caller verification, explicit irreversible confirmation, current reauthentication guidance, cascading data removal, and client logout.  
**Explicit non-goals:** No retroactive target rewrite, current-food-data rewrite of old logs, soft-delete history, public profile, data export unless separately approved, or privileged credential in the browser.  
**Required research:** Current Supabase reauthentication/current-password behavior, Edge Function auth and secret handling, admin deletion semantics/JWT expiry, cascade constraints, and atomic target replacement.  
**Required tests:** Name-only update; every target-affecting update; failed atomic update rollback; historical target preservation; timezone change stability; log edit across unit/date boundary; null nutrients; delete/cancel; totals refresh; cross-user update/delete denial; account deletion/cascade/session cleanup; invalid/expired caller; no server secret in bundle/log.  
**Acceptance criteria:** Settings persist valid canonical data; target changes create one new current history row; history stays interpretable; edits use captured provenance; delete updates dashboards; only owners can mutate; account deletion removes auth/application rows through server code and clears the session.  
**Documentation updates:** User data/deletion behavior, function deployment/config instructions, privacy notes, test evidence, status.  
**External/user actions:** Configure the server function's privileged environment in Supabase without sharing it; deploy the function to staging; execute a disposable staging-account deletion test.  
**Stop conditions:** Any history is silently rewritten; edit uses mutable current food data; cross-user mutation succeeds; account deletion needs a browser secret or leaves owned rows; reauthentication requirement cannot be resolved safely.  
**Recommended commit message:** `Add V2 settings log corrections and account deletion`

---

## V2-P10 — Security, Privacy, Data Integrity, and RLS QA

**Status:** NOT STARTED  
**Objective:** Perform focused adversarial hardening of all implemented V2 trust boundaries before release QA.  
**Why this phase exists:** Core controls are built earlier; this phase verifies the integrated system and closes gaps before production.  
**Dependencies:** V2-P2 through V2-P9 complete on staging.  
**Files likely involved:** migrations/policies/tests, auth/data services, Edge Function, Vercel/security headers config, dependency manifests, `.gitignore`, docs.  
**Exact implementation scope:** Review threat model and data flows; test grants/RLS through database and client paths; verify ownership cannot be set/reassigned by clients; validate all database constraints and snapshot schemas; review session expiry/logout/reset/deletion; restrict redirects/CORS/function callers; add appropriate static security headers/CSP compatible with the app; scan repository and built assets for credentials; audit dependency versions and known vulnerabilities; verify logs/errors omit tokens and personal payloads; verify staging contains only synthetic data; document retention/deletion behavior and incident limitations.  
**Explicit non-goals:** No new product feature, third-party analytics, compliance certification, penetration-test claim, or production launch.  
**Required research:** Current Supabase/Vercel hardening guidance, CSP requirements, dependency advisories, auth rate-limit/password controls, and backup/restore behavior.  
**Required tests:** Full allow/deny matrix on all private tables/functions; direct REST/client bypass attempts; malformed/oversized input; ownership spoof; token/session cases; open redirect; XSS-sensitive rendering; CSRF assumptions for token flow; secret scans; dependency audit; headers; account cascade; migration reset; staging smoke.  
**Acceptance criteria:** No cross-user/anonymous access; no privileged secret exposure; all inputs fail safely; redirects are constrained; security headers do not break the app; dependency findings are resolved or explicitly accepted; data deletion and migration tests pass; privacy text matches behavior.  
**Documentation updates:** Security model and verified limitations in V2 docs/README; `V2_STATUS.md`; decisions for any material change.  
**External/user actions:** Review provider Auth/URL/rate-limit settings and rotate any credential if exposure is found.  
**Stop conditions:** Any high-severity access, secret, auth, injection, or deletion defect remains; a production dependency has an unresolved applicable critical advisory.  
**Recommended commit message:** `Harden V2 security privacy and data integrity`

---

## V2-P11 — Responsive, Accessibility, and Cross-Browser QA

**Status:** NOT STARTED  
**Objective:** Validate and fix the complete user experience across required devices, input modes, assistive semantics, and browsers without redesigning the product.  
**Why this phase exists:** V2 adds several stateful flows that must preserve the V1 mobile-first and accessibility baseline.  
**Dependencies:** V2-P10 secure integrated staging build.  
**Files likely involved:** HTML/view modules, CSS, focus/state code, test automation/config, `TESTING.md` only if acceptance criteria change, V2 status/evidence.  
**Exact implementation scope:** Audit signup/reset, onboarding, home/calculator, daily, weekly, settings, edit/delete, logout, account deletion, and all empty/error states; fix semantic structure, labels/descriptions, error association, live announcements, focus movement/restoration, keyboard order, touch targets, contrast, reduced motion, chart equivalent, zoom/reflow, overflow, and layout at small phone/phone/tablet/desktop widths; test current Chrome/Edge/Firefox/Safari-equivalent WebKit as feasible; retain approved V1 visual language.  
**Explicit non-goals:** No feature expansion, visual rebrand, desktop-first dashboard, or scientific/backend change unless a discovered defect requires the smallest fix.  
**Required research:** Current WCAG techniques applicable to forms, dialogs, progress, tables/charts, and provider-supported browser baseline; current browser versions in the test environment.  
**Required tests:** Automated semantic/accessibility checks where justified; complete keyboard walkthrough; focus after route/dialog/async errors; 200%/400% zoom and 320 CSS-pixel reflow; screen-reader spot checks; touch sizing; reduced motion; color-independent weekly view; browser matrix; portrait/landscape; slow/failing network states; V1 regression.  
**Acceptance criteria:** Primary flows work by keyboard and touch; labels/errors/focus are useful; no critical accessibility finding; no page-level horizontal overflow; weekly data is accessible without chart/color; supported browsers complete auth-to-log flow; V1 remains intact.  
**Documentation updates:** Record the tested matrix/results; update `TESTING.md` only for genuinely new durable criteria; status.  
**External/user actions:** Human visual/assistive review on available real devices, especially a smartphone and Safari device if automation cannot cover it.  
**Stop conditions:** A primary flow is inaccessible or unusable on a required form factor/browser; critical automated/manual accessibility defect remains.  
**Recommended commit message:** `Complete V2 responsive accessibility and browser QA`

---

## V2-P12 — Staging Release Verification and Production Deployment

**Status:** NOT STARTED  
**Objective:** Promote the reviewed migration/build to isolated production services after a final staging release rehearsal.  
**Why this phase exists:** Production credentials, redirects, email, domain, and database must be created late and verified from the same reproducible artifacts.  
**Dependencies:** V2-P10 and V2-P11 pass; approved staging release candidate; human authorization for provider/domain actions.  
**Files likely involved:** environment documentation, deployment config/headers, migration history, Edge Function config, README, V2 status/research if provider facts changed.  
**Exact implementation scope:** Recheck provider pricing/terms/limits; freeze a staging candidate; rehearse clean migration/function/build deployment; create separate production Supabase and Vercel projects; configure production publishable values, exact Site/redirect URLs, email verification, custom SMTP, password/rate-limit settings, server-only function secrets, domain/DNS/HTTPS, and security headers; apply reviewed migrations/functions; build/deploy the exact release candidate; run production smoke tests with disposable accounts; verify account deletion; remove test accounts/data; document rollback and operational checks.  
**Explicit non-goals:** No feature changes, production nutrition API, real-user data migration, analytics, or automatic commit/push/tag.  
**Required research:** Current plan/usage terms, production SMTP, DNS/HTTPS, Supabase project/security/backup settings, Vercel deployment/promotion/rollback, and auth redirect requirements.  
**Required tests:** Full staging smoke; migration dry-run and production history; production signup/verification/login/reset/session/logout; onboarding/target; calculate/log/daily/weekly/edit/delete; account deletion; RLS spot tests; exact redirects; HTTPS/domain/headers; mobile/keyboard smoke; secret/bundle scan; rollback procedure review.  
**Acceptance criteria:** Production and staging are isolated; production uses only reviewed migrations/build/function; email and exact redirects work; HTTPS/domain work; core journey and deletion pass; no test data/secret remains; rollback and ownership are documented.  
**Documentation updates:** README production status/setup, operational deployment record, `V2_STATUS.md`; provider research changes if any.  
**External/user actions:** Create/authorize production provider projects, configure SMTP and DNS/domain ownership, enter public and server-only values in the correct dashboards, approve the production deployment. Codex supplies exact beginner-friendly steps and never asks for secrets in chat/source.  
**Stop conditions:** Human production approval is absent; domain/SMTP/provider credentials unavailable; environment isolation fails; any release/security smoke test fails; plan/terms do not fit.  
**Recommended commit message:** `Configure CalorieCheck V2 production release`

---

## V2-P13 — Final Version 2 Audit

**Status:** NOT STARTED  
**Objective:** Audit the complete production candidate against the master specification and Definition of Done, fixing only release-blocking defects.  
**Why this phase exists:** Freeze must be based on evidence across product, science, data, security, deployment, and documentation.  
**Dependencies:** V2-P12 production deployment and completed release smoke tests.  
**Files likely involved:** Any file requiring a narrowly scoped defect fix; all project/V2 documentation; audit evidence.  
**Exact implementation scope:** Trace every Definition of Done item to evidence; rerun V1 and V2 test suites; verify scientific method/version and unsupported-goal behavior; inspect schema/migrations/RLS/constraints/deletion; verify auth/session/errors; verify snapshots/history/timezone/week; validate all UI states, mobile/accessibility/browser behavior; compare staging/production configuration without exposing values; inspect network/console/bundle/repository hygiene; reconcile docs with actual behavior; list known non-blocking limitations.  
**Explicit non-goals:** No new feature, redesign, provider migration, catalog expansion, refactor without a release defect, commit/push/tag, or freeze declaration while blockers remain.  
**Required research:** Only current-doc rechecks needed to validate changed provider/security behavior or a discovered scientific discrepancy.  
**Required tests:** Complete automated suite, clean build, local database reset/RLS suite, staging and production core journeys, cross-user deny tests, accessibility/responsive/browser regression, credential scan, git diff/status, documentation link/status audit.  
**Acceptance criteria:** Every DoD item is PASS or explicitly marked not applicable by an accepted decision; no critical/high release blocker; all tests pass; V1 remains frozen functionally; known limitations are accurate; `V2_STATUS.md` identifies V2-P14 next and overall status `READY FOR FREEZE`.  
**Documentation updates:** Final audit evidence/limitations and consistent status across master spec, status, roadmap, project, README, testing, and decisions where facts changed.  
**External/user actions:** Review the final audit and approve proceeding to freeze.  
**Stop conditions:** Any DoD item lacks evidence; any security/privacy/scientific/data-integrity/accessibility release blocker remains; production differs materially from the audited artifact.  
**Recommended commit message:** `Complete CalorieCheck V2 final audit`

---

## V2-P14 — Version 2 Freeze

**Status:** NOT STARTED  
**Objective:** Record the verified Version 2 release as frozen and hand off a stable baseline for future work.  
**Why this phase exists:** A release needs one consistent documented boundary and must not silently flow into later features.  
**Dependencies:** V2-P13 passes and the user explicitly proceeds with the freeze phase.  
**Files likely involved:** `V2_STATUS.md`, `V2_MASTER_SPEC.md`, `ROADMAP.md`, `PROJECT.md`, `README.md`, `DECISIONS.md` or V2 decisions, `TESTING.md`, `PROMPTS.md` only if its role/status requires clarification.  
**Exact implementation scope:** Verify the audited commit/worktree and production health; mark V2 frozen consistently; record release date, deployed environment, methodology and dataset versions, migration state, test summary, known limitations, operational ownership, and deferred backlog; ensure V1/V2 boundaries and the next unassigned future work are clear; inspect final diff/status and recommend human commit/tag language.  
**Explicit non-goals:** No feature, refactor, provider change, nutrition API, automatic Version 3 start, commit, push, merge, branch, or tag.  
**Required research:** None unless a provider fact changed between audit and freeze.  
**Required tests:** Confirm V2-P13 evidence remains current; production health smoke; documentation/status/link consistency; clean build/test summary; git status/diff.  
**Acceptance criteria:** All authoritative docs say `Version 2 COMPLETE / FROZEN`; `V2_STATUS.md` says `FROZEN` with no next implementation phase; release facts and known limitations are recorded; production remains healthy; no code changed except a necessary release-blocker fix followed by re-audit.  
**Documentation updates:** Final release/freeze updates across the listed documents.  
**External/user actions:** Review and perform the final commit/push/tag if desired. Codex may recommend but not execute them without explicit instruction.  
**Stop conditions:** Audit approval is absent; production or tests regressed; documents disagree; any release blocker appears. Return to V2-P13 if code changes are required.  
**Recommended commit message:** `Freeze CalorieCheck Version 2`

## Phase Order

1. V2-P0 — Master Planning and Architecture — **DONE**
2. V2-P1 — Development Platform and Staging Foundation — **DONE**
3. V2-P2 — Authentication and Persistent Session Foundation — **NEXT**
4. V2-P3 — Database Schema, Migrations, and Row-Level Authorization
5. V2-P4 — Evidence-Based Energy Target Engine
6. V2-P5 — Profile Onboarding, Personal Data, and Target History
7. V2-P6 — Calculator to Food Log Integration
8. V2-P7 — Daily Calorie Tracker
9. V2-P8 — Weekly Dashboard and History
10. V2-P9 — Profile Settings, Goal Changes, Log Editing, and Account Deletion
11. V2-P10 — Security, Privacy, Data Integrity, and RLS QA
12. V2-P11 — Responsive, Accessibility, and Cross-Browser QA
13. V2-P12 — Staging Release Verification and Production Deployment
14. V2-P13 — Final Version 2 Audit
15. V2-P14 — Version 2 Freeze
