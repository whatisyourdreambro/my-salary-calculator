// /calc/sk-innovation-bonus FY2025 실적분 지급 반영 — 보이지 않는 부분 (2026-11-15 N2-calc-09 calc-04-F04·F21·F22)
//
// SBS Biz 2026-02-22: SK이노베이션은 최근 실적·개인 성과에 따라 성과급을 지급했으나 규모는 전년보다 축소, 연간 적자를
// 낸 SK온은 미지급. 지급률은 보도되지 않았다(2026-11-15 재확인). 메타 설명·접힌 FAQ·주석만 — 첫 화면 변화 없음.
// 국민연금 상한은 기준소득월액(국민연금법 제3조, 2026.7~2027.6 월 659만원 = 보건복지부고시 제2026-31호)이다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/sk-innovation-bonus/page.tsx"), "utf8");
const client = readFileSync(resolve(process.cwd(), "src/app/calc/sk-innovation-bonus/Client.tsx"), "utf8");
const faqBlock = page.slice(page.indexOf("const FAQ_ITEMS"), page.indexOf("const HOW_TO_STEPS"));

describe("SK이노베이션 FY2025 실적분 — 메타·접힌 FAQ (calc-04-F04)", () => {
  it("메타 설명은 2026년 초 지급·지급률 미공개", () => {
    expect(page).toContain("FY2025 실적분(2026년 초 지급) 지급률 미공개.");
    expect(page).not.toContain("FY2025 실적분(2026년) 미확정.");
  });

  it("FAQ — 2026년 초 지급, SBS Biz 보도, SK온 미지급, 지급률 미보도. 즉시 반영 약속 없음", () => {
    expect(faqBlock).toContain("2026년 초 지급됐습니다. SBS Biz(2026-02-22) 보도에 따르면 전년보다 적은 규모였고, 연간 적자를 낸 SK온은 지급하지 않았습니다.");
    expect(faqBlock).toContain("FY2025 실적분(2026년)은 미공개입니다.");
    expect(faqBlock).not.toContain("미확정");
    expect(faqBlock).not.toContain("즉시 반영");
  });
});

describe("SK이노베이션 국민연금 상한 용어 (calc-04-F21)", () => {
  it("접힌 FAQ 는 기준소득월액 상한", () => {
    expect(faqBlock).toContain("국민연금은 기준소득월액 상한(2026.7~2027.6 기준 연 7,908만원)");
    expect(faqBlock).not.toContain("보수월액 상한");
  });
});

describe("SK이노베이션 입력 이름 (calc-04-F22)", () => {
  it("슬라이더 2개와 직접 입력 칸에 aria-label", () => {
    expect(client).toContain('aria-label="추가 세액공제 가정 (%)"');
    expect(client).toContain('aria-label="지급률 (월 기본급 대비 %)"');
    expect(client).toContain('aria-label="지급률 직접 입력 (%)"');
  });
});
