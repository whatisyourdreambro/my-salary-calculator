// scripts/adsense-report.mjs
// AdSense 콘솔 내보내기 CSV → 광고 실험 판정용 표(콘솔 고정폭 / --md 마크다운).
// 의존성 0 (node 내장만). 수동 도구 — 빌드·postbuild 와 무관.
// ★CSV 원본은 리포 밖(기본 C:\Users\ruby1\.moneysalary-secrets\adsense\)에 둔다. 리포에 넣지 말 것.
//
// 사용법:
//   node scripts/adsense-report.mjs window <일별.csv> <from> <to> [--compare <from2> <to2>] [--md]
//   node scripts/adsense-report.mjs join <사이트일별.csv> <subset일별.csv> <from> <to> [--md]
//   node scripts/adsense-report.mjs units <광고단위.csv> [--from <d> --to <d>] [--md]
//   node scripts/adsense-report.mjs exp1 <광고단위_전.csv> <광고단위_후.csv> [--days <n1> <n2>] [--md]
//   node scripts/adsense-report.mjs --selftest [--dir <csv 폴더>]
//
// 입력(UTF-8, 첫 줄 헤더, 영문/한글 UI 모두 — 열 이름 사전 매핑, 없는 열은 무시):
//   (a) 일별 보고서: 날짜(Date) 열 + 지표 열. 행이 날짜순이 아니어도 됨(정렬).
//   (b) 광고 단위 보고서: 광고 단위(Ad unit) 열 (+ 날짜 열이 있으면 날짜×단위). 단위 ID 는
//       이름 열 안의 10자리 숫자 또는 별도 ID 열에서 추출해 내장 매핑(UNIT_NAMES)으로 이름을 붙인다.
// 비율 열(CTR·Active View·Coverage)은 0.0445 같은 소수와 "4.45%" 표기 모두 인식.
// 숫자는 소수 둘째 자리(건수는 정수). CPC 만 셋째 자리 — 우발 클릭 기준($0.015)이 셋째 자리에 있음.
// 오류(파일·열 누락·기간 밖)는 한국어 메시지와 함께 exit 1.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const DEFAULT_DIR = "C:\\Users\\ruby1\\.moneysalary-secrets\\adsense";

// ── 광고 단위 매핑 (AdPlacement.tsx env 슬롯 기준) ─────────────────────────────
const UNIT_NAMES = {
  9958502911: "상단/HOME_TOP",
  5584143639: "결과창_본문/CALC_RESULT",
  1848295488: "가이드중간/GUIDE_MID",
  1397486615: "PC_날개/SIDEBAR",
  3302558597: "인아티클/IN_ARTICLE",
  1910866475: "멀티플렉스/MULTIPLEX",
  8284703133: "디스플레이2/DISPLAY_2",
  6458241606: "구 모바일_앵커(디스플레이·미사용)",
};
// ID 열이 없고 이름만 있는 내보내기 대비 — 이름 조각 → ID (구체적인 것부터 검사)
const UNIT_NAME_ALIASES = [
  ["8284703133", ["display_2", "display-2", "display2", "디스플레이2", "디스플레이 2"]],
  ["5584143639", ["calc_result", "결과창"]],
  ["1848295488", ["guide_mid", "가이드중간", "가이드 중간"]],
  ["1397486615", ["sidebar", "pc_날개", "날개"]],
  ["3302558597", ["in_article", "in-article", "인아티클", "인 아티클"]],
  ["1910866475", ["multiplex", "멀티플렉스"]],
  ["6458241606", ["anchor", "앵커"]],
  ["9958502911", ["home_top", "상단"]],
];
// 실험 #1 판정 대상 (docs/ad-experiments.md)
const EXP1 = { display2: "8284703133", result: "5584143639", inArticle: "3302558597" };

// ── 열 이름 사전 (정규화 후 완전 일치 → 없으면 접두 일치) ──────────────────────
const COLUMNS = {
  date: ["date", "날짜", "일자"],
  earnings: ["estimated earnings", "예상 수입", "예상수입", "earnings", "수입"],
  pageViews: ["page views", "pageviews", "페이지뷰", "페이지 뷰", "페이지 조회수"],
  pageRpm: ["page rpm", "페이지 rpm"],
  impressions: ["impressions", "노출수", "노출"],
  imprRpm: ["impression rpm", "노출 rpm", "노출수 rpm"],
  activeView: [
    "active view viewable",
    "active view 조회 가능",
    "active view 조회가능",
    "조회 가능 active view",
    "조회가능 active view",
  ],
  clicks: ["clicks", "클릭수", "클릭"],
  ctr: ["ctr", "클릭률"],
  cpc: ["cpc"],
  adRequests: ["ad requests", "광고 요청", "광고 요청수", "광고 요청 수"],
  coverage: ["coverage", "적용 범위", "적용범위", "커버리지"],
  matched: ["matched ad requests", "매칭된 광고 요청", "일치하는 광고 요청", "일치 광고 요청"],
  unitId: ["ad unit id", "ad unit code", "광고 단위 id", "광고 단위 코드", "광고단위 id"],
  unit: ["ad unit", "ad unit name", "광고 단위", "광고 단위 이름", "광고단위"],
};

// ── 공통 유틸 ──────────────────────────────────────────────────────────────────
function fail(msg) {
  console.error(`오류: ${msg}`);
  process.exit(1);
}

function usage() {
  console.log(
    [
      "AdSense CSV 판정 도구 — 사용법:",
      "  node scripts/adsense-report.mjs window <일별.csv> <from> <to> [--compare <from2> <to2>] [--md]",
      "  node scripts/adsense-report.mjs join <사이트일별.csv> <subset일별.csv> <from> <to> [--md]",
      "  node scripts/adsense-report.mjs units <광고단위.csv> [--from <d> --to <d>] [--md]",
      "  node scripts/adsense-report.mjs exp1 <광고단위_전.csv> <광고단위_후.csv> [--days <n1> <n2>] [--md]",
      "  node scripts/adsense-report.mjs --selftest [--dir <csv 폴더>]",
      "  날짜는 YYYY-MM-DD. CSV 는 리포 밖 폴더(기본 " + DEFAULT_DIR + ")에서 읽는다.",
    ].join("\n")
  );
}

// 따옴표 대응 CSV 파서 (셀 내 쉼표·줄바꿈·"" 이스케이프)
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (cell !== "" || row.length) {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      }
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

// 헤더 정규화: 소문자, 끝의 단위 괄호 "(USD)" 제거, 공백 정리
function normalizeHeader(h) {
  return String(h)
    .toLowerCase()
    .replace(/\s*[(（][^)）]*[)）]\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

// "1,234.56" / "4.45%" / "$0.02" → 숫자 (빈 셀은 null). % 는 /100.
function num(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (s === "" || s === "-" || s === "—") return null;
  const n = parseFloat(s.replace(/[^0-9.\-eE]/g, ""));
  if (!Number.isFinite(n)) return null;
  return s.endsWith("%") ? n / 100 : n;
}

// 비율 열 → 0~1. "4.45%" 는 num 에서 처리, 소수 0.0445 는 그대로, 4.45(퍼센트 숫자)는 /100.
function ratio(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (s === "") return null;
  const n = num(s);
  if (n == null) return null;
  if (s.endsWith("%")) return n;
  return n > 1 ? n / 100 : n;
}

// "2026-09-05" / "2026/9/5" / "2026. 9. 5." / "20260905" → "2026-09-05" (해석 불가 시 null)
function isoDate(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  const m = s.match(/^(\d{4})\D+(\d{1,2})\D+(\d{1,2})\D*$/) || s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (!m) return null;
  const y = +m[1];
  const mo = +m[2];
  const d = +m[3];
  if (y < 2000 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function argDate(raw, label) {
  const d = isoDate(raw);
  if (!d) fail(`날짜 형식 오류(${label}): "${raw ?? ""}" — YYYY-MM-DD 로 입력하세요`);
  return d;
}

function makeRange(fromRaw, toRaw, label = "") {
  const from = argDate(fromRaw, `${label}from`);
  const to = argDate(toRaw, `${label}to`);
  if (from > to) fail(`기간 순서 오류(${label || "기간"}): from(${from}) 이 to(${to}) 보다 늦습니다`);
  return { from, to };
}

function calendarDays({ from, to }) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1;
}

const inRange = (recs, { from, to }) => recs.filter((r) => r.date && r.date >= from && r.date <= to);

// 광고 단위 이름/ID 열 → {id, name, label, key}
function resolveUnit(nameRaw, idRaw) {
  const name = (nameRaw ?? "").trim();
  const text = `${idRaw ?? ""} ${name}`;
  const m = text.match(/(?<!\d)(\d{10})(?!\d)/);
  let id = m ? m[1] : null;
  if (!id) {
    const low = name.toLowerCase();
    for (const [uid, aliases] of UNIT_NAME_ALIASES) {
      if (aliases.some((a) => low.includes(a))) {
        id = uid;
        break;
      }
    }
  }
  const known = id ? UNIT_NAMES[id] : null;
  const label = known ? `${known} (${id})` : name || id || "(이름 없음)";
  return { id, name: known || name, label, key: id || name || "(이름 없음)" };
}

// ── CSV 로드 → 레코드 ─────────────────────────────────────────────────────────
function loadCsv(file, what = "CSV") {
  if (!file) fail(`${what} 경로가 필요합니다`);
  if (!existsSync(file)) fail(`파일을 찾을 수 없습니다: ${file}`);
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch (e) {
    fail(`파일을 읽을 수 없습니다: ${file} (${e.message})`);
  }
  text = text.replace(/^\uFEFF/, "");
  const rows = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ""));
  // GA4 식 '# 보고서 개요' 주석 블록이 앞에 있으면 건너뜀
  const hi = rows.findIndex((r) => !r[0].trim().startsWith("#") && r.length > 1);
  if (hi < 0 || rows.length < hi + 2) fail(`데이터 행이 없습니다: ${file}`);

  const header = rows[hi].map((h) => h.trim());
  const norm = header.map(normalizeHeader);
  const cols = {};
  const used = new Set();
  // 1차: 완전 일치
  for (const [field, cands] of Object.entries(COLUMNS)) {
    for (const c of cands) {
      const idx = norm.indexOf(c);
      if (idx >= 0 && !used.has(idx)) {
        cols[field] = idx;
        used.add(idx);
        break;
      }
    }
  }
  // 2차: 접두 일치 (아직 안 잡힌 열만, 이미 배정된 인덱스 제외)
  for (const [field, cands] of Object.entries(COLUMNS)) {
    if (cols[field] != null) continue;
    for (const c of cands) {
      const idx = norm.findIndex((h, i) => !used.has(i) && h.startsWith(c));
      if (idx >= 0) {
        cols[field] = idx;
        used.add(idx);
        break;
      }
    }
  }

  const hasUnit = cols.unit != null || cols.unitId != null;
  const hasDate = cols.date != null;
  const headerText = `발견된 헤더: ${header.join(" | ")}`;
  if (!hasUnit && !hasDate) fail(`필수 열이 없습니다(날짜/Date 또는 광고 단위/Ad unit): ${file}\n  ${headerText}`);
  if (cols.earnings == null) fail(`필수 열이 없습니다(예상 수입/Estimated earnings): ${file}\n  ${headerText}`);
  if (cols.impressions == null) fail(`필수 열이 없습니다(노출수/Impressions): ${file}\n  ${headerText}`);
  if (cols.clicks == null) fail(`필수 열이 없습니다(클릭수/Clicks): ${file}\n  ${headerText}`);

  const get = (r, f) => (cols[f] == null ? undefined : r[cols[f]]);
  const records = [];
  let skipped = 0;
  for (const r of rows.slice(hi + 1)) {
    const rec = { date: null, unit: null };
    if (hasDate) {
      rec.date = isoDate(get(r, "date"));
      if (!rec.date) {
        skipped++; // 합계(Total) 행 등
        continue;
      }
    }
    if (hasUnit) {
      rec.unit = resolveUnit(get(r, "unit"), get(r, "unitId"));
      // 광고 단위 보고서의 합계(Total) 행 — ID 없는 '합계' 이름은 건너뜀(수익 점유 2배 오염 방지)
      if (!rec.unit.id && /^(total|grand total|합계|총계|전체)$/i.test(rec.unit.name)) {
        skipped++;
        continue;
      }
    }
    rec.earnings = num(get(r, "earnings"));
    rec.pageViews = num(get(r, "pageViews"));
    rec.pageRpm = num(get(r, "pageRpm"));
    rec.impressions = num(get(r, "impressions"));
    rec.imprRpm = num(get(r, "imprRpm"));
    rec.clicks = num(get(r, "clicks"));
    rec.cpc = num(get(r, "cpc"));
    rec.adRequests = num(get(r, "adRequests"));
    rec.matched = num(get(r, "matched"));
    rec.ctr = ratio(get(r, "ctr"));
    rec.activeView = ratio(get(r, "activeView"));
    rec.coverage = ratio(get(r, "coverage"));
    records.push(rec);
  }
  if (!records.length) fail(`해석 가능한 데이터 행이 없습니다: ${file} (건너뛴 행 ${skipped})\n  ${headerText}`);
  if (hasDate) records.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const dates = hasDate ? records.map((r) => r.date) : [];
  return {
    file,
    base: path.basename(file),
    header,
    cols,
    records,
    mode: hasUnit ? (hasDate ? "dailyUnits" : "units") : "daily",
    skipped,
    minDate: dates.length ? dates[0] : null,
    maxDate: dates.length ? dates[dates.length - 1] : null,
  };
}

function requireDate(data, cmd) {
  if (data.cols.date == null)
    fail(`${cmd} 에는 날짜(Date) 열이 있는 일별 보고서가 필요합니다: ${data.file}\n  발견된 헤더: ${data.header.join(" | ")}`);
}
function requireUnit(data, cmd) {
  if (data.mode === "daily")
    fail(`${cmd} 에는 광고 단위(Ad unit) 열이 있는 광고 단위 보고서가 필요합니다: ${data.file}\n  발견된 헤더: ${data.header.join(" | ")}`);
}

// ── 집계 ─────────────────────────────────────────────────────────────────────
function aggregate(recs) {
  const a = {
    rows: recs.length,
    days: new Set(recs.map((r) => r.date).filter(Boolean)).size,
    earnings: 0,
    pageViews: 0,
    impressions: 0,
    clicks: 0,
    adRequests: 0,
    matched: 0,
    hasPv: false,
    hasReq: false,
    hasMatched: false,
  };
  let avW = 0;
  let avN = 0;
  let covW = 0;
  let covN = 0;
  for (const r of recs) {
    a.earnings += r.earnings ?? 0;
    if (r.pageViews != null) {
      a.pageViews += r.pageViews;
      a.hasPv = true;
    }
    a.impressions += r.impressions ?? 0;
    a.clicks += r.clicks ?? 0;
    if (r.adRequests != null) {
      a.adRequests += r.adRequests;
      a.hasReq = true;
    }
    if (r.matched != null) {
      a.matched += r.matched;
      a.hasMatched = true;
    }
    if (r.activeView != null) {
      const w = r.impressions ?? 1;
      avW += r.activeView * w;
      avN += w;
    }
    if (r.coverage != null) {
      const w = r.adRequests ?? r.impressions ?? 1;
      covW += r.coverage * w;
      covN += w;
    }
  }
  a.activeView = avN ? avW / avN : null;
  a.coverage =
    a.hasReq && a.hasMatched && a.adRequests ? a.matched / a.adRequests : covN ? covW / covN : null;
  a.pageRpm = a.pageViews ? (a.earnings / a.pageViews) * 1000 : null;
  a.imprRpm = a.impressions ? (a.earnings / a.impressions) * 1000 : null;
  a.imprPerPv = a.pageViews ? a.impressions / a.pageViews : null;
  a.ctr = a.impressions ? a.clicks / a.impressions : null;
  a.cpc = a.clicks ? a.earnings / a.clicks : null;
  return a;
}

const EMPTY_AGG = aggregate([]);

// 광고 단위별 그룹 → Map(key → {unit, agg}) (수익 내림차순)
function groupByUnit(recs) {
  const groups = new Map();
  for (const r of recs) {
    const u = r.unit ?? resolveUnit("", "");
    if (!groups.has(u.key)) groups.set(u.key, { unit: u, recs: [] });
    groups.get(u.key).recs.push(r);
  }
  const out = new Map();
  for (const [key, g] of groups) out.set(key, { unit: g.unit, agg: aggregate(g.recs) });
  return new Map([...out].sort((x, y) => y[1].agg.earnings - x[1].agg.earnings));
}

// ── 서식 ─────────────────────────────────────────────────────────────────────
const fmt = (n, d = 2) =>
  n == null || !Number.isFinite(n)
    ? "-"
    : n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtInt = (n) => (n == null || !Number.isFinite(n) ? "-" : Math.round(n).toLocaleString("en-US"));
const fmtPct = (n) => (n == null || !Number.isFinite(n) ? "-" : `${(n * 100).toFixed(2)}%`);
const share = (part, whole) => (whole ? fmtPct(part / whole) : "-");
// 변화율 (전→후). 전이 0 이면 비율 정의 불가.
function delta(before, after) {
  if (before == null || after == null || !Number.isFinite(before) || !Number.isFinite(after)) return null;
  if (before === 0) return after === 0 ? 0 : null;
  return after / before - 1;
}
const fmtDelta = (d) => (d == null ? "-" : `${d >= 0 ? "+" : ""}${(d * 100).toFixed(2)}%`);

// 한글·전각 = 2칸 (고정폭 정렬용)
function dispWidth(s) {
  let w = 0;
  for (const ch of String(s)) {
    const c = ch.codePointAt(0);
    const wide =
      (c >= 0x1100 && c <= 0x115f) ||
      (c >= 0x2e80 && c <= 0xa4cf && c !== 0x303f) ||
      (c >= 0xac00 && c <= 0xd7a3) ||
      (c >= 0xf900 && c <= 0xfaff) ||
      (c >= 0xfe30 && c <= 0xfe6f) ||
      (c >= 0xff00 && c <= 0xff60) ||
      (c >= 0xffe0 && c <= 0xffe6) ||
      (c >= 0x1f300 && c <= 0x1faff) ||
      (c >= 0x20000 && c <= 0x3fffd);
    w += wide ? 2 : 1;
  }
  return w;
}

// columns: [{key, label, align:"l"|"r"}], rows: [{key: string}]
function renderTable(columns, rows, md) {
  const cells = rows.map((r) => columns.map((c) => String(r[c.key] ?? "")));
  if (md) {
    const head = `| ${columns.map((c) => c.label).join(" | ")} |`;
    const sep = `|${columns.map((c) => (c.align === "r" ? "---:" : "---")).join("|")}|`;
    return [head, sep, ...cells.map((r) => `| ${r.map((v) => v.replace(/\|/g, "\\|")).join(" | ")} |`)].join(
      "\n"
    );
  }
  const widths = columns.map((c, i) => Math.max(dispWidth(c.label), ...cells.map((r) => dispWidth(r[i]))));
  const pad = (s, w, align) => {
    const gap = " ".repeat(Math.max(0, w - dispWidth(s)));
    return align === "r" ? gap + s : s + gap;
  };
  const line = (vals) => vals.map((v, i) => pad(v, widths[i], columns[i].align)).join("  ").trimEnd();
  return [line(columns.map((c) => c.label)), widths.map((w) => "-".repeat(w)).join("  "), ...cells.map(line)].join(
    "\n"
  );
}

const col = (key, label, align = "r") => ({ key, label, align });
const heading = (text, md) => (md ? `\n### ${text}\n` : `\n${text}\n`);
const note = (text, md) => (md ? `\n_${text}_` : `※ ${text}`);

// ── window: 기간 집계 (+ --compare) ──────────────────────────────────────────
function cmdWindow(pos, opts) {
  const [file, fromRaw, toRaw] = pos;
  if (!file || !fromRaw || !toRaw)
    fail("사용법: window <일별.csv> <from> <to> [--compare <from2> <to2>] [--md]");
  const data = loadCsv(file, "일별 CSV");
  requireDate(data, "window");
  const windows = [makeRange(fromRaw, toRaw, "창1 ")];
  if (opts.compare) {
    if (!opts.compare[0] || !opts.compare[1]) fail("--compare 에는 <from2> <to2> 두 날짜가 필요합니다");
    windows.push(makeRange(opts.compare[0], opts.compare[1], "창2 "));
  }
  const aggs = windows.map((w) => {
    const recs = inRange(data.records, w);
    if (!recs.length)
      fail(`기간 내 데이터가 없습니다: ${w.from}~${w.to} (파일 범위 ${data.minDate}~${data.maxDate})`);
    return aggregate(recs);
  });

  const metrics = [
    { label: "일수 (데이터/달력)", text: (a, w) => `${a.days}/${calendarDays(w)}` },
    { label: "수익 합계 (USD)", val: (a) => a.earnings },
    { label: "일 수익 (USD)", val: (a) => a.earnings / a.days },
    { label: "일 PV", val: (a) => (a.hasPv ? a.pageViews / a.days : null) },
    { label: "페이지 RPM (USD)", val: (a) => a.pageRpm },
    { label: "노출/PV", val: (a) => a.imprPerPv },
    { label: "일 노출", val: (a) => a.impressions / a.days },
    { label: "노출 RPM (USD)", val: (a) => a.imprRpm },
    { label: "Active View 조회 가능", val: (a) => a.activeView, pct: true },
    { label: "일 클릭", val: (a) => a.clicks / a.days },
    { label: "CTR", val: (a) => a.ctr, pct: true },
    { label: "CPC (USD)", val: (a) => a.cpc, digits: 3 },
  ];
  const rangeLabel = (w) => `${w.from}~${w.to}`;
  const columns = [col("m", "지표", "l"), col("w1", rangeLabel(windows[0]))];
  if (aggs[1]) columns.push(col("w2", rangeLabel(windows[1])), col("d", "변화율"));
  const rows = metrics.map((mt) => {
    const cell = (a, w) => {
      if (mt.text) return mt.text(a, w);
      const v = mt.val(a);
      return mt.pct ? fmtPct(v) : fmt(v, mt.digits ?? 2);
    };
    const row = { m: mt.label, w1: cell(aggs[0], windows[0]) };
    if (aggs[1]) {
      row.w2 = cell(aggs[1], windows[1]);
      row.d = mt.text ? "-" : fmtDelta(delta(mt.val(aggs[0]), mt.val(aggs[1])));
    }
    return row;
  });

  console.log(heading(`AdSense 기간 집계 — ${data.base}`, opts.md));
  console.log(renderTable(columns, rows, opts.md));
  aggs.forEach((a, i) => {
    const cal = calendarDays(windows[i]);
    if (a.days < cal)
      console.log(note(`창${i + 1} 데이터 ${a.days}일 / 달력 ${cal}일 — 누락 ${cal - a.days}일, 일 평균은 데이터 일수 기준`, opts.md));
  });
  if (data.skipped) console.log(note(`날짜 해석 불가로 건너뛴 행 ${data.skipped} (합계 행 등)`, opts.md));
}

// ── join: 사이트 일별 × subset 일별 ───────────────────────────────────────────
function runJoin(site, sub, range, opts, { limit = 0 } = {}) {
  const byDate = (data) => {
    const m = new Map();
    for (const r of inRange(data.records, range)) {
      if (!m.has(r.date)) m.set(r.date, []);
      m.get(r.date).push(r);
    }
    return new Map([...m].map(([d, recs]) => [d, aggregate(recs)]));
  };
  const siteMap = byDate(site);
  const subMap = byDate(sub);
  const dates = [...siteMap.keys()].filter((d) => subMap.has(d)).sort();
  if (!dates.length)
    fail(
      `조인된 날짜가 없습니다: ${range.from}~${range.to} (사이트 ${site.minDate}~${site.maxDate}, subset ${sub.minDate}~${sub.maxDate})`
    );
  const onlySite = [...siteMap.keys()].filter((d) => !subMap.has(d)).length;
  const onlySub = [...subMap.keys()].filter((d) => !siteMap.has(d)).length;

  const line = (label, s, u) => {
    const rest = {
      earnings: s.earnings - u.earnings,
      impressions: s.impressions - u.impressions,
      clicks: s.clicks - u.clicks,
    };
    return {
      date: label,
      siteE: fmt(s.earnings),
      subE: fmt(u.earnings),
      shE: share(u.earnings, s.earnings),
      shI: share(u.impressions, s.impressions),
      shC: share(u.clicks, s.clicks),
      subCtr: fmtPct(u.ctr),
      subCpc: fmt(u.cpc, 3),
      restRpm: fmt(rest.impressions ? (rest.earnings / rest.impressions) * 1000 : null),
      restCtr: fmtPct(rest.impressions ? rest.clicks / rest.impressions : null),
      restCpc: fmt(rest.clicks ? rest.earnings / rest.clicks : null, 3),
    };
  };
  const sumOf = (map) => {
    const t = { earnings: 0, impressions: 0, clicks: 0 };
    for (const d of dates) {
      const a = map.get(d);
      t.earnings += a.earnings;
      t.impressions += a.impressions;
      t.clicks += a.clicks;
    }
    t.ctr = t.impressions ? t.clicks / t.impressions : null;
    t.cpc = t.clicks ? t.earnings / t.clicks : null;
    return t;
  };
  const siteT = sumOf(siteMap);
  const subT = sumOf(subMap);
  const over = dates.filter((d) => {
    const s = siteMap.get(d);
    const u = subMap.get(d);
    return u.earnings > s.earnings + 1e-9 || u.impressions > s.impressions || u.clicks > s.clicks;
  }).length;

  const columns = [
    col("date", "날짜", "l"),
    col("siteE", "사이트 수익"),
    col("subE", "subset 수익"),
    col("shE", "수익 점유"),
    col("shI", "노출 점유"),
    col("shC", "클릭 점유"),
    col("subCtr", "subset CTR"),
    col("subCpc", "subset CPC"),
    col("restRpm", "나머지 노출RPM"),
    col("restCtr", "나머지 CTR"),
    col("restCpc", "나머지 CPC"),
  ];
  const shown = limit > 0 ? dates.slice(0, limit) : dates;
  const rows = shown.map((d) => line(d, siteMap.get(d), subMap.get(d)));
  rows.push(line(`합계(${dates.length}일)`, siteT, subT));

  console.log(heading(`AdSense 조인 — 사이트 ${site.base} × subset ${sub.base}`, opts.md));
  console.log(
    `기간 ${range.from}~${range.to} · 조인 ${dates.length}일 · 사이트만 ${onlySite}일 · subset만 ${onlySub}일` +
      ` · 수익 점유 ${share(subT.earnings, siteT.earnings)} · 노출 점유 ${share(subT.impressions, siteT.impressions)}` +
      ` · 클릭 점유 ${share(subT.clicks, siteT.clicks)} · subset CPC ${fmt(subT.cpc, 3)} vs 나머지 CPC ${fmt(
        siteT.clicks - subT.clicks ? (siteT.earnings - subT.earnings) / (siteT.clicks - subT.clicks) : null,
        3
      )}\n`
  );
  console.log(renderTable(columns, rows, opts.md));
  if (limit > 0 && dates.length > limit) console.log(note(`...외 ${dates.length - limit}일 생략 (합계는 전체 기준)`, opts.md));
  if (over) console.log(note(`subset 값이 사이트 값을 초과한 날 ${over}일 — 파일 조합(사이트 전체 vs 부분) 확인`, opts.md));
  return { joined: dates.length, onlySite, onlySub };
}

function cmdJoin(pos, opts) {
  const [siteFile, subFile, fromRaw, toRaw] = pos;
  if (!siteFile || !subFile || !fromRaw || !toRaw)
    fail("사용법: join <사이트일별.csv> <subset일별.csv> <from> <to> [--md]");
  const site = loadCsv(siteFile, "사이트 일별 CSV");
  const sub = loadCsv(subFile, "subset 일별 CSV");
  requireDate(site, "join");
  requireDate(sub, "join");
  runJoin(site, sub, makeRange(fromRaw, toRaw), opts);
}

// ── units: 광고 단위별 표 + 플래그 ────────────────────────────────────────────
function unitFlags(a) {
  const flags = [];
  if (a.ctr != null && a.ctr >= 0.035 && a.cpc != null && a.cpc <= 0.015) flags.push("우발 클릭 의심");
  if (a.impressions === 0 || (a.coverage != null && a.coverage < 0.5)) flags.push("죽은 유닛 의심");
  return flags.join("·");
}

function unitRows(groups) {
  const total = [...groups.values()].reduce((s, g) => s + g.agg.earnings, 0);
  return [...groups.values()].map(({ unit, agg: a }) => ({
    unit: unit.label,
    impr: fmtInt(a.impressions),
    clicks: fmtInt(a.clicks),
    ctr: fmtPct(a.ctr),
    cpc: fmt(a.cpc, 3),
    rpm: fmt(a.imprRpm),
    earn: fmt(a.earnings),
    sh: share(a.earnings, total),
    av: fmtPct(a.activeView),
    cov: fmtPct(a.coverage),
    flag: unitFlags(a),
  }));
}

const UNIT_COLUMNS = [
  col("unit", "광고 단위", "l"),
  col("impr", "노출"),
  col("clicks", "클릭"),
  col("ctr", "CTR"),
  col("cpc", "CPC (USD)"),
  col("rpm", "노출 RPM"),
  col("earn", "수익 (USD)"),
  col("sh", "수익 점유"),
  col("av", "Active View"),
  col("cov", "채움률"),
  col("flag", "플래그", "l"),
];

function cmdUnits(pos, opts) {
  const [file] = pos;
  if (!file) fail("사용법: units <광고단위.csv> [--from <d> --to <d>] [--md]");
  const data = loadCsv(file, "광고 단위 CSV");
  requireUnit(data, "units");
  let recs = data.records;
  let rangeText = "";
  if (opts.from || opts.to) {
    if (data.mode !== "dailyUnits")
      fail(`--from/--to 는 날짜 열이 있는 날짜×광고단위 보고서에서만 쓸 수 있습니다: ${data.file}`);
    const range = makeRange(opts.from ?? data.minDate, opts.to ?? data.maxDate);
    recs = inRange(recs, range);
    if (!recs.length)
      fail(`기간 내 데이터가 없습니다: ${range.from}~${range.to} (파일 범위 ${data.minDate}~${data.maxDate})`);
    rangeText = ` · 기간 ${range.from}~${range.to}`;
  } else if (data.minDate) {
    rangeText = ` · 파일 범위 ${data.minDate}~${data.maxDate}`;
  }
  const groups = groupByUnit(recs);
  console.log(heading(`AdSense 광고 단위별 — ${data.base}${rangeText}`, opts.md));
  console.log(renderTable(UNIT_COLUMNS, unitRows(groups), opts.md));
  console.log(
    note("플래그 기준: 우발 클릭 의심 = CTR ≥ 3.5% AND CPC ≤ $0.015 · 죽은 유닛 의심 = 노출 0 또는 채움률 < 50%", opts.md)
  );
  const unknown = [...groups.values()].filter((g) => !g.unit.id || !UNIT_NAMES[g.unit.id]).length;
  if (unknown) console.log(note(`내장 매핑에 없는 광고 단위 ${unknown}개 — 이름 그대로 표시`, opts.md));
}

// ── exp1: 실험 #1 판정 (display-2 확산) ───────────────────────────────────────
function cmdExp1(pos, opts) {
  const [beforeFile, afterFile] = pos;
  if (!beforeFile || !afterFile)
    fail("사용법: exp1 <광고단위_전.csv> <광고단위_후.csv> [--days <n1> <n2>] [--md]");
  const before = loadCsv(beforeFile, "전 창 광고 단위 CSV");
  const after = loadCsv(afterFile, "후 창 광고 단위 CSV");
  requireUnit(before, "exp1");
  requireUnit(after, "exp1");
  const gb = groupByUnit(before.records);
  const ga = groupByUnit(after.records);

  let days = [null, null];
  if (opts.days) {
    days = opts.days.map((d) => parseInt(d, 10));
    if (days.some((d) => !Number.isInteger(d) || d < 1)) fail("--days 에는 1 이상의 정수 두 개가 필요합니다 (전 창 일수, 후 창 일수)");
  } else {
    days = [aggregate(before.records).days || null, aggregate(after.records).days || null];
  }
  const normalized = days[0] && days[1];
  const basis = normalized ? "일평균" : "합계";
  const perDay = (v, i) => (normalized ? v / days[i] : v);

  const pick = (g, id) => g.get(id)?.agg ?? EMPTY_AGG;
  const targets = [
    ["display2", "디스플레이2/DISPLAY_2"],
    ["result", "결과창_본문/CALC_RESULT"],
    ["inArticle", "인아티클/IN_ARTICLE"],
  ];
  const rows = [];
  const stats = {};
  for (const [key, name] of targets) {
    const id = EXP1[key];
    const b = pick(gb, id);
    const a = pick(ga, id);
    const s = {
      clicksB: perDay(b.clicks, 0),
      clicksA: perDay(a.clicks, 1),
      earnB: perDay(b.earnings, 0),
      earnA: perDay(a.earnings, 1),
      rawClicksB: b.clicks,
      rawClicksA: a.clicks,
      rawEarnA: a.earnings,
      imprB: b.impressions,
      imprA: a.impressions,
      inBefore: gb.has(id),
      inAfter: ga.has(id),
    };
    s.dClicks = delta(s.clicksB, s.clicksA);
    s.dEarn = delta(s.earnB, s.earnA);
    stats[key] = s;
    rows.push({
      unit: `${name} (${id})`,
      cb: fmt(s.clicksB),
      ca: fmt(s.clicksA),
      dc: fmtDelta(s.dClicks),
      eb: fmt(s.earnB),
      ea: fmt(s.earnA),
      de: fmtDelta(s.dEarn),
      ib: fmtInt(s.imprB),
      ia: fmtInt(s.imprA),
    });
  }

  // 판정 규칙 (docs/ad-experiments.md 실험 #1)
  const sampleB = stats.result.rawClicksB + stats.inArticle.rawClicksB;
  const sampleA = stats.result.rawClicksA + stats.inArticle.rawClicksA;
  const sample = Math.min(sampleB, sampleA);
  const cond1 = stats.display2.rawEarnA > 0;
  const within = (d) => d == null || d >= -0.1; // 전 창 0 → 잠식 정의 불가 → 통과
  const cond2 = ["result", "inArticle"].every((k) => within(stats[k].dClicks) && within(stats[k].dEarn));
  let verdict;
  if (sample < 50) verdict = "판정 불가·현상 유지 (표본 부족)";
  else if (cond1 && cond2) verdict = "유지";
  else verdict = "재검토";

  const condRows = [
    {
      c: "표본: 결과창+인아티클 클릭 합계 (전/후 창 중 작은 쪽)",
      v: `${fmtInt(sampleB)} / ${fmtInt(sampleA)} → ${fmtInt(sample)}`,
      s: "≥ 50",
      ok: sample >= 50 ? "충족" : "미충족",
    },
    {
      c: "display-2 후 창 단독 수입",
      v: `$${fmt(stats.display2.rawEarnA)}`,
      s: "> 0",
      ok: cond1 ? "충족" : "미충족",
    },
    ...["result", "inArticle"].flatMap((k) => {
      const name = k === "result" ? "결과창" : "인아티클";
      return [
        {
          c: `${name} 클릭 변화 (${basis})`,
          v: fmtDelta(stats[k].dClicks) + (stats[k].dClicks == null ? " (전 창 0)" : ""),
          s: "≥ -10%",
          ok: within(stats[k].dClicks) ? "충족" : "미충족",
        },
        {
          c: `${name} 수입 변화 (${basis})`,
          v: fmtDelta(stats[k].dEarn) + (stats[k].dEarn == null ? " (전 창 0)" : ""),
          s: "≥ -10%",
          ok: within(stats[k].dEarn) ? "충족" : "미충족",
        },
      ];
    }),
  ];

  console.log(heading(`실험 #1 판정 — 전 ${before.base} / 후 ${after.base}`, opts.md));
  console.log(
    `비교 기준: ${basis}` +
      (normalized ? ` (전 ${days[0]}일 · 후 ${days[1]}일)` : " (일수 미상 — 날짜 열이 없으면 --days <n1> <n2> 로 창 길이를 지정하세요)") +
      "\n"
  );
  console.log(
    renderTable(
      [
        col("unit", "광고 단위", "l"),
        col("cb", `전 클릭(${basis})`),
        col("ca", `후 클릭(${basis})`),
        col("dc", "클릭 변화"),
        col("eb", `전 수익(${basis})`),
        col("ea", `후 수익(${basis})`),
        col("de", "수익 변화"),
        col("ib", "전 노출"),
        col("ia", "후 노출"),
      ],
      rows,
      opts.md
    )
  );
  console.log(heading("판정 근거", opts.md));
  console.log(
    renderTable([col("c", "조건", "l"), col("v", "값"), col("s", "기준"), col("ok", "충족", "l")], condRows, opts.md)
  );
  console.log(`\n판정: ${verdict}`);
  console.log(
    note("규칙: 표본 < 50 → 판정 불가·현상 유지 / display-2 후 창 수입 > 0 AND 결과창·인아티클 클릭·수입 −10% 이내 → 유지 / 그 외 재검토", opts.md)
  );
  for (const [key, name] of targets) {
    const s = stats[key];
    if (!s.inBefore && !s.inAfter) console.log(note(`${name}(${EXP1[key]}) 행이 전·후 파일 모두에 없음`, opts.md));
    else if (!s.inAfter) console.log(note(`${name}(${EXP1[key]}) 행이 후 창 파일에 없음`, opts.md));
    else if (!s.inBefore) console.log(note(`${name}(${EXP1[key]}) 행이 전 창 파일에 없음`, opts.md));
  }
  if (stats.inArticle.imprB === 0)
    console.log(note("인아티클 전 창 노출 0 — 27a692c(ins 폭 0px 수정, 2026-09-05) 이전 결함 구간일 수 있음", opts.md));
}

// ── selftest: 예시 파일 2개로 join 자가 점검 ─────────────────────────────────
function selftest(opts) {
  const dir = opts.dir || DEFAULT_DIR;
  if (!existsSync(dir)) fail(`CSV 폴더가 없습니다: ${dir} (--dir 로 지정)`);
  const files = readdirSync(dir)
    .filter((f) => /\.csv$/i.test(f))
    .sort();
  const daily = files.filter((f) => /-daily-/i.test(f)).pop();
  const subset = files.filter((f) => /-subset-/i.test(f)).pop();
  if (!daily || !subset) fail(`자가 점검용 파일이 없습니다: ${dir} 에 *-daily-*.csv 와 *-subset-*.csv 가 필요합니다`);
  const site = loadCsv(path.join(dir, daily), "사이트 일별 CSV");
  const sub = loadCsv(path.join(dir, subset), "subset 일별 CSV");
  requireDate(site, "selftest");
  requireDate(sub, "selftest");
  const range = {
    from: site.minDate > sub.minDate ? site.minDate : sub.minDate,
    to: site.maxDate < sub.maxDate ? site.maxDate : sub.maxDate,
  };
  console.log(`[selftest] 폴더 ${dir}\n[selftest] 사이트 ${daily} (${site.records.length}행) · subset ${subset} (${sub.records.length}행)`);
  const res = runJoin(site, sub, range, opts, { limit: 10 });
  const ok = res.joined >= 100;
  console.log(`\n[selftest] 조인 행 ${res.joined} (기준 ≥ 100) → ${ok ? "PASS" : "FAIL"}`);
  process.exit(ok ? 0 : 1);
}

// ── 인자 처리 ─────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const pos = [];
  const opts = { md: false, compare: null, from: null, to: null, days: null, dir: null, selftest: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--md") opts.md = true;
    else if (a === "--selftest") opts.selftest = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--compare") opts.compare = [argv[++i], argv[++i]];
    else if (a === "--from") opts.from = argv[++i];
    else if (a === "--to") opts.to = argv[++i];
    else if (a === "--days") opts.days = [argv[++i], argv[++i]];
    else if (a === "--dir") opts.dir = argv[++i];
    else if (a.startsWith("--")) fail(`알 수 없는 옵션: ${a}`);
    else pos.push(a);
  }
  return { pos, opts };
}

const { pos, opts } = parseArgs(process.argv.slice(2));
if (opts.help) {
  usage();
  process.exit(0);
}
if (opts.selftest) selftest(opts);
else {
  const cmd = pos.shift();
  const handlers = { window: cmdWindow, join: cmdJoin, units: cmdUnits, exp1: cmdExp1 };
  if (!cmd || !handlers[cmd]) {
    if (cmd) console.error(`오류: 알 수 없는 서브커맨드: ${cmd}`);
    usage();
    process.exit(1);
  }
  handlers[cmd](pos, opts);
}
