// /car-loan·/tools/finance/bonus 핵심 수치 서버 HTML 가드 (2026-09-28 감사 S12 — PERF-02)
//
// 배경: react-countup 의 <CountUp> 은 마운트 전(서버 HTML·하이드레이션 첫 렌더)에 빈 <span></span> 을
// 렌더한다. 프리렌더 car-loan.html 에 빈 span 89개(실수령 추정·적정 예산·차량별 월 할부금),
// tools/finance/bonus.html 에 1개(실수령 성과급 히어로 수치)가 있었다. SSR 에 실수치를 찍고 마운트 뒤에만
// CountUp 을 재생하는 기존 AnimatedNumber 로 바꿨다 — 태그·클래스·접미어('원') 불변, 재생 시간은
// 종전 값(car-loan 은 react-countup 기본 2초, 성과급 0.8초) 유지.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/dynamic", () => ({ default: () => function DynamicPlaceholder() { return createElement("div", { "data-dynamic-placeholder": true }); } }));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/AdPlacement", () => ({
  InArticleAd: () => createElement("aside", { "data-ad": "in-article" }),
  SidebarAd: () => createElement("aside", { "data-ad": "sidebar" }),
  GuideMidAd: () => createElement("aside", { "data-ad": "guide-mid" }),
  CalcResultAd: () => createElement("aside", { "data-ad": "calc-result" }),
}));
vi.mock("@/components/PageFooterAds", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/ResultSharePanel", () => ({ default: () => null }));

import CarLoanPage from "@/app/car-loan/page";
import BonusCalculatorPage from "@/app/tools/finance/bonus/page";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const won = (n: number) => Math.round(n).toLocaleString("ko-KR");

describe("/car-loan 서버 HTML 에 카운트업 수치가 실수치로 찍힌다", () => {
  const html = renderToStaticMarkup(createElement(CarLoanPage));

  it("빈 CountUp span 0개", () => {
    expect(html).not.toContain("<span></span>");
  });

  it("기본 입력(연봉 6,000만) 기준 실수령 추정·적정 예산이 보인다", () => {
    const monthly = Math.floor(60_000_000 / 12);
    expect(html).toContain(`<span>${won(monthly * 0.85)}</span> 원`);
    expect(html).toContain(`<span class="text-4xl font-bold"><span>${won(60_000_000 * 0.4)}</span></span>`);
    expect(html).toContain(`<span class="text-4xl font-bold"><span>${won(60_000_000 * 0.7)}</span></span>`);
  });

  it("차량 카드마다 월 할부금 실수치", () => {
    const payments = [...html.matchAll(/월 할부금<\/span><span class="font-bold text-lg"><span>([^<]*)<\/span>원<\/span>/g)].map((m) => m[1]);
    expect(payments.length).toBeGreaterThan(10);
    for (const p of payments) expect(p).toMatch(/^\d{1,3}(?:,\d{3})*$/);
  });
});

describe("/tools/finance/bonus 실수령 성과급 히어로 수치", () => {
  const html = renderToStaticMarkup(createElement(BonusCalculatorPage));

  it("빈 span 없이 아래 '세후 실수령액' 행과 같은 금액", () => {
    expect(html).not.toContain("<span></span>");
    const hero = /실수령 성과급 \(세후\)\s*<\/p><div class="text-5xl[^"]*"[^>]*>([\s\S]*?)<\/div>/.exec(html)?.[1];
    const total = /세후 실수령액<\/span><span[^>]*>([^<]*)원<\/span>/.exec(html)?.[1];
    expect(total).toMatch(/^-?\d{1,3}(?:,\d{3})*$/);
    expect(hero).toBe(`<span>${total}</span>원`);
  });
});

describe("소스 가드", () => {
  it.each(["src/app/car-loan/page.tsx", "src/app/tools/finance/bonus/page.tsx"])("%s: react-countup 직접 사용 없이 AnimatedNumber 에 정수를 넘긴다", (file) => {
    const src = read(file);
    expect(src).not.toContain("react-countup");
    expect(src).toContain('import AnimatedNumber from "@/components/AnimatedNumber";');
    const values = [...src.matchAll(/<AnimatedNumber value=\{([^}]*)\}/g)].map((m) => m[1]);
    expect(values.length).toBeGreaterThan(0);
    for (const v of values) expect(v).toMatch(/^Math\.round\(/);
  });
});
