// Isolated, offline tests for the local fork. No browser or network APIs.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const base = __dirname;
const baselineRequire = createRequire(path.join(base, 'baseline/package.json'));
const candidateRequire = createRequire(path.join(base, process.env.MSY_CSS_CANDIDATE || 'candidate-final', 'package.json'));
const upstream = baselineRequire('braces');
const patched = candidateRequire('braces');
const candidateRoot = path.join(base, process.env.MSY_CSS_CANDIDATE || 'candidate-final') + path.sep;
assert.ok(candidateRequire.resolve('braces').startsWith(candidateRoot), 'The fixture must not resolve an ancestor installation');
const patchedRequire = createRequire(candidateRequire.resolve('braces'));
assert.ok(patchedRequire.resolve('fill-range').startsWith(candidateRoot), 'The fork dependency must be installed inside the fixture');
const results = [];
function check(name, fn) { fn(); results.push({ name, pass: true }); }
const nested = (n, left = '{', right = '}') => left.repeat(n) + 'x' + right.repeat(n);
for (const method of ['parse', 'compile', 'expand', 'stringify']) {
  check(`${method}: depth 100 accepted; 101 rejected`, () => {
    patched[method](nested(100));
    assert.throws(() => patched[method](nested(101)), /nesting depth exceeds maximum/);
  });
  check(`${method}: 3500-deep input rejected before recursion`, () => {
    assert.throws(() => patched[method](nested(3500)), e => e.name === 'SyntaxError' && /nesting depth/.test(e.message));
  });
  check(`${method}: combined brace/paren depth bounded`, () => {
    assert.throws(() => patched[method]('{('.repeat(51) + 'x' + ')}'.repeat(51)), /nesting depth/);
  });
}
check('unclosed input cannot evade admission guard at end-of-string', () => assert.throws(() => patched.parse('{'.repeat(101)), /nesting depth/));
check('escaped/quoted/character-class literal braces preserve upstream output', () => {
  for (const value of ['\\{'.repeat(150), '"' + '{'.repeat(150) + '"', '[' + '{'.repeat(150) + ']']) {
    assert.deepEqual(patched(value), upstream(value));
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
  check(`${method}: caller-created deep AST rejected`, () => assert.throws(() => patched[method](ast(3500)), /AST nesting depth/));
  check(`${method}: cyclic child AST rejected`, () => {
    const root = { type: 'root', nodes: [] }; root.nodes.push(root);
    assert.throws(() => patched[method](root), /AST nesting depth/);
  });
}
check('expand: caller-controlled parent cycle is bounded', () => {
  const root = { type: 'root', nodes: [] };
  const child = { type: 'paren', nodes: [] }; child.parent = child; root.nodes.push(child);
  assert.throws(() => patched.expand(root), /AST parent traversal/);
});
check('maxDepth options cannot disable the fixed guard', () => {
  for (const maxDepth of [Infinity, NaN, 100000, '100000', null]) {
    assert.throws(() => patched.compile(nested(101), { maxDepth }), /nesting depth/);
  }
});
check('NaN maxLength cannot disable the upstream character cap', () => {
  assert.throws(() => patched.parse('x'.repeat(10001), { maxLength: NaN }), /max characters/);
});
check('maxLength getter is evaluated only once', () => {
  let reads = 0;
  assert.throws(() => patched.parse('x'.repeat(10001), { get maxLength() { return ++reads === 1 ? 10000 : NaN; } }), /max characters/);
  assert.equal(reads, 1);
});
const patterns = [
  '', 'x', 'src/**/*.{ts,tsx}', '**/*.{js,cjs,mjs}', 'a/{b,c}/d', '{1..20}',
  '{01..05}', '{a..f}', '{-3..3}', '{1..9..2}', '${a,b}', '\\{a,b}',
  '{a,{b,c}}', 'x{a,b}{1,2}', '{,a,,b}', '(x{a,b})', '[{a,b}]',
  '"{a,b}"', "'{a,b}'", '{a,b', 'a,b}', '{a..z,foo}', '{a..b..c}',
];
for (let i = 0; i < 250; i++) {
  const a = String.fromCharCode(97 + i % 20), b = String.fromCharCode(97 + (i + 3) % 20);
  patterns.push(`src/${a}/{${b},${i % 10},{${a},x}}/*.{js,ts}`);
}
let differentialChecks = 0;
for (const value of patterns) for (const options of [{}, { keepQuotes: true }, { escapeInvalid: true }, { nodupes: true, noempty: true }]) {
  for (const method of ['compile', 'expand', 'stringify']) {
    assert.deepEqual(patched[method](value, options), upstream[method](value, options), `${method}: ${value}`);
    differentialChecks++;
  }
}
const report = { generatedAt: new Date().toISOString(), offline: true,
  candidatePackage: candidateRequire('braces/package.json'),
  resolvedPath: candidateRequire.resolve('braces'), boundaryAndSecurityChecks: results,
  differentialPatterns: patterns.length, differentialChecks,
  limitation: 'Fixed nesting/parent traversal bounds address this advisory. Expansion cardinality, arbitrary AST width and hostile getters are not a complete sandbox guarantee.', pass: true };
fs.writeFileSync(path.join(base, 'braces-regressions.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ pass: true, boundaryAndSecurityChecks: results.length, differentialPatterns: patterns.length, differentialChecks, resolvedPath: report.resolvedPath }, null, 2));
