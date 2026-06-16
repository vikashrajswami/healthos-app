import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'https://healthos-app-two.vercel.app';
const W = 390, H = 844;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: W, height: H });

async function shot(url, file, action) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  if (action) await action();
  await page.screenshot({ path: file, fullPage: true });
  console.log('✓', file);
}

// 1. Reports screen (entry point)
await shot(`${BASE}/upload`, 'ss_reports.png');

// 2. Lab doorstep – Step 1 (test selection)
await shot(`${BASE}/lab-doorstep`, 'ss_step1.png');

// 3. Expand first panel to show tests
await page.goto(`${BASE}/lab-doorstep`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.locator('.ld-expand-btn').first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'ss_step1_expanded.png', fullPage: true });
console.log('✓ ss_step1_expanded.png');

// 4. Click Next to reach Step 2 (form)
await page.goto(`${BASE}/lab-doorstep`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.locator('.ld-next-btn').click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'ss_step2.png', fullPage: true });
console.log('✓ ss_step2.png');

// 5. Fill form and show filled state
await page.locator('.ld-input').nth(0).fill('Vikash Kumar');
await page.locator('.ld-input').nth(1).fill('9876543210');
await page.locator('.ld-textarea').fill('Flat 4B, Green Park, Near City Mall');
await page.locator('.ld-input').nth(2).fill('Mumbai');
await page.locator('.ld-input').nth(3).fill('400001');
await page.locator('.ld-slot').first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'ss_step2_filled.png', fullPage: true });
console.log('✓ ss_step2_filled.png');

// 6. Submit to reach Step 3 (confirmation)
await page.locator('.ld-submit-btn').click();
await page.waitForTimeout(500);
await page.screenshot({ path: 'ss_step3.png', fullPage: true });
console.log('✓ ss_step3.png');

await browser.close();
console.log('All done.');
