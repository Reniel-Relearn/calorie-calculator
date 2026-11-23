# V2-D2 Visual Foundations and Shared Components

**Date:** 2026-11-23 (Asia/Manila)
**Status:** IMPLEMENTED AND VERIFIED LOCALLY — LOCAL VISUAL APPROVAL RECEIVED 2026-11-23; STAGING SAMPLE ACCEPTANCE PENDING.
**Prerequisite:** D1 approved by the user; committed/pushed as `5ee3340` (`Map V2 interface revision work`). All five PR checks passed and its preview reached Ready.
**Scope:** Shared runtime presentation and an isolated component specimen. No screen navigation, progressive onboarding, backend, domain calculations, data catalog, or production deployment changes.

## Review the implementation

Run `npm.cmd run dev` and open [the component specimen](http://localhost:5173/prototypes/v2-foundations/). Use the printed port if Vite selects a different one. The specimen requires neither Docker nor Supabase. Its values and interactions are explicitly labeled design examples; they never authenticate, calculate nutrition, or save data.

Review phone and desktop layouts; button size/hierarchy, field/choice appearance, text density, feedback colors, card borders/radii, and focus. Try feedback actions, field validation, radio/checkbox controls, amount-control examples, native details, and the dialog's Close/Escape/focus-return behavior. Enable reduced motion to review stationary loading indicators.

This specimen shares runtime CSS; it is not a second implementation of the styling system. `specimen.css` owns only its review-page composition. Vite builds `index.html` and `prototypes/v2-foundations/index.html` as two entries, with hashed local CSS/JS/SVG assets. The specimen path can therefore be reviewed on a Vercel preview after explicit commit/push. It is not linked from the public application and has a noindex meta tag. Review-page copy does not enter application flows.

The revised specimen amount control uses matching 52px input/button heights at the default font size, 12px gaps, and centered original SVG minus/plus symbols. Native spinner arrows are visually hidden only in this example; the numeric input retains direct editing, keyboard arrows, quarter steps, and its visible focus outline. Runtime serving units and increments remain unchanged until the calculator screen integration.

## Token mapping

The production namespace remains `--color-*`, `--space-*`, and `--radius-*`. Prototype `--ink`/`--blue`/`--canvas` roles were mapped into this existing namespace, rather than adding a parallel theme. Light mode remains the only supported theme.

| Role | Runtime token / value | Use |
| --- | --- | --- |
| Canvas / surface | `--color-background: #f4f7fb`; `--color-surface: #ffffff` | Pale page canvas, white task surfaces |
| Essential / supporting / label text | `--color-text: #101b38`; `--color-text-muted: #5e6b86`; `--color-label: #34425e` | Navy hierarchy and readable secondary content |
| Placeholder | `--color-placeholder: #65718b` | Supporting prompt; never a label replacement |
| Structural / control boundary | `--color-border: #dce4f0`; `--color-border-strong: #7c8ba3` | Light surface separators vs stronger visible input/control outlines |
| Action / active / soft surface | `--color-primary: #1565d8`; `--color-primary-dark: #0e4fae`; `--color-primary-soft: #edf4ff` | Primary buttons, links, selection context |
| On action | `--color-on-primary: #ffffff` | White primary/danger button labels |
| Success | `--color-success: #096b5c`; `--color-success-soft: #dcf7ef` | Confirmed outcomes with text and check icon |
| Warning | `--color-warning: #875000`; `--color-warning-soft: #fff5e3` | Attention/context with wording and symbol |
| Error / active danger | `--color-danger: #b4233a`; `--color-danger-dark: #8e1b2f`; `--color-danger-soft: #fff0f2` | Field errors and consequential actions |
| Disabled | `--color-disabled: #617087`; `--color-disabled-surface: #edf1f6` | Explicit unavailable styling; busy also has `aria-busy` and progress cursor |
| Focus | `--color-focus: #0e4fae` | Three-pixel outline; no hover dependency |
| Elevation | `--shadow-soft`, `--shadow-dialog`, `--color-backdrop` | Restrained separation; existing dialog backdrop/elevation share tokens |
| Radius | small `0.75rem`, medium `1.1rem`, large `1.5rem`, pill `999px` | Controls, grouped feedback, surfaces, circular/pill details |
| Spacing | Existing `--space-1` through `--space-10`; added `--space-12: 3rem` | Existing quarter-rem scale extended for section spacing |
| Type | System sans stack; body `1rem`, small `0.875rem`, title/metric fluid tokens | No remote font or font package; tabular metric numerals |
| Interaction size | `--touch-target: 2.75rem`, `--control-height: 3.25rem` | At least practical 44 px targets; normal fields 52 px |
| Functional transitions | `--motion-fast: 120ms`, `--motion-duration: 180ms` | Color/border/shadow changes and existing state reveal; zero duration with reduced motion |

Exact prototype colors are not copied blindly: the input border is darker to meet measured non-text contrast. The focus color remains a contrast-checked blue instead of the prototype's unverified amber. Existing screen-specific grids and responsive breakpoints remain intact until their assigned phases.

## Shared patterns and ownership

- `css/main.css`: tokens, system typography, wrapping headings, focus, links, disabled cursor, reduced-motion durations; existing page containers retained.
- `css/components.css`: shared primary/secondary/text/danger/icon buttons; controls/placeholder styling; field help; surfaces; local icons; informational/success/warning/error messages; loading/empty panels; decorative skeleton; native meter presentation; forced-color boundaries. Secondary button and field-help rules moved here from auth CSS so they can be reused independently.
- `css/auth.css`: auth-specific layout remains; duplicate shared button/help definitions removed.
- `css/profile.css`: existing native radio/checkbox choice-card patterns remain available; field legends use the shared label token.
- `css/settings.css`: settings-specific layout remains; label/danger/dialog colors and elevation use shared tokens; disabled danger hover no longer overrides disabled styling.
- `assets/icons/interface.svg`: ten local decorative symbols; provenance/usage in `assets/icons/README.md`.
- `prototypes/v2-foundations/`: review-only HTML/CSS/module interactions; no Supabase imports, remote assets, nutritional calculations, or persistence.
- `tests/helpers/browser.mjs`: isolated temporary Chrome profile and random local CDP port for visual checks, with bounded cleanup. Existing auth harness remains unchanged.
- `tests/integration/design-foundations.mjs`: local-only behavioral/reflow/contrast/asset checks; command `npm.cmd run test:design:local`.

Loading graphics do not introduce an artificial delay. Skeleton/spinner motion stops for `prefers-reduced-motion`; text continues to explain loading. Color supplements labels/icons. Disabled controls use native disabled behavior. Existing semantic form controls, required IDs, calculator state handling, and service/controller boundaries remain authoritative.

## Verification evidence

| Gate | Result on 2026-11-23 |
| --- | --- |
| `npm.cmd run check` | PASS: all 140 existing JavaScript tests, including frozen V1 regression and G3 safeguards; two-entry production build; npm audit 0 vulnerabilities; security scan passed. |
| `npm.cmd run test:design:local` on Vite development server | PASS: 16 grouped browser checks; no asset failures, exceptions, or external service/asset requests. |
| Same browser suite on `npm.cmd run preview` built artifact | PASS: same grouped checks, including hashed SVG symbol resolution and bundled CSS/JS. |
| Responsive specimen matrix | PASS at 320×568, 360×800, 390×844, 430×932, 768×1024, 820×1180, 1024×768, 1280×800, 1440×900, 1920×1080, and 1280×600. No page overflow; tested important controls ≥44 px. |
| Contrast | PASS: 12 normal-text token pairs ≥4.5:1; lowest measured 4.839:1. Focus/control-boundary pairs ≥3:1. These are checked shared-token combinations, not a claim that every eventual screen is certified. |
| Keyboard/semantics | PASS: labels, unique IDs, accessible input/button names, native disclosure activation, dialog Escape/focus return, visible Tab focus, inline validation and amount-control examples. |
| Motion and scaling | PASS: spinner/skeleton disabled under reduced motion; control transitions become zero; 200% root text scaling and 400%-equivalent 320 px layout reflow. These are emulated checks, not native browser zoom certification. |
| Existing authenticated local browser integration | PASS: signup, confirmation, onboarding, Maintain/Lose/Gain Settings, captured-snapshot log edit/delete, Today/Week refresh, account deletion, session restoration, recovery, and bad-link handling. Used the verified local-only environment and local Supabase stack. |
| Visual inspection | Agent inspected phone and desktop specimen screenshots; no clipping or broken icon assets in reviewed captures. Evidence is local under ignored `.vercel/design-review/`, not committed reference imagery. |
| Diff/security inspection | PASS: whitespace and secret scan; no controller/service/domain/data/migration changes. Research PDFs remain excluded. |
| Human local/staging component approval | Local review APPROVED by the user on 2026-11-23; commit/push explicitly authorized. Staging review PENDING. D2 is not marked DONE. |

The helper originally required headless-page focus emulation and proper waits for native event completion; the production UI did not need a behavioral workaround. The built-artifact checks handle Vite's combined stylesheets and shorthand hex colors. New verification code passes with these corrections.

No new database migration was required; database assertions were not rerun solely for CSS. The existing authenticated local journey was rerun because shared styles affect its controls. Firefox, Safari, real touch/soft-keyboard behavior, and dedicated assistive-technology testing remain unverified in this pass. Full integrated design/accessibility/browser QA remains D6 and the subsequent QA phases.

## Review and next phase

1. Local component review approved by the user on 2026-11-23, including the revised amount controls.
2. Commit/push explicitly authorized by the user; verify PR checks and preview readiness before hosted acceptance.
3. After that push passes CI, review `/prototypes/v2-foundations/` on its Ready Vercel preview and confirm staging visual acceptance. No new Supabase/Turnstile hostname is needed for the specimen alone because it does not authenticate or call providers.
4. Only after D2 acceptance, authorize D3: add guarded same-document Today/Analyze/Week/Settings navigation, header/logout placement, active state, focus/skip links, Back/Forward/refresh behavior, and responsive/safe-area shell. No full-screen D4/D5 or backend work starts in D2.

Recommended eventual D2 commit: `Build V2 visual foundations`.
