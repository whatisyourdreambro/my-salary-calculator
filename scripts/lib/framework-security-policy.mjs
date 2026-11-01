// Pure release-gate policy for npm audit results (no I/O, safe to import in tests).
// Every dependency advisory blocks, except a reviewed, expiring entry below for a
// moderate-or-lower advisory whose every affected copy is dev-only in
// package-lock.json. Runtime advisories, high/critical ones, unknown advisory IDs
// and every entry after its `expires` date (UTC) still block.
//
// Owner decision 2026-11-01 (approval item 11): keep these strict reviewed
// exceptions. An unreviewed advisory is never auto-accepted or reduced to a
// warning, whatever its severity; changing that needs a new owner decision.

// Add an entry only after review, at most 183 days ahead (tests enforce this).
// When it expires the advisory blocks again and must be re-reviewed.
// A new dev-only moderate-or-lower advisory with no patched release gets one small
// commit adding { id, package, reviewed, expires, reason } here, then CI and the
// owner's publish click.
export const REVIEWED_DEV_ADVISORIES = Object.freeze([
  Object.freeze({ id: 'GHSA-g3hv-75wg-m249', package: 'minimatch', reviewed: '2026-11-01', expires: '2027-03-31',
    reason: 'minimatch 3.x/10.x is reached only through ESLint 9, eslint-config-next and typescript-eslint (CI lint only, never bundled or run by the Pages build); no patched 3.x/10.x line exists and eslint-config-next 15 does not support ESLint 10.' }),
]);
const TOLERABLE = new Set(['info', 'low', 'moderate']);

export function classifyAdvisories(audit, lock, today = new Date().toISOString().slice(0, 10), allowlist = REVIEWED_DEV_ADVISORIES) {
  const vulnerabilities = audit.vulnerabilities;
  const roots = (name, seen = new Set()) => {
    if (seen.has(name)) return [];
    seen.add(name);
    return (vulnerabilities[name]?.via ?? []).flatMap(via => typeof via === 'string' ? roots(via, seen)
      : [{ package: via.name, id: String(via.url ?? '').split('/').pop(), severity: via.severity }]);
  };
  const blocked = [], accepted = [];
  for (const [name, entry] of Object.entries(vulnerabilities)) {
    const advisories = roots(name);
    const devOnly = entry.nodes.length > 0 && entry.nodes.every(node => lock.packages?.[node]?.dev === true);
    const reviews = advisories.map(a => allowlist.find(e => e.id === a.id && e.package === a.package && today <= e.expires));
    const ok = devOnly && advisories.length > 0 && TOLERABLE.has(entry.severity)
      && advisories.every(a => TOLERABLE.has(a.severity)) && reviews.every(Boolean);
    const record = { name, severity: entry.severity, devOnly, advisories: [...new Set(advisories.map(a => a.id))] };
    if (ok) accepted.push({ ...record, expires: reviews.map(r => r.expires).sort()[0] });
    else blocked.push(record);
  }
  const expired = allowlist.filter(e => today > e.expires).map(e => ({ id: e.id, package: e.package, expired: e.expires }));
  return { blocked, accepted, expired };
}
