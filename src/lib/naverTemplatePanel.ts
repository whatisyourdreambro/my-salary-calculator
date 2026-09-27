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
// ★완전성: 파일마다 GA4 총계 행을 남겨 창(시작 행으로 나눠 받은 파일들)의 행 합과 대조한다 — 잘린 꼬리가 곧 롱테일·커버리지·
//   작은 계열·슬레이트라서, 불완전한 창은 한 줄 기록을 거부한다(windowCompleteness · findWindowConflict).
// 운영 절차·사전 등록 판독: docs/naver-template-panel.md

import nodePath from "node:path";

import { destTemplate, type DestTemplate } from "./analytics";
import {
  aggregateNaverRows,
  compareCodeUnits,
  findHeader,
  HeaderNotFoundError,
  isPathInside,
  normalizeLanding,
  parseCsv,
  parseGa4NaverExport,
  sanitizeForTerminal,
  type NaverReport,
  type NaverRow,
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

/**
 * 분류 규칙 판. 한 줄 기록 머리('NAVER-PANEL v1')에 들어간다. 10/5 첫 기록부터 v1 으로 고정 —
 * 템플릿·클러스터 규칙을 바꾸면 v2 로 올려 전후 행을 섞어 읽지 않게 한다.
 * (v1 = 9/27 확정판: 클러스터 키워드를 /guides 밖 모든 경로·디코딩한 경로에 적용. 첫 기록 전이라 판을 올리지 않았다.)
 */
export const PANEL_RULES_VERSION = "v1";

// ── 1단계: 경로 규칙(정확한 라우트) ──
const CLUSTER_COMPANY_RE = /^\/(salary-db|company|industry|public-institutions)(\/|$)/;
const CLUSTER_YEAREND_CALC_RE = new RegExp(`^/calc/(${[...YEAREND_CALC_SLUGS, YEAREND_SEASON_BONUS_CALC].join("|")})(/|$)`);
/** 회사별·시즌 성과급 계산기(/calc/*-bonus), 성과급 도구(/calc/bonus-*), 연말 성과급 세금·인센티브 세금. */
const CLUSTER_BONUS_CALC_RE = /^\/calc\/([a-z0-9-]+-bonus|bonus-[a-z0-9-]+|year-end-bonus-tax|incentive-tax)(\/|$)/;
const CLUSTER_BONUS_INSIGHTS_RE = /^\/insights\/bonus-[a-z0-9-]+(\/|$)/;
const CLUSTER_BONUS_PAGE_RE = /^\/(samsung-negotiation-\d{4}|[a-z0-9-]*bonus[a-z0-9-]*)(\/|$)/;
const CLUSTER_PAYTABLE_RE = /^\/(teacher|police|firefighter|civil-servant|military)-pay-[a-z0-9-]+(\/|$)/;
/** 공무원 실수령액 계산기 — 공식 봉급표를 그대로 쓰고 같은 시즌(12~1월 봉급표 확정)을 탄다. */
const CLUSTER_PAYTABLE_CALC_RE = /^\/calc\/civil-servant-net-pay(\/|$)/;
/** 실업급여 계산기 · 주휴수당 계산기. */
const CLUSTER_ROLLOVER_CALC_RE = /^\/calc\/(unemployment-benefit|holiday-allowance-quick)(\/|$)/;
const CLUSTER_JOB_RE = /^\/job(\/|$)/;

// ── 2단계: 키워드 규칙 — 위 경로 규칙에 안 걸린 모든 경로(가이드·계산기·도구·Q&A·용어집·인사이트 등)에 건다 ──
/** 영문 slug 조각을 단어 단위로만(opi·tai·ps 가 topic·retail·maps 안에서 걸리지 않게). */
const token = (words: string) => new RegExp(`(^|[/-])(${words})([/-]|$)`);
/** 위에서부터 먼저 맞는 것. 한글 slug(/qna·/glossary)는 디코딩한 경로로 본다. */
export const CLUSTER_KEYWORD_RULES: readonly (readonly [RegExp, TopicCluster])[] = [
  // 연말정산 — 'deduction'과 같은 뜻인 '소득공제', 맞벌이 '부양가족-공제' 포함. 근로장려금(earned-income-credit)은 넣지 않는다.
  [/year-end|yearend|deduction|tax-credit|tax-refund|연말정산|세액공제|소득공제|부양가족-공제/, "yearend"],
  // 성과급 — OPI·TAI(삼성)·PS(SK하이닉스)·이익 공유, 임금협상(타결 뉴스 사이클). 개인 연봉협상(salary-negotiation)은 넣지 않는다.
  [/bonus|incentive|performance-pay|profit-sharing|wage-negotiation|성과급|인센티브|상여|임금협상/, "bonus"],
  [token("opi|tai|ps"), "bonus"],
  [/(teacher|police|firefighter|civil-servant|military)-pay|봉급|공무원-보수/, "paytables"],
  [/minimum-wage|unemployment|insurance-rates|weekly-holiday|holiday-allowance|실업급여|최저임금|주휴/, "rollover"],
];

/** 클러스터 규칙용 경로: sitePath + 퍼센트 인코딩 해제(실패 시 원문) + NFC. */
function clusterPath(href: string): string | null {
  const path = sitePath(href);
  if (path === null) return null;
  let decoded = path;
  try {
    decoded = decodeURI(path);
  } catch {
    // 잘못된 퍼센트 시퀀스는 원문 유지
  }
  return decoded.normalize("NFC");
}

/**
 * 방문 페이지 → 주제 클러스터. 템플릿(landingTemplate)을 부르지 않는 독립 규칙이다 —
 * 예: /calc/january-bonus 는 템플릿 bonus-calc · 클러스터 yearend, /guides/* 는 템플릿 guide · 클러스터는 키워드.
 * 1단계 경로 규칙 → 2단계 키워드 규칙(CLUSTER_KEYWORD_RULES) 순서. 경로는 디코딩해서 본다.
 * /en/* 는 주제와 무관하게 other(영문판은 네이버 유입 계열이 아니다).
 */
export function topicCluster(href: string): TopicCluster {
  const path = clusterPath(href);
  if (path === null || EN_RE.test(path)) return "other";
  if (CLUSTER_COMPANY_RE.test(path)) return "company";
  if (YEAREND_PAGE_RE.test(path) || CLUSTER_YEAREND_CALC_RE.test(path)) return "yearend";
  if (CLUSTER_BONUS_CALC_RE.test(path) || CLUSTER_BONUS_INSIGHTS_RE.test(path) || CLUSTER_BONUS_PAGE_RE.test(path)) return "bonus";
  if (CLUSTER_PAYTABLE_RE.test(path) || CLUSTER_PAYTABLE_CALC_RE.test(path)) return "paytables";
  if (ROLLOVER_RE.test(path) || CLUSTER_ROLLOVER_CALC_RE.test(path)) return "rollover";
  if (CLUSTER_JOB_RE.test(path)) return "job";
  if (HOME_LOAN_RE.test(path)) return "home-loan";
  for (const [re, cluster] of CLUSTER_KEYWORD_RULES) if (re.test(path)) return cluster;
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

/** 파일의 GA4 총계 행 값. 조회수 열이 없으면 views 는 null. */
export interface ExportTotals {
  sessions: number;
  views: number | null;
}

/**
 * 한 내보내기 파일(한 '페이지')의 완전성 판정 재료 — 방문 페이지 CSV·리퍼러 CSV 공통.
 * GA4 탐색 표는 '시작 행'·'행 표시'로 나눠 받으므로 여러 파일이 한 창(28일·7일·리퍼러)을 이룬다.
 */
export interface ExportPage {
  /** 헤더 뒤 데이터 레코드 수(총계·반복 헤더 제외, 소스 필터 전). */
  dataRecords: number;
  /** 데이터 레코드 세션 합(소스 필터 전 — 총계 행과 같은 모집단). */
  dataSessions: number;
  /** 데이터 레코드 조회수 합(소스 필터 전). 조회수 열이 없으면 null. */
  dataViews: number | null;
  /** 첫 총계 행 값. 총계 행이 없거나, 여러 개인데 값이 서로 다르면 null. */
  totals: ExportTotals | null;
  totalsRows: number;
  /**
   * 원문 행 키(방문 페이지 원문[·세션 소스 원문] 또는 리퍼러 원문·방문 페이지 원문) — 파일 사이 겹침(시작 행 중복) 검사용.
   * 쿼리 문자열이 들어 있을 수 있어 절대 출력하지 않는다(개수만 쓴다).
   */
  rawKeys: string[];
}

export interface ParsedLandingExport extends ExportPage {
  rows: LandingRow[];
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
 * 총계 행(방문 페이지 칸이 비었거나 '총계'·'Totals' 등)은 집계에서 빼되 값은 totals 로 남기고(완전성 대조),
 * 반복 헤더 행은 버린다. 행 합(dataSessions·dataViews)은 소스 필터 전 값이라 총계와 같은 모집단이다.
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
  const rawKeys: string[] = [];
  const totalsSeen: ExportTotals[] = [];
  let dataRecords = 0;
  let dataSessions = 0;
  let dataViews = 0;
  let naverOtherSessions = 0;
  let nonNaverRows = 0;
  let hasOtherRow = false;
  const viewsOf = (cells: string[]) => (columns.views === null ? 0 : toNumber(cells[columns.views]));
  for (const cells of records.slice(found.index + 1)) {
    const rawLanding = (cells[columns.landing] ?? "").trim();
    const label = normalizeHeader(rawLanding);
    if (LANDING_HEADER_SET.has(label)) continue; // 여러 표를 이어 붙인 내보내기의 반복 헤더
    if (TOTALS_LABELS.has(label)) {
      totalsSeen.push({ sessions: toNumber(cells[columns.sessions]), views: columns.views === null ? null : viewsOf(cells) });
      continue;
    }
    dataRecords++;
    const sessions = toNumber(cells[columns.sessions]);
    dataSessions += sessions;
    dataViews += viewsOf(cells);
    const rawSource = columns.source === null ? null : (cells[columns.source] ?? "").trim();
    rawKeys.push(rawSource === null ? rawLanding : `${rawLanding}\u0000${rawSource}`);
    if (rawSource !== null) {
      const source = rawSource.toLowerCase().split(" / ")[0].trim();
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
      views: viewsOf(cells),
    });
  }
  return {
    rows,
    dataRecords,
    dataSessions,
    dataViews: columns.views === null ? null : dataViews,
    totals: pickTotals(totalsSeen),
    totalsRows: totalsSeen.length,
    rawKeys,
    hasEngaged: columns.engaged !== null,
    hasViews: columns.views !== null,
    hasSource: columns.source !== null,
    naverOtherSessions,
    nonNaverRows,
    hasOtherRow,
  };
}

/** 총계 행이 여럿이면 값이 모두 같을 때만 쓴다(표 위·아래 반복). 다르면(여러 표·'Grand total' 등) 판정 불가로 null. */
function pickTotals(seen: ExportTotals[]): ExportTotals | null {
  if (!seen.length) return null;
  const [first] = seen;
  return seen.every((t) => t.sessions === first.sessions && t.views === first.views) ? first : null;
}

const REFERRER_HEADER_SET = new Set<string>(HEADER_ALIASES.referrer);

/**
 * 리퍼러 × 방문 페이지 CSV 의 완전성 재료(행 수·행 합·총계 행·원문 키). 집계는 naverReferrerQueries 가 맡고
 * (그 파일은 고치지 않는다), 여기서는 같은 헤더 규칙(findHeader)으로 한 번 더 읽어 총계만 대조한다.
 * 총계 행 = 리퍼러 칸과 방문 페이지 칸이 모두 비었거나 '총계'·'Totals' 등. 반복 헤더는 건너뛴다.
 */
export function inspectReferrerCsv(text: string): ExportPage {
  const records = parseCsv(text);
  const found = findHeader(records);
  if (!found) throw new HeaderNotFoundError(records[0] ?? []);
  const { columns } = found;
  const rawKeys: string[] = [];
  const totalsSeen: ExportTotals[] = [];
  let dataSessions = 0;
  let dataViews = 0;
  const viewsOf = (cells: string[]) => (columns.views === null ? 0 : toNumber(cells[columns.views]));
  for (const cells of records.slice(found.index + 1)) {
    const rawReferrer = (cells[columns.referrer] ?? "").trim();
    const rawLanding = (cells[columns.landing] ?? "").trim();
    const refLabel = normalizeHeader(rawReferrer);
    const landingLabel = normalizeHeader(rawLanding);
    if (REFERRER_HEADER_SET.has(refLabel) || LANDING_HEADER_SET.has(landingLabel)) continue;
    if (TOTALS_LABELS.has(refLabel) && TOTALS_LABELS.has(landingLabel)) {
      totalsSeen.push({ sessions: toNumber(cells[columns.sessions]), views: columns.views === null ? null : viewsOf(cells) });
      continue;
    }
    rawKeys.push(`${rawReferrer}\u0000${rawLanding}`);
    dataSessions += toNumber(cells[columns.sessions]);
    dataViews += viewsOf(cells);
  }
  return {
    dataRecords: rawKeys.length,
    dataSessions,
    dataViews: columns.views === null ? null : dataViews,
    totals: pickTotals(totalsSeen),
    totalsRows: totalsSeen.length,
    rawKeys,
  };
}

// ─────────────────────────────────────────────────────────────
// 창 완전성 — 총계 대조 · 시작 행 겹침 · 행 표시 한도
// ─────────────────────────────────────────────────────────────

/**
 * 조회수(이벤트 수)는 정확한 합이라 총계와 ±1(반올림)까지만 봐준다.
 * 세션수는 GA4 가 HyperLogLog++(정밀도 12, 95% 구간 약 ±3.3%)로 근사하므로 '행 합 = 총계'가 원래 성립하지 않는다 —
 * 조회수 열이 없을 때만 세션으로 대조하고, 그때 허용 폭은 총계의 3.3%(최소 1).
 */
export const VIEW_TOLERANCE = 1;
export const SESSION_HLL_TOLERANCE = 0.033;

/**
 * complete — 총계와 행 합이 맞는다.
 * short    — 행 합이 총계보다 적다(뒤 페이지 누락·GA4 임계값). 누락분 = 총계 − 행 합.
 * excess   — 행 합이 총계보다 많다(다른 기간·필터 파일이 섞였거나 시작 행이 겹쳤다).
 * suspect  — 총계로 확인할 수 없고(총계 행 없음, 또는 세션 근사 대조뿐) 모든 파일이 '행 표시' 값만큼 차 있다 — 잘렸을 수 있다.
 * unknown  — 총계 행이 없어 확인 불가(마지막 파일이 '행 표시' 값보다 적어 잘림 가능성은 낮다).
 */
export type Completeness = "complete" | "short" | "excess" | "suspect" | "unknown";

export interface WindowCheck {
  status: Completeness;
  files: number;
  dataRecords: number;
  /** 대조 기준 — views(정확, ±1) · sessions(HLL 근사, ±3.3%) · null(총계 없음). */
  basis: "views" | "sessions" | null;
  totals: ExportTotals | null;
  dataSessions: number;
  dataViews: number | null;
  /** 총계 − 행 합(양수 = 누락, 음수 = 초과). 총계가 없으면 null. */
  sessionGap: number | null;
  viewGap: number | null;
  /** 다음 내보내기의 GA4 '시작 행' = 지금까지 받은 데이터 행 + 1 (501 · 1001 · 1501 …). */
  nextStartRow: number;
  /** 모든 파일의 데이터 행 수가 GA4 '행 표시' 값과 같다 — 표의 마지막 페이지(500행 미만)를 아직 못 받았다. */
  allPagesFull: boolean;
}

export type WindowConflict =
  /** 같은 원문 행이 두 파일에 있다(시작 행 겹침 — 그대로 두면 두 번 센다). */
  | { kind: "overlap"; rows: number }
  /** 파일마다 총계가 다르다(다른 기간·필터·탐색의 파일이 섞였다). */
  | { kind: "totals-mismatch" };

const sameTotals = (a: ExportTotals, b: ExportTotals) =>
  Math.abs(a.sessions - b.sessions) <= VIEW_TOLERANCE &&
  (a.views === null || b.views === null || Math.abs(a.views - b.views) <= VIEW_TOLERANCE);

/** 한 창의 파일들 사이 충돌 — 있으면 CLI 가 거부한다(집계하지 않는다). */
export function findWindowConflict(pages: ExportPage[]): WindowConflict | null {
  const owner = new Map<string, number>();
  const overlapping = new Set<string>();
  pages.forEach((page, i) => {
    for (const key of new Set(page.rawKeys)) {
      const first = owner.get(key);
      if (first === undefined) owner.set(key, i);
      else if (first !== i) overlapping.add(key);
    }
  });
  if (overlapping.size) return { kind: "overlap", rows: overlapping.size };
  const withTotals = pages.map((p) => p.totals).filter((t): t is ExportTotals => t !== null);
  if (withTotals.some((t) => !sameTotals(t, withTotals[0]))) return { kind: "totals-mismatch" };
  return null;
}

/** 한 창(파일 여러 개 가능)의 완전성. 충돌 검사(findWindowConflict)를 통과한 입력을 가정한다. */
export function windowCompleteness(pages: ExportPage[]): WindowCheck {
  const dataRecords = pages.reduce((s, p) => s + p.dataRecords, 0);
  const dataSessions = pages.reduce((s, p) => s + p.dataSessions, 0);
  const hasViews = pages.length > 0 && pages.every((p) => p.dataViews !== null);
  const dataViews = hasViews ? pages.reduce((s, p) => s + (p.dataViews ?? 0), 0) : null;
  const totals = pages.find((p) => p.totals !== null)?.totals ?? null;
  const allPagesFull = pages.length > 0 && pages.every((p) => GA4_ROW_LIMITS.includes(p.dataRecords));
  const base = { files: pages.length, dataRecords, dataSessions, dataViews, totals, nextStartRow: dataRecords + 1, allPagesFull };
  if (!totals) {
    return { ...base, status: allPagesFull ? "suspect" : "unknown", basis: null, sessionGap: null, viewGap: null };
  }
  const sessionGap = totals.sessions - dataSessions;
  const viewGap = totals.views !== null && dataViews !== null ? totals.views - dataViews : null;
  const basis = viewGap !== null ? "views" : "sessions";
  const gap = viewGap ?? sessionGap;
  const tolerance = basis === "views" ? VIEW_TOLERANCE : Math.max(1, Math.ceil(totals.sessions * SESSION_HLL_TOLERANCE));
  let status: Completeness = gap > tolerance ? "short" : gap < -tolerance ? "excess" : "complete";
  // 세션 근사 대조로는 작은 꼬리 누락을 못 가린다 — 마지막 페이지를 못 받았으면 의심으로 둔다.
  if (status === "complete" && basis === "sessions" && allPagesFull) status = "suspect";
  return { ...base, status, basis, sessionGap, viewGap };
}

/** 운영자에게 줄 다음 행동(한국어 한 줄). complete 면 null. */
export function completenessAdvice(check: WindowCheck): string | null {
  // 시작 행은 GA4 입력칸에 그대로 치는 숫자라 천 단위 쉼표 없이 쓴다.
  const again = `GA4 '시작 행'을 ${check.nextStartRow} 로 바꿔 한 번 더 받아 함께 넣을 것(500행 미만 파일이 나올 때까지 501·1001·1501…)`;
  switch (check.status) {
    case "complete":
      return null;
    case "short":
      return check.allPagesFull
        ? `${again}`
        : "마지막 파일이 '행 표시' 값보다 적은데도(표 끝까지 받음) 모자라다 — 빠진 중간 페이지가 없는지(시작 행 1·501·1001… 순서) 확인하고, 그래도 같으면 GA4 임계값 처리다(문서 §9)";
    case "excess":
      return "행 합이 총계보다 많다 — 다른 기간·필터의 파일이 섞였는지 확인하고 같은 탐색·같은 기간으로 다시 받을 것";
    case "suspect":
      return `총계로 확인할 수 없다 — ${again}`;
    case "unknown":
      return "총계 행이 없어 완전성을 확인할 수 없다(마지막 파일이 행 표시 값보다 적어 잘림 가능성은 낮음)";
  }
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

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * GA4 REFERRER 탭 '방문 페이지 + 쿼리 문자열' 필터(정규식과 일치)에 붙여 넣을 식 — 슬레이트 경로만 남겨 행 수를 줄인다.
 * 끝 슬래시·쿼리 문자열을 허용하고 앞뒤를 고정한다(전체 일치·부분 일치 어느 쪽이어도 같은 뜻).
 * 한글 경로는 GA4 에 퍼센트 인코딩으로 남는 경우가 있어 인코딩 형태도 함께 넣는다.
 */
export function slateFilterRegex(slate: string[]): string {
  const alts: string[] = [];
  for (const p of slate) {
    for (const form of [p, encodeURI(p)]) {
      const body = escapeRegex(form.replace(/^\//, ""));
      if (!alts.includes(body)) alts.push(body);
    }
  }
  return `^/(${alts.join("|")})/?(\\?.*)?$`;
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
  /** 총계 대조·행 표시 한도로 본 창 완전성. */
  check: WindowCheck;
}

export function summarizeInputs(parsed: ParsedLandingExport[]): PanelInputSummary {
  return {
    check: windowCompleteness(parsed),
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
  /** --referrer 파일들의 완전성(슬레이트 검색어 표). */
  referrerCheck?: WindowCheck | null;
}

/** 완전성 판정을 사람이 읽는 줄로. 불완전이면 '⚠ 불완전'으로 시작한다. */
export function completenessNotes(check: WindowCheck): string[] {
  const t = check.totals;
  const gapText = (gap: number | null) => (gap === null ? "-" : gap >= 0 ? `누락 ${fmt(gap)}` : `초과 ${fmt(-gap)}`);
  const lines: string[] = [];
  if (t) {
    const views = t.views !== null && check.dataViews !== null ? `조회수 행 합 ${fmt(check.dataViews)} / 총계 ${fmt(t.views)}(${gapText(check.viewGap)}) · ` : "";
    lines.push(
      `총계 대조(${check.basis === "views" ? "조회수 기준 ±1" : "세션 기준 — HLL 근사 ±3.3%"}): ${views}세션 행 합 ${fmt(check.dataSessions)} / 총계 ${fmt(t.sessions)}(${gapText(check.sessionGap)}${check.basis === "views" ? " — 세션은 GA4 근사값이라 참고만" : ""})`,
    );
  }
  const advice = completenessAdvice(check);
  switch (check.status) {
    case "complete":
      lines.push("완전 — 총계와 행 합이 맞는다");
      break;
    case "short":
      lines.push(
        `⚠ 불완전 — 행이 빠졌다: ${check.basis === "views" ? `조회수 ${fmt(check.viewGap ?? 0)} · ` : ""}세션 약 ${fmt(Math.max(0, check.sessionGap ?? 0))} 누락. ${advice}`,
      );
      break;
    case "excess":
      lines.push(`⚠ 불완전(초과) — ${advice}`);
      break;
    case "suspect":
      lines.push(`⚠ 불완전(잘림 의심) — 모든 파일의 행 수가 GA4 '행 표시' 값(${GA4_ROW_LIMITS.join("·")})과 같다. ${advice}`);
      break;
    case "unknown":
      lines.push(`총계 행 없음 — ${advice}`);
      break;
  }
  return lines;
}

function inputNotes(label: string, s: PanelInputSummary): string[] {
  const notes: string[] = [];
  notes.push(`- ${label}: 파일 ${s.files}개 · 데이터 행 ${fmt(s.dataRecords)} · 총계 행 ${fmt(s.totalsRows)}건 제외`);
  for (const line of completenessNotes(s.check)) notes.push(`  - ${line}`);
  if (s.hasSource) {
    notes.push(`  - 세션 소스 열 사용: 네이버 검색(naver·m.search.naver.com·search.naver.com)만 집계 · 네이버 기타(블로그·카페 등) 세션 ${fmt(s.naverOtherSessions)} 제외 · 네이버 외 행 ${fmt(s.nonNaverRows)}건 제외`);
  } else {
    notes.push("  - 세션 소스 열 없음 — 탐색 필터가 네이버 검색 소스로 걸려 있다고 가정");
  }
  if (!s.hasEngaged) notes.push("  - 참여 세션수 열 없음 — 0 으로 표시");
  if (!s.hasViews) notes.push("  - 조회수 열 없음 — 0 으로 표시");
  if (s.hasOtherRow) notes.push("  - ⚠ '(other)' 행 있음 — GA4 가 행을 뭉쳤다. URL 수·커버리지가 낮게 나온다");
  if (s.rowLimitHits > 0 && s.check.status === "complete") {
    notes.push(`  - 행 수가 GA4 '행 표시' 값과 같은 파일 ${s.rowLimitHits}개 — 총계와 맞으므로 잘리지 않았다`);
  }
  return notes;
}

const isIncomplete = (c: WindowCheck | null | undefined) => !!c && c.status !== "complete" && c.status !== "unknown";

/** 패널 → 마크다운(stdout 전용). 템플릿 표와 주제 클러스터 표는 따로 낸다. */
export function renderPanelMarkdown(result: PanelResult, options: RenderOptions): string {
  const { input, week, weekInput, slate, slateLanding, slateReferrer: ref, referrerCheck } = options;
  const t = result.totals;
  const out: string[] = [];
  out.push("# 네이버 템플릿 패널 — GA4 방문 페이지 × 네이버 검색 세션", "");
  const windows: [string, WindowCheck | null | undefined][] = [
    ["28일", input.check],
    ["7일", weekInput?.check],
    ["리퍼러", ref ? referrerCheck : null],
  ];
  const incomplete = windows.filter(([, c]) => isIncomplete(c)).map(([label]) => label);
  if (incomplete.length) {
    out.push(`> ⚠ 불완전 입력(${incomplete.join("·")}) — 이 결과로 기준선·판독을 기록하지 말 것. 아래 입력 메모의 안내대로 더 받아 다시 실행`, "");
  }
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
    out.push(`- REFERRER 탭 '방문 페이지 + 쿼리 문자열' 필터(정규식과 일치)용: \`${slateFilterRegex(slate)}\``, "");
    if (ref) {
      out.push("## 슬레이트 검색어 × 방문 페이지 — 네이버 리퍼러(슬레이트 경로만, 리퍼러 원문 미출력)", "");
      if (referrerCheck) {
        out.push(`- 리퍼러 입력: 파일 ${referrerCheck.files}개 · 데이터 행 ${fmt(referrerCheck.dataRecords)}`);
        for (const line of completenessNotes(referrerCheck)) out.push(`  - ${line}`);
        if (isIncomplete(referrerCheck)) {
          out.push("  - ⚠ 잘린 리퍼러 표에서는 '(검색어 없음)'·낮은 커버리지가 잘림 때문일 수 있다 — REFERRER 탭에 세션 소스·방문 페이지 정규식 필터를 걸고 다시 받을 것");
        }
        out.push("");
      }
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

/** 한 줄 기록용 완전성 표시(URL·슬래시 없음). complete 면 null. label 은 '28d'·'7d'. */
export function completenessToken(label: string, check: WindowCheck): string | null {
  switch (check.status) {
    case "complete":
      return null;
    case "short":
      return check.basis === "views"
        ? `불완전 ${label} 누락 조회수 ${fmt(check.viewGap ?? 0)} 세션 약 ${fmt(Math.max(0, check.sessionGap ?? 0))}`
        : `불완전 ${label} 누락 세션 약 ${fmt(check.sessionGap ?? 0)}`;
    case "excess":
      return check.basis === "views"
        ? `불완전 ${label} 초과 조회수 ${fmt(-(check.viewGap ?? 0))}`
        : `불완전 ${label} 초과 세션 약 ${fmt(-(check.sessionGap ?? 0))}`;
    case "suspect":
      return `불완전 ${label} 잘림 의심`;
    case "unknown":
      return `총계없음 ${label}`;
  }
}

/**
 * metrics-log 비고 칸에 붙일 한 줄. 템플릿·클러스터 이름·숫자·고정 문구만 쓴다 — URL·경로·검색어·날짜(슬래시)·파이프 없음.
 * 형식: NAVER-PANEL v1 28d 세션 N 롱테일 N 사이트맵 N 커버 x% ; 열=세션·페이지당·커버[·7d] ; <템플릿> N·x·x%[·N] ; …
 *       ; 계열 28d <클러스터> N … [; 계열 7d <클러스터> N … ; 7d 세션 N]
 * 28일·7일 세션이 모두 0 인 템플릿은 생략한다(생략 = 0 세션, 커버리지도 0 이다).
 * v1 은 분류 규칙 판(PANEL_RULES_VERSION) — 템플릿·클러스터 규칙을 바꾸면 v2 로 올려 전후 행을 섞어 읽지 않게 한다.
 * checks 를 주면 완전하지 않은 창마다 둘째 칸에 '불완전 28d 누락 조회수 N 세션 약 N'·'총계없음 7d' 같은 표시가 붙는다.
 */
export function renderLogLine(result: PanelResult, week?: PanelResult | null, checks?: { month: WindowCheck; week?: WindowCheck | null }): string {
  const t = result.totals;
  const parts: string[] = [
    `NAVER-PANEL ${PANEL_RULES_VERSION} 28d 세션 ${fmt(t.sessions)} 롱테일 ${fmt(t.longTailSessions)} 사이트맵 ${num(t.sitemapUrls)} 커버 ${pct(t.coverage)}`,
  ];
  const flags = [
    checks ? completenessToken("28d", checks.month) : null,
    checks?.week ? completenessToken("7d", checks.week) : null,
  ].filter((x): x is string => x !== null);
  if (flags.length) parts.push(flags.join(" · "));
  parts.push(`열=세션·페이지당·커버${week ? "·7d" : ""}`);
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
  "  여러 28일 파일  GA4 '시작 행'을 501·1001·1501… 로 바꿔 나눠 받은 같은 창의 CSV 를 함께 넣는다(500행 미만 파일이 나올 때까지)",
  "             같은 내용 파일·같은 행이 두 파일에 있는 겹침·총계가 서로 다른 파일은 거부. 총계 행과 행 합을 대조해 불완전을 알린다",
  "  --7d       7일 창 CSV(여러 번 지정 가능) — 템플릿·클러스터 합계만",
  "  --sitemap  사이트맵 파일 또는 https 주소 — 템플릿별 커버리지(사이트맵 URL 중 네이버 유입 1회 이상 비율)",
  `  --slate    쉼표로 구분한 경로(최대 ${MAX_SLATE}쪽) — 그 경로의 28일 세션만 표로 + REFERRER 탭 필터용 정규식`,
  "  --referrer 네이버 리퍼러 CSV(scripts/naver-referrer-queries.ts 와 같은 형식, 여러 번 지정 가능) — 슬레이트 경로의 검색어×방문 페이지만(--slate 필요)",
  "  --log-line 표 대신 metrics-log 용 한 줄(URL 없음)만 출력(--slate·--referrer 와 함께 쓸 수 없음). 불완전 창이 있으면 거부(exit 3)",
  "  --allow-incomplete  --log-line 을 불완전 창에도 출력(줄에 '불완전 …' 표시가 붙는다) — 문서 §9 의 임계값 경우에만",
  "  ★입력 파일은 저장소 밖에 두세요(저장소 안 경로는 거부, exit 2). 결과는 stdout 뿐, 파일을 쓰지 않습니다.",
].join("\n");

export interface PanelCliArgs {
  files: string[];
  weekFiles: string[];
  sitemap: string | null;
  referrers: string[];
  slate: string[] | null;
  logLine: boolean;
  allowIncomplete: boolean;
}

export function parsePanelArgs(argv: string[]): { ok: true; args: PanelCliArgs } | { ok: false; help: boolean; error: string } {
  const args: PanelCliArgs = { files: [], weekFiles: [], sitemap: null, referrers: [], slate: null, logLine: false, allowIncomplete: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") return { ok: false, help: true, error: "" };
    if (a === "--log-line") {
      args.logLine = true;
      continue;
    }
    if (a === "--allow-incomplete") {
      args.allowIncomplete = true;
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
        args.referrers.push(value);
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
  if (args.referrers.length && args.slate === null) return { ok: false, help: false, error: "--referrer 는 --slate 와 함께 써야 합니다(슬레이트 경로만 출력)." };
  if (args.logLine && (args.slate !== null || args.referrers.length)) {
    return { ok: false, help: false, error: "--log-line 은 경로가 없는 한 줄이라 --slate·--referrer 와 함께 쓸 수 없습니다." };
  }
  if (args.allowIncomplete && !args.logLine) return { ok: false, help: false, error: "--allow-incomplete 는 --log-line 과 함께만 씁니다(표 출력은 늘 경고와 함께 나옵니다)." };
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
  const inputs = [...args.files, ...args.weekFiles, ...args.referrers, ...(args.sitemap && !sitemapIsUrl ? [args.sitemap] : [])];
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
    const conflict = findWindowConflict(out);
    if (conflict) return { ok: false, res: conflictResult(label, conflict) };
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

  const monthCheck = windowCompleteness(month.parsed);
  const weekCheck = week && week.ok ? windowCompleteness(week.parsed) : null;

  if (args.logLine) {
    const candidates: [string, WindowCheck | null][] = [
      ["28일", monthCheck],
      ["7일", weekCheck],
    ];
    const bad = candidates.filter((x): x is [string, WindowCheck] => isIncomplete(x[1]));
    const advice = bad.map(([label, c]) => `- ${label}: ${completenessNotes(c).filter((l) => l.startsWith("⚠")).join(" ")}`).join("\n");
    if (bad.length && !args.allowIncomplete) {
      return {
        code: 3,
        stdout: "",
        stderr:
          `거부: 불완전한 창이 있어 한 줄 기록을 내지 않습니다(판독 기준선이 틀어집니다).\n${advice}\n` +
          "더 받아 다시 실행하세요. 마지막 파일이 500행 미만인데도 같으면 문서 §9(임계값)대로 --allow-incomplete 를 붙여 '불완전' 표시와 함께 기록합니다.\n",
      };
    }
    const line = renderLogLine(result, weekResult, { month: monthCheck, week: weekCheck });
    const stderr = bad.length ? `경고: 불완전 창을 '불완전' 표시와 함께 기록합니다.\n${advice}\n` : "";
    return { code: 0, stdout: `${line}\n`, stderr };
  }

  // 3) 슬레이트(선택) — 방문 페이지 CSV 의 세션 + (선택) 리퍼러 집계를 naverReferrerQueries 에 맡기고 슬레이트 경로만 고른다
  let slateRef: SlateReferrer | null = null;
  let referrerCheck: WindowCheck | null = null;
  if (args.referrers.length && args.slate) {
    const texts: string[] = [];
    const pages: ExportPage[] = [];
    const rows: NaverRow[] = [];
    for (const file of args.referrers) {
      const r = read(file);
      if (!r.ok) return r.res;
      if (texts.includes(r.text)) {
        return { code: 1, stdout: "", stderr: `리퍼러: 같은 내용의 파일이 두 번 들어왔습니다(${file}) — 세션이 두 번 집계됩니다.\n` };
      }
      texts.push(r.text);
      try {
        rows.push(...parseGa4NaverExport(r.text).rows);
        pages.push(inspectReferrerCsv(r.text));
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
    }
    const conflict = findWindowConflict(pages);
    if (conflict) return conflictResult("리퍼러", conflict);
    referrerCheck = windowCompleteness(pages);
    slateRef = slateReferrer(aggregateNaverRows(rows), args.slate);
  }

  const md = renderPanelMarkdown(result, {
    input: summarizeInputs(month.parsed),
    week: weekResult,
    weekInput: week && week.ok ? summarizeInputs(week.parsed) : null,
    slate: args.slate,
    slateLanding: args.slate ? slateLandingStats(monthRows, args.slate) : null,
    slateReferrer: slateRef,
    referrerCheck,
  });
  const warn: [string, WindowCheck | null][] = [
    ["28일", monthCheck],
    ["7일", weekCheck],
    ["리퍼러", referrerCheck],
  ];
  const flagged = warn.filter(([, c]) => isIncomplete(c)).map(([label]) => label);
  const stderr = flagged.length ? `경고: 불완전 입력(${flagged.join("·")}) — 표 맨 위·입력 메모를 보고 더 받아 다시 실행하세요.\n` : "";
  return { code: 0, stdout: `${md}\n`, stderr };
}

/** 창 충돌(겹침·총계 불일치) → exit 1. 원문 행(쿼리 문자열 포함 가능)은 출력하지 않고 개수만 쓴다. */
function conflictResult(label: string, conflict: WindowConflict): PanelCliResult {
  if (conflict.kind === "overlap") {
    return {
      code: 1,
      stdout: "",
      stderr:
        `${label}: 같은 행 ${fmt(conflict.rows)}개가 두 파일에 들어 있습니다(시작 행이 겹침) — 그대로 합치면 두 번 셉니다.\n` +
        "GA4 '시작 행'을 1·501·1001·1501… 로(행 표시 500) 겹치지 않게 다시 받으세요.\n",
    };
  }
  return {
    code: 1,
    stdout: "",
    stderr: `${label}: 파일마다 총계 행이 다릅니다 — 다른 기간·필터·탭의 파일이 섞였습니다. 같은 탭·같은 기간으로 받은 파일만 함께 넣으세요.\n`,
  };
}
