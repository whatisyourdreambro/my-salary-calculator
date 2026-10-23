import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { build } from 'esbuild';
import { handlePagesDynamic, type PagesDynamicEnv } from '../../../cloudflare/pages-dynamic';
import { generatePagesData, main as generatorMain } from '../../../scripts/generate-pages-data';
import { GET as originalSalaryTable } from '@/app/api/salary-table/route';
import { GET as originalCompanyWidget } from '@/app/widget/company/route';
import type { FeedbackStatement } from '@/lib/server/feedbackStorage';
import { PARTICIPATION_HEALTH_SQL } from '@/lib/server/participationRuntime';
import { OPINION_RECEIPT_LOOKUP } from '@/lib/server/opinionSql';
import { REACTION_RECEIPT_LOOKUP, PARTICIPATION_SUMMARY_SQL } from '@/lib/server/reactionSql';

const origin = 'https://www.moneysalary.com'; // Synthetic Request objects only; fetch always forbidden.
let out: string;
const externalFetch = vi.fn(() => { throw new Error('Network forbidden in Pages data tests'); });
beforeAll(async () => {
  vi.stubGlobal('fetch', externalFetch);
  out = mkdtempSync(join(tmpdir(), 'msy-pages-data-'));
  await generatePagesData(out);
}, 30000);
afterAll(() => {
  expect(externalFetch).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
  if (out && resolve(out).startsWith(resolve(tmpdir()) + sep) && out.includes('msy-pages-data-')) rmSync(out, { recursive: true, force: true });
});

function assetsEnv() {
  const calls: string[] = [];
  const env: PagesDynamicEnv = { ASSETS: { fetch: async request => {
    const url = new URL(request.url);
    expect(request.method).toBe('GET');
    expect(url.search).toBe('');
    expect([...request.headers]).toEqual([]);
    expect(url.pathname).toMatch(/^\/_msy\/data\/v1\/[a-z0-9/.-]+$/);
    calls.push(url.pathname);
    const target = resolve(out, '.' + url.pathname);
    expect(target.startsWith(resolve(out) + sep)).toBe(true);
    try { return new Response(readFileSync(target)); } catch { return new Response('missing', { status: 404 }); }
  } } };
  return { env, calls };
}
const request = (path: string, init?: RequestInit) => new Request(origin + path, init);

describe('Pages salary API keeps the existing calculation and query contract', () => {
  it.each([
    '?type=annual', '?type=monthly&page=2', '?type=weekly', '?type=hourly',
    '?type=__proto__&page=-1', '?type=constructor&page=abc', '?page=2.9', '?page=Infinity',
    '?type=annual&searchTerm=5,000', '?type=monthly&searchTerm=75&page=2',
    '?searchTerm=%20', '?searchTerm=,,,', '?searchTerm=not-a-number', '?page=9999999999999999',
  ])('matches legacy route output for %s using generated assets only', async query => {
    const { env } = assetsEnv();
    const actual = await handlePagesDynamic(request('/api/salary-table' + query), env);
    const previous = await originalSalaryTable(request('/api/salary-table' + query));
    expect(actual!.status).toBe(previous.status);
    expect(actual!.headers.get('cache-control')).toBe(previous.headers.get('cache-control'));
    expect(await actual!.json()).toEqual(await previous.json());
  });

  it('loads one index plus only the requested page; empty searches load no row chunks', async () => {
    const { env, calls } = assetsEnv();
    await handlePagesDynamic(request('/api/salary-table?type=annual&page=20', { headers: { Cookie: 'not-forwarded', Authorization: 'not-forwarded' } }), env);
    expect(calls).toEqual(['/_msy/data/v1/salary/annual/index.json', '/_msy/data/v1/salary/annual/page-20.json']);
    calls.length = 0;
    await handlePagesDynamic(request('/api/salary-table?searchTerm=not-found'), env);
    expect(calls).toHaveLength(1);
  });

  it('search never fetches unrelated table types or more than 25 chunks', async () => {
    const { env, calls } = assetsEnv();
    await handlePagesDynamic(request('/api/salary-table?type=annual&searchTerm=9'), env);
    expect(calls.length).toBeLessThanOrEqual(26);
    expect(calls.every(path => path.includes('/salary/annual/'))).toBe(true);
    expect(new Set(calls).size).toBe(calls.length);
  });
});

describe('Pages company widget preserves existing HTML, invalid-id fallback and headers', () => {
  it.each(['samsung-electronics', '', 'constructor', '__proto__', '../../api/contact', 'unknown-company'])('keeps id=%s', async id => {
    const { env } = assetsEnv();
    const req = request('/widget/company?id=' + encodeURIComponent(id));
    const actual = await handlePagesDynamic(req, env);
    const previous = await originalCompanyWidget(req);
    expect(await actual!.text()).toBe(await previous.text());
    for (const name of ['content-type', 'content-security-policy', 'x-robots-tag', 'cache-control']) {
      expect(actual!.headers.get(name)).toBe(previous.headers.get(name));
    }
  });
});

describe('Pages route ownership and failure boundary', () => {
  it('bundles without Next, OpenNext, React, tax engines or the company catalog at runtime', async () => {
    const result = await build({ entryPoints: ['cloudflare/pages-dynamic.ts'], bundle: true, write: false,
      metafile: true, platform: 'browser', format: 'esm', logLevel: 'silent' });
    const inputs = Object.keys(result.metafile!.inputs).map(path => path.replaceAll('\\', '/'));
    expect(inputs.some(path => /node_modules\/(?:next|react|@opennextjs)\//.test(path))).toBe(false);
    expect(inputs.some(path => /(?:generateData|TaxLogic|dartDisclosed|dartInjection|dartNameMap|data\/companies)/.test(path))).toBe(false);
    // Includes three bounded participation handlers, still no framework runtime.
    expect(result.outputFiles[0].contents.byteLength).toBeLessThan(52 * 1024);
  });
  it('does not consume routes owned by static pages, OG or share', async () => {
    const { env, calls } = assetsEnv();
    for (const path of ['/', '/api/og', '/share/token', '/api/contact-extra', '/widget/company/extra', '/api/participation/opinions-extra', '/api/participation/reactions/extra']) {
      expect(await handlePagesDynamic(request(path), env)).toBeNull();
    }
    expect(calls).toHaveLength(0);
  });

  it('HEAD preserves GET headers with no body and unsupported methods do no asset work', async () => {
    const { env, calls } = assetsEnv();
    for (const path of ['/api/salary-table', '/widget/company?id=samsung-electronics']) {
      const response = await handlePagesDynamic(request(path, { method: 'HEAD' }), env);
      expect(response!.status).toBe(200);
      expect(await response!.text()).toBe('');
      expect(response!.headers.get('cache-control')).toContain('public');
    }
    calls.length = 0;
    for (const [path, method, allow] of [['/api/contact', 'GET', 'POST'], ['/api/feedback', 'OPTIONS', 'POST'], ['/api/participation/opinions', 'GET', 'POST'], ['/api/participation/reactions', 'GET', 'POST'], ['/api/participation/summary', 'POST', 'GET'], ['/api/salary-table', 'POST', 'GET, HEAD'], ['/widget/company', 'DELETE', 'GET, HEAD']]) {
      const response = await handlePagesDynamic(request(path, { method }), env);
      expect(response!.status).toBe(405);
      expect(response!.headers.get('allow')).toBe(allow);
    }
    expect(calls).toHaveLength(0);
  });

  it.each([new Response('redirect', { status: 302 }), new Response('{}'), new Response('x'.repeat(65537))])('fails closed on invalid assets', async response => {
    const env = { ASSETS: { fetch: async () => response.clone() } };
    const result = await handlePagesDynamic(request('/api/salary-table'), env);
    expect(result!.status).toBe(503);
    expect(result!.headers.get('cache-control')).toBe('private, no-store');
  });

  it('HEAD failures retain their status and never emit a response body', async () => {
    const env = { ASSETS: { fetch: async () => new Response('', { status: 404 }) } };
    for (const [path, status] of [['/api/contact', 405], ['/api/salary-table', 503]] as const) {
      const response = await handlePagesDynamic(request(path, { method: 'HEAD' }), env);
      expect(response!.status).toBe(status);
      expect(await response!.text()).toBe('');
    }
  });

  it('generator requires an explicit destination before doing any work', async () => {
    await expect(generatorMain([])).rejects.toThrow('--out');
    await expect(generatorMain(['--out', '--unexpected'])).rejects.toThrow('--out');
  });
});

describe('Pages private POST routes directly reuse validation, receipts and storage', () => {
  function privateEnv(rateLimited = false) {
    const values = new WeakMap<FeedbackStatement, unknown[]>();
    const batch = vi.fn(async (statements: FeedbackStatement[]) => statements.length === 1 ? [{ success: true, meta: {}, results: [] }] : [
      { success: true, meta: { changes: rateLimited ? 0 : 1 }, results: [] },
      { success: true, meta: { changes: rateLimited ? 0 : 1 }, results: [] },
      { success: true, meta: {}, results: rateLimited ? [] : [{ payload_hash: values.get(statements[1])![1] }] },
    ]);
    const env: PagesDynamicEnv = { ...assetsEnv().env, FEEDBACK_RATE_LIMIT_SECRET: 'synthetic-test-secret-at-least-32-characters', FEEDBACK_DB: {
      prepare: () => { const statement = { bind(...args: unknown[]) { values.set(statement, args); return statement; } }; return statement; }, batch,
    } };
    return { env, batch };
  }
  const id = '21926472-c435-4fe1-87c2-67d735a302bf';
  const contact = { submissionId: id, type: 'explanation', pagePath: '/salary/50000000', body: '표 설명을 확인해 주세요.', inquiryConsent: true };
  const feedback = { submissionId: id, target: 'samsung_bonus', vote: 'helpful', reason: null, feedbackConsent: true };
  function post(path: string, body: unknown, extraHeaders: Record<string, string> = {}) {
    return request(path, { method: 'POST', headers: { origin, 'content-type': 'application/json', 'cf-connecting-ip': '192.0.2.1', ...extraHeaders }, body: JSON.stringify(body) });
  }
  it.each([['/api/contact', contact], ['/api/feedback', feedback]] as const)('keeps successful receipt and rate-limited failure on %s', async (path, body) => {
    const { env, batch } = privateEnv();
    const response = await handlePagesDynamic(post(path, body), env);
    expect(response!.status).toBe(201);
    expect(await response!.json()).toEqual({ ok: true, receiptId: id, duplicate: false });
    expect(response!.headers.get('cache-control')).toBe('private, no-store');
    expect(batch).toHaveBeenCalledTimes(path === '/api/contact' ? 2 : 1);
    expect(batch.mock.calls.at(-1)![0]).toHaveLength(3);
    expect((await handlePagesDynamic(post(path, body), privateEnv(true).env))!.status).toBe(429);
  });
  it('rejects foreign origin, absent consent, missing binding or untrusted client IP without storage', async () => {
    const { env, batch } = privateEnv();
    expect((await handlePagesDynamic(post('/api/contact', contact, { origin: 'https://foreign.invalid' }), env))!.status).toBe(403);
    expect((await handlePagesDynamic(post('/api/contact', { ...contact, inquiryConsent: false }), env))!.status).toBe(400);
    expect((await handlePagesDynamic(post('/api/feedback', feedback, { 'cf-connecting-ip': '' }), env))!.status).toBe(503);
    expect((await handlePagesDynamic(post('/api/contact', contact), assetsEnv().env))!.status).toBe(503);
    expect(batch).not.toHaveBeenCalled();
  });
});

describe('Pages participation routes receive only the request environment', () => {
  const id = '21926472-c435-4fe1-87c2-67d735a302bf';
  function post(path: string, body: unknown) {
    return request(path, { method: 'POST', headers: { origin, 'content-type': 'application/json', 'cf-connecting-ip': '192.0.2.1' }, body: JSON.stringify(body) });
  }
  function participationEnv() {
    const generatedAt = Math.floor(Date.now() / 1000);
    const values = new WeakMap<FeedbackStatement, (string | number | null)[]>();
    const queries = new WeakMap<FeedbackStatement, string>();
    const receipts = new Map<string, Record<string, unknown>>();
    const batch = vi.fn(async (items: FeedbackStatement[]) => {
      const sql = queries.get(items[0]);
      if (items.length === 1) {
        const result = sql === PARTICIPATION_HEALTH_SQL ? { last_cleanup_at: generatedAt }
          : sql === PARTICIPATION_SUMMARY_SQL ? { contract_version: 'public-reaction-v1', generated_at: generatedAt, window_days: 28, total: 10, helpful: 8, confusing: 2 }
          : receipts.get(`${sql}:${values.get(items[0])![0]}`);
        return [{ success: true, meta: {}, results: result ? [result] : [] }];
      }
      const insert = values.get(items[1])!;
      const opinion = queries.get(items[1])!.includes('private_opinions');
      const row = { payload_hash: insert[1], contract_version: opinion ? 'private-opinion-v1' : 'public-reaction-v1' };
      receipts.set(`${opinion ? OPINION_RECEIPT_LOOKUP : REACTION_RECEIPT_LOOKUP}:${insert[0]}`, row);
      return items.map((_item, index) => ({ success: true, meta: { changes: index < 3 ? 1 : 0 }, results: index === 3 ? [row] : [] }));
    });
    const env: PagesDynamicEnv = { ...assetsEnv().env,
      PARTICIPATION_OPINIONS_ENABLED: '1', PARTICIPATION_REACTIONS_ENABLED: '1', PARTICIPATION_SUMMARY_ENABLED: '1',
      FEEDBACK_RATE_LIMIT_SECRET: 'synthetic-participation-secret-32-characters',
      FEEDBACK_DB: { prepare(sql) {
        const statement: FeedbackStatement = { bind(...args) { values.set(statement, args); return statement; } };
        queries.set(statement, sql); return statement;
      }, batch },
    };
    return { env, batch, generatedAt };
  }
  const opinion = { submissionId: id, contractVersion: 'private-opinion-v1', target: 'samsung_bonus', body: '설명을 고쳐 주세요', inquiryConsent: true };
  const reaction = { submissionId: id, contractVersion: 'public-reaction-v1', target: 'samsung_bonus', vote: 'helpful', reason: null, publicAggregateConsent: true };
  it('owns the three endpoints while defaulting every new module to unavailable', async () => {
    const { env, calls } = assetsEnv();
    for (const input of [post('/api/participation/opinions', opinion), post('/api/participation/reactions', reaction), request('/api/participation/summary?target=samsung_bonus')]) {
      const result = await handlePagesDynamic(input, env);
      expect(result!.status).toBe(503);
      expect(await result!.json()).toEqual({ ok: false, error: 'UNAVAILABLE' });
    }
    expect(calls).toHaveLength(0);
  });
  it.each([['/api/participation/opinions', opinion], ['/api/participation/reactions', reaction]] as const)('persists and replays %s with directly injected Pages bindings', async (path, value) => {
    const { env, batch } = participationEnv();
    const result = await handlePagesDynamic(post(path, value), env);
    expect(result!.status).toBe(201);
    expect(await result!.json()).toEqual({ ok: true, receiptId: id, duplicate: false });
    expect((await handlePagesDynamic(post(path, value), env))!.status).toBe(200);
    expect(batch.mock.calls.filter(([items]) => items.length === 4)).toHaveLength(1);
    const disabled = { ...env, PARTICIPATION_OPINIONS_ENABLED: '0', PARTICIPATION_REACTIONS_ENABLED: '0' };
    expect((await handlePagesDynamic(post(path, value), disabled))!.status).toBe(503);
  });
  it('enforces moderation inside the production Pages dispatch without writing the rejected body', async () => {
    const { env, batch } = participationEnv();
    const result = await handlePagesDynamic(post('/api/participation/opinions', { ...opinion, body: 'ㅅ\u200bㅂ' }), env);
    expect(await result!.json()).toEqual({ ok: false, error: 'CONTENT_NOT_ALLOWED' });
    expect(batch.mock.calls.every(([items]) => items.length === 1)).toBe(true);
  });
  it('returns only the current public count contract and responds to an independent summary switch', async () => {
    const { env, generatedAt } = participationEnv();
    const response = await handlePagesDynamic(request('/api/participation/summary?target=samsung_bonus'), env);
    expect(await response!.json()).toEqual({ ok: true, visible: true, total: 10, helpful: 8, confusing: 2, windowDays: 28, generatedAt });
    expect(response!.headers.get('cache-control')).toBe('no-store');
    expect((await handlePagesDynamic(request('/api/participation/summary?target=samsung_bonus'), { ...env, PARTICIPATION_SUMMARY_ENABLED: '0' }))!.status).toBe(503);
  });
});
