// Approval run #29 (44337287611, 2026-11-19): the job log and the receipt named only the phase. The gate now records
// and prints a reason, but only one of its own constant messages or a GitHub HTTP status number, never anything taken
// from a token, a header, a response body, an address or an assertion's values.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CLOUD_RELEASE_REPOSITORY as REPOSITORY, CLOUD_RELEASE_OWNER as OWNER, assertCloudPublishContext,
  createCloudGithubClient, promoteApprovedCloudRelease, cloudPublishFailureReason, cloudPublishFailure,
  cloudPublishFailureDiagnostic } from '../pages-cloud-publish.mjs';

const COMMIT = 'a'.repeat(40), OLD = 'b'.repeat(40);
const SECRET = 'synthetic-private-value';
const GENERIC = ['contract-assertion', 'TimeoutError', 'AbortError', 'TypeError', 'SyntaxError', 'gate-error'];
const SOURCE = readFileSync(new URL('../pages-cloud-publish.mjs', import.meta.url), 'utf8');
const caught = action => { try { action(); } catch (error) { return error; } assert.fail('expected a throw'); };
const rejection = async promise => { try { await promise; } catch (error) { return error; } assert.fail('expected a rejection'); };
const env = () => ({ GITHUB_ACTIONS: 'true', PAGES_CLOUD_PUBLISH_ENABLED: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch',
  GITHUB_REPOSITORY: REPOSITORY, GITHUB_REPOSITORY_OWNER: OWNER, GITHUB_REF: 'refs/heads/main', GITHUB_SHA: COMMIT,
  GITHUB_ACTOR: OWNER, GITHUB_TRIGGERING_ACTOR: OWNER, GITHUB_RUN_ATTEMPT: '1', GITHUB_RUN_ID: '44337287611' });
const event = () => ({ repository: { full_name: REPOSITORY, owner: { login: OWNER } },
  sender: { login: OWNER }, ref: 'main', inputs: { approved_commit: COMMIT } });

test('the allow-list holds exactly the constant failure messages used in the gate file', () => {
  const block = /const PUBLIC_FAILURE_REASONS = new Set\(\[([\s\S]*?)\]\);/.exec(SOURCE)?.[1];
  assert(block);
  const listed = [...block.matchAll(/'([^'\n]*)'/g)].map(match => match[1]);
  assert.equal(new Set(listed).size, listed.length);
  for (const entry of listed) assert.match(entry, /^[A-Za-z][A-Za-z0-9 ,.<>()-]*$/);
  const code = SOURCE.replace(block, '').split('\n').filter(line => !/^\s*\/\//.test(line)).join('\n');
  const used = new Set([...code.matchAll(/'([A-Z][^'\n]* [^'\n]*)'/g)].map(match => match[1]));
  for (const line of ['Approved commit promoted; native deployment verification must still complete.',
    'Cloud release promotion failed. No retry was performed; see the sanitized release receipt.']) assert(used.delete(line));
  assert.deepEqual([...listed].sort(), [...used].sort());
});

test('a constant message comes through as its first line only', () => {
  for (const message of ['Promotion must be a fast-forward', 'Deployment branch diverged', 'Unexpected comparison base']) {
    // Node 22 appends the actual and expected values below a given message.
    const error = caught(() => assert.equal(`${SECRET}-actual`, 'ahead', message));
    assert.equal(cloudPublishFailureReason(error), message);
    assert.equal(cloudPublishFailureReason(new Error(`${message}\n${SECRET}`)), message);
  }
  const context = caught(() => assertCloudPublishContext(COMMIT, { ...env(), GITHUB_ACTOR: SECRET }, event()));
  assert.equal(cloudPublishFailureReason(context), 'Only the owner may approve a release');
});

test('GitHub client failures give the constant message or the HTTP status number, never the response', async () => {
  const replies = [
    [() => new Response(`${SECRET}-body`, { status: 403, headers: { 'x-private': SECRET } }), 'GitHub request failed (HTTP 403)'],
    [() => new Response(SECRET, { status: 302, headers: { location: `https://invalid.test/?token=${SECRET}` } }), 'GitHub request failed (HTTP 302)'],
    [() => new Response(`${SECRET}-not-json`), 'GitHub returned invalid JSON'],
    [() => new Response(SECRET.repeat(100_000)), 'GitHub response exceeds the size limit'],
    [() => { throw new TypeError(`fetch failed https://invalid.test/?token=${SECRET}`); }, 'GitHub transport failed'],
  ];
  for (const [reply, reason] of replies) {
    const api = createCloudGithubClient(`${SECRET}-token`, async () => reply());
    assert.equal(cloudPublishFailureReason(await rejection(api.readMain())), reason);
    assert.equal(cloudPublishFailureReason(await rejection(api.compare(OLD, COMMIT))), reason);
  }
});

test('anything else becomes a generic kind', () => {
  const throwing = { get message() { throw new Error(SECRET); } };
  const named = Object.assign(new Error(SECRET), { name: SECRET });
  const cases = [
    [caught(() => assert.equal(SECRET, 'x')), 'contract-assertion'],
    [caught(() => assert(false)), 'contract-assertion'],
    [Object.assign(new Error(SECRET), { code: 'ERR_ASSERTION' }), 'contract-assertion'],
    [new TypeError(`fetch failed https://invalid.test/?token=${SECRET}`), 'TypeError'],
    [new DOMException(SECRET, 'TimeoutError'), 'TimeoutError'],
    [new SyntaxError(SECRET), 'SyntaxError'],
    [new Error(`GitHub request failed (HTTP 403) ${SECRET}`), 'gate-error'],
    [new Error('GitHub request failed (HTTP 4031)'), 'gate-error'],
    [new Error('GitHub request failed (HTTP 099)'), 'gate-error'],
    [new Error('GitHub request failed (HTTP 600)'), 'gate-error'],
    [new Error(`${SECRET} GitHub transport failed`), 'gate-error'],
    [new Error(SECRET), 'gate-error'],
    ['GitHub transport failed', 'gate-error'],
    [null, 'gate-error'], [undefined, 'gate-error'], [42, 'gate-error'], [throwing, 'gate-error'], [named, 'gate-error'],
  ];
  for (const [error, kind] of cases) {
    assert.equal(cloudPublishFailureReason(error), kind);
    assert(GENERIC.includes(kind));
  }
});

test('run #29 shape: the receipt and the job log line carry the phase and the size-limit reason only', async () => {
  const oversized = createCloudGithubClient(`${SECRET}-token`, async () => new Response(`${SECRET}`.repeat(100_000)));
  const states = [];
  const api = { readWorkflow: async () => ({ id: 7, path: '.github/workflows/ci.yml', state: 'active' }),
    readMain: async () => COMMIT, readProduction: async () => OLD,
    listRuns: async () => ({ total_count: 1, workflow_runs: [{ id: 123, workflow_id: 7, head_sha: COMMIT, head_branch: 'main',
      event: 'push', head_repository: { full_name: REPOSITORY }, status: 'completed', conclusion: 'success' }] }),
    readJobs: async () => ({ total_count: 1, jobs: [{ id: 456, run_id: 123, head_sha: COMMIT, name: 'verify', status: 'completed', conclusion: 'success' }] }),
    compare: oversized.compare, promote: async () => assert.fail('no promotion') };
  const error = await rejection(promoteApprovedCloudRelease(COMMIT, { env: env(), event: event(), api,
    saveState: value => states.push(value), savePromotion: () => assert.fail('no receipt'), ciOptions: { attempts: 1 } }));
  const phase = states.at(-1).phase;
  const { failure, record } = cloudPublishFailure(COMMIT, phase, error);
  assert.deepEqual(record, { schemaVersion: 1, commit: COMMIT, phase: 'checking-ci', failed: true,
    reason: 'GitHub response exceeds the size limit', promotionOutcomeMayBeUnknown: false });
  assert.equal(failure.message, 'Cloud publication stopped at checking-ci; inspect the pinned workflow and deployment branch before any new approval');
  const line = JSON.stringify(cloudPublishFailureDiagnostic(failure));
  assert.equal(line, '{"failed":true,"phase":"checking-ci","reason":"GitHub response exceeds the size limit"}');
  assert(!JSON.stringify(record).includes(SECRET) && !line.includes(SECRET));
});

test('the job log line trusts only failures made by the gate itself', () => {
  const requested = cloudPublishFailure(COMMIT, 'promotion-requested', new Error('GitHub did not confirm the approved commit'));
  assert.equal(requested.record.promotionOutcomeMayBeUnknown, true);
  assert.deepEqual(cloudPublishFailureDiagnostic(requested.failure),
    { failed: true, phase: 'promotion-requested', reason: 'GitHub did not confirm the approved commit' });
  assert.deepEqual(cloudPublishFailureDiagnostic(cloudPublishFailure(COMMIT, SECRET, new Error(SECRET)).failure),
    { failed: true, phase: 'unclassified', reason: 'gate-error' });
  // A look-alike error (same message, not created by the gate) is reported as a preflight failure of a generic kind.
  const lookalike = new Error(requested.failure.message);
  assert.deepEqual(cloudPublishFailureDiagnostic(lookalike), { failed: true, phase: 'preflight', reason: 'gate-error' });
  const preflight = caught(() => assertCloudPublishContext(COMMIT, { ...env(), GITHUB_RUN_ATTEMPT: '2' }, event()));
  assert.deepEqual(cloudPublishFailureDiagnostic(preflight), { failed: true, phase: 'preflight', reason: 'Reruns cannot repeat a release' });
  for (const value of [null, undefined, SECRET, { message: SECRET }])
    assert(!JSON.stringify(cloudPublishFailureDiagnostic(value)).includes(SECRET));
});
