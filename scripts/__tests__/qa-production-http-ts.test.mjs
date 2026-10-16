// Scoped TypeScript loading keeps this compatible with node --test *.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { require as tsxRequire } from 'tsx/cjs/api';
const { fetchText } = tsxRequire('../naver-template-panel.ts', import.meta.url);

test('template panel uses canonical-only QA HTTP and does not follow redirects', async () => {
  const calls = [];
  const fetchFn = async (url, init) => {
    calls.push({ url, init });
    return new Response('', { status: 302, headers: { location: 'https://external.test/sitemap.xml' } });
  };
  await assert.rejects(fetchText('https://www.moneysalary.com/sitemap.xml', fetchFn), /HTTP 302/);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.redirect, 'manual');
  assert.match(calls[0].init.headers.get('user-agent'), /MoneySalary-QA\/1\.0/);
  assert.ok(calls[0].init.signal instanceof AbortSignal);
  await assert.rejects(fetchText('https://external.test/sitemap.xml', fetchFn), /qa-http/);
  await assert.rejects(fetchText('https://www.moneysalary.com/%61dgk/x', fetchFn), /qa-http/);
  assert.equal(calls.length, 1);
});
