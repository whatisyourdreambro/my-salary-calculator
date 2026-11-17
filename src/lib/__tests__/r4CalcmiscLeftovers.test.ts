// R4 CALCMISC (2026-11-18) — 다음 게시 묶음이 남긴 선택 항목(leftovers.md).
//  · /calc/civil-servant-net-pay 산식·출처 각주: 공무원수당 등에 관한 규정의 현행 대통령령 번호(law.go.kr 2026-11-18 확인 —
//    제36728호, 2026-09-29 타법개정·2026-10-02 시행). 금액 조문은 2026-11-15 PAY 단위 재대조 그대로. 광고 위라 날짜를 빼 폭을 줄였다.
//  · /tools/finance/severance 마지막 광고 아래 설명 글: 입력칸 '퇴사일' = 마지막 근무일(엔진이 하루를 더해 퇴직일로 본다).
//    고용노동부 퇴직금 계산기의 '퇴직일자'는 마지막 근무일 다음 날(moel.go.kr retirementpayCal.do, 2026-11-18 확인).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PAY_PAGE_ALLOWANCE_SOURCE_2026 } from "@/lib/civilServantAllowances2026";
import { getToolExplainer } from "@/lib/toolExplainers";
import { calculateSeverancePay } from "@/lib/severanceCalculator";
import { calcLegalSeveranceResult } from "@/app/tools/finance/severance/legalSeverance";

const read = (p: string) => readFileSync(p, "utf8");

describe("공무원 실수령 계산기 각주 — 현행 대통령령 번호", () => {
  it("각주는 봉급표 페이지 수당 표와 같은 현행 번호(제36728호)를 쓰고 옛 번호(제36015호)는 화면에 없다", () => {
    const src = read("src/app/calc/civil-servant-net-pay/Client.tsx");
    expect(src).toContain(`수당: 공무원수당 등에 관한 규정(${PAY_PAGE_ALLOWANCE_SOURCE_2026.decree}) — 정액급식비 월 16만원(제18조)`);
    expect(src).not.toContain("제36015호");
    expect(PAY_PAGE_ALLOWANCE_SOURCE_2026.decree).toBe("대통령령 제36728호");
  });
});

describe("퇴직금 세금 계산기 설명 글 — 퇴사일은 마지막 근무일", () => {
  const e = getToolExplainer("/tools/finance/severance")!;
  it("설명 글이 있고(300~600자, 링크 없음) 퇴사일·고용노동부 퇴직일자·평균임금 산식을 적는다", () => {
    expect(e).toBeTruthy();
    const text = e.paragraphs.join("");
    expect(text.length).toBeGreaterThanOrEqual(300);
    expect(text.length).toBeLessThanOrEqual(600);
    expect(e.paragraphs[0]).toContain("퇴사일 칸에는 마지막으로 근무한 날을 넣습니다.");
    expect(e.paragraphs[0]).toContain("고용노동부 퇴직금 계산기의 퇴직일자는 마지막 근무일 다음 날을 넣는 칸");
    expect(e.paragraphs[1]).toContain("연간 상여금과 연차수당은 12개월분 가운데 3개월분을 더합니다");
  });

  it("엔진이 글과 같다: 마지막 근무일을 넣으면 하루를 더해 퇴직일로 보고, 고용노동부 퇴직일자(다음 날)를 넣으면 하루가 늘어난다", () => {
    // 2025-11-19 입사, 마지막 근무일 2026-11-18 → 퇴직일 2026-11-19 = 입사 1주년 → 퇴직금 대상(재직 365일)
    const ok = calculateSeverancePay("2025-11-19", "2026-11-18", [3_000_000, 3_000_000, 3_000_000], 0, 0);
    expect(ok.estimatedSeverancePay).toBeGreaterThan(0);
    // 마지막 근무일이 하루 앞(2026-11-17)이면 1년 미만 → 0원, 그런데 고용노동부식 퇴직일자(2026-11-18)를 넣으면 대상으로 계산된다
    expect(calculateSeverancePay("2025-11-19", "2026-11-17", [3_000_000, 3_000_000, 3_000_000], 0, 0).estimatedSeverancePay).toBe(0);
    expect(calcLegalSeveranceResult({ startDate: "2025-11-19", endDate: "2026-11-17", monthlySalary: 3_000_000, annualBonus: 0, annualLeavePay: 0 }).severancePay).toBe(0);
    expect(calcLegalSeveranceResult({ startDate: "2025-11-19", endDate: "2026-11-18", monthlySalary: 3_000_000, annualBonus: 0, annualLeavePay: 0 }).severancePay).toBeGreaterThan(0);
  });
});
