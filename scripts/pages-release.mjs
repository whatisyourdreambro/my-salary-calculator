// Maintained GitHub-main Pages publisher. No import-time credentials or network.
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import { verifyArtifact } from './lib/pages-export.mjs';
import { verifyPagesAdvertising } from './verify-pages-advertising.mjs';
import { main as purgePages } from './cf-purge-after-deploy.mjs';
import { assertReleaseContext, pagesUploadArgs, publicationEnvironment, publishPages, PAGES_PROJECT, RELEASE_REPOSITORY,
  classifyUploadOutput, controlPlaneFailure, pagesPurgeEnvironment, PAGES_ACCOUNT,
  assertLocalReleaseContext, localReleaseDirectory } from './lib/pages-release.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const GH_ROOT = `/repos/${RELEASE_REPOSITORY}`;
const SHA = /^[a-f0-9]{40}$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const HASH = /^[a-f0-9]{64}$/;

/** Official Wrangler OAuth resolver. Capture only in process memory; never print credentials. */
export function localWranglerOAuth(env = process.env, execute = execFileSync) {
  assert.notEqual(env.GITHUB_ACTIONS, 'true');
  const authEnv = {};
  for (const name of ['SystemRoot', 'WINDIR', 'PATH', 'PATHEXT', 'COMSPEC', 'TEMP', 'TMP', 'TMPDIR',
    'HOME', 'USERPROFILE', 'XDG_CONFIG_HOME', 'APPDATA', 'LOCALAPPDATA']) {
    const entries = Object.entries(env).filter(([key]) => key.toLowerCase() === name.toLowerCase());
    assert.ok(new Set(entries.map(([, value]) => value)).size <= 1);
    if (entries.length) authEnv[name] = entries[0][1];
  }
  let raw, auth;
  try {
    raw = execute(process.execPath, [path.join(root, 'node_modules/wrangler/bin/wrangler.js'), 'auth', 'token', '--json'], {
      cwd: root, encoding: 'utf8', windowsHide: true, timeout: 20000, maxBuffer: 65536, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...authEnv, CI: 'true', WRANGLER_SEND_METRICS: 'false', WRANGLER_WRITE_LOGS: 'false',
        CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false' },
    });
    auth = JSON.parse(raw);
  } catch { throw new Error('Local Wrangler OAuth is unavailable; credential output withheld.'); }
  assert.equal(auth?.type, 'oauth', 'Local publication requires the existing Wrangler OAuth login');
  assert.ok(typeof auth.token === 'string' && auth.token.length > 30 && !/\s/.test(auth.token), 'Invalid local OAuth response');
  return auth.token;
}

async function limitedBody(response, maxBytes) {
  const chunks = []; let length = 0;
  assert.ok(response.body, 'Expected a response body');
  const reader = response.body.getReader();
  try {
    for (;;) { const { value, done } = await reader.read(); if (done) break;
      length += value.byteLength; assert.ok(length <= maxBytes, 'GitHub response exceeded its limit'); chunks.push(value); }
    return Buffer.concat(chunks);
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

/** Only repo GETs and the one fixed purge dispatch are available. No Cloudflare credential enters this client. */
export function createGithubReleaseClient(env = process.env, fetchFn = globalThis.fetch, execute = execFileSync) {
  let token;
  const headers = () => {
    if (!token) {
      token = env.GH_TOKEN || env.GITHUB_TOKEN;
      if (!token) {
        let result;
        try { result = execute('git', ['credential', 'fill'], { input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', timeout: 10000,
          windowsHide: true, maxBuffer: 65536, stdio: ['pipe', 'pipe', 'ignore'],
          env: { ...env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never' } }); }
        catch { throw new Error('GitHub authentication is unavailable; credential output withheld.'); }
        token = /^password=(.+)$/m.exec(result || '')?.[1]?.trim();
      }
      assert.ok(typeof token === 'string' && token.length > 0 && !/\s/.test(token), 'GitHub authentication is unavailable');
    }
    return { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json',
      'x-github-api-version': '2026-03-10', 'user-agent': 'MoneySalary-approved-Pages-release/1.0' };
  };
  const request = async (resource, method = 'GET', body) => {
    assert.ok(resource.startsWith(`${GH_ROOT}/`) && !/[\r\n#]|\.\./.test(resource), 'Unexpected GitHub resource');
    const response = await fetchFn(`https://api.github.com${resource}`, { method, redirect: 'manual',
      signal: AbortSignal.timeout(30000), headers: { ...headers(), ...(body ? { 'content-type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}) });
    assert.equal(response.status, 200, 'GitHub control request did not return its expected result');
    try { return JSON.parse((await limitedBody(response, 2 * 1024 * 1024)).toString('utf8')); }
    catch { throw new Error('GitHub control response was invalid; raw output withheld.'); }
  };
  return {
    get: resource => request(resource),
    dispatchPurge: ({ commit, deploymentId, configurationHash, requestId }) => {
      assert.match(commit, SHA); assert.match(deploymentId, UUID); assert.match(configurationHash, HASH); assert.match(requestId, UUID);
      return request(`${GH_ROOT}/actions/workflows/cf-purge.yml/dispatches`, 'POST', { ref: 'main', inputs: {
        operation: 'pages-verified-purge', target: 'pages', release_sha: commit, expected_deployment_id: deploymentId,
        expected_configuration_hash: configurationHash, request_id: requestId,
      } });
    },
    readArtifact: async id => {
      assert.ok(Number.isSafeInteger(id) && id > 0);
      const response = await fetchFn(`https://api.github.com${GH_ROOT}/actions/artifacts/${id}/zip`, {
        method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(30000), headers: headers() });
      assert.equal(response.status, 302, 'Expected the GitHub artifact storage redirect');
      await response.body?.cancel().catch(() => {});
      const target = new URL(response.headers.get('location'));
      assert.equal(target.protocol, 'https:'); assert.equal(target.username, ''); assert.equal(target.password, '');
      assert.equal(target.port, ''); assert.equal(target.hash, '');
      assert.ok(/^[a-z0-9-]+\.blob\.core\.windows\.net$/.test(target.hostname)
        || /^[a-z0-9.-]+\.actions\.githubusercontent\.com$/.test(target.hostname), 'Unexpected artifact storage host');
      // The signed URL is used once without Authorization and is never persisted.
      const archive = await fetchFn(target, { method: 'GET', redirect: 'error', signal: AbortSignal.timeout(30000) });
      assert.equal(archive.status, 200); return limitedBody(archive, 1024 * 1024);
    },
  };
}

export function createLocalReleaseApi(env = process.env, fetchFn = globalThis.fetch, execute = execFileSync) {
  const token = localWranglerOAuth(env, execute);
  const github = createGithubReleaseClient(env, fetchFn, execute);
  const api = createReleaseApi({ CF_ACCOUNT_ID: PAGES_ACCOUNT, CF_API_TOKEN: token }, fetchFn);
  return { ...api, readMain: async () => (await github.get(`${GH_ROOT}/commits/main`)).sha };
}

/** Decode a single tiny JSON receipt without extracting any archive paths. */
export function readPurgeReceiptArchive(bytes) {
  const zip = Buffer.from(bytes); assert.ok(zip.length >= 22 && zip.length <= 1024 * 1024);
  let end = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i--) if (zip.readUInt32LE(i) === 0x06054b50) { end = i; break; }
  assert.ok(end >= 0); assert.equal(end + 22 + zip.readUInt16LE(end + 20), zip.length);
  assert.equal(zip.readUInt16LE(end + 4), 0); assert.equal(zip.readUInt16LE(end + 6), 0);
  assert.equal(zip.readUInt16LE(end + 8), 1); assert.equal(zip.readUInt16LE(end + 10), 1);
  const central = zip.readUInt32LE(end + 16), centralSize = zip.readUInt32LE(end + 12);
  assert.ok(central + 46 <= end); assert.equal(central + centralSize, end); assert.equal(zip.readUInt32LE(central), 0x02014b50);
  const flags = zip.readUInt16LE(central + 8), method = zip.readUInt16LE(central + 10);
  assert.equal(flags & 1, 0); assert.ok([0, 8].includes(method));
  const compressed = zip.readUInt32LE(central + 20), size = zip.readUInt32LE(central + 24);
  assert.ok(size > 0 && size <= 65536 && compressed <= 1024 * 1024);
  const nameSize = zip.readUInt16LE(central + 28), extraSize = zip.readUInt16LE(central + 30), commentSize = zip.readUInt16LE(central + 32);
  assert.equal(46 + nameSize + extraSize + commentSize, centralSize);
  const name = zip.subarray(central + 46, central + 46 + nameSize).toString('utf8');
  assert.equal(name, 'purge-receipt.json'); assert.equal(zip.readUInt16LE(central + 34), 0);
  const local = zip.readUInt32LE(central + 42); assert.equal(local, 0); assert.equal(zip.readUInt32LE(local), 0x04034b50);
  assert.equal(zip.readUInt16LE(local + 6), flags); assert.equal(zip.readUInt16LE(local + 8), method);
  const localNameSize = zip.readUInt16LE(local + 26), localExtraSize = zip.readUInt16LE(local + 28);
  assert.equal(zip.subarray(local + 30, local + 30 + localNameSize).toString('utf8'), name);
  const start = local + 30 + localNameSize + localExtraSize; assert.ok(start + compressed <= central);
  const input = zip.subarray(start, start + compressed);
  const decoded = method === 8 ? inflateRawSync(input, { maxOutputLength: 65536 }) : input;
  assert.equal(decoded.length, size);
  let crc = 0xffffffff;
  for (const byte of decoded) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
  assert.equal((crc ^ 0xffffffff) >>> 0, zip.readUInt32LE(central + 16));
  try { return JSON.parse(decoded.toString('utf8')); }
  catch { throw new Error('Purge receipt JSON was invalid; raw output withheld.'); }
}

export async function githubVerifiedPurge(release, hooks, { github, save, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  requestId = randomUUID(), attempts = 60, now = () => Date.now() }) {
  assert.match(release.commit, SHA); assert.match(release.deploymentId, UUID); assert.match(release.configurationHash, HASH); assert.match(requestId, UUID);
  assert.ok(Number.isInteger(attempts) && attempts > 0 && attempts <= 120);
  const expected = { commit: release.commit, deploymentId: release.deploymentId, configurationHash: release.configurationHash };
  const started = now(); const state = { requestId, ...expected, phase: 'dispatch-claimed', startedAt: new Date(started).toISOString() };
  const workflow = await github.get(`${GH_ROOT}/actions/workflows/cf-purge.yml`);
  assert.equal(workflow.state, 'active'); assert.equal(workflow.path, '.github/workflows/cf-purge.yml'); assert.ok(Number.isSafeInteger(workflow.id));
  await hooks.beforePagesPurge(); save(state);
  // A transport failure can hide an accepted dispatch. Never retry this POST.
  const dispatched = await github.dispatchPurge({ ...expected, requestId });
  const runId = dispatched.workflow_run_id; assert.ok(Number.isSafeInteger(runId) && runId > 0);
  state.runId = runId; state.phase = 'waiting'; save(state);
  for (let index = 0; index < attempts; index++) {
    const run = await github.get(`${GH_ROOT}/actions/runs/${runId}`);
    assert.equal(run.id, runId); assert.equal(run.workflow_id, workflow.id); assert.equal(run.event, 'workflow_dispatch');
    assert.equal(run.head_branch, 'main'); assert.equal(run.head_sha, release.commit); assert.equal(run.run_attempt, 1);
    if (run.status === 'completed') {
      assert.equal(run.conclusion, 'success');
      const jobs = await github.get(`${GH_ROOT}/actions/runs/${runId}/jobs?filter=latest&per_page=100`);
      const matches = (jobs.jobs || []).filter(job => job.name === 'pages-verified-purge');
      assert.equal(matches.length, 1); assert.equal(matches[0].status, 'completed'); assert.equal(matches[0].conclusion, 'success');
      const artifacts = await github.get(`${GH_ROOT}/actions/runs/${runId}/artifacts?per_page=100`);
      assert.ok(artifacts.total_count <= 100);
      const candidates = (artifacts.artifacts || []).filter(item => item.name === `pages-verified-purge-${requestId}` && item.expired === false);
      assert.equal(candidates.length, 1); const artifact = candidates[0]; assert.ok(artifact.size_in_bytes <= 1024 * 1024);
      assert.equal(artifact.workflow_run?.id, runId); assert.equal(artifact.workflow_run?.head_sha, release.commit);
      const bytes = await github.readArtifact(artifact.id);
      assert.equal(artifact.digest, `sha256:${createHash('sha256').update(bytes).digest('hex')}`);
      const receipt = readPurgeReceiptArchive(bytes);
      assert.equal(receipt.schemaVersion, 1); assert.equal(receipt.requestId, requestId); assert.equal(receipt.runId, runId); assert.equal(receipt.runAttempt, 1);
      for (const key of ['commit', 'deploymentId', 'configurationHash']) assert.equal(receipt[key], release[key]);
      assert.equal(receipt.purgeVerified, true); const purgedAt = Date.parse(receipt.purgedAt);
      assert.ok(Number.isFinite(purgedAt) && purgedAt >= started && purgedAt <= now());
      await hooks.beforePagesPurge(); await hooks.onPagesPurge();
      state.phase = 'verified'; state.purgedAt = receipt.purgedAt; save(state); return 0;
    }
    if (index + 1 < attempts) await sleep(30000);
  }
  throw new Error('Purge workflow was not verified before the bounded wait ended');
}
export function assertConfiglessDirectory(directory) {
  assert.equal(realpathSync(directory), path.resolve(directory)); assert.equal(lstatSync(directory).isSymbolicLink(), false);
  for (let current = directory;; current = path.dirname(current)) {
    for (const file of ['wrangler.toml', 'wrangler.json', 'wrangler.jsonc', '.wrangler/deploy/config.json'])
      assert.equal(existsSync(path.join(current, file)), false, 'A Wrangler config would be inherited');
    if (current === path.dirname(current)) break;
  }
  assert.equal(existsSync(path.join(directory, 'functions')), false);
}

export function createReleaseApi(env, fetchFn = globalThis.fetch) {
  assert.match(env.CF_ACCOUNT_ID || '', /^[a-f0-9]{32}$/);
  assert.ok(env.CF_API_TOKEN && !/\s/.test(env.CF_API_TOKEN));
  const endpoint = `/accounts/${env.CF_ACCOUNT_ID}/pages/projects/${PAGES_PROJECT}`;
  const get = async (origin, resource, token, phase, github = false) => {
    let response, data;
    try {
      response = await fetchFn(origin + resource, { method: 'GET', redirect: 'error', signal: AbortSignal.timeout(20000),
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'User-Agent': 'MoneySalary-Pages-release/1.0' } });
    } catch { throw controlPlaneFailure(phase, 'transport'); }
    try { data = await response.json(); }
    catch { throw controlPlaneFailure(phase, 'invalid-json', response); }
    if (!response.ok || (!github && data?.success !== true)) throw controlPlaneFailure(phase, 'api-response', response, data);
    return data;
  };
  const cf = (resource, phase) => get('https://api.cloudflare.com/client/v4', resource, env.CF_API_TOKEN, phase);
  return {
    readMain: async () => {
      assert.ok(env.GITHUB_TOKEN && !/\s/.test(env.GITHUB_TOKEN));
      return (await get('https://api.github.com', `/repos/${RELEASE_REPOSITORY}/git/ref/heads/main`, env.GITHUB_TOKEN, 'read-main', true)).object?.sha;
    },
    readProject: async () => (await cf(endpoint, 'read-project')).result,
    readDeployment: async id => { assert.match(id, /^[a-f0-9-]{36}$/); return (await cf(`${endpoint}/deployments/${id}`, 'read-deployment')).result; },
    listDeployments: async () => {
      const rows = [];
      for (let page = 1; page <= 50; page++) {
        const data = await cf(`${endpoint}/deployments?env=production&page=${page}`, 'list-deployments');
        assert.ok(Array.isArray(data.result)); assert.equal(data.result_info?.page, page);
        assert.ok(Number.isInteger(data.result_info.total_pages) && data.result_info.total_pages >= 0 && data.result_info.total_pages <= 50);
        rows.push(...data.result); if (page >= data.result_info.total_pages) return rows;
      }
      throw new Error('Deployment history exceeds bounded reconciliation');
    },
  };
}

function spawnPagesUpload(cli, dist, commit, cwd, childEnv) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, pagesUploadArgs(cli, dist, commit), {
      cwd, env: childEnv, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
    });
    let bytes = 0, termination = 'none';
    const output = [];
    const capture = chunk => {
      bytes += chunk.length;
      if (bytes <= 4 * 1024 * 1024) output.push(chunk);
      else { termination = 'output-limit'; child.kill(); }
    };
    child.stdout.on('data', capture); child.stderr.on('data', capture);
    const timer = setTimeout(() => { termination = 'timeout'; child.kill(); }, 30 * 60 * 1000);
    child.once('error', () => { termination = 'spawn-error'; });
    child.once('close', code => {
      clearTimeout(timer);
      const diagnostics = classifyUploadOutput(Buffer.concat(output).toString('utf8'), termination, bytes);
      output.length = 0;
      resolve({ code: termination === 'none' ? code : -1, diagnostics });
    });
  });
}

export async function runPagesRelease(env = process.env) {
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const local = () => ({ commit: git(['rev-parse', 'HEAD']).trim(), status: git(['status', '--porcelain=v1', '-z', '--untracked-files=all']) });
  const commit = assertReleaseContext(env, local());
  const purgeEnv = pagesPurgeEnvironment(env, commit);
  assert.equal(git(['ls-files', '--error-unmatch', '.env.production']).trim(), '.env.production');
  const { stage, marker } = verifyArtifact(root, 'production', env); verifyPagesAdvertising(stage);
  const dist = path.join(stage, 'dist');
  assert.equal(path.basename(stage), '.pages-build'); assert.equal(realpathSync(dist), path.resolve(dist));
  assert.equal(lstatSync(dist).isSymbolicLink(), false);
  const api = createReleaseApi(env);
  const receipt = path.join(root, '.artifacts/pages-release'); mkdirSync(receipt, { recursive: true });
  const stateFile = path.join(receipt, 'release-state.json');
  assert.equal(existsSync(stateFile), false, 'An attempt receipt already exists; reconcile instead of retrying');
  assert.equal(existsSync(path.join(receipt, 'production-pins.json')), false);
  // Exclusive claim precedes remote mutation; raw CLI output is never persisted.
  writeFileSync(stateFile, JSON.stringify({ phase: 'claimed', commit }) + '\n', { flag: 'wx' });
  const save = name => value => writeFileSync(path.join(receipt, name), JSON.stringify(value, null, 2) + '\n');
  const require = createRequire(path.join(root, 'package.json'));
  const cli = path.join(path.dirname(require.resolve('wrangler/package.json')), 'bin/wrangler.js');
  const cwd = mkdtempSync(path.join(os.tmpdir(), 'msy-pages-auto-release-'));
  try {
    assertConfiglessDirectory(cwd);
    const childEnv = publicationEnvironment(env, cwd);
    const upload = () => spawnPagesUpload(cli, dist, commit, cwd, childEnv);
    return await publishPages({ commit, marker }, { ...api, upload,
      verifyLocal: async () => {
        assertReleaseContext(env, local());
        const current = verifyArtifact(root, 'production', env); assert.equal(current.marker.outputHash, marker.outputHash);
        verifyPagesAdvertising(current.stage);
      },
      purge: hooks => purgePages(purgeEnv, hooks),
      saveState: save('release-state.json'), savePins: save('production-pins.json'),
    });
  } finally {
    // Delete only this verified task-owned temporary directory, never build assets.
    if (path.dirname(cwd) === realpathSync(os.tmpdir()) && path.basename(cwd).startsWith('msy-pages-auto-release-')
      && realpathSync(cwd) === cwd) rmSync(cwd, { recursive: true, force: true });
  }
}

export async function runApprovedLocalPagesRelease(commit, env = process.env) {
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const local = () => ({ commit, head: git(['rev-parse', 'HEAD']).trim(),
    status: git(['status', '--porcelain=v1', '-z', '--untracked-files=all']), origin: git(['remote', 'get-url', 'origin']).trim() });
  assertLocalReleaseContext(env, local());
  assert.equal(git(['ls-files', '--error-unmatch', '.env.production']).trim(), '.env.production');
  const github = createGithubReleaseClient(env);
  const { pagesPublicationReadiness, waitForPagesVerification } = await import('./trend-publish/publish-approved.mjs');
  const checkCi = async () => {
    const readiness = await pagesPublicationReadiness(github.get);
    assert.equal(readiness.mainSha, commit, 'Main changed; do not publish this local package');
    return waitForPagesVerification(github.get, { sha: commit, workflowId: readiness.workflowId, attempts: 1 });
  };
  const ci = await checkCi();
  const verified = verifyArtifact(root, 'production', env), { stage, marker } = verified;
  verifyPagesAdvertising(stage); assertProductionDirectory(stage);
  const receipt = localReleaseDirectory(root, commit);
  const stateFile = path.join(receipt, 'release-state.json');
  assert.equal(existsSync(stateFile), false, 'This commit already has a release attempt; reconcile, never re-upload');
  assert.equal(existsSync(path.join(receipt, 'production-pins.json')), false);
  writeFileSync(stateFile, JSON.stringify({ phase: 'claimed', commit, mode: 'approved-local', ci }) + '\n', { flag: 'wx', mode: 0o600 });
  const save = name => value => {
    // Refuse links introduced after the per-commit directory check.
    assert.equal(localReleaseDirectory(root, commit), receipt);
    const target = path.join(receipt, name);
    if (existsSync(target)) assert.equal(lstatSync(target).isSymbolicLink(), false);
    writeFileSync(target, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
  };
  const token = localWranglerOAuth(env);
  const api = createReleaseApi({ CF_ACCOUNT_ID: PAGES_ACCOUNT, CF_API_TOKEN: token });
  const require = createRequire(path.join(root, 'package.json'));
  const cli = path.join(path.dirname(require.resolve('wrangler/package.json')), 'bin/wrangler.js');
  const cwd = mkdtempSync(path.join(os.tmpdir(), 'msy-pages-local-release-'));
  try {
    assertConfiglessDirectory(cwd);
    const childEnv = publicationEnvironment({ ...env, CF_ACCOUNT_ID: PAGES_ACCOUNT, CF_API_TOKEN: token }, cwd);
    return await publishPages({ commit, marker }, { ...api,
      readMain: async () => (await github.get(`${GH_ROOT}/commits/main`)).sha,
      verifyLocal: async () => {
        assertLocalReleaseContext(env, local()); await checkCi();
        const current = verifyArtifact(root, 'production', env); assert.equal(current.marker.outputHash, marker.outputHash);
        verifyPagesAdvertising(current.stage); assertProductionDirectory(current.stage);
      },
      upload: () => spawnPagesUpload(cli, path.join(stage, 'dist'), commit, cwd, childEnv),
      purge: hooks => githubVerifiedPurge(hooks.release, hooks, { github, save: save('purge-dispatch.json') }),
      saveState: state => save('release-state.json')({ ...state, mode: 'approved-local', ci }),
      savePins: save('production-pins.json'),
    });
  } finally {
    if (path.dirname(cwd) === realpathSync(os.tmpdir()) && path.basename(cwd).startsWith('msy-pages-local-release-')
      && realpathSync(cwd) === cwd) rmSync(cwd, { recursive: true, force: true });
  }
}

function assertProductionDirectory(stage) {
  const dist = path.join(stage, 'dist');
  assert.equal(path.basename(stage), '.pages-build'); assert.equal(realpathSync(dist), path.resolve(dist));
  assert.equal(lstatSync(dist).isSymbolicLink(), false);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    assert.ok(args.length === 3 && args[0] === '--publish-approved-local' && args[1] === '--commit', 'Explicit approved local commit is required');
    const pins = await runApprovedLocalPagesRelease(args[2]);
    console.log(JSON.stringify({ deploymentId: pins.deploymentId, commit: pins.commit, purgeVerified: true, next: 'verify-pages-release-http' }));
  } catch { console.error('Pages publication stopped. Inspect sanitized per-commit .artifacts/pages-release-local receipts; no automatic retry or rollback.'); process.exitCode = 1; }
}
