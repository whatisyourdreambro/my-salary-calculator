// Build-only parser for Next's static export, not arbitrary streamed SSR HTML.
import { openSync, readSync, closeSync } from 'node:fs';
import { basename } from 'node:path';
import { StringDecoder } from 'node:string_decoder';

export const STATIC_HEAD_CHUNK_BYTES = 16 * 1024;
export const STATIC_HEAD_MAX_BYTES = 128 * 1024;
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
