# CalorieCheck V2 Public-Exposure Security Hardening Plan

**Status:** COMPLETED AND VERIFIED 2026-10-21
**Created:** 2026-10-18
**Approved:** 2026-10-19
**Execution model:** One security branch, one pull request, sequential hardening through verified staging
**Implementation authorization:** User approved V2-S0, the dedicated security branch, and execution through documented human-action blockers

## 1. Purpose

CalorieCheck is publicly reachable and includes authentication, private profile data, target history, food logs, and a privileged account-deletion path. The project already has meaningful controls, including least-privilege database grants, Row Level Security, owner-derived RPCs, JWT verification, server-only account deletion, secret separation, and automated cross-user tests.

The immediate priority is to reduce public-exposure risk before the design revision. The highest practical abuse risk is excessive automated traffic against Supabase Auth, the Supabase Data API, and the account-deletion Edge Function. Vercel protections remain useful, but they cover requests reaching Vercel and cannot protect browser requests sent directly to Supabase.

This plan creates a bounded security program before V2-D0. The complete V2-P10 security regression remains after the design program because later HTML, CSS, forms, scripts, redirects, and dependencies can introduce new security behavior.

No plan can guarantee that a public application will never be attacked or fail. Completion means that identified controls are implemented, verified, monitored, and accurately documented, with any plan or provider limitations explicitly accepted.

## 2. Scope and sequencing decision

Create an inserted phase:

**V2-S0 — Public Exposure Security Hardening**

Sequence after approval:

1. V2-S0 — immediate public-exposure hardening;
2. V2-D0 through V2-D6 — approved interface revision;
3. V2-P10 — full post-design security, privacy, integrity, and RLS regression.

V2-S0 does not replace V2-P10. It brings urgent controls forward and establishes secure defaults that the design work must preserve.

### Free-tier constraint

All implementation must remain within free accounts unless the user separately approves a paid service later. The preferred provider set is:

- existing Supabase Free project;
- existing Vercel Hobby project;
- GitHub Free features available to the repository;
- Cloudflare Turnstile Free for CAPTCHA and bot resistance.

Do not introduce a paid WAF feature, managed OWASP ruleset, paid rate-limiting service, paid monitoring platform, paid backup product, Supabase Pro-only control, or another paid third party. Prefer repository controls, provider-native free limits, Turnstile, PostgreSQL-backed throttling, and free GitHub security features. Do not add Upstash or another external rate-limit dependency when the existing database can safely enforce the narrow privileged-action limit.

If an essential requirement has no safe free implementation, stop with a clearly documented blocker. Explain the unavailable control, the free compensating controls already applied, the residual risk, and the optional paid path. Do not start a trial, enter billing information, or upgrade an account automatically.

## 3. Git and pull-request strategy

Use a dedicated branch:

```text
security/v2-public-exposure-hardening
```

The current `feature/v2-design-revision` branch has no implementation commits and currently points to the same commit as `main`. Do not mix security work into it.

After this plan is approved, create the security branch from an updated `main`:

```powershell
git switch main
git pull --ff-only origin main
git switch -c security/v2-public-exposure-hardening
```

Commit the approved plan and implementation in reviewable steps on that branch. Push only the security branch and open one pull request:

```text
security/v2-public-exposure-hardening → main
```

Suggested implementation commits:

1. `Plan V2 public exposure security hardening`
2. `Add browser and deployment security controls`
3. `Harden Supabase functions and abuse limits`
4. `Expand security tests and supply chain checks`
5. `Record staging security verification`

After the security pull request is merged, update the unused design branch from `main` before design work begins:

```powershell
git switch main
git pull --ff-only origin main
git switch feature/v2-design-revision
git merge --ff-only main
```

Configure a GitHub ruleset for `main` so future changes require a pull request, required checks, resolved review conversations, and protection from force-push or deletion. Direct pushes to `main` should be disallowed.

## 4. Current security baseline

Preserve and reverify these existing controls:

- the browser receives only the public Supabase URL and publishable key;
- `.env.local` and privileged credentials are excluded from Git;
- private tables use least-privilege grants and owner-only RLS;
- database mutations derive the owner from `auth.uid()` rather than browser-supplied ownership;
- security-definer functions use an empty search path and schema-qualified objects;
- anonymous and cross-user database access have pgTAP deny tests;
- account deletion is handled by a server-side Edge Function;
- `delete-account` has platform JWT verification enabled and validates the user again in the function;
- account deletion requires the current password and cascades owned rows;
- email confirmation is enabled and anonymous sign-in is disabled;
- authentication errors are sanitized;
- local and staging flows have passed integration tests.

Known gaps to address:

- no repository-controlled Vercel security headers;
- no application CAPTCHA integration;
- hosted Auth rate-limit settings have not received a dedicated abuse review;
- `delete-account` currently sends `Access-Control-Allow-Origin: *`;
- no explicit application-level throttle for repeated account-deletion attempts;
- no committed GitHub dependency-update configuration or security CI workflow;
- provider Security Advisor, firewall, administrator MFA, repository protection, and alert settings require dashboard verification;
- the project uses free hosting tiers with availability, backup, logging, and advanced-WAF limitations.

## 5. Threat priorities

Work in this order:

1. **Request flooding and automated authentication abuse**
   - signup, login, password-reset, resend, verification, and token endpoints;
   - repeated authenticated calls to `delete-account`;
   - traffic that exhausts free-tier quotas or email limits.

2. **Unauthorized access to private data**
   - missing or bypassable RLS;
   - excessive grants;
   - ownership spoofing;
   - unsafe security-definer functions;
   - direct REST/RPC bypass attempts.

3. **Credential and secret exposure**
   - privileged values in Git, build output, logs, browser variables, deployment settings, or errors;
   - weak administrator-account security.

4. **Browser and content-injection risk**
   - XSS-sensitive rendering;
   - framing/clickjacking;
   - unsafe content types, referrers, permissions, or external connections;
   - overly broad CORS.

5. **Supply-chain and deployment risk**
   - vulnerable dependencies;
   - unreviewed direct pushes;
   - exposed previews;
   - environment drift between repository, staging, and provider dashboards.

6. **Availability and recovery risk**
   - free-tier exhaustion or project pausing;
   - missing usable backups;
   - absent monitoring and incident steps;
   - changes without rollback evidence.

## 6. Phase S0.1 — Inventory, threat model, and evidence baseline

Codex will:

1. Recheck current authoritative Supabase, Vercel, GitHub, Vite, Node, and browser security guidance.
2. Map every trust boundary:
   - browser and Vercel static delivery;
   - Supabase Auth;
   - PostgREST/Data API;
   - PostgreSQL RPCs and RLS;
   - `delete-account` Edge Function;
   - GitHub and deployment automation.
3. Record public endpoints, methods, authentication requirements, data accepted, and expected rate-control layer without recording secrets.
4. Inspect the repository and production bundle for secrets, unsafe DOM sinks, unexpected external resources, open redirects, wildcard CORS, and missing headers.
5. Run `npm audit`, review direct and transitive dependency advisories, and distinguish applicable runtime findings from development-only findings.
6. Capture a read-only baseline from:
   - Supabase Security Advisor and Performance Advisor;
   - Supabase Auth configuration and rate limits;
   - Vercel Firewall traffic and deployment settings;
   - GitHub Security and branch-rule settings.
7. Add a concise threat model and a remediation table containing severity, exploit path, affected component, planned control, test, and disposition.

No finding will be dismissed solely because the project is small or uses a managed provider.

## 7. Phase S0.2 — Browser and Vercel-delivery hardening

Codex will add a version-controlled Vercel configuration and verify it against the deployed site.

Required response headers:

- `Content-Security-Policy` with the smallest working source list;
- `Strict-Transport-Security` for HTTPS use;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin` or stricter if verified;
- `Permissions-Policy` denying unused camera, microphone, geolocation, payment, USB, and similar capabilities;
- `frame-ancestors 'none'` in CSP, with `X-Frame-Options: DENY` as compatibility defense;
- an appropriate `Cross-Origin-Opener-Policy` after auth and recovery flows are verified.

CSP work must:

- permit only the application origin, the exact Supabase connection origin required by the environment, and the selected CAPTCHA provider if approved;
- keep scripts module-based and avoid `unsafe-eval`;
- avoid `unsafe-inline` unless a documented browser requirement cannot be removed;
- allow required Supabase HTTPS and WebSocket connections only;
- be tested across signup, confirmation, recovery, login, calculators, logging, dashboards, settings, and deletion;
- begin with a report-only verification where practical, then enforce after violations are resolved.

Additional delivery controls:

- reject or deny unsupported HTTP methods at the Vercel layer where safely expressible;
- ensure source maps and sensitive build artifacts are not published unintentionally;
- apply safe cache behavior to `index.html` and immutable caching only to hashed assets;
- verify that auth callback URLs and error parameters are not cached or logged as secrets;
- protect preview deployments with Vercel Authentication where the current plan allows it;
- retain Vercel's automatic DDoS mitigation.

Vercel WAF rollout:

1. Inspect traffic before defining rules.
2. Create rules in **log** mode first.
3. Verify legitimate mobile, desktop, auth-callback, and accessibility traffic.
4. Change only proven malicious or impossible application traffic to **deny** or **challenge**.
5. Keep Attack Challenge Mode as an incident control rather than a permanent default unless ongoing abuse justifies the user friction.
6. Document Hobby-plan limits: automatic DDoS protection, optional Attack Challenge Mode, up to three custom WAF rules, and limited IP blocking. Do not claim unavailable managed rules or advanced rate limiting.

Vercel WAF must not be described as protection for direct Supabase requests.

## 8. Phase S0.3 — Authentication abuse and bot protection

This is the primary request-flooding control.

Codex will:

1. Audit each auth call and ensure duplicate submission locks remain effective.
2. Add Cloudflare Turnstile Free support to:
   - signup;
   - login;
   - forgot-password requests;
   - current-password reauthentication for irreversible account deletion;
   - resend-confirmation behavior if present.
3. Pass CAPTCHA tokens through the supported Supabase JS `captchaToken` option.
4. Keep CAPTCHA failure messages safe and recoverable without exposing provider details.
5. Add local test adapters so automated tests do not require a real CAPTCHA secret.
6. Add staging tests for success, expired token, missing token, bot rejection, keyboard use, mobile layout, and retry.
7. Review hosted Supabase Auth limits and choose conservative starting values appropriate for a low-traffic public demo.
8. Preserve token-refresh capacity required for normal session restoration; do not lower it blindly.
9. Retain provider 429 handling and add clear retry guidance without automatically retrying requests in a loop.
10. Review and tighten:
    - minimum password length;
    - password-character policy based on current guidance and usability;
    - secure password-change/reauthentication behavior;
    - email confirmation;
    - OTP expiry and resend intervals;
    - exact Site URL and redirect allow list;
    - disabled anonymous and unused providers.

Proposed initial hosted Auth limits will be documented and reviewed against Supabase's current units before application. They will not be guessed from local `config.toml` labels.

Leaked-password protection is plan-dependent. If unavailable on Supabase Free, record that limitation and use the approved password, CAPTCHA, confirmation, and rate-limit controls rather than upgrading automatically.

## 9. Phase S0.4 — Edge Function hardening and throttling

The `delete-account` function is the only privileged custom server endpoint and receives the highest scrutiny.

Codex will:

1. Keep platform `verify_jwt = true` and handler-level `getUser()` validation.
2. Replace wildcard CORS with an explicit origin allow list for approved local and deployed origins.
3. Return CORS headers only for allowed origins and reject unapproved origins safely.
4. Keep `POST` as the only mutation method and handle `OPTIONS` narrowly.
5. Enforce a small request-body limit before JSON parsing.
6. Validate content type, exact field shape, password length, and confirmation value.
7. Add a durable per-user throttle for deletion attempts using a migration-backed, server-only counter or another approved provider-native mechanism.
8. Return `429 Too Many Requests` plus `Retry-After` when the limit is reached.
9. Ensure the throttle cannot be called or reset by `anon` or ordinary `authenticated` database roles.
10. Avoid storing passwords, raw authorization headers, full request bodies, or unnecessary IP addresses.
11. Keep current-password verification and hard deletion server-side.
12. Keep visible errors generic while retaining non-sensitive operational error codes.
13. Test invalid, expired, deleted, and cross-user sessions; wrong passwords; malformed and oversized bodies; forbidden origins and methods; throttle boundaries; successful cascade; and post-deletion login failure.
14. Confirm that privileged keys are supplied only by the managed function environment and never enter the frontend bundle or logs.

The rate-limit implementation will be deterministic and atomic. In-memory counters are not acceptable because Edge Function instances are distributed and disposable.

## 10. Phase S0.5 — Database, API, RLS, and migration hardening

Codex will:

1. Re-run and expand the complete owner/other-user/anonymous allow-and-deny matrix.
2. Enumerate grants for every exposed table, sequence, view, and function.
3. Confirm RLS is enabled on every exposed user-data table and that no unexpected permissive policy exists.
4. Confirm direct writes are revoked where an owner-derived RPC is the intended boundary.
5. Confirm all security-definer functions:
   - use an empty fixed search path;
   - use schema-qualified objects;
   - derive identity from `auth.uid()`;
   - accept no caller-controlled owner ID;
   - have execution revoked from `public` and `anon`;
   - expose only the minimum authenticated/service role grant.
6. Test direct REST/RPC bypass attempts, ownership reassignment, conflicting idempotency keys, malformed snapshots, oversized text/JSON, non-finite or precision-overflow quantities, and historical-range corruption.
7. Review table and function comments for accidental personal data or secret storage.
8. Confirm unused tables or features are not published through Realtime.
9. Confirm no public Storage bucket or policy exists unless deliberately required.
10. Review indexes and bounded pagination so simple request flooding does not trigger avoidable full-table work.
11. Run Supabase database lint, Security Advisor, clean local reset, migration tests, and linked migration dry-run.
12. Create only the smallest reviewed migration necessary for any finding.

Provider controls to review:

- Postgres SSL enforcement;
- direct-database network restrictions without breaking required tooling;
- API exposed schemas;
- database and function logs for sensitive payloads;
- project and organization MFA;
- project collaborators and unused access tokens.

## 11. Phase S0.6 — Frontend application-security review

Codex will:

1. Review every user-controlled value rendered in the DOM and keep rendering through safe properties such as `textContent`.
2. Prohibit `innerHTML`, `insertAdjacentHTML`, `eval`, dynamic function construction, and unsafe URL execution unless a reviewed necessity exists.
3. Test stored and reflected XSS payloads in display names, food/log snapshots, error parameters, and provider-returned strings.
4. Reverify fixed same-origin confirmation and recovery routes and open-redirect resistance.
5. Verify private content never flashes before session resolution.
6. Verify logout, expired-session handling, recovery, and account deletion clear private in-memory state.
7. Check forms for request replay, duplicate submission, accidental password persistence, and autocomplete behavior.
8. Ensure errors and analytics-free console output contain no tokens, passwords, email contents, private food logs, or stack traces.
9. Remove debug code and unnecessary production logging.
10. Verify no future-version controls or fake security indicators are added.

## 12. Phase S0.7 — Dependency, repository, and CI security

Codex will add or configure:

- deterministic `npm ci` verification;
- `npm audit` review with applicable high/critical findings blocking completion;
- a weekly Dependabot configuration for npm and GitHub Actions;
- GitHub Dependabot alerts and security-update pull requests;
- GitHub secret scanning and push protection;
- CodeQL/default code scanning where available;
- a pull-request CI workflow for tests and production build;
- a security check that scans tracked source and built assets for common privileged-key patterns;
- dependency and action version pinning appropriate to the repository;
- a `SECURITY.md` describing responsible private vulnerability reporting without publishing exploit details.

Human repository settings must require pull requests for `main`, block force-push/deletion, and require the security CI checks. If the account plan cannot require a setting, document the manual control and residual risk.

No dependency will be upgraded solely to obtain the newest version. Updates must resolve an applicable finding or be required for supported security behavior, and all regressions must pass.

## 13. Phase S0.8 — Availability, monitoring, and incident readiness

Codex will document and verify:

1. Vercel usage monitoring, Firewall traffic view, and available alerts.
2. Supabase logs, Auth logs, Security Advisor, Performance Advisor, and usage visibility.
3. Symptoms and response steps for:
   - elevated 401/403/429 responses;
   - abnormal signup or recovery volume;
   - Edge Function invocation spikes;
   - unexpected database traffic;
   - Vercel traffic spikes;
   - suspected credential exposure;
   - provider outage or quota exhaustion.
4. Emergency actions, including temporarily enabling Vercel Attack Challenge Mode, disabling signup when necessary, revoking/rotating exposed credentials, and rolling back the last deployment.
5. A contact and ownership checklist without placing personal credentials in the repository.
6. Free-tier limitations and the threshold that should trigger an upgrade decision.

The plan will not claim downloadable backups, point-in-time recovery, service-level guarantees, managed OWASP coverage, advanced rate limiting, or uninterrupted availability when the selected free plans do not provide them.

## 14. Phase S0.9 — Verification matrix

Required local checks:

- clean dependency install;
- complete Node test suite;
- Vite production build;
- local Supabase clean reset;
- pgTAP schema/grant/RLS/RPC suite;
- database lint;
- complete auth/browser integration;
- Edge Function origin, JWT, method, size, validation, throttle, reauthentication, and deletion tests;
- header and enforced-CSP tests;
- XSS/open-redirect/error-sanitization tests;
- tracked-source and built-bundle secret scans;
- dependency audit;
- `git diff --check` and clean status review.

Required controlled staging checks:

- exact security headers on the public origin;
- no actionable CSP violation during every implemented route/state;
- signup/login/reset CAPTCHA behavior;
- normal auth/session flows after hosted rate-limit changes;
- deliberately small, non-disruptive 429 checks against test accounts only;
- invalid/expired JWT rejection;
- forbidden-origin and unsupported-method Edge Function rejection;
- owner, other-user, and signed-out data isolation;
- normal calculator, logging, daily, weekly, settings, edit/delete, and account-deletion flows;
- Vercel Firewall logging followed by reviewed deny/challenge behavior;
- preview-deployment protection;
- no secret or personal payload in browser console, network errors, provider logs, or build assets;
- rollback procedure review.

No load test will target the public staging service at attack volume. Abuse controls will be verified with bounded requests, local testing, provider dashboards, and documented expected responses.

## 15. Human-action blockers

Codex will complete all repository work, local tests, dry runs, and reviewable configuration before stopping. Human action is required only where account ownership, secret entry, billing/plan choice, or provider-dashboard authority cannot safely be delegated.

### Blocker H1 — Free CAPTCHA provider configuration

The user must:

- create or use a free Cloudflare account and select Turnstile Free;
- create the site/widget for the approved staging domain;
- place the **public site key** in the correct Vercel public environment variable;
- place the **secret key** only in Supabase Auth CAPTCHA settings;
- never send the secret in chat or commit it to Git.

Codex will provide exact current click instructions after the implementation identifies the final provider and variable name.

### Blocker H2 — Supabase account and project settings

The user must review/apply dashboard-only controls that cannot be committed safely:

- administrator MFA and organization access;
- Auth rate limits;
- CAPTCHA enablement;
- password and secure-password-change settings;
- exact Site URL and redirect allow list;
- SSL enforcement and network restrictions where available and compatible;
- Security Advisor findings;
- unused project access tokens or collaborators.

### Blocker H3 — Vercel firewall and deployment protection

The user must review/apply dashboard controls:

- WAF rules after their log-mode evidence is reviewed;
- preview Deployment Protection;
- Firewall/usage alerts available on the current plan;
- Attack Challenge Mode only if an active incident or approved policy justifies it.

### Blocker H4 — GitHub repository protection

The user must enable or confirm:

- a `main` ruleset requiring pull requests and required checks;
- no force-push or branch deletion;
- Dependabot alerts and security updates;
- secret scanning and push protection;
- CodeQL/default code scanning where available.

### Blocker H5 — Free-tier limitation exception

The current free plans have material availability, WAF, logging, backup, recovery, and advanced password-control limitations. Free-tier operation remains the approved default.

This becomes a blocker only if an essential security requirement has no adequate free control. Codex must first implement every valid free compensating control, then document:

- the unavailable paid-only capability;
- the remaining risk;
- the operational restriction needed to stay safe on free accounts, such as retaining synthetic data and demo status;
- the optional future upgrade path.

No trial, payment, paid add-on, or account upgrade will be initiated by Codex.

### Blocker H6 — Remote application and staging verification

After Codex presents migration and deployment dry runs, the user must approve remote application. The user must then perform the human-facing CAPTCHA, provider email, firewall challenge, mobile usability, and disposable-account checks that automation cannot establish conclusively.

## 16. Completion criteria

V2-S0 may be marked **DONE** only when:

- all repository controls are implemented and reviewed in the security pull request;
- no unresolved applicable critical or high-severity finding remains;
- Supabase grants, RLS, RPCs, Edge Function auth, and deletion pass allow/deny tests;
- CAPTCHA and hosted Auth rate controls work on staging;
- the account-deletion endpoint has exact-origin CORS, bounded input, durable throttling, and safe 429 behavior;
- security headers and enforced CSP work on every implemented flow;
- Vercel Firewall rules are evidence-based and do not block legitimate use;
- GitHub pull-request, dependency, secret, and code-scanning controls are enabled or their unavailable status is documented;
- staging contains only synthetic data;
- secrets are absent from Git, build output, browser code, visible errors, and logs;
- monitoring, incident, rollback, and plan limitations are documented;
- all functional, database, integration, responsive, and security regression tests pass;
- the user completes every mandatory provider action and confirms staging verification;
- every introduced provider or service remains on a free plan unless separately approved;
- the pull request is approved and merged into `main`.

## 17. Stop conditions

Stop and mark **BLOCKED — USER ACTION REQUIRED** if:

- a secret may have been exposed and rotation requires account-owner action;
- provider MFA, CAPTCHA secret entry, firewall rules, repository rules, or billing decisions require the user;
- a migration or remote deployment awaits explicit review/approval;
- a required control is unavailable on the current plan and no safe free alternative exists;
- CAPTCHA or firewall protection blocks legitimate authentication or accessibility flows;
- a critical/high access-control, injection, auth, secret, or deletion defect remains unresolved;
- staging contains real personal data that should not be used for security testing.

## 18. Deliverables

Expected repository deliverables, subject to findings:

- `vercel.json` for headers and safe delivery behavior;
- CAPTCHA-aware auth configuration and UI/service changes;
- hardened `delete-account` Edge Function;
- a versioned migration for durable privileged-action throttling if selected after review;
- expanded database, unit, integration, header, origin, rate-limit, and security tests;
- `.github/workflows/` security/CI checks;
- `.github/dependabot.yml`;
- `SECURITY.md`;
- security threat model, provider configuration record, incident steps, residual-risk record, and test evidence;
- synchronized `V2_PLAN.md`, `V2_STATUS.md`, `V2_MASTER_SPEC.md`, `V2_DECISIONS.md`, `V2_RESEARCH.md`, `README.md`, `ROADMAP.md`, and `TESTING.md` only where facts or acceptance criteria change.

## 19. Authoritative sources

Sources reviewed on 2026-10-18:

- Supabase [Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- Supabase [Secure configuration of products](https://supabase.com/docs/guides/security/product-security)
- Supabase [Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits)
- Supabase [CAPTCHA protection](https://supabase.com/docs/guides/auth/auth-captcha)
- Supabase [Password security](https://supabase.com/docs/guides/auth/password-security)
- Supabase [Edge Function authorization headers](https://supabase.com/docs/guides/functions/auth-headers)
- Supabase [Edge Function CORS](https://supabase.com/docs/guides/functions/cors)
- Supabase [Platform security](https://supabase.com/docs/guides/security/platform-security)
- Vercel [Firewall](https://vercel.com/docs/vercel-firewall)
- Vercel [WAF custom rules](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules)
- Vercel [DDoS mitigation](https://vercel.com/docs/vercel-firewall/ddos-mitigation)
- Vercel [Hobby plan limits](https://vercel.com/docs/plans/hobby)
- Vercel [WAF usage and pricing](https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing)
- GitHub [Security and analysis settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-security-and-analysis-settings-for-your-repository)
- GitHub [Dependabot security updates](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-security-updates)
- GitHub [Push protection](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/prevent-future-leaks/enable-push-protection)

## 20. Approval command

If this plan is accepted without changes, reply:

**Approve V2-S0. Create the security branch and execute the public-exposure security hardening plan from start to finish. Stop only at documented human-action blockers.**
