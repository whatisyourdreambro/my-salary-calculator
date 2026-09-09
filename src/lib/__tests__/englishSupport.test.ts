import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/en/help", useSearchParams: () => new URLSearchParams("source=privacy&type=privacy") }));
import Footer from "@/components/Footer";
import FavoritesButton, { parseFavorites, resolveFavoriteTarget, safeFavoritePath } from "@/components/FavoritesButton";
import ContactForm from "@/app/contact/ContactForm";
import About from "@/app/en/about/page";
import Privacy from "@/app/en/privacy/page";
import Terms from "@/app/en/terms/page";
import { metadata as contactMetadata } from "@/app/en/contact/page";
import { metadata as dashboardMetadata } from "@/app/en/dashboard/page";

describe("English support parity", () => {
  it("renders a fully English contact form with the same fixed submission types and no implicit submit action", () => {
    const html = renderToStaticMarkup(createElement(ContactForm, { locale: "en" }));
    expect(html).not.toMatch(/[가-힣]/);
    expect(html).toContain('value="/en/privacy"');
    expect(html).toContain('value="privacy" selected');
    expect(html).toContain('href="/en/privacy"');
    expect(html).toContain("Send privately to the operator");
    expect(html).toContain("90-day retention");
    expect(html).toContain('maxLength="500"');
    expect(html).not.toContain('action="');
  });
  it("keeps Korean as the shared form's default", () => {
    const html = renderToStaticMarkup(createElement(ContactForm));
    expect(html).toContain("운영자에게 비공개로 보내기");
    expect(html).toContain('value="/privacy"');
    expect(html).toContain('href="/privacy"');
  });
  it("keeps private contact and saved results out of indexing", () => {
    expect(contactMetadata.robots).toMatchObject({ index: false, follow: true });
    expect(dashboardMetadata.robots).toMatchObject({ index: false, follow: true });
  });
  it.each([About, Privacy, Terms])("renders a substantive English policy counterpart with one heading and English support links", Page => {
    const html = renderToStaticMarkup(createElement(Page));
    expect(html).not.toMatch(/[가-힣]/);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect((html.match(/<h2\b/g) ?? []).length).toBeGreaterThanOrEqual(5);
    expect(html).toContain('/en/contact');
    expect(html).not.toMatch(/href="\/(?:contact|dashboard|privacy|terms|about)(?:["?])/);
  });
  it("uses the shared five-section footer, with English routes except the explicit Korean switch", () => {
    const html = renderToStaticMarkup(createElement(Footer));
    expect(html).toContain('<footer lang="en"');
    expect(html.match(/<details\b/g)).toHaveLength(5);
    const internal = [...html.matchAll(/href="(\/[^\"]*)"/g)].map(match => match[1]);
    expect(internal.every(path => path === "/" || path === "/en" || path.startsWith("/en/") || path.startsWith("/en#"))).toBe(true);
    expect(html).toContain("Switch to Korean");
    expect(html).not.toMatch(/[가-힣]/);
  });
});

describe("safe saved page records", () => {
  it("does not borrow an old route title or render a default bookmark before the current canonical arrives", () => {
    const guide = { pathname: "/en/guides/example", canonical: "https://www.moneysalary.com/en/guides/example", title: "Previous guide", notFound: false };
    expect(resolveFavoriteTarget("/en/tools/loan", null)).toBeNull();
    expect(resolveFavoriteTarget("/en/tools/loan", guide)).toBeNull();
    expect(resolveFavoriteTarget("/en/tools/loan", { ...guide, pathname: "/en/tools/loan" })).toBeNull();
    expect(resolveFavoriteTarget("/en/tools/loan", { ...guide, pathname: "/en/tools/loan", canonical: "https://www.moneysalary.com/en/tools/loan", title: "Loan calculator" })).toEqual({ path: "/en/tools/loan", title: "Loan calculator" });
  });
  it("rejects unknown-route 404 context even when its pathname is syntactically safe", () => {
    const context = { pathname: "/en/unknown-page", canonical: "https://www.moneysalary.com/en/unknown-page", title: "Page not found", notFound: true };
    expect(safeFavoritePath(context.pathname)).toBe(true);
    expect(resolveFavoriteTarget(context.pathname, context)).toBeNull();
    expect(resolveFavoriteTarget("/en/contact", { ...context, pathname: "/en/contact", canonical: "https://www.moneysalary.com/en/contact", notFound: false })).toBeNull();
  });
  it("preserves explicitly supplied public KO card targets without borrowing the current page's title", () => {
    expect(resolveFavoriteTarget("/en/help", null, { path: "/table/2026/annual", title: "2026 연봉표" })).toEqual({ path: "/table/2026/annual", title: "2026 연봉표" });
    expect(resolveFavoriteTarget("/en/help", null, { path: "/en/contact", title: "Private contact" })).toBeNull();
  });
  it.each(["https://example.com", "//example.com", "/en/tools?salary=42", "/share/token", "/en/dashboard", "/en/contact", "/api/contact", "/en/%2f%2fevil", "/en/%252f", "/en/%", "/en/\\evil"])("rejects non-page/private paths %s", path => {
    expect(safeFavoritePath(path)).toBe(false);
  });
  it.each(["/en", "/en/tools/loan", "/en/guides/chip-stock-tax-guide", "/glossary/%EA%B8%89%EC%97%AC", "/salary-db/samsung-electronics"])("keeps real public page shapes %s", path => {
    expect(safeFavoritePath(path)).toBe(true);
  });
  it("validates storage records, deduplicates and strips extra fields without inventing a title", () => {
    const item = { path: "/en/tools/loan", title: "Loan estimate", addedAt: "2026-09-09T01:00:00.000Z", personal: "exclude" };
    expect(parseFavorites([item, item, { ...item, path: "//bad" }, { ...item, title: 12 }, null])).toEqual([{ path: item.path, title: item.title, addedAt: item.addedAt }]);
    expect(parseFavorites({ path: "/en" })).toEqual([]);
  });
  it("does not render a save control for unresolved or private pages", () => {
    expect(renderToStaticMarkup(createElement(FavoritesButton, { locale: "en" }))).toBe("");
    expect(renderToStaticMarkup(createElement(FavoritesButton, { path: "/en/contact", locale: "en" }))).toBe("");
    expect(renderToStaticMarkup(createElement(FavoritesButton, { path: "/en/tools/loan", title: "Loan", locale: "en" }))).toContain("Save page to favorites");
  });
});
