# CalorieCheck V2 Filipino-First Candidate and Source Matrix

**Phase:** V2-F1 — Candidate Inventory and Source Verification

**Status:** APPROVED FOR PLANNING — SOURCE-USE PERMISSION REQUIRED

**Research date:** 2026-11-02

**Implementation authorization:** Not granted; this document contains research candidates only

## 1. Result

The proposed catalog contains exactly **80 total records**:

- 11 existing records retained unchanged;
- 69 proposed new records;
- 13 staples, rice, bread, and noodle records in the final catalog;
- 19 protein, fish, seafood, egg, and tofu records;
- 20 prepared Filipino food and dish records;
- 15 fruit and vegetable records;
- 13 breakfast, snack, dessert, and drink records.

All 69 new candidates have a direct DOST-FNRI Philippine Food Composition Table (PhilFCT) record. No nutrition value, preparation equivalence, recipe calculation, or serving weight was generated or inferred.

This matrix is not application food data. The user approved its proposed identity, provenance, limitations, and supplemental review table for planning on 2026-11-02. Source-use permission remains required before V2-F2 or V2-F3.

## 2. Source and Reuse Finding

PhilFCT is the strongest direct source for the proposed Filipino-first records:

- the [official PhilFCT library](https://i.fnri.dost.gov.ph/fct/library) describes free online access to energy and nutrient data for about 1,600 commonly consumed foods;
- the [official PhilFCT information page](https://i.fnri.dost.gov.ph/login/fct) says individual food reports are downloadable and printable and provides the Philippine Food Composition Team contact address;
- an [official DOST-FNRI project report](https://www.fnri.dost.gov.ph/images/sources/SeminarSeries/43rd/FCT.pdf) states that copyright for the PhilFCT web database was granted to FNRI in September 2016.

Free access and printable reports do not by themselves establish permission to redistribute a large local subset in a public software repository. No public PhilFCT reuse license comparable to USDA's CC0 declaration was found during V2-F1.

**Required clarification before new PhilFCT values are committed:** obtain written confirmation from DOST-FNRI that CalorieCheck may reproduce the selected nutrient values and metadata in an attributed, non-medical, open public demo repository and deployment. The official inquiry address shown by PhilFCT is `fqss.nfrdd@fnri.dost.gov.ph`. Do not send credentials, personal data, Supabase values, or other secrets.

USDA FoodData Central remains an approved fallback because its [official API guide](https://fdc.nal.usda.gov/api-guide/) publishes its data under CC0 1.0 and requests source attribution. Its [data documentation](https://fdc.nal.usda.gov/data-documentation/) distinguishes Foundation Foods, FNDDS, SR Legacy, and branded data. No new USDA fallback was selected because every proposed new identity has a closer direct PhilFCT match; USDA may replace a candidate only after an exact preparation-level review.

## 3. Matrix Rules

- New PhilFCT records use the source's **100 g edible portion** basis.
- All proposed new records are mass-based solids and initially support **grams only**.
- Edible-portion percentages do not define a piece, cup, bowl, plate, slice, or serving conversion.
- No new household conversion or descriptor is approved in V2-F1.
- Required nutrient coverage means calories, protein, carbohydrates, fat, fiber, sugar, and sodium.
- `7/7` means all seven fields are reported by the source.
- A partial count lists source-unavailable fields. Those fields must become `null`, not zero.
- Proposed aliases are conservative matching candidates, not final V2-F4 search behavior.
- Source descriptions below preserve the official PhilFCT wording, including abbreviations.

## 4. Existing Records Retained

These 11 application records remain unchanged during the proposed expansion.

| # | Existing ID and display name | Current authoritative source | Basis and supported paths | Required nutrients | Disposition |
|---:|---|---|---|---|---|
| 1 | `grilled-chicken-breast` — Grilled Chicken Breast | USDA FDC 171534 — Chicken, broiler or fryers, breast, skinless, boneless, meat only, cooked, grilled | 100 g; grams and sourced piece conversion | 7/7 | Retain unchanged |
| 2 | `fried-chicken` — Fried Chicken | USDA FDC 171448 — Chicken, broilers or fryers, meat and skin, cooked, fried, batter | 100 g; grams | 7/7 | Retain unchanged |
| 3 | `roasted-chicken-thigh` — Roasted Chicken Thigh | USDA FDC 173625 — Chicken, broilers or fryers, thigh, meat and skin, cooked, roasted | 100 g; grams and sourced piece conversion | 7/7 | Retain unchanged |
| 4 | `fried-egg` — Fried Egg | USDA FDC 173423 — Egg, whole, cooked, fried | 100 g; grams and sourced large-piece descriptor | 7/7 | Retain unchanged |
| 5 | `boiled-egg` — Boiled Egg | PhilFCT H004 — Egg, chicken, whole, boiled | 100 g E.P.; grams | 7/7 | Retain unchanged |
| 6 | `cooked-white-rice` — Cooked White Rice | PhilFCT A020 — Rice, well-milled, boiled | 100 g E.P.; grams and sourced cup conversion | 7/7 | Retain unchanged |
| 7 | `banana` — Banana | USDA FDC 173944 — Bananas, raw | 100 g; grams and sourced size descriptors | 7/7 | Retain unchanged |
| 8 | `saba-banana` — Saba Banana | PhilFCT E014 — Banana, saba | 100 g E.P.; grams | 7/7 | Retain unchanged |
| 9 | `cheeseburger` — Cheeseburger | PhilFCT R003 — Cheeseburger sandwich | 100 g E.P.; grams | 7/7 | Retain unchanged |
| 10 | `whole-milk` — Whole Milk | USDA SR Legacy FDC 172217 — Milk, whole, 3.25% milkfat, without added vitamin A and vitamin D | 100 mL derived from sourced mass/volume portion; milliliters | 7/7 | Retain unchanged |
| 11 | `orange-juice` — Orange Juice | USDA SR Legacy FDC 169098 — Orange juice, raw | 100 mL derived from sourced mass/volume portion; milliliters | 7/7 | Retain unchanged |

## 5. Proposed New Records

Every proposed record below is **approved for planning but provisional pending PhilFCT reuse clarification**.

### 5.1 Staples, rice, bread, and noodles — 12 new records

Source page: [PhilFCT category A](https://i.fnri.dost.gov.ph/fct/library/food_content/A)

| # | Proposed ID and display name | Conservative aliases | Preparation | Exact source record | Required nutrients | Initial serving path |
|---:|---|---|---|---|---|---|
| 12 | `fried-rice` — Fried Rice | fried rice, sinangag | fried | A021 — Rice, well-milled, fried | 7/7 | grams |
| 13 | `cooked-purple-glutinous-rice` — Cooked Purple Glutinous Rice | purple sticky rice, pirurutong rice, sinaing na pirurutong | boiled | A016 — Rice, undermilled, glutinous, purple, boiled | 7/7 | grams |
| 14 | `boiled-yellow-corn` — Boiled Yellow Corn | boiled corn, nilagang mais, boiled corn on the cob | boiled | A005 — Corn on cob, yellow, boiled | 7/7 | grams; no cob/piece conversion |
| 15 | `pandesal` — Pandesal | pan de sal, Filipino bread roll | baked | A042 — Bread, pan de sal | 7/7 | grams |
| 16 | `ensaymada` — Ensaymada | ensaimada, sweet bread roll | baked | A045 — Bread, sweet roll | 7/7 | grams |
| 17 | `pan-de-coco` — Pan de Coco | coconut bread, pan de coco | baked | A038 — Bread, pan de coco | 7/7 | grams |
| 18 | `cooked-sotanghon-noodles` — Cooked Sotanghon Noodles | sotanghon, boiled sotanghon, glass noodles | boiled | A135 — Noodles, mung bean starch, boiled | 7/7 | grams |
| 19 | `cooked-bihon-noodles` — Cooked Bihon Noodles | bihon, boiled bihon, rice vermicelli | boiled | A138 — Noodles, rice, boiled | 7/7 | grams |
| 20 | `cooked-misua-noodles` — Cooked Misua Noodles | misua, miswa, boiled misua | boiled | A145 — Noodles, wheat, thin, boiled | 7/7 | grams |
| 21 | `cooked-miki-noodles` — Cooked Miki Noodles | miki, boiled miki | boiled | A147 — Noodles, wheat, miki, dry, boiled | 7/7 | grams |
| 22 | `cooked-spaghetti-noodles` — Cooked Spaghetti Noodles | boiled spaghetti, plain spaghetti noodles | boiled | A154 — Pasta, spaghetti, boiled | 7/7 | grams |
| 23 | `plain-lugaw` — Plain Lugaw | lugaw, rice porridge, thin rice gruel | cooked | A183 — Rice gruel, thin | 7/7 | grams |

### 5.2 Proteins, fish, seafood, eggs, and tofu — 14 new records

Source pages: [PhilFCT category C](https://i.fnri.dost.gov.ph/fct/library/food_content/C), [F](https://i.fnri.dost.gov.ph/fct/library/food_content/F), [G](https://i.fnri.dost.gov.ph/fct/library/food_content/G), and [H](https://i.fnri.dost.gov.ph/fct/library/food_content/H).

| # | Proposed ID and display name | Conservative aliases | Preparation | Exact source record | Required nutrients | Initial serving path |
|---:|---|---|---|---|---|---|
| 24 | `boiled-lean-beef-chuck` — Boiled Lean Beef Chuck | boiled beef chuck, nilagang baka paypay | boiled | F007 — Beef chuck, lean, boiled | 7/7 | grams |
| 25 | `grilled-lean-beef` — Grilled Lean Beef | grilled beef, inihaw na baka | grilled | F017 — Beef lean meat, broiled | 7/7 | grams |
| 26 | `fried-lean-beef` — Fried Lean Beef | fried beef, pritong baka | fried | F018 — Beef lean meat, fried | 7/7 | grams |
| 27 | `grilled-pork-belly` — Grilled Pork Belly | grilled liempo, inihaw na liempo | grilled | F148 — Pork belly, broiled | 7/7 | grams |
| 28 | `fried-pork-belly` — Fried Pork Belly | fried liempo, pritong liempo | fried | F149 — Pork belly, fried | 7/7 | grams |
| 29 | `boiled-chicken-white-meat` — Boiled Chicken White Meat | boiled chicken meat, nilagang laman ng manok | boiled | F111 — Chicken, white meat, boiled | 7/7 | grams |
| 30 | `fried-chicken-white-meat` — Fried Chicken White Meat | fried chicken meat, pritong laman ng manok | fried | F112 — Chicken, white meat, fried | 7/7 | grams |
| 31 | `grilled-milkfish` — Grilled Milkfish | grilled bangus, inihaw na bangus | grilled | G075 — Milkfish, broiled | 7/7 | grams |
| 32 | `fried-milkfish` — Fried Milkfish | fried bangus, pritong bangus | fried | G076 — Milkfish, fried | 7/7 | grams |
| 33 | `fried-hasa-hasa` — Fried Hasa-Hasa | fried short-bodied mackerel, pritong hasa-hasa | fried | G071 — Mackerel, short-bodied, fried | 7/7 | grams |
| 34 | `smoked-galunggong` — Smoked Galunggong | tinapang galunggong, smoked round scad | smoked | G208 — Scad, round, smoked | 7/7 | grams |
| 35 | `boiled-squid` — Boiled Squid | boiled pusit, nilagang pusit | boiled | G132 — Squid, boiled | 7/7 | grams |
| 36 | `boiled-quail-egg` — Boiled Quail Egg | boiled quail eggs, nilagang itlog ng pugo | boiled | H011 — Egg, quail, boiled | 7/7 | grams; no piece conversion |
| 37 | `firm-tofu` — Firm Tofu | tokwa, hard tofu, soybean hard curd | prepared | C064 — Soybean cheese, hard curd | 7/7 | grams |

### 5.3 Prepared Filipino foods and dishes — 19 new records

Source pages: [PhilFCT category A](https://i.fnri.dost.gov.ph/fct/library/food_content/A), [C](https://i.fnri.dost.gov.ph/fct/library/food_content/C), [E](https://i.fnri.dost.gov.ph/fct/library/food_content/E), [F](https://i.fnri.dost.gov.ph/fct/library/food_content/F), [G](https://i.fnri.dost.gov.ph/fct/library/food_content/G), and [R](https://i.fnri.dost.gov.ph/fct/library/food_content/R).

| # | Proposed ID and display name | Conservative aliases | Preparation | Exact source record | Required nutrients | Initial serving path |
|---:|---|---|---|---|---|---|
| 38 | `mung-bean-siopao` — Mung Bean Siopao | siopao munggo, munggo siopao | steamed | R004 — Steamed bun, mung bean filling | 4/7; fiber, sugar, sodium unavailable | grams |
| 39 | `pork-siopao` — Pork Siopao | siopao baboy, pork steamed bun | steamed | R005 — Steamed bun, pork filling | 4/7; fiber, sugar, sodium unavailable | grams |
| 40 | `meat-empanada` — Meat Empanada | empanada, meat pie | prepared | R009 — Meat pie | 7/7 | grams |
| 41 | `arroz-caldo` — Arroz Caldo | chicken rice gruel, lugaw with chicken | cooked | R011 — Rice gruel w/ chicken | 7/7 | grams |
| 42 | `goto` — Goto | lugaw with tripe, rice gruel with tripe | cooked | R013 — Rice gruel w/ tripe | 7/7 | grams |
| 43 | `mung-bean-soup-with-shrimp` — Mung Bean Soup with Shrimp | munggo with shrimp, ginisang munggo with shrimp | cooked | R077 — Soup, mungbean w/ shrimp, ckd | 7/7 | grams |
| 44 | `pork-siomai` — Pork Siomai | siomai, pork dumpling, pork wonton | prepared | R108 — Pork ball, wrapped | 7/7 | grams; no piece conversion |
| 45 | `lechon-manok` — Lechon Manok | roasted seasoned chicken, litson manok | roasted | F265 — Chicken, whole, seasoned, roasted | 7/7 | grams |
| 46 | `pork-barbecue` — Pork Barbecue | pork bbq, barbekyung baboy | barbecued | F267 — Pork, bbq | 6/7; sugar unavailable | grams; no stick conversion |
| 47 | `fried-fish-ball` — Fried Fish Ball | fishball, fried fishball | fried | G162 — Fish ball, fried | 7/7 | grams; no piece conversion |
| 48 | `kikiam` — Kikiam | quekiam, fish preparation kikiam | prepared | G163 — Fish preparation, quekiam | 4/7; fiber, sugar, sodium unavailable | grams; no piece conversion |
| 49 | `beef-jerky-tapa` — Beef Jerky (Tapa) | beef tapa, tapa baka | dried | F215 — Beef jerky | 7/7 | grams |
| 50 | `pork-tocino` — Pork Tocino | tocino, sweet cured pork | cured | F245 — Pork, sweet cured | 7/7 | grams |
| 51 | `pork-longganisa` — Pork Longganisa | pork longanisa, longganisang baboy | prepared | F257 — Sausage, pork | 6/7; sugar unavailable | grams; no piece conversion |
| 52 | `pork-chicharon` — Pork Chicharon | chicharon balat, pork crackling | fried | F242 — Pork crackling, skin | 7/7 | grams |
| 53 | `cooked-chicken-instant-noodles` — Cooked Chicken Instant Noodles | chicken instant noodles, cooked chicken noodles | cooked | A205 — Instant noodles, chicken flvr, ckd | 7/7 | grams |
| 54 | `halo-halo-with-ice` — Halo-Halo with Ice | halo halo, haluhalo | prepared | R019 — Halu-halo, w/ ice | 4/7; fiber, sugar, sodium unavailable | grams; no bowl/serving conversion |
| 55 | `taho-with-syrup-and-sago` — Taho with Syrup and Sago | taho, taho with arnibal | prepared | C066 — Soybean pudding/Geerlig's cheese w/ syrup & tapioca starch ball | 7/7 | grams; no cup conversion |
| 56 | `turon` — Turon | banana turon, lumpiang saging | fried | E102 — Banana, saba, w/ sugar, wrapped, fried | 7/7 | grams; no piece conversion |

### 5.4 Fruits and vegetables — 13 new records

Source pages: [PhilFCT category D](https://i.fnri.dost.gov.ph/fct/library/food_content/D) and [E](https://i.fnri.dost.gov.ph/fct/library/food_content/E).

| # | Proposed ID and display name | Conservative aliases | Preparation | Exact source record | Required nutrients | Initial serving path |
|---:|---|---|---|---|---|---|
| 57 | `ripe-carabao-mango` — Ripe Carabao Mango | ripe mango, manggang kalabaw, hinog na mangga | raw | E051 — Mango, Manila super, ripe | 7/7 | grams |
| 58 | `ripe-papaya` — Ripe Papaya | papaya, hinog na papaya | raw | E069 — Papaya fruit, ripe | 7/7 | grams |
| 59 | `pineapple` — Pineapple | pinya, fresh pineapple | raw | E073 — Pineapple | 7/7 | grams |
| 60 | `red-guava` — Red Guava | guava, red guava, bayabas na pula | raw | E031 — Guava, red | 7/7 | grams |
| 61 | `guyabano` — Guyabano | soursop, guyabano fruit | raw | E083 — Soursop | 7/7 | grams |
| 62 | `chico` — Chico | sapodilla, tsiko | raw | E079 — Sapodilla | 7/7 | grams |
| 63 | `atis` — Atis | sugar apple, sweetsop | raw | E089 — Sugar apple/Sweetsop | 7/7 | grams |
| 64 | `watermelon` — Watermelon | pakwan | raw | E064 — Melon, watermelon | 7/7 | grams |
| 65 | `calamansi` — Calamansi | kalamansi, calamondin, Philippine lemon | raw | E023 — Calamansi/Philippine lemon | 7/7 | grams; no piece/juice conversion |
| 66 | `boiled-ampalaya` — Boiled Ampalaya | boiled bitter melon, nilagang ampalaya | boiled | D019 — Bitter melon/gourd fruit, boiled | 7/7 | grams |
| 67 | `boiled-eggplant` — Boiled Eggplant | boiled talong, nilagang talong | boiled | D074 — Eggplant, boiled | 7/7 | grams |
| 68 | `boiled-pechay-leaves` — Boiled Pechay Leaves | boiled pechay, nilagang petsay | boiled | D161 — Pechay lvs, boiled | 7/7 | grams |
| 69 | `boiled-kangkong-leaves` — Boiled Kangkong Leaves | boiled kangkong, nilagang kangkong, boiled water spinach | boiled | D243 — Swamp cabbage lvs, boiled | 7/7 | grams |

### 5.5 Breakfast foods, snacks, and desserts — 11 new records

Source pages: [PhilFCT category A](https://i.fnri.dost.gov.ph/fct/library/food_content/A), [B](https://i.fnri.dost.gov.ph/fct/library/food_content/B), and [M](https://i.fnri.dost.gov.ph/fct/library/food_content/M).

| # | Proposed ID and display name | Conservative aliases | Preparation | Exact source record | Required nutrients | Initial serving path |
|---:|---|---|---|---|---|---|
| 70 | `bibingkang-malagkit` — Bibingkang Malagkit | sticky rice bibingka, glutinous rice bibingka | prepared | A167 — Rice cake (glutinous), bibingka | 7/7 | grams |
| 71 | `biko` — Biko | sinukmani, glutinous rice biko | prepared | A168 — Rice cake (glutinous), biko | 7/7 | grams |
| 72 | `bibingka` — Bibingka | bibingkang galapong, rice cake bibingka | prepared | A173 — Rice cake, bibingka | 7/7 | grams |
| 73 | `puto-bumbong` — Puto Bumbong | purple puto bumbong | prepared | A175 — Rice cake, puto bumbong, purple | 7/7 | grams |
| 74 | `puto` — Puto | puto puti, white rice cake | prepared | A177 — Rice cake, puto, white | 7/7 | grams |
| 75 | `kutsinta` — Kutsinta | cuchinta, brown rice cake | prepared | A179 — Rice cake, cuchinta | 7/7 | grams |
| 76 | `palitaw` — Palitaw | glutinous rice palitaw | prepared | A188 — Rice prep (glutinous), palitaw | 7/7 | grams |
| 77 | `suman-sa-ibos` — Suman sa Ibos | suman ibos, sticky rice suman | prepared | A191 — Rice prep (glutinous), suman sa ibos | 7/7 | grams |
| 78 | `cassava-cake` — Cassava Cake | cassava bibingka, bibingkang kamoteng kahoy | prepared | B026 — Cassava cake, bibingka | 7/7 | grams |
| 79 | `yema` — Yema | custard candy, Filipino yema | prepared | M004 — Candy, custard | 7/7 | grams |
| 80 | `polvoron` — Polvoron | pulburon, powdered milk shortbread | prepared | M040 — Polvoron | 7/7 | grams |

## 6. Required-Nutrient Summary

Among the 69 proposed new records:

- 63 report all seven required nutrient fields;
- R004 Mung Bean Siopao reports calories, protein, carbohydrates, and fat; fiber, sugar, and sodium are unavailable;
- R005 Pork Siopao reports calories, protein, carbohydrates, and fat; fiber, sugar, and sodium are unavailable;
- F267 Pork Barbecue does not report sugar;
- G163 Kikiam reports calories, protein, carbohydrates, and fat; fiber, sugar, and sodium are unavailable;
- F257 Pork Longganisa does not report sugar;
- R019 Halo-Halo with Ice reports calories, protein, carbohydrates, and fat; fiber, sugar, and sodium are unavailable.

These six records are safe to model only if the unavailable fields remain `null` throughout calculation, logging, editing, aggregation, and display.

## 7. Serving-Conversion Finding

The source reports nutrient composition per 100 g edible portion and an edible-portion percentage. It does not provide a reliable household weight for the selected candidates in the reviewed pages.

Therefore:

- every proposed new record initially supports grams only;
- no piece conversion is approved for corn, quail eggs, siomai, fish balls, turon, or rice cakes;
- no stick conversion is approved for pork barbecue;
- no cup, bowl, glass, plate, or generic serving conversion is approved;
- no mL path is introduced for taho or halo-halo because the reviewed source basis is mass, not volume;
- V2-F3 must not add a conversion merely to improve convenience.

## 8. Matching and Alias Risks for V2-F4

The following generic inputs must produce ambiguity or request more detail rather than silently selecting one food:

- `rice`: cooked white rice, fried rice, cooked purple glutinous rice, and rice-based snacks;
- `bread`: pandesal, ensaymada, pan de coco, and siopao variants;
- `noodles`: sotanghon, bihon, misua, miki, spaghetti, and instant noodles;
- `chicken`: existing grilled/fried/roasted records plus boiled white meat, fried white meat, and lechon manok;
- `beef`: boiled, grilled, fried, and tapa records;
- `pork`: pork belly preparations, barbecue, tocino, longganisa, chicharon, siopao, and siomai;
- `egg`: fried egg, boiled chicken egg, and boiled quail egg;
- `bangus` or `milkfish`: grilled and fried records;
- `bibingka`: bibingkang malagkit, galapong bibingka, and cassava bibingka;
- `lugaw`: plain lugaw, arroz caldo, and goto;
- `banana`: generic banana, saba banana, and the preparation-specific turon record.

V2-F2 must add collision validation/reporting before V2-F3, and V2-F4 must test every documented generic query.

## 9. Popular Foods Blocked from This Inventory

These foods were investigated but are not approved candidates because the reviewed authoritative source did not provide a direct generic prepared-food match. Similar ingredients, canned versions, or uncooked versions are not equivalent.

| Requested/common concept | Finding | Decision |
|---|---|---|
| Chicken adobo | PhilFCT exposes canned pork-and-chicken adobo, not a generic cooked chicken-adobo record | Block; do not substitute canned or pork values |
| Pork adobo | PhilFCT exposes a canned pork-adobo record | Block generic pork adobo; a separately labeled canned record would require user approval |
| Sinigang | No direct reviewed PhilFCT prepared-food record | Block |
| Tinola | No direct reviewed PhilFCT prepared-food record | Block |
| Beef or pork nilaga | Ingredient records exist, but no direct composite dish record was verified | Block |
| Menudo | No direct reviewed PhilFCT prepared-food record | Block |
| Afritada | A canned pork-afritada record exists, not a generic home-prepared record | Block generic afritada |
| Caldereta | A canned beef-caldereta record exists, not a generic home-prepared record | Block generic caldereta |
| Kare-kare | A canned beef-kare-kare entry exists and its edible-portion metadata is unavailable | Block |
| Dinuguan | A canned pork-blood-stew entry exists and its edible-portion metadata is unavailable | Block generic dinuguan |
| Sisig | No direct reviewed PhilFCT prepared-food record | Block |
| Laing | No direct reviewed PhilFCT prepared-food record | Block |
| Pinakbet | No direct reviewed PhilFCT prepared-food record | Block |
| Pancit bihon or pancit canton dish | Plain noodle records exist, but no direct prepared-dish match was verified | Include only explicitly plain cooked noodles; block generic pancit dishes |
| Tortang talong | No direct reviewed PhilFCT prepared-food record | Block |
| Cooked lumpiang Shanghai | PhilFCT exposes an uncooked Shanghai spring-roll record | Block cooked result; do not treat raw and cooked values as equivalent |
| Chicken inasal | No direct reviewed PhilFCT prepared-food record | Block |

## 10. Review Decision Record

On 2026-11-02, the user approved for planning:

1. the exact 80-record implementation inventory;
2. retention of all six partial-nutrient candidates with explicit `null` values;
3. grams-only support for every proposed new implementation record;
4. the documented ambiguity groups and conservative aliases as the starting point for later matching work;
5. keeping popular unsourced dishes blocked rather than approximating them;
6. the supplemental client-priority table as a source-and-scope review queue, without approving branded or restaurant application records.

The remaining blocker is DOST-FNRI reuse clarification before PhilFCT nutrient values are committed, or a later decision to replace affected candidates with separately verified permissively licensed authoritative sources. No V2-F2 architecture change and no V2-F3 food record may begin until the source-use question is resolved.

## 11. Client-Priority Foods Added for Source-Matrix Review

The client identified the foods below as frequent real-world choices on 2026-11-02. This table adds every request without removing or silently replacing any record in the proposed 80-record inventory.

The original implementation inventory remains 80 records until this supplemental list passes source, scope, and count review. An existing record is referenced instead of duplicated. A related record is not treated as equivalent when preparation, ingredients, brand, market, or portion metadata differ.

| Client wording | Matrix disposition | Proposed identity or existing record | Source finding | Serving and implementation decision |
|---|---|---|---|---|
| Mongo bean soup | Related, but not an exact existing match | New candidate: `mung-bean-soup` — Mung Bean Soup; conservative aliases: munggo soup, mongo bean soup, monggo soup | Proposed record #43 is **Mung Bean Soup with Shrimp** from PhilFCT R077. A shrimp-containing dish must not represent an unspecified mung bean soup. No direct generic prepared-food source is approved yet. | Block pending an exact authoritative prepared-food source or a separately approved standardized-recipe method; do not alias the generic request to R077. |
| Fried milkfish, half of half, tail part | Food identity already covered | Proposed record #32: `fried-milkfish` — Fried Milkfish | PhilFCT G076 directly represents fried milkfish. | Food match is verified, but “half of half” describes an approximate quarter-fish tail section, not a sourced edible weight. Support grams only; weigh the edible cooked portion and do not create a quarter/tail conversion. |
| Garlic fried rice | Related, but not an exact existing match | New candidate: `garlic-fried-rice` — Garlic Fried Rice; conservative aliases: garlic rice, sinangag with garlic | Proposed record #12 uses PhilFCT A021, whose description is generic fried rice. The reviewed source does not establish that it is a garlic-specific preparation. | Block the distinct garlic record pending a direct authoritative match. If later approved, review the current `sinangag` alias so generic and garlic-specific fried rice do not silently collide. |
| Fried egg | Exact existing record | Existing record #4: `fried-egg` — Fried Egg | USDA FDC 173423 — Egg, whole, cooked, fried. | Already present; retain its existing grams and sourced large-piece descriptor behavior. Do not add a duplicate. |
| Pork broth | New candidate requiring identity clarification | `pork-broth` — Pork Broth; possible alias after review: pork stock | “Pork broth” may mean strained homemade broth, stock, bouillon, or a prepared soup. No exact authoritative reference has been approved. | Block until the intended broth type and direct source are fixed. Model as a volume-based liquid using mL only if the approved source provides a compatible volume reference; do not infer density or a cup conversion. |
| Jollibee one-piece Chickenjoy, breast part, with small gravy | New branded restaurant candidate outside the approved catalog scope | `jollibee-chickenjoy-breast-with-small-gravy` — Jollibee Chickenjoy Breast with Small Gravy | The [Jollibee Philippines Help Center](https://help.jollibee.com.ph/hc/en-ph/articles/12480232690319-Where-can-I-see-the-menu) confirms the Philippine menu path, but no reviewed official Philippine nutrition reference was found for this exact chicken part plus gravy combination. United States menu nutrition must not be substituted for the Philippine product. | Block pending an explicit branded/restaurant scope amendment and official Philippine nutrition for the exact composite item. Piece size and gravy quantity may vary; do not combine generic fried chicken with an assumed gravy value. |
| Pinakbet | Already investigated and blocked | Candidate remains `pinakbet` — Pinakbet | Section 9 records that no direct authoritative prepared-food match was verified. | Keep blocked; do not calculate it from an undocumented recipe or substitute isolated vegetables. |
| Banana lakatan | New direct source match | `banana-lakatan` — Banana Lakatan; aliases: lakatan banana, lakatan, lacatan banana, saging lakatan | [PhilFCT E011](https://i.fnri.dost.gov.ph/fct/library/report/3593) — Banana, lacatan; alternate name “Saging, lakatan”; values reported per 100 g edible portion with all seven required nutrients. | Eligible for the reviewed candidate pool after PhilFCT reuse permission is resolved. Support grams only; no piece or size conversion is sourced. Keep distinct from generic Banana and Saba Banana. |
| Boiled egg | Exact existing record | Existing record #5: `boiled-egg` — Boiled Egg | PhilFCT H004 — Egg, chicken, whole, boiled. | Already present; retain grams-only behavior. Do not add a duplicate or borrow Fried Egg serving metadata. |
| Century Tuna, canned | New branded packaged-food request outside the approved catalog scope | Exact ID deferred until the client identifies the product, such as flakes/chunks, oil/brine, flavor, and can size | [Century Pacific](https://www.centurypacific.com.ph/brands/centurytuna/) confirms multiple Century Tuna product families, media, flavors, and package sizes. “Century Tuna” is not one nutritionally exact SKU, and the reviewed manufacturer page does not provide all required label values for a selected SKU. | Block pending an explicit branded-food scope amendment, exact variant and can size, and a clear current manufacturer nutrition label. Store drained or undrained basis exactly as stated; do not average variants. |
| San Marino Corned Tuna, canned | New branded packaged-food request outside the approved catalog scope | Candidate identity deferred; likely Original, but flavor and can size must be confirmed | The [official San Marino product page](https://sanmarino.com.ph/microsites/san-marino/) lists Original, Chili, Spanish Style, Afritada, Adobo, Caldereta, and multiple package sizes. The page does not establish one nutrition profile for the client's unspecified can. | Block pending an explicit branded-food scope amendment, exact flavor and can size, and a clear current manufacturer nutrition label. Do not treat different flavors or sizes as equivalent. |
| Argentina Corned Beef, canned | New branded packaged-food request outside the approved catalog scope | Candidate identity deferred until the exact can size and current formulation are confirmed | [Century Pacific](https://www.centurypacific.com.ph/brands/argentina/) confirms Argentina Corned Beef as a product, but the reviewed official page does not provide the complete required nutrient panel for a selected current SKU. | Block pending an explicit branded-food scope amendment, exact can size, and a clear current manufacturer nutrition label. Do not use a reseller transcription or another country's formulation as the authoritative record. |

### 11.1 Supplemental source and scope decisions

Before any supplemental candidate becomes application data:

1. Decide whether the catalog may expand beyond the current exact 80 records while remaining within the approved 60–100 total range.
2. Decide whether branded packaged foods and restaurant items may amend the V2-F0 exclusion; adding them is not authorized by recording them for review.
3. Obtain the exact product variant, package size, market, and clear current nutrition-label photographs for every approved packaged-food candidate.
4. Keep restaurant, packaged, generic, and preparation-specific foods separate; do not substitute a foreign-market product or a related generic food.
5. Keep direct household descriptions such as a quarter tail section as user context only unless a food-specific edible-weight conversion is sourced.
6. Preserve the existing DOST-FNRI permission blocker for PhilFCT-derived records, including Banana Lakatan.
