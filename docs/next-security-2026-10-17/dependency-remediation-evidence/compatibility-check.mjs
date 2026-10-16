// Offline only: local path matching and multipart encoding, never HTTP fetch.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const base = path.dirname(fileURLToPath(import.meta.url));
const original = createRequire(path.resolve(base, '../../package.json'));
const candidate = createRequire(path.join(base, 'compatibility-final/package.json'));
const fixture = path.join(base, 'compatibility-files');
const files = { 'one.js': 'one', 'two.ts': 'two', '.hidden.js': 'hidden', 'sub/three.js': 'three', 'sub/four.ts': 'four', 'space dir/five.js': 'five', 'sub/empty.txt': '' };
for (const [file, text] of Object.entries(files)) { const target = path.join(fixture, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, text); }
const rows = [];
const baselineGlob = original('glob'), candidateGlob = candidate('glob');
const patterns = ['**/*', '**/*.{js,ts}', '*.js', 'sub/*', '**/+(one|three).js', ['**/*.js', '**/*.ts'], 'absent*', fixture.replaceAll('\\', '/') + '/**/*.js'];
for (const pattern of patterns) for (const options of [{}, { dot: true }, { nodir: true }, { ignore: ['sub/**'] }, { absolute: true }]) {
  for (const api of ['glob', 'globSync']) {
    const before = await baselineGlob[api](pattern, { cwd: fixture, ...options });
    const after = await candidateGlob[api](pattern, { cwd: fixture, ...options });
    assert.deepEqual([...after].sort(), [...before].sort());
    rows.push({ kind: 'glob', api, pattern, options, sameOrder: JSON.stringify(after) === JSON.stringify(before), pass: true });
  }
}
for (const input of [fixture.replaceAll('\\', '/') + '/**/*.js', [fixture.replaceAll('\\', '/') + '/*.js', fixture.replaceAll('\\', '/') + '/sub/*.ts']]) {
  const execute = req => req('@node-minify/core')({ input, output: path.join(fixture, 'test-output.txt'), sync: true, compressor: ({ content }) => content });
  assert.equal(await execute(candidate), await execute(original));
  rows.push({ kind: 'node-minify actual core globSync + concatenation', input, pass: true });
}
async function multipart(req, scenario) {
  const runtime = req('cloudflare/_shims/node-runtime').getRuntime();
  const uploads = req('cloudflare/uploads');
  const file = new runtime.File([Buffer.from([0, 1, 255, 65])], 'worker.wasm', { type: 'application/wasm' });
  const options = scenario === 'json-upload'
    ? { __multipartSyntax: 'json', body: { metadata: { main_module: 'worker.js', bindings: [{ type: 'plain_text', name: 'NAME', text: '예시' }] }, 'worker.js': new runtime.File(['export default {};'], 'worker.js', { type: 'application/javascript+module' }), 'worker.wasm': file } }
    : { body: { title: '한글 및 café', number: 12, flag: false, items: ['a', 'b'], nested: { value: 'x' }, file } };
  const encoded = await uploads.multipartFormRequestOptions(options);
  const chunks = []; for await (const chunk of encoded.body.body) chunks.push(Buffer.from(chunk));
  const bytes = Buffer.concat(chunks);
  assert.equal(bytes.length, Number(encoded.headers['Content-Length']));
  const boundary = encoded.headers['Content-Type'].split('boundary=')[1];
  const normalized = bytes.toString('latin1').replaceAll(boundary, 'BOUNDARY');
  assert.ok(normalized.includes('worker.wasm'));
  const fromPath = await req('formdata-node/file-from-path').fileFromPath(path.join(fixture, 'one.js'), 'fixture.js', { type: 'text/javascript' });
  assert.equal(await fromPath.text(), 'one');
  assert.equal(fromPath.name, 'fixture.js');
  const blob = new runtime.Blob(['x', 'y'], { type: 'text/plain' });
  assert.equal(await blob.text(), 'xy');
  return { normalized, bytes: bytes.length };
}
for (const scenario of ['json-upload', 'nested-upload']) {
  assert.deepEqual(await multipart(candidate, scenario), await multipart(original, scenario));
  rows.push({ kind: 'Cloudflare 4.5 SDK multipart byte equivalence', scenario, pass: true });
}
const candidateLock = JSON.parse(fs.readFileSync(path.join(base, 'compatibility-final/package-lock.json'), 'utf8'));
assert.equal(Object.keys(candidateLock.packages).some(p => p.endsWith('/node-domexception')), false);
const report = { generatedAt: new Date().toISOString(), node: process.version, offline: true, pass: true, rows,
  versions: { baselineGlob: original('glob/package.json').version, candidateGlob: candidate('glob/package.json').version, baselineFormdata: original('formdata-node/package.json').version, candidateFormdata: candidate('formdata-node/package.json').version },
  scope: 'Actual Cloudflare SDK multipart encoder/File/Blob/fileFromPath and node-minify string/array glob consumer. Glob match sets compared and any order difference recorded separately. Node-minify concatenated output compared byte-for-byte. No network or upload executed. Sucrase CLI not executed; its awaited glob API is directly covered. Formdata 6 Blob constructor name is _Blob; SDK uses structural interfaces successfully.' };
fs.writeFileSync(path.join(base, 'compatibility-check.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ pass: true, checks: rows.length, orderDifferences: rows.filter(r => r.sameOrder === false).length, versions: report.versions }, null, 2));
