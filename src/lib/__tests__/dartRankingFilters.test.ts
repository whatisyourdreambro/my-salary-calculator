// src/lib/__tests__/dartRankingFilters.test.ts
//
// DATA-07 (2026-09-25) 회귀 가드 — 연봉 인상률 TOP 100 이 데이터 착시에 이끌리지 않는다.
// 종전 1위 알지노믹스(5,094→19,321만, +279.3%, 직원 39명)·2위 이닉스(전년 1,526만 — 2024 연간
// 최저임금 환산 2,473만 미만) 등이 인용문 'top-raise-no1' 으로 나가던 문제.
//  (a) 두 해 중 한 해라도 평균연봉 < 그해 연간 최저임금 환산액(시급×209×12) → 제외
//  (b) 인상률 +100% 초과 또는 직원 50명 미만 → 순위에서 빼 별도 목록(인용문·FAQ 미사용)
import { describe, expect, it } from "vitest";
import { dartDisclosed } from "@/data/dart/dartDisclosed";
import { MINIMUM_WAGE_2024, MINIMUM_WAGE_2025, MONTHLY_HOURS } from "@/config/minimumWage";
import {
  DART_RANKING_YEAR,
  MIN_WAGE_ANNUAL_MANWON,
  RAISE_MIN_EMPLOYEES,
  RAISE_OUTLIER_MAX_PCT,
  RAISE_PREV_YEAR,
  raiseEligibleCount,
  topRaiseOutlierRows,
  topRaiseRows,
  DART_RANKING_DATE,
  DART_RANKING_PAGE_MODIFIED,
} from "@/lib/salary-data/dartRanking";
import { DART_LITE_DATE, DART_LITE_PAGE_MODIFIED } from "@/lib/salary-data/dartLite";
import { RANKING_METHOD_REVISED_DATE } from "@/lib/salary-data/dartRankingGuards";
import { TAX_TABLE_EFFECTIVE_DATE } from "@/config/siteDates";

const decode = (s: string) => s.replace(/&amp;/g, "&");
const byName = new Map(
  dartDisclosed.filter((d) => d.fiscalYear === DART_RANKING_YEAR).map((d) => [decode(d.corpNameKo), d])
);
const prevOf = (name: string) =>
  byName.get(name)!.history!.find((h) => h.fiscalYear === RAISE_PREV_YEAR)!.avgSalaryManwonRaw;

describe("최저임금 상수 (고용노동부 고시 — 2024 9,860원 · 2025 10,030원)", () => {
  it("시급·연 환산 = 시급 × 209시간 × 12", () => {
    expect(MINIMUM_WAGE_2024.hourly).toBe(9860);
    expect(MINIMUM_WAGE_2025.hourly).toBe(10030);
    expect(MONTHLY_HOURS).toBe(209);
    expect(MINIMUM_WAGE_2024.yearly).toBe(9860 * 209 * 12);
    expect(MINIMUM_WAGE_2025.yearly).toBe(10030 * 209 * 12);
    expect(MINIMUM_WAGE_2025.monthly).toBe(2_096_270);
  });

  it("랭킹 기준 연도·전년 연도의 연간 환산액(만원)이 모두 있다", () => {
    expect(RAISE_PREV_YEAR).toBe(String(Number(DART_RANKING_YEAR) - 1));
    expect(MIN_WAGE_ANNUAL_MANWON[DART_RANKING_YEAR]).toBeGreaterThan(2000);
    expect(MIN_WAGE_ANNUAL_MANWON[RAISE_PREV_YEAR]).toBeGreaterThan(2000);
    expect(Math.round(MIN_WAGE_ANNUAL_MANWON["2024"])).toBe(2473);
    expect(Math.round(MIN_WAGE_ANNUAL_MANWON["2025"])).toBe(2516);
  });
});

describe("인상률 TOP 100 필터 (DATA-07)", () => {
  it("순위가 채워져 있고 1위가 두 필터를 모두 통과한다", () => {
    expect(topRaiseRows.length).toBe(100);
    const top1 = topRaiseRows[0];
    expect(top1.rank).toBe(1);
    expect(top1.raisePct!).toBeLessThanOrEqual(RAISE_OUTLIER_MAX_PCT);
    expect(top1.employeeCount).toBeGreaterThanOrEqual(RAISE_MIN_EMPLOYEES);
    expect(top1.prevSalaryManwon!).toBeGreaterThanOrEqual(MIN_WAGE_ANNUAL_MANWON[RAISE_PREV_YEAR]);
    expect(top1.avgSalaryManwon).toBeGreaterThanOrEqual(MIN_WAGE_ANNUAL_MANWON[DART_RANKING_YEAR]);
    // 감사 지적 사례는 순위에 없다
    expect(topRaiseRows.some((r) => r.nameKo === "알지노믹스")).toBe(false);
  });

  it("전년 값이 최저임금 환산액 미만인 순위 행 0 · 전 행이 (a)(b) 통과", () => {
    const belowMin = topRaiseRows.filter(
      (r) => (r.prevSalaryManwon ?? 0) < MIN_WAGE_ANNUAL_MANWON[RAISE_PREV_YEAR]
    );
    expect(belowMin).toHaveLength(0);
    for (const r of topRaiseRows) {
      expect(r.avgSalaryManwon).toBeGreaterThanOrEqual(MIN_WAGE_ANNUAL_MANWON[DART_RANKING_YEAR]);
      expect(r.raisePct!).toBeLessThanOrEqual(RAISE_OUTLIER_MAX_PCT);
      expect(r.employeeCount).toBeGreaterThanOrEqual(RAISE_MIN_EMPLOYEES);
      // 표시값이 원 데이터와 일치 (전년 값은 history 원값)
      expect(r.prevSalaryManwon).toBe(prevOf(r.nameKo));
    }
  });

  it("순위는 1..n 연속·인상률 내림차순", () => {
    topRaiseRows.forEach((r, i) => {
      expect(r.rank).toBe(i + 1);
      if (i > 0) expect(topRaiseRows[i - 1].raisePct!).toBeGreaterThanOrEqual(r.raisePct!);
    });
  });

  it("이상치 목록 — 사유가 있고 (b)에 걸리며, 걸러지지 않았다면 TOP 100 안에 들었을 행만", () => {
    expect(topRaiseOutlierRows.length).toBeGreaterThan(0);
    const cutoff = topRaiseRows[topRaiseRows.length - 1].raisePct!;
    for (const o of topRaiseOutlierRows) {
      expect(o.outlierReason.length).toBeGreaterThan(0);
      expect(o.raisePct! > RAISE_OUTLIER_MAX_PCT || o.employeeCount < RAISE_MIN_EMPLOYEES).toBe(true);
      expect(o.raisePct!).toBeGreaterThanOrEqual(cutoff);
      // 이상치도 (a) 최저임금 필터는 통과한 행이다
      expect(o.prevSalaryManwon!).toBeGreaterThanOrEqual(MIN_WAGE_ANNUAL_MANWON[RAISE_PREV_YEAR]);
    }
    expect(topRaiseOutlierRows.some((o) => o.nameKo === "알지노믹스")).toBe(true);
    const ranked = new Set(topRaiseRows.map((r) => r.nameKo));
    expect(topRaiseOutlierRows.some((o) => ranked.has(o.nameKo))).toBe(false);
  });

  it("비교 모수(raiseEligibleCount)는 순위 행과 같은 필터 — 순위 행 수 이상", () => {
    expect(raiseEligibleCount).toBeGreaterThanOrEqual(topRaiseRows.length);
  });
});

// 신선도 신호 — 공시 수집일이 그대로여도 페이지 값·순위 기준이 바뀐 날을 sitemap lastmod·Dataset
// dateModified 로 신고한다(보이는 '데이터 기준일'은 수집일 그대로). max() 라 수집일 갱신 시 자동 추종.
describe("상장사 lite·랭킹 페이지 수정일", () => {
  it("랭킹 페이지 수정일 = max(수집일, 순위 기준 변경일)", () => {
    expect(DART_RANKING_PAGE_MODIFIED >= DART_RANKING_DATE).toBe(true);
    expect(DART_RANKING_PAGE_MODIFIED >= RANKING_METHOD_REVISED_DATE).toBe(true);
    expect([DART_RANKING_DATE, RANKING_METHOD_REVISED_DATE]).toContain(DART_RANKING_PAGE_MODIFIED);
  });

  it("lite 페이지 수정일 = max(수집일, 월 실수령 재계산일 TAX_TABLE_EFFECTIVE_DATE)", () => {
    expect(DART_LITE_PAGE_MODIFIED >= DART_LITE_DATE).toBe(true);
    expect(DART_LITE_PAGE_MODIFIED >= TAX_TABLE_EFFECTIVE_DATE).toBe(true);
    expect([DART_LITE_DATE, TAX_TABLE_EFFECTIVE_DATE]).toContain(DART_LITE_PAGE_MODIFIED);
  });
});
