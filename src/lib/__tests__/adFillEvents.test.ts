// 광고 채움 계측(ad_filled / ad_unfilled) 회귀 가드 (2026-09-05)
//
// 배경: ad_impression 은 adsbygoogle.push() 시점의 "요청 수"라 실노출·채움률을 답하지 못한다.
// AdSlot 의 data-ad-status MutationObserver 가 filled/unfilled 전이 시 슬롯당 1회
// trackAdFillStatus 를 호출해야 GA4 에서 슬롯별 채움률과 죽은 유닛(27a692c 유형)을 찾을 수 있다.
// jsdom 환경이 없어 소스를 스캔한다 (adPlacementInsWidth.test.ts 와 같은 방식).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { trackAdFillStatus } from "../analytics";

const AD_PLACEMENT = readFileSync(
  resolve(process.cwd(), "src/components/AdPlacement.tsx"),
  "utf8",
);
const ANALYTICS = readFileSync(
  resolve(process.cwd(), "src/lib/analytics.ts"),
  "utf8",
);

describe("광고 채움 계측", () => {
  it("analytics 가 ad_filled / ad_unfilled 두 이벤트 이름을 내보낸다", () => {
    expect(ANALYTICS).toContain("export function trackAdFillStatus(");
    expect(ANALYTICS).toContain('"ad_filled"');
    expect(ANALYTICS).toContain('"ad_unfilled"');
  });

  it("AdSlot 의 data-ad-status 관찰자가 trackAdFillStatus 를 호출한다", () => {
    const observerIdx = AD_PLACEMENT.indexOf('attributeFilter: ["data-ad-status"]');
    expect(observerIdx).toBeGreaterThan(-1);
    // 관찰자 등록 직전 400자 안에 채움 계측 호출이 있어야 한다(같은 effect 안).
    const window = AD_PLACEMENT.slice(Math.max(0, observerIdx - 900), observerIdx);
    expect(window).toContain("trackAdFillStatus(");
    expect(window).toContain('status === "filled"');
  });

  it("슬롯당 1회 발화 가드(fillReported)가 pathname 변경 시 초기화된다", () => {
    expect(AD_PLACEMENT).toContain("fillReported.current = null;");
    expect(AD_PLACEMENT).toContain("fillReported.current !== status");
  });

  it("unfilled 는 뷰포트 아래면 접고(collapse) 뷰포트 안이면 높이를 유지한다(keep) — 2026-09-11 CLS 정비", () => {
    expect(AD_PLACEMENT).toContain('if (status === "unfilled") {');
    expect(AD_PLACEMENT).toContain('setUnfilled(intersects ? "keep" : "collapse");');
    expect(AD_PLACEMENT).toContain('unfilled === "collapse" ? { display: "none" } : unfilled === "keep" ? { visibility: "hidden" } : {}');
  });

  it("pathname 변경 직후 stale <ins> 를 읽지 않도록 pushed 가드가 관찰 effect 앞에 있다", () => {
    // 레이아웃 상주 슬롯이 형제 라우트 이동 시 이전 페이지 결과를 새 경로로 오귀속하던 경로 차단.
    const guardIdx = AD_PLACEMENT.indexOf("if (!pushed.current) return;");
    const observerIdx = AD_PLACEMENT.indexOf('attributeFilter: ["data-ad-status"]');
    expect(guardIdx).toBeGreaterThan(-1);
    expect(guardIdx).toBeLessThan(observerIdx);
    // 계측 호출이 location 타이밍에 의존하지 않도록 pathname 을 명시 전달한다.
    expect(AD_PLACEMENT).toContain("trackAdFillStatus(slotKind ?? \"unknown\", slot, status, pathname, {");
  });

  it("S1-6 확장 — 전이 시점 크리에이티브 높이(미채움 0)와 뷰포트 버킷을 같은 호출에 싣는다(승인② 필드 확장, 요청·렌더 로직 무접촉)", () => {
    const observerIdx = AD_PLACEMENT.indexOf('attributeFilter: ["data-ad-status"]');
    const window = AD_PLACEMENT.slice(Math.max(0, observerIdx - 1400), observerIdx);
    // 높이는 status 전이 시점의 값이어야 한다(setUnfilled 재렌더 전 — 같은 check 호출 안). <ins> 는 예약 minHeight 로
    // 바닥이 깔리므로(2026-09-12 리뷰) 채움 시 iframe 을 재고, 미채움은 0 을 보낸다.
    expect(window).toContain('const creative = status === "filled" ? ins.querySelector("iframe") : null;');
    expect(window).toContain('status !== "filled" ? 0 : Math.round((creative ?? ins).getBoundingClientRect().height)');
    expect(window).not.toContain("ad_height: Math.round(ins.getBoundingClientRect().height)");
    expect(window).toContain("viewport: viewportBucket(window.innerWidth)");
    expect(AD_PLACEMENT).toContain('import { viewportBucket } from "@/lib/vitalsAttribution";');
    // 계측 확장이 광고 요청·dedup 경로를 건드리지 않았다는 최소 증거.
    expect(AD_PLACEMENT).toContain("(window.adsbygoogle = window.adsbygoogle || []).push({});");
    expect(AD_PLACEMENT).toContain("renderedSlotsByPath.set(pathname, seen);");
    expect(ANALYTICS).toContain("extra?: AdFillExtra");
  });
});

describe("trackAdFillStatus 확장 필드 (S1-6, 2026-09-11)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("ad_height 정수·viewport 버킷을 이벤트에 싣고, 인자가 없으면 종전 형태 그대로다", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag, location: { href: "https://www.moneysalary.com/calc/vat?salary=80000000" } });
    trackAdFillStatus("result", "1234567890", "filled", "/calc/vat", { ad_height: 249.6, viewport: "m" });
    trackAdFillStatus("sidebar", "2", "unfilled", "/calc/vat", { ad_height: 0, viewport: "d" });
    trackAdFillStatus("result", "1234567890", "filled", "/calc/vat");
    const base = { page_location: "https://www.moneysalary.com/calc/vat", page_referrer: "" };
    expect(gtag.mock.calls).toEqual([
      ["event", "ad_filled", { slot_kind: "result", position: "1234567890", page_path: "/calc/vat", ad_height: 250, viewport: "m", ...base }],
      ["event", "ad_unfilled", { slot_kind: "sidebar", position: "2", page_path: "/calc/vat", ad_height: 0, viewport: "d", ...base }],
      ["event", "ad_filled", { slot_kind: "result", position: "1234567890", page_path: "/calc/vat", ...base }],
    ]);
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("80000000");
  });

  it("유효하지 않은 높이·버킷은 생략하고, GA 가 막혀도 예외를 내지 않는다", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag, location: { href: "https://www.moneysalary.com/" } });
    trackAdFillStatus("home-top", "1", "filled", "/", { ad_height: NaN, viewport: "xl" as unknown as "d" });
    trackAdFillStatus("home-top", "1", "filled", "/", { ad_height: -5 });
    trackAdFillStatus("home-top", "1", "filled", "/", {});
    expect(gtag).toHaveBeenCalledTimes(3);
    for (const [, , params] of gtag.mock.calls) {
      expect(params).not.toHaveProperty("ad_height");
      expect(params).not.toHaveProperty("viewport");
    }
    vi.stubGlobal("window", { gtag: () => { throw new Error("blocked"); } });
    expect(() => trackAdFillStatus("result", "1", "unfilled", "/", { ad_height: 0, viewport: "t" })).not.toThrow();
  });
});
