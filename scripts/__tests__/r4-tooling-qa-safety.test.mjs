// R4 TOOLING (2026-11-18, N2-scripts-03 / scripts-b07-F01): verify-qa-safety rejects a raw fetch in ANY
// top-level scripts/qa-* file, not only the five named HTTP QA scripts. Runs the real gate against a
// minimal temp fixture (no server, no network); the fixture is removed afterwards.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

function fixture(t) {
  const cwd = mkdtempSync(path.join(tmpdir(), 'msy-qa-safety-fixture-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(cwd)), path.resolve(tmpdir()));
    rmSync(cwd, { recursive: true, force: true });
  });
  const write = (relative, contents) => {
    const filename = path.join(cwd, relative);
    mkdirSync(path.dirname(filename), { recursive: true });
    writeFileSync(filename, contents);
  };
  cpSync(path.join(repoRoot, 'scripts', 'verify-qa-safety.mjs'), path.join(cwd, 'scripts', 'verify-qa-safety.mjs'));
  for (const relative of ['scripts/qa-crawl.ts', 'scripts/qa-english.ts', 'scripts/qa-calculator-routes.mjs',
    'scripts/qa-cloudflare-http.mjs', 'scripts/qa-pages-http.mjs']) {
    write(relative, 'export const run = (url) => fetchQaDocument(url);\n');
  }
  for (const relative of ['scripts/trend-publish/verify-prod.mjs', 'scripts/naver-template-panel.ts',
    'scripts/indexnow-ping.mjs', 'scripts/health-check.mjs', 'scripts/crawl-cache-sampler.mjs']) {
    write(relative, "// uses ./lib/qa-production-http.cjs\nexport const run = (url) => fetchProductionQaDocument(url);\n");
  }
  write('scripts/trend-publish/publish-approved.mjs', 'export {};\n');
  write('lighthouserc.cjs', '// qa-safety.cjs qa:start blockedUrlPatterns\nmodule.exports = {};\n');
  write('package.json', JSON.stringify({
    scripts: {
      dev: 'node scripts/qa-server.mjs dev', 'qa:dev': 'node scripts/qa-server.mjs dev',
      'qa:build': 'node scripts/qa-server.mjs build', 'qa:start': 'node scripts/qa-server.mjs start',
      'qa:crawl': 'node scripts/qa-run.mjs scripts/qa-crawl.ts', 'qa:english': 'node scripts/qa-run.mjs scripts/qa-english.ts',
      'ad-depth': 'node scripts/qa-run.mjs scripts/ad-depth-audit.mjs',
    },
  }));
  const run = () => {
    const result = spawnSync(process.execPath, [path.join(cwd, 'scripts', 'verify-qa-safety.mjs')], {
      cwd, encoding: 'utf8', timeout: 20000, windowsHide: true,
    });
    return { status: result.status, report: JSON.parse(result.stdout) };
  };
  return { write, run };
}

test('the fixture without extra QA files passes the gate', t => {
  const { run } = fixture(t);
  const { status, report } = run();
  assert.deepEqual(report.violations, []);
  assert.equal(status, 0);
});

test('a new or copied scripts/qa-* file with a raw fetch fails the gate (mjs and ts)', t => {
  const { write, run } = fixture(t);
  write('scripts/qa-tmp-probe.mjs', "await fetch('http://127.0.0.1:1/');\n");
  write('scripts/qa-crawl-copy.ts', 'const res = await fetch (`${BASE_URL}/`, { redirect: "follow" });\n');
  const { status, report } = run();
  assert.equal(status, 1);
  assert.ok(report.violations.includes('scripts/qa-tmp-probe.mjs: QA HTTP must use fetchQaDocument from scripts/lib/qa-safety.cjs, not raw fetch'));
  assert.ok(report.violations.includes('scripts/qa-crawl-copy.ts: QA HTTP must use fetchQaDocument from scripts/lib/qa-safety.cjs, not raw fetch'));
});

test('guarded helpers named fetchQaDocument do not count as a raw fetch', t => {
  const { write, run } = fixture(t);
  write('scripts/qa-new-check.mjs', "const res = await fetchQaDocument('http://127.0.0.1:3000/');\n");
  const { status, report } = run();
  assert.deepEqual(report.violations, []);
  assert.equal(status, 0);
});

test('the unguarded crawler copy is gone from the repository', () => {
  assert.equal(existsSync(path.join(repoRoot, 'scripts', 'qa-crawl-local.ts')), false);
});
