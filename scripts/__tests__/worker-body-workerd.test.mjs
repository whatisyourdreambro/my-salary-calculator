// Local Workerd transport regression. This imports ONLY the body-boundary helper
// and a synthetic responder: no Next/OpenNext/application/advertising code.
// Unlike `wrangler dev`, Miniflare is used directly, with no body-draining middleware.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
// Do not let unrelated host credentials/NODE_OPTIONS reach the local child runtime.
// This test runs in its own Node test process; it does not change the caller's env.
const cleanEnv = {};
for (const name of ['SystemRoot', 'SYSTEMROOT', 'WINDIR', 'PATH', 'Path', 'TEMP', 'TMP', 'TMPDIR', 'NODE_TEST_CONTEXT']) {
  if (process.env[name] !== undefined) cleanEnv[name] = process.env[name];
}
Object.assign(cleanEnv, { CI: 'true', MSY_QA_MODE: '1', NEXT_PUBLIC_ADS_DISABLED: '1',
  NEXT_TELEMETRY_DISABLED: '1', WRANGLER_SEND_METRICS: 'false',
  CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false' });
process.env = cleanEnv;
const { Miniflare, convertV4MiniflareOptions } = wranglerRequire('miniflare');
const helper = readFileSync(new URL('../../cloudflare/request-body-limit.mjs', import.meta.url), 'utf8');
const helperSha256 = createHash('sha256').update(helper).digest('hex');
const ROUTES = new Set(['/api/contact', '/api/feedback', '/__synthetic_body', '/__egress_probe']);
const stub = `
  import { withRequestBodyLimits } from './request-body-limit.mjs';
  let accepted = 0;
  export default withRequestBodyLimits({
    async fetch(request) {
      if (new URL(request.url).pathname === '/__egress_probe') {
        // Reserved invalid hostname; intercepted by the mandatory outbound service.
        return fetch('https://no-network.invalid/synthetic');
      }
      accepted++;
      const bytes = (await request.arrayBuffer()).byteLength;
      return Response.json({ ok: true, bytes, accepted }, {
        headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' }
      });
    }
  });
`;

function localPost(base, route, chunks, { chunked = false } = {}) {
  const url = new URL(base);
  assert.equal(url.protocol, 'http:');
  assert.equal(url.hostname, '127.0.0.1');
  assert.match(url.port, /^\d+$/);
  assert.ok(ROUTES.has(route));
  assert.ok(chunks.every(chunk => Buffer.isBuffer(chunk)));
  const bytes = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  assert.ok(bytes <= 65569, 'Only bounded synthetic request bodies are permitted');
  return new Promise((resolve, reject) => {
    let timer;
    const finish = (error, result) => {
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(result);
    };
    const req = http.request({ hostname: '127.0.0.1', family: 4, port: Number(url.port),
      method: 'POST', path: route, agent: false,
      headers: { 'User-Agent': 'MoneySalary-QA/1.0', 'Content-Type': 'application/octet-stream', Connection: 'close',
        ...(chunked ? { 'Transfer-Encoding': 'chunked' } : { 'Content-Length': String(bytes) }) },
    }, res => {
      const responseChunks = [];
      let size = 0;
      res.on('data', chunk => {
        size += chunk.length;
        if (size > 4096) req.destroy(new Error('Unexpected synthetic response size'));
        else responseChunks.push(chunk);
      });
      res.on('error', error => finish(error));
      res.on('end', () => finish(null, { status: res.statusCode, headers: res.headers,
        body: Buffer.concat(responseChunks).toString('utf8') }));
    });
    req.on('error', error => finish(error));
    timer = setTimeout(() => req.destroy(new Error('Loopback Workerd request timed out')), 10000);
    for (const chunk of chunks) req.write(chunk);
    req.end();
  });
}

function assertRejected(response) {
  assert.equal(response.status, 413);
  assert.deepEqual(JSON.parse(response.body), { ok: false, error: 'PAYLOAD_TOO_LARGE' });
  assert.equal(response.headers['cache-control'], 'private, no-store');
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
}

test('real Workerd bounds synthetic bodies without Wrangler dev draining, then continues serving', { timeout: 60000 }, async t => {
  let blockedOutbound = 0;
  const denyOutbound = () => {
    blockedOutbound++;
    return new Response('Synthetic egress blocked', { status: 403 });
  };
  const options = convertV4MiniflareOptions({
    name: 'moneysalary-body-boundary-synthetic', host: '127.0.0.1', port: 0,
    cf: false, compatibilityDate: '2026-10-12',
    compatibilityFlags: ['nodejs_compat', 'global_fetch_strictly_public'],
    modulesRoot: '/',
    modules: [
      { type: 'ESModule', path: 'synthetic-worker.mjs', contents: stub },
      { type: 'ESModule', path: 'request-body-limit.mjs', contents: helper },
    ],
    outboundService: denyOutbound,
    unsafeRegisterWorker: false, unsafeLocalExplorer: false, unsafeObservability: false,
    logRequests: false,
  });
  // Fail closed on Miniflare API drift before starting Workerd.
  assert.equal(options.host, '127.0.0.1');
  assert.equal(options.cf, false);
  assert.equal(options.workers.length, 1);
  assert.equal(options.workers[0].dev.outboundService.type, 'fetcher');
  assert.equal(options.workers[0].dev.outboundService.handler, denyOutbound);
  const mf = new Miniflare(options);
  t.after(() => mf.dispose());
  const base = await mf.ready;
  assert.equal(base.hostname, '127.0.0.1');
  t.diagnostic(`helper_sha256=${helperSha256}; miniflare=${wranglerRequire('miniflare/package.json').version}; real Workerd; synthetic modules only; no Wrangler dev drain; no remote bindings`);

  await t.test('outbound service denies a synthetic fetch without DNS or remote dispatch', async () => {
    const response = await localPost(base, '/__egress_probe', [Buffer.alloc(0)]);
    assert.equal(response.status, 403);
    assert.equal(blockedOutbound, 1);
  });

  for (const [route, size] of [['/api/contact', 4097], ['/api/feedback', 1025], ['/__synthetic_body', 65537]]) {
    await t.test(`declared ${route} ${size} bytes gives 413 and a following small request succeeds`, async () => {
      assertRejected(await localPost(base, route, [Buffer.alloc(size, 120)]));
      const next = await localPost(base, route, [Buffer.from('{}')]);
      assert.equal(next.status, 200);
      assert.equal(JSON.parse(next.body).bytes, 2);
    });
  }

  for (const [route, first, second] of [['/api/feedback', 512, 513], ['/__synthetic_body', 32768, 32769]]) {
    await t.test(`chunked ${route} has no Content-Length, rejects overflow and preserves the next request`, async () => {
      assertRejected(await localPost(base, route,
        [Buffer.alloc(first, 120), Buffer.alloc(second, 120), Buffer.alloc(32, 120)], { chunked: true }));
      const next = await localPost(base, route, [Buffer.from('{}')]);
      assert.equal(next.status, 200);
      assert.equal(JSON.parse(next.body).bytes, 2);
    });
  }

  await t.test('exact 64KiB remains intact and all body tests attempt no external traffic', async () => {
    const exact = await localPost(base, '/__synthetic_body', [Buffer.alloc(65536, 120)]);
    assert.equal(exact.status, 200);
    assert.equal(JSON.parse(exact.body).bytes, 65536);
    assert.equal(blockedOutbound, 1, 'Only the deliberate blocked egress fixture may call fetch');
  });
});
