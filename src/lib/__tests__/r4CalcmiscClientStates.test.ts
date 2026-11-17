// R4 CALCMISC (2026-11-18) — 입력 상태별 클라이언트 렌더 회귀. 훅 대역(calcResultEditingShape.test.ts 와 같은 방식)으로
// 컴포넌트 함수를 직접 불러 요소 트리를 본다.
//  · N2-calc-17 calc-04-F16 /calc/smb-income-tax-break: 입력 만 나이 1~14세는 '만 15세 미만' 문구(종전 '만 34세 초과').
//  · N2-calc-17 calc-01-F11 /calc 목록: 검색·분야 선택 상태에서 첫 묶음을 한 격자로(6·7번째 카드 줄 간격 16px), 묶음 아래 여백 -16px.
//  · N2-calc-20 /calc/dependent-check: 출생연도를 고쳐 쓰는 동안 마지막 정상 판정 카드를 보이지 않게 남겨 자리 유지(운영자 승인 2026-11-17).
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
  useRef: (initial: unknown) => {
    const slot = fixture.slots[fixture.cursor++] ??= { value: { current: initial } };
    return slot.value;
  },
}));
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => null, HomeTopAd: () => null, GuideMidAd: () => null, InArticleAd: () => null, Display2Ad: () => null, MultiplexAd: () => null }));
vi.mock("@/components/AppLink", () => ({ default: "a" }));

import SmbTaxBreakClient from "@/app/calc/smb-income-tax-break/Client";
import CalcIndexClient from "@/app/calc/CalcIndexClient";
import CalcIndexPage from "@/app/calc/page";
import DependentCheckClient from "@/app/calc/dependent-check/Client";
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
function render(component: () => unknown) { fixture.cursor = 0; return component(); }
beforeEach(() => { fixture.slots = []; fixture.cursor = 0; });

describe("/calc/smb-income-tax-break — 청년 연령 문구 (calc-04-F16)", () => {
  const ageLine = (tree: unknown) => nodes(tree).find((n) => n.type === "p" && String(n.props.className).startsWith("mt-3 text-sm font-bold"))!;
  const typeAge = (tree: unknown, value: string) =>
    (nodes(tree).find((n) => n.type === NumberInput && n.props.id === "smb-age")!.props.onChange as (e: unknown) => void)({ target: { value } });

  it("기본(만 29세)은 충족 문구 그대로", () => {
    const tree = render(SmbTaxBreakClient);
    expect(text(ageLine(tree))).toBe("병역 차감 후 환산 29세 — 청년 연령 요건 충족");
  });

  it("만 3세(35 를 고쳐 쓰는 중)는 '만 15세 미만' — '만 34세 초과'가 아니다", () => {
    let tree = render(SmbTaxBreakClient);
    typeAge(tree, "3"); tree = render(SmbTaxBreakClient);
    const line = ageLine(tree);
    expect(text(line)).toBe("만 15세 미만 — 청년 요건(만 15~34세) 미충족");
    expect(String(line.props.className)).toContain("text-red-500");
    for (const age of ["1", "14"]) {
      typeAge(tree, age); tree = render(SmbTaxBreakClient);
      expect(text(ageLine(tree)), age).toBe("만 15세 미만 — 청년 요건(만 15~34세) 미충족");
    }
    typeAge(tree, "15"); tree = render(SmbTaxBreakClient);
    expect(text(ageLine(tree))).toBe("병역 차감 후 환산 15세 — 청년 연령 요건 충족");
    typeAge(tree, "40"); tree = render(SmbTaxBreakClient);
    expect(text(ageLine(tree))).toContain("만 34세 초과로 청년 요건 미충족");
    typeAge(tree, ""); tree = render(SmbTaxBreakClient);
    expect(text(ageLine(tree))).toBe("만 나이를 입력하면 연령 요건을 판정합니다");
  });
});

describe("/calc 목록 — 검색·분야 선택 상태의 첫 묶음 (calc-01-F11)", () => {
  const props = (() => {
    const find = (v: unknown): Element | undefined => nodes(v).find((n) => n.type === CalcIndexClient);
    return find(CalcIndexPage())!.props as Parameters<typeof CalcIndexClient>[0];
  })();
  const view = () => render(() => CalcIndexClient(props));
  const sections = (tree: unknown) => nodes(tree).filter((n) => n.type === "section" && String(n.props.id).startsWith("cat-"));
  const grids = (section: Element) => nodes(section.props.children).filter((n) => n.type === "div" && String(n.props.className).startsWith("grid gap-4"));
  const cards = (section: Element) => grids(section).flatMap((g) => nodes(g.props.children).filter((n) => n.type === "a" || typeof n.type === "function" && n.props.href !== undefined));
  const adWrappers = (section: Element) => nodes(section.props.children).filter((n) => n.type === "div" && String(n.props.className) === "my-8 border-y border-border py-6");
  const chip = (tree: unknown, label: string) => nodes(tree).find((n) => n.type === "button" && n.props["aria-pressed"] !== undefined && text(n).startsWith(label))!;
  const search = (tree: unknown, value: string) => (nodes(tree).find((n) => n.type === "input" && n.props.type === "search")!.props.onChange as (e: unknown) => void)({ target: { value } });

  it("기본 목록: 첫 묶음은 6장 + 광고 + 나머지 두 격자, mb-12 (종전 그대로)", () => {
    const first = sections(view())[0];
    expect(first.props.className).toBe("mb-12 scroll-mt-64");
    expect(grids(first)).toHaveLength(2);
    expect(adWrappers(first)).toHaveLength(1);
    expect(sections(view()).every((s) => s.props.className === "mb-12 scroll-mt-64")).toBe(true);
  });

  it("'시즌·전용 계산기' 분야 선택: 한 격자 + mb-8 (줄 간격 +16px, 아래 여백 -16px)", () => {
    let tree = view();
    (chip(tree, "시즌·전용 계산기").props.onClick as () => void)(); tree = view();
    const all = sections(tree);
    expect(all).toHaveLength(1);
    expect(all[0].props.className).toBe("mb-8 scroll-mt-64");
    expect(grids(all[0])).toHaveLength(1);
    expect(adWrappers(all[0])).toHaveLength(0);
    expect(cards(all[0]).length).toBe(props.featured.length);
  });

  it("검색어로 첫 묶음이 6장을 넘으면 같은 처리, 6장 이하면 종전대로 mb-12 한 격자", () => {
    let tree = view();
    search(tree, "계산기"); tree = view();
    const [first, ...rest] = sections(tree);
    expect(cards(first).length).toBeGreaterThan(6);
    expect(first.props.className).toBe("mb-8 scroll-mt-64");
    expect(grids(first)).toHaveLength(1);
    expect(rest.every((s) => s.props.className === "mb-12 scroll-mt-64")).toBe(true);
    search(tree, "대환대출"); tree = view();
    const few = sections(tree)[0];
    expect(cards(few).length).toBeLessThanOrEqual(6);
    expect(few.props.className).toBe("mb-12 scroll-mt-64");
    expect(grids(few)).toHaveLength(1);
  });
});

describe("/calc/dependent-check — 출생연도 입력 중 결과 자리 유지 (N2-calc-20)", () => {
  const root = (tree: unknown) => tree as Element;
  const kids = (node: Element) => [node.props.children].flat(Infinity).filter((c): c is Element => Boolean(c) && typeof c === "object" && "props" in (c as object));
  // 결과 자리 = CalcResultAd 바로 앞 형제
  const resultSlot = (tree: unknown) => {
    const list = kids(root(tree));
    const ad = list.findIndex((n) => n.type === CalcResultAd);
    expect(ad).toBeGreaterThan(0);
    return list[ad - 1];
  };
  const birthInput = (tree: unknown) => nodes(tree).find((n) => n.type === "input" && n.props.id === "dc-birth")!;
  const typeYear = (tree: unknown, value: string) => (birthInput(tree).props.onChange as (e: unknown) => void)({ target: { value } });
  const helper = (tree: unknown) => nodes(tree).find((n) => n.type === "p" && /귀속 기준 만 \d+세로 판정합니다/.test(text(n)));
  const shape = (card: Element): string[] => nodes(card).map((n) => `${String(n.type)}:${n.type === "div" || n.type === "p" ? String(n.props.className ?? "").replace(/^invisible col-start-1 row-start-1 /, "") : ""}`);

  it("첫 화면(1958): 카드가 그대로 CalcResultAd 바로 앞, 도움말 줄은 보이는 그대로", () => {
    const tree = render(DependentCheckClient);
    const slot = resultSlot(tree);
    expect(slot.type).toBe("div");
    expect(slot.props.className).toBe("rounded-2xl overflow-hidden");
    expect(slot.props["aria-hidden"]).toBeUndefined();
    const h = helper(tree)!;
    expect(h.props.className).toBe("text-[11px] text-faint-blue mt-1.5");
    expect(h.props["aria-hidden"]).toBeUndefined();
    expect(text(h)).toBe("2026년 귀속 기준 만 68세로 판정합니다.");
  });

  it("'195' 입력 중: 같은 칸에 지난 판정 카드(보이지 않음)와 안내 문장을 겹친다 — 카드 구성은 정상 상태와 같다", () => {
    let tree = render(DependentCheckClient);
    const validShape = shape(resultSlot(tree));
    typeYear(tree, "195"); tree = render(DependentCheckClient);
    const slot = resultSlot(tree);
    expect(slot.type).toBe("div");
    expect(slot.props.className).toBe("grid");
    const [card, prompt] = kids(slot);
    expect(card.props.className).toBe("invisible col-start-1 row-start-1 rounded-2xl overflow-hidden");
    expect(card.props["aria-hidden"]).toBe("true");
    expect(shape(card)).toEqual(validShape);
    expect(prompt.type).toBe("p");
    expect(String(prompt.props.className)).toContain("col-start-1 row-start-1 self-center");
    expect(text(prompt).trim()).toBe("출생연도 4자리를 입력하면 즉시 판정됩니다.");
    // 도움말 줄도 자리를 남긴다(보이지 않게, 마지막 정상 나이)
    const h = helper(tree)!;
    expect(h.props["aria-hidden"]).toBe("true");
    expect(String(h.props.className)).toBe("invisible text-[11px] text-faint-blue mt-1.5");
    expect(text(h)).toBe("2026년 귀속 기준 만 68세로 판정합니다.");
  });

  it("빈칸 → 1962 로 다시 쓰면 새 판정 카드가 같은 자리에 보인다", () => {
    let tree = render(DependentCheckClient);
    typeYear(tree, ""); tree = render(DependentCheckClient);
    expect(resultSlot(tree).props.className).toBe("grid");
    typeYear(tree, "1962"); tree = render(DependentCheckClient);
    const slot = resultSlot(tree);
    expect(slot.props.className).toBe("rounded-2xl overflow-hidden");
    expect(text(helper(tree)!)).toBe("2026년 귀속 기준 만 64세로 판정합니다.");
  });

  it("관계를 바꾼 뒤 연도를 고쳐 쓰면 마지막 정상 판정(바꾼 관계)의 카드로 자리를 유지한다", () => {
    let tree = render(DependentCheckClient);
    const sibling = nodes(tree).find((n) => n.props.label === "형제자매")!;
    (sibling.props.onClick as () => void)(); tree = render(DependentCheckClient);
    const siblingShape = shape(resultSlot(tree));
    typeYear(tree, "19"); tree = render(DependentCheckClient);
    const [card] = kids(resultSlot(tree));
    expect(shape(card)).toEqual(siblingShape);
    expect(text(card)).toContain("형제자매");
  });
});
