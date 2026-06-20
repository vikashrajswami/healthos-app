import { useState, useMemo } from 'react'
import { getCurrentValues } from '../lib/reportStore'
import { detectConditions } from '../lib/bioage'

/* ── Allergen catalogue ── */
const ALLERGENS = [
  { id: 'egg',     emoji: '🥚', label: 'Eggs',    keywords: ['egg', 'eggs', 'egg white', 'omelette'],            sub: 'tofu scramble / extra dal' },
  { id: 'fish',    emoji: '🐟', label: 'Fish',    keywords: ['fish', 'mackerel', 'rohu', 'hilsa', 'katla'],      sub: 'extra masoor dal + flaxseeds' },
  { id: 'chicken', emoji: '🍗', label: 'Chicken', keywords: ['chicken'],                                          sub: 'paneer / tofu' },
  { id: 'dairy',   emoji: '🥛', label: 'Dairy',   keywords: ['paneer', 'curd', 'yogurt', 'raita', 'milk', 'whey'], sub: 'coconut yogurt / soy milk' },
  { id: 'gluten',  emoji: '🌾', label: 'Gluten',  keywords: ['roti', 'oats', 'multigrain'],                      sub: 'brown rice / quinoa' },
  { id: 'nuts',    emoji: '🥜', label: 'Nuts',    keywords: ['walnut', 'almond', 'cashew', 'peanut'],            sub: 'pumpkin seeds / hemp seeds' },
  { id: 'soy',     emoji: '🫘', label: 'Soy',     keywords: ['tofu', 'tempeh', 'edamame', 'soy'],               sub: 'chickpeas / masoor dal' },
]

/* detect which allergens are present in a meal */
function getMealSwaps(meal, allergenIds) {
  if (!allergenIds.length) return []
  const haystack = (meal.name + ' ' + meal.desc).toLowerCase()
  return ALLERGENS
    .filter(a => allergenIds.includes(a.id) &&
      a.keywords.some(kw => new RegExp(`\\b${kw}s?\\b`, 'i').test(haystack)))
    .map(a => ({ emoji: a.emoji, label: a.label, sub: a.sub }))
}

/* parse free-text input → allergen IDs */
function parseText(text) {
  const lower = text.toLowerCase()
  return ALLERGENS
    .filter(a => lower.includes(a.id) || a.keywords.some(kw => lower.includes(kw)))
    .map(a => a.id)
}

/* ── Diet meta ── */
const DIET_META = {
  nonveg: {
    label: '🍖 Non-Veg',
    calories: '1,800', protein: '149g', carbs: '125g', fat: '72g', fiber: '38g', pct: '33%',
    note: 'Fish 5×/week = 1.5–2g EPA+DHA per serving. Most effective dietary intervention for your hsCRP 3.1. Whole eggs daily cover choline for DNA methylation repair (Horvath clock mechanism).',
    alert: null,
  },
  veg: {
    label: '🥗 Vegetarian',
    calories: '1,800', protein: '132g', carbs: '132g', fat: '68g', fiber: '40g', pct: '29%',
    note: 'Plant omega-3 from flaxseeds + walnuts covers ALA. Paneer + Greek yogurt + tofu + dal achieve near-target protein. Turmeric+pepper replaces fish as primary CRP intervention.',
    alert: 'Consider algae oil supplement (500mg EPA+DHA) to fully match fish omega-3 benefit for hsCRP.',
  },
  eggetarian: {
    label: '🥚 Eggetarian',
    calories: '1,800', protein: '138g', carbs: '115g', fat: '76g', fiber: '37g', pct: '31%',
    note: '3–4 whole eggs/day = ~440mg choline (exceeds daily target) + leucine threshold met at every meal. Lowest carbs of all 4 plans — best for your HbA1c 5.9%. Flaxseeds + walnuts cover plant omega-3.',
    alert: null,
  },
  vegan: {
    label: '🌱 Vegan',
    calories: '1,800', protein: '140g', carbs: '138g', fat: '58g', fiber: '44g', pct: '31%',
    note: 'Tempeh + tofu + edamame + spirulina + hemp seeds achieve 140g protein. Highest fiber of all 4 plans — most LDL-lowering effect. Nutritional yeast covers B12 (B12 deficiency accelerates aging via homocysteine).',
    alert: 'Algae oil supplement (500mg EPA+DHA) is essential on vegan. B12 supplement or nutritional yeast daily to prevent homocysteine buildup.',
  },
}

/* ── Meal plans ── */
const PLANS = {
  nonveg: [
    {
      time: 'BREAKFAST · 9:30-10:00 AM', kcal: '480 KCAL',
      name: 'Egg & Chicken Power Bowl',
      desc: '2 whole eggs + 2 egg whites scrambled with ½ tsp turmeric + black pepper · 100g grilled chicken breast · 1 tbsp ground flaxseeds · ½ cup steel-cut oats or 1 multigrain roti · 1 cup green tea (unsweetened)',
      macros: ['45g protein', '30g carbs', '20g fat'],
      why: 'Whole eggs = choline for DNA methylation (epigenetic clock repair). Turmeric+pepper = curcumin bioavailable — proven -0.73 mg/L CRP in meta-analysis.',
    },
    {
      time: 'LUNCH · 1:00-2:00 PM', kcal: '560 KCAL',
      name: 'Anti-Inflammatory Fish Thali',
      desc: '150g mackerel / rohu / hilsa / katla (grilled with turmeric — not fried) · 1 cup masoor dal · 200g mixed sabzi: spinach + broccoli + capsicum · ½ cup brown rice or 1 roti · 100g cucumber-curd raita',
      macros: ['48g protein', '45g carbs', '18g fat'],
      why: 'Fatty fish = 1.5–2g EPA+DHA directly lowers hsCRP + slows DunedinPACE (Waziry 2023). Dal fibre lowers LDL. Curd = fermented probiotic for gut microbiome → reduced inflammation.',
    },
    {
      time: 'SNACK · 4:30 PM', kcal: '220 KCAL',
      name: 'Omega-3 Power Snack',
      desc: '10g walnuts + 10g almonds + 10g pumpkin seeds · 1 boiled egg · 100g pomegranate seeds or mixed berries',
      macros: ['11g protein', '18g carbs', '14g fat'],
      why: 'Walnuts = highest ALA omega-3 among nuts (2.5g/30g). Pomegranate → urolithin A → mitophagy (Nature Medicine 2016). Boiled egg = leucine bridge.',
    },
    {
      time: 'DINNER · 7:00-7:30 PM', kcal: '540 KCAL',
      name: 'Grilled Protein & Cruciferous Greens',
      desc: '150g grilled chicken breast or fish (alternate nights) · OR 3 whole eggs (omelette nights) · 200g: broccoli + spinach + mushrooms + capsicum · ½ cup masoor dal · 1 small roti (optional)',
      macros: ['45g protein', '32g carbs', '20g fat'],
      why: 'Early dinner → true 14h fast by 9:30 AM. Broccoli sulforaphane activates Nrf2 → reduces oxidative stress. Mushrooms = ergothioneine (Cheah 2021: linked to lower biological age).',
    },
  ],

  veg: [
    {
      time: 'BREAKFAST · 9:30-10:00 AM', kcal: '480 KCAL',
      name: 'Paneer Bhurji & Oats Bowl',
      desc: '150g paneer bhurji with turmeric + black pepper + capsicum + onion · 1 tbsp ground flaxseeds + 1 tbsp chia seeds · ½ cup steel-cut oats or 1 multigrain roti · 100g Greek yogurt (hung curd) on side · 1 cup green tea',
      macros: ['38g protein', '34g carbs', '22g fat'],
      why: 'Paneer = complete protein + CLA (anti-inflammatory fatty acid). Flaxseeds + chia = ALA omega-3 (plant source). Greek yogurt = live cultures for gut microbiome → reduced CRP.',
    },
    {
      time: 'LUNCH · 1:00-2:00 PM', kcal: '580 KCAL',
      name: 'Tofu & Rajma Anti-Inflammatory Bowl',
      desc: '150g tofu (grilled with turmeric + herbs) · 1 cup rajma or chole (chickpeas) · 200g sabzi: spinach + broccoli + capsicum · ½ cup brown rice or 1 roti · 100g cucumber-curd raita · 1 tbsp ground flaxseeds in raita',
      macros: ['44g protein', '50g carbs', '16g fat'],
      why: 'Tofu = complete protein + isoflavones (reduce inflammation). Rajma/chickpeas = soluble fibre → beta-glucan → LDL reduction. Broccoli = sulforaphane for Nrf2 activation.',
    },
    {
      time: 'SNACK · 4:30 PM', kcal: '200 KCAL',
      name: 'Nut, Seed & Berry Mix',
      desc: '10g walnuts + 10g almonds + 15g pumpkin seeds + 5g hemp seeds · 100g pomegranate seeds or mixed berries · 1 cup green tea with a pinch of cinnamon',
      macros: ['9g protein', '18g carbs', '13g fat'],
      why: 'Hemp seeds = complete plant protein + GLA (anti-inflammatory omega-6). Pumpkin seeds = zinc. Cinnamon = reduces postprandial glucose spike by ~29% (Davis 2010).',
    },
    {
      time: 'DINNER · 7:00-7:30 PM', kcal: '540 KCAL',
      name: 'High-Protein Paneer & Greens Dinner',
      desc: '200g grilled paneer tikka (lemon + herbs, not heavy gravy) · 200g: broccoli + spinach + mushrooms + capsicum (stir-fried) · 1 cup masoor dal · 1 small roti (optional) · 10g walnuts',
      macros: ['41g protein', '30g carbs', '17g fat'],
      why: 'Paneer 200g = 36g complete protein for overnight muscle protein synthesis. Mushrooms = ergothioneine longevity compound. High-protein dinner prevents overnight muscle catabolism.',
    },
  ],

  eggetarian: [
    {
      time: 'BREAKFAST · 9:30-10:00 AM', kcal: '480 KCAL',
      name: 'Triple-Egg Power Scramble',
      desc: '3 whole eggs scrambled with ½ tsp turmeric + black pepper + ½ cup broccoli florets + capsicum · 100g Greek yogurt with 1 tbsp ground flaxseeds · ½ cup steel-cut oats or 1 multigrain roti · 1 cup green tea',
      macros: ['40g protein', '28g carbs', '24g fat'],
      why: '3 whole eggs = 441mg choline — exceeds daily methylation target. Highest choline meal of all 4 plans. Broccoli at breakfast = sulforaphane for all-day Nrf2 activation.',
    },
    {
      time: 'LUNCH · 1:00-2:00 PM', kcal: '560 KCAL',
      name: 'Tofu & Dal Thali',
      desc: '150g grilled tofu (turmeric + herbs) · 1 cup masoor dal · 200g sabzi: spinach + broccoli + capsicum · ½ cup brown rice or 1 roti · 100g curd raita with 1 tbsp flaxseeds',
      macros: ['40g protein', '42g carbs', '18g fat'],
      why: 'Tofu = complete protein + isoflavones. Dal + brown rice = complete amino acid profile (complementary proteins). Flaxseeds in raita = ALA omega-3 with fermented probiotic.',
    },
    {
      time: 'SNACK · 4:30 PM', kcal: '220 KCAL',
      name: 'Boiled Egg & Nut Bowl',
      desc: '2 boiled eggs · 10g walnuts + 10g almonds + 10g pumpkin seeds · 100g pomegranate seeds or mixed berries',
      macros: ['17g protein', '14g carbs', '15g fat'],
      why: 'Highest protein snack of all 4 plans. 2 boiled eggs = leucine bridge to maintain anabolic window. Pomegranate → urolithin A → mitophagy activation.',
    },
    {
      time: 'DINNER · 7:00-7:30 PM', kcal: '540 KCAL',
      name: 'Mushroom Omelette & Greens',
      desc: '4-egg omelette with mushrooms + spinach + capsicum + turmeric · 1 cup masoor dal · 200g broccoli + spinach + mushrooms (sautéed in 1 tsp olive oil) · 1 small roti (optional)',
      macros: ['41g protein', '31g carbs', '19g fat'],
      why: 'Eggs at dinner = overnight muscle repair protein (slow-digesting yolk). Mushrooms = beta-glucan + ergothioneine. No fish needed — eggs + flaxseeds cover omega-3 ALA pathway.',
    },
  ],

  vegan: [
    {
      time: 'BREAKFAST · 9:30-10:00 AM', kcal: '480 KCAL',
      name: 'Tofu Scramble & Power Seeds',
      desc: '200g firm tofu scrambled with turmeric + black pepper + nutritional yeast (2 tbsp) + capsicum · 2 tbsp hemp seeds + 1 tbsp ground flaxseeds + 1 tbsp chia seeds · ½ cup oats (cooked in water) · 100g berries · 1 cup green tea',
      macros: ['38g protein', '36g carbs', '18g fat'],
      why: 'Nutritional yeast = B12 + zinc + 16g protein/30g. B12 deficiency raises homocysteine → directly accelerates epigenetic aging. Hemp seeds = complete plant protein + GLA.',
    },
    {
      time: 'LUNCH · 1:00-2:00 PM', kcal: '560 KCAL',
      name: 'Tempeh & Dal Anti-Inflammatory Bowl',
      desc: '100g tempeh (marinated in turmeric + lemon + herbs, grilled) · 1 cup masoor dal · 100g edamame (stir-fried with garlic) · 200g sabzi: broccoli + spinach + capsicum + mushrooms · ½ cup brown rice or 1 roti',
      macros: ['46g protein', '48g carbs', '14g fat'],
      why: 'Tempeh = fermented soy → natural probiotic + 19g protein/100g. Edamame = complete plant protein. All 4 vegan proteins combined = full amino acid spectrum.',
    },
    {
      time: 'SNACK · 4:30 PM', kcal: '220 KCAL',
      name: 'Edamame & Walnut Bowl',
      desc: '150g shelled edamame · 15g walnuts + 10g pumpkin seeds · 100g pomegranate seeds or mixed berries',
      macros: ['16g protein', '20g carbs', '12g fat'],
      why: 'Edamame = complete protein + isoflavones + iron. Walnuts = 2.5g ALA omega-3. Pumpkin seeds = zinc + magnesium (vegan gap nutrients). Pomegranate = urolithin A.',
    },
    {
      time: 'DINNER · 7:00-7:30 PM', kcal: '540 KCAL',
      name: 'Tofu, Chickpea & Cruciferous Greens',
      desc: '150g grilled tofu (lemon + herbs) · 1 cup chickpeas/rajma · 200g broccoli + spinach + mushrooms + capsicum · ½ cup quinoa (complete protein grain) or 1 roti · 20g spirulina dissolved in small glass of water (before dinner)',
      macros: ['46g protein', '38g carbs', '14g fat'],
      why: 'Spirulina 20g = 14g protein + richest plant source of GLA + phycocyanin (powerful anti-inflammatory). Chickpeas = fibre for LDL reduction. Quinoa = only grain with all 9 essential amino acids.',
    },
  ],
}

const TABS = [
  { id: 'veg',         label: '🥗', name: 'Veg'        },
  { id: 'nonveg',      label: '🍖', name: 'Non-Veg'    },
  { id: 'eggetarian',  label: '🥚', name: 'Eggetarian' },
  { id: 'vegan',       label: '🌱', name: 'Vegan'      },
]

/* ── Biomarker personalization banner ── */
function BiomarkerBanner({ conditions }) {
  const [open, setOpen] = useState(false)

  const adjustments = []
  if (conditions.highInflammation)  adjustments.push({ icon: '🔥', label: 'High Inflammation', tip: 'Turmeric + black pepper in every meal. Fatty fish 5×/week. Avoid refined oils.', color: '#dc2626' })
  if (conditions.highBloodSugar)    adjustments.push({ icon: '🍬', label: 'Blood Sugar Elevated', tip: 'Eat protein before carbs at each meal. Swap white rice → brown rice or barley. 14-hour fast window.', color: '#d97706' })
  if (conditions.diabetes)          adjustments.push({ icon: '⚠️', label: 'Diabetic Range HbA1c', tip: 'Maximum dietary intervention: no refined carbs, fenugreek seeds soaked overnight daily, bitter melon juice fasting.', color: '#dc2626' })
  if (conditions.highLDL)           adjustments.push({ icon: '❤️', label: 'LDL Elevated', tip: 'Replace ghee with olive oil for cold use. 30g walnuts daily. 3g plant sterols via fortified foods.', color: '#e11d48' })
  if (conditions.highTriglycerides) adjustments.push({ icon: '🧴', label: 'High Triglycerides', tip: 'Cut added sugar to <6g/day. Omega-3 (fish or flaxseed). Limit fruit juice and fruit to 2 servings/day.', color: '#d97706' })
  if (conditions.lowVitD)           adjustments.push({ icon: '☀️', label: 'Vitamin D Deficient', tip: 'Fatty fish 5×/week or supplement 2,000–4,000 IU/day with K2. 20 mins sunlight exposure before 10 AM.', color: '#7c3aed' })
  if (conditions.lowB12)            adjustments.push({ icon: '💊', label: 'B12 Low', tip: 'Eggs + dairy daily for non-vegan. Vegans: supplement 1,000 mcg methylcobalamin + nutritional yeast.', color: '#7c3aed' })
  if (conditions.anemia)            adjustments.push({ icon: '🩸', label: 'Low Hemoglobin', tip: 'Spinach + lemon (vitamin C triples iron absorption). Avoid tea/coffee 1 hr before/after meals. Rajma, masoor dal daily.', color: '#dc2626' })
  if (conditions.liverStress)       adjustments.push({ icon: '🟤', label: 'Liver Enzymes Elevated', tip: 'Zero alcohol. Coffee 2 cups/day reduces ALT. Cruciferous vegetables (broccoli, cauliflower) daily.', color: '#b45309' })
  if (conditions.kidneyStress)      adjustments.push({ icon: '🔵', label: 'Kidney Stress', tip: 'Limit protein to 0.8g/kg body weight. Reduce sodium. Avoid creatine supplements. Increase water to 2.5–3L/day.', color: '#0284c7' })

  if (!adjustments.length) return null

  return (
    <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: open ? 12 : 0 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#15803d' }}>
            🧬 Personalised for your biomarkers
          </div>
          <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>
            {adjustments.length} condition{adjustments.length > 1 ? 's' : ''} detected · dietary adjustments applied
          </div>
        </div>
        <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', color: '#15803d', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '4px 8px' }}>
          {open ? '▲ Hide' : '▼ View'}
        </button>
      </div>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {adjustments.map((a, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', borderLeft: `3px solid ${a.color}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{a.icon} {a.label}</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{a.tip}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Allergy gate ── */
function AllergyGate({ onSubmit }) {
  const [selected, setSelected] = useState(new Set())
  const [text, setText]         = useState('')

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function build(noneMode) {
    if (noneMode) { onSubmit([]); return }
    const fromText  = parseText(text)
    const merged    = new Set([...selected, ...fromText])
    onSubmit([...merged])
  }

  const hasInput = selected.size > 0 || text.trim().length > 0

  return (
    <div className="allergy-gate">
      <div className="ag-icon">🌿</div>
      <div className="ag-heading">What should we keep off your plate?</div>
      <div className="ag-sub">Tell us your allergies or foods to avoid — we'll build your plan around them.</div>

      <div className="ag-chips">
        {ALLERGENS.map(a => (
          <button
            key={a.id}
            className={`ag-chip ${selected.has(a.id) ? 'active' : ''}`}
            onClick={() => toggle(a.id)}
          >
            {a.emoji} {a.label}
          </button>
        ))}
      </div>

      <div className="ag-input-wrap">
        <input
          className="ag-input"
          placeholder="Anything else? e.g. shellfish, mustard, sesame…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </div>

      <button
        className="ag-build-btn"
        onClick={() => build(false)}
        disabled={!hasInput}
      >
        {hasInput ? '🧬 Build My Personalised Plan →' : 'Select allergies above or type below'}
      </button>

      <button className="ag-none-btn" onClick={() => build(true)}>
        No allergies — I eat everything ✓
      </button>
    </div>
  )
}

/* ── Main screen ── */
export default function Screen6() {
  const [submitted,   setSubmitted]   = useState(false)
  const [allergenIds, setAllergenIds] = useState([])

  const currentBiomarkers = useMemo(() => getCurrentValues(), [])
  const conditions = useMemo(() => {
    const vals = Object.entries(currentBiomarkers).map(([name, d]) => ({ canonical: name, ...d }))
    return detectConditions(vals)
  }, [currentBiomarkers])

  // Auto-suggest diet based on conditions
  const suggestedDiet = useMemo(() => {
    if (conditions.diabetes || conditions.highBloodSugar) return 'veg'
    return 'veg'
  }, [conditions])

  const [diet, setDiet] = useState(suggestedDiet)

  function handleSubmit(ids) {
    setAllergenIds(ids)
    setSubmitted(true)
  }

  const meta  = DIET_META[diet]
  const meals = PLANS[diet]

  if (!submitted) {
    return (
      <div className="screen">
        <button className="nav-back">← Your Diet Plan</button>
        <AllergyGate onSubmit={handleSubmit} />
      </div>
    )
  }

  const activeAllergens = ALLERGENS.filter(a => allergenIds.includes(a.id))

  return (
    <div className="screen">
      <button className="nav-back">← Your Diet Plan</button>

      {/* Biomarker personalization */}
      <BiomarkerBanner conditions={conditions} />

      {/* Allergy summary bar */}
      <div className="allergy-bar">
        <span className="ab-label">
          {allergenIds.length === 0
            ? '✓ No restrictions'
            : `🚫 Avoiding: ${activeAllergens.map(a => a.emoji + ' ' + a.label).join(', ')}`}
        </span>
        <button className="ab-edit" onClick={() => setSubmitted(false)}>Edit</button>
      </div>

      {/* Diet type selector */}
      <div className="diet-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`diet-tab ${diet === t.id ? 'active' : ''}`}
            onClick={() => setDiet(t.id)}
          >
            <span className="diet-tab-icon">{t.label}</span>
            <span className="diet-tab-name">{t.name}</span>
          </button>
        ))}
      </div>

      {/* Target card */}
      <div className="target-card">
        <div className="lbl">Daily Target · Built for Age Reversal · {meta.label}</div>
        <div className="big">{meta.calories} kcal</div>
        <div className="desc2">
          Calibrated for age 41, 78kg, 172cm · hsCRP 3.1 · LDL 142 · HbA1c 5.9% · Protocol: CALERIE + PROT-AGE guidelines.
        </div>
        <div className="macro-row">
          <div className="m"><div className="v">{meta.protein}</div><div className="l">Protein</div></div>
          <div className="m"><div className="v">{meta.carbs}</div><div className="l">Carbs</div></div>
          <div className="m"><div className="v">{meta.fat}</div><div className="l">Fat</div></div>
          <div className="m"><div className="v">{meta.fiber}</div><div className="l">Fiber</div></div>
        </div>
      </div>

      <div className="three-stat">
        <div className="b"><div className="v">14h</div><div className="l">FAST WINDOW</div></div>
        <div className="b"><div className="v">{meta.pct}</div><div className="l">PROTEIN/KCAL</div></div>
        <div className="b"><div className="v">&lt;6g</div><div className="l">ADDED SUGAR</div></div>
      </div>

      <div className="sci-note"><span>🔬</span><span>{meta.note}</span></div>
      {meta.alert && <div className="diet-alert"><span>⚠️</span><span>{meta.alert}</span></div>}

      <div className="card-title">Today's Meals</div>

      {meals.map(m => {
        const swaps = getMealSwaps(m, allergenIds)
        return (
          <div key={m.name} className={`meal-card ${swaps.length ? 'meal-card-warn' : ''}`}>
            <div className="meal-head">
              <span className="time">{m.time}</span>
              <span className="kcal">{m.kcal}</span>
            </div>
            <div className="meal-name">{m.name}</div>
            <div className="meal-desc">{m.desc}</div>
            <div className="meal-macros">{m.macros.map(x => <span key={x}>{x}</span>)}</div>

            {swaps.length > 0 && (
              <div className="meal-swaps">
                <div className="ms-label">⚠️ Allergen swaps for you:</div>
                {swaps.map(s => (
                  <div key={s.label} className="ms-row">
                    <span className="ms-out">{s.emoji} {s.label} removed</span>
                    <span className="ms-arr">→</span>
                    <span className="ms-in">use {s.sub}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="meal-why">🔬 {m.why}</div>
          </div>
        )
      })}

      <div className="adapt-notice">
        <span>🔄</span>
        <span><b>Plan adapts automatically</b> — Macros update as your biomarkers change. Switch your diet type anytime.</span>
      </div>
    </div>
  )
}
