import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { generatePagesOg, collectExportedOgParams, loadOgStrips, main, OG_STRIP_BYTES, prebuiltOgParams } from '../../../scripts/generate-pages-og';
import { handlePagesOg, OG_FALLBACK_CACHE_CONTROL, OG_ROOT, ogImageKey, isValidPagesPng, type PagesOgEnv } from '../../../cloudflare/pages-og';
import { renderPagesOg, resolveOgContent } from '../../../cloudflare/pages-og-render';
import type { OgStripData } from '../../../cloudflare/pages-og-strips';
import { CURRENT_RATES_YEAR } from '@/config/currentRates';
import { normalizeOgParams, OG_CLIENT_CACHE_CONTROL, ogShareCardParams } from '@/lib/ogImageCache';
import { publicShareImageUrl, SHARE_ORIGIN } from '@/lib/sharePolicy';
import { assertPagesWorkerBundle } from '../../../scripts/lib/pages-export.mjs';
import { pagesWorkerEntrySource } from '../../../scripts/pages-build.mjs';

let out: string;
let strips: OgStripData;
let fallbackPng: Buffer;
const forbiddenFetch = vi.fn(() => { throw new Error('External network forbidden'); });
// A season page: its og:image comes from buildPageMetadata (path+title) while articleLd's
// JSON-LD image is a different type=guide URL. Both are real page cards (SEC-08).
const SEASON_JSON_LD_QUERY = 'type=guide&title=' + encodeURIComponent('2026 시즌 가이드 — 실제 제목');
const DECOY = '<script type="application/ld+json">{"image":"/api/og?title=decoy"}';
beforeAll(async () => {
  vi.stubGlobal('fetch', forbiddenFetch);
  out = mkdtempSync(join(tmpdir(), 'msy-pages-og-'));
  writeFileSync(join(out, 'index.html'), '<html><head><meta property="og:image" content="/api/og?type=tool&amp;name=삼성전자 성과급 계산기"><meta content="/api/og?lang=en&amp;title=Korea%20Salary" name="twitter:image"></head><body></body></html>');
  writeFileSync(join(out, 'season.html'), '<html><head><meta property="og:image" content="https://www.moneysalary.com/api/og?path=%2Fseason&amp;title=%EC%8B%9C%EC%A6%8C%20%EB%A9%94%ED%83%80"></head><body>'
    + `<!-- ${DECOY}</script> --><script>self.f='${DECOY}<\\/script>';</script><main>본문</main>`
    + `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: '2026 시즌 가이드',
      image: `https://www.moneysalary.com/api/og?${SEASON_JSON_LD_QUERY}`, publisher: { logo: { url: 'https://www.moneysalary.com/logo-full.png' } } })}</script></body></html>`);
  await generatePagesOg(out);
  strips = loadOgStrips().strips;
  fallbackPng = readFileSync(join(out, OG_ROOT.slice(1), 'fallback.png'));
}, 30000);
afterAll(() => {
  expect(forbiddenFetch).not.toHaveBeenCalled(); vi.unstubAllGlobals();
  if (out && resolve(out).startsWith(resolve(tmpdir()) + sep) && out.includes('msy-pages-og-')) rmSync(out, { recursive: true, force: true });
});
function assets() {
  const calls: string[] = [];
  const env: PagesOgEnv = { ASSETS: { fetch: async request => {
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
const imagePath = async (query: string) => `${OG_ROOT}/images/${await ogImageKey(params(query))}.png`;
// The pre-G2 branch on the raw (uncollapsed) path: the reference for identical share-card pixels.
const rawPathContent = (path: string, lang: string) => lang === 'en' ? { kind: 'en', title: 'Korea Salary Calculator' } : {
  kind: path.startsWith('/fun') ? 'fun' : path.startsWith('/insights') ? 'report' : path.startsWith('/guides') ? 'guide'
    : path.startsWith('/salary-db') ? 'company' : 'default', title: '연봉 실수령액 계산기' };
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

describe('build-time strip data and output (G2/PD-02)', () => {
  it('loads the exact pinned glyph and pool bytes for the build-time renderer', () => {
    const manifest = JSON.parse(readFileSync(resolve('vendor/og-strips/manifest.json'), 'utf8'));
    for (const [file, data] of [['pool.bin', strips.pool], ['glyphs-36.bin', strips.glyphs36], ['glyphs-64.bin', strips.glyphs64]] as const) {
      expect(data.byteLength).toBe(manifest.files[file].bytes);
      expect(data.byteLength).toBe(OG_STRIP_BYTES[file]);
      expect(createHash('sha256').update(new Uint8Array(data)).digest('hex')).toBe(manifest.files[file].sha256);
    }
  });
  it('writes no Worker module, only the prebuilt PNGs, the fallback, the license and a report', async () => {
    expect(existsSync(join(out, '_worker.js'))).toBe(false);
    const root = join(out, OG_ROOT.slice(1));
    expect(readdirSync(root).sort()).toEqual(['OFL.txt', 'build-manifest.json', 'fallback.png', 'images']);
    const expected = await Promise.all(prebuiltOgParams(out).map(query => ogImageKey(query).then(key => `${key}.png`)));
    expect(readdirSync(join(root, 'images')).sort()).toEqual([...new Set(expected)].sort());
    const report = JSON.parse(readFileSync(join(root, 'build-manifest.json'), 'utf8'));
    expect(report).toMatchObject({ version: 3, runtimeRender: false, workerModules: 0, preRenderedImages: expected.length, shareCardKeys: 10 });
    expect(isValidPagesPng(fallbackPng)).toBe(true);
  });
});

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
  it('collapses a path-only card to its kind with exactly the content the raw path selected', () => {
    for (const path of ['/', '/fun', '/fun-any', '/funding', '/fun/quiz/a', '/insights', '/insights/report-1', '/guides', '/guides/연봉',
      '/guidesx', '/salary-db', '/salary-db/compare/a-vs-b', '/salary', '/calc/samsung-bonus', '/en', '/en/guides/tax', '/x/fun', '']) {
      for (const lang of ['ko', 'en']) {
        const content = resolveOgContent(params(new URLSearchParams({ path, lang }).toString()));
        expect(content, `${lang} ${path}`).toEqual(rawPathContent(path, lang));
      }
    }
  });
});

describe('build-time strip renderer: real bitmap output and boundaries', () => {
  it.each(['', 'type=salary&amount=50000000&net=3300000', 'type=salary&amount=1000000000000&net=1000000000000',
    'type=tool&name=삼성 성과급 세후 12,345만원', 'type=guide&title=세금과 재테크', 'type=company&name=삼성전자',
    'type=fun&title=나의 머니 게임', 'type=report&title=연봉 데이터 리포트', 'lang=en&title=Korea salary tax and stocks',
    'title=' + '힣'.repeat(121), 'title=' + encodeURIComponent('한글 é 한자 漢字 😀 <style>')])('creates a valid indexed PNG for %s', query => {
    const raw = decodePng(renderPagesOg(params(query), strips));
    expect(raw.some(value => value >= 8)).toBe(true);
  });
  it('changes real amount and Samsung number pixels while preserving all pixels outside the title/pill regions', () => {
    for (const [before, after] of [
      ['type=salary&amount=50000000&net=3300000', 'type=salary&amount=51000000&net=3400000'],
      ['type=tool&name=삼성 성과급 세후 12,345만원', 'type=tool&name=삼성 성과급 세후 98,765만원'],
    ]) {
      const a = decodePng(renderPagesOg(params(before), strips));
      const b = decodePng(renderPagesOg(params(after), strips));
      let changed = 0;
      for (let y = 0; y < 630; y++) for (let x = 0; x < 1201; x++) {
        if (a[y * 1201 + x] !== b[y * 1201 + x]) { changed++; expect(y).toBeGreaterThan(177); expect(y).toBeLessThan(457); }
      }
      expect(changed).toBeGreaterThan(100);
    }
  });
  it.each(['type=salary&amount=1000000000000&net=1000000000000', 'type=tool&name=삼성 성과급 세후 12,345만원',
    'type=fun&title=한글 게임', 'lang=en&title=Korea salary calculator', 'type=guide&title=' + '힣'.repeat(121)])('produces one valid zlib stream with exact dimensions for %s', query => {
    const image = renderPagesOg(params(query), strips);
    expect(isValidPagesPng(image)).toBe(true);
    decodePng(image);
    expect(image.length).toBeLessThan(200000);
  });
  it('extracts HTML-escaped metadata without fetching it and requires an explicit output directory', async () => {
    expect(collectExportedOgParams(out).map(query => query.toString())).toContain('name=%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90+%EC%84%B1%EA%B3%BC%EA%B8%89+%EA%B3%84%EC%82%B0%EA%B8%B0&type=tool');
    await expect(main([])).rejects.toThrow('Usage');
  });
  it('prebuilds og:image, twitter:image and JSON-LD image URLs, never literals in comments or other scripts', () => {
    const inventory = collectExportedOgParams(out).map(query => query.toString()).sort();
    const expected = ['', 'type=tool&name=삼성전자 성과급 계산기', 'lang=en&title=Korea Salary', 'path=/season&title=시즌 메타', SEASON_JSON_LD_QUERY]
      .map(query => normalizeOgParams(params(query)).toString()).sort();
    expect(inventory).toEqual(expected);
    expect(inventory.join('\n')).not.toContain('decoy');
  });
  it('also prebuilds every share-button card key once, beside the exported page cards', () => {
    const share = ogShareCardParams().map(query => query.toString());
    expect(share).toEqual(['', 'path=%2Ffun', 'path=%2Finsights', 'path=%2Fguides', 'path=%2Fsalary-db',
      'lang=en', 'lang=en&path=%2Ffun', 'lang=en&path=%2Finsights', 'lang=en&path=%2Fguides', 'lang=en&path=%2Fsalary-db']);
    const all = prebuiltOgParams(out).map(query => query.toString());
    expect(new Set(all).size).toBe(all.length);
    expect(all.sort()).toEqual([...new Set([...collectExportedOgParams(out).map(query => query.toString()), ...share])].sort());
  });
});

describe('the Worker serves prebuilt cards only (G2/PD-02)', () => {
  const served = async (query: string, env = assets().env, init?: RequestInit) => {
    const response = await handlePagesOg(request(query, init), env);
    expect(response.status).toBe(200); expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, noimageindex, nofollow');
    expect(response.headers.get('X-OG-Error')).toBeNull();
    return { response, image: Buffer.from(await response.arrayBuffer()) };
  };
  const phishing = encodeURIComponent('[머니샐러리 공지] 환급금 지급 대상입니다 — 지금 신청');

  it('has no renderer, strip data, heavy dependency or network library in the bundled handler', async () => {
    const result = await build({ entryPoints: ['cloudflare/pages-og.ts'], bundle: true, write: false, platform: 'browser', format: 'esm', metafile: true });
    const inputs = Object.keys(result.metafile!.inputs).join('\n');
    expect(inputs).not.toMatch(/node_modules|next\/|react|satori|opennext|generateData|companyData/);
    expect(inputs).not.toMatch(/pages-og-(?:render|strips|inflate)|vendor\/og-/);
    expect(result.outputFiles[0].contents.length).toBeLessThan(15000);
  });
  it('the real Pages Worker entry bundles into one self-contained module without the OG renderer', async () => {
    const result = await build({ stdin: { contents: pagesWorkerEntrySource().replace('../cloudflare/', './cloudflare/'), resolveDir: resolve('.'), loader: 'js' },
      bundle: true, write: false, platform: 'browser', format: 'esm', target: 'es2022', metafile: true, minify: true, logLevel: 'silent',
      define: { __MSY_PAGES_MANIFEST__: '{}', 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_ADS_DISABLED': '"1"' } });
    expect(() => assertPagesWorkerBundle(result.metafile)).not.toThrow();
    expect(Object.keys(result.metafile!.inputs)).toContain('cloudflare/pages-og.ts');
    expect(result.outputFiles[0].contents.length).toBeLessThan(2 * 1024 * 1024);
    expect(() => assertPagesWorkerBundle({ ...result.metafile, inputs: { ...result.metafile!.inputs, 'cloudflare/pages-og-render.ts': { bytes: 1, imports: [] } } }))
      .toThrow(/build-time OG renderer/);
    expect(() => assertPagesWorkerBundle({ inputs: {}, outputs: { 'index.js': { imports: [{ path: './og/index.mjs', kind: 'import-statement', external: true }] } } }))
      .toThrow(/one self-contained module/);
  });
  it('serves a prebuilt image with one ASSETS read, and HEAD preserves headers without a body', async () => {
    const { env, calls } = assets();
    const response = await handlePagesOg(request('type=tool&name=삼성전자 성과급 계산기', { headers: { Cookie: 'private', Authorization: 'private' } }), env);
    expect(response.status).toBe(200); decodePng(new Uint8Array(await response.arrayBuffer()));
    expect(calls).toEqual([await imagePath('type=tool&name=삼성전자 성과급 계산기')]);
    expect(response.headers.get('Cache-Control')).toBe(OG_CLIENT_CACHE_CONTROL);
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, noimageindex, nofollow');
    expect(response.headers.get('X-OG-Fallback')).toBeNull(); expect(response.headers.get('X-OG-Cache')).toBe('UNAVAILABLE');
    const head = await handlePagesOg(request('', { method: 'HEAD' }), env);
    expect(head.status).toBe(200); expect((await head.arrayBuffer()).byteLength).toBe(0);
    expect(head.headers.get('X-OG-Fallback')).toBeNull();
  });
  it('serves prebuilt og:image and JSON-LD cards with their exact titles through one asset read', async () => {
    for (const [query, defaultQuery] of [['type=tool&name=삼성전자 성과급 계산기', 'type=tool'], [SEASON_JSON_LD_QUERY, 'type=guide'],
      ['path=/season&title=시즌 메타', 'path=/season'], ['lang=en&title=Korea Salary', 'lang=en']]) {
      const { env, calls } = assets();
      const { response, image } = await served(query, env);
      expect(calls).toEqual([await imagePath(query)]);
      expect(response.headers.get('X-OG-Fallback')).toBeNull();
      expect(image.equals(readFileSync(join(out, calls[0].slice(1))))).toBe(true);
      const pixels = decodePng(image);
      expect(pixels.equals(decodePng(renderPagesOg(params(query), strips)))).toBe(true);
      expect(pixels.equals(decodePng(renderPagesOg(params(defaultQuery), strips)))).toBe(false);
    }
  });
  it('serves every share-button card from a prebuilt asset with the pixels its raw path used to draw', async () => {
    const pages = ['/', '/calc/samsung-bonus', '/fun/quiz', '/insights/top100', '/guides/연봉-협상', '/salary-db/samsung-electronics',
      '/salary-db/compare/a-vs-b', '/salary/50000000', '/en', '/en/guides/tax', '/share/PRIVATE_TOKEN'];
    const keys = new Set(ogShareCardParams().map(query => query.toString()));
    for (const page of pages) for (const locale of ['ko', 'en'] as const) {
      const url = new URL(publicShareImageUrl(`${SHARE_ORIGIN}${page}`, locale));
      expect(url.origin + url.pathname).toBe(`${SHARE_ORIGIN}/api/og`);
      const query = url.search.slice(1);
      expect(keys.has(normalizeOgParams(params(query)).toString()), query).toBe(true);
      const { env, calls } = assets();
      const { response, image } = await served(query, env);
      expect(calls, query).toEqual([await imagePath(query)]);
      expect(response.headers.get('X-OG-Fallback'), query).toBeNull();
      // The strip renderer draws only OgContent, so the same content as the raw path means the same pixels.
      expect(resolveOgContent(params(query))).toEqual(rawPathContent(url.searchParams.get('path')!, url.searchParams.get('lang')!));
      expect(image.equals(fallbackPng)).toBe(false);
    }
  });
  it.each([
    ['type=company&name=' + phishing],
    ['type=company&name=Local%20release%20QA'],
    ['type=tool&name=' + phishing + '&title=' + phishing],
    ['type=guide&title=' + phishing],
    ['type=fun&title=' + phishing],
    ['type=report&title=' + phishing],
    ['title=' + phishing],
    ['lang=en&title=Claim%20your%20refund%20now'],
    ['path=/insights/x&title=' + phishing],
    ['type=salary&amount=58321000&net=4123400'],
    ['amount=61000000'],
    ['type=company'],
    ['type=tool&name=' + encodeURIComponent('삼성전자 성과급 계산기 (옛 제목)')],
  ])('a key the build does not prebuild gets the generic fallback card: %s', async query => {
    const { env, calls } = assets();
    const { response, image } = await served(query, env);
    expect(calls).toEqual([await imagePath(query), `${OG_ROOT}/fallback.png`]);
    expect(image.equals(fallbackPng)).toBe(true);
    expect(response.headers.get('X-OG-Fallback')).toBe('not-prebuilt');
    expect(response.headers.get('Cache-Control')).toBe(OG_FALLBACK_CACHE_CONTROL);
    expect(response.headers.get('X-OG-Cache')).toBeNull();
    const head = await handlePagesOg(request(query, { method: 'HEAD' }), assets().env);
    expect(head.status).toBe(200); expect((await head.arrayBuffer()).byteLength).toBe(0);
    expect(head.headers.get('X-OG-Fallback')).toBe('not-prebuilt');
  });
  it('an asset failure also falls back, marked with X-OG-Error, and never as a long-lived image', async () => {
    const corrupt = Buffer.from(readFileSync(join(out, (await imagePath('')).slice(1)))); corrupt[100] ^= 1;
    for (const built of [() => new Response('boom', { status: 500 }), () => new Response('<html>', { headers: { 'Content-Type': 'text/html' } }),
      () => new Response(corrupt, { headers: { 'Content-Type': 'image/png' } }), () => { throw new TypeError('asset binding failed'); }]) {
      const fetch = vi.fn(async (input: Request) => new URL(input.url).pathname.endsWith('/fallback.png')
        ? new Response(new Uint8Array(fallbackPng), { headers: { 'Content-Type': 'image/png' } }) : built());
      const response = await handlePagesOg(request(''), { ASSETS: { fetch } });
      expect(response.status).toBe(200); expect(fetch).toHaveBeenCalledTimes(2);
      expect(Buffer.from(await response.arrayBuffer()).equals(fallbackPng)).toBe(true);
      expect(response.headers.get('X-OG-Fallback')).toBe('asset-error');
      expect(response.headers.get('X-OG-Error')).toBe('OG asset unavailable');
      expect(response.headers.get('Cache-Control')).toBe(OG_FALLBACK_CACHE_CONTROL);
    }
  });
  it('method rejection never touches assets and a missing fallback fails without a blank image', async () => {
    const fetch = vi.fn(async () => new Response('bad', { status: 404 }));
    const env = { ASSETS: { fetch } };
    expect((await handlePagesOg(request('', { method: 'POST' }), env)).status).toBe(405);
    expect(fetch).not.toHaveBeenCalled();
    const error = await handlePagesOg(request('title=uncached'), env);
    expect(error.status).toBe(503); expect(error.headers.get('Cache-Control')).toBe('no-store');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('rejects the old two-byte fake PNG, checksum corruption, truncated IEND and corrupt fallback/cache entries', async () => {
    expect(isValidPagesPng(fallbackPng)).toBe(true);
    const fake = new Uint8Array(120); fake.set([137,80]);
    const broken = new Uint8Array(fallbackPng); broken[100] ^= 1;
    for (const body of [fake, broken, fallbackPng.subarray(0, fallbackPng.length - 1)]) expect(isValidPagesPng(body)).toBe(false);
    const cache = { match: vi.fn(async () => new Response(fake, { headers: { 'Content-Type': 'image/png' } })), put: vi.fn() };
    vi.stubGlobal('caches', { default: cache });
    try {
      const response = await handlePagesOg(request('title=corrupt'), { ASSETS: { fetch: async () => new Response(fake, { headers: { 'Content-Type': 'image/png' } }) } });
      expect(response.status).toBe(503); expect(response.headers.get('Cache-Control')).toBe('no-store'); expect(cache.put).not.toHaveBeenCalled();
    } finally { vi.stubGlobal('caches', undefined); }
  });
  it('stores only prebuilt cards in the colo cache, and a hit needs no asset read', async () => {
    const stored = new Map<string, Uint8Array<ArrayBuffer>>();
    const cache = {
      match: vi.fn(async (key: Request) => stored.has(key.url) ? new Response(stored.get(key.url), { headers: { 'Content-Type': 'image/png' } }) : undefined),
      put: vi.fn(async (key: Request, response: Response) => {
        expect(response.headers.get('Cache-Control')).toBe('public, max-age=2592000');
        stored.set(key.url, new Uint8Array(await response.arrayBuffer()));
      }),
    };
    vi.stubGlobal('caches', { default: cache });
    try {
      const unknown = 'type=guide&title=' + phishing;
      const fallback = await handlePagesOg(request(unknown), assets().env);
      expect(fallback.headers.get('X-OG-Fallback')).toBe('not-prebuilt');
      expect(Buffer.from(await fallback.arrayBuffer()).equals(fallbackPng)).toBe(true);
      expect(cache.put).not.toHaveBeenCalled();
      const query = 'type=tool&name=삼성전자 성과급 계산기';
      const miss = await handlePagesOg(request(query), assets().env);
      expect(miss.headers.get('X-OG-Cache')).toBe('MISS');
      expect([...stored.keys()]).toEqual([`https://og-test.invalid${await imagePath(query)}`]);
      const hit = await handlePagesOg(request(query), { ASSETS: { fetch: async () => { throw new Error('a hit must not read assets'); } } });
      expect(hit.headers.get('X-OG-Cache')).toBe('HIT'); expect(hit.headers.get('Cache-Control')).toBe(OG_CLIENT_CACHE_CONTROL);
      expect(Buffer.from(await hit.arrayBuffer()).equals(Buffer.from(await (await handlePagesOg(request(query), assets().env)).arrayBuffer()))).toBe(true);
    } finally { vi.stubGlobal('caches', undefined); }
  });
});
