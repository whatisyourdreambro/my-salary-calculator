// guide_cta_click 목적지 템플릿(dest_tpl) 회귀 가드 (2026-09-26 RPM-02, 측정 전용)
//
// 배경: InternalLinkTracker 는 slug=href 로 보내지만 href 는 하루 고유값이 500개를 넘어
// GA4 맞춤 측정기준으로 등록할 수 없다(analytics.ts trackInternalLinkClick 주석). 그래서 어느 모듈이
// 어떤 템플릿으로 보냈는지 보고서에서 보이지 않았다. dest_tpl 은 href 를 17개 고정값으로 묶는다.
// 값이 바뀌면 GA4 에 쌓인 행과 이어지지 않으므로 표로 고정한다.

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEST_TEMPLATES,
  destTemplate,
  trackGuideCTAClick,
  trackInternalLinkClick,
  type DestTemplate,
} from "../analytics";

afterEach(() => vi.unstubAllGlobals());

const CASES: Array<[string, DestTemplate]> = [
  // 홈 — 쿼리·해시 제거
  ["/", "home"],
  ["/?utm_source=naver", "home"],
  ["/#calculator", "home"],
  // 회사 DB 허브·회사·비교·순위
  ["/salary-db", "salary-db-hub"],
  ["/salary-db/", "salary-db-hub"],
  ["/salary-db?tier=public#list", "salary-db-hub"],
  ["/salary-db/samsung-electronics", "company"],
  ["/salary-db/samsung-electronics/", "company"],
  ["/salary-db/samsung-electronics#bonus", "company"],
  ["/salary-db/sk-hynix?from=ranking", "company"],
  ["https://www.moneysalary.com/salary-db/naver?utm_source=x", "company"],
  ["https://moneysalary.com/salary-db/kakao/", "company"],
  ["HTTPS://WWW.MONEYSALARY.COM/salary-db/kakao", "company"],
  ["/salary-db/compare", "compare"],
  ["/salary-db/compare/naver-vs-kakao", "compare"],
  ["/salary-db/ranking", "ranking"],
  ["/salary-db/ranking/", "ranking"],
  // 상장사 공시 트리 — 허브·순위형·종목 페이지
  ["/salary-db/listed", "salary-db-hub"],
  ["/salary-db/listed/top-raise", "ranking"],
  ["/salary-db/listed/top-employees/", "ranking"],
  ["/salary-db/listed/industry/semiconductor", "ranking"],
  ["/salary-db/listed/005930", "company"],
  // 계산기 — 삼성 성과급 > 성과급 계산기 > 그 밖의 계산기
  ["/calc/samsung-bonus", "samsung-bonus"],
  ["/calc/samsung-bonus?tab=tai#result", "samsung-bonus"],
  ["/calc/sk-hynix-bonus", "bonus-calc"],
  ["/calc/samsung-display-bonus", "bonus-calc"],
  ["/calc/holiday-bonus/", "bonus-calc"],
  ["/calc/bonus-calculators", "bonus-calc"],
  ["/calc/year-end-bonus-tax", "calc"],
  ["/calc/incentive-tax", "calc"],
  ["/calc", "calc"],
  // 금액·월급·봉급표·표
  ["/salary/50000000", "salary-amount"],
  ["/salary/8000-manwon", "salary-amount"],
  ["https://www.moneysalary.com/salary/42000000#table", "salary-amount"],
  ["/monthly/3000000", "monthly"],
  ["/monthly/2500000/", "monthly"],
  ["/teacher-pay-2026", "pay-table"],
  ["/police-pay-2027", "pay-table"],
  ["/firefighter-pay-2026", "pay-table"],
  ["/civil-servant-pay-2027?grade=9", "pay-table"],
  ["/table/2026/annual", "table"],
  ["/table/2027/monthly#row-300", "table"],
  // 가이드·업종·직업
  ["/guides", "guide"],
  ["/guides/year-end-tax-guide-2026", "guide"],
  ["/industry", "industry"],
  ["/industry/semiconductor", "industry"],
  ["/job", "job-hub"],
  ["/job/", "job-hub"],
  ["/job?cat=it", "job-hub"],
  ["/job/nurse", "job"],
  // 그 밖 — 접두만 비슷한 경로·영문 트리·외부·비경로 값
  ["/jobs", "other"],
  ["/salary-dbx", "other"],
  ["/calculator", "other"],
  ["/tables", "other"],
  ["/guidesx/a", "other"],
  ["/military-pay-2026", "other"],
  ["/year-end-tax", "other"],
  ["/en/salary-db", "other"],
  ["/rss.xml", "other"],
  ["https://example.com/salary-db/naver", "other"],
  ["//evil.example/salary-db/naver", "other"],
  ["#faq", "other"],
  ["?page=2", "other"],
  ["mailto:help@moneysalary.com", "other"],
  ["", "other"],
];

describe("destTemplate(href) — guide_cta_click dest_tpl 버킷", () => {
  it("고정 버킷은 17개이고 중복이 없다", () => {
    expect(DEST_TEMPLATES).toHaveLength(17);
    expect(new Set(DEST_TEMPLATES).size).toBe(17);
  });

  it.each(CASES)("%s → %s", (href, expected) => {
    expect(destTemplate(href)).toBe(expected);
  });

  it("표가 25건 이상이고 모든 결과가 고정 버킷 안에 있으며 17개 버킷을 모두 쓴다", () => {
    expect(CASES.length).toBeGreaterThanOrEqual(25);
    const seen = new Set(CASES.map(([href]) => destTemplate(href)));
    for (const value of seen) expect(DEST_TEMPLATES).toContain(value);
    expect([...seen].sort()).toEqual([...DEST_TEMPLATES].sort());
  });
});

function stubPage(pathname: string) {
  const gtag = vi.fn();
  vi.stubGlobal("window", { gtag, location: { href: `https://www.moneysalary.com${pathname}` } });
  vi.stubGlobal("location", { pathname });
  vi.stubGlobal("document", { referrer: "" });
  return gtag;
}

describe("guide_cta_click 의 dest_tpl 전송", () => {
  it("InternalLinkTracker 경로(trackInternalLinkClick)는 dest_tpl 을 싣는다 — 이벤트명·position 은 그대로", () => {
    const gtag = stubPage("/salary-db");
    trackInternalLinkClick("/salary-db/naver?x=1", "salary-db-hub");
    expect(gtag).toHaveBeenCalledTimes(1);
    const [kind, name, params] = gtag.mock.calls[0];
    expect(kind).toBe("event");
    expect(name).toBe("guide_cta_click");
    expect(params).toMatchObject({
      slug: "/salary-db/naver",
      position: "salary-db-hub",
      page_path: "/salary-db",
      dest_tpl: "company",
    });
  });

  it("직접 호출부는 destTpl 을 넘기지 않으면 종전 payload 그대로(dest_tpl 키 없음)", () => {
    const gtag = stubPage("/guides/some-guide");
    trackGuideCTAClick("/calc/incentive-tax", "related-calc");
    const params = gtag.mock.calls[0][2] as Record<string, unknown>;
    expect(params).not.toHaveProperty("dest_tpl");
    expect(params).toMatchObject({ slug: "/calc/incentive-tax", position: "related-calc" });
  });

  it("직접 호출부가 destTpl 을 넘기면 그 값을 싣는다", () => {
    const gtag = stubPage("/");
    trackGuideCTAClick("/calc/sk-hynix-bonus", "next-action", undefined, "bonus-calc");
    expect(gtag.mock.calls[0][2]).toMatchObject({ dest_tpl: "bonus-calc", page_path: "/" });
  });
});
