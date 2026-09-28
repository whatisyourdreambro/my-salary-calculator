// /salary 내부 링크 ⊂ 사이트맵 격자 — S3-2 2단계 회귀 가드 (2026-09-28)
// 스코핑: docs/salary-grid-canonicalization-scoping-2026-09-12.md
//
// /salary/[amount] 는 416쪽을 정적 생성하지만 사이트맵에는 격자 211쪽만 있다. 격자 밖 205쪽은 레거시 URL 로
// 계속 생성하되(404 금지), 내부 링크는 격자 금액만 가리켜야 한다. 이 파일은
//   (a) 격자 단일 소스 — SITEMAP_SALARY_GRID(규칙 격자 ∪ 추가 등재) = 실제 sitemap() 의 /salary/* ⊂ 정적 생성 집합,
//       추가 등재(SITEMAP_EXTRA_SALARY_AMOUNTS)는 이미 생성되는 레거시 금액만(새 URL 금지),
//   (b) snapToSitemapSalary 계약 — 격자 위는 그대로, 5백만~2억은 최근접, 그 밖은 null(클램프 금지),
//   (c) 실제 렌더한 페이지의 /salary/{n} href 전부 ⊂ 격자 — 표 8쪽·/monthly 105쪽·직업·업종·지역·회사 430곳,
//       그리고 링크 자리 수 불변(광고 위 높이 불변: 링크가 사라지거나 '—' 로 바뀌지 않는다),
//   (d) 원시 `/salary/${…}` 템플릿 소스 스캔 — 허용 목록 밖 신규 생성 지점 금지
// 를 고정한다. 렌더는 companySalaryNetHop·currentRatesDryRun2027 과 같은 방식(react-dom/server, 광고 stub).
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { stub } = vi.hoisted(() => ({ stub: () => null }));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: stub,
  CalcResultAd: stub,
  GuideMidAd: stub,
  SidebarAd: stub,
  InArticleAd: stub,
  MultiplexAd: stub,
  Display2Ad: stub,
  ResultAd: stub,
  CompanyTopAd: stub,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: stub }));
vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));
vi.mock("next/dynamic", () => ({ default: () => stub }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push() {}, replace() {}, prefetch() {} }),
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error("notFound");
  },
  permanentRedirect: (to: string) => {
    throw new Error(`permanentRedirect ${to}`);
  },
}));

import {
  SITEMAP_EXTRA_SALARY_AMOUNTS,
  SITEMAP_SALARY_GRID,
  SITEMAP_SALARY_MAX,
  SITEMAP_SALARY_MIN,
  SITEMAP_SALARY_REGULAR_GRID,
  isSitemapSalaryAmount,
  sitemapSalaryHref,
  snapToSitemapSalary,
} from "@/lib/salarySitemapGrid";
import { MAX_SALARY, MIN_SALARY, getSalaryNeighborAmounts, getStaticSalaryAmounts, sitemapGridAmounts } from "@/lib/salaryStaticParams";
import { salaryReportHrefOrNearest } from "@/lib/salaryRedirect";
import { getStaticMonthlyAmounts } from "@/lib/monthlyStaticParams";
import { POPULAR_SALARY_LINKS } from "@/lib/homeContent";
import { jobsData } from "@/data/jobsData";
import { industriesData } from "@/data/industriesData";
import { regionsData } from "@/data/regionsData";
import { allCompanies } from "@/data/companies";
import CompanyNarrative from "@/components/CompanyNarrative";
import CompanyBonusCalculatorLink from "@/components/CompanyBonusCalculatorLink";
import CompanySalaryTable from "@/components/CompanySalaryTable";
import MonthlyPage from "@/app/monthly/[amount]/page";
import JobPage from "@/app/job/[slug]/page";
import IndustryPage from "@/app/industry/[slug]/page";
import RegionDetailPage from "@/app/region/[slug]/page";
import Table2026Annual from "@/app/table/2026/annual/page";
import Table2026Monthly from "@/app/table/2026/monthly/page";
import Table2026Weekly from "@/app/table/2026/weekly/page";
import Table2026Hourly from "@/app/table/2026/hourly/page";
import Table2027Annual from "@/app/table/2027/annual/page";
import Table2027Monthly from "@/app/table/2027/monthly/page";
import Table2027Weekly from "@/app/table/2027/weekly/page";
import Table2027Hourly from "@/app/table/2027/hourly/page";

const GRID = new Set(SITEMAP_SALARY_GRID);
const SALARY_HREF_RE = /href="\/salary\/(\d+)"/g;

const render = (page: unknown, props: object) =>
  renderToStaticMarkup(createElement(page as (p: object) => ReactNode, props));
const salaryHrefs = (html: string) => [...html.matchAll(SALARY_HREF_RE)].map((m) => Number(m[1]));
const offGrid = (hrefs: number[]) => hrefs.filter((n) => !GRID.has(n));

describe("(a) 격자 단일 소스", () => {
  it("SITEMAP_SALARY_GRID = 실제 sitemap() 의 /salary/* 금액 (규칙 격자 211 ∪ 추가 등재)", { timeout: 60_000 }, () => {
    // sitemap.ts 는 @/ alias require 지연 로드를 써서 vitest 에서 직접 부를 수 없다(verify-sitemap.ts 머리말) → tsx 로 실행
    const code = [
      'import sitemap from "./src/app/sitemap";',
      "const out = sitemap().map((e) => e.url.match(/^https:\\/\\/www\\.moneysalary\\.com\\/salary\\/(\\d+)$/)?.[1]).filter(Boolean).map(Number);",
      "process.stdout.write(JSON.stringify(out));",
    ].join("\n");
    const run = spawnSync(process.execPath, [join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs"), "-e", code], {
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
    expect(run.status, run.stderr).toBe(0);
    const fromSitemap = JSON.parse(run.stdout) as number[];
    expect(new Set(fromSitemap).size, "사이트맵 /salary 중복").toBe(fromSitemap.length);
    expect([...fromSitemap].sort((a, b) => a - b)).toEqual([...SITEMAP_SALARY_GRID]);
    expect(SITEMAP_SALARY_REGULAR_GRID.length).toBe(211);
    expect(SITEMAP_SALARY_REGULAR_GRID[0]).toBe(SITEMAP_SALARY_MIN);
    expect(SITEMAP_SALARY_REGULAR_GRID[SITEMAP_SALARY_REGULAR_GRID.length - 1]).toBe(SITEMAP_SALARY_MAX);
    expect([...SITEMAP_SALARY_GRID]).toEqual([...new Set([...SITEMAP_SALARY_REGULAR_GRID, ...SITEMAP_EXTRA_SALARY_AMOUNTS])].sort((a, b) => a - b));
  });

  it("추가 등재는 규칙 격자 밖·오름차순 정수이고, 이미 정적 생성되는 레거시 금액만 (새 URL 0)", () => {
    const regular = new Set(SITEMAP_SALARY_REGULAR_GRID);
    // sitemapGridAmounts() 는 규칙 격자만 — 그래서 아래 '정적 생성 집합 안' 은 추가 등재가 새 페이지를 만들지 않는다는 뜻이다
    const statics = new Set(getStaticSalaryAmounts());
    SITEMAP_EXTRA_SALARY_AMOUNTS.forEach((a, i) => {
      expect(Number.isInteger(a), String(a)).toBe(true);
      expect(a >= MIN_SALARY && a <= MAX_SALARY, String(a)).toBe(true);
      expect(regular.has(a), `${a} 는 이미 규칙 격자`).toBe(false);
      expect(statics.has(a), `${a} 는 정적 생성되지 않는 금액 — 새 URL 금지`).toBe(true);
      if (i > 0) expect(a).toBeGreaterThan(SITEMAP_EXTRA_SALARY_AMOUNTS[i - 1]);
    });
  });

  it("오름차순·중복 없음, sitemapGridAmounts() = 규칙 격자, 전부 정적 생성 집합 안 (레거시 205쪽도 계속 생성)", () => {
    for (let i = 1; i < SITEMAP_SALARY_GRID.length; i++) expect(SITEMAP_SALARY_GRID[i]).toBeGreaterThan(SITEMAP_SALARY_GRID[i - 1]);
    expect([...new Set(sitemapGridAmounts())].sort((a, b) => a - b)).toEqual([...SITEMAP_SALARY_REGULAR_GRID]);
    const statics = new Set(getStaticSalaryAmounts());
    for (const a of SITEMAP_SALARY_GRID) expect(statics.has(a), `/salary/${a} 정적 생성 안 됨`).toBe(true);
    // 링크를 격자로 옮겨도 generateStaticParams 는 줄이지 않는다 — 격자 밖 레거시 URL 이 남아 있어야 한다
    expect(getStaticSalaryAmounts().length).toBeGreaterThan(SITEMAP_SALARY_REGULAR_GRID.length + 150);
  });
});

describe("(b) snapToSitemapSalary", () => {
  it("격자 위 금액은 그대로, isSitemapSalaryAmount 와 일치", () => {
    for (const a of SITEMAP_SALARY_GRID) {
      expect(snapToSitemapSalary(a)).toBe(a);
      expect(isSitemapSalaryAmount(a)).toBe(true);
      expect(sitemapSalaryHref(a)).toBe(`/salary/${a}`);
    }
    expect(isSitemapSalaryAmount(101_000_001)).toBe(false);
  });

  // 아래 두 테스트는 규칙 격자로 고정 — 추가 등재(운영자 목록)가 바뀌어도 계약 검증은 그대로
  const snapRegular = (a: number) => snapToSitemapSalary(a, SITEMAP_SALARY_REGULAR_GRID);

  it("5백만~2억 사이 격자 밖 금액은 최근접 격자 금액 (동률은 큰 쪽)", () => {
    expect(snapRegular(101_000_000)).toBe(100_000_000);
    expect(snapRegular(102_000_000)).toBe(100_000_000);
    expect(snapRegular(103_000_000)).toBe(105_000_000);
    expect(snapRegular(117_000_000)).toBe(115_000_000);
    expect(snapRegular(26_835_600)).toBe(27_000_000); // 2027 최저시급 × 2,508 (2026-09-06 사건 금액)
    expect(snapRegular(25_882_560)).toBe(26_000_000); // 2026 최저시급 × 2,508
    expect(snapRegular(10_400_000)).toBe(10_500_000);
    expect(snapRegular(198_000_000)).toBe(200_000_000);
    expect(snapRegular(102_500_000)).toBe(105_000_000); // 동률 → 큰 쪽
    expect(snapRegular(50_250_000)).toBe(50_500_000); // 동률 → 큰 쪽
    expect(snapRegular(42_800_000.4)).toBe(43_000_000); // 반올림 후 스냅
    expect(sitemapSalaryHref(100_000_000)).toBe("/salary/100000000");
    const a = snapToSitemapSalary(101_000_000);
    expect(sitemapSalaryHref(101_000_000)).toBe(`/salary/${a}`);
  });

  it("범위 밖·비정상 값은 null — 2억 초과를 2억 페이지로 클램프하지 않는다", () => {
    for (const a of [200_000_001, 207_000_000, 218_500_000, 220_000_000, 250_000_000, 300_000_000, 350_000_000, 1_000_000_000]) {
      expect(snapRegular(a), String(a)).toBeNull();
      // 기본(사이트맵) 격자: 추가 등재된 금액이면 그 금액 그대로, 아니면 null
      expect(sitemapSalaryHref(a), String(a)).toBe(isSitemapSalaryAmount(a) ? `/salary/${a}` : null);
    }
    for (const a of [4_999_999, 1_000_000, 0, -50_000_000, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(snapRegular(a), String(a)).toBeNull();
    }
  });

  it("범위 안 최대 상대 오차 ≤ 2.5% (1억~1억 500만 구간 최대 약 2.44%)", () => {
    let worst = 0;
    for (let a = 10_000_000; a <= SITEMAP_SALARY_MAX; a += 10_000) {
      const s = snapToSitemapSalary(a)!;
      expect(GRID.has(s)).toBe(true);
      worst = Math.max(worst, Math.abs(s - a) / a);
    }
    expect(worst).toBeLessThanOrEqual(0.025);
  });

  it("grid 인자: 격자 위(범위 밖 포함) 금액은 정확히 일치할 때만, 범위 안은 최근접", () => {
    const grid = [5_000_000, 100_000_000, 101_000_000, 105_000_000, 200_000_000, 350_000_000];
    expect(snapToSitemapSalary(350_000_000, grid)).toBe(350_000_000);
    expect(snapToSitemapSalary(300_000_000, grid)).toBeNull(); // 2억 초과는 근사하지 않는다
    expect(snapToSitemapSalary(101_200_000, grid)).toBe(101_000_000);
    expect(snapToSitemapSalary(150_000_000, grid)).toBe(105_000_000);
    expect(snapToSitemapSalary(1_000_000, [])).toBeNull();
  });
});

describe("(c) 렌더한 페이지의 /salary href ⊂ 사이트맵 격자", () => {
  it("표 8쪽 (2026·2027 × 연봉·월급·주급·시급) — 모든 행이 여전히 링크, 대상은 격자·오차 ≤2.5%", () => {
    const pages = {
      "/table/2026/annual": Table2026Annual,
      "/table/2026/monthly": Table2026Monthly,
      "/table/2026/weekly": Table2026Weekly,
      "/table/2026/hourly": Table2026Hourly,
      "/table/2027/annual": Table2027Annual,
      "/table/2027/monthly": Table2027Monthly,
      "/table/2027/weekly": Table2027Weekly,
      "/table/2027/hourly": Table2027Hourly,
    };
    let total = 0;
    for (const [path, page] of Object.entries(pages)) {
      const hrefs = salaryHrefs(render(page, {}));
      expect(hrefs.length, `${path}: 표 행 링크 없음`).toBeGreaterThan(50);
      expect(offGrid(hrefs), `${path}: 격자 밖 href`).toEqual([]);
      total += hrefs.length;
    }
    expect(total).toBeGreaterThan(900);
  });

  it("/monthly 105쪽 — 링크는 격자·'/' 뿐이고, 링크/'—' 자리 배치는 종전(S2-2)과 같다", () => {
    const amounts = getStaticMonthlyAmounts();
    expect(amounts.length).toBeGreaterThanOrEqual(100);
    let home = 0;
    let expectedHome = 0;
    for (const monthly of amounts) {
      const html = render(MonthlyPage, { params: { amount: String(monthly) } });
      expect(offGrid(salaryHrefs(html)), `/monthly/${monthly}`).toEqual([]);
      // 상여 환산표: '실수령 보기' 링크 수 = 종전 규칙(정적 집합 범위 안)으로 링크였던 행 수
      const annual = monthly * 12;
      const scenarios = [0, 100, 200, 400, 600, 800].map((pct) => Math.round(annual + (monthly * pct) / 100));
      const wasLinked = scenarios.filter((a) => salaryReportHrefOrNearest(a) !== null).length;
      const table = html.slice(html.indexOf("상여금 포함 연봉 환산표"), html.indexOf("시급·주급으로 환산하면?"));
      expect(table.match(/실수령 보기/g)?.length ?? 0, `/monthly/${monthly} 상여 환산표 링크 수`).toBe(wasLinked);
      expect(table.match(/>—</g)?.length ?? 0, `/monthly/${monthly} '—' 수`).toBe(scenarios.length - wasLinked);
      home += table.match(/href="\/"/g)?.length ?? 0;
      // 연봉 축 크로스링크 버튼은 항상 있다 (문구 그대로)
      const cross = html.slice(html.indexOf("연봉 기준으로도 확인해 보세요"));
      const button = cross.match(/<a href="([^"]+)"[^>]*>연봉 ([\d,]+)만원 리포트 보기/);
      expect(button, `/monthly/${monthly} 연봉 리포트 버튼`).not.toBeNull();
      expect(button![2]).toBe(Math.round(annual / 10_000).toLocaleString("ko-KR"));
      expect(button![1]).toBe(sitemapSalaryHref(annual) ?? "/");
      expectedHome += scenarios.filter((a) => salaryReportHrefOrNearest(a) !== null && sitemapSalaryHref(a) === null).length;
    }
    expect(home, "2억 초과 행의 홈 계산기 폴백 수").toBe(expectedHome);
  });

  it("직업 전수 — 헤더·경력별·바로 계산 7곳 모두 격자 링크이거나 홈 계산기", () => {
    for (const job of jobsData) {
      const html = render(JobPage, { params: { slug: job.id } });
      const hrefs = salaryHrefs(html);
      expect(offGrid(hrefs), `/job/${job.id}`).toEqual([]);
      const amounts = [job.salary.overall, job.salary.entry.avg, job.salary.junior.avg, job.salary.senior.avg, job.salary.entry.avg, job.salary.junior.avg, job.salary.senior.avg];
      const expected = amounts.map((m) => snapToSitemapSalary(m * 10_000)).filter((x): x is number => x !== null);
      expect([...hrefs].sort((a, b) => a - b), `/job/${job.id} 링크 자리`).toEqual(expected.sort((a, b) => a - b));
    }
  });

  it("업종 전수 — 헤더·경력별 4곳 모두 격자 링크이거나 홈 계산기", () => {
    for (const ind of industriesData) {
      const html = render(IndustryPage, { params: { slug: ind.id } });
      const hrefs = salaryHrefs(html);
      expect(offGrid(hrefs), `/industry/${ind.id}`).toEqual([]);
      const amounts = [ind.salary.overall, ind.salary.entry.avg, ind.salary.junior.avg, ind.salary.senior.avg];
      const expected = amounts.map((m) => snapToSitemapSalary(m * 10_000)).filter((x): x is number => x !== null);
      expect([...hrefs].sort((a, b) => a - b), `/industry/${ind.id} 링크 자리`).toEqual(expected.sort((a, b) => a - b));
    }
  });

  it("지역 전수 — 데이터가 전부 격자 위라 원값 링크 그대로 격자 (데이터가 바뀌면 여기서 걸린다)", () => {
    for (const r of regionsData) {
      const html = render(RegionDetailPage, { params: { slug: r.id } });
      const hrefs = salaryHrefs(html);
      expect(hrefs.length, `/region/${r.id}`).toBeGreaterThan(0);
      expect(offGrid(hrefs), `/region/${r.id} — sitemapSalaryHref 로 옮길 것`).toEqual([]);
    }
  });

  it("회사 430곳 — 본문 3곳·폴백 CTA·연봉 표 링크 전부 격자, 본문·CTA 링크 자리 불변(격자 없으면 홈 계산기)", () => {
    expect(allCompanies.length).toBeGreaterThanOrEqual(400);
    let home = 0;
    for (const c of allCompanies) {
      const entry = c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0);
      const snapped = snapToSitemapSalary(entry);
      const narrative = render(CompanyNarrative, { company: c });
      expect(offGrid(salaryHrefs(narrative)), `${c.id} 본문`).toEqual([]);
      // 링크 문구(금액)는 그대로 — 목적지만 격자(오차 2% 미만) 또는 홈 계산기
      const narrativeLinks = [...narrative.matchAll(/<a href="([^"]+)"[^>]*>([^<]*)만원 실수령액/g)];
      expect(narrativeLinks.length, `${c.id} 본문 실수령액 링크 수`).toBe(3);
      for (const [, href, text] of narrativeLinks) {
        expect(href).toBe(snapped === null ? "/" : `/salary/${snapped}`);
        expect(text.replace(/^연봉 /, "")).toBe(Math.round(entry / 10_000).toLocaleString("ko-KR"));
      }
      if (snapped === null) home++;
      else expect(Math.abs(snapped - entry) / entry, `${c.id} 신입 스냅 오차`).toBeLessThan(0.02);
      const cta = render(CompanyBonusCalculatorLink, { companyId: c.id, entryTotalWon: entry });
      expect(offGrid(salaryHrefs(cta)), `${c.id} CTA`).toEqual([]);
      expect(offGrid(salaryHrefs(render(CompanySalaryTable, { company: c }))), `${c.id} 연봉 표`).toEqual([]);
    }
    expect(home, "신입부터 2억 초과 회사의 홈 계산기 폴백 수").toBe(
      allCompanies.filter((c) => snapToSitemapSalary(c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0)) === null).length,
    );
  });

  it("홈 인기 구간·/salary 이웃 링크 — 격자 위", () => {
    expect(offGrid(POPULAR_SALARY_LINKS.map((l) => l.amount))).toEqual([]);
    for (const a of getStaticSalaryAmounts()) expect(offGrid(getSalaryNeighborAmounts(a)), `/salary/${a} 이웃`).toEqual([]);
  });
});

describe("(d) 원시 `/salary/${…}` 템플릿 — 허용 목록 밖 신규 금지", () => {
  // 새 링크 지점은 sitemapSalaryHref 를 쓸 것. 여기 있는 파일만 템플릿을 직접 쓴다 (사유 필수).
  const ALLOWED: Record<string, string> = {
    "src/lib/salarySitemapGrid.ts": "정본 — sitemapSalaryHref",
    "src/lib/salaryRedirect.ts": "308 정규화(정적 416) + salaryReportHref 계열(amounts 인자 — 회사 표는 격자를 넘긴다, (c) 검증)",
    "src/app/sitemap.ts": "사이트맵 자체 (격자 = (a) 에서 대조)",
    "src/lib/seo.ts": "페이지 자기 canonical 경로",
    "src/app/salary/[amount]/page.tsx": "자기 경로(breadcrumb·JSON-LD) + 이웃 getSalaryNeighborAmounts(격자, (c) 검증)",
    "src/app/salary-db/listed/[stockCode]/page.tsx": "toSalaryGridAmount — 격자 단위(50만·500만) 반올림 + [500만, 2억] 안",
    "src/app/region/[slug]/page.tsx": "지역 데이터 전부 격자 위 ((c) 렌더 검증)",
    "src/components/home/HomeSeoSection.tsx": "POPULAR_SALARY_LINKS 리터럴 ((c) 검증)",
    "src/lib/guides/supplements.ts":
      "/guides/nurse-salary 최저임금 연 환산(25,882,560) — verify:autoads 기준 페이지라 무접촉(guideSpec (4) 해시 고정). 알려진 격자 밖 링크 1건",
  };
  const ROOT = resolve(process.cwd());
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) return name === "__tests__" || name === "node_modules" ? [] : walk(p);
      return /\.(ts|tsx)$/.test(name) ? [p] : [];
    });
  const files = walk(join(ROOT, "src")).map((p) => relative(ROOT, p).split("\\").join("/"));
  // `/salary/${x}` 와 `${base}/salary/${x}` 둘 다 잡는다
  const hits = files.filter((f) => /\/salary\/\$\{/.test(readFileSync(join(ROOT, f), "utf8")));

  it("템플릿을 쓰는 파일은 허용 목록 안에만 있다", () => {
    expect(hits.filter((f) => !(f in ALLOWED)), "새 /salary 링크 지점은 sitemapSalaryHref 사용").toEqual([]);
  });

  it("허용 목록에 죽은 항목이 없다 (이관 끝난 파일은 목록에서 뺀다)", () => {
    expect(Object.keys(ALLOWED).filter((f) => !hits.includes(f))).toEqual([]);
  });

  it("표·월급·직업·업종·회사는 정본 헬퍼를 쓴다", () => {
    const read = (f: string) => readFileSync(join(ROOT, f), "utf8");
    for (const f of [
      "src/components/SalaryTable.tsx",
      "src/app/monthly/[amount]/page.tsx",
      "src/app/job/[slug]/page.tsx",
      "src/app/industry/[slug]/page.tsx",
      "src/components/CompanyNarrative.tsx",
      "src/components/CompanyBonusCalculatorLink.tsx",
    ]) {
      expect(read(f), f).toMatch(/import \{ sitemapSalaryHref \} from "@\/lib\/salarySitemapGrid";/);
    }
    expect(read("src/components/CompanySalaryTable.tsx")).toContain("salaryReportHref(total, SITEMAP_SALARY_GRID)");
    // SalaryTable 은 클라이언트 컴포넌트 — 데이터 모듈(salaryStaticParams)을 끌어오지 않는다
    expect(read("src/components/SalaryTable.tsx")).not.toContain("salaryStaticParams");
    expect(read("src/lib/salarySitemapGrid.ts")).not.toMatch(/^import /m);
  });
});
