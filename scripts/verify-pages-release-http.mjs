// Non-rendering, bounded post-publication contracts. Never launches a browser,
// loads document subresources, follows redirects, retries or mutates Cloudflare.
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, realpathSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, inflateSync } from 'node:zlib';
import productionGuard from './lib/qa-production-http.cjs';
import bodyGuard from './lib/qa-pages-deployment-http.cjs';
import { assertEnglishNotFoundDocument, verifyArtifact } from './lib/pages-export.mjs';
import { assertProductionDeployment, configurationHash, localReleaseDirectory } from './lib/pages-release.mjs';
import { createReleaseApi } from './pages-release.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, '.artifacts/pages-release');
const ORIGIN = productionGuard.CANONICAL_PRODUCTION_ORIGIN;
const ACCOUNT = 'b01a4e306f09d28f1a0f1d57bda8410d';
const PROJECT = 'my-salary-calculator';
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const SHA = /^[a-f0-9]{40}$/, HASH = /^[a-f0-9]{64}$/;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const bounded = value => value === null ? null : String(value).replace(/[^\x20-\x7e]/g, '?').slice(0, 512);

export function assertPagesReleaseIdentity({ pins, marker, project, deployment }, now = Date.now()) {
  assert.match(pins?.deploymentId || '', UUID); assert.match(pins?.rollbackDeploymentId || '', UUID);
  assert.notEqual(pins.deploymentId, pins.rollbackDeploymentId);
  assert.match(pins.commit || '', SHA); assert.equal(pins.branch, 'main');
  for (const key of ['artifactHash', 'sourceHash', 'configurationHash']) assert.match(pins[key] || '', HASH);
  assert.match(pins.buildId || '', /^[A-Za-z0-9_-]{1,128}$/);
  assert.equal(pins.purgeVerified, true, 'Verified purge receipt is required before public contracts');
  assert.ok(typeof pins.purgedAt === 'string' && Number.isFinite(Date.parse(pins.purgedAt)) && Date.parse(pins.purgedAt) <= now);
  assert.equal(marker.mode, 'production'); assert.equal(marker.adsDisabled, false);
  assert.equal(marker.buildId, pins.buildId); assert.equal(marker.outputHash, pins.artifactHash);
  assert.equal(marker.sourceHash, pins.sourceHash);
  assert.equal(project.name, PROJECT); assert.equal(project.production_branch, 'main');
  assert.equal(project.canonical_deployment?.id, pins.deploymentId);
  assert.equal(configurationHash(project), pins.configurationHash, 'Production project settings changed');
  assertProductionDeployment(deployment, pins.commit, pins.deploymentId);
}

export function pagesReleaseCases() {
  const token = Buffer.from(JSON.stringify({ v: 1, taxYear: 2026, incomeType: 'regular', annualSalary: 50000000,
    nonTaxableAmount: 200000, dependents: 1, children: 0 })).toString('base64url');
  const doc = (kind, route, options = {}) => ({ kind, route, status: 200, type: 'text/html', ...options });
  const privateCases = [
    doc('valid-share', '/share/' + token, { private: true, shareToken: token, robots: 'noindex, nofollow' }),
    doc('invalid-share', '/share/not-valid', { private: true, invalidShare: true, robots: 'noindex, nofollow' }),
    doc('guide-search', '/guides?q=tax', { private: true, robots: 'noindex, follow' }),
    doc('english-404', '/en/not-a-pages-release-route', { status: 404, private: true, english404: true, robots: 'noindex, nofollow' }),
    doc('korean-404', '/not-a-pages-release-route', { status: 404, private: true, robots: 'noindex, nofollow' }),
  ];
  const first = [doc('home', '/'), { kind: 'sitemap', route: '/sitemap.xml', status: 200, type: 'xml', staticAsset: true },
    doc('samsung-calculator', '/calc/samsung-bonus'), doc('salary', '/salary/50000000'), ...privateCases,
    { kind: 'salary-og', route: '/api/og?type=salary&amount=58321000&net=4123400', status: 200, type: 'image/png', png: true },
    { kind: 'company-og', route: '/api/og?type=company&name=Local%20release%20QA', status: 200, type: 'image/png', png: true }];
  const cases = [...first.map(item => ({ ...item, pass: 1 })), ...privateCases.map(item => ({ ...item, pass: 2 }))];
  assert.equal(cases.length, 16); assert.equal(new Set(first.map(item => item.route)).size, 11);
  for (const item of cases) {
    const url = new URL(item.route, ORIGIN);
    productionGuard.assertProductionQaTarget(url.href, 'GET');
    assert.ok(!url.pathname.startsWith('/_') && (!url.pathname.startsWith('/api/') || url.pathname === '/api/og'));
  }
  return cases;
}

export function assertPagesPrivateCache(headers) {
  assert.equal(headers.get('cache-control'), 'private, no-store');
  const directives = (headers.get('cdn-cache-control') || '').toLowerCase().split(',').map(value => value.trim());
  assert.ok(directives.includes('no-store'));
  assert.ok(directives.every(value => value === 'no-store' || value === 'private'));
  assert.ok(['BYPASS', 'DYNAMIC'].includes(headers.get('cf-cache-status')));
  assert.equal(headers.get('age'), null);
}

export function assertReleasePng(bytes) {
  assert.ok(bytes.length >= 100 && bytes.length <= 2 * 1024 * 1024);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  let header = false, palette = false, ended = false, count = 0;
  const idat = [];
  for (let at = 8; at < bytes.length;) {
    assert.ok(++count <= 100 && at + 12 <= bytes.length);
    const length = bytes.readUInt32BE(at), type = bytes.toString('ascii', at + 4, at + 8);
    assert.ok(at + length + 12 <= bytes.length);
    assert.equal(crc32(bytes.subarray(at + 4, at + 8 + length)), bytes.readUInt32BE(at + 8 + length));
    if (type === 'IHDR') {
      assert.equal(at, 8); assert.equal(length, 13); assert.equal(header, false);
      assert.equal(bytes.readUInt32BE(at + 8), 1200); assert.equal(bytes.readUInt32BE(at + 12), 630);
      assert.deepEqual([...bytes.subarray(at + 16, at + 21)], [8, 3, 0, 0, 0]); header = true;
    } else if (type === 'PLTE') {
      assert.ok(header && !palette && !idat.length); assert.equal(length, 768); palette = true;
    } else if (type === 'IDAT') {
      assert.ok(palette && length > 0); idat.push(bytes.subarray(at + 8, at + 8 + length));
    } else if (type === 'IEND') {
      assert.ok(idat.length > 0); assert.equal(length, 0); assert.equal(at + 12, bytes.length); ended = true;
    } else assert.fail('Unexpected PNG chunk');
    at += length + 12;
  }
  assert.ok(ended);
  const pixels = inflateSync(Buffer.concat(idat), { maxOutputLength: 1201 * 630 });
  assert.equal(pixels.length, 1201 * 630);
  for (let row = 0; row < 630; row++) assert.equal(pixels[row * 1201], 0);
}

function assertShareDocument(html, item) {
  const head = /<head\b[^>]*>([\s\S]*?)<\/head\s*>/i.exec(html)?.[1]?.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '') || '';
  const title = /<title\b[^>]*>([^<]*)<\/title\s*>/i.exec(head)?.[1];
  if (item.shareToken) {
    assert.equal(title, '공유된 연봉 결과 | 머니샐러리');
    assert.doesNotMatch(head, /[?&](?:amount|net|netPay)=|\/share\/[A-Za-z0-9_%+-]+/);
    const bootstrap = /<script\b[^>]*\bid=["']msy-pages-share-bootstrap["'][^>]*>([^<]*)<\/script\s*>/i.exec(html)?.[1];
    assert.equal(JSON.parse(bootstrap || '{}').token, item.shareToken);
    assert.match(html, /50,000,000/);
  } else {
    assert.equal(title, '공유된 연봉 결과 | 머니샐러리');
    assert.match(html, /data-pages-share-invalid="true"/);
  }
}

// Response-only shared core. Identity and acceptance receipts belong to each caller;
// this never fabricates Cloudflare API, purge or canonical verification evidence.
export async function runPagesResponseContracts({ buildId, sitemapHash }, {
  fetchFn = globalThis.fetch, report, persist = () => {}, onSitemap = () => {},
} = {}) {
  assert.match(buildId || '', /^[A-Za-z0-9_-]{1,128}$/); assert.match(sitemapHash || '', HASH);
  assert.equal(report.attemptedRequests, 0); assert.deepEqual(report.results, []);
  const cases = pagesReleaseCases(), runId = report.runId;
  for (const item of cases) {
    assert.ok(report.attemptedRequests < 16);
    const result = { kind: item.kind, pass: item.pass, route: item.route, targetKey: 'GET ' + item.route,
      startedAt: new Date().toISOString(), status: null, contractPassed: false };
    report.results.push(result); report.attemptedRequests++; persist(report);
    let response;
    try {
      response = await productionGuard.fetchProductionQaDocument(new URL(item.route, ORIGIN).href, {
        method: 'GET', timeoutMs: 30000, fetchFn, headers: { 'x-moneysalary-qa-run': runId },
      });
      Object.assign(result, { status: response.status, headersAt: new Date().toISOString(),
        build: bounded(response.headers.get('x-moneysalary-build')), cache: bounded(response.headers.get('cache-control')),
        cdnCache: bounded(response.headers.get('cdn-cache-control')), cfCacheStatus: bounded(response.headers.get('cf-cache-status')),
        age: bounded(response.headers.get('age')), ray: bounded(response.headers.get('cf-ray')),
        robots: bounded(response.headers.get('x-robots-tag')), type: bounded(response.headers.get('content-type')) });
      persist(report);
      result.checkpoint = 'status-and-production-headers';
      assert.equal(response.status, item.status); assert.equal(response.headers.get('x-moneysalary-qa'), null);
      if (!item.staticAsset) assert.equal(result.build, buildId);
      assert.ok(result.type?.includes(item.type));
      if (item.private) { result.checkpoint = 'private-cache-policy'; assertPagesPrivateCache(response.headers); }
      result.checkpoint = 'robots-policy';
      if (item.robots) assert.equal(result.robots, item.robots);
      if (item.kind === 'home' || item.staticAsset) assert.doesNotMatch(result.robots || '', /\bnoindex\b/i);
      result.checkpoint = 'bounded-response-body';
      const bytes = Buffer.from(await bodyGuard.readPagesQaBody(response, { kind: item.png ? 'png' : 'document', maxBytes: item.png ? 2 * 1024 * 1024 : 8 * 1024 * 1024 }));
      result.bytes = bytes.length; result.sha256 = sha(bytes);
      if (item.png) { result.checkpoint = 'png-integrity'; assert.equal(response.headers.get('x-og-error'), null); assertReleasePng(bytes); }
      else if (item.staticAsset) { result.checkpoint = 'sitemap-hash'; assert.equal(result.sha256, sitemapHash); }
      else {
        result.checkpoint = 'html-contract';
        const html = bytes.toString('utf8');
        assert.match(html, /<(?:html|main|div)\b/i);
        assert.doesNotMatch(html, /Error 1102|Worker exceeded resource limits|error code: 1102/i);
        if (item.english404) assertEnglishNotFoundDocument(html);
        if (item.shareToken || item.invalidShare) assertShareDocument(html, item);
      }
      if (item.staticAsset) await onSitemap(bytes);
      result.checkpoint = 'passed';
      result.contractPassed = true;
    } catch (error) {
      if (result.status === null) result.transportErrorName = ['TimeoutError', 'AbortError', 'TypeError'].includes(error?.name) ? error.name : 'OtherTransportError';
      result.contractFailed = true; throw new Error('Post-publication response contract failed');
    } finally {
      await response?.body?.cancel().catch(() => {});
      result.finishedAt = new Date().toISOString(); persist(report);
    }
  }
}

export async function verifyPagesReleaseHttp(context, { fetchFn = globalThis.fetch, readSitemap, assertStillCanonical, persist = () => {} } = {}) {
  assertPagesReleaseIdentity(context);
  assert.equal(typeof readSitemap, 'function'); assert.equal(typeof assertStillCanonical, 'function');
  const cases = pagesReleaseCases(), { pins } = context;
  const sitemapHash = sha(readSitemap());
  const runId = 'pages-release-' + randomUUID();
  const report = { schemaVersion: 1, finished: false, startedAt: new Date().toISOString(), finishedAt: null,
    deploymentId: pins.deploymentId, commit: pins.commit, buildId: pins.buildId, artifactHash: pins.artifactHash,
    configurationHash: pins.configurationHash, runId, results: [], expectedRequests: cases.length, attemptedRequests: 0,
    canonicalVerifiedBefore: true, canonicalVerifiedAfter: false, purgeVerified: true,
    executedDocumentJavaScript: false, followedRedirects: 0, subresourceRequests: 0, automaticRetries: 0,
    limitation: 'Finite response and repeated private-cache contracts; not an all-request CPU, traffic-quality or future cache-configuration guarantee.' };
  persist(report);
  let failed = false;
  try {
    await runPagesResponseContracts({ buildId: pins.buildId, sitemapHash }, { fetchFn, report, persist });
  } catch { failed = true; }
  try { await assertStillCanonical(); report.canonicalVerifiedAfter = true; }
  catch { failed = true; report.canonicalRecheckFailed = true; }
  report.finishedAt = new Date().toISOString();
  report.finished = !failed && report.results.length === 16 && report.results.every(result => result.contractPassed);
  persist(report);
  if (!report.finished) throw new Error('Pages release HTTP verification stopped; no retry or automatic rollback.');
  return report;
}

export async function readPagesReleaseState(pins, env = process.env, fetchFn = globalThis.fetch, suppliedApi) {
  assert.match(pins.deploymentId || '', UUID);
  // Local callers supply the fixed-account OAuth API, so no token has to be
  // copied into an environment variable or exposed to publisher requests.
  let api = suppliedApi;
  if (api === undefined) { assert.equal(env.CF_ACCOUNT_ID, ACCOUNT); api = createReleaseApi(env, fetchFn); }
  assert.equal(typeof api?.readProject, 'function'); assert.equal(typeof api?.readDeployment, 'function');
  // These two methods perform fixed Cloudflare GETs. Other publisher methods
  // are not invoked. Raw project configuration stays in memory for hashing.
  const project = await api.readProject();
  const deployment = await api.readDeployment(pins.deploymentId);
  return { project, deployment };
}

export function verificationReceipt(report, pins) {
  return { schemaVersion: 1, finished: report.finished === true,
    pins: Object.fromEntries(['deploymentId', 'commit', 'buildId', 'artifactHash', 'sourceHash', 'configurationHash'].map(key => [key, pins[key]])),
    startedAt: report.startedAt, finishedAt: report.finishedAt,
    canonicalVerifiedBefore: report.canonicalVerifiedBefore === true, canonicalVerifiedAfter: report.canonicalVerifiedAfter === true,
    purgeVerified: report.purgeVerified === true, expectedRequests: report.expectedRequests, attemptedRequests: report.attemptedRequests,
    passedRequests: report.results.filter(item => item.contractPassed).length,
    executedDocumentJavaScript: false, followedRedirects: 0, subresourceRequests: 0, automaticRetries: 0,
    detailFile: 'production-http.json', limitation: report.limitation };
}

export function writeVerificationJson(filename, data) {
  const temporary = filename + '.' + randomUUID() + '.tmp';
  try {
    writeFileSync(temporary, JSON.stringify(data, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    renameSync(temporary, filename);
  } finally { if (existsSync(temporary)) unlinkSync(temporary); }
}

export function resolvePagesReleaseReceiptDirectory(workspaceRoot, requested) {
  const ownedRoot = path.resolve(workspaceRoot);
  assert.equal(realpathSync(ownedRoot), ownedRoot, 'Receipt workspace must be the real checkout');
  const defaultDirectory = path.join(ownedRoot, '.artifacts/pages-release');
  const directory = requested ?? defaultDirectory;
  assert.ok(path.isAbsolute(directory)); assert.equal(path.resolve(directory), directory);
  let localCommit = null;
  if (directory !== defaultDirectory) {
    localCommit = path.basename(directory); assert.match(localCommit, SHA);
    assert.equal(directory, path.join(ownedRoot, '.artifacts/pages-release-local', localCommit), 'Unowned receipt directory');
    assert.equal(localReleaseDirectory(ownedRoot, localCommit), directory);
  }
  // Check every owned ancestor rather than trusting only the final pathname.
  for (let current = directory; current !== ownedRoot; current = path.dirname(current)) {
    assert.equal(lstatSync(current).isSymbolicLink(), false); assert.equal(lstatSync(current).isDirectory(), true);
    assert.equal(realpathSync(current), current, 'Receipt paths must not traverse links');
  }
  return { directory, localCommit };
}

export function readPagesReleasePins(workspaceRoot, requested) {
  const selected = resolvePagesReleaseReceiptDirectory(workspaceRoot, requested);
  const file = path.join(selected.directory, 'production-pins.json');
  assert.equal(lstatSync(file).isSymbolicLink(), false); assert.equal(lstatSync(file).isFile(), true);
  assert.equal(realpathSync(file), file);
  const pins = JSON.parse(readFileSync(file, 'utf8'));
  if (selected.localCommit !== null) assert.equal(pins.commit, selected.localCommit, 'Local receipt commit does not match its directory');
  return { ...selected, pins };
}

export async function runPagesReleaseHttp({ env = process.env, receiptDirectory = outputDirectory, api } = {}) {
  const { directory, localCommit, pins } = readPagesReleasePins(root, receiptDirectory);
  if (api !== undefined) assert.notEqual(localCommit, null, 'Injected local API requires a commit-scoped local receipt');
  const verified = verifyArtifact(root, 'production', env);
  const readState = () => readPagesReleaseState(pins, env, globalThis.fetch, api);
  const state = await readState();
  const context = { pins, marker: verified.marker, ...state };
  assertPagesReleaseIdentity(context);
  const output = path.join(directory, 'production-http.json');
  const summary = path.join(directory, 'verification.json');
  assert.equal(existsSync(summary), false, 'A verification receipt exists; do not automatically replay public requests');
  writeFileSync(output, JSON.stringify({ finished: false, deploymentId: pins.deploymentId }) + '\n', { flag: 'wx' });
  const report = await verifyPagesReleaseHttp(context, {
    readSitemap: () => readFileSync(path.join(verified.stage, 'dist/sitemap.xml')),
    persist: value => {
      writeVerificationJson(output, value);
      writeVerificationJson(summary, verificationReceipt(value, pins));
    },
    assertStillCanonical: async () => assertPagesReleaseIdentity({ ...context, ...await readState() }),
  });
  console.log(JSON.stringify({ verified: true, deploymentId: pins.deploymentId, requests: report.attemptedRequests,
    canonicalVerifiedAfter: true, executedDocumentJavaScript: false, followedRedirects: 0 }));
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.deepEqual(process.argv.slice(2), ['--execute-production-http'], 'Explicit post-publication verification mode is required');
  try { await runPagesReleaseHttp(); }
  catch { console.error('Pages post-publication verification failed. Inspect .artifacts/pages-release/production-http.json; no automatic retry, rollback or publisher browser.'); process.exitCode = 1; }
}
