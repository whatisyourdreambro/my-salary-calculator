// 소프트 내비게이션 계측(nav_type) 회귀 가드 (2026-09-25, 수익 추천 #1 1단계 — 측정 전용)
//
// 확인하는 것:
//  1) 첫 page_view(ga4-init config) 전에 gtag('set', { nav_type: 'landing' }) 이 큐에 들어간다.
//  2) 클라이언트 전환은 history.pushState/replaceState 가 URL 을 바꾸기 '직전'에 'soft' 로 바뀐다 —
//     향상된 측정(브라우저 기록 이벤트)이 그 호출 자리에서 만드는 page_view 가 soft 를 싣는다.
//  3) 같은 URL replaceState(Next 하이드레이션)·해시만 바뀌는 이동은 새 뷰가 아니다.
//  4) 광고 계측 5종이 같은 값을 이벤트 인자로 싣는다. 요청·렌더·dedup 로직(AdPlacement)과 ga4-init 은 무변경.
// jsdom 이 없어 가짜 window 와 gtag.js 흉내(큐 순차 처리 + history 감싸기)로 순서를 검증한다.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  documentUrlKey,
  getNavType,
  installNavTypeTracking,
  markSoftNavigation,
  resetNavTypeForTests,
  type NavTypeWindow,
} from "../navType";
import {
  trackAdFillStatus,
  trackAdRequestAttempt,
  trackAdRequestError,
  trackAdUnitClick,
  trackCalcSuccess,
} from "../analytics";

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

type HistoryFn = (data: unknown, unused: string, url?: string | URL | null) => void;
type FakeWindow = NavTypeWindow & {
  log: string[];
  popstateListeners: Array<() => void>;
  history: { pushState: HistoryFn; replaceState: HistoryFn; state: unknown };
};

function fakeWindow(href: string): FakeWindow {
  const win = {
    location: { href },
    log: [] as string[],
    popstateListeners: [] as Array<() => void>,
    addEventListener(type: "popstate", listener: () => void) {
      if (type === "popstate") win.popstateListeners.push(listener);
    },
  } as unknown as FakeWindow;
  const move = (kind: string) =>
    function (this: unknown, data: unknown, _unused: string, url?: string | URL | null) {
      win.log.push(`native-${kind}:${String(url)}`);
      win.history.state = data;
      if (url != null) win.location.href = new URL(String(url), win.location.href).href;
    };
  win.history = { pushState: move("push"), replaceState: move("replace"), state: null };
  return win;
}

/** layout.tsx 의 ga4-init 인라인 스크립트와 같은 동작. */
function runGa4Init(win: FakeWindow) {
  const queue = (win.dataLayer = win.dataLayer || []);
  win.gtag = function (...commandArgs: unknown[]) {
    void commandArgs;
    // eslint-disable-next-line prefer-rest-params
    queue.push(arguments);
  };
  win.gtag("js", new Date(0));
  win.gtag("config", "G-EZ8GT7RPEZ", { send_page_view: true });
}

type Hit = { en: string; url: string; nav_type: unknown };

/**
 * gtag.js 흉내: 큐를 순서대로 처리(set 은 전역값 병합, config 는 page_view 발생)하고, 이후 push 는 즉시 처리한다.
 * 향상된 측정처럼 pushState/replaceState 를 바깥에서 감싸 URL(해시 제외)이 바뀌면 그 자리에서 page_view 를 만든다.
 */
function loadFakeGtagJs(win: FakeWindow): Hit[] {
  const hits: Hit[] = [];
  const globals: Record<string, unknown> = {};
  const handle = (entry: unknown) => {
    const args = Array.from(entry as ArrayLike<unknown>);
    if (Object.prototype.toString.call(entry) !== "[object Arguments]") return; // 배열·객체는 명령이 아니다
    if (args[0] === "set") Object.assign(globals, args[1] as object);
    if (args[0] === "config") hits.push({ en: "page_view", url: win.location.href, nav_type: globals.nav_type });
  };
  const queue = (win.dataLayer = win.dataLayer || []);
  queue.forEach(handle);
  queue.push = (...entries: unknown[]) => {
    entries.forEach(handle);
    return Array.prototype.push.apply(queue, entries);
  };
  let last = documentUrlKey(win.location.href);
  const onHistory = () => {
    const now = documentUrlKey(win.location.href);
    if (now !== last) hits.push({ en: "page_view", url: win.location.href, nav_type: globals.nav_type });
    last = now;
  };
  for (const name of ["pushState", "replaceState"] as const) {
    const inner = win.history[name];
    win.history[name] = function (this: unknown, ...args: Parameters<HistoryFn>) {
      const result = inner.apply(this, args);
      onHistory();
      return result;
    };
  }
  win.popstateListeners.push(onHistory);
  return hits;
}

/** Next AppRouter 의 외부 pushState 지원 패치 흉내(.bind 로 그 시점 함수를 잡는다). */
function patchLikeNextAppRouter(win: FakeWindow) {
  for (const name of ["pushState", "replaceState"] as const) {
    const original = win.history[name].bind(win.history);
    win.history[name] = function (data: unknown, unused: string, url?: string | URL | null) {
      return original(data, unused, url);
    };
  }
}

function popTo(win: FakeWindow, href: string) {
  win.location.href = href;
  win.popstateListeners.forEach((listener) => listener());
}

beforeEach(() => resetNavTypeForTests());
afterEach(() => vi.unstubAllGlobals());

describe("nav_type — GA4 page_view 분류(gtag set)", () => {
  it("첫 page_view 는 landing, 링크 이동 뒤 page_view 는 soft — page_view 수는 늘지 않는다", () => {
    const win = fakeWindow("https://www.moneysalary.com/salary-db/samsung-electronics");
    installNavTypeTracking(win); // NavTypeTracker effect (ga4-init 보다 앞 형제)
    patchLikeNextAppRouter(win); // 부모 AppRouter effect
    runGa4Init(win); // Script(ga4-init) effect
    const hits = loadFakeGtagJs(win); // gtag.js 비동기 로드

    expect(hits).toEqual([
      { en: "page_view", url: "https://www.moneysalary.com/salary-db/samsung-electronics", nav_type: "landing" },
    ]);
    expect(getNavType()).toBe("landing");

    // Next 하이드레이션·스크롤 복원의 같은 URL replaceState 는 새 뷰가 아니다.
    win.history.replaceState({ __NA: true }, "", "https://www.moneysalary.com/salary-db/samsung-electronics");
    expect(getNavType()).toBe("landing");

    // AppLink 클릭 → HistoryUpdater 의 pushState
    win.history.pushState({ __NA: true }, "", "/salary-db/sk-hynix");
    expect(getNavType()).toBe("soft");
    // 뒤로가기(popstate)로 첫 경로에 돌아와도 같은 문서 — soft 유지
    popTo(win, "https://www.moneysalary.com/salary-db/samsung-electronics");
    expect(getNavType()).toBe("soft");

    expect(hits.map((hit) => hit.nav_type)).toEqual(["landing", "soft", "soft"]);
    expect(hits).toHaveLength(3); // 문서 로드 1 + 기록 이벤트 2 — 추가 page_view 없음
  });

  it("'landing' set 은 ga4-init 의 js·config 보다 먼저 큐에 들어가고, gtag.js 가 읽는 arguments 객체 모양이다", () => {
    const win = fakeWindow("https://www.moneysalary.com/");
    installNavTypeTracking(win);
    runGa4Init(win);
    const queue = win.dataLayer as ArrayLike<unknown>[];
    expect(Object.prototype.toString.call(queue[0])).toBe("[object Arguments]");
    expect(queue.map((entry) => Array.from(entry)[0])).toEqual(["set", "js", "config"]);
    expect(Array.from(queue[0])).toEqual(["set", { nav_type: "landing" }]);
  });

  it("soft set 은 원래 pushState 보다 먼저 — 향상된 측정 래퍼가 안쪽이든 바깥쪽이든 page_view 가 soft 를 싣는다", () => {
    // gtag.js 가 먼저 감싼 경우(우리 래퍼가 바깥)
    const win = fakeWindow("https://www.moneysalary.com/calc/vat");
    runGa4Init(win);
    const hits = loadFakeGtagJs(win);
    installNavTypeTracking(win);
    const gtag = vi.fn(win.gtag);
    win.gtag = (...args: unknown[]) => {
      win.log.push(`gtag:${JSON.stringify(args)}`);
      gtag(...args);
    };
    win.history.pushState({}, "", "/calc/salary");
    expect(win.log).toEqual([`gtag:${JSON.stringify(["set", { nav_type: "soft" }])}`, "native-push:/calc/salary"]);
    expect(hits[hits.length - 1]).toEqual({ en: "page_view", url: "https://www.moneysalary.com/calc/salary", nav_type: "soft" });
  });

  it("쿼리만 바뀌는 전환(/table ?page=2)은 soft, 해시만 바뀌는 replaceState(samsung-bonus 공유 해시)는 landing 유지", () => {
    const win = fakeWindow("https://www.moneysalary.com/calc/samsung-bonus");
    installNavTypeTracking(win);
    win.history.replaceState(null, "", "/calc/samsung-bonus#r=abc");
    expect(getNavType()).toBe("landing");
    win.history.pushState(null, "", "/calc/samsung-bonus?page=2");
    expect(getNavType()).toBe("soft");
  });

  it("URL 인자 없는 pushState 는 판정하지 않고, 래퍼는 this·인자·반환값을 그대로 넘기며 판정 오류로 이동을 막지 않는다", () => {
    const win = fakeWindow("https://www.moneysalary.com/");
    const seen: unknown[] = [];
    win.history.pushState = function (this: unknown, ...args: Parameters<HistoryFn>) {
      seen.push(this, args.length, args[0]);
      return "native-result" as unknown as void;
    };
    installNavTypeTracking(win);
    const history = win.history;
    expect(history.pushState({ a: 1 }, "")).toBe("native-result");
    expect(seen).toEqual([history, 2, { a: 1 }]);
    expect(getNavType()).toBe("landing");

    win.location.href = "not a url"; // 해석 불가 → 비교하지 않고 원래 호출 진행
    expect(() => history.pushState({}, "", "/x")).not.toThrow();
    expect(seen).toHaveLength(6);
  });

  it("문서당 1회만 설치된다(Strict Mode·HMR 재실행에도 이중 래핑·이중 set 없음)", () => {
    const win = fakeWindow("https://www.moneysalary.com/");
    installNavTypeTracking(win);
    const wrapped = win.history.pushState;
    installNavTypeTracking(win);
    expect(win.history.pushState).toBe(wrapped);
    expect(win.dataLayer).toHaveLength(1);
    expect(win.popstateListeners).toHaveLength(1);
  });

  it("popstate 로 첫 URL 과 다른 항목에 도착하면 soft", () => {
    const win = fakeWindow("https://www.moneysalary.com/a");
    installNavTypeTracking(win);
    popTo(win, "https://www.moneysalary.com/a#top");
    expect(getNavType()).toBe("landing");
    popTo(win, "https://www.moneysalary.com/b");
    expect(getNavType()).toBe("soft");
  });

  it("폴백 markSoftNavigation 은 1회만 set 을 보낸다", () => {
    const win = fakeWindow("https://www.moneysalary.com/");
    const gtag = vi.fn();
    win.gtag = gtag;
    markSoftNavigation(win);
    markSoftNavigation(win);
    expect(getNavType()).toBe("soft");
    expect(gtag.mock.calls).toEqual([["set", { nav_type: "soft" }]]);
  });

  it("documentUrlKey 는 해시를 빼고 경로·쿼리를 비교한다", () => {
    expect(documentUrlKey("/salary-db/x?page=2#top", "https://www.moneysalary.com/")).toBe(
      "https://www.moneysalary.com/salary-db/x?page=2",
    );
    expect(documentUrlKey("::bad")).toBeNull();
  });
});

describe("nav_type — 광고 계측 이벤트 인자", () => {
  function stubGtag() {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag, location: { href: "https://www.moneysalary.com/salary-db/samsung-electronics" } });
    return gtag;
  }

  it("광고 계측 5종이 착지 뷰에서는 landing, 클라이언트 전환 뒤에는 soft 를 싣는다", () => {
    const gtag = stubGtag();
    const sendAll = () => {
      trackAdRequestAttempt("result", "/salary-db/samsung-electronics");
      trackAdRequestError("result", "/salary-db/samsung-electronics");
      trackAdFillStatus("result", "1234567890", "filled", "/salary-db/samsung-electronics", { ad_height: 250, viewport: "m" });
      trackAdFillStatus("result", "1234567890", "unfilled", "/salary-db/samsung-electronics");
      trackAdUnitClick("result", "1234567890", "/salary-db/samsung-electronics");
    };
    sendAll();
    markSoftNavigation(fakeWindow("https://www.moneysalary.com/"));
    sendAll();
    const names = gtag.mock.calls.map((call) => call[1]);
    expect(names).toEqual([
      "ad_request_attempt", "ad_request_error", "ad_filled", "ad_unfilled", "ad_unit_click",
      "ad_request_attempt", "ad_request_error", "ad_filled", "ad_unfilled", "ad_unit_click",
    ]);
    expect(gtag.mock.calls.map((call) => call[2].nav_type)).toEqual([
      ...Array(5).fill("landing"),
      ...Array(5).fill("soft"),
    ]);
  });

  it("계산 이벤트 등 다른 이벤트 인자는 바꾸지 않는다(전역 trackEvent 무변경 — 10/10 판정 전)", () => {
    const gtag = stubGtag();
    trackCalcSuccess("salary", "/salary-db/samsung-electronics");
    expect(gtag.mock.calls[0][2]).not.toHaveProperty("nav_type");
  });
});

describe("nav_type — 배선(소스 고정)", () => {
  const layout = read("src/app/layout.tsx");

  it("NavTypeTracker 가 루트 layout 에서 ga4-init Script 보다 앞에 마운트된다", () => {
    expect(layout).toContain('import NavTypeTracker from "@/components/NavTypeTracker";');
    const tracker = layout.indexOf("<NavTypeTracker />");
    const ga4Init = layout.indexOf('<Script id="ga4-init" strategy="afterInteractive">');
    expect(tracker).toBeGreaterThan(-1);
    expect(ga4Init).toBeGreaterThan(tracker);
  });

  it("ga4-init 스크립트와 광고 컴포넌트는 그대로다(측정 인자만 추가)", () => {
    const ga4InitStart = layout.indexOf('<Script id="ga4-init" strategy="afterInteractive">');
    const ga4InitBody = layout.slice(ga4InitStart, layout.indexOf("</Script>", ga4InitStart));
    expect(ga4InitBody).toContain("gtag('config', 'G-EZ8GT7RPEZ', { send_page_view: true });");
    expect(ga4InitBody).not.toMatch(/nav_type|'set'/);
    expect(read("src/components/AdPlacement.tsx")).not.toMatch(/nav_?type/i);
    expect(read("src/lib/analytics.ts")).toContain('window.gtag?.("event", name, {');
  });

  it("NavTypeTracker 는 무렌더 클라이언트 컴포넌트로 설치 effect 를 먼저 선언한다", () => {
    const tracker = read("src/components/NavTypeTracker.tsx");
    expect(tracker.startsWith('"use client";')).toBe(true);
    expect(tracker).toContain("installNavTypeTracking(window as unknown as NavTypeWindow);");
    expect(tracker.indexOf("installNavTypeTracking(")).toBeLessThan(tracker.indexOf("markSoftNavigation()"));
    expect(tracker).toContain("return null;");
    expect(tracker).not.toMatch(/MutationObserver/);
  });
});
