// 가이드·QnA 사실 오류 정정 회귀 방지 (2026-09-25 감사 B9, EDIT-01~15·META-07)
// 정정한 수치가 옛 값으로 되돌아가거나, 검색 전용 설명이 규칙을 벗어나지 않게 막는다.
import { describe, expect, it } from "vitest";
import { guides, koGuides } from "@/lib/guidesContent";
import { guideCards } from "@/lib/guidesMeta.generated";
import { extractGuideFaqs } from "@/lib/guideFaq";
import { qnaData } from "@/data/qnaData";

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

  it("성과급 1억: 엔진 기준 세후 약 6,100만원, 건보 정산은 이듬해 4월", () => {
    const t = text("bonus-1eok-net-payment-2026");
    expect(t).not.toContain("4,700만원");
    expect(t).not.toContain("(7월)");
    expect(t).toContain("6,100만원");
    expect(t).toContain("이듬해 4월");
    expect(text("bonus-health-4-percent-2026")).not.toContain("7월에 작년 소득 기준 정산");
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
    expect(oneEok?.answer.conclusion).toContain("648만~658만원");
    expect(JSON.stringify(oneEok)).not.toContain("680~720");
    const oop = find("본인부담상한제");
    expect(JSON.stringify(oop)).toContain("843만원");
    expect(JSON.stringify(oop)).not.toContain("별도 신청 불필요");
    expect(find("청년도약계좌")?.answer.conclusion).toContain("신규 가입이 종료");
  });
});

describe("META-07 검색 전용 설명 규칙", () => {
  const withMeta = guides.filter((g) => g.metaDescription);

  it("설명이 가장 짧던 39편에 80~120자, 이모지 없이 붙는다", () => {
    expect(withMeta.length).toBe(39);
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
