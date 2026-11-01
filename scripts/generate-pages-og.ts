// Build-only: expands reviewed raster assets and renders the finite set of prebuilt OG cards.
// This does not execute exported HTML or import the application/Next renderer. The Worker draws
// nothing (G2/PD-02): it serves these PNGs, and fallback.png for every other parameter set.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { gunzipSync, inflateSync, deflateSync, crc32 } from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { OG_ROOT, ogImageKey, isValidPagesPng } from '../cloudflare/pages-og';
import { renderPagesOg } from '../cloudflare/pages-og-render';
import type { OgStripData } from '../cloudflare/pages-og-strips';
import { normalizeOgParams, ogShareCardParams } from '../src/lib/ogImageCache';
import { readStaticExportHead, readStaticExportJsonLd } from './lib/static-export-head';

type FileInfo = { bytes: number; sha256: string; gzipBytes: number; gzipSha256: string };
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/** Reviewed expanded sizes; vendor/og-strips/manifest.json pins the same files with hashes. */
export const OG_STRIP_BYTES = Object.freeze({ 'pool.bin': 38907807, 'glyphs-36.bin': 4923628, 'glyphs-64.bin': 8059908 });
const hash = (data: Uint8Array) => createHash('sha256').update(data).digest('hex');
function decodeHtml(value: string) {
  return value.replace(/&(?:amp|quot|apos|lt|gt);|&#(?:x[0-9a-f]+|\d+);/gi, entity => {
    if (entity.startsWith('&#')) {
      const point = entity[2].toLowerCase() === 'x' ? Number.parseInt(entity.slice(3, -1), 16) : Number(entity.slice(2, -1));
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : '\ufffd';
    }
    return ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' } as Record<string, string>)[entity.toLowerCase()];
  });
}

export function collectExportedOgParams(out: string): URLSearchParams[] {
  const values = new Map<string, URLSearchParams>();
  const add = (params: URLSearchParams) => { const normalized = normalizeOgParams(params); values.set(normalized.toString(), normalized); };
  // JSON-LD images (Article.image of guides, season pages and reports) are real page cards
  // too. The Worker draws no card at all (G2/PD-02), so every exported /api/og URL in
  // structured data is prebuilt with its exact title, like og:image and twitter:image.
  const addJsonLd = (node: unknown): void => {
    if (Array.isArray(node)) { node.forEach(addJsonLd); return; }
    if (node && typeof node === 'object') { Object.values(node).forEach(addJsonLd); return; }
    if (typeof node !== 'string' || !node.includes('/api/og')) return;
    let url: URL;
    try { url = new URL(node, 'https://og-build.invalid'); } catch { return; }
    if (url.pathname === '/api/og' || url.pathname === '/api/og/') add(url.searchParams);
  };
  add(new URLSearchParams());
  const visit = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error('Symlinks are not accepted in Pages OG export input');
      if (entry.isDirectory()) { if (!['_msy', '_next', '_worker.js'].includes(entry.name)) visit(join(directory, entry.name)); continue; }
      if (!entry.name.endsWith('.html')) continue;
      const file = join(directory, entry.name);
      for (const tag of readStaticExportHead(file).metaTags) {
        const attributes = new Map([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m => [m[1].toLowerCase(), decodeHtml(m[2] ?? m[3])]));
        if (attributes.get('property') !== 'og:image' && attributes.get('name') !== 'twitter:image') continue;
        const content = attributes.get('content');
        if (!content) continue;
        const url = new URL(content, 'https://og-build.invalid');
        if (url.pathname !== '/api/og' && url.pathname !== '/api/og/') continue;
        add(url.searchParams);
      }
      readStaticExportJsonLd(file).forEach(addJsonLd);
    }
  };
  visit(out);
  if (values.size > 10000) throw new Error('OG pre-render inventory exceeds reviewed bound');
  return [...values.values()];
}

/** Exported page cards plus every share-button card key (G2/PD-02), without duplicates. */
export function prebuiltOgParams(out: string): URLSearchParams[] {
  const values = new Map(collectExportedOgParams(out).map(params => [params.toString(), params] as const));
  for (const params of ogShareCardParams()) values.set(params.toString(), params);
  return [...values.values()];
}

/** Hash-verified strip data for the build-time renderer. Nothing loaded here reaches the Worker. */
export function loadOgStrips(): { strips: OgStripData; rawBytes: number; fontSha256: string } {
  const vendor = join(REPO, 'vendor/og-strips');
  const manifest = JSON.parse(readFileSync(join(vendor, 'manifest.json'), 'utf8')) as {
    version: number; files: Record<string, FileInfo>;
  };
  const provenance = JSON.parse(readFileSync(join(REPO, 'vendor/og-font/provenance.json'), 'utf8'));
  if (manifest.version !== 1 || Object.keys(manifest.files).sort().join(',') !== 'config.json,glyphs-36.bin,glyphs-64.bin,pool.bin') throw new Error('Unexpected OG strip manifest');
  if (hash(readFileSync(join(REPO, 'vendor/og-font/NotoSansKR.ttf'))) !== provenance.fontSha256 ||
      hash(readFileSync(join(REPO, 'vendor/og-font/OFL.txt'))) !== provenance.licenseSha256) throw new Error('OG font/license integrity mismatch');
  let rawBytes = 0;
  const dataFiles = new Map<string, Buffer>();
  for (const [name, info] of Object.entries(manifest.files)) {
    if (info.bytes > 48 * 1024 * 1024) throw new Error('Unexpected OG data size');
    const packed = readFileSync(join(vendor, name + '.gz'));
    if (packed.length !== info.gzipBytes || hash(packed) !== info.gzipSha256) throw new Error(`OG archive mismatch: ${name}`);
    const data = gunzipSync(packed, { maxOutputLength: info.bytes });
    if (data.length !== info.bytes || hash(data) !== info.sha256) throw new Error(`OG bitmap mismatch: ${name}`);
    if (name.endsWith('.bin') && data.length !== OG_STRIP_BYTES[name as keyof typeof OG_STRIP_BYTES]) throw new Error('Unreviewed OG binary size');
    dataFiles.set(name, data); rawBytes += data.length;
  }
  if (rawBytes > 52 * 1024 * 1024) throw new Error('OG expanded data exceeds the reviewed build memory budget');
  const exactBuffer = (name: string) => { const buffer = dataFiles.get(name)!; return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer; };
  const config = JSON.parse(dataFiles.get('config.json')!.toString('utf8'));
  return { strips: { pool: exactBuffer('pool.bin'), glyphs36: exactBuffer('glyphs-36.bin'), glyphs64: exactBuffer('glyphs-64.bin'), config },
    rawBytes, fontSha256: provenance.fontSha256 };
}

export async function generatePagesOg(outDir: string) {
  if (!outDir?.trim()) throw new Error('An explicit --out <stage/out> directory is required');
  const out = resolve(outDir);
  if (!existsSync(out)) throw new Error('OG generation requires the existing export directory');
  const root = join(out, OG_ROOT.slice(1));
  const { strips, rawBytes, fontSha256 } = loadOgStrips();
  mkdirSync(join(root, 'images'), { recursive: true });
  if (readdirSync(root).some(name => name.endsWith('.bin'))) throw new Error('Stale bitmap output: use a fresh owned export directory');
  copyFileSync(join(REPO, 'vendor/og-font/OFL.txt'), join(root, 'OFL.txt'));
  const params = prebuiltOgParams(out);
  let pngBytes = 0;
  for (const query of params) {
    const png = optimizeBuildPng(renderPagesOg(query, strips));
    writeFileSync(join(root, 'images', await ogImageKey(query) + '.png'), png); pngBytes += png.length;
  }
  // The generic card for every key the build does not prebuild (unknown parameter sets, old titles)
  // and for a missing/corrupt asset; the Worker labels it X-OG-Fallback with the short 300 s TTL.
  writeFileSync(join(root, 'fallback.png'), optimizeBuildPng(renderPagesOg(new URLSearchParams('lang=en&title=MoneySalary'), strips)));
  const report = { version: 3, root: OG_ROOT, runtimeRender: false, workerModules: 0, rawBytes,
    preRenderedImages: params.length, shareCardKeys: ogShareCardParams().length, pngBytes, fontSha256 };
  writeFileSync(join(root, 'build-manifest.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}

/** Recompress only at build time; pixels/palette stay exactly the strip renderer's. */
function optimizeBuildPng(png: Uint8Array): Buffer {
  if (!isValidPagesPng(png)) throw new Error('Invalid generated OG image');
  const source = Buffer.from(png);
  const saved: Buffer[] = [source.subarray(0, 8)];
  for (let at = 8; at < source.length;) {
    const length = source.readUInt32BE(at);
    const type = source.toString('ascii', at + 4, at + 8);
    if (type === 'IDAT') {
      const raw = inflateSync(source.subarray(at + 8, at + 8 + length), { maxOutputLength: 1201 * 630 });
      if (raw.length !== 1201 * 630) throw new Error('Invalid OG scanline count');
      const compressed = deflateSync(raw, { level: 9 });
      const chunk = Buffer.alloc(compressed.length + 12);
      chunk.writeUInt32BE(compressed.length, 0); chunk.write('IDAT', 4); compressed.copy(chunk, 8);
      chunk.writeUInt32BE(crc32(chunk.subarray(4, chunk.length - 4)), chunk.length - 4); saved.push(chunk);
    } else saved.push(source.subarray(at, at + 12 + length));
    at += 12 + length;
  }
  const result = Buffer.concat(saved);
  if (!isValidPagesPng(result)) throw new Error('Invalid optimized OG image');
  return result;
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.length !== 2 || argv[0] !== '--out' || !argv[1] || argv[1].startsWith('--')) throw new Error('Usage: generate-pages-og.ts --out <stage/out>');
  return generatePagesOg(argv[1]);
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().then(result => console.log(JSON.stringify(result))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
