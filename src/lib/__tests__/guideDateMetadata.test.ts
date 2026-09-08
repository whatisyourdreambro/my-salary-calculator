import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/guidesContent", () => {
  const guide = { slug: "date-example", title: "Date example", description: "Date example", category: "세금", tags: [], level: "초급", views: 0, content: "<h2>Updated guide</h2>", publishedDate: "2026-05-23", modifiedDate: "2026-09-09" };
  const koGuides = [guide];
  const enGuides = [{ ...guide, lang: "en", category: "Tax" }];
  return { koGuides, enGuides, guides: [...koGuides, ...enGuides] };
});
vi.mock("@/app/guides/[slug]/GuidePageClient", () => ({ default: () => null }));
vi.mock("@/app/en/guides/[slug]/EnglishGuideClient", () => ({ default: () => null }));
vi.mock("@/components/RelatedGuides", () => ({ default: () => null }));
vi.mock("@/components/GuideRelatedCalcs", () => ({ default: () => null }));
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => null, HomeTopAd: () => null }));

import KoGuidePage, { generateMetadata as koMetadata } from "@/app/guides/[slug]/page";
import EnGuidePage, { generateMetadata as enMetadata } from "@/app/en/guides/[slug]/page";

describe("실제 KO/EN 가이드 페이지의 날짜 전달", () => {
  it.each(["ko", "en"])("페이지 메타와 Article JSON-LD는 원발행일과 수정일을 구분한다: %s", async (lang) => {
    const props = { params: { slug: "date-example" } };
    const metadata = await (lang === "ko" ? koMetadata : enMetadata)(props);
    const openGraph = metadata.openGraph as { publishedTime?: string; modifiedTime?: string };
    expect(openGraph.publishedTime?.slice(0, 10)).toBe("2026-05-23");
    expect(openGraph.modifiedTime?.slice(0, 10)).toBe("2026-09-09");
    const html = renderToStaticMarkup((lang === "ko" ? KoGuidePage : EnGuidePage)(props));
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)]
      .flatMap((match) => JSON.parse(match[1]));
    const article = schemas.find((schema) => schema["@type"] === "Article");
    expect(article).toMatchObject({ datePublished: "2026-05-23T00:00:00.000Z", dateModified: "2026-09-09T00:00:00.000Z" });
  });
});
