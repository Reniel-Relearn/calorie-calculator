# CalorieCheck V2 Security Operations

**Status:** Implemented and verified 2026-10-21; ongoing monitoring and incident guide

**Reviewed:** 2026-10-19

**Cost constraint:** Supabase Free, Vercel Hobby, GitHub Free features, and Cloudflare Turnstile Free only

## Configuration contract

### Browser and Vercel

- `VITE_SUPABASE_URL` is the public Supabase project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY` is the public browser key.
- `VITE_TURNSTILE_SITE_KEY` is the public Cloudflare Turnstile site key.
- No secret, service-role key, database password, SMTP credential, Turnstile secret, Vercel token, or provider management token may use a `VITE_*` name.

Authentication fails closed on staging and production when the Turnstile site key is absent. Local development without a key uses a local-only adapter because local Supabase CAPTCHA is disabled.

### Edge Function

`delete-account` permits these exact origins by default:

- `https://calorie-calculator-gamma-ten.vercel.app`
- `http://127.0.0.1:5173`
- `http://localhost:5173`

An `ALLOWED_ORIGINS` Edge Function secret may replace this comma-separated list when another stable origin is approved. Never use `*`. The managed Supabase URL and server credentials stay in the Edge Function environment.

## Human blocker H1: Cloudflare Turnstile Free

1. Sign in to a free Cloudflare account.
2. Open **Turnstile** and select **Add widget**.
3. Name it `CalorieCheck staging`.
4. Add the exact hostname `calorie-calculator-gamma-ten.vercel.app`. Do not add `vercel.app` broadly.
5. Choose **Managed** mode and create the widget. Pre-clearance is not required.
6. Copy the **sitekey** into Vercel project **Settings > Environment Variables** as `VITE_TURNSTILE_SITE_KEY` for the environment used by staging. The sitekey is public.
7. In Supabase, open the linked staging project, then **Authentication > Settings > Bot and Abuse Protection**. Enable CAPTCHA, select **Cloudflare Turnstile**, and paste the **secret key** there.
8. Never paste the Turnstile secret into chat, Git, `.env.local`, Vercel, or any `VITE_*` variable.

Success means signup, login, password-reset, and account-deletion forms show a usable challenge, an incomplete challenge is rejected safely, and a completed challenge permits the normal Auth request.

## Human blocker H2: Supabase Free settings review

In the linked staging project:

1. Enable MFA on the Supabase administrator account and remove unknown organization members or access tokens.
2. Confirm email signup and email confirmation are enabled; anonymous signup, phone signup, social providers, and unused providers remain disabled.
3. Confirm minimum password length is at least 8. Enable secure password change if the dashboard makes it available without breaking the tested recovery flow. Leaked-password protection is not required when unavailable on Free.
4. Confirm Site URL is `https://calorie-calculator-gamma-ten.vercel.app/`.
5. Keep only the exact deployed confirmation/recovery origin and required local development origins in Redirect URLs. Do not add an under-maintenance page or broad unrelated domain.
6. Open **Authentication > Rate Limits**. Record the current units before editing. Use this conservative starting policy when the labels match the current Supabase documentation:
   - signup, recovery, and resend request bucket: retain 30 per 5 minutes per IP;
   - verification requests: 20 per 5 minutes per IP;
   - token refresh/token endpoint: retain 150 per 5 minutes per IP;
   - anonymous sign-ins: disabled;
   - built-in email provider: accept its provider-enforced two emails per hour project limit until a future SMTP decision.
7. Do not repeatedly test email sending. Use one disposable account and bounded requests.
8. Review **Security Advisor**, **Performance Advisor**, Auth logs, API logs, and Function logs. Save non-secret finding titles and resolutions only.
9. Confirm no public Storage bucket exists and no application table is added to Realtime.
10. Confirm SSL enforcement and direct database network restrictions available on the current plan. Do not enable a restriction that blocks the CLI before a tested management path exists.

Success means normal authentication still works, deliberate bounded abuse returns safe 429 responses, and no dashboard warning identifies an unresolved high-impact access-control issue.

## Human blocker H3: Vercel Hobby controls

1. Open the CalorieCheck Vercel project.
2. Under **Settings > Deployment Protection**, enable **Vercel Authentication with Standard Protection** for preview/deployment URLs. The stable production domain remains public on Hobby.
3. Open **Firewall** and review recent traffic before adding a rule.
4. Create no more than the Hobby allowance. Start a candidate rule in **Log** mode and observe legitimate mobile, desktop, callback, and accessibility traffic.
5. Change a rule to Challenge or Deny only when the match represents proven malicious or impossible application traffic.
6. Keep Attack Challenge Mode off during normal operation. Enable it temporarily during an active traffic incident.
7. Review Usage and available alerts. Do not claim advanced managed WAF or rate limiting that Hobby does not provide.

Success means previews require Vercel authentication, the public domain remains usable, and no rule blocks normal or assistive access.

## Human blocker H4: GitHub Free repository controls

The local GitHub CLI credential is currently invalid. Reauthenticate with `gh auth login -h github.com` before asking Codex to push the branch or open the pull request. Never paste a GitHub token into chat or a project file.

After the branch is pushed and Security CI has produced check names:

1. Open **Settings > Rules > Rulesets** and create an active branch ruleset targeting `main`.
2. Require a pull request before merging, require resolved conversations, block force pushes, and block branch deletion.
3. Require the `Security CI / verify` and CodeQL checks after they have run at least once.
4. Under **Settings > Code security and analysis**, enable Dependabot alerts, Dependabot security updates, secret scanning, push protection, and private vulnerability reporting where the repository/account offers them for free.
5. Confirm CodeQL uploads results. If GitHub offers default setup instead, use only one CodeQL setup to avoid duplicate analysis.

Success means direct changes to `main` are rejected and a pull request cannot merge while a required security check fails.

## Human blocker H6: Reviewed remote application

After reviewing the SQL migration and function changes, approve these remote operations separately:

1. Apply `20261019090000_harden_account_deletion.sql` to linked staging.
2. Deploy the `delete-account` Edge Function with JWT verification enabled.
3. Deploy the Vercel branch with `VITE_TURNSTILE_SITE_KEY` configured.
4. Run the bounded staging matrix in the V2-S0 plan with synthetic accounts only.

Do not send keys or passwords in chat. Report only pass/fail outcomes and sanitized provider error codes.

## Monitoring routine

Check weekly during public testing and immediately after an alert:

- Vercel Usage and Firewall traffic;
- Supabase Auth, API, Postgres, and Edge Function logs;
- Supabase Security and Performance Advisors;
- GitHub Dependabot, secret-scanning, and CodeQL alerts;
- Cloudflare Turnstile analytics for unusual solve/failure patterns.

Investigate elevated 401/403/429 responses, recovery-email spikes, deletion-function spikes, unexpected database traffic, quota warnings, and sudden Vercel traffic changes. Never copy raw tokens, passwords, email bodies, or personal food logs into issues.

## Incident actions

1. Preserve only non-secret timestamps, request categories, status counts, deployment identifiers, and provider event IDs.
2. If traffic is active, enable Vercel Attack Challenge Mode temporarily and disable new Supabase signups if account creation is the abused path.
3. If a credential may be exposed, rotate it in the owning provider, remove it from every environment, invalidate affected sessions where supported, and redeploy. Git history cleanup alone does not rotate a secret.
4. If a deployment introduced the problem, use Vercel to promote the last verified deployment or revert the change through Git and redeploy.
5. If Supabase is unavailable or a free quota is exhausted, show the existing recoverable error state and pause public testing. Do not loop retries.
6. Record the cause, containment, recovery, and any control change without storing personal data.

## Free-tier limitations and upgrade trigger

The current setup has no promised uptime, point-in-time recovery, managed OWASP coverage, advanced WAF rate limiting, extended log retention, or guaranteed email delivery. Keep staging data synthetic.

Reconsider a paid plan only after separate approval if public traffic becomes sustained, real personal data is planned, reliable recovery/backups become mandatory, free quotas repeatedly interrupt testing, or a required security control has no adequate free alternative. No trial or billing change is authorized by V2-S0.
