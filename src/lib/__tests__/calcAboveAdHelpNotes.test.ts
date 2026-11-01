// 결과 직하 CalcResultAd 위 입력 안내 길이·위치 가드 (2026-11-01 B09 P4-05) — /calc/child-deduction, /calc/dual-income-year-end
// 10/26(PR #29·#30) 에 길어진 입력 안내가 결과 광고를 아래로 밀었다(자녀공제 320px 추정 3줄 → 6줄, 맞벌이 4줄·7줄 문단).
//  · 자녀공제: 광고 위에는 짧은 요약(10/26 전 안내 82자보다 짧게)만 두고, 연령 판정 시점·사망 등 예외·근거 법령은
//    page.tsx 의 광고 아래(본문·접힌 자주 묻는 질문)에서 확인한다. 나이 기준 표기는 법률 제21548호 부칙 제2조 그대로.
//  · 맞벌이: 연간 자녀세액공제 대상·자녀 명의 기부금 입력 기준은 닫힌 <details> 안 — 닫히면 요약 한 줄(min-h-11, 44px)이고
//    바깥 여백이 없어 종전 문단 자리(mt-2 + 2줄 이상 = 47px 이상)보다 언제나 낮다.
// 렌더는 calcResultEditingShape.test.ts 와 같은 오프라인 훅 대역으로 컴포넌트 함수를 직접 호출해 요소 트리를 본다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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
const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

/** 루트 자식 중 CalcResultAd 앞(광고 위) 요소들 — 결과 직하 광고는 루트의 직계 자식이다 */
function aboveAd(tree: unknown) {
  const kids = elementChildren(tree as Element);
  const ad = kids.findIndex((node) => node.type === CalcResultAd);
  expect(ad).toBeGreaterThan(0);
  return kids.slice(0, ad);
}

// 10/26(820951bc3) 전 같은 자리 안내 — 82자, 320px 추정 3줄
const PRE_1026_NOTE = "일반적인 연령 판정은 2026년 12월 31일 기준입니다. 만 7세는 8세 미만에 포함합니다. 요건을 충족하지 않는 자녀는 입력에서 제외해 주세요.";
// 연령 판정 시점·예외 문구(소득세법 제53조 ④·⑤) — 광고 위에는 두지 않는다
const DETAIL_RULE_PHRASES = ["해당되는 날", "판정 시점", "사망"];

describe("/calc/child-deduction — 광고 위 안내는 짧게, 자세한 연령 기준은 광고 아래 (B09)", () => {
  it("인원 칸 아래 안내는 10/26 전보다 짧고, 2026년 귀속 나이 기준을 부칙 표기 그대로 적는다", () => {
    const tree = render(ChildDeductionClient);
    const [inputCard, ...rest] = aboveAd(tree);
    expect(rest.map((node) => node.props["aria-label"])).toEqual(["자녀 공제액 결과"]);
    const first = nodes(inputCard).find((node) => node.type === "fieldset" && node.props["aria-describedby"] === "child-eligibility")!;
    const notes = elementChildren(first).filter((node) => node.type === "p" && String(node.props.className).startsWith("mt-3 text-xs"));
    expect(notes).toHaveLength(1);
    const note = text(notes[0]);
    expect(note).toBe("연간 자녀세액공제 대상에는 2026년 귀속 9세 이상(2017년생 제외)인 인원만 넣으세요. 두 번째 인원은 첫 번째에 포함됩니다.");
    expect(PRE_1026_NOTE).toHaveLength(82);
    expect(note.length).toBeLessThan(PRE_1026_NOTE.length);
    expect(note).toContain("2026년 귀속 9세 이상(2017년생 제외)");
    // 같은 자리 종전 문단 크기(text-xs)를 그대로 쓴다 — 글자를 키워 줄을 늘리지 않는다
    expect(String(notes[0].props.className)).toBe("mt-3 text-xs text-muted-blue dark:text-canvas-300");
  });

  it("광고 위 어디에도 연령 판정 시점·사망 예외 문구가 없다 (입력 오류 상태 포함)", () => {
    let tree = render(ChildDeductionClient);
    for (const step of [() => {}, () => {
      const counter = nodes(tree).find((node) => node.props.label === "첫째 출산·입양" && typeof node.props.onChange === "function")!;
      (counter.props.onChange as (v: number) => void)(1);
    }]) {
      step(); tree = render(ChildDeductionClient);
      const above = text(aboveAd(tree));
      for (const phrase of DETAIL_RULE_PHRASES) expect(above, phrase).not.toContain(phrase);
    }
  });

  it("자세한 연령 기준·근거 법령은 page.tsx 에서 결과 직하 광고(클라이언트) 아래에 남아 있다 — 순서 가드", () => {
    const page = read("src/app/calc/child-deduction/page.tsx");
    const client = page.indexOf("<ChildDeductionClient />");
    const mid = page.indexOf("<GuideMidAd />");
    const faq = page.indexOf("{FAQ_ITEMS.map(");
    expect(client).toBeGreaterThan(0);
    expect(mid).toBeGreaterThan(client);
    expect(faq).toBeGreaterThan(mid);
    // 본문(클라이언트 다음, 광고 아래): 2026년 귀속 기준과 근거 법령 링크
    const article = page.slice(client, mid);
    expect(article).toContain("자녀세액공제(2026년 귀속 9세 이상, 2017년생 제외)");
    expect(article).toContain("법률 제21548호 부칙 제2조: 2026년 적용과 2017년생 제외");
    expect(article).toContain("소득세법 제53조: 공제대상과 연령 판정 시점");
    // 접힌 자주 묻는 질문(광고 아래에서만 렌더): 광고 위 안내에서 뺀 연령 판정 시점·예외 문장
    const faqItems = page.slice(page.indexOf("const FAQ_ITEMS = ["), page.indexOf("];", page.indexOf("const FAQ_ITEMS = [")));
    expect(faqItems).toContain("2026년 귀속은 기본공제 대상 자녀·손자녀 중 9세 이상이며 2017년생은 제외합니다.");
    expect(faqItems).toContain("연령은 해당 과세기간 중 요건 나이에 해당되는 날이 있는지 확인하며, 소득·부양 요건과 사망 등 판정 시점 예외는 별도로 확인합니다.");
    expect(page).not.toMatch(/<details[^>]*\sopen\b/);
  });
});

describe("/calc/dual-income-year-end — 입력 기준은 닫힌 상자 안에 (B09)", () => {
  const select = (tree: unknown, id: string, value: string) =>
    (nodes(tree).find((node) => node.type === "select" && node.props.id === id)!.props.onChange as (e: unknown) => void)({ target: { value } });

  it("자녀 0~5명 모든 화면에서 광고 위 안내 문단은 닫힌 <details> 안에만 있고, 상자는 바깥 여백 없이 요약 한 줄", () => {
    let tree = render(DualIncomeYearEndClient);
    for (const children of [0, 1, 2, 3, 4, 5]) {
      select(tree, "di-children", String(children)); tree = render(DualIncomeYearEndClient);
      const above = aboveAd(tree);
      // 입력 카드 → 결과 카드 → CalcResultAd
      expect(above).toHaveLength(2);
      const [inputCard] = above;
      const boxes = nodes(inputCard).filter((node) => node.type === "details");
      expect(boxes, `children ${children}`).toHaveLength(children > 0 ? 2 : 1);
      for (const box of boxes) {
        expect(box.props.open).toBeUndefined();
        // 닫힌 높이 = 요약 칸 44px(min-h-11, 안쪽 여백 py-3.5) — mt-* 바깥 여백을 더하지 않는다
        expect(String(box.props.className)).toBe("text-xs text-faint-blue");
        const [summary, help, ...extra] = elementChildren(box);
        expect(summary.type).toBe("summary");
        expect(text(summary)).toBe("입력 기준 보기");
        expect(String(summary.props.className)).toBe("min-h-11 cursor-pointer py-3.5");
        expect(help.type).toBe("p");
        expect(String(help.props.id)).toMatch(/^di-child-(credit|donation)-help$/);
        expect(extra).toHaveLength(0);
      }
      // 입력 카드의 모든 문단은 닫힌 상자 안 — 광고 위에 펼쳐진 안내 문단이 없다
      const inBoxes = new Set(boxes.flatMap((box) => nodes(box).filter((node) => node.type === "p")));
      const paragraphs = nodes(inputCard).filter((node) => node.type === "p");
      expect(paragraphs.length).toBeGreaterThan(0);
      expect(paragraphs.every((node) => inBoxes.has(node))).toBe(true);
    }
  });

  it("선택 상자·기부금 칸의 aria-describedby 는 접힌 상자 안 문단을 가리키고, 문단 내용은 그대로다", () => {
    let tree = render(DualIncomeYearEndClient);
    const credit = nodes(tree).find((node) => node.type === "select" && node.props.id === "di-credit-children")!;
    expect(credit.props["aria-describedby"]).toBe("di-child-credit-help");
    const creditHelp = nodes(tree).find((node) => node.props.id === "di-child-credit-help")!;
    // 가드 QA 스크립트(scripts/qa-interaction-states.mjs)가 읽는 문구
    expect(text(creditHelp)).toMatch(/9세 이상[\s\S]*2017년생은 제외/);
    expect(text(creditHelp)).toContain("해당 과세기간 중 요건 나이에 해당되는 날이 있는지 확인하세요.");

    select(tree, "di-children", "1"); tree = render(DualIncomeYearEndClient);
    const donation = nodes(tree).find((node) => node.type === NumberInput && node.props.id === "di-childDonation")!;
    expect(donation.props["aria-describedby"]).toBe("di-child-donation-help");
    const donationHelp = nodes(tree).find((node) => node.props.id === "di-child-donation-help")!;
    expect(text(donationHelp)).toContain("정치자금·고향사랑 기부금은 제외하세요.");
    expect(nodes(donationHelp).some((node) => node.type === "a" && node.props.href === "/donation-tax-credit-2026")).toBe(true);
  });
});
