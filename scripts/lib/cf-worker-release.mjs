// Read-only Cloudflare control-plane verification. Never uploads/deploys a Worker.
// API: the FIRST deployment is the currently active deployment, not the newest
// uploaded version. A gradual deployment is intentionally not a completed release.
export const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4';
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export function workerReleaseConfig(env = process.env, { requireToken = true } = {}) {
  const config = {
    token: String(env.CF_API_TOKEN ?? '').trim(),
    accountId: String(env.CF_ACCOUNT_ID ?? '').trim(),
    workerName: String(env.CF_WORKER_NAME ?? '').trim(),
    releaseTag: String(env.CF_RELEASE_TAG ?? '').trim(),
    expectedVersionId: String(env.CF_EXPECTED_VERSION_ID ?? '').trim(),
  };
  if (requireToken && !config.token) throw new Error('CF_API_TOKEN is required for Workers activation verification.');
  if (!/^[a-f0-9]{32}$/i.test(config.accountId)) throw new Error('CF_ACCOUNT_ID must be a Cloudflare account ID.');
  if (!/^[a-z0-9][a-z0-9_-]{0,62}$/i.test(config.workerName)) throw new Error('CF_WORKER_NAME is required and must be a Worker name.');
  if (!/^[a-z0-9._-]{1,128}$/i.test(config.releaseTag)) throw new Error('CF_RELEASE_TAG is required (exact workers/tag annotation; no inferred dirty-tree SHA).');
  if (config.expectedVersionId && !UUID.test(config.expectedVersionId)) throw new Error('CF_EXPECTED_VERSION_ID must be a full version UUID.');
  return config;
}

export function classifyWorkerDeployment(result, expectedVersionId = '') {
  const deployment = result?.deployments?.[0];
  if (!deployment) return { state: 'pending', reason: 'No active deployment.' };
  const versions = deployment.versions;
  if (deployment.strategy !== 'percentage' || !Array.isArray(versions)
      || versions.length !== 1 || versions[0]?.percentage !== 100 || !UUID.test(versions[0]?.version_id ?? '')) {
    return { state: 'pending', reason: 'Active deployment is not one version at 100%.' };
  }
  const versionId = versions[0].version_id;
  if (expectedVersionId && versionId !== expectedVersionId) {
    return { state: 'pending', reason: 'A different version is active.', versionId };
  }
  if (typeof deployment.id !== 'string' || !deployment.id) {
    return { state: 'error', fatal: true, reason: 'Active deployment identity is missing.' };
  }
  return { state: 'candidate', deploymentId: deployment.id, versionId };
}

async function getControlPlane(url, token, fetchFn) {
  try {
    const response = await fetchFn(url, {
      method: 'GET', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'MoneySalary-QA/1.0' },
    });
    const body = await response.json().catch(() => null);
    if (response.status !== 200 || body?.success !== true) {
      // Do not print raw API bodies: version resources may contain binding values.
      return { state: 'error', fatal: [400, 401, 403, 404].includes(response.status), reason: `Cloudflare control-plane HTTP ${response.status}.` };
    }
    return { state: 'ok', result: body.result };
  } catch {
    return { state: 'error', fatal: false, reason: 'Cloudflare control-plane request failed or timed out.' };
  }
}

export async function readWorkerActivation(config, { fetchFn = globalThis.fetch } = {}) {
  const base = `${CLOUDFLARE_API}/accounts/${encodeURIComponent(config.accountId)}/workers/scripts/${encodeURIComponent(config.workerName)}`;
  const listed = await getControlPlane(`${base}/deployments`, config.token, fetchFn);
  if (listed.state !== 'ok') return listed;
  const candidate = classifyWorkerDeployment(listed.result, config.expectedVersionId);
  if (candidate.state !== 'candidate') return candidate;
  const version = await getControlPlane(`${base}/versions/${candidate.versionId}`, config.token, fetchFn);
  if (version.state !== 'ok') return version;
  if (version.result?.id !== candidate.versionId || version.result?.annotations?.['workers/tag'] !== config.releaseTag) {
    return { state: 'pending', reason: 'Active version does not match the exact release tag.', versionId: candidate.versionId };
  }
  // Re-read after metadata lookup: a deployment changed during that GET must not
  // accidentally authorize a stale release. No API can lock subsequent activation.
  const checked = await getControlPlane(`${base}/deployments`, config.token, fetchFn);
  if (checked.state !== 'ok') return checked;
  const current = classifyWorkerDeployment(checked.result, candidate.versionId);
  if (current.state !== 'candidate' || current.deploymentId !== candidate.deploymentId) {
    return { state: 'pending', reason: 'Active deployment changed during verification.' };
  }
  return { state: 'success', deploymentId: candidate.deploymentId, versionId: candidate.versionId, releaseTag: config.releaseTag };
}
