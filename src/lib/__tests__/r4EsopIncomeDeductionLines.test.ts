// 우리사주조합 출연금 400만원 = 소득공제 — 광고 위에 보이는 절세 목록 줄 (R4 SAMSUNG, RL-18 = 2e1b50b32 재이식, 2026-11-18)
//
// /calc/incentive-tax · /calc/year-end-bonus-tax 의 절세 목록 한 줄(GuideMidAd 아래 · InArticleAd 위). 조세특례제한법
// 제88조의4 제1항: 출자금액과 400만원 중 적은 금액을 근로소득금액에서 공제(소득공제, 비과세 아님).
// 문구 '연 400만원 공제 한도액'은 종전 '연 400만원 한도 비과세'와 글자 종류 배열이 같다(한글 1·2·3음절 낱말과 공백 자리) —
// 사이트 글꼴의 한글 음절 폭이 모두 같아 줄바꿈과 높이가 그대로다(아래 마지막 단언).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const hangulShape = (s: string) => s.replace(/[가-힣]/g, "가");

describe("우리사주 출연 400만원 = 소득공제 — 광고 위 목록 줄 (같은 폭)", () => {
  it.each([
    ["src/app/calc/incentive-tax/page.tsx", "우리사주 조합 출연</strong> — 연 400만원 공제 한도액\n"],
    ["src/app/calc/year-end-bonus-tax/page.tsx", "우리사주 조합 출연</strong> — 연 400만원 공제 한도액, 보너스 일부를 자사주로 적립"],
  ])("%s", (file, line) => {
    const src = read(file).replace(/\r\n/g, "\n");
    expect(src).toContain(line);
    expect(src).not.toContain("400만원 한도 비과세");
  });

  it("새 문구는 종전 문구와 글자 종류 배열이 같다(같은 폭·같은 줄바꿈)", () => {
    expect(hangulShape("연 400만원 공제 한도액")).toBe(hangulShape("연 400만원 한도 비과세"));
  });
});
