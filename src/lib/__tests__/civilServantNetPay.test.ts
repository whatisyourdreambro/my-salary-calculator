// 공무원 월급 실수령액 엔진 골든 케이스 (2026-09-27, /calc/civil-servant-net-pay)
//
// 기대값은 손 계산으로 확인한 값이다 (봉급표·수당 규정 원문 → 산식 → 10원 절사):
//   A. 일반직 9급 1호봉, 재직 2년 미만, 본인만, 시간외 정액분 10시간
//      시간외 단가 = floor(9급 10호봉 2,542,700 × 60% ÷ 209 × 1.5) = 10,949 → 10시간 109,490
//      세전 = 2,133,000 + 직급보조비 175,000 + 정근수당 가산금 30,000 + 109,490 + 정액급식비 160,000 = 2,607,490
//      연간 세전 = 2,607,490×12 + 명절휴가비 1,279,800×2 + 정근수당(10%) 213,300×2 = 34,276,080
//        → 만원 반올림 3,428 = 인사혁신처 '9급 초임 연 3,428만원'(/civil-servant-pay-2026 FAQ 인용)과 일치
//      기준소득월액 추정 = (34,276,080 − 160,000×12) ÷ 12 = 2,696,340
//      기여금 242,670 · 건강 96,930 · 장기요양 12,730 · 소득세(간이세액표 과세 2,447,490·1인) 33,660 · 지방세 3,360
//      실수령 = 2,607,490 − 389,350 = 2,218,140
//   B. 교원 9호봉 + 담임, 2년 미만, 본인만, 시간외 0
//      세전 = 2,495,600 + 교직수당 250,000 + 담임 200,000 + 가산금 30,000 + 급식비 160,000 = 3,135,600
//      기준소득월액 = (3,135,600×12 + 1,497,360×2 + 249,560×2 − 1,920,000) ÷ 12 = 3,266,753
//      기여금 294,000 · 건강 117,440 · 장기요양 15,430 · 소득세 71,350 · 지방세 7,130 → 실수령 2,630,250

import { describe, expect, it } from "vitest";
import {
  CIVIL_DEFAULT_INPUT,
  CIVIL_KIND_PRESETS,
  CIVIL_YEARS_OPTIONS,
  civilHobongOptions,
  civilPayOf,
  computeCivilNetPay,
  familyAllowance,
  floor10,
  jeonggeunAddon,
  jeonggeunPct,
  overtimeBaseHobong,
  overtimeHourly,
  previewCivilNetPay2027,
  type CivilKind,
  type CivilNetPayInput,
} from "@/lib/civilServantNetPay";
import {
  GENERAL_PAY_FULL_2026,
  POLICE_FIRE_PAY_FULL_2026,
  TEACHER_PAY_FULL_2026,
  payAt,
} from "@/lib/payTablesFull2026";
import {
  GENERAL_PAY_ROWS_2026,
  MILITARY_PAY_2026,
  POLICE_FIRE_ROWS_2026,
  POLICE_RANK_ROWS_2026,
  TEACHER_PAY_ROWS_2026,
  TEACHER_START_HOBONG,
  forecast2027,
} from "@/lib/civilServantPay";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";

const withInput = (patch: Partial<CivilNetPayInput>): CivilNetPayInput => ({ ...CIVIL_DEFAULT_INPUT, ...patch });

describe("A. 일반직 9급 1호봉 신규 (계산기 기본값)", () => {
  const r = computeCivilNetPay(CIVIL_DEFAULT_INPUT);

  it("기본값은 9급 1호봉·2년 미만·본인만·시간외 10시간", () => {
    expect(CIVIL_DEFAULT_INPUT).toMatchObject({ kind: "general", rank: 0, hobong: 1, yearsOfService: 0, spouse: false, children: 0, overtimeHours: 10 });
  });

  it("시간외 단가·세전·기준소득월액", () => {
    expect(r.overtimeHourly).toBe(10_949);
    expect(r.overtime).toBe(109_490);
    expect(r.grossMonthly).toBe(2_607_490);
    expect(r.baseIncome).toBe(2_696_340);
    expect(r.baseIncomeEstimated).toBe(true);
  });

  it("공제 5항목과 실수령", () => {
    expect(r.contribution).toBe(242_670);
    expect(r.health).toBe(96_930);
    expect(r.longTermCare).toBe(12_730);
    expect(r.incomeTax).toBe(33_660);
    expect(r.localIncomeTax).toBe(3_360);
    expect(r.deductions).toBe(389_350);
    expect(r.net).toBe(2_218_140);
  });

  it("연간 세전 34,276,080원 → 인사혁신처 9급 초임 연 3,428만원 재현", () => {
    expect(r.annual.annualGross).toBe(34_276_080);
    expect(Math.round(r.annual.annualGross / 1e4)).toBe(3428);
    expect(r.annual.holidayBonusEach).toBe(1_279_800);
    expect(r.annual.jeonggeunEach).toBe(213_300);
  });

  it("합계 항등식 — 세전 = 봉급 + 수당 합계, 실수령 = 세전 − 공제", () => {
    expect(r.pay + r.allowanceTotal).toBe(r.grossMonthly);
    expect(r.items.reduce((sum, item) => sum + item.amount, 0)).toBe(r.grossMonthly);
    expect(r.grossMonthly - r.deductions).toBe(r.net);
  });
});

describe("B. 교원 9호봉 + 담임", () => {
  const r = computeCivilNetPay(withInput({ kind: "teacher", rank: 0, hobong: 9, homeroom: true, overtimeHours: 0 }));

  it("세전·기준소득월액·공제·실수령", () => {
    expect(r.grossMonthly).toBe(3_135_600);
    expect(r.baseIncome).toBe(3_266_753);
    expect(r.contribution).toBe(294_000);
    expect(r.health).toBe(117_440);
    expect(r.longTermCare).toBe(15_430);
    expect(r.incomeTax).toBe(71_350);
    expect(r.localIncomeTax).toBe(7_130);
    expect(r.net).toBe(2_630_250);
  });

  it("#teacher 프리셋은 신규 교사 통상 호봉 + 담임", () => {
    expect(CIVIL_KIND_PRESETS.teacher.hobong).toBe(TEACHER_START_HOBONG);
    expect(CIVIL_KIND_PRESETS.teacher.homeroom).toBe(true);
    const preset = computeCivilNetPay(withInput(CIVIL_KIND_PRESETS.teacher));
    expect(preset.net).toBe(r.net);
  });
});

describe("C. 가족수당 (부양가족 4명 이내·자녀 예외)", () => {
  it("배우자 + 자녀 2 = 170,000원", () => {
    expect(familyAllowance(true, 2, 0)).toBe(170_000);
  });
  it("배우자 없이 자녀 5 = 490,000원 (자녀는 4명 초과도 지급)", () => {
    expect(familyAllowance(false, 5, 0)).toBe(490_000);
  });
  it("배우자 + 기타 2 + 자녀 2 = 190,000원 (상한으로 기타 1명만)", () => {
    expect(familyAllowance(true, 2, 2)).toBe(190_000);
  });
  it("엔진 결과에 반영되고 공제대상가족 수로 소득세가 줄어든다", () => {
    const single = computeCivilNetPay(CIVIL_DEFAULT_INPUT);
    const family = computeCivilNetPay(withInput({ spouse: true, children: 2, children8to20: 1 }));
    expect(family.items.find((item) => item.key === "family")?.amount).toBe(170_000);
    expect(family.grossMonthly - single.grossMonthly).toBe(170_000);
    expect(family.incomeTax).toBeLessThan(single.incomeTax + 50_000);
  });
});

describe("D. 공무원연금 기여금 상한·36년", () => {
  it("기준소득월액 1,000만원 → 상한 9,520,000원 × 9% = 856,800원", () => {
    expect(computeCivilNetPay(withInput({ baseIncomeOverride: 10_000_000 })).contribution).toBe(856_800);
  });
  it("재직 36년 초과(37년) → 기여금 0", () => {
    expect(computeCivilNetPay(withInput({ yearsOfService: 37 })).contribution).toBe(0);
    expect(computeCivilNetPay(withInput({ yearsOfService: 36 })).contribution).toBeGreaterThan(0);
  });
  it("직접 입력한 기준소득월액은 건강보험에도 쓰인다", () => {
    const r = computeCivilNetPay(withInput({ baseIncomeOverride: 3_000_000 }));
    expect(r.baseIncome).toBe(3_000_000);
    expect(r.baseIncomeEstimated).toBe(false);
    expect(r.contribution).toBe(270_000);
    expect(r.health).toBe(floor10(3_000_000 * INSURANCE_RATES_2026.HEALTH_INSURANCE));
  });
});

describe("E. 병장", () => {
  it("실수령 1,500,000원·공제 0 (봉급 비과세·기여금·건보 없음)", () => {
    const r = computeCivilNetPay(withInput({ kind: "soldier", rank: 3 }));
    expect(r.pay).toBe(1_500_000);
    expect(r.net).toBe(1_500_000);
    expect(r.deductions).toBe(0);
    expect([r.contribution, r.health, r.longTermCare, r.incomeTax, r.localIncomeTax, r.allowanceTotal]).toEqual([0, 0, 0, 0, 0, 0]);
    expect(previewCivilNetPay2027(withInput({ kind: "soldier", rank: 3 }))).toBeNull();
  });
  it("이병~병장 봉급은 별표 13 발췌표 그대로", () => {
    MILITARY_PAY_2026.forEach((row, rank) => {
      expect(computeCivilNetPay(withInput({ kind: "soldier", rank })).net).toBe(row.pay);
    });
  });
});

describe("F. 봉급 앵커·발췌표 교차검증", () => {
  it("앵커 5개", () => {
    expect(civilPayOf("general", 0, 1)).toBe(2_133_000);
    expect(civilPayOf("police", 0, 1)).toBe(2_133_000);
    expect(civilPayOf("police", 2, 1)).toBe(2_472_100);
    expect(civilPayOf("police", 4, 1)).toBe(2_698_600);
    expect(civilPayOf("teacher", 0, 9)).toBe(2_495_600);
    expect(civilPayOf("fire", 0, 1)).toBe(civilPayOf("police", 0, 1));
  });

  it("전체표(payTablesFull2026)의 겹치는 칸 = 기존 발췌표(civilServantPay) 전 칸", () => {
    for (const row of GENERAL_PAY_ROWS_2026) {
      for (let col = 1; col <= 5; col++) expect(payAt(GENERAL_PAY_FULL_2026, row[0], col), `일반직 ${row[0]}호봉 ${col}열`).toBe(row[col]);
    }
    for (const row of POLICE_RANK_ROWS_2026) {
      for (let col = 1; col <= 5; col++) expect(payAt(POLICE_FIRE_PAY_FULL_2026, row[0], col), `경찰 ${row[0]}호봉 ${col}열`).toBe(row[col]);
    }
    for (const [hobong, pay] of POLICE_FIRE_ROWS_2026) expect(payAt(POLICE_FIRE_PAY_FULL_2026, hobong, 1)).toBe(pay);
    for (const [hobong, pay] of TEACHER_PAY_ROWS_2026) expect(payAt(TEACHER_PAY_FULL_2026, hobong, 1)).toBe(pay);
  });

  it("호봉 선택지는 봉급표 칸이 있는 호봉만", () => {
    const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
    expect(civilHobongOptions("general", 0)).toEqual(range(1, 31));
    expect(civilHobongOptions("general", 3)).toEqual(range(1, 32));
    expect(civilHobongOptions("general", 4)).toEqual(range(1, 30));
    expect(civilHobongOptions("police", 0)).toEqual(range(1, 31));
    expect(civilHobongOptions("fire", 4)).toEqual(range(1, 32));
    expect(civilHobongOptions("teacher", 0)).toEqual(range(1, 40));
    expect(civilHobongOptions("soldier", 3)).toEqual([]);
  });
});

describe("수당 구간·시간외 기준호봉", () => {
  it("정근수당 지급률·가산금 경계", () => {
    expect([0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 30].map(jeonggeunPct)).toEqual([10, 10, 20, 20, 25, 30, 35, 40, 45, 50, 50]);
    expect([0, 4, 5, 9, 10, 14, 15, 19, 20, 24, 25, 36].map(jeonggeunAddon)).toEqual([
      30_000, 30_000, 50_000, 50_000, 60_000, 60_000, 80_000, 80_000, 110_000, 110_000, 130_000, 130_000,
    ]);
  });

  it("재직 연수 선택지는 지급률·가산금 경계와 36년 초과를 모두 가른다", () => {
    const values = CIVIL_YEARS_OPTIONS.map((o) => o.value);
    for (const edge of [2, 5, 6, 7, 8, 9, 10, 15, 20, 25, 37]) expect(values).toContain(edge);
  });

  it("시간외 기준호봉(별표 12)과 비율 60%/55%", () => {
    expect(overtimeBaseHobong("police", 0, 1)).toBe(9);
    expect(overtimeBaseHobong("fire", 1, 1)).toBe(10);
    expect(overtimeBaseHobong("teacher", 0, 19)).toBe(18);
    expect(overtimeBaseHobong("teacher", 0, 20)).toBe(21);
    expect(overtimeBaseHobong("teacher", 0, 30)).toBe(23);
    expect(overtimeBaseHobong("soldier", 3, 0)).toBeNull();
    // 순경: 9호봉 × 60%, 경사: 10호봉 × 55%, 교원 9호봉: 18호봉 × 55%
    expect(overtimeHourly("police", 0, 1)).toBe(Math.floor((payAt(POLICE_FIRE_PAY_FULL_2026, 9, 1) * 0.6) / 209 * 1.5));
    expect(overtimeHourly("police", 2, 1)).toBe(Math.floor((payAt(POLICE_FIRE_PAY_FULL_2026, 10, 3) * 0.55) / 209 * 1.5));
    expect(overtimeHourly("teacher", 0, 9)).toBe(Math.floor((payAt(TEACHER_PAY_FULL_2026, 18, 1) * 0.55) / 209 * 1.5));
    expect(overtimeHourly("general", 2, 1)).toBe(Math.floor((payAt(GENERAL_PAY_FULL_2026, 10, 3) * 0.55) / 209 * 1.5));
  });

  it("경찰·소방 프리셋은 위험근무수당 갑종 + 가산금 8만원", () => {
    for (const kind of ["police", "fire"] as const) {
      const r = computeCivilNetPay(withInput(CIVIL_KIND_PRESETS[kind]));
      expect(r.items.find((item) => item.key === "hazard")?.amount).toBe(80_000);
    }
    // 일반직에는 위험근무수당 항목이 없다
    expect(computeCivilNetPay(withInput({ hazard: "gapPlus" })).items.some((item) => item.key === "hazard")).toBe(false);
  });
});

describe("2027 정부안 미리보기", () => {
  it("봉급은 forecast2027(3.9% 천원 반올림), 기준소득월액은 다시 추정", () => {
    const p = previewCivilNetPay2027(withInput({ baseIncomeOverride: 5_000_000 }));
    expect(p).not.toBeNull();
    expect(p!.pay).toBe(forecast2027(2_133_000));
    expect(p!.baseIncomeEstimated).toBe(true);
    expect(p!.net).toBeGreaterThan(computeCivilNetPay(CIVIL_DEFAULT_INPUT).net);
  });
});

describe("입력 경계 — NaN·음수·빈 값·거대 값에도 유한한 결과", () => {
  const kinds: CivilKind[] = ["general", "teacher", "police", "fire", "soldier"];
  const bad = [Number.NaN, -5, Number.POSITIVE_INFINITY, 1e15, 0];
  it("모든 직종 × 이상 입력", () => {
    for (const kind of kinds) {
      for (const v of bad) {
        const r = computeCivilNetPay({
          ...CIVIL_DEFAULT_INPUT,
          kind,
          rank: v,
          hobong: v,
          yearsOfService: v,
          children: v,
          children8to20: v,
          otherDependents: v,
          overtimeHours: v,
          baseIncomeOverride: v,
          otherTaxableMonthly: v,
          otherNonTaxableMonthly: v,
          annualPerformanceBonus: v,
        });
        for (const n of [r.net, r.grossMonthly, r.deductions, r.pay, r.baseIncome, r.annual.annualGrossWithBonus]) {
          expect(Number.isFinite(n), `${kind} ${v}`).toBe(true);
        }
        expect(r.net).toBeGreaterThan(0);
      }
    }
  });
});
