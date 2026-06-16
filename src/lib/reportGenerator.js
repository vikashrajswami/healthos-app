/*
  Smart Panel Report Generator
  ----------------------------
  Takes connected source IDs → finds all gaps → builds a prioritized,
  printable lab test request with instructions, costs, and grouping.
*/

import { routeData, CATEGORY_META } from './dataRouter'

/* ─── Physical lab panels — how real labs group tests ─── */
const PANELS = [
  {
    id: 'metabolic',
    name: 'Metabolic & Blood Sugar',
    icon: '⚡',
    color: '#f59e0b',
    bg: '#fef9c3',
    priority: 1,
    label: 'CORE',
    labelColor: '#dc2626',
    fasting: true,
    sampleType: 'Blood (venous)',
    biomarkerIds: ['glucose', 'insulin_resistance'],
    tests: [
      { name: 'HbA1c (Glycated Haemoglobin)', code: 'HBA1C' },
      { name: 'Fasting Plasma Glucose', code: 'FPG' },
      { name: 'Fasting Insulin', code: 'FINS' },
      { name: 'HOMA-IR (calculated from above)', code: 'HOMA' },
    ],
    costRange: '₹600 – ₹900',
    whyCore: 'Blood sugar dysregulation is the #1 controllable driver of biological ageing',
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular & Lipid',
    icon: '🫀',
    color: '#ef4444',
    bg: '#fee2e2',
    priority: 1,
    label: 'CORE',
    labelColor: '#dc2626',
    fasting: true,
    sampleType: 'Blood (venous)',
    biomarkerIds: ['cholesterol'],
    tests: [
      { name: 'ApoB (Apolipoprotein B)', code: 'APOB' },
      { name: 'LDL Cholesterol (direct)', code: 'LDL' },
      { name: 'HDL Cholesterol', code: 'HDL' },
      { name: 'Triglycerides', code: 'TG' },
      { name: 'Total Cholesterol', code: 'CHOL' },
      { name: 'Non-HDL Cholesterol (calculated)', code: 'NONHDL' },
    ],
    costRange: '₹500 – ₹800',
    whyCore: 'ApoB is a better heart attack predictor than LDL — most people never test it',
  },
  {
    id: 'inflammation',
    name: 'Inflammation Markers',
    icon: '🔥',
    color: '#f97316',
    bg: '#fff7ed',
    priority: 1,
    label: 'CORE',
    labelColor: '#dc2626',
    fasting: false,
    sampleType: 'Blood (venous)',
    biomarkerIds: ['hscrp', 'homocysteine'],
    tests: [
      { name: 'hsCRP (High-sensitivity C-Reactive Protein)', code: 'HSCRP' },
      { name: 'Homocysteine (serum)', code: 'HCY' },
      { name: 'ESR (Erythrocyte Sedimentation Rate)', code: 'ESR' },
    ],
    costRange: '₹500 – ₹750',
    whyCore: 'Chronic inflammation is the silent engine of every age-related disease',
  },
  {
    id: 'nutrition',
    name: 'Vitamins & Nutrition',
    icon: '🌿',
    color: '#22c55e',
    bg: '#f0fdf4',
    priority: 1,
    label: 'CORE',
    labelColor: '#dc2626',
    fasting: false,
    sampleType: 'Blood (venous)',
    biomarkerIds: ['vitamin_d', 'vitamin_b12', 'ferritin', 'omega3'],
    tests: [
      { name: 'Vitamin D (25-OH)', code: 'VD25' },
      { name: 'Vitamin B12 (Cobalamin)', code: 'B12' },
      { name: 'Folate / Vitamin B9 (serum)', code: 'FOL' },
      { name: 'Ferritin', code: 'FER' },
      { name: 'Serum Iron + TIBC', code: 'IRON' },
      { name: 'CBC — Complete Blood Count (Haemoglobin, RBC, WBC)', code: 'CBC' },
    ],
    costRange: '₹800 – ₹1,200',
    whyCore: 'Vitamin D and B12 deficiency affect millions in India — both are fully reversible',
  },
  {
    id: 'organ',
    name: 'Organ Function Panel',
    icon: '🏥',
    color: '#06b6d4',
    bg: '#ecfeff',
    priority: 1,
    label: 'CORE',
    labelColor: '#dc2626',
    fasting: false,
    sampleType: 'Blood (venous)',
    biomarkerIds: ['liver', 'kidney', 'uric_acid'],
    tests: [
      { name: 'ALT / SGPT (liver enzyme)', code: 'ALT' },
      { name: 'AST / SGOT (liver enzyme)', code: 'AST' },
      { name: 'GGT (Gamma-Glutamyl Transferase)', code: 'GGT' },
      { name: 'Total Bilirubin + Direct Bilirubin', code: 'BILI' },
      { name: 'Albumin (protein synthesis marker)', code: 'ALB' },
      { name: 'Creatinine (serum)', code: 'CREAT' },
      { name: 'eGFR (calculated from creatinine + age)', code: 'EGFR' },
      { name: 'Blood Urea Nitrogen (BUN)', code: 'BUN' },
      { name: 'Uric Acid', code: 'UA' },
    ],
    costRange: '₹600 – ₹900',
    whyCore: 'Liver and kidney decline is silent for years — early detection is fully manageable',
  },
  {
    id: 'thyroid',
    name: 'Thyroid Panel',
    icon: '🦋',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    priority: 2,
    label: 'ADVANCED',
    labelColor: '#7c3aed',
    fasting: false,
    sampleType: 'Blood (venous)',
    biomarkerIds: ['thyroid'],
    tests: [
      { name: 'TSH (Thyroid Stimulating Hormone)', code: 'TSH' },
      { name: 'Free T3 (Triiodothyronine)', code: 'FT3' },
      { name: 'Free T4 (Thyroxine)', code: 'FT4' },
    ],
    costRange: '₹400 – ₹700',
    whyCore: 'Hypothyroidism is very common in India and goes undetected for years',
  },
  {
    id: 'hormones',
    name: 'Hormone Panel',
    icon: '⚗️',
    color: '#a855f7',
    bg: '#faf5ff',
    priority: 2,
    label: 'ADVANCED',
    labelColor: '#7c3aed',
    fasting: false,
    sampleType: 'Blood — must be drawn between 7–10 AM',
    biomarkerIds: ['testosterone', 'cortisol'],
    tests: [
      { name: 'Total Testosterone', code: 'TT' },
      { name: 'Free Testosterone (calculated or direct)', code: 'FT' },
      { name: 'SHBG (Sex Hormone Binding Globulin)', code: 'SHBG' },
      { name: 'Morning Serum Cortisol (draw at 8 AM)', code: 'CORT' },
      { name: 'DHEA-S (Dehydroepiandrosterone sulfate)', code: 'DHEAS' },
      { name: 'IGF-1 (Insulin-like Growth Factor 1)', code: 'IGF1' },
    ],
    costRange: '₹1,200 – ₹2,500',
    whyCore: 'Testosterone and cortisol directly control muscle, energy, stress, and ageing rate',
  },
  {
    id: 'advanced_longevity',
    name: 'Advanced Longevity Panel',
    icon: '🧬',
    color: '#9333ea',
    bg: '#fdf4ff',
    priority: 3,
    label: 'PREMIUM',
    labelColor: '#9333ea',
    fasting: false,
    sampleType: 'Blood or saliva (lab-specific)',
    biomarkerIds: ['epigenetic_age', 'telomere'],
    tests: [
      { name: 'Omega-3 Index (EPA+DHA % of RBC fatty acids)', code: 'OM3' },
      { name: 'Lipoprotein(a) — Lp(a)', code: 'LPA' },
      { name: 'ApoE Genotype (done once in lifetime)', code: 'APOE' },
      { name: 'Epigenetic Clock — Order from TruMe or TruDiagnostic', code: 'EPIC' },
    ],
    costRange: '₹3,000 – ₹12,000',
    whyCore: 'These reveal your true DNA biological age — the most accurate longevity measurement available',
  },
]

/* ─── Build the report ─── */
export function buildReport(connectedSourceIds) {
  const { labRequired } = routeData(connectedSourceIds)
  const missingIds = new Set(labRequired.map(b => b.id))

  // Filter panels to only include those with at least one missing biomarker
  const neededPanels = PANELS.filter(p =>
    p.biomarkerIds.some(id => missingIds.has(id))
  )

  // If all core sources connected, still show panels where biomarkers matched
  // But always show at minimum the panels relevant to gaps
  const finalPanels = neededPanels.length > 0 ? neededPanels : PANELS.slice(0, 5)

  // Total test count
  const totalTests = finalPanels.reduce((sum, p) => sum + p.tests.length, 0)

  // Cost range
  const minCost = finalPanels.reduce((sum, p) => {
    const match = p.costRange.match(/₹([\d,]+)/)
    return sum + (match ? parseInt(match[1].replace(',', '')) : 0)
  }, 0)
  const maxCost = finalPanels.reduce((sum, p) => {
    const matches = [...p.costRange.matchAll(/₹([\d,]+)/g)]
    const last = matches[matches.length - 1]
    return sum + (last ? parseInt(last[1].replace(',', '')) : 0)
  }, 0)

  const corePanels     = finalPanels.filter(p => p.priority === 1)
  const advancedPanels = finalPanels.filter(p => p.priority === 2)
  const premiumPanels  = finalPanels.filter(p => p.priority === 3)

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const refNo = 'HOS-' + Date.now().toString().slice(-6)

  return {
    panels: finalPanels, corePanels, advancedPanels, premiumPanels,
    totalTests, missingCount: labRequired.length,
    connectedCount: connectedSourceIds.length,
    costMin: minCost, costMax: maxCost,
    today, refNo,
  }
}

/* ─── WhatsApp text for sharing ─── */
export function buildWhatsAppText(report) {
  const lines = [
    `*HealthOS Smart Lab Panel*`,
    `Date: ${report.today} | Ref: ${report.refNo}`,
    ``,
    `Please include the following tests in my blood work:`,
    ``,
  ]
  if (report.corePanels.length) {
    lines.push(`*PRIORITY 1 — CORE PANEL (Every 90 days)*`)
    report.corePanels.forEach(p => {
      lines.push(`${p.icon} ${p.name}`)
      p.tests.forEach(t => lines.push(`  • ${t.name}`))
    })
    lines.push(``)
  }
  if (report.advancedPanels.length) {
    lines.push(`*PRIORITY 2 — ADVANCED PANEL (Every 6 months)*`)
    report.advancedPanels.forEach(p => {
      lines.push(`${p.icon} ${p.name}`)
      p.tests.forEach(t => lines.push(`  • ${t.name}`))
    })
    lines.push(``)
  }
  lines.push(
    `*INSTRUCTIONS*`,
    `⏰ Fast 10-12 hours (water is fine)`,
    `☀️ Preferred time: 7–10 AM`,
    `💊 Mention all current medications`,
    ``,
    `Estimated cost: ₹${report.costMin.toLocaleString('en-IN')} – ₹${report.costMax.toLocaleString('en-IN')}`,
    ``,
    `After testing, upload to HealthOS to fill all data gaps automatically.`,
  )
  return lines.join('\n')
}

/* ─── Plain text for clipboard ─── */
export function buildClipboardText(report) {
  const lines = [
    `HEALTHOS SMART LAB PANEL`,
    `Date: ${report.today}   Reference: ${report.refNo}`,
    `Generated from: ${report.connectedCount} connected data sources`,
    ``,
    `═══════════════════════════════════════`,
    `TESTS TO REQUEST FROM YOUR LAB`,
    `═══════════════════════════════════════`,
    ``,
  ]
  report.panels.forEach((p, i) => {
    lines.push(`${i + 1}. ${p.name.toUpperCase()}`)
    p.tests.forEach(t => lines.push(`   • ${t.name}`))
    lines.push(`   Fasting: ${p.fasting ? 'Yes (10-12 hours)' : 'Not required'}`)
    lines.push(`   Sample: ${p.sampleType}`)
    lines.push(`   Cost: ${p.costRange}`)
    lines.push(``)
  })
  lines.push(
    `═══════════════════════════════════════`,
    `INSTRUCTIONS`,
    `═══════════════════════════════════════`,
    `• Fast 10-12 hours before test (water is allowed)`,
    `• Preferred time: 7:00 AM – 10:00 AM (morning sample)`,
    `• Bring this list to the lab counter`,
    `• Mention all medications to the phlebotomist`,
    `• Total blood draw: approximately 5-8 small tubes`,
    ``,
    `ESTIMATED TOTAL COST`,
    `₹${report.costMin.toLocaleString('en-IN')} – ₹${report.costMax.toLocaleString('en-IN')}`,
    `(at Dr Lal PathLabs, SRL, Thyrocare, or Apollo Diagnostics)`,
    ``,
    `WHERE TO BOOK`,
    `• Dr Lal PathLabs — home collection available nationwide`,
    `• SRL Diagnostics — widespread across India`,
    `• Thyrocare — most affordable, home collection`,
    `• Apollo Diagnostics — premium service`,
    ``,
    `After testing: Upload your PDF report to HealthOS.`,
    `All data gaps fill automatically once uploaded.`,
    ``,
    `Generated by HealthOS — Biological Age Reversal`,
  )
  return lines.join('\n')
}
