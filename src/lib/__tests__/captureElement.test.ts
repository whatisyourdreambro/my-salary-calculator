import { describe, expect, it, vi } from "vitest";
import html2canvas from "html2canvas";
import captureElement, { excludeFromCapture } from "../captureElement";

vi.mock("html2canvas", () => ({ default: vi.fn(async () => ({ marker: "canvas" })) }));
const node = (tagName: string, adMarker = false) => ({ tagName, matches: () => adMarker }) as unknown as HTMLElement;

describe("result-image export clone safety", () => {
  it("passes exclusions to the pre-clone filter, including already loaded ad iframe src nodes", async () => {
    const card = node("DIV"); const callerIgnore = vi.fn(() => false); const onclone = vi.fn();
    await captureElement(card, { scale: 2, ignoreElements: callerIgnore, onclone });
    const [, options] = vi.mocked(html2canvas).mock.calls.at(-1)!;
    for (const tag of ["IFRAME", "SCRIPT", "OBJECT", "EMBED"]) expect(options!.ignoreElements!(node(tag))).toBe(true);
    expect(options!.ignoreElements!(node("INS", true))).toBe(true);
    expect(options!.ignoreElements!(node("DIV", true))).toBe(true);
    expect(options!.ignoreElements!(node("CANVAS"))).toBe(false);
    expect(options!.scale).toBe(2); expect(options!.onclone).toBe(onclone);
  });

  it("preserves caller exclusions without allowing ad frames to be restored", async () => {
    await captureElement(node("DIV"), { ignoreElements: (element) => element.tagName === "BUTTON" });
    const options = vi.mocked(html2canvas).mock.calls.at(-1)![1]!;
    expect(options.ignoreElements!(node("BUTTON"))).toBe(true);
    expect(options.ignoreElements!(node("IFRAME"))).toBe(true);
    expect(excludeFromCapture(node("SPAN"))).toBe(false);
  });
});
