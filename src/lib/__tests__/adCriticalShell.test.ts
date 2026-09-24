import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// AdSense auto ads remember in-page placements as CSS paths from <body> through
// the root shell: BODY>DIV.flex.flex-col.min-h-screen>MAIN#main-content.flex-grow.w-full>DIV.w-full.h-full>…
// A class rename on any of these three wrappers silently orphans every learned
// placement (2026-09-10: auto in-page impressions fell from ~9.6k to ~2.2k/day).
// Adding classes is safe; removing or renaming the listed ones is not.
const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

const classTokens = (source: string, pattern: RegExp): string[] => {
  const match = source.match(pattern);
  expect(match, `pattern not found: ${pattern}`).not.toBeNull();
  return match![1].split(/\s+/).filter(Boolean);
};

describe("ad-critical root shell classes", () => {
  it("keeps the body wrapper as div.flex.flex-col.min-h-screen", () => {
    const layout = read("src/app/layout.tsx");
    const tokens = classTokens(layout, /<div className="([^"]*min-h-screen[^"]*)">/);
    expect(tokens).toEqual(expect.arrayContaining(["flex", "flex-col", "min-h-screen"]));
  });

  it("keeps main#main-content with flex-grow and w-full", () => {
    const layout = read("src/app/layout.tsx");
    const tokens = classTokens(layout, /<main id="main-content" className="([^"]*)">/);
    expect(tokens).toEqual(expect.arrayContaining(["flex-grow", "w-full"]));
  });

  it("keeps the template wrapper as div.w-full.h-full", () => {
    const template = read("src/app/template.tsx");
    const tokens = classTokens(template, /<div className="([^"]*)">\{children\}<\/div>/);
    expect(tokens).toEqual(expect.arrayContaining(["w-full", "h-full"]));
  });
});
