// 다음 단계 링크 상자는 layout 하단 광고 아래 맨 끝에만 (B12 / P2UX-01, 운영자 승인 2026-11-01)
//
// 배경: 2026-10-19(d1d5ef80c)에 '급여 단위와 적용 연도 비교'(SalaryTableNextSteps)·'이어서 확인할 내용'(TopicNextSteps)
// 상자와 영문 링크 문단이 각 page.tsx 본문 끝에 들어갔다. 이 layout 들은 children 뒤에 하단 광고(PageFooterAds,
// calc 광고 블록, EnglishPageExtras)를 그리므로 상자 높이만큼 광고가 내려갔다(2026-08-16 '광고 위 UI 삽입 금지' 규칙).
// B12 는 상자를 layout 의 맨 끝(모든 광고·공유 뒤)으로 옮겼다. 광고 컴포넌트·슬롯은 그대로다.
// 이 테스트가 고정하는 것:
//  1) 렌더: 실제 layout 을 경로별로 서버 렌더하면(광고는 표지 div) 상자가 모든 광고·공유 표지 뒤, 맨 마지막에 1번 나온다.
//     맵에 없는 경로(다른 계산기·리포트·영문 허브·없는 도구)에는 상자가 생기지 않는다.
//  2) 영문: EnglishPageExtras 광고는 하이드레이션 뒤에만 그려진다 — SSR 에서도 링크는 본문 바로 뒤에 있고(프리렌더 HTML 포함),
//     광고가 그려지면 광고·공유 아래에 놓인다. /en/guides 맨 위 HomeTopAd 위의 소개 문단은 없다.
//  3) 소스: 8개 표·3개 계산기·/insights·영문 도구 page.tsx 에 상자가 다시 들어오지 않고, layout 에서는 마지막 형제다.
// G4(운영자 승인 2026-11-01 구글 개선 5번): 표 8종·삼성전자 성과급에서는 '만든 사람과 확인 방법' 상자(EditorialTrustNoteFromPath)가
//  이 상자 뒤 맨 끝에 온다 — 이 상자는 여전히 모든 광고·공유 뒤이고, 그 뒤에는 그 상자 하나만 올 수 있다
//  (그 상자의 배치는 editorialTrustNote.test.ts 가 따로 고정).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const location = vi.hoisted(() => ({ pathname: "/" }));
const share = vi.hoisted(() => ({ ready: true }));
vi.mock("next/navigation", () => ({
  usePathname: () => location.pathname,
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error("not-found");
  },
}));
vi.mock("@/components/AppLink", () => ({
  default: function TestLink({ children, ...props }: { children: ReactNode }) {
    return createElement("a", props, children);
  },
}));
vi.mock("@/components/AdPlacement", () => {
  const ad = (name: string) =>
    function InertAd() {
      return createElement("div", { "data-placement": name });
    };
  return {
    HomeTopAd: ad("home"),
    InArticleAd: ad("article"),
    GuideMidAd: ad("mid"),
    CalcResultAd: ad("result"),
    Display2Ad: ad("display2"),
    MultiplexAd: ad("multiplex"),
    SidebarAd: ad("sidebar"),
  };
});
vi.mock("@/components/CoupangBanner", () => ({ default: () => createElement("div", { "data-placement": "affiliate" }) }));
vi.mock("@/components/AutoShareSection", () => ({ default: () => createElement("div", { "data-placement": "share" }) }));
vi.mock("@/components/FloatingShareBar", () => ({ default: () => createElement("div", { "data-placement": "floating-share" }) }));
vi.mock("@/app/table/2026/TableTabsNav", () => ({ default: () => null }));
vi.mock("@/app/table/2027/TableTabsNav", () => ({ default: () => null }));
// EnglishPageExtras 는 공유 맥락(canonical 일치)이 잡힌 뒤에만 광고·공유를 그린다 — share.ready 로 그 전후를 모두 본다.
vi.mock("@/hooks/useSharePageContext", () => ({
  useSharePageContext: () => ({
    pathname: location.pathname,
    context: share.ready
      ? { pathname: location.pathname, canonical: `https://www.moneysalary.com${location.pathname}`, title: "Test page", notFound: false }
      : null,
  }),
}));

import Table2026Layout from "@/app/table/2026/layout";
import Table2027Layout from "@/app/table/2027/layout";
import CalcLayout from "@/app/calc/layout";
import InsightsLayout from "@/app/insights/layout";
import EnglishLayout from "@/app/en/layout";
import { salaryTableFromPath } from "@/components/SalaryTableNextStepsFromPath";
import { englishToolSlugFromPath } from "@/components/english/EnglishAfterAdsLinks";
import { getTopicNextSteps } from "@/lib/topicNextSteps";
import { ENGLISH_TOOLS } from "@/lib/englishTools";

const BODY = 'data-test="page-body"';
const AD_MARKERS = ['data-placement="home"', 'data-placement="article"', 'data-placement="affiliate"'];
const SHARE = 'data-placement="share"';
const TABLE_BOX = 'data-msy-module="salary-table-comparison"';
const TOPIC_BOX = 'data-msy-module="topic-next-steps"';
const TOOL_LINKS = 'aria-labelledby="tool-next-question"';
const PAGE_LINKS = 'aria-label="Related pages"';
// G4 '만든 사람과 확인 방법' 상자 — 표 8종·삼성전자 성과급에서 이 테스트의 상자 뒤 맨 끝
const TRUST_NOTE = 'data-msy-module="editorial-trust-note"';
/** 표지부터 다음 표지(없으면 문서 끝) 전까지 — 상자 하나의 링크만 보기 위함 */
const sliceBox = (html: string, marker: string, next: string) => {
  const end = html.indexOf(next);
  return html.slice(html.indexOf(marker), end > -1 ? end : undefined);
};

function renderAt(pathname: string, Layout: (props: { children: ReactNode }) => ReactNode) {
  location.pathname = pathname;
  return renderToStaticMarkup(createElement(Layout, null, createElement("main", { "data-test": "page-body" }, "page")));
}

/** 표지들이 이 순서로 각각 정확히 1번 나온다 */
function expectInOrder(html: string, markers: string[]) {
  const positions = markers.map((marker) => html.indexOf(marker));
  for (const [i, marker] of markers.entries()) {
    expect(positions[i], `${marker} 없음`).toBeGreaterThanOrEqual(0);
    expect(html.split(marker), `${marker} 가 1번이 아님`).toHaveLength(2);
  }
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
}

/** 표지가 붙은 요소부터 끝까지가 그 요소 하나(닫는 태그 뒤에 형제 없음) — 맨 끝 판정 */
function expectLastElement(html: string, marker: string, tag: string) {
  const start = html.lastIndexOf("<", html.indexOf(marker));
  expect(html.slice(start).startsWith(`<${tag}`)).toBe(true);
  expect(html.trimEnd().endsWith(`</${tag}>`)).toBe(true);
  // 같은 태그가 안에 중첩돼 있어도 표지 요소의 짝 닫는 태그가 문서 끝이어야 한다
  let depth = 0;
  const re = new RegExp(`<${tag}[\\s>]|</${tag}>`, "g");
  re.lastIndex = start;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    depth += m[0].startsWith("</") ? -1 : 1;
    if (depth === 0) {
      expect(html.slice(m.index + m[0].length).trim()).toBe("");
      return;
    }
  }
  throw new Error(`${marker}: 닫는 태그를 찾지 못함`);
}

const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

describe("표 8종: 급여 단위·연도 비교 상자는 표 layout 맨 끝", () => {
  const paths = [2026, 2027].flatMap((year) => ["annual", "monthly", "weekly", "hourly"].map((unit) => `/table/${year}/${unit}`));

  it.each(paths)("%s: GuideMid → 본문 → HomeTopAd·InArticleAd·쿠팡 → 공유 → 비교 상자 → (G4) 확인 방법 상자", (path) => {
    const html = renderAt(path, path.startsWith("/table/2026/") ? Table2026Layout : Table2027Layout);
    expectInOrder(html, ['data-placement="mid"', BODY, ...AD_MARKERS, SHARE, TABLE_BOX, TRUST_NOTE]);
    expectLastElement(html, TRUST_NOTE, "section");
    // 경로에서 고른 연도·단위가 상자 링크와 맞는다: 같은 연도 다른 3단위 + 다른 연도 같은 단위, 자기 자신은 없음
    const [, , yearText, unit] = path.split("/");
    const year = Number(yearText);
    const box = sliceBox(html, TABLE_BOX, TRUST_NOTE);
    const others = ["annual", "monthly", "weekly", "hourly"].filter((u) => u !== unit).map((u) => `/table/${year}/${u}`);
    expect(hrefs(box)).toEqual(expect.arrayContaining([...others, `/table/${year === 2026 ? 2027 : 2026}/${unit}`]));
    expect(hrefs(box)).not.toContain(path);
  });

  it("4개 표 밖의 경로는 상자를 그리지 않는다", () => {
    expect(salaryTableFromPath("/table/2026/annual/")).toEqual({ year: 2026, unit: "annual" });
    expect(salaryTableFromPath("/table/2027/hourly")).toEqual({ year: 2027, unit: "hourly" });
    for (const path of [null, "", "/table/2026", "/table/2028/annual", "/table/2026/annual/extra", "/table/2026/daily"]) {
      expect(salaryTableFromPath(path), String(path)).toBeNull();
    }
    expect(renderAt("/table/2026", Table2026Layout)).not.toContain(TABLE_BOX);
  });
});

describe("계산기 3종: 이어서 확인할 내용 상자는 calc/layout 광고 블록·보도 요약 뒤 맨 끝", () => {
  it.each(["/calc/2026-year", "/calc/bonus-home-plan", "/calc/samsung-bonus"])("%s", (path) => {
    const html = renderAt(path, CalcLayout);
    const news = path === "/calc/samsung-bonus" ? ['data-msy-module="calc-news-note"'] : [];
    // G4: 삼성전자 성과급만 '만든 사람과 확인 방법' 상자가 이 상자 뒤 맨 끝에 온다(나머지 두 계산기는 이 상자가 맨 끝)
    const trust = path === "/calc/samsung-bonus" ? [TRUST_NOTE] : [];
    expectInOrder(html, [BODY, 'data-placement="article"', 'data-placement="affiliate"', 'data-placement="home"', SHARE, ...news, TOPIC_BOX, ...trust]);
    expectLastElement(html, trust.length ? TRUST_NOTE : TOPIC_BOX, "section");
    if (!trust.length) expect(html).not.toContain(TRUST_NOTE);
    const expected = getTopicNextSteps(path).map((item) => item.href);
    expect(expected.length).toBeGreaterThan(0);
    expect(hrefs(sliceBox(html, TOPIC_BOX, TRUST_NOTE))).toEqual(expected);
  });

  it.each(["/calc", "/calc/sk-hynix-bonus", "/calc/bmi-quick", "/calc/samsung-bonus/extra"])("%s: 맵에 없는 경로는 상자 없음", (path) => {
    expect(renderAt(path, CalcLayout)).not.toContain(TOPIC_BOX);
  });
});

describe("/insights: 이어서 확인할 내용 상자는 insights layout 맨 끝", () => {
  it("/insights: 본문 → PageFooterAds 3개 → 공유 → 상자", () => {
    const html = renderAt("/insights", InsightsLayout);
    expectInOrder(html, [BODY, ...AD_MARKERS, SHARE, TOPIC_BOX]);
    expectLastElement(html, TOPIC_BOX, "section");
    expect(hrefs(html.slice(html.indexOf(TOPIC_BOX)))).toEqual(getTopicNextSteps("/insights").map((item) => item.href));
  });

  it.each(["/insights/bonus-payout-history-2026", "/insights/entry-salary-by-industry-2026", "/insights/listed-avg-salary-top100-2026"])(
    "%s: 리포트 페이지에는 상자 없음",
    (path) => {
      expect(renderAt(path, InsightsLayout)).not.toContain(TOPIC_BOX);
    },
  );
});

describe("영문: 도구·도움말·소개 링크는 en/layout 의 EnglishPageExtras 뒤 맨 끝", () => {
  const cases = [
    ...ENGLISH_TOOLS.map((tool) => [`/en/tools/${tool.slug}`, TOOL_LINKS] as const),
    ["/en/help", PAGE_LINKS] as const,
    ["/en/about", PAGE_LINKS] as const,
  ];

  it.each(cases)("%s: 광고가 그려진 뒤 — 본문 → HomeTopAd·InArticleAd·쿠팡 → 공유 → 링크", (path, marker) => {
    share.ready = true;
    const html = renderAt(path, EnglishLayout);
    expectInOrder(html, [BODY, ...AD_MARKERS, SHARE, marker]);
    expect(html).not.toMatch(/[가-힣]/);
    // en/layout 의 마지막 자식(래퍼 div) 뒤에는 en-locale 의 닫는 태그만 온다
    expect(html.slice(html.indexOf(marker))).toMatch(/<\/section><\/div><\/div>$/);
  });

  it.each(cases)("%s: SSR(광고 그리기 전)에도 링크는 프리렌더 HTML 의 본문 바로 뒤에 있다", (path, marker) => {
    share.ready = false;
    try {
      const html = renderAt(path, EnglishLayout);
      expect(html).not.toContain("data-placement=");
      expectInOrder(html, [BODY, marker]);
    } finally {
      share.ready = true;
    }
  });

  it("옮긴 링크 목적지가 그대로 있다 — 도구는 읽기 목록·도움말, 도움말은 6곳, 소개는 3곳", () => {
    const tool = renderAt("/en/tools/loan", EnglishLayout);
    expect(hrefs(tool.slice(tool.indexOf(TOOL_LINKS)))).toEqual(["/en/tools", "/en/tools/savings-goal", "/en/tools/work-time-cost", "/en/tools/compound-interest", "/en/help"]);
    const help = renderAt("/en/help", EnglishLayout);
    expect(hrefs(help.slice(help.indexOf(PAGE_LINKS)))).toEqual(["/en/season", "/en/calculators", "/en/guides", "/en/terms", "/en/privacy", "/en/about"]);
    const about = renderAt("/en/about", EnglishLayout);
    expect(hrefs(about.slice(about.indexOf(PAGE_LINKS)))).toEqual(["/en/calculators", "/en/guides", "/en/terms"]);
  });

  it.each(["/en", "/en/tools", "/en/guides", "/en/calculators", "/en/tools/unknown", "/en/tools/constructor", "/en/tools/loan/extra", "/en/flat-tax"])(
    "%s: 맵에 없는 경로는 링크 상자 없음",
    (path) => {
      const html = renderAt(path, EnglishLayout);
      expect(html).not.toContain(TOOL_LINKS);
      expect(html).not.toContain(PAGE_LINKS);
    },
  );

  it("도구 slug 판정은 읽기 목록에 있는 slug 만(프로토타입 속성 이름 포함 그 밖은 null)", () => {
    expect(englishToolSlugFromPath("/en/tools/loan")).toBe("loan");
    for (const path of ["/en/tools", "/en/tools/", "/en/tools/__proto__", "/en/tools/toString", "/en/tools/loan/x"]) {
      expect(englishToolSlugFromPath(path), path).toBeNull();
    }
  });
});

describe("소스: 페이지 본문에 상자를 다시 두지 않고, layout 에서는 마지막 형제", () => {
  const code = (file: string) =>
    readFileSync(resolve(process.cwd(), file), "utf8")
      .replace(/\r\n/g, "\n")
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

  it("표 8종·계산기 3종·/insights page.tsx 에 상자가 없다", () => {
    const tables = [2026, 2027].flatMap((year) => ["annual", "monthly", "weekly", "hourly"].map((unit) => `src/app/table/${year}/${unit}/page.tsx`));
    for (const file of tables) expect(code(file), file).not.toContain("SalaryTableNextSteps");
    for (const file of ["src/app/calc/2026-year/page.tsx", "src/app/calc/bonus-home-plan/page.tsx", "src/app/calc/samsung-bonus/page.tsx", "src/app/insights/page.tsx"]) {
      expect(code(file), file).not.toContain("TopicNextSteps");
    }
  });

  it.each([
    ["src/app/table/2026/layout.tsx", "<SalaryTableNextStepsFromPath />", ["<PageFooterAds", "<AutoShareSection"], "</>"],
    ["src/app/table/2027/layout.tsx", "<SalaryTableNextStepsFromPath />", ["<PageFooterAds", "<AutoShareSection"], "</>"],
    ["src/app/calc/layout.tsx", "<TopicNextSteps />", ["<HomeTopAd />", "<AutoShareSection", "<FloatingShareBar />", "<CalcNewsNote />"], "</>"],
    ["src/app/insights/layout.tsx", "<TopicNextSteps />", ["<PageFooterAds", "<ReportDataLinks", "<AutoShareSection"], "</>"],
    ["src/app/en/layout.tsx", "<EnglishAfterAdsLinks />", ["<EnglishPageExtras />"], "</div>"],
  ] as const)("%s: %s 는 광고·공유 뒤 마지막 형제", (file, box, before, close) => {
    const src = code(file);
    const at = src.indexOf(box);
    expect(at, `${file} 에 ${box} 없음`).toBeGreaterThan(-1);
    expect(src.split(box)).toHaveLength(2);
    for (const sibling of before) expect(src.indexOf(sibling), `${file}: ${sibling}`).toBeGreaterThan(-1);
    for (const sibling of before) expect(src.indexOf(sibling), `${file}: ${sibling} 가 ${box} 뒤`).toBeLessThan(at);
    // G4: 이 상자 뒤에는 '만든 사람과 확인 방법' 상자(EditorialTrustNoteFromPath) 하나만 올 수 있다
    const rest = src.slice(at + box.length).replace(/\s+/g, "").replace(/^<EditorialTrustNoteFromPath[^>]*\/>/, "");
    expect(rest.startsWith(close)).toBe(true);
  });

  it("영문 도구·도움말·소개·가이드 목록 본문에 옮긴 링크가 다시 들어오지 않는다", () => {
    const tool = code("src/app/en/tools/[slug]/page.tsx");
    for (const text of ["tool-next-question", "EnglishContentLinks", "ENGLISH_TOOL_READING", "Methods, sources and help"]) expect(tool).not.toContain(text);
    // 닫는 따옴표까지 비교한다 — /en/guides/four-major-insurance-complete 같은 기존 가이드 링크는 남는다
    const help = code("src/app/en/help/page.tsx");
    for (const href of ["/en/season", "/en/calculators", "/en/guides", "/en/about"]) expect(help, href).not.toContain(`href="${href}"`);
    const about = code("src/app/en/about/page.tsx");
    for (const href of ["/en/calculators", "/en/guides"]) expect(about, href).not.toContain(`href="${href}"`);
    expect(about).not.toContain("explain the service limits and permitted use of its content");
    // /en/guides: 맨 위 HomeTopAd 위에 있던 소개 페이지 안내 문단
    const guides = code("src/app/en/guides/EnglishGuidesClient.tsx");
    expect(guides).not.toContain("/en/about");
    expect(guides).not.toContain("how we check sources and review corrections");
  });
});
