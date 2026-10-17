// All responses and GitHub references are synthetic; no publisher/network calls.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { crc32, deflateSync } from 'node:zlib';
import { pagesReleaseCases } from '../verify-pages-release-http.mjs';
import { ATTESTATION_PATH, articleContract, assertCloudVerificationContext, assertAttestationMatches,
  validateAttestation, assertPromotion, readNativeAttestation, waitForNativeAttestation,
  captureCloudSitemap, verifyNativePublicRelease, cloudIndexNowPlan, submitCloudIndexNowOnce,
  verifyCloudArticle, assertCloudRemoteRef, cloudFailureDiagnostic } from '../pages-cloud-verify.mjs';

const COMMIT = 'a'.repeat(40), ORIGIN = 'https://www.moneysalary.com';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const sitemap = Buffer.from('<urlset><url><loc>' + ORIGIN + '/</loc></url><url><loc>' + ORIGIN + '/guides/approved-article</loc><lastmod>2026-10-18</lastmod></url></urlset>');
function attestation() { return { schema: 'moneysalary-native-pages-release-v1', schemaVersion: 1, mode: 'production', adsDisabled: false,
  commit: COMMIT, branch: 'codex/pages-production', buildId: 'synthetic-build', sourceHash: 'b'.repeat(64), lockHash: 'c'.repeat(64),
  publicConfigHash: 'd'.repeat(64), sitemapSha256: sha(sitemap), ci: { runId: 21, jobId: 22 }, approval: { runId: 31, actor: 'whatisyourdreambro' } }; }
function promotion() { return { schemaVersion: 1, commit: COMMIT, branch: 'codex/pages-production', previousCommit: 'f'.repeat(40),
  runId: 31, runAttempt: 1, ci: { runId: 21, jobId: 22 }, promotedAt: '2026-10-18T01:00:00.000Z', promoted: true }; }
function context() { return {
  env: { GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/main', GITHUB_SHA: COMMIT,
    GITHUB_REPOSITORY: 'whatisyourdreambro/my-salary-calculator', GITHUB_REPOSITORY_OWNER: 'whatisyourdreambro',
    GITHUB_ACTOR: 'whatisyourdreambro', GITHUB_TRIGGERING_ACTOR: 'whatisyourdreambro', GITHUB_RUN_ID: '31',
    GITHUB_RUN_ATTEMPT: '1', PAGES_CLOUD_PUBLISH_ENABLED: 'true', GITHUB_TOKEN: 'offline-generated-github-token' },
  event: { repository: { full_name: 'whatisyourdreambro/my-salary-calculator', owner: { login: 'whatisyourdreambro' } },
    sender: { login: 'whatisyourdreambro' }, ref: 'main', inputs: { approved_commit: COMMIT } },
}; }
function guarded(raw, init) {
  const url = new URL(raw); assert.equal(url.origin, ORIGIN); assert.equal(url.hash, '');
  assert.ok(['GET', 'HEAD'].includes(init.method)); assert.equal(init.redirect, 'manual'); assert.equal(init.credentials, 'omit');
  assert.match(init.headers.get('user-agent'), /MoneySalary-QA\/1\.0/); assert.ok(init.signal instanceof AbortSignal);
  for (const name of ['authorization', 'cookie', 'host', 'cache-control', 'pragma']) assert.equal(init.headers.get(name), null);
  return url.pathname + url.search;
}
function attestationResponse(value = attestation(), change = () => {}) {
  const headers = new Headers({ 'content-type': 'application/json', 'cache-control': 'private, no-store',
    'cdn-cache-control': 'no-store', 'cloudflare-cdn-cache-control': 'no-store', 'cf-cache-status': 'DYNAMIC',
    'x-robots-tag': 'noindex, nofollow', 'x-moneysalary-build': value.buildId });
  const output = { headers, status: 200, body: JSON.stringify(value) }; change(output);
  return new Response(output.body, { status: output.status, headers });
}

test('native context requires exact owner approval, commit, first run, no CF credentials or QA flags', () => {
  const { env, event } = context(); assert.equal(assertCloudVerificationContext(COMMIT, env, COMMIT, event), null);
  for (const change of [e => e.GITHUB_RUN_ATTEMPT = '2', e => e.GITHUB_SHA = 'b'.repeat(40),
    e => e.GITHUB_ACTOR = 'other', e => e.CF_API_TOKEN = 'never-print', e => e.CLOUDFLARE_OAUTH_TOKEN = 'never-print',
    e => e.NEXT_PUBLIC_ADS_DISABLED = '1', e => e.PAGES_CLOUD_PUBLISH_ENABLED = 'false', e => e.GITHUB_TOKEN = '',
    e => e.PAGES_ARTICLE_SLUG = 'unapproved']) {
    const copy = { ...env }; change(copy); assert.throws(() => assertCloudVerificationContext(COMMIT, copy, COMMIT, event));
  }
  assert.throws(() => assertCloudVerificationContext(COMMIT, env, 'b'.repeat(40), event));
  assert.throws(() => assertCloudVerificationContext(COMMIT, env, COMMIT, { ...event, inputs: { approved_commit: 'b'.repeat(40) } }));
});

test('attestation strict allowlist refuses extra secrets, wrong production state or unbound CI/approval IDs', () => {
  assert.deepEqual(validateAttestation(attestation()), attestation()); assert.doesNotThrow(() => assertAttestationMatches(attestation(), promotion()));
  for (const change of [a => a.secret = 'do-not-log', a => a.adsDisabled = true, a => a.branch = 'main',
    a => a.commit = 'short', a => a.buildId = '../other', a => a.ci.runId = '21', a => a.approval.actor = 'other',
    a => a.lockHash = 'bad', a => a.deploymentId = 'invented']) {
    const value = attestation(); change(value); assert.throws(() => validateAttestation(value));
  }
  for (const change of [a => a.ci.jobId++, a => a.approval.runId++, a => a.commit = 'b'.repeat(40)]) {
    const value = attestation(); change(value); assert.throws(() => assertAttestationMatches(value, promotion()));
  }
  assert.doesNotThrow(() => assertPromotion(promotion(), COMMIT, '31'));
  assert.throws(() => assertPromotion({ ...promotion(), promoted: false }, COMMIT, '31'));
  assert.throws(() => assertPromotion(promotion(), COMMIT, '32'));
});

test('manifest GET is fixed, bounded, credential-free and never executes document URLs', async () => {
  let count = 0;
  const value = await readNativeAttestation({ fetchFn: async (raw, init) => {
    assert.equal(guarded(raw, init), ATTESTATION_PATH); count++; return attestationResponse();
  } });
  assert.equal(count, 1); assert.deepEqual(value, attestation());
  assert.deepEqual(await readNativeAttestation({ fetchFn: async () => attestationResponse(attestation(), o => o.headers.delete('cloudflare-cdn-cache-control')) }), attestation());
  assert.equal(await readNativeAttestation({ fetchFn: async () => new Response('Old release', { status: 404 }) }), null);
});

test('manifest rejects redirect, cached or QA headers, oversized JSON and incorrect release header', async () => {
  for (const change of [o => { o.status = 302; o.headers.set('location', 'https://ads.invalid/'); },
    o => o.headers.set('cf-cache-status', 'HIT'), o => o.headers.set('age', '0'),
    o => o.headers.set('x-moneysalary-qa', 'ads-disabled'), o => o.headers.set('x-moneysalary-build', 'old'),
    o => o.headers.set('cloudflare-cdn-cache-control', 'public'), o => o.headers.set('content-length', '16385'),
    o => o.body = 'x'.repeat(16385), o => o.body = '{invalid'] ) {
    let calls = 0;
    await assert.rejects(readNativeAttestation({ fetchFn: async () => { calls++; return attestationResponse(attestation(), change); } }));
    assert.equal(calls, 1);
  }
});

test('bounded readiness polls only absent/old manifests and matches exact approval before returning', async () => {
  let time = 0, calls = 0; const receipts = [];
  const value = await waitForNativeAttestation(promotion(), {
    attempts: 3, intervalMs: 1000, timeoutMs: 10000, now: () => time, sleep: async ms => { time += ms; },
    persist: r => receipts.push(structuredClone(r)), fetchFn: async (raw, init) => {
      assert.equal(guarded(raw, init), ATTESTATION_PATH); calls++;
      return calls === 1 ? new Response('Absent', { status: 404 }) : attestationResponse({ ...attestation(), commit: calls === 2 ? 'b'.repeat(40) : COMMIT });
    },
  });
  assert.equal(calls, 3); assert.equal(time, 2000); assert.deepEqual(value, attestation()); assert.equal(receipts.at(-1).finished, true);
  assert.deepEqual(receipts.at(-1).polls.map(p => p.state), ['endpoint-absent', 'other-commit', 'expected-commit']);
});

test('readiness stops at its request budget or wrong expected approval without replaying a contract', async () => {
  let count = 0;
  await assert.rejects(waitForNativeAttestation(promotion(), { attempts: 2, intervalMs: 1000, sleep: async () => {},
    fetchFn: async () => { count++; return new Response('Absent', { status: 404 }); } }));
  assert.equal(count, 2); count = 0;
  await assert.rejects(waitForNativeAttestation(promotion(), { fetchFn: async () => {
    count++; return attestationResponse({ ...attestation(), approval: { runId: 999, actor: 'whatisyourdreambro' } });
  } })); assert.equal(count, 1);
  await assert.rejects(waitForNativeAttestation(promotion(), { attempts: 62 }));
});

function chunk(type, data) { const bytes = Buffer.alloc(data.length + 12); bytes.writeUInt32BE(data.length, 0); bytes.write(type, 4); data.copy(bytes, 8);
  bytes.writeUInt32BE(crc32(bytes.subarray(4, -4)), bytes.length - 4); return bytes; }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(1200, 0); ihdr.writeUInt32BE(630, 4); ihdr[8] = 8; ihdr[9] = 3;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('PLTE', Buffer.alloc(768)), chunk('IDAT', deflateSync(Buffer.alloc(1201 * 630))), chunk('IEND', Buffer.alloc(0))]);
function html(item) {
  if (item.english404) return '<html><head><title>Page not found | Moneysalary</title><meta name="robots" content="noindex, nofollow"></head><body><main data-page-state="not-found"><div lang="en" data-english-page><h1>This English page could not be found</h1><a href="/en">Home</a><a href="/en/calculators">Calculators</a><a href="/en/guides">Guides</a></div></main></body></html>';
  if (item.shareToken) return `<html><head><title>연봉 5,000만원 · 월 수령 추정 400만원 | 머니샐러리</title></head><body><main>50,000,000</main><script id="msy-pages-share-bootstrap" type="application/json">${JSON.stringify({ token: item.shareToken })}</script></body></html>`;
  if (item.invalidShare) return '<html><head><title>공유된 연봉 결과 | 머니샐러리</title></head><body><main data-pages-share-invalid="true">Invalid</main></body></html>';
  return '<html><head><title>Fixture</title></head><body><main>Fixture</main><script src="https://ads.invalid/never"></script></body></html>';
}
function cohort(change = () => {}, readAfter = async () => attestation()) {
  const cases = pagesReleaseCases(), calls = [], receipts = []; let refChecks = 0;
  return { calls, receipts, refChecks: () => refChecks, options: {
    assertRef: async () => { refChecks++; }, readAttestation: readAfter, persist: r => receipts.push(structuredClone(r)),
    fetchFn: async (raw, init) => {
      const item = cases[calls.length]; assert.ok(item); assert.equal(guarded(raw, init), item.route); calls.push(item.route);
      const headers = new Headers({ 'content-type': item.png ? 'image/png' : item.staticAsset ? 'application/xml' : 'text/html',
        'cache-control': item.private ? 'private, no-store' : 'public, max-age=0', 'cf-cache-status': item.private ? 'DYNAMIC' : 'MISS' });
      if (item.private) headers.set('cdn-cache-control', 'no-store');
      if (item.robots) headers.set('x-robots-tag', item.robots);
      if (!item.staticAsset) headers.set('x-moneysalary-build', attestation().buildId);
      const output = { status: item.status, headers, body: item.png ? png : item.staticAsset ? sitemap : html(item) }; change(item, output, calls.length);
      return new Response(output.body, { status: output.status, headers });
    },
  } };
}

test('native acceptance reuses all sixteen substantive contracts without fabricated control-plane flags', async () => {
  const f = cohort(), report = await verifyNativePublicRelease(attestation(), promotion(), f.options);
  assert.equal(report.finished, true); assert.equal(f.calls.length, 16); assert.equal(f.refChecks(), 2);
  assert.equal(report.sitemap.sha256, attestation().sitemapSha256); assert.equal(report.attestationVerifiedAfter, true);
  assert.equal(report.controlPlaneVerified, false); assert.equal(report.executedDocumentJavaScript, false);
  for (const field of ['purgeVerified', 'canonicalVerifiedBefore', 'canonicalVerifiedAfter', 'deploymentId', 'configurationHash', 'artifactHash']) assert.equal(field in report, false);
  assert.equal(JSON.stringify(report).includes('ads.invalid'), false);
});

test('wrong build, sitemap, private-cache HIT, broken share and PNG fail fast; no second cohort', async () => {
  for (const change of [(item, o) => o.headers.set('x-moneysalary-build', 'old'),
    (item, o) => { if (item.staticAsset) o.body = '<urlset></urlset>'; },
    (item, o, n) => { if (n === 12) o.headers.set('cf-cache-status', 'HIT'); },
    (item, o) => { if (item.shareToken) o.body = '<html>wrong title</html>'; },
    (item, o) => { if (item.png) { o.body = Buffer.from(png); o.body[40] ^= 1; } },
  ]) {
    const f = cohort(change); await assert.rejects(verifyNativePublicRelease(attestation(), promotion(), f.options));
    assert.ok(f.calls.length <= 12); assert.equal(f.refChecks(), 2); assert.equal(f.receipts.at(-1).finished, false);
  }
});

test('post-cohort manifest change rejects success and retains only sanitized diagnostics', async () => {
  const f = cohort(undefined, async () => ({ ...attestation(), buildId: 'different-build' }));
  await assert.rejects(verifyNativePublicRelease(attestation(), promotion(), f.options));
  assert.equal(f.calls.length, 16); assert.equal(f.receipts.at(-1).identityRecheckFailed, true);
  const transport = cohort(); transport.options.fetchFn = async () => { throw new DOMException('secret response / signed URL', 'TimeoutError'); };
  await assert.rejects(verifyNativePublicRelease(attestation(), promotion(), transport.options));
  assert.equal(JSON.stringify(transport.receipts).includes('secret response'), false); assert.equal(transport.receipts.at(-1).attemptedRequests, 1);
});

test('pre-promotion sitemap capture parses a bounded public document without requesting its URLs', async () => {
  let count = 0;
  const capture = await captureCloudSitemap(COMMIT, { fetchFn: async (raw, init) => {
    assert.equal(guarded(raw, init), '/sitemap.xml'); count++; return new Response(sitemap, { headers: { 'content-type': 'application/xml' } });
  } });
  assert.equal(count, 1); assert.equal(capture.snapshot.entries.length, 2); assert.equal(capture.snapshot.sha256, sha(sitemap));
  for (const body of ['<html>error code: 1102</html>', '<urlset>truncated', '<urlset></urlset>'])
    await assert.rejects(captureCloudSitemap(COMMIT, { fetchFn: async () => new Response(body, { headers: { 'content-type': 'application/xml' } }) }));
});

test('IndexNow computes only added/changed/removed URLs and refuses incomplete or mismatched gates', async () => {
  const f = cohort(), verification = await verifyNativePublicRelease(attestation(), promotion(), f.options);
  const capture = { schemaVersion: 1, commit: COMMIT, capturedAt: '2026-10-18T00:59:00.000Z',
    snapshot: { sha256: 'f'.repeat(64), entries: [[ORIGIN + '/', null], [ORIGIN + '/guides/removed', null]] } };
  const manifest = cloudIndexNowPlan(capture, verification, promotion());
  assert.deepEqual(manifest.plan.urls, [ORIGIN + '/guides/approved-article', ORIGIN + '/guides/removed']);
  assert.equal(manifest.plan.urls.includes(ORIGIN + '/'), false);
  for (const mutate of [v => v.finished = false, v => v.attestationVerifiedAfter = false, v => v.attestation.commit = 'f'.repeat(40),
    v => v.results.pop(), v => v.sitemap.sha256 = 'e'.repeat(64), v => v.executedDocumentJavaScript = true]) {
    const v = structuredClone(verification); mutate(v); assert.throws(() => cloudIndexNowPlan(capture, v, promotion()));
  }
  assert.throws(() => cloudIndexNowPlan({ ...capture, capturedAt: '2999-01-01' }, verification, promotion()));
});

test('IndexNow sends at most two fixed POSTs, retains ambiguous failure and refuses replay', async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'msy-native-notify-'));
  try {
    const file = path.join(dir, 'receipt.json'), requests = [], key = 'e'.repeat(32);
    const manifest = { commit: COMMIT, sha256: 'b'.repeat(64), plan: { submit: true, urls: [ORIGIN + '/guides/new'] } };
    await assert.rejects(submitCloudIndexNowOnce(manifest, { receiptFile: file, key, fetchFn: async (url, init) => {
      requests.push(url); assert.equal(init.method, 'POST'); assert.equal(init.redirect, 'error');
      assert.match(init.headers['user-agent'], /MoneySalary-QA/); assert.equal(init.headers.authorization, undefined);
      assert.deepEqual(JSON.parse(init.body).urlList, manifest.plan.urls); return new Response('', { status: requests.length === 1 ? 202 : 503 });
    } }));
    assert.deepEqual(requests, ['https://api.indexnow.org/indexnow', 'https://searchadvisor.naver.com/indexnow']);
    const receipt = JSON.parse(readFileSync(file)); assert.equal(receipt.state, 'needs-review'); assert.equal(JSON.stringify(receipt).includes(key), false);
    await assert.rejects(submitCloudIndexNowOnce(manifest, { receiptFile: file, key, fetchFn: () => assert.fail('No retry') }));
    const empty = await submitCloudIndexNowOnce({ ...manifest, plan: { submit: false, urls: [] } }, { receiptFile: path.join(dir, 'empty.json'), fetchFn: () => assert.fail('No empty notification') });
    assert.equal(empty.state, 'completed'); assert.deepEqual(empty.results, []);
  } finally { assert.equal(path.dirname(realpathSync(dir)), realpathSync(os.tmpdir())); assert.ok(path.basename(dir).startsWith('msy-native-notify-')); rmSync(dir, { recursive: true }); }
});

test('article inputs are one approved slug with either a bounded marker or a distinct internal retirement target', () => {
  assert.equal(articleContract({}), null);
  assert.deepEqual(articleContract({ PAGES_ARTICLE_SLUG: 'approved-article', PAGES_ARTICLE_MARKER: 'Title & salary' }), { slug: 'approved-article', retire: false, marker: 'Title & salary' });
  for (const env of [{ PAGES_ARTICLE_SLUG: '../escape', PAGES_ARTICLE_MARKER: 'x' }, { PAGES_ARTICLE_MARKER: 'x' },
    { PAGES_ARTICLE_SLUG: 'approved-article' }, { PAGES_ARTICLE_SLUG: 'a', PAGES_ARTICLE_MARKER: 'x', PAGES_RETIREMENT_TO: '/' },
    { PAGES_ARTICLE_SLUG: 'a', PAGES_RETIREMENT_TO: '//evil.invalid' }, { PAGES_ARTICLE_SLUG: 'a', PAGES_RETIREMENT_TO: '/guides/a/' }]) assert.throws(() => articleContract(env));
});

test('article acceptance checks title and sitemap; retirement checks one HEAD 308 without redirect following', async () => {
  const snapshot = { sha256: sha(sitemap), entries: [[ORIGIN + '/', null], [ORIGIN + '/guides/approved-article', null]] };
  const article = { slug: 'approved-article', retire: false, marker: 'Title & salary' }; let requests = 0;
  const good = await verifyCloudArticle(article, attestation(), snapshot, { fetchFn: async (raw, init) => {
    assert.equal(guarded(raw, init), '/guides/approved-article'); assert.equal(init.method, 'GET'); requests++;
    return new Response('<html><head><title>Title &amp; salary | MoneySalary</title></head></html>', { headers: { 'content-type': 'text/html', 'x-moneysalary-build': attestation().buildId } });
  } }); assert.equal(good.contractPassed, true); assert.equal(requests, 1);
  await assert.rejects(verifyCloudArticle(article, attestation(), snapshot, { fetchFn: async () => new Response('<html><script>Title & salary</script></html>', { headers: { 'content-type': 'text/html', 'x-moneysalary-build': attestation().buildId } }) }));
  const retired = { slug: 'removed', retire: true, to: '/guides' };
  const result = await verifyCloudArticle(retired, attestation(), snapshot, { fetchFn: async (raw, init) => {
    assert.equal(guarded(raw, init), '/guides/removed'); assert.equal(init.method, 'HEAD'); requests++;
    return new Response(null, { status: 308, headers: { location: ORIGIN + '/guides', 'x-moneysalary-build': attestation().buildId } });
  } }); assert.equal(result.status, 308); assert.equal(requests, 2);
});

test('public acceptance rechecks main and production branch through read-only injected GitHub API', async () => {
  const calls = [], api = { readMain: async () => { calls.push('main'); return COMMIT; },
    readProduction: async () => { calls.push('production'); return COMMIT; }, promote: () => assert.fail('No mutations') };
  await assertCloudRemoteRef(COMMIT, api, false); await assertCloudRemoteRef(COMMIT, api, true);
  assert.deepEqual(calls, ['main', 'main', 'production']);
  await assert.rejects(assertCloudRemoteRef(COMMIT, { ...api, readMain: async () => 'b'.repeat(40) }, true));
  await assert.rejects(assertCloudRemoteRef(COMMIT, { ...api, readProduction: async () => 'b'.repeat(40) }, true));
});

test('failure diagnostics retain an actionable fixed phase and safe class without raw assertion or transport details', () => {
  let error; try { assert.equal('secret response', 'expected'); } catch (caught) { error = caught; }
  assert.deepEqual(cloudFailureDiagnostic(error, 'readiness-attestation'), { stage: 'readiness-attestation', kind: 'contract-assertion' });
  assert.deepEqual(cloudFailureDiagnostic(new DOMException('signed URL and token', 'TimeoutError'), 'public-response-contracts'),
    { stage: 'public-response-contracts', kind: 'TimeoutError' });
});
