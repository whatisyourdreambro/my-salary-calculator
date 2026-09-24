// BreadcrumbList 경로 무결성 (2026-09-25 B14 RT-06 / META-08 / META-09).
//
// buildBreadcrumbTrail 은 경로의 모든 접두사를 단계로 만든다 — 페이지가 없는 접두사
// (/table, /table/2026, /tools/date, /pro …)는 라이브 404 인데 JSON-LD item 으로 방출되고 있었다.
// 이 테스트는 app 디렉터리의 모든 page 라우트에 자동 trail 을 적용했을 때, 방출되는
// 중간(non-leaf) 경로가 전부 실제 page 라우트인지 검사한다. 명시 crumb 배열을 쓰는
// 라우트는 예외 목록으로 두되, 그 페이지가 자동 trail 로 바뀌면 실패하도록 소스도 확인한다.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { autoBreadcrumbLd, buildBreadcrumbTrail, companyOrganizationLd, organizationLd } from "@/lib/structuredData";

const APP_DIR = path.resolve(__dirname, "../../app");
const SITE = "https://www.moneysalary.com";

type RouteEntry = { route: string; dir: string };

/** app 디렉터리의 page 라우트 — route group "(x)" 는 경로에서 빼고, _private·api 는 제외 */
function collectRoutes(dir = APP_DIR, segs: string[] = []): RouteEntry[] {
  const out: RouteEntry[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_") || entry.name === "api") continue;
    const next = entry.name.startsWith("(") ? segs : [...segs, entry.name];
    out.push(...collectRoutes(path.join(dir, entry.name), next));
  }
  if (["page.tsx", "page.ts", "page.jsx", "page.js"].some((f) => fs.existsSync(path.join(dir, f)))) {
    out.push({ route: `/${segs.join("/")}`, dir });
  }
  return out;
}

const ROUTES = collectRoutes();
const STATIC_ROUTES = new Set(ROUTES.map((r) => r.route).filter((r) => !r.includes("[")));
const isDynamic = (seg: string) => seg.startsWith("[");
/** 동적 세그먼트를 표본 값으로 치환 — 표본 값이 든 중간 경로는 해당 동적 라우트와 대조한다 */
const materialize = (route: string) =>
  route
    .split("/")
    .map((seg) => (isDynamic(seg) ? `sample-${seg.replace(/[[\].]/g, "")}` : seg))
    .join("/");
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const DYNAMIC_PATTERNS = ROUTES.map((r) => r.route)
  .filter((r) => r.includes("["))
  .map((r) => {
    const body = r
      .split("/")
      .map((seg) => (isDynamic(seg) ? "sample-[^/]+" : escapeRe(seg)))
      .join("/");
    return new RegExp("^" + body + "$");
  });
const isRealRoute = (p: string) => STATIC_ROUTES.has(p) || DYNAMIC_PATTERNS.some((re) => re.test(p));

/**
 * 자동 trail 대신 명시 crumb 배열을 쓰는 라우트 — 부모 접두사가 페이지가 아니거나 308 이라
 * 직접 지정한다 (/salary·/monthly 중간 단계, compare 308 등). 여기 올린 라우트는 아래에서
 * 자동 trail 호출이 없는지 소스를 확인한다.
 */
const EXPLICIT_CRUMB_ROUTES = new Set([
  "/salary/[amount]",
  "/monthly/[amount]",
  "/salary-db/compare/[slug]",
  "/salary-db/listed/industry/[industryId]",
  "/guides/category/[slug]",
  "/share/[data]",
]);
const AUTO_TRAIL_IN_PAGE = /autoBreadcrumbLd\(|buildBreadcrumbTrail\(|<AutoBreadcrumb\b|<Breadcrumbs\b[^>]*\bpath=/;

const paths = (p: string, opts?: Parameters<typeof buildBreadcrumbTrail>[1]) =>
  buildBreadcrumbTrail(p, opts).map((c) => c.path);
const SLUG_LIKE = /^[a-z0-9][a-z0-9 ]*$/;

describe("BreadcrumbList 중간 경로는 실제 page 라우트만", () => {
  it("app 라우트 목록을 찾는다 (표본 확인)", () => {
    expect(ROUTES.length).toBeGreaterThan(150);
    for (const known of ["/", "/calc", "/tools", "/tools/finance", "/fun", "/table/2026/annual", "/tools/date/age"]) {
      expect(STATIC_ROUTES.has(known), known).toBe(true);
    }
    for (const missing of ["/table", "/table/2026", "/table/2027", "/tools/date", "/tools/health", "/pro"]) {
      expect(STATIC_ROUTES.has(missing), missing).toBe(false);
    }
  });

  it("모든 라우트의 자동 trail 중간 단계가 실제 라우트다 (명시 crumb 라우트 제외)", () => {
    const bad: string[] = [];
    for (const { route } of ROUTES) {
      if (route === "/" || EXPLICIT_CRUMB_ROUTES.has(route)) continue;
      const trail = buildBreadcrumbTrail(materialize(route), { leafName: "현재 페이지" });
      for (const crumb of trail.slice(0, -1)) {
        if (!isRealRoute(crumb.path)) bad.push(`${route} → ${crumb.path}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("명시 crumb 라우트는 자동 trail 을 쓰지 않는다 (쓰면 위 검사 대상으로 옮길 것)", () => {
    for (const route of EXPLICIT_CRUMB_ROUTES) {
      const entry = ROUTES.find((r) => r.route === route);
      expect(entry, route).toBeDefined();
      const src = fs.readFileSync(path.join(entry!.dir, "page.tsx"), "utf8");
      expect(src, route).not.toMatch(AUTO_TRAIL_IN_PAGE);
      // 조상 layout 의 AutoBreadcrumb 도 이 라우트에 trail 을 방출한다
      let dir = entry!.dir;
      while (dir.startsWith(APP_DIR)) {
        const layout = path.join(dir, "layout.tsx");
        if (fs.existsSync(layout)) expect(fs.readFileSync(layout, "utf8"), layout).not.toMatch(/<AutoBreadcrumb\b/);
        if (dir === APP_DIR) break;
        dir = path.dirname(dir);
      }
    }
  });

  it("표 페이지는 /table·/table/2026·/table/2027 을 싣지 않는다", () => {
    for (const year of ["2026", "2027"]) {
      for (const kind of ["annual", "monthly", "weekly", "hourly"]) {
        const leaf = `/table/${year}/${kind}`;
        expect(paths(leaf, { leafName: "표" })).toEqual(["/", leaf]);
      }
    }
    const items = autoBreadcrumbLd("/table/2026/annual", { leafName: "2026 연봉 실수령액 표" }).itemListElement;
    expect(items.map((i) => i.item)).toEqual([`${SITE}/`, `${SITE}/table/2026/annual`]);
    expect(items.map((i) => i.position)).toEqual([1, 2]);
  });

  it("/tools/date·/tools/health 중간 단계를 건너뛰고 /tools 는 남긴다", () => {
    expect(paths("/tools/date/age", { leafName: "만 나이 계산기" })).toEqual(["/", "/tools", "/tools/date/age"]);
    expect(paths("/tools/health/bmi", { leafName: "BMI 계산기" })).toEqual(["/", "/tools", "/tools/health/bmi"]);
    expect(paths("/tools/finance/bonus", { leafName: "성과급 세금 계산기" })).toEqual(["/", "/tools", "/tools/finance", "/tools/finance/bonus"]);
  });

  it("/calc 등 실재 허브 단계는 그대로다", () => {
    expect(buildBreadcrumbTrail("/calc/samsung-bonus", { leafName: "삼성전자 성과급" })).toEqual([
      { name: "홈", path: "/" },
      { name: "계산기 모음", path: "/calc" },
      { name: "삼성전자 성과급", path: "/calc/samsung-bonus" },
    ]);
    expect(paths("/salary-db/samsung-electronics", { leafName: "삼성전자" })).toEqual(["/", "/salary-db", "/salary-db/samsung-electronics"]);
  });

  it("페이지 없는 경로가 마지막 단계면 건너뛰지 않는다", () => {
    expect(paths("/pro")).toEqual(["/", "/pro"]);
  });
});

describe("마지막 단계는 한국어 라벨만 (영문 슬러그 금지)", () => {
  it("/pro/career-planner 는 leafName 없이도 한국어 leaf, /pro 는 생략", () => {
    expect(buildBreadcrumbTrail("/pro/career-planner")).toEqual([
      { name: "홈", path: "/" },
      { name: "커리어 패스 시뮬레이터", path: "/pro/career-planner" },
    ]);
  });

  it("모든 /fun/* 페이지가 한국어 leaf 를 가진다 (AutoBreadcrumb 에 leafName 없음)", () => {
    const funRoutes = ROUTES.map((r) => r.route).filter((r) => r.startsWith("/fun/"));
    expect(funRoutes.length).toBeGreaterThanOrEqual(20);
    for (const route of funRoutes) {
      const trail = buildBreadcrumbTrail(route);
      expect(trail.map((c) => c.path), route).toEqual(["/", "/fun", route]);
      expect(trail[1].name).toBe("재미있는 도구");
      const leaf = trail[2].name;
      expect(leaf, route).toMatch(/[가-힣]/);
      expect(leaf, route).not.toMatch(SLUG_LIKE);
    }
    expect(buildBreadcrumbTrail("/fun/flappy")[2].name).toBe("플래피 샐러리맨");
    expect(buildBreadcrumbTrail("/fun/salary-rank")[2].name).toBe("내 연봉 순위 계산기");
  });

  it("라벨 없는 마지막 단계는 슬러그 대신 생략한다", () => {
    const trail = buildBreadcrumbTrail("/calc/some-new-calculator");
    expect(trail.map((c) => c.path)).toEqual(["/", "/calc"]);
    expect(trail.some((c) => c.name === "some new calculator")).toBe(false);
  });

  it("leafName·overrides 는 종전처럼 우선한다", () => {
    expect(buildBreadcrumbTrail("/fun/flappy", { leafName: "직접 지정" })[2].name).toBe("직접 지정");
    expect(buildBreadcrumbTrail("/job", { overrides: { job: "직업별 연봉" } })).toEqual([
      { name: "홈", path: "/" },
      { name: "직업별 연봉", path: "/job" },
    ]);
    expect(buildBreadcrumbTrail("/glossary").map((c) => c.name)).toEqual(["홈", "용어 사전"]);
  });

  it("화면용 <Breadcrumbs path=…> 호출은 모두 leafName 을 넘긴다 (생략된 leaf 에 aria-current 가 붙지 않도록)", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== "__tests__" && entry.name !== "node_modules") walk(full);
        } else if (/\.tsx$/.test(entry.name)) {
          const src = fs.readFileSync(full, "utf8");
          for (const m of src.matchAll(/<Breadcrumbs\b[\s\S]*?\/>/g)) {
            if (/\bpath=/.test(m[0]) && !/\bleafName=/.test(m[0])) offenders.push(`${path.relative(APP_DIR, full)}: ${m[0].slice(0, 80)}`);
          }
        }
      }
    };
    walk(path.resolve(__dirname, "../.."));
    expect(offenders).toEqual([]);
  });
});

// B14 META-14 — 같은 파일의 JSON-LD 위생 검사 (Organization)
describe("Organization JSON-LD", () => {
  it("회사 Organization 에 schema.org 밖 industry·페이지 요약 description 을 싣지 않는다", () => {
    const ld = companyOrganizationLd({ name: "삼성전자", alternateName: ["삼전"] });
    expect(ld).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "삼성전자",
      alternateName: ["삼전"],
    });
    const src = fs.readFileSync(path.join(APP_DIR, "salary-db/[id]/page.tsx"), "utf8");
    const call = src.slice(src.indexOf("companyOrganizationLd({"), src.indexOf("})", src.indexOf("companyOrganizationLd({")));
    expect(call).not.toMatch(/\bindustry:|\bdescription:/);
  });

  it("사이트 운영 주체 Organization 은 @id 로 식별된다", () => {
    expect(organizationLd()["@id"]).toBe(`${SITE}/#organization`);
  });
});
