import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { calculateInsuranceRateExample } from "../insuranceRateExample";

// Static source rendering only: external-service components never mount.
vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => ({
  InArticleAd: () => null, HomeTopAd: () => null, GuideMidAd: () => null,
  CalcResultAd: () => null, MultiplexAd: () => null,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));

import Rates2026 from "@/app/social-insurance-rates-2026/page";
import Rates2027 from "@/app/social-insurance-rates-2027/page";

// Same reported-income base in both years, with the tables' existing per-item
// 10-won truncation. These non-thousand examples previously overstated pension.
const examples = [
  { monthly: 4_166_667, base: 4_166_000, p2026: 197_880, p2027: 208_300,
    health: 149_790, longTermCare: 19_680, employment: 37_500, total2027: 415_270, diff: 10_420 },
  { monthly: 5_833_333, base: 5_833_000, p2026: 277_060, p2027: 291_650,
    health: 209_700, longTermCare: 27_550, employment: 52_490, total2027: 581_390, diff: 14_590 },
];

describe("insurance rate-page examples", () => {
  it.each(examples)("normalizes only the pension basis for $monthly won", row => {
    const current = calculateInsuranceRateExample(row.monthly, 2026);
    const next = calculateInsuranceRateExample(row.monthly, 2027);
    expect(current.pensionBase).toBe(row.base);
    expect(current.pension).toBe(row.p2026);
    expect(next).toMatchObject({ pensionBase: row.base, pension: row.p2027,
      health: row.health, longTermCare: row.longTermCare, employment: row.employment,
      total: row.total2027, diff2026: row.diff });
    expect(current.health).toBe(next.health);
    expect(current.longTermCare).toBe(next.longTermCare);
    expect(current.employment).toBe(next.employment);
    expect(next.total - current.total).toBe(row.diff);
  });

  it.each([
    [409_999, 410_000, 20_500], [410_000, 410_000, 20_500],
    [410_999, 410_000, 20_500], [411_000, 411_000, 20_550],
    [6_589_999, 6_589_000, 329_450], [6_590_000, 6_590_000, 329_500],
    [6_590_999, 6_590_000, 329_500],
  ])("applies floor, thousand boundary and cap at %i won", (monthly, base, pension) => {
    expect(calculateInsuranceRateExample(monthly, 2027)).toMatchObject({ pensionBase: base, pension });
  });

  it.each([0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "does not turn invalid %s into a floor-based example", monthly => {
      expect(() => calculateInsuranceRateExample(monthly, 2027)).toThrow(RangeError);
    },
  );

  it("preserves separately truncated contributions for the capped comparison", () => {
    expect(calculateInsuranceRateExample(8_333_333, 2027)).toMatchObject({
      pensionBase: 6_590_000, pension: 329_500, diff2026: 16_480,
    });
  });

  it.each([
    [Rates2026, "197,880", "277,060"],
    [Rates2027, "208,300", "291,650"],
  ] as const)("renders the corrected non-thousand sample pensions in the real page", (Page, first, second) => {
    const html = renderToStaticMarkup(createElement(Page));
    const table = /<tbody>([\s\S]*?)<\/tbody>/.exec(html)?.[1] ?? "";
    const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(match =>
      [...match[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(cell => cell[1].replace(/<[^>]+>/g, "")),
    );
    expect(rows.find(row => row[0] === "5,000만")?.[1]).toBe(first);
    expect(rows.find(row => row[0] === "7,000만")?.[1]).toBe(second);
  });

  it("keeps the visible pension answer and FAQ schema on the same bounded comparison", () => {
    const html = renderToStaticMarkup(createElement(Rates2027));
    const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .flatMap(match => { const value = JSON.parse(match[1]); return Array.isArray(value) ? value : [value]; });
    const faq = jsonLd.find(item => item["@type"] === "FAQPage");
    const answer = faq.mainEntity.find((item: { name: string }) => item.name === "2027년 국민연금은 내 월급에서 얼마나 더 빠지나요?").acceptedAnswer.text;
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, "");
    expect(visible).toContain(answer);
    for (const condition of ["같은 기준소득월액", "12개월 유지한 환산액", "7월 이후 조정은 미반영", "전체 실수령액 차이가 아닙니다"])
      expect(answer).toContain(condition);
  });
});
