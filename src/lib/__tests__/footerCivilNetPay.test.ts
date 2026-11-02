// 푸터 계산기 목록 공무원 월급 실수령액 링크 고정 (MI-20, SEO 신선도 정비 2026-09-29)
//
//  - KR 계산기 목록 끝에 /calc/civil-servant-net-pay 한 줄, EN 목록 무접촉(파일 전체에서 1회).
//  - 원래 publicPayLinks2026.test.ts 에 붙어 있던 단언이다(595abe99). 그 파일은 10/15 슬롯 커밋(4f34e3b7)이 만들므로,
//    10/13 에 나가는 푸터 링크와 함께 돌도록 독립 파일로 떼어 냈다(seasonHeaderPayBudget2027.test.ts 와 같은 방식).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("푸터 계산기 목록 (MI-20)", () => {
  it("KR 계산기 목록 끝에 공무원 월급 실수령액 계산기 (EN 목록 무접촉)", () => {
    const src = readFileSync("src/components/Footer.tsx", "utf8");
    const kr = src.slice(src.indexOf('{ name: "연봉 계산기", href: "/" }'), src.indexOf("const seasonLinks"));
    expect(kr).toContain('{ name: "공무원 월급 실수령액", href: "/calc/civil-servant-net-pay" }');
    expect(src.match(/civil-servant-net-pay/g)).toHaveLength(1);
  });
});
