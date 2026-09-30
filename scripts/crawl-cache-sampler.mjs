// scripts/crawl-cache-sampler.mjs
//
// 크롤 건강 표본 점검기(R6-02, 2026-09-27) — 수동 도구. 배포·빌드·예약 작업과 무관하고 package.json 에도 없다.
// 운영 사이트맵에서 계열별 층화 표본 60개를 뽑아 엣지 캐시 적중(cf-cache-status)·5xx·403·망 오류를 잰다.
//
// 사용법:
//   node scripts/crawl-cache-sampler.mjs [--passes 3] [--interval 600] [--seed YYYY-MM-DD]
//        [--sitemap-file <path>] [--limit N] [--out <저장소 밖 json>] [--prev <앞선 실행 --out json>]
//        [--label D0] [--og] [--dry-run]
//
// 대표 지표 = 계열별 pass-1 HIT 비율. pass 1 은 이 도구가 아직 건드리지 않은 URL 이라 실제 방문·크롤러가
//   데워 둔 정도(엣지 캐시 온기)를 보여 준다. pass 2 이후 HIT 는 이 도구가 pass 1 에서 스스로 데운 값이라
//   참고용일 뿐 KPI 로 쓰지 않는다(docs 트래픽 마스터플랜 1-4).
//
// ★앞선 실행과 4시간 안에 다시 돌릴 때(예: 9/28 C01 전·후) — 시드만 바꾸는 것으로는 부족하다.
//   앞선 실행이 모든 pass 에서 데운 캐시(HTML 엣지 캐시 1h, /salary/* 4h)가 남아 있으면 pass 1 이 오염된다.
//   시드를 바꾸면 company·lite·calc·guides·salary 는 모집단이 몫보다 훨씬 커서 거의 안 겹치지만(운영 사이트맵
//   실측 0~4/20·0~2/10·0/5), pay-table 은 모집단 6·몫 5 라 어떤 두 시드도 5개 중 4~5개를 공유하고, 피드 5개는
//   매 실행 같은 URL 이다 — 이 둘은 재시드로 피할 수 없다.
//   그래서 두 번째 실행은 --seed 를 바꾸고 --prev 로 첫 실행의 --out JSON 을 넘긴다. 도구는 그 파일에서
//   4시간(OVERLAP_WINDOW_MS) 안에 요청한 URL 을 '앞선 실행과 겹침'으로 보고 pass-1 분자·분모에서 빼며
//   (집계 줄에 'carried k'), 계열 표본의 과반이 겹치면 그 계열 pass-1 HIT 를 'n/a (overlaps earlier run)' 로 찍는다.
//   --prev 없이 --seed 가 실행일과 다르면 같은 날 기본 시드(= 실행일) 실행이 앞서 있었다고 보고 그 표본·피드와
//   겹치는 URL 을 같은 방식으로 뺀다(이때 pay-table 은 항상 n/a). --prev 가 있으면 시드 추정 대신 실제 요청
//   시각으로만 판정한다(예: D+1 에 어제 시드를 다시 쓸 때 어제 --out 을 주면 4시간이 지나 아무것도 빼지 않는다).
//   같은 시드(기본)로 --prev 없이 4시간 안에 다시 돌리면 도구가 겹침을 알 수 없다 — 그 경우 pass 1 은 믿지 말 것.
//
// 표본(시드 + URL 의 sha256 오름차순 — 같은 시드면 항상 같은 60개):
//   company 20  /salary-db/{id}           (compare·ranking·listed·submit 제외)
//   lite    10  /salary-db/listed/{6자리}
//   calc    10  /calc/{slug}
//   guides  10  /guides/{slug}             (/guides/category/* 제외)
//   pay-table 5 /{civil-servant|teacher|police|firefighter|military}-pay-{연도}
//   salary   5  /salary/{금액}·/monthly/{금액}
//   feeds (60 에 포함 안 함): /robots.txt /sitemap.xml /rss.xml /rss-companies.xml /rss-tables.xml
//     — rss-tables 가 10/16 전에 404 면 실패가 아니라 'not yet live' 로 보고한다.
//   --limit N 은 계열을 돌아가며(각 계열 상위 순번부터) N 개만 남긴다(스모크용). 피드는 그대로 잰다.
//
// 요청: 순차, 요청 사이 300ms 이상, scripts/health-check.mjs 와 같은 브라우저 UA(기본 node UA 는 CF 가 403).
//   캐시 우회 쿼리 없이 평문 URL. redirect: manual(리다이렉트도 그대로 기록). 요청당 제한 20초.
//   --interval 은 pass 가 끝난 뒤 다음 pass 를 시작하기까지 기다리는 초. 기본 3 pass × 간격 600초 ≈ 21분.
//   운영 사이트맵을 직접 받은 경우 그 응답이 곧 /sitemap.xml 의 pass-1 기록이다(두 번 받아 스스로 데우지 않게).
//
// 콜로(2026-09-30 WP-01 CF-05): 무료 플랜의 KR 요청이 해외 콜로(MAD·SJC·ATL 등)로 분 단위로 바뀌고, 콜로마다 엣지 캐시가
//   따로라 pass-1 HIT 비교가 콜로 차이에 오염된다. 그래서 응답마다 cf-ray 의 마지막 '-' 뒤 3글자(대문자)를 colo 로
//   기록하고(헤더가 없으면 '?'), 보고서에 계열×콜로 pass-1 HIT 표를, 집계 줄 맨 끝에 'colo MAD n · SJC n' 을 붙인다
//   (pass 1 표본 요청의 콜로 분포 — 기존 세그먼트의 내용·순서는 한 글자도 바꾸지 않아 9/28 D0·9/29 D+1 줄과 그대로 비교된다).
// --og(옵트인, 기본 꺼짐): pass 1 에서 받은 계열별 첫 표본 HTML 의 og:image 가 https://www.moneysalary.com/api/og 로
//   시작하면 계열당 1개(총 6개 이하)를 pass 1 끝에 한 번만 요청해 status·cf-cache-status·X-OG-Cache·X-OG-Error·TTFB·colo 를
//   기록한다. 결과는 별도 'og' 표와 집계 줄의 og 세그먼트(colo 앞)로만 내고 pass-1 HIT 집계에는 넣지 않는다.
//   OG 5xx·망 오류도 종료 코드 1 이다. UA 는 바꾸지 않는다(--ua 없음 — Yeti 위장은 CF 분석의 Yeti 분류를 오염시킨다).
//
// 출력: stdout 에 마크다운 표 + 마지막 줄에 집계 한 줄(URL 없음 — metrics-ingest log --note 에 그대로 붙인다).
//   --out 은 요청별 원자료 JSON(URL·요청 시각 포함)을 저장소 밖 경로에만 쓴다. 저장소 안 경로(정션·링크를 푼 실제
//   경로 포함)는 읽거나 요청하기 전에 거부하고 exit 2(scripts/naver-referrer-queries.ts 와 같은 판정).
//   --prev 도 원자료 JSON 이라 같은 규칙(저장소 안이면 exit 2). --dry-run 결과 파일은 요청 기록이 없어 받지 않는다.
// 종료 코드: 0 정상 · 1 5xx 또는 망 오류가 한 건이라도 있음(피드·--og 포함)·사이트맵 읽기 실패·인자 오류·--prev 읽기 실패
//   · 2 저장소 안 --out/--prev 거부.
//   403·기타 non-200 은 exit 코드를 바꾸지 않고 표와 집계 줄에만 드러낸다.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

export const HOST = "www.moneysalary.com";
export const BASE = `https://${HOST}`;
/** scripts/health-check.mjs 의 UA 와 같은 값(테스트가 대조한다). */
export const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export const FAMILIES = ["company", "lite", "calc", "guides", "pay-table", "salary"];
export const QUOTAS = { company: 20, lite: 10, calc: 10, guides: 10, "pay-table": 5, salary: 5 };
export const FEED_PATHS = ["/robots.txt", "/sitemap.xml", "/rss.xml", "/rss-companies.xml", "/rss-tables.xml"];
/** /rss-tables.xml 공개 예정일(KST) — 이 날짜 전의 404 는 'not yet live'. */
export const RSS_TABLES_LIVE_FROM = "2026-10-16";
export const MIN_GAP_MS = 300;
export const FETCH_TIMEOUT_MS = 20000;
/** 앞선 실행과의 겹침 창 — 엣지 캐시 TTL 중 가장 긴 /salary/* 4h 를 모든 계열에 보수적으로 쓴다. */
export const OVERLAP_WINDOW_MS = 4 * 3600 * 1000;
export const NA_MARK = "n/a (overlaps earlier run)";
/** --og 대상 og:image 접두 — 이 사이트의 동적 OG 라우트만(정적 이미지·다른 호스트 제외). */
export const OG_PREFIX = `${BASE}/api/og`;
/** --og 로 요청하는 OG 이미지 상한(계열당 1개). */
export const OG_MAX = FAMILIES.length;
/** cf-ray 가 없거나 콜로를 읽을 수 없을 때의 표지. */
export const UNKNOWN_COLO = "?";

const COMPANY_RESERVED = new Set(["compare", "ranking", "listed", "submit"]);
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const USAGE = [
  "사용법: node scripts/crawl-cache-sampler.mjs [--passes 3] [--interval 600] [--seed YYYY-MM-DD]",
  "        [--sitemap-file <path>] [--limit N] [--out <저장소 밖 json>] [--prev <앞선 --out json>]",
  "        [--label D0] [--dry-run]",
  "  --passes N       같은 표본을 N 번 잰다(1~10, 기본 3). 대표 지표는 pass-1 HIT",
  "  --interval S     pass 사이 대기 초(0~86400, 기본 600)",
  "  --seed D         표본 시드(기본 오늘 KST 날짜). 같은 시드 = 같은 표본",
  "  --sitemap-file P 운영 사이트맵 대신 로컬 파일로 표본을 뽑는다",
  "  --limit N        표본을 계열을 돌아가며 N 개로 줄인다(스모크용, 피드는 그대로)",
  "  --out P          요청별 원자료 JSON — 저장소 밖 경로만(저장소 안이면 exit 2)",
  "  --prev P         앞선 실행의 --out JSON. 4시간 안에 요청한 URL 을 pass-1 에서 빼고(carried k),",
  "                   계열 표본의 과반이 겹치면 그 계열을 'n/a (overlaps earlier run)' 로 찍는다",
  "  --label L        집계 줄 날짜 뒤에 붙일 표지(예: D0, D+1, pre-C01)",
  "  --og             (옵트인) pass 1 계열별 첫 표본의 og:image(/api/og)를 계열당 1개만 한 번 더 잰다 —",
  "                   별도 og 표·세그먼트로만 내고 pass1 HIT 집계에는 넣지 않는다",
  "  --dry-run        요청 없이 표본 URL 만 출력(사이트맵 파일이 없으면 사이트맵 1회만 받는다)",
  "",
  "  UA 는 scripts/health-check.mjs 와 같은 브라우저 UA 로 고정(바꾸는 옵션 없음).",
  "",
  "  같은 날(4시간 안) 두 번째 실행: --seed <다른 날짜> --prev <첫 실행 --out>",
  "    재시드는 company·lite·calc·guides·salary 만 겹침을 줄인다. pay-table(모집단 6·몫 5)은 어떤 시드로도",
  "    5개 중 4~5개가 겹치고 피드 5개는 늘 같아서 재시드로 못 피한다 — 도구가 n/a 로 표시한다.",
  "    --prev 없이 시드만 바꾸면 같은 날 기본 시드 실행과 겹친 것으로 추정해 뺀다(pay-table 은 항상 n/a).",
].join("\n");

// ── 계열 분류 ──────────────────────────────────────────────────────────────

/**
 * 경로 → 계열 이름(FAMILIES 또는 "feeds"), 해당 없으면 null.
 * 쿼리·해시는 무시하고 끝 슬래시 하나는 떼고 판정한다. 대소문자는 구분한다(Next 라우트와 같음).
 */
export function classifyPath(input) {
  if (typeof input !== "string" || !input.startsWith("/")) return null;
  let p = input.replace(/[?#].*$/s, "");
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  if (p.includes("//")) return null;
  if (FEED_PATHS.includes(p)) return "feeds";
  if (/^\/salary-db\/listed\/\d{6}$/.test(p)) return "lite";
  const company = /^\/salary-db\/([^/]+)$/.exec(p);
  if (company) return COMPANY_RESERVED.has(company[1]) ? null : "company";
  if (/^\/calc\/[^/]+$/.test(p)) return "calc";
  const guide = /^\/guides\/([^/]+)$/.exec(p);
  if (guide) return guide[1] === "category" ? null : "guides";
  if (/^\/(?:civil-servant|teacher|police|firefighter|military)-pay-\d{4}$/.test(p)) return "pay-table";
  if (/^\/(?:salary|monthly)\/[^/]+$/.test(p)) return "salary";
  return null;
}

// ── 사이트맵 ───────────────────────────────────────────────────────────────

function decodeXml(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** 사이트맵 XML → 이 사이트(https + www) 경로 목록(순서 유지·중복 제거). xhtml:link 대체 주소는 보지 않는다. */
export function parseSitemap(xml) {
  const out = [];
  const seen = new Set();
  for (const m of String(xml).matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/g)) {
    let u;
    try {
      u = new URL(decodeXml(m[1]));
    } catch {
      continue;
    }
    if (u.protocol !== "https:" || u.hostname !== HOST) continue;
    if (seen.has(u.pathname)) continue;
    seen.add(u.pathname);
    out.push(u.pathname);
  }
  return out;
}

// ── 표본 ───────────────────────────────────────────────────────────────────

export function hashKey(seed, url) {
  return createHash("sha256").update(`${seed}${url}`).digest("hex");
}

/**
 * 계열별 모집단을 hash(seed + URL) 오름차순으로 세워 몫(QUOTAS)만큼 뽑는다.
 * 반환: { sample: [{family, path, url, rank}], pools: {계열: 모집단 수}, shortfall: {계열: {want, got}} }
 */
export function sampleUrls(paths, seed, quotas = QUOTAS) {
  const pools = Object.fromEntries(FAMILIES.map((f) => [f, []]));
  for (const p of paths) {
    const f = classifyPath(p);
    if (f && pools[f]) pools[f].push(p);
  }
  const sample = [];
  const shortfall = {};
  for (const f of FAMILIES) {
    const ranked = pools[f]
      .map((p) => ({ p, h: hashKey(seed, BASE + p) }))
      .sort((a, b) => (a.h < b.h ? -1 : a.h > b.h ? 1 : a.p < b.p ? -1 : a.p > b.p ? 1 : 0));
    const want = quotas[f] ?? 0;
    const take = ranked.slice(0, want);
    if (take.length < want) shortfall[f] = { want, got: take.length };
    take.forEach((x, rank) => sample.push({ family: f, path: x.p, url: BASE + x.p, rank }));
  }
  const counts = Object.fromEntries(FAMILIES.map((f) => [f, pools[f].length]));
  return { sample, pools: counts, shortfall };
}

/** 계열을 돌아가며(각 계열 순번 0, 1, 2… 차례로) limit 개만 남긴다. 결과는 계열 순서 → 순번 순서. */
export function applyLimit(sample, limit) {
  if (!limit || limit >= sample.length) return sample;
  const byFamily = FAMILIES.map((f) => sample.filter((s) => s.family === f));
  const kept = new Set();
  for (let r = 0; kept.size < limit; r++) {
    let any = false;
    for (const list of byFamily) {
      if (r < list.length) {
        any = true;
        if (kept.size < limit) kept.add(list[r]);
      }
    }
    if (!any) break;
  }
  return sample.filter((s) => kept.has(s));
}

// ── 앞선 실행과의 겹침 ─────────────────────────────────────────────────────

/**
 * 앞선 실행 --out JSON → 경로별 마지막 요청 시각(epoch ms). 기록마다 at 이 있으면 그 값,
 * 없으면(이 필드를 넣기 전 파일) finishedAt → runAt 순으로 대신 쓴다.
 * 반환: { lastAt: Map, runAt } 또는 { error }
 */
export function prevFetchTimes(payload) {
  if (!payload || typeof payload !== "object" || payload.tool !== "crawl-cache-sampler")
    return { error: "crawl-cache-sampler 의 --out JSON 이 아닙니다" };
  if (payload.dryRun) return { error: "--dry-run 결과 파일은 요청 기록이 없습니다 — 실제 실행의 --out JSON 을 주세요" };
  if (!Array.isArray(payload.records)) return { error: "records 배열이 없습니다" };
  const fallback = [payload.finishedAt, payload.runAt].map((s) => (typeof s === "string" ? Date.parse(s) : NaN)).find(Number.isFinite);
  const lastAt = new Map();
  for (const r of payload.records) {
    if (!r || typeof r.path !== "string") continue;
    const at = Number.isFinite(r.at) ? r.at : fallback;
    if (!Number.isFinite(at)) return { error: "요청 시각(at·finishedAt·runAt)이 없습니다" };
    if (!(lastAt.get(r.path) >= at)) lastAt.set(r.path, at);
  }
  return { lastAt, runAt: typeof payload.runAt === "string" ? payload.runAt : null };
}

/** --prev: 이번 실행 시작 시각 기준 windowMs 안에 앞선 실행이 요청한 대상 경로(미래 시각도 겹침으로 본다). */
export function carriedFromPrev(lastAt, startedAt, targets, windowMs = OVERLAP_WINDOW_MS) {
  const out = new Set();
  for (const t of targets) {
    const at = lastAt.get(t.path);
    if (at != null && startedAt - at < windowMs) out.add(t.path);
  }
  return out;
}

/** --prev 없이 시드 ≠ 실행일: 같은 날 기본 시드(= 실행일) 실행의 전체 표본 60 + 피드와 겹치는 대상 경로. */
export function carriedFromReseed(paths, runDate, targets) {
  const assumed = new Set([...sampleUrls(paths, runDate).sample.map((s) => s.path), ...FEED_PATHS]);
  return new Set(targets.filter((t) => assumed.has(t.path)).map((t) => t.path));
}

// ── 요청 ───────────────────────────────────────────────────────────────────

/**
 * 본문 표지 — .xml 경로는 XML 루트 닫는 태그(HTML 오류 페이지가 200 으로 와도 실패로 잡게 경로가 먼저),
 * HTML 은 </html>, robots.txt 는 User-agent 줄, 나머지는 비어 있지 않음.
 */
export function hasBodyMarker(p, contentType, text) {
  const ct = String(contentType || "").toLowerCase();
  if (p.endsWith(".xml")) return /<\/(?:urlset|sitemapindex|rss|feed)\s*>/i.test(text);
  if (ct.includes("text/html")) return /<\/html\s*>/i.test(text);
  if (p === "/robots.txt") return /user-agent\s*:/i.test(text);
  if (ct.includes("xml")) return /<\/(?:urlset|sitemapindex|rss|feed)\s*>/i.test(text);
  return text.length > 0;
}

/**
 * cf-ray 헤더 → 콜로 3글자(대문자). 'a42e346b7cb52599-SJC' → 'SJC'. 마지막 '-' 뒤 3글자가 영문이 아니거나
 * 헤더가 없으면 UNKNOWN_COLO('?').
 */
export function coloFromRay(ray) {
  if (typeof ray !== "string") return UNKNOWN_COLO;
  const s = ray.trim();
  const i = s.lastIndexOf("-");
  if (i < 0) return UNKNOWN_COLO;
  const code = s.slice(i + 1, i + 4).toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : UNKNOWN_COLO;
}

/** HTML 의 <meta property="og:image" content="…"> 값들(엔티티 해독, 문서 순서). og:image:width 등 하위 속성은 제외. */
export function extractOgImages(html) {
  const out = [];
  for (const m of String(html).matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    const prop = /\bproperty\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag);
    if (!prop || (prop[1] ?? prop[2]).trim().toLowerCase() !== "og:image") continue;
    const content = /\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag);
    if (content) out.push(decodeXml((content[1] ?? content[2]).trim()));
  }
  return out;
}

/** --og 대상: og:image 중 OG_PREFIX(https://www.moneysalary.com/api/og)로 시작하고 경로가 정확히 /api/og 인 첫 URL, 없으면 null. */
export function pickOgImage(html) {
  for (const raw of extractOgImages(html)) {
    if (!raw.startsWith(OG_PREFIX)) continue;
    let u;
    try {
      u = new URL(raw);
    } catch {
      continue;
    }
    if (u.origin === BASE && u.pathname === "/api/og") return u.href;
  }
  return null;
}

/**
 * 한 번 가져오기. 예외는 던지지 않고 기록의 error 로 남긴다. { rec, text } — at 은 요청 시작 시각(epoch ms, --prev 판정용).
 * colo 는 cf-ray 의 콜로(없으면 '?'), ttfb 는 응답 헤더까지의 ms. og: true 면 X-OG-Cache·X-OG-Error 를 기록하고
 * 본문 표지는 이미지 content-type 으로 본다(본문 텍스트는 돌려주지 않는다).
 */
export async function fetchOnce(target, pass, io, { og = false } = {}) {
  const rec = {
    pass,
    family: target.family,
    path: target.path,
    url: target.url,
    at: io.clock(),
    status: null,
    cache: null,
    age: null,
    colo: UNKNOWN_COLO,
    bytes: null,
    ttfb: null,
    ms: null,
    marker: null,
    contentType: null,
    error: null,
  };
  if (og) {
    rec.source = target.source ?? null;
    rec.ogCache = null;
    rec.ogError = null;
  }
  const t0 = io.now();
  let text = "";
  try {
    const res = await io.fetch(target.url, {
      headers: { "user-agent": UA },
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    rec.ttfb = Math.round(io.now() - t0);
    rec.colo = coloFromRay(res.headers.get("cf-ray"));
    const buf = new Uint8Array(await res.arrayBuffer());
    rec.ms = Math.round(io.now() - t0);
    rec.status = res.status;
    const cache = res.headers.get("cf-cache-status");
    rec.cache = cache ? cache.trim().toUpperCase() : null;
    const age = res.headers.get("age");
    rec.age = age && /^\d+$/.test(age.trim()) ? Number(age.trim()) : null;
    rec.contentType = res.headers.get("content-type");
    rec.bytes = buf.byteLength;
    if (og) {
      const oc = res.headers.get("x-og-cache");
      rec.ogCache = oc ? oc.trim().toUpperCase() : null;
      const oe = res.headers.get("x-og-error");
      rec.ogError = oe ? oe.trim().slice(0, 200) : null;
      if (res.status === 200) rec.marker = /^image\//i.test(String(rec.contentType || "").trim()) && buf.byteLength > 0;
    } else {
      text = new TextDecoder().decode(buf);
      if (res.status === 200) rec.marker = hasBodyMarker(target.path, rec.contentType, text);
    }
  } catch (e) {
    rec.ms = Math.round(io.now() - t0);
    rec.error = e?.name === "TimeoutError" ? "timeout" : String(e?.cause?.code ?? e?.message ?? e).slice(0, 200);
  }
  return { rec, text };
}

/**
 * passes 번 순차로 잰다. 요청 사이에는 항상 gapMs 이상 쉬고, pass 사이에는 intervalSec 초를 더 쉰다.
 * prefetched: pass 1 에서 이미 받은 기록(경로 → rec, 예: 표본용으로 받은 /sitemap.xml) — 다시 받지 않는다.
 * og: { records: [], skipped: [] } 를 주면(--og) pass 1 이 끝난 직후 계열별 첫 표본 HTML 의 og:image(/api/og)를
 *   계열당 1개씩 한 번만 요청해 og.records 에 넣는다(반환 records 에는 섞지 않는다 — pass1 HIT 집계와 분리).
 */
export async function runPasses(targets, { passes, intervalSec, gapMs = MIN_GAP_MS, og = null }, io, prefetched = new Map()) {
  const records = [];
  const firstHtml = new Map(); // 계열 → pass 1 첫 표본 { path, html }
  let fetchedAny = prefetched.size > 0;
  for (let pass = 1; pass <= passes; pass++) {
    if (pass > 1 && intervalSec > 0) await io.sleep(intervalSec * 1000);
    for (const t of targets) {
      if (pass === 1 && prefetched.has(t.path)) {
        records.push({ ...prefetched.get(t.path), pass: 1, family: t.family });
        continue;
      }
      if (fetchedAny) await io.sleep(gapMs);
      fetchedAny = true;
      const { rec, text } = await fetchOnce(t, pass, io);
      records.push(rec);
      if (og && pass === 1 && FAMILIES.includes(t.family) && !firstHtml.has(t.family))
        firstHtml.set(t.family, { path: t.path, html: rec.status === 200 ? text : "" });
    }
    if (og && pass === 1) {
      for (const family of FAMILIES) {
        const first = firstHtml.get(family);
        if (!first) continue;
        if (og.records.length >= OG_MAX) break;
        const url = pickOgImage(first.html);
        if (!url) {
          og.skipped.push({ family, source: first.path, reason: first.html ? "no-api-og-image" : "first-sample-not-200" });
          continue;
        }
        if (fetchedAny) await io.sleep(gapMs);
        fetchedAny = true;
        const u = new URL(url);
        og.records.push((await fetchOnce({ family, path: u.pathname + u.search, url, source: first.path }, 1, io, { og: true })).rec);
      }
    }
    const inPass = records.filter((r) => r.pass === pass);
    const s5 = inPass.filter((r) => r.status >= 500).length;
    const net = inPass.filter((r) => r.error != null).length;
    io.progress?.(
      `pass ${pass}/${passes} 완료 — ${inPass.length}건 · 5xx ${s5} · 망 오류 ${net}` +
        (og && pass === 1 ? ` · og ${og.records.length}건` : "") +
        (pass < passes ? ` · 다음 pass 까지 ${intervalSec}초 대기` : "")
    );
  }
  return records;
}

// ── 집계 ───────────────────────────────────────────────────────────────────

export function median(values) {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = v.length >> 1;
  return v.length % 2 ? v[mid] : Math.round((v[mid - 1] + v[mid]) / 2);
}

const isHit = (r) => r.error == null && r.cache === "HIT";
const responded = (r) => r.error == null && r.status != null;

/**
 * 계열별 집계 — pass 1 과 pass 2 이후를 따로 센다.
 * carried: 앞선 실행과 겹친 경로. pass-1 지표(HIT·cf-cache-status·Age·ms)는 이 경로를 분자·분모에서 뺀 값이고,
 *   p1Carried 에 뺀 수, 계열 pass-1 표본의 과반이 겹치면 p1Na = true(HIT 를 n/a 로 찍는다).
 *   5xx·403·망 오류·본문 표지·pass2+ 는 겹침과 무관하게 전부 센다.
 */
export function aggregate(records, { families = [...FAMILIES, "feeds"], carried = new Set() } = {}) {
  return families.map((family) => {
    const rs = records.filter((r) => r.family === family);
    const p1All = rs.filter((r) => r.pass === 1);
    const p1 = p1All.filter((r) => !carried.has(r.path));
    const p1Carried = p1All.length - p1.length;
    const pn = rs.filter((r) => r.pass > 1);
    const p1Cache = {};
    for (const r of p1) {
      const k = r.error != null ? "ERR" : r.cache ?? "NONE";
      p1Cache[k] = (p1Cache[k] ?? 0) + 1;
    }
    // 콜로별 — p1ByColo 는 pass-1 HIT 와 같은 분모(겹침 제외), p1Colo 는 pass 1 전체 요청의 콜로 분포(집계 줄 끝 세그먼트용)
    const p1ByColo = {};
    for (const r of p1) {
      const c = (p1ByColo[r.colo ?? UNKNOWN_COLO] ??= { n: 0, hit: 0 });
      c.n++;
      if (isHit(r)) c.hit++;
    }
    const p1Colo = {};
    for (const r of p1All) p1Colo[r.colo ?? UNKNOWN_COLO] = (p1Colo[r.colo ?? UNKNOWN_COLO] ?? 0) + 1;
    const ok200 = rs.filter((r) => responded(r) && r.status === 200);
    return {
      family,
      urls: new Set(rs.map((r) => r.path)).size,
      n: rs.length,
      s5xx: rs.filter((r) => responded(r) && r.status >= 500).length,
      s403: rs.filter((r) => responded(r) && r.status === 403).length,
      net: rs.filter((r) => r.error != null).length,
      other: rs.filter((r) => responded(r) && r.status !== 200 && r.status !== 403 && r.status < 500).length,
      p1: { n: p1.length, hit: p1.filter(isHit).length },
      p1Carried,
      p1Na: p1Carried > 0 && p1Carried * 2 > p1All.length,
      pn: { n: pn.length, hit: pn.filter(isHit).length },
      p1Cache,
      p1ByColo,
      p1Colo,
      ageMedP1: median(p1.filter(responded).map((r) => r.age ?? NaN)),
      msMedP1: median(p1.filter(responded).map((r) => r.ms)),
      msMedPn: median(pn.filter(responded).map((r) => r.ms)),
      body: { ok: ok200.filter((r) => r.marker === true).length, of: ok200.length },
    };
  });
}

const feedName = (p) => p.replace(/^\//, "").replace(/\.[a-z]+$/, "");

/** 피드별 판정 — ok(전 pass 200 + 본문 표지) · notYetLive(10/16 전 rss-tables 404) · fail(사유). */
export function feedVerdicts(records, runDate) {
  const out = [];
  for (const p of FEED_PATHS) {
    const rs = records.filter((r) => r.family === "feeds" && r.path === p);
    if (!rs.length) continue;
    const name = feedName(p);
    const bad = rs.find((r) => !(responded(r) && r.status === 200 && r.marker === true));
    if (!bad) out.push({ name, path: p, verdict: "ok" });
    else if (p === "/rss-tables.xml" && runDate < RSS_TABLES_LIVE_FROM && rs.every((r) => responded(r) && r.status === 404))
      out.push({ name, path: p, verdict: "notYetLive" });
    else {
      const reason = bad.error != null ? "net" : bad.status !== 200 ? String(bad.status) : "marker";
      out.push({ name, path: p, verdict: "fail", reason });
    }
  }
  return out;
}

const pct = (hit, n) => (n ? `${Math.round((hit / n) * 100)}%` : "-");

/** 계열 pass-1 HIT 한 칸 — 과반 겹침이면 n/a, 일부 겹침이면 뺀 뒤 비율 + carried k. */
const p1HitText = (r) =>
  r.p1Na ? NA_MARK : `${pct(r.p1.hit, r.p1.n)}${r.p1Carried ? ` (carried ${r.p1Carried})` : ""}`;

/** 값 → 개수 표를 '많은 순, 같으면 이름 순' 'K n K n' 문자열로. */
const countsText = (obj) =>
  Object.entries(obj)
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([k, v]) => `${k} ${v}`);

/** pass 1 표본(피드 제외) 요청의 콜로 분포 — 'colo MAD 58 · SJC 2', 표본이 없으면 null. */
export function coloSegment(rows) {
  const total = {};
  for (const r of rows) {
    if (r.family === "feeds") continue;
    for (const [c, n] of Object.entries(r.p1Colo ?? {})) total[c] = (total[c] ?? 0) + n;
  }
  const parts = countsText(total);
  return parts.length ? `colo ${parts.join(" · ")}` : null;
}

/**
 * --og 기록 요약(URL 없음) — 'og 200 6/6 (cf HIT 2 MISS 4, x-og-cache HIT 3 MISS 3, x-og-error 0, 5xx 0, net 0, ttfb med 412ms)'.
 * OG 이미지가 하나도 없으면 'og none (no api og image)'.
 */
export function ogSegment(ogRecords) {
  if (!ogRecords.length) return "og none (no api og image)";
  const got = ogRecords.filter(responded);
  const tally = (key) => {
    const t = {};
    for (const r of got) if (r[key]) t[r[key]] = (t[r[key]] ?? 0) + 1;
    const parts = countsText(t);
    return parts.length ? parts.join(" ") : "-";
  };
  const ok = got.filter((r) => r.status === 200).length;
  const s5 = got.filter((r) => r.status >= 500).length;
  const net = ogRecords.length - got.length;
  const xerr = got.filter((r) => r.ogError).length;
  const ttfb = median(got.map((r) => r.ttfb));
  return (
    `og 200 ${ok}/${ogRecords.length} (cf ${tally("cache")}, x-og-cache ${tally("ogCache")}, x-og-error ${xerr}, ` +
    `5xx ${s5}, net ${net}, ttfb med ${ttfb == null ? "-" : `${ttfb}ms`})`
  );
}

/**
 * 집계 한 줄 — URL·경로를 싣지 않는다(계열 이름·피드 이름·숫자만). metrics-ingest --note 용.
 * overlap: { source: "prev" | "reseed", carried } — 겹침 점검을 했으면 끝에 'overlap-check …' 를 붙인다.
 * 2026-09-30(CF-05): 그 뒤에 --og 였으면 og 세그먼트, 맨 끝에 pass 1 표본의 콜로 분포 'colo …' 를 붙인다.
 *   앞의 세그먼트는 내용·순서 모두 종전과 같다(9/28 D0·9/29 D+1 줄의 접두부와 그대로 비교된다).
 */
export function aggregateLine(rows, feeds, { runDate, label, overlap = null, ogRecords = null }) {
  const md = `${Number(runDate.slice(5, 7))}/${Number(runDate.slice(8, 10))}`;
  const head = `crawl-sampler ${md}${label ? ` ${label}` : ""}:`;
  const sampled = rows.filter((r) => r.family !== "feeds");
  const sum = (k) => sampled.reduce((a, r) => a + r[k], 0);
  const hits = sampled.map((r) => `${r.family} ${p1HitText(r)}`);
  const pnN = sampled.reduce((a, r) => a + r.pn.n, 0);
  const pnHit = sampled.reduce((a, r) => a + r.pn.hit, 0);
  const segs = [`pass1 HIT ${hits.join(" · ")}`];
  if (pnN) segs.push(`pass2+ HIT ${pct(pnHit, pnN)}`);
  segs.push(`5xx ${sum("s5xx")}/${sum("n")}`, `403 ${sum("s403")}`, `net ${sum("net")}`, `non200 ${sum("other")}`);
  if (feeds.length) {
    const ok = feeds.filter((f) => f.verdict === "ok").length;
    let s = `feeds ${ok}/${feeds.length} ok`;
    const nyl = feeds.filter((f) => f.verdict === "notYetLive").map((f) => f.name);
    if (nyl.length) s += ` (${nyl.join(", ")} not yet live)`;
    const fail = feeds.filter((f) => f.verdict === "fail").map((f) => `${f.name} ${f.reason}`);
    if (fail.length) s += ` FAIL ${fail.join(", ")}`;
    segs.push(s);
  }
  if (overlap?.source) segs.push(`overlap-check ${overlap.source} (carried ${overlap.carried})`);
  if (ogRecords) segs.push(ogSegment(ogRecords));
  const colo = coloSegment(rows);
  if (colo) segs.push(colo);
  return `${head} ${segs.join(" · ")}`;
}

/** 겹침 점검 설명 줄(보고서·dry-run 공용). overlap 이 없으면 빈 배열. */
export function overlapNote(overlap, { seed, runDate }) {
  if (!overlap?.source) return [];
  const byFamily = Object.entries(overlap.byFamily ?? {})
    .filter(([, k]) => k > 0)
    .map(([f, k]) => `${f} ${k}`)
    .join(" · ");
  const counts = `겹친 URL ${overlap.carried}개${byFamily ? `(${byFamily})` : ""}`;
  const head =
    overlap.source === "prev"
      ? `⚠ 겹침 점검(--prev${overlap.prevRunAt ? `, 앞선 실행 ${overlap.prevRunAt}` : ""}): 4시간 안에 앞선 실행이 요청한 ${counts}를 pass-1 지표에서 뺀다.`
      : `⚠ 겹침 점검(시드 ${seed} ≠ 실행일 ${runDate}, --prev 없음): 같은 날 기본 시드(${runDate}) 실행이 앞서 있었다고 보고 ` +
        `그 표본·피드와 ${counts}를 pass-1 지표에서 뺀다. 앞선 --out JSON 을 --prev 로 주면 실제 요청 시각으로 판정한다.`;
  return [
    head,
    "  계열 표본의 과반이 겹치면 pass1 HIT 를 'n/a (overlaps earlier run)' 로 둔다 — pay-table(모집단 6·몫 5)과 피드는 시드를 바꿔도 거의 전부 겹친다.",
  ];
}

/** 표 칸 안전 문자열 — '|'·줄바꿈 제거, 길이 제한. */
const cell = (v, max = 60) => {
  const s = String(v ?? "-").replace(/[|\r\n]+/g, " ");
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

/** 계열×콜로 pass-1 HIT 표(겹침 제외 분모 — 위 표의 pass1 HIT 와 같은 기준). 표본 기록이 없으면 빈 배열. */
export function coloTable(rows) {
  const sampled = rows.filter((r) => r.family !== "feeds" && Object.keys(r.p1Colo ?? {}).length);
  if (!sampled.length) return [];
  const totals = {};
  for (const r of sampled) for (const [c, n] of Object.entries(r.p1Colo)) totals[c] = (totals[c] ?? 0) + n;
  const colos = countsText(totals).map((s) => s.split(" ")[0]);
  const lines = [
    "### pass1 HIT — 계열 × 콜로(cf-ray)",
    "",
    `| 계열 | ${colos.join(" | ")} |`,
    `|---|${colos.map(() => "---:").join("|")}|`,
  ];
  for (const r of sampled) {
    const cells = colos.map((c) => {
      const x = r.p1ByColo?.[c];
      if (!x || !x.n) return (r.p1Colo[c] ?? 0) > 0 ? "겹침만" : "-";
      return r.p1Na ? "n/a" : `${pct(x.hit, x.n)} (${x.hit}/${x.n})`;
    });
    lines.push(`| ${r.family} | ${cells.join(" | ")} |`);
  }
  lines.push(`콜로 분포(pass 1 표본 요청): ${countsText(totals).join(" · ")}`);
  return lines;
}

/** --og 표 — 계열당 1행. pass1 HIT 집계와 별개. */
export function ogTable(ogRecords, ogSkipped = []) {
  const lines = ["### OG 이미지(--og · pass 1 끝에 계열당 1개 · pass1 HIT 집계와 별개)", ""];
  if (ogRecords.length) {
    lines.push("| 계열 | 원본 쪽 | og:image | status | cf-cache-status | X-OG-Cache | X-OG-Error | TTFB ms | colo |");
    lines.push("|---|---|---|---:|---|---|---|---:|---|");
    for (const r of ogRecords) {
      const status = r.error != null ? `망 오류 ${cell(r.error, 40)}` : r.status;
      lines.push(
        `| ${r.family} | ${cell(r.source)} | ${cell(r.path, 48)} | ${status} | ${cell(r.cache)} | ${cell(r.ogCache)} | ` +
          `${cell(r.ogError)} | ${r.ttfb ?? "-"} | ${r.colo ?? UNKNOWN_COLO} |`
      );
    }
  } else lines.push("(요청한 OG 이미지 없음)");
  for (const s of ogSkipped) lines.push(`- ${s.family}: ${s.source} → 건너뜀(${s.reason})`);
  return lines;
}

/** 마크다운 보고서(표 + 이상 상세). 마지막 줄 집계 줄은 main 이 따로 붙인다. */
export function formatReport({ rows, feeds, records, runDate, seed, passes, intervalSec, sampleSize, limit, pools, shortfall, overlap = null, ogRecords = null, ogSkipped = [] }) {
  const lines = [];
  lines.push(`## crawl-cache-sampler — ${runDate} KST`);
  lines.push("");
  lines.push(
    `시드 ${seed} · ${passes} pass(간격 ${intervalSec}초) · 표본 ${sampleSize}${limit ? `(--limit ${limit})` : ""} + 피드 ${FEED_PATHS.length}(60 에 미포함)`
  );
  lines.push(`모집단: ${FAMILIES.map((f) => `${f} ${pools[f]}`).join(" · ")}`);
  for (const [f, s] of Object.entries(shortfall)) lines.push(`⚠ ${f}: 모집단 부족 — ${s.got}/${s.want}`);
  lines.push("대표 지표 = pass1 HIT(실제 방문·크롤러가 데운 정도). pass2+ HIT 는 이 도구가 데운 값이라 참고용.");
  lines.push(...overlapNote(overlap, { seed, runDate }));
  const sampledRows = rows.filter((r) => r.family !== "feeds" && r.p1Carried + r.p1.n > 0);
  if (sampledRows.length && sampledRows.every((r) => r.p1Na))
    lines.push("⚠ 모든 계열이 앞선 실행과 겹쳤다(같은 시드로 다시 잰 것) — 두 번째 실행은 --seed 를 다른 날짜로 바꿀 것.");
  lines.push("");
  lines.push(
    "| 계열 | URL | 요청 | pass1 HIT | pass2+ HIT | pass1 cf-cache-status | Age 중앙(p1, 초) | ms 중앙(p1) | ms 중앙(p2+) | 5xx | 403 | 망 오류 | 기타 non-200 | 본문 표지 |"
  );
  lines.push("|---|---:|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|");
  const dash = (v) => (v == null ? "-" : String(v));
  for (const r of rows) {
    const cache =
      Object.entries(r.p1Cache)
        .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
        .map(([k, v]) => `${k} ${v}`)
        .join(" · ") || "-";
    const p1Cell = r.p1Na
      ? `${NA_MARK} · 겹침 ${r.p1Carried}/${r.p1Carried + r.p1.n}`
      : `${pct(r.p1.hit, r.p1.n)} (${r.p1.hit}/${r.p1.n})${r.p1Carried ? ` · 겹침 ${r.p1Carried} 제외` : ""}`;
    lines.push(
      `| ${r.family} | ${r.urls} | ${r.n} | ${p1Cell} | ` +
        `${r.pn.n ? `${pct(r.pn.hit, r.pn.n)} (${r.pn.hit}/${r.pn.n})` : "-"} | ${cache} | ` +
        `${dash(r.ageMedP1)} | ${dash(r.msMedP1)} | ${dash(r.msMedPn)} | ${r.s5xx} | ${r.s403} | ${r.net} | ${r.other} | ` +
        `${r.body.ok}/${r.body.of} |`
    );
  }
  const colo = coloTable(rows);
  if (colo.length) lines.push("", ...colo);
  if (ogRecords) lines.push("", ...ogTable(ogRecords, ogSkipped));
  if (feeds.length) {
    lines.push("");
    lines.push(
      `피드: ${feeds
        .map((f) => `${f.name} ${f.verdict === "ok" ? "ok" : f.verdict === "notYetLive" ? "not yet live(404, 10/16 공개 예정)" : `FAIL ${f.reason}`}`)
        .join(" · ")}`
    );
  }
  const bad = records.filter((r) => r.error != null || r.status !== 200 || r.marker !== true);
  const shown = bad.filter((r) => !(r.path === "/rss-tables.xml" && feeds.some((f) => f.path === r.path && f.verdict === "notYetLive")));
  if (shown.length) {
    lines.push("");
    lines.push(`### 이상 요청 ${shown.length}건${shown.length > 30 ? "(앞 30건)" : ""}`);
    for (const r of shown.slice(0, 30)) {
      const what = r.error != null ? `망 오류 ${r.error}` : r.status !== 200 ? `status ${r.status}` : "본문 표지 없음";
      lines.push(`- p${r.pass} ${r.family} ${r.path} → ${what}`);
    }
  }
  return lines.join("\n");
}

// ── CLI ────────────────────────────────────────────────────────────────────

export function kstDate(ms) {
  return new Date(ms + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

function isValidDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function parseArgs(argv) {
  const o = { passes: 3, interval: 600, seed: null, sitemapFile: null, limit: null, out: null, prev: null, label: null, og: false, dryRun: false, help: false };
  const int = (name, v, lo, hi) => {
    if (!/^\d+$/.test(v) || Number(v) < lo || Number(v) > hi) throw new Error(`--${name} 는 ${lo}~${hi} 정수여야 합니다: ${v}`);
    return Number(v);
  };
  try {
    for (let i = 0; i < argv.length; i++) {
      const a = argv[i];
      if (a === "--dry-run") {
        o.dryRun = true;
        continue;
      }
      if (a === "--og") {
        o.og = true;
        continue;
      }
      if (a === "--help" || a === "-h") {
        o.help = true;
        continue;
      }
      const m = /^--([a-z-]+)(?:=(.*))?$/s.exec(a);
      if (!m) throw new Error(`알 수 없는 인자: ${a}`);
      const name = m[1];
      const value = m[2] ?? argv[++i];
      if (value === undefined) throw new Error(`--${name} 값이 없습니다`);
      switch (name) {
        case "passes":
          o.passes = int(name, value, 1, 10);
          break;
        case "interval":
          o.interval = int(name, value, 0, 86400);
          break;
        case "limit":
          o.limit = int(name, value, 1, 100000);
          break;
        case "seed":
          if (!isValidDate(value)) throw new Error(`--seed 는 YYYY-MM-DD 날짜여야 합니다: ${value}`);
          o.seed = value;
          break;
        case "sitemap-file":
          o.sitemapFile = value;
          break;
        case "out":
          o.out = value;
          break;
        case "prev":
          o.prev = value;
          break;
        case "label":
          // 집계 줄에 들어가므로 URL·경로가 될 수 있는 글자('/' ':')는 받지 않는다
          if (!/^[A-Za-z0-9가-힣 ._+()-]{1,32}$/.test(value)) throw new Error(`--label 은 영숫자·한글·공백·._+()- 1~32자: ${value}`);
          o.label = value.trim();
          break;
        default:
          throw new Error(`알 수 없는 옵션: --${name}`);
      }
    }
  } catch (e) {
    return { error: e.message };
  }
  return { opts: o };
}

export function isPathInside(target, root) {
  const rel = path.relative(path.resolve(root), path.resolve(target));
  if (rel === "") return true;
  if (path.isAbsolute(rel)) return false; // win32 다른 드라이브
  return rel !== ".." && !rel.startsWith(`..${path.sep}`);
}

/** 정션·심볼릭 링크를 푼 실제 경로. 없는 경로면 가장 가까운 존재하는 조상까지 풀고 나머지를 붙인다. */
export function realpathLoose(p) {
  const abs = path.resolve(p);
  const rest = [];
  let cur = abs;
  for (;;) {
    try {
      const real = realpathSync.native(cur);
      return rest.length ? path.join(real, ...rest) : real;
    } catch {
      const parent = path.dirname(cur);
      if (parent === cur) return abs;
      rest.unshift(path.basename(cur));
      cur = parent;
    }
  }
}

export function defaultIo() {
  return {
    fetch: (url, init) => fetch(url, init),
    sleep: (ms) => delay(ms),
    now: () => performance.now(),
    clock: () => Date.now(),
    stdout: (s) => process.stdout.write(s),
    stderr: (s) => process.stderr.write(s),
    progress: (s) => process.stderr.write(`${s}\n`),
    readText: (p) => readFileSync(p, "utf8"),
    writeText: (p, s) => {
      mkdirSync(path.dirname(p), { recursive: true });
      writeFileSync(p, s);
    },
    realpath: realpathLoose,
    repoRoot: REPO_ROOT,
    cwd: process.cwd(),
  };
}

/** CLI 본체 — 종료 코드를 돌려준다. io 는 테스트가 fetch·sleep·시계·출력을 바꿔 끼운다. */
export async function main(argv, ioOverrides = {}) {
  const io = { ...defaultIo(), ...ioOverrides };
  const parsed = parseArgs(argv);
  if (parsed.error) {
    io.stderr(`${parsed.error}\n${USAGE}\n`);
    return 1;
  }
  const o = parsed.opts;
  if (o.help) {
    io.stdout(`${USAGE}\n`);
    return 0;
  }
  const startedAt = io.clock();
  const runDate = kstDate(startedAt);
  const seed = o.seed ?? runDate;

  // 1) 저장소 안 --out·--prev 거부 — 원자료(URL 목록)가 작업 트리에 들어가 커밋·배포되지 않게. 요청 전에 판정한다.
  const outsideRepo = (p) => {
    const lexical = path.resolve(io.cwd, p);
    const real = io.realpath(lexical);
    const inside = isPathInside(lexical, io.repoRoot) || isPathInside(real, io.realpath(io.repoRoot));
    return inside ? null : real;
  };
  let outPath = null;
  if (o.out) {
    outPath = outsideRepo(o.out);
    if (!outPath) {
      io.stderr(
        "거부: --out 경로가 저장소 작업 트리 안에 있습니다 — 원자료 JSON 은 저장소 밖 폴더에만 씁니다.\n" +
          "예: --out C:/Users/<나>/Documents/crawl-sampler/2026-09-28.json\n"
      );
      return 2;
    }
  }
  let prev = null;
  if (o.prev) {
    const prevPath = outsideRepo(o.prev);
    if (!prevPath) {
      io.stderr("거부: --prev 경로가 저장소 작업 트리 안에 있습니다 — 원자료 JSON 은 저장소 밖 폴더에만 둡니다.\n");
      return 2;
    }
    let payload;
    try {
      payload = JSON.parse(io.readText(prevPath));
    } catch (e) {
      io.stderr(`--prev 파일을 읽을 수 없습니다: ${e?.message ?? e}\n`);
      return 1;
    }
    prev = prevFetchTimes(payload);
    if (prev.error) {
      io.stderr(`--prev 를 쓸 수 없습니다: ${prev.error}\n`);
      return 1;
    }
  }

  // 2) 사이트맵 → 표본
  let xml;
  let sitemapSource;
  const prefetched = new Map();
  if (o.sitemapFile) {
    try {
      xml = io.readText(path.resolve(io.cwd, o.sitemapFile));
    } catch (e) {
      io.stderr(`사이트맵 파일을 읽을 수 없습니다: ${e?.message ?? e}\n`);
      return 1;
    }
    sitemapSource = "file";
  } else {
    const t = { family: "feeds", path: "/sitemap.xml", url: `${BASE}/sitemap.xml` };
    const { rec, text } = await fetchOnce(t, 1, io);
    if (rec.error != null || rec.status !== 200) {
      io.stderr(`운영 사이트맵을 받지 못했습니다: ${rec.error ?? `status ${rec.status}`}\n`);
      return 1;
    }
    xml = text;
    sitemapSource = "live";
    if (!o.dryRun) prefetched.set("/sitemap.xml", rec);
  }
  const paths = parseSitemap(xml);
  const { sample, pools, shortfall } = sampleUrls(paths, seed);
  const picked = applyLimit(sample, o.limit);
  if (!picked.length) {
    io.stderr(`표본이 0개입니다 — 사이트맵에서 이 사이트 URL 을 찾지 못했습니다(읽은 경로 ${paths.length}개).\n`);
    return 1;
  }
  const targets = [...picked, ...FEED_PATHS.map((p) => ({ family: "feeds", path: p, url: BASE + p }))];

  // 앞선 실행과의 겹침 — --prev 가 있으면 실제 요청 시각(4시간 창), 없고 시드 ≠ 실행일이면 같은 날 기본 시드 실행을 추정
  let carried = new Set();
  let overlap = null;
  if (prev) {
    carried = carriedFromPrev(prev.lastAt, startedAt, targets);
    overlap = { source: "prev", prevRunAt: prev.runAt };
  } else if (seed !== runDate) {
    carried = carriedFromReseed(paths, runDate, targets);
    overlap = { source: "reseed" };
  }
  if (overlap) {
    overlap.carried = carried.size;
    overlap.windowHours = OVERLAP_WINDOW_MS / 3600000;
    overlap.byFamily = Object.fromEntries(
      [...FAMILIES, "feeds"].map((f) => [f, targets.filter((t) => t.family === f && carried.has(t.path)).length])
    );
  }

  if (o.dryRun) {
    const lines = [
      `## crawl-cache-sampler --dry-run — 시드 ${seed} · 표본 ${picked.length}개 · ${new Set(picked.map((s) => s.family)).size}개 계열`,
      `모집단: ${FAMILIES.map((f) => `${f} ${pools[f]}`).join(" · ")}`,
      ...Object.entries(shortfall).map(([f, s]) => `⚠ ${f}: 모집단 부족 — ${s.got}/${s.want}`),
      ...overlapNote(overlap, { seed, runDate }),
      "",
      ...picked.map((s) => `${s.family}\t${s.url}`),
      "",
      `피드(60 에 미포함, 매 pass 함께 잰다): ${FEED_PATHS.map(feedName).join(" · ")}`,
      ...(o.og ? ["--og: 실제 실행에서 pass 1 계열별 첫 표본 HTML 의 og:image(/api/og)를 계열당 1개 잰다(dry-run 은 요청 없음)."] : []),
    ];
    io.stdout(`${lines.join("\n")}\n`);
    if (outPath) {
      io.writeText(
        outPath,
        `${JSON.stringify({ tool: "crawl-cache-sampler", dryRun: true, runDate, seed, sitemapSource, pools, shortfall, overlap, carried: [...carried], sample: picked }, null, 2)}\n`
      );
    }
    return 0;
  }

  // 3) 요청 (--og 는 pass 1 끝에 계열당 1개 — 기록은 따로 둔다)
  const og = o.og ? { records: [], skipped: [] } : null;
  const records = await runPasses(targets, { passes: o.passes, intervalSec: o.interval, og }, io, prefetched);

  // 4) 집계 (og 기록은 pass1 HIT 집계에 넣지 않는다)
  const rows = aggregate(records, { carried });
  const feeds = feedVerdicts(records, runDate);
  const line = aggregateLine(rows, feeds, { runDate, label: o.label, overlap, ogRecords: og ? og.records : null });
  const report = formatReport({
    rows,
    feeds,
    records,
    runDate,
    seed,
    passes: o.passes,
    intervalSec: o.interval,
    sampleSize: picked.length,
    limit: o.limit,
    pools,
    shortfall,
    overlap,
    ogRecords: og ? og.records : null,
    ogSkipped: og ? og.skipped : [],
  });
  io.stdout(`${report}\n\n${line}\n`);

  if (outPath) {
    const payload = {
      tool: "crawl-cache-sampler",
      runAt: new Date(startedAt).toISOString(),
      finishedAt: new Date(io.clock()).toISOString(),
      runDate,
      seed,
      passes: o.passes,
      intervalSec: o.interval,
      limit: o.limit,
      label: o.label,
      sitemapSource,
      pools,
      shortfall,
      overlap,
      carried: [...carried],
      sample: picked,
      records,
      og,
      rows,
      feeds,
      line,
    };
    try {
      io.writeText(outPath, `${JSON.stringify(payload, null, 2)}\n`);
    } catch (e) {
      io.stderr(`--out 을 쓰지 못했습니다: ${e?.message ?? e}\n`);
      return 1;
    }
  }

  const bad = (r) => r.error != null || (r.status != null && r.status >= 500);
  const failed = records.some(bad) || (og ? og.records.some(bad) : false);
  return failed ? 1 : 0;
}

const isDirectRun = (() => {
  if (!process.argv[1]) return false;
  const a = path.resolve(process.argv[1]);
  const b = fileURLToPath(import.meta.url);
  return process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
})();

if (isDirectRun) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (e) => {
      process.stderr.write(`crawl-cache-sampler 예외: ${e?.stack ?? e}\n`);
      process.exitCode = 1;
    }
  );
}
