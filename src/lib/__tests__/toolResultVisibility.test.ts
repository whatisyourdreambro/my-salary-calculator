// 도구 계산기 결과가 배경과 같은 색이라 안 보이던 문제·퍼센트 계산기 입력 공유 회귀 가드 (2026-10-05 감사 code26-01·02·03)
//
// - code26-01: bg-electric(파랑) 결과 상자 안 결과값이 text-primary(같은 파랑) — D-Day·근무일·더치페이·유류비·단위변환,
//   /fun/salary-rank 결과 문장 두 칸. 9/10 4eda6889e 가 '.bg-electric * { color:#fff !important }' 를 지운 뒤부터.
// - code26-03: 밝은 배경 위 text-[rgba(255,255,255,0.8)] — CAGR 결과·아이콘, BMI 저체중, /tools/math 증감율 0 이하.
// - code26-02: /tools/math 퍼센트 카드 3장이 val1/val2 한 쌍을 공유해 다른 카드 결과가 틀렸다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { changeColorClass, percentResults, toNum } from "@/lib/percentCalculator";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");

describe("퍼센트 계산기 카드별 독립 (code26-02)", () => {
  it("카드 1만 입력하면 카드 2·3 은 0 (종전 0.04%·+249900.00%)", () => {
    const r = percentResults({ whole: 50_000, percent: 20 }, { part: "", whole: "" }, { from: "", to: "" });
    expect(r.res1).toBe(10_000);
    expect(r.res2).toBe(0);
    expect(r.res3).toBe(0);
  });
  it("카드 3 입력이 카드 1 결과를 바꾸지 않는다", () => {
    const r = percentResults({ whole: 50_000, percent: 20 }, { part: "", whole: "" }, { from: 100, to: 120 });
    expect(r.res1).toBe(10_000);
    expect(r.res3).toBeCloseTo(20, 10);
  });
  it("비중 = 일부 / 전체", () => {
    expect(percentResults({ whole: "", percent: "" }, { part: 25, whole: 200 }, { from: "", to: "" }).res2).toBe(12.5);
  });
  it("증감율 — 변경값 0 은 미입력이 아니라 -100% (2026-11-15 lib-b07-F01, 종전 0.00%)", () => {
    const emptyRatio = { whole: "" as const, percent: "" as const };
    const emptyShare = { part: "" as const, whole: "" as const };
    expect(percentResults(emptyRatio, emptyShare, { from: 100, to: 0 }).res3).toBe(-100);
    expect(percentResults(emptyRatio, emptyShare, { from: -50, to: 0 }).res3).toBe(-100);
    // 기존값 0 은 나눌 수 없어 계속 0(계산 안 함), 한쪽 빈칸도 0
    expect(percentResults(emptyRatio, emptyShare, { from: 0, to: 50 }).res3).toBe(0);
    expect(percentResults(emptyRatio, emptyShare, { from: "", to: 0 }).res3).toBe(0);
    expect(percentResults(emptyRatio, emptyShare, { from: 100, to: "" }).res3).toBe(0);
    expect(changeColorClass(-100)).toBe("text-rose-600 dark:text-rose-400");
  });
  it("toNum — 빈칸은 미입력", () => {
    expect(toNum("")).toBe("");
    expect(toNum("12.5")).toBe(12.5);
  });
  it("컴포넌트는 카드별 상태와 value 를 쓴다", () => {
    const src = readSrc("src/components/calculators/MathCalculators.tsx");
    expect(src).not.toMatch(/setVal1|setVal2/);
    for (const v of ["ratioWhole", "ratioPercent", "sharePart", "shareWhole", "changeFrom", "changeTo"]) {
      expect(src).toContain(`value={${v}}`);
    }
  });
});

describe("밝은 배경 위 흰 글자 제거 (code26-03)", () => {
  it("증감율 0 이하도 보이는 색", () => {
    expect(changeColorClass(5)).toBe("text-primary");
    expect(changeColorClass(0)).toBe("text-navy");
    expect(changeColorClass(-3)).toContain("text-rose-600");
  });
  it("CAGR·BMI·퍼센트 계산기에 rgba(255,255,255,0.8) 글자색이 없다", () => {
    for (const f of [
      "src/components/calculators/finance/CagrCalculator.tsx",
      "src/components/calculators/health/BmiCalculator.tsx",
      "src/components/calculators/MathCalculators.tsx",
    ]) {
      expect(readSrc(f)).not.toContain("text-[rgba(255,255,255,0.8)]");
    }
  });
});

describe("파랑 위 파랑 결과값 제거 (code26-01)", () => {
  it("bg-electric 결과 상자 안 결과값은 text-white", () => {
    for (const f of [
      "src/components/calculators/date/DateCalculators.tsx",
      "src/components/calculators/life/LifeCalculators.tsx",
    ]) {
      const src = readSrc(f).replace(/\r\n/g, "\n");
      const boxes = src.match(/<div className="mt-6 p-6 bg-electric rounded-xl border border-canvas text-center">[\s\S]*?<\/div>/g) ?? [];
      expect(boxes.length).toBeGreaterThan(0);
      for (const b of boxes) {
        expect(b).not.toContain("text-primary");
        expect(b).toContain("font-black text-white");
      }
    }
  });
  it("연봉 티어 카드(bg-electric) 결과 문장의 강조 두 칸", () => {
    const src = readSrc("src/components/calculators/SalaryRankCalculator.tsx");
    expect(src).toContain('<span className="text-white font-bold">{selectedLabel}</span>');
    expect(src).toContain('<span className="text-white font-bold">{100 - result.percentile}%</span>');
  });
});
