// Every dependency advisory is a release blocker, except a reviewed, expiring
// dev-only entry in scripts/lib/framework-security-policy.mjs. Runtime advisories
// and high/critical ones always block. Local backports are verified independently
// because npm audit cannot inspect vendored or patched source. This file runs at
// top level on purpose: there is no import guard that could skip the gate.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { classifyAdvisories } from './lib/framework-security-policy.mjs';

const npm = process.env.npm_execpath || path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
if (!existsSync(npm)) throw new Error('Run npm run verify:framework-security');
for (const args of [['scripts/verify-vendored-dependencies.mjs'], ['scripts/patch-next-og-selector.cjs', '--check']]) {
  const verified = spawnSync(process.execPath, args, { stdio: 'inherit', windowsHide: true, timeout: 30000 });
  if (verified.error || verified.status !== 0) throw new Error('A reviewed vendor/backport integrity check failed.');
}
const result = spawnSync(process.execPath, [npm, 'audit', '--json'], { encoding: 'utf8', windowsHide: true, timeout: 120000, maxBuffer: 8 * 1024 * 1024 });
if (result.error || ![0, 1].includes(result.status)) throw new Error('npm audit did not complete');
const audit = JSON.parse(result.stdout);
if (audit.error || !audit.vulnerabilities) throw new Error('npm audit returned no usable advisory result');
const { blocked, accepted, expired } = classifyAdvisories(audit, JSON.parse(readFileSync('package-lock.json', 'utf8')));
mkdirSync('.artifacts/next-security', { recursive: true });
writeFileSync('.artifacts/next-security/npm-audit.json', JSON.stringify(audit, null, 2) + '\n');
console.log(JSON.stringify({ dependencyAdvisories: blocked, reviewedDevAdvisories: accepted, expiredReviews: expired, localBackportsVerified: true }, null, 2));
if (blocked.length) process.exitCode = 1;
