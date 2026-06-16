/*
  Smart Data Router
  -----------------
  Every biomarker has a priority chain of sources.
  The router picks the best available connected source.
  Anything uncovered → auto-added to the Smart Lab Panel.
*/

export const BIOMARKER_ROUTES = [

  // ── METABOLIC ──────────────────────────────────
  {
    id: 'glucose', name: 'Blood Glucose', icon: '🩸', category: 'Metabolic',
    sources: [
      { id: 'cgm',       label: 'Live CGM reading',           quality: 'live',      icon: '📡' },
      { id: 'healthkit', label: 'Apple / Google Health log',  quality: 'manual',    icon: '❤️' },
      { id: 'lab',       label: 'HbA1c from lab report',      quality: 'quarterly', icon: '🩸' },
      { id: 'abha',      label: 'Lab history via ABHA',        quality: 'quarterly', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'HbA1c + Fasting Glucose + Fasting Insulin',
      interval: '90 days',
      why: 'Blood sugar is the #1 controllable driver of biological ageing',
    },
  },
  {
    id: 'insulin_resistance', name: 'Insulin Resistance', icon: '⚡', category: 'Metabolic',
    sources: [
      { id: 'cgm',  label: 'Glucose variability from CGM', quality: 'live',      icon: '📡' },
      { id: 'lab',  label: 'HOMA-IR from lab report',      quality: 'quarterly', icon: '🩸' },
      { id: 'abha', label: 'Lab history via ABHA',          quality: 'quarterly', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'Fasting Insulin + HOMA-IR',
      interval: '90 days',
      why: 'Insulin resistance silently damages every organ for years before symptoms appear',
    },
  },
  {
    id: 'body_composition', name: 'Body Fat & Muscle', icon: '💪', category: 'Metabolic',
    sources: [
      { id: 'scale',     label: 'Smart scale measurement',       quality: 'weekly',    icon: '⚖️' },
      { id: 'healthkit', label: 'Body fat % from Apple Health',  quality: 'periodic',  icon: '❤️' },
      { id: 'abha',      label: 'DEXA scan from hospital',       quality: 'annual',    icon: '🇮🇳' },
    ],
    labTest: {
      test: 'DEXA scan (or bioimpedance at any gym)',
      interval: '6 months',
      why: 'Muscle loss after 30 is the hidden driver of frailty and metabolic decline',
    },
  },
  {
    id: 'visceral_fat', name: 'Visceral Fat', icon: '🫁', category: 'Metabolic',
    sources: [
      { id: 'scale', label: 'Smart scale visceral fat score', quality: 'weekly', icon: '⚖️' },
      { id: 'abha',  label: 'Imaging from hospital records',  quality: 'annual', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'Waist circumference + waist-to-hip ratio (measure at home)',
      interval: 'Monthly',
      why: 'Visceral fat around organs is more dangerous than subcutaneous fat',
    },
  },

  // ── CARDIOVASCULAR ────────────────────────────
  {
    id: 'cholesterol', name: 'Cholesterol Panel', icon: '🫀', category: 'Cardiovascular',
    sources: [
      { id: 'lab',  label: 'Lipid panel from lab report', quality: 'quarterly', icon: '🩸' },
      { id: 'abha', label: 'Lab history via ABHA',         quality: 'quarterly', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'ApoB + LDL + HDL + Triglycerides + Non-HDL cholesterol',
      interval: '90 days',
      why: 'ApoB is more accurate than LDL alone for predicting heart attack risk',
    },
  },
  {
    id: 'hrv', name: 'Heart Rate Variability', icon: '💓', category: 'Cardiovascular',
    sources: [
      { id: 'ring',      label: 'Smart ring (most accurate)', quality: 'live', icon: '💍' },
      { id: 'healthkit', label: 'Apple Watch / wearable',     quality: 'live', icon: '❤️' },
    ],
    labTest: {
      test: 'ECG + resting HRV test (cardiologist or sports lab)',
      interval: 'Annual',
      why: 'HRV is the best wearable proxy for biological age and recovery capacity',
    },
  },
  {
    id: 'resting_hr', name: 'Resting Heart Rate', icon: '❤️', category: 'Cardiovascular',
    sources: [
      { id: 'ring',      label: 'Smart ring reading',            quality: 'live', icon: '💍' },
      { id: 'healthkit', label: 'Apple Watch / Google Health',   quality: 'live', icon: '❤️' },
    ],
    labTest: {
      test: 'Manual pulse count (60 seconds on waking, before getting up)',
      interval: 'Daily',
      why: 'Resting HR is a simple, free cardiovascular fitness marker',
    },
  },
  {
    id: 'blood_pressure', name: 'Blood Pressure', icon: '🩺', category: 'Cardiovascular',
    sources: [
      { id: 'healthkit', label: 'Apple Health BP log',           quality: 'manual',   icon: '❤️' },
      { id: 'lab',       label: 'BP from clinic visit',          quality: 'periodic',  icon: '🩸' },
      { id: 'abha',      label: 'Hospital BP records via ABHA',  quality: 'periodic',  icon: '🇮🇳' },
    ],
    labTest: {
      test: 'Home BP monitor — 3 readings over 3 mornings (buy once, use forever)',
      interval: 'Weekly',
      why: 'Hypertension has no symptoms but doubles cardiovascular ageing risk',
    },
  },
  {
    id: 'vo2max', name: 'VO2 Max', icon: '🏃', category: 'Cardiovascular',
    sources: [
      { id: 'healthkit', label: 'VO2 max estimate from Apple Watch / Garmin', quality: 'good', icon: '❤️' },
      { id: 'ring',      label: 'Fitness estimate from smart ring',            quality: 'good', icon: '💍' },
    ],
    labTest: {
      test: 'VO2 max test at a sports medicine lab or cardiac stress test',
      interval: 'Annual',
      why: 'VO2 max is the #1 longevity predictor — stronger than any biomarker',
    },
  },

  // ── INFLAMMATION ──────────────────────────────
  {
    id: 'hscrp', name: 'hsCRP (Inflammation)', icon: '🔥', category: 'Inflammation',
    sources: [
      { id: 'lab',  label: 'hsCRP from lab report', quality: 'quarterly', icon: '🩸' },
      { id: 'abha', label: 'Lab history via ABHA',   quality: 'quarterly', icon: '🇮🇳' },
      { id: 'ring', label: 'Skin temp proxy (trend indicator only)', quality: 'proxy', icon: '💍' },
    ],
    labTest: {
      test: 'hsCRP + Homocysteine + ESR',
      interval: '90 days',
      why: 'Chronic inflammation is the silent engine behind every age-related disease',
    },
  },
  {
    id: 'homocysteine', name: 'Homocysteine', icon: '🧠', category: 'Inflammation',
    sources: [
      { id: 'lab',  label: 'Homocysteine from lab report', quality: 'quarterly', icon: '🩸' },
      { id: 'abha', label: 'Lab history via ABHA',          quality: 'quarterly', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'Homocysteine (serum)',
      interval: '90 days',
      why: 'Elevated homocysteine causes brain damage and heart disease — fixable with B12 + folate',
    },
  },

  // ── HORMONES ──────────────────────────────────
  {
    id: 'testosterone', name: 'Testosterone', icon: '⚡', category: 'Hormones',
    sources: [
      { id: 'lab',  label: 'Total + free T from lab', quality: 'quarterly', icon: '🩸' },
      { id: 'abha', label: 'Lab history via ABHA',     quality: 'quarterly', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'Total Testosterone + Free Testosterone + SHBG',
      interval: '90 days',
      why: 'Testosterone declines 1%/year after 30 — it affects muscle, energy, mood, and longevity',
    },
  },
  {
    id: 'cortisol', name: 'Cortisol (Stress)', icon: '😤', category: 'Hormones',
    sources: [
      { id: 'lab',       label: 'Morning serum cortisol', quality: '6 months', icon: '🩸' },
      { id: 'ring',      label: 'HRV stress proxy',        quality: 'proxy',    icon: '💍' },
      { id: 'healthkit', label: 'HRV stress trend',        quality: 'proxy',    icon: '❤️' },
      { id: 'abha',      label: 'Lab history via ABHA',    quality: '6 months', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'Morning serum Cortisol + DHEA-S',
      interval: '6 months',
      why: 'Chronic high cortisol destroys muscle, suppresses testosterone, and damages telomeres',
    },
  },
  {
    id: 'thyroid', name: 'Thyroid (TSH)', icon: '🦋', category: 'Hormones',
    sources: [
      { id: 'lab',  label: 'TSH + Free T3 from lab', quality: 'quarterly', icon: '🩸' },
      { id: 'abha', label: 'Lab history via ABHA',    quality: 'quarterly', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'TSH + Free T3 + Free T4',
      interval: '6 months',
      why: 'Undetected hypothyroidism causes fatigue, weight gain, and accelerated ageing in millions',
    },
  },

  // ── NUTRIENTS ─────────────────────────────────
  {
    id: 'vitamin_d', name: 'Vitamin D', icon: '☀️', category: 'Nutrients',
    sources: [
      { id: 'lab',  label: 'Vitamin D 25-OH from lab', quality: 'quarterly', icon: '🩸' },
      { id: 'abha', label: 'Lab history via ABHA',      quality: 'quarterly', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'Vitamin D (25-OH)',
      interval: '90 days',
      why: 'Vitamin D deficiency is epidemic in India and affects 200+ genes',
    },
  },
  {
    id: 'vitamin_b12', name: 'Vitamin B12', icon: '🔋', category: 'Nutrients',
    sources: [
      { id: 'lab',  label: 'B12 + Folate from lab', quality: 'quarterly', icon: '🩸' },
      { id: 'abha', label: 'Lab history via ABHA',   quality: 'quarterly', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'Vitamin B12 + Folate (B9)',
      interval: '90 days',
      why: 'B12 deficiency causes nerve damage, anemia, and brain ageing — very common in vegetarians',
    },
  },
  {
    id: 'ferritin', name: 'Iron / Ferritin', icon: '⚙️', category: 'Nutrients',
    sources: [
      { id: 'lab',  label: 'Ferritin + CBC from lab', quality: 'quarterly', icon: '🩸' },
      { id: 'abha', label: 'Lab history via ABHA',     quality: 'quarterly', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'Ferritin + Serum Iron + CBC (haemoglobin)',
      interval: '90 days',
      why: 'Iron deficiency causes persistent fatigue, hair loss, and poor exercise recovery',
    },
  },
  {
    id: 'omega3', name: 'Omega-3 Index', icon: '🐟', category: 'Nutrients',
    sources: [
      { id: 'lab',  label: 'Omega-3 Index from advanced panel', quality: '6 months', icon: '🩸' },
      { id: 'abha', label: 'Lab history via ABHA',               quality: '6 months', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'Omega-3 Index (EPA+DHA % of red blood cell fatty acids)',
      interval: '6 months',
      why: 'Low omega-3 is linked to inflammation, heart disease and shorter telomeres',
    },
  },

  // ── SLEEP ─────────────────────────────────────
  {
    id: 'sleep', name: 'Sleep Quality', icon: '😴', category: 'Recovery',
    sources: [
      { id: 'ring',      label: 'Smart ring sleep staging (most accurate)', quality: 'live', icon: '💍' },
      { id: 'healthkit', label: 'Apple Watch / Google Health sleep',         quality: 'live', icon: '❤️' },
    ],
    labTest: {
      test: 'Home sleep apnea test (if snoring / low energy despite sleep)',
      interval: 'Once if suspected',
      why: 'Poor deep sleep blocks GH release, brain detox, and cellular repair',
    },
  },
  {
    id: 'spo2', name: 'Blood Oxygen (SpO2)', icon: '🫧', category: 'Recovery',
    sources: [
      { id: 'ring',      label: 'Smart ring SpO2 (overnight)', quality: 'live', icon: '💍' },
      { id: 'healthkit', label: 'Apple Watch / pulse oximeter', quality: 'live', icon: '❤️' },
    ],
    labTest: {
      test: 'Pulse oximeter (₹800 at any pharmacy)',
      interval: 'Weekly at rest',
      why: 'Nighttime SpO2 dips below 90% indicate sleep apnea — a major ageing accelerator',
    },
  },

  // ── ORGAN HEALTH ──────────────────────────────
  {
    id: 'liver', name: 'Liver Function', icon: '🟤', category: 'Organ Health',
    sources: [
      { id: 'lab',  label: 'ALT + AST + GGT from lab', quality: 'quarterly', icon: '🩸' },
      { id: 'abha', label: 'Lab history via ABHA',       quality: 'quarterly', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'ALT + AST + GGT + Bilirubin + Albumin',
      interval: '90 days',
      why: 'The liver runs 500+ functions — silent fatty liver is now an epidemic',
    },
  },
  {
    id: 'kidney', name: 'Kidney Function', icon: '🫘', category: 'Organ Health',
    sources: [
      { id: 'lab',  label: 'Creatinine + eGFR from lab', quality: 'quarterly', icon: '🩸' },
      { id: 'abha', label: 'Lab history via ABHA',         quality: 'quarterly', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'Creatinine + eGFR + BUN + Uric Acid',
      interval: '90 days',
      why: 'Kidney decline is silent for decades — catching it early is completely treatable',
    },
  },
  {
    id: 'uric_acid', name: 'Uric Acid (Gout)', icon: '⚠️', category: 'Organ Health',
    sources: [
      { id: 'lab',  label: 'Uric acid from lab report', quality: 'quarterly', icon: '🩸' },
      { id: 'abha', label: 'Lab history via ABHA',        quality: 'quarterly', icon: '🇮🇳' },
    ],
    labTest: {
      test: 'Uric Acid',
      interval: '90 days',
      why: 'High uric acid causes gout, kidney stones, and contributes to metabolic syndrome',
    },
  },

  // ── ADVANCED LONGEVITY ────────────────────────
  {
    id: 'epigenetic_age', name: 'Epigenetic (DNA) Age', icon: '🧬', category: 'Advanced',
    sources: [
      { id: 'epigenetic', label: 'TruDiagnostic / TruMe test', quality: 'annual', icon: '🧬' },
    ],
    labTest: {
      test: 'Epigenetic clock test — TruMe (India, ₹8,999) or TruDiagnostic (~$299)',
      interval: 'Annual',
      why: 'DNA methylation clocks are the most scientifically validated BioAge measurement on Earth',
    },
  },
  {
    id: 'telomere', name: 'Telomere Length', icon: '🔬', category: 'Advanced',
    sources: [
      { id: 'epigenetic', label: 'Included in epigenetic test', quality: 'annual', icon: '🧬' },
      { id: 'lab', label: 'Standalone telomere test', quality: 'annual', icon: '🩸' },
    ],
    labTest: {
      test: 'Telomere length test (Life Length or SpectraCell)',
      interval: 'Annual',
      why: 'Telomere length directly measures cellular ageing — shorter = older at the DNA level',
    },
  },
]

/* ─── Category icons ─── */
export const CATEGORY_META = {
  Metabolic:     { icon: '⚡', color: '#f59e0b' },
  Cardiovascular:{ icon: '🫀', color: '#ef4444' },
  Inflammation:  { icon: '🔥', color: '#f97316' },
  Hormones:      { icon: '⚗️', color: '#8b5cf6' },
  Nutrients:     { icon: '🌿', color: '#22c55e' },
  Recovery:      { icon: '😴', color: '#3b82f6' },
  'Organ Health':{ icon: '🏥', color: '#06b6d4' },
  Advanced:      { icon: '🧬', color: '#a855f7' },
}

/* ─── Source quality labels ─── */
const QUALITY_LABEL = {
  live:      { label: 'Live',       color: '#16a34a' },
  good:      { label: 'Good',       color: '#0284c7' },
  manual:    { label: 'Manual log', color: '#0284c7' },
  quarterly: { label: 'Quarterly',  color: '#7c3aed' },
  '6 months':{ label: '6 months',   color: '#7c3aed' },
  periodic:  { label: 'Periodic',   color: '#7c3aed' },
  annual:    { label: 'Annual',      color: '#475569' },
  proxy:     { label: 'Estimate',   color: '#b45309' },
}

/* ─── Main routing function ─── */
export function routeData(connectedSourceIds) {
  const covered = []
  const labRequired = []

  for (const bm of BIOMARKER_ROUTES) {
    const match = bm.sources.find(s => connectedSourceIds.includes(s.id))
    if (match) {
      covered.push({
        ...bm,
        via: match,
        qualityMeta: QUALITY_LABEL[match.quality] || QUALITY_LABEL.periodic,
      })
    } else {
      labRequired.push(bm)
    }
  }

  return { covered, labRequired }
}

/* ─── Grouped by category ─── */
export function routeGrouped(connectedSourceIds) {
  const { covered, labRequired } = routeData(connectedSourceIds)
  const groups = {}

  for (const bm of covered) {
    if (!groups[bm.category]) groups[bm.category] = { covered: [], labRequired: [] }
    groups[bm.category].covered.push(bm)
  }
  for (const bm of labRequired) {
    if (!groups[bm.category]) groups[bm.category] = { covered: [], labRequired: [] }
    groups[bm.category].labRequired.push(bm)
  }

  return groups
}

/* ─── Coverage percentage ─── */
export function coveragePercent(connectedSourceIds) {
  const { covered } = routeData(connectedSourceIds)
  return Math.round((covered.length / BIOMARKER_ROUTES.length) * 100)
}
