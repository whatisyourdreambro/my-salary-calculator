// 가이드 상세 페이지의 메타·payload 계약 (2026-09-25 감사 B9)
// - META-07: 검색 전용 metaDescription 이 있으면 메타 description 에만 쓰이고, 없으면 description 으로 돌아간다.
// - PERF-08: 관련 글 카드에는 본문(content) 없이 카드 필드만 넘긴다.
// - OG-17: 영문 가이드 OG 에 site_name·image:alt, /en 레이아웃 twitter:image.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const captured = vi.hoisted(() => ({ ko: [] as unknown[], en: [] as unknown[] }));

vi.mock("@/lib/guidesContent", () => {
  const base = { category: "세금", tags: ["세금"], level: "초급", views: 0, publishedDate: "2026-05-23" };
  const koGuides = [
    { ...base, slug: "meta-example", title: "메타 예시", description: "짧은 설명", metaDescription: "검색 결과 전용으로 보강한 설명입니다. 화면 TL;DR 은 짧은 설명을 그대로 씁니다.", content: "<h2>본문 A</h2><p>A</p>" },
    { ...base, slug: "plain-example", title: "일반 예시", description: "설명만 있는 글", content: "<h2>본문 B</h2><p>B</p>" },
    { ...base, slug: "third-example", title: "세 번째", description: "세 번째 설명", content: "<h2>본문 C</h2><p>C</p>" },
  ];
  const enGuides = [
    { ...base, lang: "en", category: "Tax", slug: "en-example", title: "English example", description: "English description", content: "<h2>Body</h2>" },
    { ...base, lang: "en", category: "Tax", slug: "en-other", title: "Other English", description: "Other description", content: "<h2>Other body</h2>" },
  ];
  return { koGuides, enGuides, guides: [...koGuides, ...enGuides] };
});
vi.mock("@/app/guides/[slug]/GuidePageClient", () => ({
  default: (props: { relatedGuides: unknown[] }) => {
    captured.ko = props.relatedGuides;
    return null;
  },
}));
vi.mock("@/app/en/guides/[slug]/EnglishGuideClient", () => ({
  default: (props: { relatedGuides: unknown[] }) => {
    captured.en = props.relatedGuides;
    return null;
  },
}));
vi.mock("@/components/RelatedGuides", () => ({ default: () => null }));
vi.mock("@/components/GuideRelatedCalcs", () => ({ default: () => null }));
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => null, HomeTopAd: () => null }));

import KoGuidePage, { generateMetadata as koMetadata } from "@/app/guides/[slug]/page";
import EnGuidePage, { generateMetadata as enMetadata } from "@/app/en/guides/[slug]/page";
import { metadata as enLayoutMetadata } from "@/app/en/layout";

describe("META-07 검색 전용 설명", () => {
  it("metaDescription 이 있으면 meta·OG description 에 쓰인다", async () => {
    const meta = await koMetadata({ params: { slug: "meta-example" } });
    expect(meta.description).toBe("검색 결과 전용으로 보강한 설명입니다. 화면 TL;DR 은 짧은 설명을 그대로 씁니다.");
    expect((meta.openGraph as { description?: string }).description).toBe(meta.description);
  });

  it("metaDescription 이 없으면 기존 description 으로 돌아간다", async () => {
    const meta = await koMetadata({ params: { slug: "plain-example" } });
    expect(meta.description).toBe("설명만 있는 글");
  });
});

describe("PERF-08 관련 글 payload", () => {
  it("한국어 관련 글 카드에는 slug·title·description·category 만 넘긴다", () => {
    renderToStaticMarkup(KoGuidePage({ params: { slug: "meta-example" } }));
    expect(captured.ko.length).toBeGreaterThan(0);
    for (const card of captured.ko) {
      expect(Object.keys(card as object).sort()).toEqual(["category", "description", "slug", "title"]);
    }
  });

  it("영문 관련 글 카드에는 slug·title·description 만 넘긴다", () => {
    renderToStaticMarkup(EnGuidePage({ params: { slug: "en-example" } }));
    expect(captured.en.length).toBeGreaterThan(0);
    for (const card of captured.en) {
      expect(Object.keys(card as object).sort()).toEqual(["description", "slug", "title"]);
    }
  });
});

describe("OG-17 영문 가이드 OG", () => {
  it("og:site_name 과 og:image:alt 를 선언하고 이미지 URL 은 그대로 둔다", async () => {
    const meta = await enMetadata({ params: { slug: "en-example" } });
    const og = meta.openGraph as { siteName?: string; images?: Array<{ url: string; alt?: string }> };
    expect(og.siteName).toBe("Moneysalary");
    expect(og.images?.[0]?.alt).toBe("English example");
    expect(og.images?.[0]?.url).toBe("https://www.moneysalary.com/api/og?lang=en&title=English%20example");
  });

  it("/en 레이아웃 twitter:image 는 openGraph 이미지와 같다", () => {
    const ogImages = (enLayoutMetadata.openGraph as { images: Array<{ url: string }> }).images;
    const twitterImages = (enLayoutMetadata.twitter as { images?: string[] }).images;
    expect(twitterImages).toEqual([ogImages[0].url]);
  });
});
