# V2-D3 Mobile App Shell and Navigation

**Date:** 2026-11-23 (Asia/Manila)
**Status:** Local review APPROVED by the user on 2026-11-23; commit/push explicitly authorized. Staging navigation acceptance pending. Not DONE.
**Prerequisite:** The user confirmed D2 staging acceptance and authorized D3. D2 is committed/pushed as `4f9d708`; all five PR checks passed and the component preview returned HTTP 200.

## Review locally

http://localhost:5173/?view=today

Vite and the existing local Supabase stack are running for this review. Use a local test account; hosted Supabase accounts are separate and do not automatically exist in the local stack. If creating a local account, its confirmation email is captured at:

http://127.0.0.1:55324/

No provider configuration, migration, remote database write, production deployment, or new dependency is required by D3. The local browser integration creates disposable local accounts and removes its completed test account through the existing deletion flow. No database reset was performed.

## Implemented behavior

- Four persistent primary destinations, in the approved order: Today, Analyze, Week, Settings. Mobile uses a bottom bar; from 48rem it becomes a sticky horizontal row. No sidebar or alternate desktop journey.
- Text labels remain authoritative; original local SVG symbols supplement them. `aria-current="page"`, a colored surface, and an underline identify the active destination without relying only on color.
- One visible authenticated main contains an active destination heading and exactly one destination wrapper. Existing profile setup/loading/error mains remain separate lifecycle states. The calculator retains its own seven states inside Analyze.
- The shell/nav appear only after validated authentication and completed profile loading/onboarding. A URL hint never grants access. Signed-out/incomplete users stay in existing auth/profile flows.
- `?view=today|analyze|week|settings` is the only navigation state added. Invalid/absent hints default to Today. Refresh restores an allowed hint after authentication/profile checks. Back/Forward select the permitted destination without new history entries. Repeated activation does not push duplicate entries.
- History state contains only `{ view }`. No food query, quantity, date, profile, target, credential, or user ID is added by navigation. Existing auth callback handling remains authoritative; callback data is cleared before private destination history is written. Unrelated query parameters are preserved, and old application fragment anchors are cleared when changing destination.
- Explicit navigation focuses its destination heading (the Settings heading when opening Settings), updates the document title, resets page scroll, and updates the skip link. Passive profile refresh preserves focus. Background dashboard loads do not navigate or reset the calculator.
- Analyze keeps its current input/result when switching destinations. Today/Week keep their in-memory selected ranges. Leaving Settings hides its view and resets the deletion CAPTCHA and deletion credentials; ordinary profile form values remain in memory until save/profile reload/reset. Returning does not require an extra data fetch or reset the form. Unsaved data is not claimed saved.
- Settings Back returns to the previous non-Settings destination, defaulting to Today on direct entry. Successful Settings save retains the established close/refresh flow. A background completion does not redirect the user if they already left Settings.
- The existing single account/logout control moves into Settings after profile completion. It remains in the header during onboarding/loading/errors, so incomplete accounts can still log out. No duplicate logout handler is introduced.
- Shell bottom spacing reserves room for the phone bar; safe-area insets and viewport-fit are included. Controls have scroll margins to reduce obstruction during focus. Tablet/desktop progressively use the same content widths and horizontal navigation.

## Ownership / changed implementation files

| File | Responsibility |
| --- | --- |
| `js/navigation/navigation-routes.js` | Allowlisted destination names and same-document URL construction |
| `js/navigation/navigation-controller.js` | Guarded activation, destination selection, history/popstate, safe return and lifecycle reset |
| `js/navigation/navigation-view.js` | Destination visibility, labels/active state, title/focus/skip link, account control placement |
| `css/navigation.css` | Mobile-first shell, safe areas, bottom/horizontal navigation, active/focus treatment |
| `index.html` | Semantic navigation/main/destination wrappers; existing sections and IDs retained; Settings and Week moved into their own destinations |
| `js/private-app.js` | Wires navigation into existing profile/settings lifecycle; no service or domain change |
| `js/profile/profile-view.js` | Optional home-shown coordination hook after existing profile content renders |
| `js/settings/settings-view.js` | Separate show/resume/hide behavior and safe close callback for destination navigation |
| `tests/navigation.test.mjs` | Route validation, guards, refresh, history, callback cleanup and lifecycle tests |
| `tests/integration/auth-local.mjs` | Existing real local auth/data journey now navigates visible destinations; adds shell assertions and screenshots |
| `tests/directional-ui-contract.test.js` | Existing bottommost-disclaimer check now tolerates additional presentation classes; content requirement unchanged |

The HTML nesting/layout changed; nutrition, matching, serving, calculation, profile validation, target methodology, services, authorization, migrations and catalog did not.

## Verification

- `npm.cmd run check`: 144 JavaScript tests passed (140 existing plus four navigation tests); 108-module production build passed; dependency audit reported zero vulnerabilities; security scan passed.
- `npm.cmd run test:auth:local`: passed with the real local Supabase stack, including signup/confirmation, incomplete-profile hint guard, atomic onboarding, all goal Settings changes, logging/edit/delete, daily/weekly refresh, expired session, recovery, account deletion and invalid link handling.
- Navigation browser checks cover all four destinations at 320×568, 390×844, 768×1024 and 1280×800: no horizontal overflow, links at least 44px in both dimensions, one active destination/main, accurate active state, destination heading focus, skip target and destination-only history state.
- Real Back/Forward and keyboard Enter activation passed. Week refresh restores Week; invalid entry restores Today. Analyze retains its nutrition result across navigation. No hint bypasses signed-out or incomplete-profile boundaries.
- Phone/desktop screenshots in ignored `.vercel/navigation-review/` were inspected. They contain local disposable test data, are not reference assets, and are not committed.
- D2 component checks remain a separate regression gate. Existing browser coverage is Chromium; real phone safe-area/soft-keyboard behavior, Firefox/Safari and dedicated assistive technology remain unverified. D6/P11 retain integrated accessibility/browser QA.

## Human review and next actions

User-requested review correction: Save Profile and Calculate starts disabled and remains disabled until the existing profile validator and native field constraints pass, including the life-stage confirmation and the additional Lose/Gain confirmation when applicable. Changes and removals immediately recheck availability; saving remains disabled while pending. A visible associated helper explains what is missing. Controller/server validation is retained. Local browser checks passed for blank/removed required data, unticked confirmations, Maintain versus Lose/Gain, and valid completion. This narrow onboarding correction does not implement D4's progressive onboarding redesign.

1. Open the local application, sign in with a local account or create/confirm one through the local mailbox, and complete onboarding if necessary.
2. Review Today, Analyze, Week and Settings on a phone-sized viewport and desktop. The existing screen contents are deliberately not yet the complete approved D4/D5 screen designs.
3. Analyze a supported food; change destination and return. Check the result remains. Try Back/Forward, refresh on Week, and Settings Back. Confirm logout is accessible in Settings and during incomplete onboarding.
4. Local D3 review passed and commit/push was explicitly authorized by the user on 2026-11-23. Merge and production deployment remain unauthorized.
5. After CI and preview readiness, review the navigation on staging and confirm acceptance. The authenticated staging origin must already be allowlisted for Supabase auth callbacks and Turnstile; do not add speculative origins.
6. After D3 acceptance, authorize D4: authentication/recovery presentation, progressive five-stage onboarding with atomic final save, Analyze/calculator states/results/log feedback and Today presentation. D5 owns Week/Settings detail; D6 owns integrated conformance/QA. No D4/D5 screen implementation began here.

Recommended eventual commit: `Revise V2 mobile app navigation`.
