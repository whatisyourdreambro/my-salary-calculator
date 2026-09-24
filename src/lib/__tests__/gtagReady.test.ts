// 착지 페이지 GA4 마운트 이벤트 게이트 (2026-09-25 감사 B3 · CLIENT-03/CON-09):
//  - gtag 가 이미 있으면 setTimeout(0) 뒤 1회 전송.
//  - 없으면 250ms 간격 최대 40회 재확인, 생기는 순간 1회 전송, 끝내 없으면 포기.
//  - cleanup(취소)은 대기 중 타이머를 지운다.
//  - 두 트래커가 이 헬퍼를 쓰고, 전역 trackEvent·layout ga4-init 은 건드리지 않는다(10/10 판정 전).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { runWhenGtagReady } from "@/lib/gtagReady";

const read = (p: string) => readFileSync(path.resolve(process.cwd(), p), "utf8");

describe("runWhenGtagReady", () => {
  let fakeWindow: { gtag?: unknown };

  beforeEach(() => {
    vi.useFakeTimers();
    fakeWindow = {};
    vi.stubGlobal("window", fakeWindow);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("sends after the current effect flush when gtag already exists", () => {
    fakeWindow.gtag = vi.fn();
    const send = vi.fn();
    runWhenGtagReady(send);
    expect(send).not.toHaveBeenCalled(); // 동기 호출 아님 — setTimeout(0)
    vi.advanceTimersByTime(0);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("waits for gtag to appear (hard landing) and sends exactly once", () => {
    const send = vi.fn();
    runWhenGtagReady(send);
    vi.advanceTimersByTime(0);
    vi.advanceTimersByTime(250 * 3);
    expect(send).not.toHaveBeenCalled();
    fakeWindow.gtag = () => undefined; // ga4-init 실행
    vi.advanceTimersByTime(250);
    expect(send).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(250 * 50);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("gives up after 40 retries at 250ms (about 10s) when gtag never loads", () => {
    const send = vi.fn();
    runWhenGtagReady(send);
    vi.advanceTimersByTime(0);
    vi.advanceTimersByTime(250 * 40);
    expect(vi.getTimerCount()).toBe(0);
    fakeWindow.gtag = vi.fn();
    vi.advanceTimersByTime(250 * 10);
    expect(send).not.toHaveBeenCalled();
  });

  it("the 40th retry still sends if gtag appears just in time", () => {
    const send = vi.fn();
    runWhenGtagReady(send);
    vi.advanceTimersByTime(0);
    vi.advanceTimersByTime(250 * 39);
    fakeWindow.gtag = vi.fn();
    vi.advanceTimersByTime(250);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("ignores a non-function gtag value", () => {
    fakeWindow.gtag = "not a function";
    const send = vi.fn();
    runWhenGtagReady(send);
    vi.advanceTimersByTime(250 * 45);
    expect(send).not.toHaveBeenCalled();
  });

  it("cancel clears the pending timer (effect cleanup / unmount)", () => {
    const send = vi.fn();
    const cancel = runWhenGtagReady(send);
    cancel();
    fakeWindow.gtag = vi.fn();
    vi.advanceTimersByTime(250 * 45);
    expect(send).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cancel after a few retries also stops further retries", () => {
    const send = vi.fn();
    const cancel = runWhenGtagReady(send);
    vi.advanceTimersByTime(0);
    vi.advanceTimersByTime(250 * 2);
    cancel();
    expect(vi.getTimerCount()).toBe(0);
    fakeWindow.gtag = vi.fn();
    vi.advanceTimersByTime(250 * 10);
    expect(send).not.toHaveBeenCalled();
  });
});

describe("tracker wiring", () => {
  it("SalaryLookupTracker and CompareViewTracker send through runWhenGtagReady with a once-per-id guard", () => {
    for (const file of ["src/components/SalaryLookupTracker.tsx", "src/components/CompareViewTracker.tsx"]) {
      const src = read(file);
      expect(src, file).toContain("return runWhenGtagReady(");
      expect(src, file).toMatch(/sentFor\.current ===/);
      expect(src, file).toMatch(/sentFor\.current = /);
    }
  });

  it("global trackEvent and the layout GA bootstrap stay unchanged until the 10/10 judgment", () => {
    expect(read("src/lib/analytics.ts")).toContain('window.gtag?.("event", name, {');
    expect(read("src/app/layout.tsx")).toMatch(/<Script id="ga4-init" strategy="afterInteractive">/);
  });
});
