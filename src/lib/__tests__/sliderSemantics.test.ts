import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Slider } from "@/components/ui/slider";

describe("single-value slider semantics", () => {
  it("places the label relationship and spoken units on the actual slider thumb", () => {
    const html = renderToStaticMarkup(createElement(Slider, {
      id: "salary", "aria-labelledby": "salary-label", "aria-describedby": "salary-help",
      "aria-valuetext": "15,000원", defaultValue: [15000], min: 10000, max: 50000, step: 1000,
    }));
    const thumb = html.match(/<span\b[^>]*role="slider"[^>]*>/)?.[0];
    expect(thumb).toBeDefined();
    expect(thumb).toContain('id="salary"');
    expect(thumb).toContain('aria-labelledby="salary-label"');
    expect(thumb).toContain('aria-describedby="salary-help"');
    expect(thumb).toContain('aria-valuetext="15,000원"');
    expect(thumb).toContain('aria-valuemin="10000"');
    expect(thumb).toContain('aria-valuemax="50000"');
    expect(html.match(/id="salary"/g)).toHaveLength(1);
  });

  it("also supports a direct accessible name while retaining disabled behavior", () => {
    const html = renderToStaticMarkup(createElement(Slider, {
      "aria-label": "예산", "aria-valuetext": "100,000원", defaultValue: [100000], disabled: true,
    }));
    const thumb = html.match(/<span\b[^>]*role="slider"[^>]*>/)?.[0];
    expect(thumb).toContain('aria-label="예산"');
    expect(thumb).toContain('aria-valuetext="100,000원"');
    expect(thumb).toContain('data-disabled=""');
    expect(thumb).not.toContain('tabindex="0"');
  });
});
