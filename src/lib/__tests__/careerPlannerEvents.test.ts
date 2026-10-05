// 커리어 플래너 — 같은 해 이벤트 여러 개를 모두 적용 (2026-10-05 감사 code38-02)
import { describe, expect, it } from "vitest";
import { runCareerSimulation, type CareerSimulationInput } from "@/lib/careerPlanner";

const base: CareerSimulationInput = {
  currentAge: 30,
  simulationYears: 3,
  initialSalary: 50_000_000,
  initialAssets: 0,
  baseSalaryIncreasePercent: 0,
  inflationPercent: 0,
  investmentReturnPercent: 0,
  events: [],
};

describe("runCareerSimulation 같은 해 이벤트", () => {
  it("승진 + 사이드 프로젝트가 같은 해면 둘 다 반영 (종전 뒤 이벤트가 앞 이벤트를 덮음)", () => {
    const r = runCareerSimulation({
      ...base,
      events: [
        { year: 1, type: "promotion", description: "승진", salaryIncreasePercent: 10 },
        { year: 1, type: "side_project", description: "사이드", initialAnnualIncome: 6_000_000, growthRatePercent: 0 },
      ],
    });
    expect(r[1].salary).toBeCloseTo(55_000_000, 0);
    expect(r[1].sideIncome).toBe(6_000_000);
    expect(r[1].eventDescription).toBe("승진 · 사이드");
  });
  it("이벤트 하나면 종전과 같다", () => {
    const r = runCareerSimulation({ ...base, events: [{ year: 2, type: "job_change", description: "이직", newSalary: 70_000_000 }] });
    expect(r[2].salary).toBe(70_000_000);
    expect(r[2].eventDescription).toBe("이직");
    expect(r[0].eventDescription).toBeUndefined();
  });
});
