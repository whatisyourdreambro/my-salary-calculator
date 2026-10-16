// Offline regression tests for the audited braces derivative; no browser/network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { verifyVendoredDependencies } from '../verify-vendored-dependencies.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(path.join(root, 'package.json'));
const patched = require('braces');
test('installed fork, source and tarball match the reviewed derivative', () => {
  assert.equal(verifyVendoredDependencies(root).pass, true);
});
const nested = (n, left = '{', right = '}') => left.repeat(n) + 'x' + right.repeat(n);
for (const method of ['parse', 'compile', 'expand', 'stringify']) {
  test(`${method}: depth 100 accepted; 101 rejected`, () => {
    patched[method](nested(100));
    assert.throws(() => patched[method](nested(101)), /nesting depth exceeds maximum/);
  });
  test(`${method}: 3500-deep input rejected before recursion`, () => {
    assert.throws(() => patched[method](nested(3500)), e => e.name === 'SyntaxError' && /nesting depth/.test(e.message));
  });
  test(`${method}: combined brace/paren depth bounded`, () => {
    assert.throws(() => patched[method]('{('.repeat(51) + 'x' + ')}'.repeat(51)), /nesting depth/);
  });
}
test('unclosed input cannot evade admission guard at end-of-string', () => assert.throws(() => patched.parse('{'.repeat(101)), /nesting depth/));
test('escaped/quoted/character-class literal braces preserve upstream output', () => {
  for (const value of ['\\{'.repeat(150), '"' + '{'.repeat(150) + '"', '[' + '{'.repeat(150) + ']']) {
    assert.deepEqual(patched(value), [value.startsWith('[') ? value : '{'.repeat(150)]);
  }
});
function ast(depth) {
  const root = { type: 'root', nodes: [] };
  let parent = root;
  for (let i = 0; i < depth; i++) {
    const child = { type: 'paren', nodes: [], parent };
    parent.nodes.push(child); parent = child;
  }
  parent.nodes.push({ type: 'text', value: 'x', parent });
  return root;
}
for (const method of ['compile', 'expand', 'stringify']) {
  test(`${method}: caller-created deep AST rejected`, () => assert.throws(() => patched[method](ast(3500)), /AST nesting depth/));
  test(`${method}: cyclic child AST rejected`, () => {
    const root = { type: 'root', nodes: [] }; root.nodes.push(root);
    assert.throws(() => patched[method](root), /AST nesting depth/);
  });
}
test('expand: caller-controlled parent cycle is bounded', () => {
  const root = { type: 'root', nodes: [] };
  const child = { type: 'paren', nodes: [] }; child.parent = child; root.nodes.push(child);
  assert.throws(() => patched.expand(root), /AST parent traversal/);
});
test('maxDepth options cannot disable the fixed guard', () => {
  for (const maxDepth of [Infinity, NaN, 100000, '100000', null]) {
    assert.throws(() => patched.compile(nested(101), { maxDepth }), /nesting depth/);
  }
});
test('NaN maxLength cannot disable the upstream character cap', () => {
  assert.throws(() => patched.parse('x'.repeat(10001), { maxLength: NaN }), /max characters/);
});
test('maxLength getter is evaluated only once', () => {
  let reads = 0;
  assert.throws(() => patched.parse('x'.repeat(10001), { get maxLength() { return ++reads === 1 ? 10000 : NaN; } }), /max characters/);
  assert.equal(reads, 1);
});
