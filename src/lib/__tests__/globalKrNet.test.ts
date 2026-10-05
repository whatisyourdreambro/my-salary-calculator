// /global 한국 세후 정정 회귀 가드 (2026-10-05 감사 code40-05·code11-06)
// KR 소득세 = 정본 estimateAnnualIncomeTax2026 + 지방소득세 10% — 6,000만원 4,474,730원(종전 5,827,500원)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { GlobalTaxEngine, EXCHANGE_RATES } from "@/lib/global/taxEngine";
import { estimateAnnualIncomeTax2026 } from "@/lib/bonusTaxCalc";
import { CURRENT_INSURANCE_RATES } from "@/config/currentRates";

describe("GlobalTaxEngine KR", () => {
  it("6,000만원 — 소득세 4,474,730원, 세후 약 4,969만원", () => {
    const r = GlobalTaxEngine.calculate(60_000_000, "KR");
    expect(Math.round(r.tax)).toBe(4_474_730);
    expect(Math.round(r.tax)).toBe(Math.round(estimateAnnualIncomeTax2026(60_000_000, CURRENT_INSURANCE_RATES) * 1.1));
    expect(Math.floor(r.net / EXCHANGE_RATES.KR / 10_000)).toBe(4_969);
  });
  it("메타 설명의 한국 세후는 약 4,970만원 (미국·싱가포르 수치는 엔진 값과 그대로 일치)", () => {
    const layout = readFileSync(resolve(process.cwd(), "src/app/global/layout.tsx"), "utf8");
    expect(layout).toContain("한국 세후 약 4,970만원");
    const us = GlobalTaxEngine.calculate(60_000_000, "US");
    const sg = GlobalTaxEngine.calculate(60_000_000, "SG");
    expect(Math.round(us.net / EXCHANGE_RATES.US / 1_000_000) * 100).toBe(4_400);
    expect(Math.round(sg.net / EXCHANGE_RATES.SG / 1_000_000) * 100).toBe(5_800);
  });
});
