// Local-only UI regression audit. No analytics, ad requests or ad clicks are allowed.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright-core');
const base = process.env.BASE_URL || 'http://127.0.0.1:3100';
const output = path.resolve('.artifacts/experience-qa');
const routes = process.env.QA_ROUTES?.split(',') || ['/calc', '/calc/refinance-break-even', '/calc/advertising-profit-roas', '/', '/en', '/home-loan', '/year-end-tax', '/calc/samsung-bonus', '/calc/jeonse-loan', '/calc/year-end-bonus-tax', '/savings-interest-2026', '/tools/finance/compound', '/money-check'];
const report = [];
const errors = [];
const expected = Number(process.env.QA_CALC_COUNT || 202);

// Composite computed backgrounds up the ancestor chain. Gradients/images are
// excluded from the automatic contrast score and covered by screenshots.
function auditPage() {
  const rgba = value => (value.match(/[\d.]+/g) || []).map(Number);
  const blend = (front, back) => {
    const alpha = front[3] ?? 1;
    return front.slice(0, 3).map((value, i) => value * alpha + back[i] * (1 - alpha));
  };
  const luminance = rgb => rgb.map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
  const colorAt = element => {
    const chain = [];
    for (let current = element; current; current = current.parentElement) {
      const style = getComputedStyle(current);
      if (style.backgroundImage !== 'none' || Number(style.opacity) < 1) return null;
      chain.push(rgba(style.backgroundColor));
    }
    return chain.reverse().reduce((back, front) => blend(front, back), [255, 255, 255]);
  };
  const contrast = element => {
    const background = colorAt(element);
    if (!background) return null;
    const style = getComputedStyle(element);
    const front = blend(rgba(style.color), background);
    const a = luminance(front), b = luminance(background);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  };
  const visible = element => {
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && getComputedStyle(element).visibility !== 'hidden';
  };
  const inputs = [...document.querySelectorAll('input:not([type="hidden"]):not([type="range"]):not([type="radio"]):not([type="checkbox"])')].filter(visible).map(element => ({
    value: element.value, mode: element.inputMode, type: element.type, grouped: element.dataset.numberInput,
    calendar: element.dataset.numberFormat, ratio: contrast(element), color: getComputedStyle(element).color,
    background: getComputedStyle(element).backgroundColor, name: element.getAttribute('aria-label') || element.id,
  }));
  const lowContrast = [...document.querySelectorAll('main :is(p,h1,h2,h3,label,summary,button,a,span,td,th)')].filter(element => visible(element) && !element.closest('[data-share-color-scope]') && [...element.childNodes].some(node => node.nodeType === 3 && node.textContent.trim())).flatMap(element => {
    const ratio = contrast(element), style = getComputedStyle(element);
    const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
    return ratio && ratio + .05 < (large ? 3 : 4.5) ? [{ text: element.textContent.trim().slice(0, 70), ratio: +ratio.toFixed(2), class: element.className, color: style.color }] : [];
  });
  return { background: getComputedStyle(document.body).backgroundColor, color: getComputedStyle(document.body).color, overflow: document.documentElement.scrollWidth > innerWidth, inputs, lowContrast };
}

await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
try {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: theme, serviceWorkers: 'block' });
    await context.addInitScript(theme => localStorage.setItem('theme', theme), theme);
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    for (const route of routes) {
      const response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 120000 });
      assert.equal(response.status(), 200, route);
      await page.locator('h1').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), theme === 'dark');
      const audit = await page.evaluate(auditPage);
      report.push({ route, theme, ...audit });
      assert.equal(audit.overflow, false, `${route} horizontal overflow`);
      for (const input of audit.inputs) {
        if (input.grouped && /^-?\d{4,}(\.\d*)?$/.test(input.value)) throw new Error(`${route}: ungrouped ${input.value}`);
        if (input.ratio !== null) assert(input.ratio >= 4.5, `${route} ${theme} input contrast ${input.ratio}: ${input.name}`);
      }
      if (['/calc', '/calc/refinance-break-even', '/calc/samsung-bonus', '/home-loan'].includes(route)) await page.screenshot({ path: path.join(output, `${route.replaceAll('/', '_')}-${theme}.png`) });
      if (route === '/calc/refinance-break-even') {
        const result = page.getByRole('region', { name: '현재 조건의 계산 결과' });
        assert((await result.innerText()).includes('12개월'));
        const fee = page.getByLabel(/대환 초기 비용 합계/);
        await fee.fill('600000');
        assert.equal(await fee.inputValue(), '600,000');
        assert((await result.innerText()).includes('6개월'));
        await fee.fill('');
        assert.equal(await fee.inputValue(), '');
        assert((await result.innerText()).includes('입력값 확인'));
        assert.equal(await page.locator('[data-result-share-panel]').count(), 0);
        await fee.pressSequentially('6000000');
        assert.equal(await fee.inputValue(), '6,000,000');
        await page.getByLabel(/새 월 납입액/).fill('1000000');
        assert((await result.innerText()).includes('새 월 납입액이 더 작아야'));
        assert.equal(await page.locator('[data-result-share-panel]').count(), 0);
        const restored = Buffer.from(JSON.stringify({ old: 1000000, next: 900000, fee: 600000, hold: 36 })).toString('base64url');
        await page.goto(`${base}${route}?v=${restored}`, { waitUntil: 'networkidle' });
        assert.equal(await page.getByLabel(/대환 초기 비용 합계/).inputValue(), '600,000');
        assert((await page.getByRole('region', { name: '현재 조건의 계산 결과' }).innerText()).includes('6개월'));
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://www.moneysalary.com' + route);
        assert.equal(await page.getByRole('heading', { name: '자주 묻는 질문', exact: true }).locator('..').locator('details').count(), 3);
      }
      if (route === '/calc/advertising-profit-roas') {
        const margin = page.getByLabel(/광고 전 공헌이익률/);
        await margin.fill('');
        await margin.pressSequentially('35.5');
        assert.equal(await margin.inputValue(), '35.5');
        assert((await page.getByRole('region', { name: '현재 조건의 계산 결과' }).innerText()).includes('420,000원'));
      }
      console.log(`${theme} ${route}: ${audit.inputs.length} fields; ${audit.lowContrast.length} text contrast candidates`);
      if (route === '/calc') {
        const items = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.flatMap(node => JSON.parse(node.textContent)));
        const collection = items.find(item => item['@type'] === 'CollectionPage');
        assert.equal(collection.mainEntity.numberOfItems, expected);
        for (const item of collection.mainEntity.itemListElement) assert(await page.locator(`#calculator-directory-results a[href="${new URL(item.url).pathname}"]`).count(), `Missing directory link: ${item.url}`);
        if (expected === 202) {
          await page.getByRole('button', { name: '추가된 계산기 101개만 보기' }).click();
          assert.equal(await page.locator('#calculator-directory-results a').count(), 101);
          await page.getByRole('searchbox', { name: '계산기 검색' }).fill('대환');
          assert(await page.locator('#calculator-directory-results a').count() > 0);
          await page.getByRole('searchbox', { name: '계산기 검색' }).fill('존재하지않는계산기xyz');
          assert.equal(await page.locator('#calculator-directory-results a').count(), 0);
          await page.getByRole('button', { name: '모든 계산기 보기', exact: true }).click();
        }
        for (const width of [320, 768, 1280, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        }
        await page.setViewportSize({ width: 390, height: 844 });
      }
    }
    // Verify explicit switching and persistence rather than only system theme.
    await page.getByRole('button', { name: /모드 \(.*전환\)/ }).click();
    await page.waitForFunction(dark => document.documentElement.classList.contains('dark') === dark, theme === 'light');
    await page.reload({ waitUntil: 'networkidle' });
    // init script deliberately applies the requested audit theme on each document;
    // persisted storage is tested separately without that setup script below.
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'light', serviceWorkers: 'block' });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  const page = await context.newPage();
  await page.goto(base + '/calc', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '라이트 모드 (다크로 전환)', exact: true }).click();
  await page.reload({ waitUntil: 'networkidle' });
  assert(await page.evaluate(() => document.documentElement.classList.contains('dark')));
  await page.getByRole('button', { name: '다크 모드 (라이트로 전환)', exact: true }).click();
  await page.reload({ waitUntil: 'networkidle' });
  assert(!(await page.evaluate(() => document.documentElement.classList.contains('dark'))));
  await context.close();
  assert.deepEqual(errors, []);
} finally {
  await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify({ report, errors }, null, 2));
  await browser.close();
}
console.log(`PASS: ${report.length} theme/page cases, directory links, grouped fields and theme persistence.`);
