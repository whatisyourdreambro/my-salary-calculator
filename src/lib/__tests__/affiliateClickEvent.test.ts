// 제휴 오퍼 클릭·노출 계측 회귀 가드 (2026-09-25, 감사 승인 항목 4 — GA4 계측 수리 (c))
//
// 배경: GA4 28일 affiliate_impression 2,232건(nice-zikimi-01·allcredit-01)에 affiliate_click 1건.
// 등록된 'position'(제휴 배치) 측정기준은 전부 (not set) 이었고, 가운데 버튼 새 탭 열기는 click 이
// 발생하지 않아 집계에서 빠졌다. 새 탭 이동이라 GA4 배치 큐 대기 중 유실을 줄이도록 beacon 을 명시한다.
// 오퍼 URL·rel·target 은 절대 바꾸지 않는다(LinkPrice u_id 추적) — 아래 SSR 가드.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { trackAffiliateClick, trackAffiliateImpression } from "../analytics";
import { matchOffers } from "../affiliateOffers";
import rawOffers from "@/data/offers.json";

const PAGE = "/credit-card-deduction-2026";
vi.mock("next/navigation", () => ({ usePathname: () => "/credit-card-deduction-2026" }));

afterEach(() => vi.unstubAllGlobals());

function stubGa(href = `https://www.moneysalary.com${PAGE}`) {
  const gtag = vi.fn();
  vi.stubGlobal("window", { gtag, location: { href } });
  vi.stubGlobal("document", { referrer: "" });
  return gtag;
}

describe("affiliate_click / affiliate_impression payload", () => {
  it("click carries offer, page, page_path, vertical, position and a beacon transport", () => {
    const gtag = stubGa();
    trackAffiliateClick("nice-zikimi-01", PAGE, "loan", "offer-slot");
    expect(gtag).toHaveBeenCalledTimes(1);
    const [command, name, params] = gtag.mock.calls[0];
    expect([command, name]).toEqual(["event", "affiliate_click"]);
    expect(params).toMatchObject({
      offer_id: "nice-zikimi-01", page: PAGE, page_path: PAGE, vertical: "loan",
      position: "offer-slot", transport_type: "beacon",
      page_location: `https://www.moneysalary.com${PAGE}`,
    });
  });

  it("impression carries the same placement so CTR splits by position", () => {
    const gtag = stubGa();
    trackAffiliateImpression("allcredit-01", PAGE, "loan", "banner-slot");
    expect(gtag.mock.calls[0][1]).toBe("affiliate_impression");
    expect(gtag.mock.calls[0][2]).toMatchObject({ offer_id: "allcredit-01", page_path: PAGE, position: "banner-slot" });
    expect(gtag.mock.calls[0][2]).not.toHaveProperty("transport_type");
  });

  it("an unknown placement is omitted instead of inventing a dimension value", () => {
    const gtag = stubGa();
    trackAffiliateClick("nice-zikimi-01", PAGE, "loan");
    trackAffiliateImpression("nice-zikimi-01", PAGE, "loan", "hero" as never);
    for (const [, , params] of gtag.mock.calls) expect(params).not.toHaveProperty("position");
  });

  it("offer pages under /monthly/N report the real public path, not /monthly/[amount]", () => {
    const gtag = stubGa("https://www.moneysalary.com/monthly/3000000");
    trackAffiliateClick("nice-zikimi-01", "/monthly/3000000", "loan", "banner-slot");
    expect(gtag.mock.calls[0][2]).toMatchObject({
      page: "/monthly/3000000", page_path: "/monthly/3000000",
      page_location: "https://www.moneysalary.com/monthly/3000000",
    });
  });
});

describe("OfferCard wiring (measurement only)", () => {
  const src = readFileSync(resolve(process.cwd(), "src/components/affiliate/AffiliateSlot.tsx"), "utf8");

  it("click, middle-click and impression all report the slot placement", () => {
    expect(src).toContain("onClick={reportClick}");
    expect(src).toMatch(/onAuxClick=\{\(event\) => \{\s*if \(event\.button === 1\) reportClick\(\);/);
    expect(src).toContain("trackAffiliateClick(offer.id, pathname, offer.vertical, placement)");
    expect(src).toContain("trackAffiliateImpression(offer.id, pathname, offer.vertical, placement)");
    expect(src).toContain('placement={offerOnly ? "offer-slot" : "banner-slot"}');
  });

  it("the rendered card keeps the exact offers.json URL, rel and target", async () => {
    const { OfferSlot } = await import("@/components/affiliate/AffiliateSlot");
    const html = renderToStaticMarkup(createElement(OfferSlot, { vertical: "loan" }));
    const offer = matchOffers(PAGE, "loan")[0];
    expect(offer).toBeTruthy();
    const source = (rawOffers as { id: string; url: string }[]).find((o) => o.id === offer.id)!;
    const escapedUrl = source.url.replace(/&/g, "&amp;");
    expect(html).toContain(`href="${escapedUrl}"`);
    expect(html).toContain(`u_id=${offer.id}`);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="sponsored nofollow noopener noreferrer"');
    expect(html).toContain(`data-affiliate-offer="${offer.id}"`);
  });
});
