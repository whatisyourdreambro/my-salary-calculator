// /home-loan 본문 예시 수치 회귀 가드 (2026-10-05 감사 code12-05)
// 5억·4%·30년: 원리금균등 총 이자 359,347,532원 − 원금균등 300,833,333원 = 58,514,199원 ≈ 5,851만원
// (페이지 자체 시뮬레이터 엔진 calculateHomeLoanRepayment 기준 — 종전 본문 5,893만원)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calculateHomeLoanRepayment } from "@/lib/homeLoanRepayment";

describe("/home-loan 원리금균등 vs 원금균등 예시", () => {
  it("총 이자 차이는 엔진 값 5,851만원", () => {
    const annuity = calculateHomeLoanRepayment(500_000_000, 4, 30, "equalPrincipalAndInterest");
    const principal = calculateHomeLoanRepayment(500_000_000, 4, 30, "equalPrincipal");
    const diff = Math.round(annuity.totalInterest - principal.totalInterest);
    expect(Math.floor(diff / 10_000)).toBe(5_851);
    const src = readFileSync(resolve(process.cwd(), "src/app/home-loan/page.tsx"), "utf8");
    expect(src).toContain("총 이자 차이 약 5,851만원");
    expect(src).not.toContain("5,893만원");
  });
});
