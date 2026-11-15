// /fun/fortune 글자 대비 가드 (2026-11-15 감사 app-tools-fun-b01-F01, N2-app-tools-fun-02)
//
// 선택된 남성/여성·양력/음력 버튼이 흰 글자 + 연회색 배경(1.40:1), 준비 화면 제목이 #1a1a1a 위 짙은 글자(1.12:1),
// 다크 모드에서 결과 종이(#f5f5f0)의 제목·본문이 밝은 색으로 바뀌어 읽히지 않았다.
// 색 클래스와 속성 하나만 바꾼다. 크기·간격·문구·광고는 그대로 — 소스 문자열만 읽는다(렌더·광고 요청 없음).
// /fun/flappy 가드는 flappyReadableColors1115.test.ts (광고 위 변경은 쪽마다 한 커밋이라 파일도 나눈다).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const fortune = read("src/app/fun/fortune/page.tsx");

describe("/fun/fortune readable colours", () => {
  it("input card is solid white, selected toggles are white on red", () => {
    expect(fortune).not.toContain("bg-white/80");
    expect(fortune).toContain('className="bg-white backdrop-blur-md');
    expect(fortune).not.toContain("bg-canvas-deeper text-white");
    expect(fortune.match(/\? "bg-red-700 text-white shadow-md"/g)).toHaveLength(2);
  });

  it("loading heading and helper lines on #1a1a1a use light colours", () => {
    expect(fortune).toContain('<h2 className="text-2xl font-bold mb-4 text-[#e5e5e5]">재미용 운세 문구를 준비하고 있습니다...</h2>');
    expect(fortune).not.toMatch(/<h2[^>]*text-navy[^>]*>재미용 운세/);
    expect(fortune).toContain('<p className="text-gray-400 text-lg">');
    expect(fortune).toContain('<p className="text-gray-400 animate-pulse">');
    expect(fortune).toContain('<p className="text-sm font-bold text-gray-400">결과 공유하기</p>');
    expect(fortune).toContain('<p className="text-center text-xs text-gray-400 leading-relaxed">');
  });

  it("result paper keeps its own palette in dark mode", () => {
    const start = fortune.indexOf("bg-[#f5f5f0]");
    expect(start).toBeGreaterThan(0);
    const openTag = fortune.slice(fortune.lastIndexOf("<div", start), start);
    expect(openTag).toContain("data-share-color-scope");
    const paper = fortune.slice(start, fortune.indexOf("<InArticleAd />", start));
    expect(paper).not.toMatch(/text-(?:faint|muted)-blue/);
    expect(paper.match(/text-stone-600/g)).toHaveLength(7);
  });
});
