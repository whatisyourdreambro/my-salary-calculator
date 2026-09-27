// src/lib/naverTemplatePanel.ts
//
// 네이버 템플릿 패널(R6-05) — GA4 'NAVER-PANEL' 탐색 CSV(방문 페이지 × 네이버 검색 세션)를
// 템플릿별·주제 클러스터별로 묶는 순수 집계 모듈.
//
// ★로컬 분석 도구 전용 — 어떤 페이지·컴포넌트도 import 하지 않는다(빌드·런타임 영향 0, 테스트가 grep 으로 고정).
//   CLI: scripts/naver-template-panel.ts (npx tsx). 파일 쓰기·데이터 내장 없음, 결과는 stdout 뿐.
// ★템플릿 = destTemplate(analytics.ts, 읽기 전용 import)의 17값을 '세분화'만 한다. DEST_TEMPLATES 는 절대 고치지 않는다
//   (GA4 dest_tpl 과거 행과 이어지지 않게 된다). 모든 세분값은 PARENT 로 정확히 하나의 DEST_TEMPLATES 값에 돌아간다.
// ★주제 클러스터(topicCluster)는 템플릿과 별개 축이다 — 템플릿 표에 섞지 않고 따로 보고한다.
// ★개인정보: 집계값만 출력한다. 한 줄 로그(renderLogLine)에는 URL·경로를 넣지 않는다.
// ★CSV 파서·방문 페이지 정규화·리퍼러 집계는 naverReferrerQueries.ts 를 재사용한다(그 파일은 수정하지 않는다).
// 운영 절차·사전 등록 판독: docs/naver-template-panel.md

import nodePath from "node:path";

import { destTemplate, type DestTemplate } from "./analytics";
import {
  aggregateNaverRows,
  compareCodeUnits,
  HeaderNotFoundError,
  isPathInside,
  normalizeLanding,
  parseCsv,
  parseGa4NaverExport,
  sanitizeForTerminal,
  type NaverReport,
} from "./naverReferrerQueries";

// ─────────────────────────────────────────────────────────────
// 템플릿 세분화
// ─────────────────────────────────────────────────────────────

/**
 * 패널 템플릿 — DEST_TEMPLATES 17값 그대로 + 세분값 10개.
 *   company → company | lite
 *   calc    → calc | yearend-calc
 *   other   → yearend | rollover | pay-military | home-loan | insights | fun | en | other
 * 새 값은 뒤에만 추가한다(주간 기록의 열 순서가 이 순서다).
 */
export const LANDING_TEMPLATES = [
  "company",
  "lite",
  "compare",
  "salary-db-hub",
  "ranking",
  "job",
  "job-hub",
  "bonus-calc",
  "samsung-bonus",
  "calc",
  "yearend-calc",
  "salary-amount",
  "monthly",
  "pay-table",
  "table",
  "guide",
  "industry",
  "home",
  "yearend",
  "rollover",
  "pay-military",
  "home-loan",
  "insights",
  "fun",
  "en",
  "other",
] as const;
export type LandingTemplate = (typeof LANDING_TEMPLATES)[number];

/** 세분값 → 상위 DEST_TEMPLATES 값. DEST_TEMPLATES 값 자신은 자기 자신으로 돌아간다. */
export const PARENT: Readonly<Record<LandingTemplate, DestTemplate>> = {
  company: "company",
  lite: "company",
  compare: "compare",
  "salary-db-hub": "salary-db-hub",
  ranking: "ranking",
  job: "job",
  "job-hub": "job-hub",
  "bonus-calc": "bonus-calc",
  "samsung-bonus": "samsung-bonus",
  calc: "calc",
  "yearend-calc": "calc",
  "salary-amount": "salary-amount",
  monthly: "monthly",
  "pay-table": "pay-table",
  table: "table",
  guide: "guide",
  industry: "industry",
  home: "home",
  yearend: "other",
  rollover: "other",
  "pay-military": "other",
  "home-loan": "other",
  insights: "other",
  fun: "other",
  en: "other",
  other: "other",
};

/**
 * 연말정산 시즌 /calc 계산기(연말정산 시즌 제목·계측 배선 대상 4쪽 중 destTemplate 이 calc 인 3쪽).
 * /calc/january-bonus(13월의 월급 시뮬레이터)는 destTemplate 이 bonus-calc 라 템플릿은 bonus-calc 로 두고
 * (PARENT 일관성), 주제 클러스터에서만 yearend 로 센다.
 */
export const YEAREND_CALC_SLUGS: readonly string[] = ["child-deduction", "dependent-check", "dual-income-year-end"];
const YEAREND_SEASON_BONUS_CALC = "january-bonus";

const SITE_HOSTS = new Set(["www.moneysalary.com", "moneysalary.com"]);

/**
 * destTemplate 과 같은 규칙으로 경로를 뽑는다: 공백·해시·쿼리 제거, 같은 사이트 절대 URL(프로토콜 상대 포함)은 경로만,
 * 다른 도메인·상대 경로·빈 값·자리표시자('(not set)')는 null, 끝 슬래시 무시(루트는 '/').
 */
export function sitePath(href: string): string | null {
  let path = (href ?? "").trim().split("#")[0].split("?")[0];
  if (/^(https?:)?\/\//i.test(path)) {
    try {
      const url = new URL(path, "https://www.moneysalary.com");
      if (!SITE_HOSTS.has(url.hostname.toLowerCase())) return null;
      path = url.pathname;
    } catch {
      return null;
    }
  }
  if (!path.startsWith("/")) return null;
  return path.replace(/\/+$/, "") || "/";
}

const LITE_RE = /^\/salary-db\/listed\/\d{6}(\/|$)/;
const YEAREND_CALC_RE = new RegExp(`^/calc/(${YEAREND_CALC_SLUGS.join("|")})(/|$)`);
/** /year-end-tax* · 연말정산 정밀 계산기 4쪽(신용카드 소득공제·의료비·월세·기부금, 연도 꼬리 4자리). */
const YEAREND_PAGE_RE =
  /^\/(year-end-tax[a-z0-9-]*|credit-card-deduction-\d{4}|(medical|rent|donation)-tax-credit-\d{4})(\/|$)/;
/** 연도 전환 계열: 4대보험 요율·최저임금·실업급여·주휴수당. */
const ROLLOVER_RE =
  /^\/(social-insurance-rates-[a-z0-9-]+|minimum-wage-[a-z0-9-]+|unemployment-benefit|weekly-holiday-allowance-\d{4})(\/|$)/;
const MILITARY_RE = /^\/military-pay-[a-z0-9-]+(\/|$)/;
const HOME_LOAN_RE = /^\/home-loan(\/|$)/;
const INSIGHTS_RE = /^\/insights(\/|$)/;
const FUN_RE = /^\/fun(\/|$)/;
const EN_RE = /^\/en(\/|$)/;

function refineOther(path: string | null): LandingTemplate {
  if (path === null) return "other";
  if (YEAREND_PAGE_RE.test(path)) return "yearend";
  if (ROLLOVER_RE.test(path)) return "rollover";
  if (MILITARY_RE.test(path)) return "pay-military";
  if (HOME_LOAN_RE.test(path)) return "home-loan";
  if (INSIGHTS_RE.test(path)) return "insights";
  if (FUN_RE.test(path)) return "fun";
  if (EN_RE.test(path)) return "en";
  return "other";
}

/**
 * 방문 페이지 → 패널 템플릿. destTemplate(읽기 전용)을 먼저 부르고, 그 결과 안에서만 세분화한다 —
 * 그래서 PARENT[landingTemplate(p)] === destTemplate(p) 가 항상 성립한다(테스트가 200경로 이상으로 고정).
 */
export function landingTemplate(href: string): LandingTemplate {
  const parent = destTemplate(href);
  const path = sitePath(href);
  switch (parent) {
    case "company":
      return path !== null && LITE_RE.test(path) ? "lite" : "company";
    case "calc":
      return path !== null && YEAREND_CALC_RE.test(path) ? "yearend-calc" : "calc";
    case "other":
      return refineOther(path);
    default:
      return parent;
  }
}

// ─────────────────────────────────────────────────────────────
// 주제 클러스터 (템플릿과 별개 축)
// ─────────────────────────────────────────────────────────────

export const TOPIC_CLUSTERS = ["company", "bonus", "paytables", "yearend", "rollover", "job", "home-loan", "other"] as const;
export type TopicCluster = (typeof TOPIC_CLUSTERS)[number];

const CLUSTER_COMPANY_RE = /^\/(salary-db|company|industry|public-institutions)(\/|$)/;
const CLUSTER_YEAREND_CALC_RE = new RegExp(`^/calc/(${[...YEAREND_CALC_SLUGS, YEAREND_SEASON_BONUS_CALC].join("|")})(/|$)`);
const CLUSTER_BONUS_CALC_RE = /^\/calc\/([a-z0-9-]+-bonus|bonus-calculators|year-end-bonus-tax|incentive-tax)(\/|$)/;
const CLUSTER_BONUS_PAGE_RE = /^\/(samsung-negotiation-\d{4}|[a-z0-9-]*bonus[a-z0-9-]*)(\/|$)/;
const CLUSTER_PAYTABLE_RE = /^\/(teacher|police|firefighter|civil-servant|military)-pay-[a-z0-9-]+(\/|$)/;
const CLUSTER_JOB_RE = /^\/job(\/|$)/;
/** /guides/<slug> 는 slug 키워드로 근사 분류한다(위에서부터 먼저 맞는 것). */
const GUIDE_SLUG_RULES: readonly [RegExp, TopicCluster][] = [
  [/year-end-tax|hometax-year-end|yearend|deduction|tax-credit|tax-refund/, "yearend"],
  [/bonus|incentive|performance-pay/, "bonus"],
  [/(teacher|police|firefighter|civil-servant|military)-pay/, "paytables"],
  [/minimum-wage|unemployment|insurance-rates|weekly-holiday/, "rollover"],
];

/**
 * 방문 페이지 → 주제 클러스터. 템플릿(landingTemplate)을 부르지 않는 독립 규칙이다 —
 * 예: /calc/january-bonus 는 템플릿 bonus-calc · 클러스터 yearend, /guides/* 는 템플릿 guide · 클러스터는 slug 키워드.
 * /en/* 는 주제와 무관하게 other(영문판은 네이버 유입 계열이 아니다).
 */
export function topicCluster(href: string): TopicCluster {
  const path = sitePath(href);
  if (path === null || EN_RE.test(path)) return "other";
  if (CLUSTER_COMPANY_RE.test(path)) return "company";
  if (YEAREND_PAGE_RE.test(path) || CLUSTER_YEAREND_CALC_RE.test(path)) return "yearend";
  if (CLUSTER_BONUS_CALC_RE.test(path) || CLUSTER_BONUS_PAGE_RE.test(path)) return "bonus";
  if (CLUSTER_PAYTABLE_RE.test(path)) return "paytables";
  if (ROLLOVER_RE.test(path)) return "rollover";
  if (CLUSTER_JOB_RE.test(path)) return "job";
  if (HOME_LOAN_RE.test(path)) return "home-loan";
  const guide = /^\/guides\/([^/]+)/.exec(path);
  if (guide) {
    for (const [re, cluster] of GUIDE_SLUG_RULES) if (re.test(guide[1])) return cluster;
  }
  return "other";
}

// ─────────────────────────────────────────────────────────────
// GA4 방문 페이지 CSV
// ─────────────────────────────────────────────────────────────

const normalizeHeader = (h: string) => h.replace(/^\uFEFF/, "").normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();

/** 열 이름 별칭 — 완전 일치만(부분 일치면 '참여 세션수'를 '세션수'로 잘못 집는다). */
const HEADER_ALIASES = {
  landing: ["방문 페이지 + 쿼리 문자열", "landing page + query string", "방문 페이지", "landing page"],
  sessions: ["세션수", "세션", "sessions"],
  engaged: ["참여 세션수", "engaged sessions"],
  views: ["조회수", "views"],
  source: ["세션 소스", "session source", "세션 소스/매체", "세션 소스 / 매체", "session source / medium", "session source/medium"],
  /** 있으면 리퍼러 내보내기(행마다 리퍼러가 달라 네이버 여부를 모름) — 패널 입력으로 받지 않는다. */
  referrer: ["페이지 리퍼러", "page referrer"],
} as const;

const LANDING_HEADER_SET = new Set<string>(HEADER_ALIASES.landing);

/** 네이버 '검색' 세션으로 세는 세션 소스(소스/매체 열이면 ' / ' 앞부분). 블로그·카페·포털 메인은 제외해 따로 센다. */
export const NAVER_SEARCH_SOURCES: ReadonlySet<string> = new Set(["naver", "m.search.naver.com", "search.naver.com"]);

/** 총계 행으로 보는 방문 페이지 칸(빈 칸 포함). */
const TOTALS_LABELS = new Set(["", "총계", "합계", "총합계", "전체", "total", "totals", "grand total"]);

/** GA4 탐색 '행 표시' 선택지 — 데이터 행 수가 이 값과 같으면 잘렸을 수 있다고 알린다. */
export const GA4_ROW_LIMITS: readonly number[] = [10, 25, 50, 100, 250, 500];

export interface LandingColumns {
  landing: number;
  sessions: number;
  engaged: number | null;
  views: number | null;
  source: number | null;
  referrer: number | null;
}

function indexOfAlias(header: string[], aliases: readonly string[]): number {
  for (const alias of aliases) {
    const i = header.indexOf(alias);
    if (i >= 0) return i;
  }
  return -1;
}

/** 필수 열(방문 페이지·세션수)을 모두 가진 첫 레코드를 헤더로 본다. */
export function findLandingHeader(records: string[][]): { index: number; columns: LandingColumns } | null {
  for (let r = 0; r < records.length; r++) {
    const header = records[r].map(normalizeHeader);
    const landing = indexOfAlias(header, HEADER_ALIASES.landing);
    const sessions = indexOfAlias(header, HEADER_ALIASES.sessions);
    if (landing < 0 || sessions < 0) continue;
    const opt = (aliases: readonly string[]) => {
      const i = indexOfAlias(header, aliases);
      return i >= 0 ? i : null;
    };
    return {
      index: r,
      columns: {
        landing,
        sessions,
        engaged: opt(HEADER_ALIASES.engaged),
        views: opt(HEADER_ALIASES.views),
        source: opt(HEADER_ALIASES.source),
        referrer: opt(HEADER_ALIASES.referrer),
      },
    };
  }
  return null;
}

function toNumber(value: string | undefined): number {
  const n = Number(String(value ?? "").replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export interface LandingRow {
  /** normalizeLanding 결과(쿼리·해시 제거, 퍼센트 디코딩, NFC, 끝 슬래시 제거). 자리표시자는 '(not set)'·'(other)'. */
  landing: string;
  sessions: number;
  engagedSessions: number;
  views: number;
}

export interface ParsedLandingExport {
  rows: LandingRow[];
  /** 헤더 뒤 데이터 레코드 수(총계·반복 헤더 제외, 소스 필터 전). GA4 행 한도 경고에 쓴다. */
  dataRecords: number;
  totalsRows: number;
  hasEngaged: boolean;
  hasViews: boolean;
  hasSource: boolean;
  /** 소스 열이 있을 때: 네이버 검색 외 네이버 소스(블로그·카페·포털 메인 등)라 뺀 세션. */
  naverOtherSessions: number;
  /** 소스 열이 있을 때: 네이버가 아닌 소스라 뺀 행 수. */
  nonNaverRows: number;
  /** GA4 카디널리티 초과 '(other)' 행이 있었나(있으면 URL 수·커버리지가 과소 추정된다). */
  hasOtherRow: boolean;
}

/** 리퍼러 × 방문 페이지 내보내기를 패널 입력으로 넣었을 때 — 네이버 외 리퍼러까지 네이버로 세게 된다. */
export class ReferrerExportError extends Error {
  constructor() {
    super("referrer-export");
    this.name = "ReferrerExportError";
  }
}

/**
 * GA4 탐색 CSV → 네이버 검색 방문 페이지 행. BOM·'#' 주석 블록(파일 어디에 있든)·빈 줄은 parseCsv 가 건너뛰고,
 * 총계 행(방문 페이지 칸이 비었거나 '총계'·'Totals' 등)과 반복 헤더 행은 여기서 버린다.
 * 소스 열이 있으면 NAVER_SEARCH_SOURCES 행만 남기고, 없으면 탐색 필터가 이미 네이버 검색으로 걸렸다고 본다.
 * 헤더를 못 찾으면 HeaderNotFoundError(naverReferrerQueries 와 같은 오류형), '페이지 리퍼러' 열이 있으면 ReferrerExportError.
 */
export function parseGa4LandingCsv(text: string): ParsedLandingExport {
  const records = parseCsv(text);
  const found = findLandingHeader(records);
  if (!found) throw new HeaderNotFoundError(records[0] ?? []);
  const { columns } = found;
  if (columns.referrer !== null) throw new ReferrerExportError();
  const rows: LandingRow[] = [];
  let dataRecords = 0;
  let totalsRows = 0;
  let naverOtherSessions = 0;
  let nonNaverRows = 0;
  let hasOtherRow = false;
  for (const cells of records.slice(found.index + 1)) {
    const rawLanding = (cells[columns.landing] ?? "").trim();
    const label = normalizeHeader(rawLanding);
    if (LANDING_HEADER_SET.has(label)) continue; // 여러 표를 이어 붙인 내보내기의 반복 헤더
    if (TOTALS_LABELS.has(label)) {
      totalsRows++;
      continue;
    }
    dataRecords++;
    const sessions = toNumber(cells[columns.sessions]);
    if (columns.source !== null) {
      const source = (cells[columns.source] ?? "").trim().toLowerCase().split(" / ")[0].trim();
      if (!NAVER_SEARCH_SOURCES.has(source)) {
        if (source.includes("naver")) naverOtherSessions += sessions;
        else nonNaverRows++;
        continue;
      }
    }
    const landing = normalizeLanding(rawLanding);
    if (landing === "(other)") hasOtherRow = true;
    rows.push({
      landing,
      sessions,
      engagedSessions: columns.engaged === null ? 0 : toNumber(cells[columns.engaged]),
      views: columns.views === null ? 0 : toNumber(cells[columns.views]),
    });
  }
  return {
    rows,
    dataRecords,
    totalsRows,
    hasEngaged: columns.engaged !== null,
    hasViews: columns.views !== null,
    hasSource: columns.source !== null,
    naverOtherSessions,
    nonNaverRows,
    hasOtherRow,
  };
}

// ─────────────────────────────────────────────────────────────
// 사이트맵
// ─────────────────────────────────────────────────────────────

const XML_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decodeXmlText(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m;
    }
    return XML_ENTITIES[body.toLowerCase()] ?? m;
  });
}

export interface ParsedSitemap {
  /** 'index' 면 locs 는 하위 사이트맵 주소다. */
  kind: "urlset" | "index" | "text";
  locs: string[];
}

/** 사이트맵 XML(<loc>) 또는 줄마다 URL·경로 하나인 텍스트 목록을 읽는다. */
export function parseSitemap(text: string): ParsedSitemap {
  const src = text.replace(/^\uFEFF/, "");
  const locs: string[] = [];
  const re = /<loc>\s*([^<]*?)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) locs.push(decodeXmlText(m[1]));
  if (/<sitemapindex[\s>]/i.test(src)) return { kind: "index", locs };
  if (locs.length || /<urlset[\s>]/i.test(src)) return { kind: "urlset", locs };
  const lines = src
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith("/") || /^https?:\/\//i.test(l));
  return { kind: "text", locs: lines };
}

/** 사이트맵 주소 목록 → 이 사이트의 정규화된 경로 집합(다른 도메인은 버린다). */
export function sitemapPathsFromLocs(locs: string[]): string[] {
  const out = new Set<string>();
  for (const loc of locs) {
    if (/^(https?:)?\/\//i.test(loc.trim())) {
      try {
        const host = new URL(loc.trim(), "https://www.moneysalary.com").hostname.toLowerCase();
        if (!SITE_HOSTS.has(host)) continue;
      } catch {
        continue;
      }
    }
    const p = normalizeLanding(loc);
    if (p.startsWith("/")) out.add(p);
  }
  return [...out];
}

// ─────────────────────────────────────────────────────────────
// 패널 집계
// ─────────────────────────────────────────────────────────────

/** 상위 몇 개 URL 을 '머리'로 보고 나머지를 롱테일로 셀지(판독 (e)). */
export const LONG_TAIL_HEAD = 30;

export interface TemplateStat {
  template: LandingTemplate;
  parent: DestTemplate;
  sessions: number;
  engagedSessions: number;
  views: number;
  /** 네이버 세션이 1 이상인 고유 URL 수(자리표시자 제외). */
  urls: number;
  /** sessions ÷ urls — urls 0 이면 null. */
  sessionsPerPage: number | null;
  /** 사이트맵에 있는 이 템플릿 URL 수 — 사이트맵을 안 줬으면 null. */
  sitemapUrls: number | null;
  /** 그중 네이버 세션이 1 이상인 URL 수 — 사이트맵을 안 줬으면 null. */
  coveredUrls: number | null;
  /** coveredUrls ÷ sitemapUrls — 사이트맵 미지정·사이트맵 URL 0 이면 null. */
  coverage: number | null;
}

export interface ClusterStat {
  cluster: TopicCluster;
  sessions: number;
  engagedSessions: number;
  views: number;
  urls: number;
}

export interface PanelResult {
  templates: TemplateStat[];
  clusters: ClusterStat[];
  totals: {
    sessions: number;
    engagedSessions: number;
    views: number;
    urls: number;
    /** '(not set)'·'(other)' 같은 자리표시자 행 세션(템플릿·클러스터 other 에 포함, URL 수에서는 제외). */
    placeholderSessions: number;
    /** 네이버 세션 상위 LONG_TAIL_HEAD 개 URL 을 뺀 나머지 URL 의 세션 합. */
    longTailSessions: number;
    sitemapUrls: number | null;
    coveredUrls: number | null;
    coverage: number | null;
    /** 네이버 세션은 있는데 사이트맵에 없는 URL 수(옛 주소·리디렉트 등 — 커버리지 분자에서 뺀다). */
    outsideSitemapUrls: number | null;
  };
}

const isPlaceholder = (landing: string) => !landing.startsWith("/");

/**
 * 템플릿별 세션·참여 세션·조회수·고유 URL·세션/페이지, 사이트맵을 주면 커버리지(= 그 템플릿 사이트맵 URL 중
 * 네이버 세션 1 이상인 URL ÷ 그 템플릿 사이트맵 URL). 클러스터는 같은 행을 topicCluster 로 따로 묶는다.
 * templates·clusters 는 LANDING_TEMPLATES·TOPIC_CLUSTERS 순서의 전체 목록(0 행 포함)이다.
 */
export function panel(rows: LandingRow[], sitemapPaths?: string[]): PanelResult {
  const byUrl = new Map<string, { sessions: number; engagedSessions: number; views: number }>();
  const tpl = new Map<LandingTemplate, { sessions: number; engagedSessions: number; views: number; urls: Set<string> }>();
  const cls = new Map<TopicCluster, { sessions: number; engagedSessions: number; views: number; urls: Set<string> }>();
  for (const t of LANDING_TEMPLATES) tpl.set(t, { sessions: 0, engagedSessions: 0, views: 0, urls: new Set() });
  for (const c of TOPIC_CLUSTERS) cls.set(c, { sessions: 0, engagedSessions: 0, views: 0, urls: new Set() });

  let placeholderSessions = 0;
  for (const row of rows) {
    const t = tpl.get(landingTemplate(row.landing))!;
    const c = cls.get(topicCluster(row.landing))!;
    for (const acc of [t, c]) {
      acc.sessions += row.sessions;
      acc.engagedSessions += row.engagedSessions;
      acc.views += row.views;
    }
    if (isPlaceholder(row.landing)) {
      placeholderSessions += row.sessions;
      continue;
    }
    const u = byUrl.get(row.landing) ?? { sessions: 0, engagedSessions: 0, views: 0 };
    u.sessions += row.sessions;
    u.engagedSessions += row.engagedSessions;
    u.views += row.views;
    byUrl.set(row.landing, u);
  }
  const visited = new Set([...byUrl.entries()].filter(([, v]) => v.sessions > 0).map(([k]) => k));
  for (const url of visited) {
    tpl.get(landingTemplate(url))!.urls.add(url);
    cls.get(topicCluster(url))!.urls.add(url);
  }

  let sitemapByTpl: Map<LandingTemplate, { total: number; covered: number }> | null = null;
  let sitemapTotal: number | null = null;
  let coveredTotal: number | null = null;
  let outsideSitemapUrls: number | null = null;
  if (sitemapPaths) {
    const sitemap = new Set(sitemapPathsFromLocs(sitemapPaths));
    sitemapByTpl = new Map();
    for (const t of LANDING_TEMPLATES) sitemapByTpl.set(t, { total: 0, covered: 0 });
    for (const p of sitemap) {
      const s = sitemapByTpl.get(landingTemplate(p))!;
      s.total++;
      if (visited.has(p)) s.covered++;
    }
    sitemapTotal = sitemap.size;
    coveredTotal = [...sitemap].filter((p) => visited.has(p)).length;
    outsideSitemapUrls = [...visited].filter((u) => !sitemap.has(u)).length;
  }

  const templates: TemplateStat[] = LANDING_TEMPLATES.map((template) => {
    const v = tpl.get(template)!;
    const sm = sitemapByTpl?.get(template) ?? null;
    return {
      template,
      parent: PARENT[template],
      sessions: v.sessions,
      engagedSessions: v.engagedSessions,
      views: v.views,
      urls: v.urls.size,
      sessionsPerPage: v.urls.size > 0 ? v.sessions / v.urls.size : null,
      sitemapUrls: sm ? sm.total : null,
      coveredUrls: sm ? sm.covered : null,
      coverage: sm && sm.total > 0 ? sm.covered / sm.total : null,
    };
  });
  const clusters: ClusterStat[] = TOPIC_CLUSTERS.map((cluster) => {
    const v = cls.get(cluster)!;
    return { cluster, sessions: v.sessions, engagedSessions: v.engagedSessions, views: v.views, urls: v.urls.size };
  });

  const ranked = [...byUrl.entries()]
    .filter(([, v]) => v.sessions > 0)
    .sort((a, b) => b[1].sessions - a[1].sessions || compareCodeUnits(a[0], b[0]));
  const longTailSessions = ranked.slice(LONG_TAIL_HEAD).reduce((sum, [, v]) => sum + v.sessions, 0);

  const sum = (key: "sessions" | "engagedSessions" | "views") => rows.reduce((s, r) => s + r[key], 0);
  return {
    templates,
    clusters,
    totals: {
      sessions: sum("sessions"),
      engagedSessions: sum("engagedSessions"),
      views: sum("views"),
      urls: visited.size,
      placeholderSessions,
      longTailSessions,
      sitemapUrls: sitemapTotal,
      coveredUrls: coveredTotal,
      coverage: sitemapTotal !== null && sitemapTotal > 0 && coveredTotal !== null ? coveredTotal / sitemapTotal : null,
      outsideSitemapUrls,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// 슬레이트 (지정 경로만)
// ─────────────────────────────────────────────────────────────

/** 슬레이트 최대 경로 수 — 슬레이트는 '고른 몇 쪽'이지 전체 목록이 아니다. */
export const MAX_SLATE = 20;
/** 슬레이트 경로마다 보여 줄 상위 검색어 수. */
export const SLATE_TOP_QUERIES = 10;

/** '--slate a,b,c' → 정규화된 경로 목록(중복 제거, 입력 순서 유지). 경로가 아니거나 너무 많으면 오류 문자열. */
export function parseSlate(value: string): { ok: true; paths: string[] } | { ok: false; error: string } {
  const parts = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parts.length) return { ok: false, error: "--slate 에 경로가 없습니다." };
  const paths: string[] = [];
  for (const part of parts) {
    if (!part.startsWith("/")) return { ok: false, error: `--slate 경로는 '/'로 시작해야 합니다: ${sanitizeForTerminal(part.slice(0, 60))}` };
    const p = normalizeLanding(part);
    if (!paths.includes(p)) paths.push(p);
  }
  if (paths.length > MAX_SLATE) return { ok: false, error: `--slate 는 최대 ${MAX_SLATE}쪽입니다(${paths.length}쪽 지정).` };
  return { ok: true, paths };
}

export interface SlateLandingStat {
  landing: string;
  sessions: number;
  engagedSessions: number;
  views: number;
}

/** 방문 페이지 CSV 에서 슬레이트 경로의 네이버 세션만(판독 (a) TOP30 밖 페이지·(f) 합병 회사 페이지). */
export function slateLandingStats(rows: LandingRow[], slate: string[]): SlateLandingStat[] {
  return slate.map((landing) => {
    const acc = { landing, sessions: 0, engagedSessions: 0, views: 0 };
    for (const r of rows) {
      if (r.landing !== landing) continue;
      acc.sessions += r.sessions;
      acc.engagedSessions += r.engagedSessions;
      acc.views += r.views;
    }
    return acc;
  });
}

export interface SlateReferrer {
  /** 슬레이트 경로별 네이버 검색 리퍼러 세션·검색어 확인 세션·커버리지(naverReferrerQueries 집계 그대로). */
  landings: { landing: string; naverSessions: number; querySessions: number; coverage: number | null }[];
  /** 슬레이트 경로의 (검색어, 방문 페이지) 행 — 경로마다 상위 SLATE_TOP_QUERIES 개. */
  pairs: { landing: string; query: string; sessions: number; views: number }[];
}

/** naverReferrerQueries 집계 결과에서 슬레이트 경로 행만 고른다(그 밖의 경로·리퍼러 원문은 버린다). */
export function slateReferrer(report: NaverReport, slate: string[]): SlateReferrer {
  const landings = slate.map((landing) => {
    const l = report.landings.find((x) => x.landing === landing);
    return { landing, naverSessions: l?.naverSessions ?? 0, querySessions: l?.querySessions ?? 0, coverage: l ? l.coverage : null };
  });
  const pairs: SlateReferrer["pairs"] = [];
  for (const landing of slate) {
    report.pairs
      .filter((p) => p.landing === landing)
      .slice(0, SLATE_TOP_QUERIES)
      .forEach((p) => pairs.push({ landing, query: p.query, sessions: p.sessions, views: p.views }));
  }
  return { landings, pairs };
}

// ─────────────────────────────────────────────────────────────
// 출력
// ─────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
const pct = (r: number | null) => (r === null ? "-" : `${(r * 100).toFixed(1)}%`);
const num = (n: number | null) => (n === null ? "-" : fmt(n));
/** 표 셀 이스케이프 — naverReferrerQueries 의 셀 규칙과 같다(제어 문자 치환, \ | [ ] < 이스케이프). */
const cell = (s: string) =>
  sanitizeForTerminal(s.replace(/\r?\n|\r/g, " "))
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/</g, "&lt;");

export interface PanelInputSummary {
  files: number;
  dataRecords: number;
  totalsRows: number;
  hasSource: boolean;
  hasEngaged: boolean;
  hasViews: boolean;
  naverOtherSessions: number;
  nonNaverRows: number;
  hasOtherRow: boolean;
  /** 데이터 행 수가 GA4 '행 표시' 값과 같은 파일 수. */
  rowLimitHits: number;
}

export function summarizeInputs(parsed: ParsedLandingExport[]): PanelInputSummary {
  return {
    files: parsed.length,
    dataRecords: parsed.reduce((s, p) => s + p.dataRecords, 0),
    totalsRows: parsed.reduce((s, p) => s + p.totalsRows, 0),
    hasSource: parsed.every((p) => p.hasSource),
    hasEngaged: parsed.every((p) => p.hasEngaged),
    hasViews: parsed.every((p) => p.hasViews),
    naverOtherSessions: parsed.reduce((s, p) => s + p.naverOtherSessions, 0),
    nonNaverRows: parsed.reduce((s, p) => s + p.nonNaverRows, 0),
    hasOtherRow: parsed.some((p) => p.hasOtherRow),
    rowLimitHits: parsed.filter((p) => GA4_ROW_LIMITS.includes(p.dataRecords)).length,
  };
}

export interface RenderOptions {
  input: PanelInputSummary;
  week?: PanelResult | null;
  weekInput?: PanelInputSummary | null;
  slate?: string[] | null;
  slateLanding?: SlateLandingStat[] | null;
  slateReferrer?: SlateReferrer | null;
}

function inputNotes(label: string, s: PanelInputSummary): string[] {
  const notes: string[] = [];
  notes.push(`- ${label}: 파일 ${s.files}개 · 데이터 행 ${fmt(s.dataRecords)} · 총계 행 ${fmt(s.totalsRows)}건 제외`);
  if (s.hasSource) {
    notes.push(`  - 세션 소스 열 사용: 네이버 검색(naver·m.search.naver.com·search.naver.com)만 집계 · 네이버 기타(블로그·카페 등) 세션 ${fmt(s.naverOtherSessions)} 제외 · 네이버 외 행 ${fmt(s.nonNaverRows)}건 제외`);
  } else {
    notes.push("  - 세션 소스 열 없음 — 탐색 필터가 네이버 검색 소스로 걸려 있다고 가정");
  }
  if (!s.hasEngaged) notes.push("  - 참여 세션수 열 없음 — 0 으로 표시");
  if (!s.hasViews) notes.push("  - 조회수 열 없음 — 0 으로 표시");
  if (s.hasOtherRow) notes.push("  - ⚠ '(other)' 행 있음 — GA4 가 행을 뭉쳤다. URL 수·커버리지가 낮게 나온다");
  if (s.rowLimitHits > 0) {
    notes.push(
      `  - ⚠ 데이터 행 수가 GA4 '행 표시' 값(${GA4_ROW_LIMITS.join("·")})과 같은 파일 ${s.rowLimitHits}개 — 잘렸을 수 있다. 행 표시 500 · 시작 행 501 로 한 번 더 내보내 함께 넣을 것`,
    );
  }
  return notes;
}

/** 패널 → 마크다운(stdout 전용). 템플릿 표와 주제 클러스터 표는 따로 낸다. */
export function renderPanelMarkdown(result: PanelResult, options: RenderOptions): string {
  const { input, week, weekInput, slate, slateLanding, slateReferrer: ref } = options;
  const t = result.totals;
  const out: string[] = [];
  out.push("# 네이버 템플릿 패널 — GA4 방문 페이지 × 네이버 검색 세션", "");
  out.push(
    `- 28일: 네이버 검색 세션 ${fmt(t.sessions)} · 참여 세션 ${fmt(t.engagedSessions)} · 조회수 ${fmt(t.views)} · 고유 URL ${fmt(t.urls)} · 롱테일(상위 ${LONG_TAIL_HEAD} URL 밖) 세션 ${fmt(t.longTailSessions)}`,
  );
  if (t.placeholderSessions > 0) out.push(`- 자리표시자('(not set)'·'(other)') 세션 ${fmt(t.placeholderSessions)} — 템플릿·클러스터 other 에 포함, URL 수에서는 제외`);
  if (t.sitemapUrls !== null) {
    out.push(
      `- 사이트맵 URL ${fmt(t.sitemapUrls)} 중 네이버 유입 URL ${num(t.coveredUrls)} → 전체 커버리지 ${pct(t.coverage)} · 사이트맵 밖 네이버 랜딩 URL ${num(t.outsideSitemapUrls)}개(커버리지 분자에서 제외)`,
    );
  } else {
    out.push("- 사이트맵 미지정 — 커버리지 열은 '-'");
  }
  if (week) out.push(`- 7일: 네이버 검색 세션 ${fmt(week.totals.sessions)} (템플릿·클러스터 합계만 판독 — 페이지 판독은 28일 창)`);
  out.push(...inputNotes("28일 입력", input));
  if (weekInput) out.push(...inputNotes("7일 입력", weekInput));
  out.push("");

  out.push("## 템플릿별 (28일 · DEST_TEMPLATES 세분화 — 상위 값은 dest_tpl)", "");
  out.push("| 템플릿 | 상위 dest_tpl | 세션 | 참여 세션 | 참여율 | 조회수 | URL 수 | 세션/페이지 | 사이트맵 URL | 네이버 유입 URL | 커버리지 | 7일 세션 |");
  out.push("|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
  const weekTpl = new Map(week?.templates.map((x) => [x.template, x.sessions]) ?? []);
  for (const s of result.templates) {
    const w = weekTpl.get(s.template) ?? 0;
    if (s.sessions === 0 && !(s.sitemapUrls && s.sitemapUrls > 0) && w === 0) continue;
    out.push(
      `| ${s.template} | ${s.parent} | ${fmt(s.sessions)} | ${fmt(s.engagedSessions)} | ${pct(s.sessions > 0 ? s.engagedSessions / s.sessions : null)} | ${fmt(s.views)} | ${fmt(s.urls)} | ${num(s.sessionsPerPage)} | ${num(s.sitemapUrls)} | ${num(s.coveredUrls)} | ${pct(s.coverage)} | ${week ? fmt(w) : "-"} |`,
    );
  }
  out.push("");

  out.push("## 주제 클러스터별 (템플릿과 별개 축 — 판독 (b)·(c)·(d)의 '계열')", "");
  out.push("| 클러스터 | 세션 | 참여 세션 | 조회수 | URL 수 | 7일 세션 |");
  out.push("|---|---:|---:|---:|---:|---:|");
  const weekCls = new Map(week?.clusters.map((x) => [x.cluster, x.sessions]) ?? []);
  for (const c of result.clusters) {
    out.push(`| ${c.cluster} | ${fmt(c.sessions)} | ${fmt(c.engagedSessions)} | ${fmt(c.views)} | ${fmt(c.urls)} | ${week ? fmt(weekCls.get(c.cluster) ?? 0) : "-"} |`);
  }
  out.push("");

  if (slate && slate.length) {
    out.push(`## 슬레이트 ${slate.length}쪽 — 28일 네이버 검색 세션`, "");
    out.push("| 방문 페이지 | 템플릿 | 세션 | 참여 세션 | 조회수 |");
    out.push("|---|---|---:|---:|---:|");
    for (const s of slateLanding ?? []) {
      out.push(`| ${cell(s.landing)} | ${landingTemplate(s.landing)} | ${fmt(s.sessions)} | ${fmt(s.engagedSessions)} | ${fmt(s.views)} |`);
    }
    out.push("");
    if (ref) {
      out.push("## 슬레이트 검색어 × 방문 페이지 — 네이버 리퍼러(슬레이트 경로만, 리퍼러 원문 미출력)", "");
      out.push("| 방문 페이지 | 네이버 리퍼러 세션 | 검색어 확인 세션 | 커버리지 |");
      out.push("|---|---:|---:|---:|");
      for (const l of ref.landings) out.push(`| ${cell(l.landing)} | ${fmt(l.naverSessions)} | ${fmt(l.querySessions)} | ${pct(l.coverage)} |`);
      out.push("");
      out.push(`| 방문 페이지 | # | 검색어 | 세션수 | 조회수 |`);
      out.push("|---|---:|---|---:|---:|");
      for (const landing of slate) {
        const rows = ref.pairs.filter((p) => p.landing === landing);
        if (!rows.length) {
          out.push(`| ${cell(landing)} | - | (검색어 없음) | 0 | 0 |`);
          continue;
        }
        rows.forEach((p, i) => out.push(`| ${cell(landing)} | ${i + 1} | ${cell(p.query)} | ${fmt(p.sessions)} | ${fmt(p.views)} |`));
      }
      out.push("");
    }
  }
  return out.join("\n");
}

const oneDecimal = (n: number | null) => (n === null ? "-" : (Math.round(n * 10) / 10).toFixed(1));

/**
 * metrics-log 비고 칸에 붙일 한 줄. 템플릿·클러스터 이름·숫자·고정 문구만 쓴다 — URL·경로·검색어·날짜(슬래시)·파이프 없음.
 * 형식: NAVER-PANEL v1 28d 세션 N 롱테일 N 사이트맵 N 커버 x% ; 열=세션·페이지당·커버[·7d] ; <템플릿> N·x·x%[·N] ; …
 *       ; 계열 28d <클러스터> N … [; 계열 7d <클러스터> N … ; 7d 세션 N]
 * 28일·7일 세션이 모두 0 인 템플릿은 생략한다(생략 = 0 세션, 커버리지도 0 이다).
 * v1 은 분류 규칙 판 — 템플릿·클러스터 규칙을 바꾸면 v2 로 올려 전후 행을 섞어 읽지 않게 한다.
 */
export function renderLogLine(result: PanelResult, week?: PanelResult | null): string {
  const t = result.totals;
  const parts: string[] = [
    `NAVER-PANEL v1 28d 세션 ${fmt(t.sessions)} 롱테일 ${fmt(t.longTailSessions)} 사이트맵 ${num(t.sitemapUrls)} 커버 ${pct(t.coverage)}`,
    `열=세션·페이지당·커버${week ? "·7d" : ""}`,
  ];
  const weekTpl = new Map(week?.templates.map((x) => [x.template, x.sessions]) ?? []);
  for (const s of result.templates) {
    const w = weekTpl.get(s.template) ?? 0;
    if (s.sessions === 0 && w === 0) continue;
    parts.push(`${s.template} ${fmt(s.sessions)}·${oneDecimal(s.sessionsPerPage)}·${pct(s.coverage)}${week ? `·${fmt(w)}` : ""}`);
  }
  const clusterLine = (label: string, r: PanelResult) => `계열 ${label} ${r.clusters.map((c) => `${c.cluster} ${fmt(c.sessions)}`).join(" ")}`;
  parts.push(clusterLine("28d", result));
  if (week) parts.push(clusterLine("7d", week), `7d 세션 ${fmt(week.totals.sessions)}`);
  return parts.join(" ; ");
}

// ─────────────────────────────────────────────────────────────
// CLI (입출력 주입 — 테스트 가능하도록 순수 함수로 유지)
// ─────────────────────────────────────────────────────────────

type PathImpl = Pick<typeof nodePath, "relative" | "isAbsolute" | "sep" | "resolve">;

export const USAGE = [
  "사용법: npx tsx scripts/naver-template-panel.ts <ga4-28d.csv> [<ga4-28d-2.csv> …] [--7d <csv>] [--sitemap <file|https-url>]",
  "        [--slate /job/professor,/job/doctor,/home-loan [--referrer <리퍼러 csv>]] [--log-line]",
  "  입력: GA4 탐색 'NAVER-PANEL' 자유 형식 CSV — 열 '방문 페이지 + 쿼리 문자열'·'세션수'(·'참여 세션수'·'조회수'·'세션 소스')",
  "  여러 28일 파일  GA4 '시작 행'을 바꿔 나눠 받은 같은 창의 CSV 를 함께 넣는다(같은 내용 파일은 거부)",
  "  --7d       7일 창 CSV(여러 번 지정 가능) — 템플릿·클러스터 합계만",
  "  --sitemap  사이트맵 파일 또는 https 주소 — 템플릿별 커버리지(사이트맵 URL 중 네이버 유입 1회 이상 비율)",
  `  --slate    쉼표로 구분한 경로(최대 ${MAX_SLATE}쪽) — 그 경로의 28일 세션만 표로`,
  "  --referrer 네이버 리퍼러 CSV(scripts/naver-referrer-queries.ts 와 같은 형식) — 슬레이트 경로의 검색어×방문 페이지만(--slate 필요)",
  "  --log-line 표 대신 metrics-log 용 한 줄(URL 없음)만 출력(--slate·--referrer 와 함께 쓸 수 없음)",
  "  ★입력 파일은 저장소 밖에 두세요(저장소 안 경로는 거부, exit 2). 결과는 stdout 뿐, 파일을 쓰지 않습니다.",
].join("\n");

export interface PanelCliArgs {
  files: string[];
  weekFiles: string[];
  sitemap: string | null;
  referrer: string | null;
  slate: string[] | null;
  logLine: boolean;
}

export function parsePanelArgs(argv: string[]): { ok: true; args: PanelCliArgs } | { ok: false; help: boolean; error: string } {
  const args: PanelCliArgs = { files: [], weekFiles: [], sitemap: null, referrer: null, slate: null, logLine: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") return { ok: false, help: true, error: "" };
    if (a === "--log-line") {
      args.logLine = true;
      continue;
    }
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
      let value: string | undefined = eq > 0 ? a.slice(eq + 1) : undefined;
      if (!["7d", "sitemap", "referrer", "slate"].includes(name)) {
        return { ok: false, help: false, error: `알 수 없는 옵션: --${sanitizeForTerminal(name.slice(0, 40))}` };
      }
      if (value === undefined) {
        value = argv[i + 1];
        if (value === undefined || value.startsWith("--")) return { ok: false, help: false, error: `--${name} 값이 없습니다.` };
        i++;
      }
      if (name === "7d") args.weekFiles.push(value);
      else if (name === "sitemap") {
        if (args.sitemap !== null) return { ok: false, help: false, error: "--sitemap 은 하나만 지정하세요." };
        args.sitemap = value;
      } else if (name === "referrer") {
        if (args.referrer !== null) return { ok: false, help: false, error: "--referrer 는 하나만 지정하세요." };
        args.referrer = value;
      } else {
        if (args.slate !== null) return { ok: false, help: false, error: "--slate 는 한 번만 지정하세요(쉼표로 여러 경로)." };
        const slate = parseSlate(value);
        if (!slate.ok) return { ok: false, help: false, error: slate.error };
        args.slate = slate.paths;
      }
      continue;
    }
    args.files.push(a);
  }
  if (!args.files.length) return { ok: false, help: false, error: "28일 GA4 CSV 경로가 없습니다." };
  if (args.referrer !== null && args.slate === null) return { ok: false, help: false, error: "--referrer 는 --slate 와 함께 써야 합니다(슬레이트 경로만 출력)." };
  if (args.logLine && (args.slate !== null || args.referrer !== null)) {
    return { ok: false, help: false, error: "--log-line 은 경로가 없는 한 줄이라 --slate·--referrer 와 함께 쓸 수 없습니다." };
  }
  return { ok: true, args };
}

export interface PanelCliIo {
  /** 저장소 작업 트리 루트(스크립트 위치 기준). */
  repoRoot: string;
  cwd: string;
  /** 심볼릭 링크·정션을 푼 실제 경로(없는 파일이면 가능한 만큼). */
  realpath: (p: string) => string;
  readText: (p: string) => string;
  /** --sitemap 이 https 주소일 때만 쓴다. */
  fetchText?: (url: string) => Promise<string>;
  pathImpl?: PathImpl;
}

export interface PanelCliResult {
  code: number;
  stdout: string;
  stderr: string;
}

/** stdout·stderr 최종 관문 — 렌더러의 '\n' 만 남기고 제어·서식 문자를 U+FFFD 로. */
function sanitizeOutput(s: string): string {
  return s
    .split("\n")
    .map((line) => sanitizeForTerminal(line))
    .join("\n");
}

const isUrl = (s: string) => /^[a-z][a-z0-9+.-]*:\/\//i.test(s);

/** CLI 진입점 — 모든 반환 경로의 stdout·stderr 를 최종 관문에 통과시킨다. */
export async function runNaverTemplatePanelCli(argv: string[], io: PanelCliIo): Promise<PanelCliResult> {
  const result = await runInner(argv, io);
  return { code: result.code, stdout: sanitizeOutput(result.stdout), stderr: sanitizeOutput(result.stderr) };
}

const MAX_CHILD_SITEMAPS = 50;

async function runInner(argv: string[], io: PanelCliIo): Promise<PanelCliResult> {
  const p = io.pathImpl ?? nodePath;
  const parsed = parsePanelArgs(argv);
  if (!parsed.ok) {
    if (parsed.help) return { code: 0, stdout: `${USAGE}\n`, stderr: "" };
    return { code: 1, stdout: "", stderr: `${parsed.error}\n${USAGE}\n` };
  }
  const args = parsed.args;

  // 1) 저장소 안 경로 거부 — 읽기 전에, 모든 입력 파일(28일·7일·리퍼러·사이트맵 파일)을 문자열 경로와 실제 경로로 본다.
  const sitemapIsUrl = args.sitemap !== null && isUrl(args.sitemap);
  if (sitemapIsUrl && !/^https:\/\//i.test(args.sitemap!)) {
    return { code: 1, stdout: "", stderr: "--sitemap 주소는 https 만 받습니다.\n" };
  }
  const inputs = [...args.files, ...args.weekFiles, ...(args.referrer ? [args.referrer] : []), ...(args.sitemap && !sitemapIsUrl ? [args.sitemap] : [])];
  const realRoot = io.realpath(io.repoRoot);
  const resolved = new Map<string, string>();
  for (const file of inputs) {
    const lexical = p.resolve(io.cwd, file);
    const real = io.realpath(lexical);
    if (isPathInside(lexical, io.repoRoot, p) || isPathInside(real, realRoot, p)) {
      return {
        code: 2,
        stdout: "",
        stderr:
          "거부: 입력 파일이 저장소 작업 트리 안에 있습니다 — GA4 원본 내보내기를 저장소에 두면 커밋·배포로 유출될 수 있습니다.\n" +
          "저장소 밖 폴더(예: C:/Users/ruby1/moneysalary-exports/ga4/)로 옮긴 뒤 다시 실행하세요.\n",
      };
    }
    resolved.set(file, real);
  }

  const read = (file: string): { ok: true; text: string } | { ok: false; res: PanelCliResult } => {
    try {
      return { ok: true, text: io.readText(resolved.get(file)!) };
    } catch {
      return { ok: false, res: { code: 1, stdout: "", stderr: `파일을 읽을 수 없습니다: ${file}\n` } };
    }
  };

  const parseWindow = (files: string[], label: string): { ok: true; parsed: ParsedLandingExport[] } | { ok: false; res: PanelCliResult } => {
    const texts: string[] = [];
    const out: ParsedLandingExport[] = [];
    for (const file of files) {
      const r = read(file);
      if (!r.ok) return r;
      if (texts.includes(r.text)) {
        return { ok: false, res: { code: 1, stdout: "", stderr: `${label}: 같은 내용의 파일이 두 번 들어왔습니다(${file}) — 세션이 두 번 집계됩니다.\n` } };
      }
      texts.push(r.text);
      try {
        out.push(parseGa4LandingCsv(r.text));
      } catch (error) {
        if (error instanceof ReferrerExportError) {
          return {
            ok: false,
            res: {
              code: 1,
              stdout: "",
              stderr: `${label} 입력이 리퍼러 내보내기입니다(${file}) — 패널에는 NAVER-PANEL 방문 페이지 CSV 를, 리퍼러 CSV 는 --referrer 로 넣으세요.\n`,
            },
          };
        }
        if (error instanceof HeaderNotFoundError) {
          return {
            ok: false,
            res: {
              code: 1,
              stdout: "",
              stderr: `헤더 인식 실패(${file}) — GA4 탐색 CSV 에 '방문 페이지 + 쿼리 문자열'·'세션수' 열이 필요합니다.\n`,
            },
          };
        }
        throw error;
      }
    }
    return { ok: true, parsed: out };
  };

  const month = parseWindow(args.files, "28일");
  if (!month.ok) return month.res;
  const week = args.weekFiles.length ? parseWindow(args.weekFiles, "7일") : null;
  if (week && !week.ok) return week.res;

  // 2) 사이트맵(선택)
  let sitemapLocs: string[] | undefined;
  if (args.sitemap !== null) {
    let locs: string[];
    if (sitemapIsUrl) {
      if (!io.fetchText) return { code: 1, stdout: "", stderr: "사이트맵 주소를 가져올 수 없는 환경입니다.\n" };
      try {
        const top = parseSitemap(await io.fetchText(args.sitemap));
        locs = top.locs;
        if (top.kind === "index") {
          const children = top.locs.filter((u) => /^https:\/\//i.test(u)).slice(0, MAX_CHILD_SITEMAPS);
          locs = [];
          for (const child of children) locs.push(...parseSitemap(await io.fetchText(child)).locs);
        }
      } catch {
        return { code: 1, stdout: "", stderr: "사이트맵을 가져오지 못했습니다(네트워크·차단). 파일로 저장해 --sitemap <파일> 로 주세요.\n" };
      }
    } else {
      const r = read(args.sitemap);
      if (!r.ok) return r.res;
      const sm = parseSitemap(r.text);
      if (sm.kind === "index") return { code: 1, stdout: "", stderr: "사이트맵 인덱스 파일입니다 — 하위 사이트맵 파일을 주거나 https 주소로 주세요.\n" };
      locs = sm.locs;
    }
    if (!sitemapPathsFromLocs(locs).length) return { code: 1, stdout: "", stderr: "사이트맵에서 이 사이트 URL 을 하나도 찾지 못했습니다.\n" };
    sitemapLocs = locs;
  }

  const monthRows = month.parsed.flatMap((x) => x.rows);
  const result = panel(monthRows, sitemapLocs);
  const weekResult = week && week.ok ? panel(week.parsed.flatMap((x) => x.rows)) : null;

  if (args.logLine) return { code: 0, stdout: `${renderLogLine(result, weekResult)}\n`, stderr: "" };

  // 3) 슬레이트(선택) — 방문 페이지 CSV 의 세션 + (선택) 리퍼러 집계를 naverReferrerQueries 에 맡기고 슬레이트 경로만 고른다
  let slateRef: SlateReferrer | null = null;
  if (args.referrer !== null && args.slate) {
    const r = read(args.referrer);
    if (!r.ok) return r.res;
    let exported: ReturnType<typeof parseGa4NaverExport>;
    try {
      exported = parseGa4NaverExport(r.text);
    } catch (error) {
      if (error instanceof HeaderNotFoundError) {
        return {
          code: 1,
          stdout: "",
          stderr: "리퍼러 CSV 헤더 인식 실패 — '페이지 리퍼러'·'방문 페이지 + 쿼리 문자열'·'세션수' 열이 필요합니다.\n",
        };
      }
      throw error;
    }
    slateRef = slateReferrer(aggregateNaverRows(exported.rows), args.slate);
  }

  const md = renderPanelMarkdown(result, {
    input: summarizeInputs(month.parsed),
    week: weekResult,
    weekInput: week && week.ok ? summarizeInputs(week.parsed) : null,
    slate: args.slate,
    slateLanding: args.slate ? slateLandingStats(monthRows, args.slate) : null,
    slateReferrer: slateRef,
  });
  return { code: 0, stdout: `${md}\n`, stderr: "" };
}
