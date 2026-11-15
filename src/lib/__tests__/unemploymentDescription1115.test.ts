// /unemployment-benefit — 검색 설명·SoftwareApplication 설명에 2026 1일 상·하한 (2026-11-15 SEASONB, app-pages ideas[6]).
// '실업급여 상한액'·'하한액' 검색에 설명에서 바로 답한다. 금액은 정본 상수(config/unemploymentBenefit)에서 만든다 —
// 1월 고시·최저임금 전환 때 상수만 바꾸면 설명도 따라간다. 제목·H1·화면은 그대로(설명은 보이지 않는 메타).
// 근거(2026-11-15): 고용보험법 시행령 [대통령령 제36588호] 제68조 제1항 임금일액 상한 113,500원(개정 2025. 12. 23.) × 60%
// (고용보험법 제46조 제1항 제1호) = 68,100원, 최저구직급여일액 = 최저시급 10,320원 × 80% × 8시간 = 66,048원(같은 조 제1항 제2호).
// 35일 규칙: 이 쪽 설명의 직전 변경은 2026-08-07(0e331686a) — 그 뒤 35일 넘게 손대지 않았다. 기록은 docs/gsc-sniping-log.md.
import { createElement, type AnchorHTMLAttributes, type InputHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/NumberInput", () => ({
  default: (props: InputHTMLAttributes<HTMLInputElement>) => createElement("input", props),
}));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => null,
  InArticleAd: () => null,
  CalcResultAd: () => null,
  GuideMidAd: () => null,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));

import UnemploymentBenefitPage, { metadata } from "@/app/unemployment-benefit/page";
import { UNEMPLOYMENT_BENEFIT_2026, unemploymentDailyLowerBound } from "@/config/unemploymentBenefit";

const EXPECTED =
  "2026년 실업급여(구직급여) 수령액을 즉시 계산. 1일 상한 68,100원·하한 66,048원(8시간 기준) 반영. 월급·가입기간 입력 → 예상 지급액과 지급 일수 자동 계산. 자진 퇴사 예외 조건, 신청 방법까지 정리.";

describe("/unemployment-benefit 검색 설명 (SEASONB ideas[6])", () => {
  it("메타 설명은 상·하한을 담고, 금액은 정본 상수와 같다", () => {
    expect(metadata.description).toBe(EXPECTED);
    expect(UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER).toBe(68_100);
    expect(Math.round(unemploymentDailyLowerBound())).toBe(66_048);
    expect(EXPECTED.length).toBeLessThanOrEqual(130);
  });

  it("OG·Twitter 설명과 SoftwareApplication JSON-LD 설명도 같은 문장", () => {
    const og = metadata.openGraph as { description?: string } | undefined;
    if (og?.description !== undefined) expect(og.description).toBe(EXPECTED);
    const html = renderToStaticMarkup(createElement(UnemploymentBenefitPage));
    const app = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]) as Record<string, unknown>)
      .find((d) => d["@type"] === "SoftwareApplication");
    expect(app?.description).toBe(EXPECTED);
  });

  it("제목은 그대로", () => {
    const title = typeof metadata.title === "string" ? metadata.title : (metadata.title as { absolute?: string })?.absolute;
    expect(String(title)).toContain("실업급여 계산기 2026 — 수령액·기간·신청 조건 즉시 계산");
  });
});
