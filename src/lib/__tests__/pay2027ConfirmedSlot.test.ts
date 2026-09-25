// 2027 봉급표 '12월 숫자만 교체' 가드 (수익 추천 #2 '2027 빈칸'·#3 확정표, 2026-09-25 준비)
//
// 11/1~1/31 동결기에는 새 구조(섹션·컴포넌트)를 만들 수 없다. 그래서 확정표 자리를 10월에 미리 두고,
// 12월에는 payTablesFull2027.ts 의 PAY_FULL_2027 에 원문 숫자만 넣는다. 이 파일은 가짜 확정 데이터
// (payFull2027.fixture.ts — 실제 공표값 아님)를 넣었을 때 페이지가 어떻게 바뀌는지 미리 고정한다:
//  (1) 광고 컴포넌트 순서는 확정 전과 같다 (교사·경찰·소방·일반직 2027, 2026 풀표 4쪽)
//  (2) 2027 전 호봉 전체표는 모든 광고(사이드바 포함)·공유 버튼 뒤, 페이지 맨 끝에만 나온다
//  (3) 광고 위·광고 사이 구간의 글자 수가 확정 전보다 늘지 않는다 (광고 위 높이 증가 금지)
//  (4) title·description·배지·리드·FAQ·공유 문구가 확정 문구로 바뀌고 '예상·확정 전·심의 중' 같은 옛 문구가 남지 않는다
//  (5) Dataset JSON-LD 가 원문 출처(citation)·확인일과 함께 나온다
import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Metadata } from "next";
import {
  FIXTURE_BASIS,
  FIXTURE_CHECKED,
  FIXTURE_SOURCE,
  buildPayFull2027Fixture,
} from "./payFull2027.fixture";
import { PAY_TABLES_RELEASE_DATE } from "@/config/siteDates";

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => {
  const ad = (name: string) => {
    const MockAd = () => createElement("div", { "data-test-ad": name });
    MockAd.displayName = `MockAd(${name})`;
    return MockAd;
  };
  return {
    HomeTopAd: ad("home-top"),
    CalcResultAd: ad("calc-result"),
    InArticleAd: ad("in-article"),
    GuideMidAd: ad("guide-mid"),
    MultiplexAd: ad("multiplex"),
    SidebarAd: ad("sidebar"),
  };
});
vi.mock("@/components/CoupangBanner", () => ({ default: () => createElement("div", { "data-test-ad": "coupang" }) }));
vi.mock("@/components/ShareButtons", () => ({
  // 공유 문구는 화면 글자가 아니므로 속성으로만 싣는다(구간 글자 수 계산에서 빠지게)
  default: (props: { title: string; description: string }) =>
    createElement("div", { "data-test-share": "1", "data-share-text": `${props.title} ${props.description}` }),
}));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/PrivateFeedback", () => ({ default: () => null }));
vi.mock("@/components/CitationCopyButton", () => ({ default: () => null }));
vi.mock("@/app/civil-servant-pay-2027/CivilPayForecastSelector", () => ({ default: () => null }));

type PageModule = { default: () => unknown; metadata: Metadata };
type Mode = "forecast" | "confirmed";

async function loadPages(mode: Mode) {
  vi.resetModules();
  vi.doMock("@/lib/payTablesFull2027", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/payTablesFull2027")>();
    if (mode === "forecast") {
      return { ...actual, PAY_FULL_2027: null, PAY_2027_CONFIRMED: false, PAY_2027_PAGES_MODIFIED: PAY_TABLES_RELEASE_DATE };
    }
    const data = buildPayFull2027Fixture();
    return { ...actual, PAY_FULL_2027: data, PAY_2027_CONFIRMED: true, PAY_2027_PAGES_MODIFIED: data.checked };
  });
  const [teacher27, police27, fire27, civil27, teacher26, police26, fire26, civil26] = (await Promise.all([
    import("@/app/teacher-pay-2027/page"),
    import("@/app/police-pay-2027/page"),
    import("@/app/firefighter-pay-2027/page"),
    import("@/app/civil-servant-pay-2027/page"),
    import("@/app/teacher-pay-2026/page"),
    import("@/app/police-pay-2026/page"),
    import("@/app/firefighter-pay-2026/page"),
    import("@/app/civil-servant-pay-2026/page"),
  ])) as unknown as PageModule[];
  return { teacher27, police27, fire27, civil27, teacher26, police26, fire26, civil26 };
}

type Loaded = Awaited<ReturnType<typeof loadPages>>;
let FORECAST: Loaded;
let CONFIRMED: Loaded;

beforeAll(async () => {
  FORECAST = await loadPages("forecast");
  CONFIRMED = await loadPages("confirmed");
}, 60_000);

const text = (html: string) =>
  html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
const len = (s: string) => [...s].length;
const won = (n: number) => n.toLocaleString("ko-KR");

function render(mod: PageModule) {
  const html = renderToStaticMarkup(createElement(mod.default as never));
  const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  const ads = [...body.matchAll(/data-test-ad="([^"]+)"/g)].map((m) => ({ name: m[1], index: m.index ?? 0 }));
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => {
    const parsed = JSON.parse(m[1]) as unknown;
    return (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
  });
  return { html, body, ads, jsonLd };
}

/** 광고 기준 구간별 본문 글자 수 — [첫 광고 위, 광고1~2 사이, …]. PublishedMeta '최종 갱신' 표기는 뺀다 */
function segmentLengths(mod: PageModule) {
  const { body, ads } = render(mod);
  const cuts = [0, ...ads.map((a) => a.index)];
  return cuts.map((from, i) => {
    const to = i + 1 < cuts.length ? cuts[i + 1] : body.length;
    return len(text(body.slice(from, to)).replace(/ · 최종 갱신 \d{4}\.\d{2}\.\d{2}/, ""));
  });
}

const fixture = buildPayFull2027Fixture();
const numericCells = (rows: ReadonlyArray<ReadonlyArray<number | null>>) =>
  rows.flatMap((r) => r.slice(1)).filter((v) => typeof v === "number").length;

const PAGES_2027 = [
  {
    name: "/teacher-pay-2027",
    key: "teacher27" as const,
    query: "2027 교사 봉급표",
    fullId: "teacher-full-table",
    cells: fixture.teacher.length,
    entryLabel: "9호봉",
    entry2027: fixture.teacher.find(([h]) => h === 9)![1],
  },
  {
    name: "/police-pay-2027",
    key: "police27" as const,
    query: "2027 경찰 봉급표",
    fullId: "police-full-table",
    cells: numericCells(fixture.policeFire),
    entryLabel: "순경 1호봉",
    entry2027: fixture.policeFire[0][1] as number,
  },
  {
    name: "/firefighter-pay-2027",
    key: "fire27" as const,
    query: "2027 소방공무원 봉급표",
    fullId: "fire-full-table",
    cells: numericCells(fixture.policeFire),
    entryLabel: "소방사 1호봉",
    entry2027: fixture.policeFire[0][1] as number,
  },
];

const ALL_PAGES = [
  { name: "/teacher-pay-2027", key: "teacher27" as const },
  { name: "/police-pay-2027", key: "police27" as const },
  { name: "/firefighter-pay-2027", key: "fire27" as const },
  { name: "/civil-servant-pay-2027", key: "civil27" as const },
  { name: "/teacher-pay-2026", key: "teacher26" as const },
  { name: "/police-pay-2026", key: "police26" as const },
  { name: "/firefighter-pay-2026", key: "fire26" as const },
  { name: "/civil-servant-pay-2026", key: "civil26" as const },
];

describe("광고 배치 — 확정 전과 같다", () => {
  it.each(ALL_PAGES)("$name: 광고 컴포넌트 순서 불변", ({ key }) => {
    const before = render(FORECAST[key]).ads.map((a) => a.name);
    const after = render(CONFIRMED[key]).ads.map((a) => a.name);
    expect(after).toEqual(before);
    expect(after.length).toBeGreaterThanOrEqual(6);
  });

  it.each([...PAGES_2027, { name: "/civil-servant-pay-2027", key: "civil27" as const }])(
    "$name: 광고 위·광고 사이 구간 글자 수가 확정 전보다 늘지 않는다",
    ({ key }) => {
      const before = segmentLengths(FORECAST[key]);
      const after = segmentLengths(CONFIRMED[key]);
      expect(after.length).toBe(before.length);
      // 마지막 구간(마지막 광고 뒤 = 전체표 자리)만 늘 수 있다
      after.slice(0, -1).forEach((n, i) => expect(n, `구간 ${i}`).toBeLessThanOrEqual(before[i]));
    }
  );
});

describe("2027 전 호봉 확정표 — 페이지 맨 끝", () => {
  it.each([
    ...PAGES_2027,
    { name: "/civil-servant-pay-2027", key: "civil27" as const, fullId: "general-full-table", cells: numericCells(fixture.general) },
  ])("$name: 모든 광고·공유 버튼 뒤, 금액 칸 수 = 확정 데이터", ({ key, fullId, cells }) => {
    const { body, ads } = render(CONFIRMED[key]);
    const at = body.indexOf(`id="${fullId}"`);
    expect(at, "전체표 섹션").toBeGreaterThan(0);
    expect(at).toBeGreaterThan(Math.max(...ads.map((a) => a.index)));
    expect(at).toBeGreaterThan(body.lastIndexOf('data-test-share="1"'));
    const section = body.slice(at);
    expect(section).not.toContain("data-test-ad=");
    const tds = [...section.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    expect(tds.filter((t) => /^\d{1,3}(,\d{3})+$/.test(t)).length).toBe(cells);
    expect(section).toContain(`href="${FIXTURE_SOURCE}"`);
    expect(section).toContain('class="overflow-x-auto"');
    // 확정 전에는 같은 자리에 아무것도 없다
    expect(render(FORECAST[key]).body).not.toContain(`id="${fullId}"`);
  });

  it.each([
    ...PAGES_2027,
    { name: "/civil-servant-pay-2027", key: "civil27" as const },
  ])("$name: Dataset JSON-LD — 확정 뒤에만, 원문 출처·확인일", ({ key }) => {
    expect(render(FORECAST[key]).jsonLd.some((d) => d["@type"] === "Dataset")).toBe(false);
    const dataset = render(CONFIRMED[key]).jsonLd.find((d) => d["@type"] === "Dataset");
    expect(dataset).toBeDefined();
    expect((dataset!.citation as { url: string }).url).toBe(FIXTURE_SOURCE);
    expect(String(dataset!.dateModified)).toContain(FIXTURE_CHECKED);
    expect(dataset!.temporalCoverage).toBe("2027");
    expect(String(dataset!.description).length).toBeGreaterThanOrEqual(50);
  });
});

describe("확정 문구 전환 — 교사·경찰·소방 2027", () => {
  it.each(PAGES_2027)("$name: title·description 확정 문구, 검색어 시작, 길이", ({ key, query, entry2027 }) => {
    const meta = CONFIRMED[key].metadata;
    const title = (meta.title as { absolute: string }).absolute;
    const bare = title.replace(/ \| 머니샐러리$/, "");
    expect(title.startsWith(query), title).toBe(true);
    expect(len(bare), bare).toBeLessThanOrEqual(40);
    expect(bare).toContain("확정");
    expect(bare).not.toMatch(/예상|예산안/);
    const description = String(meta.description);
    expect(len(description), description).toBeGreaterThanOrEqual(80);
    expect(len(description), description).toBeLessThanOrEqual(120);
    expect(description).toContain("확정됐습니다");
    expect(description).toContain(`${won(entry2027)}원`);
    expect(description).not.toMatch(/예상|확정 전|심의 중/);
    expect(meta.openGraph?.title).toBe(title);
    expect(meta.twitter?.description).toBe(description);
    const article = render(CONFIRMED[key]).jsonLd.find((d) => d["@type"] === "Article");
    expect(article?.headline).toBe(bare);
    expect(String(article?.dateModified)).toContain(FIXTURE_CHECKED);
    expect(String(article?.datePublished)).toContain(PAY_TABLES_RELEASE_DATE);
  });

  it.each(PAGES_2027)("$name: 첫 광고 위 — 확정 리드·원문 출처, 옛 예상 문구 없음", ({ key, entryLabel, entry2027 }) => {
    const { body, ads } = render(CONFIRMED[key]);
    const aboveHtml = body.slice(0, ads[0].index);
    const above = text(aboveHtml);
    expect(above).toContain("확정됐습니다");
    expect(above).toContain(entryLabel);
    expect(above).toContain(`${won(entry2027)}원`);
    expect(above).toContain(FIXTURE_BASIS);
    expect(aboveHtml).toContain(`href="${FIXTURE_SOURCE}"`);
    expect(aboveHtml).not.toContain("yna.co.kr");
    expect(above).not.toMatch(/예상|확정 전|심의 중|예산안 기준/);
  });

  it.each(PAGES_2027)("$name: 본문 전체·FAQ·공유 문구에 옛 예상 문구가 남지 않는다", ({ key }) => {
    const { html, jsonLd } = render(CONFIRMED[key]);
    const all = text(html);
    expect(all).not.toMatch(/예상|확정 전|국회 심의 중|진행 중|아직|단순 적용|단순 계산/);
    const faq = jsonLd.find((d) => d["@type"] === "FAQPage");
    const answers = (faq?.mainEntity as { acceptedAnswer: { text: string } }[]).map((q) => q.acceptedAnswer.text);
    expect(answers[0]).toContain("확정됐습니다");
    expect(answers[0]).toContain(FIXTURE_BASIS);
    for (const a of answers) expect(a).not.toMatch(/예상|확정 전|단순/);
    const share = html.match(/data-share-text="([^"]*)"/)?.[1] ?? "";
    expect(share).toContain("확정");
    expect(share).not.toMatch(/예상|확정 전|단순/);
  });

  it.each(PAGES_2027)("$name: 비교표 = 2026 확정 → 2027 확정(가짜 데이터 값), 7행", ({ key, entry2027 }) => {
    const { body } = render(CONFIRMED[key]);
    const table = body.slice(body.indexOf("<table"), body.indexOf("</table>"));
    expect(table).toContain("2027 확정");
    expect(table).not.toContain("2027 예상");
    expect(table.match(/<tr\b/g)?.length).toBe(1 + 7);
    expect(table).toContain(won(entry2027));
  });
});

describe("2026 풀표 4쪽 — 2027 링크 문구", () => {
  it.each([
    { name: "/teacher-pay-2026", key: "teacher26" as const, id: "teacher-full-table", label: "2027 교사 봉급표" },
    { name: "/police-pay-2026", key: "police26" as const, id: "police-full-table", label: "2027 경찰 봉급표" },
    { name: "/firefighter-pay-2026", key: "fire26" as const, id: "fire-full-table", label: "2027 소방공무원 봉급표" },
    { name: "/civil-servant-pay-2026", key: "civil26" as const, id: "general-full-table", label: "2027 공무원 봉급표" },
  ])("$name: 확정 뒤 '내년 예상액'·'… 예상' 링크 문구가 확정 표현으로", ({ key, id, label }) => {
    const before = text(render(FORECAST[key]).body.split(`id="${id}"`)[1]);
    const after = text(render(CONFIRMED[key]).body.split(`id="${id}"`)[1]);
    expect(before).toContain(`내년 예상액은 ${label} 예상`);
    expect(after).toContain(`2027년 확정액은 ${label}`);
    expect(after).not.toContain("예상");
  });
});
