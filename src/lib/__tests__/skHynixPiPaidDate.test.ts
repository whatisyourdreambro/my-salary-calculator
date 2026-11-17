// SK하이닉스 2026 상반기 PI 지급일 7/30 — 원장 X-06 해소 (2026-11-18 R4 N2-calc-10 calc-04-F01·F11·F12·F21·F22)
//
// 파이낸셜뉴스 2026-07-26(https://www.fnnews.com/news/202607260555359670)·인사이트 2026-07-27 은 '오는 30일' 지급 예정으로 썼다.
// 옛 2026-07-28 은 2025년 상반기 PI 보도(이데일리 2025-07-23)와 같은 날짜였다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PI_2026 } from "@/app/calc/sk-hynix-bonus/psData";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const page = read("src/app/calc/sk-hynix-bonus/page.tsx");
const client = read("src/app/calc/sk-hynix-bonus/Client.tsx");

describe("SK하이닉스 2026 상반기 PI 지급일 (calc-04-F01)", () => {
  it("PI_2026.h1.paidDate 는 2026-07-30", () => {
    expect(PI_2026.h1.paidDate).toBe("2026-07-30");
    expect(PI_2026.h1.rate).toBe(150);
  });

  it("접힌 FAQ 는 7월 30일 지급 예정 보도로 쓴다(근거 표현 포함)", () => {
    expect(page).toContain("2026년 상반기 PI는 최대치인 월 기본급의 150%로, 7월 30일 지급 예정으로 보도됐습니다(파이낸셜뉴스 2026-07-26 등).");
    expect(page).not.toContain("7월 28일 급여와 함께 지급됐습니다");
  });
});

describe("SK하이닉스 접힌 FAQ·입력 위생 (calc-04-F11·F12·F21·F22)", () => {
  it("2025년분 PS+PI 3,264% 는 연봉 1억 기준 약 1억 6천만원(3,264% × 500만원 = 1억 6,320만원)", () => {
    expect(page).toContain("PS+PI 합계 3,264%로, 연봉 1억원 직원 기준 약 1억 6천만원 수준입니다.");
    expect(page).not.toContain("약 1억 5천만원 수준");
  });

  it("국민연금 상한은 기준소득월액", () => {
    expect(page).toContain("국민연금은 기준소득월액 상한(2026.7~2027.6 기준 연 7,908만원)");
    expect(page).not.toContain("보수월액 상한");
  });

  it("영업손실을 넣어도 PS 재원은 음수가 되지 않는다", () => {
    expect(client).toContain("const psPoolWon = Math.max(0, opiWon) * AGREEMENT_2026.poolRate;");
    expect(client).toMatch(/<NumberInput\s+allowNegative=\{false\}\s+type="number"\s+value=\{opiTrillion\}/);
  });

  it("세액공제 슬라이더 이름, 타결 안내 상자 이름", () => {
    expect(client).toContain('aria-label="추가 세액공제 가정 (%)"');
    expect(page).toContain('aria-label={STATUS === "ratified" ? "2026 임단협 타결 안내" : "2026 임단협 잠정합의 안내"}');
  });
});
