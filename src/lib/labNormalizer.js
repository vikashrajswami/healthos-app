// ── HealthOS Universal Lab Report Normalizer ─────────────────────────────────
// Covers 100+ biomarkers across all major global lab report formats.
// Reference: WHO, IFCC, AACC, ICMR, European lab standards, JA/KO norms.

const UNIT_CONV = {
  glucose:       { 'mmol/l':18.018,'mmol/L':18.018,'mM':18.018,'mg/dl':1,'mg/dL':1 },
  cholesterol:   { 'mmol/l':38.67,'mmol/L':38.67,'mg/dl':1,'mg/dL':1 },
  triglycerides: { 'mmol/l':88.57,'mmol/L':88.57,'mg/dl':1,'mg/dL':1 },
  creatinine:    { 'µmol/l':0.01131,'umol/l':0.01131,'µmol/L':0.01131,'umol/L':0.01131,'mg/dl':1,'mg/dL':1 },
  uric_acid:     { 'µmol/l':0.01681,'umol/l':0.01681,'µmol/L':0.01681,'mg/dl':1,'mg/dL':1 },
  vitamin_d:     { 'nmol/l':0.4006,'nmol/L':0.4006,'ng/ml':1,'ng/mL':1 },
  vitamin_b12:   { 'pmol/l':1.355,'pmol/L':1.355,'pg/ml':1,'pg/mL':1 },
  hemoglobin:    { 'g/l':0.1,'g/L':0.1,'mmol/l':1.6113,'mmol/L':1.6113,'g/dl':1,'g/dL':1 },
  iron:          { 'µmol/l':5.585,'umol/l':5.585,'µmol/L':5.585,'µg/dl':1,'ug/dl':1,'µg/dL':1 },
  ferritin:      { 'µg/l':1,'ug/l':1,'µg/L':1,'ng/ml':1,'ng/mL':1,'pmol/l':0.4424,'pmol/L':0.4424 },
  tsh:           { 'miu/l':1,'mIU/L':1,'µiu/ml':1,'µIU/mL':1,'uiu/ml':1,'mu/l':1,'mU/L':1 },
  cortisol:      { 'nmol/l':0.03625,'nmol/L':0.03625,'µg/dl':1,'ug/dl':1,'µg/dL':1 },
  testosterone:  { 'nmol/l':28.84,'nmol/L':28.84,'ng/ml':100,'ng/dl':1,'ng/dL':1 },
  crp:           { 'mg/dl':10,'mg/dL':10,'µg/ml':1,'µg/mL':1,'mg/l':1,'mg/L':1 },
  homocysteine:  { 'µmol/l':1,'umol/l':1,'µmol/L':1,'mg/l':7.397,'mg/L':7.397 },
  magnesium:     { 'mmol/l':2.43,'mmol/L':2.43,'mEq/l':1.215,'mEq/L':1.215,'mg/dl':1,'mg/dL':1 },
  zinc:          { 'µmol/l':6.54,'umol/l':6.54,'µmol/L':6.54,'µg/dl':1,'ug/dl':1,'µg/dL':1 },
  folate:        { 'nmol/l':0.441,'nmol/L':0.441,'ng/ml':1,'ng/mL':1 },
  ft3:           { 'pmol/l':0.651,'pmol/L':0.651,'pg/ml':1,'pg/mL':1 },
  ft4:           { 'pmol/l':0.0777,'pmol/L':0.0777,'ng/dl':1,'ng/dL':1 },
  pth:           { 'pmol/l':9.43,'pmol/L':9.43,'pg/ml':1,'pg/mL':1 },
  estradiol:     { 'pmol/l':0.272,'pmol/L':0.272,'pg/ml':1,'pg/mL':1 },
  progesterone:  { 'nmol/l':0.314,'nmol/L':0.314,'ng/ml':1,'ng/mL':1 },
  dheas:         { 'µmol/l':36.81,'umol/l':36.81,'µmol/L':36.81,'µg/dl':1,'ug/dl':1,'µg/dL':1 },
  prolactin:     { 'miu/l':0.0476,'mIU/L':0.0476,'µiu/l':0.0476,'ng/ml':1,'ng/mL':1 },
  igf1:          { 'nmol/l':7.65,'nmol/L':7.65,'ng/ml':1,'ng/mL':1 },
  calcium:       { 'mmol/l':4.008,'mmol/L':4.008,'mg/dl':1,'mg/dL':1 },
  phosphorus:    { 'mmol/l':3.097,'mmol/L':3.097,'mg/dl':1,'mg/dL':1 },
  copper:        { 'µmol/l':6.354,'umol/l':6.354,'µmol/L':6.354,'µg/dl':1,'ug/dl':1,'µg/dL':1 },
}

export const BIOMARKER_REGISTRY = [
  // ─── METABOLIC ──────────────────────────────────────────────────────────────
  {
    id:'glucose', canonical:'Glucose', category:'Metabolic', icon:'🩸',
    stdUnit:'mg/dL', unitGroup:'glucose',
    ref:{ low:70, high:99, optLow:75, optHigh:90 },
    aliases:[
      'glucose','blood glucose','fasting glucose','glucose fasting','fasting blood glucose',
      'fasting blood sugar','glucose, fasting','glucose (fasting)','random glucose',
      'glucose random','glucose (random)','blood sugar','fbs','rbs','ppbs','rbs (random)',
      'sugar','serum glucose','plasma glucose','glucose, serum','glucose, plasma',
      'ग्लूकोज','रक्त शर्करा','खाली पेट शर्करा','शुगर',
      'الجلوكوز','سكر الدم','جلوكوز','غلوكوز الصيام',
      'glucosa','glucemia','azucar en sangre','glucosa en ayunas',
      'glycémie','glycémie à jeun','sucre sanguin',
      'blutzucker','nüchternblutzucker','glukose','blutglukose',
      '葡萄糖','血糖','空腹血糖','血葡萄糖',
      'グルコース','血糖値','空腹時血糖',
      '포도당','혈당','공복혈당',
      'глюкоза','сахар крови','глюкоза крови',
      'glicose','glicemia','glicose em jejum',
      'glukoz','kan şekeri','açlık kan şekeri',
      'glukosa','gula darah',
      'குளுக்கோஸ்','இரத்த சர்க்கரை',
      'hb sugar',
    ],
  },
  {
    id:'hba1c', canonical:'HbA1c', category:'Metabolic', icon:'🔴',
    stdUnit:'%', unitGroup:null,
    convFn:{ 'mmol/mol': v => +(v*0.0915+2.15).toFixed(1) },
    ref:{ low:0, high:5.6, optLow:4.5, optHigh:5.4 },
    aliases:[
      'hba1c','glycated hemoglobin','glycosylated hemoglobin','haemoglobin a1c',
      'hemoglobin a1c','hb a1c','a1c','hba 1c','gh','glycohemoglobin',
      'glykohmoglobin','hämoglobin a1c',
      'हीमोग्लोबिन a1c','ग्लाइकेटेड हीमोग्लोबिन',
      'الهيموغلوبين السكري','الهيموجلوبين a1c',
      '糖化血红蛋白','糖化ヘモグロビン','당화혈색소',
      'hemoglobina glicada','hemoglobina a1c',
      'hémoglobine glyquée',
      'hba1c (%)',
    ],
  },
  {
    id:'c_peptide', canonical:'C-Peptide', category:'Metabolic', icon:'💉',
    stdUnit:'ng/mL', unitGroup:null,
    convFn:{ 'nmol/l': v => +(v*3.02).toFixed(2), 'pmol/l': v => +(v*0.00302).toFixed(4) },
    ref:{ low:0.8, high:3.5, optLow:1.0, optHigh:3.0 },
    aliases:[
      'c-peptide','c peptide','connecting peptide','insulin c-peptide',
      'fasting c-peptide','c-peptide, fasting',
      'सी-पेप्टाइड',
      'الببتيد c','ببتيد c',
      'c-péptido','c péptide',
    ],
  },
  {
    id:'fructosamine', canonical:'Fructosamine', category:'Metabolic', icon:'🩸',
    stdUnit:'µmol/L', unitGroup:null,
    ref:{ low:0, high:285, optLow:0, optHigh:270 },
    aliases:[
      'fructosamine','glycated serum protein','gsp','glycated albumin',
      'fructosamina','fructosamine (serum)',
    ],
  },

  // ─── LIPIDS ─────────────────────────────────────────────────────────────────
  {
    id:'cholesterol_total', canonical:'Total Cholesterol', category:'Lipids', icon:'🫀',
    stdUnit:'mg/dL', unitGroup:'cholesterol',
    ref:{ low:0, high:199, optLow:0, optHigh:179 },
    aliases:[
      'total cholesterol','cholesterol total','cholesterol','tc','s-cholesterol',
      'serum cholesterol','cholesterol, total',
      'gesamtcholesterin','cholesterin',
      'कुल कोलेस्ट्रॉल','कोलेस्ट्रॉल',
      'الكوليسترول الكلي','كوليسترول',
      '总胆固醇','胆固醇','総コレステロール','총콜레스테롤',
      'colesterol total','colesterol',
      'cholestérol total',
      'kolesterol total',
    ],
  },
  {
    id:'ldl', canonical:'LDL Cholesterol', category:'Lipids', icon:'🫀',
    stdUnit:'mg/dL', unitGroup:'cholesterol',
    ref:{ low:0, high:99, optLow:0, optHigh:79 },
    aliases:[
      'ldl','ldl cholesterol','ldl-c','ldl-cholesterol','low density lipoprotein',
      'ldl-chol','ldl chol','low-density lipoprotein cholesterol','ldl (calculated)',
      'ldl-cholesterin','ldl cholesterin',
      'एलडीएल कोलेस्ट्रॉल',
      'الكوليسترول الضار','كوليسترول ldl',
      'ldl胆固醇','低密度脂蛋白','悪玉コレステロール','ldl콜레스테롤',
      'colesterol ldl','colesterol mau',
      'cholestérol ldl',
    ],
  },
  {
    id:'hdl', canonical:'HDL Cholesterol', category:'Lipids', icon:'🫀',
    stdUnit:'mg/dL', unitGroup:'cholesterol',
    ref:{ low:40, high:999, optLow:60, optHigh:999 },
    aliases:[
      'hdl','hdl cholesterol','hdl-c','hdl-cholesterol','high density lipoprotein',
      'hdl-chol','high-density lipoprotein cholesterol','good cholesterol',
      'hdl-cholesterin',
      'एचडीएल कोलेस्ट्रॉल','अच्छा कोलेस्ट्रॉल',
      'الكوليسترول الجيد','كوليسترول hdl',
      'hdl胆固醇','高密度脂蛋白','善玉コレステロール','hdl콜레스테롤',
      'colesterol hdl','colesterol bom',
      'cholestérol hdl',
    ],
  },
  {
    id:'triglycerides', canonical:'Triglycerides', category:'Lipids', icon:'🫀',
    stdUnit:'mg/dL', unitGroup:'triglycerides',
    ref:{ low:0, high:149, optLow:0, optHigh:99 },
    aliases:[
      'triglycerides','triglyceride','tg','trigs','serum triglycerides','tgl',
      'triglyceriden','triglyzeride',
      'ट्राइग्लिसराइड',
      'الدهون الثلاثية','ثلاثي الغليسريد',
      '甘油三酯','トリグリセリド','中性脂肪','중성지방',
      'triglicéridos','triglicerídeos',
      'triglycérides',
      'trigliseridi','trigliserit',
    ],
  },
  {
    id:'vldl', canonical:'VLDL Cholesterol', category:'Lipids', icon:'🫀',
    stdUnit:'mg/dL', unitGroup:'cholesterol',
    ref:{ low:0, high:30, optLow:0, optHigh:20 },
    aliases:[
      'vldl','vldl cholesterol','vldl-c','very low density lipoprotein',
      'vldl-chol','vldl (calculated)','vldl cholesterin',
      'vldl胆固醇','超低密度脂蛋白',
    ],
  },
  {
    id:'non_hdl', canonical:'Non-HDL Cholesterol', category:'Lipids', icon:'🫀',
    stdUnit:'mg/dL', unitGroup:'cholesterol',
    ref:{ low:0, high:129, optLow:0, optHigh:109 },
    aliases:[
      'non-hdl cholesterol','non hdl cholesterol','non-hdl','non hdl',
      'non-hdl-c','non hdl-c',
    ],
  },
  {
    id:'apob', canonical:'ApoB', category:'Lipids', icon:'🫀',
    stdUnit:'mg/dL', unitGroup:null,
    convFn:{ 'g/l': v => +(v*100).toFixed(1), 'g/L': v => +(v*100).toFixed(1) },
    ref:{ low:0, high:100, optLow:0, optHigh:80 },
    aliases:[
      'apob','apolipoprotein b','apo b','apo-b','apolipoprotein b-100',
      'apo b100','apolipoprotein b100',
    ],
  },
  {
    id:'apoa1', canonical:'ApoA1', category:'Lipids', icon:'🫀',
    stdUnit:'mg/dL', unitGroup:null,
    convFn:{ 'g/l': v => +(v*100).toFixed(1), 'g/L': v => +(v*100).toFixed(1) },
    ref:{ low:119, high:999, optLow:150, optHigh:999 },
    aliases:[
      'apoa1','apolipoprotein a1','apo a1','apo-a1','apolipoprotein a-1',
      'apo a-1',
    ],
  },
  {
    id:'lpa', canonical:'Lp(a)', category:'Lipids', icon:'🫀',
    stdUnit:'mg/dL', unitGroup:null,
    convFn:{ 'nmol/l': v => +(v*0.4).toFixed(1), 'nmol/L': v => +(v*0.4).toFixed(1) },
    ref:{ low:0, high:30, optLow:0, optHigh:14 },
    aliases:[
      'lp(a)','lipoprotein a','lipoprotein(a)','lpa','lp a',
      'lipoprotéine a','липопротеин а',
    ],
  },

  // ─── LIVER ──────────────────────────────────────────────────────────────────
  {
    id:'alt', canonical:'ALT (SGPT)', category:'Liver', icon:'🫁',
    stdUnit:'U/L', unitGroup:null,
    ref:{ low:0, high:40, optLow:0, optHigh:25 },
    aliases:[
      'alt','sgpt','alanine aminotransferase','alanine transaminase','gpt',
      'alanin aminotransferase','alat','alt (sgpt)','alt/sgpt',
      'एएलटी','एसजीपीटी',
      'ناقلة أمين الألانين',
      '丙氨酸转氨酶','アラニンアミノトランスフェラーゼ','알라닌아미노전이효소',
      'alaninaaminotransferase',
      'alanine aminotransférase',
    ],
  },
  {
    id:'ast', canonical:'AST (SGOT)', category:'Liver', icon:'🫁',
    stdUnit:'U/L', unitGroup:null,
    ref:{ low:0, high:40, optLow:0, optHigh:25 },
    aliases:[
      'ast','sgot','aspartate aminotransferase','aspartate transaminase','got',
      'aspartat aminotransferase','asat','ast (sgot)','ast/sgot',
      'एएसटी','एसजीओटी',
      'ناقلة أمين الأسبارتات',
      '天冬氨酸转氨酶','アスパラギン酸アミノトランスフェラーゼ','아스파르테이트아미노전이효소',
      'aspartato aminotransferase',
      'aspartate aminotransférase',
    ],
  },
  {
    id:'alp', canonical:'ALP', category:'Liver', icon:'🫁',
    stdUnit:'U/L', unitGroup:null,
    ref:{ low:40, high:129, optLow:50, optHigh:100 },
    aliases:[
      'alp','alkaline phosphatase','alk phos','alk phosphatase','ap',
      'alkalische phosphatase',
      'क्षारीय फॉस्फेट',
      'الفوسفاتاز القلوي',
      '碱性磷酸酶','アルカリフォスファターゼ','알칼리포스파타제',
      'fosfatase alcalina',
      'phosphatase alcaline',
    ],
  },
  {
    id:'ggt', canonical:'GGT', category:'Liver', icon:'🫁',
    stdUnit:'U/L', unitGroup:null,
    ref:{ low:0, high:55, optLow:0, optHigh:30 },
    aliases:[
      'ggt','gamma gt','γ-gt','gamma-gt','gamma glutamyl transferase',
      'gammaglutamyltransferase','γgt','gamma-glutamyl transpeptidase','ggtp',
      'γ-glutamyltransferase','gamma glutamyltransferase',
      'γグルタミルトランスフェラーゼ',
      '谷氨酰转肽酶',
    ],
  },
  {
    id:'bilirubin_total', canonical:'Total Bilirubin', category:'Liver', icon:'🫁',
    stdUnit:'mg/dL', unitGroup:null,
    convFn:{ 'µmol/l': v=>+(v*0.05848).toFixed(3), 'umol/l': v=>+(v*0.05848).toFixed(3), 'µmol/L': v=>+(v*0.05848).toFixed(3) },
    ref:{ low:0, high:1.2, optLow:0.1, optHigh:1.0 },
    aliases:[
      'total bilirubin','bilirubin total','bilirubin','t.bili','tbili','t-bili',
      'serum bilirubin','gesamtbilirubin','bilirubin, total',
      'कुल बिलीरुबिन',
      'البيليروبين الكلي',
      '总胆红素','総ビリルビン','총빌리루빈',
      'bilirrubina total',
      'bilirubine totale',
    ],
  },
  {
    id:'bilirubin_direct', canonical:'Bilirubin Direct', category:'Liver', icon:'🫁',
    stdUnit:'mg/dL', unitGroup:null,
    convFn:{ 'µmol/l': v=>+(v*0.05848).toFixed(3), 'umol/l': v=>+(v*0.05848).toFixed(3), 'µmol/L': v=>+(v*0.05848).toFixed(3) },
    ref:{ low:0, high:0.3, optLow:0, optHigh:0.2 },
    aliases:[
      'bilirubin direct','direct bilirubin','direct bili','conjugated bilirubin',
      'bilirubin, direct','bilirubin-direct','d.bili','dbili',
      'direktes bilirubin',
      'प्रत्यक्ष बिलीरुबिन',
      'البيليروبين المباشر',
      '直接胆红素','直接ビリルビン',
    ],
  },
  {
    id:'bilirubin_indirect', canonical:'Bilirubin Indirect', category:'Liver', icon:'🫁',
    stdUnit:'mg/dL', unitGroup:null,
    convFn:{ 'µmol/l': v=>+(v*0.05848).toFixed(3), 'umol/l': v=>+(v*0.05848).toFixed(3), 'µmol/L': v=>+(v*0.05848).toFixed(3) },
    ref:{ low:0, high:0.9, optLow:0, optHigh:0.8 },
    aliases:[
      'bilirubin indirect','indirect bilirubin','unconjugated bilirubin',
      'bilirubin, indirect','bilirubin-indirect','i.bili','ibili',
      'indirekt bilirubin',
      'अप्रत्यक्ष बिलीरुबिन',
      'البيليروبين غير المباشر',
      '间接胆红素','間接ビリルビン',
    ],
  },
  {
    id:'ldh', canonical:'LDH', category:'Liver', icon:'🫁',
    stdUnit:'U/L', unitGroup:null,
    ref:{ low:100, high:250, optLow:120, optHigh:220 },
    aliases:[
      'ldh','lactate dehydrogenase','lactic acid dehydrogenase','lactic dehydrogenase',
      'laktatdehydrogenase',
      'लैक्टेट डिहाइड्रोजनेज',
      'نازعة هيدروجين اللاكتات',
      '乳酸脱水素酵素','유산탈수소효소',
    ],
  },
  {
    id:'total_protein', canonical:'Total Protein', category:'Liver', icon:'🫁',
    stdUnit:'g/dL', unitGroup:null,
    ref:{ low:6.0, high:8.3, optLow:6.5, optHigh:8.0 },
    aliases:[
      'total protein','protein total','serum total protein','s.protein','protein, total',
      'gesamteiweiß','gesamtprotein',
      'कुल प्रोटीन',
      'البروتين الكلي',
      '总蛋白','総タンパク','총단백',
      'proteína total',
      'protéine totale',
    ],
  },
  {
    id:'albumin', canonical:'Albumin', category:'Liver', icon:'🫁',
    stdUnit:'g/dL', unitGroup:null,
    ref:{ low:3.5, high:5.0, optLow:4.0, optHigh:5.0 },
    aliases:[
      'albumin','serum albumin','s.albumin','alb','albumin, serum','albumine',
      'एल्बुमिन',
      'الألبومين',
      '白蛋白','アルブミン','알부민',
      'albúmina',
    ],
  },
  {
    id:'globulin', canonical:'Globulin', category:'Liver', icon:'🫁',
    stdUnit:'g/dL', unitGroup:null,
    ref:{ low:2.0, high:3.5, optLow:2.0, optHigh:3.2 },
    aliases:[
      'globulin','globulins','serum globulin','globulin (calculated)','globulin(calculated)',
      'γ-globulin','gamma globulin',
      'ग्लोबुलिन',
      'الغلوبولين',
      '球蛋白','グロブリン','글로불린',
    ],
  },
  {
    id:'ag_ratio', canonical:'A/G Ratio', category:'Liver', icon:'🫁',
    stdUnit:'', unitGroup:null,
    ref:{ low:1.0, high:2.5, optLow:1.2, optHigh:2.2 },
    aliases:[
      'a/g ratio','ag ratio','albumin globulin ratio','albumin/globulin ratio',
      'a:g ratio','a/g',
      'a/g 比','a/g 비',
    ],
  },

  // ─── KIDNEY ─────────────────────────────────────────────────────────────────
  {
    id:'creatinine', canonical:'Creatinine', category:'Kidney', icon:'🫘',
    stdUnit:'mg/dL', unitGroup:'creatinine',
    ref:{ low:0.6, high:1.2, optLow:0.7, optHigh:1.1 },
    aliases:[
      'creatinine','creatinin','serum creatinine','s.creatinine','s-creatinine','cr','crea',
      'kreatin','kreatinin',
      'क्रिएटिनिन',
      'الكرياتينين',
      '肌酐','クレアチニン','크레아티닌',
      'creatinina',
      'créatinine',
      'creatinine, serum',
    ],
  },
  {
    id:'egfr', canonical:'eGFR', category:'Kidney', icon:'🫘',
    stdUnit:'mL/min/1.73m²', unitGroup:null,
    ref:{ low:60, high:999, optLow:90, optHigh:999 },
    aliases:[
      'egfr','estimated gfr','gfr estimated','estimated glomerular filtration rate','gfr',
      'gfr (estimated)','gfr-mdrd','gfr-ckd-epi','ckd-epi egfr',
      'geschätzte gfr',
      'अनुमानित जीएफआर',
      'معدل الترشيح الكبيبي المقدر',
      '估算肾小球滤过率','推算糸球体濾過量','추정 사구체여과율',
    ],
  },
  {
    id:'uric_acid', canonical:'Uric Acid', category:'Kidney', icon:'🫘',
    stdUnit:'mg/dL', unitGroup:'uric_acid',
    ref:{ low:2.5, high:7.0, optLow:3.0, optHigh:5.5 },
    aliases:[
      'uric acid','urate','serum uric acid','s.uric acid','sua','uric acid, serum',
      'harnsäure',
      'यूरिक एसिड',
      'حمض البوليك',
      '尿酸','요산',
      'ácido úrico',
      'acide urique',
      'acido urico',
      'ürik asit',
    ],
  },
  {
    id:'bun', canonical:'BUN / Urea', category:'Kidney', icon:'🫘',
    stdUnit:'mg/dL', unitGroup:null,
    convFn:{ 'mmol/l': v=>+(v*2.801).toFixed(1), 'mmol/L': v=>+(v*2.801).toFixed(1) },
    ref:{ low:7, high:20, optLow:8, optHigh:18 },
    aliases:[
      'bun','blood urea nitrogen','urea nitrogen','urea','serum urea','s.urea',
      'blood urea','harnstoff','harnstoff-stickstoff','urea (serum)',
      'यूरिया','रक्त यूरिया',
      'اليوريا','نيتروجين اليوريا',
      '尿素','血液尿素窒素','혈액요소질소',
      'ureia','nitrógeno ureico en sangre',
      'urée',
    ],
  },
  {
    id:'cystatin_c', canonical:'Cystatin C', category:'Kidney', icon:'🫘',
    stdUnit:'mg/L', unitGroup:null,
    ref:{ low:0.5, high:1.0, optLow:0.5, optHigh:0.85 },
    aliases:[
      'cystatin c','cystatin-c','cys c','serum cystatin c',
      'cystatine c','cystatín c',
      'सिस्टेटिन सी',
      'سيستاتين c',
    ],
  },
  {
    id:'microalbumin', canonical:'Microalbumin (Urine)', category:'Kidney', icon:'🫘',
    stdUnit:'mg/g', unitGroup:null,
    ref:{ low:0, high:30, optLow:0, optHigh:17 },
    aliases:[
      'microalbumin','microalbuminuria','urine microalbumin','spot urine albumin',
      'albumin creatinine ratio','uacr','urine albumin creatinine ratio',
      'acr (urine)','albumin/creatinine ratio',
      'मायक्रोएल्बुमिन',
      'ميكروألبومين',
    ],
  },
  {
    id:'bun_creatinine_ratio', canonical:'BUN/Creatinine Ratio', category:'Kidney', icon:'🫘',
    stdUnit:'', unitGroup:null,
    ref:{ low:10, high:20, optLow:12, optHigh:18 },
    aliases:[
      'bun/creatinine ratio','bun creatinine ratio','bun:creatinine','urea creatinine ratio',
      'b/c ratio',
    ],
  },

  // ─── CBC ────────────────────────────────────────────────────────────────────
  {
    id:'hemoglobin', canonical:'Hemoglobin', category:'CBC', icon:'🔴',
    stdUnit:'g/dL', unitGroup:'hemoglobin',
    ref:{ low:12.0, high:17.5, optLow:13.5, optHigh:16.5 },
    aliases:[
      'hemoglobin','haemoglobin','hgb','hb','hb (hemoglobin)','total hemoglobin',
      'hämoglobin',
      'हीमोग्लोबिन','हेमोग्लोबिन',
      'الهيموغلوبين','الهيموجلوبين',
      '血红蛋白','ヘモグロビン','헤모글로빈',
      'hemoglobina',
      'hémoglobine',
      'hemoglobin',
    ],
  },
  {
    id:'hematocrit', canonical:'Hematocrit (PCV)', category:'CBC', icon:'🔴',
    stdUnit:'%', unitGroup:null,
    ref:{ low:36, high:52, optLow:38, optHigh:50 },
    aliases:[
      'hematocrit','haematocrit','hct','pcv','packed cell volume','packed cell vol',
      'hämatokrit',
      'हेमाटोक्रिट',
      'الهيماتوكريت','حجم كريات الدم الحمراء المرصوصة',
      '红细胞压积','ヘマトクリット','혈구용적',
    ],
  },
  {
    id:'mcv', canonical:'MCV', category:'CBC', icon:'🔴',
    stdUnit:'fL', unitGroup:null,
    ref:{ low:80, high:100, optLow:82, optHigh:96 },
    aliases:[
      'mcv','mean corpuscular volume','mean cell volume','mean corpuscular vol',
      'mittleres korpuskuläres volumen',
      'एमसीवी',
      'الحجم الكبيبي المتوسط',
      '平均红细胞体积','平均赤血球容積','평균적혈구용적',
    ],
  },
  {
    id:'mch', canonical:'MCH', category:'CBC', icon:'🔴',
    stdUnit:'pg', unitGroup:null,
    ref:{ low:27, high:33, optLow:27.5, optHigh:32 },
    aliases:[
      'mch','mean corpuscular hemoglobin','mean cell hemoglobin','mean corpuscular haemoglobin',
      'एमसीएच',
      'الهيموغلوبين الكبيبي المتوسط',
      '平均红细胞血红蛋白','平均赤血球血色素量','평균적혈구혈색소',
    ],
  },
  {
    id:'mchc', canonical:'MCHC', category:'CBC', icon:'🔴',
    stdUnit:'g/dL', unitGroup:null,
    ref:{ low:32, high:36, optLow:32.5, optHigh:35.5 },
    aliases:[
      'mchc','mean corpuscular hemoglobin concentration','mean cell hemoglobin concentration',
      'एमसीएचसी',
      'تركيز الهيموغلوبين الكبيبي المتوسط',
      '平均红细胞血红蛋白浓度','평균적혈구혈색소농도',
    ],
  },
  {
    id:'rdw', canonical:'RDW', category:'CBC', icon:'🔴',
    stdUnit:'%', unitGroup:null,
    ref:{ low:11.5, high:14.5, optLow:11.5, optHigh:13.5 },
    aliases:[
      'rdw','red cell distribution width','rbc distribution width','rdw-cv','rdw cv',
      'rotierteilchen',
      'एरडीडब्ल्यू',
      'عرض توزيع خلايا الدم الحمراء',
      '红细胞分布宽度','赤血球分布幅','적혈구분포폭',
    ],
  },
  {
    id:'wbc', canonical:'WBC Count', category:'CBC', icon:'⚪',
    stdUnit:'×10³/µL', unitGroup:null,
    convFn:{ '/cumm': v=>v/1000, '/mm³': v=>v/1000, 'cells/mm³': v=>v/1000, 'cells/µl': v=>v/1000, 'cells/µL': v=>v/1000 },
    ref:{ low:4.0, high:11.0, optLow:5.0, optHigh:9.0 },
    aliases:[
      'wbc','white blood cell','white blood cell count','wbc count','leukocytes',
      'total wbc','total leukocyte count','tlc','total leucocyte count','leucocytes count',
      'leukozyten',
      'श्वेत रक्त कोशिका','डब्ल्यूबीसी','ल्यूकोसाइट',
      'كريات الدم البيضاء','خلايا الدم البيضاء',
      '白细胞','白血球','백혈구',
      'leucócitos','glóbulos blancos',
      'leucocytes','globules blancs',
    ],
  },
  {
    id:'rbc', canonical:'RBC Count', category:'CBC', icon:'🔴',
    stdUnit:'×10⁶/µL', unitGroup:null,
    convFn:{ '/cumm': v=>v/1000000, 'million/µl': v=>v, 'million/mm³': v=>v },
    ref:{ low:4.2, high:5.9, optLow:4.5, optHigh:5.5 },
    aliases:[
      'rbc','red blood cell','red blood cell count','rbc count','erythrocytes',
      'red cell count','total rbc',
      'erythrozyten',
      'लाल रक्त कोशिका','आरबीसी',
      'كريات الدم الحمراء','خلايا الدم الحمراء',
      '红细胞','赤血球','적혈구',
      'eritrócitos','glóbulos rojos',
      'érythrocytes',
    ],
  },
  {
    id:'platelets', canonical:'Platelets', category:'CBC', icon:'🩸',
    stdUnit:'×10³/µL', unitGroup:null,
    convFn:{ '/cumm': v=>v/1000, '/mm³': v=>v/1000, 'lakhs/cumm': v=>v*100, 'lakh/cumm': v=>v*100 },
    ref:{ low:150, high:400, optLow:180, optHigh:350 },
    aliases:[
      'platelets','platelet count','plt','thrombocytes','plt count',
      'thrombozyten','blutplättchen',
      'प्लेटलेट','रक्त बिम्बाणु',
      'الصفائح الدموية',
      '血小板','혈소판',
      'plaquetas','plaquettes',
    ],
  },
  {
    id:'neutrophils_pct', canonical:'Neutrophils %', category:'CBC', icon:'⚪',
    stdUnit:'%', unitGroup:null,
    ref:{ low:40, high:75, optLow:45, optHigh:70 },
    aliases:[
      'neutrophils','neutrophil','neutrophils %','neutrophil %','neu %','neut %',
      'neutrophil percentage','polymorphonuclear','pmns','granulocytes',
      'neutrophils (%)','neutrophils%',
      'neutrophile',
      'न्यूट्रोफिल',
      'العدلات',
      '中性粒细胞','好中球','호중구',
    ],
  },
  {
    id:'lymphocytes_pct', canonical:'Lymphocytes %', category:'CBC', icon:'⚪',
    stdUnit:'%', unitGroup:null,
    ref:{ low:20, high:45, optLow:25, optHigh:40 },
    aliases:[
      'lymphocytes','lymphocyte','lymphocytes %','lymphocyte %','lym %','lymph %',
      'lymphocyte percentage','lymphocytes (%)','lymphocytes%',
      'lymphozyten',
      'लिम्फोसाइट',
      'الخلايا الليمفاوية',
      '淋巴细胞','リンパ球','림프구',
    ],
  },
  {
    id:'monocytes_pct', canonical:'Monocytes %', category:'CBC', icon:'⚪',
    stdUnit:'%', unitGroup:null,
    ref:{ low:2, high:10, optLow:3, optHigh:8 },
    aliases:[
      'monocytes','monocyte','monocytes %','monocyte %','mono %',
      'monocyte percentage','monocytes (%)','monocytes%',
      'monozyten',
      'मोनोसाइट',
      'الخلايا الوحيدة',
      '单核细胞','単球','단구',
    ],
  },
  {
    id:'eosinophils_pct', canonical:'Eosinophils %', category:'CBC', icon:'⚪',
    stdUnit:'%', unitGroup:null,
    ref:{ low:1, high:6, optLow:1, optHigh:4 },
    aliases:[
      'eosinophils','eosinophil','eosinophils %','eosinophil %','eos %',
      'eosinophil percentage','eosinophils (%)','eosinophils%',
      'eosinophile',
      'ईोसिनोफिल',
      'الحمضات',
      '嗜酸性粒细胞','好酸球','호산구',
    ],
  },
  {
    id:'basophils_pct', canonical:'Basophils %', category:'CBC', icon:'⚪',
    stdUnit:'%', unitGroup:null,
    ref:{ low:0, high:2, optLow:0, optHigh:1 },
    aliases:[
      'basophils','basophil','basophils %','basophil %','baso %',
      'basophil percentage','basophils (%)','basophils%',
      'basophile',
      'बेसोफिल',
      'الخلايا القاعدية',
      '嗜碱性粒细胞','好塩基球','호염기구',
    ],
  },
  {
    id:'esr', canonical:'ESR', category:'CBC', icon:'⚪',
    stdUnit:'mm/hr', unitGroup:null,
    ref:{ low:0, high:20, optLow:0, optHigh:10 },
    aliases:[
      'esr','erythrocyte sedimentation rate','sed rate','sedimentation rate',
      'blutsenkungsgeschwindigkeit','bsg',
      'एरिथ्रोसाइट अवसादन दर','ईएसआर',
      'معدل ترسب كريات الدم الحمراء',
      '红细胞沉降率','赤血球沈降速度','적혈구침강속도',
      'velocidad de sedimentación globular',
    ],
  },
  {
    id:'reticulocytes', canonical:'Reticulocytes', category:'CBC', icon:'🔴',
    stdUnit:'%', unitGroup:null,
    ref:{ low:0.5, high:2.5, optLow:0.8, optHigh:2.0 },
    aliases:[
      'reticulocytes','reticulocyte count','retic','retic count','reticulocyte %',
      'retikulozyten',
      'रेटिकुलोसाइट',
      'الخلايا الشبكية',
      '网织红细胞','網赤血球','망상적혈구',
    ],
  },

  // ─── COAGULATION ────────────────────────────────────────────────────────────
  {
    id:'pt', canonical:'Prothrombin Time (PT)', category:'Coagulation', icon:'🩹',
    stdUnit:'seconds', unitGroup:null,
    ref:{ low:11, high:13.5, optLow:11.5, optHigh:13.0 },
    aliases:[
      'pt','prothrombin time','pt (seconds)','prothrombin time (pt)',
      'prothrombinzeit',
      'प्रोथ्रोम्बिन समय',
      'زمن البروثرومبين',
      '凝血酶原时间','プロトロンビン時間','프로트롬빈시간',
    ],
  },
  {
    id:'inr', canonical:'INR', category:'Coagulation', icon:'🩹',
    stdUnit:'', unitGroup:null,
    ref:{ low:0.8, high:1.2, optLow:0.9, optHigh:1.1 },
    aliases:[
      'inr','international normalized ratio','pt/inr','inr (pt)',
      'internationale normalisierte ratio',
      'आईएनआर',
      'النسبة المعيارية الدولية',
      '国际标准化比率','国際標準化比','국제정상화비율',
    ],
  },
  {
    id:'aptt', canonical:'aPTT', category:'Coagulation', icon:'🩹',
    stdUnit:'seconds', unitGroup:null,
    ref:{ low:25, high:35, optLow:25, optHigh:33 },
    aliases:[
      'aptt','activated partial thromboplastin time','ptt','partial thromboplastin time',
      'aktivierte partielle thromboplastinzeit',
      'आंशिक थ्रोम्बोप्लास्टिन समय',
      'زمن الثرومبوبلاستين الجزئي',
      '活化部分凝血活酶时间','활성화부분트롬보플라스틴시간',
    ],
  },
  {
    id:'fibrinogen', canonical:'Fibrinogen', category:'Coagulation', icon:'🩹',
    stdUnit:'mg/dL', unitGroup:null,
    convFn:{ 'g/l': v=>+(v*100).toFixed(0), 'g/L': v=>+(v*100).toFixed(0) },
    ref:{ low:200, high:400, optLow:200, optHigh:350 },
    aliases:[
      'fibrinogen','fibrinogen level','plasma fibrinogen',
      'fibrinogène','fibrinogeno',
      'फाइब्रिनोजेन',
      'الفيبرينوجين',
      '纤维蛋白原','フィブリノゲン','피브리노겐',
    ],
  },
  {
    id:'d_dimer', canonical:'D-Dimer', category:'Coagulation', icon:'🩹',
    stdUnit:'µg/mL FEU', unitGroup:null,
    convFn:{ 'ng/ml': v=>+(v/1000).toFixed(3), 'mg/l': v=>+(v/2).toFixed(3) },
    ref:{ low:0, high:0.5, optLow:0, optHigh:0.3 },
    aliases:[
      'd-dimer','d dimer','ddimer','d-dimers','fibrin degradation product',
      'd-dimer (fdp)','d-dimer level',
      'डी-डिमर',
      'ديمر d','دي-دايمر',
      'D二聚体','Dダイマー','D-다이머',
    ],
  },

  // ─── THYROID ────────────────────────────────────────────────────────────────
  {
    id:'tsh', canonical:'TSH', category:'Thyroid', icon:'🦋',
    stdUnit:'µIU/mL', unitGroup:'tsh',
    ref:{ low:0.4, high:4.0, optLow:1.0, optHigh:2.5 },
    aliases:[
      'tsh','thyroid stimulating hormone','thyrotropin','thyroid-stimulating hormone',
      'thyreoidea-stimulierendes hormon','tsh (thyrotropin)',
      'थायराइड उत्तेजक हार्मोन','टीएसएच',
      'الهرمون المنبه للغدة الدرقية','هرمون تحفيز الغدة الدرقية',
      '促甲状腺激素','甲状腺刺激ホルモン','갑상선자극호르몬',
      'hormona estimulante de la tiroides',
      'hormone stimulant la thyroïde',
    ],
  },
  {
    id:'t3', canonical:'T3 (Total)', category:'Thyroid', icon:'🦋',
    stdUnit:'ng/dL', unitGroup:null,
    convFn:{ 'nmol/l': v=>+(v*65.1).toFixed(1), 'nmol/L': v=>+(v*65.1).toFixed(1), 'pmol/l': v=>+(v*0.0651).toFixed(3) },
    ref:{ low:80, high:200, optLow:100, optHigh:180 },
    aliases:[
      't3','triiodothyronine','total t3','t3 total','serum t3','t3 (total)',
      'trijodthyronin',
      'ट्राईआयोडोथायरोनिन',
      'ثلاثي يودوثيرونين',
      '三碘甲状腺原氨酸','トリヨードチロニン','삼요오드티로닌',
    ],
  },
  {
    id:'t4', canonical:'T4 (Total)', category:'Thyroid', icon:'🦋',
    stdUnit:'µg/dL', unitGroup:null,
    convFn:{ 'nmol/l': v=>+(v*0.0777).toFixed(3), 'nmol/L': v=>+(v*0.0777).toFixed(3) },
    ref:{ low:4.5, high:12.5, optLow:6.0, optHigh:11.0 },
    aliases:[
      't4','thyroxine','total t4','t4 total','serum t4','tetraiodothyronine','t4 (total)',
      'thyroxin',
      'थायरोक्सिन',
      'هرمون الثيروكسين','ثيروكسين',
      '甲状腺素','チロキシン','티록신',
    ],
  },
  {
    id:'ft3', canonical:'Free T3 (FT3)', category:'Thyroid', icon:'🦋',
    stdUnit:'pg/mL', unitGroup:'ft3',
    ref:{ low:2.3, high:4.2, optLow:2.5, optHigh:4.0 },
    aliases:[
      'ft3','free t3','free triiodothyronine','t3 free','ftt3',
      'freies t3','freies trijodthyronin',
      'मुक्त टी3',
      'الثلاثي يودوثيرونين الحر',
      '游离三碘甲腺原氨酸','遊離トリヨードチロニン','유리트리요오드티로닌',
    ],
  },
  {
    id:'ft4', canonical:'Free T4 (FT4)', category:'Thyroid', icon:'🦋',
    stdUnit:'ng/dL', unitGroup:'ft4',
    ref:{ low:0.8, high:1.8, optLow:0.9, optHigh:1.7 },
    aliases:[
      'ft4','free t4','free thyroxine','t4 free','ftt4',
      'freies t4','freies thyroxin',
      'मुक्त टी4',
      'الثيروكسين الحر',
      '游离甲状腺素','遊離サイロキシン','유리티록신',
    ],
  },
  {
    id:'anti_tpo', canonical:'Anti-TPO Antibodies', category:'Thyroid', icon:'🦋',
    stdUnit:'IU/mL', unitGroup:null,
    ref:{ low:0, high:34, optLow:0, optHigh:10 },
    aliases:[
      'anti-tpo','anti tpo','thyroid peroxidase antibody','tpo antibody','tpo ab',
      'anti-thyroid peroxidase','microsomal antibody','anti-microsomal antibody',
      'tpo-ak',
      'एंटी-थायरॉइड पेरोक्सीडेज',
      'أجسام مضادة لبيروكسيداز الغدة الدرقية',
    ],
  },
  {
    id:'thyroglobulin_ab', canonical:'Anti-Thyroglobulin Ab', category:'Thyroid', icon:'🦋',
    stdUnit:'IU/mL', unitGroup:null,
    ref:{ low:0, high:115, optLow:0, optHigh:40 },
    aliases:[
      'anti-thyroglobulin','anti thyroglobulin','thyroglobulin antibody','tg ab',
      'tgab','anti-tg','thyroglobulin ab',
    ],
  },

  // ─── VITAMINS & MINERALS ────────────────────────────────────────────────────
  {
    id:'vitamin_d', canonical:'Vitamin D (25-OH)', category:'Vitamins', icon:'☀️',
    stdUnit:'ng/mL', unitGroup:'vitamin_d',
    ref:{ low:20, high:100, optLow:40, optHigh:80 },
    aliases:[
      'vitamin d','vit d','25-oh vitamin d','25-hydroxyvitamin d','25(oh)d',
      '25-hydroxycholecalciferol','vitamin d3','25 oh vit d','vit d3',
      'calcidiol','25-oh-d3','25 oh d','vitamin d3 (25-oh)','25(oh)d3',
      '25 hydroxy vitamin d','vitamin d 25 oh','25-oh-vit d',
      'विटामिन डी',
      'فيتامين د','25 هيدروكسي فيتامين د',
      '维生素d','ビタミンD','비타민d',
      'vitamina d','vitamine d',
    ],
  },
  {
    id:'vitamin_b12', canonical:'Vitamin B12', category:'Vitamins', icon:'💊',
    stdUnit:'pg/mL', unitGroup:'vitamin_b12',
    ref:{ low:200, high:900, optLow:400, optHigh:800 },
    aliases:[
      'vitamin b12','vit b12','b12','cobalamin','cyanocobalamin','methylcobalamin',
      'vitamin b-12','serum b12','serum vitamin b12','vit b-12',
      'विटामिन बी12',
      'فيتامين ب12','كوبالامين',
      '维生素b12','ビタミンB12','비타민b12',
      'vitamina b12','vitamine b12',
    ],
  },
  {
    id:'folate', canonical:'Folate (B9)', category:'Vitamins', icon:'💊',
    stdUnit:'ng/mL', unitGroup:'folate',
    ref:{ low:4.0, high:45, optLow:10, optHigh:45 },
    aliases:[
      'folate','folic acid','vitamin b9','serum folate','red cell folate',
      'folsäure',
      'फोलेट','फोलिक एसिड',
      'حمض الفوليك','فولات',
      '叶酸','葉酸','엽산',
      'acide folique','acido folico',
    ],
  },
  {
    id:'iron', canonical:'Serum Iron', category:'Vitamins', icon:'🔩',
    stdUnit:'µg/dL', unitGroup:'iron',
    ref:{ low:60, high:170, optLow:80, optHigh:150 },
    aliases:[
      'iron','serum iron','s.iron','fe','iron (serum)','s-fe','serum fe',
      'eisen','serumeisengehalt',
      'सीरम आयरन','लोहा',
      'الحديد','حديد المصل',
      '血清铁','血清鉄','혈청철',
      'hierro sérico','ferro sérico',
      'fer sérique',
    ],
  },
  {
    id:'tibc', canonical:'TIBC', category:'Vitamins', icon:'🔩',
    stdUnit:'µg/dL', unitGroup:null,
    convFn:{ 'µmol/l': v=>+(v*5.585).toFixed(1), 'umol/l': v=>+(v*5.585).toFixed(1), 'µmol/L': v=>+(v*5.585).toFixed(1) },
    ref:{ low:250, high:370, optLow:270, optHigh:350 },
    aliases:[
      'tibc','total iron binding capacity','t.i.b.c','iron binding capacity',
      'totale eisenbindungskapazität',
      'कुल आयरन बाइंडिंग क्षमता',
      'طاقة ربط الحديد الكلية',
      '总铁结合力','総鉄結合能','총철결합능',
    ],
  },
  {
    id:'transferrin_saturation', canonical:'Transferrin Saturation', category:'Vitamins', icon:'🔩',
    stdUnit:'%', unitGroup:null,
    ref:{ low:20, high:50, optLow:25, optHigh:45 },
    aliases:[
      'transferrin saturation','transferrin sat','iron saturation','% saturation',
      'percent saturation','serum transferrin saturation',
      'ट्रांसफेरिन संतृप्ति',
      'تشبع الترانسفيرين',
    ],
  },
  {
    id:'ferritin', canonical:'Ferritin', category:'Vitamins', icon:'🔩',
    stdUnit:'ng/mL', unitGroup:'ferritin',
    ref:{ low:12, high:300, optLow:50, optHigh:200 },
    aliases:[
      'ferritin','serum ferritin','s.ferritin','ferritine','ferritin (serum)',
      'फेरिटिन',
      'فيريتين',
      '铁蛋白','フェリチン','페리틴',
      'ferritina',
    ],
  },
  {
    id:'magnesium', canonical:'Magnesium', category:'Vitamins', icon:'⚗️',
    stdUnit:'mg/dL', unitGroup:'magnesium',
    ref:{ low:1.7, high:2.5, optLow:1.9, optHigh:2.3 },
    aliases:[
      'magnesium','serum magnesium','mg','mg2+','magnesium, serum',
      'magnesium (serum)','s.magnesium',
      'magnesium','मैग्नीशियम',
      'المغنيسيوم',
      '镁','マグネシウム','마그네슘',
      'magnésio','magnesio',
    ],
  },
  {
    id:'zinc', canonical:'Zinc', category:'Vitamins', icon:'⚗️',
    stdUnit:'µg/dL', unitGroup:'zinc',
    ref:{ low:70, high:120, optLow:80, optHigh:110 },
    aliases:[
      'zinc','serum zinc','zn','zinc (serum)','s.zinc',
      'zink',
      'जिंक',
      'الزنك',
      '锌','亜鉛','아연',
      'zinco',
    ],
  },
  {
    id:'copper', canonical:'Copper', category:'Vitamins', icon:'⚗️',
    stdUnit:'µg/dL', unitGroup:'copper',
    ref:{ low:70, high:140, optLow:80, optHigh:130 },
    aliases:[
      'copper','serum copper','cu','copper (serum)',
      'kupfer',
      'तांबा',
      'النحاس',
      '铜','銅','구리',
      'cobre','cuivre',
    ],
  },
  {
    id:'selenium', canonical:'Selenium', category:'Vitamins', icon:'⚗️',
    stdUnit:'µg/L', unitGroup:null,
    convFn:{ 'µmol/l': v=>+(v*78.96).toFixed(1), 'umol/l': v=>+(v*78.96).toFixed(1), 'µmol/L': v=>+(v*78.96).toFixed(1) },
    ref:{ low:70, high:150, optLow:90, optHigh:130 },
    aliases:[
      'selenium','serum selenium','se',
      'selen',
      'सेलेनियम',
      'السيلينيوم',
      '硒','セレン','셀레늄',
    ],
  },

  // ─── ELECTROLYTES ───────────────────────────────────────────────────────────
  {
    id:'sodium', canonical:'Sodium', category:'Electrolytes', icon:'⚗️',
    stdUnit:'mEq/L', unitGroup:null,
    ref:{ low:136, high:145, optLow:138, optHigh:143 },
    aliases:[
      'sodium','serum sodium','s.sodium','na','na+','sodium, serum',
      'natrium',
      'सोडियम',
      'الصوديوم',
      '钠','ナトリウム','나트륨',
      'sodio',
      'sodium sérique',
    ],
  },
  {
    id:'potassium', canonical:'Potassium', category:'Electrolytes', icon:'⚗️',
    stdUnit:'mEq/L', unitGroup:null,
    ref:{ low:3.5, high:5.1, optLow:3.8, optHigh:4.8 },
    aliases:[
      'potassium','serum potassium','s.potassium','k','k+','potassium, serum',
      'kalium',
      'पोटेशियम',
      'البوتاسيوم',
      '钾','カリウム','칼륨',
      'potasio','potássio',
    ],
  },
  {
    id:'chloride', canonical:'Chloride', category:'Electrolytes', icon:'⚗️',
    stdUnit:'mEq/L', unitGroup:null,
    ref:{ low:98, high:107, optLow:100, optHigh:106 },
    aliases:[
      'chloride','serum chloride','s.chloride','cl','cl-','chloride, serum',
      'chlorid',
      'क्लोराइड',
      'الكلوريد',
      '氯','塩化物','염화물',
      'cloruro','cloreto',
    ],
  },
  {
    id:'calcium', canonical:'Calcium', category:'Electrolytes', icon:'⚗️',
    stdUnit:'mg/dL', unitGroup:'calcium',
    ref:{ low:8.5, high:10.5, optLow:9.0, optHigh:10.0 },
    aliases:[
      'calcium','serum calcium','s.calcium','ca','ca2+','calcium total','calcium, total',
      'total calcium','calcium (total)','ionized calcium',
      'kalzium',
      'कैल्शियम',
      'الكالسيوم',
      '钙','カルシウム','칼슘',
      'calcio',
    ],
  },
  {
    id:'phosphorus', canonical:'Phosphorus', category:'Electrolytes', icon:'⚗️',
    stdUnit:'mg/dL', unitGroup:'phosphorus',
    ref:{ low:2.5, high:4.5, optLow:2.8, optHigh:4.2 },
    aliases:[
      'phosphorus','phosphate','inorganic phosphorus','serum phosphorus','phosphorus, serum',
      'serum phosphate','phosphate, serum','s.phosphorus','s.phosphate',
      'phosphor','phosphat',
      'फास्फोरस',
      'الفوسفور',
      '磷','リン','인',
      'fósforo','phosphore',
    ],
  },
  {
    id:'bicarbonate', canonical:'Bicarbonate (CO2)', category:'Electrolytes', icon:'⚗️',
    stdUnit:'mEq/L', unitGroup:null,
    ref:{ low:22, high:29, optLow:23, optHigh:28 },
    aliases:[
      'bicarbonate','hco3','co2','carbon dioxide','total co2','bicarbonate (serum)',
      'bikarbonat',
      'बाइकार्बोनेट',
      'البيكربونات',
      '碳酸氢盐','重炭酸塩','중탄산염',
    ],
  },

  // ─── INFLAMMATION ───────────────────────────────────────────────────────────
  {
    id:'crp', canonical:'CRP (hs)', category:'Inflammation', icon:'🔥',
    stdUnit:'mg/L', unitGroup:'crp',
    ref:{ low:0, high:3.0, optLow:0, optHigh:1.0 },
    aliases:[
      'crp','c-reactive protein','hs-crp','hscrp','high sensitivity crp',
      'high-sensitivity c-reactive protein','hsCRP','c reactive protein',
      'c-reaktives protein','crp (hochsensitiv)',
      'सी-रिएक्टिव प्रोटीन','सीआरपी',
      'البروتين التفاعلي c',
      'c反应蛋白','C反応性タンパク','c반응성단백',
      'proteína c reactiva','proteína c-reativa',
      'protéine c réactive',
    ],
  },
  {
    id:'homocysteine', canonical:'Homocysteine', category:'Inflammation', icon:'🔥',
    stdUnit:'µmol/L', unitGroup:'homocysteine',
    ref:{ low:0, high:10, optLow:0, optHigh:7 },
    aliases:[
      'homocysteine','homocystéine','hcy','homo cysteine','h-cysteine',
      'homozystein',
      'होमोसिस्टीन',
      'هوموسيستين',
      '同型半胱氨酸','ホモシステイン','호모시스테인',
      'homocisteina',
    ],
  },
  {
    id:'il6', canonical:'IL-6 (Interleukin-6)', category:'Inflammation', icon:'🔥',
    stdUnit:'pg/mL', unitGroup:null,
    ref:{ low:0, high:7, optLow:0, optHigh:3 },
    aliases:[
      'il-6','il6','interleukin-6','interleukin 6','il 6',
      'इंटरल्यूकिन-6',
      'إنترلوكين 6',
      '白细胞介素-6','インターロイキン6','인터루킨-6',
    ],
  },
  {
    id:'procalcitonin', canonical:'Procalcitonin', category:'Inflammation', icon:'🔥',
    stdUnit:'ng/mL', unitGroup:null,
    ref:{ low:0, high:0.5, optLow:0, optHigh:0.1 },
    aliases:[
      'procalcitonin','pct','procalcitonin (pct)',
      'प्रोकैल्सीटोनिन',
      'البروكالسيتونين',
      '降钙素原','プロカルシトニン','프로칼시토닌',
    ],
  },

  // ─── CARDIAC ────────────────────────────────────────────────────────────────
  {
    id:'troponin', canonical:'Troponin I/T', category:'Cardiac', icon:'🫀',
    stdUnit:'ng/mL', unitGroup:null,
    ref:{ low:0, high:0.04, optLow:0, optHigh:0.01 },
    aliases:[
      'troponin','troponin i','troponin t','cardiac troponin','hs-troponin',
      'high sensitivity troponin','troponin i (hs)','troponin t (hs)',
      'troponin (hs)',
      'ट्रोपोनिन',
      'التروبونين',
      '肌钙蛋白','トロポニン','트로포닌',
    ],
  },
  {
    id:'bnp', canonical:'BNP / NT-proBNP', category:'Cardiac', icon:'🫀',
    stdUnit:'pg/mL', unitGroup:null,
    ref:{ low:0, high:100, optLow:0, optHigh:50 },
    aliases:[
      'bnp','brain natriuretic peptide','b-type natriuretic peptide',
      'nt-probnp','nt probnp','n-terminal probnp',
      'बीएनपी',
      'الببتيد الناتريوريتيكي الدماغي',
      '脑钠肽','BNP','뇌나트륨이뇨펩타이드',
    ],
  },
  {
    id:'ck', canonical:'Creatine Kinase (CK)', category:'Cardiac', icon:'🫀',
    stdUnit:'U/L', unitGroup:null,
    ref:{ low:30, high:200, optLow:40, optHigh:170 },
    aliases:[
      'ck','creatine kinase','creatinine kinase','cpk','creatine phosphokinase',
      'total ck','total cpk',
      'kreatin-kinase',
      'क्रिएटिन काइनेज',
      'كيناز الكرياتين',
      '肌酸激酶','クレアチンキナーゼ','크레아틴키나제',
    ],
  },
  {
    id:'ck_mb', canonical:'CK-MB', category:'Cardiac', icon:'🫀',
    stdUnit:'U/L', unitGroup:null,
    ref:{ low:0, high:25, optLow:0, optHigh:16 },
    aliases:[
      'ck-mb','ck mb','ckmb','creatine kinase mb','cpk-mb','creatine kinase-mb',
      'क्रिएटिन काइनेज-एमबी',
      'كيناز الكرياتين mb',
    ],
  },

  // ─── HORMONES ───────────────────────────────────────────────────────────────
  {
    id:'cortisol', canonical:'Cortisol', category:'Hormones', icon:'⚡',
    stdUnit:'µg/dL', unitGroup:'cortisol',
    ref:{ low:6, high:23, optLow:8, optHigh:18 },
    aliases:[
      'cortisol','serum cortisol','cortisol (am)','morning cortisol','hydrocortisone',
      'kortisol',
      'कोर्टिसोल',
      'الكورتيزول',
      '皮质醇','コルチゾール','코르티솔',
      'cortisol sérique',
    ],
  },
  {
    id:'testosterone', canonical:'Testosterone', category:'Hormones', icon:'💪',
    stdUnit:'ng/dL', unitGroup:'testosterone',
    ref:{ low:300, high:1000, optLow:500, optHigh:900 },
    aliases:[
      'testosterone','total testosterone','serum testosterone','testosterone total',
      'testosteron',
      'टेस्टोस्टेरोन',
      'التستوستيرون',
      '睾酮','テストステロン','테스토스테론',
      'testosterona','testostérone',
    ],
  },
  {
    id:'free_testosterone', canonical:'Free Testosterone', category:'Hormones', icon:'💪',
    stdUnit:'pg/mL', unitGroup:null,
    ref:{ low:9, high:30, optLow:12, optHigh:28 },
    aliases:[
      'free testosterone','free testosteron','ft','free test',
      'testosterone free','testosterone, free',
      'मुक्त टेस्टोस्टेरोन',
      'التستوستيرون الحر',
    ],
  },
  {
    id:'shbg', canonical:'SHBG', category:'Hormones', icon:'💪',
    stdUnit:'nmol/L', unitGroup:null,
    ref:{ low:10, high:57, optLow:15, optHigh:50 },
    aliases:[
      'shbg','sex hormone binding globulin','sex-hormone binding globulin',
      'globuline liant les hormones sexuelles',
      'एसएचबीजी',
      'الغلوبولين المرتبط بالهرمونات الجنسية',
      '性激素结合球蛋白','性ホルモン結合グロブリン','성호르몬결합글로불린',
    ],
  },
  {
    id:'dheas', canonical:'DHEA-S', category:'Hormones', icon:'⚡',
    stdUnit:'µg/dL', unitGroup:'dheas',
    ref:{ low:70, high:400, optLow:100, optHigh:350 },
    aliases:[
      'dhea-s','dheas','dhea sulfate','dehydroepiandrosterone sulfate',
      'dehydroepiandrosteron-sulfat',
      'डीएचईए-एस',
      'كبريتات ديهيدروإيبيانندروستيرون',
      '硫酸脱氢表雄酮','DHEA-S','디에이치이에이에스',
    ],
  },
  {
    id:'estradiol', canonical:'Estradiol (E2)', category:'Hormones', icon:'💜',
    stdUnit:'pg/mL', unitGroup:'estradiol',
    ref:{ low:15, high:350, optLow:30, optHigh:300 },
    aliases:[
      'estradiol','oestradiol','e2','17beta-estradiol','17-beta estradiol',
      'serum estradiol','estradiol (e2)',
      'östradiol',
      'एस्ट्राडियोल',
      'الإستراديول',
      '雌二醇','エストラジオール','에스트라디올',
      'estradiol','œstradiol',
    ],
  },
  {
    id:'progesterone', canonical:'Progesterone', category:'Hormones', icon:'💜',
    stdUnit:'ng/mL', unitGroup:'progesterone',
    ref:{ low:0.1, high:25, optLow:1.0, optHigh:20 },
    aliases:[
      'progesterone','serum progesterone','progestérone',
      'progesteron',
      'प्रोजेस्टेरोन',
      'البروجستيرون',
      '孕酮','プロゲステロン','프로게스테론',
      'progesterona',
    ],
  },
  {
    id:'lh', canonical:'LH', category:'Hormones', icon:'💜',
    stdUnit:'IU/L', unitGroup:null,
    ref:{ low:1.7, high:8.6, optLow:2.0, optHigh:7.0 },
    aliases:[
      'lh','luteinizing hormone','luteinising hormone','lh (luteinizing hormone)',
      'lutropin',
      'luteinisierendes hormon',
      'ल्यूटिनाइजिंग हार्मोन',
      'الهرمون اللوتيني',
      '促黄体素','黄体形成ホルモン','황체형성호르몬',
    ],
  },
  {
    id:'fsh', canonical:'FSH', category:'Hormones', icon:'💜',
    stdUnit:'IU/L', unitGroup:null,
    ref:{ low:1.5, high:12.4, optLow:2.0, optHigh:10.0 },
    aliases:[
      'fsh','follicle stimulating hormone','follicle-stimulating hormone',
      'fsh (follicle stimulating hormone)',
      'follikelstimulierendes hormon',
      'फॉलिकल स्टिम्युलेटिंग हार्मोन',
      'الهرمون المحفز للجريب',
      '促卵泡素','卵胞刺激ホルモン','난포자극호르몬',
    ],
  },
  {
    id:'prolactin', canonical:'Prolactin', category:'Hormones', icon:'💜',
    stdUnit:'ng/mL', unitGroup:'prolactin',
    ref:{ low:2, high:29, optLow:3, optHigh:25 },
    aliases:[
      'prolactin','serum prolactin','prl','prolactin level',
      'prolaktin',
      'प्रोलैक्टिन',
      'البرولاكتين',
      '催乳素','プロラクチン','프로락틴',
    ],
  },
  {
    id:'igf1', canonical:'IGF-1', category:'Hormones', icon:'⚡',
    stdUnit:'ng/mL', unitGroup:'igf1',
    ref:{ low:100, high:300, optLow:120, optHigh:280 },
    aliases:[
      'igf-1','igf1','insulin-like growth factor 1','insulin-like growth factor-1',
      'somatomedin c','igf 1',
      'इंसुलिन जैसा वृद्धि कारक 1',
      'عامل النمو الشبيه بالإنسولين 1',
      '胰岛素样生长因子-1','IGF-1','인슐린유사성장인자1',
    ],
  },
  {
    id:'insulin', canonical:'Fasting Insulin', category:'Hormones', icon:'💉',
    stdUnit:'µIU/mL', unitGroup:null,
    convFn:{ 'pmol/l': v=>+(v/6.0).toFixed(2), 'pmol/L': v=>+(v/6.0).toFixed(2) },
    ref:{ low:2, high:25, optLow:2, optHigh:8 },
    aliases:[
      'insulin','fasting insulin','serum insulin','insulin fasting','f.insulin',
      'insulin (fasting)','insuline',
      'पेट का इन्सुलिन','इंसुलिन',
      'الإنسولين','أنسولين',
      '胰岛素','インスリン','인슐린',
      'insulina',
    ],
  },
  {
    id:'pth', canonical:'PTH (Parathyroid Hormone)', category:'Hormones', icon:'⚡',
    stdUnit:'pg/mL', unitGroup:'pth',
    ref:{ low:15, high:65, optLow:20, optHigh:55 },
    aliases:[
      'pth','parathyroid hormone','intact pth','ipth','parathormone',
      'parathormon',
      'पैराथायरॉइड हार्मोन',
      'هرمون الغدة الجار درقية',
      '甲状旁腺激素','副甲状腺ホルモン','부갑상선호르몬',
    ],
  },

  // ─── CANCER MARKERS ─────────────────────────────────────────────────────────
  {
    id:'psa', canonical:'PSA (Total)', category:'Cancer Markers', icon:'🔬',
    stdUnit:'ng/mL', unitGroup:null,
    ref:{ low:0, high:4.0, optLow:0, optHigh:2.5 },
    aliases:[
      'psa','prostate specific antigen','total psa','t-psa','psa total',
      'prostata-spezifisches antigen',
      'पीएसए',
      'المستضد البروستاتي النوعي',
      '前列腺特异性抗原','PSA','전립선특이항원',
    ],
  },
  {
    id:'cea', canonical:'CEA', category:'Cancer Markers', icon:'🔬',
    stdUnit:'ng/mL', unitGroup:null,
    ref:{ low:0, high:5.0, optLow:0, optHigh:2.5 },
    aliases:[
      'cea','carcinoembryonic antigen','carcino-embryonic antigen',
      'कार्सिनोएम्ब्रायोनिक एंटीजन',
      'المستضد السرطاني الجنيني',
      '癌胚抗原','がん胎児性抗原','암배아항원',
    ],
  },
  {
    id:'afp', canonical:'AFP (Alpha-Fetoprotein)', category:'Cancer Markers', icon:'🔬',
    stdUnit:'ng/mL', unitGroup:null,
    ref:{ low:0, high:10, optLow:0, optHigh:5 },
    aliases:[
      'afp','alpha-fetoprotein','alpha fetoprotein','alpha feto protein',
      'alfafetoprotein',
      'अल्फा-फेटोप्रोटीन',
      'بروتين ألفا الجنيني',
      '甲胎蛋白','α-フェトプロテイン','알파태아단백',
    ],
  },
  {
    id:'ca125', canonical:'CA-125', category:'Cancer Markers', icon:'🔬',
    stdUnit:'U/mL', unitGroup:null,
    ref:{ low:0, high:35, optLow:0, optHigh:20 },
    aliases:[
      'ca-125','ca125','cancer antigen 125','ca 125',
      'ca-125 (ovarian)',
      'سرطان الأنتيجين 125',
      '癌抗原125','CA-125','암항원125',
    ],
  },
  {
    id:'ca199', canonical:'CA 19-9', category:'Cancer Markers', icon:'🔬',
    stdUnit:'U/mL', unitGroup:null,
    ref:{ low:0, high:37, optLow:0, optHigh:20 },
    aliases:[
      'ca 19-9','ca19-9','ca199','cancer antigen 19-9','carbohydrate antigen 19-9',
      '癌抗原19-9','CA19-9','암항원19-9',
    ],
  },
  {
    id:'ca153', canonical:'CA 15-3', category:'Cancer Markers', icon:'🔬',
    stdUnit:'U/mL', unitGroup:null,
    ref:{ low:0, high:30, optLow:0, optHigh:20 },
    aliases:[
      'ca 15-3','ca15-3','ca153','cancer antigen 15-3',
      '癌抗原15-3','CA15-3','암항원15-3',
    ],
  },

  // ─── PANCREAS ───────────────────────────────────────────────────────────────
  {
    id:'amylase', canonical:'Amylase', category:'Pancreas', icon:'🫁',
    stdUnit:'U/L', unitGroup:null,
    ref:{ low:30, high:110, optLow:40, optHigh:100 },
    aliases:[
      'amylase','serum amylase','amylase (serum)','total amylase',
      'amylase sérique',
      'एमाइलेज',
      'الأميلاز',
      '淀粉酶','アミラーゼ','아밀라아제',
    ],
  },
  {
    id:'lipase', canonical:'Lipase', category:'Pancreas', icon:'🫁',
    stdUnit:'U/L', unitGroup:null,
    ref:{ low:7, high:60, optLow:10, optHigh:55 },
    aliases:[
      'lipase','serum lipase','lipase (serum)',
      'lipase sérique',
      'लाइपेज',
      'الليباز',
      '脂肪酶','リパーゼ','리파아제',
    ],
  },

  // ─── BONE HEALTH ────────────────────────────────────────────────────────────
  {
    id:'osteocalcin', canonical:'Osteocalcin', category:'Bone', icon:'🦴',
    stdUnit:'ng/mL', unitGroup:null,
    ref:{ low:11, high:46, optLow:15, optHigh:40 },
    aliases:[
      'osteocalcin','bone gla protein','bgp','serum osteocalcin',
      'osteocalcine',
      'ओस्टियोकेल्सिन',
      'أوستيوكالسين',
      '骨钙素','オステオカルシン','오스테오칼신',
    ],
  },

  // ─── AUTOIMMUNE ─────────────────────────────────────────────────────────────
  {
    id:'ana', canonical:'ANA', category:'Autoimmune', icon:'🧬',
    stdUnit:'titer', unitGroup:null,
    ref:{ low:0, high:0, optLow:0, optHigh:0 },
    aliases:[
      'ana','antinuclear antibody','antinuclear antibodies','anti-nuclear antibody',
      'ana titer','ana screen',
      'एएनए',
      'الأجسام المضادة للنواة',
    ],
  },
  {
    id:'rheumatoid_factor', canonical:'Rheumatoid Factor (RF)', category:'Autoimmune', icon:'🧬',
    stdUnit:'IU/mL', unitGroup:null,
    ref:{ low:0, high:14, optLow:0, optHigh:8 },
    aliases:[
      'rheumatoid factor','rf','reumatoid factor','rf (rheumatoid factor)',
      'rheumafaktor',
      'रुमेटोइड फैक्टर',
      'عامل الروماتويد',
      '类风湿因子','リウマトイド因子','류마티스인자',
    ],
  },
  {
    id:'anti_ccp', canonical:'Anti-CCP', category:'Autoimmune', icon:'🧬',
    stdUnit:'U/mL', unitGroup:null,
    ref:{ low:0, high:20, optLow:0, optHigh:10 },
    aliases:[
      'anti-ccp','anti ccp','anti-cyclic citrullinated peptide',
      'cyclic citrullinated peptide antibody','ccp antibody',
      'एंटी-सीसीपी',
      'أجسام مضادة للببتيد السيتروليني',
    ],
  },

  // ─── URIC ACID / GOUT ───────────────────────────────────────────────────────
  // Already covered under Kidney above.

  // ─── LIVER (extended) ───────────────────────────────────────────────────────
  // bilirubin fractions already above; add missing ones below.
]

// ── Normalise a raw biomarker name to canonical form ─────────────────────────
const aliasIndex = new Map()
BIOMARKER_REGISTRY.forEach(b => {
  b.aliases.forEach(a => aliasIndex.set(a.toLowerCase().trim(), b))
})

export function normaliseBiomarkerName(raw) {
  const key = raw.toLowerCase().trim().replace(/\s+/g, ' ')

  let hit = aliasIndex.get(key)
  if (hit) return hit

  // Strip brackets: "alt (sgpt)" → "alt sgpt"
  const noParens = key.replace(/[()[\]]/g, '').replace(/\s+/g, ' ').trim()
  hit = aliasIndex.get(noParens)
  if (hit) return hit

  // Before parenthetical: "alt (sgpt)" → "alt"
  const beforeParen = key.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim()
  if (beforeParen !== key && beforeParen.length >= 2) {
    hit = aliasIndex.get(beforeParen)
    if (hit) return hit
  }

  // Inside parenthetical: "alt (sgpt)" → "sgpt"
  const parenMatch = key.match(/\(([^)]+)\)/)
  if (parenMatch) {
    hit = aliasIndex.get(parenMatch[1].trim())
    if (hit) return hit
  }

  // Comma splits: "creatinine, serum" → try whole without comma, then each segment
  if (key.includes(',')) {
    const noComma = key.replace(/,/g, ' ').replace(/\s+/g, ' ').trim()
    hit = aliasIndex.get(noComma)
    if (hit) return hit
    for (const seg of key.split(',').map(s => s.trim())) {
      if (seg.length >= 2) {
        hit = aliasIndex.get(seg)
        if (hit) return hit
      }
    }
  }

  // Slash splits: "ast/sgot" → try "ast", "sgot"
  if (key.includes('/')) {
    for (const seg of key.split('/').map(s => s.trim())) {
      if (seg.length >= 2) {
        hit = aliasIndex.get(seg)
        if (hit) return hit
      }
    }
  }

  // Strip trailing units/qualifiers: "sodium meq/l" → "sodium"
  const noTrail = key.replace(/\s+(mg\/dl|mmol\/l|u\/l|g\/dl|iu\/l|ng\/ml|pg\/ml|meq\/l|µg\/dl|ug\/dl|%|mm\/hr|fl|pg|seconds|titer)$/, '').trim()
  if (noTrail !== key && noTrail.length >= 2) {
    hit = aliasIndex.get(noTrail)
    if (hit) return hit
  }

  return null
}

// ── Convert a value from any unit to the canonical standard unit ──────────────
export function convertToStdUnit(biomarker, value, rawUnit) {
  if (!rawUnit || value === null || value === undefined) return value
  const unit = rawUnit.trim()
  if (biomarker.convFn) {
    const fn = biomarker.convFn[unit] || biomarker.convFn[unit.toLowerCase()]
    if (fn) return +fn(value).toFixed(3)
  }
  if (biomarker.unitGroup && UNIT_CONV[biomarker.unitGroup]) {
    const factor = UNIT_CONV[biomarker.unitGroup][unit]
                || UNIT_CONV[biomarker.unitGroup][unit.toLowerCase()]
    if (factor) return +(value * factor).toFixed(3)
  }
  return value
}

// ── Flag value vs. reference range ───────────────────────────────────────────
export function flagValue(biomarker, stdValue) {
  if (stdValue === null || stdValue === undefined) return 'UNKNOWN'
  const { low, high } = biomarker.ref
  // Qualitative markers (ANA) — no numeric ref
  if (low === 0 && high === 0) return 'NORMAL'
  if (stdValue < low)  return 'LOW'
  if (stdValue > high) return 'HIGH'
  return 'NORMAL'
}

// ── Parse a single biomarker row ──────────────────────────────────────────────
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

// ── Extract raw rows from plain text ─────────────────────────────────────────
export function extractRowsFromText(text) {
  const seen = new Set()
  const rows = []

  function addRow(name, value, unit) {
    name = (name || '').trim()
    if (name.length < 2 || name.length > 80) return
    const key = name.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    rows.push({ name, value: String(value).replace(',', '.'), unit: (unit || '').trim() })
  }

  // Pass 1: line-by-line — handles HbA1c, T3, T4, B12, names with embedded digits
  for (const line of text.split('\n')) {
    const tok = line.trim().split(/\s+/)
    if (tok.length < 2) continue
    let vi = -1
    for (let i = 1; i < tok.length; i++) {
      if (/^\d+[.,]?\d*$/.test(tok[i])) { vi = i; break }
    }
    if (vi < 1) continue
    const name = tok.slice(0, vi).join(' ')
    const value = tok[vi]
    const unitTok = tok[vi + 1]
    const unit = (unitTok && !/^\d/.test(unitTok) && unitTok !== '-' && unitTok !== '–') ? unitTok : ''
    addRow(name, value, unit)
  }

  // Pass 2: regex — catches non-line-structured text and OCR without newlines
  const pattern = /([^\d\n:]+?)\s*[:\-–]?\s*([0-9][0-9.,]*)\s*([a-zA-Zµµ/%×·\^³⁶⁰⁻\/]{1,20})?/g
  let m
  while ((m = pattern.exec(text)) !== null) {
    addRow(m[1], m[2], m[3])
  }

  return rows
}
