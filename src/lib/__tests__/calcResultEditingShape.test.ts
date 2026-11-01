// 입력 중 결과 칸 높이 고정 (2026-11-01 B08 IVT-05) — /calc/child-deduction, /calc/dual-income-year-end
// 결과 카드는 결과 직하 CalcResultAd 바로 위에 있다. 입력을 고치는 동안 카드의 줄 구성이 바뀌면 광고가 오르내린다.
//  · 자녀공제: 입력 조합이 맞지 않으면(출산·입양 인원 > 기본공제 인원) 종전에는 결과가 오류 한 줄로 줄었다 →
//    두 카드 구성을 그대로 두고 금액만 '—', 오류는 설명 문단 자리(설명 문단은 보이지 않게 남겨 같은 높이).
//  · 맞벌이: 자녀가 있으면 최적 배분 줄은 3~4개(부부 상호 의료비 칸을 비우면 3개) → 언제나 4줄(빈 줄은 보이지 않게).
//    자녀 0명(첫 화면)은 언제나 1줄이라 채우지 않는다 — 기본 화면의 광고 위치는 그대로다.
// 렌더는 오프라인 훅 대역(calculatorAccessibleStates.test.ts 와 같은 방식)으로 컴포넌트 함수를 직접 호출해 요소 트리를 본다.
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";

type Slot = { value?: unknown };
const fixture = vi.hoisted(() => ({ slots: [] as Slot[], cursor: 0 }));
vi.mock("react", async (original) => ({ ...await original<typeof import("react")>(),
  useState: (initial: unknown) => {
    const slot = fixture.slots[fixture.cursor++] ??= { value: typeof initial === "function" ? initial() : initial };
    return [slot.value, (value: unknown) => { slot.value = typeof value === "function" ? value(slot.value) : value; }];
  },
  useMemo: (create: () => unknown) => create(),
}));
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => null }));
vi.mock("@/components/AppLink", () => ({ default: "a" }));

import ChildDeductionClient from "@/app/calc/child-deduction/Client";
import DualIncomeYearEndClient from "@/app/calc/dual-income-year-end/Client";
import { CalcResultAd } from "@/components/AdPlacement";
import NumberInput from "@/components/NumberInput";

type Element = ReactElement<Record<string, unknown>>;
function nodes(value: unknown): Element[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!value || typeof value !== "object" || !("props" in value)) return [];
  const node = value as Element; return [node, ...nodes(node.props.children)];
}
function text(value: unknown): string {
  if (Array.isArray(value)) return value.map(text).join("");
  if (value && typeof value === "object" && "props" in value) return text((value as Element).props.children);
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}
function elementChildren(node: Element): Element[] {
  return [node.props.children].flat(Infinity).filter((child): child is Element => Boolean(child) && typeof child === "object" && "props" in (child as object));
}
function render(component: () => unknown) { fixture.cursor = 0; return component(); }
beforeEach(() => { fixture.slots = []; fixture.cursor = 0; });

describe("/calc/child-deduction — 입력 조합 오류에도 결과 카드 구성 유지 (B08)", () => {
  function shape(tree: unknown) {
    const section = nodes(tree).find((node) => node.props["aria-label"] === "자녀 공제액 결과")!;
    const [heading, list, slot, ...rest] = elementChildren(section);
    const cards = elementChildren(list).map((card) => elementChildren(card).map((part) => `${part.type}:${text(part)}`));
    const slotParts = slot.type === "p" ? [slot] : elementChildren(slot);
    return { heading: `${heading.type}:${text(heading)}`, list: list.type, cards, slotType: slot.type, slotClass: String(slot.props.className), slotParts, rest: rest.length };
  }
  const counter = (tree: unknown, label: string) => nodes(tree).find((node) => node.props.label === label && typeof node.props.onChange === "function")!;

  it("출산·입양을 먼저 누르면 두 카드는 그대로, 금액은 '—', 오류는 설명 문단 자리에 같은 높이로", () => {
    let tree = render(ChildDeductionClient);
    const valid = shape(tree);
    expect(valid.heading).toBe("h2:공제액은 두 종류로 나뉩니다");
    expect(valid.list).toBe("dl");
    expect(valid.cards).toEqual([
      ["dt:소득공제액", "dd:0원", "dd:기본공제 대상 1명당 150만원. 세금 계산의 기초가 되는 소득을 줄이는 금액입니다."],
      ["dt:세액공제 계산액 · 소득세 기준", "dd:0원", "dd:자녀세액공제 0원출산·입양 공제 0원"],
    ]);
    expect(valid.slotType).toBe("p");
    expect(valid.slotClass).toBe("mt-4 text-sm leading-relaxed text-muted-blue dark:text-canvas-300");
    const explanation = text(valid.slotParts[0]);
    expect(explanation).toMatch(/^두 금액을 더해 환급액으로 계산하지 않습니다\. .+추가공제를 포함하지 않습니다\.$/);
    expect(valid.rest).toBe(0);

    // 기본공제 0명에서 첫째 출산·입양 + — 실제 엔진 오류(도달 가능한 유일한 오류 상태)
    (counter(tree, "첫째 출산·입양").props.onChange as (v: number) => void)(1); tree = render(ChildDeductionClient);
    const invalid = shape(tree);
    expect(invalid.heading).toBe(valid.heading);
    expect(invalid.cards).toEqual([
      ["dt:소득공제액", "dd:—", "dd:기본공제 대상 1명당 150만원. 세금 계산의 기초가 되는 소득을 줄이는 금액입니다."],
      ["dt:세액공제 계산액 · 소득세 기준", "dd:—", "dd:자녀세액공제 —출산·입양 공제 —"],
    ]);
    // 설명 문단 자리: 같은 칸에 설명(보이지 않음)과 오류를 겹쳐 둔다 → 높이 = 설명 문단 높이
    expect(invalid.slotType).toBe("div");
    expect(invalid.slotClass).toBe("mt-4 grid");
    const [hidden, error] = invalid.slotParts;
    expect(text(hidden)).toBe(explanation);
    expect(hidden.props["aria-hidden"]).toBe("true");
    expect(String(hidden.props.className)).toBe("invisible col-start-1 row-start-1 text-sm leading-relaxed");
    expect(text(error)).toBe("출산·입양한 자녀도 위의 기본공제 대상 인원에 포함해 주세요.");
    expect(String(error.props.className)).toContain("col-start-1 row-start-1 text-sm");
    expect(error.props["aria-hidden"]).toBeUndefined();
    expect(text(error).length).toBeLessThan(explanation.length / 3);
    expect(invalid.rest).toBe(0);

    // 기본공제 1명으로 고치면 정상 결과 — 같은 구성
    (counter(tree, "기본공제 대상 전체").props.onChange as (v: number) => void)(1); tree = render(ChildDeductionClient);
    const fixed = shape(tree);
    expect(fixed.cards[0][1]).toBe("dd:1,500,000원");
    expect(fixed.cards[1][1]).toBe("dd:300,000원");
    expect(fixed.slotClass).toBe(valid.slotClass);
    expect(text(fixed.slotParts[0])).toBe(explanation);
  });

  it("결과 섹션 바로 다음은 언제나 CalcResultAd 다", () => {
    let tree = render(ChildDeductionClient);
    for (const step of [() => {}, () => (counter(tree, "셋째 이후 출산·입양").props.onChange as (v: number) => void)(2)]) {
      step(); tree = render(ChildDeductionClient);
      const root = tree as Element;
      const kids = elementChildren(root);
      const sectionIndex = kids.findIndex((node) => node.props["aria-label"] === "자녀 공제액 결과");
      expect(sectionIndex).toBeGreaterThan(-1);
      expect(kids[sectionIndex + 1]?.type).toBe(CalcResultAd);
    }
  });
});

describe("/calc/dual-income-year-end — 최적 배분 줄 수는 자녀 수로만 정해진다 (B08)", () => {
  const allocation = (tree: unknown) => {
    const box = nodes(tree).find((node) => node.type === "div" && elementChildren(node).some((child) => child.type === "p" && text(child).trim() === "최적 배분"))!;
    const list = elementChildren(box).find((child) => child.type === "ul")!;
    return elementChildren(list).map((li) => ({ text: text(li).trim(), hidden: li.props["aria-hidden"], className: String(li.props.className) }));
  };
  const select = (tree: unknown, id: string, value: string) =>
    (nodes(tree).find((node) => node.type === "select" && node.props.id === id)!.props.onChange as (e: unknown) => void)({ target: { value } });
  const type = (tree: unknown, id: string, value: string) =>
    (nodes(tree).find((node) => node.type === NumberInput && node.props.id === id)!.props.onChange as (e: unknown) => void)({ target: { value } });

  it("첫 화면(자녀 0명)은 1줄 그대로 — 의료비 칸을 비워도 1줄", () => {
    let tree = render(DualIncomeYearEndClient);
    expect(allocation(tree)).toEqual([{ text: "· 부부 상호 의료비 → 배우자가 결제·공제", hidden: undefined, className: "text-sm font-bold text-navy dark:text-canvas-50" }]);
    type(tree, "di-coupleMedical", ""); tree = render(DualIncomeYearEndClient);
    expect(allocation(tree).map((row) => row.text)).toEqual(["· 배분할 항목이 없습니다"]);
  });

  it("자녀가 있으면 의료비 칸을 비우거나 다시 써도 언제나 4줄 — 빈 줄은 보이지 않고 보조기기에도 숨긴다", () => {
    let tree = render(DualIncomeYearEndClient);
    select(tree, "di-children", "2"); tree = render(DualIncomeYearEndClient);
    const full = allocation(tree);
    expect(full).toHaveLength(4);
    expect(full.every((row) => row.hidden === undefined)).toBe(true);
    expect(full[3].text).toMatch(/^· 부부 상호 의료비 → /);

    type(tree, "di-coupleMedical", ""); tree = render(DualIncomeYearEndClient);
    const cleared = allocation(tree);
    expect(cleared).toHaveLength(4);
    expect(cleared.slice(0, 3)).toEqual(full.slice(0, 3));
    // 빈 줄은 실제 줄과 같은 글자 크기(text-sm — 줄 높이 20px)라 높이가 같다
    expect(cleared[3]).toEqual({ text: "·", hidden: "true", className: "invisible text-sm font-bold" });

    type(tree, "di-coupleMedical", "1"); tree = render(DualIncomeYearEndClient);
    expect(allocation(tree).every((row) => row.hidden === undefined)).toBe(true);
    expect(allocation(tree)).toHaveLength(4);
  });

  it("자녀 1~5명·세액공제 인원·급여·의료비 입력 전체 조합에서 줄 수 = 자녀 있음 4 / 없음 1", () => {
    let tree = render(DualIncomeYearEndClient);
    const counts = new Set<string>();
    for (const children of [0, 1, 2, 3, 4, 5]) {
      select(tree, "di-children", String(children)); tree = render(DualIncomeYearEndClient);
      for (let credit = 0; credit <= children; credit++) {
        select(tree, "di-credit-children", String(credit)); tree = render(DualIncomeYearEndClient);
        for (const [salaryMe, coupleMedical] of [["60,000,000", "3,000,000"], ["", ""], ["1", "0"], ["30,000,000", "120,000,000"]]) {
          type(tree, "di-salaryMe", salaryMe); type(tree, "di-coupleMedical", coupleMedical); tree = render(DualIncomeYearEndClient);
          const rows = allocation(tree);
          expect(rows, `children ${children} credit ${credit} salary ${salaryMe} med ${coupleMedical}`).toHaveLength(children > 0 ? 4 : 1);
          const visible = rows.filter((row) => row.hidden === undefined).length;
          counts.add(`${children > 0}:${visible}`);
          // 빈 줄은 맨 끝에만, 많아야 1줄 (사라질 수 있는 줄은 부부 상호 의료비 줄 하나뿐)
          expect(rows.slice(0, visible).every((row) => row.hidden === undefined)).toBe(true);
          expect(rows.length - visible).toBeLessThanOrEqual(1);
        }
      }
    }
    expect([...counts].sort()).toEqual(["false:1", "true:3", "true:4"]);
  });
});
