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
