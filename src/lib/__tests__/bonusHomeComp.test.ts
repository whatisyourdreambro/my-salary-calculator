// /calc/bonus-home-plan 보상 엔진 회귀 (2026-09-27)
// 풀 분배·PS 산식은 기존 계산기(samsung-bonus model·sk-hynix-bonus Client)와 같은 값인지, 세후는 사이트 공통 엔진
// 호출 그대로인지, 지급 시점(삼성 1/3 잠금 해제·SK 50/30/10/10)이 맞는지 본다.
import { describe, expect, it } from "vitest";
import {
  calcSamsungBonusNet,
  computeDivisionPool,
  defaultDivisionCounts,
  defaultDivisionRatios,
} from "@/app/calc/samsung-bonus/model";
import { calcBonusNet } from "@/lib/bonusTaxCalc";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";
import {
  computeComp,
  DEFAULT_WAGE_GROWTH_PCT,
  defaultTaiBaseMonthly,
  SAMSUNG_OPI1_DEFAULT_PCT,
  SAMSUNG_WAGE_2026,
  samsungOpi2,
  samsungTaiRatePct,
  SK_PI_DEFAULT_PCT,
  SK_PS_2025_PCT,
  skPs,
  type CompInputs,
} from "@/lib/bonusHome/compEngines";
import { companyScenarioOps } from "@/lib/bonusHome/scenarios";

const samsungBase = (over: Partial<CompInputs> = {}): CompInputs => ({
  company: "samsung",
  division: "memory",
  salary0: 80_000_000,
  wageGrowthPct: 6.2,
  ops: companyScenarioOps("samsung", "base"),
  opi1Pct: SAMSUNG_OPI1_DEFAULT_PCT,
  taiBaseMonthly0: defaultTaiBaseMonthly(80_000_000),
  piPct: 150,
  customBonusPct: 0,
  stockGrowthPct: 0,
  ...over,
});
const skBase = (over: Partial<CompInputs> = {}): CompInputs => ({
  ...samsungBase(),
  company: "sk",
  salary0: 100_000_000,
  wageGrowthPct: 6.3,
  ops: companyScenarioOps("sk", "base"),
  ...over,
});

describe("기본값 — 출처 있는 정책 숫자만", () => {
  it("인상률: 삼성 4.1 + 2.1 = 6.2(보도 기준) · SK 6.3(psData) · 직접 0", () => {
    expect(SAMSUNG_WAGE_2026.basePct + SAMSUNG_WAGE_2026.meritAvgPct).toBeCloseTo(SAMSUNG_WAGE_2026.totalPct, 10);
    expect(DEFAULT_WAGE_GROWTH_PCT).toEqual({ samsung: 6.2, sk: 6.3, custom: 0 });
  });
  it("OPI1 47%(2025년분 DS부문 공통) · TAI 메모리 100 · 공통 100 · 파운드리 75 · 월기본급 = 연봉 × 60% ÷ 12", () => {
    expect(SAMSUNG_OPI1_DEFAULT_PCT).toBe(47);
    expect([samsungTaiRatePct("memory"), samsungTaiRatePct("common"), samsungTaiRatePct("foundry")]).toEqual([100, 100, 75]);
    expect(defaultTaiBaseMonthly(80_000_000)).toBe(4_000_000);
    expect(defaultTaiBaseMonthly(0)).toBe(0);
  });
  it("SK PI 기본(가정): 보수 100 · 기본·낙관 150 · 2025년분 PS 2,964%", () => {
    expect(SK_PI_DEFAULT_PCT).toEqual({ conservative: 100, base: 150, optimistic: 150, custom: 150 });
    expect(SK_PS_2025_PCT).toBe(2964);
  });
});

describe("삼성 특별경영성과급(OPI2) — model.computeDivisionPool 과 같은 값", () => {
  it("350조·메모리·연봉 8천만 = 68,684.57만원 (model.test 고정값)", () => {
    const pool = computeDivisionPool(350, defaultDivisionCounts(), defaultDivisionRatios(), true);
    const memory = pool.perDivision.find((d) => d.id === "memory")!;
    expect(memory.total).toBeCloseTo(68_684.57, 1);
    expect(samsungOpi2(350, 2026, "memory", 80_000_000)).toBeCloseTo(memory.total * 10_000, 0);
    // 연봉 비례 — 1억 6천이면 2배
    expect(samsungOpi2(350, 2026, "memory", 160_000_000)).toBeCloseTo(memory.total * 20_000, 0);
  });

  it("임계값 절벽: 2026~28 200조, 2029~ 100조 미달이면 0", () => {
    expect(samsungOpi2(199.9, 2026, "memory", 80_000_000)).toBe(0);
    expect(samsungOpi2(200, 2026, "memory", 80_000_000)).toBeGreaterThan(0);
    expect(samsungOpi2(199.9, 2028, "memory", 80_000_000)).toBe(0);
    expect(samsungOpi2(100, 2029, "memory", 80_000_000)).toBeGreaterThan(0);
    expect(samsungOpi2(99.9, 2030, "memory", 80_000_000)).toBe(0);
    expect(samsungOpi2(350, 2025, "memory", 80_000_000)).toBe(0); // 2025년분은 제도 전
  });

  it("보수 시나리오 [220.1, 154, 107.8, 75.5, 52.8] → 2027년 1월분만 지급, 2028~2031년 지급분(2027~2030년 실적)은 0", () => {
    const r = computeComp(samsungBase({ ops: companyScenarioOps("samsung", "conservative") }));
    expect(r.years[0].components[1].gross).toBeGreaterThan(0);
    expect(r.years.slice(1).map((y) => y.components[1].gross)).toEqual([0, 0, 0, 0]);
  });
});

describe("설계 대조값 — 삼성 메모리·연봉 8천만·인상 6.2%·기본 시나리오", () => {
  const r = computeComp(samsungBase());
  const y27 = r.years[0];
  it("2026년 실적분 특별경영성과급 약 5.76억", () => {
    expect(y27.components[1].gross / 1e8).toBeCloseTo(5.76, 2);
  });
  it("2027년 성과급 세전 약 6.22억(OPI 3,760만 + 특별 5.76억 + TAI 849.6만), 세후 약 3.41억(공제율 약 45%)", () => {
    expect(y27.components[0].gross).toBeCloseTo(37_600_000, 0);
    expect(y27.components[2].gross).toBeCloseTo(8_496_000, 0);
    expect(y27.gross / 1e8).toBeCloseTo(6.22, 2);
    expect(y27.net / 1e8).toBeCloseTo(3.41, 2);
    expect(y27.effRate).toBeGreaterThan(44);
    expect(y27.effRate).toBeLessThan(46);
  });
  it("세후는 calcSamsungBonusNet(그해 연봉, 그해 성과급 세전, 0, true) 그대로", () => {
    for (const y of r.years) expect(y.net).toBe(calcSamsungBonusNet(y.salary, y.gross, 0, true).net);
  });
  it("특별경영성과급 세후 자사주 1/3 즉시 · 1/3 1년 · 1/3 2년 잠금", () => {
    const ratio = y27.net / y27.gross;
    const opi2Net = y27.components[1].gross * ratio;
    expect(y27.liquidNet).toBeCloseTo((y27.components[0].gross + y27.components[2].gross) * ratio + opi2Net / 3, 3);
    expect(y27.lockedHeldValue).toBeCloseTo((opi2Net * 2) / 3, 3);
    const y28 = r.years[1];
    const opi2Net28 = y28.components[1].gross * (y28.net / y28.gross);
    expect(y28.unlockedValue).toBeCloseTo(opi2Net / 3, 3);
    expect(r.years[2].unlockedValue).toBeCloseTo(opi2Net / 3 + opi2Net28 / 3, 3);
    // 2030·2031년 부여분의 잠금 해제는 2032·2033년 — '이후 수령분'
    expect(r.afterHorizon.map((a) => a.year)).toEqual([2032, 2033]);
  });
  it("주가 변동 가정은 잠금 주식 가치에만 — 10%면 1년 뒤 해제분 × 1.1", () => {
    const g = computeComp(samsungBase({ stockGrowthPct: 10 }));
    const ratio = g.years[0].net / g.years[0].gross;
    expect(g.years[1].unlockedValue).toBeCloseTo(((g.years[0].components[1].gross * ratio) / 3) * 1.1, 3);
    expect(g.years[0].net).toBe(r.years[0].net); // 세금은 부여 시점 기준 — 주가 가정과 무관
  });
  it("2026년 받은 성과급(2027년 DSR 소득) = 2025년분 OPI 47% × 2025 연봉 + 2026 TAI(상반기율 × 2)", () => {
    expect(r.gross2026.salary).toBe(80_000_000);
    expect(r.gross2026.bonus).toBeCloseTo((80_000_000 / 1.062) * 0.47 + 4_000_000 * 2, 3);
  });
});

describe("SK하이닉스 PS·PI", () => {
  it("PS = 영업이익 × 10% ÷ 34,549명 × 연봉/1억 — 250조·1억이면 250e12 × 0.1 / 34,549", () => {
    expect(skPs(250, 100_000_000)).toBeCloseTo((250e12 * 0.1) / 34_549, 3);
    expect(skPs(-7.7, 100_000_000)).toBe(0);
  });
  it("설계 대조값: 1억·기본(196.4조) PS 약 5.68억", () => {
    expect(skPs(196.4, 100_000_000) / 1e8).toBeCloseTo(5.68, 2);
  });

  it("지급 시점 50/30/10/10 + 2025년분 구 체계 이연 현금 10%p × 2", () => {
    const ops = [200, 0, 0, 0, 0];
    const r = computeComp(skBase({ ops, wageGrowthPct: 0, piPct: 0 }));
    const ps26 = skPs(200, 100_000_000);
    const ps25 = (2964 / 100) * (100_000_000 / 20);
    const [y27, y28, y29, y30, y31] = r.years;
    expect(y27.components[0].gross).toBeCloseTo(ps26 * 0.5 + ps25 * 0.1, 3);
    expect(y27.components[1].gross).toBeCloseTo(ps26 * 0.3, 3);
    expect(y28.components[0].gross).toBeCloseTo(ps25 * 0.1, 3);
    expect(y28.components[1].gross).toBeCloseTo(ps26 * 0.1, 3);
    expect(y29.components[0].gross).toBe(0);
    expect(y29.components[1].gross).toBeCloseTo(ps26 * 0.1, 3);
    expect(y30.gross).toBe(0);
    expect(y31.gross).toBe(0);
    for (const y of r.years) expect(y.components[2].gross).toBe(0); // PI 0%
  });

  it("이연 주식은 주가 가정 반영(1년 × 1.1, 2년 × 1.21), PI 는 전년 하반기분 + 그해 상반기분", () => {
    const r = computeComp(skBase({ ops: [200, 0, 0, 0, 0], wageGrowthPct: 0, piPct: 150, stockGrowthPct: 10 }));
    const ps26 = skPs(200, 100_000_000);
    expect(r.years[1].components[1].gross).toBeCloseTo(ps26 * 0.1 * 1.1, 3);
    expect(r.years[2].components[1].gross).toBeCloseTo(ps26 * 0.1 * 1.21, 3);
    expect(r.years[0].components[2].gross).toBeCloseTo((100_000_000 / 20) * 1.5 * 2, 3);
  });

  it("세후는 calcBonusNet(그해 연봉, 그해 받은 성과급, 0, true, 2026 요율) 그대로, 전액 현금화 가능", () => {
    const r = computeComp(skBase());
    for (const y of r.years) {
      expect(y.net).toBe(calcBonusNet(y.salary, y.gross, 0, true, INSURANCE_RATES_2026).net);
      expect(y.liquidNet).toBe(y.net);
    }
  });

  it("2026년 받은 성과급 = 2025년분 PS 80% + 2025 하반기 PI 150% + 2026 상반기 PI 150%", () => {
    const r = computeComp(skBase({ wageGrowthPct: 0 }));
    const basic = 100_000_000 / 20;
    expect(r.gross2026.bonus).toBeCloseTo(29.64 * basic * 0.8 + basic * 1.5 + basic * 1.5, 3);
  });
});

describe("직접 입력", () => {
  it("전년 연봉 × % 를 1월에 현금으로, calcBonusNet 2026 요율", () => {
    const r = computeComp({ ...samsungBase(), company: "custom", salary0: 60_000_000, wageGrowthPct: 0, customBonusPct: 20 });
    for (const y of r.years) {
      expect(y.gross).toBeCloseTo(12_000_000, 6);
      expect(y.net).toBe(calcBonusNet(60_000_000, 12_000_000, 0, true, INSURANCE_RATES_2026).net);
      expect(y.components[1].label).toBe("—");
    }
  });
});

describe("경계 입력 — NaN·Infinity 가 결과로 새지 않는다", () => {
  const bad: Partial<CompInputs>[] = [
    { salary0: 0 },
    { salary0: Number.NaN },
    { salary0: 9_999_999_999_999 },
    { ops: [Number.NaN, -5, 0, 1e6, 0] },
    { wageGrowthPct: Number.NaN, opi1Pct: Number.NaN, taiBaseMonthly0: Number.NaN, piPct: Number.NaN, stockGrowthPct: Number.NaN },
  ];
  for (const company of ["samsung", "sk", "custom"] as const) {
    for (const over of bad) {
      it(`${company} ${JSON.stringify(over)}`, () => {
        const r = computeComp({ ...samsungBase(over), company, customBonusPct: 30 });
        const nums = [
          r.fiveYearNet,
          r.fiveYearGrossComp,
          r.gross2026.bonus,
          r.gross2026.salary,
          ...r.years.flatMap((y) => [y.salary, y.gross, y.net, y.effRate, y.liquidNet, y.unlockedValue, y.lockedHeldValue, ...y.components.map((c) => c.gross)]),
        ];
        for (const n of nums) expect(Number.isFinite(n)).toBe(true);
      });
    }
  }
});
