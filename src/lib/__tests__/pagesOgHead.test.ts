import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { readStaticExportHead, STATIC_HEAD_CHUNK_BYTES, STATIC_HEAD_MAX_BYTES } from '../../../scripts/lib/static-export-head';

const directories: string[] = [];
function file(text: string, name = 'page.html') {
  const dir = mkdtempSync(join(tmpdir(), 'msy-static-head-')); directories.push(dir);
  const path = join(dir, name); writeFileSync(path, text); return path;
}
afterEach(() => {
  for (const dir of directories.splice(0)) {
    if (!resolve(dir).startsWith(resolve(tmpdir()) + sep) || !dir.includes('msy-static-head-')) throw new Error('Unsafe test cleanup');
    rmSync(dir, { recursive: true, force: true });
  }
});
describe('bounded static export head reader', () => {
  it('reads at most one chunk when a small head precedes megabytes of Flight/body data', () => {
    const result = readStaticExportHead(file('<html><head><meta property="og:image" content="/api/og?title=real"></head><body>' + 'x'.repeat(2 * 1024 * 1024)));
    expect(result.bytesRead).toBe(STATIC_HEAD_CHUNK_BYTES); expect(result.metaTags).toHaveLength(1);
  });
  it('handles upper-case head tags, attributes and quoted > characters without truncating a meta tag', () => {
    const result = readStaticExportHead(file('<HTML><HeAd data-note=">">\n<META content="/api/og?title=A>B" property="og:image"></hEaD><body></body>'));
    expect(result.metaTags).toEqual(['<META content="/api/og?title=A>B" property="og:image">']);
  });
  it('keeps a UTF-8 character split over the read boundary intact', () => {
    const start = '<head><meta property="og:image" content="/api/og?title=';
    const prefix = start + 'x'.repeat(STATIC_HEAD_CHUNK_BYTES - Buffer.byteLength(start) - 1);
    const result = readStaticExportHead(file(prefix + '삼성전자">' + '</head>'));
    expect(result.metaTags[0]).toContain('삼성전자'); expect(result.metaTags[0]).not.toContain('\ufffd');
  });
  it('does not confuse comments or raw-text payload literals with meta or closing head tags', () => {
    const result = readStaticExportHead(file('<head><!-- </head><meta property="og:image" content="fake-comment"> --><script>const text="</head><meta property=\'og:image\' content=\'fake-script\'>";</script><style>x{content:"</head>"}</style><title>literal &lt;meta&gt;</title><meta property="og:image" content="real"></head><meta property="og:image" content="body">'));
    expect(result.metaTags).toEqual(['<meta property="og:image" content="real">']);
  });
  it('handles a closing head split between chunks', () => {
    const prefix = '<head>' + ' '.repeat(STATIC_HEAD_CHUNK_BYTES - 6 - 3);
    const result = readStaticExportHead(file(prefix + '</head><body>ignored'));
    expect(result.kind).toBe('head'); expect(result.metaTags).toEqual([]);
  });
  it.each(['<meta property="og:image" content="outside">', '<head><meta content="unterminated', '<head><!-- no close', '<head><script>no close', '<head><body>unclosed', '<head><head></head>'])('rejects malformed or missing head instead of silently accepting partial data: %s', html => {
    expect(() => readStaticExportHead(file(html))).toThrow(/Static export/);
  });
  it('enforces the byte limit without a whole-file fallback', () => {
    expect(() => readStaticExportHead(file('<head>' + 'x'.repeat(STATIC_HEAD_MAX_BYTES) + '</head>'))).toThrow(/exceeds 131072 bytes/);
  });
  it('allows only the exact public verification filename and expected contents as a non-page', () => {
    const name = 'naver226c8e8c348e204e98efbcf23514d286.html';
    expect(readStaticExportHead(file(`naver-site-verification: ${name}\r\n`, name)).kind).toBe('verification');
    expect(() => readStaticExportHead(file(`naver-site-verification: ${name}`, 'other.html'))).toThrow(/no complete head/);
    expect(() => readStaticExportHead(file('wrong verification', name))).toThrow(/no complete head/);
  });
});
