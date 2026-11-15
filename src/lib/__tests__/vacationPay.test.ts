// /calc/vacation-pay 회귀 가드 (2026-10-05 감사 code7-01·code7-04)
// - 1일 통상임금 = 월 통상임금 ÷ 209시간 × 8시간 (근로기준법 시행령 제6조 — 사이트 정본 computeOrdinaryWage)
// - 세금·4대보험 = 성과급 정본 calcBonusNet (연봉에 수당을 얹은 결정세액 차이 + 보험료 추가분)
// - 연차수당의 평균임금 산입: 퇴직 전년도 발생분 미사용수당의 3/12 포함, 퇴직으로 비로소 지급사유가 생긴 수당은 제외
//   (고용노동부 빠른인터넷상담 201707140941334611000)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calcVacationPay } from "@/lib/vacationPay";
import { calcBonusNet } from "@/lib/bonusTaxCalc";
import { normalizeNumberDraft, numberDraftValue } from "@/lib/numberInput";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");

describe("연차수당 = 209시간 통상임금 × 일수, 공제는 calcBonusNet", () => {
  it("기본값 4,800만원·10일 — 1일 153,110원(종전 연봉÷240 = 200,000원)", () => {
    const r = calcVacationPay(48_000_000, 10);
    expect(Math.round(r.dailyWage)).toBe(153_110);
    expect(r.grossPay).toBe(1_531_100);
    const b = calcBonusNet(48_000_000, 1_531_100);
    expect(r.tax).toBe(b.incomeTaxDelta + b.localTaxDelta);
    expect(r.insurance).toBe(b.pensionDelta + b.healthDelta + b.empInsDelta);
    expect(r.net).toBe(r.grossPay - r.tax - r.insurance);
    // 감사 재계산값(세금 215,451·실수령 1,166,866)과 원 단위 반올림 1원 차 — 화면 세 칸이 서로 맞도록 반올림한 세금으로 실수령을 낸다
    expect(r.tax).toBe(215_452);
    expect(r.insurance).toBe(148_783);
    expect(r.net).toBe(1_166_865);
  });
  it("1일 통상임금은 어떤 연봉에서도 연봉 ÷ 313.5", () => {
    for (const s of [13_000_000, 30_000_000, 55_000_000, 90_000_000]) {
      expect(calcVacationPay(s, 1).dailyWage).toBeCloseTo(s / 313.5, 6);
    }
  });
  it("0일·0원·NaN 은 0", () => {
    expect(calcVacationPay(48_000_000, 0).net).toBe(0);
    expect(calcVacationPay(0, 10).grossPay).toBe(0);
    expect(calcVacationPay(Number.NaN, 10).net).toBe(0);
  });
});

describe("문구 — 연봉÷240 표기 제거, 광고 위 문구 폭 유지", () => {
  const client = readSrc("src/app/calc/vacation-pay/Client.tsx");
  const page = readSrc("src/app/calc/vacation-pay/page.tsx");
  const counts = (s: string) => ({
    hangul: [...s].filter((c) => /[가-힣]/.test(c)).length,
    other: [...s].filter((c) => !/[가-힣]/.test(c)).length,
  });
  const notWider = (before: string, after: string) => {
    expect(counts(after).hangul).toBeLessThanOrEqual(counts(before).hangul);
    expect(counts(after).other).toBeLessThanOrEqual(counts(before).other);
  };
  it("계산기에 240·고정 세율이 없다", () => {
    expect(client).not.toMatch(/salary \/ 240/);
    expect(client).not.toContain("0.085");
  });
  it("본문·면책 문구 (계산기 하단 광고 위)", () => {
    expect(page).toContain("간편 추정: 연봉 ÷ 12 ÷ 209 × 8.");
    notWider("간편 추정: 연봉 ÷ 240 (12개월 × 20일).", "간편 추정: 연봉 ÷ 12 ÷ 209 × 8.");
    expect(page).toContain("본 계산기는 통상시급 ≈ 월급/209 가정 추정치입니다.");
    notWider("본 계산기는 통상임금 ≈ 연봉/240 가정 추정치입니다.", "본 계산기는 통상시급 ≈ 월급/209 가정 추정치입니다.");
    expect(page).not.toContain("연봉을 240(12개월×20일)으로 나누어");
  });
  it("접힌 FAQ — 연차수당 평균임금 산입 3/12, 퇴직 시 발생분 제외", () => {
    expect(page).toContain("그 금액의 3/12이 퇴직금 평균임금 산정에 들어가므로");
    expect(page).not.toContain("퇴직 직전 3개월 외 시점에 받은 연차수당은 평균임금에 포함되지 않습니다");
  });
});

// 2026-11-15 감사 calc-04-F06: 일수 칸이 inputMode numeric 이라 NumberInput 이 점을 버려 반차 7.5일이 75일이 됐다
// (연봉 4,800만원이면 세전 1,148,325원이 맞는데 75일 11,483,254원이 나왔다). iOS 숫자 키패드에는 점 키도 없었다.
describe("연차 일수 칸 — 반차(소수) 입력", () => {
  const client = readSrc("src/app/calc/vacation-pay/Client.tsx");
  it("일수 칸은 decimal · 음수 금지 · 점 보존", () => {
    const tag = client.slice(client.indexOf('id="vp-days"') - 20, client.indexOf('aria-label="미사용 연차 일수"'));
    expect(tag).toContain('inputMode="decimal"');
    expect(tag).toContain("allowNegative={false}");
    expect(tag).toContain('replace(/[^0-9.]/g, "")');
    expect(tag).not.toContain('inputMode="numeric"');
  });
  it("NumberInput 정규화: 7.5·7. 은 남고, 두 번째 점과 음수는 거른다", () => {
    const opts = { allowDecimal: true, allowNegative: false };
    expect(normalizeNumberDraft("7.", opts)).toBe("7.");
    expect(normalizeNumberDraft("7.5", opts)).toBe("7.5");
    expect(numberDraftValue("7.5")).toBe("7.5");
    expect(normalizeNumberDraft("7.5.", opts)).toBeNull();
    expect(normalizeNumberDraft("-3", opts)).toBeNull();
    // 종전 설정(numeric → allowDecimal false)은 점을 거부해 다음 키 5 가 붙어 75 가 됐다
    expect(normalizeNumberDraft("7.", { allowDecimal: false, allowNegative: false })).toBeNull();
  });
  it("7.5일은 10일의 3/4 — 계산부는 소수 일수를 그대로 받는다", () => {
    const half = calcVacationPay(48_000_000, 7.5);
    expect(half.grossPay).toBe(1_148_325);
    expect(half.grossPay).toBeLessThan(calcVacationPay(48_000_000, 10).grossPay);
  });
});
