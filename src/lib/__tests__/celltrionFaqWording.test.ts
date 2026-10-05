// 셀트리온 성과급 계산기 FAQ — '정확하게 계산' 표현 정정 (2026-10-05 감사 C1-04)
// 계산기는 기본급 연봉(수당 제외)을 총급여로 써 한계세율·연금 상한 여유를 근사하므로 '정확' 이 아니라 추정치다.
// 허브 FAQ(/calc/bonus-calculators)의 '간이 모형은 상한·정산 시점을 재현하지 않는다' 와 일치시킨다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("/calc/celltrion-bonus FAQ", () => {
  it("marginal 방식은 추정치라고 적는다", () => {
    const page = readFileSync(resolve(process.cwd(), "src/app/calc/celltrion-bonus/page.tsx"), "utf8");
    expect(page).not.toContain("marginal 방식으로 정확하게 계산합니다");
    expect(page).toContain("marginal 방식의 추정치입니다");
  });
});
