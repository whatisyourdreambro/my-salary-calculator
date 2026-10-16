/* eslint-disable @typescript-eslint/no-explicit-any -- Plain-object React hook/JSX test runtime; no DOM or network. */
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { assetInComparisonCurrency } from "../exchangeMath";

const source = ts.transpileModule(readFileSync("src/components/ExchangeRateDisplay.tsx", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
}).outputText;

function runtime() {
  const hooks: any[] = [], requests: any[] = [], updatesAfterUnmount: unknown[] = [];
  let cursor = 0, effects: any[] = [], tree: any, mounted = true;
  const jsx = (type: unknown, props: unknown) => ({ type, props });
  const memo = (factory: () => unknown, dependencies: unknown[]) => {
    const index = cursor++, previous = hooks[index];
    if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
      hooks[index] = { dependencies, value: factory() };
    }
    return hooks[index].value;
  };
  const react = {
    useState(initial: any) {
      const index = cursor++;
      hooks[index] ??= { value: typeof initial === "function" ? initial() : initial };
      return [hooks[index].value, (value: any) => {
        if (!mounted) updatesAfterUnmount.push(value);
        hooks[index].value = typeof value === "function" ? value(hooks[index].value) : value;
      }];
    },
    useRef(initial: unknown) { const index = cursor++; return hooks[index] ??= { current: initial }; },
    useMemo: memo,
    useCallback: (callback: () => unknown, dependencies: unknown[]) => memo(() => callback, dependencies),
    useEffect(create: () => unknown, dependencies: unknown[]) {
      const index = cursor++, previous = hooks[index];
      if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        effects.push({ index, create, dependencies, previous });
      }
    },
  };
  const context = {
    exports: {} as any, AbortController, encodeURIComponent,
    fetch(url: string, options: RequestInit = {}) {
      return new Promise((resolve) => requests.push({ url, signal: options.signal, resolve }));
    },
    setInterval: () => 1, clearInterval: () => {},
    require(name: string) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "next/navigation") return { useSearchParams: () => new URLSearchParams() };
      if (name === "@/lib/exchangeMath") return { assetInComparisonCurrency };
      if (name === "framer-motion") return { motion: new Proxy({}, { get: (_, key) => `motion.${String(key)}` }), AnimatePresence: "AnimatePresence" };
      if (["lucide-react", "recharts"].includes(name)) return new Proxy({}, { get: (_, key) => `${name}.${String(key)}` });
      if (name.startsWith("./") || name.startsWith("@/components/") || name === "react-countup") return { __esModule: true, default: name };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(source, context);
  function render() {
    cursor = 0; effects = []; tree = context.exports.default();
    for (const effect of effects) effect.previous?.cleanup?.();
    for (const effect of effects) hooks[effect.index] = { dependencies: effect.dependencies, cleanup: effect.create() };
  }
  function walk(node: any): any[] {
    if (Array.isArray(node)) return node.flatMap((child) => walk(child));
    return node && typeof node === "object" ? [node, ...walk(node.props?.children)] : [];
  }
  const nodes = () => walk(tree);
  function text(node: any): string {
    if (Array.isArray(node)) return node.map(text).join(" ");
    return node == null || typeof node === "boolean" ? "" : typeof node === "object" ? text(node.props?.children) : String(node);
  }
  async function respond(request: any, rate: number) {
    request.resolve({ ok: true, json: async () => ({ rates: { KRW: rate } }) });
    await new Promise<void>((resolve) => setImmediate(resolve));
    if (mounted) render();
  }
  render();
  return {
    requests, nodes, text, render, respond, updatesAfterUnmount,
    pairRequests: () => requests.filter((request) => request.url.includes("frankfurter")),
    rates: () => nodes().filter((node) => node.type === "@/components/NumberInput").map((node) => node.props.value),
    unmount() { for (const hook of hooks) hook?.cleanup?.(); mounted = false; },
  };
}

describe("exchange historical request lifecycle (offline)", () => {
  it("keeps the latest currency response when an older request finishes last", async () => {
    const app = runtime(), oldRequest = app.pairRequests()[0];
    app.nodes().find((node) => node.type === "select").props.onChange({ target: { value: "JPY" } });
    app.render();
    const newRequest = app.pairRequests()[1];
    expect(oldRequest.signal.aborted).toBe(true);
    await app.respond(newRequest, 9.5);
    expect(app.rates()[0]).toBe("9.5000");
    await app.respond(oldRequest, 1300);
    expect(app.rates()[0]).toBe("9.5000"); app.unmount();
  });
  it("does not overwrite manual input with a pending automatic response", async () => {
    const app = runtime(), pending = app.pairRequests()[0];
    app.nodes().find((node) => node.type === "button" && app.text(node).includes("수동 입력")).props.onClick();
    app.render();
    const inputs = app.nodes().filter((node) => node.type === "@/components/NumberInput");
    inputs[0].props.onChange({ target: { value: "1234" } }); app.render();
    await app.respond(pending, 999);
    expect(app.rates()[0]).toBe("1234"); expect(pending.signal.aborted).toBe(true); app.unmount();
  });
  it("aborts both providers on unmount and ignores queued responses", async () => {
    const app = runtime(), pending = app.pairRequests()[0]; app.unmount();
    expect(app.requests.every((request) => request.signal.aborted)).toBe(true);
    await app.respond(pending, 1300);
    expect(app.updatesAfterUnmount).toEqual([]);
  });
});
