import { describe, expect, it, vi } from "vitest";
import { createShareRequestGuard, sendShare, type ShareTransport } from "../shareTransport";
import { SHARE_CHANNELS, type ShareChannelId } from "../shareChannels";

const payload = { url: "https://www.moneysalary.com/en/flat-tax", title: "Public calculator", description: "Compare taxes", imageUrl: "https://www.moneysalary.com/og.png", locale: "en" as const };
function environment(overrides: Partial<ShareTransport> = {}): ShareTransport {
  return { copy: vi.fn().mockResolvedValue(undefined), native: vi.fn().mockResolvedValue(undefined), canShareFiles: () => true, makeFile: (blob) => ({ type: blob.type, size: blob.size } as File), kakao: () => true, openIntent: vi.fn(), isCurrent: () => true, ...overrides };
}

describe("sharing outcomes represent observable operations", () => {
  it.each(Object.keys(SHARE_CHANNELS) as ShareChannelId[])("%s sends only the public destination and fixed campaign fields", async channel => {
    const env = environment({ kakao: vi.fn(() => true) });
    const result = { ...payload, url: "https://www.moneysalary.com/calc/samsung-bonus?v=PRIVATE_TOKEN&utm_campaign=PRIVATE#s=987654321&d=memory",
      title: "Approved result 31415", description: "Approved visible text", imageUrl: "https://www.moneysalary.com/api/og?amount=987654321&title=PRIVATE",
      shareMode: "result" as const };
    await sendShare(channel, result, env);
    const calls = JSON.stringify([vi.mocked(env.copy!).mock.calls, vi.mocked(env.native!).mock.calls,
      vi.mocked(env.kakao).mock.calls, vi.mocked(env.openIntent).mock.calls]);
    expect(calls).not.toMatch(/PRIVATE|987654321|%23s|%3Fv/);
    const expected = `https://www.moneysalary.com/calc/samsung-bonus?utm_source=${channel}&utm_medium=share`;
    expect(calls.includes(expected) || calls.includes(encodeURIComponent(expected))).toBe(true);
    if (channel === "copy" || channel === "kakao" || channel === "webshare" || channel === "instagram") expect(calls).toContain("31415");
    if (channel === "kakao") expect(env.kakao).toHaveBeenCalledWith(expect.objectContaining({ imageUrl: "https://www.moneysalary.com/api/og?path=%2Fcalc%2Fsamsung-bonus&lang=en" }));
  });
  it("old salary tokens cannot escape through clipboard fallback or an approved local image", async () => {
    const result = { ...payload, url: "https://www.moneysalary.com/share/PRIVATE_TOKEN?v=secret#s=987654321", shareMode: "result" as const };
    const failed = await sendShare("copy", result, environment({ copy: undefined }));
    expect(failed.manualText).toBe("Public calculator\nCompare taxes\nhttps://www.moneysalary.com/?utm_source=copy&utm_medium=share");
    const env = environment();
    await sendShare("webshare", { ...result, imageBlob: new Blob(["approved-local-image"], { type: "image/png" }) }, env);
    expect(env.native).toHaveBeenCalledWith(expect.objectContaining({ text: "Compare taxes\nhttps://www.moneysalary.com/?utm_source=webshare&utm_medium=share" }));
    expect(JSON.stringify(vi.mocked(env.native!).mock.calls)).not.toContain("PRIVATE_TOKEN");
  });
  it("reports clipboard success only after the write resolves", async () => {
    const copy = vi.fn().mockResolvedValue(undefined);
    expect(await sendShare("copy", payload, environment({ copy }))).toEqual({ outcome: "clipboard_success" });
    expect(copy).toHaveBeenCalledWith(`${payload.url}?utm_source=copy&utm_medium=share`);
  });
  it("explicit result copy includes the previewed text even without a result URL or image", async () => {
    const copy = vi.fn().mockResolvedValue(undefined);
    const result = { ...payload, title: "My result: 31415", description: "Current approved estimate", shareMode: "result" as const };
    expect(await sendShare("copy", result, environment({ copy }))).toEqual({ outcome: "clipboard_success" });
    expect(copy).toHaveBeenCalledWith(`My result: 31415\nCurrent approved estimate\n${payload.url}?utm_source=copy&utm_medium=share`);
  });
  it("result copy failure offers exactly the approved content for manual copying", async () => {
    const result = { ...payload, title: "My result: 31415", shareMode: "result" as const };
    const outcome = await sendShare("copy", result, environment({ copy: undefined }));
    expect(outcome.outcome).toBe("error");
    expect(outcome.manualText).toBe(`My result: 31415\nCompare taxes\n${payload.url}?utm_source=copy&utm_medium=share`);
  });
  it("returns a selectable fallback for rejected or unavailable clipboard", async () => {
    const copy = vi.fn().mockRejectedValue({ name: "NotAllowedError", message: "private raw value" });
    const result = await sendShare("copy", payload, environment({ copy }));
    expect(result).toEqual({ outcome: "error", errorKind: "permission", manualText: `${payload.url}?utm_source=copy&utm_medium=share` });
    expect(JSON.stringify(result)).not.toContain("private raw value");
    expect((await sendShare("copy", payload, environment({ copy: undefined }))).errorKind).toBe("unsupported");
  });
  it("a native AbortError never opens another app or copies without a new action", async () => {
    const env = environment({ native: vi.fn().mockRejectedValue({ name: "AbortError" }) });
    expect(await sendShare("webshare", payload, env)).toEqual({ outcome: "aborted" });
    expect(env.copy).not.toHaveBeenCalled();
    expect(env.openIntent).not.toHaveBeenCalled();
  });
  it("native resolve means handoff, not publication", async () => {
    expect(await sendShare("webshare", payload, environment())).toEqual({ outcome: "native_handoff" });
  });
  it("permission errors remain failures, with a manual link fallback", async () => {
    const env = environment({ native: vi.fn().mockRejectedValue({ name: "NotAllowedError" }) });
    expect(await sendShare("webshare", payload, env)).toMatchObject({ outcome: "error", errorKind: "permission", manualText: expect.any(String) });
    expect(env.copy).not.toHaveBeenCalled();
  });
  it("an unsupported image is not silently replaced with text sharing", async () => {
    const env = environment({ canShareFiles: () => false });
    expect(await sendShare("webshare", { ...payload, imageBlob: new Blob(["image"], { type: "image/png" }) }, env)).toMatchObject({ outcome: "error", errorKind: "unsupported" });
    expect(env.native).not.toHaveBeenCalled();
  });
  it("uses the prepared file for explicit image sharing", async () => {
    const env = environment();
    await sendShare("webshare", { ...payload, imageBlob: new Blob(["image"], { type: "image/png" }) }, env);
    expect(env.native).toHaveBeenCalledWith(expect.objectContaining({ files: [{ type: "image/png", size: 5 }] }));
  });
  it("Kakao request and fallback copy have different outcomes", async () => {
    expect(await sendShare("kakao", payload, environment())).toEqual({ outcome: "sdk_requested" });
    expect(await sendShare("kakao", payload, environment({ kakao: () => false }))).toEqual({ outcome: "clipboard_success" });
  });
  it("does not infer popup blocking from a noopener window's null result", async () => {
    const env = environment({ openIntent: vi.fn(() => { return; }) });
    expect(await sendShare("x", payload, env)).toEqual({ outcome: "intent_requested" });
  });
  it("Instagram's page link copies without opening an unrelated app", async () => {
    const env = environment();
    expect(await sendShare("instagram", payload, env)).toEqual({ outcome: "clipboard_success" });
    expect(env.native).not.toHaveBeenCalled();
    expect(env.openIntent).not.toHaveBeenCalled();
  });
  it("a route/input change invalidates pending capture and any later fallback", async () => {
    const guard = createShareRequestGuard();
    const valid = guard.begin();
    guard.invalidate();
    const env = environment({ isCurrent: valid });
    expect(await sendShare("webshare", payload, env)).toEqual({ outcome: "discarded" });
    expect(env.native).not.toHaveBeenCalled();
    expect(env.copy).not.toHaveBeenCalled();
  });
  it("returning to the same inputs cannot revive an earlier approved async operation", () => {
    const guard = createShareRequestGuard();
    guard.syncIdentity("input-A");
    const current = guard.begin();
    guard.syncIdentity("input-B");
    guard.syncIdentity("input-A");
    expect(current()).toBe(false);
    const next = guard.begin();
    guard.syncIdentity("input-A");
    expect(next()).toBe(true);
  });
  it("late native resolution after unmount produces no success or fallback", async () => {
    const guard = createShareRequestGuard();
    const valid = guard.begin();
    let finish!: () => void;
    const env = environment({ isCurrent: valid, native: () => new Promise<void>((resolve) => { finish = resolve; }) });
    const pending = sendShare("webshare", payload, env);
    guard.invalidate(); finish();
    expect(await pending).toEqual({ outcome: "discarded" });
    expect(env.copy).not.toHaveBeenCalled();
  });
});
