// sitemap 드리프트 가드 (2026-08 대규모 점검 도입) — npm run verify:sitemap
//
// sitemap.ts 의 정적 라우트 목록은 하드코딩 배열이라 파일시스템과 자동 동기화되지
// 않는다. 이 스크립트는 실제 sitemap() 출력과 src/app 파일시스템 라우트를 대조해
// "새 페이지를 만들고 sitemap 등재를 잊는" 드리프트를 잡는다.
// (sitemap.ts 가 @/ alias require 지연 로드를 쓰므로 tsx 로 실행 — vitest CJS
//  require 는 alias 를 못 풀어 여기서만 tsx 를 쓴다.)
// 2026-09-25 B7: URL 원장 게이트 추가(아래 checkUrlLedger) — 원장 갱신은 npm run ledger:update.
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import sitemap, { ROUTE_OVERRIDES } from "@/app/sitemap";
import { assessContentReview, isFutureSitemapDate, koreanDay, pageRevisionFields } from "./lib/sitemap-freshness.mjs";
import { PAGE_ACCURACY_REVIEW_PATHS, PAGE_LINK_REVIEW_PATHS } from "@/config/pageContentRevisions";
import { STATIC_LAST_MODIFIED_ISO } from "@/config/siteDates";
import { webApplicationLd } from "@/lib/structuredData";
import { koGuides, enGuides } from "@/lib/guidesContent";
import { getGuideModifiedDate } from "@/lib/guideDates";
import { getGuideContentDate } from "@/lib/guideContentRevisions";
import { getComparePairs } from "@/lib/salary-data/companyComparePairs";
import { listedCohort } from "@/lib/salary-data/dartLite";

const APP_DIR = join(process.cwd(), "src", "app");

// Explicit editorial reviews replace recursive directory timestamps. An unrelated
// child route or a reviewed technical change does not advance lastmod. Exact
// source hashes make the decision auditable and require a fresh review on edits,
// even in a shallow CI checkout. No commit-title exemption or silent git skip.
function checkOverrideFreshness(entries: Awaited<ReturnType<typeof sitemap>>): number {
  const ledger = JSON.parse(readFileSync(join(process.cwd(), "scripts/sitemap-content-reviews.json"), "utf8"));
  if (ledger.schemaVersion !== 1 || ledger.timeZone !== "Asia/Seoul" || !ledger.routes) {
    throw new Error("Invalid sitemap content-review ledger");
  }
  let warned = 0;
  for (const [route, override] of Object.entries(ROUTE_OVERRIDES)) {
    if (!override.lastModified) continue;
    const matches = entries.filter((entry) => new URL(entry.url).pathname === route);
    const issues = assessContentReview({ root: process.cwd(), route, review: ledger.routes[route], actualLastModified: matches[0]?.lastModified });
    if (matches.length !== 1) issues.push("actual sitemap must contain exactly one route");
    if (issues.length) {
      console.warn(`[WARN] 콘텐츠 수정일 검토 필요: ${route}: ${issues.join("; ")}`);
      warned++;
    }
  }
  for (const route of Object.keys(ledger.routes)) {
    if (!ROUTE_OVERRIDES[route]?.lastModified) {
      console.warn(`[WARN] 대응 override 없는 콘텐츠 검토: ${route}`);
      warned++;
    }
  }
  return warned;
}

function checkValidDates(entries: Awaited<ReturnType<typeof sitemap>>): number {
  let failed = 0;
  const now = Date.now();
  for (const entry of entries) {
    const time = new Date(entry.lastModified ?? NaN).getTime();
    if (!Number.isFinite(time) || isFutureSitemapDate(entry.lastModified, now)) {
      console.error(`[FAIL] sitemap 날짜가 없거나 유효하지 않거나 미래임: ${new URL(entry.url).pathname}`);
      failed++;
    }
  }
  return failed;
}

function checkPageRevisionDates(entries: Awaited<ReturnType<typeof sitemap>>): number {
  let failed = 0;
  const paths = new Set([...Object.keys(ROUTE_OVERRIDES), ...PAGE_LINK_REVIEW_PATHS, ...PAGE_ACCURACY_REVIEW_PATHS]);
  for (const route of paths) {
    const file = join(APP_DIR, route.slice(1), 'page.tsx');
    if (!existsSync(file)) continue; // Dynamic templates have their own date/guide contracts.
    const entry = entries.find(item => new URL(item.url).pathname === route);
    for (const field of pageRevisionFields(readFileSync(file, 'utf8'), file)) {
      if (!field.value || !entry?.lastModified || koreanDay(field.value) !== koreanDay(entry.lastModified)) {
        console.error(`[FAIL] 페이지 수정일 불일치: ${route} ${field.name}=${field.value ?? '정적 날짜 판정 불가'} sitemap=${entry?.lastModified ?? '없음'}`);
        failed++;
      }
    }
  }
  return failed;
}

// WebApplication JSON-LD dateModified ↔ sitemap STATIC_LAST_MODIFIED 정합 게이트 (2026-09-05,
// L18' 위생 하위 항목) — layout.tsx 가 전 라우트 <head> 에 주입하는 webApplicationLd() 의
// dateModified 가 sitemap 기준일과 어긋나면 두 신선도 신호가 모순된다. 둘 다
// src/config/siteDates.ts 단일 상수에서 파생되므로 평소엔 0건 — 누군가 structuredData.ts 에
// 날짜를 다시 하드코딩하면 여기서 잡힌다. 비차단(WARN) — exit 코드 불변.
function checkWebApplicationDate(): number {
  const ld = webApplicationLd() as { dateModified?: string };
  if (ld.dateModified === STATIC_LAST_MODIFIED_ISO) return 0;
  console.warn(
    `[WARN] webApplicationLd dateModified(${ld.dateModified ?? "없음"}) ≠ sitemap STATIC_LAST_MODIFIED(${STATIC_LAST_MODIFIED_ISO}) — src/config/siteDates.ts 단일 상수로 맞추세요.`
  );
  return 1;
}

// ── URL 원장 게이트 (2026-09-25 B7, RT-07(a)) ─────────────────────────────────────────
// 한 번 공개된 URL 이 데이터 갱신으로 조용히 사라져 404 가 되는 것을 막는다.
//  - 비교 페이지(/salary-db/compare/[slug], dynamicParams=false)는 슬러그 순서가 신입 연봉
//    순위라 연봉 데이터만 고쳐도 A-vs-B ↔ B-vs-A 가 뒤집히거나 페어가 빠진다.
//  - 상장사 lite(/salary-db/listed/[stockCode])는 DART 갱신·정식 페이지 승격 때 코호트에서 빠진다.
// scripts/url-ledger.snapshot.json 에 사이트맵 URL + 비교·상장 generateStaticParams 집합을 기록해 두고,
// 원장에 있던 URL 이 현재 어느 집합에도 없는데 next.config redirects() source 중 맞는 것이
// 없으면 [FAIL] 이다. 리다이렉트로 은퇴한 URL 은 원장 갱신 때 retired 로 옮겨 계속 감시한다
// (나중에 그 리다이렉트를 지우면 다시 FAIL).
// 원장 갱신: npm run ledger:update (= tsx scripts/verify-sitemap.ts --update-ledger).
// 매칭은 Next 빌드가 routes-manifest 에 쓰는 정규식(buildCustomRoute)으로, 퍼센트 인코딩된
// 경로 그대로 한다 — 운영과 같다(한글 리터럴 source 는 운영에서도 매칭되지 않는다).
// git·네트워크 없음 — 로컬·CI 어디서나 같은 결과.
const LEDGER_PATH = join(process.cwd(), "scripts", "url-ledger.snapshot.json");
const LEDGER_FAMILIES = ["sitemap", "compare", "listed", "retired"] as const;
type LedgerFamily = (typeof LEDGER_FAMILIES)[number];
type UrlLedger = { note: string } & Record<LedgerFamily, string[]>;
const LEDGER_NOTE =
  "URL 원장 — 한 번 공개된 URL 목록(퍼센트 인코딩 경로). 원장에 있던 URL 이 사이트맵·비교·상장 집합에서 사라지면 next.config redirects() 308 이 있어야 verify:sitemap 통과. 갱신: npm run ledger:update (retired = 리다이렉트로 은퇴해 계속 감시하는 URL).";

type RedirectRule = { source: string; destination: string; has?: unknown; missing?: unknown };
type RedirectMatcher = { source: string; destination: string; re: RegExp };

async function loadRedirectMatchers(): Promise<RedirectMatcher[]> {
  const mod = (await import(pathToFileURL(join(process.cwd(), "next.config.mjs")).href)) as {
    default?: { redirects?: () => Promise<RedirectRule[]> };
  };
  const cfg = mod.default ?? {};
  const rules = cfg.redirects ? await cfg.redirects() : [];
  const req = createRequire(join(process.cwd(), "package.json"));
  const { buildCustomRoute } = req("next/dist/lib/build-custom-route") as {
    buildCustomRoute: (type: "redirect", route: RedirectRule, restricted?: string[]) => { regex: string };
  };
  // has/missing 조건부 규칙은 모든 요청을 덮지 않으므로 은퇴 커버로 치지 않는다.
  return rules
    .filter((r) => !r.has && !r.missing)
    .map((r) => ({
      source: r.source,
      destination: r.destination,
      re: new RegExp(buildCustomRoute("redirect", r, ["/_next"]).regex, "i"),
    }));
}

function currentUrlSets(sitemapPaths: string[]): Omit<UrlLedger, "note" | "retired"> {
  const uniq = (xs: string[]) => [...new Set(xs)].sort();
  return {
    sitemap: uniq(sitemapPaths),
    compare: uniq(getComparePairs().map((p) => `/salary-db/compare/${p.slug}`)),
    listed: uniq(listedCohort.map((c) => `/salary-db/listed/${c.stockCode}`)),
  };
}

function readLedger(): UrlLedger | null {
  if (!existsSync(LEDGER_PATH)) return null;
  const raw = JSON.parse(readFileSync(LEDGER_PATH, "utf8")) as Partial<UrlLedger>;
  return {
    note: raw.note ?? LEDGER_NOTE,
    sitemap: raw.sitemap ?? [],
    compare: raw.compare ?? [],
    listed: raw.listed ?? [],
    retired: raw.retired ?? [],
  };
}

/** 반환: FAIL 건수 (원장 이탈 + 사이트맵 URL 이 리다이렉트 source 에 걸리는 모순) */
async function checkUrlLedger(sitemapPaths: string[], update: boolean): Promise<number> {
  const current = currentUrlSets(sitemapPaths);
  const live = new Set([...current.sitemap, ...current.compare, ...current.listed]);
  const matchers = await loadRedirectMatchers();
  const redirectOf = (p: string) => matchers.find((m) => m.re.test(p));

  let fail = 0;
  // 사이트맵에 올린 URL 이 리다이렉트 source 에 걸리면 운영에서 페이지 대신 308 이 나간다.
  for (const p of current.sitemap) {
    const r = redirectOf(p);
    if (r) {
      console.error(`[FAIL] 사이트맵 URL 이 next.config 리다이렉트에 걸림: ${p} → ${r.destination} (source ${r.source})`);
      fail++;
    }
  }

  const ledger = readLedger();
  const recorded = new Map<string, LedgerFamily>();
  if (ledger) {
    for (const fam of LEDGER_FAMILIES) for (const p of ledger[fam]) if (!recorded.has(p)) recorded.set(p, fam);
  }
  const gone: Array<{ path: string; family: LedgerFamily }> = [];
  const retired: string[] = [];
  for (const [p, family] of recorded) {
    if (live.has(p)) continue;
    if (redirectOf(p)) retired.push(p);
    else gone.push({ path: p, family });
  }
  const unrecorded = [...live].filter((p) => !recorded.has(p));

  if (update) {
    const next: UrlLedger = { note: LEDGER_NOTE, ...current, retired: retired.sort() };
    writeFileSync(LEDGER_PATH, `${JSON.stringify(next, null, 1)}\n`);
    for (const g of gone) console.warn(`[ledger] 원장에서 제외(리다이렉트 없이 사라진 URL — 의도 확인): ${g.path} (${g.family})`);
    console.log(
      `[verify-sitemap] URL 원장 갱신: sitemap ${next.sitemap.length} / compare ${next.compare.length} / listed ${next.listed.length} / retired ${next.retired.length} (신규 기록 ${unrecorded.length}건, 제외 ${gone.length}건) → ${LEDGER_PATH}`
    );
    return fail;
  }

  if (!ledger) {
    console.error(`[FAIL] URL 원장 없음: ${LEDGER_PATH} — npm run ledger:update 로 생성`);
    return fail + 1;
  }
  for (const g of gone) {
    console.error(
      `[FAIL] URL 원장 이탈(리다이렉트 없음): ${g.path} (${g.family}) — next.config redirects() 에 308 을 추가하거나, 페이지가 살아 있고 사이트맵에서만 뺀 것이면 npm run ledger:update`
    );
  }
  console.log(
    `[verify-sitemap] URL 원장: 기록 ${recorded.size}건 / 이탈 ${gone.length}건 / 리다이렉트 은퇴 ${retired.length}건 / 원장 미기록 신규 ${unrecorded.length}건${unrecorded.length ? " (npm run ledger:update 로 기록)" : ""}`
  );
  return fail + gone.length;
}

// 의도적으로 sitemap에서 제외된 정적 라우트 — 사유와 함께 관리
const INTENTIONALLY_EXCLUDED = new Set([
  "/share", // noindex/no-follow static shell; result-token documents remain private and outside the sitemap
  "/contact", // 비공개 문의 접수 폼 — page metadata의 noindex에 따라 검색 사이트맵 제외
  "/en/contact", // English private contact counterpart
  "/en/dashboard", // English local personal results
  "/company/compare", // noindex (카니발 해소 2026-06)
  "/dashboard", // 개인화 페이지 — 검색 유입 가치 없음
  "/report", // 개인화 리포트 — 검색 유입 가치 없음
  // /company·/salary-db/submit 은 페이지 삭제(2026-09-25, ⑩ 2단계) — next.config 308 만 남아 목록에서 제거
]);

function fsStaticRoutes(dir = APP_DIR, prefix = ""): string[] {
  const out: string[] = [];
  if (existsSync(join(dir, "page.tsx"))) out.push(prefix || "/");
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    // 동적 세그먼트([slug])·라우트 그룹·api 는 정적 라우트가 아님
    if (
      name.startsWith("[") ||
      name.startsWith("(") ||
      name.startsWith("_") ||
      name === "api"
    )
      continue;
    out.push(...fsStaticRoutes(p, `${prefix}/${name}`));
  }
  return out;
}

async function main() {
  const entries = await sitemap();
  const sitePaths = new Set(
    entries.map((e) => new URL(e.url).pathname.replace(/\/$/, "") || "/")
  );
  const routes = fsStaticRoutes();

  let fail = 0;
  for (const r of routes) {
    if (!sitePaths.has(r) && !INTENTIONALLY_EXCLUDED.has(r)) {
      console.error(`[FAIL] sitemap 미등재 정적 라우트: ${r}`);
      fail++;
    }
  }
  for (const excluded of INTENTIONALLY_EXCLUDED) {
    if (!routes.includes(excluded)) {
      console.warn(`[WARN] 제외 목록의 라우트가 사라짐 (목록 정리 가능): ${excluded}`);
    }
  }

  const staleOverrides = checkOverrideFreshness(entries);
  const invalidDates = checkValidDates(entries);
  const pageDateMismatch = checkPageRevisionDates(entries);
  const webAppDateMismatch = checkWebApplicationDate();

  // 실제 동적 URL 출력도 확인한다. 수정일만 바뀐 글이 발행일로 되돌아가거나
  // 중복/누락되는 회귀를 정적 라우트 목록 검사와 별개로 차단한다.
  let guideDateMismatch = 0;
  for (const [prefix, guides] of [["/guides", koGuides], ["/en/guides", enGuides]] as const) {
    for (const guide of guides) {
      // 한국어 가이드는 본문 정정일(guideContentRevisions)까지 max — sitemap.ts guideUrls 와 같은 규칙
      const expected = prefix === "/guides" ? getGuideContentDate(guide) : getGuideModifiedDate(guide);
      const dates = [guide.publishedDate, expected];
      const validDates = dates.every((date) => /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date);
      const path = `${prefix}/${guide.slug}`;
      const matches = entries.filter((entry) => new URL(entry.url).pathname === path);
      const actualDate = matches[0]?.lastModified;
      const parsedActual = actualDate ? new Date(actualDate) : null;
      const actual = parsedActual && Number.isFinite(parsedActual.getTime())
        ? parsedActual.toISOString().slice(0, 10) : undefined;
      if (!validDates || expected < guide.publishedDate || matches.length !== 1 || actual !== expected) {
        console.error(`[FAIL] 가이드 날짜/등재 불일치: ${path} published=${guide.publishedDate} modified=${expected} sitemap=${actual ?? "없음"} count=${matches.length}`);
        guideDateMismatch++;
      }
    }
  }

  const ledgerFail = await checkUrlLedger(
    entries.map((e) => new URL(e.url).pathname),
    process.argv.includes("--update-ledger")
  );

  console.log(
    `[verify-sitemap] 정적 라우트 ${routes.length}곳 / sitemap URL ${sitePaths.size}건 / 미등재 ${fail}곳 / 가이드 날짜·등재 불일치 ${guideDateMismatch}건 / URL 원장 FAIL ${ledgerFail}건 / 유효하지 않은 날짜 ${invalidDates}건 / 페이지 수정일 불일치 ${pageDateMismatch}건 / override 신선도 경고 ${staleOverrides}건 / WebApplication 날짜 불일치 ${webAppDateMismatch}건`
  );
  if (fail || guideDateMismatch) {
    console.error(
      "→ sitemap.ts 에 등재하거나, 의도적 제외라면 이 스크립트의 목록에 사유와 함께 추가하세요."
    );
  }
  if (fail || guideDateMismatch || ledgerFail || invalidDates || staleOverrides || pageDateMismatch) process.exit(1);
}

main();
