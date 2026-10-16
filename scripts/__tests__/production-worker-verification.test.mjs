import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { assertProductionEnvironment, inspectClientAdvertising, verifyProductionWorker } from '../verify-production-worker.mjs';

// Synthetic webpack AST only. Never evaluated, imported, or sent to a browser.
const guard = `function can(){if(typeof window==='undefined')return false;try{
const off=window.__MSY_TEST_MODE__===true||window.__MSY_ADS_DISABLED__===true;
if(off)window.sessionStorage.setItem('msy:disable-live-services','1');
return context({production:true,protocol:window.location.protocol,hostname:window.location.hostname,
topLevel:window.top===window&&window.parent===window&&window.frameElement===null,
automated:window.navigator.webdriver,userAgent:window.navigator.userAgent,
disabled:off||window.sessionStorage.getItem('msy:disable-live-services')==='1'});
}catch(e){return false;}}
function context(c){return c.production===true&&c.protocol==='https:'&&(c.hostname==='moneysalary.com'||c.hostname==='www.moneysalary.com')&&c.topLevel===true&&c.automated!==true&&c.disabled!==true&&!/headless|playwright|puppeteer|selenium|lighthouse|moneysalary-qa/i.test(c.userAgent??'');}`;
// Public policy shape emitted by Next 15.5.28/SWC; parsed as text only.
const inlineGuard = `let a="msy:disable-live-services";function can(){try{var e,t;let n=!0===window.__MSY_TEST_MODE__||!0===window.__MSY_ADS_DISABLED__||function(e){let t=new URLSearchParams(e);return t.getAll("ads").some(e=>/^(off|0|false|disabled)$/i.test(e))||t.getAll("test_mode").some(e=>/^(1|true|on)$/i.test(e))}(window.location.search);return n&&window.sessionStorage.setItem(a,"1"),e={production:!0,protocol:window.location.protocol,hostname:window.location.hostname,topLevel:window.top===window&&window.parent===window&&null===window.frameElement,automated:window.navigator.webdriver,userAgent:window.navigator.userAgent,disabled:n||"1"===window.sessionStorage.getItem(a)},!0===e.production&&"https:"===e.protocol&&("moneysalary.com"===e.hostname||"www.moneysalary.com"===e.hostname)&&!0===e.topLevel&&!0!==e.automated&&!0!==e.disabled&&!/headless|playwright|puppeteer|selenium|lighthouse|moneysalary-qa/i.test(null!=(t=e.userAgent)?t:"")}catch(e){return!1}}`;
function chunk(guardSource = guard, importedGuard = 1) {
  return `(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[42],{
1:(e,t,n)=>{n.d(t,{U4:()=>can});${guardSource}},
2:(e,t,n)=>{var a=n(${importedGuard});const id='G-EZ8GT7RPEZ';
function append(){if(!a.U4())return false;document.head.appendChild({id:'msy-ga-loader'});}
function install(){if(!a.U4())return false;append('msy-adsense-loader','https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2873403048341290');}
}}]);`;
}
const json = (value) => JSON.stringify(value);
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'msy-production-artifact-'));
  const write = (relative, value) => { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); };
  write('wrangler.jsonc', json({ name: 'moneysalary', account_id: 'b01a4e306f09d28f1a0f1d57bda8410d', main: 'cloudflare/worker-entry.mjs', workers_dev: false, preview_urls: false,
    routes: [{ pattern: 'www.moneysalary.com/*', zone_name: 'moneysalary.com' }, { pattern: 'moneysalary.com/*', zone_name: 'moneysalary.com' }], assets: { directory: '.open-next/assets', binding: 'ASSETS' } }));
  write('cloudflare/worker-entry.mjs', `import generated from '../.open-next/worker.js'; import {withRequestBodyLimits} from './request-body-limit.mjs'; export * from '../.open-next/worker.js'; export default withRequestBodyLimits(generated);`);
  write('cloudflare/request-body-limit.mjs', 'export function withRequestBodyLimits(worker){return worker}');
  write('.open-next/worker.js', `export default {async fetch(r,e,c){const {handler}=await import('./server-functions/default/handler.mjs');return handler(r,e,c)}};`);
  write('.open-next/server-functions/default/handler.mjs', 'export function handler(){}');
  write('.next/required-server-files.json', json({ appDir: root, config: { distDir: '.next', output: 'standalone', env: {}, eslint: { ignoreDuringBuilds: false }, typescript: { ignoreBuildErrors: false } } }));
  write('.next/routes-manifest.json', json({ headers: [{ source: '/:path*', headers: [{ key: 'Content-Security-Policy', value: "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com; frame-src https://googleads.g.doubleclick.net;" }] }] }));
  write('.next/BUILD_ID', 'offline-build'); write('.open-next/assets/BUILD_ID', 'offline-build');
  for (const base of ['.open-next/cache', '.open-next/assets/cdn-cgi/_next_cache']) {
    write(`${base}/offline-build/index.cache`, 'synthetic-home-cache');
    write(`${base}/offline-build/en/index.cache`, 'synthetic-english-cache');
  }
  write('.next/app-build-manifest.json', json({ pages: { '/layout': ['static/chunks/app/layout.js'] } }));
  write('.next/static/chunks/app/layout.js', chunk()); write('.open-next/assets/_next/static/chunks/app/layout.js', chunk());
  t.after(() => { assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir())); assert.match(path.basename(root), /^msy-production-artifact-/); fs.rmSync(root, { recursive: true, force: true }); });
  return { root, write, read: relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8')), verify: () => verifyProductionWorker({ root, env: {} }) };
}

test('production guard rejects all QA environments and QA build roots', () => {
  for (const key of ['MSY_QA_MODE', 'MSY_QA_WORKER_STAGE', 'NEXT_PUBLIC_ADS_DISABLED']) assert.throws(() => assertProductionEnvironment({ [key]: '1' }, '/production'), /disables production/);
  assert.throws(() => assertProductionEnvironment({}, '/project/.open-next-qa'), /QA directories/);
  assert.throws(() => assertProductionEnvironment({ NODE_ENV: 'test' }, '/production'), /NODE_ENV/);
  assert.doesNotThrow(() => assertProductionEnvironment({ NEXT_PUBLIC_ADS_DISABLED: '0', NODE_ENV: 'production' }, '/production'));
});
test('AST requires a live guard connected to the loader module', () => {
  const inspect = source => inspectClientAdvertising([{ filename: 'layout.js', source }]);
  assert.equal(inspect(chunk()).guard.moduleId, '1');
  assert.throws(() => inspect(chunk('function can(){return false;}')), /no executable/);
  assert.throws(() => inspect(chunk(`/* ${guard} */ function can(){return false;}`)), /no executable/);
  assert.throws(() => inspect(chunk(guard, 99)), /not connected/);
  assert.throws(() => inspect('const decoy=' + JSON.stringify(chunk()) + ';'), /no executable/);
  assert.throws(() => inspect(chunk(guard.replace('return context({', 'return false&&context({'))), /no executable/);
});
test('the called context policy must retain every required predicate and truth value', () => {
  const inspect = source => inspectClientAdvertising([{ filename: 'layout.js', source: chunk(source) }]);
  for (const [before, after] of [
    ['c.production===true', 'c.production===false'],
    ["c.protocol==='https:'", "c.protocol==='http:'"],
    ['c.topLevel===true', 'c.topLevel===false'],
    ['c.automated!==true', 'c.automated===true'],
    ['c.disabled!==true', 'c.disabled===true'],
    ['&&!/headless', '&&/headless'],
    ['production:true,protocol:', 'production:false,protocol:'],
    ['window.top===window', 'window.top!==window'],
    ['disabled:off||', 'disabled:true||'],
  ]) assert.throws(() => inspect(guard.replace(before, after)), /no executable/, `${before} -> ${after}`);
  const falsePolicy = guard.replace('function context(c){return ', 'function unusedContext(c){return ') + '\nfunction context(c){return false;}';
  assert.throws(() => inspect(falsePolicy), /no executable/, 'unused correct conditions cannot authorize the false callee');
  assert.throws(() => inspect(guard + '\ncontext=()=>false;'), /no executable/, 'reassigned callee');
  assert.throws(() => inspect(guard.replace('try{', 'try{const context=()=>false;')), /no executable/, 'shadowed callee');
});
test('policy comparison supports reversed minified booleans and SWC user-agent fallback', () => {
  const compact = guard.replace('c.production===true', '!0===c.production').replace('c.automated!==true', '!0!==c.automated')
    .replace('function context(c){return ', 'function context(c){var ua;return ').replace("c.userAgent??''", "null!=(ua=c.userAgent)?ua:''");
  assert.equal(inspectClientAdvertising([{ filename: 'layout.js', source: chunk(compact) }]).guard.moduleId, '1');
});
test('SWC inline policy resolves only its adjacent context assignment', () => {
  const inspect = source => inspectClientAdvertising([{ filename: 'layout.js', source: chunk(source) }]);
  assert.equal(inspect(inlineGuard).guard.moduleId, '1');
  for (const [before, after] of [
    ['!0===e.production', '!1===e.production'],
    ['production:!0,', 'production:!1,'],
    ['!0!==e.automated', '!0===e.automated'],
    ['!0!==e.disabled', '!0===e.disabled'],
    ['disabled:n||', 'disabled:!0||'],
    ['window.top===window', 'window.top!==window'],
    ['},!0===e.production', '},e={production:!1},!0===e.production'],
    ['},!0===e.production', '},false&&(!0===e.production'],
  ]) {
    let changed = inlineGuard.replace(before, after);
    if (after.includes('false&&(')) changed = changed.replace('t:"")}catch', 't:""))}catch');
    assert.throws(() => inspect(changed), /no executable/, `${before} -> ${after}`);
  }
  assert.throws(() => inspect(inlineGuard.replace('return n&&', 'return e={production:!1},n&&')), /no executable/, 'multiple context writes fail closed');
  assert.throws(() => inspect(inlineGuard.replace('var e,t;', 'var e={},t;')), /no executable/, 'context initializer outside the recognized assignment fails closed');
});
test('verified synthetic artifact records hashes without running its JavaScript', t => {
  const f = fixture(t); const result = f.verify();
  assert.equal(result.pass, true); assert.equal(result.buildId, 'offline-build');
  assert.match(result.files['.open-next/worker.js'].sha256, /^[a-f0-9]{64}$/);
  assert.equal(result.staticCache.files, 2);
  assert.equal(result.staticCache.bytes, Buffer.byteLength('synthetic-home-cachesynthetic-english-cache'));
  assert.match(result.staticCache.sha256, /^[a-f0-9]{64}$/);
  assert.equal(Object.keys(result.files).some(file => file.includes('/_next_cache/')), false, 'cache receipt stays compact');
  assert.equal(f.verify().staticCache.sha256, result.staticCache.sha256, 'aggregate is deterministic');
  assert.ok(fs.existsSync(path.join(f.root, '.artifacts/production-worker-verification.json')));
});
for (const [label, mutate, expected] of [
  ['QA header', f => { const value = f.read('.next/routes-manifest.json'); value.headers[0].headers.push({ key: 'X-MoneySalary-QA', value: 'ads-disabled' }); f.write('.next/routes-manifest.json', json(value)); }, /QA response header/],
  ['QA source directory', f => { const value = f.read('.next/required-server-files.json'); value.appDir += '/.open-next-qa'; f.write('.next/required-server-files.json', json(value)); }, /different or QA/],
  ['QA-only CSP', f => f.write('.next/routes-manifest.json', json({ headers: [{ headers: [{ key: 'Content-Security-Policy', value: "default-src 'self'; frame-src 'none'" }] }] })), /CSP is absent/],
  ['wrong Worker', f => { const value = f.read('wrangler.jsonc'); value.name = 'preview'; f.write('wrangler.jsonc', json(value)); }, /Worker identity/],
  ['wrong assets root', f => { const value = f.read('wrangler.jsonc'); value.assets.directory = '.open-next-qa/.open-next/assets'; f.write('wrangler.jsonc', json(value)); }, /entry\/assets/],
  ['different build ID', f => f.write('.open-next/assets/BUILD_ID', 'other'), /BUILD_ID mismatch/],
  ['changed deployed JS', f => f.write('.open-next/assets/_next/static/chunks/app/layout.js', chunk() + '\n// drift'), /client chunk differs/],
  ['QA optimized guard with real ad URL strings', f => { const source = chunk('function can(){return!1;}'); f.write('.next/static/chunks/app/layout.js', source); f.write('.open-next/assets/_next/static/chunks/app/layout.js', source); }, /no executable/],
  ['manifest traversal', f => f.write('.next/app-build-manifest.json', json({ pages: { '/layout': ['static/../escape.js'] } })), /unsafe client/],
  ['missing generated default handler', f => f.write('.open-next/worker.js', 'export default {};'), /no default fetch/],
]) test(`production artifact rejects ${label}`, t => { const f = fixture(t); mutate(f); assert.throws(f.verify, expected); });

for (const [label, mutate, expected] of [
  ['missing source', f => fs.renameSync(path.join(f.root, '.open-next/cache'), path.join(f.root, '.open-next/cache-removed')), /missing static cache tree/],
  ['missing mirror', f => fs.renameSync(path.join(f.root, '.open-next/assets/cdn-cgi/_next_cache'), path.join(f.root, '.open-next/assets/cdn-cgi/cache-removed')), /missing static cache tree/],
  ['empty source', f => {
    fs.unlinkSync(path.join(f.root, '.open-next/cache/offline-build/index.cache'));
    fs.unlinkSync(path.join(f.root, '.open-next/cache/offline-build/en/index.cache'));
  }, /static cache source is empty/],
  ['missing cache file', f => fs.unlinkSync(path.join(f.root, '.open-next/assets/cdn-cgi/_next_cache/offline-build/index.cache')), /mirror paths differ/],
  ['changed cache bytes', f => f.write('.open-next/assets/cdn-cgi/_next_cache/offline-build/index.cache', 'synthetic-HOME-cache'), /mirror bytes differ/],
  ['extraneous cache file', f => f.write('.open-next/assets/cdn-cgi/_next_cache/stale.cache', 'stale'), /mirror paths differ/],
  ['extraneous directory', f => fs.mkdirSync(path.join(f.root, '.open-next/assets/cdn-cgi/_next_cache/empty')), /mirror paths differ/],
  ['cache directory symlink', f => fs.symlinkSync(path.join(f.root, '.open-next/cache/offline-build'), path.join(f.root, '.open-next/assets/cdn-cgi/_next_cache/linked'), 'junction'), /symlinks are not allowed/],
]) test(`production static cache rejects ${label}`, t => { const f = fixture(t); mutate(f); assert.throws(f.verify, expected); });
