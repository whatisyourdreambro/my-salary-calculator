// /region/[slug] 히어로 라벨 — 자체 집계 추정치를 '전체 평균'이 아니라 '추정 평균'으로 (2026-11-15 app-data-pages-b03-F07).
// 검색 제목은 이미 '추정', 허브(/region)는 '자체 자료 … 참고 연봉'인데 상세 히어로만 '2026년 전체 평균 연봉'이었다.
// HomeTopAd 위 문구라 같은 글자 수(한글 두 음절 교체)·같은 폭으로만 바꾼다 — 게시 전 가드 스윕 대상(지역 상세 19쪽).
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  permanentRedirect: () => {
    throw new Error("redirect");
  },
  notFound: () => {
    throw new Error("not found");
  },
}));
vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));
vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => null,
  InArticleAd: () => null,
  HomeTopAd: () => createElement("div", { "data-test-ad": "HomeTopAd" }),
  GuideMidAd: () => null,
  MultiplexAd: () => null,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));

import { regionsData } from "@/data/regionsData";
import RegionDetailPage from "@/app/region/[slug]/page";

describe("/region/[slug] 히어로 평균 연봉 라벨", () => {
  it("지역 상세는 19쪽이다 (스윕 목록과 같은 수)", () => {
    expect(regionsData).toHaveLength(19);
  });

  it.each(regionsData.map((r) => [r.id] as const))("/region/%s — '2026년 추정 평균 연봉', '전체 평균' 라벨 없음", async (id) => {
    const html = renderToStaticMarkup(await RegionDetailPage({ params: Promise.resolve({ slug: id }) }));
    const label = html.indexOf("2026년 추정 평균 연봉");
    expect(label).toBeGreaterThan(0);
    expect(html).not.toContain("2026년 전체 평균 연봉");
    // 라벨은 첫 광고(HomeTopAd) 위 히어로 안에 있다 — 그래서 같은 폭 교체만 허용
    expect(label).toBeLessThan(html.indexOf('data-test-ad="HomeTopAd"'));
  });

  it("교체한 두 음절은 글자 수가 같다", () => {
    expect("2026년 추정 평균 연봉".length).toBe("2026년 전체 평균 연봉".length);
  });
});
