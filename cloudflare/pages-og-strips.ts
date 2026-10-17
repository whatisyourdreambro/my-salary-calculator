// Bounded PNG encoder using independent, precompressed scanline
// blocks. It performs no bitmap scan, runtime font parsing or compression.
import type { OgContent } from './pages-og';

type Refs = { full: number[]; prefix: number[]; suffix: number[]; pillPrefix: number[]; pillSuffix: number[] };
export interface StripConfig {
  version: number; maxCodepoint: number;
  templates: Record<string, Refs>; palettes: Record<string, number[]>;
  fill: Record<string, number[]>; pill: Record<string, { width: number; rows: number[] }>;
}
export interface OgStripData { pool: ArrayBuffer; glyphs36: ArrayBuffer; glyphs64: ArrayBuffer; config: StripConfig }
type Cell = { width: number; rows: (row: number) => number };
type Line = { y: number; x: number; width: number; height: number; cells: Cell[]; pill: boolean };
const CRC = new Uint32Array(256);
for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c; }
function pngChunk(type: string, body: Uint8Array) {
  const data = new Uint8Array(body.length + 12);
  const view = new DataView(data.buffer);
  view.setUint32(0, body.length);
  for (let i = 0; i < 4; i++) data[i + 4] = type.charCodeAt(i);
  data.set(body, 8);
  let value = 0xffffffff;
  for (let i = 4; i < data.length - 4; i++) value = CRC[(value ^ data[i]) & 255] ^ (value >>> 8);
  view.setUint32(data.length - 4, (value ^ 0xffffffff) >>> 0);
  return data;
}

export function renderStripPng(content: OgContent, data: OgStripData): Uint8Array<ArrayBuffer> {
  const { config } = data;
  if (config.version !== 1) throw new Error('Invalid OG strips version');
  const kind = content.kind === 'salary' && content.net ? 'salary-net' : content.kind;
  const template = config.templates[kind];
  const palette = config.palettes[kind];
  if (!template || palette.length !== 768) throw new Error('Missing OG strip template');
  const allLines: Line[] = [];
  const draw = (text: string, size: 36 | 64, box: { x: number; y: number; width: number; height: number; left?: boolean; pill?: boolean }) => {
    const chars = Array.from(text.normalize('NFC'));
    if (chars.length > 121) throw new Error('OG text bound exceeded');
    const glyphs = new DataView(size === 36 ? data.glyphs36 : data.glyphs64);
    const lineHeight = Math.ceil(size * 1.25);
    const cells = chars.map(char => {
      if (box.pill) {
        const glyph = config.pill[char];
        if (!glyph) throw new Error('Unexpected salary pill character');
        return { width: glyph.width, rows: (row: number) => glyph.rows[row] };
      }
      const point = char.codePointAt(0)!;
      const pointer = (point <= config.maxCodepoint ? glyphs.getUint32(point * 4, true) : 0) || glyphs.getUint32(0, true);
      if (pointer < (config.maxCodepoint + 1) * 4 || pointer + 4 + lineHeight * 4 > glyphs.byteLength) throw new Error('Invalid OG strip glyph pointer');
      const width = glyphs.getUint16(pointer, true);
      if (width > size || glyphs.getUint16(pointer + 2, true) !== lineHeight) throw new Error('Invalid OG strip glyph size');
      return { width, rows: (row: number) => glyphs.getUint32(pointer + 4 + row * 4, true) };
    });
    const rows: Cell[][] = [];
    let row: Cell[] = [], width = 0;
    for (const cell of cells) {
      if (row.length && width + cell.width > box.width) { rows.push(row); row = []; width = 0; }
      row.push(cell); width += cell.width;
    }
    if (row.length) rows.push(row);
    if (rows.length * lineHeight > box.height) throw new Error('OG strip text exceeds layout');
    let y = box.y + Math.floor((box.height - rows.length * lineHeight) / 2);
    for (const cells of rows) {
      const width = cells.reduce((sum, cell) => sum + cell.width, 0);
      allLines.push({ y, x: box.x + (box.left ? 0 : Math.floor((box.width - width) / 2)), width, height: lineHeight, cells, pill: Boolean(box.pill) });
      y += lineHeight;
    }
  };
  if (content.kind === 'salary') {
    draw(content.label!, 36, { x: 150, y: 105, width: 900, height: 65 });
    draw(content.title, 64, { x: 130, y: 183, width: 940, height: 100 });
    if (content.net) draw(content.net, 64, { x: 220, y: 358, width: 760, height: 96, pill: true });
  } else {
    const size = Array.from(content.title.normalize('NFC')).length <= 39 ? 64 : 36;
    draw(content.title, size, { x: 140, y: 178, width: 920, height: 260, left: content.kind === 'guide' });
  }
  allLines.sort((a, b) => a.y - b.y);
  const pool = new Uint8Array(data.pool);
  const poolView = new DataView(data.pool);
  const refs = new Uint32Array(15000);
  let count = 0, bytes = 0, rawBytes = 0, adlerA = 1, adlerB = 0;
  const append = (pointer: number) => {
    if (!Number.isInteger(pointer) || pointer < 0 || pointer + 8 > pool.length || count >= refs.length) throw new Error('Invalid OG strip pointer/count');
    const raw = poolView.getUint16(pointer, true), length = poolView.getUint16(pointer + 2, true);
    const adler = poolView.getUint32(pointer + 4, true);
    if (pointer + 8 + length > pool.length) throw new Error('Invalid OG strip length');
    // zlib adler32_combine, with each independent segment starting at a=1,b=0.
    adlerB = (adlerB + (adler >>> 16) + (adlerA - 1) * raw) % 65521;
    adlerA = (adlerA + (adler & 65535) - 1) % 65521;
    refs[count++] = pointer; bytes += length; rawBytes += raw;
  };
  let active = 0;
  for (let y = 0; y < 630; y++) {
    while (active < allLines.length && y >= allLines[active].y + allLines[active].height) active++;
    const line = allLines[active];
    if (!line || y < line.y) { append(template.full[y]); continue; }
    const left = line.pill ? 220 : 128, right = line.pill ? 980 : 1072;
    const fill = config.fill[line.pill ? '4' : '1'];
    if (line.x < left || line.x + line.width > right) throw new Error('OG strip outside flat card');
    append(line.pill ? template.pillPrefix[y] : template.prefix[y]);
    append(fill[line.x - left]);
    for (const cell of line.cells) append(cell.rows(y - line.y));
    append(fill[right - line.x - line.width]);
    append(line.pill ? template.pillSuffix[y] : template.suffix[y]);
  }
  if (rawBytes !== 1201 * 630 || bytes > 1024 * 1024) throw new Error('OG strip stream bound mismatch');
  const deflate = new Uint8Array(2 + bytes + 5 + 4);
  deflate.set([0x78, 0x01]);
  let offset = 2;
  for (let i = 0; i < count; i++) {
    const pointer = refs[i], length = poolView.getUint16(pointer + 2, true);
    deflate.set(pool.subarray(pointer + 8, pointer + 8 + length), offset); offset += length;
  }
  // Each build-time Z_FULL_FLUSH segment is nonfinal and byte aligned. Finish the
  // single continuous zlib stream with an empty final stored block and Adler sum.
  deflate.set([1, 0, 0, 255, 255], offset); offset += 5;
  new DataView(deflate.buffer).setUint32(offset, (((adlerB < 0 ? adlerB + 65521 : adlerB) << 16) | (adlerA < 0 ? adlerA + 65521 : adlerA)) >>> 0);
  const ihdr = new Uint8Array(13); const iv = new DataView(ihdr.buffer);
  iv.setUint32(0, 1200); iv.setUint32(4, 630); ihdr[8] = 8; ihdr[9] = 3;
  const parts = [new Uint8Array([137,80,78,71,13,10,26,10]), pngChunk('IHDR', ihdr), pngChunk('PLTE', Uint8Array.from(palette)), pngChunk('IDAT', deflate), pngChunk('IEND', new Uint8Array())];
  const png = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0)); offset = 0;
  for (const part of parts) { png.set(part, offset); offset += part.length; }
  return png;
}
