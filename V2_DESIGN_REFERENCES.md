# CalorieCheck V2 Design Reference Register

**Created:** 2026-11-02<br>
**Updated:** 2026-11-03<br>
**D0-C visual-reference status:** COMPLETE FOR THE CURRENT BATCH<br>
**Behavioral UX research status:** DEFERRED — D0 closed without inferring hidden Lose It! behavior<br>
**Interpretation rule:** Borrow principles. Do not copy product-specific expression, trademarks, branded graphics, exact layouts, exact colors, proprietary illustrations, navigation, or feature scope.

## 1. Evidence boundary

This register documents only what is visible in the ten local artifacts under `assets/reference/v2-ui/` and the source sets recorded in `assets/reference/v2-ui/links.txt`.

The artifacts were gathered from official browser/store materials, but `links.txt` does not map each local file to one exact originating page. Each artifact therefore records the applicable official source set without inventing a one-to-one URL attribution.

The screenshots establish **visual-reference research**:

- visible information hierarchy;
- visible spacing, typography, density, cards, lists, progress, navigation, and nutrition presentation;
- visible mobile/touch affordances and accessibility risks.

They do **not** establish behavioral UX research. This register does not infer:

- what happens after a control is activated;
- gesture, animation, focus, keyboard, screen-reader, loading, retry, validation, persistence, or back-navigation behavior;
- whether a marketing composite exactly matches a currently released product build;
- whether a cropped screen contains additional content outside the image;
- whether apparently interactive elements are enabled, configurable, or available on every platform or plan.

Until a real-app walkthrough is supplied, CalorieCheck interaction behavior remains governed by its own requirements, implemented contracts, wireframes, accessibility rules, and security boundaries.

## 2. Reference hierarchy and recorded sources

1. **Lose It! — primary product/UX visual influence.** Use for Today hierarchy, diary scanning, date context, progress relationships, and persistent mobile destinations.
2. **Apple Fitness — secondary visual influence.** Use for glanceability, hierarchy, whitespace, restrained density, progress treatment, and premium health-app presentation.
3. **Cronometer — secondary information-design influence.** Use for explicit nutrition labels, diary/data rows, units, detailed metrics, and dense-but-structured reporting.
4. **CalorieCheck V1 and current V2 contracts — authoritative product boundary.** These override every external reference.

Recorded official source sets:

- **Lose It!:** <https://play.google.com/store/apps/details?id=com.fitnow.loseit>, <https://www.loseit.com/>, and <https://apps.apple.com/us/app/lose-it-calorie-counter/id297368629>
- **Apple Fitness:** <https://apps.apple.com/us/app/apple-fitness/id1208224953> and <https://www.apple.com/apple-fitness-plus/>
- **Cronometer:** <https://play.google.com/store/apps/details?id=com.cronometer.android.gold&hl=en_CA> and <https://cronometer.com/gold/>

## 3. Lose It! artifact analysis — primary visual reference

### 3.1 `lose-it/01-home-today.jpg` — home/today marketing composite

- **Source:** Lose It! official source set above; exact source page is not mapped in `links.txt`.
- **Intended CalorieCheck screen:** Today overview and relationship between the day summary, diary, weekly context, and primary navigation.
- **Information hierarchy:** Large promotional headline dominates the overall artifact. Within the visible phones, date context sits first; a calorie summary precedes meal/log details; secondary macro and weekly cards follow.
- **Spacing:** Generous outer promotional spacing; inside the phones, compact gaps separate large white surfaces and denser rows.
- **Typography:** Bold, very large marketing text outside the product; inside, strong section labels, prominent numbers, and smaller contextual labels.
- **Visual density:** Mixed. The day summary is glanceable, while the phone content below becomes dense through cards, charts, and food rows.
- **Progress presentation:** Visible semicircular calorie gauges, weekly vertical bars, and small nutrient bars. Values and labels accompany the graphics.
- **Navigation observations:** A bottom navigation with labeled destinations is visible. The image does not prove selection, history, refresh, or transition behavior.
- **Card/list patterns:** Large summary cards sit above grouped diary rows. The artifact shows repeated white cards on a pale surface.
- **Nutrition presentation:** Calories are dominant; protein and fiber appear as supporting progress values; foods show serving context.
- **Touch/mobile observations:** Primary destinations appear placed within thumb reach and labels remain visible. Exact target sizes cannot be verified from the composite.
- **Accessibility risks:** Small secondary labels, reliance on green/red/color-coded progress, tilted/cropped phone views, and dense chart content could reduce readability. Marketing imagery is not an accessibility specification.
- **BORROW THE PRINCIPLE:** Put date and one dominant day summary before the food log; keep four labeled destinations reachable; pair progress with text; let repeated food rows scroll naturally.
- **DO NOT COPY THE EXPRESSION:** Do not copy Lose It! branding, orange palette, food photography, phone composition, semicircular gauge geometry, meal grouping, exercise calories, exact tab bar, or promotional language.

### 3.2 `lose-it/02-macros.jpg` — full-phone macro dashboard

- **Source:** Lose It! official source set; exact source page is not mapped.
- **Intended CalorieCheck screen:** Today supporting-nutrition area and possible Week-summary visual hierarchy.
- **Information hierarchy:** Date/header, calorie card, two supporting nutrient cards, a macronutrient card, and a small streak area descend in that order.
- **Spacing:** Consistent card gutters and rounded surfaces; relatively small internal spacing preserves a large amount of information.
- **Typography:** Short card titles and bold values lead; units and supporting labels are smaller.
- **Visual density:** Medium-high because multiple metrics and graphics share one phone viewport.
- **Progress presentation:** A calorie gauge, seven-day bars, nutrient arcs, a macro composition graphic, and streak indicators are visible.
- **Navigation observations:** Four labeled bottom destinations are visible. No interaction behavior can be inferred.
- **Card/list patterns:** Modular dashboard cards; primary card spans the width while supporting cards use a two-column grid.
- **Nutrition presentation:** Calories remain first; protein and fiber receive separate progress cards; macro proportions appear below.
- **Touch/mobile observations:** The vertical sequence supports one-handed scrolling, but card overflow controls and small chart details may be difficult to target or read.
- **Accessibility risks:** Multiple graph forms increase cognitive load; thin segments and color distinctions may fail without text; the two-column cards can become narrow on small phones.
- **BORROW THE PRINCIPLE:** Use one dominant calorie relationship followed by a restrained supporting nutrient group; maintain consistent titles, values, and units.
- **DO NOT COPY THE EXPRESSION:** Do not reproduce gauges, donuts, streaks, two-column dashboard density, branded colors, or the exact metric mix.

### 3.3 `lose-it/03-macros-detail.jpg` — close macro/progress composition

- **Source:** Lose It! official source set; exact source page is not mapped.
- **Intended CalorieCheck screen:** Detail reference for Today calorie hierarchy and optional Week progress treatment.
- **Information hierarchy:** Date context, calorie progress and seven-day bars, then large protein/fiber cards and a macronutrient section.
- **Spacing:** Large rounded cards overlap in the marketing composition; the underlying screen uses narrow gutters and compact card spacing.
- **Typography:** Large centered progress values, bold nutrient names, and explicit gram totals.
- **Visual density:** High. Several visualizations compete within the crop.
- **Progress presentation:** Semicircular arcs, daily vertical bars, a pie-like composition visual, and stacked bars.
- **Navigation observations:** Navigation is not fully visible in the crop and no behavior is demonstrated.
- **Card/list patterns:** Large metric cards with overflow menus; the marketing crop visually lifts cards above the phone rather than showing a literal in-app layout.
- **Nutrition presentation:** Nutrient name, delta/relationship, consumed amount, and target amount are co-located.
- **Touch/mobile observations:** Large cards are visually prominent, but overflow icons and chart segments are small. The lifted-card composition must not be treated as an actual interaction.
- **Accessibility risks:** Color carries substantial meaning; “over/under” framing can become judgmental; arc graphics and overlapping cards may obscure reading order.
- **BORROW THE PRINCIPLE:** Keep nutrient name, value, unit, and relationship together; retain visible text for every graphical summary.
- **DO NOT COPY THE EXPRESSION:** Do not use lifted/overlapping marketing cards, copied arcs, pie charts, stacked bars, over/under coaching language, or menu placement without a CalorieCheck requirement.

### 3.4 `lose-it/04-food-log.jpg` — food-log marketing view

- **Source:** Lose It! official source set; exact source page is not mapped.
- **Intended CalorieCheck screen:** Today food log and its row hierarchy.
- **Information hierarchy:** Date, calorie budget summary, small nutrient progress, grouped meal headings, then food name, serving, and calorie values.
- **Spacing:** Summary content is spacious; food rows are tighter, with clear vertical alignment and separation.
- **Typography:** Meal headings are bold; food names are medium-weight; serving details are muted; calories align on the trailing edge.
- **Visual density:** Medium-high but highly scannable because rows repeat a stable pattern.
- **Progress presentation:** One dominant calorie gauge with two smaller nutrient bars.
- **Navigation observations:** The bottom navigation is outside the main crop. A floating plus control is visible; its behavior is not demonstrated.
- **Card/list patterns:** A summary card precedes sectioned meal lists. Each row uses an optional image, two text lines, and a trailing calorie value.
- **Nutrition presentation:** Per-row calories are prominent, while serving information provides context. Meal totals appear in section headings.
- **Touch/mobile observations:** Full-width rows appear easier to target than tiny chart elements. The visible floating action sits within thumb reach but may cover content.
- **Accessibility risks:** Food thumbnails are decorative and inconsistent as identity cues; small serving text may be hard to read; section expansion state and overflow-menu names are not visible; color-coded progress needs text alternatives.
- **BORROW THE PRINCIPLE:** Use stable, scannable rows with food name first, serving context second, and calories aligned consistently; keep the day's summary before repeated entries.
- **DO NOT COPY THE EXPRESSION:** Do not add meal categories, food thumbnails, exercise accounting, a floating add button, the exact summary gauge, or section behavior not present in CalorieCheck requirements.

### 3.5 `lose-it/05-goals.jpg` — goals/weight-trend marketing view

- **Source:** Lose It! official source set; exact source page is not mapped.
- **Intended CalorieCheck screen:** Only a cautionary reference for goal hierarchy and metric labeling; not authorization for weight tracking or Lose/Gain calculations.
- **Information hierarchy:** Goals title and time-range selector lead; a weight chart follows; a lifted metric card summarizes current weight, change, rate, and milestone; custom goals appear below.
- **Spacing:** Large white chart/card surfaces with roomy metric spacing and compact range tabs.
- **Typography:** Very large numerical values with smaller units and labels; headings are strong and brief.
- **Visual density:** Medium. Four summary metrics occupy a large card, while the chart is visually light.
- **Progress presentation:** Time-series line, current/goal markers, directional arrows, and milestone metrics.
- **Navigation observations:** Time-range labels and a Plan label are visible; no behavior is demonstrated.
- **Card/list patterns:** One main chart card and a four-metric summary card.
- **Nutrition presentation:** Not applicable; this is weight-goal information.
- **Touch/mobile observations:** Range labels and overflow icons may be small; large metrics scan quickly.
- **Accessibility risks:** Trend direction relies partly on arrows/color; weight-loss framing may be inappropriate or unsupported; chart values and time-series meaning need text equivalents.
- **BORROW THE PRINCIPLE:** Use clear metric labels, units, and concise contextual time ranges when CalorieCheck presents supported historical data.
- **DO NOT COPY THE EXPRESSION:** Do not add weight tracking, milestones, rate coaching, Lose/Gain calculations, goal charts, orange branding, or custom-goal features.

## 4. Apple Fitness artifact analysis — secondary glanceability reference

### 4.1 `apple-fitness/01-summary.png` — summary screen

- **Source:** Apple Fitness official source set; exact source page is not mapped.
- **Intended CalorieCheck screen:** Today hierarchy and premium, glanceable mobile composition.
- **Information hierarchy:** Large page title/date, one dominant summary card, two smaller supporting cards, then lower-priority content; persistent navigation sits at the bottom.
- **Spacing:** Generous page margins and clear vertical gaps; cards use ample internal padding.
- **Typography:** Strong page heading, medium card titles, highly prominent numbers, compact units, and subdued secondary labels.
- **Visual density:** Moderate. The top viewport is information-rich but each region has a clear role.
- **Progress presentation:** Activity Rings dominate, with colored values and small time plots in supporting cards.
- **Navigation observations:** Four icon-and-label destinations are visible. Selection behavior is not demonstrated.
- **Card/list patterns:** One wide primary card, two equal supporting cards, and a large media card.
- **Nutrition presentation:** None; the value is the hierarchy, not the metric content.
- **Touch/mobile observations:** Large cards and labeled bottom destinations appear touch-friendly; chevron controls are visible but exact target sizes are unknown.
- **Accessibility risks:** Black background with saturated colors requires verified contrast; rings and color are brand-specific; small plots and colored units may not communicate enough without text.
- **BORROW THE PRINCIPLE:** Use a strong page title, one dominant summary, generous whitespace, clear supporting hierarchy, and labeled persistent navigation.
- **DO NOT COPY THE EXPRESSION:** Do not copy Activity Rings, Apple typography, black theme, neon palette, exact card layout, avatars, media imagery, or navigation.

### 4.2 `apple-fitness/02-categories.png` — all-categories list

- **Source:** Apple Fitness official source set; exact source page is not mapped.
- **Intended CalorieCheck screen:** Settings category grouping and accessible long-list rhythm.
- **Information hierarchy:** Back context, large page title, then one continuous list of labeled rows with leading icons and trailing chevrons.
- **Spacing:** Consistent row height, divider inset, and generous touch spacing within one grouped surface.
- **Typography:** Large page title; simple, readable row labels; no competing secondary descriptions.
- **Visual density:** Medium. Many choices fit on one screen without shrinking the row labels.
- **Progress presentation:** None.
- **Navigation observations:** A back label and bottom navigation are visible. No transition behavior is demonstrated.
- **Card/list patterns:** One rounded list container with repeated rows rather than separate cards for every option.
- **Nutrition presentation:** None.
- **Touch/mobile observations:** Rows appear full-width and comfortably targetable; icons support recognition but text remains present.
- **Accessibility risks:** Icon color and shape must not replace labels; thin dividers may disappear at some contrast levels; chevrons need accessible names through the row label rather than separate unnamed controls.
- **BORROW THE PRINCIPLE:** Prefer grouped, full-width settings rows with stable alignment and text labels; use icons only as supplementary cues.
- **DO NOT COPY THE EXPRESSION:** Do not copy Apple symbols, black theme, lime accent, exact category order, chevrons, navigation, or rounded group styling.

### 4.3 `apple-fitness/03-trends.png` — trends screen

- **Source:** Apple Fitness official source set; exact source page is not mapped.
- **Intended CalorieCheck screen:** Week explanatory hierarchy and neutral interpretation of historical values.
- **Information hierarchy:** Large title, positive/attention section headings, compact trend cards, then explanatory body copy.
- **Spacing:** Wide outer margins and generous separation between section groups; cards have compact internal padding.
- **Typography:** Large page title, bold section headings, concise metric labels, prominent values, and smaller explanatory text.
- **Visual density:** Low-medium. Only a few metrics are shown, leaving substantial whitespace.
- **Progress presentation:** Directional arrows with value/unit pairs; no large chart in the visible artifact.
- **Navigation observations:** Back context and three labeled bottom destinations are visible. Behavior is not demonstrated.
- **Card/list patterns:** Small cards for concise metrics and one larger explanatory/attention card.
- **Nutrition presentation:** None.
- **Touch/mobile observations:** Large page regions are easy to scan; small directional symbols are supplementary to values and labels.
- **Accessibility risks:** “Keep it Going” and directional coaching can become judgmental; arrows and color cannot carry trend meaning alone; explanatory copy appears relatively small and low-contrast.
- **BORROW THE PRINCIPLE:** Pair weekly values with concise neutral explanations, use whitespace to separate summary from detail, and keep metric labels/units explicit.
- **DO NOT COPY THE EXPRESSION:** Do not copy coaching language, trend categories, arrows, black theme, neon colors, exact cards, or Apple navigation.

## 5. Cronometer artifact analysis — secondary nutrition/information reference

### 5.1 `cronometer/01-trends-report.png` — nutrition report comparison

- **Source:** Cronometer official source set; exact source page is not mapped.
- **Intended CalorieCheck screen:** Analyze nutrition detail and possible Week information hierarchy.
- **Information hierarchy:** App/report navigation and date range lead; expandable calorie sections contain one total graphic and a table of component values and percentages.
- **Spacing:** Large report sections are separated by whitespace and pale dividers; the internal tables are compact.
- **Typography:** Strong report headings; prominent central calorie totals; colored nutrient labels; tabular numbers and percentages.
- **Visual density:** High but structured. Each report section combines a chart and table.
- **Progress presentation:** Donut charts encode composition; percentages and numeric values provide textual support.
- **Navigation observations:** The two visible variants show different top and bottom navigation structures, which suggests version/platform differences but does not prove chronology or behavior.
- **Card/list patterns:** Large expandable report sections and bordered metric tables.
- **Nutrition presentation:** Explicit calorie units, macro component names, absolute calorie contributions, and percentages.
- **Touch/mobile observations:** Large section headers appear targetable; tabs, overflow icons, and chart/table content can be crowded on small screens.
- **Accessibility risks:** Donut segments rely on color; small tables may not reflow well; the artifact shows alcohol, burned calories, BMR, exercise, activity level, and TEF outside CalorieCheck scope; collapsible semantics are not visible.
- **BORROW THE PRINCIPLE:** Keep nutrient names, values, units, and percentages aligned; organize detail under clear headings; pair visuals with complete textual values.
- **DO NOT COPY THE EXPRESSION:** Do not copy donut charts, orange branding, report tabs, burned-calorie decomposition, floating add control, exact metric tables, or collapsible behavior.

### 5.2 `cronometer/02-today-trends.png` — diary and trends comparison

- **Source:** Cronometer official source set; exact source page is not mapped.
- **Intended CalorieCheck screen:** Today food rows and Analyze/Today nutrient target rows.
- **Information hierarchy:** In the diary view, date and three calorie totals lead, followed by category headers and detailed food rows. In the report view, calorie composition leads, followed by collapsible sections and progress rows for nutrient targets.
- **Spacing:** Diary rows are compact and repeat tightly; report sections use more whitespace and larger headings.
- **Typography:** Food names lead rows; timestamp/serving details are smaller; calorie values align right. Report rows show nutrient name, consumed/target values, and percentage.
- **Visual density:** High, especially in the diary. The stable alignment keeps it scannable despite the density.
- **Progress presentation:** Three equal donut totals in the diary, a calorie composition donut in the report, and horizontal target bars.
- **Navigation observations:** Labeled bottom navigation and a prominent centered plus control are visible. The two platform/device views differ; interaction behavior is not demonstrated.
- **Card/list patterns:** Category headers, repeated diary rows, collapsible report sections, and horizontal progress rows.
- **Nutrition presentation:** Explicit food serving context, timestamps, per-item calories, consumed/target numbers, percentages, and nutrient names.
- **Touch/mobile observations:** Full-width food rows and section headings are suitable for touch; plus controls are prominent but may obscure content; dense secondary text may be difficult on small phones.
- **Accessibility risks:** Equal-weight Consumed/Burned/Remaining conflicts with CalorieCheck's hierarchy; color-coded rings/bars require text alternatives; small timestamps/serving text and tightly packed rows may reduce readability; meal/category grouping is outside current scope.
- **BORROW THE PRINCIPLE:** Align food names, serving context, and trailing calories consistently; show nutrient labels, values, units, and percentages together; use horizontal bars only as supplements to text.
- **DO NOT COPY THE EXPRESSION:** Do not copy three equal calorie rings, meal/category grouping, exercise data, floating add button, exact bottom navigation, apple food icons, dense target dashboard, or orange palette.

## 6. Principles extracted by product

### Lose It! — primary product/UX influence

- Show selected date and daily calorie status before detailed entries.
- Keep repeated food entries vertically scannable with stable name, serving, and calorie alignment.
- Use persistent labeled mobile destinations within thumb reach.
- Use progressive disclosure: the primary calorie relationship first, supporting nutrients later.
- Preserve text alongside every progress graphic.
- Permit natural vertical scrolling rather than shrinking rows to fit a dashboard.

### Apple Fitness — secondary hierarchy and premium-presentation influence

- Establish one unmistakable primary summary before supporting information.
- Use generous whitespace, strong headings, prominent numbers, and subdued explanatory text.
- Prefer grouped lists over many isolated cards for settings-like destinations.
- Let a small number of supporting metrics scan quickly instead of filling every gap.
- Use neutral explanatory text with visible values and units.

### Cronometer — secondary nutrition/information-design influence

- Keep nutrient names, numbers, units, percentages, and targets explicit.
- Align dense repeated data predictably.
- Separate diary scanning from deeper nutrition reporting.
- Pair all charts/bars with complete textual values.
- Preserve serving context and per-entry calorie values in food rows.

## 7. Conflicts between reference patterns and CalorieCheck

| Conflict | Reference evidence | CalorieCheck resolution |
| --- | --- | --- |
| Dominant calorie model | Lose It! emphasizes budget/under; Cronometer gives Consumed, Burned, and Remaining equal weight | Use **Consumed of target** as dominant; Remaining or neutral above-target text is secondary; no burned/exercise accounting |
| Progress geometry | Lose It! uses arcs and donuts; Apple uses proprietary rings; Cronometer uses donuts and bars | Prefer an accessible text-first linear meter or restrained CSS bar; do not use Apple rings or copied gauges |
| Information density | Lose It!/Cronometer can be dashboard-dense; Apple is more selective | Use medium density: one primary summary, a compact supporting nutrient group, then lists |
| Color dependence | All three use strong metric colors | CalorieCheck text and values remain authoritative; color is supplementary and contrast-tested |
| Navigation | Each product exposes different destinations and add controls | Preserve Today, Analyze, Week, Settings with visible labels; no copied floating add control or external navigation order |
| Diary organization | Lose It!/Cronometer show meal/category groups | Keep CalorieCheck's implemented chronological/semantic daily list unless a separate product decision changes the data model |
| Food imagery | Lose It! marketing/log rows show food photos/icons | Retain no food imagery by default; names and serving context identify records |
| Goal/weight features | Lose It! shows weight-loss charts and milestones | Treat as exclusion evidence; Maintain is the only approved V2 method, and Lose/Gain remain unavailable pending a separate approved method |
| Nutrition breadth | Cronometer shows burned components, alcohol, and richer targets | Show only CalorieCheck's accepted calories, macros, fiber, sugar, and sodium with null-versus-zero semantics |
| Theme | Apple is dark; Lose It!/Cronometer are light/orange | Preserve CalorieCheck's light blue/navy identity; dark mode remains deferred |
| Behavior | Screens imply tabs, menus, expansion, and add actions | Do not infer behavior; use CalorieCheck's tested controllers, service contracts, history rules, focus behavior, and wireframes |

## 8. Recommended CalorieCheck visual direction

1. **A calm light health utility, not a copied diet dashboard.** Retain premium blue, deep navy text, pale background, white surfaces, and restrained semantic accents.
2. **One dominant Today relationship.** Lead with `[consumed] of [estimated target] kcal`, an accessible linear meter, and secondary remaining/above-target text.
3. **Medium density.** Use Apple-like hierarchy and whitespace around the primary summary, Lose It!-like scan rhythm for the daily log, and Cronometer-like explicit units in detailed nutrition.
4. **Lists before card grids.** Use a few purposeful summary surfaces, then grouped or semantic lists for food entries, settings, ambiguity choices, and weekly days.
5. **Text-first progress.** Graphics supplement numeric labels, never replace them. Avoid rings, donuts, copied gauges, color-only meaning, and equal-weight calorie metrics.
6. **Stable mobile rows.** Food name first, serving/source context second, calorie value trailing; Edit/Delete actions remain accessible without relying on swipe or an unlabeled overflow menu.
7. **Four visible destinations.** Today, Analyze, Week, Settings remain labeled and ordered consistently across breakpoints.
8. **No food imagery by default.** Preserve speed, catalog consistency, and focus on name/serving/nutrition.
9. **Responsive continuity.** Mobile remains the source layout. Tablet/desktop may create restrained two-column compositions without changing journeys or introducing a sidebar.
10. **CalorieCheck behavior remains authoritative.** External references influence visible hierarchy only until behavioral research is supplied and separately approved.

## 9. Wireframe revisions recommended from this batch

| Wireframe area | Recommended revision | Status |
| --- | --- | --- |
| Today summary | Make the consumed-of-target sentence and value even more dominant; use one text-first linear meter; keep remaining/above and nutrient completeness secondary | Revise before final D0 approval |
| Today food log | Specify stable row alignment: food name, serving/context, trailing calories, accessible Edit/Delete; keep the list ungrouped by meal | Clarify existing wireframe |
| Week | Retain the semantic seven-day list; allow one lightweight horizontal CSS bar per day only if text remains complete | Existing direction remains valid; visual choice pending |
| Settings | Prefer Apple-like grouped full-width rows over a separate rounded card for every setting; labels remain authoritative | Clarify existing wireframe |
| Analyze result | Use Cronometer-like explicit labels/units but keep calories first and accepted nutrients only; no donut/dashboard | Existing direction remains valid |
| Primary navigation | Retain four labeled destinations; reject copied floating add controls and product-specific tab arrangements | No structural revision needed |
| Onboarding goal step | Keep Maintain available and Lose/Gain visibly unavailable pending an approved method; no weight chart or implied weight-change calculation | Existing corrected direction remains valid |
| Authentication, system states, destructive actions | Continue designing from CalorieCheck requirements and security/accessibility contracts because the batch provides no reliable coverage | No external-pattern revision |
| Responsive transformation | Preserve the accepted two-column enhancement; the supplied batch provides insufficient tablet/desktop application evidence to dictate an exact composition | Remains provisional |

## 10. Areas not covered by the batch

Use CalorieCheck's requirements and low-fidelity contracts—not imitation—for:

- signed-out entry, login, signup, email confirmation, recovery, and session expiry;
- progressive onboarding and its final atomic review/save;
- field validation, loading, slow network, offline, permission, empty, retry, and configuration states;
- food ambiguity and missing-amount recovery;
- log edit/delete confirmation;
- hard account deletion, current-password reauthentication, Turnstile, and throttling;
- focus order, keyboard behavior, screen-reader announcements, History API behavior, refresh restoration, and responsive reflow;
- tablet and desktop composition beyond the accepted CalorieCheck responsive contract.

## 11. Visual-question disposition

The complete isolated prototype was visually approved on 2026-11-03. Its text-first progress treatment, medium density, restrained cards, lightweight Week bars plus semantic list, supplementary local SVG icons, text-first food rows without thumbnails, and responsive compositions are the D0 baseline. The optional hands-on Lose It! walkthrough is deferred, and no external-app behavior is inferred. Lose/Gain were assigned to the separate V2-G0 through V2-G3 scientific/product program; D0 itself did not change production target logic.

## 12. D0-C disposition

The current visual-reference batch is fully inventoried and interpreted for screenshot-based D0-C research. The reference hierarchy, conflicts, CalorieCheck translation, exclusions, coverage gaps, and recommended wireframe revisions are documented.

Behavioral UX research remains optional and deliberately separate. V2-D0 closed with explicit visual approval on 2026-11-03. Production integration follows the canonical V2-G and V2-D sequence and must preserve the reference-copying restrictions in this register.
