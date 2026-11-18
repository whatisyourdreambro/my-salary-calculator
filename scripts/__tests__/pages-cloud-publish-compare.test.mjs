// Approval run #29 (44337287611, 2026-11-19) stopped in the gate step: the un-paged comparison answer was
// 2,563,739 bytes (402 commits, 480 files with patches), over the client's 2,000,000-byte cap. The gate now asks
// for page 2 of one commit per page, which never carries the file list. These tests drive the real GitHub client
// with a fake fetch: the new address, the unchanged cap, the incident itself and the unchanged comparison checks.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CLOUD_RELEASE_REPOSITORY as REPOSITORY, CLOUD_RELEASE_OWNER as OWNER, CLOUD_RELEASE_BRANCH as BRANCH,
  createCloudGithubClient, promoteApprovedCloudRelease } from '../pages-cloud-publish.mjs';

const COMMIT = 'a'.repeat(40), OLD = 'b'.repeat(40), OTHER = 'c'.repeat(40);
const API = `https://api.github.com/repos/${REPOSITORY}`;
const PAGED = `${API}/compare/${OLD}...${COMMIT}?per_page=1&page=2`;
const UNPAGED = `${API}/compare/${OLD}...${COMMIT}`;
const CAP = 2_000_000, INCIDENT_BYTES = 2_563_739;
const WORKFLOW_ID = 342078873, CI_RUN = 44237748702, CI_JOB = 987654321;
const SIZE_ERROR = { message: 'GitHub response exceeds the size limit' };

const env = () => ({ GITHUB_ACTIONS: 'true', PAGES_CLOUD_PUBLISH_ENABLED: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch',
  GITHUB_REPOSITORY: REPOSITORY, GITHUB_REPOSITORY_OWNER: OWNER, GITHUB_REF: 'refs/heads/main', GITHUB_SHA: COMMIT,
  GITHUB_ACTOR: OWNER, GITHUB_TRIGGERING_ACTOR: OWNER, GITHUB_RUN_ATTEMPT: '1', GITHUB_RUN_ID: '44337287611' });
const event = () => ({ repository: { full_name: REPOSITORY, owner: { login: OWNER } },
  sender: { login: OWNER }, ref: 'main', inputs: { approved_commit: COMMIT } });
const run = { id: CI_RUN, workflow_id: WORKFLOW_ID, head_sha: COMMIT, head_branch: 'main', event: 'push',
  head_repository: { full_name: REPOSITORY }, status: 'completed', conclusion: 'success' };
const job = { id: CI_JOB, run_id: CI_RUN, head_sha: COMMIT, name: 'verify', status: 'completed', conclusion: 'success' };

// Shaped like GitHub's answers measured on 2026-11-19 for page 2 (header fields of the whole comparison, at most
// one commit, no files key).
const comparison = ({ status = 'ahead', ahead = 402, behind = 0, base = OLD, mergeBase = OLD, commits = 1 } = {}) => ({
  url: UNPAGED, status, ahead_by: ahead, behind_by: behind, total_commits: ahead,
  base_commit: { sha: base }, merge_base_commit: { sha: mergeBase },
  commits: Array.from({ length: commits }, (_, index) => ({ sha: String(index + 1).repeat(40).slice(0, 40) })) });
const without = (value, key) => { const copy = { ...value }; delete copy[key]; return copy; };
// A valid comparison padded with one file patch to exactly `bytes` UTF-8 bytes (what page 1 or no paging carries).
function comparisonOfBytes(bytes, value = comparison()) {
  const empty = JSON.stringify({ ...value, files: [{ filename: 'src/x.ts', patch: '' }] });
  const body = JSON.stringify({ ...value, files: [{ filename: 'src/x.ts', patch: 'x'.repeat(bytes - Buffer.byteLength(empty)) }] });
  assert.equal(Buffer.byteLength(body), bytes);
  return body;
}
// Node 22 appends the actual and expected values to an assertion's own message; the first line is the message.
const firstLine = message => error => error instanceof Error && error.message.split('\n')[0] === message;
// Streams `text` in `parts` chunks (then 64 KiB chunks forever when `endless`) and records whether the reader
// cancelled the stream.
function streamed(text, parts = 1, { endless = false } = {}) {
  const bytes = Buffer.from(text), size = Math.ceil(bytes.length / parts), state = { cancelled: false };
  let offset = 0;
  const body = new ReadableStream({
    pull(controller) {
      if (offset >= bytes.length) {
        if (endless) controller.enqueue(new Uint8Array(65_536).fill(120)); else controller.close();
        return;
      }
      controller.enqueue(new Uint8Array(bytes.subarray(offset, offset + size))); offset += size;
    },
    cancel() { state.cancelled = true; },
  });
  return { response: new Response(body, { headers: { 'content-type': 'application/json' } }), state };
}

// The GitHub API as the gate sees it. The un-paged comparison answers with the over-cap body of run #29.
function fakeGithub({ paged = () => Response.json(comparison()) } = {}) {
  const calls = [];
  let production = OLD;
  const ref = (name, sha) => Response.json({ ref: `refs/heads/${name}`, object: { type: 'commit', sha } });
  const fetchFn = async (url, options) => {
    calls.push({ url, options });
    if (options.method === 'PATCH') {
      assert.equal(url, `${API}/git/refs/heads/${BRANCH}`);
      production = JSON.parse(options.body).sha; return ref(BRANCH, production);
    }
    assert.equal(options.method, 'GET');
    switch (url) {
      case `${API}/actions/workflows/ci.yml`: return Response.json({ id: WORKFLOW_ID, path: '.github/workflows/ci.yml', state: 'active' });
      case `${API}/git/ref/heads/main`: return ref('main', COMMIT);
      case `${API}/git/ref/heads/${BRANCH}`: return ref(BRANCH, production);
      case `${API}/actions/workflows/${WORKFLOW_ID}/runs?event=push&branch=main&head_sha=${COMMIT}&per_page=100`:
        return Response.json({ total_count: 1, workflow_runs: [run] });
      case `${API}/actions/runs/${CI_RUN}/jobs?filter=latest&per_page=100`: return Response.json({ total_count: 1, jobs: [job] });
      case UNPAGED: return new Response(comparisonOfBytes(INCIDENT_BYTES));
      case PAGED: return paged();
      default: return new Response('{}', { status: 404 });
    }
  };
  const states = [], receipts = [];
  const publish = () => promoteApprovedCloudRelease(COMMIT, { env: env(), event: event(),
    api: createCloudGithubClient('synthetic-github-token', fetchFn),
    saveState: value => states.push(structuredClone(value)), savePromotion: value => receipts.push(structuredClone(value)),
    now: () => new Date('2026-11-19T00:00:00.000Z'), ciOptions: { attempts: 1 }, readback: { sleep: async () => {} } });
  return { calls, fetchFn, states, receipts, publish, production: () => production,
    trace: () => calls.map(({ url, options }) => `${options.method} ${url.slice(API.length)}`) };
}

test('compare asks for page 2 of one commit per page with the same fixed request options', async () => {
  const calls = [];
  const api = createCloudGithubClient('synthetic-github-token', async (url, options) => {
    calls.push({ url, options }); return Response.json(comparison());
  });
  assert.equal((await api.compare(OLD, COMMIT)).status, 'ahead');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, PAGED);
  const url = new URL(calls[0].url);
  assert.equal(url.origin, 'https://api.github.com');
  assert.equal(url.pathname, `/repos/${REPOSITORY}/compare/${OLD}...${COMMIT}`);
  assert.deepEqual([...url.searchParams], [['per_page', '1'], ['page', '2']]);
  const { options } = calls[0];
  assert.equal(options.method, 'GET'); assert.equal(options.redirect, 'manual'); assert.equal(options.body, undefined);
  assert(options.signal instanceof AbortSignal);
  assert.deepEqual(options.headers, { authorization: 'Bearer synthetic-github-token', accept: 'application/vnd.github+json',
    'x-github-api-version': '2026-03-10', 'user-agent': 'MoneySalary-cloud-release/1.0' });
  // Malformed commits still fail before any request.
  for (const [previous, commit] of [[OLD.slice(0, 7), COMMIT], [OLD, COMMIT.toUpperCase()], [`${OLD}?page=1`, COMMIT], [OLD, `${COMMIT}#x`]])
    await assert.rejects(async () => api.compare(previous, commit));
  assert.equal(calls.length, 1);
});

test('the request bounds are unchanged: 2,000,000-byte cap, 20-second timeout, manual redirects', () => {
  const source = readFileSync(new URL('../pages-cloud-publish.mjs', import.meta.url), 'utf8');
  assert.equal(source.match(/redirect: 'manual', signal: AbortSignal\.timeout\(20_000\)/g)?.length, 1);
  assert.equal(source.match(/if \(size > 2_000_000\) \{ await reader\.cancel\(\); throw new Error\('GitHub response exceeds the size limit'\); \}/g)?.length, 1);
});

test('the comparison still obeys the cap: exactly 2,000,000 bytes are read, one byte more fails', async () => {
  for (const parts of [1, 7]) {
    const exact = streamed(comparisonOfBytes(CAP), parts);
    const accepted = createCloudGithubClient('synthetic', async () => exact.response);
    assert.equal((await accepted.compare(OLD, COMMIT)).status, 'ahead');
    for (const bytes of [CAP + 1, INCIDENT_BYTES]) {
      const over = streamed(comparisonOfBytes(bytes), parts);
      const refused = createCloudGithubClient('synthetic', async () => over.response);
      await assert.rejects(refused.compare(OLD, COMMIT), SIZE_ERROR);
    }
  }
  // A body that never ends stops at the cap and the stream is cancelled.
  const endless = streamed('{"status":"ahead","files":[{"patch":"', 3, { endless: true });
  await assert.rejects(createCloudGithubClient('synthetic', async () => endless.response).compare(OLD, COMMIT), SIZE_ERROR);
  assert.equal(endless.state.cancelled, true);
});

test('run #29 regression: an over-cap un-paged comparison no longer stops a legitimate publication', async () => {
  const github = fakeGithub();
  // Control: in this fake the address the gate used to ask for is over the cap, exactly as measured for run #29.
  const control = createCloudGithubClient('synthetic', async (url, options) => github.fetchFn(UNPAGED, options));
  await assert.rejects(control.compare(OLD, COMMIT), SIZE_ERROR);
  github.calls.length = 0;

  const receipt = await github.publish();
  assert.equal(receipt.promoted, true); assert.equal(receipt.commit, COMMIT); assert.equal(receipt.previousCommit, OLD);
  assert.deepEqual(receipt.ci, { runId: CI_RUN, jobId: CI_JOB });
  assert.equal(github.production(), COMMIT);
  // Same calls in the same order as before the repair; only the comparison address carries the paging query.
  assert.deepEqual(github.trace(), [
    'GET /actions/workflows/ci.yml',
    'GET /git/ref/heads/main',
    `GET /actions/workflows/${WORKFLOW_ID}/runs?event=push&branch=main&head_sha=${COMMIT}&per_page=100`,
    `GET /actions/runs/${CI_RUN}/jobs?filter=latest&per_page=100`,
    'GET /git/ref/heads/main',
    `GET /git/ref/heads/${BRANCH}`,
    `GET /compare/${OLD}...${COMMIT}?per_page=1&page=2`,
    'GET /git/ref/heads/main',
    `GET /git/ref/heads/${BRANCH}`,
    `PATCH /git/refs/heads/${BRANCH}`,
    `GET /git/ref/heads/${BRANCH}`,
    'GET /git/ref/heads/main',
  ]);
  assert(!github.calls.some(({ url }) => url === UNPAGED));
  const mutations = github.calls.filter(({ options }) => options.method === 'PATCH');
  assert.equal(mutations.length, 1); assert.deepEqual(JSON.parse(mutations[0].options.body), { sha: COMMIT, force: false });
  assert.equal(github.receipts.length, 1); assert.equal(github.states.at(-1).phase, 'promoted-awaiting-native-deployment');

  // The publication of one commit gets an empty page 2 (measured: header fields present, no commits, no files).
  const single = fakeGithub({ paged: () => Response.json(comparison({ ahead: 1, commits: 0 })) });
  assert.equal((await single.publish()).promoted, true);
  assert.equal(single.calls.filter(({ options }) => options.method === 'PATCH').length, 1);
});

test('an over-cap answer at the new address still stops the gate before the promotion', async () => {
  for (const bytes of [CAP + 1, INCIDENT_BYTES]) {
    const github = fakeGithub({ paged: () => new Response(comparisonOfBytes(bytes)) });
    await assert.rejects(github.publish(), SIZE_ERROR);
    assert(!github.calls.some(({ options }) => options.method === 'PATCH'));
    assert.equal(github.production(), OLD); assert.equal(github.receipts.length, 0);
    assert.equal(github.states.at(-1).phase, 'checking-ci');
  }
});

test('behind, diverged, identical, a wrong base and a wrong merge base are still refused through the real client', async () => {
  // Shapes as GitHub answered page 2 on 2026-11-19 (reversed pair, diverged pairs, identical pair).
  const variants = [
    [comparison({ status: 'behind', ahead: 0, behind: 402, mergeBase: COMMIT, commits: 0 }), 'Promotion must be a fast-forward'],
    [comparison({ status: 'diverged', ahead: 7, behind: 705, mergeBase: OTHER }), 'Promotion must be a fast-forward'],
    [comparison({ status: 'diverged', ahead: 1, behind: 298, mergeBase: OTHER, commits: 0 }), 'Promotion must be a fast-forward'],
    [comparison({ status: 'identical', ahead: 0, commits: 0 }), 'Promotion must be a fast-forward'],
    [comparison({ base: OTHER }), 'Unexpected comparison base'],
    [comparison({ mergeBase: OTHER }), 'Deployment branch diverged'],
    [without(comparison(), 'status'), 'Promotion must be a fast-forward'],
    [without(comparison(), 'base_commit'), 'Unexpected comparison base'],
    [without(comparison(), 'merge_base_commit'), 'Deployment branch diverged'],
    [{}, 'Promotion must be a fast-forward'],
  ];
  for (const [body, message] of variants) {
    const github = fakeGithub({ paged: () => Response.json(body) });
    await assert.rejects(github.publish(), firstLine(message));
    assert(github.calls.some(({ url }) => url === PAGED));
    assert(!github.calls.some(({ options }) => options.method === 'PATCH'));
    assert.equal(github.production(), OLD); assert.equal(github.receipts.length, 0);
    assert.equal(github.states.at(-1).phase, 'checking-ci');
  }
});
