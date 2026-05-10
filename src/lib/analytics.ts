// src/lib/analytics.ts
//
// GA4 이벤트 전송 안전 래퍼.
// - SSR 환경에서도 안전 (window 미정의 시 no-op)
// - gtag 미로드 상태(스크립트 차단·블로커) 시도 무해
// - 무료 GA4 한도 (월 10M 이벤트) 내 안전한 사용 가정

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(
  name: string,
  params: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", name, params);
  } catch {
    // GA4 push errors are non-fatal
  }
}

/** 광고 노출 (한 번 visible 된 시점) */
export function trackAdImpression(slotKind: string, pagePath?: string): void {
  trackEvent("ad_impression", {
    slot_kind: slotKind,
    page_path: pagePath ?? (typeof location !== "undefined" ? location.pathname : ""),
  });
}

/** 쿠팡 배너 클릭 */
export function trackCoupangClick(
  bannerSize: string,
  category: string,
  pagePath?: string
): void {
  trackEvent("coupang_click", {
    banner_size: bannerSize,
    category,
    page_path: pagePath ?? (typeof location !== "undefined" ? location.pathname : ""),
  });
}
