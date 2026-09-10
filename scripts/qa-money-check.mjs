// Run against a local server: BASE_URL=http://127.0.0.1:3100 node scripts/qa-money-check.mjs
// External requests are blocked; this never requests or clicks a live advertisement.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright-core');

const base = process.env.BASE_URL || 'http://127.0.0.1:3100';
const output = path.resolve('.artifacts/money-check-qa');
const storageKey = 'moneysalary:money-check:v1';
const errors = [];
const results = [];

async function context(browser, options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', ...options });
  await ctx.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  ctx.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  return ctx;
}

async function open(page) {
  const response = await page.goto(`${base}/money-check`, { waitUntil: 'networkidle', timeout: 120000 });
  assert.equal(response.status(), 200);
  await page.locator('h1').waitFor();
  await page.evaluate(() => document.fonts.ready);
}

async function main() {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : process.platform === 'win32' ? { channel: 'chrome' } : {}) });
  try {
    const ctx = await context(browser);
    const page = await ctx.newPage();
    await open(page);
    assert.equal(await page.locator('main').count(), 1);
    assert.equal(await page.locator('#main-content').count(), 1);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://www.moneysalary.com/money-check');
    assert.equal(await page.locator('#money-check-results article').count(), 12);
    const ld = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.flatMap(node => JSON.parse(node.textContent)));
    assert.equal(ld.find(item => item['@type'] === 'CollectionPage').mainEntity.numberOfItems, 12);
    assert.equal(ld.find(item => item['@type'] === 'FAQPage').mainEntity.length, 5);

    for (const width of [320, 390, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => scrollTo(0, 0));
      const geometry = await page.evaluate(() => {
        const shell = document.querySelector('body header');
        const box = shell.getBoundingClientRect();
        const heading = document.querySelector('h1').getBoundingClientRect();
        return { viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, headerBottom: box.bottom, headingTop: heading.top };
      });
      assert(geometry.scrollWidth <= width, `Horizontal overflow at ${width}px`);
      assert(geometry.headingTop > geometry.headerBottom, `Heading hidden by header at ${width}px`);
      await page.screenshot({ path: path.join(output, `page-${width}.png`) });
      results.push({ width, ...geometry });
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: '월급 실수령액과 성과급' }).click();
    assert.equal(await page.locator('#money-check-results article').count(), 2);
    await page.locator('#check-salary-take-home').check();
    assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '1');
    await page.reload({ waitUntil: 'networkidle' });
    assert(await page.locator('#check-salary-take-home').isChecked());
    const other = await ctx.newPage();
    await open(other);
    await other.locator('#check-home-rent').check();
    await page.waitForFunction(() => document.querySelector('#check-home-rent').checked);
    await page.locator('#check-salary-take-home').uncheck();
    await other.waitForFunction(() => !document.querySelector('#check-salary-take-home').checked);
    assert(await other.locator('#check-home-rent').isChecked());
    await other.close();
    await page.getByRole('button', { name: '체크 기록 초기화', exact: true }).click();
    assert.equal(await page.locator('input[type="checkbox"]:checked').count(), 0);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), storageKey), null);

    await page.evaluate(() => { window.__qaEvents = []; window.gtag = (...args) => window.__qaEvents.push(args); });
    await page.getByRole('button', { name: '월급 실수령액과 성과급' }).click();
    await page.locator('#check-salary-take-home').check();
    assert.equal(await page.evaluate(() => window.__qaEvents.length), 0, 'Checklist state should not be tracked');
    await page.locator('[data-msy-module="money-check-calculator"] a').first().evaluate(anchor => {
      anchor.addEventListener('click', event => event.preventDefault(), { once: true });
      anchor.click();
    });
    const events = await page.evaluate(() => window.__qaEvents.filter(item => item[1] === 'guide_cta_click'));
    assert.equal(events.length, 1, 'Internal link should be tracked exactly once');
    assert.equal(events[0][2].position, 'money-check-calculator');
    await page.evaluate(() => scrollTo(0, 0));
    await page.getByRole('button', { name: '메뉴 열기', exact: true }).click();
    const menu = page.getByRole('dialog', { name: '모바일 메뉴' });
    assert(await menu.locator('[data-msy-module="header-money-check"]').isVisible());
    await page.keyboard.press('Escape');
    assert(!(await menu.isVisible()));
    await page.getByRole('button', { name: '검색 열기', exact: true }).click();
    const search = page.getByRole('dialog', { name: '사이트 검색' });
    await search.getByRole('textbox', { name: '계산기·가이드·용어 검색' }).fill('내 돈 체크');
    await search.locator('a[href="/money-check"]').waitFor();
    await page.keyboard.press('Escape');
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.locator('#checklist-heading').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, 'checklist-dark-390.png') });
    await ctx.close();

    const blocked = await context(browser);
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked', 'SecurityError'); } }));
    const blockedPage = await blocked.newPage();
    await open(blockedPage);
    await blockedPage.locator('#check-salary-take-home').check();
    assert(await blockedPage.locator('#check-salary-take-home').isChecked());
    assert(await blockedPage.getByRole('status').filter({ hasText: '브라우저 저장을 사용할 수 없어요' }).isVisible());
    await blocked.close();

    const nojs = await context(browser, { javaScriptEnabled: false });
    const nojsPage = await nojs.newPage();
    await open(nojsPage);
    assert.equal(await nojsPage.locator('#money-check-results article').count(), 12);
    assert.equal(await nojsPage.locator('[data-msy-module="money-check-calculator"] a').count(), 12);
    assert.equal(await nojsPage.locator('[data-msy-module="money-check-guide"] a').count(), 12);
    await nojs.close();
    assert.deepEqual(errors, []);
    await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ passed: true, results, errors }, null, 2));
    console.log('PASS: responsive layout, metadata/SSR, filters, progress, save/reload/reset, cross-tab sync, blocked storage, menu/search, private state and link telemetry.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
