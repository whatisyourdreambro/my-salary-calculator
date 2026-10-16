// Offline artifact inspection. Never imports/evaluates generated Worker/client JS.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ADS_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2873403048341290';
const GA_ID = 'G-EZ8GT7RPEZ';
const QA_PATH = /(?:^|[\\/])(?:\.open-next-qa|\.next-qa)(?:[\\/]|$)/i;
const sha = data => createHash('sha256').update(data).digest('hex');
function insist(condition, message) { assert.ok(condition, `Production Worker: ${message}`); }
function walk(node, visit) { visit(node); ts.forEachChild(node, child => walk(child, visit)); }
function nodes(node, predicate) { const result = []; walk(node, child => { if (predicate(child)) result.push(child); }); return result; }
function localNodes(node, predicate) {
  const result = [];
  function visit(child) {
    if (child !== node && isFunction(child)) return;
    if (predicate(child)) result.push(child);
    ts.forEachChild(child, visit);
  }
  visit(node);
  return result;
}
function text(node) { return node?.getText().replace(/\s+/g, '') ?? ''; }
function unwrap(node) { while (node && ts.isParenthesizedExpression(node)) node = node.expression; return node; }
function name(node) { return node && (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) ? node.text : ''; }
function strings(node) { return new Set(nodes(node, n => ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)).map(n => n.text)); }
function isFunction(node) { return ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node); }
function js(source, filename) {
  const tree = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  insist(tree.parseDiagnostics.length === 0, `cannot parse generated JavaScript (${path.basename(filename)})`);
  return tree;
}

// Recognize the policy's exact boolean expression without evaluating generated
// code. Unknown expressions, additional predicates and altered truth values fail.
function constant(node) {
  node = unwrap(node);
  if (!node) return undefined;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken && ts.isNumericLiteral(unwrap(node.operand))) return Number(unwrap(node.operand).text) === 0;
  if (ts.isBinaryExpression(node)) {
    const left = constant(node.left), right = constant(node.right);
    if (node.operatorToken.kind === ts.SyntaxKind.BarBarToken && (left === true || right === true)) return true;
    if (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && (left === false || right === false)) return false;
  }
  return undefined;
}
function splitBoolean(node, operator) {
  node = unwrap(node);
  return ts.isBinaryExpression(node) && node.operatorToken.kind === operator
    ? [...splitBoolean(node.left, operator), ...splitBoolean(node.right, operator)] : [node];
}
function comparison(node, property, value, operator = ts.SyntaxKind.EqualsEqualsEqualsToken) {
  node = unwrap(node);
  return ts.isBinaryExpression(node) && node.operatorToken.kind === operator &&
    ((text(unwrap(node.left)) === property && constant(node.right) === value) ||
     (text(unwrap(node.right)) === property && constant(node.left) === value));
}
function memberComparison(node, left, right) {
  node = unwrap(node);
  return ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
    ((text(unwrap(node.left)) === left && text(unwrap(node.right)) === right) || (text(unwrap(node.left)) === right && text(unwrap(node.right)) === left));
}
function userAgentFallback(node, property) {
  node = unwrap(node);
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) return text(unwrap(node.left)) === property && constant(node.right) === '';
  // SWC's ES2017 nullish-coalescing lowering: null != (tmp=c.userAgent) ? tmp : ''.
  if (!ts.isConditionalExpression(node)) return false;
  const condition = unwrap(node.condition);
  if (!ts.isBinaryExpression(condition) || ![ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(condition.operatorToken.kind)) return false;
  const left = unwrap(condition.left), right = unwrap(condition.right);
  const assignment = left.kind === ts.SyntaxKind.NullKeyword ? right : right.kind === ts.SyntaxKind.NullKeyword ? left : undefined;
  if (!assignment || !ts.isBinaryExpression(assignment) || assignment.operatorToken.kind !== ts.SyntaxKind.EqualsToken || !ts.isIdentifier(assignment.left) || text(unwrap(assignment.right)) !== property) return false;
  const isEqual = condition.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken;
  return constant(isEqual ? node.whenTrue : node.whenFalse) === '' && text(unwrap(isEqual ? node.whenFalse : node.whenTrue)) === assignment.left.text;
}
function policyExpressionMatches(expression, parameter) {
  const terms = splitBoolean(expression, ts.SyntaxKind.AmpersandAmpersandToken);
  if (terms.length !== 7) return false;
  const consume = predicate => { const index = terms.findIndex(predicate); if (index < 0) return false; terms.splice(index, 1); return true; };
  return consume(term => comparison(term, `${parameter}.production`, true)) &&
    consume(term => comparison(term, `${parameter}.protocol`, 'https:')) &&
    consume(term => {
      const hosts = splitBoolean(term, ts.SyntaxKind.BarBarToken);
      return hosts.length === 2 && ['moneysalary.com', 'www.moneysalary.com'].every(host => hosts.some(item => comparison(item, `${parameter}.hostname`, host)));
    }) &&
    consume(term => comparison(term, `${parameter}.topLevel`, true)) &&
    consume(term => comparison(term, `${parameter}.automated`, true, ts.SyntaxKind.ExclamationEqualsEqualsToken)) &&
    consume(term => comparison(term, `${parameter}.disabled`, true, ts.SyntaxKind.ExclamationEqualsEqualsToken)) &&
    consume(term => {
      term = unwrap(term);
      if (!ts.isPrefixUnaryExpression(term) || term.operator !== ts.SyntaxKind.ExclamationToken) return false;
      const call = unwrap(term.operand);
      return ts.isCallExpression(call) && call.arguments.length === 1 && ts.isPropertyAccessExpression(call.expression) && call.expression.name.text === 'test' &&
        call.expression.expression.kind === ts.SyntaxKind.RegularExpressionLiteral &&
        call.expression.expression.text === '/headless|playwright|puppeteer|selenium|lighthouse|moneysalary-qa/i' &&
        userAgentFallback(call.arguments[0], `${parameter}.userAgent`);
    });
}
function contextArgumentMatches(argument) {
  argument = unwrap(argument);
  if (!ts.isObjectLiteralExpression(argument) || argument.properties.some(property => !ts.isPropertyAssignment(property))) return false;
  const entries = argument.properties.map(property => [name(property.name), property.initializer]);
  const values = new Map(entries);
  if (values.size !== entries.length || constant(values.get('production')) !== true) return false;
  for (const [key, expected] of [['protocol', 'window.location.protocol'], ['hostname', 'window.location.hostname'], ['automated', 'window.navigator.webdriver'], ['userAgent', 'window.navigator.userAgent']]) {
    if (text(unwrap(values.get(key))) !== expected) return false;
  }
  if (!values.has('topLevel') || !values.has('disabled')) return false;
  const frame = splitBoolean(values.get('topLevel'), ts.SyntaxKind.AmpersandAmpersandToken);
  return frame.length === 3 && [['window.top', 'window'], ['window.parent', 'window'], ['window.frameElement', 'null']].every(([a, b]) => frame.some(term => memberComparison(term, a, b))) && constant(values.get('disabled')) === undefined;
}
function returnedPolicyMatches(expression, moduleBody, guardFunction) {
  expression = unwrap(expression);
  const sequence = splitBoolean(expression, ts.SyntaxKind.CommaToken);
  const result = sequence.at(-1);
  if (!ts.isCallExpression(result)) {
    // SWC can inline the policy as `context={...}, sevenPredicates(context)`.
    // Require the exact object assignment immediately before its pure policy;
    // an unused correct object/expression elsewhere cannot authorize the return.
    const assignment = sequence.at(-2);
    if (!assignment || !ts.isBinaryExpression(assignment) || assignment.operatorToken.kind !== ts.SyntaxKind.EqualsToken || !ts.isIdentifier(assignment.left) || !contextArgumentMatches(assignment.right)) return false;
    const binding = assignment.left.text;
    const declarations = localNodes(guardFunction, ts.isVariableDeclaration).filter(declaration => !ts.isCatchClause(declaration.parent) && name(declaration.name) === binding);
    if (declarations.length !== 1 || declarations[0].initializer || guardFunction.parameters.some(parameter => name(parameter.name) === binding)) return false;
    const writes = localNodes(guardFunction, ts.isBinaryExpression).filter(binary => ts.isIdentifier(binary.left) && binary.left.text === binding && binary.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && binary.operatorToken.kind <= ts.SyntaxKind.LastAssignment);
    return writes.length === 1 && writes[0] === assignment && policyExpressionMatches(result, binding);
  }
  // A comma prefix can contain persistence writes emitted by SWC. It cannot
  // select a different return value: the final expression must be the policy call.
  expression = result;
  if (!ts.isCallExpression(expression) || !ts.isIdentifier(expression.expression) || expression.arguments.length !== 1 || !contextArgumentMatches(expression.arguments[0])) return false;
  const callee = expression.expression.text;
  // Resolve only an unambiguous module-level declaration. Shadowed/reassigned
  // callees must not be mistaken for an unused correct policy elsewhere.
  const declarations = moduleBody.statements.filter(statement => ts.isFunctionDeclaration(statement) && statement.name?.text === callee);
  if (declarations.length !== 1 || nodes(guardFunction, ts.isVariableDeclaration).some(declaration => name(declaration.name) === callee) || guardFunction.parameters.some(parameter => name(parameter.name) === callee)) return false;
  if (nodes(moduleBody, ts.isBinaryExpression).some(binary => ts.isIdentifier(binary.left) && binary.left.text === callee && binary.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && binary.operatorToken.kind <= ts.SyntaxKind.LastAssignment)) return false;
  const policy = declarations[0];
  if (policy.parameters.length !== 1 || !ts.isIdentifier(policy.parameters[0].name) || !policy.body) return false;
  const statements = policy.body.statements;
  if (!statements.length || !ts.isReturnStatement(statements.at(-1)) || !statements.at(-1).expression) return false;
  if (statements.slice(0, -1).some(statement => !ts.isVariableStatement(statement) || statement.declarationList.declarations.some(declaration => declaration.initializer))) return false;
  return policyExpressionMatches(statements.at(-1).expression, policy.parameters[0].name.text);
}

export function assertProductionEnvironment(env, root) {
  insist(!QA_PATH.test(root), 'QA directories cannot be deployed');
  for (const key of ['MSY_QA_MODE', 'MSY_QA_WORKER_STAGE', 'NEXT_PUBLIC_ADS_DISABLED']) insist(env[key] !== '1', `${key} disables production services`);
  insist(!['development', 'test'].includes(env.NODE_ENV), 'non-production NODE_ENV');
}

// Deliberately inspect AST nodes, not loose URL text. QA bundles retain loader
// URLs but replace the exported guard with `return false`. This rejects them,
// including a false guard decorated with misleading comments/string literals.
export function inspectClientAdvertising(sources) {
  const modules = new Map();
  for (const { filename, source } of sources) {
    const tree = js(source, filename);
    for (const call of nodes(tree, ts.isCallExpression)) {
      if (!ts.isPropertyAccessExpression(call.expression) || call.expression.name.text !== 'push') continue;
      const array = call.arguments[0];
      if (!array || !ts.isArrayLiteralExpression(array) || !array.elements[1] || !ts.isObjectLiteralExpression(array.elements[1])) continue;
      for (const property of array.elements[1].properties) {
        if (ts.isPropertyAssignment(property) && isFunction(property.initializer)) {
          const id = name(property.name);
          insist(!modules.has(id), 'duplicate client module identity');
          modules.set(id, { id, body: property.initializer.body, filename });
        }
      }
    }
  }
  const guards = [];
  for (const clientModule of modules.values()) {
    const literals = strings(clientModule.body);
    if (!literals.has('msy:disable-live-services')) continue;
    for (const fn of nodes(clientModule.body, isFunction)) {
      if (!fn.body || !ts.isBlock(fn.body)) continue;
      const requiredMembers = ['window.__MSY_TEST_MODE__', 'window.__MSY_ADS_DISABLED__', 'window.top', 'window.parent', 'window.frameElement', 'window.sessionStorage', 'window.navigator.webdriver', 'window.navigator.userAgent'];
      const members = new Set(nodes(fn.body, ts.isPropertyAccessExpression).map(text));
      if (!requiredMembers.every(member => members.has(member))) continue;
      // Known compiler form: optional SSR early-return, then a guarded try/catch.
      const tries = fn.body.statements.filter(ts.isTryStatement);
      if (tries.length !== 1 || fn.body.statements.some(statement => !ts.isIfStatement(statement) && !ts.isTryStatement(statement))) continue;
      if (fn.body.statements.filter(ts.isIfStatement).some(statement => !text(statement.expression).includes('typeofwindow') || statement.elseStatement)) continue;
      const tried = tries[0];
      const returns = localNodes(tried.tryBlock, ts.isReturnStatement);
      if (returns.length !== 1 || !returns[0].expression || /^(?:false|true|!1|!0|0|1)$/.test(text(returns[0].expression))) continue;
      if (localNodes(tried.tryBlock, ts.isThrowStatement).length) continue;
      // Dead short-circuit decoys are not evidence of an eligible branch.
      if (nodes(returns[0].expression, ts.isBinaryExpression).some(binary => binary.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && /^(?:false|!1|0)$/.test(text(binary.left)))) continue;
      if (!returnedPolicyMatches(returns[0].expression, clientModule.body, fn)) continue;
      if (!tried.catchClause || !/return(?:false|!1)/.test(text(tried.catchClause))) continue;
      if (!['https:', 'moneysalary.com', 'www.moneysalary.com'].every(value => literals.has(value))) continue;
      if (!nodes(clientModule.body, node => node.kind === ts.SyntaxKind.RegularExpressionLiteral).some(node => /headless\|playwright\|puppeteer\|selenium\|lighthouse\|moneysalary-qa/.test(node.text))) continue;
      const binding = fn.name?.text ?? (ts.isVariableDeclaration(fn.parent) ? name(fn.parent.name) : '');
      if (!binding) continue;
      const exported = [];
      for (const call of nodes(clientModule.body, ts.isCallExpression)) {
        if (!ts.isPropertyAccessExpression(call.expression) || call.expression.name.text !== 'd' || !call.arguments[1] || !ts.isObjectLiteralExpression(call.arguments[1])) continue;
        for (const prop of call.arguments[1].properties) {
          if (ts.isPropertyAssignment(prop) && ts.isArrowFunction(prop.initializer) && text(prop.initializer.body) === binding) exported.push(name(prop.name));
        }
      }
      if (exported.length) guards.push({ moduleId: clientModule.id, exported, filename: clientModule.filename });
    }
  }
  insist(guards.length > 0, 'no executable exported live-services guard policy in layout chunks (QA or unknown compiler form)');
  for (const clientModule of modules.values()) {
    const literals = strings(clientModule.body);
    if (![ADS_URL, GA_ID, 'msy-ga-loader', 'msy-adsense-loader'].every(value => literals.has(value))) continue;
    for (const guard of guards) {
      const aliases = nodes(clientModule.body, ts.isVariableDeclaration).filter(declaration => {
        const initializer = unwrap(declaration.initializer);
        return initializer && ts.isCallExpression(initializer) && name(initializer.arguments[0]) === guard.moduleId;
      }).map(declaration => name(declaration.name));
      const calls = nodes(clientModule.body, ts.isCallExpression).filter(call => nodes(call.expression, ts.isPropertyAccessExpression).some(access => aliases.includes(text(access.expression)) && guard.exported.includes(access.name.text)));
      if (calls.length >= 2 && text(clientModule.body).includes('document.head.appendChild')) return { guard, loaderModuleId: clientModule.id, loaderChunk: clientModule.filename, guardedCallSites: calls.length };
    }
  }
  throw new Error('Production Worker: loader module is not connected to the verified guard');
}

function verifyStaticCache(root) {
  const source = '.open-next/cache';
  const destination = '.open-next/assets/cdn-cgi/_next_cache';
  function inventory(relative) {
    const base = path.resolve(root, relative);
    insist(fs.existsSync(base), `missing static cache tree: ${relative}`);
    insist(fs.realpathSync(base) === base && fs.lstatSync(base).isDirectory(), 'static cache root must be a real directory');
    const pending = [base], directories = [], files = new Map();
    while (pending.length) {
      const directory = pending.pop();
      for (const entry of fs.readdirSync(directory)) {
        const absolute = path.join(directory, entry);
        const relativePath = path.relative(base, absolute).replaceAll('\\', '/');
        const stat = fs.lstatSync(absolute);
        insist(!stat.isSymbolicLink(), 'static cache symlinks are not allowed');
        if (stat.isDirectory()) { directories.push(relativePath); pending.push(absolute); }
        else { insist(stat.isFile(), 'static cache contains a non-file entry'); files.set(relativePath, absolute); }
      }
    }
    return { directories: directories.sort(), files };
  }
  const original = inventory(source), deployed = inventory(destination);
  const paths = [...original.files.keys()].sort();
  insist(paths.length > 0, 'static cache source is empty');
  insist(JSON.stringify(paths) === JSON.stringify([...deployed.files.keys()].sort()) &&
    JSON.stringify(original.directories) === JSON.stringify(deployed.directories), 'static cache mirror paths differ');
  const aggregate = createHash('sha256');
  aggregate.update(JSON.stringify(original.directories) + '\n');
  let bytes = 0;
  for (const relative of paths) {
    const expected = fs.readFileSync(original.files.get(relative));
    const actual = fs.readFileSync(deployed.files.get(relative));
    insist(expected.equals(actual), `static cache mirror bytes differ: ${relative}`);
    bytes += expected.length;
    aggregate.update(JSON.stringify([relative, expected.length, sha(expected)]) + '\n');
  }
  return { source, destination, files: paths.length, bytes, sha256: aggregate.digest('hex') };
}

export function verifyProductionWorker({ root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), env = process.env } = {}) {
  root = fs.realpathSync(root);
  assertProductionEnvironment(env, root);
  const files = new Map();
  function file(relative) {
    const resolved = path.resolve(root, relative);
    insist(resolved.startsWith(root + path.sep) && !QA_PATH.test(resolved), 'artifact escapes the production checkout');
    const actual = fs.realpathSync(resolved);
    insist(actual === resolved, 'artifact symlink is not allowed');
    const bytes = fs.readFileSync(actual);
    files.set(relative.replaceAll('\\', '/'), { bytes: bytes.length, sha256: sha(bytes) });
    return bytes;
  }
  const json = relative => JSON.parse(file(relative).toString('utf8'));
  const rawConfig = file('wrangler.jsonc').toString('utf8');
  const parsedConfig = ts.parseConfigFileTextToJson('wrangler.jsonc', rawConfig);
  insist(!parsedConfig.error, 'invalid Wrangler JSONC');
  const config = parsedConfig.config;
  insist(config.name === 'moneysalary' && config.account_id === 'b01a4e306f09d28f1a0f1d57bda8410d', 'unexpected production Worker identity');
  insist(config.main === 'cloudflare/worker-entry.mjs' && config.assets?.directory === '.open-next/assets' && config.assets.binding === 'ASSETS', 'incorrect production entry/assets');
  insist(config.workers_dev === false && config.preview_urls === false && !config.env, 'preview or environment-specific Worker configuration');
  const routes = (config.routes ?? []).map(route => `${route.pattern}|${route.zone_name}`).sort();
  insist(JSON.stringify(routes) === JSON.stringify(['moneysalary.com/*|moneysalary.com', 'www.moneysalary.com/*|moneysalary.com']), 'canonical routes changed');
  for (const key of ['MSY_QA_MODE', 'MSY_QA_WORKER_STAGE', 'NEXT_PUBLIC_ADS_DISABLED']) insist(String(config.vars?.[key] ?? '') !== '1', 'QA variable in deployment config');
  const entry = js(file(config.main).toString('utf8'), config.main);
  const workerImport = nodes(entry, ts.isImportDeclaration).find(node => node.moduleSpecifier.text === '../.open-next/worker.js');
  insist(workerImport?.importClause?.name, 'entry does not import the generated production Worker');
  insist(nodes(entry, ts.isExportDeclaration).some(node => !node.exportClause && node.moduleSpecifier?.text === '../.open-next/worker.js'), 'generated named exports are not preserved');
  insist(nodes(entry, ts.isImportDeclaration).some(node => node.moduleSpecifier.text === './request-body-limit.mjs'), 'request body guard import is absent');
  insist(nodes(entry, ts.isExportAssignment).some(node => ts.isCallExpression(node.expression) && text(node.expression.expression) === 'withRequestBodyLimits' && text(node.expression.arguments[0]) === workerImport.importClause.name.text), 'request body guard is not applied to the generated Worker');
  file('cloudflare/request-body-limit.mjs');
  const required = json('.next/required-server-files.json');
  insist(required.config?.distDir === '.next' && required.config?.output === 'standalone', 'unexpected Next output configuration');
  insist(path.resolve(required.appDir ?? '') === root && !QA_PATH.test(required.appDir ?? ''), 'Next build came from a different or QA checkout');
  insist(required.config?.eslint?.ignoreDuringBuilds !== true && required.config?.typescript?.ignoreBuildErrors !== true, 'build validation was disabled');
  for (const key of ['MSY_QA_MODE', 'MSY_QA_WORKER_STAGE', 'NEXT_PUBLIC_ADS_DISABLED']) insist(String(required.config.env?.[key] ?? '') !== '1', 'QA env in Next artifact');
  const routesManifest = json('.next/routes-manifest.json');
  const headers = (routesManifest.headers ?? []).flatMap(rule => rule.headers ?? []);
  insist(!headers.some(header => header.key.toLowerCase() === 'x-moneysalary-qa'), 'QA response header in production artifact');
  const csps = headers.filter(header => header.key.toLowerCase() === 'content-security-policy').map(header => header.value);
  insist(csps.some(csp => /script-src[^;]*https:\/\/pagead2\.googlesyndication\.com/.test(csp) && /script-src[^;]*https:\/\/www\.googletagmanager\.com/.test(csp) && /frame-src[^;]*https:\/\/googleads\.g\.doubleclick\.net/.test(csp)), 'production ad/measurement CSP is absent');
  const buildId = file('.next/BUILD_ID').toString('utf8').trim();
  insist(buildId.length > 0 && file('.open-next/assets/BUILD_ID').toString('utf8').trim() === buildId, 'Next/assets BUILD_ID mismatch');
  const staticCache = verifyStaticCache(root);
  const manifest = json('.next/app-build-manifest.json');
  const chunks = [...new Set(manifest.pages?.['/layout'] ?? [])].filter(chunk => chunk.endsWith('.js'));
  insist(chunks.length > 0, 'layout client manifest is empty');
  const sources = chunks.map(chunk => {
    insist(/^static\/[a-zA-Z0-9_./[\]-]+\.js$/.test(chunk) && !chunk.split('/').includes('..'), 'unsafe client manifest path');
    const source = file(`.next/${chunk}`);
    const deployed = file(`.open-next/assets/_next/${chunk}`);
    insist(source.equals(deployed), 'deployed client chunk differs from Next build');
    return { filename: chunk, source: source.toString('utf8') };
  });
  const advertising = inspectClientAdvertising(sources);
  const generated = file('.open-next/worker.js');
  insist(generated.length > 0, 'empty generated Worker');
  const workerTree = js(generated.toString('utf8'), 'worker.js');
  insist(nodes(workerTree, ts.isExportAssignment).some(node => ts.isObjectLiteralExpression(node.expression) && node.expression.properties.some(property => ts.isMethodDeclaration(property) && name(property.name) === 'fetch')), 'generated Worker has no default fetch handler');
  insist(nodes(workerTree, ts.isCallExpression).some(node => node.expression.kind === ts.SyntaxKind.ImportKeyword && name(node.arguments[0]) === './server-functions/default/handler.mjs'), 'generated Worker is not linked to the server handler');
  for (const declaration of [...nodes(workerTree, ts.isImportDeclaration), ...nodes(workerTree, ts.isExportDeclaration)]) {
    const relative = declaration.moduleSpecifier?.text;
    if (relative?.startsWith('./')) file(path.posix.join('.open-next', relative));
  }
  // Include the adapter server handler in the receipt; do not load its code.
  const handler = '.open-next/server-functions/default/handler.mjs';
  file(handler);
  const output = { schema: 'moneysalary-production-worker-verification-v1', checkedAt: new Date().toISOString(), pass: true, buildId, workerName: config.name, advertising,
    staticCache, files: Object.fromEntries(files), limitation: 'Static build eligibility and artifact identity only; does not assert served ads, fill, deployed route activation, or browser behavior. Re-run after any artifact change.' };
  const receipt = path.join(root, '.artifacts/production-worker-verification.json');
  fs.mkdirSync(path.dirname(receipt), { recursive: true });
  fs.writeFileSync(receipt, JSON.stringify(output, null, 2) + '\n');
  return output;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  insist(process.argv.length === 2, 'this verifier accepts no alternate build/config arguments');
  const result = verifyProductionWorker();
  console.log(JSON.stringify({ pass: result.pass, buildId: result.buildId, workerName: result.workerName, checkedFiles: Object.keys(result.files).length, staticCache: result.staticCache, receipt: '.artifacts/production-worker-verification.json' }, null, 2));
}
