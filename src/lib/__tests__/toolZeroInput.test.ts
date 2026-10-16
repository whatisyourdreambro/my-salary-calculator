import { isValidElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ values: [] as unknown[], index: 0, changes: [] as { index: number; value: unknown }[] }));
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return { ...actual, useId: () => ":tool-zero:", useState: () => {
    const index = state.index++;
    return [state.values[index], (value: unknown) => state.changes.push({ index, value })];
  } };
});
vi.mock("@/components/NumberInput", () => ({ default: () => null }));

import CagrCalculator from "@/components/calculators/finance/CagrCalculator";
import { PercentCalculator } from "@/components/calculators/math/MathCalculators";

function reset(values: unknown[]) { state.values = values; state.index = 0; state.changes = []; }
function findElement(tree: unknown, predicate: (element: ReactElement<Record<string, unknown>>) => boolean): ReactElement<Record<string, unknown>> | undefined {
  if (!isValidElement(tree)) return undefined;
  const element = tree as ReactElement<Record<string, unknown>>;
  if (predicate(element)) return element;
  const children = element.props.children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
}
function cagr(start: number | "", end: number | "", years: number | "") {
  reset([start, end, years]);
  return renderToStaticMarkup(CagrCalculator());
}
function percent(first: string, whole: string, mode: "of" | "is") {
  reset([first, whole, mode, "이전 결과"]);
  const button = findElement(PercentCalculator(), e => e.type === "button" && e.props.children === "계산하기");
  (button?.props.onClick as () => void)();
  return state.changes.find(x => x.index === 3)?.value;
}

describe("CAGR 실제 컴포넌트의 0값·빈 입력", () => {
  it("종료금액 0은 전액 손실 -100%를 표시한다", () => { expect(cagr(100, 0, 1)).toContain("-100.00%"); });
  it("유효한 동일값과 손실은 0%와 음수 수익률을 표시한다", () => {
    expect(cagr(100, 100, 1)).toContain("0.00%");
    expect(cagr(100, 50, 1)).toContain("-50.00%");
  });
  it.each([[0, 100, 1], [100, 100, 0], ["", 100, 1], [100, "", 1], [100, 100, ""]] as [number | "", number | "", number | ""][])("분모0·기간0·빈입력은 수익률을 표시하지 않는다 (%s,%s,%s)", (start, end, years) => {
    const html = cagr(start, end, years);
    expect(html).toContain("—");
    expect(html).not.toMatch(/NaN|Infinity|0\.00%/);
  });
  it("종료금액 입력을 비우면 숫자0으로 바꾸지 않는다", () => {
    reset([100, 50, 1]);
    const field = findElement(CagrCalculator(), e => e.props.id === ":tool-zero:-end");
    (field?.props.onChange as (event: { target: { value: string } }) => void)({ target: { value: "" } });
    expect(state.changes).toContainEqual({ index: 1, value: "" });
  });
});

describe("퍼센트 실제 버튼의 유효한 0값", () => {
  it("0% 및 전체0의 비율 계산은 결과0으로 이전 결과를 대체한다", () => {
    expect(percent("0", "100", "of")).toBe("100의 0%는 0 입니다.");
    expect(percent("10", "0", "of")).toBe("0의 10%는 0 입니다.");
  });
  it("0분자는 0%를 표시하고 0분모는 이전 결과를 지운다", () => {
    expect(percent("0", "100", "is")).toBe("0은(는) 100의 0.00% 입니다.");
    expect(percent("100", "0", "is")).toBeNull();
  });
  it("빈 입력은 이전 결과를 지우고 정상 음수는 그대로 계산한다", () => {
    expect(percent("", "100", "of")).toBeNull();
    expect(percent("10", "", "is")).toBeNull();
    expect(percent("-10", "100", "of")).toBe("100의 -10%는 -10 입니다.");
    expect(percent("-30", "100", "is")).toBe("-30은(는) 100의 -30.00% 입니다.");
  });
});
