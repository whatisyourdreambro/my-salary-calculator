import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createStaticCompanyHandler } from '../cloudflare/static-company-fastpath.mjs';
import { contract } from '../.vercel/static-company-fastpath.mjs';

const path = '/salary-db/samsung-electronics';
const normalHeaders = { host: 'www.moneysalary.com', 'user-agent': 'Mozilla/5.0' };
function setup({ url = `https://www.moneysalary.com${path}`, method = 'GET', headers = {}, removeUA = false, assetStatus = 200, assetHeaders = {}, throws = false } = {}) {
  let assets = 0, fallback = 0, originalURL;
  const requestHeaders = { ...normalHeaders, ...headers };
  if (removeUA) delete requestHeaders['user-agent'];
  const request = new Request(url, { method, headers: requestHeaders });
  const handler = createStaticCompanyHandler({ fetch(req) { fallback++; assert.equal(req, request); return new Response('original', { status: 202 }); } }, contract);
  const env = { ASSETS: { async fetch(req) {
    assets++; originalURL = req.url; assert.equal(req, request);
    if (throws) throw new Error('asset unavailable');
    return new Response(method === 'HEAD' ? null : 'same HTML', { status: assetStatus, headers: { ...contract.assetHeaders, etag: '"test"', ...assetHeaders } });
  } } };
  return { async run() { const response = await handler.fetch(request, env, {}); return { response, assets, fallback, originalURL }; } };
}

for (const method of ['GET', 'HEAD']) test(`${method}: static document contract`, async () => {
  const result = await setup({ method }).run();
  assert.equal(result.response.status, 200);
  assert.equal(result.fallback, 0);
  assert.equal(result.assets, 1);
  for (const [name, value] of Object.entries(contract.routes[path])) assert.equal(result.response.headers.get(name), value);
  assert.equal(await result.response.text(), method === 'HEAD' ? '' : 'same HTML');
});
test('tracking URL and allowlist-before-denylist are preserved', async () => {
  const url = `https://www.moneysalary.com${path}?utm_source=naver_blog&utm_content=%ED%99%95%EC%9D%B8`;
  const result = await setup({ url, headers: { 'user-agent': 'curl Mediapartners-Google AhrefsBot' } }).run();
  assert.equal(result.fallback, 0); assert.equal(result.originalURL, url);
});
test('proxy URL preserves the original Host-header policy and asset request', async () => {
  const url = `http://127.0.0.1:3258${path}`;
  const result = await setup({ url }).run();
  assert.equal(result.fallback, 0); assert.equal(result.originalURL, url);
});
test('asset hop-by-hop keep-alive metadata preserves the document contract', async () => {
  const result = await setup({ assetHeaders: { connection: 'keep-alive', 'keep-alive': 'timeout=5' } }).run();
  assert.equal(result.fallback, 0); assert.equal(result.assets, 1);
});
for (const [name, options] of Object.entries({
  'missing UA': { removeUA: true }, 'bad bot': { headers: { 'user-agent': 'AhrefsBot' } },
  'CLI UA': { headers: { 'user-agent': 'curl/8' } },
  'canonical host': { headers: { host: 'moneysalary.com' }, url: `https://moneysalary.com${path}?utm_source=x` },
  'missing route': { url: 'https://www.moneysalary.com/salary-db/does-not-exist' },
  'legacy redirect': { url: 'https://www.moneysalary.com/salary-db/hyundai-motor' },
  'trailing slash': { url: `https://www.moneysalary.com${path}/` },
  'search query': { url: `https://www.moneysalary.com${path}?q=salary` },
  'RSC query': { url: `https://www.moneysalary.com${path}?_rsc=x` },
  'RSC header': { headers: { rsc: '1' } }, 'RSC header 0': { headers: { rsc: '0' } },
  'router tree': { headers: { 'next-router-state-tree': 'tree' } },
  'router prefetch': { headers: { 'next-router-prefetch': '1' } },
  'router URL': { headers: { 'next-url': '/salary-db' } },
  'prefetch': { headers: { purpose: 'prefetch' } },
  'sec prefetch': { headers: { 'sec-purpose': 'prefetch' } },
  'cookie': { headers: { cookie: 'preference=1' } },
  'auth': { headers: { authorization: 'test-only' } },
  'conditional ETag': { headers: { 'if-none-match': '"test"' } },
  'conditional date': { headers: { 'if-modified-since': 'Thu, 01 Oct 2026 00:00:00 GMT' } },
  'range': { headers: { range: 'bytes=0-99' } },
  'server action': { method: 'POST', headers: { 'next-action': 'test' } },
  'revalidation': { headers: { 'x-prerender-revalidate': 'test' } },
})) test(`${name}: original handler without asset shortcut`, async () => {
  const result = await setup(options).run();
  assert.equal(result.response.status, 202); assert.equal(result.assets, 0); assert.equal(result.fallback, 1);
});
for (const [name, options] of Object.entries({
  'asset error': { throws: true }, 'asset 404': { assetStatus: 404 }, 'asset redirect': { assetStatus: 302 },
  'non-HTML': { assetHeaders: { 'content-type': 'application/json' } },
  'different cache': { assetHeaders: { 'cache-control': 'private, no-store' } },
  'vary': { assetHeaders: { vary: 'accept-encoding' } },
  'CSP': { assetHeaders: { 'content-security-policy': "default-src 'none'" } },
  'robots': { assetHeaders: { 'x-robots-tag': 'noindex' } },
  'link': { assetHeaders: { link: '</other>; rel=canonical' } },
  'encoding': { assetHeaders: { 'content-encoding': 'gzip' } },
  'set-cookie': { assetHeaders: { 'set-cookie': 'x=1' } },
})) test(`${name}: response contract falls back`, async () => {
  const result = await setup(options).run();
  assert.equal(result.response.status, 202); assert.equal(result.assets, 1); assert.equal(result.fallback, 1);
});
test('unexpected asset contract disables repeated speculative asset fetches in the isolate', async () => {
  const setupOnce = setup({ assetHeaders: { 'x-new-platform-policy': 'unreviewed' } });
  const first = await setupOnce.run();
  const second = await setupOnce.run();
  assert.equal(first.assets, 1); assert.equal(first.fallback, 1);
  assert.equal(second.assets, 1); assert.equal(second.fallback, 2);
});
