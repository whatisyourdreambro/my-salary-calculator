// sitemap 드리프트 가드 (2026-08 대규모 점검 도입) — npm run verify:sitemap
//
// sitemap.ts 의 정적 라우트 목록은 하드코딩 배열이라 파일시스템과 자동 동기화되지
// 않는다. 이 스크립트는 실제 sitemap() 출력과 src/app 파일시스템 라우트를 대조해
// "새 페이지를 만들고 sitemap 등재를 잊는" 드리프트를 잡는다.
// (sitemap.ts 가 @/ alias require 지연 로드를 쓰므로 tsx 로 실행 — vitest CJS
//  require 는 alias 를 못 풀어 여기서만 tsx 를 쓴다.)
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import sitemap from "@/app/sitemap";
import { getStaticSalaryAmounts } from "@/lib/salaryStaticParams";

// sitemap URL 총량 기준선 (2026-08-24 실측 1,810건). ±5% 벗어나면 WARN —
// 대량 등재/누락이 의도된 변경이면 이 값을 함께 갱신할 것.
const BASELINE_URL_COUNT = 1810;
const BASELINE_TOLERANCE = 0.05;

// SSG /salary amount 집합 대비 sitemap 미등재 허용 비율 — 초과 시 WARN.
// (2026-08-24 현재 415개 중 204개 미등재(49.2%)로 알려져 있음: sitemap은 검색
// 가치가 있는 격자만 싣고, SSG 집합은 내부 링크 404 방지용으로 더 넓은 게 설계
// 의도라 아직 실패시키지 않는다. 비율이 더 벌어지면 격자 드리프트 신호.)
const SALARY_MISSING_WARN_RATIO = 0.3;

const APP_DIR = join(process.cwd(), "src", "app");

// 의도적으로 sitemap에서 제외된 정적 라우트 — 사유와 함께 관리
const INTENTIONALLY_EXCLUDED = new Set([
  "/company", // next.config 301 → /salary-db (카니발 해소 2026-06)
  "/company/compare", // noindex (카니발 해소 2026-06)
  "/company/simulator", // 2026-06 점검에서 페이지 유지 판단 — sitemap 등재는 운영 판단 대기
  "/dashboard", // 개인화 페이지 — 검색 유입 가치 없음
  "/report", // 개인화 리포트 — 검색 유입 가치 없음
  "/salary-db/submit", // 익명 제보 폼 — noindex (layout 주석 참조)
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

  // ② SSG /salary amount 집합 ↔ sitemap /salary/* 대조 (2026-08-24 확장)
  const sitemapSalaryAmounts = new Set(
    Array.from(sitePaths)
      .filter((p) => p.startsWith("/salary/"))
      .map((p) => Number(p.split("/")[2]))
      .filter((n) => Number.isFinite(n))
  );
  const ssgAmounts = getStaticSalaryAmounts();
  const missingAmounts = ssgAmounts.filter((a) => !sitemapSalaryAmounts.has(a));
  const missingRatio = ssgAmounts.length ? missingAmounts.length / ssgAmounts.length : 0;
  console.log(
    `[INFO] SSG /salary amount ${ssgAmounts.length}개 중 sitemap 미등재 ${missingAmounts.length}개 ` +
      `(${(missingRatio * 100).toFixed(1)}% / sitemap /salary URL ${sitemapSalaryAmounts.size}건)`
  );
  if (missingRatio > SALARY_MISSING_WARN_RATIO) {
    console.warn(
      `[WARN] SSG /salary amount의 sitemap 미등재 비율 ${(missingRatio * 100).toFixed(1)}%가 ` +
        `임계 ${SALARY_MISSING_WARN_RATIO * 100}%를 초과 — 격자 드리프트 여부 점검 ` +
        `(salaryStaticParams.ts ↔ sitemap.ts /salary 루프). 아직 실패 처리하지 않음.`
    );
  }

  // ③ sitemap URL 총량 기준선 대조 — 대량 증발/폭증 조기 감지
  const drift = Math.abs(sitePaths.size - BASELINE_URL_COUNT) / BASELINE_URL_COUNT;
  if (drift > BASELINE_TOLERANCE) {
    console.warn(
      `[WARN] sitemap URL 총량 ${sitePaths.size}건이 기준선 ${BASELINE_URL_COUNT}건 대비 ` +
        `${(drift * 100).toFixed(1)}% 벗어남 (허용 ±${BASELINE_TOLERANCE * 100}%). ` +
        `의도된 변경이면 BASELINE_URL_COUNT를 갱신하세요.`
    );
  }

  console.log(
    `[verify-sitemap] 정적 라우트 ${routes.length}곳 / sitemap URL ${sitePaths.size}건 / 미등재 ${fail}곳`
  );
  if (fail) {
    console.error(
      "→ sitemap.ts 에 등재하거나, 의도적 제외라면 이 스크립트의 목록에 사유와 함께 추가하세요."
    );
    process.exit(1);
  }
}

main();
