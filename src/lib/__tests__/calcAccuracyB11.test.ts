// src/lib/__tests__/calcAccuracyB11.test.ts
//
// 2026-09-25 감사 B11(개별 계산기 정확성) 회귀 가드 — CALC-05·08·10·11.
// (CALC-04 퇴직금은 severanceMonthEnd.test.ts, CALC-06 연봉 인상은 salaryRaiseParity.test.ts)
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MINIMUM_WAGE_2027 } from "@/config/minimumWage";
import { calculateNetSalary2026 } from "@/lib/calculator";
import { calculateNetSalary2027 } from "@/lib/generateData2027";

vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
}));
import JanuaryBonusClient from "@/app/calc/january-bonus/Client";
import {
  compareIncentiveTax,
  VENTURE_OPTION_TAX_FREE_LIMIT,
} from "@/app/calc/incentive-tax/Client";

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");
const SETTINGS = { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 };

describe("CALC-05 /year-end-tax — 화면에 없는 입력은 0", () => {
  it("입력란이 없는 항목은 초기값이 0 이다 (숨은 기본값 금지)", () => {
    const src = read("src/components/YearEndTaxCalculator.tsx");
    const start = src.indexOf("useState<TaxInputs>({");
    const end = src.indexOf("});", start);
    const block = src.slice(start, end);
    // 총급여에서 매번 다시 파생되는 4대보험 3종은 제외
    const derived = new Set(["nationalPension", "healthInsurance", "employmentInsurance"]);
    const hidden: string[] = [];
    for (const m of block.matchAll(/^\s*(\w+):\s*([^,\n]+),/gm)) {
      const [, key, value] = m;
      if (derived.has(key)) continue;
      const bound =
        src.includes(`handleInputChange("${key}"`) || src.includes(`handleNumberChange("${key}"`);
      if (!bound && value.trim() !== "0") hidden.push(`${key}=${value.trim()}`);
    }
    expect(hidden).toEqual([]);
    expect(block).toMatch(/traditionalMarket: 0,/);
    expect(block).toMatch(/publicTransport: 0,/);
  });
});

describe("CALC-08 /minimum-wage-2027 — 2027 요율 엔진", () => {
  const page = read("src/app/minimum-wage-2027/page.tsx");

  it("표는 /table/2027 과 같은 calculateNetSalary2027 을 식대 비과세 0원으로 쓴다", () => {
    expect(page).toContain("calculateNetSalary2027(YEARLY_2027, 0, 1, 0, DEFAULT_SETTINGS)");
    expect(page).not.toContain("calculateNetSalary2026(");
    expect(page).toContain("식대 비과세 0원 가정(/table/2027은 20만원 가정)");
  });

  it("국민연금 공제는 2027 법정 요율 5.0% (2026 요율 4.75% 보다 크다)", () => {
    const y = MINIMUM_WAGE_2027.yearly;
    const r27 = calculateNetSalary2027(y, 0, 1, 0, SETTINGS);
    const r26 = calculateNetSalary2026(y, 0, 1, 0, SETTINGS);
    expect(r27.pension).toBe(Math.round(MINIMUM_WAGE_2027.monthly * 0.05));
    expect(r27.pension).toBeGreaterThan(r26.pension);
    expect(r27.health).toBe(r26.health); // 건강보험은 2026 준용
    expect(page).toContain('label: "국민연금 (2027년 5.0%)"');
  });

  it("국민연금 인상을 '오를 예정'이 아니라 법정 인상 일정 확정으로 쓴다", () => {
    expect(page).not.toContain("오를 예정");
    expect(page.split("법정 인상 일정 확정").length - 1).toBeGreaterThanOrEqual(2);
    // 건강보험·장기요양·간이세액표 2026 준용 단서는 유지
    expect(page).toContain("건강보험·장기요양·고용보험·간이세액표는 2026년 기준");
  });
});

describe("CALC-10 /calc/january-bonus — IRP 세액공제 소득세분 15%/12%", () => {
  it("기본 입력(총급여 5,000만·IRP 300만)의 소득세분 공제는 45만원 (지방세 포함 16.5% 이중 반영 금지)", () => {
    const html = renderToStaticMarkup(createElement(JanuaryBonusClient));
    expect(html).toContain("IRP 세액공제(소득세분)");
    expect(html).toContain("450,000원");
    expect(html).not.toContain("495,000원");
    expect(html).toContain('data-test-ad="result"');
  });

  it("소스에 지방세 포함 공제율(0.165/0.132)이 소득세 단계에 남아 있지 않다", () => {
    const src = read("src/app/calc/january-bonus/Client.tsx");
    expect(src).toContain("salary > 55_000_000 ? 0.12 : 0.15");
    expect(src).not.toMatch(/0\.165|0\.132/);
  });
});

describe("CALC-11 /calc/incentive-tax — 벤처 스톡옵션 비과세 연 2억원", () => {
  it("비과세 한도는 연 2억원 (조특법 §16의2, 2023년 행사분부터)", () => {
    expect(VENTURE_OPTION_TAX_FREE_LIMIT).toBe(200_000_000);
  });

  it("2억원 이하 행사이익은 세금 0 — 종전 5,000만원 한도라면 과세됐을 1억원도 비과세", () => {
    for (const incentive of [30_000_000, 100_000_000, 200_000_000]) {
      const r = compareIncentiveTax(80_000_000, incentive);
      expect(r.separateTotal).toBe(0);
      expect(r.separateNet).toBe(incentive);
      expect(r.taxFreeAmount).toBe(incentive);
      expect(r.benefit).toBeCloseTo(r.combinedTotal, 6);
    }
  });

  it("2억원 초과분은 20% 정액이 아니라 ① 합산(누진) 경로로 과세한다", () => {
    const salary = 80_000_000;
    const r = compareIncentiveTax(salary, 300_000_000);
    const excessOnly = compareIncentiveTax(salary, 100_000_000);
    expect(r.taxedAmount).toBe(100_000_000);
    expect(r.separateTotal).toBeCloseTo(excessOnly.combinedTotal, 6);
    expect(r.separateTotal).not.toBeCloseTo(100_000_000 * 0.2 * 1.1, 0);
    expect(r.separateTotal).toBeLessThan(r.combinedTotal);
  });

  it("페이지 FAQ·본문이 연 2억원·누적 5억원 기준이고 옛 5,000만원·20% 분리과세 문구가 없다", () => {
    const page = read("src/app/calc/incentive-tax/page.tsx");
    const client = read("src/app/calc/incentive-tax/Client.tsx");
    expect(page).toContain("연 2억원, 벤처기업별 누적 5억원까지 소득세가 비과세됩니다");
    expect(page).toContain("2023년 행사분부터");
    expect(page).toContain("제16조의4");
    expect(page).not.toMatch(/연 5,000만원|분리과세 20%|분리과세\(20% 세율\)/);
    // 결과 카드 문구와 20% 정액 계산식 (주석 속 연혁 설명은 허용)
    expect(client).not.toMatch(/<li>• 5천만원|<li>• 4대보험 부과 안 됨|taxedAmount \* 0\.2|separateTax\b/);
    expect(client).toContain("<li>• 연 2억원 비과세 (누적 5억원 한도)</li>");
  });
});
