import test from 'node:test';
import assert from 'node:assert/strict';
import qa from '../lib/qa-pages-deployment-http.cjs';

const { validatePagesDeployment, createPagesDeploymentQaClient, readPagesQaBody, QA_USER_AGENT } = qa;
const ORIGIN = 'https://a1b2c3d4.my-salary-calculator.pages.dev';
const pins = { expectedDeploymentId: '11111111-2222-3333-4444-555555555555', expectedCommitHash: 'a'.repeat(40),
  expectedBranch: 'free-pages-review', productionBranch: 'main' };
const fixture = () => ({ id: pins.expectedDeploymentId, project_name: 'my-salary-calculator', environment: 'preview',
  url: ORIGIN, short_id: 'a1b2c3d4', is_skipped: false, latest_stage: { name: 'deploy', status: 'success' },
  deployment_trigger: { metadata: { branch: pins.expectedBranch, commit_hash: pins.expectedCommitHash, commit_dirty: false } } });
const noFetch = async () => { throw new Error('Unexpected network attempt in offline test'); };
const client = (options = {}, record = fixture()) => createPagesDeploymentQaClient(record, { ...pins, fetchFn: noFetch, ...options });

test('requires an exact successful API preview record and independently pinned identifiers', () => {
  assert.equal(validatePagesDeployment({ success: true, result: fixture() }, pins).origin, ORIGIN);
  for (const change of [
    { id: 'aaaaaaaa-2222-3333-4444-555555555555' }, { project_name: 'different' }, { environment: 'production' },
    { is_skipped: true }, { is_skipped: undefined }, { short_id: 'b1b2c3d4' },
    { deployment_trigger: { metadata: { branch: pins.expectedBranch, commit_hash: pins.expectedCommitHash, commit_dirty: true } } },
    { latest_stage: { name: 'deploy', status: 'active' } }, { latest_stage: { name: 'build', status: 'success' } },
    { deployment_trigger: { metadata: { branch: 'main', commit_hash: pins.expectedCommitHash, commit_dirty: false } } },
    { deployment_trigger: { metadata: { branch: pins.expectedBranch, commit_hash: 'b'.repeat(40), commit_dirty: false } } },
  ]) assert.throws(() => client({}, { ...fixture(), ...change }), /qa-pages-http/);
  assert.throws(() => client({}, { success: false, result: fixture() }), /qa-pages-http/);
  for (const change of [{ expectedDeploymentId: '' }, { expectedCommitHash: 'abcdef1' }, { expectedBranch: 'main' },
    { productionBranch: undefined }, { expectedBranch: 'branch\nvalue' }])
    assert.throws(() => client(change), /qa-pages-http/);
});

test('API URL must be the one eight-hex deployment origin, never a branch alias or canonical site', () => {
  for (const url of ['https://www.moneysalary.com', 'https://moneysalary.com', 'https://my-salary-calculator.pages.dev',
    'https://free-pages-review.my-salary-calculator.pages.dev', 'https://a1b2c3d4.other.pages.dev',
    'https://a1b2c3d4.my-salary-calculator.pages.dev.evil.test', 'http://a1b2c3d4.my-salary-calculator.pages.dev',
    `${ORIGIN}:443`, `${ORIGIN}:444`, `${ORIGIN}/guides`, `${ORIGIN}?x=1`, `${ORIGIN}#x`,
    'https://user:pass@a1b2c3d4.my-salary-calculator.pages.dev'])
    assert.throws(() => client({}, { ...fixture(), url }), /qa-pages-http/);
  assert.equal(client({}, { ...fixture(), url: `${ORIGIN}/` }).origin, ORIGIN);
});

test('mutating a source record cannot change the pinned target', async () => {
  const record = fixture();
  const calls = [];
  const c = client({ fetchFn: async (...args) => { calls.push(args); return new Response(''); } }, record);
  record.url = 'https://www.moneysalary.com';
  record.deployment_trigger.metadata.branch = 'main';
  await c.fetchDocument('/guides');
  assert.equal(calls[0][0], `${ORIGIN}/guides`);
  assert.equal(c.branch, pins.expectedBranch);
  assert(Object.isFrozen(c));
});

test('accepts non-rendering page, widget, verification, feed and OG targets', () => {
  const c = client();
  for (const path of ['/', '/en/guides', '/guides?q=%ED%87%B4%EC%A7%81', '/glossary/%EA%B8%B0%ED%9A%8C%EB%B9%84%EC%9A%A9',
    '/widget/company?id=example', '/naver-qa-fixture.html', '/sitemap.xml', '/rss.xml', '/robots.txt',
    '/index.txt', '/en/guides.txt', '/api/og?type=salary&amount=50000000&lang=ko'])
    assert.equal(c.assertTarget(path), `${ORIGIN}${path}`);
  assert.equal(c.assertTarget(`${ORIGIN}/`, 'head'), `${ORIGIN}/`);
});

test('refuses all other origins and write methods before any fetch', async () => {
  let calls = 0;
  const c = client({ fetchFn: async () => { calls++; } });
  for (const value of ['https://www.moneysalary.com/', 'https://b1b2c3d4.my-salary-calculator.pages.dev/',
    '//a1b2c3d4.my-salary-calculator.pages.dev/', 'http://127.0.0.1/', `${ORIGIN}/#fragment`,
    'https://user:pass@a1b2c3d4.my-salary-calculator.pages.dev/', `${ORIGIN}/\n`, '/a\\b'])
    await assert.rejects(c.fetchDocument(value), /qa-pages-http/);
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'CONNECT'])
    await assert.rejects(c.fetchDocument('/', { method }), /qa-pages-http/);
  assert.equal(calls, 0);
  assert.equal(c.attemptedRequests, 0);
});

test('refuses ads, analytics, encoded proxies, private assets and browser subresources', async () => {
  const c = client();
  for (const path of ['/adgk', '/ADGK/x', '/adgk.js', '/adgk;v=1', '/adgk-copy', '/pagead/ads', '/ads.txt',
    '/analytics/collect', '/g/collect', '/cdn-cgi/zaraz/t', '/api/proxy', '/api/analytics',
    '/%61dgk/x', '/%2561dgk/x', '/%252561dgk/x', '/%25252561dgk/x', '/safe/../adgk/x',
    '/safe/%2e%2e/adgk/x', '/safe/%252e%252e/adgk/x', '/safe%2f..%2fadgk/x', '/%2fadgk/x', '/%5cadgk/x',
    '/%00adgk/x', '/%zz', '/safe//path', '/_msy/doc/x.body', '/_next/static/chunk.js',
    '/api/contact', '/api/feedback', '/api/salary-table', '/api/og/extra', '/api/OG',
    '/logo.png', '/script.js', '/style.css', '/font.woff2', '/data.json', '/binary.wasm'])
    await assert.rejects(c.fetchDocument(path), /qa-pages-http/, path);
  assert.equal(c.attemptedRequests, 0);
});

test('fixes QA UA and manual redirect; never follows an Access or advertising Location', async () => {
  const calls = [];
  const redirect = new Response('', { status: 302, headers: { location: 'https://access.example.test/login' } });
  const c = client({ fetchFn: async (...args) => { calls.push(args); return redirect; } });
  assert.equal(await c.fetchDocument('/sitemap.xml', { method: 'head', headers: {
    'user-agent': 'something else', 'cache-control': 'no-cache', 'x-moneysalary-qa-run': 'review-123',
  } }), redirect);
  assert.equal(calls.length, 1);
  const init = calls[0][1];
  assert.equal(init.method, 'HEAD');
  assert.equal(init.headers.get('user-agent'), QA_USER_AGENT);
  assert.equal(init.headers.get('x-moneysalary-qa-run'), 'review-123');
  assert.equal(init.redirect, 'manual');
  assert.equal(init.credentials, 'omit');
  assert.equal(init.body, undefined);
  assert(init.signal instanceof AbortSignal);
});

test('cannot supply credentials, routing headers, request bodies or fetch override options', async () => {
  const c = client();
  for (const name of ['authorization', 'proxy-authorization', 'cookie', 'host', 'origin', 'referer',
    'cf-access-client-id', 'cf-access-client-secret', 'x-forwarded-host', 'x-http-method-override'])
    await assert.rejects(c.fetchDocument('/', { headers: { [name]: 'offline-fixture' } }), /qa-pages-http/);
  for (const value of [{ body: 'x' }, { redirect: 'follow' }, { fetchFn: noFetch }, { dispatcher: {} }, { credentials: 'include' }])
    await assert.rejects(c.fetchDocument('/', value), /qa-pages-http/);
  await assert.rejects(c.fetchDocument('/', { headers: { 'x-moneysalary-qa-run': 'not:allowed' } }), /qa-pages-http/);
  for (const timeoutMs of [0, -1, NaN, Infinity, 30001])
    await assert.rejects(c.fetchDocument('/', { timeoutMs }), /timeoutMs/);
});

test('bounded request budget counts failures and never retries', async () => {
  let calls = 0;
  const c = client({ maxRequests: 1, fetchFn: async () => { calls++; throw new Error('offline failure'); } });
  await assert.rejects(c.fetchDocument('/'), /offline failure/);
  await assert.rejects(c.fetchDocument('/'), /budget/);
  assert.equal(calls, 1);
  assert.equal(c.attemptedRequests, 1);
  for (const maxRequests of [0, 501, -1, NaN]) assert.throws(() => client({ maxRequests }), /request budget/);
});

test('timeout aborts a stalled stub without retrying', async () => {
  let calls = 0;
  const c = client({ fetchFn: async (_url, { signal }) => {
    calls++;
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
  } });
  const keepAlive = setTimeout(() => {}, 1000);
  try { await assert.rejects(c.fetchDocument('/', { timeoutMs: 5 }), { name: 'TimeoutError' }); }
  finally { clearTimeout(keepAlive); }
  assert.equal(calls, 1);
});

test('bounded body reader returns inert bytes and checks MIME plus PNG signature', async () => {
  const html = '<script src="https://ads.example.test/sdk.js"></script>';
  assert.equal(new TextDecoder().decode(await readPagesQaBody(new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } }))), html);
  const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 1]);
  assert.deepEqual(await readPagesQaBody(new Response(png, { headers: { 'content-type': 'image/png' } }), { kind: 'png' }), png);
  await assert.rejects(readPagesQaBody(new Response('not png', { headers: { 'content-type': 'image/png' } }), { kind: 'png' }), /PNG signature/);
  await assert.rejects(readPagesQaBody(new Response('alert(1)', { headers: { 'content-type': 'application/javascript' } })), /content type/);
});

test('bounded body reader rejects declared and streamed byte overflow', async () => {
  await assert.rejects(readPagesQaBody(new Response('x', { headers: { 'content-type': 'text/plain', 'content-length': '100' } }), { maxBytes: 10 }), /Content-Length/);
  // Four Korean characters are twelve UTF-8 bytes, not four bytes.
  await assert.rejects(readPagesQaBody(new Response('가나다라', { headers: { 'content-type': 'text/plain' } }), { maxBytes: 10 }), /stream exceeds/);
  await assert.rejects(readPagesQaBody(new Response('x', { headers: { 'content-type': 'text/plain' } }), { maxBytes: 0 }), /bounds/);
});
