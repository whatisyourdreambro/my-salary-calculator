// Pure release-gate policy for npm audit results (no I/O, safe to import in tests).
// Every dependency advisory blocks, except a reviewed, expiring entry below for a
// moderate-or-lower advisory whose every affected copy is dev-only in
// package-lock.json. Runtime advisories, high/critical ones, unknown advisory IDs
// and every entry after its `expires` date (UTC) still block.
//
// Owner decision 2026-11-01 (approval item 11): keep these strict reviewed
// exceptions. An unreviewed advisory is never auto-accepted or reduced to a
// warning, whatever its severity; changing that needs a new owner decision.
//
// PROPOSAL 2026-11-18 (pending, not in force): OWNER_APPROVED_ADVISORIES below is a
// second, separate list for an advisory the dev-only list can never cover (high, or
// not dev-only in the lockfile) and for which no patched release exists. It changes
// nothing until the owner answers: an entry whose `ownerDecision` is not a date is
// refused, so the gate keeps failing exactly as before.

// Add an entry only after review, at most 183 days ahead (tests enforce this).
// When it expires the advisory blocks again and must be re-reviewed.
// A new dev-only moderate-or-lower advisory with no patched release gets one small
// commit adding { id, package, reviewed, expires, reason } here, then CI and the
// owner's publish click.
export const REVIEWED_DEV_ADVISORIES = Object.freeze([
  Object.freeze({ id: 'GHSA-g3hv-75wg-m249', package: 'minimatch', reviewed: '2026-11-01', expires: '2027-03-31',
    reason: 'minimatch 3.x/10.x is reached only through ESLint 9, eslint-config-next and typescript-eslint (CI lint only, never bundled or run by the Pages build); no patched 3.x/10.x line exists and eslint-config-next 15 does not support ESLint 10.' }),
]);

// Owner-approved exceptions: one entry per explicit owner decision, never added by an
// agent alone. An entry is honoured only
//   - for exactly this advisory id and this package name,
//   - while that advisory is at most `high` (critical always blocks),
//   - when `ownerDecision` is the date (YYYY-MM-DD, KST) of the owner's yes, not earlier
//     than `reviewed` and not later than `expires`; any other value (PENDING) is refused,
//   - until `expires` (UTC, inclusive), which is at most OWNER_EXCEPTION_MAX_DAYS after
//     `reviewed`. Renewing needs a new review and a new owner decision,
//   - when none of its dates runs ahead of the clock: `reviewed` and `ownerDecision` may
//     not be later than the gate date plus one day (the gate date is UTC and the KST date
//     is at most one day ahead of it), and `expires` may not be more than
//     OWNER_EXCEPTION_MAX_DAYS after the gate date. So an entry is never in force for more
//     than OWNER_EXCEPTION_MAX_DAYS days counted from any gate run, and never before the
//     day of the decision it records. (A full 31-day entry is therefore refused until
//     09:00 KST of its review day; it fails closed and clears by itself.)
// A package record that also carries any other advisory still needs that advisory to
// pass the dev-only rules above; unknown ids still block. Remove the entry as soon as a
// patched release is adopted or the advisory is withdrawn (the gate prints it as unused).
// Unlike the dev-only list, an owner entry also covers copies that package-lock.json does
// not mark dev-only: the owner decides that on the evidence stated in `reason`. For the
// picomatch entry these are the eight records under tailwindcss-animate (a dependency
// that only tailwind.config.ts imports); the Worker bundle check in
// scripts/lib/pages-export.mjs refuses the build if such a copy ever reaches the Worker.
// The gate itself (not only the test on the committed list) also refuses: every entry when
// the list has more than OWNER_EXCEPTION_MAX_ENTRIES entries, every entry for an id and
// package that appear more than once, an entry whose id is also in the dev-only list (an
// advisory lives in one list only), and the owner path for a package record without
// lockfile nodes (the dev-only rule blocks such a record too).
export const OWNER_EXCEPTION_MAX_DAYS = 31;
export const OWNER_EXCEPTION_MAX_ENTRIES = 3;
export const OWNER_APPROVED_ADVISORIES = Object.freeze([
  Object.freeze({ id: 'GHSA-fc5q-39xc-vjpf', package: 'picomatch', reviewed: '2026-11-18', expires: '2026-12-18', ownerDecision: 'PENDING',
    reason: 'No patched picomatch release exists on any line (range <=4.0.7, no first patched version; the maintainer declined the report on 2026-10-21). The flaw needs an attacker-chosen glob pattern; here every pattern comes from repository config (Tailwind content globs, ESLint, Vitest, TypeScript tooling) and the deployed Pages Worker bundles no npm package at all. Remove when a patched release is adopted or the advisory is withdrawn.' }),
]);
const TOLERABLE = new Set(['info', 'low', 'moderate']);
const OWNER_TOLERABLE = new Set([...TOLERABLE, 'high']);
const isDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const addDays = (date, days) => new Date(Date.parse(date) + days * 86_400_000).toISOString().slice(0, 10);

// Why an owner entry is not in force on `today` (the UTC date of the gate run); null when it is.
export function ownerExceptionRefusal(entry, today) {
  if (!isDate(today)) return 'the gate date is not a date';
  if (!isDate(entry?.reviewed) || !isDate(entry?.expires)) return 'reviewed and expires must be dates';
  const days = (Date.parse(entry.expires) - Date.parse(entry.reviewed)) / 86_400_000;
  if (!(days > 0 && days <= OWNER_EXCEPTION_MAX_DAYS)) return `expires must be 1-${OWNER_EXCEPTION_MAX_DAYS} days after reviewed`;
  if (!isDate(entry.ownerDecision)) return 'ownerDecision is not a date: the owner has not approved this entry';
  if (entry.ownerDecision < entry.reviewed || entry.ownerDecision > entry.expires) return 'ownerDecision must lie between reviewed and expires';
  if (today > entry.expires) return 'expired';
  const latestKstDate = addDays(today, 1);
  if (entry.reviewed > latestKstDate) return 'reviewed is a future date';
  if (entry.ownerDecision > latestKstDate) return 'ownerDecision is a future date: no approval can exist yet';
  if (entry.expires > addDays(today, OWNER_EXCEPTION_MAX_DAYS)) return `expires is more than ${OWNER_EXCEPTION_MAX_DAYS} days after the gate date`;
  return null;
}

// Why the owner list as a whole, or this entry's place in it, keeps the entry out of force.
function ownerListRefusal(entry, ownerList, allowlist) {
  if (ownerList.length > OWNER_EXCEPTION_MAX_ENTRIES)
    return `the owner list has more than ${OWNER_EXCEPTION_MAX_ENTRIES} entries: none is honoured`;
  if (ownerList.filter(e => e?.id === entry?.id && e?.package === entry?.package).length > 1)
    return 'more than one owner entry for this advisory and package: none is honoured';
  if (allowlist.some(e => e.id === entry?.id)) return 'this advisory is also in the reviewed dev-only list: an advisory lives in one list only';
  return null;
}

export function classifyAdvisories(audit, lock, today = new Date().toISOString().slice(0, 10), allowlist = REVIEWED_DEV_ADVISORIES, ownerList = OWNER_APPROVED_ADVISORIES) {
  const vulnerabilities = audit.vulnerabilities;
  const roots = (name, seen = new Set()) => {
    if (seen.has(name)) return [];
    seen.add(name);
    return (vulnerabilities[name]?.via ?? []).flatMap(via => typeof via === 'string' ? roots(via, seen)
      : [{ package: via.name, id: String(via.url ?? '').split('/').pop(), severity: via.severity }]);
  };
  const owner = ownerList.map(entry => ({ entry,
    refusal: ownerListRefusal(entry, ownerList, allowlist) ?? ownerExceptionRefusal(entry, today), covers: [] }));
  const blocked = [], accepted = [], ownerAccepted = [];
  for (const [name, entry] of Object.entries(vulnerabilities)) {
    const advisories = roots(name);
    const devOnly = entry.nodes.length > 0 && entry.nodes.every(node => lock.packages?.[node]?.dev === true);
    const reviews = advisories.map(a => allowlist.find(e => e.id === a.id && e.package === a.package && today <= e.expires));
    const ok = devOnly && advisories.length > 0 && TOLERABLE.has(entry.severity)
      && advisories.every(a => TOLERABLE.has(a.severity)) && reviews.every(Boolean);
    const record = { name, severity: entry.severity, devOnly, advisories: [...new Set(advisories.map(a => a.id))] };
    if (ok) { accepted.push({ ...record, expires: reviews.map(r => r.expires).sort()[0] }); continue; }
    // Owner rule: at least one advisory is covered by an owner entry in force, and each
    // remaining advisory passes the unchanged dev-only rule on its own.
    const owned = advisories.map(a => OWNER_TOLERABLE.has(a.severity)
      ? owner.find(o => !o.refusal && o.entry.id === a.id && o.entry.package === a.package) : undefined);
    const ownerOk = entry.nodes.length > 0 && advisories.length > 0 && owned.some(Boolean) && OWNER_TOLERABLE.has(entry.severity)
      && advisories.every((a, i) => owned[i] || (devOnly && TOLERABLE.has(a.severity) && reviews[i]));
    if (!ownerOk) {
      // Only when an owner entry in force would have covered it, so the base output is unchanged.
      const noNodes = owned.some(Boolean) && entry.nodes.length === 0;
      blocked.push(noNodes ? { ...record, ownerRefusal: 'no lockfile nodes: the record cannot be checked against package-lock.json' } : record);
      continue;
    }
    const used = [...new Set(owned.filter(Boolean))];
    for (const o of used) o.covers.push(name);
    ownerAccepted.push({ ...record, ownerApproved: used.map(o => o.entry.id),
      expires: advisories.map((a, i) => (owned[i]?.entry ?? reviews[i]).expires).sort()[0] });
  }
  const expired = allowlist.filter(e => today > e.expires).map(e => ({ id: e.id, package: e.package, expired: e.expires }));
  const brief = ({ entry }) => ({ id: entry.id, package: entry.package, ownerDecision: entry.ownerDecision, expires: entry.expires });
  return { blocked, accepted, expired, ownerAccepted,
    ownerApproved: owner.filter(o => !o.refusal && o.covers.length).map(o => ({ ...brief(o), covers: o.covers })),
    ownerRefused: owner.filter(o => o.refusal).map(o => ({ ...brief(o), refusal: o.refusal })),
    ownerUnused: owner.filter(o => !o.refusal && !o.covers.length).map(brief) };
}
