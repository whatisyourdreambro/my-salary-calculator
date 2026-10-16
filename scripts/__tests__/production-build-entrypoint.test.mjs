import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Execute the actual entrypoint in a disposable checkout with a fake adapter and
// verifier. A failed guard can never start the site's build or publish anything.
function fixture(t) {
  const cwd = mkdtempSync(path.join(tmpdir(), 'msy-production-entrypoint-'));
  const write = (relative, source) => {
    const filename = path.join(cwd, relative);
    mkdirSync(path.dirname(filename), { recursive: true }); writeFileSync(filename, source);
  };
  write('package.json', JSON.stringify({ private: true, scripts: {
    prebuild: 'node fixture-hook.cjs prebuild', build: 'node fixture-hook.cjs build', postbuild: 'node fixture-hook.cjs postbuild',
  } }));
  write('fixture-hook.cjs', `require('node:fs').appendFileSync('hooks.jsonl', JSON.stringify({hook:process.argv[2], nodeEnv:process.env.NODE_ENV, deferred:process.env.INDEXNOW_DEFER})+'\\n');`);
  write('scripts/verify-production-worker.mjs', `import fs from 'node:fs'; fs.appendFileSync('calls.jsonl', JSON.stringify({step:'verify'})+'\\n'); fs.writeFileSync('verified', 'yes');`);
  cpSync(new URL('../build-production-worker.mjs', import.meta.url), path.join(cwd, 'scripts/build-production-worker.mjs'));
  write('node_modules/@opennextjs/cloudflare/dist/cli/index.js', `
const fs = require('node:fs');
const step = process.argv[2];
fs.appendFileSync('calls.jsonl', JSON.stringify({step, args: process.argv.slice(2), env: {
  SKIP_NEXT_APP_BUILD: process.env.SKIP_NEXT_APP_BUILD,
  SKIP_WRANGLER_CONFIG_CHECK: process.env.SKIP_WRANGLER_CONFIG_CHECK,
  npm_config_ignore_scripts: process.env.npm_config_ignore_scripts,
  NODE_ENV: process.env.NODE_ENV, NEXT_PUBLIC_ADS_DISABLED: process.env.NEXT_PUBLIC_ADS_DISABLED,
  INDEXNOW_DEFER: process.env.INDEXNOW_DEFER, CF_DEPLOY_TARGET: process.env.CF_DEPLOY_TARGET,
}})+'\\n');
if (step === 'build' && process.env.FIXTURE_RUN_NPM === '1') {
  const result = require('node:child_process').spawnSync(process.execPath,
    [process.env.FIXTURE_NPM_CLI, '--offline', '--no-audit', '--no-fund', 'run', 'build'],
    {env:process.env, stdio:'inherit', windowsHide:true});
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}
if (step === 'build') process.exit(Number(process.env.FIXTURE_ADAPTER_EXIT || 0));
if (step === 'populateCache') process.exit(Number(process.env.FIXTURE_POPULATE_EXIT || 0));
process.exit(99);
`);
  t.after(() => {
    assert.equal(path.dirname(path.resolve(cwd)), path.resolve(tmpdir()));
    assert.match(path.basename(cwd), /^msy-production-entrypoint-/);
    rmSync(cwd, { recursive: true, force: true });
  });
  const baseEnv = { ...process.env };
  for (const key of Object.keys(baseEnv)) {
    if (/^(MSY_QA_MODE|MSY_QA_WORKER_STAGE|NEXT_PUBLIC_ADS_DISABLED|NODE_ENV|SKIP_NEXT_APP_BUILD|SKIP_WRANGLER_CONFIG_CHECK)$/i.test(key)
        || /^npm_config_ignore[-_]scripts$/i.test(key)) delete baseEnv[key];
  }
  return { cwd, write,
    run: (env = {}, args = []) => spawnSync(process.execPath, ['scripts/build-production-worker.mjs', ...args],
      { cwd, env: { ...baseEnv, ...env }, encoding: 'utf8', timeout: 15000, windowsHide: true }),
    spawned: () => existsSync(path.join(cwd, 'calls.jsonl')),
    calls: () => existsSync(path.join(cwd, 'calls.jsonl')) ? readFileSync(path.join(cwd, 'calls.jsonl'), 'utf8').trim().split('\n').map(JSON.parse) : [],
    verified: () => existsSync(path.join(cwd, 'verified')),
    read: relative => readFileSync(path.join(cwd, relative), 'utf8'),
  };
}

test('publication build refuses all QA flags before spawning an adapter or publication hook', t => {
  const f = fixture(t);
  for (const key of ['MSY_QA_MODE', 'MSY_QA_WORKER_STAGE', 'NEXT_PUBLIC_ADS_DISABLED']) {
    const result = f.run({ [key]: '1' });
    assert.equal(result.status, 1); assert.match(result.stderr, /Refusing a production build with QA settings/);
    assert.equal(f.spawned(), false); assert.equal(f.verified(), false);
  }
});

test('publication build refuses injected adapter arguments', t => {
  const f = fixture(t); const result = f.run({}, ['--skipNextBuild']);
  assert.equal(result.status, 1); assert.match(result.stderr, /does not accept command overrides/);
  assert.equal(f.spawned(), false);
});

for (const key of ['SKIP_NEXT_APP_BUILD', 'SKIP_WRANGLER_CONFIG_CHECK', 'npm_config_ignore_scripts', 'NPM_CONFIG_IGNORE_SCRIPTS', 'npm_config_ignore-scripts']) {
  test(`publication build fails before adapter launch for inherited ${key}`, t => {
    const f = fixture(t);
    for (const value of ['1', 'true', 'yes', 'TRUE', 'unexpected']) {
      const result = f.run({ [key]: value });
      assert.equal(result.status, 1, `${key}=${value}: ${result.stderr}`);
      assert.match(result.stderr, /complete Next build and lifecycle hooks are required/);
      assert.equal(f.spawned(), false); assert.equal(f.verified(), false);
    }
  });
}

test('production build rejects inherited non-production NODE_ENV before spawning', t => {
  const f = fixture(t);
  for (const value of ['test', 'development', 'staging']) {
    const result = f.run({ NODE_ENV: value });
    assert.equal(result.status, 1); assert.match(result.stderr, /non-production NODE_ENV/);
    assert.equal(f.spawned(), false);
  }
});

test('accepted build explicitly disables adapter skips and preserves production hooks', t => {
  const f = fixture(t);
  const result = f.run({ SKIP_NEXT_APP_BUILD: 'false', SKIP_WRANGLER_CONFIG_CHECK: '0', NPM_CONFIG_IGNORE_SCRIPTS: 'false' });
  assert.equal(result.status, 0, result.stderr);
  const calls = f.calls();
  assert.deepEqual(calls.map(call => call.step), ['build', 'populateCache', 'verify']);
  assert.deepEqual(calls[0].args, ['build', '--skipNextBuild=false', '--skipWranglerConfigCheck=false']);
  assert.deepEqual(calls[1].args, ['populateCache', 'local', '--config', 'wrangler.jsonc']);
  for (const call of calls.slice(0, 2)) assert.deepEqual(call.env, { SKIP_NEXT_APP_BUILD: '0', SKIP_WRANGLER_CONFIG_CHECK: '0', npm_config_ignore_scripts: 'false',
    NODE_ENV: 'production', NEXT_PUBLIC_ADS_DISABLED: '0', INDEXNOW_DEFER: '1', CF_DEPLOY_TARGET: 'workers' });
  assert.equal(f.verified(), true);
});

test('failed adapter build never reaches artifact verification', t => {
  const f = fixture(t); const result = f.run({ FIXTURE_ADAPTER_EXIT: '7' });
  assert.equal(result.status, 1); assert.match(result.stderr, /exited 7/);
  assert.equal(f.spawned(), true); assert.equal(f.verified(), false);
  assert.deepEqual(f.calls().map(call => call.step), ['build']);
});

test('failed local cache population never reaches artifact verification', t => {
  const f = fixture(t); const result = f.run({ FIXTURE_POPULATE_EXIT: '8' });
  assert.equal(result.status, 1); assert.match(result.stderr, /exited 8/);
  assert.deepEqual(f.calls().map(call => call.step), ['build', 'populateCache']);
  assert.deepEqual(f.calls()[1].args, ['populateCache', 'local', '--config', 'wrangler.jsonc']);
  assert.equal(f.verified(), false);
});

test('npm prebuild and postbuild really run despite project ignore-scripts config', t => {
  const f = fixture(t);
  const npm = [process.env.npm_execpath,
    path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
  ].find(candidate => candidate && existsSync(candidate));
  assert.ok(npm, 'Installed npm CLI is required for the offline lifecycle fixture');
  f.write('.npmrc', 'ignore-scripts=true\n');
  f.write('empty-user-npmrc', ''); f.write('empty-global-npmrc', '');
  const result = f.run({ FIXTURE_RUN_NPM: '1', FIXTURE_NPM_CLI: npm,
    npm_config_userconfig: path.join(f.cwd, 'empty-user-npmrc'), npm_config_globalconfig: path.join(f.cwd, 'empty-global-npmrc'),
    npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false' });
  assert.equal(result.status, 0, result.stderr);
  const hooks = f.read('hooks.jsonl').trim().split('\n').map(JSON.parse);
  assert.deepEqual(hooks, ['prebuild', 'build', 'postbuild'].map(hook => ({ hook, nodeEnv: 'production', deferred: '1' })));
  assert.deepEqual(f.calls().map(call => call.step), ['build', 'populateCache', 'verify']);
  assert.equal(f.verified(), true);
});
