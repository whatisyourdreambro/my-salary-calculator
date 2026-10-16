import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const cache = new Map();
function load(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const loadedModule = { exports: {} };
  cache.set(filename, loadedModule);
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  }).outputText;
  const localRequire = (request) => load(`${request.startsWith("@/")
    ? resolve(root, "src", request.slice(2)) : resolve(dirname(filename), request)}.ts`);
  vm.runInNewContext(compiled, { module: loadedModule, exports: loadedModule.exports, require: localRequire }, { filename });
  return loadedModule.exports;
}
const batch1 = Object.values(load(resolve(root, "src/lib/simpleCalculators/batch1.ts"))).find(Array.isArray);
const find = (slug) => batch1.find((c) => c.slug === slug);

test("monthly deposits reach one million only on the fourth 300,000-won zero-rate deposit", () => {
  const calculator = find("savings-goal-time");
  const result = calculator.compute({ goal: 1_000_000, monthly: 300_000, rate: 0 });
  assert.equal(result.secondary[0].value, 4);
  assert.equal(result.primary.value, (10 / 3) / 12);
  let saved = 0;
  let deposits = 0;
  while (saved < 1_000_000) { saved += 300_000; deposits++; }
  assert.equal(result.secondary[0].value, deposits);
  assert.equal(calculator.compute({ goal: 900_000, monthly: 300_000, rate: 0 }).secondary[0].value, 3);
});

test("stock contribution uses the same normalized weights as total portfolio return", () => {
  const result = find("portfolio-allocation").compute({ stockPct: 120, bondPct: 60, cashPct: 20 });
  assert.equal(result.primary.value, 6.25);
  assert.equal(result.secondary[1].value, 4.8);
  assert.equal(120 / 200 * 8 + 60 / 200 * 4 + 20 / 200 * 2.5, result.primary.value);
});

test("zero portfolio remains invalid for the UI while every numeric result is finite", () => {
  const result = find("portfolio-allocation").compute({ stockPct: 0, bondPct: 0, cashPct: 0 });
  assert.equal(result.status, "invalid");
  assert.ok(Number.isFinite(result.primary.value));
  assert.ok(result.secondary.every((row) => Number.isFinite(row.value)));
});

test("normal 100-percent portfolio and zero target retain their numerical outputs", () => {
  const result = find("portfolio-allocation").compute({ stockPct: 60, bondPct: 30, cashPct: 10 });
  assert.equal(result.primary.value, 6.25);
  assert.equal(result.secondary[1].value, 4.8);
  const zeroGoal = find("savings-goal-time").compute({ goal: 0, monthly: 300_000, rate: 0 });
  assert.equal(zeroGoal.primary.value, 0);
  assert.equal(zeroGoal.secondary[0].value, 0);
});
