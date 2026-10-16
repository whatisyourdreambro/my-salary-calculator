import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isValidElement, type ReactNode } from "react";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/og/route";

const captured = vi.hoisted(() => ({ trees: [] as unknown[] }));

// Exercise the real GET, normalization and JSX builders, without executing the
// vendored CSS parser/image renderer or making any network request.
vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(tree: unknown) { captured.trees.push(tree); }
    async arrayBuffer() { return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]).buffer; }
  },
}));

const FONT_URL = "https://font-fixture.invalid/noto.ttf";
const fetchFixture = vi.fn(async (input: RequestInfo | URL) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.origin === "https://fonts.googleapis.com" && url.pathname === "/css2") {
    return new Response(`@font-face { src: url(${FONT_URL}) format('truetype'); }`, {
      headers: { "Content-Type": "text/css" },
    });
  }
  if (url.href === FONT_URL) return new Response(new Uint8Array([0, 1, 0, 0]));
  throw new Error(`Network forbidden: unexpected OG fetch ${url.origin}${url.pathname}`);
});

beforeEach(() => {
  captured.trees.length = 0;
  fetchFixture.mockClear();
  vi.stubGlobal("fetch", fetchFixture);
  vi.stubGlobal("caches", undefined);
});
afterEach(() => vi.unstubAllGlobals());

const MARKER = "qa-selector";
const CSS_LIKE_TEXT = `${MARKER}:is(.x:not(.y))[data-x="}"]{color:red} <img src=x onerror=alert(1)>`;

function inspectTree(tree: unknown) {
  const text: string[] = [];
  function visit(node: unknown): void {
    if (node === null || node === undefined || typeof node === "boolean") return;
    if (typeof node === "string" || typeof node === "number") { text.push(String(node)); return; }
    if (Array.isArray(node)) { node.forEach(visit); return; }
    expect(isValidElement(node)).toBe(true);
    if (!isValidElement<Record<string, unknown>>(node)) throw new Error("Unexpected non-element in OG tree");
    const { children, ...props } = node.props;
    // No input is permitted in CSS/HTML-bearing properties, even on a component
    // that the image renderer will evaluate later. Inline styles stay static.
    expect(props).not.toHaveProperty("tw");
    expect(props).not.toHaveProperty("className");
    expect(props).not.toHaveProperty("dangerouslySetInnerHTML");
    expect(JSON.stringify(props)).not.toContain(MARKER);
    if (typeof node.type === "function") {
      visit((node.type as (props: Record<string, unknown>) => ReactNode)(node.props));
    } else {
      expect(typeof node.type).toBe("string");
      expect(node.type).not.toMatch(/^(?:style|script|iframe)$/i);
      visit(children);
    }
  }
  visit(tree);
  return text;
}

async function renderQuery(query: Record<string, string>) {
  captured.trees.length = 0;
  const request = new NextRequest(`http://127.0.0.1/api/og?${new URLSearchParams(query)}`);
  const response = await GET(request);
  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toBe("image/png");
  expect(response.headers.has("X-OG-Error")).toBe(false);
  expect(response.headers.get("X-OG-Cache")).toBe("UNAVAILABLE");
  expect(captured.trees).toHaveLength(1);
  return inspectTree(captured.trees[0]);
}

const textRoutes: [string, Record<string, string>][] = [
  ["default title", {}],
  ["English title", { lang: "en" }],
  ["guide title", { type: "guide" }],
  ["fun title", { type: "fun" }],
  ["report title", { type: "report" }],
  ["tool name", { type: "tool", name: CSS_LIKE_TEXT }],
  ["company name", { type: "company", name: CSS_LIKE_TEXT }],
  ["tool title fallback", { type: "tool" }],
  ["company title fallback", { type: "company" }],
  ["guide path", { path: "/guides/example" }],
  ["fun path", { path: "/fun/example" }],
  ["report path", { path: "/insights/example" }],
  ["company path", { path: "/salary-db/example" }],
];

const numericQueries: [Record<string, string>, string, string | null][] = [
  [{ type: "salary", amount: "50001234", net: "3325678" }, "연봉 5,000만원", "333"],
  [{ amount: "55001234", netPay: "3333333" }, "연봉 5,500만원", "333"],
  [{ type: "salary", amount: "0", net: "0" }, "연봉 0만원", "0"],
  [{ type: "salary", amount: "1000000000000" }, "연봉 100,000,000만원", null],
];

describe("OG route input isolation before image rendering", () => {
  it.each(textRoutes)("keeps CSS/HTML-like %s exclusively in text children", async (_, query) => {
    const text = await renderQuery({ title: CSS_LIKE_TEXT, ...query });
    expect(text.filter(value => value.includes(MARKER))).toEqual([CSS_LIKE_TEXT]);
  });

  it.each([
    ["title", "guide"], ["name", "tool"],
  ])("caps adversarial %s before the renderer, including Unicode code points", async (field, type) => {
    for (const tail of [":is(.x:not(.y))".repeat(1_000), "😀".repeat(1_000)]) {
      const input = `${MARKER} ${tail}`;
      const text = await renderQuery({ type, [field]: input });
      const values = text.filter(value => value.includes(MARKER));
      expect(values).toHaveLength(1);
      const value = values[0];
      expect(Array.from(value)).toHaveLength(121); // 120 input code points + ellipsis.
      expect(value.endsWith("…")).toBe(true);
      expect(input.startsWith(value.slice(0, -1))).toBe(true);
      expect(value).not.toContain("\uFFFD");
      expect(value).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u);
    }
  });

  it.each([
    CSS_LIKE_TEXT, "NaN", "Infinity", "-1", "1e309", "1000000000001", "9".repeat(21),
  ])("discards invalid numeric input %s before formatting a salary card", async invalid => {
    const text = await renderQuery({ type: "salary", amount: invalid, net: invalid, netPay: invalid });
    expect(text).toContain("연봉 5,000만원");
    expect(text).not.toContain("월 ");
    expect(text.join(" ")).not.toMatch(/qa-selector|NaN|Infinity/);
  });

  it.each(numericQueries)(
    "formats bounded numeric query %j as text only", async (query, annual, net) => {
      const text = await renderQuery(query);
      expect(text).toContain(annual);
      if (net !== null) { expect(text).toContain("월 "); expect(text).toContain(net); }
      expect(text.join(" ")).not.toMatch(/NaN|Infinity/);
    },
  );
});
