// /donation-tax-credit-2026 — 날짜 박힌 FAQ 에 고향사랑기부 12/31 문항 (2026-11-15 SEASONB, app-pages ideas[7]).
// DONATION_DATED_FAQS 는 이 쪽 마지막 광고(MultiplexAd) 아래 맨 끝 블록이라 새 문항이 허용된다(yearEndDatedFaqs.test.ts 가 위치 고정).
// 카드 쪽 2027 변경 문항은 세법 표결 뒤(RL-21) 몫이라 CARD_DATED_FAQS 는 그대로 2문항이다.
// 근거(국가법령정보센터 현행 조문, 2026-11-15 확인): 조세특례제한법 제58조 제1항 '지출한 해당 과세연도의 종합소득산출세액에서 공제',
// 고향사랑 기부금에 관한 법률 [시행 2025. 1. 1.] 제4조 제1항(해당 지자체 주민이 아닌 사람에게서만 모금·접수)·제8조 제3항(연간 2천만원).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import YearEndDatedFaq from "@/components/YearEndDatedFaq";
import {
  CARD_DATED_FAQS,
  DONATION_DATED_FAQS,
  DONATION_DATED_FAQ_BASIS,
  DONATION_DATED_FAQ_CHECKED_LABEL,
  DONATION_DATED_FAQ_CHECKED_ON,
  MEDICAL_DATED_FAQS,
  RENT_DATED_FAQS,
  YEAR_END_DATED_FAQ_CHECKED_ON,
} from "@/lib/yearEndDatedFaqs";
import { DONATION_CREDIT_2026 } from "@/lib/donationCredit";

describe("고향사랑기부 12/31 문항 (SEASONB ideas[7])", () => {
  const item = DONATION_DATED_FAQS.find((f) => f.question === "고향사랑기부금을 2027년 연말정산에 넣으려면 언제까지 기부해야 하나요?");

  it("기부금 쪽 날짜 FAQ 는 2문항, 다른 쪽 문항 수는 그대로", () => {
    expect(DONATION_DATED_FAQS).toHaveLength(2);
    expect(CARD_DATED_FAQS).toHaveLength(2);
    expect(RENT_DATED_FAQS).toHaveLength(2);
    expect(MEDICAL_DATED_FAQS).toHaveLength(2);
    expect(item).toBeDefined();
  });

  it("12월 31일 기준·지출 연도 공제·주민 지자체 제외·연간 2,000만원 (조문 근거)", () => {
    const a = item!.answer;
    expect(a).toContain("2026년 12월 31일까지 기부한 금액이 2027년 1~2월 연말정산(2026년 귀속)에 들어갑니다.");
    expect(a).toContain("기부금을 지출한 과세연도의 소득세에서 공제하므로(조세특례제한법 제58조 제1항)");
    expect(a).toContain("2027년 1월 1일 이후 기부분은 2028년 초 연말정산 몫입니다.");
    expect(a).toContain("본인이 주민으로 있는 지방자치단체에는 기부할 수 없고(고향사랑 기부금에 관한 법률 제4조 제1항)");
    expect(DONATION_CREDIT_2026.HOMETOWN_CAP).toBe(20_000_000);
    expect(a).toContain("1명당 연간 2,000만원까지 기부할 수 있습니다(같은 법 제8조 제3항).");
    expect(a).not.toMatch(/NaN|undefined/);
  });

  it("기부금 쪽 블록만 확인일 2026-11-15·근거 '현행 조문으로', 다른 세 쪽 기본값은 2026-11-01 그대로", () => {
    expect(DONATION_DATED_FAQ_CHECKED_ON).toBe("2026-11-15");
    expect(YEAR_END_DATED_FAQ_CHECKED_ON).toBe("2026-11-01");
    const html = renderToStaticMarkup(
      createElement(YearEndDatedFaq, {
        items: DONATION_DATED_FAQS,
        headingId: "donation-dated-faq",
        checkedOn: DONATION_DATED_FAQ_CHECKED_ON,
        checkedLabel: DONATION_DATED_FAQ_CHECKED_LABEL,
        basis: DONATION_DATED_FAQ_BASIS,
      }),
    );
    expect(html).toContain('dateTime="2026-11-15"');
    expect(html).toContain("2026년 11월 15일</time> 국가법령정보센터 현행 조문으로 확인한 내용입니다.");
    for (const f of DONATION_DATED_FAQS) expect(html).toContain(f.question);

    const page = readFileSync(resolve(process.cwd(), "src/app/donation-tax-credit-2026/page.tsx"), "utf8");
    const at = page.indexOf("<YearEndDatedFaq items={DONATION_DATED_FAQS}");
    const tag = page.slice(at, page.indexOf("/>", at));
    expect(tag).toContain("checkedOn={DONATION_DATED_FAQ_CHECKED_ON}");
    expect(tag).toContain("checkedLabel={DONATION_DATED_FAQ_CHECKED_LABEL}");
    expect(tag).toContain("basis={DONATION_DATED_FAQ_BASIS}");
    for (const other of ["credit-card-deduction-2026", "rent-tax-credit-2026", "medical-tax-credit-2026"]) {
      const src = readFileSync(resolve(process.cwd(), `src/app/${other}/page.tsx`), "utf8");
      expect(src).not.toContain("DONATION_DATED_FAQ_CHECKED_ON");
    }
  });
});
