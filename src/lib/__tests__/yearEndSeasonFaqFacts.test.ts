// 연말정산 시즌 쪽 접힌 FAQ·메타 설명 사실 정정 회귀 가드 (2026-11-01 PKG-20 — YE-01·YE-04 d/e·NEW-v05-calc-engines-1)
//
// 모두 접힌 <details> 답이나 <head> 설명이라 광고 위 높이와 무관하다(신용카드 FAQ 질문 한 줄만 더 짧게 바뀜).
// - 고향사랑기부금 10만원 초과 20만원 이하 40%: 조세특례제한법 제58조제1항제2호(법률 제21223호, 시행 2026-01-01,
//   부칙 제13조 '이 법 시행 이후 기부하는 경우부터') — law.go.kr 개정문 2026-11-01 확인. donationCredit 정본과 같은 값.
// - 연금계좌: 연금저축 600만원 한도, 퇴직연금(IRP) 합산 900만원 — IRP 만으로 900만원도 가능(소득세법 제59조의3).
// - /year-end-tax 메타 설명: 계산기에 없는 의료비 입력 대신 실제 입력(체크카드·IRP)을 적는다.
// - 신용카드 소비증가분 추가공제: 조세특례제한법 제126조의2제2항 각 호 외의 부분이 제7호를 2024년 과세연도로
//   한정하고 제7호도 2024년 사용분만 정한다(law.go.kr 현행 조문, 시행 2026-09-18, 2026-11-01 확인).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DONATION_CREDIT_2026 } from "@/lib/donationCredit";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("연말정산 대표 쪽 '달라지는 점' FAQ — 고향사랑 40% (YE-01)", () => {
  it.each(["src/app/year-end-tax/page.tsx", "src/app/year-end-tax-settlement-2026/page.tsx"])(
    "%s 접힌 FAQ 에 고향사랑 10만~20만원 구간 40%",
    (file) => {
      expect(read(file)).toContain("고향사랑기부금 10만원 초과 20만원 이하 구간 공제율은 2026년부터 40%입니다.");
      expect(DONATION_CREDIT_2026.HOMETOWN_RATE_MID).toBe(0.4);
    },
  );
});

describe("/year-end-tax 연금계좌 FAQ·메타 설명 (YE-04 e, NEW-v05-calc-engines-1)", () => {
  const src = read("src/app/year-end-tax/page.tsx");

  it("연금저축 600만원까지, IRP 합산 최대 900만원(IRP 단독 900만원 가능)", () => {
    expect(src).toContain("연금저축은 600만원까지, IRP를 합쳐 최대 900만원까지(IRP 단독 900만원 가능) 공제 대상입니다.");
    expect(src).not.toContain("IRP 추가 300만원");
  });

  it("메타 설명은 계산기에 있는 입력만 적는다 (의료비 입력 없음)", () => {
    expect(src).toContain("`총급여·신용카드·체크카드·연금저축·IRP·기부금 입력 → ");
    expect(src).not.toContain("총급여·신용카드·의료비·연금저축·기부금 입력");
    expect(read("src/components/YearEndTaxCalculator.tsx")).toContain("medicalExpenses: 0,");
  });
});

describe("/credit-card-deduction-2026 소비증가분 추가공제 연도 (YE-04 d)", () => {
  const src = read("src/app/credit-card-deduction-2026/page.tsx");

  it("법 조문대로 2024년 사용분만 — 2025년 사용분까지라는 옛 표기 없음", () => {
    expect(src).toContain("조세특례제한법 제126조의2 제2항 제7호에 2024년 사용분만 정해져 있어 2025년·2026년 사용분에는 적용되지 않습니다.");
    expect(src).not.toContain("2025년 사용분까지");
    expect(src).toContain('q: "소비증가분 추가공제는 2026년에도 받을 수 있나요?",');
  });
});
