// /auto-tax-2026 — 2027년 1월 연납 답(기존 접힌 FAQ 답 연장) + 연납 가이드 카드 (2026-11-15 SEASONB, app-pages ideas[1]).
// FAQ 목록은 InArticleAd 와 CoupangBanner 사이라(마지막 광고 위) 새 문항은 넣지 않고, 기존 닫힌 <details> 답만 늘린다
// (닫힌 높이 불변). 카드는 마지막 광고(CoupangBanner) 아래 맨 끝 그리드다.
// 근거(국가법령정보센터 현행 조문, 2026-11-15 확인): 지방세법 시행령 [대통령령 제36736호, 시행 2026. 10. 1.] 제125조 제6항
// '대통령령으로 정하는 이자율이란 각각 100분의 5' (개정 2024. 12. 31., 유효기간 없음·부칙 제8조는 적용례뿐),
// 지방세법 [법률 제21308호, 시행 2026. 1. 1.] 제128조 제3항 표(1월 16일부터 1월 31일까지, 납부기한 다음 날부터 12월 31일까지 일수),
// 지방세기본법 [법률 제22017호] 제24조 제1항(기한이 토·일·공휴일이면 그다음 날). 2027-01-31 은 일요일이다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/auto-tax-2026/page.tsx"), "utf8");
const AD_TAG = /<(HomeTopAd|InArticleAd|CalcResultAd|GuideMidAd|MultiplexAd|Display2Ad|CoupangBanner|OfferSlot)\b/g;

describe("/auto-tax-2026 — 2027년 1월 연납 답 (SEASONB ideas[1])", () => {
  const faqs = src.slice(src.indexOf("const FAQS = ["), src.indexOf("];", src.indexOf("const FAQS = [")));

  it("새 FAQ 문항 없이(7개 유지) 기존 '연납 할인' 답에만 붙였다", () => {
    expect(faqs.match(/\bq: "/g)).toHaveLength(7);
    const a = faqs.slice(faqs.indexOf('q: "자동차세 연납 할인은 얼마나 되나요?"'));
    const answer = a.slice(0, a.indexOf("},"));
    expect(answer).toContain("2027년 1월 연납도 같은 방식입니다.");
    expect(answer).toContain("2026년 11월 15일 현재 지방세법 시행령 제125조 제6항은 공제 이자율을 연도 제한 없이 5%로 정하고 있어");
    expect(answer).toContain("2027년 1월 16~31일(31일이 일요일이라 2월 1일까지, 지방세기본법 제24조)");
    expect(answer).toContain("납부기한 다음 날부터 12월 31일까지 기간분 세액의 5%가 공제됩니다(지방세법 제128조 제3항)");
  });

  it("FAQ 는 open 속성 없는 details 로 렌더된다(닫힌 높이 불변)", () => {
    const at = src.indexOf("{FAQS.map((faq, i) => (");
    const details = src.slice(at, src.indexOf("</details>", at));
    expect(details).toContain("<details");
    expect(details).not.toMatch(/\bopen\b/);
  });

  it("2027-01-31 은 일요일, 2027-02-01 은 월요일(지방세기본법 제24조 기한 특례 대상)", () => {
    expect(new Date(Date.UTC(2027, 0, 31)).getUTCDay()).toBe(0);
    expect(new Date(Date.UTC(2027, 1, 1)).getUTCDay()).toBe(1);
  });
});

describe("/auto-tax-2026 — 연납 가이드 카드는 마지막 광고 아래 (SEASONB ideas[1])", () => {
  it("카드가 모든 광고 태그보다 아래, 맨 끝 '함께 보면 좋은 계산기' 그리드 안", () => {
    const at = src.indexOf('href="/guides/car-tax-annual-payment"');
    expect(at).toBeGreaterThan(-1);
    const ads = [...src.matchAll(AD_TAG)].map((m) => m.index ?? Infinity);
    expect(ads.length).toBeGreaterThanOrEqual(5);
    for (const a of ads) expect(a).toBeLessThan(at);
    expect(src.lastIndexOf("함께 보면 좋은 계산기")).toBeLessThan(at);
    expect(src.match(/href="\/guides\/car-tax-annual-payment"/g)).toHaveLength(1);
  });
});
