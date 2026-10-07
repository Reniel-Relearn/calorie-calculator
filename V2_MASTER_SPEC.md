# CalorieCheck Version 2 — Master Product Specification

Status: **ACTIVE — IMPLEMENTATION IN PROGRESS**
Baseline: Version 1 at commit `ee81f9d` is complete and frozen.  
Operational plan: [V2_PLAN.md](V2_PLAN.md)  
Current phase: [V2_STATUS.md](V2_STATUS.md)

## 1. Product Purpose

Version 2 extends the frozen CalorieCheck calculator into a private, authenticated calorie tracking application. It preserves the existing deterministic calculator and adds a personal profile, transparent energy estimates, explicit food logging, daily and weekly views, persistent storage, and deployable staging and production environments.

The primary user remains a smartphone user. The shortest useful path is: sign in, see today's status, analyze a food, explicitly add it to today's log, and see totals update.

## 2. Frozen Version 1 Baseline

Version 1 remains the nutrition analysis engine and continues to provide:

- deterministic input parsing and food matching;
- ambiguity, missing amount, invalid input, and recovery states;
- the curated 11-food demo dataset with source provenance;
- mass, volume, and sourced food-specific serving conversions;
- proportional nutrition calculations and serving adjustment;
- responsive, accessible mobile-first UI.

Version 2 must call the existing calculation path. It must not create a second nutrition calculator for logged food.

## 3. Version 2 Scope

Version 2 includes:

- email and password accounts;
- email verification, login, logout, session restoration, and password reset;
- an authenticated application boundary;
- first-time profile onboarding;
- a private user profile and settings;
- evidence-based estimated daily calorie targets with recorded methodology;
- user-selected maintain, lose, and gain goal concepts, subject to the scientific gates below;
- an explicit **Add to Today's Log** action after a successful calculation;
- persistent food logs with nutrition and calculation snapshots;
- edit and delete actions for logged food;
- daily calories, target comparison, and supporting nutrient totals;
- a seven-day history with a textual summary and accessible visualization;
- target history, timezone-safe day assignment, and historical interpretation;
- staging early in implementation and production deployment near completion;
- security controls, database migrations, Row Level Security, privacy controls, and account deletion.

The local 11-food catalog remains the Version 2 nutrition source unless a later approved scope change says otherwise. The UI must continue to call it a **Demo nutrition dataset**.

## 4. Explicit Out of Scope

Version 2 does not include:

- a production nutrition API or broad food catalog;
- AI or LLM food parsing;
- multiple-food sentence parsing or a meal builder;
- barcode or photo recognition;
- restaurant integrations or custom foods;
- social login;
- clinician-authored prescriptions, diagnosis, treatment, or medical monitoring;
- automatic selection of a user's weight goal;
- a fabricated “healthy” calorie equation;
- automatic logging of analyzed food;
- complete micronutrient analysis or macro goal coaching;
- public profiles, social sharing, or leaderboards;
- full offline synchronization or conflict resolution;
- analytics containing profile or food-log data;
- React, Vue, Angular, Next.js, or another frontend framework.

## 5. User Types and Access

### Visitor

A signed-out visitor can create an account, log in, request a password reset, complete an email confirmation flow, and read concise product/privacy information. Personal calculator and tracker data are unavailable while signed out.

### Authenticated user with incomplete profile

The user can restore a session, log out, and complete onboarding. The application directs the user to onboarding before showing a personal target or tracker.

### Authenticated user with complete profile

The user can access the personalized home, calculator, food log, daily and weekly history, settings, and account deletion.

No administrative UI is in Version 2.

## 6. Authentication Journey

1. A visitor chooses **Create Account** or **Log In**.
2. Signup accepts email and password, provides useful validation, and requires email verification in staging and production.
3. Confirmation and password-reset links return only to allow-listed application URLs.
4. A valid session is restored after refresh using the selected auth SDK.
5. Protected views wait for the initial session check before rendering private content.
6. Expired or revoked sessions return the user to authentication with a clear message.
7. Logout clears the application session and private in-memory state.

Social identity providers are deferred. Authentication messages should be useful without exposing whether an unrelated account exists.

## 7. Onboarding Journey

After authentication, the application checks for a complete profile. An incomplete profile opens a mobile-first onboarding flow that:

1. explains why each field is needed;
2. collects only required profile data;
3. validates supported age and canonical units;
4. asks the user to select the activity description that best fits;
5. asks the user to select their own goal;
6. explains the equation's sex categories and target limitations;
7. requests a non-persistent eligibility confirmation that the target is not being used for pregnancy or breastfeeding;
8. suggests the browser's IANA timezone and lets the user correct it;
9. calculates and presents the estimate, methodology, assumptions, and limitations;
10. saves the profile and an effective target-history record atomically.

If the selected goal does not yet have an accepted goal-specific model, onboarding must say that a goal target is unavailable and must not substitute an arbitrary value.

## 8. Profile Requirements

The private profile contains:

- display name;
- date of birth;
- sex used for energy estimation (`male` or `female`, matching the source equations);
- height in centimeters;
- weight in kilograms;
- physical activity category;
- user-selected goal;
- IANA timezone name;
- onboarding completion and audit timestamps.

Date of birth is used because stored age becomes stale and because the 18-to-19 methodology boundary must be handled accurately. Email remains in managed authentication data and is not duplicated in the profile. Gender identity is not collected because it is not an input to the selected equations.

The UI may later accept imperial entry only if it converts to the canonical centimeter/kilogram representation before persistence. Unitless profile values are forbidden.

## 9. Energy Target Requirements

The target engine is deterministic, independent of the DOM, versioned, and covered by reference test vectors. It returns a structured result containing at least:

- eligibility and reason when ineligible;
- maintenance estimate;
- selected goal;
- goal-specific daily target when supported;
- activity category;
- normalized inputs snapshot;
- methodology name and version;
- assumptions, uncertainty, and warnings.

### Maintenance

Use the 2023 National Academies *Dietary Reference Intakes for Energy* equations by sex, age band, and physical activity category. Users age 19 and older use the adult equations. Users age 18 through 18.99 use the report's 14-to-18.99 equation branch; the adult 19+ coefficients must not be extended downward. V2-P4 verified the exact coefficients, 20 kcal/day adolescent growth term, precision behavior, all 16 sex/activity/age branches, and the exact age 18 and 19 boundaries against the primary report.

The product labels the result **Estimated Daily Calorie Target**, **Estimated Energy Requirement**, or **Estimated Maintenance Calories**. It does not call the estimate a prescription or exact physiological truth.

### Weight change

No fixed `±500 kcal` rule is permitted. Goal-specific loss and gain targets require a coherent dynamic model, justified inputs, bounds, validation vectors, and user-facing limitations.

The NIH/NIDDK Body Weight Planner and its published Hall model were evaluated in V2-P4. The gate did not produce a supportable Version 2 implementation: required inputs and numerical behavior exceed the accepted profile model, the official implementation has a technology-transfer licensing path without a clearly identified reusable software license, and independent consumer target vectors were insufficient, particularly for intentional gain. The approved Version 2 scope therefore returns an explicit unavailable outcome for `LOSE` and `GAIN` and never fills the gap with an invented surplus or deficit.

### Eligibility and life stages

- Personalized targets are for users age 18 or older.
- Minors receive no target.
- Pregnancy and breastfeeding are excluded until appropriate life-stage equations and product requirements are deliberately implemented.
- The application stores no pregnancy or breastfeeding status in Version 2; it uses a clear eligibility confirmation and limitation message.
- People with specific health questions are directed to a qualified health professional without generating diagnoses.

## 10. Goal Model

The user chooses one of the product goal concepts:

- `MAINTAIN`: the accepted maintenance estimate;
- `LOSE`: recognized but unavailable in Version 2 because no goal-specific method passed the scientific and licensing gate;
- `GAIN`: recognized but unavailable in Version 2 because no goal-specific method passed its separate evidence gate.

“Healthy” or “general wellness” may appear as neutral context or guidance. It is not a fourth formula and does not alter the calorie result.

Goal weight, target date, and target rate are not Version 2 inputs under the approved maintain-only scope. A later approved model must define them explicitly rather than infer a rate silently.

## 11. Calculator Integration

The existing flow remains intact through `SUCCESS`. For authenticated, onboarded users, `SUCCESS` adds a deliberate **Add to Today's Log** control.

The integration contract is:

```text
V1 calculator result
  → user confirms Add to Today's Log
  → map the immutable result and provenance to a log command
  → persist a user-owned snapshot
  → refresh daily and weekly aggregates
```

Analysis alone never writes a food log. Double submission is prevented while a save is pending, and the UI clearly reports success or failure.

## 12. Food Logging

Each log stores queryable scalar values plus a calculation provenance snapshot:

- owner ID and log ID;
- consumed instant, entry timezone, and stable local calendar date;
- canonical food ID and food name snapshot;
- entered quantity, unit, and descriptor when present;
- normalized amount and normalized unit;
- calories, protein, carbohydrates, fat, fiber, sugar, and sodium snapshots;
- explicit `null` for unavailable nutrients;
- demo dataset version and source reference;
- reference nutrition and conversion metadata needed to reproduce an edit;
- created and updated timestamps.

Editing a serving recalculates from the log's captured reference snapshot so later food-data changes do not rewrite history. Delete requires confirmation and immediately changes on-demand aggregates. Database IDs are never shown to users.

## 13. Daily Tracker

The default dashboard day is the user's current local date. It shows:

- selected date and an accessible date control;
- calories consumed;
- the target effective for that date;
- calories remaining or calories above target, using neutral language;
- protein, carbohydrate, and fat totals;
- fiber, sugar, and sodium totals when useful, with unavailable data kept distinct from zero;
- logged foods with serving context and Edit/Delete actions.

An empty day states **No food logged for this day** and offers the calculator. A missing target, network error, expired session, and incomplete profile each have a specific recoverable state.

## 14. Weekly Tracker

Version 2 uses a fixed Monday-through-Sunday week in the user's profile timezone. The seven-day view shows for each day:

- local date/day label;
- calories consumed;
- target effective on that date, when available;
- remaining or above-target amount;
- seven-day average intake and average applicable target.

Totals are calculated on demand from `food_logs` and `calorie_targets`; Version 2 does not maintain summary rows. A compact CSS/SVG visualization may supplement the data, but an equivalent semantic list or table is mandatory. Color cannot carry meaning alone.

## 15. Personalized Home and Navigation

The authenticated home information order is:

1. **Welcome, [display name]**;
2. today's calorie progress and target summary;
3. the existing food calculator;
4. today's logged foods;
5. access to Weekly, Profile/Settings, and Logout.

Mobile navigation must keep these destinations reachable with comfortable touch targets and visible focus. The screen must not become a dense desktop dashboard scaled down to a phone.

### Mandatory Version 2 design revision gate

V2-P8 and V2-P9 complete the remaining weekly, settings, editing, deletion, and account-control surfaces using the maintained mobile-first baseline. After V2-P9, the project must complete the V2-D0 through V2-D6 design revision program before beginning V2-P10 security hardening.

The design program is currently blocked on this required external input:

**Blocker: Requires user's plan and mockups for design.**

The user-supplied baseline must include a written design plan, approved mobile mockups for the principal authenticated and signed-out journeys, representative non-happy states, and responsive direction for larger screens. No design revision code may be implemented by guessing missing visual direction. Mockups do not authorize controls, destinations, data, or features outside the approved Version 2 scope.

The executable sequence is defined in `V2_PLAN.md`:

1. V2-D0 — approve the user plan and mockups;
2. V2-D1 — audit existing states and create design traceability;
3. V2-D2 — implement visual foundations and shared components;
4. V2-D3 — revise the mobile app shell and navigation;
5. V2-D4 — revise authentication, onboarding, calculator, logging, and Today;
6. V2-D5 — revise weekly, settings, editing, deletion, and account controls;
7. V2-D6 — verify the integrated design on staging and obtain user approval.

The program must preserve the frozen calculator, established V2 behavior, accessibility semantics, security boundaries, privacy rules, scientific language, demo-data disclosure, and vanilla JavaScript/custom CSS architecture. It does not authorize a framework migration, native application wrapper, PWA installation work, gamification, or future-version functionality.

## 16. Settings and Profile Behavior

Users can update display name, date of birth, equation sex, height, weight, activity category, goal, and timezone. A change that affects the target creates a new effective `calorie_targets` record and closes the prior one; it does not overwrite target history.

Timezone changes apply to future entries and future “today” boundaries. Existing `local_date` and `timezone_at_entry` values remain stable so history does not silently move between days. A user can explicitly edit an entry's date/time.

Account deletion is included. It requires a deliberate confirmation and a server-side privileged operation. Deleting the auth user cascades to the profile, target history, and food logs. The frontend must never receive the privileged deletion credential.

## 17. Data Architecture

### Selected platform

Supabase is selected for authentication and persistence. PostgreSQL fits the relational ownership, constraints, date-range queries, migration history, and on-demand aggregation needs. Supabase Row Level Security provides database-enforced user isolation when paired with explicit grants and policies.

### Core entities

- Managed `auth.users`: credentials and auth identity.
- `public.profiles`: one private application profile per auth user.
- `public.calorie_targets`: immutable/effective-dated target history.
- `public.food_logs`: user-owned food and nutrient snapshots.

Proposed logical columns, finalized through migrations in V2-P3:

| Entity | Key fields |
|---|---|
| `profiles` | `user_id`, `display_name`, `date_of_birth`, `sex_for_energy_equation`, `height_cm`, `weight_kg`, `activity_category`, `goal_type`, `timezone_name`, `onboarding_completed_at`, `created_at`, `updated_at` |
| `calorie_targets` | `id`, `user_id`, `goal_type`, `maintenance_kcal`, nullable `target_kcal`, `methodology`, `methodology_version`, `activity_category`, `input_snapshot`, `assumptions`, `warnings`, `effective_from`, nullable `effective_to`, `created_at` |
| `food_logs` | `id`, `user_id`, `consumed_at`, `timezone_at_entry`, `local_date`, `food_id`, `food_name_snapshot`, entered and normalized serving fields, nullable nutrient scalars, `nutrition_dataset_version`, `source_reference`, `calculation_snapshot`, `created_at`, `updated_at` |

The detailed schema is created through versioned SQL migrations in V2-P3. User-owned tables use UUID keys, foreign keys to the managed auth primary key with `ON DELETE CASCADE`, numeric/check constraints, timestamps, and indexes supporting `(user_id, local_date)` and target-effective-date queries.

### Application layers

The existing V1 modules remain focused on parsing, matching, conversion, nutrition calculation, state, and UI. V2 adds separate modules for:

- environment configuration and the Supabase client;
- auth/session state and protected navigation;
- profile validation and persistence;
- the pure target engine;
- food-log mapping and repository access;
- daily/weekly aggregation and formatting;
- V2 view rendering and interaction binding.

DOM modules do not contain scientific formulas or database policy logic. Database modules do not parse food input.

## 18. Privacy and Security Requirements

- All profile, target, and food-log data is private by default.
- Public profiles do not exist.
- The browser uses only the Supabase project URL and current publishable client key.
- Supabase secret keys and legacy `service_role` credentials remain server-side and are never prefixed with `VITE_`.
- Every exposed user table has least-privilege grants, RLS enabled, and separate owner-only SELECT, INSERT, UPDATE, and DELETE policies as appropriate.
- RLS tests include allow and deny cases for two users plus an unauthenticated client.
- Input is validated both in application code and with database constraints.
- Schema and policy changes are versioned migrations, not undocumented dashboard edits.
- Auth redirects use explicit allow lists; production uses exact URLs.
- Staging and production use separate Supabase projects and separate hosting configuration.
- No sensitive profile/log values are sent to analytics or logs.
- Error messages do not include access tokens, credentials, stack traces, or another user's data.
- Account deletion uses a server-side Supabase Edge Function or equivalent protected server boundary.

This is private consumer application data, not medical-record infrastructure, and the product makes no healthcare compliance claim.

## 19. Time and History Model

PostgreSQL `timestamptz` stores unambiguous instants. Profiles store an IANA timezone such as `Asia/Manila`. Each food log also stores `timezone_at_entry` and the derived `local_date` used for reporting.

The browser's `Intl.DateTimeFormat().resolvedOptions().timeZone` may suggest a timezone during onboarding. The user can correct it. Server timezone is never used to define the user's day.

Target rows use `effective_from` and optional `effective_to` unambiguous timestamps. For a completed local date, daily and weekly reports use the last target that became effective by the end of that local date; the current day uses the target effective at the current instant. A same-day profile change therefore updates that day's comparison by design while prior local dates keep their former target. Methodology and input snapshots make old targets interpretable after profile or equation changes.

## 20. Offline and Failure Behavior

Full offline synchronization is excluded. If connectivity is unavailable:

- the local V1 calculator may continue to calculate while an already restored session and loaded app remain usable;
- logging and data edits fail safely with a retryable message;
- no silent offline queue is created;
- the current unsaved calculator result remains in memory where practical;
- dashboards show a network state rather than stale values presented as current.

## 21. Deployment Model

Version 2 remains vanilla JavaScript and adopts Vite as a lightweight build and development tool. Vite provides deterministic builds, `import.meta.env`, dependency management for the Supabase client, and a production `dist` artifact without introducing a UI framework.

Vercel is the selected frontend host. V2-P1 creates an early staging deployment backed only by a staging Supabase project and synthetic test data. Production uses a separate Vercel project/environment and separate Supabase project created near release. Preview and callback URLs are explicitly allow-listed; production uses exact callback URLs. Plan limits and commercial-use terms must be rechecked before launch.

## 22. Accessibility and Responsive Requirements

Every V2 phase preserves the V1 baseline and adds:

- semantic headings, forms, landmarks, lists, and tables;
- explicit labels, descriptions, and useful inline errors;
- keyboard access and predictable focus after auth/view changes;
- announced async success and error states;
- visible focus and comfortable touch targets;
- contrast that does not depend on color alone;
- reduced-motion support;
- chart data available as text;
- no page-level horizontal overflow;
- usable small-phone, phone, tablet, and desktop layouts.

## 23. Version 2 Definition of Done

Version 2 is complete only when:

1. Version 1 calculator regressions pass unchanged.
2. An eligible user can sign up with email/password and verify the email.
3. The user can log in, log out, restore a session after refresh, and reset a password.
4. Signed-out users cannot access private application data or protected views.
5. A first-time user can complete the minimized profile and see a transparent, versioned maintenance estimate.
6. Age, sex-equation, activity, canonical unit, and life-stage limitations are enforced and explained.
7. The user selects a supported goal; unsupported goal calculations remain unavailable rather than fabricated.
8. The greeting uses the profile display name.
9. The user can use the existing calculator and explicitly add a successful result to today's log.
10. Analysis never logs food automatically, and duplicate submission is prevented.
11. Food logs preserve nutrition, serving, source, and dataset snapshots with missing nutrients distinct from zero.
12. The user can view, edit, and delete only their own logged food.
13. Today's calories and nutrient totals are correct and compared with the applicable target using neutral language.
14. A Monday-through-Sunday seven-day view and textual equivalent are correct across timezone and boundary cases.
15. Profile/goal changes create future target history without rewriting prior targets or logs.
16. The user can change timezone without silently reassigning existing log dates.
17. The user can delete the account and all owned application data through a protected server-side flow.
18. Migrations reproduce the schema, constraints, indexes, grants, policies, and deletion behavior.
19. RLS allow and deny tests prove cross-user and unauthenticated isolation for every private table.
20. Secrets are absent from frontend bundles, the repository, test output, and user-visible errors.
21. The V2-D0 design gate has an approved user plan, mockups, responsive interpretation, and complete route/state coverage.
22. The implemented interface passes V2-D1 through V2-D6 traceability and staging approval before security hardening begins.
23. Primary flows work on supported phone, tablet, and desktop sizes and by keyboard.
24. Auth, profile, target, logging, dashboard, error, empty, responsive, accessibility, and cross-browser acceptance checks pass.
25. Staging uses non-production infrastructure and passes release verification.
26. Production uses separate environment values, exact auth redirects, HTTPS, and the approved release artifact.
27. The final V2 audit finds no unresolved release blocker and the documentation is frozen consistently.

## 24. Known Scientific and Product Limitations

- EER is a population-based estimate with material individual uncertainty.
- Selecting a physical activity category is imprecise; the product provides examples and exposes the selected category.
- The source equations use male/female sex categories and do not provide other coefficients.
- The 18-year-old branch differs from the 19+ adult equation and requires explicit boundary tests.
- Pregnancy and breastfeeding targets are excluded.
- The V2-P4 review did not approve a weight-loss model; `LOSE` is unavailable under the approved maintain-only scope.
- The V2-P4 review did not approve a weight-gain model; `GAIN` remains unavailable pending stronger evidence, licensing clarity, and validation.
- The app cannot decide which goal is appropriate for a user.
- The nutrition catalog remains a small curated demo subset.
- Logged totals are only as complete as the selected food and its reported nutrient fields.
- Version 2 is informational software and does not replace individualized professional advice.
