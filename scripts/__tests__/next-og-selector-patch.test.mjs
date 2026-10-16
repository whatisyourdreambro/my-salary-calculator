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

test('the pinned patch retains the upstream MIT notice and changes no image/WASM implementation', () => {
  const license = fs.readFileSync(path.join(root, 'scripts/vendor-patches/LICENSE.postcss-selector-parser'), 'utf8').replace(/\r\n/g, '\n').trim();
  assert.match(license, /Copyright \(c\) Ben Briggs/);
  assert.match(license, /Permission is hereby granted, free of charge/);
  for (const [name, source] of Object.entries(originals)) {
    const patched = patchSource(name, source).source;
    assert.ok(patched.includes(`/*!\n${license}\n*/`));
    // The parser's factory export and all later Satori/OG/WASM/font code retain
    // their exact original bytes. This does not claim PNG rendering coverage.
    assert.equal(patched.slice(patched.indexOf('\nvar ou =')), source.slice(source.indexOf('\nvar ou =')));
  }
});

function parserContext(source) {
  // Exact pinned bundle boundary: evaluate only dependency declarations through
  // the parser/processor, before ImageResponse/WASM initialization. No Node modules, timers,
  // network, image rendering, or browser surface is exposed to this context.
  const end = source.indexOf('\nvar ou =');
  assert.ok(end > 0 && source.indexOf('\nvar ou =', end + 1) < 0);
  const context = vm.createContext({
    process: Object.freeze({ env: Object.freeze({ NODE_ENV: 'production' }) }),
    TextEncoder, TextDecoder,
    console: { log() {}, warn() {}, error() {} },
    fetch() { throw new Error('Network forbidden in parser regression'); },
    WebAssembly: undefined,
  });
  new vm.Script(source.slice(0, end) + '\nthis.Parser = ru(); this.Processor = iu();').runInContext(context, { timeout: 2_000 });
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
  test(`${name}: backport has byte-identical output and AST on ${corpus.length} ordinary selectors`, () => {
    const before = parserContext(originals[name]);
    const after = parserContext(patchSource(name, originals[name]).source);
    before.inputs = corpus; after.inputs = corpus;
    const originalResults = JSON.parse(JSON.stringify(parseCorpus.runInContext(before, { timeout: 5_000 })));
    const patchedResults = JSON.parse(JSON.stringify(parseCorpus.runInContext(after, { timeout: 5_000 })));
    assert.deepEqual(patchedResults, originalResults);
    assert.ok(patchedResults.filter(item => item.output !== undefined).length > 1_000);
  });
}

function evaluatePatched(name, code) {
  return new vm.Script(code).runInContext(parserContext(patchSource(name, originals[name]).source), { timeout: 3_000 });
}

for (const name of Object.keys(originals)) {
  test(`${name}: parse and serialize enforce the upstream 256 boundary with catchable errors`, () => {
    const result = evaluatePatched(name, `(() => {
      const nested = count => ':not('.repeat(count) + '.x' + ')'.repeat(count);
      const failures = [];
      for (const count of [257, 2_000]) {
        try { new Parser(nested(count)); failures.push(null); }
        catch (error) { failures.push({ name: error.name, message: error.message }); }
      }
      return { exact: new Parser(nested(256)).root.toString() === nested(256), failures };
    })()`);
    assert.equal(result.exact, true);
    for (const error of result.failures) {
      assert.equal(error?.name, 'Error');
      assert.match(error.message, /Cannot parse selector: nesting depth exceeds the maximum of 256\./);
    }
  });

  test(`${name}: trusted limits propagate and invalid options cannot disable the guard`, () => {
    const result = evaluatePatched(name, `(() => {
      const nested = count => ':not('.repeat(count) + '.x' + ')'.repeat(count);
      const errorOf = callback => { try { callback(); return null; } catch(error) { return error.name + ': ' + error.message; } };
      const errors = [
        errorOf(() => new Parser(nested(9), { maxNestingDepth: 8 })),
        errorOf(() => new Parser(nested(9)).root.toString({ maxNestingDepth: 8 })),
        errorOf(() => new Processor(null, { maxNestingDepth: 8 }).processSync(nested(9))),
        errorOf(() => new Processor().processSync(nested(9), { maxNestingDepth: 8 })),
        errorOf(() => new Parser(':not(.x)', { maxNestingDepth: 0 })),
      ];
      for (const option of [NaN, Infinity, -1, 1.5, '99999', null]) {
        errors.push(errorOf(() => new Parser(nested(257), { maxNestingDepth: option })));
        errors.push(errorOf(() => new Parser(nested(256)).root.toString({ maxNestingDepth: option })));
      }
      return {
        errors,
        normal: new Processor(null, { maxNestingDepth: 8 }).processSync(nested(8)),
        override: new Processor(null, { maxNestingDepth: 8 }).processSync(nested(9), { maxNestingDepth: 9 }),
        loosen: new Parser(nested(260), { maxNestingDepth: 260 }).root.toString({ maxNestingDepth: 260 }) === nested(260),
      };
    })()`);
    assert.equal(result.normal, ':not('.repeat(8) + '.x' + ')'.repeat(8));
    assert.equal(result.override, ':not('.repeat(9) + '.x' + ')'.repeat(9));
    assert.equal(result.loosen, true);
    for (const error of result.errors.slice(0, 5)) assert.match(error, /^Error: Cannot (parse|serialize) selector: nesting depth exceeds the maximum of (8|0)\./);
    for (let i = 5; i < result.errors.length; i += 2) {
      assert.match(result.errors[i], /^Error: Cannot parse selector: nesting depth exceeds the maximum of 256\./);
      assert.equal(result.errors[i + 1], null);
    }
  });

  test(`${name}: programmatic deep trees cannot bypass stringify, clone or walk guards`, () => {
    const result = evaluatePatched(name, `(() => {
      const root = new Parser('.x').root;
      const Pseudo = new Parser(':not(.x)').root.first.first.constructor;
      const Selector = root.first.constructor;
      const leaf = root.first.first;
      let current = root.first;
      leaf.remove();
      for (let index = 0; index < 2_000; index++) {
        const pseudo = new Pseudo({ value: ':not' });
        const selector = new Selector();
        current.append(pseudo); pseudo.append(selector); current = selector;
      }
      current.append(leaf);
      const errors = [];
      for (const action of [() => root.toString(), () => root.clone(), () => root.walk(() => {})]) {
        try { action(); errors.push(null); } catch(error) { errors.push({ name: error.name, message: error.message }); }
      }
      let calls = 0;
      const stopped = root.walk(() => { calls++; return false; });
      return { errors, stopped, calls };
    })()`);
    for (const [index, action] of ['serialize', 'clone', 'walk'].entries()) {
      assert.equal(result.errors[index]?.name, 'Error');
      assert.match(result.errors[index].message, new RegExp(`^Cannot ${action} selector: nesting depth exceeds the maximum of 256\\.$`));
    }
    assert.equal(result.stopped, false);
    assert.equal(result.calls, 1);
  });

  test(`${name}: ordinary clones, walks, trailing commas and non-node coercion retain behavior`, () => {
    const script = new vm.Script(`(() => {
      const root = new Parser(':not(:is(.a,#b)) > [title="ok"], ').root;
      const visited = [];
      root.walk(node => { visited.push(node.type + ':' + String(node.value || '')); });
      const clone = root.clone();
      clone.first.first.value = ':where';
      const arrayTree = new Parser('.a').root;
      arrayTree.first.first.replaceWith([new Parser('.b').root.first.first]);
      return JSON.stringify({ original: root.toString(), clone: clone.toString(), visited, fallback: arrayTree.toString() });
    })()`);
    const before = script.runInContext(parserContext(originals[name]), { timeout: 3_000 });
    const after = script.runInContext(parserContext(patchSource(name, originals[name]).source), { timeout: 3_000 });
    assert.equal(after, before);
  });

  test(`${name}: processor applies serialization limits after synchronous or asynchronous transforms`, async () => {
    const context = parserContext(patchSource(name, originals[name]).source);
    const result = await new vm.Script(`(async () => {
      const nested = count => ':not('.repeat(count) + '.x' + ')'.repeat(count);
      const expand = root => { root.nodes = new Parser(nested(9)).root.nodes; };
      const options = { maxNestingDepth: 8, updateSelector: true };
      const errors = [];
      for (const input of ['.x', { selector: '.x' }]) {
        try { new Processor(expand).processSync(input, options); errors.push(null); }
        catch (error) { errors.push(error.name + ': ' + error.message); }
      }
      for (const input of ['.x', { selector: '.x' }]) {
        try { await new Processor(expand).process(input, options); errors.push(null); }
        catch (error) { errors.push(error.name + ': ' + error.message); }
      }
      return errors;
    })()` ).runInContext(context, { timeout: 3_000 });
    assert.equal(result.length, 4);
    for (const error of result) assert.match(error, /^Error: Cannot serialize selector: nesting depth exceeds the maximum of 8\./);
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
