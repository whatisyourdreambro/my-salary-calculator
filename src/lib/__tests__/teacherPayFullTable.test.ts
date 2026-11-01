// 교사 호봉표 1~40호봉 전체표 가드 (B35 NEW-v12-search-console-2, 운영자 승인 2026-11-01 #8)
//
// 배경: /teacher-pay-2026 는 '교사 호봉표' 검색어로 들어오는데 광고 위 표는 주요 호봉 9개 발췌뿐이었다.
// 전체 1~40호봉을 FAQ 뒤 마지막 본문 광고(쿠팡 배너) 아래 기본 접힘 상자로 붙였다 — 광고 위치·순서 불변.
// 고정하는 것:
//  (1) 전체표 데이터(TEACHER_PAY_FULL_2026): 1~40호봉 40행이 인사혁신처 2026 봉급표(공무원보수규정 [별표 11])
//      원문 값과 전 칸 일치, 광고 위 발췌표(TEACHER_PAY_ROWS_2026)와 겹치는 칸 일치
//  (2) 렌더: <details id="teacher-full-table"> 1개, 기본 접힘(open 없음), 제목 '1~40호봉 전체 보기', 40행 순서·금액
//  (3) 위치: FAQ 뒤, 본문 칼럼 광고 5개(home-top·calc-result·in-article·guide-mid·쿠팡)가 모두 상자 앞이고
//      상자 뒤 본문 칼럼에는 광고가 없다(다음 광고는 사이드바). 광고 위 발췌표는 그대로.
import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/teacher-pay-2026",
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => {
  const ad = (name: string) => {
    const MockAd = () => createElement("div", { "data-test-ad": name });
    MockAd.displayName = `MockAd(${name})`; // react/display-name
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
vi.mock("@/components/CitationCopyButton", () => ({ default: () => null }));

import TeacherPage from "@/app/teacher-pay-2026/page";
import { TEACHER_PAY_ROWS_2026 } from "@/lib/civilServantPay";
import { TEACHER_PAY_FULL_2026 } from "@/lib/payTablesFull2026";

/**
 * 인사혁신처 2026년 공무원 봉급표 [별표 11] 유치원ㆍ초등학교ㆍ중학교ㆍ고등학교 교원 등의 봉급표, 1~40호봉 월 봉급액(원).
 * https://www.mpm.go.kr/mpm/info/resultPay/bizSalary/2026/ 에서 2026-11-01 읽은 값
 * (법령: https://www.law.go.kr/LSW/lsBylInfoPLinkR.do?lsNm=공무원보수규정&bylNo=0011&bylBrNo=00&bylCls=BE&bylEfYdYn=Y).
 * 12월 말 2027 봉급표가 나와도 이 2026 값은 바꾸지 않는다 — 2027 은 별도 상수.
 */
const OFFICIAL_2026 = [
  2041500, 2103300, 2166000, 2228500, 2291500, 2354400, 2416600, 2478600, 2495600, 2516700,
  2538300, 2585900, 2657500, 2773700, 2889700, 3006200, 3121000, 3241500, 3361200, 3481000,
  3600700, 3733600, 3865300, 3997500, 4129400, 4261900, 4400100, 4538000, 4682100, 4826800,
  4971100, 5115200, 5261600, 5407500, 5553600, 5699100, 5825700, 5952500, 6079500, 6205700,
];

const won = (n: number) => n.toLocaleString("ko-KR");
const ADS_IN_MAIN_COLUMN = ["home-top", "calc-result", "in-article", "guide-mid", "coupang"];
const adsIn = (html: string) => [...html.matchAll(/data-test-ad="([^"]+)"/g)].map((m) => m[1]);

function renderPage() {
  const html = renderToStaticMarkup(createElement(TeacherPage as never));
  const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  const idAt = body.indexOf('id="teacher-full-table"');
  const start = body.lastIndexOf("<details", idAt);
  const end = idAt < 0 ? -1 : body.indexOf("</details>", idAt) + "</details>".length;
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => {
    const parsed = JSON.parse(m[1]) as unknown;
    return (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
  });
  return { body, idAt, start, end, box: idAt < 0 ? "" : body.slice(start, end), jsonLd };
}

describe("교원 1~40호봉 전체표 데이터 (B35)", () => {
  it("1~40호봉 40행이 인사혁신처 2026 봉급표(별표 11) 원문 값과 전 칸 일치", () => {
    expect(TEACHER_PAY_FULL_2026.map(([h]) => h)).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
    expect(TEACHER_PAY_FULL_2026.map(([, pay]) => pay)).toEqual(OFFICIAL_2026);
  });

  it("호봉이 오르면 금액도 오르고, 금액은 100원 단위", () => {
    TEACHER_PAY_FULL_2026.forEach(([h, pay], i) => {
      expect(pay % 100, `${h}호봉`).toBe(0);
      if (i > 0) expect(pay, `${h}호봉`).toBeGreaterThan(TEACHER_PAY_FULL_2026[i - 1][1]);
    });
  });

  it("광고 위 발췌표의 모든 칸이 전체표와 같다 (발췌표는 9행 그대로)", () => {
    expect(TEACHER_PAY_ROWS_2026).toHaveLength(9);
    for (const [h, pay] of TEACHER_PAY_ROWS_2026) {
      expect(TEACHER_PAY_FULL_2026.find(([x]) => x === h)?.[1], `${h}호봉`).toBe(pay);
    }
  });
});

describe("교원 1~40호봉 전체표 렌더·위치 (B35)", () => {
  it("상자 1개, 기본 접힘(open 없음), 제목 '1~40호봉 전체 보기'", () => {
    const { body, idAt, start, box } = renderPage();
    expect(idAt, "전체표 상자").toBeGreaterThan(-1);
    expect(body.split('id="teacher-full-table"')).toHaveLength(2);
    const openTag = box.slice(0, box.indexOf(">") + 1);
    expect(openTag.startsWith("<details")).toBe(true);
    expect(openTag, "기본 접힘").not.toMatch(/\sopen(?:[\s=>]|$)/);
    expect(start).toBe(body.indexOf(openTag));
    const summary = /<summary\b[^>]*>([\s\S]*?)<\/summary>/.exec(box)?.[1] ?? "";
    expect(summary.replace(/<[^>]+>/g, "").trim()).toBe("1~40호봉 전체 보기");
  });

  it("상자 안 40행이 전체표 데이터와 같은 순서·금액, 시작 호봉 표시는 9호봉 한 곳", () => {
    const { box } = renderPage();
    const rows = [...box.matchAll(/<th scope="row"[^>]*>(\d+)호봉([\s\S]*?)<\/th><td[^>]*>([\d,]+)<\/td>/g)];
    expect(rows.map((m) => [Number(m[1]), m[3]])).toEqual(TEACHER_PAY_FULL_2026.map(([h, pay]) => [h, won(pay)]));
    expect(rows.filter((m) => m[2].includes("통상 시작")).map((m) => Number(m[1]))).toEqual([9]);
    expect([...box.matchAll(/<caption\b[^>]*>([^<]*)<\/caption>/g)].map((m) => m[1])).toEqual(["1~20호봉", "21~40호봉"]);
  });

  it("FAQ 뒤, 본문 칼럼 광고 5개 모두 상자 앞 — 상자 뒤 본문 칼럼에는 광고 없음(다음은 사이드바)", () => {
    const { body, start, end } = renderPage();
    const faq = body.indexOf("교사 월급 자주 묻는 질문");
    expect(faq).toBeGreaterThan(-1);
    expect(start).toBeGreaterThan(faq);
    expect(adsIn(body.slice(0, start))).toEqual(ADS_IN_MAIN_COLUMN);
    const aside = body.indexOf("<aside");
    expect(aside).toBeGreaterThan(end);
    expect(adsIn(body.slice(end, aside)), "상자와 사이드바 사이 광고").toEqual([]);
    // 광고 컴포넌트 순서·개수 불변 (payTableSnippets.test.ts 와 같은 기대값)
    expect(adsIn(body)).toEqual([...ADS_IN_MAIN_COLUMN, "sidebar", "coupang"]);
  });

  it("광고 위 발췌표는 그대로 — 제목·9행이 CalcResultAd 앞, 전체표 칸은 본문 마지막 광고(쿠팡) 앞에 없음", () => {
    const { body } = renderPage();
    const excerptAt = body.indexOf("2026 교원 호봉표 (주요 호봉 발췌)");
    const calcResult = body.indexOf('data-test-ad="calc-result"');
    expect(excerptAt).toBeGreaterThan(-1);
    expect(excerptAt).toBeLessThan(calcResult);
    const excerptRows = [...body.slice(excerptAt, calcResult).matchAll(/<td[^>]*>(\d+)호봉<\/td>/g)].map((m) => Number(m[1]));
    expect(excerptRows).toEqual(TEACHER_PAY_ROWS_2026.map(([h]) => h));
    // 첫 쿠팡 표식 = 본문 칼럼 쿠팡 배너(사이드바 쿠팡은 그 뒤) — 그 앞에는 전체표 상자·행 머리글이 하나도 없다
    const inContentCoupang = body.indexOf('data-test-ad="coupang"');
    expect(body.slice(0, inContentCoupang)).not.toContain('scope="row"');
    expect(body.slice(0, inContentCoupang)).not.toContain('id="teacher-full-table"');
  });

  it("Dataset 설명이 전체표를 밝히고 dateModified 가 Article 과 같다", () => {
    const { jsonLd } = renderPage();
    const dataset = jsonLd.find((item) => item["@type"] === "Dataset");
    const article = jsonLd.find((item) => item["@type"] === "Article");
    expect(String(dataset?.description)).toContain("1~40호봉 전체표");
    expect(dataset?.dateModified).toBe(article?.dateModified);
  });
});
