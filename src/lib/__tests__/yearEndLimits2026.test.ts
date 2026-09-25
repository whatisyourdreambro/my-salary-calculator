// src/lib/__tests__/yearEndLimits2026.test.ts
//
// /year-end-tax '2026년 귀속 연말정산 주요 공제 한도' 표 + 한도 FAQ 5문항 회귀 가드 (2026-09-25).
//   1) 표·FAQ 수치가 정본 상수(카드·연금·월세·의료비·교육비·기부금)와 같고, 엔진 동작과도 맞는다.
//   2) 수치 문자열이 2026년 귀속 현행법 값 그대로다 (조문 확인 2026-09-25 — yearEndLimits2026.ts 머리말).
//   3) FAQPage JSON-LD 는 한 개이며 모든 질문·답변이 화면 본문과 글자 그대로 같다.
//   4) 새 섹션은 마지막 광고(쿠팡 배너)보다 아래 — 광고 위 FAQ 문항 수(4)는 그대로.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => createElement("div", { "data-test-ad": "home-top" }),
  InArticleAd: () => createElement("div", { "data-test-ad": "in-article" }),
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
  GuideMidAd: () => createElement("div", { "data-test-ad": "guide" }),
}));
vi.mock("@/components/CoupangBanner", () => ({
  default: () => createElement("div", { "data-test-ad": "coupang" }),
}));
vi.mock("@/components/affiliate/AffiliateSlot", () => ({ OfferSlot: () => null }));
vi.mock("@/components/YearEndTaxCalculator", () => ({ default: () => null }));
vi.mock("@/components/YearEndTaxCluster", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({
  default: () => createElement("div", { "data-test": "share" }),
}));

import YearEndTaxPage from "@/app/year-end-tax/page";
import { calcCardDeduction2026 } from "@/lib/cardDeduction2026";
import { calculateYearEndTax, type TaxInputs } from "@/lib/yearEndTaxCalculator";
import {
  HOMETOWN_SECOND_BAND_2026,
  YEAR_END_LIMIT_FAQS,
  YEAR_END_LIMIT_ROWS,
  YEAR_END_LIMITS_SOURCE_NOTE,
} from "@/lib/yearEndLimits2026";

const row = (item: string) => {
  const r = YEAR_END_LIMIT_ROWS.find((x) => x.item === item);
  if (!r) throw new Error(`표에 ${item} 행이 없다`);
  return r;
};

describe("공제 한도표 — 2026년 귀속 현행법 수치", () => {
  it("7개 항목을 모두 싣는다", () => {
    expect(YEAR_END_LIMIT_ROWS.map((r) => r.item)).toEqual([
      "신용카드 등 소득공제",
      "신용카드 추가 한도",
      "연금저축·IRP 세액공제",
      "월세 세액공제",
      "의료비 세액공제",
      "교육비 세액공제",
      "기부금 세액공제",
    ]);
  });

  it("신용카드 — 공제율 15/30/40%·문화체육 30%, 기본 한도 자녀 수별 300/350/400만(초과 250/275/300만)", () => {
    const card = row("신용카드 등 소득공제");
    expect(card.rate).toBe(
      "총급여 25% 초과 사용분에 신용카드 15% · 체크카드·현금영수증 30% · 전통시장·대중교통 40% · 도서·공연·체육시설 등 문화체육 30%(총급여 7,000만원 이하)"
    );
    expect(card.limit).toBe(
      "기본 300만원(총급여 7,000만원 초과 250만원) · 자녀 1명 350만원(275만원) · 자녀 2명 이상 400만원(300만원)"
    );
    expect(row("신용카드 추가 한도").limit).toBe("추가 300만원(총급여 7,000만원 초과 200만원)");
  });

  it("신용카드 표의 한도 = 공유 모듈 계산 최대치 (기본 + 추가)", () => {
    const huge = { creditCard: 0, checkCash: 200_000_000, traditionalMarket: 50_000_000, publicTransport: 50_000_000 };
    const cases: [number, number, number][] = [
      // [총급여, 자녀 수, 기대 최대 공제액]
      [50_000_000, 0, 6_000_000],
      [50_000_000, 1, 6_500_000],
      [50_000_000, 2, 7_000_000],
      [50_000_000, 3, 7_000_000], // 셋째부터는 가산 없음
      [90_000_000, 0, 4_500_000],
      [90_000_000, 1, 4_750_000],
      [90_000_000, 2, 5_000_000],
    ];
    for (const [grossSalary, children, max] of cases) {
      expect(calcCardDeduction2026({ grossSalary, children, ...huge }).finalDeduction).toBe(max);
    }
  });

  it("연금계좌 — 5,500만 이하 15%·초과 12%, 연금저축 600만·합산 900만, ISA 전환 10%(최대 300만)", () => {
    const p = row("연금저축·IRP 세액공제");
    expect(p.rate).toBe("총급여 5,500만원 이하 15% · 초과 12% (지방소득세 포함 16.5% · 13.2%)");
    expect(p.limit).toBe("연금저축 600만원 · IRP 합산 900만원 (ISA 만기 전환액의 10%, 최대 300만원 추가)");
  });

  it("연금계좌 — 엔진이 표와 같은 한도·공제율을 쓴다 (경계 5,500만 포함 15%)", () => {
    const base: TaxInputs = {
      grossSalary: 55_000_000, prepaidTax: 0, nationalPension: 0, healthInsurance: 0,
      employmentInsurance: 0, dependents: 1, disabledDependents: 0, seniorDependents: 0,
      housingSubscription: 0, mortgageInterest: 0, creditCard: 0, debitCardAndCash: 0,
      traditionalMarket: 0, publicTransport: 0, children: 0, birthsOrAdoptions: 0,
      pensionSavings: 0, irp: 0, lifeInsurance: 0, medicalExpenses: 0, educationExpenses: 0,
      donation: 0, monthlyRent: 0,
    };
    const credit = (grossSalary: number) =>
      calculateYearEndTax({ ...base, grossSalary }).determinedTax -
      calculateYearEndTax({ ...base, grossSalary, pensionSavings: 12_000_000 }).determinedTax;
    expect(credit(55_000_000)).toBe(1_350_000); // 900만 × 15%
    expect(credit(55_000_001)).toBe(1_080_000); // 900만 × 12%
  });

  it("월세 — 17%/15%, 연 1,000만원, 최대 170만원, 총급여 8,000만원 이하", () => {
    const r = row("월세 세액공제");
    expect(r.rate).toBe("총급여 5,500만원 이하 17% · 8,000만원 이하 15%");
    expect(r.limit).toBe("월세 연 1,000만원(최대 170만원 공제) · 무주택 세대주, 총급여 8,000만원 이하");
  });

  it("의료비·교육비 — 3% 문턱·15/20/30%, 부양가족 700만, 산후조리원 200만 / 300만·900만", () => {
    const m = row("의료비 세액공제");
    expect(m.rate).toBe("총급여 3% 초과분의 15% (미숙아·선천성이상아 20% · 난임시술비 30%)");
    expect(m.limit).toBe("부양가족 연 700만원 · 본인·6세 이하·65세 이상·장애인 등 한도 없음 · 산후조리원 출산 1회 200만원");
    const e = row("교육비 세액공제");
    expect(e.rate).toBe("15%");
    expect(e.limit).toBe(
      "취학 전·초중고 1명당 300만원(2026년부터 초등 2학년 이하 예체능 학원비 포함) · 대학생 900만원 · 본인·장애인 특수교육비 한도 없음"
    );
  });

  it("기부금 — 1,000만 이하 15%·초과 30%, 10만원 100/110, 고향사랑 10만~20만 40%(조특법 §58①2)", () => {
    const d = row("기부금 세액공제");
    expect(d.rate).toBe(
      "특례·일반 1,000만원 이하 15% · 초과분 30% / 정치자금·고향사랑 10만원까지 100/110 (고향사랑 10만원 초과 20만원 이하 40%)"
    );
    expect(d.limit).toBe("일반기부금 근로소득금액의 30%(종교단체 10%) · 고향사랑 연 2,000만원까지");
    // 20만원 기부 시 세액공제 = 10만 × 100/110 + 10만 × 40% (지방세 포함 체감 44%)
    const credit20 = Math.round(100_000 * (100 / 110) + (200_000 - 100_000) * HOMETOWN_SECOND_BAND_2026.RATE);
    expect(credit20).toBe(130_909);
  });

  it("출처 문구 — 조문·기준일·2027 개편안 미반영을 밝힌다", () => {
    expect(YEAR_END_LIMITS_SOURCE_NOTE).toContain("소득세법 제59조의3·제59조의4");
    expect(YEAR_END_LIMITS_SOURCE_NOTE).toContain("조세특례제한법 제58조·제76조·제95조의2·제126조의2");
    expect(YEAR_END_LIMITS_SOURCE_NOTE).toContain("2027년 귀속부터");
    expect(YEAR_END_LIMITS_SOURCE_NOTE).toContain("기준일 2026-09-25");
  });
});

describe("공제 한도 FAQ 5문항", () => {
  it("5문항이고 질문이 서로 다르며 소수점·NaN 없이 만들어진다", () => {
    expect(YEAR_END_LIMIT_FAQS).toHaveLength(5);
    expect(new Set(YEAR_END_LIMIT_FAQS.map((f) => f.question)).size).toBe(5);
    for (const f of YEAR_END_LIMIT_FAQS) {
      expect(f.answer).not.toMatch(/NaN|undefined|\d\.\d{3,}/);
    }
    const all = YEAR_END_LIMIT_FAQS.map((f) => f.answer).join("\n");
    expect(all).toContain("연 300만원(총급여 7,000만원 초과자는 200만원)까지 추가로 공제됩니다");
    expect(all).toContain("연금저축계좌는 연 600만원까지만 공제 대상");
    expect(all).toContain("최대 170만원을 돌려받습니다");
    expect(all).toContain("총급여 5,000만원이라면 150만원을 넘는 금액이 대상");
    expect(all).toContain("대학생은 1명당 연 900만원까지 인정됩니다");
  });
});

// ── 페이지 렌더 ──
function visibleContent(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
}
function decodeEntities(s: string) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}
function structuredItems(html: string): Record<string, unknown>[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1]) as Record<string, unknown>
  );
}

describe("/year-end-tax 페이지 — 한도표·FAQ 배치와 FAQPage JSON-LD", () => {
  const html = renderToStaticMarkup(createElement(YearEndTaxPage));
  const visible = decodeEntities(visibleContent(html));

  it("FAQPage 는 하나이고 모든 문항이 화면 본문과 글자 그대로 같다 (기존 4 + 한도 5)", () => {
    const faqPages = structuredItems(html).filter((d) => d["@type"] === "FAQPage");
    expect(faqPages).toHaveLength(1);
    const entities = faqPages[0].mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    expect(entities).toHaveLength(9);
    expect(entities.slice(4).map((e) => e.name)).toEqual(YEAR_END_LIMIT_FAQS.map((f) => f.question));
    for (const e of entities) {
      expect(visible).toContain(e.name);
      expect(visible).toContain(e.acceptedAnswer.text);
    }
  });

  it("한도표 전 행이 화면에 나온다", () => {
    expect(visible).toContain("2026년 귀속 연말정산 주요 공제 한도");
    for (const r of YEAR_END_LIMIT_ROWS) {
      expect(visible).toContain(r.item);
      expect(visible).toContain(r.rate);
      expect(visible).toContain(r.limit);
    }
    expect(visible).toContain(YEAR_END_LIMITS_SOURCE_NOTE);
  });

  it("새 섹션은 모든 광고(쿠팡 배너 포함)보다 아래이고, 광고 위 FAQ 는 4문항 그대로다", () => {
    const sectionAt = html.indexOf('id="year-end-limits-heading"');
    expect(sectionAt).toBeGreaterThan(-1);
    const adPositions = [...html.matchAll(/data-test-ad="([^"]+)"/g)].map((m) => m.index ?? -1);
    expect(adPositions.length).toBeGreaterThanOrEqual(5);
    expect(Math.max(...adPositions)).toBeLessThan(sectionAt);
    expect(html.indexOf('data-test-ad="coupang"')).toBeLessThan(sectionAt);
    // 공유 섹션 뒤(컨테이너 맨 끝) — 기존 형제 요소 순서 불변
    expect(html.indexOf('data-test="share"')).toBeLessThan(sectionAt);
    const lastAd = Math.max(...adPositions);
    expect((html.slice(0, lastAd).match(/<details/g) ?? []).length).toBe(4);
  });

  it("page.tsx 소스에서도 광고 태그가 새 섹션보다 모두 앞에 있다", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/year-end-tax/page.tsx"), "utf8");
    const sectionAt = src.indexOf("year-end-limits-heading");
    const adTags = [...src.matchAll(/<(HomeTopAd|InArticleAd|CalcResultAd|GuideMidAd|MultiplexAd|Display2Ad|CoupangBanner|OfferSlot)\b/g)];
    expect(adTags.length).toBeGreaterThanOrEqual(6);
    for (const m of adTags) expect(m.index ?? Infinity).toBeLessThan(sectionAt);
  });
});
