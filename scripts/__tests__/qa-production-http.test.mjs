import test from 'node:test';
import assert from 'node:assert/strict';
import qaHttp from '../lib/qa-production-http.cjs';
import { productionSitemap } from '../indexnow-ping.mjs';
import { pollPage, staleChunkCheck, run } from '../trend-publish/verify-prod.mjs';
import { fetchPage } from '../health-check.mjs';
import { fetchOnce } from '../crawl-cache-sampler.mjs';

const { CANONICAL_PRODUCTION_ORIGIN: O, assertProductionQaTarget, assertProductionQaOrigin, fetchProductionQaDocument } = qaHttp;
const noFetch = async () => { throw new Error('TEST: unexpected fetch'); };

test('production HTTP refuses other origins, credentials, fragments and write methods before fetch', async () => {
  let calls = 0;
  const fetchFn = async () => { calls++; throw new Error('unexpected'); };
  for (const url of ['http://www.moneysalary.com/', 'https://moneysalary.com/', 'https://preview.pages.dev/',
    'http://127.0.0.1/', 'https://www.moneysalary.com.evil.test/', 'https://www.moneysalary.com:8443/',
    'https://user:pass@www.moneysalary.com/', `${O}/#fragment`, '//www.moneysalary.com/']) {
    await assert.rejects(fetchProductionQaDocument(url, { fetchFn }), /qa-http/);
  }
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'CONNECT']) {
    await assert.rejects(fetchProductionQaDocument(`${O}/`, { method, fetchFn }), /qa-http/);
  }
  assert.equal(calls, 0);
});

test('production HTTP rejects advertising/proxy paths and encoded/dot-segment bypasses before fetch', async () => {
  let calls = 0;
  const fetchFn = async () => { calls++; throw new Error('unexpected'); };
  for (const path of ['/adgk', '/ADGK/x', '/adgk.js', '/adgk;v=1', '/adgk-copy', '/cdn-cgi/zaraz/t',
    '/pagead/ads', '/adsense', '/analytics/collect', '/g/collect', '/api/proxy', '/api/analytics',
    '/%61dgk/x', '/%2561dgk/x', '/%252561dgk/x', '/%25252561dgk/x',
    '/safe/%2e%2e/adgk/x', '/safe/%252e%252e/adgk/x', '/safe%2f..%2fadgk/x',
    '/%2fadgk/x', '/%5cadgk/x', '/%00adgk/x', '/%zz', '//evil.test/adgk']) {
    await assert.rejects(fetchProductionQaDocument(`${O}${path}`, { fetchFn }), /qa-http/, path);
  }
  assert.equal(calls, 0);
  assert.equal(assertProductionQaTarget(`${O}/glossary/%EA%B8%B0%ED%9A%8C%EB%B9%84%EC%9A%A9`), `${O}/glossary/%EA%B8%B0%ED%9A%8C%EB%B9%84%EC%9A%A9`);
  assert.equal(assertProductionQaOrigin(), O);
  assert.throws(() => assertProductionQaOrigin(`${O}/guides`), /qa-http/);
});

test('production HTTP fixes QA UA, bounded timeout, no credentials and manual redirect without replay', async () => {
  const calls = [];
  const response = new Response('', { status: 302, headers: { location: 'https://ads.example.test/click' } });
  const result = await fetchProductionQaDocument(`${O}/sitemap.xml`, {
    method: 'head', headers: { 'user-agent': 'Existing-Checker/1', 'cache-control': 'no-cache' },
    fetchFn: async (url, init) => { calls.push({ url, init }); return response; },
  });
  assert.equal(result, response);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.method, 'HEAD');
  assert.equal(calls[0].init.headers.get('user-agent'), 'Existing-Checker/1 MoneySalary-QA/1.0');
  assert.equal(calls[0].init.headers.get('cache-control'), 'no-cache');
  assert.equal(calls[0].init.redirect, 'manual');
  assert.equal(calls[0].init.credentials, 'omit');
  assert.ok(calls[0].init.signal instanceof AbortSignal);
  for (const timeoutMs of [0, -1, NaN, Infinity, 30001]) {
    await assert.rejects(fetchProductionQaDocument(`${O}/`, { timeoutMs, fetchFn: noFetch }), /timeoutMs/);
  }
  for (const name of ['authorization', 'proxy-authorization', 'cookie', 'host']) {
    await assert.rejects(fetchProductionQaDocument(`${O}/`, { headers: { [name]: 'test' }, fetchFn: noFetch }), /headers/);
  }
});

test('production HTTP timeout signal aborts a stalled fetch without a retry', async () => {
  let calls = 0;
  // Keep the event loop alive: AbortSignal.timeout intentionally uses an unref timer.
  const keepAlive = setTimeout(() => {}, 1000);
  try {
    await assert.rejects(fetchProductionQaDocument(`${O}/`, { timeoutMs: 5, fetchFn: async (_url, { signal }) => {
      calls++;
      return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
    } }), { name: 'TimeoutError' });
  } finally { clearTimeout(keepAlive); }
  assert.equal(calls, 1);
});

test('IndexNow production sitemap import is inert and external redirect is one failed read', async () => {
  const calls = [];
  const result = await productionSitemap(async (url, init) => {
    calls.push({ url, init });
    return new Response('', { status: 302, headers: { location: 'https://external.test/sitemap.xml' } });
  });
  assert.equal(result.ok, false);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${O}/sitemap.xml`);
  assert.equal(calls[0].init.redirect, 'manual');
  assert.match(calls[0].init.headers.get('user-agent'), /MoneySalary-QA\/1\.0/);
});

test('publisher rejects unsafe targets or polling options before fetch/sleep', async () => {
  await assert.rejects(run({ slug: 'example', marker: 'title', origin: 'https://external.test' }, { fetchFn: noFetch }), /qa-http/);
  await assert.rejects(run({ slug: '../../adgk', marker: 'title' }, { fetchFn: noFetch }), /slug/);
  for (const opts of [{ timeoutMs: NaN, intervalMs: 60000 }, { timeoutMs: 1000, intervalMs: 0 }]) {
    await assert.rejects(pollPage({ fetchFn: noFetch, sleep: noFetch, url: `${O}/guides/example`, marker: 'title', ...opts }), /finite timeout/);
  }
});

test('publisher checks assets with HEAD and cannot follow their redirect or encoded ad path', async () => {
  const calls = [];
  const result = await staleChunkCheck({ origin: O, pages: ['/'], fetchFn: async (url, init) => {
    calls.push({ url, init });
    if (url === `${O}/`) return new Response('<script src="/_next/static/chunks/a.js"></script>');
    assert.equal(init.method, 'HEAD');
    return new Response('', { status: 302, headers: { location: `${O}/adgk/pagead` } });
  } });
  assert.equal(calls.length, 2);
  assert.ok(calls.every(({ init }) => init.redirect === 'manual'));
  assert.deepEqual(result.missing, ['/_next/static/chunks/a.js (HTTP 302)']);
  let badCalls = 0;
  await assert.rejects(staleChunkCheck({ origin: O, pages: ['/'], fetchFn: async () => {
    badCalls++;
    return new Response('<script src="/_next/static/%252e%252e/%252e%252e/adgk/x.js"></script>');
  } }), /qa-http/);
  assert.equal(badCalls, 1, 'encoded ad target must never be requested');
});

test('health checker and cache sampler also reject proxy targets and inspect redirects once', async () => {
  const calls = [];
  const fetchFn = async (url, init) => {
    calls.push({ url, init });
    return new Response('', { status: 308, headers: { location: `${O}/salary/12500000` } });
  };
  const health = await fetchPage('/salary/12345678', fetchFn);
  assert.equal(health.status, 308);
  assert.equal(health.location, `${O}/salary/12500000`);
  assert.match((await fetchPage('/%2561dgk/x', fetchFn)).error, /qa-http/);
  const sampled = await fetchOnce({ family: 'calc', path: '/calc/example', url: `${O}/calc/example` }, 1,
    { fetch: fetchFn, clock: () => 0, now: () => 0 });
  assert.equal(sampled.rec.status, 308);
  const blocked = await fetchOnce({ family: 'calc', path: '/calc/%252e%252e/adgk', url: `${O}/calc/%252e%252e/adgk` }, 1,
    { fetch: fetchFn, clock: () => 0, now: () => 0 });
  assert.match(blocked.rec.error, /qa-http/);
  assert.equal(calls.length, 2);
  assert.ok(calls.every(({ init }) => init.redirect === 'manual' && init.headers.get('user-agent').includes('MoneySalary-QA/1.0')));
});
