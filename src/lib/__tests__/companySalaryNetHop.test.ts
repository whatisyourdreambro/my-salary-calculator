// 회사 상세 표 '연 실수령' 셀 → /salary/[amount] hop 회귀 가드 (2026-09-12 S2-2)
//
// /salary/[amount] 는 dynamicParams=false 라 집합 밖 href 는 하드 404 이고, 집합 끝으로 클램프하면
// 틀린 목적지다(임원 총보상 3.5억 초과 행 58건). 430쪽 × 5행 전수로
//   (a) href ⊂ 실제 generateStaticParams 집합(getStaticSalaryAmounts),
//   (b) 쪽당 1~5건 — 신입 총보상은 companyEntryAmounts 로 집합에 등재되므로 항상 링크(회귀 가드),
//   (c) 클램프 누출 0,
//   (d)(e) 소스 스캔 — 높이 0 인라인 링크·AppLink·모듈 속성·로컬 스냅 복제 2벌 제거
//   (f) title — 스냅된 링크(≤2%, 1,890건 중 112건)는 행 총액이 아니라 href 금액을 '구간'으로 말한다 (2026-09-12 리뷰)
// 를 고정한다. S3-2 2단계(2026-09-28 준비)부터 기준 집합은 사이트맵 격자(SITEMAP_SALARY_GRID ⊂ 정적 생성 집합)라
// (a)(b)(c) 는 격자 기준 — 격자 최대(2억)를 넘는 행은 평문, 신입부터 2억을 넘는 회사(구글·메타·넷플릭스)는 링크 0건. 소스 스캔은 internalLinkModules.test.ts 와 같은 방식(jsdom 없음); (f) 는 react-dom/server 로 렌더한다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { allCompanies } from "@/data/companies";
import { getStaticSalaryAmounts } from "@/lib/salaryStaticParams";
import { SALARY_STATIC_AMOUNTS } from "@/lib/salaryStaticAmounts.generated";
import { SALARY_HREF_MAX_GAP, salaryReportHref } from "@/lib/salaryRedirect";
import { SITEMAP_SALARY_GRID } from "@/lib/salarySitemapGrid";
import type { CompanyProfile, JobLevel } from "@/types/company";

// (f) 렌더용 — next/link 대신 평범한 <a> (속성 순서: href, class, title)
vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));
import CompanySalaryTable from "@/components/CompanySalaryTable";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const RANKS: JobLevel[] = ["entry", "junior", "senior", "lead", "executive"];
/** CompanySalaryTable 의 행 총액 식과 동일 (기본급 + 인센티브 평균, 주식·사인온 제외) */
const rowTotal = (c: CompanyProfile, rank: JobLevel) =>
  c.salary[rank].base + (c.salary[rank].incentive.avgAmount || 0);
/** CompanySalaryTable 과 같은 호출 — 기준 집합 = 사이트맵 격자 (S3-2 2단계) */
const hrefOf = (total: number) => salaryReportHref(total, SITEMAP_SALARY_GRID);

describe("CompanySalaryTable 연 실수령 hop — 회사 전수 × 5행", () => {
  const staticSet = new Set(getStaticSalaryAmounts());
  const gridSet = new Set(SITEMAP_SALARY_GRID);
  const gridMax = SITEMAP_SALARY_GRID[SITEMAP_SALARY_GRID.length - 1];

  it("(a) 모든 셀의 href 는 null 이거나 사이트맵 격자(⊂ 실제 정적 생성 집합)의 /salary/{n}", () => {
    expect(allCompanies.length).toBeGreaterThanOrEqual(400);
    let linked = 0;
    let text = 0;
    let snapped = 0;
    let overRange = 0;
    let gapOnly = 0;
    for (const c of allCompanies) {
      for (const rank of RANKS) {
        const total = rowTotal(c, rank);
        const href = hrefOf(total);
        if (href === null) {
          text++;
          if (total > gridMax) overRange++;
          else gapOnly++;
          continue;
        }
        linked++;
        const m = href.match(/^\/salary\/(\d+)$/);
        expect(m, `${c.id}/${rank}: ${href}`).not.toBeNull();
        const n = Number(m![1]);
        expect(gridSet.has(n), `${c.id}/${rank}: ${href} 격자 밖`).toBe(true);
        expect(staticSet.has(n), `${c.id}/${rank}: ${href} 집합 밖`).toBe(true);
        expect(Math.abs(n - total) / total, `${c.id}/${rank}: 오차`).toBeLessThanOrEqual(SALARY_HREF_MAX_GAP);
        if (n !== total) snapped++;
      }
    }
    expect(linked + text).toBe(allCompanies.length * RANKS.length);
    expect(linked).toBeGreaterThan(text);
    console.log(
      `[companySalaryNetHop] 회사 ${allCompanies.length}곳 · 셀 ${linked + text} → 링크 ${linked}(정확 ${linked - snapped}·스냅 ${snapped}) / 평문 ${text}(집합 밖 ${overRange}·오차>2% ${gapOnly})`,
    );
  });

  it("(b) 쪽당 링크 ≤5건 — 신입 총보상이 격자 최대 이하면 신입 행은 항상 링크(최근접 격자, 오차 ≤2%)", () => {
    let noLink = 0;
    for (const c of allCompanies) {
      const count = RANKS.filter((rank) => hrefOf(rowTotal(c, rank)) !== null).length;
      expect(count, `${c.id}: ${count}건`).toBeLessThanOrEqual(5);
      const entry = rowTotal(c, "entry");
      if (entry > gridMax) {
        expect(hrefOf(entry), `${c.id}: 신입 ${entry}`).toBeNull();
        if (count === 0) noLink++;
        continue;
      }
      expect(count, `${c.id}: 링크 0건`).toBeGreaterThanOrEqual(1);
      const href = hrefOf(entry);
      expect(href, `${c.id}: 신입 ${entry}`).not.toBeNull();
      const n = Number(href!.slice("/salary/".length));
      expect(gridSet.has(n), `${c.id}: 신입 ${entry} → ${href}`).toBe(true);
      expect(Math.abs(n - entry) / entry, `${c.id}: 신입 오차`).toBeLessThanOrEqual(SALARY_HREF_MAX_GAP);
    }
    // 신입부터 2억 초과(구글 2.07억·메타 2.185억·넷플릭스 3.5억) — 데이터가 바뀌면 이 수도 바뀐다
    expect(noLink).toBeLessThanOrEqual(5);
  });

  it("(c) 클램프 누출 없음 — 격자 최대 초과는 null, 정확 금액·양끝은 링크", () => {
    for (const a of [207_000_000, 218_500_000, 350_000_000, 410_000_000, 900_000_000]) expect(hrefOf(a), String(a)).toBeNull();
    expect(hrefOf(50_000_000)).toBe("/salary/50000000");
    expect(hrefOf(SITEMAP_SALARY_GRID[0])).not.toBeNull();
    expect(hrefOf(gridMax)).not.toBeNull();
    // 격자 밖 레거시 정적 쪽으로는 가지 않는다 — 1억 300만(정적 생성됨)은 1억 500만 격자로
    expect(SALARY_STATIC_AMOUNTS).toContain(103_000_000);
    expect(hrefOf(103_000_000)).toBe("/salary/105000000");
    // 회사 데이터 전수: 최대 초과 행에 /salary/{max} 가 붙는 일이 없다
    for (const c of allCompanies) {
      for (const rank of RANKS) {
        const total = rowTotal(c, rank);
        if (total > gridMax) expect(hrefOf(total), `${c.id}/${rank}: ${total}`).toBeNull();
      }
    }
  });
});

describe("CompanySalaryTable 소스 — 높이 0 링크·계측 속성", () => {
  const src = read("src/components/CompanySalaryTable.tsx");
  const NET_TD_CLASS = 'className="px-4 py-3.5 text-right font-black text-electric tabular-nums"';

  it("(d) AppLink·서버 컴포넌트·모듈 속성·정본 helper, onClick 없음", () => {
    expect(src).toContain('import Link from "@/components/AppLink";');
    expect(src).not.toContain('from "next/link"');
    expect(src).not.toContain('"use client"');
    expect(src).toContain('data-msy-module="company-salary-net"');
    expect(src).toContain("salaryReportHref(total, SITEMAP_SALARY_GRID)");
    expect(src).toContain('import { SITEMAP_SALARY_GRID } from "@/lib/salarySitemapGrid";');
    expect(src).not.toContain("onClick="); // 속성 형태만 금지 (주석의 언급은 허용)
  });

  it("(d) 링크는 연 실수령 셀 하나뿐, 셀 클래스 불변, 인라인 텍스트 링크(행 높이 불변)", () => {
    expect(src.match(/<Link\b/g)?.length).toBe(1);
    expect(src.split(NET_TD_CLASS).length - 1).toBe(1);
    const linkCls = src.match(/<Link\b[\s\S]*?className="([^"]+)"/)?.[1] ?? "";
    expect(linkCls).toContain("underline");
    expect(linkCls).not.toMatch(/\b(inline-block|inline-flex|block)\b|\bmin-h-|\bpy-|\bpx-/);
    // 링크가 있는 셀이 곧 연 실수령 셀이다
    const cellIdx = src.indexOf(NET_TD_CLASS);
    const cell = src.slice(cellIdx, src.indexOf("</td>", cellIdx));
    expect(cell).toContain("row.salaryHref ?");
    expect(cell).toContain("<Link");
    expect(cell).toContain("{fmt(row.netAnnual)}원");
  });

  it("(d) 총 연봉·월 실수령 셀은 여전히 평문", () => {
    expect(src).toMatch(/text-navy dark:text-canvas-50 tabular-nums">\s*\{fmt\(row\.total\)\}원\s*<\/td>/);
    expect(src).toMatch(/text-muted-blue dark:text-canvas-300 tabular-nums">\s*\{fmt\(row\.netMonthly\)\}원\s*<\/td>/);
  });

  it("(e) 로컬 스냅 복제 2벌 제거 — ShareableResult·/monthly 는 정본 salaryReportHref 계열 사용", () => {
    for (const file of ["src/components/ShareableResult.tsx", "src/app/monthly/[amount]/page.tsx"]) {
      const s = read(file);
      expect(s, file).not.toContain("snapToSalaryGrid");
      expect(s, file).toContain("salaryReportHref");
      expect(s, file).toMatch(/import \{[^}]*salaryReportHref\w*[^}]*\} from "@\/lib\/salaryRedirect";/);
    }
    expect(read("src/lib/salaryRedirect.ts")).toContain("export function salaryReportHref(");
  });
});

describe("CompanySalaryTable title — 스냅된 링크는 href 금액을 '구간'으로 말한다 (2026-09-12 리뷰)", () => {
  const src = read("src/components/CompanySalaryTable.tsx");
  const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");
  const LINK_RE = /<a href="\/salary\/(\d+)" class="[^"]*" title="연봉 ([\d,]+)원( 구간)? 실수령액 상세">([\d,]+)원<\/a>/g;

  it("(f) 소스: 정확 링크는 행 총액, 스냅 링크는 href 금액 + 구간 — 링크 텍스트·셀 클래스는 그대로", () => {
    expect(src).toContain("`연봉 ${fmt(salaryHrefAmount)}원 구간 실수령액 상세`");
    expect(src).toContain("`연봉 ${fmt(total)}원 실수령액 상세`");
    expect(src).toContain("title={row.salaryHrefTitle}");
    expect(src).not.toContain("title={`연봉 ${fmt(row.total)}원 실수령액 상세`}");
    // 스냅 금액은 href 에서 파생 — 두 번째 salaryReportHref 호출이나 별도 스냅 함수를 두지 않는다
    expect(src.match(/salaryReportHref\(/g)?.length).toBe(1);
    expect(src).toContain('salaryHref.slice("/salary/".length)');
  });

  it("(f) 렌더(회사 전수): title 금액 = href 금액이고, 구간 표기 ⇔ href 금액 ≠ 행 총액", () => {
    let snappedLinks = 0;
    let exactLinks = 0;
    for (const c of allCompanies) {
      const html = renderToStaticMarkup(createElement(CompanySalaryTable, { company: c }));
      const links = [...html.matchAll(LINK_RE)];
      const expected = RANKS.map((rank) => ({ total: rowTotal(c, rank), href: hrefOf(rowTotal(c, rank)) })).filter(
        (r) => r.href !== null,
      );
      expect(links.length, `${c.id}: 링크 수`).toBe(expected.length);
      links.forEach((m, i) => {
        const hrefAmount = Number(m[1]);
        const titleAmount = Number(m[2].replace(/,/g, ""));
        const isRange = m[3] !== undefined;
        const { total, href } = expected[i];
        expect(`/salary/${hrefAmount}`, `${c.id}: href 순서`).toBe(href);
        expect(titleAmount, `${c.id}: title 금액은 href 금액`).toBe(hrefAmount);
        expect(isRange, `${c.id}: 구간 표기 ⇔ 스냅 (${total} → ${hrefAmount})`).toBe(hrefAmount !== total);
        if (isRange) snappedLinks++;
        else {
          exactLinks++;
          expect(m[2]).toBe(fmt(total));
        }
      });
    }
    // 리뷰 시점 실측: 1,890 링크 중 112건 스냅. 데이터가 바뀌어도 두 경로가 모두 살아 있어야 테스트가 공허하지 않다
    expect(snappedLinks).toBeGreaterThan(0);
    expect(exactLinks).toBeGreaterThan(snappedLinks);
    console.log(`[companySalaryNetHop] title 검증 — 정확 ${exactLinks} · 구간(스냅) ${snappedLinks}`);
  });
});
