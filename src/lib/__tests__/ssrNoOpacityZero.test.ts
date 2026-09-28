// framer-motion 진입 애니메이션의 opacity:0 서버 HTML 전송 가드 (2026-09-28 감사 S13 — PERF-01)
//
// 배경: motion 요소의 initial={{ opacity: 0, … }} 은 서버 HTML 에 style="opacity:0;transform:…" 로 찍혀,
// 하이드레이션(framer 청크 로드·실행) 전까지 본문이 보이지 않는다. 프리렌더 car-loan.html 에만 30곳
// (본문 약 87%), fire-calculator·도구 결과 카드들에도 있었다. 고친 방식:
//  - car-loan 입력 패널·적정 예산 카드·차종 그룹, 성과급 세금 계산기 히어로: initial={false}
//    (car-loan 히어로의 기존 방식과 같음 — 서버 HTML 에 최종 상태를 찍고 첫 진입 애니메이션만 생략).
//  - fire-calculator 단계 전환·성과급 결과 카드·성과급 비교 표의 AnimatePresence: initial={false}
//    (첫 렌더만 애니메이션 생략, 단계·결과·탭 전환 애니메이션은 그대로).
//  - 도구 결과 카드 9곳과 수학 계산기 탭 패널: motion.div → div + tailwindcss-animate 클래스
//    (자바스크립트 없이 CSS 로 300ms 진입, key 로 결과가 바뀔 때마다 재생). 태그·기존 클래스 유지,
//    클래스는 더하기만 — 자동광고 학습 경로(선택자) 불변.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type ComponentType, type ReactNode } from "react";
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
import FireCalculatorPage from "@/app/fire-calculator/page";
import BonusCalculatorPage from "@/app/tools/finance/bonus/page";
import SeverancePage from "@/app/tools/finance/severance/page";
import CompoundPage from "@/app/tools/finance/compound/page";
import InstallmentPage from "@/app/tools/finance/installment/page";
import FreelanceTaxPage from "@/app/tools/finance/freelance-tax/page";
import StockTaxPage from "@/app/tools/finance/stock-tax/page";
import DividendTaxPage from "@/app/tools/finance/dividend-tax/page";
import AcquisitionTaxPage from "@/app/tools/real-estate/acquisition-tax/page";
import GiftTaxPage from "@/app/tools/real-estate/gift-tax/page";
import IRPCalculatorClient from "@/app/tools/finance/irp/IRPCalculatorClient";
import MathCalculators from "@/components/calculators/MathCalculators";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const OPACITY_ZERO = /opacity:\s*0(?:[;"}]|$)/;
const ENTER = "animate-in fade-in-0 slide-in-from-bottom-2 duration-300";

const PAGES: [string, ComponentType][] = [
  ["/car-loan", CarLoanPage],
  ["/fire-calculator", FireCalculatorPage],
  ["/tools/finance/bonus", BonusCalculatorPage],
  ["/tools/finance/severance", SeverancePage],
  ["/tools/finance/compound", CompoundPage],
  ["/tools/finance/installment", InstallmentPage],
  ["/tools/finance/freelance-tax", FreelanceTaxPage],
  ["/tools/finance/stock-tax", StockTaxPage],
  ["/tools/finance/dividend-tax", DividendTaxPage],
  ["/tools/real-estate/acquisition-tax", AcquisitionTaxPage],
  ["/tools/real-estate/gift-tax", GiftTaxPage],
  ["/tools/finance/irp (계산기)", IRPCalculatorClient],
  ["/tools/math (계산기)", MathCalculators],
];

describe("서버 HTML 에 opacity:0 진입 상태를 보내지 않는다", () => {
  it.each(PAGES)("%s", (_route, Page) => {
    const html = renderToStaticMarkup(createElement(Page));
    expect(html).not.toMatch(OPACITY_ZERO);
    expect(html).not.toMatch(/transform:translate[XY]\(-?\d/);
  });

  it("/car-loan 본문(입력 패널·적정 예산·차종 그룹)은 최종 상태로 렌더", () => {
    const html = renderToStaticMarkup(createElement(CarLoanPage));
    expect(html).toContain('class="bg-card rounded-2xl shadow-xl border border-border p-6 sticky top-24" style="opacity:1;transform:none"');
    expect(html).toContain("차량 구매 적정 예산");
    expect(html).not.toContain("translateY(20px)");
  });

  it("/fire-calculator 첫 화면(소개 단계)과 H1 이 보인다", () => {
    const html = renderToStaticMarkup(createElement(FireCalculatorPage));
    expect(html).toContain("FIRE 조기은퇴 계산기");
    expect(html).toContain("시뮬레이션 시작");
  });
});

describe("도구 결과 카드는 CSS 진입 애니메이션(태그·기존 클래스·key 유지)", () => {
  const CARD_FILES: [string, string][] = [
    ["src/app/tools/finance/severance/page.tsx", "rounded-2xl overflow-hidden border border-primary shadow-lg mb-6"],
    ["src/app/tools/finance/compound/page.tsx", "rounded-2xl overflow-hidden border border-primary shadow-lg mb-6"],
    ["src/app/tools/finance/installment/page.tsx", "rounded-2xl overflow-hidden border border-primary shadow-lg mb-8"],
    ["src/app/tools/finance/freelance-tax/page.tsx", "rounded-2xl overflow-hidden border border-primary shadow-lg mb-6"],
    ["src/app/tools/finance/stock-tax/page.tsx", "rounded-2xl overflow-hidden border border-primary shadow-lg mb-6"],
    ["src/app/tools/finance/dividend-tax/page.tsx", "rounded-2xl overflow-hidden border border-primary shadow-lg mb-6"],
    ["src/app/tools/real-estate/acquisition-tax/page.tsx", "rounded-2xl overflow-hidden border border-primary shadow-lg mb-6"],
    ["src/app/tools/real-estate/gift-tax/page.tsx", "rounded-2xl overflow-hidden border border-primary shadow-lg mb-6"],
    ["src/app/tools/finance/irp/IRPCalculatorClient.tsx", "mt-8 p-8 bg-primary rounded-xl text-center"],
    ["src/components/calculators/MathCalculators.tsx", ""],
  ];

  it.each(CARD_FILES)("%s", (file, classes) => {
    const src = read(file);
    expect(src).not.toMatch(/framer-motion|<motion\./);
    const cls = classes ? `${classes} ${ENTER}` : ENTER;
    expect(src).toMatch(new RegExp(`<div\\s+key=\\{[^}]+\\}\\s+className="${cls}"`));
  });

  it("서버 HTML 에 기존 클래스 뒤에 진입 클래스만 더해진다", () => {
    const html = renderToStaticMarkup(createElement(SeverancePage));
    expect(html).toContain(`<div class="rounded-2xl overflow-hidden border border-primary shadow-lg mb-6 ${ENTER}">`);
  });
});

describe("initial={false} 소스 가드", () => {
  it("car-loan 에 opacity 0 진입 initial 이 남아 있지 않다", () => {
    const src = read("src/app/car-loan/page.tsx");
    expect(src).not.toMatch(/initial=\{\{[^}]*opacity:\s*0/);
    // 히어로(기존) + 입력 패널·적정 예산 카드·차종 그룹
    expect(src.match(/<motion\.div\s+initial=\{false\}/g)).toHaveLength(4);
  });

  it("fire-calculator 단계 전환·성과급 결과 카드·비교 표 AnimatePresence 는 첫 렌더 애니메이션을 생략", () => {
    expect(read("src/app/fire-calculator/page.tsx")).toContain('<AnimatePresence mode="wait" initial={false}>');
    const bonus = read("src/app/tools/finance/bonus/page.tsx");
    expect(bonus.match(/<AnimatePresence mode="wait" initial=\{false\}>/g)).toHaveLength(2);
    // 히어로(배지·H1·설명)는 첫 화면이라 initial={false}
    const hero = bonus.slice(bonus.indexOf("{/* ── Hero ── */}"), bonus.indexOf("{/* ── 프리셋 ── */}"));
    expect(hero.match(/initial=\{false\}/g)).toHaveLength(3);
    expect(hero).not.toContain("opacity: 0");
  });
});
