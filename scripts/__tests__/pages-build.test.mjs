// Synthetic fixtures only; no application build/browser or external network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { artifactHash, assertEnglishNotFoundDocument, BUILD_MARKER, canonicalPathname, checkAssetLimits, checkWorkerBundle, cleanBuildEnvironment,
  compileRoutingConfig, copyableSource, copySources, EXCLUDED_SOURCE_PATHS, inventoryHash, packageExport,
  loadPublicBuildSettings, PUBLIC_BUILD_CONFIG, QA_ASSETS_IGNORE, readPublicBuildConfiguration, resetOwnedStage,
  sha256, SOURCE_ITEMS, sourceInventory, stagePath, verifyArtifact, workerModuleInventory } from '../lib/pages-export.mjs';
import { pagesWorkerEntrySource, parseArgs, qaMiniflareOptions, validateQaConfig } from '../pages-build.mjs';

const require = createRequire(import.meta.url);
const qaConfig = JSON.parse(readFileSync(new URL('../../wrangler.pages.qa.jsonc', import.meta.url), 'utf8'));
const routing = { headers: [{ source: '/:path*', regex: '^/.*$', keys: ['path'], headers: [{ key: 'X-MoneySalary-QA', value: 'ads-disabled' }] }], redirects: [] };
const write = (root, file, value = '') => { const target = path.join(root, file); mkdirSync(path.dirname(target), { recursive: true }); writeFileSync(target, value); };
const english404Html = '<!doctype html><html lang="ko"><head><title>Page not found | Moneysalary</title><meta name="robots" content="noindex, nofollow"/></head><body><div data-page-state="not-found"><div lang="en" data-english-page="true"><h1>This English page could not be found</h1><a href="/en">English home</a><a href="/en/calculators">Calculators</a><a href="/en/guides">Guides</a></div></div></body></html>';
function moduleFixture(directory, entry) {
  for (const name of ['pool', 'glyphs-36', 'glyphs-64']) write(directory, `_worker.js/og/${name}.bin`, Buffer.from([1, 2, 255]));
  write(directory, '_worker.js/og/config.mjs', 'export default { version: 1 };');
  write(directory, '_worker.js/og/index.mjs', `import pool from './pool.bin';
import small from './glyphs-36.bin'; import large from './glyphs-64.bin'; import config from './config.mjs';
export const pagesOgData = { pool, small, large, config };`);
  if (entry !== undefined) write(directory, '_worker.js/index.js', entry);
}
function qaModuleFixture(stage, entry) {
  moduleFixture(path.join(stage, 'dist'), entry);
  write(stage, 'dist/.assetsignore', QA_ASSETS_IGNORE);
}
function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'msy-pages-fixture-'));
  // Only this exact mkdtemp fixture is recursively removed.
  t.after(() => { if (path.dirname(root) !== os.tmpdir() || !path.basename(root).startsWith('msy-pages-fixture-')) throw new Error('Unsafe fixture cleanup'); rmSync(root, { recursive: true, force: true }); });
  return root;
}
function exportFixture(root) {
  for (const name of ['index', '404', 'en/page-unavailable', 'guides/연봉']) {
    write(root, `out/${name}.html`, name === 'en/page-unavailable' ? english404Html : `<html><body>${name}</body></html>`);
    write(root, `out/${name}.txt`, `RSC:${name}`);
  }
  write(root, 'out/robots.txt', 'User-agent: *');
  write(root, 'out/sitemap.xml', '<urlset/>');
  write(root, 'out/widget/salary', '<html>static widget</html>');
  write(root, 'out/_msy/data/v1/company/example.html', '<div>company card</div>');
  write(root, 'out/_next/static/chunks/synthetic.js', '/* not executable fixture */');
  write(root, 'public/verify.html', 'ownership'); write(root, 'out/verify.html', 'ownership');
  write(root, 'public/.well-known/security.txt', 'security'); write(root, 'out/.well-known/security.txt', 'security');
  write(root, '.next/server/app/widget/salary.meta', JSON.stringify({ status: 200, headers: {
    'content-type': 'text/html; charset=utf-8', 'content-security-policy': "default-src 'none'", 'x-next-cache-tags': 'internal', 'cache-control': 'public, max-age=300' } }));
  write(root, '.next/server/app/sitemap.xml.meta', JSON.stringify({ status: 200, headers: { 'content-type': 'application/xml' } }));
  moduleFixture(path.join(root, 'out'));
}
function productionEnv() {
  return Object.fromEntries(['HOME_TOP', 'CALC_RESULT', 'GUIDE_MID', 'COMPANY_TOP'].map(slot => [`NEXT_PUBLIC_ADSENSE_SLOT_${slot}`, '1234567890']));
}
const productionConfigText = () => Object.entries(productionEnv()).map(([key, value]) => `${key}=${value}`).join('\n');

test('command parser forbids remote/production execution and arbitrary paths or options', () => {
  assert.deepEqual(parseArgs(['build', '--mode', 'production']), { command: 'build', mode: 'production', port: 3320 });
  assert.deepEqual(parseArgs(['start', '--mode', 'qa', '--port', '3319']), { command: 'start', mode: 'qa', port: 3319 });
  for (const args of [['deploy', '--mode', 'production'], ['start', '--mode', 'production'], ['start'],
    ['build', '--mode', 'qa', '--out', '../../out'], ['start', '--mode', 'qa', '--host', '0.0.0.0'],
    ['start', '--mode', 'qa', '--port', '443'], ['start', '--mode', 'qa', '--port', '3320', '--port', '3320'],
    ['build', '--mode', 'qa', '--mode', 'qa']]) assert.throws(() => parseArgs(args));
});

test('owned stages reject unmarked directories and links before recursive replacement', t => {
  const root = fixture(t);
  const stage = stagePath(root, 'qa');
  mkdirSync(stage); write(stage, 'important.txt', 'retain');
  assert.throws(() => resetOwnedStage(root, 'qa'), /unowned/);
  assert.equal(readFileSync(path.join(stage, 'important.txt'), 'utf8'), 'retain');
  rmSync(path.join(stage, 'important.txt')); rmSync(stage, { recursive: true });
  resetOwnedStage(root, 'qa'); write(stage, 'old.txt', 'old'); resetOwnedStage(root, 'qa');
  assert.equal(existsSync(path.join(stage, 'old.txt')), false);
  const outside = path.join(root, 'target'); mkdirSync(outside);
  symlinkSync(outside, path.join(root, '.pages-build'), 'junction');
  assert.throws(() => resetOwnedStage(root, 'production'), /Unsafe/);
});

test('source selection preserves static widget/company pages and public security files', () => {
  for (const excluded of EXCLUDED_SOURCE_PATHS) assert.equal(copyableSource(`${excluded}${excluded.endsWith('.ts') ? '' : '/route.ts'}`), false);
  for (const safe of ['src/app/widget/salary/route.ts', 'src/app/company/compare/page.tsx', 'public/.well-known/security.txt', 'vendor/parser/index.js'])
    assert.equal(copyableSource(safe), true);
  for (const unsafe of ['src/.env.local', 'scripts/.dev.vars', 'scripts/credentials/key.json', 'vendor/key.pem', 'src/lib/__tests__/unit.test.ts'])
    assert.equal(copyableSource(unsafe), false);
});

test('clean QA env removes credentials, preload hooks and production ids; production validates public allowlist', t => {
  const root = fixture(t), stage = stagePath(root, 'qa');
  const env = cleanBuildEnvironment({ PATH: 'safe-path', CF_API_TOKEN: 'not-a-real-secret', NODE_OPTIONS: '--require bad',
    NODE_EXTRA_CA_CERTS: '/bad', npm_config_registry: 'https://untrusted.invalid', FEEDBACK_RATE_LIMIT_SECRET: 'synthetic',
    ...productionEnv(), NEXT_PUBLIC_UNKNOWN_SECRET: 'synthetic' }, 'qa', stage);
  assert.equal(env.NEXT_PUBLIC_ADS_DISABLED, '1'); assert.equal(env.MSY_QA_MODE, '1');
  assert.equal(env.MSY_PAGES_STATIC_EXPORT, '1'); assert.equal(env.MSY_QA_PAGES_STAGE, '1');
  for (const name of ['CF_API_TOKEN', 'NODE_OPTIONS', 'NODE_EXTRA_CA_CERTS', 'FEEDBACK_RATE_LIMIT_SECRET', 'NEXT_PUBLIC_UNKNOWN_SECRET', 'NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP'])
    assert.equal(env[name], undefined);
  assert.equal(env.npm_config_registry, 'https://registry.npmjs.org/');
  assert.equal(env.HOME, path.join(stage, 'build-home'));
  assert.throws(() => cleanBuildEnvironment({}, 'production', stage), /Missing production/);
  assert.throws(() => cleanBuildEnvironment({ ...productionEnv(), MSY_QA_MODE: '1' }, 'production', stage), /inherited QA/);
  assert.throws(() => cleanBuildEnvironment({ ...productionEnv(), NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP: 'bad' }, 'production', stage), /Invalid/);
  const prod = cleanBuildEnvironment({ ...productionEnv(), NEXT_PUBLIC_GA_ID: 'G-ABC123', NEXT_PUBLIC_CONVERSION_LABEL_PAGEVIEW: 'Abc_def' }, 'production', stagePath(root, 'production'));
  assert.equal(prod.NEXT_PUBLIC_ADS_DISABLED, '0'); assert.equal(prod.NEXT_PUBLIC_GA_ID, 'G-ABC123');
});

test('public configuration parser rejects unknown/nonpublic keys, duplicate keys and evaluation syntax', () => {
  const text = productionConfigText();
  for (const extra of ['PRIVATE_KEY=synthetic', 'NEXT_PUBLIC_UNKNOWN=synthetic', 'export NEXT_PUBLIC_GA_ID=G-TEST',
    'NEXT_PUBLIC_GA_ID=G-TEST\nNEXT_PUBLIC_GA_ID=G-OTHER', 'NEXT_PUBLIC_GA_ID=${SYNTHETIC}',
    'NEXT_PUBLIC_GA_ID=$(synthetic)', 'NEXT_PUBLIC_GA_ID="G-TEST', 'NEXT_PUBLIC_GA_ID=',
    'NEXT_PUBLIC_GA_ID=G-TEST # inline comment', 'NEXT_PUBLIC_GA_ID="G-TEST\\nG-OTHER"'])
    assert.throws(() => loadPublicBuildSettings(`${text}\n${extra}`));
  assert.throws(() => loadPublicBuildSettings('#'.repeat(65537)), /configuration text/);
  assert.throws(() => loadPublicBuildSettings(text, { NEXT_PUBLIC_UNKNOWN: 'synthetic' }), /Unreviewed/);
  for (const key of ['MSY_QA_MODE', 'NEXT_PUBLIC_ADS_DISABLED', 'MSY_QA_PAGES_STAGE', 'MSY_QA_WORKER_STAGE'])
    assert.throws(() => loadPublicBuildSettings(text, { [key]: '1' }), /inherited QA/);
});

test('merged Windows public build settings retain the shell and system paths without ambient secrets', t => {
  const root = fixture(t);
  write(root, PUBLIC_BUILD_CONFIG, productionConfigText());
  const input = { ComSpec: 'C:\\Windows\\System32\\cmd.exe', Path: 'C:\\node',
    SystemRoot: 'C:\\Windows', windir: 'C:\\Windows', PRIVATE_TOKEN: 'synthetic' };
  const merged = readPublicBuildConfiguration(root, 'production', input);
  for (const mode of ['qa', 'production']) {
    const env = cleanBuildEnvironment(merged.input, mode, stagePath(root, mode));
    assert.equal(env.COMSPEC, input.ComSpec);
    assert.equal(env.PATH, input.Path);
    assert.equal(env.SYSTEMROOT, input.SystemRoot);
    assert.equal(env.WINDIR, input.windir);
    assert.equal(env.PRIVATE_TOKEN, undefined);
    assert.throws(() => cleanBuildEnvironment({ ...merged.input, COMSPEC: 'different-shell' }, mode, stagePath(root, mode)), /Ambiguous/);
  }
});

test('public configuration parser preserves valid explicit environment precedence without masking invalid file values', () => {
  const text = `# synthetic public configuration\r\n${productionConfigText()}\r\nNEXT_PUBLIC_GA_ID="G-FILE123"\r\nNEXT_PUBLIC_ADS_ID='AW-12345'\r\n`;
  const settings = loadPublicBuildSettings(text, { NEXT_PUBLIC_GA_ID: 'G-ENV456', PRIVATE_TOKEN: 'synthetic' });
  assert.equal(settings.NEXT_PUBLIC_GA_ID, 'G-ENV456'); assert.equal(settings.NEXT_PUBLIC_ADS_ID, 'AW-12345');
  assert.equal(settings.PRIVATE_TOKEN, undefined);
  assert.throws(() => loadPublicBuildSettings(text, { NEXT_PUBLIC_GA_ID: '' }), /Invalid approved/);
  assert.throws(() => loadPublicBuildSettings(text, { NEXT_PUBLIC_GA_ID: 'bad' }), /Invalid approved/);
  assert.throws(() => loadPublicBuildSettings(`${productionConfigText()}\nNEXT_PUBLIC_GA_ID=bad`, { NEXT_PUBLIC_GA_ID: 'G-VALID' }), /Invalid approved/);
});

test('production reads only an owned regular configuration; QA ignores even an invalid or linked file', t => {
  const root = fixture(t);
  const qaInput = { NEXT_PUBLIC_GA_ID: 'invalid', MSY_QA_MODE: '1' };
  assert.deepEqual(readPublicBuildConfiguration(root, 'qa', qaInput), { input: qaInput, identity: null });
  assert.throws(() => readPublicBuildConfiguration(root, 'production'), /owned regular/);
  write(root, PUBLIC_BUILD_CONFIG, 'PRIVATE_KEY=synthetic');
  assert.equal(readPublicBuildConfiguration(root, 'qa', qaInput).identity, null);
  assert.throws(() => readPublicBuildConfiguration(root, 'production'), /Unexpected/);
  const configText = productionConfigText(); write(root, PUBLIC_BUILD_CONFIG, configText);
  const loaded = readPublicBuildConfiguration(root, 'production', { NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP: '9876543210' });
  const env = cleanBuildEnvironment(loaded.input, 'production', stagePath(root, 'production'));
  assert.equal(env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP, '9876543210');
  assert.equal(loaded.identity.path, PUBLIC_BUILD_CONFIG); assert.equal(loaded.identity.fileHash, sha256(configText));
  assert.match(loaded.identity.effectiveHash, /^[a-f0-9]{64}$/);
  assert.deepEqual(loaded.identity.overriddenKeys, ['NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP']);
  assert.notEqual(loaded.identity.effectiveHash, readPublicBuildConfiguration(root, 'production').identity.effectiveHash);
  rmSync(path.join(root, PUBLIC_BUILD_CONFIG));
  write(root, 'synthetic-public-config.txt', configText);
  symlinkSync(path.join(root, 'synthetic-public-config.txt'), path.join(root, PUBLIC_BUILD_CONFIG));
  assert.equal(readPublicBuildConfiguration(root, 'qa', qaInput).identity, null);
  assert.throws(() => readPublicBuildConfiguration(root, 'production'), /owned regular/);
});

test('manifest pathname encoding is deterministic and refuses traversal/ambiguous separators', () => {
  assert.equal(canonicalPathname('/guides/연봉'), '/guides/%EC%97%B0%EB%B4%89');
  assert.equal(canonicalPathname('/guides/%EC%97%B0%EB%B4%89'), '/guides/%EC%97%B0%EB%B4%89');
  for (const value of ['/a%2fb', '/a%5cb', '/a%3fb', '/a%23b', '/a%252fb', '/a/../b', '//evil', '/x?y', '/x#y', '/%FF', '/x\n'])
    assert.throws(() => canonicalPathname(value), /Pages|pathname/);
});

test('native export packages HTML/TXT without mutating originals or moving ordinary text/data', t => {
  const stage = fixture(t); exportFixture(stage);
  const original = readFileSync(path.join(stage, 'out/index.html'));
  const result = packageExport({ stage, mode: 'qa', routingConfig: routing, buildId: 'synthetic-build' });
  const { manifest } = result;
  assert.equal(result.documentCount, 4);
  assert.match(manifest.routes['/'].asset, /^\/_msy\/doc\/[a-f0-9]{64}\.body$/);
  assert.match(manifest.routes['/'].rscAsset, /\.txt$/);
  assert.ok(manifest.routes['/guides/%EC%97%B0%EB%B4%89']);
  assert.deepEqual(readFileSync(path.join(stage, 'dist', manifest.routes['/'].asset)), original);
  assert.deepEqual(readFileSync(path.join(stage, 'out/index.html')), original);
  assert.equal(existsSync(path.join(stage, 'dist/index.html')), false);
  assert.equal(existsSync(path.join(stage, 'dist/index.txt')), false);
  for (const file of ['robots.txt', '.well-known/security.txt', '_msy/data/v1/company/example.html', '404.html'])
    assert.equal(existsSync(path.join(stage, 'dist', file)), true, file);
  assert.equal(existsSync(path.join(stage, 'dist/verify.html')), false);
  assert.equal(readFileSync(path.join(stage, 'dist', manifest.routes['/verify.html'].asset), 'utf8'), 'ownership');
  assert.equal(manifest.routes['/verify.html'].rscAsset, null);
  assert.ok(manifest.publicAssets.includes('/verify.html'));
  assert.equal(manifest.routes['/widget/salary'].headers['content-security-policy'], "default-src 'none'");
  assert.equal(manifest.routes['/widget/salary'].headers['x-next-cache-tags'], undefined);
  assert.equal(manifest.routes['/sitemap.xml'].headers['content-type'], 'application/xml');
  assert.equal(manifest.routes['/404'].status, 404);
  assert.equal(manifest.routes['/en/page-unavailable'].headers['cache-control'], 'private, no-store');
  const routes = JSON.parse(readFileSync(path.join(stage, 'dist/_routes.json')));
  assert.equal(routes.exclude.some(x => x.includes('_msy')), false);
  assert.match(readFileSync(path.join(stage, 'dist/_headers'), 'utf8'), /X-MoneySalary-QA: ads-disabled/);
  assert.equal(readFileSync(path.join(stage, 'dist/.assetsignore'), 'utf8'), QA_ASSETS_IGNORE);
  assert.equal(manifest.publicAssets.some(file => file.startsWith('/_worker.js')), false);
  assert.equal(Object.keys(manifest.routes).some(file => file.startsWith('/_worker.js')), false);
  assert.equal(workerModuleInventory(path.join(stage, 'dist'), { requireEntry: false }).length, 5);
});

test('packager fails closed without both 404 routes and on private cache headers', t => {
  const missing = fixture(t); write(missing, 'out/index.html', 'x');
  assert.throws(() => packageExport({ stage: missing, mode: 'qa', routingConfig: routing, buildId: 'x' }), /404/);
  const privateHeader = fixture(t); exportFixture(privateHeader);
  write(privateHeader, '.next/server/app/index.meta', JSON.stringify({ headers: { 'Set-Cookie': 'synthetic=value' } }));
  assert.throws(() => packageExport({ stage: privateHeader, mode: 'qa', routingConfig: routing, buildId: 'x' }), /Private response header/);
});

test('English 404 requires a native visible document and always overrides a generated 200 status', t => {
  const stage = fixture(t); exportFixture(stage);
  rmSync(path.join(stage, 'out/en/page-unavailable.html'));
  // Even a plausible .next fallback cannot replace the required native export.
  write(stage, '.next/server/app/en/page-unavailable.html', english404Html);
  write(stage, '.next/server/app/en/page-unavailable.meta', JSON.stringify({ status: 200 }));
  const run = () => packageExport({ stage, mode: 'qa', routingConfig: routing, buildId: 'current-build' });
  assert.throws(run, /English 404 native export is missing/);
  write(stage, 'out/en/page-unavailable.html', '<html id="__next_error__"><head></head><body><script>' + JSON.stringify(english404Html) + '</script></body></html>');
  assert.throws(run, /real English recovery document/);
  write(stage, 'out/en/page-unavailable.html', english404Html);
  const { manifest } = run();
  const route = manifest.routes['/en/page-unavailable'];
  assert.equal(route.status, 404); assert.match(route.rscAsset, /\.txt$/);
  assert.equal(route.headers['cache-control'], 'private, no-store');
  assert.equal(route.headers['x-robots-tag'], 'noindex, nofollow');
  assert.equal(readFileSync(path.join(stage, 'dist', route.asset), 'utf8'), english404Html);
});

test('English recovery validation ignores Flight, comments and inert templates', () => {
  assert.doesNotThrow(() => assertEnglishNotFoundDocument(english404Html));
  const noHeading = english404Html.replace('<h1>This English page could not be found</h1>', '');
  const fake = '<h1>This English page could not be found</h1>';
  for (const extra of [`<script>${JSON.stringify(fake)}</script>`, `<!--${fake}-->`, `<template>${fake}</template>`, `<style>${fake}</style>`])
    assert.throws(() => assertEnglishNotFoundDocument(noHeading.replace('</body>', extra + '</body>')), /English 404/);
  for (const bad of [english404Html.replace('data-page-state="not-found"', ''),
    english404Html.replace('lang="en"', 'lang="ko"'), english404Html.replace('href="/en/guides"', 'href="/guides"'),
    english404Html.replace('noindex, nofollow', 'index, follow')]) assert.throws(() => assertEnglishNotFoundDocument(bad), /English 404/);
});

test('build-time route compilation preserves regex constraints and redirect status', () => {
  const { pathToRegexp } = require('next/dist/compiled/path-to-regexp');
  const compiled = compileRoutingConfig({ headers: [{ source: '/:path*', headers: [] }],
    redirects: [{ source: '/company/:id((?!(?:compare|simulator)(?:/|$))[^/]+)', destination: '/salary-db/:id', permanent: true }] }, pathToRegexp);
  assert.deepEqual(compiled.redirects[0].keys, ['id']); assert.equal(compiled.redirects[0].statusCode, 308);
  const regex = new RegExp(compiled.redirects[0].regex, 'i');
  assert.equal(regex.test('/company/example'), true); assert.equal(regex.test('/company/compare'), false);
});

test('file limits and symlink rejection inspect bytes before any deploy operation', t => {
  const dir = fixture(t); write(dir, 'large.bin', Buffer.alloc(32));
  assert.throws(() => checkAssetLimits(dir, { files: 5, assetBytes: 31 }), /exceeds/);
  write(dir, 'second.txt', 'a'); assert.throws(() => checkAssetLimits(dir, { files: 1, assetBytes: 32 }), /count/);
  assert.equal(checkAssetLimits(dir, { files: 2, assetBytes: 32 }).assetBytes, 33);
  symlinkSync(path.join(dir, 'large.bin'), path.join(dir, 'link.bin'));
  assert.throws(() => checkAssetLimits(dir), /Symbolic/);
});

test('QA config/options refuse remote bindings and install mandatory outbound denial', t => {
  const deny = () => new Response('blocked', { status: 403 });
  const stage = path.join(fixture(t), '.pages-qa');
  qaModuleFixture(stage, 'export default { fetch() { return new Response("synthetic"); } };');
  const options = qaMiniflareOptions(stage, qaConfig, 3320, deny);
  assert.equal(options.host, '127.0.0.1'); assert.equal(options.cf, false); assert.equal(options.outboundService, deny);
  // Match the existing Pages preview/production runtime, without changing it.
  assert.equal(options.compatibilityDate, '2025-09-08');
  assert.deepEqual(options.compatibilityFlags, ['nodejs_compat']);
  assert.equal(options.assets.run_worker_first, true); assert.equal(options.assets.binding, 'ASSETS');
  for (const extra of [{ account_id: 'synthetic' }, { routes: [] }, { vars: {} }, { d1_databases: [] }, { services: [] }])
    assert.throws(() => validateQaConfig({ ...qaConfig, ...extra }), /local settings/);
  assert.throws(() => qaMiniflareOptions(path.resolve('/synthetic/.pages-build'), qaConfig, 3320, deny), /Invalid/);
  const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
  const { convertV4MiniflareOptions } = wranglerRequire('miniflare');
  const converted = convertV4MiniflareOptions(options);
  assert.equal(converted.workers.length, 1);
  assert.equal(converted.workers[0].dev.outboundService.handler, deny);
  assert.equal(options.modules.filter(module => module.type === 'Data').length, 3);
  write(stage, 'dist/.assetsignore', '');
  assert.throws(() => qaMiniflareOptions(stage, qaConfig, 3320, deny), /private Worker/);
});

test('native Workerd imports Data modules, hides Worker assets and blocks outbound fetch', { timeout: 30000 }, async t => {
  const stage = path.join(fixture(t), '.pages-qa');
  write(stage, 'dist/_msy/doc/synthetic.body', 'static synthetic document');
  qaModuleFixture(stage, `import { pagesOgData } from './og/index.mjs';
  export default { async fetch(request, env) {
    if (new URL(request.url).pathname === '/probe') return fetch('https://no-network.invalid/blocked');
    if (new URL(request.url).pathname === '/data') return Response.json({
      byte: new Uint8Array(pagesOgData.pool)[2], size: pagesOgData.small.byteLength + pagesOgData.large.byteLength,
      version: pagesOgData.config.version });
    if (new URL(request.url).pathname.startsWith('/_worker.js')) return env.ASSETS.fetch(request);
    return env.ASSETS.fetch(new Request(new URL('/_msy/doc/synthetic.body', request.url)));
  } };`);
  const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
  const { Miniflare, convertV4MiniflareOptions } = wranglerRequire('miniflare');
  let blocked = 0;
  const deny = () => { blocked++; return new Response('egress blocked', { status: 403 }); };
  const options = qaMiniflareOptions(stage, qaConfig, 3320, deny);
  // Port zero is only used by this synthetic internal-dispatch test to avoid
  // interfering with an agent's local QA server. The public CLI requires a port.
  options.port = 0;
  const previousEnv = process.env;
  const cleanEnv = cleanBuildEnvironment(previousEnv, 'qa', stage);
  mkdirSync(cleanEnv.HOME, { recursive: true });
  let mf;
  try {
    process.env = cleanEnv;
    mf = new Miniflare(convertV4MiniflareOptions(options));
    const base = await mf.ready;
    assert.equal(base.hostname, '127.0.0.1');
    const response = await mf.dispatchFetch(`${base.origin}/document`);
    const assetBody = await response.text();
    assert.equal(response.status, 200, assetBody);
    assert.equal(assetBody, 'static synthetic document');
    const data = await mf.dispatchFetch(`${base.origin}/data`);
    assert.deepEqual(await data.json(), { byte: 255, size: 6, version: 1 });
    const privateModule = await mf.dispatchFetch(`${base.origin}/_worker.js/og/pool.bin`);
    assert.equal(privateModule.status, 404);
    await privateModule.arrayBuffer();
    const denied = await mf.dispatchFetch(`${base.origin}/probe`);
    assert.equal(denied.status, 403); assert.equal(await denied.text(), 'egress blocked');
    assert.equal(blocked, 1);
  } finally { if (mf) await mf.dispose(); process.env = previousEnv; }
});

test('marker verification rejects changed assets, source and mode using complete hashes', t => {
  const root = fixture(t);
  for (const item of SOURCE_ITEMS) {
    if (item.includes('.')) write(root, item, item === 'wrangler.pages.qa.jsonc' ? JSON.stringify(qaConfig) : '{}');
    else write(root, `${item}/fixture.txt`, 'source');
  }
  const stage = resetOwnedStage(root, 'qa'); copySources(root, stage); exportFixture(stage);
  packageExport({ stage, mode: 'qa', routingConfig: routing, buildId: 'synthetic' }); write(stage, 'dist/_worker.js/index.js', '// synthetic');
  const marker = { version: 1, mode: 'qa', adsDisabled: true, buildId: 'synthetic', sourceHash: inventoryHash(sourceInventory(root)),
    outputHash: artifactHash(stage), lockHash: sha256(readFileSync(path.join(stage, 'package-lock.json'))),
    configHash: sha256(readFileSync(path.join(stage, 'wrangler.pages.qa.jsonc'))), ...checkWorkerBundle(path.join(stage, 'dist')) };
  write(stage, BUILD_MARKER, JSON.stringify(marker));
  assert.equal(verifyArtifact(root, 'qa').marker.buildId, 'synthetic');
  write(stage, 'dist/robots.txt', 'changed'); assert.throws(() => verifyArtifact(root, 'qa'), /stale/);
  write(stage, 'dist/robots.txt', 'User-agent: *');
  write(stage, 'dist/_worker.js/og/pool.bin', Buffer.from([1, 2, 254]));
  assert.throws(() => verifyArtifact(root, 'qa'), /stale/);
  write(stage, 'dist/_worker.js/og/pool.bin', Buffer.from([1, 2, 255]));
  write(root, 'src/fixture.txt', 'changed'); assert.throws(() => verifyArtifact(root, 'qa'), /stale/);
});

test('production marker tracks root public configuration without copying it; QA ignores its changes', t => {
  const root = fixture(t);
  for (const item of SOURCE_ITEMS) {
    if (item.includes('.')) write(root, item, item === 'wrangler.pages.qa.jsonc' ? JSON.stringify(qaConfig) : '{}');
    else write(root, `${item}/fixture.txt`, 'source');
  }
  write(root, PUBLIC_BUILD_CONFIG, productionConfigText());
  const stages = {};
  for (const mode of ['qa', 'production']) {
    const stage = resetOwnedStage(root, mode); stages[mode] = stage; copySources(root, stage); exportFixture(stage);
    assert.equal(existsSync(path.join(stage, PUBLIC_BUILD_CONFIG)), false);
    packageExport({ stage, mode, routingConfig: routing, buildId: `synthetic-${mode}` });
    write(stage, 'dist/_worker.js/index.js', '// synthetic');
    const marker = { version: 1, mode, adsDisabled: mode === 'qa', buildId: `synthetic-${mode}`,
      sourceHash: inventoryHash(sourceInventory(root)), outputHash: artifactHash(stage),
      lockHash: sha256(readFileSync(path.join(stage, 'package-lock.json'))),
      configHash: sha256(readFileSync(path.join(stage, 'wrangler.pages.qa.jsonc'))),
      ...(mode === 'production' ? { publicConfig: readPublicBuildConfiguration(root, mode).identity } : {}),
      ...checkWorkerBundle(path.join(stage, 'dist')) };
    write(stage, BUILD_MARKER, JSON.stringify(marker));
    assert.equal(verifyArtifact(root, mode).marker.buildId, `synthetic-${mode}`);
  }
  write(root, PUBLIC_BUILD_CONFIG, `${productionConfigText()}\n# tracked source changed`);
  assert.throws(() => verifyArtifact(root, 'production'), /public configuration is stale/);
  assert.equal(verifyArtifact(root, 'qa').marker.buildId, 'synthetic-qa');
  write(root, PUBLIC_BUILD_CONFIG, 'PRIVATE_KEY=synthetic');
  assert.equal(verifyArtifact(root, 'qa').marker.buildId, 'synthetic-qa');
  write(root, PUBLIC_BUILD_CONFIG, productionConfigText());
  const marker = JSON.parse(readFileSync(path.join(stages.production, BUILD_MARKER), 'utf8'));
  const originalConfig = marker.publicConfig;
  marker.publicConfig = { ...originalConfig, effectiveHash: '0'.repeat(64) };
  write(stages.production, BUILD_MARKER, JSON.stringify(marker));
  assert.throws(() => verifyArtifact(root, 'production', {}), /public configuration is stale/);
  const override = { NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP: '9876543210' };
  marker.publicConfig = readPublicBuildConfiguration(root, 'production', override).identity;
  write(stages.production, BUILD_MARKER, JSON.stringify(marker));
  assert.throws(() => verifyArtifact(root, 'production', {}), /public configuration is stale/);
  assert.equal(verifyArtifact(root, 'production', override).marker.buildId, 'synthetic-production');
  assert.throws(() => verifyArtifact(root, 'production', { ...override, MSY_QA_MODE: '1' }), /inherited QA/);
  delete marker.publicConfig;
  write(stages.production, BUILD_MARKER, JSON.stringify(marker));
  assert.throws(() => verifyArtifact(root, 'production'), /public configuration is stale/);
});

test('private Worker modules have a separate byte budget and an exact allowlist', t => {
  const dir = fixture(t);
  moduleFixture(dir, '// synthetic worker');
  write(dir, 'public.txt', 'asset');
  // Module source exceeds this synthetic asset limit, but is never an asset.
  assert.equal(checkAssetLimits(dir, { files: 1, assetBytes: 5 }).assetCount, 1);
  const summary = checkWorkerBundle(dir);
  assert.equal(summary.workerModuleCount, 6);
  assert.equal(summary.workerHash.length, 64);
  assert.throws(() => checkWorkerBundle(dir, { workerBytes: summary.workerBytes - 1 }), /modules exceed/);
  write(dir, '_worker.js/unreviewed.js', '// extra');
  assert.throws(() => checkWorkerBundle(dir), /unreviewed/);
  rmSync(path.join(dir, '_worker.js/unreviewed.js'));
  rmSync(path.join(dir, '_worker.js/og/pool.bin'));
  assert.throws(() => checkWorkerBundle(dir), /incomplete/);
});

test('production packaging contains no QA asset configuration or marker', t => {
  const stage = fixture(t); exportFixture(stage);
  packageExport({ stage, mode: 'production', routingConfig: { headers: [], redirects: [] }, buildId: 'production-fixture' });
  assert.equal(existsSync(path.join(stage, 'dist/.assetsignore')), false);
  assert.doesNotMatch(readFileSync(path.join(stage, 'dist/_headers'), 'utf8'), /ads-disabled/);
});

test('bundled wrapper preserves a real external Data module import and handler context', async t => {
  const stage = fixture(t);
  write(stage, 'generated/entry.mjs', pagesWorkerEntrySource());
  write(stage, 'cloudflare/pages-entry.ts', `export default { marker: 'handler', async fetch(request, env, context) {
    return Response.json({ marker: this.marker, binding: env.syntheticBinding, data: env.OG_STRIPS.config.version, context: context.value });
  } };`);
  const esbuild = require('esbuild');
  const bundle = await esbuild.build({ absWorkingDir: stage, entryPoints: ['generated/entry.mjs'],
    outfile: 'dist/_worker.js/index.js', external: ['./og/index.mjs'], bundle: true, format: 'esm', write: false, metafile: true });
  const imports = Object.values(bundle.metafile.outputs).flatMap(output => output.imports);
  assert.deepEqual(imports.map(({ path: file, external }) => ({ file, external })), [{ file: './og/index.mjs', external: true }]);
  // Use an entirely synthetic in-memory module; no application code is evaluated.
  const generated = bundle.outputFiles[0].text.replace(/import \{ pagesOgData \} from "\.\/og\/index\.mjs";/,
    'const pagesOgData = {config: {version: 7}};');
  const handler = (await import(`data:text/javascript;base64,${Buffer.from(generated).toString('base64')}`)).default;
  const result = await handler.fetch(new Request('http://127.0.0.1/synthetic'), { syntheticBinding: 'retained' }, { value: 'retained' });
  assert.deepEqual(await result.json(), { marker: 'handler', binding: 'retained', data: 7, context: 'retained' });
});
