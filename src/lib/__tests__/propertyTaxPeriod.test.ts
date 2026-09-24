// /property-holding-tax-2026 납부기간 자동 선택 회귀 테스트 (2026-09-25 B6 DATE-15)
//
// 배경: 9월분 재산세 납기(9/16~9/30)가 description·배지·헤더에 날짜 게이트 없이 박혀 있어
// 10/1 부터 지난 기한을 광고할 상태였다. 이제 src/lib/propertyTaxPeriod.ts 의 순수 함수가
// 빌드 시점 KST 날짜로 고른다.
//   1) 경계 — KST 자정 기준(9/30 23:59 SEPT · 10/1 00:00 비시즌 · 11/25 종부세 · 12/16 비시즌),
//      UTC 로 넘어온 시각도 +9h 로 판정(머신 타임존 무관).
//   2) 광고 위 문구 — 배지·헤더 문장은 HomeTopAd 위라 SEPT 기준 길이를 넘기지 않는다.
//   3) 페이지 배선 — 시스템 시각을 고정하고 page.tsx 를 새로 평가해 메타·헤더가 기간을 따른다.
import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PERIOD_COMPREHENSIVE,
  PERIOD_OFFSEASON,
  PERIOD_SEPT,
  PROPERTY_TAX_PERIOD_BOUNDARIES,
  PROPERTY_TAX_PERIODS,
  pickPropertyTaxPeriod,
  pickPropertyTaxPeriodKey,
  propertyTaxMetaDescription,
  type PropertyTaxPeriodKey,
} from "@/lib/propertyTaxPeriod";

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => createElement("div", { "data-test-ad": "home-top" }),
  InArticleAd: () => createElement("div", { "data-test-ad": "in-article" }),
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
  GuideMidAd: () => createElement("div", { "data-test-ad": "guide" }),
  MultiplexAd: () => createElement("div", { "data-test-ad": "multiplex" }),
}));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/ShareButtons", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/app/property-holding-tax-2026/PropertyHoldingTaxClient", () => ({ default: () => null }));

// [라벨, ISO 시각, 기대 키]
const CASES: [string, string, PropertyTaxPeriodKey][] = [
  ["7/31 23:59 KST — 7월분 납기 마지막 분", "2026-07-31T23:59:00+09:00", "JULY"],
  ["8/1 00:00 KST — 9월분 예고로 전환", "2026-08-01T00:00:00+09:00", "SEPT"],
  ["9/25 12:00 KST — 오늘(배포일)", "2026-09-25T12:00:00+09:00", "SEPT"],
  ["9/26 00:10 KST — SEASON_KEY 는 OCT 로 넘어가도 9월분 유지", "2026-09-26T00:10:00+09:00", "SEPT"],
  ["9/30 23:59 KST — 9월분 납기 마지막 분", "2026-09-30T23:59:00+09:00", "SEPT"],
  ["10/1 00:00 KST — 비시즌", "2026-10-01T00:00:00+09:00", "OFFSEASON"],
  ["UTC 9/30 14:59:59 = KST 9/30 23:59:59", "2026-09-30T14:59:59Z", "SEPT"],
  ["UTC 9/30 15:30 = KST 10/1 00:30", "2026-09-30T15:30:00Z", "OFFSEASON"],
  ["11/24 23:59:59 KST — 종부세 고지 전", "2026-11-24T23:59:59+09:00", "OFFSEASON"],
  ["11/25 00:00 KST — 종부세 시즌", "2026-11-25T00:00:00+09:00", "COMPREHENSIVE"],
  ["12/15 23:59:59 KST — 종부세 납기 마지막 초", "2026-12-15T23:59:59+09:00", "COMPREHENSIVE"],
  ["12/16 00:00 KST — 비시즌", "2026-12-16T00:00:00+09:00", "OFFSEASON"],
  ["UTC 12/15 15:00 = KST 12/16 00:00", "2026-12-15T15:00:00Z", "OFFSEASON"],
  ["2027 7월 — 2027 날짜표 전까지 중립 문구", "2027-07-20T12:00:00+09:00", "OFFSEASON"],
];

describe("pickPropertyTaxPeriodKey — KST 경계", () => {
  it.each(CASES)("%s → %s", (_label, iso, key) => {
    expect(pickPropertyTaxPeriodKey(new Date(iso))).toBe(key);
    expect(pickPropertyTaxPeriod(new Date(iso)).key).toBe(key);
  });

  it("파싱 불가 날짜는 중립(OFFSEASON)", () => {
    expect(pickPropertyTaxPeriodKey(new Date("not-a-date"))).toBe("OFFSEASON");
  });

  it("경계표는 오름차순이다", () => {
    const ts = PROPERTY_TAX_PERIOD_BOUNDARIES.map(({ fromKst: [y, m, d] }) => Date.UTC(y, m - 1, d));
    expect([...ts].sort((a, b) => a - b)).toEqual(ts);
  });

  it("10/1(KST) 이후 매일 — 지난 7·9월분 기한을 다시 고르지 않는다", () => {
    const start = Date.parse("2026-10-01T00:00:00+09:00");
    for (let i = 0; i < 460; i++) {
      const t = new Date(start + i * 86_400_000 + 12 * 3_600_000);
      expect(["OFFSEASON", "COMPREHENSIVE"], t.toISOString()).toContain(pickPropertyTaxPeriodKey(t));
    }
  });
});

describe("기간별 문구 — 사실관계·광고 위 길이", () => {
  it("9월분 문구는 종전 하드코딩과 같다 (오늘 빌드 출력 불변)", () => {
    expect(PERIOD_SEPT.badge).toBe("9월분(2기분) 재산세 납부기간 9/16~9/30");
    expect(PERIOD_SEPT.headerCta).toBe(
      "9월분(2기분) 재산세 고지서를 받았다면 계산기로 내 세액 수준을 확인하고, 9월 30일까지 위택스·이택스에서 납부하세요.",
    );
    expect(PERIOD_SEPT.faqDeadline).toBe(
      "2026년 9월분(2기분) 재산세 기한은 9월 30일이므로 하루라도 늦지 않게 납부하는 것이 좋습니다.",
    );
  });

  it("비시즌·종부세 문구에는 지난 9월분 기한이 '현재 납부기간'으로 남지 않는다", () => {
    for (const p of [PERIOD_OFFSEASON, PERIOD_COMPREHENSIVE]) {
      const all = [p.badge, p.metaLead, p.headerCta, propertyTaxMetaDescription(p)].join(" ");
      expect(all, p.key).not.toContain("9/16~9/30");
      expect(all, p.key).not.toContain("9월 30일까지");
      expect(all, p.key).not.toContain("9월분(2기분) 재산세 납부기간");
    }
  });

  it("비시즌은 재산세 7·9월 / 종부세 12월 1~15일 중립 문구", () => {
    expect(PERIOD_OFFSEASON.badge).toBe("재산세 7·9월 / 종부세 12월 1~15일");
    expect(PERIOD_OFFSEASON.metaLead).toContain("종부세 12월 1~15일");
  });

  it("종부세 시즌은 12/1~12/15 (국세청 매년 12.1.~12.15.)", () => {
    expect(PERIOD_COMPREHENSIVE.badge).toContain("12/1~12/15");
    expect(PERIOD_COMPREHENSIVE.metaLead).toContain("12/1~12/15");
    expect(PERIOD_COMPREHENSIVE.headerCta).toContain("12월 15일까지");
    expect(PERIOD_COMPREHENSIVE.faqDeadline).toContain("12월 15일");
  });

  it("HomeTopAd 위 배지·헤더 문장은 9월분 기준 길이를 넘지 않는다", () => {
    for (const p of [PERIOD_OFFSEASON, PERIOD_COMPREHENSIVE]) {
      expect(p.badge.length, `${p.key} badge`).toBeLessThanOrEqual(PERIOD_SEPT.badge.length);
      expect(p.headerCta.length, `${p.key} headerCta`).toBeLessThanOrEqual(PERIOD_SEPT.headerCta.length);
    }
  });

  it("description 은 모든 기간에서 80~120자", () => {
    for (const p of Object.values(PROPERTY_TAX_PERIODS)) {
      const len = propertyTaxMetaDescription(p).length;
      expect(len, p.key).toBeGreaterThanOrEqual(80);
      expect(len, p.key).toBeLessThanOrEqual(120);
    }
  });
});

describe("page.tsx 배선 — 빌드 시각별 메타·헤더", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  async function loadAt(iso: string) {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(iso));
    vi.resetModules();
    const mod = await import("@/app/property-holding-tax-2026/page");
    const html = renderToStaticMarkup(createElement(mod.default));
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    const aboveAd = visible.slice(0, visible.indexOf('data-test-ad="home-top"'));
    return { metadata: mod.metadata, visible, aboveAd };
  }

  it.each([
    ["2026-09-25T12:00:00+09:00", PERIOD_SEPT],
    ["2026-09-30T15:30:00Z", PERIOD_OFFSEASON],
    ["2026-11-25T00:00:00+09:00", PERIOD_COMPREHENSIVE],
    ["2026-12-16T00:00:00+09:00", PERIOD_OFFSEASON],
  ] as const)("%s → %s", async (iso, period) => {
    const { metadata, visible, aboveAd } = await loadAt(iso);
    const description = propertyTaxMetaDescription(period);
    expect(metadata.description).toBe(description);
    expect(metadata.openGraph?.description).toBe(description);
    expect(aboveAd).toContain(period.badge);
    expect(aboveAd).toContain(period.headerCta);
    expect(visible).toContain(period.faqDeadline);
    if (period.key !== "SEPT") expect(aboveAd).not.toContain("9/16~9/30");
  });
});
