import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { assertCloudBuildContext, publicGithubBuildClient, verifyCloudBuildApproval, orchestrateCloudBuild,
  CLOUD_BUILD_REPOSITORY, CLOUD_BUILD_BRANCH, installationEnvironment, trustedNpmCli } from '../pages-cloud-build.mjs';
import { createNativeReleaseAttestation } from '../lib/pages-export.mjs';
import { NATIVE_RELEASE_PATH, validateNativeRelease } from '../../cloudflare/pages-native-release.mjs';
import { createPagesHandler } from '../../cloudflare/pages-router.mjs';

const COMMIT = 'a'.repeat(40), OTHER = 'b'.repeat(40), OWNER = 'whatisyourdreambro';
const context = { commit: COMMIT, branch: CLOUD_BUILD_BRANCH, ci: { runId: 10, jobId: 11 }, approval: { runId: 20, actor: OWNER } };
const env = { CF_PAGES: '1', CF_PAGES_BRANCH: CLOUD_BUILD_BRANCH, CF_PAGES_COMMIT_SHA: COMMIT };
const local = { head: COMMIT, status: '', origin: `https://github.com/${CLOUD_BUILD_REPOSITORY}.git` };
const release = () => createNativeReleaseAttestation({ context, mode: 'production', buildId: 'synthetic-build',
  sourceHash: '1'.repeat(64), lockHash: '2'.repeat(64), publicConfigHash: '3'.repeat(64), sitemapSha256: '4'.repeat(64) });

function temporary(t) {
  const directory = realpathSync(mkdtempSync(path.join(os.tmpdir(), 'msy-native-bootstrap-')));
  t.after(() => { assert.equal(path.dirname(directory), realpathSync(os.tmpdir()));
    assert.ok(path.basename(directory).startsWith('msy-native-bootstrap-')); rmSync(directory, { recursive: true, force: true }); });
  return directory;
}

test('native bootstrap imports without node_modules and finds Linux Node-distribution npm', t => {
  const directory = temporary(t);
  for (const file of ['scripts/pages-cloud-build.mjs', 'scripts/pages-build.mjs', 'scripts/lib/pages-export.mjs', 'cloudflare/pages-native-release.mjs']) {
    const destination = path.join(directory, file); mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(new URL('../../' + file, import.meta.url), destination);
  }
  assert.equal(existsSync(path.join(directory, 'node_modules')), false);
  const entry = pathToFileURL(path.join(directory, 'scripts/pages-cloud-build.mjs')).href;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `await import(${JSON.stringify(entry)})`],
    { cwd: directory, env: {}, shell: false, windowsHide: true, encoding: 'utf8', timeout: 15000 });
  assert.equal(result.status, 0, 'Bootstrap must not depend on installed packages');
  assert.equal(result.stdout, ''); assert.equal(result.stderr, '');
  const npm = path.join(directory, 'node/lib/node_modules/npm/bin/npm-cli.js');
  mkdirSync(path.dirname(npm), { recursive: true }); writeFileSync(npm, '// synthetic npm location');
  assert.equal(trustedNpmCli(path.join(directory, 'node/bin/node')), realpathSync(npm));
});

test('native npm environment retains public ads while excluding inherited secrets and bootstrap hooks', t => {
  const directory = temporary(t);
  writeFileSync(path.join(directory, '.env.production'), ['HOME_TOP', 'CALC_RESULT', 'GUIDE_MID', 'COMPANY_TOP']
    .map(slot => `NEXT_PUBLIC_ADSENSE_SLOT_${slot}=1234567890`).join('\n'));
  const output = installationEnvironment(directory, { PATH: 'fixture-path', CF_API_TOKEN: 'synthetic', GITHUB_TOKEN: 'synthetic',
    FEEDBACK_RATE_LIMIT_SECRET: 'synthetic', NODE_OPTIONS: '--require unknown', npm_config_registry: 'https://invalid.test' });
  for (const key of ['CF_API_TOKEN', 'GITHUB_TOKEN', 'FEEDBACK_RATE_LIMIT_SECRET', 'NODE_OPTIONS']) assert.equal(output[key], undefined);
  assert.equal(output.NEXT_PUBLIC_ADS_DISABLED, '0'); assert.equal(output.MSY_QA_MODE, '0');
  assert.equal(output.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP, '1234567890');
  assert.equal(output.npm_config_registry, 'https://registry.npmjs.org/');
  assert.equal(output.HOME, path.join(directory, '.artifacts/pages-cloud-build/install-home'));
  assert.equal(readFileSync(output.npm_config_userconfig, 'utf8'), ''); assert.equal(existsSync(path.join(directory, '.pages-build')), false);
});

function gateFixture(change = {}) {
  const calls = [];
  const ci = { id: 10, workflow_id: 1, head_sha: COMMIT, head_branch: 'main', event: 'push', status: 'completed',
    conclusion: 'success', head_repository: { full_name: CLOUD_BUILD_REPOSITORY }, ...change.ci };
  const approval = { id: 20, workflow_id: 2, head_sha: COMMIT, head_branch: 'main', event: 'workflow_dispatch',
    status: 'in_progress', conclusion: null, run_attempt: 1, head_repository: { full_name: CLOUD_BUILD_REPOSITORY },
    actor: { login: OWNER }, triggering_actor: { login: OWNER }, ...change.approval };
  const get = async resource => {
    calls.push(resource);
    if (resource.endsWith('/commits/main')) return { sha: change.main ?? COMMIT };
    if (resource.endsWith(`/git/ref/heads/${CLOUD_BUILD_BRANCH}`)) return { object: { sha: change.branch ?? COMMIT } };
    if (resource.endsWith('/actions/workflows/ci.yml')) return { id: 1, path: '.github/workflows/ci.yml', state: 'active' };
    if (resource.endsWith('/actions/workflows/pages-publish.yml')) return { id: 2, path: '.github/workflows/pages-publish.yml', state: 'active' };
    if (resource.includes('/actions/workflows/1/runs?')) return { total_count: 1, workflow_runs: [ci] };
    if (resource.includes('/actions/runs/10/jobs?')) return { total_count: 1, jobs: [{ id: 11, run_id: 10, head_sha: COMMIT,
      name: 'verify', status: 'completed', conclusion: 'success', ...change.job }] };
    if (resource.includes('/actions/workflows/2/runs?')) return { total_count: change.duplicate ? 2 : 1,
      workflow_runs: change.duplicate ? [approval, { ...approval, id: 21 }] : [approval] };
    throw new Error('Unexpected synthetic API request');
  };
  return { get, calls };
}

test('cloud identity requires genuine provider branch, full exact source and no QA/Actions context', () => {
  assert.equal(assertCloudBuildContext(env, local), COMMIT);
  for (const change of [{ CF_PAGES: undefined }, { CF_PAGES_BRANCH: 'main' }, { CF_PAGES_COMMIT_SHA: OTHER },
    { GITHUB_ACTIONS: 'true' }, { PAGES_ENVIRONMENT: 'preview' }, { MSY_QA_MODE: '1' }, { NEXT_PUBLIC_ADS_DISABLED: '1' }])
    assert.throws(() => assertCloudBuildContext({ ...env, ...change }, local));
  for (const change of [{ head: OTHER }, { status: ' M file' }, { origin: 'https://github.com/other/repo' }])
    assert.throws(() => assertCloudBuildContext(env, { ...local, ...change }));
});

test('public gate links one owner dispatch to exact main CI verify and production ref', async () => {
  const f = gateFixture(); assert.deepEqual(await verifyCloudBuildApproval(COMMIT, f.get), context);
  assert.equal(f.calls.length, 7);
  for (const change of [{ main: OTHER }, { branch: OTHER }, { ci: { conclusion: 'failure' } }, { ci: { status: 'in_progress' } },
    { ci: { head_sha: OTHER } }, { ci: { head_repository: { full_name: 'other/repo' } } },
    { job: { conclusion: 'skipped' } }, { job: { run_id: 99 } }, { job: { head_sha: OTHER } },
    { approval: { event: 'push' } }, { approval: { status: 'completed' } }, { approval: { head_sha: OTHER } },
    { approval: { actor: { login: 'other' } } }, { approval: { triggering_actor: undefined } },
    { approval: { triggering_actor: { login: 'other' } } }, { approval: { run_attempt: 2 } }, { duplicate: true }])
    await assert.rejects(verifyCloudBuildApproval(COMMIT, gateFixture(change).get));
});

test('GitHub gate is bounded fixed-origin GET with no Authorization, redirects or publisher calls', async () => {
  let calls = 0;
  const get = publicGithubBuildClient(async (url, init) => {
    calls++; assert.equal(new URL(url).origin, 'https://api.github.com'); assert.equal(init.method, 'GET');
    assert.equal(init.redirect, 'manual'); assert.equal(new Headers(init.headers).get('authorization'), null);
    assert.ok(init.signal instanceof AbortSignal); return Response.json({ ok: true });
  });
  const resource = `/repos/${CLOUD_BUILD_REPOSITORY}/commits/main`;
  for (let i = 0; i < 24; i++) assert.deepEqual(await get(resource), { ok: true });
  await assert.rejects(get(resource)); assert.equal(calls, 24);
  await assert.rejects(get('/repos/other/repo/commits/main')); assert.equal(calls, 24);
  for (const response of [new Response(null, { status: 302, headers: { location: 'https://example.invalid/' } }),
    new Response('not JSON'), new Response('x'.repeat(2 * 1024 * 1024 + 1))])
    await assert.rejects(publicGithubBuildClient(async () => response)(resource));
});

test('native orchestration rechecks source and same active approval after build; failure never reports completion', async () => {
  for (const failure of [null, 'install', 'build', 'verify', 'source', 'approval']) {
    const calls = []; let built = false;
    const initial = gateFixture(), after = gateFixture(failure === 'approval' ? { approval: { id: 21 } } : {});
    const deps = { env, readLocal: async () => built && failure === 'source' ? { ...local, head: OTHER } : local,
      get: async resource => (built ? after : initial).get(resource),
      install: async () => { calls.push('install'); if (failure === 'install') throw Error('synthetic'); },
      build: async actual => { calls.push('build'); assert.deepEqual(actual, context); if (failure === 'build') throw Error('synthetic'); built = true; },
      verify: async () => { calls.push('verify'); if (failure === 'verify') throw Error('synthetic');
        return { marker: { buildId: 'synthetic-build' }, manifest: { nativeRelease: release() } }; } };
    if (failure) await assert.rejects(orchestrateCloudBuild(deps));
    else assert.deepEqual(await orchestrateCloudBuild(deps), { completed: true, commit: COMMIT, buildId: 'synthetic-build', approvalRunId: 20 });
    assert.ok(calls.every(value => ['install', 'build', 'verify'].includes(value)));
  }
});

test('public attestation excludes secrets, API assertions and circular artifact hashes', () => {
  const value = release(); assert.equal(validateNativeRelease(value), value);
  for (const change of [{ token: 'synthetic' }, { artifactHash: '1'.repeat(64) }, { configurationHash: '1'.repeat(64) },
    { adsDisabled: true }, { mode: 'qa' }, { commit: 'short' }, { branch: 'main' }, { approval: { runId: 1, actor: 'other' } }])
    assert.throws(() => validateNativeRelease({ ...value, ...change }));
  assert.throws(() => createNativeReleaseAttestation({ context, mode: 'qa' }));
});

test('attestation endpoint is non-rendering private JSON with no assets/network and strict GET/HEAD path', async () => {
  const manifest = { version: 1, mode: 'production', buildId: 'synthetic-build', routes: { '/': { asset: '/home.body' } },
    headers: [{ regex: '^/.*$', headers: [{ key: 'Cache-Control', value: 'public, max-age=3600' }] }], nativeRelease: release() };
  const handler = createPagesHandler(manifest);
  const request = (path = NATIVE_RELEASE_PATH, method = 'GET') => handler.fetch(new Request('https://www.moneysalary.com' + path, { method }),
    { ASSETS: { fetch() { throw Error('No ASSETS access permitted for this endpoint'); } } });
  const response = await request(); assert.equal(response.status, 200); assert.deepEqual(await response.json(), release());
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(response.headers.get('CDN-Cache-Control'), 'no-store'); assert.equal(response.headers.get('Cloudflare-CDN-Cache-Control'), 'no-store');
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow'); assert.equal(response.headers.get('Age'), null);
  assert.equal(response.headers.get('X-MoneySalary-Build'), 'synthetic-build');
  assert.equal(await (await request(NATIVE_RELEASE_PATH, 'HEAD')).text(), '');
  assert.equal((await request(NATIVE_RELEASE_PATH + '?extra=1')).status, 404);
  assert.equal((await request(NATIVE_RELEASE_PATH, 'POST')).status, 405);
  assert.throws(() => createPagesHandler({ ...manifest, mode: 'qa' }));
  assert.throws(() => createPagesHandler({ ...manifest, buildId: 'different' }));
  assert.throws(() => createPagesHandler({ ...manifest, nativeRelease: { ...release(), secret: 'synthetic' } }));
});
