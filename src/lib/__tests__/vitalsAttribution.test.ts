// S1-6 계측 순수 헬퍼 테스트 (2026-09-11). jsdom 없음 — DOM 노드는 평범한 객체로 흉내낸다.
import { describe, expect, it } from "vitest";
import {
  ATTRIBUTION_SAMPLE_RATE,
  SELECTOR_MAX_LENGTH,
  describeNode,
  largestShiftSource,
  shouldSampleAttribution,
  viewportBucket,
  type ShiftEntryLike,
} from "../vitalsAttribution";

type FakeNode = {
  nodeType?: number;
  tagName?: string;
  id?: string;
  className?: unknown;
  attributes?: Record<string, string>;
  textContent?: string;
  parentElement?: FakeNode | null;
  getAttribute?: (name: string) => string | null;
};

function element(tagName: string, opts: Omit<FakeNode, "tagName" | "nodeType"> = {}): FakeNode {
  const attributes = opts.attributes ?? {};
  return {
    nodeType: 1,
    tagName,
    id: opts.id ?? "",
    className: opts.className !== undefined ? opts.className : (attributes.class ?? ""),
    textContent: opts.textContent ?? "",
    parentElement: opts.parentElement ?? null,
    getAttribute: (name: string) => (name in attributes ? attributes[name] : null),
  };
}

describe("viewportBucket — 광고 채움 이벤트의 뷰포트 폭 버킷", () => {
  it("m: <768 · t: <1024 · d: 그 외 (경계 포함)", () => {
    expect(viewportBucket(320)).toBe("m");
    expect(viewportBucket(767)).toBe("m");
    expect(viewportBucket(767.9)).toBe("m");
    expect(viewportBucket(768)).toBe("t");
    expect(viewportBucket(1023)).toBe("t");
    expect(viewportBucket(1024)).toBe("d");
    expect(viewportBucket(1920)).toBe("d");
  });
  it("유효하지 않은 폭은 undefined 로 필드를 생략시킨다", () => {
    expect(viewportBucket(0)).toBeUndefined();
    expect(viewportBucket(-1)).toBeUndefined();
    expect(viewportBucket(NaN)).toBeUndefined();
    expect(viewportBucket(Infinity)).toBeUndefined();
    expect(viewportBucket(undefined)).toBeUndefined();
    expect(viewportBucket("1024")).toBeUndefined();
  });
});

describe("shouldSampleAttribution — 페이지 로드당 1회 20% 샘플", () => {
  it("기본 비율은 20% 이고 난수 < 비율일 때만 참이다", () => {
    expect(ATTRIBUTION_SAMPLE_RATE).toBe(0.2);
    expect(shouldSampleAttribution(0)).toBe(true);
    expect(shouldSampleAttribution(0.1999)).toBe(true);
    expect(shouldSampleAttribution(0.2)).toBe(false);
    expect(shouldSampleAttribution(0.5)).toBe(false);
    expect(shouldSampleAttribution(0.999)).toBe(false);
  });
  it("난수·비율이 이상하면 보내지 않는다(fail-closed)", () => {
    expect(shouldSampleAttribution(NaN)).toBe(false);
    expect(shouldSampleAttribution(-0.1)).toBe(false);
    expect(shouldSampleAttribution(1)).toBe(false);
    expect(shouldSampleAttribution("0.1")).toBe(false);
    expect(shouldSampleAttribution(undefined)).toBe(false);
    expect(shouldSampleAttribution(0.1, 0)).toBe(false);
    expect(shouldSampleAttribution(0.1, NaN)).toBe(false);
  });
  it("비율을 바꾸면 그대로 따르되 1 을 넘지 않는다", () => {
    expect(shouldSampleAttribution(0.5, 0.6)).toBe(true);
    expect(shouldSampleAttribution(0.99, 5)).toBe(true);
    expect(shouldSampleAttribution(0.05, 0.05)).toBe(false);
  });
  it("실제 난수 분포에서 대략 20% 만 샘플된다", () => {
    let hits = 0;
    const n = 20000;
    for (let i = 0; i < n; i++) if (shouldSampleAttribution(i / n)) hits++;
    expect(hits / n).toBeCloseTo(0.2, 2);
  });
});

describe("describeNode — 개인정보 없는 짧은 선택자", () => {
  it("태그 + #id + 클래스 최대 2개", () => {
    expect(describeNode(element("IMG", { id: "hero", attributes: { class: "rounded-xl shadow w-full" } }))).toBe("img#hero.rounded-xl.shadow");
    expect(describeNode(element("P", { attributes: { class: "text-sm" } }))).toBe("p.text-sm");
    expect(describeNode(element("H1"))).toBe("h1");
    expect(describeNode(element("DIV", { id: "main" }))).toBe("div#main");
  });
  it("텍스트 내용·id/class 외 속성값은 절대 포함하지 않는다", () => {
    const node = element("SPAN", {
      id: "net",
      attributes: { class: "font-bold", "data-amount": "80000000", alt: "연봉 8,000만원", href: "/salary/80000000?v=secret" },
      textContent: "실수령 5,530,000원",
    });
    const out = describeNode(node);
    expect(out).toBe("span#net.font-bold");
    for (const leak of ["80000000", "8,000", "5,530,000", "secret", "/salary", "연봉"]) expect(out).not.toContain(leak);
  });
  it("안전하지 않은 토큰(Radix id·Tailwind 임의값·슬래시)은 건너뛴다", () => {
    expect(describeNode(element("BUTTON", { id: "radix-:r0:", attributes: { class: "md:text-lg w-1/2 text-[hsl(0,0%,0%)] px-4 py-2" } }))).toBe("button.px-4.py-2");
    expect(describeNode(element("DIV", { id: "a b" }))).toBe("div");
    expect(describeNode(element("DIV", { id: "결과" }))).toBe("div");
  });
  it("id·클래스·전체 길이를 자른다(80자 상한)", () => {
    const longId = "x".repeat(60);
    const longClass = "y".repeat(60);
    const out = describeNode(element("SECTION", { id: longId, attributes: { class: `${longClass} ${longClass}z` } }));
    expect(out.startsWith(`section#${"x".repeat(32)}.`)).toBe(true);
    expect(out.length).toBeLessThanOrEqual(SELECTOR_MAX_LENGTH);
    expect(describeNode(element("A", { id: "ok", attributes: { class: "a".repeat(100) } }))).toBe(`a#ok.${"a".repeat(24)}`);
  });
  it("텍스트 노드는 부모 요소로 올라가 설명한다(최대 3단계)", () => {
    const parent = element("P", { attributes: { class: "lead" } });
    const text: FakeNode = { nodeType: 3, textContent: "비밀 금액 123", parentElement: parent };
    expect(describeNode(text)).toBe("p.lead");
    const deep: FakeNode = { nodeType: 3, parentElement: { nodeType: 8, parentElement: { nodeType: 8, parentElement: { nodeType: 8, parentElement: { nodeType: 8, parentElement: parent } } } } };
    expect(describeNode(deep)).toBe("");
  });
  it("SVG 처럼 className 이 문자열이 아니면 getAttribute(class) 를 쓴다", () => {
    const svg = element("svg", { className: { baseVal: "icon", animVal: "icon" }, attributes: { class: "icon lucide" } });
    expect(describeNode(svg)).toBe("svg.icon.lucide");
    const noGetAttribute: FakeNode = { nodeType: 1, tagName: "path", className: { baseVal: "x" } };
    expect(describeNode(noGetAttribute)).toBe("path");
  });
  it("노드가 없거나 이상해도 예외 없이 빈 문자열", () => {
    expect(describeNode(null)).toBe("");
    expect(describeNode(undefined)).toBe("");
    expect(describeNode("div")).toBe("");
    expect(describeNode(42)).toBe("");
    expect(describeNode({})).toBe("");
    expect(describeNode({ nodeType: 1, tagName: 7 })).toBe("");
    expect(describeNode({ nodeType: 1, tagName: "DIV", getAttribute: () => { throw new Error("detached"); } })).toBe("div");
    const cyclic: FakeNode = { nodeType: 3 };
    cyclic.parentElement = cyclic;
    expect(describeNode(cyclic)).toBe("");
  });
  it("tagName 이 문자열인 nodeType 미상 객체는 요소로 취급한다", () => {
    expect(describeNode({ tagName: "IMG", id: "lcp" })).toBe("img#lcp");
  });
});

describe("largestShiftSource — 최대 단일 layout-shift 와 그 대상 노드", () => {
  const nodeA = { tagName: "DIV", id: "a" };
  const nodeB = { tagName: "DIV", id: "b" };
  const rect = (width: number, height: number) => ({ width, height });

  it("hadRecentInput 항목을 제외하고 값이 가장 큰 항목을 고른다", () => {
    const entries: ShiftEntryLike[] = [
      { value: 0.05, hadRecentInput: false, sources: [{ node: nodeA, previousRect: rect(100, 50), currentRect: rect(100, 50) }] },
      { value: 0.5, hadRecentInput: true, sources: [{ node: nodeB, previousRect: rect(300, 300), currentRect: rect(300, 300) }] },
      { value: 0.12, hadRecentInput: false, sources: [{ node: nodeB, previousRect: rect(10, 10), currentRect: rect(10, 10) }] },
    ];
    expect(largestShiftSource(entries)).toEqual({ value: 0.12, node: nodeB });
  });
  it("여러 source 중 이전/현재 rect 면적이 가장 큰 노드를 고른다", () => {
    const entries: ShiftEntryLike[] = [{
      value: 0.2,
      sources: [
        { node: nodeA, previousRect: rect(10, 10), currentRect: rect(400, 250) },
        { node: nodeB, previousRect: rect(300, 300), currentRect: rect(0, 0) },
      ],
    }];
    expect(largestShiftSource(entries)?.node).toBe(nodeA);
  });
  it("currentMax 이하면 갱신하지 않아 페이지 로드 전체의 최대치가 유지된다", () => {
    const entries: ShiftEntryLike[] = [{ value: 0.1, sources: [{ node: nodeA }] }];
    expect(largestShiftSource(entries, 0.1)).toBeNull();
    expect(largestShiftSource(entries, 0.3)).toBeNull();
    expect(largestShiftSource(entries, 0.05)).toEqual({ value: 0.1, node: nodeA });
    expect(largestShiftSource(entries, NaN)).toEqual({ value: 0.1, node: nodeA });
  });
  it("source 가 없거나 값이 이상한 항목은 안전하게 처리한다", () => {
    expect(largestShiftSource([{ value: 0.2 }])).toEqual({ value: 0.2, node: null });
    expect(largestShiftSource([{ value: 0.2, sources: [] }])).toEqual({ value: 0.2, node: null });
    expect(largestShiftSource([{ value: 0.2, sources: [{ previousRect: null, currentRect: rect(NaN, 10) }] }])).toEqual({ value: 0.2, node: null });
    expect(largestShiftSource([{ value: "0.9" }, { value: NaN }, { value: 0 }, null as unknown as ShiftEntryLike])).toBeNull();
    expect(largestShiftSource(undefined)).toBeNull();
    expect(largestShiftSource(null)).toBeNull();
    expect(largestShiftSource([])).toBeNull();
  });
  it("동률이면 먼저 관찰된 항목을 유지한다", () => {
    const entries: ShiftEntryLike[] = [
      { value: 0.3, sources: [{ node: nodeA, previousRect: rect(1, 1) }] },
      { value: 0.3, sources: [{ node: nodeB, previousRect: rect(1, 1) }] },
    ];
    expect(largestShiftSource(entries)?.node).toBe(nodeA);
  });
});
