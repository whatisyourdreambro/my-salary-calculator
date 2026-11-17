// /calc/samsung-bonus 다년도 시뮬레이터 '연도별 직접 입력' 모드 — 휴대폰에서 연봉 칸을 아랫줄로 (R4 SAMSUNG, N2-calc-24 calc-03-F08, 2026-11-18)
//
// 운영자 승인 2026-11-17 6번(owner-decisions-2026-11-17.md): 이 모드를 고른 경우에만 휴대폰에서 연봉 칸을 아랫줄로 내려 넓힌다.
// 처음 화면과 기본 모드(고정)·자동 인상 모드의 화면과 광고 위치는 그대로여야 한다 — 아래 단언이 그 조건을 소스로 고정한다.
// 변하는 상태(스윕 대상): 시뮬레이터 마운트 → 연봉 모드 '직접 입력'(salaryMode=manual) → 640px 미만에서 연도 카드마다 한 줄 늘어
// 그 아래 InArticleAd 가 내려간다(운영자가 승인한 그 모드 한정 이동). 640px 이상은 종전 4열 그대로.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-bonus/MultiYearBonusSimulator.tsx"), "utf8").replace(/\r\n/g, "\n");

describe("다년도 시뮬레이터 직접 입력 모드 연봉 칸 (N2-calc-24)", () => {
  it("manual 가지만 바뀐다: 640px 미만 3열(연도·영업이익·삭제) + 연봉 칸 아랫줄 전체 폭, 640px 이상 종전 4열", () => {
    expect(src).toContain('? "grid-cols-[70px_1fr_auto] sm:grid-cols-[85px_1fr_1fr_auto]"');
    expect(src).toContain('{salaryMode === "manual" && (\n          <div className="col-span-3 sm:col-span-1 order-last sm:order-none">');
    expect(src).not.toContain("grid-cols-[70px_1fr_1fr_auto]");
  });

  it("고정·자동 인상 모드 가지와 기본 모드는 그대로", () => {
    expect(src).toContain(': "grid-cols-[80px_1fr_auto] sm:grid-cols-[100px_1fr_auto]"');
    expect(src).toContain('useState<SalaryMode>("fixed")');
    // 연봉 칸 래퍼는 manual 일 때만 그려진다
    const wrap = src.indexOf('<div className="col-span-3 sm:col-span-1 order-last sm:order-none">');
    expect(src.slice(src.lastIndexOf("{salaryMode", wrap), wrap)).toContain('salaryMode === "manual" && (');
  });
});
