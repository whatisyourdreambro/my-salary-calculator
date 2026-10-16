// IndexNow 핑 — 이번 빌드에서 바뀐 URL 만 api.indexnow.org(빙·네이버 등 참여 엔진 공유
// 엔드포인트)로 제출해 신규·갱신·삭제 페이지의 재수집을 요청한다.
//
// 2026-09-25 B7(SEO-CRAWL-02) — 전량 제출 → 변경분 제출로 전환:
//   종전에는 매 프로덕션 빌드마다 사이트맵 전체(약 1,990 URL)를 제출했다. 9월에만 16일 배포 →
//   엔진이 바뀌지 않은 URL 까지 되가져가 캐시 안 된 Worker 호출(1102 노출)을 만들었다.
//   이제 빌드 사이트맵과 운영 사이트맵(직전 배포)의 (loc, lastmod) 쌍을 비교해
//   신규·lastmod 변경·삭제 URL 만 제출한다(규칙: scripts/indexnow-diff.mjs).
//   - 바뀐 것이 없으면 제출하지 않는다.
//   - 어느 한쪽이라도 읽지 못하면(빌드 산출물 없음, 운영 fetch 실패·200 아님·1102 오류 페이지)
//     제출 자체를 건너뛴다 — 종전의 "운영 사이트맵 전량 제출" 대체 경로는 삭제했다.
//   - lastmod 가 실제 수정일일 때만 의미가 있다(src/config/siteDates.ts 원칙) — lastmod 를
//     빌드 날짜로 찍으면 매 배포 전량 제출로 되돌아간다.
//
// 2026-09-26 NAVER-03a — 같은 payload 를 네이버 IndexNow(searchadvisor.naver.com/indexnow)에도 직접 POST:
//   공유 엔드포인트 경유로는 네이버 수신 여부가 로그에 안 남는다. 전송·로그·비치명 처리는
//   scripts/indexnow-submit.mjs(submitIndexNow) 한 곳 — 로그 "[indexnow] naver <HTTP 상태>".
//   네이버 쪽 예외·비 2xx 도 빌드에 영향 없음(아래 안전 원칙 그대로).
//
// 안전 원칙: 어떤 실패도 빌드를 깨지 않는다 — postbuild 모든 경로에서 exit 0.
// (package.json postbuild 에서 `|| echo` 이중 안전망과 함께 사용)
// 예외: `--selftest` 는 개발 게이트라 불일치 시 exit 1.
//
// 실행 조건: Cloudflare Pages 프로덕션 빌드(CF_PAGES=1 && CF_PAGES_BRANCH=main)만.
// 로컬 수동 테스트: INDEXNOW_FORCE=1 node scripts/indexnow-ping.mjs (실제 제출됨 — 주의)
// 로컬 규칙 검증: node scripts/indexnow-ping.mjs --selftest (네트워크 없음, 픽스처 XML 2개)
//
// 키 파일: public/{32자hex}.txt (파일명에서 자동 발견 — 상수/파일 불일치 원천 차단)
// 운영 확인: CF Pages 빌드 로그의 "[indexnow]" 라인 — "diff: 신규 N · 변경 N · 삭제 N" 과
// 제출/건너뜀 사유가 찍힌다. 로그에 없으면 대시보드가 npm run build를 우회하는 구성 —
// build 스크립트를 "next build && node scripts/indexnow-ping.mjs ..." 로 변경(플랜 B).
// Workers: set CF_DEPLOY_TARGET=workers (or INDEXNOW_DEFER=1) during build. Before
// cutover: --capture <manifest.json>, after activation: --submit <same manifest>.
// Required: CF_ACCOUNT_ID / CF_WORKER_NAME / CF_RELEASE_TAG; submit also needs
// CF_API_TOKEN and CF_EXPECTED_VERSION_ID. INDEXNOW_BUILD_DIR defaults to .next.
// Explicit cutover modes fail with exit 1; ordinary Pages postbuild remains nonfatal.
// Preserve the manifest AND its .submission.json receipt; never delete/replay them
// to retry an ambiguous network result. QA artifacts can never submit, even FORCE.

import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { HOST, readSitemap, planSubmission, formatCounts } from "./indexnow-diff.mjs";
import { submitIndexNow } from "./indexnow-submit.mjs";
import qaHttp from "./lib/qa-production-http.cjs";
import { workerReleaseConfig, readWorkerActivation } from "./lib/cf-worker-release.mjs";

const URL_CAP = 10000; // IndexNow 1회 POST 상한
const UA =
  `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 ${qaHttp.QA_USER_AGENT}`;

function findKey(cwd = process.cwd()) {
  try {
    const f = readdirSync(path.join(cwd, "public")).find((n) =>
      /^[0-9a-f]{32}\.txt$/.test(n)
    );
    return f ? f.slice(0, -4) : null;
  } catch {
    return null;
  }
}

// 이번 빌드: next build 산출물의 프리렌더 사이트맵 — postbuild 시점에 항상 최신.
// 주의: .next/server/app 에는 sitemap.xml(디렉터리, route.js)과
// sitemap.xml.body(실제 XML)가 공존 — 항목별 try로 디렉터리는 건너뛴다.
export function buildSitemap(buildDir = path.join(process.cwd(), ".next")) {
  const dir = path.join(buildDir, "server", "app");
  if (!existsSync(dir)) return { ok: false, reason: ".next/server/app 없음" };
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return { ok: false, reason: ".next/server/app 읽기 실패" };
  }
  for (const f of entries) {
    if (!f.startsWith("sitemap.xml")) continue;
    try {
      const body = readFileSync(path.join(dir, f), "utf8");
      if (body.includes("<loc>")) return readSitemap({ body });
    } catch {
      // 디렉터리(EISDIR) 등 — 다음 항목 시도
    }
  }
  return { ok: false, reason: "빌드 산출물에 sitemap.xml 본문 없음" };
}

// 직전 배포: 운영 사이트맵(브라우저 UA — 기본 UA 는 CF 에서 403).
export async function productionSitemap(fetchFn = globalThis.fetch) {
  try {
    const res = await qaHttp.fetchProductionQaDocument(`https://${HOST}/sitemap.xml`, {
      fetchFn,
      headers: { "user-agent": UA },
    });
    return readSitemap({ status: res.status, body: await res.text() });
  } catch (e) {
    return { ok: false, reason: `fetch 실패: ${e?.message ?? e}` };
  }
}

export function assertIndexNowProduction(env = process.env, cwd = process.cwd(), buildDir = path.join(cwd, '.next')) {
  const qaPath = /(^|[\\/])(?:\.open-next-qa|\.next-qa)(?:[\\/]|$)/i;
  if (env.MSY_QA_MODE === '1' || env.MSY_QA_WORKER_STAGE === '1'
      || env.NEXT_PUBLIC_ADS_DISABLED === '1' || qaPath.test(path.resolve(cwd))
      || qaPath.test(path.resolve(buildDir))) {
    throw new Error('IndexNow is disabled for QA builds, including INDEXNOW_FORCE.');
  }
}

const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const snapshot = (sitemap) => [...sitemap.entries].sort(([a], [b]) => a.localeCompare(b));
const releaseIdentity = ({ accountId, workerName, releaseTag }) => ({ accountId, workerName, releaseTag });

// Capture before routing changes; no key or token is written to this manifest.
export function createCutoverManifest({ build, previous, release, buildDir, buildId, capturedAt = new Date().toISOString() }) {
  if (!build?.ok || !previous?.ok) throw new Error('Both build and pre-cutover production sitemaps must be valid; no full-list fallback.');
  if (!buildId || typeof buildId !== 'string') throw new Error('Production BUILD_ID is required.');
  const plan = planSubmission(build, previous, { cap: URL_CAP });
  if (plan.counts.added + plan.counts.changed + plan.counts.removed > URL_CAP) {
    throw new Error('Delta exceeds the single-submission cap; explicit batching is required.');
  }
  for (const url of plan.urls) qaHttp.assertProductionQaTarget(url);
  const payload = {
    schema: 'moneysalary-indexnow-cutover-v1', host: HOST, capturedAt,
    release: releaseIdentity(release), buildDir: path.resolve(buildDir), buildId,
    previous: snapshot(previous), build: snapshot(build), plan,
  };
  return { ...payload, sha256: digest(payload) };
}

export function validateCutoverManifest(manifest, config) {
  if (!manifest || manifest.schema !== 'moneysalary-indexnow-cutover-v1' || manifest.host !== HOST) throw new Error('Invalid cutover manifest schema/host.');
  const { sha256, ...payload } = manifest;
  if (sha256 !== digest(payload)) throw new Error('Cutover manifest checksum mismatch.');
  if (JSON.stringify(manifest.release) !== JSON.stringify(releaseIdentity(config))) throw new Error('Cutover manifest release/account/Worker mismatch.');
  const decode = (entries) => {
    if (!Array.isArray(entries) || entries.length === 0) throw new Error('Invalid sitemap snapshot.');
    for (const pair of entries) {
      if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string'
          || (pair[1] !== null && typeof pair[1] !== 'string')) throw new Error('Invalid sitemap entry.');
      qaHttp.assertProductionQaTarget(pair[0]);
    }
    const parsed = new Map(entries);
    if (parsed.size !== entries.length) throw new Error('Duplicate sitemap entries.');
    return { ok: true, entries: parsed };
  };
  const recomputed = planSubmission(decode(manifest.build), decode(manifest.previous), { cap: URL_CAP });
  if (JSON.stringify(recomputed) !== JSON.stringify(manifest.plan)) throw new Error('Cutover delta does not match captured snapshots.');
  if (recomputed.counts.added + recomputed.counts.changed + recomputed.counts.removed > URL_CAP) throw new Error('Cutover delta exceeds cap.');
  return manifest;
}

export async function captureCutover(manifestFile, { env = process.env, cwd = process.cwd(), fetchFn = globalThis.fetch } = {}) {
  const buildDir = path.resolve(cwd, env.INDEXNOW_BUILD_DIR || '.next');
  assertIndexNowProduction(env, cwd, buildDir);
  const config = workerReleaseConfig(env, { requireToken: false });
  if (existsSync(manifestFile)) throw new Error('Cutover manifest already exists; do not overwrite the pre-cutover snapshot.');
  const build = buildSitemap(buildDir);
  if (!build.ok) throw new Error(`Build sitemap unavailable: ${build.reason}`);
  const buildId = readFileSync(path.join(buildDir, 'BUILD_ID'), 'utf8').trim();
  mkdirSync(path.dirname(path.resolve(manifestFile)), { recursive: true });
  const previous = await productionSitemap(fetchFn);
  const manifest = createCutoverManifest({ build, previous, release: config, buildDir, buildId });
  writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  console.log(`[indexnow] captured pre-cutover delta: ${formatCounts(manifest.plan.counts)}; no submission`);
  return manifest;
}

// A durable claim is written BEFORE either endpoint is contacted. Re-running the
// SAME manifest never re-sends, even after a crash/timeout. This favors at-most-once
// attempts; ambiguous outcomes require operator review, not an automatic retry.
// Keep manifest + receipt together; copying/removing receipts defeats this contract.
export async function submitCutover(manifestFile, { env = process.env, cwd = process.cwd(), fetchFn = globalThis.fetch } = {}) {
  assertIndexNowProduction(env, cwd);
  const config = workerReleaseConfig(env);
  if (!config.expectedVersionId) throw new Error('CF_EXPECTED_VERSION_ID is required for cutover submission.');
  const manifest = validateCutoverManifest(JSON.parse(readFileSync(manifestFile, 'utf8')), config);
  assertIndexNowProduction(env, cwd, manifest.buildDir);
  const receiptFile = `${manifestFile}.submission.json`;
  if (existsSync(receiptFile)) {
    const receipt = JSON.parse(readFileSync(receiptFile, 'utf8'));
    if (receipt.manifestSha256 !== manifest.sha256) throw new Error('Existing receipt belongs to a different manifest.');
    if (receipt.state !== 'completed') throw new Error('Submission already claimed or failed; outcome may be ambiguous. Review receipt; never automatically re-send.');
    console.log('[indexnow] already completed; no repeat submission');
    return { duplicate: true, receipt };
  }
  const currentBuild = buildSitemap(manifest.buildDir);
  if (!currentBuild.ok || digest(snapshot(currentBuild)) !== digest(manifest.build)
      || readFileSync(path.join(manifest.buildDir, 'BUILD_ID'), 'utf8').trim() !== manifest.buildId) {
    throw new Error('Build changed since pre-cutover capture; no submission.');
  }
  const key = findKey(cwd);
  if (manifest.plan.submit && !key) throw new Error('No IndexNow key file in public/.');
  const activated = await readWorkerActivation(config, { fetchFn });
  if (activated.state !== 'success') throw new Error(`Worker release not verified: ${activated.reason}`);
  // A Worker can be active before its public domain is switched. Purge first,
  // then confirm the canonical document exposes the captured new sitemap. This
  // HTTP read executes no browser JavaScript or advertisements.
  const published = await productionSitemap(fetchFn);
  if (!published.ok || digest(snapshot(published)) !== digest(manifest.build)) {
    throw new Error('Canonical sitemap does not match the captured new build; complete cutover/purge before submission.');
  }
  const finalActivation = await readWorkerActivation(config, { fetchFn });
  if (finalActivation.state !== 'success' || finalActivation.deploymentId !== activated.deploymentId) {
    throw new Error('Worker activation changed during canonical sitemap verification; no submission.');
  }
  const receipt = {
    schema: 'moneysalary-indexnow-submission-v1', manifestSha256: manifest.sha256,
    release: manifest.release, versionId: activated.versionId, deploymentId: activated.deploymentId,
    claimedAt: new Date().toISOString(), state: 'claimed', urlCount: manifest.plan.urls.length,
  };
  writeFileSync(receiptFile, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
  const results = manifest.plan.submit ? await submitIndexNow({
    host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList: manifest.plan.urls,
  }, { userAgent: UA, fetchImpl: fetchFn }) : [];
  receipt.results = results.map(({ name, status, ok }) => ({ name, status, ok }));
  receipt.state = results.every((result) => result.ok) ? 'completed' : 'needs-review';
  receipt.finishedAt = new Date().toISOString();
  writeFileSync(receiptFile, JSON.stringify(receipt, null, 2) + '\n');
  if (receipt.state !== 'completed') throw new Error('IndexNow endpoint failed or timed out; receipt saved, automatic repeat is disabled.');
  return { duplicate: false, receipt };
}

export async function main(env = process.env) {
  assertIndexNowProduction(env);
  if (env.CF_DEPLOY_TARGET === 'workers' || env.INDEXNOW_DEFER === '1') {
    console.log('[indexnow] deferred: capture before cutover and submit only after verified Worker activation');
    return;
  }
  const isProdBuild =
    env.CF_PAGES === "1" && env.CF_PAGES_BRANCH === "main";
  if (!isProdBuild && env.INDEXNOW_FORCE !== "1") {
    console.log("[indexnow] skip (not CF production build)");
    return;
  }

  const key = findKey();
  if (!key) {
    console.log("[indexnow] skip (no key file in public/)");
    return;
  }

  const build = buildSitemap();
  if (!build.ok) {
    console.log(`[indexnow] skip (빌드 사이트맵 판독 실패: ${build.reason}) — 전량 제출 대체 없음`);
    return;
  }
  const prod = await productionSitemap();
  const plan = planSubmission(build, prod, { cap: URL_CAP });
  if (plan.counts) console.log(`[indexnow] diff: ${formatCounts(plan.counts)}`);
  if (!plan.submit) {
    console.log(`[indexnow] skip (${plan.reason}) — 전량 제출 대체 없음`);
    return;
  }

  // api.indexnow.org → 네이버 순서로 같은 payload. 로그: "[indexnow] submitted N changed urls → HTTP s",
  // "[indexnow] naver s". 어느 쪽 실패도 throw 하지 않는다(200/202 = 접수, 4xx여도 빌드는 계속).
  await submitIndexNow(
    {
      host: HOST,
      key,
      keyLocation: `https://${HOST}/${key}.txt`,
      urlList: plan.urls,
    },
    { userAgent: UA },
  );
}

// --selftest: 픽스처 XML 2개(운영=직전, 빌드=이번)로 diff·판독 규칙을 검증한다. 네트워크 없음.
function selftest() {
  const dir = fileURLToPath(new URL("./__tests__/fixtures/indexnow/", import.meta.url));
  const read = (f) => readFileSync(path.join(dir, f), "utf8");
  const base = `https://${HOST}`;

  const build = readSitemap({ body: read("build-sitemap.xml") });
  const prod = readSitemap({ status: 200, body: read("prod-sitemap.xml") });
  assert.equal(build.ok, true, "빌드 픽스처 판독");
  assert.equal(prod.ok, true, "운영 픽스처 판독(본문의 1102 숫자 URL 은 오류로 오인하지 않는다)");

  const plan = planSubmission(build, prod);
  assert.equal(plan.submit, true);
  assert.deepEqual(plan.counts, { added: 1, changed: 2, removed: 1, build: 7, prod: 7 });
  assert.deepEqual(plan.urls, [
    `${base}/calc/new-page`,
    `${base}/glossary/%EA%B8%B0%ED%9A%8C%EB%B9%84%EC%9A%A9`,
    `${base}/monthly/1600000`,
    `${base}/salary-db/listed/000000`,
  ]);

  // 동일 사이트맵 → 제출 없음
  assert.equal(planSubmission(prod, prod).submit, false);
  // 한쪽이라도 판독 실패 → 제출 없음(전량 제출 대체 경로 없음)
  for (const bad of [
    { status: 503, body: read("prod-sitemap.xml") },
    { status: 200, body: "error code: 1102" },
    { status: 200, body: read("prod-sitemap.xml").slice(0, 400) },
    { status: 200, body: "<html><body>Not Found</body></html>" },
  ]) {
    const r = readSitemap(bad);
    assert.equal(r.ok, false, `판독 실패여야 함: ${JSON.stringify(bad).slice(0, 60)}`);
    assert.equal(planSubmission(build, r).submit, false);
    assert.deepEqual(planSubmission(build, r).urls, []);
  }
  assert.equal(planSubmission({ ok: false, reason: "없음" }, prod).submit, false);

  console.log(`[indexnow] selftest ok — ${formatCounts(plan.counts)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
const args = process.argv.slice(2);
if (args[0] === '--capture' || args[0] === '--submit') {
  if (args.length !== 2 || !args[1] || args[1].startsWith('--')) {
    console.error('[indexnow] Usage: --capture <manifest.json> OR --submit <manifest.json>');
    process.exit(1);
  }
  const action = args[0] === '--capture' ? captureCutover : submitCutover;
  action(path.resolve(args[1])).then(() => process.exit(0), (error) => {
    console.error(`[indexnow] cutover stopped: ${error.message}`);
    process.exit(1);
  });
} else if (args.length === 1 && args[0] === "--selftest") {
  try {
    selftest();
    process.exit(0);
  } catch (e) {
    console.error(`[indexnow] selftest FAIL: ${e?.message ?? e}`);
    process.exit(1);
  }
} else if (args.length === 0) {
  main()
    .catch((e) => console.log(`[indexnow] error (non-fatal): ${e?.message ?? e}`))
    .finally(() => process.exit(0));
} else {
  console.error('[indexnow] Unknown arguments; no requests performed.');
  process.exit(1);
}
}
