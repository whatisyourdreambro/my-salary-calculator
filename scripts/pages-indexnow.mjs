// Pages release notifications: capture the old sitemap before upload, submit
// only after exact deployment, purge and non-rendering acceptance. No browser.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOST, readSitemap, planSubmission } from './indexnow-diff.mjs';
import { submitIndexNow } from './indexnow-submit.mjs';
import { assertIndexNowProduction } from './indexnow-ping.mjs';
import { verifyArtifact } from './lib/pages-export.mjs';
import guard from './lib/qa-production-http.cjs';
import bodyGuard from './lib/qa-pages-deployment-http.cjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const sorted = map => [...map].sort(([a], [b]) => a.localeCompare(b));
const COMMIT = /^[a-f0-9]{40}$/;
const HASH = /^[a-f0-9]{64}$/;
const write = (file, value, exclusive = false) => writeFileSync(file, JSON.stringify(value, null, 2) + '\n', exclusive ? { flag: 'wx' } : undefined);

function entries(value) {
  assert.ok(Array.isArray(value) && value.length > 0 && value.length <= 10000);
  for (const pair of value) {
    assert.ok(Array.isArray(pair) && pair.length === 2 && (pair[1] === null || typeof pair[1] === 'string'));
    guard.assertProductionQaTarget(pair[0]);
  }
  const map = new Map(value); assert.equal(map.size, value.length);
  return { ok: true, entries: map };
}

export function createPagesIndexNowManifest({ commit, marker, previous, build, capturedAt = new Date().toISOString() }) {
  assert.match(commit, COMMIT);
  assert.equal(marker.mode, 'production'); assert.equal(marker.adsDisabled, false);
  assert.match(marker.outputHash, HASH); assert.match(marker.sourceHash, HASH);
  assert.ok(marker.buildId && previous.ok && build.ok);
  const before = sorted(previous.entries), after = sorted(build.entries);
  const plan = planSubmission(entries(after), entries(before), { cap: 10000 });
  assert.ok(plan.counts.added + plan.counts.changed + plan.counts.removed <= 10000);
  const payload = { schema: 'moneysalary-pages-indexnow-v1', host: HOST, commit, capturedAt,
    buildId: marker.buildId, artifactHash: marker.outputHash, sourceHash: marker.sourceHash, previous: before, build: after, plan };
  return { ...payload, sha256: digest(payload) };
}

export function validatePagesIndexNowManifest(manifest, { commit, marker }) {
  const { sha256, ...payload } = manifest;
  assert.equal(sha256, digest(payload)); assert.equal(manifest.schema, 'moneysalary-pages-indexnow-v1');
  assert.equal(manifest.host, HOST); assert.equal(manifest.commit, commit);
  const recomputed = createPagesIndexNowManifest({ commit, marker,
    previous: entries(manifest.previous), build: entries(manifest.build), capturedAt: manifest.capturedAt });
  assert.deepEqual(manifest, recomputed);
  return manifest;
}

export async function readCanonicalSitemap(fetchFn = globalThis.fetch) {
  const response = await guard.fetchProductionQaDocument(`https://${HOST}/sitemap.xml`, { fetchFn, timeoutMs: 30000 });
  try {
    assert.equal(response.status, 200);
    const bytes = await bodyGuard.readPagesQaBody(response);
    const parsed = readSitemap({ status: response.status, body: Buffer.from(bytes).toString('utf8') });
    assert.equal(parsed.ok, true); entries(sorted(parsed.entries)); return parsed;
  } finally { await response.body?.cancel().catch(() => {}); }
}

export function assertPagesNotificationVerification(verification, pins, manifest) {
  assert.equal(verification.finished, true);
  assert.equal(pins.purgeVerified, true); assert.equal(verification.purgeVerified, true);
  assert.equal(verification.canonicalVerifiedBefore, true); assert.equal(verification.canonicalVerifiedAfter, true);
  for (const key of ['deploymentId', 'commit', 'buildId', 'artifactHash', 'sourceHash', 'configurationHash']) {
    assert.equal(typeof pins[key], 'string'); assert.equal(verification.pins[key], pins[key]);
  }
  for (const key of ['commit', 'buildId', 'artifactHash', 'sourceHash']) assert.equal(manifest[key], pins[key]);
  for (const key of ['expectedRequests', 'attemptedRequests', 'passedRequests']) assert.equal(verification[key], 16);
  assert.equal(verification.executedDocumentJavaScript, false);
  assert.equal(verification.followedRedirects, 0); assert.equal(verification.subresourceRequests, 0); assert.equal(verification.automaticRetries, 0);
}

// Claim before any outbound POST. A failed/ambiguous receipt is never replayed.
export async function submitPagesNotificationOnce({ manifest, deploymentId, receiptFile, key, fetchFn = globalThis.fetch }) {
  if (existsSync(receiptFile)) {
    const existing = JSON.parse(readFileSync(receiptFile));
    assert.equal(existing.manifestSha256, manifest.sha256);
    assert.equal(existing.deploymentId, deploymentId);
    assert.equal(existing.state, 'completed', 'Ambiguous notification requires operator review; no automatic resubmission');
    return existing;
  }
  if (manifest.plan.submit) assert.match(key || '', /^[a-f0-9]{32}$/);
  const receipt = { schema: 'moneysalary-pages-indexnow-receipt-v1', manifestSha256: manifest.sha256,
    deploymentId, commit: manifest.commit, state: 'claimed', claimedAt: new Date().toISOString(), urlCount: manifest.plan.urls.length };
  write(receiptFile, receipt, true);
  const results = manifest.plan.submit ? await submitIndexNow({ host: HOST, key,
    keyLocation: `https://${HOST}/${key}.txt`, urlList: manifest.plan.urls },
  { fetchImpl: fetchFn, log: () => {}, userAgent: guard.QA_USER_AGENT }) : [];
  receipt.results = results.map(({ name, status, ok }) => ({ name, status, ok }));
  receipt.state = results.every(row => row.ok) ? 'completed' : 'needs-review'; receipt.finishedAt = new Date().toISOString();
  write(receiptFile, receipt);
  assert.equal(receipt.state, 'completed', 'IndexNow notification failed; receipt retained, no automatic retry');
  return receipt;
}

export async function main(args = process.argv.slice(2), env = process.env) {
  assert.ok(args.length === 1 && ['--capture', '--submit'].includes(args[0]));
  assertIndexNowProduction(env, ROOT, path.join(ROOT, '.pages-build'));
  assert.equal(env.GITHUB_ACTIONS, 'true'); assert.equal(env.GITHUB_REF, 'refs/heads/main');
  assert.match(env.GITHUB_SHA || '', COMMIT);
  const verified = verifyArtifact(ROOT, 'production'), { marker } = verified;
  const build = readSitemap({ body: readFileSync(path.join(verified.stage, 'dist/sitemap.xml'), 'utf8') });
  assert.equal(build.ok, true);
  const dir = path.join(ROOT, '.artifacts/pages-release'); mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'indexnow.json');
  if (args[0] === '--capture') {
    assert.equal(existsSync(file), false, 'Do not overwrite pre-publication evidence');
    const previous = await readCanonicalSitemap();
    const manifest = createPagesIndexNowManifest({ commit: env.GITHUB_SHA, marker, previous, build });
    write(file, manifest, true); console.log(JSON.stringify({ captured: true, notificationsSent: 0, counts: manifest.plan.counts }));
    return;
  }
  const manifest = validatePagesIndexNowManifest(JSON.parse(readFileSync(file)), { commit: env.GITHUB_SHA, marker });
  assert.deepEqual(sorted(build.entries), manifest.build);
  const pins = JSON.parse(readFileSync(path.join(dir, 'production-pins.json')));
  const verification = JSON.parse(readFileSync(path.join(dir, 'verification.json')));
  assertPagesNotificationVerification(verification, pins, manifest);
  const { createReleaseApi } = await import('./pages-release.mjs');
  const { assertProductionDeployment } = await import('./lib/pages-release.mjs');
  const api = createReleaseApi(env);
  const check = async () => {
    const project = await api.readProject();
    assert.equal(project.canonical_deployment.id, pins.deploymentId);
    assertProductionDeployment(await api.readDeployment(pins.deploymentId), pins.commit, pins.deploymentId);
  };
  await check(); assert.deepEqual(sorted((await readCanonicalSitemap()).entries), manifest.build); await check();
  const keys = readdirSync(path.join(ROOT, 'public')).filter(name => /^[a-f0-9]{32}\.txt$/.test(name));
  assert.equal(keys.length, 1);
  const key = keys[0].slice(0, -4);
  assert.equal(readFileSync(path.join(ROOT, 'public', keys[0]), 'utf8').trim(), key);
  const receipt = await submitPagesNotificationOnce({ manifest, deploymentId: pins.deploymentId, receiptFile: file + '.submission.json', key });
  console.log(JSON.stringify({ state: receipt.state, notifications: receipt.urlCount, results: receipt.results }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => { console.error('Pages IndexNow gate failed; inspect retained evidence. No automatic retry.'); process.exitCode = 1; });
}
