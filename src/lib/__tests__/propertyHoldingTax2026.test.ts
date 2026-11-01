// /property-holding-tax-2026 회귀 가드 (2026-10-05 감사 code15-02)
// 출처(law.go.kr): 지방세법 제113조 제2항(주택 재산세는 주택별 세율), 제111조의2(1세대 1주택 특례세율,
// 2026.12.28 까지 성립 납세의무), 지방세법 시행령 제109조 제1항 제2호(2026년도 1세대 1주택 43/44/45%),
// 종합부동산세법 제8조·제9조(인별 합계 9억/12억 공제, 2주택 이하 일반세율)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calcComprehensiveTax, calcHoldingTax2026, calcPropertyTax } from "@/lib/propertyHoldingTax2026";

describe("재산세는 주택별, 종부세는 합계", () => {
  it("6억 2채(합계 12억) — 재산세 810,000 x 2, 종부세 (12억-9억) x 60% x 0.5%", () => {
    const r = calcHoldingTax2026(1_200_000_000, 2, false);
    expect(calcPropertyTax(600_000_000, false)).toBe(810_000);
    expect(r.propertyTax).toBe(1_620_000); // 종전 2,250,000 (합계에 누진세율)
    expect(r.educationTax).toBe(324_000);
    expect(r.comprehensiveTax).toBe(900_000);
    expect(r.total).toBe(1_620_000 + 324_000 + 900_000);
  });
  it("2주택 이상은 주택 수에 따라 결과가 달라진다 (종전 2~5 동일)", () => {
    const totals = [2, 3, 4, 5].map((n) => calcHoldingTax2026(1_500_000_000, n, true).propertyTax);
    expect(new Set(totals).size).toBe(4);
  });
  it("기본값(10억·1세대 1주택)은 종전과 같다 — 재산세 1,170,000, 종부세 0", () => {
    const r = calcHoldingTax2026(1_000_000_000, 1, true);
    expect(r.propertyTax).toBe(1_170_000);
    expect(r.comprehensiveTax).toBe(0);
    expect(r.total).toBe(1_404_000);
  });
  it("1주택이지만 1세대 1주택 아님 — 공제 9억·일반 60%", () => {
    const r = calcHoldingTax2026(1_000_000_000, 1, false);
    expect(r.comprehensiveTax).toBe(calcComprehensiveTax(1_000_000_000, false));
    expect(r.comprehensiveTax).toBe(300_000);
  });
});

describe("화면 — 2주택 이상은 합계 입력 안내, 기본(1주택) 문구 유지", () => {
  const src = readFileSync(resolve(process.cwd(), "src/app/property-holding-tax-2026/PropertyHoldingTaxClient.tsx"), "utf8");
  it("기본 상태 문구는 그대로", () => {
    expect(src).toContain('"주택 공시가격 (원)"');
    expect(src).toContain('"(공시가격과 시세는 다릅니다. 실제 시세는 별도로 확인하세요)"');
    // 안내 문구가 {식} 으로 바뀌어도 '만원 (' 사이 공백 유지 — 줄바꿈 뒤 공백은 JSX 가 지우므로 {" "} 로 명시
    expect(src).toMatch(/만원\{" "\}\s*\n/);
  });
  it("2주택 이상 문구는 기본 문구보다 길지 않다 (결과 광고 위 높이)", () => {
    const hangul = (s: string) => [...s].filter((c) => /[가-힣]/.test(c)).length;
    expect(src).toContain('"공시가격 합계 (원)"');
    expect(hangul("공시가격 합계 (원)")).toBeLessThanOrEqual(hangul("주택 공시가격 (원)"));
    expect(src).toContain('"(주택마다 공시가격이 같다고 보고 재산세를 집별로 계산)"');
    expect(hangul("(주택마다 공시가격이 같다고 보고 재산세를 집별로 계산)")).toBeLessThanOrEqual(
      hangul("(공시가격과 시세는 다릅니다. 실제 시세는 별도로 확인하세요)")
    );
  });
  it("인라인 산식 대신 lib 를 쓴다", () => {
    expect(src).toContain("calcHoldingTax2026(publishedValue, numHomes, isOnlyOneHome)");
    expect(src).not.toContain("function calcPropertyTax");
  });
});
