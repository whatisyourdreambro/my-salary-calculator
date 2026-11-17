// /calc/samsung-bonus '계산 가정 조정' 안 4대보험 도움말 — 국민연금 7월 기준소득월액·건강보험 4월 정산을 구분 (R4 SAMSUNG, N2-calc-07 calc-03-F09 a, 2026-11-18)
//
// 종전 '이듬해 7월 보수월액 재산정'은 국민연금(7월 기준소득월액 정기결정)과 건강보험 용어(보수월액, 4월 연말정산)를 섞었다.
// 기본 접힘 details 안이라 첫 화면 높이 0.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const flat = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-bonus/Client.tsx"), "utf8").replace(/\s*\r?\n\s*/g, " ");

describe("삼성 성과급 4대보험 도움말 (N2-calc-07 calc-03-F09 a)", () => {
  it("국민연금 7월 기준소득월액 재산정, 건강보험 4월 정산", () => {
    expect(flat).toContain("실제 반영은 국민연금은 이듬해 7월 기준소득월액 재산정, 건강보험은 이듬해 4월 정산으로 이뤄지는 점도 참고하세요.");
    expect(flat).not.toContain("7월 보수월액");
  });
  it("도움말은 기본 접힘 details 안에 있다", () => {
    const at = flat.indexOf("기준소득월액 재산정, 건강보험은");
    const open = flat.lastIndexOf("<details", at);
    expect(open).toBeGreaterThan(-1);
    expect(flat.indexOf("</details>", open)).toBeGreaterThan(at);
    expect(flat.slice(open, flat.indexOf(">", open))).not.toMatch(/\bopen\b/);
  });
});
