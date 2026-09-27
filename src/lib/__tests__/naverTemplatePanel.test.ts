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
  PANEL_RULES_VERSION,
  PARENT,
  ReferrerExportError,
  SESSION_HLL_TOLERANCE,
  TOPIC_CLUSTERS,
  completenessToken,
  findWindowConflict,
  inspectReferrerCsv,
  landingTemplate,
  panel,
  parseGa4LandingCsv,
  parsePanelArgs,
  parseSitemap,
  parseSlate,
  renderLogLine,
  runNaverTemplatePanelCli,
  sitemapPathsFromLocs,
  slateFilterRegex,
  topicCluster,
  windowCompleteness,
  type ExportPage,
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
  ["/credit-card-deduction", "other", "yearend"], // 템플릿은 연도 꼬리 필요, 클러스터는 'deduction' 키워드
  ["/social-insurance-rates-2026", "rollover", "rollover"],
  ["/social-insurance-rates-2027", "rollover", "rollover"],
  ["/minimum-wage-2026", "rollover", "rollover"],
  ["/minimum-wage-2027", "rollover", "rollover"],
  ["/unemployment-benefit", "rollover", "rollover"],
  ["/unemployment-benefits", "other", "rollover"], // 템플릿은 정확한 라우트만, 클러스터는 'unemployment' 키워드
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
  // ── 9/27 운영 사이트맵에서 v1 초안이 other 로 흘린 경로(검토 지적) — 클러스터 규칙 확정판 고정 ──
  // 성과급: OPI·TAI·PS 가이드, /calc/bonus-*, /insights/bonus-*, 도구, 한글 slug, 임금협상
  ["/guides/sk-hynix-ps-forecast-2027", "guide", "bonus"],
  ["/guides/sk-hynix-ps-history-2026-prospect", "guide", "bonus"],
  ["/guides/sk-hynix-ps-cash-vs-stock-scenarios-2026", "guide", "bonus"],
  ["/guides/samsung-opi-forecast-2027", "guide", "bonus"],
  ["/guides/samsung-opi-tai-complete-2026", "guide", "bonus"],
  ["/guides/samsung-wage-negotiation-2026", "guide", "bonus"],
  ["/calc/bonus-home-plan", "calc", "bonus"],
  ["/calc/bonus-versus-raise", "calc", "bonus"],
  ["/calc/bonus-repayment-reserve", "calc", "bonus"],
  ["/calc/holiday-bonus", "bonus-calc", "bonus"],
  ["/insights/bonus-payout-history-2026", "insights", "bonus"],
  ["/tools/finance/bonus", "other", "bonus"],
  ["/qna/성과급인센티브은-세금이-어떻게-매겨지나요-왜-이렇게-많이-떼나요", "other", "bonus"],
  // 연말정산: 'year-end' 어디든, tax-credit 계산기, 한글 연말정산·세액공제·소득공제
  ["/guides/irp-pension-year-end-2026", "guide", "yearend"],
  ["/calc/monthly-rent-tax-credit-quick", "calc", "yearend"],
  ["/qna/연말정산-13월의-월급이라는데-왜-누구는-토해내나요", "other", "yearend"],
  ["/qna/월세도-세액공제가-되나요-집주인-동의-필요한가요", "other", "yearend"],
  ["/qna/신용카드-많이-쓰면-소득공제-많이-받나요", "other", "yearend"],
  ["/glossary/연말정산-경정청구", "other", "yearend"],
  ["/glossary/%EC%97%B0%EB%A7%90%EC%A0%95%EC%82%B0-%EA%B2%BD%EC%A0%95%EC%B2%AD%EA%B5%AC", "other", "yearend"],
  // 연도 전환: 실업급여·주휴수당 계산기, 한글 실업급여·최저임금·주휴
  ["/calc/unemployment-benefit", "calc", "rollover"],
  ["/calc/holiday-allowance-quick", "calc", "rollover"],
  ["/qna/실업급여-신청-조건이-뭔가요-자진-퇴사면-못-받나요", "other", "rollover"],
  ["/qna/최저임금으로-일하면-월급이-정확히-얼마인가요-2026년-기준", "other", "rollover"],
  ["/qna/주휴수당이란-무엇이며-언제-받을-수-있나요", "other", "rollover"],
  ["/glossary/실업급여", "other", "rollover"],
  ["/glossary/최저임금", "other", "rollover"],
  ["/glossary/주휴수당", "other", "rollover"],
  // 봉급표: 공무원 실수령액 계산기(공식 봉급표 기반·같은 시즌)
  ["/calc/civil-servant-net-pay", "calc", "paytables"],
  // 경계 — 걸리면 안 되는 것
  ["/guides/salary-negotiation-script-2026", "guide", "other"], // 개인 연봉협상은 성과급 아님
  ["/guides/earned-income-credit-2026", "guide", "other"], // 근로장려금은 연말정산 아님
  ["/guides/retail-topic-maps-2026", "guide", "other"], // tai·opi·ps 는 단어 단위로만
  ["/qna/청년내일채움공제가-뭔가요-아직-신청-가능한가요", "other", "other"], // '공제' 단독은 세금이 아님
  ["/calc/weekly-pay", "calc", "other"],
  ["/job/civil-servant-9", "job", "job"], // /job 경로 규칙이 키워드보다 먼저
  ["/en/guides/samsung-opi-forecast-2027", "en", "other"],
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

  it("gives the same cluster to encoded, absolute, query and trailing-slash variants", () => {
    for (const [p, , cluster] of EDGE.filter(([x]) => x.startsWith("/") && !x.startsWith("//") && x !== "/")) {
      const bare = p.split(/[?#]/)[0];
      const encoded = encodeURI(decodeURI(bare)); // 이미 인코딩된 말뭉치 항목은 두 번 인코딩하지 않는다
      for (const v of [encoded, decodeURI(bare), `${bare}/`, `${bare}?n_query=x`, `https://www.moneysalary.com${encoded}`, `//moneysalary.com${bare}`]) {
        expect({ v, cluster: topicCluster(v) }).toEqual({ v, cluster });
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────
// 9/27 운영 사이트맵 스냅샷 — 규칙 판 v1 의 분포를 고정한다(10/5 첫 기록 전 확정)
// ─────────────────────────────────────────────────────────────

/** https://www.moneysalary.com/sitemap.xml 2026-09-27 받은 1,952 URL 을 sitemapPathsFromLocs 로 정규화한 경로(디코딩, 줄마다 하나). */
const SNAPSHOT = path.join(__dirname, "fixtures", "naverPanelSitemap-2026-09-27.txt");
const snapshotPaths = () =>
  readFileSync(SNAPSHOT, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.startsWith("/"));

const countBy = <T extends string>(xs: string[], f: (x: string) => T) => {
  const out: Record<string, number> = {};
  for (const x of xs) out[f(x)] = (out[f(x)] ?? 0) + 1;
  return out;
};

describe("9/27 live sitemap snapshot (rules v1)", () => {
  const paths = snapshotPaths();

  it("has the 1,952 unique sitemap paths", () => {
    expect(paths.length).toBe(1952);
    expect(new Set(paths).size).toBe(1952);
    expect(PANEL_RULES_VERSION).toBe("v1");
  });

  it("keeps PARENT consistency for every live path and its encoded form", () => {
    const mismatches = paths.filter((p) => PARENT[landingTemplate(p)] !== destTemplate(p) || landingTemplate(encodeURI(p)) !== landingTemplate(p));
    expect(mismatches).toEqual([]);
  });

  it("pins the cluster counts (docs/naver-template-panel.md §2)", () => {
    expect(countBy(paths, topicCluster)).toEqual({
      company: 713,
      bonus: 76,
      paytables: 7,
      yearend: 43,
      rollover: 23,
      job: 63,
      "home-loan": 1,
      other: 1026,
    });
    // 인코딩된 형태(GA4 가 한글 slug 를 퍼센트 인코딩으로 줄 때)도 같은 분포
    expect(countBy(paths.map((p) => encodeURI(p)), topicCluster)).toEqual(countBy(paths, topicCluster));
  });

  it("pins the template counts (docs/naver-template-panel.md §1)", () => {
    expect(countBy(paths, landingTemplate)).toEqual({
      company: 430,
      lite: 219,
      "salary-db-hub": 2,
      ranking: 32,
      job: 62,
      "job-hub": 1,
      "bonus-calc": 26,
      "samsung-bonus": 1,
      calc: 218,
      "yearend-calc": 3,
      "salary-amount": 211,
      monthly: 105,
      "pay-table": 5,
      table: 8,
      guide: 302,
      industry: 28,
      home: 1,
      yearend: 11,
      rollover: 6,
      "pay-military": 1,
      "home-loan": 1,
      insights: 4,
      fun: 21,
      en: 37,
      other: 217,
    });
  });

  it("puts every OPI·TAI·PS guide and every bonus calculator or report into bonus", () => {
    const bonusish = paths.filter((p) => /(^|[/-])(opi|tai|ps)([/-]|$)|\/calc\/bonus-|\/insights\/bonus-|\/calc\/[a-z0-9-]+-bonus$/.test(p));
    expect(bonusish.length).toBeGreaterThanOrEqual(35);
    expect(bonusish.filter((p) => topicCluster(p) !== "bonus" && p !== "/calc/january-bonus")).toEqual([]);
  });

  it("leaves no Korean slug with a season keyword outside its cluster", () => {
    const want: [RegExp, TopicCluster][] = [
      [/연말정산|세액공제/, "yearend"],
      [/성과급|인센티브/, "bonus"],
      [/실업급여|최저임금|주휴/, "rollover"],
    ];
    for (const [re, cluster] of want) {
      const hits = paths.filter((p) => re.test(p));
      expect(hits.length).toBeGreaterThan(0);
      expect(hits.filter((p) => topicCluster(p) !== cluster)).toEqual([]);
    }
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
    // 총계 행 값은 버리지 않고 남긴다(완전성 대조)
    expect(parsed.totals).toEqual({ sessions: 100, views: 200 });
    expect(parsed).toMatchObject({ dataSessions: 1274, dataViews: 2558 });
    expect(parsed.rawKeys).toEqual(["/salary-db/samsung", "/calc/dependent-check"]);
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
    // 값이 다른 총계 행이 둘이면 어느 것이 이 표의 총계인지 모른다 — 판정 불가(null)
    expect(parsed.totals).toBeNull();
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
    // 총계는 모든 소스 합이므로 행 합도 소스 필터 전 값으로 대조한다 → 완전
    expect(parsed).toMatchObject({ totals: { sessions: 25, views: 28 }, dataSessions: 25, dataViews: 28 });
    expect(windowCompleteness([parsed]).status).toBe("complete");
    // 같은 방문 페이지라도 소스가 다르면 다른 원문 행이다(겹침 아님)
    expect(parsed.rawKeys[0]).not.toBe(parsed.rawKeys[1]);
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
// 완전성 — 총계 대조 · 시작 행 겹침 · 행 표시 한도
// ─────────────────────────────────────────────────────────────

/** n 개 데이터 행(행마다 세션 2·조회수 3) + 선택 총계 행. */
function pageCsv(prefix: string, n: number, totals: string | null): string {
  return ga4Csv(
    Array.from({ length: n }, (_, i) => `/salary-db/${prefix}${i},2,1,3`),
    undefined,
    totals ?? "",
  );
}

describe("window completeness", () => {
  it("keeps the totals of every page and reconciles views exactly (±1) across a 3-page window", () => {
    const totals = ",2400,1200,3600"; // 1,200행 × (세션 2 · 조회수 3)
    const p1 = parseGa4LandingCsv(pageCsv("a", 500, totals));
    const p2 = parseGa4LandingCsv(pageCsv("b", 500, totals));
    const p3 = parseGa4LandingCsv(pageCsv("c", 200, totals));
    expect(findWindowConflict([p1, p2, p3])).toBeNull();
    expect(windowCompleteness([p1, p2, p3])).toMatchObject({ status: "complete", basis: "views", viewGap: 0, sessionGap: 0, dataRecords: 1200, allPagesFull: false });
    // 첫 두 페이지만 → 조회수 600 누락, 다음 시작 행 1001
    const short = windowCompleteness([p1, p2]);
    expect(short).toMatchObject({ status: "short", viewGap: 600, sessionGap: 400, nextStartRow: 1001, allPagesFull: true });
    // 반올림 1 까지는 완전으로 본다
    const off1 = parseGa4LandingCsv(pageCsv("a", 3, ",6,3,10"));
    expect(windowCompleteness([off1])).toMatchObject({ status: "complete", viewGap: 1 });
    const off2 = parseGa4LandingCsv(pageCsv("a", 3, ",6,3,11"));
    expect(windowCompleteness([off2]).status).toBe("short");
  });

  it("does not demand session equality — GA4 sessions are HLL++ estimates", () => {
    // 조회수는 맞고 세션 총계가 행 합보다 2% 크다 → 완전(세션은 참고만)
    const hll = parseGa4LandingCsv(pageCsv("a", 100, ",204,100,300"));
    expect(windowCompleteness([hll])).toMatchObject({ status: "complete", basis: "views", sessionGap: 4, viewGap: 0 });
    // 조회수 열이 없으면 세션으로 — 총계의 3.3% 까지는 근사 오차로 본다
    const noViews = (sessions: number, rows: number) =>
      parseGa4LandingCsv(
        ga4Csv(
          Array.from({ length: rows }, (_, i) => `/salary-db/x${i},10`),
          "방문 페이지 + 쿼리 문자열,세션수",
          `,${sessions}`,
        ),
      );
    expect(SESSION_HLL_TOLERANCE).toBeCloseTo(0.033);
    // 행 합 990, 허용 폭 ceil(1020 × 0.033) = 34
    expect(windowCompleteness([noViews(1020, 99)])).toMatchObject({ status: "complete", basis: "sessions", sessionGap: 30 });
    expect(windowCompleteness([noViews(1100, 99)])).toMatchObject({ status: "short", basis: "sessions", sessionGap: 110 });
    expect(windowCompleteness([noViews(900, 99)]).status).toBe("excess");
    // 세션 근사 대조로 '완전'이어도 모든 파일이 행 표시 값만큼 차 있으면 잘림 의심
    expect(windowCompleteness([noViews(1000, 100)])).toMatchObject({ status: "suspect", allPagesFull: true });
  });

  it("falls back to the row-limit rule without a totals row", () => {
    const full = parseGa4LandingCsv(pageCsv("a", 500, null));
    const rest = parseGa4LandingCsv(pageCsv("b", 37, null));
    expect(windowCompleteness([full])).toMatchObject({ status: "suspect", basis: null, nextStartRow: 501 });
    expect(windowCompleteness([full, rest])).toMatchObject({ status: "unknown", nextStartRow: 538 });
    // 다음 페이지가 0행(표 끝)이어도 끝을 본 것이다
    const empty = parseGa4LandingCsv(pageCsv("z", 0, null));
    expect(windowCompleteness([full, empty]).status).toBe("unknown");
    // 총계 행이 있는 파일이 하나라도 있으면 그 총계로 대조
    const withTotals = parseGa4LandingCsv(pageCsv("a", 500, ",1074,537,1611"));
    expect(windowCompleteness([withTotals, rest]).status).toBe("complete");
  });

  it("refuses overlapping start rows and totals from different windows", () => {
    const p1 = parseGa4LandingCsv(pageCsv("a", 500, ",1200,600,1800"));
    const overlap = parseGa4LandingCsv(ga4Csv(["/salary-db/a499,2,1,3", "/salary-db/b0,2,1,3"], undefined, ",1200,600,1800"));
    expect(findWindowConflict([p1, overlap])).toEqual({ kind: "overlap", rows: 1 });
    // 한 파일 안의 같은 원문 행은 겹침이 아니다(GA4 가 두 줄로 낸 경우)
    const same = parseGa4LandingCsv(ga4Csv(["/x,1,1,1", "/x,1,1,1"], undefined, ",2,2,2"));
    expect(findWindowConflict([same])).toBeNull();
    // 인코딩만 다른 원문은 다른 행(정규화 전 원문으로 본다)
    const enc = parseGa4LandingCsv(ga4Csv(["/salary-db/%EC%82%BC%EC%84%B1,1,1,1"], undefined, ",2,2,2"));
    const dec = parseGa4LandingCsv(ga4Csv(["/salary-db/삼성,1,1,1"], undefined, ",2,2,2"));
    expect(findWindowConflict([enc, dec])).toBeNull();
    const other = parseGa4LandingCsv(pageCsv("b", 10, ",99,50,150"));
    expect(findWindowConflict([p1, other])).toEqual({ kind: "totals-mismatch" });
  });

  it("marks the log line and never puts a path or slash in it", () => {
    const p = parseGa4LandingCsv(pageCsv("a", 500, ",1200,600,1800"));
    const check = windowCompleteness([p]);
    expect(completenessToken("28d", check)).toBe("불완전 28d 누락 조회수 300 세션 약 200");
    const r = panel(p.rows);
    const line = renderLogLine(r, null, { month: check });
    expect(line.split(" ; ")[1]).toBe("불완전 28d 누락 조회수 300 세션 약 200");
    expect(line).not.toMatch(/[/|]/);
    const unknown = windowCompleteness([parseGa4LandingCsv(pageCsv("a", 3, null))]);
    expect(completenessToken("7d", unknown)).toBe("총계없음 7d");
    expect(completenessToken("28d", windowCompleteness([parseGa4LandingCsv(pageCsv("a", 3, ",6,3,9"))]))).toBeNull();
    expect(renderLogLine(r, null, { month: windowCompleteness([parseGa4LandingCsv(pageCsv("a", 3, ",6,3,9"))]) })).not.toContain("불완전");
  });

  it("inspects a referrer export: totals row (both dimensions blank), repeated header, raw keys", () => {
    const text =
      "# REFERRER\r\n\r\n페이지 리퍼러,방문 페이지 + 쿼리 문자열,세션수,조회수\r\n" +
      ",,9,12\r\n" +
      "https://m.search.naver.com/search.naver?query=a,/job/professor,5,7\r\n" +
      ",/job/doctor,1,1\r\n" + // 리퍼러 없음(직접) — 총계 아님
      "페이지 리퍼러,방문 페이지 + 쿼리 문자열,세션수,조회수\r\n" +
      "https://www.moneysalary.com/job,/job/professor,3,4\r\n";
    const page: ExportPage = inspectReferrerCsv(text);
    expect(page).toMatchObject({ dataRecords: 3, dataSessions: 9, dataViews: 12, totals: { sessions: 9, views: 12 }, totalsRows: 1 });
    expect(windowCompleteness([page]).status).toBe("complete");
    expect(() => inspectReferrerCsv("세션수\n1\n")).toThrow(HeaderNotFoundError);
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
  const monthLines = [
    "/salary-db/a,10,6,20",
    "/salary-db/listed/005930,3,1,3",
    "/job/professor,7,5,9",
    "/job/doctor,2,1,2",
    "/home-loan,4,2,4",
    "/year-end-tax,8,4,16",
  ];
  // 총계 행 = 행 합(세션 34 · 참여 19 · 조회수 54) → 완전
  const month = ga4Csv(monthLines, undefined, ",34,19,54");
  const week = ga4Csv(["/salary-db/a,3,2,4", "/job/professor,1,1,1"], undefined, ",4,3,5");
  const referrerRows =
    `https://m.search.naver.com/search.naver?query=${encodeURIComponent("교수 연봉")}&sm=SECRETTOKEN,/job/professor,5,6\r\n` +
    `https://search.naver.com/search.naver?query=${encodeURIComponent("의사 연봉")},/job/doctor,2,2\r\n` +
    `https://search.naver.com/search.naver?query=${encodeURIComponent("삼성전자 연봉")},/salary-db/a,9,9\r\n`;
  const referrerHeader = "페이지 리퍼러,방문 페이지 + 쿼리 문자열,세션수,조회수\r\n";
  const referrer = `${referrerHeader},,16,17\r\n${referrerRows}`;
  const sitemapXml =
    "<urlset>" +
    ["/salary-db/a", "/salary-db/b", "/salary-db/listed/005930", "/job/professor", "/job/doctor", "/job/nurse", "/home-loan", "/year-end-tax"]
      .map((p) => `<url><loc>https://www.moneysalary.com${p}</loc></url>`)
      .join("") +
    "</urlset>";
  const files: Record<string, string> = {
    "/data/ga4-28d.csv": month,
    // 두 페이지로 나눠 받은 같은 창 — 두 파일 모두 표 전체 총계(35·20·55)를 싣는다
    "/data/ga4-28d-p1.csv": ga4Csv(monthLines, undefined, ",35,20,55"),
    "/data/ga4-28d-p2.csv": ga4Csv(["/fun/rank,1,1,1"], undefined, ",35,20,55"),
    "/data/ga4-28d-short.csv": ga4Csv(monthLines, undefined, ",40,22,70"),
    "/data/ga4-28d-nototals.csv": ga4Csv(monthLines, undefined, ""),
    "/data/ga4-28d-overlap.csv": ga4Csv(["/job/doctor,2,1,2", "/fun/rank,1,1,1"], undefined, ",34,19,54"),
    "/data/ga4-28d-otherwindow.csv": ga4Csv(["/fun/rank,1,1,1"], undefined, ",99,9,99"),
    "/data/ga4-7d.csv": week,
    "/data/ref.csv": referrer,
    "/data/ref-short.csv": `${referrerHeader},,50,60\r\n${referrerRows}`,
    "/data/ref-p2.csv": `${referrerHeader},,16,17\r\nhttps://search.naver.com/search.naver?query=${encodeURIComponent("의사 연봉")},/job/doctor,2,2\r\n`,
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
    expect(res.stdout).toContain("총계 대조(조회수 기준 ±1): 조회수 행 합 54 / 총계 54(누락 0)");
    expect(res.stdout).toContain("완전 — 총계와 행 합이 맞는다");
    expect(res.stdout).not.toContain("⚠ 불완전");
    expect(res.stderr).toBe("");
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
      ["/data/ga4-28d-p1.csv", "/data/ga4-28d-p2.csv", "--7d", "/data/ga4-7d.csv", "--sitemap", "/data/sitemap.xml", "--log-line"],
      io(),
    );
    expect(res.code).toBe(0);
    expect(res.stderr).toBe("");
    const lines = res.stdout.split("\n").filter(Boolean);
    expect(lines).toHaveLength(1);
    const line = lines[0];
    expect(line.split(" ; ")[1]).toBe("열=세션·페이지당·커버·7d"); // 완전하면 불완전 표시 칸이 없다
    expect(line).not.toMatch(/불완전|총계없음/);
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

  it("refuses the --log-line for an incomplete window (exit 3) unless --allow-incomplete, which marks the line", async () => {
    const refused = await runNaverTemplatePanelCli(["/data/ga4-28d-short.csv", "--7d", "/data/ga4-7d.csv", "--log-line"], io());
    expect(refused.code).toBe(3);
    expect(refused.stdout).toBe("");
    expect(refused.stderr).toContain("거부: 불완전한 창");
    expect(refused.stderr).toContain("28일: ⚠ 불완전");
    expect(refused.stderr).not.toContain("7일:");
    const allowed = await runNaverTemplatePanelCli(["/data/ga4-28d-short.csv", "--7d", "/data/ga4-7d.csv", "--log-line", "--allow-incomplete"], io());
    expect(allowed.code).toBe(0);
    expect(allowed.stderr).toContain("경고");
    const line = allowed.stdout.trim();
    expect(line.split(" ; ")[1]).toBe("불완전 28d 누락 조회수 16 세션 약 6");
    expect(line).not.toMatch(/[/|]/);
    // 총계 행이 없는 내보내기는 확인 불가 — 거부하지 않고 '총계없음' 표시
    const unknown = await runNaverTemplatePanelCli(["/data/ga4-28d-nototals.csv", "--log-line"], io());
    expect(unknown.code).toBe(0);
    expect(unknown.stdout).toContain(" ; 총계없음 28d ; ");
  });

  it("refuses overlapping start rows and files from another window, without printing any row", async () => {
    const overlap = await runNaverTemplatePanelCli(["/data/ga4-28d.csv", "/data/ga4-28d-overlap.csv"], io());
    expect(overlap.code).toBe(1);
    expect(overlap.stderr).toContain("같은 행 1개가 두 파일에 들어 있습니다(시작 행이 겹침)");
    expect(overlap.stderr).not.toContain("/job/doctor");
    const mixed = await runNaverTemplatePanelCli(["/data/ga4-28d.csv", "/data/ga4-28d-otherwindow.csv"], io());
    expect(mixed.code).toBe(1);
    expect(mixed.stderr).toContain("총계 행이 다릅니다");
    const refOverlap = await runNaverTemplatePanelCli(
      ["/data/ga4-28d.csv", "--slate", "/job/doctor", "--referrer", "/data/ref.csv", "--referrer", "/data/ref-p2.csv"],
      io(),
    );
    expect(refOverlap.code).toBe(1);
    expect(refOverlap.stderr).toContain("리퍼러: 같은 행 1개");
    expect(refOverlap.stderr).not.toMatch(/query=|search\.naver/);
  });

  it("flags an incomplete table view at the top and on stderr, but still prints it for review", async () => {
    const res = await runNaverTemplatePanelCli(["/data/ga4-28d-short.csv"], io());
    expect(res.code).toBe(0);
    expect(res.stdout).toContain("> ⚠ 불완전 입력(28일)");
    expect(res.stdout).toContain("⚠ 불완전 — 행이 빠졌다: 조회수 16 · 세션 약 6 누락");
    expect(res.stderr).toContain("경고: 불완전 입력(28일)");
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
    // 리퍼러도 총계 대조, REFERRER 탭 필터용 정규식
    expect(res.stdout).toContain("- 리퍼러 입력: 파일 1개 · 데이터 행 3");
    expect(res.stdout).toContain("총계 대조(조회수 기준 ±1): 조회수 행 합 17 / 총계 17(누락 0)");
    expect(res.stdout).toContain("`^/(job/professor|job/doctor|home-loan)/?(\\?.*)?$`");
    expect(res.stderr).toBe("");
  });

  it("warns when the referrer table is cut — '(검색어 없음)' may be truncation, not Naver", async () => {
    const res = await runNaverTemplatePanelCli(
      ["/data/ga4-28d.csv", "--slate", "/job/professor,/home-loan", "--referrer", "/data/ref-short.csv"],
      io(),
    );
    expect(res.code).toBe(0);
    expect(res.stdout).toContain("> ⚠ 불완전 입력(리퍼러)");
    expect(res.stdout).toContain("⚠ 불완전 — 행이 빠졌다: 조회수 43");
    expect(res.stdout).toContain("⚠ 잘린 리퍼러 표에서는 '(검색어 없음)'");
    expect(res.stderr).toContain("경고: 불완전 입력(리퍼러)");
    // 데이터 행이 GA4 '행 표시' 값만큼 차고 총계가 없으면 잘림 의심 — 다음 시작 행을 알려 준다
    const rows = Array.from({ length: 500 }, (_, i) => `https://search.naver.com/search.naver?query=q${i},/job/professor,1,1`).join("\r\n");
    const cut = await runNaverTemplatePanelCli(
      ["/data/ga4-28d.csv", "--slate", "/job/professor", "--referrer", "/data/ref500.csv"],
      io({ readText: (p) => (p === "/data/ref500.csv" ? `${referrerHeader}${rows}\r\n` : files[p]) }),
    );
    expect(cut.stdout).toContain("⚠ 불완전(잘림 의심)");
    expect(cut.stdout).toContain("GA4 '시작 행'을 501 로 바꿔");
  });

  it("builds an anchored GA4 filter regex for the slate (with the encoded form of Korean paths)", () => {
    const re = slateFilterRegex(["/job/professor", "/salary-db/삼성전자", "/a.b"]);
    expect(re).toBe("^/(job/professor|salary-db/삼성전자|salary-db/%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90|a\\.b)/?(\\?.*)?$");
    const rx = new RegExp(re);
    for (const ok of ["/job/professor", "/job/professor/", "/job/professor?n_media=27758", "/salary-db/%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90", "/a.b"]) expect(rx.test(ok)).toBe(true);
    for (const no of ["/job/professors", "/x/job/professor", "/job/professor/extra", "/axb"]) expect(rx.test(no)).toBe(false);
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

  it("warns when every file's row count equals a GA4 'show rows' value and no totals row can settle it", async () => {
    const ten = ga4Csv(
      Array.from({ length: 10 }, (_, i) => `/salary-db/c${i},1,1,1`),
      undefined,
      "",
    );
    const res = await runNaverTemplatePanelCli(["/data/ten.csv"], io({ readText: () => ten }));
    expect(GA4_ROW_LIMITS).toContain(10);
    expect(res.stdout).toContain("⚠ 불완전(잘림 의심)");
    expect(res.stdout).toContain("GA4 '시작 행'을 11 로 바꿔");
    // 두 번째 500행 페이지 뒤에는 1001 을 알려 준다(늘 501 이 아니다)
    const pages: Record<string, string> = {
      "/data/p1.csv": ga4Csv(Array.from({ length: 500 }, (_, i) => `/salary-db/a${i},1,1,1`), undefined, ""),
      "/data/p2.csv": ga4Csv(Array.from({ length: 500 }, (_, i) => `/salary-db/b${i},1,1,1`), undefined, ""),
    };
    const two = await runNaverTemplatePanelCli(["/data/p1.csv", "/data/p2.csv"], io({ readText: (p) => pages[p] }));
    expect(two.stdout).toContain("GA4 '시작 행'을 1001 로 바꿔");
    const refused = await runNaverTemplatePanelCli(["/data/p1.csv", "/data/p2.csv", "--log-line"], io({ readText: (p) => pages[p] }));
    expect(refused.code).toBe(3);
    // 행 수가 한도와 같아도 총계와 맞으면 잘리지 않은 것이다
    const exact = ga4Csv(
      Array.from({ length: 10 }, (_, i) => `/salary-db/c${i},1,1,1`),
      undefined,
      ",10,10,10",
    );
    const ok = await runNaverTemplatePanelCli(["/data/ten.csv"], io({ readText: () => exact }));
    expect(ok.stdout).toContain("총계와 맞으므로 잘리지 않았다");
    expect(ok.stdout).not.toContain("⚠");
  });
});

describe("parsePanelArgs / parseSlate", () => {
  it("parses repeated windows, = forms and the slate list", () => {
    const r = parsePanelArgs(["a.csv", "b.csv", "--7d=w.csv", "--7d", "w2.csv", "--sitemap", "s.xml", "--slate", "/job/professor/, /home-loan ,/job/professor"]);
    expect(r).toEqual({
      ok: true,
      args: {
        files: ["a.csv", "b.csv"],
        weekFiles: ["w.csv", "w2.csv"],
        sitemap: "s.xml",
        referrers: [],
        slate: ["/job/professor", "/home-loan"],
        logLine: false,
        allowIncomplete: false,
      },
    });
    const refs = parsePanelArgs(["a.csv", "--slate", "/x", "--referrer", "r1.csv", "--referrer=r2.csv"]);
    expect(refs.ok && refs.args.referrers).toEqual(["r1.csv", "r2.csv"]);
    const allow = parsePanelArgs(["a.csv", "--log-line", "--allow-incomplete"]);
    expect(allow.ok && allow.args.allowIncomplete).toBe(true);
    for (const bad of [
      ["a.csv", "--top", "5"],
      ["a.csv", "--slate", "job/x"],
      ["a.csv", "--sitemap"],
      ["a.csv", "--slate", "/a", "--slate", "/b"],
      ["a.csv", "--allow-incomplete"],
    ]) {
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
