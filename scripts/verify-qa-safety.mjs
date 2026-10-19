// Repository gate: retired browser scripts stay retired, and new raw launchers fail CI.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const excludedDirs = new Set(['node_modules', '.git', '.next', '.next-qa', '.open-next', '.open-next-qa', '.pages-build', '.pages-qa', '.wrangler', '.vercel',
  '.claude', '.codex', 'apps', 'coverage', '.lighthouseci', 'lhci-report', '__pycache__']);
const managed = new Set(['scripts/ad-depth-audit.mjs', 'scripts/qa-calculator-experience.mjs', 'scripts/qa-focus-input.mjs', 'scripts/qa-interaction-states.mjs', 'scripts/qa-money-check.mjs', 'scripts/qa-pages-navigation.mjs']);
const infrastructure = new Set(['scripts/lib/qa-safety.cjs', 'scripts/verify-qa-safety.mjs', 'scripts/__tests__/qa-safety.test.mjs']);
const executable = /\.(?:[cm]?js|[cm]?ts|tsx|py|ps1|sh)$/i;
const driverImport = /(?:from\s*|require\s*\(|import\s*\()\s*['"][^'"\r\n]*(?:playwright|puppeteer|selenium|chrome-launcher|lighthouse)[^'"\r\n]*['"]|\bfrom\s+(?:playwright|selenium)\b/;
const driverSpecifier = /['"](?:[^'"\r\n]*[/\\])?(?:playwright(?:-core)?|puppeteer(?:-core)?|chrome-launcher|selenium-webdriver|lighthouse)['"]/;
const directLaunch = /\b(?:chromium|firefox|webkit|puppeteer)\s*\.\s*(?:launch|connect|connectOverCDP|launchPersistentContext)\s*\(|\bconnect_over_cdp\s*\(|\bwebdriver\.(?:Chrome|Firefox|Edge)\s*\(/;
const retired = /(?:^|\n)throw new Error\("Archived browser audit disabled\./;
const violations = [];
const counts = { scannedExecutableFiles: 0, retiredBrowserScripts: 0, guardedBrowserScripts: 0, guardedProductionHttpScripts: 0 };

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) { if (!excludedDirs.has(entry.name)) walk(full); continue; }
    if (!executable.test(entry.name) || /\.d\.[cm]?ts$/.test(entry.name)) continue;
    const relative = path.relative(root, full).replaceAll('\\', '/');
    if (infrastructure.has(relative) || /(?:^|\/)fonttools(?:\/|$)/i.test(relative)) continue;
    const code = fs.readFileSync(full, 'utf8');
    counts.scannedExecutableFiles++;
    if (code.includes('MSY_RETIRED_BROWSER_QA') && retired.test(code)) {
      // The stop must precede imports/other executable code; only comments/whitespace may precede it.
      const prefix = code.slice(0, code.indexOf('throw new Error')).replace(/^#![^\n]*\n/, '')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').trim();
      if (prefix) violations.push(`${relative}: retired stop is not the first statement`);
      counts.retiredBrowserScripts++; continue;
    }
    if (!driverImport.test(code) && !driverSpecifier.test(code) && !directLaunch.test(code) && !managed.has(relative)) continue;
    if (managed.has(relative) && code.includes('launchQaBrowser(') && code.includes('assertLocalQaTarget(')
        && !directLaunch.test(code)) { counts.guardedBrowserScripts++; continue; }
    violations.push(`${relative}: unmanaged browser launcher/import; use qa-safety.cjs and review the maintained allowlist`);
  }
}
walk(root);
for (const relative of ['scripts/qa-crawl.ts', 'scripts/qa-english.ts', 'scripts/qa-calculator-routes.mjs', 'scripts/qa-cloudflare-http.mjs', 'scripts/qa-pages-http.mjs']) {
  const code = fs.readFileSync(path.join(root, relative), 'utf8');
  if (!code.includes('fetchQaDocument(') || /\bfetch\s*\(/.test(code)) {
    violations.push(`${relative}: HTTP QA must use the guarded document fetcher`);
  }
}
// These are non-rendering production checks, not public-data API importers.
// Keep this list explicit so a raw fetch/redirect-follow regression fails CI.
for (const relative of ['scripts/trend-publish/verify-prod.mjs', 'scripts/naver-template-panel.ts',
  'scripts/indexnow-ping.mjs', 'scripts/health-check.mjs', 'scripts/crawl-cache-sampler.mjs']) {
  const code = fs.readFileSync(path.join(root, relative), 'utf8');
  if (!code.includes('qa-production-http.cjs') || !code.includes('fetchProductionQaDocument(')
      || /\b(?:fetch|fetchFn|fetchImpl)\s*\(/.test(code) || /redirect\s*:\s*['"]follow['"]/.test(code)) {
    violations.push(`${relative}: production HTTP QA must use the canonical-only document guard without raw fetch or redirect following`);
  } else counts.guardedProductionHttpScripts++;
}
const publisher = fs.readFileSync(path.join(root, 'scripts/trend-publish/publish-approved.mjs'), 'utf8');
if (publisher.includes('배포 뒤 브라우저로 확인')) {
  violations.push('scripts/trend-publish/publish-approved.mjs: post-publication verification must remain non-rendering HTTP');
}
const lighthouse = fs.readFileSync(path.join(root, 'lighthouserc.cjs'), 'utf8');
for (const required of ['qa-safety.cjs', 'qa:start', 'blockedUrlPatterns']) {
  if (!lighthouse.includes(required)) violations.push(`lighthouserc.cjs: missing ${required}`);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const name of ['dev', 'qa:dev', 'qa:build', 'qa:start']) {
  if (!pkg.scripts[name]?.includes('qa-server.mjs')) violations.push(`package.json: ${name} must use the ad-free server`);
}
for (const name of ['qa:crawl', 'qa:english', 'ad-depth']) {
  if (!pkg.scripts[name]?.includes('qa-run.mjs')) violations.push(`package.json: ${name} must use the guarded runner`);
}
console.log(JSON.stringify({ ...counts, violations }, null, 2));
if (violations.length) process.exitCode = 1;
