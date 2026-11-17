// R4 CONTENT2 (2026-11-18) N2-app-pages-20 영문 거울 — /en/privacy 에 LinkPrice.
// /en/privacy 의 본문은 en/layout 의 EnglishPageExtras(PageFooterAds) 위에 그려지므로, 운영자 승인 조건대로
// 각 문단을 옛 문단보다 좁게만 바꿨다(사이트 글꼴 폭과 줄바꿈 모의로 확인). 스윕에서 광고가 1px 이라도
// 내려가면 이 커밋만 되돌리고 한국어 처리방침만 게시한다.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/en/privacy", useSearchParams: () => new URLSearchParams("") }));

import EnglishPrivacy from "@/app/en/privacy/page";

const OLD = {
  cookies: "Advertising and analytics cookies may be provided by Google AdSense, Google Analytics 4 and Coupang Partners.",
  purposes: "Google Analytics 4 is used for traffic analysis, and Google AdSense for advertising, including personalized advertising. Coupang Partners tracks affiliate referrals; qualifying purchases may earn a commission without changing the purchase price.",
  providers: "Google LLC provides Google AdSense and Google Analytics. Coupang provides Coupang Partners. Cloudflare, Inc. provides hosting and storage for private messages and fixed page feedback. Each provider has its own privacy policy.",
  updated: "English version updated November 1, 2026. This explains the same site practices as the Korean policy.",
};
const NEW = {
  cookies: "Ad, analytics and affiliate cookies may come from AdSense, Google Analytics, Coupang Partners and LinkPrice.",
  purposes: "Google Analytics 4 measures traffic, and Google AdSense serves ads, including personalized ads. Coupang Partners and LinkPrice track affiliate referrals; qualifying purchases or sign-ups may earn a commission at no extra cost to you.",
  providers: "Google LLC (AdSense, Analytics), Coupang (Coupang Partners), LinkPrice (financial affiliate links) and Cloudflare, Inc. (hosting and storage for private messages and fixed page feedback) each have their own privacy policy.",
  updated: "English version updated November 18, 2026. This explains the same practices as the Korean policy.",
};

describe("N2-app-pages-20 /en/privacy — LinkPrice in the English mirror, no wider than before", () => {
  const html = renderToStaticMarkup(createElement(EnglishPrivacy));
  const text = html.replace(/<[^>]+>/g, "");

  it("names LinkPrice in the cookie, purpose and provider paragraphs", () => {
    expect(text).toContain(NEW.cookies);
    expect(text).toContain(NEW.purposes);
    expect(text).toContain(NEW.providers);
    for (const old of Object.values(OLD)) expect(text).not.toContain(old);
  });

  it("dates the English version to the real edit day", () => {
    expect(html).toContain('<time dateTime="2026-11-18">November 18, 2026</time>');
    expect(text).toContain(NEW.updated);
  });

  it("every changed paragraph is not longer than the one it replaces (above PageFooterAds)", () => {
    for (const key of Object.keys(OLD) as (keyof typeof OLD)[]) {
      expect(NEW[key].length).toBeLessThanOrEqual(OLD[key].length);
    }
  });
});
