# V2-D1 Interface Audit and Design Traceability

**Date:** 2026-11-23 (Asia/Manila)
**Status:** APPROVED BY USER 2026-11-23 — D1 COMPLETE; D2 AUTHORIZED.
**Audited runtime:** `feature/v2-design-revision`, commit `71990c2` (G3 closeout); runtime implementation at `75f3b39`.
**Prerequisite:** G3 staging checklist passed per user confirmation on 2026-11-23. This document is a source/contract audit, not a new browser or accessibility certification.

## 1. Authority, evidence, and review boundary

Use these sources in this order:

1. [V2 master specification](V2_MASTER_SPEC.md), [V2 decisions](V2_DECISIONS.md) (especially ADR-030 and ADR-032), [data contracts](V2_DATA_CONTRACTS.md), and [accepted goal methodology](V2_LOSE_GAIN_TARGET_PLAN.md) govern behavior, privacy, and science.
2. [Approved wireframes](V2_DESIGN_WIREFRAMES.md), [reference register](V2_DESIGN_REFERENCES.md), and [isolated prototype](prototypes/v2-ui/index.html) govern visual hierarchy and presentation within those contracts.
3. Current controllers/services/domain modules and [testing specification](TESTING.md) supply functional regression obligations. [Design audit](V2_DESIGN_REVISION_AUDIT.md) and [planning proposal](V2_DESIGN_REVISION_PLAN_PROPOSAL.md) supply the accepted architecture and phase boundaries.

The approved prototype is already coded HTML/CSS/JavaScript. Review it with `npm.cmd run dev` at `http://localhost:5173/prototypes/v2-ui/` (use the printed Vite port if different). This D1 phase changes documentation only; no new local server or deployment is required to review this matrix. It does not begin D2–D6.

Screenshots are available locally: five Lose It! artifacts, three Apple Fitness artifacts, and two Cronometer artifacts under `assets/reference/v2-ui/`; recorded sources are in [links.txt](assets/reference/v2-ui/links.txt). They remain research references, not distributable UI assets. No new external research or generated imagery is necessary for D1.

The user-approved phase workflow is: scope → authorization → implementation/checks → appropriate artifact review → explicit commit/push → CI/preview readiness → deployed review when runtime changes → acceptance and next scope. Documentation-only phases use document review. Acceptance notes can accompany the next phase's commit. Merge and production rollout remain separate approvals.

For repeated staging reviews, Vercel's inspected branch alias is `https://calorie-calculator-git-feature-0dd8a4-reniel-relearn-qg-x-plai.vercel.app/`. Prefer that stable branch hostname once the user adds its exact confirmation/recovery callback URLs to Supabase and hostname to the existing Turnstile widget; record each accepted commit and immutable deployment separately. This avoids consuming another Turnstile hostname slot for every documentation push. The alias is still private preview access, not production. Its provider configuration has not been verified in D1.

## 2. What exists and what must change

| Area | Audited evidence | Disposition / owner |
| --- | --- | --- |
| Framework/layers | Vite entry [main.js](js/main.js), [private-app.js](js/private-app.js), domain/controller/service/view separation | Preserve. No framework, router library, UI package, chart package, or second calculation engine. |
| Auth boundary | `auth-main`, `protected-app`; profile completion gates `profile-home` and `app` | Preserve guards and reset behavior; nav must activate only after session and profile resolution. D3/D4. |
| Current composition | Today, Week, Settings panel, and calculator live in one document; `profile-home` contains trackers and management dialogs, while `app` is the calculator main | Reorganize into four destinations, avoiding two simultaneous visible main landmarks. Keep view-required IDs during migration. D3. |
| Navigation | No `js/navigation/` runtime module; profile view owns outer visibility; Settings has open/close handlers; auth-routes owns callback sanitization | Add a small isolated destination module and view in D3. Coordinate with profile visibility; never change auth callback precedence. |
| Onboarding | One `profile-onboarding-form`, full-form validation, one atomic completion RPC | D4 stages existing fields into five screens plus a real final estimate review. Back/Continue do not write the profile. |
| Today | Daily pure summary, native meter, date controls, semantic nutrient totals and generated food rows already work | Reuse calculations; make consumed-of-target dominant, target context secondary, empty/error handling truthful. D4. |
| Analyze | All seven calculator states and explicit retry-safe logging work; no live search | Preserve parsing/matching/serving/calculation. Restyle presentation and add successful-log navigation without another write. D4. |
| Week | Pure seven-day summary and semantic list; no runtime chart | Add optional CSS bars from the same rows, preserving textual values, elapsed-day averages, and target coverage. D5. |
| Settings/history | Editable profile, goal controls, dangerous-action form; only current target effective date is shown as history context | D5 grouped overview/forms plus read-only effective-history presentation. Existing history data exists, but the prototype's full history dialog is not wired. Add a bounded owner-filtered reader if needed, not a new table/RPC or history rewrite. |
| Visual primitives | Seven runtime CSS files, existing tokens and safe hidden/focus helpers; prototype has a separate token namespace | D2 reconcile roles into runtime CSS custom properties; do not import prototype CSS wholesale or duplicate both token systems. |
| Food source | Runtime still uses the 11-record local demo catalog | D4 checkpoint: catalog PR #12 is OPEN/DRAFT, unmerged as inspected 2026-11-23. No food-data edits or automatic branch merge in this design program. |

## 3. Reconcile prototype and historical-document drift

| Difference | Resolution for implementation | Phase |
| --- | --- | --- |
| Prototype Today goal path, goal-weight/date fields, goal BMI, fixed sample calories, and forecast-style review | Do not implement these fields or figures. Use accepted Maintain/Lose/Gain result, current profile measurements as needed, method, limitations, and effective date. No target date/rate/goal weight, diagnostic BMI label, or weight graph. ADR-032 already resolves the scope; the layout remains useful. | D4/D5 |
| Older reference/wireframe passages say Maintain-only or scientific verification still pending | Treat those passages as D0 history. G3 is accepted; all three goals use the accepted eligibility contract. Keep age 18 Maintain-only and other unavailable outcomes explicit. | D1 annotation; D4/D5 presentation |
| Prototype navigation can switch to `auth`, `onboarding`, or `states` through `?screen=` and its preview menu | Production navigation only accepts `today`, `analyze`, `week`, `settings`; auth/onboarding are guarded lifecycle states. Gallery/demo controls never ship into production. | D3 |
| Prototype auth uses simulated submits and CAPTCHA placeholders | Keep real Supabase Auth, single-use Turnstile tokens, provider errors, confirmation/recovery links, and remote fail-closed configuration. | D4 |
| Prototype shows richer meal/goal/progress context than source data | No meal groups, macro targets, exercise/calories burned, forecasts, monthly trends, or food thumbnails. Today has its existing meter; Week bars represent only existing daily totals/targets. | D4/D5 |
| Prototype exposes profile and history dialogs with hardcoded entries | Bind canonical editable fields and existing owner history, including loading/empty/error. Never claim sample rows were fetched or saved. | D5 |
| Prototype gallery has standalone permission, future-week, slow-network, offline panels | Present only when a real condition is known. Existing data errors often map permission/session failures together; do not infer another user's record exists or invent a permission classification. No future-week data request, offline queue, or guaranteed offline availability. | D3–D5 |
| Prototype reduced density, borders, icons, and colors are visually approved, not accessibility-certified | Recheck contrast, focus, touch targets, wrapping, dynamic values, and reflow before exact values become shared runtime tokens. | D2/D6 |

No unresolved product-scope conflict requires new scientific work for D1. The exact presentation of target history and constrained long-content layouts remains part of later phase reviews; the accepted data/behavior contract takes precedence over prototype samples.

## 4. Navigation and lifecycle map

| Destination / lifecycle | Current anchor and owner | D3 contract and focus |
| --- | --- | --- |
| Signed out / auth | `auth-main`, [auth-state.js](js/auth/auth-state.js), [auth-ui.js](js/auth/auth-ui.js) | Hide private shell/nav. Retain login/signup/forgot navigation and appropriate auth heading focus. |
| Profile loading/incomplete/failure | `profile-loading`, `profile-onboarding`, `profile-load-error`; [profile-view.js](js/profile/profile-view.js) | No destination hint bypasses loading or onboarding. One visible main/heading, correct skip target. |
| Today | `profile-home-greeting`, `daily-tracker`; daily controller/view | First authenticated destination when hint absent/invalid. Heading focus after user navigation; keep selected day in memory, not URL. |
| Analyze | `app`, `food-query`, calculator state panels; [ui.js](js/ui.js) | First-class destination; show input and current analysis state without reinitializing calculator on every tab change. |
| Week | `weekly-tracker`; weekly controller/view | Keep selected week and semantic list in memory; no user IDs, dates, totals, or foods in history/query. |
| Settings | `settings-panel`; settings controller/view | Destination replaces current overlay-like open/close role. Close/Back returns to safe prior destination; logout is reachable here, including incomplete-profile logout in its existing lifecycle shell. |
| Auth callbacks | [auth-routes.js](js/auth/auth-routes.js), [main.js](js/main.js) | Parse/clear `?auth=confirm` and `?auth=recovery` plus provider tokens first; only resume private navigation after valid auth/profile. Never push credentials into history. |
| Dialogs/local states | `log-edit-dialog`, `log-delete-dialog`; later account/history dialogs | No history entries for dialogs, validation, advanced-input expansion, draft steps, or serving changes. |

Use safe same-document `?view=` destination hints (as described by the wireframes), destination-only `history.state`, and allowlisting. Preserve unrelated safe URL state; do not copy prototype `screen` access as an auth gate. Back/Forward and refresh restore the appropriate permitted destination; signed-out/unonboarded users stay guarded. Clear owner-specific view state when identity changes or session ends. Hidden destination completion must not steal focus; explicit navigation moves focus to the active heading. Repeated activation must not duplicate listeners or writes.

## 5. State coverage matrix

Disposition vocabulary: **reuse** keeps the functional contract while changing presentation; **wire** connects an already approved prototype interaction; **adapt** translates sample content to real data; **conditional** displays only an existing/observable failure condition. These are presentation/lifecycle states, not a proposal for one giant state machine.

### 5.1 Authentication and access

Owner: [auth-controller.js](js/auth/auth-controller.js), [auth-ui.js](js/auth/auth-ui.js), [auth-errors.js](js/auth/auth-errors.js), [auth-captcha.js](js/auth/auth-captcha.js), [main.js](js/main.js); CSS `auth.css`, shared `components.css`. Production IDs below come from `index.html`.

| Runtime state / variant | Production element / behavior | Prototype counterpart | Disposition / phase |
| --- | --- | --- | --- |
| SESSION_CHECKING | `auth-session-checking`; protected content hidden | states/loading | Reuse; D3 guard/D4 surface |
| SIGNED_OUT | `auth-signed-out`; entry actions | auth/login and wireframe 5.1 | Reuse both entry choices; D4 |
| LOGIN | `auth-login`, `login-form`; real Turnstile | auth/login | Reuse; D4 |
| SIGNUP | `auth-signup`, `signup-form`; confirmation required | auth/signup | Reuse; D4 |
| FORGOT_PASSWORD | `auth-forgot-password`, `forgot-password-form` | auth/recovery | Reuse; D4 |
| VERIFICATION_PENDING | `auth-verification-pending`; generic confirmation response | auth/verification | Reuse enumeration resistance; D4 |
| RESET_REQUESTED | `auth-reset-requested`; generic reset response | auth/recovery-sent | Reuse; D4 |
| UPDATE_PASSWORD | `auth-update-password`, `update-password-form`; valid recovery session required | auth/reset | Reuse; D4 |
| AUTH_ERROR | `auth-error`, `auth-error-message`; bad confirmation/recovery/config | auth/confirmation-invalid, reset-invalid, configuration | Reuse safe error categories; D4 |
| AUTHENTICATED_ONBOARDING_REQUIRED | enum indicates protected/profile handoff, including complete users before profile resolves | onboarding and Today | Preserve lifecycle distinction; D3/D4 |
| Inline validation/invalid credentials/unconfirmed email/weak or same password | form errors and `aria-invalid`; auth-errors mapping | auth/login-error; labeled fields | Reuse; D4. Existing generic error does not prove password mismatch for every unclassified provider failure. |
| Request pending/duplicate prevention | form fields disabled, `aria-busy` | form feedback/loading | Reuse; D2/D4 |
| CAPTCHA absent/failed/expired/unavailable | login/signup/forgot containers and reset on token consumption | CAPTCHA placeholder only | Adapt with real widget; D4 |
| Network/rate/session/link failure | safe auth-error or form message; invalid stored session clears private view | system states + auth invalid variants | Reuse; D3 clearing/D4 feedback |
| Logout / account-deleted completion | clears private state, returns signed out with announcement | auth/account-deleted | Reuse; D3 logout location/D5 deletion completion |

### 5.2 Profile, onboarding, and target review

Owner: [profile-controller.js](js/profile/profile-controller.js), [profile-view.js](js/profile/profile-view.js), [profile-validation.js](js/profile/profile-validation.js), [profile-target-command.js](js/profile/profile-target-command.js), [energy-target.js](js/targets/energy-target.js). CSS `profile.css`.

| State / variant | Production anchor / contract | Prototype / disposition / phase |
| --- | --- | --- |
| Loading | `profile-loading` | loading panel; reuse D4; D3 shell must not flash |
| Load failure / incomplete inconsistent server data | `profile-load-error`, `profile-retry`; service treats only both missing as first-time onboarding | system error; preserve retry and never silently overwrite a half-profile, D4 |
| Onboarding step 1 | `profile-display-name`, `profile-date-of-birth`, equation-sex radio group | `data-onboarding-step="1"`; wire existing canonical fields, D4 |
| Step 2 | `profile-height-cm`, `profile-weight-kg` | step 2; cm/kg only, D4 |
| Step 3 | activity radio group and descriptions | step 3; accepted four categories, D4 |
| Step 4 | goal radios, `profile-timezone`, life-stage and directional confirmations | step 4; adapt no goal weight/date; include timezone/source sex missing from some prototype samples, D4 |
| Step 5 / edit / Back / Continue | Currently no independent preview stage before submit | step 5; calculate through existing pure engine for review; final submit revalidates/recalculates, D4 |
| Field validation | `profile-form-error`, FIELD_IDS, `aria-invalid`, first invalid focus | onboarding/validation; reveal owning step before focusing; associate inline errors, D4 |
| Target unavailable/ineligible/invalid | `showTargetOutcome`; age, life-stage, confirmation, BMI, low intake, unsupported or non-finite inputs | adapt review/goal feedback with actual engine outcome; do not invent an estimate, D4 |
| Save pending / success / idempotent success | `profile-submit`; one `complete_profile_onboarding` command | onboarding/saving → Today; no per-step writes, D4 |
| Save failure | `profile-error-message`; truthful no-partial-save message | onboarding/error; retain draft in memory and allow explicit retry, D4 |
| Complete home / current method / goal / effective target | `profile-home`, `profile-home-target`, `profile-home-goal`, `profile-home-method`, `profile-home-effective` | Today summary and Settings context; reuse real target and avoid competing equally prominent target card, D4/D5 |

Draft choice for this revision: use in-memory form values; do not introduce persistent profile drafts merely to imitate the prototype. Refresh may restart incomplete onboarding. If later session draft recovery is requested, its privacy, expiry, owner scoping, and confirmation reset need explicit design before storage. Do not store safety confirmations, auth tokens, or credentials in navigation/drafts. Server profile remains authoritative only after the existing atomic save.

### 5.3 Calculator and food logging

Owner: [app.js](js/app.js), [ui.js](js/ui.js), [state.js](js/state.js), [food-log-controller.js](js/logs/food-log-controller.js). CSS `components.css`, `responsive.css`. All seven APP_STATES remain independent of primary destination navigation.

| State / variant | Production anchor / contract | Prototype counterpart / disposition |
| --- | --- | --- |
| IDLE | `state-idle`, `food-search-form`, `food-query` | analyze/intro; reuse D4 |
| ANALYZING | `state-analyzing`; no duplicate submission | analyze/analyzing; no decorative minimum delay, D4 |
| AMBIGUOUS | `state-ambiguous`, `match-list`, `edit-ambiguous-search` | analyze/matches; render actual ranked preparation-specific choices, scroll/wrap and keyboard access, D4 |
| NEEDS_AMOUNT | `state-needs-amount`, `needs-amount-form`, food-specific unit selector | analyze/needs-amount; no default quantity; reuse D4 |
| SUCCESS | `state-success`, food/source/calories/macros/secondary nutrients/serving | analyze/result; actual result, missing ≠ zero, D4 |
| NOT_FOUND | `state-not-found`, `try-another-search` | analyze/not-found; current demo catalog only, D4 |
| INVALID | `state-invalid`, `edit-invalid-search`; amount/search recovery | analyze/invalid; preserve correct recovery branch, D4 |
| Blank input / Advanced Input validation | `food-query-error`, `advanced-input-form`, `advanced-input-error`; native details | intro + validation; preserve details/Enter/examples, D4 |
| Amount / unsupported unit / serving correction error | `needs-amount-error`, `serving-adjustment-error`; retain last valid result | needs-amount/result; field focus and compatible mass/cups/mL, D4 |
| Serving plus/minus/direct entry | `decrease-serving`, `serving-adjustment`, `increase-serving`; shared calculation path | result/serving-control; center symbols/field, prevent nonpositive decrement; preserve steps and finite-large-value rules, D4 |
| Log ready / pending | `add-to-log`; requires active profile and result, stable command ID | log/ready, saving; reuse explicit save, D4 |
| Log saved / idempotent success | `food-log-status`, disabled add action | log/saved + View today's log; wire navigation in D4 after save only, no duplicate write |
| Log failure / expired session / retry | `food-log-status`; retry uses identical pending command | log/error; preserve input/result and idempotency, D4 |
| Reset / Analyze Another / Change Amount | resets correct calculator state and log status | prototype intro/result actions; preserve valid serving recovery, D4 |

View today's log must select the current profile-local day through the daily controller, switch destination, and focus the refreshed log heading/status. If the saved entry belongs to an earlier day after a midnight boundary, explain that context rather than pretending it is in the current day. The saved log's captured local date remains authoritative. Success-area bottom padding, full-width primary action on phones, and centered plus/minus hit areas carry forward the reviewed prototype fixes.

### 5.4 Today and Week

Owner: [daily-controller.js](js/dashboard/daily-controller.js), [daily-view.js](js/dashboard/daily-view.js), [weekly-controller.js](js/dashboard/weekly-controller.js), [weekly-view.js](js/dashboard/weekly-view.js). Pure [daily-summary.js](js/dashboard/daily-summary.js) and [weekly-summary.js](js/dashboard/weekly-summary.js) remain authoritative. CSS `dashboard.css`.

| State / variant | Production anchor / contract | Prototype counterpart / disposition |
| --- | --- | --- |
| Today loading / reset | `daily-loading`, hidden `daily-tracker` after reset; load-token stale-response guard | today/loading; reuse D4 |
| Today populated | `daily-content`, `daily-calories`, `daily-target`, `daily-log-list` | today/populated; consumed-of-target first, actual saved food rows, D4 |
| Empty day | `daily-empty`; zero consumed is known, not missing | today/empty; actionable Analyze link, D4 |
| Missing historical target | `daily-comparison`, hidden `daily-meter-group`; intake remains available | today/missing-target; no invented denominator, D4 |
| Remaining / at target / above target | native `daily-calorie-meter`, clamped visual, complete comparison text | Today meter; neutral full values outside visual range, D4 |
| Nutrients complete / partial / unavailable / explicit zero | `daily-proteinG` and matching dynamic nutrient IDs/notes | Today nutrient summary; retain known-total note, D4 |
| Date navigation / future-date guard | `daily-date`, previous/next/today; profile timezone, future blocked | date controls; keep native accessible date entry, D4 |
| Today load failure / session required | `daily-error`, retry hidden for session-required | today/error; today/permission is conditional safe access feedback, D4 |
| Week loading / reset | `weekly-loading`, hidden `weekly-tracker` after reset | week/loading; reuse D5 |
| Week populated / current / completed / zero-log days | `weekly-content`, `weekly-day-list`; seven real dated rows | week/populated; semantic list + optional CSS bars, D5 |
| Empty week | `weekly-empty` while seven rows and applicable targets remain represented | week/empty; don't erase known targets, D5 |
| Missing or partial targets / future days | weekly rows and `weekly-average-note`; elapsed-day denominators | week/missing-target; future styling labels upcoming, not zero intake, D5 |
| Previous/current/next / future-week attempt | `weekly-previous`, `weekly-next`, `weekly-current`; next cannot exceed current week | week/future is a guarded invalid-navigation explanation, not a new fetchable page, D5 |
| Week failure / session required | `weekly-error`, retry hidden for session-required | week/error; reuse D5 |
| Confirmed save/edit/delete refresh | `caloriecheck:food-log-saved` and onChanged callback; only affected dates/weeks reload | adapt prototype static totals to existing events; D4/D5 |

Today date, consumed total, applicable historical target, and comparison must describe the same selected day. Week bars and lists derive from one summary result; don't create a second aggregation or silently average future dates. No daily or weekly slider changes data by itself.

### 5.5 Settings and destructive actions

Owner: [settings-controller.js](js/settings/settings-controller.js), [settings-view.js](js/settings/settings-view.js), [log-management-controller.js](js/logs/log-management-controller.js), [log-management-view.js](js/logs/log-management-view.js). CSS `settings.css`; services and captured-snapshot editor retain persistence responsibility.

| State / variant | Production anchor / contract | Prototype counterpart / disposition |
| --- | --- | --- |
| Settings closed / open / profile populated | `settings-panel`, `settings-open`, `settings-close`, `settings-profile-form` | settings + profile-dialog; adapt to primary destination/groups, D3 wiring/D5 finish |
| Validation / unsupported target | `settings-profile-error`, field IDs and goal outcomes | settings/validation; retain all G3 safeguards and confirmations, D5 |
| Saving / failure / success | `settings-profile-submit`; pending guard, closes and refreshes profile on success | settings/saving, error, success; show truthful saved state without route/focus race, D5 |
| Name-only vs target-affecting change | controller `hasTargetAffectingProfileChanges`; canonical RPC command | settings/success; no new target for name-only save; never silently recalculate, D5 |
| Target history loading / rows / empty / failure | Current-target context only; all effective rows already queried by dashboard service | history-dialog; wire bounded owner read and explicit loading/empty/retry; read-only, D5 |
| Edit open / invalid local snapshot | `log-edit-dialog`; local-fields guard and page announcement | edit-dialog + page feedback; preserve captured food/unit/source, D5 |
| Edit validation / pending / failure / success | `log-edit-form`, `log-edit-error`, `log-edit-submit`; notify both old/new dates | edit/validation, pending, error, success; reuse D5 |
| Delete food prompt / cancel / pending / failure / success | `log-delete-dialog`, cancel first focus, pending guards, `log-management-announcement` | delete-dialog, delete/pending, error; deletion is permanent, no invented Undo, D5 |
| Delete account validation / security check | `settings-delete-form`, exact confirmation, password and CAPTCHA | account-dialog; real auth reauthentication, not prototype placeholder, D5 |
| Delete account pending / wrong password / failure / throttled | `settings-delete-error`, `settings-delete-submit`; five attempts/15 min server throttle | account/pending, error, throttled; retain retry guidance and token reset, D5 |
| Delete account success | settings reset + auth-controller accountDeleted | auth/account-deleted; clear owner data/history view/drafts, D5 |
| Disclaimer | `.settings-estimate-disclaimer` with DOI and professional-review wording | absent/incomplete in sample settings; preserve as bottommost Settings section, D5 |

### 5.6 Cross-application states and focus

| Pattern | Existing behavior / implementation requirement | Owner phase |
| --- | --- | --- |
| Loading / slow response | Real pending state drives spinner/status. A delayed slow message may decorate a still-active request; do not claim cancellation or safe mutation retry while it is pending. Clear timer on settle/reset. | D2 primitives; D4/D5 actual requests |
| Offline / recoverable network error | Preserve loaded values with accurate stale/unavailable context; no new cache, queue, background writes, or offline promise. Only existing loaded calculator capabilities remain usable within the auth boundary. | D4/D5 |
| Permission/session failure | Preserve sanitized messages and private-state reset; no account enumeration or record existence disclosure. Unauthorized views cannot be reached through history. | D3/D4/D5 |
| Validation | Reveal correct step/panel before invalid-field focus; retain labels, field associations, summaries, valid input, and native controls. | D2/D4/D5 |
| Success | Inline polite status; reserve layout space; do not relocate focus merely because a background refresh completed. | D2/D4/D5 |
| Dialog cancel/pending/focus return | Native labeled dialog, meaningful first focus, Escape/cancel when not pending, scrollable content; return to trigger or durable list heading if row was removed. | D5 |
| Configuration unavailable | Keep current fail-closed Auth boundary and safe guidance; do not relax CSP or replace CAPTCHA to make a screenshot match. | D3/D4 |

## 6. Shared presentation and module ownership

| Component/pattern | Existing owners | Planned change / constraint |
| --- | --- | --- |
| Tokens/reset/page container/typography | `css/main.css`; `css/responsive.css`; prototype `--ink`, `--blue`, `--content-max` | D2 map prototype roles to existing `--color-*`, `--space-*`, radii/shadow roles; system sans stack, tabular numbers, safe wrapping. Exact colors need measured contrast. |
| Buttons/fields/details/spinners/panels | `css/components.css`, `css/auth.css`, `css/profile.css`, `css/settings.css` | D2 remove repeated presentation where practical; keep view-specific layout in its owner file; minimum practical 44 px hit area. |
| Header/nav/landmark/focus/skip links | `index.html`, auth/profile views, `js/private-app.js` | D3 propose `js/navigation/navigation-controller.js` and `navigation-view.js`, optional `css/navigation.css`; no service or domain access in nav. |
| Form steps/review | profile view/controller/validation | D4 proposed `js/profile/onboarding-flow.js` for presentation-step state and draft review; keep validation/target engine/atomic command authoritative. |
| Calorie/nutrient/food rows | daily/weekly/UI view modules | Use semantic `meter`, `dl`, lists, and actual units; extract small formatter/helper only if it demonstrably removes duplicate presentation. No component framework. |
| Status/live regions | auth/profile/daily/weekly announcements plus food-log status | D2 patterns; D3–D5 coordinate announcements and focus to avoid multiple live regions speaking the same route change. |
| Management/history dialogs | log-management view; Settings form | D5 preserve current native-dialog behavior; proposed `js/settings/target-history-view.js` and reader in existing service if necessary. Don't query Supabase inside rendering. |
| Local icons | Prototype inline SVG; production has no icon dependency | D2 audit a tiny local SVG symbol set or inline SVG. Text labels are mandatory; decorative icons `aria-hidden`, no script/external references or copied brand art. |

Runtime CSS load order is `main.css → components.css → auth.css → profile.css → dashboard.css → settings.css → responsive.css`. Audit global h1/h2 sizing, `.page-container`, last-loaded desktop grid areas, and selectors shared by result cards before moving markup. D2 should not apply screen-specific layout before D3–D5. Any new stylesheet must be linked explicitly and checked under Vite/CSP.

## 7. Responsive and asset contract

- Start at 320/360/390/430 CSS px: one-column tasks, readable units and errors, visible labels, wrapped long food names/email/provenance, no page overflow, no overlapping fixed bars. Preserve native touch and keyboard controls.
- Mobile primary navigation is persistent for onboarded users, with `env(safe-area-inset-bottom)` padding. Content and `scroll-padding`/`scroll-margin` must leave focus visible above/below bars, including soft-keyboard and short-height layouts. No persistent private nav on auth/onboarding.
- At wider content-driven breakpoints, place nav in the header and use restrained two columns for Today/Week/Settings where useful. Same destinations/order and data semantics; no sidebar or fixed-width phone shell on desktop. The prototype's `40rem`/`52rem` breakpoints are references, not copied guarantees for real content.
- Retain the ten exact viewport sizes in `TESTING.md`, plus 1280×600, 200%/400% zoom/reflow, long content, and reduced motion. Analyze's input/action remain useful in its first desktop view; Today is the default destination.
- Build cards, progress, and bars in CSS with semantic text. No generated raster screens, photographic foods, external fonts/scripts/assets, Activity Rings, ornamental imagery, or chart library. Reference screenshots and the two untracked goal-research PDFs remain outside shipping assets.
- The prototype's visual chart is illustrative. D5 derives bars from the existing seven rows; future days, missing targets, all-zero values, large/above-target values, and partial coverage get explicit textual handling. Decorative duplicate bars should be hidden from assistive technology where the semantic list supplies the information.

## 8. Ordered implementation slices and gates

| Phase | Exact slices and likely files | Required verification / review artifact |
| --- | --- | --- |
| D2 | 1. Token mapping and shared type/spacing in `css/main.css`. 2. Reusable controls/surfaces/status/focus in `css/components.css` and narrow normalization of auth/profile/dashboard/settings CSS. 3. Reduced-motion and audited local icons. 4. A small isolated HTML/CSS component specimen if existing screens cannot show all primitives, with no pretend backend actions. | Local component review at phone width, contrast for all roles/states, 44 px controls, focus, long content, zoom/reduced motion, asset loading, V1 regressions, build/security checks. A later pushed preview is the staging sample review. Do not claim screens complete. |
| D3 | 1. Add allowlisted History API navigation/controller/view and tests. 2. Reorganize `index.html` into guarded destinations without losing required IDs; coordinate `main.js`, `private-app.js`, auth/profile/settings views. 3. Header/logout/skip/active nav/safe areas and responsive shell in CSS. | Proposed `tests/navigation-controller.test.js` and browser integration additions: Back/Forward, refresh, invalid hint, auth callbacks, identity switch, incomplete profile, logout/reset, one visible main, focus/no overflow, no duplicate listeners. Phone and desktop nav preview review. |
| D4 | 1. Auth/recovery surfaces and real CAPTCHA. 2. Five onboarding stages/review, in-memory fields and atomic save. 3. Today hierarchy/date/nutrients/rows. 4. Analyze states, scrollable choices, result controls, full-width save, saved-message spacing and View today's log. | Extend profile/auth/daily/food-log tests and `tests/integration/auth-local.mjs`; proposed `tests/onboarding-flow.test.js` for step validation and review/final-submit consistency. Check all seven V1 states, mass/cups/mL, null/zero, unsupported cases, G3 safety/history, retries/idempotency, focus and day-boundary navigation. Review signup-to-log journey locally then staging. |
| D5 | 1. Week list/CSS bars from one summary. 2. Settings groups/editor/current-goal/method and history reader/view. 3. Log edit/delete dialogs, account deletion, error/loading/throttle/confirmation. 4. Bottommost disclaimer and target-history consistency. | Extend weekly/settings/log-management suites, proposed target-history reader/view tests, directional UI contract and authenticated browser integration. Check empty/partial/future/above-target history; name-only vs target edits; both affected-date refreshes; cancel/failure/focus return; owner scoping, password/CAPTCHA and 429 guidance. Review dense and destructive flows on staging with disposable data. |
| D6 | 1. Complete matrix below against final runtime. 2. Fix only presentation/interaction regressions. 3. Collect responsive/accessibility/function/security evidence and document deviations. 4. Obtain explicit staging visual acceptance. | All mapped screens/states, maintained viewport matrix/zoom, keyboard, reduced motion, contrast, no-color text equivalence, DOM IDs/labels, builds/security, frozen V1 and V2 tests, local DB/browser and hosted journeys as required. Record unavailable browser/assistive-technology environments honestly. User approves staged revision before P10. |

No new files named here exist yet merely because they are proposed. Keep phase commits coherent and reviewed; do not mix the catalog, database migrations, dependency upgrades, or auth-provider changes into presentation commits. Exact test additions should verify behavior rather than mirror CSS or fragile whitespace.

## 9. Regression risks and test ownership

| Risk | Protection / existing evidence to preserve |
| --- | --- |
| Moved markup breaks requiredElement, error focus, or test selectors | Preserve stable IDs or update view bindings and tests in the same slice; check uniqueness/labels/references; `tests/integration/auth-local.mjs`, `tests/directional-ui-contract.test.js`. |
| Auth callbacks or history expose private data / flash content | Existing `tests/auth-foundation.test.js`, `tests/auth-service.test.js`, `tests/environment.test.js`, `tests/auth-captcha.test.js`; add navigation/guard/browser cases in D3. |
| Browser history, profile refresh, and Settings close fight over visibility/focus | One destination owner; lifecycle gates outrank nav. Returning from Settings save should refresh data and leave a deliberate destination; background loads never resurrect an old owner. Preserve controller stale-load protections. |
| Progressive onboarding changes accepted inputs or saves early | `tests/profile-validation.test.js`, `tests/profile-controller.test.js`, `tests/profile-service.test.js`, `tests/energy-target.test.js`; full source-sex/timezone/confirmation fields and atomic final command. |
| Styling replaces actual calculator paths with prototype behavior | `tests/v1-regression.test.js`, calculator data-shape tests/fixtures and seven-state browser cases. Keep data/parser/search/converter/calculator/state exports unchanged. |
| View-today action repeats a log or shows wrong local day | `tests/food-log-controller.test.js`, mapper/service tests, daily controller tests; navigation is separate from save; handle midnight and logged-entry context explicitly. |
| Bars or prominent metrics hide missing nutrients/targets or alter averages | `tests/daily-summary.test.js`, `tests/weekly-summary.test.js`, daily/weekly controller/service tests; preserve completeness notes, future-day logic, effective targets, neutral labels. |
| Added history UI bypasses data bounds/ownership | Reuse owner-filtered, ordered, five-page maximum reading pattern in `js/dashboard/dashboard-data.js`; extend `tests/dashboard-data-security.test.js` for the new reader if introduced. Never display IDs. |
| Modal closes while pending / row rerender loses focus | Existing log-management and Settings controllers prevent pending cancellation; add DOM checks for Escape and durable focus fallback after affected-list refresh. |
| Account controls lose CAPTCHA, exact confirmation, current password, or throttle | `tests/settings-validation.test.js`, `tests/settings-service.test.js`, `tests/settings-controller.test.js`, `tests/delete-account-security.test.js`; no Edge Function change for design. |
| Screen styling weakens security or copies reference assets | `tests/frontend-security.test.js`, `tests/security-headers.test.js`, repository security scan and audit; no raw HTML/dynamic-code sinks, CSP relaxation, or remote asset dependency. |
| Styling test assumes old DOM structure too literally | Directional disclaimer test currently locates class/section order by string; revise that presentation assertion when needed while preserving bottommost disclaimer acceptance and actual content. Do not remove semantic requirements to make tests pass. |
| Prototype/source contain outdated target or future nutrition API wording | Resolve using latest V2 master/ADR-032/G3 contracts, not frozen V1 future-architecture speculation; no live API or new server layer is part of D1–D6. |

## 10. D1 coverage and exit evidence

| Required D1 gate | Evidence / result |
| --- | --- |
| Every auth lifecycle constant and calculator state mapped | Section 5 maps all 10 AUTH_STATES and all 7 APP_STATES; production anchors checked against `index.html`. |
| Existing screens and error/empty/mutation states mapped | All 38 section/main/form/dialog IDs in source inventory covered by the grouped screen/owner matrices, including nested forms and both native management dialogs. Dynamic daily/weekly rows covered separately. |
| Approved prototype inventory accounted for | All 7 `data-screen` values, 11 auth panels, 7 Analyze panels, 6 Today variants, 6 Week variants, and onboarding/settings/edit/delete/account feedback variants mapped, adapted, or explicitly excluded as gallery/demo state. |
| Shared ownership and five implementation phases concrete | Sections 6–9 define current files, proposed modules, slices, tests, risks, and local/staging review artifacts for D2–D6. |
| Reference principles and asset restrictions preserved | Sections 1, 3, and 7; screenshot ingestion remains visual only. No reference image copied, generated, committed, or wired. |
| Product conflicts reconciled | Section 3; ADR-032 and canonical fields override prototype goal/date/sample content; no new product decision or formula introduced. |
| No code or future-phase implementation | D1 diff restricted to design/status documentation. D2–D6 and P10 remain unstarted. |
| Human review | PASSED: user approved D1 and authorized its commit/push and V2-D2 on 2026-11-23. |

Validation for this documentation pass: source state/anchor/prototype-value comparison (10 auth states, 7 calculator states, 38 production anchors, and all inventoried prototype variants); 65 local Markdown file references resolved; repository security scan; and `git diff --check`. Automated inventory presence checks complement the manual disposition review and do not prove interaction correctness. Prior runtime/staging evidence is attributed to its original pass; no new runtime tests, visual checks, or database changes are claimed by D1.

**Next phase after review:** V2-D2 — Visual Foundations and Shared Components. Recommended eventual D1 commit: `Map V2 interface revision work`.
