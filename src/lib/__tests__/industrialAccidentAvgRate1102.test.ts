// 산재보험 평균 요율 정정 회귀 가드 (2026-11-02 OF1 C5 — 검증자·반박자가 공식 근거로 확인)
//
// 고용노동부 2025-12-31 보도자료: 2026년 평균 산재보험료율은 올해 수준(1.47%) 유지(고시 제2025-91호).
// /social-insurance-rates-2026 산재 카드의 '총 요율' 은 InArticleAd 위라 정확값 1.47%(종전보다 13.9px 넓음) 대신
// 반올림 1.5%(종전 1.4%보다 좁음)로 쓴다. 정확값을 쓰려면 실측 스윕을 먼저 할 것.
// 같은 정정의 가이드 줄(social-insurance-reduction 고용보험 회사 부담)은 T1 이 고쳤다(employmentInsuranceShare1102.test.ts).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const rates2026 = readFileSync(resolve(process.cwd(), "src/app/social-insurance-rates-2026/page.tsx"), "utf8");

describe("산재보험 2026년 평균 요율 1.47% → 카드 표기 1.5%", () => {
  it("2026 요율표 산재 카드 총 요율은 반올림 1.5%이고 옛 1.4%가 없다", () => {
    expect(rates2026).toContain('totalRate: "업종별 (평균 1.5%)"');
    expect(rates2026).not.toContain("평균 1.4%");
  });
});
