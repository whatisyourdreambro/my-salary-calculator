import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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

test('QA runner cannot execute archived or arbitrary scripts', () => {
  for (const target of ['scripts/qa-server.mjs', 'docs/revenue-audit-2026-09-08/english-exposure-content-ui-qa.mjs']) {
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
