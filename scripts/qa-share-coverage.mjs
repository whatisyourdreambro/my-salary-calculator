import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const SHARE_COMPONENTS = new Set(['ShareButtons', 'ShareSection', 'AutoShareSection', 'FloatingShareBar', 'ShareableResult', 'ResultSharePanel']);
const EXCLUDED = new Map([
  ['/en/[...missing]', 'English 404 boundary; not a public content page'],
  ['/contact', 'Private contact workflow'],
  ['/en/contact', 'Private English contact workflow'],
  ['/en/dashboard', 'English local personal dashboard'],
  ['/dashboard', 'Local personal dashboard'],
  ['/report', 'Local personal report'],
  ['/favorites', 'Local saved items'],
  ['/privacy', 'Policy document; no promotional share panel'],
  ['/terms', 'Policy document; no promotional share panel'],
]);

export function inspectShareSource(text, filename = 'page.tsx') {
  const ast = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const imports = [], markers = new Set();
  let custom = false;
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) imports.push(node.moduleSpecifier.text);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(node.arguments[0])) imports.push(node.arguments[0].text);
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const name = node.tagName.getText(ast);
      if (SHARE_COMPONENTS.has(name)) markers.add(name);
    }
    if (ts.isCallExpression(node) && /^(?:window\.)?navigator\.(?:share|clipboard\.writeText)$/.test(node.expression.getText(ast))) custom = true;
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return { imports, markers: [...markers], custom };
}

export function buildShareCoverage(root) {
  const app = path.join(root, 'src/app');
  const walk = folder => fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(folder, entry.name)) : entry.name.endsWith('.tsx') ? [path.join(folder, entry.name)] : []);
  const files = [...walk(app), ...walk(path.join(root, 'src/components'))];
  const sources = new Map(files.map(file => [file, inspectShareSource(fs.readFileSync(file, 'utf8'), file)]));
  const relative = file => path.relative(root, file).replaceAll('\\', '/');
  const resolve = (file, specifier) => {
    const target = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2)) : specifier.startsWith('.') ? path.resolve(path.dirname(file), specifier) : null;
    return target && [target, `${target}.tsx`, path.join(target, 'index.tsx')].find(candidate => sources.has(candidate));
  };
  const dependencies = new Map([...sources].map(([file, source]) => [file, source.imports.map(specifier => resolve(file, specifier)).filter(Boolean)]));
  function evidence(roots) {
    const visited = new Set(), pending = [...roots];
    while (pending.length) {
      const file = pending.pop();
      if (visited.has(file)) continue;
      visited.add(file);
      pending.push(...(dependencies.get(file) ?? []));
    }
    return [...visited].filter(file => sources.get(file).markers.length || sources.get(file).custom).map(file => ({ file: relative(file), markers: sources.get(file).markers, custom: sources.get(file).custom }));
  }
  const records = files.filter(file => path.basename(file) === 'page.tsx').map(file => {
    const pathname = relative(file).replace(/^src\/app/, '').replace(/\/page\.tsx$/, '').replace(/\/\([^/]+\)/g, '') || '/';
    const layouts = [];
    for (let folder = path.dirname(file); folder.startsWith(app); folder = path.dirname(folder)) {
      const layout = path.join(folder, 'layout.tsx');
      if (sources.has(layout)) layouts.push(layout);
    }
    const exclusion = EXCLUDED.get(pathname) ?? (pathname.startsWith('/contact/') ? 'Private contact workflow' : null);
    const pageEvidence = evidence([file]), layoutEvidence = evidence(layouts);
    return { pathTemplate: pathname, file: relative(file), exclusion, pageEvidence, layoutEvidence, sourceStatus: exclusion ? 'not-applicable' : pageEvidence.length || layoutEvidence.length ? 'reachable-share-code' : 'missing-share-code', browserStatus: 'not-verified-by-this-check' };
  });
  return { generatedAt: new Date().toISOString(), scope: 'AST import graph of page templates and inherited layouts; conditional visibility, all concrete URLs and successful browser delivery require separate checks.', counts: { templates: records.length, excluded: records.filter(row => row.exclusion).length, missing: records.filter(row => row.sourceStatus === 'missing-share-code').length }, records };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const report = buildShareCoverage(root);
  const out = path.join(root, '.artifacts/share-coverage');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'source-ledger.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report.counts, missingPaths: report.records.filter(row => row.sourceStatus === 'missing-share-code').map(row => row.pathTemplate) }));
  if (report.counts.missing) process.exitCode = 1;
}
