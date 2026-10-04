import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

// Exercise the real AdSlot function with deterministic passive-effect and DOM
// fakes. No source-pattern assertions, browsers, ad scripts, network or real
// environment variables are used. A disconnected observer may still have an
// already queued intersection notification, which the tests deliver explicitly.
const sourcePath = resolve(dirname(fileURLToPath(import.meta.url)), "../../src/components/AdPlacement.tsx");
const compiled = ts.transpileModule(readFileSync(sourcePath, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;

function createRuntime() {
  let currentFiber;
  const fibers = [];
  const intersections = [];
  const adPushes = [];
  const events = [];

  function hook() {
    assert.ok(currentFiber, "hooks must run inside an AdSlot render");
    const fiber = currentFiber;
    const index = fiber.cursor++;
    return { fiber, index };
  }

  const react = {
    useRef(initial) {
      const { fiber, index } = hook();
      fiber.hooks[index] ??= { kind: "ref", current: initial };
      return fiber.hooks[index];
    },
    useState(initial) {
      const { fiber, index } = hook();
      fiber.hooks[index] ??= { kind: "state", value: initial };
      const state = fiber.hooks[index];
      return [state.value, (next) => fiber.updates.push(() => {
        const value = typeof next === "function" ? next(state.value) : next;
        if (Object.is(value, state.value)) return false;
        state.value = value;
        return true;
      })];
    },
    useEffect(create, dependencies) {
      const { fiber, index } = hook();
      fiber.hooks[index] ??= { kind: "effect" };
      const effect = fiber.hooks[index];
      const equal = effect.dependencies && dependencies &&
        effect.dependencies.length === dependencies.length &&
        dependencies.every((value, i) => Object.is(value, effect.dependencies[i]));
      if (!equal) fiber.effects.push({ effect, create, dependencies });
    },
  };

  function insElement(props) {
    return {
      isConnected: true,
      getAttribute: (name) => props[name] ?? null,
      querySelector: () => null,
      getBoundingClientRect: () => ({ top: 2_000, bottom: 2_250, width: 320, height: 250 }),
    };
  }

  function containerElement() {
    return {
      isConnected: true,
      ins: null,
      querySelector(selector) {
        return ["ins.adsbygoogle", "ins.adsbygoogle[data-ad-slot]"].includes(selector) ? this.ins : null;
      },
      contains(element) { return this.ins === element; },
      getBoundingClientRect: () => ({ top: 2_000, bottom: 2_270, width: 320, height: 270 }),
    };
  }

  class FakeIntersectionObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.disconnected = false;
      intersections.push(this);
    }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
    deliverQueuedIntersection() {
      // Intentionally deliver even after disconnect: this models a notification
      // already queued before passive-effect cleanup, not a new observation.
      this.callback([{
        target: this.target,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: this.target.getBoundingClientRect(),
      }], this);
    }
  }

  class FakeMutationObserver {
    constructor(callback) { this.callback = callback; }
    observe() {}
    disconnect() {}
  }

  const jsx = (type, props) => ({ type, props });
  const context = {
    exports: {},
    // A synthetic public slot ID only; never read the operator's env files.
    process: { env: { NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP: "1234567890" } },
    require(name) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "next/navigation") return { usePathname: () => currentFiber.pathname };
      if (name === "@/lib/vitalsAttribution") return { viewportBucket: () => "m" };
      if (name === "@/lib/analytics") return {
        trackAdRequestAttempt: (...params) => events.push({ name: "attempt", params }),
        trackAdRequestError: (...params) => events.push({ name: "error", params }),
        trackAdUnitClick: (...params) => events.push({ name: "click", params }),
        trackAdFillStatus: (...params) => events.push({ name: "fill", params }),
      };
      throw new Error(`Unexpected dependency: ${name}`);
    },
    window: {
      adsbygoogle: { push(value) { adPushes.push(value); return adPushes.length; } },
      addEventListener() {},
      removeEventListener() {},
      innerHeight: 800,
      innerWidth: 375,
    },
    document: { activeElement: null },
    IntersectionObserver: FakeIntersectionObserver,
    MutationObserver: FakeMutationObserver,
  };
  vm.runInNewContext(compiled, context, { filename: sourcePath });
  // Use the real exported wrapper to get the private AdSlot function without
  // adding exports or changing the production source for testability.
  const element = context.exports.HomeTopAd();
  const AdSlot = element.type;

  function createFiber(pathname) {
    const fiber = { pathname, hooks: [], cursor: 0, effects: [], updates: [], tree: null, container: null };
    fibers.push(fiber);
    return fiber;
  }

  function render(fiber) {
    currentFiber = fiber;
    fiber.cursor = 0;
    fiber.effects = [];
    const previousTree = fiber.tree;
    fiber.tree = AdSlot(element.props);
    currentFiber = undefined;

    // DOM/ref commit precedes passive effects. Preserve the container and <ins>
    // across ordinary updates; detach them when the real component returns null.
    if (fiber.tree) {
      fiber.container ??= containerElement();
      fiber.container.isConnected = true;
      fiber.tree.props.ref.current = fiber.container;
      const children = [].concat(fiber.tree.props.children ?? []);
      const ins = children.find((child) => child?.type === "ins");
      if (ins) fiber.container.ins ??= insElement(ins.props);
      else if (fiber.container.ins) {
        fiber.container.ins.isConnected = false;
        fiber.container.ins = null;
      }
    } else {
      if (fiber.container) {
        fiber.container.isConnected = false;
        if (fiber.container.ins) fiber.container.ins.isConnected = false;
      }
      if (previousTree) previousTree.props.ref.current = null;
      fiber.container = null;
    }

    // Like React's passive phase, run changed-effect cleanups before setups.
    const effects = fiber.effects;
    for (const { effect } of effects) effect.cleanup?.();
    for (const { effect, create, dependencies } of effects) {
      effect.dependencies = dependencies;
      effect.cleanup = create();
    }
  }

  function flushUpdates() {
    let turns = 0;
    while (fibers.some((fiber) => fiber.updates.length)) {
      assert.ok(++turns < 30, "passive/state updates must settle");
      for (const fiber of fibers) {
        const updates = fiber.updates.splice(0);
        let changed = false;
        for (const update of updates) changed = update() || changed;
        if (changed) render(fiber);
      }
    }
  }

  function mount(pathname = "/a") {
    const fiber = createFiber(pathname);
    render(fiber);
    flushUpdates();
    return fiber;
  }

  function navigate(fiber, pathname) {
    fiber.pathname = pathname;
    render(fiber);
    flushUpdates();
  }

  return { mount, navigate, flushUpdates, intersections, adPushes, events };
}

test("a queued old-page intersection cannot mount/request an offscreen new-page ad", () => {
  const runtime = createRuntime();
  const fiber = runtime.mount("/a");
  const old = runtime.intersections[0];
  runtime.navigate(fiber, "/b");
  assert.equal(old.disconnected, true);
  assert.equal(fiber.container.ins, null);

  old.deliverQueuedIntersection();
  runtime.flushUpdates();
  assert.equal(fiber.container.ins, null, "only the new page's observer may make its slot visible");
  assert.equal(runtime.adPushes.length, 0);
  assert.equal(runtime.events.length, 0);
});

test("a queued dedup-denied intersection cannot push with no owned ins", () => {
  const runtime = createRuntime();
  runtime.mount("/a"); // The first instance owns the slot on this path.
  const duplicate = runtime.mount("/a");
  const deniedObserver = runtime.intersections[1];
  assert.equal(deniedObserver.disconnected, true);
  assert.equal(duplicate.tree, null, "duplicate slot is suppressed");

  deniedObserver.deliverQueuedIntersection();
  runtime.flushUpdates();
  assert.equal(duplicate.tree, null);
  assert.equal(runtime.adPushes.length, 0);
  assert.equal(runtime.events.length, 0, "a suppressed slot cannot emit a request attempt");
});

test("a current eligible intersection mounts its owned ins and pushes exactly once", () => {
  const runtime = createRuntime();
  const fiber = runtime.mount("/a");
  const current = runtime.intersections[0];
  current.deliverQueuedIntersection();
  runtime.flushUpdates();
  assert.ok(fiber.container.ins);
  assert.equal(runtime.adPushes.length, 1);
  assert.deepEqual(runtime.events.map(({ name }) => name), ["attempt"]);

  current.deliverQueuedIntersection();
  runtime.flushUpdates();
  assert.equal(runtime.adPushes.length, 1, "repeated visibility callbacks do not repeat the request");
});

test("a surviving layout slot can request once again after a fresh pathname intersection", () => {
  const runtime = createRuntime();
  const fiber = runtime.mount("/a");
  runtime.intersections[0].deliverQueuedIntersection();
  runtime.flushUpdates();
  const previousIns = fiber.container.ins;
  assert.equal(runtime.adPushes.length, 1);

  runtime.navigate(fiber, "/b");
  const fresh = runtime.intersections.at(-1);
  assert.equal(fiber.container.ins, null, "pathname reset removes the previous ins");
  assert.equal(runtime.adPushes.length, 1, "navigation alone does not request an offscreen slot");
  fresh.deliverQueuedIntersection();
  runtime.flushUpdates();
  assert.ok(fiber.container.ins);
  assert.notEqual(fiber.container.ins, previousIns);
  assert.equal(runtime.adPushes.length, 2);
  assert.deepEqual(runtime.events.map(({ name }) => name), ["attempt", "attempt"]);
});
