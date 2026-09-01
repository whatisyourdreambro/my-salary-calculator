// 배당·이자(금융소득) 과세 엔진 회귀 테스트 (2026-09-01 신설)
//
// 목적: 소득세법 제62조 비교과세의 경계값과 하한 보장 성질이 회귀하지 않는지 잡는다.
// golden 값은 현행법(기준금액 2,000만원·원천징수 14%·지방소득세 10%·TAX_BRACKETS_2026) 기준 —
// 법 개정으로 의도적으로 바뀌면 함께 갱신할 것.
import { describe, it, expect } from "vitest";

import {
  calcDividendTax,
  progressiveTax,
  FINANCIAL_INCOME_THRESHOLD,
} from "@/lib/dividendTax";
import { TAX_BRACKETS_2026 } from "@/lib/taxConstants2026";

describe("progressiveTax — 소득세법 제55조 누진공제", () => {
  it("0 이하는 0", () => {
    expect(progressiveTax(0)).toBe(0);
    expect(progressiveTax(-1_000_000)).toBe(0);
  });

  it("1구간 경계 1,400만원 = 84만원", () => {
    expect(progressiveTax(14_000_000)).toBe(840_000);
  });

  it("2구간 경계 5,000만원 = 624만원", () => {
    expect(progressiveTax(50_000_000)).toBe(6_240_000);
  });

  it("구간 경계에서 세액이 연속이다 (누진공제가 맞게 설정됨)", () => {
    for (let i = 0; i < TAX_BRACKETS_2026.length - 1; i++) {
      const limit = TAX_BRACKETS_2026[i].limit;
      const below = progressiveTax(limit);
      const above = progressiveTax(limit + 1);
      // 1원 차이에 세액이 튀지 않아야 한다 (허용 오차 1원 미만)
      expect(Math.abs(above - below)).toBeLessThan(1);
    }
  });
});

describe("calcDividendTax — 2,000만원 이하 분리과세", () => {
  it("배당 1,500만원 → 15.4% 원천징수로 종결", () => {
    const r = calcDividendTax(0, 15_000_000, 0);
    expect(r.isComprehensive).toBe(false);
    expect(r.incomeTax).toBe(2_100_000);
    expect(r.localTax).toBe(210_000);
    expect(r.total).toBe(2_310_000);
    expect(r.effectiveRate).toBeCloseTo(15.4, 6);
  });

  it("정확히 2,000만원은 아직 분리과세 (기준금액 '초과'부터 종합과세)", () => {
    const r = calcDividendTax(0, FINANCIAL_INCOME_THRESHOLD, 0);
    expect(r.isComprehensive).toBe(false);
    expect(r.total).toBe(3_080_000);
  });

  it("2,000만원 + 1원부터 종합과세 대상", () => {
    expect(calcDividendTax(0, FINANCIAL_INCOME_THRESHOLD + 1, 0).isComprehensive).toBe(true);
  });

  it("분리과세 구간에서는 기타 종합소득이 결과를 바꾸지 않는다", () => {
    const a = calcDividendTax(0, 15_000_000, 0);
    const b = calcDividendTax(0, 15_000_000, 200_000_000);
    expect(b.total).toBe(a.total);
  });

  it("이자와 배당은 합산해서 기준금액을 판정한다", () => {
    // 각각은 2,000만원 이하지만 합치면 초과
    expect(calcDividendTax(12_000_000, 12_000_000, 0).isComprehensive).toBe(true);
  });
});

describe("calcDividendTax — 소득세법 제62조 비교과세", () => {
  it("기타소득 0이면 분리과세 상당(②)이 커서 그 값이 채택된다", () => {
    const r = calcDividendTax(0, 30_000_000, 0);
    // ① progressiveTax(1,000만) + 2,000만×14% = 60만 + 280만 = 340만
    expect(r.methodA).toBe(3_400_000);
    // ② 3,000만×14% + 0 = 420만
    expect(r.methodB).toBe(4_200_000);
    expect(r.incomeTax).toBe(4_200_000);
    expect(r.total).toBe(4_620_000);
  });

  it("기타 종합소득이 크면 종합과세 방식(①)이 채택된다", () => {
    const r = calcDividendTax(0, 50_000_000, 100_000_000);
    // ① progressiveTax(1억3,000만) + 280만 = 3,006만 + 280만 = 3,286만
    expect(r.methodA).toBe(32_860_000);
    // ② 5,000만×14% + progressiveTax(1억) = 700만 + 1,956만 = 2,656만
    expect(r.methodB).toBe(26_560_000);
    expect(r.incomeTax).toBe(32_860_000);
    expect(r.localTax).toBe(3_286_000);
    expect(r.total).toBe(36_146_000);
  });

  it("산출세액은 항상 두 방식 중 큰 값이다", () => {
    for (const [fin, other] of [
      [25_000_000, 0],
      [40_000_000, 30_000_000],
      [100_000_000, 80_000_000],
      [300_000_000, 500_000_000],
    ] as const) {
      const r = calcDividendTax(0, fin, other);
      expect(r.incomeTax).toBe(Math.max(r.methodA, r.methodB));
    }
  });

  it("하한 보장 — 종합과세 대상이어도 금융소득 15.4%보다 적게 나올 수 없다", () => {
    // 제62조 ②가 금융소득 전액 14%를 포함하므로 구조적으로 성립해야 한다
    for (const fin of [20_000_001, 25_000_000, 50_000_000, 500_000_000]) {
      const r = calcDividendTax(0, fin, 0);
      expect(r.total).toBeGreaterThanOrEqual(fin * 0.154 - 1);
    }
  });

  it("지방소득세는 항상 소득세의 10%", () => {
    for (const [fin, other] of [
      [10_000_000, 0],
      [35_000_000, 50_000_000],
      [200_000_000, 300_000_000],
    ] as const) {
      const r = calcDividendTax(0, fin, other);
      // 원 단위 반올림 후이므로 1원 이내 오차를 허용한다
      expect(Math.abs(r.localTax - r.incomeTax * 0.1)).toBeLessThanOrEqual(1);
      expect(r.total).toBe(r.incomeTax + r.localTax);
      expect(Number.isInteger(r.incomeTax)).toBe(true);
      expect(Number.isInteger(r.localTax)).toBe(true);
    }
  });
});

describe("calcDividendTax — 입력 방어", () => {
  it("전부 0이면 세금도 0, 실효세율도 0 (0으로 나누지 않는다)", () => {
    const r = calcDividendTax(0, 0, 0);
    expect(r.total).toBe(0);
    expect(r.effectiveRate).toBe(0);
    expect(Number.isNaN(r.effectiveRate)).toBe(false);
  });

  it("음수 입력은 0으로 클램프한다", () => {
    const r = calcDividendTax(-5_000_000, 10_000_000, -1_000_000);
    expect(r.financial).toBe(10_000_000);
    expect(r.total).toBe(1_540_000);
  });
});
