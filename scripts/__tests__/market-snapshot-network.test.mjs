import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

test('snapshot request failures redact API keys and never replace the last valid snapshot', () => {
  const before = readFileSync(new URL('../../src/data/marketSnapshot.json', import.meta.url));
  const fakeKey = 'synthetic_key_not_a_real_secret';
  const stub = `globalThis.fetch = async (url, init) => {
    if (!(init.signal instanceof AbortSignal) || init.redirect !== 'error') {
      process.stderr.write('MISSING_NETWORK_GUARD'); process.exit(77);
    }
    throw new Error('Synthetic transport failure for ' + url);
  };`;
  const result = spawnSync(process.execPath, ['--import', 'tsx', '--import',
    `data:text/javascript;base64,${Buffer.from(stub).toString('base64')}`,
    'scripts/fetch-market-snapshot.ts', '--dry-run'], {
    cwd: new URL('../..', import.meta.url), encoding: 'utf8', timeout: 10000,
    env: { ...process.env, RONE_API_KEY: fakeKey, ECOS_API_KEY: fakeKey },
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 2, result.stderr);
  assert.ok((result.stdout + result.stderr).includes('Synthetic transport failure'));
  assert.ok(!(result.stdout + result.stderr).includes(fakeKey));
  assert.deepEqual(readFileSync(new URL('../../src/data/marketSnapshot.json', import.meta.url)), before);
});
