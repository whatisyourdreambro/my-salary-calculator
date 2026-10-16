// Exercise the actual overridden consumers without HTTP, credentials, or a browser.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const cloudflareRequire = createRequire(require.resolve('cloudflare'));
const runtime = require('cloudflare/_shims/node-runtime').getRuntime();
const uploads = require('cloudflare/uploads');

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'msy-dependency-compat-'));
  for (const [name, content] of Object.entries({ 'one.js': 'one', 'two.js': 'two', 'other.ts': 'other', 'nested/three.js': 'three' })) {
    const file = path.join(dir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
  t.after(() => {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir()));
    assert.match(path.basename(dir), /^msy-dependency-compat-/);
    fs.rmSync(dir, { recursive: true, force: true });
  });
  return dir;
}

test('glob override supports the sync string/array consumers in node-minify', async t => {
  const dir = fixture(t).replaceAll('\\', '/');
  const minify = require('@node-minify/core');
  for (const input of [`${dir}/**/*.js`, [`${dir}/*.js`, `${dir}/nested/*.js`]]) {
    const result = await minify({ input, output: `${dir}/output.txt`, sync: true, compressor: ({ content }) => content });
    assert.deepEqual(result.split('\n').sort(), ['one', 'three', 'two']);
  }
});

test('glob override supports the async per-file consumer used by Sucrase', async t => {
  const dir = fixture(t);
  const glob = require('glob');
  assert.equal(require('glob/package.json').version, '13.0.6');
  const files = await glob.glob('**/*.{ts,js}', { cwd: dir, nodir: true });
  assert.deepEqual(files.map(file => file.replaceAll('\\', '/')).sort(), ['nested/three.js', 'one.js', 'other.ts', 'two.js']);
});

async function encode(body, extra = {}) {
  const options = await uploads.multipartFormRequestOptions({ body, ...extra });
  const chunks = [];
  for await (const chunk of options.body.body) chunks.push(Buffer.from(chunk));
  const bytes = Buffer.concat(chunks);
  assert.equal(bytes.length, Number(options.headers['Content-Length']));
  assert.match(options.headers['Content-Type'], /^multipart\/form-data; boundary=/);
  return bytes;
}

test('Cloudflare SDK encodes metadata, worker source and binary module with formdata 6', async () => {
  assert.equal(cloudflareRequire('formdata-node/package.json').version, '6.0.3');
  const wasm = Buffer.from([0, 1, 255, 65]);
  const bytes = await encode({
    metadata: { main_module: 'worker.js', bindings: [{ type: 'plain_text', name: 'EXAMPLE', text: '예시' }] },
    'worker.js': new runtime.File(['export default {};'], 'worker.js', { type: 'application/javascript+module' }),
    'worker.wasm': new runtime.File([wasm], 'worker.wasm', { type: 'application/wasm' }),
  }, { __multipartSyntax: 'json' });
  const text = bytes.toString('utf8');
  assert.ok(text.includes('name="metadata"; filename="metadata"'));
  assert.ok(text.includes('Content-Type: application/json'));
  assert.ok(text.includes('"main_module":"worker.js"'));
  assert.ok(text.includes('예시'));
  assert.ok(text.includes('Content-Type: application/wasm'));
  assert.ok(bytes.includes(wasm));
});

test('Cloudflare SDK preserves ordinary multipart fields and local file helpers', async t => {
  const dir = fixture(t);
  const fromPath = await cloudflareRequire('formdata-node/file-from-path').fileFromPath(path.join(dir, 'one.js'), 'fixture.js', { type: 'text/javascript' });
  assert.equal(await fromPath.text(), 'one');
  assert.equal(fromPath.name, 'fixture.js');
  const blob = new runtime.Blob(['x', 'y'], { type: 'text/plain' });
  assert.equal(await blob.text(), 'xy');
  const bytes = await encode({ title: '한글 및 café', number: 12, flag: false, items: ['a', 'b'], nested: { value: 'x' }, file: fromPath });
  const text = bytes.toString('utf8');
  for (const value of ['한글 및 café', 'name="number"\r\n\r\n12', 'name="flag"\r\n\r\nfalse', 'name="items[]"', 'name="nested[value]"', 'filename="fixture.js"']) assert.ok(text.includes(value), value);
});
