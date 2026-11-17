// /calc/samsung-bonus SK하이닉스 비교 상자 — 2025년분 PS 이연분 20% 는 9/16 가결안으로 조기 지급 (R4 SAMSUNG, N2-calc-07 calc-03-F09 b, 2026-11-18)
//
// 종전 '(80% 즉시 · 20% 2년 이연)'. 2026-09-16 가결안은 2025년분 이연분 20%를 2026년 안에 한꺼번에 선지급한다
// (세계일보 2026-09-16). 상자는 CalcResultAd 아래 · 페이지 InArticleAd 위라 더 좁은 문구만 쓴다 —
// 사이트 글꼴 400·12px 132.10px -> 126.75px, 줄 시뮬레이션 320~1920px 줄이 느는 폭 0.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const client = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-bonus/Client.tsx"), "utf8");

describe("삼성 성과급 SK 비교 상자 (N2-calc-07 calc-03-F09 b)", () => {
  it("이연분은 조기 지급 — '20% 2년 이연' 없음", () => {
    expect(client).toContain("(80% 즉시·20% 조기지급)");
    expect(client).not.toContain("20% 2년 이연");
  });
});
