// Maintained local Pages regression. Run only through qa:run against qa:pages:start.
// The central transport denies all external origins, telemetry proxies and redirects.
// This script never follows a publisher URL, clicks an ad, or saves rendered HTML.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import qaSafety from './lib/qa-safety.cjs';

const { assertLocalQaTarget, assertQaEnvironment, launchQaBrowser, fetchQaDocument, isAllowedQaRequest } = qaSafety;
const { chromium } = createRequire(import.meta.url)('playwright-core');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUTPUT = path.join(ROOT, '.artifacts/pages-static-qa-2026-10-17/navigation.json');
const VALID_TOKEN = Buffer.from(JSON.stringify({ v: 1, taxYear: 2026, incomeType: 'regular',
  annualSalary: 50000000, nonTaxableAmount: 200000, dependents: 1, children: 0 })).toString('base64url');
const VALID_SHARE = `/share/${VALID_TOKEN}`;
const INVALID_SHARE = '/share/invalid-qa-fixture';
const ENGLISH_404 = '/en/not-a-real-pages-qa-route';
const KOREAN_404S = ['/glossary/qa-missing', '/qna/qa-missing', '/guides/qa-missing'];
const EXPECTED_404_DOCUMENTS = new Set([ENGLISH_404, ...KOREAN_404S]);
const normalize = text => text.replace(/\s+/g, ' ').trim();

export async function main() {
  const base = assertLocalQaTarget(process.env.BASE_URL || 'http://127.0.0.1:3320');
  assertQaEnvironment();
  const report = { version: 1, base, startedAt: new Date().toISOString(), passed: false, checks: [],
    consoleErrors: [], pageErrors: [], forbiddenRequests: [], externalResponses: [], flightResponses: [], documentRequests: [] };
  let browser;
  const shortUrl = value => { const url = new URL(value); return `${url.origin}${url.pathname}`; };

  function observe(page) {
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(30000);
    page.on('pageerror', error => report.pageErrors.push(error.message.slice(0, 1000)));
    page.on('console', message => {
      if (message.type() !== 'error') return;
      const text = message.text();
      const location = message.location().url || page.url();
      // Chromium logs the intentional 404 document as a resource error.
      if (/Failed to load resource.*404/.test(text) && EXPECTED_404_DOCUMENTS.has(new URL(location, base).pathname)) return;
      report.consoleErrors.push({ text: text.slice(0, 1000), url: shortUrl(new URL(location, base)) });
    });
    page.on('request', request => {
      if (!isAllowedQaRequest(request.url(), base, request.method()))
        report.forbiddenRequests.push({ method: request.method(), url: shortUrl(request.url()) });
      if (request.resourceType() === 'document' && request.frame() === page.mainFrame())
        report.documentRequests.push(new URL(request.url()).pathname);
    });
    page.on('response', response => {
      if (new URL(response.url()).origin !== base)
        report.externalResponses.push({ url: shortUrl(response.url()), status: response.status() });
      const pathname = new URL(response.url()).pathname;
      if (pathname.endsWith('.txt') && response.request().headers().rsc === '1')
        report.flightResponses.push({ pathname, status: response.status(), contentType: response.headers()['content-type'] || '' });
    });
  }

  async function assertAdFree(page) {
    assert.equal(await page.locator('#msy-ga-loader, #msy-adsense-loader, ins.adsbygoogle').count(), 0, 'No live SDK or ad unit in QA');
    assert.deepEqual(report.forbiddenRequests, [], 'No attempted external or advertising/analytics request');
    assert.deepEqual(report.externalResponses, [], 'No external response observed');
    assert.deepEqual(report.pageErrors, [], 'No browser runtime or hydration exception');
    assert.deepEqual(report.consoleErrors, [], 'No console error or hydration warning');
  }

  async function open(page, pathname, expectedStatus = 200) {
    const response = await page.goto(base + pathname, { waitUntil: 'networkidle' });
    assert(response, 'Document response is required');
    assert.equal(response.status(), expectedStatus, pathname);
    assert.equal(response.headers()['x-moneysalary-qa'], 'ads-disabled', pathname);
    await assertAdFree(page);
    return response;
  }

  async function shareSnapshot(page) {
    const field = async selector => {
      assert.equal(await page.locator(selector).count(), 1, `Exactly one metadata entry: ${selector}`);
      return page.locator(selector).getAttribute('content');
    };
    return { title: await page.title(), cardText: normalize(await page.locator('[data-pages-share-result]').innerText()),
      ogTitle: await field('meta[property="og:title"]'), ogDescription: await field('meta[property="og:description"]'),
      ogUrl: await field('meta[property="og:url"]'), ogImage: await field('meta[property="og:image"]'),
      twitterTitle: await field('meta[name="twitter:title"]'), robots: await field('meta[name="robots"]') };
  }

  async function check(name, run) {
    const started = Date.now();
    const evidence = await run();
    report.checks.push({ name, passed: true, elapsedMs: Date.now() - started, ...evidence });
  }

  try {
    browser = await launchQaBrowser(chromium, base, { ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
    const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
    const plain = await noJs.newPage(); observe(plain);
    let initialValid;
    let initialInvalid;
    await check('share result and social metadata exist without JavaScript', async () => {
      const response = await open(plain, VALID_SHARE);
      assert.equal(response.headers()['cache-control'], 'private, no-store');
      initialValid = await shareSnapshot(plain);
      assert.match(initialValid.cardText, /50,000,000원/);
      assert.match(initialValid.cardText, /월 수령 추정액/);
      assert.match(initialValid.title, /5,000만원/);
      assert.equal(initialValid.ogUrl, `https://www.moneysalary.com${VALID_SHARE}`);
      assert.match(initialValid.ogImage, /^https:\/\/www\.moneysalary\.com\/api\/og\?type=salary&/);
      assert.match(initialValid.robots, /noindex/);
      assert.equal(initialValid.ogTitle, initialValid.twitterTitle);
      return { title: initialValid.title, resultInInitialDocument: true, metadataInInitialDocument: true };
    });
    await check('invalid share is an ad-free error document without JavaScript', async () => {
      await open(plain, INVALID_SHARE);
      initialInvalid = await shareSnapshot(plain);
      assert.match(initialInvalid.cardText, /잘못된 정보입니다/);
      assert.equal(await plain.locator('[data-pages-share-invalid="true"][data-page-state="error"]').count(), 1);
      assert.equal(await plain.locator('[data-result-share-panel], [data-pages-share-ad-reservation]').count(), 0);
      return { errorMarker: true, resultControlsAbsent: true };
    });
    await noJs.close();

    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage(); observe(page);
    await check('share hydration preserves result, title and OG metadata', async () => {
      await open(page, VALID_SHARE);
      await page.locator('[data-result-share-panel]').first().waitFor();
      // ResultSharePanel appears only after effects and the route/head agreement.
      assert.deepEqual(await shareSnapshot(page), initialValid);
      assert.equal(await page.locator('[data-pages-share-ad-reservation]').count(), 0);
      await assertAdFree(page);
      return { matchesJavaScriptDisabledDocument: true, existingConsentPanelHydrated: true };
    });
    await check('invalid share hydration remains invalid without result controls', async () => {
      await open(page, INVALID_SHARE);
      assert.deepEqual(await shareSnapshot(page), initialInvalid);
      assert.equal(await page.locator('[data-pages-share-invalid="true"][data-page-state="error"]').count(), 1);
      assert.equal(await page.locator('[data-result-share-panel], [data-pages-share-ad-reservation]').count(), 0);
      return { matchesJavaScriptDisabledDocument: true };
    });
    await check('invalid share to home preserves the document and keeps QA services disabled', async () => {
      await clientNavigation(page.locator('header[lang]').getByRole('link', { name: 'Money Salary — 머니샐러리 홈', exact: true }), '/', '/index.txt');
      assert.equal(await page.locator('[data-pages-share-invalid="true"]').count(), 0);
      assert.equal(await page.evaluate(() => window.__MSY_TEST_MODE__), true);
      await assertAdFree(page);
      return { from: INVALID_SHARE, to: '/', preservesDocument: true, qaStillDisabled: true };
    });
    await check('guide query restores and client filtering works', async () => {
      const response = await open(page, '/guides?q=' + encodeURIComponent('퇴직'));
      assert.equal(response.headers()['cache-control'], 'private, no-store');
      assert.equal(response.headers()['x-robots-tag'], 'noindex, follow');
      const search = page.getByRole('textbox', { name: '가이드 키워드 검색', exact: true });
      await page.waitForFunction(() => document.querySelector('input[aria-label="가이드 키워드 검색"]')?.value === '퇴직');
      const initialCount = await page.getByRole('status').filter({ hasText: /^총 \d+개$/ }).innerText();
      assert.match(initialCount, /^총 [1-9]\d*개$/);
      await search.fill('MSY_QA_NO_MATCH_20261017');
      await page.getByRole('heading', { name: '검색 결과가 없습니다', exact: true }).waitFor();
      await search.fill('퇴직');
      await page.getByRole('status').filter({ hasText: initialCount }).waitFor();
      await assertAdFree(page);
      return { queryRestored: true, initialCount, emptyAndRestoredFilters: true };
    });

    async function clientNavigation(link, pathname, flightPath) {
      const documentsBefore = report.documentRequests.length;
      const flightsBefore = report.flightResponses.length;
      const marker = `nav-${Date.now()}`;
      await page.evaluate(value => { window.__MSY_QA_NAV_MARKER__ = value; }, marker);
      await link.click();
      await page.waitForURL(url => url.pathname === pathname);
      await page.waitForLoadState('networkidle');
      assert.equal(await page.evaluate(() => window.__MSY_QA_NAV_MARKER__), marker, 'AppLink must preserve the document');
      assert.equal(report.documentRequests.length, documentsBefore, 'No full-document fallback on a known route');
      const flight = report.flightResponses.slice(flightsBefore).find(item => item.pathname === flightPath);
      assert(flight, `Native-export RSC request missing: ${flightPath}`);
      assert.equal(flight.status, 200);
      assert.match(flight.contentType, /^text\/(?:x-component|plain)/);
      await assertAdFree(page);
    }
    await check('Korean and English AppLink navigation uses separate Flight TXT URLs', async () => {
      await clientNavigation(page.locator('header[lang]').getByRole('link', { name: 'View in English', exact: true }), '/en/guides', '/en/guides.txt');
      assert.equal(await page.locator('header[lang]').getAttribute('lang'), 'en');
      await clientNavigation(page.locator('header[lang]').getByRole('link', { name: 'Money Salary home', exact: true }), '/en', '/en.txt');
      await clientNavigation(page.locator('header[lang]').getByRole('link', { name: '한국어로 보기', exact: true }), '/', '/index.txt');
      assert.equal(await page.locator('header[lang]').getAttribute('lang'), 'ko');
      return { roundTrip: ['/guides', '/en/guides', '/en', '/'], preservesDocument: true };
    });
    await check('unknown English route is an English private 404', async () => {
      const response = await open(page, ENGLISH_404, 404);
      assert.equal(response.headers()['cache-control'], 'private, no-store');
      assert.equal(response.headers()['x-robots-tag'], 'noindex, nofollow');
      assert.equal(await page.locator('header[lang]').getAttribute('lang'), 'en');
      await page.getByRole('heading', { name: 'This English page could not be found', exact: true }).waitFor();
      await assertAdFree(page);
      return { status: 404, language: 'en', noindex: true };
    });
    await check('unknown Korean detail routes hydrate the static 404 header', async () => {
      for (const pathname of KOREAN_404S) {
        const response = await open(page, pathname, 404);
        assert.equal(response.headers()['cache-control'], 'private, no-store');
        assert.equal(response.headers()['x-robots-tag'], 'noindex, nofollow');
        assert.equal(await page.locator('header[lang]').getAttribute('lang'), 'ko');
        await page.getByRole('heading', { name: '페이지를 찾을 수 없습니다', exact: true }).waitFor();
        assert.equal(await page.locator('[data-page-state="not-found"]').count(), 1);
        await page.waitForFunction(expected => document.querySelector('header a[aria-label="한국어로 보기"]')?.getAttribute('href') === expected, pathname);
        assert.equal(await page.locator('header[lang]').getByRole('link', { name: 'View in English', exact: true }).getAttribute('href'),
          pathname.startsWith('/guides/') ? '/en/guides' : '/en');
        await assertAdFree(page);
      }
      return { paths: KOREAN_404S, status: 404, language: 'ko', hydrationErrors: 0 };
    });
    await check('salary-table API changes pages without mixed rows', async () => {
      // The current table UI has no API pagination consumer. Exercise the real
      // two-page API contract via the guarded, non-rendering local HTTP helper.
      const pages = [];
      for (const number of [1, 2]) {
        const response = await fetchQaDocument(`${base}/api/salary-table?type=annual&page=${number}`, base,
          { signal: AbortSignal.timeout(15000) });
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('x-moneysalary-qa'), 'ads-disabled');
        const data = await response.json();
        assert.equal(data.data.length, 100);
        assert(data.data.every(row => Number.isFinite(row.preTax) && Number.isFinite(row.monthlyNet)));
        pages.push(data);
      }
      assert.equal(pages[0].totalPages, pages[1].totalPages);
      assert(pages[0].data.at(-1).preTax < pages[1].data[0].preTax);
      return { pages: [1, 2], rowsPerPage: 100, distinctSortedRows: true, mode: 'guarded-local-HTTP' };
    });
    await check('Samsung profit input changes the rendered calculation', async () => {
      await open(page, '/calc/samsung-bonus');
      const result = page.locator('section[aria-labelledby="avg-result-title"]');
      const input = page.getByRole('textbox', { name: 'DS부문 영업이익 (조원)', exact: true });
      const previous = normalize(await result.innerText());
      const value = (await input.inputValue()).replaceAll(',', '') === '450' ? '400' : '450';
      await input.fill(value);
      await page.waitForFunction(before => document.querySelector('section[aria-labelledby="avg-result-title"]')?.innerText.replace(/\s+/g, ' ').trim() !== before, previous);
      assert.equal(await input.inputValue(), value);
      await assertAdFree(page);
      return { profitTrillion: Number(value), visibleResultChanged: true };
    });
    await context.close();
    report.passed = true;
  } catch (error) {
    report.failure = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    if (browser) await browser.close();
    report.finishedAt = new Date().toISOString();
    await mkdir(path.dirname(OUTPUT), { recursive: true });
    await writeFile(OUTPUT, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ passed: report.passed, completedChecks: report.checks.length, report: OUTPUT }));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
