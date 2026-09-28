// /monthly/[amount] 접힌 FAQ·박스 문장 정정 고정 (SEO 신선도 정비 2026-09-29, SG-09)
//
//  - 209시간은 '월 소정근로시간'이 아니라 주 소정근로 40시간 + 유급 주휴를 합친 월 환산 시간
//    (고용노동부 2027 최저임금 고시 news_seq=19744 '1주 소정근로 40시간, 월 209시간 기준', 최저임금법 시행령 §5)
//  - 주급은 /table/2026/weekly 정의(주휴 포함 48시간분)와 같은 값도 함께 준다
//  - 연금 상한 비교는 비과세 식대를 뺀 보수월액 기준으로 쓴다(월급 660만원 → 보수월액 640만원)
//  - 소득세가 간이세액표 기준임을 FAQ 에 밝힌다
//  - FAQ 는 기본으로 닫힌 <details> 라 광고 위 높이 변화 0, 박스 문장은 '소정근로'→'유급근로' 같은 네 글자 교체
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("not found"); } }));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/SalaryResultCard", () => ({ default: () => null }));
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => null, Display2Ad: () => null, GuideMidAd: () => null, HomeTopAd: () => null }));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/FavoritesButton", () => ({ default: () => null }));
vi.mock("@/app/table/2026/SeasonalLinks", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/RelatedCompanies", () => ({ default: () => null }));
vi.mock("@/components/ListedSalaryBandTable", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));
vi.mock("@/components/NextActions", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));

import MonthlyPage from "@/app/monthly/[amount]/page";
import { SALARY_MODEL_2026 } from "@/lib/salaryModelContent";

type Page = (p: { params: { amount: string } }) => ReactNode;
const render = (monthly: number) => renderToStaticMarkup(createElement(MonthlyPage as unknown as Page, { params: { amount: String(monthly) } }));
const unescape = (s: string) => s.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');

describe("/monthly FAQ 정정 (SG-09)", () => {
  const html = render(3_000_000);
  const text = unescape(html);

  it("209시간 용어와 주휴 포함 주급", () => {
    expect(text).toContain("월 209시간(주 소정근로 40시간+유급 주휴, 최저임금 월 환산과 같은 기준)으로 나누면 시급 약 14,354원입니다.");
    expect(text).toContain("주 40시간 근무분은 약 57만원이고, 주휴수당(8시간분)을 더한 주급은 약 69만원입니다(주급 실수령액 표와 같은 48시간분 기준).");
    expect(text).not.toContain("월 소정근로시간 209시간");
    expect(text).toContain("근로기준법 월 유급근로 209시간(주휴 포함) 기준입니다.");
    expect(text).not.toContain("월 소정근로 209시간");
  });

  it("소득세 간이세액표 기준을 FAQ 첫 답변에 밝힌다", () => {
    expect(text).toContain(`(비과세 식대 20만원, 본인 1인 공제 기준). ${SALARY_MODEL_2026.incomeTaxMethod}`);
  });

  it("연금 상한 비교는 비과세를 뺀 보수월액 기준 (월급 660만원)", () => {
    const t660 = unescape(render(6_600_000));
    expect(t660).toContain("월급 660만원에서 비과세 식대 20만원을 뺀 보수월액 640만원은 상한 미만이라 전액 부과 대상입니다.");
    expect(t660).not.toContain("월급 660만원은 상한 미만");
  });

  it("FAQ 는 기본으로 닫힌 <details> 안에 있다 (open 속성 없음)", () => {
    expect(html).toContain("<details");
    expect(html).not.toMatch(/<details[^>]*\bopen\b/);
  });
});
