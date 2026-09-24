// src/lib/__tests__/companyContentBuilder.test.ts
//
// 랭킹·백분위 회귀 가드 (2026-08 정합화 작업).
//  - 글로벌 기업(isGlobal)의 국내 랭킹 제외
//  - topPercent clamp (1위가 "상위 0%"가 되지 않음)
//  - percentBelow ↔ topPercent 극성 (무음 반전 방지)
import { describe, expect, it } from "vitest";

import { allCompanies } from "@/data/companies";
import {
  getIndustryBenchmark,
  getIndustryRanking,
  getOverallRank,
  getSimilarSalaryCompanies,
  overallRankLabel,
} from "@/lib/companyContentBuilder";

const domestic = allCompanies.filter((c) => !c.isGlobal);
const globals = allCompanies.filter((c) => c.isGlobal);
const entryTotal = (c: (typeof allCompanies)[number]) =>
  c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0);

describe("isGlobal 태깅", () => {
  it("글로벌 기업이 존재하고 nvidia가 포함된다", () => {
    expect(globals.length).toBeGreaterThan(0);
    expect(globals.some((c) => c.id === "nvidia")).toBe(true);
  });

  it("국내 풀에는 글로벌 기업이 없다", () => {
    expect(domestic.some((c) => c.isGlobal)).toBe(false);
  });
});

describe("getOverallRank — 국내 전국 순위", () => {
  it("글로벌 기업은 null (국내 순위 제외)", () => {
    for (const g of globals) {
      expect(getOverallRank(g)).toBeNull();
    }
  });

  it("total은 국내 회사 수와 같다 (글로벌 미포함)", () => {
    const samsung = allCompanies.find((c) => c.id === "samsung-electronics")!;
    const rank = getOverallRank(samsung)!;
    expect(rank.total).toBe(domestic.length);
    expect(rank.total).toBeLessThan(allCompanies.length);
  });

  it("국내 1위 회사의 topPercent는 1 이상 — '상위 0%' 불가", () => {
    const top = [...domestic].sort((a, b) => entryTotal(b) - entryTotal(a))[0];
    const rank = getOverallRank(top)!;
    expect(rank.rank).toBe(1);
    expect(rank.topPercent).toBeGreaterThanOrEqual(1);
  });

  it("국내 꼴찌의 topPercent는 100", () => {
    const bottom = [...domestic].sort((a, b) => entryTotal(a) - entryTotal(b))[0];
    const rank = getOverallRank(bottom)!;
    expect(rank.rank).toBe(domestic.length);
    expect(rank.topPercent).toBe(100);
  });
});

describe("overallRankLabel — 상위 50% 밖은 순위 숫자 대신 구간 라벨 (A22)", () => {
  it("상위 50% 이내는 '{N}위' 그대로", () => {
    expect(overallRankLabel({ rank: 12, total: 422, topPercent: 3 })).toBe("12위");
    expect(overallRankLabel({ rank: 211, total: 422, topPercent: 50 })).toBe("211위");
  });

  it("51~75%는 '중위권', 76~100%는 '중하위권'", () => {
    expect(overallRankLabel({ rank: 252, total: 422, topPercent: 60 })).toBe("중위권");
    expect(overallRankLabel({ rank: 316, total: 422, topPercent: 75 })).toBe("중위권");
    expect(overallRankLabel({ rank: 321, total: 422, topPercent: 77 })).toBe("중하위권");
    expect(overallRankLabel({ rank: 422, total: 422, topPercent: 100 })).toBe("중하위권");
  });

  it("국내 전 회사 — 라벨은 '{N}위'·'중위권'·'중하위권' 셋 중 하나이고 경계는 topPercent 50", () => {
    for (const c of domestic) {
      const rank = getOverallRank(c)!;
      const label = overallRankLabel(rank);
      if (rank.topPercent <= 50) expect(label).toBe(`${rank.rank.toLocaleString("ko-KR")}위`);
      else expect(["중위권", "중하위권"]).toContain(label);
    }
  });
});

describe("getIndustryRanking — 국내 업종 순위", () => {
  it("글로벌 기업은 null", () => {
    for (const g of globals) {
      expect(getIndustryRanking(g)).toBeNull();
    }
  });

  it("삼성전자 반도체 업종 순위 표에 nvidia가 없다", () => {
    const samsung = allCompanies.find((c) => c.id === "samsung-electronics")!;
    const ranking = getIndustryRanking(samsung);
    expect(ranking).not.toBeNull();
    expect(ranking!.rows.some((r) => r.company.isGlobal)).toBe(false);
    expect(ranking!.rows.some((r) => r.company.id === "nvidia")).toBe(false);
  });
});

describe("getIndustryBenchmark — percentBelow/topPercent 극성", () => {
  it("업종 1위 회사: percentBelow 높고 topPercent 낮다 (상위 0% 불가)", () => {
    const samsung = allCompanies.find((c) => c.id === "samsung-electronics")!;
    const ranking = getIndustryRanking(samsung)!;
    const top = ranking.rows[0].company;
    const bench = getIndustryBenchmark(top)!;
    expect(bench.topPercent).toBeGreaterThanOrEqual(1);
    expect(bench.topPercent).toBeLessThanOrEqual(50);
    expect(bench.percentBelow).toBeGreaterThanOrEqual(50);
    // 극성 항등식: topPercent = max(1, 100 - percentBelow)
    expect(bench.topPercent).toBe(Math.max(1, 100 - bench.percentBelow));
  });

  it("글로벌 기업은 null", () => {
    for (const g of globals) {
      expect(getIndustryBenchmark(g)).toBeNull();
    }
  });
});

describe("getSimilarSalaryCompanies — 비슷한 연봉대", () => {
  it("후보에 글로벌 기업이 없고 전부 ±15% 밴드 안이다", () => {
    const samsung = allCompanies.find((c) => c.id === "samsung-electronics")!;
    const target = entryTotal(samsung);
    const similar = getSimilarSalaryCompanies(samsung, 10);
    for (const c of similar) {
      expect(c.isGlobal).toBeFalsy();
      const t = entryTotal(c);
      expect(t).toBeGreaterThanOrEqual(target * 0.85);
      expect(t).toBeLessThanOrEqual(target * 1.15);
    }
  });
});
