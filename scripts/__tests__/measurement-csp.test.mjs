// Offline policy and real Pages-router checks. No browser, SDK, or network requests.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { allowsOrdinaryAdvertising, cspAllows, effectiveSources, parseCsp } from '../lib/csp-semantics.mjs';
import { compileRoutingConfig } from '../lib/pages-export.mjs';
import { createPagesHandler } from '../../cloudflare/pages-router.mjs';

const require = createRequire(import.meta.url);
const { pathToRegexp } = require('next/dist/compiled/path-to-regexp');
const root = fileURLToPath(new URL('../..', import.meta.url));
// Owner-approved 2026-11-01: no third-party host list (see next.config.mjs and AdSense help 16283098).
const PRODUCTION_CSP = "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; style-src 'self' 'unsafe-inline' https:; object-src 'none'; base-uri 'self'; form-action 'self' https://sharer.kakao.com; frame-ancestors 'self';";
const QA_CSP = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; connect-src 'self'; img-src 'self' data: blob:; frame-src 'none'; frame-ancestors 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';";
const WIDGET_CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; frame-ancestors *; base-uri 'none'; form-action 'none'";

function config(mode) {
  // Separate imports prevent env/module-cache leakage between production and QA.
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => /^(?:path|systemroot|windir|temp|tmp)$/i.test(key)));
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    globalThis.fetch = () => { throw new Error('Network forbidden in CSP tests'); };
    const { pagesRoutingConfig } = await import('./next.config.mjs');
    console.log(JSON.stringify(await pagesRoutingConfig()));
  `], { cwd: root, encoding: 'utf8', timeout: 20_000, windowsHide: true,
    env: { ...env, ANALYZE: 'false', NEXT_PUBLIC_ADS_DISABLED: mode === 'qa' ? '1' : '0', MSY_PAGES_STATIC_EXPORT: '1' } });
  assert.equal(result.status, 0, result.stderr);
  return compileRoutingConfig(JSON.parse(result.stdout), pathToRegexp);
}
const production = config('production');
const qa = config('qa');
const globalHeaders = routing => routing.headers.find(rule => rule.source === '/:path*').headers;
const globalCsp = routing => globalHeaders(routing).find(header => header.key === 'Content-Security-Policy').value;

// Requests named by Google's tag CSP guide (GA4 with/without ads features, Ads conversion):
// https://developers.google.com/tag-platform/security/guides/csp , the hosts the AdSense loader
// and Funding Choices use today, and the site's own third parties.
// Hosts are examples of documented patterns; the policy must not depend on their spelling.
const REQUIRED_REQUESTS = [
  ['script-src-elem', 'https://www.googletagmanager.com/gtag/js'],
  ['img-src', 'https://www.googletagmanager.com/'], ['connect-src', 'https://www.googletagmanager.com/'],
  ['img-src', 'https://region1.google-analytics.com/g/collect'], ['connect-src', 'https://region1.google-analytics.com/g/collect'],
  ['connect-src', 'https://region1.analytics.google.com/g/collect'], ['img-src', 'https://www.google.com/'],
  ['connect-src', 'https://www.google.com/'],
  ['img-src', 'https://www.google.co.kr/ads/ga-audiences'], ['connect-src', 'https://www.google.co.kr/ads/ga-audiences'],
  ['img-src', 'https://stats.g.doubleclick.net/'], ['connect-src', 'https://stats.g.doubleclick.net/'],
  ['connect-src', 'https://pagead2.googlesyndication.com/'], ['img-src', 'https://pagead2.googlesyndication.com/'],
  ['frame-src', 'https://www.googletagmanager.com/'],
  ['script-src-elem', 'https://www.googleadservices.com/pagead/conversion.js'], ['script-src-elem', 'https://www.google.com/'],
  ['img-src', 'https://www.googleadservices.com/'], ['connect-src', 'https://www.googleadservices.com/'],
  ['connect-src', 'https://ad.doubleclick.net/'], ['img-src', 'https://googleads.g.doubleclick.net/'],
  ['connect-src', 'https://googleads.g.doubleclick.net/'],
  ['script-src-elem', 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'],
  ['frame-src', 'https://googleads.g.doubleclick.net/pagead/ads'], ['frame-src', 'https://tpc.googlesyndication.com/'],
  ['script-src-elem', 'https://fundingchoicesmessages.google.com/i/pub'], ['frame-src', 'https://fundingchoicesmessages.google.com/'],
  ['connect-src', 'https://fundingchoicesmessages.google.com/'], ['frame-src', 'https://ep1.adtrafficquality.google/'],
  ['img-src', 'https://ads-partners.coupang.com/banners/1'], ['img-src', 'https://image1.coupangcdn.com/a.png'],
  ['script-src-elem', 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js'], ['form-action', 'https://sharer.kakao.com/picker/link'],
  ['connect-src', 'https://kapi.kakao.com/'], ['script-src-elem', 'https://static.cloudflareinsights.com/beacon.min.js'],
  ['connect-src', 'https://www.moneysalary.com/cdn-cgi/rum'], ['connect-src', 'https://open.er-api.com/v6/latest/USD'],
  ['connect-src', 'https://api.frankfurter.dev/v1/2020-01-01'], ['worker-src', 'https://www.moneysalary.com/sw.js'],
  ['img-src', 'blob:https://www.moneysalary.com/00000000-0000-0000-0000-000000000000'],
  ['img-src', 'data:image/png;base64,AAAA'], ['font-src', 'https://www.moneysalary.com/fonts/subset.woff2'],
];

// The host-allowlist policy enforced from 2026-10-17 until this change. Its 186 regional
// www.google.<TLD> image hosts are represented by two of them.
const OCTOBER_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://static.cloudflareinsights.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://t1.kakaocdn.net https://fundingchoicesmessages.google.com",
  "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.googletagmanager.com https://www.google.com https://ep2.adtrafficquality.google https://fundingchoicesmessages.google.com",
  "frame-ancestors 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.googleusercontent.com https://www.google-analytics.com https://www.googletagmanager.com https://www.google.com https://www.google.co.kr https://www.google.cat https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://*.coupang.com https://ads-partners.coupang.com https://link.coupang.com https://*.coupangcdn.com https://*.adtrafficquality.google",
  "media-src 'none'",
  "connect-src 'self' https://open.er-api.com https://api.frankfurter.dev https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://www.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://*.cloudflareinsights.com https://kapi.kakao.com",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://sharer.kakao.com",
].join('; ');
const sampleRequest = source => ({ "'self'": 'https://www.moneysalary.com/sample', 'data:': 'data:,sample',
  'blob:': 'blob:https://www.moneysalary.com/00000000-0000-0000-0000-000000000000' })[source]
  ?? `${source.replace('://*.', '://sample.')}/sample`;

test('production CSP allows every documented Google ad/measurement request and site third party', () => {
  const csp = globalCsp(production);
  const blocked = REQUIRED_REQUESTS.filter(([directive, href]) => !cspAllows(csp, directive, href));
  assert.deepEqual(blocked, []);
  assert.ok(allowsOrdinaryAdvertising(csp), 'production publication gate must accept the policy');
});

test('production CSP still allows every request the October host-allowlist policy allowed', () => {
  const csp = globalCsp(production);
  const narrowed = [];
  for (const [directive, sources] of parseCsp(OCTOBER_POLICY)) {
    if (['frame-ancestors', 'base-uri', 'form-action'].includes(directive)) continue; // pinned exactly below
    const fetchDirective = directive === 'script-src' ? 'script-src-elem' : directive;
    for (const source of sources) {
      if (source === "'none'") continue;
      const kept = source.startsWith("'unsafe-") ? effectiveSources(csp, directive).includes(source)
        : cspAllows(csp, fetchDirective, sampleRequest(source));
      if (!kept) narrowed.push(`${directive} ${source}`);
    }
  }
  assert.deepEqual(narrowed, []);
});

test('production CSP keeps hardening directives and never allows wildcard, cleartext or host lists', () => {
  const csp = globalCsp(production);
  assert.equal(csp, PRODUCTION_CSP);
  const policy = parseCsp(csp);
  assert.deepEqual(policy.get('object-src'), ["'none'"]);
  assert.deepEqual(policy.get('base-uri'), ["'self'"]);
  assert.deepEqual(policy.get('frame-ancestors'), ["'self'"]);
  assert.deepEqual(policy.get('form-action'), ["'self'", 'https://sharer.kakao.com']);
  for (const [directive, sources] of policy) {
    assert.equal(sources.length, new Set(sources).size, `Duplicate CSP source in ${directive}`);
    assert.ok(!sources.some(source => ['*', 'http:', 'ws:', 'wss:'].includes(source.toLowerCase())), `wildcard or cleartext source in ${directive}`);
    if (directive !== 'form-action')
      assert.ok(sources.every(source => source.startsWith("'") || /^[a-z][a-z0-9+.-]*:$/i.test(source)), `${directive} must not enumerate hosts again`);
  }
  assert.ok(!policy.get('script-src').includes('data:'), 'data: scripts are never needed');
  for (const blocked of ['http://ads.example/x.js', 'data:text/javascript,alert(1)'])
    assert.ok(!cspAllows(csp, 'script-src-elem', blocked), `${blocked} must stay blocked`);
  assert.ok(!cspAllows(csp, 'frame-ancestors', 'https://evil.example/'));
  assert.ok(!cspAllows(csp, 'form-action', 'https://evil.example/collect'));
  assert.ok(!cspAllows(csp, 'base-uri', 'https://evil.example/'));
  assert.ok(Buffer.byteLength(csp) <= 512, `production CSP grew to ${Buffer.byteLength(csp)} bytes`);
});

test('offline matcher follows CSP3 fallback, scheme, host, port and path rules', () => {
  const policy = "default-src 'self'; script-src https:; child-src https://frames.example; img-src http://upgrade.example https://*.cdn.example https://port.example:8443 https://paths.example/assets/ https://paths.example/Exact.png";
  const cases = [
    ['script-src-elem', 'https://any.example/x.js', true], ['frame-src', 'https://frames.example/', true],
    ['frame-src', 'https://any.example/', false], ['worker-src', 'https://frames.example/w.js', true],
    ['worker-src', 'https://any.example/w.js', false], ['connect-src', 'https://www.moneysalary.com/api', true],
    ['connect-src', 'https://other.example/api', false], ['form-action', 'https://other.example/post', true],
    ['img-src', 'https://upgrade.example/a.png', true], ['img-src', 'https://a.b.cdn.example/x.png', true],
    ['img-src', 'https://cdn.example/x.png', false], ['img-src', 'https://port.example:8443/x.png', true],
    ['img-src', 'https://port.example/x.png', false], ['img-src', 'https://paths.example/assets/deep/x.png', true],
    ['img-src', 'https://paths.example/other/x.png', false], ['img-src', 'https://paths.example/Exact.png', true],
    ['img-src', 'https://paths.example/exact.png', false], ['img-src', 'https://paths.example/Exact.png/more', false],
  ];
  assert.deepEqual(cases.filter(([directive, href, allowed]) => cspAllows(policy, directive, href) !== allowed), []);
  assert.ok(!cspAllows("img-src 'self'", 'img-src', 'blob:https://www.moneysalary.com/00000000-0000-0000-0000-000000000000'));
  assert.ok(!cspAllows("img-src 'self'", 'img-src', 'data:image/png;base64,AAAA'));
  assert.ok(cspAllows("connect-src 'self'", 'connect-src', 'wss://www.moneysalary.com/socket'));
  assert.ok(!cspAllows("connect-src 'self'", 'connect-src', 'http://www.moneysalary.com/'));
  assert.ok(cspAllows("img-src 'self'", 'img-src', 'https://127.0.0.1:3000/a.png', { self: 'http://127.0.0.1:3000' }));
  assert.ok(!cspAllows('script-src https:', 'script-src-elem', 'http://ads.example/x.js'));
  assert.ok(cspAllows('img-src *', 'img-src', 'https://any.example/a.png'));
  assert.ok(!cspAllows('img-src *', 'img-src', 'data:image/png;base64,AAAA'), '* never covers data:');
  // The publication gate accepts explicit hosts and scheme sources alike and rejects closed policies.
  assert.ok(allowsOrdinaryAdvertising(OCTOBER_POLICY));
  assert.ok(allowsOrdinaryAdvertising('default-src https:'));
  assert.ok(!allowsOrdinaryAdvertising("default-src 'self'; script-src 'self' https:; frame-src 'none'"));
  assert.ok(!allowsOrdinaryAdvertising("script-src 'self'; frame-src https:"));
});

test('QA stays closed and widgets keep their policy', () => {
  assert.equal(globalCsp(qa), QA_CSP);
  assert.ok(!allowsOrdinaryAdvertising(globalCsp(qa)), 'QA must never allow live advertising');
  assert.ok(globalHeaders(qa).some(header => header.key === 'X-MoneySalary-QA' && header.value === 'ads-disabled'));
  assert.ok(!globalHeaders(production).some(header => header.key === 'X-MoneySalary-QA'));
  for (const routing of [production, qa]) {
    const widget = routing.headers.find(rule => rule.source === '/widget/:path*');
    assert.equal(widget.headers.find(header => header.key === 'Content-Security-Policy').value, WIDGET_CSP);
  }
});

test('Pages serves the complete production or QA CSP on documents, RSC payloads and redirects within budget', async t => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('External network forbidden in Pages CSP fixtures'); };
  t.after(() => { globalThis.fetch = originalFetch; });
  for (const [mode, routing] of [['production', production], ['qa', qa]]) {
    const routes = Object.fromEntries(['/', '/calc/samsung-bonus', '/widget/salary'].map((pathname, index) =>
      [pathname, { asset: `/_msy/doc/fixture-${index}.body`, rscAsset: `/_msy/doc/fixture-${index}.txt`, status: 200, contentType: 'text/html' }]));
    const handler = createPagesHandler({ version: 1, mode, buildId: 'offline-csp-fixture', routes, ...routing });
    let assetReads = 0;
    const env = { ASSETS: { async fetch(request) {
      assert.equal(new URL(request.url).origin, 'https://csp-fixture.invalid');
      assert.match(new URL(request.url).pathname, /^\/_msy\/doc\/fixture-\d\.(?:body|txt)$/);
      assetReads++;
      return new Response('<!doctype html><title>Inert fixture</title>');
    } } };
    const cases = [['/', 200], ['/calc/samsung-bonus', 200], ['/widget/salary', 200], ['/index.txt', 200], ['/calc/samsung-bonus/', 308]];
    for (const [pathname, status] of cases) {
      const response = await handler.fetch(new Request('https://csp-fixture.invalid' + pathname,
        { method: 'HEAD', headers: { 'User-Agent': 'MoneySalary-QA/1.0' } }), env);
      assert.equal(response.status, status, pathname);
      assert.equal(response.headers.get('Content-Security-Policy'), pathname.startsWith('/widget/') ? WIDGET_CSP : globalCsp(routing), pathname);
      assert.equal(await response.text(), '');
      assert.equal(response.headers.get('X-MoneySalary-QA'), mode === 'qa' ? 'ads-disabled' : null);
      const headerBytes = Buffer.byteLength(Array.from(response.headers, ([key, value]) => `${key}: ${value}\r\n`).join(''));
      assert.ok(headerBytes < 1024, `${mode} ${pathname} application response headers exceed 1 KiB: ${headerBytes}`);
    }
    assert.equal(assetReads, 4);
  }
});
