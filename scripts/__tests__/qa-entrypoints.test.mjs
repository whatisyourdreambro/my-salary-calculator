import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = fileURLToPath(new URL('../..', import.meta.url));
function command(script, args, env = {}) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: root, env: { ...process.env, ...env }, encoding: 'utf8', timeout: 20000, windowsHide: true,
  });
}

test('QA server refuses arbitrary commands, interface overrides and invalid ports before starting Next', () => {
  for (const args of [['unverified-cloudflare-preview'], ['dev', '--hostname', '0.0.0.0'],
    ['dev', '--port', '80'], ['dev', '--port', '70000'], ['build', '--port', '3100']]) {
    const result = command('scripts/qa-server.mjs', args);
    assert.equal(result.status, 1, JSON.stringify(args));
    assert.match(result.stderr, /Use qa:dev|Only --port|QA port must/);
    assert.doesNotMatch(result.stdout, /Ready|Starting/);
  }
});

test('ordinary QA overrides an inherited Cloudflare staging flag and preserves production output', t => {
  const cwd = mkdtempSync(path.join(tmpdir(), 'msy-qa-next-fixture-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(cwd)), path.resolve(tmpdir()));
    assert.match(path.basename(cwd), /^msy-qa-next-fixture-/);
    rmSync(cwd, { recursive: true, force: true });
  });
  const write = (relative, contents) => {
    const filename = path.join(cwd, relative);
    mkdirSync(path.dirname(filename), { recursive: true }); writeFileSync(filename, contents);
  };
  write('scripts/.keep', '');
  cpSync(new URL('../qa-server.mjs', import.meta.url), path.join(cwd, 'scripts/qa-server.mjs'));
  write('.next/sentinel.txt', 'production must remain unchanged');
  // Fake the Next CLI only. Read the real configuration in the child environment
  // without invoking Next, serving pages, or executing any generated code.
  write('node_modules/next/dist/bin/next.js', `
const fs=require('node:fs');
(async()=>{
  const {default:config}=await import(${JSON.stringify(new URL('../../next.config.mjs', import.meta.url).href)});
  fs.mkdirSync(config.distDir,{recursive:true});
  fs.appendFileSync('observed.jsonl',JSON.stringify({mode:process.argv[2],distDir:config.distDir,
    stage:process.env.MSY_QA_WORKER_STAGE,qa:process.env.MSY_QA_MODE,ads:process.env.NEXT_PUBLIC_ADS_DISABLED})+'\\n');
})().catch(error=>{console.error(error);process.exitCode=1});
`);
  for (const mode of ['build', 'dev', 'start']) {
    const result = spawnSync(process.execPath, ['scripts/qa-server.mjs', mode], {
      cwd, env: { ...process.env, MSY_QA_WORKER_STAGE: '1', MSY_QA_MODE: '0', NEXT_PUBLIC_ADS_DISABLED: '0' },
      encoding: 'utf8', timeout: 20000, windowsHide: true,
    });
    assert.equal(result.status, 0, result.stderr);
  }
  const observed = readFileSync(path.join(cwd, 'observed.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  assert.deepEqual(observed, ['build', 'dev', 'start'].map(mode => ({ mode, distDir: '.next-qa', stage: '0', qa: '1', ads: '1' })));
  assert.equal(JSON.parse(readFileSync(path.join(cwd, '.next-qa/moneysalary-qa-build.json'), 'utf8')).adsDisabled, true);
  assert.deepEqual(readdirSync(path.join(cwd, '.next')), ['sentinel.txt']);
  assert.equal(readFileSync(path.join(cwd, '.next/sentinel.txt'), 'utf8'), 'production must remain unchanged');
});

test('QA runner cannot execute archived or arbitrary scripts', () => {
  for (const target of ['scripts/qa-server.mjs', 'docs/revenue-audit-2026-09-08/english-exposure-content-ui-qa.mjs',
    'docs/nonexistent-retired-audit.mjs', '../unmaintained-qa.mjs']) {
    const result = command('scripts/qa-run.mjs', [target]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /not in the maintained allowlist/);
  }
  const extra = command('scripts/qa-run.mjs', ['scripts/ad-depth-audit.mjs', '--unsafe-option']);
  assert.equal(extra.status, 1);
  assert.match(extra.stderr, /do not accept extra arguments/);
});

test('maintained browser entry rejects a production URL without launching a browser', () => {
  const result = command('scripts/qa-run.mjs', ['scripts/ad-depth-audit.mjs'], {
    BASE_URL: 'https://www.moneysalary.com',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /live\/preview sites are forbidden/);
  assert.doesNotMatch(result.stdout, /Chromium|browser launched/);
});
