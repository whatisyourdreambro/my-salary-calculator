// src/lib/seasonAnnounce.ts 단위 테스트 (R6-04 시즌 URL 등록부·알림, 2026-09-27)
//
// 고정하는 것
//  (1) docs/season-urls-2026-27.json 구조(행 필드·클러스터·상태·피드·손잡이 종류)
//  (2) 이벤트 표: E0~E12 모두 있고 C-01~C-12·W4-A 슬롯이 빠짐없이 한 번만 설명됨(id 만)
//  (3) announceList 상한(네이버 10개·구글 3개)과 클러스터 우선순위 순서, 대기 행 제외
//  (4) feedMetaSync 는 rss-tables 멤버만
//  (5) diffSitemaps 가 바뀐 loc 만 정확히 돌려주고, scripts/indexnow-diff.mjs 와 같은 결과(= [indexnow] 목록)
//  (6) validateRegistry 가 사이트맵에 없는 live URL 과 없는 ROUTE_OVERRIDES 키를 잡음
//  (7) 어떤 페이지·컴포넌트도 이 모듈을 import 하지 않음(빌드 산출물 무변화)

import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  CALENDAR_IDS,
  EVENT_IDS,
  FEEDS,
  GSC_INSPECT_CAP,
  LASTMOD_KINDS,
  NAVER_REQUEST_CAP,
  RSS_TABLES_MAX_ITEMS,
  SITE_ORIGIN,
  STATUSES,
  W4A_SLOTS,
  announceList,
  diffSitemaps,
  lastmodAction,
  parseRegistry,
  readSitemapXml,
  registryWarnings,
  requestPlan,
  schemaErrors,
  toEventId,
  validateRegistry,
  type SeasonRegistry,
  type SeasonRow,
} from "@/lib/seasonAnnounce";
import * as indexnowDiff from "../../../scripts/indexnow-diff.mjs";

// indexnow-diff.mjs 는 JS 라 매개변수 타입이 기본값 {} 에서 추론된다 — 쓰는 모양만 명시한다.
type IndexNowRead = { ok: boolean; reason?: string };
type IndexNowPlan = {
  submit: boolean;
  urls: string[];
  counts: { added: number; changed: number; removed: number } | null;
};
const readSitemap = indexnowDiff.readSitemap as unknown as (res: { status?: number; body: string }) => IndexNowRead;
const planSubmission = indexnowDiff.planSubmission as unknown as (build: IndexNowRead, prod: IndexNowRead) => IndexNowPlan;

const ROOT = process.cwd();
const read = (p: string) => readFileSync(resolve(ROOT, p), "utf8");
const RAW: unknown = JSON.parse(read("docs/season-urls-2026-27.json"));
const REG: SeasonRegistry = parseRegistry(RAW);
const clone = (): SeasonRegistry => JSON.parse(JSON.stringify(REG)) as SeasonRegistry;

const liveUrls = (r: SeasonRegistry) => r.rows.filter((x) => x.status === "live").map((x) => x.url);
const overrideRefs = (r: SeasonRegistry) =>
  r.rows.filter((x) => x.lastmodHandle.kind === "route-override").map((x) => x.lastmodHandle.ref);

// ── (1) 구조 ─────────────────────────────────────────────────────────────────────

describe("등록부 구조", () => {
  it("실제 등록부는 구조 오류 0건", () => {
    expect(schemaErrors(RAW)).toEqual([]);
  });

  it("약 70행 — 시드 묶음이 모두 들어 있다", () => {
    expect(REG.rows.length).toBeGreaterThanOrEqual(60);
    expect(REG.rows.length).toBeLessThanOrEqual(90);
    const urls = new Set(REG.rows.map((r) => r.url));
    const seeds = [
      // 연말정산
      "/year-end-tax", "/year-end-tax-preview", "/year-end-tax-checklist", "/year-end-tax-mid-resign", "/year-end-tax-2027",
      "/credit-card-deduction-2026", "/medical-tax-credit-2026", "/rent-tax-credit-2026", "/donation-tax-credit-2026",
      "/calc/january-bonus", "/calc/dual-income-year-end", "/calc/dependent-check", "/calc/child-deduction",
      "/calc/smb-income-tax-break", "/tools/finance/irp",
      // 봉급표
      "/civil-servant-pay-2026", "/civil-servant-pay-2027", "/teacher-pay-2026", "/teacher-pay-2027",
      "/police-pay-2026", "/police-pay-2027", "/firefighter-pay-2026", "/firefighter-pay-2027",
      "/military-pay-2026", "/job/soldier",
      // 성과급 허브·리포트
      "/calc/bonus-calculators", "/insights/bonus-payout-history-2026",
      // 연도 전환
      "/social-insurance-rates-2026", "/social-insurance-rates-2027", "/minimum-wage-2026", "/minimum-wage-2027",
      "/calc/pension-hike-2027", "/unemployment-benefit", "/weekly-holiday-allowance-2026", "/auto-tax-2026",
      "/earned-income-credit", "/basic-pension-2026",
      ...["2026", "2027"].flatMap((y) => ["annual", "monthly", "weekly", "hourly"].map((k) => `/table/${y}/${k}`)),
      // 명절·대출
      "/calc/holiday-bonus", "/home-loan", "/chuseok-bonus-2026",
    ];
    expect(seeds.filter((u) => !urls.has(u))).toEqual([]);
  });

  it("성과급 계산기 23종 + 허브 + 리포트", () => {
    const companyBonus = REG.rows.filter(
      (r) => r.cluster === "bonus" && /^\/calc\/.+-bonus$/.test(r.url),
    );
    expect(companyBonus).toHaveLength(23);
  });

  it("R4 가이드 7편은 pending-R4B3 · guide-modified · rss", () => {
    const guides = REG.rows.filter((r) => r.url.startsWith("/guides/"));
    expect(guides.map((g) => g.url.slice("/guides/".length)).sort()).toEqual(
      [
        "basic-pension-reform-2027",
        "changes-2027-worker-checklist",
        "civil-servant-net-pay-2026",
        "civil-servant-performance-bonus-2026",
        "lotto-prize-tax",
        "marriage-birth-cash-support-2027",
        "seollal-bonus-tax-2027",
      ].sort(),
    );
    for (const g of guides) {
      expect(g.status).toBe("pending-R4B3");
      expect(g.lastmodHandle).toEqual({ kind: "guide-modified", ref: g.url.slice("/guides/".length) });
      expect(g.feeds).toEqual(["rss"]);
    }
  });

  it("행 필드는 정해진 값만", () => {
    for (const r of REG.rows) {
      expect(Object.keys(r).sort()).toEqual(["cluster", "events", "feeds", "lastmodHandle", "peak", "status", "url"]);
      expect(STATUSES).toContain(r.status);
      expect(LASTMOD_KINDS).toContain(r.lastmodHandle.kind);
      r.feeds.forEach((f) => expect(FEEDS).toContain(f));
      r.events.forEach((e) => expect(EVENT_IDS).toContain(e));
      expect(REG.clusters[r.cluster]).toBeDefined();
    }
  });

  it("깨진 행을 구조 오류로 잡는다", () => {
    const bad = JSON.parse(JSON.stringify(RAW)) as { rows: Record<string, unknown>[] };
    bad.rows.push(
      { ...bad.rows[0] }, // url 중복
      { url: "/x", cluster: "nope", events: ["E13"], peak: "2027-13", lastmodHandle: { kind: "today", ref: "" }, feeds: ["atom"], status: "soon" },
      { url: "y/", cluster: "pay", events: ["E1", "E1"], peak: "2027-01", lastmodHandle: { kind: "route-override", ref: "/y" }, feeds: [], status: "live" },
    );
    const errs = schemaErrors(bad).join("\n");
    expect(errs).toContain("url 중복");
    expect(errs).toContain("/x: cluster");
    expect(errs).toContain("/x: events");
    expect(errs).toContain("/x: peak");
    expect(errs).toContain("/x: lastmodHandle");
    expect(errs).toContain("/x: feeds");
    expect(errs).toContain("/x: status");
    expect(errs).toContain("y/: url");
    expect(errs).toContain("events 중복");
    expect(() => parseRegistry(bad)).toThrow(/구조 오류/);
  });
});

// ── (2) 이벤트 표 ────────────────────────────────────────────────────────────────

describe("이벤트 표 (E0~E12 → C-xx · W4-A 슬롯, id 만)", () => {
  it("E0~E12 이 모두 있고 필드는 이름·예상 시점·id 목록뿐", () => {
    expect(Object.keys(REG.events).sort()).toEqual([...EVENT_IDS].sort());
    for (const id of EVENT_IDS) {
      const e = REG.events[id];
      expect(Object.keys(e).sort()).toEqual(["calendar", "expected", "name", "w4a"]);
      // 런북 본문을 옮겨 오지 않는다 — 짧은 이름만
      expect(e.name.length).toBeLessThanOrEqual(40);
      expect(e.expected.length).toBeLessThanOrEqual(40);
      e.calendar.forEach((c) => expect(CALENDAR_IDS).toContain(c));
      e.w4a.forEach((s) => expect(W4A_SLOTS).toContain(s));
    }
  });

  it("C-01~C-12 은 이벤트 하나 이상 또는 사유 한 줄 — 둘 다는 아님", () => {
    const mapped = new Set(EVENT_IDS.flatMap((id) => REG.events[id].calendar));
    for (const c of CALENDAR_IDS) {
      const why = REG.calendarNotMapped[c];
      expect(mapped.has(c) !== Boolean(why), c).toBe(true);
    }
  });

  it("W4-A 슬롯도 모두 이벤트에 걸리거나 사유가 있다", () => {
    const mapped = new Set(EVENT_IDS.flatMap((id) => REG.events[id].w4a));
    for (const s of W4A_SLOTS) {
      const why = REG.w4aNotMapped[s];
      expect(mapped.has(s) !== Boolean(why), s).toBe(true);
    }
  });

  it("R6 계획 §R6-04 의 대응 관계", () => {
    expect(REG.events.E1.calendar).toEqual(["C-01"]);
    expect(REG.events.E1.w4a).toContain("P-1");
    expect(REG.events.E3.calendar).toContain("C-02");
    expect(REG.events.E7.calendar).toEqual(["C-04"]);
    expect(REG.events.E7.w4a).toEqual(["공무원 확정 12월 말"]);
    expect(REG.events.E8.calendar).toEqual(expect.arrayContaining(["C-05", "C-06"]));
    expect(REG.events.E8.w4a).toEqual(expect.arrayContaining(["P-5", "P-6", "최저임금 1/1", "1/2 JAN 수동"]));
    expect(REG.events.E0.w4a).toEqual(["F-E"]);
    expect(REG.events.E4.w4a).toEqual(["TAI 12월"]);
    expect(REG.events.E10.w4a).toEqual(["OPI 1월 말"]);
    expect(REG.events.E12.calendar).toEqual(expect.arrayContaining(["C-09", "C-10"]));
  });

  it("이벤트마다 걸린 행이 이벤트 성격과 맞다", () => {
    const urlsOf = (id: (typeof EVENT_IDS)[number]) => REG.rows.filter((r) => r.events.includes(id)).map((r) => r.url);
    expect(urlsOf("E1")).toEqual(expect.arrayContaining(["/social-insurance-rates-2027", "/table/2027/annual"]));
    expect(urlsOf("E5")).toEqual(["/home-loan"]);
    expect(urlsOf("E7")).toEqual(expect.arrayContaining(["/civil-servant-pay-2027", "/teacher-pay-2027", "/military-pay-2026"]));
    expect(urlsOf("E8")).toEqual(expect.arrayContaining(["/minimum-wage-2027", "/unemployment-benefit", "/weekly-holiday-allowance-2026"]));
    expect(urlsOf("E10")).toEqual(expect.arrayContaining(["/calc/samsung-bonus", "/calc/bonus-calculators"]));
    expect(urlsOf("E2")).toEqual([]); // 전 페이지 공통 링크 교체 — lastmod 를 올리지 않는 이벤트
  });

  it("toEventId", () => {
    expect(toEventId("e3")).toBe("E3");
    expect(toEventId(" E12 ")).toBe("E12");
    expect(toEventId("E13")).toBeNull();
    expect(toEventId(undefined)).toBeNull();
  });
});

// ── (3)(4) announceList ──────────────────────────────────────────────────────────

/** 15행짜리 합성 등록부 — 상한·정렬을 실제 데이터와 무관하게 검증 */
function synthetic(): SeasonRegistry {
  const r = clone();
  const row = (url: string, cluster: string, extra: Partial<SeasonRow> = {}): SeasonRow => ({
    url,
    cluster,
    events: ["E5"],
    peak: "2027-01",
    lastmodHandle: { kind: "add-on-event", ref: url },
    feeds: [],
    status: "live",
    ...extra,
  });
  r.rows = [
    ...Array.from({ length: 6 }, (_, i) => row(`/loan-${i}`, "loan")),
    ...Array.from({ length: 6 }, (_, i) => row(`/pay-${i}`, "pay", { feeds: i % 2 ? ["rss-tables"] : [] })),
    row("/bonus-0", "bonus", { feeds: ["rss-tables"] }),
    row("/pending-0", "pay", { status: "pending-1014", feeds: ["rss-tables"] }),
    row("/other-event", "pay", { events: ["E6"] }),
  ];
  return r;
}

describe("announceList", () => {
  it("네이버 10개·구글 3개 상한, 나머지는 overflow", () => {
    const a = announceList(synthetic(), "E5");
    expect(a.candidates).toHaveLength(13);
    expect(a.naverRequest).toHaveLength(NAVER_REQUEST_CAP);
    expect(a.gscInspect).toHaveLength(GSC_INSPECT_CAP);
    expect(a.overflow).toEqual(a.candidates.slice(NAVER_REQUEST_CAP));
    expect([...a.naverRequest, ...a.overflow]).toEqual(a.candidates);
  });

  it("클러스터 우선순위(pay → bonus → … → loan), 같은 클러스터는 등록부 순서", () => {
    const a = announceList(synthetic(), "E5");
    expect(a.candidates.slice(0, 7)).toEqual(["/pay-0", "/pay-1", "/pay-2", "/pay-3", "/pay-4", "/pay-5", "/bonus-0"]);
    expect(a.candidates.slice(7)).toEqual(["/loan-0", "/loan-1", "/loan-2", "/loan-3", "/loan-4", "/loan-5"]);
    expect(a.gscInspect).toEqual(["/pay-0", "/pay-1", "/pay-2"]);
  });

  it("대기 행은 후보에서 빼고 skippedPending 에 둔다, 다른 이벤트 행은 없다", () => {
    const a = announceList(synthetic(), "E5");
    expect(a.candidates).not.toContain("/pending-0");
    expect(a.candidates).not.toContain("/other-event");
    expect(a.skippedPending).toEqual([{ url: "/pending-0", status: "pending-1014" }]);
  });

  it("feedMetaSync 는 rss-tables 멤버만 (합성)", () => {
    const a = announceList(synthetic(), "E5");
    expect(a.feedMetaSync).toEqual(["/pay-1", "/pay-3", "/pay-5", "/bonus-0"]);
  });

  it("실제 등록부: 모든 이벤트에서 상한을 지키고 feedMetaSync ⊆ rss-tables 멤버", () => {
    for (const id of EVENT_IDS) {
      const a = announceList(REG, id);
      expect(a.naverRequest.length).toBeLessThanOrEqual(NAVER_REQUEST_CAP);
      expect(a.gscInspect.length).toBeLessThanOrEqual(GSC_INSPECT_CAP);
      const byUrl = new Map(REG.rows.map((r) => [r.url, r]));
      for (const u of a.feedMetaSync) expect(byUrl.get(u)?.feeds, `${id} ${u}`).toContain("rss-tables");
      const expected = a.candidates.filter((u) => byUrl.get(u)?.feeds.includes("rss-tables"));
      expect(a.feedMetaSync).toEqual(expected);
      expect(a.lastmodTodo.map((t) => t.url)).toEqual(a.candidates);
    }
  });

  it("실제 등록부 E3: 봉급표가 먼저, 대기 중인 2027 교원·경찰·소방은 건너뜀", () => {
    const a = announceList(REG, "E3");
    expect(a.candidates.length).toBeGreaterThan(NAVER_REQUEST_CAP);
    expect(a.naverRequest[0]).toBe("/civil-servant-pay-2027");
    expect(a.skippedPending.map((p) => p.url)).toEqual(
      expect.arrayContaining(["/teacher-pay-2027", "/police-pay-2027", "/firefighter-pay-2027"]),
    );
  });

  it("lastmod 할 일 문구 — 성과급 엔진 공유 날짜는 올리지 말라고 알린다", () => {
    expect(lastmodAction({ kind: "route-override", ref: "/home-loan" })).toContain("ROUTE_OVERRIDES['/home-loan']");
    expect(lastmodAction({ kind: "add-on-event", ref: "/auto-tax-2026" })).toContain("한 줄 추가");
    expect(lastmodAction({ kind: "guide-modified", ref: "lotto-prize-tax" })).toContain("gen-guides-meta");
    expect(lastmodAction({ kind: "bonus-engine", ref: "BONUS_ENGINE_REVIEW_DATE" })).toContain("한 URL 만 올릴 수 없음");
    const a = announceList(REG, "E10");
    expect(a.lastmodTodo.find((t) => t.url === "/calc/samsung-bonus")?.kind).toBe("bonus-engine");
  });
});

// ── (5) diffSitemaps ─────────────────────────────────────────────────────────────

const urlXml = (loc: string, lastmod?: string) =>
  `<url>\n<loc>${loc}</loc>\n${lastmod ? `<lastmod>${lastmod}</lastmod>\n` : ""}<changefreq>weekly</changefreq>\n</url>`;
const sitemapXml = (...urls: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
const O = SITE_ORIGIN;

/** 배포 전 — 운영 사이트맵 */
const PREV_XML = sitemapXml(
  urlXml(`${O}/`, "2026-09-19T00:00:00.000Z"),
  urlXml(`${O}/civil-servant-pay-2027`, "2026-09-25T00:00:00.000Z"), // → 12/2 로 올림
  urlXml(`${O}/year-end-tax`, "2026-09-25"), // 형식만 다름 → 변경 아님
  urlXml(`${O}/table/2027/annual`, "2026-09-25T00:00:00.000Z"),
  urlXml(`${O}/old-page`, "2026-08-01T00:00:00.000Z"), // 삭제
  urlXml(`${O}/search?q=a&amp;page=2`, "2026-08-01T00:00:00.000Z"), // 엔티티 → 같은 URL
  urlXml(`${O}/no-lastmod`), // lastmod 없음 → 생김
  urlXml("https://example.com/foreign", "2026-01-01T00:00:00.000Z"), // 다른 호스트 무시
);
/** 배포 후 — 빌드 사이트맵 */
const NEXT_XML = sitemapXml(
  urlXml(`${O}/`, "2026-09-19T00:00:00.000Z"),
  urlXml(`${O}/civil-servant-pay-2027`, "2026-12-02T00:00:00.000Z"),
  urlXml(`${O}/year-end-tax`, "2026-09-25T00:00:00.000Z"),
  urlXml(`${O}/table/2027/annual`, "2026-09-25T00:00:00.000Z"),
  urlXml(`${O}/search?q=a&amp;page=2`, "2026-08-01T00:00:00.000Z"),
  urlXml(`${O}/no-lastmod`, "2026-12-02T00:00:00.000Z"),
  urlXml(`${O}/brand-new`, "2026-12-02T00:00:00.000Z"), // 신규
  urlXml("https://example.com/another-foreign", "2026-12-02T00:00:00.000Z"),
);

describe("diffSitemaps — (loc, lastmod) 쌍", () => {
  it("픽스처 2개: 바뀐 loc 만 정확히", () => {
    const d = diffSitemaps(PREV_XML, NEXT_XML);
    if (!d.ok) throw new Error(d.reason);
    expect(d.added).toEqual([`${O}/brand-new`]);
    expect(d.changed).toEqual([`${O}/civil-servant-pay-2027`, `${O}/no-lastmod`]);
    expect(d.removed).toEqual([`${O}/old-page`]);
    expect(d.urls).toEqual([...d.added, ...d.changed, ...d.removed]);
  });

  it("같은 사이트맵이면 빈 목록", () => {
    const d = diffSitemaps(NEXT_XML, NEXT_XML);
    expect(d).toEqual({ ok: true, added: [], changed: [], removed: [], urls: [] });
  });

  it("scripts/indexnow-diff.mjs 제출 목록과 같다 (운영자 요청 목록 = [indexnow] 목록)", () => {
    const pairs: Array<[string, string]> = [
      [PREV_XML, NEXT_XML],
      [NEXT_XML, PREV_XML],
      [read("scripts/__tests__/fixtures/indexnow/prod-sitemap.xml"), read("scripts/__tests__/fixtures/indexnow/build-sitemap.xml")],
    ];
    for (const [prev, next] of pairs) {
      const mine = diffSitemaps(prev, next);
      const plan = planSubmission(readSitemap({ body: next }), readSitemap({ status: 200, body: prev }));
      if (!mine.ok) throw new Error(mine.reason);
      expect(mine.urls).toEqual(plan.urls);
      expect(plan.counts).toMatchObject({ added: mine.added.length, changed: mine.changed.length, removed: mine.removed.length });
    }
  });

  it("판독 실패는 indexnow 와 같이 목록 없음 (오류 페이지·잘린 XML·빈 본문·loc 0건)", () => {
    const bad = ["error code: 1102", NEXT_XML.slice(0, 200), "", sitemapXml(urlXml("https://example.com/x", "2026-01-01"))];
    for (const b of bad) {
      expect(readSitemapXml(b).ok).toBe(false);
      expect(readSitemap({ status: 200, body: b }).ok).toBe(false);
      const d = diffSitemaps(PREV_XML, b);
      expect(d.ok).toBe(false);
      if (!d.ok) expect(d.side).toBe("next");
    }
    const d = diffSitemaps("", NEXT_XML);
    expect(d.ok === false && d.side === "prev").toBe(true);
  });

  it("requestPlan: 등록부 클러스터 순 → 등록부 밖, 삭제는 요청에서 제외, 10개씩 날짜 묶음", () => {
    const d = diffSitemaps(PREV_XML, NEXT_XML);
    if (!d.ok) throw new Error(d.reason);
    const p = requestPlan(d, REG, "E3");
    expect(p.ordered).toEqual([`${O}/civil-servant-pay-2027`, `${O}/brand-new`, `${O}/no-lastmod`]);
    expect(p.removed).toEqual([`${O}/old-page`]);
    expect(p.outsideRegistry).toEqual([`${O}/brand-new`, `${O}/no-lastmod`]);
    expect(p.naverDays).toEqual([p.ordered]);
    expect(p.gscInspect).toEqual(p.ordered.slice(0, GSC_INSPECT_CAP));
    // E3 후보인데 lastmod 가 안 바뀐 URL(예: /year-end-tax) → 손잡이 누락 확인용
    expect(p.eventUnchanged).toContain(`${O}/year-end-tax`);
    expect(p.eventUnchanged).not.toContain(`${O}/civil-servant-pay-2027`);
    expect(p.notInEvent).toEqual([]);

    const many = sitemapXml(...Array.from({ length: 23 }, (_, i) => urlXml(`${O}/p${i}`, "2026-12-02")));
    const base = sitemapXml(...Array.from({ length: 23 }, (_, i) => urlXml(`${O}/p${i}`, "2026-12-01")));
    const d2 = diffSitemaps(base, many);
    if (!d2.ok) throw new Error(d2.reason);
    expect(requestPlan(d2, REG).naverDays.map((x) => x.length)).toEqual([10, 10, 3]);
  });
});

// ── (6) validateRegistry ─────────────────────────────────────────────────────────

describe("validateRegistry", () => {
  const sitemapOk = () => liveUrls(REG);
  const overridesOk = () => overrideRefs(REG);

  it("live URL 이 모두 사이트맵에 있고 route-override 키가 모두 있으면 0건 (대기 행은 없어도 됨)", () => {
    expect(validateRegistry(REG, sitemapOk(), overridesOk())).toEqual([]);
    const pending = REG.rows.filter((r) => r.status !== "live");
    expect(pending.length).toBeGreaterThan(0);
    for (const p of pending) expect(sitemapOk()).not.toContain(p.url);
  });

  it("사이트맵에 없는 live URL 을 잡는다", () => {
    const sm = sitemapOk().filter((u) => u !== "/home-loan");
    expect(validateRegistry(REG, sm, overridesOk())).toEqual(["/home-loan: live 인데 사이트맵에 없음"]);
  });

  it("ROUTE_OVERRIDES 에 없는 route-override 키를 잡는다 — add-on-event 는 키가 없어도 통과", () => {
    const keys = overridesOk().filter((k) => k !== "/year-end-tax");
    const errs = validateRegistry(REG, sitemapOk(), keys);
    expect(errs).toHaveLength(1);
    expect(errs[0]).toMatch(/^\/year-end-tax: ROUTE_OVERRIDES 에 '\/year-end-tax' 키 없음/);
    const addOn = REG.rows.filter((r) => r.lastmodHandle.kind === "add-on-event");
    expect(addOn.length).toBeGreaterThan(0);
    for (const r of addOn) expect(keys).not.toContain(r.lastmodHandle.ref);
  });

  it("알 수 없는 route-override 키(오타)를 잡는다", () => {
    const r = clone();
    const row = r.rows.find((x) => x.url === "/home-loan") as SeasonRow;
    row.lastmodHandle = { kind: "route-override", ref: "/home-loans" };
    const errs = validateRegistry(r, sitemapOk(), overridesOk());
    expect(errs.some((e) => e.includes("ref(/home-loans) 는 url 과 같아야 함"))).toBe(true);
    expect(errs.some((e) => e.includes("'/home-loans' 키 없음"))).toBe(true);
  });

  it("손잡이 ref·피드 짝과 rss-tables 상한", () => {
    const r = clone();
    const g = r.rows.find((x) => x.url.startsWith("/guides/")) as SeasonRow;
    g.lastmodHandle = { kind: "guide-modified", ref: "wrong-slug" };
    const c = r.rows.find((x) => x.url === "/calc/unemployment-benefit") as SeasonRow;
    c.lastmodHandle = { kind: "calc-publishedAt", ref: "wrong" };
    const j = r.rows.find((x) => x.url === "/job/soldier") as SeasonRow;
    j.feeds = ["rss-tables"];
    const h = r.rows.find((x) => x.url === "/home-loan") as SeasonRow;
    h.feeds = ["rss-tables", "rss"];
    const errs = validateRegistry(r, sitemapOk(), overridesOk()).join("\n");
    expect(errs).toContain("guide-modified ref(wrong-slug)");
    expect(errs).toContain("calc-publishedAt ref(wrong)");
    expect(errs).toContain("/job/soldier: rss-tables 에는");
    expect(errs).toContain("/home-loan: rss 피드는");

    const big = clone();
    for (let i = 0; i < RSS_TABLES_MAX_ITEMS; i++) {
      big.rows.push({ url: `/t${i}`, cluster: "pay", events: [], peak: "2027-01", lastmodHandle: { kind: "add-on-event", ref: `/t${i}` }, feeds: ["rss-tables"], status: "pending-1016" });
    }
    expect(validateRegistry(big, sitemapOk(), overridesOk()).join("\n")).toMatch(/rss-tables 멤버 \d+개 > 상한 60/);
  });

  it("rssTablesFeed.ts 멤버와 대조 (있을 때만)", () => {
    const tables = REG.rows.filter((r) => r.feeds.includes("rss-tables") && r.status === "live").map((r) => r.url);
    const pending = REG.rows.filter((r) => r.feeds.includes("rss-tables") && r.status !== "live").map((r) => r.url);
    expect(validateRegistry(REG, sitemapOk(), overridesOk(), { rssTables: { feed: tables, pending } })).toEqual([]);
    const errs = validateRegistry(REG, sitemapOk(), overridesOk(), {
      rssTables: { feed: [...tables.filter((u) => u !== "/home-loan"), "/job/soldier"], pending },
    });
    expect(errs).toEqual([
      "/home-loan: 'rss-tables' 표시인데 rssTablesFeed.ts 멤버가 아님",
      "/job/soldier: rssTablesFeed.ts FEED_PATHS 멤버인데 등록부에 'rss-tables' 표시 없음",
    ]);
  });

  it("죽은 손잡이: 사이트맵 lastmod 가 ROUTE_OVERRIDES 날짜와 다르면 잡는다 (성과급 루프가 덮어쓰는 유형)", () => {
    const r = clone();
    const row = r.rows.find((x) => x.url === "/calc/samsung-bonus") as SeasonRow;
    row.lastmodHandle = { kind: "route-override", ref: "/calc/samsung-bonus" };
    const keys = [...overridesOk(), "/calc/samsung-bonus"];
    const same = new Map([["/calc/samsung-bonus", "2026-09-25"], ["/home-loan", "2026-09-19"]]);
    const opts = (days: Map<string, string>) => ({ sitemapLastmods: same, overrideDays: days });
    expect(validateRegistry(r, sitemapOk(), keys, opts(new Map(same)))).toEqual([]);
    // 발표일에 ROUTE_OVERRIDES 만 12/2 로 올렸는데 루프가 9/25 를 계속 내보내는 경우
    const bumped = new Map([...same, ["/calc/samsung-bonus", "2026-12-02"]]);
    expect(validateRegistry(r, sitemapOk(), keys, opts(bumped))).toEqual([
      "/calc/samsung-bonus: 사이트맵 lastmod 2026-09-25 ≠ ROUTE_OVERRIDES 날짜 2026-12-02 — 다른 코드가 덮어쓰는 죽은 손잡이, kind 를 다시 분류",
    ]);
  });

  it("경고: bonus-engine 행의 lastmod 가 갈라지면 알린다", () => {
    const bonus = REG.rows.filter((r) => r.lastmodHandle.kind === "bonus-engine").map((r) => r.url);
    const one = new Map(bonus.map((u) => [u, "2026-09-25"]));
    expect(registryWarnings(REG, sitemapOk(), overridesOk(), one)).toEqual([]);
    const split = new Map([...one, [bonus[0], "2026-12-02"]]);
    expect(registryWarnings(REG, sitemapOk(), overridesOk(), split)[0]).toMatch(/^bonus-engine 행의 사이트맵 lastmod 가 2종/);
  });

  it("이벤트 표에서 C-xx 가 사라지면 잡는다", () => {
    const r = clone();
    r.events.E7.calendar = [];
    expect(validateRegistry(r, sitemapOk(), overridesOk())).toEqual([
      "C-04: 어느 이벤트에도 없고 calendarNotMapped 사유도 없음",
    ]);
  });

  it("경고: 대기 행이 사이트맵에 나타나면 live 로, add-on-event 키가 생기면 route-override 로", () => {
    const warns = registryWarnings(REG, [...sitemapOk(), "/teacher-pay-2027"], [...overridesOk(), "/auto-tax-2026"]);
    expect(warns).toEqual(
      expect.arrayContaining([
        "/teacher-pay-2027: pending-1014 인데 이미 사이트맵에 있음 — status 를 live 로",
        "/auto-tax-2026: ROUTE_OVERRIDES 에 '/auto-tax-2026' 키가 생김 — kind 를 route-override 로",
      ]),
    );
    expect(registryWarnings(REG, sitemapOk(), overridesOk())).toEqual([]);
  });
});

// ── (7) 런타임 격리 ──────────────────────────────────────────────────────────────

describe("런타임 격리", () => {
  function* walk(dir: string): Generator<string> {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "__tests__" || e.name === "node_modules") continue;
        yield* walk(p);
      } else if (/\.(ts|tsx|js|mjs)$/.test(e.name)) yield p;
    }
  }

  it("src 의 어떤 모듈도 seasonAnnounce·시즌 등록부를 import 하지 않는다", () => {
    const hits: string[] = [];
    for (const f of walk(resolve(ROOT, "src"))) {
      if (f.endsWith(join("lib", "seasonAnnounce.ts"))) continue;
      const text = readFileSync(f, "utf8");
      if (/seasonAnnounce|season-urls-2026-27/.test(text)) hits.push(f);
    }
    expect(hits).toEqual([]);
  });
});
