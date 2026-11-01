import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Editorial dates use Korea's calendar. A date-only label is represented by
// midnight +09:00, never by a future UTC midnight during a Korean morning.
export function koreanDay(value) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) throw new Error('Invalid content date');
  return new Date(time + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// Preserve the semantic distinction: date-only strings are editorial calendar
// days; Date objects and timestamp strings are instants (including UTC midnight).
export function isFutureSitemapDate(value, now = Date.now()) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return true;
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? date.toISOString().slice(0, 10) !== value || value > koreanDay(now)
    : date.getTime() > now;
}

// Inspect only page-revision fields. Dataset dateModified and market snapshot
// dates describe the data itself and must not follow a navigation/content edit.
export function pageRevisionFields(source, filename = 'page.tsx') {
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const constants = new Map();
  function collect(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) constants.set(node.name.text, node.initializer);
    ts.forEachChild(node, collect);
  }
  collect(ast);
  function literal(node, seen = new Set()) {
    if (!node) return null;
    if (ts.isStringLiteralLike(node)) return node.text;
    if (ts.isIdentifier(node) && !seen.has(node.text)) return literal(constants.get(node.text), new Set([...seen, node.text]));
    if (ts.isTemplateExpression(node)) {
      let value = node.head.text;
      for (const span of node.templateSpans) {
        const part = literal(span.expression, seen);
        if (part === null) return null;
        value += part + span.literal.text;
      }
      return value;
    }
    return null;
  }
  const fields = [];
  function visit(node) {
    if (ts.isPropertyAssignment(node)) {
      const name = ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) ? node.name.text : '';
      if (['modifiedTime', 'modifiedDate'].includes(name)) fields.push({ name, value: literal(node.initializer) });
    }
    if (ts.isJsxAttribute(node) && node.name.getText(ast) === 'updatedDate') {
      const expression = node.initializer && ts.isJsxExpression(node.initializer) ? node.initializer.expression : node.initializer;
      fields.push({ name: 'updatedDate', value: literal(expression) });
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return fields;
}

// Page-level app JSON-LD dates: softwareApplicationLd/webApplicationLd dateModified, also as a sibling of a
// spread call ({ ...softwareApplicationLd({...}), dateModified: X }). Unlike Dataset dateModified (the data
// date) they describe the page, so they follow the sitemap lastmod. G3 (2026-11-01): a call to
// staticRouteLastModified(route) is the single source; `route` is its resolved argument. Otherwise `value` is
// the resolved string literal, or null when the expression cannot be judged statically (e.g. an imported constant).
const APP_LD_BUILDERS = new Set(['softwareApplicationLd', 'webApplicationLd']);
export function appLdDateFields(source, filename = 'page.tsx') {
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const constants = new Map();
  function collect(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) constants.set(node.name.text, node.initializer);
    ts.forEachChild(node, collect);
  }
  collect(ast);
  function literal(node, seen = new Set()) {
    if (!node) return null;
    if (ts.isStringLiteralLike(node)) return node.text;
    if (ts.isIdentifier(node) && !seen.has(node.text)) return literal(constants.get(node.text), new Set([...seen, node.text]));
    return null;
  }
  const builderCall = (node) => node && ts.isCallExpression(node) && ts.isIdentifier(node.expression) && APP_LD_BUILDERS.has(node.expression.text)
    ? node.expression.text : null;
  const fields = [];
  function field(builder, property) {
    const init = property.initializer;
    if (ts.isCallExpression(init) && ts.isIdentifier(init.expression) && init.expression.text === 'staticRouteLastModified') {
      fields.push({ builder, route: literal(init.arguments[0]), value: null });
    } else {
      fields.push({ builder, route: null, value: literal(init) });
    }
  }
  const dateProperty = (object) => object.properties.find((p) => ts.isPropertyAssignment(p) &&
    (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === 'dateModified');
  function visit(node) {
    const builder = builderCall(node);
    if (builder && node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0])) {
      const property = dateProperty(node.arguments[0]);
      if (property) field(builder, property);
    }
    if (ts.isObjectLiteralExpression(node)) {
      const spread = node.properties.find((p) => ts.isSpreadAssignment(p) && builderCall(p.expression));
      const property = spread && dateProperty(node);
      if (property) field(builderCall(spread.expression), property);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return fields;
}

// A link-only review may move the sitemap lastmod while the visible revision date stays
// at the last substantive revision (about-page date policy). Such an exception is valid
// only while the sitemap still carries that link-review day, and the visible date may
// never be later than the sitemap date. Returns the Korean day every page revision field
// must show (null when it cannot be determined) and the issues of the exception itself.
export function expectedPageRevisionDay({ sitemapLastModified, visibleDay, linkReviewDay }) {
  const sitemapDay = sitemapLastModified ? koreanDay(sitemapLastModified) : null;
  if (visibleDay === undefined) return { day: sitemapDay, issues: [] };
  const issues = [];
  const midnight = `${visibleDay}T00:00:00+09:00`;
  const valid = typeof visibleDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(visibleDay) &&
    Number.isFinite(Date.parse(midnight)) && koreanDay(midnight) === visibleDay;
  if (!valid) issues.push('invalid visible revision date');
  else if (!sitemapDay || visibleDay > sitemapDay) issues.push('visible revision date is later than the sitemap date');
  if (!sitemapDay || sitemapDay !== linkReviewDay) {
    issues.push('visible-date exception applies only while the sitemap keeps the link-review date (re-review the page date)');
  }
  return { day: valid ? visibleDay : null, issues };
}

function safeSource(relative) {
  if (!/^src\/[\w./[\]-]+\.(?:tsx?|mjs|cjs|json)$/.test(relative) || relative.split('/').includes('..')) {
    throw new Error('Invalid review source path');
  }
  return relative;
}

// Route-owned files only: / must not inherit the history of every page, nor
// /calc that of every calculator. Shared data/engines are explicit dependencies.
export function routeContentSources(root, route, dependencies = []) {
  if (!/^\/(?:[a-zA-Z0-9_\-[\]]+(?:\/[a-zA-Z0-9_\-[\]]+)*)?$/.test(route)) {
    throw new Error('Invalid review route');
  }
  const relative = `src/app${route === '/' ? '' : route}`;
  const files = [];
  function walk(directory) {
    if (!existsSync(path.join(root, directory))) return;
    for (const entry of readdirSync(path.join(root, directory), { withFileTypes: true })) {
      const child = `${directory}/${entry.name}`;
      if (entry.isSymbolicLink()) throw new Error('Review sources cannot be symlinks');
      if (entry.isDirectory()) {
        if (entry.name.startsWith('_') || entry.name.startsWith('[') || entry.name.startsWith('(') || entry.name === 'api') continue;
        if (['page.tsx', 'page.ts', 'route.ts'].some((name) => existsSync(path.join(root, child, name)))) continue;
        // Root app files are shared infrastructure; only the home entry is owned.
        if (route !== '/') walk(child);
      } else if (/\.(?:tsx?|mjs|cjs|json)$/.test(entry.name) && !/\.(?:test|spec)\./.test(entry.name)) {
        if (route !== '/' || ['page.tsx', 'page.ts', 'HomeClient.tsx'].includes(entry.name)) files.push(child);
      }
    }
  }
  walk(relative);
  return [...new Set([...files, ...dependencies.map(safeSource)])].sort();
}

// Normalize only checkout line endings, not whitespace, comments or code: a new
// edit must be reviewed again even if its commit title claims to be technical.
export function contentSnapshot(root, route, dependencies = []) {
  const files = routeContentSources(root, route, dependencies);
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(file).update('\0');
    hash.update(readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n')).update('\0');
  }
  return { files, sha256: hash.digest('hex') };
}

export function assessContentReview({ root, route, review, actualLastModified, now = Date.now() }) {
  const issues = [];
  if (!review || !/^\d{4}-\d{2}-\d{2}$/.test(review.contentDate ?? '') ||
      !/^[a-f0-9]{40}$/.test(review.reviewedAtCommit ?? '') ||
      typeof review.reason !== 'string' || review.reason.trim().length < 20 ||
      !Array.isArray(review.dependencies) || !Array.isArray(review.files) ||
      !/^[a-f0-9]{64}$/.test(review.sha256 ?? '')) return ['missing or invalid explicit content review'];
  const expected = new Date(`${review.contentDate}T00:00:00+09:00`);
  if (!Number.isFinite(expected.getTime()) || koreanDay(expected) !== review.contentDate || expected.getTime() > now) {
    issues.push('invalid or future reviewed content date');
  }
  try {
    const snapshot = contentSnapshot(root, route, review.dependencies);
    if (!snapshot.files.length || JSON.stringify(snapshot.files) !== JSON.stringify(review.files) || snapshot.sha256 !== review.sha256) {
      issues.push('source changed since content review (review the diff; do not automatically advance the date)');
    }
  } catch { issues.push('review source is missing or unsafe'); }
  const actual = new Date(actualLastModified ?? NaN);
  if (!Number.isFinite(actual.getTime())) issues.push('actual sitemap date is missing or invalid');
  else {
    if (koreanDay(actual) !== review.contentDate) issues.push('actual sitemap date differs from reviewed content date');
    if (actual.getTime() > now) issues.push('actual sitemap date is in the future');
  }
  return issues;
}
