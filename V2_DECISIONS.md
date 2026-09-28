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

**Status:** ACCEPTED, subject to V2-P5 transcription verification  
**Decision:** Use the 2023 National Academies Dietary Reference Intakes for Energy equations. Age 18 through 18.99 uses the report's matching adolescent branch; age 19+ uses the adult branch.  
**Reason:** This is a current authoritative method and avoids extending adult coefficients to an unsupported age.  
**Consequences:** The pure engine records methodology, version, equation branch, normalized inputs, activity category, assumptions, and output. The UI presents an estimate with uncertainty, not a prescription.

## V2-ADR-010 — Goal Types and “Healthy”

**Status:** ACCEPTED  
**Decision:** Model `MAINTAIN`, `LOSE`, and `GAIN` as user-selected goals. “Healthy/general wellness” is explanatory context and never a fourth equation.  
**Reason:** No authoritative fourth formula was identified, and the application must not decide a user's goal.  
**Consequences:** Maintain has an accepted method. Lose/gain availability depends on V2-ADR-011.

## V2-ADR-011 — Weight-Change Target Method

**Status:** PROPOSED / PHASE GATE  
**Decision:** Evaluate an independent implementation of the published NIH/NIDDK Hall dynamic adult model. Never use a fixed `±500 kcal` rule.  
**Reason:** Dynamic body-weight response is more defensible than a fixed energy adjustment, but the model, inputs, validation, and gain applicability need further verification.  
**Consequences:** V2-P5 must verify equations, licensing boundaries, inputs, domains, reference outputs, and user messaging. Weight loss may be accepted after the gate. Weight gain needs separate evidence; if it fails, V2-P5 stops for a documented product-scope decision rather than inventing a target.

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
