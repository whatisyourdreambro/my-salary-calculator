// Pages-only release policy. Importing this module performs no I/O.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import path from 'node:path';

export const PAGES_PROJECT = 'my-salary-calculator';
export const RELEASE_REPOSITORY = 'whatisyourdreambro/my-salary-calculator';
export const PAGES_RELEASE_POLICY_VERSION = 1;
const SHA = /^[a-f0-9]{40}$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const HASH = /^[a-f0-9]{64}$/;
const canonical = value => JSON.stringify((function order(item) {
  if (Array.isArray(item)) return item.map(order);
  if (item && typeof item === 'object') return Object.fromEntries(Object.keys(item).sort().map(key => [key, order(item[key])]));
  return item;
})(value));
export function configurationHash(project) {
  const config = Object.fromEntries(['production_branch', 'source', 'build_config', 'deployment_configs', 'domains'].map(key => [key, project[key]]));
  return createHash('sha256').update(canonical(config)).digest('hex');
}

export function assertReleaseContext(env, { commit, status }) {
  assert.equal(env.GITHUB_ACTIONS, 'true', 'Automatic publication requires GitHub Actions');
  assert.equal(env.GITHUB_EVENT_NAME, 'push');
  assert.equal(env.GITHUB_REF, 'refs/heads/main');
  assert.equal(env.GITHUB_REPOSITORY, RELEASE_REPOSITORY);
  assert.equal(env.PAGES_AUTO_DEPLOY_ENABLED, 'true', 'Automatic Pages publication is not enabled');
  assert.equal(env.GITHUB_RUN_ATTEMPT, '1', 'Re-runs require manual deployment reconciliation');
  assert.match(env.GITHUB_SHA || '', SHA); assert.equal(commit, env.GITHUB_SHA);
  assert.equal(status, '', 'Publication requires a clean, exact checkout');
  for (const key of ['MSY_QA_MODE', 'NEXT_PUBLIC_ADS_DISABLED', 'MSY_QA_PAGES_STAGE', 'MSY_QA_WORKER_STAGE', 'MSY_PAGES_LOCAL_CHILD', 'MSY_QA_SERVER'])
    assert.notEqual(env[key], '1', `Publication refuses QA setting ${key}`);
  return commit;
}

export function assertProductionPackage(marker) {
  assert.equal(marker?.mode, 'production'); assert.equal(marker.adsDisabled, false);
  assert.match(marker.buildId || '', /^[A-Za-z0-9_-]{1,128}$/);
  for (const key of ['sourceHash', 'outputHash', 'workerHash']) assert.match(marker[key] || '', HASH);
  assert.equal(marker.workerModuleCount, 44, 'Review a changed Pages module inventory before automatic publication');
  assert.ok(marker.workerBytes > 0 && marker.workerBytes <= 25 * 1024 * 1024);
  assert.equal(marker.compatibilityDate, '2025-09-08');
  assert.equal(marker.publicConfig?.path, '.env.production');
  assert.match(marker.publicConfig?.effectiveHash || '', HASH);
}

export function assertPagesProject(project, marker) {
  assert.equal(project?.name, PAGES_PROJECT); assert.equal(project.production_branch, 'main');
  assert.equal(project.source?.type, 'github');
  assert.equal(project.source.config?.deployments_enabled, false, 'Keep Cloudflare Git builds disabled; GitHub is the sole publisher');
  assert.equal(project.source.config?.production_deployments_enabled, false);
  assert.equal(project.source.config?.preview_deployment_setting, 'none');
  for (const mode of ['preview', 'production']) {
    const config = project.deployment_configs?.[mode];
    assert.equal(config?.compatibility_date, marker.compatibilityDate);
    assert.deepEqual(config?.compatibility_flags, ['nodejs_compat']);
    assert.ok(config.d1_databases?.FEEDBACK_DB, 'Existing feedback binding is required');
    assert.equal(config.env_vars?.FEEDBACK_RATE_LIMIT_SECRET?.type, 'secret_text');
  }
  assert.match(project.canonical_deployment?.id || '', UUID);
  return project;
}

export function assertProductionDeployment(record, commit, expectedId = record?.id) {
  assert.match(commit || '', SHA); assert.match(expectedId || '', UUID);
  assert.equal(record?.id, expectedId); assert.equal(record.project_name, PAGES_PROJECT);
  assert.equal(record.environment, 'production'); assert.equal(record.is_skipped, false);
  assert.equal(record.latest_stage?.name, 'deploy'); assert.equal(record.latest_stage?.status, 'success');
  assert.equal(record.deployment_trigger?.metadata?.branch, 'main');
  assert.equal(record.deployment_trigger?.metadata?.commit_hash, commit);
  assert.equal(record.deployment_trigger?.metadata?.commit_dirty, false);
  assert.match(record.url || '', /^https:\/\/[a-f0-9]{8}\.my-salary-calculator\.pages\.dev\/?$/);
  assert.equal(record.short_id, new URL(record.url).hostname.split('.')[0]);
  return record;
}

export function pagesUploadArgs(cli, dist, commit) {
  assert.match(commit, SHA); assert.ok(path.isAbsolute(cli) && path.isAbsolute(dist));
  assert.equal(path.basename(dist), 'dist'); assert.equal(path.basename(path.dirname(dist)), '.pages-build');
  return [cli, 'pages', 'deploy', dist, '--project-name', PAGES_PROJECT, '--branch', 'main',
    '--commit-hash', commit, '--commit-dirty=false', '--commit-message', 'Verified automatic static Pages release', '--no-bundle'];
}

export function publicationEnvironment(input, cwd) {
  assert.match(input.CF_ACCOUNT_ID || '', /^[a-f0-9]{32}$/);
  assert.ok(typeof input.CF_API_TOKEN === 'string' && input.CF_API_TOKEN.length > 30 && !/\s/.test(input.CF_API_TOKEN));
  const result = {};
  for (const key of ['SystemRoot', 'WINDIR', 'PATH', 'PATHEXT', 'COMSPEC', 'TEMP', 'TMP', 'TMPDIR']) {
    const values = Object.entries(input).filter(([name]) => name.toLowerCase() === key.toLowerCase()).map(([, value]) => value);
    assert.ok(values.every(value => typeof value === 'string')); assert.ok(new Set(values).size <= 1);
    if (values.length) result[key] = values[0];
  }
  return { ...result, HOME: cwd, USERPROFILE: cwd, XDG_CONFIG_HOME: path.join(cwd, '.config'), CI: 'true',
    CLOUDFLARE_API_TOKEN: input.CF_API_TOKEN, CLOUDFLARE_ACCOUNT_ID: input.CF_ACCOUNT_ID,
    WRANGLER_SEND_METRICS: 'false', WRANGLER_WRITE_LOGS: 'false',
    CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false', CLOUDFLARE_CF_FETCH_ENABLED: 'false' };
}

/** Exact control-plane records only. Dependencies allow offline failure/race tests. */
export async function publishPages({ commit, marker }, { readMain, readProject, listDeployments, readDeployment,
  verifyLocal, upload, purge, saveState, savePins, now = () => new Date().toISOString() }) {
  assert.match(commit, SHA); assertProductionPackage(marker);
  assert.equal(await readMain(), commit, 'This CI run is superseded by a newer main commit');
  const before = assertPagesProject(await readProject(), marker);
  const fingerprint = configurationHash(before);
  const rollbackId = before.canonical_deployment.id;
  const rollback = await readDeployment(rollbackId);
  assertProductionDeployment(rollback, rollback.deployment_trigger?.metadata?.commit_hash, rollbackId);
  const baseline = await listDeployments();
  const matches = rows => rows.filter(item => item.environment === 'production'
    && item.deployment_trigger?.metadata?.branch === 'main' && item.deployment_trigger?.metadata?.commit_hash === commit);
  assert.equal(matches(baseline).length, 0, 'Commit already has a deployment attempt; reconcile instead of re-uploading');
  const state = { policyVersion: PAGES_RELEASE_POLICY_VERSION, phase: 'ready', commit, buildId: marker.buildId, artifactHash: marker.outputHash,
    sourceHash: marker.sourceHash, rollbackDeploymentId: rollbackId, configurationHash: fingerprint,
    publisherRequests: 0, automaticUploadRetries: 0, configurationWrites: 0, paidPlanChanges: 0, startedAt: now() };
  saveState(state);
  let uploaded = false;
  try {
    // Recheck immediately before the one upload. No account configuration is written.
    await verifyLocal(); assert.equal(await readMain(), commit, 'Main changed before upload');
    const last = assertPagesProject(await readProject(), marker);
    assert.equal(configurationHash(last), fingerprint, 'Project configuration changed before upload');
    assert.equal(last.canonical_deployment.id, rollbackId, 'Canonical deployment changed before upload');
    state.phase = 'uploading'; saveState(state); uploaded = true;
    let result;
    try { result = await upload(); } catch { result = { code: -1 }; }
    state.uploadExitCode = result.code; state.phase = 'reconciling'; saveState(state);
    const after = assertPagesProject(await readProject(), marker);
    assert.equal(configurationHash(after), fingerprint, 'Project configuration changed during upload');
    state.canonicalDeploymentObserved = after.canonical_deployment.id;
    const candidates = matches(await listDeployments()).filter(item => !baseline.some(old => old.id === item.id));
    state.candidateIds = candidates.map(item => item.id).filter(id => UUID.test(id || '')); saveState(state);
    assert.equal(result.code, 0, 'Upload outcome requires manual reconciliation; do not retry');
    assert.equal(candidates.length, 1, 'Expected exactly one new production deployment');
    const deployed = assertProductionDeployment(await readDeployment(candidates[0].id), commit, candidates[0].id);
    const assertCanonical = async () => {
      const current = assertPagesProject(await readProject(), marker);
      assert.equal(configurationHash(current), fingerprint, 'Project configuration changed');
      assert.equal(current.canonical_deployment.id, deployed.id, 'Release is no longer canonical');
      assertProductionDeployment(await readDeployment(deployed.id), commit, deployed.id);
    };
    await assertCanonical();
    let purged = false;
    const code = await purge({ beforePagesPurge: assertCanonical, onPagesPurge: () => { purged = true; } });
    assert.equal(code, 0, 'Pages cache purge failed'); assert.equal(purged, true, 'Purge was skipped, not completed');
    await assertCanonical();
    const pins = { policyVersion: PAGES_RELEASE_POLICY_VERSION, deploymentId: deployed.id, commit, branch: 'main', buildId: marker.buildId,
      artifactHash: marker.outputHash, sourceHash: marker.sourceHash, rollbackDeploymentId: rollbackId,
      configurationHash: fingerprint, purgeVerified: true, purgedAt: now() };
    savePins(pins);
    state.phase = 'purged-awaiting-http'; state.deploymentId = deployed.id; state.finishedAt = now(); saveState(state);
    return pins;
  } catch {
    // Never copy raw Cloudflare bodies, config/secret values or child errors to artifacts.
    state.phase = uploaded ? 'reconciliation-required' : 'preflight-stopped'; state.finishedAt = now(); saveState(state);
    throw new Error('Pages release stopped; inspect sanitized release state. No automatic re-upload or rollback.');
  }
}
