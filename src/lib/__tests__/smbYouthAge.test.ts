// 중소기업 취업자 감면 청년 연령 판정 회귀 가드 (2026-10-05 감사 code7-02)
// 실제 만 나이는 입력 정수 N 이상 N+1 미만이라 환산 연령(N − 병역 개월/12)이 34 초과 35 미만이면 생일에 따라
// 근로계약일 현재 만 34세 이하(조특법 시행령 제27조 — 병역 최대 6년 차감)일 수 있다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { youthAgeVerdict } from "@/lib/smbTaxBreak";

describe("youthAgeVerdict", () => {
  it("충족 판정은 종전과 같다", () => {
    expect(youthAgeVerdict(29, 0)).toBe("eligible");
    expect(youthAgeVerdict(34, 0)).toBe("eligible");
    expect(youthAgeVerdict(35, 13)).toBe("eligible");
    expect(youthAgeVerdict(36, 24)).toBe("eligible");
  });
  it("환산 34~35세 구간은 생일에 따라 충족 가능 (종전 일률 미충족)", () => {
    expect(youthAgeVerdict(36, 21)).toBe("birthday");
    expect(youthAgeVerdict(36, 18)).toBe("birthday");
    expect(youthAgeVerdict(35, 6)).toBe("birthday");
    expect(youthAgeVerdict(35, 1)).toBe("birthday");
    expect(youthAgeVerdict(37, 26)).toBe("birthday");
  });
  it("환산 35세 이상은 미충족 — 병역은 72개월까지만 차감", () => {
    expect(youthAgeVerdict(35, 0)).toBe("ineligible");
    expect(youthAgeVerdict(36, 12)).toBe("ineligible");
    expect(youthAgeVerdict(36, 6)).toBe("ineligible");
    expect(youthAgeVerdict(42, 100)).toBe("ineligible"); // 42 − 6 = 36
  });
  it("화면은 판정 함수를 쓰고 구간 문구를 따로 보여준다", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/calc/smb-income-tax-break/Client.tsx"), "utf8");
    expect(src).toContain("youthAgeVerdict(parseInput(age), parseInput(militaryMonths))");
    expect(src).toContain("생일에 따라 충족 가능");
  });
});
