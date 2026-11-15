// /calc/hd-hyundai-bonus 면책 안내 마지막 문장 (2026-11-15 N2-calc-09 calc-02-F01 안내 줄)
//
// 2026 임단협은 10/27 가결됐으므로 '2026년 최종 합의 미확정.' 은 틀린 문장. 남은 미확정은 2026년분 연말 지급률이다.
// 줄은 GuideMidAd 아래·쿠팡 배너와 calc 레이아웃 광고 위 — 한글 8자 그대로, 공백 하나 줄어 14px 144.25px -> 140.74px.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/hd-hyundai-bonus/page.tsx"), "utf8");

describe("HD현대중공업 면책 안내 (calc-02-F01)", () => {
  it("2026년분 지급률 미확정, 최종 합의 미확정 문장 없음", () => {
    expect(page).toContain("2026년분 지급률 미확정.");
    expect(page).not.toContain("2026년 최종 합의 미확정");
  });
});
