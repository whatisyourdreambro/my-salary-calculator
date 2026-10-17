// The owner's workflow_dispatch is the release approval. This promotes a Git ref;
// Cloudflare's existing Git integration builds it without a Cloudflare credential.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const CLOUD_PUBLICATION_POLICY_VERSION = 1;
export const CLOUD_RELEASE_REPOSITORY = 'whatisyourdreambro/my-salary-calculator';
export const CLOUD_RELEASE_OWNER = 'whatisyourdreambro';
export const CLOUD_RELEASE_BRANCH = 'codex/pages-production';
const SHA = /^[a-f0-9]{40}$/;
const API = `/repos/${CLOUD_RELEASE_REPOSITORY}`;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const positiveId = value => Number.isSafeInteger(Number(value)) && Number(value) > 0;

export function parseCloudPublishArgs(args) {
  assert.equal(args.length, 3, 'Use --promote --commit <full SHA>');
  assert.equal(args[0], '--promote'); assert.equal(args[1], '--commit');
  assert.match(args[2], SHA, 'A full approved commit is required');
  return args[2];
}

export function assertCloudPublishContext(commit, env, event) {
  assert.match(commit, SHA, 'Invalid approved commit');
  assert.equal(env.GITHUB_ACTIONS, 'true', 'GitHub Actions is required');
  assert.equal(env.PAGES_CLOUD_PUBLISH_ENABLED, 'true', 'Cloud publication is disabled');
  assert.equal(env.GITHUB_EVENT_NAME, 'workflow_dispatch', 'Only explicit release approval is accepted');
  assert.equal(env.GITHUB_REPOSITORY, CLOUD_RELEASE_REPOSITORY, 'Wrong repository');
  assert.equal(env.GITHUB_REPOSITORY_OWNER, CLOUD_RELEASE_OWNER, 'Wrong repository owner');
  assert.equal(env.GITHUB_REF, 'refs/heads/main', 'Select main when approving the release');
  assert.equal(env.GITHUB_SHA, commit, 'The approved commit must be the workflow commit');
  assert.equal(env.GITHUB_ACTOR, CLOUD_RELEASE_OWNER, 'Only the owner may approve a release');
  assert.equal(env.GITHUB_TRIGGERING_ACTOR, CLOUD_RELEASE_OWNER, 'Only the owner may start a release');
  assert.equal(env.GITHUB_RUN_ATTEMPT, '1', 'Reruns cannot repeat a release');
  assert(positiveId(env.GITHUB_RUN_ID), 'Invalid workflow run ID');
  assert.equal(event?.repository?.full_name, CLOUD_RELEASE_REPOSITORY, 'Wrong event repository');
  assert.equal(event?.repository?.owner?.login, CLOUD_RELEASE_OWNER, 'Wrong event owner');
  assert.equal(event?.sender?.login, CLOUD_RELEASE_OWNER, 'Wrong event sender');
  assert(['main', 'refs/heads/main'].includes(event?.ref), 'Wrong dispatch ref');
  assert.equal(event?.inputs?.approved_commit, commit, 'Approval input differs from the commit');
  for (const name of ['NEXT_PUBLIC_ADS_DISABLED', 'MSY_QA_MODE', 'MSY_QA_PAGES_STAGE', 'MSY_QA_WORKER_STAGE'])
    assert.notEqual(env[name], '1', 'A QA process cannot promote production');
  for (const name of Object.keys(env))
    if (/^(?:CF_.*TOKEN|CLOUDFLARE_(?:API_TOKEN|API_KEY)|.*DEPLOY_HOOK(?:_URL)?)$/.test(name))
      assert(!env[name], 'Cloudflare credentials and deploy hooks are forbidden');
  return { runId: Number(env.GITHUB_RUN_ID), runAttempt: 1 };
}

export function cloudReleaseDirectory(workspace, commit) {
  assert.match(commit, SHA);
  const root = realpathSync(workspace);
  let directory = root;
  for (const name of ['.artifacts', 'pages-cloud-release', commit]) {
    directory = path.join(directory, name);
    if (!existsSync(directory)) mkdirSync(directory, { mode: 0o700 });
    assert(lstatSync(directory).isDirectory() && !lstatSync(directory).isSymbolicLink(), 'Unsafe receipt directory');
    assert.equal(realpathSync(directory), directory, 'Receipt directory escapes the workspace');
  }
  return directory;
}

export function createCloudGithubClient(token, fetchFn = globalThis.fetch) {
  assert(typeof token === 'string' && token.length > 0 && !/[\r\n]/.test(token), 'Generated GitHub authentication is required');
  async function request(endpoint, method = 'GET', body) {
    assert(endpoint.startsWith(`${API}/`) && !/[\r\n#]/.test(endpoint), 'Unexpected GitHub endpoint');
    let response;
    try {
      response = await fetchFn(`https://api.github.com${endpoint}`, {
        method, redirect: 'manual', signal: AbortSignal.timeout(20_000),
        headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json',
          'x-github-api-version': '2026-03-10', 'user-agent': 'MoneySalary-cloud-release/1.0',
          ...(body ? { 'content-type': 'application/json' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch { throw new Error('GitHub transport failed'); }
    assert.equal(response.status, 200, `GitHub request failed (HTTP ${response.status})`);
    const reader = response.body?.getReader();
    assert(reader, 'GitHub response body is missing');
    const chunks = []; let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2_000_000) { await reader.cancel(); throw new Error('GitHub response exceeds the size limit'); }
      chunks.push(Buffer.from(value));
    }
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { throw new Error('GitHub returned invalid JSON'); }
  }
  function ref(record, name) {
    assert.equal(record?.ref, `refs/heads/${name}`, 'Unexpected Git reference');
    assert.equal(record?.object?.type, 'commit', 'Reference does not point to a commit');
    assert.match(record?.object?.sha || '', SHA, 'Invalid reference SHA');
    return record.object.sha;
  }
  return {
    readMain: async () => ref(await request(`${API}/git/ref/heads/main`), 'main'),
    readProduction: async () => ref(await request(`${API}/git/ref/heads/${CLOUD_RELEASE_BRANCH}`), CLOUD_RELEASE_BRANCH),
    readWorkflow: () => request(`${API}/actions/workflows/ci.yml`),
    listRuns: (workflowId, commit) => {
      assert(positiveId(workflowId)); assert.match(commit, SHA);
      return request(`${API}/actions/workflows/${workflowId}/runs?event=push&branch=main&head_sha=${commit}&per_page=100`);
    },
    readJobs: runId => {
      assert(positiveId(runId));
      return request(`${API}/actions/runs/${runId}/jobs?filter=latest&per_page=100`);
    },
    compare: (previous, commit) => {
      assert.match(previous, SHA); assert.match(commit, SHA);
      return request(`${API}/compare/${previous}...${commit}`);
    },
    promote: async commit => {
      assert.match(commit, SHA);
      return ref(await request(`${API}/git/refs/heads/${CLOUD_RELEASE_BRANCH}`, 'PATCH', { sha: commit, force: false }), CLOUD_RELEASE_BRANCH);
    },
  };
}

export async function waitForCloudReleaseCi(commit, api, { attempts = 61, intervalMs = 30_000, sleep = wait } = {}) {
  assert.match(commit, SHA);
  assert(Number.isInteger(attempts) && attempts >= 1 && attempts <= 61, 'Invalid CI wait budget');
  assert(Number.isFinite(intervalMs) && intervalMs >= 1_000 && intervalMs <= 30_000, 'Invalid CI wait interval');
  const workflow = await api.readWorkflow();
  assert.equal(workflow?.state, 'active', 'CI is not active');
  assert.equal(workflow?.path, '.github/workflows/ci.yml', 'Unexpected CI workflow');
  assert(positiveId(workflow.id), 'Invalid CI workflow ID');
  for (let index = 0; index < attempts; index++) {
    assert.equal(await api.readMain(), commit, 'Main changed after approval');
    const data = await api.listRuns(workflow.id, commit);
    assert(Array.isArray(data?.workflow_runs) && data.workflow_runs.length <= 100, 'Invalid CI run listing');
    assert(Number.isInteger(data.total_count) && data.total_count <= 100, 'CI history exceeds the lookup limit');
    const runs = data.workflow_runs.filter(run => run.workflow_id === workflow.id && run.head_sha === commit &&
      run.head_branch === 'main' && run.event === 'push' && run.head_repository?.full_name === CLOUD_RELEASE_REPOSITORY);
    assert(runs.every(run => positiveId(run.id)), 'Invalid CI run ID');
    const run = runs.sort((a, b) => b.id - a.id)[0];
    if (run) {
      const data = await api.readJobs(run.id);
      assert(Array.isArray(data?.jobs) && data.jobs.length <= 100 && Number.isInteger(data.total_count) && data.total_count <= 100, 'Invalid CI job listing');
      const jobs = data.jobs.filter(job => job.name === 'verify');
      assert(jobs.length <= 1, 'Ambiguous CI verification job');
      if (jobs[0]) {
        assert.equal(jobs[0].run_id, run.id, 'CI job belongs to another run');
        assert.equal(jobs[0].head_sha, commit, 'CI job belongs to another commit');
      }
      if (jobs[0]?.status === 'completed') {
        assert.equal(jobs[0].conclusion, 'success', 'CI verify did not succeed');
        assert(positiveId(jobs[0].id), 'Invalid CI job ID');
        if (run.status === 'completed') {
          assert.equal(run.conclusion, 'success', 'CI workflow did not succeed');
          assert.equal(await api.readMain(), commit, 'Main changed after CI verification');
          return { runId: Number(run.id), jobId: Number(jobs[0].id) };
        }
      }
      if (run.status === 'completed') throw new Error('CI completed without a successful verify job');
    }
    if (index + 1 < attempts) await sleep(intervalMs);
  }
  throw new Error('The approved commit did not pass CI within the wait budget');
}

export async function promoteApprovedCloudRelease(commit, { env, event, api, saveState, savePromotion,
  now = () => new Date(), ciOptions } = {}) {
  const identity = assertCloudPublishContext(commit, env, event);
  saveState({ schemaVersion: 1, commit, ...identity, phase: 'checking-ci', promoted: false });
  const ci = await waitForCloudReleaseCi(commit, api, ciOptions);
  const previousCommit = await api.readProduction();
  assert.match(previousCommit, SHA);
  assert.notEqual(previousCommit, commit, 'This commit is already on the deployment branch');
  const comparison = await api.compare(previousCommit, commit);
  assert.equal(comparison?.status, 'ahead', 'Promotion must be a fast-forward');
  assert.equal(comparison?.base_commit?.sha, previousCommit, 'Unexpected comparison base');
  assert.equal(comparison?.merge_base_commit?.sha, previousCommit, 'Deployment branch diverged');
  assert.equal(await api.readMain(), commit, 'Main changed before promotion');
  assert.equal(await api.readProduction(), previousCommit, 'Deployment branch changed before promotion');
  saveState({ schemaVersion: 1, commit, ...identity, ci, previousCommit, phase: 'promotion-requested', promoted: false });
  // One mutation only. A lost response is an unknown outcome, never an automatic retry.
  assert.equal(await api.promote(commit), commit, 'GitHub did not confirm the approved commit');
  assert.equal(await api.readProduction(), commit, 'Deployment branch readback differs');
  assert.equal(await api.readMain(), commit, 'Main changed during promotion');
  const receipt = { schemaVersion: 1, commit, branch: CLOUD_RELEASE_BRANCH, previousCommit, ...identity,
    ci, promotedAt: now().toISOString(), promoted: true };
  savePromotion(receipt);
  saveState({ ...receipt, phase: 'promoted-awaiting-native-deployment' });
  return receipt;
}

export async function runCloudPublish(args = process.argv.slice(2), env = process.env) {
  const commit = parseCloudPublishArgs(args);
  assert(env.GITHUB_EVENT_PATH && lstatSync(env.GITHUB_EVENT_PATH).isFile() && !lstatSync(env.GITHUB_EVENT_PATH).isSymbolicLink(), 'Missing GitHub dispatch event');
  assert(lstatSync(env.GITHUB_EVENT_PATH).size <= 2_000_000, 'Dispatch event is too large');
  const event = JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, 'utf8'));
  assertCloudPublishContext(commit, env, event);
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8', windowsHide: true }).trim(), commit, 'Checkout differs from approval');
  const directory = cloudReleaseDirectory(ROOT, commit);
  const state = path.join(directory, 'promotion-state.json');
  writeFileSync(state, JSON.stringify({ schemaVersion: 1, commit, phase: 'claimed' }), { flag: 'wx', mode: 0o600 });
  let phase = 'claimed';
  try {
    return await promoteApprovedCloudRelease(commit, { env, event,
      api: createCloudGithubClient(env.GITHUB_TOKEN),
      saveState: value => { phase = value.phase; writeFileSync(state, JSON.stringify(value, null, 2)); },
      savePromotion: value => writeFileSync(path.join(directory, 'promotion.json'), JSON.stringify(value, null, 2), { flag: 'wx', mode: 0o600 }),
    });
  } catch {
    writeFileSync(state, JSON.stringify({ schemaVersion: 1, commit, phase, failed: true,
      promotionOutcomeMayBeUnknown: phase === 'promotion-requested' }, null, 2));
    throw new Error(`Cloud publication stopped at ${phase}; inspect the pinned workflow and deployment branch before any new approval`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  runCloudPublish().then(() => console.log('Approved commit promoted; native deployment verification must still complete.')).catch(() => {
    console.error('Cloud release promotion failed. No retry was performed; see the sanitized release receipt.');
    process.exitCode = 1;
  });
}
