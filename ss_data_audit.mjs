import { chromium } from 'playwright';
const B = 'https://healthos-app-two.vercel.app';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 844 });

async function shot(url, file) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: file, fullPage: true });
  console.log('✓', file);
}

await shot(`${B}/`, 'audit_home.png');
await shot(`${B}/trends`, 'audit_trends.png');
await shot(`${B}/upload`, 'audit_reports.png');
await shot(`${B}/protocol`, 'audit_protocol.png');
await shot(`${B}/progress`, 'audit_progress.png');
await browser.close();
