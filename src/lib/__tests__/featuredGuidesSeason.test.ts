// 홈 '시즌 이슈' 편집 추천 — 임금협상 가이드는 3~5월에만, 나머지 달은 성과급 가이드 (N2-components-04, 2026-11-15)
//
// components-b03-F01: 종전 월 목록은 9~11월을 협상 갈래로 보내, 타결된 삼성전자(5/27 가결)·SK하이닉스(9/16 가결)
// 임금협상 가이드를 11월 홈 '시즌 이슈' 첫 두 칸에 올렸다. 카드는 GuideMidAd 위라 바뀌는 것은 첫 두 칸뿐이고
// 새 제목은 더 짧다(줄 수 같거나 적음). 2027-03 전에 협상 갈래를 2027 가이드로 바꾸거나 없앨 것.
import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));

import FeaturedGuides from "@/components/FeaturedGuides";

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
