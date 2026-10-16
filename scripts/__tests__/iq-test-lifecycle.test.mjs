import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const sourcePath = resolve(dirname(fileURLToPath(import.meta.url)), "../../src/app/fun/iq-test/IQTestClient.tsx");
const compiled = ts.transpileModule(readFileSync(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
}).outputText;

// Real component, deterministic React hook/timer fakes, no browser or network.
// Queue state changes so repeated calls share the same pre-render event handler.
function createRuntime() {
  const hooks = [];
  const updates = [];
  const timers = new Map();
  let cursor = 0;
  let nextTimer = 1;
  let tree;
  let mounted = true;
  const react = {
    useState(initial) {
      const index = cursor++;
      hooks[index] ??= { kind: "state", value: initial };
      return [hooks[index].value, (next) => updates.push(() => {
        assert.ok(mounted, "unmounted component cannot receive state updates");
        hooks[index].value = typeof next === "function" ? next(hooks[index].value) : next;
      })];
    },
    useRef(initial) {
      const index = cursor++;
      hooks[index] ??= { kind: "ref", current: initial };
      return hooks[index];
    },
    useEffect(create) {
      const index = cursor++;
      hooks[index] ??= { kind: "effect", cleanup: create() };
    },
  };
  const jsx = (type, props) => ({ type, props });
  const context = {
    exports: {},
    require(name) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "framer-motion") return { motion: new Proxy({}, { get: (_, key) => `motion.${String(key)}` }), AnimatePresence: "AnimatePresence" };
      if (name === "lucide-react") return new Proxy({}, { get: (_, key) => `icon.${String(key)}` });
      if (name === "@/components/AdPlacement") return { InArticleAd: "InArticleAd" };
      if (name === "@/components/ResultSharePanel" || name === "@/components/AppLink") return { __esModule: true, default: name };
      throw new Error(`Unexpected dependency: ${name}`);
    },
    setTimeout(callback, delay) { const id = nextTimer++; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    document: { getElementById: () => null },
  };
  vm.runInNewContext(compiled, context, { filename: sourcePath });
  const render = () => { cursor = 0; tree = context.exports.default(); };
  const flush = () => { while (updates.length) updates.shift()(); render(); };
  const advance = () => {
    const queued = [...timers.entries()];
    for (const [id, timer] of queued) { timers.delete(id); assert.equal(timer.delay, 300); timer.callback(); }
    flush();
  };
  const nodes = () => {
    const result = [];
    const visit = (node) => {
      if (Array.isArray(node)) return node.forEach(visit);
      if (!node || typeof node !== "object") return;
      result.push(node); visit(node.props?.children);
    };
    visit(tree); return result;
  };
  const collectText = (node) => {
    if (Array.isArray(node)) return node.map(collectText).join(" ");
    if (node == null || typeof node === "boolean") return "";
    return typeof node === "object" ? collectText(node.props?.children) : String(node);
  };
  const text = (node = tree) => collectText(node).replace(/\s+/g, " ");
  const answerButtons = () => nodes().filter((node) => node.type === "button" && Object.hasOwn(node.props, "disabled"));
  const buttons = () => nodes().filter((node) => node.type === "button");
  const unmount = () => { for (const hook of hooks) if (hook.kind === "effect") hook.cleanup?.(); mounted = false; };
  render();
  return { answerButtons, buttons, text, flush, advance, unmount, timers, updates };
}

test("sixteen rapid answers advance only one question and disable choices while pending", () => {
  const runtime = createRuntime();
  const first = runtime.answerButtons()[0];
  for (let i = 0; i < 16; i++) first.props.onClick();
  assert.equal(runtime.timers.size, 1);
  runtime.flush();
  assert.ok(runtime.answerButtons().every((button) => button.props.disabled));
  assert.match(runtime.text(), /Question 1\b/);
  runtime.advance();
  assert.match(runtime.text(), /Question 2\b/);
  assert.ok(runtime.answerButtons().every((button) => !button.props.disabled));
});

test("unmount cancels a pending question advance", () => {
  const runtime = createRuntime();
  runtime.answerButtons()[0].props.onClick();
  runtime.flush();
  assert.equal(runtime.timers.size, 1);
  runtime.unmount();
  assert.equal(runtime.timers.size, 0);
  assert.equal(runtime.updates.length, 0);
});

test("all fifteen existing answer choices retain the 150-point result and reset normally", () => {
  const runtime = createRuntime();
  const originalAnswers = [2, 1, 3, 1, 1, 3, 3, 2, 2, 1, 1, 0, 2, 1, 3];
  originalAnswers.forEach((answer, index) => {
    assert.match(runtime.text(), new RegExp(`Question ${index + 1}\\b`));
    runtime.answerButtons()[answer].props.onClick();
    if (index < originalAnswers.length - 1) runtime.advance();
    else runtime.flush();
  });
  assert.equal(runtime.timers.size, 0);
  assert.match(runtime.text(), /퀴즈 참고 점수\s+150\b/);
  assert.match(runtime.text(), /표준화된 지능검사나 공식 IQ 결과가 아닙니다/);
  runtime.buttons().find((button) => /다시 도전하기/.test(runtime.text(button))).props.onClick();
  runtime.flush();
  assert.match(runtime.text(), /Question 1\b/);
  assert.ok(runtime.answerButtons().every((button) => !button.props.disabled));
});
