// 통상임금·연차 계산 검증 — 고용노동부·대법원 공식 예시 대조 (2026-08-30 리서치 검증분)
import { describe, expect, it } from "vitest";
import { computeOrdinaryWage } from "../ordinaryWage";
import {
  statutoryLeaveDays,
  entryBasedSchedule,
  fiscalYearSchedule,
  totalDays,
} from "../annualLeave";

describe("computeOrdinaryWage — 시행령 6조·전합 판결 예시", () => {
  // 예시 A: 기본급 300만 + 고정수당 20만 + 연 정기상여 240만
  const r = computeOrdinaryWage({
    monthlyBase: 3_000_000,
    monthlyFixedAllowance: 200_000,
    annualBonus: 2_400_000,
  });

  it("월 통상임금 = 340만 (연 상여 ÷12 월할 산입)", () => {
    expect(r.monthlyOrdinary).toBe(3_400_000);
  });
  it("시간급 = 340만 ÷ 209 ≈ 16,268원", () => {
    expect(Math.round(r.hourly)).toBe(16_268);
  });
  it("1일(8h) ≈ 130,144원", () => {
    expect(Math.round(r.daily)).toBe(130_144);
  });
  it("연장 1h = ×1.5 ≈ 24,402원", () => {
    expect(Math.round(r.overtimeHourly)).toBe(24_402);
  });
  it("휴일 10h = 8h×1.5 + 2h×2.0 ≈ 260,287원", () => {
    expect(Math.round(r.holiday8hPay + 2 * r.holidayOver8Hourly)).toBe(260_287);
  });
  it("연차수당 5일 ≈ 650,718원", () => {
    expect(Math.round(r.annualLeaveDaily * 5)).toBe(650_718);
  });
});

describe("statutoryLeaveDays — 근로기준법 60조 매핑", () => {
  it.each([
    [1, 15],
    [2, 15],
    [3, 16],
    [5, 17],
    [7, 18],
    [19, 24],
    [21, 25],
    [30, 25],
  ])("만 %i년 → %i일", (years, expected) => {
    expect(statutoryLeaveDays(years)).toBe(expected);
  });
});

describe("entryBasedSchedule — 입사일 기준", () => {
  it("10개월 개근 시점까지 → 월차 10일", () => {
    const g = entryBasedSchedule("2025-01-01", "2025-11-01");
    expect(totalDays(g)).toBe(10);
  });
  it("정확히 365일 근무 후 퇴직 → 11일 (15일 미발생, 2021다227100)", () => {
    // 2024-01-01 입사, 2024-12-31 마지막 재직 — 만 1년 '다음 날' 미재직
    const g = entryBasedSchedule("2024-01-01", "2024-12-31");
    expect(totalDays(g)).toBe(11);
    expect(g.every((x) => x.days === 1)).toBe(true);
  });
  it("366일째(만 1년 다음 날) 재직 → 11 + 15 = 26일", () => {
    const g = entryBasedSchedule("2024-01-01", "2025-01-01");
    expect(totalDays(g)).toBe(26);
  });
  it("만 7년 근속자의 7년차 발생분 = 18일", () => {
    const g = entryBasedSchedule("2019-03-01", "2026-03-01");
    const last = g[g.length - 1];
    expect(last.label).toBe("만 7년");
    expect(last.days).toBe(18);
  });
});

describe("fiscalYearSchedule — 회계연도 기준 (근기 68207-620)", () => {
  it("2025-07-01 입사 → 2026-01-01 비례연차 = 15×(184÷365) = 7.56일", () => {
    const g = fiscalYearSchedule("2025-07-01", "2026-01-01");
    const prorated = g.find((x) => x.label === "비례연차");
    expect(prorated?.days).toBe(7.56);
  });
  it("2025-10-01 입사 → 2026-01-01 비례연차 = 15×(92÷365) = 3.78일", () => {
    const g = fiscalYearSchedule("2025-10-01", "2026-01-01");
    const prorated = g.find((x) => x.label === "비례연차");
    expect(prorated?.days).toBe(3.78);
  });
  it("입사 다다음해 1/1부터 15일 부여", () => {
    const g = fiscalYearSchedule("2025-07-01", "2027-01-01");
    const second = g.find((x) => x.label === "2027년 부여");
    expect(second?.days).toBe(15);
  });
});

// 2026-10-05 감사 code37-08 — 민법 제160조 제3항(해당일 없는 달은 말일 만료 → 다음 날 발생), 비례연차 15일 상한
describe("연차 발생일 — 마지막 달에 해당일이 없을 때", () => {
  it("3/31 입사 첫 월차는 4/30 이 아니라 5/1 발생", () => {
    const g = entryBasedSchedule("2026-03-31", "2026-05-01");
    expect(g[0].grantDate).toBe("2026-05-01");
    // 4/30 에 퇴사하면 첫 월차는 아직 발생하지 않는다
    expect(entryBasedSchedule("2026-03-31", "2026-04-30")).toHaveLength(0);
  });
  it("2024-02-29 입사의 만 1년 발생일은 2025-03-01", () => {
    const g = entryBasedSchedule("2024-02-29", "2025-03-01");
    expect(g.find((x) => x.label === "만 1년")?.grantDate).toBe("2025-03-01");
  });
  it("보통 날짜는 종전과 같다 (3/15 입사 → 4/15 발생)", () => {
    expect(entryBasedSchedule("2026-03-15", "2026-04-15")[0].grantDate).toBe("2026-04-15");
  });
  it("윤년 1/1 입사의 비례연차는 15일을 넘지 않는다 (종전 15.04)", () => {
    const g = fiscalYearSchedule("2024-01-01", "2025-01-01");
    expect(g.find((x) => x.label === "비례연차")?.days).toBe(15);
  });
});
