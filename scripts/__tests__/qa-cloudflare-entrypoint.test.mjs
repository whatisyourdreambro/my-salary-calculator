import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
test('Cloudflare QA rejects remote operations and arbitrary options before any build or server starts', () => {
  for (const args of [['deploy'], ['preview'], ['start', '--remote'], ['build', '--config', 'production.json'],
    ['start', '--port', '80'], ['start', '--ip', '0.0.0.0'], ['check', '--upload']]) {
    const r = spawnSync(process.execPath, ['scripts/qa-cloudflare.mjs', ...args], { cwd: root, encoding: 'utf8', timeout: 10000, windowsHide: true });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /remote operations are forbidden|Only start --port|QA port must/);
    assert.doesNotMatch(r.stdout, /Building|Ready|Total Upload/);
  }
});
