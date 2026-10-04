import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const modules = new Map();
function loadSource(filename) {
  if (modules.has(filename)) return modules.get(filename).exports;
  const loadedModule = { exports: {} };
  modules.set(filename, loadedModule);
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  }).outputText;
  const localRequire = (request) => {
    const target = request.startsWith("@/")
      ? resolve(repoRoot, "src", request.slice(2))
      : resolve(dirname(filename), request);
    return loadSource(`${target}.ts`);
  };
  vm.runInNewContext(compiled, { module: loadedModule, exports: loadedModule.exports, require: localRequire }, { filename });
  return loadedModule.exports;
}

const batch = loadSource(resolve(repoRoot, "src/lib/simpleCalculators/batch2.ts"));
const calculators = Object.values(batch).find(Array.isArray);
const calculator = calculators.find((item) => item.slug === "corporate-tax-quick");
assert.ok(calculator, "actual corporate calculator must be present");

// Independently accumulate each marginal band from the NTS general for-profit
// table for business years starting on/after 2026-01-01. This uses neither the
// implementation's branches nor its progressive deductions.
function referenceTax(base) {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of [[200_000_000, 0.10], [20_000_000_000, 0.20],
    [300_000_000_000, 0.22], [Infinity, 0.25]]) {
    tax += Math.max(0, Math.min(base, upper) - lower) * rate;
    lower = upper;
  }
  return tax;
}

test("default 100 million base yields 10 million national tax and 1 million local estimate", () => {
  const result = calculator.compute({ base: 100_000_000 });
  assert.equal(result.primary.value, 10_000_000);
  assert.equal(result.secondary[0].value, 1_000_000);
  assert.equal(result.primary.value + result.secondary[0].value, 11_000_000);
});

test("all three band boundaries and adjacent won match independent marginal sums", () => {
  for (const boundary of [200_000_000, 20_000_000_000, 300_000_000_000]) {
    const outputs = [-1, 0, 1].map((offset) => {
      const base = boundary + offset;
      const expected = referenceTax(base);
      const result = calculator.compute({ base });
      assert.equal(result.primary.value, Math.round(expected), `national tax at ${base}`);
      assert.equal(result.secondary[0].value, Math.round(expected * 0.1), `local estimate at ${base}`);
      return result.primary.value;
    });
    assert.ok(outputs[0] <= outputs[1] && outputs[1] <= outputs[2], `no downward jump at ${boundary}`);
    assert.ok(outputs[2] - outputs[0] <= 1, `no artificial step at ${boundary}`);
  }
});

test("zero and interior values of every band match independent marginal sums", () => {
  for (const base of [0, 1, 50_000_000, 1_000_000_000, 100_000_000_000, 400_000_000_000]) {
    assert.equal(calculator.compute({ base }).primary.value, Math.round(referenceTax(base)), `base ${base}`);
  }
});
