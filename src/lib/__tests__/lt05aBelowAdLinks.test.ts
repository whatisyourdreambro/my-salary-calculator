// src/lib/__tests__/lt05aBelowAdLinks.test.ts
//
// RL-05 (2026-11-02, 10월 bc95e36b 의 LT-05 A 부분만 재반영) — 같은 주제 링크는 페이지의 마지막 광고 아래에만 붙는다.
//   1) /health-insurance-fee-2026: 함께 보면 좋은 계산기 카드 그리드(마지막 광고 GuideMidAd 아래)에 /health-checkup-2026 카드 1개.
//   2) 가이드 보강(guides/layout.tsx 에서 PageFooterAds 아래에만 렌더): public-company-salary-ranking-2026 → 발전 공기업 5사 비교,
//      basic-pension-65-2026 → 기초연금 계산기. 링크 대상과 출발 가이드는 모두 URL 원장에 있는 기존 주소(새 URL 0).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { guideSupplements } from "@/lib/guides/supplements";

const read = (p: string) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const AD_TAG_RE = /<(HomeTopAd|InArticleAd|CalcResultAd|GuideMidAd|MultiplexAd|Display2Ad|CoupangBanner|PageFooterAds)\b/g;
const urlLedger = read("scripts/url-ledger.snapshot.json");

describe("/health-insurance-fee-2026 — 건강검진 카드는 마지막 광고 아래 카드 그리드에", () => {
  const page = read("src/app/health-insurance-fee-2026/page.tsx");
  const adAt = [...page.matchAll(AD_TAG_RE)].map((m) => m.index ?? -1);
  const lastAd = Math.max(...adAt);
  const card = page.indexOf('href="/health-checkup-2026"');

  it("카드는 1개이고 모든 광고 태그보다 아래다 (마지막 광고 = GuideMidAd)", () => {
    expect(adAt.length).toBeGreaterThanOrEqual(5);
    expect(page.split('href="/health-checkup-2026"').length - 1).toBe(1);
    expect(page.slice(lastAd).startsWith("<GuideMidAd")).toBe(true);
    expect(card).toBeGreaterThan(lastAd);
  });

  it("함께 보면 좋은 계산기 그리드 안에 있고 문구는 대상 페이지(대상·항목·비용·예약)와 맞다", () => {
    const grid = page.indexOf("함께 보면 좋은 계산기</h2>");
    expect(grid).toBeGreaterThan(lastAd);
    expect(card).toBeGreaterThan(grid);
    const cardBlock = page.slice(card, page.indexOf("</Link>", card));
    expect(cardBlock).toContain("건강검진 2026");
    expect(cardBlock).toContain("대상·항목·비용·예약");
    expect(read("src/app/health-checkup-2026/page.tsx")).toContain("건강검진 2026 — 대상·항목·비용·예약 종합");
    expect(urlLedger).toContain('"/health-checkup-2026"');
  });
});

describe("가이드 보강 2항목 (LT-05 A (h)(g)) — PageFooterAds 아래, 링크 1줄씩", () => {
  it("guides/layout.tsx 는 GuideSupplement 를 PageFooterAds 뒤에 둔다", () => {
    const layout = read("src/app/guides/layout.tsx");
    const ads = layout.indexOf("<PageFooterAds");
    expect(ads).toBeGreaterThan(0);
    expect(layout.indexOf("<GuideSupplement")).toBeGreaterThan(ads);
  });

  it.each([
    ["public-company-salary-ranking-2026", "/guides/power-company-salary-2026", "발전 공기업 5사 연봉 비교"],
    ["basic-pension-65-2026", "/basic-pension-2026", "기초연금 계산기 2026"],
  ])("%s → %s", (slug, href, label) => {
    const html = guideSupplements[slug];
    expect(html, slug).toBeDefined();
    expect(html).toContain(`<a href="${href}">${label}</a>`);
    // 링크 1줄 — 모든 가이드 RSC 에 실리는 맵이라 짧게(guidesLayoutPayload), 본문 FAQ·표·H2 패턴 없음
    expect(Buffer.byteLength(html)).toBeLessThan(400);
    expect(html).not.toMatch(/<h2|<table|<li/);
    expect(urlLedger).toContain(`"${href}"`);
    expect(urlLedger).toContain(`"/guides/${slug}"`);
  });
});
