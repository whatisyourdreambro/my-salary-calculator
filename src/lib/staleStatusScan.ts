// src/lib/staleStatusScan.ts
//
// 상태 문구 신선도 스캐너 — 순수 함수 (의존성 0, fs·시계 접근 없음). R4 freshness-scan (2026-09-26).
// CLI: npx tsx scripts/stale-status-scan.ts [--today YYYY-MM-DD] [--days N] [--fail-on N] [--press]
//
// 배경: 성과급 계산기·시즌 페이지의 '미타결·교섭 중·장기화·예정' 같은 진행형 문구는 날짜 스탬프와 함께
// 적히는데, 사건이 끝난 뒤에도 수주~수개월 방치되는 일이 반복됐다(2026-08 감사의 만료 세트, 9월 SK 가결 동기화 등).
// 이 모듈은 "진행형 상태 단어 + 날짜 스탬프"가 한 줄에 같이 있고 그 날짜가 기준일보다 N일 넘게 지난 줄을 찾는다.
// 무엇을 고칠지는 사람이 판단한다(리뷰 보조 도구 — 런타임 영향 없음, package.json 스크립트 없음).
//
// 규칙
// - 상태 단어: STATUS_WORDS (두 단어짜리는 띄어쓰기 유무 모두 허용 — '교섭중'도 잡는다).
// - 날짜 스탬프(기본 5종): '(YYYY-MM 기준)' · 'YYYY-MM-DD 기준' · 'YYYY년 M월 기준' · 'YYYY년 M월 D일 기준' · '(YYYY-MM)'.
//   '기준' 형식은 괄호 유무를 따지지 않는다. --press 를 주면 'YYYY-MM-DD 보도'(보도일 스탬프)도 날짜로 본다.
// - 월 단위 스탬프는 그 달 1일로 본다(가리킬 수 있는 가장 이른 날 = 먼저 경고하는 쪽).
// - 한 줄에 스탬프가 여러 개면 가장 최근 날짜가 그 줄의 날짜다(최근 확인 표시가 하나라도 있으면 갱신된 줄).
// - 경과일 = 기준일 − 줄 날짜(일 단위). 경과일 > days 일 때만 표시 — 경계일(= days)은 표시하지 않는다. 미래 날짜는 음수라 제외.
// - 입력은 LF·CRLF 모두 같은 줄 번호로 처리한다.

export const STATUS_WORDS = [
  "미타결",
  "교섭 중",
  "심의 중",
  "진행 중",
  "장기화",
  "예정",
  "발표 전",
  "고시 전",
  "확정 전",
  "미정",
  "전망",
] as const;

/** 상태 단어 정규식 — 두 단어짜리는 사이 공백 0~1칸 허용 */
const STATUS_SOURCE = STATUS_WORDS.map((w) => w.replace(" ", "\\s?")).join("|");
const STATUS_TEST_RE = new RegExp(STATUS_SOURCE);
const STATUS_ALL_RE = new RegExp(STATUS_SOURCE, "g");

/**
 * 날짜 스탬프 정규식. 각 캡처: 1=연, 2=월, 3=일(선택).
 * 연도 앞 \b 는 더 긴 숫자·영숫자 안의 부분 일치를 막는다(lookbehind 는 tsconfig target ES2017 이라 쓰지 않음).
 */
const STAMP_DASH_BASIS_RE = /\b(\d{4})-(\d{2})(?:-(\d{2}))?(?!\d)\s?기준/g; // (YYYY-MM 기준) · YYYY-MM-DD 기준
const STAMP_KOREAN_BASIS_RE = /\b(\d{4})년\s?(\d{1,2})월(?:\s?(\d{1,2})일)?\s?기준/g; // YYYY년 M월 (D일) 기준
const STAMP_PAREN_MONTH_RE = /\((\d{4})-(\d{2})\)/g; // (YYYY-MM)
const STAMP_PRESS_RE = /\b(\d{4})-(\d{2})-(\d{2})(?!\d)\s?보도/g; // --press: YYYY-MM-DD 보도

export const DEFAULT_DAYS = 30;
export const SNIPPET_MAX = 120;
/** 스캔 루트 (저장소 루트 기준) */
export const SCAN_ROOTS = ["src/app", "src/data", "src/config", "src/lib"] as const;

const DAY_MS = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export type DateStamp = {
  /** 줄에서 찾은 원문 (예: '2026년 8월 기준') */
  raw: string;
  /** 해석한 날짜 YYYY-MM-DD (월 단위 스탬프는 1일) */
  iso: string;
  /** 원문 시작 위치 (UTF-16 인덱스) */
  index: number;
};

export type StaleFinding = {
  /** 저장소 루트 기준 경로 ('/' 구분) */
  file: string;
  /** 1부터 시작하는 줄 번호 */
  line: number;
  /** 기준일 − 줄 날짜 (일) */
  ageDays: number;
  /** 줄 날짜로 쓴 스탬프 (가장 최근) */
  stamp: DateStamp;
  /** 줄에서 찾은 상태 단어 (중복 제거, 등장 순) */
  statusWords: string[];
  /** 공백 정리 후 최대 SNIPPET_MAX 자(코드포인트) 발췌 */
  snippet: string;
  /** 주석 줄(// · /* · *)이면 true — 화면에 안 나가는 줄이라 우선순위가 낮다 */
  comment: boolean;
};

export type ScanOptions = {
  /** 기준일 YYYY-MM-DD (KST 달력일) */
  today: string;
  /** 경과일 임계 — 이보다 오래된 줄만 표시 */
  days: number;
  /** 'YYYY-MM-DD 보도' 스탬프도 날짜로 인정 */
  press?: boolean;
};

/** YYYY-MM-DD 가 실제 달력일이면 UTC 자정 ms, 아니면 null */
export function isoToUtcMs(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return ymdToUtcMs(Number(m[1]), Number(m[2]), Number(m[3]));
}

function ymdToUtcMs(y: number, mo: number, d: number): number | null {
  if (!Number.isInteger(y) || !Number.isInteger(mo) || !Number.isInteger(d)) return null;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const ms = Date.UTC(y, mo - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
  return ms;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** 두 달력일 사이 일수 (to − from). 둘 중 하나라도 잘못된 날짜면 NaN */
export function daysBetween(fromIso: string, toIso: string): number {
  const a = isoToUtcMs(fromIso);
  const b = isoToUtcMs(toIso);
  if (a === null || b === null) return Number.NaN;
  return Math.round((b - a) / DAY_MS);
}

/** 주어진 시각의 KST 달력일 YYYY-MM-DD (시계는 호출자가 넘긴다) */
export function kstDateIso(now: Date): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 줄에서 날짜 스탬프를 모두 찾는다 (등장 순). 달력에 없는 날짜(2월 30일 등)는 버린다. */
export function parseDateStamps(line: string, opts: { press?: boolean } = {}): DateStamp[] {
  const out: DateStamp[] = [];
  const res: RegExp[] = [STAMP_DASH_BASIS_RE, STAMP_KOREAN_BASIS_RE, STAMP_PAREN_MONTH_RE];
  if (opts.press) res.push(STAMP_PRESS_RE);
  for (const re of res) {
    for (const m of line.matchAll(re)) {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = m[3] === undefined ? 1 : Number(m[3]);
      const ms = ymdToUtcMs(y, mo, d);
      if (ms === null) continue;
      out.push({ raw: m[0], iso: `${y}-${pad2(mo)}-${pad2(d)}`, index: m.index ?? 0 });
    }
  }
  return out.sort((a, b) => a.index - b.index);
}

/** 줄의 상태 단어 (중복 제거, 등장 순, 원문 그대로) */
export function findStatusWords(line: string): string[] {
  const seen = new Set<string>();
  for (const m of line.matchAll(STATUS_ALL_RE)) seen.add(m[0]);
  return [...seen];
}

/** 주석 줄 판정 — 줄 머리가 // · /* · * 이면 주석 */
export function isCommentLine(line: string): boolean {
  return /^\s*(\/\/|\/\*|\*)/.test(line);
}

/**
 * 공백을 한 칸으로 정리한 줄에서 초점 구간 [focusStart, focusEnd) (UTF-16 인덱스) 주변을 최대 max 코드포인트로 자른다.
 * 구간이 창에 들어가면 구간 전체를, 안 들어가면 구간 머리부터 보여준다.
 * 앞뒤를 자르면 '…' 를 붙이고 그 글자도 max 에 포함한다.
 */
export function makeSnippet(
  normalized: string,
  focusStart: number,
  focusEnd: number = focusStart,
  max: number = SNIPPET_MAX,
): string {
  const cps = Array.from(normalized);
  if (cps.length <= max) return normalized;
  const toCp = (i: number) => Array.from(normalized.slice(0, Math.max(0, i))).length;
  const fs = toCp(focusStart);
  const fe = Math.max(fs, toCp(focusEnd));
  const budget = max - 2; // 앞뒤 '…' 자리
  const lead = Math.floor(budget / 4); // 초점 앞 문맥 1/4
  let start = Math.max(0, fs - lead);
  if (fe > start + budget) start = Math.max(0, Math.min(fs, fe - budget));
  const end = Math.min(cps.length, start + budget);
  start = Math.max(0, end - budget);
  return (start > 0 ? "…" : "") + cps.slice(start, end).join("") + (end < cps.length ? "…" : "");
}

/** 한 줄 판정 — 표시 대상이면 finding(파일·줄 번호 제외 필드), 아니면 null */
export function evaluateLine(
  rawLine: string,
  opts: ScanOptions,
): Omit<StaleFinding, "file" | "line"> | null {
  if (!STATUS_TEST_RE.test(rawLine)) return null;
  const normalized = rawLine.replace(/\s+/g, " ").trim();
  const stamps = parseDateStamps(normalized, { press: opts.press });
  if (stamps.length === 0) return null;
  let latest = stamps[0];
  for (const s of stamps) if (s.iso > latest.iso) latest = s;
  const ageDays = daysBetween(latest.iso, opts.today);
  if (!(ageDays > opts.days)) return null; // 경계일·미래·NaN 은 제외
  // 발췌 초점 = 줄 날짜 스탬프와 그에 가장 가까운 상태 단어를 함께 담는 구간
  let near: { index: number; end: number } | null = null;
  for (const m of normalized.matchAll(STATUS_ALL_RE)) {
    const index = m.index ?? 0;
    if (near === null || Math.abs(index - latest.index) < Math.abs(near.index - latest.index)) {
      near = { index, end: index + m[0].length };
    }
  }
  const stampEnd = latest.index + latest.raw.length;
  const focusStart = near ? Math.min(near.index, latest.index) : latest.index;
  const focusEnd = near ? Math.max(near.end, stampEnd) : stampEnd;
  return {
    ageDays,
    stamp: latest,
    statusWords: findStatusWords(normalized),
    snippet: makeSnippet(normalized, focusStart, focusEnd),
    comment: isCommentLine(rawLine),
  };
}

/** 파일 본문 전체 스캔 — LF·CRLF 무관 */
export function scanText(text: string, file: string, opts: ScanOptions): StaleFinding[] {
  const out: StaleFinding[] = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const hit = evaluateLine(lines[i], opts);
    if (hit) out.push({ file, line: i + 1, ...hit });
  }
  return out;
}

/**
 * 스캔 대상 경로인가 (저장소 루트 기준, '/' 또는 '\' 구분 모두 허용).
 * 제외: __tests__ · fixtures(__fixtures__) 디렉터리, *.generated.ts(x), *.fixture(s).ts(x), *.test/*.spec.ts(x).
 */
export function isScannableSourcePath(relPath: string): boolean {
  const p = relPath.replace(/\\/g, "/");
  if (!/\.(ts|tsx)$/.test(p)) return false;
  if (!SCAN_ROOTS.some((r) => p === r || p.startsWith(`${r}/`))) return false;
  const segs = p.split("/");
  if (segs.some((s) => s === "__tests__" || s === "fixtures" || s === "__fixtures__")) return false;
  const base = segs[segs.length - 1];
  if (/\.generated\.tsx?$/.test(base)) return false;
  if (/\.fixtures?\.tsx?$/.test(base)) return false;
  if (/\.(test|spec)\.tsx?$/.test(base)) return false;
  return true;
}

/** 오래된 순(경과일 내림차순) → 경로 → 줄 번호 */
export function sortFindings(findings: StaleFinding[]): StaleFinding[] {
  return [...findings].sort(
    (a, b) => b.ageDays - a.ageDays || a.file.localeCompare(b.file) || a.line - b.line,
  );
}

export type CliArgs =
  | { kind: "run"; today: string; days: number; failOn: number | null; press: boolean; root: string | null }
  | { kind: "help" }
  | { kind: "error"; message: string };

/** CLI 인자 해석 — 기준일 기본값은 호출자가 넘긴 KST 오늘 */
export function parseCliArgs(argv: readonly string[], defaultToday: string): CliArgs {
  let today = defaultToday;
  let days = DEFAULT_DAYS;
  let failOn: number | null = null;
  let press = false;
  let root: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const [flag, inline] = a.startsWith("--") && a.includes("=") ? [a.slice(0, a.indexOf("=")), a.slice(a.indexOf("=") + 1)] : [a, undefined];
    const takeValue = (): string | null => {
      if (inline !== undefined) return inline;
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) return null;
      i++;
      return v;
    };
    switch (flag) {
      case "-h":
      case "--help":
        return { kind: "help" };
      case "--press":
        press = true;
        break;
      case "--today": {
        const v = takeValue();
        if (v === null || isoToUtcMs(v) === null) return { kind: "error", message: `--today 는 YYYY-MM-DD 달력일이어야 합니다: ${v ?? "(없음)"}` };
        today = v;
        break;
      }
      case "--days": {
        const v = takeValue();
        if (v === null || !/^\d+$/.test(v)) return { kind: "error", message: `--days 는 0 이상의 정수여야 합니다: ${v ?? "(없음)"}` };
        days = Number(v);
        break;
      }
      case "--fail-on": {
        const v = takeValue();
        if (v === null || !/^\d+$/.test(v) || Number(v) < 1) return { kind: "error", message: `--fail-on 은 1 이상의 정수여야 합니다: ${v ?? "(없음)"}` };
        failOn = Number(v);
        break;
      }
      case "--root": {
        const v = takeValue();
        if (v === null) return { kind: "error", message: "--root 에 경로가 필요합니다" };
        root = v;
        break;
      }
      default:
        return { kind: "error", message: `알 수 없는 인자: ${a}` };
    }
  }
  return { kind: "run", today, days, failOn, press, root };
}

/** --fail-on 판정 — 주어졌고 발견 수가 그 이상이면 true */
export function shouldFail(count: number, failOn: number | null): boolean {
  return failOn !== null && count >= failOn;
}

/** 마크다운 인라인 코드 — 본문 속 백틱보다 긴 펜스를 쓴다 (CommonMark) */
export function codeSpan(s: string): string {
  const longest = Math.max(0, ...Array.from(s.matchAll(/`+/g), (m) => m[0].length));
  const fence = "`".repeat(longest + 1);
  const pad = s.startsWith("`") || s.endsWith("`") ? " " : "";
  return `${fence}${pad}${s}${pad}${fence}`;
}

export type ReportMeta = {
  today: string;
  days: number;
  press: boolean;
  filesScanned: number;
  /** 소요 시간 (ms) — CLI 가 잰 값, 없으면 생략 */
  elapsedMs?: number;
};

/** 파일별로 묶은 마크다운 보고서 (파일 순서 = 가장 오래된 발견 순) */
export function formatReport(findings: StaleFinding[], meta: ReportMeta): string {
  const sorted = sortFindings(findings);
  const groups = new Map<string, StaleFinding[]>();
  for (const f of sorted) {
    const g = groups.get(f.file);
    if (g) g.push(f);
    else groups.set(f.file, [f]);
  }
  const forms = meta.press ? "기본 5종 + 'YYYY-MM-DD 보도'" : "기본 5종";
  const lines: string[] = [];
  lines.push("# 상태 문구 신선도 스캔 (stale-status-scan)");
  lines.push("");
  lines.push(`- 기준일 ${meta.today} (KST) · 임계 ${meta.days}일 초과 · 날짜 형식 ${forms}`);
  lines.push(`- 대상 ${SCAN_ROOTS.join(", ")} (.ts/.tsx, __tests__·fixtures·*.generated·*.test 제외)`);
  const elapsed = meta.elapsedMs === undefined ? "" : ` · ${(meta.elapsedMs / 1000).toFixed(2)}초`;
  lines.push(`- 파일 ${meta.filesScanned.toLocaleString("en-US")}개 스캔 · 발견 ${sorted.length}건 (${groups.size}개 파일)${elapsed}`);
  lines.push("");
  if (sorted.length === 0) {
    lines.push("발견 없음.");
    return `${lines.join("\n")}\n`;
  }
  for (const [file, list] of groups) {
    list.sort((a, b) => a.line - b.line);
    lines.push(`## ${file} (${list.length}건)`);
    lines.push("");
    for (const f of list) {
      const tag = f.comment ? " · 주석" : "";
      lines.push(
        `- ${codeSpan(`${f.file}:${f.line}`)} · ${f.ageDays}일 · ${codeSpan(f.stamp.raw)} · ${f.statusWords.join("/")}${tag} — ${codeSpan(f.snippet)}`,
      );
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}
