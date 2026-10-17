import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

describe("Pages header mode is a compiler-defined build contract", () => {
  it.each([undefined, "0", "true", "1"])("derives the public value only from MSY_PAGES_STATIC_EXPORT=%s", async mode => {
    vi.resetModules();
    vi.stubEnv("MSY_PAGES_STATIC_EXPORT", mode);
    vi.stubEnv("NEXT_PUBLIC_PAGES_STATIC_EXPORT", mode === "1" ? "0" : "1");
    const { default: config } = await import("../../../next.config.mjs");
    expect(config.env?.NEXT_PUBLIC_PAGES_STATIC_EXPORT).toBe(mode === "1" ? "1" : "0");
    expect(config.output).toBe(mode === "1" ? "export" : undefined);
  });
});
