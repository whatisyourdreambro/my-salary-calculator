import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { generatePagesOg, collectExportedOgParams, main } from '../../../scripts/generate-pages-og';
import { handlePagesOg, OG_ROOT, ogImageKey, renderPagesOg, resolveOgContent, isValidPagesPng, type PagesOgEnv } from '../../../cloudflare/pages-og';
import type { OgStripData } from '../../../cloudflare/pages-og-strips';
import { CURRENT_RATES_YEAR } from '@/config/currentRates';
import { inflateOgChunks } from '../../../cloudflare/pages-og-inflate.mjs';
import { OG_POOL_MODULES, OG_RAW_MODULE_BYTES } from '../../../scripts/lib/pages-export.mjs';

let out: string;
let runtimeStrips: OgStripData;
const forbiddenFetch = vi.fn(() => { throw new Error('External network forbidden'); });
beforeAll(async () => {
  vi.stubGlobal('fetch', forbiddenFetch);
  out = mkdtempSync(join(tmpdir(), 'msy-pages-og-'));
  writeFileSync(join(out, 'index.html'), '<html><head><meta property="og:image" content="/api/og?type=tool&amp;name=삼성전자 성과급 계산기"><meta content="/api/og?lang=en&amp;title=Korea%20Salary" name="twitter:image"></head><body></body></html>');
  await generatePagesOg(out);
  const load = (name: string) => new Uint8Array(readFileSync(join(out, '_worker.js/og', name))).buffer;
  const configSource = readFileSync(join(out, '_worker.js/og/config.mjs'), 'utf8');
  runtimeStrips = { pool: inflateOgChunks(OG_RAW_MODULE_BYTES['pool.bin'], OG_POOL_MODULES.map((name: string) => load(name.slice(3)))),
    glyphs36: inflateOgChunks(OG_RAW_MODULE_BYTES['glyphs-36.bin'], [load('glyphs-36.bin')], 8 * 1024 * 1024),
    glyphs64: inflateOgChunks(OG_RAW_MODULE_BYTES['glyphs-64.bin'], [load('glyphs-64.bin')], 8 * 1024 * 1024),
    config: JSON.parse(configSource.slice(configSource.indexOf('export default ') + 15).trim().slice(0, -1)) };
}, 30000);
afterAll(() => {
  expect(forbiddenFetch).not.toHaveBeenCalled(); vi.unstubAllGlobals();
  if (out && resolve(out).startsWith(resolve(tmpdir()) + sep) && out.includes('msy-pages-og-')) rmSync(out, { recursive: true, force: true });
});
it('generated startup archives restore the exact pinned glyph and pool bytes', () => {
  const manifest = JSON.parse(readFileSync(resolve('vendor/og-strips/manifest.json'), 'utf8'));
  for (const [file, data] of [['pool.bin', runtimeStrips.pool], ['glyphs-36.bin', runtimeStrips.glyphs36],
    ['glyphs-64.bin', runtimeStrips.glyphs64]] as const) {
    expect(data.byteLength).toBe(manifest.files[file].bytes);
    expect(createHash('sha256').update(new Uint8Array(data)).digest('hex')).toBe(manifest.files[file].sha256);
  }
});
function assets() {
  const calls: string[] = [];
  const env: PagesOgEnv = { OG_STRIPS: runtimeStrips, ASSETS: { fetch: async request => {
    const url = new URL(request.url); calls.push(url.pathname);
    expect(url.search).toBe(''); expect([...request.headers]).toEqual([]);
    expect(request.redirect).toBe('manual');
    expect(url.pathname).toMatch(/^\/_msy\/og\/v1\/[a-z0-9/.-]+$/);
    const target = resolve(out, '.' + url.pathname);
    expect(target.startsWith(resolve(out) + sep)).toBe(true);
    try { return new Response(readFileSync(target), { headers: { 'Content-Type': target.endsWith('.png') ? 'image/png' : 'application/octet-stream' } }); }
    catch { return new Response('missing', { status: 404 }); }
  } } };
  return { env, calls };
}
const params = (query: string) => new URLSearchParams(query);
const request = (query = '', init?: RequestInit) => new Request('https://og-test.invalid/api/og?' + query, init);
function decodePng(png: Uint8Array) {
  expect([...png.subarray(0, 8)]).toEqual([137,80,78,71,13,10,26,10]);
  const chunks: Uint8Array[] = [];
  let palette: Uint8Array | undefined;
  for (let at = 8; at < png.length;) {
    const view = new DataView(png.buffer, png.byteOffset + at, png.length - at);
    const length = view.getUint32(0);
    const type = new TextDecoder().decode(png.subarray(at + 4, at + 8));
    expect(at + length + 12).toBeLessThanOrEqual(png.length);
    // Independent bitwise CRC implementation, not the production lookup table.
    let crc = 0xffffffff;
    for (const byte of png.subarray(at + 4, at + 8 + length)) {
      crc ^= byte;
      for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    expect(view.getUint32(length + 8)).toBe((crc ^ 0xffffffff) >>> 0);
    const data = png.subarray(at + 8, at + 8 + length);
    if (type === 'IHDR') {
      expect(view.getUint32(8)).toBe(1200); expect(view.getUint32(12)).toBe(630);
      expect([...data.subarray(8)]).toEqual([8,3,0,0,0]);
    }
    if (type === 'PLTE') palette = data;
    if (type === 'IDAT') chunks.push(data);
    at += length + 12;
  }
  expect(palette?.length).toBe(768);
  const raw = inflateSync(Buffer.concat(chunks));
  expect(raw.length).toBe(1201 * 630);
  for (let y = 0; y < 630; y++) expect(raw[y * 1201]).toBe(0);
  return raw;
}

describe('Pages OG keeps normalized data and category decisions', () => {
  it.each([
    ['type=salary&amount=50004999&net=3395000', 'salary', '연봉 5,000만원', '월 340만원'],
    ['type=salary&amount=50005000&netPay=0', 'salary', '연봉 5,001만원', '월 0만원'],
    ['type=salary&amount=invalid&net=-1', 'salary', '연봉 5,000만원', undefined],
    ['amount=1000000000000&netPay=12000000', 'salary', '연봉 100,000,000만원', '월 1,200만원'],
    ['type=salary&lang=en&title=English', 'en', 'English', undefined],
    ['lang=en', 'en', 'Korea Salary Calculator', undefined],
    ['type=tool&name=삼성 성과급 세후 12,345만원', 'tool', '삼성 성과급 세후 12,345만원', undefined],
    ['type=company&name=회사&title=다른제목', 'company', '회사', undefined],
    ['type=guide&slug=ignored&title=가이드', 'guide', '가이드', undefined],
    ['path=/fun-any&title=게임', 'fun', '게임', undefined],
    ['path=/insights/a&title=리포트', 'report', '리포트', undefined],
    ['path=/guides/a&title=금융', 'guide', '금융', undefined],
    ['path=/salary-db/a&title=회사', 'company', '회사', undefined],
    ['type=__proto__&path=/other', 'default', '연봉 실수령액 계산기', undefined],
  ])('%s', (query, kind, title, net) => {
    const content = resolveOgContent(params(query));
    expect(content.kind).toBe(kind); expect(content.title).toBe(title); expect(content.net).toBe(net);
    if (kind === 'salary') expect(content.label).toBe(`${CURRENT_RATES_YEAR} 연봉 리포트`);
  });
  it('retains the exact 120-character + ellipsis rule and discards controls/irrelevant keys', async () => {
    const content = resolveOgContent(params('title=' + encodeURIComponent('\n' + '힣'.repeat(200) + '\0')));
    expect(content.title).toBe('힣'.repeat(120) + '…');
    expect(await ogImageKey(params('amount=50000001&v=old'))).toBe(await ogImageKey(params('amount=50000002&ad=ignored')));
    expect(await ogImageKey(params('amount=50010000'))).not.toBe(await ogImageKey(params('amount=50000000')));
  });
});

describe('real bitmap output, boundaries and cold path', () => {
  it.each(['', 'type=salary&amount=50000000&net=3300000', 'type=salary&amount=1000000000000&net=1000000000000',
    'type=tool&name=삼성 성과급 세후 12,345만원', 'type=guide&title=세금과 재테크', 'type=company&name=삼성전자',
    'type=fun&title=나의 머니 게임', 'type=report&title=연봉 데이터 리포트', 'lang=en&title=Korea salary tax and stocks',
    'title=' + '힣'.repeat(121), 'title=' + encodeURIComponent('한글 é 한자 漢字 😀 <style>')])('creates a valid indexed PNG for %s', async query => {
    const { env, calls } = assets();
    const png = await renderPagesOg(params(query), env);
    const raw = decodePng(png);
    expect(raw.some(value => value >= 8)).toBe(true);
    expect(calls.length).toBeLessThanOrEqual(36);
    expect(calls.every(path => path.startsWith(OG_ROOT + '/'))).toBe(true);
  });
  it('changes real amount and Samsung number pixels while preserving all pixels outside the title/pill regions', async () => {
    const { env } = assets();
    for (const [before, after] of [
      ['type=salary&amount=50000000&net=3300000', 'type=salary&amount=51000000&net=3400000'],
      ['type=tool&name=삼성 성과급 세후 12,345만원', 'type=tool&name=삼성 성과급 세후 98,765만원'],
    ]) {
      const a = decodePng(await renderPagesOg(params(before), env));
      const b = decodePng(await renderPagesOg(params(after), env));
      let changed = 0;
      for (let y = 0; y < 630; y++) for (let x = 0; x < 1201; x++) {
        if (a[y * 1201 + x] !== b[y * 1201 + x]) { changed++; expect(y).toBeGreaterThan(177); expect(y).toBeLessThan(457); }
      }
      expect(changed).toBeGreaterThan(100);
    }
  });
  it('serves a pre-rendered image with one ASSETS read, and HEAD preserves headers without a body', async () => {
    const { env, calls } = assets();
    const response = await handlePagesOg(request('type=tool&name=삼성전자 성과급 계산기', { headers: { Cookie: 'private', Authorization: 'private' } }), env);
    expect(response.status).toBe(200); decodePng(new Uint8Array(await response.arrayBuffer()));
    expect(calls).toHaveLength(1); expect(calls[0]).toMatch(/\/images\/[a-f0-9]{64}\.png$/);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=86400, s-maxage=86400');
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, noimageindex, nofollow');
    const head = await handlePagesOg(request('', { method: 'HEAD' }), env);
    expect(head.status).toBe(200); expect((await head.arrayBuffer()).byteLength).toBe(0);
  });
  it('method rejection never touches assets and broken assets fail without a long-lived blank image', async () => {
    const fetch = vi.fn(async () => new Response('bad', { status: 404 }));
    const env = { ASSETS: { fetch } };
    expect((await handlePagesOg(request('', { method: 'POST' }), env)).status).toBe(405);
    expect(fetch).not.toHaveBeenCalled();
    const error = await handlePagesOg(request('title=uncached'), env);
    expect(error.status).toBe(503); expect(error.headers.get('Cache-Control')).toBe('no-store');
  });
  it('rejects the old two-byte fake PNG, checksum corruption, truncated IEND and corrupt fallback/cache entries', async () => {
    const valid = readFileSync(join(out, OG_ROOT.slice(1), 'fallback.png'));
    expect(isValidPagesPng(valid)).toBe(true);
    const fake = new Uint8Array(120); fake.set([137,80]);
    const broken = new Uint8Array(valid); broken[100] ^= 1;
    for (const body of [fake, broken, valid.subarray(0, valid.length - 1)]) expect(isValidPagesPng(body)).toBe(false);
    const cache = { match: vi.fn(async () => new Response(fake, { headers: { 'Content-Type': 'image/png' } })), put: vi.fn() };
    vi.stubGlobal('caches', { default: cache });
    try {
      const response = await handlePagesOg(request('title=corrupt'), { ASSETS: { fetch: async () => new Response(fake, { headers: { 'Content-Type': 'image/png' } }) } });
      expect(response.status).toBe(503); expect(response.headers.get('Cache-Control')).toBe('no-store'); expect(cache.put).not.toHaveBeenCalled();
    } finally { vi.stubGlobal('caches', undefined); }
  });
  it('extracts HTML-escaped metadata without fetching it and requires an explicit output directory', async () => {
    expect(collectExportedOgParams(out).map(query => query.toString())).toContain('name=%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90+%EC%84%B1%EA%B3%BC%EA%B8%89+%EA%B3%84%EC%82%B0%EA%B8%B0&type=tool');
    await expect(main([])).rejects.toThrow('Usage');
  });
  it('has no heavy runtime dependency or network library in the actual bundled graph', async () => {
    const result = await build({ entryPoints: ['cloudflare/pages-og.ts'], bundle: true, write: false, platform: 'browser', format: 'esm', metafile: true });
    expect(Object.keys(result.metafile!.inputs).join('\n')).not.toMatch(/node_modules|next\/|react|satori|opennext|generateData|companyData/);
    expect(result.outputFiles[0].contents.length).toBeLessThan(50000);
  });
});

describe('precompressed row-strip runtime', () => {
  it.each(['type=salary&amount=1000000000000&net=1000000000000', 'type=tool&name=삼성 성과급 세후 12,345만원',
    'type=fun&title=한글 게임', 'lang=en&title=Korea salary calculator', 'type=guide&title=' + '힣'.repeat(121)])('produces one valid zlib stream with exact dimensions for %s', async query => {
    const fetch = vi.fn(() => { throw new Error('Strip renderer must use only immutable Data modules'); });
    const image = await renderPagesOg(params(query), { ASSETS: { fetch }, OG_STRIPS: runtimeStrips });
    expect(isValidPagesPng(image)).toBe(true);
    decodePng(image);
    expect(image.length).toBeLessThan(200000);
    expect(fetch).not.toHaveBeenCalled();
  });
});
