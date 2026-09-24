// 봉급표 3종 네이버 저CTR 정렬 회귀 가드 (감사 배치 B20, 2026-09-25)
//
// 배경: 네이버 노출 대비 클릭이 낮은 봉급표 3페이지(/civil-servant-pay-2027 118,063 노출 CTR 1.1%,
// /teacher-pay-2026 40,005·1.2%, /firefighter-pay-2026 23,558·2.1%)의 title·description·H1·리드를
// 주 검색어 형태로 맞추고 리드 첫 문장이 핵심 수치를 바로 답하게 제자리 교체했다.
// 이 테스트가 고정하는 것:
//  (1) <title>(absolute)·og:title·twitter:title 이 같은 문자열이고 검색어 형태로 시작, 약 40자 이내
//  (2) description(=og·twitter) 80~120자, 핵심 수치는 데이터 모듈 값과 일치 (하드코딩 드리프트 방지)
//  (3) 광고 위 헤더 블록 구성은 이전과 같고(새 블록 없음), 리드 글자 수는 이전 리드 이하 수준,
//      H1 은 확정 문구 그대로이고 글자 수·추정 폭이 이전 H1 이하
//      — 2026-08-16 광고 위 UI 삽입 사건·9/12 qna 리드 한 줄 증가로 광고 29px 밀림 교훈.
//      2026-09-25 리뷰: 첫 수정안 H1('인상률 3.9% 적용 예상'·'소방사~소방경 월급' 유지·'교원 봉급표·월급')이
//      리드 가드만 통과하고 태블릿·일부 폰 폭에서 H1 을 한 줄 늘려 HomeTopAd 를 36~48px 밀었다.
//      현재 H1 3종은 헤드리스 크롬 + 사이트 폰트(MoneySalaryText 서브셋, 시스템 폴백 상태도)로
//      뷰포트 300~1400px 를 1px 단위로 재서 이전 H1 보다 높아지는 폭이 0 인 것만 채택했다.
//      H1 문구를 바꾸면 이 테스트가 깨진다 → 같은 방식으로 다시 재고 CASES 의 h1Text 를 갱신할 것.
//  (4) 광고 컴포넌트 순서 불변
//  (5) 2027 페이지는 3.9% 를 '예산안 기준·확정 전'으로만 말한다 (확정 봉급표처럼 쓰지 않음)
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
vi.mock("@/components/PrivateFeedback", () => ({ default: () => null }));
vi.mock("@/components/CitationCopyButton", () => ({ default: () => null }));
vi.mock("@/app/civil-servant-pay-2027/CivilPayForecastSelector", () => ({
  default: () => createElement("section", { "data-test-selector": "civil-forecast" }),
}));

import CivilPage, { metadata as civilMeta } from "@/app/civil-servant-pay-2027/page";
import TeacherPage, { metadata as teacherMeta } from "@/app/teacher-pay-2026/page";
import FirePage, { metadata as fireMeta } from "@/app/firefighter-pay-2026/page";
import {
  GENERAL_PAY_ROWS_2026,
  POLICE_RANK_ROWS_2026,
  RAISE_2027_BUDGET,
  TEACHER_PAY_ROWS_2026,
  TEACHER_START_HOBONG,
  forecast2027,
} from "@/lib/civilServantPay";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const pct = `${(RAISE_2027_BUDGET * 100).toFixed(1)}%`;
const text = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const len = (s: string) => [...s].length;

// 교원 시작 호봉 행은 값으로 찾는다 (표 첫 행 ≠ 시작 호봉일 수 있음), 최상위는 호봉 최댓값 행
const TEACHER_START_ROW = TEACHER_PAY_ROWS_2026.find(([h]) => h === TEACHER_START_HOBONG)!;
const TEACHER_TOP_ROW = TEACHER_PAY_ROWS_2026.reduce((top, row) => (row[0] > top[0] ? row : top));

/**
 * H1 한 줄 폭 근사(em) — font-black(750)·tracking-tight 실측 비례(48px 에서 1em ≈ 42~44px):
 * 한글 1, 숫자·라틴 0.58, % 0.85, 마침표 0.28, 공백 0.26, 가운뎃점 0.3, 그 외 0.6.
 * 실측(사이트 폰트, 48px 한 줄): 이전 civil 785px·fire 721px·teacher 635px → 현재 683·690·568px
 * (기각된 첫 수정안은 866·843·663px).
 */
const emWidth = (s: string) =>
  [...s].reduce((w, ch) => {
    if (/[가-힣]/.test(ch)) return w + 1;
    if (/[0-9A-Za-z]/.test(ch)) return w + 0.58;
    if (ch === "%") return w + 0.85;
    if (ch === ".") return w + 0.28;
    if (ch === " ") return w + 0.26;
    if (ch === "·") return w + 0.3;
    return w + 0.6;
  }, 0);

type Block = { tag: string; className: string; text: string };

function render(Page: () => unknown) {
  const html = renderToStaticMarkup(createElement(Page as never));
  const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  const ads = [...body.matchAll(/data-test-ad="([^"]+)"/g)].map((m) => m[1]);
  // 헤더(text-center mb-10) 시작부터 첫 광고(또는 광고 앞 계산 위젯) 직전까지 = 광고 위 영역
  const start = body.indexOf('<div class="text-center mb-10">');
  const firstAd = body.indexOf("data-test-ad=");
  const selector = body.indexOf("data-test-selector=");
  const end = selector >= 0 && selector < firstAd ? selector : firstAd;
  const header = body.slice(start, end);
  const blocks: Block[] = [...header.matchAll(/<(p|h1)\b([^>]*)>([\s\S]*?)<\/\1>/g)].map((m) => ({
    tag: m[1],
    className: /class="([^"]*)"/.exec(m[2])?.[1] ?? "",
    text: text(m[3]),
  }));
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => {
    const parsed = JSON.parse(m[1]) as unknown;
    return (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
  });
  return { body, ads, blocks, selectorBeforeAd: selector >= 0 && selector < firstAd, jsonLd };
}

const lead = (blocks: Block[]) => {
  const found = blocks.filter((b) => b.tag === "p" && b.className.includes("text-base sm:text-lg"));
  expect(found, "리드 문단은 정확히 1개").toHaveLength(1);
  return found[0].text;
};
const h1 = (blocks: Block[]) => blocks.find((b) => b.tag === "h1")?.text ?? "";

function metaStrings(meta: Metadata) {
  const title = (meta.title as { absolute: string }).absolute;
  const description = meta.description ?? "";
  return {
    title,
    description,
    ogTitle: meta.openGraph?.title,
    ogDescription: meta.openGraph?.description,
    twTitle: meta.twitter?.title,
    twDescription: meta.twitter?.description,
  };
}

type Case = {
  name: string;
  Page: () => unknown;
  meta: Metadata;
  titlePrefix: string;
  h1Part: string;
  /** 현재 H1 (태그 제외) — 실측으로 이전 H1 보다 어느 폭에서도 높아지지 않음을 확인한 문구 */
  h1Text: string;
  /** 이전(2026-09-24까지) H1 (태그 제외) */
  oldH1: string;
  /** 이전(2026-09-24까지) 리드 글자 수 — 공백 포함, 태그 제외 */
  oldLeadLength: number;
  /** 이전 헤더 블록 구성 (광고 위) */
  blocks: string[];
  ads: string[];
  leadFacts: string[];
};

const CASES: Case[] = [
  {
    name: "/civil-servant-pay-2027",
    Page: CivilPage,
    meta: civilMeta,
    titlePrefix: "2027년 공무원 봉급표",
    h1Part: "2027년 공무원 봉급표",
    h1Text: `2027년 공무원 봉급표 인상률 ${pct}`,
    oldH1: `2027 공무원 봉급표 ${pct} 적용 예상 봉급`,
    oldLeadLength: 123,
    blocks: ["p", "h1", "p", "p", "p", "p"],
    ads: ["home-top", "calc-result", "in-article", "guide-mid", "coupang", "multiplex"],
    leadFacts: [`2027년 공무원 보수 인상률은 정부 예산안 기준 ${pct}`, "확정 전", won(forecast2027(GENERAL_PAY_ROWS_2026[0][1]))],
  },
  {
    name: "/teacher-pay-2026",
    Page: TeacherPage,
    meta: teacherMeta,
    titlePrefix: "2026 교사 호봉표",
    h1Part: "2026 교사 호봉표",
    h1Text: "2026 교사 호봉표 교원 봉급표",
    oldH1: "2026 교사 호봉표 유·초·중등 월급",
    oldLeadLength: 93,
    blocks: ["p", "h1", "p", "p", "p"],
    ads: ["home-top", "calc-result", "in-article", "guide-mid", "coupang", "sidebar", "coupang"],
    leadFacts: [
      `신규 교사 통상 시작인 ${TEACHER_START_HOBONG}호봉 월 ${won(TEACHER_START_ROW[1])}`,
      `${TEACHER_TOP_ROW[0]}호봉 ${won(TEACHER_TOP_ROW[1])}`,
    ],
  },
  {
    name: "/firefighter-pay-2026",
    Page: FirePage,
    meta: fireMeta,
    titlePrefix: "2026 소방공무원 봉급표",
    h1Part: "2026 소방공무원 봉급표",
    h1Text: "2026 소방공무원 봉급표 계급별 월급",
    oldH1: "2026 소방 봉급표 소방사~소방경 월급",
    oldLeadLength: 96,
    blocks: ["p", "h1", "p", "p", "p"],
    ads: ["home-top", "calc-result", "in-article", "guide-mid", "coupang", "sidebar", "coupang"],
    leadFacts: [`소방사 1호봉 월 봉급은 ${won(POLICE_RANK_ROWS_2026[0][1])}`, `소방경 1호봉은 ${won(POLICE_RANK_ROWS_2026[0][5])}`],
  },
];

describe("봉급표 3종 — 검색어 정렬 메타·첫 답변 (B20)", () => {
  it.each(CASES)("$name: title·og·twitter 가 한 문자열이고 검색어 형태로 시작, 약 40자 이내", ({ meta, titlePrefix }) => {
    const m = metaStrings(meta);
    expect(m.title.startsWith(titlePrefix), m.title).toBe(true);
    expect(m.title.endsWith(" | 머니샐러리")).toBe(true);
    // 사이트명 포함 46자 — 2027 페이지 title 에 근거 '예산안'을 남기며 늘림(리뷰 2026-09-25, YMYL).
    // 검색어·근거(2027년 공무원 봉급표 예상 — 예산안 인상률 3.9%)는 앞 30자 안, 잘려도 되는 건 꼬리뿐.
    expect(len(m.title), m.title).toBeLessThanOrEqual(46);
    expect(m.ogTitle).toBe(m.title);
    expect(m.twTitle).toBe(m.title);
  });

  it.each(CASES)("$name: description 80~120자, og·twitter 동일", ({ meta }) => {
    const m = metaStrings(meta);
    expect(len(m.description), m.description).toBeGreaterThanOrEqual(80);
    expect(len(m.description), m.description).toBeLessThanOrEqual(120);
    expect(m.ogDescription).toBe(m.description);
    expect(m.twDescription).toBe(m.description);
  });

  it.each(CASES)("$name: H1 에 검색어, 리드가 핵심 수치를 먼저 답한다", ({ Page, h1Part, leadFacts }) => {
    const { blocks } = render(Page);
    expect(h1(blocks)).toContain(h1Part);
    const leadText = lead(blocks);
    for (const fact of leadFacts) expect(leadText, `리드에 '${fact}'`).toContain(fact);
  });

  it.each(CASES)("$name: 광고 위 블록 구성 불변·리드 글자 수 이전 수준 이하", ({ Page, blocks: expected, oldLeadLength, name }) => {
    const { blocks } = render(Page);
    expect(blocks.map((b) => b.tag)).toEqual(expected);
    // 첫 답변은 제자리 교체 — 이전 리드 대비 +2자 이내 (모바일 줄 수 증가 방지)
    expect(len(lead(blocks)), `${name} 리드`).toBeLessThanOrEqual(oldLeadLength + 2);
    if (name === "/civil-servant-pay-2027") {
      // 계산 위젯은 첫 광고 앞 그대로 (위치 불변)
      expect(render(Page).selectorBeforeAd).toBe(true);
    }
  });

  it.each(CASES)("$name: H1 은 실측 확정 문구 그대로, 글자 수·추정 폭 모두 이전 H1 이하 (HomeTopAd 밀림 방지)", ({ Page, h1Text, oldH1, name }) => {
    const current = h1(render(Page).blocks);
    // 문구 고정: 바꾸면 헤드리스 크롬 실측(뷰포트 300~1400px)을 다시 하고 여기를 갱신
    expect(current, `${name} H1`).toBe(h1Text);
    expect(len(current), `${name} H1 글자 수`).toBeLessThanOrEqual(len(oldH1));
    expect(emWidth(current), `${name} H1 추정 폭(em)`).toBeLessThanOrEqual(emWidth(oldH1));
  });

  it("H1 추정 폭 가드는 리뷰에서 기각된 첫 수정안 H1 을 잡아낸다", () => {
    const rejected: [string, string][] = [
      [`2027년 공무원 봉급표 인상률 ${pct} 적용 예상`, `2027 공무원 봉급표 ${pct} 적용 예상 봉급`],
      ["2026 소방공무원 봉급표 소방사~소방경 월급", "2026 소방 봉급표 소방사~소방경 월급"],
      ["2026 교사 호봉표 교원 봉급표·월급", "2026 교사 호봉표 유·초·중등 월급"],
    ];
    for (const [bad, old] of rejected) expect(emWidth(bad), bad).toBeGreaterThan(emWidth(old));
  });

  it.each(CASES)("$name: 광고 컴포넌트 순서 불변", ({ Page, ads }) => {
    expect(render(Page).ads).toEqual(ads);
  });

  it.each(CASES)("$name: Article headline·description 이 메타와 같다", ({ Page, meta }) => {
    const { jsonLd } = render(Page);
    const article = jsonLd.find((item) => item["@type"] === "Article");
    const m = metaStrings(meta);
    expect(article?.headline).toBe(m.title.replace(/ \| 머니샐러리$/, ""));
    expect(article?.description).toBe(m.description);
  });
});

describe("2027 공무원 봉급 — 3.9% 는 예산안 기준·확정 전으로만 표기", () => {
  it("description·리드·첫 FAQ 가 확정 전임을 밝히고, 9급 1호봉 예상치는 저연차 추가 인상 전 값", () => {
    const m = metaStrings(civilMeta);
    const g9h1 = won(forecast2027(GENERAL_PAY_ROWS_2026[0][1]));
    expect(m.description).toContain(`정부 예산안 ${pct}`);
    expect(m.description).toContain("확정 전");
    expect(m.description).toContain(`9급 1호봉 약 ${g9h1}(저연차 추가 인상 전)`);
    expect(m.title).toContain("예상");
    // title 에도 근거(예산안)를 남긴다 — 3.9% 가 확정 인상률처럼 읽히지 않게
    expect(m.title).toContain(`예산안 인상률 ${pct}`);

    const { body, jsonLd } = render(CivilPage);
    const faq = jsonLd.find((item) => item["@type"] === "FAQPage");
    const first = (faq?.mainEntity as { name: string; acceptedAnswer: { text: string } }[])[0];
    expect(first.name).toBe("2027년 공무원 인상률은 몇 %이고, 확정됐나요?");
    expect(first.acceptedAnswer.text).toContain("보도됐습니다");
    expect(first.acceptedAnswer.text).toContain("최종 봉급표는 아직 확정되지 않았습니다");
    expect(text(body)).toContain(first.acceptedAnswer.text);
    // 확정 봉급표처럼 읽히는 표현 금지
    expect(JSON.stringify(civilMeta) + text(body)).not.toMatch(/2027년? 공무원 봉급표 확정|3\.9% 확정/);
  });
});
