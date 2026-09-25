// /property-holding-tax-2026 납부기간 자동 선택 회귀 테스트 (2026-09-25 B6 DATE-15)
//
// 배경: 9월분 재산세 납기(9/16~9/30)가 description·배지·헤더에 날짜 게이트 없이 박혀 있어
// 10/1 부터 지난 기한을 광고할 상태였다. 이제 src/lib/propertyTaxPeriod.ts 의 순수 함수가
// 빌드 시점 KST 날짜로 고른다.
//   1) 경계 — KST 자정 기준(9/30 23:59 SEPT · 10/1 00:00 비시즌 · 11/25 종부세 · 12/16 비시즌),
//      UTC 로 넘어온 시각도 +9h 로 판정(머신 타임존 무관).
//   2) 광고 위 문구 — 배지·헤더 문장은 HomeTopAd 위라 SEPT 기준 길이를 넘기지 않는다.
//   3) 페이지 배선 — 시스템 시각을 고정하고 page.tsx 를 새로 평가해 메타·헤더가 기간을 따른다.
//   4) 본문 9월분 시즌 섹션(CalcResultAd 아래·GuideMidAd 위)의 시점 문장 — 10/1(KST)부터 과거형(PAST),
//      9/30 까지는 종전 문구 그대로(DUE). GuideMidAd 위라 PAST 는 DUE 보다 길지 않다.
import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PERIOD_COMPREHENSIVE,
  PERIOD_OFFSEASON,
  PERIOD_SEPT,
  PROPERTY_TAX_PERIOD_BOUNDARIES,
  PROPERTY_TAX_PERIODS,
  SEPT_SECTION_COPY,
  pickPropertyTaxPeriod,
  pickPropertyTaxPeriodKey,
  propertyTaxMetaDescription,
  septSectionCopy,
  septSectionPhase,
  type PropertyTaxPeriodKey,
  type SeptSectionCopy,
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

describe("본문 9월분 시즌 섹션 문구 — 납기 전 DUE / 후 PAST", () => {
  it.each(CASES)("%s → 키 %s 의 섹션 단계", (_label, iso, key) => {
    const phase = septSectionPhase(pickPropertyTaxPeriodKey(new Date(iso)));
    expect(phase).toBe(key === "JULY" || key === "SEPT" ? "DUE" : "PAST");
    expect(septSectionCopy(key).phase).toBe(phase);
  });

  it("9/30 23:59 KST 까지 DUE, 10/1 00:00 KST 부터 PAST (UTC 경계 포함)", () => {
    const at = (iso: string) => septSectionCopy(pickPropertyTaxPeriodKey(new Date(iso))).phase;
    expect(at("2026-09-30T23:59:59+09:00")).toBe("DUE");
    expect(at("2026-09-30T14:59:59Z")).toBe("DUE");
    expect(at("2026-10-01T00:00:00+09:00")).toBe("PAST");
    expect(at("2026-09-30T15:00:00Z")).toBe("PAST");
  });

  it("PAST 문구는 다가오는 9월 기한·'이번' 을 말하지 않는다", () => {
    const text = Object.values(SEPT_SECTION_COPY.PAST).join("\n");
    for (const stale of ["이번", "9월분과 함께", "오고", "안내되어 있습니다", "까지 납부", "기한 내 납부"]) {
      expect(text, stale).not.toContain(stale);
    }
    expect(SEPT_SECTION_COPY.PAST.afterRange.startsWith("이었습니다.")).toBe(true);
    expect(SEPT_SECTION_COPY.PAST.missedHeading).toContain("7·9월분");
    expect(SEPT_SECTION_COPY.PAST.cardNotice.endsWith("안내됐습니다")).toBe(true);
  });

  it("GuideMidAd 위 — PAST 각 문구는 같은 자리의 DUE 문구보다 길지 않다", () => {
    const fields: (keyof Omit<SeptSectionCopy, "phase">)[] = [
      "afterRange",
      "afterScope",
      "lateClosing",
      "missedHeading",
      "missedLead",
      "cardNotice",
    ];
    for (const f of fields) {
      expect(SEPT_SECTION_COPY.PAST[f].length, f).toBeLessThanOrEqual(SEPT_SECTION_COPY.DUE[f].length);
    }
  });

  it("두 단계 모두 기존 수치(가산세 3%·납기 문구)를 새로 만들지 않는다 — 숫자 토큰은 DUE 의 부분집합", () => {
    const nums = (c: SeptSectionCopy) => new Set(Object.values(c).join(" ").match(/\d[\d,./~]*/g) ?? []);
    const due = nums(SEPT_SECTION_COPY.DUE);
    for (const n of nums(SEPT_SECTION_COPY.PAST)) expect(due, n).toContain(n);
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
    // 본문 9월분 시즌 섹션 — CalcResultAd 와 GuideMidAd 사이 (태그 제거 텍스트)
    const septSectionHtml = visible.slice(
      visible.indexOf('data-test-ad="result"'),
      visible.indexOf('data-test-ad="guide"'),
    );
    const septSectionText = septSectionHtml.replace(/<[^>]+>/g, "");
    return { metadata: mod.metadata, html, visible, aboveAd, septSectionText };
  }

  it("9/25 빌드 — 본문 9월분 섹션·FAQ 는 종전 문구 그대로(DUE)", async () => {
    const { visible, septSectionText, html } = await loadAt("2026-09-25T12:00:00+09:00");
    expect(septSectionText).toContain(
      "2026년 9월분(2기분) 재산세 납부기간은 9월 16일~9월 30일입니다. 이번 9월분 대상은 주택분 나머지 1/2 + 토지분입니다. 7월에 주택분 1/2을 냈다면 이번에 나머지 1/2 고지서가 오고,",
    );
    expect(septSectionText).toContain("3%만 부과됩니다. 하루 차이로 세금의 3%가 더 나가는 구조이므로, 기한 내 납부가 가장 확실한 절세입니다.");
    expect(septSectionText).toContain("7월분(1기분)을 놓쳤다면 — 밀린 세금부터 확인");
    expect(septSectionText).toContain("미납 내역을 조회해 9월분과 함께 정리하는 것이 좋습니다. 미납 세액이 45만원 이상이면");
    expect(septSectionText).toContain(
      "다른 점). 9월분 납부 기준으로 서울시 이택스에는 BC카드 무이자(부분무이자) 할부가 9/30까지, NH농협은 연중 적용으로 안내되어 있습니다. 캐시백·",
    );
    // FAQ 카드 답변(본문·FAQPage JSON-LD) — 종전 문장 그대로
    const faqCard =
      "2026년 9월분 납부 기준으로 서울시 이택스에는 BC카드 무이자(부분무이자) 할부가 9/30까지, NH농협은 연중 적용으로 안내되어 있습니다(7월에 진행된 우리·현대·삼성·롯데·KB국민 이벤트는 종료).";
    expect(visible).toContain(faqCard);
    expect(html.split(faqCard).length - 1).toBe(2);
  });

  it.each([
    ["2026-09-30T15:30:00Z", "OFFSEASON"],
    ["2026-11-25T00:00:00+09:00", "COMPREHENSIVE"],
    ["2026-12-16T00:00:00+09:00", "OFFSEASON"],
  ] as const)("%s(%s) — 본문 9월분 섹션은 지난 기록(PAST), 다가오는 9월 기한을 말하지 않는다", async (iso, key) => {
    expect(pickPropertyTaxPeriodKey(new Date(iso))).toBe(key);
    expect(septSectionPhase(key)).toBe("PAST");
    const due = (await loadAt("2026-09-25T12:00:00+09:00")).septSectionText;
    vi.useRealTimers();
    const { visible, septSectionText, html } = await loadAt(iso);
    // 제목은 사실 라벨이라 그대로
    expect(septSectionText).toContain("2026년 9월분 재산세 — 9월 16일~9월 30일 납부");
    expect(septSectionText).toContain("납부기간은 9월 16일~9월 30일이었습니다. 9월분 대상은 주택분 나머지 1/2 + 토지분으로,");
    expect(septSectionText).toContain("7·9월분을 놓쳤다면 — 밀린 세금부터 확인");
    expect(septSectionText).toContain("미납 내역을 조회해 한꺼번에 정리하는 것이 좋습니다. 미납 세액이 45만원 이상이면");
    for (const stale of ["이번", "9월분과 함께", "고지서가 오고", "안내되어 있습니다", "기한 내 납부가 가장 확실한 절세"]) {
      expect(septSectionText, stale).not.toContain(stale);
    }
    // FAQ 카드 문장도 과거형 (본문 + JSON-LD 2곳)
    const faqCard =
      "2026년 9월분 납부 때 서울시 이택스에는 BC카드 무이자(부분무이자) 할부가 9/30까지, NH농협은 연중 적용으로 안내됐습니다(7월에 진행된 우리·현대·삼성·롯데·KB국민 이벤트는 종료).";
    expect(visible).toContain(faqCard);
    expect(html.split(faqCard).length - 1).toBe(2);
    expect(html).not.toContain("안내되어 있습니다(7월에");
    // GuideMidAd 위 — 렌더 텍스트가 DUE(9/25 빌드)보다 길지 않다
    expect(septSectionText.length).toBeLessThanOrEqual(due.length);
  });

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
