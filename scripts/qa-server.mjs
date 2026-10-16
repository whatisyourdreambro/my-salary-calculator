// A separate ad-free build directory prevents QA flags from contaminating deployment builds.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('..', import.meta.url));
const [mode, ...args] = process.argv.slice(2);
if (!['dev', 'build', 'start'].includes(mode)) {
  throw new Error('Use qa:dev, qa:build or qa:start. Unverified Cloudflare/production preview servers are disabled for QA.');
}
let port = 3100;
if (args.length) {
  if (mode === 'build' || args.length !== 2 || !['-p', '--port'].includes(args[0]) || !/^\d+$/.test(args[1])) {
    throw new Error('Only --port <1024..65535> is supported; QA always binds to 127.0.0.1.');
  }
  port = Number(args[1]);
  if (port < 1024 || port > 65535) throw new Error('QA port must be 1024..65535.');
}
const marker = path.join(root, '.next-qa', 'moneysalary-qa-build.json');
if (mode === 'start') {
  if (!existsSync(marker) || JSON.parse(readFileSync(marker, 'utf8')).adsDisabled !== true) {
    throw new Error('Missing ad-free QA build. Run npm run qa:build first; production .next builds cannot be used.');
  }
}
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), mode,
  ...(mode === 'build' ? [] : ['--hostname', '127.0.0.1', '--port', String(port)])], {
  cwd: root,
  stdio: 'inherit',
  // The Cloudflare staging exception must never redirect ordinary QA into .next.
  env: { ...process.env, MSY_QA_MODE: '1', MSY_QA_WORKER_STAGE: '0', NEXT_PUBLIC_ADS_DISABLED: '1', NEXT_TELEMETRY_DISABLED: '1' },
  windowsHide: true,
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code, signal) => {
  if (mode === 'build' && code === 0) writeFileSync(marker, JSON.stringify({ adsDisabled: true, generatedAt: new Date().toISOString() }) + '\n');
  process.exitCode = code ?? (signal ? 1 : 0);
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
