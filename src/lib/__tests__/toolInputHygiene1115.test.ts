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

/** JSX 여는 태그 하나 — { } 안의 '>'(화살표 함수 '=>' 등)는 태그 끝으로 보지 않는다 */
function openTagAt(src: string, at: number): string {
  let depth = 0;
  for (let i = at; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    else if (ch === ">" && depth === 0) return src.slice(at, i + 1);
  }
  return src.slice(at);
}

/** 소스의 <button ...> 여는 태그 중 needle(onClick 본문 등)이 든 것 */
function buttonsWith(src: string, needle: string): string[] {
  return [...src.matchAll(/<button\b/g)].map((m) => openTagAt(src, m.index!)).filter((tag) => tag.includes(needle));
}

describe("도구 계산기 토글 — 선택 상태와 묶음 이름 (F04, 속성만)", () => {
  const cases: Array<{ rel: string; toggles: Array<[string, string]>; labelledBy: string[]; groupLabels: string[] }> = [
    {
      rel: "finance/bonus/page.tsx",
      toggles: [["setHasSpouse(opt.v)", "aria-pressed={hasSpouse === opt.v}"], ["setActiveGroup(i)", "aria-pressed={activeGroup === i}"], ["setSalaryFmt(p.salary", "aria-pressed={active}"]],
      labelledBy: ["bonus-spouse-label"],
      groupLabels: ["비교 기준"],
    },
    {
      rel: "finance/stock-tax/page.tsx",
      toggles: [["setIsOverseas(true)", "aria-pressed={isOverseas}"], ["setIsOverseas(false)", "aria-pressed={!isOverseas}"], ['setHoldPeriod("short")', 'aria-pressed={holdPeriod === "short"}'], ['setHoldPeriod("long")', 'aria-pressed={holdPeriod === "long"}']],
      labelledBy: ["stock-tax-hold-label"],
      groupLabels: ["과세 대상 주식"],
    },
    {
      rel: "finance/severance/page.tsx",
      toggles: [["setMode(m.v", "aria-pressed={mode === m.v}"]],
      labelledBy: [],
      groupLabels: ["계산 방식"],
    },
    {
      rel: "real-estate/acquisition-tax/page.tsx",
      toggles: [["setPropType(t.v", "aria-pressed={propType === t.v}"], ["setIsFirst(t.v)", "aria-pressed={isFirst === t.v}"], ["setIsOver85(t.v)", "aria-pressed={isOver85 === t.v}"]],
      labelledBy: ["acq-type-label", "acq-holding-label", "acq-area-label"],
      groupLabels: [],
    },
    {
      rel: "life/subscription/SubscriptionCalcClient.tsx",
      toggles: [['setNewPeriod("monthly")', 'aria-pressed={newPeriod === "monthly"}'], ['setNewPeriod("yearly")', 'aria-pressed={newPeriod === "yearly"}']],
      labelledBy: [],
      groupLabels: ["결제 주기"],
    },
    {
      rel: "finance/installment/page.tsx",
      toggles: [["setMonths(p.months)", "aria-pressed={months === p.months && annualRate === p.rate}"]],
      labelledBy: [],
      groupLabels: ["자주 쓰는 조건"],
    },
  ];

  it.each(cases)("$rel", ({ rel, toggles, labelledBy, groupLabels }) => {
    const src = read(rel);
    for (const [needle, pressed] of toggles) {
      const tags = buttonsWith(src, needle);
      expect(tags, needle).toHaveLength(1);
      expect(tags[0]).toContain('type="button"');
      expect(tags[0]).toContain(pressed);
    }
    for (const id of labelledBy) {
      // 기존 <label> 에 id 를 붙이고(요소 교체 없음), 기존 버튼 묶음 div 가 그 id 를 가리킨다
      expect(src).toMatch(new RegExp(`<label id="${id}" className=`));
      expect(src).toMatch(new RegExp(`<div className="[^"]*" role="group" aria-labelledby="${id}">`));
    }
    for (const name of groupLabels) {
      expect(src).toMatch(new RegExp(`role="group" aria-label="${name}"`));
    }
  });

  it("구독 계산기 프리셋(추가 전용) 버튼에는 aria-pressed 를 달지 않는다", () => {
    const src = read("life/subscription/SubscriptionCalcClient.tsx");
    expect(src.match(/aria-pressed=/g)).toHaveLength(2);
  });
});
