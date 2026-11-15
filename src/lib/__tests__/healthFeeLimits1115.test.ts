// N2-app-pages-03 (2026-11-15 감사 app-pages-b03-F04) — /health-insurance-fee-2026 직장가입자 월 상·하한 회귀 가드.
// 직장가입자 계산이 3.595% 에 상·하한 없이 곱했다. 보건복지부고시 제2025-222호(2026-01-01 시행) 직장가입자 보수월액보험료
// 월 상한 9,183,480원·하한 20,160원(근로자 몫은 절반 4,591,740원·10,080원, nhis.or.kr 고시 전문 2026-11-15 확인).
// 기본 상태(보수월액 400만원 -> 143,800원)와 화면 문구는 그대로다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { employeeHealthFee2026 } from "@/app/health-insurance-fee-2026/HealthInsuranceFeeClient";
import { HEALTH_PREMIUM_LIMITS_2026 } from "@/lib/guides/bonusNetFigures2026";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const flat = (s: string) => s.replace(/\s+/g, " ");

describe("/health-insurance-fee-2026 직장가입자 월 상·하한", () => {
  const src = readSrc("src/app/health-insurance-fee-2026/HealthInsuranceFeeClient.tsx");

  it("상·하한 상수는 고시 합계의 절반이고 사이트 정본 값과 같다", () => {
    expect(src).toContain("const EMPLOYEE_HEALTH_FEE_CAP_2026 = 9_183_480 / 2;");
    expect(src).toContain("const EMPLOYEE_HEALTH_FEE_FLOOR_2026 = 20_160 / 2;");
    expect(HEALTH_PREMIUM_LIMITS_2026.MONTHLY_CAP_TOTAL).toBe(9_183_480);
    expect(HEALTH_PREMIUM_LIMITS_2026.MONTHLY_FLOOR_TOTAL).toBe(20_160);
  });

  it("클라이언트는 bonusNetFigures2026 을 import 하지 않는다(번들 유입 방지)", () => {
    expect(src).not.toMatch(/from\s+["']@\/lib\/guides\/bonusNetFigures2026["']/);
    expect(src).not.toMatch(/from\s+["']@\/lib\/bonusTaxCalc["']/);
  });

  it("직장가입자 분기는 상·하한을 적용한 값에 장기요양을 곱한다", () => {
    expect(flat(src)).toContain(
      "const healthFee = employeeHealthFee2026(monthlyWage); const longTermCare = healthFee * 0.1314;",
    );
  });

  it.each([
    [4_000_000, 143_800],
    [200_000, 10_080],
    [150_000_000, 4_591_740],
    [0, 0],
    [-100, 0],
  ])("보수월액 %d원 -> 근로자 몫 %d원", (wage, fee) => {
    expect(employeeHealthFee2026(wage)).toBeCloseTo(fee, 6);
  });

  it("상한 경계(약 1억 2,772만원) 위아래가 연속이다", () => {
    const capWage = HEALTH_PREMIUM_LIMITS_2026.MONTHLY_CAP_TOTAL / 2 / 0.03595;
    expect(employeeHealthFee2026(capWage - 1000)).toBeLessThan(4_591_740);
    expect(employeeHealthFee2026(capWage + 1000)).toBe(4_591_740);
  });
});
