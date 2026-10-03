// 헤더 시즌 메뉴 2027 공무원 봉급표 문구 고정 (PT-05, SEO 신선도 정비 2026-09-29)
//
//  - 3.9% 는 정부 예산안(9/1 국무회의·9/3 국회 제출) 수치이고 국회 의결 전이라, 헤더 드롭다운 네 시즌 세트 모두
//    '예산안 3.9%' 로만 쓴다. 비활성 SEP 세트 SeasonalLinks 제목의 '인상 확정(예산안)' 자기모순도 다시 들어오면 안 된다.
//  - 원래 publicPayLinks2026.test.ts 에 붙어 있던 단언이다. 그 파일은 10/15 슬롯 커밋(4f34e3b7)이 만들므로,
//    10/2 에 나가는 문구 정정(beb4fab8)과 함께 돌도록 독립 파일로 떼어 냈다.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("헤더 시즌 메뉴 2027 봉급표 문구 (PT-05)", () => {
  it("모든 시즌 세트에서 3.9% 는 예산안 기준으로만 쓴다", () => {
    const src = readFileSync("src/config/seasonLinks.ts", "utf8");
    expect(src.match(/2027 공무원 봉급표 — 예산안 3\.9%/g)).toHaveLength(4);
    expect(src).not.toContain("3.9% 인상\"");
    expect(readFileSync("src/app/table/2026/SeasonalLinks.tsx", "utf8")).not.toContain("인상 확정(예산안)");
  });
});
