import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";
import { enGuides } from "./guidesContent";
import { ENGLISH_TOOLS } from "./englishTools";
import { isMissingEnglishDetail } from "./englishRouteGuard";
import { EN_GUIDE_SLUGS } from "./enGuideSlugs";

describe("English missing-detail routing", () => {
  it("keeps the lightweight routing list equal to the actual English guide catalog", () => {
    expect([...EN_GUIDE_SLUGS].sort()).toEqual(enGuides.map(guide => guide.slug).sort());
  });
  it.each([...enGuides.map(guide => `/en/guides/${guide.slug}`), ...ENGLISH_TOOLS.map(tool => `/en/tools/${tool.slug}`)])("keeps the generated page %s on its original route", path => {
    const response = middleware(new NextRequest(`https://www.moneysalary.com${path}`, { headers: { "user-agent": "Mozilla/5.0" } }));
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it.each(["/en/tools/missing", "/en/guides/missing/", "/en/tools/%ZZ", "/en/guides/a%2Fb"])("routes %s to English recovery without a public redirect", path => {
    const response = middleware(new NextRequest(`https://www.moneysalary.com${path}?amount=12345`, { headers: { "user-agent": "Googlebot" } }));
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://www.moneysalary.com/en/page-unavailable");
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("decodes a slug once and leaves hubs, other languages and the recovery route alone", () => {
    for (const path of ["/en/tools/%6Coan", "/en/tools/loan/", "/en/tools", "/en/guides", "/en/page-unavailable", "/en/tools/a/b", "/guides/missing", "/tools/missing"]) expect(isMissingEnglishDetail(path)).toBe(false);
    expect(isMissingEnglishDetail("/en/tools/%256Coan")).toBe(true);
  });

  it("preserves the existing host redirect and user-agent policy", () => {
    expect(middleware(new NextRequest("https://moneysalary.com/en/tools/missing", { headers: { host: "moneysalary.com", "user-agent": "Mozilla/5.0" } })).status).toBe(301);
    const blocked = middleware(new NextRequest("https://www.moneysalary.com/en/tools/missing", { headers: { "user-agent": "SemrushBot" } }));
    expect(blocked.status).toBe(403);
    expect(blocked.headers.get("x-middleware-rewrite")).toBeNull();
  });
});
