// /calc/samsung-biologics-bonus 주의 상자 — '2025년 하반기 TAI·향후 연도 지급률은 미확정' -> '향후 연도 지급률은 미확정' (R4 SAMSUNG, N2-calc-13 calc-03-F04, 2026-11-18)
//
// 2025 하반기 TAI 는 50% 수준으로 보도됐다(쿠키뉴스 2026-06-11). 상자는 GuideMidAd 아래 · 쿠팡·레이아웃 광고 위라 낱말만 뺀다
// (줄 시뮬레이션 320~1920px 줄이 느는 폭 0, 주는 폭 189).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const flat = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-biologics-bonus/page.tsx"), "utf8").replace(/\s*\r?\n\s*/g, " ");

describe("삼성바이오로직스 주의 상자", () => {
  it("2025 하반기 TAI 를 미확정이라 하지 않는다", () => {
    expect(flat).toContain("공개 보도 기반 추정. 향후 연도 지급률은 미확정이며, 실제 지급은 사업부문·평가·근속에 따라 차이 날 수 있습니다.");
    expect(flat).not.toContain("2025년 하반기 TAI·향후");
  });
});
