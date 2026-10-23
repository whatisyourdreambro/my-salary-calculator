import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import ShareButtons from "@/components/ShareButtons";
import FloatingShareBar from "@/components/FloatingShareBar";
import ShareTermButton from "@/app/glossary/ShareTermButton";

// Offline event/element fixture: all native, SDK and clipboard boundaries are stubs.
const fixture = vi.hoisted(() => ({ states: [] as unknown[], cursor: 0, pathname: "/calc/samsung-bonus" }));
vi.mock("react", async original => ({ ...await original<typeof import("react")>(),
  useState: (initial: unknown) => { const i = fixture.cursor++; return [fixture.states[i] ?? initial, (v: unknown) => { fixture.states[i] = v; }]; },
  useRef: (initial: unknown) => ({ current: initial }), useId: () => "share-fixture", useEffect: () => {},
}));
vi.mock("next/navigation", () => ({ usePathname: () => fixture.pathname }));
vi.mock("@/hooks/useSharePageContext", () => ({ useSharePageContext: () => ({ pathname: fixture.pathname,
  context: { pathname: fixture.pathname, canonical: `https://www.moneysalary.com${fixture.pathname}`, title: "Public calculator", notFound: false,
    resultUrl: "https://www.moneysalary.com/calc/samsung-bonus#s=987654321" } }) }));
vi.mock("@/lib/analytics", () => ({ trackShare: vi.fn(), trackShareOutcome: vi.fn(), trackEvent: vi.fn() }));

type Element = ReactElement<Record<string, unknown>>;
function nodes(value: unknown): Element[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!value || typeof value !== "object" || !("props" in value)) return [];
  const node = value as Element; return [node, ...nodes(node.props.children)];
}
beforeEach(() => { fixture.states = []; fixture.cursor = 0; fixture.pathname = "/calc/samsung-bonus"; vi.useFakeTimers(); vi.stubGlobal("fetch", () => { throw Error("Network forbidden"); }); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("new outbound UI URLs contain no private input", () => {
  it("an approved result still copies its visible text but sanitizes the actual destination", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const tree = ShareButtons({ shareMode: "result", resultKey: "private-memory-only", url: "https://www.moneysalary.com/calc/samsung-bonus?v=PRIVATE#s=987654321",
      title: "Approved result 31415", description: "Visible estimate", imageUrl: "https://www.moneysalary.com/api/og?amount=987654321" });
    const button = nodes(tree).find(n => n.props["aria-label"] === "결과 문구·링크 복사")!;
    (button.props.onClick as () => void)(); await Promise.resolve(); await Promise.resolve();
    expect(writeText).toHaveBeenCalledWith("Approved result 31415\nVisible estimate\nhttps://www.moneysalary.com/calc/samsung-bonus?utm_source=copy&utm_medium=share");
  });
  it("the floating bar remains page-mode even if an old context contains a private result URL", () => {
    fixture.states = [true, false];
    const tree = FloatingShareBar();
    const buttons = nodes(tree).find(n => n.type === ShareButtons)!;
    expect(buttons.props.shareMode).toBeUndefined(); expect(buttons.props.url).toBeUndefined(); expect(buttons.props.resultKey).toBeUndefined();
  });
  it.each([true, false])("glossary custom share strips visitor query/hash (native=%s)", async native => {
    fixture.pathname = "/glossary/net-pay";
    const share = vi.fn().mockResolvedValue(undefined), writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("window", { location: { pathname: "/glossary/net-pay", href: "http://127.0.0.1:3000/glossary/net-pay?salary=987654321&utm_source=PRIVATE#secret" } });
    vi.stubGlobal("navigator", { ...(native ? { share } : {}), clipboard: { writeText } });
    const tree = ShareTermButton({ title: "실수령액" });
    await (nodes(tree).find(n => n.type === "button")!.props.onClick as () => Promise<void>)();
    const url = `https://www.moneysalary.com/glossary/net-pay?utm_source=${native ? "webshare" : "copy"}&utm_medium=share`;
    if (native) expect(share).toHaveBeenCalledWith(expect.objectContaining({ url })); else expect(writeText).toHaveBeenCalledWith(url);
  });
});
