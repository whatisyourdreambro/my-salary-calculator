import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import MissingEnglishPage, { dynamicParams, generateStaticParams, metadata } from "@/app/en/[...missing]/page";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_HTTP_ERROR_FALLBACK;404"); } }));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: Record<string, unknown>) => createElement("a", props, children as string) }));
vi.mock("@/components/FavoritesButton", () => ({ default: () => null }));

afterEach(() => vi.unstubAllEnvs());

describe("English 404 native export", () => {
  it("renders the existing recovery body without relying on Flight in the static stage", () => {
    vi.stubEnv("MSY_PAGES_STATIC_EXPORT", "1");
    const html = renderToStaticMarkup(createElement(MissingEnglishPage));
    expect(html).toContain('data-page-state="not-found"');
    expect(html).toContain('lang="en"');
    expect(html).toMatch(/<h1\b[^>]*>This English page could not be found<\/h1>/);
    for (const href of ["/en", "/en/calculators", "/en/guides"]) expect(html).toContain(`href="${href}"`);
    expect(html).not.toMatch(/<script|<iframe|adsbygoogle/);
  });

  it.each([undefined, "0", "true"])("retains normal Next notFound() when the stage flag is %s", value => {
    vi.stubEnv("MSY_PAGES_STATIC_EXPORT", value);
    expect(() => MissingEnglishPage()).toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("exports only the one recovery path and retains English noindex metadata", () => {
    expect(dynamicParams).toBe(false);
    expect(generateStaticParams()).toEqual([{ missing: ["page-unavailable"] }]);
    expect(metadata.title).toEqual({ absolute: "Page not found | Moneysalary" });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
