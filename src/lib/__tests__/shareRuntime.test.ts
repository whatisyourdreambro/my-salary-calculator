import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { trackShare, trackShareOutcome } from "../analytics";
import { tryKakaoFeedShare } from "../shareChannels";
import { hasPrimary, registerPrimary, subscribeShareRegistry } from "../shareRegistry";
import ShareButtons from "@/components/ShareButtons";
import ShareSection from "@/components/ShareSection";
import AutoShareSection from "@/components/AutoShareSection";
import ResultSharePanel from "@/components/ResultSharePanel";
import FloatingShareBar from "@/components/FloatingShareBar";

vi.mock("next/navigation", () => ({ usePathname: () => "/en/flat-tax" }));
afterEach(() => vi.unstubAllGlobals());

describe("shared UI server boundary", () => {
  it("all variants use an identical empty server/initial snapshot without document access", () => {
    expect(renderToString(createElement(ShareButtons, { title: "private 987654321", variant: "compact" }))).toBe("");
    expect(renderToString(createElement(ShareSection, { title: "private 987654321" }))).toBe("");
    expect(renderToString(createElement(AutoShareSection))).toBe("");
    expect(renderToString(createElement(FloatingShareBar))).toBe("");
    expect(renderToString(createElement(ResultSharePanel, { resultKey: "987654321", title: "private 987654321" }))).toBe("");
  });
});

describe("Kakao invocation evidence", () => {
  const payload = { url: "https://www.moneysalary.com/en/flat-tax", title: "Calculator", imageUrl: "https://www.moneysalary.com/og.png", locale: "en" as const };
  it("does not report invocation when initialized SDK has no Share API", () => {
    vi.stubGlobal("window", { Kakao: { isInitialized: () => true } });
    expect(tryKakaoFeedShare(payload)).toBe(false);
  });
  it("uses an English home destination and label", () => {
    const sendDefault = vi.fn();
    vi.stubGlobal("window", { Kakao: { isInitialized: () => true, Share: { sendDefault } } });
    expect(tryKakaoFeedShare(payload)).toBe(true);
    expect(sendDefault.mock.calls[0][0].buttons[1]).toEqual({ title: "Salary calculator", link: { mobileWebUrl: "https://www.moneysalary.com/en?utm_source=kakao&utm_medium=share", webUrl: "https://www.moneysalary.com/en?utm_source=kakao&utm_medium=share" } });
  });
  it("treats SDK initialization and send errors as unavailable", () => {
    vi.stubGlobal("window", { Kakao: { isInitialized: () => { throw Error("SDK unavailable"); } } });
    expect(tryKakaoFeedShare(payload)).toBe(false);
    vi.stubGlobal("window", { Kakao: { isInitialized: () => true, Share: { sendDefault: () => { throw Error("SDK unavailable"); } } } });
    expect(tryKakaoFeedShare(payload)).toBe(false);
  });
});

describe("sharing registry cleanup", () => {
  it("keeps another inline registration and does not leak the previous route", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeShareRegistry(listener);
    const first = registerPrimary("/registry-one");
    const second = registerPrimary("/registry-one");
    const next = registerPrimary("/registry-two");
    first(); expect(hasPrimary("/registry-one")).toBe(true);
    second(); expect(hasPrimary("/registry-one")).toBe(false);
    expect(hasPrimary("/registry-two")).toBe(true);
    next(); next(); expect(hasPrimary("/registry-two")).toBe(false);
    unsubscribe();
    const calls = listener.mock.calls.length;
    registerPrimary("/registry-three")();
    expect(listener).toHaveBeenCalledTimes(calls);
  });
});

describe("outcome analytics carries fixed diagnostics only", () => {
  it("preserves attempts and separates confirmed clipboard evidence without raw payloads", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag, location: { href: "https://www.moneysalary.com/share/private-data?salary=987654321&utm_source=test" } });
    vi.stubGlobal("document", { referrer: "" });
    trackShare("copy", "salary_result", "/share/private-data", "result");
    trackShareOutcome("copy", "salary_result", "clipboard_success", "/share/private-data", "result");
    expect(gtag.mock.calls.map((call) => call[1])).toEqual(["share", "share_outcome"]);
    expect(gtag.mock.calls[1][2]).toMatchObject({ method: "copy", content_type: "salary_result", outcome: "clipboard_success", event_version: 2, share_mode: "result", page_path: "/" });
    expect(JSON.stringify(gtag.mock.calls)).not.toMatch(/987654321|private-data/);
  });
  it("does not forward arbitrary channel/content strings", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag, location: { href: "https://www.moneysalary.com/" } });
    vi.stubGlobal("document", { referrer: "" });
    trackShare("name@example.com", "salary 987654321", "/");
    expect(gtag.mock.calls[0][2]).toMatchObject({ method: "other", content_type: "page" });
    expect(JSON.stringify(gtag.mock.calls)).not.toMatch(/name@example|987654321/);
  });
});
