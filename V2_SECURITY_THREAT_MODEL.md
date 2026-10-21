# CalorieCheck V2 Security Threat Model

**Status:** Repository controls implemented; provider and staging verification pending

**Reviewed:** 2026-10-19

**Scope:** V2-S0 public staging exposure

## Assets and trust boundaries

Protected assets are authentication credentials, managed sessions, private profiles, energy-target history, food-log history, the privileged account-deletion credential, provider administration accounts, deployment settings, and free-tier capacity.

The browser is untrusted. Vercel serves static files and response headers. Browser requests then cross separate boundaries into Cloudflare Turnstile, Supabase Auth, the Supabase Data API, PostgreSQL functions and RLS, and the `delete-account` Edge Function. GitHub and provider dashboards are separate administrative boundaries. Vercel Firewall does not cover direct browser-to-Supabase traffic.

## Public endpoint inventory

| Component | Public request | Authentication and accepted data | Primary control layer |
|---|---|---|---|
| Vercel static app | `GET`/`HEAD` for HTML and assets | None | Vercel DDoS mitigation, response headers, CSP, safe caching |
| Turnstile | Cloudflare challenge script and frame | Public site key; short-lived challenge token | Exact widget hostname, Supabase server-side token validation |
| Supabase Auth | Signup, password login, recovery, verification, refresh | Email, password, CAPTCHA token, managed refresh token | CAPTCHA, hosted Auth rate limits, email confirmation, sanitized errors |
| Profiles | Authenticated Data API `SELECT` | Current session | Table grants plus owner RLS |
| Targets | Authenticated Data API `SELECT` | Current session | Table grants plus owner RLS and non-overlap constraints |
| Food logs | Authenticated `SELECT`/`DELETE` and reviewed mutation RPCs | Bounded snapshots, quantities, dates, generated request ID | Owner RLS, constraints, owner-derived RPCs, bounded pagination |
| Onboarding/settings RPCs | Authenticated `POST` through Data API | Canonical profile and target data | Fixed search path, `auth.uid()`, least-privilege execute grants |
| Account deletion | Edge Function `POST`/`OPTIONS` | Bearer token, exact confirmation, current password, CAPTCHA token | Gateway JWT check, handler identity validation, exact-origin CORS, 4 KiB body limit, durable per-user throttle, CAPTCHA-backed reauthentication, server-only admin deletion |

No custom endpoint accepts a caller-supplied owner ID for an owner-derived mutation. The deletion endpoint stores no password, token, email, request body, or IP address in its throttle table.

## Findings and disposition

| Severity | Exploit path | Component | Control and verification | Disposition |
|---|---|---|---|---|
| High | Automated signup/login/recovery traffic exhausts Auth or email quotas | Supabase Auth | Turnstile on signup, login, and recovery; single-use tokens; pending locks; hosted limits; safe 429 guidance | Repository complete; provider setup blocked on H1/H2 |
| High | Repeated password guesses against account deletion | Edge Function | JWT and `getUser`, Turnstile token, five attempts per 15-minute window, atomic database counter, `429` and `Retry-After` | Repository complete; migration/deployment pending H6 |
| High | Privileged key enters client or Git | Build and repository | Only publishable values use `VITE_*`; tracked/build secret scan; ignored local env; managed Edge Function secret | Automated scan passes locally; dashboard review pending |
| High | Cross-user private data access | Data API and PostgreSQL | Least-privilege grants, owner RLS, owner-derived functions, allow/deny pgTAP matrix | Existing controls retained; new throttle grants tested; full local rerun awaits Docker |
| Medium | Malicious site invokes account deletion from a browser | Edge Function | Exact origin allow list, narrow preflight, no wildcard CORS, password reauthentication | Unit tested |
| Medium | Oversized or malformed deletion request consumes resources | Edge Function | JSON content type, exact field set, 4 KiB streamed limit, bounded strings | Unit tested |
| Medium | Stored/reflected content executes as code | Browser UI | `textContent` rendering, no executable HTML sinks or dynamic code, enforced CSP | Static regression tests pass; staging CSP check pending |
| Medium | Site is framed or browser capabilities are abused | Vercel response | `frame-ancestors 'none'`, `X-Frame-Options: DENY`, Permissions Policy, nosniff, referrer policy | Configuration tests pass; deployed header check pending |
| Medium | Dependency or workflow compromise | npm and GitHub Actions | Locked npm install, high-severity audit gate, Dependabot, Security CI, CodeQL, restricted workflow permissions | Repository complete; GitHub settings pending H4 |
| Medium | One dashboard view retrieves excessive rows | Data API | Date/owner filters, 1,000-row pages, five-page maximum | Unit tested |
| Medium | Public traffic exhausts free-tier capacity | Vercel/Supabase | Provider DDoS controls, CAPTCHA, hosted limits, narrow WAF after observation, monitoring and incident runbook | Human dashboard setup pending H2/H3 |
| Low | Source maps reveal readable application source | Vite build | Production source maps explicitly disabled | Build verification pending final clean install |

## Residual risks

- A public application can still receive malicious traffic; free plans do not provide service-level availability guarantees.
- Vercel controls do not protect direct Supabase endpoints.
- Supabase Free does not provide every advanced password, backup, recovery, log-retention, or network-control feature.
- CAPTCHA creates user and accessibility friction and must pass real mobile and keyboard testing.
- A stolen valid session plus the current password can authorize account deletion. The endpoint therefore validates both, throttles attempts, and returns generic errors.
- Provider configuration can drift outside Git. `V2_SECURITY_OPERATIONS.md` is the required review record.

## Authoritative references

- [Supabase production checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Supabase Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits)
- [Supabase CAPTCHA protection](https://supabase.com/docs/guides/auth/auth-captcha)
- [Supabase Edge Function CORS](https://supabase.com/docs/guides/functions/cors)
- [Cloudflare Turnstile widget management](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/)
- [Cloudflare Turnstile hostname management](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/)
- [Vercel Firewall](https://vercel.com/docs/vercel-firewall)
- [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection)
- [GitHub ruleset rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [Vite environment variables](https://vite.dev/guide/env-and-mode)
