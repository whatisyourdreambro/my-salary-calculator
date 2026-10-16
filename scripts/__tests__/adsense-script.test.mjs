import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

// Run the real component and guard with deterministic hooks. next/script is a
// JSX token only: these tests cannot download, execute or request any live ad.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = resolve(root, "src/components/AdSenseScript.tsx");
const guardPath = resolve(root, "src/lib/liveAds.ts");
const compile = (filename) => ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const compiled = compile(sourcePath);
const compiledGuard = compile(guardPath);

function createRuntime({ server = false, nodeEnv = "production", protocol = "https:", hostname = "www.moneysalary.com", webdriver = false,
  topLevel = true, search = "", userAgent = "Mozilla/5.0", testMode = false, adsDisabled = "", storedOptOut = false } = {}) {
  const hooks = [];
  const ScriptToken = Symbol("next/script");
  const scriptElements = [];
  let cursor = 0;
  let effects = [];
  let dirty = false;
  let tree;
  const react = {
    useState(initial) {
      const index = cursor++;
      hooks[index] ??= { value: initial };
      return [hooks[index].value, (value) => {
        if (!Object.is(hooks[index].value, value)) {
          hooks[index].value = value;
          dirty = true;
        }
      }];
    },
    useEffect(create, dependencies) {
      const index = cursor++;
      hooks[index] ??= {};
      const previous = hooks[index].dependencies;
      if (!previous || previous.length !== dependencies.length || dependencies.some((value, i) => !Object.is(value, previous[i]))) {
        effects.push(() => {
          hooks[index].dependencies = dependencies;
          create();
        });
      }
    },
  };
  const jsx = (type, props) => {
    const element = { type, props };
    if (type === ScriptToken) scriptElements.push(element);
    return element;
  };
  // A complete, inert top-level browser facade is necessary: unknown frame or
  // storage state deliberately denies ads. No DOM, network API or real Script
  // implementation is provided to either VM.
  const storage = new Map(storedOptOut ? [["msy:disable-live-services", "1"]] : []);
  const browser = {
    location: { protocol, hostname, search }, navigator: { webdriver, userAgent },
    frameElement: topLevel ? null : {}, __MSY_TEST_MODE__: testMode,
    sessionStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)) },
  };
  browser.top = topLevel ? browser : {};
  browser.parent = topLevel ? browser : {};
  const environment = {
    process: { env: { NODE_ENV: nodeEnv, NEXT_PUBLIC_ADS_DISABLED: adsDisabled } },
    URLSearchParams,
    ...(!server && { window: browser }),
  };
  const liveAds = {};
  vm.runInNewContext(compiledGuard, { ...environment, exports: liveAds }, { filename: guardPath });
  const context = {
    ...environment,
    exports: {},
    require(name) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "next/script") return { default: ScriptToken };
      if (name === "@/lib/liveAds") return liveAds;
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(compiled, context, { filename: sourcePath });

  function render() {
    cursor = 0;
    effects = [];
    dirty = false;
    tree = context.exports.default();
    return tree;
  }

  function flushEffects() {
    let turns = 0;
    do {
      assert.ok(++turns < 10, "passive/state updates must settle");
      const pending = effects.splice(0);
      for (const effect of pending) effect();
      if (dirty) render();
    } while (effects.length || dirty);
    return tree;
  }

  return { render, flushEffects, scriptElements, ScriptToken, liveAds };
}

test("SSR renders no Script and the real guard is safe without window", () => {
  const runtime = createRuntime({ server: true });
  assert.equal(runtime.liveAds.canRequestLiveAds(), false);
  assert.equal(runtime.render(), null);
  assert.equal(runtime.scriptElements.length, 0, "SSR cannot create a next/script preload");
});

for (const hostname of ["moneysalary.com", "www.moneysalary.com"]) {
  test(`HTTPS production ${hostname} enables the unchanged script only after the client effect`, () => {
    const runtime = createRuntime({ hostname });
    assert.equal(runtime.render(), null, "initial hydration agrees with server output");
    assert.equal(runtime.scriptElements.length, 0);
    const script = runtime.flushEffects();
    assert.equal(script.type, runtime.ScriptToken);
    assert.equal(script.props.src, "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2873403048341290");
    assert.equal(script.props.async, true);
    assert.equal(script.props.crossOrigin, "anonymous");
    assert.equal(script.props.strategy, "afterInteractive");
    assert.equal(runtime.scriptElements.length, 1);
    runtime.flushEffects();
    assert.equal(runtime.scriptElements.length, 1, "settled effects do not add another Script element");
  });
}

for (const [name, environment] of [
  ["localhost", { hostname: "localhost" }],
  ["loopback", { hostname: "127.0.0.1" }],
  ["Cloudflare preview", { hostname: "a1b2c3d4.my-salary-calculator.pages.dev" }],
  ["development build", { nodeEnv: "development" }],
  ["test build", { nodeEnv: "test" }],
  ["HTTP production host", { protocol: "http:" }],
  ["WebDriver", { webdriver: true }],
  ["embedded frame", { topLevel: false }],
  ["QA user agent", { userAgent: "MoneySalary-QA/1.0" }],
  ["explicit test marker", { testMode: true }],
  ["test build switch", { adsDisabled: "1" }],
  ["query opt-out", { search: "?ads=off&ads=on" }],
  ["persisted session opt-out", { storedOptOut: true }],
  ["lookalike host", { hostname: "www.moneysalary.com.example.com" }],
]) {
  test(`${name} never creates the AdSense Script before or after the client effect`, () => {
    const runtime = createRuntime(environment);
    assert.equal(runtime.render(), null);
    assert.equal(runtime.flushEffects(), null);
    assert.equal(runtime.scriptElements.length, 0);
  });
}
