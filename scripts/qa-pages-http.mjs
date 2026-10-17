// Non-rendering checks of the owned ad-free Pages stage. Never executes document JS.
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertEnglishNotFoundDocument, verifyArtifact } from './lib/pages-export.mjs';
import { runBodySmoke } from './qa-cloudflare-body.mjs';
import qa from './lib/qa-safety.cjs';

if (process.argv.length > 2) throw new Error('Set a loopback BASE_URL; arguments are not supported.');
const base = qa.assertLocalQaTarget(process.env.BASE_URL || 'http://127.0.0.1:3320');
process.env.MSY_QA_MODE = '1';
process.env.NEXT_PUBLIC_ADS_DISABLED = '1';
const { manifest, stage } = verifyArtifact(fileURLToPath(new URL('..', import.meta.url)), 'qa');
await qa.verifyQaServer(base);
const results = [];
async function read(route, { status = 200, type = 'text/html', method = 'GET', headers = {} } = {}) {
  const response = await qa.fetchQaDocument(base + route, base, { method, headers, signal: AbortSignal.timeout(30000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(response.status, status, route + ': ' + bytes.toString('utf8').slice(0, 100));
  assert.equal(response.headers.get('x-moneysalary-qa'), 'ads-disabled', route);
  assert.equal(response.headers.get('x-moneysalary-build'), manifest.buildId, route);
  if (type) assert.ok(response.headers.get('content-type')?.includes(type), `${route} MIME: ${response.headers.get('content-type')}`);
  results.push({ route, status, method, bytes: bytes.length, type: response.headers.get('content-type') });
  return { response, bytes, body: () => bytes.toString('utf8') };
}
function privateResponse(response) {
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(response.headers.get('cloudflare-cdn-cache-control'), 'no-store');
}
function noAdTags(body) {
  for (const tag of body.matchAll(/<(?:script|iframe|img|link)\b[^>]*>/gi)) {
    if (/<link\b/i.test(tag[0]) && /\brel=["'](?:canonical|alternate)["']/i.test(tag[0])) continue;
    for (const match of tag[0].matchAll(/\s(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
      const url = new URL(match[1], base);
      assert.doesNotMatch(url.hostname, /(^|\.)(?:googlesyndication\.com|doubleclick\.net|googletagmanager\.com|google-analytics\.com|googleadservices\.com|coupang\.com|coupangcdn\.com|adtrafficquality\.google)$/i);
      assert.ok(!url.pathname.startsWith('/adgk/'));
    }
  }
}

for (const route of ['/', '/calc/samsung-bonus', '/salary/50000000', '/salary-db/samsung-electronics', '/guides', '/en', '/en/guides']) {
  const html = await read(route);
  noAdTags(html.body());
  assert.equal(html.response.headers.get('x-content-type-options'), 'nosniff');
  assert.match(html.response.headers.get('content-security-policy') || '', /connect-src 'self'/);
  const flight = await read(route === '/' ? '/index.txt?_rsc=local-pages-qa' : route + '.txt?_rsc=local-pages-qa', { type: 'text/x-component', headers: { RSC: '1' } });
  assert.doesNotMatch(flight.body().slice(0, 50), /<!doctype|<html/i);
}
for (const family of ['glossary', 'qna']) {
  const route = Object.keys(manifest.routes).find(p => p.startsWith(`/${family}/`) && p.includes('%'));
  assert.ok(route, `Missing finite Korean ${family} export`);
  const page = await read(route); noAdTags(page.body());
  const alias = await read(`/${family}/` + encodeURIComponent(route.split('/')[2]), { status: 308, type: null });
  assert.equal(new URL(alias.response.headers.get('location')).pathname, route);
}
for (const route of ['/not-a-pages-qa-route', '/en/not-a-pages-qa-route', '/en/page-unavailable']) {
  const result = await read(route, { status: 404 });
  privateResponse(result.response);
  assert.equal(result.response.headers.get('x-robots-tag'), 'noindex, nofollow');
  if (route.startsWith('/en/')) assertEnglishNotFoundDocument(result.body());
}
for (const route of ['/guides?q=tax', '/en/guides?q=tax']) {
  const result = await read(route); privateResponse(result.response);
  assert.equal(result.response.headers.get('x-robots-tag'), 'noindex, follow');
}
for (const [route, destination] of [['/salary/6980-manwon', '/salary/70000000'], ['/company/hyundai-motor', '/salary-db/hyundai'], ['/community', '/qna']]) {
  const result = await read(route + '?utm_source=local-qa', { status: 308, type: null });
  const location = new URL(result.response.headers.get('location'));
  assert.equal(location.pathname, destination); assert.equal(location.searchParams.get('utm_source'), 'local-qa');
}
for (const route of ['/widget/salary', '/widget/dsr', '/widget/severance', '/widget/company?id=samsung-electronics', '/widget/company?id=missing']) {
  const result = await read(route);
  assert.match(result.response.headers.get('content-security-policy') || '', /frame-ancestors \*/);
  assert.notEqual(result.response.headers.get('x-frame-options'), 'SAMEORIGIN');
}
for (const route of ['/robots.txt', '/sitemap.xml', '/rss.xml', '/rss-companies.xml', '/naver226c8e8c348e204e98efbcf23514d286.html']) {
  await read(route, { type: route.endsWith('.txt') ? 'text/plain' : route.endsWith('.html') ? 'text/html' : 'xml' });
}
// The QA HTTP guard deliberately denies advertising paths, including ads.txt.
// Verify the copied publisher declaration as bytes without any HTTP request.
assert.ok(readFileSync(path.join(stage, 'public/ads.txt')).equals(readFileSync(path.join(stage, 'dist/ads.txt'))));
const tableOne = await read('/api/salary-table?type=annual&page=1', { type: 'application/json' });
const tableTwo = await read('/api/salary-table?type=annual&page=2', { type: 'application/json' });
assert.notDeepEqual(JSON.parse(tableOne.body()), JSON.parse(tableTwo.body()));
assert.equal(tableOne.response.headers.get('cache-control'), 'public, s-maxage=86400');

const token = Buffer.from(JSON.stringify({ v: 1, taxYear: 2026, incomeType: 'regular', annualSalary: 50000000, nonTaxableAmount: 200000, dependents: 1, children: 0 })).toString('base64url');
const shared = await read('/share/' + token);
privateResponse(shared.response); noAdTags(shared.body());
assert.match(shared.body(), /msy-pages-share-bootstrap/);
assert.match(shared.body(), /50,000,000/);
assert.match(shared.body(), /연봉 5,000만원/);
assert.doesNotMatch(shared.body(), /data-pages-share-invalid="true"/);
const invalidShare = await read('/share/not-valid'); privateResponse(invalidShare.response);
assert.match(invalidShare.body(), /data-pages-share-invalid="true"/);
await read('/share/' + token + '.txt', { status: 404 });

for (const query of ['title=Local%20QA', 'lang=en&title=Local%20QA', 'type=salary&amount=50000000&net=3500000',
  'type=tool&name=' + encodeURIComponent('삼성 성과급 계산기 12,345,678원'), 'type=guide&title=Local%20QA',
  'type=fun&title=Local%20QA', 'type=company&name=Local%20QA', 'type=report&title=Local%20QA']) {
  const result = await read('/api/og?' + query, { type: 'image/png' });
  assert.equal(result.response.headers.get('x-og-error'), null);
  assert.deepEqual(result.bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.equal(result.bytes.readUInt32BE(16), 1200); assert.equal(result.bytes.readUInt32BE(20), 630);
}

// Every finite export must survive the policy layer. Redirects are inspected once,
// never followed. HEAD uses no browser, JS, image, font or analytics subrequests.
const routes = Object.entries(manifest.routes);
const queue = [...routes];
const covered = [];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const [route, entry] = queue.shift();
    const redirect = manifest.redirects.some(rule => new RegExp(rule.regex, rule.flags || 'i').test(route));
    const response = await qa.fetchQaDocument(base + route, base, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, redirect ? 308 : entry.status, route);
    assert.equal(response.headers.get('x-moneysalary-build'), manifest.buildId, route);
    if (!redirect && entry.status === 200) assert.equal(response.headers.get('content-type'), entry.contentType, route);
    covered.push({ route, status: response.status });
  }
}));
const directory = '.artifacts/pages-free-release-2026-10-17';
mkdirSync(directory, { recursive: true });
const bodyChecks = await runBodySmoke({ port: Number(new URL(base).port),
  verifyStage: () => verifyArtifact(fileURLToPath(new URL('..', import.meta.url)), 'qa') });
writeFileSync(`${directory}/local-http.json`, JSON.stringify({ buildId: manifest.buildId, base, browserNavigation: false, results, bodyChecks, finiteRouteChecks: covered.sort((a, b) => a.route.localeCompare(b.route)) }, null, 2) + '\n');
console.log(`PASS: ${results.length} document/API contracts, ${covered.length} finite routes and ${bodyChecks.length} body limits; no document JavaScript executed.`);
