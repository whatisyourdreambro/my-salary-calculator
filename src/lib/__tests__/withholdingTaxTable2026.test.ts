// 근로소득 간이세액표 재현 회귀 테스트 — 2026-09-25 A17 (CALC-01).
//
// 정본: 소득세법 시행령 [별표 2] <개정 2026. 2. 27.> 근로소득 간이세액표 (2026-03-01 지급분부터).
// fixtures/withholdingTaxTable2026.json 은 국가법령정보센터 첨부 PDF 원문에서 추출한 전 647행 × 11열.
// 월 실수령 엔진(TaxLogic·calculator)의 월 소득세가 이 표의 금액과 같아야 한다.
import { describe, expect, it } from "vitest";

import table from "./fixtures/withholdingTaxTable2026.json";
import {
  withholdingChildDeduction2026,
  withholdingIncomeTax2026,
} from "@/lib/withholdingTaxTable2026";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { calculateNetSalary } from "@/lib/calculator";

const rows = table.rows as number[][];
const cellOf = (monthly: number, family: number) => {
  const thousand = monthly / 1000;
  const row = rows.find(([lo, hi]) => (lo === hi ? thousand === lo : thousand >= lo && thousand < hi))!;
  return row[1 + family];
};

// 원문 표가 산식보다 10원 높은 7칸 — 표 자체의 단수 처리 흔적으로 보이며 산식으로는 재현되지 않는다.
// (전 7,117칸 중 7,110칸 일치. 이 7칸도 차이는 정확히 10원.)
const KNOWN_ROUNDING_CELLS = new Set([
  "1160/1",
  "1375/1",
  "1375/2",
  "1390/1",
  "1390/2",
  "1405/1",
  "1405/2",
]);

describe("근로소득 간이세액표 — 별표2 원문 대조", () => {
  it("원문 추출본: 647행(770천원~1,000만원)·구간 연속", () => {
    expect(rows).toHaveLength(647);
    expect(rows[0].slice(0, 2)).toEqual([770, 775]);
    expect(rows[rows.length - 1].slice(0, 3)).toEqual([10000, 10000, 1_507_400]);
    for (let i = 0; i < rows.length - 1; i++) expect(rows[i][1]).toBe(rows[i + 1][0]);
  });

  it("전 647행 × 가족 1~11명: 구간 하한·중간·상한 직전 모두 표 금액 (알려진 7칸은 표가 정확히 10원 높음)", () => {
    let exact = 0;
    for (const [lo, hi, ...values] of rows) {
      const probes = lo === hi ? [lo * 1000] : [lo * 1000, ((lo + hi) / 2) * 1000, hi * 1000 - 1];
      for (let family = 1; family <= 11; family++) {
        const expected = values[family - 1];
        for (const monthly of probes) {
          const got = withholdingIncomeTax2026(monthly, family, 0);
          if (KNOWN_ROUNDING_CELLS.has(`${lo}/${family}`)) expect(expected - got).toBe(10);
          else expect(got, `${lo}천원·${family}명`).toBe(expected);
        }
        if (!KNOWN_ROUNDING_CELLS.has(`${lo}/${family}`)) exact++;
      }
    }
    expect(exact).toBe(647 * 11 - KNOWN_ROUNDING_CELLS.size);
  });

  // A17 요청 표본: 월급여액(비과세 제외) · 공제대상가족 1명(본인)
  const SAMPLES: ReadonlyArray<readonly [number, number]> = [
    [2_000_000, 19_520], // 2,000~2,010천원
    [2_500_000, 35_600], // 2,500~2,510천원
    [3_000_000, 74_350], // 3,000~3,020천원
    [3_500_000, 127_220], // 3,500~3,520천원
    [4_166_667, 217_320], // 4,160~4,180천원 (연봉 5,000만 ÷ 12)
    [5_000_000, 335_470], // 5,000~5,020천원
    [7_000_000, 732_700], // 7,000~7,020천원
    [10_000_000, 1_507_400], // 10,000천원 행
  ];

  it.each(SAMPLES)("월급여액 %i원 · 1명 → 별표2 %i원", (monthly, expected) => {
    expect(cellOf(monthly, 1)).toBe(expected);
    expect(withholdingIncomeTax2026(monthly, 1, 0)).toBe(expected);
  });

  it.each(SAMPLES)("월 실수령 엔진 소득세 = 표 금액 (월급 %i원, 비과세 0·1인)", (monthly, expected) => {
    expect(calculateSalary2026(monthly * 12, 0, 1, 0).incomeTax).toBe(expected);
    expect(
      calculateNetSalary(monthly * 12, 0, 1, 0, { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 })
        .incomeTax
    ).toBe(expected);
  });

  it("사이트 기본값(비과세 식대 월 20만): 월급여액 = 월급 − 20만 으로 표를 찾는다", () => {
    // 연봉 5,000만 → 월 4,166,667 − 200,000 = 3,966,667 → 3,960~3,980천원 190,620원
    expect(calculateSalary2026(50_000_000, 200_000, 1, 0).incomeTax).toBe(190_620);
    expect(cellOf(3_966_667, 1)).toBe(190_620);
    // 지방소득세 = 소득세의 10% (10원 미만 절사)
    expect(calculateSalary2026(50_000_000, 200_000, 1, 0).localIncomeTax).toBe(19_060);
  });
});

describe("근로소득 간이세액표 — 비고 규정", () => {
  it("비고3: 8~20세 자녀 1명 20,830원·2명 45,830원·3명 이상 45,830원 + 1명당 33,330원", () => {
    expect(withholdingChildDeduction2026(0)).toBe(0);
    expect(withholdingChildDeduction2026(1)).toBe(20_830);
    expect(withholdingChildDeduction2026(2)).toBe(45_830);
    expect(withholdingChildDeduction2026(3)).toBe(79_160);
    expect(withholdingChildDeduction2026(4)).toBe(112_490);
    // 5,000천원 · 4인(본인·배우자·자녀 2) 219,100원 − 45,830원
    expect(withholdingIncomeTax2026(5_000_000, 4, 2)).toBe(219_100 - 45_830);
    // 공제 후 음수면 0원
    expect(withholdingIncomeTax2026(2_000_000, 4, 3)).toBe(0);
  });

  it("자녀 공제 뒤 남은 세액도 1,000원 미만이면 0원 (소득세법 §86 소액부징수)", () => {
    // 2,260천원 · 2인 표 금액 20,880원 − 자녀 1명 20,830원 = 50원 → 징수하지 않음
    expect(cellOf(2_260_000, 2)).toBe(20_880);
    expect(withholdingIncomeTax2026(2_260_000, 2, 1)).toBe(0);
    // 엔진도 소득세·지방소득세 0원 (비과세 0 · 월 226만 = 연 2,712만)
    const r = calculateSalary2026(27_120_000, 0, 2, 1);
    expect(r.incomeTax).toBe(0);
    expect(r.localIncomeTax).toBe(0);
    // 1,000원 이상 남으면 그대로 (5,000천원 · 4인 · 자녀 2명 = 173,270원)
    expect(withholdingIncomeTax2026(5_000_000, 4, 2)).toBe(173_270);
  });

  it("비고4: 공제대상가족 11명 초과 = 11명 세액 − (10명 − 11명) × 초과 인원", () => {
    // 10,000천원: 10명 990,840 · 11명 960,840 → 12명 930,840 · 13명 900,840
    expect(withholdingIncomeTax2026(10_000_000, 12, 0)).toBe(930_840);
    expect(withholdingIncomeTax2026(10_000_000, 13, 0)).toBe(900_840);
  });

  it("10,000천원 초과 행 산식", () => {
    // 1,400만 이하: 1,000만 세액 + 초과분 × 98% × 35% + 25,000원
    expect(withholdingIncomeTax2026(12_000_000, 1, 0)).toBe(1_507_400 + 686_000 + 25_000);
    // 2,800만 이하: 1,000만 세액 + 1,397,000원 + 1,400만 초과분 × 98% × 38%
    expect(withholdingIncomeTax2026(20_000_000, 1, 0)).toBe(1_507_400 + 1_397_000 + 2_234_400);
    // 4,500만 이하: 1,000만 세액 + 7,394,600원 + 3,000만 초과분 × 40%
    expect(withholdingIncomeTax2026(40_000_000, 2, 0)).toBe(1_431_570 + 7_394_600 + 4_000_000);
  });

  it("770천원 미만·비유한·0 이하 입력은 0원", () => {
    expect(withholdingIncomeTax2026(769_999, 1, 0)).toBe(0);
    expect(withholdingIncomeTax2026(0, 1, 0)).toBe(0);
    expect(withholdingIncomeTax2026(Number.NaN, 1, 0)).toBe(0);
    expect(withholdingIncomeTax2026(-1, 1, 0)).toBe(0);
  });

  it("추가공제(장애인·경로우대)는 같은 표 산식에 공제를 더한 추정 — 0 이면 표 금액 그대로", () => {
    const base = withholdingIncomeTax2026(4_166_667, 1, 0);
    expect(withholdingIncomeTax2026(4_166_667, 1, 0, { extraAnnualDeduction: 0 })).toBe(base);
    const disabled = withholdingIncomeTax2026(4_166_667, 1, 0, { extraAnnualDeduction: 2_000_000 });
    expect(disabled).toBeLessThan(base);
    // 한계세율 15% × 200만 = 연 30만 → 월 25,000원 감소 (근로소득세액공제가 한도 66만에 걸린 구간)
    expect(base - disabled).toBe(25_000);
  });
});
