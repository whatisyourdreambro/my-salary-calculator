// src/lib/naverReferrerQueries.ts
//
// GA4 자유 형식 탐색 분석 CSV(페이지 리퍼러 × 방문 페이지 + 쿼리 문자열 × 세션수·조회수)에서
// 네이버 통합검색 리퍼러만 골라 "검색어 × 방문 페이지" 표를 만드는 순수 집계 모듈.
// 네이버 서치어드바이저는 검색어별 방문 페이지를 주지 않아(GSC 와 달리) 이 표가 비어 있었다.
//
// ★로컬 분석 도구 전용 — 어떤 페이지·컴포넌트도 import 하지 않는다(런타임 영향 0).
//   CLI: scripts/naver-referrer-queries.ts (npx tsx). 파일 쓰기·데이터 내장 없음, 결과는 stdout 뿐.
// ★개인정보: 집계값만 출력하고 리퍼러 원문(URL)은 어떤 경로로도 출력하지 않는다.
//   사이트 계측(analytics.ts·analyticsPrivacy.ts)은 건드리지 않는다 — 사이트 코드에 검색어 수집 없음.

import nodePath from "node:path";

/** 네이버 통합검색 결과 페이지 호스트(PC·모바일). 블로그·카페·포털 메인 등은 검색 리퍼러가 아니다. */
export const NAVER_SEARCH_HOSTS: ReadonlySet<string> = new Set(["search.naver.com", "m.search.naver.com"]);

/** 네이버 리퍼러에 검색어가 한 건도 없을 때 stdout 에 그대로 출력하는 판정 문구. */
export const NO_QUERY_MESSAGE = "네이버 리퍼러에 query 없음 — Search Advisor 유지";

export const DEFAULT_TOP = 200;
export type GroupBy = "query" | "landing";

// ─────────────────────────────────────────────────────────────
// CSV
// ─────────────────────────────────────────────────────────────

/**
 * RFC 4180 CSV 파서 — 따옴표 안의 쉼표·줄바꿈·"" 이스케이프 대응.
 * 선두 BOM 제거, 레코드 첫 글자가 '#' 인 줄(GA4 내보내기 머리 주석)과 빈 줄은 건너뛴다.
 */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let atRecordStart = true;

  const endRecord = () => {
    if (row.length || cell !== "") {
      row.push(cell);
      rows.push(row);
    }
    row = [];
    cell = "";
    atRecordStart = true;
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (atRecordStart && ch === "#") {
      // 주석 줄: 줄 끝까지 버린다
      while (i < src.length && src[i] !== "\n" && src[i] !== "\r") i++;
      if (src[i] === "\r" && src[i + 1] === "\n") i++;
      continue;
    }
    if (ch === "\r" || ch === "\n") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      endRecord();
      continue;
    }
    atRecordStart = false;
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else {
      cell += ch;
    }
  }
  endRecord();
  return rows;
}

// ─────────────────────────────────────────────────────────────
// 헤더
// ─────────────────────────────────────────────────────────────

const normalizeHeader = (h: string) => h.replace(/^\uFEFF/, "").normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();

/**
 * 열 이름 별칭 — 반드시 "완전 일치"로 찾는다.
 * 부분 일치면 '참여 세션수'·'Engaged sessions'·'세션당 조회수'·'Views per session' 을 잘못 집는다.
 */
const HEADER_ALIASES = {
  referrer: ["페이지 리퍼러", "page referrer"],
  landing: ["방문 페이지 + 쿼리 문자열", "landing page + query string", "방문 페이지", "landing page"],
  sessions: ["세션수", "세션", "sessions"],
  views: ["조회수", "views"],
} as const;

export interface ColumnMap {
  referrer: number;
  landing: number;
  sessions: number;
  /** 조회수 열은 선택 — 없으면 null 이고 조회수는 0 으로 집계한다. */
  views: number | null;
}

function indexOfAlias(header: string[], aliases: readonly string[]): number {
  for (const alias of aliases) {
    const i = header.indexOf(alias);
    if (i >= 0) return i;
  }
  return -1;
}

/** 주석을 걷어낸 레코드 중 필수 열(리퍼러·방문 페이지·세션수)을 모두 가진 첫 행을 헤더로 본다. */
export function findHeader(rows: string[][]): { index: number; columns: ColumnMap } | null {
  for (let r = 0; r < rows.length; r++) {
    const header = rows[r].map(normalizeHeader);
    const referrer = indexOfAlias(header, HEADER_ALIASES.referrer);
    const landing = indexOfAlias(header, HEADER_ALIASES.landing);
    const sessions = indexOfAlias(header, HEADER_ALIASES.sessions);
    if (referrer < 0 || landing < 0 || sessions < 0) continue;
    const views = indexOfAlias(header, HEADER_ALIASES.views);
    return { index: r, columns: { referrer, landing, sessions, views: views >= 0 ? views : null } };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// 리퍼러·방문 페이지 정규화
// ─────────────────────────────────────────────────────────────

/** 검색어 정리: NFC(자모 분해 방지) → 공백 연속을 한 칸으로 → 앞뒤 공백 제거. */
function cleanQuery(value: string | null): string {
  return (value ?? "").normalize("NFC").replace(/\s+/g, " ").trim();
}

/**
 * 리퍼러가 네이버 통합검색이면 검색어를 꺼낸다.
 * - query 가 비었으면 oquery(직전 검색어)로 대체한다.
 * - URLSearchParams 가 퍼센트 인코딩(UTF-8)과 '+'→공백을 디코딩한다. 그 뒤 NFC 정규화.
 * - 호스트는 정확히 일치해야 한다(search.naver.com.example.com·blog.naver.com 은 제외).
 */
export function extractNaverQuery(referrer: string): { naver: boolean; query: string | null } {
  const raw = (referrer ?? "").trim();
  if (!raw) return { naver: false, query: null };
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { naver: false, query: null };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { naver: false, query: null };
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!NAVER_SEARCH_HOSTS.has(host)) return { naver: false, query: null };
  const query = cleanQuery(url.searchParams.get("query")) || cleanQuery(url.searchParams.get("oquery"));
  return { naver: true, query: query || null };
}

/**
 * 방문 페이지를 쿼리 문자열·해시 없는 경로로 정규화한다.
 * 절대 URL 이면 경로만, 퍼센트 인코딩 경로는 디코딩(실패 시 원문), NFC, 끝 슬래시 제거(루트 제외).
 * GA4 자리표시자('(not set)'·'(other)')와 빈 값은 '(not set)' 계열로 유지한다.
 */
export function normalizeLanding(landing: string): string {
  let s = (landing ?? "").trim();
  if (!s) return "(not set)";
  if (s.startsWith("(")) return s;
  if (/^https?:\/\//i.test(s)) {
    try {
      s = new URL(s).pathname;
    } catch {
      // 파싱 실패 시 아래 문자열 처리로 폴백
    }
  }
  s = s.split(/[?#]/, 1)[0];
  if (!s.startsWith("/")) s = `/${s}`;
  try {
    s = decodeURI(s);
  } catch {
    // 잘못된 퍼센트 시퀀스는 원문 유지
  }
  s = s.normalize("NFC");
  if (s.length > 1) s = s.replace(/\/+$/, "") || "/";
  return s;
}

function toNumber(value: string | undefined): number {
  const n = Number(String(value ?? "").replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// ─────────────────────────────────────────────────────────────
// 파싱 · 집계
// ─────────────────────────────────────────────────────────────

export interface NaverRow {
  /** 리퍼러에서 꺼낸 검색어. 리퍼러가 네이버 검색이지만 query·oquery 가 없으면 null. */
  query: string | null;
  landing: string;
  sessions: number;
  views: number;
}

export interface ParsedExport {
  rows: NaverRow[];
  /** 헤더 뒤 데이터 행 중 네이버 검색 리퍼러가 아니어서 버린 행 수(총계 행 포함). */
  droppedRows: number;
  hasViews: boolean;
}

export class HeaderNotFoundError extends Error {
  readonly firstRecord: string[];
  constructor(firstRecord: string[]) {
    super("header-not-found");
    this.name = "HeaderNotFoundError";
    this.firstRecord = firstRecord;
  }
}

/** GA4 내보내기 텍스트 → 네이버 검색 리퍼러 행만. 헤더를 못 찾으면 HeaderNotFoundError. */
export function parseGa4NaverExport(text: string): ParsedExport {
  const records = parseCsv(text);
  const found = findHeader(records);
  if (!found) throw new HeaderNotFoundError(records[0] ?? []);
  const { columns } = found;
  const rows: NaverRow[] = [];
  let droppedRows = 0;
  for (const cells of records.slice(found.index + 1)) {
    const { naver, query } = extractNaverQuery(cells[columns.referrer] ?? "");
    if (!naver) {
      droppedRows++;
      continue;
    }
    rows.push({
      query,
      landing: normalizeLanding(cells[columns.landing] ?? ""),
      sessions: toNumber(cells[columns.sessions]),
      views: columns.views === null ? 0 : toNumber(cells[columns.views]),
    });
  }
  return { rows, droppedRows, hasViews: columns.views !== null };
}

/** UTF-16 코드 단위 비교(로캘 무관 · 결정적). localeCompare 는 환경마다 순서가 달라 쓰지 않는다. */
export function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export interface QueryLanding {
  query: string;
  landing: string;
  sessions: number;
  views: number;
}

export interface LandingCoverage {
  landing: string;
  /** 이 방문 페이지로 들어온 네이버 검색 리퍼러 세션 합계(검색어 유무 무관). */
  naverSessions: number;
  views: number;
  /** 그중 리퍼러에 검색어(query·oquery)가 남아 있던 세션. */
  querySessions: number;
  /** querySessions / naverSessions — 분모 0 이면 null. */
  coverage: number | null;
  /** 이 페이지의 상위 검색어 최대 3개(세션 내림차순 → 코드 단위). */
  topQueries: { query: string; sessions: number }[];
}

export interface NaverReport {
  pairs: QueryLanding[];
  landings: LandingCoverage[];
  totals: {
    naverRows: number;
    naverSessions: number;
    querySessions: number;
    coverage: number | null;
    uniqueQueries: number;
  };
}

const byPairOrder = (a: QueryLanding, b: QueryLanding) =>
  b.sessions - a.sessions || compareCodeUnits(a.query, b.query) || compareCodeUnits(a.landing, b.landing);

/** (검색어, 방문 페이지)별 세션·조회수 합산 + 방문 페이지별 검색어 커버리지. */
export function aggregateNaverRows(rows: NaverRow[]): NaverReport {
  const pairMap = new Map<string, QueryLanding>();
  const landingMap = new Map<string, { naverSessions: number; views: number; querySessions: number }>();
  let naverSessions = 0;
  let querySessions = 0;

  for (const row of rows) {
    naverSessions += row.sessions;
    const landing = landingMap.get(row.landing) ?? { naverSessions: 0, views: 0, querySessions: 0 };
    landing.naverSessions += row.sessions;
    landing.views += row.views;
    if (row.query !== null) {
      landing.querySessions += row.sessions;
      querySessions += row.sessions;
      const key = `${row.query}\u0000${row.landing}`;
      const pair = pairMap.get(key) ?? { query: row.query, landing: row.landing, sessions: 0, views: 0 };
      pair.sessions += row.sessions;
      pair.views += row.views;
      pairMap.set(key, pair);
    }
    landingMap.set(row.landing, landing);
  }

  const pairs = [...pairMap.values()].sort(byPairOrder);
  const topByLanding = new Map<string, { query: string; sessions: number }[]>();
  for (const pair of pairs) {
    const list = topByLanding.get(pair.landing) ?? [];
    if (list.length < 3) list.push({ query: pair.query, sessions: pair.sessions });
    topByLanding.set(pair.landing, list);
  }

  const landings: LandingCoverage[] = [...landingMap.entries()]
    .map(([landing, v]) => ({
      landing,
      naverSessions: v.naverSessions,
      views: v.views,
      querySessions: v.querySessions,
      coverage: v.naverSessions > 0 ? v.querySessions / v.naverSessions : null,
      topQueries: topByLanding.get(landing) ?? [],
    }))
    .sort((a, b) => b.naverSessions - a.naverSessions || compareCodeUnits(a.landing, b.landing));

  return {
    pairs,
    landings,
    totals: {
      naverRows: rows.length,
      naverSessions,
      querySessions,
      coverage: naverSessions > 0 ? querySessions / naverSessions : null,
      uniqueQueries: new Set(pairs.map((p) => p.query)).size,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// 마크다운 출력
// ─────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const pct = (r: number | null) => (r === null ? "-" : `${(r * 100).toFixed(1)}%`);
/** 표 셀 이스케이프 — 파이프는 열을 깨고 '<' 는 뷰어에서 태그로 해석될 수 있다. */
const cell = (s: string) => s.replace(/\r?\n|\r/g, " ").replace(/\|/g, "\\|").replace(/</g, "&lt;");

function moreLine(total: number, shown: number): string {
  return total > shown ? `\n_...외 ${fmt(total - shown)}건_\n` : "";
}

function coverageTable(landings: LandingCoverage[], top: number): string {
  const shown = landings.slice(0, top);
  const head = "| # | 방문 페이지 | 네이버 세션 | 검색어 확인 세션 | 커버리지 |\n|---:|---|---:|---:|---:|\n";
  const body = shown
    .map((l, i) => `| ${i + 1} | ${cell(l.landing)} | ${fmt(l.naverSessions)} | ${fmt(l.querySessions)} | ${pct(l.coverage)} |`)
    .join("\n");
  return `${head}${body}\n${moreLine(landings.length, shown.length)}`;
}

/** 집계 결과 → 마크다운(검색어가 하나도 없으면 호출 전에 NO_QUERY_MESSAGE 분기). */
export function renderMarkdown(report: NaverReport, options: { top: number; by: GroupBy; hasViews: boolean; droppedRows: number }): string {
  const { top, by, hasViews, droppedRows } = options;
  const t = report.totals;
  const out: string[] = [];
  out.push("# 네이버 검색어 × 방문 페이지 — GA4 페이지 리퍼러 집계", "");
  out.push(
    `- 네이버 검색 리퍼러 세션 ${fmt(t.naverSessions)} (행 ${fmt(t.naverRows)}) · 검색어 확인 세션 ${fmt(t.querySessions)} → 커버리지 ${pct(t.coverage)}`,
    `- 고유 검색어 ${fmt(t.uniqueQueries)}개 · 검색어×페이지 조합 ${fmt(report.pairs.length)}개 · 네이버 검색 외 행 ${fmt(droppedRows)}건 제외`,
  );
  if (!hasViews) out.push("- 조회수 열 없음 — 조회수는 0 으로 표시");
  out.push("");

  if (by === "landing") {
    const shown = report.landings.slice(0, top);
    out.push(`## 방문 페이지별 (네이버 세션 내림차순 · 상위 ${fmt(top)})`, "");
    out.push("| # | 방문 페이지 | 네이버 세션 | 조회수 | 검색어 확인 세션 | 커버리지 | 상위 검색어 (세션) |");
    out.push("|---:|---|---:|---:|---:|---:|---|");
    shown.forEach((l, i) => {
      const tops = l.topQueries.map((q) => `${cell(q.query)} (${fmt(q.sessions)})`).join(" · ") || "-";
      out.push(`| ${i + 1} | ${cell(l.landing)} | ${fmt(l.naverSessions)} | ${fmt(l.views)} | ${fmt(l.querySessions)} | ${pct(l.coverage)} | ${tops} |`);
    });
    out.push(moreLine(report.landings.length, shown.length));
    return out.join("\n");
  }

  const shown = report.pairs.slice(0, top);
  out.push(`## 검색어 × 방문 페이지 (세션수 내림차순 → 검색어 코드 단위 · 상위 ${fmt(top)})`, "");
  out.push("| # | 검색어 | 방문 페이지 | 세션수 | 조회수 |");
  out.push("|---:|---|---|---:|---:|");
  shown.forEach((p, i) => {
    out.push(`| ${i + 1} | ${cell(p.query)} | ${cell(p.landing)} | ${fmt(p.sessions)} | ${fmt(p.views)} |`);
  });
  out.push(moreLine(report.pairs.length, shown.length));
  out.push("## 방문 페이지별 커버리지 — 네이버 세션 중 리퍼러에 검색어가 남은 비율", "");
  out.push(coverageTable(report.landings, top));
  return out.join("\n");
}

// ─────────────────────────────────────────────────────────────
// CLI (입출력 주입 — 테스트 가능하도록 순수 함수로 유지)
// ─────────────────────────────────────────────────────────────

type PathImpl = Pick<typeof nodePath, "relative" | "isAbsolute" | "sep" | "resolve">;

/** target 이 root 자신이거나 그 하위 경로인가. win32 는 path.relative 가 대소문자를 무시한다. */
export function isPathInside(target: string, root: string, pathImpl: PathImpl = nodePath): boolean {
  const rel = pathImpl.relative(pathImpl.resolve(root), pathImpl.resolve(target));
  if (rel === "") return true;
  if (pathImpl.isAbsolute(rel)) return false; // win32 다른 드라이브
  return rel !== ".." && !rel.startsWith(`..${pathImpl.sep}`);
}

export const USAGE = [
  "사용법: npx tsx scripts/naver-referrer-queries.ts <ga4-export.csv> [--top 200] [--by query|landing]",
  "  입력: GA4 탐색 분석 자유 형식 CSV — 열 '페이지 리퍼러'·'방문 페이지 + 쿼리 문자열'·'세션수'(·'조회수')",
  "  --top N   표 행 수(기본 200)",
  "  --by      query = 검색어×방문 페이지 표(기본) · landing = 방문 페이지별 커버리지·상위 검색어",
  "  ★입력 파일은 저장소 밖에 두세요(저장소 안 경로는 거부, exit 2). 결과는 stdout 뿐, 파일을 쓰지 않습니다.",
].join("\n");

export interface CliArgs {
  file: string;
  top: number;
  by: GroupBy;
}

export function parseCliArgs(argv: string[]): { ok: true; args: CliArgs } | { ok: false; help: boolean; error: string } {
  let file: string | null = null;
  let top = DEFAULT_TOP;
  let by: GroupBy = "query";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") return { ok: false, help: true, error: "" };
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
      let value: string | undefined = eq > 0 ? a.slice(eq + 1) : undefined;
      if (value === undefined) {
        value = argv[i + 1];
        if (value === undefined || value.startsWith("--")) return { ok: false, help: false, error: `--${name} 값이 없습니다.` };
        i++;
      }
      if (name === "top") {
        if (!/^\d+$/.test(value) || Number(value) < 1) return { ok: false, help: false, error: `--top 은 1 이상의 정수여야 합니다: ${value}` };
        top = Number(value);
      } else if (name === "by") {
        if (value !== "query" && value !== "landing") return { ok: false, help: false, error: `--by 는 query 또는 landing 입니다: ${value}` };
        by = value;
      } else {
        return { ok: false, help: false, error: `알 수 없는 옵션: --${name}` };
      }
      continue;
    }
    if (file !== null) return { ok: false, help: false, error: "입력 파일은 하나만 지정하세요." };
    file = a;
  }
  if (file === null) return { ok: false, help: false, error: "입력 CSV 경로가 없습니다." };
  return { ok: true, args: { file, top, by } };
}

export interface CliIo {
  /** 저장소 작업 트리 루트(스크립트 위치 기준). */
  repoRoot: string;
  cwd: string;
  /** 심볼릭 링크·정션을 푼 실제 경로(없는 파일이면 가능한 만큼). */
  realpath: (p: string) => string;
  readText: (p: string) => string;
  pathImpl?: PathImpl;
}

export interface CliResult {
  code: number;
  stdout: string;
  stderr: string;
}

/** 헤더 인식 실패 진단용 — URL 처럼 보이는 셀(데이터 행일 수 있음)은 원문을 싣지 않는다. */
function describeRecord(record: string[]): string {
  if (!record.length) return "(빈 파일)";
  return record
    .slice(0, 12)
    .map((c) => (/:\/\/|[?&=]/.test(c) ? "(URL 생략)" : c.trim().slice(0, 40)))
    .join(" | ");
}

export function runNaverReferrerCli(argv: string[], io: CliIo): CliResult {
  const p = io.pathImpl ?? nodePath;
  const parsed = parseCliArgs(argv);
  if (!parsed.ok) {
    if (parsed.help) return { code: 0, stdout: `${USAGE}\n`, stderr: "" };
    return { code: 1, stdout: "", stderr: `${parsed.error}\n${USAGE}\n` };
  }
  const { file, top, by } = parsed.args;

  // 1) 저장소 안 경로 거부 — 원본 내보내기가 작업 트리에 들어가면 커밋·배포로 새어 나갈 수 있다.
  //    읽기 전에 판정한다(파일이 없어도 거부). 문자열 경로와 실제 경로(정션·링크 해제) 둘 다 본다.
  const lexical = p.resolve(io.cwd, file);
  const real = io.realpath(lexical);
  const realRoot = io.realpath(io.repoRoot);
  if (isPathInside(lexical, io.repoRoot, p) || isPathInside(real, realRoot, p)) {
    return {
      code: 2,
      stdout: "",
      stderr:
        "거부: 입력 파일이 저장소 작업 트리 안에 있습니다 — GA4 원본 내보내기를 저장소에 두면 커밋·배포로 유출될 수 있습니다.\n" +
        "저장소 밖 폴더(예: 다운로드 폴더)로 옮긴 뒤 다시 실행하세요.\n",
    };
  }

  let text: string;
  try {
    text = io.readText(real);
  } catch {
    return { code: 1, stdout: "", stderr: `파일을 읽을 수 없습니다: ${file}\n` };
  }

  let parsedExport: ParsedExport;
  try {
    parsedExport = parseGa4NaverExport(text);
  } catch (error) {
    if (error instanceof HeaderNotFoundError) {
      return {
        code: 1,
        stdout: "",
        stderr:
          "헤더 인식 실패 — GA4 탐색 분석(자유 형식) CSV 에 '페이지 리퍼러'·'방문 페이지 + 쿼리 문자열'·'세션수' 열이 필요합니다.\n" +
          `첫 레코드: ${describeRecord(error.firstRecord)}\n`,
      };
    }
    throw error;
  }

  const report = aggregateNaverRows(parsedExport.rows);
  if (report.pairs.length === 0) {
    return {
      code: 0,
      stdout: `${NO_QUERY_MESSAGE}\n`,
      stderr: `네이버 검색 리퍼러 행 ${fmt(report.totals.naverRows)}건 · 세션 ${fmt(report.totals.naverSessions)} · 네이버 검색 외 행 ${fmt(parsedExport.droppedRows)}건\n`,
    };
  }
  return {
    code: 0,
    stdout: `${renderMarkdown(report, { top, by, hasViews: parsedExport.hasViews, droppedRows: parsedExport.droppedRows })}\n`,
    stderr: "",
  };
}
