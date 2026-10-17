// Fixed Pages cache invalidation bridge. Never uploads assets or executes publisher HTML.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReleaseApi } from './pages-release.mjs';
import { assertPagesProject, assertProductionDeployment, configurationHash, PAGES_ACCOUNT, RELEASE_REPOSITORY } from './lib/pages-release.mjs';
import { main as purgePages } from './cf-purge-after-deploy.mjs';

const SHA = /^[a-f0-9]{40}$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const HASH = /^[a-f0-9]{64}$/;
export function assertVerifiedPurgeContext(env) {
  assert.equal(env.GITHUB_ACTIONS, 'true'); assert.equal(env.GITHUB_EVENT_NAME, 'workflow_dispatch');
  assert.equal(env.GITHUB_REPOSITORY, RELEASE_REPOSITORY); assert.equal(env.GITHUB_REF, 'refs/heads/main');
  assert.equal(env.GITHUB_RUN_ATTEMPT, '1', 'Reconcile an earlier attempt instead of rerunning');
  assert.match(env.GITHUB_RUN_ID || '', /^[1-9][0-9]*$/);
  assert.match(env.CF_PAGES_COMMIT_SHA || '', SHA); assert.equal(env.GITHUB_SHA, env.CF_PAGES_COMMIT_SHA);
  assert.match(env.CF_EXPECTED_DEPLOYMENT_ID || '', UUID); assert.match(env.CF_EXPECTED_CONFIGURATION_HASH || '', HASH);
  assert.match(env.CF_PURGE_REQUEST_ID || '', UUID); assert.equal(env.CF_ACCOUNT_ID, PAGES_ACCOUNT);
  assert.equal(env.CF_ZONE_ID, '601da4afa1bfd889aa3cdf843f07dc7d');
  assert.ok(env.CF_API_TOKEN && !/\s/.test(env.CF_API_TOKEN));
  return { commit: env.CF_PAGES_COMMIT_SHA, deploymentId: env.CF_EXPECTED_DEPLOYMENT_ID,
    configurationHash: env.CF_EXPECTED_CONFIGURATION_HASH, requestId: env.CF_PURGE_REQUEST_ID };
}

export async function runVerifiedPagesPurge(env = process.env, dependencies = {}) {
  const expected = assertVerifiedPurgeContext(env);
  const api = dependencies.api ?? createReleaseApi(env);
  const check = async () => {
    assert.equal(await api.readMain(), expected.commit, 'Main moved; do not purge');
    const project = assertPagesProject(await api.readProject(), { compatibilityDate: '2025-09-08' });
    assert.equal(configurationHash(project), expected.configurationHash);
    assert.equal(project.canonical_deployment.id, expected.deploymentId);
    assertProductionDeployment(await api.readDeployment(expected.deploymentId), expected.commit, expected.deploymentId);
  };
  await check();
  let purged = false;
  const result = await (dependencies.purge ?? purgePages)({
    CF_API_TOKEN: env.CF_API_TOKEN, CF_ACCOUNT_ID: env.CF_ACCOUNT_ID, CF_ZONE_ID: env.CF_ZONE_ID,
    CF_DEPLOY_TARGET: 'pages', CF_PAGES_PROJECT: 'my-salary-calculator', CF_PAGES_COMMIT_SHA: expected.commit,
    CF_PURGE_TIMEOUT_MINUTES: '2', CF_PURGE_SETTLE_SECONDS: '30',
  }, { beforePagesPurge: check, onPagesPurge: () => { purged = true; } });
  assert.equal(result, 0); assert.equal(purged, true, 'A skipped purge is not a completed purge');
  await check();
  return { schemaVersion: 1, ...expected, purgeVerified: true, purgedAt: new Date().toISOString(),
    runId: Number(env.GITHUB_RUN_ID), runAttempt: 1 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const receipt = await runVerifiedPagesPurge();
    const directory = fileURLToPath(new URL('../.artifacts/pages-purge/', import.meta.url));
    mkdirSync(directory, { recursive: true });
    writeFileSync(path.join(directory, 'purge-receipt.json'), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    console.log('PAGES_VERIFIED_PURGE_RECEIPT ' + JSON.stringify(receipt));
  } catch { console.error('Pinned Pages purge failed; no verified receipt was issued. Reconcile before retrying.'); process.exitCode = 1; }
}
