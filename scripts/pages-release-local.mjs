// One explicitly approved commit: CI verification, credential-free packaging,
// local OAuth publication, bounded document checks, then IndexNow notification.
// Importing this file does not read credentials, spawn commands or make requests.
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, lstatSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertLocalReleaseContext, localReleaseDirectory, RELEASE_REPOSITORY } from './lib/pages-release.mjs';
import { cleanBuildEnvironment, readPublicBuildConfiguration, verifyArtifact } from './lib/pages-export.mjs';
import { githubReadClient, pagesPublicationReadiness, waitForPagesVerification } from './trend-publish/publish-approved.mjs';

export const PAGES_LOCAL_ORCHESTRATOR_VERSION = 1;
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SHA = /^[a-f0-9]{40}$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const API_ROOT = `/repos/${RELEASE_REPOSITORY}`;

export function parseLocalReleaseArgs(args) {
  assert.equal(args.length, 2, 'Use --approved-commit <full SHA>; no implicit or automatic publication');
  assert.equal(args[0], '--approved-commit'); assert.match(args[1] || '', SHA);
  return args[1];
}

export function resolveInstalledNpmCli(nodeExecutable = process.execPath, { paths = path,
  isFile = file => { try { return lstatSync(file).isFile(); } catch { return false; } } } = {}) {
  assert.ok(paths.isAbsolute(nodeExecutable), 'Node executable must have an absolute installation path');
  const bin = paths.dirname(nodeExecutable);
  // Windows installs npm alongside node.exe; the official Unix archive installs
  // node in prefix/bin and npm in prefix/lib. Never consult PATH/npm_execpath.
  const candidates = [paths.join(bin, 'node_modules/npm/bin/npm-cli.js'),
    paths.resolve(bin, '..', 'lib/node_modules/npm/bin/npm-cli.js')];
  const npm = candidates.find(isFile);
  assert.ok(npm, 'Installed Node npm CLI is required for local packaging');
  return npm;
}

export function localPackagingEnvironment(workspace, env) {
  const { input } = readPublicBuildConfiguration(workspace, 'production', env);
  const result = cleanBuildEnvironment(input, 'production', path.join(workspace, '.pages-build'));
  // Use the installed Node distribution's npm CLI, never an inherited executable
  // override. npm is needed by pages-build's isolated installation/prebuild steps.
  result.npm_execpath = resolveInstalledNpmCli();
  assert.equal(result.GITHUB_ACTIONS, undefined);
  return result;
}

// The production build contains normal visitor advertising but is never run as
// a browser/HTTP QA target. Its child receives only reviewed public settings and
// the existing build allowlist, not OAuth, GitHub or operator API credentials.
export function runLocalPackagingChild(workspace, command, env, spawnFn = spawn) {
  assert.ok(['build', 'verify'].includes(command));
  return new Promise((resolve, reject) => {
    const child = spawnFn(process.execPath, [path.join(workspace, 'scripts/pages-build.mjs'), command, '--mode', 'production'],
      { cwd: workspace, env, stdio: ['ignore', 'pipe', 'pipe'], shell: false, windowsHide: true });
    // Discard raw output: dependencies and arbitrary child errors must not put
    // secrets or response bodies in release receipts or the parent task log.
    let bytes = 0, stopped = false;
    const stop = () => { stopped = true; child.kill('SIGTERM'); };
    const drain = chunk => { bytes += chunk.length; if (bytes > 32 * 1024 * 1024) stop(); };
    child.stdout?.on('data', drain); child.stderr?.on('data', drain);
    const timeout = setTimeout(stop, 90 * 60 * 1000);
    process.once('SIGINT', stop); process.once('SIGTERM', stop);
    const cleanup = () => { clearTimeout(timeout); process.off('SIGINT', stop); process.off('SIGTERM', stop); };
    child.once('error', () => { cleanup(); reject(new Error('Local packaging child failed to start')); });
    child.once('close', code => {
      cleanup();
      if (!stopped && code === 0) resolve();
      else reject(new Error('Local packaging child did not complete successfully'));
    });
  });
}

/** Pure sequencing boundary; tests supply every operation, so no live requests. */
export async function orchestrateApprovedLocalRelease(commit, deps) {
  assert.match(commit || '', SHA);
  const env = deps.env ?? {};
  const assertCurrent = async () => {
    const local = await deps.readLocal();
    assertLocalReleaseContext(env, { commit, ...local });
    assert.equal(local.originMain, commit, 'Local origin/main does not identify the approved commit');
    assert.equal((await deps.githubGet(`${API_ROOT}/commits/main`)).sha, commit, 'Main changed; stop local publication');
  };
  await assertCurrent();
  const readiness = await pagesPublicationReadiness(deps.githubGet);
  assert.equal(readiness.mainSha, commit);
  const ci = await waitForPagesVerification(deps.githubGet, { sha: commit, workflowId: readiness.workflowId,
    attempts: deps.attempts ?? 60, sleep: deps.sleep });
  await assertCurrent();
  const state = { schemaVersion: 1, policyVersion: PAGES_LOCAL_ORCHESTRATOR_VERSION, commit,
    phase: 'claimed', ci: { runId: ci.runId, jobId: ci.jobId }, startedAt: new Date().toISOString(),
    finished: false, automaticRetries: 0 };
  await deps.claim(state);
  const phase = async name => { state.phase = name; await deps.save(state); deps.log?.(`[pages-local] ${name}`); };
  try {
    await phase('building'); await deps.build(); await assertCurrent();
    await phase('verifying-package'); await deps.verifyPackage(); await assertCurrent();
    await phase('capturing-indexnow'); await deps.capture(); await assertCurrent();
    const fresh = await pagesPublicationReadiness(deps.githubGet);
    assert.equal(fresh.mainSha, commit); assert.equal(fresh.workflowId, readiness.workflowId);
    await phase('publishing');
    const pins = await deps.publish();
    assert.equal(pins.commit, commit); assert.equal(pins.branch, 'main'); assert.equal(pins.purgeVerified, true);
    assert.match(pins.deploymentId || '', UUID);
    state.deploymentId = pins.deploymentId;
    await assertCurrent();
    await phase('verifying-http');
    const report = await deps.verifyHttp();
    assert.equal(report.finished, true); assert.equal(report.commit, commit); assert.equal(report.deploymentId, pins.deploymentId);
    assert.equal(report.canonicalVerifiedBefore, true); assert.equal(report.canonicalVerifiedAfter, true);
    assert.equal(report.purgeVerified, true); assert.equal(report.expectedRequests, 16); assert.equal(report.attemptedRequests, 16);
    assert.equal(report.results?.length, 16); assert.ok(report.results.every(item => item.contractPassed === true));
    assert.equal(report.executedDocumentJavaScript, false); assert.equal(report.subresourceRequests, 0);
    assert.equal(report.followedRedirects, 0); assert.equal(report.automaticRetries, 0);
    await assertCurrent();
    await phase('submitting-indexnow');
    const submitted = await deps.submit();
    assert.equal(submitted.state, 'completed'); assert.equal(submitted.commit, commit); assert.equal(submitted.deploymentId, pins.deploymentId);
    await assertCurrent();
    state.finished = true; state.finishedAt = new Date().toISOString(); await phase('completed');
    return { finished: true, commit, deploymentId: pins.deploymentId, ciRunId: ci.runId, ciJobId: ci.jobId };
  } catch {
    state.finished = false; state.failedDuring = state.phase; state.phase = 'stopped-review-required'; state.finishedAt = new Date().toISOString();
    // Never serialize thrown messages, stacks, command output or credentials.
    await deps.save(state);
    throw new Error('Approved local release stopped; inspect commit-scoped receipts. No automatic retry or rollback.');
  }
}

export function defaultLocalReleaseDependencies(commit, env = process.env) {
  assert.match(commit || '', SHA);
  const git = args => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', timeout: 20_000,
    windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
  let directory, stateFile, api;
  const getDirectory = () => directory ??= localReleaseDirectory(ROOT, commit);
  const writeState = state => {
    assert.ok(stateFile && lstatSync(stateFile).isFile() && !lstatSync(stateFile).isSymbolicLink());
    writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n', { mode: 0o600 });
  };
  const getApi = async () => {
    if (!api) api = (await import('./pages-release.mjs')).createLocalReleaseApi(env);
    return api;
  };
  return { env, githubGet: githubReadClient({ env }), log: console.log,
    readLocal: async () => ({ head: git(['rev-parse', 'HEAD']).trim(), originMain: git(['rev-parse', 'origin/main']).trim(),
      status: git(['status', '--porcelain=v1', '-z', '--untracked-files=all']), origin: git(['remote', 'get-url', 'origin']).trim() }),
    claim: async state => {
      const receiptDirectory = getDirectory();
      for (const name of ['release-state.json', 'production-pins.json', 'verification.json', 'indexnow.json'])
        assert.equal(existsSync(path.join(receiptDirectory, name)), false, 'Prior release evidence exists; reconcile instead of retrying');
      stateFile = path.join(receiptDirectory, 'orchestration.json');
      writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    },
    save: async state => writeState(state),
    build: async () => runLocalPackagingChild(ROOT, 'build', localPackagingEnvironment(ROOT, env)),
    verifyPackage: async () => {
      await runLocalPackagingChild(ROOT, 'verify', localPackagingEnvironment(ROOT, env));
      verifyArtifact(ROOT, 'production', env);
    },
    capture: async () => (await import('./pages-indexnow.mjs')).runLocalPagesIndexNow('capture',
      { commit, receiptDirectory: getDirectory(), env }),
    publish: async () => (await import('./pages-release.mjs')).runApprovedLocalPagesRelease(commit, env),
    verifyHttp: async () => (await import('./verify-pages-release-http.mjs')).runPagesReleaseHttp(
      { receiptDirectory: getDirectory(), api: await getApi(), env }),
    submit: async () => (await import('./pages-indexnow.mjs')).runLocalPagesIndexNow('submit',
      { commit, receiptDirectory: getDirectory(), api: await getApi(), env }),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const commit = parseLocalReleaseArgs(process.argv.slice(2));
    console.log(JSON.stringify(await orchestrateApprovedLocalRelease(commit, defaultLocalReleaseDependencies(commit))));
  } catch {
    console.error('Local Pages release stopped. Inspect .artifacts/pages-release-local/<approved SHA>; no automatic retry or rollback.');
    process.exitCode = 1;
  }
}
