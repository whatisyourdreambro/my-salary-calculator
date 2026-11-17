// 우리사주조합 출연금 400만원 = 소득공제 — 접힌 FAQ 답 정정 고정 (R4 SAMSUNG, RL-18 = 2e1b50b32·895334845 일부, 2026-11-18)
//
// 조세특례제한법 제88조의4 제1항(시행 2026-09-18 현행, 2026-11-18 law.go.kr 재확인): 우리사주조합원이 우리사주 취득을 위해
// 조합에 출자하면 해당 연도 출자금액과 400만원(벤처기업등 1,500만원) 중 적은 금액을 그해 근로소득금액에서 공제한다.
// 비과세 소득이 아니라 소득공제다. 이 파일은 접힌 FAQ(기본 접힘 details, 첫 화면 높이 0)만 본다 —
// 광고 위에 보이는 목록 줄은 r4EsopIncomeDeductionLines.test.ts 가 따로 고정한다(커밋별로 되돌릴 수 있게).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const faqBlock = (src: string) => src.slice(src.indexOf("const FAQ_ITEMS = ["), src.indexOf("];", src.indexOf("const FAQ_ITEMS = [")));

describe("우리사주 출연 400만원 = 소득공제 — 접힌 FAQ", () => {
  it("/calc/incentive-tax 절세 FAQ", () => {
    const faq = faqBlock(read("src/app/calc/incentive-tax/page.tsx"));
    expect(faq).toContain("우리사주조합 출연금 한도 활용(연 400만원 한도 소득공제)");
    expect(faq).not.toContain("400만원 한도 비과세");
  });

  it("/calc/samsung-bonus 절세 FAQ", () => {
    const faq = faqBlock(read("src/app/calc/samsung-bonus/page.tsx"));
    expect(faq).toContain("우리사주조합 출연 (연 400만원 한도 소득공제)");
    expect(faq).not.toContain("400만원 한도 비과세");
  });
});
