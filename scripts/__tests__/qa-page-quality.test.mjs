import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  NOINDEX_LINK_ALLOW,
  WEAK_BASELINE_FILE,
  analyzeHtml,
  buildLedger,
  classifyLink,
  isMiddlewareSalaryRedirect,
  isNoindexLinkAllowed,
  linkGateLines,
  pageFamily,
  parseSitemap,
  qualityFailed,
  readHeldBackGuidePaths,
  runQuality,
  weakBaselineFromLedger,
  weakDiff,
  weakDiffLines,
} from "../qa-page-quality.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));

const origin = "https://example.test";
function removeFixture(root) {
  const resolved = path.resolve(root);
  assert.ok(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep));
  assert.match(path.basename(resolved), /^page-quality-(test|missing)-/);
  fs.rmSync(resolved, { recursive: true, force: true });
}
const page = (pathname = "/", extra = "", head = "") => `<!doctype html><html><head><title>Title ${pathname}</title><meta name="description" content="Description ${pathname}"><link rel="canonical" href="${origin}${pathname}">${head}</head><body><nav><a href="/">Home</a></nav><main><h1>Heading ${pathname}</h1><p>Visible body.</p>${extra}</main></body></html>`;

test("reads real HTML only, decoding entities and preserving valid JSON-LD graphs", () => {
  const html = page("/", `<h2>Overview</h2><a href='/topic?x=1&amp;y=2'>Answer</a><table><tr><td>Value</td></tr></table><input><button>Go</button><div hidden>Hidden words</div><script>self.__next_f.push(['<h1>Fake</h1><a href="/not-real">bad</a>']);</script>`, `<script data-note="a > b" type='application/ld+json'>{"@graph":[{"@type":"Article"},{"@type":["FAQPage","WebPage"]}]}</script>`);
  const actual = analyzeHtml(html);
  assert.deepEqual(actual.h1, ["Heading /"]);
  assert.equal(actual.links.length, 2);
  assert.equal(actual.links[1].href, "/topic?x=1&y=2");
  assert.equal(actual.links[0].inContent, false);
  assert.equal(actual.links[1].inContent, true);
  assert.deepEqual(actual.jsonLd, { documents: 1, types: ["Article", "FAQPage", "WebPage"], errors: 0 });
  assert.equal(actual.content.tables, 1);
  assert.equal(actual.content.rows, 1);
  assert.equal(actual.content.inputs, 1);
  assert.equal(actual.content.buttons, 1);
  assert.equal(actual.content.characters, "Heading / Visible body. Overview Answer Value Go".length);
});

test("records empty/duplicate tags and malformed JSON-LD without treating them as missing data", () => {
  const actual = analyzeHtml(page("/", "<h1>Second</h1>", '<meta name="description" content=""><script type="application/ld+json">{oops}</script>'));
  assert.equal(actual.h1.length, 2);
  assert.deepEqual(actual.descriptions, ["Description /", ""]);
  assert.equal(actual.jsonLd.errors, 1);
});

test("handles inline tags and quoted angle brackets in attributes", () => {
  const actual = analyzeHtml('<html><head><title>A &amp; B</title><meta name="description" content="A > B &quot;quoted&quot;"></head><body><main><h1>Salary <span>2027</span></h1></main></body></html>');
  assert.deepEqual(actual.titles, ["A & B"]);
  assert.deepEqual(actual.h1, ["Salary 2027"]);
  assert.deepEqual(actual.descriptions, ['A > B "quoted"']);
});

test("decodes encoded Korean sitemap URLs but does not create pages from query variations", () => {
  const entries = parseSitemap(`<urlset><url><loc>${origin}/qna/%ED%85%8C%EC%8A%A4%ED%8A%B8</loc></url><url><loc>${origin}/guides?q=x&amp;a=1</loc></url></urlset>`);
  assert.equal(entries[0].path, "/qna/테스트");
  assert.equal(entries[1].path, "/guides");
  assert.equal(entries[1].hasQuery, true);
});

const context = {
  origin, htmlPaths: new Set(["/guides"]), sitemapPaths: new Set(["/qna/known"]),
  handlers: new Set(["/insights/report/data.csv"]), publicFiles: new Set(["/logo.svg"]),
  redirects: [{ test: /^\/old$/, destination: "/guides" }], dynamic: [{ test: /^\/qna\/[^/]+$/ }],
};
test("distinguishes actual download routes from missing files and unverified dynamic slugs", () => {
  assert.equal(classifyLink("/insights/report/data.csv", "/", context).kind, "route-handler");
  assert.equal(classifyLink("/insights/missing.csv", "/", context).kind, "unresolved-asset");
  assert.equal(classifyLink("/logo.svg", "/", context).kind, "public-asset");
  assert.equal(classifyLink("/qna/known", "/", context).kind, "sitemap-runtime-unchecked");
  assert.equal(classifyLink("/qna/unknown", "/", context).kind, "dynamic-pattern-unchecked");
  assert.equal(classifyLink("/missing", "/", context).kind, "unresolved-page");
  assert.equal(classifyLink("/old", "/", context).kind, "configured-redirect");
  assert.equal(classifyLink("https://other.test/", "/", context).kind, "external");
  const query = classifyLink("/guides?q=private-input#section", "/", context);
  assert.deepEqual(query, { target: "/guides", queryVariant: true, queryKeys: ["q"], fragment: true, kind: "generated-html" });
  assert.ok(!JSON.stringify(query).includes("private-input"));
});

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "page-quality-test-"));
  const write = (name, value) => {
    const target = path.join(root, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, typeof value === "string" ? value : JSON.stringify(value));
  };
  write(".next/BUILD_ID", "fixture-build");
  write(".next/routes-manifest.json", { redirects: [{ source: "/old", destination: "/", statusCode: 308, regex: "^/old$" }], dynamicRoutes: [{ page: "/qna/[slug]", regex: "^/qna/[^/]+$" }] });
  write(".next/prerender-manifest.json", { routes: { "/": {}, "/sitemap.xml": {} } });
  write(".next/server/app-paths-manifest.json", { "/page": "app/page.js", "/qna/[slug]/page": "app/qna/[slug]/page.js", "/insights/report/data.csv/route": "app/insights/report/data.csv/route.js" });
  write(".next/server/middleware-manifest.json", { functions: { "/qna/[slug]": { page: "/qna/[slug]/page", matchers: [{ regexp: "^/qna/[^/]+$" }] } } });
  write(".next/server/app/sitemap.xml.body", `<urlset><url><loc>${origin}/</loc></url><url><loc>${origin}/qna/known</loc></url></urlset>`);
  write(".next/server/app/index.html", page("/", '<a href="/qna/known">Question</a><a href="/insights/report/data.csv">Download</a>'));
  write(".next/server/app/private.html", page("/private", "", '<meta name="robots" content="noindex, follow">'));
  write(".next/server/app/old.html", page("/old"));
  return { root, write, cleanup: () => removeFixture(root) };
}

test("inventories generated HTML and Edge sitemap URLs with honest, separate review states", () => {
  const f = fixture();
  try {
    const ledger = runQuality({ root: f.root });
    assert.equal(ledger.counts.generatedHtml, 3);
    assert.equal(ledger.counts.uniquePagePaths, 4);
    assert.equal(ledger.counts.declaredRuntimeEntries, 1);
    assert.equal(ledger.counts.issuePages, 0);
    assert.equal(ledger.counts.unresolvedLinkOccurrences, 0);
    assert.equal(ledger.records.find(item => item.path === "/qna/known").runtime, "edge");
    assert.equal(ledger.records.find(item => item.path === "/qna/known").machineStatus, "inventory-only");
    assert.equal(ledger.records.find(item => item.path === "/qna/known").titles, null);
    assert.equal(ledger.records.find(item => item.path === "/old").classification, "redirect");
    assert.ok(ledger.records.every(item => item.contentReview === "not-reviewed" && item.response.productionHttpStatus === null));
    assert.ok(fs.existsSync(path.join(f.root, ".artifacts/page-quality/summary.md")));
    assert.equal(ledger.shortContentReview.length, 1);
    assert.equal(ledger.records.find(item => item.path === "/").machineStatus, "checked");
  } finally { f.cleanup(); }
});

test("detects structural errors and artifact noindex without assuming an HTTP 200", () => {
  const f = fixture();
  try {
    f.write(".next/server/app/index.html", page("/", '<h1>Duplicate</h1><a href="/missing">Missing</a>', '<script type="application/ld+json">broken</script>'));
    let ledger = buildLedger({ root: f.root });
    assert.deepEqual(ledger.records.find(item => item.path === "/").issues, ["h1-count-or-empty", "jsonld-parse-error"]);
    assert.equal(ledger.counts.unresolvedLinkOccurrences, 1);
    f.write(".next/server/app/index.meta", { headers: { "X-Robots-Tag": "noindex" } });
    ledger = buildLedger({ root: f.root });
    const home = ledger.records.find(item => item.path === "/");
    assert.equal(home.classification, "noindex");
    assert.ok(home.issues.includes("sitemap-excluded-document"));
    assert.equal(home.response.artifactStatus, null);
  } finally { f.cleanup(); }
});

test("a missing build fails instead of writing an empty success ledger", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "page-quality-missing-"));
  try { assert.throws(() => buildLedger({ root }), /ENOENT/); }
  finally { removeFixture(root); }
});

// ── 2026-09-30 WP-01 LT-07: redirect·noindex link gate, weak-page report ─────────────────────────

test("LT-07 links carry the nearest data-msy-module (seasonal-links can be told apart)", () => {
  const html = page("/", '<section data-msy-module="seasonal-links"><div><a href="/a">A</a></div></section><div data-msy-module="related"><a href="/b">B</a><a data-msy-module="cta" href="/c">C</a></div><a href="/d">D</a>');
  const links = analyzeHtml(html).links.filter(link => link.inContent);
  assert.deepEqual(links.map(link => [link.href, link.module]), [["/a", "seasonal-links"], ["/b", "related"], ["/c", "cta"], ["/d", ""]]);
});

test("LT-07 /salary grid snap: off-grid amounts and legacy forms are middleware 308s, generated pages and junk are not", () => {
  const html = new Set(["/salary/50000000", "/guides"]);
  for (const target of ["/salary/12345678", "/salary/5000", "/salary/13400-manwon", "/salary/1-eok", "/salary/1-5-eok", "/salary/0-5-eok"]) assert.equal(isMiddlewareSalaryRedirect(target, html), true, target);
  for (const target of ["/salary/50000000", "/salary/0", "/salary/0-eok", "/salary/abc", "/salary/1-5", "/salary", "/salary/1/2", "/en/salary/123", "/monthly/123"]) assert.equal(isMiddlewareSalaryRedirect(target, html), false, target);
  const ctx = { ...context, htmlPaths: html, dynamic: [{ test: /^\/salary\/[^/]+$/ }] };
  assert.equal(classifyLink("/salary/12345678", "/", ctx).kind, "middleware-salary-redirect");
  assert.equal(classifyLink("/salary/50000000", "/", ctx).kind, "generated-html");
  assert.equal(classifyLink("/salary/abc", "/", ctx).kind, "dynamic-pattern-unchecked");
});

/** source 에서 header 로 시작하는 함수의 본문(매개변수 뒤 첫 { 다음부터 짝 맞는 } 앞까지). 정규식의 {1,10} 같은 중괄호는 짝이 맞아 그대로 센다. */
function functionBody(source, header) {
  const start = source.indexOf(header);
  assert.ok(start >= 0, `${header} 를 찾지 못함`);
  const open = source.indexOf("{", source.indexOf(")", start));
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) return source.slice(open + 1, i);
  }
  assert.fail(`${header} 본문의 짝 맞는 } 가 없음`);
}
/** 스냅 분기 한 줄: if ((m = segment.match(/…/))) return <식>; — [정규식 리터럴, 반환식] 을 잡는다. */
const SNAP_BRANCH = /if \(\(m = segment\.match\((\/(?:\\.|[^/\\\r\n])+\/[a-z]*)\)\)\) return ([^;\r\n]+);/g;

test("LT-07 salary snap mirror matches src/lib/salaryRedirect.ts (drift guard)", () => {
  const source = fs.readFileSync(path.join(REPO, "src/lib/salaryRedirect.ts"), "utf8");
  for (const literal of ["/^\\/salary\\/([^/]+)$/", "/^(\\d{1,10})$/", "/^(\\d{1,6})-manwon$/", "/^(\\d{1,3})-5-eok$/", "/^(\\d{1,3})-eok$/", "100_000_000 + 50_000_000", "* 10_000"])
    assert.ok(source.includes(literal), `salaryRedirect.ts 에 ${literal} 가 없음 — qa-page-quality.mjs 의 사본도 함께 고칠 것`);
  // 정확도 단언(9/30 WP-01 리뷰): 포함 검사만으로는 parseSalaryPathAmount 에 새 URL 형태(다섯 번째 segment.match)가 생겨도
  // 통과하고, 사본은 그 형태의 308 링크를 놓친다. 원본 본문을 잘라 분기 수가 정확히 4인지, 분기별 정규식·반환식이 사본과 같은지 본다.
  const original = functionBody(source, "export function parseSalaryPathAmount(");
  const mirror = functionBody(fs.readFileSync(path.join(REPO, "scripts/qa-page-quality.mjs"), "utf8"), "export function middlewareSalaryAmount(");
  const fix = "— scripts/qa-page-quality.mjs 의 middlewareSalaryAmount 사본도 함께 고칠 것";
  assert.equal(original.split("segment.match(").length - 1, 4, `parseSalaryPathAmount 의 segment.match( 가 4개가 아님 ${fix}`);
  const branches = (body) => [...body.matchAll(SNAP_BRANCH)].map(m => [m[1], m[2].trim()]);
  assert.equal(branches(original).length, 4, `parseSalaryPathAmount 의 분기가 if ((m = segment.match(/…/))) return …; 꼴 4개가 아님 ${fix}`);
  assert.deepEqual(branches(mirror), branches(original), `정규식·반환식 목록이 원본과 다름 ${fix}`);
});

test("LT-07 noindex allowlist: utilities and /company/compare* only", () => {
  assert.deepEqual(NOINDEX_LINK_ALLOW, ["/dashboard", "/report", "/contact", "/en/contact", "/en/dashboard"]);
  for (const target of ["/dashboard", "/report", "/contact", "/en/contact", "/en/dashboard", "/company/compare", "/company/compare/a-vs-b"]) assert.equal(isNoindexLinkAllowed(target), true, target);
  for (const target of ["/private", "/share/x", "/dashboard/x", "/company", "/en/report", "/companycompare"]) assert.equal(isNoindexLinkAllowed(target), false, target);
});

function gateFixture() {
  const f = fixture();
  f.write(".next/routes-manifest.json", { redirects: [{ source: "/old", destination: "/", statusCode: 308, regex: "^/old$" }, { source: "/gone", destination: "/", statusCode: 308, regex: "^/gone$" }], dynamicRoutes: [{ page: "/qna/[slug]", regex: "^/qna/[^/]+$" }, { page: "/salary/[amount]", regex: "^/salary/[^/]+$" }] });
  f.write(".next/server/app/dashboard.html", page("/dashboard", "", '<meta name="robots" content="noindex, nofollow">'));
  f.write(".next/server/app/company/compare/a-vs-b.html", page("/company/compare/a-vs-b", "", '<meta name="robots" content="noindex, nofollow">'));
  f.write(".next/server/app/salary/50000000.html", page("/salary/50000000"));
  return f;
}

test("LT-07 gate: followed links from indexable pages to 308s or non-allowlisted noindex pages fail qa:quality", () => {
  const f = gateFixture();
  try {
    // 기준: 허용된 유틸 noindex·nofollow·noindex 쪽에서 나간 링크만 — 통과
    f.write(".next/server/app/index.html", page("/", '<a href="/dashboard">D</a><a href="/company/compare/a-vs-b">C</a><a rel="nofollow" href="/old">N</a><a rel="nofollow" href="/private">P</a><a href="/salary/50000000">S</a>'));
    f.write(".next/server/app/private.html", page("/private", '<a href="/old">from noindex</a><a href="/gone">x</a>', '<meta name="robots" content="noindex, follow">'));
    let ledger = buildLedger({ root: f.root });
    assert.equal(ledger.counts.redirectLinkOccurrences, 0);
    assert.equal(ledger.counts.noindexLinkOccurrences, 0);
    assert.equal(qualityFailed(ledger), false);

    // 설정 redirect(HTML 이 있어도 redirect 규칙이 먼저)·설정 redirect(HTML 없음)·/salary 격자 밖·허용목록 밖 noindex
    f.write(".next/server/app/index.html", page("/", '<a href="/old">O</a><a href="/old">O2</a><a href="/gone">G</a><a href="/salary/13400-manwon">M</a><a href="/private">P</a>'));
    ledger = buildLedger({ root: f.root });
    assert.equal(ledger.counts.redirectLinkOccurrences, 4);
    assert.equal(ledger.counts.noindexLinkOccurrences, 1);
    assert.deepEqual(ledger.linkGate.redirectLinks.map(link => [link.target, link.kind, link.occurrences]), [["/gone", "configured-redirect", 1], ["/old", "configured-redirect", 2], ["/salary/13400-manwon", "middleware-salary-redirect", 1]]);
    assert.deepEqual(ledger.linkGate.noindexLinks, [{ source: "/", target: "/private", occurrences: 1 }]);
    assert.equal(qualityFailed(ledger), true);
    const lines = linkGateLines(ledger).join("\n");
    assert.match(lines, /4 followed links to a 308/);
    assert.match(lines, /308 middleware-salary-redirect: \/ -> \/salary\/13400-manwon/);
    assert.match(lines, /noindex: \/ -> \/private/);
  } finally { f.cleanup(); }
});

test("LT-07 weak pages: seasonal-links, self, nav and nofollow links do not count; held-back R4 guides are allowlisted; diff vs baseline", () => {
  const f = gateFixture();
  try {
    const urls = ["/", "/guides", "/guides/a", "/guides/b", "/guides/held", "/calc/x"];
    f.write(".next/server/app/sitemap.xml.body", `<urlset>${urls.map(u => `<url><loc>${origin}${u}</loc></url>`).join("")}<url><loc>${origin}/qna/known</loc></url></urlset>`);
    f.write(".next/server/app/index.html", page("/", '<a href="/guides">G</a><a href="/guides/a">A</a><section data-msy-module="seasonal-links"><a href="/guides/b">B</a><a href="/calc/x">X</a></section><a rel="nofollow" href="/calc/x">nf</a><a href="/">self</a>'));
    f.write(".next/server/app/guides.html", page("/guides", '<a href="/guides/a">A</a><a href="/guides">self</a>'));
    f.write(".next/server/app/guides/a.html", page("/guides/a", '<a href="/guides">G</a><a href="/">H</a><a href="/guides/held">H</a>'));
    f.write(".next/server/app/guides/b.html", page("/guides/b", '<a href="/guides">G</a>'));
    f.write(".next/server/app/guides/held.html", page("/guides/held", '<a href="/guides">G</a>'));
    f.write(".next/server/app/calc/x.html", page("/calc/x", '<a href="/guides">G</a><a href="/">H</a>'));
    f.write("src/lib/guideReleaseHoldback.ts", 'export const RELEASE_HOLDBACK_SLUGS: ReadonlySet<string> = new Set([\n  // 주석 "not-a-slug"\n  "held",\n]);\n');
    assert.deepEqual(readHeldBackGuidePaths(f.root), ["/guides/held"]);
    const ledger = runQuality({ root: f.root });
    const rec = (p) => ledger.records.find(item => item.path === p);
    assert.equal(rec("/guides").incomingContentPagesExSeasonal, 5);
    assert.equal(rec("/guides/a").incomingContentPagesExSeasonal, 2);
    assert.equal(rec("/guides/b").incomingContentPagesExSeasonal, 0, "seasonal-links 만");
    assert.equal(rec("/guides/b").incomingContentPages, 1, "기존 지표는 그대로(seasonal 포함)");
    assert.equal(rec("/calc/x").incomingContentPagesExSeasonal, 0, "seasonal·nofollow 제외");
    assert.equal(rec("/").incomingContentPagesExSeasonal, 2, "자기 링크 제외");
    assert.deepEqual(ledger.weak.families, { "calc": [{ path: "/calc/x", incoming: 0 }], "guides": [{ path: "/guides/a", incoming: 2 }, { path: "/guides/b", incoming: 0 }], "home": [{ path: "/", incoming: 2 }] });
    assert.deepEqual(ledger.weak.heldBack, [{ path: "/guides/held", incoming: 1 }]);
    assert.equal(ledger.weak.total, 4);
    assert.equal(ledger.weak.inventoryOnlySitemapPaths, 1, "edge qna 는 inventory-only 로 남는다");
    assert.equal(qualityFailed(ledger), false, "약한 페이지는 보고 전용");
    assert.equal(ledger.weakDiff, null, "기준선 파일이 없으면 차이 없음");
    const weakFile = JSON.parse(fs.readFileSync(path.join(f.root, ".artifacts/page-quality/weak.json"), "utf8"));
    assert.equal(weakFile.total, 4);
    assert.equal(weakFile.baselineFile, null);

    // 기준선과의 차이만 출력
    const baseline = weakBaselineFromLedger(ledger, "fixture");
    baseline.families.guides = ["/guides/a", "/guides/old-weak"];
    delete baseline.families.calc;
    f.write(WEAK_BASELINE_FILE, JSON.stringify(baseline));
    const again = runQuality({ root: f.root });
    assert.deepEqual(again.weakDiff.added, [{ path: "/calc/x", family: "calc", incoming: 0 }, { path: "/guides/b", family: "guides", incoming: 0 }]);
    assert.deepEqual(again.weakDiff.resolved, [{ path: "/guides/old-weak", family: "guides" }]);
    const lines = weakDiffLines(again.weakDiff).join("\n");
    assert.match(lines, /weak pages \(<=2 content links, report only\): 4 \(baseline 3\) · \+2 new · -1 resolved · calc 0→1/);
    assert.match(lines, /\n {2}\+ \/calc\/x \(calc, 0\)/);
    assert.match(lines, /\n {2}- \/guides\/old-weak \(guides\)/);
    assert.equal(JSON.parse(fs.readFileSync(path.join(f.root, ".artifacts/page-quality/weak.json"), "utf8")).baselineFile, WEAK_BASELINE_FILE);
    assert.deepEqual(weakDiff(again.weak, null).resolved, []);
  } finally { f.cleanup(); }
});

test("LT-07 weak-page families follow URL shape", () => {
  const cases = [["/", "home"], ["/about", "single"], ["/civil-servant-pay-2026", "single"], ["/calc/bmi-quick", "calc"], ["/guides/a", "guides"], ["/guides/category/tax", "guides-category"], ["/salary-db/samsung-electronics", "company"], ["/salary-db/listed/000020", "listed"], ["/salary-db/listed/industry/bank", "listed-industry"], ["/salary-db/compare/a-vs-b", "compare"], ["/salary-db/ranking/raise", "salary-db-other"], ["/salary/50000000", "salary-amount"], ["/monthly/3000000", "monthly-amount"], ["/en/guides", "en"], ["/job/nurse", "job"], ["/table/2026/annual", "table"]];
  for (const [p, family] of cases) assert.equal(pageFamily(p), family, p);
});

test("LT-07 committed weak baseline has the shape qa:quality reads", () => {
  const file = path.join(REPO, WEAK_BASELINE_FILE);
  const baseline = JSON.parse(fs.readFileSync(file, "utf8"));
  assert.equal(baseline.threshold, 2);
  const paths = Object.values(baseline.families).flat();
  assert.equal(paths.length, baseline.total);
  assert.equal(new Set(paths).size, paths.length);
  assert.ok(paths.every(p => typeof p === "string" && p.startsWith("/") && !p.includes("?")));
  for (const [family, list] of Object.entries(baseline.families)) for (const p of list) assert.equal(pageFamily(p), family, p);
});
