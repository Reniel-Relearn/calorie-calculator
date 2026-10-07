# CalorieCheck Version 2 — Architecture Decision Record

Status values: `ACCEPTED`, `PROPOSED`, `SUPERSEDED`, `REJECTED`.  
Research support is recorded in [V2_RESEARCH.md](V2_RESEARCH.md).

## V2-ADR-001 — Version 2 Product Scope

**Status:** ACCEPTED  
**Decision:** Version 2 adds authentication, private profiles, evidence-based calorie targets, explicit food logging, daily/weekly tracking, settings, persistence, and deployment. The frozen Version 1 calculator remains the nutrition engine and its 11-food demo catalog remains the nutrition source.  
**Reason:** This creates a coherent authenticated tracker without combining it with the separate challenge of production-scale food search.  
**Consequences:** Production nutrition search moves to a later unassigned version. V2 must preserve V1 regressions.

## V2-ADR-002 — Backend and Authentication Provider

**Status:** ACCEPTED  
**Decision:** Use Supabase Auth and PostgreSQL.  
**Reason:** Profiles, effective target history, owned food logs, date-range aggregation, constraints, migrations, and database-enforced row ownership are relational. Supabase supports those needs in one service.  
**Alternatives:** Firebase remains viable and has strong offline capabilities, but Firestore document modeling and rules are less direct for the chosen history and aggregation model. Full offline sync is out of scope.  
**Consequences:** Use the Supabase CLI, SQL migrations, RLS, and the JavaScript client. Provider configuration remains an external human action.

## V2-ADR-003 — Frontend Build Tool

**Status:** ACCEPTED  
**Decision:** Adopt Vite while retaining semantic HTML, custom CSS, and vanilla JavaScript.  
**Reason:** Vite adds dependency management, a development server, environment modes, deterministic production builds, and static deployment without requiring a frontend framework.  
**Consequences:** V2-P1 introduces `package.json`, pinned dependencies, scripts, a `dist` build, and environment documentation. Existing V1 modules are preserved or moved only when justified.

## V2-ADR-004 — Frontend Hosting

**Status:** ACCEPTED  
**Decision:** Use Vercel for frontend staging and production.  
**Reason:** It has a direct Vite deployment path, Git/CLI previews, environment-scoped values, HTTPS, custom domains, and documented Supabase auth redirect patterns.  
**Alternatives:** Netlify and Cloudflare Pages both meet the core static-hosting requirements.  
**Consequences:** Use separate staging and production Vercel projects/configuration. Recheck plan terms and limits before production; Vercel Hobby is limited to appropriate personal/non-commercial use.

## V2-ADR-005 — Environment Separation

**Status:** ACCEPTED  
**Decision:** Use local, staging, and production environments. Staging and production each use separate Supabase projects and separate Vercel configuration.  
**Reason:** Auth redirects, users, personal data, migrations, and credentials must not cross release boundaries.  
**Consequences:** Staging is created in V2-P1 with synthetic data. Production is created in V2-P12. The same versioned migrations are promoted after review.

## V2-ADR-006 — Authentication Scope

**Status:** ACCEPTED  
**Decision:** Support email/password signup, required remote email verification, login, logout, session restoration, password reset, protected views, and recoverable errors. Do not add social login in V2.  
**Reason:** It fulfills the product journey with a smaller security and UI surface.  
**Consequences:** Staging and production require allow-listed confirmation/reset URLs. Production requires a suitable SMTP sender. Protected rendering waits for initial session resolution.

## V2-ADR-007 — Identity and Profile Model

**Status:** ACCEPTED  
**Decision:** Keep identity/credentials in managed `auth.users` and create a private `public.profiles` row keyed to the auth user ID. Create the profile explicitly during onboarding instead of using an automatic signup trigger.  
**Reason:** The public schema is the supported application-data pattern, while explicit onboarding avoids a fragile trigger blocking signup.  
**Consequences:** `profiles.user_id` references the auth primary key with `ON DELETE CASCADE`; RLS allows only the owner. Email is not duplicated.

## V2-ADR-008 — Minimized Profile Data and Canonical Units

**Status:** ACCEPTED  
**Decision:** Store display name, date of birth, sex used for the source equation, height in centimeters, weight in kilograms, activity category, goal, IANA timezone, and audit/completion timestamps.  
**Reason:** These fields support eligibility, equation selection, personalization, and local-day reporting. Date of birth avoids stale age and supports the 18/19 boundary.  
**Consequences:** Gender identity, pregnancy status, body-fat percentage, health conditions, and other speculative data are not stored. Imperial entry may be a future UI convenience but persistence remains canonical.

## V2-ADR-009 — Maintenance Energy Method

**Status:** ACCEPTED — VERIFIED IN V2-P4
**Decision:** Use the 2023 National Academies Dietary Reference Intakes for Energy equations. Age 18 through 18.99 uses the report's matching adolescent branch; age 19+ uses the adult branch.  
**Reason:** This is a current authoritative method and avoids extending adult coefficients to an unsupported age.  
**Consequences:** The pure engine records methodology, version, equation branch, normalized inputs, activity category, assumptions, and output. The UI presents an estimate with uncertainty, not a prescription.

## V2-ADR-010 — Goal Types and “Healthy”

**Status:** ACCEPTED  
**Decision:** Model `MAINTAIN`, `LOSE`, and `GAIN` as user-selected goals. “Healthy/general wellness” is explanatory context and never a fourth equation.  
**Reason:** No authoritative fourth formula was identified, and the application must not decide a user's goal.  
**Consequences:** Maintain has an accepted method. Lose/gain availability depends on V2-ADR-011.

## V2-ADR-011 — Weight-Change Target Method

**Status:** ACCEPTED — APPROVED 2026-10-05
**Decision:** Ship Version 2 with the verified maintenance method only. Keep `LOSE` and `GAIN` as recognized user goal concepts that return an explicit unavailable outcome. Do not implement the Hall model, copy the NIDDK planner, or use a fixed `±500 kcal` adjustment.
**Reason:** The published Hall model requires additional goal, timeframe, continuous activity, body-composition, diet-composition, sodium, and numerical-simulation behavior. The official implementation is listed through NIH technology transfer, no reusable software license was identified, and independent consumer target vectors—especially for intentional gain—were not available for a defensible implementation.
**Consequences:** V2-P4 includes no deficit, surplus, or dynamic weight-change model. Onboarding may calculate and persist a target only for `MAINTAIN`; selecting `LOSE` or `GAIN` must explain that Version 2 has no approved target method. A later version may revisit weight change after a separately approved scientific, licensing, input, and validation plan.

## V2-ADR-012 — Eligibility and Life-Stage Scope

**Status:** ACCEPTED  
**Decision:** Personalized targets are available from age 18. Minors receive no target. Pregnancy and breastfeeding are excluded in Version 2.  
**Reason:** The chosen sources have explicit age/life-stage boundaries, and Version 2 does not implement specialized life-stage equations.  
**Consequences:** Use a non-persistent eligibility confirmation and clear limitation. Do not store pregnancy/breastfeeding status or apply generic adjustments.

## V2-ADR-013 — Food Log Snapshot Strategy

**Status:** ACCEPTED  
**Decision:** Store scalar serving/nutrient fields for querying plus a sanitized calculation and provenance snapshot for historical reproduction.  
**Reason:** Old logs must remain meaningful after `foods.js`, serving metadata, or nutrition values change. Serving edits must not silently adopt new source data.  
**Consequences:** Null nutrients remain null. Editing recalculates from the captured reference snapshot. The V1 calculator result is mapped into a log command only after explicit user confirmation.

## V2-ADR-014 — Target History Strategy

**Status:** ACCEPTED  
**Decision:** Store immutable/effective-dated `calorie_targets` with input and methodology snapshots. Close the current row and create a new row when a target-affecting profile or goal value changes.  
**Reason:** Overwriting one target would corrupt historical daily/weekly interpretation.  
**Consequences:** Only one current target may exist per user. Target replacement should be atomic. Completed-day reports resolve the last target effective by the end of that local date; the current day uses the target effective now. Same-day changes update that day's comparison, while prior dates keep their former target.

## V2-ADR-015 — Timezone and Week Boundaries

**Status:** ACCEPTED  
**Decision:** Store instants as PostgreSQL `timestamptz`, profile timezones as IANA names, and each log's `timezone_at_entry` plus stable `local_date`. Weeks run Monday through Sunday.  
**Reason:** “Today” must not depend on server time, and historical dates must not move when a user changes timezone. A fixed week rule is predictable and testable.  
**Consequences:** Browser timezone is only a suggestion. Timezone changes apply to future day assignment; explicit entry edits may change historical dates.

## V2-ADR-016 — Dashboard Aggregation

**Status:** ACCEPTED  
**Decision:** Calculate daily and seven-day totals on demand from `food_logs` and effective target history. Do not create summary tables in V2.  
**Reason:** The data volume and query shape are small, and on-demand sums avoid synchronization bugs.  
**Consequences:** Add indexes for owner/date and effective-target queries. Reconsider summaries only with measured performance evidence.

## V2-ADR-017 — Private Data Authorization

**Status:** ACCEPTED  
**Decision:** Private tables use least-privilege grants plus operation-specific RLS owner policies. No profile is public.  
**Reason:** Enabling RLS alone is insufficient, and browser filtering is not authorization.  
**Consequences:** Every private table requires allow and deny tests for owner, other authenticated user, and signed-out requests before its phase completes.

## V2-ADR-018 — Client and Privileged Credentials

**Status:** ACCEPTED  
**Decision:** The browser receives only the Supabase URL and publishable key. Privileged secret/legacy `service_role` credentials remain in a server-managed environment and never use a `VITE_` prefix.  
**Reason:** Vite embeds `VITE_*` variables into client code, and privileged Supabase credentials bypass RLS.  
**Consequences:** `.env.local` is ignored; `.env.example` documents public placeholders only. Account deletion runs through a protected server function.

## V2-ADR-019 — Account and Data Deletion

**Status:** ACCEPTED  
**Decision:** Include Delete Account in Version 2. A protected server-side function deletes the auth user; foreign-key cascades remove the profile, targets, and food logs.  
**Reason:** Users should control persistent personal data, and the browser cannot safely perform privileged auth deletion.  
**Consequences:** Require explicit confirmation, verify the caller and current provider reauthentication guidance, test cascades and cross-user denial, clear local session state, and explain that the operation is irreversible.

## V2-ADR-020 — Offline Behavior

**Status:** ACCEPTED  
**Decision:** Do not implement offline synchronization or a durable write queue.  
**Reason:** Conflict resolution would add substantial complexity and is not required for V2.  
**Consequences:** Local calculation may continue in an already loaded app, but remote writes and dashboards display clear retryable network states. Unsaved results may remain in memory only.

## V2-ADR-021 — Accessible Weekly Visualization

**Status:** ACCEPTED  
**Decision:** Use a small native CSS/SVG visualization only if it improves comprehension, backed by a semantic textual list/table. Do not add a chart library by default.  
**Reason:** Seven values do not justify a heavy dependency, and information must remain available without vision, color, pointer input, or animation.  
**Consequences:** V2-P8 tests labels, focus, contrast, non-color cues, reduced motion, and equivalence between chart and text.

## V2-ADR-022 — Browser Authentication Lifecycle

**Status:** ACCEPTED
**Decision:** Render a session-checking boundary before any private shell, restore stored sessions with Supabase Auth and validate the current user against the Auth server, defer auth-event work outside the provider callback, and log out only the current browser session. Confirmation and recovery redirects are fixed same-origin URLs generated by the application, and callback parameters are removed after processing. Require remote email confirmation and an eight-character minimum password.
**Reason:** This prevents protected-content flashes, avoids user-controlled open redirects, catches invalid stored sessions, avoids Supabase callback deadlocks, and does not unexpectedly end sessions on a user's other devices.
**Consequences:** The browser uses `?auth=confirm` and `?auth=recovery`; each deployed origin must allow-list those URLs. Signup and reset responses resist account enumeration, provider details never reach visible errors, and a provider configuration that returns an immediate signup session is treated as a blocking confirmation error.

## V2-ADR-023 — Atomic Profile Onboarding Mutation

**Status:** ACCEPTED
**Decision:** Complete initial profile onboarding through one `security definer` PostgreSQL RPC. The function derives the owner from `auth.uid()`, uses an empty search path with schema-qualified objects, validates the profile and target payloads, and writes the profile plus first effective target in one transaction. Grant execution only to `authenticated`, accept no caller-supplied user ID, and revoke direct browser mutations for the onboarding-owned profile and target fields.
**Reason:** The profile and its first target form one logical operation. A single authenticated transaction prevents partial persistence, reduces exposed write privileges, and makes the ownership boundary enforceable in the database.
**Consequences:** The browser supplies canonical validated values and the V2-P4 target snapshot, then consumes the returned profile and target. Identical retries return the existing completed result without adding a duplicate target. Future settings changes that replace an effective target require a separate atomic workflow consistent with V2-ADR-014.

## V2-ADR-024 — Idempotent Food-Log Creation Boundary

**Status:** ACCEPTED
**Decision:** Create initial food logs through one authenticated `security definer` PostgreSQL RPC. A browser-generated UUID serves as both the log ID and idempotency key. The function derives ownership from `auth.uid()`, uses an empty search path with schema-qualified objects, validates the snapshot against its core scalars, and returns an existing row only when an identical retry uses the same ID and payload. Direct authenticated food-log inserts are revoked.
**Reason:** Disabling a button prevents ordinary double clicks but cannot resolve a network response lost after a committed insert. A stable request ID makes retry behavior deterministic while keeping ownership out of browser-controlled input.
**Consequences:** The logging controller retains the complete command after a recoverable failure and retries it unchanged. A conflicting retry fails, another user cannot reuse an existing ID, and future edits remain separate owner-scoped operations. The contract is documented in `V2_DATA_CONTRACTS.md`.

## V2-ADR-025 — Null-Aware Daily Aggregation and Target Resolution

**Status:** ACCEPTED
**Decision:** Build daily summaries on demand from owner-filtered food logs for one stable `local_date`. Resolve the current day's target at the current instant and a completed day's target as the last target that became effective by the end of that date in the profile timezone. Represent each nutrient total as complete, partial, or unavailable rather than coercing missing source values to zero.
**Reason:** Food-log history already contains queryable snapshots, and effective target history already preserves changes. Client-side on-demand aggregation keeps the daily view consistent with V2-ADR-014 and V2-ADR-016 without a summary table or server-time day boundary.
**Consequences:** Calories total all logged calorie snapshots. A nutrient with values on every entry has a complete total; mixed known and null values show a disclosed known partial total; all-null values remain unavailable; explicit numeric zeros remain zero. The interface uses neutral remaining/above language and a labeled native meter only when a target exists.

## V2-ADR-026 — Post-Feature Interface Revision Gate

**Status:** ACCEPTED — APPROVED 2026-10-07

**Decision:** Complete V2-P8 and V2-P9 before revising the full interface, then require the V2-D0 through V2-D6 design program before V2-P10. V2-D0 is a hard external-input gate: **Blocker: Requires user's plan and mockups for design.** No design revision implementation may begin until the supplied plan, mobile mockups, non-happy states, and responsive direction are reviewed and explicitly approved.

**Reason:** V2-P8 and V2-P9 create the remaining weekly, settings, editing, deletion, and account-control screens. Revising earlier would target an incomplete information architecture and cause avoidable rework. Revising after security, accessibility, release, or freeze phases would invalidate late-stage verification.

**Consequences:** Existing phase identifiers remain stable. Seven inserted design phases cover approval, audit, foundations, navigation, primary flows, management flows, and integrated staging verification. V2-P10 depends on their completion. The revision preserves validated behavior and scope and does not authorize a UI framework, native wrapper, PWA work, or future feature.

## V2-ADR-027 — Weekly Average and Presentation Policy

**Status:** ACCEPTED — IMPLEMENTED 2026-10-07

**Decision:** Use fixed Monday-through-Sunday weeks in the profile timezone. For a completed week, average intake across all seven dates, including zero-log dates. For the current week, average intake across elapsed dates from Monday through today and exclude future dates. Average target across only those elapsed dates with an applicable numeric target, and disclose complete, partial, or unavailable target coverage. Use a semantic seven-item ordered list as the complete V2-P8 representation and do not add a chart.

**Reason:** Counting elapsed zero-log dates prevents logging frequency from changing the intake denominator, while excluding future dates avoids depressing a current-week average with days that have not occurred. Target history may be absent for part of a week, so a separate applicable-target denominator is more accurate than inventing or carrying an unavailable value. Seven textual records remain clear on small phones and do not justify duplicate chart interaction or a chart dependency.

**Consequences:** Every weekly result contains exactly seven ordered dates. Upcoming dates remain visible but are labeled and excluded from averages and comparison. The UI states both denominator counts, preserves historical per-day targets, and conveys all information in text without relying on color. The approved V2 design revision may add a lightweight visualization only if it remains equivalent to the semantic list.

## V2-ADR-028 — Settings, Historical Log Correction, and Hard Deletion Boundaries

**Status:** ACCEPTED — IMPLEMENTED LOCALLY 2026-10-07

**Decision:** Apply profile and target-affecting settings through one authenticated database transaction. A display-name-only change updates the profile without rotating target history; any canonical equation input or timezone change closes the current target and creates one new effective row. Edit a food log only through its saved calculation snapshot and keep its saved unit, descriptor, food identity, dataset, reference, and conversion route immutable. Delete logs through owner-scoped RLS. Delete an account only through a JWT-protected Edge Function that validates the caller, verifies the current password, and invokes hard auth-user deletion with a server-only privileged credential.

**Reason:** Target and log history must remain interpretable after settings and dataset changes. The browser cannot safely hold an admin credential, and destructive account removal needs recent proof that the signed-in user knows the current password.

**Consequences:** Direct authenticated updates to food-log calculation fields are revoked. The `update_profile_settings` and `update_food_log` RPCs derive the owner from `auth.uid()` and reject partial or provenance-changing mutations. Existing log dates do not move when the profile timezone changes; an explicit edit may assign a new date and refresh both affected dashboard ranges. The frontend receives only a success or safe failure from `delete-account`; auth-user deletion cascades application rows and the client clears its local session. Staging deployment and a disposable-account cascade test remain required before V2-P9 is complete.
