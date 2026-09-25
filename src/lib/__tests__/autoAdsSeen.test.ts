// 자동광고 관측 autoads_seen(aa1) 회귀 가드 (2026-09-26 준비 — 운영자 승인 뒤 배포, 측정 전용)
//
// 확인하는 것:
//  1) 스냅숏 수치 — 자리(placed)·자리 안 ins·요청(done)·채움(filled/unfilled)·수동 칸·문서 높이·설정 캐시,
//     위치와 높이의 100 단위 반올림, 0×0(display:none) 자리의 위치 제외.
//  2) 설치 — 착지 뷰에서만, 문서당 1회, 5초 간격 90초 조회 + 보낼 때 1회, 항목별 최댓값, 1초 스로틀 스크롤.
//  3) 전송 — hidden·pagehide 중 먼저 온 것에서 정확히 1회, beacon, position='<ins>-<req>-<filled>'.
//  4) 소프트 이동 뒤에는 착지 뷰 값에서 멈춘다(soft_nav_before_send=1).
//  5) localStorage 가 없거나 막혀도, DOM API 가 throw 해도 예외가 밖으로 나가지 않는다.
//  6) DOM 을 한 번도 쓰지 않고(프록시로 쓰기·변경 메서드 접근을 기록) MutationObserver 도 만들지 않는다.
//  7) 루트 layout 배선 — 무렌더 컴포넌트(SSR 출력 빈 문자열), #main-content 밖.
// vitest 에 jsdom 이 없고 npm install 을 하지 않으므로, 선택자 몇 가지만 해석하는 작은 가짜 DOM 으로 검증한다.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AMA_CONFIG_KEY,
  AUTOADS_POLL_MS,
  AUTOADS_POLL_WINDOW_MS,
  installAutoAdsSeen,
  mergeAutoAdsSnapshots,
  pageGroupOf,
  roundTo100,
  snapshotAutoAds,
  type AutoAdsDocument,
  type AutoAdsWindow,
} from "../autoAdsSeen";
import { markSoftNavigation, resetNavTypeForTests, type NavTypeWindow } from "../navType";
import { trackEvent } from "../analytics";
import AutoAdsSeenTracker from "@/components/AutoAdsSeenTracker";

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

// ---------- 작은 가짜 DOM ----------

type Rect = { top: number; width: number; height: number };
type FakeEl = {
  __fake: true;
  tag: string;
  classes: string[];
  attrs: Record<string, string>;
  rect: Rect;
  parent: FakeEl | null;
  children: FakeEl[];
  getAttribute(name: string): string | null;
  closest(selector: string): FakeEl | null;
  getBoundingClientRect(): Rect;
};

type Compound = { tag?: string; classes: string[]; attrs: Array<{ name: string; value?: string }> };

function parseCompound(part: string): Compound {
  const tag = /^[a-z]+/i.exec(part)?.[0]?.toLowerCase();
  const classes = [...part.matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
  const attrs = [...part.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)].map((m) => ({ name: m[1], value: m[2] }));
  return { tag, classes, attrs };
}

function matchesCompound(node: FakeEl, compound: Compound): boolean {
  if (compound.tag && node.tag !== compound.tag) return false;
  if (!compound.classes.every((c) => node.classes.includes(c))) return false;
  return compound.attrs.every((a) => (a.value === undefined ? a.name in node.attrs : node.attrs[a.name] === a.value));
}

/** 복합 선택자 + 자손 결합자(공백)만 해석한다. */
function matches(node: FakeEl, selector: string): boolean {
  const parts = selector.trim().split(/\s+/).map(parseCompound);
  if (!matchesCompound(node, parts[parts.length - 1])) return false;
  let i = parts.length - 2;
  let ancestor = node.parent;
  while (i >= 0 && ancestor) {
    if (matchesCompound(ancestor, parts[i])) i -= 1;
    ancestor = ancestor.parent;
  }
  return i < 0;
}

function el(
  tag: string,
  opts: { cls?: string; attrs?: Record<string, string>; rect?: Partial<Rect> } = {},
  children: FakeEl[] = [],
): FakeEl {
  const node: FakeEl = {
    __fake: true,
    tag,
    classes: (opts.cls ?? "").split(/\s+/).filter(Boolean),
    attrs: { ...(opts.attrs ?? {}) },
    rect: { top: 0, width: 300, height: 250, ...(opts.rect ?? {}) },
    parent: null,
    children: [],
    getAttribute(name) {
      return name in node.attrs ? node.attrs[name] : null;
    },
    closest(selector) {
      let current: FakeEl | null = node;
      while (current) {
        if (matches(current, selector)) return current;
        current = current.parent;
      }
      return null;
    },
    getBoundingClientRect() {
      return { ...node.rect };
    },
  };
  children.forEach((child) => adopt(node, child));
  return node;
}

/** 테스트 쪽에서만 쓰는 트리 편집(애드센스가 자리를 끼워 넣는 흉내). */
function adopt(parent: FakeEl, child: FakeEl) {
  child.parent = parent;
  parent.children.push(child);
}
function detachNode(child: FakeEl) {
  if (!child.parent) return;
  child.parent.children = child.parent.children.filter((c) => c !== child);
  child.parent = null;
}

function descendants(root: FakeEl): FakeEl[] {
  const out: FakeEl[] = [];
  const walk = (n: FakeEl) => {
    out.push(n);
    n.children.forEach(walk);
  };
  walk(root);
  return out;
}

type Listeners = Map<string, Array<{ fn: () => void; options?: unknown }>>;

function addListener(map: Listeners, type: string, fn: () => void, options?: unknown) {
  const list = map.get(type) ?? [];
  list.push({ fn, options });
  map.set(type, list);
}
function removeListener(map: Listeners, type: string, fn: () => void) {
  map.set(type, (map.get(type) ?? []).filter((entry) => entry.fn !== fn));
}
function fire(map: Listeners, type: string) {
  for (const entry of [...(map.get(type) ?? [])]) entry.fn();
}

function fakeDocument(root: FakeEl, scrollHeight = 3000) {
  const listeners: Listeners = new Map();
  const doc = {
    documentElement: { scrollHeight },
    visibilityState: "visible",
    querySelectorAll: vi.fn((selector: string) => descendants(root).filter((n) => matches(n, selector))),
    addEventListener: vi.fn((type: string, fn: () => void, options?: unknown) => addListener(listeners, type, fn, options)),
    removeEventListener: vi.fn((type: string, fn: () => void) => removeListener(listeners, type, fn)),
    listeners,
    fire: (type: string) => fire(listeners, type),
  };
  return doc;
}
type FakeDoc = ReturnType<typeof fakeDocument>;

function memoryStorage(entries: Record<string, string> = {}) {
  const map = new Map(Object.entries(entries));
  return { getItem: vi.fn((key: string) => (map.has(key) ? map.get(key)! : null)) };
}

function fakeWindow(
  doc: FakeDoc | null,
  opts: { pathname?: string; scrollY?: number; innerHeight?: number; innerWidth?: number; storage?: unknown } = {},
) {
  const listeners: Listeners = new Map();
  const win = {
    document: doc,
    location: { pathname: opts.pathname ?? "/salary-db/samsung-electronics" },
    scrollY: opts.scrollY ?? 0,
    innerHeight: opts.innerHeight ?? 800,
    innerWidth: opts.innerWidth ?? 390,
    localStorage: "storage" in opts ? opts.storage : memoryStorage({ [AMA_CONFIG_KEY]: "{}" }),
    addEventListener: vi.fn((type: string, fn: () => void, options?: unknown) => addListener(listeners, type, fn, options)),
    removeEventListener: vi.fn((type: string, fn: () => void) => removeListener(listeners, type, fn)),
    listeners,
    fire: (type: string) => fire(listeners, type),
  } as {
    document: FakeDoc | null;
    location: { pathname: string };
    scrollY: number;
    innerHeight: number;
    innerWidth: number;
    localStorage: unknown;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    listeners: Listeners;
    fire: (type: string) => void;
    __msyAutoAdsSeenInstalled?: boolean;
  };
  return win;
}

const asDoc = (doc: unknown) => doc as AutoAdsDocument;
const asWin = (win: unknown) => win as AutoAdsWindow;

const autoSlot = (top: number, insAttrs: Record<string, string> = {}, rect: Partial<Rect> = {}) =>
  el("div", { cls: "google-auto-placed ap_container", rect: { top, ...rect } }, [
    el("ins", { cls: "adsbygoogle adsbygoogle-noablate", attrs: insAttrs }),
  ]);
const DONE_FILLED = { "data-adsbygoogle-status": "done", "data-ad-status": "filled" };
const DONE_UNFILLED = { "data-adsbygoogle-status": "done", "data-ad-status": "unfilled" };

/** 회사 페이지 모양: 자동 자리 4(표시 3 + 숨김 1), 수동 칸 2, 앵커 1. */
function companyFixture() {
  const main = el("main", { attrs: { id: "main-content" } }, [
    // 자동 자리 안의 ins 에 data-ad-slot 이 있어도 수동 칸으로 세지 않는다.
    autoSlot(700, { ...DONE_FILLED, "data-ad-slot": "auto-x" }),
    el("div", { cls: "ad-container" }, [el("ins", { cls: "adsbygoogle", attrs: { "data-ad-slot": "111", ...DONE_FILLED } })]),
    autoSlot(2349, DONE_UNFILLED),
    autoSlot(5050), // 아직 요청 전(스크롤 미도달)
    autoSlot(0, DONE_UNFILLED, { width: 0, height: 0 }), // display:none 으로 접힌 자리
  ]);
  const body = el("body", {}, [
    main,
    el("ins", { cls: "adsbygoogle adsbygoogle-noablate", attrs: { "data-anchor-status": "displayed" } }), // 앵커
    el("ins", { cls: "adsbygoogle", attrs: { "data-ad-slot": "222" } }), // 수동 칸(요청 전)
  ]);
  return { body, main };
}

type Sent = { name: string; params: Record<string, unknown> };
function recorder() {
  const calls: Sent[] = [];
  const send = vi.fn((name: string, params: Record<string, unknown>) => {
    calls.push({ name, params });
  });
  return { calls, send };
}

function goSoft() {
  markSoftNavigation({ location: { href: "https://www.moneysalary.com/salary-db/sk-hynix" } } as unknown as NavTypeWindow);
}

beforeEach(() => {
  resetNavTypeForTests();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  resetNavTypeForTests();
});

// ---------- 1) 스냅숏 ----------

describe("snapshotAutoAds — 자동광고 자리·요청·채움 수", () => {
  it("자리·ins·요청·채움·미채움·수동 칸·문서 높이·설정 캐시를 센다(앵커·수동 칸은 aa_* 에서 제외)", () => {
    const { body } = companyFixture();
    const doc = fakeDocument(body, 12_345);
    const win = fakeWindow(doc, { scrollY: 1000 });
    expect(snapshotAutoAds(asDoc(doc), asWin(win))).toEqual({
      aa_placed: 4,
      aa_ins: 4,
      aa_req: 3,
      aa_filled: 1,
      aa_unfilled: 2,
      aa_first_top: 1700, // 700 + 1000
      aa_last_top: 6100, // 5050 + 1000 = 6050 → 6100 (숨김 자리 0 + 1000 은 제외)
      manual_ins: 2,
      doc_h: 12_300,
      ama_cfg: 1,
    });
  });

  it("100 단위 반올림 — 위치·문서 높이, 음수·비정상 값은 0", () => {
    expect([49, 50, 149, 150, 12_349, 12_350].map(roundTo100)).toEqual([0, 100, 100, 200, 12_300, 12_400]);
    expect([-5, Number.NaN, Number.POSITIVE_INFINITY, "abc", undefined].map(roundTo100)).toEqual([0, 0, 0, 0, 0]);
    const body = el("body", {}, [autoSlot(1149), autoSlot(1150)]);
    const snap = snapshotAutoAds(asDoc(fakeDocument(body, 5_449)), asWin(fakeWindow(null, { scrollY: 0 })));
    expect([snap.aa_first_top, snap.aa_last_top, snap.doc_h]).toEqual([1100, 1200, 5_400]);
  });

  it("자리가 없거나 모두 0×0 이면 위치를 싣지 않고, 설정 캐시가 없으면 ama_cfg=0", () => {
    const empty = snapshotAutoAds(asDoc(fakeDocument(el("body"))), asWin(fakeWindow(null, { storage: memoryStorage() })));
    expect(empty).not.toHaveProperty("aa_first_top");
    expect(empty).not.toHaveProperty("aa_last_top");
    expect(empty.ama_cfg).toBe(0);
    const hidden = snapshotAutoAds(
      asDoc(fakeDocument(el("body", {}, [autoSlot(0, {}, { width: 0, height: 0 })]))),
      asWin(fakeWindow(null)),
    );
    expect(hidden.aa_placed).toBe(1);
    expect(hidden).not.toHaveProperty("aa_first_top");
  });

  it("localStorage 가 없거나 막혀 있거나 getItem 이 throw 해도 예외 없이 ama_cfg=0", () => {
    const doc = asDoc(fakeDocument(el("body")));
    expect(snapshotAutoAds(doc, asWin(fakeWindow(null, { storage: undefined }))).ama_cfg).toBe(0);
    expect(snapshotAutoAds(doc, asWin(fakeWindow(null, { storage: null }))).ama_cfg).toBe(0);
    const blocked = fakeWindow(null);
    Object.defineProperty(blocked, "localStorage", {
      get() {
        throw new Error("SecurityError");
      },
    });
    expect(snapshotAutoAds(doc, asWin(blocked)).ama_cfg).toBe(0);
    const throwing = fakeWindow(null, {
      storage: {
        getItem() {
          throw new Error("denied");
        },
      },
    });
    expect(snapshotAutoAds(doc, asWin(throwing)).ama_cfg).toBe(0);
    expect(snapshotAutoAds(null, null)).toMatchObject({ aa_placed: 0, doc_h: 0, ama_cfg: 0 });
  });

  it("DOM API 가 throw 해도 예외가 밖으로 나가지 않는다", () => {
    const broken = {
      querySelectorAll() {
        throw new Error("boom");
      },
      get documentElement(): never {
        throw new Error("boom");
      },
    };
    expect(snapshotAutoAds(asDoc(broken), asWin(fakeWindow(null)))).toMatchObject({ aa_placed: 0, aa_ins: 0, doc_h: 0 });
    const slot = autoSlot(400, DONE_FILLED);
    slot.getBoundingClientRect = () => {
      throw new Error("detached");
    };
    const snap = snapshotAutoAds(asDoc(fakeDocument(el("body", {}, [slot]))), asWin(fakeWindow(null)));
    expect(snap).toMatchObject({ aa_placed: 1, aa_req: 1, aa_filled: 1 });
    expect(snap).not.toHaveProperty("aa_first_top");
  });

  it("누적 — 항목별 최댓값, 위치는 자리 수가 최대 이상인 가장 최근 스냅숏", () => {
    const base = { aa_ins: 0, aa_req: 0, aa_filled: 0, aa_unfilled: 0, manual_ins: 0, doc_h: 0, ama_cfg: 0 as const };
    const a = { ...base, aa_placed: 2, aa_first_top: 1000, aa_last_top: 3000, aa_req: 2 };
    const b = { ...base, aa_placed: 2, aa_first_top: 1500, aa_last_top: 3500, aa_req: 1, ama_cfg: 1 as const };
    const c = { ...base, aa_placed: 1, aa_first_top: 200, aa_last_top: 200, doc_h: 9000 };
    const merged = mergeAutoAdsSnapshots(mergeAutoAdsSnapshots(a, b), c);
    expect(merged).toMatchObject({ aa_placed: 2, aa_req: 2, doc_h: 9000, ama_cfg: 1, aa_first_top: 1500, aa_last_top: 3500 });
  });

  it("page_group — 경로 첫 마디, 루트는 home, 그 밖은 other", () => {
    expect(pageGroupOf("/")).toBe("home");
    expect(pageGroupOf("")).toBe("home");
    expect(pageGroupOf("/salary-db/samsung-electronics")).toBe("salary-db");
    expect(pageGroupOf("/salary/50000000")).toBe("salary");
    expect(pageGroupOf("/monthly/3000000")).toBe("monthly");
    expect(pageGroupOf("/Calc/Vat")).toBe("calc");
    expect(pageGroupOf("/guides/?x=1")).toBe("guides");
    expect(pageGroupOf("/%EC%97%B0%EB%B4%89")).toBe("other");
    expect(pageGroupOf(undefined)).toBe("other");
  });
});

// ---------- 2)~4) 설치·전송 ----------

describe("installAutoAdsSeen — 착지 뷰 1회 전송", () => {
  it("5초 조회 뒤 hidden 에서 1회 보내고, 이어지는 pagehide·hidden 은 무시한다", () => {
    const { body } = companyFixture();
    const doc = fakeDocument(body, 12_345);
    const win = fakeWindow(doc, { scrollY: 1000, innerHeight: 800, innerWidth: 390 });
    const { calls, send } = recorder();
    expect(installAutoAdsSeen(asWin(win), send)).toBe(true);
    vi.advanceTimersByTime(AUTOADS_POLL_MS);
    doc.visibilityState = "hidden";
    doc.fire("visibilitychange");
    win.fire("pagehide");
    doc.fire("visibilitychange");
    expect(send).toHaveBeenCalledTimes(1);
    expect(calls[0]).toEqual({
      name: "autoads_seen",
      params: {
        aa_placed: 4,
        aa_ins: 4,
        aa_req: 3,
        aa_filled: 1,
        aa_unfilled: 2,
        aa_first_top: 1700,
        aa_last_top: 6100,
        manual_ins: 2,
        doc_h: 12_300,
        ama_cfg: 1,
        scroll_max: 1800,
        page_group: "salary-db",
        viewport: "m",
        nav_type: "landing",
        soft_nav_before_send: 0,
        measurement_version: "aa1",
        position: "4-3-1",
        transport_type: "beacon",
      },
    });
  });

  it("visible 로 바뀌는 visibilitychange 는 보내지 않고, pagehide 가 먼저면 거기서 1회", () => {
    const doc = fakeDocument(el("body", {}, [autoSlot(300, DONE_FILLED)]));
    const win = fakeWindow(doc, { innerWidth: 1280 });
    const { calls, send } = recorder();
    installAutoAdsSeen(asWin(win), send);
    doc.fire("visibilitychange");
    expect(send).not.toHaveBeenCalled();
    win.fire("pagehide");
    doc.visibilityState = "hidden";
    doc.fire("visibilitychange");
    expect(send).toHaveBeenCalledTimes(1);
    // 조회 전에 떠나도 보내기 직전 스냅숏 1회로 센다.
    expect(calls[0].params).toMatchObject({ aa_placed: 1, aa_req: 1, aa_filled: 1, position: "1-1-1", viewport: "d" });
  });

  it("문서당 1회 — 두 번째 설치는 false, 전송도 1회", () => {
    const doc = fakeDocument(el("body"));
    const win = fakeWindow(doc);
    const { send } = recorder();
    expect(installAutoAdsSeen(asWin(win), send)).toBe(true);
    expect(installAutoAdsSeen(asWin(win), send)).toBe(false);
    win.fire("pagehide");
    win.fire("pagehide");
    expect(send).toHaveBeenCalledTimes(1);
    expect(win.__msyAutoAdsSeenInstalled).toBe(true);
  });

  it("착지 뷰가 아니면(이미 소프트) 설치하지 않는다 — 리스너·타이머·전송 없음", () => {
    goSoft();
    const doc = fakeDocument(el("body", {}, [autoSlot(300)]));
    const win = fakeWindow(doc);
    const { send } = recorder();
    expect(installAutoAdsSeen(asWin(win), send)).toBe(false);
    expect(win.addEventListener).not.toHaveBeenCalled();
    expect(doc.addEventListener).not.toHaveBeenCalled();
    vi.advanceTimersByTime(AUTOADS_POLL_WINDOW_MS);
    expect(doc.querySelectorAll).not.toHaveBeenCalled();
    win.fire("pagehide");
    expect(send).not.toHaveBeenCalled();
    expect(win.__msyAutoAdsSeenInstalled).toBeUndefined();
  });

  it("항목별 최댓값 — 자리가 늘었다 줄어도 최대 시점 값을 보낸다", () => {
    const main = el("main", {}, [autoSlot(500, DONE_FILLED)]);
    const doc = fakeDocument(el("body", {}, [main]));
    const win = fakeWindow(doc);
    const { calls, send } = recorder();
    installAutoAdsSeen(asWin(win), send);
    vi.advanceTimersByTime(AUTOADS_POLL_MS);
    const added = [autoSlot(1500, DONE_FILLED), autoSlot(2500, DONE_UNFILLED), autoSlot(9000)];
    added.forEach((slot) => adopt(main, slot));
    vi.advanceTimersByTime(AUTOADS_POLL_MS);
    added.forEach(detachNode);
    vi.advanceTimersByTime(AUTOADS_POLL_MS);
    win.fire("pagehide");
    expect(calls[0].params).toMatchObject({
      aa_placed: 4,
      aa_ins: 4,
      aa_req: 3,
      aa_filled: 2,
      aa_unfilled: 1,
      aa_first_top: 500,
      aa_last_top: 9000,
      position: "4-3-2",
    });
  });

  it("5초 간격 90초까지만 조회하고(18회), 그 뒤에는 보낼 때 1회만 더 읽는다", () => {
    const doc = fakeDocument(el("body", {}, [autoSlot(300)]));
    const win = fakeWindow(doc);
    const { send } = recorder();
    installAutoAdsSeen(asWin(win), send);
    const perSnapshot = 3; // 자리 · 자리 안 ins · 수동 칸
    vi.advanceTimersByTime(AUTOADS_POLL_MS - 1);
    expect(doc.querySelectorAll).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(1);
    expect(doc.querySelectorAll).toHaveBeenCalledTimes(perSnapshot);
    vi.advanceTimersByTime(AUTOADS_POLL_WINDOW_MS);
    expect(doc.querySelectorAll).toHaveBeenCalledTimes(18 * perSnapshot);
    vi.advanceTimersByTime(60_000);
    expect(doc.querySelectorAll).toHaveBeenCalledTimes(18 * perSnapshot);
    expect(vi.getTimerCount()).toBe(0);
    win.fire("pagehide");
    expect(doc.querySelectorAll).toHaveBeenCalledTimes(19 * perSnapshot);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("스크롤 — passive 리스너, 1초 스로틀(앞 1회 + 뒤 1회), scroll_max 는 100 단위 최댓값", () => {
    const doc = fakeDocument(el("body"));
    const win = fakeWindow(doc, { scrollY: 0, innerHeight: 800 });
    const { calls, send } = recorder();
    installAutoAdsSeen(asWin(win), send);
    const scrollReg = win.addEventListener.mock.calls.find((call) => call[0] === "scroll");
    expect(scrollReg?.[2]).toEqual({ passive: true });

    win.scrollY = 3000;
    win.fire("scroll"); // 앞: 즉시 3800
    win.scrollY = 5000;
    win.fire("scroll"); // 1초 안: 뒤 타이머만 예약
    win.fire("scroll");
    win.scrollY = 10; // 뒤 타이머가 돌기 전에 다시 위로
    vi.advanceTimersByTime(1000); // 뒤: 810 → 800
    win.fire("pagehide");
    expect(calls[0].params.scroll_max).toBe(3800); // 5000 은 스로틀로 읽지 않았다
  });

  it("스크롤 — 1초 스로틀의 뒤 호출이 마지막 위치를 잡는다", () => {
    const doc = fakeDocument(el("body"));
    const win = fakeWindow(doc, { scrollY: 0, innerHeight: 760 });
    const { calls, send } = recorder();
    installAutoAdsSeen(asWin(win), send);
    win.scrollY = 3000;
    win.fire("scroll");
    win.scrollY = 6049;
    win.fire("scroll");
    vi.advanceTimersByTime(1000); // 6049 + 760 = 6809 → 6800
    win.scrollY = 0;
    win.fire("pagehide");
    expect(calls[0].params.scroll_max).toBe(6800);
  });

  it("소프트 이동 뒤에는 착지 뷰 값에서 멈추고 soft_nav_before_send=1·nav_type=soft 로 보낸다", () => {
    const main = el("main", {}, [autoSlot(500, DONE_FILLED)]);
    const doc = fakeDocument(el("body", {}, [main]));
    const win = fakeWindow(doc);
    const { calls, send } = recorder();
    installAutoAdsSeen(asWin(win), send);
    vi.advanceTimersByTime(AUTOADS_POLL_MS);
    goSoft();
    // 다음 뷰에서 새로 붙은 자리는 착지 뷰 수치에 섞지 않는다.
    [autoSlot(900, DONE_FILLED), autoSlot(1900, DONE_FILLED)].forEach((slot) => adopt(main, slot));
    win.scrollY = 4000;
    vi.advanceTimersByTime(AUTOADS_POLL_MS);
    win.fire("scroll");
    expect(win.removeEventListener).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true });
    doc.visibilityState = "hidden";
    doc.fire("visibilitychange");
    expect(send).toHaveBeenCalledTimes(1);
    expect(calls[0].params).toMatchObject({
      aa_placed: 1,
      aa_req: 1,
      aa_filled: 1,
      scroll_max: 800,
      nav_type: "soft",
      soft_nav_before_send: 1,
      page_group: "salary-db", // 착지 경로 기준
      position: "1-1-1",
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("자리가 없으면 위치 필드 없이 보낸다", () => {
    const doc = fakeDocument(el("body", {}, [el("ins", { cls: "adsbygoogle", attrs: { "data-ad-slot": "1" } })]));
    const win = fakeWindow(doc, { pathname: "/" });
    const { calls, send } = recorder();
    installAutoAdsSeen(asWin(win), send);
    win.fire("pagehide");
    expect(calls[0].params).toMatchObject({ aa_placed: 0, manual_ins: 1, position: "0-0-0", page_group: "home" });
    expect(calls[0].params).not.toHaveProperty("aa_first_top");
    expect(calls[0].params).not.toHaveProperty("aa_last_top");
  });

  it("window 가 비었거나 send 가 throw 해도 예외가 밖으로 나가지 않는다", () => {
    expect(installAutoAdsSeen(null, vi.fn())).toBe(false);
    expect(installAutoAdsSeen(undefined, vi.fn())).toBe(false);
    const bare = {} as AutoAdsWindow;
    expect(() => installAutoAdsSeen(bare, vi.fn())).not.toThrow();
    expect(() => vi.advanceTimersByTime(AUTOADS_POLL_WINDOW_MS)).not.toThrow();

    const doc = fakeDocument(el("body", {}, [autoSlot(100)]));
    const win = fakeWindow(doc, { storage: undefined });
    const send = vi.fn(() => {
      throw new Error("gtag blocked");
    });
    installAutoAdsSeen(asWin(win), send);
    expect(() => win.fire("pagehide")).not.toThrow();
    expect(send).toHaveBeenCalledTimes(1);
    expect((send.mock.calls[0] as unknown[])[1]).toMatchObject({ ama_cfg: 0 });
  });
});

// ---------- 6) DOM 무변경 ----------

const DOM_WRITES = new Set([
  "appendChild", "append", "prepend", "insertBefore", "insertAdjacentElement", "insertAdjacentHTML", "insertAdjacentText",
  "removeChild", "replaceChild", "replaceChildren", "remove", "before", "after", "replaceWith",
  "setAttribute", "setAttributeNS", "removeAttribute", "removeAttributeNS", "toggleAttribute",
  "classList", "className", "style", "dataset", "innerHTML", "outerHTML", "textContent", "innerText",
  "write", "writeln", "createElement", "createTextNode", "attachShadow", "scrollTo", "scrollBy", "scrollIntoView", "focus",
]);

/** 읽기만 통과시키고 쓰기·변경 메서드 접근을 모두 기록하는 프록시(돌려주는 객체도 같은 프록시로 감싼다). */
function guardDom<T extends object>(target: T, log: string[], cache = new WeakMap<object, object>()): T {
  const wrap = (value: unknown): unknown =>
    value !== null && typeof value === "object" ? guardDom(value as object, log, cache) : value;
  const cached = cache.get(target);
  if (cached) return cached as T;
  const proxy = new Proxy(target, {
    get(t, prop, receiver) {
      if (typeof prop === "string" && DOM_WRITES.has(prop)) log.push(`get ${prop}`);
      const value = Reflect.get(t, prop, receiver);
      if (typeof value === "function") {
        return (...args: unknown[]) => wrap((value as (...a: unknown[]) => unknown).apply(t, args));
      }
      return wrap(value);
    },
    set(_t, prop) {
      log.push(`set ${String(prop)}`);
      return true;
    },
    defineProperty(_t, prop) {
      log.push(`define ${String(prop)}`);
      return true;
    },
    deleteProperty(_t, prop) {
      log.push(`delete ${String(prop)}`);
      return true;
    },
  });
  cache.set(target, proxy);
  return proxy;
}

describe("DOM 무변경", () => {
  it("설치부터 전송까지 DOM 에 쓰지 않고 MutationObserver 를 만들지 않는다(window 쓰기는 설치 플래그 1개)", () => {
    const observers = vi.fn();
    vi.stubGlobal(
      "MutationObserver",
      class {
        constructor() {
          observers();
        }
        observe() {}
        disconnect() {}
      },
    );
    const { body } = companyFixture();
    const log: string[] = [];
    const rawDoc = fakeDocument(body, 8000);
    const doc = guardDom(rawDoc, log);
    const rawWin = fakeWindow(null, { scrollY: 200 });
    const windowWrites: string[] = [];
    const win = new Proxy(Object.assign(rawWin, { document: doc }), {
      set(t, prop, value) {
        windowWrites.push(String(prop));
        return Reflect.set(t, prop, value);
      },
    });
    const { send } = recorder();
    installAutoAdsSeen(asWin(win), send);
    vi.advanceTimersByTime(AUTOADS_POLL_WINDOW_MS);
    rawWin.fire("scroll");
    rawDoc.visibilityState = "hidden";
    rawDoc.fire("visibilitychange");
    expect(send).toHaveBeenCalledTimes(1);
    expect(log).toEqual([]);
    expect(windowWrites).toEqual(["__msyAutoAdsSeenInstalled"]);
    expect(observers).not.toHaveBeenCalled();
  });

  it("소스에 DOM 쓰기 API·DOM 관찰자가 없다(주석 제외)", () => {
    for (const file of ["src/lib/autoAdsSeen.ts", "src/components/AutoAdsSeenTracker.tsx"]) {
      const code = read(file)
        .split(/\r?\n/)
        .filter((line) => !line.trim().startsWith("//"))
        .join("\n");
      expect(code, file).not.toMatch(
        /MutationObserver|setAttribute|removeAttribute|appendChild|insertBefore|removeChild|insertAdjacent|innerHTML|textContent|classList|\.style\b|\.dataset\b|setItem|removeItem|\.push\(\s*\{|adsbygoogle\s*\|\|/,
      );
    }
  });
});

// ---------- trackEvent 연동 ----------

describe("trackEvent 로 보낼 때", () => {
  it("공개 금액 페이지의 실경로를 page_location 으로 유지하고 beacon·숫자 인자를 그대로 넘긴다", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag, location: { href: "https://www.moneysalary.com/monthly/3000000" } });
    vi.stubGlobal("document", { referrer: "" });
    const doc = fakeDocument(el("body", {}, [autoSlot(1234, DONE_FILLED)]), 4000);
    const win = fakeWindow(doc, { pathname: "/monthly/3000000", innerWidth: 800 });
    installAutoAdsSeen(asWin(win), trackEvent);
    win.fire("pagehide");
    expect(gtag).toHaveBeenCalledTimes(1);
    const [command, name, params] = gtag.mock.calls[0];
    expect([command, name]).toEqual(["event", "autoads_seen"]);
    expect(params).toMatchObject({
      page_location: "https://www.moneysalary.com/monthly/3000000",
      page_group: "monthly",
      position: "1-1-1",
      aa_placed: 1,
      aa_first_top: 1200,
      doc_h: 4000,
      viewport: "t",
      transport_type: "beacon",
      measurement_version: "aa1",
    });
  });
});

// ---------- 7) 배선 ----------

describe("배선 — 루트 layout 의 무렌더 컴포넌트", () => {
  it("SSR 출력이 빈 문자열이다(DOM 노드 0개)", () => {
    expect(renderToStaticMarkup(createElement(AutoAdsSeenTracker))).toBe("");
  });

  it("layout 이 import·마운트하고, 위치는 #main-content 밖(다른 무렌더 계측 옆)이다", () => {
    const layout = read("src/app/layout.tsx");
    expect(layout).toContain('import AutoAdsSeenTracker from "@/components/AutoAdsSeenTracker";');
    const mount = layout.indexOf("<AutoAdsSeenTracker />");
    expect(mount).toBeGreaterThan(layout.indexOf("</main>"));
    expect(mount).toBeGreaterThan(layout.indexOf("<NavTypeTracker />"));
    expect(layout.match(/<AutoAdsSeenTracker \/>/g)).toHaveLength(1);
  });

  it("컴포넌트는 클라이언트 전용·무렌더이고 사이트 trackEvent 로 설치한다", () => {
    const tracker = read("src/components/AutoAdsSeenTracker.tsx");
    expect(tracker.startsWith('"use client";')).toBe(true);
    expect(tracker).toContain("installAutoAdsSeen(window as unknown as AutoAdsWindow, trackEvent);");
    expect(tracker).toContain("return null;");
  });
});
