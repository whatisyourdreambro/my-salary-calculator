// 부양가족 판정 귀속연도 가드 (2026-11-15 감사 calc-01-F14)
//
// dependentEligibility.ts 의 TAX_YEAR 는 사이트 연말정산 시즌 프레임(yearEndSeason.ts — 2027-03-10 까지 2026 귀속)과
// 같아야 한다. 종전 갱신 메모는 '2027-01 에 TAX_YEAR 를 2027 로'라고 해, 그대로 따르면 2026년 소득을 정산하는
// 1~2월에 60세·20세·70세 컷이 한 해씩 밀린 2027년 기준으로 판정됐다. 페이지(dependent-check/Client.tsx)는
// '2026년 귀속' 문구와 출생연도 상한을 리터럴로 쓰므로, TAX_YEAR 만 바꾸고 화면을 그대로 두는 것도 막는다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { TAX_YEAR } from "@/lib/dependentEligibility";
import { YEAR_END_SEASON } from "@/lib/yearEndSeason";

const client = readFileSync(resolve(process.cwd(), "src/app/calc/dependent-check/Client.tsx"), "utf8");
const lib = readFileSync(resolve(process.cwd(), "src/lib/dependentEligibility.ts"), "utf8");

describe("부양가족 판정 TAX_YEAR = 연말정산 시즌 귀속연도", () => {
  it("TAX_YEAR 는 YEAR_END_SEASON.attributionYear 와 같다", () => {
    expect(TAX_YEAR).toBe(YEAR_END_SEASON.attributionYear);
  });

  it("dependent-check 화면의 귀속 문구·출생연도 상한이 TAX_YEAR 와 같은 해다", () => {
    expect(client).toContain(`${TAX_YEAR}년 귀속`);
    expect(client).toContain(`birthYear <= ${TAX_YEAR}`);
  });

  it("갱신 메모는 시즌 전환일(2027-03-11 이후)을 가리키고 1월 교체 메모는 없다", () => {
    expect(lib).toContain("갱신 슬롯: 2027-03-11 이후(yearEndSeason 전환과 같은 날)");
    expect(lib).not.toContain("2027-01 — TAX_YEAR 를 2027로");
  });
});
