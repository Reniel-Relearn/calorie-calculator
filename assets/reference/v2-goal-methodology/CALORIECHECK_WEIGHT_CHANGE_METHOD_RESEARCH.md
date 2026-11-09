# CalorieCheck Lose/Gain Scientific Validation Research

## Executive decision

The deep research found a **materially stronger source-backed path for Lose and Gain than the current CalorieCheck research had identified**.

The decisive source is the **2023 National Academies of Sciences, Engineering, and Medicine (NASEM), _Dietary Reference Intakes for Energy_**. Its Chapter 7 explicitly addresses people seeking to lose or gain weight. NASEM says the EER equations themselves estimate maintenance rather than intentional weight change, but then gives a specific method for identifying starting energy intakes likely to produce weight change: subtract or add `1.96 × SEPV`—the standard error of the predicted value—from/to EER. citeturn689648view3turn881618search4

NASEM provides **both a loss and a gain worked example**. For a 45-year-old low-active man, 175 cm and 100 kg, it reports EER ≈ 3,041 kcal/day and uses `3,041 − (1.96 × 342) = 2,371 kcal/day` as a starting intake predicted to lead to weight loss in almost all comparable men. For the same man at 55 kg, it reports EER ≈ 2,368 kcal/day and uses `2,368 + (1.96 × 342) = 3,038 kcal/day` as a starting intake predicted to lead to weight gain in almost all comparable men. Crucially, NASEM calls these **starting points** that should subsequently be modified according to observed weight change rather than fixed prescriptions or guaranteed rates. citeturn689648view0turn689648view1

| Goal | Research decision | Recommended method | Confidence |
|---|---|---|---|
| **MAINTAIN** | **APPROVE FOR PRODUCTION** | Existing 2023 NASEM EER implementation | **High** |
| **LOSE** | **APPROVE WITH CONDITIONS** | `EER − 1.96 × SEPV` as a directional starting target, with no promised loss rate/date | **High for 19+** |
| **GAIN** | **APPROVE WITH CONDITIONS** | `EER + 1.96 × SEPV` as a directional starting target, with no promised gain rate/body-composition outcome | **High for directional gain in 19+** |

This means the current maintain-only ADR was a defensible earlier decision, but its scientific premise should now be **reconsidered rather than simply retained**. The new evidence does not require CalorieCheck to clone the Hall/NIDDK Body Weight Planner or introduce goal weight, target date, desired weekly rate, body-fat percentage, sodium, carbohydrate composition, or other new profile fields. The NASEM method uses the same age, source-equation sex, height, weight, and physical-activity inputs CalorieCheck already collects. citeturn409026search0turn937021view1

## Scientific and engineering implications

The adult SEPV values published by NASEM are **342 kcal/day for men 19+ and 241 kcal/day for women 19+**. For the 3–18 age strata they are **258 kcal/day for boys and 221 kcal/day for girls**. NASEM describes these as prediction errors and explains the `±1.96 × SEPV` interval as approximately a 95% prediction interval around an individual's predicted energy requirement. citeturn881618search4turn881618search1

The recommended production contract is therefore conceptually simple:

```text
MAINTAIN:
target = EER

LOSE:
target = EER - (1.96 × SEPV)

GAIN:
target = EER + (1.96 × SEPV)
```

The report recommends retaining **full precision internally and rounding only for presentation**. NASEM's prose examples expose a small one-kcal rounding-order ambiguity: using the published coefficients gives 3,040.62 kcal/day for its loss example, whereas the book displays 3,041 before applying the adjustment. That difference is scientifically immaterial but should be explicitly encoded in regression-test expectations rather than hidden by changing calculation precision.

The method should **not** be converted into a weekly weight-change prediction. Hall and colleagues' dynamic models demonstrate why static calorie-to-weight conversions become inaccurate over time: metabolic expenditure and body composition adapt during energy imbalance. The NIH/NIDDK Body Weight Planner is designed specifically to simulate these dynamics when a goal weight and timeframe are required. citeturn190535search0turn190535search3turn409026search4

The Hall physiology is not limited to loss: Hall's detailed 2010 model was tested against controlled overfeeding. In one cited 100-day overfeeding experiment, observed mean body weight increased from 60.3 to 68.4 kg while the model simulated 69.7 kg, and the model also reproduced fat-mass and resting-metabolic-rate changes reasonably closely. That corrects an important earlier assumption that gain-side Hall validation was essentially absent. citeturn729482view0turn729482view1

Even so, the Hall/NIDDK model remains unnecessarily complex for the current CalorieCheck requirement. The public planner is built around goal weight, timeframe, intake/activity changes, and a nonlinear simulation; independent validation supports its usefulness for weight-loss forecasting but also shows meaningful individual error. In a 2023 community validation of 3,703 adherent patients, NIH-BWP was the more accurate of the two compared models, but its individual prediction errors still varied substantially. citeturn741255search2turn741255search3

## Conditions and remaining validation boundaries

A fixed `500–750 kcal/day` deficit is **not scientifically baseless**. Current obesity-management guidelines continue to use deficits of that magnitude as one strategy within comprehensive lifestyle interventions for adults with overweight or obesity. The reason not to use `maintenance − 500` as CalorieCheck's universal algorithm is narrower: those clinical recommendations are not a precision formula applicable to every consumer choosing Lose, and they should not be interpreted as guaranteeing a fixed weekly rate. citeturn291846search0turn291846search2

The evidence for generic fixed gain surpluses is weaker. A peer-reviewed review of intentional gain recommendations reports that common athlete guidance often suggests roughly 300–500 kcal/day, but also concludes that direct evidence is limited and that expected rates—particularly lean-mass gain—are difficult to achieve consistently. That makes a fixed `+500` rule inferior to NASEM's explicitly source-backed directional method for CalorieCheck's general-consumer target. citeturn190535search6

Two scientific decisions should remain gated before production. First, the report recommends **19+ as the immediately approvable Lose/Gain population**. NASEM provides adolescent EER equations and SEPV values and its Chapter 7 language is broad, but its intentional loss/gain worked examples are adult examples and much of the supporting weight-management evidence is adult-focused. CalorieCheck can continue maintenance at age 18, but applying Lose/Gain to ages 18.00–18.99 should receive explicit review from a qualified nutrition scientist before being enabled. citeturn881618search2turn937021view0

Second, CalorieCheck should resolve a **low-intake fail-closed boundary**. NIDDK's Body Weight Planner refuses calorie goals below 1,000 kcal/day, while other government programs use different minimums in specific contexts; therefore `1000` should not silently become part of the NASEM equation. If CalorieCheck adopts it, it should be recorded as a separate product-safety rule with its own provenance. citeturn128466search1turn128466search4

Pregnancy and breastfeeding should remain excluded, and CalorieCheck should not extrapolate its EER model to physical-activity levels above the source-supported range. NASEM specifically notes that its equations do not predict requirements for PAL above 2.5 and also cautions that practical individual PAL classification is inherently uncertain. citeturn787753view0turn689648view0

On licensing, NASEM's publication is copyrighted and its rights pages restrict reproduction of protected report content, so CalorieCheck should independently encode the factual coefficients/equations while citing the source rather than reproducing NASEM tables, prose, or graphics. citeturn257630search2turn257630search16 NIDDK separately provides historical model code and maintains technology-transfer records for its simulator and later personalized weight-management technology; therefore copying NIH/NIDDK simulator code or closely reproducing that product should receive legal review rather than being assumed reusable. citeturn129418view0turn257630search0turn257630search26

## CalorieCheck impact

The recommended NASEM approach is unusually compatible with CalorieCheck's current architecture because it **does not require additional profile data**. No goal weight, target date, weekly rate, body-fat percentage, RMR, sodium intake, or diet-composition fields are required.

The likely changes are concentrated in the target engine, methodology/provenance snapshot, onboarding/settings goal availability, documentation, and tests. Whether a database migration is necessary depends on the repository's actual current constraints: if the existing `goal` contract already permits Maintain/Lose/Gain and target snapshots are versioned JSON, it may require **no schema change at all**. Codex should inspect the live migrations before deciding.

The research also recommends that `V2-ADR-011` **not be edited as if the previous decision never existed**. The proper governance path is a new ADR that explicitly supersedes or revises it based on the newly identified NASEM Chapter 7 evidence. The present repository records Maintain-only as the accepted behavior precisely because no weight-change method had previously passed its scientific/licensing/validation gate. fileciteturn0file14

External review remains advisable before production: a qualified registered dietitian/nutrition scientist should review the 19+ scope, age-18 disposition, low-intake fail-closed rule, and final user-facing limitations; legal/IP counsel is advisable for the exact NASEM-use boundary and especially before copying any Hall/NIDDK implementation material.

The complete code-ready research report, including the exact EER equations, SEPV constants, Hall-model equations, authoritative and derived validation vectors, provenance fields, data-minimization matrix, licensing classification, architecture impact matrix, test plan, unresolved questions, and full URL source register is here:

[**CALORIECHECK_WEIGHT_CHANGE_METHOD_RESEARCH.md**](sandbox:/mnt/data/CALORIECHECK_WEIGHT_CHANGE_METHOD_RESEARCH.md)