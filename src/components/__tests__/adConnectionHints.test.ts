import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdConnectionHints from "@/components/AdConnectionHints";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Server render only: no browser, no network, no SDK.
afterEach(() => vi.unstubAllEnvs());

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");
const render = () => renderToStaticMarkup(createElement(AdConnectionHints));

describe("AdSense connection hints", () => {
  it("renders only a connection hint, never a script or preload, in ordinary production builds", () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("NEXT_PUBLIC_ADS_DISABLED", "0"); vi.stubEnv("MSY_QA_MODE", "0");
    const html = render();
    expect(html).toContain('rel="preconnect" href="https://pagead2.googlesyndication.com"');
    expect(html).toContain('rel="dns-prefetch" href="https://pagead2.googlesyndication.com"');
    expect(html).not.toMatch(/<script|rel="preload"|adsbygoogle|ca-pub-|googletagmanager/);
    // Exactly the two 913bd52a7 pagead2 hints; the preconnect matches the SDK's anonymous-CORS fetch.
    expect(html).toBe(
      '<link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin="anonymous"/>' +
      '<link rel="dns-prefetch" href="https://pagead2.googlesyndication.com"/>',
    );
  });

  it("also renders the hints in a production build that leaves the QA flags unset", () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("NEXT_PUBLIC_ADS_DISABLED", undefined); vi.stubEnv("MSY_QA_MODE", undefined);
    expect(render().match(/<link /g)).toHaveLength(2);
  });

  it.each([
    ["QA build", { NODE_ENV: "production", NEXT_PUBLIC_ADS_DISABLED: "1", MSY_QA_MODE: "1" }],
    ["ads-disabled build", { NODE_ENV: "production", NEXT_PUBLIC_ADS_DISABLED: "1", MSY_QA_MODE: "0" }],
    ["QA mode flag alone", { NODE_ENV: "production", NEXT_PUBLIC_ADS_DISABLED: "0", MSY_QA_MODE: "1" }],
    ["development", { NODE_ENV: "development", NEXT_PUBLIC_ADS_DISABLED: "0", MSY_QA_MODE: "0" }],
    ["test", { NODE_ENV: "test", NEXT_PUBLIC_ADS_DISABLED: "0", MSY_QA_MODE: "0" }],
  ])("renders nothing in a %s", (_name, env) => {
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
    expect(render()).toBe("");
  });

  it("is the first node of the root head and is the only ad origin there", () => {
    const layout = read("src/app/layout.tsx");
    expect(layout).toMatch(/<head>\s*<AdConnectionHints \/>/);
    expect(layout).not.toContain("googlesyndication.com");
  });

  it("stays a server component that reads the build flags on the server", () => {
    // Multiline: a directive may follow the header comment, as in many repo client files.
    expect(read("src/components/AdConnectionHints.tsx")).not.toMatch(/^\s*["']use client["']/m);
  });
});
