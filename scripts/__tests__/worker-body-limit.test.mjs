import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DEFAULT_BODY_LIMIT, limitRequestBody, requestBodyLimit, withRequestBodyLimits } from '../../cloudflare/request-body-limit.mjs';

const root = new URL('../../', import.meta.url);
const origin = 'https://www.moneysalary.com';
function request(route, body, headers = {}, method = 'POST') {
  return new Request(origin + route, { method, body, headers, ...(body instanceof ReadableStream ? { duplex: 'half' } : {}) });
}
async function errorResponse(result, status, error) {
  assert.ok(result instanceof Response);
  assert.equal(result.status, status);
  assert.deepEqual(await result.json(), { ok: false, error });
  assert.equal(result.headers.get('cache-control'), 'private, no-store');
  assert.equal(result.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal(result.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(result.headers.get('x-frame-options'), 'SAMEORIGIN');
}
function streamOf(chunks, { fail = false, cancellationNeverSettles = false } = {}) {
  const state = { reads: 0, canceled: 0 };
  return { state, body: new ReadableStream({
    pull(controller) {
      const i = state.reads++;
      if (i < chunks.length) controller.enqueue(chunks[i]);
      else if (fail) controller.error(new Error('synthetic stream failure'));
      else controller.close();
    },
    cancel() {
      state.canceled++;
      if (cancellationNeverSettles) return new Promise(() => {});
    },
  }, { highWaterMark: 0 }) };
}

test('GET and HEAD preserve the original Request without body handling', async () => {
  for (const method of ['GET', 'HEAD']) {
    const input = request('/api/contact', undefined, {}, method);
    assert.equal(requestBodyLimit(input), null);
    assert.equal(await limitRequestBody(input), input);
  }
});

test('strict API limits include trailing, encoded and nested-encoded aliases', () => {
  for (const [route, limit] of [
    ['/api/contact', 4096], ['/api/contact/', 4096], ['/api/contact///', 4096],
    ['/%61pi/contact', 4096], ['/api%2fcontact', 4096], ['/api%252fcontact', 4096],
    ['/api%5ccontact', 4096], ['/api/other/../contact', 4096],
    ['/api/feedback?x=1', 1024], ['/api/feed%62ack/', 1024],
    ['/api/participation/opinions', 2048], ['/api/participation/opinions/', 2048],
    ['/api%252fparticipation%252fopinions', 2048], ['/api/participation/reactions', 1024], ['/api/participation/summary', 1024],
    ['/api/feedback-other', DEFAULT_BODY_LIMIT], ['/elsewhere', DEFAULT_BODY_LIMIT], ['/api/%zz', DEFAULT_BODY_LIMIT],
  ]) assert.equal(requestBodyLimit(request(route, '')), limit, route);
});

test('exact API byte limits pass and one byte over fails for canonical and encoded paths', async () => {
  for (const [route, limit] of [['/api/contact', 4096], ['/api/feedback/', 1024], ['/api%252ffeedback', 1024], ['/api/participation/opinions', 2048], ['/api/participation/reactions', 1024], ['/api/participation/summary', 1024]]) {
    const accepted = await limitRequestBody(request(route, new Uint8Array(limit)));
    assert.ok(accepted instanceof Request);
    assert.equal((await accepted.arrayBuffer()).byteLength, limit);
    await errorResponse(await limitRequestBody(request(route, new Uint8Array(limit + 1))), 413, 'PAYLOAD_TOO_LARGE');
  }
});

test('every other body-bearing method/path is bounded at 64KiB before adapter dispatch', async () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    const accepted = await limitRequestBody(request('/unknown', new Uint8Array(DEFAULT_BODY_LIMIT), {}, method));
    assert.ok(accepted instanceof Request);
    assert.equal((await accepted.arrayBuffer()).byteLength, DEFAULT_BODY_LIMIT);
    await errorResponse(await limitRequestBody(request('/unknown', new Uint8Array(DEFAULT_BODY_LIMIT + 1), {}, method)), 413, 'PAYLOAD_TOO_LARGE');
  }
});

test('Content-Length never replaces measured bytes, and overflow stops reading without canceling the transport', async () => {
  for (const headers of [{}, { 'content-length': '1' }]) {
    const fixture = streamOf([new Uint8Array(700), new Uint8Array(325), new Uint8Array(999)], { cancellationNeverSettles: true });
    await errorResponse(await limitRequestBody(request('/api/feedback', fixture.body, headers)), 413, 'PAYLOAD_TOO_LARGE');
    assert.equal(fixture.state.canceled, 0, 'Early transport cancellation can drop the Workerd response');
    assert.equal(fixture.state.reads, 2, 'Do not read beyond the overflowing chunk');
  }
});

test('oversized/invalid declared lengths reject without reading or canceling the incoming transport', async () => {
  for (const [value, status, error] of [['4097', 413, 'PAYLOAD_TOO_LARGE'], ['9'.repeat(100), 413, 'PAYLOAD_TOO_LARGE'],
    ['-1', 400, 'INVALID_REQUEST'], ['1.5', 400, 'INVALID_REQUEST'], ['abc', 400, 'INVALID_REQUEST']]) {
    const fixture = streamOf([new Uint8Array(1)]);
    await errorResponse(await limitRequestBody(request('/api/contact', fixture.body, { 'content-length': value })), status, error);
    assert.equal(fixture.state.reads, 0);
    assert.equal(fixture.state.canceled, 0);
  }
});

test('UTF8 is measured in bytes and arbitrary binary bytes are preserved for app validation', async () => {
  await errorResponse(await limitRequestBody(request('/api/feedback', '가'.repeat(342))), 413, 'PAYLOAD_TOO_LARGE');
  const bytes = Uint8Array.from([0, 255, 254, 195, 40, 13, 10]);
  const accepted = await limitRequestBody(request('/api/contact', bytes, { 'content-type': 'application/octet-stream' }));
  assert.deepEqual(new Uint8Array(await accepted.arrayBuffer()), bytes);
  assert.equal(accepted.headers.get('content-type'), 'application/octet-stream');
});

test('broken or invalid byte streams fail closed without dispatching the adapter', async () => {
  const fixture = streamOf([new Uint8Array(2)], { fail: true });
  await errorResponse(await limitRequestBody(request('/api/contact', fixture.body)), 400, 'INVALID_REQUEST');
  const invalid = streamOf(['not bytes']);
  await errorResponse(await limitRequestBody(request('/api/contact', invalid.body)), 400, 'INVALID_REQUEST');
  assert.equal(invalid.state.canceled, 0);
});

test('many empty chunks and a reused producer buffer preserve only the accepted bytes', async () => {
  const reused = new Uint8Array(1);
  let pulls = 0;
  const body = new ReadableStream({
    pull(controller) {
      pulls++;
      if (pulls <= 20000) controller.enqueue(new Uint8Array(0));
      else if (pulls <= 20003) {
        reused[0] = pulls - 20000;
        controller.enqueue(reused);
      } else controller.close();
    },
  }, { highWaterMark: 0 });
  const accepted = await limitRequestBody(request('/api/feedback', body));
  assert.ok(accepted instanceof Request);
  assert.equal(accepted.headers.get('content-length'), '3');
  assert.deepEqual(new Uint8Array(await accepted.arrayBuffer()), Uint8Array.of(1, 2, 3));
  assert.equal(pulls, 20004);
});

test('accepted requests preserve identity headers, URL, bytes, signal and Cloudflare metadata', async () => {
  const OriginalRequest = globalThis.Request;
  class MetadataRequest extends OriginalRequest {
    constructor(input, init) { super(input, init); this.cf = init?.cf ?? input?.cf; }
  }
  globalThis.Request = MetadataRequest;
  try {
    const controller = new AbortController();
    const input = new MetadataRequest(origin + '/api/contact?q=1', { method: 'POST', body: 'abc', cf: { country: 'KR' }, signal: controller.signal,
      headers: { origin, 'cf-connecting-ip': '192.0.2.3', authorization: 'synthetic', cookie: 'test=1', 'content-length': '1' } });
    const accepted = await limitRequestBody(input);
    assert.equal(accepted.url, input.url);
    assert.equal(accepted.method, 'POST');
    assert.deepEqual(accepted.cf, input.cf);
    for (const name of ['origin', 'cf-connecting-ip', 'authorization', 'cookie']) assert.equal(accepted.headers.get(name), input.headers.get(name));
    assert.equal(accepted.headers.get('content-length'), '3');
    assert.equal(await accepted.text(), 'abc');
    controller.abort();
    assert.equal(accepted.signal.aborted, true);
  } finally { globalThis.Request = OriginalRequest; }
});

test('default Worker methods, property descriptors, this context, env and ctx survive wrapping', async () => {
  const calls = [];
  const env = {}, ctx = {};
  const original = { marker: 'kept', scheduled() {}, async fetch(req, passedEnv, passedCtx) {
    calls.push({ req, passedEnv, passedCtx, marker: this.marker });
    return new Response(await req.text());
  } };
  Object.defineProperty(original, 'hidden', { value: 'preserved', enumerable: false });
  const wrapped = withRequestBodyLimits(original);
  assert.equal(wrapped.scheduled, original.scheduled);
  assert.deepEqual(Object.getOwnPropertyDescriptor(wrapped, 'hidden'), Object.getOwnPropertyDescriptor(original, 'hidden'));
  assert.equal(await (await wrapped.fetch(request('/api/contact', 'ok'), env, ctx)).text(), 'ok');
  assert.equal(calls[0].passedEnv, env); assert.equal(calls[0].passedCtx, ctx); assert.equal(calls[0].marker, 'kept');
  await errorResponse(await wrapped.fetch(request('/api/feedback', new Uint8Array(1025)), env, ctx), 413, 'PAYLOAD_TOO_LARGE');
  assert.equal(calls.length, 1);
});

test('entrypoint preserves generated named exports without executing the real generated Worker', async () => {
  const temp = mkdtempSync(path.join(tmpdir(), 'msy-worker-boundary-test-'));
  try {
    mkdirSync(path.join(temp, 'cloudflare')); mkdirSync(path.join(temp, '.open-next'));
    for (const file of ['worker-entry.mjs', 'request-body-limit.mjs']) cpSync(new URL(`cloudflare/${file}`, root), path.join(temp, 'cloudflare', file));
    writeFileSync(path.join(temp, 'package.json'), '{"type":"module"}');
    writeFileSync(path.join(temp, '.open-next', 'worker.js'), 'export class DOQueueHandler {}\nexport const extra="preserved";\nexport default { scheduled(){ return "kept"; }, fetch(){ return new Response("stub"); } };\n');
    const entry = await import(pathToFileURL(path.join(temp, 'cloudflare', 'worker-entry.mjs')));
    assert.equal(entry.extra, 'preserved'); assert.equal(typeof entry.DOQueueHandler, 'function');
    assert.equal(entry.default.scheduled(), 'kept');
    assert.equal(await (await entry.default.fetch(request('/api/contact', 'ok'), {}, {})).text(), 'stub');
  } finally {
    assert.equal(path.dirname(path.resolve(temp)), path.resolve(tmpdir()));
    assert.ok(path.basename(temp).startsWith('msy-worker-boundary-test-'));
    rmSync(temp, { recursive: true, force: true });
  }
});

test('production and QA both use the wrapper, and QA copies and fingerprints its whole directory', () => {
  for (const file of ['wrangler.jsonc', 'wrangler.qa.jsonc']) {
    const source = readFileSync(new URL(file, root), 'utf8');
    assert.match(source, /"main"\s*:\s*"cloudflare\/worker-entry\.mjs"/);
  }
  const qa = readFileSync(new URL('scripts/qa-cloudflare.mjs', root), 'utf8');
  assert.match(qa, /const worker = path\.join\(stage, 'cloudflare', 'worker-entry\.mjs'\)/);
  assert.match(qa, /for \(const item of \[[\s\S]*?'cloudflare'[\s\S]*?\]\)\s*\{\s*cpSync/);
  assert.match(qa, /walk\(path\.join\(stage, 'cloudflare'\)\)/);
  assert.match(qa, /verified\.outputHash !== outputHash\(\)/);
});
