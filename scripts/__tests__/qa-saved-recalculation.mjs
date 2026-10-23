// Maintained, synthetic-data-only UI test. Run through qa:run against an owned
// ad-free loopback server. Never import historical browser scripts or visit ads.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import qaSafety from '../lib/qa-safety.cjs';

const { assertLocalQaTarget, assertQaEnvironment, launchQaBrowser } = qaSafety;
const base = assertLocalQaTarget(process.env.BASE_URL || 'http://127.0.0.1:3110');
assertQaEnvironment();
const { chromium } = createRequire(import.meta.url)('playwright-core');
const runLabel = process.env.QA_RUN_LABEL || 'saved-recalculation';
assert(/^[a-z0-9][a-z0-9-]{0,63}$/.test(runLabel), 'QA_RUN_LABEL must be a short lowercase name without paths');
const output = path.resolve('.artifacts/experience-qa', runLabel);
const financialKey = 'moneysalary-financial-data';
const requestKey = 'moneysalary:saved-salary-recalculation:v1';
const traceKey = 'qa:saved-recalculation:trace';
const ttl = 10 * 60 * 1000;
// Fictional conditions only; no existing user profile is opened or reused.
const legacy = {
  salary: { annualSalary: 60000000, monthlyNet: 3900000, payBasis: 'monthly',
    severanceType: 'separate', nonTaxableAmount: 200000, dependents: 3, children: 1 },
  homeLoan: { monthlyPayment: 123000 }, extraLegacySection: { retained: true },
  lastUpdated: '2025-10-01T00:00:00.000Z',
};
const homeInput = { salaryInput: '40000000', incomeType: 'regular', payBasis: 'annual',
  nonTaxableAmount: '0', dependents: 1, children: 0 };
const report = [];
const errors = [];
let completed = false;

// The wrapper affects only two product storage keys in this fresh QA context.
// It neither changes network interception nor executes app/production scripts.
function installSyntheticStorage({ legacy, homeInput, financialKey, requestKey, traceKey, theme, requestMode, expired }) {
  const originalSet = Storage.prototype.setItem;
  const originalGet = Storage.prototype.getItem;
  const put = (store, key, value) => originalSet.call(store, key, value);
  const get = (store, key) => originalGet.call(store, key);
  if (!get(sessionStorage, traceKey)) {
    put(localStorage, financialKey, JSON.stringify(legacy));
    put(localStorage, 'moneysalary-user-input', JSON.stringify(homeInput));
    put(sessionStorage, traceKey, JSON.stringify({ requests: [], financialWrites: 0 }));
    if (expired) {
      const expiresAt = Date.now() - 1;
      put(sessionStorage, requestKey, JSON.stringify({ version: 1, createdAt: expiresAt - 600000, expiresAt }));
    }
  }
  put(localStorage, 'theme', theme);
  window.__QA_SAVED_WRITE_MODE__ = 'pass';
  Storage.prototype.setItem = function (key, value) {
    if (this === sessionStorage && key === requestKey) {
      const trace = JSON.parse(get(sessionStorage, traceKey));
      trace.requests.push(JSON.parse(value));
      put(sessionStorage, traceKey, JSON.stringify(trace));
      if (requestMode === 'throw') throw new DOMException('Synthetic denied session storage', 'QuotaExceededError');
      if (requestMode === 'drop') return;
    }
    if (this === localStorage && key === financialKey) {
      const trace = JSON.parse(get(sessionStorage, traceKey));
      trace.financialWrites++;
      put(sessionStorage, traceKey, JSON.stringify(trace));
      if (window.__QA_SAVED_WRITE_MODE__ === 'throw') throw new DOMException('Synthetic denied save', 'QuotaExceededError');
      if (window.__QA_SAVED_WRITE_MODE__ === 'drop') return;
    }
    return originalSet.call(this, key, value);
  };
  // The original get/remove operations are unchanged: consume must really
  // remove its request, not be hidden by a test adapter.
}

async function stored(page) { return page.evaluate(key => localStorage.getItem(key), financialKey); }
async function trace(page) { return page.evaluate(key => JSON.parse(sessionStorage.getItem(key)), traceKey); }
async function unchanged(page) {
  assert.equal(await stored(page), JSON.stringify(legacy), 'previous dashboard record must not change implicitly');
  assert.equal((await trace(page)).financialWrites, 0, 'no dashboard save before an explicit save');
}
async function goto(page, route) {
  const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 120000 });
  assert.equal(response.status(), 200, route);
}
async function keyboardClick(locator) {
  await locator.focus();
  await locator.press('Enter');
}
async function mobileCheck(page, name) {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name}: overflow at ${width}px`);
  }
}
async function requestFromDashboard(page, context) {
  await goto(page, '/dashboard');
  const basis = page.getByRole('region', { name: '저장 급여의 계산 기준', exact: true });
  await basis.getByText(/이전 저장값의 계산 기준은 확인되지 않습니다/).waitFor();
  assert(await basis.getByText('급여 저장일: 확인되지 않음', { exact: true }).isVisible());
  await unchanged(page);
  await keyboardClick(basis.getByRole('button', { name: '저장 조건 확인하고 다시 계산', exact: true }));
  const confirmation = page.getByRole('region', { name: '저장한 급여 조건 확인', exact: true });
  await confirmation.waitFor();
  assert.equal(new URL(page.url()).pathname, '/');
  assert.equal(new URL(page.url()).search + new URL(page.url()).hash, '', 'conditions must not enter the URL');
  assert.equal(context.pages().length, 1, 'handoff stays in the same tab');
  const requests = (await trace(page)).requests;
  assert.equal(requests.length, 1);
  assert.deepEqual(Object.keys(requests[0]).sort(), ['createdAt', 'expiresAt', 'version']);
  assert.equal(requests[0].version, 1);
  assert.equal(requests[0].expiresAt - requests[0].createdAt, ttl);
  assert.equal(await page.evaluate(key => sessionStorage.getItem(key), requestKey), null, 'one-time request is consumed on arrival');
  assert(await confirmation.getByText(/이전 기록에는 소득 유형이 없습니다/).isVisible());
  assert((await confirmation.innerText()).includes('세전 연봉 60,000,000원'));
  assert.equal(await page.getByLabel('계약 연봉', { exact: true }).inputValue(), '40,000,000', 'arrival must not apply the saved salary');
  assert.equal(await page.locator('#calculation-result').count(), 0, 'arrival must not calculate');
  await unchanged(page);
  return confirmation;
}
async function applyAndCalculate(page, confirmation) {
  await keyboardClick(confirmation.getByRole('button', { name: '직장인 조건 확인 후 불러오기', exact: true }));
  await confirmation.waitFor({ state: 'hidden' });
  assert.equal(await page.getByLabel('세전 월급', { exact: true }).inputValue(), '5,000,000');
  assert(await page.getByRole('button', { name: '비과세 200,000', exact: true }).isVisible());
  assert.equal(await page.locator('#calculation-result').count(), 0, 'apply must not calculate automatically');
  await unchanged(page);
  await keyboardClick(page.getByRole('button', { name: '결과 확인하기', exact: true }));
  const result = page.locator('[data-salary-result-summary]');
  await result.waitFor();
  await page.waitForFunction(() => document.activeElement?.matches('[data-salary-result-summary]'));
  const monthlyNet = Number((await result.innerText()).replaceAll(',', ''));
  assert(Number.isFinite(monthlyNet) && monthlyNet > 0);
  assert.notEqual(monthlyNet, legacy.salary.monthlyNet, 'the visible result is a fresh calculation');
  await unchanged(page);
  return monthlyNet;
}
async function clickSaveAndReadAlert(page) {
  const alertPromise = page.waitForEvent('dialog').then(async alert => {
    const message = alert.message();
    assert.equal(alert.type(), 'alert');
    await alert.accept();
    return message;
  });
  await keyboardClick(page.getByRole('button', { name: '대시보드에 저장하기', exact: true }));
  return alertPromise;
}

await fs.mkdir(output, { recursive: true });
const browser = await launchQaBrowser(chromium, base, { headless: true, ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
async function scenario(name, theme, options, run) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: theme, serviceWorkers: 'block' });
  try {
    await context.addInitScript(installSyntheticStorage, { legacy, homeInput, financialKey, requestKey, traceKey, theme, ...options });
    const page = await context.newPage();
    const writes = [];
    page.on('pageerror', error => errors.push({ case: name, message: error.message }));
    page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) writes.push(request.method()); });
    await run(page, context);
    assert.deepEqual(writes, [], 'saved recalculation must not send a network write');
    report.push({ name, theme, status: 'passed', data: 'synthetic isolated browser context', networkWrites: 0 });
  } finally { await context.close(); }
}
try {
  for (const theme of ['light', 'dark']) {
    await scenario('legacy-confirm-calculate-save', theme, {}, async (page, context) => {
      const confirmation = await requestFromDashboard(page, context);
      await mobileCheck(page, `${theme} confirmation`);
      await confirmation.screenshot({ path: path.join(output, `saved-recalculation-${theme}-confirmation.png`) });
      const monthlyNet = await applyAndCalculate(page, confirmation);
      await mobileCheck(page, `${theme} calculation`);
      assert.equal(await clickSaveAndReadAlert(page), '연봉 정보가 대시보드에 저장되었습니다!');
      const basis = page.getByRole('region', { name: '저장 급여의 계산 기준', exact: true });
      await basis.getByText('현재 계산 기준으로 저장한 결과입니다.', { exact: true }).waitFor();
      const updated = JSON.parse(await stored(page));
      assert.deepEqual(updated.homeLoan, legacy.homeLoan);
      assert.deepEqual(updated.extraLegacySection, legacy.extraLegacySection);
      assert.deepEqual(Object.fromEntries(Object.keys(legacy.salary).map(key => [key, updated.salary[key]])), { ...legacy.salary, monthlyNet });
      assert.equal(updated.salary.incomeType, 'regular');
      assert.equal(updated.salary.inputOrigin, 'saved_salary');
      assert(Number.isFinite(Date.parse(updated.salary.savedAt)));
      assert.equal(updated.lastUpdated, updated.salary.savedAt);
      const current = (await basis.innerText()).match(/현재 홈 계산기는 (\d{4})년 요율\((\d{4}-\d{2}) 반영\)/);
      assert(current, 'current basis must be visibly explained');
      assert.equal(updated.salary.calculationBasisVersion, `home-v1:${current[1]}:${current[2]}`);
      assert.equal((await trace(page)).financialWrites, 1);
      await mobileCheck(page, `${theme} dashboard`);
      await basis.screenshot({ path: path.join(output, `saved-recalculation-${theme}-metadata.png`) });
      await goto(page, '/');
      await page.getByRole('button', { name: '결과 확인하기', exact: true }).waitFor();
      assert.equal(await page.getByRole('region', { name: '저장한 급여 조건 확인', exact: true }).count(), 0, 'consumed request must not reappear');
      assert.equal(await stored(page), JSON.stringify(updated));
    });
  }
  for (const mode of ['throw', 'drop']) {
    await scenario(`session-request-${mode}`, 'light', { requestMode: mode }, async page => {
      await goto(page, '/dashboard');
      const request = page.getByRole('button', { name: '저장 조건 확인하고 다시 계산', exact: true });
      await keyboardClick(request);
      await page.getByRole('alert').filter({ hasText: '계산기에 전달하지 못했습니다' }).waitFor();
      assert.equal(new URL(page.url()).pathname, '/dashboard');
      assert.equal(await page.evaluate(key => sessionStorage.getItem(key), requestKey), null);
      await unchanged(page);
    });
    await scenario(`financial-save-${mode}`, 'light', {}, async (page, context) => {
      await applyAndCalculate(page, await requestFromDashboard(page, context));
      await page.evaluate(mode => { window.__QA_SAVED_WRITE_MODE__ = mode; }, mode);
      assert.match(await clickSaveAndReadAlert(page), /^저장 완료를 확인하지 못했습니다/);
      assert.equal(new URL(page.url()).pathname, '/');
      assert.equal(await stored(page), JSON.stringify(legacy));
      assert.equal((await trace(page)).financialWrites, 1, 'one failed explicit save attempt');
      assert(await page.locator('[data-salary-result-summary]').isVisible(), 'calculation remains available after save failure');
    });
  }
  await scenario('cancel-and-one-consume', 'light', {}, async (page, context) => {
    const confirmation = await requestFromDashboard(page, context);
    await keyboardClick(confirmation.getByRole('button', { name: '불러오지 않기', exact: true }));
    await confirmation.waitFor({ state: 'hidden' });
    assert.equal(await page.getByLabel('계약 연봉', { exact: true }).inputValue(), '40,000,000');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByLabel('계약 연봉', { exact: true }).waitFor();
    assert.equal(await confirmation.count(), 0);
    await unchanged(page);
  });
  await scenario('expired-request', 'light', { expired: true }, async page => {
    await goto(page, '/');
    await page.getByLabel('계약 연봉', { exact: true }).waitFor();
    await page.waitForFunction(key => sessionStorage.getItem(key) === null, requestKey);
    assert.equal(await page.getByRole('region', { name: '저장한 급여 조건 확인', exact: true }).count(), 0);
    assert.equal(await page.locator('#calculation-result').count(), 0);
    await unchanged(page);
  });
  assert.deepEqual(errors, []);
  completed = true;
} finally {
  await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify({ completed, report, errors,
    limitation: 'Local synthetic UI only; analytics disabled; exact TTL boundary and parser cases are covered by offline unit tests.' }, null, 2));
  await browser.close();
}
console.log(`PASS: ${report.length} saved recalculation cases; explicit apply/calculate/save, metadata, one-consume and storage failures.`);
