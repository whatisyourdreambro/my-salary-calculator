// Local-only OpenNext validation. The adapter hardcodes .next, so build in its own cwd.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const stage = path.join(root, '.open-next-qa');
const [mode, ...args] = process.argv.slice(2);
if (!['build', 'start', 'check'].includes(mode)) throw new Error('Use qa:cf:build, qa:cf:start or qa:cf:check; remote operations are forbidden.');
let port = 3319;
if (args.length) {
  if (mode !== 'start' || args.length !== 2 || args[0] !== '--port' || !/^\d+$/.test(args[1])) throw new Error('Only start --port <1024..65535> is supported.');
  port = Number(args[1]);
  if (port < 1024 || port > 65535) throw new Error('QA port must be 1024..65535.');
}
const env = {
  ...process.env, CI: 'true', MSY_QA_MODE: '1', MSY_QA_WORKER_STAGE: '1',
  MSY_QA_PAGES_STAGE: '0', MSY_PAGES_STATIC_EXPORT: '0',
  NEXT_PUBLIC_ADS_DISABLED: '1', NEXT_TELEMETRY_DISABLED: '1', WRANGLER_SEND_METRICS: 'false',
  ANALYZE: 'false',
  // No .env/.dev.vars or production secrets enter the isolated installation.
  CLOUDFLARE_ENV: '', CF_PAGES: '', CF_PAGES_BRANCH: '', INDEXNOW_FORCE: '',
};
for (const key of Object.keys(env)) {
  if (/^(?:CLOUDFLARE_|CF_API_|CF_ACCOUNT_|FEEDBACK_|CONTACT_|AWS_|R2_)/.test(key)) delete env[key];
}
const marker = path.join(stage, 'moneysalary-qa-build.json');
const worker = path.join(stage, 'cloudflare', 'worker-entry.mjs');
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
function outputHash() {
  const digest = createHash('sha256');
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error('QA output must not contain symbolic links');
      if (entry.isDirectory()) walk(file);
      else digest.update(path.relative(stage, file).replaceAll('\\', '/') + '\0' + hash(file) + '\n');
    }
  }
  walk(path.join(stage, '.open-next'));
  // The request-size guard is part of the executable Worker, outside generated output.
  walk(path.join(stage, 'cloudflare'));
  return digest.digest('hex');
}
function run(script, argv) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...argv], { cwd: stage, env, stdio: 'inherit', windowsHide: true });
    const stop = signal => child.kill(signal);
    const sigint = () => stop('SIGINT');
    const sigterm = () => stop('SIGTERM');
    process.on('SIGINT', sigint); process.on('SIGTERM', sigterm);
    child.once('error', reject);
    child.once('exit', code => {
      process.off('SIGINT', sigint); process.off('SIGTERM', sigterm);
      if (code === 0) resolve();
      else reject(new Error(`Local QA command exited ${code}`));
    });
  });
}
const adapter = path.join(stage, 'node_modules/@opennextjs/cloudflare/dist/cli/index.js');
const wrangler = path.join(stage, 'node_modules/wrangler/bin/wrangler.js');
async function validateConfig() {
  const { unstable_readConfig } = await import('wrangler');
  const config = await unstable_readConfig({ config: path.join(stage, 'wrangler.jsonc') });
  const hasRemote = value => value && typeof value === 'object' && Object.entries(value)
    .some(([key, child]) => (key === 'remote' && child === true) || hasRemote(child));
  if (hasRemote(config) || config.account_id || config.routes?.length || config.route
    || config.services?.length || config.d1_databases?.length || config.r2_buckets?.length
    || config.kv_namespaces?.length || config.durable_objects?.bindings?.length
    || config.analytics_engine_datasets?.length || config.hyperdrive?.length || config.vectorize?.length
    || config.queues?.producers?.length || config.queues?.consumers?.length || config.send_email?.length
    || config.dispatch_namespaces?.length || config.browser || config.ai || config.images
    || Object.keys(config.vars || {}).length || config.workers_dev !== false || config.preview_urls !== false)
    throw new Error('QA requires the local-only configuration without deployment routes, remote resources or production variables.');
  if (path.resolve(config.main) !== worker || path.resolve(stage, config.assets.directory) !== path.join(stage, '.open-next/assets'))
    throw new Error('QA Worker and assets must stay inside the isolated stage');
}
if (mode === 'build') {
  if (existsSync(stage)) {
    // Only this owned, fixed workspace child may be recursively replaced.
    if (realpathSync(stage) !== path.resolve(stage) || path.dirname(path.resolve(stage)) !== path.resolve(root)) throw new Error('Unsafe QA staging path');
    if (!existsSync(path.join(stage, '.moneysalary-qa-stage'))) throw new Error('Refusing to replace an unowned QA staging directory');
    rmSync(stage, { recursive: true, force: true });
  }
  mkdirSync(stage);
  writeFileSync(path.join(stage, '.moneysalary-qa-stage'), 'Advertisement-free local QA only. Never deploy.\n');
  for (const item of ['src', 'public', 'scripts', 'vendor', 'cloudflare', 'package.json', 'package-lock.json', 'next.config.mjs', 'open-next.config.ts',
    'tsconfig.json', 'eslint.config.mjs', 'postcss.config.cjs', 'tailwind.config.ts', 'vitest.config.mts']) {
    cpSync(path.join(root, item), path.join(stage, item), { recursive: true });
  }
  // Production routes and bindings never enter QA, even after a Workers cutover.
  cpSync(path.join(root, 'wrangler.qa.jsonc'), path.join(stage, 'wrangler.jsonc'));
  // Tests remain in the main checkout; Next still checks all application types in this copy.
  // No public build env file is copied: real ads are compiled out by the forced flag above.
  const npm = process.env.npm_execpath || path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  if (!existsSync(npm)) throw new Error('Run through npm run qa:cf:build so the local npm CLI is available.');
  await run(npm, ['ci', '--no-audit', '--no-fund']);
  await validateConfig();
  await run(adapter, ['build', '--config', 'wrangler.jsonc']);
  await run(adapter, ['populateCache', 'local', '--config', 'wrangler.jsonc']);
  const built = JSON.parse(readFileSync(path.join(stage, '.next/required-server-files.json'), 'utf8'));
  const headers = JSON.parse(readFileSync(path.join(stage, '.next/routes-manifest.json'), 'utf8')).headers;
  if (!headers.some(rule => rule.headers.some(h => h.key.toLowerCase() === 'x-moneysalary-qa' && h.value === 'ads-disabled')))
    throw new Error('Missing ad-free response marker in the compiled worker');
  if (built.config.distDir !== '.next') throw new Error('OpenNext requires the isolated .next output');
  writeFileSync(marker, JSON.stringify({ adsDisabled: true, generatedAt: new Date().toISOString(),
    workerHash: hash(worker), outputHash: outputHash(), configHash: hash(path.join(stage, 'wrangler.jsonc')), lockHash: hash(path.join(stage, 'package-lock.json')) }, null, 2) + '\n');
} else {
  if (!existsSync(marker)) throw new Error('Missing verified ad-free worker. Run npm run qa:cf:build first.');
  const verified = JSON.parse(readFileSync(marker, 'utf8'));
  await validateConfig();
  if (verified.adsDisabled !== true || verified.workerHash !== hash(worker) || verified.outputHash !== outputHash()
    || verified.lockHash !== hash(path.join(stage, 'package-lock.json')) || verified.configHash !== hash(path.join(stage, 'wrangler.jsonc')))
    throw new Error('The verified QA worker/config changed; rebuild before starting.');
  if (mode === 'start') {
    await run(wrangler, ['dev', '--local', '--config', 'wrangler.jsonc', '--ip', '127.0.0.1', '--port', String(port), '--inspector-port', '0']);
  } else {
    // --dry-run never uploads or deploys. It checks the actual Cloudflare bundle.
    await run(wrangler, ['deploy', '--dry-run', '--config', 'wrangler.jsonc', '--outdir', '.wrangler-dry-run']);
  }
}
