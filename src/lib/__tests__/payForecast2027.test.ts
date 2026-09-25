// 2027 교사·경찰·소방 봉급 예상 페이지 가드 (수익 추천 #3, 2026-09-25 준비)
//
// 고정하는 것:
//  (1) 대표 호봉 예상치 = 2026 원문 × (1 + 예산안 3.9%), 천원 반올림 — 손계산 기대값과 대조
//  (2) 3.9% 는 '예산안·확정 전·예상'으로만 말한다 (title·description·리드·FAQ), 확정처럼 쓰는 표현 금지
//  (3) 2027 전체 호봉표를 싣지 않는다 — 예상 표는 대표 7행뿐, Dataset JSON-LD 없음
//  (4) 광고 컴포넌트 순서 = 대응하는 2026 페이지와 1:1
//  (5) 본문의 '2026년 호봉별 인상률'은 인사혁신처 2025 봉급표 원문 앵커로 재계산한 값과 같다
//  (6) 제목은 검색어 형태('2027 교사 봉급표' 등)로 시작, 사이트명 제외 40자 이내 · 2026 페이지와 제목이 겹치지 않는다
//  (7) 등록: 검색 인덱스, 2026 페이지·/civil-servant-pay-2027 에서 링크(마지막 광고 아래)
import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Metadata } from "next";

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => {
  const ad = (name: string) => {
    const MockAd = () => createElement("div", { "data-test-ad": name });
    MockAd.displayName = `MockAd(${name})`;
    return MockAd;
  };
  return {
    HomeTopAd: ad("home-top"),
    CalcResultAd: ad("calc-result"),
    InArticleAd: ad("in-article"),
    GuideMidAd: ad("guide-mid"),
    MultiplexAd: ad("multiplex"),
    SidebarAd: ad("sidebar"),
  };
});
vi.mock("@/components/CoupangBanner", () => ({ default: () => createElement("div", { "data-test-ad": "coupang" }) }));
vi.mock("@/components/ShareButtons", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/PrivateFeedback", () => ({ default: () => null }));
vi.mock("@/components/CitationCopyButton", () => ({ default: () => null }));
vi.mock("@/app/civil-servant-pay-2027/CivilPayForecastSelector", () => ({ default: () => null }));

import Teacher2027, { metadata as teacherMeta } from "@/app/teacher-pay-2027/page";
import Police2027, { metadata as policeMeta } from "@/app/police-pay-2027/page";
import Fire2027, { metadata as fireMeta } from "@/app/firefighter-pay-2027/page";
import Teacher2026, { metadata as teacher2026Meta } from "@/app/teacher-pay-2026/page";
import Police2026, { metadata as police2026Meta } from "@/app/police-pay-2026/page";
import Fire2026, { metadata as fire2026Meta } from "@/app/firefighter-pay-2026/page";
import Civil2027 from "@/app/civil-servant-pay-2027/page";
import { RAISE_2027_BUDGET, forecast2027 } from "@/lib/civilServantPay";
import { POLICE_FIRE_PAY_FULL_2026, TEACHER_PAY_FULL_2026 } from "@/lib/payTablesFull2026";
import { policeFireForecastRows, teacherForecastRows } from "@/lib/payForecast2027";
import { searchIndex } from "@/lib/searchIndex";

const pct = `${(RAISE_2027_BUDGET * 100).toFixed(1)}%`;
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const text = (html: string) =>
  html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
const len = (s: string) => [...s].length;

function render(Page: () => unknown) {
  const html = renderToStaticMarkup(createElement(Page as never));
  const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  const ads = [...body.matchAll(/data-test-ad="([^"]+)"/g)].map((m) => m[1]);
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => {
    const parsed = JSON.parse(m[1]) as unknown;
    return (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
  });
  return { html, body, ads, jsonLd };
}

function metaStrings(meta: Metadata) {
  return {
    title: (meta.title as { absolute: string }).absolute,
    description: meta.description ?? "",
    ogTitle: meta.openGraph?.title,
    twDescription: meta.twitter?.description,
  };
}

describe("대표 호봉 예상치 — 2026 원문 × 1.039, 천원 반올림", () => {
  it("교원 7행: 9·14·18·23·28·33·40호봉, 손계산 기대값", () => {
    const rows = teacherForecastRows();
    expect(rows.map((r) => r.label)).toEqual(["9호봉", "14호봉", "18호봉", "23호봉", "28호봉", "33호봉", "40호봉"]);
    // 2,495,600 × 1.039 = 2,592,928.4 → 2,593,000 · 6,205,700 × 1.039 = 6,447,722.3 → 6,448,000
    expect(rows[0]).toMatchObject({ base2026: 2495600, predicted2027: 2593000, monthlyIncrease: 97400, note: "신규 교사 통상 시작" });
    expect(rows[2]).toMatchObject({ base2026: 3241500, note: "약 10년 차" });
    expect(rows[6]).toMatchObject({ base2026: 6205700, predicted2027: 6448000, note: "최고 호봉" });
    for (const r of rows) {
      expect(r.base2026).toBe(TEACHER_PAY_FULL_2026.find(([h]) => `${h}호봉` === r.label)?.[1]);
      expect(r.predicted2027).toBe(forecast2027(r.base2026));
      expect(r.predicted2027 % 1000).toBe(0);
      expect(r.monthlyIncrease).toBe(r.predicted2027 - r.base2026);
    }
  });

  it("경찰·소방 7행: 같은 금액, 계급 이름만 다름", () => {
    const police = policeFireForecastRows("police");
    const fire = policeFireForecastRows("fire");
    expect(police.map((r) => r.label)).toEqual([
      "순경 1호봉", "순경 5호봉", "경장 5호봉", "경사 10호봉", "경위 15호봉", "경감 20호봉", "경정 25호봉",
    ]);
    expect(fire.map((r) => r.label)).toEqual([
      "소방사 1호봉", "소방사 5호봉", "소방교 5호봉", "소방장 10호봉", "소방위 15호봉", "소방경 20호봉", "소방령 25호봉",
    ]);
    // 2,133,000 × 1.039 = 2,216,187 → 2,216,000 · 3,276,600 × 1.039 = 3,404,387.4 → 3,404,000
    expect(police[0]).toMatchObject({ base2026: 2133000, predicted2027: 2216000, monthlyIncrease: 83000 });
    expect(police[3]).toMatchObject({ base2026: 3276600, predicted2027: 3404000 });
    expect(police[6]).toMatchObject({ base2026: 5631200, predicted2027: 5851000 });
    police.forEach((r, i) => {
      expect(fire[i].base2026).toBe(r.base2026);
      expect(fire[i].predicted2027).toBe(r.predicted2027);
    });
  });
});

// 인사혁신처 2025 봉급표 원문 앵커 (mpm.go.kr/mpm/info/resultPay/bizSalary/2025/, 2026-09-25 파싱) —
// 본문 '2026년 호봉별 인상률' 표기를 재계산하는 데만 쓴다.
const TEACHER_2025: Record<number, number> = {
  1: 1915100, 8: 2325100, 9: 2365500, 10: 2387800, 11: 2408300, 12: 2455700, 13: 2567600, 40: 5995800,
};
// [계급 열(1 = 순경), 호봉, 2025 금액]
const POLICE_2025: Array<[number, number, number]> = [
  [1, 1, 2000900], [1, 7, 2331000], [1, 8, 2420900],
  [2, 1, 2078100], [2, 5, 2334100], [2, 6, 2436900],
  [3, 1, 2319000], [3, 4, 2509900], [3, 5, 2618900],
  [4, 1, 2352400], [4, 2, 2439600], [4, 3, 2550700],
  [5, 1, 2607300], [5, 32, 5190800],
  [10, 1, 4739200], [10, 23, 7971400],
];
const rate = (now: number, before: number) => ((now / before - 1) * 100).toFixed(1);

describe("본문 '2026년 호봉별 인상률' = 2025·2026 원문 재계산", () => {
  it("교원: 1~8호봉 6.6 · 9호봉 5.5 · 10~11호봉 5.4 · 12호봉 5.3 · 13호봉 이상 3.5", () => {
    const t26 = (h: number) => TEACHER_PAY_FULL_2026.find(([x]) => x === h)![1];
    const r = (h: number) => rate(t26(h), TEACHER_2025[h]);
    expect([r(1), r(8), r(9), r(10), r(11), r(12), r(13), r(40)]).toEqual(["6.6", "6.6", "5.5", "5.4", "5.4", "5.3", "3.5", "3.5"]);
    const page = text(render(Teacher2027).html);
    for (const s of ["1~8호봉+6.6%", "9호봉+5.5%", "10~11호봉+5.4%", "12호봉+5.3%", "13~40호봉+3.5%"]) {
      expect(page.replace(/\s+/g, ""), s).toContain(s);
    }
  });

  it("경찰·소방: 순경 1~7호봉 3.7~6.6 · 경장 1~5 4.0~6.6 · 경사 1~4 4.0~6.6 · 경위 1~2 5.3~6.6 · 그 밖·경감 이상 3.5", () => {
    const r = (c: number, h: number) => {
      const a = POLICE_2025.find(([cc, hh]) => cc === c && hh === h)!;
      const now = POLICE_FIRE_PAY_FULL_2026.find((row) => row[0] === h)![c] as number;
      return rate(now, a[2]);
    };
    expect([r(1, 1), r(1, 7), r(1, 8)]).toEqual(["6.6", "3.7", "3.5"]);
    expect([r(2, 1), r(2, 5), r(2, 6)]).toEqual(["6.6", "4.0", "3.5"]);
    expect([r(3, 1), r(3, 4), r(3, 5)]).toEqual(["6.6", "4.0", "3.5"]);
    expect([r(4, 1), r(4, 2), r(4, 3)]).toEqual(["6.6", "5.3", "3.5"]);
    expect([r(5, 1), r(5, 32), r(10, 1), r(10, 23)]).toEqual(["3.5", "3.5", "3.5", "3.5"]);
    const police = text(render(Police2027).html).replace(/\s+/g, "");
    const fire = text(render(Fire2027).html).replace(/\s+/g, "");
    for (const s of ["순경1~7호봉+3.7~6.6%", "경장1~5호봉+4.0~6.6%", "경사1~4호봉+4.0~6.6%", "경위1~2호봉+5.3~6.6%", "경감이상+3.5%"]) {
      expect(police, s).toContain(s);
    }
    for (const s of ["소방사1~7호봉+3.7~6.6%", "소방교1~5호봉+4.0~6.6%", "소방장1~4호봉+4.0~6.6%", "소방위1~2호봉+5.3~6.6%", "소방경이상+3.5%"]) {
      expect(fire, s).toContain(s);
    }
  });
});

const CASES = [
  {
    name: "/teacher-pay-2027",
    path: "/teacher-pay-2027",
    Page: Teacher2027,
    meta: teacherMeta,
    Page2026: Teacher2026,
    meta2026: teacher2026Meta,
    query: "2027 교사 봉급표",
    entry: teacherForecastRows()[0],
    full2026: "/teacher-pay-2026#teacher-full-table",
  },
  {
    name: "/police-pay-2027",
    path: "/police-pay-2027",
    Page: Police2027,
    meta: policeMeta,
    Page2026: Police2026,
    meta2026: police2026Meta,
    query: "2027 경찰 봉급표",
    entry: policeFireForecastRows("police")[0],
    full2026: "/police-pay-2026#police-full-table",
  },
  {
    name: "/firefighter-pay-2027",
    path: "/firefighter-pay-2027",
    Page: Fire2027,
    meta: fireMeta,
    Page2026: Fire2026,
    meta2026: fire2026Meta,
    query: "2027 소방공무원 봉급표",
    entry: policeFireForecastRows("fire")[0],
    full2026: "/firefighter-pay-2026#fire-full-table",
  },
];

describe("2027 직렬별 예상 페이지 — 메타", () => {
  it.each(CASES)("$name: title 은 검색어로 시작, 사이트명 빼고 40자 이내, 예상·예산안 표기", ({ meta, query }) => {
    const m = metaStrings(meta);
    expect(m.title.startsWith(query), m.title).toBe(true);
    const bare = m.title.replace(/ \| 머니샐러리$/, "");
    expect(len(bare), bare).toBeLessThanOrEqual(40);
    expect(bare).toContain("예상");
    expect(bare).toContain(`예산안 ${pct}`);
    expect(m.ogTitle).toBe(m.title);
  });

  it.each(CASES)("$name: description 80~120자, 예산안·확정 전·대표 예상액", ({ meta, entry }) => {
    const m = metaStrings(meta);
    expect(len(m.description), m.description).toBeGreaterThanOrEqual(80);
    expect(len(m.description), m.description).toBeLessThanOrEqual(120);
    expect(m.description).toContain(`정부 예산안 ${pct}`);
    expect(m.description).toContain("확정 전");
    expect(m.description).toContain(`약 ${won(entry.predicted2027)}`);
    expect(m.twDescription).toBe(m.description);
  });

  it.each(CASES)("$name: 2026 페이지와 title·description 이 연도만 바꾼 중복이 아니다", ({ meta, meta2026 }) => {
    const a = metaStrings(meta);
    const b = metaStrings(meta2026);
    expect(a.title.replace("2027", "2026")).not.toBe(b.title);
    expect(a.description.replace(/2027/g, "2026")).not.toBe(b.description);
  });
});

describe("2027 직렬별 예상 페이지 — 본문·구조", () => {
  it.each(CASES)("$name: 광고 컴포넌트 순서가 2026 페이지와 1:1", ({ Page, Page2026 }) => {
    const ads = render(Page).ads;
    expect(ads).toEqual(["home-top", "calc-result", "in-article", "guide-mid", "coupang", "sidebar", "coupang"]);
    expect(ads).toEqual(render(Page2026).ads);
  });

  it.each(CASES)("$name: 리드가 예산안·확정 전·대표 예상액을 먼저 답한다 (첫 광고 위)", ({ Page, entry }) => {
    const { body } = render(Page);
    const above = text(body.slice(0, body.indexOf("data-test-ad=")));
    expect(above).toContain(`정부 예산안 기준 ${pct}`);
    expect(above).toContain("확정 전");
    expect(above).toContain(`약 ${won(entry.predicted2027)}`);
    expect(above).toContain("단순 예상치");
    // 출처 링크 — 2026 봉급표 원문·예산안 보도
    expect(body.slice(0, body.indexOf("data-test-ad="))).toContain("https://www.mpm.go.kr/mpm/info/resultPay/bizSalary/2026/");
    expect(body.slice(0, body.indexOf("data-test-ad="))).toContain("https://www.yna.co.kr/view/AKR20260831140300002");
  });

  it.each(CASES)("$name: 2027 전체 호봉표 없음 — 예상 표는 대표 7행, Dataset JSON-LD 없음", ({ Page }) => {
    const { body, jsonLd } = render(Page);
    const tables = body.match(/<table\b/g) ?? [];
    expect(tables).toHaveLength(1);
    const table = body.slice(body.indexOf("<table"), body.indexOf("</table>"));
    expect(table.match(/<tr\b/g)?.length).toBe(1 + 7);
    expect(table).toContain("2027 예상");
    expect(jsonLd.some((d) => d["@type"] === "Dataset")).toBe(false);
    expect(jsonLd.some((d) => d["@type"] === "FAQPage")).toBe(true);
  });

  it.each(CASES)("$name: 3.9% 를 확정처럼 쓰지 않는다", ({ Page, meta }) => {
    const all = JSON.stringify(meta) + text(render(Page).html);
    expect(all).not.toMatch(/봉급표 확정|3\.9% 확정|확정된 2027|2027년? [^ ]+ 봉급표는 [^ ]+원으로 확정/);
    const faq = render(Page).jsonLd.find((d) => d["@type"] === "FAQPage");
    const first = (faq?.mainEntity as { acceptedAnswer: { text: string } }[])[0];
    expect(first.acceptedAnswer.text).toContain("보도됐습니다");
    expect(first.acceptedAnswer.text).toMatch(/확정되지 않았습니다|정부안 단계/);
  });

  it.each(CASES)("$name: Article headline·description 이 메타와 같다", ({ Page, meta }) => {
    const article = render(Page).jsonLd.find((d) => d["@type"] === "Article");
    const m = metaStrings(meta);
    expect(article?.headline).toBe(m.title.replace(/ \| 머니샐러리$/, ""));
    expect(article?.description).toBe(m.description);
  });

  it.each(CASES)("$name: 2026 확정 전체표·다른 직렬 2027·일반직 2027 로 링크", ({ Page, full2026, path }) => {
    const { body } = render(Page);
    expect(body).toContain(`href="${full2026}"`);
    expect(body).toContain('href="/civil-servant-pay-2027"');
    for (const other of ["/teacher-pay-2027", "/police-pay-2027", "/firefighter-pay-2027"].filter((p) => p !== path)) {
      if (path === "/teacher-pay-2027" || other !== "/teacher-pay-2027") expect(body, other).toContain(`href="${other}"`);
    }
  });
});

describe("등록 — 검색 인덱스·기존 페이지 링크", () => {
  it.each(CASES)("$name: 검색 인덱스에 있다", ({ path }) => {
    expect(searchIndex.some((e) => e.href === path)).toBe(true);
  });

  it("/civil-servant-pay-2027: 직렬별 2027 링크는 마지막 광고(Multiplex) 아래에만", () => {
    const { body } = render(Civil2027);
    const lastAd = body.lastIndexOf("data-test-ad=");
    for (const href of ["/teacher-pay-2027", "/police-pay-2027", "/firefighter-pay-2027"]) {
      const at = body.indexOf(`href="${href}"`);
      expect(at, href).toBeGreaterThan(lastAd);
    }
  });
});
