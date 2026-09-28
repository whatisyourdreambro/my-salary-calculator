// 서버 HTML·첫 클라이언트 렌더 날짜 고정 가드 (2026-09-28, 감사 S38)
//
// 정적 빌드 HTML 과 브라우저 첫 렌더가 다르면 React 18 은 텍스트 불일치 시 루트 전체를 클라이언트에서
// 다시 그린다. 렌더 중 오늘 날짜를 읽던 두 곳(/calc/annual-leave-days, /fun/escape-plan)을 effect 로
// 옮겼다 — 서버 렌더 결과가 시스템 시각과 무관해야 한다.
// (이 환경엔 DOM 렌더러가 없어 effect 는 돌지 않는다 — 서버 렌더 + 소스 계약으로 검증)

import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => createElement("aside", { "data-ad": "calc-result" }),
  InArticleAd: () => createElement("aside", { "data-ad": "in-article" }),
  GuideMidAd: () => createElement("aside", { "data-ad": "guide-mid" }),
}));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/ResultSharePanel", () => ({ default: () => null }));

import AnnualLeaveDaysClient from "@/app/calc/annual-leave-days/Client";
import AnnualLeaveDaysPage from "@/app/calc/annual-leave-days/page";
import EscapePlanPage from "@/app/fun/escape-plan/page";
import { fiscalYearSchedule, toISO, totalDays } from "@/lib/annualLeave";

function at(iso: string) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(iso));
}

afterEach(() => {
  vi.useRealTimers();
});

/** 인접 텍스트 노드 사이 <!-- --> 제거 */
const text = (html: string) => html.replace(/<!-- -->/g, "");

describe("/calc/annual-leave-days — 기준일 초기값은 page 가 넘긴 값", () => {
  // 빌드 12/31, 방문 1/2 — 회계연도 방식은 1/1 에 합계가 바뀌는 경계
  const BUILD = "2026-12-31";
  const VISIT = "2027-01-02T12:00:00Z";
  const ENTRY = "2023-03-02";

  it("서버 렌더가 시스템 시각과 무관하다 (하이드레이션 일치)", () => {
    at("2026-12-31T12:00:00Z");
    const atBuild = renderToStaticMarkup(createElement(AnnualLeaveDaysClient, { initialUntil: BUILD }));
    at(VISIT);
    const atVisit = renderToStaticMarkup(createElement(AnnualLeaveDaysClient, { initialUntil: BUILD }));
    expect(atVisit).toBe(atBuild);
  });

  it("기준일 입력값·합계가 initialUntil 기준이다", () => {
    at(VISIT);
    const html = text(renderToStaticMarkup(createElement(AnnualLeaveDaysClient, { initialUntil: BUILD })));
    const buildTotal = totalDays(fiscalYearSchedule(ENTRY, BUILD));
    const visitTotal = totalDays(fiscalYearSchedule(ENTRY, toISO(new Date())));
    expect(visitTotal).not.toBe(buildTotal); // 전제: 경계를 넘으면 합계 텍스트가 달라진다
    expect(html).toMatch(new RegExp(`id="al-until"[^>]*value="${BUILD}"`));
    expect(html).toContain(`회계연도(1/1) 방식 누적: ${buildTotal}일`);
    // 결과 직하 광고는 그대로 결과 카드 아래
    expect(html.indexOf('data-ad="calc-result"')).toBeGreaterThan(html.indexOf("회계연도(1/1) 기준 발생 내역"));
  });

  it("page 는 렌더 시각의 날짜를 initialUntil 로 넘긴다", () => {
    at(VISIT);
    const html = renderToStaticMarkup(createElement(AnnualLeaveDaysPage));
    expect(html).toMatch(new RegExp(`id="al-until"[^>]*value="${toISO(new Date())}"`));
  });

  it("Client 는 렌더 중 new Date() 를 부르지 않는다 (effect 안에서만)", () => {
    // 주석 속 설명 문구는 빼고 코드만 본다
    const source = readFileSync("src/app/calc/annual-leave-days/Client.tsx", "utf8").replace(/\/\/.*$/gm, "");
    const calls = [...source.matchAll(/new Date\(/g)].map((m) => m.index ?? -1);
    expect(calls).toHaveLength(1);
    const effect = /useEffect\(\(\) => \{[\s\S]*?\}, \[initialUntil\]\);/.exec(source);
    expect(effect).not.toBeNull();
    expect(effect![0]).toContain("new Date(");
  });
});

describe("/fun/escape-plan — 탈출 연도는 마운트 뒤 채움", () => {
  it("서버 렌더가 해 바뀜과 무관하고 연도 텍스트를 싣지 않는다", () => {
    at("2026-12-31T03:00:00Z");
    const before = renderToStaticMarkup(createElement(EscapePlanPage));
    at("2027-01-01T03:00:00Z");
    const after = renderToStaticMarkup(createElement(EscapePlanPage));
    expect(after).toBe(before);
    expect(text(before)).toContain("년 후");
    expect(text(before)).not.toMatch(/\(\d{4}년\)/);
    // 연도 칸 span 은 남겨 둔다 — 같은 flex 줄 안이라 채워져도 높이 변화 없음
    expect(before).toContain('<span class="text-sm text-white/60 ml-2"></span>');
  });
});
