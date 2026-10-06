# CalorieCheck Version 2 — Research Record

Initial research date: **2026-09-28**
Latest phase recheck: **2026-10-05**
Policy: Prefer current official or primary sources. Recheck provider behavior, prices, limits, and SDK versions in the phase that installs or configures them.

## Research Status Key

- **Resolved**: sufficient to make an architecture decision.
- **Phase gate**: direction is identified, but exact implementation must be verified before code is accepted.
- **Unresolved**: no production behavior may be inferred yet.

## R-001 — Which method should estimate maintenance calories?

**Status:** Resolved and verified in V2-P4.

**Authoritative sources**

- National Academies of Sciences, Engineering, and Medicine, [Dietary Reference Intakes for Energy (2023), Chapter 5](https://www.nationalacademies.org/read/26818/chapter/7), especially Tables 5-15 and 5-16.
- National Academies/NCBI, [full report record](https://www.ncbi.nlm.nih.gov/books/NBK588659/?report=classic), DOI `10.17226/26818`.
- National Academies, [Chapter 7 activity examples and application guidance](https://www.nationalacademies.org/read/26818/chapter/9).

**Finding**

The 2023 report supplies sex-specific Estimated Energy Requirement equations using age in years, height in centimeters, weight in kilograms, and physical activity category. Table 5-16 covers adults age 19+ and states that EER equals predicted total energy expenditure for weight-stable adults. The report has a separate 14-to-18.99 branch, so an 18-year-old must not be run through the 19+ coefficients.

Adult 19+ equations verified in V2-P4:

| Equation sex | PAL category | EER (kcal/day) |
|---|---|---|
| Male | Inactive | `753.07 - 10.83×age + 6.50×heightCm + 14.10×weightKg` |
| Male | Low active | `581.47 - 10.83×age + 8.30×heightCm + 14.94×weightKg` |
| Male | Active | `1004.82 - 10.83×age + 6.52×heightCm + 15.91×weightKg` |
| Male | Very active | `-517.88 - 10.83×age + 15.61×heightCm + 19.11×weightKg` |
| Female | Inactive | `584.90 - 7.01×age + 5.72×heightCm + 11.71×weightKg` |
| Female | Low active | `575.77 - 7.01×age + 6.60×heightCm + 12.14×weightKg` |
| Female | Active | `710.25 - 7.01×age + 6.54×heightCm + 12.34×weightKg` |
| Female | Very active | `511.83 - 7.01×age + 9.07×heightCm + 12.56×weightKg` |

The report emphasizes that PAL selection is difficult and approximate. Adult PAL ranges are inactive `1.00–<1.53`, low active `1.53–<1.68`, active `1.68–<1.85`, and very active `1.85–<2.50`, with activity examples intended as general guides.

**Consequence for CalorieCheck**

- Use the 2023 National Academies EER method for maintenance.
- Support eligible users from age 18, routing age 18 through 18.99 to the report's matching younger equation branch and age 19+ to Table 5-16.
- Use source activity labels and explanatory examples; do not claim precise PAL measurement.
- Store normalized inputs, equation identifier, methodology version, and output in target history.
- Describe the number as an estimate, not a prescription.

**V2-P4 verification**

The primary report's Tables S-2 and S-3 confirm all 16 sex, PAL, and supported-age branches. Age 18 through values below 19 use the 14-to-18.99 equations plus 20 kcal/day for growth; age 19 and above uses the adult equations without the growth term. The implementation matches the report's worked example for a 22-year-old, low-active woman at 165 cm and 63 kg: 2,275.37 kcal/day before presentation rounding and 2,275 kcal/day when displayed as a whole calorie value.

## R-002 — What should “sex” mean in the profile?

**Status:** Resolved.

**Source**

- National Academies 2023 equations above, which publish separate male and female coefficients.

**Finding**

The source variable is a two-category sex variable. It does not publish a coefficient for gender identity or another sex category.

**Consequence for CalorieCheck**

Use the label **Sex used for energy estimation** with `male` and `female`, explain why it is requested, and document the source limitation. Do not collect gender identity without a separate product need. If the user cannot select a supported coefficient, the target is unavailable; the application must not invent one.

## R-003 — What are the adult and pregnancy/breastfeeding limits?

**Status:** Resolved for Version 2 scope.

**Sources**

- National Academies 2023 report above.
- NIDDK, [About the Body Weight Planner](https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner).

**Finding**

The public NIDDK planner is for adults age 18+ and explicitly excludes younger people and people who are pregnant or breastfeeding. The National Academies report has distinct life-stage treatment and a 19+ adult equation branch.

**Consequence for CalorieCheck**

- Product eligibility begins at age 18, with the correct National Academies age branch.
- No target is returned below 18.
- Pregnancy and breastfeeding are excluded in V2 instead of adding unsourced adjustments.
- Use a clear eligibility confirmation without persisting pregnancy/breastfeeding status.

## R-004 — How should weight-loss and weight-gain targets be calculated?

**Status:** No Version 2 weight-change method passed the V2-P4 gate; maintain-only scope approved on 2026-10-05.

**Primary sources**

- NIDDK, [Research Behind the Body Weight Planner](https://www.niddk.nih.gov/research-funding/at-niddk/labs-branches/laboratory-biological-modeling/integrative-physiology-section/research/body-weight-planner).
- Hall et al., [Dynamic Mathematical Model of Body Weight Change in Adults — web appendix](https://www.niddk.nih.gov/-/media/Files/BWP/Hall_Lancet_Web_Appendix.pdf).
- Hall et al., *Quantification of the effect of energy imbalance on bodyweight*, *The Lancet* (2011), cited by NIDDK.
- Chow and Hall, [The Dynamics of Human Body Weight Change](https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1000045) (2008, open-access primary research).

**Finding**

The NIDDK Body Weight Planner uses a dynamic adult model to create calorie/activity plans for reaching a goal weight in a specified time and maintaining it. This is a better scientific direction than a fixed `maintenance ± 500 kcal` rule. The model is materially more complex than a constant deficit, and the official public-facing research is centered on weight loss and maintenance. The equations model positive and negative energy imbalance, but current official material reviewed here does not provide enough product validation to accept a consumer weight-gain target without further work.

NIDDK also describes a newer Personalized Body Weight Management System as patented/licensable. That product must not be conflated with the published 2011 equations.

**Consequence for CalorieCheck**

- Do not implement a fixed deficit or surplus.
- V2-P4 rechecked the published model, implementation boundary, required inputs, public tool behavior, and available validation evidence.
- A loss target would require at least current weight, goal weight, goal date or timeframe, age, sex, height, and continuous activity assumptions, plus body-composition and numerical-simulation defaults that the current product does not define.
- A gain target still lacks a separate set of authoritative consumer target vectors and official product validation.
- Keep the National Academies maintenance estimate visible even when a separate goal model supplies a goal-specific target; label each methodology.

**Unresolved uncertainty**

- The official Body Weight Planner implementation is listed by NIH Technology Transfer as a licensable invention, while the linked peer-reviewed appendix publishes model equations but no reusable software license was identified.
- The public planner adds a 1,000 kcal/day floor and goal-weight/BMI warnings. Importing those product rules would require separate evidence and product decisions rather than treating them as equation constants.
- The official sources center on adult weight loss and weight-loss maintenance. They do not provide sufficient independent consumer target vectors for intentional gain.
- A later implementation would need an approved licensing position, exact numerical integration specification, independently reproduced outputs, safe input domains, and user-facing limits.

## R-005 — Is “healthy” a separate goal formula?

**Status:** Resolved.

**Finding**

No reviewed authoritative source defines a fourth “healthy” EER equation. Health context depends on factors beyond a calorie target.

**Consequence for CalorieCheck**

“Healthy” or “general wellness” may be messaging only. The product supports `MAINTAIN`, `LOSE`, and `GAIN` concepts and never calculates a fabricated fourth value.

## R-006 — Supabase or Firebase?

**Status:** Resolved: select Supabase.

**Official Supabase sources**

- [Password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- [User sessions](https://supabase.com/docs/guides/auth/sessions)
- [Managing user data](https://supabase.com/docs/guides/auth/managing-user-data)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Database migrations](https://supabase.com/docs/guides/local-development/database-migrations)
- [Local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Database testing](https://supabase.com/docs/guides/local-development/testing/overview)
- [API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [JavaScript admin deleteUser](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser)
- [Pricing](https://supabase.com/pricing)

**Official Firebase sources**

- [Firebase Authentication for web](https://firebase.google.com/docs/auth/web/start)
- [Authentication state persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence)
- [Firestore Security Rules conditions](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Testing Firestore Security Rules](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Firestore offline data](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Firebase API keys](https://firebase.google.com/docs/projects/api-keys)
- [Firebase pricing](https://firebase.google.com/pricing)

### Comparison

| Criterion | Supabase | Firebase |
|---|---|---|
| Email/password auth | Supported, including confirmation and reset flows | Supported, including verification/reset flows |
| Session persistence | Supabase Auth SDK manages JWT/refresh sessions | Firebase Auth offers local/session/memory persistence |
| Data fit | Relational Postgres fits profile → targets/logs and date-range totals | Firestore documents can model the data but require denormalized query design |
| User isolation | Postgres grants plus RLS policies using `auth.uid()` | Firestore Security Rules using `request.auth.uid` |
| Integrity | Foreign keys, checks, numeric types, transactions, indexes | Rules validation and application logic; no relational foreign keys |
| Migrations | Versioned SQL migrations and reproducible local resets | Rules/indexes are versionable; document-shape migrations need application/admin work |
| Local test | CLI local stack, Mailpit, pgTAP/RLS tests | Emulator Suite and rules tests |
| Daily/weekly aggregation | Natural SQL sums and effective-date joins | Possible, but query/aggregation and history joins are less direct |
| Offline | No full client sync selected | Strong optional Firestore offline cache |
| Frontend complexity | One client SDK; SQL/RLS requires care | Modular SDK; document/rules modeling requires care |
| Demo cost | Current free tier exists; limits must be rechecked | Spark/no-cost tiers exist; limits must be rechecked |

**Decision consequence**

Select Supabase because the product is relational, needs effective-dated target history and date aggregation, and benefits from database constraints and migration-first RLS. Firebase remains viable, especially if offline sync became primary, but Version 2 explicitly does not require that capability.

## R-007 — What is the Supabase authorization model?

**Status:** Resolved architecturally.

**Finding**

Supabase states that grants and RLS policies are separate checks. Exposed tables require least-privilege grants, RLS, and operation-specific policies. `auth.uid()` identifies the current authenticated user. INSERT requires `WITH CHECK`; UPDATE should use both `USING` and `WITH CHECK` and also needs a SELECT policy; DELETE uses `USING`. The current docs explicitly include database policy tests and warn that the privileged service role bypasses RLS.

**Consequence for CalorieCheck**

- Revoke default grants and grant only required operations to `authenticated`.
- Give `anon` no access to profiles, targets, or food logs.
- Write explicit owner policies for each permitted operation.
- Test User A allow cases, User A → User B deny cases, and signed-out deny cases for each table.
- Treat UI filtering as presentation only; the database remains authoritative.

## R-008 — How should auth identities and profiles relate?

**Status:** Resolved.

**Source**

- Supabase, [Managing user data](https://supabase.com/docs/guides/auth/managing-user-data).

**Finding**

The managed `auth` schema is not exposed through the generated API. Supabase recommends a public application table referencing the `auth.users` primary key, protected by RLS, with `ON DELETE CASCADE` where appropriate. Signup triggers can block signup if faulty and require thorough testing.

**Consequence for CalorieCheck**

Use `auth.users` for identity and `public.profiles` for private application data. Prefer explicit profile creation during onboarding over a complex signup trigger. All user-owned rows reference the auth user primary key and cascade on account deletion.

## R-009 — Which keys can be in the browser?

**Status:** Resolved.

**Sources**

- Supabase, [API keys](https://supabase.com/docs/guides/getting-started/api-keys).
- Vite, [Environment Variables and Modes](https://vite.dev/guide/env-and-mode).

**Finding**

Supabase's current terminology is **publishable key** for public client initialization and **secret key** for privileged server work; legacy `anon`/`service_role` keys are being deprecated. Authorization still depends on the user's JWT, grants, and RLS. Vite embeds every `VITE_*` value into the client bundle.

**Consequence for CalorieCheck**

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are public client configuration.
- No secret key, legacy `service_role` key, database password, SMTP credential, or provider management token may use a `VITE_` name or enter frontend code.
- Account deletion runs in a server-side Supabase Edge Function (or equivalent) with its privileged secret supplied by the server environment.

## R-010 — Should email verification be required?

**Status:** Resolved: yes in staging and production.

**Sources**

- Supabase, [Password-based Auth](https://supabase.com/docs/guides/auth/passwords).
- Supabase, [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

**Finding**

Hosted Supabase projects enable confirmation by default, while local development differs. Signup confirmation and password reset need correct allow-listed redirect URLs. Supabase's default email service is limited and best effort; production should use custom SMTP.

**Consequence for CalorieCheck**

- Require email verification in remote environments.
- Test local email flows with Mailpit and remote flows with the staging sender.
- Configure exact production redirects and restricted preview patterns only where needed.
- Configure a production-capable SMTP provider before production release; never place SMTP credentials in the frontend.

## R-011 — How should account deletion work?

**Status:** Resolved architecturally.

**Sources**

- Supabase, [admin deleteUser](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser).
- Supabase, [Deleting users](https://supabase.com/docs/guides/auth/managing-user-data#deleting-users).

**Finding**

Deleting an auth user requires a privileged server operation and must never run with a browser-exposed credential. A deleted user's already-issued access JWT can remain valid until expiry, while refresh sessions are removed. Foreign keys can cascade application data.

**Consequence for CalorieCheck**

Use a protected Edge Function, verify the caller and recent authentication/explicit confirmation, delete the auth user, and rely on tested cascades for profile, target, and log rows. Keep access-token expiry appropriately bounded and immediately clear client state. Do not add Storage ownership in V2.

## R-012 — Native ES modules or Vite?

**Status:** Resolved: adopt Vite and retain vanilla JavaScript.

**Sources**

- Vite, [Getting Started](https://vite.dev/guide/)
- Vite, [Building for Production](https://vite.dev/guide/build)
- Vite, [Deploying a Static Site](https://vite.dev/guide/static-deploy)
- Vite, [Environment Variables and Modes](https://vite.dev/guide/env-and-mode)

**Finding**

Vite keeps `index.html` as the entry point, serves native modules during development, builds a static `dist` artifact, supports environment modes, and does not require a frontend framework. It also makes the Supabase client a normal pinned dependency.

**Consequence for CalorieCheck**

Introduce Vite in V2-P1, keep vanilla JavaScript and the V1 module boundaries, and document the supported modern browser baseline. Vite is a build tool only. No UI framework is approved.

## R-013 — Which frontend host should be used?

**Status:** Resolved: Vercel, with terms/limits rechecked before release.

**Official sources**

- Vercel, [Environments](https://vercel.com/docs/deployments/environments), [Vite](https://vercel.com/docs/frameworks/frontend/vite), [environment variables](https://vercel.com/docs/environment-variables), and [CLI deployment](https://vercel.com/docs/projects/deploy-from-cli).
- Netlify, [Deploy overview](https://docs.netlify.com/deploy/deploy-overview/), [Deploy Previews](https://docs.netlify.com/deploy/deploy-types/deploy-previews/), and [environment variables](https://docs.netlify.com/build/environment-variables/overview/).
- Cloudflare Pages, [Preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/), [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), and [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

### Comparison

| Criterion | Vercel | Netlify | Cloudflare Pages |
|---|---|---|---|
| Vite static deploy | First-class documented support | Standard build/deploy support | Standard Vite/Pages support |
| Previews | Per branch/commit, separate Preview values | Deploy previews and branch deploys | PR previews and stable branch aliases |
| Environment values | Development/Preview/Production; custom staging is paid | Context and branch-specific values | Preview/production build values |
| HTTPS/domain | Automatic HTTPS and custom domains | Automatic SSL and domains | HTTPS and domains; apex domain prefers Cloudflare DNS |
| Auth redirects | Supabase documents Vercel preview patterns | Supabase documents Netlify preview patterns | Possible, needs manual URL planning |
| Demo suitability | Simple Vite path; Hobby is personal/non-commercial | Strong deploy workflow | Strong free limits and preview controls |

**Decision consequence**

Use Vercel for the lowest-friction Vite and preview workflow. Use separate staging and production Vercel projects/configurations so database credentials and auth redirect domains cannot cross environments. The free Hobby plan is suitable only when its current personal/non-commercial terms fit; confirm plan and cost before production.

## R-014 — How should staging and production be separated?

**Status:** Resolved.

**Sources**

- Supabase, [Managing environments](https://supabase.com/docs/guides/deployment/managing-environments).
- Vercel environment sources above.

**Finding**

Both providers support environment-specific configuration. Supabase migrations can be applied to linked remote projects after local verification. Auth redirects are environment-specific.

**Consequence for CalorieCheck**

- Local: Vite plus local Supabase CLI stack where available.
- Staging: dedicated Supabase project and dedicated Vercel project/URL, created in V2-P1; synthetic/test accounts only.
- Production: separate Supabase and Vercel projects, created/configured in V2-P12 after QA.
- Apply the same reviewed migrations to each database; do not clone secrets or real personal data into staging.

## R-015 — What timezone model is reliable?

**Status:** Resolved.

**Sources**

- PostgreSQL, [Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html).
- MDN, [`Intl.DateTimeFormat.prototype.resolvedOptions()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions).

**Finding**

PostgreSQL stores timezone-aware timestamps internally as UTC and recognizes IANA timezone names. Browsers expose a default IANA timezone through `Intl.DateTimeFormat`.

**Consequence for CalorieCheck**

Store `consumed_at` as `timestamptz`, profile timezone as an IANA name, and a `timezone_at_entry` plus stable `local_date` on each log. Suggest the browser timezone and permit correction. Existing local dates do not move when the profile timezone changes. Define weeks as Monday through Sunday.

## R-016 — Snapshots or recalculation for historical logs and targets?

**Status:** Resolved: snapshots plus effective history.

**Finding**

Recalculating old logs against a changing food catalog would silently change history. Overwriting a target after profile changes would make earlier daily/weekly comparisons misleading.

**Consequence for CalorieCheck**

- Store scalar nutrient outputs and a sanitized calculation/source snapshot per food log.
- Store effective-dated calorie target records with input/methodology snapshots.
- Edit a log from its captured reference snapshot, creating a new updated snapshot; never depend only on current `foods.js` values.
- Compute dashboard aggregates on demand; do not add summary rows in V2.

## R-017 — What is the offline requirement?

**Status:** Resolved: no offline synchronization.

**Finding**

Firebase offers client offline persistence, but adopting sync/conflict behavior would materially increase scope. Supabase Auth can persist a session, while database work still needs connectivity.

**Consequence for CalorieCheck**

No offline write queue. Local calculator operations can continue in an already loaded authenticated app, but saving and remote dashboards show clear retryable network errors. Do not present cached totals as current without an explicit stale indication.

## R-018 — V2-P1 provider and toolchain recheck

**Status:** Verified and implemented; local and remote staging checks completed on 2026-09-30.

**Official sources**

- Vite, [Getting Started](https://vite.dev/guide/) and [Vite 8 announcement](https://vite.dev/blog/announcing-vite8).
- Supabase, [Local development with CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) and [API keys](https://supabase.com/docs/guides/api/api-keys).
- Vercel, [Vite](https://vercel.com/docs/frameworks/frontend/vite), [Environment Variables](https://vercel.com/docs/environment-variables), and [Hobby plan](https://vercel.com/docs/plans/hobby).

**Finding**

- Vite 8 requires Node.js 20.19+ or 22.12+. CalorieCheck selects Node 22.12+ as its documented development baseline and pins Vite 8.3.1.
- The Supabase CLI supports project-local npm installation and requires Node.js 20+. CalorieCheck pins CLI 2.118.0 and Supabase JS 2.117.2.
- Current browser configuration uses a publishable key beginning with `sb_publishable_`. Supabase secret keys are privileged, bypass normal RLS protection, and must remain outside source and browser bundles. Legacy `anon` and `service_role` key terminology is being phased out.
- Vercel supports Vite's static `dist` output and environment-scoped values. A separate Vercel project remains the chosen staging boundary because a Vercel project's production environment can represent CalorieCheck staging without sharing the later production project.
- Vercel's Hobby plan is restricted to personal, non-commercial use. The user must confirm that the intended use fits those terms or select an eligible paid plan before staging is approved.
- Local Supabase requires a Docker-compatible container engine. The stack runs successfully on Docker Desktop after disabling the unused local analytics/log-collector service; database, Auth, REST, Storage, Realtime, Studio, Edge Runtime, and Mailpit remain enabled.

**Implementation consequence**

Use the pinned project-local tools and lockfile, expose only the staging URL and publishable key through `VITE_*`, validate them before constructing the client, and keep staging isolated from production. The dedicated Supabase/Vercel staging projects and `https://calorie-calculator-gamma-ten.vercel.app/` HTTPS deployment satisfy the V2-P1 environment boundary.

## R-019 — V2-P2 authentication behavior recheck

**Status:** Verified locally on 2026-10-01 and on remote staging on 2026-10-02.

**Official sources**

- Supabase, [Password-based Auth](https://supabase.com/docs/guides/auth/passwords), [Password security](https://supabase.com/docs/guides/auth/password-security), and [Auth error codes](https://supabase.com/docs/guides/auth/debugging/error-codes).
- Supabase JavaScript, [`signUp`](https://supabase.com/docs/reference/javascript/auth-signup), [`getUser`](https://supabase.com/docs/reference/javascript/auth-getuser), [`onAuthStateChange`](https://supabase.com/docs/reference/javascript/auth-onauthstatechange), and [`signOut`](https://supabase.com/docs/reference/javascript/auth-signout).
- Supabase, [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls) and [User sessions](https://supabase.com/docs/guides/auth/sessions).

**Finding**

- Hosted Supabase projects normally require email confirmation, while local/self-hosted Auth does not by default. Local configuration must enable confirmations to reproduce the deployed flow.
- With confirmation enabled, signup can intentionally obscure whether an address already exists. Password-reset requests also do not reveal whether an account exists. The application should show the same safe success response in both cases.
- `onAuthStateChange` reports initial, sign-in, sign-out, password-recovery, token-refresh, and user-update events. Provider calls must not be awaited inside its callback; application work is deferred to avoid a documented client deadlock.
- A stored browser session can be read locally, but `getUser()` performs a server request and returns an authentic current user. CalorieCheck validates a restored session before showing protected content.
- JavaScript signout defaults to all sessions. Passing `{ scope: "local" }` ends only the current browser session, which matches the product's Log Out control.
- Confirmation and recovery `redirectTo` values must match the provider allow list. Wildcards are appropriate for local/preview use, while exact deployed callback URLs are preferred for stable remote origins.
- Supabase recommends a minimum password length of at least eight characters. Leaked-password protection is a paid-plan feature, so it is unavailable for the confirmed free staging project.
- Supabase's hosted test sender is best effort and limited. Local Mailpit captures messages without external delivery; a production SMTP sender remains required before production release.

**Implementation consequence**

Require confirmations and an eight-character minimum locally and on staging. Build confirmation/recovery URLs only from the current application origin, sanitize all provider errors, defer auth events, validate restored identities, use current-session logout, and keep the calculator hidden until authentication resolves. Real staging confirmation and reset emails, callbacks, session restoration, logout, and changed-password login passed human verification. A later repeated reset request reached the expected hosted test-sender rate limit after the required flow had succeeded.

## R-020 — V2-P3 migration and row-authorization recheck

**Status:** Verified and implemented locally on 2026-10-03 and on staging on 2026-10-05.

**Official sources**

- Supabase, [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Managing user data](https://supabase.com/docs/guides/auth/managing-user-data), and [Testing overview](https://supabase.com/docs/guides/local-development/testing/overview).
- Supabase, [Database migrations](https://supabase.com/docs/guides/deployment/database-migrations) and [CLI local workflow](https://supabase.com/docs/guides/local-development/cli-workflows).
- PostgreSQL, [Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html), [`pg_timezone_names`](https://www.postgresql.org/docs/current/view-pg-timezone-names.html), and [Range Types](https://www.postgresql.org/docs/current/rangetypes.html).

**Finding**

- Table grants and RLS policies are separate authorization checks. Exposed private tables should revoke broad client grants, grant only required operations, enable RLS, and use a separate policy for each operation. Updates require a matching select policy and should use both `USING` and `WITH CHECK` when ownership must remain stable.
- `auth.uid()` identifies the authenticated owner and returns null without an authenticated identity. Owner policies therefore use an explicit non-null check and equality with `user_id`.
- Application tables should reference the managed `auth.users` primary key and use `ON DELETE CASCADE` where account deletion must remove owned data.
- Versioned migrations should be recreated locally with `supabase db reset`; remote changes should be reviewed with `supabase db push --dry-run` and applied through migration history rather than dashboard-only edits.
- PostgreSQL stores `timestamptz` values as unambiguous instants and exposes recognized IANA names through `pg_timezone_names`. Range exclusion constraints are appropriate for rejecting overlapping effective target periods.

**Implementation consequence**

Create migration-owned `profiles`, `calorie_targets`, and `food_logs` tables. Validate canonical values, recognized timezone names, stable log dates, positive serving amounts, nonnegative available nutrients, JSON snapshot shapes, and effective target ranges. Preserve missing nutrients as null. Use a partial unique current-target index plus a GiST exclusion constraint for non-overlapping target history. Give authenticated users table-level select plus only the insert/update columns each workflow needs; limit target updates to `effective_to`, allow food-log deletion, and give `anon` no table access. Test schema, grants, constraints, two-user isolation, anonymous denial, ownership reassignment, and auth-user cascades with pgTAP.

## R-021 — V2-P4 energy-target scientific gate recheck

**Status:** Maintenance verified and implemented; maintain-only Version 2 scope approved on 2026-10-05.

**Primary and official sources**

- National Academies of Sciences, Engineering, and Medicine, [Dietary Reference Intakes for Energy (2023), Summary tables S-2 and S-3](https://www.nationalacademies.org/read/26818/chapter/2), DOI `10.17226/26818`.
- National Academies, [Chapter 5: Development of Prediction Equations](https://www.nationalacademies.org/read/26818/chapter/7) and [Chapter 7: Applications](https://www.nationalacademies.org/read/26818/chapter/9).
- NIDDK, [Research Behind the Body Weight Planner](https://www.niddk.nih.gov/research-funding/at-niddk/labs-branches/laboratory-biological-modeling/integrative-physiology-section/research/body-weight-planner) and the linked peer-reviewed [Hall model appendix](https://www.niddk.nih.gov/-/media/Files/BWP/Hall_Lancet_Web_Appendix.pdf).
- Hall et al., [*Quantification of the effect of energy imbalance on bodyweight*](https://pubmed.ncbi.nlm.nih.gov/21872751/), *The Lancet* 378 (2011), DOI `10.1016/S0140-6736(11)60812-X`.
- NIDDK/NIH Technology Transfer, [Body Weight Simulator, E-160-2012-0](https://www.techtransfer.nih.gov/tech/tab-2436).
- NIDDK, [Body Weight Planner](https://www.niddk.nih.gov/bwp).

All sources were accessed on 2026-10-05. The NIDDK research and simulator pages were last reviewed by the provider in February 2025.

**Maintenance findings**

- Tables S-2 and S-3 publish eight equations for age 14–18.99 and eight for age 19+, covering male/female source categories and inactive, low active, active, and very active PAL categories.
- Version 2 eligibility begins at age 18. Values from age 18 through values below 19 use S-2 plus the 20 kcal/day growth allowance. Values at age 19 and above use S-3.
- The report uses age in years, height in centimeters, and weight in kilograms. The engine rejects unitless strings and non-finite or non-positive canonical values.
- The official application chapter's 22-year-old low-active woman example independently confirms 2,275.37 kcal/day before display rounding and 2,275 kcal/day when rounded for presentation.
- Published RMSE values are retained as structured uncertainty metadata: 259 kcal/day for adolescent males, 237 for adolescent females, 339 for adult males, and 246 for adult females.
- PAL selection is approximate. The report states that actual requirements vary materially among people with the same equation inputs and recommends monitoring weight over time rather than treating EER as an exact prescription.

**Weight-change feasibility findings**

- The Hall model is a coupled dynamic simulation rather than a fixed calorie adjustment. It models glycogen and associated water, extracellular fluid and sodium, fat and lean tissue, thermic effect of food, adaptive thermogenesis, and activity-related expenditure.
- The public planner requires current weight, sex, age, height, physical activity, goal weight, and goal time. Its advanced controls add uncertainty, carbohydrate share, sodium, body-fat percentage, resting metabolic rate, and activity changes.
- The official planner enforces additional product rules, including a 1,000 kcal/day floor and BMI warnings. Those rules are not part of the National Academies maintenance equations and cannot be imported without separate product justification.
- NIH describes the simulator as an invention with a licensing contact. The peer-reviewed equations are published, but the official tool does not provide a reusable software license that would support copying its implementation or assets.
- Published validation and official product language focus on adult weight loss and maintenance. The sources reviewed do not provide adequate independent consumer target vectors for intentional weight gain.

**Implementation consequence**

Implement deterministic National Academies maintenance EER with structured success, invalid, ineligible, and unavailable outcomes. Preserve full calculation precision and round only in a separate presentation helper. Keep the nonpersistent life-stage confirmation out of the returned input snapshot. Return maintenance with `targetKcal = null` and `GOAL_METHOD_UNAVAILABLE` for `LOSE` and `GAIN`; do not implement a fixed deficit, fixed surplus, or partial Hall approximation. The user approved this maintain-only Version 2 scope on 2026-10-05.

## R-022 — V2-P5 onboarding persistence and timezone recheck

**Status:** Implemented and verified locally and on staging on 2026-10-06.

**Official sources**

- Supabase, [Database Functions](https://supabase.com/docs/guides/database/functions) and [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
- PostgreSQL, [`pg_timezone_names`](https://www.postgresql.org/docs/current/view-pg-timezone-names.html).
- MDN, [`Intl.DateTimeFormat.prototype.resolvedOptions()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions).
- National Academies, [Dietary Reference Intakes for Energy, Chapter 5](https://www.nationalacademies.org/read/26818/chapter/7).
- W3C Web Accessibility Initiative, [Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/) and [Validating Input](https://www.w3.org/WAI/tutorials/forms/validation/).

All sources were accessed on 2026-10-06.

**Finding**

- A PostgreSQL function can perform the profile upsert and first target creation inside one database transaction. A `security definer` function must constrain its search path, derive ownership from the authenticated identity, and expose execution only to the intended role.
- RLS remains necessary for reads and other table operations. The onboarding write path can further reduce browser privileges by revoking direct mutations and exposing only the validated RPC.
- Browsers can suggest an IANA timezone, while PostgreSQL's `pg_timezone_names` provides authoritative server-side validation before persistence.
- The National Academies activity categories are source terminology. The interface should explain them without implying precision beyond the selected PAL category.
- Accessible forms need explicit labels and groups, useful validation text, programmatic error association, and focus movement to the first invalid field.

**Implementation consequence**

Use one authenticated, idempotent `complete_profile_onboarding` RPC with an empty function search path. It validates canonical profile and target payloads, obtains the user from `auth.uid()`, writes the profile and first effective target atomically, and returns both rows. Keep eligibility confirmation out of persistence, validate the browser-suggested timezone again in PostgreSQL, and retain operation-specific RLS for private reads. The deployed staging migration, linked schema checks, and signed-in staging onboarding flow passed.

## R-023 — V2-P6 food-log persistence and retry recheck

**Status:** Implemented and verified locally; staging migration and flow verification remain pending.

**Official sources**

- Supabase JavaScript, [`insert()`](https://supabase.com/docs/reference/javascript/insert) and [`select()` after mutations](https://supabase.com/docs/reference/javascript/using-modifiers-select).
- Supabase, [Database Functions](https://supabase.com/docs/guides/database/functions) and [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
- MDN, [`Intl.DateTimeFormat.prototype.formatToParts()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts).
- PostgreSQL, [`pg_timezone_names`](https://www.postgresql.org/docs/current/view-pg-timezone-names.html).

All sources were accessed on 2026-10-07.

**Finding**

- Supabase mutations do not return modified rows by default; callers normally chain `.select()` when they need returned rows. A database function can instead validate, mutate, and return one structured result within the database boundary.
- Supabase recommends an empty search path and fully qualified objects for `security definer` functions. Function execution must be revoked from broad roles and granted deliberately.
- `auth.uid()` returns the authenticated caller ID and returns null for an unauthenticated request. The food-log creation API therefore does not need or accept a user ID.
- Client-side pending state prevents concurrent clicks, but a stable request ID is still required when a response is lost after the transaction commits. Repeating the same ID and payload can safely return the existing row.
- `Intl.DateTimeFormat` can derive calendar parts in a named timezone without changing the stored instant. PostgreSQL remains authoritative by validating the IANA timezone and the resulting local date.

**Implementation consequence**

Map a successful frozen V1 result to versioned scalar and JSON snapshots, generate one UUID when the save action begins, and retain that complete command for network retries. Persist through `create_food_log`, which derives ownership, rejects conflicting reuse, and returns an idempotent success for an identical retry. Keep unavailable nutrients as null, publish only a minimal saved-log event, and do not introduce automatic logging or an offline queue.

## Research Gates by Phase

| Phase | Required recheck |
|---|---|
| V2-P1 | Current Vite/Node requirements, Vercel terms/limits, Supabase CLI setup, publishable-key terminology |
| V2-P2 | Supabase Auth SDK flow, email confirmation, redirect allow list, password policy, SMTP requirements |
| V2-P3 | Current grants/RLS recommendations, migration commands, pgTAP helpers |
| V2-P4 | All EER coefficients and test vectors; Hall model equations, licensing, domains, goal inputs, loss/gain acceptance |
| V2-P5 | Atomic Supabase/PostgreSQL RPC pattern, authenticated ownership, IANA timezone validation, PAL wording, accessible sensitive-field UX |
| V2-P6 | Mutation return behavior, idempotent retry boundary, owner-derived RPC, timezone-to-local-date derivation, sanitized snapshot shape |
| V2-P9 | Current reauthentication and admin deletion guidance |
| V2-P12 | Current provider plan limits, production SMTP, domain/DNS/HTTPS, exact redirects, backup/operational settings |
