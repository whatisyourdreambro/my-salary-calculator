// Small Pages Functions boundary: no Next/React/OpenNext, database catalog or tax engine.
import { handleContactPost } from '../src/lib/server/contactHandler';
import { handleFixedFeedbackPost } from '../src/lib/server/fixedFeedbackHandler';
import { handleOpinionPost } from '../src/lib/server/opinionHandler';
import { handleReactionPost } from '../src/lib/server/reactionHandler';
import { handleParticipationSummaryGet } from '../src/lib/server/participationSummaryHandler';
import type { ParticipationBindings } from '../src/lib/server/participationRuntime';
import { WIDGET_HEADERS } from '../src/app/widget/shared';
import type { SalaryData } from '../src/lib/generateData';

export interface PagesDynamicEnv extends ParticipationBindings {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const DATA_ROOT = '/_msy/data/v1';
const PAGE_SIZE = 100;
const TYPES = new Set(['annual', 'monthly', 'weekly', 'hourly']);
const COMPANY_ID = /^[a-z0-9-]{1,64}$/;
const ROW_KEYS = ['preTax', 'monthlyNet', 'health', 'employment', 'longTermCare', 'pension', 'incomeTax', 'localTax', 'totalDeduction'] as const;
const TABLE_HEADERS = { 'Cache-Control': 'public, s-maxage=86400', 'Content-Type': 'application/json' };

function failure(status: number, allow?: string, head = false): Response {
  const response = Response.json({ error: status === 405 ? 'METHOD_NOT_ALLOWED' : 'UNAVAILABLE' }, {
    status, headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow', ...(allow ? { Allow: allow } : {}) },
  });
  return head ? new Response(null, response) : response;
}

async function asset(request: Request, env: PagesDynamicEnv, path: string): Promise<Response> {
  // Only fixed internal paths are accepted by callers; credentials/query are never forwarded.
  const response = await env.ASSETS.fetch(new Request(new URL(path, request.url), { method: 'GET', redirect: 'manual' }));
  if (response.status !== 200) throw new Error('Missing generated Pages data');
  return response;
}

async function assetJson(request: Request, env: PagesDynamicEnv, path: string, maxBytes: number): Promise<unknown> {
  const response = await asset(request, env, path);
  const size = Number(response.headers.get('content-length'));
  if (size > maxBytes) throw new Error('Generated Pages data exceeds size bound');
  // Generated files are trusted build assets, but cap the read even if the binding is misconfigured.
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Missing generated Pages data body');
  const buffer = new Uint8Array(maxBytes);
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value.byteLength > maxBytes - length) throw new Error('Generated Pages data exceeds size bound');
      buffer.set(value, length);
      length += value.byteLength;
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, length)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function salaryTable(request: Request, env: PagesDynamicEnv, url: URL): Promise<Response> {
  const rawType = url.searchParams.get('type') || 'annual';
  const type = TYPES.has(rawType) ? rawType : 'annual';
  const index = await assetJson(request, env, `${DATA_ROOT}/salary/${type}/index.json`, 64 * 1024);
  if (!isRecord(index) || index.version !== 1 || index.pageSize !== PAGE_SIZE || !Array.isArray(index.preTax)
    || index.preTax.length > 3000 || !index.preTax.every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0)) {
    throw new Error('Invalid salary index');
  }
  const preTax = index.preTax as number[];
  const rawPage = Number(url.searchParams.get('page') ?? '1');
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const search = (url.searchParams.get('searchTerm') || '').replace(/,/g, '');
  const matches: number[] = [];
  for (let i = 0; i < preTax.length; i++) if (!search || preTax[i].toString().includes(search)) matches.push(i);
  const totalPages = Math.ceil(matches.length / PAGE_SIZE);
  const selected = page > totalPages ? [] : matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const chunks = new Map<number, SalaryData[]>();
  for (const rowId of selected) {
    const chunkId = Math.floor(rowId / PAGE_SIZE);
    if (chunks.has(chunkId)) continue;
    const data = await assetJson(request, env, `${DATA_ROOT}/salary/${type}/page-${chunkId + 1}.json`, 64 * 1024);
    const expected = Math.min(PAGE_SIZE, preTax.length - chunkId * PAGE_SIZE);
    if (!Array.isArray(data) || data.length !== expected || !data.every((row, i) => isRecord(row)
      && Object.keys(row).length === ROW_KEYS.length
      && ROW_KEYS.every(key => typeof row[key] === 'number' && Number.isFinite(row[key]))
      && row.preTax === preTax[chunkId * PAGE_SIZE + i])) throw new Error('Invalid salary chunk');
    chunks.set(chunkId, data as SalaryData[]);
  }
  const data = selected.map(id => {
    const row = chunks.get(Math.floor(id / PAGE_SIZE))![id % PAGE_SIZE];
    return { ...row, monthlyNet: Math.max(0, row.monthlyNet) };
  });
  return Response.json({ data, totalPages }, { headers: TABLE_HEADERS });
}

async function companyWidget(request: Request, env: PagesDynamicEnv, url: URL): Promise<Response> {
  const id = url.searchParams.get('id') ?? '';
  const index = await assetJson(request, env, `${DATA_ROOT}/company/index.json`, 128 * 1024);
  if (!isRecord(index) || index.version !== 1 || !Array.isArray(index.ids) || index.ids.length > 5000
    || !index.ids.every(value => typeof value === 'string' && COMPANY_ID.test(value))) throw new Error('Invalid company index');
  const known = COMPANY_ID.test(id) && index.ids.includes(id);
  const response = await asset(request, env, `${DATA_ROOT}/company/${known ? id : 'fallback'}.body`);
  return new Response(response.body, { headers: WIDGET_HEADERS });
}

/** Returns null only when another route owns the request. Root applies the body limit before this call. */
export async function handlePagesDynamic(request: Request, env: PagesDynamicEnv): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  if (path === '/api/contact') return request.method === 'POST' ? handleContactPost(request, env) : failure(405, 'POST', request.method === 'HEAD');
  if (path === '/api/feedback') return request.method === 'POST' ? handleFixedFeedbackPost(request, env) : failure(405, 'POST', request.method === 'HEAD');
  if (path === '/api/participation/opinions') return request.method === 'POST' ? handleOpinionPost(request, env) : failure(405, 'POST', request.method === 'HEAD');
  if (path === '/api/participation/reactions') return request.method === 'POST' ? handleReactionPost(request, env) : failure(405, 'POST', request.method === 'HEAD');
  if (path === '/api/participation/summary') return request.method === 'GET' ? handleParticipationSummaryGet(request, env) : failure(405, 'GET', request.method === 'HEAD');
  if (path !== '/api/salary-table' && path !== '/widget/company') return null;
  if (request.method !== 'GET' && request.method !== 'HEAD') return failure(405, 'GET, HEAD');
  try {
    const response = path === '/api/salary-table'
      ? await salaryTable(request, env, url) : await companyWidget(request, env, url);
    return request.method === 'HEAD' ? new Response(null, response) : response;
  } catch { return failure(503, undefined, request.method === 'HEAD'); }
}
