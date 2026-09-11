// 헤더·푸터 시즌 메뉴 축소 회귀 가드 (S3-5, 2026-09-12 — docs/next-upgrade-plan-2026-09-11.md §4 NAV-11)
//
// 배경: 헤더 시즌 드롭다운이 SEP 기준 38항목(상단 5 + 공통 33)이었고, 그중 10건은 성과급 메뉴와,
// 3건은 계산기 메뉴와 중복, 2건은 비시즌이었다. SEASON_REST 의 header 를 상시 5종만 남기고
// 내려온 항목은 푸터(order 19+)·navConfig·hubs·seasonalCalendar·yearEndTaxHub 로 도달하게 했다.
// S1-1 이 12/1·1/2 에 세트를 자동/수동 전환하므로 4키 전부를 고정한다:
//  (1) 키별 header 항목 ≤ HEADER_SEASON_MAX(12), SEASON_REST 헤더 상시 5종 고정
//  (2) SEASON_REST 유래 header ∩ navConfig 성과급·계산기 메뉴 = ∅ — 상단 블록 유래 중복은
//      키별 기대 집합으로 명시(시즌 배지 승격이 목적이라 의도된 중복)
//  (3) 헤더에서 내려온 href 는 전부 푸터·navConfig·hubs·seasonalCalendar·yearEndTaxHub 중 한 곳에 존재
//  (4) 푸터 order 0~18 종전 값 불변, 19+ 신설분 존재, 푸터 5 <details>(professionalShell 과 이중 가드)
//  (5) DesktopDropdown 2단 컬럼 임계(≥9)가 10~12 항목을 2단으로 그린다

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  HEADER_SEASON_MAX,
  SEASON_REST,
  SEASON_TOP_BY_KEY,
  buildSeasonLinks,
  footerSeasonLinks,
  headerSeasonItems,
  seasonLinks,
  type SeasonLink,
} from "@/config/seasonLinks";
import { SEASON_KEY } from "@/config/seasonKey.generated";
import type { SeasonKey } from "@/lib/seasonKey";
import { navConfig } from "@/components/header/navConfig";
import { hubs } from "@/lib/hubs";
import { SEASONAL_CALENDAR } from "@/lib/seasonalCalendar";
import { YEAR_END_CALENDAR, YEAR_END_NEWS, YEAR_END_STEPS } from "@/data/yearEndTaxHub";
import Footer from "@/components/Footer";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const KEYS: SeasonKey[] = ["SEP", "OCT", "DEC", "JAN"];

const headerOf = (links: SeasonLink[]) => links.filter((l) => l.header).map((l) => l.href);
const footerOf = (links: SeasonLink[]) => links.filter((l) => l.footer).map((l) => l.href);

/** 객체 트리에서 href 필드 값(내부 경로)만 수집 — 주석·설명문의 경로 언급은 잡지 않는다 */
function collectHrefs(node: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(node)) node.forEach((n) => collectHrefs(n, out));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (k === "href" && typeof v === "string" && v.startsWith("/")) out.add(v.split(/[?#]/)[0]);
      else collectHrefs(v, out);
    }
  }
  return out;
}

const dropdown = (name: string) => {
  const item = navConfig.find((n) => n.type === "dropdown" && n.name === name);
  if (!item || item.type !== "dropdown") throw new Error(`navConfig 드롭다운 '${name}' 없음`);
  return new Set(item.items.map((i) => i.href.split(/[?#]/)[0]));
};
const BONUS_MENU = dropdown("성과급");
const CALC_MENU = dropdown("계산기");
const NAV_HREFS = collectHrefs(navConfig);
const HUB_HREFS = collectHrefs(hubs);
const CALENDAR_HREFS = collectHrefs(SEASONAL_CALENDAR);
const YEAR_END_HREFS = collectHrefs([YEAR_END_STEPS, YEAR_END_CALENDAR, YEAR_END_NEWS]);

/** 헤더 상시 5종 — 연중 유효하고 성과급·계산기 메뉴와 겹치지 않는 항목만 */
const EVERGREEN_HEADER = [
  "/minimum-wage-2027",
  "/tax-reform-2026",
  "/health-insurance-2026",
  "/new-employee-salary-2026",
  "/calc/pension-hike-2027",
];

describe("헤더 시즌 드롭다운 — 키별 ≤ 12 (S3-5)", () => {
  it("SEASON_REST 의 header 는 상시 5종뿐이다 (배열 순서 = 헤더 순서)", () => {
    expect(headerOf(SEASON_REST)).toEqual(EVERGREEN_HEADER);
  });

  it.each(KEYS)("%s: dedup 후 header 항목 ≤ HEADER_SEASON_MAX", (key) => {
    const header = headerOf(buildSeasonLinks(key));
    expect(HEADER_SEASON_MAX).toBe(12);
    expect(header.length, `${key} header=${header.join(", ")}`).toBeLessThanOrEqual(HEADER_SEASON_MAX);
    expect(new Set(header).size).toBe(header.length);
  });

  it("활성 키의 headerSeasonItems 는 buildSeasonLinks(SEASON_KEY) 와 같다 (navConfig 소비 경로)", () => {
    expect(headerSeasonItems.map((i) => i.href)).toEqual(headerOf(buildSeasonLinks(SEASON_KEY)));
    expect(seasonLinks.map((l) => l.href)).toEqual(buildSeasonLinks(SEASON_KEY).map((l) => l.href));
    expect(headerSeasonItems.length).toBeLessThanOrEqual(HEADER_SEASON_MAX);
  });
});

describe("헤더 시즌 ∩ 성과급·계산기 메뉴 (NAV-11 중복 제거)", () => {
  it.each(KEYS)("%s: SEASON_REST 유래 header 는 성과급·계산기 메뉴와 겹치지 않는다", (key) => {
    const top = new Set(SEASON_TOP_BY_KEY[key].map((l) => l.href));
    const fromRest = headerOf(buildSeasonLinks(key)).filter((h) => !top.has(h));
    expect(fromRest.filter((h) => BONUS_MENU.has(h))).toEqual([]);
    expect(fromRest.filter((h) => CALC_MENU.has(h))).toEqual([]);
  });

  // 상단 블록 유래 중복은 의도된 것 — 시즌 배지(SEASON/HOT)로 승격해 상단에 노출하는 항목이다.
  // 성과급 메뉴 중복: 삼성(DEC TAI·JAN OPI 발표 시즌). 계산기 메뉴 중복: 연말정산 공제 계산기 3종·환급금 계산기.
  // 새 중복이 생기면 여기 기대 집합을 갱신하며 이유를 적을 것.
  const EXPECTED_TOP_OVERLAP: Record<SeasonKey, { bonus: string[]; calc: string[] }> = {
    SEP: { bonus: [], calc: [] },
    OCT: { bonus: [], calc: ["/credit-card-deduction-2026", "/rent-tax-credit-2026", "/medical-tax-credit-2026"] },
    DEC: { bonus: ["/calc/samsung-bonus"], calc: ["/calc/samsung-bonus", "/credit-card-deduction-2026", "/medical-tax-credit-2026"] },
    JAN: { bonus: ["/calc/samsung-bonus"], calc: ["/calc/samsung-bonus", "/year-end-tax", "/credit-card-deduction-2026"] },
  };

  it.each(KEYS)("%s: 상단 블록 유래 중복은 문서화된 집합과 정확히 같다", (key) => {
    const topHeader = SEASON_TOP_BY_KEY[key].filter((l) => l.header).map((l) => l.href);
    expect(topHeader.filter((h) => BONUS_MENU.has(h))).toEqual(EXPECTED_TOP_OVERLAP[key].bonus);
    expect(topHeader.filter((h) => CALC_MENU.has(h))).toEqual(EXPECTED_TOP_OVERLAP[key].calc);
  });
});

describe("헤더에서 내려온 href 의 도달성 (푸터·navConfig·hubs·seasonalCalendar·yearEndTaxHub)", () => {
  // 2026-09-12 S3-5 로 SEASON_REST header 를 뗀 28건 — 이력 사실이라 명시 고정 (푸터 전용이던 9건은 제외)
  const demoted = [
    "/auto-tax-2026",
    "/year-end-tax-settlement-2026",
    "/credit-card-deduction-2026",
    "/rent-tax-credit-2026",
    "/medical-tax-credit-2026",
    "/donation-tax-credit-2026",
    "/calc/dual-income-year-end",
    "/health-insurance-dependent",
    "/minimum-wage-2026",
    "/health-checkup-2026",
    "/year-end-tax-checklist",
    "/tax-rates-2026",
    "/social-insurance-rates-2026",
    "/tax-changes-2026",
    "/retirement-pension-2026",
    "/samsung-negotiation-2026",
    "/calc/samsung-bonus",
    "/calc/sk-hynix-bonus",
    "/calc/hyundai-bonus",
    "/calc/kia-bonus",
    "/calc/lg-energy-bonus",
    "/calc/hd-hyundai-bonus",
    "/calc/naver-bonus",
    "/calc/kakao-bonus",
    "/calc/celltrion-bonus",
    "/calc/hyundai-rotem-bonus",
    "/year-end-tax-2026",
    "/new-employee-2026",
  ];

  it("내려온 28건은 전부 SEASON_REST 에 header 없이 남아 있고(삭제 금지) 상시 5종과 겹치지 않는다", () => {
    expect(demoted).toHaveLength(28);
    const byHref = new Map(SEASON_REST.map((l) => [l.href, l]));
    for (const h of demoted) {
      expect(byHref.has(h), `${h} 가 SEASON_REST 에서 삭제됨`).toBe(true);
      expect(byHref.get(h)!.header, `${h} 에 header 가 되살아남`).toBeUndefined();
    }
    expect(demoted.filter((h) => EVERGREEN_HEADER.includes(h))).toEqual([]);
    // 헤더 없는 항목 = 내려온 28 + 종전 푸터 전용 9
    expect(SEASON_REST.filter((l) => !l.header)).toHaveLength(37);
  });

  it.each(KEYS)("%s: 헤더에 없는 SEASON_REST 항목은 전부 다른 진입로에 존재한다", (key) => {
    const links = buildSeasonLinks(key);
    const header = new Set(headerOf(links));
    const footer = new Set(footerOf(links));
    const unreachable = SEASON_REST.map((l) => l.href)
      .filter((h) => !header.has(h))
      .filter(
        (h) => !(footer.has(h) || NAV_HREFS.has(h) || HUB_HREFS.has(h) || CALENDAR_HREFS.has(h) || YEAR_END_HREFS.has(h)),
      );
    expect(unreachable, `${key} 에서 도달 불가`).toEqual([]);
  });

  it("도달 근거 표 — 내려온 28건 각각의 진입로 (SEP 기준, 회귀 시 어디가 끊겼는지 바로 보이도록)", () => {
    const links = buildSeasonLinks("SEP");
    const footer = new Set(footerOf(links));
    const table = Object.fromEntries(
      demoted.map((h) => [
        h,
        [
          footer.has(h) && "footer",
          NAV_HREFS.has(h) && "navConfig",
          HUB_HREFS.has(h) && "hubs",
          CALENDAR_HREFS.has(h) && "seasonalCalendar",
          YEAR_END_HREFS.has(h) && "yearEndTaxHub",
        ].filter(Boolean),
      ]),
    );
    for (const [h, reach] of Object.entries(table)) expect(reach, h).not.toHaveLength(0);
    // 푸터 신설(19+)로만 도달하는 항목 — 이 푸터 링크를 빼면 고아가 된다
    expect(demoted.filter((h) => table[h].length === 1 && table[h][0] === "footer").sort()).toEqual(
      [
        "/calc/dual-income-year-end",
        "/donation-tax-credit-2026",
        "/health-insurance-dependent",
        "/minimum-wage-2026",
        "/retirement-pension-2026",
        "/social-insurance-rates-2026",
      ].sort(),
    );
  });
});

describe("푸터 시즌 섹션", () => {
  it("order 0~18 은 종전 값 그대로 (재번호 금지)", () => {
    const legacy: Record<string, number> = {
      "/minimum-wage-2027": 1,
      "/calc/bonus-calculators": 2,
      "/calc/samsung-bonus": 3,
      "/calc/sk-hynix-bonus": 4,
      "/new-employee-salary-2026": 7,
      "/calc/january-bonus": 8,
      "/calc/year-end-bonus": 9,
      "/health-insurance-2026": 10,
      "/civil-servant-pay-2026": 11,
      "/year-end-tax-mid-resign": 12,
      "/calc/pension-hike-2027": 13,
      "/military-pay-2026": 14,
      "/teacher-pay-2026": 15,
      "/police-pay-2026": 16,
      "/firefighter-pay-2026": 17,
      "/year-end-tax-2026": 18,
    };
    const restFooter = Object.fromEntries(SEASON_REST.filter((l) => l.footer).map((l) => [l.href, l.footer!.order]));
    for (const [href, order] of Object.entries(legacy)) expect(restFooter[href], href).toBe(order);
    // 상단 블록의 푸터 order(0 추석·5 재산세·6 연말정산 허브·3 삼성)도 불변
    for (const key of KEYS) {
      for (const l of SEASON_TOP_BY_KEY[key].filter((x) => x.footer)) {
        expect([0, 3, 5, 6], `${key} ${l.href}`).toContain(l.footer!.order);
      }
    }
  });

  it("헤더에서 내려온 신설 푸터(19+)는 10건이고 order 가 겹치지 않는다", () => {
    const added = SEASON_REST.filter((l) => l.footer && l.footer.order >= 19);
    expect(added.map((l) => l.href).sort()).toEqual(
      [
        "/tax-reform-2026",
        "/year-end-tax-settlement-2026",
        "/year-end-tax-checklist",
        "/new-employee-2026",
        "/health-insurance-dependent",
        "/donation-tax-credit-2026",
        "/calc/dual-income-year-end",
        "/minimum-wage-2026",
        "/social-insurance-rates-2026",
        "/retirement-pension-2026",
      ].sort(),
    );
    const orders = SEASON_REST.filter((l) => l.footer).map((l) => l.footer!.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it.each(KEYS)("%s: 푸터에 삼성 성과급 계산기·종합소득세 2026·신설 10건이 남아 있다", (key) => {
    const footer = footerOf(buildSeasonLinks(key));
    for (const h of ["/calc/samsung-bonus", "/year-end-tax-2026", "/tax-reform-2026", "/health-insurance-dependent"]) {
      expect(footer, `${key} ${h}`).toContain(h);
    }
  });

  it("Footer 는 여전히 5 <details> 를 렌더하고 활성 키 푸터 시즌 링크를 전부 담는다", () => {
    const html = renderToStaticMarkup(createElement(Footer));
    expect([...html.matchAll(/<details\b/g)]).toHaveLength(5);
    for (const l of footerSeasonLinks) expect(html).toContain(`href="${l.href}"`);
  });
});

describe("소비자·규격 불변", () => {
  it("navConfig 드롭다운 이름과 시즌 항목 파생 경로는 그대로", () => {
    expect(navConfig.filter((n) => n.type === "dropdown").map((n) => n.name)).toEqual([
      "성과급",
      "계산기",
      "연봉DB",
      "시즌",
      "가이드",
      "생활금융",
      "Fun",
    ]);
    expect(read("src/components/header/navConfig.ts")).toMatch(/items:\s*headerSeasonItems/);
    expect(read("src/config/seasonLinks.ts")).toMatch(/SEASON_TOP_BY_KEY\[SEASON_KEY\]/);
  });

  it("DesktopDropdown 은 9항목 이상을 2단(580px)으로 그린다 — 10~12 항목 시즌 메뉴가 여기 해당", () => {
    const src = read("src/components/header/DesktopDropdown.tsx");
    expect(src).toMatch(/item\.items\.length >= 9 \? 580 : 340/);
    expect(src).toMatch(/const isWide = item\.items\.length >= 9;/);
    for (const key of KEYS) expect(headerOf(buildSeasonLinks(key)).length).toBeGreaterThanOrEqual(9);
  });
});
