import { describe, expect, it, vi } from "vitest";
import { glossaryData, toGlossarySlug } from "@/data/glossaryData";
import { qnaData, toQnaSlug } from "@/data/qnaData";

vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => null, InArticleAd: () => null, GuideMidAd: () => null,
  CalcResultAd: () => null, MultiplexAd: () => null,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));

import QnaPage, { generateMetadata as qnaMetadata } from "@/app/qna/[slug]/page";
import GlossaryPage, { generateMetadata as glossaryMetadata } from "@/app/glossary/[slug]/page";

describe("reference detail URLs", () => {
  it.each([
    ["Q&A", QnaPage, qnaMetadata],
    ["glossary", GlossaryPage, glossaryMetadata],
  ] as const)("returns Next's 404 signal, never a hub redirect, for absent %s slugs", async (_, page, metadata) => {
    for (const slug of ["this-entry-does-not-exist", "%E0%A4%A", ""]) {
      await expect(page({ params: Promise.resolve({ slug }) })).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
      await expect(metadata({ params: Promise.resolve({ slug }) })).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
    }
  });

  it("preserves all existing Q&A and glossary URLs, including encoded Korean slugs", async () => {
    for (const [items, toSlug, page, metadata] of [
      [qnaData.map(item => item.question), toQnaSlug, QnaPage, qnaMetadata],
      [glossaryData.map(item => item.title), toGlossarySlug, GlossaryPage, glossaryMetadata],
    ] as const) {
      expect(items.length).toBeGreaterThan(0);
      for (const name of items) {
        const slug = toSlug(name);
        for (const encoded of [slug, encodeURIComponent(slug)]) {
          await expect(page({ params: Promise.resolve({ slug: encoded }) })).resolves.toBeDefined();
          const result = await metadata({ params: Promise.resolve({ slug: encoded }) });
          expect(decodeURIComponent(String(result.alternates?.canonical))).toContain(slug);
          expect(result.robots).not.toMatchObject({ index: false });
        }
      }
    }
  });
});
