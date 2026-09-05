// scripts/metrics-ingest.mjs
// 콘솔 내보내기 CSV(GSC 커버리지·GA4 소스/매체) → 집계 1줄 → docs/metrics-log.md 1행.
// 의존성 0 (node 내장만). 수동 도구 — 빌드·postbuild 와 무관.
// ★CSV 원본은 리포 밖(기본 C:\Users\ruby1\.moneysalary-secrets\)에 둔다. 리포에는 집계만 남긴다.
// AdSense 집계는 scripts/adsense-report.mjs 가 담당(여기서 재구현하지 않음) — log 에는 그 결과를 텍스트로 넘긴다.
// GSC 성과(검색어·페이지 3버킷)는 scripts/gsc-snipe.mjs 가 담당.
//
// 사용법:
//   node scripts/metrics-ingest.mjs gsc-coverage <표.csv> [<차트.csv>] [--not-indexed <urls.csv>]... [--indexed <urls.csv>]...
//                                   [--section /salary-db/listed/] [--section-total <n>] [--date YYYY-MM-DD] [--json] [--out <결과.json>]
//   node scripts/metrics-ingest.mjs ga4-sources <소스매체.csv> [--json] [--out <결과.json>]
//   node scripts/metrics-ingest.mjs log --date YYYY-MM-DD [--window "9/13 기준 28일"] [--ga4 <결과.json|텍스트>]
//                                   [--gsc <결과.json|텍스트>] [--adsense "<adsense-report 요약 텍스트>"] [--note "..."] [--file <로그.md>]
//   node scripts/metrics-ingest.mjs --selftest
//
// 입력(UTF-8, BOM 허용, 영문/한글 UI 모두):
//   gsc-coverage — 서치콘솔 '색인 생성 → 페이지' 내보내기 zip 의 표.csv(사유·페이지 수) / 차트.csv(날짜·색인 생성됨·색인 안 됨)
//                  + 사유별 상세 내보내기(URL·최종 크롤링). 파일 종류는 헤더로 자동 판별.
//                  URL 목록은 --not-indexed / --indexed 로 역할을 지정(위치 인자로 준 URL 목록은 미색인으로 간주).
//                  섹션 색인률: 색인·미색인 URL 목록이 모두 있으면 색인/(색인+미색인), 아니면 --section-total 로 1−미색인/전체.
//   ga4-sources  — GA4 보고서 → 획득 → 트래픽 획득 → 세션 소스/매체 CSV('# …' 개요 주석 블록 허용, 합계 행 제외).
//   log          — 집계 1행만 append. 검색어·페이지·URL 원본 목록은 절대 쓰지 않는다.
// 오류(파일·열 누락·형식)는 한국어 메시지와 함께 exit 1.

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdtempSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const DEFAULT_LOG = path.join(REPO_ROOT, "docs", "metrics-log.md");
const EXAMPLES_DIR = path.join(SCRIPT_DIR, "metrics-ingest-examples");
const DEFAULT_SECTION = "/salary-db/listed/";
const LOG_HEADER = "| 날짜 | 창 | GA4 세션·소스 점유 | GSC 커버리지 | AdSense | 비고 |";

// ── GA4 소스/매체 → 채널 그룹 (구체적인 것부터 검사, 순서 중요) ─────────────────
// 예: 'blog.naver.com / referral' 은 네이버가 아니라 커뮤니티, 'gemini.google.com' 은 google 이 아니라 AI.
const SOURCE_GROUPS = [
  ["사내망", ["samsung.net", "menlosecurity", "teams", "office"]],
  ["AI", ["chatgpt", "openai", "copilot", "claude", "perplexity", "gemini"]],
  ["커뮤니티", ["dcinside", "fmkorea", "everytime", "instagram", "facebook", "threads", "blog", "cafe", "tistory", "clien", "ruliweb", "ppomppu"]],
  ["네이버", ["naver"]],
  ["direct", ["(direct)"]],
  ["google", ["google"]],
  ["bing/yahoo/ddg", ["bing", "yahoo", "duckduckgo"]],
];
const GROUP_ORDER = [...SOURCE_GROUPS.map(([g]) => g), "other"];

// ── 공통 유틸 ──────────────────────────────────────────────────────────────────
function fail(msg) {
  console.error(`오류: ${msg}`);
  process.exit(1);
}

function usage() {
  console.log(
    [
      "콘솔 CSV 집계 도구 — 사용법:",
      "  node scripts/metrics-ingest.mjs gsc-coverage <표.csv> [<차트.csv>] [--not-indexed <urls.csv>]... [--indexed <urls.csv>]...",
      "                                  [--section /salary-db/listed/] [--section-total <n>] [--date YYYY-MM-DD] [--json] [--out <결과.json>]",
      "  node scripts/metrics-ingest.mjs ga4-sources <소스매체.csv> [--json] [--out <결과.json>]",
      '  node scripts/metrics-ingest.mjs log --date YYYY-MM-DD [--window "..."] [--ga4 <결과.json|텍스트>] [--gsc <결과.json|텍스트>]',
      '                                  [--adsense "<adsense-report 요약>"] [--note "..."] [--file <로그.md>]',
      "  node scripts/metrics-ingest.mjs --selftest",
      "  CSV 원본은 리포 밖 폴더(C:\\Users\\ruby1\\.moneysalary-secrets\\)에 두고 절대 경로로 넘긴다. 로그에는 집계만 남는다.",
    ].join("\n")
  );
}

// 따옴표 대응 CSV 파서 (셀 내 쉼표·줄바꿈·"" 이스케이프) — gsc-snipe.mjs 와 동일 구현
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

// 파일 → {header(정규화), rawHeader, rows(데이터 행)}. GA4 '# …' 주석 블록·빈 행 건너뜀, 첫 표만 사용.
function loadTable(file, what = "CSV") {
  if (!file) fail(`${what} 경로가 필요합니다`);
  if (!existsSync(file)) fail(`파일을 찾을 수 없습니다: ${file}`);
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch (e) {
    fail(`파일을 읽을 수 없습니다: ${file} (${e.message})`);
  }
  text = text.replace(/^\uFEFF/, "");
  const all = parseCsv(text);
  const hi = all.findIndex((r) => r.some((c) => c.trim() !== "") && !r[0].trim().startsWith("#"));
  if (hi < 0) fail(`데이터 행이 없습니다: ${file}`);
  const rawHeader = all[hi].map((h) => h.trim());
  const header = rawHeader.map((h) => h.toLowerCase().replace(/\s+/g, " "));
  const rows = [];
  for (const r of all.slice(hi + 1)) {
    if (!r.some((c) => c.trim() !== "")) break; // 빈 행 = 표 끝(GA4 는 뒤에 날짜별 두 번째 표가 붙는다)
    if (r[0].trim().startsWith("#")) break;
    rows.push(r);
  }
  return { file, base: path.basename(file), header, rawHeader, rows };
}

const findCol = (header, names) => header.findIndex((h) => names.some((n) => h.includes(n)));

// "1,234" / "12.3%" → 숫자 (빈 셀·해석 불가 → null)
function num(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (s === "" || s === "-" || s === "—") return null;
  const n = parseFloat(s.replace(/[^0-9.\-eE]/g, ""));
  return Number.isFinite(n) ? n : null;
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

const fmtInt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("en-US"));
const fmtPct = (r) => (r == null ? "—" : `${(r * 100).toFixed(1)}%`);
const isTotalRow = (s) => /^(합계|총계|전체|total|grand total)$/i.test(String(s ?? "").trim());

function emit(result, opts, text) {
  if (opts.out) {
    writeFileSync(opts.out, JSON.stringify(result, null, 2) + "\n", "utf8");
    console.log(`[out] ${opts.out}`);
  }
  if (opts.json) console.log(JSON.stringify(result, null, 2));
  else console.log(text);
}

// ── gsc-coverage ──────────────────────────────────────────────────────────────
// 파일 종류 판별: reasons(사유·페이지) / chart(날짜·색인 생성됨) / urls(URL·최종 크롤링)
function detectGscKind(t) {
  const h = t.header;
  const iReason = findCol(h, ["사유", "reason"]);
  const iPages = findCol(h, ["페이지", "pages"]);
  if (iReason >= 0 && iPages >= 0 && iReason !== iPages) return "reasons";
  const iDate = findCol(h, ["날짜", "date"]);
  const iIndexed = h.findIndex((c) => /색인|index/.test(c) && !/않|안 됨|안됨|not/.test(c));
  if (iDate >= 0 && iIndexed >= 0) return "chart";
  if (h[0] === "url" || findCol(h, ["url", "페이지", "page"]) === 0) return "urls";
  return null;
}

function readReasons(t) {
  const iReason = findCol(t.header, ["사유", "reason"]);
  const iPages = findCol(t.header, ["페이지", "pages"]);
  const out = [];
  for (const r of t.rows) {
    const reason = (r[iReason] ?? "").trim();
    const pages = num(r[iPages]);
    if (!reason || pages == null || isTotalRow(reason)) continue;
    out.push({ reason, pages });
  }
  if (!out.length) fail(`사유별 행이 없습니다: ${t.file}\n  발견된 헤더: ${t.rawHeader.join(" | ")}`);
  out.sort((a, b) => b.pages - a.pages);
  return out;
}

function readChart(t) {
  const h = t.header;
  const iDate = findCol(h, ["날짜", "date"]);
  const iNot = h.findIndex((c) => /색인|index/.test(c) && /않|안 됨|안됨|not/.test(c));
  const iIdx = h.findIndex((c) => /색인|index/.test(c) && !/않|안 됨|안됨|not/.test(c));
  if (iIdx < 0) fail(`차트 CSV 에 '색인 생성됨/Indexed' 열이 없습니다: ${t.file}\n  발견된 헤더: ${t.rawHeader.join(" | ")}`);
  let latest = null;
  for (const r of t.rows) {
    const date = isoDate(r[iDate]);
    if (!date) continue;
    const indexed = num(r[iIdx]);
    const notIndexed = iNot >= 0 ? num(r[iNot]) : null;
    if (indexed == null) continue;
    if (!latest || date > latest.date) latest = { date, indexed, notIndexed };
  }
  if (!latest) fail(`차트 CSV 에 해석 가능한 날짜 행이 없습니다: ${t.file}`);
  return latest;
}

function readUrls(t) {
  const iUrl = findCol(t.header, ["url", "페이지", "page"]);
  const urls = [];
  for (const r of t.rows) {
    const u = (r[iUrl] ?? "").trim();
    if (!u || isTotalRow(u)) continue;
    urls.push(u);
  }
  return urls;
}

// URL 이 섹션(경로 접두)에 속하는지 — 절대 URL·경로 모두 허용, 한글 슬러그(인코딩) 무관
function inSection(u, prefix) {
  let p = u;
  try {
    p = new URL(u).pathname;
  } catch {
    /* 경로만 온 경우 */
  }
  return p.startsWith(prefix) || decodeURIComponent(p).startsWith(prefix);
}

// 사유 이름 축약(로그 셀용) — 알 수 없는 사유는 앞 16자
function shortReason(reason) {
  const r = reason.toLowerCase();
  if (r.startsWith("발견됨") || r.startsWith("discovered")) return "발견됨-미색인";
  if (r.startsWith("크롤링됨") || r.startsWith("crawled")) return "크롤링됨-미색인";
  if (r.includes("noindex")) return "noindex";
  if (r.includes("404") || r.includes("찾을 수 없음") || r.includes("not found")) return "404";
  if (r.includes("리디렉션") || r.includes("redirect")) return "리디렉션";
  if (r.includes("대체 페이지") || r.includes("alternate page")) return "대체(canonical)";
  if (r.includes("중복") || r.includes("duplicate")) return "중복";
  if (r.includes("차단") || r.includes("blocked")) return "robots차단";
  if (r.includes("소프트 404") || r.includes("soft 404")) return "soft404";
  return reason.length > 16 ? reason.slice(0, 16) + "…" : reason;
}

function cmdGscCoverage(pos, opts) {
  if (!pos.length && !opts.notIndexed.length && !opts.indexed.length) fail("gsc-coverage 에는 표.csv(사유별) 또는 차트.csv, URL 목록 중 최소 1개가 필요합니다");
  const section = opts.section || DEFAULT_SECTION;
  let reasons = null;
  let chart = null;
  const notIndexedUrls = [];
  const indexedUrls = [];
  const inputs = [];

  for (const f of pos) {
    const t = loadTable(f, "GSC CSV");
    const kind = detectGscKind(t);
    if (kind === "reasons") {
      if (reasons) fail(`사유별 표 CSV 가 2개입니다: ${t.file}`);
      reasons = readReasons(t);
    } else if (kind === "chart") {
      if (chart) fail(`차트 CSV 가 2개입니다: ${t.file}`);
      chart = readChart(t);
    } else if (kind === "urls") {
      notIndexedUrls.push(...readUrls(t));
    } else {
      fail(`GSC 커버리지 CSV 로 인식되지 않습니다(표/차트/URL 목록 아님): ${t.file}\n  발견된 헤더: ${t.rawHeader.join(" | ")}`);
    }
    inputs.push(`${t.base}(${kind})`);
  }
  for (const f of opts.notIndexed) {
    const t = loadTable(f, "미색인 URL 목록");
    if (detectGscKind(t) !== "urls") fail(`--not-indexed 파일이 URL 목록이 아닙니다: ${t.file}\n  발견된 헤더: ${t.rawHeader.join(" | ")}`);
    notIndexedUrls.push(...readUrls(t));
    inputs.push(`${t.base}(urls:미색인)`);
  }
  for (const f of opts.indexed) {
    const t = loadTable(f, "색인 URL 목록");
    if (detectGscKind(t) !== "urls") fail(`--indexed 파일이 URL 목록이 아닙니다: ${t.file}\n  발견된 헤더: ${t.rawHeader.join(" | ")}`);
    indexedUrls.push(...readUrls(t));
    inputs.push(`${t.base}(urls:색인)`);
  }

  const notIndexedUnique = new Set(notIndexedUrls);
  const indexedUnique = new Set(indexedUrls);
  const secNot = [...notIndexedUnique].filter((u) => inSection(u, section)).length;
  const secIdx = [...indexedUnique].filter((u) => inSection(u, section)).length;
  const sectionTotal = opts.sectionTotal != null ? num(opts.sectionTotal) : null;
  if (opts.sectionTotal != null && (sectionTotal == null || sectionTotal <= 0)) fail(`--section-total 은 양의 정수여야 합니다: ${opts.sectionTotal}`);

  let sectionRate = null;
  let basis = null;
  if (indexedUnique.size && (secIdx + secNot) > 0) {
    sectionRate = secIdx / (secIdx + secNot);
    basis = "URL 목록(색인+미색인)";
  } else if (sectionTotal) {
    sectionRate = Math.max(0, 1 - secNot / sectionTotal);
    basis = `--section-total ${fmtInt(sectionTotal)}`;
  }

  const indexed = chart ? chart.indexed : indexedUnique.size || null;
  const notIndexedTotal = chart && chart.notIndexed != null ? chart.notIndexed : reasons ? reasons.reduce((s, r) => s + r.pages, 0) : notIndexedUnique.size || null;
  const indexRate = indexed != null && notIndexedTotal != null && indexed + notIndexedTotal > 0 ? indexed / (indexed + notIndexedTotal) : null;
  const date = opts.date ? argDate(opts.date, "--date") : chart ? chart.date : null;

  const result = {
    kind: "gsc-coverage",
    date,
    inputs,
    indexed,
    notIndexed: notIndexedTotal,
    indexRate,
    reasons: reasons || [],
    section: { prefix: section, indexed: indexedUnique.size ? secIdx : null, notIndexed: secNot, total: sectionTotal, rate: sectionRate, basis },
    urlLists: { notIndexed: notIndexedUnique.size, indexed: indexedUnique.size },
  };

  const lines = [`# GSC 커버리지${date ? ` — ${date}` : ""}`, `입력: ${inputs.join(", ") || "(없음)"}`];
  lines.push(`색인 생성됨 ${fmtInt(indexed)} · 색인 안 됨 ${fmtInt(notIndexedTotal)} → 색인률 ${fmtPct(indexRate)}${chart ? " (차트 최신일 기준)" : ""}`);
  if (reasons) {
    lines.push("", "| 사유 | 페이지 |", "|---|---:|");
    for (const r of reasons) lines.push(`| ${r.reason} | ${fmtInt(r.pages)} |`);
  }
  lines.push("");
  if (notIndexedUnique.size || indexedUnique.size) {
    lines.push(`섹션 ${section}: 미색인 URL ${fmtInt(secNot)}${indexedUnique.size ? ` · 색인 URL ${fmtInt(secIdx)}` : ""} → 색인률 ${fmtPct(sectionRate)}${basis ? ` (${basis})` : " (--indexed 목록 또는 --section-total 필요)"}`);
    lines.push(`URL 목록: 미색인 ${fmtInt(notIndexedUnique.size)}건 · 색인 ${fmtInt(indexedUnique.size)}건 (원본 목록은 출력하지 않음)`);
  } else {
    lines.push(`섹션 ${section}: URL 목록 없음 — 사유별 상세 내보내기를 --not-indexed 로 넘기면 색인률을 계산합니다`);
  }
  emit(result, opts, lines.join("\n"));
  return result;
}

// ── ga4-sources ───────────────────────────────────────────────────────────────
function groupOf(sourceMedium) {
  const s = sourceMedium.toLowerCase();
  for (const [g, keys] of SOURCE_GROUPS) if (keys.some((k) => s.includes(k))) return g;
  return "other";
}

function cmdGa4Sources(pos, opts) {
  const t = loadTable(pos[0], "GA4 소스/매체 CSV");
  const h = t.header;
  let iDim = findCol(h, ["세션 소스/매체", "세션 소스 / 매체", "session source / medium", "session source/medium", "소스/매체", "source / medium", "source/medium"]);
  let iSrc = -1;
  let iMed = -1;
  if (iDim < 0) {
    iSrc = findCol(h, ["세션 소스", "session source", "소스", "source"]);
    iMed = findCol(h, ["세션 매체", "session medium", "매체", "medium"]);
    if (iSrc < 0) fail(`'세션 소스/매체(Session source / medium)' 열이 없습니다: ${t.file}\n  발견된 헤더: ${t.rawHeader.join(" | ")}`);
  }
  // 세션 열: 완전 일치 우선('참여 세션수' 오매칭 방지), 없으면 측정기준 열을 제외한 첫 '세션' 포함 열
  let iSess = h.findIndex((c) => /^(세션|세션수|sessions)$/.test(c));
  if (iSess < 0) iSess = h.findIndex((c, i) => i !== iDim && i !== iSrc && i !== iMed && /세션|sessions/.test(c));
  if (iSess < 0) fail(`'세션(Sessions)' 열이 없습니다: ${t.file}\n  발견된 헤더: ${t.rawHeader.join(" | ")}`);

  const groups = Object.fromEntries(GROUP_ORDER.map((g) => [g, { sessions: 0, rows: 0 }]));
  let total = 0;
  let totalRow = null;
  const top = [];
  for (const r of t.rows) {
    const dim = iDim >= 0 ? (r[iDim] ?? "").trim() : `${(r[iSrc] ?? "").trim()} / ${iMed >= 0 ? (r[iMed] ?? "").trim() : ""}`;
    const sessions = num(r[iSess]);
    if (sessions == null) continue;
    if (!dim || isTotalRow(dim) || isTotalRow(iDim >= 0 ? dim : r[iSrc])) {
      totalRow = sessions;
      continue;
    }
    const g = groupOf(dim);
    groups[g].sessions += sessions;
    groups[g].rows += 1;
    total += sessions;
    top.push({ source: dim, group: g, sessions });
  }
  if (!total) fail(`세션이 0 이거나 데이터 행이 없습니다: ${t.file}`);
  top.sort((a, b) => b.sessions - a.sessions);

  const shares = GROUP_ORDER.map((g) => ({ group: g, sessions: groups[g].sessions, rows: groups[g].rows, share: groups[g].sessions / total }))
    .filter((x) => x.sessions > 0)
    .sort((a, b) => b.sessions - a.sessions);
  const result = { kind: "ga4-sources", file: t.base, total, totalRow, groups: shares, otherTop: top.filter((x) => x.group === "other").slice(0, 5) };

  const lines = [`# GA4 세션 소스/매체 — ${t.base}`, `세션 합계 ${fmtInt(total)}${totalRow != null && Math.round(totalRow) !== Math.round(total) ? ` (파일 합계 행 ${fmtInt(totalRow)} — 행 합과 다름, 필터/샘플링 확인)` : ""} · 소스 ${fmtInt(top.length)}행`, "", "| 그룹 | 세션 | 점유 | 소스 수 |", "|---|---:|---:|---:|"];
  for (const s of shares) lines.push(`| ${s.group} | ${fmtInt(s.sessions)} | ${fmtPct(s.share)} | ${s.rows} |`);
  if (result.otherTop.length) lines.push("", `other 상위: ${result.otherTop.map((x) => `${x.source} ${fmtInt(x.sessions)}`).join(" · ")}`);
  emit(result, opts, lines.join("\n"));
  return result;
}

// ── log ───────────────────────────────────────────────────────────────────────
function argDate(raw, label) {
  const d = isoDate(raw);
  if (!d) fail(`날짜 형식 오류(${label}): "${raw ?? ""}" — YYYY-MM-DD 로 입력하세요`);
  return d;
}

const cell = (s) => String(s ?? "—").replace(/\|/g, "／").replace(/\r?\n/g, " ").trim() || "—";

function formatGa4(r) {
  const parts = (r.groups || []).map((g) => `${g.group} ${fmtPct(g.share)}`);
  return `세션 ${fmtInt(r.total)} — ${parts.join("·")}`;
}

function formatGsc(r) {
  const parts = [];
  if (r.indexed != null || r.notIndexed != null) parts.push(`색인 ${fmtInt(r.indexed)}·미색인 ${fmtInt(r.notIndexed)}(${fmtPct(r.indexRate)})`);
  if (r.reasons && r.reasons.length) parts.push(`사유: ${r.reasons.slice(0, 3).map((x) => `${shortReason(x.reason)} ${fmtInt(x.pages)}`).join("·")}`);
  if (r.section && r.section.rate != null) {
    const s = r.section;
    const detail = s.indexed != null ? `${fmtInt(s.indexed)}/${fmtInt(s.indexed + s.notIndexed)}` : `미색인 ${fmtInt(s.notIndexed)}/${fmtInt(s.total)}`;
    parts.push(`${s.prefix} 색인률 ${fmtPct(s.rate)}(${detail})`);
  } else if (r.section && r.section.notIndexed) {
    parts.push(`${r.section.prefix} 미색인 ${fmtInt(r.section.notIndexed)}`);
  }
  return parts.join(" · ") || "—";
}

// --ga4/--gsc 인자: JSON 파일 경로면 파싱해 요약, 아니면 텍스트 그대로
function resolveCell(raw, expectKind, formatter) {
  if (raw == null) return "—";
  if (existsSync(raw) && /\.json$/i.test(raw)) {
    let data;
    try {
      data = JSON.parse(readFileSync(raw, "utf8"));
    } catch (e) {
      fail(`JSON 을 읽을 수 없습니다: ${raw} (${e.message})`);
    }
    if (data.kind !== expectKind) fail(`${raw} 는 ${expectKind} 결과가 아닙니다(kind=${data.kind ?? "없음"})`);
    return formatter(data);
  }
  return raw;
}

function cmdLog(pos, opts) {
  if (pos.length) fail(`log 는 위치 인자를 받지 않습니다: ${pos.join(" ")}`);
  const date = argDate(opts.date, "--date");
  const file = opts.file || DEFAULT_LOG;
  if (!existsSync(file)) fail(`로그 파일이 없습니다: ${file} (docs/metrics-log.md 를 먼저 만들거나 --file 로 지정)`);
  const text = readFileSync(file, "utf8");
  if (!text.includes(LOG_HEADER)) fail(`로그 파일에 표 헤더가 없습니다: ${file}\n  필요한 헤더: ${LOG_HEADER}`);
  const ga4 = resolveCell(opts.ga4, "ga4-sources", formatGa4);
  const gsc = resolveCell(opts.gsc, "gsc-coverage", formatGsc);
  if ([ga4, gsc, opts.adsense, opts.note].every((v) => v == null || v === "—")) fail("기록할 내용이 없습니다: --ga4 / --gsc / --adsense / --note 중 하나 이상");
  const row = `| ${date} | ${cell(opts.window)} | ${cell(ga4)} | ${cell(gsc)} | ${cell(opts.adsense)} | ${cell(opts.note)} |`;
  if (text.includes(`| ${date} |`)) console.log(`[log] 같은 날짜 행이 이미 있습니다(${date}) — 창이 다르면 정상, 아니면 수동 정리`);
  appendFileSync(file, (text.endsWith("\n") ? "" : "\n") + row + "\n", "utf8");
  console.log(`[log] ${file} 에 1행 추가:\n${row}`);
  return row;
}

// ── selftest: 합성 예시 CSV 로 3 서브커맨드 자가 점검 ───────────────────────────
function selftest() {
  const ex = (f) => path.join(EXAMPLES_DIR, f);
  const checks = [];
  const check = (name, ok, detail = "") => {
    checks.push(ok);
    console.log(`[selftest] ${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  };
  for (const f of ["gsc-coverage-table.csv", "gsc-coverage-chart.csv", "gsc-not-indexed-urls.csv", "gsc-indexed-urls.csv", "ga4-sources-ko.csv", "ga4-sources-en.csv"])
    if (!existsSync(ex(f))) fail(`예시 파일이 없습니다: ${ex(f)}`);

  console.log(`[selftest] 예시 폴더 ${EXAMPLES_DIR}\n`);
  const quiet = { json: false, out: null };
  const origLog = console.log;
  const capture = (fn) => {
    const buf = [];
    console.log = (...a) => buf.push(a.join(" "));
    try {
      return [fn(), buf.join("\n")];
    } finally {
      console.log = origLog;
    }
  };

  // 1) gsc-coverage: 표 + 차트 + 미색인/색인 URL 목록 → 섹션 색인률 2/(2+3)
  const [gsc] = capture(() =>
    cmdGscCoverage([ex("gsc-coverage-table.csv"), ex("gsc-coverage-chart.csv"), ex("gsc-not-indexed-urls.csv")], {
      ...quiet,
      notIndexed: [],
      indexed: [ex("gsc-indexed-urls.csv")],
      section: DEFAULT_SECTION,
      sectionTotal: null,
      date: null,
    })
  );
  check("gsc-coverage 차트 최신일", gsc.date === "2026-09-12" && gsc.indexed === 1420 && gsc.notIndexed === 173, `${gsc.date} 색인 ${gsc.indexed} 미색인 ${gsc.notIndexed}`);
  check("gsc-coverage 사유 3행(따옴표 셀 포함)", gsc.reasons.length === 3 && gsc.reasons[0].pages === 120 && gsc.reasons[2].reason.includes(","), gsc.reasons.map((r) => `${r.reason}=${r.pages}`).join(" / "));
  check("gsc-coverage 섹션 색인률 40.0%", gsc.section.indexed === 2 && gsc.section.notIndexed === 3 && Math.abs(gsc.section.rate - 0.4) < 1e-9, `${gsc.section.indexed}/${gsc.section.indexed + gsc.section.notIndexed}`);

  // 1b) --section-total 경로
  const [gsc2] = capture(() =>
    cmdGscCoverage([ex("gsc-not-indexed-urls.csv")], { ...quiet, notIndexed: [], indexed: [], section: DEFAULT_SECTION, sectionTotal: "219", date: "2026-09-13" })
  );
  check("gsc-coverage --section-total 219 → 1−3/219", gsc2.date === "2026-09-13" && Math.abs(gsc2.section.rate - (1 - 3 / 219)) < 1e-9, fmtPct(gsc2.section.rate));

  // 2) ga4-sources: 한글 헤더(+# 주석 블록·합계 행) 와 영문 헤더가 같은 점유율
  const [ko] = capture(() => cmdGa4Sources([ex("ga4-sources-ko.csv")], quiet));
  const [en] = capture(() => cmdGa4Sources([ex("ga4-sources-en.csv")], quiet));
  const share = (r, g) => (r.groups.find((x) => x.group === g) || { share: 0 }).share;
  const expect = { 네이버: 0.7, direct: 0.2, google: 0.04, 커뮤니티: 0.02, 사내망: 0.02, "bing/yahoo/ddg": 0.01, AI: 0.005, other: 0.005 };
  const koOk = ko.total === 1000 && Object.entries(expect).every(([g, v]) => Math.abs(share(ko, g) - v) < 1e-9);
  check("ga4-sources 한글 헤더·주석·합계 제외", koOk, `세션 ${ko.total} · ${ko.groups.map((g) => `${g.group} ${fmtPct(g.share)}`).join("·")}`);
  check("ga4-sources 영문 헤더 동일 결과", en.total === ko.total && GROUP_ORDER.every((g) => Math.abs(share(en, g) - share(ko, g)) < 1e-9));
  check("ga4-sources blog.naver→커뮤니티·gemini→AI", groupOf("blog.naver.com / referral") === "커뮤니티" && groupOf("gemini.google.com / referral") === "AI" && groupOf("m.search.naver.com / referral") === "네이버");

  // 3) log: 임시 로그 파일에 JSON 결과 2개로 1행 append
  const tmp = mkdtempSync(path.join(os.tmpdir(), "metrics-ingest-"));
  const logFile = path.join(tmp, "metrics-log.md");
  const gscJson = path.join(tmp, "gsc.json");
  const ga4Json = path.join(tmp, "ga4.json");
  writeFileSync(logFile, `# 임시\n\n${LOG_HEADER}\n|---|---|---|---|---|---|\n`, "utf8");
  writeFileSync(gscJson, JSON.stringify(gsc), "utf8");
  writeFileSync(ga4Json, JSON.stringify(ko), "utf8");
  const [row] = capture(() =>
    cmdLog([], { date: "2026-09-13", window: "28일", ga4: ga4Json, gsc: gscJson, adsense: "RPM $4.40 | 테스트", note: "selftest", file: logFile })
  );
  const after = readFileSync(logFile, "utf8");
  check(
    "log 1행 append(집계만·파이프 이스케이프)",
    after.trim().endsWith(row) && row.includes("세션 1,000") && row.includes("/salary-db/listed/ 색인률 40.0%(2/5)") && row.includes("RPM $4.40 ／ 테스트") && !row.includes("moneysalary.com/salary-db/listed/00"),
    row
  );

  const ok = checks.every(Boolean);
  console.log(`\n[selftest] ${checks.filter(Boolean).length}/${checks.length} → ${ok ? "PASS" : "FAIL"}`);
  process.exit(ok ? 0 : 1);
}

// ── 인자 처리 ─────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const pos = [];
  const opts = {
    json: false,
    out: null,
    section: null,
    sectionTotal: null,
    notIndexed: [],
    indexed: [],
    date: null,
    window: null,
    ga4: null,
    gsc: null,
    adsense: null,
    note: null,
    file: null,
    selftest: false,
    help: false,
  };
  const need = (a, i) => {
    if (argv[i + 1] == null) fail(`${a} 뒤에 값이 필요합니다`);
    return argv[i + 1];
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "--selftest") opts.selftest = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--out") opts.out = need(a, i++);
    else if (a === "--section") opts.section = need(a, i++);
    else if (a === "--section-total") opts.sectionTotal = need(a, i++);
    else if (a === "--not-indexed") opts.notIndexed.push(need(a, i++));
    else if (a === "--indexed") opts.indexed.push(need(a, i++));
    else if (a === "--date") opts.date = need(a, i++);
    else if (a === "--window") opts.window = need(a, i++);
    else if (a === "--ga4") opts.ga4 = need(a, i++);
    else if (a === "--gsc") opts.gsc = need(a, i++);
    else if (a === "--adsense") opts.adsense = need(a, i++);
    else if (a === "--note") opts.note = need(a, i++);
    else if (a === "--file") opts.file = need(a, i++);
    else if (a.startsWith("--")) fail(`알 수 없는 옵션: ${a}`);
    else pos.push(a);
  }
  if (opts.section && !opts.section.startsWith("/")) fail(`--section 은 '/' 로 시작하는 경로 접두여야 합니다: ${opts.section}`);
  return { pos, opts };
}

const { pos, opts } = parseArgs(process.argv.slice(2));
if (opts.help) {
  usage();
  process.exit(0);
}
if (opts.selftest) selftest();
else {
  const cmd = pos.shift();
  const handlers = { "gsc-coverage": cmdGscCoverage, "ga4-sources": cmdGa4Sources, log: cmdLog };
  if (!cmd || !handlers[cmd]) {
    if (cmd) console.error(`오류: 알 수 없는 서브커맨드: ${cmd}`);
    usage();
    process.exit(1);
  }
  if (cmd !== "log" && !pos.length && !opts.notIndexed.length && !opts.indexed.length) {
    usage();
    fail(`${cmd} 에는 CSV 경로가 필요합니다`);
  }
  handlers[cmd](pos, opts);
}
