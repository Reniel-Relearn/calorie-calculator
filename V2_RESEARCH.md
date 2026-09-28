# CalorieCheck Version 2 — Research Record

Research date: **2026-09-28**  
Policy: Prefer current official or primary sources. Recheck provider behavior, prices, limits, and SDK versions in the phase that installs or configures them.

## Research Status Key

- **Resolved**: sufficient to make an architecture decision.
- **Phase gate**: direction is identified, but exact implementation must be verified before code is accepted.
- **Unresolved**: no production behavior may be inferred yet.

## R-001 — Which method should estimate maintenance calories?

**Status:** Resolved, with V2-P5 coefficient verification required.

**Authoritative sources**

- National Academies of Sciences, Engineering, and Medicine, [Dietary Reference Intakes for Energy (2023), Chapter 5](https://www.nationalacademies.org/read/26818/chapter/7), especially Tables 5-15 and 5-16.
- National Academies/NCBI, [full report record](https://www.ncbi.nlm.nih.gov/books/NBK588659/?report=classic), DOI `10.17226/26818`.
- National Academies, [Chapter 7 activity examples and application guidance](https://www.nationalacademies.org/read/26818/chapter/9).

**Finding**

The 2023 report supplies sex-specific Estimated Energy Requirement equations using age in years, height in centimeters, weight in kilograms, and physical activity category. Table 5-16 covers adults age 19+ and states that EER equals predicted total energy expenditure for weight-stable adults. The report has a separate 14-to-18.99 branch, so an 18-year-old must not be run through the 19+ coefficients.

Adult 19+ equations to verify in V2-P5:

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

**Uncertainty / next verification**

V2-P5 must transcribe and independently verify the 18-to-18.99 coefficients, energy-cost-of-growth term, exact age calculation, boundaries, and reference values before implementation.

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

**Status:** Loss is a phase gate; gain is unresolved.

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
- In V2-P5, verify the published model, permissible implementation basis, inputs, bounds, convergence behavior, and independent reference vectors.
- A loss target may be accepted only after those checks pass and likely requires current weight, goal weight, goal date/timeframe, age, sex, height, and activity assumptions.
- A gain target needs a separate evidence and validation decision. If it remains unsupported, show it as unavailable and stop for an explicit scope decision rather than approximating.
- Keep the National Academies maintenance estimate visible even when a separate goal model supplies a goal-specific target; label each methodology.

**Unresolved uncertainty**

- Whether the full published Hall implementation is appropriate and supportable in a small vanilla JavaScript consumer app.
- Exact safe input domains and minimum-calorie or rate guardrails without turning software checks into medical advice.
- Whether the model is adequately validated for intentional weight gain.
- Whether any license restrictions apply to code or assets beyond implementing the published equations independently.

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

## Research Gates by Phase

| Phase | Required recheck |
|---|---|
| V2-P1 | Current Vite/Node requirements, Vercel terms/limits, Supabase CLI setup, publishable-key terminology |
| V2-P2 | Supabase Auth SDK flow, email confirmation, redirect allow list, password policy, SMTP requirements |
| V2-P3 | Current grants/RLS recommendations, migration commands, pgTAP helpers |
| V2-P5 | All EER coefficients and test vectors; Hall model equations, licensing, domains, goal inputs, loss/gain acceptance |
| V2-P9 | Current reauthentication and admin deletion guidance |
| V2-P12 | Current provider plan limits, production SMTP, domain/DNS/HTTPS, exact redirects, backup/operational settings |
