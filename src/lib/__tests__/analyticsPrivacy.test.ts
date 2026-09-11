import { afterEach, describe, expect, it, vi } from "vitest";
import { sanitizeAnalyticsParams, sanitizeAnalyticsUrl } from "../analyticsPrivacy";
import { trackCalcStart, trackCalcSuccess, trackCalcResultView, trackEvent, trackOfferCompareComplete, trackOfferCompareExplanationView } from "../analytics";

afterEach(() => vi.unstubAllGlobals());

describe("custom analytics privacy", () => {
  it("strips a shared payload, financial query fields and fragments while retaining attribution", () => {
    const safe = sanitizeAnalyticsUrl("https://www.moneysalary.com/share/eyJhbm51YWxTYWxhcnkiOjgwMDAwMDAwfQ==?v=secret&amount=80000000&utm_source=naver&utm_medium=share&gclid=attribution#net=1234");
    expect(safe).toBe("https://www.moneysalary.com/share/[redacted]?utm_source=naver&utm_medium=share&gclid=attribution");
    expect(sanitizeAnalyticsUrl("/calc/loan?v=payload&utm_campaign=bonus&wbraid=id")).toBe("/calc/loan?utm_campaign=bonus&wbraid=id");
    expect(sanitizeAnalyticsUrl("/salary/80000000")).toBe("/salary/[amount]");
    expect(sanitizeAnalyticsUrl("/salary/8000-manwon")).toBe("/salary/[amount]");
    expect(sanitizeAnalyticsUrl("/monthly/3000000")).toBe("/monthly/[amount]");
    expect(sanitizeAnalyticsUrl("/monthly/3000000/?utm_source=naver")).toBe("/monthly/[amount]/?utm_source=naver");
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
  it("passes the S1-6 measurement fields through for ad fill and web-vitals attribution events, never amounts", () => {
    const fill = { slot_kind: "result", position: "1234567890", page_path: "/calc/vat", ad_height: 250, viewport: "m" };
    expect(sanitizeAnalyticsParams("ad_filled", fill)).toEqual(fill);
    expect(sanitizeAnalyticsParams("ad_unfilled", { ...fill, ad_height: 0, viewport: "d" })).toEqual({ ...fill, ad_height: 0, viewport: "d" });
    const lcp = { metric_name: "LCP", metric_value: 1800, metric_rating: "good", lcp_element: "img#hero.rounded-xl.shadow", lcp_load_state: "complete" };
    expect(sanitizeAnalyticsParams("web_vitals", lcp)).toEqual(lcp);
    const cls = { metric_name: "CLS", metric_value: 120, cls_target: "div.ad-container.ad-slot-result" };
    expect(sanitizeAnalyticsParams("web_vitals", cls)).toEqual(cls);
    // A caller that mistakenly attached amounts would still have them dropped.
    expect(sanitizeAnalyticsParams("ad_filled", { ...fill, amount: 80000000, salary: 1, inputs: { salary: 1 } })).toEqual(fill);
  });
  it("allows comparison state while excluding arbitrary offer inputs and names", () => {
    expect(sanitizeAnalyticsParams("offer_compare_complete", {
      comparison_mode: "first", measurement_version: "1", company_name: "private company",
      offers: [{ salary: 70000000 }], dependents: 2, snapshot_id: "private-id",
    })).toEqual({ comparison_mode: "first", measurement_version: "1" });
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag, location: { href: "https://www.moneysalary.com/calc/offer-compare" } });
    trackOfferCompareComplete("first");
    trackOfferCompareComplete("recalculate");
    trackOfferCompareExplanationView();
    expect(gtag.mock.calls.map((call) => call[1])).toEqual([
      "offer_compare_complete", "offer_compare_complete", "offer_compare_explanation_view",
    ]);
    expect(gtag.mock.calls[1][2]).toMatchObject({ comparison_mode: "recalculate", measurement_version: "1" });
    expect(gtag.mock.calls[2][2]).toMatchObject({ section: "result_basis" });
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
