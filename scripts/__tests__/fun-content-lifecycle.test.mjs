import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
function runtime(relativePath) {
  const hooks = [], updates = [], timers = new Map();
  let cursor = 0, now = 0, timerId = 0, mounted = true, tree, effects = [], computeCalls = 0;
  const hook = () => { const index = cursor++; return [index, hooks[index]]; };
  const react = {
    useState(initial) {
      const [index] = hook(); hooks[index] ??= { kind: "state", value: initial };
      return [hooks[index].value, (next) => updates.push(() => {
        assert.ok(mounted, "no state update after unmount");
        hooks[index].value = typeof next === "function" ? next(hooks[index].value) : next;
      })];
    },
    useRef(initial) { const [index] = hook(); hooks[index] ??= { kind: "ref", current: initial }; return hooks[index]; },
    useMemo(create) { hook(); return create(); },
    useEffect(create, dependencies) {
      const [index] = hook(); hooks[index] ??= { kind: "effect" };
      const effect = hooks[index];
      if (!effect.dependencies || !dependencies.every((value, i) => Object.is(value, effect.dependencies[i]))) {
        effects.push({ effect, create, dependencies });
      }
    },
  };
  const jsx = (type, props) => ({ type, props });
  const compiled = (file) => ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const actualGenerator = { exports: {} };
  vm.runInNewContext(compiled(resolve(root, "src/lib/lottoGenerator.ts")), actualGenerator);
  const context = {
    exports: {},
    require(name) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "framer-motion") return { motion: new Proxy({}, { get: (_, key) => `motion.${String(key)}` }), AnimatePresence: "AnimatePresence" };
      if (name === "lucide-react") return new Proxy({}, { get: (_, key) => `icon.${String(key)}` });
      if (name === "@/lib/lottoGenerator") return {
        generateLottoSets(...args) { computeCalls++; return actualGenerator.exports.generateLottoSets(...args); },
      };
      if (name === "@/components/AdPlacement") return { InArticleAd: "InArticleAd", CalcResultAd: "CalcResultAd" };
      if (name.startsWith("@/components/")) return { __esModule: true, default: name };
      throw new Error(`Unexpected dependency ${name}`);
    },
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, at: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    document: { getElementById: () => null },
    alert(message) { throw new Error(`Unexpected alert: ${message}`); },
  };
  vm.runInNewContext(compiled(resolve(root, relativePath)), context, { filename: relativePath });
  function render() {
    cursor = 0; effects = []; tree = context.exports.default();
    for (const { effect } of effects) effect.cleanup?.();
    for (const { effect, create, dependencies } of effects) {
      effect.dependencies = dependencies; effect.cleanup = create();
    }
  }
  function flush() { while (updates.length) updates.shift()(); render(); }
  function advance(ms) {
    const until = now + ms;
    while (true) {
      const next = [...timers.entries()].filter(([, timer]) => timer.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      now = next[1].at; timers.delete(next[0]); next[1].callback(); flush();
    }
    now = until;
  }
  function nodes() {
    const result = [];
    const visit = (node) => {
      if (Array.isArray(node)) return node.forEach(visit);
      if (node && typeof node === "object") { result.push(node); visit(node.props?.children); }
    };
    visit(tree); return result;
  }
  function collectText(node) {
    if (Array.isArray(node)) return node.map(collectText).join(" ");
    if (node == null || typeof node === "boolean") return "";
    return typeof node === "object" ? collectText(node.props?.children) : String(node);
  }
  const text = (node = tree) => collectText(node).replace(/\s+/g, " ");
  const buttons = () => nodes().filter((node) => ["button", "motion.button"].includes(node.type));
  const button = (label) => buttons().find((node) => text(node).trim() === label || node.props["aria-label"] === label);
  function unmount() {
    for (const entry of hooks) if (entry?.kind === "effect") entry.cleanup?.();
    mounted = false;
  }
  render();
  return { text, buttons, button, flush, advance, unmount, timers, get computeCalls() { return computeCalls; }, hooks };
}

for (const [name, path, nextQuestion, result, reset] of [
  ["spending", "src/app/fun/spending-test/page.tsx", /질문 2\b/, /욜로족 라이언/, "다시하기"],
  ["financial MBTI", "src/app/fun/financial-mbti/page.tsx", /STEP 2\b/, /안정 추구 투자자/, "Re-test"],
  ["rich DNA", "src/app/fun/rich-dna-test/RichDNAClient.tsx", /QUESTION 2\b/, /워렌 버핏/, "다시 테스트하기"],
]) {
  test(`${name}: repeated/stale question handlers advance once; four normal choices reach the original result`, () => {
    const app = runtime(path);
    const stale = app.buttons()[0];
    for (let i = 0; i < 16; i++) stale.props.onClick();
    app.flush(); assert.match(app.text(), nextQuestion);
    stale.props.onClick(); app.flush(); assert.match(app.text(), nextQuestion);
    for (let i = 0; i < 3; i++) { app.buttons()[0].props.onClick(); app.flush(); }
    assert.match(app.text(), result);
    const again = app.button(reset) ?? app.buttons().find((node) => /다시|Re-test/.test(app.text(node)));
    assert.ok(again, "result exposes reset"); again.props.onClick(); app.flush();
    assert.match(app.text(), /(?:질문|STEP|QUESTION) 1\b/);
    app.buttons()[0].props.onClick(); app.flush(); assert.match(app.text(), nextQuestion);
  });
}

test("lotto: reset cancels generation, including an already queued callback", () => {
  const app = runtime("src/app/lotto/page.tsx");
  app.button("번호 생성").props.onClick(); app.flush();
  const queued = [...app.timers.values()][0].callback;
  app.button("초기화").props.onClick(); app.flush();
  assert.equal(app.timers.size, 0); queued(); app.flush(); app.advance(4_000);
  assert.equal(app.computeCalls, 0); assert.doesNotMatch(app.text(), /생성 결과/);
  assert.equal(app.button("번호 생성").props.disabled, false);
});

test("lotto: reset cancels partial result reveals; the next generation retains five valid six-number sets", () => {
  const app = runtime("src/app/lotto/page.tsx");
  app.button("번호 생성").props.onClick(); app.flush(); app.advance(1_500);
  assert.match(app.text(), /생성 결과/);
  const staleReveal = [...app.timers.values()][0].callback;
  app.button("초기화").props.onClick(); app.flush(); staleReveal(); app.flush(); app.advance(4_000);
  assert.doesNotMatch(app.text(), /생성 결과/);
  app.button("번호 생성").props.onClick(); app.flush(); app.advance(4_000);
  const generated = app.hooks[4].value, revealed = app.hooks[7].value;
  assert.equal(generated.length, 5); assert.equal(revealed.length, 5);
  for (const set of revealed) {
    assert.equal(set.numbers.length, 6); assert.equal(new Set(set.numbers).size, 6);
    assert.ok(set.numbers.every((value) => value >= 1 && value <= 45));
  }
});

test("lotto: unmount cancels both pending generation and delayed reveals", () => {
  for (const elapsed of [0, 1_500]) {
    const app = runtime("src/app/lotto/page.tsx");
    app.button("번호 생성").props.onClick(); app.flush(); app.advance(elapsed);
    assert.ok(app.timers.size); app.unmount(); assert.equal(app.timers.size, 0); app.advance(4_000);
  }
});
