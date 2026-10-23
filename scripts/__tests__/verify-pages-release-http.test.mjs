// Every network response in this suite is synthetic. No remote/app/browser execution.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { crc32, deflateSync } from 'node:zlib';
import { configurationHash } from '../lib/pages-release.mjs';
import { assertPagesPrivateCache, assertPagesReleaseIdentity, assertReleasePng, pagesReleaseCases,
  readPagesReleasePins, readPagesReleaseState, resolvePagesReleaseReceiptDirectory,
  verificationReceipt, verifyPagesReleaseHttp, writeVerificationJson } from '../verify-pages-release-http.mjs';

function context() {
  const pins = { deploymentId: '11111111-2222-3333-4444-555555555555', rollbackDeploymentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    commit: 'a'.repeat(40), branch: 'main', buildId: 'synthetic-build', artifactHash: 'b'.repeat(64), sourceHash: 'c'.repeat(64),
    purgeVerified: true, purgedAt: '2026-01-01T00:00:00Z' };
  const project = { name: 'my-salary-calculator', production_branch: 'main', canonical_deployment: { id: pins.deploymentId },
    deployment_configs: { production: { env_vars: { PRIVATE_TEST: { type: 'secret_text', value: 'sentinel-never-in-report' } } } } };
  pins.configurationHash = configurationHash(project);
  const deployment = { id: pins.deploymentId, project_name: project.name, environment: 'production', is_skipped: false,
    short_id: 'abcdef12', url: 'https://abcdef12.my-salary-calculator.pages.dev', latest_stage: { name: 'deploy', status: 'success' },
    deployment_trigger: { metadata: { branch: 'main', commit_hash: pins.commit, commit_dirty: false } } };
  return { pins, project, deployment, marker: { mode: 'production', adsDisabled: false, buildId: pins.buildId,
    outputHash: pins.artifactHash, sourceHash: pins.sourceHash } };
}
const sitemap = Buffer.from('<urlset><url><loc>https://www.moneysalary.com/</loc></url></urlset>');
const english404 = '<html><head><title>Page not found | Moneysalary</title><meta name="robots" content="noindex, nofollow"></head><body><main data-page-state="not-found"><div lang="en" data-english-page><h1>This English page could not be found</h1><a href="/en">Home</a><a href="/en/calculators">Calculators</a><a href="/en/guides">Guides</a></div></main></body></html>';
function chunk(type, data) {
  const output = Buffer.alloc(data.length + 12); output.writeUInt32BE(data.length, 0); output.write(type, 4); data.copy(output, 8);
  output.writeUInt32BE(crc32(output.subarray(4, -4)), output.length - 4); return output;
}
function png() {
  const header = Buffer.alloc(13); header.writeUInt32BE(1200, 0); header.writeUInt32BE(630, 4); header[8] = 8; header[9] = 3;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('PLTE', Buffer.alloc(768)),
    chunk('IDAT', deflateSync(Buffer.alloc(1201 * 630))), chunk('IEND', Buffer.alloc(0))]);
}
const validPng = png();
const generic = '<html><head><title>Fixture</title></head><body><main>Fixture</main><script src="https://ads.example.invalid/never-requested.js"></script></body></html>';
function htmlFor(item) {
  if (item.english404) return english404;
  if (item.shareToken) return `<html><head><title>공유된 연봉 결과 | 머니샐러리</title></head><body><main>50,000,000</main><script id="msy-pages-share-bootstrap" type="application/json">${JSON.stringify({ v: 1, token: item.shareToken })}</script></body></html>`;
  if (item.invalidShare) return '<html><head><title>공유된 연봉 결과 | 머니샐러리</title></head><body><div data-pages-share-invalid="true">Invalid</div></body></html>';
  return generic;
}
function fixture(change = () => {}, after = async () => {}) {
  const state = context(), cases = pagesReleaseCases(), calls = [], reports = [];
  let checks = 0;
  const fetchFn = async (raw, init) => {
    const item = cases[calls.length], url = new URL(raw);
    assert.ok(item, 'No seventeenth request'); assert.equal(url.origin, 'https://www.moneysalary.com');
    assert.equal(url.pathname + url.search, item.route); assert.equal(url.hash, '');
    assert.equal(init.method, 'GET'); assert.equal(init.redirect, 'manual'); assert.equal(init.credentials, 'omit');
    assert.match(init.headers.get('user-agent'), /MoneySalary-QA\/1\.0/);
    for (const name of ['authorization', 'cookie', 'cache-control', 'pragma', 'host']) assert.equal(init.headers.get(name), null);
    assert.ok(init.signal instanceof AbortSignal); calls.push(item.route);
    const headers = new Headers({ 'content-type': item.png ? 'image/png' : item.staticAsset ? 'application/xml' : 'text/html; charset=utf-8',
      'cache-control': item.private ? 'private, no-store' : 'public, max-age=0, s-maxage=21600',
      'cf-cache-status': item.private ? 'BYPASS' : 'MISS' });
    if (!item.staticAsset) headers.set('x-moneysalary-build', state.pins.buildId);
    if (item.private) headers.set('cdn-cache-control', 'no-store, private');
    if (item.robots) headers.set('x-robots-tag', item.robots);
    const output = { status: item.status, headers, body: item.png ? validPng : item.staticAsset ? sitemap : htmlFor(item) };
    change(item, output, calls.length);
    return new Response(output.body, { status: output.status, headers: output.headers });
  };
  return { state, cases, calls, reports, checks: () => checks,
    options: { fetchFn, readSitemap: () => sitemap, persist: report => reports.push(structuredClone(report)),
      assertStillCanonical: async () => { checks++; await after(); } } };
}

test('sixteen exact guarded GETs preserve public MISS and repeat all five private URLs without executing HTML', async () => {
  const f = fixture(), report = await verifyPagesReleaseHttp(f.state, f.options);
  assert.equal(report.finished, true); assert.equal(f.calls.length, 16); assert.equal(new Set(f.calls).size, 11);
  assert.deepEqual(f.calls.slice(4, 9), f.calls.slice(11)); assert.equal(f.checks(), 1);
  assert.equal(report.canonicalVerifiedAfter, true); assert.equal(report.followedRedirects, 0);
  assert.equal(report.executedDocumentJavaScript, false); assert.equal(report.subresourceRequests, 0);
  assert.equal(JSON.stringify(report).includes('sentinel-never-in-report'), false);
  assert.equal(JSON.stringify(report).includes('ads.example.invalid'), false);
});

test('stale identity, configuration, QA artifact and missing purge fail before public HTTP', async () => {
  for (const change of [
    state => state.project.canonical_deployment.id = 'other', state => state.deployment.id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    state => state.deployment.deployment_trigger.metadata.commit_dirty = true, state => state.pins.purgeVerified = false,
    state => state.pins.purgedAt = '2999-01-01T00:00:00Z', state => state.marker.adsDisabled = true,
    state => state.marker.sourceHash = 'd'.repeat(64), state => state.marker.outputHash = 'd'.repeat(64),
    state => state.project.build_config = { build_command: 'changed' }, state => state.pins.rollbackDeploymentId = state.pins.deploymentId,
  ]) {
    const f = fixture(); change(f.state); assert.throws(() => assertPagesReleaseIdentity(f.state));
    await assert.rejects(verifyPagesReleaseHttp(f.state, f.options)); assert.equal(f.calls.length, 0);
  }
});

test('private no-store allows restrictive private addition but rejects all cache storage or uncertain statuses', () => {
  const good = () => new Headers({ 'cache-control': 'private, no-store', 'cdn-cache-control': 'no-store, private', 'cf-cache-status': 'BYPASS' });
  assert.doesNotThrow(() => assertPagesPrivateCache(good()));
  for (const status of ['HIT', 'STALE', 'UPDATING', 'REVALIDATED', 'MISS', 'EXPIRED', 'UNKNOWN', '']) {
    const headers = good(); headers.set('cf-cache-status', status); assert.throws(() => assertPagesPrivateCache(headers));
  }
  for (const [key, value] of [['age', '0'], ['age', '30'], ['cdn-cache-control', 'private'],
    ['cdn-cache-control', 'no-store, public'], ['cdn-cache-control', 'no-store, s-maxage=10'], ['cache-control', 'public, no-store']]) {
    const headers = good(); headers.set(key, value); assert.throws(() => assertPagesPrivateCache(headers));
  }
});

test('second-pass valid share cache HIT stops the cohort and produces a failed gate receipt', async () => {
  const f = fixture((item, output, count) => { if (count === 12) { output.headers.set('cf-cache-status', 'HIT'); output.headers.set('age', '1'); } });
  await assert.rejects(verifyPagesReleaseHttp(f.state, f.options));
  assert.equal(f.calls.length, 12); const report = f.reports.at(-1), receipt = verificationReceipt(report, f.state.pins);
  assert.equal(report.results[11].kind, 'valid-share'); assert.equal(report.results[11].contractFailed, true);
  assert.equal(receipt.finished, false); assert.equal(receipt.passedRequests, 11); assert.equal(f.checks(), 1);
});

test('wrong home build, changed sitemap, redirect, oversized body and resource-limit page stop without retry', async () => {
  const mutations = [
    (item, output) => output.headers.set('x-moneysalary-build', 'old'),
    (item, output) => { if (item.staticAsset) output.body = '<wrong/>'; },
    (item, output) => { output.status = 302; output.headers.set('location', 'https://external.invalid/adgk/'); },
    (item, output) => output.headers.set('content-length', String(9 * 1024 * 1024)),
    (item, output) => output.body = '<html>Worker exceeded resource limits</html>',
  ];
  for (const mutate of mutations) {
    const f = fixture(mutate); await assert.rejects(verifyPagesReleaseHttp(f.state, f.options));
    assert.ok(f.calls.length <= 2); assert.equal(f.checks(), 1);
    assert.equal(JSON.stringify(f.reports).includes('external.invalid'), false);
  }
});

test('share metadata, English 404 DOM, and corrupted PNGs are substantive response checks', async () => {
  for (const mutate of [
    (item, output) => { if (item.shareToken) output.body = generic; },
    (item, output) => { if (item.english404) output.body = generic; },
    (item, output) => { if (item.png) { output.body = Buffer.from(validPng); output.body[40] ^= 1; } },
  ]) {
    const f = fixture(mutate); await assert.rejects(verifyPagesReleaseHttp(f.state, f.options)); assert.ok(f.calls.length < 16);
  }
  assert.doesNotThrow(() => assertReleasePng(validPng));
  const bad = Buffer.from(validPng); bad[0] = 0; assert.throws(() => assertReleasePng(bad));
});

test('transport errors and canonical drift produce failed sanitized receipts', async () => {
  const f = fixture(); let calls = 0;
  f.options.fetchFn = async () => { calls++; throw new DOMException('secret raw endpoint', 'TimeoutError'); };
  await assert.rejects(verifyPagesReleaseHttp(f.state, f.options));
  assert.equal(calls, 1); assert.equal(f.reports.at(-1).results[0].transportErrorName, 'TimeoutError');
  assert.equal(JSON.stringify(f.reports).includes('secret raw endpoint'), false); assert.equal(f.checks(), 1);
  const drift = fixture(undefined, async () => { throw new Error('changed'); });
  await assert.rejects(verifyPagesReleaseHttp(drift.state, drift.options));
  assert.equal(drift.calls.length, 16); assert.equal(drift.reports.at(-1).canonicalRecheckFailed, true);
});

test('control-plane API is two fixed authenticated GETs and refuses other accounts or unsafe IDs', async () => {
  const state = context(), calls = [];
  const env = { CF_ACCOUNT_ID: 'b01a4e306f09d28f1a0f1d57bda8410d', CF_API_TOKEN: 'fake-offline-token-not-a-real-credential' };
  const fetchFn = async (url, init) => {
    calls.push(url); assert.equal(new URL(url).origin, 'https://api.cloudflare.com');
    assert.equal(init.method, 'GET'); assert.equal(init.redirect, 'error');
    assert.equal(init.headers.Authorization, 'Bearer ' + env.CF_API_TOKEN);
    return Response.json({ success: true, result: url.includes('/deployments/') ? state.deployment : state.project });
  };
  const result = await readPagesReleaseState(state.pins, env, fetchFn);
  assert.equal(calls.length, 2); assert.deepEqual(result.project, state.project); assert.deepEqual(result.deployment, state.deployment);
  await assert.rejects(readPagesReleaseState(state.pins, { ...env, CF_ACCOUNT_ID: '0'.repeat(32) }, fetchFn));
  await assert.rejects(readPagesReleaseState({ ...state.pins, deploymentId: '../escape' }, env, fetchFn));
  assert.equal(calls.length, 2);
});

test('atomic gate summary contains exact pins and no response body or secret fields', async () => {
  const f = fixture(), report = await verifyPagesReleaseHttp(f.state, f.options), receipt = verificationReceipt(report, f.state.pins);
  assert.equal(receipt.finished, true); assert.equal(receipt.pins.deploymentId, f.state.pins.deploymentId);
  assert.equal(receipt.passedRequests, 16); assert.equal(receipt.canonicalVerifiedAfter, true);
  const directory = mkdtempSync(path.join(os.tmpdir(), 'msy-release-receipt-test-'));
  try {
    const filename = path.join(directory, 'verification.json'); writeVerificationJson(filename, receipt);
    assert.deepEqual(JSON.parse(readFileSync(filename, 'utf8')), receipt);
    writeVerificationJson(filename, { ...receipt, finished: false });
    assert.equal(JSON.parse(readFileSync(filename, 'utf8')).finished, false);
    assert.deepEqual(readdirSync(directory), ['verification.json']);
    assert.equal(readFileSync(filename, 'utf8').includes('sentinel-never-in-report'), false);
  } finally {
    assert.equal(path.dirname(directory), path.resolve(os.tmpdir()));
    assert.ok(path.basename(directory).startsWith('msy-release-receipt-test-'));
    assert.equal(realpathSync(directory), path.resolve(directory));
    rmSync(directory, { recursive: true, force: true });
  }
});

function withReceiptWorkspace(callback) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'msy-release-path-test-'));
  try { return callback(directory); }
  finally {
    assert.equal(path.dirname(realpathSync(directory)), realpathSync(os.tmpdir()));
    assert.ok(path.basename(directory).startsWith('msy-release-path-test-'));
    rmSync(directory, { recursive: true, force: true });
  }
}

test('receipt selection preserves the CI directory and permits only the exact local full-SHA directory', () => {
  withReceiptWorkspace(workspace => {
    const ci = path.join(workspace, '.artifacts/pages-release'); mkdirSync(ci, { recursive: true });
    assert.deepEqual(resolvePagesReleaseReceiptDirectory(workspace), { directory: ci, localCommit: null });
    const commit = context().pins.commit, local = path.join(workspace, '.artifacts/pages-release-local', commit);
    assert.deepEqual(resolvePagesReleaseReceiptDirectory(workspace, local), { directory: local, localCommit: commit });
    for (const directory of [path.join(workspace, 'outside', commit), path.join(workspace, '.artifacts/pages-release-local/short'),
      path.join(workspace, '.artifacts/pages-release-local'), path.join(workspace, '.artifacts/pages-release', commit), './relative'])
      assert.throws(() => resolvePagesReleaseReceiptDirectory(workspace, directory));
    assert.deepEqual(readdirSync(path.join(workspace, '.artifacts/pages-release-local')), [commit]);
  });
});

test('local receipt commit mismatches and linked receipt files or directory ancestors fail before API reads', () => {
  withReceiptWorkspace(workspace => {
    const { pins } = context();
    const selected = resolvePagesReleaseReceiptDirectory(workspace, path.join(workspace, '.artifacts/pages-release-local', pins.commit));
    const file = path.join(selected.directory, 'production-pins.json');
    writeFileSync(file, JSON.stringify(pins));
    assert.deepEqual(readPagesReleasePins(workspace, selected.directory).pins, pins);
    writeFileSync(file, JSON.stringify({ ...pins, commit: 'b'.repeat(40) }));
    assert.throws(() => readPagesReleasePins(workspace, selected.directory));
    rmSync(file);
    const alternate = path.join(workspace, 'alternate.json'); writeFileSync(alternate, JSON.stringify(pins));
    symlinkSync(alternate, file, 'file');
    assert.throws(() => readPagesReleasePins(workspace, selected.directory));
    const ci = path.join(workspace, '.artifacts/pages-release');
    symlinkSync(selected.directory, ci, 'junction');
    assert.throws(() => resolvePagesReleaseReceiptDirectory(workspace, ci));
  });
});

test('injected local control API is read-only and does not require or copy an OAuth token into env', async () => {
  const state = context(), calls = [], env = Object.freeze({});
  const api = { readProject: async () => { calls.push('project'); return state.project; },
    readDeployment: async id => { calls.push(id); return state.deployment; },
    upload: () => assert.fail('Never mutate from HTTP verification') };
  const forbiddenFetch = () => assert.fail('No fallback authentication or network');
  for (let pass = 0; pass < 2; pass++) {
    const result = await readPagesReleaseState(state.pins, env, forbiddenFetch, api);
    assertPagesReleaseIdentity({ ...state, ...result });
  }
  assert.deepEqual(calls, ['project', state.pins.deploymentId, 'project', state.pins.deploymentId]);
  assert.deepEqual(env, {});
  await assert.rejects(readPagesReleaseState({ ...state.pins, deploymentId: '../escape' }, env, forbiddenFetch, api));
  await assert.rejects(readPagesReleaseState(state.pins, env, forbiddenFetch, {}));
  assert.equal(calls.length, 4);
});
