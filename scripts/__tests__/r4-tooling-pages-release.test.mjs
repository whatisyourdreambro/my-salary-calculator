// R4 TOOLING (2026-11-18, N2-scripts-06 / scripts-b06-F01): the approved local recovery publisher checks the LOCAL
// publish switch. Offline stub of the GitHub read API only: no network, no Wrangler, no git push.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { approvedLocalCiCheck } from '../pages-release.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const GH_ROOT = '/repos/whatisyourdreambro/my-salary-calculator';
const COMMIT = 'a'.repeat(40), OTHER = 'b'.repeat(40);

function localGithub({ localEnabled = 'true', mainSha = COMMIT, jobConclusion = 'success' } = {}) {
  const calls = [];
  const content = text => ({ type: 'file', encoding: 'base64', content: Buffer.from(text).toString('base64') });
  const get = async endpoint => {
    calls.push(endpoint);
    assert.ok(endpoint.startsWith(`${GH_ROOT}/`), endpoint);
    if (endpoint.endsWith('/actions/variables/PAGES_LOCAL_PUBLISH_ENABLED')) return { name: 'PAGES_LOCAL_PUBLISH_ENABLED', value: localEnabled };
    if (endpoint.endsWith('/actions/variables/PAGES_CLOUD_PUBLISH_ENABLED')) return { name: 'PAGES_CLOUD_PUBLISH_ENABLED', value: 'false' };
    if (endpoint.endsWith('/commits/main')) return { sha: mainSha };
    if (endpoint.endsWith('/actions/workflows/ci.yml')) return { id: 7, state: 'active', path: '.github/workflows/ci.yml' };
    if (endpoint.includes('/contents/.github/workflows/ci.yml?ref=')) return content(readFileSync(path.join(ROOT, '.github/workflows/ci.yml'), 'utf8'));
    if (endpoint.includes('/contents/scripts/lib/pages-release.mjs?ref=')) return content('export const PAGES_LOCAL_RELEASE_POLICY_VERSION = 1;');
    if (endpoint.includes('/contents/scripts/pages-release-local.mjs?ref=')) return content('export const PAGES_LOCAL_ORCHESTRATOR_VERSION = 1;');
    if (endpoint.includes('/actions/workflows/7/runs?')) return { workflow_runs: [{ id: 456, workflow_id: 7, event: 'push', head_branch: 'main', head_sha: COMMIT, status: 'completed', conclusion: jobConclusion }] };
    if (endpoint.includes('/actions/runs/456/jobs?')) return { jobs: [{ id: 789, name: 'verify', status: 'completed', conclusion: jobConclusion }] };
    throw new Error(`Unexpected offline API ${endpoint}`);
  };
  return { get, calls };
}

test('local recovery CI check passes with the local switch on and the cloud switch off, without reading the cloud switch', async () => {
  const github = localGithub();
  assert.deepEqual(await approvedLocalCiCheck(github.get, COMMIT), { runId: 456, jobId: 789, sha: COMMIT });
  assert.ok(github.calls.some(endpoint => endpoint.endsWith('/actions/variables/PAGES_LOCAL_PUBLISH_ENABLED')));
  assert.ok(!github.calls.some(endpoint => endpoint.includes('PAGES_CLOUD_PUBLISH_ENABLED')));
  assert.ok(!github.calls.some(endpoint => endpoint.includes('pages-cloud-dispatch.mjs') || endpoint.includes('pages-publish.yml')));
});

test('local recovery CI check still refuses a disabled local switch, a moved main and a failed verify job', async () => {
  await assert.rejects(approvedLocalCiCheck(localGithub({ localEnabled: 'false' }).get, COMMIT), /PAGES_LOCAL_PUBLISH_ENABLED/);
  await assert.rejects(approvedLocalCiCheck(localGithub({ mainSha: OTHER }).get, COMMIT), /Main changed/);
  await assert.rejects(approvedLocalCiCheck(localGithub({ jobConclusion: 'failure' }).get, COMMIT));
});

test('runApprovedLocalPagesRelease uses the local-mode check for both CI checks', () => {
  const source = readFileSync(path.join(ROOT, 'scripts/pages-release.mjs'), 'utf8');
  const body = source.slice(source.indexOf('export async function runApprovedLocalPagesRelease('));
  assert.match(body, /const checkCi = \(\) => approvedLocalCiCheck\(github\.get, commit\);/);
  assert.equal((body.match(/await checkCi\(\)/g) ?? []).length, 2, 'first check and the verifyLocal re-check');
  assert.doesNotMatch(source, /pagesPublicationReadiness\(github\.get\)/);
});
