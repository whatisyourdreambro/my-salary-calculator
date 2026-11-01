// 게임 조작부 옆 페이지 광고 금지 가드 (IVT-01 Part B, 2026-11-01 운영자 승인 1번).
//  - 테트리스 보드·방향 버튼, 플래피 캔버스(탭=점프), 월드컵 우승 화면(방금 누른 후보 카드 자리)에는
//    광고 컴포넌트를 두지 않는다. 광고는 fun/layout 공통 슬롯만 남는다(이 테스트는 레이아웃을 보지 않는다).
//  - 소스 문자열만 읽는다. 렌더·광고 요청 없음.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const GAME_FILES = [
  "src/app/fun/tetris/page.tsx",
  "src/app/fun/flappy/page.tsx",
  "src/components/IdealTypeWorldCup.tsx",
];
const AD_COMPONENTS = [
  ...[...readFileSync("src/components/AdPlacement.tsx", "utf8").matchAll(/^export (?:function|const) (\w+)/gm)].map((m) => m[1]),
  "PageFooterAds",
];

describe("no page-level ad next to game controls", () => {
  it("reads the ad component names from AdPlacement.tsx", () => {
    expect(AD_COMPONENTS).toEqual(expect.arrayContaining(["InArticleAd", "CalcResultAd", "ResultAd", "HomeTopAd"]));
  });

  it.each(GAME_FILES)("%s imports and renders no ad unit", (file) => {
    const source = readFileSync(file, "utf8");
    expect(source).not.toMatch(/["']@\/components\/(?:AdPlacement|PageFooterAds)["']/);
    for (const name of AD_COMPONENTS) expect(source, name).not.toMatch(new RegExp(`<${name}\\b`));
    expect(source).not.toContain("adsbygoogle");
  });
});
