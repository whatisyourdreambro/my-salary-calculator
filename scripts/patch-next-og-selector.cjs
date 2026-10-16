// Verified upstream backport; no package metadata or audit output is rewritten.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- npm postinstall must run with Node built-ins only.
const { createHash } = require('node:crypto');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- npm postinstall must run with Node built-ins only.
const fs = require('node:fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- npm postinstall must run with Node built-ins only.
const path = require('node:path');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- The pinned patch specification is shared with offline tests.
const spec = require('./vendor-patches/next-og-selector.json');

const sha256 = value => createHash('sha256').update(value).digest('hex');

function replaceExactlyOnce(source, before, after, label) {
  if (source.split(before).length !== 2) throw new Error(`Unexpected patch match count: ${label}`);
  return source.replace(before, after);
}

function patchSource(name, source) {
  const file = spec.files.find(item => item.name === name);
  if (!file) throw new Error(`Unsupported OG file: ${name}`);
  const hash = sha256(source);
  if (hash === file.patchedSha256) return { source, state: 'already-patched', ...file };
  if (hash !== file.originalSha256) throw new Error(`Unrecognized OG source hash: ${name}; review the upstream release before updating the patch.`);
  let output = source;
  for (const change of spec.changes) output = replaceExactlyOnce(output, change.before, change.after, change.label);
  if (sha256(output) !== file.patchedSha256) throw new Error(`Patched OG hash mismatch: ${name}`);
  return { source: output, state: 'patched', ...file };
}

// Tests can compare the exact original even after npm postinstall has run.
function originalSource(name, source) {
  const result = patchSource(name, source);
  if (result.state === 'patched') return source;
  let output = source;
  for (const change of [...spec.changes].reverse()) output = replaceExactlyOnce(output, change.after, change.before, change.label);
  if (sha256(output) !== result.originalSha256) throw new Error(`Original OG hash mismatch: ${name}`);
  return output;
}

function applyPatch({ root = path.resolve(__dirname, '..'), checkOnly = false } = {}) {
  const nextDir = path.join(root, 'node_modules/next');
  const ogDir = path.join(nextDir, 'dist/compiled/@vercel/og');
  const next = JSON.parse(fs.readFileSync(path.join(nextDir, 'package.json'), 'utf8'));
  const og = JSON.parse(fs.readFileSync(path.join(ogDir, 'package.json'), 'utf8'));
  if (next.version !== spec.nextVersion || og.version !== spec.ogVersion)
    throw new Error(`Unsupported Next/OG version ${next.version}/${og.version}; review this backport before upgrading.`);
  // Read and validate every file before changing any file. Unknown/partial drift
  // fails without modifying either runtime entry point.
  const plans = spec.files.map(file => {
    const target = path.join(ogDir, file.name);
    if (fs.lstatSync(target).isSymbolicLink()) throw new Error('Refusing to patch a symbolic link');
    const source = fs.readFileSync(target, 'utf8');
    return { target, original: source, ...patchSource(file.name, source) };
  });
  if (checkOnly) {
    if (plans.some(plan => plan.state !== 'already-patched')) throw new Error('Vendored OG selector backport has not been applied. Run npm install with lifecycle scripts enabled.');
  } else {
    const backupDir = path.join(root, '.artifacts/vendor-patches/next-15.5.28-og-selector');
    // Prepare all backups before the first mutation. These are outside Next's
    // package directory so output tracing cannot accidentally deploy originals.
    for (const plan of plans.filter(item => item.state === 'patched')) {
      fs.mkdirSync(backupDir, { recursive: true });
      const backup = path.join(backupDir, `${plan.name}.original`);
      if (fs.existsSync(backup)) {
        if (sha256(fs.readFileSync(backup)) !== plan.originalSha256) throw new Error(`Unexpected original backup: ${plan.name}`);
      } else fs.writeFileSync(backup, plan.original, { flag: 'wx' });
    }
    for (const plan of plans.filter(item => item.state === 'patched')) fs.writeFileSync(plan.target, plan.source);
    for (const plan of plans) {
      if (sha256(fs.readFileSync(plan.target)) !== plan.patchedSha256) throw new Error(`OG write verification failed: ${plan.name}`);
    }
  }
  return plans.map(({ name, state, originalSha256, patchedSha256 }) => ({ name, state, originalSha256, patchedSha256 }));
}

module.exports = { spec, sha256, patchSource, originalSource, applyPatch };

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) throw new Error('Usage: node scripts/patch-next-og-selector.cjs [--check]');
  console.log(JSON.stringify({ patch: 'GHSA-rj75-hqrm-r3gf', files: applyPatch({ checkOnly: args[0] === '--check' }) }, null, 2));
}
