// ── HealthOS Universal Lab Report Normalizer ─────────────────────────────────
// Handles biomarker names in 20+ languages, unit conversions, and reference ranges.
// Research basis: WHO reference values, IFCC/AACC standards, Indian ICMR guidelines,
// European lab standards, Japanese/Korean lab norms.

// ── Unit conversion factors (multiply by factor to get standard unit) ─────────
const UNIT_CONV = {
  // Glucose: standard = mg/dL
  glucose: {
    'mmol/l': 18.018, 'mmol/L': 18.018, 'mM': 18.018,
    'mg/dl': 1, 'mg/dL': 1,
  },
  // Cholesterol/Lipids: standard = mg/dL
  cholesterol: {
    'mmol/l': 38.67, 'mmol/L': 38.67,
    'mg/dl': 1, 'mg/dL': 1,
  },
  // Triglycerides: standard = mg/dL
  triglycerides: {
    'mmol/l': 88.57, 'mmol/L': 88.57,
    'mg/dl': 1, 'mg/dL': 1,
  },
  // Creatinine: standard = mg/dL
  creatinine: {
    'µmol/l': 0.01131, 'umol/l': 0.01131, 'µmol/L': 0.01131, 'umol/L': 0.01131,
    'mg/dl': 1, 'mg/dL': 1,
  },
  // Uric acid: standard = mg/dL
  uric_acid: {
    'µmol/l': 0.01681, 'umol/l': 0.01681, 'µmol/L': 0.01681,
    'mg/dl': 1, 'mg/dL': 1,
  },
  // Vitamin D: standard = ng/mL
  vitamin_d: {
    'nmol/l': 0.4006, 'nmol/L': 0.4006,
    'ng/ml': 1, 'ng/mL': 1,
  },
  // Vitamin B12: standard = pg/mL
  vitamin_b12: {
    'pmol/l': 1.355, 'pmol/L': 1.355,
    'pg/ml': 1, 'pg/mL': 1,
  },
  // Hemoglobin: standard = g/dL
  hemoglobin: {
    'g/l': 0.1, 'g/L': 0.1,
    'mmol/l': 1.6113, 'mmol/L': 1.6113,
    'g/dl': 1, 'g/dL': 1,
  },
  // Iron: standard = µg/dL
  iron: {
    'µmol/l': 5.585, 'umol/l': 5.585, 'µmol/L': 5.585,
    'µg/dl': 1, 'ug/dl': 1, 'µg/dL': 1,
  },
  // Ferritin: standard = ng/mL (= µg/L same value)
  ferritin: {
    'µg/l': 1, 'ug/l': 1, 'µg/L': 1,
    'ng/ml': 1, 'ng/mL': 1,
    'pmol/l': 0.4424, 'pmol/L': 0.4424,
  },
  // TSH: standard = µIU/mL (= mIU/L same value)
  tsh: {
    'miu/l': 1, 'mIU/L': 1, 'µiu/ml': 1, 'µIU/mL': 1, 'uiu/ml': 1,
    'mu/l': 1, 'mU/L': 1,
  },
  // Cortisol: standard = µg/dL
  cortisol: {
    'nmol/l': 0.03625, 'nmol/L': 0.03625,
    'µg/dl': 1, 'ug/dl': 1, 'µg/dL': 1,
  },
  // Testosterone: standard = ng/dL
  testosterone: {
    'nmol/l': 28.84, 'nmol/L': 28.84, 'ng/ml': 100,
    'ng/dl': 1, 'ng/dL': 1,
  },
  // CRP: standard = mg/L
  crp: {
    'mg/dl': 10, 'mg/dL': 10,
    'µg/ml': 1, 'µg/mL': 1,
    'mg/l': 1, 'mg/L': 1,
  },
  // Homocysteine: standard = µmol/L (no conversion needed for most labs)
  homocysteine: {
    'µmol/l': 1, 'umol/l': 1, 'µmol/L': 1,
    'mg/l': 7.397, 'mg/L': 7.397,
  },
}

// ── Master biomarker registry ─────────────────────────────────────────────────
export const BIOMARKER_REGISTRY = [
  // ── Metabolic ──────────────────────────────────────────────────────────────
  {
    id: 'glucose', canonical: 'Glucose', category: 'Metabolic', icon: '🩸',
    stdUnit: 'mg/dL', unitGroup: 'glucose',
    ref: { low: 70, high: 99, optLow: 75, optHigh: 90 },
    aliases: [
      // English
      'glucose','blood glucose','fasting glucose','fasting blood glucose','fasting blood sugar',
      'blood sugar','fbs','rbs','ppbs','rbs (random)','hb sugar','sugar',
      // Hindi
      'ग्लूकोज','रक्त शर्करा','खाली पेट शर्करा','शुगर',
      // Arabic
      'الجلوكوز','سكر الدم','جلوكوز','غلوكوز الصيام',
      // Spanish
      'glucosa','glucemia','azucar en sangre','glucosa en ayunas',
      // French
      'glycémie','glycémie à jeun','sucre sanguin',
      // German
      'blutzucker','nüchternblutzucker','glukose','blutglukose',
      // Chinese
      '葡萄糖','血糖','空腹血糖','血葡萄糖',
      // Japanese
      'グルコース','血糖','血糖値','空腹時血糖',
      // Korean
      '포도당','혈당','공복혈당',
      // Russian
      'глюкоза','сахар крови','глюкоза крови',
      // Portuguese
      'glicose','glicemia','glicose em jejum',
      // Turkish
      'glukoz','kan şekeri','açlık kan şekeri',
      // Indonesian
      'glukosa','gula darah',
      // Tamil
      'குளுக்கோஸ்','இரத்த சர்க்கரை',
    ],
  },
  {
    id: 'hba1c', canonical: 'HbA1c', category: 'Metabolic', icon: '🔴',
    stdUnit: '%', unitGroup: null,
    // IFCC mmol/mol to NGSP %: (mmol/mol × 0.0915) + 2.15
    convFn: { 'mmol/mol': v => +(v * 0.0915 + 2.15).toFixed(1) },
    ref: { low: 0, high: 5.6, optLow: 4.5, optHigh: 5.4 },
    aliases: [
      'hba1c','glycated hemoglobin','glycosylated hemoglobin','haemoglobin a1c',
      'hemoglobin a1c','hb a1c','a1c','hba 1c','gh',
      'glykohmoglobin','hämoglobin a1c', // German
      'हीमोग्लोबिन a1c','ग्लाइकेटेड हीमोग्लोबिन', // Hindi
      'الهيموغلوبين السكري','الهيموجلوبين a1c', // Arabic
      '糖化血红蛋白','糖化ヘモグロビン','당화혈색소', // ZH/JA/KO
      'hemoglobina glicada','hemoglobina a1c', // PT/ES
      'hémoglobine glyquée', // FR
    ],
  },
  // ── Lipid Panel ────────────────────────────────────────────────────────────
  {
    id: 'cholesterol_total', canonical: 'Total Cholesterol', category: 'Lipids', icon: '🫀',
    stdUnit: 'mg/dL', unitGroup: 'cholesterol',
    ref: { low: 0, high: 199, optLow: 0, optHigh: 179 },
    aliases: [
      'total cholesterol','cholesterol total','cholesterol','tc','s-cholesterol','serum cholesterol',
      'gesamtcholesterin','cholesterin', // DE
      'कुल कोलेस्ट्रॉल','कोलेस्ट्रॉल', // HI
      'الكوليسترول الكلي','كوليسترول', // AR
      '总胆固醇','胆固醇','総コレステロール','총콜레스테롤', // ZH/JA/KO
      'colesterol total','colesterol', // ES/PT
      'cholestérol total', // FR
      'kolesterol total', // ID/TR
    ],
  },
  {
    id: 'ldl', canonical: 'LDL Cholesterol', category: 'Lipids', icon: '🫀',
    stdUnit: 'mg/dL', unitGroup: 'cholesterol',
    ref: { low: 0, high: 99, optLow: 0, optHigh: 79 },
    aliases: [
      'ldl','ldl cholesterol','ldl-c','ldl-cholesterol','low density lipoprotein',
      'ldl-chol','ldl chol','low-density lipoprotein cholesterol',
      'ldl-cholesterin','ldl cholesterin', // DE
      'एलडीएल कोलेस्ट्रॉल', // HI
      'الكوليسترول الضار','كوليسترول ldl', // AR
      'ldl胆固醇','低密度脂蛋白','悪玉コレステロール','ldl콜레스테롤', // ZH/JA/KO
      'colesterol ldl','colesterol mau', // ES/PT
      'cholestérol ldl', // FR
    ],
  },
  {
    id: 'hdl', canonical: 'HDL Cholesterol', category: 'Lipids', icon: '🫀',
    stdUnit: 'mg/dL', unitGroup: 'cholesterol',
    ref: { low: 40, high: 999, optLow: 60, optHigh: 999 }, // higher is better
    aliases: [
      'hdl','hdl cholesterol','hdl-c','hdl-cholesterol','high density lipoprotein',
      'hdl-chol','high-density lipoprotein cholesterol','good cholesterol',
      'hdl-cholesterin', // DE
      'एचडीएल कोलेस्ट्रॉल','अच्छा कोलेस्ट्रॉल', // HI
      'الكوليسترول الجيد','كوليسترول hdl', // AR
      'hdl胆固醇','高密度脂蛋白','善玉コレステロール','hdl콜레스테롤', // ZH/JA/KO
      'colesterol hdl','colesterol bom', // ES/PT
      'cholestérol hdl', // FR
    ],
  },
  {
    id: 'triglycerides', canonical: 'Triglycerides', category: 'Lipids', icon: '🫀',
    stdUnit: 'mg/dL', unitGroup: 'triglycerides',
    ref: { low: 0, high: 149, optLow: 0, optHigh: 99 },
    aliases: [
      'triglycerides','triglyceride','tg','trigs','serum triglycerides',
      'triglyceriden','triglyzeride', // NL/DE
      'ट्राइग्लिसराइड', // HI
      'الدهون الثلاثية','ثلاثي الغليسريد', // AR
      '甘油三酯','トリグリセリド','中性脂肪','중성지방', // ZH/JA/KO
      'triglicéridos','triglicerídeos', // ES/PT
      'triglycérides', // FR
      'trigliseridi', // IT
      'trigliserit', // TR
    ],
  },
  // ── Liver ──────────────────────────────────────────────────────────────────
  {
    id: 'alt', canonical: 'ALT (SGPT)', category: 'Liver', icon: '🫁',
    stdUnit: 'U/L', unitGroup: null,
    ref: { low: 0, high: 40, optLow: 0, optHigh: 30 },
    aliases: [
      'alt','sgpt','alanine aminotransferase','alanine transaminase','gpt',
      'alanin aminotransferase','alat', // DE
      'एएलटी','एसजीपीटी', // HI
      'ناقلة أمين الألانين','alt','sgpt', // AR
      '丙氨酸转氨酶','alt','アラニンアミノトランスフェラーゼ','알라닌아미노전이효소', // ZH/JA/KO
      'alaninaaminotransferase', // PT
      'alanine aminotransférase', // FR
    ],
  },
  {
    id: 'ast', canonical: 'AST (SGOT)', category: 'Liver', icon: '🫁',
    stdUnit: 'U/L', unitGroup: null,
    ref: { low: 0, high: 40, optLow: 0, optHigh: 30 },
    aliases: [
      'ast','sgot','aspartate aminotransferase','aspartate transaminase','got',
      'aspartat aminotransferase','asat', // DE
      'एएसटी','एसजीओटी', // HI
      'ناقلة أمين الأسبارتات', // AR
      '天冬氨酸转氨酶','ast','アスパラギン酸アミノトランスフェラーゼ','아스파르테이트아미노전이효소', // ZH/JA/KO
      'aspartato aminotransferase', // PT
      'aspartate aminotransférase', // FR
    ],
  },
  {
    id: 'alp', canonical: 'ALP', category: 'Liver', icon: '🫁',
    stdUnit: 'U/L', unitGroup: null,
    ref: { low: 40, high: 129, optLow: 50, optHigh: 100 },
    aliases: [
      'alp','alkaline phosphatase','alk phos','alk phosphatase','ap',
      'alkalische phosphatase', // DE
      'क्षारीय फॉस्फेट', // HI
      'الفوسفاتاز القلوي', // AR
      '碱性磷酸酶','アルカリフォスファターゼ','알칼리포스파타제', // ZH/JA/KO
      'fosfatase alcalina', // PT/ES
      'phosphatase alcaline', // FR
    ],
  },
  {
    id: 'ggt', canonical: 'GGT', category: 'Liver', icon: '🫁',
    stdUnit: 'U/L', unitGroup: null,
    ref: { low: 0, high: 55, optLow: 0, optHigh: 30 },
    aliases: [
      'ggt','gamma gt','γ-gt','gamma-gt','gamma glutamyl transferase',
      'gammaglutamyltransferase','γgt', 'gamma-glutamyl transpeptidase','ggtp',
      'γ-glutamyltransferase', // DE
      'γグルタミルトランスフェラーゼ', // JA
      '谷氨酰转肽酶', // ZH
    ],
  },
  {
    id: 'bilirubin_total', canonical: 'Total Bilirubin', category: 'Liver', icon: '🫁',
    stdUnit: 'mg/dL', unitGroup: null,
    ref: { low: 0, high: 1.2, optLow: 0.1, optHigh: 1.0 },
    aliases: [
      'total bilirubin','bilirubin total','bilirubin','t.bili','tbili','t-bili',
      'serum bilirubin','gesamtbilirubin', // DE
      'कुल बिलीरुबिन', // HI
      'البيليروبين الكلي', // AR
      '总胆红素','総ビリルビン','총빌리루빈', // ZH/JA/KO
      'bilirrubina total', // ES/PT
      'bilirubine totale', // FR
    ],
  },
  // ── Kidney ─────────────────────────────────────────────────────────────────
  {
    id: 'creatinine', canonical: 'Creatinine', category: 'Kidney', icon: '🫘',
    stdUnit: 'mg/dL', unitGroup: 'creatinine',
    ref: { low: 0.6, high: 1.2, optLow: 0.7, optHigh: 1.1 },
    aliases: [
      'creatinine','creatinin','serum creatinine','s.creatinine','s-creatinine','cr','crea',
      'kreatin','kreatinin', // DE/TR
      'क्रिएटिनिन', // HI
      'الكرياتينين', // AR
      '肌酐','クレアチニン','크레아티닌', // ZH/JA/KO
      'creatinina', // ES/PT/IT
      'créatinine', // FR
    ],
  },
  {
    id: 'egfr', canonical: 'eGFR', category: 'Kidney', icon: '🫘',
    stdUnit: 'mL/min/1.73m²', unitGroup: null,
    ref: { low: 60, high: 999, optLow: 90, optHigh: 999 },
    aliases: [
      'egfr','estimated gfr','estimated glomerular filtration rate','gfr','gfr (estimated)',
      'geschätzte gfr', // DE
      'अनुमानित जीएफआर', // HI
      'معدل الترشيح الكبيبي المقدر', // AR
      '估算肾小球滤过率','推算糸球体濾過量','추정 사구체여과율', // ZH/JA/KO
    ],
  },
  {
    id: 'uric_acid', canonical: 'Uric Acid', category: 'Kidney', icon: '🫘',
    stdUnit: 'mg/dL', unitGroup: 'uric_acid',
    ref: { low: 2.5, high: 7.0, optLow: 3.0, optHigh: 5.5 },
    aliases: [
      'uric acid','urate','serum uric acid','s.uric acid','sua',
      'harnsäure', // DE
      'यूरिक एसिड', // HI
      'حمض البوليك', // AR
      '尿酸','尿酸','요산', // ZH/JA/KO
      'ácido úrico', // ES/PT
      'acide urique', // FR
      'acido urico', // IT
      'ürik asit', // TR
    ],
  },
  {
    id: 'bun', canonical: 'BUN / Urea', category: 'Kidney', icon: '🫘',
    stdUnit: 'mg/dL', unitGroup: null,
    convFn: { 'mmol/l': v => v * 2.801 }, // urea mmol/L to BUN mg/dL
    ref: { low: 7, high: 20, optLow: 8, optHigh: 18 },
    aliases: [
      'bun','blood urea nitrogen','urea nitrogen','urea','serum urea','s.urea',
      'blood urea','harnstoff','harnstoff-stickstoff', // DE
      'यूरिया','रक्त यूरिया', // HI
      'اليوريا','نيتروجين اليوريا', // AR
      '尿素','血液尿素窒素','혈액요소질소', // ZH/JA/KO
      'ureia','nitrógeno ureico en sangre', // PT/ES
      'urée', // FR
    ],
  },
  // ── CBC ────────────────────────────────────────────────────────────────────
  {
    id: 'hemoglobin', canonical: 'Hemoglobin', category: 'CBC', icon: '🔴',
    stdUnit: 'g/dL', unitGroup: 'hemoglobin',
    ref: { low: 12.0, high: 17.5, optLow: 13.5, optHigh: 16.5 }, // gender adjusted in app
    aliases: [
      'hemoglobin','haemoglobin','hgb','hb','hb (hemoglobin)','total hemoglobin',
      'hämoglobin', // DE
      'हीमोग्लोबिन','हेमोग्लोबिन', // HI
      'الهيموغلوبين','الهيموجلوبين', // AR
      '血红蛋白','ヘモグロビン','헤모글로빈', // ZH/JA/KO
      'hemoglobina', // ES/PT/IT
      'hémoglobine', // FR
      'hemoglobin', // TR
    ],
  },
  {
    id: 'wbc', canonical: 'WBC Count', category: 'CBC', icon: '⚪',
    stdUnit: '×10³/µL', unitGroup: null,
    convFn: { '/cumm': v => v/1000, '/mm³': v => v/1000, 'cells/mm³': v => v/1000, 'cells/µl': v => v/1000 },
    ref: { low: 4.0, high: 11.0, optLow: 5.0, optHigh: 9.0 },
    aliases: [
      'wbc','white blood cell','white blood cell count','wbc count','leukocytes',
      'total wbc','total leukocyte count','tlc','total leucocyte count',
      'leukozyten', // DE
      'श्वेत रक्त कोशिका','डब्ल्यूबीसी','ल्यूकोसाइट', // HI
      'كريات الدم البيضاء','خلايا الدم البيضاء', // AR
      '白细胞','白血球','백혈구', // ZH/JA/KO
      'leucócitos','glóbulos blancos', // PT/ES
      'leucocytes','globules blancs', // FR
    ],
  },
  {
    id: 'rbc', canonical: 'RBC Count', category: 'CBC', icon: '🔴',
    stdUnit: '×10⁶/µL', unitGroup: null,
    convFn: { '/cumm': v => v/1000000, 'million/µl': v => v, 'million/mm³': v => v },
    ref: { low: 4.2, high: 5.9, optLow: 4.5, optHigh: 5.5 },
    aliases: [
      'rbc','red blood cell','red blood cell count','rbc count','erythrocytes',
      'red cell count','total rbc',
      'erythrozyten', // DE
      'लाल रक्त कोशिका','आरबीसी', // HI
      'كريات الدم الحمراء','خلايا الدم الحمراء', // AR
      '红细胞','赤血球','적혈구', // ZH/JA/KO
      'eritrócitos','glóbulos rojos', // PT/ES
      'érythrocytes', // FR
    ],
  },
  {
    id: 'platelets', canonical: 'Platelets', category: 'CBC', icon: '🩸',
    stdUnit: '×10³/µL', unitGroup: null,
    convFn: { '/cumm': v => v/1000, '/mm³': v => v/1000 },
    ref: { low: 150, high: 400, optLow: 180, optHigh: 350 },
    aliases: [
      'platelets','platelet count','plt','thrombocytes','plt count',
      'thrombozyten','blutplättchen', // DE
      'प्लेटलेट','रक्त बिम्बाणु', // HI
      'الصفائح الدموية', // AR
      '血小板','血小板','혈소판', // ZH/JA/KO
      'plaquetas','plaquettes', // ES+PT/FR
    ],
  },
  // ── Thyroid ────────────────────────────────────────────────────────────────
  {
    id: 'tsh', canonical: 'TSH', category: 'Thyroid', icon: '🦋',
    stdUnit: 'µIU/mL', unitGroup: 'tsh',
    ref: { low: 0.4, high: 4.0, optLow: 1.0, optHigh: 2.5 },
    aliases: [
      'tsh','thyroid stimulating hormone','thyrotropin','thyroid-stimulating hormone',
      'thyreoidea-stimulierendes hormon','tsh (thyrotropin)', // DE
      'थायराइड उत्तेजक हार्मोन','टीएसएच', // HI
      'الهرمون المنبه للغدة الدرقية','هرمون تحفيز الغدة الدرقية', // AR
      '促甲状腺激素','甲状腺刺激ホルモン','갑상선자극호르몬', // ZH/JA/KO
      'hormona estimulante de la tiroides', // ES
      'hormone stimulant la thyroïde', // FR
    ],
  },
  {
    id: 't3', canonical: 'T3 (Triiodothyronine)', category: 'Thyroid', icon: '🦋',
    stdUnit: 'ng/dL', unitGroup: null,
    convFn: { 'nmol/l': v => v * 65.1, 'pmol/l': v => v * 0.0651 },
    ref: { low: 80, high: 200, optLow: 100, optHigh: 180 },
    aliases: [
      't3','triiodothyronine','total t3','t3 total','serum t3',
      'trijodthyronin', // DE
      'ट्राईआयोडोथायरोनिन', // HI
      'ثلاثي يودوثيرونين', // AR
      '三碘甲状腺原氨酸','トリヨードチロニン','삼요오드티로닌', // ZH/JA/KO
    ],
  },
  {
    id: 't4', canonical: 'T4 (Thyroxine)', category: 'Thyroid', icon: '🦋',
    stdUnit: 'µg/dL', unitGroup: null,
    convFn: { 'nmol/l': v => v * 0.0777, 'pmol/l': v => v * 0.0000777 },
    ref: { low: 4.5, high: 12.5, optLow: 6.0, optHigh: 11.0 },
    aliases: [
      't4','thyroxine','total t4','t4 total','serum t4','tetraiodothyronine',
      'thyroxin', // DE
      'थायरोक्सिन', // HI
      'هرمون الثيروكسين','ثيروكسين', // AR
      '甲状腺素','チロキシン','티록신', // ZH/JA/KO
    ],
  },
  // ── Vitamins & Minerals ────────────────────────────────────────────────────
  {
    id: 'vitamin_d', canonical: 'Vitamin D (25-OH)', category: 'Vitamins', icon: '☀️',
    stdUnit: 'ng/mL', unitGroup: 'vitamin_d',
    ref: { low: 20, high: 100, optLow: 40, optHigh: 80 },
    aliases: [
      'vitamin d','vit d','25-oh vitamin d','25-hydroxyvitamin d','25(oh)d',
      '25-hydroxycholecalciferol','vitamin d3','25 oh vit d','vit d3',
      'calcidiol','25-oh-d3','25 oh d',
      'vitamin d3 (25-oh)', '25(oh)d3',
      'विटामिन डी', // HI
      'فيتامين د','25 هيدروكسي فيتامين د', // AR
      '维生素d','ビタミンD','비타민d', // ZH/JA/KO
      'vitamina d', // ES/PT/IT
      'vitamine d', // FR
    ],
  },
  {
    id: 'vitamin_b12', canonical: 'Vitamin B12', category: 'Vitamins', icon: '💊',
    stdUnit: 'pg/mL', unitGroup: 'vitamin_b12',
    ref: { low: 200, high: 900, optLow: 400, optHigh: 800 },
    aliases: [
      'vitamin b12','vit b12','b12','cobalamin','cyanocobalamin','methylcobalamin',
      'vitamin b-12','serum b12','serum vitamin b12',
      'विटामिन बी12', // HI
      'فيتامين ب12','كوبالامين', // AR
      '维生素b12','ビタミンB12','비타민b12', // ZH/JA/KO
      'vitamina b12', // ES/PT/IT
      'vitamine b12', // FR
    ],
  },
  {
    id: 'iron', canonical: 'Serum Iron', category: 'Vitamins', icon: '🔩',
    stdUnit: 'µg/dL', unitGroup: 'iron',
    ref: { low: 60, high: 170, optLow: 80, optHigh: 150 },
    aliases: [
      'iron','serum iron','s.iron','fe','iron (serum)','s-fe',
      'eisen','serumeisengehalt', // DE
      'सीरम आयरन','लोहा', // HI
      'الحديد','حديد المصل', // AR
      '血清铁','血清鉄','혈청철', // ZH/JA/KO
      'hierro sérico','ferro sérico', // ES/PT
      'fer sérique', // FR
    ],
  },
  {
    id: 'ferritin', canonical: 'Ferritin', category: 'Vitamins', icon: '🔩',
    stdUnit: 'ng/mL', unitGroup: 'ferritin',
    ref: { low: 12, high: 300, optLow: 50, optHigh: 200 },
    aliases: [
      'ferritin','serum ferritin','s.ferritin','ferritine', // FR
      'ferritin','ferritin (serum)', 'फेरिटिन', // HI
      'فيريتين', // AR
      '铁蛋白','フェリチン','페리틴', // ZH/JA/KO
      'ferritina', // ES/PT/IT
    ],
  },
  // ── Inflammation ───────────────────────────────────────────────────────────
  {
    id: 'crp', canonical: 'CRP (hs)', category: 'Inflammation', icon: '🔥',
    stdUnit: 'mg/L', unitGroup: 'crp',
    ref: { low: 0, high: 3.0, optLow: 0, optHigh: 1.0 },
    aliases: [
      'crp','c-reactive protein','hs-crp','hscrp','high sensitivity crp',
      'high-sensitivity c-reactive protein','hsCRP','c reactive protein',
      'c-reaktives protein','crp (hochsensitiv)', // DE
      'सी-रिएक्टिव प्रोटीन','सीआरपी', // HI
      'البروتين التفاعلي c','bروتين c التفاعلي', // AR
      'c反应蛋白','CRP','C反応性タンパク','c반응성단백', // ZH/JA/KO
      'proteína c reactiva','proteína c-reativa', // ES/PT
      'protéine c réactive', // FR
    ],
  },
  {
    id: 'homocysteine', canonical: 'Homocysteine', category: 'Inflammation', icon: '🔥',
    stdUnit: 'µmol/L', unitGroup: 'homocysteine',
    ref: { low: 0, high: 10, optLow: 0, optHigh: 7 },
    aliases: [
      'homocysteine','homocystéine','hcy','homo cysteine','h-cysteine', // EN/FR
      'homozystein', // DE
      'होमोसिस्टीन', // HI
      'هوموسيستين', // AR
      '同型半胱氨酸','ホモシステイン','호모시스테인', // ZH/JA/KO
      'homocisteina', // ES/PT/IT
    ],
  },
  // ── Hormones ───────────────────────────────────────────────────────────────
  {
    id: 'cortisol', canonical: 'Cortisol', category: 'Hormones', icon: '⚡',
    stdUnit: 'µg/dL', unitGroup: 'cortisol',
    ref: { low: 6, high: 23, optLow: 8, optHigh: 18 }, // morning values
    aliases: [
      'cortisol','serum cortisol','cortisol (am)','morning cortisol','hydrocortisone',
      'kortisol', // DE/TR/ID
      'कोर्टिसोल', // HI
      'الكورتيزول', // AR
      '皮质醇','コルチゾール','코르티솔', // ZH/JA/KO
      'cortisol','cortisol sérique', // ES/FR
    ],
  },
  {
    id: 'testosterone', canonical: 'Testosterone', category: 'Hormones', icon: '💪',
    stdUnit: 'ng/dL', unitGroup: 'testosterone',
    ref: { low: 300, high: 1000, optLow: 500, optHigh: 900 }, // male; female different
    aliases: [
      'testosterone','total testosterone','serum testosterone','testosterone total',
      'testosteron', // DE/TR/ID
      'टेस्टोस्टेरोन', // HI
      'التستوستيرون', // AR
      '睾酮','テストステロン','테스토스테론', // ZH/JA/KO
      'testosterona', // ES/PT/IT
      'testostérone', // FR
    ],
  },
  {
    id: 'insulin', canonical: 'Fasting Insulin', category: 'Hormones', icon: '💉',
    stdUnit: 'µIU/mL', unitGroup: null,
    convFn: { 'pmol/l': v => v / 6.0 },
    ref: { low: 2, high: 25, optLow: 2, optHigh: 8 },
    aliases: [
      'insulin','fasting insulin','serum insulin','insulin fasting','f.insulin',
      'insulin (fasting)','insuline', // FR
      'insulin','पेट का इन्सुलिन','इंसुलिन', // HI
      'الإنسولين','أنسولين', // AR
      '胰岛素','インスリン','인슐린', // ZH/JA/KO
      'insulina', // ES/PT/IT
    ],
  },
]

// ── Normalise a raw biomarker name to canonical form ─────────────────────────
const aliasIndex = new Map()
BIOMARKER_REGISTRY.forEach(b => {
  b.aliases.forEach(a => aliasIndex.set(a.toLowerCase().trim(), b))
})

export function normaliseBiomarkerName(raw) {
  const key = raw.toLowerCase().trim().replace(/\s+/g,' ')
  return aliasIndex.get(key) || aliasIndex.get(key.replace(/[()[\]]/g,'').trim()) || null
}

// ── Convert a value from any unit to the canonical standard unit ──────────────
export function convertToStdUnit(biomarker, value, rawUnit) {
  if (!rawUnit || value === null || value === undefined) return value
  const unit = rawUnit.trim()
  // 1. Custom function override (e.g., HbA1c mmol/mol, or non-linear)
  if (biomarker.convFn) {
    const fn = biomarker.convFn[unit] || biomarker.convFn[unit.toLowerCase()]
    if (fn) return +fn(value).toFixed(3)
  }
  // 2. Unit group lookup
  if (biomarker.unitGroup && UNIT_CONV[biomarker.unitGroup]) {
    const factor = UNIT_CONV[biomarker.unitGroup][unit]
                || UNIT_CONV[biomarker.unitGroup][unit.toLowerCase()]
    if (factor) return +(value * factor).toFixed(3)
  }
  return value // already in standard unit or unrecognised
}

// ── Flag value vs. reference range ───────────────────────────────────────────
export function flagValue(biomarker, stdValue) {
  if (stdValue === null || stdValue === undefined) return 'UNKNOWN'
  const { low, high } = biomarker.ref
  if (stdValue < low)  return 'LOW'
  if (stdValue > high) return 'HIGH'
  return 'NORMAL'
}

// ── Parse a single biomarker row from any lab format ─────────────────────────
// Input: { name: string, value: number|string, unit: string }
// Output: { canonical, category, stdValue, stdUnit, rawUnit, flag, biomarkerId } | null
export function parseBiomarkerRow({ name, value, unit = '' }) {
  const bm = normaliseBiomarkerName(String(name))
  if (!bm) return null
  const numVal = parseFloat(String(value).replace(/,/g, '.'))
  if (isNaN(numVal)) return null
  const stdValue = convertToStdUnit(bm, numVal, unit)
  const flag = flagValue(bm, stdValue)
  return {
    biomarkerId: bm.id,
    canonical:   bm.canonical,
    category:    bm.category,
    icon:        bm.icon,
    stdValue,
    stdUnit:     bm.stdUnit,
    rawValue:    numVal,
    rawUnit:     unit,
    flag,
    ref:         bm.ref,
  }
}

// ── Bulk parse an array of raw rows ──────────────────────────────────────────
export function parseLabReport(rows) {
  const results = []
  const seen = new Set()
  for (const row of rows) {
    const parsed = parseBiomarkerRow(row)
    if (parsed && !seen.has(parsed.biomarkerId)) {
      results.push(parsed)
      seen.add(parsed.biomarkerId)
    }
  }
  return results
}

// ── Extract raw rows from plain text (universal pattern matching) ─────────────
// Supports: "Glucose 95 mg/dL", "Glukose: 5.2 mmol/L", "血糖 5.1 mmol/L" etc.
export function extractRowsFromText(text) {
  const rows = []
  // Pattern: label (optional colon/dash) number (optional comma-decimal) optional unit
  const pattern = /([^\d\n:]+?)\s*[:\-–]?\s*([0-9][0-9.,]*)\s*([a-zA-Zµµ/%×·\^³⁶⁰⁻\s\/]{1,20})?/g
  let m
  while ((m = pattern.exec(text)) !== null) {
    const name = m[1].trim()
    const value = m[2].replace(',', '.')
    const unit  = (m[3] || '').trim()
    if (name.length < 2 || name.length > 60) continue
    rows.push({ name, value, unit })
  }
  return rows
}
