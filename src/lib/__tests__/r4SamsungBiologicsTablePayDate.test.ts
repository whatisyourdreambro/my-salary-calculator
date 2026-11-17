// /calc/samsung-biologics-bonus 지급 이력 표 — 2025 실적분 OPI 지급 시기 '2026년 1월 (예상)' -> '2026년 1월' (R4 SAMSUNG, N2-calc-13 calc-03-F04, 2026-11-18)
//
// 표는 CalcResultAd 아래 · GuideMidAd 위. 이 칸은 '지급 시기' 열의 최장 글(2025년 12월 지급분)보다 짧아 열 폭(최대 내용 폭)이
// 그대로다 — 자동 표 배치 근사 시뮬레이션(320~1920px)에서 표 높이가 느는 폭 0. 이 커밋만 되돌릴 수 있게 단언을 따로 둔다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-biologics-bonus/page.tsx"), "utf8");

describe("삼성바이오로직스 지급 이력 표 — OPI 2025 실적분 지급 시기", () => {
  it("'(예상)' 없이 2026년 1월", () => {
    expect(page).toContain('<td className="py-2 pr-4">OPI 2025년 실적분</td>');
    expect(page).toContain('<td className="py-2 pr-4">2026년 1월</td>');
    expect(page).not.toContain("2026년 1월 (예상)");
  });
});
