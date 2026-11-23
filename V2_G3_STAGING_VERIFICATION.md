# V2-G3 Staging Verification

**Checked:** 2026-11-23 (Asia/Manila)
**Status:** DONE — STAGING CHECKLIST PASSED, USER-CONFIRMED 2026-11-23.
**Branch/commit under test:** `feature/v2-design-revision` / `75f3b39bfe6988774325fb1e4dd2c2c0571f11c9`.
**PR:** https://github.com/Reniel-Relearn/calorie-calculator/pull/14
**Preview:** https://calorie-calculator-jepz4rxal-reniel-relearn-qg-x-plai.vercel.app/
**Deployment:** `dpl_E2hnwnuKj72jNN2nzHBzacusUPSt` (Preview, Ready).
**Linked Supabase project:** `refqjrqxtgwfgxdbbcgw`.

## Verified this pass

- User confirms dashboard MFA access recovered and database healthy. Separate backup-factor enrollment is not yet confirmed.
- Linked migration ledger matches all six local migrations through `20261103090000`; no migration was reapplied.
- Linked schema lint: no errors.
- All five checks on PR #14 at the tested commit passed: Security CI verify, CodeQL analysis, CodeQL, Vercel, and Vercel Preview Comments. These existing check results are dated 2026-11-09; they were inspected, not rerun, on this pass.
- Authenticated Vercel CLI smoke: HTTP 200, expected CSP, HSTS, frame denial, MIME protection, referrer/permissions policies, and preview noindex header. This authenticates access to the deployment, not a CalorieCheck user session.
- Preview HTML contains onboarding and Settings Lose/Gain controls and the estimate disclaimer.
- RLS enabled on `profiles`, `calorie_targets`, `food_logs`, and `private.account_delete_attempt_limits`.
- Public policies constrain access to non-null `auth.uid() = user_id`.
- Four application mutation RPCs derive the caller from `auth.uid()`, deny anonymous execution, allow authenticated execution intentionally, and use an empty search path.
- `validate_v2_energy_target_payload` denies execution to both anonymous and authenticated roles.

Earlier local evidence remains in `V2_STATUS.md`: 140 JavaScript tests, 189 pgTAP assertions, build/audit/security scan, and full local authenticated browser integration. These are not substitutes for hosted acceptance.

## Security Advisor findings

| Finding | Count | Assessment |
| --- | --- | --- |
| Authenticated SECURITY DEFINER function executable | 4 WARN | Expected for `complete_profile_onboarding`, `update_profile_settings`, `create_food_log`, `update_food_log`. These are the intended atomic API entry points. Live grants, identity derivation, and empty search paths were checked. Do not revoke intended RPC access or switch privilege mode merely to silence the advisor. Hosted behavioral isolation passed per user checklist confirmation on 2026-11-23. |
| Leaked password protection disabled | 1 WARN | Known free-plan limitation; Supabase documents this feature as Pro and above. No paid upgrade or substitute service was added. |
| RLS enabled with no policy | 1 INFO | Expected on `private.account_delete_attempt_limits`: client access must remain denied; server throttle access uses the reviewed privileged path. Do not add permissive client policies. |

Sources checked 2026-11-23: [Supabase advisors](https://supabase.com/docs/guides/observability/advisors), [password security](https://supabase.com/docs/guides/auth/password-security).

## Human configuration steps

1. Sign into the recovered Supabase dashboard. Keep a recoverable backup factor for the dashboard account; this is separate from application users.
2. Open project `calorie-calculator` / `refqjrqxtgwfgxdbbcgw` → Authentication → URL Configuration. Preserve the existing public Site URL and existing valid redirects. Add these exact temporary preview callback URLs if absent:
   - `https://calorie-calculator-jepz4rxal-reniel-relearn-qg-x-plai.vercel.app/?auth=confirm`
   - `https://calorie-calculator-jepz4rxal-reniel-relearn-qg-x-plai.vercel.app/?auth=recovery`
3. Open Cloudflare → Turnstile → the widget already used by CalorieCheck → hostname management. Add the hostname `calorie-calculator-jepz4rxal-reniel-relearn-qg-x-plai.vercel.app` if absent. Enter no scheme, path, or wildcard. Save. Keep CAPTCHA enabled.
4. Open the preview above while signed into the authorized Vercel account. Complete any deployment access prompt and the visible Turnstile check yourself. If configuration fails, report the visible message; do not paste passwords, tokens, secret keys, or email callback URLs containing credentials.
5. Use disposable application accounts and synthetic profile values. Do not alter your real profile to test eligibility boundaries. A developer deployment smoke cannot establish a logged-in user journey, inbox confirmation, or human CAPTCHA completion.

The user confirmed adding the two Supabase callback URLs and Cloudflare hostname, resolved login using the original account password, and subsequently reported: “V2-G3 staging checklist passed.” Configuration and hosted browser acceptance are user-reported evidence. Signing up again with an existing email had not replaced its password; no application fix was required for this incident.

## Browser acceptance matrix

All rows below are recorded as PASS — USER-REPORTED based on the user's full-checklist acceptance on 2026-11-23. The agent did not independently run these hosted browser interactions or receive per-case captures. Test widths are phone (390 CSS px), desktop (1280 CSS px), and 320 px overflow checks. Synthetic examples describe software tests, not health recommendations.

| Check | Procedure and expected outcome | Status |
| --- | --- | --- |
| Signup/confirmation/login | Create a disposable account, complete Turnstile and confirmation email, return to this preview, sign in; protected content stays hidden before authentication | PASS — USER-REPORTED |
| Maintain onboarding | Use an adult age 35, female equation, 165 cm, 63 kg, low-active activity, Asia/Manila; complete the eligibility confirmation; save Maintain; refresh retains profile/target | PASS — USER-REPORTED |
| Lose and Gain persistence | In Settings keep the same eligible inputs, confirm safety, save Lose, refresh; then save Gain and refresh. Lose is below maintenance, Gain above it. Raw displacement is 472.36 kcal/day for the female equation and 670.32 for the male equation; UI rounds presentation only | PASS — USER-REPORTED |
| Age boundary | Test synthetic age 18: Maintain available, Lose/Gain unavailable; age 19 directional targets eligible when other checks pass | PASS — USER-REPORTED |
| BMI boundaries | At 180 cm/58 kg Lose is unavailable; at 180 cm/50 kg both directional goals are unavailable. No unsupported target is saved | PASS — USER-REPORTED |
| Safety confirmation | Missing directional confirmation prevents a directional target save; confirmation itself is not persisted as profile health status | PASS — USER-REPORTED |
| Low intake safeguard | Use the low-intake fixture in `tests/energy-target.test.js` through a synthetic profile: female, age 70, inactive, 140 cm, 37 kg, Lose. Target below 1,200 is unavailable, never replaced with 1,200 | PASS — USER-REPORTED |
| Today/logging | Analyze `150g grilled chicken breast`; explicitly add it; Today shows the saved food and consumed/target comparison; Analyze alone writes no log | PASS — USER-REPORTED |
| Week/history | Week agrees with the saved day's totals. Change goal explicitly and confirm prior dates retain their effective targets; same-day replacements follow the existing history contract | PASS — USER-REPORTED |
| Settings disclaimer | About calorie estimates remains the bottommost Settings section and retains the approved uncertainty/professional-review wording | PASS — USER-REPORTED |
| Owner isolation | Account A and disposable account B have independent profiles/logs; neither sees the other's content. Cross-owner data requests must not disclose rows. No shared session or server credential may be used as proof of user isolation | PASS — USER-REPORTED |
| Session/recovery | Logout hides private data; login/refresh restores only the correct owner; one reset email returns to the preview and permits a valid password update | PASS — USER-REPORTED |
| Responsive/focus/errors | Phone and desktop forms work; no horizontal page overflow; focus is visible; validation is readable; failed actions remain retryable without duplicate saves | PASS — USER-REPORTED |

If a case fails, record the case, screen, viewport, visible message, and reproduction steps without secrets. Stop that mutation path until reviewed. Do not repeatedly request emails if rate limited.

## Closeout condition

The user's full-checklist acceptance closes G3 for staging on 2026-11-23. V2-D1 is ready for authorization. The known Advisor findings remain documented above; no new claim of zero warnings, clinical validation, or production verification is made. Documentation closeout does not authorize a Git commit, push, merge, or production deployment. No runtime code or remote data was changed by the agent during this closeout.
