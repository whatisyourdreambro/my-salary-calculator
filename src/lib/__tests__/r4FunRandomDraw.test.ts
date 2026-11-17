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

  it("종료 상태 광고 자리는 그대로 캔버스 아래 본문 흐름 (광고 코드 변경 없음)", () => {
    expect(src).toMatch(/\{gameState === "finished" && \(\s*<div className="w-full max-w-2xl mx-auto mt-6">\s*<InArticleAd \/>\s*<\/div>\s*\)\}/);
    expect(src.match(/<InArticleAd\b/g)).toHaveLength(1);
  });
});
