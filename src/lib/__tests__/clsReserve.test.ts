// OPP-21 화면 밀림(CLS) 자리 예약 회귀 가드 (운영자 2026-11-01 승인 1번 — 동결 예외, 광고 최종 위치 불변)
//
// 대상 1: 하이드레이션 뒤에야 나타나던 즐겨찾기 버튼·인라인 공유 버튼(감사 code24-01) — 회사 상세 헤더·보너스 계산기 헤더 등.
//   원칙: 하이드레이션 뒤 최종 DOM·class 는 종전과 같고, 하이드레이션 전(서버 HTML)만 '같은 상자의 보이지 않는 자리'로 바뀐다.
// 대상 2: 홈 계산기 탭 — 고른 탭의 계산기 청크를 기다리는 동안 바깥 Suspense 의 44px 뼈대로 무너지지 않고
//   탭 줄은 그대로, 패널 안에 560px 자리를 둔다(Suspense 는 DOM 노드를 더하지 않아 로드 뒤 마크업 불변).
//
// 증명 방식(jsdom·브라우저 없이 renderToStaticMarkup 만):
//  1) 자리 예약 마크업 = 최종 마크업과 같은 태그·같은 class(+invisible)·같은 자식(아이콘·문구) — 상자 크기를 정하는 것이 같다.
//  2) 최종이 상태(즐겨찾기 켜짐/꺼짐, Web Share 유무)에 따라 달라지는 부분은 크기와 무관한 class(색)뿐이거나
//     고정 크기(w-11 h-11) 원의 개수뿐 — 320px 화면의 헤더 폭(288px) 안에서 한 줄(44px)이라 높이가 같다.
//  3) 최종에 없을 자리(공유 제외 경로·떠 있는 바·결과 키 없는 결과 공유)는 예약하지 않는다(종전과 같이 빈 문자열).

import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SharePageContext } from "@/lib/sharePolicy";

const nav = vi.hoisted(() => ({ pathname: "/calc/kia-bonus" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname, useSearchParams: () => new URLSearchParams() }));

// 앱 라우터 빌드는 next/dynamic 을 app-dynamic(React.lazy, ssr 기본·loading 없음이면 Suspense 없음)으로 바꾼다.
// vitest 는 그 별칭이 없어 pages 용 loadable 을 쓰므로, 테스트에서도 같은 구현으로 맞춘다.
vi.mock("next/dynamic", async () => {
  const mod = await import("next/dist/shared/lib/app-dynamic");
  return { default: (mod as unknown as { default: unknown }).default };
});
vi.mock("@/components/SalaryCalculator", () => ({
  default: () => createElement("div", { "data-testid": "salary-calculator" }, "salary calculator"),
}));

// 하이드레이션 뒤 상태는 훅을 덮어써서 그린다(없으면 실제 훅 = 서버 스냅숏 null).
const hook = vi.hoisted(() => ({ override: null as null | { pathname: string; context: SharePageContext | null; pending: boolean } }));
vi.mock("@/hooks/useSharePageContext", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/hooks/useSharePageContext")>();
  return { useSharePageContext: () => hook.override ?? real.useSharePageContext() };
});
vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));

import FavoritesButton, { favoritesButtonClassName, favoritesButtonLabel } from "@/components/FavoritesButton";
import ShareButtons, { CIRCLE, COMPACT_BUTTON, primaryShareChannels } from "@/components/ShareButtons";
import CalculatorTabs from "@/components/CalculatorTabs";
import { isSharePageContextPending } from "@/lib/sharePolicy";

const ORIGIN = "https://www.moneysalary.com";
const ready = (pathname: string, title = "페이지 | 머니샐러리") => ({
  pathname,
  context: { pathname, canonical: `${ORIGIN}${pathname}`, title, notFound: false } as SharePageContext,
  pending: false,
});

/** 루트 요소의 태그·속성·나머지(자식 전체)로 나눈다 */
function root(html: string) {
  const match = /^<([a-z]+)([^>]*)>([\s\S]*)$/.exec(html);
  if (!match) throw new Error(`no root element: ${html.slice(0, 80)}`);
  const cls = /\sclass="([^"]*)"/.exec(match[2])?.[1] ?? null;
  return { tag: match[1], attrs: match[2], cls, rest: match[3] };
}
const classTokens = (cls: string) => cls.split(/\s+/).filter(Boolean);
// 상자 크기에 관여하는 유틸리티(여백·크기·글자 크기·줄 높이·테두리 두께·표시 방식)
const SIZE_UTILITY = /^(?:[pm][xytblr]?-|gap-|w-|h-|min-[wh]-|max-[wh]-|text-(?:xs|sm|base|lg|[2-9]?xl|\[)|leading-|border(?:-[0-9]|-[xytblr])?$|inline|flex$|grid|block|hidden|truncate|line-clamp)/;

afterEach(() => {
  hook.override = null;
  nav.pathname = "/calc/kia-bonus";
});

describe("isSharePageContextPending — 자리 예약은 '아직 head 를 못 읽은' 동안만", () => {
  it("SSR·하이드레이션 첫 렌더(스냅숏 null)는 대기", () => {
    for (const path of ["/calc/kia-bonus", "/salary/50000000", "/salary-db/samsung-electronics", "/en/tools/loan", "/"]) {
      expect(isSharePageContextPending(null, path), path).toBe(true);
    }
  });
  it("결과가 항상 '없음'인 경로(공유 제외)는 대기가 아니다 — 최종에 없는 자리를 잡지 않는다", () => {
    for (const path of ["/dashboard", "/en/dashboard", "/contact", "/en/contact", "/report/x", "/favorites", "/widget/a"]) {
      expect(isSharePageContextPending(null, path), path).toBe(false);
    }
  });
  it("스냅숏이 한 번이라도 생기면 대기가 아니다 — 경로·정본이 끝내 안 맞는 쪽에 보이지 않는 자리가 남지 않는다", () => {
    const ctx = (pathname: string): SharePageContext => ({ pathname, canonical: null, title: "", notFound: false });
    expect(isSharePageContextPending(ctx("/salary-db/naver"), "/salary-db/kakao")).toBe(false);
    expect(isSharePageContextPending(ctx("/salary-db/kakao"), "/salary-db/kakao")).toBe(false);
    expect(isSharePageContextPending(ctx("/glossary/%EA%B8%89%EC%97%AC"), "/glossary/급여")).toBe(false);
  });
});

describe("FavoritesButton — 서버 HTML 자리 = 하이드레이션 뒤 버튼과 같은 상자", () => {
  for (const [label, path, props] of [
    ["보너스 계산기(경로 없음)", "/calc/kia-bonus", {}],
    ["/salary/[amount](제목만)", "/salary/50000000", { title: "연봉 5,000만원 실수령액" }],
    ["회사 상세(제목만)", "/salary-db/samsung-electronics", { title: "삼성전자 연봉" }],
    ["영문 셸(min-h-11)", "/en/tools/loan", { locale: "en" as const, className: "min-h-11" }],
  ] as const) {
    it(label, () => {
      nav.pathname = path;
      const reserved = renderToStaticMarkup(createElement(FavoritesButton, props));
      hook.override = ready(path);
      const hydrated = renderToStaticMarkup(createElement(FavoritesButton, props));
      const r = root(reserved);
      const h = root(hydrated);
      // 같은 태그·같은 자식(별 아이콘 + '즐겨찾기 추가' 문구) — 상자를 정하는 내용이 같다
      expect(r.tag).toBe("button");
      expect(h.tag).toBe("button");
      expect(r.rest).toBe(h.rest);
      // class 는 최종 + invisible 하나만 다르다(visibility 는 배치에 영향 없음)
      expect(r.cls).toBe(`${h.cls} invisible`);
      expect(h.cls).toBe(favoritesButtonClassName("labeled", false, "className" in props ? props.className : ""));
      // 보이지 않고·누를 수 없고·읽히지 않는다. 최종 버튼은 종전 그대로(aria-pressed, 자리표시 표식 없음)
      expect(r.attrs).toContain('aria-hidden="true"');
      expect(r.attrs).toContain('disabled=""');
      expect(r.attrs).toContain('tabindex="-1"');
      expect(r.attrs).toContain('data-cls-reserve="favorites"');
      expect(r.attrs).not.toContain("aria-pressed");
      expect(h.attrs).toContain('aria-pressed="false"');
      expect(h.attrs).not.toContain("data-cls-reserve");
      expect(h.attrs).not.toContain("invisible");
    });
  }

  it("하이드레이션 뒤 버튼은 종전 class·문구 그대로(공용 함수로 옮겨도 출력 불변)", () => {
    nav.pathname = "/calc/kia-bonus";
    hook.override = ready(nav.pathname);
    const labeled = renderToStaticMarkup(createElement(FavoritesButton, {}));
    expect(labeled).toContain('class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors text-sm font-bold bg-white border-canvas-200 text-navy hover:border-electric "');
    expect(labeled).toContain('class="lucide lucide-star w-4 h-4 text-faint-blue"');
    expect(labeled).toContain("즐겨찾기 추가</button>");
    const icon = renderToStaticMarkup(createElement(FavoritesButton, { variant: "icon" }));
    expect(icon).toContain('class="min-h-11 min-w-11 p-2 rounded-full hover:bg-canvas-100 transition-colors "');
    expect(icon).toContain('aria-label="즐겨찾기 추가"');
    expect(icon).toContain('class="lucide lucide-star w-5 h-5 text-faint-blue"');
  });

  it("즐겨찾기 켜짐/꺼짐 차이는 색 class 뿐 — 높이(여백·글자 크기·테두리 두께) 같다", () => {
    for (const variant of ["labeled", "icon"] as const) {
      const on = new Set(classTokens(favoritesButtonClassName(variant, true)));
      const off = new Set(classTokens(favoritesButtonClassName(variant, false)));
      const diff = [...on].filter((t) => !off.has(t)).concat([...off].filter((t) => !on.has(t)));
      for (const token of diff) expect(token, `${variant}:${token}`).not.toMatch(SIZE_UTILITY);
      // 높이를 정하는 class 가 양쪽에 그대로 있다: py-2.5 + text-sm(줄 20px) + border 1px*2 = 42px / icon min-h-11 = 44px
      const must = variant === "labeled" ? ["inline-flex", "py-2.5", "text-sm", "border"] : ["min-h-11", "min-w-11", "p-2"];
      for (const token of must) {
        expect(on.has(token) && off.has(token), `${variant}:${token}`).toBe(true);
      }
    }
    // 문구는 한 줄 길이(헤더 폭 288px 안 — 버튼 폭 약 160px)
    for (const en of [false, true]) for (const active of [false, true]) expect(favoritesButtonLabel(en, active).length).toBeLessThanOrEqual(22);
  });

  it("최종에 없는 자리는 예약하지 않는다 — 공유 제외 경로·명시 경로", () => {
    nav.pathname = "/dashboard";
    expect(renderToStaticMarkup(createElement(FavoritesButton, {}))).toBe("");
    nav.pathname = "/en/contact";
    expect(renderToStaticMarkup(createElement(FavoritesButton, { locale: "en" }))).toBe("");
    // 명시 경로는 종전처럼 서버 HTML 에 실제 버튼(자리표시 아님)
    nav.pathname = "/monthly/3000000";
    const explicit = renderToStaticMarkup(createElement(FavoritesButton, { path: "/monthly/3000000", title: "월급 300만원 실수령액", variant: "icon" }));
    expect(explicit).toContain('aria-pressed="false"');
    expect(explicit).not.toContain("data-cls-reserve");
    // head 확인 뒤 '없음'(정본 불일치)은 종전대로 빈 문자열
    hook.override = { pathname: "/calc/kia-bonus", context: null, pending: false };
    expect(renderToStaticMarkup(createElement(FavoritesButton, {}))).toBe("");
  });
});

describe("ShareButtons — 인라인 공유 줄 자리", () => {
  it("줄(row): 같은 바깥·줄 class, 같은 고정 크기 원(w-11 h-11) 4칸 — 288px 헤더에서 4칸·5칸 모두 한 줄(44px)", () => {
    nav.pathname = "/salary-db/samsung-electronics";
    const props = { title: "삼성전자 연봉 및 기업 정보 | Moneysalary", description: "설명", className: "justify-start" };
    const reserved = renderToStaticMarkup(createElement(ShareButtons, props));
    hook.override = ready(nav.pathname);
    const hydrated = renderToStaticMarkup(createElement(ShareButtons, props));
    const r = root(reserved);
    const h = root(hydrated);
    expect(r.tag).toBe("div");
    expect(r.cls).toBe(`${h.cls} invisible`);
    expect(r.attrs).toContain('aria-hidden="true"');
    expect(r.attrs).toContain('data-cls-reserve="share-row"');
    // 떠 있는 공유 바의 '인라인 공유 보임' 판정에 끼지 않게 data-share-root 없음. 제목·링크도 없음
    expect(reserved).not.toContain("data-share-root");
    expect(reserved).not.toContain("삼성전자");
    expect(reserved).not.toContain("moneysalary.com");
    expect(h.attrs).toContain('data-share-root="primary"');

    const rowClass = (html: string) => /<div class="(flex flex-wrap items-center gap-3)">/.exec(html)?.[1];
    expect(rowClass(reserved)).toBe("flex flex-wrap items-center gap-3");
    expect(rowClass(hydrated)).toBe("flex flex-wrap items-center gap-3");
    const circles = (html: string) => [...html.matchAll(/<(?:span|button)[^>]*class="([^"]*w-11 h-11 shrink-0[^"]*)"/g)].map((m) => m[1]);
    const reservedCircles = circles(reserved);
    const hydratedCircles = circles(hydrated); // 서버 렌더는 Web Share 미확인 상태(5칸)
    expect(reservedCircles).toHaveLength(primaryShareChannels("row", false, true).length + 1);
    expect(hydratedCircles).toHaveLength(primaryShareChannels("row", false, false).length + 1);
    for (const cls of reservedCircles) {
      expect(cls.startsWith(CIRCLE)).toBe(true);
      expect(hydratedCircles).toContain(cls);
    }
    // 원 1개 = 44px 고정(shrink-0), 간격 gap-3 = 12px → 4칸 212px · 5칸 268px ≤ 320 화면 헤더 288px(px-4/page-gutter 16px)
    const rowWidth = (n: number) => n * 44 + (n - 1) * 12;
    for (const canWebShare of [true, false]) for (const en of [false, true]) {
      expect(rowWidth(primaryShareChannels("row", en, canWebShare).length + 1)).toBeLessThanOrEqual(320 - 2 * 16);
    }
  });

  it("첫 줄 채널은 종전 식과 같다(공용 함수로 옮겨도 출력 불변)", () => {
    expect(primaryShareChannels("row", false, false)).toEqual(["kakao", "copy", "naver_blog", "x"]);
    expect(primaryShareChannels("row", false, true)).toEqual(["kakao", "webshare", "copy"]);
    expect(primaryShareChannels("row", true, false)).toEqual(["copy", "x", "facebook"]);
    expect(primaryShareChannels("row", true, true)).toEqual(["webshare", "copy", "x"]);
    expect(primaryShareChannels("floating", false, false)).toEqual(["kakao", "copy"]);
    expect(primaryShareChannels("floating", false, true)).toEqual(["kakao", "webshare", "copy"]);
    expect(primaryShareChannels("floating", true, false)).toEqual(["copy"]);
    expect(primaryShareChannels("floating", true, true)).toEqual(["webshare", "copy"]);
  });

  it("작은 버튼(compact): 같은 class·같은 아이콘의 비활성 버튼", () => {
    nav.pathname = "/guides/salary-negotiation";
    const reserved = renderToStaticMarkup(createElement(ShareButtons, { title: "가이드", variant: "compact" }));
    hook.override = ready(nav.pathname);
    const hydrated = renderToStaticMarkup(createElement(ShareButtons, { title: "가이드", variant: "compact" }));
    expect(root(reserved).cls).toBe(`${root(hydrated).cls} invisible`);
    const button = (html: string) => /<button[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/button>/.exec(html);
    expect(button(reserved)?.[1]).toBe(COMPACT_BUTTON);
    expect(button(hydrated)?.[1]).toBe(COMPACT_BUTTON);
    expect(button(reserved)?.[2]).toBe(button(hydrated)?.[2]); // 같은 Share2 아이콘
    expect(reserved).toContain('data-cls-reserve="share-compact"');
    expect(reserved).not.toContain("aria-label");
  });

  it("최종에 없는 자리는 예약하지 않는다 — 떠 있는 바·결과 키 없는 결과 공유·공유 제외 경로", () => {
    expect(renderToStaticMarkup(createElement(ShareButtons, { title: "x", variant: "floating" }))).toBe("");
    expect(renderToStaticMarkup(createElement(ShareButtons, { title: "x", shareMode: "result" }))).toBe("");
    nav.pathname = "/dashboard";
    expect(renderToStaticMarkup(createElement(ShareButtons, { title: "x" }))).toBe("");
  });
});

describe("CalculatorTabs — 고른 탭의 청크를 기다리는 동안 탭 줄은 그대로, 패널 안 560px 자리", () => {
  it("청크 대기 중: 탭 9개가 남고 패널 안에 min-h-[560px] 자리 — 바깥 44px 뼈대로 무너지지 않는다", () => {
    nav.pathname = "/";
    const html = renderToStaticMarkup(createElement(CalculatorTabs));
    expect(html).toContain('role="tablist"');
    expect([...html.matchAll(/role="tab"/g)]).toHaveLength(9);
    const panelStart = html.indexOf('role="tabpanel"');
    expect(panelStart).toBeGreaterThan(html.indexOf('role="tablist"'));
    const panel = html.slice(panelStart);
    expect(panel).toContain('<div class="flex min-h-[560px] items-center justify-center" role="status"><span class="text-sm text-muted-foreground">계산기를 준비하고 있습니다.</span></div>');
    // 바깥 Suspense 의 뼈대(애니메이션 회색 칸)는 그리지 않는다
    expect(html).not.toContain("animate-pulse");
    expect(html).not.toContain("salary calculator");
  });

  it("청크 로드 뒤: 대기 자리 없이 계산기만 — Suspense 는 DOM 노드를 더하지 않는다(로드 뒤 마크업 불변)", async () => {
    nav.pathname = "/";
    renderToStaticMarkup(createElement(CalculatorTabs));
    await import("@/components/SalaryCalculator");
    for (let i = 0; i < 5; i += 1) await new Promise((resolve) => setTimeout(resolve, 0));
    const html = renderToStaticMarkup(createElement(CalculatorTabs));
    expect(html).not.toContain("계산기를 준비하고 있습니다.");
    expect(html).not.toContain("min-h-[560px]");
    expect(html).toMatch(/role="tabpanel"[^>]*><div data-testid="salary-calculator">salary calculator<\/div><\/div><\/div>$/);
  });
});
