// /calc/severance-vs-pension 회귀 가드 (2026-10-05 감사 code6-02·code6-08)
// 출처: 소득세법 제129조 제1항 제5호의3 (시행 2026.1.1) — 퇴직소득을 연금수령하면 연금외수령 원천징수세율의
// 100분의 70 (실제 수령연차 10년 이하) / 60 (11~20년) / 50 (20년 초과). 제14조 제3항 제9호 가목 — 분리과세.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calculateSeveranceTax } from "@/lib/severanceCalculator";
import {
  compareSeveranceVsPension,
  deferredRetirementAnnuityTax,
  retirementIncomeTaxWithLocal,
} from "@/lib/severanceVsPension";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const DEFAULT = { salary: 60_000_000, years: 10, growth: 0.03, dcReturn: 0.04 };

describe("IRP 연금 수령 세금 = 이연퇴직소득세 × 70%", () => {
  it("기본값에서 연금 수령 쪽 세금이 일시 수령보다 적고 절세액이 양수다 (종전 '최대 +-1,025,408원')", () => {
    const r = compareSeveranceVsPension(DEFAULT);
    expect(r.dbAnnuityTax).toBe(Math.round(r.dbTax * 0.7));
    expect(r.dcAnnuityTax).toBe(Math.round(r.dcTax * 0.7));
    expect(r.dbAnnuityNet).toBeGreaterThan(r.dbNet);
    expect(r.dcAnnuityNet).toBeGreaterThan(r.dcNet);
    expect(r.maxAnnuitySaving).toBeGreaterThan(0);
    // 절세액 = 일시 수령 세금의 30% (DB·DC 중 큰 쪽)
    const expected = Math.max(r.dbTax - r.dbAnnuityTax, r.dcTax - r.dcAnnuityTax);
    expect(r.maxAnnuitySaving).toBe(expected);
  });

  it("어떤 입력에서도 절세액이 음수가 되지 않는다 (종전 4.4% 모델은 대부분 음수)", () => {
    for (const salary of [20_000_000, 40_000_000, 60_000_000, 100_000_000, 200_000_000]) {
      for (const years of [1, 3, 5, 10, 20, 30]) {
        const r = compareSeveranceVsPension({ salary, years, growth: 0.03, dcReturn: 0.04 });
        expect(r.maxAnnuitySaving).toBeGreaterThanOrEqual(0);
        expect(r.dbAnnuityTax).toBeLessThanOrEqual(r.dbTax);
        expect(r.dcAnnuityTax).toBeLessThanOrEqual(r.dcTax);
      }
    }
  });

  it("deferredRetirementAnnuityTax 는 70% 반올림", () => {
    expect(deferredRetirementAnnuityTax(1_849_924)).toBe(1_294_947);
    expect(deferredRetirementAnnuityTax(0)).toBe(0);
    expect(deferredRetirementAnnuityTax(-5)).toBe(0);
  });
});

describe("일시 수령 퇴직소득세는 정본 calculateSeveranceTax (8구간 — 종전 38%에서 멈춤)", () => {
  it("고액 퇴직금도 정본과 같은 값", () => {
    const amount = 3_000_000_000;
    const ref = calculateSeveranceTax(amount, 20 * 365, 20);
    expect(retirementIncomeTaxWithLocal(amount, 20)).toBe(ref.incomeTax + ref.localTax);
  });
  it("근속 1년 미만 끝수는 1년으로 절상(소득세법 제48조)", () => {
    expect(retirementIncomeTaxWithLocal(50_000_000, 2.5)).toBe(retirementIncomeTaxWithLocal(50_000_000, 3));
  });
});

describe("DB 마지막 해 연봉은 DC 적립 루프와 같은 기준 (code6-08)", () => {
  it("상승률·수익률 0 이면 DB = DC = 연봉/12 × 근속", () => {
    const r = compareSeveranceVsPension({ salary: 60_000_000, years: 10, growth: 0, dcReturn: 0 });
    expect(r.dbAmount).toBeCloseTo(50_000_000, 6);
    expect(r.dcAmount).toBeCloseTo(50_000_000, 6);
  });
  it("상승률 g 면 DB = 연봉/12 × (1+g)^(근속−1) × 근속", () => {
    const r = compareSeveranceVsPension({ salary: 60_000_000, years: 10, growth: 0.03, dcReturn: 0 });
    expect(r.dbAmount).toBeCloseTo(5_000_000 * Math.pow(1.03, 9) * 10, 4);
  });
});

describe("화면 문구 — 3.3~5.5% 연금소득세 오기 제거, 광고 위 문구 폭 유지", () => {
  const client = readSrc("src/app/calc/severance-vs-pension/Client.tsx");
  const page = readSrc("src/app/calc/severance-vs-pension/page.tsx");
  const counts = (s: string) => ({
    hangul: [...s].filter((c) => /[가-힣]/.test(c)).length,
    other: [...s].filter((c) => !/[가-힣]/.test(c)).length,
  });
  const notWider = (before: string, after: string) => {
    const a = counts(after);
    const b = counts(before);
    expect(a.hangul).toBeLessThanOrEqual(b.hangul);
    expect(a.other).toBeLessThanOrEqual(b.other);
  };
  it("계산기 결과 카드·인사이트 (결과 광고 위)", () => {
    expect(client).not.toContain("0.044");
    expect(client).not.toContain("3.3~5.5%");
    expect(client).toContain("퇴직소득세 30% 감면 (1~10년차 수령)");
    notWider("연 1,500만원 이하 저율 분리과세 (3.3~5.5%)", "퇴직소득세 30% 감면 (1~10년차 수령)");
    expect(client).toContain("일시 수령 대비 위 금액 이상 절세합니다.");
    notWider("일시 수령 대비 위 금액만큼 더 받습니다.", "일시 수령 대비 위 금액 이상 절세합니다.");
  });
  it("본문 표·목록 (본문 광고 위)", () => {
    expect(page).not.toContain(">3.3~5.5%</td>");
    expect(page).toContain(">30% 감면</td>");
    // 표 칸은 한글 2자를 새로 쓰지만 숫자·기호 5자가 빠져 폭이 좁아진다 (한글 1em, 숫자·기호 약 0.55em, 공백 0.25em)
    const em = (s: string) =>
      [...s].reduce((w, c) => w + (/[가-힣]/.test(c) ? 1 : c === " " ? 0.25 : 0.55), 0);
    expect(em("30% 감면")).toBeLessThan(em("3.3~5.5%"));
    expect(page).toContain("퇴직소득세의 70%만 과세 (이후 60~50%)");
    notWider(
      "연 1,500만원 이하 수령 시 연금소득세 3.3~5.5% (저율 분리과세)",
      "연금 수령 1~10년차는 퇴직소득세의 70%만 과세 (이후 60~50%)"
    );
    expect(page).not.toContain("연 1,500만원까지 3.3~5.5% 분리과세");
    expect(page).toContain("퇴직소득세의 70%(연금 수령 11~20년차는 60%, 21년차부터는 50%)");
  });
});
