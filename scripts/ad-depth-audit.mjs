// scripts/ad-depth-audit.mjs
//
// 광고 "노출 깊이" 실측 감사 — 로컬 프로덕션 서버를 실브라우저로 열어
// 각 라우트의 첫 광고가 화면 몇 번째에 나오는지 측정한다.
//
// 배경 (2026-09-06 전수검사):
//   scripts/ad-audit.mjs 는 정적(정규식) 감사라 "광고가 있느냐/죽었느냐"만 본다.
//   그런데 실제 매출을 결정하는 건 "광고가 사용자 눈에 닿느냐"다. 실측 결과
//   최대 트래픽 계산기 몇 곳이 광고를 전부 문서 하단에 두고 있었다:
//     /calc/samsung-bonus  모바일 첫 광고 11,212px (13.3화면) · 데스크톱 8,250px
//     /calc                모바일 첫 광고  8,246px (9.8화면)
//     /table/2026/annual   첫 광고 186px 이후 56,525px 까지 광고 0개 (문서 62,036px)
//   AdSense 수익은 노출(viewable impression) 기준이므로, 스크롤이 닿지 않는
//   깊이의 유닛은 사실상 0원이다.
//
// 사용:
//   npm run build && npm run start &
//   node scripts/ad-depth-audit.mjs                    # 기본 라우트 세트
//   ROUTES=/,/calc,/guides node scripts/ad-depth-audit.mjs
//   BASE_URL=http://localhost:3000 THRESHOLD_SCREENS=3 node scripts/ad-depth-audit.mjs
//
// 종료 코드는 항상 0 — 배치 변경은 운영자 승인 사항이라 빌드를 막지 않는다.
// (dedup 로 유닛이 죽는 사고는 ad-audit.mjs 가 ERROR 로 계속 막는다)
//
// 주의: playwright-core 와 크로미움이 있어야 한다. 없으면 안내 후 종료(0).

import { execSync } from "node:child_process";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const THRESHOLD_SCREENS = Number(process.env.THRESHOLD_SCREENS ?? 2.5);
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 msy-ad-depth";

/** 대표 라우트 — 트래픽·수익 기여가 큰 표면 위주 */
const DEFAULT_ROUTES = [
  "/",
  "/calc",
  "/calc/samsung-bonus",
  "/calc/annual-leave-days",
  "/salary/50000000",
  "/monthly/3000000",
  "/table/2026/annual",
  "/table/2026/monthly",
  "/guides",
  "/guides/salary-guide-2026",
  "/salary-db",
  "/salary-db/samsung-electronics",
  "/company",
  "/tools",
  "/tools/finance/severance",
  "/year-end-tax",
  "/job",
  "/industry",
  "/qna",
  "/glossary",
  "/hub",
  "/fun",
  "/fire-calculator",
  "/dashboard",
];

const ROUTES = (process.env.ROUTES ?? "").trim()
  ? process.env.ROUTES.split(",").map((s) => s.trim()).filter(Boolean)
  : DEFAULT_ROUTES;

let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  console.log("[ad-depth] playwright-core 없음 — 건너뜀 (npm i -D playwright-core)");
  process.exit(0);
}

/** 이 환경에 설치된 크로미움 실행 파일 찾기 */
function findChromium() {
  const fromEnv = process.env.CHROMIUM_PATH;
  if (fromEnv) return fromEnv;
  const candidates = [
    "/opt/pw-browsers/chromium-*/chrome-linux/chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
  ];
  for (const c of candidates) {
    try {
      const hit = execSync(`ls -d ${c} 2>/dev/null | head -1`, { encoding: "utf8" }).trim();
      if (hit) return hit;
    } catch {
      /* 다음 후보 */
    }
  }
  return null;
}

const executablePath = findChromium();
if (!executablePath) {
  console.log("[ad-depth] 크로미움 실행 파일을 찾지 못함 — 건너뜀 (CHROMIUM_PATH 로 지정 가능)");
  process.exit(0);
}

const browser = await chromium.launch({
  executablePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

/** 한 라우트를 한 뷰포트에서 측정 */
async function measure(route, viewport, isMobile) {
  const ctx = await browser.newContext({
    viewport,
    isMobile,
    hasTouch: isMobile,
    deviceScaleFactor: isMobile ? 2 : 1,
    userAgent: UA,
  });
  // 외부 광고·분석 스크립트는 차단 — 우리 코드가 만든 지오메트리만 잰다.
  await ctx.route(
    /(googlesyndication|googletagmanager|google-analytics|doubleclick|adservice|kakao|coupang)/,
    (r) => r.abort()
  );
  const page = await ctx.newPage();
  try {
    await page.goto(BASE_URL + route, { waitUntil: "domcontentloaded", timeout: 30000 });
  } catch {
    await ctx.close();
    return null;
  }
  await page.waitForTimeout(1500);
  const data = await page.evaluate(() => {
    const ads = Array.from(document.querySelectorAll(".ad-container"))
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          top: Math.round(r.top + window.scrollY),
          height: Math.round(r.height),
          kind: el.className.replace("ad-container", "").trim(),
        };
      })
      // 높이 0(모바일에서 숨겨지는 사이드바 등)은 노출 대상이 아니다
      .filter((a) => a.height > 0)
      .sort((a, b) => a.top - b.top);
    return { docHeight: document.body.scrollHeight, viewportHeight: window.innerHeight, ads };
  });
  await ctx.close();
  return data;
}

const rows = [];
for (const route of ROUTES) {
  for (const [viewport, isMobile, label] of [
    [{ width: 390, height: 844 }, true, "모바일"],
    [{ width: 1440, height: 900 }, false, "데스크톱"],
  ]) {
    const d = await measure(route, viewport, isMobile);
    if (!d) {
      rows.push({ route, label, error: true });
      continue;
    }
    const first = d.ads[0];
    rows.push({
      route,
      label,
      docHeight: d.docHeight,
      viewportHeight: d.viewportHeight,
      adCount: d.ads.length,
      firstTop: first ? first.top : null,
      screens: first ? first.top / d.viewportHeight : null,
      // 문서를 화면 단위로 나눴을 때 광고가 하나도 없는 최장 구간
      widestGapScreens: (() => {
        const marks = [0, ...d.ads.map((a) => a.top), d.docHeight];
        let gap = 0;
        for (let i = 1; i < marks.length; i++) gap = Math.max(gap, marks[i] - marks[i - 1]);
        return gap / d.viewportHeight;
      })(),
    });
  }
}

console.log("\n=== 광고 노출 깊이 실측 ===\n");
console.log("(첫 광고가 몇 화면 아래에 있는지 — 스크롤이 닿지 않으면 수익 0)\n");

const fmt = (n) => (n === null ? "  없음" : `${String(Math.round(n)).padStart(6)}px`);
let flagged = 0;
for (const r of rows) {
  if (r.error) {
    console.log(`  [로드실패] ${r.route} (${r.label})`);
    continue;
  }
  if (r.adCount === 0) {
    flagged++;
    console.log(`  ⚠ 광고 0개      ${r.route} (${r.label}, 문서 ${r.docHeight}px)`);
    continue;
  }
  const deep = r.screens > THRESHOLD_SCREENS;
  const gappy = r.widestGapScreens > 6;
  if (deep || gappy) flagged++;
  const mark = deep ? "⚠" : gappy ? "·" : " ";
  console.log(
    `  ${mark} 첫 광고 ${fmt(r.firstTop)} (${r.screens.toFixed(1)}화면)  광고 ${String(r.adCount).padStart(2)}개  ` +
      `최대 공백 ${r.widestGapScreens.toFixed(1)}화면  문서 ${String(r.docHeight).padStart(6)}px  ${r.route} (${r.label})`
  );
}

console.log(
  `\n임계값: 첫 광고 ${THRESHOLD_SCREENS}화면 초과(⚠) / 광고 없는 최장 구간 6화면 초과(·)`
);
console.log(`플래그 ${flagged}건 — 배치 변경은 운영자 승인 큐 항목이므로 exit 0.\n`);

await browser.close();
