import { describe, expect, it } from "vitest";
import { approvedResultUrl, defaultShareTitle, isSharePageReady, publicShareImageUrl, publicShareUrl, resolvePublicShare, resolveResultShareTarget, resolveShareLocale, safePageOgImage, SHARE_ORIGIN, shareAnalyticsPath } from "../sharePolicy";

const context = { pathname: "/guides/example", canonical: `${SHARE_ORIGIN}/guides/example`, title: "Public guide", notFound: false };

describe("public share context and payload boundaries", () => {
  it.each(["/contact", "/contact/receipt", "/dashboard", "/report", "/report/month", "/favorites", "/api/feedback", "/widget/salary", "/_next/data"])('excludes private/system path %s at the common boundary', (path) => {
    expect(publicShareUrl(path)).toBeNull();
    expect(isSharePageReady({ ...context, pathname: path, canonical: `${SHARE_ORIGIN}${path}` }, path)).toBe(false);
  });
  it("uses a fixed public URL without query, salary, token, search or fragment", () => {
    expect(publicShareUrl("/guides?q=private&salary=987654321&v=encoded#result")).toBe(`${SHARE_ORIGIN}/guides`);
    expect(publicShareUrl("https://moneysalary.com/guides/example/?utm_source=test")).toBe(`${SHARE_ORIGIN}/guides/example`);
  });
  it("maps legacy result paths to home, including their personal document title", () => {
    const page = resolvePublicShare({ ...context, pathname: "/share/eyJhbW91bnQiOjk4NzY1NDMyMX0=", title: "987654321 private" });
    expect(page.url).toBe(`${SHARE_ORIGIN}/`);
    expect(page.title).toBe(defaultShareTitle("ko"));
    expect(page.imageUrl).not.toContain("987654321");
    expect(shareAnalyticsPath("/share/private?salary=123")).toBe("/");
  });
  it("keeps public company, guide, salary-grid and explicit cross-page canonical targets", () => {
    for (const url of ["/salary-db/samsung-electronics", "/guides/another", "/salary/50000000"]) {
      const result = resolvePublicShare(context, { url, title: "Curated public title" });
      expect(result.url).toBe(`${SHARE_ORIGIN}${url}`);
      expect(result.title).toBe("Curated public title");
    }
  });
  it("does not reuse this page's title for a cross-page override without a matching title", () => {
    expect(resolvePublicShare(context, { url: "/salary-db/samsung-electronics" }).title).toBe(defaultShareTitle("ko"));
  });
  it.each(["https://evil.example/test", "javascript:alert(1)", "//evil.example/x", "https://user:pass@www.moneysalary.com/", "/%72eport", "/share%2Ftoken", "/%2573hare/token", "/share\\token", "https://www.moneysalary.com//share/token"])('rejects untrusted or ambiguous URL %s', (url) => {
    expect(publicShareUrl(url)).toBeNull();
  });
  it("omits controls until the current route's metadata agrees, including 404 and SPA transitions", () => {
    expect(isSharePageReady(null, context.pathname)).toBe(false);
    expect(isSharePageReady(context, context.pathname)).toBe(true);
    expect(isSharePageReady({ ...context, notFound: true }, context.pathname)).toBe(false);
    expect(isSharePageReady({ ...context, pathname: "/guides/missing" }, "/guides/missing")).toBe(false);
    expect(isSharePageReady(context, "/en/guides/example")).toBe(false);
  });
  it("gets English labels and OG language from a real English route", () => {
    const en = resolvePublicShare({ ...context, pathname: "/en/guides/example", title: "English guide" });
    expect(en.locale).toBe("en");
    expect(new URL(en.imageUrl).searchParams.get("lang")).toBe("en");
    expect(resolveShareLocale("/energy")).toBe("ko");
    expect(resolveShareLocale("/en")).toBe("en");
  });
  it("recognizes the same Korean reference route in encoded and decoded form", () => {
    const path = "/glossary/실수령액";
    expect(isSharePageReady({ ...context, pathname: encodeURI(path), canonical: `${SHARE_ORIGIN}${encodeURI(path)}` }, path)).toBe(true);
  });
  it("two rejected URLs do not make an encoded private route ready", () => {
    const path = "/%72eport";
    expect(isSharePageReady({ ...context, pathname: path, canonical: `${SHARE_ORIGIN}${path}` }, path)).toBe(false);
  });
  it("result approval never permits input payloads in the destination URL", () => {
    const encoded = `${SHARE_ORIGIN}/calc/compound?v=encoded-inputs`;
    expect(approvedResultUrl(encoded, context.canonical)).toBe(`${SHARE_ORIGIN}/calc/compound`);
    expect(publicShareUrl(encoded)).toBe(`${SHARE_ORIGIN}/calc/compound`);
    expect(approvedResultUrl("https://evil.example/value", context.canonical)).toBe(context.canonical);
    expect(approvedResultUrl(`${SHARE_ORIGIN}/share/private-token?salary=987654321#family=4`, context.canonical)).toBe(`${SHARE_ORIGIN}/`);
    expect(approvedResultUrl(`${SHARE_ORIGIN}/calc/samsung-bonus#s=987654321&d=memory`, context.canonical)).toBe(`${SHARE_ORIGIN}/calc/samsung-bonus`);
    expect(approvedResultUrl(undefined, `${context.canonical}?salary=987654321#result`)).toBe(context.canonical);
    expect(approvedResultUrl(undefined, "https://evil.example/private")).toBe(`${SHARE_ORIGIN}/`);
  });
  it("uses a public path/language card with the default OG title, ignoring caller image URLs and titles", () => {
    const page = resolvePublicShare(context, { title: "Approved salary 987654321", imageUrl: `${SHARE_ORIGIN}/api/og?amount=987654321&net=123` });
    expect(page.title).toBe("Approved salary 987654321");
    expect(page.imageUrl).toBe(`${SHARE_ORIGIN}/api/og?path=%2Fguides%2Fexample&lang=ko`);
    expect(publicShareImageUrl(`${SHARE_ORIGIN}/share/private?salary=987654321#private`, "en")).toBe(`${SHARE_ORIGIN}/api/og?path=%2F&lang=en`);
  });
});

// B38 (owner approval 2026-11-01, item 8): a page's own public og:image becomes its Kakao card; result values never do.
describe("page og:image as the share card (B38)", () => {
  const guideCard = `${SHARE_ORIGIN}/api/og?type=guide&title=${encodeURIComponent("Public guide")}`;
  const companyCard = `${SHARE_ORIGIN}/api/og?type=company&name=${encodeURIComponent("삼성전자")}`;
  const pageCards = [
    `${SHARE_ORIGIN}/og-default.png`,
    guideCard,
    companyCard,
    `${SHARE_ORIGIN}/api/og?type=tool&name=${encodeURIComponent("삼성전자 성과급 계산기")}`,
    `${SHARE_ORIGIN}/api/og?path=${encodeURIComponent("/calc/2026-year")}&title=${encodeURIComponent("2026 연봉 계산기 PRO")}`,
    `${SHARE_ORIGIN}/api/og?lang=en&path=${encodeURIComponent("/en/tools/loan")}&title=${encodeURIComponent("Loan calculator")}`,
    `${SHARE_ORIGIN}/api/og?lang=en&title=Korea%20Salary%20%26%20Tax%20Calculator`,
    `${SHARE_ORIGIN}/api/og?lang=en&title=English+Pay+Tax+and+Money+Guides`,
    `${SHARE_ORIGIN}/api/og?path=%2Fcalc%2Fx&title=t&v=20260924`,
    `${SHARE_ORIGIN}/api/og?title=${encodeURIComponent("가".repeat(120))}`,
  ];
  it.each(pageCards)("accepts the public build-time card %s unchanged", (card) => {
    expect(safePageOgImage(card)).toBe(card);
  });

  it("page mode uses this page's og:image for its own link, including an explicit same-page URL", () => {
    const page = { ...context, ogImage: guideCard };
    expect(resolvePublicShare(page).imageUrl).toBe(guideCard);
    expect(resolvePublicShare(page, { url: `${SHARE_ORIGIN}/guides/example/?utm_source=x#top`, title: "Curated" }).imageUrl).toBe(guideCard);
    expect(resolvePublicShare(page, { imageUrl: `${SHARE_ORIGIN}/api/og?amount=987654321`, title: "Approved 987654321" }).imageUrl).toBe(guideCard);
    const company = { pathname: "/salary-db/samsung-electronics", canonical: `${SHARE_ORIGIN}/salary-db/samsung-electronics`, title: "삼성전자 연봉", notFound: false, ogImage: companyCard };
    expect(resolvePublicShare(company).imageUrl).toBe(companyCard);
    const en = { pathname: "/en/guides/example", canonical: `${SHARE_ORIGIN}/en/guides/example`, title: "English guide", notFound: false, ogImage: `${SHARE_ORIGIN}/api/og?lang=en&title=English%20guide` };
    expect(resolvePublicShare(en)).toMatchObject({ locale: "en", imageUrl: en.ogImage });
  });

  it("result mode also uses the page's static og:image, never result text or a caller image", () => {
    const page = resolvePublicShare({ ...context, ogImage: guideCard }, { locale: "ko" });
    expect(page.imageUrl).toBe(guideCard);
    expect(resolveResultShareTarget(page, undefined)).toEqual({ url: `${SHARE_ORIGIN}/guides/example`, imageUrl: guideCard });
    expect(resolveResultShareTarget(page, `${SHARE_ORIGIN}/guides/example?v=987654321#s=987654321`)).toEqual({ url: `${SHARE_ORIGIN}/guides/example`, imageUrl: guideCard });
    expect(resolveResultShareTarget(page, "https://evil.example/987654321")).toEqual({ url: `${SHARE_ORIGIN}/guides/example`, imageUrl: guideCard });
  });

  it("a result linking to another page gets that page's path-only card, not this page's og:image", () => {
    const page = resolvePublicShare({ pathname: "/calc/2026-year", canonical: `${SHARE_ORIGIN}/calc/2026-year`, title: "2026 연봉 계산기 PRO", notFound: false, ogImage: pageCards[4] }, { locale: "ko" });
    expect(page.imageUrl).toBe(pageCards[4]);
    expect(resolveResultShareTarget(page, `${SHARE_ORIGIN}/`)).toEqual({ url: `${SHARE_ORIGIN}/`, imageUrl: `${SHARE_ORIGIN}/api/og?path=%2F&lang=ko` });
    expect(resolveResultShareTarget(page, `${SHARE_ORIGIN}/share/PRIVATE_TOKEN?salary=987654321`)).toEqual({ url: `${SHARE_ORIGIN}/`, imageUrl: `${SHARE_ORIGIN}/api/og?path=%2F&lang=ko` });
  });

  it("legacy /share paths, override URLs and excluded paths keep the path-only card", () => {
    const legacy = resolvePublicShare({ ...context, pathname: "/share/eyJhbW91bnQiOjk4NzY1NDMyMX0=", title: "987654321 private", ogImage: `${SHARE_ORIGIN}/og-default.png` });
    expect(legacy).toMatchObject({ url: `${SHARE_ORIGIN}/`, imageUrl: `${SHARE_ORIGIN}/api/og?path=%2F&lang=ko` });
    const page = { ...context, ogImage: guideCard };
    expect(resolvePublicShare(page, { url: "/salary-db/samsung-electronics", title: "Curated public title" }).imageUrl).toBe(`${SHARE_ORIGIN}/api/og?path=%2Fsalary-db%2Fsamsung-electronics&lang=ko`);
    expect(resolvePublicShare(page, { url: "/" }).imageUrl).toBe(`${SHARE_ORIGIN}/api/og?path=%2F&lang=ko`);
    // A context the UI would never mark ready (private path): its head card must not ride on the home fallback link.
    expect(resolvePublicShare({ ...context, pathname: "/contact", canonical: `${SHARE_ORIGIN}/contact`, ogImage: guideCard }).imageUrl).toBe(`${SHARE_ORIGIN}/api/og?path=%2F&lang=ko`);
    expect(resolvePublicShare({ ...context, ogImage: null }).imageUrl).toBe(`${SHARE_ORIGIN}/api/og?path=%2Fguides%2Fexample&lang=ko`);
  });

  it.each([
    `${SHARE_ORIGIN}/api/og?type=salary&amount=50000000&net=3520000&v=20260924`,
    `${SHARE_ORIGIN}/api/og?amount=987654321`,
    `${SHARE_ORIGIN}/api/og?type=tool&name=x&net=123`,
    `${SHARE_ORIGIN}/api/og?type=tool&name=x&netPay=123`,
    `${SHARE_ORIGIN}/api/og?type=tool&name=x&%61mount=1`,
  ])("rejects an og:image carrying result values: %s", (card) => {
    expect(safePageOgImage(card)).toBeNull();
    expect(resolvePublicShare({ ...context, ogImage: card }).imageUrl).toBe(`${SHARE_ORIGIN}/api/og?path=%2Fguides%2Fexample&lang=ko`);
  });

  it.each([
    "https://example.com/api/og?title=x",
    "https://cdn.example.com/og-default.png",
    "https://www.moneysalary.com.evil.example/api/og?title=x",
    "https://evil.example/https://www.moneysalary.com/api/og?title=x",
    "http://www.moneysalary.com/api/og?title=x",
    "https://moneysalary.com/api/og?title=x",
    "https://user:pass@www.moneysalary.com/api/og?title=x",
    "https://www.moneysalary.com:8443/api/og?title=x",
    "//www.moneysalary.com/api/og?title=x",
    "/api/og?title=x",
    "https://www.moneysalary.com/api/og-other?title=x",
    "https://www.moneysalary.com/api/og/?title=x",
    "https://www.moneysalary.com/images/card.png",
    "https://www.moneysalary.com/og-default.png?v=1",
    "https://www.moneysalary.com/api/og?title=x#frag",
    "https://www.moneysalary.com/api/og?title=a&title=b",
    "https://www.moneysalary.com/api/og?title=x&utm_source=kakao",
    "https://www.moneysalary.com/api/og?Title=x",
    `https://www.moneysalary.com/api/og?title=${encodeURIComponent("가".repeat(121))}`,
    `https://www.moneysalary.com/api/og?type=company&name=${"n".repeat(121)}`,
    " https://www.moneysalary.com/og-default.png",
    "https://www.moneysalary.com/api/og?title=a\nb",
    "https://www.moneysalary.com/api/og?title=a b",
    "javascript:alert(1)",
    "data:image/png;base64,iVBORw0KGgo=",
    "",
  ])("rejects an external, ambiguous or oversized image %j", (card) => {
    expect(safePageOgImage(card)).toBeNull();
    expect(resolvePublicShare({ ...context, ogImage: card }).imageUrl).toBe(`${SHARE_ORIGIN}/api/og?path=%2Fguides%2Fexample&lang=ko`);
  });

  it("treats a missing or non-string og:image as no card", () => {
    expect(safePageOgImage(null)).toBeNull();
    expect(safePageOgImage(undefined)).toBeNull();
    expect(safePageOgImage(42 as unknown as string)).toBeNull();
    // An over-long URL is refused even when every key is a page key (path is not otherwise length-checked).
    expect(safePageOgImage(`${SHARE_ORIGIN}/api/og?path=%2F${"x".repeat(2100)}`)).toBeNull();
    expect(safePageOgImage(`${SHARE_ORIGIN}/api/og?path=%2F${"x".repeat(1000)}`)).not.toBeNull();
  });
});
