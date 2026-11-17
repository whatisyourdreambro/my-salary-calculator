// /calc/samsung-bonus 회사 프로필 카드 평균 연봉 1.35억 -> 1.58억(2025년 사업보고서) (R4 SAMSUNG, RL-16 CB-11 = 10월 6645524b1 재이식, 2026-11-18)
//
// 삼성전자 2025년 사업보고서 직원 1인 평균 급여 1억 5,800만원(2026-03-10 공시, SBS Biz·한국경제 보도) — 카드가 가리키는
// /salary-db/samsung-electronics 의 공시값(seedCompanies disclosed.avgSalaryManwon 15800)과 같다. 숫자 두 자리만 바뀐다
// (사이트 글꼴 400·12px 199.46px -> 199.33px, 더 좁음). 이 커밋만 되돌릴 수 있도록 단언을 따로 둔다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");

describe("삼성 성과급 회사 카드 평균 연봉 (CB-11)", () => {
  it("카드 = 회사 페이지 공시값 1억 5,800만원", () => {
    const page = read("src/app/calc/samsung-bonus/page.tsx");
    expect(page).toContain("직급별 성장표, 1.58억 평균 연봉, 복지 비교");
    expect(page).not.toContain("1.35억 평균 연봉");
    const seed = read("src/data/seedCompanies.ts");
    const block = seed.slice(seed.indexOf('id: "samsung-electronics"'), seed.indexOf('id: "samsung-electronics"') + 400);
    expect(block).toContain("avgSalaryManwon: 15800");
  });
});
