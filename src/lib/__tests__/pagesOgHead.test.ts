import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { readStaticExportHead, readStaticExportJsonLd, STATIC_DOCUMENT_MAX_BYTES, STATIC_HEAD_CHUNK_BYTES, STATIC_HEAD_MAX_BYTES } from '../../../scripts/lib/static-export-head';

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

// SEC-08: JSON-LD images (Article.image) are prebuilt OG cards too, so the build reads
// structured data from the whole exported document, head and body.
describe('static export JSON-LD reader', () => {
  const article = (title: string) => JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article',
    image: `https://www.moneysalary.com/api/og?type=guide&title=${encodeURIComponent(title)}` }).replace(/</g, '\\u003c');
  it('parses JsonLd blocks in the head and after megabytes of body, with any case and quoting', () => {
    const html = `<!DOCTYPE html><html><head><script type="application/ld+json">{"@type":"Organization"}</script></head><body>${'x'.repeat(2 * 1024 * 1024)}`
      + `<SCRIPT data-x="type=text/plain" TYPE=' Application/LD+JSON '>${article('시즌 <가이드>')}</SCRIPT><script type=application/ld+json>[1,2]</script></body></html>`;
    expect(readStaticExportJsonLd(file(html))).toEqual([{ '@type': 'Organization' }, JSON.parse(article('시즌 <가이드>')), [1, 2]]);
  });
  it('skips literals inside comments and other raw-text elements as an HTML parser would', () => {
    const decoy = '<script type="application/ld+json">{"image":"/api/og?title=decoy"}';
    const html = `<html><head><title>${decoy}</title><style>a::after{content:'${decoy}'}</style></head><body><!-- ${decoy}</script> -->`
      + `<script>self.t='${decoy}<\\/script>';</script><textarea>${decoy}</textarea><scripts type="application/ld+json">{}</scripts>`
      + `<script type="text/javascript">var x = 1 < 2;</script><script type="application/ld+json">{"real":true}</script></body></html>`;
    expect(readStaticExportJsonLd(file(html))).toEqual([{ real: true }]);
  });
  it.each([
    ['invalid JSON-LD', '<body><script type="application/ld+json">{"image":</script></body>', /invalid JSON-LD/],
    ['an unterminated JSON-LD script', '<body><script type="application/ld+json">{}', /unterminated script/],
    ['an unterminated start tag', '<body><script type="application/ld+json', /unterminated script/],
    ['an unterminated comment', '<body><!-- <script type="application/ld+json">{}</script>', /unterminated comment/],
  ])('fails closed on %s', (_name, html, error) => {
    expect(() => readStaticExportJsonLd(file(html))).toThrow(error);
  });
  it('enforces the document byte limit and reads documents without structured data as empty', () => {
    expect(STATIC_DOCUMENT_MAX_BYTES).toBe(25 * 1024 * 1024);
    expect(() => readStaticExportJsonLd(file('<html>' + 'x'.repeat(100) + '</html>'), 64)).toThrow(/exceeds 64 bytes/);
    expect(readStaticExportJsonLd(file('<html><head></head><body><p>1 &lt; 2</p></body></html>'))).toEqual([]);
    const name = 'naver226c8e8c348e204e98efbcf23514d286.html';
    expect(readStaticExportJsonLd(file(`naver-site-verification: ${name}\r\n`, name))).toEqual([]);
  });
});
