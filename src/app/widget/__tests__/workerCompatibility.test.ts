import { describe, expect, it } from "vitest";
import * as bonus from "../bonus/route";
import * as dsr from "../dsr/route";
import * as military from "../military-pay/route";
import * as minimum from "../minimum-wage/route";
import * as salary from "../salary/route";
import * as severance from "../severance/route";
import * as yearEnd from "../year-end-tax/route";
import * as company from "../company/route";
import { WIDGET_CSP } from "../shared";

const staticWidgets = [bonus, dsr, military, minimum, salary, severance, yearEnd];

describe("OpenNext widget route contracts", () => {
  it.each(staticWidgets)("keeps a static, embeddable, ad-free HTML response", async route => {
    expect(route.dynamic).toBe("force-static");
    const response = await route.GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-security-policy")).toBe(WIDGET_CSP);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(response.headers.get("cache-control")).toContain("s-maxage=86400");
    const html = await response.text();
    expect(html).toContain("<!doctype html>");
    expect(html).not.toMatch(/<script[^>]+src=|adsbygoogle|googletagmanager|google-analytics/i);
  });

  it("keeps company cards query-dependent rather than sharing the static route result", async () => {
    expect(company.dynamic).toBe("force-dynamic");
    const samsung = await company.GET(new Request("https://example.test/widget/company?id=samsung-electronics"));
    const kakao = await company.GET(new Request("https://example.test/widget/company?id=kakao"));
    const a = await samsung.text();
    const b = await kakao.text();
    expect(a).toContain("삼성전자");
    expect(b).toContain("카카오");
    expect(a).not.toBe(b);
    expect(samsung.headers.get("content-security-policy")).toBe(WIDGET_CSP);
    expect(kakao.headers.get("content-security-policy")).toBe(WIDGET_CSP);
  });
});
