// scripts/fact-sentinel/lib/scan.mjs
// 사이트 소스에서 사실(fact)별 수치 언급을 찾는다 — 읽기 전용, 사이트 파일은 절대 수정하지 않는다.
//   · 대상: src/app/**, src/components/**, src/lib/** 의 .ts/.tsx
//     (제외: __tests__ 폴더, *.test.*, *.generated.ts, 정본 상수 파일 자체)
//   · 주석(//, /* */, JSX {/* */})은 화면에 안 보이므로 언급에서 빼고, 분류 맥락에서도 공백으로 가린다.
//   · 파일 → 경로: src/app/<route>/page.tsx 와 같은 폴더(또는 하위 폴더)의 Client·Content·faq 등은 그 경로,
//     src/lib/guides/*.ts·guidesContent.ts 는 'guides:<slug>', src/lib/simpleCalculators/*.ts 는 '/calc/<slug>',
//     그 밖(src/components 등)은 '(공용)'.
//   · 담당 힌트: --owners 로 받은 목록 파일(guides-files.txt → guides-workflow, oct-files.txt → oct).

import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative, sep } from "node:path";

export const SCAN_ROOTS = ["src/app", "src/components", "src/lib"];
export const FIXTURE_SUFFIX = ".fixture";
export const SHARED_ROUTE = "(공용)";
export const CONTEXT_RADIUS = 60;

const toPosix = (p) => p.split(sep).join("/");

/** 실제 저장소(또는 픽스처 저장소) 파일 소스. 픽스처는 '<경로>.fixture' 로 저장해 tsc·eslint 대상에서 뺀다. */
export function createFileSource(root, { fixture = false } = {}) {
  const map = new Map(); // 가상 경로 → 실제 경로
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name === "node_modules" || e.name === ".next" || e.name.startsWith(".git")) continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else {
        let rel = toPosix(relative(root, full));
        if (fixture) {
          if (!rel.endsWith(FIXTURE_SUFFIX)) continue;
          rel = rel.slice(0, -FIXTURE_SUFFIX.length);
        }
        map.set(rel, full);
      }
    }
  };
  for (const r of [...SCAN_ROOTS, "src/config", "docs"]) walk(join(root, r));
  return {
    root,
    fixture,
    list: () => [...map.keys()].sort(),
    has: (rel) => map.has(rel),
    read: (rel) => {
      const full = map.get(rel);
      if (!full) {
        const err = new Error(`없음: ${rel}`);
        err.code = "ENOENT";
        throw err;
      }
      return readFileSync(full, "utf8");
    },
    size: (rel) => {
      try {
        return statSync(map.get(rel)).size;
      } catch {
        return 0;
      }
    },
  };
}

/** 스캔 대상 여부(가상 경로 기준). */
export function isScanTarget(rel, excluded = new Set()) {
  if (!/\.(ts|tsx)$/.test(rel)) return false;
  if (!SCAN_ROOTS.some((r) => rel.startsWith(r + "/"))) return false;
  if (/(^|\/)__tests__\//.test(rel)) return false;
  if (/\.test\.(ts|tsx)$/.test(rel)) return false;
  if (/\.generated\.ts$/.test(rel)) return false;
  if (excluded.has(rel)) return false;
  return true;
}

/**
 * 주석을 공백으로 바꾼 텍스트(길이·줄바꿈 보존)와 주석 여부 판정기.
 * 문자열('…', "…", `…${…}`)을 추적한다. 정규식 리터럴 안의 따옴표는 드물어 무시(줄 끝에서 따옴표 상태 해제).
 */
export function maskComments(text) {
  const out = text.split("");
  const n = text.length;
  const inComment = new Uint8Array(n);
  let i = 0;
  let state = "code"; // code | sq | dq | tpl | line | block
  const tplDepth = []; // 템플릿 안 ${ 중첩: 각 원소 = 그 표현식 안 중괄호 깊이
  while (i < n) {
    const c = text[i];
    const d = text[i + 1];
    if (state === "line") {
      if (c === "\n") state = "code";
      else {
        inComment[i] = 1;
        if (c !== "\r") out[i] = " ";
      }
      i += 1;
      continue;
    }
    if (state === "block") {
      if (c === "*" && d === "/") {
        inComment[i] = 1;
        inComment[i + 1] = 1;
        out[i] = " ";
        out[i + 1] = " ";
        i += 2;
        state = "code";
        continue;
      }
      inComment[i] = 1;
      if (c !== "\n" && c !== "\r") out[i] = " ";
      i += 1;
      continue;
    }
    if (state === "sq" || state === "dq") {
      if (c === "\\") {
        i += 2;
        continue;
      }
      if ((state === "sq" && c === "'") || (state === "dq" && c === '"') || c === "\n") state = "code";
      i += 1;
      continue;
    }
    if (state === "tpl") {
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === "`") {
        state = "code";
        i += 1;
        continue;
      }
      if (c === "$" && d === "{") {
        tplDepth[tplDepth.length] = 0;
        state = "code";
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }
    // code
    if (c === "/" && d === "/") {
      state = "line";
      inComment[i] = 1;
      inComment[i + 1] = 1;
      out[i] = " ";
      out[i + 1] = " ";
      i += 2;
      continue;
    }
    if (c === "/" && d === "*") {
      state = "block";
      inComment[i] = 1;
      inComment[i + 1] = 1;
      out[i] = " ";
      out[i + 1] = " ";
      i += 2;
      continue;
    }
    if (c === "'") state = "sq";
    else if (c === '"') state = "dq";
    else if (c === "`") state = "tpl";
    else if (tplDepth.length) {
      if (c === "{") tplDepth[tplDepth.length - 1] += 1;
      else if (c === "}") {
        if (tplDepth[tplDepth.length - 1] === 0) {
          tplDepth.length -= 1;
          state = "tpl";
        } else tplDepth[tplDepth.length - 1] -= 1;
      }
    }
    i += 1;
  }
  return { masked: out.join(""), inComment: (idx) => inComment[idx] === 1 };
}

/** 줄 시작 오프셋 표 → 오프셋의 1-기반 줄 번호. */
export function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) if (text[i] === "\n") starts[starts.length] = i + 1;
  const lineOf = (off) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= off) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
  return { starts, lineOf, count: starts.length };
}

/** 메타데이터 줄(keywords 배열 안, title/description 등 키) 집합. */
export function metaLines(lines) {
  const set = new Set();
  let inKeywords = false;
  let pendingKey = false;
  for (let k = 0; k < lines.length; k += 1) {
    const L = lines[k];
    const ln = k + 1;
    if (inKeywords) {
      set.add(ln);
      if (/\]/.test(L)) inKeywords = false;
      continue;
    }
    if (/\bkeywords\s*:\s*\[/.test(L)) {
      set.add(ln);
      if (!/\]/.test(L.slice(L.indexOf("[")))) inKeywords = true;
      continue;
    }
    if (pendingKey && L.trim()) {
      set.add(ln);
      pendingKey = false;
      continue;
    }
    const key = /^\s*["']?(title|description|metaDescription|ogTitle|ogDescription|seoTitle|shareTitle)["']?\s*:\s*(.*)$/.exec(L);
    if (key) {
      set.add(ln);
      if (!key[2].trim()) pendingKey = true;
    }
  }
  return set;
}

/** 빈 줄로 나뉜 블록 [시작줄, 끝줄] — 줄 번호 → 블록. 너무 긴 블록은 ±10줄 창으로 대신한다. */
export function blockOf(lines, ln, maxLines = 80) {
  let a = ln;
  let b = ln;
  while (a > 1 && lines[a - 2].trim() !== "") a -= 1;
  while (b < lines.length && lines[b].trim() !== "") b += 1;
  if (b - a + 1 > maxLines) return [Math.max(a, ln - 10), Math.min(b, ln + 10)];
  return [a, b];
}

/** 페이지 폴더 집합(가상 경로) — 경로 매핑용. */
export function pageDirs(files) {
  const dirs = new Set();
  for (const f of files) {
    const m = /^(src\/app(?:\/.*)?)\/page\.(tsx|ts|jsx|js|mdx)$/.exec(f);
    if (m) dirs.add(m[1]);
  }
  return dirs;
}

function appDirToRoute(dir) {
  const segs = dir
    .replace(/^src\/app\/?/, "")
    .split("/")
    .filter((s) => s && !/^\(.*\)$/.test(s) && !s.startsWith("@"));
  return "/" + segs.join("/");
}

/** 가상 경로 + 줄 → 경로 문자열. lines 는 slug 탐색용(guides·calc). */
export function mapRoute(rel, { pages, lines, line } = {}) {
  if (rel.startsWith("src/app/")) {
    let dir = rel.slice(0, rel.lastIndexOf("/"));
    while (dir.startsWith("src/app")) {
      if (pages && pages.has(dir)) return appDirToRoute(dir);
      if (dir === "src/app") break;
      dir = dir.slice(0, dir.lastIndexOf("/"));
    }
    return SHARED_ROUTE;
  }
  const guides = /^src\/lib\/guides\/[^/]+\.ts$/.test(rel) || rel === "src/lib/guidesContent.ts";
  const calc = /^src\/lib\/simpleCalculators\/[^/]+\.ts$/.test(rel);
  if ((guides || calc) && lines && line) {
    for (let k = line - 1; k >= 0; k -= 1) {
      const L = lines[k];
      const m = /\bslug\s*:\s*["'`]([a-z0-9][a-z0-9-]*)["'`]/.exec(L) || (calc ? /^\s{2}["']([a-z0-9][a-z0-9-]*)["']\s*:\s*\{/.exec(L) : null);
      if (m) return guides ? `guides:${m[1]}` : `/calc/${m[1]}`;
    }
  }
  return SHARED_ROUTE;
}

/** 공개 경로(링크 비교용): 'guides:x' → '/guides/x', '(공용)' → null. */
export function publicPath(route) {
  if (!route || route === SHARED_ROUTE) return null;
  if (route.startsWith("guides:")) return `/guides/${route.slice(7)}`;
  return route;
}

/** --owners 목록 파일들 → {경로: 담당}. 'name=path' 형식이면 name 을 그대로 쓴다. */
export function loadOwners(specs = [], readText = (p) => readFileSync(p, "utf8")) {
  const owners = new Map();
  for (const spec of specs) {
    let name;
    let file = spec;
    const eq = /^([A-Za-z0-9_-]+)=(.+)$/.exec(spec);
    if (eq && !/^[A-Za-z]:[\\/]/.test(spec)) {
      name = eq[1];
      file = eq[2];
    } else {
      const b = basename(file).toLowerCase();
      name = b.includes("guide") ? "guides-workflow" : b.includes("oct") ? "oct" : b.replace(/\.[^.]+$/, "");
    }
    const text = readText(file);
    for (const raw of text.split(/\r?\n/)) {
      const p = raw.trim().replace(/\\/g, "/");
      if (p && !p.startsWith("#") && !owners.has(p)) owners.set(p, name);
    }
  }
  return owners;
}

// ── 수치 토큰 ──

/** 퍼센트 토큰: '3.00%', '2.5 %' (단 '%p'·'%포인트' 제외). */
const PERCENT_RE = /(?<![\d.,])(\d{1,3}(?:\.\d{1,4})?)\s*%(?!\s*(?:p\b|포인트|P\b))/g;
/** 원 토큰: '6,590,000원', '659만원', '6만 6,000원', '6만6천원', '41만', '10,320원'. */
const WON_RE = /(?<![\d.,])(\d{1,3}(?:,\d{3})+|\d+)(?:\s*만(?:\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(천)?)?)?(\s*원)?/g;

export function parseWonToken(m) {
  const head = Number(m[1].replace(/,/g, ""));
  const hasMan = /만/.test(m[0]);
  if (!hasMan) {
    if (!m[4] && !/,/.test(m[1])) return null; // 쉼표·'원' 없는 맨 숫자(연도·코드)는 제외
    return head;
  }
  let v = head * 10000;
  if (m[2]) {
    const tail = Number(m[2].replace(/,/g, ""));
    v += m[3] ? tail * 1000 : tail;
  }
  return v;
}

/** 텍스트의 [start,end) 구간에서 단위별 수치 토큰. */
export function numericTokens(text, start, end, unit) {
  const seg = text.slice(start, end);
  const out = [];
  if (unit === "%") {
    for (const m of seg.matchAll(PERCENT_RE)) {
      out[out.length] = { value: Number(m[1]), raw: m[0].trim(), offset: start + m.index, length: m[0].length };
    }
  } else {
    for (const m of seg.matchAll(WON_RE)) {
      const v = parseWonToken(m);
      if (v === null) continue;
      const raw = m[0].replace(/\s+$/, "");
      out[out.length] = { value: v, raw, offset: start + m.index, length: raw.length };
    }
  }
  return out;
}

const near = (a, b) => Math.abs(a - b) < 1e-6;

/**
 * 한 파일의 사실별 언급 찾기.
 * @param {object} p
 * @param {string} p.text 원문(CRLF 허용)
 * @param {Array} p.facts resolveFacts() 결과
 * @returns {Array<{factId, value, found, offset, line, inComment, visibleContext, maskedContext, meta}>}
 */
export function findMentions({ text, facts, includeComments = false }) {
  const src = text.replace(/\r\n/g, "\n");
  const { masked, inComment } = maskComments(src);
  const idx = lineIndex(src);
  const lines = src.split("\n");
  const meta = metaLines(lines);
  // 주석 포함 모드가 아니면 주석이 가려진 텍스트에서 찾는다(주석 속 앵커·수치는 자연히 빠진다).
  const hay = includeComments ? src : masked;
  const out = [];
  for (const fact of facts) {
    const known = fact.knownValues; // [{value, role}]
    const seen = new Set();
    for (const pat of fact.patterns) {
      const re = new RegExp(pat.anchor, "g");
      for (const m of hay.matchAll(re)) {
        const aStart = m.index;
        if (pat.notBeforeRe) {
          const pre = hay.slice(Math.max(0, aStart - 14), aStart);
          if (pat.notBeforeRe.test(pre)) continue;
        }
        const from = Math.max(0, aStart - (pat.before || 0));
        let to = Math.min(hay.length, aStart + m[0].length + (pat.after ?? 48));
        // 창 끝이 수치 중간을 자르지 않게 수치 문자까지 늘린다('6,370,0|00원' → 끝까지)
        while (to < hay.length && /[\d.,%만원천]/.test(hay[to])) to += 1;
        for (const tok of numericTokens(hay, from, to, fact.unit)) {
          if (!known.some((k) => near(k.value, tok.value))) continue;
          if (seen.has(tok.offset)) continue;
          if (pat.requireRe) {
            const ctx = masked.slice(Math.max(0, tok.offset - CONTEXT_RADIUS), tok.offset + tok.length + CONTEXT_RADIUS);
            if (!pat.requireRe.test(ctx)) continue;
          }
          seen.add(tok.offset);
          const line = idx.lineOf(tok.offset);
          const [cA, cB] = clipToParagraph(masked, tok.offset, tok.offset + tok.length, CONTEXT_RADIUS);
          out[out.length] = {
            factId: fact.id,
            value: tok.value,
            found: tok.raw,
            offset: tok.offset,
            line,
            inComment: inComment(tok.offset),
            meta: meta.has(line),
            maskedContext: masked.slice(cA, cB),
            before: masked.slice(cA, tok.offset),
            after: masked.slice(tok.offset + tok.length, cB),
            display: shortContext(src, tok.offset, tok.length),
          };
        }
      }
    }
  }
  out.sort((a, b) => a.offset - b.offset);
  return { mentions: out, lines };
}

/**
 * ±radius 맥락 창을 빈 줄(문단 경계)에서 자른다 — 옆 문단의 '지금'·날짜가 이 언급의 분류에 끼지 않게.
 * @returns {[number, number]} [시작, 끝) 오프셋
 */
export function clipToParagraph(text, start, end, radius) {
  let a = Math.max(0, start - radius);
  let b = Math.min(text.length, end + radius);
  const left = text.slice(a, start);
  const lm = [...left.matchAll(/\n[ \t\r]*\n/g)];
  if (lm.length) {
    const last = lm[lm.length - 1];
    a += last.index + last[0].length;
  }
  const right = text.slice(end, b);
  const rm = /\n[ \t\r]*\n/.exec(right);
  if (rm) b = end + rm.index;
  return [a, b];
}

/** 보고서용 맥락 — 공백을 접고 60자 이내(값 중심). */
export function shortContext(src, offset, length, max = 60) {
  const flat = (s) => s.replace(/\s+/g, " ");
  const val = flat(src.slice(offset, offset + length));
  const room = Math.max(0, max - val.length);
  const leftRoom = Math.floor(room / 2);
  let left = flat(src.slice(Math.max(0, offset - 120), offset));
  let right = flat(src.slice(offset + length, offset + length + 120));
  left = left.slice(Math.max(0, left.length - leftRoom));
  right = right.slice(0, room - left.length);
  return (left + val + right).trim().slice(0, max);
}
