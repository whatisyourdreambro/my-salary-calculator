// /calc/january-bonus 원천징수세액 입력칸 연도 표기 (2026-11-15 N2-calc-06 calc-02-F12)
//
// 11~12월 미리보기 시즌에 페이지 제목은 '2026년 귀속'인데 입력칸이 '작년 원천징수세액'이라 2025년 값으로 읽혔다.
// 귀속연도는 YEAR_END_SEASON.attributionYear 에서 파생 — 2027-03-11 시즌 전환 때 함께 바뀐다.
// 입력칸 라벨(12px 굵게·글자 간격 0.1em)은 236.3px -> 228.7px, 안내 문장도 더 짧다(CalcResultAd 위).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { YEAR_END_SEASON } from "@/lib/yearEndSeason";

const client = readFileSync(resolve(process.cwd(), "src/app/calc/january-bonus/Client.tsx"), "utf8");

describe("january-bonus 원천징수세액 입력칸 귀속연도 (calc-02-F12)", () => {
  it("라벨·안내 문장이 귀속연도에서 파생되고 '작년' 표기는 화면 문자열에 없다", () => {
    expect(client).toContain('import { YEAR_END_SEASON } from "@/lib/yearEndSeason";');
    expect(client).toContain("label={`${YEAR_END_SEASON.attributionYear}년 원천징수세액 (그해 미리 낸 세금)`}");
    expect(client).toContain("원천징수세액은 {YEAR_END_SEASON.attributionYear}년 급여에서 미리 떼인");
    expect(client).not.toContain("작년 원천징수세액");
    expect(client).not.toContain("작년 한 해");
  });

  it("라벨은 귀속연도 숫자 + '년'으로 시작한다(시즌 전환 때 자동으로 따라감)", () => {
    const label = `${YEAR_END_SEASON.attributionYear}년 원천징수세액 (그해 미리 낸 세금)`;
    expect(label).toMatch(/^20\d\d년 원천징수세액 \(그해 미리 낸 세금\)$/);
  });
});
