// A visible, isolated localhost browser for actual assistive-technology inspection.
// This records browser evidence only. NVDA/Narrator speech must be observed separately.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import safety from './lib/qa-safety.cjs';

const { assertLocalQaTarget, assertQaEnvironment, launchQaBrowser, isAllowedQaRequest } = safety;
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ROUTES = new Set(['/', '/tools/loan', '/tools/deposit', '/en/tools/loan',
  '/calc/refinance-break-even', '/contact', '/fun/salary-battle', '/year-end-tax']);

export function validateCommand(value) {
  if (!value || !Number.isSafeInteger(value.id) || value.id < 1
      || !['open', 'checkpoint', 'stop'].includes(value.action)
      || Object.keys(value).some(key => !['id', 'action', 'route', 'label'].includes(key))) {
    throw new Error('Invalid screen-reader QA command');
  }
  if (value.action === 'open' && !ROUTES.has(value.route)) throw new Error('Unapproved local route');
  if (value.action !== 'open' && value.route !== undefined) throw new Error('Unexpected route');
  if (value.label !== undefined && !/^[a-z0-9-]{1,80}$/.test(value.label)) throw new Error('Invalid evidence label');
  return value;
}

export async function main() {
  const base = assertLocalQaTarget(process.env.BASE_URL || 'http://127.0.0.1:3320');
  assertQaEnvironment();
  if (process.env.MSY_QA_SCREEN_READER !== '1') throw new Error('Explicit MSY_QA_SCREEN_READER=1 is required');
  const session = process.env.QA_SCREEN_READER_SESSION;
  if (!session || !/^[a-z0-9-]{1,80}$/.test(session)) throw new Error('A unique QA_SCREEN_READER_SESSION is required');
  const output = path.join(ROOT, '.artifacts/screen-reader-qa', session);
  // Never replace evidence from an earlier actual screen-reader session.
  await mkdir(path.dirname(output), { recursive: true });
  await mkdir(output);
  const report = { version: 1, session, base, startedAt: new Date().toISOString(),
    browser: null, endedAt: null, completed: false, actualSpeechVerified: false,
    scope: 'Guarded visible browser evidence; actual screen-reader speech is separate evidence, never inferred from DOM.',
    documents: [], checkpoints: [], commands: [], forbiddenRequests: [], externalResponses: [], pageErrors: [] };
  let browser;
  let stop = false;
  let lastId = 0;
  const save = () => writeFile(path.join(output, 'browser-report.json'), JSON.stringify(report, null, 2) + '\n');
  const onSignal = () => { stop = true; };
  process.on('SIGINT', onSignal); process.on('SIGTERM', onSignal);
  try {
    const { chromium } = createRequire(import.meta.url)('playwright-core');
    browser = await launchQaBrowser(chromium, base, {
      ...(process.platform === 'win32' ? { channel: 'chrome' } : {}),
      headless: false, args: ['--force-renderer-accessibility'],
    });
    report.browser = browser.version();
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 },
      locale: 'ko-KR', colorScheme: 'light', reducedMotion: 'reduce' });
    context.on('request', request => {
      if (!isAllowedQaRequest(request.url(), base, request.method())) report.forbiddenRequests.push({
        at: new Date().toISOString(), url: request.url(), method: request.method(),
      });
    });
    context.on('response', response => {
      if (!isAllowedQaRequest(response.url(), base, response.request().method())) {
        report.externalResponses.push({ at: new Date().toISOString(), url: response.url() });
      }
    });
    const page = await context.newPage();
    page.on('pageerror', error => report.pageErrors.push(String(error)));
    // Extra windows are never part of this manual inspection session.
    context.on('page', extra => { if (extra !== page) void extra.close(); });
    async function open(route) {
      const response = await page.goto(base + route, { waitUntil: 'networkidle' });
      assert.equal(response?.status(), 200);
      assert.equal(response.headers()['x-moneysalary-qa'], 'ads-disabled');
      assert.equal(await page.locator('#msy-ga-loader,#msy-adsense-loader,ins.adsbygoogle').count(), 0);
      report.documents.push({ at: new Date().toISOString(), route,
        buildId: response.headers()['x-moneysalary-build'] || null });
      await page.bringToFront();
    }
    await open('/');
    await save();
    console.log(JSON.stringify({ ready: true, output, browser: report.browser, base }));
    const deadline = Date.now() + 60 * 60 * 1000;
    while (!stop && Date.now() < deadline) {
      let command;
      try { command = validateCommand(JSON.parse(await readFile(path.join(output, 'command.json'), 'utf8'))); }
      catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      if (command && command.id > lastId) {
        lastId = command.id;
        const entry = { ...command, startedAt: new Date().toISOString() };
        report.commands.push(entry);
        if (command.action === 'open') await open(command.route);
        if (command.action === 'checkpoint') {
          const current = new URL(page.url());
          assert.equal(current.origin, base);
          assert(ROUTES.has(current.pathname), 'Checkpoint requires an approved QA route');
          const file = `${command.id}-${command.label || 'checkpoint'}.png`;
          await page.screenshot({ path: path.join(output, file) });
          const state = await page.evaluate(() => ({
            title: document.title, focus: document.activeElement?.outerHTML.slice(0, 1200),
            liveRegions: [...document.querySelectorAll('[aria-live],[role="status"],[role="alert"]')]
              .map(el => ({ role: el.getAttribute('role'), live: el.getAttribute('aria-live'),
                text: el.textContent?.trim().slice(0, 2000) })),
            dialogs: [...document.querySelectorAll('dialog[open],[role="dialog"][aria-modal="true"]')]
              .map(el => ({ label: el.getAttribute('aria-label'), labelledby: el.getAttribute('aria-labelledby') })),
          }));
          report.checkpoints.push({ id: command.id, at: new Date().toISOString(), route: current.pathname, file, ...state });
        }
        if (command.action === 'stop') { report.completed = true; stop = true; }
        entry.finishedAt = new Date().toISOString();
        await save();
        console.log(JSON.stringify({ command: command.id, action: command.action, completed: true }));
      }
      if (!stop) await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) { report.error = String(error); throw error; }
  finally {
    await browser?.close();
    report.endedAt = new Date().toISOString();
    process.off('SIGINT', onSignal); process.off('SIGTERM', onSignal);
    await save();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
