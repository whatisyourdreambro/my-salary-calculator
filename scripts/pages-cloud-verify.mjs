// Native Pages acceptance without Cloudflare credentials or control-plane claims.
// Public documents only: no browser, JavaScript, subresources or redirect following.
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import guard from './lib/qa-production-http.cjs';
import bodyGuard from './lib/qa-pages-deployment-http.cjs';
import { runPagesResponseContracts, assertPagesPrivateCache, writeVerificationJson } from './verify-pages-release-http.mjs';
import { HOST, readSitemap, planSubmission } from './indexnow-diff.mjs';
import { submitIndexNow } from './indexnow-submit.mjs';
import { assertRetirementTarget } from './trend-publish/verify-prod.mjs';
import { NATIVE_RELEASE_PATH, validateNativeRelease } from '../cloudflare/pages-native-release.mjs';
import { CLOUD_RELEASE_BRANCH, assertCloudPublishContext, cloudReleaseDirectory, createCloudGithubClient } from './pages-cloud-publish.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = guard.CANONICAL_PRODUCTION_ORIGIN;
export const ATTESTATION_PATH = NATIVE_RELEASE_PATH;
const SHA = /^[a-f0-9]{40}$/, HASH = /^[a-f0-9]{64}$/;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const jsonHash = value => hash(JSON.stringify(value));
const positive = value => assert.ok(Number.isSafeInteger(value) && value > 0);
const stamp = value => assert.ok(typeof value === 'string' && Number.isFinite(Date.parse(value)));
export function cloudFailureDiagnostic(error, stage) {
  return { stage, kind: error?.code === 'ERR_ASSERTION' ? 'contract-assertion'
    : ['TimeoutError', 'AbortError', 'TypeError', 'SyntaxError'].includes(error?.name) ? error.name : 'gate-error' };
}

export function articleContract(env = {}) {
  const slug = env.PAGES_ARTICLE_SLUG || '', marker = env.PAGES_ARTICLE_MARKER || '', to = env.PAGES_RETIREMENT_TO || '';
  if (!slug && !marker && !to) return null;
  assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/); assert.ok(slug.length <= 160);
  if (to) { assert.equal(marker, ''); assertRetirementTarget(slug, to); return { slug, retire: true, to }; }
  assert.ok(marker.trim() === marker && marker.length > 0 && marker.length <= 500 && !/[\u0000-\u001f\u007f]/.test(marker));
  return { slug, retire: false, marker };
}

export function assertCloudVerificationContext(commit, env, head, event) {
  assertCloudPublishContext(commit, env, event); assert.equal(head, commit);
  assert.ok(typeof env.GITHUB_TOKEN === 'string' && env.GITHUB_TOKEN.length > 0 && !/[\r\n]/.test(env.GITHUB_TOKEN));
  for (const key of ['CF_API_TOKEN', 'CF_API_KEY', 'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_API_KEY', 'CLOUDFLARE_OAUTH_TOKEN']) assert.ok(!env[key], 'Cloud verification does not accept Cloudflare credentials');
  for (const key of ['NEXT_PUBLIC_ADS_DISABLED', 'MSY_QA_MODE', 'MSY_QA_PAGES_STAGE', 'MSY_QA_WORKER_STAGE', 'MSY_QA_SERVER']) assert.notEqual(env[key], '1');
  for (const [name, input] of [['PAGES_ARTICLE_SLUG', 'article_slug'], ['PAGES_ARTICLE_MARKER', 'article_marker'], ['PAGES_RETIREMENT_TO', 'retirement_to']])
    assert.equal(env[name] || '', event.inputs[input] || '');
  return articleContract(env);
}

export const cloudReceiptDirectory = cloudReleaseDirectory;
function readJson(file) {
  const stat = lstatSync(file); assert.equal(stat.isSymbolicLink(), false); assert.equal(stat.isFile(), true);
  assert.ok(stat.size < 3 * 1024 * 1024); assert.equal(realpathSync(file), file); return JSON.parse(readFileSync(file, 'utf8'));
}
function claim(file, data) { writeFileSync(file, JSON.stringify(data, null, 2) + '\n', { flag: 'wx', mode: 0o600 }); }

export const validateAttestation = validateNativeRelease;

export function assertPromotion(promotion, commit, runId) {
  assert.equal(promotion.schemaVersion, 1); assert.equal(promotion.commit, commit); assert.equal(promotion.branch, CLOUD_RELEASE_BRANCH);
  assert.equal(promotion.promoted, true); assert.equal(String(promotion.runId), String(runId)); assert.equal(Number(promotion.runAttempt), 1);
  assert.match(promotion.previousCommit || '', SHA); positive(promotion.ci?.runId); positive(promotion.ci?.jobId); stamp(promotion.promotedAt);
  return promotion;
}
export function assertAttestationMatches(value, promotion) {
  validateAttestation(value); assert.equal(value.commit, promotion.commit); assert.deepEqual(value.ci, promotion.ci);
  assert.equal(value.approval.runId, Number(promotion.runId)); return value;
}

async function boundedJson(response) {
  assert.match(response.headers.get('content-type') || '', /^application\/json(?:;|$)/i);
  const declared = response.headers.get('content-length');
  if (declared !== null) assert.ok(/^\d+$/.test(declared) && Number(declared) <= 16384);
  const reader = response.body?.getReader(); assert.ok(reader);
  const parts = []; let length = 0;
  try { for (;;) { const { done, value } = await reader.read(); if (done) break;
    length += value.byteLength; assert.ok(length <= 16384); if (value.byteLength) parts.push(Buffer.from(value)); } }
  finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(parts).toString('utf8'));
}

export async function readNativeAttestation({ fetchFn = globalThis.fetch, timeoutMs = 30000 } = {}) {
  const response = await guard.fetchProductionQaDocument(ORIGIN + ATTESTATION_PATH, { fetchFn, timeoutMs });
  try {
    if (response.status === 404) return null; // The previous release can predate this endpoint.
    assert.equal(response.status, 200); assert.equal(response.headers.get('x-moneysalary-qa'), null);
    assertPagesPrivateCache(response.headers);
    // Cloudflare may consume its own CDN header. The standard CDN header and
    // observed BYPASS/DYNAMIC with no Age remain mandatory.
    const cloudflareCdn = response.headers.get('cloudflare-cdn-cache-control');
    if (cloudflareCdn !== null) assert.equal(cloudflareCdn, 'no-store');
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
    const value = validateAttestation(await boundedJson(response));
    assert.equal(response.headers.get('x-moneysalary-build'), value.buildId); return value;
  } finally { await response.body?.cancel().catch(() => {}); }
}

export async function waitForNativeAttestation(promotion, { fetchFn = globalThis.fetch, persist = () => {},
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), now = Date.now, attempts = 61, intervalMs = 20000, timeoutMs = 1200000 } = {}) {
  assert.ok(Number.isInteger(attempts) && attempts > 0 && attempts <= 61);
  assert.ok(Number.isInteger(intervalMs) && intervalMs >= 1000 && intervalMs <= 60000);
  assert.ok(Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= 1200000);
  const started = now(), report = { schemaVersion: 1, commit: promotion.commit, finished: false, polls: [], maxAttempts: attempts, timeoutMs };
  for (let i = 0; i < attempts && now() - started < timeoutMs; i++) {
    let value;
    try { value = await readNativeAttestation({ fetchFn, timeoutMs: Math.max(1, Math.min(30000, timeoutMs - (now() - started))) }); }
    catch (error) { report.failure = cloudFailureDiagnostic(error, 'readiness-attestation'); persist(report); throw error; }
    report.polls.push({ attempt: i + 1, at: new Date().toISOString(), state: !value ? 'endpoint-absent' : value.commit === promotion.commit ? 'expected-commit' : 'other-commit' }); persist(report);
    if (value?.commit === promotion.commit) {
      try { assertAttestationMatches(value, promotion); }
      catch (error) { report.failure = cloudFailureDiagnostic(error, 'approval-and-ci-identity'); persist(report); throw error; }
      report.finished = true; persist(report); return value;
    }
    if (i + 1 < attempts && now() - started + intervalMs < timeoutMs) await sleep(intervalMs); else break;
  }
  report.failure = { stage: 'readiness-attestation', kind: 'readiness-budget-exhausted' }; persist(report);
  throw new Error('Native Pages readiness budget exhausted; no automatic re-promotion.');
}

function sitemapSnapshot(bytes) {
  const parsed = readSitemap({ body: Buffer.from(bytes).toString('utf8') }); assert.equal(parsed.ok, true);
  const entries = [...parsed.entries].sort(([a], [b]) => a.localeCompare(b));
  assert.ok(entries.length > 0 && entries.length <= 10000);
  for (const [url] of entries) guard.assertProductionQaTarget(url);
  return { sha256: hash(bytes), entries };
}
function checkedSnapshot(snapshot) {
  assert.match(snapshot.sha256 || '', HASH); assert.ok(Array.isArray(snapshot.entries) && snapshot.entries.length > 0 && snapshot.entries.length <= 10000);
  for (const row of snapshot.entries) { assert.ok(Array.isArray(row) && row.length === 2); guard.assertProductionQaTarget(row[0]); assert.ok(row[1] === null || typeof row[1] === 'string'); }
  assert.equal(new Map(snapshot.entries).size, snapshot.entries.length); return { ok: true, entries: new Map(snapshot.entries) };
}
export async function captureCloudSitemap(commit, { fetchFn = globalThis.fetch } = {}) {
  assert.match(commit || '', SHA);
  const response = await guard.fetchProductionQaDocument(ORIGIN + '/sitemap.xml', { fetchFn, timeoutMs: 30000 });
  try { assert.equal(response.status, 200); assert.equal(response.headers.get('x-moneysalary-qa'), null);
    return { schemaVersion: 1, commit, capturedAt: new Date().toISOString(), snapshot: sitemapSnapshot(await bodyGuard.readPagesQaBody(response)) };
  } finally { await response.body?.cancel().catch(() => {}); }
}

export async function verifyCloudArticle(article, attestation, snapshot, { fetchFn = globalThis.fetch } = {}) {
  if (article === null) return null;
  const route = '/guides/' + article.slug, method = article.retire ? 'HEAD' : 'GET';
  const listed = checkedSnapshot(snapshot).entries.has(ORIGIN + route); assert.equal(listed, !article.retire);
  const response = await guard.fetchProductionQaDocument(ORIGIN + route, { method, fetchFn, timeoutMs: 30000 });
  try {
    assert.equal(response.headers.get('x-moneysalary-qa'), null); assert.equal(response.headers.get('x-moneysalary-build'), attestation.buildId);
    if (article.retire) { assert.equal(response.status, 308); assert.ok([article.to, ORIGIN + article.to].includes(response.headers.get('location'))); }
    else {
      assert.equal(response.status, 200); const bytes = await bodyGuard.readPagesQaBody(response);
      const html = Buffer.from(bytes).toString('utf8');
      const title = /<title\b[^>]*>([^<]*)<\/title\s*>/i.exec(html)?.[1] || '';
      const escaped = article.marker.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
      assert.ok(title.includes(article.marker) || title.includes(escaped));
      assert.doesNotMatch(html, /Error 1102|Worker exceeded resource limits|error code: 1102/i);
    }
    return { ...article, method, route, status: response.status, contractPassed: true, requests: 1 };
  } finally { await response.body?.cancel().catch(() => {}); }
}

export async function verifyNativePublicRelease(attestation, promotion, { fetchFn = globalThis.fetch, persist = () => {}, article = null,
  assertRef = async () => {}, readAttestation = () => readNativeAttestation({ fetchFn }) } = {}) {
  assertAttestationMatches(attestation, promotion); await assertRef();
  const report = { schemaVersion: 1, schema: 'moneysalary-native-pages-verification-v1', commit: attestation.commit,
    attestation, attestationHash: jsonHash(attestation), startedAt: new Date().toISOString(), finishedAt: null, finished: false,
    runId: 'native-pages-' + randomUUID(), expectedRequests: 16, attemptedRequests: 0, results: [],
    attestationVerifiedBefore: true, attestationVerifiedAfter: false, controlPlaneVerified: false,
    executedDocumentJavaScript: false, followedRedirects: 0, subresourceRequests: 0, automaticRetries: 0,
    article: null, optionalArticleRequests: 0,
    limitation: 'Observed HTTPS release identity and finite response contracts; no Cloudflare API canonical/configuration/UUID or all-request CPU guarantee.' };
  persist(report); let failed = false;
  try {
    await runPagesResponseContracts({ buildId: attestation.buildId, sitemapHash: attestation.sitemapSha256 }, {
      fetchFn, report, persist, onSitemap: bytes => { report.sitemap = sitemapSnapshot(bytes); },
    });
    if (article) { report.optionalArticleRequests = 1; persist(report); report.article = await verifyCloudArticle(article, attestation, report.sitemap, { fetchFn }); }
  } catch (error) { failed = true; report.failure = cloudFailureDiagnostic(error, report.optionalArticleRequests ? 'approved-article-contract' : 'sixteen-response-contracts'); }
  try { await assertRef(); assert.deepEqual(await readAttestation(), attestation); report.attestationVerifiedAfter = true; }
  catch (error) { failed = true; report.identityRecheckFailed = true; report.identityFailure = cloudFailureDiagnostic(error, 'post-contract-identity'); }
  report.finishedAt = new Date().toISOString(); report.finished = !failed && report.results.length === 16 && report.results.every(row => row.contractPassed);
  persist(report); assert.equal(report.finished, true, 'Native Pages verification failed; no retry or automatic rollback.'); return report;
}

export function cloudIndexNowPlan(capture, verification, promotion, article = null) {
  assert.equal(capture.schemaVersion, 1); assert.equal(capture.commit, promotion.commit); stamp(capture.capturedAt);
  assert.ok(Date.parse(capture.capturedAt) <= Date.parse(promotion.promotedAt));
  assert.equal(verification.finished, true); assertAttestationMatches(verification.attestation, promotion);
  assert.equal(verification.attestationHash, jsonHash(verification.attestation)); assert.equal(verification.commit, promotion.commit);
  assert.equal(verification.attestationVerifiedBefore, true); assert.equal(verification.attestationVerifiedAfter, true);
  assert.equal(verification.expectedRequests, 16); assert.equal(verification.attemptedRequests, 16);
  assert.equal(verification.results.length, 16); assert.ok(verification.results.every(row => row.contractPassed));
  for (const field of ['executedDocumentJavaScript']) assert.equal(verification[field], false);
  for (const field of ['followedRedirects', 'subresourceRequests', 'automaticRetries']) assert.equal(verification[field], 0);
  if (article) { assert.equal(verification.article?.contractPassed, true); for (const [key, value] of Object.entries(article)) assert.equal(verification.article[key], value); }
  else assert.equal(verification.article, null);
  assert.equal(verification.sitemap.sha256, verification.attestation.sitemapSha256);
  const plan = planSubmission(checkedSnapshot(verification.sitemap), checkedSnapshot(capture.snapshot), { cap: 10000 });
  assert.ok(plan.counts.added + plan.counts.changed + plan.counts.removed <= 10000);
  const manifest = { schema: 'moneysalary-native-pages-indexnow-v1', commit: promotion.commit,
    attestationHash: verification.attestationHash, captureHash: jsonHash(capture), plan };
  return { ...manifest, sha256: jsonHash(manifest) };
}
export async function submitCloudIndexNowOnce(manifest, { receiptFile, key, fetchFn = globalThis.fetch } = {}) {
  assert.equal(existsSync(receiptFile), false, 'No automatic notification replay, including ambiguous attempts');
  if (manifest.plan.submit) assert.match(key || '', /^[a-f0-9]{32}$/);
  const receipt = { schema: 'moneysalary-native-pages-indexnow-receipt-v1', commit: manifest.commit, manifestSha256: manifest.sha256,
    state: 'claimed', claimedAt: new Date().toISOString(), urlCount: manifest.plan.urls.length };
  claim(receiptFile, receipt);
  const results = manifest.plan.submit ? await submitIndexNow({ host: HOST, key, keyLocation: `${ORIGIN}/${key}.txt`, urlList: manifest.plan.urls },
    { fetchImpl: fetchFn, log: () => {}, userAgent: guard.QA_USER_AGENT }) : [];
  receipt.results = results.map(({ name, status, ok }) => ({ name, status, ok }));
  receipt.state = results.every(row => row.ok) ? 'completed' : 'needs-review'; receipt.finishedAt = new Date().toISOString();
  writeVerificationJson(receiptFile, receipt); assert.equal(receipt.state, 'completed'); return receipt;
}

export async function assertCloudRemoteRef(commit, api, promoted) {
  assert.equal(await api.readMain(), commit);
  if (promoted) assert.equal(await api.readProduction(), commit);
}

let cliStage = 'argument-and-approval-preflight', cliDirectory;
export async function main(args = process.argv.slice(2), env = process.env) {
  assert.equal(args.length, 3); assert.ok(['--capture', '--verify', '--submit-indexnow'].includes(args[0])); assert.equal(args[1], '--commit');
  const commit = args[2], head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8', windowsHide: true }).trim();
  const event = readJson(path.resolve(env.GITHUB_EVENT_PATH || 'missing-event.json'));
  const article = assertCloudVerificationContext(commit, env, head, event), dir = cloudReceiptDirectory(ROOT, commit);
  cliDirectory = dir;
  const api = createCloudGithubClient(env.GITHUB_TOKEN), assertRef = () => assertCloudRemoteRef(commit, api, true);
  const file = name => path.join(dir, name);
  cliStage = 'github-reference-read'; await assertCloudRemoteRef(commit, api, args[0] !== '--capture');
  if (args[0] === '--capture') {
    cliStage = 'pre-promotion-sitemap';
    claim(file('capture-attempt.json'), { commit, startedAt: new Date().toISOString(), finished: false });
    const capture = await captureCloudSitemap(commit); capture.article = article; claim(file('sitemap-before.json'), capture);
    writeVerificationJson(file('capture-attempt.json'), { commit, finished: true, capturedAt: capture.capturedAt }); return;
  }
  cliStage = 'promotion-receipt';
  const promotion = assertPromotion(readJson(file('promotion.json')), commit, env.GITHUB_RUN_ID);
  const capture = readJson(file('sitemap-before.json')); assert.deepEqual(capture.article, article);
  if (args[0] === '--verify') {
    claim(file('verification.json'), { commit, finished: false });
    cliStage = 'native-readiness';
    const attestation = await waitForNativeAttestation(promotion, { persist: value => writeVerificationJson(file('readiness.json'), value) });
    cliStage = 'public-response-contracts';
    await verifyNativePublicRelease(attestation, promotion, { article, assertRef,
      persist: value => writeVerificationJson(file('verification.json'), value) }); return;
  }
  cliStage = 'indexnow-verified-delta';
  const verification = readJson(file('verification.json')), manifest = cloudIndexNowPlan(capture, verification, promotion, article);
  assert.deepEqual(await readNativeAttestation(), verification.attestation); await assertRef();
  const files = readdirSync(path.join(ROOT, 'public')).filter(name => /^[a-f0-9]{32}\.txt$/.test(name)); assert.equal(files.length, 1);
  const key = files[0].slice(0, -4); assert.equal(readFileSync(path.join(ROOT, 'public', files[0]), 'utf8').trim(), key);
  claim(file('indexnow.json'), manifest); cliStage = 'indexnow-one-time-submission';
  await submitCloudIndexNowOnce(manifest, { receiptFile: file('indexnow-submission.json'), key });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    const diagnostic = { finished: false, ...cloudFailureDiagnostic(error, cliStage) };
    if (cliDirectory) try { writeVerificationJson(path.join(cliDirectory, 'failure.json'), diagnostic); } catch { /* Preserve the original failure. */ }
    console.error(JSON.stringify(diagnostic)); process.exitCode = 1;
  });
}
