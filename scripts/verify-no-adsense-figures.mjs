#!/usr/bin/env node
// Guard: AdSense performance statistics (RPM, CTR, CPC, impressions, clicks, coverage, Active View,
// AdSense page views, unit/format revenue) must never be written into tracked repository files.
// The AdSense Terms of Service confidentiality clause (약관 비밀유지(Confidentiality) 조항) treats them
// as Google Confidential Information; only gross payments may be disclosed. Keep raw numbers in the
// operator's private notes outside the repository.
// Scope: docs/**, scripts/**, .github/** and root *.md are scanned in full. src/** is scanned in its
// comments only (JS/TS/JSX/TSX line and block comments, JSX {/* */} comments, CSS comments) — string
// literals, templates and JSX text there are page content. A cheap superset pass (every '//' to the end
// of its line and every block comment) runs first; only a src file with a hit in that pass is parsed
// with the TypeScript parser, so '//' inside a string, URL, regex literal or JSX text is never taken
// for a comment (src comment scope added 2026-11-01, R2 follow-up to PKG-01).
// Prints file:line and rule id only, never the matched text. Exit 1 when anything matches.
// A line may opt out with the literal marker "adsense-figure-ok" — thresholds or definitions only
// (adsense-figure-ok 표시는 기준값·정의 줄에만), never a measured statistic.
// usd-table-row skips affiliate rows that name CPA, LinkPrice or 쿠팡 (not AdSense statistics).
// CI runs scripts/__tests__/adsense-figure-guard.test.mjs through `node --test scripts/__tests__/*.test.mjs`.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SELF_TEST = 'scripts/__tests__/adsense-figure-guard.test.mjs';
export const MARKER = 'adsense-figure-ok';
const SCOPE = /^(docs\/|scripts\/|\.github\/|[^/]+\.md$)/;
const SRC_COMMENTS = /^src\/.+\.(?:[cm]?[jt]sx?|css)$/i;
const EXCLUDE = /(^|\/)(package-lock\.json|node_modules\/)|^vendor\//;
const TEXT = /\.(md|mdx|txt|csv|tsv|json|jsonc|ya?ml|mjs|cjs|js|ts|tsx|html)$/i;
export const AFFILIATE_ROW = /\bCPA\b|LinkPrice|링크프라이스|쿠팡|Coupang/i;
const N = String.raw`\d[\d,]*(?:\.\d+)?`;
const DEC = String.raw`\d+\.\d+`;
const BIG = String.raw`(?:\d{1,3}(?:,\d{3})+|\d{3,})`;
const UNIT = String.raw`(?:결과창|상단|가이드\s?중간|인아티클|IN_ARTICLE|수동|멀티플렉스|multiplex|display[-_ ]?\d|DISPLAY_\d|GUIDE_MID|HomeTop|앵커|사이드\s?레일|전면|인페이지|자동\s?광고|광고\s?단위|광고단위|유닛|AdSense|애드센스|ex-mux)`;
const REV = String.raw`(?:애드센스|AdSense|수익|수입|RPM|CPC|유닛|광고\s?단위|자동\s?광고|인페이지|앵커|결과창|멀티플렉스)`;
const re = (s) => new RegExp(s, 'i');
export const RULES = [
  ['rpm', re(String.raw`\b(?:RPM|eCPM)\b[^\n]{0,24}?[$₩]\s?${N}`)],
  ['cpc', re(String.raw`(?:\bCPC\b|클릭당\s?(?:수익|단가))[^\n]{0,16}?[$₩]\s?${N}`)],
  ['active-view', re(String.raw`(?:Active\s?View|\bAV\b|평균\s?가시(?:시간)?)[^\n]{0,16}?${N}\s?(?:%|초)`)],
  ['impressions-per-pv', re(String.raw`(?:노출|${UNIT})\s?/\s?PV[^\n]{0,12}?${DEC}|\*\*${DEC}\*\*\s?/PV|${DEC}\s?/PV\b|페이지뷰당\s?${DEC}`)],
  ['coverage', re(String.raw`(?=[^\n]*${UNIT})[^\n]*(?:(?:커버리지|coverage|채움률?)[^\n]{0,12}?\d+(?:\.\d+)?\s?%|(?:미매칭|매칭|광고\s?요청|요청)\s?${BIG}|요청\s?/\s?PV[^\n]{0,12}?${DEC})`)],
  ['revenue-usd', re(String.raw`${REV}[^\n]{0,40}?[$₩]\s?${N}|[$₩]\s?${N}[^\n]{0,40}?${REV}`)],
  ['revenue-krw', re(String.raw`(?:월|일)\s?수익\s?${N}\s?(?:~\s?${N})?\s?만\s?원|수익의\s?\*{0,2}${N}(?:~${N})?%`)],
  ['unit-ctr', re(String.raw`${UNIT}[^\n]{0,30}?(?:\bCTR\b|클릭률)[^\n]{0,24}?${N}\s?%|(?:\bCTR\b|클릭률)[^\n]{0,24}?${N}\s?%[^\n]{0,30}?${UNIT}`)],
  // 페이지뷰·PV·page views 모두 — 숫자가 글자에 붙은 식별자(GA4 등)는 수치로 보지 않는다
  ['adsense-pageviews', re(String.raw`(?:애드센스|AdSense)[^\n]{0,12}?(?:집계\s?)?(?:페이지\s?뷰|\bPV\b|page\s?views?)[^\n]{0,8}?(?<![A-Za-z\d.,])${N}`)],
  ['per-1000-views', re(String.raw`(?:${N}|천)\s?뷰당[^\n]{0,24}?[$₩]\s?${N}|${N}\s?PV\s?당\s?[$₩]\s?${N}`)],
  ['unit-counts', re(String.raw`${UNIT}[^\n]{0,30}?${BIG}\s?(?:노출|클릭|요청)|${BIG}\s?노출[^\n]{0,20}?[$₩]\s?${N}|${N}\s?클릭[^\n]{0,20}?[$₩]\s?${N}`)],
  ['usd-table-row', re(String.raw`^\s*\|[^\n]*\$\s?${N}[^\n]*\|[^\n]*\$\s?${N}`)],
];

export function scanText(text) {
  const hits = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!/\d/.test(line) || line.includes(MARKER)) return;
    for (const [id, rx] of RULES) {
      if (id === 'usd-table-row' && AFFILIATE_ROW.test(line)) continue;
      if (rx.test(line)) { hits.push({ line: i + 1, rule: id }); break; }
    }
  });
  return hits;
}

// src/** comments ---------------------------------------------------------------------------------
const requireFromHere = createRequire(import.meta.url);
let typescriptModule;
const typescript = () => (typescriptModule ??= requireFromHere('typescript'));

// Keeps the characters inside the spans and blanks every other character except line breaks,
// so scanText still reports the file's own line numbers.
function keepSpans(text, spans) {
  const sorted = spans.slice().sort((a, b) => a[0] - b[0]);
  let out = '';
  let pos = 0;
  for (const [start, end] of sorted) {
    if (end <= pos) continue;
    const from = Math.max(start, pos);
    out += text.slice(pos, from).replace(/[^\r\n]/g, ' ') + text.slice(from, end);
    pos = end;
  }
  return out + text.slice(pos).replace(/[^\r\n]/g, ' ');
}

// Superset of the comment spans: every block comment (unterminated runs to the end) and, outside CSS,
// every '//' to the end of its line — strings, URLs and JSX text included. Each real comment lies inside one.
function roughCommentSpans(text, css) {
  const spans = [];
  const collect = (rx) => { for (const m of text.matchAll(rx)) spans.push([m.index, m.index + m[0].length]); };
  collect(/\/\*[\s\S]*?(?:\*\/|$)/g);
  if (!css) collect(/\/\/[^\r\n]*/g);
  return spans;
}

// Exact CSS comment spans: block comments outside quoted strings.
function cssCommentSpans(text) {
  const spans = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' || ch === "'") {
      for (i++; i < text.length && text[i] !== ch && text[i] !== '\n'; i++) if (text[i] === '\\') i++;
    } else if (ch === '/' && text[i + 1] === '*') {
      const close = text.indexOf('*/', i + 2);
      const end = close < 0 ? text.length : close + 2;
      spans.push([i, end]);
      i = end - 1;
    }
  }
  return spans;
}

// Exact JS/TS/JSX/TSX comment spans from the TypeScript parser. Every comment is trivia in front of some
// token, so reading the trivia in front of each token finds them all (leading ranges begin after a line
// break and trailing ranges stop at one, so both are read). JSX text is visible content, not trivia;
// JSDoc nodes are comments that already sit in the trivia of the token after them.
function scriptCommentSpans(text, file) {
  const ts = typescript();
  const kind = /\.tsx$/i.test(file) ? ts.ScriptKind.TSX
    : /\.jsx$/i.test(file) ? ts.ScriptKind.JSX
      : /\.[cm]?js$/i.test(file) ? ts.ScriptKind.JS
        : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, false, kind);
  const spans = [];
  const seen = new Set();
  const add = (ranges) => {
    for (const r of ranges ?? []) if (!seen.has(r.pos)) { seen.add(r.pos); spans.push([r.pos, r.end]); }
  };
  const visit = (node) => {
    if (node.kind >= ts.SyntaxKind.FirstJSDocNode && node.kind <= ts.SyntaxKind.LastJSDocNode) return;
    const children = node.getChildren(source);
    if (children.length) { for (const child of children) visit(child); return; }
    if (node.kind === ts.SyntaxKind.JsxText) return;
    add(ts.getLeadingCommentRanges(text, node.pos));
    add(ts.getTrailingCommentRanges(text, node.pos));
  };
  visit(source);
  return spans;
}

// AdSense-figure hits inside the comments of one src/** file (JS/TS family or CSS).
export function scanComments(text, file) {
  const css = /\.css$/i.test(file);
  const rough = roughCommentSpans(text, css);
  if (!rough.length || !scanText(keepSpans(text, rough)).length) return [];
  let spans;
  try { spans = css ? cssCommentSpans(text) : scriptCommentSpans(text, file); }
  catch { spans = rough; } // parser trouble: keep the strict superset rather than skip the file
  return scanText(keepSpans(text, spans));
}

export function scanRepo(root = ROOT) {
  const files = execFileSync('git', ['-C', root, 'ls-files', '-z'], { maxBuffer: 1 << 28 })
    .toString('utf8').split('\0').filter(f => f && !EXCLUDE.test(f) && f !== SELF_TEST);
  const out = [];
  for (const f of files) {
    const full = SCOPE.test(f) && TEXT.test(f);
    if (!full && !SRC_COMMENTS.test(f)) continue;
    let text; try { text = readFileSync(path.join(root, f), 'utf8'); } catch { continue; }
    for (const h of full ? scanText(text) : scanComments(text, f)) out.push({ file: f, ...h });
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : ROOT;
  const hits = scanRepo(root);
  for (const h of hits) console.log(`${h.file}:${h.line} [${h.rule}]`);
  if (hits.length) {
    console.error(`[adsense-figures] ${hits.length}줄이 애드센스 실적 수치(RPM·CTR·CPC·노출·클릭·커버리지·Active View·단위 수익)로 보입니다. 숫자를 방향어(상승·하락·비공개)로 바꾸고 원값은 저장소 밖 운영자 기록에만 두세요(약관 비밀유지(Confidentiality) 조항). ${MARKER} 표시는 기준값·정의 줄에만 씁니다.`);
    console.error(`[adsense-figures] ${hits.length} line(s) look like AdSense performance statistics. Replace the numbers with qualitative wording and keep raw values outside the repository (AdSense Terms confidentiality clause). Mark only threshold or definition lines with ${MARKER}.`);
    process.exitCode = 1;
  } else console.log('[adsense-figures] OK');
}
