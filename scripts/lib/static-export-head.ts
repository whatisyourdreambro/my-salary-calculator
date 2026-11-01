// Build-only parser for Next's static export, not arbitrary streamed SSR HTML.
import { openSync, readSync, closeSync, readFileSync, statSync } from 'node:fs';
import { basename } from 'node:path';
import { StringDecoder } from 'node:string_decoder';

export const STATIC_HEAD_CHUNK_BYTES = 16 * 1024;
export const STATIC_HEAD_MAX_BYTES = 128 * 1024;
/** A larger document already fails the Pages per-asset limit (PAGES_LIMITS.assetBytes). */
export const STATIC_DOCUMENT_MAX_BYTES = 25 * 1024 * 1024;
const VERIFICATION = 'naver226c8e8c348e204e98efbcf23514d286.html';
type Head = { metaTags: string[]; bytesRead: number; kind: 'head' | 'verification' };

function tagEnd(html: string, start: number): number {
  let quote = '';
  for (let at = start + 1; at < html.length; at++) {
    const char = html[at];
    if (quote) { if (char === quote) quote = ''; }
    else if (char === '"' || char === "'") quote = char;
    else if (char === '>') return at + 1;
  }
  return -1;
}

/** undefined means another bounded chunk is needed; no partial tag is accepted. */
function headMeta(html: string): string[] | undefined {
  const metas: string[] = [];
  let at = 0, inHead = false, raw = '';
  while (at < html.length) {
    if (raw) {
      // HTML raw-text elements end at their actual end tag, regardless of JS/CSS
      // string quoting. A literal </head> inside them cannot close the head.
      const pattern = new RegExp(`</${raw}(?=[\\s/>])`, 'ig');
      pattern.lastIndex = at;
      const close = pattern.exec(html);
      if (!close) return undefined;
      const end = tagEnd(html, close.index);
      if (end < 0) return undefined;
      at = end; raw = ''; continue;
    }
    const start = html.indexOf('<', at);
    if (start < 0) return undefined;
    if (html.startsWith('<!--', start)) {
      const end = html.indexOf('-->', start + 4);
      if (end < 0) return undefined;
      at = end + 3; continue;
    }
    const end = tagEnd(html, start);
    if (end < 0) return undefined;
    const tag = html.slice(start, end);
    const match = /^<(\/)?([a-z][\w:-]*)(?=[\s/>])/i.exec(tag);
    at = end;
    if (!match) continue; // e.g. the document's DOCTYPE declaration.
    const name = match[2].toLowerCase(), closing = Boolean(match[1]);
    if (name === 'head') {
      if (closing) { if (!inHead) throw new Error('Static export closes an unopened head'); return metas; }
      if (inHead) throw new Error('Static export has nested head elements');
      inHead = true; continue;
    }
    if (name === 'body' && !closing) throw new Error('Static export body appeared before the head closed');
    if (!closing && ['script', 'style', 'title', 'textarea'].includes(name)) raw = name;
    if (inHead && name === 'meta' && !closing) metas.push(tag);
  }
  return undefined;
}

/**
 * Stop at the real closing head, without reading inline Flight/body payloads.
 * A missing/overlong head fails closed. The sole non-page exception is the exact
 * committed public Naver verification document, checked by filename AND content.
 */
export function readStaticExportHead(file: string): Head {
  const fd = openSync(file, 'r');
  const decoder = new StringDecoder('utf8');
  const chunk = Buffer.alloc(STATIC_HEAD_CHUNK_BYTES);
  let text = '', bytesRead = 0;
  try {
    while (bytesRead < STATIC_HEAD_MAX_BYTES) {
      const bytes = readSync(fd, chunk, 0, Math.min(chunk.length, STATIC_HEAD_MAX_BYTES - bytesRead), bytesRead);
      bytesRead += bytes;
      text += bytes ? decoder.write(chunk.subarray(0, bytes)) : decoder.end();
      const metaTags = headMeta(text);
      if (metaTags) return { metaTags, bytesRead, kind: 'head' };
      if (!bytes) {
        if (basename(file) === VERIFICATION && text.trim() === `naver-site-verification: ${VERIFICATION}`)
          return { metaTags: [], bytesRead, kind: 'verification' };
        throw new Error(`Static export has no complete head: ${basename(file)}`);
      }
    }
    throw new Error(`Static export head exceeds ${STATIC_HEAD_MAX_BYTES} bytes: ${basename(file)}`);
  } finally { closeSync(fd); }
}

function scriptType(tag: string): string {
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g))
    if (match[1].toLowerCase() === 'type') return (match[2] ?? match[3] ?? match[4]).trim().toLowerCase();
  return '';
}

/**
 * Every parsed <script type="application/ld+json"> of one exported document, in the head
 * or the body (JsonLd renders in place). Only comments and raw-text elements are
 * tokenized, and their contents are skipped as an HTML parser would, so a literal inside
 * another script, style, title, textarea or comment is never taken for structured data.
 * An unterminated element or invalid JSON-LD fails closed.
 */
export function readStaticExportJsonLd(file: string, maxBytes = STATIC_DOCUMENT_MAX_BYTES): unknown[] {
  const name = basename(file);
  if (statSync(file).size > maxBytes) throw new Error(`Static export document exceeds ${maxBytes} bytes: ${name}`);
  const html = readFileSync(file, 'utf8');
  const blocks: unknown[] = [];
  const next = /<(?:!--|(script|style|title|textarea)(?=[\s/>]))/gi;
  for (let at = 0; ;) {
    next.lastIndex = at;
    const found = next.exec(html);
    if (!found) return blocks;
    if (!found[1]) {
      const end = html.indexOf('-->', found.index + 4);
      if (end < 0) throw new Error(`Static export has an unterminated comment: ${name}`);
      at = end + 3; continue;
    }
    const element = found[1].toLowerCase();
    const open = tagEnd(html, found.index);
    const close = new RegExp(`</${element}(?=[\\s/>])`, 'ig');
    close.lastIndex = Math.max(open, 0);
    const closing = open < 0 ? null : close.exec(html);
    const after = closing ? tagEnd(html, closing.index) : -1;
    if (!closing || after < 0) throw new Error(`Static export has an unterminated ${element}: ${name}`);
    if (element === 'script' && scriptType(html.slice(found.index, open)) === 'application/ld+json') {
      try { blocks.push(JSON.parse(html.slice(open, closing.index))); }
      catch { throw new Error(`Static export has invalid JSON-LD: ${name}`); }
    }
    at = after;
  }
}
