// /year-end-tax 환급액 서버 HTML 가드 (2026-09-28 감사 S12 — PERF-02 중 /year-end-tax 부분)
//
// 배경: react-countup 의 <CountUp> 은 마운트 전(서버 HTML·하이드레이션 첫 렌더)에 빈 <span></span> 을
// 렌더해, 계산기 핵심 수치인 '예상 환급액'이 프리렌더 HTML 에서 비어 있었다. SSR 에 실수치를 찍고
// 마운트 뒤에만 CountUp 을 재생하는 기존 AnimatedNumber 로 바꿨다(태그·클래스·높이 불변).
// A32(/year-end-tax 단일 페이지 실험, 10/17 시작) 전에만 반영 — 판정 창 안에서는 공식 날짜 외 문자열 금지.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/year-end-tax" }));

import AnimatedNumber from "@/components/AnimatedNumber";
import YearEndTaxCalculator from "@/components/YearEndTaxCalculator";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("AnimatedNumber 서버 렌더 계약", () => {
  it("서버 HTML 에 ko-KR 천 단위 구분 실수치를 span 하나로 찍는다", () => {
    expect(renderToStaticMarkup(createElement(AnimatedNumber, { value: 1234567 }))).toBe("<span>1,234,567</span>");
    expect(renderToStaticMarkup(createElement(AnimatedNumber, { value: 0 }))).toBe("<span>0</span>");
  });
});

describe("/year-end-tax 예상 환급액은 서버 HTML 에서 비어 있지 않다", () => {
  it("결과 카드 수치가 빈 span 이 아니라 실수치", () => {
    const html = renderToStaticMarkup(createElement(YearEndTaxCalculator));
    expect(html).not.toContain("<span></span>");
    const figure = /<p class="text-3xl[^"]*">([\s\S]*?)<\/p>/.exec(html)?.[1];
    expect(figure).toMatch(/^<span>\d{1,3}(?:,\d{3})*<\/span> 원$/);
  });

  it("소스: react-countup 직접 사용 없이 AnimatedNumber 에 정수를 넘긴다 (소수점 표시 방지)", () => {
    const src = read("src/components/YearEndTaxCalculator.tsx");
    expect(src).not.toContain("react-countup");
    expect(src).toContain('import AnimatedNumber from "./AnimatedNumber";');
    expect(src).toContain("<AnimatedNumber value={Math.round(Math.abs(result.finalRefund))} duration={0.5} /> 원");
  });
});
