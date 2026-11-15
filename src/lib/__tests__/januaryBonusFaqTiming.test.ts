// /calc/january-bonus 접힌 FAQ 1 환급 시기 (2026-11-15 N2-calc-06 calc-02-F11 FAQ 부분)
//
// '보통 1월~3월 사이 월급에'·'1월 월급이 평소보다' -> '보통 2~3월 월급에'·'그달 월급이 평소보다'.
// 소득세법 제137조(다음 연도 2월분 근로소득 지급 때 연말정산)와 같은 페이지 FAQ 5·일정표에 맞춘다. 문장은 더 짧다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/january-bonus/page.tsx"), "utf8");

describe("january-bonus 접힌 FAQ 1 환급 시기 (calc-02-F11)", () => {
  it("보통 2~3월 월급에 합산, 그달 월급", () => {
    expect(page).toContain("환급금이 보통 2~3월 월급에 합산되어 지급되기 때문에");
    expect(page).toContain("그 차액이 환급되어 그달 월급이 평소보다 많아 보이게 됩니다.");
    expect(page).not.toContain("1월~3월 사이 월급에");
    expect(page).not.toContain("1월 월급이 평소보다");
  });
});
