// AdPlacement 의 <ins> 폭 회귀 가드 (2026-09-04)
//
// 배경: in-article 분기에 width 가 빠져 있어 <ins> 가 0px 폭으로 렌더됐고,
// AdSense 가 슬롯 크기를 결정하지 못해 IN_ARTICLE 슬롯이 사이트 전역에서
// 광고를 요청조차 하지 않았다. 컨테이너가 flexDirection:column + alignItems:center
// 이므로 교차축 크기를 명시하지 않은 자식은 내용에 맞춰 0px 으로 축소된다.
//
// jsdom 환경이 없어 렌더 테스트 대신 소스를 스캔한다
// (scripts/verify-tax-constants.mjs 와 같은 방식).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SOURCE = readFileSync(
  resolve(process.cwd(), "src/components/AdPlacement.tsx"),
  "utf8",
);

/** `...(isInArticle ? {…} : {…})` 삼항의 양쪽 분기를 문자열로 잘라낸다. */
function insStyleBranches(): { inArticle: string; display: string } {
  const start = SOURCE.indexOf("...(isInArticle");
  const qIdx = SOURCE.indexOf("? {", start);
  const cIdx = SOURCE.indexOf(": {", qIdx);
  const end = SOURCE.indexOf("),", cIdx);
  if (start === -1 || qIdx === -1 || cIdx === -1 || end === -1) {
    throw new Error(
      "AdPlacement.tsx 에서 isInArticle 스타일 삼항을 찾지 못했다. 구조가 바뀌었다면 이 테스트도 갱신할 것.",
    );
  }
  return {
    inArticle: SOURCE.slice(qIdx, cIdx),
    display: SOURCE.slice(cIdx, end),
  };
}

describe("AdPlacement <ins> 스타일", () => {
  it("in-article 분기가 width 를 명시한다 — 빠지면 폭 0px 이 되어 광고 요청이 안 된다", () => {
    expect(insStyleBranches().inArticle).toContain('width: "100%"');
  });

  it("일반 display 분기가 width 를 명시한다", () => {
    expect(insStyleBranches().display).toContain('width: "100%"');
  });

  it("컨테이너가 세로 flex + 중앙 정렬이라는 전제가 유지된다", () => {
    // 이 두 속성이 사라지면 위 width 요구의 근거도 사라진다.
    // 그때는 이 파일을 지우거나 전제를 다시 쓸 것.
    expect(SOURCE).toContain('flexDirection: "column"');
    expect(SOURCE).toContain('alignItems: "center"');
  });
});
