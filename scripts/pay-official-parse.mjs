#!/usr/bin/env node
// scripts/pay-official-parse.mjs
//
// 인사혁신처 공무원 봉급표 원문 HTML 파서 + 검증기 (R6-03 2027 봉급표 D-Day 키트, 2026-09-27)
//
// 12월 말 인사혁신처가 2027 봉급표(mpm.go.kr/mpm/info/resultPay/bizSalary/2027/)를 게시하면, 저장한 페이지를
// 이 스크립트로 파싱해 src/lib/payTablesFull2027.ts 의 PAY_FULL_2027 에 넣을 teacher·policeFire·general 배열을 만든다.
// 숫자는 손으로 옮기지 않는다 — 원문 HTML 표를 파싱하고, 파싱할 수 없으면(이미지·HWP 뿐) 두 번 따로 입력해 --compare 한다.
// 런북: docs/pay-2027-dday-runbook.md
//
// 표 고르기: 표 순서가 아니라 <caption> 의 별표 제목으로 고른다(없으면 표 바로 앞 제목 문구).
//   일반직   [별표 3]  '일반직공무원과 일반직에 준하는 …'  → general    [호봉, 9급, 8급, …, 1급]
//   경찰·소방 [별표 10] '경찰공무원ㆍ소방공무원 …'         → policeFire [호봉, 순경, 경장, …, 치안정감]
//   교원     [별표 11] '유치원ㆍ초등학교ㆍ… 교원 …'        → teacher    [호봉, 금액] × 40
//   열도 위치가 아니라 머리글(계급·급수 이름)로 찾는다. 해당 계급에 없는 호봉은 null.
//   모양은 r2-l2 의 src/lib/payTablesFull2026.ts·payTablesFull2027.ts(PayFull2027)와 같다.
//
// 검증: 호봉이 1부터 빈틈없이 오름차순 · 금액은 100원 단위 양의 정수 · 호봉이 오르면 금액도 오름 · 빈 칸은 각 열의 끝에만 ·
//   교원 40행 · (--prev 가 있으면) 행 수·빈 칸 위치가 이전 연도와 같고 모든 칸이 이전 연도 이상, 전부 같으면 실패(같은 표 재저장 의심).
//
// 사용:
//   node scripts/pay-official-parse.mjs <saved.html> [--prev <json|html>] [--emit-ts] [--json <저장소 밖 경로>]
//   node scripts/pay-official-parse.mjs <saved.html> --against-module [<payTablesFull2026.ts 경로>]
//   node scripts/pay-official-parse.mjs --compare <a.json> <b.json> [--prev <json|html>] [--emit-ts]
//     --prev            이전 연도 표(이 스크립트의 --json 출력, 또는 저장한 원문 HTML) — 모양·이상 여부 대조
//     --emit-ts         PAY_FULL_2027 에 붙일 teacher·policeFire·general 리터럴 조각을 stdout 으로(보고서는 stderr).
//                       파일은 쓰지 않는다 — src/ 에는 절대 쓰지 않는다.
//     --json            파싱 결과 JSON 저장(저장소 안 경로는 거부).
//     --against-module  src/lib/payTablesFull2026.ts(10/14 배포 뒤 존재)를 tsx 로 불러 2026 파싱과 칸마다 대조.
//                       파일이 없으면 건너뛴다고 출력하고 성공. 2026 표가 아닌 페이지면 사용 오류.
//     --compare         이미지·HWP 뿐일 때: 따로 두 번 입력한 JSON({teacher, policeFire, general})을 칸마다 대조.
//                       한 칸이라도 다르면 exit 1.
// 종료 코드: 0 통과 · 1 검증 실패/차이 · 2 사용·입력 오류.
// 네트워크 없음, 가입·키 없음, node 내장 모듈만(--against-module 만 저장소의 tsx 사용).

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, isAbsolute } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_MODULE_2026 = join(REPO_ROOT, "src", "lib", "payTablesFull2026.ts");

/** 경찰·소방 계급 — 낮은 계급부터 (payTablesFull2026.ts POLICE_FIRE_RANKS_FULL 과 같은 순서) */
export const POLICE_FIRE_RANKS = [
  ["순경", "소방사"],
  ["경장", "소방교"],
  ["경사", "소방장"],
  ["경위", "소방위"],
  ["경감", "소방경"],
  ["경정", "소방령"],
  ["총경", "소방정"],
  ["경무관", "소방준감"],
  ["치안감", "소방감"],
  ["치안정감", "소방정감"],
];

/** 일반직 급수 — 9급부터 1급까지 (GENERAL_GRADES_FULL 과 같은 순서) */
export const GENERAL_GRADES = ["9급", "8급", "7급", "6급", "5급", "4급", "3급", "2급", "1급"];

export const TEACHER_ROWS = 40;

export const TABLE_LABELS = { teacher: "교원", policeFire: "경찰·소방", general: "일반직" };
const TABLE_KEYS = ["teacher", "policeFire", "general"];

/** 손으로 원문과 대조할 4칸 — col 은 행 배열 인덱스(1 = 첫 금액 열) */
export const ANCHORS = [
  { label: "9급 1호봉", table: "general", step: 1, col: 1 },
  { label: "경사 1호봉", table: "policeFire", step: 1, col: 3 },
  { label: "경감 1호봉", table: "policeFire", step: 1, col: 5 },
  { label: "교원 9호봉", table: "teacher", step: 9, col: 1 },
];

/** 원문 표 고르기 — caption(없으면 표 앞 제목 문구)에 들어 있어야 하는 별표 제목 */
const SELECTORS = {
  general: { title: "[별표 3] 일반직", test: (t) => /일반직\s*공무원과\s*일반직에\s*준하는/.test(t) },
  policeFire: { title: "[별표 10] 경찰·소방", test: (t) => /경찰\s*공무원\s*[ㆍ·•･・,]?\s*소방\s*공무원/.test(t) },
  teacher: {
    title: "[별표 11] 교원",
    test: (t) => /유치원\s*[ㆍ·•･・,]?\s*초등학교/.test(t) && /교원/.test(t) && !/국립\s*대학/.test(t),
  },
};

/** 파싱·검증 실패(code 1) 또는 사용·입력 오류(code 2) */
export class PayParseError extends Error {
  constructor(message, code = 1) {
    super(message);
    this.code = code;
  }
}

// ───────────────────────── HTML 도우미 ─────────────────────────

const ENTITIES = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", middot: "·" };

function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** 태그를 지우고 공백(U+00A0·U+3000 포함)을 하나로 */
function textOf(html) {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, " "))
    .replace(/[\s 　​﻿]+/g, " ")
    .trim();
}

const squash = (s) => s.replace(/\s+/g, "");

function rowsOf(html) {
  return [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) =>
    [...m[1].matchAll(/<(t[hd])\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi)].map((c) => {
      const span = /\b(colspan|rowspan)\s*=\s*["']?(\d+)/i.exec(c[2]);
      if (span && Number(span[2]) > 1) throw new PayParseError(`병합 셀(${span[1]}=${span[2]})이 있는 표는 지원하지 않습니다`);
      return textOf(c[3]);
    })
  );
}

/** 문서의 모든 <table> — caption, 앞 제목 문구, 머리글 행, 본문 행 */
export function extractTables(html) {
  const clean = html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ");
  const out = [];
  let prevEnd = 0;
  for (const m of clean.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)) {
    const inner = m[1];
    if (/<table\b/i.test(inner)) throw new PayParseError("표 안에 표가 있습니다(지원하지 않는 구조)");
    const cap = /<caption\b[^>]*>([\s\S]*?)<\/caption>/i.exec(inner);
    const before = textOf(clean.slice(Math.max(prevEnd, m.index - 1500), m.index));
    const thead = /<thead\b[^>]*>([\s\S]*?)<\/thead>/i.exec(inner);
    const bodies = [...inner.matchAll(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/gi)].map((b) => b[1]);
    let header;
    let rows;
    if (thead) {
      const hr = rowsOf(thead[1]);
      header = hr[hr.length - 1] ?? [];
      rows = bodies.length ? bodies.flatMap(rowsOf) : rowsOf(inner.replace(thead[0], " "));
    } else {
      const all = rowsOf(inner);
      header = all[0] ?? [];
      rows = all.slice(1);
    }
    out.push({ index: out.length, caption: cap ? textOf(cap[1]) : "", before, header, rows });
    prevEnd = m.index + m[0].length;
  }
  return out;
}

function pickTable(tables, key) {
  const sel = SELECTORS[key];
  let hits = tables.filter((t) => t.caption && sel.test(t.caption));
  if (hits.length === 0) hits = tables.filter((t) => !t.caption && sel.test(t.before.slice(-300)));
  if (hits.length === 0) throw new PayParseError(`${sel.title} 표를 찾지 못했습니다(caption·제목 문구 불일치 — 이미지·HWP 뿐이면 --compare 절차)`);
  if (hits.length > 1) throw new PayParseError(`${sel.title} 표가 ${hits.length}개입니다(표 ${hits.map((t) => t.index).join(", ")}) — 어느 것인지 모호`);
  return hits[0];
}

function yearOf(table) {
  const m = /(20\d{2})\s*년/.exec(table.caption) ?? /(20\d{2})\s*년/.exec(table.before.slice(-300));
  return m ? Number(m[1]) : null;
}

// ───────────────────────── 셀 값 ─────────────────────────

const EMPTY = new Set(["", "-", "–", "—", "－"]);

function parseStep(text, where) {
  const m = /^(\d{1,2})\s*(호봉)?$/.exec(text.trim());
  if (!m) throw new PayParseError(`${where}: 호봉 칸 '${text}' 을 읽을 수 없습니다`);
  return Number(m[1]);
}

function parseAmount(text, where) {
  const t = text.replace(/\s+/g, "");
  if (EMPTY.has(t)) return null;
  if (!/^(\d{1,3}(,\d{3})+|\d+)$/.test(t)) throw new PayParseError(`${where}: 금액 칸 '${text}' 을 읽을 수 없습니다`);
  return Number(t.replace(/,/g, ""));
}

// ───────────────────────── 표별 파싱 ─────────────────────────

function columnMap(header, labels, match, key) {
  const idx = labels.map((label) => {
    const found = header.map((h, i) => (i > 0 && match(squash(h), label) ? i : -1)).filter((i) => i >= 0);
    if (found.length !== 1) {
      throw new PayParseError(`${TABLE_LABELS[key]} 머리글에서 '${Array.isArray(label) ? label[0] : label}' 열이 ${found.length}개입니다 (머리글: ${header.join(" | ")})`);
    }
    return found[0];
  });
  if (new Set(idx).size !== idx.length) {
    throw new PayParseError(`${TABLE_LABELS[key]} 머리글에서 두 계급이 같은 열로 잡혔습니다 (머리글: ${header.join(" | ")})`);
  }
  if (header.length !== labels.length + 1) {
    throw new PayParseError(`${TABLE_LABELS[key]} 머리글 열 수 ${header.length} ≠ ${labels.length + 1} (머리글: ${header.join(" | ")})`);
  }
  return idx;
}

function parseGrid(table, key, labels, match) {
  const cols = columnMap(table.header, labels, match, key);
  return table.rows
    .filter((r) => r.some((c) => c !== ""))
    .map((r, i) => {
      const where = `${TABLE_LABELS[key]} 본문 ${i + 1}행`;
      if (r.length !== table.header.length) throw new PayParseError(`${where}: 칸 수 ${r.length} ≠ 머리글 ${table.header.length}`);
      return [parseStep(r[0], where), ...cols.map((c) => parseAmount(r[c], `${where} ${table.header[c]}`))];
    });
}

function parseTeacher(table) {
  const h = table.header.map(squash);
  if (h.length < 2 || h.length % 2 !== 0 || h.some((x, i) => x !== (i % 2 === 0 ? "호봉" : "봉급"))) {
    throw new PayParseError(`교원 머리글이 '호봉 | 봉급' 반복이 아닙니다 (머리글: ${table.header.join(" | ")})`);
  }
  const out = [];
  table.rows.forEach((r, i) => {
    const where = `교원 본문 ${i + 1}행`;
    if (r.length !== h.length) throw new PayParseError(`${where}: 칸 수 ${r.length} ≠ 머리글 ${h.length}`);
    for (let c = 0; c < r.length; c += 2) {
      const stepEmpty = EMPTY.has(r[c].replace(/\s+/g, ""));
      const pay = parseAmount(r[c + 1], `${where} ${c / 2 + 1}번째 쌍`);
      if (stepEmpty && pay === null) continue;
      if (stepEmpty || pay === null) throw new PayParseError(`${where} ${c / 2 + 1}번째 쌍: 호봉·봉급 중 하나만 있습니다`);
      out.push([parseStep(r[c], where), pay]);
    }
  });
  out.sort((a, b) => a[0] - b[0]);
  return out;
}

/**
 * 저장한 인사혁신처 봉급표 페이지 → { year, teacher, policeFire, general, captions }
 * 표를 못 찾거나 읽을 수 없는 칸이 있으면 PayParseError.
 */
export function parsePayPage(html) {
  const tables = extractTables(html);
  const general = pickTable(tables, "general");
  const policeFire = pickTable(tables, "policeFire");
  const teacher = pickTable(tables, "teacher");
  const years = [...new Set([general, policeFire, teacher].map(yearOf).filter((y) => y !== null))];
  if (years.length > 1) throw new PayParseError(`세 표의 연도가 다릅니다: ${years.join(", ")}`);
  return {
    year: years[0] ?? null,
    teacher: parseTeacher(teacher),
    policeFire: parseGrid(policeFire, "policeFire", POLICE_FIRE_RANKS, (h, [police, fire]) => h.startsWith(police) && h.includes(fire)),
    general: parseGrid(general, "general", GENERAL_GRADES, (h, grade) => h.startsWith(grade)),
    captions: { teacher: teacher.caption, policeFire: policeFire.caption, general: general.caption },
  };
}

// ───────────────────────── 검증 ─────────────────────────

const colLabel = (key, c) => (key === "teacher" ? "봉급" : key === "policeFire" ? POLICE_FIRE_RANKS[c - 1][0] : GENERAL_GRADES[c - 1]);
const EXPECTED_WIDTH = { teacher: 2, policeFire: POLICE_FIRE_RANKS.length + 1, general: GENERAL_GRADES.length + 1 };

function checkOwn(key, rows, problems) {
  const name = TABLE_LABELS[key];
  if (!Array.isArray(rows) || rows.length === 0) {
    problems.push(`${name}: 행이 없습니다`);
    return;
  }
  if (key === "teacher" && rows.length !== TEACHER_ROWS) problems.push(`교원: 행 수 ${rows.length} ≠ ${TEACHER_ROWS}`);
  const width = EXPECTED_WIDTH[key];
  rows.forEach((row, r) => {
    if (row.length !== width) problems.push(`${name} ${r + 1}행: 열 수 ${row.length} ≠ ${width}`);
    if (row[0] !== r + 1) problems.push(`${name} ${r + 1}행: 호봉 ${row[0]} — 1부터 빈틈없는 오름차순이 아님`);
    if (row.slice(1).every((v) => v === null)) problems.push(`${name} ${row[0]}호봉: 금액이 하나도 없음`);
  });
  for (let c = 1; c < width; c++) {
    let above = null;
    let sawNull = false;
    rows.forEach((row) => {
      const v = row[c];
      const where = `${name} ${row[0]}호봉 ${colLabel(key, c)}`;
      if (v === null || v === undefined) {
        sawNull = true;
        return;
      }
      if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) {
        problems.push(`${where}: ${v} 은 양의 정수가 아님`);
        return;
      }
      if (v % 100 !== 0) problems.push(`${where}: ${v} 은 100원 단위가 아님`);
      if (sawNull) problems.push(`${where}: 빈 칸 뒤에 금액이 있음(빈 칸은 열 끝에만)`);
      if (above !== null && v <= above) problems.push(`${where}: ${v} 이 앞 호봉 ${above} 보다 크지 않음`);
      above = v;
    });
  }
}

function checkAgainstPrev(key, rows, prevRows, problems) {
  const name = TABLE_LABELS[key];
  if (rows.length !== prevRows.length) problems.push(`${name}: 행 수 ${rows.length} ≠ 이전 연도 ${prevRows.length}`);
  const n = Math.min(rows.length, prevRows.length);
  for (let r = 0; r < n; r++) {
    const row = rows[r];
    const prev = prevRows[r];
    if (row[0] !== prev[0]) problems.push(`${name} ${r + 1}행: 호봉 ${row[0]} ≠ 이전 연도 ${prev[0]}`);
    if (row.length !== prev.length) {
      problems.push(`${name} ${row[0]}호봉: 열 수 ${row.length} ≠ 이전 연도 ${prev.length}`);
      continue;
    }
    for (let c = 1; c < row.length; c++) {
      const where = `${name} ${row[0]}호봉 ${colLabel(key, c)}`;
      const v = row[c];
      const p = prev[c];
      if ((v === null) !== (p === null)) problems.push(`${where}: 빈 칸 위치가 이전 연도와 다름 (${v ?? "빈 칸"} / 이전 ${p ?? "빈 칸"})`);
      else if (typeof v === "number" && typeof p === "number" && v < p) problems.push(`${where}: ${v} < 이전 연도 ${p}`);
    }
  }
}

/** 파싱·입력 결과 점검 — 문제 목록(빈 배열이면 통과). prev 가 있으면 이전 연도 모양·이상 여부도 본다. */
export function validatePayTables(data, prev = null) {
  const problems = [];
  for (const key of TABLE_KEYS) checkOwn(key, data[key], problems);
  if (prev) {
    for (const key of TABLE_KEYS) {
      if (Array.isArray(data[key]) && Array.isArray(prev[key])) checkAgainstPrev(key, data[key], prev[key], problems);
      else problems.push(`${TABLE_LABELS[key]}: 이전 연도 표가 없습니다`);
    }
    if (data.year != null && prev.year != null && data.year <= prev.year) {
      problems.push(`연도 ${data.year} 가 이전 연도 표 ${prev.year} 보다 뒤가 아님`);
    }
    const same = TABLE_KEYS.every((key) => JSON.stringify(data[key]) === JSON.stringify(prev[key]));
    if (same) problems.push("모든 칸이 이전 연도 표와 같음 — 같은 연도 표를 다시 저장했을 가능성");
  }
  return problems;
}

/** 두 입력(이미지·HWP 두 번 입력)을 칸마다 대조 — 차이 목록 */
export function compareTables(a, b, names = ["A", "B"]) {
  const diffs = [];
  for (const key of TABLE_KEYS) {
    const name = TABLE_LABELS[key];
    const ra = Array.isArray(a[key]) ? a[key] : [];
    const rb = Array.isArray(b[key]) ? b[key] : [];
    if (ra.length !== rb.length) diffs.push(`${name}: 행 수 ${names[0]}=${ra.length} ${names[1]}=${rb.length}`);
    for (let r = 0; r < Math.max(ra.length, rb.length); r++) {
      const x = ra[r] ?? [];
      const y = rb[r] ?? [];
      for (let c = 0; c < Math.max(x.length, y.length); c++) {
        if (x[c] === y[c]) continue;
        const step = x[0] ?? y[0] ?? r + 1;
        const col = c === 0 ? "호봉" : c < EXPECTED_WIDTH[key] ? colLabel(key, c) : `${c}열`;
        diffs.push(`${name} ${r + 1}행(${step}호봉) ${col}: ${names[0]}=${x[c] ?? "빈 칸"} ${names[1]}=${y[c] ?? "빈 칸"}`);
      }
    }
  }
  return diffs;
}

/** 칸별 인상률 범위와 최빈값(%, 소수 첫째 자리) */
export function raiseSummary(data, prev) {
  const out = {};
  for (const key of TABLE_KEYS) {
    const rates = [];
    data[key].forEach((row, r) =>
      row.slice(1).forEach((v, c) => {
        const p = prev[key]?.[r]?.[c + 1];
        if (typeof v === "number" && typeof p === "number" && p > 0) rates.push((v / p - 1) * 100);
      })
    );
    if (rates.length === 0) continue;
    const counts = new Map();
    for (const x of rates) counts.set(x.toFixed(1), (counts.get(x.toFixed(1)) ?? 0) + 1);
    const [mode, modeCount] = [...counts].sort((p, q) => q[1] - p[1])[0];
    out[key] = { min: Math.min(...rates).toFixed(1), max: Math.max(...rates).toFixed(1), mode, modeCount, cells: rates.length };
  }
  return out;
}

export function anchorValues(data) {
  return ANCHORS.map((a) => ({ ...a, value: data[a.table]?.find((row) => row[0] === a.step)?.[a.col] ?? null }));
}

/** PAY_FULL_2027 객체 안에 붙일 teacher·policeFire·general 리터럴 조각 */
export function emitTsFragment(data) {
  const v = (x) => (x === null ? "null" : String(x));
  const block = (key) => [`  ${key}: [`, ...data[key].map((row) => `    [${row.map(v).join(", ")}],`), "  ],"].join("\n");
  return TABLE_KEYS.map(block).join("\n") + "\n";
}

// ───────────────────────── 입력 읽기 ─────────────────────────

const isGridOf = (rows, width) =>
  Array.isArray(rows) &&
  rows.every((row) => Array.isArray(row) && row.length === width && row.every((x, i) => (i === 0 ? Number.isInteger(x) : x === null || typeof x === "number")));

/** --json 출력 또는 손 입력 JSON({teacher, policeFire, general[, year]}) */
export function loadTablesJson(file) {
  if (!existsSync(file)) throw new PayParseError(`${file}: 파일이 없습니다`, 2);
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8").replace(/^﻿/, ""));
  } catch (e) {
    throw new PayParseError(`${file}: JSON 을 읽을 수 없습니다 (${e.message})`, 2);
  }
  for (const key of TABLE_KEYS) {
    if (!isGridOf(data?.[key], EXPECTED_WIDTH[key])) {
      throw new PayParseError(
        `${file}: '${key}' 는 [호봉, ${key === "teacher" ? "금액" : "금액…"}] 행(열 ${EXPECTED_WIDTH[key]}개, 빈 칸 null)의 배열이어야 합니다`,
        2
      );
    }
  }
  return { year: Number.isInteger(data.year) ? data.year : null, teacher: data.teacher, policeFire: data.policeFire, general: data.general };
}

function loadAny(file) {
  if (!existsSync(file)) throw new PayParseError(`${file}: 파일이 없습니다`, 2);
  return /\.html?$/i.test(file) ? parsePayPage(readFileSync(file, "utf8")) : loadTablesJson(file);
}

function insideRepo(file) {
  const rel = relative(REPO_ROOT, resolve(file));
  const norm = process.platform === "win32" ? rel.toLowerCase() : rel;
  return norm === "" || (!norm.startsWith("..") && !isAbsolute(norm));
}

const MODULE_EXPORTS = { teacher: "TEACHER_PAY_FULL_2026", policeFire: "POLICE_FIRE_PAY_FULL_2026", general: "GENERAL_PAY_FULL_2026" };

/**
 * src/lib/payTablesFull2026.ts(또는 지정 경로)를 tsx 로 불러 표 3개를 돌려준다. 없으면 null.
 * 저장소 루트에서 `node --import tsx` 자식 프로세스로 동적 import — tsconfig 의 '@/…' 별칭도 풀린다.
 */
export function loadModuleTables(modulePath) {
  if (!existsSync(modulePath)) return null;
  const code = [
    "const m = await import(process.argv[1]);",
    `const names = ${JSON.stringify(MODULE_EXPORTS)};`,
    "const out = {};",
    "for (const [k, n] of Object.entries(names)) out[k] = m[n] ?? (m.default ? m.default[n] : undefined) ?? null;",
    "process.stdout.write(JSON.stringify(out));",
  ].join("\n");
  const r = spawnSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", code, pathToFileURL(resolve(modulePath)).href], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (r.status !== 0) {
    const tail = `${r.stderr ?? ""}${r.error ? String(r.error) : ""}`.trim().split(/\r?\n/).slice(-3).join(" / ");
    throw new PayParseError(`tsx 로 불러오지 못했습니다: ${tail}`, 2);
  }
  const loaded = JSON.parse(r.stdout);
  for (const key of TABLE_KEYS) {
    if (!Array.isArray(loaded[key])) throw new PayParseError(`${modulePath}: ${MODULE_EXPORTS[key]} 배열 export 가 없습니다`, 2);
  }
  return { year: 2026, teacher: loaded.teacher, policeFire: loaded.policeFire, general: loaded.general };
}

// ───────────────────────── CLI ─────────────────────────

const won = (n) => (typeof n === "number" ? `${n.toLocaleString("en-US")}원` : "없음");

export function parseArgs(argv) {
  const opts = { files: [], prev: null, emitTs: false, json: null, compare: null, againstModule: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined || v.startsWith("--")) throw new PayParseError(`${a} 뒤에 경로가 필요합니다`);
      return v;
    };
    if (a === "--prev") opts.prev = next();
    else if (a === "--json") opts.json = next();
    else if (a === "--emit-ts") opts.emitTs = true;
    else if (a === "--compare") opts.compare = [next(), next()];
    else if (a === "--against-module") {
      const v = argv[i + 1];
      if (v !== undefined && !v.startsWith("--") && /\.[cm]?tsx?$/i.test(v)) {
        opts.againstModule = v;
        i++;
      } else opts.againstModule = DEFAULT_MODULE_2026;
    } else if (a.startsWith("--against-module=")) opts.againstModule = a.slice("--against-module=".length);
    else if (a === "-h" || a === "--help") opts.help = true;
    else if (a.startsWith("--")) throw new PayParseError(`알 수 없는 옵션 ${a}`);
    else opts.files.push(a);
  }
  if (!opts.help) {
    if (opts.compare && opts.files.length) throw new PayParseError("--compare 와 HTML 파일은 함께 쓸 수 없습니다");
    if (!opts.compare && opts.files.length !== 1) throw new PayParseError("저장한 봉급표 HTML 파일 하나가 필요합니다");
    if (opts.compare && opts.againstModule) throw new PayParseError("--against-module 은 HTML 파싱에만 씁니다");
    if (opts.json && insideRepo(opts.json)) throw new PayParseError(`--json ${opts.json}: 저장소 안에는 쓰지 않습니다(저장소 밖 경로를 쓰세요)`);
  }
  return opts;
}

const USAGE = `사용:
  node scripts/pay-official-parse.mjs <saved.html> [--prev <json|html>] [--emit-ts] [--json <저장소 밖 경로>]
  node scripts/pay-official-parse.mjs <saved.html> --against-module [<payTablesFull2026.ts>]
  node scripts/pay-official-parse.mjs --compare <a.json> <b.json> [--prev <json|html>] [--emit-ts]
런북: docs/pay-2027-dday-runbook.md`;

export async function main(argv, io = { out: (s) => process.stdout.write(s), err: (s) => process.stderr.write(s) }) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (e) {
    io.err(`[pay-official-parse] ${e.message}\n${USAGE}\n`);
    return 2;
  }
  if (opts.help) {
    io.out(`${USAGE}\n`);
    return 0;
  }
  // --emit-ts 일 때 stdout 은 붙여넣을 조각만, 보고서는 stderr
  const report = opts.emitTs ? io.err : io.out;
  const say = (s = "") => report(`${s}\n`);

  let data;
  let prev = null;
  try {
    if (opts.compare) {
      const [fa, fb] = opts.compare;
      const a = loadTablesJson(fa);
      const b = loadTablesJson(fb);
      const diffs = compareTables(a, b, ["A", "B"]);
      say(`[compare] A=${fa}`);
      say(`[compare] B=${fb}`);
      if (diffs.length) {
        say(`[compare] 차이 ${diffs.length}칸 — 원문을 다시 보고 두 입력을 고친 뒤 다시 대조:`);
        for (const d of diffs.slice(0, 50)) say(`  - ${d}`);
        if (diffs.length > 50) say(`  … ${diffs.length - 50}칸 더`);
        return 1;
      }
      say("[compare] 두 입력이 모든 칸에서 같습니다.");
      data = a;
    } else {
      const file = opts.files[0];
      if (!existsSync(file)) throw new PayParseError(`${file}: 파일이 없습니다`, 2);
      data = parsePayPage(readFileSync(file, "utf8"));
      say(`[parse] ${file}`);
      say(
        `  연도 ${data.year ?? "알 수 없음"} · 교원 ${data.teacher.length}행 · 경찰·소방 ${data.policeFire.length}행 · 일반직 ${data.general.length}행`
      );
    }
    if (opts.prev) prev = loadAny(opts.prev);
  } catch (e) {
    if (e instanceof PayParseError) {
      io.err(`[pay-official-parse] ${e.message}\n`);
      return e.code;
    }
    throw e;
  }

  const maxStep = (key, labels) =>
    labels.map((label, i) => `${label} ${data[key].filter((row) => typeof row[i + 1] === "number").length}`).join(" · ");
  say(`  최고 호봉 — 경찰·소방: ${maxStep("policeFire", POLICE_FIRE_RANKS.map((r) => r[0]))}`);
  say(`  최고 호봉 — 일반직: ${maxStep("general", GENERAL_GRADES)}`);

  say("[anchors] 원문 표와 손으로 대조할 4칸 (hand-check against the official page):");
  const prevAnchors = prev ? anchorValues(prev) : null;
  anchorValues(data).forEach((a, i) => {
    const p = prevAnchors?.[i]?.value;
    const delta = typeof p === "number" && typeof a.value === "number" ? ` (이전 ${won(p)}, ${(((a.value / p) - 1) * 100).toFixed(1)}%)` : "";
    say(`  ${a.label.padEnd(8, " ")} ${won(a.value)}${delta}`);
  });

  const problems = validatePayTables(data, prev);
  if (prev) {
    say(`[prev] ${opts.prev} (연도 ${prev.year ?? "알 수 없음"})`);
    if (problems.length === 0) {
      const s = raiseSummary(data, prev);
      for (const key of TABLE_KEYS) {
        const x = s[key];
        if (x) say(`  ${TABLE_LABELS[key]} 인상률 ${x.min === x.max ? x.min : `${x.min}~${x.max}`}% (최빈 ${x.mode}% ${x.modeCount}/${x.cells}칸)`);
      }
    }
  } else {
    say("[prev] 없음 — 이전 연도 모양·이상 대조는 건너뜀 (D-Day 에는 --prev 필수)");
  }

  if (problems.length) {
    say(`[validate] 문제 ${problems.length}건:`);
    for (const p of problems.slice(0, 80)) say(`  - ${p}`);
    if (problems.length > 80) say(`  … ${problems.length - 80}건 더`);
    return 1;
  }
  say("[validate] 통과 — 호봉 연속·100원 단위·호봉별 증가·빈 칸 위치" + (prev ? "·이전 연도 모양·모든 칸 ≥ 이전 연도" : ""));

  if (opts.againstModule) {
    const modPath = opts.againstModule;
    if (!existsSync(modPath)) {
      say(`[against-module] 건너뜀: ${modPath} 없음 (10/14 봉급표 배포 전에는 정상)`);
    } else {
      if (data.year !== 2026) {
        io.err(`[pay-official-parse] --against-module 은 2026 표와만 대조합니다(이 페이지 연도 ${data.year ?? "알 수 없음"})\n`);
        return 2;
      }
      let mod;
      try {
        mod = loadModuleTables(modPath);
      } catch (e) {
        io.err(`[pay-official-parse] --against-module ${modPath}: ${e.message}\n`);
        return 2;
      }
      const diffs = compareTables(data, mod, ["원문", "모듈"]);
      if (diffs.length) {
        say(`[against-module] ${modPath} 와 ${diffs.length}칸 다름:`);
        for (const d of diffs.slice(0, 50)) say(`  - ${d}`);
        return 1;
      }
      say(`[against-module] ${modPath} 와 모든 칸 일치 (교원 ${mod.teacher.length} · 경찰·소방 ${mod.policeFire.length} · 일반직 ${mod.general.length}행)`);
    }
  }

  if (opts.json) {
    const out = { year: data.year, parsedAt: new Date().toISOString(), source: opts.compare ? opts.compare : opts.files[0], teacher: data.teacher, policeFire: data.policeFire, general: data.general };
    writeFileSync(opts.json, JSON.stringify(out, null, 1) + "\n");
    say(`[json] ${opts.json}`);
  }

  if (opts.emitTs) {
    say("[emit-ts] stdout = PAY_FULL_2027 의 teacher·policeFire·general 조각. commonRate·basis·sourceUrl·checked 는 원문 보고 따로 채움.");
    io.out(emitTsFragment(data));
  }
  return 0;
}

const invokedDirectly = (() => {
  if (!process.argv[1]) return false;
  const a = resolve(process.argv[1]);
  const b = fileURLToPath(import.meta.url);
  return process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
})();

if (invokedDirectly) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (e) => {
      process.stderr.write(`[pay-official-parse] 예기치 못한 오류: ${e?.stack ?? e}\n`);
      process.exitCode = 2;
    }
  );
}
