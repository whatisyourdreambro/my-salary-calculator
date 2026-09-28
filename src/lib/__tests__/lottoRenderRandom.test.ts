// /lotto 렌더 중 난수 금지 가드 (2026-09-28, 감사 RT-08)
//
// 배경 블롭 20개의 크기·위치를 렌더마다 Math.random() 으로 만들면 입력 한 글자·세트 공개마다 블롭이 튀고,
// 서버 HTML 과 첫 클라이언트 렌더의 style 이 달라 하이드레이션 불일치가 난다. 블롭은 마운트 뒤 effect 에서
// 한 번만 만든다 — 서버 렌더는 Math.random 을 부르지 않고 배경 컨테이너만 싣는다.

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => createElement("aside", { "data-ad": "calc-result" }),
}));
vi.mock("@/components/PageFooterAds", () => ({ default: () => null }));

import LottoPage from "@/app/lotto/page";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("/lotto — 배경 블롭 난수는 렌더 밖", () => {
  it("서버 렌더 중 Math.random 을 부르지 않고 배경 컨테이너만 싣는다", () => {
    const random = vi.spyOn(Math, "random");
    const html = renderToStaticMarkup(createElement(LottoPage));
    expect(random).not.toHaveBeenCalled();
    expect(html).toContain('<div class="absolute inset-0 z-0 opacity-10 30 pointer-events-none"></div>');
    expect(renderToStaticMarkup(createElement(LottoPage))).toBe(html);
  });
});
