import { describe, expect, it } from "vitest";
import { approvedResultUrl, defaultShareTitle, isSharePageReady, publicShareUrl, resolvePublicShare, resolveShareLocale, SHARE_ORIGIN, shareAnalyticsPath } from "../sharePolicy";

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
  it("only explicit result mode's helper preserves an approved legacy payload", () => {
    const encoded = `${SHARE_ORIGIN}/calc/compound?v=encoded-inputs`;
    expect(approvedResultUrl(encoded, context.canonical)).toBe(encoded);
    expect(publicShareUrl(encoded)).toBe(`${SHARE_ORIGIN}/calc/compound`);
    expect(approvedResultUrl("https://evil.example/value", context.canonical)).toBe(context.canonical);
  });
});
