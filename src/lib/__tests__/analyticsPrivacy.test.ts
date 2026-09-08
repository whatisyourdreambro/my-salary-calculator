import { afterEach, describe, expect, it, vi } from "vitest";
import { sanitizeAnalyticsParams, sanitizeAnalyticsUrl } from "../analyticsPrivacy";
import { trackCalcStart, trackCalcSuccess, trackCalcResultView, trackEvent } from "../analytics";

afterEach(() => vi.unstubAllGlobals());

describe("custom analytics privacy", () => {
  it("strips a shared payload, financial query fields and fragments while retaining attribution", () => {
    const safe = sanitizeAnalyticsUrl("https://www.moneysalary.com/share/eyJhbm51YWxTYWxhcnkiOjgwMDAwMDAwfQ==?v=secret&amount=80000000&utm_source=naver&utm_medium=share&gclid=attribution#net=1234");
    expect(safe).toBe("https://www.moneysalary.com/share/[redacted]?utm_source=naver&utm_medium=share&gclid=attribution");
    expect(sanitizeAnalyticsUrl("/calc/loan?v=payload&utm_campaign=bonus&wbraid=id")).toBe("/calc/loan?utm_campaign=bonus&wbraid=id");
    expect(sanitizeAnalyticsUrl("/salary/80000000")).toBe("/salary/[amount]");
    expect(sanitizeAnalyticsUrl("/salary/8000-manwon")).toBe("/salary/[amount]");
  });
  it("does not invent referrers or turn unsupported schemes into destinations", () => {
    expect(sanitizeAnalyticsUrl("")).toBe("");
    expect(sanitizeAnalyticsUrl("javascript:alert(1)")).toBe("");
    expect(sanitizeAnalyticsUrl("/civil-servant-pay-2027")).toBe("/civil-servant-pay-2027");
  });
  it("allowlists calculation parameters, excluding exact amounts AND existing salary bands", () => {
    expect(sanitizeAnalyticsParams("calc_success", {
      calc_type: "salary", measurement_version: "2", page_path: "/",
      annual_salary: 80000000, monthly_net: 5500000, annual_salary_band: "8000-8500만",
      monthly_net_band: "6500-7000만", dependents: 3, income_type: "regular", inputs: { salary: 80000000 },
    })).toEqual({ calc_type: "salary", measurement_version: "2", page_path: "/" });
  });
  it("preserves unrelated ad diagnostics and web-vitals measurements", () => {
    expect(sanitizeAnalyticsParams("ad_request_error", { slot_kind: "result", error_type: "push_failed" })).toEqual({ slot_kind: "result", error_type: "push_failed" });
    expect(sanitizeAnalyticsParams("web_vitals", { metric_name: "LCP", metric_value: 1234 })).toEqual({ metric_name: "LCP", metric_value: 1234 });
  });
  it("sends real wrapper payloads with sanitized event-scoped URLs and v2 dimensions", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag, location: { href: "https://www.moneysalary.com/calc/vat?v=secret&utm_source=naver" } });
    vi.stubGlobal("document", { referrer: "https://www.moneysalary.com/share/secret?salary=80000000" });
    trackCalcStart("vat", "/calc/vat");
    trackCalcSuccess("vat", "/calc/vat");
    trackCalcResultView("vat", "default", "/calc/vat");
    expect(gtag.mock.calls.map((call) => call[1])).toEqual(["calc_start", "calc_success", "result_view"]);
    for (const [, , params] of gtag.mock.calls) {
      expect(params).toMatchObject({ calc_type: "vat", measurement_version: "2",
        page_location: "https://www.moneysalary.com/calc/vat?utm_source=naver",
        page_referrer: "https://www.moneysalary.com/share/[redacted]" });
      expect(JSON.stringify(params)).not.toContain("secret");
      expect(JSON.stringify(params)).not.toContain("80000000");
    }
  });
  it("remains harmless without a browser, without GA or with a blocked GA function", () => {
    expect(() => trackEvent("calc_success")).not.toThrow();
    vi.stubGlobal("window", {});
    expect(() => trackCalcStart("salary", "/")).not.toThrow();
    vi.stubGlobal("window", { gtag: () => { throw new Error("blocked"); } });
    expect(() => trackCalcSuccess("salary", "/")).not.toThrow();
  });
});
