import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parse } from 'yaml';
import { CLOUD_RELEASE_REPOSITORY as REPOSITORY, CLOUD_RELEASE_OWNER as OWNER,
  CLOUD_RELEASE_BRANCH as BRANCH, parseCloudPublishArgs, assertCloudPublishContext,
  cloudReleaseDirectory, createCloudGithubClient, waitForCloudReleaseCi,
  promoteApprovedCloudRelease } from '../pages-cloud-publish.mjs';

const COMMIT = 'a'.repeat(40), OLD = 'b'.repeat(40), OTHER = 'c'.repeat(40);
const env = () => ({ GITHUB_ACTIONS: 'true', PAGES_CLOUD_PUBLISH_ENABLED: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch',
  GITHUB_REPOSITORY: REPOSITORY, GITHUB_REPOSITORY_OWNER: OWNER, GITHUB_REF: 'refs/heads/main', GITHUB_SHA: COMMIT,
  GITHUB_ACTOR: OWNER, GITHUB_TRIGGERING_ACTOR: OWNER, GITHUB_RUN_ATTEMPT: '1', GITHUB_RUN_ID: '45' });
const event = () => ({ repository: { full_name: REPOSITORY, owner: { login: OWNER } },
  sender: { login: OWNER }, ref: 'main', inputs: { approved_commit: COMMIT } });
const run = (changes = {}) => ({ id: 123, workflow_id: 7, head_sha: COMMIT, head_branch: 'main', event: 'push',
  head_repository: { full_name: REPOSITORY }, status: 'completed', conclusion: 'success', ...changes });
const job = (changes = {}) => ({ id: 456, run_id: 123, head_sha: COMMIT, name: 'verify', status: 'completed', conclusion: 'success', ...changes });
function fixture(changes = {}) {
  const calls = [], states = [], receipts = [];
  let production = OLD;
  const api = {
    readMain: async () => { calls.push('main'); return COMMIT; },
    readProduction: async () => { calls.push('production'); return production; },
    readWorkflow: async () => ({ id: 7, path: '.github/workflows/ci.yml', state: 'active' }),
    listRuns: async () => ({ total_count: 1, workflow_runs: [run()] }),
    readJobs: async () => ({ total_count: 1, jobs: [job()] }),
    compare: async (old, sha) => { calls.push(['compare', old, sha]); return { status: 'ahead', base_commit: { sha: OLD }, merge_base_commit: { sha: OLD } }; },
    promote: async sha => { calls.push(['promote', sha]); production = sha; return sha; },
    ...changes,
  };
  const deps = { env: env(), event: event(), api,
    saveState: s => states.push(structuredClone(s)), savePromotion: s => receipts.push(structuredClone(s)),
    now: () => new Date('2026-10-18T00:00:00.000Z'), ciOptions: { attempts: 1 } };
  return { api, calls, states, receipts, deps, publish: () => promoteApprovedCloudRelease(COMMIT, deps) };
}

test('CLI accepts only an explicit promotion and full lowercase approved SHA', () => {
  assert.equal(parseCloudPublishArgs(['--promote', '--commit', COMMIT]), COMMIT);
  for (const args of [[], ['--publish', '--commit', COMMIT], ['--promote', '--commit', COMMIT.slice(0, 7)],
    ['--promote', '--commit', COMMIT.toUpperCase()], ['--promote', '--commit', COMMIT, '--force']])
    assert.throws(() => parseCloudPublishArgs(args));
});

test('approval pins owner, event, selected main, input SHA and first run attempt before any API', () => {
  assert.deepEqual(assertCloudPublishContext(COMMIT, env(), event()), { runId: 45, runAttempt: 1 });
  assert.doesNotThrow(() => assertCloudPublishContext(COMMIT, env(), { ...event(), ref: 'refs/heads/main' }));
  for (const change of [{ GITHUB_ACTIONS: 'false' }, { PAGES_CLOUD_PUBLISH_ENABLED: 'false' },
    { GITHUB_EVENT_NAME: 'push' }, { GITHUB_REF: 'refs/tags/main' }, { GITHUB_REF: 'refs/heads/other' },
    { GITHUB_REPOSITORY: 'other/repo' }, { GITHUB_REPOSITORY_OWNER: 'other' }, { GITHUB_SHA: OLD },
    { GITHUB_ACTOR: 'other' }, { GITHUB_TRIGGERING_ACTOR: 'other' }, { GITHUB_RUN_ATTEMPT: '2' }, { GITHUB_RUN_ID: 'NaN' },
    { NEXT_PUBLIC_ADS_DISABLED: '1' }, { MSY_QA_MODE: '1' }, { MSY_QA_PAGES_STAGE: '1' }, { MSY_QA_WORKER_STAGE: '1' },
    { CF_API_TOKEN: 'synthetic-must-not-be-used' }, { CF_PAGES_API_TOKEN: 'synthetic-must-not-be-used' },
    { CLOUDFLARE_API_TOKEN: 'synthetic-must-not-be-used' }, { PAGES_DEPLOY_HOOK_URL: 'https://invalid.test' }])
    assert.throws(() => assertCloudPublishContext(COMMIT, { ...env(), ...change }, event()));
  for (const change of [e => e.repository.full_name = 'other/repo', e => e.repository.owner.login = 'other',
    e => e.sender.login = 'other', e => e.ref = 'other', e => e.inputs.approved_commit = OLD]) {
    const e = event(); change(e); assert.throws(() => assertCloudPublishContext(COMMIT, env(), e));
  }
});

test('invalid dispatch cannot begin CI reads or mutate the deployment branch', async () => {
  const f = fixture(); f.deps.env.GITHUB_ACTOR = 'other';
  await assert.rejects(f.publish); assert.deepEqual(f.calls, []); assert.deepEqual(f.states, []);
});

test('GitHub client has one fixed non-forced mutation and no Cloudflare or redirect requests', async () => {
  const calls = [];
  const api = createCloudGithubClient('synthetic-github-token', async (url, options) => {
    calls.push({ url, options });
    const branch = url.endsWith('/main') ? 'main' : BRANCH;
    return Response.json({ ref: `refs/heads/${branch}`, object: { type: 'commit', sha: COMMIT } });
  });
  assert.equal(await api.readMain(), COMMIT); assert.equal(await api.readProduction(), COMMIT);
  assert.equal(await api.promote(COMMIT), COMMIT);
  assert.equal(calls.length, 3);
  assert(calls.every(c => new URL(c.url).origin === 'https://api.github.com' && c.options.redirect === 'manual'));
  assert.deepEqual(calls.map(c => c.options.method), ['GET', 'GET', 'PATCH']);
  assert.equal(calls[2].url, `https://api.github.com/repos/${REPOSITORY}/git/refs/heads/${BRANCH}`);
  assert.deepEqual(JSON.parse(calls[2].options.body), { sha: COMMIT, force: false });
  assert(calls.every(c => c.options.signal instanceof AbortSignal));
});

test('GitHub redirects, transport, invalid JSON and excessive bodies fail without raw response disclosure', async () => {
  for (const reply of [() => new Response('synthetic-private-body', { status: 302, headers: { location: 'https://invalid.test' } }),
    () => new Response('synthetic-private-body'), () => { throw new Error('synthetic-private-transport'); },
    () => new Response('x'.repeat(2_000_001))]) {
    let count = 0;
    const api = createCloudGithubClient('synthetic', async () => { count++; return reply(); });
    await assert.rejects(api.readMain, error => !error.message.includes('synthetic-private'));
    assert.equal(count, 1);
  }
});

test('exact CI run and successful verify job are recorded', async () => {
  const f = fixture(); assert.deepEqual(await waitForCloudReleaseCi(COMMIT, f.api, { attempts: 1 }), { runId: 123, jobId: 456 });
});

test('pending CI waits within its budget and rechecks main on every poll', async () => {
  let listing = 0, sleeps = 0;
  const f = fixture({ listRuns: async () => ({ total_count: 1, workflow_runs: [run(listing++ ? {} : { status: 'in_progress', conclusion: null })] }) });
  assert.deepEqual(await waitForCloudReleaseCi(COMMIT, f.api, { attempts: 2, intervalMs: 1000,
    sleep: async ms => { assert.equal(ms, 1000); sleeps++; } }), { runId: 123, jobId: 456 });
  assert.equal(sleeps, 1); assert.equal(f.calls.filter(c => c === 'main').length, 3);
});

test('latest failed CI cannot be replaced with an older success; skipped and ambiguous jobs fail', async () => {
  const variants = [
    { listRuns: async () => ({ total_count: 2, workflow_runs: [run({ id: 1 }), run({ id: 2, conclusion: 'failure' })] }) },
    ...['failure', 'skipped', 'cancelled', 'neutral'].map(conclusion => ({ readJobs: async () => ({ total_count: 1, jobs: [job({ conclusion })] }) })),
    { readJobs: async () => ({ total_count: 2, jobs: [job(), job({ id: 457 })] }) },
    { readJobs: async () => ({ total_count: 0, jobs: [] }) },
    { readJobs: async () => ({ total_count: 1, jobs: [job({ run_id: 999 })] }) },
    { readJobs: async () => ({ total_count: 1, jobs: [job({ head_sha: OLD })] }) },
    { readJobs: async () => ({ total_count: 101, jobs: [job()] }) },
    { listRuns: async () => ({ total_count: 101, workflow_runs: [run()] }) },
    { readWorkflow: async () => ({ id: 7, path: '.github/workflows/other.yml', state: 'active' }) },
  ];
  for (const change of variants) await assert.rejects(waitForCloudReleaseCi(COMMIT, fixture(change).api, { attempts: 1 }));
});

test('PR, wrong SHA, wrong branch, wrong repository and wrong workflow successes do not authorize release', async () => {
  for (const change of [{ event: 'pull_request' }, { head_sha: OLD }, { head_branch: 'other' },
    { head_repository: { full_name: 'other/repo' } }, { workflow_id: 9 }]) {
    const f = fixture({ listRuns: async () => ({ total_count: 1, workflow_runs: [run(change)] }) });
    await assert.rejects(f.publish); assert(!f.calls.some(c => Array.isArray(c) && c[0] === 'promote'));
  }
});

test('stale main during or after CI never promotes the new latest main instead', async () => {
  for (const staleRead of [1, 2, 3]) {
    let count = 0;
    const f = fixture({ readMain: async () => ++count === staleRead ? OTHER : COMMIT });
    await assert.rejects(f.publish); assert(!f.calls.some(c => Array.isArray(c) && c[0] === 'promote'));
  }
});

test('promotion writes one exact SHA, reads it back, and records identities without claiming deployed', async () => {
  const f = fixture(); const receipt = await f.publish();
  assert.deepEqual(receipt, { schemaVersion: 1, commit: COMMIT, branch: BRANCH, previousCommit: OLD,
    runId: 45, runAttempt: 1, ci: { runId: 123, jobId: 456 }, promotedAt: '2026-10-18T00:00:00.000Z', promoted: true });
  assert.deepEqual(f.calls.filter(Array.isArray), [['compare', OLD, COMMIT], ['promote', COMMIT]]);
  assert.equal(f.receipts.length, 1);
  assert.equal(f.states.at(-1).phase, 'promoted-awaiting-native-deployment');
  assert.equal(receipt.deployed, undefined);
});

test('missing, already promoted, diverged or moving deployment branches cannot be forced or created', async () => {
  const variants = [
    { readProduction: async () => { throw new Error('missing'); } },
    { readProduction: async () => COMMIT },
    ...['behind', 'diverged', 'identical'].map(status => ({ compare: async () => ({ status, base_commit: { sha: OLD }, merge_base_commit: { sha: OLD } }) })),
    { compare: async () => ({ status: 'ahead', base_commit: { sha: OTHER }, merge_base_commit: { sha: OLD } }) },
    { compare: async () => ({ status: 'ahead', base_commit: { sha: OLD }, merge_base_commit: { sha: OTHER } }) },
  ];
  let reads = 0; variants.push({ readProduction: async () => ++reads === 1 ? OLD : OTHER });
  for (const change of variants) {
    const f = fixture(change); await assert.rejects(f.publish);
    assert(!f.calls.some(c => Array.isArray(c) && c[0] === 'promote')); assert.equal(f.receipts.length, 0);
  }
});

test('lost mutation response, incorrect confirmation and readback failures never retry or claim success', async () => {
  for (const outcome of ['lost', 'wrong-response', 'wrong-readback']) {
    let mutations = 0;
    const f = fixture({ promote: async () => {
      mutations++; if (outcome === 'lost') throw new Error('unknown outcome');
      return outcome === 'wrong-response' ? OTHER : COMMIT;
    } });
    await assert.rejects(f.publish); assert.equal(mutations, 1); assert.equal(f.receipts.length, 0);
    assert.equal(f.states.at(-1).phase, 'promotion-requested');
  }
});

test('receipt paths are full-SHA owned directories and reject escaping symlinks', t => {
  const temporary = realpathSync(mkdtempSync(path.join(os.tmpdir(), 'pages-cloud-test-')));
  t.after(() => rmSync(temporary, { recursive: true, force: true }));
  const directory = cloudReleaseDirectory(temporary, COMMIT);
  assert.equal(directory, path.join(temporary, '.artifacts', 'pages-cloud-release', COMMIT));
  assert.equal(cloudReleaseDirectory(temporary, COMMIT), directory);
  assert.throws(() => cloudReleaseDirectory(temporary, '../../escape'));
  const alias = path.join(temporary, '.artifacts', 'pages-cloud-release', OLD);
  symlinkSync(directory, alias, 'junction');
  assert.throws(() => cloudReleaseDirectory(temporary, OLD), /Unsafe receipt directory/);
});

test('workflow has explicit owner approval, fixed checkout, isolated permissions and ordered tokenless postchecks', () => {
  const source = readFileSync(new URL('../../.github/workflows/pages-publish.yml', import.meta.url), 'utf8');
  const workflow = parse(source), job = workflow.jobs.publish;
  assert.equal(workflow.name, 'Pages · 승인 후 게시');
  assert.deepEqual(Object.keys(workflow.on), ['workflow_dispatch']);
  assert.equal(workflow.on.workflow_dispatch.inputs.approved_commit.required, true);
  for (const name of ['article_slug', 'article_marker', 'retirement_to']) assert.equal(workflow.on.workflow_dispatch.inputs[name].type, 'string');
  assert.equal(workflow.permissions.contents, 'read');
  assert.deepEqual(job.permissions, { contents: 'write', actions: 'read', checks: 'read' });
  assert.equal(workflow.concurrency['cancel-in-progress'], false);
  assert.equal(job['timeout-minutes'], 60);
  assert.match(job.if, /PAGES_CLOUD_PUBLISH_ENABLED/); assert.match(job.if, /github.actor == github.repository_owner/);
  assert.equal(job.steps[0].with.ref, '${{ github.sha }}'); assert.equal(job.steps[0].with['persist-credentials'], false);
  const commands = job.steps.filter(step => step.run).map(step => step.run);
  assert.deepEqual(commands, ['npm ci --ignore-scripts',
    'node scripts/pages-cloud-verify.mjs --capture --commit "$PAGES_RELEASE_COMMIT"',
    'node scripts/pages-cloud-publish.mjs --promote --commit "$PAGES_RELEASE_COMMIT"',
    'node scripts/pages-cloud-verify.mjs --verify --commit "$PAGES_RELEASE_COMMIT"',
    'node scripts/pages-cloud-verify.mjs --submit-indexnow --commit "$PAGES_RELEASE_COMMIT"']);
  for (const step of job.steps.filter(step => step.run)) {
    assert.equal(step.if, undefined); assert.equal(step['continue-on-error'], undefined);
    assert(!step.run.includes('${{'));
  }
  assert(!/secrets\.|CF_.*TOKEN|CLOUDFLARE_API|wrangler|deploy_hook|environment:/i.test(source));
});
