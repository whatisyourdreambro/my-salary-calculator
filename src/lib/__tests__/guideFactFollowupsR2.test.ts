// R2-FOLLOWUPS (2026-11-01) — 11/1 묶음 리뷰에서 남은 가이드 사실 후속 2건의 회귀 가드.
//
// 1) /guides/housing-subscription-25man-deduction-2026 — 연말정산 계산기 엔진이 표준세액공제(연 13만원, 소득세법
//    제59조의4 제9항) 방식과 특별공제 방식 중 결정세액이 낮은 쪽을 쓰게 된 뒤(CALC-02, 엔진은 PKG-10), 표가 '계산기와
//    같은 엔진으로 계산'했다는 문장은 총급여 3,000만원에서 틀린다(계산기 99,756원 = 표준 방식 90,687원 + 지방소득세,
//    표 89,100원 = 특별 방식). 표는 특별공제 방식 값이라고 적고, 리드의 3,000만원은 계산기가 고르는 표준 방식 값을 먼저 쓴다.
// 2) /guides/temp-two-home-3year-rule-2026 목록 ② — 소득세법 시행령 제155조 제1항 본문은 '종전의 주택을 취득한 날부터
//    1년 이상이 지난 후 신규 주택을 취득'이다. 신규 주택을 1년 보유한 뒤 판다는 요건은 없다(대통령령 제36737호,
//    2026-10-01 시행 원문, https://www.law.go.kr/법령/소득세법시행령/제155조).
// 세 문장 모두 GuideMidAd·InArticleAd 위라 원문보다 짧게만 바꿨다(한글·기타 글자 수 원문 이하 — 통합 스윕이 실측한다).
import { describe, expect, it } from "vitest";
import { GUIDE_FACT_FIX_1101_PUSH } from "@/config/guideFactFixPush";
import { GUIDE_CONTENT_REVISED } from "@/lib/guideContentRevisions";
import { koGuides } from "@/lib/guidesContent";
import { guideCards } from "@/lib/guidesMeta.generated";
import {
  calculateYearEndTax,
  deriveAnnualSocialInsurance2026,
  type TaxInputs,
} from "@/lib/yearEndTaxCalculator";

const guide = (slug: string) => koGuides.find((g) => g.slug === slug)!;
const text = (html: string) => html.replace(/<[^>]+>/g, "");
const counts = (s: string) => ({
  hangul: [...s].filter((c) => /[가-힣]/.test(c)).length,
  other: [...s].filter((c) => !/[가-힣]/.test(c)).length,
});
const expectNotLonger = (before: string, after: string) => {
  const b = counts(before);
  const a = counts(after);
  expect(a.hangul).toBeLessThanOrEqual(b.hangul);
  expect(a.other).toBeLessThanOrEqual(b.other);
};

// 1인 가구, 4대보험은 총급여에서 파생, 다른 공제 없음 — 가이드 표의 가정과 같다
const single = (grossSalary: number, housingSubscription = 0): TaxInputs => ({
  grossSalary,
  prepaidTax: 0,
  ...deriveAnnualSocialInsurance2026(grossSalary),
  dependents: 1,
  disabledDependents: 0,
  seniorDependents: 0,
  housingSubscription,
  creditCard: 0,
  debitCardAndCash: 0,
  traditionalMarket: 0,
  publicTransport: 0,
  children: 0,
  childTaxCreditEligibleChildren: 0,
  birthsOrAdoptions: 0,
  pensionSavings: 0,
  irp: 0,
  lifeInsurance: 0,
  medicalExpenses: 0,
  educationExpenses: 0,
  donation: 0,
  monthlyRent: 0,
});

describe("청약통장 소득공제 가이드 — 표·리드가 계산기 엔진과 같은 말을 한다", () => {
  const g = guide("housing-subscription-25man-deduction-2026");

  it("계산기는 3,000만원에서 표준 방식(90,687원), 4,000만~7,000만원에서 특별 방식(180,000원)을 쓴다", () => {
    const saving = (gross: number) => {
      const without = calculateYearEndTax(single(gross));
      const withSub = calculateYearEndTax(single(gross, 3_000_000));
      return { drop: without.determinedTax - withSub.determinedTax, standard: withSub.standardTaxCreditApplied };
    };
    expect(saving(30_000_000)).toEqual({ drop: 90_687, standard: true });
    for (const gross of [40_000_000, 50_000_000, 60_000_000, 70_000_000]) {
      expect(saving(gross)).toEqual({ drop: 180_000, standard: false });
    }
    // 표 아래 설명의 표준 방식 값과 표의 특별 방식 행은 그대로 남는다
    expect(g.content).toContain("90,687원");
    expect(g.content).toContain("<tr><td>3,000만원</td><td>약 1,583만원</td><td>15% (근로소득세액공제 55% 구간)</td><td>81,000원</td><td>89,100원</td></tr>");
  });

  it("표 설명은 '특별공제 방식 값' — '같은 엔진' 문장이 없고 원문보다 짧다", () => {
    const after = "아래 표는 연말정산 계산기 엔진으로 낸 특별공제 방식 값입니다.";
    expect(g.content).not.toContain("같은 엔진");
    expect(text(g.content)).toContain(after);
    expect(g.content).toContain('<a href="/year-end-tax">연말정산 계산기</a> 엔진으로 낸 특별공제 방식 값입니다.');
    expectNotLonger("아래 표는 이 사이트 연말정산 계산기와 같은 엔진으로 계산했습니다.", after);
  });

  it("리드의 3,000만원은 계산기가 고르는 표준 방식 값(약 9만원)이 먼저 — 원문보다 짧다", () => {
    const after = "3,000만원은 약 9만원(특별공제 방식이면 8만 1,000원)이 줄었습니다.";
    expect(g.content).toContain(after);
    expect(g.content).not.toContain("(표준세액공제를 고르면 약 9만원)");
    expectNotLonger("3,000만원은 8만 1,000원(표준세액공제를 고르면 약 9만원)이 줄었습니다.", after);
  });

  it("본문 정정일은 11/1 묶음 푸시일 — 정본 modifiedDate 와 카드 날짜는 그대로(목록·관련 글 순서 불변)", () => {
    expect(GUIDE_CONTENT_REVISED[g.slug]).toBe(GUIDE_FACT_FIX_1101_PUSH);
    expect(g.modifiedDate).toBe("2026-09-26");
    const card = guideCards.find((c) => c.slug === g.slug)!;
    expect(card.modifiedDate).toBe("2026-09-26");
    expect(card.contentChars).toBe(g.content.length);
  });
});

describe("일시적 2주택 가이드 목록 ② — 1년 요건은 종전 주택 취득부터 신규 주택 취득까지", () => {
  const g = guide("temp-two-home-3year-rule-2026");

  it("시행령 제155조 제1항 본문대로 쓰고, 신규 주택 보유 1년 요건이라는 오기는 없다 — 원문보다 짧다", () => {
    const after = "② 종전 주택 취득 1년 뒤 신규 취득";
    expect(g.content).toContain(`<li><strong>${after}</strong></li>`);
    expect(g.content).not.toContain("신규 주택은 1년 이상 보유 후 매도");
    expectNotLonger("② 신규 주택은 1년 이상 보유 후 매도", after);
    const card = guideCards.find((c) => c.slug === g.slug)!;
    expect(card.contentChars).toBe(g.content.length);
  });
});
