// 기부금 세액공제 — 산출세액 상한 안내 회귀 가드 (2026-10-05 감사 code9-01)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calcDonationCredit2026, donationTaxCeiling2026 } from "@/lib/donationCredit";

describe("donationTaxCeiling2026", () => {
  it("총급여 3,000만·특례 2,000만 — 공제 450만원이 산출세액 최대 1,552,500원을 넘는다", () => {
    const r = calcDonationCredit2026({ grossSalary: 30_000_000, statutory: 20_000_000, general: 0, religious: 0, political: 0, hometown: 0 });
    expect(r.earnedIncomeAmount).toBe(20_250_000);
    expect(r.totalCredit).toBe(4_500_000);
    expect(donationTaxCeiling2026(r.earnedIncomeAmount)).toBe(1_552_500);
  });
  it("기본값(5,000만·일반 120만·고향사랑 10만)은 상한 아래 — 안내 줄이 뜨지 않는다", () => {
    const r = calcDonationCredit2026({ grossSalary: 50_000_000, statutory: 0, general: 1_200_000, religious: 0, political: 0, hometown: 100_000 });
    expect(r.totalCredit).toBeLessThan(donationTaxCeiling2026(r.earnedIncomeAmount));
  });
  it("화면 — 근거 문구는 한도 미반영, 초과 시 공제 안 되는 금액 줄", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/donation-tax-credit-2026/Client.tsx"), "utf8");
    expect(src).toContain("(산출세액 한도 미반영)");
    expect(src).not.toContain("(산출세액 한도 내 차감)");
    expect(src).toContain("ceilingExcess > 0 && (");
  });
  // 2026-11-01 B26: 산출세액을 넘어 공제받지 못한 특례·일반기부금분은 10년 이월공제(소득세법 제61조제2항 단서)라
  // 413091de5 원문 '공제·환급 안 됨' 은 영구 소멸처럼 읽혔다. 미공제분과 이월 대상을 함께, 원문보다 짧게 적는다.
  it("화면 — 초과분 줄은 미공제분과 특례·일반 이월을 함께 적고 원문보다 짧다", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/donation-tax-credit-2026/Client.tsx"), "utf8");
    const label = "산출세액(최대치) 초과 미공제분(특례·일반은 이월)";
    expect(src).toContain(`${label} = {fmt(ceilingExcess)}원 이상`);
    expect(src).not.toContain("공제·환급 안 됨");
    expect(label.length).toBeLessThan("산출세액(최대치)을 넘는 공제액 — 공제·환급 안 됨".length);
  });
  // 11/1 통합 스윕 수리: 결과 카드의 '한도 초과분 안내' 칸(CalcResultAd 위)은 종전 세 조건으로만 열린다. 초과분 줄은 접힌
  // '계산 근거 자세히 보기' 안이라 큰 기부 입력에서도 펼치기 전 결과 카드 높이가 종전과 같다.
  it("화면 — 한도 초과분 안내 칸은 종전 조건만, 초과분 줄은 접힌 근거 안 합계 줄 다음", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/donation-tax-credit-2026/Client.tsx"), "utf8");
    expect(src).toMatch(/result\.hometownExcess > 0\) && \(/);
    expect(src).not.toContain("result.hometownExcess > 0 ||");
    const details = src.indexOf("<details");
    const total = src.indexOf("(산출세액 한도 미반영)");
    const row = src.indexOf("ceilingExcess > 0 && (");
    expect(details).toBeGreaterThan(0);
    expect(total).toBeGreaterThan(details);
    expect(row).toBeGreaterThan(total);
    expect(row).toBeLessThan(src.indexOf("</details>"));
  });
});
