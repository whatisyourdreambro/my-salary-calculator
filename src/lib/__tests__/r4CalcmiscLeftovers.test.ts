// R4 CALCMISC (2026-11-18) — 다음 게시 묶음이 남긴 선택 항목(leftovers.md).
//  · /calc/civil-servant-net-pay 산식·출처 각주: 공무원수당 등에 관한 규정의 현행 대통령령 번호(law.go.kr 2026-11-18 확인 —
//    제36728호, 2026-09-29 타법개정·2026-10-02 시행). 금액 조문은 2026-11-15 PAY 단위 재대조 그대로. 광고 위라 날짜를 빼 폭을 줄였다.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PAY_PAGE_ALLOWANCE_SOURCE_2026 } from "@/lib/civilServantAllowances2026";

const read = (p: string) => readFileSync(p, "utf8");

describe("공무원 실수령 계산기 각주 — 현행 대통령령 번호", () => {
  it("각주는 봉급표 페이지 수당 표와 같은 현행 번호(제36728호)를 쓰고 옛 번호(제36015호)는 화면에 없다", () => {
    const src = read("src/app/calc/civil-servant-net-pay/Client.tsx");
    expect(src).toContain(`수당: 공무원수당 등에 관한 규정(${PAY_PAGE_ALLOWANCE_SOURCE_2026.decree}) — 정액급식비 월 16만원(제18조)`);
    expect(src).not.toContain("제36015호");
    expect(PAY_PAGE_ALLOWANCE_SOURCE_2026.decree).toBe("대통령령 제36728호");
  });
});
