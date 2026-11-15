// 공시 업종 순위 → 업계 추정 연봉 교차 링크 (2026-11-15 SEASONC, app-data-pages ideas[3] 역방향) — salary-db layout 의 마지막 광고 아래.
import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const location = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => location.pathname }));
vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));

import ListedIndustryCrossLink from "@/components/ListedIndustryCrossLink";

const code = (file: string) =>
  readFileSync(file, "utf8").replace(/\r\n/g, "\n").replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/^\s*\/\/.*$/gm, "");
const AD_TAG = /<(?:[A-Z][A-Za-z0-9]*Ad|PageFooterAds|CoupangBanner|AffiliateSlot|OfferSlot)\b/g;

describe("공시 업종 쪽 교차 링크는 layout 의 마지막 광고 아래", () => {
  it("salary-db layout: 교차 링크는 PageFooterAds·공유 뒤, 신뢰 상자 바로 앞 — page.tsx 에는 없다(PageFooterAds 위가 된다)", () => {
    const src = code("src/app/salary-db/layout.tsx");
    const at = src.indexOf("<ListedIndustryCrossLink />");
    expect(at).toBeGreaterThan(src.indexOf("<PageFooterAds"));
    expect(at).toBeGreaterThan(src.indexOf("<AutoShareSection"));
    for (const ad of src.matchAll(AD_TAG)) expect(ad.index!, ad[0]).toBeLessThan(at);
    expect(src.slice(at).replace(/\s+/g, "").startsWith("<ListedIndustryCrossLink/><EditorialTrustNoteFromPath")).toBe(true);
    expect(readFileSync("src/app/salary-db/listed/industry/[industryId]/page.tsx", "utf8")).not.toContain("ListedIndustryCrossLink");
  });

  it("공시 업종 쪽에서만 렌더하고 다른 salary-db 경로는 null(DOM 없음)", () => {
    location.pathname = "/salary-db/listed/industry/semiconductor";
    const html = renderToStaticMarkup(createElement(ListedIndustryCrossLink));
    expect(html).toContain('href="/industry/semiconductor"');
    expect(html).toContain("반도체·전자 업계 연봉 →");
    for (const path of ["/salary-db/samsung-electronics", "/salary-db/listed/005930", "/salary-db/listed/industry/consumer-goods", "/salary-db", "/salary-db/ranking"]) {
      location.pathname = path;
      expect(renderToStaticMarkup(createElement(ListedIndustryCrossLink)), path).toBe("");
    }
  });
});
