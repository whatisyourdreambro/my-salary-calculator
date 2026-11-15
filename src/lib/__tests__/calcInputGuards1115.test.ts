// N2-app-pages-03 (2026-11-15 감사 app-pages-b02-F01) — 근로장려금 계산기 입력 가드 회귀 가드.
// (같은 묶음의 건강보험료 상·하한 b03-F04 는 healthFeeLimits1115.test.ts — 커밋별로 되돌릴 수 있게 나눔)
//
// 1) /earned-income-credit: NumberInput 은 type="number" 이면 기본으로 음수를 받는다(min={0} 은 안내 메시지만).
//    '-500' 을 치면 지급액 0 인 빈 빨간 상자가 남았고, 소득 칸을 비우면 중립 안내 문구가 오류 색 상자에 그려졌다.
//    -> 두 칸 allowNegative={false}, 소득 0(빈 칸) 상태는 중립 색(bg-canvas). 글자·요소 추가 없음, 기본 상태(2400, 초록)는 그대로.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const flat = (s: string) => s.replace(/\s+/g, " ");

describe("/earned-income-credit 입력 가드와 빈 상태 색", () => {
  const src = flat(readSrc("src/app/earned-income-credit/EarnedIncomeCreditContent.tsx"));

  it("소득·재산 두 칸 모두 음수 입력을 막는다", () => {
    expect(src.match(/allowNegative=\{false\}/g)?.length).toBe(2);
    expect(src).toContain('<NumberInput id="ms-earned-income-credit-field-0" type="number" allowNegative={false}');
    expect(src).toContain('<NumberInput id="ms-earned-income-credit-field-1" type="number" allowNegative={false}');
  });

  it("결과 상자는 지급액 있음=초록, 소득 미입력=중립, 그 밖=빨강의 세 갈래다", () => {
    expect(src).toContain(
      'status === "eligible" && finalBenefit > 0 ? "bg-green-50 border border-green-200" : status === "eligible" && income === 0 ? "bg-canvas border border-canvas-200" : "bg-red-50 border border-red-200"',
    );
  });
});
