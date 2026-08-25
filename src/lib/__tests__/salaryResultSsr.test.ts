// src/lib/__tests__/salaryResultSsr.test.ts
//
// /salary/*·/monthly/* SSR 수치 회귀 앵커 (TASK-4).
// 서버 HTML 에 노출되는 결과 카드 수치는 calculateSalary2026 의 값을
// toLocaleString("ko-KR") 로 포맷한 문자열과 정확히 일치해야 한다 —
// qa-crawl(TASK-6)의 (b) 검증과 동일한 산식·포맷을 공유한다.
import { describe, expect, it } from "vitest";

import { calculateSalary2026 } from "@/lib/TaxLogic";

const fmt = (n: number) => n.toLocaleString("ko-KR");

describe("calculateSalary2026 — SSR 노출 수치 앵커", () => {
  it("연봉 5,000만원 기준 필드가 전부 양수이고 합계가 정합", () => {
    const r = calculateSalary2026(50_000_000);
    expect(r.netPay).toBeGreaterThan(0);
    expect(r.nationalPension).toBeGreaterThan(0);
    expect(r.healthInsurance).toBeGreaterThan(0);
    expect(r.employmentInsurance).toBeGreaterThan(0);
    expect(r.incomeTax).toBeGreaterThanOrEqual(0);
    // 총공제 = 항목 합
    expect(r.totalDeductions).toBe(
      r.nationalPension +
        r.healthInsurance +
        r.longTermCare +
        r.employmentInsurance +
        r.incomeTax +
        r.localIncomeTax,
    );
    // 실수령 = 월급(floor) - 총공제 — TaxLogic 의 실제 라운딩 규칙
    expect(r.netPay).toBe(Math.floor(50_000_000 / 12) - r.totalDeductions);
  });

  it("ko-KR 포맷 문자열이 안정적이다 (SSR/클라 동일 렌더 전제)", () => {
    const r = calculateSalary2026(50_000_000);
    // 값 자체는 taxConstants2026 이 바뀌지 않는 한 고정 — 포맷 규칙 앵커
    expect(fmt(r.netPay)).toMatch(/^\d{1,3}(,\d{3})+$/);
    expect(fmt(r.nationalPension)).toMatch(/^\d{1,3}(,\d{3})*$/);
    // 결과 카드의 소득세 행은 incomeTax + localIncomeTax 합산 표기
    expect(fmt(r.incomeTax + r.localIncomeTax)).toMatch(/^\d{1,3}(,\d{3})*$/);
  });
});
