import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import LocaleSwitcher from "@/components/header/LocaleSwitcher";

const hooks = vi.hoisted(() => ({ pathname: "/share/example", hydrated: false, effects: [] as Array<() => void> }));
vi.mock("react", async importOriginal => ({
  ...await importOriginal<typeof import("react")>(),
  useState: () => [hooks.hydrated, (value: boolean) => { hooks.hydrated = value; }],
  useEffect: (callback: () => void) => { hooks.effects.push(callback); },
}));
vi.mock("next/navigation", () => ({ usePathname: () => hooks.pathname }));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: Record<string, unknown>) => createElement("a", props, children as string) }));
afterEach(() => { hooks.hydrated = false; hooks.effects = []; hooks.pathname = "/share/example"; vi.unstubAllEnvs(); });

describe("LocaleSwitcher in a shared Pages document", () => {
  it("uses a stable current-language link initially, then restores the actual path after effects", () => {
    vi.stubEnv("NEXT_PUBLIC_PAGES_STATIC_EXPORT", "1");
    const initial = renderToStaticMarkup(createElement(LocaleSwitcher));
    expect(initial).toContain('href="#" hrefLang="ko"');
    expect(initial).toContain('href="/en" hrefLang="en"');
    hooks.effects.forEach(effect => effect());
    const hydrated = renderToStaticMarkup(createElement(LocaleSwitcher));
    expect(hydrated).toContain('href="/share/example" hrefLang="ko"');
    expect(hydrated).not.toContain('href="#"');
  });

  it("preserves the original immediate links in ordinary Next builds", () => {
    vi.stubEnv("NEXT_PUBLIC_PAGES_STATIC_EXPORT", "0");
    expect(renderToStaticMarkup(createElement(LocaleSwitcher))).toContain('href="/share/example" hrefLang="ko"');
    hooks.pathname = "/guides";
    expect(renderToStaticMarkup(createElement(LocaleSwitcher))).toContain('href="/en/guides" hrefLang="en"');
  });

  it.each(["desktop", "mobile"] as const)("keeps Korean and English 404 aliases identical before effects (%s)", variant => {
    vi.stubEnv("NEXT_PUBLIC_PAGES_STATIC_EXPORT", "1");
    for (const [template, paths] of [
      ["/404", ["/guides/qa-missing", "/glossary/qa-missing", "/qna/qa-missing", "/salary-db/qa-missing", "/unknown/deep/path"]],
      ["/en/page-unavailable", ["/en/guides/qa-missing", "/en/unknown", "/en/unknown/deep/path"]],
    ] as const) {
      hooks.pathname = template;
      const expected = renderToStaticMarkup(createElement(LocaleSwitcher, { variant }));
      for (const pathname of paths) {
        hooks.pathname = pathname;
        expect(renderToStaticMarkup(createElement(LocaleSwitcher, { variant }))).toBe(expected);
      }
    }
  });

  it.each([
    ["/guides/qa-missing", "/guides/qa-missing", "/en/guides"],
    ["/guides", "/guides", "/en/guides"],
    ["/en/guides", "/guides", "/en/guides"],
    ["/en/guides/qa-missing", "/", "/en/guides/qa-missing"],
  ])("restores both actual language targets after hydration at %s", (pathname, ko, en) => {
    vi.stubEnv("NEXT_PUBLIC_PAGES_STATIC_EXPORT", "1");
    hooks.pathname = pathname;
    const initial = renderToStaticMarkup(createElement(LocaleSwitcher));
    expect(initial).not.toContain('href="/en/guides"');
    hooks.effects.forEach(effect => effect());
    const hydrated = renderToStaticMarkup(createElement(LocaleSwitcher));
    expect(hydrated).toContain(`href="${ko}" hrefLang="ko"`);
    expect(hydrated).toContain(`href="${en}" hrefLang="en"`);
    expect(hydrated).not.toContain('href="#"');
  });
});
