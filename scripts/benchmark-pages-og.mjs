// Synthetic local Workerd only. No application, production server or external IO.
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, sep } from 'node:path';
import { performance } from 'node:perf_hooks';

const argv = process.argv.slice(2);
assert.equal(argv.length, 4, 'Usage: benchmark-pages-og.mjs --assets <generated-out> --report <local-directory>');
assert.equal(argv[0], '--assets'); assert.equal(argv[2], '--report');
const assets = resolve(argv[1]);
const report = resolve(argv[3]);
mkdirSync(report, { recursive: true });
const require = createRequire(import.meta.url);
const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
const clean = {};
for (const name of ['SystemRoot', 'SYSTEMROOT', 'WINDIR', 'PATH', 'Path', 'TEMP', 'TMP', 'TMPDIR']) if (process.env[name] !== undefined) clean[name] = process.env[name];
process.env = { ...clean, CI: 'true', MSY_QA_MODE: '1', NEXT_PUBLIC_ADS_DISABLED: '1', NEXT_TELEMETRY_DISABLED: '1', WRANGLER_SEND_METRICS: 'false', CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false' };
const { Miniflare, convertV4MiniflareOptions } = wranglerRequire('miniflare');
const stripModules = [];
let stripImports = '';
for (const [name, variable] of [['pool.bin', 'pool'], ['glyphs-36.bin', 'glyphs36'], ['glyphs-64.bin', 'glyphs64']]) {
  stripModules.push({ type: 'Data', path: name, contents: readFileSync(join(assets, '_worker.js/og', name)) });
  stripImports += `import ${variable} from './${name}';`;
}
const configSource = readFileSync(join(assets, '_worker.js/og/config.mjs'), 'utf8');
const config = configSource.slice(configSource.indexOf('export default ') + 15).trim().slice(0, -1);
JSON.parse(config); // Validate data, never evaluate arbitrary generated script text.
const stripSetup = `const strips={pool,glyphs36,glyphs64,config:${config}}; if(pool.byteLength+glyphs36.byteLength+glyphs64.byteLength>64000000)throw Error('Unexpected data size');`;
const bundle = await build({ stdin: { contents: `${stripImports} import { handlePagesOg } from './cloudflare/pages-og.ts'; ${stripSetup} export default { fetch(request, env) { return handlePagesOg(request, {ASSETS:env.ASSETS,OG_STRIPS:strips}); } };`, resolveDir: process.cwd() }, bundle: true, write: false, format: 'esm', platform: 'browser', minify: true, external: ['./pool.bin', './glyphs-36.bin', './glyphs-64.bin'] });
writeFileSync(join(report, 'worker-benchmark.mjs'), bundle.outputFiles[0].text);
let blockedOutbound = 0, assetCalls = 0;
const denyOutbound = () => { blockedOutbound++; return new Response('Denied', { status: 403 }); };
const assetFetch = async request => {
  assetCalls++;
  const url = new URL(request.url);
  assert.match(url.pathname, /^\/_msy\/og\/v1\/[a-z0-9/.-]+$/);
  assert.equal(url.search, '');
  const path = resolve(assets, '.' + url.pathname);
  assert.ok(path.startsWith(assets + sep));
  try { return new Response(readFileSync(path), { headers: { 'Content-Type': path.endsWith('.png') ? 'image/png' : 'application/octet-stream' } }); }
  catch { return new Response('Missing', { status: 404 }); }
};
const options = convertV4MiniflareOptions({ name: 'synthetic-pages-og', host: '127.0.0.1', port: 0, inspectorPort: 0, cf: false,
  compatibilityDate: '2025-09-08', modulesRoot: '/', modules: [{ type: 'ESModule', path: 'og-worker.mjs', contents: bundle.outputFiles[0].text }, ...stripModules],
  serviceBindings: { ASSETS: assetFetch }, outboundService: denyOutbound,
  unsafeRegisterWorker: false, unsafeLocalExplorer: false, unsafeObservability: false, logRequests: false });
assert.equal(options.host, '127.0.0.1'); assert.equal(options.cf, false);
assert.equal(options.workers[0].dev.outboundService.handler, denyOutbound);
const mf = new Miniflare(options);
let socket;
try {
  const base = await mf.ready;
  assert.equal(base.hostname, '127.0.0.1');
  const inspector = await mf.getInspectorURL();
  assert.equal(inspector.hostname, '127.0.0.1');
  const discovery = new URL('/json', inspector);
  discovery.protocol = 'http:';
  const targets = await (await fetch(discovery, { redirect: 'error' })).json();
  const target = targets.find(item => item.id === 'core:user:synthetic-pages-og') || targets.find(item => item.title?.includes('synthetic-pages-og'));
  assert.ok(target?.webSocketDebuggerUrl, 'Local inspector target required for CPU sampling');
  const wsUrl = new URL(target.webSocketDebuggerUrl);
  assert.ok(['127.0.0.1', 'localhost'].includes(wsUrl.hostname));
  socket = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    const entry = pending.get(data.id);
    if (entry) {
      pending.delete(data.id); clearTimeout(entry.timer);
      if (data.error) entry.reject(new Error(JSON.stringify(data.error)));
      else entry.resolve(data.result);
    }
  });
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const number = ++id;
    const timer = setTimeout(() => { pending.delete(number); reject(new Error('Local profiler timeout')); }, 10000);
    pending.set(number, { resolve, reject, timer }); socket.send(JSON.stringify({ id: number, method, params }));
  });
  await command('Profiler.enable');
  await command('Profiler.setSamplingInterval', { interval: 100 });
  const cases = [
    ['salary-cold', 'type=salary&amount=55000000&net=3550000'],
    ['salary-render-warm', 'type=salary&amount=55010000&net=3550000'],
    ['salary-cache-hit', 'type=salary&amount=55010000&net=3550000'],
    ['samsung-custom', 'type=tool&name=' + encodeURIComponent('삼성 성과급 세후 12,345만원')],
    ['korean-long', 'type=guide&title=' + encodeURIComponent('희귀 한글 뷁힣과 연봉 계산 정확성 '.repeat(10))],
    ['english', 'lang=en&title=Korea salary tax and stocks in English'],
    ['fun', 'type=fun&title=' + encodeURIComponent('직장인 머니 게임')],
    ['prebuilt', ''],
  ];
  const rows = [];
  for (const [name, query] of cases) {
    const beforeCalls = assetCalls;
    await command('Profiler.start');
    const start = performance.now();
    const response = await mf.dispatchFetch(new URL('/api/og?' + query, base), { headers: { 'User-Agent': 'MoneySalary-QA/1.0' } });
    const png = new Uint8Array(await response.arrayBuffer());
    const wall = performance.now() - start;
    const { profile } = await command('Profiler.stop');
    writeFileSync(join(report, name + '.cpuprofile'), JSON.stringify(profile));
    const functions = new Map(profile.nodes.map(node => [node.id, node.callFrame.functionName]));
    let sampledActiveUs = 0, idleUs = 0;
    const totals = new Map();
    profile.samples.forEach((sample, index) => {
      const name = functions.get(sample) || 'unknown';
      const delta = profile.timeDeltas[index];
      if (name === '(idle)' || name === '(program)') idleUs += delta;
      else sampledActiveUs += delta;
      totals.set(name, (totals.get(name) || 0) + delta);
    });
    assert.equal(response.status, 200, name); assert.equal(response.headers.get('X-OG-Error'), null, name); assert.equal(png[0], 137, name);
    writeFileSync(join(report, name + '.png'), png);
    rows.push({ name, wallMs: wall, sampledActiveMs: sampledActiveUs / 1000, idleOrUnattributedMs: idleUs / 1000,
      assetCalls: assetCalls - beforeCalls, bytes: png.length, cache: response.headers.get('X-OG-Cache'),
      sampledFunctions: [...totals].sort((a,b) => b[1] - a[1]).slice(0, 8) });
    console.log(JSON.stringify(rows.at(-1)));
  }
  assert.equal(blockedOutbound, 0);
  const result = { runtime: 'local Workerd via Miniflare; isolated bitmap module, mocked filesystem ASSETS', externalRequests: 0,
    mode: 'genuine ESM Data module imports + top-level strip dictionary',
    dataModuleBytes: stripModules.reduce((sum, item) => sum + item.contents.length, 0),
    metricLimit: 'V8 100us sampling is a diagnostic estimate, not Cloudflare billed CPU. Idle/program samples are reported separately; no free-plan production guarantee.',
    bundleBytes: bundle.outputFiles[0].contents.length, heapAfterRequests: await command('Runtime.getHeapUsage'), rows };
  writeFileSync(join(report, 'benchmark.json'), JSON.stringify(result, null, 2) + '\n');
} finally { socket?.close(); await mf.dispose(); }
