import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createPagesIndexNowManifest, validatePagesIndexNowManifest, assertPagesNotificationVerification,
  submitPagesNotificationOnce, readCanonicalSitemap } from '../pages-indexnow.mjs';
import { assertIndexNowProduction } from '../indexnow-ping.mjs';
const commit = 'a'.repeat(40), marker = { mode: 'production', adsDisabled: false, buildId: 'fixture', outputHash: 'b'.repeat(64), sourceHash: 'c'.repeat(64) };
const url = 'https://www.moneysalary.com/guides/fixture';
const previous = { ok: true, entries: new Map([[url, '2026-10-16']]) };
const build = { ok: true, entries: new Map([[url, '2026-10-17']]) };
const make = (overrides = {}) => createPagesIndexNowManifest({ commit, marker, previous, build, ...overrides });
test('Pages delta captures only changed URLs and rejects QA/tampered identity', () => {
  const manifest = make(); assert.deepEqual(manifest.plan.urls, [url]);
  assert.deepEqual(validatePagesIndexNowManifest(manifest, { commit, marker }), manifest);
  assert.throws(() => make({ marker: { ...marker, adsDisabled: true } }));
  assert.throws(() => validatePagesIndexNowManifest({ ...manifest, commit: 'd'.repeat(40) }, { commit, marker }));
  assert.throws(() => validatePagesIndexNowManifest(manifest, { commit, marker: { ...marker, buildId: 'other' } }));
  assert.throws(() => make({ previous: { ok: false } }));
  assert.throws(() => make({ build: { ok: true, entries: new Map([['https://www.moneysalary.com/adgk/fixture', null]]) } }));
});
test('Pages QA cannot submit even with force or paths disguised as root', () => {
  assert.throws(() => assertIndexNowProduction({ INDEXNOW_FORCE: '1' }, path.resolve('.pages-qa')));
  assert.throws(() => assertIndexNowProduction({ MSY_QA_PAGES_STAGE: '1', INDEXNOW_FORCE: '1' }));
});
test('notification requires exact successful HTTP evidence', () => {
  const manifest = make(), pins = { deploymentId: 'fixture-id', commit, buildId: marker.buildId, artifactHash: marker.outputHash, sourceHash: marker.sourceHash, configurationHash: 'e'.repeat(64), purgeVerified: true };
  const good = { finished: true, pins, purgeVerified: true, expectedRequests: 16, attemptedRequests: 16, passedRequests: 16, canonicalVerifiedBefore: true, canonicalVerifiedAfter: true, executedDocumentJavaScript: false, followedRedirects: 0, subresourceRequests: 0, automaticRetries: 0 };
  assert.doesNotThrow(() => assertPagesNotificationVerification(good, pins, manifest));
  assert.throws(() => assertPagesNotificationVerification({ ...good, finished: false }, pins, manifest));
  assert.throws(() => assertPagesNotificationVerification({ ...good, pins: { ...pins, deploymentId: 'other' } }, pins, manifest));
  assert.throws(() => assertPagesNotificationVerification({ ...good, passedRequests: 0 }, pins, manifest));
  assert.throws(() => assertPagesNotificationVerification({ ...good, purgeVerified: false }, pins, manifest));
  assert.throws(() => assertPagesNotificationVerification({ ...good, pins: { ...pins, sourceHash: 'f'.repeat(64) } }, pins, manifest));
});
test('notification claims before POST, saves only sanitized status, never resends', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'msy-pages-indexnow-')), receiptFile = path.join(dir, 'receipt.json');
  let requests = 0; const manifest = make();
  const args = { manifest, deploymentId: 'fixture-id', receiptFile, key: 'd'.repeat(32), fetchFn: async (target, options) => {
    requests++; assert.equal(JSON.parse(readFileSync(receiptFile)).state, 'claimed');
    assert.ok(['https://api.indexnow.org/indexnow', 'https://searchadvisor.naver.com/indexnow'].includes(target));
    assert.equal(options.redirect, 'error'); assert.deepEqual(JSON.parse(options.body).urlList, [url]);
    return new Response(null, { status: 202 });
  } };
  try {
    const result = await submitPagesNotificationOnce(args); assert.equal(result.state, 'completed'); assert.equal(requests, 2);
    await submitPagesNotificationOnce(args); assert.equal(requests, 2);
    assert.ok(!readFileSync(receiptFile, 'utf8').includes('d'.repeat(32)));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test('ambiguous notification stops subsequent attempts; empty delta sends nothing', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'msy-pages-indexnow-'));
  let requests = 0;
  const args = { manifest: make(), deploymentId: 'fixture-id', receiptFile: path.join(dir, 'bad.json'), key: 'd'.repeat(32), fetchFn: async () => { requests++; throw Error('private transport detail'); } };
  try {
    await assert.rejects(submitPagesNotificationOnce(args)); assert.equal(requests, 2);
    await assert.rejects(submitPagesNotificationOnce(args)); assert.equal(requests, 2);
    assert.ok(!readFileSync(args.receiptFile, 'utf8').includes('private transport detail'));
    const empty = await submitPagesNotificationOnce({ ...args, manifest: make({ build: previous }), receiptFile: path.join(dir, 'empty.json') });
    assert.equal(empty.state, 'completed'); assert.equal(requests, 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test('canonical sitemap reader is bounded non-rendering and refuses redirects', async () => {
  let calls = 0;
  const result = await readCanonicalSitemap(async (target, options) => {
    calls++; assert.equal(target, 'https://www.moneysalary.com/sitemap.xml'); assert.equal(options.redirect, 'manual');
    assert.match(options.headers.get('user-agent'), /MoneySalary-QA/);
    return new Response(`<urlset><url><loc>${url}</loc><lastmod>2026-10-17</lastmod></url></urlset>`);
  });
  assert.equal(result.ok, true); assert.equal(calls, 1);
  await assert.rejects(readCanonicalSitemap(async () => new Response(null, { status: 302, headers: { location: 'https://example.invalid/' } })));
});
