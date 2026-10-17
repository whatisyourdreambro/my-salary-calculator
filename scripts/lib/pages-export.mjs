// Filesystem-only Pages packaging. Never renders pages or contacts the network.
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const PAGES_LIMITS = Object.freeze({ files: 20000, assetBytes: 25 * 1024 * 1024 });
// The existing Pages API rejected a 53 MB package with code 8000101 on
// 2026-10-17. Its 25 MiB limit is lower than the generic Workers documentation.
export const PAGES_WORKER_LIMIT = 25 * 1024 * 1024;
export const QA_ASSETS_IGNORE = '/_worker.js/\n/_routes.json\n';
export const OG_POOL_CHUNK_BYTES = 1024 * 1024;
export const OG_RAW_MODULE_BYTES = Object.freeze({ 'pool.bin': 38907807,
  'glyphs-36.bin': 4923628, 'glyphs-64.bin': 8059908 });
export const OG_POOL_MODULES = Object.freeze(Array.from({ length: Math.ceil(OG_RAW_MODULE_BYTES['pool.bin'] / OG_POOL_CHUNK_BYTES) },
  (_, index) => `og/pool-${String(index).padStart(2, '0')}.bin`));
export const OG_WORKER_MODULES = Object.freeze(['og/config.mjs', 'og/inflate.mjs', 'og/glyphs-36.bin', 'og/glyphs-64.bin',
  'og/index.mjs', ...OG_POOL_MODULES]);
export const STAGE_MARKER = '.moneysalary-pages-stage.json';
export const BUILD_MARKER = 'moneysalary-pages-build.json';
export const EXCLUDED_SOURCE_PATHS = Object.freeze([
  'src/middleware.ts', 'src/app/api/contact', 'src/app/api/feedback', 'src/app/api/og',
  'src/app/api/salary-table', 'src/app/widget/company', 'src/app/share/[data]',
]);
export const SOURCE_ITEMS = Object.freeze(['src', 'public', 'scripts', 'vendor', 'cloudflare',
  'package.json', 'package-lock.json', 'next.config.mjs', 'tsconfig.json', 'eslint.config.mjs',
  'postcss.config.cjs', 'tailwind.config.ts', 'wrangler.pages.qa.jsonc']);
export const PUBLIC_BUILD_KEYS = Object.freeze([
  ...['HOME_TOP', 'CALC_RESULT', 'GUIDE_MID', 'SIDEBAR', 'IN_ARTICLE', 'MULTIPLEX', 'DISPLAY_2', 'COMPANY_TOP']
    .map(name => `NEXT_PUBLIC_ADSENSE_SLOT_${name}`),
  'NEXT_PUBLIC_KAKAO_JS_KEY', 'NEXT_PUBLIC_ADS_ID', 'NEXT_PUBLIC_CONVERSION_LABEL_CALCULATION',
  'NEXT_PUBLIC_CONVERSION_LABEL_PAGEVIEW', 'NEXT_PUBLIC_GA_ID',
]);
export const PUBLIC_BUILD_CONFIG = '.env.production';
const PUBLIC_CONFIG_MAX_BYTES = 64 * 1024;

export const sha256 = value => createHash('sha256').update(value).digest('hex');
const slash = value => value.replaceAll('\\', '/');
const isWorkerFile = relative => relative === '_worker.js' || relative.startsWith('_worker.js/');
const json = file => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); };

export function stagePath(root, mode) {
  if (!['qa', 'production'].includes(mode)) throw new Error('Pages mode must be qa or production');
  return path.join(path.resolve(root), mode === 'qa' ? '.pages-qa' : '.pages-build');
}

export function inspectOwnedStage(root, mode, requireMarker = true) {
  const stage = stagePath(root, mode);
  if (realpathSync(root) !== path.resolve(root)) throw new Error('Pages root must not be a symbolic link');
  if (existsSync(stage)) {
    if (lstatSync(stage).isSymbolicLink() || realpathSync(stage) !== stage || path.dirname(stage) !== path.resolve(root))
      throw new Error('Unsafe Pages stage path');
    if (requireMarker && (!existsSync(path.join(stage, STAGE_MARKER))
      || json(path.join(stage, STAGE_MARKER)).mode !== mode)) throw new Error('Refusing unowned Pages stage');
  } else if (requireMarker) throw new Error('Pages stage is missing; build it first');
  return stage;
}

export function resetOwnedStage(root, mode) {
  const stage = stagePath(root, mode);
  if (existsSync(stage)) {
    inspectOwnedStage(root, mode);
    // Exact fixed child, ownership and resolved path have been checked above.
    rmSync(stage, { recursive: true, force: true });
  } else inspectOwnedStage(root, mode, false);
  mkdirSync(stage);
  writeJson(path.join(stage, STAGE_MARKER), { version: 1, mode, purpose: mode === 'qa' ? 'Local ad-free QA only; never deploy' : 'Publication build; never run for QA' });
  return stage;
}

export function listFiles(directory) {
  if (!existsSync(directory)) return [];
  const result = [];
  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const file = path.join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symbolic links are forbidden in Pages input/output: ${slash(path.relative(directory, file))}`);
      if (entry.isDirectory()) walk(file);
      else if (entry.isFile()) result.push({ file, relative: slash(path.relative(directory, file)), size: statSync(file).size });
      else throw new Error('Non-regular Pages input/output');
    }
  }
  walk(directory);
  return result;
}

export function copyableSource(relative, { excludeRoutes = true } = {}) {
  const normalized = slash(relative);
  if (normalized.split('/').some(segment => (segment.startsWith('.') && segment !== '.well-known') || segment === 'node_modules'
    || /^(?:credentials?|secrets?)$/i.test(segment) || /\.(?:pem|key|p12|pfx)$/i.test(segment))) return false;
  if (/(?:^|\/)(?:__tests__|__snapshots__)(?:\/|$)|\.(?:test|spec)\.[^.]+$/.test(normalized)) return false;
  return !excludeRoutes || !EXCLUDED_SOURCE_PATHS.some(item => normalized === item || normalized.startsWith(`${item}/`));
}

export function sourceInventory(root) {
  const files = [];
  for (const item of SOURCE_ITEMS) {
    const file = path.join(root, item);
    if (!existsSync(file)) throw new Error(`Missing Pages source: ${item}`);
    if (lstatSync(file).isSymbolicLink()) throw new Error('Pages source cannot be a symbolic link');
    if (statSync(file).isDirectory()) {
      for (const child of listFiles(file)) {
        const relative = `${item}/${child.relative}`;
        // Dynamic handlers are needed by build-time data generation and worker bundling;
        // keep them in the inventory even though they are removed from Next's app tree.
        if (copyableSource(relative, { excludeRoutes: false })) files.push({ file: child.file, relative });
      }
    } else files.push({ file, relative: item });
  }
  return files.sort((a, b) => a.relative.localeCompare(b.relative, 'en'));
}

export function inventoryHash(files) {
  const hash = createHash('sha256');
  for (const { relative, file } of files) hash.update(relative + '\0' + sha256(readFileSync(file)) + '\n');
  return hash.digest('hex');
}

export function copySources(root, stage) {
  const inventory = sourceInventory(root);
  for (const { file, relative } of inventory) {
    // Preserve the excluded handlers outside app so data generation/bundling can
    // consume original source after Next has completed without exposing routes.
    const destination = path.join(stage, relative);
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(file, destination);
  }
  return { inventory, sourceHash: inventoryHash(inventory) };
}

function assertNoInheritedQaSettings(input) {
  if (['MSY_QA_MODE', 'NEXT_PUBLIC_ADS_DISABLED', 'MSY_QA_PAGES_STAGE', 'MSY_QA_WORKER_STAGE']
    .some(key => input[key] === '1')) throw new Error('Production Pages build refuses inherited QA settings');
}

function assertPublicBuildValue(key, value) {
  const valid = typeof value === 'string' && (key.startsWith('NEXT_PUBLIC_ADSENSE_SLOT_') ? /^\d{10}$/.test(value)
    : key === 'NEXT_PUBLIC_KAKAO_JS_KEY' ? /^[a-f0-9]{32}$/i.test(value)
      : key === 'NEXT_PUBLIC_ADS_ID' ? /^AW-\d+$/.test(value)
        : key === 'NEXT_PUBLIC_GA_ID' ? /^G-[A-Z0-9]+$/.test(value) : /^[A-Za-z0-9_-]{1,100}$/.test(value));
  if (!valid) throw new Error(`Invalid approved public build setting: ${key}`);
}

// Deliberately not a general dotenv evaluator: no expansion, escapes, multiline
// values, shell syntax or unreviewed keys. Invalid file values cannot be hidden
// by an environment override. Nothing here logs configuration values.
export function loadPublicBuildSettings(fileText, input = {}) {
  assertNoInheritedQaSettings(input);
  if (typeof fileText !== 'string' || Buffer.byteLength(fileText) > PUBLIC_CONFIG_MAX_BYTES)
    throw new Error('Invalid public build configuration text');
  const approved = new Set(PUBLIC_BUILD_KEYS);
  const settings = Object.create(null);
  for (const raw of fileText.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const match = /^([A-Z][A-Z0-9_]+)=(.*)$/.exec(line);
    if (!match || !approved.has(match[1]) || Object.hasOwn(settings, match[1]))
      throw new Error('Unexpected or duplicate key in public build configuration');
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
      value = value.slice(1, -1);
    assertPublicBuildValue(match[1], value);
    settings[match[1]] = value;
  }
  for (const key of Object.keys(input)) {
    if (key.startsWith('NEXT_PUBLIC_') && key !== 'NEXT_PUBLIC_ADS_DISABLED' && !approved.has(key))
      throw new Error('Unreviewed public build environment key');
  }
  for (const key of PUBLIC_BUILD_KEYS) {
    if (input[key] === undefined) continue;
    assertPublicBuildValue(key, input[key]);
    settings[key] = input[key];
  }
  return settings;
}

// QA returns before any access to .env.production. Publication configuration is
// read only from the exact regular root file and is never part of copied input.
export function readPublicBuildConfiguration(root, mode, input = {}) {
  stagePath(root, mode);
  if (mode === 'qa') return { input, identity: null };
  assertNoInheritedQaSettings(input);
  const resolvedRoot = path.resolve(root);
  const file = path.join(resolvedRoot, PUBLIC_BUILD_CONFIG);
  if (realpathSync(root) !== resolvedRoot || !existsSync(file) || !lstatSync(file).isFile()
    || lstatSync(file).isSymbolicLink() || realpathSync(file) !== file || statSync(file).size > PUBLIC_CONFIG_MAX_BYTES)
    throw new Error('Public build configuration must be the owned regular root file');
  const bytes = readFileSync(file);
  const settings = loadPublicBuildSettings(new TextDecoder('utf-8', { fatal: true }).decode(bytes), input);
  const effective = PUBLIC_BUILD_KEYS.filter(key => Object.hasOwn(settings, key)).map(key => [key, settings[key]]);
  return { input: { ...input, ...settings }, identity: { path: PUBLIC_BUILD_CONFIG, fileHash: sha256(bytes),
    effectiveHash: sha256(JSON.stringify(effective)), overriddenKeys: PUBLIC_BUILD_KEYS.filter(key => input[key] !== undefined) } };
}

export function cleanBuildEnvironment(input, mode, stage) {
  stagePath(path.dirname(stage), mode); // validate mode even for direct unit callers
  if (mode === 'production') assertNoInheritedQaSettings(input);
  const env = {};
  // A copied Windows environment is an ordinary case-sensitive object. Preserve
  // ComSpec/Path/windir after public settings are merged, without copying secrets.
  for (const key of ['SYSTEMROOT', 'WINDIR', 'PATH', 'PATHEXT', 'COMSPEC', 'TEMP', 'TMP', 'TMPDIR']) {
    const aliases = Object.keys(input).filter(name => name.toUpperCase() === key && input[name] !== undefined);
    const values = [...new Set(aliases.map(name => input[name]))];
    if (values.length > 1) throw new Error(`Ambiguous build system environment setting: ${key}`);
    if (values.length === 1) env[key] = values[0];
  }
  Object.assign(env, { CI: 'true', NODE_ENV: 'production', MSY_PAGES_STATIC_EXPORT: '1',
    NEXT_PUBLIC_ADS_DISABLED: mode === 'qa' ? '1' : '0', MSY_QA_MODE: mode === 'qa' ? '1' : '0',
    MSY_QA_PAGES_STAGE: mode === 'qa' ? '1' : '0', NEXT_TELEMETRY_DISABLED: '1', WRANGLER_SEND_METRICS: 'false',
    CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false', CLOUDFLARE_CF_FETCH_ENABLED: 'false', ANALYZE: 'false',
    HOME: path.join(stage, 'build-home'), USERPROFILE: path.join(stage, 'build-home'),
    npm_config_userconfig: path.join(stage, 'empty-user.npmrc'), npm_config_globalconfig: path.join(stage, 'empty-global.npmrc'),
    npm_config_registry: 'https://registry.npmjs.org/', npm_config_audit: 'false', npm_config_fund: 'false' });
  if (mode === 'production') {
    for (const key of PUBLIC_BUILD_KEYS) {
      const value = input[key];
      if (value === undefined) continue;
      assertPublicBuildValue(key, value);
      env[key] = value;
    }
    for (const slot of ['HOME_TOP', 'CALC_RESULT', 'GUIDE_MID', 'COMPANY_TOP'])
      if (!env[`NEXT_PUBLIC_ADSENSE_SLOT_${slot}`]) throw new Error(`Missing production public ad slot: ${slot}`);
  }
  return env;
}

// Manifest keys use URL.pathname spelling: one decode, then encodeURI. Ambiguous
// encoded separators, double encodings and query/hash characters are rejected.
export function canonicalPathname(input) {
  if (typeof input !== 'string' || !input.startsWith('/') || input.startsWith('//')) throw new Error('Invalid Pages pathname');
  if (/%(?:2f|5c|3f|23)/i.test(input)) throw new Error('Encoded Pages separators are forbidden');
  let decoded;
  try { decoded = decodeURIComponent(input); } catch { throw new Error('Malformed Pages pathname encoding'); }
  if (/[\\?#\u0000-\u0020\u007f%]/.test(decoded) || decoded.includes('//') || decoded.split('/').some(x => x === '.' || x === '..'))
    throw new Error('Ambiguous Pages pathname');
  return encodeURI(decoded);
}

export function compileRoutingConfig(config, pathToRegexp) {
  if (!Array.isArray(config?.headers) || !Array.isArray(config?.redirects)) throw new Error('Missing Pages routing configuration');
  const compile = rule => {
    const keys = [];
    const regexp = pathToRegexp(rule.source, keys, { sensitive: false, strict: false, delimiter: '/' });
    return { ...rule, regex: regexp.source, flags: regexp.flags, keys: keys.map(key => String(key.name)) };
  };
  return { headers: config.headers.map(compile), redirects: config.redirects.map(rule => ({ ...compile(rule),
    statusCode: rule.statusCode ?? (rule.permanent ? 308 : 307) })) };
}

const MIME = { '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.csv': 'text/csv; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.webmanifest': 'application/manifest+json' };
export const contentType = file => MIME[path.extname(file)] || 'application/octet-stream';
function publicHeaders(meta) {
  if (Object.keys(meta?.headers || {}).some(name => /^(?:set-cookie|authorization|proxy-authorization)$/i.test(name)))
    throw new Error('Private response header in static Pages export');
  return Object.fromEntries(Object.entries(meta?.headers || {}).filter(([name]) => !/^x-(?:next|matched)/i.test(name)));
}

/** Inspect trusted generated HTML, excluding Flight and other inert raw-text containers. */
export function assertEnglishNotFoundDocument(html) {
  const markup = html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  const head = /<head\b[^>]*>([\s\S]*?)<\/head\s*>/i.exec(markup)?.[1] || '';
  const body = /<body\b[^>]*>([\s\S]*?)<\/body\s*>/i.exec(markup)?.[1] || '';
  if (/<html\b[^>]*\bid=["']__next_error__["']/i.test(markup)
    || !/<title\b[^>]*>Page not found \| Moneysalary<\/title\s*>/i.test(head)
    || !/<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["']noindex, nofollow["'])[^>]*>/i.test(head)
    || !/<(?:div|main)\b[^>]*\bdata-page-state=["']not-found["'][^>]*>/i.test(body)
    || !/<div\b(?=[^>]*\blang=["']en["'])(?=[^>]*\bdata-english-page(?:\s|=|>))[^>]*>/i.test(body)
    || !/<h1\b[^>]*>This English page could not be found<\/h1\s*>/i.test(body)
    || !['/en', '/en/calculators', '/en/guides'].every(href => new RegExp(`<a\\b[^>]*\\bhref=["']${href}["'][^>]*>`, 'i').test(body)))
    throw new Error('English 404 export must contain a real English recovery document, not a Flight-only error shell');
}

export function packageExport({ stage, mode, routingConfig, buildId }) {
  const out = path.join(stage, 'out');
  const dist = path.join(stage, 'dist');
  if (existsSync(dist)) throw new Error('Pages dist already exists; rebuild in a fresh owned stage');
  const inputs = listFiles(out);
  // The generator emits private module inputs, not public downloadable assets.
  // Only the packager writes the final entry after injecting the route manifest.
  if (!inputs.some(x => x.relative === 'index.html') || !inputs.some(x => x.relative === '404.html'))
    throw new Error('Native export must contain index.html and 404.html');
  workerModuleInventory(out, { requireEntry: false });
  // The stage renders its one finite English recovery page explicitly. Never
  // substitute Next's error-shell HTML: it can contain the text only in Flight.
  const english404 = inputs.find(x => x.relative === 'en/page-unavailable.html');
  if (!english404) throw new Error('English 404 native export is missing');
  assertEnglishNotFoundDocument(readFileSync(english404.file, 'utf8'));
  const publicPaths = new Set(listFiles(path.join(stage, 'public')).map(x => x.relative));
  const html = inputs.filter(x => x.relative.endsWith('.html') && !x.relative.startsWith('_msy/') && !isWorkerFile(x.relative));
  const nativeHtmlCount = html.filter(x => !publicPaths.has(x.relative)).length;
  const privateFiles = new Set(html.map(x => x.relative));
  const routes = Object.create(null);
  const routeStatus = pathname => pathname === '/404' || pathname === '/en/page-unavailable' ? 404 : 200;
  mkdirSync(dist, { recursive: true });
  for (const entry of html) {
    const stem = entry.relative.slice(0, -5);
    // Verification HTML keeps its literal public .html URL but uses a .body
    // asset internally, avoiding Pages' automatic .html -> clean-URL redirect.
    const publicHtml = publicPaths.has(entry.relative);
    const pathname = canonicalPathname(publicHtml ? `/${entry.relative}` : stem === 'index' ? '/' : `/${stem.replace(/\/index$/, '')}`);
    if (Object.hasOwn(routes, pathname)) throw new Error(`Duplicate exported document route: ${pathname}`);
    const hash = sha256(pathname);
    const asset = `/_msy/doc/${hash}.body`;
    const txt = `${stem}.txt`;
    const rscAsset = !publicHtml && existsSync(path.join(out, txt)) ? `/_msy/doc/${hash}.txt` : null;
    const metaPath = path.join(stage, '.next/server/app', `${stem}.meta`);
    const meta = existsSync(metaPath) ? json(metaPath) : {};
    const headers = { ...publicHeaders(meta), 'content-type': 'text/html; charset=utf-8' };
    const status = pathname === '/en/page-unavailable' ? 404 : meta.status || routeStatus(pathname);
    if (![200, 404].includes(status)) throw new Error(`Unexpected static document status: ${status}`);
    if (status === 404) Object.assign(headers, { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow' });
    routes[pathname] = { asset, rscAsset, status, contentType: headers['content-type'], headers };
    mkdirSync(path.dirname(path.join(dist, asset)), { recursive: true });
    copyFileSync(entry.file, path.join(dist, asset));
    if (rscAsset) { copyFileSync(path.join(out, txt), path.join(dist, rscAsset)); privateFiles.add(txt); }
  }
  for (const entry of inputs) {
    if (privateFiles.has(entry.relative) || ['_routes.json', '_headers', '_redirects', '_worker.js'].includes(entry.relative)) continue;
    if (entry.relative.startsWith('_msy/doc/') || /(?:^|\/)\.env/.test(entry.relative)) throw new Error('Reserved or sensitive output path');
    const destination = path.join(dist, entry.relative);
    mkdirSync(path.dirname(destination), { recursive: true }); copyFileSync(entry.file, destination);
    if (isWorkerFile(entry.relative)) continue;
    // Static route handlers carry their original content-type/cache/CSP in .meta.
    const metaPath = path.join(stage, '.next/server/app', `${entry.relative}.meta`);
    const meta = existsSync(metaPath) ? json(metaPath) : null;
    if (meta) routes[canonicalPathname(`/${entry.relative}`)] = { asset: canonicalPathname(`/${entry.relative}`), rscAsset: null,
      status: meta.status || 200, contentType: meta.headers?.['content-type'] || contentType(entry.relative),
      headers: { ...publicHeaders(meta), 'content-type': meta.headers?.['content-type'] || contentType(entry.relative) } };
  }
  if (!routes['/en/page-unavailable']) throw new Error('English 404 export is missing');
  // Keep a real top-level 404 for Pages' fallback semantics, never the SPA fallback.
  copyFileSync(path.join(out, '404.html'), path.join(dist, '404.html'));
  const publicAssets = inputs.filter(x => (!privateFiles.has(x.relative) || publicPaths.has(x.relative)) && !x.relative.startsWith('_msy/')
    && !isWorkerFile(x.relative) && !['_routes.json', '_headers', '_redirects'].includes(x.relative))
    .map(x => canonicalPathname(`/${x.relative}`)).sort();
  const manifest = { version: 1, mode, buildId, routes, publicAssets, notFound: { ko: '/404', en: '/en/page-unavailable' },
    redirects: routingConfig.redirects, headers: routingConfig.headers };
  writeJson(path.join(stage, 'generated/pages-manifest.json'), manifest);
  // Private document/data URLs must stay inside the Worker to reject direct requests.
  writeJson(path.join(dist, '_routes.json'), { version: 1, include: ['/*'], exclude: ['/_next/static/*',
    '/favicon.ico', '/favicon.svg', '/ads.txt', '/app-ads.txt', '/robots.txt', '/sitemap.xml', '/rss.xml', '/rss-companies.xml',
    '/icon-192.png', '/icon-512.png', '/icon-maskable-192.png', '/icon-maskable-512.png', '/apple-touch-icon.png',
    '/apple-touch-icon-precomposed.png', '/logo.svg', '/logo-full.png', '/grid.svg', '/og-default.png', '/sw.js'] });
  // Static assets bypass the Worker; provide the QA marker and immutable policy there.
  const oldHeaders = existsSync(path.join(stage, 'public/_headers')) ? readFileSync(path.join(stage, 'public/_headers'), 'utf8') : '';
  writeFileSync(path.join(dist, '_headers'), `${oldHeaders}\n${mode === 'qa' ? '/*\n  X-MoneySalary-QA: ads-disabled\n' : ''}`);
  // Pages upload excludes its private Worker directory automatically. Miniflare
  // needs this equivalent local-only rule, particularly for Data modules >25MiB.
  if (mode === 'qa') writeFileSync(path.join(dist, '.assetsignore'), QA_ASSETS_IGNORE);
  return { manifest, documentCount: nativeHtmlCount, ...checkAssetLimits(dist) };
}

export function checkAssetLimits(dist, limits = PAGES_LIMITS) {
  const files = listFiles(dist);
  const assets = files.filter(x => !isWorkerFile(x.relative) && !['_headers', '_redirects', '_routes.json', '.assetsignore'].includes(x.relative));
  if (assets.length > limits.files) throw new Error(`Pages asset count exceeds ${limits.files}`);
  const oversized = assets.find(x => x.size > limits.assetBytes);
  if (oversized) throw new Error(`Pages asset exceeds ${limits.assetBytes} bytes: ${oversized.relative}`);
  return { assetCount: assets.length, assetBytes: assets.reduce((sum, x) => sum + x.size, 0), maxAssetBytes: Math.max(0, ...assets.map(x => x.size)) };
}

export function workerModuleInventory(dist, { requireEntry = true } = {}) {
  const directory = path.join(dist, '_worker.js');
  if (!existsSync(directory) || lstatSync(directory).isSymbolicLink() || !lstatSync(directory).isDirectory())
    throw new Error('Pages Worker must be the reviewed private module directory');
  const files = listFiles(directory);
  const expected = [...(requireEntry ? ['index.js'] : []), ...OG_WORKER_MODULES].sort();
  if (JSON.stringify(files.map(file => file.relative).sort()) !== JSON.stringify(expected))
    throw new Error('Pages Worker module inventory is incomplete or contains unreviewed files');
  return files.map(file => ({ ...file, type: file.relative.endsWith('.bin') ? 'Data' : 'ESModule' }));
}

export function checkWorkerBundle(dist, { workerBytes = PAGES_WORKER_LIMIT } = {}) {
  const files = workerModuleInventory(dist);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > workerBytes) throw new Error(`Pages Worker modules exceed ${workerBytes} uncompressed bytes`);
  return { workerModuleCount: files.length, workerBytes: total,
    maxWorkerModuleBytes: Math.max(...files.map(file => file.size)), workerHash: inventoryHash(files) };
}

export function artifactHash(stage) {
  const files = ['dist', 'generated'].flatMap(dir => listFiles(path.join(stage, dir)).map(x => ({ file: x.file, relative: `${dir}/${x.relative}` })));
  return inventoryHash(files);
}

export function verifyArtifact(root, mode, input = process.env) {
  const stage = inspectOwnedStage(root, mode);
  const marker = json(path.join(stage, BUILD_MARKER));
  const manifest = json(path.join(stage, 'generated/pages-manifest.json'));
  if (mode === 'production') {
    // An intentional environment override is part of the reproducible input:
    // subsequent verification must supply the same effective public settings.
    const expected = readPublicBuildConfiguration(root, mode, input).identity;
    if (marker.publicConfig?.path !== expected.path || marker.publicConfig?.fileHash !== expected.fileHash
      || marker.publicConfig?.effectiveHash !== expected.effectiveHash)
      throw new Error('Pages public configuration is stale, changed or missing');
  }
  if (marker.version !== 1 || marker.mode !== mode || manifest.mode !== mode || marker.adsDisabled !== (mode === 'qa')
    || marker.buildId !== manifest.buildId || marker.outputHash !== artifactHash(stage)
    || marker.lockHash !== sha256(readFileSync(path.join(stage, 'package-lock.json')))
    || marker.configHash !== sha256(readFileSync(path.join(stage, 'wrangler.pages.qa.jsonc')))
    || marker.sourceHash !== inventoryHash(sourceInventory(root))) throw new Error('Pages artifact is stale, changed or has the wrong mode');
  const worker = checkWorkerBundle(path.join(stage, 'dist'));
  if (marker.workerHash !== worker.workerHash || marker.workerBytes !== worker.workerBytes
    || marker.workerModuleCount !== worker.workerModuleCount) throw new Error('Pages Worker module marker is stale or changed');
  return { stage, marker, manifest, ...checkAssetLimits(path.join(stage, 'dist')), ...worker };
}
