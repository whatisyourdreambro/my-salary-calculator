// 네이버 성과급 계산기 표시 정정 회귀 가드 (2026-10-05 감사 code4-09)
// - 빠른 선택 5,500만원 버튼이 toFixed(1) 로 '0.6억' 이었다 → 0.55억
// - 본문·FAQ 가 PI 기준을 '기본급의 10~40%' 라 적었으나 계산기는 연봉 × % (bonusData 도 '연봉 대비 10~40%')
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("/calc/naver-bonus", () => {
  it("PI 기준 표기는 연봉의 10~40%", () => {
    const page = readFileSync(resolve(process.cwd(), "src/app/calc/naver-bonus/page.tsx"), "utf8");
    expect(page).not.toContain("기본급의 10~40%");
    expect(page).not.toContain("기본급의 <strong>10~40%</strong>");
    expect(page).toContain("연봉의 <strong>10~40%</strong> 연 1회");
  });
});
