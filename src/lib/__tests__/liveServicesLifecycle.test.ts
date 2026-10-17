import { afterEach, describe, expect, it, vi } from "vitest";
import LiveServices from "@/components/LiveServices";

// A narrow hook harness: no DOM, renderer, browser, SDK source, or network exists.
// The real installer's guards/idempotency are tested in liveServices.test.ts.
const hooks = vi.hoisted(() => ({
  pathname: "/share/invalid",
  pending: [] as Array<{ callback: () => void; dependencies: readonly unknown[] | undefined }>,
  install: vi.fn(),
}));
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useEffect: (callback: () => void, dependencies?: readonly unknown[]) => {
    hooks.pending.push({ callback, dependencies });
  },
}));
vi.mock("next/navigation", () => ({ usePathname: () => hooks.pathname }));
vi.mock("@/lib/liveServices", () => ({ installLiveServices: hooks.install }));

afterEach(() => { hooks.pending = []; hooks.install.mockReset(); hooks.pathname = "/share/invalid"; });

function componentSession() {
  let previous: Array<readonly unknown[] | undefined> | undefined;
  return (pathname: string) => {
    hooks.pathname = pathname;
    hooks.pending = [];
    expect(LiveServices()).toBeNull();
    for (const [index, effect] of hooks.pending.entries()) {
      const old = previous?.[index];
      if (!previous || !old || !effect.dependencies || old.length !== effect.dependencies.length ||
          effect.dependencies.some((value, depIndex) => !Object.is(value, old[depIndex]))) effect.callback();
    }
    previous = hooks.pending.map((effect) => effect.dependencies?.slice());
  };
}

describe("LiveServices persistent-root route lifecycle", () => {
  it("retries a blocked initial share installation when the pathname changes to a valid page", () => {
    hooks.install.mockImplementation(() => hooks.pathname !== "/share/invalid");
    const render = componentSession();
    render("/share/invalid");
    expect(hooks.install.mock.results.map((result) => result.value)).toEqual([false]);
    render("/");
    expect(hooks.install.mock.results.map((result) => result.value)).toEqual([false, true]);
    render("/");
    expect(hooks.install).toHaveBeenCalledTimes(2);
    render("/calc/salary");
    expect(hooks.install).toHaveBeenCalledTimes(3);
  });

  it("does not add work on an unrelated rerender of the same pathname", () => {
    const render = componentSession();
    render("/");
    render("/");
    render("/");
    expect(hooks.install).toHaveBeenCalledTimes(1);
  });
});
