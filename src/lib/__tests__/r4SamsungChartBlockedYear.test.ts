// /calc/samsung-bonus 다년도 막대 그래프 — 임계값 미달 연도도 OPI1 세후 막대를 그리고 'OPI2 0원'으로 표기 (R4 SAMSUNG, N2-calc-07 calc-03-F10, 2026-11-18)
//
// 미달 연도에도 OPI1(연봉 × 지급률)은 지급된다(계산 결과의 세후가 0보다 크다). 종전 그래프는 세후 막대를 숨기고 툴팁에
// '⚠ 임계값 미달 — 0원'이라 써 바로 위 '세후: …' 줄과 어긋났다. SVG 는 viewBox 고정(w-full h-auto)이라 높이가 내용과 무관하고,
// 범례 글자는 더 좁다(사이트 글꼴 400·11px 75.40px -> 70.56px).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-bonus/MultiYearBonusSimulator.tsx"), "utf8");

describe("다년도 그래프 미달 연도 (N2-calc-07 calc-03-F10)", () => {
  it("세후 막대는 미달 연도에도 그린다(빨강), ✕ 는 막대 위", () => {
    expect(src).not.toMatch(/\{!blocked && \(\s*<rect/);
    expect(src).toContain('fill={blocked ? "#EF4444" : color}');
    expect(src).toContain("y={Math.min(padT + innerH - 6, netY - 4)}");
  });
  it("툴팁·범례는 OPI2 만 0원", () => {
    expect(src).toContain("⚠ 임계값 미달 — OPI2 0원");
    expect(src).toContain("OPI2 미달 (0원)");
    expect(src).not.toContain("임계값 미달 — 0원");
    expect(src).not.toContain("임계값 미달 (0원)");
  });
});
