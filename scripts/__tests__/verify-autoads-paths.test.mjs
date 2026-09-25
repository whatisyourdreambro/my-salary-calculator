// scripts/verify-autoads-paths.mjs 픽스처 테스트 (2026-09-25, 자동광고 경로 회귀 게이트)
// 실행: node --test scripts/__tests__/verify-autoads-paths.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkPlacements,
  collectPaths,
  comparePage,
  parseHtml,
  parseSelector,
  pathOf,
  querySelectorAll,
  segmentOf,
  selectorMatches,
  toAbsolute,
  toRelative,
} from "../verify-autoads-paths.mjs";

const SCRIPT = fileURLToPath(new URL("../verify-autoads-paths.mjs", import.meta.url));
const SHELL = "BODY>DIV.flex.flex-col.min-h-screen>MAIN#main-content.flex-grow.w-full>DIV.w-full.h-full";

/** Next 루트 레이아웃과 같은 뼈대(헤더·nav·스크립트·푸터 포함)에 본문만 바꿔 끼운다. */
const doc = (content, { wrapper = "w-full h-full min-w-0" } = {}) =>
  `<!DOCTYPE html><html lang="ko"><head><meta charSet="utf-8"/><title>t</title>` +
  `<script>self.__next_f.push([1,"<div class=\\"fake\\"></div></main>"])</script><style>.x>div{color:red}</style></head>` +
  `<body class="antialiased bg-canvas text-navy dark:bg-canvas-950"><a href="#main-content" class="skip-to-content">skip</a>` +
  `<div class="flex flex-col min-h-screen"><header lang="ko" class="fixed top-0"><nav class="page-width"><div class="flex items-center"><p>menu</p></div></nav></header>` +
  `<main id="main-content" class="flex-grow w-full"><div class="${wrapper}">${content}</div></main>` +
  `<footer class="border-t"><div class="page-width"><p>footer</p></div></footer></div>` +
  `<script>document.write("<section class=\\"injected\\"></section>")</script></body></html>`;

const leafPage = (names, opts) =>
  doc(`<main class="min-h-screen bg-canvas">${names.map((n) => `<p class="item-${n} text-sm px-4">${n}</p>`).join("")}</main>`, opts);
const LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

test("segment rules: BODY bare, digit-ending and variant classes dropped, useId ids dropped", () => {
  const dom = parseHtml(
    doc(`<section id="calc-panel" class="py-8 sm:py-10 bg-[#fff] w-1/2 text-navy/80 max-w-7xl mx-auto"><div id=":R1pb2kq:" class="grid grid-cols-2 gap-4 !mt-0 group/item"><h2 class="text-xl hover:underline">x</h2></div></section>`),
  );
  const h2 = querySelectorAll(dom, parseSelector("H2"))[0];
  assert.equal(segmentOf(dom.byTag.get("body")[0]), "BODY");
  assert.equal(pathOf(h2), `${SHELL}>SECTION#calc-panel.max-w-7xl.mx-auto>DIV.grid>H2.text-xl`);
});

test("parser: raw text, noscript, template content and implicit HTML rules", () => {
  const dom = parseHtml(
    doc(
      `<p class="intro">lead<div class="breaker">block</div></p>` +
        `<table class="tbl"><tr><td><div class="cell-box">1</div></td></tr></table>` +
        `<noscript><div class="ns-only">js off</div></noscript>` +
        `<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"><div class="tpl-only"></div></template>` +
        `<svg viewBox="0 0 1 1"><path d="M0 0"/><g class="glyph"></g></svg><div class="after-svg">ok</div>`,
    ),
  );
  // <div> 가 열린 <p> 를 닫고, 짝 없는 </p> 는 빈 <p> 가 된다 — 브라우저 DOM 과 같은 형제 관계
  assert.ok(selectorMatches(dom, `${SHELL}>DIV.breaker`));
  assert.ok(!selectorMatches(dom, "P.intro>DIV.breaker"));
  // table>tr 사이 tbody 삽입
  assert.ok(selectorMatches(dom, `${SHELL}>TABLE.tbl>TBODY>TR>TD>DIV.cell-box`));
  // 스크립트 문자열·noscript·template 내용은 DOM 요소가 아니다
  for (const sel of ["DIV.fake", "SECTION.injected", "DIV.ns-only", "DIV.tpl-only"]) assert.ok(!selectorMatches(dom, sel), sel);
  // svg 안 '/>' 자기 닫기 뒤의 형제가 제자리에 붙는다
  assert.ok(selectorMatches(dom, "SVG>G.glyph"));
  assert.ok(selectorMatches(dom, `${SHELL}>DIV.after-svg`));
});

test("candidates: main content only, ad containers / nav / hidden / closed details bodies excluded", () => {
  const dom = parseHtml(
    doc(
      `<div class="page-width"><section class="card"><h2 class="title">t</h2></section>` +
        `<div class="ad-container ad-slot-home-top"><div class="inside-ad"></div></div>` +
        `<nav class="toc"><ul class="toc-list"><li>x</li></ul></nav>` +
        `<div hidden class="hidden-attr"></div><div style="display:none" class="styled-none"></div><p class="sr-only">sr</p>` +
        `<details class="faq"><summary><div class="q-row">Q</div></summary><div class="answer">A</div></details>` +
        `<details open class="faq-open"><div class="answer-open">A</div></details></div>`,
    ),
  );
  const { shell, paths } = collectPaths(dom);
  assert.equal(shell, SHELL);
  const rel = paths.map((p) => toRelative(p, SHELL));
  assert.deepEqual(rel, [
    "",
    "DIV.page-width",
    "DIV.page-width>SECTION.card",
    "DIV.page-width>SECTION.card>H2.title",
    "DIV.page-width>DETAILS.faq",
    "DIV.page-width>DETAILS.faq>SUMMARY>DIV.q-row",
    "DIV.page-width>DETAILS.faq-open",
    "DIV.page-width>DETAILS.faq-open>DIV.answer-open",
  ]);
  assert.deepEqual(rel.map((r) => toAbsolute(r, SHELL)), paths);
});

test("9/10 incident replay: dropping h-full from the template wrapper breaks the root shell and every path", () => {
  const before = parseHtml(leafPage(LETTERS));
  const { paths } = collectPaths(before);
  const pageBaseline = { paths: paths.map((p) => toRelative(p, SHELL)) };
  const after = parseHtml(leafPage(LETTERS, { wrapper: "w-full min-w-0" }));
  const r = comparePage(after, pageBaseline, SHELL);
  assert.equal(r.lost, r.total);
  assert.equal(r.ratio, 1);
  assert.equal(r.shellBreak.index, 4);
  assert.equal(r.shellBreak.expected, "DIV.w-full.h-full");
  assert.deepEqual(r.shellBreak.found, ["DIV.w-full"]);
  assert.equal(r.changes.length, 1);
  assert.equal(r.changes[0].count, r.total);
});

test("adding classes keeps every stored path matching (CSS superset semantics)", () => {
  const { paths } = collectPaths(parseHtml(leafPage(LETTERS)));
  const pageBaseline = { paths: paths.map((p) => toRelative(p, SHELL)) };
  const after = parseHtml(leafPage(LETTERS, { wrapper: "w-full h-full min-w-0 overflow-x-clip" }));
  const r = comparePage(after, pageBaseline, SHELL);
  assert.equal(r.lost, 0);
  assert.equal(r.shellBreak, null);
});

test("placements snapshot: occurrence index, unanchored selectors, unsupported syntax", () => {
  const dom = parseHtml(doc(`<div class="page-width"><div class="row"></div><div class="row"></div></div><section id="home-work-clock"><div class="page-width"></div></section>`));
  const groups = checkPlacements(
    {
      groups: {
        fixed: {
          placements: [
            { selector: `${SHELL}>DIV.page-width>DIV.row`, occurrenceIndex: 1, position: 4 },
            { selector: `${SHELL}>DIV.page-width>DIV.row`, occurrenceIndex: 2, position: 4 },
            { selector: "SECTION#home-work-clock>DIV.page-width", occurrenceIndex: 0, position: 1 },
            { selector: "DIV.recharts-wrapper", occurrenceIndex: null, position: 2 },
            { selector: "DIV:nth-child(2)", occurrenceIndex: null, position: 2 },
          ],
        },
      },
    },
    new Map([["/", dom]]),
  );
  const rows = groups[0].rows;
  assert.deepEqual(rows.map((r) => r.pages.length), [1, 0, 1, 0, 0]);
  assert.equal(rows[4].parsed, false);
});

// ── CLI ──────────────────────────────────────────────────────────────
function fakeNext(pages) {
  const root = mkdtempSync(join(tmpdir(), "autoads-paths-"));
  const next = join(root, ".next");
  mkdirSync(join(next, "server", "app"), { recursive: true });
  for (const [rel, html] of Object.entries(pages)) {
    const file = join(next, "server", "app", ...rel.split("/"));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
  }
  return { root, next, baseline: join(root, "baseline.json"), placements: join(root, "none.json") };
}
const run = (f, ...extra) =>
  spawnSync(process.execPath, [SCRIPT, "--next-dir", f.next, "--baseline", f.baseline, "--placements", f.placements, ...extra], {
    encoding: "utf8",
  });
const PAGES = "/,/guides/x";

test("cli: --update then check passes; a 9/10-style shell break fails with the changed segment", (t) => {
  const f = fakeNext({ "index.html": leafPage(LETTERS), "guides/x.html": leafPage(["x", "y"]) });
  t.after(() => rmSync(f.root, { recursive: true, force: true }));
  const up = run(f, "--update", "--pages", PAGES);
  assert.equal(up.status, 0, up.stdout + up.stderr);
  const saved = JSON.parse(readFileSync(f.baseline, "utf8"));
  assert.equal(saved.rootShell, SHELL);
  assert.equal(saved.pages["/"].count, 10);
  assert.equal(saved.pages["/guides/x"].file, "guides/x.html");

  const ok = run(f);
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /통과/);

  writeFileSync(join(f.next, "server", "app", "index.html"), leafPage(LETTERS, { wrapper: "w-full min-w-0" }));
  const bad = run(f);
  assert.equal(bad.status, 1, bad.stdout + bad.stderr);
  assert.match(bad.stdout, /FAIL {2}\/ +기준 경로 0\/10 일치 \(소실 10, 100\.0%\).*루트 셸 깨짐/);
  assert.match(bad.stdout, /4번째 마디 'DIV\.w-full\.h-full' → 현재 'DIV\.w-full'/);
  assert.match(bad.stdout, /루트 셸 깨짐 1 · 소실 20\.0% 초과 0 · HTML 없음 0/);
});

test("cli: 20% lost passes (INFO), more than 20% fails; baseline maxLostRatio cannot loosen the gate", (t) => {
  const f = fakeNext({ "index.html": leafPage(LETTERS), "guides/x.html": leafPage(["x", "y"]) });
  t.after(() => rmSync(f.root, { recursive: true, force: true }));
  assert.equal(run(f, "--update", "--pages", PAGES).status, 0);

  // 10경로(래퍼 1 + p 9) 중 2개 개명 = 20% → 통과(INFO)
  writeFileSync(join(f.next, "server", "app", "index.html"), leafPage(["za", "zb", ...LETTERS.slice(2)]));
  const twenty = run(f);
  assert.equal(twenty.status, 0, twenty.stdout + twenty.stderr);
  assert.match(twenty.stdout, /INFO {2}\/ +기준 경로 8\/10 일치 \(소실 2, 20\.0%\)/);
  assert.match(twenty.stdout, /6번째 마디 'P\.item-a\.text-sm'/);

  // 3개 개명 = 30% → 실패. 기준선에 maxLostRatio: 1 을 넣어도 코드 상수(20%)가 적용된다
  const saved = JSON.parse(readFileSync(f.baseline, "utf8"));
  writeFileSync(f.baseline, JSON.stringify({ ...saved, maxLostRatio: 1 }));
  writeFileSync(join(f.next, "server", "app", "index.html"), leafPage(["za", "zb", "zc", ...LETTERS.slice(3)]));
  const thirty = run(f);
  assert.equal(thirty.status, 1, thirty.stdout + thirty.stderr);
  assert.match(thirty.stdout, /FAIL {2}\/ +기준 경로 7\/10 일치 \(소실 3, 30\.0%\)/);
  assert.match(
    thirty.stdout,
    /6번째 마디 'P\.item-a\.text-sm' → 현재 'P\.item-za\.text-sm \| P\.item-zb\.text-sm \| P\.item-zc\.text-sm \| P\.item-d\.text-sm'/,
  );
  assert.match(thirty.stdout, /소실 20\.0% 초과 1/);
});

test("cli: missing prerendered page, missing build, missing baseline all fail (never a silent pass)", (t) => {
  const f = fakeNext({ "index.html": leafPage(LETTERS), "guides/x.html": leafPage(["x"]) });
  t.after(() => rmSync(f.root, { recursive: true, force: true }));

  const noBaseline = run(f);
  assert.equal(noBaseline.status, 1);
  assert.match(noBaseline.stderr, /기준선 없음/);

  assert.equal(run(f, "--update", "--pages", PAGES).status, 0);
  rmSync(join(f.next, "server", "app", "guides"), { recursive: true, force: true });
  const missing = run(f);
  assert.equal(missing.status, 1, missing.stdout + missing.stderr);
  assert.match(missing.stdout, /FAIL {2}\/guides\/x — 프리렌더 HTML 없음/);
  assert.match(missing.stdout, /HTML 없음 1/);

  // --update 도 페이지가 빠지면 기준선을 덮어쓰지 않는다
  const before = readFileSync(f.baseline, "utf8");
  const partial = run(f, "--update", "--pages", PAGES);
  assert.equal(partial.status, 1);
  assert.equal(readFileSync(f.baseline, "utf8"), before);

  rmSync(f.next, { recursive: true, force: true });
  const noBuild = run(f);
  assert.equal(noBuild.status, 1);
  assert.match(noBuild.stderr, /프리렌더 디렉터리 없음/);
  assert.ok(!existsSync(f.next));
});
