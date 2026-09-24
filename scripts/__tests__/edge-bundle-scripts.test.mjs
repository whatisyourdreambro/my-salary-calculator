// scripts/verify-edge-bundle.mjs · scripts/check-worker-size.mjs 픽스처 테스트 (2026-09-25 B1)
// 실행: node --test scripts/__tests__/edge-bundle-scripts.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPTS = fileURLToPath(new URL('..', import.meta.url));
const run = (script, arg) => spawnSync(process.execPath, [join(SCRIPTS, script), arg], { encoding: 'utf8' });

/** 가짜 .next — edge 청크 1개 + 매니페스트가 배정한 route 1개, 각각 소스맵 포함 */
function fakeNext({ chunkSources, routeSources }) {
  const dir = mkdtempSync(join(tmpdir(), 'edge-bundle-'));
  mkdirSync(join(dir, 'server', 'edge-chunks'), { recursive: true });
  mkdirSync(join(dir, 'server', 'app', 'widget', 'dsr'), { recursive: true });
  writeFileSync(join(dir, 'server', 'edge-chunks', '901.js'), '');
  writeFileSync(join(dir, 'server', 'edge-chunks', '901.js.map'), JSON.stringify({ version: 3, sources: chunkSources }));
  writeFileSync(join(dir, 'server', 'app', 'widget', 'dsr', 'route.js'), '');
  writeFileSync(join(dir, 'server', 'app', 'widget', 'dsr', 'route.js.map'), JSON.stringify({ version: 3, sources: routeSources }));
  writeFileSync(
    join(dir, 'server', 'middleware-manifest.json'),
    JSON.stringify({
      version: 3,
      middleware: {},
      functions: {
        '/widget/dsr/route': { page: '/widget/dsr/route', files: ['server/middleware-build-manifest.js', 'server/app/widget/dsr/route.js'] },
        '/glossary/[slug]/page': { page: '/glossary/[slug]/page', files: ['server/edge-chunks/901.js'] },
      },
    }),
  );
  return dir;
}

test('verify-edge-bundle: searchIndex in a shared edge chunk fails with the owning routes', (t) => {
  const dir = fakeNext({
    chunkSources: ['webpack://_N_E/./src/components/Header.tsx', 'webpack://_N_E/./src/lib/searchIndex.ts'],
    routeSources: ['webpack://_N_E/./src/app/widget/dsr/route.ts'],
  });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const r = run('verify-edge-bundle.mjs', dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /FAIL {2}server\/edge-chunks\/901\.js \(사용: \/glossary\/\[slug\]\/page\)/);
  assert.match(r.stdout, /\.\/src\/lib\/searchIndex\.ts/);
});

test('verify-edge-bundle: simpleCalculators in a route bundle (manifest file) fails', (t) => {
  const dir = fakeNext({
    chunkSources: ['webpack://_N_E/./src/components/Header.tsx'],
    routeSources: ['webpack://_N_E/./src/app/widget/dsr/route.ts', 'webpack://_N_E/./src/lib/simpleCalculators/batch1.ts'],
  });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const r = run('verify-edge-bundle.mjs', dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /server\/app\/widget\/dsr\/route\.js \(사용: \/widget\/dsr\/route\)/);
});

test('verify-edge-bundle: clean bundle passes and company/guide data is INFO only', (t) => {
  const dir = fakeNext({
    chunkSources: [
      'webpack://_N_E/./src/components/header/HeaderSearch.tsx',
      'webpack://_N_E/./src/data/krCompanies_Batch2.ts',
      'webpack://_N_E/./src/lib/guidesMeta.generated.ts',
      'webpack://_N_E/./src/lib/widgets/dsrLimit.ts',
    ],
    routeSources: ['webpack://_N_E/./src/app/widget/dsr/route.ts'],
  });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const r = run('verify-edge-bundle.mjs', dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /INFO .*krCompanies_Batch 1개/);
  assert.match(r.stdout, /INFO .*guidesMeta\.generated 1개/);
  assert.match(r.stdout, /금지 모듈 0건/);
});

test('verify-edge-bundle: missing build output is not a pass', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'edge-bundle-empty-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  assert.equal(run('verify-edge-bundle.mjs', dir).status, 1);
});

test('check-worker-size: sums gzip per file, skips nop-build-log.json, exits 0', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'worker-size-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, '__next-on-pages-dist__', 'functions'), { recursive: true });
  writeFileSync(join(dir, 'index.js'), 'export default {};\n'.repeat(100));
  writeFileSync(join(dir, '__next-on-pages-dist__', 'functions', 'a.func.js'), 'x'.repeat(5000));
  writeFileSync(join(dir, 'nop-build-log.json'), '{}');
  const r = run('check-worker-size.mjs', dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /파일 2개 \(nop-build-log\.json 제외\)/);
  assert.match(r.stdout, /__next-on-pages-dist__\/functions\/a\.func\.js/);
  assert.match(r.stdout, /OK {2}경고선까지 여유/);
});

test('check-worker-size: missing output directory exits 1', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'worker-size-missing-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  assert.equal(run('check-worker-size.mjs', join(dir, 'nope')).status, 1);
});
