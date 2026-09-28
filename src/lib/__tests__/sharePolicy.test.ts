import { describe, expect, it } from "vitest";
import { approvedResultUrl, defaultShareTitle, isSharePageReady, publicShareImageUrl, publicShareUrl, resolvePublicShare, resolveShareLocale, SHARE_ORIGIN, shareAnalyticsPath } from "../sharePolicy";

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

// S02·S23 (2026-10 비광고 슬롯): 카카오·기기 공유 기본값 = 이 페이지의 메타 설명·og:image.
// og:image 는 같은 사이트(https://www.moneysalary.com)의 /api/og·/og-default.png 카드만 — 임의 URL 을 카카오 페이로드에 싣지 않는다.
describe("page description and og:image defaults (S02)", () => {
  const salaryOg = `${SHARE_ORIGIN}/api/og?type=salary&amount=50000000&net=3570000&v=20260924`;
  const page = { ...context, pathname: "/salary/50000000", canonical: `${SHARE_ORIGIN}/salary/50000000`, title: "연봉 5000만원 실수령액 | 머니샐러리", description: "  연봉 5,000만원의\n월 실수령액은 약 357만원입니다.  ", ogImage: salaryOg };

  it("defaults the description and image to this page's meta description and same-site og:image", () => {
    const share = resolvePublicShare(page);
    expect(share.title).toBe(page.title);
    expect(share.description).toBe("연봉 5,000만원의 월 실수령액은 약 357만원입니다.");
    expect(share.imageUrl).toBe(salaryOg);
    expect(resolvePublicShare({ ...page, ogImage: `${SHARE_ORIGIN}/og-default.png` }).imageUrl).toBe(`${SHARE_ORIGIN}/og-default.png`);
  });

  it("explicit overrides still come first", () => {
    const share = resolvePublicShare(page, { description: "직접 쓴 설명", imageUrl: `${SHARE_ORIGIN}/api/og?type=tool&name=x` });
    expect(share.description).toBe("직접 쓴 설명");
    expect(share.imageUrl).toBe(`${SHARE_ORIGIN}/api/og?type=tool&name=x`);
  });

  it("falls back to the fixed copy and the path card when the page has no usable description or og:image", () => {
    const share = resolvePublicShare({ ...page, description: "   ", ogImage: null });
    expect(share.description).toBe("연봉 계산기와 생활에 필요한 가이드를 확인하세요.");
    expect(new URL(share.imageUrl).searchParams.get("path")).toBe("/salary/50000000");
    expect(resolvePublicShare(context).description).toBe("연봉 계산기와 생활에 필요한 가이드를 확인하세요.");
  });

  it("never lends this page's description or og:image to a cross-page target", () => {
    const share = resolvePublicShare(page, { url: "/salary-db/samsung-electronics", title: "Curated public title" });
    expect(share.description).toBe("연봉 계산기와 생활에 필요한 가이드를 확인하세요.");
    expect(share.imageUrl).not.toBe(salaryOg);
    expect(new URL(share.imageUrl).searchParams.get("path")).toBe("/salary-db/samsung-electronics");
  });

  it("never uses a legacy result page's personal og:image or description", () => {
    const share = resolvePublicShare({ ...page, pathname: "/share/eyJhbW91bnQiOjk4NzY1NDMyMX0=", description: "연봉 987654321원 결과", ogImage: `${SHARE_ORIGIN}/api/og?type=salary&amount=987654321` });
    expect(share.url).toBe(`${SHARE_ORIGIN}/`);
    expect(JSON.stringify(share)).not.toContain("987654321");
  });

  it("uses an English page's own description on English routes", () => {
    const share = resolvePublicShare({ ...page, pathname: "/en/guides/example", canonical: `${SHARE_ORIGIN}/en/guides/example`, description: "How Korean payroll tax works.", ogImage: `${SHARE_ORIGIN}/api/og?lang=en&title=Guide` });
    expect(share.locale).toBe("en");
    expect(share.description).toBe("How Korean payroll tax works.");
    expect(share.imageUrl).toBe(`${SHARE_ORIGIN}/api/og?lang=en&title=Guide`);
  });

  it.each([
    "https://evil.example/api/og?type=salary",
    "https://www.moneysalary.com.evil.example/api/og",
    "https://evil.example/?u=https://www.moneysalary.com/api/og",
    "http://www.moneysalary.com/api/og?type=salary",
    "https://www.moneysalary.com:8443/api/og",
    "https://user:pass@www.moneysalary.com/api/og",
    "https://moneysalary.com/api/og?type=salary",
    "//evil.example/api/og",
    "/api/og?type=salary",
    "javascript:alert(1)",
    "data:image/png;base64,AAAA",
    "https://www.moneysalary.com/api/og-other",
    "https://www.moneysalary.com/api/og/../../images/x.png",
    "https://www.moneysalary.com/api/%6fg",
    "https://www.moneysalary.com/images/card.png",
    "https://www.moneysalary.com/api/og\\@evil.example",
    "https://www.moneysalary.com/api/og?\ttitle=x",
    `https://www.moneysalary.com/api/og?title=${"x".repeat(2100)}`,
    "",
  ])("rejects og:image %s and falls back to the path card", (ogImage) => {
    expect(publicShareImageUrl(ogImage)).toBeNull();
    const share = resolvePublicShare({ ...page, ogImage });
    expect(new URL(share.imageUrl).origin).toBe(SHARE_ORIGIN);
    expect(new URL(share.imageUrl).searchParams.get("path")).toBe("/salary/50000000");
  });

  it("normalizes an accepted og:image to the site origin without a fragment", () => {
    expect(publicShareImageUrl("HTTPS://WWW.MONEYSALARY.COM:443/api/og?type=guide&title=x#frag")).toBe(`${SHARE_ORIGIN}/api/og?type=guide&title=x`);
    expect(publicShareImageUrl(`${SHARE_ORIGIN}/og-default.png`)).toBe(`${SHARE_ORIGIN}/og-default.png`);
    expect(publicShareImageUrl(null)).toBeNull();
    expect(publicShareImageUrl(undefined)).toBeNull();
  });
});
