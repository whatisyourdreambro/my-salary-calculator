import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import LoanCalculator from "@/components/calculators/LoanCalculator";
import DepositCalculator from "@/components/calculators/DepositCalculator";
import SimpleCalculatorView from "@/components/SimpleCalculatorView";
import EnglishToolCalculator from "@/components/english/EnglishToolCalculator";
import YearEndTaxCalculator from "@/components/YearEndTaxCalculator";
import MoneyInput from "@/components/ui/MoneyInput";
import NumberInput from "@/components/NumberInput";
import CurrencyInput from "@/components/CurrencyInput";
import ResultSharePanel from "@/components/ResultSharePanel";
import { CalcResultAd } from "@/components/AdPlacement";
import type { CalculatorDef, ClientCalculatorDef } from "@/lib/simpleCalculators/types";

type Slot = { value?: unknown; dependencies?: readonly unknown[]; cleanup?: (() => void) | void };
const fixture = vi.hoisted(() => ({ slots: [] as Slot[], cursor: 0, dirty: false,
  pending: [] as Array<{ slot: Slot; create: () => void | (() => void); dependencies?: readonly unknown[] }>,
  load: vi.fn(),
}));
vi.mock("react", async (original) => ({ ...await original<typeof import("react")>(),
  useState: (initial: unknown) => {
    const slot = fixture.slots[fixture.cursor++] ??= { value: typeof initial === "function" ? initial() : initial };
    return [slot.value, (value: unknown) => { const next = typeof value === "function" ? value(slot.value) : value;
      if (!Object.is(next, slot.value)) { slot.value = next; fixture.dirty = true; } }];
  },
  useRef: (initial: unknown) => (fixture.slots[fixture.cursor++] ??= { value: { current: initial } }).value,
  useId: () => "accessible-fixture",
  useMemo: (create: () => unknown) => create(), useCallback: (callback: unknown) => callback,
  useEffect: (create: () => void | (() => void), dependencies?: readonly unknown[]) => {
    const slot = fixture.slots[fixture.cursor++] ??= {};
    if (!slot.dependencies || !dependencies || dependencies.some((v, i) => !Object.is(v, slot.dependencies?.[i]))) fixture.pending.push({ slot, create, dependencies });
  },
}));
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), usePathname: () => "/" }));
vi.mock("@/lib/simpleCalculators/computeLoader", () => ({ loadCalculatorCompute: (...args: unknown[]) => fixture.load(...args) }));
vi.mock("@/hooks/useCalculatorMeasurement", () => ({ useCalculatorMeasurement: () => ({ inputProps: {}, resultRef: () => {} }) }));
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => null, GuideMidAd: () => null, InArticleAd: () => null }));
vi.mock("@/components/ResultSharePanel", () => ({ default: () => null }));
vi.mock("@/components/AppLink", () => ({ default: "a" }));

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
function render(component: () => unknown) {
  for (let i = 0; i < 12; i++) {
    fixture.cursor = 0; fixture.pending = []; fixture.dirty = false;
    const tree = component();
    for (const { slot, create, dependencies } of fixture.pending) { slot.cleanup?.(); slot.dependencies = dependencies; slot.cleanup = create(); }
    if (!fixture.dirty) return tree;
  }
  throw new Error("Offline component fixture did not settle");
}
function field(tree: unknown, id: string) { return nodes(tree).find(node => node.type === NumberInput && node.props.id === id)!; }
function change(tree: unknown, id: string, value: string) { (field(tree, id).props.onChange as (e: unknown) => void)({ target: { value } }); }
function announcement(tree: unknown, family: string) {
  const node = nodes(tree).find(node => node.props["data-calculation-announcement"] === family)!;
  expect(node.props.role).toBe("status"); expect(node.props["aria-live"]).toBe("polite"); expect(String(node.props["aria-atomic"])).toBe("true");
  // Only a final text value is live: animated values, controls and ad nodes stay outside.
  expect(typeof node.props.children).toBe("string"); return text(node);
}
beforeEach(() => { fixture.slots = []; fixture.pending = []; fixture.cursor = 0; fixture.load.mockReset(); fixture.load.mockReturnValue(new Promise(() => {})); vi.stubGlobal("fetch", () => { throw new Error("Network forbidden"); }); });
afterEach(() => { fixture.slots.forEach(slot => slot.cleanup?.()); vi.unstubAllGlobals(); });

describe("calculation result/error accessibility (offline hook and element fixture)", () => {
  it("forwards field error semantics through MoneyInput without altering its numeric parser", () => {
    const changed = vi.fn(); const tree = render(() => MoneyInput({ label: "소득", value: "0", onValueChange: changed, "aria-invalid": true, "aria-describedby": "income-error" }));
    const input = nodes(tree).find(node => node.type === NumberInput)!;
    expect(input.props["aria-invalid"]).toBe(true); expect(input.props["aria-describedby"]).toBe("income-error");
    (input.props.onChange as (e: unknown) => void)({ target: { value: "12,000" } }); expect(changed).toHaveBeenLastCalledWith("12,000");
    (input.props.onChange as (e: unknown) => void)({ target: { value: "" } }); expect(changed).toHaveBeenLastCalledWith("0");
  });

  it.each([{ family: "loan", Component: LoanCalculator, maximum: 50, amount: "120000", term: "1", expected: "₩120,000" },
    { family: "deposit", Component: DepositCalculator, maximum: 600, amount: "120000", term: "12", expected: "₩120,000" }])("$family retains zero-interest arithmetic and associates invalid term / recovery", ({ family, Component, maximum, amount, term, expected }) => {
    let tree = render(Component); change(tree, `${family}-amount`, amount); change(tree, `${family}-rate`, "0"); change(tree, `${family}-term`, term); tree = render(Component);
    expect(announcement(tree, family)).toContain(expected);
    for (const invalid of ["", String(maximum + 1), "1.5"]) {
      change(tree, `${family}-term`, invalid); tree = render(Component);
      expect(field(tree, `${family}-term`).props["aria-invalid"]).toBe(true);
      expect(field(tree, `${family}-term`).props["aria-describedby"]).toBe(`${family}-input-error`);
      expect(nodes(tree).find(node => node.props.id === `${family}-input-error`)?.props.role).toBe("status");
      expect(announcement(tree, family)).toBe("");
    }
    change(tree, `${family}-term`, String(maximum)); tree = render(Component);
    expect(field(tree, `${family}-term`).props["aria-invalid"]).toBe(false); expect(announcement(tree, family)).toContain(expected);
    expect(nodes(tree).some(node => node.props.id === `${family}-input-error`)).toBe(false);
  });

  it.each([{ family: "loan", Component: LoanCalculator }, { family: "deposit", Component: DepositCalculator }])("$family explains non-finite calculation and recovers without changing its numeric limits", ({ family, Component }) => {
    let tree = render(Component); change(tree, `${family}-amount`, "1e308"); change(tree, `${family}-rate`, "1e308"); tree = render(Component);
    expect(text(tree)).toContain("계산 가능한 수치 범위를 넘었습니다"); expect(announcement(tree, family)).toBe("");
    change(tree, `${family}-amount`, "120000"); change(tree, `${family}-rate`, "0"); tree = render(Component);
    expect(text(tree)).not.toContain("계산 가능한 수치 범위를 넘었습니다"); expect(announcement(tree, family)).toContain("₩120,000");
  });

  const calc: ClientCalculatorDef = { slug: "fixture", title: "Fixture", description: "Offline only", category: "loan", categoryLabel: "대출", keywords: [], fields: [{ name: "amount", label: "금액", defaultValue: 10, min: 0, max: 100, suffix: "원" }] };
  const compute: CalculatorDef["compute"] = ({ amount }) => ({ primary: { label: "최종 금액", value: amount * 2, suffix: "원" } });
  function simple() {
    const wrapper = SimpleCalculatorView({ slug: "fixture", calc, batch: "batch1", initialResult: compute({ amount: 10 }) });
    const instance = (wrapper.props.children as unknown as Element[])[1]; return (instance.type as (p: unknown) => unknown)(instance.props);
  }
  it("failed lazy import keeps the server default, but edited input no longer claims perpetual loading or sharing", async () => {
    let reject!: (error: Error) => void; fixture.load.mockReturnValue(new Promise((_, fail) => { reject = fail; }));
    let tree = render(simple); expect(announcement(tree, "simple")).toBe("최종 금액: 20원");
    reject(new Error("Synthetic chunk failure")); await Promise.resolve(); await Promise.resolve(); tree = render(simple);
    expect(announcement(tree, "simple")).toBe("최종 금액: 20원");
    change(tree, "accessible-fixtureamount", "12"); tree = render(simple);
    expect(text(tree)).toContain("현재 입력의 계산 결과를 불러오지 못해 공유할 수 없습니다");
    expect(text(tree)).not.toContain("계산 준비 중"); expect(text(tree)).not.toContain("계산 모듈을 불러오는 중");
    expect(nodes(tree).find(node => node.props["aria-label"] === "현재 조건의 계산 결과")?.props["aria-busy"]).toBe(false);
    expect(nodes(tree).some(node => node.type === ResultSharePanel)).toBe(false); expect(nodes(tree).filter(node => node.type === CalcResultAd)).toHaveLength(1);
  });
  it("a lazy result announces the final value, clears it for empty/out-of-range inputs, and restores sharing only for valid results", async () => {
    fixture.load.mockResolvedValue(compute); let tree = render(simple); await Promise.resolve(); tree = render(simple);
    change(tree, "accessible-fixtureamount", "12"); tree = render(simple); expect(announcement(tree, "simple")).toBe("최종 금액: 24원");
    for (const invalid of ["", "101"]) { change(tree, "accessible-fixtureamount", invalid); tree = render(simple); expect(announcement(tree, "simple")).toBe(""); expect(field(tree, "accessible-fixtureamount").props["aria-invalid"]).toBe(true); expect(nodes(tree).some(node => node.type === ResultSharePanel)).toBe(false); }
    change(tree, "accessible-fixtureamount", "100"); tree = render(simple); expect(announcement(tree, "simple")).toBe("최종 금액: 200원");
    const all = nodes(tree); expect(all.findIndex(node => node.type === CalcResultAd)).toBeLessThan(all.findIndex(node => node.type === ResultSharePanel));
    const panel = all.find(node => node.type === ResultSharePanel)!;
    expect(panel.props.url).toBe("https://www.moneysalary.com/calc/fixture");
    expect(panel.props.imageUrl).toBeUndefined();
    expect(panel.props.previewDescription).toContain("링크로 입력 조건을 복원할 수 없습니다");
    expect(panel.props.title).toContain("200원");
  });
  // B08 IVT-05 (2026-11-01): while a field is being edited (empty, out of range, a zero divisor, a model-invalid
  // result or a compute chunk still loading) the result card keeps the rows of the last valid result — same labels,
  // values '—' — so the CalcResultAd right below the card does not move while the user types.
  const shapeCalc: ClientCalculatorDef = { slug: "shape-fixture", title: "Shape", description: "Offline only", category: "loan", categoryLabel: "대출", keywords: [],
    fields: [{ name: "amount", label: "금액", defaultValue: 600_000, min: 0, max: 1e9, suffix: "원" }, { name: "months", label: "기간", defaultValue: 12, min: 0, max: 600, suffix: "개월" }] };
  // months 600 mimics expandedFinance's invalid(): a model-invalid result with an empty secondary list.
  // The verdict label depends on the computed value, like bmi-quick's '판정: …'.
  const shapeCompute: CalculatorDef["compute"] = ({ amount, months }) => months === 600
    ? { status: "invalid", primary: { label: "입력 조건 확인", value: 0, suffix: "원" }, secondary: [], note: "기간을 599개월 이하로 입력해 주세요." }
    : { primary: { label: "월 납입액", value: amount / months, suffix: "원" },
      secondary: [{ label: "총 납입액", value: amount, suffix: "원" }, { label: amount / months >= 100_000 ? "판정: 큼" : "판정: 작음", value: months, suffix: "개월" }],
      note: "예시 계산입니다." };
  function shapeView() {
    const wrapper = SimpleCalculatorView({ slug: "shape-fixture", calc: shapeCalc, batch: "batch1", initialResult: shapeCompute({ amount: 600_000, months: 12 }) });
    const instance = (wrapper.props.children as unknown as Element[])[1]; return (instance.type as (p: unknown) => unknown)(instance.props);
  }
  function resultShape(tree: unknown) {
    const section = nodes(tree).find(node => node.props["aria-label"] === "현재 조건의 계산 결과")!;
    const children = [section.props.children].flat(Infinity).filter((child): child is Element => Boolean(child) && typeof child === "object" && "props" in (child as object));
    const approx = children.find(node => node.type === "p" && String(node.props.className).startsWith("mt-2 text-sm"));
    const rowsBlock = children.find(node => node.type === "div" && String(node.props.className).includes("border-t"));
    const note = children.find(node => node.type === "p" && String(node.props.className).startsWith("mt-5 pt-5"));
    const rows = rowsBlock ? nodes(rowsBlock.props.children).filter(node => String(node.props.className).startsWith("flex flex-wrap"))
      .map(node => (node.props.children as Element[]).map(span => text(span).trim())) : [];
    return { elements: children.length, value: text(children[2]).trim(), approx: approx ? text(approx).trim() : null, approxHidden: approx?.props["aria-hidden"],
      labels: rows.map(([label]) => label), values: rows.map(([, value]) => value), rowsHidden: rowsBlock?.props["aria-hidden"],
      note: note ? text(note) : null, noteRole: note?.props.role };
  }
  // Stage s2 sweep repair (2026-11-02): a message the last valid card did not show (zero divisor status, model-invalid
  // explanation, a note only the edited input has) is no longer added as a note block under the kept '—' rows. It sits right
  // under the value, and an invisible copy of the last valid card below the value (≈ slot, gap, rows, note) shares its grid
  // cell, so the card keeps the valid height and the CalcResultAd below it does not move down.
  function messageShape(tree: unknown) {
    const elementsOf = (value: unknown) => [value].flat(Infinity).filter((child): child is Element => Boolean(child) && typeof child === "object" && "props" in (child as object));
    const section = nodes(tree).find(node => node.props["aria-label"] === "현재 조건의 계산 결과")!;
    const children = elementsOf(section.props.children);
    const grid = children.find(node => node.type === "div" && node.props.className === "grid");
    if (!grid) return null;
    const [message, reserve, ...rest] = elementsOf(grid.props.children);
    const parts = elementsOf(reserve.props.children);
    const rowsBlock = parts.find(node => node.type === "div" && String(node.props.className).includes("border-t"));
    const rows = rowsBlock ? nodes(rowsBlock.props.children).filter(node => String(node.props.className).startsWith("flex flex-wrap"))
      .map(node => (node.props.children as Element[]).map(span => text(span).trim())) : [];
    return { elements: children.length, gridIndex: children.indexOf(grid), extra: rest.length, value: text(children[2]).trim(),
      message: text(message), messageTag: message.type, messageRole: message.props.role, messageClass: String(message.props.className),
      reserveHidden: reserve.props["aria-hidden"], reserveClass: String(reserve.props.className),
      reserveClasses: parts.map(node => String(node.props.className)), reserveText: parts.filter(node => node !== rowsBlock).map(node => text(node).trim()),
      labels: rows.map(([label]) => label), values: rows.map(([, value]) => value) };
  }
  // The valid card's elements below the value, in order: ≈ line, gap, rows block, note — the overlay copies these classes.
  const VALID_BELOW_VALUE = ["mt-2 text-sm text-primary-foreground", "mb-6", "border-t border-white/20 pt-5 space-y-2", "mt-5 pt-5 border-t border-white/20 text-xs text-white/85 leading-relaxed"];
  it("invalid states keep the same result row count, labels from the last valid result and the note slot", async () => {
    fixture.load.mockResolvedValue(shapeCompute); let tree = render(shapeView); await Promise.resolve(); tree = render(shapeView);
    const valid = resultShape(tree);
    expect(valid).toMatchObject({ elements: 7, value: "50,000원", approx: "≈ 5만원", labels: ["총 납입액", "판정: 작음"], values: ["600,000원", "12개월"], note: "예시 계산입니다." });
    expect(valid.approxHidden).toBeUndefined(); expect(valid.rowsHidden).toBeUndefined(); expect(valid.noteRole).toBeUndefined();
    // Empty or out-of-range input whose result keeps the valid view's own note: the '—' rows and the same note stay visible.
    // (The zero divisor and model-invalid messages are covered by the message overlay test below.)
    const cases = [
      { id: "amount", raw: "", value: "입력값 확인", note: "예시 계산입니다.", role: undefined },
      { id: "amount", raw: "2000000000", value: "입력값 확인", note: "예시 계산입니다.", role: undefined },
    ];
    for (const { id, raw, value, note, role } of cases) {
      change(tree, `accessible-fixture${id}`, raw); tree = render(shapeView);
      const editing = resultShape(tree);
      expect(editing, `${id}=${raw}`).toMatchObject({ elements: valid.elements, value, approx: "—", approxHidden: "true", labels: valid.labels, values: ["—", "—"], rowsHidden: "true", note });
      expect(editing.noteRole, `${id}=${raw}`).toBe(role);
      expect(messageShape(tree), `${id}=${raw}`).toBeNull();
      expect(announcement(tree, "simple")).toBe("");
      change(tree, `accessible-fixture${id}`, id === "amount" ? "600000" : "12"); tree = render(shapeView);
      expect(resultShape(tree)).toEqual(valid);
    }
    // a small valid value has no ≈ line, and the editing state mirrors it (no '—' line appears)
    change(tree, "accessible-fixtureamount", "1200"); tree = render(shapeView);
    const small = resultShape(tree); expect(small).toMatchObject({ elements: 6, approx: null, labels: ["총 납입액", "판정: 작음"] });
    change(tree, "accessible-fixtureamount", ""); tree = render(shapeView);
    expect(resultShape(tree)).toMatchObject({ elements: small.elements, approx: null, labels: small.labels, values: ["—", "—"] });
  });
  it("a message the valid card did not show overlays an invisible copy of the valid card instead of adding a note block", async () => {
    fixture.load.mockResolvedValue(shapeCompute); let tree = render(shapeView); await Promise.resolve(); tree = render(shapeView);
    const valid = resultShape(tree);
    const validSection = nodes(tree).find(node => node.props["aria-label"] === "현재 조건의 계산 결과")!;
    const validChildren = [validSection.props.children].flat(Infinity).filter((child): child is Element => Boolean(child) && typeof child === "object" && "props" in (child as object));
    expect(validChildren.slice(3).map(node => String(node.props.className))).toEqual(VALID_BELOW_VALUE);
    const cases = [
      // 0 divisor: the status (role=status) sits right under the value; the zero-input verdict label ('판정: 큼') is not shown
      { raw: "0", message: "0으로 입력된 항목(기간)이 있어 계산할 수 없습니다. 0보다 큰 값을 입력해 주세요.", role: "status" },
      // model-invalid result with secondary: [] — its explanation takes the place of the '—' rows instead of being added below
      { raw: "600", message: "기간을 599개월 이하로 입력해 주세요.", role: undefined },
    ];
    for (const { raw, message, role } of cases) {
      change(tree, "accessible-fixturemonths", raw); tree = render(shapeView);
      const shape = messageShape(tree)!;
      expect(shape, `months=${raw}`).toMatchObject({ elements: 4, gridIndex: 3, extra: 0, value: "입력값 확인", message, messageTag: "p", reserveHidden: "true",
        reserveClasses: VALID_BELOW_VALUE, reserveText: ["—", "", "예시 계산입니다."], labels: valid.labels, values: ["—", "—"] });
      expect(shape.messageRole, `months=${raw}`).toBe(role);
      expect(shape.messageClass).toBe("col-start-1 row-start-1 mt-2 text-xs leading-relaxed text-white/85");
      expect(shape.reserveClass).toBe("invisible col-start-1 row-start-1");
      // nothing else below the value: no visible '—' line, rows or note block next to the overlay
      expect(resultShape(tree)).toMatchObject({ approx: null, labels: [], note: null });
      expect(announcement(tree, "simple")).toBe("");
      change(tree, "accessible-fixturemonths", "12"); tree = render(shapeView);
      expect(resultShape(tree)).toEqual(valid); expect(messageShape(tree)).toBeNull();
    }
  });
  // Like loan-total-interest and cagr-quick: one row and no note in the valid view, where B08 added a whole note block.
  const plainCalc: ClientCalculatorDef = { slug: "plain-fixture", title: "Plain", description: "Offline only", category: "loan", categoryLabel: "대출", keywords: [],
    fields: [{ name: "amount", label: "대출액", defaultValue: 100_000_000, min: 0, max: 1e12, suffix: "원" }, { name: "years", label: "기간", defaultValue: 30, min: 0, max: 50, suffix: "년" }] };
  const plainCompute: CalculatorDef["compute"] = ({ amount, years }) => years <= 0
    ? { primary: { label: "총 이자", value: NaN, suffix: "원" }, note: "기간은 1년 이상이어야 계산할 수 있습니다." }
    : { primary: { label: "총 이자", value: amount * 0.7, suffix: "원" }, secondary: [{ label: "원금 대비 비율", value: (amount * 0.7 / amount) * 100, suffix: "%" }] };
  function plainView() {
    const wrapper = SimpleCalculatorView({ slug: "plain-fixture", calc: plainCalc, batch: "batch1", initialResult: plainCompute({ amount: 100_000_000, years: 30 }) });
    const instance = (wrapper.props.children as unknown as Element[])[1]; return (instance.type as (p: unknown) => unknown)(instance.props);
  }
  it("without a valid note, a message overlays the '—' slots and adds no note block; plain editing keeps the visible '—' slots", async () => {
    fixture.load.mockResolvedValue(plainCompute); let tree = render(plainView); await Promise.resolve(); tree = render(plainView);
    const valid = resultShape(tree);
    expect(valid).toMatchObject({ elements: 6, approx: "≈ 7,000만원", labels: ["원금 대비 비율"], values: ["70.00%"], note: null });
    change(tree, "accessible-fixtureamount", ""); tree = render(plainView);
    expect(resultShape(tree)).toMatchObject({ elements: 6, value: "입력값 확인", approx: "—", labels: ["원금 대비 비율"], values: ["—"], note: null });
    expect(messageShape(tree)).toBeNull();
    change(tree, "accessible-fixtureamount", "100000000"); tree = render(plainView); expect(resultShape(tree)).toEqual(valid);
    const cases = [
      { id: "amount", raw: "0", message: "0으로 입력된 항목(대출액)이 있어 계산할 수 없습니다. 0보다 큰 값을 입력해 주세요.", role: "status", restore: "100000000" },
      // a note that only the edited input has (like cagr-quick with 기간 emptied) is a message as well
      { id: "years", raw: "", message: "기간은 1년 이상이어야 계산할 수 있습니다.", role: undefined, restore: "30" },
    ];
    for (const { id, raw, message, role, restore } of cases) {
      change(tree, `accessible-fixture${id}`, raw); tree = render(plainView);
      const shape = messageShape(tree)!;
      expect(shape, `${id}=${raw}`).toMatchObject({ elements: 4, gridIndex: 3, extra: 0, value: "입력값 확인", message, reserveHidden: "true",
        reserveClasses: VALID_BELOW_VALUE.slice(0, 3), reserveText: ["—", ""], labels: ["원금 대비 비율"], values: ["—"] });
      expect(shape.messageRole, `${id}=${raw}`).toBe(role);
      expect(resultShape(tree)).toMatchObject({ approx: null, labels: [], note: null });
      expect(announcement(tree, "simple")).toBe("");
      change(tree, `accessible-fixture${id}`, restore); tree = render(plainView);
      expect(resultShape(tree)).toEqual(valid); expect(messageShape(tree)).toBeNull();
    }
  });
  it("while the compute chunk is still loading, an edited input keeps the server result's ≈ line and rows", () => {
    let tree = render(shapeView); expect(resultShape(tree)).toMatchObject({ elements: 7, approx: "≈ 5만원", labels: ["총 납입액", "판정: 작음"], note: "예시 계산입니다." });
    change(tree, "accessible-fixtureamount", "700000"); tree = render(shapeView);
    // There is no result for the edited input yet, so there is no note to show (unchanged behaviour).
    expect(resultShape(tree)).toMatchObject({ elements: 6, value: "계산 준비 중…", approx: "—", labels: ["총 납입액", "판정: 작음"], values: ["—", "—"], note: null });
  });
  it("English loan final result agrees with the displayed primary metric and clears on invalid input", () => {
    const component = () => { const element = EnglishToolCalculator({ slug: "loan" }); return (element.type as (p: unknown) => unknown)(element.props); };
    let tree = render(component); change(tree, "english-tool-principal", "12000"); change(tree, "english-tool-annualRate", "0"); change(tree, "english-tool-months", "12"); tree = render(component);
    expect(announcement(tree, "english-tool")).toContain("1,000"); expect(text(nodes(tree).find(node => node.props["data-metric"] === "payment"))).toContain("1,000");
    change(tree, "english-tool-months", ""); tree = render(component); expect(announcement(tree, "english-tool")).toBe(""); expect(field(tree, "english-tool-months").props["aria-invalid"]).toBe(true); expect(text(tree)).toContain("No current result");
  });
  it("year-end tax announces the final refund/payment value rather than CountUp animation frames", () => {
    let tree = render(YearEndTaxCalculator);
    const prepaid = nodes(tree).find(node => node.type === CurrencyInput && String(node.props.label).startsWith("기납부세액"))!;
    (prepaid.props.onValueChange as (v: string) => void)("0"); tree = render(YearEndTaxCalculator);
    expect(announcement(tree, "year-end-tax")).toContain("예상 추가 납부액");
    const updated = nodes(tree).find(node => node.type === CurrencyInput && String(node.props.label).startsWith("기납부세액"))!;
    (updated.props.onValueChange as (v: string) => void)("10000000"); tree = render(YearEndTaxCalculator);
    expect(announcement(tree, "year-end-tax")).toContain("예상 환급액"); expect(announcement(tree, "year-end-tax")).toContain("지방소득세는 별도");
  });
});
