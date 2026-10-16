import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import LiveServices from "@/components/LiveServices";
import CoupangBannerCore from "@/components/affiliate/CoupangBannerCore";
import { HomeTopAd } from "@/components/AdPlacement";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("server rendering cannot start advertising or analytics requests", () => {
  it("does not emit Google script or preload markup", () => {
    expect(renderToStaticMarkup(createElement(LiveServices))).toBe("");
  });
  it("does not emit a Coupang banner image URL before the client context is eligible", () => {
    expect(renderToStaticMarkup(createElement(CoupangBannerCore))).toBe("");
  });
  it("does not emit an adsbygoogle ins before the client context is eligible", () => {
    const html = renderToStaticMarkup(createElement(HomeTopAd));
    expect(html).not.toContain("<ins");
    expect(html).not.toContain("googlesyndication.com");
  });
});
