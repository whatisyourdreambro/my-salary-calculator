// scripts/qa-crawl.ts
//
// 배포 전 정합성 크롤 게이트 — npm run qa:crawl (tsx).
// 로컬 프로덕션 서버(npm run build && npm run start)를 사이트맵 기반으로 순회하며
// 지시서 §TASK-6 의 (a)~(e) 를 검증한다. 실패 시 qa-report.md 기록 + exit 1.
//
//  (a) 카운트 정합: 렌더된 회사 수·성과급 종 수가 site-metrics 파생값과 일치,
//      스테일 리터럴(480곳·485개 등) 0건 + gen-site-metrics --check·verify:companies 인라인
//  (b) 빈 수치: /salary·/monthly 샘플은 calculateSalary2026 기대값 정확 문자열 검증
//      (크롤러와 사이트가 같은 함수·같은 ko-KR 포맷을 공유 — 드리프트 불가),
//      전 페이지 공통 NaN/undefined원/숫자 없는 결과 휴리스틱
//  (c) 제휴: data-affiliate-offer 존재 ⟺ matchOffers() 활성 오퍼 존재(동일 lib),
//      오퍼 존재 시 고지문 존재, BLOCKED 페이지 오퍼 0건, offers.json 스키마,
//      쿠팡 폴백 유지(오퍼 무매칭 대표 페이지)
//  (d) 금지 문자열: 내부 메모("GA 폭증" 등) 렌더 HTML 누출 0건
//  (e) EN 페이지 title·meta·hreflang 한글 코드포인트 0건
//
// 사용: BASE_URL=http://localhost:3000 tsx scripts/qa-crawl.ts
// 주의: src/middleware.ts 가 빈/의심 UA 를 403 처리 — 브라우저 UA 필수.
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { COMPANY_COUNT, BONUS_CALC_COUNT } from "../src/config/site-metrics.generated";
import { allCompanies } from "../src/data/companies/index";
import { calculateSalary2026 } from "../src/lib/TaxLogic";
import {
  getAllOffers,
  isBlockedPath,
  matchOffers,
  AFFILIATE_DISCLOSURE_TEXT,
} from "../src/lib/affiliateOffers";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 moneysalary-qa-crawl";
const CONCURRENCY = 6;
const RETRIES = 2;
const REPORT_PATH = join(__dirname, "..", "qa-report.md");

const DOMESTIC_COUNT = allCompanies.filter((c) => !c.isGlobal).length;

// (d) 내부 메모·금지 문자열 — 렌더 HTML 에 나오면 실패
const FORBIDDEN_STRINGS = ["GA 폭증", "GA 분석", "폭증 검증", "485개사", "(GA "];

// (a) 스테일 카운트 리터럴 — 렌더 HTML 에 나오면 실패
// 2026-08-30 중복 정본화(434→430)로 "430곳"이 현행 파생값이 됨 — 목록에서 제거,
// 이제 스테일이 된 "434곳"을 추가 (카운트 변동 시 이 목록도 함께 갱신할 것)
const STALE_COUNT_STRINGS = ["480곳", "480+", "485개", "434곳"];

// 대량 동적 트리 — 센티널 + N개 간격 샘플만 크롤
const HEAVY_PREFIXES = [
  "/salary/",
  "/monthly/",
  "/guides/",
  "/glossary/",
  "/qna/",
  "/salary-db/",
  "/calc/",
  "/job/",
  "/industry/",
  "/region/",
  "/hub/",
];
const HEAVY_SAMPLE_STEP = 25;

// 센티널 — 항상 크롤 (엣지 매트릭스)
const SENTINELS = [
  "/salary/30000000",
  "/salary/50000000",
  "/salary/100000000",
  "/monthly/2000000",
  "/monthly/3000000",
  "/monthly/5000000",
  "/salary-db/samsung-electronics",
  "/salary-db/sk-hynix",
  "/salary-db/nvidia",
  "/salary-db/socar",
  "/calc/samsung-bonus",
  "/calc/bonus-calculators",
  "/calc/dsr-quick",
  "/calc/auto-insurance-quick",
  "/home-loan",
  "/car-loan",
  "/credit-card-deduction-2026",
  "/year-end-tax",
  "/tools/finance/irp",
  "/unemployment-benefit",
  "/earned-income-credit",
  "/parental-leave",
  "/basic-pension-2026",
  "/fun/salary-battle",
  "/en",
  "/en/flat-tax",
  "/en/salary-converter",
  "/en/guides",
];

// 쿠팡 폴백이 SSR HTML 에 존재해야 하는 대표 페이지 (오퍼 무매칭일 때)
const COUPANG_SSR_PAGES = [
  "/home-loan",
  "/calc/samsung-bonus",
  "/credit-card-deduction-2026",
  "/salary/50000000",
];

const EN_PAGES = ["/en", "/en/flat-tax", "/en/salary-converter", "/en/guides"];

type Failure = { check: string; page: string; detail: string };
const failures: Failure[] = [];
let crawled = 0;

function fail(check: string, page: string, detail: string) {
  failures.push({ check, page, detail });
}

async function fetchPage(path: string): Promise<string | null> {
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "User-Agent": UA },
        redirect: "follow",
      });
      if (res.ok) return await res.text();
      if (res.status >= 500 && attempt < RETRIES) continue;
      fail("fetch", path, `HTTP ${res.status}`);
      return null;
    } catch (e) {
      if (attempt === RETRIES) {
        fail("fetch", path, `요청 실패: ${(e as Error).message}`);
        return null;
      }
    }
  }
  return null;
}

// ── 페이지 단위 체크 ─────────────────────────────────────────

function checkCounts(path: string, html: string) {
  for (const s of STALE_COUNT_STRINGS) {
    if (html.includes(s)) fail("(a) 카운트", path, `스테일 리터럴 "${s}" 노출`);
  }
  // "N곳" — 회사 수 문맥: 허용값(전체 434 / 국내 426) 외의 3자리 곳 표기 검출
  for (const m of html.matchAll(/회사 (\d{3})곳|전체 회사 (\d{3})곳|(\d{3})곳을 다루는/g)) {
    const n = Number(m[1] ?? m[2] ?? m[3]);
    if (n !== COMPANY_COUNT && n !== DOMESTIC_COUNT) {
      fail("(a) 카운트", path, `회사 수 "${n}곳" ≠ ${COMPANY_COUNT}/${DOMESTIC_COUNT}`);
    }
  }
  // "성과급 계산기 N종" — BONUS_CALC_COUNT 외 검출
  for (const m of html.matchAll(/성과급 계산기[^<]{0,10}?(\d{1,3})종/g)) {
    const n = Number(m[1]);
    if (n !== BONUS_CALC_COUNT) {
      fail("(a) 카운트", path, `성과급 "${n}종" ≠ ${BONUS_CALC_COUNT}종`);
    }
  }
}

function checkEmptyNumbers(path: string, html: string) {
  if (html.includes("NaN")) fail("(b) 빈 수치", path, `"NaN" 노출`);
  if (/undefined\s*원|null\s*원/.test(html)) fail("(b) 빈 수치", path, "undefined/null원 노출");
}

function checkSalaryExactValues(path: string, html: string) {
  const m = path.match(/^\/(salary|monthly)\/(\d+)$/);
  if (!m) return;
  const amount = m[1] === "salary" ? Number(m[2]) : Number(m[2]) * 12;
  const r = calculateSalary2026(amount);
  const fmt = (n: number) => n.toLocaleString("ko-KR");
  const expected: Record<string, string> = {
    "실수령액": fmt(r.netPay),
    "국민연금": fmt(r.nationalPension),
    "건강보험": fmt(r.healthInsurance),
    "고용보험": fmt(r.employmentInsurance),
    "소득세(지방세 포함)": fmt(r.incomeTax + r.localIncomeTax),
  };
  for (const [label, value] of Object.entries(expected)) {
    if (!html.includes(value)) {
      fail("(b) SSR 수치", path, `${label} 기대값 "${value}" 이 서버 HTML 에 없음`);
    }
  }
}

function checkAffiliate(path: string, html: string) {
  const activeMatched = matchOffers(path);
  // 렌더된 오퍼는 (id, vertical) 쌍으로 추출 — 슬롯이 vertical 을 명시 오버라이드하는
  // 경우(예: /salary/* 결과 CTA 의 OfferSlot vertical="loan")가 있어, 경로 추론만으로는
  // 정당성을 판정할 수 없다. 렌더된 vertical 로 matchOffers 를 재현해 대조한다.
  const rendered: Array<{ id: string; vertical: string }> = [];
  for (const m of html.matchAll(
    /data-affiliate-offer="([^"]+)" data-affiliate-vertical="([^"]+)"/g,
  )) {
    rendered.push({ id: m[1], vertical: m[2] });
  }
  const hasOfferAttr = rendered.length > 0 || html.includes("data-affiliate-offer");

  if (isBlockedPath(path)) {
    if (hasOfferAttr) fail("(c) 제휴", path, "BLOCKED 페이지에 오퍼 렌더됨");
    return;
  }
  if (activeMatched.length > 0 && !hasOfferAttr) {
    fail("(c) 제휴", path, `활성 오퍼 ${activeMatched[0].id} 매칭인데 미렌더`);
  }
  // 렌더된 각 오퍼가 (경로, 렌더된 vertical) 기준으로 정당한지 검증
  const allOffers = getAllOffers();
  for (const r of [...new Map(rendered.map((x) => [x.id + x.vertical, x])).values()]) {
    const legit = matchOffers(path, r.vertical as never).some((o) => o.id === r.id);
    if (!legit) {
      fail("(c) 제휴", path, `렌더된 오퍼 ${r.id}(vertical=${r.vertical}) 가 매칭 규칙과 불일치`);
      continue;
    }
    const offer = allOffers.find((o) => o.id === r.id);
    const disclosure = offer?.disclosure ?? AFFILIATE_DISCLOSURE_TEXT;
    if (!html.includes(disclosure)) {
      fail("(c) 제휴", path, `오퍼 ${r.id} 노출인데 고지문("${disclosure.slice(0, 20)}…") 없음`);
    }
  }
  // 오퍼 무매칭 대표 페이지: 쿠팡 폴백이 SSR 에 살아 있어야 함
  if (
    COUPANG_SSR_PAGES.includes(path) &&
    activeMatched.length === 0 &&
    rendered.length === 0
  ) {
    if (!html.includes("ads-partners.coupang.com")) {
      fail("(c) 제휴", path, "쿠팡 폴백 배너가 SSR HTML 에 없음");
    }
  }
}

function checkForbidden(path: string, html: string) {
  for (const s of FORBIDDEN_STRINGS) {
    if (html.includes(s)) fail("(d) 금지 문자열", path, `"${s}" 노출`);
  }
}

function checkEnMeta(path: string, html: string) {
  if (!EN_PAGES.includes(path)) return;
  const metas = [
    ...html.matchAll(/<meta[^>]*(?:twitter|keywords|description|og:)[^>]*>/g),
    ...html.matchAll(/<title>[^<]*<\/title>/g),
    ...html.matchAll(/hreflang="[^"]*"/g),
  ].map((m) => m[0]);
  for (const tag of metas) {
    if (/[가-힣]/.test(tag)) {
      fail("(e) EN 메타", path, `한글 포함: ${tag.slice(0, 90)}`);
      break;
    }
  }
  if (!metas.some((t) => t.includes("twitter:title"))) {
    fail("(e) EN 메타", path, "twitter:title 부재");
  }
  if (path === "/en/flat-tax" && !metas.some((t) => t.includes("og:image"))) {
    fail("(e) EN 메타", path, "og:image 부재");
  }
}

// ── 크롤 대상 수집 ───────────────────────────────────────────

async function collectPaths(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/sitemap.xml`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`sitemap.xml HTTP ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "") || "/",
  );
  const unique = [...new Set(locs)];

  const light: string[] = [];
  const heavyBuckets = new Map<string, string[]>();
  for (const p of unique) {
    const heavy = HEAVY_PREFIXES.find((h) => p.startsWith(h));
    if (heavy) {
      const bucket = heavyBuckets.get(heavy) ?? [];
      bucket.push(p);
      heavyBuckets.set(heavy, bucket);
    } else {
      light.push(p);
    }
  }
  const sampled: string[] = [];
  for (const [, bucket] of heavyBuckets) {
    bucket.sort();
    for (let i = 0; i < bucket.length; i += HEAVY_SAMPLE_STEP) sampled.push(bucket[i]);
  }
  return [...new Set([...light, ...sampled, ...SENTINELS])];
}

async function crawl(paths: string[]) {
  let index = 0;
  async function worker() {
    while (index < paths.length) {
      const path = paths[index++];
      const html = await fetchPage(path);
      if (!html) continue;
      crawled += 1;
      checkCounts(path, html);
      checkEmptyNumbers(path, html);
      checkSalaryExactValues(path, html);
      checkAffiliate(path, html);
      checkForbidden(path, html);
      checkEnMeta(path, html);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
}

// ── 실행 ─────────────────────────────────────────────────────

async function main() {
  // 서버 가용성
  try {
    const probe = await fetch(`${BASE_URL}/`, { headers: { "User-Agent": UA } });
    if (!probe.ok) throw new Error(`HTTP ${probe.status}`);
  } catch (e) {
    console.error(
      `[qa-crawl] ${BASE_URL} 응답 없음 — 먼저 npm run build && npm run start 를 실행하세요. (${(e as Error).message})`,
    );
    process.exit(1);
  }

  // 정적 게이트 인라인 — 코드젠 드리프트·회사 데이터·offers.json 스키마
  try {
    execSync("npx tsx scripts/gen-site-metrics.ts --check", { stdio: "pipe" });
  } catch {
    fail("(a) 카운트", "-", "gen-site-metrics --check 실패 (코드젠 드리프트)");
  }
  try {
    execSync("npx tsx scripts/verify-company-data.ts", { stdio: "pipe" });
  } catch {
    fail("(a) 카운트", "-", "verify-company-data 실패");
  }
  const offers = getAllOffers(); // 로드 시점에 validateOffers 가 이미 throw 검증
  for (const o of offers) {
    if (o.active && !/^https:\/\//.test(o.url)) {
      fail("(c) 제휴", "-", `활성 오퍼 ${o.id} url 비정상`);
    }
  }

  const paths = await collectPaths();
  console.log(`[qa-crawl] 대상 ${paths.length}페이지 (동시성 ${CONCURRENCY})`);
  const started = Date.now();
  await crawl(paths);
  const secs = ((Date.now() - started) / 1000).toFixed(1);

  // 리포트
  const lines: string[] = [
    "# qa-crawl 리포트",
    "",
    `- 대상: ${paths.length}페이지 / 크롤 성공 ${crawled} / 소요 ${secs}s`,
    `- 기준: COMPANY_COUNT=${COMPANY_COUNT}, 국내=${DOMESTIC_COUNT}, BONUS_CALC_COUNT=${BONUS_CALC_COUNT}, 활성 오퍼=${offers.filter((o) => o.active).length}`,
    "",
  ];
  if (failures.length === 0) {
    lines.push("## 결과: ✅ 전 항목 통과");
  } else {
    lines.push(`## 결과: ❌ 실패 ${failures.length}건`, "", "| 체크 | 페이지 | 상세 |", "|---|---|---|");
    for (const f of failures) {
      lines.push(`| ${f.check} | ${f.page} | ${f.detail.replace(/\|/g, "\\|")} |`);
    }
  }
  writeFileSync(REPORT_PATH, lines.join("\n") + "\n");

  if (failures.length > 0) {
    console.error(`[qa-crawl] 실패 ${failures.length}건 — qa-report.md 확인`);
    for (const f of failures.slice(0, 20)) {
      console.error(`  ✗ ${f.check} ${f.page} — ${f.detail}`);
    }
    process.exit(1);
  }
  console.log(`[qa-crawl] ✅ ${crawled}페이지 전 항목 통과 (${secs}s) — qa-report.md 기록`);
}

main().catch((e) => {
  console.error("[qa-crawl] 예외:", e);
  process.exit(1);
});
