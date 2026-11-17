// R4 CONTENT2 (2026-11-18) N2-app-pages-20 / app-pages-b05-F01 — 개인정보 처리방침에 링크프라이스.
// 운영자 승인(2026-11-17 '권장대로', owner-questions-raw.md app-pages 1번): 지금 운영 중인 링크프라이스 제휴
// (NICE지키미·올크레딧 카드, offers.json network 'linkprice')를 이용약관(/terms 제7조)과 같게 처리방침에도 적는다.
// 한국어 /privacy 에는 광고 컴포넌트가 없어(페이지가 광고를 import 하지 않음) 광고 위치는 그대로다.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PrivacyPage from "@/app/privacy/page";

const SRC = readFileSync(join(process.cwd(), "src/app/privacy/page.tsx"), "utf8");

describe("N2-app-pages-20 /privacy — 링크프라이스 고지", () => {
  const html = renderToStaticMarkup(createElement(PrivacyPage));

  it("names 링크프라이스 in the cookie, affiliate-tracking and third-party sections", () => {
    expect(html).toContain("• 광고/분석/제휴 쿠키 — Google AdSense, Google Analytics 4, 쿠팡 파트너스, 링크프라이스(금융 제휴 링크를 누른 경우)가 제공하는 쿠키");
    expect(html).toContain("• 제휴 마케팅 추적 (쿠팡 파트너스·링크프라이스 — ");
    expect(html).toContain("• 링크프라이스 — (주)링크프라이스 (https://www.linkprice.com). 금융 제휴 링크를 누른 경우에만 클릭과 성과 확인에 쓰입니다.");
    expect(html.split("링크프라이스").length - 1).toBeGreaterThanOrEqual(3);
  });

  it("matches the terms page, which already discloses 링크프라이스", () => {
    const terms = readFileSync(join(process.cwd(), "src/app/terms/page.tsx"), "utf8");
    expect(terms).toContain("링크프라이스");
  });

  it("the 최종 업데이트 date is a real past day, not in the future", () => {
    const m = SRC.match(/최종 업데이트: (\d{4})년 (\d{1,2})월 (\d{1,2})일/);
    expect(m).not.toBeNull();
    const day = new Date(`${m![1]}-${m![2].padStart(2, "0")}-${m![3].padStart(2, "0")}T00:00:00+09:00`);
    expect(day.getTime()).toBeLessThanOrEqual(Date.now());
    expect(day.getTime()).toBeGreaterThanOrEqual(new Date("2026-11-18T00:00:00+09:00").getTime());
  });

  it("the Korean policy page renders no ad component", () => {
    expect(SRC).not.toMatch(/AdPlacement|PageFooterAds|CoupangBanner|OfferSlot/);
  });
});
