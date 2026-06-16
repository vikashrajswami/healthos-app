import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('https://healthos-app-two.vercel.app/upload', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'ss_reports_new.png', fullPage: true });
await browser.close();
console.log('done');
