// sitemap 드리프트 가드 (2026-08 대규모 점검 도입) — npm run verify:sitemap
//
// sitemap.ts 의 정적 라우트 목록은 하드코딩 배열이라 파일시스템과 자동 동기화되지
// 않는다. 이 스크립트는 실제 sitemap() 출력과 src/app 파일시스템 라우트를 대조해
// "새 페이지를 만들고 sitemap 등재를 잊는" 드리프트를 잡는다.
// (sitemap.ts 가 @/ alias require 지연 로드를 쓰므로 tsx 로 실행 — vitest CJS
//  require 는 alias 를 못 풀어 여기서만 tsx 를 쓴다.)
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import sitemap, { ROUTE_OVERRIDES } from "@/app/sitemap";

const APP_DIR = join(process.cwd(), "src", "app");

// 라우트 → src/app 하위 디렉터리 세그먼트 (fsStaticRoutes 의 역방향 — 같은 규칙:
// URL 세그먼트 = 디렉터리명. 정적 라우트만 대상이라 동적 세그먼트는 나오지 않는다).
function routeToAppSegments(route: string): string[] {
  return route.split("/").filter(Boolean);
}

// git 호출 — 미설치·저장소 아님·실패는 null (게이트가 조용히 건너뛰도록).
function git(args: string[]): string | null {
  try {
    return execFileSync("git", args, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

// ROUTE_OVERRIDES lastModified 신선도 게이트 (2026-09-05, 수익 10배 계획 L18 위생) —
// sitemap.ts 의 고정 override 가 해당 라우트의 실제 갱신보다 오래됐으면 WARN.
// 기준 시각의 정의: `git log -1 --format=%cI -- src/app<route>` (해당 라우트 디렉터리를
// 마지막으로 건드린 커밋의 커미터 시각, ISO 8601 + 오프셋).
// 비교는 일 단위 — override 는 날짜만 갖는 값(UTC 자정)이므로 커밋의 현지 달력일
// (%cI 앞 10자)이 override 날짜보다 뒤일 때만 경고한다(같은 날 배포는 정합).
// override 가 없는 라우트(STATIC_LAST_MODIFIED 폴백)는 대상이 아니다.
// 비차단(WARN) — exit 코드는 기존 미등재 [FAIL] 규칙만 따른다.
// 주의: 이 게이트는 라우트 디렉터리를 건드린 "모든" 커밋에 반응하므로 광고 배치·공유 수리·메타 정비 같은
// 횡단 편집 커밋 뒤에는 WARN 이 대량으로 나온다(도입일 24/28건). 그래서 각 WARN 에 마지막 커밋의
// 해시·제목을 같이 찍는다 — 제목이 feat(ads)/fix(share)/chore 류면 콘텐츠 갱신이 아니므로 무시하고,
// 실제 본문·수치 갱신 커밋인데 override 가 오래됐을 때만 sitemap.ts 를 고친다.
function checkOverrideFreshness(): number {
  const shallow = git(["rev-parse", "--is-shallow-repository"]);
  if (shallow === null) return 0; // git 없음 / 저장소 아님 — 조용히 건너뜀
  if (shallow === "true") {
    // shallow clone(actions/checkout 기본 fetch-depth=1)에서는 경계(grafted) 커밋이 모든 경로를
    // "도입"한 것으로 잡혀 `git log -1 -- path` 가 전 경로에 HEAD 를 돌려준다 → 전량 오탐. 건너뛴다.
    console.log(
      "[verify-sitemap] override 신선도 게이트 건너뜀 — shallow clone 이라 경로별 마지막 커밋 판정 불가"
    );
    return 0;
  }
  let warned = 0;
  for (const [route, override] of Object.entries(ROUTE_OVERRIDES)) {
    if (!override.lastModified) continue;
    const segments = routeToAppSegments(route);
    if (!existsSync(join(APP_DIR, ...segments))) continue;
    const lastCommit = git([
      "log",
      "-1",
      "--format=%cI%x09%h%x09%s",
      "--",
      ["src", "app", ...segments].join("/"),
    ]);
    if (!lastCommit) continue;
    const [commitIso = "", hash = "", subject = ""] = lastCommit.split("\t");
    const overrideDay = override.lastModified.toISOString().slice(0, 10);
    const commitDay = commitIso.slice(0, 10);
    if (commitDay > overrideDay) {
      console.warn(
        `[WARN] override 가 실제 갱신보다 오래됨: ${route} override=${overrideDay} last-commit=${commitDay} ${hash} "${subject}"`
      );
      warned++;
    }
  }
  if (warned >= 5) {
    console.warn(
      `[verify-sitemap] 신선도 경고 ${warned}건 — 횡단 편집(광고·공유·메타) 커밋 포화 가능성. 제목이 콘텐츠 갱신인 것만 override 갱신 대상.`
    );
  }
  return warned;
}

// 의도적으로 sitemap에서 제외된 정적 라우트 — 사유와 함께 관리
const INTENTIONALLY_EXCLUDED = new Set([
  "/company", // next.config 301 → /salary-db (카니발 해소 2026-06)
  "/company/compare", // noindex (카니발 해소 2026-06)
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

  const staleOverrides = checkOverrideFreshness();

  console.log(
    `[verify-sitemap] 정적 라우트 ${routes.length}곳 / sitemap URL ${sitePaths.size}건 / 미등재 ${fail}곳 / override 신선도 경고 ${staleOverrides}건`
  );
  if (fail) {
    console.error(
      "→ sitemap.ts 에 등재하거나, 의도적 제외라면 이 스크립트의 목록에 사유와 함께 추가하세요."
    );
    process.exit(1);
  }
}

main();
