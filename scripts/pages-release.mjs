// Maintained GitHub-main Pages publisher. No import-time credentials or network.
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyArtifact } from './lib/pages-export.mjs';
import { verifyPagesAdvertising } from './verify-pages-advertising.mjs';
import { main as purgePages } from './cf-purge-after-deploy.mjs';
import { assertReleaseContext, pagesUploadArgs, publicationEnvironment, publishPages, PAGES_PROJECT, RELEASE_REPOSITORY,
  classifyUploadOutput, controlPlaneFailure, pagesPurgeEnvironment } from './lib/pages-release.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
export function assertConfiglessDirectory(directory) {
  assert.equal(realpathSync(directory), path.resolve(directory)); assert.equal(lstatSync(directory).isSymbolicLink(), false);
  for (let current = directory;; current = path.dirname(current)) {
    for (const file of ['wrangler.toml', 'wrangler.json', 'wrangler.jsonc', '.wrangler/deploy/config.json'])
      assert.equal(existsSync(path.join(current, file)), false, 'A Wrangler config would be inherited');
    if (current === path.dirname(current)) break;
  }
  assert.equal(existsSync(path.join(directory, 'functions')), false);
}

export function createReleaseApi(env, fetchFn = globalThis.fetch) {
  assert.match(env.CF_ACCOUNT_ID || '', /^[a-f0-9]{32}$/);
  assert.ok(env.CF_API_TOKEN && !/\s/.test(env.CF_API_TOKEN));
  const endpoint = `/accounts/${env.CF_ACCOUNT_ID}/pages/projects/${PAGES_PROJECT}`;
  const get = async (origin, resource, token, phase, github = false) => {
    let response, data;
    try {
      response = await fetchFn(origin + resource, { method: 'GET', redirect: 'error', signal: AbortSignal.timeout(20000),
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'User-Agent': 'MoneySalary-Pages-release/1.0' } });
    } catch { throw controlPlaneFailure(phase, 'transport'); }
    try { data = await response.json(); }
    catch { throw controlPlaneFailure(phase, 'invalid-json', response); }
    if (!response.ok || (!github && data?.success !== true)) throw controlPlaneFailure(phase, 'api-response', response, data);
    return data;
  };
  const cf = (resource, phase) => get('https://api.cloudflare.com/client/v4', resource, env.CF_API_TOKEN, phase);
  return {
    readMain: async () => {
      assert.ok(env.GITHUB_TOKEN && !/\s/.test(env.GITHUB_TOKEN));
      return (await get('https://api.github.com', `/repos/${RELEASE_REPOSITORY}/git/ref/heads/main`, env.GITHUB_TOKEN, 'read-main', true)).object?.sha;
    },
    readProject: async () => (await cf(endpoint, 'read-project')).result,
    readDeployment: async id => { assert.match(id, /^[a-f0-9-]{36}$/); return (await cf(`${endpoint}/deployments/${id}`, 'read-deployment')).result; },
    listDeployments: async () => {
      const rows = [];
      for (let page = 1; page <= 50; page++) {
        const data = await cf(`${endpoint}/deployments?env=production&page=${page}`, 'list-deployments');
        assert.ok(Array.isArray(data.result)); assert.equal(data.result_info?.page, page);
        assert.ok(Number.isInteger(data.result_info.total_pages) && data.result_info.total_pages >= 0 && data.result_info.total_pages <= 50);
        rows.push(...data.result); if (page >= data.result_info.total_pages) return rows;
      }
      throw new Error('Deployment history exceeds bounded reconciliation');
    },
  };
}

export async function runPagesRelease(env = process.env) {
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const local = () => ({ commit: git(['rev-parse', 'HEAD']).trim(), status: git(['status', '--porcelain=v1', '-z', '--untracked-files=all']) });
  const commit = assertReleaseContext(env, local());
  const purgeEnv = pagesPurgeEnvironment(env, commit);
  assert.equal(git(['ls-files', '--error-unmatch', '.env.production']).trim(), '.env.production');
  const { stage, marker } = verifyArtifact(root, 'production', env); verifyPagesAdvertising(stage);
  const dist = path.join(stage, 'dist');
  assert.equal(path.basename(stage), '.pages-build'); assert.equal(realpathSync(dist), path.resolve(dist));
  assert.equal(lstatSync(dist).isSymbolicLink(), false);
  const api = createReleaseApi(env);
  const receipt = path.join(root, '.artifacts/pages-release'); mkdirSync(receipt, { recursive: true });
  const stateFile = path.join(receipt, 'release-state.json');
  assert.equal(existsSync(stateFile), false, 'An attempt receipt already exists; reconcile instead of retrying');
  assert.equal(existsSync(path.join(receipt, 'production-pins.json')), false);
  // Exclusive claim precedes remote mutation; raw CLI output is never persisted.
  writeFileSync(stateFile, JSON.stringify({ phase: 'claimed', commit }) + '\n', { flag: 'wx' });
  const save = name => value => writeFileSync(path.join(receipt, name), JSON.stringify(value, null, 2) + '\n');
  const require = createRequire(path.join(root, 'package.json'));
  const cli = path.join(path.dirname(require.resolve('wrangler/package.json')), 'bin/wrangler.js');
  const cwd = mkdtempSync(path.join(os.tmpdir(), 'msy-pages-auto-release-'));
  try {
    assertConfiglessDirectory(cwd);
    const childEnv = publicationEnvironment(env, cwd);
    const upload = () => new Promise(resolve => {
      const child = spawn(process.execPath, pagesUploadArgs(cli, dist, commit), {
        cwd, env: childEnv, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
      });
      let bytes = 0, termination = 'none';
      const output = [];
      const capture = chunk => {
        bytes += chunk.length;
        if (bytes <= 4 * 1024 * 1024) output.push(chunk);
        else { termination = 'output-limit'; child.kill(); }
      };
      child.stdout.on('data', capture); child.stderr.on('data', capture);
      const timer = setTimeout(() => { termination = 'timeout'; child.kill(); }, 30 * 60 * 1000);
      child.once('error', () => { termination = 'spawn-error'; });
      child.once('close', code => {
        clearTimeout(timer);
        // No raw CLI output leaves this bounded in-memory buffer. Retain only
        // fixed classifications and numeric status/error codes, never messages.
        const diagnostics = classifyUploadOutput(Buffer.concat(output).toString('utf8'), termination, bytes);
        output.length = 0;
        resolve({ code: termination === 'none' ? code : -1, diagnostics });
      });
    });
    return await publishPages({ commit, marker }, { ...api, upload,
      verifyLocal: async () => {
        assertReleaseContext(env, local());
        const current = verifyArtifact(root, 'production', env); assert.equal(current.marker.outputHash, marker.outputHash);
        verifyPagesAdvertising(current.stage);
      },
      purge: hooks => purgePages(purgeEnv, hooks),
      saveState: save('release-state.json'), savePins: save('production-pins.json'),
    });
  } finally {
    // Delete only this verified task-owned temporary directory, never build assets.
    if (path.dirname(cwd) === realpathSync(os.tmpdir()) && path.basename(cwd).startsWith('msy-pages-auto-release-')
      && realpathSync(cwd) === cwd) rmSync(cwd, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.deepEqual(process.argv.slice(2), ['--publish']);
  try {
    const pins = await runPagesRelease();
    console.log(JSON.stringify({ deploymentId: pins.deploymentId, commit: pins.commit, purgeVerified: true, next: 'verify-pages-release-http' }));
  } catch { console.error('Pages publication stopped. Inspect sanitized .artifacts/pages-release receipts; no automatic retry or rollback.'); process.exitCode = 1; }
}
