// Build/package only, or run the verified ad-free artifact on literal loopback.
// No upload/deploy/remote-preview command exists here.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { artifactHash, BUILD_MARKER, checkAssetLimits, checkWorkerBundle, cleanBuildEnvironment, compileRoutingConfig,
  copySources, EXCLUDED_SOURCE_PATHS, inventoryHash, packageExport, QA_ASSETS_IGNORE, resetOwnedStage, sha256,
  readPublicBuildConfiguration, sourceInventory, stagePath, verifyArtifact, workerModuleInventory,
  createNativeReleaseAttestation } from './lib/pages-export.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

export function parseArgs(args) {
  const [command, ...rest] = args;
  if (!['build', 'verify', 'start', 'serve-internal'].includes(command))
    throw new Error('Use pages-build.mjs build|verify|start --mode qa|production [--port 3320]. No remote commands.');
  let mode;
  let port = 3320;
  let hasPort = false;
  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i], value = rest[i + 1];
    if (key === '--mode' && !mode && ['qa', 'production'].includes(value)) mode = value;
    else if (key === '--port' && ['start', 'serve-internal'].includes(command) && /^\d+$/.test(value || '')
      && Number(value) >= 1024 && Number(value) <= 65535 && !hasPort) { port = Number(value); hasPort = true; }
    else throw new Error('Invalid Pages command arguments');
  }
  if (!mode || (['start', 'serve-internal'].includes(command) && mode !== 'qa'))
    throw new Error('Local Pages start requires explicit --mode qa; production artifacts cannot run for QA');
  return { command, mode, port };
}

export function validateQaConfig(config) {
  const allowed = new Set(['$schema', 'name', 'pages_build_output_dir', 'compatibility_date', 'compatibility_flags']);
  if (!config || Object.keys(config).some(key => !allowed.has(key)) || config.name !== 'moneysalary-pages-local'
    || config.pages_build_output_dir !== 'dist' || config.compatibility_date !== '2025-09-08'
    || JSON.stringify(config.compatibility_flags) !== JSON.stringify(['nodejs_compat']))
    throw new Error('QA Pages config must contain only reviewed local settings, without bindings/routes/vars');
  return config;
}

export function qaMiniflareOptions(stage, config, port, denyOutbound) {
  validateQaConfig(config);
  if (path.basename(stage) !== '.pages-qa' || !Number.isInteger(port) || port < 1024 || port > 65535 || typeof denyOutbound !== 'function')
    throw new Error('Invalid local QA runtime options');
  if (readFileSync(path.join(stage, 'dist/.assetsignore'), 'utf8') !== QA_ASSETS_IGNORE)
    throw new Error('QA asset rules must keep the private Worker directory out of ASSETS');
  return { name: config.name, host: '127.0.0.1', port, cf: false,
    compatibilityDate: config.compatibility_date, compatibilityFlags: config.compatibility_flags,
    // Match Pages' private _worker.js directory. Relative virtual module paths
    // avoid Windows drive-letter specifiers; Data modules are genuine imports.
    modulesRoot: '/', modules: workerModuleInventory(path.join(stage, 'dist')).map(file => ({
      type: file.type, path: file.relative, contents: readFileSync(file.file, file.type === 'Data' ? undefined : 'utf8'),
    })),
    assets: { directory: path.join(stage, 'dist'), binding: 'ASSETS', run_worker_first: true,
      routerConfig: { has_user_worker: true },
      assetConfig: { html_handling: 'none', not_found_handling: 'none' } },
    outboundService: denyOutbound, unsafeRegisterWorker: false, unsafeLocalExplorer: false, unsafeObservability: false,
    logRequests: false };
}

export function pagesWorkerEntrySource() {
  // This import remains external so the Pages upload carries genuine Data
  // modules. Source application code has no dependency on generated files.
  return `import handler from '../cloudflare/pages-entry.ts';\n`
    + `import { pagesOgData } from './og/index.mjs';\n`
    + `export default { ...handler, fetch(request, env, context) {\n`
    + `  return handler.fetch.call(handler, request, { ...env, OG_STRIPS: pagesOgData }, context);\n`
    + `} };\n`;
}

function run(script, args, cwd, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], { cwd, env, stdio: 'inherit', windowsHide: true });
    const onInt = () => child.kill('SIGINT');
    const onTerm = () => child.kill('SIGTERM');
    process.on('SIGINT', onInt); process.on('SIGTERM', onTerm);
    const cleanup = () => { process.off('SIGINT', onInt); process.off('SIGTERM', onTerm); };
    child.once('error', error => { cleanup(); reject(error); });
    child.once('exit', code => { cleanup(); if (code === 0) resolve(); else reject(new Error(`Pages local build step exited ${code}`)); });
  });
}

function stageTsConfig(stage, ts) {
  const file = path.join(stage, 'tsconfig.json');
  const result = ts.readConfigFile(file, ts.sys.readFile);
  if (result.error) throw new Error('Cannot parse stage TypeScript configuration');
  const config = result.config;
  config.exclude = [...(config.exclude || []), 'scripts', 'cloudflare', 'generated', 'excluded-app-source',
    '**/__tests__/**', '**/*.test.ts', '**/*.test.tsx', '.pages-build', '.pages-qa'];
  writeJson(file, config);
}

function hideDynamicSources(stage) {
  for (const relative of EXCLUDED_SOURCE_PATHS) {
    const source = path.join(stage, relative);
    if (!existsSync(source)) throw new Error(`Expected dynamic source missing: ${relative}`);
    const destination = path.join(stage, 'excluded-app-source', relative);
    mkdirSync(path.dirname(destination), { recursive: true }); renameSync(source, destination);
  }
}
function restoreDynamicSources(stage) {
  for (const relative of EXCLUDED_SOURCE_PATHS) {
    const source = path.join(stage, 'excluded-app-source', relative);
    const destination = path.join(stage, relative);
    mkdirSync(path.dirname(destination), { recursive: true }); renameSync(source, destination);
  }
  // The owned temporary child now contains only empty directories.
  const target = path.resolve(stage, 'excluded-app-source');
  if (path.dirname(target) !== path.resolve(stage)) throw new Error('Unsafe temporary source path');
  rmSync(target, { recursive: true, force: true });
}

async function build(mode, nativeContext) {
  if (nativeContext && mode !== 'production') throw new Error('Native release cannot be a QA build');
  const stage = stagePath(root, mode);
  // Validate all supplied settings before replacing even an owned output directory.
  const publicConfiguration = readPublicBuildConfiguration(root, mode, process.env);
  const env = cleanBuildEnvironment(publicConfiguration.input, mode, stage);
  const rootRequire = createRequire(path.join(root, 'package.json'));
  const npm = process.env.npm_execpath || path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  if (!existsSync(npm)) throw new Error('Run the Pages build through its npm script so the npm CLI is available');
  // Run the Git-aware read-only ad audit against the real checkout. The stage is
  // not a Git checkout and must not replace this source-diff verification.
  await run(path.join(root, 'scripts/ad-audit.mjs'), [], root, env);
  resetOwnedStage(root, mode);
  const copied = copySources(root, stage);
  mkdirSync(env.HOME, { recursive: true });
  writeFileSync(env.npm_config_userconfig, ''); writeFileSync(env.npm_config_globalconfig, '');
  stageTsConfig(stage, rootRequire('typescript'));
  await run(npm, ['ci', '--include=dev', '--no-audit', '--no-fund'], stage, env);
  const stageRequire = createRequire(path.join(stage, 'package.json'));
  // Regenerate the reviewed local metadata before snapshotting native exports.
  // Calling only prebuild deliberately avoids the publication postbuild hook.
  await run(npm, ['run', 'prebuild'], stage, env);
  hideDynamicSources(stage);
  await run(stageRequire.resolve('next/dist/bin/next'), ['build'], stage, env);
  restoreDynamicSources(stage);
  await run(stageRequire.resolve('tsx/cli'), ['scripts/generate-pages-data.ts', '--out', path.join(stage, 'out')], stage, env);
  // OG generation is a mandatory deterministic build-time step; omission must
  // not silently publish a Worker whose image handler cannot find its assets.
  const ogGenerator = path.join(stage, 'scripts/generate-pages-og.ts');
  if (!existsSync(ogGenerator)) throw new Error('Missing static Pages OG generator');
  await run(stageRequire.resolve('tsx/cli'), [ogGenerator, '--out', path.join(stage, 'out')], stage, env);
  const previousEnv = process.env;
  let routing;
  try {
    process.env = env;
    const config = await import(pathToFileURL(path.join(stage, 'next.config.mjs')).href);
    if (typeof config.pagesRoutingConfig !== 'function') throw new Error('Missing pagesRoutingConfig export');
    const { pathToRegexp } = stageRequire('next/dist/compiled/path-to-regexp');
    routing = compileRoutingConfig(await config.pagesRoutingConfig(), pathToRegexp);
  } finally { process.env = previousEnv; }
  const buildId = readFileSync(path.join(stage, '.next/BUILD_ID'), 'utf8').trim();
  const packaged = packageExport({ stage, mode, routingConfig: routing, buildId });
  if (nativeContext) {
    packaged.manifest.nativeRelease = createNativeReleaseAttestation({ context: nativeContext, mode, buildId,
      sourceHash: copied.sourceHash, lockHash: sha256(readFileSync(path.join(stage, 'package-lock.json'))),
      publicConfigHash: publicConfiguration.identity.effectiveHash,
      sitemapSha256: sha256(readFileSync(path.join(stage, 'dist/sitemap.xml'))) });
    writeJson(path.join(stage, 'generated/native-release.json'), packaged.manifest.nativeRelease);
    writeJson(path.join(stage, 'generated/pages-manifest.json'), packaged.manifest);
  }
  const esbuild = stageRequire('esbuild');
  writeFileSync(path.join(stage, 'generated/pages-worker-entry.mjs'), pagesWorkerEntrySource());
  const bundle = await esbuild.build({ absWorkingDir: stage, entryPoints: ['generated/pages-worker-entry.mjs'],
    outfile: 'dist/_worker.js/index.js', external: ['./og/index.mjs'],
    bundle: true, format: 'esm', platform: 'browser', target: 'es2022',
    minify: true, sourcemap: false, metafile: true, logLevel: 'warning',
    define: { __MSY_PAGES_MANIFEST__: JSON.stringify(packaged.manifest),
      'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_ADS_DISABLED': JSON.stringify(mode === 'qa' ? '1' : '0') } });
  const forbiddenRuntime = Object.keys(bundle.metafile.inputs).filter(file => /(?:^|\/)node_modules\/(?:next|@opennextjs|react|react-dom)(?:\/|$)/.test(file));
  if (forbiddenRuntime.length) throw new Error(`Pages Worker must not contain Next/OpenNext/React runtime: ${forbiddenRuntime[0]}`);
  const worker = checkWorkerBundle(path.join(stage, 'dist'));
  writeJson(path.join(stage, 'generated/worker-metafile.json'), bundle.metafile);
  if (mode === 'production') {
    const { verifyPagesAdvertising } = await import(pathToFileURL(path.join(stage, 'scripts/verify-pages-advertising.mjs')).href);
    writeJson(path.join(stage, 'generated/pages-advertising-verification.json'), verifyPagesAdvertising(stage));
  }
  const sourceHash = inventoryHash(sourceInventory(root));
  if (sourceHash !== copied.sourceHash) throw new Error('Source changed during Pages build; rebuild before publication');
  if (mode === 'production' && readPublicBuildConfiguration(root, mode).identity.fileHash !== publicConfiguration.identity.fileHash)
    throw new Error('Public configuration changed during Pages build; rebuild before publication');
  const config = validateQaConfig(JSON.parse(readFileSync(path.join(stage, 'wrangler.pages.qa.jsonc'), 'utf8')));
  if (mode === 'qa' && !routing.headers.some(rule => rule.headers.some(h => h.key.toLowerCase() === 'x-moneysalary-qa' && h.value === 'ads-disabled')))
    throw new Error('Missing compiled ad-free QA response marker');
  const marker = { version: 1, mode, adsDisabled: mode === 'qa', buildId, generatedAt: new Date().toISOString(),
    ...(mode === 'production' ? { publicConfig: publicConfiguration.identity } : {}),
    sourceHash, lockHash: sha256(readFileSync(path.join(stage, 'package-lock.json'))),
    configHash: sha256(readFileSync(path.join(stage, 'wrangler.pages.qa.jsonc'))),
    outputHash: artifactHash(stage), documentCount: packaged.documentCount,
    ...checkAssetLimits(path.join(stage, 'dist')), ...worker, compatibilityDate: config.compatibility_date };
  writeJson(path.join(stage, BUILD_MARKER), marker);
  console.log(JSON.stringify({ mode, buildId, assetCount: marker.assetCount, documentCount: marker.documentCount, verified: true }));
}

async function serve(stage, port) {
  if (process.env.MSY_PAGES_LOCAL_CHILD !== '1' || process.env.MSY_QA_MODE !== '1' || process.env.NEXT_PUBLIC_ADS_DISABLED !== '1')
    throw new Error('Internal Pages server can only start through the verified QA launcher');
  const require = createRequire(path.join(stage, 'package.json'));
  const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
  const { Miniflare, convertV4MiniflareOptions } = wranglerRequire('miniflare');
  const config = JSON.parse(readFileSync(path.join(stage, 'wrangler.pages.qa.jsonc'), 'utf8'));
  const denyOutbound = () => new Response('MoneySalary QA external network is disabled', { status: 403 });
  const options = convertV4MiniflareOptions(qaMiniflareOptions(stage, config, port, denyOutbound));
  // Assert the installed converter preserved the security boundary before Workerd starts.
  if (options.host !== '127.0.0.1' || options.cf !== false || options.workers.length !== 1
    || options.workers[0].dev.outboundService.type !== 'fetcher'
    || options.workers[0].dev.outboundService.handler !== denyOutbound) throw new Error('Miniflare QA isolation contract changed');
  const mf = new Miniflare(options);
  const base = await mf.ready;
  if (base.hostname !== '127.0.0.1' || base.port !== String(port)) { await mf.dispose(); throw new Error('QA runtime did not bind literal loopback'); }
  console.log(`Ad-free Pages QA ready at ${base.origin}; external Worker fetches denied; no remote bindings.`);
  await new Promise(resolve => {
    const stop = () => { process.off('SIGINT', stop); process.off('SIGTERM', stop); resolve(); };
    process.on('SIGINT', stop); process.on('SIGTERM', stop);
  });
  await mf.dispose();
}

export async function main(args = process.argv.slice(2), nativeContext) {
  const { command, mode, port } = parseArgs(args);
  if (command === 'build') return build(mode, nativeContext);
  const verified = verifyArtifact(root, mode);
  if (command === 'verify') {
    if (mode === 'production') {
      const { verifyPagesAdvertising } = await import('./verify-pages-advertising.mjs');
      verifyPagesAdvertising(verified.stage);
    }
    console.log(JSON.stringify({ mode, buildId: verified.marker.buildId, assetCount: verified.assetCount, verified: true })); return;
  }
  if (command === 'serve-internal') return serve(verified.stage, port);
  const env = cleanBuildEnvironment(process.env, 'qa', verified.stage);
  env.MSY_PAGES_LOCAL_CHILD = '1';
  await run(fileURLToPath(import.meta.url), ['serve-internal', '--mode', 'qa', '--port', String(port)], root, env);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
