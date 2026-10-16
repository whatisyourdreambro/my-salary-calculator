import { createRequire } from "node:module";
import { createElement, Fragment, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import NumberInput from "@/components/NumberInput";

const localRequire = createRequire(import.meta.url);
const chartRequire = createRequire(localRequire.resolve("recharts/package.json"));
const reactIs = chartRequire("react-is") as { isFragment: (element: unknown) => boolean };
const chartChildren = chartRequire("./lib/util/ReactUtils.js") as { toArray: (children: ReactNode) => ReactElement[] };

describe("installed React and component-library compatibility (offline)", () => {
  it("lets Recharts recognize and traverse fragments created by the installed React", () => {
    function Marker() { return null; }
    const marker = createElement(Marker, { key: "marker" });
    const fragment = createElement(Fragment, null, marker);
    expect(reactIs.isFragment(fragment)).toBe(true);
    expect(chartChildren.toArray(fragment).map((element) => element.type)).toEqual([Marker]);
  });

  it("renders NumberInput with the actual React server renderer and keeps numeric constraints", () => {
    const html = renderToStaticMarkup(createElement(NumberInput, {
      type: "number", value: 1234, min: 0, max: 5000, "aria-label": "Amount",
    }));
    expect(html).toContain('value="1,234"');
    expect(html).toContain('aria-valuenow="1234"');
    expect(html).toContain('role="spinbutton"');
    expect(html).not.toMatch(/<script|<iframe|<link/i);
  });
});
