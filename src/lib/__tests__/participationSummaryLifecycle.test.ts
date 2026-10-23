import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ParticipationSummary from "@/components/ParticipationSummary";

// Execute the real refresh effect with synthetic streams and time only. No DOM,
// renderer, browser, endpoint, or remote data is used by this lifecycle fixture.
const hooks = vi.hoisted(() => ({
  effect: undefined as undefined | (() => void | (() => void)),
  state: null as unknown,
  updates: [] as unknown[],
}));
vi.mock("react", async original => ({
  ...await original<typeof import("react")>(),
  useState: () => [hooks.state, (value: unknown) => { hooks.state = value; hooks.updates.push(value); }],
  useEffect: (effect: () => void | (() => void)) => { hooks.effect = effect; },
}));

const fetchFixture = vi.fn<typeof fetch>();
let cleanup: (() => void) | void;
const valid = { ok: true, visible: true, windowDays: 28, total: 10, helpful: 8, confusing: 2 };
function mount() {
  ParticipationSummary({ target: "samsung_bonus" });
  expect(hooks.effect).toBeTypeOf("function");
  cleanup = hooks.effect!();
}
function lastSignal() { return fetchFixture.mock.calls.at(-1)?.[1]?.signal as AbortSignal; }
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
}

beforeEach(() => {
  vi.useFakeTimers();
  hooks.effect = undefined; hooks.state = null; hooks.updates = []; cleanup = undefined;
  fetchFixture.mockReset();
  vi.stubGlobal("fetch", fetchFixture);
  vi.stubGlobal("window", { setTimeout, clearTimeout });
});
afterEach(() => {
  cleanup?.();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("public participation summary response lifecycle", () => {
  it("closes an unread 503 stream without parsing or displaying even valid-looking error content", async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream({
      start(controller) { controller.enqueue(new TextEncoder().encode(JSON.stringify(valid))); },
      cancel,
    });
    const response = new Response(stream, { status: 503 });
    const json = vi.spyOn(response, "json");
    fetchFixture.mockResolvedValue(response);
    mount();
    await vi.advanceTimersByTimeAsync(0);
    expect(cancel).toHaveBeenCalledOnce();
    expect(json).not.toHaveBeenCalled();
    expect(hooks.state).toBeNull();
    expect(hooks.updates.every(value => value === null)).toBe(true);
    expect(await response.body!.getReader().read()).toEqual({ done: true, value: undefined });
    expect(lastSignal().aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(10000);
    expect(lastSignal().aborted).toBe(false); // A completed cleanup clears its deadline.
    expect(fetchFixture).toHaveBeenCalledOnce();
  });

  it("keeps the 10-second abort deadline while failed-body cleanup is pending and refreshes only five minutes after cleanup", async () => {
    const settled = deferred();
    const cancel = vi.fn(() => settled.promise);
    const response = new Response(new ReadableStream({ cancel }), { status: 503 });
    fetchFixture.mockResolvedValueOnce(response).mockResolvedValue(Response.json(valid));
    mount();
    await vi.advanceTimersByTimeAsync(0);
    const signal = lastSignal();
    expect(cancel).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(9999);
    expect(signal.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(signal.aborted).toBe(true);
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    expect(fetchFixture).toHaveBeenCalledOnce(); // No overlapping refresh while cleanup owns the stream.
    settled.resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(hooks.state).toBeNull();
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000 - 1);
    expect(fetchFixture).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchFixture).toHaveBeenCalledTimes(2);
    expect(hooks.state).toEqual({ total: 10, helpful: 8, confusing: 2 });
  });

  it("keeps a rejected body cancellation hidden and schedules the normal bounded refresh", async () => {
    const response = new Response(new ReadableStream({ cancel() { throw new Error("Synthetic cancellation failure"); } }), { status: 503 });
    const json = vi.spyOn(response, "json");
    fetchFixture.mockResolvedValueOnce(response).mockResolvedValue(Response.json(valid));
    mount();
    await vi.advanceTimersByTimeAsync(0);
    expect(json).not.toHaveBeenCalled();
    expect(hooks.state).toBeNull();
    expect(lastSignal().aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000 - 1);
    expect(fetchFixture).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchFixture).toHaveBeenCalledTimes(2);
    expect(hooks.state).toEqual({ total: 10, helpful: 8, confusing: 2 });
  });

  it("aborts on unmount and ignores late cleanup without scheduling another request", async () => {
    const settled = deferred();
    fetchFixture.mockResolvedValue(new Response(new ReadableStream({ cancel: () => settled.promise }), { status: 503 }));
    mount();
    await vi.advanceTimersByTimeAsync(0);
    const updates = hooks.updates.length;
    cleanup?.(); cleanup = undefined;
    expect(lastSignal().aborted).toBe(true);
    settled.resolve();
    await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
    expect(hooks.updates).toHaveLength(updates);
    expect(fetchFixture).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("continues consuming successful JSON and renders only validated aggregate counts", async () => {
    const response = Response.json(valid);
    const json = vi.spyOn(response, "json");
    const cancel = vi.spyOn(response.body!, "cancel");
    fetchFixture.mockResolvedValue(response);
    mount();
    await vi.advanceTimersByTimeAsync(0);
    expect(json).toHaveBeenCalledOnce();
    expect(cancel).not.toHaveBeenCalled();
    expect(hooks.state).toEqual({ total: 10, helpful: 8, confusing: 2 });
  });
});
