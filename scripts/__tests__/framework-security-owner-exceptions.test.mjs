// Offline: an owner-approved exception covers exactly one advisory of one package, for at
// most 31 days, never a critical one, and never before the owner's decision is recorded.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { classifyAdvisories, OWNER_APPROVED_ADVISORIES, OWNER_EXCEPTION_MAX_DAYS, ownerExceptionRefusal, REVIEWED_DEV_ADVISORIES }
  from '../lib/framework-security-policy.mjs';

const PICO = 'GHSA-fc5q-39xc-vjpf', MINI = 'GHSA-g3hv-75wg-m249';
const via = (name, id, severity) => ({ source: 1, name, severity, url: `https://github.com/advisories/${id}`, range: '*' });
const pending = { id: PICO, package: 'picomatch', reviewed: '2026-11-18', expires: '2026-12-18', ownerDecision: 'PENDING', reason: 'x'.repeat(40) };
const approved = { ...pending, ownerDecision: '2026-11-19' };
// picomatch itself is not dev-only in the lockfile; tinyglobby is; typescript-estree carries both advisories.
const audit = (severity = 'high', id = PICO, pkg = 'picomatch') => ({ vulnerabilities: {
  picomatch: { name: 'picomatch', severity, via: [via(pkg, id, severity)], nodes: ['node_modules/picomatch', 'node_modules/vite/node_modules/picomatch'] },
  micromatch: { name: 'micromatch', severity, via: ['picomatch'], nodes: ['node_modules/micromatch'] },
  tinyglobby: { name: 'tinyglobby', severity, via: ['picomatch'], nodes: ['node_modules/tinyglobby'] },
} });
const lock = { packages: { 'node_modules/picomatch': {}, 'node_modules/vite/node_modules/picomatch': { dev: true }, 'node_modules/micromatch': {},
  'node_modules/tinyglobby': { dev: true }, 'node_modules/minimatch': { dev: true }, 'node_modules/estree': { dev: true } } };
const run = (a, owner, today = '2026-11-19', l = lock) => classifyAdvisories(a, l, today, REVIEWED_DEV_ADVISORIES, owner);
const names = list => list.map(x => x.name).sort();
const ALL = ['micromatch', 'picomatch', 'tinyglobby'];

test('an entry without an owner decision date is refused, so the gate keeps failing', () => {
  for (const ownerDecision of ['PENDING', '', 'yes', 'approved', '2026-13-40', '2026-02-30', '20261119', '2026-11-19T00:00:00Z', undefined, null, true, 20261119]) {
    const result = run(audit(), [{ ...pending, ownerDecision }]);
    assert.deepEqual(names(result.blocked), ALL, String(ownerDecision));
    assert.deepEqual(result.ownerAccepted, [], String(ownerDecision));
    assert.deepEqual(result.ownerApproved, [], String(ownerDecision));
    assert.match(result.ownerRefused[0].refusal, /ownerDecision is not a date/, String(ownerDecision));
  }
  // A decision dated before the review or after the expiry is not a decision about this entry.
  for (const ownerDecision of ['2026-11-17', '2026-12-19']) {
    const result = run(audit(), [{ ...pending, ownerDecision }]);
    assert.deepEqual(names(result.blocked), ALL, ownerDecision);
    assert.match(result.ownerRefused[0].refusal, /between reviewed and expires/);
  }
  assert.deepEqual(names(run(audit(), []).blocked), ALL);
});

test('a dated owner decision accepts exactly this advisory for this package, and reports it', () => {
  const result = run(audit(), [approved]);
  assert.deepEqual(result.blocked, []);
  assert.deepEqual(result.accepted, [], 'the dev-only list accepted nothing here');
  assert.deepEqual(names(result.ownerAccepted), ALL);
  assert.ok(result.ownerAccepted.every(a => a.expires === '2026-12-18' && a.ownerApproved.join() === PICO));
  assert.deepEqual(result.ownerApproved, [{ id: PICO, package: 'picomatch', ownerDecision: '2026-11-19', expires: '2026-12-18', covers: ['picomatch', 'micromatch', 'tinyglobby'] }]);
  assert.deepEqual(result.ownerRefused, []);
  assert.deepEqual(result.ownerUnused, []);
  for (const severity of ['info', 'low', 'moderate']) assert.deepEqual(run(audit(severity), [approved]).blocked, [], severity);
  // Same id for another package, or another id for the same package: still blocked.
  assert.deepEqual(names(run(audit('high', PICO, 'micromatch'), [approved]).blocked), ALL);
  assert.deepEqual(names(run(audit('high', 'GHSA-xxxx-xxxx-xxxx'), [approved]).blocked), ALL);
  assert.deepEqual(names(run(audit(), [{ ...approved, package: 'micromatch' }]).blocked), ALL);
  // An entry in force that matches nothing is reported as unused, not silently kept.
  const gone = run({ vulnerabilities: {} }, [approved]);
  assert.deepEqual(gone.ownerUnused, [{ id: PICO, package: 'picomatch', ownerDecision: '2026-11-19', expires: '2026-12-18' }]);
});

test('critical always blocks, whatever the owner list says', () => {
  const critical = run(audit('critical'), [approved]);
  assert.deepEqual(names(critical.blocked), ALL);
  assert.deepEqual(critical.ownerAccepted, []);
  // A high advisory inside a record that npm rates critical is not accepted either.
  const mixed = audit(); mixed.vulnerabilities.micromatch.severity = 'critical';
  assert.deepEqual(names(run(mixed, [approved]).blocked), ['micromatch']);
});

test('the exception ends on its expiry date and can never span more than 31 days', () => {
  assert.deepEqual(run(audit(), [approved], '2026-12-18').blocked, []);
  const late = run(audit(), [approved], '2026-12-19');
  assert.deepEqual(names(late.blocked), ALL);
  assert.equal(late.ownerRefused[0].refusal, 'expired');
  assert.equal(OWNER_EXCEPTION_MAX_DAYS, 31);
  assert.equal(ownerExceptionRefusal({ ...approved, expires: '2026-12-19' }, '2026-11-19'), null, '31 days is the longest window');
  for (const expires of ['2026-12-20', '2027-03-31', '2026-11-18', '2026-11-01', 'never', undefined]) {
    const result = run(audit(), [{ ...approved, expires }]);
    assert.deepEqual(names(result.blocked), ALL, String(expires));
    assert.match(result.ownerRefused[0].refusal, /expires must be 1-31 days after reviewed|must be dates/, String(expires));
  }
  assert.match(ownerExceptionRefusal({ ...approved, reviewed: 'today' }, '2026-11-19'), /must be dates/);
});

test('a record with any other unreviewed advisory still blocks; the dev-only rules are unchanged', () => {
  const both = (otherId, otherSeverity = 'moderate') => ({ vulnerabilities: {
    picomatch: audit().vulnerabilities.picomatch,
    minimatch: { name: 'minimatch', severity: otherSeverity, via: [via('minimatch', otherId, otherSeverity)], nodes: ['node_modules/minimatch'] },
    estree: { name: 'estree', severity: 'high', via: ['minimatch', 'picomatch'], nodes: ['node_modules/estree'] },
  } });
  // Reviewed dev-only minimatch + owner-approved picomatch: accepted, earliest expiry reported.
  const fine = run(both(MINI), [approved]);
  assert.deepEqual(fine.blocked, []);
  assert.deepEqual(names(fine.accepted), ['minimatch']);
  assert.deepEqual(names(fine.ownerAccepted), ['estree', 'picomatch']);
  assert.equal(fine.ownerAccepted.find(a => a.name === 'estree').expires, '2026-12-18');
  // Unknown second advisory: its own record and the record that carries both stay blocked.
  assert.deepEqual(names(run(both('GHSA-zzzz-zzzz-zzzz'), [approved]).blocked), ['estree', 'minimatch']);
  // The second advisory is reviewed but rated high: the dev-only list still cannot cover it.
  assert.deepEqual(names(run(both(MINI, 'high'), [approved]).blocked), ['estree', 'minimatch']);
  // The second advisory is reviewed but the record is not dev-only: blocked as before.
  const runtime = { packages: { ...lock.packages, 'node_modules/estree': {} } };
  assert.deepEqual(names(run(both(MINI), [approved], '2026-11-19', runtime).blocked), ['estree']);
  // Without an owner entry in force nothing changed: the mixed record blocks.
  assert.deepEqual(names(run(both(MINI), [pending]).blocked), ['estree', 'picomatch']);
  // The owner list does not widen the dev-only list: a high dev-only advisory stays blocked.
  const devHigh = { vulnerabilities: { minimatch: { name: 'minimatch', severity: 'high', via: [via('minimatch', MINI, 'high')], nodes: ['node_modules/minimatch'] } } };
  assert.deepEqual(names(run(devHigh, [approved]).blocked), ['minimatch']);
});

test('real audit of 2026-11-18: blocked while PENDING, clear only with a dated decision', () => {
  const data = JSON.parse(readFileSync(new URL('./fixtures/npm-audit-picomatch-2026-11-18.json', import.meta.url), 'utf8'));
  assert.equal(Object.keys(data.audit.vulnerabilities).length, 22);
  const before = classifyAdvisories(data.audit, data.lock, '2026-11-18', REVIEWED_DEV_ADVISORIES, [pending]);
  assert.equal(before.blocked.length, 21);
  assert.deepEqual(names(before.accepted), ['minimatch']);
  assert.deepEqual(before.ownerAccepted, []);
  assert.equal(before.ownerRefused.length, 1);
  // The committed list itself: while its picomatch entry is PENDING the real audit stays blocked.
  if (OWNER_APPROVED_ADVISORIES.some(e => e.id === PICO && e.ownerDecision === 'PENDING'))
    assert.equal(classifyAdvisories(data.audit, data.lock, '2026-11-18').blocked.length, 21, 'a PENDING entry must not open the gate');
  const after = classifyAdvisories(data.audit, data.lock, '2026-11-19', REVIEWED_DEV_ADVISORIES, [approved]);
  assert.deepEqual(after.blocked, []);
  assert.deepEqual(names(after.accepted), ['minimatch']);
  assert.equal(after.ownerAccepted.length, 21);
  assert.equal(after.ownerApproved[0].covers.length, 21);
  assert.equal(classifyAdvisories(data.audit, data.lock, '2026-12-19', REVIEWED_DEV_ADVISORIES, [approved]).blocked.length, 21);
});

test('the committed owner list is frozen, specific, justified and short-lived', () => {
  assert.ok(Object.isFrozen(OWNER_APPROVED_ADVISORIES) && OWNER_APPROVED_ADVISORIES.length <= 3);
  const keys = OWNER_APPROVED_ADVISORIES.map(e => `${e.id} ${e.package}`);
  assert.equal(new Set(keys).size, keys.length, 'one entry per advisory and package');
  for (const entry of OWNER_APPROVED_ADVISORIES) {
    assert.ok(Object.isFrozen(entry));
    assert.deepEqual(Object.keys(entry).sort(), ['expires', 'id', 'ownerDecision', 'package', 'reason', 'reviewed']);
    assert.match(entry.id, /^GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/);
    assert.match(entry.package, /^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/);
    for (const field of ['reviewed', 'expires']) assert.match(entry[field], /^\d{4}-\d{2}-\d{2}$/);
    const days = (Date.parse(entry.expires) - Date.parse(entry.reviewed)) / 86_400_000;
    assert.ok(days > 0 && days <= 31, `${entry.id} expiry must be 1-31 days after review`);
    assert.ok(entry.reason.length >= 40);
    assert.ok(!REVIEWED_DEV_ADVISORIES.some(e => e.id === entry.id && e.package === entry.package), 'an advisory lives in one list only');
    if (entry.ownerDecision !== 'PENDING') {
      assert.match(entry.ownerDecision, /^\d{4}-\d{2}-\d{2}$/, 'ownerDecision is PENDING or the date of the owner decision');
      assert.ok(entry.ownerDecision >= entry.reviewed && entry.ownerDecision <= entry.expires);
    }
  }
});

test('the CLI gate prints every owner exception and still fails on any blocked advisory', () => {
  const source = readFileSync(new URL('../verify-framework-security.mjs', import.meta.url), 'utf8');
  for (const field of ['ownerApprovedExceptions: ownerApproved', 'ownerAcceptedAdvisories: ownerAccepted', 'refusedOwnerExceptions: ownerRefused', 'unusedOwnerExceptions: ownerUnused'])
    assert.ok(source.includes(field), field);
  assert.match(source, /OWNER-APPROVED EXCEPTION IN FORCE: \$\{e\.id\}.*accepted until \$\{e\.expires\}/);
  assert.match(source, /if \(blocked\.length\) process\.exitCode = 1;/);
});
