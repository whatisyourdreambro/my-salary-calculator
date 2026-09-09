// src/lib/analytics.ts
//
// GA4 이벤트 전송 안전 래퍼.
// - SSR 환경에서도 안전 (window 미정의 시 no-op)
// - gtag 미로드 상태(스크립트 차단·블로커) 시도 무해
// - 무료 GA4 한도 (월 10M 이벤트) 내 안전한 사용 가정

import { sanitizeAnalyticsParams, sanitizeAnalyticsUrl } from "./analyticsPrivacy";
import { shareAnalyticsPath, type ShareMode } from "./sharePolicy";
import type { ShareOutcome, ShareErrorKind } from "./shareTransport";

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
    window.gtag?.("event", name, {
      ...sanitizeAnalyticsParams(name, params),
      // Event-scoped overrides. Automatic GA history/outbound events are separate.
      page_location: sanitizeAnalyticsUrl(window.location?.href ?? ""),
      page_referrer: typeof document !== "undefined" ? sanitizeAnalyticsUrl(document.referrer) : "",
    });
  } catch {
    // GA4 push errors are non-fatal
  }
}

/** 수동 광고 요청 시도 — GA4/AdSense의 실제 ad_impression과 구분한다. */
export function trackAdRequestAttempt(slotKind: string, pagePath?: string): void {
  trackEvent("ad_request_attempt", {
    slot_kind: slotKind,
    page_path: pagePath ?? (typeof location !== "undefined" ? location.pathname : ""),
  });
}

/** push 예외 진단. 오류 원문이나 사용자 입력값은 전송하지 않는다. */
export function trackAdRequestError(slotKind: string, pagePath?: string): void {
  trackEvent("ad_request_error", {
    slot_kind: slotKind,
    error_type: "push_failed",
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

/**
 * 금액을 500만원 구간 라벨로 변환한다 (예: 52,000,000 → "5000-5500만").
 *
 * Legacy helper preserved for callers/tests. The v2 calculation events do not send
 * monetary bands either. Upstream had already replaced exact values with bands;
 * this release removes those bands from calculation telemetry entirely.
 */
export function salaryBand(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return "unknown";
  const step = 5_000_000;
  const lo = Math.floor(amount / step) * step;
  return `${lo / 10_000}-${(lo + step) / 10_000}만`;
}

/**
 * v2 successful calculation: trusted interaction + valid current result visible.
 * calc_submit was an inconsistent legacy input-idle/recalculate proxy and is retired.
 * Deliberately no arbitrary metadata argument: input amounts must stay in the browser.
 */
export function trackCalcSuccess(calcType: string, pagePath?: string): void {
  trackEvent("calc_success", calculationParams(calcType, pagePath));
}

export function trackCalcResultView(calcType: string, origin: "default" | "user", pagePath?: string): void {
  trackEvent("result_view", { ...calculationParams(calcType, pagePath), result_origin: origin });
}

/** Explicit comparison of at least two valid offers matching the current inputs. */
export function trackOfferCompareComplete(mode: "first" | "recalculate"): void {
  trackEvent("offer_compare_complete", { comparison_mode: mode, measurement_version: "1" });
}

/** User opens the explanation of a current, valid comparison. */
export function trackOfferCompareExplanationView(): void {
  trackEvent("offer_compare_explanation_view", { section: "result_basis", measurement_version: "1" });
}

function calculationParams(calcType: string, pagePath?: string) {
  return {
    calc_type: calcType,
    page_path: pagePath ?? (typeof location !== "undefined" ? location.pathname : ""),
    measurement_version: "2",
  };
}

/**
 * 가이드/시즌 페이지 CTA 카드 클릭.
 * position 값: related-calc · next-action · related-guide (onClick 직접 호출)
 *   + InternalLinkTracker 가 보내는 data-msy-module id (industry-rank 등, ≤15종).
 */
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

/**
 * 서버 컴포넌트 링크 모듈 내부 링크 클릭 (InternalLinkTracker 전용).
 * 새 이벤트명 대신 guide_cta_click 을 재사용 — slug=href, position=모듈 id.
 * 9/7 등록되는 'position' 맞춤 측정기준 하나로 모듈별 클릭이 분해된다.
 * href 는 측정기준으로 등록하지 않는다(일 500 고유값 한도 초과 → 절삭).
 */
export function trackInternalLinkClick(href: string, moduleId: string): void {
  trackGuideCTAClick(href, moduleId);
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
 * v2: first trusted interaction with this calculator's controls, once per page visit.
 * Page arrival/default results are not a start. Compare only with v2 calc_success.
 */
export function trackCalcStart(
  calcType: string,
  pagePath?: string
): void {
  trackEvent("calc_start", calculationParams(calcType, pagePath));
}

/**
 * Historical `share` is an attempt, never a completed post. v2 outcomes are separate.
 */
export function trackShare(
  channel: string,
  contentType: string,
  pagePath?: string,
  shareMode: ShareMode = "page"
): void {
  trackEvent("share", {
    ...shareEventParams(channel, contentType, pagePath, shareMode),
  });
}

const SHARE_METHODS = new Set(["kakao", "webshare", "copy", "naver_blog", "facebook", "x", "band", "line", "telegram", "threads", "instagram"]);
const SHARE_TYPES = new Set(["page", "tool", "calc_result", "salary_result", "company", "guide", "fun", "float_bar", "samsung_bonus", "samsung_bonus_result", "result", "report"]);
function shareEventParams(channel: string, contentType: string, pagePath: string | undefined, mode: ShareMode) {
  return {
    method: SHARE_METHODS.has(channel) ? channel : "other",
    content_type: SHARE_TYPES.has(contentType) ? contentType : "page",
    share_mode: mode === "result" ? "result" : "page",
    event_version: 2,
    page_path: shareAnalyticsPath(pagePath ?? (typeof location !== "undefined" ? location.pathname : "/")),
  };
}

/** Only fixed outcomes; no URL, title, image, result key, error text or user amounts. */
export function trackShareOutcome(channel: string, contentType: string, outcome: ShareOutcome, pagePath?: string, shareMode: ShareMode = "page", errorKind?: ShareErrorKind): void {
  const allowed = ["native_handoff", "sdk_requested", "intent_requested", "clipboard_success", "aborted", "error", "manual_copy_shown"];
  if (!allowed.includes(outcome)) return;
  trackEvent("share_outcome", {
    ...shareEventParams(channel, contentType, pagePath, shareMode),
    outcome,
    ...(errorKind && ["permission", "unsupported", "invalid", "busy", "unavailable"].includes(errorKind) ? { error_kind: errorKind } : {}),
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

/**
 * 광고 채움 결과 — AdSlot 의 data-ad-status 가 filled/unfilled 로 전이될 때 슬롯당 1회.
 * ad_request_attempt는 adsbygoogle.push() 시점의 진단 요청 수이며 실노출이 아니다.
 * 이 두 이벤트로 슬롯별 채움률(ad_filled ÷ (ad_filled+ad_unfilled))과
 * '요청은 됐는데 채움 상태가 영영 안 잡히는' 죽은 유닛(27a692c 유형)을 GA4 에서 찾는다.
 * (2026-09-05 운영자 승인 — 광고 컴포넌트 내부 계측 2줄 예외)
 */
export function trackAdFillStatus(
  slotKind: string,
  position: string,
  status: "filled" | "unfilled",
  pagePath?: string
): void {
  trackEvent(status === "filled" ? "ad_filled" : "ad_unfilled", {
    slot_kind: slotKind,
    position,
    page_path:
      pagePath ?? (typeof location !== "undefined" ? location.pathname : ""),
  });
}

/** 제휴 오퍼 클릭 — AffiliateSlot 전용 (지시서 §TASK-3-5) */
export function trackAffiliateClick(
  offerId: string,
  page: string,
  vertical: string
): void {
  trackEvent("affiliate_click", {
    offer_id: offerId,
    page,
    vertical,
  });
}

/** 제휴 오퍼 노출 — CTR 분모용 (IntersectionObserver 1회 발화, AffiliateSlot 전용) */
export function trackAffiliateImpression(
  offerId: string,
  page: string,
  vertical: string
): void {
  trackEvent("affiliate_impression", {
    offer_id: offerId,
    page,
    vertical,
  });
}
