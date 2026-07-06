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

/** 계산기 결과 산출 (사용자가 입력값으로 결과를 본 시점) */
export function trackCalcSubmit(
  calcType: string,
  meta: Record<string, unknown> = {}
): void {
  trackEvent("calc_submit", {
    calc_type: calcType,
    ...meta,
  });
}

/** 가이드/시즌 페이지 CTA 카드 클릭 */
export function trackGuideCTAClick(
  slug: string,
  position: string,
  pagePath?: string
): void {
  trackEvent("guide_cta_click", {
    slug,
    position,
    page_path: pagePath ?? (typeof location !== "undefined" ? location.pathname : ""),
  });
}

/** 회사 비교/탐색 — /company, /company/compare, /salary-db 진입 시 */
export function trackCompareView(
  companyIds: string[],
  source?: string
): void {
  trackEvent("compare_view", {
    company_ids: companyIds.join(","),
    company_count: companyIds.length,
    source: source ?? "",
  });
}

/**
 * 회사 페이지 진입 — "{회사명} 연봉" 검색이 트래픽 엔진의 1순위.
 * GA4 콘솔에서 "주요 이벤트(conversion)"로 표시하면 검색→유입 경로의 매출 가치가 보임.
 */
export function trackSalaryLookup(
  companyId: string,
  companyName: string,
  industry?: string
): void {
  trackEvent("salary_lookup", {
    company_id: companyId,
    company_name: companyName,
    industry: industry ?? "",
    page_path: typeof location !== "undefined" ? location.pathname : "",
  });
}

/**
 * 계산기 진입 — 사용자가 입력을 시작하기 전에 페이지에 도달한 시점.
 * trackCalcSubmit(calc_submit)과 비교해 funnel 전환율 측정.
 */
export function trackCalcStart(
  calcType: string,
  meta: Record<string, unknown> = {}
): void {
  trackEvent("calc_start", {
    calc_type: calcType,
    ...meta,
  });
}

/**
 * SNS 공유 클릭 — 바이럴 루프의 핵심 측정 지표.
 * 채널(kakao/instagram/facebook/twitter/copy)별로 어디서 공유가 일어나는지,
 * 어떤 결과 페이지가 가장 많이 공유되는지(viral coefficient) 추적.
 */
export function trackShare(
  channel: string,
  contentType: string,
  pagePath?: string
): void {
  trackEvent("share", {
    method: channel,
    content_type: contentType,
    page_path:
      pagePath ?? (typeof location !== "undefined" ? location.pathname : ""),
  });
}

/** 즐겨찾기/북마크 클릭 — 재방문률 향상 측정 */
export function trackBookmarkClick(
  targetPath: string,
  source?: string
): void {
  trackEvent("bookmark_click", {
    target_path: targetPath,
    source: source ?? "",
    page_path: typeof location !== "undefined" ? location.pathname : "",
  });
}

/**
 * 광고 단위 클릭 — AdSense Auto Ads는 자동 추적되지만,
 * 광고 위치(top/in-article/sidebar/result)별 가치를 별도 측정하기 위함.
 */
export function trackAdUnitClick(
  slotKind: string,
  position: string,
  pagePath?: string
): void {
  trackEvent("ad_unit_click", {
    slot_kind: slotKind,
    position,
    page_path:
      pagePath ?? (typeof location !== "undefined" ? location.pathname : ""),
  });
}
