import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createPagesHandler } from '../../cloudflare/pages-router.mjs';

const htmlRoute = (name, status = 200) => ({ asset: `/_msy/doc/${name}.body`, rscAsset: `/_msy/doc/${name}.txt`, status, contentType: 'text/html; charset=utf-8' });
const korean = '/glossary/' + encodeURIComponent('연봉');
const manifest = {
  version: 1, mode: 'qa', buildId: 'fixture-build',
  routes: { '/': htmlRoute('home'), '/guides': htmlRoute('guides'), '/en/guides': htmlRoute('en-guides'),
    '/share': htmlRoute('share'), '/404': htmlRoute('404', 404), '/en/page-unavailable': htmlRoute('en404', 404), [korean]: htmlRoute('korean') },
  publicAssets: ['/ads.txt'], notFound: { ko: '/404', en: '/en/page-unavailable' },
  headers: [{ regex: '^/.*$', headers: [{ key: 'Content-Security-Policy', value: "default-src 'self'" }, { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=21600' }] }],
  redirects: [{ regex: '^/old/([^/]+)$', keys: ['id'], destination: '/new/:id', statusCode: 308 }],
};

function fixture(dependencies = {}) {
  const reads = [];
  const handler = createPagesHandler(manifest, dependencies);
  const env = { ASSETS: { async fetch(request) {
    reads.push({ url: request.url, headers: Object.fromEntries(request.headers), method: request.method });
    const pathname = new URL(request.url).pathname;
    return new Response(pathname.endsWith('.txt') ? 'FLIGHT:' + pathname : '<html>' + pathname + '</html>', {
      headers: { 'Content-Type': 'application/octet-stream', 'Cache-Control': 'public, max-age=0, must-revalidate' },
    });
  } } };
  return { reads, request: (path, init = {}) => handler.fetch(new Request('https://www.moneysalary.com' + path,
    { ...init, headers: { 'User-Agent': 'MoneySalary-QA/1.0', ...init.headers } }), env), handler, env };
}

test('HTML and native export Flight have different URLs, MIME and private ASCII assets', async () => {
  const f = fixture();
  const html = await f.request('/guides?utm_source=fixture', { headers: { cookie: 'private=1', authorization: 'Bearer fixture' } });
  assert.equal(html.status, 200); assert.match(await html.text(), /guides.body/);
  assert.match(html.headers.get('Content-Type'), /^text\/html/);
  assert.equal(html.headers.get('Cache-Control'), 'public, max-age=0, s-maxage=21600');
  assert.equal(html.headers.get('X-MoneySalary-QA'), 'ads-disabled');
  assert.equal(html.headers.get('Content-Security-Policy'), "default-src 'self'");
  const rsc = await f.request('/guides.txt?_rsc=fixture', { headers: { rsc: '1' } });
  assert.match(rsc.headers.get('Content-Type'), /^text\/x-component/); assert.match(await rsc.text(), /^FLIGHT:/);
  assert.equal((await f.request('/index.txt', { headers: { rsc: '1' } })).status, 200);
  assert.ok(f.reads.every(read => !new URL(read.url).search && !read.headers.cookie && !read.headers.authorization));
  assert.equal((await f.request('/guides', { headers: { rsc: '1' } })).status, 404);
});

test('guide queries and every missing/404 route cannot enter a shared document cache', async () => {
  const f = fixture();
  for (const path of ['/guides?q=tax', '/en/guides?q=tax', '/guides.txt?q=tax', '/unknown', '/en/unknown', '/404', '/en/page-unavailable']) {
    const response = await f.request(path);
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store', path);
    assert.equal(response.headers.get('Cloudflare-CDN-Cache-Control'), 'no-store', path);
    if (path.includes('q=')) assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, follow');
    else assert.equal(response.status, 404);
  }
  const english = await f.request('/en/not-a-page');
  assert.match(await english.text(), /en404.body/);
  assert.equal(english.headers.get('X-Robots-Tag'), 'noindex, nofollow');
});

test('canonical, config and salary redirects preserve the query without fetching an asset', async () => {
  const f = fixture({ salaryRedirect: path => path === '/salary/123' ? '/salary/100' : null });
  for (const [path, target] of [['/old/item?x=1', '/new/item?x=1'], ['/salary/123?x=1', '/salary/100?x=1'], ['/guides/?x=1', '/guides?x=1']]) {
    const response = await f.request(path);
    assert.equal(response.status, 308); assert.equal(response.headers.get('location'), 'https://www.moneysalary.com' + target);
  }
  const apex = await f.handler.fetch(new Request('https://moneysalary.com/guides?q=x'), f.env);
  assert.equal(apex.status, 301); assert.equal(apex.headers.get('location'), 'https://www.moneysalary.com/guides?q=x');
  assert.equal(f.reads.length, 0);
});

test('Korean canonical and previously double-encoded aliases retain the same known page', async () => {
  const f = fixture();
  assert.equal((await f.request(korean)).status, 200);
  const alias = await f.request('/glossary/' + encodeURIComponent(encodeURIComponent('연봉')));
  assert.equal(alias.status, 308); assert.equal(new URL(alias.headers.get('location')).pathname, korean);
  assert.equal((await f.request('/glossary/unknown')).status, 404);
});

test('private assets, malformed paths, wrong methods and denied agents fail before asset access', async () => {
  const f = fixture();
  for (const path of ['/_msy/doc/home.body', '/_msy/data/v1/company/test.html', '/guides%2fsecret', '/%xx', '/guides%5csecret']) {
    assert.ok((await f.request(path)).status >= 400, path);
  }
  assert.equal((await f.request('/guides', { method: 'POST', body: 'x' })).status, 405);
  assert.equal((await f.request('/guides', { headers: { 'User-Agent': 'curl/9' } })).status, 403);
  assert.equal(f.reads.length, 0);
  assert.equal((await f.request('/guides', { headers: { 'User-Agent': 'Googlebot SemrushBot' } })).status, 200);
  const head = await f.request('/guides', { method: 'HEAD' }); assert.equal(await head.text(), '');
});

test('private API response policy wins even if the underlying handler provides a public header', async () => {
  const f = fixture({ dynamic: async request => new URL(request.url).pathname === '/api/contact'
    ? Response.json({ ok: false }, { status: 400, headers: { 'Cache-Control': 'public, max-age=3600' } }) : null });
  const response = await f.request('/api/contact', { method: 'POST', body: '{}' });
  assert.equal(response.status, 400); assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(f.reads.length, 0);
});

test('only build-listed public assets can be read, never guessed deployment controls', async () => {
  const f = fixture();
  assert.equal((await f.request('/ads.txt')).status, 200);
  for (const path of ['/_worker.js', '/_routes.json', '/unknown.js', '/unknown.json']) {
    assert.equal((await f.request(path)).status, 404);
  }
  assert.ok(f.reads.every(read => ['/ads.txt', '/_msy/doc/404.body'].includes(new URL(read.url).pathname)));
});

test('catch-all chunk filenames are valid assets but traversal segments never reach ASSETS', async () => {
  const f = fixture();
  const chunk = '/_next/static/chunks/app/en/%5B...missing%5D/page-fixture.js';
  const handler = createPagesHandler({ ...manifest, publicAssets: [chunk] });
  for (const pathname of [chunk, chunk.replace('%5B', '[').replace('%5D', ']')]) {
    const response = await handler.fetch(new Request('https://qa.invalid' + pathname), f.env);
    assert.equal(response.status, 200);
    assert.equal(f.reads.at(-1).url, 'https://qa.invalid' + chunk);
  }
  for (const asset of ['/../secret', '/nested/./secret', '/nested/%2e%2e/secret',
    '//other.invalid/secret', '/nested%2fsecret', '/nested%5csecret', '/safe?secret', '/safe#secret']) {
    const invalid = createPagesHandler({ ...manifest, routes: { ...manifest.routes, '/': { ...htmlRoute('bad'), asset } } });
    const count = f.reads.length;
    await assert.rejects(() => invalid.fetch(new Request('https://qa.invalid/', {
      headers: { 'User-Agent': 'MoneySalary-QA/1.0' },
    }), f.env), /Unsafe manifest asset path/);
    assert.equal(f.reads.length, count, asset);
  }
});

test('personal share documents stay private; token Flight never receives a generic success payload', async () => {
  const f = fixture({ share: async (_request, response) => new Response((await response.text()) + 'PERSONAL') });
  const response = await f.request('/share/opaque');
  assert.match(await response.text(), /PERSONAL/); assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.equal((await f.request('/share/opaque.txt', { headers: { rsc: '1' } })).status, 404);
  assert.equal((await f.request('/share/opaque/extra')).status, 404);
  assert.equal((await f.request('/share/' + 'x'.repeat(2049))).status, 404);
});

test('request-agent policy stays in sync with the reviewed Next middleware', () => {
  const original = readFileSync(new URL('../../src/middleware.ts', import.meta.url), 'utf8');
  const router = readFileSync(new URL('../../cloudflare/pages-router.mjs', import.meta.url), 'utf8');
  for (const name of ['ALLOWED_BOTS', 'BAD_BOTS', 'SUSPICIOUS_UA']) {
    const expression = new RegExp(`const ${name} = ([^;]+);`);
    assert.equal(expression.exec(router)?.[1], expression.exec(original)?.[1], name);
  }
});
