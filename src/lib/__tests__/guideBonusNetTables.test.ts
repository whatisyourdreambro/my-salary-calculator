// 성과급 세금·4대보험 키퍼 가이드의 표 값 고정 (2026-09-30 W3-A 2차 G2A — 53d745f5 방식)
//
// 가이드 본문은 bonusNetFigures2026.ts 가 calcBonusNet 에 2026 요율을 '명시해' 넘긴 결과를 끼워 넣는다.
// 엔진(bonusTaxCalc·taxConstants2026)이 바뀌면 가이드 숫자도 조용히 바뀌므로, 여기서 원 단위로 고정한다.
// 이 테스트가 실패하면: 엔진 변경이 의도된 것인지 확인 → 가이드 문장(제목·설명·검색 설명 포함)을 새 값으로 다시 읽고
// 어색한 곳을 고친 뒤 기대값을 갱신한다. 2027-01-01 요율 포인터 전환으로는 실패하지 않아야 한다(2026 고정).
import { describe, expect, it } from "vitest";
import { calcBonusNet } from "@/lib/bonusTaxCalc";
import { koGuides } from "@/lib/guidesContent";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";
import {
  BRACKET_ROWS,
  EOK_BY_SALARY,
  EOK_MAIN,
  EOK_SALARY_ONLY,
  EOK_WITH_BONUS,
  FIVE_BY_BONUS,
  FIVE_BY_SALARY,
  FIVE_MAIN,
  FIVE_SALARY_ONLY,
  FIVE_WITH_BONUS,
  FLOW_7000,
  GROSS_AT_BRACKET,
  IRP_FULL_CREDIT_HIGH,
  RATE_LABEL,
  TAX_EXAMPLES,
  annualTax2026,
  bonusNet2026,
  engineDecidedTax2026,
  manwon,
  won,
} from "@/lib/guides/bonusNetFigures2026";

const guide = (slug: string) => {
  const g = koGuides.find((x) => x.slug === slug);
  if (!g) throw new Error(`missing guide ${slug}`);
  return g;
};
const all = (slug: string) => {
  const g = guide(slug);
  return `${g.title}\n${g.description}\n${g.metaDescription ?? ""}\n${g.content}`;
};

describe("공통 — 2026 요율 고정·표기 도우미", () => {
  it("bonusNet2026 은 calcBonusNet 에 2026 요율을 명시한 호출과 같다 (현행 포인터와 무관)", () => {
    for (const [s, b] of [
      [70_000_000, 100_000_000],
      [60_000_000, 50_000_000],
    ]) {
      expect(bonusNet2026(s, b)).toEqual(calcBonusNet(s, b, 0, true, INSURANCE_RATES_2026));
    }
  });

  it("2026 요율 표기값", () => {
    expect(RATE_LABEL).toMatchObject({
      pension: "4.75%",
      health: "3.595%",
      healthTotal: "7.19%",
      ltcRatio: "13.14%",
      ltcOfIncome: "0.9448%",
      healthPlusLtc: "4.067%",
      healthPlusLtc2: "4.07%",
      employment: "0.9%",
      local: "10%",
    });
    expect(IRP_FULL_CREDIT_HIGH).toMatchObject({ rateWithLocal: "13.2%", rateWithLocalLow: "16.5%", cap: "900만원" });
    expect(Math.round(IRP_FULL_CREDIT_HIGH.amount)).toBe(1_188_000);
  });

  it("만원 표기 — 억 단위 포함", () => {
    expect(manwon(63_729_787)).toBe("6,373만원");
    expect(manwon(113_945_961)).toBe("1억1,395만원");
    expect(manwon(100_000_000)).toBe("1억원");
    expect(manwon(384_060_000)).toBe("3억8,406만원");
    expect(won(48_447_831.9)).toBe("48,447,832");
  });

  it("단계별 내역(annualTax2026)의 결정세액은 엔진(estimateAnnualIncomeTax2026)과 같다", () => {
    for (const gross of [50_000_000, 60_000_000, 70_000_000, 100_000_000, 110_000_000, 150_000_000, 170_000_000, 250_000_000]) {
      expect(annualTax2026(gross).decidedTax, String(gross)).toBe(engineDecidedTax2026(gross));
    }
  });
});

describe("bonus-1eok-net-payment-2026 — 연봉 7,000만원 + 성과급 1억", () => {
  it("엔진 값 고정", () => {
    expect(EOK_MAIN).toMatchObject({
      incomeTaxDelta: 28_065_027,
      localTaxDelta: 2_806_503,
      pensionDelta: 431_300,
      healthDelta: 4_067_383,
      empInsDelta: 900_000,
      totalDeductions: 36_270_213,
      net: 63_729_787,
    });
    expect(EOK_SALARY_ONLY.decidedTax).toBe(5_347_175);
    expect(EOK_WITH_BONUS.decidedTax).toBe(33_412_202);
    expect(Math.round(EOK_SALARY_ONLY.taxBase)).toBe(48_447_832);
    expect(Math.round(EOK_WITH_BONUS.taxBase)).toBe(140_149_149);
    expect(EOK_WITH_BONUS.earnedDeduction).toBe(16_150_000);
    expect([EOK_SALARY_ONLY.creditLimit, EOK_WITH_BONUS.creditLimit]).toEqual([660_000, 200_000]);
    expect(EOK_BY_SALARY.map((x) => x.r.net)).toEqual([67_128_972, 63_729_787, 59_858_930, 57_084_077]);
  });

  it("제목·설명·본문에 같은 값이 찍힌다", () => {
    const g = guide("bonus-1eok-net-payment-2026");
    expect(g.title).toBe("성과급 1억 실수령액 — 연봉 7천이면 약 6,373만원");
    expect(g.description).toContain("약 3,627만원");
    expect(g.metaDescription).toContain("약 5,986만원");
    const t = all("bonus-1eok-net-payment-2026");
    for (const v of ["63,729,787원", "36,270,213원", "28,065,027원", "5,347,175원", "33,412,202원", "431,300원", "4,067,383원", "57,084,077원"]) {
      expect(t).toContain(v);
    }
    expect(t).toContain("이듬해 4월");
    expect(t).not.toMatch(/7월.{0,8}(?:건보|건강보험).{0,6}정산/);
  });
});

describe("bonus-5000-net-payment-2026 — 연봉 6,000만원 + 성과급 5,000만원", () => {
  it("엔진 값 고정 — 과세표준은 24% 구간", () => {
    expect(FIVE_MAIN).toMatchObject({
      incomeTaxDelta: 9_911_163,
      localTaxDelta: 991_116,
      pensionDelta: 906_300,
      healthDelta: 2_033_692,
      empInsDelta: 450_000,
      totalDeductions: 14_292_271,
      net: 35_707_729,
    });
    expect(FIVE_SALARY_ONLY.decidedTax).toBe(4_067_936);
    expect(FIVE_WITH_BONUS.decidedTax).toBe(13_979_099);
    expect(Math.round(FIVE_WITH_BONUS.taxBase)).toBe(84_329_579);
    expect(FIVE_WITH_BONUS.taxBase).toBeLessThan(88_000_000);
    expect(FIVE_BY_SALARY.map((x) => x.r.net)).toEqual([36_832_424, 35_707_729, 33_257_133, 30_847_345]);
    expect(FIVE_BY_BONUS.map((x) => x.r.net)).toEqual([7_621_099, 21_534_128, 35_707_729, 65_429_379]);
  });

  it("제목·설명·본문에 같은 값이 찍힌다", () => {
    const g = guide("bonus-5000-net-payment-2026");
    expect(g.title).toBe("성과급 5천만원 실수령 — 연봉 6천이면 약 3,571만원");
    expect(g.description).toContain("24% 구간");
    const t = all("bonus-5000-net-payment-2026");
    for (const v of ["35,707,729원", "14,292,271원", "9,911,163원", "4,067,936원", "13,979,099원", "1,188,000원", "약 3,690만원", "65,429,379원"]) {
      expect(t).toContain(v);
    }
  });
});

describe("income-tax-8-step-bracket-2026 — 기본세율표·총급여 경계", () => {
  it("구간 상단까지 세액은 소득세법 제55조 표의 누적액과 같다", () => {
    expect(BRACKET_ROWS.map((b) => b.taxAtLimit)).toEqual([
      840_000, 6_240_000, 15_360_000, 37_060_000, 94_060_000, 174_060_000, 384_060_000, null,
    ]);
    expect(BRACKET_ROWS.map((b) => b.rate)).toEqual([0.06, 0.15, 0.24, 0.35, 0.38, 0.4, 0.42, 0.45]);
  });

  it("과세표준별 세액과 총급여 경계(본인 1명·기본 공제만)", () => {
    expect(TAX_EXAMPLES.map((x) => x.tax)).toEqual([3_240_000, 6_240_000, 15_360_000, 15_710_000, 19_560_000, 37_060_000, 56_060_000]);
    expect(GROSS_AT_BRACKET.map((x) => Math.round(x.gross / 10_000))).toEqual([2_756, 7_182, 11_395, 18_059, 34_182]);
    expect(FLOW_7000).toMatchObject({ earnedDeduction: 13_250_000, pension: 3_325_000, calculatedTax: 6_007_175, credit: 660_000, decidedTax: 5_347_175 });
  });

  it("본문 표 값", () => {
    const t = all("income-tax-8-step-bracket-2026");
    for (const v of ["3억8,406만원", "1,544만원", "49.5%", "15,710,000원", "약 1억1,395만원", "48,447,832원", "5,347,175원"]) {
      expect(t).toContain(v);
    }
  });
});
