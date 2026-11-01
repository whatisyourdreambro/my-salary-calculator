// AdSense figure guard (scripts/verify-no-adsense-figures.mjs).
// Every positive sample is assembled at runtime from string parts with zeroed, synthetic numbers,
// so this file itself never holds a statistic-shaped line (the guard also skips this file).
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { MARKER, RULES, scanComments, scanRepo, scanText } from "../verify-no-adsense-figures.mjs";

const GUARD = fileURLToPath(new URL("../verify-no-adsense-figures.mjs", import.meta.url));
const D = "$";
const zero = (n) => "0".repeat(n);

function firstRule(line) {
  const hits = scanText(line);
  return hits.length ? hits[0].rule : null;
}

test("the tracked tree holds no AdSense performance figures", () => {
  assert.deepEqual(scanRepo(), []);
});

test("the guard does not flag its own source", () => {
  assert.deepEqual(scanText(readFileSync(GUARD, "utf8")), []);
});

test("synthetic AdSense statistics are caught", () => {
  const cases = [
    ["rpm", "페이지 " + "RP" + "M " + D + "0.00 (창 평균)"],
    ["cpc", "C" + "PC " + D + "0.0" + zero(2) + " 로 낮음"],
    ["active-view", "Active" + " View " + "00.0%" + " 로 하락"],
    ["impressions-per-pv", "자동 인페이지 " + "노출/PV " + "0.0 → 0.0"],
    ["coverage", "멀티" + "플렉스 " + "커버리지 " + "00.0%"],
    ["revenue-usd", "앵커 " + "수익 " + D + "00.00"],
    ["revenue-krw", "네이버가 " + "수익의 " + "00%"],
    ["unit-ctr", "결과창" + " CTR " + "0.0% -> 0.0%"],
    ["adsense-pageviews", "애드센스 집계 " + "페이지뷰 " + "00,000"],
    // the same count written as PV or page views (the 2026-09-25 navType.ts comment shape)
    ["adsense-pageviews", "28일 GA4 page_view 000,000 대 애드센스 집계 " + "PV " + "00,000"],
    ["adsense-pageviews", "AdSense " + "page views " + "00,000"],
    ["per-1000-views", "1,000" + "뷰당 " + D + "0.00"],
    ["unit-counts", "앵커 " + "00,000" + "노출"],
    ["usd-table-row", "| 9/1~9/9 | " + D + "00.00 | 0,000 | " + D + "0.00 |"],
  ];
  for (const [rule, line] of cases) {
    assert.equal(firstRule(line), rule, `expected ${rule} for a synthetic sample`);
  }
  // every rule has at least one synthetic positive above
  assert.deepEqual(new Set(cases.map(([rule]) => rule)), new Set(RULES.map(([id]) => id)));
});

test("non-AdSense numbers are not flagged", () => {
  const negatives = [
    // GSC search CTR without an ad-unit word
    "GSC 28일 클릭 000 · 노출 0,000 · " + "CTR " + "00.0%" + " · 평균 0.0위",
    // affiliate projection rows name CPA, LinkPrice or 쿠팡
    "| CPA | 일 " + D + "0~1 | " + D + "5~15 | LinkPrice 머천트 실사 |",
    "| 쿠팡 | " + D + "1 | " + D + "2 |",
    // dates, commits and time windows
    "9/24 23:25 배포 `4d80ce3e` · 10/2 조회 · 9/1~9/9 창",
    // lines without digits are ignored
    "RPM 하락 · CTR 상승(우발 클릭 임계 초과) · 커버리지 낮음",
    // a definition next to an identifier with a digit (GA4) and a GA4-only count
    "(a) 애드센스 " + "PV − GA4 " + "`session_start`(같은 창), 사이트 전체",
    "28일 GA4 page_view 000,000 대 애드센스 집계 페이지뷰(비공개)",
  ];
  for (const line of negatives) assert.deepEqual(scanText(line), [], "expected no hit for a negative sample");
});

test("src/** is scanned in its comments only — strings, templates, regex literals and JSX text are not", () => {
  const fig = "애드센스 집계 " + "PV " + "00,000";
  const ts = [
    "// " + fig,
    "const a = \"" + fig + "\";",
    "const b = `see https:// " + fig + "`;",
    "const re = /https?:\\/\\//; const c = '" + fig + "';",
    "/*",
    " * " + fig,
    " */",
    "export const d = 1; // " + fig,
  ].join("\n");
  assert.deepEqual(scanComments(ts, "src/lib/sample.ts"), [
    { line: 1, rule: "adsense-pageviews" },
    { line: 6, rule: "adsense-pageviews" },
    { line: 8, rule: "adsense-pageviews" },
  ]);

  const tsx = [
    "export function Sample() {",
    "  return (",
    "    <div>",
    "      {/* " + fig + " */}",
    "      <p>https://example.com " + fig + "</p>",
    "      <span title=\"" + fig + "\" />",
    "    </div>",
    "  );",
    "}",
  ].join("\n");
  assert.deepEqual(scanComments(tsx, "src/app/sample/page.tsx"), [{ line: 4, rule: "adsense-pageviews" }]);

  const css = ["/* " + fig + " */", ".a::after { content: \"/* " + fig + "\"; }"].join("\n");
  assert.deepEqual(scanComments(css, "src/app/sample.module.css"), [{ line: 1, rule: "adsense-pageviews" }]);

  // CRLF sources keep their own line numbers; a threshold comment still opts out with the marker
  assert.deepEqual(scanComments(["const x = 1;", "// " + fig].join("\r\n"), "src/lib/sample.ts"), [
    { line: 2, rule: "adsense-pageviews" },
  ]);
  assert.deepEqual(scanComments("// " + fig + " " + MARKER, "src/lib/sample.ts"), []);
});

test("the opt-out marker skips a threshold or definition line", () => {
  const threshold = "우발 클릭 = " + "CTR ≥ 0.0% AND " + "CPC ≤ " + D + "0.000";
  assert.notDeepEqual(scanText(threshold), []);
  assert.deepEqual(scanText(`${threshold} // ${MARKER}`), []);
});

test("the CLI exits 1 and prints file:line [rule] without the matched text", (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "adsense-figure-guard-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const sample = "페이지 " + "RP" + "M " + D + "0.00";
  mkdirSync(path.join(root, "docs"), { recursive: true });
  writeFileSync(path.join(root, "docs", "sample.md"), `# 기록\n\n${sample}\n`);
  writeFileSync(path.join(root, "README.md"), "# readme\n");
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["add", "docs/sample.md", "README.md"], { cwd: root });

  const r = spawnSync(process.execPath, [GUARD, root], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /docs\/sample\.md:3 \[rpm\]/);
  assert.equal(r.stdout.includes(sample), false);
  assert.equal(r.stderr.includes(sample), false);
  assert.match(r.stderr, /약관 비밀유지\(Confidentiality\) 조항/);
  assert.match(r.stderr, new RegExp(MARKER));

  writeFileSync(path.join(root, "docs", "sample.md"), "# 기록\n\nRPM 하락(수치 비공개)\n");
  const clean = spawnSync(process.execPath, [GUARD, root], { encoding: "utf8" });
  assert.equal(clean.status, 0);
  assert.match(clean.stdout, /\[adsense-figures\] OK/);
});

test("the CLI reports src/** comment hits and ignores src strings, JSX text and data files", (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "adsense-figure-guard-src-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const fig = "애드센스 집계 " + "PV " + "00,000";
  mkdirSync(path.join(root, "src", "lib"), { recursive: true });
  mkdirSync(path.join(root, "src", "app"), { recursive: true });
  mkdirSync(path.join(root, "src", "data"), { recursive: true });
  writeFileSync(path.join(root, "src", "lib", "sample.ts"), `export const label = "${fig}";\n// ${fig}\n`);
  writeFileSync(path.join(root, "src", "app", "page.tsx"), `export default function P() {\n  return <p>https://example.com ${fig}</p>;\n}\n`);
  writeFileSync(path.join(root, "src", "data", "sample.json"), JSON.stringify({ note: fig }) + "\n");
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["add", "src"], { cwd: root });

  const r = spawnSync(process.execPath, [GUARD, root], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.deepEqual(r.stdout.trim().split(/\r?\n/), ["src/lib/sample.ts:2 [adsense-pageviews]"]);
  assert.equal(r.stdout.includes(fig), false);
  assert.equal(r.stderr.includes(fig), false);

  writeFileSync(path.join(root, "src", "lib", "sample.ts"), `export const label = "${fig}";\n// 애드센스 집계 PV(비공개)\n`);
  const clean = spawnSync(process.execPath, [GUARD, root], { encoding: "utf8" });
  assert.equal(clean.status, 0);
  assert.match(clean.stdout, /\[adsense-figures\] OK/);
});
