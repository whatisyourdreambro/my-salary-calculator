// 기업 이상형 월드컵 — 서버 렌더에도 게임 판 높이의 빈 자리 (OF4 A1-b, 운영자 결정 2026-11-02)
//
// IdealTypeWorldCup 은 마운트 effect 에서 후보를 섞기 전(SSR·하이드레이션 첫 렌더)에는 후보가 없다. 종전에는 null 을
// 돌려 페이지 래퍼가 첫 화면 높이(min-h-screen)뿐이었고, 마운트 뒤 664px(py-8 + 600px) 게임 판이 생기며 아래
// fun/layout 공통 광고 3개(CalcResultAd·쿠팡 배너·HomeTopAd)가 약 200~300px 밀렸다. 이제 같은 크기의 빈 자리
// (문구 없음, aria-hidden)를 먼저 그려 광고의 최종 위치는 그대로 두고 하이드레이션 뒤 밀림만 없앤다.
// 대결 화면의 py-8·min-h-[600px]·h-[600px] 이 바뀌면 이 테스트가 빈 자리도 같이 바꾸라고 알린다.
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import IdealTypeWorldCup, { type WorldcupCompany } from "@/components/IdealTypeWorldCup";

const src = readFileSync("src/components/IdealTypeWorldCup.tsx", "utf8").replace(/\r\n/g, "\n");
const companies: WorldcupCompany[] = Array.from({ length: 16 }, (_, i) => ({
  logo: "🏢",
  nameKo: `회사${i + 1}`,
  industry: "IT",
  entryBase: 40000000,
  cultureScore: 4,
}));

describe("기업 이상형 월드컵 게임 판 자리", () => {
  it("SSR(효과 실행 전) 출력은 문구 없는 같은 크기의 빈 자리다", () => {
    const html = renderToStaticMarkup(createElement(IdealTypeWorldCup, { companies }));
    expect(html).toBe('<div class="w-full max-w-6xl mx-auto px-4 py-8" aria-hidden="true"><div class="min-h-[600px]"></div></div>');
  });

  it("빈 자리 분기는 대결 화면과 같은 바깥 py-8 과 600px 높이를 쓴다", () => {
    const emptyAt = src.indexOf("if (candidates.length === 0) {");
    const matchAt = src.indexOf("const leftContender");
    expect(emptyAt).toBeGreaterThan(-1);
    expect(matchAt).toBeGreaterThan(emptyAt);
    const empty = src.slice(emptyAt, matchAt);
    expect(empty).not.toContain("return null");
    expect(empty).toContain('<div className="w-full max-w-6xl mx-auto px-4 py-8" aria-hidden="true">');
    expect(empty).toContain('<div className="min-h-[600px]" />');
    // 대결 화면: 바깥 py-8, 게임 영역 min-h-[600px], 그 안의 흐름 자식은 h-[600px] 카드 판뿐(라운드 표시는 absolute)
    const match = src.slice(matchAt);
    expect(match).toContain('<div className="w-full max-w-6xl mx-auto px-4 py-8">');
    expect(match).toContain('<div className="relative min-h-[600px] flex flex-col justify-center">');
    expect(match).toContain('<div className="absolute top-0 left-1/2 -translate-x-1/2 z-20');
    expect(match).toContain('<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 h-[600px]">');
  });
});
