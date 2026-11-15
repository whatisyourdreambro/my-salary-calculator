// /earned-income-credit — '2026년 소득분은 언제 신청하나요?' 답 (2026-11-15 SEASONB, app-pages ideas[2]).
// faq.ts 머리 주석·benefitFaqIntegrity.test.ts 가 문항 수 5개를 고정하므로 새 문항 대신 기존 '반기 신청과 정기 신청' 답에 붙였다.
// FAQ 는 GuideMidAd(본문 마지막 광고) 아래라 답 길이는 광고 위치와 무관하고, 접힌 답은 hidden 이라 높이도 그대로다.
// 근거: 조세특례제한법 [법률 제21467호, 시행 2026. 9. 18.] 제100조의6 제1항(정기 = 종합소득 확정신고 기간 5월)·
// 제7항(하반기 소득분 다음 연도 3월 1일부터 3월 15일까지), 국세청 근로장려금 신청기간 안내(’27.3.1.~3.15.) — 2026-11-15 확인.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { EARNED_INCOME_CREDIT_FAQ } from "@/app/earned-income-credit/faq";

describe("/earned-income-credit — 2026년 소득분 신청 시기 (SEASONB ideas[2])", () => {
  it("문항 수 5개 그대로, '반기 신청과 정기 신청' 답 끝에 2027년 3월·5월 기간", () => {
    expect(EARNED_INCOME_CREDIT_FAQ).toHaveLength(5);
    const item = EARNED_INCOME_CREDIT_FAQ.find((f) => f.question === "반기 신청과 정기 신청 중 무엇이 유리한가요?")!;
    expect(item.answer).toContain("상반기분을 신청했다면 하반기분(3월)·정기분(5월)을 따로 신청하지 않아도 됩니다.");
    expect(item.answer.endsWith(
      "2026년 소득분은 하반기분 반기 신청이 2027년 3월 1~15일, 정기 신청이 2027년 5월 1~31일입니다(조세특례제한법 제100조의6, 2026년 11월 15일 기준).",
    )).toBe(true);
  });

  it("FAQ 목록은 본문 마지막 광고(GuideMidAd) 아래에서 렌더된다", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/earned-income-credit/EarnedIncomeCreditContent.tsx"), "utf8");
    const ads = [...src.matchAll(/<(HomeTopAd|InArticleAd|CalcResultAd|GuideMidAd|MultiplexAd|CoupangBanner|OfferSlot)\b/g)].map((m) => m.index ?? Infinity);
    const faq = src.indexOf("{FAQ_LIST.map(");
    expect(faq).toBeGreaterThan(-1);
    for (const a of ads) expect(a).toBeLessThan(faq);
  });

  it("법정 기간의 끝날은 평일 — 2027-03-15·2027-05-31 은 월요일(연장 없음)", () => {
    expect(new Date(Date.UTC(2027, 2, 15)).getUTCDay()).toBe(1);
    expect(new Date(Date.UTC(2027, 4, 31)).getUTCDay()).toBe(1);
  });
});
