// Non-rendering loopback contract checks. No JavaScript, subresources or redirects execute.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import qa from './lib/qa-safety.cjs';

if (process.argv.length > 2) throw new Error('Set a loopback BASE_URL; command arguments are not supported.');
const base = qa.assertLocalQaTarget(process.env.BASE_URL || 'http://127.0.0.1:3319');
process.env.MSY_QA_MODE = '1';
process.env.NEXT_PUBLIC_ADS_DISABLED = '1';
await qa.verifyQaServer(base);
const results = [];
async function request(route, { status = 200, type = 'text/html', headers = {}, check = () => {} } = {}) {
  const response = await qa.fetchQaDocument(base + route, base, { headers, signal: AbortSignal.timeout(30000) });
  const body = await response.text();
  const h = Object.fromEntries(response.headers);
  assert.equal(response.status, status, `${route}: ${body.slice(0, 120)}`);
  if (type) assert.ok(h['content-type']?.includes(type), `${route} content-type ${h['content-type']}`);
  // Remote advertising resources must never appear as loadable SSR tags.
  for (const tag of body.matchAll(/<(?:script|iframe|img|link)\b[^>]*>/gi)) {
    if (/<link\b/i.test(tag[0]) && /\brel=["'](?:canonical|alternate)["']/i.test(tag[0])) continue;
    for (const match of tag[0].matchAll(/\s(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
      const url = new URL(match[1], base);
      assert.doesNotMatch(url.hostname, /(^|\.)(?:googlesyndication\.com|doubleclick\.net|googletagmanager\.com|google-analytics\.com|googleadservices\.com|coupang\.com|coupangcdn\.com|adtrafficquality\.google)$/i, route);
      assert.ok(!url.pathname.startsWith('/adgk/'), route);
    }
  }
  check(body, h);
  results.push({ route, status: response.status, bytes: Buffer.byteLength(body), contentType: h['content-type'],
    cacheControl: h['cache-control'], vary: h.vary, location: h.location, qa: h['x-moneysalary-qa'] });
  console.log(`[qa-cf-http] ${response.status} ${route}`);
  return { body, h };
}
function htmlHeaders(body, h) {
  assert.equal(h['x-moneysalary-qa'], 'ads-disabled');
  assert.equal(h['x-content-type-options'], 'nosniff');
  assert.match(h['content-security-policy'] || '', /connect-src 'self'/);
  assert.match(h.vary || '', /RSC/i);
  assert.match(body, /<html/);
}
let firstScript;
for (const route of ['/', '/calc/samsung-bonus', '/salary/50000000', '/salary-db/samsung-electronics', '/guides', '/en']) {
  const { body } = await request(route, { check: htmlHeaders });
  if (route === '/') firstScript = body.match(/<script\b[^>]*\bsrc="(\/_next\/static\/[^"?#]+\.js)"/)?.[1];
}
assert.ok(firstScript, 'The generated page must reference its Next static bundle');
// Fetch the local bundle as bytes/text only; it is never executed.
await request(firstScript, { type: 'javascript', check: (body, h) => {
  assert.ok(body.length > 100);
  assert.match(h['cache-control'] || '', /immutable/);
} });
await request('/calc/samsung-bonus?_rsc=local-qa', { type: 'text/x-component', headers: { RSC: '1' }, check: (_body, h) => assert.match(h.vary || '', /RSC/i) });
for (const route of ['/definitely-missing-local-qa', '/en/definitely-missing-local-qa']) {
  await request(route, { status: 404, check: (body, h) => {
    assert.match(body, /noindex/);
    if (route.startsWith('/en/')) {
      assert.match(h['cache-control'] || '', /private|no-store/);
      assert.match(body, /This English page could not be found/);
    }
  } });
}
for (const route of ['/widget/salary', '/widget/dsr', '/widget/severance']) {
  await request(route, { check: (_body, h) => {
    assert.match(h['content-security-policy'] || '', /frame-ancestors \*/);
    assert.notEqual(h['x-frame-options'], 'SAMEORIGIN');
  } });
}
// Exercise each OG renderer through Workerd and the patched Next image stack.
// PNG bytes are inspected locally; no browser, publisher URL or ad resource runs.
for (const query of [
  'title=Local%20QA', 'lang=en&title=Local%20QA',
  'type=salary&amount=50000000&net=3500000', 'type=tool&name=Local%20QA',
  'type=guide&title=Local%20QA', 'type=fun&title=Local%20QA',
  'type=company&name=Local%20QA', 'type=report&title=Local%20QA',
]) {
  const route = `/api/og?${query}`;
  const response = await qa.fetchQaDocument(base + route, base, { signal: AbortSignal.timeout(30000) });
  const png = Buffer.from(await response.arrayBuffer());
  assert.equal(response.status, 200, route);
  assert.match(response.headers.get('content-type') || '', /image\/png/);
  assert.equal(response.headers.get('x-og-error'), null, `${route}: image fallback must not hide a render failure`);
  assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), route);
  assert.equal(png.subarray(12, 16).toString(), 'IHDR');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  assert.match(response.headers.get('cache-control') || '', /s-maxage=86400/);
  results.push({ route, status: response.status, bytes: png.length, contentType: 'image/png', width: 1200, height: 630 });
  console.log(`[qa-cf-http] 200 ${route} (1200x630 PNG)`);
}
for (const route of ['/robots.txt', '/sitemap.xml', '/rss.xml', '/rss-companies.xml']) {
  await request(route, { type: route === '/robots.txt' ? 'text/plain' : 'xml' });
}
const tableOptions = { type: 'application/json', check: (_body, h) => {
  assert.equal(h['cache-control'], 'public, s-maxage=86400', 'Route-owned API cache headers must survive OpenNext');
  assert.equal(h['x-content-type-options'], 'nosniff');
} };
const first = await request('/api/salary-table?type=annual&page=1', tableOptions);
const second = await request('/api/salary-table?type=annual&page=2', tableOptions);
assert.notDeepEqual(JSON.parse(first.body), JSON.parse(second.body), 'Query-specific API responses must not share a cache value');
// Existing legacy redirect: inspect Location without following it.
await request('/salary/6980-manwon', { status: 308, type: null, check: (_body, h) => assert.match(h.location || '', /\/salary\/70000000/) });
mkdirSync('.artifacts/next-security-2026-10-17', { recursive: true });
writeFileSync('.artifacts/next-security-2026-10-17/worker-http.json', JSON.stringify({ base, browserNavigation: false, results }, null, 2) + '\n');
