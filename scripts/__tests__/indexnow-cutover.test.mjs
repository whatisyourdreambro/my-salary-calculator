import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assertIndexNowProduction, captureCutover, submitCutover, validateCutoverManifest, main } from '../indexnow-ping.mjs';
import { workerReleaseConfig } from '../lib/cf-worker-release.mjs';

const VERSION = '11111111-2222-3333-4444-555555555555';
const ENV = { CF_API_TOKEN: 'test-only-token', CF_ACCOUNT_ID: 'a'.repeat(32), CF_WORKER_NAME: 'test-worker', CF_RELEASE_TAG: 'release-test', CF_EXPECTED_VERSION_ID: VERSION };
const XML = (items) => `<urlset>${items.map(([slug, date]) => `<url><loc>https://www.moneysalary.com/${slug}</loc><lastmod>${date}</lastmod></url>`).join('')}</urlset>`;
const OLD = XML([['calc/old', '2026-10-01'], ['calc/shared', '2026-10-01']]);
const NEW = XML([['calc/new', '2026-10-17'], ['calc/shared', '2026-10-17']]);
function fixture(t) {
  const cwd = mkdtempSync(path.join(os.tmpdir(), 'msy-indexnow-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  mkdirSync(path.join(cwd, '.next/server/app'), { recursive: true });
  mkdirSync(path.join(cwd, 'public'));
  writeFileSync(path.join(cwd, '.next/server/app/sitemap.xml.body'), NEW);
  writeFileSync(path.join(cwd, '.next/BUILD_ID'), 'test-production-build');
  writeFileSync(path.join(cwd, 'public', '0'.repeat(32) + '.txt'), 'fixture');
  return { cwd, manifestFile: path.join(cwd, 'cutover.json') };
}
function fetchStub({ published = NEW, failPost = false, tag = ENV.CF_RELEASE_TAG } = {}) {
  const calls = [];
  return { calls, fetchFn: async (url, init = {}) => {
    calls.push({ url, init });
    if (url === 'https://www.moneysalary.com/sitemap.xml') {
      assert.equal(init.method, 'GET');
      assert.equal(init.redirect, 'manual');
      assert.ok(init.headers.get('user-agent').includes('MoneySalary-QA/1.0'));
      return { status: 200, text: async () => published };
    }
    if (url.endsWith('/deployments')) return { status: 200, json: async () => ({ success: true, result: { deployments: [{ id: 'd1', strategy: 'percentage', versions: [{ version_id: VERSION, percentage: 100 }] }] } }) };
    if (url.includes('/versions/')) return { status: 200, json: async () => ({ success: true, result: { id: VERSION, annotations: { 'workers/tag': tag } } }) };
    assert.ok(['https://api.indexnow.org/indexnow', 'https://searchadvisor.naver.com/indexnow'].includes(url), 'unexpected network target');
    assert.equal(init.method, 'POST');
    assert.equal(init.redirect, 'error');
    assert.ok(init.headers['user-agent'].includes('MoneySalary-QA/1.0'));
    if (failPost) throw new Error('simulated timeout');
    return { status: 202 };
  } };
}
async function capture(t, options = {}) {
  const files = fixture(t);
  const stub = fetchStub({ published: OLD, ...options });
  const manifest = await captureCutover(files.manifestFile, { env: ENV, cwd: files.cwd, fetchFn: stub.fetchFn });
  return { ...files, manifest, captureCalls: stub.calls };
}

test('capture records pre-cutover delta, never sends, excludes token/key and refuses overwrite', async (t) => {
  const { manifestFile, manifest, cwd, captureCalls } = await capture(t);
  assert.equal(captureCalls.length, 1);
  assert.deepEqual(manifest.plan.counts, { added: 1, changed: 1, removed: 1, build: 2, prod: 2 });
  assert.equal(manifest.plan.urls.length, 3);
  assert.ok(!readFileSync(manifestFile, 'utf8').includes(ENV.CF_API_TOKEN));
  assert.ok(!readFileSync(manifestFile, 'utf8').includes('0'.repeat(32)));
  await assert.rejects(captureCutover(manifestFile, { env: ENV, cwd, fetchFn: () => { throw new Error('must not fetch'); } }), /already exists/);
});

test('submit verifies active release and public sitemap then submits saved delta once to each endpoint', async (t) => {
  const { manifestFile, cwd, manifest } = await capture(t);
  const stub = fetchStub();
  const submitted = await submitCutover(manifestFile, { env: ENV, cwd, fetchFn: stub.fetchFn });
  assert.equal(submitted.receipt.state, 'completed');
  const posts = stub.calls.filter((call) => call.init.method === 'POST');
  assert.equal(posts.length, 2);
  assert.deepEqual(JSON.parse(posts[0].init.body).urlList, manifest.plan.urls);
  assert.equal(posts[0].init.body, posts[1].init.body);
  const duplicate = await submitCutover(manifestFile, { env: ENV, cwd, fetchFn: () => { throw new Error('must not fetch on repeat'); } });
  assert.equal(duplicate.duplicate, true);
});

test('unactivated release or unchanged old public sitemap cannot submit or claim receipt', async (t) => {
  const { manifestFile, cwd } = await capture(t);
  for (const options of [{ tag: 'other-release' }, { published: OLD }]) {
    const stub = fetchStub(options);
    await assert.rejects(submitCutover(manifestFile, { env: ENV, cwd, fetchFn: stub.fetchFn }), /not verified|does not match/);
    assert.equal(stub.calls.filter((call) => call.init.method === 'POST').length, 0);
    assert.equal(existsSync(manifestFile + '.submission.json'), false);
  }
});

test('ambiguous endpoint failures keep receipt and block all automatic repeats', async (t) => {
  const { manifestFile, cwd } = await capture(t);
  const stub = fetchStub({ failPost: true });
  await assert.rejects(submitCutover(manifestFile, { env: ENV, cwd, fetchFn: stub.fetchFn }), /automatic repeat is disabled/);
  assert.equal(JSON.parse(readFileSync(manifestFile + '.submission.json')).state, 'needs-review');
  await assert.rejects(submitCutover(manifestFile, { env: ENV, cwd, fetchFn: () => { throw new Error('must not fetch'); } }), /already claimed or failed/);
  assert.equal(stub.calls.filter((call) => call.init.method === 'POST').length, 2);
});

test('concurrent submission attempts claim once and send only two total endpoint POSTs', async (t) => {
  const { manifestFile, cwd } = await capture(t);
  const stub = fetchStub();
  const results = await Promise.allSettled([1, 2].map(() => submitCutover(manifestFile, { env: ENV, cwd, fetchFn: stub.fetchFn })));
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(stub.calls.filter((call) => call.init.method === 'POST').length, 2);
});

test('tampering, wrong release identity, changed build and missing pinned version fail before requests', async (t) => {
  const { manifestFile, manifest, cwd } = await capture(t);
  assert.throws(() => validateCutoverManifest({ ...manifest, plan: { ...manifest.plan, urls: [] } }, workerReleaseConfig(ENV)), /checksum/);
  assert.throws(() => validateCutoverManifest(manifest, workerReleaseConfig({ ...ENV, CF_WORKER_NAME: 'other-worker' })), /mismatch/);
  const forbidden = () => { throw new Error('unexpected network'); };
  await assert.rejects(submitCutover(manifestFile, { env: { ...ENV, CF_EXPECTED_VERSION_ID: '' }, cwd, fetchFn: forbidden }), /CF_EXPECTED_VERSION_ID/);
  writeFileSync(path.join(cwd, '.next/BUILD_ID'), 'changed-build');
  await assert.rejects(submitCutover(manifestFile, { env: ENV, cwd, fetchFn: forbidden }), /Build changed/);
});

test('invalid old sitemap is not captured and never falls back to full submission', async (t) => {
  const { manifestFile, cwd } = fixture(t);
  const stub = fetchStub({ published: '<html>Error</html>' });
  await assert.rejects(captureCutover(manifestFile, { env: ENV, cwd, fetchFn: stub.fetchFn }), /Both build/);
  assert.equal(existsSync(manifestFile), false);
});

test('QA flags/paths override FORCE; Worker/deferred postbuild performs no requests', async () => {
  for (const env of [{ MSY_QA_MODE: '1' }, { MSY_QA_WORKER_STAGE: '1' }, { NEXT_PUBLIC_ADS_DISABLED: '1' }]) {
    assert.throws(() => assertIndexNowProduction({ ...env, INDEXNOW_FORCE: '1' }), /disabled for QA/);
  }
  assert.throws(() => assertIndexNowProduction({}, 'C:/project/.open-next-qa'), /disabled for QA/);
  assert.throws(() => assertIndexNowProduction({}, process.cwd(), 'C:/project/.next-qa'), /disabled for QA/);
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('unexpected network'); };
  try {
    await main({ CF_DEPLOY_TARGET: 'workers', INDEXNOW_FORCE: '1' });
    await main({ INDEXNOW_DEFER: '1', CF_PAGES: '1', CF_PAGES_BRANCH: 'main' });
  } finally { globalThis.fetch = original; }
});
