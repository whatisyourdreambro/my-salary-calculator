// /calc/samsung-biologics-bonus 계산기 — 2026년 1월 OPI '지급 예상' 표기, 2025 하반기 TAI 기본값 100% -> 보도된 50% 수준 (R4 SAMSUNG, N2-calc-13 calc-03-F04, 2026-11-18)
//
// 2025 실적분 OPI(연봉 50%)는 2026년 1월에 지급됐다(이미 지난 일 — '예상' 아님). 2025 하반기 TAI 는 '50% 수준에 그친 바 있다'
// (쿠키뉴스 2026-06-11 https://www.kukinews.com/article/view/kuk202606110023, 2026-11-18 재확인 — 언론 한 곳이라 '수준·보도').
// 기본 결과(연봉 8,000만원): TAI 800만 -> 600만, 세전 4,800만 -> 4,600만, 세후 3,207만 -> 3,089만원.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calcBonusNet, DEFAULT_BONUS_CREDIT_RATE, fmtEok, fmtManwon } from "@/lib/bonusTaxCalc";

const client = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-biologics-bonus/Client.tsx"), "utf8");
const num = (name: string) => Number(client.match(new RegExp(`const ${name} = (\\d+)`))?.[1]);

describe("삼성바이오로직스 계산기 기본값·표기 (N2-calc-13 calc-03-F04)", () => {
  it("하반기 TAI 기본값 50, 상반기 100, 기본 연봉 8,000만원", () => {
    expect(num("TAI_H2_DEFAULT")).toBe(50);
    expect(num("TAI_H1_CONFIRMED")).toBe(100);
    expect(num("DEFAULT_SALARY_MANWON")).toBe(8000);
    expect(num("BASIC_RATIO")).toBe(20);
  });

  it("기본 결과 = TAI 600만원 · 세전 4,600만원 · 세후 3,089만원 (Client 와 같은 산식)", () => {
    const salaryWon = num("DEFAULT_SALARY_MANWON") * 10_000;
    const taiWon = (salaryWon / num("BASIC_RATIO")) * ((num("TAI_H1_CONFIRMED") + num("TAI_H2_DEFAULT")) / 100);
    const gross = salaryWon * 0.5 + taiWon;
    const tax = calcBonusNet(salaryWon, gross, DEFAULT_BONUS_CREDIT_RATE, true);
    expect(fmtManwon(taiWon)).toBe("600만원");
    expect(fmtEok(gross)).toBe("4,600만원");
    expect(fmtEok(tax.net)).toBe("3,089만원");
  });

  it("'지급 예상'·'확정치 미확정' 표기가 없다", () => {
    expect(client).toContain('hint: "2026-01 지급 · 아시아경제"');
    expect(client).not.toContain("지급 예상");
    expect(client).not.toContain("확정치 미확정");
    expect(client).not.toContain("보도 미확보");
    expect(client).toContain("2025년 50% 수준 보도");
    expect(client.replace(/\s*\r?\n\s*/g, " ")).toContain("하반기 50% 수준 보도 (쿠키뉴스 2026-06-11).");
  });
});
