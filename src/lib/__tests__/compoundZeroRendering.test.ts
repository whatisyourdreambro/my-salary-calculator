import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

// Set only this calculator's two amount inputs to zero; retain real React hooks/rendering.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useState: (initial: unknown) => actual.useState(
      initial === 10_000_000 || initial === 500_000 ? 0 : initial,
    ),
  };
});
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => null }));
import CompoundPage from "@/app/tools/finance/compound/page";

it("renders the actual zero-investment page without NaN in text or chart widths", () => {
  const html = renderToStaticMarkup(createElement(CompoundPage));
  expect(html).toContain("투자금이 0원이므로 수익 배율은 계산하지 않습니다.");
  expect(html).not.toMatch(/NaN|Infinity/);
  expect(html).toContain("width:0.0%");
  expect(html).toContain("수익 배율");
  expect(html).toContain("—");
});
