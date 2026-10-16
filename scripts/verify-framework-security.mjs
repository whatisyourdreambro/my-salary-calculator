// npm advisories for the framework/adapter must remain clear. Other advisories
// are printed separately and require review; this gate never ignores a Next finding.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const npm = process.env.npm_execpath || path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
if (!existsSync(npm)) throw new Error('Run npm run verify:framework-security');
const result = spawnSync(process.execPath, [npm, 'audit', '--json'], { encoding: 'utf8', windowsHide: true, timeout: 120000, maxBuffer: 8 * 1024 * 1024 });
if (result.error || ![0, 1].includes(result.status)) throw new Error('npm audit did not complete');
const audit = JSON.parse(result.stdout);
if (audit.error || !audit.vulnerabilities) throw new Error('npm audit returned no usable advisory result');
const protectedPackages = /^(?:next|react|react-dom|react-server-dom-.+|postcss|sharp|wrangler|miniflare|workerd|@next\/swc-.+|@opennextjs\/.+)$/;
const blocked = Object.entries(audit.vulnerabilities).filter(([name]) => protectedPackages.test(name)).map(([name, v]) => ({ name, severity: v.severity }));
const other = Object.entries(audit.vulnerabilities).filter(([name]) => !protectedPackages.test(name)).map(([name, v]) => ({ name, severity: v.severity }));
mkdirSync('.artifacts/next-security', { recursive: true });
writeFileSync('.artifacts/next-security/npm-audit.json', JSON.stringify(audit, null, 2) + '\n');
console.log(JSON.stringify({ frameworkAndAdapter: blocked, otherAdvisories: other }, null, 2));
if (blocked.length) process.exitCode = 1;
