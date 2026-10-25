// Maintained, loopback-only interaction QA. No real submissions, ad requests or telemetry.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import qaSafety from './lib/qa-safety.cjs';
import { collectInteractionText, assessInteractionText } from './lib/qa-interaction-evidence.mjs';
import { isTranslationTransform, parseFlatShadows } from './lib/qa-focus-input-assessment.mjs';

const { assertLocalQaTarget, assertQaEnvironment, launchQaBrowser, isAllowedQaRequest } = qaSafety;
const { chromium } = createRequire(import.meta.url)('playwright-core');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUTPUT = path.join(ROOT, '.artifacts/interaction-states-qa');

// Read-only callback, evaluated only inside the already guarded page. A DOM
// visibility change alone does not prove that React's focus cleanup has run.
export function observeModalTransition({ dialog, opener, phase, baselineOverflow, timeoutMs = 1500 }) {
  if (!['snapshot', 'ready', 'closed'].includes(phase) || !Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 1500)
    throw new Error('Invalid bounded modal observation');
  const started = performance.now();
  function snapshot() {
    const active = document.activeElement;
    const visible = !!dialog?.isConnected && dialog.getClientRects().length > 0
      && getComputedStyle(dialog).visibility !== 'hidden';
    return { activeElement: active?.outerHTML.slice(0, 500) || null,
      openerConnected: !!opener?.isConnected, exactOpenerFocused: !!opener && active === opener,
      openerInert: !!opener?.closest('[inert]'), focusInsideDialog: !!dialog?.contains(active),
      dialogIdentityKnown: !!dialog, dialogConnected: !!dialog?.isConnected, dialogVisible: visible,
      openModalCount: document.querySelectorAll('dialog[open],[role="dialog"][aria-modal="true"]').length,
      bodyOverflow: document.body.style.overflow };
  }
  const complete = state => phase === 'ready'
    ? state.dialogVisible && state.focusInsideDialog && state.openerConnected && state.openerInert
      && state.openModalCount === 1 && state.bodyOverflow === 'hidden'
    : !state.dialogVisible && state.openModalCount === 0 && state.openerConnected
      && state.exactOpenerFocused && !state.openerInert && state.bodyOverflow === baselineOverflow;
  const initial = snapshot();
  if (phase === 'snapshot') return { initial, final: initial, elapsedMs: performance.now() - started };
  return new Promise(resolve => {
    let frame, timer, done = false;
    const finish = (passed, final) => {
      if (done) return;
      done = true; cancelAnimationFrame(frame); clearTimeout(timer);
      resolve({ phase, timeoutMs, initial, final, passed,
        elapsedMs: performance.now() - started, expectedBodyOverflow: baselineOverflow });
    };
    const inspect = () => {
      const final = snapshot();
      if (performance.now() - started > timeoutMs) return finish(false, final);
      if (complete(final)) return finish(true, final);
      frame = requestAnimationFrame(inspect);
    };
    // This is a failure deadline, not a fixed sleep or a repeated activation.
    timer = setTimeout(() => finish(false, snapshot()), timeoutMs);
    inspect();
  });
}

// This recorder observes only scalar identity/connection facts. It never reads
// field values or changes focus, and its closure stays in an owned JSHandle.
export function startModalFocusTrace({ dialog, opener }) {
  const started = performance.now(), events = [];
  let droppedEvents = 0, result;
  const scalar = value => typeof value === 'string' ? value.slice(0, 100) : null;
  const snapshot = (type, target = document.activeElement) => {
    const active = document.activeElement;
    return { t: performance.now() - started, type,
      targetTag: scalar(target?.tagName), targetId: scalar(target?.id),
      targetRole: scalar(target?.getAttribute?.('role')),
      isPinnedOpener: target === opener, inPinnedDialog: !!dialog?.contains(target),
      dialogConnected: !!dialog?.isConnected, openerConnected: !!opener?.isConnected,
      activeTag: scalar(active?.tagName), activeId: scalar(active?.id),
      activeRole: scalar(active?.getAttribute?.('role')),
      activeIsOpener: active === opener, activeInDialog: !!dialog?.contains(active) };
  };
  const start = snapshot('start');
  const record = event => {
    if (events.length < 64) events.push(snapshot(event.type, event.target));
    else droppedEvents++;
  };
  document.addEventListener('focusin', record, true);
  document.addEventListener('focusout', record, true);
  return { stop() {
    if (result) return result;
    document.removeEventListener('focusin', record, true);
    document.removeEventListener('focusout', record, true);
    result = { limit: 64, start, events, droppedEvents, final: snapshot('final'),
      durationMs: performance.now() - started };
    return result;
  } };
}

export async function main() {
  const base = assertLocalQaTarget(process.env.BASE_URL || 'http://127.0.0.1:3320');
  assertQaEnvironment();
  const selected = process.env.QA_INTERACTION_CASES?.split(',').filter(Boolean);
  const report = { version: 1, base, startedAt: new Date().toISOString(), passed: false,
    scope: 'Shared and distinct result/error renderers; four modal and three native radio families; pointer-opened company help and pointer/keyboard Worldcup selections with sampled inset-focus geometry. Browser semantics and computed text contrast, not a screen-reader listening test or whole-site WCAG certification.',
    selectedCases: selected || null, completeMatrix: !selected, cases: [], documents: [],
    pageErrors: [], consoleErrors: [], forbiddenRequests: [], externalResponses: [], syntheticContactResponses: [] };
  await mkdir(OUTPUT, { recursive: true });
  let browser;
  let page;
  let item;
  const pinnedOpeners = new WeakMap(), readyDialogs = new WeakMap();
  async function open(route) {
    const response = await page.goto(base + route, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 200, route);
    assert.equal(response.headers()['x-moneysalary-qa'], 'ads-disabled');
    report.documents.push({ route, width: item.width, theme: item.theme, buildId: response.headers()['x-moneysalary-build'] || null });
    assert.equal(await page.locator('#msy-ga-loader,#msy-adsense-loader,ins.adsbygoogle').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), item.theme === 'dark');
    item.bodyOverflowBeforeInteractions = await page.evaluate(() => document.body.style.overflow);
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
  async function pressModalOpener(opener, key = 'Enter') {
    // Capture while the real opener is still accessible. Once the modal opens,
    // its inert/aria-hidden background must not require a new role lookup.
    if (!pinnedOpeners.has(opener)) pinnedOpeners.set(opener, await opener.elementHandle({ timeout: 1500 }));
    const node = pinnedOpeners.get(opener);
    assert(node && await node.evaluate(el => el.isConnected && el === document.activeElement),
      'Open the modal only from the exact, actually focused opener');
    await page.keyboard.press(key);
  }
  async function modalReady(dialog, opener, method) {
    const started = Date.now(), openerNode = pinnedOpeners.get(opener);
    const evidence = { method, phase: 'ready', timeoutMs: 1500, passed: false };
    item.modalReadiness.push(evidence);
    let dialogNode;
    try {
      evidence.initial = (await page.evaluate(observeModalTransition, { dialog: null, opener: openerNode || null,
        phase: 'snapshot', baselineOverflow: item.bodyOverflowBeforeInteractions })).final;
      assert(openerNode, 'Missing pre-open element identity');
      let remaining = 1500 - (Date.now() - started);
      assert(remaining > 0, `${method}: modal readiness deadline exceeded before lookup`);
      dialogNode = await dialog.elementHandle({ timeout: remaining });
      remaining = 1500 - (Date.now() - started);
      assert(dialogNode && remaining > 0, `${method}: modal readiness deadline exceeded during lookup`);
      const observed = await page.evaluate(observeModalTransition, { dialog: dialogNode, opener: openerNode,
        phase: 'ready', baselineOverflow: item.bodyOverflowBeforeInteractions, timeoutMs: remaining });
      Object.assign(evidence, { observationInitial: observed.initial, final: observed.final,
        elapsedMs: Date.now() - started, passed: observed.passed && Date.now() - started <= 1500 });
      if (evidence.passed) {
        await readyDialogs.get(dialog)?.dispose();
        readyDialogs.set(dialog, dialogNode); dialogNode = null;
      }
      assert.equal(evidence.passed, true, `${method}: modal focus and isolation must become ready within 1500ms`);
    } catch (error) {
      evidence.error = error.message;
      if (!evidence.final) evidence.final = (await page.evaluate(observeModalTransition, { dialog: dialogNode || null,
        opener: openerNode || null, phase: 'snapshot', baselineOverflow: item.bodyOverflowBeforeInteractions })).final;
      evidence.elapsedMs = Date.now() - started;
      throw error;
    } finally { await dialogNode?.dispose(); }
  }
  async function closeModal(dialog, opener, key, method, legacyRecord) {
    const dialogNode = readyDialogs.get(dialog), openerNode = pinnedOpeners.get(opener);
    const evidence = { method, key, passed: false, initial: null, final: null };
    item.modalClosures.push(evidence);
    let focusTrace;
    try {
      evidence.beforeAction = (await page.evaluate(observeModalTransition, { dialog: dialogNode, opener: openerNode,
        phase: 'snapshot', baselineOverflow: item.bodyOverflowBeforeInteractions })).final;
      assert(dialogNode && openerNode, 'Closing requires a previously observed modal and pinned opener');
      focusTrace = await page.evaluateHandle(startModalFocusTrace, { dialog: dialogNode, opener: openerNode });
      await page.keyboard.press(key); // Exactly one real key activation; never inject focus or retry closing.
      Object.assign(evidence, await page.evaluate(observeModalTransition, { dialog: dialogNode, opener: openerNode,
        phase: 'closed', baselineOverflow: item.bodyOverflowBeforeInteractions }));
      if (legacyRecord) legacyRecord.restoredFocus = {
        restored: evidence.final.exactOpenerFocused, active: evidence.final.activeElement?.slice(0, 300),
      };
      assert.equal(evidence.passed, true, `${method}: closed modal must restore the exact opener and background within 1500ms`);
    } catch (error) {
      evidence.error = error.message;
      if (!evidence.final) {
        try {
          evidence.final = (await page.evaluate(observeModalTransition, { dialog: dialogNode || null, opener: openerNode || null,
            phase: 'snapshot', baselineOverflow: item.bodyOverflowBeforeInteractions })).final;
        } catch (diagnosticError) { evidence.diagnosticError = diagnosticError.message; }
      }
      throw error;
    } finally {
      if (focusTrace) {
        try { evidence.focusTrace = await focusTrace.evaluate(trace => trace.stop()); }
        catch (error) {
          evidence.focusTraceError = error.message;
          if (!evidence.error) throw error;
        } finally { await focusTrace.dispose(); }
      }
    }
    return evidence;
  }
  async function modal(dialog, opener, { nestedShortcut = true } = {}) {
    await modalReady(dialog, opener, 'containment-start');
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
    await closeModal(dialog, opener, 'Escape', 'first-escape', item.modals.at(-1));
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
      await tabTo(opener); await pressModalOpener(opener);
      const dialog = page.getByRole('dialog', { name: '비과세액 설정' });
      await dialog.waitFor(); await page.waitForTimeout(400);
      await dialog.getByRole('textbox', { name: '월 비과세액', exact: true }).fill('999999999');
      await linkedError(dialog.getByRole('textbox', { name: '월 비과세액', exact: true }));
      await text('[role="dialog"][aria-modal="true"]', 'sheet with invalid amount');
      await modal(dialog, opener);
      await pressModalOpener(opener); await modalReady(dialog, opener, 'sheet-reopen');
      const close = dialog.getByRole('button', { name: '닫기', exact: true });
      await tabTo(close); await closeModal(dialog, opener, 'Enter', 'sheet-close-button');
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
      await tabTo(opener); await pressModalOpener(opener);
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
      await pressModalOpener(opener, 'Control+k'); await modalReady(dialog, opener, 'search-shortcut-reopen');
      await closeModal(dialog, opener, 'Escape', 'search-shortcut-escape');
    },
    async mobileMenu() {
      await open('/tools/loan');
      const opener = page.getByRole('button', { name: '메뉴 열기', exact: true });
      if (item.width === 1280) {
        assert.equal(await opener.isVisible(), false);
        item.applicability = 'Mobile-only menu hidden at desktop width; desktop search tested separately';
        return;
      }
      await tabTo(opener); await pressModalOpener(opener);
      const dialog = page.getByRole('dialog', { name: '모바일 메뉴', exact: true });
      await dialog.waitFor(); await text('dialog[open]', 'mobile navigation dialog');
      await modal(dialog, opener);
      await pressModalOpener(opener); await modalReady(dialog, opener, 'mobile-menu-reopen');
      await tabTo(dialog.getByRole('button', { name: '메뉴 닫기', exact: true }));
      await closeModal(dialog, opener, 'Enter', 'mobile-menu-close-button');
    },
    async boxing() {
      await open('/fun/salary-battle');
      const opener = page.getByRole('button', { name: 'FIGHT!', exact: true });
      await tabTo(opener); await pressModalOpener(opener);
      const dialog = page.getByRole('dialog', { name: '연봉 비교 게임', exact: true });
      await dialog.waitFor();
      await text('dialog[open] > button', 'animation skip control');
      await modal(dialog, opener);
      await pressModalOpener(opener); await modalReady(dialog, opener, 'boxing-skip-reopen');
      const skip = dialog.getByRole('button', { name: '애니메이션 건너뛰고 결과 보기', exact: true });
      await tabTo(skip); await closeModal(dialog, opener, 'Enter', 'boxing-skip-button');
      await pressModalOpener(opener); await modalReady(dialog, opener, 'boxing-completion-reopen');
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
      await tabTo(resultButton); await closeModal(dialog, opener, 'Enter', 'boxing-result-button');
      await pressModalOpener(opener); await modalReady(dialog, opener, 'boxing-final-reopen');
      assert.equal((await completion.textContent()).trim(), '', 'A new game must not announce the previous winner');
      await closeModal(dialog, opener, 'Escape', 'boxing-replay-escape');
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
    async 'company-hint'() {
      await open('/company/simulator');
      const trigger = page.locator('label[for="ms-simulator-field-2"] > .group > svg');
      const tooltipSelector = 'label[for="ms-simulator-field-2"] > .group > div';
      const tooltip = page.locator(tooltipSelector);
      assert.equal(await trigger.count(), 1); assert.equal(await tooltip.count(), 1);
      const checkbox = page.locator('#ms-simulator-field-2');
      const before = {
        youthRelief: await checkbox.isChecked(),
        smeSalary: await page.locator('#ms-simulator-field-0').inputValue(),
        largeSalary: await page.locator('#ms-simulator-field-1').inputValue(),
      };
      await page.mouse.move(0, 0);
      await page.waitForFunction(selector => getComputedStyle(document.querySelector(selector)).opacity === '0', tooltipSelector);
      await trigger.hover();
      await page.waitForFunction(selector => {
        const el = document.querySelector(selector);
        return getComputedStyle(el).opacity === '1'
          && el.getAnimations().every(animation => animation.playState !== 'running' && !animation.pending);
      }, tooltipSelector);
      const visible = await tooltip.evaluate(el => {
        const box = el.getBoundingClientRect();
        return { text: el.textContent.replace(/\s+/g, ' ').trim(), opacity: getComputedStyle(el).opacity,
          inViewport: box.top >= 0 && box.left >= 0 && box.bottom <= innerHeight && box.right <= innerWidth };
      });
      assert(visible.text.includes('소득세 90% 감면·연 200만원 한도'));
      assert.equal(visible.inViewport, true, 'The opened tooltip must fit in the captured viewport');
      const after = {
        youthRelief: await checkbox.isChecked(),
        smeSalary: await page.locator('#ms-simulator-field-0').inputValue(),
        largeSalary: await page.locator('#ms-simulator-field-1').inputValue(),
      };
      assert.deepEqual(after, before, 'Hover must not change the calculation inputs');
      const screenshot = `company-hint-${item.width}-${item.theme}-tooltip.png`;
      item.tooltip = { interaction: 'pointer-hover', hiddenBefore: true, visibleAfterHover: true,
        inputsUnchanged: true, before, after, ...visible, screenshot };
      // Preserve the actual opened state even when the subsequent contrast gate fails.
      await page.screenshot({ path: path.join(OUTPUT, screenshot), fullPage: false });
      await text(tooltipSelector, 'company youth tax relief hover explanation');
    },
    async 'worldcup-round'() {
      await open('/fun/worldcup');
      const roundSelector = 'main div.absolute.top-0[class~="left-1/2"]:has(> span)';
      const round = page.locator(roundSelector);
      await round.waitFor({ state: 'visible' }); assert.equal(await round.count(), 1);
      const initial = (await round.textContent()).replace(/\s+/g, ' ').trim();
      assert.match(initial, /^16강\s*\(1\s*\/\s*8\)$/);
      const cards = page.locator('main .cursor-pointer:has(h3)');
      assert.equal(await cards.count(), 2, 'A match must offer exactly two contenders');
      const buttons = cards.locator('button.ms-focus-card');
      async function names() {
        assert.equal(await buttons.count(), 2);
        const labels = [];
        for (let i = 0; i < 2; i++) {
          const company = (await cards.nth(i).locator('h3').textContent()).trim();
          const label = await buttons.nth(i).getAttribute('aria-label');
          assert.equal(label, `${company} 선택`);
          assert.equal(await buttons.nth(i).getAttribute('type'), 'button');
          labels.push(label);
        }
        return labels;
      }
      await names();
      // Three selections stay in the first round; no winner/share path is opened.
      await buttons.first().click();
      await page.waitForFunction(selector => /^16강\s*\(2\s*\/\s*8\)$/.test(
        document.querySelector(selector)?.textContent.replace(/\s+/g, ' ').trim() || ''), roundSelector);
      await page.mouse.move(0, 0);
      await round.scrollIntoViewIfNeeded();
      const afterSelection = (await round.textContent()).replace(/\s+/g, ' ').trim();
      assert.equal(await cards.count(), 2);
      const screenshot = `worldcup-round-${item.width}-${item.theme}-indicator.png`;
      item.roundIndicator = { interaction: 'pointer-selection', selections: 1, initial, afterSelection,
        contenderCount: 2, screenshot, keyboardSelections: [], focusEvidence: [] };
      await page.screenshot({ path: path.join(OUTPUT, screenshot), fullPage: false });
      await text(roundSelector, 'worldcup active round after one selection');
      async function focusedCard(button, key) {
        const evidence = await button.evaluate(async el => {
          const box = r => ({ x: r.x, y: r.y, width: r.width, height: r.height });
          const chain = []; for (let node = el; node; node = node.parentElement) chain.push(node);
          let previous = '', stableFrames = 0;
          const deadline = performance.now() + 1500;
          do {
            await new Promise(resolve => requestAnimationFrame(resolve));
            const current = JSON.stringify(chain.map(node => {
              const cs = getComputedStyle(node);
              return [box(node.getBoundingClientRect()), cs.transform, cs.opacity];
            }));
            const pending = chain.some(node => node.getAnimations().some(animation =>
              (animation.playState === 'running' || animation.pending)
              && Number.isFinite(animation.effect?.getComputedTiming().endTime)));
            stableFrames = !pending && current === previous ? stableFrames + 1 : 0;
            previous = current;
          } while (stableFrames < 2 && performance.now() < deadline);
          const cs = getComputedStyle(el), r = el.getBoundingClientRect();
          const effects = chain.map(node => {
            const style = getComputedStyle(node), rect = node.getBoundingClientRect();
            return { tag: node.tagName, transform: style.transform, opacity: style.opacity,
              filter: style.filter, backdropFilter: style.backdropFilter, clipPath: style.clipPath,
              maskImage: style.maskImage, perspective: style.perspective, zoom: style.zoom,
              overflowX: style.overflowX, overflowY: style.overflowY,
              paddingBox: { left: rect.left + node.clientLeft, top: rect.top + node.clientTop,
                right: rect.left + node.clientLeft + node.clientWidth,
                bottom: rect.top + node.clientTop + node.clientHeight } };
          });
          // Midpoints avoid rounded corners. These samples prove only the stated
          // straight-edge portions, not the entire perimeter or gradient surface.
          const samples = ['top', 'right', 'bottom', 'left'].map(side => ({ side,
            bands: [{ color: 'black', inset: 1 }, { color: 'white', inset: 3 }].map(band => {
              const x = side === 'left' ? r.left + band.inset : side === 'right' ? r.right - band.inset : r.left + r.width / 2;
              const y = side === 'top' ? r.top + band.inset : side === 'bottom' ? r.bottom - band.inset : r.top + r.height / 2;
              const clippedBy = effects.slice(1).flatMap((effect, index) =>
                (['hidden', 'clip', 'scroll', 'auto'].includes(effect.overflowX)
                  && (x < effect.paddingBox.left || x >= effect.paddingBox.right)
                || ['hidden', 'clip', 'scroll', 'auto'].includes(effect.overflowY)
                  && (y < effect.paddingBox.top || y >= effect.paddingBox.bottom)) ? [index + 1] : []);
              const inViewport = x >= 0 && x < innerWidth && y >= 0 && y < innerHeight;
              const hit = inViewport ? document.elementFromPoint(x, y) : null;
              return { ...band, x, y, inViewport, clippedBy, hitIsButton: hit === el,
                visible: inViewport && clippedBy.length === 0 && hit === el };
            }) }));
          return { label: el.getAttribute('aria-label'), focused: document.activeElement === el,
            focusVisible: el.matches(':focus-visible'), stableFrames, rect: box(r), effects, samples,
            style: Object.fromEntries(['outlineStyle', 'outlineWidth', 'outlineOffset', 'outlineColor', 'boxShadow',
              'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'].map(name => [name, cs[name]])) };
        });
        const filename = `worldcup-round-${item.width}-${item.theme}-focus-${key.toLowerCase()}.png`;
        evidence.screenshot = filename;
        item.roundIndicator.focusEvidence.push(evidence);
        await page.screenshot({ path: path.join(OUTPUT, filename), fullPage: false });
        assert(evidence.focused && evidence.focusVisible && evidence.stableFrames >= 2);
        assert(evidence.effects.every(effect => isTranslationTransform(effect.transform) && effect.opacity === '1'
          && effect.filter === 'none' && effect.backdropFilter === 'none' && effect.clipPath === 'none'
          && effect.maskImage === 'none' && effect.perspective === 'none' && effect.zoom === '1'), 'Unsupported focus geometry/effect');
        assert.equal(evidence.style.outlineStyle, 'solid');
        assert.equal(evidence.style.outlineColor, 'rgb(255, 255, 255)');
        assert.equal(evidence.style.outlineWidth, '2px'); assert.equal(evidence.style.outlineOffset, '-4px');
        for (const side of ['Top', 'Right', 'Bottom', 'Left']) assert.equal(evidence.style[`border${side}Width`], '0px');
        const shadows = parseFlatShadows(evidence.style.boxShadow);
        assert(!shadows.status && shadows.shadows.length === 1);
        assert.deepEqual(shadows.shadows[0], { color: 'rgb(0, 0, 0)', inset: true, spread: 2 });
        assert(evidence.samples.some(sample => sample.bands.every(band => band.visible)), 'Both inset bands need a co-visible straight-edge sample');
        evidence.scope = 'Opaque white/black adjacent bands (21:1) with co-visible inset edge samples; no whole-gradient surface or whole-perimeter conformance claim';
      }
      // Pointer focus on the first button must become actual keyboard focus on
      // the second button; no programmatic focus is used.
      await page.keyboard.press('Tab'); item.keyboardTabs++;
      await tabTo(buttons.nth(1));
      for (const [key, index, expectedPair] of [['Enter', 1, 3], ['Space', 0, 4]]) {
        if (key === 'Space') {
          await page.keyboard.press('Shift+Tab'); item.keyboardTabs++;
          assert.equal(await buttons.first().evaluate(el => el === document.activeElement), true);
        }
        const labels = await names();
        await focusedCard(buttons.nth(index), key);
        await page.keyboard.press(key);
        await page.waitForFunction(({ selector, expectedPair }) => new RegExp(`^16강\\s*\\(${expectedPair}\\s*\\/\\s*8\\)$`).test(
          document.querySelector(selector)?.textContent.replace(/\s+/g, ' ').trim() || ''), { selector: roundSelector, expectedPair });
        await page.waitForTimeout(700); // Covers a second 600ms transition if one key accidentally activated twice.
        const afterKey = (await round.textContent()).replace(/\s+/g, ' ').trim();
        assert.match(afterKey, new RegExp(`^16강\\s*\\(${expectedPair}\\s*\\/\\s*8\\)$`));
        item.roundIndicator.keyboardSelections.push({ key, buttonIndex: index, labels, expectedPair, afterKey, singlePairAdvance: true });
      }
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
      await page.getByRole('button', { name: '3. 세액 공제 항목', exact: true }).click();
      const savings = page.getByRole('textbox', { name: '연금저축 납입액', exact: true });
      const irp = page.getByRole('textbox', { name: 'IRP·퇴직연금 본인 납입액', exact: true });
      const readRefund = async () => {
        const value = await page.locator('[data-calculation-announcement="year-end-tax"]').textContent();
        const match = /예상 환급액: ([\d,]+)원/.exec(value);
        assert(match, 'Expected a finite income-tax refund in the synthetic scenario');
        return Number(match[1].replaceAll(',', ''));
      };
      const readGain = async () => {
        const value = await page.getByText(/^환급액 [\d,]+원 증가!$/).textContent();
        return Number(/환급액 ([\d,]+)원 증가!/.exec(value)[1].replaceAll(',', ''));
      };
      await savings.fill('0'); await irp.fill('0');
      const baseRefund = await readRefund();
      const baseGain = await readGain();
      await savings.fill('9000000');
      assert.equal(await readRefund() - baseRefund, 900000, 'Savings-only credit must stop at the 6m base');
      await savings.fill('0'); await irp.fill('9000000');
      assert.equal(await readRefund() - baseRefund, 1350000, 'IRP-only credit may use the 9m base');
      assert.equal(await readGain() - baseGain, 1350000, 'IRP must be removed from the no-contribution comparison too');
      await savings.fill('9000000'); await irp.fill('1000000');
      assert.equal(await readRefund() - baseRefund, 1050000, 'Cap savings before adding IRP');
      await savings.fill('6000000'); await irp.fill('3000000');
      assert.equal(await readRefund() - baseRefund, 1350000);
      const account = page.getByRole('combobox', { name: '조정할 연금계좌', exact: true });
      await account.selectOption('irp');
      const irpSlider = page.getByRole('slider', { name: 'IRP·퇴직연금 본인 납입액 조정', exact: true });
      assert.equal(await irpSlider.inputValue(), '3000000');
      await irpSlider.focus(); await page.keyboard.press('ArrowLeft');
      assert.equal(await irp.inputValue(), '2,900,000');
      assert.equal(await savings.inputValue(), '6,000,000');
      await account.selectOption('pensionSavings');
      assert.equal(await page.getByRole('slider', { name: '연금저축 납입액 조정', exact: true }).inputValue(), '6000000');
      await account.selectOption('irp');
      assert.equal(await irpSlider.inputValue(), '2900000');
      await text('[data-calculation-result="year-end-tax"]', 'year-end separate pension accounts');
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
        item = { name, width, theme, passed: false, keyboardTabs: 0, text: [], radios: [], modals: [], relationships: [], announcements: [],
          modalReadiness: [], modalClosures: [] };
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
