// Offline synthetic gzip fixtures only: no fonts, application, browser or remote HTTP.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { gzipSync } from 'node:zlib';
import { inflateOgChunks } from '../../cloudflare/pages-og-inflate.mjs';
import { cleanBuildEnvironment } from '../lib/pages-export.mjs';

const BLOCK_BYTES = 1024 * 1024;
function importedData(bytes) {
  const result = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(result).set(bytes);
  return result;
}
const pack = bytes => importedData(gzipSync(bytes));
function pattern(length, seed = 0) {
  return Uint8Array.from({ length }, (_, index) => (index * 37 + (index >>> 8) + seed) & 255);
}

test('one-byte and exact 1 MiB blocks return exact independent ArrayBuffers', () => {
  for (const size of [1, BLOCK_BYTES]) {
    const source = pattern(size, 17), input = pack(source);
    const inputBefore = new Uint8Array(input).slice();
    const restored = inflateOgChunks(size, [input]);
    assert.ok(restored instanceof ArrayBuffer);
    assert.equal(restored.byteLength, size);
    assert.deepEqual(new Uint8Array(restored), source);
    assert.deepEqual(new Uint8Array(input), inputBefore);
    new Uint8Array(restored)[0] ^= 255;
    assert.deepEqual(new Uint8Array(input), inputBefore);
  }
});

test('multiple blocks preserve all bytes and the final partial block boundary', () => {
  for (const size of [BLOCK_BYTES + 1, BLOCK_BYTES * 2, BLOCK_BYTES * 2 + 193]) {
    const source = pattern(size, 91), chunks = [];
    for (let offset = 0; offset < size; offset += BLOCK_BYTES)
      chunks.push(pack(source.subarray(offset, Math.min(offset + BLOCK_BYTES, size))));
    const restored = inflateOgChunks(size, chunks);
    assert.equal(restored.byteLength, size);
    assert.deepEqual(new Uint8Array(restored), source);
  }
});

test('reviewed 8 MiB mode accepts one whole glyph archive and rejects other block sizes/counts', () => {
  const source = pattern(8193, 55), chunk = pack(source);
  assert.deepEqual(new Uint8Array(inflateOgChunks(source.length, [chunk], 8 * BLOCK_BYTES)), source);
  for (const chunkBytes of [0, 1, 2 * BLOCK_BYTES, 4 * BLOCK_BYTES, 16 * BLOCK_BYTES, '8388608', NaN, null])
    assert.throws(() => inflateOgChunks(source.length, [chunk], chunkBytes), /Invalid OG block size/);
  assert.throws(() => inflateOgChunks(source.length, [chunk, chunk], 8 * BLOCK_BYTES), /Invalid OG chunk count/);
  assert.throws(() => inflateOgChunks(8 * BLOCK_BYTES + 1, [chunk], 8 * BLOCK_BYTES), /Invalid OG chunk count/);
  assert.throws(() => inflateOgChunks(source.length - 1, [chunk], 8 * BLOCK_BYTES), /Invalid OG decoded chunk length/);
  assert.throws(() => inflateOgChunks(source.length + 1, [chunk], 8 * BLOCK_BYTES), /Invalid OG decoded chunk length/);
});

test('invalid sizes and chunk counts fail before decoding', () => {
  const one = pack(Uint8Array.of(3));
  for (const size of [0, -1, 0.5, NaN, Infinity, '1', null, undefined, 40 * BLOCK_BYTES + 1, Number.MAX_SAFE_INTEGER])
    assert.throws(() => inflateOgChunks(size, [one]), /Invalid OG decoded size/);
  for (const chunks of [null, undefined, {}, one, [], [one, one]])
    assert.throws(() => inflateOgChunks(1, chunks), /Invalid OG chunk count/);
  assert.throws(() => inflateOgChunks(BLOCK_BYTES + 1, [one]), /Invalid OG chunk count/);
});

test('only bounded imported ArrayBuffers with gzip headers are accepted', () => {
  const bytes = new Uint8Array(pack(Uint8Array.of(3)));
  for (const input of [null, {}, bytes, Buffer.from(bytes), new DataView(bytes.buffer), new SharedArrayBuffer(32),
    new ArrayBuffer(0), new ArrayBuffer(17), new ArrayBuffer(BLOCK_BYTES + 65537)])
    assert.throws(() => inflateOgChunks(1, [input]), /Invalid OG packed chunk/);
  for (const position of [0, 1, 2]) {
    const invalid = bytes.slice(); invalid[position] ^= 255;
    assert.throws(() => inflateOgChunks(1, [importedData(invalid)]), /Invalid OG gzip header/);
  }
});

test('truncated gzip, corrupted CRC and non-gzip data fail with bounded messages', () => {
  const good = new Uint8Array(pack(pattern(4096)));
  const crc = good.slice(); crc[crc.length - 8] ^= 255;
  for (const bad of [good.subarray(0, good.length - 1), good.subarray(0, 18), crc])
    assert.throws(() => inflateOgChunks(4096, [importedData(bad)]), { message: 'Invalid OG gzip data' });
  assert.throws(() => inflateOgChunks(1, [importedData(new Uint8Array(32))]), { message: 'Invalid OG gzip header' });
});

test('underflow and overflow cannot silently truncate or zero-fill a block', () => {
  assert.throws(() => inflateOgChunks(3, [pack(Uint8Array.of(1, 2))]), /Invalid OG decoded chunk length/);
  assert.throws(() => inflateOgChunks(1, [pack(Uint8Array.of(1, 2))]), { message: 'Invalid OG decoded chunk length' });
  assert.throws(() => inflateOgChunks(BLOCK_BYTES, [pack(new Uint8Array(BLOCK_BYTES + 1))]), { message: 'Invalid OG gzip data' });
  const full = pack(pattern(BLOCK_BYTES));
  assert.throws(() => inflateOgChunks(BLOCK_BYTES + 1, [full, pack(Uint8Array.of(2, 3))]), { message: 'Invalid OG decoded chunk length' });
  assert.throws(() => inflateOgChunks(BLOCK_BYTES + 2, [full, pack(Uint8Array.of(2))]), /Invalid OG decoded chunk length/);
});

test('native Workerd restores a partial block at startup and rejects both output overflow modes', { timeout: 30000 }, async t => {
  const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), 'msy-og-inflate-fixture-'));
  t.after(() => {
    if (path.dirname(fixtureRoot) !== path.resolve(os.tmpdir())
      || realpathSync(fixtureRoot) !== path.resolve(fixtureRoot)
      || !path.basename(fixtureRoot).startsWith('msy-og-inflate-fixture-')) throw new Error('Unsafe fixture cleanup');
    rmSync(fixtureRoot, { recursive: true, force: true });
  });
  const partial = pattern(110495, 23);
  const previousEnv = process.env;
  const cleanEnv = cleanBuildEnvironment(previousEnv, 'qa', path.join(fixtureRoot, '.pages-qa'));
  mkdirSync(cleanEnv.HOME, { recursive: true });
  const require = createRequire(import.meta.url);
  const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
  let mf, blocked = 0;
  const denyOutbound = () => { blocked++; return new Response('egress blocked', { status: 403 }); };
  try {
    process.env = cleanEnv;
    const { Miniflare, convertV4MiniflareOptions } = wranglerRequire('miniflare');
    const options = convertV4MiniflareOptions({
      name: 'synthetic-og-inflate', host: '127.0.0.1', port: 0, cf: false,
      compatibilityDate: '2025-09-08', compatibilityFlags: ['nodejs_compat'],
      modulesRoot: '/', modules: [
        { type: 'ESModule', path: 'index.mjs', contents: `
import { inflateOgChunks } from './inflate.mjs';
import partial from './partial.bin';
import bomb from './bomb.bin';
const restored = inflateOgChunks(110495, [partial]);
function rejected(expected, chunks, message) {
  try { inflateOgChunks(expected, chunks); return false; }
  catch (error) { return error.message === message; }
}
const bombRejected = rejected(1048576, [bomb], 'Invalid OG gzip data');
const extraByteRejected = rejected(110494, [partial], 'Invalid OG decoded chunk length');
export default { fetch() {
  return new Response(restored, { headers: {
    'content-type': 'application/octet-stream',
    'x-bomb-rejected': String(bombRejected), 'x-extra-byte-rejected': String(extraByteRejected)
  } });
} };` },
        { type: 'ESModule', path: 'inflate.mjs', contents: readFileSync(new URL('../../cloudflare/pages-og-inflate.mjs', import.meta.url), 'utf8') },
        { type: 'Data', path: 'partial.bin', contents: gzipSync(partial) },
        { type: 'Data', path: 'bomb.bin', contents: gzipSync(new Uint8Array(BLOCK_BYTES + 1)) },
      ],
      outboundService: denyOutbound, unsafeRegisterWorker: false,
      unsafeLocalExplorer: false, unsafeObservability: false, logRequests: false,
    });
    assert.equal(options.host, '127.0.0.1'); assert.equal(options.port, 0); assert.equal(options.cf, false);
    assert.equal(options.workers.length, 1);
    const worker = options.workers[0];
    assert.equal(worker.config.compatibilityDate, '2025-09-08');
    assert.deepEqual(worker.config.compatibilityFlags, ['nodejs_compat']);
    assert.deepEqual(worker.config.env, {});
    assert.equal(worker.dev.outboundService.type, 'fetcher');
    assert.equal(worker.dev.outboundService.handler, denyOutbound);
    assert.equal(worker.dev.remoteProxyConnectionString, undefined);
    assert.equal(worker.dev.unsafeRegisterWorker, false);
    mf = new Miniflare(options);
    const base = await mf.ready;
    assert.equal(base.hostname, '127.0.0.1');
    const response = await mf.dispatchFetch(`${base.origin}/synthetic`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-bomb-rejected'), 'true');
    assert.equal(response.headers.get('x-extra-byte-rejected'), 'true');
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), partial);
    assert.equal(blocked, 0);
  } finally {
    try { if (mf) await mf.dispose(); }
    finally { process.env = previousEnv; }
  }
});
