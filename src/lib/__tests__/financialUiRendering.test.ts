import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import TableOfContents from "@/components/guides/TableOfContents";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { prepareGuideHeadings } from "@/lib/guideHeadings";

vi.mock("@/components/AdPlacement", () => ({ InArticleAd: () => createElement("div", { "data-test-ad": "result" }) }));
import SalaryResultCard from "@/components/SalaryResultCard";

describe("financial reading and input semantics", () => {
  it("ships usable guide targets and table of contents in the initial HTML", () => {
    const article = prepareGuideHeadings('<h2 id="official-source">공식 출처</h2><h2 class="section">금액 &amp; 조건</h2>');
    const html = renderToStaticMarkup(createElement(TableOfContents, { headings: article.headings }));
    expect(html).toContain('aria-label="이 글의 목차"');
    expect(html).toContain('href="#official-source"');
    expect(html).toContain('href="#guide-section-1"');
    expect(html).toContain("금액 &amp; 조건");
    for (const heading of article.headings) expect(article.html).toContain(`id="${heading.id}"`);
  });

  it("uses a named native radio group with only the current choice checked", () => {
    const html = renderToStaticMarkup(createElement(SegmentedControl, {
      label: "상환 방식", value: "equal", onChange: () => {},
      options: [{ value: "equal", label: "원리금 균등" }, { value: "principal", label: "원금 균등" }],
      description: "상환 방식만 비교합니다.",
    }));
    const inputs = [...html.matchAll(/<input\b[^>]+>/g)].map(match => match[0]);
    expect(inputs).toHaveLength(2);
    expect(inputs.every(input => input.includes('type="radio"'))).toBe(true);
    expect(inputs[0]).toContain("checked");
    expect(inputs[1]).not.toContain("checked");
    expect(inputs[0].match(/name="([^"]+)"/)?.[1]).toBe(inputs[1].match(/name="([^"]+)"/)?.[1]);
    expect(html).toContain("<legend");
    expect(html).toContain("aria-describedby=");
  });

  it("keeps salary values and the result ad in SSR while labeling combined taxes honestly", () => {
    const html = renderToStaticMarkup(createElement(SalaryResultCard, {
      monthlyNet: 3521236, totalDeduction: 645431,
      breakdown: { pension: 197917, health: 152778, longTermCare: 19859, employment: 37500, incomeTax: 215797, localTax: 21580 },
    }));
    expect(html).toContain("3,521,236");
    expect(html).toContain("237,377");
    expect(html).toContain("소득세·지방소득세");
    expect(html).toContain("장기요양보험");
    expect(html).toContain("<dl");
    expect(html).not.toContain("비과세 식대 20만원 및 본인 1인");
    expect(html.match(/data-test-ad="result"/g)).toHaveLength(1);
    expect(html.indexOf("data-test-ad")).toBeGreaterThan(html.indexOf("3,521,236"));
    expect(html.indexOf("data-test-ad")).toBeLessThan(html.indexOf("월 공제 상세"));
  });
});
