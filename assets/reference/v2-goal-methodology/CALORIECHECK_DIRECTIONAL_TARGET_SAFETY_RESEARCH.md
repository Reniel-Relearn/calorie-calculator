# CalorieCheck Directional Weight-Target Production-Safety Research

## Executive recommendation

**LOSE — APPROVE WITH CONDITIONS for adults age 19+.** The 2023 National Academies of Sciences, Engineering, and Medicine Dietary Reference Intakes for Energy explicitly states that although EER equations estimate maintenance rather than the energy requirement for a chosen rate of weight change, subtracting `1.96 × SEPV` from EER can identify an intake expected to fall below maintenance needs in almost all people with the specified characteristics. NASEM's worked example for a 45-year-old low-active man, 175 cm and 100 kg, gives EER `3,041 kcal/day`, male SEPV `342 kcal/day`, and `3,041 − (1.96 × 342) = 2,371 kcal/day` as a starting intake for weight loss. NASEM explicitly calls these values **starting points** that should subsequently be modified according to observed weight change. citeturn861800view0turn861800view1

**GAIN — APPROVE WITH CONDITIONS for adults age 19+.** NASEM applies the same reasoning in the positive direction. Its gain example uses a 45-year-old low-active man, 175 cm and 55 kg, with EER `2,368 kcal/day`; adding `1.96 × 342` gives `3,038 kcal/day`, which NASEM says would be expected to lead to weight gain in almost all men with those characteristics. This supports a **directional starting intake**, not a prediction of gain rate, goal date, or body composition. citeturn861800view0turn861800view1

**Age 18.00–18.99 — keep Maintain only for now.** NASEM deliberately separates ages `14–18.99` from `19+`; the younger EER branch includes an energy allowance for growth, while the adult Table 5-8 SEPV values and Chapter 7 weight-change worked examples are for adults 19+. NASEM does publish prediction-error values for adolescents, so the scientific issue is not absence of equations; the issue is that this review did not find enough explicit evidence to treat an 18-year-old using a growth-inclusive equation as equivalent to the adult directional examples. Blocking directional targets until an adolescent-nutrition expert reviews that boundary is therefore a **CalorieCheck product-safety policy**, not a NASEM rule. citeturn861800view3turn861800view5

**Recommended low-intake fail-closed rule: do not issue a self-directed Lose target below `1,200 kcal/day`.** This must **not** be described as a universal physiological calorie floor or as part of the NASEM formula. NIDDK's Body Weight Planner itself hard-stops below `1,000 kcal/day`; separate NIDDK Diabetes Prevention Program guidance says eating below `1,200 kcal/day` is not advised; and NICE classifies `800–1,200 kcal/day` as a low-energy diet that should be used within specialist weight-management or appropriate long-term-condition services with support. For an unsupervised consumer estimator, `<1,200` is therefore a defensible conservative product boundary, but its final adoption should be signed off by a qualified nutrition professional. citeturn418377search2turn418377search1turn418377search0turn418377search3

The resulting high-level policy is:

| Goal | Recommendation | Core method | Confidence |
|---|---|---|---|
| Maintain | **Approved** | Existing age-appropriate NASEM EER | High |
| Lose, age 19+ | **Approve with conditions** | `EER − 1.96 × SEPV` | High for equation; medium for safety policy |
| Gain, age 19+ | **Approve with conditions** | `EER + 1.96 × SEPV` | High for equation; medium for safety policy |
| Lose/Gain, age 18–18.99 | **Do not enable yet** | Pending adolescent-specific professional review | Medium |
| Lose result `<1,200 kcal/day` | **Fail closed** | No target returned | Medium |
| Goal-weight/rate forecasting | **Do not implement** | Not required by this method | High |

The complete Codex-ready Markdown deliverable is available here: [CALORIECHECK_DIRECTIONAL_TARGET_SAFETY_POLICY_RESEARCH.md](sandbox:/mnt/data/CALORIECHECK_DIRECTIONAL_TARGET_SAFETY_POLICY_RESEARCH.md).

## Equation evidence and supported domain

The underlying maintenance concept remains unchanged: NASEM defines EER as the average dietary energy intake predicted to maintain energy balance for a person of defined age, sex, weight, height, physical activity, and life stage. The 2023 revision was based primarily on measured total energy expenditure using doubly labeled water and broadened the DRI population to include people with overweight, obesity, and chronic diseases rather than restricting the framework to a narrowly “healthy” population. citeturn609145view2turn609145view1

The critical distinction for CalorieCheck is that **NASEM does not claim `EER ± 1.96×SEPV` predicts how much weight a person will gain or lose**. Chapter 7 says the EER equations remain maintenance equations, but their prediction uncertainty can be used to select an intake likely to lie outside the individual's maintenance requirement. NASEM says approximately 95% of individuals with given characteristics are expected to have requirements within `±1.96 SEPV` of the predicted EER; moving beyond that interval therefore gives a directional starting value. citeturn861800view1

For adults age 19+, Table 5-8 supplies these constants:

| Equation category | SEPV | Directional adjustment |
|---|---:|---:|
| Male, 19+ | `342 kcal/day` | `1.96 × 342 = 670.32 kcal/day` |
| Female, 19+ | `241 kcal/day` | `1.96 × 241 = 472.36 kcal/day` |

Those are the values NASEM itself uses in Chapter 7; Table 5-8 lists adult male and female SEPV values of 342 and 241 kcal/day respectively. citeturn861800view3turn861800view4

The adult PAL domain should remain exactly tied to the NASEM source categories: Inactive `1.00–<1.53`, Low active `1.53–<1.68`, Active `1.68–<1.85`, and Very active `1.85–<2.50`. NASEM separately flags people with extremely high physical activity as requiring additional consideration, so CalorieCheck should fail closed rather than extrapolate beyond the supported activity category. citeturn861800view5turn861800view0

The proposed **supported directional domain** is therefore age `≥19`, a supported male/female source-equation category, valid finite height and weight, one of the four adult activity categories, non-pregnant and non-breastfeeding, and no product-safety exclusion. NIDDK independently uses an adult-only weight-planning scope and excludes pregnancy and breastfeeding, although its Body Weight Planner is a different dynamic model and is not the formula proposed here. citeturn609145view3

A high BMI by itself should **not** trigger an equation-level rejection. NASEM's 2023 work recommends its general prediction equations across BMI categories rather than separate equations by BMI, and the DRI's target population explicitly includes people with overweight and obesity. That does not mean every user with obesity is appropriate for unsupervised weight management; it means CalorieCheck should not invent a BMI cutoff and falsely attribute it to the equation. citeturn861800view5turn609145view2

## Safety policy and user-facing rules

The clean implementation boundary is two layers: the **scientific equation layer** calculates the NASEM result, while a separate **CalorieCheck safety-policy layer** decides whether that result can be displayed in a self-directed consumer application. This separation matters because NASEM does not prescribe CalorieCheck's eating-disorder screening, calorie floor, or referral behavior.

| Condition | Lose behavior | Gain behavior | Classification |
|---|---|---|---|
| Age `≥19`, otherwise eligible | Show starting estimate | Show starting estimate | Source-supported |
| Age `18.00–18.99` | Unavailable; Maintain only | Unavailable; Maintain only | Conservative product policy |
| Pregnancy/breastfeeding | Unavailable | Unavailable | Existing scope / authoritative exclusion |
| PAL outside modeled range, especially `≥2.50` | Unavailable | Unavailable | Source-domain boundary |
| BMI `<18.5` | **Block Lose** | Warning/referral gate rather than automatic rejection solely for BMI | Product safety |
| BMI `<16`, or credible refeeding-risk context | Block/referral | Block/referral | Clinical safety boundary |
| Current/suspected eating disorder, significant restrictive/purging behavior | Block/referral | Block/referral | Clinical safety boundary |
| Rapid or unintentional weight loss | Block/referral | Block/referral | Clinical safety boundary |
| Medically prescribed diet or medical condition/treatment affecting nutrition | Block/referral | Block/referral | Product scope |
| Lose target `<1,200 kcal/day` | Block; do not clamp | N/A | Conservative product boundary |
| High BMI alone | Do not automatically block | Do not automatically block | Avoid unsupported cutoff |
| Invalid/non-finite or obviously erroneous profile input | Require correction | Require correction | Software/data-quality rule |

For eating-disorder risk, NICE recommends referral when an eating disorder is suspected and identifies relevant indicators including unusually low or high weight/BMI, rapid weight loss, restrictive eating—especially dieting while underweight—weight/shape preoccupation, chronic illnesses affecting diet, signs of malnutrition, vomiting, laxative or diuretic misuse, excessive exercise, and unexplained electrolyte abnormalities. NICE also cautions against basing eating-disorder decisions on a single weight/BMI measure alone. citeturn258387search2turn258387search3turn258387search5

For severe undernutrition, NICE's adult nutrition-support guideline identifies BMI `<16 kg/m²` as one criterion for high risk of refeeding problems; it also identifies combinations involving BMI `<18.5`, substantial recent unintentional weight loss, prolonged little or no intake, and certain medication/alcohol histories. People at high risk should be managed by appropriately skilled healthcare professionals. A general consumer calorie app should therefore fail closed rather than provide a Gain calorie target in a plausible refeeding-risk situation. citeturn258387search4

Importantly, **BMI below 18.5 should not automatically invalidate NASEM's Gain equation**. NASEM's own adult gain example is a 55 kg, 1.75 m man—BMI about 18.0—and it still applies `EER + 1.96×SEPV`. The safer product interpretation is therefore: underweight Gain needs stronger context/referral messaging, while severe undernutrition or other risk indicators should block self-directed use. citeturn861800view0

The recommended eligibility disclosure is:

> “This is a starting calorie estimate, not medical advice or a prediction of how fast your weight will change. Do not use it if you are pregnant or breastfeeding, have an eating disorder or history of one, are losing weight unintentionally, have had very little food intake recently, or have a medical condition or treatment that requires professional nutrition guidance. If any of these apply, talk with a qualified health professional.”

For **Lose**, the result wording should say:

> “Starting calorie estimate for weight loss: **[target] kcal/day**. This estimate is designed to place intake below your estimated maintenance needs; it does not predict a specific amount or rate of weight loss. Monitor your weight over time and update your profile weight when you want CalorieCheck to recalculate your estimate.”

For **Gain**, the wording should say:

> “Starting calorie estimate for weight gain: **[target] kcal/day**. This estimate is designed to place intake above your estimated maintenance needs; it does not predict a specific amount or rate of weight gain or how much gain will be muscle or fat. Monitor your weight over time and update your profile weight when you want CalorieCheck to recalculate your estimate.”

That Gain limitation is important. NASEM supports the positive-energy directional method, but it does not convert `+1.96 SEPV` into a promised rate of gain or lean-mass outcome. Weight management remains multifactorial. citeturn861800view1

If the Lose calculation falls below `1,200 kcal/day`, CalorieCheck should **not silently replace it with 1,200**. Clamping would falsify the provenance of the NASEM result. Return an unavailable safety outcome instead, with wording such as:

> “CalorieCheck can’t provide a self-directed weight-loss target at this intake level. Lower-energy diets can require professional supervision. Talk with a qualified dietitian or healthcare professional about an appropriate plan.”

That wording deliberately avoids claiming that 1,200 kcal is a universal biological threshold. NICE treats 800–1,200 kcal/day as a specialist-supported low-energy intervention; NIDDK uses a different 1,000 kcal floor in its Body Weight Planner and separately advises against below 1,200 kcal/day in DPP-derived guidance. The authorities therefore do **not** supply one universal floor. citeturn418377search0turn418377search2turn418377search1

## Precision, constants, monitoring, and validation

CalorieCheck should use the published Table 5-8 adult constants exactly: `342 kcal/day` for men and `241 kcal/day` for women, with multiplier `1.96`. That produces a male directional displacement of `670.32 kcal/day` and a female displacement of `472.36 kcal/day`. These are prediction-uncertainty quantities, not universal “deficit” or “surplus” recommendations. citeturn861800view3turn861800view4turn861800view1

A subtle but important precision issue emerges from NASEM's worked examples. For its male Lose example, the published low-active equation yields a raw EER of about `3040.62`, which NASEM presents as `3,041`; applying the adjustment to `3,041` gives `2,370.68`, displayed as `2,371`. Applying the adjustment to the raw EER instead would produce a different whole-kcal endpoint. The Gain example behaves similarly. The best source-compatible contract is therefore:

`raw EER → whole-kcal EER → ±(1.96 × SEPV) → whole-kcal directional result`

This rounding order is an **engineering inference from NASEM's examples**, not an explicitly published software specification, and should be one of the items independently confirmed before production. citeturn861800view0

The strongest regression vectors are:

| Evidence status | Inputs | Expected EER | Directional calculation | Expected result |
|---|---|---:|---:|---:|
| **NASEM authoritative worked example** | Male, 45 y, 175 cm, 100 kg, Low active, Lose | `3,041` | `3041 − 1.96×342` | **2,371 kcal/day** |
| **NASEM authoritative worked example** | Male, 45 y, 175 cm, 55 kg, Low active, Gain | `2,368` | `2368 + 1.96×342` | **3,038 kcal/day** |
| **NASEM-published interval endpoint** | Female, 22 y, 165 cm, 63 kg, Low active, negative direction | `2,275` | `2275 − 1.96×241` | **1,803 kcal/day** |
| **NASEM-published interval endpoint** | Female, 22 y, 165 cm, 63 kg, Low active, positive direction | `2,275` | `2275 + 1.96×241` | **2,747 kcal/day** |

The female endpoints are independently useful because NASEM itself gives the `1,803–2,747 kcal/day` 95% interval for that woman with EER 2,275 kcal/day. citeturn861800view1

The production provenance snapshot should ideally include the raw EER, displayed EER, equation identifier/version, source age branch, activity category, SEPV, `1.96` multiplier, unrounded directional value, displayed directional value, safety-policy version, eligibility outcome, and source citation. This is an engineering recommendation rather than a NASEM requirement, but it makes later scientific audits and target-history interpretation reproducible.

NASEM explicitly says the directional values are **starting points** and should later be modified as required based on weight change. That fits CalorieCheck's design well: the user does not need a goal weight, goal date, or desired weekly rate; instead, when they explicitly update their current profile weight, the app can calculate a new effective-dated target using the same deterministic method. Research did not identify a NASEM-prescribed weekly or monthly recalculation interval, so CalorieCheck should not invent one. citeturn861800view0turn861800view1

## Filipino applicability and licensing

The Philippine DOST-FNRI **Philippine Dietary Reference Intakes 2015: Summary Tables**, revised September 2018, gives population reference energy intakes by age/life stage, sex, and reference weight. For example, its adult 19–29 table lists 2,530 kcal/day for men and 1,930 kcal/day for women. It does **not** provide a Filipino individualized directional equivalent of `EER ± 1.96×SEPV`. FNRI therefore provides important local context but does not independently validate or replace the NASEM directional algorithm. citeturn750209view0

The NASEM DRIs were commissioned to make recommendations for U.S. and Canadian populations, although the 2023 revision broadened the underlying doubly labeled water evidence base and explicitly sought more diverse population representation. citeturn609145view2turn609145view6 The reviewed literature did **not** establish a validation study specifically showing that the exact 2023 adult `±1.96 SEPV` directional method has been calibrated in Filipino adults. Therefore CalorieCheck should not call the result “Filipino-calibrated” or “validated specifically for Filipinos.”

A suitable Philippine-facing disclosure is:

> “Energy-estimate methodology: 2023 U.S./Canadian Dietary Reference Intakes for Energy, developed from measured energy-expenditure data that include internationally sourced evidence. Individual needs vary, and CalorieCheck has not independently validated this method specifically in Filipino adults.”

On present evidence, that limitation is better treated as a **disclosure plus professional-review item**, rather than an automatic blocker. The official Philippine reference does not offer a stronger individualized directional formula to substitute. citeturn750209view0turn609145view6

For intellectual-property purposes, the recommended classification is **LIKELY ACCEPTABLE BUT LEGAL REVIEW ADVISED**, not “clear.” National Academies Press states that its books are copyrighted and provides a permissions process for republication/display of publication content; its PDFs may not simply be copied, posted, or redistributed without permission. citeturn609145view7 This means CalorieCheck should not reproduce NASEM tables, figures, substantial prose, PDF pages, logos, or branding in the application or repository.

The research did not identify an explicit software license covering an independently written implementation of the published mathematical relationships. Whether the intended commercial implementation requires additional permission is consequently a legal question, not something the scientific literature settles. The safest approach is to implement the arithmetic independently, provide bibliographic attribution, copy no protected visual/textual expression, imply no NASEM endorsement, and obtain legal review if the product will be commercially distributed. citeturn609145view7

Recommended attribution:

> National Academies of Sciences, Engineering, and Medicine. 2023. *Dietary Reference Intakes for Energy*. Washington, DC: The National Academies Press. DOI: 10.17226/26818.

The NIH/NIDDK Body Weight Planner should remain a **separate comparator**, not implementation provenance. It asks for goal weight and timeframe and uses a different modeling approach, whereas this CalorieCheck policy intentionally does neither. citeturn609145view3

## Professional-review questions and unresolved decisions

Before enabling Lose/Gain in production, the remaining questions should be explicitly dispositioned rather than buried in implementation assumptions:

1. **Age 18:** Is the conservative `19+` directional cutoff acceptable, or can an expert justify `18.00–18.99` using NASEM's adolescent EER and adolescent SEPV while accounting for the growth term?
2. **Low-intake boundary:** Is `<1,200 kcal/day` the right consumer fail-closed boundary, given the difference between NIDDK's 1,000 kcal planner limit, DPP's advice against `<1,200`, and NICE's specialist handling of 800–1,200 kcal/day? citeturn418377search2turn418377search1turn418377search0
3. **Underweight:** Should Lose always be unavailable below BMI 18.5, and should Gain for BMI 16–18.49 require an explicit non-persistent screening confirmation before showing a result?
4. **Refeeding risk:** Is the proposed hard block for BMI `<16` plus other major refeeding-risk indicators sufficiently conservative for an app that cannot medically assess the user? NICE treats BMI below 16 and several other circumstances as high-risk criteria requiring skilled nutritional care. citeturn258387search4
5. **Eating-disorder/medical screening:** Is a non-persistent eligibility acknowledgment sufficient, or should CalorieCheck avoid directional targets altogether when the user discloses relevant medical/eating-disorder circumstances? NICE supports immediate specialist referral when an eating disorder is suspected. citeturn258387search3
6. **Precision:** Should production intentionally reproduce NASEM's apparent “round EER first, then apply ±1.96×SEPV” behavior?
7. **Provenance:** Should every target-history row store SEPV, multiplier, equation ID, safety-policy version, raw EER, directional output, and eligibility decision in addition to the existing profile snapshot?
8. **Philippine deployment:** Is disclosure sufficient, or should CalorieCheck require a Filipino registered nutritionist-dietitian/scientist review or local validation before enabling directional targets?
9. **Licensing:** Does the intended distribution/commercial model require permission from National Academies Press beyond citation when the equations are independently implemented rather than copied as publication content?

Research **cannot** settle the desired level of product conservatism for the `1,200 kcal` boundary, the exact underweight Gain gate, or how prominently referral messages should be presented. Those are safety/risk-management decisions that should be approved by the product owner after qualified professional review; they should not be falsely presented as properties of the NASEM equations.

## Source matrix

All web sources were checked on **November 3, 2026** unless otherwise noted.

| Source | Primary use | Location | Direct URL |
|---|---|---|---|
| National Academies, *Dietary Reference Intakes for Energy* (2023) | Directional Lose/Gain authority | Chapter 7, “Individuals Seeking to Lose or Gain Weight,” pp. 156–157; uncertainty example p. 153 | `https://www.nationalacademies.org/read/26818/chapter/9` citeturn861800view0turn861800view1 |
| National Academies, same report | Adult EER equations, SEPV, PAL and validation | Chapter 5; Table 5-8; Tables 5-15/5-16; Table 5-4 | `https://www.nationalacademies.org/read/26818/chapter/7` citeturn861800view3turn861800view5 |
| National Academies report DOI | Persistent identifier | Whole report | `https://doi.org/10.17226/26818` citeturn609145view1 |
| NIH/NIDDK Body Weight Planner | Separate safety/model comparator | Adult disclaimer; 1,000 kcal minimum; goal/date inputs | `https://www.niddk.nih.gov/bwp` citeturn609145view3turn418377search2 |
| NIH/NIDDK Diabetes Prevention Program Game Plan | Low-intake context | “Eating less than 1,200 calories a day is not advised” | `https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-type-2-diabetes/game-plan` citeturn418377search1 |
| NICE NG246, *Overweight and obesity management* | Low-energy diet safety/supervision | §1.16.8–1.16.12 | `https://www.nice.org.uk/guidance/ng246/chapter/Physical-activity-and-diet` citeturn418377search0turn418377search3 |
| NICE NG69, *Eating disorders: recognition and treatment* | Referral and risk triggers | §1.2 and physical-risk recommendations | `https://www.nice.org.uk/guidance/ng69/chapter/Recommendations` citeturn258387search2turn258387search3 |
| NICE CG32, *Nutrition support for adults* | Refeeding-risk criteria | §1.4.6–1.4.8, Box 1 | `https://www.nice.org.uk/guidance/cg32/chapter/Recommendations` citeturn258387search4 |
| DOST-FNRI, *Philippine Dietary Reference Intakes 2015: Summary Tables* | Philippine context | p. 1 energy-reference table; revised Sep 2018 | `https://fnri.dost.gov.ph/images/images/news/PDRI-2018.pdf` citeturn750209view0 |
| National Academies Press Rights and Permissions | Copyright/reuse boundary | General reuse and PDF-distribution sections | `https://www.nationalacademies.org/request-rights-and-permissions` citeturn609145view7 |

The research therefore supports a material change to CalorieCheck's former scientific disposition: **Lose and Gain no longer need to remain categorically unavailable for adults 19+ merely because the product does not collect goal weight, goal date, or desired rate.** NASEM itself supplies a directly applicable directional starting-point method. What remains necessary is a separately versioned **product-safety policy** around that equation, professional review of the age/floor/underweight boundaries, and formal supersession of the old maintain-only ADR rather than silently changing its behavior. citeturn861800view0turn861800view1