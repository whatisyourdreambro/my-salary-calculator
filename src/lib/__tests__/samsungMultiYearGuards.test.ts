// 삼성 성과급 다년 시뮬레이터 회귀 가드 (2026-10-05 감사 code5-03·code5-04) — 계산·광고 무변경, 입력 가드·표시 문구만
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-bonus/MultiYearBonusSimulator.tsx"), "utf8");

describe("연도 칸 직접 입력 중복 방지 (code5-03)", () => {
  it("다른 행이 쓰는 연도면 원래 연도로 되돌린다", () => {
    expect(src).toContain("takenYears={rows.filter((o) => o.id !== r.id).map((o) => o.year)}");
    expect(src).toContain("const next = takenYears.includes(clamped) ? row.year : clamped;");
  });
});

describe("나이대 비교 추정 위치 (code5-04)", () => {
  it("참고표 최저 기준 아래는 근거 없는 '상위 90%' 대신 '하위 25%' (같은 글자 구성)", () => {
    expect(src).not.toContain("myTopPct = 90");
    expect(src).toContain('{belowTable ? "하위 25%" : `상위 ${myTopPct}%`}');
    const shape = (s: string) => [[...s].filter((c) => /[가-힣]/.test(c)).length, s.length];
    expect(shape("하위 25%")).toEqual(shape("상위 90%"));
  });
});
