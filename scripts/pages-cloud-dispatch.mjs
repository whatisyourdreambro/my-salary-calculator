// Explicit human-approved handoff. Cloud runners complete publication after this process exits.
// Never reads a Cloudflare credential, visits publisher pages, or retries a dispatch.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PAGES_CLOUD_DISPATCH_VERSION = 1;
const REPO = 'whatisyourdreambro/my-salary-calculator';
const PREFIX = `/repos/${REPO}`;
const SHA = /^[a-f0-9]{40}$/;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function cloudDispatchApi({ env = process.env, fetchFn = globalThis.fetch, credential = spawnSync } = {}) {
  let token;
  return async (resource, method = 'GET', body) => {
    assert.ok(resource.startsWith(PREFIX + '/') && !/[\r\n#]/.test(resource));
    assert.ok(method === 'GET' || (method === 'POST' && resource === PREFIX + '/actions/workflows/pages-publish.yml/dispatches'));
    if (!token) {
      token = env.GITHUB_TOKEN || env.GH_TOKEN;
      if (!token) {
        const result = credential('git', ['credential', 'fill'], {
          cwd: root, input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', timeout: 20_000,
          windowsHide: true, stdio: ['pipe', 'pipe', 'ignore'],
          env: { ...env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
        });
        assert.equal(result.status, 0, 'Existing GitHub credential unavailable; raw output withheld');
        token = /^password=(.+)$/m.exec(result.stdout || '')?.[1]?.trim();
      }
      assert.ok(typeof token === 'string' && token.length > 0 && !/\s/.test(token));
    }
    let response;
    try {
      response = await fetchFn('https://api.github.com' + resource, {
        method, redirect: 'error', signal: AbortSignal.timeout(30_000),
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'MoneySalary-approved-publication/1.0' },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch { throw new Error('GitHub request outcome unavailable; raw details withheld. Do not retry a dispatch.'); }
    assert.equal(response.status, method === 'POST' ? 204 : 200, `GitHub operation failed: HTTP ${response.status}`);
    if (method === 'POST') return null;
    const data = await response.text();
    assert.ok(data.length < 2_000_000, 'GitHub response too large');
    return JSON.parse(data);
  };
}

export async function dispatchApprovedCloudRelease({ commit, articleSlug = '', articleMarker = '', retirementTo = '' }, {
  api = cloudDispatchApi(), reserve, persist,
} = {}) {
  assert.match(commit || '', SHA, 'Use the full human-approved commit');
  assert.match(articleSlug, /^(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/);
  assert.ok(articleSlug.length <= 160 && articleMarker.length <= 500 && !/[\u0000-\u001f]/.test(articleMarker));
  assert.ok(!articleMarker || articleSlug, 'Article marker requires slug');
  assert.ok(!articleSlug || articleMarker || retirementTo, 'Article requires its approved marker or retirement target');
  assert.ok(!retirementTo || (articleSlug && !articleMarker && /^\/(?:[a-z0-9-]+\/)*[a-z0-9-]*$/.test(retirementTo)
    && retirementTo.replace(/\/$/, '') !== '/guides/' + articleSlug), 'Invalid retirement target');
  assert.equal(typeof reserve, 'function'); assert.equal(typeof persist, 'function');
  const enabled = await api(PREFIX + '/actions/variables/PAGES_CLOUD_PUBLISH_ENABLED');
  assert.equal(enabled.name, 'PAGES_CLOUD_PUBLISH_ENABLED'); assert.equal(enabled.value, 'true');
  assert.equal((await api(PREFIX + '/commits/main')).sha, commit, 'Approved commit must still be main');
  const workflow = await api(PREFIX + '/actions/workflows/pages-publish.yml');
  assert.equal(workflow.path, '.github/workflows/pages-publish.yml'); assert.equal(workflow.state, 'active');
  const receipt = { schemaVersion: 1, commit, approved: true, articleSlug, articleMarker, retirementTo,
    phase: 'dispatching', startedAt: new Date().toISOString(), automaticRetry: false,
    cloudflareCredentialUsed: false, localPublication: false,
    workflowUrl: `https://github.com/${REPO}/actions/workflows/pages-publish.yml` };
  reserve(receipt); // exclusive reservation BEFORE mutation; an ambiguous response is never replayed
  try {
    await api(PREFIX + '/actions/workflows/pages-publish.yml/dispatches', 'POST', {
      ref: 'main', inputs: { approved_commit: commit, article_slug: articleSlug,
        article_marker: articleMarker, retirement_to: retirementTo },
    });
    receipt.phase = 'queued'; receipt.acceptedAt = new Date().toISOString(); persist(receipt);
    return receipt;
  } catch {
    receipt.phase = 'dispatch-unconfirmed'; persist(receipt);
    throw new Error('Dispatch not confirmed. Inspect GitHub Actions before any retry; source remains available.');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const allowed = new Set(['--approved-commit', '--article-slug', '--article-marker', '--retirement-to']);
  const values = {};
  for (let i = 0; i < args.length; i += 2) {
    assert.ok(allowed.has(args[i]) && args[i + 1] && !Object.hasOwn(values, args[i]));
    values[args[i]] = args[i + 1];
  }
  const commit = values['--approved-commit']; assert.match(commit || '', SHA);
  let directory = realpathSync(root);
  for (const name of ['.artifacts', 'pages-cloud-dispatch', commit]) {
    directory = path.join(directory, name);
    if (!existsSync(directory)) mkdirSync(directory);
    assert.ok(lstatSync(directory).isDirectory() && !lstatSync(directory).isSymbolicLink());
    assert.equal(realpathSync(directory), directory, 'Receipt directory escapes the workspace');
  }
  const target = path.join(directory, 'dispatch.json');
  const write = (value, flag = 'w') => writeFileSync(target, JSON.stringify(value, null, 2) + '\n', { flag });
  const receipt = await dispatchApprovedCloudRelease({ commit, articleSlug: values['--article-slug'] || '',
    articleMarker: values['--article-marker'] || '', retirementTo: values['--retirement-to'] || '' }, {
    reserve: value => write(value, 'wx'), persist: value => write(value),
  });
  assert.equal(JSON.parse(readFileSync(target, 'utf8')).phase, 'queued');
  console.log(JSON.stringify({ queued: true, published: false, commit, workflowUrl: receipt.workflowUrl,
    message: 'Cloud execution accepted. This computer may be turned off. Publication completes only when the workflow succeeds.' }));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => { console.error('Approved cloud dispatch stopped. Inspect the commit receipt and Actions; no automatic retry.'); process.exitCode = 1; });
}
