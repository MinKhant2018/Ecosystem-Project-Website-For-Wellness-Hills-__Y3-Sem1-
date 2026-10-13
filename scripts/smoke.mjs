import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfGxoM7y86Rai24IogK-MPe87YdB84LnKrZMqSK7nTMkxZCgg/viewform?usp=header';
const viewports = [[1480, 3], [1280, 3], [1200, 3], [1101, 3], [1100, 2], [1024, 2], [768, 2], [561, 2], [560, 1], [390, 1], [320, 1]];
// Content transcribed from the supplied design, independent of the application data.
const expectedPartners = [
  ['Insda Wellness Resort', 'Rest, retreat, peace, comfort, and Lanna hospitality.', 'A wellness resort blending Lanna heritage with holistic rest and well-being.'],
  ['Origan Spa', 'Healing, Thai, Lanna, Ayurveda, balance.', 'A spa blending Thai, Lanna, and Ayurvedic wisdom for holistic healing and balance.'],
  ['X On Earth', 'Healthy food, local ingredients, community, vegetarian, earth friendly.', 'A restaurant focused on local ingredients, healthy food, and community support with an earth-friendly approach.'],
  ['Shambhu Cafe', 'Happiness, cacao, connection, creativity, relaxation.', 'A cafe of happiness connecting people through cacao, creativity, and relaxation in a warm atmosphere.'],
  ['CaLush Shop', 'Community products, curated goods, friendly, playful, local pride.', 'A shop curating quality community and local products, with a friendly mascot character bringing fun and local pride.'],
  ['Wellness Hills 1269+', 'Nature, journey, community, discovery, fresh.', 'A destination network connecting wellness routes, communities, and nature across Northern Thailand.'],
];
const normalize = value => value.replace(/\s+/g, ' ').trim();
const errors = [];
const requestSummary = [];
const knownPhotoUrls = new Set(['insda', 'origan', 'earth', 'shambhu', 'calush', 'hills'].flatMap(id => [
  new URL(`/assets/${id}-photo.webp`, base).href,
  new URL(`/assets/${id}-photo-small.webp`, base).href,
]));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox'],
});
await mkdir('test-results', { recursive: true });

async function openForm(page, activate) {
  const before = page.url();
  const popupPromise = page.waitForEvent('popup');
  await activate();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  assert.equal(popup.url(), formUrl, 'The complete Google Form URL must be preserved');
  assert.equal(await popup.evaluate(() => window.opener), null, 'The new tab must have no opener');
  assert.equal(page.url(), before, 'Opening the form must preserve the Promotions page');
  await popup.close();
}

async function assertNoOverlap(page, selectors, message) {
  const overlaps = await page.evaluate(selectors => {
    const rects = selectors.flatMap(selector => [...document.querySelectorAll(selector)].map(el => ({
      label: el.getAttribute('aria-label') || el.textContent.trim(),
      rect: el.getBoundingClientRect(),
    }))).filter(({ rect }) => rect.width > 0 && rect.height > 0);
    return rects.flatMap((a, index) => rects.slice(index + 1).flatMap(b => {
      const width = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
      const height = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
      return width > 0.5 && height > 0.5 ? [`${a.label} overlaps ${b.label}`] : [];
    }));
  }, selectors);
  assert.deepEqual(overlaps, [], message);
}

try {
  for (const [width, columns] of viewports) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    // Test the destination locally without contacting or submitting to Google Forms.
    await context.route('https://docs.google.com/**', route => route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<title>Google Form destination intercepted for testing</title>',
    }));
    const page = await context.newPage();
    const responseStatuses = new Map();
    const failedRequests = [];
    const decodedSources = new Set();
    page.on('pageerror', error => errors.push(`${width}px: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') errors.push(`${width}px: ${message.text()}`); });
    page.on('response', response => {
      responseStatuses.set(response.url(), response.status());
      if (response.status() >= 400) errors.push(`${width}px: ${response.status()} ${response.url()}`);
    });
    page.on('requestfailed', request => failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText,
      resourceType: request.resourceType(),
    }));
    await page.addInitScript(() => {
      window.__layoutShiftTotal = 0;
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__layoutShiftTotal += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    assert.match(await page.title(), /Promotions/);
    assert.equal(await page.getByRole('banner').count(), 1);
    assert.equal(await page.getByRole('main').count(), 1);
    assert.equal(await page.getByRole('contentinfo').count(), 1);
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
    assert.equal(await page.locator('h1').innerText(), 'Promotions');
    assert.equal(await page.locator('[aria-current="page"]').innerText(), 'Promotions');
    assert.equal(await page.locator('[aria-current="page"]').getAttribute('href'), '/');
    assert.equal(await page.locator('.partner-card').count(), 6);
    for (const [index, [name, tagline, description]] of expectedPartners.entries()) {
      const card = page.locator('.partner-card').nth(index);
      assert.equal(normalize(await card.locator('h2').innerText()), name);
      assert.equal(normalize(await card.locator('.tagline').innerText()), tagline);
      assert.equal(normalize(await card.locator('.description').innerText()), description);
      assert.deepEqual(await card.locator('.card-actions button').allTextContents().then(values => values.map(normalize)), ['Learn more', 'Visit website']);
    }
    assert.equal(await page.locator('.partner-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), columns, `Card columns at ${width}px`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}px`);
    await assertNoOverlap(page, ['.navigation > .brand', '.navigation > nav', '.navigation > .nav-actions'], `Header layout at ${width}px`);
    await assertNoOverlap(page, ['.navigation nav > *'], `Navigation items at ${width}px`);
    await assertNoOverlap(page, ['.contact-items', '.contact-social'], `Contact bar at ${width}px`);
    for (const [index] of expectedPartners.entries()) {
      await assertNoOverlap(page, [`.partner-card:nth-child(${index + 1}) .card-actions > *`], `Card buttons at ${width}px`);
    }

    // Verify space is reserved before lazy images load, and remains stable afterward.
    const imageRects = () => page.locator('img').evaluateAll(images => images.map(img => {
      const rect = img.getBoundingClientRect();
      return { x: rect.left + scrollX, y: rect.top + scrollY, width: rect.width, height: rect.height };
    }));
    const initialRects = await imageRects();
    assert.equal(initialRects.length, 14, 'The page uses separate original photos and logos');
    assert.ok(initialRects.every(rect => rect.width > 0 && rect.height > 0), 'Every image reserves layout space');
    assert.ok(await page.locator('img').evaluateAll(images => images.every(img => Number(img.getAttribute('width')) > 0 && Number(img.getAttribute('height')) > 0)), 'Every image needs intrinsic dimensions');
    assert.ok(await page.locator('img').evaluateAll(images => images.every(img => img.hasAttribute('alt'))), 'Every image needs an alt attribute');
    assert.ok(await page.locator('.partner-photo').evaluateAll(images => images.every(img => img.alt.trim().length > 0)), 'Partner photos need descriptive alternatives');
    for (const img of await page.locator('img').all()) {
      await img.scrollIntoViewIfNeeded();
      decodedSources.add(await img.evaluate(async el => {
        await el.decode();
        return el.currentSrc;
      }));
    }
    assert.ok(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)), `Broken image at ${width}px`);
    const loadedRects = await imageRects();
    for (const [index, initial] of initialRects.entries()) {
      for (const axis of ['x', 'y', 'width', 'height']) {
        assert.ok(Math.abs(initial[axis] - loadedRects[index][axis]) < 0.5, `Image ${index} shifts ${axis} at ${width}px`);
      }
    }

    const links = await page.locator('a').evaluateAll(anchors => anchors.map(a => a.getAttribute('href')));
    assert.ok(links.every(href => ['/', '#main', formUrl].includes(href)), 'No fabricated destinations or extra pages');
    const inactive = page.locator('button.inactive');
    assert.equal(await inactive.count(), 43, 'All unspecified navigation, partner, social, and footer controls remain present');
    assert.ok(await inactive.evaluateAll(buttons => buttons.every(button => button.disabled && button.type === 'button' && button.getAttribute('aria-disabled') === 'true')), 'Every unspecified destination must be natively disabled');
    const before = page.url();
    await inactive.evaluateAll(buttons => buttons.forEach(button => button.click()));
    assert.equal(page.url(), before, 'Inactive controls cannot navigate');
    assert.equal(context.pages().length, 1, 'Inactive controls cannot open tabs');

    const form = page.getByRole('link', { name: /Submit video\s+here/ });
    assert.equal(await form.count(), 1);
    assert.equal(await form.getAttribute('href'), formUrl);
    assert.equal(await form.getAttribute('target'), '_blank');
    assert.equal(await form.getAttribute('rel'), 'noopener noreferrer');
    // Check keyboard navigation before a popup can change Chromium's tab focus.
    if ([1480, 1024, 390, 320].includes(width)) {
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement?.className), 'skip-link');
      assert.ok(await page.locator('.skip-link').evaluate(el => el.getBoundingClientRect().top >= 0), 'Skip link is visible on focus');
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement?.id), 'main', 'Skip link moves focus to content');
      await page.locator('.brand').focus();
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-current')), 'page', 'Disabled menu items must leave the tab order');
      await page.keyboard.press('Tab');
      assert.ok(await form.evaluate(el => document.activeElement === el), 'The form is reachable by keyboard without tabbing through disabled controls');
      assert.notEqual(await form.evaluate(el => getComputedStyle(el).outlineStyle), 'none', 'Keyboard focus must be visible');
      await openForm(page, () => page.keyboard.press('Enter'));
    }
    await openForm(page, () => form.click());
    const layoutShift = await page.evaluate(() => window.__layoutShiftTotal);
    assert.ok(layoutShift <= 0.1, `Excessive cumulative layout shift at ${width}px: ${layoutShift}`);
    await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
    await page.screenshot({ path: `test-results/promotions-${width}.png`, fullPage: true });
    const photos = await page.locator('.partner-photo').evaluateAll(images => images.map(img => ({
      currentSrc: img.currentSrc,
      candidates: img.srcset.split(',').map(candidate => new URL(candidate.trim().split(/\s+/)[0], document.baseURI).href),
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    })));
    const responsiveCancellations = [];
    for (const failure of failedRequests) {
      // Browsers can cancel an initial srcset candidate when responsive sizing selects another.
      // Accept only a known photo candidate with a different, decoded, HTTP-200 replacement.
      const replacement = failure.error === 'net::ERR_ABORTED' && failure.resourceType === 'image' && knownPhotoUrls.has(failure.url)
        ? photos.find(photo => photo.candidates.includes(failure.url)
          && photo.currentSrc !== failure.url
          && photo.candidates.includes(photo.currentSrc)
          && knownPhotoUrls.has(photo.currentSrc)
          && photo.complete && photo.naturalWidth > 0 && photo.naturalHeight > 0
          && decodedSources.has(photo.currentSrc)
          && responseStatuses.get(photo.currentSrc) === 200)
        : undefined;
      if (replacement) {
        responsiveCancellations.push({ cancelledCandidate: failure.url, decodedReplacement: replacement.currentSrc, replacementStatus: 200 });
      } else {
        errors.push(`${width}px: ${failure.error} ${failure.url}`);
      }
    }
    requestSummary.push({ width, failedRequests, verifiedResponsiveCancellations: responsiveCancellations });
    console.log(`PASS ${width}px: ${columns} columns, exact six-card content, no overlaps/overflow, stable images, disabled destinations, and secure form tab (CLS ${layoutShift.toFixed(4)}, ${responsiveCancellations.length} verified source replacements)`);
    await context.close();
  }
  await writeFile('test-results/request-summary.json', `${JSON.stringify({ baseUrl: base, viewports: requestSummary, unexpectedErrors: errors }, null, 2)}\n`);
  assert.deepEqual(errors, [], 'Browser runtime, console, or resource errors');
} finally {
  await browser.close();
}
