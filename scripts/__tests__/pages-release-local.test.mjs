import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parseLocalReleaseArgs, localPackagingEnvironment, runLocalPackagingChild,
  orchestrateApprovedLocalRelease } from '../pages-release-local.mjs';

const COMMIT = 'a'.repeat(40), OTHER = 'b'.repeat(40);
const ID = '11111111-2222-3333-4444-555555555555';
const REPO = 'whatisyourdreambro/my-salary-calculator';
const WORKFLOW = `on:
  push:
    branches: [main]
jobs:
  verify:
    if: github.event_name != 'schedule' && github.event_name != 'workflow_dispatch'
    steps:
      - run: npm run qa:safety
      - run: npm test
      - run: node --test scripts/__tests__/*.test.mjs
      - run: npm run qa:pages:build
      - run: npm run qa:pages:verify
`;
const content = text => ({ type: 'file', encoding: 'base64', content: Buffer.from(text).toString('base64') });

function fixture({ env = {}, local = {}, ci = 'success', runSha = COMMIT, enabled = 'true', fail, changeMainAfter,
  reportOverride = {}, pinsOverride = {}, submitOverride = {} } = {}) {
  const calls = [], saved = [];
  let main = COMMIT, claimed = false;
  const stage = name => async () => {
    calls.push(name);
    if (name === fail) throw new Error('synthetic private credential must never be recorded');
    if (name === changeMainAfter) main = OTHER;
  };
  const report = { finished: true, commit: COMMIT, deploymentId: ID, canonicalVerifiedBefore: true,
    canonicalVerifiedAfter: true, purgeVerified: true, expectedRequests: 16, attemptedRequests: 16,
    results: Array.from({ length: 16 }, () => ({ contractPassed: true })), executedDocumentJavaScript: false,
    followedRedirects: 0, subresourceRequests: 0, automaticRetries: 0, ...reportOverride };
  const deps = { env, attempts: 1,
    readLocal: async () => ({ head: COMMIT, originMain: COMMIT, status: '', origin: `https://github.com/${REPO}.git`, ...local }),
    githubGet: async endpoint => {
      if (endpoint.endsWith('/commits/main')) return { sha: main };
      if (endpoint.endsWith('/actions/variables/PAGES_LOCAL_PUBLISH_ENABLED')) return { name: 'PAGES_LOCAL_PUBLISH_ENABLED', value: enabled };
      if (endpoint.endsWith('/actions/workflows/ci.yml')) return { id: 1, state: 'active', path: '.github/workflows/ci.yml' };
      if (endpoint.includes('/contents/.github/workflows/ci.yml?ref=')) return content(WORKFLOW);
      if (endpoint.includes('/contents/scripts/lib/pages-release.mjs?ref=')) return content('export const PAGES_LOCAL_RELEASE_POLICY_VERSION = 1;');
      if (endpoint.includes('/contents/scripts/pages-release-local.mjs?ref=')) return content('export const PAGES_LOCAL_ORCHESTRATOR_VERSION = 1;');
      if (endpoint.includes('/actions/workflows/1/runs?')) return { workflow_runs: [{ id: 2, workflow_id: 1,
        head_sha: runSha, head_branch: 'main', event: 'push', status: 'completed', conclusion: ci }] };
      if (endpoint.includes('/actions/runs/2/jobs?')) return { jobs: [{ id: 3, name: 'verify', status: 'completed', conclusion: ci }] };
      throw new Error('Unexpected synthetic API path');
    },
    claim: async state => { assert.equal(claimed, false, 'existing receipt'); claimed = true; calls.push('claim'); saved.push(structuredClone(state)); },
    save: async state => saved.push(structuredClone(state)),
    build: stage('build'), verifyPackage: stage('verify-package'), capture: stage('capture'),
    publish: async () => { await stage('publish')(); return { commit: COMMIT, branch: 'main', deploymentId: ID, purgeVerified: true, ...pinsOverride }; },
    verifyHttp: async () => { await stage('http')(); return report; },
    submit: async () => { await stage('submit')(); return { state: 'completed', commit: COMMIT, deploymentId: ID, ...submitOverride }; },
  };
  return { calls, saved, deps, run: () => orchestrateApprovedLocalRelease(COMMIT, deps) };
}

test('local release CLI requires exactly one explicit full approved commit', () => {
  assert.equal(parseLocalReleaseArgs(['--approved-commit', COMMIT]), COMMIT);
  for (const args of [[], ['--approved-commit'], ['--approved-commit', COMMIT.slice(0, 8)], ['--approved-commit', COMMIT, '--force'], ['--publish', COMMIT]])
    assert.throws(() => parseLocalReleaseArgs(args));
});

test('local approved release sequences verify-only CI, package, capture, publish, HTTP and notification exactly once', async () => {
  const f = fixture();
  assert.deepEqual(await f.run(), { finished: true, commit: COMMIT, deploymentId: ID, ciRunId: 2, ciJobId: 3 });
  assert.deepEqual(f.calls, ['claim', 'build', 'verify-package', 'capture', 'publish', 'http', 'submit']);
  assert.equal(f.saved.at(-1).finished, true); assert.equal(f.saved.at(-1).phase, 'completed');
  await assert.rejects(f.run(), /existing receipt/);
  assert.equal(f.calls.filter(name => name === 'publish').length, 1);
});

test('local release refuses Actions impersonation, QA flags and nonexact or dirty checkouts before any stage', async () => {
  for (const options of [{ env: { GITHUB_ACTIONS: 'true' } }, { env: { NEXT_PUBLIC_ADS_DISABLED: '1' } },
    { env: { MSY_QA_MODE: '1' } }, { env: { MSY_QA_PAGES_STAGE: '1' } }, { env: { MSY_QA_WORKER_STAGE: '1' } },
    { local: { head: OTHER } }, { local: { originMain: OTHER } }, { local: { status: ' M file' } },
    { local: { origin: 'https://example.invalid/repo' } }]) {
    const f = fixture(options); await assert.rejects(f.run()); assert.deepEqual(f.calls, []);
  }
});

test('disabled policy, wrong SHA or skipped/failed verify cannot claim receipts, build or publish', async () => {
  for (const options of [{ enabled: 'false' }, { runSha: OTHER }, { ci: 'failure' }, { ci: 'cancelled' }, { ci: 'skipped' }]) {
    const f = fixture(options); await assert.rejects(f.run()); assert.deepEqual(f.calls, []); assert.deepEqual(f.saved, []);
  }
});

test('main changes between stages stop before the next side effect and retain truthful incomplete state', async () => {
  const sequence = ['build', 'verify-package', 'capture', 'publish', 'http', 'submit'];
  for (const changeMainAfter of sequence) {
    const f = fixture({ changeMainAfter }); await assert.rejects(f.run(), /stopped/);
    assert.deepEqual(f.calls, ['claim', ...sequence.slice(0, sequence.indexOf(changeMainAfter) + 1)]);
    assert.equal(f.saved.at(-1).finished, false); assert.equal(f.saved.at(-1).phase, 'stopped-review-required');
  }
});

test('every failed stage stops without retry, notification or unsafe error serialization', async () => {
  const sequence = ['build', 'verify-package', 'capture', 'publish', 'http', 'submit'];
  for (const fail of sequence) {
    const f = fixture({ fail }); await assert.rejects(f.run(), /No automatic retry/);
    assert.deepEqual(f.calls, ['claim', ...sequence.slice(0, sequence.indexOf(fail) + 1)]);
    assert.equal(f.saved.at(-1).finished, false);
    assert.doesNotMatch(JSON.stringify(f.saved), /synthetic private credential/);
  }
});

test('wrong publication identity or skipped purge prevents document checks and notification', async () => {
  for (const pinsOverride of [{ commit: OTHER }, { branch: 'preview' }, { purgeVerified: false }, { deploymentId: 'invalid' }]) {
    const f = fixture({ pinsOverride }); await assert.rejects(f.run());
    assert.equal(f.calls.at(-1), 'publish'); assert.equal(f.saved.at(-1).finished, false);
  }
});

test('incomplete, stale, unpinned or rendering HTTP result never permits IndexNow', async () => {
  for (const reportOverride of [{ finished: false }, { commit: OTHER }, { deploymentId: 'wrong' }, { canonicalVerifiedBefore: false },
    { canonicalVerifiedAfter: false }, { purgeVerified: false }, { attemptedRequests: 15 }, { results: [] },
    { results: Array.from({ length: 16 }, () => ({ contractPassed: false })) }, { executedDocumentJavaScript: true },
    { subresourceRequests: 1 }, { followedRedirects: 1 }, { automaticRetries: 1 }]) {
    const f = fixture({ reportOverride }); await assert.rejects(f.run()); assert.equal(f.calls.at(-1), 'http');
  }
});

test('ambiguous or mismatched notification is not reported as a completed release', async () => {
  for (const submitOverride of [{ state: 'needs-review' }, { commit: OTHER }, { deploymentId: 'wrong' }]) {
    const f = fixture({ submitOverride }); await assert.rejects(f.run()); assert.equal(f.saved.at(-1).finished, false);
  }
});

test('production packaging environment keeps approved public settings while removing credentials and inherited executables', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'msy-local-package-test-'));
  try {
    writeFileSync(path.join(root, '.env.production'), ['HOME_TOP', 'CALC_RESULT', 'GUIDE_MID', 'COMPANY_TOP']
      .map(slot => `NEXT_PUBLIC_ADSENSE_SLOT_${slot}=1234567890`).join('\n'));
    const env = localPackagingEnvironment(root, { PATH: 'synthetic-path', GH_TOKEN: 'private-fixture', GITHUB_TOKEN: 'private-fixture',
      CF_API_TOKEN: 'private-fixture', CLOUDFLARE_API_TOKEN: 'private-fixture', LAW_OC: 'private-fixture',
      NODE_OPTIONS: '--require=untrusted', npm_execpath: '/untrusted/npm.js', HOME: '/private-home', NEXT_PUBLIC_GA_ID: 'G-SYNTHETIC' });
    for (const key of ['GH_TOKEN', 'GITHUB_TOKEN', 'CF_API_TOKEN', 'CLOUDFLARE_API_TOKEN', 'LAW_OC', 'NODE_OPTIONS', 'GITHUB_ACTIONS'])
      assert.equal(env[key], undefined, key);
    assert.equal(env.NEXT_PUBLIC_ADS_DISABLED, '0'); assert.equal(env.NEXT_PUBLIC_GA_ID, 'G-SYNTHETIC');
    assert.equal(env.HOME, path.join(root, '.pages-build/build-home')); assert.notEqual(env.npm_execpath, '/untrusted/npm.js');
    assert.doesNotMatch(JSON.stringify(env), /private-fixture|private-home|untrusted/);
    assert.throws(() => localPackagingEnvironment(root, { NEXT_PUBLIC_ADS_DISABLED: '1' }));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('packaging child has no shell, never emits raw output, and rejects a failed process', async () => {
  for (const code of [0, 1]) {
    const observed = [];
    const spawn = (binary, args, options) => {
      observed.push({ binary, args, options });
      const child = new EventEmitter(); child.stdout = new EventEmitter(); child.stderr = new EventEmitter(); child.kill = () => {};
      queueMicrotask(() => { child.stdout.emit('data', Buffer.from('private output fixture')); child.emit('close', code); });
      return child;
    };
    const env = { PATH: 'allowed-only' };
    const result = runLocalPackagingChild('/synthetic', 'build', env, spawn);
    if (code === 0) await result; else await assert.rejects(result, /did not complete/);
    assert.equal(observed.length, 1); assert.equal(observed[0].options.shell, false); assert.equal(observed[0].options.env, env);
    assert.deepEqual(observed[0].args.slice(1), ['build', '--mode', 'production']);
  }
});
