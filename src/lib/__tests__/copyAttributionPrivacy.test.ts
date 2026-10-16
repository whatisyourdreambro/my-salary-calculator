import { afterEach, describe, expect, it, vi } from "vitest";
import CopyAttribution from "../../components/CopyAttribution";

vi.mock("react", () => ({ useEffect: (effect: () => unknown) => effect() }));
vi.mock("../analytics", () => ({ trackEvent: vi.fn() }));

afterEach(() => vi.unstubAllGlobals());

function copyEvent(href: string, text = "선택한 공개 본문 ".repeat(20), input = false) {
  let listener: (event: unknown) => void = () => { throw new Error("copy listener missing"); };
  class Target { closest() { return input ? this : null; } }
  vi.stubGlobal("Element", Target);
  vi.stubGlobal("window", { location: { href, pathname: new URL(href).pathname }, getSelection: () => ({ toString: () => text }) });
  vi.stubGlobal("document", { addEventListener: (name: string, callback: typeof listener) => { if (name === "copy") listener = callback; }, removeEventListener: vi.fn() });
  const event = { target: new Target(), clipboardData: { setData: vi.fn() }, preventDefault: vi.fn() };
  CopyAttribution();
  listener(event);
  return { event, text };
}

describe("automatic source attribution preserves selected text without adding private URL inputs", () => {
  it("removes unselected financial inputs and campaign fields from the appended source URL", () => {
    const { event, text } = copyEvent("https://www.moneysalary.com/calc/compound?salary=987654321&utm_source=test#personal-result");
    expect(event.clipboardData.setData).toHaveBeenCalledWith("text/plain", `${text}\n\n출처: 머니샐러리 https://www.moneysalary.com/calc/compound`);
    expect(event.preventDefault).toHaveBeenCalledOnce();
  });
  it("does not automatically append a legacy result token", () => {
    const { event, text } = copyEvent("https://www.moneysalary.com/share/eyJhbW91bnQiOjk4NzY1NDMyMX0=?utm_source=test");
    expect(event.clipboardData.setData).toHaveBeenCalledWith("text/plain", `${text}\n\n출처: 머니샐러리 https://www.moneysalary.com/`);
  });
  it("keeps a public guide source link and canonicalizes the bare site host", () => {
    const { event, text } = copyEvent("https://moneysalary.com/guides/irp-vs-pension/?utm_source=copy");
    expect(event.clipboardData.setData).toHaveBeenCalledWith("text/plain", `${text}\n\n출처: 머니샐러리 https://www.moneysalary.com/guides/irp-vs-pension`);
  });
  it("preserves browser copying for a private dashboard", () => {
    const { event } = copyEvent("https://www.moneysalary.com/dashboard?salary=987654321");
    expect(event.clipboardData.setData).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
  it("does not alter short numeric selections", () => {
    const { event } = copyEvent("https://www.moneysalary.com/", "987654321");
    expect(event.clipboardData.setData).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
  it("does not alter text copied from an input", () => {
    const { event } = copyEvent("https://www.moneysalary.com/", "입력한 내용 ".repeat(30), true);
    expect(event.clipboardData.setData).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
