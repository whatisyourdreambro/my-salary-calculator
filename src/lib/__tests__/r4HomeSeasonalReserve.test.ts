// R4 HOME — RL-20 (10월 D4-③ 63d0be8a 의 홈 부분 재착륙, 2026-11-18): 홈 시즌 배너 자리를 서버 HTML 에서 미리 잡는다.
//
// 종전: HomeClient 가 SeasonalBanner 를 dynamic(ssr:false)로 불러, 서버 HTML·하이드레이션 직후에는 배너 자리가 비어 있다가
// 청크가 오면 배너 높이(휴대폰 약 104~120px, sm 이상 약 120~140px)만큼 아래 계산기·Display2Ad·GuideMidAd·MultiplexAd 를 밀었다.
// 지금: 서버 HTML·하이드레이션 첫 렌더에 서버 날짜(seed)로 고른 같은 항목을 같은 class·같은 내용의 보이지 않는 상자로 그리고,
// 마운트 뒤 지금 시각으로 종전과 같은 배너를 그린다.
//
// 증명(jsdom·브라우저 없이 renderToStaticMarkup 만):
//  1) 마운트 뒤 최종 마크업 = 종전 컴포넌트의 마크업(아래 legacyBanner 에 종전 코드 그대로) — 1년 366일 바이트 동일.
//  2) 자리 상자 = 같은 날의 실제 배너에서 바깥 링크(a -> div)와 섹션의 aria-hidden·data-cls-reserve·invisible 만 다름.
//  3) 시드는 KST 달력 날짜, 타임존이 달라도 같은 상자(하이드레이션 불일치 0).
//  4) 홈에서 상자는 HomeTopAd 와 계산기 사이 종전 자리(감싸는 div 그대로), 광고 순서·개수 그대로, 상자 안 링크·초점 대상 없음.
//  5) 시드가 없으면 종전처럼 하이드레이션 전에는 아무것도 그리지 않는다.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/dynamic", () => ({ default: () => function DynamicPlaceholder() { return createElement("div", { "data-dynamic-placeholder": true }); } }));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => createElement("aside", { "data-slot-position": "home-top" }),
  Display2Ad: () => createElement("aside", { "data-slot-position": "display2" }),
  GuideMidAd: () => createElement("aside", { "data-slot-position": "guide-mid" }),
  MultiplexAd: () => createElement("aside", { "data-slot-position": "multiplex" }),
}));

import { Calendar, ArrowRight, Clock } from "lucide-react";
import SeasonalBanner, { SEASONAL_CARD_CLASS, SeasonalBannerView } from "@/components/SeasonalBanner";
import HomeClient from "@/app/HomeClient";
import { getCurrentSeasonal, getDaysLeft, seasonalSeedDate, seasonalSeedKst, type SeasonalSeed } from "@/lib/seasonalCalendar";
import { OPI_2026_ANNOUNCEMENT } from "@/data/opiAnnouncement";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

/** 종전(ce2463cda) SeasonalBanner 본문 그대로 — now 만 인자로 받게 했다(종전은 함수 안에서 new Date()). */
function legacyBanner(now: Date, className = "") {
  const seasonal = getCurrentSeasonal(now, { opiAnnounced: OPI_2026_ANNOUNCEMENT.announced });
  if (!seasonal) return null;
  const daysLeft = seasonal.deadline ? getDaysLeft(seasonal.deadline, now) : null;
  const isUrgent = daysLeft !== null && daysLeft <= 20;
  const h = createElement;
  return h("section", { className: `px-4 sm:px-6 lg:px-8 ${className}` },
    h("a", { href: seasonal.href, className: "group flex items-center justify-between gap-4 max-w-5xl mx-auto p-5 sm:p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors" },
      h("div", { className: "flex items-start gap-4 min-w-0" },
        h("div", { className: "flex-shrink-0 w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center" }, h(Calendar, { className: "w-6 h-6" })),
        h("div", { className: "min-w-0" },
          h("p", { className: "text-xs font-bold opacity-80 mb-1" }, "시즌 핫 이슈"),
          h("p", { className: "font-black text-base sm:text-lg mb-1 truncate" }, seasonal.title),
          h("p", { className: "text-xs sm:text-sm opacity-90 line-clamp-2" }, seasonal.subtitle),
        ),
      ),
      h("div", { className: "flex flex-col items-end gap-1.5 flex-shrink-0" },
        daysLeft !== null && h("span", {
          className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold",
          style: { backgroundColor: isUrgent ? "#991B1B" : "#0A1829", color: "#FFFFFF" },
        }, h(Clock, { className: "w-3 h-3" }), "D-", daysLeft),
        h("div", { className: "flex items-center gap-1.5" },
          h("span", { className: "hidden sm:inline text-xs font-bold opacity-90" }, seasonal.cta),
          h(ArrowRight, { className: "w-5 h-5 group-hover:translate-x-0.5 transition-transform" }),
        ),
      ),
    ),
  );
}

const seedOf = (day: Date): SeasonalSeed => ({ y: day.getFullYear(), m: day.getMonth() + 1, d: day.getDate() });
const days = (count: number, from = new Date(2026, 10, 1, 12)) =>
  Array.from({ length: count }, (_, i) => new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, 12, 0, 0));

const originalTz = process.env.TZ;
afterEach(() => {
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});

describe("SeasonalBanner — 마운트 뒤 최종 마크업은 종전과 같다", () => {
  it("1년 366일(2026-11-01~2027-11-01): 실제 배너 = 종전 컴포넌트, 바이트 동일", () => {
    for (const now of days(366)) {
      const label = `${now.getMonth() + 1}/${now.getDate()}`;
      const legacy = legacyBanner(now);
      expect(legacy, label).not.toBeNull(); // 연중 공백 없음 → 최종이 '없음'인 날 없음
      expect(renderToStaticMarkup(createElement(SeasonalBannerView, { now })), label).toBe(renderToStaticMarkup(legacy!));
    }
  });

  it("마운트 뒤 분기는 지금 시각으로 종전 배너를 그린다 — 감싸는 요소·추가 속성 없음", () => {
    const src = read("src/components/SeasonalBanner.tsx");
    expect(src).toContain("useEffect(() => setMounted(true), []);");
    expect(src).toContain("return <SeasonalBannerView className={className} now={new Date()} />;");
    // OPI 발표 게이트 전달(B18 SRR-05)은 그대로 — seasonalBanner.test.ts 도 같은 문자열을 본다
    expect(src).toContain("getCurrentSeasonal(now, { opiAnnounced: OPI_2026_ANNOUNCEMENT.announced })");
    expect(src.trimStart().startsWith("//")).toBe(true);
    expect(src).toMatch(/^"use client";$/m);
  });
});

describe("SeasonalBanner — 서버 시드로 고른 자리 = 같은 날의 실제 배너", () => {
  const strip = (html: string) => html
    .replace(' aria-hidden="true" data-cls-reserve="seasonal"', "")
    .replace(/ invisible">/, '">');

  it("1년 366일 전부: 자리 상자와 실제 배너가 바깥 링크(div<->a)만 다르고 같은 class·같은 내용", () => {
    for (const day of days(366)) {
      const seed = seedOf(day);
      const now = seasonalSeedDate(seed);
      const seasonal = getCurrentSeasonal(now, { opiAnnounced: OPI_2026_ANNOUNCEMENT.announced });
      expect(seasonal, `${seed.m}/${seed.d}`).not.toBeNull();
      const reserved = renderToStaticMarkup(createElement(SeasonalBannerView, { now, reserve: true }));
      const real = renderToStaticMarkup(createElement(SeasonalBannerView, { now }));
      const expected = real
        .replace(`<a href="${seasonal!.href}" class="${SEASONAL_CARD_CLASS}">`, `<div class="${SEASONAL_CARD_CLASS}">`)
        .replace(/<\/a><\/section>$/, "</div></section>");
      expect(strip(reserved), `${seed.m}/${seed.d}`).toBe(expected);
      expect(reserved).not.toContain("<a ");
      expect(reserved).not.toMatch(/href=|tabindex|<button|<input/);
    }
  });

  it("서버 렌더(마운트 전): 시드가 있으면 보이지 않는 상자, 없으면 종전처럼 빈 문자열", () => {
    const html = renderToStaticMarkup(createElement(SeasonalBanner, { seed: { y: 2026, m: 11, d: 27 } }));
    expect(html.startsWith('<section aria-hidden="true" data-cls-reserve="seasonal" class="px-4 sm:px-6 lg:px-8  invisible">')).toBe(true);
    expect(html).toContain("2027 연말정산(2026년 귀속) 총정리");
    expect(html).toMatch(/D-(?:<!-- -->)?34</); // 11/27 → 12/31 달력 차이 34 (N2-lib-10)
    expect(renderToStaticMarkup(createElement(SeasonalBanner, {}))).toBe("");
    expect(renderToStaticMarkup(createElement(SeasonalBanner, { seed: null }))).toBe("");
  });

  it("시드는 KST 달력 날짜 — 서버가 UTC 여도 한국 날짜", () => {
    expect(seasonalSeedKst(Date.UTC(2026, 10, 26, 14, 59))).toEqual({ y: 2026, m: 11, d: 26 });
    expect(seasonalSeedKst(Date.UTC(2026, 10, 26, 15, 0))).toEqual({ y: 2026, m: 11, d: 27 });
    expect(seasonalSeedKst(Date.UTC(2026, 11, 31, 15, 30))).toEqual({ y: 2027, m: 1, d: 1 });
    expect(seasonalSeedDate({ y: 2027, m: 1, d: 15 }).getDate()).toBe(15);
  });

  it("타임존이 달라도 같은 시드는 같은 상자(하이드레이션 불일치 0)", () => {
    const seeds: SeasonalSeed[] = [
      { y: 2026, m: 11, d: 1 }, { y: 2026, m: 11, d: 27 }, { y: 2026, m: 12, d: 31 },
      { y: 2027, m: 1, d: 1 }, { y: 2027, m: 1, d: 15 }, { y: 2027, m: 9, d: 25 },
    ];
    const render = () => seeds.map((seed) => renderToStaticMarkup(createElement(SeasonalBannerView, { now: seasonalSeedDate(seed), reserve: true }))).join("\n");
    process.env.TZ = "Asia/Seoul";
    const seoul = render();
    process.env.TZ = "UTC";
    const utc = render();
    process.env.TZ = "America/Los_Angeles";
    const la = render();
    expect(utc).toBe(seoul);
    expect(la).toBe(seoul);
    expect(seoul).toMatch(/D-(?:<!-- -->)?60</); // 11/1 → 12/31 (달력 차이)
    expect(seoul).toMatch(/D-(?:<!-- -->)?0</); // 12/31 당일
  });
});

describe("홈 HomeClient — 자리 상자의 위치와 광고 순서", () => {
  const slots = {
    featuredGuides: createElement("section", null, "Featured guides slot"),
    socialProof: createElement("section", null, "Social proof slot"),
    guideCategories: createElement("section", null, "Guide categories slot"),
    toolsSection: createElement("section", null, "Tools slot"),
    trafficEngines: createElement("section", null, "Traffic engines slot"),
  };

  it("상자는 HomeTopAd 아래·계산기 위 종전 자리(bg-background py-8 div 안), 광고 순서·개수 그대로", () => {
    const html = renderToStaticMarkup(createElement(HomeClient, { ...slots, seasonalSeed: { y: 2026, m: 11, d: 27 } }));
    expect([...html.matchAll(/data-slot-position="([^"]+)"/g)].map((m) => m[1])).toEqual(["home-top", "display2", "guide-mid", "multiplex"]);
    const reserve = html.indexOf('data-cls-reserve="seasonal"');
    expect(reserve).toBeGreaterThan(html.indexOf('data-slot-position="home-top"'));
    expect(reserve).toBeLessThan(html.indexOf('id="calculator-section"'));
    expect(reserve).toBeLessThan(html.indexOf('data-slot-position="display2"'));
    // 감싸는 div 와 그 안의 섹션 하나 — 종전 dynamic 자리와 같은 부모
    expect(html).toContain('<div class="bg-background py-8"><section aria-hidden="true" data-cls-reserve="seasonal" class="px-4 sm:px-6 lg:px-8  invisible">');
    const box = html.slice(html.lastIndexOf("<section", reserve), html.indexOf("</section>", reserve));
    expect(box).toContain('aria-hidden="true"');
    expect(box).toContain(" invisible");
    expect(box).not.toContain("<a ");
    // 상자 다음은 바로 계산기 섹션(사이에 다른 요소 없음)
    const after = html.slice(html.indexOf("</section>", reserve));
    expect(after).toMatch(/^<\/section><\/div><section id="calculator-section"/);
  });

  it("시드 없이(다른 호출부) 그리면 종전처럼 자리 상자가 없다", () => {
    const html = renderToStaticMarkup(createElement(HomeClient, slots));
    expect(html).not.toContain('data-cls-reserve="seasonal"');
    expect(html).toContain('<div class="bg-background py-8"></div>');
  });

  it("홈 page.tsx 가 KST 시드를 넘기고, HomeClient 는 배너를 정적 import(dynamic ssr:false 아님)", () => {
    const page = read("src/app/page.tsx");
    expect(page).toContain("seasonalSeed={seasonalSeedKst()}");
    const client = read("src/app/HomeClient.tsx");
    expect(client).toContain('import SeasonalBanner from "@/components/SeasonalBanner";');
    expect(client).not.toMatch(/dynamic\(\(\) => import\("@\/components\/SeasonalBanner"\)/);
    expect(client).toContain('<div className="bg-background py-8"><SeasonalBanner seed={seasonalSeed} /></div>');
    // 광고 컴포넌트 import·배치 줄은 그대로
    expect(client).toContain('import { HomeTopAd, GuideMidAd, Display2Ad, MultiplexAd } from "@/components/AdPlacement";');
    expect(client).toContain('<div className="page-width"><HomeTopAd /></div>');
    expect(client).toMatch(/\n\s*<CalculatorTabs \/>\r?\n\s*<div className="mx-auto mt-10 max-w-3xl"><Display2Ad \/><\/div>/);
  });
});
