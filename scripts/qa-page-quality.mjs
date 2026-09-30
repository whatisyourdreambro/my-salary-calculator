/**
 * Offline URL quality ledger. No network, credentials, analytics, or private reports.
 * Run after next build: node scripts/qa-page-quality.mjs
 * Tests: node --test scripts/__tests__/qa-page-quality.test.mjs
 * This checks generated structure, never content accuracy or actual search indexing.
 *
 * 2026-09-30 WP-01 LT-07 (link gate, extends this script instead of a new verify-links):
 *  - exit 1 when a followed link on an indexable page points at a next.config redirect (incl. a generated page that a redirect
 *    rule shadows) or at a /salary amount the middleware 308-snaps (baseline 0);
 *  - exit 1 when a followed link on an indexable page points at a noindex page outside NOINDEX_LINK_ALLOW(_PREFIX);
 *  - weak pages (sitemap pages with <= 2 distinct content links, seasonal-links module excluded, R4 release-holdback guides
 *    allowlisted) go to .artifacts/page-quality/weak.json; only the difference to the committed baseline
 *    (scripts/qa-page-quality-weak-baseline.json) is printed, never a failure. Edge qna/glossary stay inventory-only.
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
    // Nearest data-msy-module ancestor (or the tag itself): lets the weak-page report ignore rotating modules such as seasonal-links.
    const msyModule = attrs["data-msy-module"] || (stack.length ? stack[stack.length - 1].module : "");
    if (name === "a" && attrs.href !== undefined) result.links.push({ href: attrs.href, rel: attrs.rel ?? "", inContent: !!mainDepth && !skippedDepth && !skip, module: msyModule });
    if (mainDepth && !skippedDepth && !skip) {
      const keys = { input: "inputs", button: "buttons", table: "tables", tr: "rows" };
      if (keys[name]) result.content[keys[name]]++;
    }
    if (!VOID.has(name)) {
      stack.push({ tag: name, skip, module: msyModule });
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

// ── Link gate (2026-09-30 WP-01 LT-07) ────────────────────────────────────────────────────────────
// Mirrors src/lib/salaryRedirect.ts (SALARY_PATH + parseSalaryPathAmount; the node test guards drift): the middleware
// 308-snaps /salary/<amount> that is not a generated page (off-grid amount, legacy N-manwon / N-eok / N-5-eok forms).
const SALARY_PATH = /^\/salary\/([^/]+)$/;
export function middlewareSalaryAmount(segment) {
  let m;
  if ((m = segment.match(/^(\d{1,10})$/))) return Number(m[1]);
  if ((m = segment.match(/^(\d{1,6})-manwon$/))) return Number(m[1]) * 10_000;
  if ((m = segment.match(/^(\d{1,3})-5-eok$/))) return Number(m[1]) * 100_000_000 + 50_000_000;
  if ((m = segment.match(/^(\d{1,3})-eok$/))) return Number(m[1]) * 100_000_000;
  return null;
}
/** True when the middleware would answer 308 for this pathname (a /salary/* amount with no generated HTML). */
export function isMiddlewareSalaryRedirect(target, htmlPaths) {
  const m = SALARY_PATH.exec(target);
  if (!m || htmlPaths.has(target)) return false;
  const amount = middlewareSalaryAmount(m[1]);
  return amount !== null && Number.isFinite(amount) && amount > 0;
}
/** Intentional noindex utility pages that indexable pages may link to (header/footer/tools). Anything else fails qa:quality. */
export const NOINDEX_LINK_ALLOW = ["/dashboard", "/report", "/contact", "/en/contact", "/en/dashboard"];
export const NOINDEX_LINK_ALLOW_PREFIX = ["/company/compare"];
export const isNoindexLinkAllowed = (target) => NOINDEX_LINK_ALLOW.includes(target) || NOINDEX_LINK_ALLOW_PREFIX.some(p => target === p || target.startsWith(p + "/"));
/** Weak page = sitemap page with at most this many distinct indexable pages linking to it from <main> content (seasonal-links excluded). */
export const WEAK_MAX_INCOMING = 2;
export const SEASONAL_MODULE = "seasonal-links";

/** R4 release-holdback guide slugs (src/lib/guideReleaseHoldback.ts, lands 10/19) are expected to have no list links until released. */
export function readHeldBackGuidePaths(root) {
  let source;
  try { source = fs.readFileSync(path.join(root, "src/lib/guideReleaseHoldback.ts"), "utf8"); } catch { return []; }
  const body = source.match(/RELEASE_HOLDBACK_SLUGS[^=]*=\s*new Set\(\[([\s\S]*?)\]\)/)?.[1] ?? "";
  return [...body.replace(/\/\/.*$/gm, "").matchAll(/["']([^"']+)["']/g)].map(match => `/guides/${match[1]}`);
}

/** Report family for weak pages (URL shape only). */
export function pageFamily(pathname) {
  if (pathname === "/") return "home";
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "en") return "en";
  if (parts[0] === "salary-db") {
    if (parts[1] === "listed") return parts[2] === "industry" ? "listed-industry" : parts.length === 3 ? "listed" : "salary-db-other";
    if (parts[1] === "compare") return "compare";
    return parts.length === 2 ? "company" : "salary-db-other";
  }
  if (parts[0] === "guides" && parts[1] === "category") return "guides-category";
  if (parts[0] === "salary") return "salary-amount";
  if (parts[0] === "monthly") return "monthly-amount";
  return parts.length === 1 ? "single" : parts[0];
}

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
  if (isMiddlewareSalaryRedirect(target, context.htmlPaths)) return { ...base, kind: "middleware-salary-redirect" };
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
  const incomingContentExSeasonal = new Map(records.map(record => [record.path, new Set()]));
  const redirectLinks = new Map();
  const noindexLinks = new Map();
  const bump = (map, item) => {
    const key = JSON.stringify(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  };
  for (const link of allLinks) {
    const classified = classifyLink(link.href, link.source, context);
    const source = byPath.get(link.source);
    const nofollow = /\bnofollow\b/i.test(link.rel);
    const key = JSON.stringify({ ...classified, inContent: link.inContent, nofollow });
    source._linkCounts ??= new Map();
    source._linkCounts.set(key, (source._linkCounts.get(key) ?? 0) + 1);
    if (source.classification === "indexable-candidate" && classified.target && incoming.has(classified.target)) {
      incoming.get(classified.target).add(source.path);
      if (link.inContent && !nofollow) incomingContent.get(classified.target).add(source.path);
      if (link.inContent && !nofollow && link.module !== SEASONAL_MODULE && classified.target !== source.path) incomingContentExSeasonal.get(classified.target).add(source.path);
    }
    // LT-07 gate: followed links on indexable pages must not land on a 308 (next.config redirect, including a generated page that a
    // redirect rule shadows, or the /salary grid snap) nor on a noindex page outside the utility allowlist.
    if (source.classification === "indexable-candidate" && !nofollow && classified.target) {
      const target = byPath.get(classified.target);
      const redirectKind = ["configured-redirect", "middleware-salary-redirect"].includes(classified.kind) ? classified.kind : target?.classification === "redirect" ? "configured-redirect" : null;
      if (redirectKind) bump(redirectLinks, { source: source.path, target: classified.target, kind: redirectKind });
      if (target?.classification === "noindex" && !isNoindexLinkAllowed(classified.target)) bump(noindexLinks, { source: source.path, target: classified.target });
    }
  }
  const linkKinds = {};
  for (const record of records) {
    record.links = [...(record._linkCounts ?? [])].map(([key, occurrences]) => ({ ...JSON.parse(key), occurrences }));
    delete record._linkCounts;
    for (const link of record.links) linkKinds[link.kind] = (linkKinds[link.kind] ?? 0) + link.occurrences;
    record.incomingGeneratedPages = incoming.get(record.path).size;
    record.incomingContentPages = incomingContent.get(record.path).size;
    record.incomingContentPagesExSeasonal = incomingContentExSeasonal.get(record.path).size;
  }
  const listed = (map) => [...map].map(([key, occurrences]) => ({ ...JSON.parse(key), occurrences })).sort((a, b) => a.target.localeCompare(b.target) || a.source.localeCompare(b.source));
  const linkGate = { redirectLinks: listed(redirectLinks), noindexLinks: listed(noindexLinks), noindexAllow: [...NOINDEX_LINK_ALLOW, ...NOINDEX_LINK_ALLOW_PREFIX.map(p => p + "*")] };
  const heldBack = new Set(readHeldBackGuidePaths(root));
  const weakCandidates = records.filter(record => record.inSitemap && record.artifact && record.classification === "indexable-candidate" && record.incomingContentPagesExSeasonal <= WEAK_MAX_INCOMING);
  const weakFamilies = {};
  for (const record of weakCandidates.filter(item => !heldBack.has(item.path))) (weakFamilies[pageFamily(record.path)] ??= []).push({ path: record.path, incoming: record.incomingContentPagesExSeasonal });
  const weak = {
    threshold: WEAK_MAX_INCOMING,
    metric: "distinct indexable pages linking from <main>/<article> content (nofollow, seasonal-links module and self links excluded)",
    total: weakCandidates.length - weakCandidates.filter(item => heldBack.has(item.path)).length,
    families: Object.fromEntries(Object.entries(weakFamilies).sort(([a], [b]) => a.localeCompare(b)).map(([family, items]) => [family, items.sort((a, b) => a.path.localeCompare(b.path))])),
    heldBack: weakCandidates.filter(item => heldBack.has(item.path)).map(item => ({ path: item.path, incoming: item.incomingContentPagesExSeasonal })),
    inventoryOnlySitemapPaths: records.filter(record => record.inSitemap && !record.artifact).length,
  };
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
  return { schemaVersion: 1, generatedAt: new Date().toISOString(), origin, build: { id: fs.readFileSync(path.join(buildDir, "BUILD_ID"), "utf8").trim(), prerenderManifestMtime: fs.statSync(path.join(buildDir, "prerender-manifest.json")).mtime.toISOString(), manifestHash: hash(fs.readFileSync(path.join(buildDir, "prerender-manifest.json"))), sourceCommitVerified: false }, scope: { networkRequests: 0, contentReviewed: 0, generatedHtmlMachineChecked: true, runtimeResponsesChecked: false, limitations: ["Sitemap runtime entries are inventoried, not response-checked.", "HTML metadata and link checks do not prove Google indexing or factual accuracy.", "Dynamic pattern matches do not prove every data slug exists.", "Content length and duplicate headings are review flags, never automatic noindex recommendations.", "CSS visibility, hydration, CDN headers and input interactions are not reproduced.", "The ledger covers the build artifacts; current source may have changed since that build."] }, counts: { generatedHtml: files.length, uniquePagePaths: records.length, sitemapEntries: sitemap.length, sitemapUniquePaths: sitemapPaths.size, sitemapDuplicatePaths: sitemap.length - sitemapPaths.size, sitemapQueryEntries: sitemap.filter(item => item.hasQuery).length, prerenderManifestRoutes: Object.keys(prerender.routes ?? {}).length, declaredRuntimeEntries: records.filter(record => record.classification === "declared-runtime-unchecked").length, classification: tally("classification"), machineStatus: tally("machineStatus"), issuePages: issueRecords.length, unresolvedLinkOccurrences: unresolvedLinks.reduce((sum, link) => sum + link.occurrences, 0), redirectLinkOccurrences: linkGate.redirectLinks.reduce((sum, link) => sum + link.occurrences, 0), noindexLinkOccurrences: linkGate.noindexLinks.reduce((sum, link) => sum + link.occurrences, 0), weakPages: weak.total }, linkKinds, duplicates, shortContentReview, unresolvedLinks, linkGate, weak, records: records.sort((a, b) => a.path.localeCompare(b.path)) };
}

// ── Weak-page baseline (report only) ──────────────────────────────────────────────────────────────
export const WEAK_BASELINE_FILE = "scripts/qa-page-quality-weak-baseline.json";

export function weakBaselineFromLedger(ledger, source) {
  return { note: "qa:quality weak-page baseline (report only; diff printed after next build). Regenerate: node scripts/qa-page-quality.mjs --update-weak-baseline", source, threshold: ledger.weak.threshold, metric: ledger.weak.metric, total: ledger.weak.total, families: Object.fromEntries(Object.entries(ledger.weak.families).map(([family, items]) => [family, items.map(item => item.path)])) };
}

/** Difference between the current weak list and the committed baseline (paths only). */
export function weakDiff(weak, baseline) {
  const now = new Map(Object.entries(weak.families).flatMap(([family, items]) => items.map(item => [item.path, { family, incoming: item.incoming }])));
  const before = new Map(Object.entries(baseline?.families ?? {}).flatMap(([family, paths]) => paths.map(p => [p, family])));
  const added = [...now].filter(([p]) => !before.has(p)).map(([p, v]) => ({ path: p, ...v }));
  const resolved = [...before].filter(([p]) => !now.has(p)).map(([p, family]) => ({ path: p, family }));
  const families = [...new Set([...Object.keys(weak.families), ...Object.keys(baseline?.families ?? {})])].sort();
  const byFamily = Object.fromEntries(families.map(family => [family, { baseline: baseline?.families?.[family]?.length ?? 0, now: weak.families[family]?.length ?? 0 }]));
  return { baselineTotal: before.size, total: now.size, added, resolved, byFamily };
}

export function weakDiffLines(diff, limit = 30) {
  const changed = Object.entries(diff.byFamily).filter(([, v]) => v.baseline !== v.now).map(([family, v]) => `${family} ${v.baseline}→${v.now}`);
  const lines = [`[qa:quality] weak pages (<=${WEAK_MAX_INCOMING} content links, report only): ${diff.total} (baseline ${diff.baselineTotal}) · +${diff.added.length} new · -${diff.resolved.length} resolved${changed.length ? ` · ${changed.join(" · ")}` : ""}`];
  for (const item of diff.added.slice(0, limit)) lines.push(`  + ${item.path} (${item.family}, ${item.incoming})`);
  if (diff.added.length > limit) lines.push(`  + … ${diff.added.length - limit} more (see .artifacts/page-quality/weak.json)`);
  for (const item of diff.resolved.slice(0, limit)) lines.push(`  - ${item.path} (${item.family})`);
  if (diff.resolved.length > limit) lines.push(`  - … ${diff.resolved.length - limit} more`);
  return lines;
}

export function linkGateLines(ledger, limit = 20) {
  const { redirectLinkOccurrences, noindexLinkOccurrences } = ledger.counts;
  const lines = [`[qa:quality] link gate: ${redirectLinkOccurrences} followed links to a 308 (next.config redirect or /salary snap), ${noindexLinkOccurrences} to a noindex page outside ${ledger.linkGate.noindexAllow.join(" ")}.`];
  for (const link of ledger.linkGate.redirectLinks.slice(0, limit)) lines.push(`  308 ${link.kind}: ${link.source} -> ${link.target} (x${link.occurrences})`);
  for (const link of ledger.linkGate.noindexLinks.slice(0, limit)) lines.push(`  noindex: ${link.source} -> ${link.target} (x${link.occurrences})`);
  return lines;
}

/** qa:quality exit status: structural issues, unresolved links, sitemap hygiene and the LT-07 link gate. Weak pages never fail. */
export function qualityFailed(ledger) {
  const c = ledger.counts;
  return !!(c.issuePages || c.unresolvedLinkOccurrences || c.sitemapDuplicatePaths || c.sitemapQueryEntries || c.redirectLinkOccurrences || c.noindexLinkOccurrences);
}

export function summaryMarkdown(ledger) {
  const { counts } = ledger;
  return `# Offline page quality ledger\n\nGenerated: ${ledger.generatedAt}\nBuild: ${ledger.build.id}\n\n| Coverage | Count |\n|---|---:|\n| Generated HTML checked | ${counts.generatedHtml} |\n| Unique paths in ledger | ${counts.uniquePagePaths} |\n| Sitemap URL entries / unique paths | ${counts.sitemapEntries} / ${counts.sitemapUniquePaths} |\n| Runtime URLs inventoried, response unchecked | ${counts.declaredRuntimeEntries} |\n| Pages with structural issues | ${counts.issuePages} |\n| Unresolved internal link occurrences | ${counts.unresolvedLinkOccurrences} |\n| Followed links to a 308 (gate) | ${counts.redirectLinkOccurrences} |\n| Followed links to noindex outside the allowlist (gate) | ${counts.noindexLinkOccurrences} |\n| Weak sitemap pages, report only (weak.json) | ${counts.weakPages} |\n| Pages factually reviewed | 0 |\n\n## Machine status\n\n${Object.entries(counts.machineStatus).map(([key, value]) => `- ${key}: ${value}`).join("\n")}\n\n## Page classification\n\n${Object.entries(counts.classification).map(([key, value]) => `- ${key}: ${value}`).join("\n")}\n\n## Interpretation\n\nEvery record has a separate machine status and contentReview=not-reviewed. A declared Edge URL is not an HTTP PASS. Missing sitemap inclusion, a short body, or a duplicate H1 is not by itself a defect. Known route handlers and actual public assets are classified separately from pages. No request was made to a website.\n\n${ledger.scope.limitations.map(line => `- ${line}`).join("\n")}\n\nSee ledger.json for every URL, issues, canonical/robots/headings/description/JSON-LD, and classified links.\n`;
}

export function runQuality({ root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), buildDir, outputDir = path.join(root, ".artifacts/page-quality"), weakBaselineFile = path.join(root, WEAK_BASELINE_FILE) } = {}) {
  const ledger = buildLedger({ root, buildDir });
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "ledger.json"), JSON.stringify(ledger, null, 2) + "\n");
  fs.writeFileSync(path.join(outputDir, "summary.md"), summaryMarkdown(ledger));
  const baseline = readJson(weakBaselineFile, null);
  ledger.weakDiff = baseline ? weakDiff(ledger.weak, baseline) : null;
  fs.writeFileSync(path.join(outputDir, "weak.json"), JSON.stringify({ generatedAt: ledger.generatedAt, build: ledger.build.id, ...ledger.weak, baselineFile: baseline ? path.relative(root, weakBaselineFile).split(path.sep).join("/") : null, diff: ledger.weakDiff }, null, 2) + "\n");
  return ledger;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const updateBaseline = args.length === 1 && args[0] === "--update-weak-baseline";
    if (args.length && !updateBaseline) throw new Error("Usage: node scripts/qa-page-quality.mjs [--update-weak-baseline] (reads .next; no network)");
    const ledger = runQuality();
    console.log(`[qa:quality] ${ledger.counts.generatedHtml} HTML checked; ${ledger.counts.declaredRuntimeEntries} runtime URLs inventoried only; ${ledger.counts.issuePages} structural issue pages; ${ledger.counts.unresolvedLinkOccurrences} unresolved link occurrences. Output: .artifacts/page-quality`);
    for (const line of linkGateLines(ledger)) console.log(line);
    if (ledger.weakDiff) for (const line of weakDiffLines(ledger.weakDiff)) console.log(line);
    else console.log(`[qa:quality] weak pages (<=${WEAK_MAX_INCOMING} content links, report only): ${ledger.weak.total} — no committed baseline (${WEAK_BASELINE_FILE}).`);
    if (updateBaseline) {
      const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
      fs.writeFileSync(path.join(root, WEAK_BASELINE_FILE), JSON.stringify(weakBaselineFromLedger(ledger, `next build ${ledger.build.id}`), null, 2) + "\n");
      console.log(`[qa:quality] wrote ${WEAK_BASELINE_FILE} (${ledger.weak.total} weak pages)`);
    }
    if (qualityFailed(ledger)) process.exitCode = 1;
  } catch (error) {
    console.error(`[qa:quality] ${error.message}`);
    process.exitCode = 1;
  }
}
