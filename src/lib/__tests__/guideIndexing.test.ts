import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { middleware } from "@/middleware";
import robots from "@/app/robots";

vi.mock("@/components/PageFooterAds", () => ({ default: () => null }));
vi.mock("@/components/AutoShareSection", () => ({ default: () => null }));
vi.mock("@/app/en/guides/EnglishGuidesClient", () => ({ default: () => null }));

import { metadata as koMetadata } from "@/app/guides/layout";
import { metadata as enMetadata } from "@/app/en/guides/page";

function request(path: string, ua = "Mozilla/5.0", host = "www.moneysalary.com") {
  return new NextRequest(`https://${host}${path}`, {
    headers: { "user-agent": ua, host },
  });
}

describe("가이드 검색 응답의 색인 범위", () => {
  it.each(["Mozilla/5.0", "Googlebot/2.1", "Yeti/1.1", "Bingbot/2.0"])("방문자와 허용된 검색 봇에 같은 noindex 헤더를 보낸다: %s", (ua) => {
    for (const path of ["/guides?q=%EC%84%B8%EA%B8%88", "/en/guides?q=tax"]) {
      const response = middleware(request(path, ua));
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
      expect(response.headers.get("x-robots-tag")).toBe("noindex, follow");
      expect(response.headers.get("cache-control")).toBe("private, no-store");
    }
  });

  it.each([
    "/guides", "/en/guides", "/guides?q=", "/en/guides?q=%20%20",
    "/guides?category=tax", "/guides?utm_source=naver",
    "/guides/tax?q=tax", "/en/guides/chip-stock-tax-guide?q=tax", "/guides/category/tax?q=tax",
  ])("일반 허브·빈 검색·고유 글에는 noindex를 추가하지 않는다: %s", (path) => {
    const response = middleware(request(path, "Googlebot/2.1"));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-robots-tag")).toBeNull();
    expect(response.headers.get("cache-control")).toBeNull();
  });

  it("기존 차단 봇 정책을 유지한다", () => {
    const response = middleware(request("/guides?q=tax", "SemrushBot"));
    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("기존 canonical 호스트 301은 검색어를 보존한다", () => {
    const response = middleware(request("/guides?q=tax", "Googlebot/2.1", "moneysalary.com"));
    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("https://www.moneysalary.com/guides?q=tax");
  });

  it("검색어가 들어가지 않는 허브 canonical과 한영 상호 alternates를 보존한다", () => {
    expect(koMetadata.alternates?.canonical).toBe("https://www.moneysalary.com/guides");
    expect(enMetadata.alternates?.canonical).toBe("https://www.moneysalary.com/en/guides");
    expect(koMetadata.alternates?.languages).toEqual(enMetadata.alternates?.languages);
    expect(koMetadata.robots).toMatchObject({ index: true, follow: true });
    expect(enMetadata.robots).not.toMatchObject({ index: false });
  });

  it("Google·네이버의 robots 크롤 접근을 유지해 검색 URL의 noindex를 읽을 수 있다", () => {
    const rules = robots().rules;
    const groups = Array.isArray(rules) ? rules : [rules];
    for (const ua of ["Googlebot", "Yeti", "*"]) {
      const rule = groups.find((g) => (Array.isArray(g.userAgent) ? g.userAgent : [g.userAgent]).includes(ua));
      expect(rule, ua).toBeDefined();
      expect(rule?.allow).toContain("/");
      const disallowed = [rule?.disallow ?? []].flat();
      expect(disallowed.some((path) => path === "/" || path.includes("guides") || path.includes("?q"))).toBe(false);
    }
  });
});
