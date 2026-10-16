import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import config from '../../next.config.mjs';
const require = createRequire(import.meta.url);
const { getPathMatch } = require('next/dist/shared/lib/router/utils/path-match');
const rules = await config.headers();
function headersFor(path) {
  return Object.fromEntries(rules.filter(rule => getPathMatch(rule.source)(path))
    .flatMap(rule => rule.headers.map(h => [h.key.toLowerCase(), h.value])));
}
test('Next header matchers leave API cache policies to handlers while retaining security headers', () => {
  for (const route of ['/api', '/api/', '/api/og', '/api/og/', '/api/salary-table', '/api/contact', '/api/feedback', '/api/missing.png']) {
    const headers = headersFor(route);
    assert.equal(headers['cache-control'], undefined, route);
    assert.equal(headers['x-content-type-options'], 'nosniff', route);
    assert.ok(headers['content-security-policy'], route);
  }
});
test('Next header matchers preserve page, API-prefix boundary and widget policies', () => {
  assert.match(headersFor('/')['cache-control'], /s-maxage=21600/);
  assert.match(headersFor('/about')['cache-control'], /s-maxage=3600/);
  for (const route of ['/apiary', '/apix', '/apix/og']) {
    assert.match(headersFor(route)['cache-control'], /s-maxage=3600/, route);
    assert.equal(headersFor(route)['x-content-type-options'], 'nosniff', route);
  }
  assert.match(headersFor('/widget/salary')['cache-control'], /s-maxage=86400/);
  assert.match(headersFor('/widget/salary')['content-security-policy'], /frame-ancestors \*/);
});
