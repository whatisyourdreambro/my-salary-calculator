// src/lib/__tests__/wageConversion.test.ts
//
// S2-1 "계산 정확성 3건" (docs/next-upgrade-plan-2026-09-11.md §3) 회귀 가드.
//   SI-07: 퀵 계산기 표시 공식 = compute (복리·근로소득세 간이·퇴직금 간이)
//   SI-08: 최저임금·실업급여 상수는 정본(src/config/*) 한곳에서만 나온다
//   SI-04: 시급↔월급 환산은 209시간(MONTHLY_HOURS) 단일 기준 — 4.345주 곱 폐기
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getCalculatorBySlug } from "@/lib/simpleCalculators";
import { MINIMUM_WAGE_2026, MINIMUM_WAGE_2027, MONTHLY_HOURS } from "@/config/minimumWage";
import {
  UNEMPLOYMENT_BENEFIT_2026,
  unemploymentDailyLowerBound,
} from "@/config/unemploymentBenefit";
import { MONTHLY_ORDINARY_HOURS } from "@/lib/ordinaryWage";
import { isStaticSalaryAmount } from "@/lib/salaryStaticParams";

function run(slug: string, overrides: Record<string, number> = {}) {
  const def = getCalculatorBySlug(slug);
  if (!def) throw new Error(`calculator not found: ${slug}`);
  const input: Record<string, number> = {};
  for (const f of def.fields) input[f.name] = f.defaultValue;
  return { def, result: def.compute({ ...input, ...overrides }) };
}

function secondaryValues(result: { secondary?: { value: number }[] }) {
  return (result.secondary ?? []).map((s) => s.value);
}

const readSrc = (rel: string) => readFileSync(path.resolve(process.cwd(), rel), "utf8");

// ─────────────────────────────────────────────────────────────
// SI-07 — 표시 공식이 compute 와 같은 산식을 말해야 한다 (출력은 불변)
// ─────────────────────────────────────────────────────────────
describe("SI-07 — 퀵 계산기 표시 공식 = compute", () => {
  it("compound-interest-quick: 월복리 + 월 적립 연금항 (finance.futureValue)", () => {
    const { def, result } = run("compound-interest-quick");
    expect(def.formula).toContain("월수익률 r = 연 수익률 ÷ 12");
    expect(def.formula).toContain("원금 × (1+r)ⁿ + 월 적립금 × ((1+r)ⁿ − 1) ÷ r");
    expect(def.formula).toContain("r = 0 이면 원금 + 월 적립금 × n");
    expect(def.formula).not.toContain("연수익률)^년수");
    // 기본값(1,000만·월 50만·연 7%·20년) 출력 불변
    expect(result.primary.value).toBe(300850718);
    expect(secondaryValues(result)).toEqual([130000000, 170850718]);
  });

  it("earned-income-tax-quick: 연 과세표준 재구성 → 누진세율 − 세액공제 → ÷ 12", () => {
    const { def, result } = run("earned-income-tax-quick");
    const formula = def.formula ?? "";
    for (const phrase of [
      "연 총급여 = 월 급여 × 12",
      "근로소득공제",
      "인적공제(150만원 × 본인 포함 가족 수)",
      "연금보험료공제(총급여 × 4.75%, 기준소득월액 상한 적용)",
      "특별공제 근사",
      "2026 누진세율",
      "근로소득세액공제",
      "월 원천징수 추정 = 결정세액 ÷ 12",
    ]) {
      expect(formula).toContain(phrase);
    }
    expect(formula.endsWith("(지방소득세 10% 별도)")).toBe(true);
    // compute 는 간이세액표 비율을 쓰지 않는다 — 옛 문구가 되살아나면 실패
    expect(formula).not.toContain("간이세액표 비율");
    expect(def.caveats?.join("\n") ?? "").not.toContain("간이세액표 기반 단순 시뮬");
    // 기본값(월 400만·가족 1명) 출력 불변 — 2026-09-12 편집 전 실측 고정
    expect(result.primary.value).toBe(190125);
    expect(secondaryValues(result)).toEqual([19013, 2281500, 228150, 28010000]);
  });

  it("severance-pay-quick: 월급 × 근속연수 간이식 + 정밀 계산기 안내", () => {
    const { def, result } = run("severance-pay-quick");
    expect(def.formula).toContain("퇴직금 ≈ 최근 3개월 평균 월급 × 근속연수");
    expect(def.formula).toContain("실제는 1일 평균임금 × 30일 × 재직일수 ÷ 365");
    expect(def.formula).not.toContain("http");
    expect(def.formula).not.toContain("/tools/");
    const caveats = def.caveats ?? [];
    expect(caveats.some((c) => c.includes("1~2% 낮게") && c.includes("/tools/finance/severance"))).toBe(
      true
    );
    // 기본값(월 350만·5년) 출력 불변
    expect(result.primary.value).toBe(17500000);
  });
});

// ─────────────────────────────────────────────────────────────
// SI-08 — 최저임금·실업급여 상수 정본 (값 동일 → 출력 불변)
// ─────────────────────────────────────────────────────────────
describe("SI-08 — 최저임금·실업급여 상수 정본", () => {
  it("MONTHLY_HOURS = 209 이고 통상임금 기준시간(ordinaryWage)과 한 값", () => {
    expect(MONTHLY_HOURS).toBe(209);
    expect(MONTHLY_ORDINARY_HOURS).toBe(MONTHLY_HOURS);
  });

  it("MINIMUM_WAGE_2026: 시급 10,320 · 월 2,156,880 · 연 25,882,560 (2027: 10,700)", () => {
    expect(MINIMUM_WAGE_2026.hourly).toBe(10320);
    expect(MINIMUM_WAGE_2026.monthly).toBe(2156880);
    expect(MINIMUM_WAGE_2026.yearly).toBe(25882560);
    expect(MINIMUM_WAGE_2027.hourly).toBe(10700);
  });

  it("실업급여 하한 = 최저시급 × 80% × 8h = 66,048 · 상한 68,100 > 하한", () => {
    expect(UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER).toBe(68100);
    expect(UNEMPLOYMENT_BENEFIT_2026.LOWER_RATE).toBe(0.8);
    expect(
      Math.round(MINIMUM_WAGE_2026.hourly * 8 * UNEMPLOYMENT_BENEFIT_2026.LOWER_RATE)
    ).toBe(66048);
    expect(Math.round(unemploymentDailyLowerBound())).toBe(66048);
    expect(UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER).toBeGreaterThan(unemploymentDailyLowerBound());
    // /unemployment-benefit 은 시간 입력을 그대로 곱한다 — 종전 식(10320 × 0.8 × h)과 비트 단위 동일
    for (const h of [8, 7, 6.5, 4, 3.25]) {
      expect(unemploymentDailyLowerBound(h)).toBe(10320 * 0.8 * h);
    }
  });

  it("실업급여 소비자 2곳이 config 를 import 하고 계산용 로컬 리터럴을 갖지 않는다 (source scan)", () => {
    for (const rel of [
      "src/app/unemployment-benefit/UnemploymentBenefitContent.tsx",
      "src/lib/simpleCalculators/batch2.ts",
    ]) {
      const src = readSrc(rel);
      expect(src, rel).toMatch(/from "@\/config\/unemploymentBenefit"/);
      expect(src, rel).not.toMatch(/=\s*68100\b/);
      expect(src, rel).not.toMatch(/\b10320\s*\*/);
    }
  });

  it("config 2종은 서버 전용 의존성이 없다 (클라이언트 컴포넌트가 import 해도 안전)", () => {
    expect(readSrc("src/config/minimumWage.ts")).not.toMatch(/^\s*import\s/m);
    const ub = readSrc("src/config/unemploymentBenefit.ts");
    const imports = [...ub.matchAll(/^\s*import\s[^;]*from\s+"([^"]+)"/gm)].map((m) => m[1]);
    expect(imports).toEqual(["./minimumWage"]);
  });

  it("unemployment-benefit 퀵 계산기 기본값 출력 불변", () => {
    const { result } = run("unemployment-benefit");
    expect(result.primary.value).toBe(9907200);
    expect(secondaryValues(result)).toEqual([66048, 150, 1981440]);
  });

  it("시급 입력 퀵 계산기 2종의 기본 시급 = 정본 최저시급", () => {
    for (const slug of ["hourly-to-yearly", "holiday-allowance-quick"]) {
      const def = getCalculatorBySlug(slug);
      expect(def?.fields[0]?.name, slug).toBe("hourly");
      expect(def?.fields[0]?.defaultValue, slug).toBe(MINIMUM_WAGE_2026.hourly);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// SI-04 — 월 환산은 209시간(MONTHLY_HOURS) 단일 기준 (2026-09-12 출력 변경)
//   종전 4.345주 곱은 주 48시간 기준 208.56시간 → 최저임금 월 2,156,880원과
//   4,541원(0.2%) 어긋났고, 시급 10,320 → 연봉 → 시급 왕복이 10,298 로 돌아왔다.
// ─────────────────────────────────────────────────────────────
describe("SI-04 — 시급↔월급 환산 209시간 통일", () => {
  it("hourly-to-yearly 기본값(10,320·주 40h): 25,882,560 / 2,156,880 / 209h / 주휴 미포함 21,568,800", () => {
    const { result } = run("hourly-to-yearly");
    expect(result.primary.value).toBe(25882560);
    expect(secondaryValues(result)).toEqual([2156880, 209, 21568800]);
  });

  it("최저임금 왕복: 연봉 ÷ 12 ÷ 209 = 10,320 정확히, 연봉은 정적 /salary 집합에 포함", () => {
    const yearly = run("hourly-to-yearly", { hourly: MINIMUM_WAGE_2026.hourly, weekHours: 40 })
      .result.primary.value;
    expect(yearly).toBe(MINIMUM_WAGE_2026.yearly);
    expect(yearly / 12 / MONTHLY_HOURS).toBe(MINIMUM_WAGE_2026.hourly);
    expect(isStaticSalaryAmount(yearly)).toBe(true);
    // 2027 시급도 같은 식으로 정확히 왕복한다
    const yearly2027 = run("hourly-to-yearly", { hourly: MINIMUM_WAGE_2027.hourly, weekHours: 40 })
      .result.primary.value;
    expect(yearly2027).toBe(MINIMUM_WAGE_2027.yearly);
  });

  it("주 20시간(주휴 4h) → 월 104.5시간 = 24h × 209 ÷ 48 (부분 주휴도 209 비례)", () => {
    const { result } = run("hourly-to-yearly", { hourly: 10320, weekHours: 20 });
    expect(secondaryValues(result)[1]).toBe(104.5);
    expect(secondaryValues(result)[0]).toBe(1078440);
  });

  it("yearly-to-hourly 기본값(5,000만·주 40h): 시급 23,923 / 주급 956,938 / 월급 4,166,667", () => {
    const { result } = run("yearly-to-hourly");
    expect(result.primary.value).toBe(23923);
    expect(secondaryValues(result)).toEqual([956938, 4166667]);
  });

  it("weekly-pay 기본값(300만): 주급 688,995 / 일급 137,799", () => {
    const { result } = run("weekly-pay");
    expect(result.primary.value).toBe(688995);
    expect(secondaryValues(result)).toEqual([137799]);
  });

  it("holiday-allowance-quick 기본값(10,320): 주 82,560 / 월 359,480 — 라벨은 209시간 기준", () => {
    const { result } = run("holiday-allowance-quick");
    expect(result.primary.value).toBe(82560);
    expect(secondaryValues(result)).toEqual([359480]);
    expect(result.secondary?.[0]?.label).toBe("월 환산분 (209시간 기준)");
  });

  it("환산 계산 파일 2곳의 계산 라인에 4.345 가 남아 있지 않다 (주석 제외 source scan)", () => {
    for (const rel of [
      "src/lib/simpleCalculators/batch1.ts",
      "src/app/weekly-holiday-allowance-2026/WeeklyHolidayAllowanceClient.tsx",
    ]) {
      const offenders = readSrc(rel)
        .split(/\r?\n/)
        .map((line, i) => ({ line, no: i + 1 }))
        .filter(({ line }) => line.includes("4.345") && !/^\s*(\/\/|\*|\/\*|\{\/\*)/.test(line));
      expect(offenders, rel).toEqual([]);
      expect(readSrc(rel), rel).toMatch(/\bMONTHLY_HOURS\b/);
    }
  });

  it("환산 설명(yearly-to-hourly·weekly-pay)의 공식이 209 ÷ 48 기준으로 바뀌었다", () => {
    for (const slug of ["yearly-to-hourly", "weekly-pay"]) {
      const def = getCalculatorBySlug(slug);
      expect(def?.formula, slug).toContain("209 ÷ 48");
      expect(def?.formula, slug).not.toContain("4.345");
      expect(def?.explanation, slug).toContain("4.354");
    }
  });
});
