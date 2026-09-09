import { describe, expect, it } from "vitest";
import { prepareGuideHeadings } from "./guideHeadings";

describe("guide heading targets", () => {
  it("preserves attributed explicit IDs and decodes inline title entities", () => {
    const result = prepareGuideHeadings('<h2 class="heading" id="official-source"><strong>출처</strong> &amp; &#xAE30;&#51456;</h2>');
    expect(result.headings).toEqual([{ id: "official-source", text: "출처 & 기준" }]);
    expect(result.html).toContain('id="official-source"');
    expect(result.html).toContain("<strong>출처</strong>");
  });
  it("does not mistake data-id for a target and reserves later IDs", () => {
    const result = prepareGuideHeadings('<h2 data-id="not-a-target">첫째</h2><div id="guide-section-1"></div><h2 id=keep>둘째</h2>');
    expect(result.headings.map(heading => heading.id)).toEqual(["guide-section-2", "keep"]);
    expect(result.html).toContain('data-id="not-a-target" id="guide-section-2"');
  });
  it("keeps the first explicit ID and makes duplicate titles/IDs reachable", () => {
    const result = prepareGuideHeadings("<h2 id='same'>제목</h2><h2 id='same'>제목</h2><h2>제목</h2>");
    expect(result.headings.map(heading => heading.id)).toEqual(["same", "guide-section-1", "guide-section-2"]);
  });
  it("adds IDs after original article/ad segmentation without moving boundaries", () => {
    const segments = ['<p>요약</p><h2>첫 항목</h2><p>값</p>', '<h2 id="source">출처</h2><p>공식 자료</p>'];
    const result = prepareGuideHeadings(segments.join(""), segments);
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0]).toContain("첫 항목");
    expect(result.segments[0]).not.toContain("공식 자료");
    expect(result.segments[1]).toBe(segments[1]);
    expect(prepareGuideHeadings(result.html).html).toBe(result.html);
  });
  it("handles multiline, empty and quoted-angle headings without changing text", () => {
    const result = prepareGuideHeadings('<H2 title="A > B">\n금액 <em>조건</em>\n</H2><h2></h2><h3>세부 항목</h3>');
    expect(result.headings).toEqual([{ id: "guide-section-1", text: "금액 조건" }]);
    expect(result.html).toContain('<h3>세부 항목</h3>');
  });
});
