// 광고 라벨 문구 가드 (lens-ads-F10 — 2026-11-13 운영자 승인).
// AdSense 광고 게재위치 정책(support.google.com/adsense/answer/1346295): Google 광고에 붙일 수 있는 라벨은
// '광고' 또는 '스폰서 링크'(영문 Advertisements 또는 Sponsored Links)뿐이다. 단수형 Advertisement 나
// 괄호를 덧붙인 문구는 허용 문구가 아니다.
// 라벨은 한 줄 16px + 아래 4px = 예약 20px(AD_LABEL_HEIGHT) 안에 있어야 한다 — 문구만 바꾸고 광고 위치는 그대로.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const nav = vi.hoisted(() => ({ path: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.path }));

import { HomeTopAd } from "@/components/AdPlacement";

afterEach(() => { vi.unstubAllEnvs(); });

/** 서버 렌더 결과: 광고 칸(div) 안에 라벨 span 하나뿐이다(<ins> 는 화면에 들어온 뒤 클라이언트에서만 붙는다). */
function render(path: string) {
  nav.path = path;
  vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP", "1111111111");
  const html = renderToStaticMarkup(createElement(HomeTopAd));
  const label = /^<div[^>]*><span style="([^"]*)">([^<]*)<\/span><\/div>$/.exec(html);
  return { html, style: label?.[1] ?? "", text: label?.[2] };
}

describe("광고 라벨 문구 — AdSense 정책 허용 문구만", () => {
  it.each(["/", "/calc/samsung-bonus", "/guides/year-end-tax-2026"])("한국어 페이지 %s: 광고", (path) => {
    expect(render(path).text).toBe("광고");
  });

  it.each(["/en", "/en/guides/earned-income-credit-2026"])("영문 페이지 %s: Advertisements", (path) => {
    expect(render(path).text).toBe("Advertisements");
  });

  it("라벨은 한 줄 16px + 아래 4px, 광고 칸 예약 높이는 광고 120px + 라벨 20px 그대로", () => {
    const { html, style } = render("/");
    expect(style).toContain("font-size:11px");
    expect(style).toContain("line-height:16px");
    expect(style).toContain("margin-bottom:4px");
    expect(html).toContain("min-height:140px");
  });
});
