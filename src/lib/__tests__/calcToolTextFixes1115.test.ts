// N2-calc-17 (R4, 2026-11-18): /calc 목록과 도구 쪽 문구·순서 정정 회귀.
//  · calc-02-F13 명절 상여·인센티브: 정기·비정기 구분 없이 과세 근로소득이면 4대보험 보수에 포함(국민연금 제외 문장 삭제).
//  · calc-02-F16 1/1 요율 전환 표면: 메타·하단 안내 연도와 명절 상여 FAQ 의 4대보험 예시가 현행 요율 포인터를 따른다
//    (오늘 출력은 종전 리터럴과 같고, 포인터 2027 모킹에서는 2027 문구·엔진 값이 된다).
import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { stub } = vi.hoisted(() => ({ stub: () => null }));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: stub, CalcResultAd: stub, GuideMidAd: stub, SidebarAd: stub, InArticleAd: stub,
  MultiplexAd: stub, Display2Ad: stub, ResultAd: stub,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: stub }));
vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push() {}, replace() {}, prefetch() {} }),
  useSearchParams: () => new URLSearchParams(),
}));

import { calcBonusNet } from "@/lib/bonusTaxCalc";
import { INSURANCE_RATES_BY_YEAR } from "@/config/currentRates";

const read = (p: string) => readFileSync(p, "utf8");
const html = async (load: () => Promise<{ default: () => unknown }>) =>
  renderToStaticMarkup(createElement((await load()).default as () => ReactNode)).replaceAll("<!-- -->", "");
const insuranceMan = (rates: (typeof INSURANCE_RATES_BY_YEAR)[keyof typeof INSURANCE_RATES_BY_YEAR]) => {
  const r = calcBonusNet(24_000_000, 1_000_000, 0, true, rates);
  return ((r.pensionDelta + r.healthDelta + r.empInsDelta) / 10_000).toFixed(1);
};

describe("calc-02-F13 명절 상여·인센티브 — 4대보험 정기·비정기 구분 없음", () => {
  it("/calc/holiday-bonus 본문 문단과 닫힌 FAQ 에 '국민연금 제외'·'정기 상여금으로 분류되면'이 없다", async () => {
    const out = await html(() => import("@/app/calc/holiday-bonus/page"));
    expect(out).not.toContain("국민연금 제외");
    expect(out).not.toContain("정기 상여금으로 분류되면");
    expect(out).toContain("명절 상여는 <strong>정기 상여금</strong>이든 <strong>비정기 격려금</strong>이든 과세 근로소득이면 4대보험 보수에 포함됩니다.");
    expect(out).toContain("건강·고용보험은 다음 해 보수총액 정산 때, 국민연금은 이후 기준소득월액 결정 때 반영됩니다.");
    expect(out).toContain("정기 상여든 비정기 격려금이든 과세되는 근로소득이면 소득세와 4대보험 보수에 모두 포함됩니다(국민연금법 시행령 제3조, 국민건강보험법 제70조).");
    // 계산기 자체도 상여에 연금을 매긴다 — 본문과 엔진이 같은 말을 한다
    expect(calcBonusNet(24_000_000, 1_000_000).pensionDelta).toBeGreaterThan(0);
  });

  it("/calc/incentive-tax 닫힌 FAQ 2 — 정기·비정기 여부와 관계없이 같은 근로소득", async () => {
    const out = await html(() => import("@/app/calc/incentive-tax/page"));
    expect(out).not.toContain("4대보험 부과 방식이 약간 다를 수 있지만");
    expect(out).toContain("회사가 어떤 명칭으로 부르든, 정기·비정기 여부와 관계없이 소득세와 4대보험 모두 같은 근로소득으로 처리됩니다.");
  });
});

describe("calc-02-F16 현행 요율 포인터 표면 — 오늘은 종전 문구 그대로", () => {
  it("명절 상여 FAQ 의 4대보험 예시는 엔진 값(오늘 약 9.7만원)", async () => {
    expect(insuranceMan(INSURANCE_RATES_BY_YEAR[2026])).toBe("9.7");
    const out = await html(() => import("@/app/calc/holiday-bonus/page"));
    expect(out).toContain("소득세 약 2만원 + 지방세 약 2천원 + 4대보험 약 9.7만원으로 실수령 약 88만원, 연봉 9,000만원이면 실수령 약 71만원입니다.");
    const { metadata } = await import("@/app/calc/holiday-bonus/page");
    expect(String(metadata.description)).toContain("2026년 세법 기준으로 계산합니다");
  });

  it("인센티브 메타·하단 안내는 2026", async () => {
    const { metadata } = await import("@/app/calc/incentive-tax/page");
    expect(String(metadata.description)).toContain("한국 소득세법 2026 기준으로");
    const out = await html(() => import("@/app/calc/incentive-tax/page"));
    expect(out).toContain("본 계산은 2026년 소득세법·조세특례제한법 기준이며 참고용입니다.");
  });

  it("두 쪽 소스에 바뀐 자리의 2026 리터럴이 남지 않는다", () => {
    const holiday = read("src/app/calc/holiday-bonus/page.tsx");
    expect(holiday).not.toContain("2026년 세법 기준으로 계산합니다");
    expect(holiday).not.toContain("4대보험 약 9.7만원");
    const incentive = read("src/app/calc/incentive-tax/page.tsx");
    expect(incentive).not.toContain("한국 소득세법 2026 기준");
    expect(incentive).not.toContain("본 계산은 2026년 소득세법");
  });
});

describe("calc-02-F16 1/1 전환 리허설 — 포인터 2027 모킹", () => {
  it("명절 상여 FAQ 는 2027 요율 엔진 값, 메타·인센티브 안내는 2027", async () => {
    vi.resetModules();
    vi.doMock("@/config/currentRates", async (importOriginal) => {
      const actual = await importOriginal<typeof import("@/config/currentRates")>();
      const rates = actual.INSURANCE_RATES_BY_YEAR[2027];
      return { ...actual, CURRENT_RATES_YEAR: 2027, CURRENT_INSURANCE_RATES: rates, CURRENT_RATE_LABELS: actual.rateLabels(rates), CURRENT_RATES_AS_OF: actual.RATES_AS_OF_BY_YEAR[2027] };
    });
    const expected = insuranceMan(INSURANCE_RATES_BY_YEAR[2027]);
    expect(expected).not.toBe("9.7");
    const holiday = await html(() => import("@/app/calc/holiday-bonus/page"));
    expect(holiday).toContain(`4대보험 약 ${expected}만원으로 실수령 약 88만원`);
    expect(String((await import("@/app/calc/holiday-bonus/page")).metadata.description)).toContain("2027년 세법 기준으로 계산합니다");
    expect(String((await import("@/app/calc/incentive-tax/page")).metadata.description)).toContain("한국 소득세법 2027 기준으로");
    expect(await html(() => import("@/app/calc/incentive-tax/page"))).toContain("본 계산은 2027년 소득세법·조세특례제한법 기준이며 참고용입니다.");
    // 실수령 예시(약 88만원·약 71만원)는 2027 요율에서도 같은 반올림값이다
    const r27 = calcBonusNet(24_000_000, 1_000_000, 0, true, INSURANCE_RATES_BY_YEAR[2027]);
    const r27high = calcBonusNet(90_000_000, 1_000_000, 0, true, INSURANCE_RATES_BY_YEAR[2027]);
    expect(Math.round(r27.net / 10_000)).toBe(88);
    expect(Math.round(r27high.net / 10_000)).toBe(71);
    vi.doUnmock("@/config/currentRates");
    vi.resetModules();
  });
});

describe("calc-04-F16 중소기업 감면 — 연장 횟수", () => {
  it("본문은 '세 차례'가 아니라 '수차례'(적용기한이 네 번 이상 늦춰짐)", async () => {
    const out = await html(() => import("@/app/calc/smb-income-tax-break/page"));
    expect(out).not.toContain("세 차례");
    expect(out).toContain("이 제도는 지금까지 수차례 연장되어 왔지만");
    expect(read("src/app/calc/smb-income-tax-break/page.tsx")).not.toContain("3회 연장");
    expect(read("src/lib/smbTaxBreak.ts")).not.toContain("3회 연장");
  });
});

describe("calc-01-F12 맞벌이 몰아주기 — 출처 문장 링크 앞 띄어쓰기", () => {
  it("두 링크 앞에 공백이 있고, 날짜는 같은 해의 '10월 26일'로 짧게(InArticleAd 위 줄 수 불변)", async () => {
    const out = await html(() => import("@/app/calc/dual-income-year-end/page"));
    const visible = out.replace(/<[^>]+>/g, "");
    expect(visible).toContain("2026-08-31 작성. 일반 자녀세액공제의 2026년 적용 연령·배분 입력은 10월 26일에 법률 제21548호 부칙 제2조와 소득세법 제53조를 대조해 수정했습니다.");
    expect(visible).not.toContain("에법률");
    expect(visible).not.toContain("와소득세법");
  });
});

describe("calc-01-F10 연차 개수 계산기 — 발생일 내림차순", () => {
  it("기본(입사 2023-03-02) 두 표 모두 발생일 내림차순, 행 수는 min(14, 전체) 그대로", async () => {
    const { default: Client } = await import("@/app/calc/annual-leave-days/Client");
    const { entryBasedSchedule, fiscalYearSchedule } = await import("@/lib/annualLeave");
    const until = "2026-11-18";
    const out = renderToStaticMarkup(createElement(Client, { initialUntil: until })).replaceAll("<!-- -->", "");
    const tables = [...out.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)].map((m) => [...m[1].matchAll(/<td[^>]*>(\d{4}-\d{2}-\d{2})<\/td>/g)].map((d) => d[1]));
    expect(tables.length).toBeGreaterThanOrEqual(2);
    const expectedLengths = [entryBasedSchedule("2023-03-02", until), fiscalYearSchedule("2023-03-02", until)].map((g) => Math.min(14, g.length));
    expect(tables.map((t) => t.length).sort()).toEqual([...expectedLengths].sort());
    for (const dates of tables) expect(dates).toEqual([...dates].sort().reverse());
    // 회계연도 표: 2024-01-01 비례연차가 2024-02-02·2024-01-02 아래로 내려간다
    const fiscal = tables.find((t) => t.includes("2024-02-02") && t.includes("2024-01-01"))!;
    expect(fiscal.indexOf("2024-02-02")).toBeLessThan(fiscal.indexOf("2024-01-01"));
  });
});

describe("calc-03-F14 /calc 오퍼 비교 카드", () => {
  it("BEST 대비가 아니라 첫 오퍼와 차액(도구는 첫 번째 입력 오퍼 기준)", () => {
    const src = read("src/app/calc/page.tsx");
    expect(src).not.toContain("BEST 대비");
    expect(src).toContain("오퍼 최대 10개 총보상을 동일 조건 세후 환산 — 월 실수령 순위·첫 오퍼와 차액");
    expect(read("src/components/SalaryComparator.tsx")).toContain("첫 번째로 입력한");
  });
});
