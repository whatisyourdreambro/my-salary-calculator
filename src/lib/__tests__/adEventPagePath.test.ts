// 광고·제휴 이벤트 Page path 실경로 회귀 가드 (2026-09-25, 감사 승인 항목 4 — GA4 계측 수리 (b))
//
// 배경: GA4 페이지별 광고 이벤트 표에 "/monthly/[amount]"(ad_request_attempt 3,811)·
// "/salary/[amount]"(1,837) 행이 생겼다. 원인은 AdPlacement 가 아니라(usePathname 실경로를 넘김)
// trackEvent 의 금액 경로 비식별화 — page_location 까지 템플릿으로 바꿔 page_view·ad_impression
// (실경로 /monthly/3000000 등)과 조인이 끊겼다. 공개 정적 격자 페이지만, 광고·제휴 이벤트에서만 실경로를 유지한다.

import { afterEach, describe, expect, it, vi } from "vitest";
import { PAGE_SCOPED_MEASUREMENT_EVENTS, sanitizeAnalyticsParams, sanitizeAnalyticsUrl } from "../analyticsPrivacy";
import {
  trackAdFillStatus,
  trackAdRequestAttempt,
  trackAdUnitClick,
  trackAffiliateImpression,
  trackCalcSuccess,
  trackCoupangClick,
  trackEvent,
} from "../analytics";

afterEach(() => vi.unstubAllGlobals());

const keep = { keepPublicAmountPath: true };

function stubPage(href: string, referrer = "") {
  const gtag = vi.fn();
  const url = new URL(href);
  vi.stubGlobal("window", { gtag, location: { href } });
  vi.stubGlobal("location", { pathname: url.pathname });
  vi.stubGlobal("document", { referrer });
  return gtag;
}

describe("public amount report pages keep their real path for ad/affiliate events", () => {
  it("keeps static-grid /monthly/N and rendered /salary/N, including query attribution and trailing slash", () => {
    expect(sanitizeAnalyticsUrl("/monthly/3000000", undefined, keep)).toBe("/monthly/3000000");
    expect(sanitizeAnalyticsUrl("/monthly/10500000", undefined, keep)).toBe("/monthly/10500000");
    expect(sanitizeAnalyticsUrl("/salary/50000000", undefined, keep)).toBe("/salary/50000000");
    expect(sanitizeAnalyticsUrl("https://www.moneysalary.com/monthly/2400000/?utm_source=naver&v=secret", undefined, keep))
      .toBe("https://www.moneysalary.com/monthly/2400000/?utm_source=naver");
  });

  it("still redacts anything that is not a public pre-rendered page", () => {
    // /monthly 격자 밖(404 화면) — 방문자가 직접 친 금액일 수 있다
    expect(sanitizeAnalyticsUrl("/monthly/3123456", undefined, keep)).toBe("/monthly/[amount]");
    expect(sanitizeAnalyticsUrl("/monthly/1500000", undefined, keep)).toBe("/monthly/[amount]");
    // 구형·비정상 /salary 형태는 렌더 전 308 — 이벤트로 올 일이 없지만 방어적으로 비식별
    expect(sanitizeAnalyticsUrl("/salary/8000-manwon", undefined, keep)).toBe("/salary/[amount]");
    expect(sanitizeAnalyticsUrl("/salary/050000000", undefined, keep)).toBe("/salary/[amount]");
    expect(sanitizeAnalyticsUrl("/salary/12345678901", undefined, keep)).toBe("/salary/[amount]");
    // 공유 결과 페이로드는 옵션과 무관하게 항상 비식별
    expect(sanitizeAnalyticsUrl("/share/eyJzYWxhcnkiOjF9", undefined, keep)).toBe("/share/[redacted]");
  });

  it("the default (every non ad/affiliate event) is unchanged", () => {
    expect(sanitizeAnalyticsUrl("/monthly/3000000")).toBe("/monthly/[amount]");
    expect(sanitizeAnalyticsUrl("/salary/50000000")).toBe("/salary/[amount]");
    expect(sanitizeAnalyticsParams("guide_cta_click", { slug: "/salary/50000000", position: "x" }))
      .toEqual({ slug: "/salary/[amount]", position: "x" });
  });

  it("covers exactly the ad and affiliate/coupang measurement events", () => {
    expect([...PAGE_SCOPED_MEASUREMENT_EVENTS].sort()).toEqual([
      "ad_filled", "ad_request_attempt", "ad_request_error", "ad_unfilled", "ad_unit_click",
      "affiliate_click", "affiliate_impression", "autoads_seen", "coupang_click", "coupang_impression",
    ]);
  });

  it("ad events on /monthly/N send the real page_location and page_path", () => {
    const gtag = stubPage("https://www.moneysalary.com/monthly/3000000", "https://www.moneysalary.com/salary/36000000");
    trackAdRequestAttempt("result");
    trackAdFillStatus("result", "1234567890", "filled", "/monthly/3000000", { ad_height: 250, viewport: "m" });
    trackAdUnitClick("result", "1234567890");
    trackCoupangClick("responsive", "general", "/monthly/3000000");
    trackAffiliateImpression("nice-zikimi-01", "/monthly/3000000", "loan");
    expect(gtag.mock.calls.map((call) => call[1])).toEqual([
      "ad_request_attempt", "ad_filled", "ad_unit_click", "coupang_click", "affiliate_impression",
    ]);
    for (const [, , params] of gtag.mock.calls) {
      expect(params.page_location).toBe("https://www.moneysalary.com/monthly/3000000");
      expect(params.page_referrer).toBe("https://www.moneysalary.com/salary/36000000");
      expect(JSON.stringify(params)).not.toContain("[amount]");
    }
    expect(gtag.mock.calls[0][2]).toMatchObject({ slot_kind: "result", page_path: "/monthly/3000000" });
    expect(gtag.mock.calls[1][2]).toMatchObject({ page_path: "/monthly/3000000", ad_height: 250, viewport: "m" });
    expect(gtag.mock.calls[4][2]).toMatchObject({ offer_id: "nice-zikimi-01", page: "/monthly/3000000" });
  });

  it("calculation and other events on the same page keep the amount redaction", () => {
    const gtag = stubPage("https://www.moneysalary.com/salary/50000000");
    trackCalcSuccess("salary");
    trackEvent("module_view", { position: "x", page_path: "/salary/50000000" });
    for (const [, , params] of gtag.mock.calls) {
      expect(params.page_location).toBe("https://www.moneysalary.com/salary/[amount]");
      expect(params.page_path).toBe("/salary/[amount]");
      expect(JSON.stringify(params)).not.toContain("50000000");
    }
  });
});
