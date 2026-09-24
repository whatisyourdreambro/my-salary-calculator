// src/lib/__tests__/dartReportedBasis.test.ts
//
// A19 (COMP-01, 운영자 승인 2026-09-25) 회귀 가드:
//  1. 회사 카드 DART 헤드라인 = 회사 공시 1인평균급여액 기준값(모든 급여 행에 값이 있을 때만).
//     '공식 수치' 라벨은 수기·공시 기준(reported)에만, 급여총액÷인원 산정치(computed)는 산정치 라벨.
//  2. 랭킹 모수 = 두 집계 방식 괴리 10% 이하 (종전 V4 플래그 30%).
//  3. 광고 위 카드 높이 불변 가드 — 주입 카드는 인라인 병기 없음, 이력 표 게이트 통과,
//     TOP100 신규 진입사 배지 억제(10/6 이후 해제), 업종 랭킹 도선 유지.
//  4. COMP-02 — 플래그 항목은 공시 기준값이 있을 때만 주입.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { allCompanies } from "@/data/companies";
import { dartDisclosed, DART_DATA_DATE } from "@/data/dart/dartDisclosed";
import { dartInjection, DART_INJECTION_DATE } from "@/data/dart/dartInjection";
import { corpCodeMap } from "@/data/dart/corpCodeMap";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { getCompanySalaryBasis } from "@/lib/companySalaryBasis";
import {
  dartTop100,
  dartTop100CardBadgeCorps,
  dartReportStats,
  dartIndustryRows,
  dartCompanyStatsById,
} from "@/lib/salary-data/dartReport";
import {
  industryRankings,
  industryRankingByCompanyId,
  LISTED_TOTAL,
  LISTED_ALL_TOTAL,
  LISTED_DIVERGENCE_EXCLUDED,
  topRaiseRows,
  topEmployeesRows,
  topTenureRows,
  tenureEligibleCount,
} from "@/lib/salary-data/dartRanking";
import {
  passesRankingDivergence,
  RANKING_DIVERGENCE_MAX_PCT,
} from "@/lib/salary-data/dartRankingGuards";
import CompanyDisclosedSalary, { disclosedHistoryRows } from "@/components/CompanyDisclosedSalary";

const rawById = new Map(allCompanies.map((c) => [c.id, c]));
const byCorp = new Map(dartDisclosed.map((d) => [d.corpCode, d]));
const nameKey = (s: string) => s.replace(/&amp;/g, "&");

describe("ETL 산출 — 공시 1인평균 기준값·괴리율 (A19)", () => {
  it("reportedAvgManwonRaw 는 V3 범위 안에서만, divergencePct 는 수치로 실린다", () => {
    const withReported = dartDisclosed.filter((d) => d.reportedAvgManwonRaw != null);
    expect(withReported.length).toBeGreaterThan(2000);
    for (const d of withReported) {
      expect(d.reportedAvgManwonRaw!).toBeGreaterThanOrEqual(1200);
      expect(d.reportedAvgManwonRaw!).toBeLessThanOrEqual(30000);
    }
    for (const d of dartDisclosed) {
      if (d.divergencePct != null) expect(Number.isFinite(d.divergencePct)).toBe(true);
      // V4 플래그 = 괴리 30% 초과 — 괴리율 필드와 모순 없음
      if (d.flags?.includes("V4-divergence")) expect(d.divergencePct!).toBeGreaterThan(30);
    }
  });

  it("주입 헤드라인 a 는 공시 기준값(무플래그) 또는 산정치(b=c)를 100만원 반올림한 값이다", () => {
    for (const [id, inj] of Object.entries(dartInjection)) {
      const d = byCorp.get(corpCodeMap[id]?.corpCode ?? "");
      expect(d, id).toBeDefined();
      if (inj.b !== "c") {
        expect(inj.a).toBe(Math.round(d!.reportedAvgManwonRaw! / 100) * 100);
      } else {
        expect(d!.reportedAvgManwonRaw).toBeUndefined();
        expect(inj.a).toBe(d!.avgSalaryManwon);
      }
      // COMP-02: 플래그 항목은 공시 기준값이 있을 때만 주입
      if (d!.flags?.length) expect(inj.b).toBeUndefined();
    }
  });

  it("산정 기준 플래그는 산정치(b=c)에만 — 공시 기준 다수는 무플래그 (클라이언트 번들 증가 0)", () => {
    const entries = Object.values(dartInjection);
    const computed = entries.filter((e) => e.b === "c");
    expect(computed.length).toBeLessThan(entries.length / 2);
    for (const e of entries) expect(e.b === undefined || e.b === "c").toBe(true);
  });

  it("날짜 — 수집일(DART_DATA_DATE)이 카드 변경일(DART_INJECTION_DATE)보다 늦지 않다", () => {
    expect(DART_DATA_DATE <= DART_INJECTION_DATE).toBe(true);
  });
});

describe("회사 카드 — 산정 기준 라벨 (A19)", () => {
  const injected = companyRepository
    .getAll()
    .filter((c) => !rawById.get(c.id)?.disclosed && dartInjection[c.id]);

  it("주입 카드는 basis 를 갖고 note 가 기준을 밝힌다, 수기 카드는 basis 없음", () => {
    expect(injected.length).toBeGreaterThan(200);
    for (const c of injected) {
      const inj = dartInjection[c.id];
      expect(c.disclosed!.basis).toBe(inj.b === "c" ? "computed" : "reported");
      expect(c.disclosed!.avgSalaryManwon).toBe(inj.a);
      expect(c.disclosed!.note).toContain(
        inj.b === "c" ? "연간급여총액÷인원" : "1인평균급여액을 인원 가중 평균"
      );
    }
    for (const c of companyRepository.getAll()) {
      if (rawById.get(c.id)?.disclosed) expect(c.disclosed!.basis).toBeUndefined();
    }
  });

  it("주입 카드 note 는 종전 문구보다 길지 않다 (광고 위 높이 불변)", () => {
    for (const c of injected) {
      const legacy = `직원 ${dartInjection[c.id].e.toLocaleString("ko-KR")}명 기준. 사업부문·성별 구분 공시를 연간급여총액÷인원으로 가중 평균한 값(등기임원 제외).`;
      expect(c.disclosed!.note!.length).toBeLessThanOrEqual(legacy.length);
    }
  });

  it("H2 — reported·수기는 '공식 수치', computed 는 같은 길이 이하의 산정치 라벨", () => {
    const sample = injected.find((c) => c.disclosed!.basis === "reported")!;
    const html = renderToStaticMarkup(createElement(CompanyDisclosedSalary, { company: sample }));
    expect(html).toContain("추정이 아닌 공식 수치");
    const computed = { ...sample, disclosed: { ...sample.disclosed!, basis: "computed" as const } };
    const html2 = renderToStaticMarkup(createElement(CompanyDisclosedSalary, { company: computed }));
    expect(html2).not.toContain("공식 수치");
    expect(html2).toContain("급여총액÷인원 산정치");
    const officialLabel = " 공시 기준 평균연봉 — 추정이 아닌 공식 수치";
    const computedLabel = " 공시 기준 평균연봉 — 급여총액÷인원 산정치";
    expect(computedLabel.length).toBeLessThanOrEqual(officialLabel.length);
  });

  it("주입 카드는 인라인 병기(hasDartGap)를 붙이지 않는다 — 수기 카드만", () => {
    for (const c of injected) {
      expect(getCompanySalaryBasis(c, { dartSalaryManwon: 1 }).hasDartGap).toBe(false);
    }
    const samsung = companyRepository.getById("samsung-electronics")!;
    expect(samsung.disclosed!.basis).toBeUndefined();
    expect(getCompanySalaryBasis(samsung, { dartSalaryManwon: 20000 }).hasDartGap).toBe(true);
  });
});

describe("reported 카드 — 배지·순위·이력 표가 헤드라인과 산정 기준을 섞지 않는다 (A19 리뷰 정정)", () => {
  /** CompanyDisclosedSalary.formatManwon 과 같은 표기 */
  const fmt = (manwon: number) => {
    const eok = Math.floor(manwon / 10000);
    const rest = manwon % 10000;
    if (eok > 0 && rest > 0) return `${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
    if (eok > 0) return `${eok}억원`;
    return `${rest.toLocaleString("ko-KR")}만원`;
  };
  // page.tsx 와 같은 전달: 주입 카드는 괴리 게이트 없이 stats 그대로
  const render = (c: ReturnType<typeof companyRepository.getAll>[number]) => {
    const stats = dartCompanyStatsById.get(c.id)!;
    return renderToStaticMarkup(
      createElement(CompanyDisclosedSalary, {
        company: c,
        dartStats: stats,
        dartSalaryManwon: stats.dartSalaryManwon,
      })
    );
  };
  const reportedWithStats = companyRepository
    .getAll()
    .filter(
      (c) =>
        !rawById.get(c.id)?.disclosed &&
        c.disclosed?.basis === "reported" &&
        dartCompanyStatsById.has(c.id)
    );

  it.each(["lotte-card", "yg-entertainment"])(
    "%s — 전년 대비 배지가 산정치 전년값을 헤드라인에 잇지 않고, 같은 연도 산정치가 표에 보인다",
    (id) => {
      const c = companyRepository.getById(id)!;
      expect(c.disclosed!.basis).toBe("reported");
      const stats = dartCompanyStatsById.get(id)!;
      expect(stats.yoyPct).not.toBeNull();
      // 감사 지적 사례 — 헤드라인(공시 1인평균)과 산정치가 5% 넘게 벌어진 카드
      expect(
        Math.abs(c.disclosed!.avgSalaryManwon - stats.dartSalaryManwon) / stats.dartSalaryManwon
      ).toBeGreaterThan(0.05);
      const html = render(c);
      expect(html).not.toContain(`(${fmt(stats.prevSalaryManwon!)} →)`);
      expect(html).not.toContain(" →)");
      expect(html).toContain("(급여총액÷인원)");
      // 상장사만 순위 줄이 있다 (롯데카드는 비상장)
      if (stats.listedRank != null) expect(html).toContain("산정치 기준");
      expect(html).not.toContain("DART 공시 기준");
      // 배지 % 의 두 값(당해·전년 산정치)이 모두 '급여총액÷인원' 이력 표에 있다
      expect(html).toContain(`>${stats.fiscalYear}</td>`);
      expect(html).toContain(fmt(stats.dartSalaryManwon));
      expect(html).toContain(fmt(stats.prevSalaryManwon!));
    }
  );

  it("전 reported 카드 — 이력 표 행 수 불변·첫 행은 같은 연도 산정치, 라벨은 종전 문구보다 짧다", () => {
    expect(reportedWithStats.length).toBeGreaterThan(200);
    for (const c of reportedWithStats) {
      const stats = dartCompanyStatsById.get(c.id)!;
      const rows = disclosedHistoryRows(c.disclosed!, stats);
      // 광고 위 높이 불변 — 종전 표 행 수(과년도 이력 최대 3행)와 같다
      expect(rows.length, c.id).toBe(Math.min(stats.history?.length ?? 0, 3));
      if (rows.length && stats.fiscalYear === c.disclosed!.fiscalYear) {
        expect(rows[0], c.id).toEqual({
          fiscalYear: stats.fiscalYear,
          avgSalaryManwonRaw: stats.dartSalaryManwon,
          employeeCount: stats.employeeCount,
        });
      }
      if (stats.prevSalaryManwon != null) {
        expect("(급여총액÷인원)".length).toBeLessThanOrEqual(
          `(${fmt(stats.prevSalaryManwon)} →)`.length
        );
      }
      const html = render(c);
      const tbody = html.includes("<tbody>")
        ? html.slice(html.indexOf("<tbody>"), html.indexOf("</tbody>"))
        : "";
      expect((tbody.match(/<tr/g) ?? []).length, c.id).toBe(rows.length);
      expect(html, c.id).not.toContain(" →)");
      expect(html, c.id).not.toContain("DART 공시 기준");
      if (stats.yoyPct != null && stats.listedRank != null) {
        expect(html, c.id).toContain("산정치 기준");
      }
    }
    expect("산정치 기준".length).toBeLessThan("DART 공시 기준".length);
  });

  it("수기 카드는 종전 그대로 — 전년값 → 배지·과년도 이력만", () => {
    const samsung = companyRepository.getById("samsung-electronics")!;
    const stats = dartCompanyStatsById.get("samsung-electronics")!;
    expect(disclosedHistoryRows(samsung.disclosed!, stats)).toEqual(
      (stats.history ?? []).slice(0, 3)
    );
    const html = renderToStaticMarkup(
      createElement(CompanyDisclosedSalary, { company: samsung, dartStats: stats })
    );
    expect(stats.prevSalaryManwon).not.toBeNull();
    expect(html).toContain(`(${fmt(stats.prevSalaryManwon!)} →)`);
    expect(html).toContain("DART 공시 기준");
    expect(html).not.toContain("(급여총액÷인원)");
  });
});

describe("랭킹 모수 — 괴리 10% 초과 제외 (A19)", () => {
  it("가드 상수·판정", () => {
    expect(RANKING_DIVERGENCE_MAX_PCT).toBe(10);
    expect(passesRankingDivergence({ divergencePct: 10 })).toBe(true);
    expect(passesRankingDivergence({ divergencePct: 10.1 })).toBe(false);
    expect(passesRankingDivergence({})).toBe(true);
  });

  it("TOP100 전 행이 가드를 통과하고 제외 수가 방법론 표기와 맞다", () => {
    expect(dartTop100.length).toBe(100);
    for (const r of dartTop100) {
      expect(passesRankingDivergence(byCorp.get(r.corpCode)!)).toBe(true);
    }
    const base = dartDisclosed.filter((d) => d.fiscalYear === "2025" && !d.flags?.length);
    expect(dartReportStats.companyCount + dartReportStats.divergenceExcludedCount).toBe(base.length);
    expect(dartReportStats.divergenceExcludedCount).toBeGreaterThan(0);
    // 감사 지적 사례: SV인베스트먼트(산정 19,800 vs 공시 기준 15,200)가 더는 TOP100 에 없다
    expect(dartTop100.some((r) => r.nameKo.includes("SV인베스트먼트"))).toBe(false);
  });

  it("업종 집계·업종 랭킹·인상률 랭킹 행도 전부 가드 통과", () => {
    const listedByName = new Map(
      dartDisclosed.filter((d) => d.fiscalYear === "2025").map((d) => [nameKey(d.corpNameKo), d])
    );
    for (const r of industryRankings) {
      for (const row of r.topRows) {
        expect(passesRankingDivergence(listedByName.get(row.nameKo)!)).toBe(true);
      }
    }
    for (const row of topRaiseRows) {
      expect(passesRankingDivergence(listedByName.get(row.nameKo)!)).toBe(true);
    }
    expect(dartIndustryRows.length).toBeGreaterThan(10);
    expect(LISTED_TOTAL).toBeLessThan(
      dartDisclosed.filter((d) => d.fiscalYear === "2025" && !d.flags?.length && d.stockCode).length
    );
  });

  it("직원 수·근속연수 랭킹은 급여 괴리와 무관 — 전수 모수(플래그만 제외) 그대로 (리뷰 정정)", () => {
    const fullPool = dartDisclosed.filter(
      (d) => d.fiscalYear === "2025" && !d.flags?.length && d.stockCode
    );
    expect(LISTED_ALL_TOTAL).toBe(fullPool.length);
    expect(LISTED_DIVERGENCE_EXCLUDED).toBe(LISTED_ALL_TOTAL - LISTED_TOTAL);
    expect(LISTED_DIVERGENCE_EXCLUDED).toBeGreaterThan(0);
    const byEmployees = [...fullPool]
      .sort((a, b) => b.employeeCount - a.employeeCount)
      .slice(0, 100)
      .map((d) => d.stockCode);
    expect(topEmployeesRows.map((r) => r.stockCode)).toEqual(byEmployees);
    const withTenure = fullPool.filter((d) => d.avgTenureYears != null && d.avgTenureYears > 0);
    expect(tenureEligibleCount).toBe(withTenure.length);
    const byTenure = [...withTenure]
      .sort((a, b) => (b.avgTenureYears ?? 0) - (a.avgTenureYears ?? 0))
      .slice(0, 100)
      .map((d) => d.stockCode);
    expect(topTenureRows.map((r) => r.stockCode)).toEqual(byTenure);
    // 괴리 10% 초과 회사가 인원·근속 랭킹에서 빠지지 않는다 (감사 지적: 아모레퍼시픽·한화손해보험·서연이화)
    expect(
      [...topEmployeesRows, ...topTenureRows].some(
        (r) => !passesRankingDivergence(fullPool.find((d) => d.stockCode === r.stockCode)!)
      )
    ).toBe(true);
  });
});

describe("광고 위 카드 높이 불변 가드", () => {
  it("TOP100 카드 배지는 종전 기준에서도 TOP100 이던 corp 에만 (신규 진입사 억제)", () => {
    expect(dartTop100CardBadgeCorps.size).toBe(100);
    const entrants = dartTop100.filter((r) => !dartTop100CardBadgeCorps.has(r.corpCode));
    // 새 기준으로 들어온 회사가 있고, 그중 회사 페이지 보유사는 카드 배지가 억제된다
    expect(entrants.length).toBeGreaterThan(0);
  });

  it("업종 랭킹 도선(카드 링크 줄)은 순위 모수 강화와 무관하게 유지 — 업종 페이지 28종 존속", () => {
    expect(industryRankings.length).toBeGreaterThanOrEqual(28);
    const pages = new Set(industryRankings.map((r) => r.industryId));
    for (const { industryId } of industryRankingByCompanyId.values()) {
      expect(pages.has(industryId)).toBe(true);
    }
    expect(industryRankingByCompanyId.size).toBeGreaterThan(200);
  });
});
