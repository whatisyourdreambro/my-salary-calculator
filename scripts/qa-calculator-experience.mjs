// Local-only UI regression audit. No analytics, ad requests or ad clicks are allowed.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import qaSafety from './lib/qa-safety.cjs';
import { assessGradientContrast } from './lib/qa-contrast-gradient.mjs';
const { assertLocalQaTarget, assertQaEnvironment, launchQaBrowser } = qaSafety;
const { chromium } = createRequire(import.meta.url)('playwright-core');
const base = assertLocalQaTarget(process.env.BASE_URL || 'http://127.0.0.1:3100');
assertQaEnvironment();
const contrastOnly = process.env.QA_CONTRAST_ONLY === '1';
if (contrastOnly) assert(process.env.QA_ROUTES, 'Contrast-only QA requires explicit QA_ROUTES');
const runLabel = process.env.QA_RUN_LABEL || '';
if (runLabel && !/^[a-z0-9][a-z0-9-]{0,63}$/.test(runLabel)) throw new Error('QA_RUN_LABEL must be a short lowercase name without paths.');
const output = path.resolve('.artifacts/experience-qa', runLabel || (contrastOnly ? 'contrast' : '.'));
const routes = process.env.QA_ROUTES?.split(',') || ['/calc', '/calc/refinance-break-even', '/calc/advertising-profit-roas', '/', '/en', '/home-loan', '/year-end-tax', '/calc/samsung-bonus', '/calc/jeonse-loan', '/calc/year-end-bonus-tax', '/savings-interest-2026', '/tools/finance/compound', '/money-check'];
const report = [];
const interactionReport = [];
const errors = [];
const expected = Number(process.env.QA_CALC_COUNT || 202);
const participationMode = process.env.QA_PARTICIPATION_MODE || '';
if (!['', 'off', 'fixtures'].includes(participationMode)) throw new Error('QA_PARTICIPATION_MODE must be off or fixtures.');
const participationTargets = {
  '/calc/samsung-bonus': 'samsung_bonus',
  '/civil-servant-pay-2027': 'civil_pay_2027',
  '/salary-db/samsung-electronics': 'samsung_company',
};

// In-memory responses only. The normal transport guard still rejects every POST.
// Exact loopback paths are intercepted before network; all other fetches retain
// the original guarded transport. Never add a remote origin or product switch.
function installParticipationFixtures() {
  const original = window.fetch.bind(window);
  const summaries = {
    nine: { ok: true, visible: true, total: 9, helpful: 8, confusing: 1, windowDays: 28 },
    mismatch: { ok: true, visible: true, total: 10, helpful: 8, confusing: 1, windowDays: 28 },
    ten: { ok: true, visible: true, total: 10, helpful: 7, confusing: 3, windowDays: 28 },
  };
  const fixture = { calls: [], reactions: [], opinions: [], summaryMode: sessionStorage.getItem('qa:participation:summary') || 'nine' };
  window.__QA_PARTICIPATION__ = fixture;
  window.fetch = async (input, options = {}) => {
    const url = new URL(input instanceof Request ? input.url : String(input), location.href);
    const method = options.method || (input instanceof Request ? input.method : 'GET');
    const isSummary = url.pathname === '/api/participation/summary' && method === 'GET';
    const kind = url.pathname === '/api/participation/reactions' ? 'reactions' : url.pathname === '/api/participation/opinions' ? 'opinions' : null;
    if (url.origin !== location.origin || (!isSummary && (!kind || method !== 'POST'))) return original(input, options);
    const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
    if (isSummary) {
      fixture.calls.push({ kind: 'summary' });
      return fixture.summaryMode === 'unavailable' ? json({ ok: false, error: 'UNAVAILABLE' }, 503) : json(summaries[fixture.summaryMode] || summaries.nine);
    }
    const body = JSON.parse(options.body);
    fixture.calls.push({ kind, body });
    const mode = fixture[kind].shift() || 'success';
    if (mode === 'network') throw new TypeError('Synthetic offline response');
    if (mode === 'rate') return json({ ok: false, error: 'RATE_LIMITED' }, 429);
    if (mode === 'reject') return json({ ok: false, error: 'CONTENT_NOT_ALLOWED' }, 400);
    if (mode === 'invalid') return json({ ok: true, receiptId: '11111111-1111-4111-8111-111111111111', duplicate: false });
    return json({ ok: true, receiptId: body.submissionId, duplicate: false }, 201);
  };
}

async function auditParticipation(page, route, theme, networkRequests) {
  const target = participationTargets[route];
  const section = page.locator(`section[aria-labelledby="private-feedback-${target}"]`);
  await section.waitFor();
  const reaction = section.locator(':scope > form');
  const send = reaction.getByRole('button', { name: '의견 보내기', exact: true });
  if (participationMode === 'off') {
    assert.equal(await section.getByText('짧은 의견 비공개로 보내기', { exact: true }).count(), 0);
    assert.equal(await section.getByText(/최근 28일의 공개 집계/).count(), 0);
    assert(await reaction.getByRole('checkbox', { name: /의견 접수를 위한 위 정보/ }).count());
    await reaction.getByRole('button', { name: '도움 됐어요', exact: true }).click();
    assert(await send.isDisabled());
    assert.equal(networkRequests.length, 0, 'default-off participation sends no API requests');
    report.push({ route, theme, participation: 'public reactions/opinions default off; consent required' });
    return;
  }
  const full = route === '/calc/samsung-bonus' && theme === 'light';
  const calls = kind => page.evaluate(kind => window.__QA_PARTICIPATION__.calls.filter(call => call.kind === kind), kind);
  await reaction.getByRole('button', { name: '헷갈려요', exact: true }).click();
  assert(await send.isDisabled());
  await reaction.getByRole('checkbox', { name: /위 정보의 수집·이용과 반응 건수/ }).check();
  assert(await send.isDisabled(), 'reason is required after consent');
  assert.equal((await calls('reactions')).length, 0);
  await reaction.getByRole('radio').first().check();
  if (full) await page.evaluate(() => { window.__QA_PARTICIPATION__.reactions = ['rate', 'network', 'invalid', 'success']; });
  await send.click();
  if (full) {
    for (const expectedError of ['짧은 시간', '연결이 끊기거나', '저장 완료를 확인하지']) {
      await reaction.getByRole('alert').filter({ hasText: expectedError }).waitFor();
      assert.equal(await section.getByRole('heading', { name: '선택한 반응이 접수되었습니다', exact: true }).count(), 0);
      await reaction.getByRole('button', { name: '같은 의견으로 다시 확인', exact: true }).click();
    }
  }
  await section.getByRole('heading', { name: '선택한 반응이 접수되었습니다', exact: true }).waitFor();
  const reactions = await calls('reactions');
  assert.equal(new Set(reactions.map(call => call.body.submissionId)).size, 1, 'uncertain reaction retries retain one UUID');
  assert.equal(reactions.length, full ? 4 : 1);
  assert.deepEqual(Object.keys(reactions[0].body).sort(), ['submissionId', 'target', 'vote', 'reason', 'contractVersion', 'publicAggregateConsent'].sort());
  assert.equal(reactions[0].body.target, target);
  assert.equal(reactions[0].body.publicAggregateConsent, true);

  await section.getByText('짧은 의견 비공개로 보내기', { exact: true }).click();
  const opinion = section.locator('textarea').locator('xpath=ancestor::form[1]');
  const body = opinion.getByRole('textbox', { name: '개선 의견 · 최대 200자', exact: true });
  const opinionSend = opinion.getByRole('button', { name: '비공개 의견 보내기', exact: true });
  const opinionAudit = await page.evaluate(auditPage);
  const opinionField = opinionAudit.inputs.find(input => input.name === `private-opinion-${target}`);
  assert(opinionField && (opinionField.ratio === null || opinionField.ratio >= 4.5), `${theme} opinion field contrast`);
  await body.fill('설명이 부족해서 계산 기준을 찾기 어렵습니다.');
  assert(await opinionSend.isDisabled());
  await opinion.getByRole('checkbox', { name: /위 정보의 비공개 수집·이용/ }).check();
  if (full) {
    await body.fill('이 계산기는 씨발 틀렸어요');
    assert.equal(await body.getAttribute('aria-invalid'), 'true');
    assert(await opinionSend.isDisabled());
    assert.equal((await calls('opinions')).length, 0);
    for (const text of ['설명이 부족합니다. 개선해 주세요.', '이 문제가 시발점입니다.', '직계비속 공제 설명이 부족합니다.', '보험 계산 근거를 알려주세요.']) {
      await body.fill(text);
      assert.equal(await body.getAttribute('aria-invalid'), 'false', text);
      assert(!(await opinionSend.isDisabled()), text);
    }
    await body.fill('가'.repeat(201));
    assert.equal((await body.inputValue()).length, 200);
    await body.fill('보험 계산 근거를 알려주세요.');
    await body.dispatchEvent('compositionstart', { data: '가' });
    assert(await opinionSend.isDisabled());
    await opinion.evaluate(form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    assert.equal((await calls('opinions')).length, 0, 'IME composition prevents even form submit');
    await body.dispatchEvent('compositionend', { data: '가' });
    await page.evaluate(() => { window.__QA_PARTICIPATION__.opinions = ['reject', 'rate', 'network', 'invalid', 'success']; });
    await opinionSend.click();
    await opinion.getByRole('alert').filter({ hasText: '내용이 접수되지 않았습니다' }).waitFor();
    assert(!(await body.isDisabled()), 'definitive content rejection stays editable');
    assert.equal(await section.getByText('의견이 비공개로 접수되었습니다.', { exact: false }).count(), 0);
    await body.fill('보험 계산 방식에 대한 설명을 추가해 주세요.');
    await opinionSend.click();
    for (const expectedError of ['접수 한도', '연결이 끊겨', '저장 완료를 확인하지']) {
      await opinion.getByRole('alert').filter({ hasText: expectedError }).waitFor();
      assert.equal(await section.getByText('의견이 비공개로 접수되었습니다.', { exact: false }).count(), 0);
      await opinion.getByRole('button', { name: '같은 의견으로 다시 확인', exact: true }).click();
    }
  } else await opinionSend.click();
  await section.getByText('의견이 비공개로 접수되었습니다.', { exact: false }).waitFor();
  const opinions = await calls('opinions');
  assert.equal(opinions.length, full ? 5 : 1);
  assert.equal(new Set(opinions.slice(full ? 1 : 0).map(call => call.body.submissionId)).size, 1);
  if (full) assert.notEqual(opinions[0].body.submissionId, opinions[1].body.submissionId, 'corrected content has a new attempt ID');

  for (const summary of full ? ['nine', 'mismatch', 'unavailable', 'ten'] : ['ten']) {
    await page.evaluate(value => sessionStorage.setItem('qa:participation:summary', value), summary);
    await page.reload({ waitUntil: 'networkidle' });
    if (summary === 'ten') {
      await section.getByText('최근 28일 응답 10건', { exact: true }).waitFor();
      assert(await section.getByText('도움 됐어요 7건 · 헷갈려요 3건', { exact: true }).isVisible());
      assert(await section.getByText(/고유 참여자 수나 전체 이용자의 만족도를 뜻하지/).isVisible());
    } else {
      await section.getByText(/최근 28일의 공개 집계/).waitFor();
      assert.equal(await section.getByText(/최근 28일 응답 \d+건/).count(), 0, summary);
    }
  }
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await section.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `participation-${target}-${theme}-${width}.png`) });
  }
  report.push({ route, theme, participation: full ? 'full consent/retry/receipt/moderation/IME/summary fixture matrix' : 'reaction/opinion receipt and threshold summary smoke', transport: 'in-memory synthetic responses; real POST remains blocked' });
  assert.equal(networkRequests.length, 0, 'participation fixtures never reach network transport');
}

async function auditContactInput(page, theme) {
  const body = page.locator('#inquiry-body');
  const form = body.locator('xpath=ancestor::form[1]');
  const send = form.getByRole('button', { name: '운영자에게 비공개로 보내기', exact: true });
  const attempts = [];
  const onRequest = request => { if (new URL(request.url()).pathname === '/api/contact') attempts.push(1); };
  page.on('request', onRequest);
  await form.getByRole('checkbox', { name: /필수.*문의 접수를 위한/ }).check();
  await body.fill('씨발 계산이 틀렸어요');
  assert(await send.isDisabled());
  for (const text of ['설명이 불친절합니다. 개선해 주세요.', '이 문제의 시발점을 알려주세요.', '직계비속 보험 공제 설명이 필요합니다.']) {
    await body.fill(text);
    assert(!(await send.isDisabled()), text);
  }
  await body.dispatchEvent('compositionstart', { data: '가' });
  assert(await send.isDisabled());
  await form.evaluate(form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  assert.equal(attempts.length, 0, 'contact IME submit cannot reach transport');
  await body.dispatchEvent('compositionend', { data: '가' });
  assert(!(await send.isDisabled()));
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  page.off('request', onRequest);
  report.push({ route: '/contact', theme, contactInput: 'abuse blocked, ordinary criticism/financial words accepted, IME submit blocked; no POST performed' });
}

// Runs only when the explicit source routes are selected. The enclosing context
// is created by launchQaBrowser; all navigation remains on the guarded loopback.
async function auditCivilPayHandoff(page, sourceRoute, theme) {
  const occupation = sourceRoute === '/firefighter-pay-2026' ? 'fire' : 'police';
  const label = occupation === 'fire' ? '소방교' : '경장';
  const choice = page.getByRole('button', { name: `2026년 ${label} 3호봉 조건으로 실수령액 계산`, exact: true });
  const cell = await choice.boundingBox();
  assert(cell && cell.height >= 44 && cell.width >= 44, 'mobile selection target');
  await choice.focus();
  await choice.press('Enter');
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible' });
  assert.equal(new URL(page.url()).pathname, '/calc/civil-servant-net-pay');
  assert.equal(new URL(page.url()).search + new URL(page.url()).hash, '', 'selection is not in the URL');
  assert((await dialog.innerText()).includes(`2026년 ${label} 3호봉`));
  assert((await dialog.innerText()).includes('재직연수는 호봉으로 추정하지 않습니다'));
  assert.equal(await page.locator('#civ-rank').inputValue(), '1');
  assert.equal(await page.locator('#civ-hobong').inputValue(), '3');
  assert.equal(await page.evaluate(() => sessionStorage.getItem('moneysalary:civil-pay-handoff:v1')), null);
  await page.screenshot({ path: path.join(output, `civil-handoff-${occupation}-${theme}.png`) });
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'civ-years');
  await page.locator('#civ-years').selectOption('5');
  const reopen = page.getByRole('button', { name: '급여 가정 확인', exact: true });
  assert(await reopen.isVisible(), 'editing does not bypass confirmation');
  const pendingHeight = await page.locator('[data-civ-block="result"]').evaluate(element => element.getBoundingClientRect().height);
  await reopen.click();
  await dialog.waitFor({ state: 'visible' });
  assert((await dialog.innerText()).includes('재직 5~6년'));
  await dialog.getByRole('button', { name: '이 가정으로 결과 확인', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(await reopen.count(), 0);
  assert.equal(await page.locator('[data-civ-block="result"]').evaluate(element => element.getBoundingClientRect().height), pendingHeight);
  assert((await page.locator('[data-civ-block="result"]').innerText()).includes('2,290,400원'));
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('dialog[open]').count(), 0, 'consumed selection is not restored');
  await page.goto(`${base}/calc/civil-servant-net-pay#${occupation}`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#civ-rank').inputValue(), '0');
  assert.equal(await page.locator('#civ-hobong').inputValue(), '1');
  assert(await page.locator(`#civ-kind-${occupation}`).getAttribute('aria-pressed') === 'true');
  report.push({ route: sourceRoute, theme, civilHandoff: 'pass', analytics: 'disabled in QA; confirmation gate tested offline' });
}

async function auditPensionHike(page, theme) {
  const salary = page.getByRole('textbox', { name: '월급', exact: true });
  const result = page.getByRole('region', { name: '국민연금 보험료 계산 결과', exact: true });
  await salary.focus();
  await salary.press('ControlOrMeta+A');
  await salary.press('Backspace');
  assert.equal(await salary.inputValue(), '');
  for (const value of ['', '0']) {
    if (value) await salary.pressSequentially(value);
    assert.equal(await salary.getAttribute('aria-invalid'), 'true');
    const text = await result.innerText();
    assert(text.includes('입력 대기'), `${theme} ${value || 'blank'} awaits valid input`);
    assert(!/\d[\d,]*원/.test(text), `${theme} invalid input shows no stale money result`);
  }
  await salary.press('ControlOrMeta+A');
  await salary.pressSequentially('3500000');
  assert.equal(await salary.inputValue(), '3,500,000');
  assert.equal(await salary.getAttribute('aria-invalid'), 'false');
  assert(await result.getByText('+8,750원', { exact: true }).isVisible());
  assert((await result.innerText()).includes('+105,000원'));
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${theme} pension overflow at ${width}px`);
    await result.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `pension-hike-${theme}-${width}.png`) });
  }
  report.push({ route: '/calc/pension-hike-2027', theme, pensionHike: 'blank/zero wait; keyboard 3500000 -> 8750; mobile pass', analytics: 'disabled in QA' });
}


// Solid colors are measured in-page. Gradient paint evidence is evaluated by
// the offline interval calculator; screenshots never replace numeric evidence.
function auditPage({ strict = false, selector = 'main *' } = {}) {
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
  const inputs = [...document.querySelectorAll('input:not([type="hidden"]):not([type="range"]):not([type="radio"]):not([type="checkbox"]),textarea')].filter(visible).map(element => ({
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
    for (const element of document.querySelectorAll(selector)) {
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
        chain.push(Object.fromEntries(['backgroundColor', 'backgroundImage', 'backgroundClip', 'backgroundBlendMode',
          'backgroundSize', 'backgroundRepeat', 'backgroundPosition', 'opacity', 'filter', 'backdropFilter', 'mixBlendMode',
          'webkitTextFillColor', 'webkitTextStrokeWidth', 'maskImage', 'clipPath'].map(key => [key, currentStyle[key]])));
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
      if (reason) { unassessed.push({ ...record, reason, layers: chain }); continue; }
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

function resolveGradientEvidence(audit) {
  const remaining = [];
  for (const record of audit.unassessed) {
    if (record.reason !== 'background-image-or-gradient') { remaining.push(record); continue; }
    const result = assessGradientContrast(record);
    if (result.status === 'unassessed') { remaining.push({ ...record, gradientAssessment: result }); continue; }
    audit.measurements.push({ ...record, reason: undefined, gradientAssessment: result,
      ratio: result.ratio, pass: result.pass, method: result.method });
  }
  audit.unassessed = remaining;
  audit.lowContrast = audit.measurements.filter(item => !item.pass);
  audit.coverage = { measured: audit.measurements.length, passed: audit.measurements.length - audit.lowContrast.length,
    failed: audit.lowContrast.length, unassessed: remaining.length, excluded: audit.excluded.length };
  return audit;
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
        const heroLayout = route.startsWith('/table/')
          ? await page.getByRole('heading', { level: 1, name: /^202[67] 월급 실수령액/ }).evaluate(heading => {
            const hero = heading.closest('section');
            const description = hero?.querySelector('.ms-description');
            const tableWrapper = hero?.nextElementSibling;
            if (!description || !tableWrapper?.matches('.page-width') || !tableWrapper.querySelector('table')) return null;
            const descriptionBottom = description.getBoundingClientRect().bottom;
            const tableTop = tableWrapper.getBoundingClientRect().top;
            return { descriptionBottom, tableTop, gap: tableTop - descriptionBottom };
          }) : undefined;
        if (route.startsWith('/table/')) {
          assert(heroLayout, 'Monthly hero and salary table geometry must be inspectable');
          assert(heroLayout.gap >= 0, `${route}: salary table overlaps the hero description by ${-heroLayout.gap}px`);
        }
        const audit = resolveGradientEvidence(await page.evaluate(auditPage, { strict: true }));
        const screenshots = [];
        report.push({ route, theme, width, ...audit, ...(heroLayout ? { heroLayout } : {}), screenshots });
        const sections = route.startsWith('/table/')
          ? [{ label: 'hero', heading: /^202[67] 월급 실수령액/, level: 1 }, { label: 'intro', heading: /^202[67]년 월급/ }, { label: 'faq', heading: /^자주 묻는 질문$/ }]
          : route.startsWith('/job/')
            ? [{ label: 'career', heading: /^경력별 평균 연봉$/ }, { label: 'official', heading: /^정부 (공식 통계|발표)로 보는/ }, { label: 'calculator', heading: /^세후 실수령액 바로 계산$/ }]
            : [];
        for (const { label, heading, level = 2 } of sections) {
          const title = page.getByRole('heading', { level, name: heading });
          if (!await title.count()) continue;
          const panel = title.first().locator('xpath=ancestor::section[1]');
          const filename = `${route.replaceAll('/', '_')}-${theme}-${width}-${label}.png`;
          // Scope screenshots to the explanation/FAQ/card, never the long table.
          await panel.screenshot({ path: path.join(output, filename), animations: 'disabled' });
          screenshots.push(filename);
        }
        if (route.startsWith('/job/')) {
          const panel = page.getByRole('heading', { level: 2, name: '세후 실수령액 바로 계산', exact: true }).locator('xpath=ancestor::section[1]');
          const links = panel.locator('a');
          assert.equal(await links.count(), 3, 'Expected three calculator links');
          for (let index = 0; index < 3; index++) {
            const link = links.nth(index);
            for (const state of ['hover', 'focus']) {
              await page.mouse.move(0, 0);
              if (state === 'hover') await link.hover();
              else {
                await page.keyboard.press('Tab');
                await link.focus();
                assert(await link.evaluate(el => el.matches(':focus-visible')), 'Keyboard focus must be visible');
              }
              await link.evaluate(async el => { await Promise.allSettled(el.getAnimations().map(animation => animation.finished)); });
              const selector = state === 'hover' ? 'main a:hover' : 'main a:focus';
              const stateAudit = resolveGradientEvidence(await page.evaluate(auditPage, { strict: true, selector }));
              assert.equal(stateAudit.coverage.measured + stateAudit.coverage.unassessed, 1, 'Interaction must inspect exactly the targeted link');
              interactionReport.push({ route, theme, width, index, state, ...stateAudit });
              await link.evaluate(el => el.blur());
            }
          }
          await page.mouse.move(0, 0);
        }
        console.log(`${theme} ${width}px ${route}: ${audit.coverage.measured} measured, ${audit.lowContrast.length} failed, ${audit.unassessed.length} unassessed`);
      }
    } finally { await context.close(); }
  }
  assert(report.every(item => item.coverage.measured > 0), 'Contrast coverage must not be empty');
  assert(report.every(item => !item.overflow), 'Contrast target horizontal overflow');
  const allCases = [...report, ...interactionReport];
  assert.equal(allCases.reduce((sum, item) => sum + item.unassessed.length, 0), 0, 'Strict contrast coverage includes unassessed paint');
  assert.equal(allCases.reduce((sum, item) => sum + item.lowContrast.length, 0), 0, 'Text contrast is below threshold or cannot be guaranteed across the full gradient');
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
    if (participationMode === 'fixtures') await context.addInitScript(installParticipationFixtures);
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const participationNetworkRequests = [];
    page.on('request', request => {
      const url = new URL(request.url());
      if (url.origin === base && url.pathname.startsWith('/api/participation/')) participationNetworkRequests.push(url.pathname);
    });
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
      if (process.env.QA_ROUTES && ['/firefighter-pay-2026', '/police-pay-2026'].includes(route)) {
        await auditCivilPayHandoff(page, route, theme);
      }
      if (route === '/calc/pension-hike-2027') await auditPensionHike(page, theme);
      if (participationMode && participationTargets[route]) await auditParticipation(page, route, theme, participationNetworkRequests);
      if (route === '/contact') await auditContactInput(page, theme);
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
  if (participationMode === 'fixtures') await context.addInitScript(installParticipationFixtures);
  const page = await context.newPage();
  await page.goto(base + (routes[0] || '/calc'), { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '라이트 모드 (다크로 전환)', exact: true }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.classList.contains('dark'));
  await page.getByRole('button', { name: '다크 모드 (라이트로 전환)', exact: true }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.documentElement.classList.contains('dark'));
  await context.close();
  assert.deepEqual(errors, []);
  }
} finally {
  await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify({ mode: contrastOnly ? 'contrast-only' : 'experience', report, interactionReport, errors }, null, 2));
  await browser.close();
}
console.log(contrastOnly
  ? `PASS: ${report.length} contrast cases and ${interactionReport.length} hover/focus cases; all measured or conservatively bounded above threshold; no unassessed paint.`
  : `PASS: ${report.length} theme/page cases, directory links, grouped fields and theme persistence.`);
