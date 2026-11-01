import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import ShareButtons from "@/components/ShareButtons";
import FloatingShareBar from "@/components/FloatingShareBar";
import ShareTermButton from "@/app/glossary/ShareTermButton";

// Offline event/element fixture: all native, SDK and clipboard boundaries are stubs.
const fixture = vi.hoisted(() => ({ states: [] as unknown[], cursor: 0, pathname: "/calc/samsung-bonus", ogImage: null as string | null }));
vi.mock("react", async original => ({ ...await original<typeof import("react")>(),
  useState: (initial: unknown) => { const i = fixture.cursor++; return [fixture.states[i] ?? initial, (v: unknown) => { fixture.states[i] = v; }]; },
  useRef: (initial: unknown) => ({ current: initial }), useId: () => "share-fixture", useEffect: () => {},
}));
vi.mock("next/navigation", () => ({ usePathname: () => fixture.pathname }));
vi.mock("@/hooks/useSharePageContext", () => ({ useSharePageContext: () => ({ pathname: fixture.pathname,
  context: { pathname: fixture.pathname, canonical: `https://www.moneysalary.com${fixture.pathname}`, title: "Public calculator", notFound: false,
    ogImage: fixture.ogImage, resultUrl: "https://www.moneysalary.com/calc/samsung-bonus#s=987654321" } }) }));
vi.mock("@/lib/analytics", () => ({ trackShare: vi.fn(), trackShareOutcome: vi.fn(), trackEvent: vi.fn() }));

type Element = ReactElement<Record<string, unknown>>;
function nodes(value: unknown): Element[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!value || typeof value !== "object" || !("props" in value)) return [];
  const node = value as Element; return [node, ...nodes(node.props.children)];
}
beforeEach(() => { fixture.states = []; fixture.cursor = 0; fixture.pathname = "/calc/samsung-bonus"; fixture.ogImage = null; vi.useFakeTimers(); vi.stubGlobal("fetch", () => { throw Error("Network forbidden"); }); });
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

// B38 (owner approval 2026-11-01, item 8): ShareButtons -> sendShare -> tryKakaoFeedShare with an offline SDK stub.
describe("the Kakao card is the shared page's public og:image (B38)", () => {
  const samsungCard = `https://www.moneysalary.com/api/og?type=tool&name=${encodeURIComponent("삼성전자 성과급 계산기")}`;
  function clickKakao(props: Parameters<typeof ShareButtons>[0]) {
    const sendDefault = vi.fn();
    vi.stubGlobal("window", { location: { host: "www.moneysalary.com" }, Kakao: { isInitialized: () => true, Share: { sendDefault } } });
    vi.stubGlobal("navigator", {});
    const button = nodes(ShareButtons(props)).find(n => n.props["aria-label"] === "카카오톡")!;
    (button.props.onClick as () => void)();
    expect(sendDefault).toHaveBeenCalledTimes(1);
    return sendDefault.mock.calls[0][0] as { content: Record<string, unknown> };
  }
  it("page mode sends this page's og:image with the page link", () => {
    fixture.ogImage = samsungCard;
    expect(clickKakao({}).content).toMatchObject({ imageUrl: samsungCard, imageWidth: 1200, imageHeight: 630,
      link: { webUrl: "https://www.moneysalary.com/calc/samsung-bonus?utm_source=kakao&utm_medium=share" } });
  });
  it("an approved result on the same page uses the page's static og:image, never the caller's result image", () => {
    fixture.ogImage = samsungCard;
    const settings = clickKakao({ shareMode: "result", resultKey: "private-memory-only", url: "https://www.moneysalary.com/calc/samsung-bonus?v=PRIVATE#s=987654321",
      title: "Approved result 31415", description: "Visible estimate", imageUrl: "https://www.moneysalary.com/api/og?amount=987654321" });
    expect(settings.content).toMatchObject({ title: "Approved result 31415", imageUrl: samsungCard });
    expect(JSON.stringify(settings)).not.toMatch(/987654321|PRIVATE/);
  });
  it("a result linking to another page gets that link's path-only card, not this page's og:image", () => {
    fixture.pathname = "/calc/2026-year";
    fixture.ogImage = `https://www.moneysalary.com/api/og?path=%2Fcalc%2F2026-year&title=${encodeURIComponent("2026 연봉 계산기 PRO")}`;
    const settings = clickKakao({ shareMode: "result", resultKey: "private-memory-only", url: "https://www.moneysalary.com/", title: "Approved result 31415" });
    expect(settings.content).toMatchObject({ imageUrl: "https://www.moneysalary.com/api/og?path=%2F&lang=ko",
      link: { webUrl: "https://www.moneysalary.com/?utm_source=kakao&utm_medium=share" } });
  });
  it("a page og:image carrying salary values is never sent", () => {
    fixture.pathname = "/salary/50000000";
    fixture.ogImage = "https://www.moneysalary.com/api/og?type=salary&amount=50000000&net=3520000&v=20260924";
    expect(clickKakao({}).content.imageUrl).toBe("https://www.moneysalary.com/api/og?path=%2Fsalary%2F50000000&lang=ko");
  });
});
