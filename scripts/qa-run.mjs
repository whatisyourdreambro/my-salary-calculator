// Only maintained, guarded scripts may execute through this entry point.
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
const allowed = new Set([
  'scripts/ad-depth-audit.mjs',
  'scripts/qa-calculator-experience.mjs',
  'scripts/qa-focus-input.mjs',
  'scripts/qa-interaction-states.mjs',
  'scripts/qa-screen-reader.mjs',
  'scripts/qa-calculator-routes.mjs',
  'scripts/qa-money-check.mjs',
  'scripts/qa-number-inputs.mjs',
  'scripts/qa-crawl.ts',
  'scripts/qa-english.ts',
  'scripts/qa-pages-navigation.mjs',
  'scripts/__tests__/qa-saved-recalculation.mjs',
]);
const [requested, ...args] = process.argv.slice(2);
if (!requested) throw new Error('Usage: npm run qa:run -- scripts/<maintained-test>');
if (args.length) throw new Error('QA scripts do not accept extra arguments; set a loopback BASE_URL environment variable if needed.');
// Reject unmaintained names even when historical files are absent from a fresh
// checkout. Resolve only allowlisted paths, then check again to reject symlinks
// that point outside the maintained entry points.
const requestedPath = path.resolve(root, requested);
const requestedRelative = path.relative(root, requestedPath).replaceAll('\\', '/');
if (!allowed.has(requestedRelative)) throw new Error('QA script is not in the maintained allowlist. Archived browser tests cannot be executed.');
const actual = realpathSync(requestedPath);
const relative = path.relative(root, actual).replaceAll('\\', '/');
if (!allowed.has(relative)) throw new Error('QA script is not in the maintained allowlist. Archived browser tests cannot be executed.');
const safety = spawnSync(process.execPath, [path.join(root, 'scripts/verify-qa-safety.mjs')], {
  cwd: root, stdio: 'inherit', windowsHide: true,
});
if (safety.status !== 0) throw new Error('QA safety audit failed; no test process was started.');
const command = relative.endsWith('.ts') ? [require.resolve('tsx/cli'), actual, ...args] : [actual, ...args];
const child = spawn(process.execPath, command, {
  cwd: root, stdio: 'inherit', windowsHide: true,
  env: { ...process.env, MSY_QA_MODE: '1', NEXT_PUBLIC_ADS_DISABLED: '1', NEXT_TELEMETRY_DISABLED: '1' },
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
