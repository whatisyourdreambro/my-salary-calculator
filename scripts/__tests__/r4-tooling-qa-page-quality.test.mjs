// R4 TOOLING (2026-11-18, N2-scripts-05): the qa:quality link gate in the Pages build.
// scripts-b07-M01: a Pages stage serves the worker manifest's redirects (<stage>/generated/pages-manifest.json), while its
// .next/routes-manifest.json holds only the trailing-slash rule, so links to legacy redirect sources passed CI unseen;
// percent-encoded Korean sources never matched the decoded link target in any build.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildLedger, classifyLink, qualityFailed, redirectRulesFor } from "../qa-page-quality.mjs";

const origin = "https://example.test";
const page = (pathname = "/", extra = "") => `<!doctype html><html><head><title>Title ${pathname}</title><meta name="description" content="Description ${pathname}"><link rel="canonical" href="${origin}${pathname}"></head><body><main><h1>Heading ${pathname}</h1><p>Visible body.</p>${extra}</main></body></html>`;

/** A Pages stage: <root>/.pages-qa/.next (build dir) next to <root>/.pages-qa/generated/pages-manifest.json. */
function pagesStage(t, { pagesRedirects, routesRedirects = [], indexLinks = "" }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "r4-tooling-page-quality-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const write = (name, value) => {
    const target = path.join(root, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, typeof value === "string" ? value : JSON.stringify(value));
  };
  const next = ".pages-qa/.next";
  write(`${next}/BUILD_ID`, "pages-fixture");
  write(`${next}/routes-manifest.json`, { redirects: routesRedirects, dynamicRoutes: [{ page: "/[slug]", regex: "^/([^/]+?)(?:/)?$" }] });
  write(`${next}/prerender-manifest.json`, { routes: { "/": {} }, dynamicRoutes: { "/[slug]": { fallback: null } } });
  write(`${next}/server/app-paths-manifest.json`, { "/page": "app/page.js", "/[slug]/page": "app/[slug]/page.js" });
  write(`${next}/server/app/sitemap.xml.body`, `<urlset><url><loc>${origin}/</loc></url></urlset>`);
  write(`${next}/server/app/index.html`, page("/", indexLinks));
  if (pagesRedirects) write(".pages-qa/generated/pages-manifest.json", { version: 1, redirects: pagesRedirects, headers: [] });
  return { root, buildDir: path.join(root, next) };
}

const TRAILING_SLASH_ONLY = [{ source: "/:file((?!\\.well-known(?:/.*)?)(?:[^/]+/)*[^/]+\\.\\w+)/", destination: "/:file", internal: true, statusCode: 308, regex: "^(?:/((?!\\.well-known(?:/.*)?)(?:[^/]+/)*[^/]+\\.\\w+))/$" }];
const OLD_RULE = { source: "/old", destination: "/", permanent: true, regex: "^\\/old(?:\\/)?$", flags: "i", keys: [], statusCode: 308 };
const KOREAN_RULE = { source: "/guides/one-home-prop-tax-12%EC%96%B5-2026", destination: "/guides/x", permanent: true, regex: "^\\/guides\\/one-home-prop-tax-12%EC%96%B5-2026(?:\\/)?$", flags: "i", keys: [], statusCode: 308 };

test("a Pages stage reads its redirects from ../generated/pages-manifest.json; a link to a legacy source fails the gate", t => {
  const { root, buildDir } = pagesStage(t, { pagesRedirects: [OLD_RULE], routesRedirects: TRAILING_SLASH_ONLY, indexLinks: '<a href="/old">legacy</a>' });
  const ledger = buildLedger({ root, buildDir });
  assert.equal(ledger.counts.redirectLinkOccurrences, 1);
  assert.deepEqual(ledger.linkGate.redirectLinks.map(link => [link.target, link.kind]), [["/old", "configured-redirect"]]);
  assert.equal(qualityFailed(ledger), true);
});

test("without the Pages manifest the same stage keeps reading routes-manifest.json (the old blind spot is visible)", t => {
  const { root, buildDir } = pagesStage(t, { pagesRedirects: null, routesRedirects: TRAILING_SLASH_ONLY, indexLinks: '<a href="/old">legacy</a>' });
  const ledger = buildLedger({ root, buildDir });
  assert.equal(ledger.counts.redirectLinkOccurrences, 0);
  assert.equal(redirectRulesFor(buildDir, { redirects: TRAILING_SLASH_ONLY }).length, 1);
});

test("a percent-encoded Korean redirect source matches a raw Korean href", t => {
  const { root, buildDir } = pagesStage(t, { pagesRedirects: [OLD_RULE, KOREAN_RULE], routesRedirects: TRAILING_SLASH_ONLY, indexLinks: '<a href="/guides/one-home-prop-tax-12억-2026">korean</a>' });
  const ledger = buildLedger({ root, buildDir });
  assert.deepEqual(ledger.linkGate.redirectLinks.map(link => [link.target, link.kind]), [["/guides/one-home-prop-tax-12억-2026", "configured-redirect"]]);
  assert.equal(qualityFailed(ledger), true);
});

test("percent-encoded sources from routes-manifest.json (non-Pages builds) also match decoded targets", () => {
  const rules = redirectRulesFor(path.join(os.tmpdir(), "no-such-build-dir", ".next"), { redirects: [{ source: KOREAN_RULE.source, destination: "/guides/x", statusCode: 308, regex: "^/guides/one-home-prop-tax-12%EC%96%B5-2026(?:/)?$" }] });
  const context = { origin, htmlPaths: new Set(), sitemapPaths: new Set(), handlers: new Set(), publicFiles: new Set(), dynamic: [], redirects: rules };
  assert.equal(classifyLink("/guides/one-home-prop-tax-12억-2026", "/", context).kind, "configured-redirect");
  assert.equal(classifyLink("/guides/one-home-prop-tax-12%EC%96%B5-2026", "/", context).kind, "configured-redirect");
  assert.equal(classifyLink("/guides/other", "/", context).kind, "unresolved-page");
});
