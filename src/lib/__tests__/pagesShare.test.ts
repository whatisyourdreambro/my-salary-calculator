import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import ShareableResult from "@/components/ShareableResult";
import StaticSharePage from "@/components/StaticSharePage";
import {
  getPagesShareModel, pagesShareTokenFromPath, PAGES_SHARE_BOOTSTRAP_ID,
  readPagesShareBootstrap, renderShareResultHtml, renderShareIslandHtml, serializePagesShareBootstrap,
} from "@/lib/pagesShare";
import { decodeSharedSalary, encodeSalarySharePayload } from "@/lib/salarySharePayload";
import { salaryOgImagePath } from "@/lib/ogUrlVersion";

vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: Record<string, unknown>) => createElement("a", props, children as string) }));
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => createElement("div", { "data-test-ad": true }) }));
vi.mock("@/components/CoupangBanner", () => ({ default: () => createElement("div", { "data-test-affiliate": true }) }));
vi.mock("@/components/ResultSharePanel", () => ({ default: () => createElement("div", { "data-test-share": true }) }));
vi.mock("@/components/NextActions", () => ({ default: ({ annualSalary }: { annualSalary?: number }) => createElement("p", null, annualSalary ?? "generic") }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => createElement("p", null, "related") }));

const legacy = { annualSalary: 50_000_000, nonTaxableAmount: 200_000, dependents: 1, children: 0 };
const regular = { ...legacy, v: 1, taxYear: 2026, incomeType: "regular" };
const cases = [legacy, regular,
  { ...legacy, annualSalary: 50_000_000.125, nonTaxableAmount: 200_000.375 },
  { ...legacy, annualSalary: 72_000_001.12345, nonTaxableAmount: 123_456.98765 },
  { ...regular, annualSalary: 72_000_001, dependents: 4, children: 2 },
  { ...regular, annualSalary: 1_000_000_000 },
  { v: 1, taxYear: 2026, incomeType: "freelancer", monthlyIncome: 3_000_000 },
  { v: 1, taxYear: 2026, incomeType: "part_time", monthlyIncome: 3_000_000 }];
const plain = (html: string) => html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const links = (html: string) => [...html.matchAll(/href="([^"]*)"/g)].map(match => match[1]);

afterEach(() => vi.unstubAllGlobals());

describe("Pages share document bridge", () => {
  it.each(cases)("keeps the existing SSR numbers, labels, inputs, links and OG contract: %j", payload => {
    const token = encodeSalarySharePayload(payload)!;
    const model = getPagesShareModel(token);
    expect(model.valid).toBe(true);
    if (!model.valid) throw new Error("fixture invalid");
    expect(model.decoded).toEqual(decodeSharedSalary(token));
    const oldHtml = renderToStaticMarkup(createElement(ShareableResult, { data: token }));
    const nextHtml = renderShareResultHtml(model, { reserveAd: false });
    expect(plain(nextHtml)).toBe(plain(oldHtml));
    expect(links(nextHtml)).toEqual(links(oldHtml));
    expect(model.canonicalUrl).toBe(`https://www.moneysalary.com/share/${token}`);
    expect(model.imageUrl).toBe(`https://www.moneysalary.com${salaryOgImagePath(model.decoded.annualSalary, model.decoded.monthlyNet)}`);
    expect(model.robots).toBe("noindex, nofollow");
    expect(model.previewDescription).toContain("공개해도 되는지 확인");
    expect(model.shareTitle).toBe(`${model.decoded.regular ? "연봉" : "연 환산 소득"} ${model.decoded.annualSalary.toLocaleString("ko-KR")}원 · 월 수령 추정 ${model.decoded.monthlyNet.toLocaleString("ko-KR")}원`);
    if ("annualSalary" in payload) {
      expect(model.previewDescription).toContain(`월 비과세액 ${payload.nonTaxableAmount.toLocaleString("ko-KR")}원`);
    }
    expect(nextHtml).not.toMatch(/<script|<iframe|<img|onerror=|onclick=/i);
  });

  it.each([null, "", "%broken", "A".repeat(2049), btoa('{"annualSalary":1e999}')])("rejects bad data without result/ad reservation: %s", token => {
    const model = getPagesShareModel(token);
    expect(model.valid).toBe(false);
    expect(model.canonicalUrl).toBeNull();
    expect(renderShareResultHtml(model)).toContain("잘못된 정보입니다.");
    expect(renderShareResultHtml(model)).toContain('data-page-state="error"');
    expect(renderShareResultHtml(model)).toContain('data-pages-share-invalid="true"');
    expect(renderShareResultHtml(model)).not.toMatch(/ad-reservation|adsbygoogle|coupang|result-share-panel/);
    expect(JSON.parse(serializePagesShareBootstrap(model))).toEqual({ v: 1, token: null });
  });

  it("accepts the original encoded legacy token but normalizes re-sharing", () => {
    const oldToken = encodeURIComponent(btoa(JSON.stringify(legacy)));
    const model = getPagesShareModel(oldToken);
    expect(model.valid).toBe(true);
    expect(readPagesShareBootstrap(serializePagesShareBootstrap(model), `/share/${oldToken}`)).toEqual(model);
    const doubleEncoded = encodeURIComponent(oldToken);
    const fromDocument = getPagesShareModel(decodeURIComponent(doubleEncoded));
    expect(readPagesShareBootstrap(serializePagesShareBootstrap(fromDocument), `/share/${doubleEncoded}`)).toEqual(fromDocument);
    expect(pagesShareTokenFromPath('/share/%broken')).toBeNull();
  });

  it("does not trust injected money, a different token, extra keys or a transport suffix", () => {
    const token = encodeSalarySharePayload(regular)!;
    const model = getPagesShareModel(token);
    for (const value of ["{", JSON.stringify({ v: 1, token, monthlyNet: 99999999 }), JSON.stringify({ v: 2, token }),
      serializePagesShareBootstrap(getPagesShareModel(encodeSalarySharePayload(legacy)))]) {
      expect(readPagesShareBootstrap(value, `/share/${token}`).valid).toBe(false);
    }
    expect(readPagesShareBootstrap(serializePagesShareBootstrap(model), `/share/${token}.txt`).valid).toBe(false);
    expect(pagesShareTokenFromPath("/share/a/b")).toBeNull();
    expect(pagesShareTokenFromPath("/share")).toBeNull();
  });

  it("escapes script terminators even if a caller fabricates a model", () => {
    const model = getPagesShareModel(encodeSalarySharePayload(regular));
    if (!model.valid) throw new Error("fixture invalid");
    const serialized = serializePagesShareBootstrap({ ...model, token: '</script><script>&\u2028\u2029' });
    expect(serialized).not.toMatch(/[<>&\u2028\u2029]/);
    expect(JSON.parse(serialized).token).toBe('</script><script>&\u2028\u2029');
  });

  it.each(cases)("server-injected card matches the first client render without Flight mutation: %j", payload => {
    vi.unstubAllGlobals();
    const shell = renderToStaticMarkup(createElement(StaticSharePage));
    const model = getPagesShareModel(encodeSalarySharePayload(payload));
    if (!model.valid) throw new Error("fixture invalid");
    // React 19 hoists the component-owned metadata before main. Compare the
    // opaque body contract separately from the independently rewritten head.
    const body = (html: string) => html.slice(html.indexOf("<main "));
    const injected = body(shell).replace(renderShareIslandHtml(getPagesShareModel(null)), renderShareIslandHtml(model));
    const json = serializePagesShareBootstrap(model);
    vi.stubGlobal("window", { location: { pathname: `/share/${model.token}` } });
    vi.stubGlobal("document", { getElementById: (id: string) => id === PAGES_SHARE_BOOTSTRAP_ID ? { textContent: json } : null });
    const firstRender = renderToStaticMarkup(createElement(StaticSharePage));
    expect(body(firstRender)).toBe(injected);
    expect(firstRender.match(/<title>/g)).toHaveLength(1);
    expect(firstRender).toContain(`<title>${model.metadataTitle}</title>`);
    for (const name of ["description", "twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"])
      expect(firstRender.match(new RegExp(`<meta name="${name}"`, "g"))).toHaveLength(1);
    for (const property of ["og:type", "og:locale", "og:site_name", "og:title", "og:description", "og:url", "og:image", "og:image:width", "og:image:height", "og:image:alt"])
      expect(firstRender.match(new RegExp(`<meta property="${property}"`, "g"))).toHaveLength(1);
    expect(firstRender).toContain(`<meta property="og:title" content="${model.openGraphTitle}"`);
    expect(firstRender).toContain(`<meta property="og:url" content="${model.canonicalUrl}"`);
    expect(firstRender).not.toContain('name="robots"'); // Managed once by Next metadata.
    expect(firstRender.match(new RegExp(`id="${PAGES_SHARE_BOOTSTRAP_ID}"`, "g"))).toHaveLength(1);
    expect(firstRender.indexOf(`id="${PAGES_SHARE_BOOTSTRAP_ID}"`)).toBeGreaterThan(firstRender.indexOf("data-pages-share-result"));
    expect(injected).not.toMatch(/data-test-ad|data-test-affiliate|data-test-share/);
    expect(injected).toContain("data-pages-share-ad-reservation");
  });

  it("keeps the invalid bootstrap inert inside the same opaque island", () => {
    const model = getPagesShareModel(null);
    const html = renderToStaticMarkup(createElement(StaticSharePage));
    expect(html).toContain(renderShareIslandHtml(model));
    expect(html).toContain(`<script id="${PAGES_SHARE_BOOTSTRAP_ID}" type="application/json">{"v":1,"token":null}</script>`);
    expect(html).not.toContain("data-pages-share-ad-reservation");
    expect(html).toContain(`<title>${model.metadataTitle}</title>`);
  });
});
