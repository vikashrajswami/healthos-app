// 30 daily rotating health insights — one per day based on day of year
// Each insight has a topic, icon, title, body, and one actionable step

const INSIGHTS = [
  {
    topic: 'sleep',
    icon: '😴',
    title: 'Sleep is your #1 anti-aging drug',
    body: 'During deep sleep, your body releases growth hormone and repairs DNA damage. Just 1 extra hour per night can lower your biological age by 1–2 years over 6 months.',
    action: 'Set a sleep alarm 30 min earlier tonight',
    tags: ['sleep'],
  },
  {
    topic: 'inflammation',
    icon: '🔥',
    title: 'Chronic inflammation accelerates aging',
    body: 'hsCRP above 3 mg/L doubles your biological aging rate. Turmeric, omega-3, and cutting refined sugar are the fastest ways to lower systemic inflammation.',
    action: 'Replace one processed snack today with walnuts or almonds',
    tags: ['diet', 'biomarkers'],
  },
  {
    topic: 'movement',
    icon: '🏃',
    title: '22 minutes of movement = 3 fewer biological years',
    body: 'A Harvard study of 75,000 people found that just 22 min/day of moderate activity reduces all-cause mortality by 30% and measurably slows cellular aging.',
    action: 'Take a 22-minute walk after your next meal',
    tags: ['exercise'],
  },
  {
    topic: 'sugar',
    icon: '🍭',
    title: 'Blood sugar spikes age you faster',
    body: 'High HbA1c (above 5.6%) accelerates glycation — a process that stiffens cells and ages organs. Reducing sugar intake for 90 days can drop HbA1c by 0.5–1.0 points.',
    action: 'Skip sugar in your next cup of tea or coffee',
    tags: ['diet', 'biomarkers'],
  },
  {
    topic: 'water',
    icon: '💧',
    title: 'Dehydration makes your cells age faster',
    body: 'Research from NIH: Adults who stay well-hydrated develop fewer chronic diseases and show slower biological aging. Aim for 8 glasses. Your kidneys, skin, and brain will thank you.',
    action: 'Drink a full glass of water right now',
    tags: ['hydration'],
  },
  {
    topic: 'stress',
    icon: '🧘',
    title: 'Chronic stress shortens your telomeres',
    body: 'Cortisol, the stress hormone, directly damages telomere caps on your DNA — the biological clock inside every cell. Even 10 minutes of deep breathing daily reduces cortisol by 25%.',
    action: 'Take 10 slow, deep breaths right now — 4 seconds in, 6 out',
    tags: ['stress'],
  },
  {
    topic: 'protein',
    icon: '🥩',
    title: 'After 40, protein becomes critical',
    body: 'Sarcopenia (muscle loss with age) begins at 0.5–1% per year after 40. Higher protein intake (1.2–1.6g/kg bodyweight) combined with resistance training prevents this entirely.',
    action: 'Make your next meal protein-first: eggs, legumes, paneer, or chicken',
    tags: ['diet', 'exercise'],
  },
  {
    topic: 'vitamin_d',
    icon: '☀️',
    title: 'Vitamin D deficiency adds years to your BioAge',
    body: 'Over 70% of Indians are Vitamin D deficient. Low Vitamin D is linked to faster aging, weaker immunity, and higher risk of diabetes. 20 minutes of morning sun is free medicine.',
    action: 'Step outside for morning sunlight for 15–20 minutes',
    tags: ['biomarkers', 'vitamins'],
  },
  {
    topic: 'gut',
    icon: '🦠',
    title: 'Your gut microbiome controls 70% of your immunity',
    body: 'A diverse gut microbiome correlates strongly with a younger biological age. People with the highest microbiome diversity live measurably longer with fewer chronic diseases.',
    action: 'Eat one fermented food today: yogurt, buttermilk, or idli/dosa batter',
    tags: ['diet', 'gut'],
  },
  {
    topic: 'alcohol',
    icon: '🍷',
    title: 'Even moderate alcohol ages your liver and brain',
    body: 'There is no safe level of alcohol for the liver or brain. Even 2 drinks/day raises biological age by 1.8 years and increases cancer risk by 8% per drink.',
    action: 'Replace one alcoholic drink this week with sparkling water + lime',
    tags: ['lifestyle'],
  },
  {
    topic: 'meditation',
    icon: '🧠',
    title: '8 weeks of meditation changes your brain structure',
    body: 'Harvard MRI studies show 8 weeks of daily meditation increases grey matter density in the prefrontal cortex — the area governing focus, empathy, and emotional regulation.',
    action: 'Try 5 minutes of focused breathing before bed tonight',
    tags: ['stress', 'mental'],
  },
  {
    topic: 'cholesterol',
    icon: '❤️',
    title: 'LDL above 130 doubles cardiovascular aging risk',
    body: 'High LDL-C creates arterial plaques that narrow blood vessels and age your heart. Oats, flaxseed, and reducing saturated fats lower LDL by 15–25% without medication in 12 weeks.',
    action: 'Have oats for breakfast at least 3 days this week',
    tags: ['biomarkers', 'heart'],
  },
  {
    topic: 'smoking',
    icon: '🚭',
    title: 'Quitting smoking reverses 10 years of biological aging',
    body: 'Within 10 years of quitting, your lung cancer risk drops by 50% and your biological age measurably reverses. Within 20 years, your risk is nearly equal to a never-smoker.',
    action: 'If you smoke, delay your next cigarette by 30 minutes today',
    tags: ['lifestyle'],
  },
  {
    topic: 'strength',
    icon: '💪',
    title: 'Grip strength predicts biological age better than BMI',
    body: 'A 2024 meta-analysis of 2.3 million people found grip strength to be the single best predictor of biological age and longevity — better than blood pressure, BMI, or cholesterol.',
    action: 'Do 3 sets of 10 push-ups or any bodyweight exercise today',
    tags: ['exercise'],
  },
  {
    topic: 'cold',
    icon: '🧊',
    title: 'Cold showers activate anti-aging proteins',
    body: 'Cold exposure activates brown adipose tissue, reduces inflammation, and boosts norepinephrine by 300%. Even 30 seconds of cold at the end of your shower provides measurable benefits.',
    action: 'End your shower with 30 seconds of cold water today',
    tags: ['lifestyle', 'exercise'],
  },
  {
    topic: 'fasting',
    icon: '⏱️',
    title: 'A 14-hour eating window triggers cellular cleanup',
    body: 'Autophagy — the body\'s cellular self-cleaning process — activates strongly after 12–16 hours without food. It removes damaged cells and proteins that accumulate with aging.',
    action: 'Finish dinner 3 hours before sleep tonight for a natural 14-hour fast',
    tags: ['diet', 'fasting'],
  },
  {
    topic: 'social',
    icon: '🤝',
    title: 'Loneliness ages you as fast as smoking 15 cigarettes/day',
    body: 'A major meta-analysis found social isolation increases mortality by 26%. Strong social connections are one of the most consistent predictors of longevity across all cultures.',
    action: 'Call or message one person you haven\'t spoken to in 2+ weeks today',
    tags: ['mental', 'social'],
  },
  {
    topic: 'omega3',
    icon: '🐟',
    title: 'Omega-3 fats protect your brain from aging',
    body: 'DHA and EPA (found in fatty fish and flaxseed) reduce brain inflammation, protect telomeres, and lower the risk of cognitive decline by up to 47% in regular consumers.',
    action: 'Eat fatty fish (salmon, mackerel, sardines) or add flaxseed to your meal today',
    tags: ['diet', 'brain'],
  },
  {
    topic: 'posture',
    icon: '🧍',
    title: 'Poor posture compresses your spine and reduces oxygen',
    body: 'Slouching reduces lung capacity by up to 30%, reducing oxygen delivery to the brain and cells. Corrected posture also reduces cortisol and boosts testosterone measurably.',
    action: 'Set a reminder every hour to sit straight for the next 8 hours',
    tags: ['lifestyle', 'exercise'],
  },
  {
    topic: 'hemoglobin',
    icon: '🩸',
    title: 'Low hemoglobin silently ages your organs',
    body: 'Anemia means every organ in your body gets less oxygen than it needs to function optimally. Iron-deficiency anemia is the most common nutritional deficiency in India — especially in women.',
    action: 'Eat iron-rich foods today: spinach, lentils, jaggery, or pomegranate',
    tags: ['biomarkers', 'diet'],
  },
  {
    topic: 'blue_light',
    icon: '📱',
    title: 'Screen light after 10 PM disrupts your biological clock',
    body: 'Blue light suppresses melatonin for up to 3 hours after exposure. This delays sleep onset, reduces deep sleep quality, and over time accelerates aging of the brain and immune system.',
    action: 'Enable night mode on your phone now and put it down 30 min before sleep',
    tags: ['sleep', 'lifestyle'],
  },
  {
    topic: 'b12',
    icon: '💊',
    title: 'B12 deficiency causes irreversible nerve aging',
    body: 'B12 is essential for DNA synthesis and nerve health. 80% of vegetarians and vegans are deficient. Deficiency causes nerve damage, accelerated brain aging, and fatigue.',
    action: 'Check if you have had a B12 test. If not, ask your doctor at next visit',
    tags: ['biomarkers', 'vitamins'],
  },
  {
    topic: 'nature',
    icon: '🌿',
    title: '120 minutes in nature per week measurably reduces stress hormones',
    body: 'A study of 20,000 people found those spending 120+ min/week in nature had significantly better health and wellbeing than those spending none — regardless of how it was split.',
    action: 'Walk in a park, garden, or any green space for at least 15 minutes today',
    tags: ['stress', 'mental'],
  },
  {
    topic: 'thyroid',
    icon: '🦋',
    title: 'Thyroid imbalance affects every cell in your body',
    body: 'The thyroid regulates metabolism, energy, and aging speed. Both high TSH (hypothyroid) and low TSH (hyperthyroid) accelerate biological aging. Testing costs under ₹300.',
    action: 'Check if your last TSH test was within 1 year. If not, schedule one',
    tags: ['biomarkers', 'hormones'],
  },
  {
    topic: 'gratitude',
    icon: '🙏',
    title: 'Gratitude journaling measurably reduces inflammatory markers',
    body: 'People who write 3 things they\'re grateful for daily show lower IL-6 (inflammation marker), better sleep, and reduced cardiovascular risk within 8 weeks — proven in multiple RCTs.',
    action: 'Write 3 things you\'re genuinely grateful for right now',
    tags: ['mental', 'stress'],
  },
  {
    topic: 'nuts',
    icon: '🥜',
    title: 'A handful of nuts daily reduces mortality by 20%',
    body: 'A 30-year Harvard study found that people who ate nuts daily had 20% lower all-cause mortality. Walnuts specifically reduce LDL and lower CRP (inflammation) within 6 weeks.',
    action: 'Keep a small pack of mixed nuts as your snack for this week',
    tags: ['diet'],
  },
  {
    topic: 'walking',
    icon: '👟',
    title: '7,000 steps/day is the longevity sweet spot',
    body: 'The benefit curve for walking flattens after 7,000 steps — you don\'t need 10,000. People hitting 7,000/day show 50–70% lower mortality risk and meaningfully younger biological ages.',
    action: 'Track your steps today and aim for at least 7,000',
    tags: ['exercise'],
  },
  {
    topic: 'loneliness',
    icon: '💙',
    title: 'Purpose in life is linked to a longer, healthier life',
    body: 'Having a strong sense of purpose (Ikigai in Japanese culture) reduces all-cause mortality by 17% and lowers Alzheimer\'s risk by 44%. It is as protective as physical exercise.',
    action: 'Write one sentence about what you want to achieve in the next 5 years',
    tags: ['mental', 'social'],
  },
  {
    topic: 'sauna',
    icon: '🛁',
    title: 'Heat exposure clears cellular damage',
    body: 'Regular sauna use (or hot baths) activates heat shock proteins that repair damaged proteins. Finnish research links 4+ sauna sessions/week to a 40% reduction in cardiovascular mortality.',
    action: 'Take a hot bath or shower for 15–20 minutes today',
    tags: ['lifestyle'],
  },
  {
    topic: 'blood_pressure',
    icon: '📊',
    title: 'High blood pressure silently ages your arteries',
    body: 'Blood pressure above 130/80 mmHg increases biological arterial age by 5–10 years. It has no symptoms but permanently damages arteries with every heartbeat. Check it today.',
    action: 'Measure your blood pressure today — chemists have free machines',
    tags: ['biomarkers', 'heart'],
  },
]

// Get today's insight — rotates daily using day-of-year
export function getTodayInsight(quizAnswers) {
  const now     = new Date()
  const start   = new Date(now.getFullYear(), 0, 0)
  const dayNum  = Math.floor((now - start) / 86_400_000)

  // Personalize: if user has a notable quiz weakness, weight those insights first occasionally
  if (quizAnswers) {
    const poor = []
    if (quizAnswers.sleep === 'poor')  poor.push('sleep', 'blue_light')
    if (quizAnswers.exercise === 'low') poor.push('movement', 'strength', 'walking')
    if (quizAnswers.diet === 'poor')   poor.push('sugar', 'protein', 'omega3', 'nuts')
    if (quizAnswers.smoke === 'yes')   poor.push('smoking')
    if (quizAnswers.stress === 'high') poor.push('stress', 'meditation', 'gratitude')

    // Every 3rd day, show a personalized insight
    if (poor.length > 0 && dayNum % 3 === 0) {
      const targetTopic = poor[dayNum % poor.length]
      const match = INSIGHTS.find(i => i.topic === targetTopic)
      if (match) return match
    }
  }

  return INSIGHTS[dayNum % INSIGHTS.length]
}

// Mark that the user has opened the app today
export function recordAppOpen() {
  const today = new Date().toDateString()
  localStorage.setItem('healthos_last_open', today)
  const firstOpen = localStorage.getItem('healthos_first_open')
  if (!firstOpen) localStorage.setItem('healthos_first_open', Date.now().toString())
}

// Returns number of days since first open (for rating prompt timing)
export function daysSinceFirstOpen() {
  const first = parseInt(localStorage.getItem('healthos_first_open') || '0')
  if (!first) return 0
  return Math.floor((Date.now() - first) / 86_400_000)
}

export function hasRatingPromptBeenShown() {
  return !!localStorage.getItem('healthos_rating_shown')
}
export function markRatingPromptShown() {
  localStorage.setItem('healthos_rating_shown', '1')
}

export function hasInstallPromptBeenDismissed() {
  return !!localStorage.getItem('healthos_install_dismissed')
}
export function markInstallPromptDismissed() {
  localStorage.setItem('healthos_install_dismissed', '1')
}
