// 게임 끝 ↔ 아래 fun/layout 공통 광고 라벨 150px 이상 (OF4 A2, 운영자 결정 2026-11-02)
//
// Google AdSense 광고 게재위치 정책은 광고와 게임 가장자리 사이를 최소 150px 띄우라고 권한다
// (https://support.google.com/adsense/answer/1346295 · https://support.google.com/adsense/answer/2768340).
// 테트리스(방향 버튼·lg 보드)·기업 이상형 월드컵(카드 판)·플래피(캔버스)는 136px·136px·약 88~134px 였다.
// 소스의 Tailwind 간격 클래스(1단위 4px)로 최소 거리를 계산한다 — 렌더·광고 요청 없음, 실측은 가드 스윕 몫.
// 세 페이지 모두 min-h-screen 이라 남는 화면 높이는 거리를 늘리기만 한다(플래피는 세로 가운데 정렬).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const px = (token: string) => Number(token.split("-").pop()) * 4;
function classesOf(src: string, marker: RegExp) {
  const m = marker.exec(src);
  expect(m, String(marker)).not.toBeNull();
  return m![1].split(/\s+/);
}
function spacing(classes: string[], re: RegExp) {
  const hits = classes.filter((c) => re.test(c));
  expect(hits, `${re} in ${classes.join(" ")}`).toHaveLength(1);
  return px(hits[0]);
}

// 공통 광고 위 여백: CalcResultAd 래퍼 my-6(24px)과 AdSlot 바깥 여백 1.5rem(24px)이 병합돼 24px
const AD_GAP = 24;
const MIN = 150;

describe("게임 끝에서 공통 광고 라벨까지 150px 이상", () => {
  it("fun/layout 첫 공통 광고는 my-6 래퍼 안의 CalcResultAd, AdSlot 바깥 여백은 1.5rem", () => {
    expect(read("src/app/fun/layout.tsx")).toMatch(/<div className="my-6">\s*<CalcResultAd \/>/);
    expect(read("src/components/AdPlacement.tsx")).toContain('margin: "1.5rem 0"');
  });

  it("테트리스: 휴대폰·태블릿은 방향 버튼, lg 이상은 보드에서 152px", () => {
    const src = read("src/app/fun/tetris/page.tsx");
    const main = classesOf(src, /<main className="([^"]+)"/);
    const inner = classesOf(src, /<div className="(relative z-10 max-w-5xl[^"]+)"/);
    const dpad = classesOf(src, /<div className="([^"]*\blg:hidden order-3\b[^"]*)"/);
    const phone = spacing(dpad, /^p-\d+$/) + spacing(inner, /^py-\d+$/) + spacing(main, /^pb-\d+$/) + AD_GAP;
    const desktop = spacing(inner, /^py-\d+$/) + spacing(main, /^lg:pb-\d+$/) + AD_GAP;
    expect(phone).toBeGreaterThanOrEqual(MIN);
    expect(desktop).toBeGreaterThanOrEqual(MIN);
  });

  it("기업 이상형 월드컵: 카드 판(h-[600px], 게임 영역 아래 py-8)에서 152px", () => {
    const page = read("src/app/fun/worldcup/page.tsx");
    const game = read("src/components/IdealTypeWorldCup.tsx");
    const wrapper = classesOf(page, /<div className="(min-h-screen[^"]+)"/);
    expect(game).toContain('<div className="relative min-h-[600px] flex flex-col justify-center">');
    expect(game).toContain('<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 h-[600px]">');
    const outer = classesOf(game, /<div className="(w-full max-w-6xl mx-auto px-4 py-\d+)">\s*\{\/\* Header/);
    expect(spacing(outer, /^py-\d+$/) + spacing(wrapper, /^pb-\d+$/) + AD_GAP).toBeGreaterThanOrEqual(MIN);
  });

  it("플래피: 캔버스(마지막 블록)에서 최소 152px", () => {
    const src = read("src/app/fun/flappy/page.tsx");
    const main = classesOf(src, /<main className="([^"]+)"/);
    expect(main).toEqual(expect.arrayContaining(["min-h-screen", "justify-center"]));
    expect(spacing(main, /^pb-\d+$/) + AD_GAP).toBeGreaterThanOrEqual(MIN);
  });
});
