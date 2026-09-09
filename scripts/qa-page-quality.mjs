/**
 * Offline URL quality ledger. No network, credentials, analytics, or private reports.
 * Run after next build: node scripts/qa-page-quality.mjs
 * Tests: node --test scripts/__tests__/qa-page-quality.test.mjs
 * This checks generated structure, never content accuracy or actual search indexing.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const ASSET = /\.(?:png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|css|js|map|pdf|xml|txt|json|csv|webmanifest)$/i;
const norm = (value) => value.replace(/\s+/g, " ").trim();
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");

export function decodeEntities(value) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (whole, entity) => {
    if (!entity.startsWith("#")) return named[entity.toLowerCase()] ?? whole;
    const cp = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : whole;
  });
}

function attributes(tag) {
  const attrs = {};
  for (const match of tag.replace(/^<\/?[\w:-]+/, "").matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attrs[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attrs;
}

export function normalizePath(value) {
  // Keep reserved delimiters encoded; malformed encodings stay auditable, not fatal.
  let decoded;
  try { decoded = decodeURI(value); } catch { decoded = value; }
  return decoded.replace(/\/+$/, "") || "/";
}

export function parseSitemap(xml) {
  return [...xml.matchAll(/<(?:[\w-]+:)?url\b[^>]*>([\s\S]*?)<\/(?:[\w-]+:)?url>/gi)].flatMap((match) => {
    const location = match[1].match(/<(?:[\w-]+:)?loc\b[^>]*>([\s\S]*?)<\/(?:[\w-]+:)?loc>/i)?.[1];
    if (!location) return [];
    const url = new URL(decodeEntities(location.trim()));
    return [{ url: url.href, path: normalizePath(url.pathname), lastModified: match[1].match(/<(?:[\w-]+:)?lastmod\b[^>]*>([^<]+)</i)?.[1] ?? null, hasQuery: !!url.search }];
  });
}

export function analyzeHtml(raw) {
  const result = { titles: [], descriptions: [], h1: [], canonical: [], robots: [], links: [], jsonLd: { documents: 0, types: [], errors: 0 }, content: { mainPresent: false, characters: 0, hash: "", inputs: 0, buttons: 0, tables: 0, rows: 0 } };
  // Raw script text is not HTML or visible content, including serialized RSC strings.
  const html = raw.replace(/<!--[^]*?-->/g, "").replace(/<(script|style|noscript)\b(?:"[^"]*"|'[^']*'|[^'">])*?>[\s\S]*?<\/\1\s*>/gi, (tag) => {
    const opening = tag.match(/^<\w+\b(?:"[^"]*"|'[^']*'|[^'">])*?>/)?.[0] ?? "";
    if (/^<script\b/i.test(tag) && attributes(opening).type?.toLowerCase() === "application/ld+json") {
      result.jsonLd.documents++;
      try {
        const data = JSON.parse(tag.slice(opening.length).replace(/<\/script\s*>$/i, ""));
        const collect = (item) => {
          if (!item || typeof item !== "object") return;
          if (Array.isArray(item)) { item.forEach(collect); return; }
          if (item["@type"]) result.jsonLd.types.push(...[item["@type"]].flat());
          if (item["@graph"]) collect(item["@graph"]);
        };
        collect(data);
      } catch { result.jsonLd.errors++; }
    }
    return "";
  });
  const stack = [];
  const bodyText = [];
  const mainText = [];
  let headDepth = 0, bodyDepth = 0, mainDepth = 0, skippedDepth = 0;
  let currentTitle = null, currentH1 = null;
  const close = (tag) => {
    let at = stack.length - 1;
    while (at >= 0 && stack[at].tag !== tag) at--;
    if (at < 0) return;
    for (const frame of stack.splice(at)) {
      if (frame.tag === "head") headDepth--;
      if (frame.tag === "body") bodyDepth--;
      if (frame.tag === "main" || frame.tag === "article") mainDepth--;
      if (frame.skip) skippedDepth--;
      if (frame.tag === "title") currentTitle = null;
      if (frame.tag === "h1") currentH1 = null;
    }
  };
  for (const token of html.matchAll(/<\/?[a-z][\w:-]*(?:"[^"]*"|'[^']*'|[^'">])*?>|<![^>]*>|[^<]+|</gi)) {
    const text = token[0];
    if (!text.startsWith("<")) {
      const decoded = decodeEntities(text);
      if (currentTitle !== null) result.titles[currentTitle].push(decoded);
      if (currentH1 !== null) result.h1[currentH1].push(decoded);
      if (bodyDepth && !skippedDepth) {
        bodyText.push(decoded);
        if (mainDepth) mainText.push(decoded);
      }
      continue;
    }
    const name = text.match(/^<\/?([\w:-]+)/)?.[1]?.toLowerCase();
    if (!name) continue;
    if (text.startsWith("</")) { close(name); continue; }
    const attrs = attributes(text);
    if (name === "title" && headDepth) { currentTitle = result.titles.length; result.titles.push([]); }
    if (name === "h1") { currentH1 = result.h1.length; result.h1.push([]); }
    if (name === "meta") {
      if (attrs.name?.toLowerCase() === "description") result.descriptions.push(attrs.content ?? "");
      if (["robots", "googlebot"].includes(attrs.name?.toLowerCase())) result.robots.push(attrs.content ?? "");
    }
    if (name === "link" && attrs.rel?.toLowerCase().split(/\s+/).includes("canonical")) result.canonical.push(attrs.href ?? "");
    const skip = "hidden" in attrs || attrs["aria-hidden"] === "true" || /display\s*:\s*none|visibility\s*:\s*hidden/i.test(attrs.style ?? "") || ["svg", "nav", "aside", "footer"].includes(name) || (name === "header" && !mainDepth);
    if (name === "a" && attrs.href !== undefined) result.links.push({ href: attrs.href, rel: attrs.rel ?? "", inContent: !!mainDepth && !skippedDepth && !skip });
    if (mainDepth && !skippedDepth && !skip) {
      const keys = { input: "inputs", button: "buttons", table: "tables", tr: "rows" };
      if (keys[name]) result.content[keys[name]]++;
    }
    if (!VOID.has(name)) {
      stack.push({ tag: name, skip });
      if (name === "head") headDepth++;
      if (name === "body") bodyDepth++;
      if (name === "main" || name === "article") { mainDepth++; result.content.mainPresent = true; }
      if (skip) skippedDepth++;
    }
  }
  result.titles = result.titles.map(parts => norm(parts.join(" ")));
  result.h1 = result.h1.map(parts => norm(parts.join(" ")));
  result.descriptions = result.descriptions.map(norm);
  const content = norm((result.content.mainPresent ? mainText : bodyText).join(" "));
  result.content.characters = content.length;
  result.content.hash = hash(content);
  result.jsonLd.types = [...new Set(result.jsonLd.types)];
  return result;
}

function readJson(file, fallback) {
  if (!fs.existsSync(file) && fallback !== undefined) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function walk(folder, suffix) {
  if (!fs.existsSync(folder)) return [];
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(folder, entry.name), suffix) : entry.name.endsWith(suffix) ? [path.join(folder, entry.name)] : []);
}
function compiledRules(rules) {
  return rules.filter(rule => rule.regex && !rule.has?.length && !rule.missing?.length).map(rule => ({ ...rule, test: new RegExp(rule.regex) }));
}
const matching = (rules, pathname) => rules.find(rule => rule.test.test(pathname));

export function classifyLink(href, sourcePath, context) {
  if (!href || href.startsWith("#")) return { kind: "same-page-fragment" };
  let url;
  try { url = new URL(href, context.origin + sourcePath); } catch { return { kind: "invalid-url" }; }
  if (!["http:", "https:"].includes(url.protocol)) return { kind: "non-http" };
  if (url.origin !== context.origin) return { kind: "external" };
  const target = normalizePath(url.pathname);
  const base = { target, queryVariant: !!url.search, queryKeys: [...new Set([...url.searchParams.keys()])].sort(), fragment: !!url.hash };
  if (context.handlers.has(target)) return { ...base, kind: "route-handler" };
  if (target.startsWith("/_next/") || target.startsWith("/api/")) return { ...base, kind: "non-page-route" };
  // Known files resolve; an arbitrary nonexistent CSV must remain unresolved.
  if (context.publicFiles.has(target)) return { ...base, kind: "public-asset" };
  if (context.htmlPaths.has(target)) return { ...base, kind: "generated-html" };
  if (matching(context.redirects, target)) return { ...base, kind: "configured-redirect" };
  if (context.sitemapPaths.has(target)) return { ...base, kind: "sitemap-runtime-unchecked" };
  if (matching(context.dynamic, target)) return { ...base, kind: "dynamic-pattern-unchecked" };
  return { ...base, kind: ASSET.test(target) ? "unresolved-asset" : "unresolved-page" };
}

export function buildLedger({ root, buildDir = path.join(root, ".next") }) {
  const appDir = path.join(buildDir, "server/app");
  const routes = readJson(path.join(buildDir, "routes-manifest.json"));
  const prerender = readJson(path.join(buildDir, "prerender-manifest.json"));
  const appPaths = readJson(path.join(buildDir, "server/app-paths-manifest.json"));
  const edge = readJson(path.join(buildDir, "server/middleware-manifest.json"), { functions: {} });
  const sitemapFile = path.join(appDir, "sitemap.xml.body");
  const sitemap = parseSitemap(fs.readFileSync(sitemapFile, "utf8"));
  if (!sitemap.length) throw new Error("No URL entries found in built sitemap; a complete next build is required.");
  const origin = new URL(sitemap[0].url).origin;
  if (sitemap.some(item => new URL(item.url).origin !== origin)) throw new Error("Sitemap contains multiple origins.");
  const sitemapPaths = new Set(sitemap.map(item => item.path));
  const redirects = compiledRules(routes.redirects ?? []);
  const dynamic = compiledRules(routes.dynamicRoutes ?? []);
  const handlers = new Set(Object.keys(appPaths).filter(key => key.endsWith("/route")).map(key => normalizePath(key.slice(0, -6))));
  const edgePatterns = Object.values(edge.functions ?? {}).flatMap(item => (item.matchers ?? []).map(matcher => ({ page: item.page, test: new RegExp(matcher.regexp) })));
  const publicFiles = new Set(walk(path.join(root, "public"), "").map(file => normalizePath("/" + path.relative(path.join(root, "public"), file).split(path.sep).join("/"))));
  const records = [];
  const allLinks = [];
  const files = walk(appDir, ".html").sort();
  if (!files.length) throw new Error("No generated HTML found; run next build first.");
  for (const file of files) {
    const relative = path.relative(appDir, file).split(path.sep).join("/");
    const pathname = normalizePath(relative === "index.html" ? "/" : "/" + relative.slice(0, -5));
    const raw = fs.readFileSync(file, "utf8");
    const html = analyzeHtml(raw);
    const meta = readJson(file.slice(0, -5) + ".meta", {});
    const redirect = matching(redirects, pathname);
    const xRobots = Object.entries(meta.headers ?? {}).filter(([key]) => key.toLowerCase() === "x-robots-tag").flatMap(([, value]) => [value].flat());
    const noindex = [...html.robots, ...xRobots].some(value => /\bnoindex\b/i.test(value));
    let selfCanonical = false;
    if (html.canonical.length === 1) {
      try {
        const canonical = new URL(html.canonical[0]);
        selfCanonical = canonical.origin === origin && normalizePath(canonical.pathname) === pathname && !canonical.search && !canonical.hash;
      } catch { /* invalid or relative canonicals are reviewable mismatches */ }
    }
    const internal = pathname.startsWith("/_") || pathname.includes("[");
    const explicitStatus = meta.status ?? null;
    const classification = internal ? "internal" : redirect ? "redirect" : explicitStatus >= 400 ? "error-document" : noindex ? "noindex" : html.canonical.length && !selfCanonical ? "canonical-other-or-invalid" : "indexable-candidate";
    const checks = [];
    if (!["internal", "redirect", "error-document", "noindex"].includes(classification)) {
      for (const [field, code] of [["titles", "title-count-or-empty"], ["descriptions", "description-count-or-empty"], ["h1", "h1-count-or-empty"], ["canonical", "canonical-count-or-empty"]]) {
        if (html[field].length !== 1 || !html[field][0]) checks.push(code);
      }
      if (!selfCanonical) checks.push("canonical-not-self");
      if (html.jsonLd.errors) checks.push("jsonld-parse-error");
    }
    if (sitemapPaths.has(pathname) && ["noindex", "redirect", "error-document"].includes(classification)) checks.push("sitemap-excluded-document");
    allLinks.push(...html.links.map(link => ({ ...link, source: pathname })));
    const fields = { ...html };
    delete fields.links;
    records.push({ path: pathname, artifact: relative, bytes: Buffer.byteLength(raw), inSitemap: sitemapPaths.has(pathname), classification, machineStatus: checks.length ? "checked-issues" : "checked", contentReview: "not-reviewed", ...fields, canonicalSelf: selfCanonical, response: { artifactStatus: explicitStatus, configuredRedirectStatus: redirect?.statusCode ?? null, productionHttpStatus: null, runtimeVerified: false }, robotsHeaderFromArtifact: xRobots, redirect: redirect ? { source: redirect.source, destination: redirect.destination } : null, issues: checks, links: [] });
  }
  const htmlPaths = new Set(records.map(record => record.path));
  const context = { origin, htmlPaths, sitemapPaths, handlers, publicFiles, dynamic, redirects };
  for (const pathname of sitemapPaths) {
    if (htmlPaths.has(pathname)) continue;
    const edgeMatch = edgePatterns.find(item => item.test.test(pathname));
    const dynamicMatch = matching(dynamic, pathname);
    const redirect = matching(redirects, pathname);
    const handler = handlers.has(pathname);
    records.push({ path: pathname, inSitemap: true, artifact: null, classification: handler ? "sitemap-non-page-handler" : redirect ? "sitemap-redirect-unchecked" : "declared-runtime-unchecked", runtime: edgeMatch ? "edge" : dynamicMatch ? "dynamic" : "unknown", routePattern: edgeMatch?.page ?? dynamicMatch?.page ?? null, machineStatus: "inventory-only", contentReview: "not-reviewed", titles: null, descriptions: null, h1: null, canonical: null, canonicalSelf: null, robots: null, robotsHeaderFromArtifact: null, jsonLd: null, content: null, response: { artifactStatus: null, productionHttpStatus: null, runtimeVerified: false }, issues: handler ? ["sitemap-non-page-handler"] : redirect ? ["sitemap-redirect"] : !edgeMatch && !dynamicMatch ? ["sitemap-route-unresolved"] : [], links: [] });
  }
  const byPath = new Map(records.map(record => [record.path, record]));
  const incoming = new Map(records.map(record => [record.path, new Set()]));
  const incomingContent = new Map(records.map(record => [record.path, new Set()]));
  for (const link of allLinks) {
    const classified = classifyLink(link.href, link.source, context);
    const source = byPath.get(link.source);
    const key = JSON.stringify({ ...classified, inContent: link.inContent, nofollow: /\bnofollow\b/i.test(link.rel) });
    source._linkCounts ??= new Map();
    source._linkCounts.set(key, (source._linkCounts.get(key) ?? 0) + 1);
    if (source.classification === "indexable-candidate" && classified.target && incoming.has(classified.target)) {
      incoming.get(classified.target).add(source.path);
      if (link.inContent && !/\bnofollow\b/i.test(link.rel)) incomingContent.get(classified.target).add(source.path);
    }
  }
  const linkKinds = {};
  for (const record of records) {
    record.links = [...(record._linkCounts ?? [])].map(([key, occurrences]) => ({ ...JSON.parse(key), occurrences }));
    delete record._linkCounts;
    for (const link of record.links) linkKinds[link.kind] = (linkKinds[link.kind] ?? 0) + link.occurrences;
    record.incomingGeneratedPages = incoming.get(record.path).size;
    record.incomingContentPages = incomingContent.get(record.path).size;
  }
  const duplicates = {};
  for (const field of ["titles", "descriptions", "h1"]) {
    const groups = new Map();
    for (const record of records.filter(item => item.classification === "indexable-candidate")) {
      const key = JSON.stringify(record[field]);
      const paths = groups.get(key) ?? []; paths.push(record.path); groups.set(key, paths);
    }
    duplicates[field] = [...groups].filter(([, paths]) => paths.length > 1).map(([value, paths]) => ({ value: JSON.parse(value), paths, status: "review-only" }));
  }
  const tally = (field) => Object.fromEntries([...new Set(records.map(record => record[field]))].sort().map(key => [key, records.filter(record => record[field] === key).length]));
  const issueRecords = records.filter(record => record.issues.length);
  const unresolvedLinks = records.flatMap(record => record.links.filter(link => ["invalid-url", "unresolved-page", "unresolved-asset"].includes(link.kind)).map(link => ({ source: record.path, ...link })));
  const shortContentReview = records.filter(record => record.classification === "indexable-candidate" && record.content.characters < 500).map(record => ({ path: record.path, ...record.content, status: "review-only-not-a-quality-or-noindex-verdict" }));
  return { schemaVersion: 1, generatedAt: new Date().toISOString(), origin, build: { id: fs.readFileSync(path.join(buildDir, "BUILD_ID"), "utf8").trim(), prerenderManifestMtime: fs.statSync(path.join(buildDir, "prerender-manifest.json")).mtime.toISOString(), manifestHash: hash(fs.readFileSync(path.join(buildDir, "prerender-manifest.json"))), sourceCommitVerified: false }, scope: { networkRequests: 0, contentReviewed: 0, generatedHtmlMachineChecked: true, runtimeResponsesChecked: false, limitations: ["Sitemap runtime entries are inventoried, not response-checked.", "HTML metadata and link checks do not prove Google indexing or factual accuracy.", "Dynamic pattern matches do not prove every data slug exists.", "Content length and duplicate headings are review flags, never automatic noindex recommendations.", "CSS visibility, hydration, CDN headers and input interactions are not reproduced.", "The ledger covers the build artifacts; current source may have changed since that build."] }, counts: { generatedHtml: files.length, uniquePagePaths: records.length, sitemapEntries: sitemap.length, sitemapUniquePaths: sitemapPaths.size, sitemapDuplicatePaths: sitemap.length - sitemapPaths.size, sitemapQueryEntries: sitemap.filter(item => item.hasQuery).length, prerenderManifestRoutes: Object.keys(prerender.routes ?? {}).length, declaredRuntimeEntries: records.filter(record => record.classification === "declared-runtime-unchecked").length, classification: tally("classification"), machineStatus: tally("machineStatus"), issuePages: issueRecords.length, unresolvedLinkOccurrences: unresolvedLinks.reduce((sum, link) => sum + link.occurrences, 0) }, linkKinds, duplicates, shortContentReview, unresolvedLinks, records: records.sort((a, b) => a.path.localeCompare(b.path)) };
}

export function summaryMarkdown(ledger) {
  const { counts } = ledger;
  return `# Offline page quality ledger\n\nGenerated: ${ledger.generatedAt}\nBuild: ${ledger.build.id}\n\n| Coverage | Count |\n|---|---:|\n| Generated HTML checked | ${counts.generatedHtml} |\n| Unique paths in ledger | ${counts.uniquePagePaths} |\n| Sitemap URL entries / unique paths | ${counts.sitemapEntries} / ${counts.sitemapUniquePaths} |\n| Runtime URLs inventoried, response unchecked | ${counts.declaredRuntimeEntries} |\n| Pages with structural issues | ${counts.issuePages} |\n| Unresolved internal link occurrences | ${counts.unresolvedLinkOccurrences} |\n| Pages factually reviewed | 0 |\n\n## Machine status\n\n${Object.entries(counts.machineStatus).map(([key, value]) => `- ${key}: ${value}`).join("\n")}\n\n## Page classification\n\n${Object.entries(counts.classification).map(([key, value]) => `- ${key}: ${value}`).join("\n")}\n\n## Interpretation\n\nEvery record has a separate machine status and contentReview=not-reviewed. A declared Edge URL is not an HTTP PASS. Missing sitemap inclusion, a short body, or a duplicate H1 is not by itself a defect. Known route handlers and actual public assets are classified separately from pages. No request was made to a website.\n\n${ledger.scope.limitations.map(line => `- ${line}`).join("\n")}\n\nSee ledger.json for every URL, issues, canonical/robots/headings/description/JSON-LD, and classified links.\n`;
}

export function runQuality({ root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), buildDir, outputDir = path.join(root, ".artifacts/page-quality") } = {}) {
  const ledger = buildLedger({ root, buildDir });
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "ledger.json"), JSON.stringify(ledger, null, 2) + "\n");
  fs.writeFileSync(path.join(outputDir, "summary.md"), summaryMarkdown(ledger));
  return ledger;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.slice(2).length) throw new Error("Usage: node scripts/qa-page-quality.mjs (reads .next; no network)");
    const ledger = runQuality();
    console.log(`[qa:quality] ${ledger.counts.generatedHtml} HTML checked; ${ledger.counts.declaredRuntimeEntries} runtime URLs inventoried only; ${ledger.counts.issuePages} structural issue pages; ${ledger.counts.unresolvedLinkOccurrences} unresolved link occurrences. Output: .artifacts/page-quality`);
    if (ledger.counts.issuePages || ledger.counts.unresolvedLinkOccurrences || ledger.counts.sitemapDuplicatePaths || ledger.counts.sitemapQueryEntries) process.exitCode = 1;
  } catch (error) {
    console.error(`[qa:quality] ${error.message}`);
    process.exitCode = 1;
  }
}
