// Offline policy and real Pages-router checks. No browser, SDK, or network requests.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { googleMeasurementImageOrigins } from '../lib/google-measurement-origins.mjs';
import { compileRoutingConfig } from '../lib/pages-export.mjs';
import { createPagesHandler } from '../../cloudflare/pages-router.mjs';

const require = createRequire(import.meta.url);
const { pathToRegexp } = require('next/dist/compiled/path-to-regexp');
const root = fileURLToPath(new URL('../..', import.meta.url));
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
const directives = csp => Object.fromEntries(csp.split(';').filter(part => part.trim()).map(part => {
  const [key, ...sources] = part.trim().split(/\s+/);
  return [key, sources];
}));

test('production permits the reported measurement hosts in their required directives', () => {
  const policy = directives(globalCsp(production));
  for (const origin of ['https://analytics.google.com', 'https://www.google.com', 'https://www.googletagmanager.com'])
    assert.ok(policy['connect-src'].includes(origin), `Missing connection: ${origin}`);
  for (const origin of ['https://www.googletagmanager.com', 'https://www.google.com', 'https://www.google.co.kr', 'https://www.google.co.jp', 'https://www.google.co.uk', 'https://www.google.cat'])
    assert.ok(policy['img-src'].includes(origin), `Missing measurement image: ${origin}`);
  for (const sources of Object.values(policy)) {
    assert.equal(sources.length, new Set(sources).size, 'Duplicate CSP source');
    assert.ok(!sources.includes('*') && !sources.includes('https:') && !sources.some(source => source.endsWith('.*')));
  }
});

test('regional Google allowlist is pinned, exact HTTPS www hosts and images only', () => {
  const policy = directives(globalCsp(production));
  assert.equal(googleMeasurementImageOrigins.length, 187);
  assert.equal(new Set(googleMeasurementImageOrigins).size, 187);
  for (const origin of googleMeasurementImageOrigins) {
    assert.match(origin, /^https:\/\/www\.google\.(?:[a-z]{2,3}\.)?[a-z]{2,3}$/);
    assert.equal(new URL(origin).origin, origin);
    assert.ok(policy['img-src'].includes(origin));
    if (origin !== 'https://www.google.com') {
      for (const [directive, sources] of Object.entries(policy))
        if (directive !== 'img-src') assert.ok(!sources.includes(origin), `${origin} escaped image scope into ${directive}`);
    }
  }
  for (const unsafe of ['https://google.co.kr', 'https://mail.google.co.kr', 'http://www.google.co.kr', 'https://www.google.co.kr.evil.invalid', 'https://www.google.invalid'])
    assert.ok(!policy['img-src'].includes(unsafe));
});

test('ordinary ad policies remain available while QA and widgets keep their existing policies', () => {
  const policy = directives(globalCsp(production));
  assert.ok(policy['script-src'].includes('https://pagead2.googlesyndication.com'));
  assert.ok(policy['frame-src'].includes('https://googleads.g.doubleclick.net'));
  assert.ok(policy['img-src'].includes('https://*.coupangcdn.com'));
  assert.ok(policy['connect-src'].includes('https://*.google-analytics.com'));
  for (const directive of ['object-src', 'media-src']) assert.deepEqual(policy[directive], ["'none'"]);
  for (const directive of ['base-uri', 'frame-ancestors']) assert.deepEqual(policy[directive], ["'self'"]);
  assert.equal(globalCsp(qa), QA_CSP);
  assert.ok(globalHeaders(qa).some(header => header.key === 'X-MoneySalary-QA' && header.value === 'ads-disabled'));
  assert.ok(!globalHeaders(production).some(header => header.key === 'X-MoneySalary-QA'));
  for (const routing of [production, qa]) {
    const widget = routing.headers.find(rule => rule.source === '/widget/:path*');
    assert.equal(widget.headers.find(header => header.key === 'Content-Security-Policy').value, WIDGET_CSP);
  }
});

test('Pages serves the complete production or QA CSP without losing widget overrides or header budget', async t => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('External network forbidden in Pages CSP fixtures'); };
  t.after(() => { globalThis.fetch = originalFetch; });
  for (const [mode, routing] of [['production', production], ['qa', qa]]) {
    const routes = Object.fromEntries(['/', '/calc/samsung-bonus', '/widget/salary'].map((pathname, index) =>
      [pathname, { asset: `/_msy/doc/fixture-${index}.body`, status: 200, contentType: 'text/html' }]));
    const handler = createPagesHandler({ version: 1, mode, buildId: 'offline-csp-fixture', routes, ...routing });
    let assetReads = 0;
    const env = { ASSETS: { async fetch(request) {
      assert.equal(new URL(request.url).origin, 'https://csp-fixture.invalid');
      assert.match(new URL(request.url).pathname, /^\/_msy\/doc\/fixture-\d\.body$/);
      assetReads++;
      return new Response('<!doctype html><title>Inert fixture</title>');
    } } };
    for (const pathname of Object.keys(routes)) {
      const response = await handler.fetch(new Request('https://csp-fixture.invalid' + pathname,
        { method: 'HEAD', headers: { 'User-Agent': 'MoneySalary-QA/1.0' } }), env);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('Content-Security-Policy'), pathname.startsWith('/widget/') ? WIDGET_CSP : globalCsp(routing));
      assert.equal(await response.text(), '');
      assert.equal(response.headers.get('X-MoneySalary-QA'), mode === 'qa' ? 'ads-disabled' : null);
      const headerBytes = Buffer.byteLength(Array.from(response.headers, ([key, value]) => `${key}: ${value}\r\n`).join(''));
      assert.ok(headerBytes < 8192, `Application response headers exceed 8 KiB: ${headerBytes}`);
    }
    assert.equal(assetReads, 3);
  }
});
