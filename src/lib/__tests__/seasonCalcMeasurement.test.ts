// 연말정산 시즌 계산기 calc_start/calc_success/result_view 배선 회귀 가드 (2026-09-26 W1-A — SEASON-02)
//
// 배경: useCalculatorMeasurement 를 쓰는 계산기 16곳 중 연말정산 계산기는 하나도 없어, 시즌 클러스터의
// GA4 calc_start·calc_success 가 0 이었다. /year-end-tax(홈 연말정산 탭 포함)와 비-/calc 정밀 계산기 4종에
// 같은 훅을 배선한다. /calc/* 4종과 IRP 는 10/10 동결 해제 뒤 별도 배치.
// 원칙(bonusCalcMeasurement.test.ts 와 같음): 기존 입력 컨테이너에만 inputProps, 기존 결과 요소에만 resultRef,
// DOM 노드·래퍼 추가 없음, 금액 미전송(훅만 사용).

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/year-end-tax" }));

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

const CALCS = [
  { file: "src/components/YearEndTaxCalculator.tsx", calcType: "year_end_tax", spreads: 1, contentProps: 3, resultRefs: 1 },
  { file: "src/app/credit-card-deduction-2026/Client.tsx", calcType: "credit_card_deduction_2026", spreads: 3, contentProps: 0, resultRefs: 1 },
  { file: "src/app/medical-tax-credit-2026/Client.tsx", calcType: "medical_tax_credit_2026", spreads: 3, contentProps: 0, resultRefs: 1 },
  // 결과는 공제 가능 카드·요건 미충족 카드 중 하나만 렌더 — 두 카드에 같은 ref
  { file: "src/app/rent-tax-credit-2026/Client.tsx", calcType: "rent_tax_credit_2026", spreads: 4, contentProps: 0, resultRefs: 2 },
  { file: "src/app/donation-tax-credit-2026/Client.tsx", calcType: "donation_tax_credit_2026", spreads: 2, contentProps: 0, resultRefs: 1 },
];

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "__tests__" || name === "node_modules") continue;
      yield* walk(p);
    } else if (/\.tsx?$/.test(name)) yield p;
  }
}

describe("연말정산 시즌 계산기 계측 배선", () => {
  for (const { file, calcType, spreads, contentProps, resultRefs } of CALCS) {
    it(`${calcType}: 훅·calc_type·입력 영역·결과 ref`, () => {
      const src = read(file);
      expect(src).toContain('import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";');
      expect(src).toContain(`calcType: "${calcType}"`);
      expect(src.match(/\{\.\.\.measurement\.inputProps\}/g)?.length ?? 0).toBe(spreads);
      expect(src.match(/contentProps=\{measurement\.inputProps\}/g)?.length ?? 0).toBe(contentProps);
      expect(src.match(/ref=\{measurement\.resultRef\}/g)?.length).toBe(resultRefs);
      // valid 는 입력 유효성 + 결과 유한성
      expect(src).toMatch(/valid:[^;]*\.every\(Number\.isFinite\)/);
      // 직접 gtag·trackEvent 호출 없이 훅만 사용 (금액 전송 경로 차단)
      expect(src).not.toMatch(/trackEvent\(|trackCalcSuccess\(|trackCalcStart\(|window\.gtag/);
    });
  }

  it("calc_type 은 사이트 전체에서 하나씩만 쓴다", () => {
    const all = [...walk(resolve(process.cwd(), "src"))].map((p) => readFileSync(p, "utf8")).join("\n");
    for (const { calcType } of CALCS) {
      expect(all.split(`calcType: "${calcType}"`).length - 1).toBe(1);
    }
  });

  it("/year-end-tax 아코디언 헤더 토글 버튼은 계산 시작으로 치지 않는다 (내용 div 에만 inputProps)", () => {
    const src = read("src/components/YearEndTaxCalculator.tsx");
    const spreadLine = src.split("\n").find((line) => line.includes("{...contentProps}"));
    expect(spreadLine).toContain('className="p-4 space-y-4 bg-card border-t border-border"');
    const header = src.slice(src.indexOf("<h3 className=\"text-lg font-semibold\">"), src.indexOf("</h3>"));
    expect(header).not.toContain("contentProps");
    expect(header).not.toContain("inputProps");
    // '리포트 보기' 토글도 입력 영역 밖
    const reportToggle = src.indexOf("setShowReport(!showReport)");
    const simulator = src.indexOf("{...measurement.inputProps}");
    expect(reportToggle).toBeGreaterThan(-1);
    expect(simulator).toBeGreaterThan(reportToggle);
  });

  it("정밀 계산기 4종은 계측 속성 없이 같은 결과 카드를 서버 렌더한다", async () => {
    const headings: Record<string, string> = {
      "credit-card-deduction-2026": "최종 소득공제액 (2026년 귀속 기준)",
      "medical-tax-credit-2026": "의료비 세액공제액 (2026년 귀속)",
      "rent-tax-credit-2026": "예상 월세 세액공제액 (2026년 귀속)",
      "donation-tax-credit-2026": "예상 기부금 세액공제액 (2026년 귀속)",
    };
    for (const [route, heading] of Object.entries(headings)) {
      const mod = (await import(`@/app/${route}/Client`)) as { default: ComponentType };
      const html = renderToStaticMarkup(createElement(mod.default));
      expect(html).toContain(heading);
      expect(html).not.toContain("inputProps");
      expect(html).not.toContain("resultRef");
    }
  });
});
