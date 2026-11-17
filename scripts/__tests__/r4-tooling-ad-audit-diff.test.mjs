// R4 TOOLING (2026-11-18, unverified hint scripts-b01-M01): ad-audit --diff must flag a new multi-line JSX block inserted
// directly above an existing ad. Before this change the 2-line look-ahead started at each added JSX line, so a 3-line
// paragraph or a Prettier-style multi-line component right above the ad used up the window with its own lines and
// passed CI. Each case builds a throwaway git repo with a copy of scripts/ad-audit.mjs (no network, no server).
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = process.env.AD_AUDIT_SCRIPT_UNDER_TEST || fileURLToPath(new URL('../ad-audit.mjs', import.meta.url));

const page = (aboveAd) => [
  'import { CalcResultAd } from "@/components/AdPlacement";',
  '',
  'export default function Page() {',
  '  return (',
  '    <main>',
  '      <h1>Title</h1>',
  ...aboveAd,
  '      <CalcResultAd />',
  '      <footer>end</footer>',
  '    </main>',
  '  );',
  '}',
  '',
].join('\n');

const BASE = page(['      <p className="text-sm">', '        old notice text', '      </p>']);

function runCase(t, edited, { allow } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'r4-ad-audit-diff-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(tmpdir()));
    rmSync(root, { recursive: true, force: true });
  });
  const git = (...args) => {
    const result = spawnSync('git', ['-c', 'core.autocrlf=false', '-c', 'core.safecrlf=false', '-c', 'user.name=r4-test', '-c', 'user.email=r4-test@example.invalid', '-c', 'commit.gpgsign=false', ...args], { cwd: root, encoding: 'utf8', windowsHide: true });
    assert.equal(result.status, 0, result.stderr);
  };
  mkdirSync(path.join(root, 'scripts'), { recursive: true });
  mkdirSync(path.join(root, 'src', 'app', 'x'), { recursive: true });
  copyFileSync(SCRIPT, path.join(root, 'scripts', 'ad-audit.mjs'));
  if (allow) writeFileSync(path.join(root, 'scripts', 'ad-audit-allow.json'), JSON.stringify(allow));
  writeFileSync(path.join(root, 'src', 'app', 'x', 'page.tsx'), BASE);
  git('init', '-q');
  git('add', '-A');
  git('commit', '-q', '-m', 'base');
  writeFileSync(path.join(root, 'src', 'app', 'x', 'page.tsx'), edited);
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', 'ad-audit.mjs'), '--diff'], {
    cwd: root, encoding: 'utf8', timeout: 60000, windowsHide: true, env: { ...process.env, CI: '' },
  });
  return { status: result.status, out: result.stdout + result.stderr };
}

const keep = ['      <p className="text-sm">', '        old notice text', '      </p>'];

test('(a) a new 3-line paragraph directly above the ad is an ERROR', t => {
  const { status, out } = runCase(t, page([...keep, '      <p className="text-sm">', '        new notice text', '      </p>']));
  assert.equal(status, 1, out);
  assert.match(out, /ERROR {2}src\/app\/x\/page\.tsx:\d+ 광고 <CalcResultAd>\(:\d+\) 직상단에 새 UI 삽입 \(<p className="text-sm">/);
});

test('(b) a new Prettier-style multi-line component directly above the ad is an ERROR', t => {
  const { status, out } = runCase(t, page([...keep, '      <ShareNote', '        title="x"', '      />']));
  assert.equal(status, 1, out);
  assert.match(out, /직상단에 새 UI 삽입 \(<ShareNote/);
});

test('(c) the same paragraph on one line is still an ERROR', t => {
  const { status, out } = runCase(t, page([...keep, '      <p className="text-sm">new notice text</p>']));
  assert.equal(status, 1, out);
});

test('(d) a wrapper with an inner component is still an ERROR', t => {
  const { status, out } = runCase(t, page([...keep, '      <div>', '        <Foo />', '      </div>']));
  assert.equal(status, 1, out);
});

test('(e) a text-only edit inside the existing paragraph directly above the ad passes', t => {
  const { status, out } = runCase(t, page(['      <p className="text-sm">', '        corrected notice text', '      </p>']));
  assert.equal(status, 0, out);
  assert.doesNotMatch(out, /^ERROR {2}/m);
  assert.match(out, /결과: ERROR 0건/);
});

test('(f) a block that ends three or more lines above the ad stays out of the 2-line gate', t => {
  const { status, out } = runCase(t, page(['      <section>', '        <p>new</p>', '      </section>', ...keep]));
  assert.equal(status, 0, out);
});

test('(g) a JSX comment between the block and the ad does not hide it', t => {
  const { status, out } = runCase(t, page([...keep, '      <p className="text-sm">', '        new notice text', '      </p>', '      {/* result ad */}']));
  assert.equal(status, 1, out);
});

test('(h) an owner-approved allowlist entry exempts a multi-line block (any JSX line of the block may match)', t => {
  const allow = [{ file: 'src/app/x/page.tsx', pattern: '^<p className="text-sm">$', reason: 'test', approvalId: 'TEST 2026-11-18' }];
  const { status, out } = runCase(t, page([...keep, '      <p className="text-sm">', '        new notice text', '      </p>']), { allow });
  assert.equal(status, 0, out);
  assert.match(out, /승인 면제\] src\/app\/x\/page\.tsx:\d+ <CalcResultAd> 직상단 — approvalId TEST 2026-11-18/);
});
