import { describe, expect, it } from "vitest";
import { generateStaticParams as glossaryParams, dynamicParams as glossaryDynamic } from "@/app/glossary/[slug]/page";
import { generateStaticParams as qnaParams, dynamicParams as qnaDynamic } from "@/app/qna/[slug]/page";
import { glossaryData, getGlossaryBySlug, toGlossarySlug } from "@/data/glossaryData";
import { qnaData, getQnaBySlug, toQnaSlug } from "@/data/qnaData";

describe("finite Korean Pages exports", () => {
  it("exports each existing glossary term exactly once and closes unknown slugs", () => {
    const slugs = glossaryParams().map(item => item.slug);
    expect(glossaryDynamic).toBe(false);
    expect(slugs).toEqual(glossaryData.map(item => toGlossarySlug(item.title)));
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(getGlossaryBySlug(slug)).toBeDefined();
      expect(getGlossaryBySlug(encodeURIComponent(slug))).toBeDefined();
    }
  });
  it("exports each existing question exactly once and closes unknown slugs", () => {
    const slugs = qnaParams().map(item => item.slug);
    expect(qnaDynamic).toBe(false);
    expect(slugs).toEqual(qnaData.map(item => toQnaSlug(item.question)));
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(getQnaBySlug(slug)).toBeDefined();
      expect(getQnaBySlug(encodeURIComponent(slug))).toBeDefined();
    }
  });
});
