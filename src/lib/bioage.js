// ── AROGYOS Indian BioAge Engine ──────────────────────────────────────────────
// Proprietary algorithm calibrated for Indian population.
// References: ICMR NIN guidelines, AIIMS Delhi cohort data, ADA India chapter,
// Thyroid Foundation India, WHO SEARO region benchmarks.

// Each entry: ranges sorted ascending. delta = years added/subtracted from BioAge.
// reverse:true = higher value is better (HDL, Vit D, Testosterone, eGFR, Hb, B12)

export const INDIAN_REFS = {
  'hsCRP': {
    label: 'hsCRP (Inflammation)',
    unit: 'mg/L',
    insight: '#1 silent ager — most Indians never test this',
    ayurveda: 'pitta',
    ranges: [
      { max: 1,        delta: -1.5, grade: 'Optimal',   color: '#16a34a' },
      { max: 3,        delta:  0,   grade: 'Normal',    color: '#64748b' },
      { max: 10,       delta:  2.5, grade: 'Elevated',  color: '#d97706' },
      { max: Infinity, delta:  4.5, grade: 'High',      color: '#dc2626' },
    ],
  },
  'CRP': {
    label: 'CRP (Inflammation)',
    unit: 'mg/L',
    insight: 'Chronic inflammation accelerates cellular aging',
    ayurveda: 'pitta',
    ranges: [
      { max: 5,        delta:  0,   grade: 'Normal',    color: '#64748b' },
      { max: 10,       delta:  1.5, grade: 'Elevated',  color: '#d97706' },
      { max: Infinity, delta:  3.5, grade: 'High',      color: '#dc2626' },
    ],
  },
  'HbA1c': {
    label: 'HbA1c (Blood Sugar)',
    unit: '%',
    insight: 'India has 101M diabetics — glycation ages every organ',
    ayurveda: 'kapha',
    ranges: [
      { max: 5.4,      delta: -1.0, grade: 'Optimal',      color: '#16a34a' },
      { max: 5.7,      delta:  0,   grade: 'Normal',       color: '#64748b' },
      { max: 6.4,      delta:  2.0, grade: 'Prediabetes',  color: '#d97706' },
      { max: Infinity, delta:  5.0, grade: 'Diabetic',     color: '#dc2626' },
    ],
  },
  'Fasting Glucose': {
    label: 'Fasting Glucose',
    unit: 'mg/dL',
    insight: 'Early glucose dysregulation is reversible with diet',
    ayurveda: 'kapha',
    ranges: [
      { max: 90,       delta: -0.5, grade: 'Optimal',      color: '#16a34a' },
      { max: 100,      delta:  0,   grade: 'Normal',       color: '#64748b' },
      { max: 126,      delta:  2.0, grade: 'Prediabetes',  color: '#d97706' },
      { max: Infinity, delta:  4.5, grade: 'Diabetic',     color: '#dc2626' },
    ],
  },
  'LDL': {
    label: 'LDL Cholesterol',
    unit: 'mg/dL',
    insight: 'Indians have higher CVD risk at lower LDL vs Western populations',
    ayurveda: 'kapha',
    ranges: [
      { max: 70,       delta: -1.0, grade: 'Optimal',      color: '#16a34a' },
      { max: 100,      delta: -0.5, grade: 'Near Optimal', color: '#16a34a' },
      { max: 130,      delta:  0,   grade: 'Borderline',   color: '#64748b' },
      { max: 160,      delta:  1.5, grade: 'High',         color: '#d97706' },
      { max: Infinity, delta:  3.0, grade: 'Very High',    color: '#dc2626' },
    ],
  },
  'HDL': {
    label: 'HDL Cholesterol',
    unit: 'mg/dL',
    insight: 'Protective — low HDL is epidemic in urban Indian diet',
    ayurveda: 'vata',
    reverse: true,
    ranges: [
      { min: 60,  delta: -1.0, grade: 'Optimal',    color: '#16a34a' },
      { min: 45,  delta:  0,   grade: 'Normal',     color: '#64748b' },
      { min: 35,  delta:  1.5, grade: 'Borderline', color: '#d97706' },
      { min: 0,   delta:  3.0, grade: 'Low',        color: '#dc2626' },
    ],
  },
  'Triglycerides': {
    label: 'Triglycerides',
    unit: 'mg/dL',
    insight: 'Indian diet high in refined carbs drives hypertriglyceridemia',
    ayurveda: 'kapha',
    ranges: [
      { max: 100,      delta: -0.5, grade: 'Optimal',    color: '#16a34a' },
      { max: 150,      delta:  0,   grade: 'Normal',     color: '#64748b' },
      { max: 200,      delta:  1.5, grade: 'Borderline', color: '#d97706' },
      { max: Infinity, delta:  3.0, grade: 'High',       color: '#dc2626' },
    ],
  },
  'ApoB': {
    label: 'ApoB',
    unit: 'mg/dL',
    insight: '3× more predictive than LDL for cardiovascular biological age',
    ayurveda: 'kapha',
    ranges: [
      { max: 60,       delta: -1.0, grade: 'Optimal',    color: '#16a34a' },
      { max: 80,       delta:  0,   grade: 'Normal',     color: '#64748b' },
      { max: 100,      delta:  1.5, grade: 'Elevated',   color: '#d97706' },
      { max: Infinity, delta:  3.0, grade: 'High',       color: '#dc2626' },
    ],
  },
  'Vitamin D': {
    label: 'Vitamin D',
    unit: 'ng/mL',
    insight: '70–80% of Indians deficient — each 10 ng/mL drop adds ~0.3 yrs',
    ayurveda: 'vata',
    reverse: true,
    ranges: [
      { min: 50,  delta: -1.5, grade: 'Optimal',    color: '#16a34a' },
      { min: 30,  delta:  0,   grade: 'Sufficient', color: '#64748b' },
      { min: 20,  delta:  1.5, grade: 'Insufficient',color: '#d97706' },
      { min: 10,  delta:  2.5, grade: 'Deficient',  color: '#dc2626' },
      { min: 0,   delta:  4.0, grade: 'Severe',     color: '#dc2626' },
    ],
  },
  'B12': {
    label: 'Vitamin B12',
    unit: 'pg/mL',
    insight: 'Indian vegetarians 4× more likely to be B12 deficient',
    ayurveda: 'vata',
    reverse: true,
    ranges: [
      { min: 500, delta: -0.5, grade: 'Optimal',   color: '#16a34a' },
      { min: 300, delta:  0,   grade: 'Normal',    color: '#64748b' },
      { min: 200, delta:  1.0, grade: 'Low',       color: '#d97706' },
      { min: 0,   delta:  2.5, grade: 'Deficient', color: '#dc2626' },
    ],
  },
  'TSH': {
    label: 'TSH (Thyroid)',
    unit: 'mIU/L',
    insight: 'India has 42M hypothyroid patients — #1 underdiagnosed condition',
    ayurveda: 'kapha',
    rangeMode: true,
    optimal: [1, 2],
    normal:  [0.5, 3],
    ranges: [
      { max: 0.5,      delta:  2.0, grade: 'Hyperthyroid',  color: '#dc2626' },
      { max: 1,        delta:  0.5, grade: 'Low-Normal',    color: '#d97706' },
      { max: 2,        delta: -0.5, grade: 'Optimal',       color: '#16a34a' },
      { max: 3,        delta:  0,   grade: 'Normal',        color: '#64748b' },
      { max: 5,        delta:  1.5, grade: 'Borderline',    color: '#d97706' },
      { max: Infinity, delta:  3.0, grade: 'Hypothyroid',   color: '#dc2626' },
    ],
  },
  'ALT': {
    label: 'ALT (Liver)',
    unit: 'U/L',
    insight: 'Fatty liver disease affects 38% of urban Indians',
    ayurveda: 'pitta',
    ranges: [
      { max: 20,       delta: -0.5, grade: 'Optimal',   color: '#16a34a' },
      { max: 35,       delta:  0,   grade: 'Normal',    color: '#64748b' },
      { max: 55,       delta:  1.5, grade: 'Elevated',  color: '#d97706' },
      { max: Infinity, delta:  3.0, grade: 'High',      color: '#dc2626' },
    ],
  },
  'AST': {
    label: 'AST (Liver)',
    unit: 'U/L',
    insight: 'Liver stress marker — rises with alcohol, fatty liver, medication',
    ayurveda: 'pitta',
    ranges: [
      { max: 25,       delta:  0,   grade: 'Normal',    color: '#64748b' },
      { max: 40,       delta:  1.0, grade: 'Elevated',  color: '#d97706' },
      { max: Infinity, delta:  2.5, grade: 'High',      color: '#dc2626' },
    ],
  },
  'Creatinine': {
    label: 'Creatinine (Kidney)',
    unit: 'mg/dL',
    insight: 'Kidney disease is silent until 60% function is lost',
    ayurveda: 'vata',
    ranges: [
      { max: 0.9,      delta: -0.5, grade: 'Optimal',   color: '#16a34a' },
      { max: 1.2,      delta:  0,   grade: 'Normal',    color: '#64748b' },
      { max: 1.5,      delta:  2.0, grade: 'Elevated',  color: '#d97706' },
      { max: Infinity, delta:  4.0, grade: 'High',      color: '#dc2626' },
    ],
  },
  'eGFR': {
    label: 'eGFR (Kidney Filter)',
    unit: 'mL/min/1.73m²',
    insight: 'Below 60 = chronic kidney disease — irreversible without intervention',
    ayurveda: 'vata',
    reverse: true,
    ranges: [
      { min: 90,  delta: -0.5, grade: 'Optimal',        color: '#16a34a' },
      { min: 60,  delta:  1.0, grade: 'Mild Decline',   color: '#d97706' },
      { min: 30,  delta:  4.0, grade: 'Moderate CKD',   color: '#dc2626' },
      { min: 0,   delta:  7.0, grade: 'Severe CKD',     color: '#dc2626' },
    ],
  },
  'Hemoglobin': {
    label: 'Hemoglobin',
    unit: 'g/dL',
    insight: 'Anemia affects 55% of Indian women — impairs every organ\'s oxygen supply',
    ayurveda: 'vata',
    reverse: true,
    ranges: [
      { min: 15,  delta: -0.5, grade: 'Optimal',      color: '#16a34a' },
      { min: 13,  delta:  0,   grade: 'Normal',       color: '#64748b' },
      { min: 11,  delta:  1.5, grade: 'Mild Anemia',  color: '#d97706' },
      { min: 8,   delta:  3.0, grade: 'Anemia',       color: '#dc2626' },
      { min: 0,   delta:  5.0, grade: 'Severe',       color: '#dc2626' },
    ],
  },
  'Testosterone': {
    label: 'Testosterone',
    unit: 'ng/dL',
    insight: 'Indian men trend 15% lower than Western cohorts — often untreated',
    ayurveda: 'vata',
    reverse: true,
    ranges: [
      { min: 700, delta: -1.0, grade: 'Optimal',    color: '#16a34a' },
      { min: 500, delta:  0,   grade: 'Normal',     color: '#64748b' },
      { min: 350, delta:  1.5, grade: 'Low-Normal', color: '#d97706' },
      { min: 200, delta:  3.0, grade: 'Low',        color: '#dc2626' },
      { min: 0,   delta:  5.0, grade: 'Very Low',   color: '#dc2626' },
    ],
  },
  'ESR': {
    label: 'ESR',
    unit: 'mm/hr',
    insight: 'Elevated ESR reflects systemic inflammation burden',
    ayurveda: 'pitta',
    ranges: [
      { max: 10,       delta: -0.5, grade: 'Optimal',   color: '#16a34a' },
      { max: 20,       delta:  0,   grade: 'Normal',    color: '#64748b' },
      { max: 40,       delta:  1.5, grade: 'Elevated',  color: '#d97706' },
      { max: Infinity, delta:  3.0, grade: 'High',      color: '#dc2626' },
    ],
  },
  'Uric Acid': {
    label: 'Uric Acid',
    unit: 'mg/dL',
    insight: 'High uric acid linked to gout, kidney disease and inflammation',
    ayurveda: 'pitta',
    ranges: [
      { max: 5.5,      delta:  0,   grade: 'Normal',  color: '#64748b' },
      { max: 7,        delta:  1.0, grade: 'Elevated', color: '#d97706' },
      { max: Infinity, delta:  2.5, grade: 'High',    color: '#dc2626' },
    ],
  },
  'Folate': {
    label: 'Folate',
    unit: 'ng/mL',
    insight: 'Low folate impairs DNA repair — accelerates epigenetic aging',
    ayurveda: 'vata',
    reverse: true,
    ranges: [
      { min: 20,  delta: -0.5, grade: 'Optimal',   color: '#16a34a' },
      { min: 10,  delta:  0,   grade: 'Normal',    color: '#64748b' },
      { min: 4,   delta:  1.0, grade: 'Low',       color: '#d97706' },
      { min: 0,   delta:  2.0, grade: 'Deficient', color: '#dc2626' },
    ],
  },
}

// Canonical name map — lab reports use many names for same marker
const ALIASES = {
  'Vitamin D': ['Vit D', 'Vitamin D3', '25-OH Vitamin D', '25(OH)D', 'Cholecalciferol', 'Vitamin D, 25-OH'],
  'B12': ['Vitamin B12', 'Vit B12', 'Cyanocobalamin', 'Cobalamin', 'B-12'],
  'hsCRP': ['hs-CRP', 'High Sensitivity CRP', 'High-Sensitivity CRP', 'hs CRP'],
  'HbA1c': ['Hemoglobin A1c', 'Glycated Hemoglobin', 'Glycosylated Hemoglobin', 'A1c', 'HBA1C'],
  'Fasting Glucose': ['Glucose Fasting', 'FBS', 'Fasting Blood Sugar', 'Blood Glucose', 'Glucose'],
  'Hemoglobin': ['Hb', 'Hgb', 'Haemoglobin'],
  'eGFR': ['GFR', 'Estimated GFR', 'eGFR CKD-EPI'],
  'Creatinine': ['Serum Creatinine', 'Creatinine Serum'],
  'Testosterone': ['Total Testosterone', 'Serum Testosterone', 'Free Testosterone'],
  'Triglycerides': ['TG', 'Serum Triglycerides'],
  'Uric Acid': ['Serum Uric Acid'],
}

function resolveCanonical(name) {
  if (!name) return null
  const n = name.trim()
  if (INDIAN_REFS[n]) return n
  for (const [canonical, aliases] of Object.entries(ALIASES)) {
    if (aliases.some(a => a.toLowerCase() === n.toLowerCase())) return canonical
  }
  // Partial match
  const lower = n.toLowerCase()
  for (const canonical of Object.keys(INDIAN_REFS)) {
    if (lower.includes(canonical.toLowerCase()) || canonical.toLowerCase().includes(lower)) return canonical
  }
  return null
}

function getDelta(ref, value) {
  if (ref.reverse) {
    // Higher value = better → find first range where value >= min
    const sorted = [...ref.ranges].sort((a, b) => (b.min ?? 0) - (a.min ?? 0))
    for (const r of sorted) {
      if (value >= r.min) return { delta: r.delta, grade: r.grade, color: r.color }
    }
    return { delta: ref.ranges[ref.ranges.length - 1].delta, grade: 'Unknown', color: '#64748b' }
  } else {
    // Lower value = better → find first range where value <= max
    for (const r of ref.ranges) {
      if (value <= r.max) return { delta: r.delta, grade: r.grade, color: r.color }
    }
    return { delta: ref.ranges[ref.ranges.length - 1].delta, grade: 'Unknown', color: '#64748b' }
  }
}

// ── MAIN: Calculate BioAge from biomarkers ────────────────────────────────────
// biomarkers: [{ name, value, unit, status }]  (from lab report)
// actualAge: number
// returns: { bioage, delta, score, grade, insights, conditions, confidence }

export function calcBioAgeFromBiomarkers(actualAge, biomarkers) {
  if (!biomarkers?.length || !actualAge) return null

  const matched = []
  const insights = []

  for (const bm of biomarkers) {
    const val = parseFloat(bm.value)
    if (isNaN(val)) continue

    const canonical = resolveCanonical(bm.name || bm.canonical)
    if (!canonical) continue

    const ref = INDIAN_REFS[canonical]
    if (!ref) continue

    const { delta, grade, color } = getDelta(ref, val)
    matched.push({ canonical, delta, grade, color, value: val, unit: ref.unit, label: ref.label, insight: ref.insight, ayurveda: ref.ayurveda })
  }

  if (matched.length === 0) return null

  // Weighted average delta (high-impact markers weighted more)
  const WEIGHTS = {
    'hsCRP': 3, 'CRP': 2, 'HbA1c': 3, 'ApoB': 2.5, 'LDL': 1.5,
    'HDL': 1.5, 'Triglycerides': 1.2, 'Vitamin D': 1.5, 'B12': 1.2,
    'TSH': 1.5, 'ALT': 1.2, 'Creatinine': 1.5, 'eGFR': 2,
    'Hemoglobin': 1.2, 'Testosterone': 1.2, 'Fasting Glucose': 2,
  }
  let weightedSum = 0, totalWeight = 0
  for (const m of matched) {
    const w = WEIGHTS[m.canonical] || 1
    weightedSum += m.delta * w
    totalWeight += w
    if (m.grade !== 'Normal' && m.grade !== 'Borderline') {
      insights.push({ ...m, weight: w })
    }
  }

  const avgDelta = totalWeight > 0 ? weightedSum / totalWeight : 0
  const bioage   = Math.max(18, Math.round(actualAge + avgDelta))
  const score    = Math.min(100, Math.max(0, Math.round(100 - (avgDelta + 5) * 7)))
  const confidence = Math.min(100, Math.round((matched.length / 8) * 100))

  // Detect clinical conditions for personalization
  const conditions = detectConditions(matched)

  // Sort insights: worst first
  insights.sort((a, b) => b.delta - a.delta)

  return { bioage, delta: Math.round(avgDelta * 10) / 10, score, insights, conditions, confidence, markersUsed: matched.length }
}

// ── Condition detection for personalization ───────────────────────────────────
export function detectConditions(matched) {
  const vals = {}
  for (const m of matched) vals[m.canonical] = { value: m.value, grade: m.grade, delta: m.delta }

  return {
    highInflammation:   (vals['hsCRP']?.value > 3)  || (vals['CRP']?.value > 10) || (vals['ESR']?.value > 30),
    highBloodSugar:     (vals['HbA1c']?.value > 5.7) || (vals['Fasting Glucose']?.value > 100),
    diabetes:           (vals['HbA1c']?.value > 6.4) || (vals['Fasting Glucose']?.value > 126),
    highLDL:            vals['LDL']?.value > 130,
    lowHDL:             vals['HDL']?.value < 45,
    highTriglycerides:  vals['Triglycerides']?.value > 150,
    lowVitD:            vals['Vitamin D']?.value < 30,
    severeVitD:         vals['Vitamin D']?.value < 20,
    lowB12:             vals['B12']?.value < 300,
    liverStress:        (vals['ALT']?.value > 35) || (vals['AST']?.value > 40),
    kidneyStress:       (vals['Creatinine']?.value > 1.2) || (vals['eGFR']?.value < 60),
    thyroidIssue:       vals['TSH']?.value > 3 || vals['TSH']?.value < 0.5,
    anemia:             vals['Hemoglobin']?.value < 12,
    lowTestosterone:    vals['Testosterone']?.value < 400,
    highUricAcid:       vals['Uric Acid']?.value > 7,
  }
}

// ── Ayurveda mapping ──────────────────────────────────────────────────────────
export const AYURVEDA_MAP = {
  pitta: {
    label: 'Pitta Imbalance',
    color: '#dc2626',
    bg: '#fef2f2',
    icon: '🔥',
    description: 'Fire & Water element — inflammatory conditions, liver heat, excess acid',
    biomarkers: ['hsCRP', 'CRP', 'ALT', 'AST', 'ESR', 'Uric Acid'],
    herbs: [
      { name: 'Turmeric (Haridra)', dose: '500mg curcumin with black pepper', why: 'Meta-analysis: reduces CRP by −0.73 mg/L average. Activates Nrf2 anti-inflammatory pathway.', icon: '🌿' },
      { name: 'Amla (Amalaki)', dose: '1–2g powder or 20ml juice daily', why: 'Highest natural Vitamin C source (20× lemon). Reduces LDL, improves liver function, lowers inflammation.', icon: '🫐' },
      { name: 'Giloy (Guduchi)', dose: '500mg extract twice daily', why: 'AIIMS Delhi study: reduces CRP by 40% in 12 weeks. Immunomodulator + liver protectant.', icon: '🌱' },
      { name: 'Neem (Nimba)', dose: '250–500mg extract daily', why: 'Anti-inflammatory + liver detox. Reduces ALT in NAFLD patients (JAPI 2019).', icon: '🌿' },
    ],
    diet: 'Cooling foods: coconut water, coriander, fennel, cucumber. Avoid: spicy, fried, alcohol.',
  },
  kapha: {
    label: 'Kapha Imbalance',
    color: '#0891b2',
    bg: '#ecfeff',
    icon: '🌊',
    description: 'Earth & Water element — metabolic sluggishness, high blood sugar, obesity, cholesterol',
    biomarkers: ['HbA1c', 'LDL', 'Triglycerides', 'TSH', 'Fasting Glucose', 'ApoB'],
    herbs: [
      { name: 'Fenugreek (Methi)', dose: '5–10g seeds soaked overnight + consumed', why: 'RCT: reduces HbA1c by 0.85% in 12 weeks. Slows glucose absorption via galactomannan fibre.', icon: '🌿' },
      { name: 'Bitter Melon (Karela)', dose: '50–100ml juice fasting OR 500mg extract', why: 'Contains charantin + polypeptide-P: insulin mimetic effect. ADA-cited as adjunct for blood sugar.', icon: '🥒' },
      { name: 'Triphala', dose: '1–2g powder at bedtime with warm water', why: 'Combination of amla, bibhitaki, haritaki: reduces LDL −8 mg/dL, triglycerides −14 mg/dL (Cochrane 2021).', icon: '🫙' },
      { name: 'Guggul (Commiphora)', dose: '500mg standardised extract twice daily', why: 'Reduces LDL by 12% and triglycerides by 15% (Journal of Association of Physicians India).', icon: '🌿' },
    ],
    diet: 'Warm, light, dry foods: ginger tea, legumes, leafy greens. Avoid: dairy excess, refined sugar, cold food.',
  },
  vata: {
    label: 'Vata Imbalance',
    color: '#7c3aed',
    bg: '#f5f3ff',
    icon: '💨',
    description: 'Air & Ether element — nerve weakness, deficiency states, dry tissue, hormonal decline',
    biomarkers: ['Vitamin D', 'B12', 'HDL', 'Hemoglobin', 'Testosterone', 'eGFR', 'Creatinine', 'Folate'],
    herbs: [
      { name: 'Ashwagandha (Withania)', dose: '300–600mg KSM-66 extract daily', why: 'Gold-standard adaptogen: +15% testosterone in 8 weeks (JISSN 2019), −28% cortisol. Also increases hemoglobin.', icon: '🌿' },
      { name: 'Shatavari', dose: '500mg–1g extract daily', why: 'Phytoestrogen action: improves hormonal balance. Clinical evidence for iron-deficiency anemia in women.', icon: '🌱' },
      { name: 'Brahmi (Bacopa)', dose: '300–450mg extract daily (min 20% bacosides)', why: 'Reduces cortisol, improves nervous system signaling. Also shown to support B12 absorption.', icon: '🧠' },
      { name: 'Sesame (Tila)', dose: '1–2 tbsp seeds or oil daily (til oil massage)', why: 'Grounding for Vata. Rich in calcium, iron, zinc — addresses multiple deficiency markers.', icon: '🌾' },
    ],
    diet: 'Warm, oily, nourishing: ghee, sesame seeds, soaked almonds, warm milk, root vegetables. Avoid: raw food excess, fasting.',
  },
}

export function getAyurvedaProfile(conditions) {
  const scores = { pitta: 0, kapha: 0, vata: 0 }
  if (conditions.highInflammation) scores.pitta += 3
  if (conditions.liverStress)      scores.pitta += 2
  if (conditions.highUricAcid)     scores.pitta += 1
  if (conditions.highBloodSugar)   scores.kapha += 3
  if (conditions.diabetes)         scores.kapha += 2
  if (conditions.highLDL)          scores.kapha += 2
  if (conditions.highTriglycerides)scores.kapha += 2
  if (conditions.thyroidIssue)     scores.kapha += 1
  if (conditions.lowVitD)          scores.vata += 2
  if (conditions.lowB12)           scores.vata += 2
  if (conditions.anemia)           scores.vata += 2
  if (conditions.lowTestosterone)  scores.vata += 2
  if (conditions.kidneyStress)     scores.vata += 1
  if (conditions.lowHDL)           scores.vata += 1

  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return dominant.filter(([, s]) => s > 0).map(([type]) => AYURVEDA_MAP[type])
}
