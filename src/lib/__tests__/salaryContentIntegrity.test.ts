import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("not found"); } }));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/SalaryTable", () => ({ default: ({ data }: { data: { preTax: number; monthlyNet: number }[] }) => createElement("table", null, createElement("tbody", null, data.map(row => createElement("tr", { key: row.preTax, "data-annual": row.preTax }, createElement("td", null, row.monthlyNet))))) }));
vi.mock("@/components/TableHero", () => ({ default: ({ title, description }: { title: ReactNode; description: ReactNode }) => createElement("header", null, createElement("h1", null, title), createElement("p", null, description)) }));
vi.mock("@/components/SalaryResultCard", () => ({ default: ({ monthlyNet }: { monthlyNet: number }) => createElement("output", { "data-monthly-net": monthlyNet }, monthlyNet.toLocaleString("ko-KR")) }));
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => null, Display2Ad: () => null, GuideMidAd: () => null, HomeTopAd: () => null, InArticleAd: () => null, SidebarAd: () => null }));
vi.mock("@/components/FavoritesButton", () => ({ default: () => null }));
vi.mock("@/app/table/2026/SeasonalLinks", () => ({ default: () => null }));
vi.mock("@/components/SalaryTierCard", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/RelatedGuides", () => ({ default: () => null }));
vi.mock("@/components/RelatedCompanies", () => ({ default: () => null }));
vi.mock("@/components/ListedSalaryBandTable", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));
vi.mock("@/components/NextActions", () => ({ default: () => null }));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/WealthChartLazy", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/lib/relatedGuides", () => ({ getRelatedGuides: () => [] }));

import HomeSeoSection from "@/components/home/HomeSeoSection";
import JsonLd from "@/components/JsonLd";
import AnnualPage, { metadata as annualMetadata } from "@/app/table/2026/annual/page";
import MonthlyPage, { metadata as monthlyMetadata } from "@/app/table/2026/monthly/page";
import SalaryPage, { generateMetadata } from "@/app/salary/[amount]/page";
import { HOME_FAQ_ITEMS, HOME_HOWTO_DATA, HOME_META_DESCRIPTION, HOME_META_TITLE } from "@/lib/homeContent";
import { SALARY_CALCULATION_METHOD_HREF, SALARY_MODEL_2026 } from "@/lib/salaryModelContent";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";
import { faqLd } from "@/lib/structuredData";

type Structured = { "@type": string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[]; step?: { text: string }[] };
const structuredData = (html: string): Structured[] => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
const escapedText = (text: string) => renderToStaticMarkup(createElement("p", null, text)).slice(3, -4);
const annualHtml = () => renderToStaticMarkup(createElement(AnnualPage));
const monthlyHtml = () => renderToStaticMarkup(createElement(MonthlyPage));

describe("Salary explanation and result integrity", () => {
  it("shares supported-input and estimation language across default search and social metadata", () => {
    const source = readFileSync("src/app/layout.tsx", "utf8");
    expect(source.match(/description: HOME_META_DESCRIPTION/g)).toHaveLength(3);
    expect(source.match(/(?:default|title): HOME_META_TITLE/g)).toHaveLength(3);
    expect(HOME_META_TITLE).toContain("2026 연봉 계산기");
    expect(HOME_META_DESCRIPTION).toContain("비과세·부양가족");
    expect(HOME_META_DESCRIPTION).toContain("실제 급여와 차이");
    expect(JSON.stringify([HOME_META_DESCRIPTION, HOME_FAQ_ITEMS, HOME_HOWTO_DATA])).not.toMatch(/최신 세법|100가지|추가 공제 항목|주택담보대출 한도/);
    expect(HOME_HOWTO_DATA.steps[2].text).toContain("결과 확인하기를 누르면");
  });

  it("renders the same complete answers in the home FAQ and its JSON-LD source", () => {
    const body = renderToStaticMarkup(createElement(HomeSeoSection));
    const faq = structuredData(renderToStaticMarkup(createElement(JsonLd, { data: faqLd(HOME_FAQ_ITEMS) })))[0];
    expect(faq.mainEntity).toHaveLength(HOME_FAQ_ITEMS.length);
    for (const question of faq.mainEntity!) expect(body).toContain(escapedText(question.acceptedAnswer.text));
    expect(body).toContain(SALARY_MODEL_2026.incomeTaxMethod);
    expect(body).toContain(`href="${SALARY_CALCULATION_METHOD_HREF}"`);
  });

  // 2026-09-25 N3: /table/2026 은 2026 요율 고정, 상세(/salary)·홈 FAQ 는 현행 요율 포인터(src/config/currentRates.ts).
  // 지금(포인터 = 2026)은 두 값이 같고, 1/1 전환 뒤에는 표는 2026 값·상세와 홈은 현행 값으로 각각 맞는지 본다.
  it.each([[30_000_000, 224], [50_000_000, 357], [100_000_000, 653]])("keeps the %i example, table row, detail result and metadata on the same default inputs", async (annual, approximateManwon) => {
    const expected2026 = calculateSalary2026(annual, 200_000, 1, 0, INSURANCE_RATES_2026).netPay;
    expect(Math.round(expected2026 / 10_000)).toBe(approximateManwon);
    for (const html of [annualHtml(), monthlyHtml()]) {
      expect(html).toContain(`<tr data-annual="${annual}"><td>${expected2026}</td></tr>`);
      expect(html).toContain(SALARY_MODEL_2026.defaultConditions);
    }
    expect(annualMetadata.description).toContain(`약 ${approximateManwon}만원`);
    const expected = calculateSalary2026(annual, 200_000, 1, 0).netPay;
    const currentManwon = Math.round(expected / 10_000);
    const params = { amount: String(annual) };
    const detail = renderToStaticMarkup(createElement(SalaryPage, { params }));
    expect(detail).toContain(`data-monthly-net="${expected}"`);
    const description = (await generateMetadata({ params })).description;
    expect(description).toContain(`약 ${currentManwon}만원`);
    expect(description).toContain(SALARY_MODEL_2026.defaultConditions);
    if (annual < 100_000_000) expect(JSON.stringify(HOME_FAQ_ITEMS)).toContain(`약 ${currentManwon}만원`);
  });

  it.each([annualHtml, monthlyHtml])("keeps table FAQ visible and states the withholding-table income tax model", (render) => {
    const html = render();
    const faq = structuredData(html).find(item => item["@type"] === "FAQPage")!;
    for (const question of faq.mainEntity!) expect(html).toContain(escapedText(question.acceptedAnswer.text));
    const methodAnswer = faq.mainEntity!.find(item => item.name.includes("공제되는"))!.acceptedAnswer.text;
    expect(methodAnswer).toContain(SALARY_MODEL_2026.incomeTaxMethod);
    expect(methodAnswer).toContain(SALARY_MODEL_2026.limitation);
    // 2026-09-25 A17: 월 소득세가 근로소득 간이세액표 금액이 됐다 — 설명도 표 기준을 밝힌다
    expect(SALARY_MODEL_2026.incomeTaxMethod).toContain("간이세액표");
    expect(methodAnswer).not.toMatch(/연간 세액을 추정해 12개월로 나눈/);
    expect(html).toContain(`href="${SALARY_CALCULATION_METHOD_HREF}"`);
  });

  it("describes deductions actually present in the detail engine and preserves canonical/social image metadata", async () => {
    const html = renderToStaticMarkup(createElement(SalaryPage, { params: { amount: "50000000" } }));
    const howTo = structuredData(html).find(item => item["@type"] === "HowTo")!;
    const steps = JSON.stringify(howTo.step);
    expect(html).not.toContain("DSR 40% 규제 기준");
    expect(html).toContain("대출 가능 금액이나 DSR 심사 결과가 아닙니다");
    expect(steps).not.toMatch(/표준세액공제|70~5%|최종 세액을 결정/);
    expect(steps).toContain("간이세액표");
    expect(steps).toContain("근로소득세액공제");
    expect(steps).toContain("지방소득세");
    expect(steps).not.toMatch(/12개월로 나누고|연간 추정 세액/);
    const meta = await generateMetadata({ params: { amount: "50000000" } });
    expect(meta.alternates?.canonical).toBe("https://www.moneysalary.com/salary/50000000");
    expect(meta.openGraph?.description).toBe(meta.description);
    expect(meta.twitter?.description).toBe(meta.description);
    expect(JSON.stringify(meta.openGraph?.images)).toContain("type=salary&amount=50000000");
    expect(monthlyMetadata.description).toContain("자녀 0명");
  });

  it("keeps the changed home explanation inside the existing base Korean/Latin font ranges", () => {
    const source = readFileSync("src/app/fonts/siteFonts.generated.ts", "utf8");
    const ranges = [...source.matchAll(/const (latin|korean) = localFont\(\{[\s\S]*?prop: "unicode-range", value: "([^"]+)"/g)];
    const base = new Set<number>();
    for (const range of ranges) for (const part of range[2].split(",")) {
      const [first, last = first] = part.slice(2).split("-").map(value => parseInt(value, 16));
      for (let code = first; code <= last; code++) base.add(code);
    }
    expect(ranges).toHaveLength(2);
    const content = renderToStaticMarkup(createElement(HomeSeoSection)) + JSON.stringify([HOME_FAQ_ITEMS, HOME_HOWTO_DATA]);
    const missing = [...new Set([...content].filter(char => char.codePointAt(0)! > 127 && !base.has(char.codePointAt(0)!)))];
    expect(missing).toEqual([]);
  });
});
