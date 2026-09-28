// S29 — /glossary/[slug] JSON-LD 는 BreadcrumbList·DefinedTerm 두 개만 싣는다.
// 종전 FAQPage 는 생성 질문 5개("…무엇인가요?", "…쉽게 비유하면?" 등)가 본문에 보이지 않아
// 구조화 데이터·본문 불일치였다. 본문(보이는 부분)은 바뀌지 않는다.
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => null, InArticleAd: () => null, GuideMidAd: () => null,
  CalcResultAd: () => null, MultiplexAd: () => null,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));

import JsonLd from "@/components/JsonLd";
import GlossaryPage from "@/app/glossary/[slug]/page";
import { glossaryData, toGlossarySlug } from "@/data/glossaryData";

type LdNode = { "@type"?: string; [key: string]: unknown };

/** 페이지 함수가 돌려준 엘리먼트 트리에서 <JsonLd data> 를 모두 모은다 */
function collectJsonLd(node: ReactNode, out: LdNode[][] = []): LdNode[][] {
  if (Array.isArray(node)) {
    for (const child of node) collectJsonLd(child, out);
    return out;
  }
  if (!isValidElement(node)) return out;
  const el = node as ReactElement<{ data?: LdNode | LdNode[]; children?: ReactNode }>;
  if (el.type === JsonLd) {
    const data = el.props.data!;
    out.push(Array.isArray(data) ? data : [data]);
  }
  collectJsonLd(el.props.children, out);
  return out;
}

describe("S29 용어 사전 상세 JSON-LD", () => {
  it.each(glossaryData.map((item) => [item.title, item] as const))("%s: BreadcrumbList·DefinedTerm 만, FAQPage 없음", (_, item) => {
    const slug = toGlossarySlug(item.title);
    const blocks = collectJsonLd(GlossaryPage({ params: { slug: encodeURIComponent(slug) } }));
    expect(blocks).toHaveLength(1);
    const [data] = blocks;
    expect(data.map((d) => d["@type"])).toEqual(["BreadcrumbList", "DefinedTerm"]);

    const json = JSON.stringify(data);
    expect(json).not.toContain("FAQPage");
    expect(json).not.toContain("무엇인가요?");
    expect(json).not.toContain("쉽게 비유하면?");

    const definedTerm = data[1];
    expect(definedTerm).toMatchObject({
      name: item.title,
      description: item.content,
      url: `https://www.moneysalary.com/glossary/${slug}`,
    });
    const crumbs = data[0].itemListElement as { name: string; item: string }[];
    expect(crumbs.at(-1)).toMatchObject({ name: item.title }); // 빵부스러기 마지막 항목 = 용어명
    expect(decodeURIComponent(crumbs.at(-1)!.item)).toContain(`/glossary/${slug}`);
  });
});
