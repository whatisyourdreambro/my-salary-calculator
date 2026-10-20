// Maintained, loopback-only interaction QA. No real submissions, ad requests or telemetry.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import qaSafety from './lib/qa-safety.cjs';
import { collectInteractionText, assessInteractionText } from './lib/qa-interaction-evidence.mjs';

const { assertLocalQaTarget, assertQaEnvironment, launchQaBrowser, isAllowedQaRequest } = qaSafety;
const { chromium } = createRequire(import.meta.url)('playwright-core');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUTPUT = path.join(ROOT, '.artifacts/interaction-states-qa');

export async function main() {
  const base = assertLocalQaTarget(process.env.BASE_URL || 'http://127.0.0.1:3320');
  assertQaEnvironment();
  const selected = process.env.QA_INTERACTION_CASES?.split(',').filter(Boolean);
  const report = { version: 1, base, startedAt: new Date().toISOString(), passed: false,
    scope: 'Shared and distinct result/error renderers; four modal and three native radio families. Browser semantics and computed text contrast, not a screen-reader listening test or whole-site WCAG certification.',
    selectedCases: selected || null, completeMatrix: !selected, cases: [], documents: [],
    pageErrors: [], consoleErrors: [], forbiddenRequests: [], externalResponses: [], syntheticContactResponses: [] };
  await mkdir(OUTPUT, { recursive: true });
  let browser;
  let page;
  let item;
  async function open(route) {
    const response = await page.goto(base + route, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 200, route);
    assert.equal(response.headers()['x-moneysalary-qa'], 'ads-disabled');
    report.documents.push({ route, width: item.width, theme: item.theme, buildId: response.headers()['x-moneysalary-build'] || null });
    assert.equal(await page.locator('#msy-ga-loader,#msy-adsense-loader,ins.adsbygoogle').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), item.theme === 'dark');
  }
  async function tabTo(target) {
    await target.waitFor({ state: 'visible' });
    for (let n = 0; n < 200; n++) {
      if (await target.evaluate(el => el === document.activeElement)) { item.keyboardTabs += n; return; }
      await page.keyboard.press('Tab');
    }
    throw new Error('Target could not be reached with Tab: ' + await target.evaluate(el => el.outerHTML.slice(0, 250)));
  }
  async function text(selector, state) {
    const evidence = assessInteractionText(await page.evaluate(collectInteractionText, { selector }));
    item.text.push({ state, ...evidence });
    assert.deepEqual(evidence.issues, [], `${state}: complete collection required`);
    assert(evidence.counts.total > 0, `${state}: visible text required`);
    assert.equal(evidence.counts.failed, 0, `${state}: text contrast failed`);
    assert.equal(evidence.counts.unassessed, 0, `${state}: unsupported paint requires review`);
  }
  async function linkedError(input) {
    assert.equal(await input.getAttribute('aria-invalid'), 'true');
    const relation = await input.evaluate(el => ({ ids: (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean).map(id => ({ id, text: document.getElementById(id)?.textContent?.trim() || '', exists: !!document.getElementById(id) })) }));
    assert(relation.ids.length && relation.ids.every(x => x.exists && x.text));
    item.relationships.push(relation);
  }
  async function announcement(kind, expectedText) {
    const status = page.locator(`[data-calculation-announcement="${kind}"]`);
    await page.waitForFunction(({ kind, expectedText }) => {
      const value = document.querySelector(`[data-calculation-announcement="${kind}"]`)?.textContent?.trim();
      return value && (!expectedText || value.includes(expectedText));
    }, { kind, expectedText });
    assert.equal(await status.getAttribute('role'), 'status');
    assert.equal(await status.getAttribute('aria-live'), 'polite');
    assert.equal(await status.getAttribute('aria-atomic'), 'true');
    const value = (await status.textContent()).trim();
    assert(!/NaN|Infinity/.test(value));
    item.announcements.push({ kind, value });
    return value;
  }
  async function radioGroup(group, name) {
    const radios = group.locator('input[type=radio]');
    const count = await radios.count(); assert(count >= 2);
    let current = await radios.evaluateAll(els => els.findIndex(el => el.checked));
    await tabTo(radios.nth(current < 0 ? 0 : current));
    if (current < 0) { await page.keyboard.press('Space'); current = 0; }
    const keys = [];
    for (const key of [...Array(count).fill('ArrowRight'), 'ArrowDown', 'ArrowLeft', 'ArrowUp']) {
      current = (current + (key === 'ArrowRight' || key === 'ArrowDown' ? 1 : count - 1)) % count;
      await page.keyboard.press(key);
      assert.equal(await radios.nth(current).isChecked(), true, `${name}: ${key}`);
      assert.equal(await radios.nth(current).evaluate(el => el === document.activeElement), true);
      assert.equal(await radios.evaluateAll(els => els.filter(el => el.checked).length), 1);
      keys.push({ key, checkedIndex: current });
    }
    await page.keyboard.press('Tab');
    assert.equal(await radios.evaluateAll(els => els.includes(document.activeElement)), false, 'One Tab stop per radio group');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await radios.nth(current).evaluate(el => el === document.activeElement), true, 'Return to selected radio');
    item.radios.push({ name, count, keys, singleTabStop: true });
  }
  async function modal(dialog, opener, { nestedShortcut = true } = {}) {
    await dialog.waitFor({ state: 'visible' });
    await page.waitForFunction(() => !!document.activeElement?.closest('dialog[open],[role="dialog"][aria-modal="true"]'));
    assert.equal(await dialog.evaluate(el => el.contains(document.activeElement)), true, 'Initial focus belongs to this modal');
    const semantics = await dialog.evaluate(el => ({ native: el.tagName === 'DIALOG', modal: el.matches(':modal'), ariaModal: el.getAttribute('aria-modal'), label: el.getAttribute('aria-label'), labelledby: el.getAttribute('aria-labelledby') }));
    assert(semantics.modal || semantics.ariaModal === 'true');
    const controls = await dialog.locator('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]').count();
    for (const key of [...Array(controls + 2).fill('Tab'), ...Array(controls + 2).fill('Shift+Tab')]) {
      await page.keyboard.press(key);
      assert.equal(await dialog.evaluate(el => el.contains(document.activeElement)), true, 'Modal contains keyboard focus');
    }
    if (nestedShortcut) {
      await page.keyboard.press('Control+k');
      assert.equal(await page.locator('dialog[open],[role="dialog"][aria-modal="true"]').count(), 1, 'Shortcut cannot open a competing modal');
      assert.equal(await dialog.evaluate(el => el.contains(document.activeElement)), true);
    }
    item.modals.push({ ...semantics, controls, forwardAndReverseContainment: true });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    await page.waitForFunction(() => !document.querySelector('dialog[open],[role="dialog"][aria-modal="true"]'));
    item.modals.at(-1).restoredFocus = await opener.evaluate(el => ({ restored: el === document.activeElement, active: document.activeElement?.outerHTML.slice(0, 300) }));
    assert.equal(item.modals.at(-1).restoredFocus.restored, true, 'Escape restores opener focus');
    assert.equal(await opener.evaluate(el => !!el.closest('[inert]')), false, 'Background inert state restored');
  }
  const scenarios = {
    async salary() {
      await open('/');
      const input = page.getByRole('textbox', { name: '계약 연봉', exact: true });
      const calculate = page.getByRole('button', { name: '결과 확인하기', exact: true });
      await input.fill('0'); await tabTo(calculate); await page.keyboard.press('Enter');
      await page.locator('#salary-invalid-hint').waitFor(); await linkedError(input);
      await text('#salary-invalid-hint', 'invalid salary');
      const firstError = await page.locator('#salary-invalid-hint').elementHandle();
      const firstMessage = await firstError.textContent();
      await page.keyboard.press('Enter'); // Submit the same invalid value without changing focus/input.
      await page.waitForFunction(first => !first.isConnected, firstError);
      assert.equal(await page.locator('#salary-invalid-hint[role="alert"]').count(), 1);
      assert.equal(await page.locator('#salary-invalid-hint').textContent(), firstMessage);
      assert.equal(await calculate.evaluate(el => el === document.activeElement), true);
      assert.equal(await page.locator('#calculation-result').count(), 0);
      await linkedError(input);
      item.repeatedInvalidSubmission = { notificationRenewed: true, singleAlert: true, focusPreserved: true };
      await firstError.dispose();
      await input.fill('50000000'); await tabTo(calculate); await page.keyboard.press('Enter');
      assert.equal(await page.locator('#salary-invalid-hint').count(), 0);
      await page.waitForFunction(() => !!document.activeElement?.closest('#calculation-result'));
      await page.locator('#calculation-result').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1100); // finite result animation, not repeated announcements
      await text('#calculation-result', 'current salary result');
      item.resultFocus = await page.evaluate(() => ({ tag: document.activeElement.tagName, text: document.activeElement.textContent.slice(0, 120) }));
      await input.fill('60000000');
      const stale = page.getByRole('status').filter({ hasText: '아래는 이전 계산 결과입니다' });
      await stale.waitFor();
      assert((await stale.textContent()).includes('다시 계산'));
      await text('#calculation-result', 'stale result visibly identified');
    },
    async sheet() {
      await open('/');
      const opener = page.getByRole('button', { name: /^비과세 / });
      await tabTo(opener); await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog', { name: '비과세액 설정' });
      await dialog.waitFor(); await page.waitForTimeout(400);
      await dialog.getByRole('textbox', { name: '월 비과세액', exact: true }).fill('999999999');
      await linkedError(dialog.getByRole('textbox', { name: '월 비과세액', exact: true }));
      await text('[role="dialog"][aria-modal="true"]', 'sheet with invalid amount');
      await modal(dialog, opener);
      await page.keyboard.press('Enter'); await dialog.waitFor();
      const close = dialog.getByRole('button', { name: '닫기', exact: true });
      await tabTo(close); await page.keyboard.press('Enter'); await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.evaluate(el => el === document.activeElement), true);
    },
    async simple() {
      await open('/calc/refinance-break-even');
      const result = 'section[aria-label="현재 조건의 계산 결과"]';
      await announcement('simple'); await text(result, 'current shared calculator result');
      const input = page.locator('main input').filter({ visible: true }).first();
      const original = await input.inputValue(); await input.fill('');
      await linkedError(input); await text(`${result},main [aria-invalid="true"] ~ p`, 'invalid shared calculator');
      assert((await page.locator(result).textContent()).includes('입력값 확인'));
      assert.equal((await page.locator('[data-calculation-announcement="simple"]').textContent()).trim(), '');
      await input.fill(original); await announcement('simple');
    },
    async english() {
      await open('/en/tools/loan'); await announcement('english-tool');
      await text('[data-english-tool-result]', 'English result');
      const input = page.locator('#english-tool-months'); await input.fill('0');
      await linkedError(input); await text('#english-tool-months-error, [data-english-tool] > [role="status"]:not(.sr-only)', 'English invalid term');
      assert.equal(await page.locator('[data-english-tool-result]').count(), 0);
      await input.fill('600'); await page.locator('#english-tool-annualRate').fill('0');
      await announcement('english-tool'); await text('[data-english-tool-result]', 'English zero-interest result');
      await input.fill('12'); await page.locator('#english-tool-principal').fill('12000');
      await announcement('english-tool', '1,000');
    },
    async loan() {
      await open('/tools/loan'); await announcement('loan');
      await radioGroup(page.getByRole('group', { name: '상환 방식', exact: true }), 'loan repayment');
      const input = page.locator('#loan-term');
      for (const value of ['0', '51']) { await input.fill(value); await linkedError(input); await page.locator('#loan-input-error').waitFor(); }
      await text('#loan-input-error', 'invalid loan term');
      await input.fill('50'); await page.locator('#loan-rate').fill('0'); await announcement('loan', '100,000,000');
      await text('[data-calculation-result="loan"]', 'loan zero-interest result');
    },
    async deposit() {
      await open('/tools/deposit'); await announcement('deposit');
      await radioGroup(page.getByRole('group', { name: '저축 방식', exact: true }), 'deposit saving type');
      await radioGroup(page.getByRole('group', { name: '과세 구분', exact: true }), 'deposit tax type');
      const input = page.locator('#deposit-term');
      for (const value of ['0', '601']) { await input.fill(value); await linkedError(input); await page.locator('#deposit-input-error').waitFor(); }
      await text('#deposit-input-error', 'invalid deposit term');
      await input.fill('600'); await page.locator('#deposit-rate').fill('0'); await page.locator('#deposit-amount').fill('1000');
      await announcement('deposit', '600,000');
      await text('[data-calculation-result="deposit"]', 'deposit zero-interest result');
    },
    async health() {
      await open('/health-insurance-dependent');
      await radioGroup(page.locator('fieldset').filter({ has: page.locator('input[name="relationship"]') }), 'dependent relationship');
      const radios = page.locator('input[name="relationship"]');
      await tabTo(page.locator('input[name="relationship"]:checked'));
      for (let i = 0; i < 5 && !await radios.nth(3).isChecked(); i++) await page.keyboard.press('ArrowRight');
      assert.equal(await radios.nth(3).isChecked(), true);
      await radioGroup(page.locator('fieldset').filter({ has: page.locator('input[name="siblingException"]') }), 'sibling exception');
      await radioGroup(page.locator('fieldset').filter({ has: page.locator('input[name="bizReg"]') }), 'business registration');
      await text('main fieldset', 'native radio labels and selected options');
    },
    async feedback() {
      await open('/calc/samsung-bonus');
      const openReasons = page.getByRole('button', { name: '헷갈려요', exact: true });
      await tabTo(openReasons); await page.keyboard.press('Enter');
      const group = page.getByRole('group', { name: '가장 가까운 이유 하나를 골라 주세요', exact: true });
      await radioGroup(group, 'private feedback reason');
      await text('fieldset:has(input[type="radio"])', 'feedback reason labels');
      item.noSubmission = true;
    },
    async search() {
      await open('/tools/loan');
      const opener = page.getByRole('button', { name: '검색 열기', exact: true });
      await tabTo(opener); await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog', { name: '사이트 검색', exact: true });
      await dialog.waitFor();
      const input = dialog.getByRole('textbox', { name: '계산기·가이드·용어 검색', exact: true });
      await input.fill('MSY_QA_NO_SEARCH_RESULT');
      await dialog.getByText('검색 결과가 없습니다. 다른 키워드로 검색해 보세요.', { exact: true }).waitFor();
      await text('dialog[open]', 'empty search result');
      await input.fill('연봉'); await page.locator('#site-search-results a').first().waitFor();
      await input.press('ArrowDown');
      assert((await dialog.getByRole('status').textContent()).includes('선택:'));
      await input.press('ArrowUp'); await text('dialog[open]', 'search results and active option');
      await modal(dialog, opener, { nestedShortcut: false });
      await page.keyboard.press('Control+k'); await dialog.waitFor();
      await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.evaluate(el => el === document.activeElement), true, 'Shortcut opener restored');
    },
    async mobileMenu() {
      await open('/tools/loan');
      const opener = page.getByRole('button', { name: '메뉴 열기', exact: true });
      if (item.width === 1280) {
        assert.equal(await opener.isVisible(), false);
        item.applicability = 'Mobile-only menu hidden at desktop width; desktop search tested separately';
        return;
      }
      await tabTo(opener); await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog', { name: '모바일 메뉴', exact: true });
      await dialog.waitFor(); await text('dialog[open]', 'mobile navigation dialog');
      await modal(dialog, opener);
      await page.keyboard.press('Enter'); await dialog.waitFor();
      await tabTo(dialog.getByRole('button', { name: '메뉴 닫기', exact: true }));
      await page.keyboard.press('Enter'); await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.evaluate(el => el === document.activeElement), true);
    },
    async boxing() {
      await open('/fun/salary-battle');
      const opener = page.getByRole('button', { name: 'FIGHT!', exact: true });
      await tabTo(opener); await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog', { name: '연봉 비교 게임', exact: true });
      await dialog.waitFor();
      await text('dialog[open] > button', 'animation skip control');
      await modal(dialog, opener);
      await page.keyboard.press('Enter'); await dialog.waitFor();
      const skip = dialog.getByRole('button', { name: '애니메이션 건너뛰고 결과 보기', exact: true });
      await tabTo(skip); await page.keyboard.press('Enter'); await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Enter'); await dialog.waitFor();
      const completion = dialog.locator('[data-game-announcement="salary-battle"]');
      assert.equal(await completion.count(), 1);
      assert.equal(await completion.getAttribute('role'), 'status');
      assert.equal(await completion.getAttribute('aria-live'), 'polite');
      assert.equal(await completion.getAttribute('aria-atomic'), 'true');
      assert.equal((await completion.textContent()).trim(), '');
      const resultButton = dialog.getByRole('button', { name: '결과 확인하기', exact: true });
      await resultButton.waitFor({ state: 'visible', timeout: 20000 });
      const announced = (await completion.textContent()).trim();
      assert(announced.startsWith('게임이 끝났습니다.'));
      assert(announced.includes('재미용 게임 결과이며 실제 보상 비교 결과와 별개입니다.'));
      assert(announced.includes('결과 확인하기'));
      const winnerName = (await dialog.locator('[data-game-result="salary-battle"] p span').textContent()).trim();
      assert(winnerName && announced.includes(`${winnerName} 승리.`), 'Announcement matches the displayed game winner');
      assert.equal(await dialog.getByRole('status').count(), 1, 'Combat updates must not create competing live regions');
      await page.waitForTimeout(600); // Wait for the finite winner-overlay transition before measuring paint.
      await page.screenshot({ path: path.join(OUTPUT, `boxing-result-${item.width}-${item.theme}.png`) });
      await text('[data-game-result="salary-battle"]', 'completed game result');
      item.announcements.push({ kind: 'salary-battle', value: announced });
      await tabTo(resultButton); await page.keyboard.press('Enter'); await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Enter'); await dialog.waitFor();
      assert.equal((await completion.textContent()).trim(), '', 'A new game must not announce the previous winner');
      await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.evaluate(el => el === document.activeElement), true);
    },
    async contact() {
      await open('/contact');
      const message = 'Local synthetic QA fixture; never submitted.';
      await page.locator('#inquiry-body').fill(message);
      await page.locator('form input[type="checkbox"]').first().check();
      const submit = page.getByRole('button', { name: '운영자에게 비공개로 보내기', exact: true });
      const related = page.locator('#inquiry-page');
      await related.fill('/invalid?fixture'); await tabTo(submit); await page.keyboard.press('Enter');
      await page.locator('form [role="alert"]').waitFor(); await linkedError(related);
      assert.equal(await related.evaluate(el => el === document.activeElement), true);
      await tabTo(submit); await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.activeElement?.id === 'inquiry-page');
      await text('form [role="alert"]', 'invalid contact path');
      await related.fill('/contact');
      await page.locator('#inquiry-body').fill('   '); await tabTo(submit); await page.keyboard.press('Enter');
      await page.locator('form [role="alert"]').waitFor(); await linkedError(page.locator('#inquiry-body'));
      await page.locator('#inquiry-body').fill(message);
      for (const response of [429, 503, 'network-error']) {
        await page.evaluate(value => { window.__MSY_CONTACT_FIXTURE__ = value; }, response);
        await tabTo(submit); await page.keyboard.press('Enter');
        await page.waitForFunction(() => document.querySelector('form fieldset')?.getAttribute('aria-busy') === 'true');
        assert((await page.locator('form [role="status"]').textContent()).includes('접수 확인'));
        await page.evaluate(() => {
          const release = window.__MSY_CONTACT_FIXTURE_RELEASE__;
          if (typeof release !== 'function') throw new Error('Synthetic response release is unavailable');
          delete window.__MSY_CONTACT_FIXTURE_RELEASE__;
          release();
        });
        await page.locator('form [role="alert"]').waitFor();
        await page.waitForFunction(() => !document.querySelector('form fieldset')?.disabled);
        assert.equal(await page.locator('#inquiry-body').inputValue(), message);
        await text('form [role="alert"]', `synthetic contact ${response}`);
      }
      const captures = await page.evaluate(() => window.__MSY_CONTACT_FIXTURE_CALLS__);
      assert.deepEqual(captures, [429, 503, 'network-error']);
      report.syntheticContactResponses.push(...captures); item.noSubmission = true;
    },
    async yearEnd() {
      await open('/year-end-tax'); await announcement('year-end-tax');
      await text('[data-calculation-result="year-end-tax"]', 'year-end result');
      const sliders = page.locator('main input[type="range"]');
      assert(await sliders.count() > 0);
      await tabTo(sliders.first()); const before = await sliders.first().inputValue();
      await page.keyboard.press('ArrowRight'); assert.notEqual(await sliders.first().inputValue(), before);
      await announcement('year-end-tax');
      const prepaid = page.getByRole('textbox', { name: '기납부세액 (간이세액표 추정·수정 가능)', exact: true });
      await prepaid.fill('0'); await announcement('year-end-tax', '예상 추가 납부액');
      await text('[data-calculation-result="year-end-tax"]', 'year-end additional payment');
      await prepaid.fill('10000000'); await announcement('year-end-tax', '예상 환급액');
      await text('[data-calculation-result="year-end-tax"]', 'year-end refund');
    },
  };
  if (selected) assert(selected.every(name => Object.hasOwn(scenarios, name)), 'Unknown scenario filter');
  try {
    browser = await launchQaBrowser(chromium, base, process.platform === 'win32' ? { channel: 'chrome' } : {});
    for (const width of [390, 1280]) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: 'reduce', serviceWorkers: 'block' });
      await context.addInitScript(theme => {
        localStorage.setItem('theme', theme);
        // Intercept only this application endpoint in memory, before it can form
        // a network request. The transport guard still denies every POST.
        const realFetch = window.fetch.bind(window);
        window.__MSY_CONTACT_FIXTURE_CALLS__ = [];
        window.fetch = async (resource, options) => {
          const url = new URL(typeof resource === 'string' ? resource : resource.url, location.href);
          if (url.origin === location.origin && url.pathname === '/api/contact' && options?.method === 'POST') {
            const fixture = window.__MSY_CONTACT_FIXTURE__;
            if (![429, 503, 'network-error'].includes(fixture)) throw new Error('No contact fixture selected; submission prevented');
            window.__MSY_CONTACT_FIXTURE_CALLS__.push(fixture);
            await new Promise(resolve => { window.__MSY_CONTACT_FIXTURE_RELEASE__ = resolve; });
            if (fixture === 'network-error') throw new TypeError('Synthetic offline failure');
            return new Response(JSON.stringify({ ok: false }), { status: fixture, headers: { 'Content-Type': 'application/json' } });
          }
          return realFetch(resource, options);
        };
      }, theme);
      page = await context.newPage(); page.setDefaultTimeout(20000); page.setDefaultNavigationTimeout(60000);
      page.on('pageerror', error => report.pageErrors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
      page.on('request', request => { if (!isAllowedQaRequest(request.url(), base, request.method())) report.forbiddenRequests.push({ url: request.url(), method: request.method() }); });
      page.on('response', response => { if (new URL(response.url()).origin !== base) report.externalResponses.push(response.url()); });
      for (const [name, scenario] of Object.entries(scenarios)) {
        if (selected && !selected.includes(name)) continue;
        item = { name, width, theme, passed: false, keyboardTabs: 0, text: [], radios: [], modals: [], relationships: [], announcements: [] };
        report.cases.push(item);
        try {
          await scenario();
          await page.screenshot({ path: path.join(OUTPUT, `${name}-${width}-${theme}.png`), fullPage: false });
          item.passed = true;
        } catch (error) { item.error = error.stack; }
        console.log(`${name} ${width} ${theme}: ${item.passed ? 'PASS' : item.error.split('\n')[0]}`);
        await writeFile(path.join(OUTPUT, 'report.json'), JSON.stringify(report, null, 2));
      }
      await context.close();
    }
    assert.equal(report.cases.length, (selected?.length || Object.keys(scenarios).length) * 4);
    report.buildIds = [...new Set(report.documents.map(x => x.buildId))];
    report.runtime = report.buildIds.every(id => id === null) ? 'development' : 'pages';
    if (report.runtime === 'pages') {
      assert.equal(report.buildIds.length, 1, 'Every document must use one verified Pages build');
      assert(report.buildIds[0], 'Pages build ID is required on every document');
    }
    assert(report.cases.every(x => x.passed), 'Some interaction scenarios failed; inspect report.json');
    for (const field of ['pageErrors', 'consoleErrors', 'forbiddenRequests', 'externalResponses']) assert.deepEqual(report[field], [], field);
    report.passed = true;
  } finally {
    await browser?.close();
    report.finishedAt = new Date().toISOString();
    report.textCounts = report.cases.flatMap(x => x.text).reduce((sum, x) => {
      for (const key of Object.keys(sum)) sum[key] += x.counts[key] || 0; return sum;
    }, { total: 0, passed: 0, failed: 0, unassessed: 0, excluded: 0 });
    await writeFile(path.join(OUTPUT, 'report.json'), JSON.stringify(report, null, 2));
  }
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => { console.error(error); process.exitCode = 1; });
}
