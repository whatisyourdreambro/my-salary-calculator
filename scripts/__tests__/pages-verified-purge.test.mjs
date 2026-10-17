import test from 'node:test';
import assert from 'node:assert/strict';
import { assertVerifiedPurgeContext, runVerifiedPagesPurge } from '../pages-verified-purge.mjs';
import { configurationHash, PAGES_ACCOUNT, RELEASE_REPOSITORY } from '../lib/pages-release.mjs';

const commit = 'a'.repeat(40), id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const config = { compatibility_date: '2025-09-08', compatibility_flags: ['nodejs_compat'], d1_databases: { FEEDBACK_DB: {} }, env_vars: { FEEDBACK_RATE_LIMIT_SECRET: { type: 'secret_text' } } };
function fixture() {
  const project = { name: 'my-salary-calculator', production_branch: 'main', canonical_deployment: { id },
    source: { type: 'github', config: { deployments_enabled: false, production_deployments_enabled: false, preview_deployment_setting: 'none' } },
    deployment_configs: { preview: structuredClone(config), production: structuredClone(config) } };
  const deployment = { id, project_name: project.name, environment: 'production', is_skipped: false, latest_stage: { name: 'deploy', status: 'success' },
    deployment_trigger: { metadata: { branch: 'main', commit_hash: commit, commit_dirty: false } }, url: 'https://aaaaaaaa.my-salary-calculator.pages.dev', short_id: 'aaaaaaaa' };
  const env = { GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REPOSITORY: RELEASE_REPOSITORY,
    GITHUB_REF: 'refs/heads/main', GITHUB_RUN_ATTEMPT: '1', GITHUB_RUN_ID: '123456', GITHUB_SHA: commit,
    CF_PAGES_COMMIT_SHA: commit, CF_EXPECTED_DEPLOYMENT_ID: id, CF_EXPECTED_CONFIGURATION_HASH: configurationHash(project),
    CF_PURGE_REQUEST_ID: id, CF_ACCOUNT_ID: PAGES_ACCOUNT, CF_ZONE_ID: '601da4afa1bfd889aa3cdf843f07dc7d', CF_API_TOKEN: 'fixture-secret' };
  const api = { readMain: async () => commit, readProject: async () => project, readDeployment: async () => deployment };
  return { env, api, project, deployment };
}
test('verified purge validates fixed account, exact main commit, nonce and one attempt', () => {
  const { env } = fixture(); assert.doesNotThrow(() => assertVerifiedPurgeContext(env));
  for (const change of [{ GITHUB_RUN_ATTEMPT: '2' }, { GITHUB_SHA: 'b'.repeat(40) }, { CF_EXPECTED_DEPLOYMENT_ID: 'short' },
    { CF_PURGE_REQUEST_ID: '' }, { CF_ACCOUNT_ID: 'c'.repeat(32) }, { CF_API_TOKEN: '' }, { GITHUB_REF: 'refs/heads/other' }])
    assert.throws(() => assertVerifiedPurgeContext({ ...env, ...change }));
});
test('receipt requires actual purge and post-purge canonical identity; skip is failure', async () => {
  const { env, api } = fixture(); let requests = 0;
  const receipt = await runVerifiedPagesPurge(env, { api, purge: async (_, hooks) => {
    await hooks.beforePagesPurge(); requests++; await hooks.onPagesPurge(); return 0;
  } });
  assert.equal(requests, 1); assert.equal(receipt.purgeVerified, true); assert.equal(receipt.runId, 123456);
  assert.equal(receipt.commit, commit); assert.ok(!JSON.stringify(receipt).includes('fixture-secret'));
  await assert.rejects(runVerifiedPagesPurge(env, { api, purge: async () => 0 }), /skipped/);
});
test('moved canonical, configuration or main prevents purge; post-purge race prevents receipt', async () => {
  for (const change of ['canonical', 'config', 'main']) {
    const f = fixture(); let purges = 0;
    if (change === 'canonical') f.project.canonical_deployment.id = 'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee';
    if (change === 'config') f.project.production_branch = 'other';
    if (change === 'main') f.api.readMain = async () => 'b'.repeat(40);
    await assert.rejects(runVerifiedPagesPurge(f.env, { api: f.api, purge: async () => { purges++; return 0; } }));
    assert.equal(purges, 0);
  }
  const f = fixture();
  await assert.rejects(runVerifiedPagesPurge(f.env, { api: f.api, purge: async (_, hooks) => {
    await hooks.beforePagesPurge(); await hooks.onPagesPurge(); f.project.canonical_deployment.id = 'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee'; return 0;
  } }));
});
