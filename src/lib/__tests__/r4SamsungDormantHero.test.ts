// /calc/samsung-bonus 히어로의 잠정실적 문장(1월 발표 뒤에만 그려지는 가지) — '전사' 영업이익·DS부문 재원 (R4 SAMSUNG, N2-calc-02 4단계 = N2-calc-07 calc-03-F07, 2026-11-18)
//
// 1월 8일 전후 잠정실적은 전사 연결 합계뿐이다. 종전 가지 '2026년 연간 영업이익 잠정 N조 … 기준 · 10.5% 재원'은 전사 값을
// 재원(DS부문 영업이익 × 10.5%)의 기준처럼 읽혔다. 2026-11-18 현재 annualOp announced=false 라 그려지지 않는다(화면 변화 0) —
// 발표 날 annualOp 를 채워도 이 테스트는 그대로 통과해야 하므로 announced 값은 고정하지 않는다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const flat = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-bonus/page.tsx"), "utf8")
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
  .replace(/\s*\r?\n\s*/g, " ");

describe("삼성 성과급 히어로 잠정실적 가지 (calc-03-F07)", () => {
  it("문장: 2026년 전사 영업이익 잠정 N조(date 발표) · DS부문 영업이익 10.5% 재원·4:6 분배.", () => {
    const at = flat.indexOf("ANNUAL_OP_2026_PRELIM.announced && ANNUAL_OP_2026_PRELIM.profitTrillion != null ? (");
    const branch = flat.slice(at, flat.indexOf(") : (", at));
    expect(branch).toContain("2026년 전사 영업이익 잠정{\" \"}");
    expect(branch).toContain("({ANNUAL_OP_2026_PRELIM.date} 발표) · DS부문 영업이익{\" \"}");
    expect(branch).toContain("10.5%</strong>{\" \"} 재원·<strong className=\"text-navy dark:text-canvas-50\">4:6</strong>{\" \"} 분배.");
    expect(branch).not.toContain("연간 영업이익 잠정");
    expect(branch).not.toContain("잠정실적 발표) 기준");
  });
});
