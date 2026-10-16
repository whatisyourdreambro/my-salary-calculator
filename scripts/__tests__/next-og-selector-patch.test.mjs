import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { spec, sha256, patchSource, originalSource, applyPatch } = require('../patch-next-og-selector.cjs');
const root = fileURLToPath(new URL('../..', import.meta.url));
const originals = Object.fromEntries(spec.files.map(({ name }) => [name, originalSource(name,
  fs.readFileSync(path.join(root, 'node_modules/next/dist/compiled/@vercel/og', name), 'utf8'))]));

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'msy-og-patch-'));
  const next = path.join(dir, 'node_modules/next');
  const og = path.join(next, 'dist/compiled/@vercel/og');
  fs.mkdirSync(og, { recursive: true });
  fs.writeFileSync(path.join(next, 'package.json'), JSON.stringify({ version: spec.nextVersion }));
  fs.writeFileSync(path.join(og, 'package.json'), JSON.stringify({ version: spec.ogVersion }));
  for (const [name, source] of Object.entries(originals)) fs.writeFileSync(path.join(og, name), source);
  t.after(() => {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir()));
    assert.match(path.basename(dir), /^msy-og-patch-/);
    fs.rmSync(dir, { recursive: true, force: true });
  });
  return { dir, next, og };
}

test('OG backport verifies both runtime hashes, preserves originals/metadata and is idempotent', t => {
  const { dir, og } = fixture(t);
  assert.throws(() => applyPatch({ root: dir, checkOnly: true }), /not been applied/);
  const metadata = fs.readFileSync(path.join(og, 'package.json'));
  const first = applyPatch({ root: dir });
  assert.ok(first.every(file => file.state === 'patched'));
  for (const file of spec.files) {
    assert.equal(sha256(fs.readFileSync(path.join(og, file.name))), file.patchedSha256);
    assert.equal(sha256(fs.readFileSync(path.join(dir, '.artifacts/vendor-patches/next-15.5.28-og-selector', `${file.name}.original`))), file.originalSha256);
  }
  assert.deepEqual(fs.readFileSync(path.join(og, 'package.json')), metadata);
  assert.ok(applyPatch({ root: dir }).every(file => file.state === 'already-patched'));
  assert.ok(applyPatch({ root: dir, checkOnly: true }).every(file => file.state === 'already-patched'));
});

test('unknown version or either drifted runtime fails before any vendor file changes', t => {
  const { dir, next, og } = fixture(t);
  fs.appendFileSync(path.join(og, 'index.node.js'), '\n// unexpected drift');
  assert.throws(() => applyPatch({ root: dir }), /Unrecognized OG source hash/);
  assert.equal(fs.readFileSync(path.join(og, 'index.edge.js'), 'utf8'), originals['index.edge.js']);
  assert.equal(fs.existsSync(path.join(dir, '.artifacts')), false);
  fs.writeFileSync(path.join(next, 'package.json'), JSON.stringify({ version: '16.4.2' }));
  assert.throws(() => applyPatch({ root: dir }), /Unsupported Next\/OG version/);
  assert.equal(fs.readFileSync(path.join(og, 'index.edge.js'), 'utf8'), originals['index.edge.js']);
});

test('a partially applied known patch completes safely and retains the original hashes', t => {
  const { dir, og } = fixture(t);
  fs.writeFileSync(path.join(og, 'index.edge.js'), patchSource('index.edge.js', originals['index.edge.js']).source);
  assert.deepEqual(applyPatch({ root: dir }).map(file => file.state), ['already-patched', 'patched']);
  for (const file of spec.files) assert.equal(sha256(originalSource(file.name, fs.readFileSync(path.join(og, file.name), 'utf8'))), file.originalSha256);
});

function parserContext(source) {
  // Exact pinned bundle boundary: evaluate only dependency declarations through
  // the parser, before ImageResponse/WASM initialization. No Node modules, timers,
  // network, image rendering, or browser surface is exposed to this context.
  const end = source.indexOf('\nvar iu =');
  assert.ok(end > 0 && source.indexOf('\nvar iu =', end + 1) < 0);
  const context = vm.createContext({
    process: Object.freeze({ env: Object.freeze({ NODE_ENV: 'production' }) }),
    TextEncoder, TextDecoder,
    console: { log() {}, warn() {}, error() {} },
    fetch() { throw new Error('Network forbidden in parser regression'); },
    WebAssembly: undefined,
  });
  new vm.Script(source.slice(0, end) + '\nthis.Parser = ru();').runInContext(context, { timeout: 2_000 });
  return context;
}

const atoms = ['.a', '#id', 'div', '*', '[type="a"]', ':not(.x)', 'svg|a', '.a\\.b', '#{token}', '&', ':nth-child(2n+1)', '.foo:hover', '[data-x^="a"]', ':is(.a,#b)', 'a/*note*/', '*|*'];
const corpus = [...atoms, '', '.a.b', '#x.y', '.a.a.a', '#{a}#{b}', '50.5%', '\\31 0px', '[bad', ':not(', 'a|', 'a\n >\t.b'];
for (const left of atoms) for (const right of atoms) for (const join of [' ', ' > ', '+', '~', ',']) corpus.push(left + join + right);

const parseCorpus = new vm.Script(`inputs.map(input => {
  try { const root = new Parser(input).root;
    return { output: root.toString(), ast: JSON.stringify(root, (key, value) => key === 'parent' || typeof value === 'function' ? undefined : value) };
  } catch (error) { return { error: error.name + ': ' + error.message }; }
})`);

for (const name of Object.keys(originals)) {
  test(`${name}: upstream Set backport has byte-identical output and AST on ${corpus.length} selectors`, () => {
    const before = parserContext(originals[name]);
    const after = parserContext(patchSource(name, originals[name]).source);
    before.inputs = corpus; after.inputs = corpus;
    const originalResults = JSON.parse(JSON.stringify(parseCorpus.runInContext(before, { timeout: 5_000 })));
    const patchedResults = JSON.parse(JSON.stringify(parseCorpus.runInContext(after, { timeout: 5_000 })));
    assert.deepEqual(patchedResults, originalResults);
    assert.ok(patchedResults.filter(item => item.output !== undefined).length > 1_000);
  });
}

function measure(source, atom, count) {
  const context = parserContext(source);
  context.input = atom.repeat(count);
  return new vm.Script(`
    this.scannedSlots = 0;
    const originalIndexOf = Array.prototype.indexOf;
    Array.prototype.indexOf = function(value, start) {
      const found = originalIndexOf.call(this, value, start);
      scannedSlots += found < 0 ? this.length : found + 1;
      return found;
    };
    const tree = new Parser(input).root;
    ({ scannedSlots, output: tree.toString(), nodes: tree.first.nodes.length });
  `).runInContext(context, { timeout: 3_000 });
}

for (const [label, atom] of [['classes', '.a'], ['ids', '#a'], ['Sass interpolation', '#{a}']]) {
  test(`embedded parser ${label}: index scanning stays linear after the upstream backport`, () => {
    const source = originals['index.edge.js'];
    const patched = patchSource('index.edge.js', source).source;
    const old = measure(source, atom, 2_000);
    const small = measure(patched, atom, 1_000);
    const large = measure(patched, atom, 2_000);
    assert.equal(large.output, old.output);
    assert.equal(large.nodes, old.nodes);
    // Count actual array-index scan steps, not timing; concurrent builds cannot
    // turn the deterministic complexity assertion into a flaky wall-clock test.
    assert.ok(old.scannedSlots > 1_000_000, JSON.stringify(old.scannedSlots));
    assert.ok(large.scannedSlots < 20_000, JSON.stringify(large.scannedSlots));
    assert.ok(large.scannedSlots <= small.scannedSlots * 2 + 20);
  });
}
