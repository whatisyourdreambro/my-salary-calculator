import { afterEach, describe, expect, it, vi } from "vitest";
const context = vi.hoisted(() => ({ read: vi.fn() }));
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: context.read }));
import { cloudflareBindings } from "./cloudflareBindings";
import { cloudflareAssets } from "./cloudflareAssets";
import { getFeedbackBindings, hasFeedbackStorage } from "./feedbackStorage";

afterEach(() => { vi.unstubAllEnvs(); context.read.mockReset(); });

describe("OpenNext request-scoped bindings", () => {
  it("reads the current request on every call without retaining another request's DB", () => {
    const first = { prepare: vi.fn(), batch: vi.fn() };
    const second = { prepare: vi.fn(), batch: vi.fn() };
    context.read.mockReturnValueOnce({ env: { FEEDBACK_DB: first, FEEDBACK_RATE_LIMIT_SECRET: "a".repeat(32) } })
      .mockReturnValueOnce({ env: { FEEDBACK_DB: second, FEEDBACK_RATE_LIMIT_SECRET: "b".repeat(32) } });
    const a = getFeedbackBindings();
    const b = getFeedbackBindings();
    expect(a.FEEDBACK_DB).toBe(first);
    expect(b.FEEDBACK_DB).toBe(second);
    expect(hasFeedbackStorage(a)).toBe(true);
    expect(hasFeedbackStorage(b)).toBe(true);
    expect(context.read).toHaveBeenCalledTimes(2);
  });

  it("does not use process.env strings as a binding fallback when context is absent", () => {
    vi.stubEnv("FEEDBACK_RATE_LIMIT_SECRET", "process-env-test-value-with-enough-length");
    context.read.mockImplementation(() => { throw new Error("no Workers context"); });
    expect(cloudflareBindings()).toEqual({});
    expect(hasFeedbackStorage(getFeedbackBindings())).toBe(false);
    expect(getFeedbackBindings().FEEDBACK_RATE_LIMIT_SECRET).toBeUndefined();
    expect(cloudflareAssets()).toBeUndefined();
  });

  it("returns only a usable ASSETS fetcher from the Workers context", () => {
    const assets = { fetch: vi.fn() };
    context.read.mockReturnValueOnce({ env: { ASSETS: assets } })
      .mockReturnValueOnce({ env: { ASSETS: "not-an-object-binding" } });
    expect(cloudflareAssets()).toBe(assets);
    expect(cloudflareAssets()).toBeUndefined();
    expect(assets.fetch).not.toHaveBeenCalled();
  });
});
