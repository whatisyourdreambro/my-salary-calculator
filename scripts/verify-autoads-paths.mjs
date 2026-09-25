// scripts/verify-autoads-paths.mjs
// 자동광고 인페이지 배치 경로 회귀 게이트 (2026-09-25, 수익 추천 #4 — docs/revenue-recommendations-2026-09-25.md).
//
// 배경: AdSense 자동광고는 학습한 인페이지 배치 위치를 CSS 경로로 저장한다
//   (예: BODY>DIV.flex.flex-col.min-h-screen>MAIN#main-content.flex-grow.w-full>DIV.w-full.h-full>…).
//   2026-09-10 `4eda6889` 가 루트 템플릿 래퍼의 h-full 을 없애자 저장된 경로가 사이트 전체에서 맞지 않게 됐고,
//   자동 인페이지 노출/PV 가 2.99 → 0.72 로 약 75% 줄어든 채 2주가 갔다(복구 `4d80ce3e`, 9/24 23:25 KST 배포 —
//   docs/ad-experiments.md 2026-09-25 절 1). 소스 쪽 고정은 src/lib/__tests__/adCriticalShell.test.ts 가 하고,
//   이 스크립트는 빌드 산출물 쪽에서 같은 사고(셸·페이지 래퍼 클래스 개명·삭제)를 잡는다.
// 방식: `npm run build` 뒤 .next/server/app/*.html(프리렌더 HTML) 대표 페이지를 읽어 #main-content 안의 블록 요소
//   (p·h2·h3·section·article·div·ul·ol·table·details·header·aside)마다 AdSense 식 CSS 경로를 만들고,
//   커밋된 기준선 scripts/autoads-paths.baseline.json 의 경로를 CSS 선택자로 현재 DOM 에 다시 적용한다
//   (진단 스크립트 selector-diff 의 old→new 재생과 같은 판정 — 클래스를 더하는 것은 안전, 빼거나 바꾸면 불일치).
//   경로 규칙(2026-09-24 adsbygoogle.js 내장 설정의 저장 경로에서 관측):
//     - 마디 = 태그(대문자) + #id + .class… , 마디 사이는 '>'. BODY 는 클래스 없이 'BODY'.
//     - 숫자로 끝나는 클래스(px-4·min-w-0)는 뺀다. Tailwind 변형·임의값 클래스(':' '[' ']' '/' '(' ')' '.' '%' '#' '!' ',' 등
//       CSS 식별자로 못 쓰는 글자를 가진 것)도 뺀다.
//     - id 는 [A-Za-z0-9_-] 만으로 된 것만 쓴다(React useId 의 ':R…:' 는 선택자로 못 쓰고 빌드마다 바뀐다).
//   정적 HTML 이라 selector-diff 의 폭(≥250px)·높이 조건은 재현하지 않는다. 대신 렌더되지 않는 요소
//   (hidden 속성·style display:none·sr-only·<template>·<noscript> 내용·닫힌 <details> 의 summary 밖 내용)와
//   광고 컨테이너(.ad-container)·nav·header#site-header 안은 뺀다.
// 판정:
//   FAIL — 어떤 페이지든 루트 셸(BODY 에서 템플릿 래퍼까지 4마디)이 맞지 않음.
//   FAIL — 어떤 페이지든 기준선 경로 중 현재 빌드에서 맞지 않는 비율이 20% 초과. 바뀐 마디(몇 번째 마디가 무엇에서
//          무엇으로)를 경로 수와 함께 출력한다.
//   FAIL — 기준선 페이지의 프리렌더 HTML 이 없음(엣지 전환 등 — 검사 불가를 통과로 오인하지 않게), 기준선 파일 없음.
//   INFO — 소실 20% 이하 페이지의 소실 수·바뀐 마디, 새로 생긴 경로 수.
//   INFO — scripts/autoads-placements.snapshot.json(9/24 캡처한 Google 저장 배치 선택자)이 지금 몇 개 맞는지.
//          Google 은 경로를 다시 학습하므로 실패 사유가 아니다. 저장 선택자는 하이드레이션 뒤 DOM 에서 학습된 것이라
//          클라이언트 전용 영역(월급 시계 대시보드·차트 등)은 프리렌더 HTML 에 없어 불일치로 나올 수 있다.
// 사용:
//   node scripts/verify-autoads-paths.mjs [.next 디렉터리]            (npm run verify:autoads)
//   node scripts/verify-autoads-paths.mjs --update [.next 디렉터리]   기준선 재생성
//   옵션: --baseline <json> · --placements <json> · --pages </a,/b>(--update 전용, 기본 GATE_PAGES)
// --update 절차(기준선 갱신은 '자동광고 학습 위치를 버린다'는 결정이다):
//   1. 게이트 FAIL 이 의도한 페이지 개편 때문인지 출력의 '바뀐 마디'로 확인한다. 루트 셸·레이아웃 래퍼 클래스를
//      지운 것이면 갱신하지 말고 클래스를 되살린다(클래스 추가는 안전하므로 새 클래스는 더하기만).
//   2. 의도한 개편이면: 그 커밋으로 `npm run build` → `node scripts/verify-autoads-paths.mjs --update` →
//      기준선 JSON 을 같은 커밋(또는 바로 뒤 커밋)에 넣는다. 메시지에 페이지와 이유를 적는다.
//   3. 개편 배포일을 docs/ad-experiments.md 공변량 표에 적는다 — 해당 페이지군 자동 인페이지는 Google 이 다시
//      학습할 때까지 줄어든다(9/10 사건에서는 2주 동안 회복되지 않았다). 광고 판정 창(10/9 P0 14완료일 등) 안이면 배포를 미룬다.
//   4. 게이트 페이지 목록(GATE_PAGES)을 바꿀 때도 --update 로 기준선을 다시 만든다.
//   빌드 날짜에 따라 바뀌는 시즌 블록 때문에 소실이 조금씩 쌓일 수 있다 — 20% 에 가까워지면(INFO 로 보인다)
//   광고 판정 창 밖에서 --update 로 기준선을 새로 잡는다.
// 테스트: node --test scripts/__tests__/verify-autoads-paths.test.mjs

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
export const DEFAULT_BASELINE = path.join(ROOT, "scripts", "autoads-paths.baseline.json");
export const DEFAULT_PLACEMENTS = path.join(ROOT, "scripts", "autoads-placements.snapshot.json");

// 대표 고유입 페이지 — 홈·회사 3·삼성 성과급·/salary·/monthly·공무원 2027·교사·연봉표·가이드(사이트 최대 단일 콘텐츠).
// 모두 프리렌더(.next/server/app/<경로>.html)되는 라우트여야 한다. 바꾸면 --update.
export const GATE_PAGES = [
  "/",
  "/salary-db/samsung-electronics",
  "/salary-db/sk-hynix",
  "/salary-db/naver",
  "/calc/samsung-bonus",
  "/salary/50000000",
  "/monthly/3000000",
  "/civil-servant-pay-2027",
  "/teacher-pay-2026",
  "/table/2026/annual",
  "/guides/nurse-salary",
];
export const MAX_LOST_RATIO = 0.2;
// BODY > DIV.flex.flex-col.min-h-screen > MAIN#main-content > 템플릿 래퍼 (adCriticalShell.test.ts 와 같은 3개 래퍼)
export const ROOT_SHELL_DEPTH = 4;

const CANDIDATE_TAGS = new Set(["p", "h2", "h3", "section", "article", "div", "ul", "ol", "table", "details", "header", "aside"]);
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
// 내용이 DOM 요소가 되지 않는 요소(스크립트 실행 환경의 noscript 포함) — 닫는 태그까지 건너뛴다.
const RAW_TEXT = new Set(["script", "style", "noscript", "textarea", "title", "xmp", "iframe", "noembed", "noframes"]);
// 열린 <p> 를 암묵적으로 닫는 시작 태그(HTML 파서 규칙)
const CLOSES_P = new Set([
  "address", "article", "aside", "blockquote", "center", "dd", "details", "dialog", "dir", "div", "dl", "dt", "fieldset",
  "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "li", "listing",
  "main", "menu", "nav", "ol", "p", "pre", "search", "section", "summary", "table", "ul", "xmp",
]);
const P_SCOPE_BOUNDARY = new Set(["html", "table", "td", "th", "caption", "template", "button", "marquee", "object", "applet", "svg", "math"]);

export function decodeEntities(value) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (whole, entity) => {
    if (!entity.startsWith("#")) return named[entity.toLowerCase()] ?? whole;
    const cp = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : whole;
  });
}

function parseAttributes(source) {
  const attrs = {};
  for (const m of source.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    const key = m[1].toLowerCase();
    if (!(key in attrs)) attrs[key] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? ""); // 중복 속성은 첫 값(HTML 파서와 같게)
  }
  return attrs;
}

/**
 * React/Next 가 만든 HTML 을 요소 트리로 읽는다(텍스트는 버림). 브라우저 파서와 결과가 달라질 수 있는 규칙 중
 * 경로에 영향을 주는 것만 구현: void 요소, raw text 요소, <p> 암묵 닫기·짝 없는 </p>, table>tr 사이 tbody 삽입,
 * svg/math 안의 '/>' 자기 닫기, <template> 내용 분리.
 */
export function parseHtml(html) {
  const doc = { tag: "#document", id: "", classes: [], classSet: new Set(), attrs: {}, children: [], parent: null };
  const stack = [doc];
  const current = () => stack[stack.length - 1];
  const append = (tag, attrs) => {
    const classes = [...new Set((attrs.class ?? "").split(/\s+/).filter(Boolean))];
    const node = { tag, id: attrs.id ?? "", classes, classSet: new Set(classes), attrs, children: [], parent: current() };
    current().children.push(node);
    return node;
  };
  const openInScope = (tag) => {
    for (let i = stack.length - 1; i > 0; i--) {
      if (stack[i].tag === tag) return i;
      if (P_SCOPE_BOUNDARY.has(stack[i].tag)) return -1;
    }
    return -1;
  };
  const inForeignContent = () => stack.some((n) => n.tag === "svg" || n.tag === "math");
  const TOKEN = /<!--[\s\S]*?(?:-->|$)|<![^>]*>|<\?[^>]*>|<\/([a-zA-Z][^\s/>]*)[^>]*>|<([a-zA-Z][^\s/>]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;
  let m;
  while ((m = TOKEN.exec(html))) {
    if (m[1]) {
      const tag = m[1].toLowerCase();
      if (tag === "p" && openInScope("p") < 0) {
        append("p", {}); // 짝 없는 </p> 는 빈 <p></p> 가 된다
        continue;
      }
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tag) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    if (!m[2]) continue; // 주석·doctype
    const tag = m[2].toLowerCase();
    const rawAttrs = m[3] ?? "";
    if (CLOSES_P.has(tag)) {
      const at = openInScope("p");
      if (at > 0) stack.length = at;
    }
    if (tag === "tr" && current().tag === "table") stack.push(append("tbody", {}));
    const node = append(tag, parseAttributes(rawAttrs));
    if (RAW_TEXT.has(tag)) {
      const close = new RegExp(`</${tag}(?=[\\s/>])[^>]*>`, "ig");
      close.lastIndex = TOKEN.lastIndex;
      const end = close.exec(html);
      TOKEN.lastIndex = end ? close.lastIndex : html.length;
      continue;
    }
    if (VOID.has(tag) || (/\/\s*$/.test(rawAttrs) && inForeignContent())) continue;
    stack.push(node);
  }
  return indexDom(doc);
}

/** 문서 순서의 요소 목록(템플릿 내용 제외)과 태그별 색인을 붙인다. */
function indexDom(doc) {
  const all = [];
  const byTag = new Map();
  const walk = (node) => {
    for (const child of node.children) {
      all.push(child);
      if (!byTag.has(child.tag)) byTag.set(child.tag, []);
      byTag.get(child.tag).push(child);
      if (child.tag !== "template") walk(child);
    }
  };
  walk(doc);
  return { doc, all, byTag };
}

// selector-diff.cjs 의 클래스 규칙 + 선택자로 되읽을 수 없는 글자(. > * + ~ @ & = 따옴표) 제외
const UNSAFE_CLASS_CHARS = /[:\[\]\/().%#!,>*+~@&='"`\\]/;
export const keepClass = (c) => !!c && !/\d$/.test(c) && !UNSAFE_CLASS_CHARS.test(c);
const PLAIN_ID = /^[\w-]+$/;

export function segmentOf(el) {
  const tag = el.tag.toUpperCase();
  if (tag === "BODY") return "BODY";
  const id = el.id && PLAIN_ID.test(el.id) ? `#${el.id}` : "";
  return tag + id + el.classes.filter(keepClass).map((c) => `.${c}`).join("");
}

export function pathOf(el) {
  const parts = [];
  for (let n = el; n && n.tag !== "html" && n.tag !== "#document"; n = n.parent) parts.unshift(segmentOf(n));
  return parts.join(">");
}

const excludedContainer = (el) => el.classSet.has("ad-container") || el.tag === "nav" || (el.tag === "header" && el.id === "site-header");
const notRendered = (el) =>
  "hidden" in el.attrs || /display\s*:\s*none/i.test(el.attrs.style ?? "") || el.classSet.has("sr-only") || el.tag === "template";

/** 요소가 자동광고 후보 경로 계산 대상인지(조상 포함 제외 규칙 적용). */
function isCandidate(el) {
  if (!CANDIDATE_TAGS.has(el.tag)) return false;
  for (let n = el, child = null; n && n.tag !== "#document"; child = n, n = n.parent) {
    if (excludedContainer(n) || notRendered(n)) return false;
    // 닫힌 <details> 는 summary 만 그려진다
    if (child && n.tag === "details" && !("open" in n.attrs) && child.tag !== "summary") return false;
  }
  return true;
}

export function findMain(dom) {
  return dom.all.find((el) => el.id === "main-content") ?? null;
}

/** #main-content 안 후보 요소의 고유 CSS 경로(문서 순서)와 루트 셸 경로. */
export function collectPaths(dom) {
  const main = findMain(dom);
  if (!main) return { shell: null, paths: [] };
  const paths = [];
  const seen = new Set();
  const walk = (node) => {
    for (const child of node.children) {
      if (child.tag === "template") continue;
      if (isCandidate(child)) {
        const p = pathOf(child);
        if (!seen.has(p)) {
          seen.add(p);
          paths.push(p);
        }
      }
      walk(child);
    }
  };
  walk(main);
  const wrapper = main.children.find((c) => c.tag !== "template") ?? null;
  return { shell: wrapper ? pathOf(wrapper) : pathOf(main), paths };
}

/** '>' 로만 이어진 복합 선택자(AdSense 저장 형식)를 읽는다. 지원하지 않는 문법이면 null. */
export function parseSelector(selector) {
  if (typeof selector !== "string" || !selector.trim()) return null;
  const compounds = [];
  for (const raw of selector.split(">")) {
    const m = raw.trim().match(/^([A-Za-z][A-Za-z0-9]*|\*)?((?:[#.][^#.\s>]+)*)$/);
    if (!m || (!m[1] && !m[2])) return null;
    const compound = { tag: m[1] && m[1] !== "*" ? m[1].toLowerCase() : null, id: null, classes: [] };
    for (const t of m[2].match(/[#.][^#.]+/g) ?? []) {
      if (t[0] === "#") compound.id = t.slice(1);
      else compound.classes.push(t.slice(1));
    }
    compounds.push(compound);
  }
  return compounds;
}

const matchesCompound = (el, c) =>
  (!c.tag || el.tag === c.tag) && (!c.id || el.id === c.id) && c.classes.every((k) => el.classSet.has(k));

/** document.querySelectorAll 과 같은 순서로 일치 요소를 돌려준다(자식 결합자만). limit 개를 찾으면 멈춘다. */
export function querySelectorAll(dom, compounds, limit = Infinity) {
  const last = compounds[compounds.length - 1];
  const pool = last.tag ? dom.byTag.get(last.tag) ?? [] : dom.all;
  const out = [];
  for (const el of pool) {
    if (!matchesCompound(el, last)) continue;
    let n = el.parent;
    let ok = true;
    for (let i = compounds.length - 2; i >= 0; i--, n = n.parent) {
      if (!n || n.tag === "#document" || !matchesCompound(n, compounds[i])) {
        ok = false;
        break;
      }
    }
    if (ok) {
      out.push(el);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export const selectorMatches = (dom, selector) => {
  const compounds = parseSelector(selector);
  return !!compounds && querySelectorAll(dom, compounds, 1).length > 0;
};

/**
 * BODY 부터의 경로가 어디서 끊기는지: 1부터 센 마디 번호, 끊긴 마디, 그 위 경로, 같은 자리의 현재 마디(같은 태그 우선).
 * 끝까지 맞으면 null.
 */
export function diagnosePath(dom, fullPath) {
  const segs = fullPath.split(">");
  const compounds = parseSelector(fullPath);
  if (!compounds) return { index: 1, expected: segs[0], prefix: "", found: [], unparsable: true };
  const first = compounds[0];
  let level = (first.tag ? dom.byTag.get(first.tag) ?? [] : dom.all).filter((el) => matchesCompound(el, first));
  if (!level.length) return { index: 1, expected: segs[0], prefix: "", found: [] };
  for (let i = 1; i < compounds.length; i++) {
    const next = [];
    for (const parent of level) {
      if (parent.tag === "template") continue;
      for (const child of parent.children) if (matchesCompound(child, compounds[i])) next.push(child);
    }
    if (!next.length) {
      const sameTag = new Set();
      const any = new Set();
      for (const parent of level) {
        if (parent.tag === "template") continue;
        for (const child of parent.children) {
          const s = segmentOf(child);
          any.add(s);
          if (child.tag === compounds[i].tag) sameTag.add(s);
        }
      }
      return { index: i + 1, expected: segs[i], prefix: segs.slice(0, i).join(">"), found: [...(sameTag.size ? sameTag : any)].slice(0, 4) };
    }
    level = next;
  }
  return null;
}

// 기준선은 경로를 루트 셸 기준 상대 경로로 저장한다('' = 셸 자신, 'BODY…' = 셸 밖 절대 경로).
export const toRelative = (p, shell) => (p === shell ? "" : p.startsWith(`${shell}>`) ? p.slice(shell.length + 1) : p);
export const toAbsolute = (rel, shell) => (rel === "" ? shell : rel.startsWith("BODY") ? rel : `${shell}>${rel}`);

export function pageFile(nextDir, route) {
  const rel = route === "/" ? "index.html" : `${route.replace(/^\//, "")}.html`;
  return path.join(nextDir, "server", "app", ...rel.split("/"));
}

/** 게이트 페이지들의 현재 경로를 모은다. */
export function buildBaseline(nextDir, pages = GATE_PAGES, meta = {}) {
  const missing = [];
  const out = {};
  let shell = null;
  for (const route of pages) {
    const file = pageFile(nextDir, route);
    if (!existsSync(file)) {
      missing.push(route);
      continue;
    }
    const { shell: pageShell, paths } = collectPaths(parseHtml(readFileSync(file, "utf8")));
    if (!pageShell || !paths.length) {
      missing.push(`${route} (#main-content 없음)`);
      continue;
    }
    const rootShell = pageShell.split(">").slice(0, ROOT_SHELL_DEPTH).join(">");
    if (shell === null) shell = rootShell;
    else if (shell !== rootShell) throw new Error(`루트 셸이 페이지마다 다릅니다: ${route} → ${rootShell} (첫 페이지: ${shell})`);
    out[route] = {
      file: path.relative(path.join(nextDir, "server", "app"), file).split(path.sep).join("/"),
      count: paths.length,
      paths: paths.map((p) => toRelative(p, rootShell)),
    };
  }
  return {
    baseline: {
      _comment:
        "AdSense 자동광고 인페이지 경로 기준선 — scripts/verify-autoads-paths.mjs --update 로만 갱신. 갱신 = 자동광고 학습 위치를 버리는 결정이다(스크립트 머리말 --update 절차).",
      version: 1,
      generatedAt: meta.generatedAt ?? null,
      commit: meta.commit ?? null,
      buildId: meta.buildId ?? null,
      rootShell: shell,
      pages: out,
    },
    missing,
  };
}

/** 한 페이지의 기준선 경로(루트 셸 상대)를 현재 DOM 에 재적용한다. */
export function comparePage(dom, pageBaseline, rootShell) {
  const baselinePaths = pageBaseline.paths.map((rel) => toAbsolute(rel, rootShell));
  const lost = [];
  for (const p of baselinePaths) if (!selectorMatches(dom, p)) lost.push(p);
  const shellBreak = rootShell && !selectorMatches(dom, rootShell) ? diagnosePath(dom, rootShell) : null;
  const groups = new Map();
  for (const p of lost) {
    const d = diagnosePath(dom, p);
    if (!d) continue; // 전체로는 맞지 않지만 위에서부터는 맞는 경우는 없다(자식 결합자만) — 방어
    const key = `${d.index}\u0000${d.prefix}\u0000${d.expected}`;
    if (!groups.has(key)) groups.set(key, { ...d, count: 0 });
    groups.get(key).count++;
  }
  const current = collectPaths(dom).paths;
  const known = new Set(baselinePaths);
  return {
    total: baselinePaths.length,
    lost: lost.length,
    ratio: baselinePaths.length ? lost.length / baselinePaths.length : 0,
    shellBreak,
    changes: [...groups.values()].sort((a, b) => b.count - a.count || a.index - b.index),
    added: current.filter((p) => !known.has(p)).length,
  };
}

/** 저장 배치 스냅샷(Google 선택자)이 게이트 페이지 어디에서 맞는지. */
export function checkPlacements(snapshot, doms) {
  const groups = [];
  for (const [name, group] of Object.entries(snapshot.groups ?? {})) {
    const rows = [];
    for (const pl of group.placements ?? []) {
      const compounds = parseSelector(pl.selector);
      const pages = [];
      if (compounds) {
        for (const [route, dom] of doms) {
          const occ = pl.occurrenceIndex;
          const need = occ == null ? 1 : occ >= 0 ? occ + 1 : -occ;
          if (querySelectorAll(dom, compounds, need).length >= need) pages.push(route);
        }
      }
      rows.push({ ...pl, parsed: !!compounds, pages });
    }
    groups.push({ name, note: group.note ?? "", rows });
  }
  return groups;
}

const pct = (x) => `${(x * 100).toFixed(1)}%`;
const shorten = (s, max = 110) => (s.length > max ? `…${s.slice(s.length - max + 1)}` : s);

function describeChange(c) {
  const now = c.found.length ? c.found.join(" | ") : "(없음)";
  return `${c.index}번째 마디 '${c.expected}' → 현재 '${now}'  (상위: ${shorten(c.prefix || "(문서)")})`;
}

function parseArgs(argv) {
  const args = { update: false, nextDir: null, baseline: DEFAULT_BASELINE, placements: DEFAULT_PLACEMENTS, pages: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--update") args.update = true;
    else if (a === "--next-dir") args.nextDir = argv[++i];
    else if (a === "--baseline") args.baseline = argv[++i];
    else if (a === "--placements") args.placements = argv[++i];
    else if (a === "--pages") args.pages = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (!a.startsWith("--") && !args.nextDir) args.nextDir = a;
    else throw new Error(`알 수 없는 인자: ${a}`);
  }
  args.nextDir = path.resolve(args.nextDir ?? path.join(ROOT, ".next"));
  return args;
}

function kstNow() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().replace(/\.\d+Z$/, "+09:00");
}

function gitHead() {
  try {
    return execFileSync("git", ["rev-parse", "--short=8", "HEAD"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

export function main(argv = process.argv.slice(2), log = console.log, error = console.error) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (e) {
    error(`[autoads-paths] ${e.message}`);
    return 1;
  }
  const appDir = path.join(args.nextDir, "server", "app");
  if (!existsSync(appDir)) {
    error(`[autoads-paths] 프리렌더 디렉터리 없음: ${appDir}`);
    error("  npm run build 뒤에 실행하세요 (검사 불가 — 통과로 간주하지 않음).");
    return 1;
  }

  if (args.update) {
    const buildIdFile = path.join(args.nextDir, "BUILD_ID");
    let result;
    try {
      result = buildBaseline(args.nextDir, args.pages ?? GATE_PAGES, {
        generatedAt: kstNow(),
        commit: gitHead(),
        buildId: existsSync(buildIdFile) ? readFileSync(buildIdFile, "utf8").trim() : null,
      });
    } catch (e) {
      error(`[autoads-paths] ${e.message}`);
      return 1;
    }
    if (result.missing.length) {
      error(`[autoads-paths] 프리렌더 HTML 을 읽지 못한 페이지: ${result.missing.join(", ")} — 기준선을 쓰지 않았습니다.`);
      return 1;
    }
    writeFileSync(args.baseline, `${JSON.stringify(result.baseline, null, 2)}\n`);
    const pages = Object.entries(result.baseline.pages);
    log(`[autoads-paths] 기준선 갱신: ${path.relative(ROOT, args.baseline) || args.baseline}`);
    log(`  루트 셸: ${result.baseline.rootShell}`);
    for (const [route, p] of pages) log(`  ${route.padEnd(34)} 경로 ${p.count}`);
    log(`  페이지 ${pages.length} · 경로 합계 ${pages.reduce((s, [, p]) => s + p.count, 0)} · 커밋 ${result.baseline.commit ?? "?"} · BUILD_ID ${result.baseline.buildId ?? "?"}`);
    return 0;
  }

  if (!existsSync(args.baseline)) {
    error(`[autoads-paths] 기준선 없음: ${args.baseline}`);
    error("  빌드 뒤 `node scripts/verify-autoads-paths.mjs --update` 로 만들고 커밋하세요 (검사 불가 — 통과로 간주하지 않음).");
    return 1;
  }
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(args.baseline, "utf8"));
  } catch (e) {
    error(`[autoads-paths] 기준선을 읽지 못함 (${args.baseline}): ${e.message}`);
    return 1;
  }
  const baselinePages = Object.entries(baseline.pages ?? {});
  if (typeof baseline.rootShell !== "string" || !baseline.rootShell.startsWith("BODY>") || !baselinePages.length) {
    error(`[autoads-paths] 기준선 형식 오류 (rootShell·pages 없음): ${args.baseline} — --update 로 다시 만드세요.`);
    return 1;
  }
  // 허용 비율은 코드 상수만 쓴다 — 기준선 JSON 에 값을 넣어도 무시(파일 수정으로 게이트를 느슨하게 못 하게).
  const limit = MAX_LOST_RATIO;
  log(
    `[autoads-paths] 기준선 ${baseline.generatedAt ?? "?"} (커밋 ${baseline.commit ?? "?"}) · 페이지 ${baselinePages.length} · 허용 소실 ${pct(limit)}`,
  );
  const failed = { shell: 0, lost: 0, missing: 0 };
  const doms = new Map();
  for (const [route, pageBaseline] of baselinePages) {
    const file = pageFile(args.nextDir, route);
    if (!existsSync(file)) {
      failed.missing++;
      log(`FAIL  ${route} — 프리렌더 HTML 없음 (${path.relative(args.nextDir, file)}). 엣지 전환·라우트 삭제면 GATE_PAGES 를 고치고 --update.`);
      continue;
    }
    const dom = parseHtml(readFileSync(file, "utf8"));
    doms.set(route, dom);
    const r = comparePage(dom, pageBaseline, baseline.rootShell);
    const fail = !!r.shellBreak || r.ratio > limit;
    if (r.shellBreak) failed.shell++;
    else if (fail) failed.lost++;
    const label = fail ? "FAIL" : r.lost ? "INFO" : "OK  ";
    log(
      `${label}  ${route.padEnd(34)} 기준 경로 ${r.total - r.lost}/${r.total} 일치 (소실 ${r.lost}, ${pct(r.ratio)}) · 신규 ${r.added}` +
        (r.shellBreak ? " — 루트 셸 깨짐" : ""),
    );
    if (r.shellBreak) log(`        루트 셸: ${describeChange(r.shellBreak)}`);
    for (const c of r.changes.slice(0, fail ? 6 : 3)) log(`        ${String(c.count).padStart(4)}경로  ${describeChange(c)}`);
    if (r.changes.length > (fail ? 6 : 3)) log(`        … 바뀐 마디 ${r.changes.length - (fail ? 6 : 3)}곳 더`);
  }
  for (const route of GATE_PAGES) {
    if (!(route in (baseline.pages ?? {}))) log(`WARN  ${route} — GATE_PAGES 에 있으나 기준선에 없음 (--update 필요)`);
  }

  if (existsSync(args.placements) && doms.size) {
    try {
      const snapshot = JSON.parse(readFileSync(args.placements, "utf8"));
      const groups = checkPlacements(snapshot, doms);
      log(`\nINFO  Google 저장 배치 선택자 (${snapshot.capturedAt ?? "?"} 캡처, ${path.basename(args.placements)}) — 실패 사유 아님(Google 이 재학습)`);
      for (const g of groups) {
        const uniq = new Map();
        for (const row of g.rows) {
          const key = `${row.selector}\u0000${row.occurrenceIndex}`;
          if (!uniq.has(key)) uniq.set(key, row);
        }
        const rows = [...uniq.values()];
        const hit = rows.filter((row) => row.pages.length).length;
        log(`      ${g.name}: 고유 선택자 ${rows.length}개 중 ${hit}개가 게이트 페이지 하나 이상에서 일치${g.note ? ` — ${g.note}` : ""}`);
        if (rows.length <= 8) {
          for (const row of rows) {
            log(`        ${row.pages.length ? "일치" : "불일치"}  [${row.occurrenceIndex ?? "*"}] ${shorten(row.selector, 120)}${row.pages.length ? ` → ${row.pages.join(", ")}` : ""}`);
          }
        }
      }
    } catch (e) {
      log(`WARN  배치 스냅샷을 읽지 못함 (${args.placements}): ${e.message}`);
    }
  }

  const failures = failed.shell + failed.lost + failed.missing;
  if (!failures) {
    log(`\n결과: 통과 — 루트 셸 유지, 모든 페이지 소실 ${pct(limit)} 이하`);
    return 0;
  }
  log(`\n결과: FAIL ${failures}쪽 (루트 셸 깨짐 ${failed.shell} · 소실 ${pct(limit)} 초과 ${failed.lost} · HTML 없음 ${failed.missing})`);
  if (failed.shell || failed.lost) {
    log(
      "  자동광고가 저장한 배치 경로가 깨집니다 — 위 '바뀐 마디'에서 빠진 클래스를 되살리세요(루트 셸·레이아웃 래퍼는 개명·삭제 금지, 클래스 추가는 안전). " +
        "의도한 페이지 개편이면 스크립트 머리말의 --update 절차를 따르세요.",
    );
  }
  if (failed.missing) log("  HTML 없음은 검사 불가입니다 — 라우트가 엣지 렌더로 바뀌었거나 빌드가 불완전합니다.");
  return 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
