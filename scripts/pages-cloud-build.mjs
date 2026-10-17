// Cloudflare Git build only. No upload command, OAuth, Cloudflare API or browser.
// GitHub's public API independently checks the exact source and active owner approval.
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanBuildEnvironment, readPublicBuildConfiguration, verifyArtifact } from './lib/pages-export.mjs';
import { main as pagesBuild } from './pages-build.mjs';

export const CLOUD_BUILD_REPOSITORY = 'whatisyourdreambro/my-salary-calculator';
export const CLOUD_BUILD_BRANCH = 'codex/pages-production';
const OWNER = 'whatisyourdreambro';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SHA = /^[a-f0-9]{40}$/;
const PREFIX = `/repos/${CLOUD_BUILD_REPOSITORY}/`;
const MAX_BUILD_MS = 18 * 60 * 1000;
const PHASES = new Set(['arguments', 'node-version', 'git-head', 'git-status', 'git-origin',
  'provider-environment', 'provider-branch', 'provider-commit', 'checkout-head', 'checkout-status',
  'checkout-origin', 'publication-environment', 'qa-environment', 'public-configuration',
  'installation-environment', 'installation-directory', 'installation-npmrc', 'npm-location',
  'approval-before', 'dependency-install', 'application-build', 'artifact-verification',
  'attestation-verification', 'approval-after', 'approval-unchanged', 'time-budget', 'unclassified']);
// Keep original errors, assertion actual/expected values and environment content
// out of diagnostics. Only errors created here can carry an allowed phase.
const failurePhases = new WeakMap();
function phaseFailure(phase) {
  const error = new Error('Native Pages build checkpoint failed; details withheld');
  failurePhases.set(error, PHASES.has(phase) ? phase : 'unclassified'); return error;
}
function checkpoint(phase, operation) {
  try { return operation(); }
  catch (error) { throw failurePhases.has(error) ? error : phaseFailure(phase); }
}
async function asyncCheckpoint(phase, operation) {
  try { return await operation(); }
  catch (error) { throw failurePhases.has(error) ? error : phaseFailure(phase); }
}
export function nativeBuildDiagnostic(error) {
  return { schemaVersion: 1, event: 'native-build-failed', phase: failurePhases.get(error) || 'unclassified',
    outputApproved: false, detailsWithheld: true };
}

export function matchesCloudRepositoryOrigin(origin) {
  if (origin === `git@github.com:${CLOUD_BUILD_REPOSITORY}.git`) return true;
  if (typeof origin !== 'string' || origin.length > 16384 || /[\u0000-\u0020\u007f?#\\]/.test(origin)) return false;
  try {
    const url = new URL(origin);
    const authority = /^https:\/\/([^/]+)\//i.exec(origin)?.[1];
    // Pages' Git clone includes provider-owned credentials in URL userinfo.
    // Do not log, retain separately, or reuse them. Match only the exact remote
    // destination, including rejecting explicit default ports and URL suffixes.
    const host = authority?.slice(authority.lastIndexOf('@') + 1);
    return url.protocol === 'https:' && url.hostname === 'github.com' && url.port === ''
      && host?.toLowerCase() === 'github.com' && url.search === '' && url.hash === ''
      && [`/${CLOUD_BUILD_REPOSITORY}`, `/${CLOUD_BUILD_REPOSITORY}.git`].includes(url.pathname);
  } catch { return false; }
}

export function assertCloudBuildContext(env, local) {
  checkpoint('provider-environment', () => assert.equal(env.CF_PAGES, '1'));
  checkpoint('provider-branch', () => assert.equal(env.CF_PAGES_BRANCH, CLOUD_BUILD_BRANCH));
  checkpoint('provider-commit', () => assert.match(env.CF_PAGES_COMMIT_SHA || '', SHA));
  checkpoint('checkout-head', () => assert.equal(local.head, env.CF_PAGES_COMMIT_SHA));
  checkpoint('checkout-status', () => assert.equal(local.status, '', 'Cloud build requires a clean exact source checkout'));
  checkpoint('checkout-origin', () => assert.ok(matchesCloudRepositoryOrigin(local.origin)));
  checkpoint('publication-environment', () => {
    assert.notEqual(env.GITHUB_ACTIONS, 'true');
    if (env.PAGES_ENVIRONMENT !== undefined) assert.equal(env.PAGES_ENVIRONMENT, 'production');
  });
  checkpoint('qa-environment', () => {
    for (const key of ['MSY_QA_MODE', 'NEXT_PUBLIC_ADS_DISABLED', 'MSY_QA_PAGES_STAGE', 'MSY_QA_WORKER_STAGE', 'MSY_PAGES_LOCAL_CHILD', 'MSY_QA_SERVER'])
      assert.notEqual(env[key], '1', 'Cloud publication refuses QA settings');
  });
  return env.CF_PAGES_COMMIT_SHA;
}

export function publicGithubBuildClient(fetchFn = globalThis.fetch) {
  let calls = 0;
  return async resource => {
    assert.ok(resource.startsWith(PREFIX) && !/[\r\n#\\]|\.\./.test(resource));
    assert.ok(++calls <= 24, 'Public GitHub build gate request bound exceeded');
    let response;
    try { response = await fetchFn(`https://api.github.com${resource}`, { method: 'GET', redirect: 'manual',
      signal: AbortSignal.timeout(15000), headers: { accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28', 'user-agent': 'MoneySalary-native-build-gate/1.0' } }); }
    catch { throw new Error('Public build gate transport failed'); }
    assert.equal(response.status, 200, 'Public build gate did not return HTTP 200');
    const reader = response.body?.getReader(); assert.ok(reader);
    const chunks = []; let length = 0;
    try {
      for (;;) { const { done, value } = await reader.read(); if (done) break;
        length += value.byteLength; assert.ok(length <= 2 * 1024 * 1024, 'Public build gate response exceeded its bound'); chunks.push(value); }
      try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
      catch { throw new Error('Public build gate returned invalid JSON'); }
    } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  };
}

export async function verifyCloudBuildApproval(commit, get) {
  assert.match(commit || '', SHA);
  assert.equal((await get(`${PREFIX}commits/main`)).sha, commit, 'Main moved; stop native publication');
  assert.equal((await get(`${PREFIX}git/ref/heads/${CLOUD_BUILD_BRANCH}`)).object?.sha, commit, 'Production ref does not match this build');
  const workflow = async name => {
    const result = await get(`${PREFIX}actions/workflows/${name}`);
    assert.equal(result.path, `.github/workflows/${name}`); assert.equal(result.state, 'active');
    assert.ok(Number.isSafeInteger(result.id) && result.id > 0); return result;
  };
  const ci = await workflow('ci.yml');
  const runs = await get(`${PREFIX}actions/workflows/${ci.id}/runs?event=push&branch=main&head_sha=${commit}&per_page=100`);
  assert.ok(Array.isArray(runs.workflow_runs) && runs.total_count <= 100);
  const matching = runs.workflow_runs.filter(run => run.workflow_id === ci.id && run.head_sha === commit
    && run.head_branch === 'main' && run.event === 'push' && run.head_repository?.full_name === CLOUD_BUILD_REPOSITORY)
    .sort((a, b) => b.id - a.id);
  const verified = matching[0]; assert.ok(verified); assert.equal(verified.status, 'completed'); assert.equal(verified.conclusion, 'success');
  assert.ok(Number.isSafeInteger(verified.id) && verified.id > 0);
  const jobs = await get(`${PREFIX}actions/runs/${verified.id}/jobs?filter=latest&per_page=100`);
  assert.ok(Array.isArray(jobs.jobs) && jobs.total_count <= 100);
  const selected = jobs.jobs.filter(job => job.name === 'verify'); assert.equal(selected.length, 1);
  const job = selected[0]; assert.equal(job.run_id, verified.id); assert.equal(job.head_sha, commit);
  assert.equal(job.status, 'completed'); assert.equal(job.conclusion, 'success'); assert.ok(Number.isSafeInteger(job.id) && job.id > 0);
  const publisher = await workflow('pages-publish.yml');
  const approvals = await get(`${PREFIX}actions/workflows/${publisher.id}/runs?event=workflow_dispatch&branch=main&head_sha=${commit}&status=in_progress&per_page=100`);
  assert.ok(Array.isArray(approvals.workflow_runs) && approvals.total_count <= 100);
  const active = approvals.workflow_runs.filter(run => run.workflow_id === publisher.id && run.head_sha === commit
    && run.head_branch === 'main' && run.event === 'workflow_dispatch' && run.status === 'in_progress'
    && run.head_repository?.full_name === CLOUD_BUILD_REPOSITORY);
  assert.equal(active.length, 1, 'Exactly one active approval is required');
  const approval = active[0]; assert.equal(approval.actor?.login, OWNER); assert.equal(approval.triggering_actor?.login, OWNER);
  assert.equal(approval.run_attempt, 1); assert.equal(approval.conclusion, null);
  assert.ok(Number.isSafeInteger(approval.id) && approval.id > 0);
  return { commit, branch: CLOUD_BUILD_BRANCH, ci: { runId: verified.id, jobId: job.id }, approval: { runId: approval.id, actor: OWNER } };
}

export function trustedNpmCli(execPath = process.execPath) {
  return checkpoint('npm-location', () => {
    const base = path.dirname(execPath);
    const candidates = [path.join(base, 'node_modules/npm/bin/npm-cli.js'), path.join(base, '../lib/node_modules/npm/bin/npm-cli.js')];
    const found = candidates.find(file => existsSync(file) && lstatSync(file).isFile());
    assert.ok(found, 'Installed Node distribution npm CLI was not found'); return realpathSync(found);
  });
}

export function installationEnvironment(root, input) {
  const publicInput = checkpoint('public-configuration', () => readPublicBuildConfiguration(root, 'production', input).input);
  const env = checkpoint('installation-environment', () => cleanBuildEnvironment(publicInput, 'production', path.join(root, '.pages-build')));
  const owned = checkpoint('installation-directory', () => {
    let directory = realpathSync(root);
    for (const part of ['.artifacts', 'pages-cloud-build', 'install-home']) {
      directory = path.join(directory, part); if (!existsSync(directory)) mkdirSync(directory);
      assert.equal(lstatSync(directory).isSymbolicLink(), false); assert.equal(realpathSync(directory), directory);
    }
    return directory;
  });
  env.HOME = owned; env.USERPROFILE = owned;
  env.npm_config_userconfig = path.join(owned, 'user.npmrc'); env.npm_config_globalconfig = path.join(owned, 'global.npmrc');
  checkpoint('installation-npmrc', () => {
    for (const file of [env.npm_config_userconfig, env.npm_config_globalconfig]) {
      if (existsSync(file)) assert.equal(lstatSync(file).isSymbolicLink(), false);
      writeFileSync(file, '');
    }
  });
  env.npm_execpath = trustedNpmCli(); return env;
}

export async function orchestrateCloudBuild(deps) {
  const commit = assertCloudBuildContext(deps.env, await deps.readLocal());
  const before = await asyncCheckpoint('approval-before', () => verifyCloudBuildApproval(commit, deps.get));
  await asyncCheckpoint('dependency-install', () => deps.install());
  assertCloudBuildContext(deps.env, await deps.readLocal());
  await asyncCheckpoint('application-build', () => deps.build(before));
  const verified = await asyncCheckpoint('artifact-verification', () => deps.verify());
  checkpoint('attestation-verification', () => {
    assert.deepEqual(verified.manifest.nativeRelease.ci, before.ci);
    assert.deepEqual(verified.manifest.nativeRelease.approval, before.approval);
    assert.equal(verified.manifest.nativeRelease.commit, commit);
  });
  assertCloudBuildContext(deps.env, await deps.readLocal());
  const after = await asyncCheckpoint('approval-after', () => verifyCloudBuildApproval(commit, deps.get));
  checkpoint('approval-unchanged', () => assert.deepEqual(after, before, 'Approval or verification changed during the build'));
  return { completed: true, commit, buildId: verified.marker.buildId, approvalRunId: before.approval.runId };
}

export async function main(args = process.argv.slice(2), input = process.env) {
  checkpoint('arguments', () => assert.equal(args.length, 0, 'Native Pages build takes no arguments'));
  checkpoint('node-version', () => assert.equal(process.versions.node.split('.')[0], '22', 'Native Pages builds require Node 22'));
  // Save the provider identity before removing private environment bindings from
  // all installation/build children. The provider has a separate 20-minute cap.
  const env = { ...input };
  const git = args => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', timeout: 15000,
    windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
  const readLocal = async () => ({ head: checkpoint('git-head', () => git(['rev-parse', 'HEAD']).trim()),
    status: checkpoint('git-status', () => git(['status', '--porcelain=v1', '-z', '--untracked-files=all'])),
    origin: checkpoint('git-origin', () => git(['remote', 'get-url', 'origin']).trim()) });
  assertCloudBuildContext(env, await readLocal());
  const childEnv = installationEnvironment(ROOT, env);
  const get = publicGithubBuildClient();
  const timer = setTimeout(() => { console.error(JSON.stringify(nativeBuildDiagnostic(phaseFailure('time-budget')))); process.exit(1); }, MAX_BUILD_MS);
  try {
    const result = await orchestrateCloudBuild({ env, readLocal, get,
      install: () => new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [childEnv.npm_execpath, 'ci', '--include=dev', '--no-audit', '--no-fund'],
          { cwd: ROOT, env: childEnv, shell: false, windowsHide: true, stdio: ['ignore', 'inherit', 'inherit'] });
        child.once('error', () => reject(new Error('Native dependency installation could not start')));
        child.once('close', code => code === 0 ? resolve() : reject(new Error('Native dependency installation failed')));
      }),
      build: async context => {
        const previous = process.env;
        try { process.env = childEnv; await pagesBuild(['build', '--mode', 'production'], context); }
        finally { process.env = previous; }
      },
      verify: async () => verifyArtifact(ROOT, 'production', childEnv),
    });
    console.log(JSON.stringify(result)); return result;
  } finally { clearTimeout(timer); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch(error => { console.error(JSON.stringify(nativeBuildDiagnostic(error))); process.exitCode = 1; });
