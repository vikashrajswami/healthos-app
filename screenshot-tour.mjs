import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = 'https://healthos-app-two.vercel.app'
const OUT  = __dirname

const browser = await chromium.launch({ headless: true })
const ctx     = await browser.newContext({ viewport: { width: 390, height: 844 } }) // iPhone 14 size
const page    = await ctx.newPage()

async function shot(name, url, waitMs = 2000, fn) {
  console.log(`📸 ${name}`)
  await page.goto(url, { waitUntil: 'networkidle' })
  if (fn) await fn()
  await page.waitForTimeout(waitMs)
  await page.screenshot({ path: path.join(OUT, `tour_${name}.png`), fullPage: false })
  console.log(`   saved tour_${name}.png`)
}

// 1. Home / Quiz start
await shot('01_home', BASE)

// 2. Click through quiz — answer each step
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
// Type name
try {
  const nameInput = page.locator('input[placeholder*="name"], input[placeholder*="Name"]').first()
  await nameInput.fill('Vikash')
  await page.screenshot({ path: path.join(OUT, 'tour_02_quiz_name.png') })
  console.log('   saved tour_02_quiz_name.png')
  // Next button
  const btn = page.locator('button').filter({ hasText: /next|continue|→/i }).first()
  await btn.click()
  await page.waitForTimeout(600)
  // Age
  const ageInput = page.locator('input[type="number"], input[placeholder*="age"], input[placeholder*="35"]').first()
  await ageInput.fill('32')
  await page.screenshot({ path: path.join(OUT, 'tour_03_quiz_age.png') })
  console.log('   saved tour_03_quiz_age.png')
  await page.locator('button').filter({ hasText: /next|continue|→/i }).first().click()
  await page.waitForTimeout(500)
  // Exercise
  await page.screenshot({ path: path.join(OUT, 'tour_04_quiz_exercise.png') })
  console.log('   saved tour_04_quiz_exercise.png')
  // Pick "Moderately active"
  await page.locator('button, div').filter({ hasText: /moderate|Moderately/i }).first().click()
  await page.waitForTimeout(400)
  // Smoke
  await page.locator('button, div').filter({ hasText: /non.smoker|never/i }).first().click()
  await page.waitForTimeout(400)
  // Sleep
  await page.locator('button, div').filter({ hasText: /good sleep/i }).first().click()
  await page.waitForTimeout(400)
  // Diet
  await page.locator('button, div').filter({ hasText: /mostly healthy/i }).first().click()
  await page.waitForTimeout(400)
  // Stress
  await page.locator('button, div').filter({ hasText: /moderate/i }).first().click()
  await page.waitForTimeout(1500)
  // BioAge result screen
  await page.screenshot({ path: path.join(OUT, 'tour_05_bioage_result.png'), fullPage: false })
  console.log('   saved tour_05_bioage_result.png')
} catch (e) {
  console.log('   quiz flow partial:', e.message)
  await page.screenshot({ path: path.join(OUT, 'tour_quiz_partial.png') })
}

// 3. Dashboard / Home screen (after quiz)
await shot('06_dashboard', BASE + '/', 2000)

// 4. Trends / Reports
await shot('07_trends', BASE + '/trends', 2000)

// 5. Lab Reports upload
await shot('08_reports', BASE + '/upload', 2000)

// 6. Lab at Doorstep
await shot('09_lab_doorstep', BASE + '/lab-doorstep', 2000)

// 7. BioAge details
await shot('10_bioage_details', BASE + '/bioage', 2000)

// 8. Habits tracker
await shot('11_habits', BASE + '/habits', 2000)

// 9. Family tracker
await shot('12_family', BASE + '/family', 2000)

// 10. Settings
await shot('13_settings', BASE + '/settings', 2000)

// 11. Referral screen
await shot('14_referral', BASE + '/referral', 2000)

// 12. Payment screen
await shot('15_payment', BASE + '/payment', 2000)

// 13. Upgrade / Pricing screen
await shot('16_upgrade', BASE + '/upgrade', 2000)

await browser.close()
console.log('\n✅ All screenshots saved!')
