// 삼성 성과급 계산 엔진 회귀 테스트 (2026-09-21 S2-0 배치 선커밋 게이트 — 10배 계획 L13b).
//
// 동결값은 분리 직전 Client.tsx useMemo·shared.tsx calcSamsungBonusNet 이 내던 값을 그대로
// 스냅샷한 것이다. 세율(taxConstants2026)·가중치·인원 기본값이 바뀌면 이 파일도 같은 커밋에서
// 갱신한다. jsdom 없음 — 순수 함수만 검증. 세후 동결값은 2026-09-25 A18 에서 공통 엔진 기준으로
// 재산출했다(손 검산 주석 포함). 풀 분배(791/553/252% 매칭) 값은 세금과 무관해 그대로다.
import { describe, expect, it } from "vitest";
import {
  DIVISIONS,
  FIXED_BU_RATIO,
  FIXED_OPI1_RATE,
  FIXED_RERATE,
  FIXED_SA_RATIO,
  REFERENCE_SALARY,
  calcSamsungBonusNet,
  computeDivisionPool,
  defaultDivisionCounts,
  defaultDivisionRatios,
  getThreshold,
} from "./model";
import { OPI1_DEFAULT_RATE, OPI1_MAX_RATE, OPI_LATEST_TOP } from "./opiData";
import { calcBonusNet } from "@/lib/bonusTaxCalc";

const pct = (manwon: number) => (manwon * 10_000) / REFERENCE_SALARY * 100;

describe("samsung-bonus/model 풀 분배 — 보도값 매칭 회귀", () => {
  it("고정 정책 상수", () => {
    expect(FIXED_RERATE).toBe(10.5);
    expect(FIXED_BU_RATIO + FIXED_SA_RATIO).toBe(10);
    expect(REFERENCE_SALARY).toBe(80_000_000);
    expect(getThreshold(2026)).toBe(200);
    expect(getThreshold(2029)).toBe(100);
    expect(getThreshold(2036)).toBe(0);
  });

  it("기본 가중치 = 보도값(791/553/252%) 매칭 역산값 1.0 / 0.55 / 0.05", () => {
    expect(DIVISIONS.map((d) => [d.id, d.defaultRatio])).toEqual([
      ["memory", 1.0],
      ["common", 0.55],
      ["foundry", 0.05],
    ]);
    expect(DIVISIONS.map((d) => d.defaultCount)).toEqual([27400, 29000, 20900]);
  });

  it("영업이익 350조 기본 입력 → 메모리 858.6% · 공통 579.2% · 파운드리 268.8% (page.tsx 안내문 858/579/269%)", () => {
    const pool = computeDivisionPool(350, defaultDivisionCounts(), defaultDivisionRatios(), true);
    expect(pool.totalFundManwon).toBe(3_675_000_000); // 350조 × 10.5% = 36.75조 (만원)
    expect(pool.ratioSum).toBeCloseTo(1.6, 10);
    const [memory, common, foundry] = pool.perDivision;
    expect(memory.total).toBeCloseTo(68_684.57, 1);
    expect(common.total).toBeCloseTo(46_334.08, 1);
    expect(foundry.total).toBeCloseTo(21_500.21, 1);
    expect(Math.round(pct(memory.total))).toBe(859);
    expect(Math.round(pct(common.total))).toBe(579);
    expect(Math.round(pct(foundry.total))).toBe(269);
    // 부문 균등분(40%)은 세 사업부 동일
    expect(new Set(pool.perDivision.map((d) => d.buPart.toFixed(2))).size).toBe(1);
  });

  it("보도값 791/553/252% 의 사업부 간 비율을 ±3%p 안에서 재현한다", () => {
    const pool = computeDivisionPool(350, defaultDivisionCounts(), defaultDivisionRatios(), true);
    const [memory, common, foundry] = pool.perDivision;
    expect(common.total / memory.total).toBeCloseTo(553 / 791, 1);
    expect(foundry.total / memory.total).toBeCloseTo(252 / 791, 1);
    expect(Math.abs(common.total / memory.total - 553 / 791)).toBeLessThan(0.03);
    expect(Math.abs(foundry.total / memory.total - 252 / 791)).toBeLessThan(0.03);
  });

  it("임계값 미달(triggered=false)이면 풀 0 · 인원 0 이면 NaN 없이 0", () => {
    const zero = computeDivisionPool(350, defaultDivisionCounts(), defaultDivisionRatios(), false);
    expect(zero.totalFundManwon).toBe(0);
    expect(zero.perDivision.every((d) => d.total === 0)).toBe(true);
    const empty = computeDivisionPool(350, { memory: "0", common: "0", foundry: "0" }, defaultDivisionRatios(), true);
    expect(empty.perDivision.every((d) => Number.isFinite(d.total) && d.total === 0)).toBe(true);
    expect(empty.max).toBe(1);
  });
});

describe("samsung-bonus/model calcSamsungBonusNet — 세후 동결값", () => {
  // 2026-09-25 A18 재산출: 소득세 = 연간 결정세액(연봉+성과급) − 연간 결정세액(연봉) (bonusTaxCalc 공통 엔진).
  // 손 검산(보험료 공제는 연봉+성과급 전체 보수 기준):
  //   T(8,000만) — 근로소득공제 1,375만, 기본 150만, 연금 7,908만×4.75% = 3,756,300,
  //     건강·장기요양 8,000만×3.595%×1.1314 = 3,253,906.4, 고용 72만 → 과표 57,019,793.6
  //     → 산출 7,924,750 − 근로소득세액공제 한도 50만(총급여 8,000만) = 7,424,750
  //   T(1억 2,000만) — 근로소득공제 1,515만, 연금 3,756,300, 건강·장기요양 4,880,859.6,
  //     고용 108만 → 과표 93,632,840.4 → 산출 17,331,494 − 50만 = 16,831,494
  //   소득세 증가분 = 9,406,744 (종전 '산출세액 차이 × (1 − 30%)' = 7,666,750)
  it("연봉 8,000만 · 성과급 4,000만(OPI1 50%) · 추가 공제 0%(기본) · 4대보험 ON", () => {
    const t = calcSamsungBonusNet(80_000_000, 40_000_000, 0, true);
    expect(t.net).toBeCloseTo(27_665_628.4, 1);
    expect(t.deduct).toBeCloseTo(12_334_371.6, 1);
    expect(t.effRate).toBeCloseTo(30.836, 3);
    expect(t.breakdown.incomeTax).toBeCloseTo(9_406_744, 0);
    expect(t.breakdown.localTax).toBeCloseTo(940_674.4, 1);
    // 연봉 8,000만 > 국민연금 연 상한 7,908만 → 추가 부과 0
    expect(t.breakdown.nationalPension).toBe(0);
    expect(t.breakdown.healthIns).toBeCloseTo(1_438_000, 0);
    expect(t.breakdown.longTermCare).toBeCloseTo(188_953.2, 1);
    expect(t.breakdown.employment).toBeCloseTo(360_000, 0);
  });
  it("4대보험 OFF 는 소득세+지방세만 — 보험료 공제도 연봉분만", () => {
    // T(1억 2,000만, 보험료는 8,000만분) = 과표 95,619,793.6 → 산출 18,026,928 − 50만 = 17,526,928
    // → 증가분 10,102,178
    const t = calcSamsungBonusNet(80_000_000, 40_000_000, 0, false);
    expect(t.breakdown.incomeTax).toBeCloseTo(10_102_178, 0);
    expect(t.net).toBeCloseTo(28_887_604.2, 1);
    expect(t.effRate).toBeCloseTo(27.781, 3);
    expect(t.breakdown.healthIns).toBe(0);
  });
  it("추가 세액공제 가정은 엔진 증가분에 비례 적용 (30% → 소득세 × 0.7)", () => {
    const t = calcSamsungBonusNet(80_000_000, 40_000_000, 30, true);
    expect(t.breakdown.incomeTax).toBeCloseTo(9_406_744 * 0.7, 1);
  });
  it("공통 엔진(calcBonusNet)과 원 단위로 일치", () => {
    const t = calcSamsungBonusNet(80_000_000, 40_000_000, 0, true);
    const b = calcBonusNet(80_000_000, 40_000_000);
    expect(Math.abs(t.net - b.net)).toBeLessThanOrEqual(1);
    expect(Math.abs(t.breakdown.incomeTax - b.incomeTaxDelta)).toBeLessThanOrEqual(1);
  });
  it("성과급 0 이면 전부 0", () => {
    expect(calcSamsungBonusNet(80_000_000, 0, 0, true)).toEqual({
      net: 0,
      deduct: 0,
      effRate: 0,
      breakdown: { incomeTax: 0, localTax: 0, nationalPension: 0, healthIns: 0, longTermCare: 0, employment: 0 },
    });
  });
});

describe("OPI1 기본값 = MX 50% (opiData 단일 소스)", () => {
  it("FIXED_OPI1_RATE·OPI1_DEFAULT_RATE·상한·최신 최고 실지급률이 모두 50", () => {
    expect(OPI1_MAX_RATE).toBe(50);
    expect(OPI1_DEFAULT_RATE).toBe(50);
    expect(FIXED_OPI1_RATE).toBe(OPI1_DEFAULT_RATE);
    expect(OPI_LATEST_TOP.id).toBe("mx");
    expect(OPI_LATEST_TOP.rate).toBe(50);
  });
});
