// 현행 요율 포인터(src/config/currentRates.ts) 회귀 가드 — 2026-09-25 N3 (2027-01-01 전환 준비).
//
// 1) 포인터 구조: CURRENT_* 가 CURRENT_RATES_YEAR 한 줄에서만 파생되는지 (1/1 전환 = 그 한 줄).
// 2) 2027 정본: 국민연금 5.0%(법정 스케줄 확정)·건보 동결, 미확정 항목 상태 표기, 전환 전 확인 게이트.
// 3) 오늘(포인터 = 2026) 렌더 문구가 전환 준비 전 리터럴과 글자 하나 다르지 않은지 — 대표 3쪽
//    (/monthly/3000000 · /salary/50000000 · 홈) + 임베드 위젯. 전환 뒤에는 이 묶음만 건너뛴다.
// 4) 연도 고정 표면(/table/2026·2026 귀속·연도 표기 계산기)이 포인터와 무관하게 2026 요율인지.
// 전환 후 모습(2027 문구·금액)은 currentRatesDryRun2027.test.ts 가 포인터를 2027 로 바꿔 확인한다.
import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

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

import {
  CURRENT_INSURANCE_RATES,
  CURRENT_RATE_LABELS,
  CURRENT_RATES_YEAR,
  INSURANCE_RATES_BY_YEAR,
  pctLabel,
  rateLabels,
  type RateYear,
} from "@/config/currentRates";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";
import { INSURANCE_RATES_2027, INSURANCE_RATES_2027_STATUS } from "@/lib/taxConstants2027";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import {
  calculateNetSalary2026,
  calculateNetSalaryWithRates,
  CURRENT_NET_SALARY_RATES,
  NET_SALARY_RATES_2026,
  toNetSalaryRates,
} from "@/lib/calculator";
import { NET_SALARY_RATES_2027 } from "@/lib/generateData2027";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";
import { generateWeeklyPayTableData2026 } from "@/lib/generateData";
import { HOME_EXAMPLE_NET_MANWON, HOME_FAQ_ITEMS, HOME_HOWTO_DATA } from "@/lib/homeContent";
import { calcAnnualNet } from "@/app/salary-raise-2026/Client";
import { computeSmbTaxBreak } from "@/lib/smbTaxBreak";
import HomeSeoSection from "@/components/home/HomeSeoSection";
import MonthlyPage, { generateMetadata as monthlyMetadata } from "@/app/monthly/[amount]/page";
import SalaryPage, { generateMetadata as salaryMetadata } from "@/app/salary/[amount]/page";
import { GET as salaryWidget } from "@/app/widget/salary/route";

const YEARS: RateYear[] = [2026, 2027];
const adv = { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 };
const titleOf = (t: unknown) => (typeof t === "string" ? t : (t as { absolute: string }).absolute);

describe("현행 요율 포인터 — 1/1 전환은 CURRENT_RATES_YEAR 한 줄", () => {
  it("CURRENT_* 는 CURRENT_RATES_YEAR 의 연도 정본을 그대로 가리킨다 (값 복제 없음)", () => {
    expect(YEARS).toContain(CURRENT_RATES_YEAR);
    expect(CURRENT_INSURANCE_RATES).toBe(INSURANCE_RATES_BY_YEAR[CURRENT_RATES_YEAR]);
    expect(INSURANCE_RATES_BY_YEAR[2026]).toBe(INSURANCE_RATES_2026);
    expect(INSURANCE_RATES_BY_YEAR[2027]).toBe(INSURANCE_RATES_2027);
    expect(CURRENT_RATE_LABELS).toEqual(rateLabels(CURRENT_INSURANCE_RATES));
    expect(CURRENT_NET_SALARY_RATES).toEqual(toNetSalaryRates(CURRENT_INSURANCE_RATES));
  });

  it("포인터 한 줄은 런북·verify:tax 가 찾는 형식 그대로다", () => {
    const src = readFileSync("src/config/currentRates.ts", "utf8");
    const lines = src.split(/\r?\n/).filter((l) => l.startsWith("export const CURRENT_RATES_YEAR"));
    expect(lines).toEqual([`export const CURRENT_RATES_YEAR: RateYear = ${CURRENT_RATES_YEAR};`]);
  });

  it("엔진 기본값 = 포인터 요율 (calculateSalary2026)", () => {
    for (const annual of [24_000_000, 50_000_000, 150_000_000]) {
      expect(calculateSalary2026(annual)).toEqual(calculateSalary2026(annual, 200_000, 1, 0, CURRENT_INSURANCE_RATES));
    }
  });
});

describe("2027 요율 정본 (taxConstants2027)", () => {
  it("국민연금 근로자 5.0% — 국민연금법 개정(법률 제20903호) 법정 스케줄: 총 9.5%→10.0%", () => {
    expect(INSURANCE_RATES_2027.NATIONAL_PENSION).toBe(0.05);
    expect(INSURANCE_RATES_2027_STATUS.NATIONAL_PENSION).toBe("confirmed");
    expect(rateLabels(INSURANCE_RATES_2027).pensionTotal).toBe("10.0%");
  });

  it("건강보험 2027 동결(건정심 2026-09-08) — 2026 정본값 참조", () => {
    expect(INSURANCE_RATES_2027.HEALTH_INSURANCE).toBe(INSURANCE_RATES_2026.HEALTH_INSURANCE);
    expect(INSURANCE_RATES_2027_STATUS.HEALTH_INSURANCE).toBe("confirmed");
  });

  it("미확정(provisional) 항목은 2026 값을 준용한다", () => {
    for (const [key, status] of Object.entries(INSURANCE_RATES_2027_STATUS)) {
      if (status !== "provisional") continue;
      const k = key as keyof typeof INSURANCE_RATES_2027;
      expect({ key, value: INSURANCE_RATES_2027[k] }).toEqual({ key, value: INSURANCE_RATES_2026[k] });
    }
  });

  it("/table/2027 요율(NET_SALARY_RATES_2027)은 2027 정본에서 파생", () => {
    expect(NET_SALARY_RATES_2027).toEqual(toNetSalaryRates(INSURANCE_RATES_2027));
  });

  it("★ 전환 게이트: 포인터가 2027 이면 2027 요율 항목이 전부 confirmed 여야 한다", () => {
    const provisional = Object.entries(INSURANCE_RATES_2027_STATUS)
      .filter(([, s]) => s !== "confirmed")
      .map(([k]) => k);
    expect(CURRENT_RATES_YEAR === 2027 ? provisional : []).toEqual([]);
  });
});

describe("요율 표시 문구 (pctLabel · rateLabels)", () => {
  it("2026 문구는 종전 하드코딩 리터럴과 같다", () => {
    expect(rateLabels(INSURANCE_RATES_2026)).toEqual({
      pension: "4.75%",
      pensionTotal: "9.5%",
      health: "3.595%",
      healthTotal: "7.19%",
      ltcRatio: "13.14%",
      ltcOfIncome: "0.4724%",
      employment: "0.9%",
    });
  });

  it("2027 국민연금은 '5.0%' — 소수 한 자리는 남긴다", () => {
    expect(rateLabels(INSURANCE_RATES_2027).pension).toBe("5.0%");
    expect(pctLabel(0.01)).toBe("1.0%");
    expect(pctLabel(0.1)).toBe("10.0%");
  });
});

describe("홈 FAQ 예시 금액 — 연도별 값 = 엔진 출력", () => {
  it.each(YEARS)("%i 요율", (year) => {
    const rates = INSURANCE_RATES_BY_YEAR[year];
    for (const annual of [30_000_000, 50_000_000] as const) {
      const net = calculateSalary2026(annual, 200_000, 1, 0, rates).netPay;
      expect({ year, annual, manwon: Math.round(net / 10_000) }).toEqual({
        year,
        annual,
        manwon: HOME_EXAMPLE_NET_MANWON[year][annual],
      });
    }
  });
});

describe("연도 고정 표면 — 포인터와 무관하게 2026 요율", () => {
  it("/table/2026 연봉표·주급표는 2026 요율 명시 호출과 같다", () => {
    const row = generateAnnualSalaryTableData2026().find((r) => r.preTax === 50_000_000)!;
    expect(row.monthlyNet).toBe(calculateSalary2026(50_000_000, 200_000, 1, 0, INSURANCE_RATES_2026).netPay);
    const weekly = generateWeeklyPayTableData2026()[0];
    const annual = weekly.preTax * 52;
    const nonTaxable = Math.min(200_000, Math.floor(annual / 12));
    expect(weekly.monthlyNet).toBe(calculateSalary2026(annual, nonTaxable, 1, 0, INSURANCE_RATES_2026).netPay);
  });

  it("calculateNetSalary2026(/table/2026 주급·시급 인터랙티브)은 2026 고정", () => {
    expect(NET_SALARY_RATES_2026).toEqual(toNetSalaryRates(INSURANCE_RATES_2026));
    expect(calculateNetSalary2026(50_000_000, 2_400_000, 1, 0, adv)).toEqual(
      calculateNetSalaryWithRates(50_000_000, 2_400_000, 1, 0, adv, NET_SALARY_RATES_2026)
    );
  });

  it("/salary-raise-2026 은 2026 요율 고정", () => {
    expect(calcAnnualNet(50_000_000)).toBe(calculateSalary2026(50_000_000, 200_000, 1, 0, INSURANCE_RATES_2026).netPay * 12);
  });

  it("2026 귀속 연말정산·중소기업 감면 계산기는 2026 요율 상수를 직접 쓴다 (포인터 미사용)", () => {
    for (const file of [
      "src/lib/yearEndTaxCalculator.ts",
      "src/components/YearEndTaxCalculator.tsx",
      "src/app/widget/year-end-tax/route.ts",
      "src/app/calc/dual-income-year-end/Client.tsx",
      "src/lib/smbTaxBreak.ts",
    ]) {
      const src = readFileSync(file, "utf8");
      expect({ file, pointer: /from "@\/config\/currentRates"/.test(src) }).toEqual({ file, pointer: false });
      expect({ file, pinned: src.includes("INSURANCE_RATES_2026") }).toEqual({ file, pinned: true });
    }
    // 본문 검산 예시(연봉 3,000만 · 2026년 귀속 연금보험료공제 142만 5,000원)와 같은 요율
    expect(computeSmbTaxBreak({ annualSalary: 30_000_000, dependents: 1, breakType: "youth" }).taxBase).toBe(17_325_000);
  });
});

// ─────────────────────────────────────────────────────────────
// 오늘(포인터 = 2026) 렌더 문구 = 전환 준비 전 리터럴 (2026-09-25 58b8876d 렌더에서 발췌)
// ─────────────────────────────────────────────────────────────
describe.runIf(CURRENT_RATES_YEAR === 2026)("오늘 렌더 문구 불변 — 대표 3쪽 + 위젯", () => {
  it("/monthly/3000000 — 제목·설명·FAQ 요율 문장", async () => {
    const params = { amount: "3000000" };
    const html = renderToStaticMarkup(createElement(MonthlyPage as unknown as (p: { params: { amount: string } }) => ReactNode, { params }));
    expect(html).toContain(
      "세전 월급 300만원 기준 2026년 실수령액은 약 267만원입니다. 국민연금 4.75%, 건강보험 3.595%(+장기요양), 고용보험 0.9%와 근로소득세·지방소득세를 공제한 값입니다 (비과세 식대 20만원, 본인 1인 공제 기준)."
    );
    const meta = await monthlyMetadata({ params });
    expect(titleOf(meta.title)).toBe("월급 300만원 실수령액 — 세후 월 267만원 (2026 기준) | 머니샐러리");
    expect(meta.description).toBe(
      "세전 월급 300만원의 2026년 실수령액은 약 267만원. 4대보험·소득세 공제 내역, 상여금 포함 연봉 환산표, 시급·주급 환산까지 월급 기준으로 정리했습니다."
    );
  });

  it("/salary/50000000 — 제목·HowTo 4대보험 단계·FAQ", async () => {
    const params = { amount: "50000000" };
    const html = renderToStaticMarkup(createElement(SalaryPage as unknown as (p: { params: { amount: string } }) => ReactNode, { params }));
    expect(html).toContain(
      "비과세를 뺀 월 보수에 국민연금 4.75%(기준소득월액 상·하한 적용), 건강보험 3.595%, 고용보험 0.9%를 적용합니다. 장기요양보험은 건강보험료의 13.14%로 계산합니다."
    );
    expect(html).toContain("연봉 5,000만원의 2026년 예상 월 실수령액은 약 357만원입니다.");
    expect(html).toContain("연봉 5,000만원의 2026년 예상 월 수령액 계산 과정.");
    expect(html).toContain("2026 REPORT");
    const meta = await salaryMetadata({ params });
    expect(titleOf(meta.title)).toBe("연봉 5,000만원 실수령액 월 357만원 (2026 세후 월급) | 머니샐러리");
  });

  it("홈 — FAQ·HowTo·본문 요율 문장", () => {
    const faq = JSON.stringify(HOME_FAQ_ITEMS);
    expect(faq).toContain(
      "2026년 기준 근로자 부담 4대보험 요율: 국민연금 4.75%, 건강보험 3.595%, 장기요양보험(건강보험료의 13.14%), 고용보험 0.9%입니다. 회사가 동일하거나 더 높은 비율을 추가로 부담합니다."
    );
    expect(faq).toContain("연봉 5,000만원은 월 약 357만원입니다");
    expect(faq).toContain("연봉 3,000만원의 2026년 예상 월 실수령액은 약 224만원입니다");
    expect(faq).toContain("2026년 보험료율과 입력 조건을 적용한 추정 모델입니다.");
    expect(faq).toContain("2026년 계산 모델의 예상 월 실수령액을 확인할 수 있습니다.");
    expect(HOME_HOWTO_DATA.name).toBe("연봉 실수령액 계산하는 방법 (2026년)");
    const body = renderToStaticMarkup(createElement(HomeSeoSection));
    expect(body).toContain('<strong class="text-foreground">국민연금 4.75%</strong>');
    expect(body).toContain('<strong class="text-foreground">건강보험 3.595%</strong>(여기에 건강보험료의 13.14%가 장기요양보험으로 추가)');
    expect(body).toContain('<strong class="text-foreground">고용보험 0.9%</strong>입니다.');
    expect(body).toContain("2026년 연봉 실수령액, 이렇게 계산됩니다");
  });

  it("임베드 위젯 /widget/salary — 제목·안내 문구", async () => {
    const html = await (await salaryWidget()).text();
    expect(html).toContain("<title>2026 연봉 실수령액 계산기 — 머니샐러리</title>");
    expect(html).toContain('<p class="title">💰 2026 연봉 <span>실수령액</span> 계산기</p>');
    expect(html).toContain("2026년 세법 · 부양가족 1인 · 비과세 식대 월 20만원 기준 추정치입니다.");
  });
});
