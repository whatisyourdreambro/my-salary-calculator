import assert from 'node:assert/strict';
import { test } from 'node:test';
import { workerReleaseConfig, classifyWorkerDeployment, readWorkerActivation } from '../lib/cf-worker-release.mjs';

const VERSION = '11111111-2222-3333-4444-555555555555';
const OTHER = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const ENV = { CF_API_TOKEN: 'test-only-token', CF_ACCOUNT_ID: 'a'.repeat(32), CF_WORKER_NAME: 'test-worker', CF_RELEASE_TAG: 'release-test', CF_EXPECTED_VERSION_ID: VERSION };
const deployment = (version = VERSION, id = 'd1') => ({ id, strategy: 'percentage', versions: [{ version_id: version, percentage: 100 }] });
const json = (result, status = 200) => ({ status, json: async () => ({ success: status === 200, result }) });

test('Workers configuration requires explicit identity/tag; capture does not require a token', () => {
  assert.deepEqual(workerReleaseConfig(ENV).expectedVersionId, VERSION);
  for (const field of ['CF_API_TOKEN', 'CF_ACCOUNT_ID', 'CF_WORKER_NAME', 'CF_RELEASE_TAG']) {
    assert.throws(() => workerReleaseConfig({ ...ENV, [field]: '' }));
  }
  assert.throws(() => workerReleaseConfig({ ...ENV, CF_EXPECTED_VERSION_ID: '11111111' }));
  assert.throws(() => workerReleaseConfig({ ...ENV, CF_WORKER_NAME: '../other' }));
  assert.throws(() => workerReleaseConfig({ ...ENV, CF_RELEASE_TAG: 'line\nbreak' }));
  assert.equal(workerReleaseConfig({ ...ENV, CF_API_TOKEN: '' }, { requireToken: false }).token, '');
});

test('only first active deployment with a single 100% version can match', () => {
  assert.equal(classifyWorkerDeployment({ deployments: [deployment()] }, VERSION).state, 'candidate');
  assert.equal(classifyWorkerDeployment({ deployments: [deployment(OTHER), deployment()] }, VERSION).state, 'pending');
  assert.equal(classifyWorkerDeployment({ deployments: [{ ...deployment(), versions: [{ version_id: VERSION, percentage: 50 }, { version_id: OTHER, percentage: 50 }] }] }, VERSION).state, 'pending');
  assert.equal(classifyWorkerDeployment({ deployments: [{ ...deployment(), versions: [{ version_id: VERSION, percentage: '100' }] }] }).state, 'pending');
  assert.equal(classifyWorkerDeployment({ deployments: [] }).state, 'pending');
  assert.equal(classifyWorkerDeployment({ deployments: [{ ...deployment(), id: '' }] }).state, 'error');
});

test('exact version ID/tag verified and active deployment re-read without exposing resources', async () => {
  const calls = [];
  const result = await readWorkerActivation(workerReleaseConfig(ENV), { fetchFn: async (url, init) => {
    calls.push({ url, init });
    assert.equal(init.redirect, 'error');
    assert.ok(init.signal instanceof AbortSignal);
    return url.endsWith('/deployments') ? json({ deployments: [deployment()] }) : json({ id: VERSION, annotations: { 'workers/tag': ENV.CF_RELEASE_TAG }, resources: { secret: 'must-not-be-returned' } });
  } });
  assert.deepEqual(result, { state: 'success', deploymentId: 'd1', versionId: VERSION, releaseTag: ENV.CF_RELEASE_TAG });
  assert.equal(calls.length, 3);
  assert.equal(calls.filter((call) => call.url.endsWith('/deployments')).length, 2);
  assert.ok(!JSON.stringify(result).includes('must-not-be-returned'));
});

test('wrong tag, wrong response version and concurrent deployment changes fail closed', async () => {
  for (const details of [{ id: VERSION, annotations: { 'workers/tag': 'other-release' } }, { id: OTHER, annotations: { 'workers/tag': ENV.CF_RELEASE_TAG } }]) {
    const result = await readWorkerActivation(workerReleaseConfig(ENV), { fetchFn: async (url) => url.endsWith('/deployments') ? json({ deployments: [deployment()] }) : json(details) });
    assert.equal(result.state, 'pending');
  }
  let listed = 0;
  const result = await readWorkerActivation(workerReleaseConfig(ENV), { fetchFn: async (url) => url.endsWith('/deployments')
    ? json({ deployments: [deployment(VERSION, ++listed === 1 ? 'd1' : 'd2')] })
    : json({ id: VERSION, annotations: { 'workers/tag': ENV.CF_RELEASE_TAG } }) });
  assert.equal(result.state, 'pending');
});

test('API errors/timeouts never authorize a release and never return raw response bodies', async () => {
  const denied = await readWorkerActivation(workerReleaseConfig(ENV), { fetchFn: async () => json({ secret: 'hidden' }, 403) });
  assert.equal(denied.fatal, true);
  assert.ok(!JSON.stringify(denied).includes('hidden'));
  const timeout = await readWorkerActivation(workerReleaseConfig(ENV), { fetchFn: async () => { throw new Error('private request URL'); } });
  assert.equal(timeout.state, 'error');
  assert.ok(!JSON.stringify(timeout).includes('private'));
});
