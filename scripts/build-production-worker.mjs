// Publication build only. Inspection must use qa:cf:build and its isolated output.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
if (process.argv.length !== 2) throw new Error('Production build does not accept command overrides.');
if (['MSY_QA_MODE', 'MSY_QA_WORKER_STAGE', 'NEXT_PUBLIC_ADS_DISABLED'].some(key => process.env[key] === '1')
    || existsSync(path.join(root, '.moneysalary-qa-stage'))
    || /(?:^|[\\/])(?:\.open-next-qa|\.next-qa)(?:[\\/]|$)/i.test(root)) {
  throw new Error('Refusing a production build with QA settings. Use qa:cf:build for testing.');
}
// OpenNext reads these env defaults before parsing its CLI. npm's ignore-scripts
// still runs `build` but silently omits its prebuild/postbuild lifecycle hooks.
const skipKeys = new Set(['SKIP_NEXT_APP_BUILD', 'SKIP_WRANGLER_CONFIG_CHECK']);
const isIgnoreScripts = key => /^npm_config_ignore[-_]scripts$/i.test(key);
const disabledSetting = value => /^(?:|0|false|no|off)$/i.test(String(value).trim());
for (const [key, value] of Object.entries(process.env)) {
  if ((skipKeys.has(key.toUpperCase()) || isIgnoreScripts(key)) && !disabledSetting(value)) {
    throw new Error(`Refusing a production build with inherited ${key}; the complete Next build and lifecycle hooks are required.`);
  }
}
if (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') {
  throw new Error('Refusing a production build with non-production NODE_ENV.');
}
const env = { ...process.env, CF_DEPLOY_TARGET: 'workers', INDEXNOW_DEFER: '1', NEXT_PUBLIC_ADS_DISABLED: '0',
  NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1', WRANGLER_SEND_METRICS: 'false' };
// Remove case/underscore aliases before writing one canonical setting (Windows
// environment keys are case-insensitive). This also overrides .npmrc defaults.
for (const key of Object.keys(env)) {
  if (skipKeys.has(key.toUpperCase()) || isIgnoreScripts(key)) delete env[key];
}
Object.assign(env, { SKIP_NEXT_APP_BUILD: '0', SKIP_WRANGLER_CONFIG_CHECK: '0', npm_config_ignore_scripts: 'false' });
function run(script, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], { cwd: root, env, stdio: 'inherit', windowsHide: true });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Production build verification exited ${code}`)));
  });
}
const adapter = path.join(root, 'node_modules/@opennextjs/cloudflare/dist/cli/index.js');
await run(adapter, ['build', '--skipNextBuild=false', '--skipWranglerConfigCheck=false']);
// The static-assets cache is copied into the publishable assets by this local
// adapter step. Complete it before recording artifact verification; never use
// the remote cache command in a build.
await run(adapter, ['populateCache', 'local', '--config', 'wrangler.jsonc']);
await run(path.join(root, 'scripts/verify-production-worker.mjs'));
