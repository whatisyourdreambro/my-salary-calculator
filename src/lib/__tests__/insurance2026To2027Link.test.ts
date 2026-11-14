// /social-insurance-rates-2026 → /social-insurance-rates-2027 본문 링크 (2026-11-13 lens-links missed, 운영자 질문 2 승인).
// 링크 문장은 페이지 마지막 광고(HomeTopAd) 아래에만 있어야 한다 — 광고 위 높이 불변.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const src = readFileSync("src/app/social-insurance-rates-2026/page.tsx", "utf8");

describe("/social-insurance-rates-2026 의 2027 요율표 링크", () => {
  it("2027 요율표·국민연금 인상 계산기 링크가 마지막 광고 뒤에 한 번씩 있다", () => {
    const lastAd = Math.max(
      ...["<HomeTopAd", "<GuideMidAd", "<InArticleAd", "<CoupangBanner"].map((tag) => src.lastIndexOf(tag)),
    );
    expect(src.lastIndexOf("<HomeTopAd")).toBe(lastAd);
    for (const href of ['href="/social-insurance-rates-2027"', 'href="/calc/pension-hike-2027"']) {
      expect(src.split(href).length - 1, href).toBe(1);
      expect(src.indexOf(href), href).toBeGreaterThan(lastAd);
    }
  });
});
