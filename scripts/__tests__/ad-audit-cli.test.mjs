import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('a diff base cannot become a git option that silently bypasses the UI audit', () => {
  const script = fileURLToPath(new URL('../ad-audit.mjs', import.meta.url));
  for (const base of ['--stat', '--name-only', '--no-patch']) {
    const result = spawnSync(process.execPath, [script, '--diff', '--base', base], { encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /--base 값이 올바르지 않습니다/);
    assert.equal(result.stdout, '');
  }
});
