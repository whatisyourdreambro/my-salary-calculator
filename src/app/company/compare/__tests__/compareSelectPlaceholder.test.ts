// /company/compare 선택 상자 자리표시 — 비활성 '기업 선택' 옵션 하나만 (2026-11-15 app-data-pages-b01-F03).
// 종전에는 그 위에 absolute inset-0 '선택해주세요' 덧칠이 있어 Firefox 에서 두 글자가 겹치고 Chrome·Safari 에서 두 번 보였다.
// 덧칠은 절대 위치라 지워도 상자 높이가 같다 — 그래도 GuideMidAd 위라 게시 전 가드 스윕(/company/compare) 대상.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push() {}, replace() {}, prefetch() {} }),
}));

import CompareSelectionClient from "../CompareSelectionClient";

const html = renderToStaticMarkup(createElement(CompareSelectionClient));

describe("/company/compare 선택 자리표시", () => {
  it("두 선택 상자 모두 비활성 '기업 선택' 옵션이 자리표시다", () => {
    expect(html.match(/<option value="" disabled="" selected="">기업 선택<\/option>/g)).toHaveLength(2);
  });

  it("'선택해주세요' 덧칠이 없다", () => {
    expect(html).not.toContain("선택해주세요");
    expect(html).not.toContain("absolute inset-0 pointer-events-none");
  });

  it("relative 감싸개와 두 select 는 그대로다", () => {
    expect(html).toContain('id="ms-company-compare-a"');
    expect(html).toContain('id="ms-company-compare-b"');
    expect(html.match(/<div class="relative"><select /g)).toHaveLength(2);
  });
});
