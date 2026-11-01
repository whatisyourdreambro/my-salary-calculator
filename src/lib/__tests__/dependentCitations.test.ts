// 부양가족 판정기 법 조항 인용 회귀 가드 (2026-10-05 감사 code39-02)
// law.go.kr 소득세법(시행 2026.1.1) 확인: 제53조 제2항 = 취학·질병 요양·근무·사업상 일시 퇴거,
// 제53조 제3항 = 직계존속 주거 형편 별거, 장애인 나이 제한 면제 = 제50조 제1항 제3호 괄호
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("/calc/dependent-check 인용 조항", () => {
  const lib = readFileSync(resolve(process.cwd(), "src/lib/dependentEligibility.ts"), "utf8");
  const page = readFileSync(resolve(process.cwd(), "src/app/calc/dependent-check/page.tsx"), "utf8");
  it("직계존속 별거 = 53조 3항, 일시 퇴거 = 53조 2항, 장애인 나이 = 50조 1항", () => {
    expect(lib).toContain("실제 부양하고 있으면 생계를 같이 하는 것으로 봅니다 (소득세법 53조 3항)");
    expect(lib).toContain("일시 퇴거는 생계를 같이 하는 것으로 봅니다 (소득세법 53조 2항)");
    expect(lib).toContain("장애인은 나이 요건을 적용하지 않습니다 (소득세법 50조 1항)");
    expect(lib).not.toContain("(소득세법 50조 3항)");
    expect(page).toContain("생계를 같이 하는 것으로 봅니다(소득세법 53조 3항)");
    expect(page).not.toContain("53조 2항");
  });
});
