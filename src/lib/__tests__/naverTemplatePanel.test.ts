// 네이버 템플릿 패널(R6-05) — 합성 행만 사용(실제 GA4 내보내기 미사용).
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { DEST_TEMPLATES, destTemplate } from "../analytics";
import { HeaderNotFoundError } from "../naverReferrerQueries";
import {
  GA4_ROW_LIMITS,
  LANDING_TEMPLATES,
  LONG_TAIL_HEAD,
  PARENT,
  ReferrerExportError,
  TOPIC_CLUSTERS,
  landingTemplate,
  panel,
  parseGa4LandingCsv,
  parsePanelArgs,
  parseSitemap,
  parseSlate,
  renderLogLine,
  runNaverTemplatePanelCli,
  sitemapPathsFromLocs,
  topicCluster,
  type LandingRow,
  type LandingTemplate,
  type PanelCliIo,
  type TopicCluster,
} from "../naverTemplatePanel";

const ROOT = path.resolve(__dirname, "..", "..", "..");
const SRC = path.join(ROOT, "src");

// ─────────────────────────────────────────────────────────────
// 경로 말뭉치
// ─────────────────────────────────────────────────────────────

/** [경로, 기대 템플릿, 기대 클러스터] — 경계값 위주. */
const EDGE: [string, LandingTemplate, TopicCluster][] = [
  ["/", "home", "other"],
  ["", "other", "other"],
  ["(not set)", "other", "other"],
  ["(other)", "other", "other"],
  ["salary-db/samsung", "other", "other"],
  ["/SALARY-DB/samsung", "other", "other"],
  ["https://evil.example/salary-db/listed/005930", "other", "other"],
  ["https://www.moneysalary.com.evil.example/calc/dependent-check", "other", "other"],
  ["/salary-db", "salary-db-hub", "company"],
  ["/salary-db/", "salary-db-hub", "company"],
  ["/salary-db/listed", "salary-db-hub", "company"],
  ["/salary-db/listed/005930", "lite", "company"],
  ["/salary-db/listed/005930/", "lite", "company"],
  ["/salary-db/listed/005930?from=naver", "lite", "company"],
  ["https://www.moneysalary.com/salary-db/listed/000660#pay", "lite", "company"],
  ["//moneysalary.com/salary-db/listed/373220", "lite", "company"],
  ["/salary-db/listed/00593", "company", "company"],
  ["/salary-db/listed/0059301", "company", "company"],
  ["/salary-db/listed/top-salary", "ranking", "company"],
  ["/salary-db/listed/industry/semiconductor", "ranking", "company"],
  ["/salary-db/ranking", "ranking", "company"],
  ["/salary-db/compare/samsung-vs-sk-hynix", "compare", "company"],
  ["/salary-db/samsung-electronics", "company", "company"],
  ["/salary-db/%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90", "company", "company"],
  ["/salary-db/삼성전자", "company", "company"],
  ["/company/samsung", "other", "company"],
  ["/industry/semiconductor", "industry", "company"],
  ["/public-institutions", "other", "company"],
  ["/calc", "calc", "other"],
  ["/calc/ordinary-wage", "calc", "other"],
  ["/calc/dependent-check", "yearend-calc", "yearend"],
  ["/calc/dependent-check/", "yearend-calc", "yearend"],
  ["/calc/child-deduction?utm_source=naver", "yearend-calc", "yearend"],
  ["https://www.moneysalary.com/calc/dual-income-year-end", "yearend-calc", "yearend"],
  ["/calc/dependent-checker", "calc", "other"],
  ["/calc/january-bonus", "bonus-calc", "yearend"],
  ["/calc/year-end-bonus", "bonus-calc", "bonus"],
  ["/calc/year-end-bonus-tax", "calc", "bonus"],
  ["/calc/incentive-tax", "calc", "bonus"],
  ["/calc/samsung-bonus", "samsung-bonus", "bonus"],
  ["/calc/sk-hynix-bonus", "bonus-calc", "bonus"],
  ["/calc/bonus-calculators", "bonus-calc", "bonus"],
  ["/calc/hourly-to-yearly", "calc", "other"],
  ["/samsung-negotiation-2026", "other", "bonus"],
  ["/chuseok-bonus-2026", "other", "bonus"],
  ["/year-end-tax", "yearend", "yearend"],
  ["/year-end-tax-2027", "yearend", "yearend"],
  ["/year-end-tax-checklist/", "yearend", "yearend"],
  ["/year-end-tax-preview?x=1", "yearend", "yearend"],
  ["/credit-card-deduction-2026", "yearend", "yearend"],
  ["/medical-tax-credit-2026", "yearend", "yearend"],
  ["/rent-tax-credit-2026", "yearend", "yearend"],
  ["/donation-tax-credit-2026", "yearend", "yearend"],
  ["/credit-card-deduction", "other", "other"],
  ["/social-insurance-rates-2026", "rollover", "rollover"],
  ["/social-insurance-rates-2027", "rollover", "rollover"],
  ["/minimum-wage-2026", "rollover", "rollover"],
  ["/minimum-wage-2027", "rollover", "rollover"],
  ["/unemployment-benefit", "rollover", "rollover"],
  ["/unemployment-benefits", "other", "other"],
  ["/weekly-holiday-allowance-2026", "rollover", "rollover"],
  ["/military-pay-2026", "pay-military", "paytables"],
  ["/teacher-pay-2026", "pay-table", "paytables"],
  ["/civil-servant-pay-2027", "pay-table", "paytables"],
  ["/police-pay-2026", "pay-table", "paytables"],
  ["/firefighter-pay-2026", "pay-table", "paytables"],
  ["/home-loan", "home-loan", "home-loan"],
  ["/home-loan/", "home-loan", "home-loan"],
  ["/home-loans", "other", "other"],
  ["/insights", "insights", "other"],
  ["/insights/top100-2026", "insights", "other"],
  ["/fun", "fun", "other"],
  ["/fun/rank", "fun", "other"],
  ["/funding", "other", "other"],
  ["/en", "en", "other"],
  ["/en/salary-db/samsung", "en", "other"],
  ["/en/bonus", "en", "other"],
  ["/english", "other", "other"],
  ["/job", "job-hub", "job"],
  ["/job/professor", "job", "job"],
  ["/job/doctor/", "job", "job"],
  ["/guides", "guide", "other"],
  ["/guides/samsung-bonus-treasury-stock-15-trillion-2026", "guide", "bonus"],
  ["/guides/hometax-year-end-preview-2026", "guide", "yearend"],
  ["/guides/credit-card-deduction-30-40-strategy-2026", "guide", "yearend"],
  ["/guides/civil-servant-pay-raise-2027", "guide", "paytables"],
  ["/guides/minimum-wage-2026", "guide", "rollover"],
  ["/guides/salary-guide-2026", "guide", "other"],
  ["/salary", "other", "other"],
  ["/salary/5000", "salary-amount", "other"],
  ["/salary/5000-manwon", "salary-amount", "other"],
  ["/monthly", "monthly", "other"],
  ["/monthly/300", "monthly", "other"],
  ["/table/2026/monthly", "table", "other"],
  ["/tools/loan", "other", "other"],
];

/** 실제 라우트 폴더 이름(동적·그룹·api 제외)에서 경로를 만든다 — 새 라우트가 생겨도 말뭉치가 따라간다. */
function routeDirs(rel: string): string[] {
  const dir = path.join(SRC, "app", rel);
  return readdirSync(dir)
    .filter((name) => !/^[[(_]/.test(name) && name !== "api" && statSync(path.join(dir, name)).isDirectory())
    .map((name) => `/${rel ? `${rel}/` : ""}${name}`);
}

function corpus(): string[] {
  const bases = new Set<string>(EDGE.map(([p]) => p));
  for (const rel of ["", "calc", "fun", "en", "salary-db", "tools"]) {
    try {
      for (const p of routeDirs(rel)) bases.add(p);
    } catch {
      // 폴더가 없으면 건너뛴다
    }
  }
  const variants = new Set<string>();
  for (const base of bases) {
    variants.add(base);
    if (!base.startsWith("/")) continue;
    variants.add(`${base}/`);
    variants.add(`${base}?utm_source=naver&n_query=x`);
    variants.add(`${base}#faq`);
    variants.add(`https://www.moneysalary.com${base}`);
    variants.add(`https://moneysalary.com${base}/?q=1`);
    variants.add(`HTTPS://WWW.MONEYSALARY.COM${base}`);
    variants.add(`//www.moneysalary.com${base}`);
    variants.add(`https://evil.example${base}`);
    variants.add(`  ${base}  `);
  }
  return [...variants];
}

describe("landingTemplate — PARENT consistency", () => {
  const paths = corpus();

  it("uses a corpus of at least 200 paths", () => {
    expect(paths.length).toBeGreaterThanOrEqual(200);
  });

  it("keeps DEST_TEMPLATES as the untouched 17-value list", () => {
    expect([...DEST_TEMPLATES]).toEqual([
      "company", "compare", "salary-db-hub", "ranking", "job", "job-hub", "bonus-calc", "samsung-bonus", "calc",
      "salary-amount", "monthly", "pay-table", "table", "guide", "industry", "home", "other",
    ]);
  });

  it("maps every panel template to exactly one DEST_TEMPLATES value, and every DEST_TEMPLATES value to itself", () => {
    expect(Object.keys(PARENT).sort()).toEqual([...LANDING_TEMPLATES].sort());
    expect(new Set(LANDING_TEMPLATES).size).toBe(LANDING_TEMPLATES.length);
    for (const t of LANDING_TEMPLATES) expect(DEST_TEMPLATES).toContain(PARENT[t]);
    for (const d of DEST_TEMPLATES) {
      expect(LANDING_TEMPLATES).toContain(d);
      expect(PARENT[d]).toBe(d);
    }
    // 세분값은 company·calc·other 밖으로 나가지 않는다
    const refined = LANDING_TEMPLATES.filter((t) => PARENT[t] !== t);
    expect(new Set(refined.map((t) => PARENT[t]))).toEqual(new Set(["company", "calc", "other"]));
  });

  it("satisfies PARENT[landingTemplate(p)] === destTemplate(p) for every corpus path", () => {
    const mismatches = paths.filter((p) => PARENT[landingTemplate(p)] !== destTemplate(p));
    expect(mismatches).toEqual([]);
    for (const p of paths) {
      expect(LANDING_TEMPLATES).toContain(landingTemplate(p));
      expect(TOPIC_CLUSTERS).toContain(topicCluster(p));
    }
  });

  it("reaches every panel template from the corpus", () => {
    const seen = new Set(paths.map((p) => landingTemplate(p)));
    expect([...LANDING_TEMPLATES].filter((t) => !seen.has(t))).toEqual([]);
  });

  it("classifies the edge cases as specified", () => {
    for (const [p, template, cluster] of EDGE) {
      expect({ p, template: landingTemplate(p), cluster: topicCluster(p) }).toEqual({ p, template, cluster });
    }
  });

  it("gives the same template to query, hash, trailing-slash and same-site absolute variants", () => {
    // 사이트 경로만: 루트('/'+'/'는 프로토콜 상대 주소가 된다)와 이미 '//' 로 시작하는 주소는 뺀다(말뭉치 일관성 검사에는 포함)
    const sitePaths = EDGE.filter(([x]) => x.startsWith("/") && !x.startsWith("//") && x !== "/" && !x.includes("?") && !x.includes("#"));
    expect(sitePaths.length).toBeGreaterThan(80);
    for (const [p] of sitePaths) {
      const t = landingTemplate(p);
      for (const v of [`${p}/`, `${p}?a=1`, `${p}#x`, `https://www.moneysalary.com${p}`, `//moneysalary.com${p}`]) {
        expect({ v, t: landingTemplate(v) }).toEqual({ v, t });
      }
      expect(landingTemplate(`https://evil.example${p}`)).toBe("other");
    }
  });
});

describe("topicCluster — a separate axis", () => {
  it("does not call the template functions", () => {
    const src = topicCluster.toString();
    expect(src).not.toMatch(/landingTemplate|destTemplate/);
  });

  it("splits one template into several clusters and spans one cluster over several templates", () => {
    const clustersOf = (paths: string[]) => new Set(paths.map(topicCluster));
    const templatesOf = (paths: string[]) => new Set(paths.map(landingTemplate));
    const guides = ["/guides/bonus-tax-rate", "/guides/year-end-tax-13-tips-2026", "/guides/teacher-pay-guide", "/guides/unemployment-insurance-2026", "/guides/salary-guide-2026"];
    expect(templatesOf(guides)).toEqual(new Set(["guide"]));
    expect(clustersOf(guides)).toEqual(new Set(["bonus", "yearend", "paytables", "rollover", "other"]));
    const yearend = ["/year-end-tax", "/calc/dependent-check", "/calc/january-bonus", "/guides/hometax-year-end-preview-2026"];
    expect(clustersOf(yearend)).toEqual(new Set(["yearend"]));
    expect(templatesOf(yearend)).toEqual(new Set(["yearend", "yearend-calc", "bonus-calc", "guide"]));
    const company = ["/salary-db/x", "/salary-db/listed/005930", "/salary-db/compare/a-vs-b", "/salary-db", "/salary-db/ranking", "/industry/it", "/company/x"];
    expect(clustersOf(company)).toEqual(new Set(["company"]));
    expect(templatesOf(company).size).toBe(7);
  });

  it("is reported beside the templates, never inside them", () => {
    const rows: LandingRow[] = [
      { landing: "/calc/january-bonus", sessions: 5, engagedSessions: 3, views: 9 },
      { landing: "/guides/bonus-tax-rate", sessions: 2, engagedSessions: 1, views: 2 },
      { landing: "/teacher-pay-2026", sessions: 4, engagedSessions: 4, views: 4 },
    ];
    const r = panel(rows);
    expect(r.templates.map((t) => t.template)).toEqual([...LANDING_TEMPLATES]);
    expect(r.clusters.map((c) => c.cluster)).toEqual([...TOPIC_CLUSTERS]);
    const tpl = Object.fromEntries(r.templates.map((t) => [t.template, t.sessions]));
    const cls = Object.fromEntries(r.clusters.map((c) => [c.cluster, c.sessions]));
    expect(tpl).toMatchObject({ "bonus-calc": 5, guide: 2, "pay-table": 4, yearend: 0 });
    expect(cls).toMatchObject({ yearend: 5, bonus: 2, paytables: 4 });
    const sum = (xs: { sessions: number }[]) => xs.reduce((s, x) => s + x.sessions, 0);
    expect(sum(r.templates)).toBe(11);
    expect(sum(r.clusters)).toBe(11);
    expect(r.totals.sessions).toBe(11);
  });
});

// ─────────────────────────────────────────────────────────────
// CSV
// ─────────────────────────────────────────────────────────────

/** GA4 자유 형식 내보내기 모양: BOM + '#' 머리 주석 + 빈 줄 + 헤더 + (총계 행) + 데이터(CRLF). */
function ga4Csv(dataLines: string[], header = "방문 페이지 + 쿼리 문자열,세션수,참여 세션수,조회수", totals = ",100,50,200"): string {
  return (
    "﻿# ----------------------------------------\r\n" +
    "# NAVER-PANEL\r\n" +
    "# 속성: 합성 테스트\r\n" +
    "# 시작일: 20260907\r\n" +
    "# 종료일: 20261004\r\n" +
    "# ----------------------------------------\r\n" +
    "\r\n" +
    `${header}\r\n` +
    (totals ? `${totals}\r\n` : "") +
    dataLines.join("\r\n") +
    "\r\n"
  );
}

describe("parseGa4LandingCsv — CSV variants", () => {
  it("reads a Korean export with BOM, comment block and a blank-label totals row", () => {
    const parsed = parseGa4LandingCsv(ga4Csv(["/salary-db/samsung,40,30,90", '/calc/dependent-check,"1,234","1,000","2,468"']));
    expect(parsed.totalsRows).toBe(1);
    expect(parsed.dataRecords).toBe(2);
    expect(parsed.hasSource).toBe(false);
    expect(parsed.rows).toEqual([
      { landing: "/salary-db/samsung", sessions: 40, engagedSessions: 30, views: 90 },
      { landing: "/calc/dependent-check", sessions: 1234, engagedSessions: 1000, views: 2468 },
    ]);
  });

  it("reads English headers in another order, with extra look-alike columns and 'Totals'/'Grand total' rows", () => {
    const text =
      "# Free form 1\n\nViews per session,Engaged sessions,Sessions,Landing page + query string,Views,Engagement rate\n" +
      "1.5,10,20,Totals,30,0.5\n" +
      "2,4,6,/job/professor?n=1,12,0.66\n" +
      "1,1,2,Grand total,2,0.5\n";
    const parsed = parseGa4LandingCsv(text);
    expect(parsed.totalsRows).toBe(2);
    expect(parsed.rows).toEqual([{ landing: "/job/professor", sessions: 6, engagedSessions: 4, views: 12 }]);
  });

  it("matches column names exactly — '참여 세션수' is never taken for '세션수'", () => {
    const parsed = parseGa4LandingCsv("참여 세션수,세션당 조회수,방문 페이지,세션수\n7,2,/home-loan,9\n");
    expect(parsed.rows).toEqual([{ landing: "/home-loan", sessions: 9, engagedSessions: 7, views: 0 }]);
    expect(parsed.hasViews).toBe(false);
  });

  it("skips a second comment block and a repeated header, and aggregates encoded and decoded paths as one URL", () => {
    const text = ga4Csv([
      "/salary-db/%EC%82%BC%EC%84%B1,3,2,3",
      "# ---- 두 번째 표 ----",
      "# 종료",
      "방문 페이지 + 쿼리 문자열,세션수,참여 세션수,조회수",
      "/salary-db/삼성/,4,1,5",
    ]);
    const parsed = parseGa4LandingCsv(text);
    expect(parsed.rows.map((r) => r.landing)).toEqual(["/salary-db/삼성", "/salary-db/삼성"]);
    const r = panel(parsed.rows);
    expect(r.totals.urls).toBe(1);
    expect(r.templates.find((t) => t.template === "company")).toMatchObject({ sessions: 7, urls: 1, sessionsPerPage: 7 });
  });

  it("keeps only Naver search sources when a source or source/medium column exists", () => {
    const text = ga4Csv(
      [
        "/salary-db/a,naver,5,4,6",
        "/salary-db/a,m.search.naver.com,7,5,9",
        "/salary-db/b,search.naver.com,1,1,1",
        "/salary-db/b,blog.naver.com,3,1,3",
        "/salary-db/c,google,9,9,9",
      ],
      "방문 페이지 + 쿼리 문자열,세션 소스,세션수,참여 세션수,조회수",
      ",,25,20,28",
    );
    const parsed = parseGa4LandingCsv(text);
    expect(parsed).toMatchObject({ hasSource: true, naverOtherSessions: 3, nonNaverRows: 1, totalsRows: 1, dataRecords: 5 });
    expect(parsed.rows.reduce((s, r) => s + r.sessions, 0)).toBe(13);
    const sm = parseGa4LandingCsv("Session source / medium,Landing page,Sessions\nnaver / organic,/year-end-tax,4\ngoogle / organic,/year-end-tax,8\n");
    expect(sm.rows).toEqual([{ landing: "/year-end-tax", sessions: 4, engagedSessions: 0, views: 0 }]);
  });

  it("flags the '(other)' row and throws HeaderNotFoundError without the required columns", () => {
    const parsed = parseGa4LandingCsv(ga4Csv(["(other),12,3,20", "/fun/rank,1,1,1"]));
    expect(parsed.hasOtherRow).toBe(true);
    const r = panel(parsed.rows);
    expect(r.totals).toMatchObject({ sessions: 13, urls: 1, placeholderSessions: 12 });
    expect(() => parseGa4LandingCsv("세션 소스,세션수\nnaver,1\n")).toThrow(HeaderNotFoundError);
  });
});

// ─────────────────────────────────────────────────────────────
// 커버리지·집계 수식
// ─────────────────────────────────────────────────────────────

describe("panel — coverage math", () => {
  const sitemap = [
    "https://www.moneysalary.com/salary-db/a",
    "https://www.moneysalary.com/salary-db/b",
    "https://www.moneysalary.com/salary-db/c",
    "https://www.moneysalary.com/salary-db/%EC%82%BC%EC%84%B1/",
    "https://www.moneysalary.com/salary-db/listed/005930",
    "https://www.moneysalary.com/salary-db/listed/000660",
    "https://www.moneysalary.com/calc/dependent-check",
    "https://www.moneysalary.com/year-end-tax",
    "https://other.example/salary-db/z",
  ];
  const rows: LandingRow[] = [
    { landing: "/salary-db/a", sessions: 10, engagedSessions: 6, views: 20 },
    { landing: "/salary-db/a", sessions: 2, engagedSessions: 1, views: 2 },
    { landing: "/salary-db/삼성", sessions: 4, engagedSessions: 2, views: 4 },
    { landing: "/salary-db/c", sessions: 0, engagedSessions: 0, views: 3 },
    { landing: "/salary-db/old-slug", sessions: 5, engagedSessions: 5, views: 5 },
    { landing: "/salary-db/listed/005930", sessions: 3, engagedSessions: 1, views: 3 },
    { landing: "/year-end-tax", sessions: 8, engagedSessions: 4, views: 16 },
    { landing: "(not set)", sessions: 6, engagedSessions: 0, views: 0 },
  ];

  it("divides sitemap URLs with ≥1 Naver session by sitemap URLs of the same template", () => {
    const r = panel(rows, sitemap);
    const by = Object.fromEntries(r.templates.map((t) => [t.template, t]));
    // company: 사이트맵 a·b·c·삼성 4개 중 세션 있는 a·삼성 = 2 → 50%. old-slug 는 사이트맵 밖(분자 제외), c 는 세션 0.
    expect(by.company).toMatchObject({ sessions: 21, urls: 3, sitemapUrls: 4, coveredUrls: 2, coverage: 0.5, sessionsPerPage: 7 });
    expect(by.lite).toMatchObject({ sessions: 3, urls: 1, sitemapUrls: 2, coveredUrls: 1, coverage: 0.5 });
    expect(by["yearend-calc"]).toMatchObject({ sessions: 0, urls: 0, sitemapUrls: 1, coveredUrls: 0, coverage: 0, sessionsPerPage: null });
    expect(by.yearend).toMatchObject({ sessions: 8, sitemapUrls: 1, coveredUrls: 1, coverage: 1 });
    expect(by.other).toMatchObject({ sessions: 6, urls: 0, sitemapUrls: 0, coverage: null });
    expect(r.totals).toMatchObject({
      sessions: 38,
      engagedSessions: 19,
      views: 53,
      urls: 5,
      placeholderSessions: 6,
      sitemapUrls: 8,
      coveredUrls: 4,
      coverage: 0.5,
      outsideSitemapUrls: 1,
    });
  });

  it("leaves coverage null without a sitemap", () => {
    const r = panel(rows);
    expect(r.templates.every((t) => t.coverage === null && t.sitemapUrls === null)).toBe(true);
    expect(r.totals).toMatchObject({ sitemapUrls: null, coverage: null, outsideSitemapUrls: null });
  });

  it("counts long-tail sessions outside the top 30 URLs", () => {
    const many: LandingRow[] = Array.from({ length: LONG_TAIL_HEAD + 5 }, (_, i) => ({
      landing: `/salary-db/c${i}`,
      sessions: LONG_TAIL_HEAD + 5 - i,
      engagedSessions: 0,
      views: 0,
    }));
    expect(panel(many).totals.longTailSessions).toBe(1 + 2 + 3 + 4 + 5);
  });

  it("parses sitemap XML (entities, index) and plain text lists", () => {
    const xml = '<?xml version="1.0"?><urlset><url><loc>https://www.moneysalary.com/a?x=1&amp;y=2</loc></url><url><loc> https://moneysalary.com/b/ </loc></url></urlset>';
    const s = parseSitemap(xml);
    expect(s.kind).toBe("urlset");
    expect(sitemapPathsFromLocs(s.locs)).toEqual(["/a", "/b"]);
    expect(parseSitemap("<sitemapindex><sitemap><loc>https://www.moneysalary.com/s1.xml</loc></sitemap></sitemapindex>").kind).toBe("index");
    expect(parseSitemap("﻿/x\nhttps://www.moneysalary.com/y\nnoise\n")).toEqual({ kind: "text", locs: ["/x", "https://www.moneysalary.com/y"] });
  });
});

// ─────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────

describe("runNaverTemplatePanelCli", () => {
  const month = ga4Csv([
    "/salary-db/a,10,6,20",
    "/salary-db/listed/005930,3,1,3",
    "/job/professor,7,5,9",
    "/job/doctor,2,1,2",
    "/home-loan,4,2,4",
    "/year-end-tax,8,4,16",
  ]);
  const week = ga4Csv(["/salary-db/a,3,2,4", "/job/professor,1,1,1"]);
  const referrer =
    "페이지 리퍼러,방문 페이지 + 쿼리 문자열,세션수,조회수\r\n" +
    `https://m.search.naver.com/search.naver?query=${encodeURIComponent("교수 연봉")}&sm=SECRETTOKEN,/job/professor,5,6\r\n` +
    `https://search.naver.com/search.naver?query=${encodeURIComponent("의사 연봉")},/job/doctor,2,2\r\n` +
    `https://search.naver.com/search.naver?query=${encodeURIComponent("삼성전자 연봉")},/salary-db/a,9,9\r\n`;
  const sitemapXml =
    "<urlset>" +
    ["/salary-db/a", "/salary-db/b", "/salary-db/listed/005930", "/job/professor", "/job/doctor", "/job/nurse", "/home-loan", "/year-end-tax"]
      .map((p) => `<url><loc>https://www.moneysalary.com${p}</loc></url>`)
      .join("") +
    "</urlset>";
  const files: Record<string, string> = {
    "/data/ga4-28d.csv": month,
    "/data/ga4-28d-p2.csv": ga4Csv(["/fun/rank,1,1,1"], undefined, ""),
    "/data/ga4-7d.csv": week,
    "/data/ref.csv": referrer,
    "/data/sitemap.xml": sitemapXml,
    "/data/bad.csv": `세션 소스,세션수\nhttps://search.naver.com/search.naver?query=x,1\n`,
  };
  const io = (over: Partial<PanelCliIo> = {}): PanelCliIo => ({
    repoRoot: "/work/repo",
    cwd: "/work/repo",
    realpath: (p) => p,
    readText: vi.fn((p: string) => {
      if (!(p in files)) throw new Error("ENOENT");
      return files[p];
    }),
    fetchText: vi.fn(async () => sitemapXml),
    pathImpl: path.posix,
    ...over,
  });

  it("refuses any in-repo input path with exit 2 before reading anything", async () => {
    const readText = vi.fn(() => month);
    const fetchText = vi.fn(async () => sitemapXml);
    const cases = [
      ["docs/ga4.csv"],
      ["/work/repo/ga4.csv"],
      ["../repo/x.csv"],
      ["/data/ga4-28d.csv", "--7d", "tmp/7d.csv"],
      ["/data/ga4-28d.csv", "--slate", "/job/professor", "--referrer", "/work/repo/ref.csv"],
      ["/data/ga4-28d.csv", "--sitemap", "public/sitemap.xml"],
      ["/data/ga4-28d.csv", "/work/repo/.git/page2.csv"],
    ];
    for (const argv of cases) {
      const res = await runNaverTemplatePanelCli(argv, io({ readText, fetchText }));
      expect({ argv, code: res.code }).toEqual({ argv, code: 2 });
      expect(res.stdout).toBe("");
      expect(res.stderr).toContain("저장소 작업 트리 안");
    }
    // 저장소 밖처럼 보여도 실제 경로(정션·링크 해제)가 저장소 안이면 거부
    const viaLink = await runNaverTemplatePanelCli(
      ["/tmp/link.csv"],
      io({ readText, realpath: (p) => (p === "/tmp/link.csv" ? "/work/repo/data/x.csv" : p) }),
    );
    expect(viaLink.code).toBe(2);
    expect(readText).not.toHaveBeenCalled();
    expect(fetchText).not.toHaveBeenCalled();
  });

  it("prints the template and cluster tables with coverage from a sitemap file", async () => {
    const res = await runNaverTemplatePanelCli(["/data/ga4-28d.csv", "--7d", "/data/ga4-7d.csv", "--sitemap", "/data/sitemap.xml"], io());
    expect(res.code).toBe(0);
    expect(res.stdout).toContain("| company | company | 10 | 6 | 60.0% | 20 | 1 | 10 | 2 | 1 | 50.0% | 3 |");
    expect(res.stdout).toContain("| lite | company | 3 | 1 | 33.3% | 3 | 1 | 3 | 1 | 1 | 100.0% | 0 |");
    expect(res.stdout).toContain("| job | job | 9 | 6 | 66.7% | 11 | 2 | 4.5 | 3 | 2 | 66.7% | 1 |");
    expect(res.stdout).toContain("## 주제 클러스터별");
    expect(res.stdout).toContain("| yearend | 8 | 4 | 16 | 1 | 0 |");
    expect(res.stdout).toContain("총계 행 1건 제외");
  });

  it("fetches an https sitemap through the injected fetcher and rejects plain http", async () => {
    const fetchText = vi.fn(async () => sitemapXml);
    const ok = await runNaverTemplatePanelCli(["/data/ga4-28d.csv", "--sitemap", "https://www.moneysalary.com/sitemap.xml"], io({ fetchText }));
    expect(ok.code).toBe(0);
    expect(fetchText).toHaveBeenCalledWith("https://www.moneysalary.com/sitemap.xml");
    const http = await runNaverTemplatePanelCli(["/data/ga4-28d.csv", "--sitemap", "http://www.moneysalary.com/sitemap.xml"], io());
    expect(http.code).toBe(1);
  });

  it("prints one aggregate --log-line with template names and numbers only — no '/' at all", async () => {
    const res = await runNaverTemplatePanelCli(
      ["/data/ga4-28d.csv", "/data/ga4-28d-p2.csv", "--7d", "/data/ga4-7d.csv", "--sitemap", "/data/sitemap.xml", "--log-line"],
      io(),
    );
    expect(res.code).toBe(0);
    const lines = res.stdout.split("\n").filter(Boolean);
    expect(lines).toHaveLength(1);
    const line = lines[0];
    expect(line).not.toContain("/");
    expect(line).not.toContain("|");
    expect(line).not.toMatch(/professor|doctor|salary-db|http|연봉/);
    const allowed = new Set<string>([...LANDING_TEMPLATES, ...TOPIC_CLUSTERS, "v1", "d"]);
    const words = line.match(/[a-z][a-z0-9-]*/g) ?? [];
    expect(words.filter((w) => !allowed.has(w))).toEqual([]);
    expect(line).toContain("열=세션·페이지당·커버·7d");
    expect(line).toContain("; company 10·10.0·50.0%·3 ;");
    expect(line).toContain("; job 9·4.5·66.7%·1 ;");
    expect(line).toContain("; fun 1·1.0·-·0 ;");
    expect(line).not.toContain("salary-db-hub"); // 28일·7일 세션 0 인 템플릿은 생략
    expect(line).toContain("; 계열 28d company 13 bonus 0 paytables 0 yearend 8 rollover 0 job 9 home-loan 4 other 1 ;");
    expect(line).toContain("; 계열 7d company 3 ");
    expect(line.endsWith("; 7d 세션 4")).toBe(true);
  });

  it("renderLogLine stays slash-free even for placeholder and odd-path input", () => {
    const r = panel(
      [
        { landing: "(not set)", sessions: 3, engagedSessions: 0, views: 0 },
        { landing: "/a/b/c|d", sessions: 1, engagedSessions: 0, views: 0 },
      ],
      ["https://www.moneysalary.com/a/b/c|d"],
    );
    const line = renderLogLine(r, null);
    expect(line).not.toMatch(/[/|]/);
    expect(line).toContain("계열 28d");
  });

  it("prints query × landing rows only for the slate paths via the naver-referrer aggregation", async () => {
    const res = await runNaverTemplatePanelCli(
      ["/data/ga4-28d.csv", "--slate", "/job/professor,/job/doctor,/home-loan", "--referrer", "/data/ref.csv"],
      io(),
    );
    expect(res.code).toBe(0);
    expect(res.stdout).toContain("| /job/professor | job | 7 | 5 | 9 |");
    expect(res.stdout).toContain("| /job/professor | 1 | 교수 연봉 | 5 | 6 |");
    expect(res.stdout).toContain("| /job/doctor | 1 | 의사 연봉 | 2 | 2 |");
    expect(res.stdout).toContain("| /home-loan | - | (검색어 없음) | 0 | 0 |");
    expect(res.stdout).toContain("| /home-loan | 0 | 0 | - |");
    for (const raw of ["삼성전자 연봉", "search.naver.com", "SECRETTOKEN", "query=", "%EA"]) {
      expect(res.stdout).not.toContain(raw);
      expect(res.stderr).not.toContain(raw);
    }
  });

  it("reports usage, duplicate-file, read and header errors with exit 1", async () => {
    expect((await runNaverTemplatePanelCli([], io())).code).toBe(1);
    expect((await runNaverTemplatePanelCli(["--help"], io())).code).toBe(0);
    expect((await runNaverTemplatePanelCli(["/data/ga4-28d.csv", "--referrer", "/data/ref.csv"], io())).code).toBe(1);
    expect((await runNaverTemplatePanelCli(["/data/ga4-28d.csv", "--slate", "/job/x", "--log-line"], io())).code).toBe(1);
    const dup = await runNaverTemplatePanelCli(["/data/ga4-28d.csv", "/data/ga4-28d.csv"], io());
    expect(dup.code).toBe(1);
    expect(dup.stderr).toContain("두 번");
    expect((await runNaverTemplatePanelCli(["/data/missing.csv"], io())).code).toBe(1);
    const header = await runNaverTemplatePanelCli(["/data/bad.csv"], io());
    expect(header.code).toBe(1);
    expect(header.stderr).toContain("헤더 인식 실패");
    expect(header.stderr).not.toContain("search.naver.com");
    // 리퍼러 × 방문 페이지 CSV 를 패널 입력으로 넣으면 네이버 외 리퍼러까지 세게 되므로 거부한다
    const wrong = await runNaverTemplatePanelCli(["/data/ref.csv"], io());
    expect(wrong.code).toBe(1);
    expect(wrong.stderr).toContain("--referrer");
    expect(wrong.stderr).not.toContain("search.naver.com");
    expect(() => parseGa4LandingCsv(referrer)).toThrow(ReferrerExportError);
  });

  it("warns when a file's row count equals a GA4 'show rows' value", async () => {
    const ten = ga4Csv(Array.from({ length: 10 }, (_, i) => `/salary-db/c${i},1,1,1`));
    const res = await runNaverTemplatePanelCli(["/data/ten.csv"], io({ readText: () => ten }));
    expect(GA4_ROW_LIMITS).toContain(10);
    expect(res.stdout).toContain("잘렸을 수 있다");
  });
});

describe("parsePanelArgs / parseSlate", () => {
  it("parses repeated windows, = forms and the slate list", () => {
    const r = parsePanelArgs(["a.csv", "b.csv", "--7d=w.csv", "--7d", "w2.csv", "--sitemap", "s.xml", "--slate", "/job/professor/, /home-loan ,/job/professor"]);
    expect(r).toEqual({
      ok: true,
      args: { files: ["a.csv", "b.csv"], weekFiles: ["w.csv", "w2.csv"], sitemap: "s.xml", referrer: null, slate: ["/job/professor", "/home-loan"], logLine: false },
    });
    for (const bad of [["a.csv", "--top", "5"], ["a.csv", "--slate", "job/x"], ["a.csv", "--sitemap"], ["a.csv", "--slate", "/a", "--slate", "/b"]]) {
      expect(parsePanelArgs(bad).ok).toBe(false);
    }
    const tooMany = Array.from({ length: 21 }, (_, i) => `/p${i}`).join(",");
    expect(parseSlate(tooMany).ok).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// 빌드 무영향 — 어떤 페이지·컴포넌트도 이 모듈을 import 하지 않는다
// ─────────────────────────────────────────────────────────────

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "__tests__" || name === "node_modules") continue;
      walk(full, out);
    } else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

describe("build isolation", () => {
  it("is not imported anywhere under src/ (so the build output cannot change)", () => {
    const self = path.join(SRC, "lib", "naverTemplatePanel.ts");
    const importers = walk(SRC).filter((f) => f !== self && /naverTemplatePanel|naver-template-panel/.test(readFileSync(f, "utf8")));
    expect(importers.map((f) => path.relative(ROOT, f))).toEqual([]);
  });

  it("is imported only by its CLI script among scripts/", () => {
    const scripts = walk(path.join(ROOT, "scripts")).filter((f) => /naverTemplatePanel/.test(readFileSync(f, "utf8")));
    expect(scripts.map((f) => path.relative(ROOT, f).split(path.sep).join("/"))).toEqual(["scripts/naver-template-panel.ts"]);
  });
});
