# CalorieCheck V2 Low-Fidelity Wireframe Baseline

**Created:** 2026-11-02<br>
**Phase:** V2-D0 — User Design Plan and Mockup Approval Gate<br>
**Status:** APPROVED V2-D0 BASELINE — VISUAL APPROVAL 2026-11-03<br>
**Authorization boundary:** These wireframes define information hierarchy and interaction intent only. They do not authorize production HTML, CSS, JavaScript, provider, database, or deployment changes.

The user visually approved the complete isolated prototype and this baseline on 2026-11-03. The current screenshot-based visual reference batch is ingested. Optional hands-on behavioral research is deferred, and Lose/Gain production calculation remains gated by the separate V2-G0 plan.

## 1. How to read these wireframes

- Boxes represent regions, not final card styling.
- Bracketed values such as `[consumed]` are dynamic placeholders, not fabricated user or nutrition data.
- Controls and text are intentionally explicit so accessibility and scope can be reviewed before visual styling.
- Mobile is the source layout. Tablet and desktop rearrange the same content without changing destinations or journeys.
- CalorieCheck keeps its light, deep-navy, premium-blue identity. The external references contribute principles only.
- Food imagery, dark mode, rings, exercise calories, meal categories, streaks, and social features are absent by design. Unsupported goal calculations are never presented as available; recognized future goal concepts may be shown truthfully as unavailable pending an approved method.

## 2. Approved information architecture

```text
SIGNED OUT
├── Welcome
├── Log In
├── Create Account
├── Forgot Password
├── Verification Pending
├── Reset Requested
├── Update Password
└── Auth Error / Session Expired

AUTHENTICATED BUT INCOMPLETE
└── Onboarding
    ├── 1 Personal information
    ├── 2 Body measurements
    ├── 3 Activity level
    ├── 4 Goal and local-day inputs
    └── 5 Review estimated target

AUTHENTICATED AND ONBOARDED
├── Today
│   ├── Daily calorie progress
│   ├── Nutrition totals
│   ├── Today's food log
│   └── Log edit/delete actions
├── Analyze
│   ├── Search / Advanced Input
│   ├── Analyzing
│   ├── Ambiguous match
│   ├── Needs amount
│   ├── Result / serving adjustment
│   └── Explicit Add to Today's Log
├── Week
│   ├── Average summary
│   └── Monday–Sunday semantic list
└── Settings
    ├── Profile and target inputs
    ├── Target methodology/limitations
    ├── Log out
    └── Delete account
```

## 3. Navigation and history contract

### Primary destinations

- Today
- Analyze
- Week
- Settings

### Same-document behavior

- Use an allowlisted destination value conceptually equivalent to `today`, `analyze`, `week`, or `settings`.
- History entries contain destination state only—never user IDs, dates of birth, foods, nutrition values, tokens, or other private data.
- A safe query-state convention such as `?view=today` may expose the destination name but never bypass authentication or load data before session restoration.
- Existing `?auth=confirm` and `?auth=recovery` processing takes priority. Auth parameters are sanitized and removed using the established callback flow before normal private navigation resumes.
- Invalid or missing destination state falls back to Today for an onboarded authenticated user.
- Signed-out and incomplete-profile users cannot use a destination hint to bypass login or onboarding.
- Back/Forward restores the previous primary destination and moves focus to the destination heading.
- Refresh restores the allowlisted destination after authentication and profile state resolve.
- Dialogs, validation messages, expanded details, and serving adjustments do not create browser-history entries.
- No path-based private routes or publicly useful deep links are introduced.

## 4. Shared mobile frame

```text
┌──────────────────────────────────┐
│ CalorieCheck              [Acct] │  compact app header
├──────────────────────────────────┤
│                                  │
│  Destination heading             │
│  Supporting context              │
│                                  │
│  Scrollable destination content  │
│                                  │
│  [status / recovery when needed] │
│                                  │
├──────────────────────────────────┤
│ Today  Analyze  Week  Settings   │  persistent labeled navigation
└──────────────────────────────────┘
```

Rules:

- The bottom navigation appears only after authentication and completed onboarding.
- Labels remain visible; optional local SVG icons are supplementary and `aria-hidden` when the label already names the destination.
- The current destination uses `aria-current="page"` or equivalent semantics.
- The main region receives focus after a user-initiated destination change.
- Navigation respects safe-area inset and must not obscure focused content at 320 CSS px reflow.
- Log out lives in Settings rather than competing with primary navigation.

## 5. Authentication wireframes

### 5.1 Signed-out entry

```text
┌──────────────────────────────────┐
│ CalorieCheck                     │
├──────────────────────────────────┤
│ PRIVATE NUTRITION TRACKING       │
│ Your nutrition space starts     │
│ here.                            │
│                                  │
│ Sign in to analyze food and keep │
│ your private daily history.      │
│                                  │
│ [        Log In              ]   │
│ [      Create Account        ]   │
│                                  │
│ Demo nutrition dataset           │
└──────────────────────────────────┘
```

Principles: one clear decision, no dashboard preview, no misleading public calculator, no social-login controls.

### 5.2 Log in / Create account / Forgot password

```text
┌──────────────────────────────────┐
│ ← Back                           │
│                                  │
│ Welcome back                     │
│ Log in to your private account.  │
│                                  │
│ Email                            │
│ [____________________________]   │
│ Password                         │
│ [____________________________]   │
│                                  │
│ [ Cloudflare security check ]    │
│ [inline field/form error]        │
│                                  │
│ [          Log In            ]   │
│ Forgot password?                 │
│ Create an account                │
└──────────────────────────────────┘
```

The same single-column shell supports:

- Create Account: email, password, confirmation, eight-character help, CAPTCHA.
- Forgot Password: email, enumeration-resistant explanation, CAPTCHA.
- Update Password: new password and confirmation after a valid recovery callback.

Accessibility intent:

- Persistent labels, appropriate autocomplete/input modes, useful descriptions, and programmatic error association.
- Busy submit buttons prevent duplicates and retain their accessible name.
- On invalid submission, focus moves to the first invalid control or an error summary linked to it.
- CAPTCHA remains a provider control, not decorative content.

### 5.3 Auth response states

```text
┌──────────────────────────────────┐
│              [@]                 │
│ Check your email                 │
│                                  │
│ Confirmation/reset guidance that │
│ does not reveal account status.  │
│                                  │
│ [      Return to Log In      ]   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│              [!]                 │
│ Account access unavailable       │
│ Safe, actionable explanation.    │
│                                  │
│ [        Go to Log In        ]   │
│ Request a new reset link         │
└──────────────────────────────────┘
```

This pattern covers verification pending, reset requested, expired/invalid recovery link, configuration failure, and session expiry with state-specific copy and actions.

## 6. Progressive onboarding wireframes

### 6.1 Shared step frame

```text
┌──────────────────────────────────┐
│ CalorieCheck                     │
├──────────────────────────────────┤
│ Set up your estimate             │
│ Step [n] of 5                    │
│ [████████░░░░░░░░░░]             │  labeled progress, decorative bar
│                                  │
│ Step heading                     │
│ Short explanation/limitation.    │
│                                  │
│ [field or choice group]          │
│ [field-level help/error]         │
│                                  │
│ [← Back]       [Continue →]      │
│                                  │
│ Not saved to your profile yet.   │
└──────────────────────────────────┘
```

Step rules:

- The text “Step n of 5” is authoritative; progress color is not.
- Back preserves the in-memory draft. Continue validates the current step before advancing.
- Refresh recovery may use a temporary session/local draft only if implemented with an explicit expiry/clear policy during V2-D4. The UI never says the profile is saved before final atomic completion.
- Signing out or completing onboarding clears the temporary draft.
- Browser Back within onboarding may move to the prior step if the D3 history design proves compatible; it must never create partial server records.

### 6.2 Step contents

| Step | Visible content | Required limitations |
| --- | --- | --- |
| 1 — Personal information | Display name, date of birth, source-equation sex category | Explain age eligibility and that the categories select published coefficients rather than collect gender identity |
| 2 — Body measurements | Height in cm, weight in kg | Canonical units remain authoritative; no invented health interpretation |
| 3 — Activity level | Inactive, Low active, Active, Very active | Explain approximation and show plain-language descriptions |
| 4 — Goal and local day | Select Maintain, Lose, or Gain; Lose/Gain reveal goal weight and goal date; show current/goal BMI context; timezone suggestion/correction; non-persistent eligibility confirmation | Prototype sample values are never production recommendations. BMI is screening context, not the calorie formula. No arbitrary deficit/surplus; no persistence of pregnancy/breastfeeding status |
| 5 — Review estimate | Review inputs, maintenance estimate, goal-specific estimate when approved, weight/BMI direction, goal date, methodology/source, assumptions, warnings, and Edit actions | Maintain may use the existing atomic save. Lose/Gain remain production-unavailable until V2-G0 through V2-G3 pass; the final implementation must use the same atomic history contract |

The prototype goal-screen direction is approved, but availability remains truthful by environment: all three concepts may be reviewed in the isolated prototype, while production stays Maintain-only until V2-G0 through V2-G3 pass. Prototype values such as 1,750 or 2,300 kcal are visual examples, never calculation fixtures.

### 6.3 Final review

```text
┌──────────────────────────────────┐
│ Review your estimate             │
│ Step 5 of 5                      │
│ [████████████████████]            │
│                                  │
│ About you              [Edit]    │
│ [name] · [age/source category]    │
│                                  │
│ Measurements           [Edit]    │
│ [height] · [weight]               │
│                                  │
│ Activity & local day   [Edit]    │
│ [activity] · [timezone]           │
│                                  │
│ ESTIMATED MAINTENANCE             │
│ [target] kcal/day                 │
│ Population estimate; individual   │
│ needs can differ.                 │
│ [Method and source details]       │
│                                  │
│ [ Complete Setup and Save ]       │
│ ← Back                            │
└──────────────────────────────────┘
```

Saving state keeps the review visible, marks the action busy, prevents duplicates, and provides safe retry without creating a second target row.

## 7. Today wireframes

### 7.1 Populated day

```text
┌──────────────────────────────────┐
│ CalorieCheck                     │
├──────────────────────────────────┤
│ Good [time of day], [name]       │
│                                  │
│ ←  [selected local date]  →      │
│                                  │
│ TODAY'S CALORIES                  │
│ [consumed] / [target] kcal        │  dominant relationship
│ [██████████████░░░░░]             │  labeled meter/progress
│ [remaining] kcal remaining        │  or “[amount] kcal above target”
│ Estimated maintenance target      │
│                                  │
│ Protein   Carbs      Fat          │
│ [value]   [value]    [value]      │
│ [Supporting nutrition details]    │
│                                  │
│ [      Analyze Food          ]    │
│                                  │
│ TODAY'S FOODS                     │
│ Food name              [kcal]     │
│ serving · time        [Edit] […]  │
│ ────────────────────────────────  │
│ Food name              [kcal]     │
│ serving · time        [Edit] […]  │
│                                  │
│ Demo nutrition dataset            │
├──────────────────────────────────┤
│ Today  Analyze  Week  Settings   │
└──────────────────────────────────┘
```

Hierarchy:

1. consumed of target;
2. neutral remaining/above statement;
3. Analyze action;
4. macro/supporting totals;
5. chronological logged-food list.

The target is always identified as estimated. Partial nutrients show a disclosed known partial total; unavailable values remain unavailable; numeric zero remains zero.

### 7.2 Today variants

| Condition | Summary treatment | Recovery/action |
| --- | --- | --- |
| No logs | `0 / [target] kcal`; calm empty list | Primary `Analyze Food` action |
| No target | `[consumed] kcal consumed`; no progress meter | Explain unavailable target; link to Settings or onboarding as appropriate |
| Above target | Full/clamped visual plus exact text `[amount] kcal above target` | No warning/shame color or advice |
| Historical day | Selected date emphasized; target effective for that date | Previous/next/Today controls |
| Loading | Heading/date preserved; lightweight skeleton or status text | Announced once; no fake delay |
| Network error | Existing data is not represented as current unless explicitly stale | `Try Again`; Analyze may remain usable if local calculator is available |
| Incomplete profile | No private dashboard summary | Return to required onboarding |

## 8. Analyze wireframes

### 8.1 Initial search

```text
┌──────────────────────────────────┐
│ Analyze food                     │
│ Check a supported demo food.     │
│                                  │
│ Food and amount                  │
│ [ 150g grilled chicken breast ]  │
│ [        Analyze Food        ]   │
│                                  │
│ ▸ Advanced Input                 │
│                                  │
│ Not sure which food? We'll help  │
│ you choose the closest match.    │
│                                  │
│ Examples                         │
│ [150g chicken] [1 cup rice]      │
│                                  │
│ Demo nutrition dataset            │
├──────────────────────────────────┤
│ Today  Analyze  Week  Settings   │
└──────────────────────────────────┘
```

The existing V1 search hierarchy and deterministic behavior are preserved. Submitting acknowledges immediately with “Analyzing food…”; no artificial long animation is added.

### 8.2 Ambiguous result / expanded catalog

```text
┌──────────────────────────────────┐
│ Which food did you mean?         │
│ “chicken”                        │
│ Choose a supported preparation.  │
│                                  │
│ [ Grilled Chicken Breast       ] │
│ [ grilled · source context     ] │
│                                  │
│ [ Fried Chicken                ] │
│ [ fried · source context       ] │
│                                  │
│ [ Roasted Chicken Thigh        ] │
│ [ roasted · source context     ] │
│                                  │
│ [ additional ranked choices… ]   │  page scroll, not a nested trap
│                                  │
│ ← Edit Search                    │
├──────────────────────────────────┤
│ Today  Analyze  Week  Settings   │
└──────────────────────────────────┘
```

Rules:

- No option is preselected and no preparation is guessed.
- Each choice is one comfortable control with a clear accessible name.
- Show only context useful for distinguishing supported records—name, preparation/brand when applicable, and concise source/reference context where necessary.
- Do not claim fuzzy or comprehensive search.
- Zero results use `Food not found`, explain the limited demo catalog, and offer `Edit Search`.

### 8.3 Needs amount

```text
┌──────────────────────────────────┐
│ Food identified                  │
│ How much did you have?           │
│ [Selected food]                  │
│                                  │
│ Amount            Unit           │
│ [__________]      [supported ▼]  │
│ [field error/help]               │
│                                  │
│ [    Calculate Nutrition     ]   │
│ ← Edit Search                    │
└──────────────────────────────────┘
```

Only food-specific supported units appear. No 100 g, one-piece, or one-serving default is manufactured.

### 8.4 Result and explicit save

```text
┌──────────────────────────────────┐
│ ✓ Food matched                   │
│ [Food name]                      │
│ [source description]             │
│                                  │
│ [calories] kcal                  │  strongest result value
│ [serving]                        │
│                                  │
│ Protein     Carbs       Fat      │
│ [value]     [value]     [value]  │
│                                  │
│ Adjust serving                   │
│ [−] [editable amount] [unit] [+] │
│                                  │
│ Other nutrition                  │
│ Fiber  [value/unavailable]        │
│ Sugar  [value/unavailable]        │
│ Sodium [value/unavailable]        │
│                                  │
│ Matched food: [description]       │
│ Data: Demo nutrition dataset      │
│                                  │
│ [    Add to Today's Log      ]   │
│ Added to today's log ✓            │  success disables duplicate save
│                                  │
│ [    Analyze Another Food    ]   │
└──────────────────────────────────┘
```

Save failure keeps the calculated result and provides retry. Analysis never writes automatically.

## 9. Week wireframes

### 9.1 Populated week

```text
┌──────────────────────────────────┐
│ Your week                        │
│ [Mon date – Sun date]            │
│ [← Previous] [Current] [Next →]  │
│                                  │
│ AVERAGE CALORIES                  │
│ [intake] kcal consumed            │
│ [target] kcal estimated target    │
│ Based on [n] elapsed days; target │
│ available for [m] days.           │
│                                  │
│ MON [date]                        │
│ [consumed] / [target]             │
│ [████████████░░░] [remaining]     │
│ ────────────────────────────────  │
│ TUE [date]                        │
│ [consumed] / [target]             │
│ [██████████████░] [above/remaining]│
│ ────────────────────────────────  │
│ ... exactly seven semantic rows   │
│ SUN [date] · Upcoming             │
│ No intake included yet            │
│                                  │
│ Demo nutrition dataset            │
├──────────────────────────────────┤
│ Today  Analyze  Week  Settings   │
└──────────────────────────────────┘
```

The ordered seven-day list is authoritative. Optional CSS bars are decorative/supplementary, bounded safely for above-target values, and never replace visible text.

### 9.2 Week variants

- No-history week: retain all seven dates, label elapsed zero-log and upcoming days, and explain the average denominator.
- Partial target coverage: show unavailable target per affected row and explicit coverage count.
- Loading/error: retain page heading and week context; announce state and provide `Try Again`.
- Future next-week navigation remains disabled or unavailable according to existing behavior; no hidden future-data promise.

## 10. Settings wireframes

### 10.1 Settings overview

```text
┌──────────────────────────────────┐
│ Settings                         │
│ Manage your private profile.     │
│                                  │
│ PROFILE                           │
│ Personal information         ›   │
│ Measurements                 ›   │
│ Activity and goal            ›   │
│ Local day and timezone       ›   │
│                                  │
│ YOUR ESTIMATE                     │
│ Method and limitations        ›   │
│ Changes create target history     │
│ rather than rewriting the past.   │
│                                  │
│ ACCOUNT                           │
│ Log Out                           │
│ Delete Account                ›   │
├──────────────────────────────────┤
│ Today  Analyze  Week  Settings   │
└──────────────────────────────────┘
```

Editing may use one accessible settings form or focused subsections during D5, but the existing atomic profile/target contract and historical explanation remain unchanged.

### 10.2 Log edit dialog

```text
┌──────────────────────────────────┐
│ Edit food entry                  │
│ [Food name]                      │
│ Saved unit/source context        │
│                                  │
│ Serving amount [________]        │
│ Date           [________]        │
│ Time           [________]        │
│                                  │
│ Uses the captured historical     │
│ reference; food and unit cannot  │
│ be replaced here.                │
│                                  │
│ [Cancel]      [Save Changes]     │
└──────────────────────────────────┘
```

Initial focus goes to the heading or first editable field as appropriate; Cancel/Escape closes; focus returns to the invoking entry action; failure remains inside the dialog without losing edits.

### 10.3 Delete food entry

```text
┌──────────────────────────────────┐
│ Delete food entry?               │
│ [Food name] will be permanently  │
│ removed from your log and totals.│
│                                  │
│ [Cancel]      [Delete Entry]     │
└──────────────────────────────────┘
```

The destructive action is visually and textually distinct. Cancel is the safe initial action.

### 10.4 Delete account

```text
┌──────────────────────────────────┐
│ Delete your account?             │
│                                  │
│ Permanently deletes your account,│
│ profile, target history, and food│
│ logs. This cannot be undone.     │
│                                  │
│ Type DELETE                      │
│ [____________________________]   │
│ Current password                 │
│ [____________________________]   │
│ [ Cloudflare security check ]    │
│ [safe error / throttle message]  │
│                                  │
│ [Cancel]  [Permanently Delete]   │
└──────────────────────────────────┘
```

The existing exact confirmation, current-password reauthentication, Turnstile, five-attempt/15-minute throttle, JWT validation, and server-side deletion remain mandatory. Success clears the session and returns to a signed-out completion state.

## 11. Cross-application system states

| State | Presentation | Required behavior |
| --- | --- | --- |
| Loading | Preserve heading/context; short status and optional restrained skeleton | Announce meaningful state once; prevent duplicate action |
| Slow network | After a measured delay, add “This is taking longer than expected” | Keep waiting or offer safe retry/cancel only where supported |
| Offline | “You appear to be offline” with affected action named | No offline queue; local calculator may remain available in an already loaded session; remote data is not claimed current |
| Recoverable error | Plain-language cause category and one useful action | No tokens, stack traces, provider internals, or another user's data |
| Zero search results | Food not found in current demo dataset | Edit search; do not fabricate or claim complete coverage |
| Permission denied | Generic private-data access failure | Do not reveal whether another user's record exists |
| Session expired | Explain that sign-in is required again | Clear private rendering, preserve only safe transient calculator input where practical, focus Log In |
| Validation | Field message plus optional summary | Associate programmatically; focus first invalid field; retain valid input |
| Success | Concise inline/status message near the completed action | Announce without stealing focus unnecessarily; prevent duplicate persistence |
| Configuration unavailable | Account access unavailable | Fail closed and offer only safe auth/retry guidance |

## 12. Responsive transformation wireframes

### 12.1 Tablet — same navigation and hierarchy

```text
┌──────────────────────────────────────────────────────┐
│ CalorieCheck                                  Acct   │
├──────────────────────────────────────────────────────┤
│ Today  Analyze  Week  Settings                       │  same labels/order
├───────────────────────────┬──────────────────────────┤
│ Greeting + date           │ Today's foods            │
│                           │                           │
│ Consumed / target         │ Food row                  │
│ Progress + comparison     │ Food row                  │
│                           │ Empty/error state         │
│ Nutrient summary          │                           │
│ Analyze Food              │                           │
└───────────────────────────┴──────────────────────────┘
```

### 12.2 Desktop — restrained application layout

```text
┌──────────────────────────────────────────────────────────────┐
│ CalorieCheck        Today  Analyze  Week  Settings    Acct   │
├──────────────────────────────────────────────────────────────┤
│ Page title / date / context                                  │
│                                                              │
│ ┌─────────────────────────┐  ┌─────────────────────────────┐ │
│ │ Primary summary/action  │  │ Repeated/detail content     │ │
│ │                         │  │                             │ │
│ │ Same mobile hierarchy   │  │ Same semantic list/forms    │ │
│ └─────────────────────────┘  └─────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

Rules:

- Navigation may move from bottom to a horizontal header row, but names, order, active state, and destinations do not change.
- Two columns appear only where content relationships remain clear. Auth remains a focused readable form; onboarding may pair the form with a stable step summary/explanation rather than spread fields excessively.
- Analyze result may place identity/calories/serving beside nutrition details, consistent with the V1 desktop principle.
- No permanent sidebar, dense dashboard grid, or desktop-only journey is introduced.
- At zoom/reflow widths, the layout returns to one column without loss or two-dimensional page scrolling.

## 13. Preliminary design-token direction

V2-D2 will finalize exact values. D0 approves roles and constraints:

| Token group | Direction |
| --- | --- |
| Color | Retain light background, white surface, deep navy text, muted blue-gray text, premium blue actions, and semantic success/warning/danger roles; nutrition accents remain restrained |
| Typography | System sans-serif; strong page/metric hierarchy; readable body/label/help sizes; tabular numerals where supported |
| Spacing | Reuse a small consistent mobile-first scale for page, section, field, row, and inline gaps |
| Radius | Few restrained levels; avoid nested rounded cards around every datum |
| Elevation | Border and whitespace first; soft shadow only for purposeful separation/dialogs |
| Touch | Target approximately 44 CSS px or larger for important controls |
| Focus | Clearly visible on every interactive element; never color-only or removed |
| Motion | Functional 100–200 ms transitions; no required information in animation; full `prefers-reduced-motion` handling |
| Breakpoints | Preserve current mobile-first min-width approach; choose content-driven changes and verify small phone, phone, tablet, desktop, zoom, and 320 CSS px reflow |
| Progress | Text/values authoritative; meter/CSS bars supplementary; no rings or color-only semantics |

## 14. Preliminary shared-component plan

| Pattern | Intended reuse |
| --- | --- |
| App header and labeled primary navigation | All onboarded private destinations |
| Page header / date navigator | Today and Week |
| Calorie progress summary | Today; values may inform Week summary without duplicating component semantics blindly |
| Nutrient value group | Analyze result and Today totals |
| Semantic food row | Today log and related edit/delete actions |
| Ranked match choice | Analyze ambiguity |
| Progressive-step header/actions | Onboarding |
| Labeled form field / choice group / error summary | Auth, onboarding, settings, edit dialogs |
| Status panel | Loading, empty, error, offline, session, zero results |
| Confirmation dialog | Log deletion and account deletion with distinct content/security requirements |
| Seven-day row with optional CSS bar | Week |
| Inline success/error message | Logging and settings mutations |

The plan describes shared presentation contracts, not a new component framework. Existing controllers, services, and pure domain modules retain ownership of behavior and data.

## 15. Journey-to-wireframe traceability

| Required journey | Wireframe coverage |
| --- | --- |
| Signup → verification → login | 5.1–5.3 |
| Login → session restoration | 5.2–5.3 and system-state table |
| Forgot/reset password | 5.2–5.3 |
| First profile → atomic target creation | 6.1–6.3 |
| Today glance and date review | 7.1–7.2 |
| Analyze exact match | 8.1 and 8.4 |
| Analyze ambiguity / larger catalog | 8.2 |
| Missing amount / invalid / not found | 8.2–8.3 and system-state table |
| Serving adjustment and explicit logging | 8.4 |
| Empty/populated daily log | 7.1–7.2 |
| Weekly summary and history | 9.1–9.2 |
| Profile/target settings | 10.1 |
| Log correction and deletion | 10.2–10.3 |
| Logout and hard account deletion | 10.1 and 10.4 |
| Loading/offline/slow/error/permission/session/validation/success | Section 11 |
| Tablet/desktop behavior | Section 12 |

## 16. Scope and accessibility review

- Every available wireframed control maps to implemented V2 scope. Recognized unavailable goal concepts are informational, disabled, and never presented as implemented controls.
- No reference-only feature was imported.
- Private data stays behind session restoration and profile completion.
- Every primary action has text; icons are optional and supplementary.
- Forms retain labels, help, error association, focus movement, and duplicate-submit prevention.
- Status and mutation results use appropriate live announcements without excessive interruption.
- Color and progress graphics never carry the only meaning.
- Dialogs require labeling, keyboard operation, Escape/cancel behavior where safe, focus containment, and focus return.
- The weekly list and all nutrition values remain understandable without graphics.
- Mobile is the source layout; 320 CSS px reflow and required breakpoints remain acceptance tests.
- Scientific, nutrition, source, privacy, target-history, and security wording remains governed by existing specifications.

## 17. V2-D0 acceptance review

| Acceptance requirement | Evidence | Status |
| --- | --- | --- |
| Written design plan | `V2_DESIGN_REVISION_PLAN_PROPOSAL.md` | COMPLETE |
| Architecture/product questions resolved | `V2_DESIGN_REVISION_AUDIT.md` sections 16–17 | COMPLETE; Lose/Gain assigned to V2-G0 through V2-G3 |
| Current visual-reference artifacts inventoried and interpreted | `V2_DESIGN_REFERENCES.md` | COMPLETE for screenshot-based D0 research; optional behavioral walkthrough deferred |
| Principal signed-out/authenticated journeys represented | Sections 5–10 and 15 plus `prototypes/v2-ui/` | COMPLETE and visually approved |
| Non-happy states represented | Section 11, per-screen variants, and prototype preview inventory | COMPLETE for D0 baseline |
| Responsive intent defined | Section 12 and prototype | COMPLETE for D0 baseline |
| Accessibility/scope/technical review | Sections 3, 13–16 | COMPLETE for D0; implementation must be reverified in D1–D6 |
| Maintain/Lose/Gain scope reconciled | `V2_DESIGN_REVISION_AUDIT.md` section 17 and `V2_LOSE_GAIN_TARGET_PLAN.md` | COMPLETE for roadmap placement; production methodology remains a V2-G0 blocker |
| User explicitly approves complete D0 baseline | User approval on 2026-11-03 | **COMPLETE** |

## 18. D0 closeout

V2-D0 closed on 2026-11-03. The user approved the complete isolated prototype visually, deferred the optional hands-on behavioral walkthrough, and authorized V2-G0 as the separate Lose/Gain scientific/product gate. This approval authorizes later design implementation through the documented phase sequence; it does not authorize prototype sample calorie values or unvalidated production target logic.
