// S24 — /qna/[slug]·/glossary/[slug] 의 generateMetadata 와 페이지 본문이 React cache 로 감싼
// 같은 조회 함수를 거쳐, 한 요청(같은 slug)에서 데이터 조회가 한 번만 일어나는지 확인한다.
// vitest 의 react 18 안정판에는 cache 가 없으므로, Next 서버 빌드의 React.cache 처럼 인자별 결과를
// 기억하는 최소 대역으로 바꿔 끼운다. (cache 가 없을 때의 폴백 경로는 referenceRouteNotFound 테스트가 탄다)
import { describe, expect, it, vi } from "vitest";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  const cache = <A, R>(fn: (arg: A) => R) => {
    const memo = new Map<A, R>();
    return (arg: A): R => {
      if (!memo.has(arg)) memo.set(arg, fn(arg));
      return memo.get(arg) as R;
    };
  };
  return { ...actual, cache };
});
vi.mock("@/data/qnaData", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/data/qnaData")>();
  return { ...actual, getQnaBySlug: vi.fn(actual.getQnaBySlug) };
});
vi.mock("@/data/glossaryData", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/data/glossaryData")>();
  return { ...actual, getGlossaryBySlug: vi.fn(actual.getGlossaryBySlug) };
});
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => null, InArticleAd: () => null, GuideMidAd: () => null,
  CalcResultAd: () => null, MultiplexAd: () => null,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));

import { getQnaBySlug, qnaData, toQnaSlug } from "@/data/qnaData";
import { getGlossaryBySlug, glossaryData, toGlossarySlug } from "@/data/glossaryData";
import QnaPage, { generateMetadata as qnaMetadata } from "@/app/qna/[slug]/page";
import GlossaryPage, { generateMetadata as glossaryMetadata } from "@/app/glossary/[slug]/page";

describe("S24 상세 페이지 조회 공유(React cache)", () => {
  it("/qna/[slug]: generateMetadata + 페이지 본문 = getQnaBySlug 1회", async () => {
    const slug = encodeURIComponent(toQnaSlug(qnaData[0].question));
    vi.mocked(getQnaBySlug).mockClear();
    const meta = await qnaMetadata({ params: { slug } });
    expect(() => QnaPage({ params: { slug } })).not.toThrow();
    expect(getQnaBySlug).toHaveBeenCalledTimes(1);
    expect(getQnaBySlug).toHaveBeenCalledWith(slug);
    expect(decodeURIComponent(String(meta.alternates?.canonical))).toContain(toQnaSlug(qnaData[0].question));
  });

  it("/glossary/[slug]: generateMetadata + 페이지 본문 = getGlossaryBySlug 1회", async () => {
    const slug = encodeURIComponent(toGlossarySlug(glossaryData[0].title));
    vi.mocked(getGlossaryBySlug).mockClear();
    const meta = await glossaryMetadata({ params: { slug } });
    expect(() => GlossaryPage({ params: { slug } })).not.toThrow();
    expect(getGlossaryBySlug).toHaveBeenCalledTimes(1);
    expect(getGlossaryBySlug).toHaveBeenCalledWith(slug);
    expect(decodeURIComponent(String(meta.alternates?.canonical))).toContain(toGlossarySlug(glossaryData[0].title));
  });

  it("없는 slug 도 조회 1회 후 두 곳 모두 404 신호", async () => {
    const slug = "s24-cache-absent-slug";
    vi.mocked(getQnaBySlug).mockClear();
    await expect(qnaMetadata({ params: { slug } })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(() => QnaPage({ params: { slug } })).toThrow("NEXT_NOT_FOUND");
    expect(getQnaBySlug).toHaveBeenCalledTimes(1);
  });
});
