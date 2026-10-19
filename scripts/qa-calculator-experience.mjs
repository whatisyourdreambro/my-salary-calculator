// Local-only UI regression audit. No analytics, ad requests or ad clicks are allowed.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import qaSafety from './lib/qa-safety.cjs';
const { assertLocalQaTarget, assertQaEnvironment, launchQaBrowser } = qaSafety;
const { chromium } = createRequire(import.meta.url)('playwright-core');
const base = assertLocalQaTarget(process.env.BASE_URL || 'http://127.0.0.1:3100');
assertQaEnvironment();
const contrastOnly = process.env.QA_CONTRAST_ONLY === '1';
if (contrastOnly) assert(process.env.QA_ROUTES, 'Contrast-only QA requires explicit QA_ROUTES');
const output = path.resolve('.artifacts/experience-qa', contrastOnly ? 'contrast' : '.');
const routes = process.env.QA_ROUTES?.split(',') || ['/calc', '/calc/refinance-break-even', '/calc/advertising-profit-roas', '/', '/en', '/home-loan', '/year-end-tax', '/calc/samsung-bonus', '/calc/jeonse-loan', '/calc/year-end-bonus-tax', '/savings-interest-2026', '/tools/finance/compound', '/money-check'];
const report = [];
const errors = [];
const expected = Number(process.env.QA_CALC_COUNT || 202);

// Composite computed backgrounds up the ancestor chain. Gradients/images are
// excluded from the automatic contrast score and covered by screenshots.
function auditPage({ strict = false } = {}) {
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
  if (strict) {
    const measurements = [], unassessed = [], excluded = [];
    // Computed RGB(A) only. Unknown color spaces must be reported, not treated
    // as RGB numbers or silently counted as passing.
    const parseRgb = value => {
      const match = /^rgba?\(([^)]+)\)$/.exec(value);
      if (!match || match[1].includes('%')) return null;
      const parts = match[1].trim().split(/[\s,/]+/).map(Number);
      return (parts.length === 3 || parts.length === 4) && parts.every(Number.isFinite) ? parts : null;
    };
    for (const element of document.querySelectorAll('main *')) {
      if (!(element instanceof HTMLElement) || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(element.tagName) || !visible(element)) continue;
      const directText = [...element.childNodes].filter(node => node.nodeType === 3).map(node => node.textContent).join(' ').replace(/\s+/g, ' ').trim();
      if (!directText) continue;
      const style = getComputedStyle(element);
      const fontSizePx = parseFloat(style.fontSize), fontWeight = Number(style.fontWeight);
      const threshold = fontSizePx >= 24 || (fontSizePx >= 14 * 96 / 72 && fontWeight >= 700) ? 3 : 4.5;
      const record = { tag: element.tagName.toLowerCase(), text: directText.slice(0, 160), class: element.className,
        foreground: style.color, fontSizePx, fontWeight, threshold };
      if (element.closest('.sr-only, [hidden]')) { excluded.push({ ...record, reason: 'visually-hidden' }); continue; }
      if (element.getAttribute('aria-hidden') === 'true' && /^[✓✔]$/.test(directText)) {
        excluded.push({ ...record, reason: 'explicitly-decorative-checkmark' }); continue;
      }
      const chain = [];
      let reason = null;
      for (let current = element; current; current = current.parentElement) {
        const currentStyle = getComputedStyle(current);
        chain.push(currentStyle);
        if (Number(currentStyle.opacity) < 1) reason = 'ancestor-or-text-opacity';
        if (currentStyle.filter !== 'none' || currentStyle.mixBlendMode !== 'normal') reason = 'filter-or-blend-mode';
      }
      const layers = [];
      for (const layer of chain) {
        if (reason) break;
        if (layer.backgroundImage !== 'none') { reason = 'background-image-or-gradient'; break; }
        const color = parseRgb(layer.backgroundColor);
        if (!color) { reason = 'unsupported-background-color'; break; }
        layers.push(color);
        // Opaque local panels conceal ancestor backgrounds; their ancestor
        // opacity still matters and was checked over the complete chain above.
        if ((color[3] ?? 1) === 1) break;
      }
      const foreground = parseRgb(style.color);
      if (!foreground) reason ||= 'unsupported-foreground-color';
      if (reason) { unassessed.push({ ...record, reason }); continue; }
      const background = layers.reverse().reduce((back, front) => blend(front, back), [255, 255, 255]);
      const compositedForeground = blend(foreground, background);
      const a = luminance(compositedForeground), b = luminance(background);
      const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      measurements.push({ ...record, background, compositedForeground, ratio, pass: ratio >= threshold });
    }
    const lowContrast = measurements.filter(item => !item.pass);
    return { background: getComputedStyle(document.body).backgroundColor, color: getComputedStyle(document.body).color,
      overflow: document.documentElement.scrollWidth > innerWidth, inputs, lowContrast, measurements, unassessed, excluded,
      coverage: { measured: measurements.length, passed: measurements.length - lowContrast.length,
        failed: lowContrast.length, unassessed: unassessed.length, excluded: excluded.length } };
  }
  const lowContrast = [...document.querySelectorAll('main :is(p,h1,h2,h3,label,summary,button,a,span,td,th)')].filter(element => visible(element) && !element.closest('[data-share-color-scope]') && [...element.childNodes].some(node => node.nodeType === 3 && node.textContent.trim())).flatMap(element => {
    const ratio = contrast(element), style = getComputedStyle(element);
    const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
    return ratio && ratio < (large ? 3 : 4.5) ? [{ text: element.textContent.trim().slice(0, 70), ratio: +ratio.toFixed(2), class: element.className, color: style.color }] : [];
  });
  return { background: getComputedStyle(document.body).backgroundColor, color: getComputedStyle(document.body).color, overflow: document.documentElement.scrollWidth > innerWidth, inputs, lowContrast };
}

async function auditContrastCases(browser) {
  for (const width of [390, 1280]) for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, serviceWorkers: 'block' });
    try {
      await context.addInitScript(theme => localStorage.setItem('theme', theme), theme);
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      for (const route of routes) {
        const response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 120000 });
        assert.equal(response.status(), 200, route);
        await page.locator('h1').first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), theme === 'dark');
        const audit = await page.evaluate(auditPage, { strict: true });
        const screenshots = [];
        report.push({ route, theme, width, ...audit, screenshots });
        const sections = route.startsWith('/table/')
          ? [{ label: 'intro', heading: /^202[67]년 월급/ }, { label: 'faq', heading: /^자주 묻는 질문$/ }]
          : route.startsWith('/job/')
            ? [{ label: 'career', heading: /^경력별 평균 연봉$/ }, { label: 'official', heading: /^정부 (공식 통계|발표)로 보는/ }, { label: 'calculator', heading: /^세후 실수령액 바로 계산$/ }]
            : [];
        for (const { label, heading } of sections) {
          const title = page.getByRole('heading', { level: 2, name: heading });
          if (!await title.count()) continue;
          const panel = title.first().locator('xpath=ancestor::section[1]');
          const filename = `${route.replaceAll('/', '_')}-${theme}-${width}-${label}.png`;
          // Scope screenshots to the explanation/FAQ/card, never the long table.
          await panel.screenshot({ path: path.join(output, filename), animations: 'disabled' });
          screenshots.push(filename);
        }
        console.log(`${theme} ${width}px ${route}: ${audit.coverage.measured} measured, ${audit.lowContrast.length} failed, ${audit.unassessed.length} unassessed`);
      }
    } finally { await context.close(); }
  }
  assert(report.every(item => item.coverage.measured > 0), 'Contrast coverage must not be empty');
  assert(report.every(item => !item.overflow), 'Contrast target horizontal overflow');
  assert.equal(report.reduce((sum, item) => sum + item.lowContrast.length, 0), 0, 'Measured text contrast below its unrounded WCAG threshold');
  assert.deepEqual(errors, []);
}

await fs.mkdir(output, { recursive: true });
const browser = await launchQaBrowser(chromium, base, { headless: true, ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
try {
  if (contrastOnly) await auditContrastCases(browser);
  else {
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
      if (route === '/calc/samsung-bonus') {
        const scenarios = page.locator('[data-saved-scenarios]');
        await scenarios.locator('summary').first().click();
        const save = scenarios.getByRole('button', { name: '현재 조건 저장', exact: true });
        const salary = page.getByLabel('내 연봉 입력 (원)', { exact: true });
        await save.click();
        assert.equal(await scenarios.locator('article').count(), 1);
        await save.click();
        assert.equal(await scenarios.locator('article').count(), 1, 'same inputs must not fill another slot');
        await salary.fill('100000000');
        await save.click();
        assert.equal(await scenarios.locator('article').count(), 2);
        assert((await scenarios.locator('article').first().innerText()).includes('많습니다.'));
        await salary.fill('140000000');
        await save.click();
        await salary.fill('200000000');
        await save.click();
        assert.equal(await scenarios.locator('article').count(), 3, 'no silent overwrite at capacity');
        await salary.fill('');
        assert(await save.isDisabled());
        await scenarios.getByRole('button', { name: '조건 1 불러오기', exact: true }).click();
        assert.equal(await salary.inputValue(), '80,000,000');
        await page.reload({ waitUntil: 'networkidle' });
        await scenarios.locator('summary').first().click();
        assert.equal(await scenarios.locator('article').count(), 3, 'saved cases survive a reload');
        await scenarios.getByRole('button', { name: '조건 2 삭제', exact: true }).click();
        assert.equal(await scenarios.locator('article').count(), 2);
        for (const width of [320, 768, 1280]) {
          await page.setViewportSize({ width, height: 900 });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'saved comparison overflow');
        }
        await page.setViewportSize({ width: 390, height: 844 });
        await scenarios.screenshot({ path: path.join(output, `samsung-saved-${theme}.png`) });
        await scenarios.getByRole('button', { name: '저장 조건 전체 삭제', exact: true }).click();
        assert.equal(await scenarios.locator('article').count(), 0);
        assert.equal(await page.evaluate(() => localStorage.getItem('moneysalary:samsung-bonus:scenarios:v1')), null);
        // Simulate unavailable local storage; the calculation and prior input stay usable.
        await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Synthetic quota', 'QuotaExceededError'); }; });
        await save.click();
        assert((await scenarios.getByRole('status').innerText()).includes('저장하지 못했습니다'));
        assert.equal(await salary.inputValue(), '80,000,000');
        await page.reload({ waitUntil: 'networkidle' });
      }
      if (route === '/') {
        const nonTaxable = page.getByRole('button', { name: /^비과세 / });
        await nonTaxable.click();
        const sheet = page.getByRole('dialog', { name: '비과세액 설정', exact: true });
        await sheet.waitFor({ state: 'visible' });
        assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
        // Inert local geometry fixture: no script, frame, ad request or SDK.
        await page.evaluate(() => {
          const fixture = document.createElement('ins');
          fixture.id = 'qa-inert-anchor'; fixture.className = 'adsbygoogle';
          fixture.style.cssText = 'position:fixed;bottom:0;left:0;width:100%;height:80px;pointer-events:none';
          document.body.appendChild(fixture);
          window.dispatchEvent(new Event('resize'));
        });
        await page.waitForFunction(() => parseFloat(document.querySelector('[role="dialog"][aria-modal="true"]').style.paddingBottom) >= 92);
        await page.evaluate(() => { document.getElementById('qa-inert-anchor').remove(); window.dispatchEvent(new Event('resize')); });
        assert(await sheet.evaluate(el => parseFloat(el.style.paddingBottom) >= 92), 'reserved space must not collapse during an open sheet');
        await page.keyboard.press('Escape');
        await sheet.waitFor({ state: 'hidden' });
        assert.equal(await page.evaluate(() => document.body.style.overflow), '');
        assert(await nonTaxable.evaluate(el => document.activeElement === el));
        const calculate = page.getByRole('button', { name: '결과 확인하기', exact: true });
        await calculate.click();
        const summary = page.locator('[data-salary-result-summary]');
        await summary.waitFor({ state: 'visible' });
        assert(await summary.evaluate(el => document.activeElement === el));
        await page.getByLabel('계약 연봉', { exact: true }).fill('60000000');
        await page.getByText('아래는 이전 계산 결과입니다. 입력값을 확인하고 다시 계산해 주세요.', { exact: true }).waitFor({ state: 'visible' });
        await calculate.click();
        assert(await summary.evaluate(el => document.activeElement === el));
        const expectedIncomeLinks = {
          '프리랜서': ['/tools/finance/freelance-tax', '/health-insurance-2026', '/calc/freelancer-yearly-quick'],
          '알바': ['/weekly-holiday-allowance-2026', '/minimum-wage-2026', '/tools/finance/severance'],
        };
        for (const [income, links] of Object.entries(expectedIncomeLinks)) {
          await page.getByRole('button', { name: income, exact: true }).click();
          await page.getByLabel('지급 총액', { exact: true }).fill('3000000');
          await calculate.click();
          const next = page.getByRole('heading', { name: '다음 단계로', exact: true }).locator('..');
          assert.deepEqual(await next.locator('div.grid').first().locator(':scope > a').evaluateAll(nodes => nodes.map(el => el.getAttribute('href'))), links);
        }
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
  }
} finally {
  await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify({ mode: contrastOnly ? 'contrast-only' : 'experience', report, errors }, null, 2));
  await browser.close();
}
console.log(contrastOnly
  ? `PASS: ${report.length} contrast cases; measured text thresholds passed. Unassessed rendering is listed separately.`
  : `PASS: ${report.length} theme/page cases, directory links, grouped fields and theme persistence.`);
