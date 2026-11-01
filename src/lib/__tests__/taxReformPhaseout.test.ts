// src/lib/__tests__/taxReformPhaseout.test.ts
//
// YE-06 (B43, 운영자 승인 2026-11-01 8번) — /tax-reform-2026 '공제가 없어지거나 재정지원으로 바뀌는 항목'.
//   1) 섹션은 마지막 광고(HomeTopAd)·공유 버튼보다 아래에만 있고, 광고 위 요소(2부 카드 10개·FAQ 5문항)는 그대로다.
//   2) 두 항목(출산·입양·혼인 세액공제 → 직접 재정지원, 신용카드 대중교통 추가공제 폐지)은 '정부안·국회 통과 전'
//      표기와 확인일을 달고, 출처로 대한민국 정책브리핑 정책뉴스 148969870(2026.8.13)과 재정경제부 상세본을 단다.
//   3) 현행 수치는 정본 상수와 같다 — BIRTH_CREDIT_2026(30/50/70만원)·MARRIAGE_CREDIT_2026(50만원, 2026-12-31)·
//      CARD_RATES_2026(15/30/40%)·CARD_EXTRA_LIMIT_2026(300/200만원). 정부안 수치(추가공제 한도 200/100만원,
//      '27.1.1. 이후 개시 과세기간분)는 재정경제부 「2026년 세제개편안」 상세본 【재정전환】(10) 그대로.
//   4) 상세본 【재정전환】(1)·(2)에는 적용시기 표기가 없다 — 출산·입양·혼인 항목에 정부안 시행 시기를 지어내지 않는다.
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
  MultiplexAd: () => createElement("div", { "data-test-ad": "multiplex" }),
}));
vi.mock("@/components/CoupangBanner", () => ({
  default: () => createElement("div", { "data-test-ad": "coupang" }),
}));
vi.mock("@/components/RelatedCalculators", () => ({
  default: () => createElement("div", { "data-test": "related" }),
}));
vi.mock("@/components/ShareButtons", () => ({
  default: () => createElement("div", { "data-test": "share" }),
}));

import TaxReform2026Page from "@/app/tax-reform-2026/page";
import { CARD_EXTRA_LIMIT_2026, CARD_RATES_2026 } from "@/lib/cardDeduction2026";
import { formatManwonKorean } from "@/lib/manwonFormat";
import { BIRTH_CREDIT_2026, MARRIAGE_CREDIT_2026 } from "@/lib/taxConstants2026";

const man = (won: number) => formatManwonKorean(won / 10_000);
const pct = (rate: number) => `${Math.round(rate * 100)}%`;
const decode = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const TITLE_FAMILY = "출산·입양, 혼인 세액공제 → 직접 재정지원으로 전환";
const TITLE_TRANSIT = "신용카드 대중교통 추가공제(40%) 폐지";
const KOREA_KR = "https://www.korea.kr/news/policyNewsView.do?newsId=148969870";

const raw = renderToStaticMarkup(createElement(TaxReform2026Page));
const html = decode(raw);
const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
const adAt = [...visible.matchAll(/data-test-ad="([^"]+)"/g)].map((m) => ({ name: m[1], at: m.index ?? -1 }));
const lastAd = Math.max(...adAt.map((a) => a.at));
const sectionAt = visible.indexOf('id="reform-phaseout-heading"');
const section = visible.slice(sectionAt);
const above = visible.slice(0, lastAd);

describe("/tax-reform-2026 — 축소·전환 항목은 마지막 광고 아래에만", () => {
  it("마지막 광고는 HomeTopAd 이고, 섹션은 그 광고와 공유 버튼보다 아래다", () => {
    expect(adAt.map((a) => a.name)).toEqual(["result", "in-article", "guide", "coupang", "multiplex", "home-top"]);
    expect(adAt.at(-1)?.name).toBe("home-top");
    expect(sectionAt).toBeGreaterThan(lastAd);
    expect(visible.indexOf('data-test="share"')).toBeLessThan(sectionAt);
    expect(visible.indexOf('data-test="related"')).toBeLessThan(sectionAt);
  });

  it("광고 위에는 새 문구·출처가 없고, 광고 위 카드(국회 통과 필요 10개)·FAQ(5문항)는 그대로다", () => {
    for (const s of [TITLE_FAMILY, TITLE_TRANSIT, "정부안·국회 통과 전", "148969870", "reform-phaseout"]) {
      expect(above).not.toContain(s);
    }
    expect(above.split("· 국회 통과 필요")).toHaveLength(11);
    expect(section).not.toContain("· 국회 통과 필요");
    expect((above.match(/<details/g) ?? []).length).toBe(5);
    expect(section).not.toContain("<details");
  });

  it("두 항목 모두 '정부안·국회 통과 전' 표기를 달고, 확인일을 날짜로 보여 준다", () => {
    expect(section).toContain(`<h3 class="font-bold text-navy text-base mb-2">${TITLE_FAMILY}</h3>`);
    expect(section).toContain(`<h3 class="font-bold text-navy text-base mb-2">${TITLE_TRANSIT}</h3>`);
    expect(section.split("가족 · 정부안·국회 통과 전")).toHaveLength(2);
    expect(section.split("연말정산 · 정부안·국회 통과 전")).toHaveLength(2);
    expect(section).toContain('<time dateTime="2026-11-01">2026년 11월 1일</time> 확인 기준 아직 국회');
    expect(section).toContain("내용이나 시행 시기가 달라질 수 있습니다");
  });

  it("출처 — 정책브리핑 148969870(2026.8.13)·재정경제부 상세본(2026.8.3) 링크가 섹션 안에 있다", () => {
    expect(section).toContain(`href="${KOREA_KR}"`);
    expect(section).toContain("대한민국 정책브리핑 「청년·서민 세 부담 낮추고 지방 지원 늘린다…세제개편안 살펴보니」 (2026.8.13)");
    expect(section).toContain("searchNttId1=MOSF_000000000078809");
    expect(section).toContain("재정경제부 「2026년 세제개편안」 상세본 (2026.8.3)");
  });
});

describe("/tax-reform-2026 축소·전환 항목 — 현행 수치는 정본 상수, 정부안 수치는 상세본 그대로", () => {
  it("출산·입양·혼인 — 현행 30/50/70만원·혼인 1명당 50만원(2026-12-31 혼인신고분까지), 시행 시기는 지어내지 않는다", () => {
    expect([BIRTH_CREDIT_2026.FIRST, BIRTH_CREDIT_2026.SECOND, BIRTH_CREDIT_2026.THIRD_PLUS]).toEqual([
      300_000, 500_000, 700_000,
    ]);
    expect(section).toContain(
      `출산·입양 세액공제(첫째 ${man(BIRTH_CREDIT_2026.FIRST)}, 둘째 ${man(BIRTH_CREDIT_2026.SECOND)}, 셋째 이상 ${man(BIRTH_CREDIT_2026.THIRD_PLUS)})는 적용을 끝내고`
    );
    expect(MARRIAGE_CREDIT_2026.REGISTERED_UNTIL).toBe("2026-12-31");
    expect(section).toContain(
      `혼인세액공제(혼인신고한 해에 1명당 ${man(MARRIAGE_CREDIT_2026.AMOUNT)}, 생애 1회)는 2026년 12월 31일 혼인신고분까지인 적용기한을 연장하지 않습니다`
    );
    // 현행법 적용(2026년 귀속) — 정부안 시행 시기 문구는 없다
    expect(section).toContain(
      "현행법상 2026년에 출산·입양하거나 혼인신고(12월 31일까지)했다면 2027년 1~2월 연말정산(2026년 귀속)에서 그대로 공제받습니다"
    );
    const familyCard = section.slice(section.indexOf(TITLE_FAMILY), section.indexOf(TITLE_TRANSIT));
    expect(familyCard).not.toMatch(/2027년부터|2027년 1월 1일|2027년 사용분/);
  });

  it("대중교통 — 현행 15/30/40%·추가공제 한도 300/200만원 → 정부안 200/100만원, 2027년 사용분부터", () => {
    expect([CARD_RATES_2026.CREDIT, CARD_RATES_2026.CHECK_CASH, CARD_RATES_2026.TRANSIT]).toEqual([0.15, 0.3, 0.4]);
    expect(section).toContain(
      `대중교통 사용분에 주던 ${pct(CARD_RATES_2026.TRANSIT)} 공제율을 없애고 결제수단별 기본공제율(신용카드 ${pct(CARD_RATES_2026.CREDIT)}, 체크카드·현금영수증 ${pct(CARD_RATES_2026.CHECK_CASH)})로 일원화합니다`
    );
    expect(section).toContain(
      `추가공제 한도는 총급여 7천만원 이하 ${man(CARD_EXTRA_LIMIT_2026.LOW_SALARY).replace("원", "")}→200만원, 초과 ${man(CARD_EXTRA_LIMIT_2026.HIGH_SALARY).replace("원", "")}→100만원으로 낮아지고`
    );
    expect(section).toContain("도서·공연·체육시설 등 30% 공제의 총급여 7천만원 이하 요건은 없어집니다");
    expect(section).toContain("국회를 통과하면 2027년 사용분부터 적용되며, 2026년 사용분에는 현행 40%가 그대로 적용됩니다");
  });

  it("FAQPage JSON-LD 는 기존 5문항 그대로 (새 섹션은 FAQ 가 아니다)", () => {
    const faq = [...raw.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .flatMap((m) => {
        const parsed = JSON.parse(m[1]) as unknown;
        return (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
      })
      .filter((d) => d["@type"] === "FAQPage");
    expect(faq).toHaveLength(1);
    expect((faq[0].mainEntity as unknown[]).length).toBe(5);
  });

  it("page.tsx 소스에서도 모든 광고 태그가 새 섹션보다 앞에 있다", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/tax-reform-2026/page.tsx"), "utf8");
    const at = src.indexOf('id="reform-phaseout-heading"');
    expect(at).toBeGreaterThan(-1);
    const adTags = [...src.matchAll(/<(HomeTopAd|InArticleAd|CalcResultAd|GuideMidAd|MultiplexAd|Display2Ad|CoupangBanner|OfferSlot)\b/g)];
    expect(adTags.length).toBe(6);
    for (const m of adTags) expect(m.index ?? Infinity).toBeLessThan(at);
  });
});
