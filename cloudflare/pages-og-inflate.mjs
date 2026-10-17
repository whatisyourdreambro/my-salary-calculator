// Startup-only reconstruction of reviewed OG Data modules. No request work or I/O.
import { gunzipSync } from 'node:zlib';

const BLOCK_BYTES = 1024 * 1024;
const MAX_BYTES = 40 * BLOCK_BYTES;

/** Restore one OG file into a preallocated destination using bounded decoded blocks. */
export function inflateOgChunks(expectedBytes, chunks, chunkBytes = BLOCK_BYTES) {
  if (chunkBytes !== BLOCK_BYTES && chunkBytes !== 8 * BLOCK_BYTES)
    throw new Error('Invalid OG block size');
  if (!Number.isSafeInteger(expectedBytes) || expectedBytes <= 0 || expectedBytes > MAX_BYTES)
    throw new Error('Invalid OG decoded size');
  if (!Array.isArray(chunks) || chunks.length !== Math.ceil(expectedBytes / chunkBytes))
    throw new Error('Invalid OG chunk count');

  // Validate all imported inputs before allocating the final destination.
  for (const chunk of chunks) {
    if (!(chunk instanceof ArrayBuffer) || chunk.byteLength < 18 || chunk.byteLength > chunkBytes + 65536)
      throw new Error('Invalid OG packed chunk');
    const bytes = new Uint8Array(chunk);
    if (bytes[0] !== 0x1f || bytes[1] !== 0x8b || bytes[2] !== 8)
      throw new Error('Invalid OG gzip header');
  }

  const output = new ArrayBuffer(expectedBytes);
  const destination = new Uint8Array(output);
  let offset = 0;
  for (const chunk of chunks) {
    const length = Math.min(chunkBytes, expectedBytes - offset);
    let decoded;
    try {
      // Workerd's native output allocation can exceed a partial block's exact
      // length. Keep the fixed block cap, then require the exact decoded length.
      decoded = gunzipSync(new Uint8Array(chunk), { maxOutputLength: chunkBytes });
    } catch {
      // Runtime/parser details may include untrusted bytes; expose no payload.
      throw new Error('Invalid OG gzip data');
    }
    if (decoded.byteLength !== length || offset + length > expectedBytes)
      throw new Error('Invalid OG decoded chunk length');
    destination.set(decoded, offset);
    offset += length;
  }
  if (offset !== expectedBytes) throw new Error('Invalid OG decoded total');
  return output;
}
