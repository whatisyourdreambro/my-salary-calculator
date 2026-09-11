// 회사 상세 표 '연 실수령' 셀 → /salary/[amount] hop 회귀 가드 (2026-09-12 S2-2)
//
// /salary/[amount] 는 dynamicParams=false 라 집합 밖 href 는 하드 404 이고, 집합 끝으로 클램프하면
// 틀린 목적지다(임원 총보상 3.5억 초과 행 58건). 430쪽 × 5행 전수로
//   (a) href ⊂ 실제 generateStaticParams 집합(getStaticSalaryAmounts),
//   (b) 쪽당 1~5건 — 신입 총보상은 companyEntryAmounts 로 집합에 등재되므로 항상 링크(회귀 가드),
//   (c) 클램프 누출 0,
//   (d)(e) 소스 스캔 — 높이 0 인라인 링크·AppLink·모듈 속성·로컬 스냅 복제 2벌 제거
// 를 고정한다. 소스 스캔은 internalLinkModules.test.ts 와 같은 방식(jsdom 없음).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { allCompanies } from "@/data/companies";
import { getStaticSalaryAmounts } from "@/lib/salaryStaticParams";
import { SALARY_STATIC_AMOUNTS } from "@/lib/salaryStaticAmounts.generated";
import { SALARY_HREF_MAX_GAP, salaryReportHref } from "@/lib/salaryRedirect";
import type { CompanyProfile, JobLevel } from "@/types/company";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const RANKS: JobLevel[] = ["entry", "junior", "senior", "lead", "executive"];
/** CompanySalaryTable 의 행 총액 식과 동일 (기본급 + 인센티브 평균, 주식·사인온 제외) */
const rowTotal = (c: CompanyProfile, rank: JobLevel) =>
  c.salary[rank].base + (c.salary[rank].incentive.avgAmount || 0);

describe("CompanySalaryTable 연 실수령 hop — 회사 전수 × 5행", () => {
  const staticSet = new Set(getStaticSalaryAmounts());
  const gridMax = SALARY_STATIC_AMOUNTS[SALARY_STATIC_AMOUNTS.length - 1];

  it("(a) 모든 셀의 href 는 null 이거나 실제 정적 생성 집합의 /salary/{n}", () => {
    expect(allCompanies.length).toBeGreaterThanOrEqual(400);
    let linked = 0;
    let text = 0;
    let snapped = 0;
    let overRange = 0;
    let gapOnly = 0;
    for (const c of allCompanies) {
      for (const rank of RANKS) {
        const total = rowTotal(c, rank);
        const href = salaryReportHref(total);
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

  it("(b) 쪽당 링크 1~5건 — 신입 총보상은 항상 집합 위(companyEntryAmounts 회귀 가드)", () => {
    for (const c of allCompanies) {
      const count = RANKS.filter((rank) => salaryReportHref(rowTotal(c, rank)) !== null).length;
      expect(count, `${c.id}: ${count}건`).toBeLessThanOrEqual(5);
      expect(count, `${c.id}: 링크 0건`).toBeGreaterThanOrEqual(1);
      const entry = rowTotal(c, "entry");
      expect(salaryReportHref(entry), `${c.id}: 신입 ${entry}`).toBe(`/salary/${entry}`);
    }
  });

  it("(c) 클램프 누출 없음 — 집합 최대 초과는 null, 정확 금액·양끝은 링크", () => {
    for (const a of [410_000_000, 450_000_000, 900_000_000]) expect(salaryReportHref(a), String(a)).toBeNull();
    expect(salaryReportHref(50_000_000)).toBe("/salary/50000000");
    expect(salaryReportHref(SALARY_STATIC_AMOUNTS[0])).not.toBeNull();
    expect(salaryReportHref(gridMax)).not.toBeNull();
    // 회사 데이터 전수: 최대 초과 행에 /salary/{max} 가 붙는 일이 없다
    for (const c of allCompanies) {
      for (const rank of RANKS) {
        const total = rowTotal(c, rank);
        if (total > gridMax) expect(salaryReportHref(total), `${c.id}/${rank}: ${total}`).toBeNull();
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
    expect(src).toContain("salaryReportHref(total)");
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
