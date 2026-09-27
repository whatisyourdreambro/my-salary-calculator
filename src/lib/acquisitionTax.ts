// src/lib/acquisitionTax.ts
//
// 주택·토지 취득세 산식 — /tools/real-estate/acquisition-tax 페이지(use client)에 있던 함수를 그대로 옮긴 순수 모듈
// (2026-09-27, /calc/bonus-home-plan 이 같은 산식을 재사용). 옮기면서 산식·반환값은 바꾸지 않았다 —
// 회귀: src/lib/__tests__/acquisitionTax.test.ts (1주택·85㎡ 이하 5억·7.5억·10억 고정값).

// 2026 취득세율 — 아파트·단독주택 모두 주택 세율 체계 적용, 토지는 4%
export function calcAcquisitionTax(price: number, isFirst: boolean, type: "apt" | "single" | "land", isOver85: boolean): {
 taxRate: number; tax: number; localEdu: number; agriSpecial: number; total: number; isHeavyHousing: boolean;
} {
 let taxRate = 0.04; // 토지 등 일반 부동산 4%

 if (type === "apt" || type === "single") {
 // 주택 유상취득 표준세율
 if (price <= 600_000_000) {
 taxRate = 0.01; // 6억 이하 1%
 } else if (price <= 900_000_000) {
 // 6억 초과 ~ 9억 이하: 점증 공식 (가액 × 2/3억 − 3) ÷ 100 (소수점 넷째 자리 반올림)
 taxRate = Math.round(((price * 2) / 300_000_000 - 3) * 10000) / 10000 / 100;
 } else {
 taxRate = 0.03; // 9억 초과 3%
 }
 // 2주택 이상 중과 (조정대상지역 2주택·비조정 3주택 기준 8%)
 if (!isFirst) taxRate = 0.08;
 }

 const tax = Math.round(price * taxRate);
 // 다주택 중과(8%) 주택은 부가세 요율이 표준세율 주택과 다르다.
 // 표준(1~3%): 지방교육세 = 취득세액 × 10%, 농특세 = 취득가 × 0.2%(85㎡ 초과)
 // 중과(8%):   지방교육세 = 취득가 × 0.4% 고정, 농특세 = 취득가 × 0.6%(85㎡ 초과)
 // 2026-09-06 전수검사 정정: 중과 구간에도 취득세액 × 10% 를 적용해
 // 지방교육세가 0.8%(2배)로, 농특세는 0.2%(1/3)로 계산되고 있었다.
 // 10억·2주택·85㎡ 이하 기준 합계 8,800만 → 8,400만.
 const isHeavyHousing = (type === "apt" || type === "single") && !isFirst;
 const localEdu = isHeavyHousing
 ? Math.round(price * 0.004)
 : Math.round(tax * 0.1); // 지방교육세
 // 농어촌특별세: 전용면적 85㎡ 초과 주택만 부과 (85㎡ 이하 면제)
 const agriSpecial =
 (type === "apt" || type === "single") && isOver85
 ? Math.round(price * (isHeavyHousing ? 0.006 : 0.002))
 : 0;
 const total = tax + localEdu + agriSpecial;

 return { taxRate: taxRate * 100, tax, localEdu, agriSpecial, total, isHeavyHousing };
}
