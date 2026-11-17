// R4 TOOLING (2026-11-18, N2-scripts-04): QA runners that always exited 1.
// (1) scripts-b01-F01: ad-depth DEFAULT_ROUTES must not name a redirect source (the guarded QA context aborts
//     every 3xx, so a redirecting default route is a permanent load failure). Static text check only: the
//     audit script launches a browser, so it is read as text, never imported or run here.
// (2) scripts-b07-F03: qa-number-inputs reviewed non-money allowlist is keyed by file plus id/value, and any
//     other ungrouped money input still fails. Runs the real script against a temp fixture (no network).
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const read = (relative) => readFileSync(path.join(repoRoot, relative), 'utf8');

// Minimal path-to-regexp subset used by next.config.mjs redirect sources: :name(regex), :name*, :name, literals.
function sourceToRegExp(source) {
  let out = '';
  for (let i = 0; i < source.length;) {
    if (source[i] === ':') {
      const name = /^:[A-Za-z_]\w*/.exec(source.slice(i))[0];
      i += name.length;
      if (source[i] === '(') {
        let depth = 0, j = i;
        for (; j < source.length; j++) {
          if (source[j] === '\\') { j++; continue; }
          if (source[j] === '(') depth++;
          if (source[j] === ')' && --depth === 0) break;
        }
        out += source.slice(i, j + 1);
        i = j + 1;
      } else if (source[i] === '*') { out += '(.*)'; i++; }
      else out += '([^/]+)';
      continue;
    }
    out += source[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    i++;
  }
  return new RegExp(`^${out}/?$`, 'i');
}

function redirectSources() {
  const config = read('next.config.mjs');
  const start = config.indexOf('async redirects()');
  const end = config.indexOf('async headers()');
  assert.ok(start >= 0 && end > start, 'redirects() block not found in next.config.mjs');
  return [...config.slice(start, end).matchAll(/source:\s*"([^"]+)"/g)].map(match => match[1]);
}

function adDepthDefaultRoutes() {
  const code = read('scripts/ad-depth-audit.mjs');
  const block = /const DEFAULT_ROUTES = \[([\s\S]*?)\];/.exec(code);
  assert.ok(block, 'DEFAULT_ROUTES not found in scripts/ad-depth-audit.mjs');
  return [...block[1].matchAll(/"([^"]+)"/g)].map(match => match[1]);
}

test('the redirect-source matcher sees the known /company 308 and the legacy pattern rules', () => {
  const sources = redirectSources();
  assert.ok(sources.length > 100, `only ${sources.length} redirect sources parsed`);
  const rules = sources.map(sourceToRegExp);
  for (const known of ['/company', '/company/hyundai-motor', '/salary-db/samsung-electronics-2']) {
    assert.ok(rules.some(rule => rule.test(known)), `${known} should match a redirect source`);
  }
  assert.ok(!rules.some(rule => rule.test('/company/simulator')), '/company/simulator is a real page');
});

test('no ad-depth default route is a redirect source', () => {
  const rules = redirectSources().map(source => ({ source, test: sourceToRegExp(source) }));
  const routes = adDepthDefaultRoutes();
  assert.ok(routes.length >= 20);
  assert.ok(!routes.includes('/company'));
  assert.ok(routes.includes('/calc/sk-hynix-bonus'));
  for (const route of routes) {
    const hit = rules.find(rule => rule.test.test(route) || rule.test.test(encodeURI(route)));
    assert.equal(hit, undefined, `${route} redirects (${hit?.source}) and would always fail to load in the guarded QA context`);
  }
});

function numberInputsFixture(t, files) {
  const cwd = mkdtempSync(path.join(tmpdir(), 'msy-number-inputs-fixture-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(cwd)), path.resolve(tmpdir()));
    rmSync(cwd, { recursive: true, force: true });
  });
  mkdirSync(path.join(cwd, 'src', 'app'), { recursive: true });
  mkdirSync(path.join(cwd, 'src', 'components'), { recursive: true });
  for (const [relative, contents] of Object.entries(files)) {
    const filename = path.join(cwd, relative);
    mkdirSync(path.dirname(filename), { recursive: true });
    writeFileSync(filename, contents);
  }
  // The real script, run with the fixture as cwd (it walks src/app and src/components relative to cwd and
  // resolves typescript next to itself).
  const result = spawnSync(process.execPath, [path.join(repoRoot, 'scripts', 'qa-number-inputs.mjs')], {
    cwd, encoding: 'utf8', timeout: 60000, windowsHide: true,
  });
  return { status: result.status, report: JSON.parse(result.stdout) };
}

const workClock = `export default function W({ draft }) {
  return <div>
    <input id="work-hours" type="number" value={draft.dailyHours} onChange={() => {}} />
    <input id="work-deductions" type="number" value={draft.deductionPercent} onChange={() => {}} />
  </div>;
}
`;

test('reviewed non-money inputs pass and are reported as non-money exceptions', t => {
  const { status, report } = numberInputsFixture(t, {
    'src/app/work-clock/WorkClockClient.tsx': workClock,
    'src/app/work-clock/HolidayPayEstimate.tsx': 'export const H = ({ hours, night }) => <div><input type="number" value={hours} /><input type="number" value={night} /></div>;\n',
    'src/components/TableInteraction.tsx': 'export const T = ({ searchTerm }) => <input id="search" type="text" inputMode="numeric" value={searchTerm} />;\n',
  });
  assert.deepEqual(report.unresolved, []);
  assert.equal(report.nonMoneyExceptions.length, 5);
  assert.equal(report.nonMoneyExceptions.filter(item => item.reason === 'grouped by formatTableSearch').length, 1);
  assert.equal(status, 0);
});

test('a new ungrouped money input still fails, and an allowlisted id only counts in its own file', t => {
  const { status, report } = numberInputsFixture(t, {
    'src/app/work-clock/WorkClockClient.tsx': workClock,
    'src/app/calc/new-tool/Client.tsx': 'export const C = ({ salary }) => <input id="salary" type="number" value={salary} />;\n',
    'src/app/calc/other-tool/Client.tsx': 'export const D = ({ v }) => <input id="work-hours" type="number" value={v} />;\n',
  });
  assert.equal(status, 1);
  const paths = report.unresolved.map(item => item.path).sort();
  assert.deepEqual(paths, ['src/app/calc/new-tool/Client.tsx', 'src/app/calc/other-tool/Client.tsx']);
  assert.equal(report.nonMoneyExceptions.length, 2);
});
