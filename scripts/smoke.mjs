import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const errors = [];
await mkdir('test-results', { recursive: true });
try {
  for (const [width, columns] of [[1480,3],[1280,3],[768,2],[390,1],[320,1]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('h1').innerText(), 'Promotions');
    assert.equal(await page.locator('.partner-card').count(), 6);
    assert.equal(await page.locator('[aria-current="page"]').innerText(), 'Promotions');
    assert.equal(await page.locator('.partner-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), columns);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}px`);
    // Load every lazy image before validating image availability and taking a full-page screenshot.
    for (const img of await page.locator('img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(el => el.decode());
    }
    assert.ok(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)), `Broken image at ${width}px`);
    const form = page.locator('a.submit');
    assert.equal(await form.getAttribute('href'), 'https://docs.google.com/forms/d/e/1FAIpQLSfGxoM7y86Rai24IogK-MPe87YdB84LnKrZMqSK7nTMkxZCgg/viewform?usp=header');
    assert.equal(await form.getAttribute('target'), '_blank');
    assert.equal(await form.getAttribute('rel'), 'noopener noreferrer');
    await page.context().route('https://docs.google.com/**', route => route.fulfill({ status:200, contentType:'text/html', body:'<title>Google Form destination intercepted for testing</title>' }));
    const popupPromise = page.waitForEvent('popup');
    await form.click();
    const popup = await popupPromise;
    await popup.waitForLoadState();
    assert.ok(popup.url().startsWith('https://docs.google.com/forms/'));
    await popup.close();
    // Unspecified links must not navigate or open tabs.
    const before = page.url();
    assert.equal(await page.locator('.card-actions button').first().getAttribute('aria-disabled'), 'true');
    await page.locator('.card-actions button').first().click({ force: true });
    assert.equal(page.url(), before);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `test-results/promotions-${width}.png`, fullPage: true });
    console.log(`PASS ${width}px: ${columns} columns, no overflow, six cards, images, inactive links, and Google Form new-tab behavior`);
    await page.close();
  }
  assert.deepEqual(errors, [], 'Browser runtime or asset errors');
} finally { await browser.close(); }
