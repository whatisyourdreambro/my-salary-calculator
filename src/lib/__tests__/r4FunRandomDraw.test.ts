// /fun/random-draw 레이스 판·순위 상자·당첨자 0명 회귀 가드 (2026-11-15 감사 components-b04-F02, N2-components-11, R4 FUN)
//
// - 캔버스 인라인 스타일이 400px·900px 고정 폭이라 휴대폰에서 오른쪽 벽이 잘렸다. 표시 크기는 열 폭까지 줄이고
//   비율은 aspect-ratio(테두리 포함 상자)로 지킨다 — 넓은 화면에서는 종전 900x800·400x800 그대로.
// - 소스 문자열만 읽는다. 렌더·광고 요청 없음. 실제 높이는 가드 스윕 몫.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/components/RandomDrawGame.tsx"), "utf8").replace(/\r\n/g, "\n");

describe("레이스 판은 열 폭에 맞춰 줄어든다 (components-b04-F02 1단계)", () => {
  it("비트맵은 논리 크기 x dpr 그대로, 표시 폭은 100% · 최대 논리 폭 · 높이 auto · 비율 명시", () => {
    expect(src).toContain("canvas.width = width * dpr;");
    expect(src).toContain("canvas.height = height * dpr;");
    expect(src).toContain('canvas.style.width = "100%";');
    expect(src).toContain("canvas.style.maxWidth = `${width}px`;");
    expect(src).toContain('canvas.style.height = "auto";');
    expect(src).toContain("canvas.style.aspectRatio = `${width} / ${height}`;");
  });

  it("고정 px 표시 크기는 다시 쓰지 않는다", () => {
    expect(src).not.toContain("canvas.style.width = `${width}px`");
    expect(src).not.toContain("canvas.style.height = `${height}px`");
  });

  it("논리 판 크기는 그대로(400·900 x 800) — 넓은 화면의 높이가 종전과 같다", () => {
    expect(src).toContain("const width = window.innerWidth < 600 ? 400 : 900;");
    expect(src).toContain("const height = 800;");
  });

  it("실시간 순위 상자는 휴대폰에서 w-40·p-3 (sm 이상은 종전 w-80·p-6), 판 위에 떠 있는 absolute 그대로", () => {
    const box = /<div className="(absolute top-24 [^"]+)">\s*<h3 className="([^"]+)">\s*<Trophy/.exec(src);
    expect(box).not.toBeNull();
    const cls = box![1].split(/\s+/);
    expect(cls).toEqual(expect.arrayContaining(["absolute", "top-24", "right-2", "sm:right-6", "w-40", "sm:w-80", "p-3", "sm:p-6", "pointer-events-none"]));
    expect(cls).not.toContain("w-80");
    expect(cls).not.toContain("p-6");
    expect(box![2].split(/\s+/)).toEqual(expect.arrayContaining(["text-sm", "sm:text-lg", "mb-2", "sm:mb-4"]));
  });

  it("순위 상자는 판 높이 안에서 잘린다 — 낮아진 판 아래 광고 위로 넘치지 않게 (R4 FUN 검토)", () => {
    // 판이 열 폭에 맞춰 낮아지면(320px 약 576, 600~767px 약 501~642) 당첨자 7명 이상에서 상자 아래 끝(top-24 + 머리 + 목록 최대 500)이
    // 판 밖으로 나가 종료 화면 InArticleAd(판 아래 약 48px)·레이스 중 CalcResultAd 를 덮었다. 상자는 판 아래 끝 1rem 위까지.
    const box = /<div className="(absolute top-24 [^"]+)">\s*<h3/.exec(src);
    expect(box).not.toBeNull();
    const cls = box![1].split(/\s+/);
    expect(cls).toEqual(expect.arrayContaining(["max-h-[calc(100%_-_7rem)]", "overflow-hidden"]));
    // 상자를 감싼 게임 화면은 relative 이고 판(canvas) 말고 흐름 안 자식이 없어 100% = 판 높이
    expect(src).toContain('<div className={`relative ${gameState === "setup" ? "hidden" : "block"}`}>');
  });

  it("당첨자 수 칸을 비우거나(0) 소수·음수면 특별상 없이는 레이스를 시작하지 않는다", () => {
    expect(src).toContain('if (!Number.isInteger(winnerCount) || winnerCount < 0 || (winnerCount === 0 && specialPrizes.length === 0)) return alert("당첨자 수를 1명 이상 입력해주세요!");');
    const guard = src.indexOf("Number.isInteger(winnerCount)");
    expect(guard).toBeGreaterThan(src.indexOf('return alert("참가자를 입력해주세요!")'));
    expect(guard).toBeLessThan(src.indexOf("ballsRef.current = names.map("));
    expect(src).toMatch(/id="random-draw-winners"[\s\S]{0,200}allowNegative=\{false\}/);
    // 같은 조건식을 그대로 돌려 본다
    const blocked = (winnerCount: number, prizes: number) =>
      !Number.isInteger(winnerCount) || winnerCount < 0 || (winnerCount === 0 && prizes === 0);
    expect(blocked(Number(""), 0)).toBe(true);
    expect(blocked(1.5, 0)).toBe(true);
    expect(blocked(-1, 2)).toBe(true);
    expect(blocked(0, 1)).toBe(false);
    expect(blocked(1, 0)).toBe(false);
  });

  it("종료됐는데 당첨자가 없으면 'Racing in progress...' 대신 '당첨자가 없습니다'", () => {
    expect(src).toContain('{gameState === "finished" ? "당첨자가 없습니다" : "Racing in progress..."}');
  });

  it("종료 상태 광고 자리는 그대로 캔버스 아래 본문 흐름 (광고 코드 변경 없음)", () => {
    expect(src).toMatch(/\{gameState === "finished" && \(\s*<div className="w-full max-w-2xl mx-auto mt-6">\s*<InArticleAd \/>\s*<\/div>\s*\)\}/);
    expect(src.match(/<InArticleAd\b/g)).toHaveLength(1);
  });
});
