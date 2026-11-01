// Offline: the reviewed advisory exception never hides runtime, severe, unknown or expired advisories.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { classifyAdvisories, REVIEWED_DEV_ADVISORIES } from '../lib/framework-security-policy.mjs';

const advisory = (severity = 'moderate', id = 'GHSA-g3hv-75wg-m249') =>
  ({ source: 1, name: 'minimatch', severity, url: `https://github.com/advisories/${id}`, range: '<11.0.1' });
const audit = (severity, id) => ({ vulnerabilities: {
  minimatch: { name: 'minimatch', severity: severity ?? 'moderate', via: [advisory(severity, id)], nodes: ['node_modules/minimatch'] },
  eslint: { name: 'eslint', severity: severity ?? 'moderate', via: ['minimatch'], nodes: ['node_modules/eslint'] },
} });
const lock = (dev = true) => ({ packages: { 'node_modules/minimatch': { dev }, 'node_modules/eslint': { dev: true } } });

test('reviewed dev-only moderate advisory is accepted until it expires', () => {
  const result = classifyAdvisories(audit(), lock(), '2026-11-01');
  assert.deepEqual(result.blocked, []);
  assert.deepEqual(result.accepted.map(a => a.name).sort(), ['eslint', 'minimatch']);
  assert.ok(result.accepted.every(a => a.expires === REVIEWED_DEV_ADVISORIES[0].expires));
  assert.deepEqual(classifyAdvisories(audit(), lock(), '2027-03-31').blocked, []);
  const later = classifyAdvisories(audit(), lock(), '2027-04-01');
  assert.equal(later.blocked.length, 2);
  assert.equal(later.expired.length, 1);
});

test('runtime, devOptional, severe, unreviewed and unknown-node advisories still block', () => {
  assert.deepEqual(classifyAdvisories(audit(), lock(false), '2026-11-01').blocked.map(a => a.name), ['minimatch']);
  const devOptional = { packages: { 'node_modules/minimatch': { devOptional: true }, 'node_modules/eslint': { dev: true } } };
  assert.deepEqual(classifyAdvisories(audit(), devOptional, '2026-11-01').blocked.map(a => a.name), ['minimatch']);
  assert.equal(classifyAdvisories(audit('high'), lock(), '2026-11-01').blocked.length, 2);
  assert.equal(classifyAdvisories(audit('moderate', 'GHSA-xxxx-xxxx-xxxx'), lock(), '2026-11-01').blocked.length, 2);
  const unknownNode = audit(); unknownNode.vulnerabilities.minimatch.nodes.push('node_modules/not-in-lockfile');
  assert.deepEqual(classifyAdvisories(unknownNode, lock(), '2026-11-01').blocked.map(a => a.name), ['minimatch']);
  assert.deepEqual(classifyAdvisories({ vulnerabilities: {} }, lock(), '2026-11-01').blocked, []);
});

test('unreviewed dev-only advisories block at every tolerable severity (owner decision 2026-11-01, no auto-warn)', () => {
  for (const severity of ['info', 'low', 'moderate']) {
    const result = classifyAdvisories(audit(severity, 'GHSA-zzzz-zzzz-zzzz'), lock(), '2026-11-01');
    assert.deepEqual(result.blocked.map(a => a.name).sort(), ['eslint', 'minimatch'], severity);
    assert.deepEqual(result.accepted, [], severity);
  }
  const noEntries = classifyAdvisories(audit(), lock(), '2026-11-01', []);
  assert.equal(noEntries.blocked.length, 2);
  assert.deepEqual(noEntries.accepted, []);
  const otherPackage = audit(); otherPackage.vulnerabilities.minimatch.via[0].name = 'brace-expansion';
  assert.equal(classifyAdvisories(otherPackage, lock(), '2026-11-01').blocked.length, 2);
});

test('every reviewed entry is specific, justified and expires within 183 days of review', () => {
  assert.ok(REVIEWED_DEV_ADVISORIES.length <= 5);
  for (const entry of REVIEWED_DEV_ADVISORIES) {
    assert.match(entry.id, /^GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/);
    assert.match(entry.package, /^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/);
    for (const field of ['reviewed', 'expires']) assert.match(entry[field], /^\d{4}-\d{2}-\d{2}$/);
    const days = (Date.parse(entry.expires) - Date.parse(entry.reviewed)) / 86_400_000;
    assert.ok(days > 0 && days <= 183, `${entry.id} expiry must be 1-183 days after review`);
    assert.ok(entry.reason.length >= 40);
  }
});

test('the CLI gate always runs at top level and uses the shared policy', () => {
  const source = readFileSync(new URL('../verify-framework-security.mjs', import.meta.url), 'utf8');
  assert.match(source, /from '\.\/lib\/framework-security-policy\.mjs'/);
  assert.match(source, /classifyAdvisories\(audit,/);
  assert.match(source, /if \(blocked\.length\) process\.exitCode = 1;/);
  assert.doesNotMatch(source, /import\.meta|function main\(|export /, 'No import guard may skip the release gate');
});
