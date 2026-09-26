// 가이드·QnA 사실 오류 정정 회귀 방지 (2026-09-25 감사 B9, EDIT-01~15·META-07)
// 정정한 수치가 옛 값으로 되돌아가거나, 검색 전용 설명이 규칙을 벗어나지 않게 막는다.
import { describe, expect, it } from "vitest";
import { guides, koGuides } from "@/lib/guidesContent";
import { guideCards } from "@/lib/guidesMeta.generated";
import { extractGuideFaqs } from "@/lib/guideFaq";
import { qnaData } from "@/data/qnaData";
import { calcBonusNet, DEFAULT_BONUS_CREDIT_RATE, fmtManwon } from "@/lib/bonusTaxCalc";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";

// '-2026' 가이드 본문은 2026 요율 기준 글이다 — calcBonusNet 기본값(현행 요율 포인터, 2026-09-25 N3)이 아니라
// 2026 요율을 명시해 대조한다. QnA(연도 표기 없음)는 현행 엔진과 대조 — 1/1 포인터 전환 뒤 실패하면 QnA 문구 갱신.
const bonus2026 = (salary: number, bonus: number, credit = DEFAULT_BONUS_CREDIT_RATE) =>
  calcBonusNet(salary, bonus, credit, true, INSURANCE_RATES_2026);

/** 만원 단위 반올림 표기(예: 6,776,033 → "678만") — QnA 월 실수령 범위 문구 형식 */
const manRound = (won: number) => `${Math.round(won / 10_000).toLocaleString("ko-KR")}만`;

const bySlug = (slug: string) => {
  const guide = koGuides.find((g) => g.slug === slug);
  if (!guide) throw new Error(`missing guide ${slug}`);
  return guide;
};
const text = (slug: string) => {
  const g = bySlug(slug);
  return `${g.title}\n${g.description}\n${g.content}`;
};

describe("사실 정정 — 옛 오류 문구 재발 금지", () => {
  it("상속세: 배우자 공제는 법정상속분 한도(20억·배우자+자녀 2명 → 약 8.57억)", () => {
    const t = text("inheritance-tax-2026");
    expect(t).not.toContain("세금 0원");
    expect(t).toContain("8.57억");
    expect(t).toContain("1.33억");
  });

  it("성과급 1억·5,000만: 수치는 성과급 엔진(calcBonusNet, 2026 요율) 출력과 같고, 건보 정산은 이듬해 4월", () => {
    const t = text("bonus-1eok-net-payment-2026");
    expect(t).not.toContain("4,700만원");
    expect(t).not.toContain("(7월)");
    expect(t).not.toContain("6,100만원");
    expect(t).toContain("이듬해 4월");
    expect(text("bonus-health-4-percent-2026")).not.toContain("7월에 작년 소득 기준 정산");

    // 연봉 7,000만 + 성과급 1억 — 세후 증가분·총 공제·추가 세액공제 30% 가정값
    const eok = bonus2026(70_000_000, 100_000_000);
    expect(t).toContain(`세후 약 ${fmtManwon(eok.net)}`); // 6,373만원
    expect(t).toContain(`약 ${fmtManwon(eok.totalDeductions)}`); // 3,627만원
    expect(t).toContain(`약 ${fmtManwon(Math.round(bonus2026(70_000_000, 100_000_000, 30).net / 1e6) * 1e6)}`); // 7,300만원

    // 연봉 6,000만 + 성과급 5,000만 — 과세표준 24% 구간, 총 부담·실수령
    const t5 = text("bonus-5000-net-payment-2026");
    const five = bonus2026(60_000_000, 50_000_000);
    expect(t5).not.toContain("9,355만원");
    expect(t5).not.toContain("3,370만");
    expect(t5).toContain(`총 부담 약 ${fmtManwon(five.totalDeductions)}`); // 1,429만원
    expect(t5).toContain(`실수령 약 ${fmtManwon(five.net)}`); // 3,571만원
    expect(t5).toContain(`소득세: 약 ${fmtManwon(five.incomeTaxDelta)}`); // 991만원
  });

  it("국내상장 해외지수 ETF 매매차익은 배당소득 15.4%", () => {
    const t = text("domestic-vs-overseas-etf-tax-2026");
    expect(t).not.toContain("0원 세금");
    expect(t).not.toContain("압도적 유리");
    expect(t).toContain("308만원");
  });

  it("종료된 청년 상품은 신규 가입 종료를 표기한다", () => {
    for (const slug of ["youth-leap-account-2026", "youth-3account-combination-2026", "youth-investment-savings-tax-free-2026"]) {
      expect(text(slug), slug).toContain("2025-12-31");
    }
    expect(text("youth-investment-savings-tax-free-2026")).not.toContain("운용수익 비과세 108만원");
    for (const slug of ["youth-housing-dream-1eok-2026", "youth-housing-dream-account-detail-2026"]) {
      expect(text(slug), slug).not.toContain("1.3억");
      expect(text(slug), slug).not.toContain("600만원까지 40% 공제");
    }
  });

  it("난임시술비 공제율 30%, 구직급여 2026 상·하한", () => {
    expect(text("infertility-medical-20-percent-2026")).toContain("243만원");
    expect(text("infertility-medical-20-percent-2026")).not.toContain("× 20%");
    const job = text("seeking-job-benefit-2026");
    expect(job).not.toContain("7.4만");
    expect(job).not.toContain("6개월 보장");
    expect(job).toContain("68,100원");
    expect(job).toContain("66,048원");
  });

  it("카드 한도 1.2억 구간·종부세 공동명의 각 6억 표기 제거", () => {
    expect(text("credit-card-deduction-limit-detail-2026")).not.toContain("7천~1.2억: 250만원");
    const joint = text("newlywed-joint-ownership-2026");
    expect(joint).not.toContain("각 6억");
    expect(joint).toContain("약 192만원");
    expect(text("gangnam-vs-gangbuk-prop-tax-2026")).not.toContain("공제 0");
  });

  it("기초연금·주택연금·본인부담상한 2026 값", () => {
    expect(text("basic-pension-65-2026")).toContain("349,700원");
    expect(text("reverse-mortgage-2026")).toContain("12억원 이하");
    const oop = text("out-of-pocket-limit-2026");
    expect(oop).toContain("843만원");
    expect(oop).not.toContain("8~9분위");
    expect(oop).not.toContain("자동 환급");
  });

  it("SK하이닉스 FAQ 답변에 9/16 가결 결과가 붙는다", () => {
    const faqs = extractGuideFaqs(bySlug("sk-hynix-bonus-renegotiation-sept-2026").content);
    const stale = faqs.find((f) => f.question.includes("예전처럼 전액 현금"));
    expect(stale?.answer).toContain("9/16 업데이트");
    expect(text("sk-hynix-ps-cash-vs-stock-scenarios-2026")).toContain("9/16");
  });

  it("기준금리 현재값 3.00%(2026-08-27)", () => {
    expect(text("mortgage-refinance-guide-2026")).toContain("3.00%");
  });

  it("QnA — 연봉 1억 실수령·본인부담상한·청년도약계좌", () => {
    const find = (q: string) => qnaData.find((item) => item.question.includes(q));
    const oneEok = find("연봉 1억을 넘으면");
    // 월 실수령 범위 = 현재 엔진(calculateSalary2026, 식대 20만원 비과세) 부양가족 1인~4인
    const net1 = calculateSalary2026(100_000_000, 200_000, 1, 0).netPay;
    const net4 = calculateSalary2026(100_000_000, 200_000, 4, 0).netPay;
    expect(oneEok?.answer.conclusion).toContain(`${manRound(net1)}~${manRound(net4)}원`); // 653만~678만원
    expect(JSON.stringify(oneEok)).not.toContain("680~720");
    expect(JSON.stringify(oneEok)).not.toContain("648만~658만원");
    const oop = find("본인부담상한제");
    expect(JSON.stringify(oop)).toContain("843만원");
    expect(JSON.stringify(oop)).not.toContain("별도 신청 불필요");
    expect(find("청년도약계좌")?.answer.conclusion).toContain("신규 가입이 종료");
  });
});

describe("META-07 검색 전용 설명 규칙", () => {
  const withMeta = guides.filter((g) => g.metaDescription);

  it("설명이 가장 짧던 39편에 80~120자, 이모지 없이 붙는다", () => {
    // 39편(META-07) + W3-A 재작성 키퍼·기둥 글(guideSpec KEEPERS — 키퍼 사양이 metaDescription 80~120자를 요구).
    // 정확한 출처 가드(맵 39편 고정·키퍼 밖 추가 금지)는 guideSpec.test.ts (6) 이 KEEPERS 와 함께 건다.
    expect(withMeta.length).toBeGreaterThanOrEqual(39);
    for (const g of withMeta) {
      const len = [...(g.metaDescription as string)].length;
      expect(len, g.slug).toBeGreaterThanOrEqual(80);
      expect(len, g.slug).toBeLessThanOrEqual(120);
      expect(/\p{Extended_Pictographic}/u.test(g.metaDescription as string), g.slug).toBe(false);
      expect(g.lang, g.slug).toBe("ko");
    }
  });

  it("카드 메타(목록·홈·검색 청크)에는 싣지 않는다", () => {
    for (const card of guideCards) {
      expect("metaDescription" in card, card.slug).toBe(false);
    }
  });
});
