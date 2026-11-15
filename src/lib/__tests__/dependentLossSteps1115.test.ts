// /health-insurance-dependent — '자격 상실 안내를 받았다면 — 확인할 4가지' 블록 (2026-11-15 SEASONB, app-pages ideas[0]).
// 운영자 결정 2번(2026-11-13): 마지막 광고 아래 새 표·링크 줄은 동결 기간에도 허용. 이 페이지의 마지막 광고는 CoupangBanner 다.
//   1) 블록은 모든 광고 태그보다 아래(소스 순서 + SSR DOM 순서)이고 RelatedCalculators 앞이다 — 광고 위 높이 불변.
//   2) 문장은 조문(국가법령정보센터 현행 조문, 2026-11-15 확인)만 근거로 한다: 상실일 = 공단 확인일 다음 날(시행규칙 제2조 제3항 제9호),
//      보험료 = 자격 취득일이 속한 달의 다음 달분부터·1일 취득이면 그 달분(법 제69조 제2항), 납부 = 다음 달 10일(법 제78조 제1항),
//      소득 조정 신청(시행령 제41조의2), 이의신청 90일(법 제87조 제3항), 임의계속가입 18개월 중 통산 1년·첫 지역보험료 납부기한 + 2개월·
//      최대 36개월(법 제110조, 시행규칙 제62조, 시행령 제77조).
//   3) 조문이 정하지 않는 날짜('12월 1일자' 등)는 이 블록에 없다.
// 이 블록이 스윕에서 문제가 되면 이 커밋(블록 + 이 테스트)만 되돌린다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => createElement("div", { "data-test-ad": "home-top" }),
  InArticleAd: () => createElement("div", { "data-test-ad": "in-article" }),
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
  GuideMidAd: () => createElement("div", { "data-test-ad": "guide" }),
}));
vi.mock("@/components/CoupangBanner", () => ({
  default: () => createElement("div", { "data-test-ad": "coupang" }),
}));
vi.mock("@/components/RelatedCalculators", () => ({
  default: () => createElement("div", { "data-test": "related-calculators" }),
}));
vi.mock("@/components/ShareButtons", () => ({ default: () => null }));
vi.mock("@/components/EditorialTrustNote", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));

import HealthInsuranceDependentPage from "@/app/health-insurance-dependent/page";

const FILE = "src/app/health-insurance-dependent/page.tsx";
const AD_TAG = /<(HomeTopAd|InArticleAd|CalcResultAd|GuideMidAd|MultiplexAd|Display2Ad|CoupangBanner|OfferSlot)\b/g;

describe("/health-insurance-dependent — 자격 상실 뒤 확인할 4가지 블록 (SEASONB ideas[0])", () => {
  const src = readFileSync(resolve(process.cwd(), FILE), "utf8");
  const html = renderToStaticMarkup(createElement(HealthInsuranceDependentPage));
  const flat = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");

  it("소스에서 모든 광고 태그보다 아래, RelatedCalculators 보다 위", () => {
    const at = src.indexOf('aria-labelledby="dependent-loss-steps"');
    expect(at).toBeGreaterThan(-1);
    const ads = [...src.matchAll(AD_TAG)].map((m) => m.index ?? Infinity);
    expect(ads.length).toBeGreaterThanOrEqual(5);
    for (const a of ads) expect(a).toBeLessThan(at);
    expect(at).toBeLessThan(src.indexOf("<RelatedCalculators"));
  });

  it("SSR DOM 에서도 마지막 광고(쿠팡) 뒤, 관련 계산기 앞", () => {
    const block = html.indexOf('id="dependent-loss-steps"');
    expect(block).toBeGreaterThan(-1);
    const lastAd = html.lastIndexOf("data-test-ad=");
    expect(html.slice(lastAd, lastAd + 30)).toContain("coupang");
    expect(lastAd).toBeLessThan(block);
    expect(block).toBeLessThan(html.indexOf('data-test="related-calculators"'));
  });

  it("확인일과 4개 항목 — 조문 근거와 함께", () => {
    expect(html).toContain('<time dateTime="2026-11-15">2026년 11월 15일</time>');
    const section = flat.slice(flat.indexOf("자격 상실 안내를 받았다면"));
    for (const t of [
      "그 확인한 날의 다음 날 피부양자 자격을 잃고 지역가입자가 됩니다(시행규칙 제2조 제3항 제9호)",
      "자격을 얻은 날이 속한 달의 다음 달분부터, 1일에 얻었다면 그 달분부터 부과되고(법 제69조 제2항)",
      "매달 보험료는 다음 달 10일까지 냅니다(법 제78조 제1항)",
      "공단에 소득 조정을 신청할 수 있습니다(시행령 제41조의2)",
      "있음을 안 날부터 90일 이내에 문서로 이의신청합니다(법 제87조 제3항)",
      "퇴직 전 18개월 동안 직장가입 기간이 통산 1년 이상이면",
      "납부기한에서 2개월이 지나기 전까지 임의계속가입을 신청할 수 있고",
      "최대 36개월 직장가입자 자격을 유지합니다(법 제110조, 시행규칙 제62조, 시행령 제77조)",
    ]) {
      expect(section).toContain(t);
    }
  });

  it("링크는 있는 페이지 2곳뿐이고, 조문에 없는 상실 날짜를 단정하지 않는다", () => {
    const block = src.slice(src.indexOf('aria-labelledby="dependent-loss-steps"'), src.indexOf("<RelatedCalculators"));
    const hrefs = [...block.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(["/health-insurance-fee-2026", "/guides/health-insurance-continue-after-retire-2026"]);
    expect(block).not.toMatch(/12월 1일/);
    expect(block).not.toContain("data-msy-module");
  });
});
