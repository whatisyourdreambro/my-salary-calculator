// 1/1 요율 전환 리허설 — 포인터(src/config/currentRates.ts)를 2027 로 바꾼 상태를 모킹해, 한 줄 전환만으로
// 계산·문구가 함께 2027 로 넘어가고 연도 고정 표면은 2026 에 머무는지 확인한다 (2026-09-25 N3).
// 실제 전환(CURRENT_RATES_YEAR = 2027) 뒤에도 그대로 통과한다. 금액 기대값은 엔진에서 계산하므로
// 2027 장기요양·고용보험 요율이 확정돼 taxConstants2027 이 바뀌어도 이 파일은 고칠 필요가 없다.
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/config/currentRates", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/config/currentRates")>();
  const rates = actual.INSURANCE_RATES_BY_YEAR[2027];
  return {
    ...actual,
    CURRENT_RATES_YEAR: 2027,
    CURRENT_INSURANCE_RATES: rates,
    CURRENT_RATE_LABELS: actual.rateLabels(rates),
  };
});

const { stub } = vi.hoisted(() => ({ stub: () => null }));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: stub,
  CalcResultAd: stub,
  GuideMidAd: stub,
  SidebarAd: stub,
  InArticleAd: stub,
  MultiplexAd: stub,
  Display2Ad: stub,
  ResultAd: stub,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: stub }));
vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));
vi.mock("next/dynamic", () => ({ default: () => stub }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push() {}, replace() {}, prefetch() {} }),
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error("notFound");
  },
}));

import { CURRENT_RATES_YEAR } from "@/config/currentRates";
import { INSURANCE_RATES_2027 } from "@/lib/taxConstants2027";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { calcBonusNet, DEFAULT_BONUS_CREDIT_RATE } from "@/lib/bonusTaxCalc";
import { calculateNetSalary, calculateNetSalary2026 } from "@/lib/calculator";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";
import { krSocialInsurance } from "@/lib/global/taxEngine";
import { HOME_EXAMPLE_NET_MANWON, HOME_FAQ_ITEMS } from "@/lib/homeContent";
import { calcAnnualNet } from "@/app/salary-raise-2026/Client";
import MonthlyPage, { generateMetadata as monthlyMetadata } from "@/app/monthly/[amount]/page";
import SalaryPage, { generateMetadata as salaryMetadata } from "@/app/salary/[amount]/page";
import { GET as salaryWidget } from "@/app/widget/salary/route";

const adv = { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 };
const titleOf = (t: unknown) => (typeof t === "string" ? t : (t as { absolute: string }).absolute);
const manwon = (won: number) => Math.round(won / 10_000);

describe("1/1 전환 리허설 — 포인터 2027", () => {
  it("모킹이 적용됐다", () => {
    expect(CURRENT_RATES_YEAR).toBe(2027);
  });

  it("엔진 기본값이 2027 요율(국민연금 5.0%)로 바뀐다", () => {
    const r = calculateSalary2026(50_000_000);
    // 월 과세 보수 3,966,666.67원 × 5.0% → 10원 절사
    expect(r.nationalPension).toBe(198_330);
    expect(r).toEqual(calculateSalary2026(50_000_000, 200_000, 1, 0, INSURANCE_RATES_2027));
    expect(calcBonusNet(60_000_000, 10_000_000)).toEqual(
      calcBonusNet(60_000_000, 10_000_000, DEFAULT_BONUS_CREDIT_RATE, true, INSURANCE_RATES_2027)
    );
    expect(calcBonusNet(60_000_000, 10_000_000).pensionDelta).toBe(500_000);
    expect(calculateNetSalary(200_000_000, 0, 1, 0, adv).pension).toBe(Math.round(6_590_000 * 0.05));
    const g = 30_000_000;
    const r27 = INSURANCE_RATES_2027;
    expect(krSocialInsurance(g)).toBeCloseTo(
      (g / 12) * 12 * r27.NATIONAL_PENSION + g * r27.HEALTH_INSURANCE * (1 + r27.LONG_TERM_CARE_RATIO) + g * r27.EMPLOYMENT_INSURANCE,
      6
    );
  });

  it("연도 고정 표면은 2026 에 머문다 (/table/2026 · calculateNetSalary2026 · /salary-raise-2026)", () => {
    const row = generateAnnualSalaryTableData2026().find((x) => x.preTax === 50_000_000)!;
    expect(row.monthlyNet).toBe(3_571_546);
    expect(calculateNetSalary2026(200_000_000, 0, 1, 0, adv).pension).toBe(Math.round(6_590_000 * 0.0475));
    expect(calcAnnualNet(50_000_000)).toBe(3_571_546 * 12);
  });

  it("/monthly/3000000 — 제목·설명·FAQ 가 2027 연도·요율·금액으로 함께 바뀐다", async () => {
    const params = { amount: "3000000" };
    const net = manwon(calculateSalary2026(36_000_000, 200_000, 1, 0, INSURANCE_RATES_2027).netPay);
    const html = renderToStaticMarkup(createElement(MonthlyPage as unknown as (p: { params: { amount: string } }) => ReactNode, { params }));
    expect(html).toContain(
      `세전 월급 300만원 기준 2027년 실수령액은 약 ${net}만원입니다. 국민연금 5.0%, 건강보험 3.595%(+장기요양), 고용보험`
    );
    expect(html).not.toContain("국민연금 4.75%");
    const meta = await monthlyMetadata({ params });
    expect(titleOf(meta.title)).toBe(`월급 300만원 실수령액 — 세후 월 ${net}만원 (2027 기준) | 머니샐러리`);
  });

  it("/salary/50000000 — 제목·HowTo·FAQ 가 2027 로 함께 바뀐다", async () => {
    const params = { amount: "50000000" };
    const net = manwon(calculateSalary2026(50_000_000, 200_000, 1, 0, INSURANCE_RATES_2027).netPay);
    const html = renderToStaticMarkup(createElement(SalaryPage as unknown as (p: { params: { amount: string } }) => ReactNode, { params }));
    expect(html).toContain("비과세를 뺀 월 보수에 국민연금 5.0%(기준소득월액 상·하한 적용), 건강보험 3.595%");
    expect(html).toContain(`연봉 5,000만원의 2027년 예상 월 실수령액은 약 ${net}만원입니다.`);
    expect(html).toContain("2027 REPORT");
    expect(html).not.toContain("국민연금 4.75%");
    const meta = await salaryMetadata({ params });
    expect(titleOf(meta.title)).toBe(`연봉 5,000만원 실수령액 월 ${net}만원 (2027 세후 월급) | 머니샐러리`);
  });

  it("홈 FAQ — 2027 요율 문장과 2027 예시 금액", () => {
    const faq = JSON.stringify(HOME_FAQ_ITEMS);
    expect(faq).toContain("2027년 기준 근로자 부담 4대보험 요율: 국민연금 5.0%, 건강보험 3.595%");
    expect(faq).toContain(`연봉 5,000만원은 월 약 ${HOME_EXAMPLE_NET_MANWON[2027][50000000]}만원입니다`);
    expect(HOME_EXAMPLE_NET_MANWON[2027][50000000]).toBe(
      manwon(calculateSalary2026(50_000_000, 200_000, 1, 0, INSURANCE_RATES_2027).netPay)
    );
    expect(faq).not.toContain("4.75%");
  });

  it("임베드 위젯 — 2027 표기와 2027 요율 그리드", async () => {
    const html = await (await salaryWidget()).text();
    expect(html).toContain("<title>2027 연봉 실수령액 계산기 — 머니샐러리</title>");
    expect(html).toContain("2027년 세법 · 부양가족 1인");
    const grid = JSON.parse(/var GRID = (\[[^\]]*\]);/.exec(html)![1]) as number[];
    // 그리드 첫 칸 = 연봉 1,200만원(비과세 연 240만) 현행 요율 월 실수령
    expect(grid[0]).toBe(calculateNetSalary(12_000_000, 2_400_000, 1, 0, adv).monthlyNet);
  });
});
