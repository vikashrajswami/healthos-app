/*
  AROGYOS AI — fully in-app, zero external API
  Intent-based engine: phrase match → keyword score → category fallback → default
*/

const INTENTS = [

  // ══════════════════════════════════════
  // BIOLOGICAL AGE
  // ══════════════════════════════════════
  {
    id: 'bioage_what',
    phrases: ['what is bioage','what is bio age','biological age mean','bioage mean','what does bioage','explain bioage','explain bio age'],
    keys: ['bioage','biological age','bio age'],
    r: `Your BioAge (Biological Age) is how old your body actually is — based on health data, not your birth certificate.

It's calculated from:
• Lab biomarkers — LDL, hsCRP, HbA1c, Vitamin D, testosterone and more
• Lifestyle habits — exercise, sleep, diet, smoking status
• Wearable data — HRV, sleep stages, VO2 max (when device is connected)

BioAge lower than actual age → your body is biologically younger 🎉
BioAge higher than actual age → lifestyle is accelerating ageing

The powerful truth: BioAge is reversible. Every healthy habit you build lowers it. AROGYOS tracks your progress so you see the impact in real numbers — not guesswork.`,
  },

  {
    id: 'bioage_lower',
    phrases: ['how to lower bioage','how to reduce bioage','lower my bioage','reduce biological age','improve bioage','decrease bioage','reverse biological age','reverse ageing','reverse aging'],
    keys: ['lower bioage','reduce bioage','improve bioage','reverse age'],
    r: `Top ways to lower your BioAge — ranked by scientific impact:

1. Sleep 7-8 hours consistently — the single most powerful intervention
2. Zone 2 cardio 4-5x per week (45 min brisk walk/jog) — builds mitochondria
3. Strength training 2-3x per week — preserves muscle, improves insulin sensitivity
4. Reduce hsCRP inflammation — omega-3, turmeric, cut sugar and processed food
5. Control blood sugar — low GI diet, intermittent fasting (7PM–7AM minimum)
6. Reduce stress — chronic cortisol destroys telomeres and accelerates ageing
7. Check Vitamin D — get a blood test first, then discuss supplementation with your doctor if deficient
8. Quit smoking — most impactful single habit change (+5–7 years BioAge improvement)

⚕️ For supplement or medication decisions, always consult your doctor. The above are general lifestyle guidelines, not medical prescriptions.

Your AROGYOS Protocol screen has the full habit checklist. Tap Protocol in the bottom nav.`,
  },

  {
    id: 'bioage_calculate',
    phrases: ['how is bioage calculated','how bioage is calculated','how do you calculate bioage','bioage calculation','how is biological age measured'],
    keys: ['calculate bioage','bioage calculated','measure biological'],
    r: `AROGYOS calculates your BioAge in two ways:

QUIZ-BASED (instant estimate):
• Exercise: Very active = -3 yrs | Moderate = -1 yr | Sedentary = +3 yrs
• Smoking: Never/Quit = 0 | Ex-smoker = +1 yr | Current smoker = +5 yrs
• Sleep: Great (7-8h) = -2 yrs | Average = +1 yr | Poor (<5h) = +3 yrs
• Diet: Healthy = -2 yrs | Mixed = +1 yr | Unhealthy = +3 yrs

LAB REPORT UPGRADE (more accurate):
When you upload a blood test, the AI reads your actual biomarkers — hsCRP, LDL, HbA1c, Vitamin D, testosterone — and refines your BioAge with clinical precision.

WEARABLE DATA (continuous):
HRV, VO2 max, sleep stages from connected devices improve accuracy daily.

Upload your lab report for the most accurate BioAge reading.`,
  },

  // ══════════════════════════════════════
  // LAB REPORTS
  // ══════════════════════════════════════
  {
    id: 'upload_how',
    phrases: ['how to upload','how do i upload','upload report','upload lab','upload blood test','how to add report','upload a report','how to upload a report'],
    keys: ['upload','lab report','blood test','pdf'],
    r: `Uploading your lab report is simple:

1. Tap the Reports tab (document icon) in the bottom navigation
2. You'll see a drag-and-drop area — tap it or drag your file onto it
3. Select your PDF or photo (JPG/PNG) of the lab report
4. AROGYOS AI reads all the biomarkers automatically
5. Your BioAge updates based on the real data

Supported formats: PDF files and phone photos of your report
Works with any lab: NABL-certified diagnostic centers, government hospitals (AIIMS, civil hospitals), and any international lab.

Tip: Make sure the photo is clear with no glare — the AI needs to read the printed values.`,
  },

  {
    id: 'upload_which_labs',
    phrases: ['which lab','what labs work','does it work with','lal pathlabs','thyrocare','srl labs','apollo lab'],
    keys: ['lab','lal path','thyrocare','srl','apollo diagnostic','metropolis'],
    r: `AROGYOS works with reports from ANY lab — there's no restriction.

What works perfectly:
• Any NABL-certified diagnostic lab in your city
• Government hospitals (AIIMS, civil hospitals, medical colleges)
• Any local diagnostic center
• Home collection services

International labs also supported:
• NHS (UK)
• Quest Diagnostics (US)
• LabCorp (US)
• Any European or Asian lab

As long as the report is a clear PDF or photo, the AI can read the biomarker values regardless of which lab printed it.`,
  },

  // ══════════════════════════════════════
  // BIOMARKERS — hsCRP
  // ══════════════════════════════════════
  {
    id: 'hscrp',
    phrases: ['hscrp','hs-crp','c-reactive protein','crp level','inflammation marker','what is crp','high inflammation','high crp'],
    keys: ['hscrp','crp','inflammation'],
    r: `hsCRP (high-sensitivity C-Reactive Protein) measures inflammation in your body.

RANGES:
• Optimal: below 1.0 mg/L
• Borderline: 1.0 – 3.0 mg/L
• High risk: above 3.0 mg/L

Why it matters for BioAge: Chronic inflammation is the #1 silent driver of biological ageing. High hsCRP accelerates damage to blood vessels, brain, and every organ.

General lifestyle steps that support healthy inflammation levels:
• Eat omega-3 rich foods — fatty fish, flaxseeds, walnuts (food-first approach)
• Turmeric with black pepper added to meals
• Cut sugar, refined carbs, and ultra-processed food
• Sleep 7–8 hours — poor sleep spikes inflammation overnight
• Zone 2 cardio 4–5x/week
• Reduce chronic stress

⚕️ If your hsCRP is persistently above 3.0 mg/L, consult your doctor to rule out an underlying cause before making any supplement or treatment decisions.

Re-test after 90 days of consistent lifestyle changes.`,
  },

  // ══════════════════════════════════════
  // BIOMARKERS — LDL
  // ══════════════════════════════════════
  {
    id: 'ldl',
    phrases: ['high ldl','what is ldl','ldl cholesterol','bad cholesterol','ldl level','what does ldl mean','ldl too high'],
    keys: ['ldl','bad cholesterol','cholesterol'],
    r: `LDL (Low-Density Lipoprotein) is often called "bad" cholesterol.

RANGES:
• Optimal (with heart risk): below 70 mg/dL
• Good: below 100 mg/dL
• Borderline: 100–129 mg/dL
• High: 130–159 mg/dL
• Very high: above 160 mg/dL

Why it matters: High LDL forms plaque in arteries, raising heart attack risk and biological age. It often has NO symptoms.

How to lower it naturally:
• Increase soluble fibre — oats, moong dal, rajma, apples, psyllium husk
• Replace saturated fat with healthy fats — olive oil, nuts, avocado
• Exercise (especially cardio) reduces LDL by 5-15%
• Reduce red meat and full-fat dairy
• Plant sterols (found in nuts and seeds)
• Quit smoking (raises HDL which removes LDL)

If LDL is above 190 mg/dL, see a doctor — medication may be needed alongside lifestyle changes.`,
  },

  // ══════════════════════════════════════
  // BIOMARKERS — HDL
  // ══════════════════════════════════════
  {
    id: 'hdl',
    phrases: ['hdl cholesterol','good cholesterol','what is hdl','hdl level','low hdl','high hdl'],
    keys: ['hdl','good cholesterol'],
    r: `HDL (High-Density Lipoprotein) is the "good" cholesterol — it removes LDL from your arteries.

RANGES:
• Optimal: above 60 mg/dL
• Acceptable: 40–60 mg/dL (men), 50–60 mg/dL (women)
• Low (risk): below 40 mg/dL (men), below 50 mg/dL (women)

Higher HDL = better protection against heart disease and faster biological age improvement.

How to raise HDL:
• Cardio exercise — the #1 way to raise HDL (adds 5-10% in 3 months)
• Healthy fats — olive oil, avocado, almonds, walnuts
• Quit smoking — smoking directly suppresses HDL
• Reduce refined carbs and sugar
• Moderate weight loss if overweight

HDL above 60 actually acts as a protective factor and can lower your cardiovascular BioAge risk score.`,
  },

  // ══════════════════════════════════════
  // BIOMARKERS — HbA1c / Blood Sugar
  // ══════════════════════════════════════
  {
    id: 'hba1c',
    phrases: ['hba1c','hb a1c','blood sugar','diabetes','pre-diabetic','prediabetic','a1c level','what is hba1c','high blood sugar','sugar level'],
    keys: ['hba1c','blood sugar','diabetes','a1c','glucose'],
    r: `HbA1c shows your average blood sugar over the last 3 months.

RANGES:
• Optimal: below 5.0%
• Normal: 5.0 – 5.6%
• Pre-diabetic: 5.7 – 6.4%
• Diabetic: 6.5% and above

Why it matters for BioAge: High blood sugar damages every organ through a process called glycation — literally "caramelising" your tissues. It ages your kidneys, eyes, nerves, and heart simultaneously.

How to lower HbA1c:
• Low glycaemic index diet — brown rice, dal, vegetables, whole grains instead of white rice/bread/sugar
• Intermittent fasting (7PM–7AM minimum) — gives insulin a rest
• Walk 10-15 mins after every meal — dramatically lowers post-meal glucose spikes
• Strength training — muscles absorb glucose directly, reducing blood sugar
• Some people discuss berberine with their doctor as a complementary approach — always consult your doctor before any supplement, especially alongside diabetes medication
• Cinnamon added to food — modest supportive effect

Test again after 90 days — HbA1c responds well to lifestyle changes.`,
  },

  // ══════════════════════════════════════
  // BIOMARKERS — Vitamin D
  // ══════════════════════════════════════
  {
    id: 'vitamin_d',
    phrases: ['vitamin d','vitamin-d','vit d','vitamin d level','vitamin d deficiency','low vitamin d','what is vitamin d'],
    keys: ['vitamin d','vit d'],
    r: `Vitamin D is one of the most critical nutrients for biological age — and most Indians are deficient.

RANGES:
• Deficient: below 20 ng/mL
• Insufficient: 20–29 ng/mL
• Optimal for longevity: 40–60 ng/mL
• Toxic: above 100 ng/mL

Why it matters: Vitamin D isn't just a vitamin — it's a hormone that regulates 200+ genes. Deficiency is linked to faster ageing, poor immunity, low testosterone, depression, and bone loss.

How to improve Vitamin D levels:
• Sunlight: 20 minutes of direct sun on arms and legs daily (before 10am or after 4pm in India)
• Food sources: fatty fish, egg yolks, fortified milk or cereals
• If supplementing: always get your blood level tested first — the right dose depends on how low your level is

⚕️ Consult your doctor before starting Vitamin D supplements. The correct dose varies significantly by individual and requires a blood test to determine safely.

Re-test in 90 days to confirm your level is improving.`,
  },

  // ══════════════════════════════════════
  // BIOMARKERS — Vitamin B12
  // ══════════════════════════════════════
  {
    id: 'vitamin_b12',
    phrases: ['vitamin b12','b12 level','b12 deficiency','low b12','what is b12','b12 deficient'],
    keys: ['b12','vitamin b12','cobalamin'],
    r: `Vitamin B12 is essential for nerve function, DNA repair, energy production, and red blood cell formation.

RANGES:
• Deficient: below 200 pg/mL
• Low normal: 200–300 pg/mL (supplement even here)
• Optimal: 400–800 pg/mL

Who is most at risk:
• Vegetarians and vegans (no animal products = no B12)
• People over 50 (stomach acid declines, reducing absorption)
• Those on Metformin (depletes B12 actively)

Symptoms of deficiency: fatigue, brain fog, tingling in hands/feet, anaemia

How to fix it:
• Food sources: eggs, fish, paneer, curd (vegetarians), meat and seafood (non-veg)
• Vegans have no plant source of true B12 and should discuss supplementation with their doctor
• If your blood test shows deficiency, ask your doctor about the right form and dose — methylcobalamin is generally considered better absorbed than cyanocobalamin
• Severe deficiency (below 150 pg/mL) may require injections — your doctor will advise

This is one of the most common and most fixable causes of premature ageing in India.`,
  },

  // ══════════════════════════════════════
  // BIOMARKERS — Testosterone
  // ══════════════════════════════════════
  {
    id: 'testosterone',
    phrases: ['testosterone level','low testosterone','what is testosterone','testosterone deficiency','testosterone and age'],
    keys: ['testosterone','test level'],
    r: `Testosterone is crucial for muscle mass, bone density, energy, libido, and biological age for both men and women.

MEN — RANGES:
• Optimal: 600–900 ng/dL
• Normal: 300–600 ng/dL
• Low (hypogonadism): below 300 ng/dL

WOMEN — RANGES:
• Normal: 15–70 ng/dL

Testosterone naturally declines ~1% per year after age 30 — but lifestyle can dramatically slow this.

How to raise testosterone naturally:
• Strength training (2-3x/week) — the most powerful natural stimulus
• Sleep 8 hours — testosterone is produced during deep sleep; poor sleep drops it 10-15% per night
• Fix Vitamin D — D3 is a direct precursor to testosterone production
• Zinc-rich foods — meat, shellfish, pumpkin seeds, legumes support testosterone synthesis
• Reduce stress — cortisol and testosterone have an inverse relationship
• Ashwagandha — studied for cortisol reduction and hormonal support; discuss with your doctor before use
• Healthy fats — testosterone is made from cholesterol; very low-fat diets can suppress it

⚕️ If levels are below 300 ng/dL (men) with symptoms like fatigue, low libido, or muscle loss, see a doctor. Testosterone therapy requires medical supervision.`,
  },

  // ══════════════════════════════════════
  // BIOMARKERS — Cortisol / Stress
  // ══════════════════════════════════════
  {
    id: 'cortisol',
    phrases: ['cortisol level','high cortisol','what is cortisol','stress hormone','cortisol and ageing','cortisol and aging','reduce cortisol','how to reduce stress'],
    keys: ['cortisol','stress hormone'],
    r: `Cortisol is your stress hormone — essential in short bursts, but chronically high cortisol is one of the fastest ways to accelerate biological ageing.

RANGES (morning serum):
• Normal: 6–23 μg/dL
• High: consistent elevation = chronic stress

Why it damages BioAge:
• Shrinks the hippocampus (brain memory centre)
• Breaks down muscle tissue (muscle is your longevity organ)
• Raises blood sugar and inflammation
• Suppresses testosterone and immune function
• Damages telomeres — the literal caps on your DNA

How to lower cortisol:
• Ashwagandha — studied for cortisol reduction; consult your doctor before starting any adaptogen
• 4-7-8 breathing: inhale 4 counts, hold 7, exhale 8 — activates vagus nerve instantly
• Meditation 10-20 min/day — reduces cortisol by 20% in 8 weeks
• Consistent sleep schedule — irregular sleep patterns are a major cortisol driver
• No caffeine after 1pm — caffeine spikes cortisol in the afternoon
• Zone 2 exercise (not intense HIIT every day — overtraining raises cortisol)`,
  },

  // ══════════════════════════════════════
  // BIOMARKERS — Homocysteine
  // ══════════════════════════════════════
  {
    id: 'homocysteine',
    phrases: ['homocysteine','homocystiene','what is homocysteine','high homocysteine'],
    keys: ['homocysteine'],
    r: `Homocysteine is an amino acid in your blood. Elevated levels are a major but often overlooked risk factor.

RANGES:
• Optimal: below 8 μmol/L
• Normal: below 10 μmol/L
• Elevated: above 15 μmol/L (significant risk)
• Very high: above 20 μmol/L

Why it matters: High homocysteine damages the inner lining of blood vessels, increases stroke and heart attack risk, and is strongly linked to Alzheimer's disease and accelerated brain ageing.

How to lower it (general lifestyle):
• Eat B12-rich foods — eggs, fish, dairy, or discuss B12 supplementation with your doctor
• Eat folate-rich foods — leafy greens, legumes, chickpeas, lentils
• These B vitamins (B12, folate/B9, B6) work together to convert homocysteine into harmless compounds

⚕️ If your homocysteine is above 15 μmol/L, consult your doctor. High homocysteine can have underlying causes that need medical evaluation — do not self-treat with supplements without professional guidance.

Common in vegetarians and vegans due to B12 deficiency — discuss this with your doctor.`,
  },

  // ══════════════════════════════════════
  // BIOMARKERS — Thyroid / TSH
  // ══════════════════════════════════════
  {
    id: 'thyroid',
    phrases: ['thyroid','tsh level','tsh test','what is tsh','hypothyroid','hyperthyroid','thyroid and weight','thyroid problem'],
    keys: ['thyroid','tsh'],
    r: `TSH (Thyroid Stimulating Hormone) controls your metabolic rate — how fast your body burns energy.

RANGES:
• Optimal for longevity: 0.5–2.5 mIU/L
• Normal clinical range: 0.4–4.0 mIU/L
• Hypothyroid (underactive): above 4.0 (fatigue, weight gain, cold intolerance)
• Hyperthyroid (overactive): below 0.4 (anxiety, weight loss, rapid heartbeat)

Why it matters for BioAge: Unoptimised thyroid function causes fatigue, weight gain, cognitive decline, and accelerated cardiovascular ageing.

Hypothyroidism is very common in India, especially in women. Symptoms include:
• Unexplained weight gain
• Fatigue even after good sleep
• Hair loss and dry skin
• Feeling cold when others don't
• Brain fog and poor memory

If TSH is above 4.0 with symptoms, see a doctor. Thyroid medication (levothyroxine) is highly effective and safe when prescribed correctly.

Natural support: selenium (200mcg/day) supports thyroid enzyme function. Avoid excessive raw cruciferous vegetables if hypothyroid.`,
  },

  // ══════════════════════════════════════
  // BIOMARKERS — Triglycerides
  // ══════════════════════════════════════
  {
    id: 'triglycerides',
    phrases: ['triglycerides','triglyceride level','high triglycerides','what are triglycerides'],
    keys: ['triglyceride'],
    r: `Triglycerides are fats in your blood — the direct product of excess sugar and refined carbs.

RANGES:
• Optimal: below 100 mg/dL
• Normal: below 150 mg/dL
• Borderline high: 150–199 mg/dL
• High: 200–499 mg/dL
• Very high: above 500 mg/dL (pancreatitis risk)

High triglycerides are a red flag for metabolic syndrome — a cluster of conditions that dramatically raises biological age, diabetes risk, and heart disease.

How to lower triglycerides:
• Cut sugar and refined carbs — these directly convert to triglycerides in the liver
• Reduce alcohol (even moderate drinking raises triglycerides significantly)
• Omega-3 fish oil (3-4g/day EPA+DHA) — clinically proven to lower triglycerides by 20-30%
• Exercise — burns triglycerides as fuel, especially fasted cardio
• Intermittent fasting — gives the liver time to clear triglycerides
• Replace white rice/bread with dal, vegetables, and whole grains`,
  },

  // ══════════════════════════════════════
  // BIOMARKERS — Ferritin / Iron
  // ══════════════════════════════════════
  {
    id: 'ferritin',
    phrases: ['ferritin','iron deficiency','low ferritin','anaemia','anemia','low iron','iron level'],
    keys: ['ferritin','iron','anaemia','anemia'],
    r: `Ferritin is the stored form of iron in your body — a critical marker for energy and recovery.

RANGES:
• Women optimal: 50–100 ng/mL
• Men optimal: 100–200 ng/mL
• Low (iron deficiency): below 30 ng/mL
• Deficiency anaemia: below 12 ng/mL

Symptoms of low ferritin:
• Persistent fatigue even with enough sleep
• Reduced exercise performance and slower recovery
• Hair loss (very common in women)
• Shortness of breath on exertion
• Difficulty concentrating

How to improve iron levels:
• Red meat, chicken, fish — haem iron (best absorbed)
• Dark leafy greens, rajma, chana, moong — non-haem iron (less absorbed)
• Pair plant iron with Vitamin C (lemon juice, amla) — dramatically improves absorption
• Avoid tea and coffee with iron-rich meals — tannins block iron absorption
• Cook in iron cookware — genuinely adds iron to food

If ferritin is below 20 ng/mL, iron supplements (ferrous sulphate or iron bisglycinate) are usually needed.`,
  },

  // ══════════════════════════════════════
  // DIET — General
  // ══════════════════════════════════════
  {
    id: 'diet_general',
    phrases: ['what should i eat','best diet for bioage','diet for longevity','what to eat','diet plan','anti aging diet','anti-aging food'],
    keys: ['what to eat','best food','diet for','longevity food'],
    r: `For biological age reversal, the diet principle is simple: eat to reduce inflammation, stabilise blood sugar, and give your cells everything they need to repair.

Core principles:
• Protein at every meal — essential for muscle preservation and repair (aim for 1.2-1.6g per kg body weight)
• Vegetables first — fill half your plate before adding carbs
• Whole grains over refined — brown rice, dal, quinoa over white rice and bread
• Anti-inflammatory fats — walnuts, flaxseeds, olive oil, avocado
• Cut the four ageing accelerators: sugar, seed oils, refined carbs, ultra-processed food

Top anti-ageing foods:
• Turmeric + black pepper — reduces inflammation as effectively as some NSAIDs
• Fatty fish (rohu, hilsa, mackerel) — omega-3 EPA/DHA directly lowers hsCRP
• Eggs — complete protein + choline for brain health
• Leafy greens — folate, magnesium, antioxidants
• Berries and amla — polyphenols protect telomeres
• Green tea — EGCG activates AMPK (longevity enzyme)

Go to the Diet tab in the app to see your full personalised meal plan.`,
  },

  // ══════════════════════════════════════
  // DIET — Veg Plan
  // ══════════════════════════════════════
  {
    id: 'diet_veg',
    phrases: ['veg diet','vegetarian diet','vegetarian plan','veg plan','veg food','vegetarian meal'],
    keys: ['veg','vegetarian'],
    r: `Your Veg Diet Plan (in the Diet tab) is designed for maximum biological age reversal:

Morning ritual (before breakfast):
Warm water + lemon + turmeric + black pepper — activates anti-inflammatory pathways

7:00 AM — Breakfast:
Moong dal chilla (3) + mint chutney + warm turmeric milk
High protein, anti-inflammatory start to the day

10:00 AM — Snack:
Banana + mixed nuts (walnuts, almonds) + 1 tsp flaxseeds

1:00 PM — Lunch:
Brown rice + rajma curry + cucumber raita + mixed veg sabzi + salad

4:00 PM — Snack:
Sprout chaat + lemon + black pepper + coconut water

7:00 PM — Dinner (last meal):
Palak paneer + 2 multigrain roti + cucumber salad

Then FAST until 7:00 AM — 12 hours of fasting activates autophagy (cellular self-cleaning).

Key focus: Protein ~80-100g/day. Go to the Diet tab and tap 'Veg' to see the full plan with allergy swaps.`,
  },

  // ══════════════════════════════════════
  // DIET — Non-Veg Plan
  // ══════════════════════════════════════
  {
    id: 'diet_nonveg',
    phrases: ['non veg diet','non-veg diet','nonveg plan','non veg plan','chicken diet','fish diet','meat diet'],
    keys: ['non veg','nonveg','chicken','fish diet','meat'],
    r: `Your Non-Veg Diet Plan (highest protein, best for BioAge reversal):

Morning ritual:
Warm water + lemon + turmeric + black pepper

7:00 AM — Breakfast:
3 boiled eggs + multigrain toast + avocado/tomato + green tea
(Eggs provide complete protein + choline for brain health)

10:00 AM — Snack:
Banana + almonds + walnuts

1:00 PM — Lunch:
Brown rice + grilled fish (mackerel, rohu, or hilsa) + dal + salad
Fish EPA+DHA directly reduces hsCRP inflammation and supports telomere length

4:00 PM — Snack:
Boiled egg + sprouts

7:00 PM — Dinner:
Grilled chicken breast + roasted vegetables + salad

Fast 7PM to 7AM (12 hours minimum).

Why this plan is superior for BioAge: Fish 3-4x/week provides EPA+DHA omega-3 — the most clinically proven intervention for reducing inflammation and extending telomeres. Target protein: 140-160g/day.`,
  },

  // ══════════════════════════════════════
  // DIET — Vegan Plan
  // ══════════════════════════════════════
  {
    id: 'diet_vegan',
    phrases: ['vegan diet','vegan plan','vegan food','plant based diet','plant-based'],
    keys: ['vegan','plant based','plant-based'],
    r: `Your Vegan Diet Plan (complete plant-based protocol):

Morning ritual:
Warm water + lemon + turmeric + black pepper

7:00 AM — Breakfast:
Tofu scramble (spinach + turmeric + nutritional yeast) + multigrain toast + soy milk

10:00 AM — Snack:
Banana + pumpkin seeds + 1 tbsp flaxseeds (omega-3 source)

1:00 PM — Lunch:
Quinoa + chana masala + roasted vegetables + coconut yogurt

4:00 PM — Snack:
Hummus + carrot sticks + coconut water

7:00 PM — Dinner:
Tempeh stir-fry + brown rice + steamed broccoli

CRITICAL supplements for vegans:
• Vitamin B12 (methylcobalamin 1000mcg/day) — NO plant source exists
• Vitamin D3 (from lichen, not lanolin) — 2000 IU/day
• Omega-3 (algae-based DHA/EPA) — flaxseeds provide ALA but conversion is poor
• Iron (with Vitamin C for absorption)
• Zinc (plant zinc is less bioavailable)`,
  },

  // ══════════════════════════════════════
  // DIET — Eggetarian
  // ══════════════════════════════════════
  {
    id: 'diet_eggetarian',
    phrases: ['eggetarian diet','eggetarian plan','egg diet','eggs and veg','egg vegetarian'],
    keys: ['eggetarian','egg veg'],
    r: `Your Eggetarian Diet Plan (best of both worlds — plant foods + complete egg protein):

Morning ritual:
Warm water + lemon + turmeric + black pepper

7:00 AM — Breakfast:
3-egg omelette with spinach + onion + turmeric + multigrain toast

10:00 AM — Snack:
Banana + mixed nuts (walnuts, almonds)

1:00 PM — Lunch:
Brown rice + dal makhani + paneer sabzi + salad + curd

4:00 PM — Snack:
2 boiled eggs + sprout chaat

7:00 PM — Dinner:
Palak paneer + 2 multigrain roti + cucumber salad

Why eggs are powerful for BioAge:
• Complete protein with all 9 essential amino acids
• Choline — critical for brain health and liver function
• Lutein — protects eyes and cardiovascular system
• Vitamin B12 — fully bioavailable form

Target: 3 eggs/day provides ~18g protein + all the micronutrients above.`,
  },

  // ══════════════════════════════════════
  // DIET — Fasting
  // ══════════════════════════════════════
  {
    id: 'fasting',
    phrases: ['intermittent fasting','fasting for bioage','when to eat','eating window','fast for how long','autophagy','16 8 fasting','time restricted eating'],
    keys: ['intermittent fasting','fasting','autophagy','eating window'],
    r: `Intermittent Fasting (IF) is one of the most powerful biological age reversal tools available.

The AROGYOS approach: Eat between 7AM–7PM (12-hour fast minimum). Advanced: 7AM–5PM for a 14-hour fast.

What happens during your fast:
• Hour 12: Insulin drops, body switches to fat burning
• Hour 14-16: Autophagy begins — cells start breaking down damaged components and recycling them (cellular self-cleaning)
• Hour 18+: Growth hormone rises significantly (promotes muscle repair)

Why it matters for BioAge:
• Autophagy removes dysfunctional mitochondria, misfolded proteins, and cellular debris that accumulate with age
• Nobel Prize was awarded for autophagy research in 2016 — it's real science
• Reduces inflammation, improves insulin sensitivity, lowers blood sugar

How to start:
1. Finish dinner by 7PM
2. Don't eat until 7AM
3. During the fast: water, black coffee, plain green tea are allowed

It gets easy after 1-2 weeks as hunger patterns shift. Most people report better morning energy within 10 days.`,
  },

  // ══════════════════════════════════════
  // DIET — Protein
  // ══════════════════════════════════════
  {
    id: 'protein',
    phrases: ['how much protein','protein intake','protein for muscle','high protein food','protein foods','protein sources','protein diet'],
    keys: ['protein','amino acid'],
    r: `Protein is the most important macronutrient for biological age reversal — it builds and preserves muscle, which is your longevity organ.

TARGETS:
• Minimum: 1.2g per kg bodyweight per day
• Optimal for BioAge reversal: 1.6g per kg
• Example: 70kg person = 84-112g protein/day

Best protein sources by diet type:
VEG: Moong dal (24g/100g dry), paneer (18g/100g), Greek yogurt (10g/100g), quinoa (14g/100g)
EGGS: 1 large egg = 6g complete protein. 3 eggs = 18g
NON-VEG: Chicken breast (31g/100g), fish (25-28g/100g), eggs
VEGAN: Tofu (8g/100g), tempeh (19g/100g), chana (19g/100g dry), lentils (18g/100g dry)

Why protein matters for BioAge:
• Prevents sarcopenia (age-related muscle loss) — the main driver of frailty
• Boosts metabolism — muscle burns 3x more calories than fat at rest
• Supports immune function and hormone production
• Reduces cravings and stabilises blood sugar

Spread protein across all meals rather than eating it all at once — muscles can only use ~30-40g per sitting.`,
  },

  // ══════════════════════════════════════
  // EXERCISE — Zone 2
  // ══════════════════════════════════════
  {
    id: 'zone2',
    phrases: ['zone 2','zone 2 cardio','zone2','zone two cardio','what is zone 2','mitochondria exercise','cardio for bioage'],
    keys: ['zone 2','zone2','mitochondria','cardio'],
    r: `Zone 2 cardio is the single most powerful exercise intervention for biological age reversal.

What is Zone 2?
It's moderate-intensity cardio where you can hold a conversation but feel slightly breathless. Heart rate typically 60-70% of max (roughly: 180 minus your age).

Examples:
• Brisk walking (outdoor or treadmill)
• Light jogging
• Cycling at moderate pace
• Swimming at steady pace
• Elliptical without high resistance

Why it's so powerful for BioAge:
• Directly increases mitochondrial density — mitochondria are your cellular energy factories
• More mitochondria = more energy, slower ageing at the cellular level
• Improves VO2 max (the #1 longevity biomarker)
• Increases fat oxidation — burns fat efficiently even at rest
• Reduces hsCRP inflammation significantly
• Improves insulin sensitivity

Target: 150-180 minutes per week (4-5 sessions of 40-45 minutes).

The key: stay in Zone 2, don't go too hard. Many people accidentally train too intensely and get less mitochondrial benefit.`,
  },

  // ══════════════════════════════════════
  // EXERCISE — Strength Training
  // ══════════════════════════════════════
  {
    id: 'strength',
    phrases: ['strength training','weight training','gym for bioage','resistance training','muscle training','lift weights','build muscle','bodyweight exercise'],
    keys: ['strength','weight train','resistance','muscle','gym'],
    r: `Strength training is non-negotiable for biological age reversal after age 30.

Why it matters for BioAge:
• Preserves muscle mass — we lose 3-5% per decade after 30 without training
• Improves insulin sensitivity (muscles absorb glucose like a sponge)
• Boosts testosterone naturally
• Preserves bone density (prevents osteoporosis)
• Increases resting metabolic rate
• Clinically shown to lengthen telomeres with consistent training

Target: 2-3 sessions per week, 45-60 minutes each

Effective routine for beginners:
• Squats or lunges — largest muscle group, biggest hormonal benefit
• Push-ups or chest press
• Rows or pull-ups
• Deadlifts or hip hinges
• Core work (planks, not just crunches)

Progressive overload is the key — gradually increase resistance, reps, or sets over time.

No gym? Bodyweight training is equally effective. The resistance is what matters, not the equipment.`,
  },

  // ══════════════════════════════════════
  // SLEEP
  // ══════════════════════════════════════
  {
    id: 'sleep',
    phrases: ['how much sleep','sleep for bioage','sleep quality','improve sleep','better sleep','sleep and health','why is sleep important','sleep deprivation','poor sleep'],
    keys: ['sleep','sleeping'],
    r: `Sleep is the #1 most impactful lifestyle intervention for biological age — above diet and exercise.

TARGET: 7-8 hours of quality sleep per night (not just time in bed)

What happens during deep sleep:
• Growth hormone released — repairs muscles, skin, and every organ
• Brain clears toxic waste (amyloid plaques linked to Alzheimer's) via the glymphatic system
• Testosterone replenished — one night of poor sleep drops testosterone 10-15%
• Inflammation reset — chronic poor sleep spikes hsCRP significantly
• Memory consolidation and cellular repair

Signs your sleep quality needs work:
• Waking up still tired after 7+ hours
• Needing coffee immediately upon waking
• Low energy after 3PM
• HRV (on your wearable) trending downward

How to improve sleep quality:
• Consistent sleep + wake time every day (including weekends)
• Keep bedroom cool (18-20°C is optimal for deep sleep)
• Complete darkness — even a little light disrupts melatonin
• No screens 60 minutes before bed (blue light suppresses melatonin)
• No caffeine after 1PM (half-life is 5-6 hours)
• Magnesium glycinate 400mg before bed — dramatically improves deep sleep quality`,
  },

  // ══════════════════════════════════════
  // SUPPLEMENTS — General
  // ══════════════════════════════════════
  {
    id: 'supplements_general',
    phrases: ['what supplements','which supplements','supplements for bioage','supplements for longevity','best supplements','longevity supplements','what should i take'],
    keys: ['supplement','what to take','which pill'],
    r: `⚕️ Important first: Supplements are not a substitute for medical care. Always get a blood test before supplementing, and consult your doctor — especially if you take any medication.

Nutrients with strong research support for healthy ageing (educational reference):

COMMONLY TESTED & DEFICIENT:
• Vitamin D — get a blood test first; many Indians are deficient. Ask your doctor about the right dose for your level.
• Vitamin B12 — especially important for vegetarians, vegans, and people over 50. Get tested, then discuss supplementation with your doctor.
• Omega-3 — increasing oily fish, walnuts and flaxseeds in your diet is the food-first approach. Discuss supplementation with your doctor if diet alone is insufficient.
• Magnesium — found in nuts, seeds, legumes, dark greens. Food sources are the safest starting point.

DISCUSSED IN LONGEVITY RESEARCH (emerging science, consult your doctor):
• NMN / NR — NAD+ precursors being studied for cellular energy
• Resveratrol — studied for its effect on sirtuin longevity genes
• CoQ10 — often discussed for mitochondrial health, particularly relevant if taking statins
• Ashwagandha — studied for cortisol and stress response

⚕️ Do not self-prescribe specific doses. Upload your lab report to AROGYOS first — your actual deficiencies are the only safe guide to what, if anything, you need.`,
  },

  // ══════════════════════════════════════
  // SUPPLEMENTS — Omega 3
  // ══════════════════════════════════════
  {
    id: 'omega3',
    phrases: ['omega 3','omega-3','fish oil','epa dha','omega 3 supplement','fish oil supplement'],
    keys: ['omega 3','omega-3','fish oil','epa','dha'],
    r: `Omega-3 fatty acids (EPA+DHA) are among the most researched nutrients for inflammation and cardiovascular health.

What research shows (educational):
• Associated with lower hsCRP (inflammation marker) in multiple studies
• Linked to telomere length support
• High doses studied for triglyceride reduction under medical supervision
• Supports brain, heart, joint, and mood health

Best food sources first:
• Fatty fish 3–4×/week — mackerel, rohu, hilsa, salmon, sardines
• Walnuts, flaxseeds, chia seeds (provide ALA, a plant-based omega-3)
• Algae-based sources (good vegan option)

⚕️ If you are considering omega-3 supplements — especially at higher doses — consult your doctor first. High-dose omega-3 can interact with blood-thinning medication and is not appropriate for everyone.

For educational purposes only. The right approach for you depends on your individual health status and existing lab values.`,
  },

  // ══════════════════════════════════════
  // SUPPLEMENTS — Magnesium
  // ══════════════════════════════════════
  {
    id: 'magnesium',
    phrases: ['magnesium supplement','magnesium glycinate','magnesium for sleep','magnesium deficiency','low magnesium'],
    keys: ['magnesium'],
    r: `Magnesium is involved in 300+ enzymatic reactions and is important for sleep, blood sugar, muscle recovery, and stress response.

Why magnesium matters for BioAge:
• Sleep quality — supports the nervous system for deeper sleep
• Blood sugar — needed for insulin signalling; low levels worsen insulin resistance
• Cortisol regulation — low magnesium is associated with higher stress hormones
• Muscle recovery and heart rhythm

Signs of possible deficiency: poor sleep, muscle cramps, anxiety, constipation, headaches

Food sources first: dark chocolate, leafy greens, pumpkin seeds, almonds, avocado, bananas, whole grains

⚕️ For educational purposes only. If you think you have a deficiency or want to start magnesium supplements, consult your doctor or a qualified nutritionist — the right form and dose depends on your individual situation.`,
  },

  // ══════════════════════════════════════
  // SUPPLEMENTS — Ashwagandha
  // ══════════════════════════════════════
  {
    id: 'ashwagandha',
    phrases: ['ashwagandha','ashwagandha supplement','ashwagandha for stress','ksm 66','ashwagandha benefits'],
    keys: ['ashwagandha','ksm-66','ksm66'],
    r: `Ashwagandha is an adaptogen (stress-modulating herb) with a strong research base. It is used in Ayurvedic medicine and increasingly studied in modern trials.

What research suggests (educational):
• Associated with reduced cortisol markers in clinical studies
• Some studies show modest improvements in testosterone in men
• May support exercise endurance and sleep quality
• Studied for anxiety reduction

⚕️ For educational purposes only. Ashwagandha is not suitable for everyone — it can interact with thyroid medication, sedatives, and immunosuppressants. Avoid during pregnancy. Always consult your doctor before starting any supplement, particularly if you are on medication.

If interested, discuss with your doctor whether it's appropriate for you before starting.`,
  },

  // ══════════════════════════════════════
  // FAMILY TRACKER
  // ══════════════════════════════════════
  {
    id: 'family_how',
    phrases: ['how does family tracker work','how to invite family','family bioage','invite family member','track family','family tracking','add family member'],
    keys: ['family tracker','invite family','family bioage','family member'],
    r: `The Family BioAge Tracker lets you track your whole family's biological age in one place — with real data, not guesses.

How it works:
1. Tap "Invite" in the Family section on the Home screen
2. Pick their relation (Mom, Dad, Spouse, Son, Daughter, etc.)
3. Optionally enter their phone number
4. Tap "Generate Invite Link"
5. Tap "Send via WhatsApp" — opens WhatsApp with a pre-written message and their unique link
6. They click the link → fill a 2-minute health quiz (exercise, sleep, diet, smoking)
7. Their BioAge is calculated automatically and appears in YOUR family tracker

No manual entry. No fake data. Only real results from their own quiz.

Pending invites show as "⏳ Awaiting response" until they accept.

Why it's powerful: When family members can see each other's biological age, motivation increases dramatically. It creates accountability and shared goals for the whole family.`,
  },

  // ══════════════════════════════════════
  // APP NAVIGATION — Trends
  // ══════════════════════════════════════
  {
    id: 'trends_screen',
    phrases: ['trends screen','trends tab','how to see trends','bioage history','progress chart','track progress','bioage chart','see my progress'],
    keys: ['trends','chart','progress','history'],
    r: `The Trends screen shows your BioAge journey over time — so you can see the impact of every habit change.

How to access: Tap the Trends tab (chart icon) in the bottom navigation.

What you'll see:
• Your BioAge trend over weeks and months — is it going down? 📉
• Individual biomarker trends — LDL, hsCRP, HbA1c, Vitamin D
• Monthly improvement score
• Which biomarkers are improving, stable, or worsening

The most motivating screen in the app: When you see your BioAge drop even 1-2 years over 3 months, it proves your habits are working.

For the best trends data: Upload lab reports every 90 days and connect a wearable device for daily data points. The more data you provide, the more accurate and detailed your trend charts become.`,
  },

  // ══════════════════════════════════════
  // APP NAVIGATION — Devices
  // ══════════════════════════════════════
  {
    id: 'devices_screen',
    phrases: ['how to connect device','connect wearable','connect smartwatch','connect ring','device screen','which device','connect fitbit','connect apple watch','connect garmin','smart ring'],
    keys: ['connect device','wearable','smartwatch','smart ring','fitness band'],
    r: `The Devices screen lets you connect any health wearable to AROGYOS for continuous BioAge data.

How to access: Tap the Devices tab (watch icon) in the bottom navigation.

Supported device types (not locked to any brand):
• Smart Ring — any ring with HRV + SpO2 + sleep tracking
• Smartwatch — any watch with health sensors
• Fitness Band — any fitness tracker
• Phone Sensors — uses your phone's built-in sensors (no hardware needed)

Data AROGYOS collects from devices:
• HRV (Heart Rate Variability) — best indicator of recovery and stress
• Resting heart rate — lower = better cardiovascular health
• Sleep stages — deep sleep, REM, light sleep duration
• VO2 max estimate — the #1 longevity fitness marker
• Daily steps and active minutes
• SpO2 (blood oxygen)

Why devices matter: Lab tests give you a monthly snapshot. Wearables give you DAILY BioAge signals so you can see the immediate impact of better sleep, exercise, and stress reduction.`,
  },

  // ══════════════════════════════════════
  // APP NAVIGATION — Protocol
  // ══════════════════════════════════════
  {
    id: 'protocol_screen',
    phrases: ['protocol screen','what is protocol','longevity protocol','my protocol','personalised protocol','health protocol'],
    keys: ['protocol','longevity plan'],
    r: `The Protocol screen is your personalised longevity action plan — built around your actual biomarkers.

How to access: Tap the Protocol tab (heartbeat icon) in the bottom navigation.

What it includes:

SUPPLEMENTS — based on your deficiencies:
Only recommended what your labs show you actually need (Vitamin D, Omega-3, Magnesium, B12, etc.)

EXERCISE PROTOCOL:
• Zone 2 cardio schedule (4-5x/week)
• Strength training programme
• HIIT once per week
• Daily step target

SLEEP PROTOCOL:
• Optimal sleep/wake time
• Pre-sleep routine
• Environment optimisation

DIET PROTOCOL:
• Meal timing (intermittent fasting window)
• Foods to prioritise based on your biomarkers
• Foods to avoid or reduce

STRESS PROTOCOL:
• Breathing exercises
• HRV biofeedback techniques

For the most personalised protocol: Upload your latest lab report. The more biomarker data available, the more specific your recommendations become.`,
  },

  // ══════════════════════════════════════
  // APP NAVIGATION — Share
  // ══════════════════════════════════════
  {
    id: 'share_screen',
    phrases: ['how to share','share my results','share bioage','share transformation','instagram story','share to whatsapp','share progress','transformation card'],
    keys: ['share','instagram','transformation card'],
    r: `The Share screen lets you create and share your BioAge transformation with friends and family.

How to access: Tap Share from the Home screen quick actions.

What you can share:
• INSTAGRAM STORIES — a beautiful 1080x1920 transformation card showing your BioAge, improvement, and key biomarkers. Tap "Instagram Story" → save to camera roll → open Instagram and share as a Story.
• WHATSAPP — sends a rich formatted message with your BioAge stats and a motivating message. Opens WhatsApp directly.

The transformation card shows:
• Your current BioAge vs actual age
• How many years younger you are biologically
• Your key improving biomarkers

Why share? Sharing your BioAge publicly creates accountability and inspires others to take their health seriously. It also starts conversations about longevity with people who might benefit from AROGYOS.`,
  },

  // ══════════════════════════════════════
  // PRICING / SUBSCRIBE
  // ══════════════════════════════════════
  {
    id: 'pricing',
    phrases: ['how much does it cost','price of healthos','subscription cost','how much is it','paid features','free trial','what do i get','healthos price','subscribe','cost of app'],
    keys: ['price','cost','subscription','free trial','how much','paid','subscribe'],
    r: `AROGYOS pricing is simple and transparent:

INDIA: ₹399/year (~₹33/month)
INTERNATIONAL: $9.99/year (~$0.83/month)

FREE TRIAL: 30 days free — no credit card required to start

What you get with AROGYOS Plus:
• Unlimited lab report uploads (AI biomarker extraction)
• Full biological age analysis and tracking
• Personalised longevity protocol
• Family BioAge tracker (up to 6 members)
• Complete diet plans with allergy customisation
• Device integration for continuous tracking
• BioAge history — even if you cancel, your data stays

Our promises:
• No surprise renewals — we remind you 7 days before any charge
• Your data is always yours — history never deleted even if you cancel
• Cancel anytime — no long-term commitment

Questions about billing? Tap Subscribe in the menu for full details.`,
  },

  // ══════════════════════════════════════
  // GENERAL LONGEVITY
  // ══════════════════════════════════════
  {
    id: 'longevity_general',
    phrases: ['what is longevity','how to live longer','age reversal','how to age slower','anti aging','anti-aging','live longer','healthy ageing','healthy aging'],
    keys: ['longevity','live longer','age slower','anti aging','age reversal'],
    r: `Longevity science has exploded in the last decade. Here's what the research actually shows:

Biological age is modifiable. Unlike your calendar age, BioAge can go UP or DOWN based on your habits.

The five biggest drivers of accelerated ageing:
1. Chronic inflammation (high hsCRP) — "inflammageing"
2. Insulin resistance (high blood sugar, high HbA1c)
3. Poor sleep — disrupts repair processes
4. Muscle loss (sarcopenia) — muscle is the longevity organ
5. Chronic stress — cortisol destroys telomeres

The five most effective anti-ageing interventions (ranked by evidence):
1. Exercise (Zone 2 cardio + strength training)
2. Sleep optimisation
3. Anti-inflammatory diet
4. Caloric restriction / intermittent fasting
5. Stress reduction (lowers cortisol, protects telomeres)

The emerging interventions with strong early evidence:
• NAD+ precursors (NMN/NR) — cellular energy restoration
• Senolytics — clearing "zombie" senescent cells
• Rapamycin (prescription only) — mTOR inhibition
• Metformin for longevity (prescription only)

AROGYOS focuses on the proven fundamentals — because most people haven't optimised the basics yet, and the basics move the needle most.`,
  },

  // ══════════════════════════════════════
  // HINDI SUPPORT
  // ══════════════════════════════════════
  {
    id: 'hindi_greeting',
    phrases: ['namaste','namaskar','mera bioage','meri health','kya hai bioage','diet plan batao','kya khana chahiye'],
    keys: ['namaste','mera','meri','batao','chahiye','hindi'],
    r: `Namaste! Main aapka AROGYOS AI health guide hun. 🧬

Main aapki madad kar sakta hun:
• Aapke BioAge score ko samajhne mein
• Lab report biomarkers (LDL, hsCRP, Vitamin D, etc.) ko samajhne mein
• Aapke diet plan ke baare mein (Veg, Non-Veg, Eggetarian, Vegan)
• Exercise aur supplements ke baare mein
• App ke kisi bhi feature ke baare mein

Koi bhi sawaal puchhe — main poori koshish karunga aapko clear, actionable jawab dene ki.

(Feel free to ask in English or Hindi — I understand both!)`,
  },

]

// ══════════════════════════════════════
// MATCHING ENGINE
// ══════════════════════════════════════

function normalise(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function matchIntent(message) {
  const msg = normalise(message)

  // Pass 1: exact phrase match (highest priority)
  for (const intent of INTENTS) {
    for (const phrase of (intent.phrases || [])) {
      if (msg.includes(normalise(phrase))) return intent
    }
  }

  // Pass 2: keyword scoring
  let best = null
  let bestScore = 0
  for (const intent of INTENTS) {
    let score = 0
    for (const kw of (intent.keys || [])) {
      if (msg.includes(normalise(kw))) score++
    }
    if (score > bestScore) { bestScore = score; best = intent }
  }
  if (bestScore >= 1) return best

  return null
}

const FALLBACKS = [
  `Great question! I'm still learning the answer to that specific one.

Here's what I CAN help you with right now:
• BioAge — what it is, how it's calculated, how to lower it
• Any biomarker — LDL, hsCRP, HbA1c, Vitamin D, testosterone, cortisol and more
• Diet plans — Veg, Non-Veg, Eggetarian, Vegan (with specific meals)
• Exercise — Zone 2 cardio, strength training, how much to do
• Supplements — what works, what doesn't, what you actually need
• App features — how to upload reports, connect devices, invite family, share results
• Pricing and subscription

Try asking about any of those topics!`,

  `I don't have a specific answer for that yet, but here are some things you might be wondering about:

• "What does high LDL mean?"
• "How do I upload my lab report?"
• "What's the best diet for my biological age?"
• "How does the family tracker work?"
• "What supplements should I take?"

Ask me any of those and I'll give you a detailed answer!`,
]

let fallbackIndex = 0

export function getAIResponse(message) {
  if (!message || !message.trim()) return "Please type a question and I'll do my best to help!"

  const intent = matchIntent(message)
  if (intent) return intent.r

  // Rotate through fallback messages
  const response = FALLBACKS[fallbackIndex % FALLBACKS.length]
  fallbackIndex++
  return response
}
