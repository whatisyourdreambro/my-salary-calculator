// Actual shared config/compiler/router; synthetic ASSETS only, never an HTTP client.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { pagesRoutingConfig } from '../../next.config.mjs';
import { compileRoutingConfig } from '../lib/pages-export.mjs';
import { createPagesHandler } from '../../cloudflare/pages-router.mjs';

const require = createRequire(import.meta.url);
const { pathToRegexp } = require('next/dist/compiled/path-to-regexp');
const aliases = [
  ['/salary/30000000-2', '/salary/30000000'],
  ['/salary/64000000-2', '/salary/64000000'],
  ['/salary/29000000-2', '/salary/29000000'],
  ['/salary-db/compare/toss-viva-vs-coupang-pay', '/salary-db/compare/toss-vs-coupang-pay'],
];
const routing = compileRoutingConfig(await pagesRoutingConfig(), pathToRegexp);
function fixture() {
  const reads = [];
  const routes = Object.fromEntries(aliases.map(([, target], i) => [target, {
    asset: `/_msy/doc/destination-${i}.body`, contentType: 'text/html; charset=utf-8', status: 200,
  }]));
  routes['/404'] = { asset: '/_msy/doc/not-found.body', contentType: 'text/html; charset=utf-8', status: 404 };
  const handler = createPagesHandler({ version: 1, mode: 'qa', buildId: 'alias-fixture', routes,
    publicAssets: [], notFound: { ko: '/404', en: '/404' }, ...routing });
  const env = { ASSETS: { async fetch(request) {
    reads.push(new URL(request.url).pathname);
    return new Response('<html><body>Synthetic document</body></html>', { headers: { 'Content-Type': 'text/html' } });
  } } };
  const request = (pathname, method = 'GET') => handler.fetch(new Request('https://qa.invalid' + pathname,
    { method, headers: { 'User-Agent': 'MoneySalary-QA/1.0' } }), env);
  return { request, reads };
}

test('four observed aliases compile as exact permanent rules with no parameters', () => {
  for (const [source, target] of aliases) {
    const rules = routing.redirects.filter(rule => rule.source === source);
    assert.equal(rules.length, 1, source);
    assert.equal(rules[0].destination, target); assert.equal(rules[0].statusCode, 308);
    assert.deepEqual(rules[0].keys, []);
    assert.equal(routing.redirects.some(rule => new RegExp(rule.regex, rule.flags).test(target)), false, target);
  }
});

test('actual Pages router returns direct GET/HEAD 308, retains queries and reads no assets', async t => {
  t.mock.method(globalThis, 'fetch', () => { throw new Error('No external requests in alias fixtures'); });
  const f = fixture();
  for (const [source, target] of aliases) {
    for (const method of ['GET', 'HEAD']) {
      const response = await f.request(source + '?q=fixture%20value&source=legacy', method);
      assert.equal(response.status, 308, source);
      assert.equal(response.headers.get('location'), 'https://qa.invalid' + target + '?q=fixture+value&source=legacy');
      assert.equal(response.headers.get('x-moneysalary-build'), 'alias-fixture');
      assert.equal(await response.text(), '');
    }
  }
  assert.deepEqual(f.reads, []);
});

test('canonical destinations are not redirected again and HEAD stays bodyless', async () => {
  const f = fixture();
  for (const [, target] of aliases) {
    const response = await f.request(target, 'HEAD');
    assert.equal(response.status, 200, target); assert.equal(response.headers.get('location'), null);
    assert.equal(await response.text(), '');
  }
  assert.equal(f.reads.length, aliases.length);
});

test('similar salaries, suffixes and company pairs retain 404 instead of broad aliasing', async () => {
  const f = fixture();
  const lookalikes = [
    '/salary/31000000-2', '/salary/30000000-3', '/salary/30000000-20', '/salary/30000000-2/extra',
    '/salary/64000000-2x', '/salary/29000000-2.txt',
    '/salary-db/compare/toss-viva-vs-coupang-payx', '/salary-db/compare/toss-viva-vs-coupang',
    '/salary-db/compare/toss-viva-vs-coupang-pay/extra',
  ];
  for (const pathname of lookalikes) {
    const response = await f.request(pathname);
    assert.equal(response.status, 404, pathname); assert.equal(response.headers.get('location'), null, pathname);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
  }
});
