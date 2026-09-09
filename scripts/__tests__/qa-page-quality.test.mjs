import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { analyzeHtml, buildLedger, classifyLink, parseSitemap, runQuality } from "../qa-page-quality.mjs";

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
