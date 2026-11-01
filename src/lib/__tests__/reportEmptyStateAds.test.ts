import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Children, createElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// IVT-10 (2026-11-01 운영자 승인): /report 는 저장 결과가 없으면 제목·안내 한 줄·링크뿐인 빈 화면이다.
// 크롤러(localStorage 없음)에는 항상 이 화면이 보이므로, 페이지 끝 광고 묶음(HomeTopAd + InArticleAd +
// 쿠팡)은 리포트(데이터) 화면에서만 </main> 바로 뒤에 렌더한다. 빈 화면으로 광고를 옮기지 않는다.

const state = vi.hoisted(() => ({ values: [] as unknown[], index: 0, effects: [] as (() => void)[] }));
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return { ...actual,
    useState(initial: unknown) {
      const slot = state.index++;
      return [state.values[slot] ?? initial, (value: unknown) => { state.values[slot] = value; }];
    },
    useEffect(effect: () => void) { state.effects.push(effect); },
    useRef() { return { current: null }; },
  };
});
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("@/components/PageFooterAds", () => ({
  default: (props: { maxWidth?: string }) => createElement("aside", { "data-test-ad": "page-footer", "data-max-width": props.maxWidth }),
}));
vi.mock("@/components/AdPlacement", () => ({ GuideMidAd: () => createElement("aside", { "data-test-ad": "guide-mid" }) }));
vi.mock("@/components/AppLink", () => ({ default: (props: { href: string; children: unknown }) => createElement("a", { href: props.href }, props.children as string) }));
vi.mock("react-countup", () => ({ default: (props: { end: number }) => createElement("span", null, String(props.end)) }));
vi.mock("lucide-react", () => ({ Info: () => null, BarChart2: () => null, TrendingUp: () => null }));

import PageFooterAds from "@/components/PageFooterAds";
import ReportPage from "@/app/report/page";

const source = readFileSync(join(process.cwd(), "src/app/report/page.tsx"), "utf8");
// ad-audit.mjs SLOT_OF 와 같은 광고 컴포넌트 목록
const AD_TAG_RE = /<(HomeTopAd|CalcResultAd|ResultAd|GuideMidAd|SidebarAd|InArticleAd|MultiplexAd|Display2Ad|CompanyTopAd|PageFooterAds|CoupangBanner|AffiliateSlot)\b/;
const lineOf = (index: number) => source.slice(0, index).split("\n").length;
const count = (text: string, needle: string) => text.split(needle).length - 1;

function sections() {
  const reportStart = source.indexOf("const Report = () => {");
  const pageStart = source.indexOf("export default function ReportPage()");
  const emptyStart = source.indexOf("if (!data) {", reportStart);
  const emptyMainEnd = source.indexOf("</main>", emptyStart);
  const dataMainStart = source.indexOf("<main", emptyMainEnd);
  const dataMainEnd = source.indexOf("</main>", dataMainStart);
  for (const at of [reportStart, pageStart, emptyStart, emptyMainEnd, dataMainStart, dataMainEnd]) expect(at).toBeGreaterThan(-1);
  expect(reportStart).toBeLessThan(emptyStart);
  expect(dataMainEnd).toBeLessThan(pageStart);
  return { reportStart, pageStart, emptyStart, emptyMainEnd, dataMainStart, dataMainEnd };
}

describe("/report 빈 화면 광고 없음 — 소스 구조", () => {
  it("<PageFooterAds 는 파일 전체에 정확히 한 번, Report 의 데이터 화면 </main> 바로 뒤에만 있다", () => {
    const { pageStart, dataMainStart, dataMainEnd } = sections();
    expect(count(source, "<PageFooterAds")).toBe(1);
    const footerAt = source.indexOf("<PageFooterAds");
    expect(lineOf(footerAt), `PageFooterAds line ${lineOf(footerAt)} vs data <main line ${lineOf(dataMainStart)}`).toBeGreaterThan(lineOf(dataMainStart));
    expect(footerAt).toBeGreaterThan(dataMainEnd);
    expect(footerAt).toBeLessThan(pageStart);
    // </main> 과 광고 사이에는 주석·공백만 — 데이터 화면의 DOM 순서는 종전과 같다(광고가 </main> 직후).
    const between = source.slice(dataMainEnd + "</main>".length, footerAt).replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");
    expect(between.trim()).toBe("");
    expect(source.slice(footerAt)).toMatch(/^<PageFooterAds maxWidth="4xl" \/>/);
  });

  it("export default function ReportPage 본문에는 광고 컴포넌트가 없다", () => {
    const { pageStart } = sections();
    const body = source.slice(pageStart);
    expect(body).not.toContain("<PageFooterAds");
    expect(body).not.toMatch(AD_TAG_RE);
  });

  it("저장 리포트가 없을 때의 빈 화면 분기에는 광고 컴포넌트가 없다", () => {
    const { emptyStart, emptyMainEnd } = sections();
    const emptyBranch = source.slice(emptyStart, emptyMainEnd);
    expect(emptyBranch).toContain("저장된 리포트가 없습니다");
    expect(emptyBranch).not.toMatch(AD_TAG_RE);
  });
});

const lastUpdated = "2026-10-03T00:00:00.000Z";
const valid = { salary: { annualSalary: 60000000, monthlyNet: 4000000 }, lastUpdated };

// 페이지 전체(ReportPage 셸 = Suspense + 형제 포함)를 렌더한다. 1차 렌더로 저장값 읽기 effect 를 모으고
// 실행한 뒤 2차 렌더 결과를 돌려준다(훅은 위 react 모의 — 컴포넌트 함수가 직접 읽는다).
function renderPage(raw: string | null) {
  state.values = [null, null, ""]; state.index = 0; state.effects = [];
  vi.stubGlobal("localStorage", { getItem: vi.fn(() => raw), setItem: vi.fn(), removeItem: vi.fn() });
  renderToStaticMarkup(createElement(ReportPage));
  expect(state.effects).toHaveLength(1);
  const effect = state.effects[0]; state.effects = []; effect();
  state.index = 0;
  const html = renderToStaticMarkup(createElement(ReportPage));
  vi.unstubAllGlobals();
  return html;
}

describe("/report 빈 화면 광고 없음 — 렌더 결과", () => {
  it("ReportPage 셸(Suspense)에는 <Report /> 하나뿐이고 광고 묶음이 없다", () => {
    const shell = ReportPage() as ReactElement<{ children: ReactNode }>;
    const kids = Children.toArray(shell.props.children) as ReactElement[];
    expect(kids).toHaveLength(1);
    expect(kids.some((kid) => kid.type === PageFooterAds)).toBe(false);
  });

  it("저장 리포트가 없는 빈 화면에는 광고가 하나도 렌더되지 않는다", () => {
    const html = renderPage(null);
    expect(html).toContain("저장된 리포트가 없습니다");
    expect(html).not.toContain("data-test-ad");
  });

  it("저장 결과를 읽지 못한 안내 화면(같은 빈 화면 분기)에도 광고가 없다", () => {
    const html = renderPage(JSON.stringify({ salary: { monthlyNet: 4000000 }, lastUpdated }));
    expect(html).toContain('role="alert"');
    expect(html).toContain("저장된 리포트가 없습니다");
    expect(html).not.toContain("data-test-ad");
  });

  it("리포트가 있으면 페이지 끝 광고 묶음이 </main> 바로 뒤에 한 번 렌더되고 본문 중간 광고는 그대로다", () => {
    const html = renderPage(JSON.stringify(valid));
    expect(html).toContain("종합 금융 리포트");
    expect(count(html, 'data-test-ad="page-footer"')).toBe(1);
    expect(html).toContain('data-max-width="4xl"');
    const mainEnd = html.lastIndexOf("</main>");
    expect(html.indexOf('data-test-ad="page-footer"')).toBeGreaterThan(mainEnd);
    expect(html.slice(mainEnd + "</main>".length).startsWith("<aside")).toBe(true);
    expect(count(html, 'data-test-ad="guide-mid"')).toBe(1);
    expect(html.indexOf('data-test-ad="guide-mid"')).toBeLessThan(mainEnd);
  });
});

// OF4 A3 (2026-11-02): 빈 화면은 수동 유닛이 없어도 자동광고가 붙을 수 있었다. 404·오류 화면처럼
// data-page-state="error" 를 달아 루트 layout 의 NotFoundAdPause 가 광고 요청을 보류하게 한다
// (Google 게시자 정책: 콘텐츠 없는 화면 광고 금지). 리포트 화면에는 표시가 없어 대체되면 요청이 다시 열린다.
describe("/report 빈 화면 자동광고 보류 표시", () => {
  it("저장 리포트가 없는 빈 화면의 main 에 data-page-state=error 가 한 번 있다", () => {
    const html = renderPage(null);
    expect(html).toContain("저장된 리포트가 없습니다");
    expect(count(html, 'data-page-state="error"')).toBe(1);
    expect(html).toContain('<main data-page-state="error" class=');
  });

  it("저장 결과를 읽지 못한 안내 화면(같은 빈 화면 분기)에도 같은 표시가 있다", () => {
    const html = renderPage(JSON.stringify({ salary: { monthlyNet: 4000000 }, lastUpdated }));
    expect(html).toContain('role="alert"');
    expect(count(html, 'data-page-state="error"')).toBe(1);
    expect(html).toContain('<main data-page-state="error" class=');
  });

  it("리포트 화면에는 data-page-state 표시가 없다", () => {
    const html = renderPage(JSON.stringify(valid));
    expect(html).toContain("종합 금융 리포트");
    expect(html).not.toContain("data-page-state");
  });

  it("소스: 표시는 빈 화면 분기의 main 에만 있고 NotFoundAdPause 가 보류하는 값과 같다", () => {
    const { emptyStart, emptyMainEnd, dataMainStart, dataMainEnd } = sections();
    expect(count(source, 'data-page-state="error"')).toBe(1);
    const at = source.indexOf('data-page-state="error"');
    expect(at).toBeGreaterThan(emptyStart);
    expect(at).toBeLessThan(emptyMainEnd);
    expect(source.slice(dataMainStart, dataMainEnd)).not.toContain("data-page-state");
    const pause = readFileSync(join(process.cwd(), "src/components/NotFoundAdPause.tsx"), "utf8");
    expect(pause).toContain(`[data-page-state="error"]`);
  });
});
