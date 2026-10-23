import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ParticipationSummary, { formatParticipationGeneratedAt, parseParticipationSummary } from "@/components/ParticipationSummary";
import { PARTICIPATION_MAX_AGE_SECONDS } from "@/lib/participationContract";

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
const now = Date.parse("2026-10-23T00:01:00Z");
const generatedAt = now / 1000;
const valid = { ok: true, visible: true, windowDays: 28, total: 10, helpful: 8, confusing: 2, generatedAt };
const parsed = { total: 10, helpful: 8, confusing: 2, generatedAt };
let hidden = false;
let documentFixture: EventTarget;
function setHidden(value: boolean) {
  hidden = value;
  documentFixture.dispatchEvent(new Event("visibilitychange"));
}
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
  vi.setSystemTime(now);
  hooks.effect = undefined; hooks.state = null; hooks.updates = []; cleanup = undefined;
  fetchFixture.mockReset();
  vi.stubGlobal("fetch", fetchFixture);
  vi.stubGlobal("window", { setTimeout, clearTimeout });
  hidden = false;
  documentFixture = new EventTarget();
  Object.defineProperty(documentFixture, "hidden", { get: () => hidden });
  vi.stubGlobal("document", documentFixture);
});
afterEach(() => {
  cleanup?.();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("public summary timestamp and threshold validation", () => {
  it.each([
    { ...valid, generatedAt: undefined }, { ...valid, generatedAt: "123" },
    { ...valid, generatedAt: 0 }, { ...valid, generatedAt: generatedAt + 1 },
    { ...valid, generatedAt: generatedAt - PARTICIPATION_MAX_AGE_SECONDS },
    { ...valid, generatedAt: generatedAt - PARTICIPATION_MAX_AGE_SECONDS - 1 },
    { ...valid, total: 9, helpful: 7 }, { ...valid, confusing: 1 }, { ...valid, windowDays: 90 },
  ])("hides invalid, unanchored, stale or insufficient aggregates: %#", value => {
    expect(parseParticipationSummary(value, now)).toBeNull();
  });
  it("accepts the last millisecond before expiry but not the boundary", () => {
    const expiry = (generatedAt + PARTICIPATION_MAX_AGE_SECONDS) * 1000;
    expect(parseParticipationSummary(valid, expiry - 1)).toEqual(parsed);
    expect(parseParticipationSummary(valid, expiry)).toBeNull();
  });
  it("formats the public aggregate time in KST regardless of the device timezone", () => {
    expect(formatParticipationGeneratedAt(generatedAt)).toMatch(/2026\.\s*10\.\s*23\.\s*09:01/);
  });
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
    expect(hooks.state).toEqual(parsed);
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
    expect(hooks.state).toEqual(parsed);
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
    expect(hooks.state).toEqual(parsed);
  });

  it("hides an open-tab snapshot at expiry before the five-minute refresh", async () => {
    fetchFixture.mockResolvedValue(Response.json({ ...valid, generatedAt: generatedAt - PARTICIPATION_MAX_AGE_SECONDS + 2 }));
    mount();
    await vi.advanceTimersByTimeAsync(0);
    expect(hooks.state).not.toBeNull();
    await vi.advanceTimersByTimeAsync(1999);
    expect(hooks.state).not.toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    expect(hooks.state).toBeNull();
    expect(fetchFixture).toHaveBeenCalledOnce();
  });

  it("does not display an already expired first response or leave an expiry timer", async () => {
    fetchFixture.mockResolvedValue(Response.json({ ...valid, generatedAt: generatedAt - PARTICIPATION_MAX_AGE_SECONDS }));
    mount();
    await vi.advanceTimersByTimeAsync(0);
    expect(hooks.state).toBeNull();
    expect(vi.getTimerCount()).toBe(1); // Only the bounded five-minute recheck.
  });

  it("hides on backgrounding and revalidates instead of restoring an expired snapshot on return", async () => {
    fetchFixture.mockImplementation(async () => Response.json(valid));
    mount();
    await vi.advanceTimersByTimeAsync(0);
    expect(hooks.state).toEqual(parsed);
    setHidden(true);
    expect(hooks.state).toBeNull();
    await vi.advanceTimersByTimeAsync(PARTICIPATION_MAX_AGE_SECONDS * 1000);
    expect(fetchFixture).toHaveBeenCalledOnce();
    setHidden(false);
    expect(hooks.state).toBeNull();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchFixture).toHaveBeenCalledTimes(2);
    expect(hooks.state).toBeNull();
  });

  it("queues a visibility refresh while aborting the old request and never displays its late body", async () => {
    let resolveFirst!: (response: Response) => void;
    let resolveSecond!: (response: Response) => void;
    fetchFixture.mockReturnValueOnce(new Promise<Response>(resolve => { resolveFirst = resolve; }))
      .mockReturnValueOnce(new Promise<Response>(resolve => { resolveSecond = resolve; }));
    mount();
    const firstSignal = lastSignal();
    setHidden(true);
    setHidden(false);
    expect(firstSignal.aborted).toBe(true);
    expect(fetchFixture).toHaveBeenCalledOnce(); // No overlapping fetch/body ownership.
    resolveFirst(Response.json(valid));
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchFixture).toHaveBeenCalledTimes(2);
    expect(hooks.state).toBeNull();
    resolveSecond(Response.json(valid));
    await vi.advanceTimersByTimeAsync(0);
    expect(hooks.state).toEqual(parsed);
  });

  it("removes the visibility listener on unmount", async () => {
    fetchFixture.mockResolvedValue(Response.json(valid));
    mount();
    await vi.advanceTimersByTimeAsync(0);
    cleanup?.(); cleanup = undefined;
    const updates = hooks.updates.length;
    setHidden(true); setHidden(false);
    await vi.advanceTimersByTimeAsync(0);
    expect(hooks.updates).toHaveLength(updates);
    expect(fetchFixture).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});
