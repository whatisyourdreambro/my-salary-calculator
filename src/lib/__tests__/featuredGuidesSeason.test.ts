// 홈 '시즌 이슈' 편집 추천 — 임금협상 가이드는 3~5월에만, 나머지 달은 성과급 가이드 (N2-components-04, 2026-11-15)
//
// components-b03-F01: 종전 월 목록은 9~11월을 협상 갈래로 보내, 타결된 삼성전자(5/27 가결)·SK하이닉스(9/16 가결)
// 임금협상 가이드를 11월 홈 '시즌 이슈' 첫 두 칸에 올렸다. 카드는 GuideMidAd 위라 바뀌는 것은 첫 두 칸뿐이고
// 새 제목은 더 짧다(줄 수 같거나 적음). 2027-03 전에 협상 갈래를 2027 가이드로 바꾸거나 없앨 것.
// 2026-11-15 SEASONC: COMPA 리뷰가 새 카드 설명이 더 길어 572~639px 에서 블록이 19.5~39px 늘어난다고 보고 되돌렸다.
// 두 성과급 가이드의 화면 설명을 바뀌는 카드보다 좁게(사이트 서브셋 글꼴 12px 폭 537.4 <= 551.3, 446.3 <= 497.7) 줄인 뒤
// 다시 적용한다. 설명 폭이 대체 카드 설명 폭 이하이면 line-clamp-2 카드는 어느 칸 폭에서도 줄이 늘 수 없다.
import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));

import FeaturedGuides from "@/components/FeaturedGuides";
import { koGuideCards } from "@/lib/guidesData";
import { koGuides } from "@/lib/guidesContent";

const NEGOTIATION = ["samsung-wage-negotiation-2026", "sk-hynix-wage-2026"];
const BONUS = ["samsung-opi-tai-complete-2026", "sk-hynix-ps-history-2026-prospect"];

function cardSlugsAt(isoDate: string): string[] {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(isoDate));
  const html = renderToStaticMarkup(createElement(FeaturedGuides));
  return [...html.matchAll(/href="\/guides\/([^"]+)"/g)].map((m) => m[1]);
}

afterEach(() => {
  vi.useRealTimers();
});

describe("FeaturedGuides 시즌 갈래", () => {
  it("11월(다음 게시 빌드)과 9월은 성과급 두 편이 첫 두 칸이고 협상 가이드는 시즌 칸에 없다", () => {
    for (const day of ["2026-11-20T12:00:00+09:00", "2026-09-15T12:00:00+09:00", "2026-10-15T12:00:00+09:00"]) {
      const slugs = cardSlugsAt(day);
      expect(slugs.slice(0, 2), day).toEqual(BONUS);
      expect(slugs.length, day).toBe(8);
      for (const s of NEGOTIATION) expect(slugs.slice(0, 2), day).not.toContain(s);
    }
  });

  it("12~2월·6~8월도 성과급, 3~5월만 협상", () => {
    for (const day of ["2026-12-15T12:00:00+09:00", "2027-01-15T12:00:00+09:00", "2026-07-15T12:00:00+09:00"]) {
      expect(cardSlugsAt(day).slice(0, 2), day).toEqual(BONUS);
    }
    for (const day of ["2027-03-15T12:00:00+09:00", "2027-04-15T12:00:00+09:00", "2027-05-15T12:00:00+09:00"]) {
      expect(cardSlugsAt(day).slice(0, 2), day).toEqual(NEGOTIATION);
    }
  });

  it("월 분기 소스 고정", () => {
    const src = readFileSync("src/components/FeaturedGuides.tsx", "utf8");
    expect(src).toContain("if ([3, 4, 5].includes(month)) return PRIORITY_SLUGS_BY_SEASON.negotiation;");
    expect(src).toContain("return PRIORITY_SLUGS_BY_SEASON.bonus;");
    expect(src).not.toContain("[6, 7, 8, 12, 1, 2]");
  });
});
describe("시즌 카드 높이 보호 — 성과급 두 편의 화면 설명은 바뀌는 카드보다 좁게 (SEASONC, 2026-11-15)", () => {
  const card = (slug: string) => koGuideCards.find((g) => g.slug === slug)!;
  const guide = (slug: string) => koGuides.find((g) => g.slug === slug)!;

  it("화면 설명(카드·TL;DR)은 낱말만 지운 짧은 문구", () => {
    expect(card(BONUS[0]).description).toBe("OPI는 연봉의 최대 50%, TAI는 월 기본급 대비 반기 지급. 2025년 실적분 OPI·2026년 상반기 TAI 지급률과 세후.");
    expect(card(BONUS[1]).description).toBe("PS 2023년 0% → 2025년 2,964%. 2026년 실적분부터 현금 50%·자사주 30%·이연 20%.");
    for (const slug of BONUS) expect(guide(slug).description, slug).toBe(card(slug).description);
  });

  it("검색 설명(meta·OG·RSS)은 키퍼 인라인 metaDescription 그대로라 바뀌지 않는다", () => {
    expect(guide(BONUS[0]).metaDescription).toBe(
      "삼성전자 OPI(연봉의 최대 50%, 연 1회)와 TAI(월 기본급 대비, 연 2회)의 차이, 2025년 실적분 OPI·2026년 상반기 TAI 사업부별 지급률, 연봉별 세후와 임금협상 변경점을 정리했습니다.",
    );
    expect(guide(BONUS[1]).metaDescription).toBe(
      "SK하이닉스 PS 연도별 지급률과 2025년 실적분 2,964%의 연봉별 세후, 9월 16일 가결된 2026년 실적분 지급 방식(현금 50%·자사주 30%·이연 20%), 퇴직금 반영 여부를 정리했습니다.",
    );
  });

  it("새 카드 제목은 바뀌는 카드 제목보다 짧고, 설명 글자 수도 크게 늘지 않는다(폭은 글꼴 advance 로 측정 — 커밋 메시지)", () => {
    for (const [i, slug] of BONUS.entries()) {
      expect([...card(slug).title].length, slug).toBeLessThan([...card(NEGOTIATION[i]).title].length);
      expect([...card(slug).description].length, slug).toBeLessThanOrEqual([...card(NEGOTIATION[i]).description].length + 4);
    }
  });
});
