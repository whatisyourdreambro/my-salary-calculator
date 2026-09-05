// 광고 채움 계측(ad_filled / ad_unfilled) 회귀 가드 (2026-09-05)
//
// 배경: ad_impression 은 adsbygoogle.push() 시점의 "요청 수"라 실노출·채움률을 답하지 못한다.
// AdSlot 의 data-ad-status MutationObserver 가 filled/unfilled 전이 시 슬롯당 1회
// trackAdFillStatus 를 호출해야 GA4 에서 슬롯별 채움률과 죽은 유닛(27a692c 유형)을 찾을 수 있다.
// jsdom 환경이 없어 소스를 스캔한다 (adPlacementInsWidth.test.ts 와 같은 방식).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

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

  it("기존 unfilled 접힘 동작은 유지된다", () => {
    expect(AD_PLACEMENT).toContain('if (status === "unfilled") setUnfilled(true);');
  });

  it("pathname 변경 직후 stale <ins> 를 읽지 않도록 pushed 가드가 관찰 effect 앞에 있다", () => {
    // 레이아웃 상주 슬롯이 형제 라우트 이동 시 이전 페이지 결과를 새 경로로 오귀속하던 경로 차단.
    const guardIdx = AD_PLACEMENT.indexOf("if (!pushed.current) return;");
    const observerIdx = AD_PLACEMENT.indexOf('attributeFilter: ["data-ad-status"]');
    expect(guardIdx).toBeGreaterThan(-1);
    expect(guardIdx).toBeLessThan(observerIdx);
    // 계측 호출이 location 타이밍에 의존하지 않도록 pathname 을 명시 전달한다.
    expect(AD_PLACEMENT).toContain("trackAdFillStatus(slotKind ?? \"unknown\", slot, status, pathname)");
  });
});
