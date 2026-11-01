import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { assertCloudBuildContext, publicGithubBuildClient, verifyCloudBuildApproval, orchestrateCloudBuild,
  CLOUD_BUILD_REPOSITORY, CLOUD_BUILD_BRANCH, installationEnvironment, trustedNpmCli, nativeBuildDiagnostic,
  matchesCloudRepositoryOrigin } from '../pages-cloud-build.mjs';
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
  writeFileSync(path.join(directory, '.env.production'), ['HOME_TOP', 'CALC_RESULT', 'GUIDE_MID', 'SIDEBAR', 'IN_ARTICLE', 'MULTIPLEX', 'DISPLAY_2', 'COMPANY_TOP']
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

test('source diagnostics distinguish fixed checkpoints without leaking assertion values', () => {
  const secret = 'synthetic-private-credential';
  const cases = [
    ['provider-environment', { ...env, CF_PAGES: secret }, local],
    ['provider-branch', { ...env, CF_PAGES_BRANCH: secret }, local],
    ['provider-commit', { ...env, CF_PAGES_COMMIT_SHA: secret }, local],
    ['checkout-head', env, { ...local, head: secret }],
    ['checkout-status', env, { ...local, status: `?? ${secret}` }],
    ['checkout-origin', env, { ...local, origin: `https://${secret}@github.com/other/repo` }],
    ['publication-environment', { ...env, PAGES_ENVIRONMENT: secret }, local],
    ['qa-environment', { ...env, MSY_QA_MODE: '1' }, local],
  ];
  for (const [phase, input, checkout] of cases) assert.throws(() => assertCloudBuildContext(input, checkout), error => {
    const diagnostic = nativeBuildDiagnostic(error);
    assert.deepEqual(diagnostic, { schemaVersion: 1, event: 'native-build-failed', phase, outputApproved: false, detailsWithheld: true });
    assert.equal(error.cause, undefined); assert.equal(error.actual, undefined); assert.equal(error.expected, undefined);
    assert.equal(JSON.stringify(diagnostic).includes(secret), false); assert.equal(String(error).includes(secret), false); return true;
  });
  for (const value of [new Error(secret), { phase: secret, message: secret }, { phase: 'approval-before' }, null, undefined])
    assert.equal(nativeBuildDiagnostic(value).phase, 'unclassified');
});

test('provider credentialized Git origin matches only the exact HTTPS repository without ports or suffixes', () => {
  const repository = CLOUD_BUILD_REPOSITORY;
  for (const origin of [`https://github.com/${repository}`, `https://github.com/${repository}.git`,
    `https://provider:synthetic-only@github.com/${repository}`, `https://provider:synthetic-only@github.com/${repository}.git`,
    `https://provider%40name:synthetic%3Aonly@github.com/${repository}.git`, `git@github.com:${repository}.git`]) {
    assert.equal(matchesCloudRepositoryOrigin(origin), true);
    assert.equal(assertCloudBuildContext(env, { ...local, origin }), COMMIT);
  }
  for (const origin of [`http://provider:synthetic@github.com/${repository}`, `https://provider:synthetic@github.com:443/${repository}`,
    `https://github.com:8443/${repository}`, `https://github.com.evil.invalid/${repository}`,
    `https://github.com@evil.invalid/${repository}`, `https://github.com.evil.invalid@evil.invalid/${repository}`,
    `https://provider:synthetic@github.com/other/repo`, `https://provider:synthetic@github.com/${repository}/`,
    `https://github.com/${repository}.git/extra`, `https://github.com/${repository}?`, `https://github.com/${repository}#`,
    `https://github.com/${repository}?token=synthetic`, `https://github.com/${repository}#synthetic`,
    `https://github.com/${repository}suffix`, `https://github.com/whatisyourdreambro%2Fmy-salary-calculator`,
    `https://github.com/${repository}\n`, `ssh://git@github.com/${repository}.git`, 'synthetic-private-value', null]) {
    assert.equal(matchesCloudRepositoryOrigin(origin), false);
    assert.throws(() => assertCloudBuildContext(env, { ...local, origin }), error => {
      assert.equal(nativeBuildDiagnostic(error).phase, 'checkout-origin');
      assert.equal(String(error).includes('synthetic'), false); return true;
    });
  }
});

test('installation diagnostics identify missing config, settings, owned paths, npmrc and npm without raw errors', t => {
  const writeConfig = directory => writeFileSync(path.join(directory, '.env.production'), ['HOME_TOP', 'CALC_RESULT', 'GUIDE_MID', 'SIDEBAR', 'IN_ARTICLE', 'MULTIPLEX', 'DISPLAY_2', 'COMPANY_TOP']
    .map(slot => `NEXT_PUBLIC_ADSENSE_SLOT_${slot}=1234567890`).join('\n'));
  const check = (phase, run) => assert.throws(run, error => { assert.equal(nativeBuildDiagnostic(error).phase, phase);
    assert.equal(error.cause, undefined); assert.equal(error.path, undefined); return true; });
  const missing = temporary(t); check('public-configuration', () => installationEnvironment(missing, {}));
  writeFileSync(path.join(missing, '.env.production'), ''); check('installation-environment', () => installationEnvironment(missing, {}));
  const blockedDirectory = temporary(t); writeConfig(blockedDirectory); writeFileSync(path.join(blockedDirectory, '.artifacts'), 'synthetic');
  check('installation-directory', () => installationEnvironment(blockedDirectory, {}));
  const blockedNpmrc = temporary(t); writeConfig(blockedNpmrc);
  mkdirSync(path.join(blockedNpmrc, '.artifacts/pages-cloud-build/install-home/user.npmrc'), { recursive: true });
  check('installation-npmrc', () => installationEnvironment(blockedNpmrc, {}));
  check('npm-location', () => trustedNpmCli(path.join(missing, 'missing-node/bin/node')));
});

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
  // The after-build form reuses verified workflow ids and skips both workflow definition reads.
  const reuse = gateFixture();
  assert.deepEqual(await verifyCloudBuildApproval(COMMIT, reuse.get, { ciWorkflowId: 1, publisherWorkflowId: 2 }), context);
  assert.equal(reuse.calls.length, 5); assert.equal(reuse.calls.some(resource => resource.endsWith('.yml')), false);
  for (const known of [null, {}, { ciWorkflowId: 1 }, { ciWorkflowId: 0, publisherWorkflowId: 2 },
    { ciWorkflowId: 1, publisherWorkflowId: '2' }, { ciWorkflowId: 1.5, publisherWorkflowId: 2 }]) {
    const fixture = gateFixture();
    await assert.rejects(verifyCloudBuildApproval(COMMIT, fixture.get, known)); assert.equal(fixture.calls.length, 0);
  }
  for (const change of [{ main: OTHER }, { branch: OTHER }, { ci: { conclusion: 'failure' } }, { ci: { status: 'in_progress' } },
    { ci: { head_sha: OTHER } }, { ci: { head_repository: { full_name: 'other/repo' } } },
    { job: { conclusion: 'skipped' } }, { job: { run_id: 99 } }, { job: { head_sha: OTHER } },
    { approval: { event: 'push' } }, { approval: { status: 'completed' } }, { approval: { head_sha: OTHER } },
    { approval: { actor: { login: 'other' } } }, { approval: { triggering_actor: undefined } },
    { approval: { triggering_actor: { login: 'other' } } }, { approval: { run_attempt: 2 } }, { duplicate: true }])
    await assert.rejects(verifyCloudBuildApproval(COMMIT, gateFixture(change).get));
});

test('GitHub gate is bounded fixed-origin GET with no Authorization, redirects or publisher calls', async t => {
  const originalTimeout = AbortSignal.timeout;
  t.mock.method(AbortSignal, 'timeout', milliseconds => {
    assert.equal(milliseconds, 15000); return originalTimeout.call(AbortSignal, milliseconds);
  });
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
  assert.equal(await publicGithubBuildClient(async () => new Response('""' + ' '.repeat(2 * 1024 * 1024 - 2)))(resource), '');
});

test('native orchestration rechecks source and same active approval after build; failure never reports completion', async () => {
  const expected = { install: 'dependency-install', build: 'application-build', verify: 'artifact-verification',
    source: 'checkout-head', approval: 'approval-unchanged', workflow: 'approval-after' };
  for (const failure of [null, 'install', 'build', 'verify', 'source', 'approval', 'workflow']) {
    const calls = []; let built = false;
    // 'workflow': after the build, the CI run lists another workflow id than the one verified before it.
    const initial = gateFixture(), after = gateFixture(failure === 'approval' ? { approval: { id: 21 } }
      : failure === 'workflow' ? { ci: { workflow_id: 3 } } : {});
    const deps = { env, readLocal: async () => built && failure === 'source' ? { ...local, head: OTHER } : local,
      get: async resource => (built ? after : initial).get(resource),
      install: async () => { calls.push('install'); if (failure === 'install') throw Error('synthetic'); },
      build: async actual => { calls.push('build'); assert.deepEqual(actual, context); if (failure === 'build') throw Error('synthetic'); built = true; },
      verify: async () => { calls.push('verify'); if (failure === 'verify') throw Error('synthetic');
        return { marker: { buildId: 'synthetic-build' }, manifest: { nativeRelease: release() } }; } };
    if (failure) await assert.rejects(orchestrateCloudBuild(deps), error => {
      assert.equal(nativeBuildDiagnostic(error).phase, expected[failure]); return true;
    });
    else {
      assert.deepEqual(await orchestrateCloudBuild(deps), { completed: true, commit: COMMIT, buildId: 'synthetic-build', approvalRunId: 20 });
      // The after-build check reuses the workflow ids verified before the build: 7 + 5 requests.
      assert.equal(initial.calls.length, 7); assert.equal(after.calls.length, 5);
      assert.equal(after.calls.some(resource => resource.endsWith('.yml')), false);
    }
    assert.ok(calls.every(value => ['install', 'build', 'verify'].includes(value)));
  }
});

test('GitHub gate transport diagnostics expose only before/after phase and no raw fetch errors', async () => {
  for (const after of [false, true]) {
    let built = false; const gate = gateFixture();
    const deps = { env, readLocal: async () => local, install: async () => {}, build: async () => { built = true; },
      verify: async () => ({ marker: { buildId: 'synthetic-build' }, manifest: { nativeRelease: release() } }),
      get: async resource => { if (built === after) throw new Error('private diagnostic body'); return gate.get(resource); } };
    await assert.rejects(orchestrateCloudBuild(deps), error => {
      assert.equal(nativeBuildDiagnostic(error).phase, after ? 'approval-after' : 'approval-before');
      assert.equal(JSON.stringify(nativeBuildDiagnostic(error)).includes('private'), false); return true;
    });
  }
});

const approvalCategories = ['main-ref', 'production-ref', 'ci-workflow', 'ci-runs',
  'ci-jobs', 'publisher-workflow', 'active-approvals'];
// The after-build check reuses the workflow ids verified before the build (7 + 5 = 12 requests).
const afterBuildCategories = ['main-ref', 'production-ref', 'ci-runs', 'ci-jobs', 'active-approvals'];
const privateDiagnostic = 'synthetic-private-body-header-url-credential';
const syntheticNow = 1_793_400_000_000;

// `sleeps` lists the expected rate-limit waits; each one repeats the failing request once.
async function checkApprovalDiagnostic({ after, category = 'main-ref', response, expected, sleeps: expectedSleeps = [] }) {
  const categories = after ? afterBuildCategories : approvalCategories;
  assert.ok(categories.includes(category), 'The failing request must belong to the checked phase');
  const gate = gateFixture(), operations = [], sleeps = []; let requests = 0, failing;
  const failAt = (after ? approvalCategories.length : 0) + categories.indexOf(category) + 1;
  const get = publicGithubBuildClient(async (url, init) => {
    requests++;
    assert.equal(new URL(url).origin, 'https://api.github.com');
    assert.equal(init.method, 'GET'); assert.equal(init.redirect, 'manual');
    assert.equal(new Headers(init.headers).get('authorization'), null);
    const resource = new URL(url).pathname + new URL(url).search;
    // A retry of the failing request receives the same failure again.
    if (requests === failAt) failing = resource;
    if (resource === failing) return response(await gate.get(resource));
    return Response.json(await gate.get(resource));
  }, { sleep: async milliseconds => { sleeps.push(milliseconds); }, now: () => syntheticNow });
  let completed = false;
  await assert.rejects(orchestrateCloudBuild({ env, readLocal: async () => local, get,
    install: async () => { operations.push('install'); },
    build: async () => { operations.push('build'); },
    verify: async () => { operations.push('verify');
      return { marker: { buildId: 'synthetic-build' }, manifest: { nativeRelease: release() } }; },
  }).then(() => { completed = true; }), error => {
    const diagnostic = nativeBuildDiagnostic(error);
    assert.deepEqual(diagnostic, { schemaVersion: 1, event: 'native-build-failed',
      phase: after ? 'approval-after' : 'approval-before', outputApproved: false, detailsWithheld: true,
      approval: { requestCategory: category, ...expected } });
    assert.equal(JSON.stringify(diagnostic).includes(privateDiagnostic), false);
    assert.equal(String(error).includes(privateDiagnostic), false);
    for (const field of ['cause', 'actual', 'expected', 'response', 'headers', 'url']) assert.equal(error[field], undefined);
    // A caller cannot mutate the internally registered diagnostic through a previous result.
    diagnostic.approval.requestCategory = privateDiagnostic;
    assert.equal(nativeBuildDiagnostic(error).approval.requestCategory, category);
    if (expected.responseMetadata) {
      diagnostic.approval.responseMetadata.rateLimitRemaining = privateDiagnostic;
      diagnostic.approval.responseMetadata.extra = privateDiagnostic;
      assert.deepEqual(nativeBuildDiagnostic(error).approval.responseMetadata, expected.responseMetadata);
    }
    return true;
  });
  assert.equal(completed, false);
  assert.equal(requests, failAt + expectedSleeps.length, 'Only a documented rate-limit wait may repeat a request');
  assert.deepEqual(sleeps, expectedSleeps);
  assert.deepEqual(operations, after ? ['install', 'build', 'verify'] : []);
}

test('approval diagnostics retain every request category and HTTP status; failures without rate-limit headers never retry', async () => {
  for (const after of [false, true]) {
    for (const category of after ? afterBuildCategories : approvalCategories) {
      await checkApprovalDiagnostic({ after, category,
        response: () => new Response(privateDiagnostic, { status: 403, headers: { 'x-private': privateDiagnostic } }),
        expected: { reason: 'http-status', httpStatus: 403 } });
    }
    for (const status of [302, 429, 500]) await checkApprovalDiagnostic({ after, category: 'active-approvals',
      response: () => new Response(privateDiagnostic, { status, headers: { location: 'https://invalid.test/' + privateDiagnostic } }),
      expected: { reason: 'http-status', httpStatus: status } });
  }
});

const numericResponseHeaders = {
  'x-ratelimit-limit': 'rateLimitLimit',
  'x-ratelimit-remaining': 'rateLimitRemaining',
  'x-ratelimit-reset': 'rateLimitResetEpochSeconds',
  'retry-after': 'retryAfterSeconds',
};

test('rate-limited 403 and 429 retry twice within the caps, then retain only numeric metadata and stop before or after building', async () => {
  const headers = { 'x-ratelimit-limit': '60', 'x-ratelimit-remaining': '0',
    'x-ratelimit-reset': '1793400000', 'retry-after': '120' };
  const responseMetadata = { rateLimitLimit: 60, rateLimitRemaining: 0,
    rateLimitResetEpochSeconds: 1793400000, retryAfterSeconds: 120 };
  for (const after of [false, true]) for (const status of [403, 429]) {
    const headerReads = []; let bodyReads = 0;
    // retry-after takes precedence over the reset time; 2 x 120 s reaches the 240 s cap exactly.
    await checkApprovalDiagnostic({ after, response: () => ({ status,
      headers: { get(name) { headerReads.push(name); return headers[name] ?? privateDiagnostic; } },
      get body() { bodyReads++; throw new Error(privateDiagnostic); },
    }), expected: { reason: 'http-status', httpStatus: status, responseMetadata }, sleeps: [120_000, 120_000] });
    assert.deepEqual(headerReads.sort(), Object.keys(numericResponseHeaders).sort().flatMap(name => [name, name, name]),
      'Only the four allowed headers may be read, once per attempt; no raw header enumeration or unrelated fields');
    assert.equal(bodyReads, 0, 'An HTTP failure body must never be read');
  }
});

test('response metadata rejects noncanonical and unsafe integers without retaining the supplied strings', async () => {
  // Plain synthetic headers preserve whitespace that the platform Headers class would normalize.
  const invalid = [null, undefined, '', '-1', '+1', '-0', '1.0', '1e3', ' 1', '1 ', '1\n', '01',
    '0x10', '1, 2', '9007199254740992', '10000000000000000', 'Fri, 30 Oct 2026 16:00:00 GMT',
    privateDiagnostic, 1, NaN, true, {}, ['1']];
  for (const [header, field] of Object.entries(numericResponseHeaders)) {
    const keeper = header === 'retry-after' ? 'x-ratelimit-limit' : 'retry-after';
    for (const value of invalid) {
      const expected = { reason: 'http-status', httpStatus: 403,
        responseMetadata: { [numericResponseHeaders[keeper]]: 0 } };
      // A retained canonical retry-after of 0 is a zero-length rate-limit wait: two immediate retries.
      await checkApprovalDiagnostic({ after: false, response: () => ({ status: 403,
        headers: { get(name) { return name === header ? value : name === keeper ? '0' : null; } },
      }), expected, sleeps: keeper === 'retry-after' ? [0, 0] : [] });
      assert.equal(Object.hasOwn(expected.responseMetadata, field), false);
    }
  }
  await checkApprovalDiagnostic({ after: false, response: () => ({ status: 429,
    headers: { get() { return 'not-a-number'; } },
  }), expected: { reason: 'http-status', httpStatus: 429 } });
});

test('numeric response metadata accepts zero and the largest safe canonical integer', async () => {
  // retry-after decides the wait; one beyond 120 s fails at once instead of falling back to the reset time.
  for (const [value, sleeps] of [['0', [0, 0]], ['1', [1000, 1000]], ['9007199254740991', []]]) {
    const responseMetadata = Object.fromEntries(Object.values(numericResponseHeaders).map(field => [field, Number(value)]));
    await checkApprovalDiagnostic({ after: false, response: () => ({ status: 403,
      headers: { get() { return value; } },
    }), expected: { reason: 'http-status', httpStatus: 403, responseMetadata }, sleeps });
  }
});

test('missing or throwing response header access cannot obscure the HTTP failure or leak raw errors', async () => {
  const cases = [
    () => ({ status: 403 }),
    () => ({ status: 403, headers: null }),
    () => ({ status: 403, headers: {} }),
    () => ({ status: 403, get headers() { throw new Error(privateDiagnostic); } }),
    () => ({ status: 403, headers: { get get() { throw new Error(privateDiagnostic); } } }),
    () => ({ status: 403, headers: { get() { throw new Error(privateDiagnostic); } } }),
  ];
  for (const after of [false, true]) for (const response of cases)
    await checkApprovalDiagnostic({ after, response, expected: { reason: 'http-status', httpStatus: 403 } });
  for (const brokenHeader of Object.keys(numericResponseHeaders)) {
    const responseMetadata = Object.fromEntries(Object.entries(numericResponseHeaders)
      .filter(([header]) => header !== brokenHeader).map(([, field]) => [field, 1]));
    // Without retry-after, a remaining quota of 1 is not exhausted and never retries.
    await checkApprovalDiagnostic({ after: false, response: () => ({ status: 403,
      headers: { get(name) { if (name === brokenHeader) throw new Error(privateDiagnostic); return '1'; } },
    }), expected: { reason: 'http-status', httpStatus: 403, responseMetadata },
    sleeps: brokenHeader === 'retry-after' ? [] : [1000, 1000] });
  }
});

test('successful GitHub responses do not inspect diagnostic response headers', async () => {
  let headersRead = 0, requests = 0;
  const gate = gateFixture(), operations = [];
  const get = publicGithubBuildClient(async url => {
    requests++;
    const data = await gate.get(new URL(url).pathname + new URL(url).search);
    const response = Response.json(data);
    return { status: 200, body: response.body,
      get headers() { headersRead++; throw new Error(privateDiagnostic); } };
  });
  const result = await orchestrateCloudBuild({ env, readLocal: async () => local, get,
    install: async () => { operations.push('install'); }, build: async () => { operations.push('build'); },
    verify: async () => { operations.push('verify');
      return { marker: { buildId: 'synthetic-build' }, manifest: { nativeRelease: release() } }; },
  });
  assert.equal(result.completed, true); assert.equal(requests, 12); assert.equal(headersRead, 0);
  assert.deepEqual(operations, ['install', 'build', 'verify']);
});

test('approval diagnostics distinguish transport and bounded response failures without exposing raw details', async () => {
  const cases = [
    { reason: 'transport', response: () => { throw Object.assign(new Error(privateDiagnostic), {
      requestCategory: privateDiagnostic, reason: privateDiagnostic, httpStatus: 401,
      responseMetadata: { rateLimitRemaining: 0, retryAfterSeconds: 1 },
      approval: { requestCategory: 'ci-jobs', reason: 'http-status', httpStatus: 401,
        responseMetadata: { rateLimitRemaining: 0, retryAfterSeconds: 1 } },
    }); } },
    { reason: 'missing-body', httpStatus: 200, response: () => new Response(null) },
    { reason: 'body-read', httpStatus: 200, response: () => new Response(new ReadableStream({
      start(controller) { controller.error(new Error(privateDiagnostic)); },
    })) },
    { reason: 'body-limit', httpStatus: 200, response: () => new Response(privateDiagnostic + 'x'.repeat(2 * 1024 * 1024)) },
    { reason: 'invalid-json', httpStatus: 200, response: () => new Response(privateDiagnostic) },
  ];
  for (const after of [false, true]) for (const { response, ...expected } of cases)
    await checkApprovalDiagnostic({ after, category: 'active-approvals', response, expected });
});

test('approval contract mismatches retain their request category without assertion values', async () => {
  const change = {
    'main-ref': data => { data.sha = privateDiagnostic; },
    'production-ref': data => { data.object.sha = privateDiagnostic; },
    'ci-workflow': data => { data.state = privateDiagnostic; },
    'ci-runs': data => { data.workflow_runs[0].conclusion = privateDiagnostic; },
    'ci-jobs': data => { data.jobs[0].head_sha = privateDiagnostic; },
    'publisher-workflow': data => { data.path = privateDiagnostic; },
    'active-approvals': data => { data.workflow_runs[0].actor.login = privateDiagnostic; },
  };
  for (const after of [false, true]) for (const category of after ? afterBuildCategories : approvalCategories)
    await checkApprovalDiagnostic({ after, category,
      response: data => { change[category](data); return Response.json(data); },
      expected: { reason: 'contract-mismatch' } });
});

const gateResource = `/repos/${CLOUD_BUILD_REPOSITORY}/commits/main`;
// Answers the scripted statuses in order (200 returns { ok: true }) and records every wait.
function scriptedClient(script, options = {}) {
  const sleeps = []; let calls = 0;
  const get = publicGithubBuildClient(async () => {
    const step = script[calls++];
    return step.status === 200 ? Response.json({ ok: true })
      : new Response(privateDiagnostic, { status: step.status, headers: step.headers });
  }, { sleep: async milliseconds => { sleeps.push(milliseconds); }, now: () => syntheticNow, ...options });
  return { get, sleeps, calls: () => calls };
}
const limitedBy = seconds => ({ status: 429, headers: { 'retry-after': String(seconds) } });
const rejectsWithStatus = (promise, requestCategory, httpStatus, responseMetadata) => assert.rejects(promise, error => {
  assert.deepEqual(nativeBuildDiagnostic(error).approval, { requestCategory, reason: 'http-status', httpStatus,
    ...(responseMetadata ? { responseMetadata } : {}) });
  return true;
});

test('a 429 with retry-after 30 waits 30 s once and then succeeds', async () => {
  const client = scriptedClient([limitedBy(30), { status: 200 }]);
  assert.deepEqual(await client.get(gateResource, 'main-ref'), { ok: true });
  assert.equal(client.calls(), 2); assert.deepEqual(client.sleeps, [30_000]);
});

test('an exhausted quota waits until its reset plus 1 s only when that is at most 120 s away', async () => {
  const quota = seconds => ({ 'x-ratelimit-limit': '60', 'x-ratelimit-remaining': '0',
    'x-ratelimit-reset': String(syntheticNow / 1000 + seconds) });
  // A reset already in the past still waits 1 s.
  for (const [seconds, wait] of [[30, 31_000], [-5, 1000], [119, 120_000]]) {
    const client = scriptedClient([{ status: 403, headers: quota(seconds) }, { status: 200 }]);
    assert.deepEqual(await client.get(gateResource, 'main-ref'), { ok: true });
    assert.equal(client.calls(), 2); assert.deepEqual(client.sleeps, [wait]);
  }
  for (const seconds of [600, 120]) {
    const client = scriptedClient([{ status: 403, headers: quota(seconds) }]);
    await rejectsWithStatus(client.get(gateResource, 'main-ref'), 'main-ref', 403,
      { rateLimitLimit: 60, rateLimitRemaining: 0, rateLimitResetEpochSeconds: syntheticNow / 1000 + seconds });
    assert.equal(client.calls(), 1); assert.deepEqual(client.sleeps, []);
  }
  // Remaining quota, a missing reset or no rate-limit header at all is not an exhausted quota.
  for (const headers of [{ ...quota(30), 'x-ratelimit-remaining': '1' }, { 'x-ratelimit-remaining': '0' }, {}]) {
    const client = scriptedClient([{ status: 403, headers }]);
    await assert.rejects(client.get(gateResource, 'main-ref'));
    assert.equal(client.calls(), 1); assert.deepEqual(client.sleeps, []);
  }
});

test('only 403 and 429 answers can wait, even when other statuses carry rate-limit headers', async () => {
  const headers = { 'retry-after': '1', 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(syntheticNow / 1000 + 5) };
  for (const status of [401, 404, 500, 503]) {
    const client = scriptedClient([{ status, headers }]);
    await rejectsWithStatus(client.get(gateResource, 'main-ref'), 'main-ref', status,
      { rateLimitRemaining: 0, rateLimitResetEpochSeconds: syntheticNow / 1000 + 5, retryAfterSeconds: 1 });
    assert.equal(client.calls(), 1); assert.deepEqual(client.sleeps, []);
  }
  const redirect = scriptedClient([{ status: 302, headers: { ...headers, location: 'https://invalid.test/' } }]);
  await assert.rejects(redirect.get(gateResource, 'main-ref'));
  assert.equal(redirect.calls(), 1); assert.deepEqual(redirect.sleeps, []);
});

test('rate-limit waits stop at 240 s in total per build client', async () => {
  const client = scriptedClient([limitedBy(60), { status: 200 }, limitedBy(90), limitedBy(90), { status: 200 }, limitedBy(1)]);
  assert.deepEqual(await client.get(gateResource, 'main-ref'), { ok: true });
  assert.deepEqual(await client.get(gateResource, 'production-ref'), { ok: true });
  assert.deepEqual(client.sleeps, [60_000, 90_000, 90_000]);
  // 240 s already waited: one more second exceeds the cap, so the request fails without sleeping.
  await rejectsWithStatus(client.get(gateResource, 'ci-workflow'), 'ci-workflow', 429, { retryAfterSeconds: 1 });
  assert.equal(client.calls(), 6); assert.deepEqual(client.sleeps, [60_000, 90_000, 90_000]);
});

test('a rate-limit wait starts only when 60 s of the build deadline remain after it', async () => {
  const fits = scriptedClient([limitedBy(30), { status: 200 }], { deadline: syntheticNow + 90_000 });
  assert.deepEqual(await fits.get(gateResource, 'main-ref'), { ok: true });
  assert.deepEqual(fits.sleeps, [30_000]);
  const late = scriptedClient([limitedBy(30)], { deadline: syntheticNow + 89_999 });
  await rejectsWithStatus(late.get(gateResource, 'main-ref'), 'main-ref', 429, { retryAfterSeconds: 30 });
  assert.equal(late.calls(), 1); assert.deepEqual(late.sleeps, []);
});

test('retries count toward the 24-request bound', async () => {
  // Eight requests that each need two immediate retries use all 24 calls.
  const client = scriptedClient(Array.from({ length: 8 }, () => [limitedBy(0), limitedBy(0), { status: 200 }]).flat());
  for (let i = 0; i < 8; i++) assert.deepEqual(await client.get(gateResource, 'main-ref'), { ok: true });
  assert.equal(client.calls(), 24); assert.deepEqual(client.sleeps, Array(16).fill(0));
  await assert.rejects(client.get(gateResource, 'main-ref'), /request bound exceeded/);
  assert.equal(client.calls(), 24);
  // On the last allowed call a rate-limited answer keeps its own diagnostic instead of waiting for nothing.
  const edge = scriptedClient([...Array(23).fill({ status: 200 }), limitedBy(0)]);
  for (let i = 0; i < 23; i++) await edge.get(gateResource, 'main-ref');
  await rejectsWithStatus(edge.get(gateResource, 'ci-runs'), 'ci-runs', 429, { retryAfterSeconds: 0 });
  assert.equal(edge.calls(), 24); assert.deepEqual(edge.sleeps, []);
});

test('a rate-limited approval request that clears within the caps lets the build complete with one identity', async () => {
  for (const after of [false, true]) {
    const gate = gateFixture(), operations = [], sleeps = []; let requests = 0;
    const limitedAt = (after ? approvalCategories.length : 0) + 1;
    const get = publicGithubBuildClient(async url => {
      requests++;
      if (requests === limitedAt) return new Response(privateDiagnostic, { status: 429, headers: { 'retry-after': '30' } });
      return Response.json(await gate.get(new URL(url).pathname + new URL(url).search));
    }, { sleep: async milliseconds => { sleeps.push(milliseconds); }, now: () => syntheticNow });
    assert.deepEqual(await orchestrateCloudBuild({ env, readLocal: async () => local, get,
      install: async () => { operations.push('install'); }, build: async () => { operations.push('build'); },
      verify: async () => { operations.push('verify');
        return { marker: { buildId: 'synthetic-build' }, manifest: { nativeRelease: release() } }; },
    }), { completed: true, commit: COMMIT, buildId: 'synthetic-build', approvalRunId: 20 });
    assert.equal(requests, 13); assert.deepEqual(sleeps, [30_000]);
    assert.deepEqual(operations, ['install', 'build', 'verify']);
  }
});

test('the native build gives the GitHub gate client its 18-minute deadline', () => {
  const source = readFileSync(new URL('../pages-cloud-build.mjs', import.meta.url), 'utf8');
  assert.match(source, /^const MAX_BUILD_MS = 18 \* 60 \* 1000;$/m);
  assert.match(source, /const get = publicGithubBuildClient\(globalThis\.fetch, \{ deadline: Date\.now\(\) \+ MAX_BUILD_MS \}\);/);
});

test('forged diagnostic properties and non-status values never enter native diagnostics', async () => {
  const forged = { phase: 'approval-before', requestCategory: privateDiagnostic, reason: privateDiagnostic,
    httpStatus: 403, responseMetadata: { rateLimitRemaining: 0, retryAfterSeconds: 1 },
    approval: { requestCategory: 'main-ref', reason: 'http-status', httpStatus: 403,
      responseMetadata: { rateLimitRemaining: 0, retryAfterSeconds: 1 } },
    message: privateDiagnostic, cause: privateDiagnostic };
  for (const value of [forged, Object.assign(new Error(privateDiagnostic), forged), privateDiagnostic, null, undefined])
    assert.deepEqual(nativeBuildDiagnostic(value), { schemaVersion: 1, event: 'native-build-failed',
      phase: 'unclassified', outputApproved: false, detailsWithheld: true });
  for (const after of [false, true]) {
    const gate = gateFixture(), operations = []; let built = false;
    await assert.rejects(orchestrateCloudBuild({ env, readLocal: async () => local,
      get: async resource => { if (built === after) throw forged; return gate.get(resource); },
      install: async () => { operations.push('install'); },
      build: async () => { built = true; operations.push('build'); },
      verify: async () => { operations.push('verify');
        return { marker: { buildId: 'synthetic-build' }, manifest: { nativeRelease: release() } }; },
    }), error => {
      assert.deepEqual(nativeBuildDiagnostic(error), { schemaVersion: 1, event: 'native-build-failed',
        phase: after ? 'approval-after' : 'approval-before', outputApproved: false, detailsWithheld: true,
        approval: { requestCategory: 'main-ref', reason: 'contract-mismatch' } });
      return true;
    });
    assert.deepEqual(operations, after ? ['install', 'build', 'verify'] : []);
  }
  for (const status of [privateDiagnostic, 99, 600, 403.5, NaN]) {
    const get = publicGithubBuildClient(async () => ({ status }));
    await assert.rejects(get(`/repos/${CLOUD_BUILD_REPOSITORY}/commits/main`, privateDiagnostic), error => {
      assert.deepEqual(nativeBuildDiagnostic(error).approval, { requestCategory: 'unclassified', reason: 'http-status' });
      assert.equal(JSON.stringify(nativeBuildDiagnostic(error)).includes(privateDiagnostic), false); return true;
    });
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
