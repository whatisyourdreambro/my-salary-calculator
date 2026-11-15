// /tools 계산기 입력 위생 (감사 2026-11-15 N2-app-tools-fun-05 — app-tools-fun-b03-F01·F04).
// F01: NumberInput 은 type="number" 면 allowNegative 기본값이 true 라 '-' 가 통과한다(NumberInput.tsx) —
//      주식 양도세 손실 -1,000만 입력 시 세금이 165만 -> 385만원으로 오르는 등. 금액 칸에는 allowNegative={false}.
// F04: 토글 버튼의 선택 상태를 색으로만 보여 주던 곳에 aria-pressed, 묶음 이름(role="group" + aria-labelledby·aria-label).
//      속성만 — 요소·클래스·스타일은 그대로(광고 위 픽셀 변화 0).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { normalizeNumberDraft } from "@/lib/numberInput";

const read = (rel: string) => readFileSync(resolve(process.cwd(), "src/app/tools", rel), "utf8");

/** 소스의 <NumberInput ... /> 블록 */
function numberInputs(src: string): string[] {
  const blocks: string[] = [];
  let at = src.indexOf("<NumberInput");
  while (at !== -1) {
    const end = src.indexOf("/>", at);
    blocks.push(src.slice(at, end + 2));
    at = src.indexOf("<NumberInput", end);
  }
  return blocks;
}

const F01: Record<string, number> = {
  "finance/compound/page.tsx": 2,
  "finance/freelance-tax/page.tsx": 3,
  "finance/irp/IRPCalculatorClient.tsx": 3,
  "finance/severance/page.tsx": 5,
  "finance/stock-tax/page.tsx": 2,
  "real-estate/acquisition-tax/page.tsx": 1,
  "finance/dividend-tax/page.tsx": 3,
};

describe("도구 계산기 금액 칸 — 음수 입력 차단 (F01)", () => {
  it.each(Object.entries(F01))("%s: 모든 NumberInput 이 allowNegative={false}", (rel, count) => {
    const blocks = numberInputs(read(rel));
    expect(blocks).toHaveLength(count);
    for (const block of blocks) expect(block, block.slice(0, 80)).toContain("allowNegative={false}");
  });

  it("allowNegative=false 면 앞의 '-' 는 받지 않는다(라이브러리 계약)", () => {
    expect(normalizeNumberDraft("-1", { allowNegative: false, allowDecimal: true })).toBeNull();
    expect(normalizeNumberDraft("-1", { allowNegative: true, allowDecimal: true })).toBe("-1");
  });
});
