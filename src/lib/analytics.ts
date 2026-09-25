// src/lib/analytics.ts
//
// GA4 이벤트 전송 안전 래퍼.
// - SSR 환경에서도 안전 (window 미정의 시 no-op)
// - gtag 미로드 상태(스크립트 차단·블로커) 시도 무해
// - 무료 GA4 한도 (월 10M 이벤트) 내 안전한 사용 가정

import { PAGE_SCOPED_MEASUREMENT_EVENTS, sanitizeAnalyticsParams, sanitizeAnalyticsUrl } from "./analyticsPrivacy";
import { getNavType } from "./navType";
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
    // 광고·제휴 계측은 공개 금액 페이지(/monthly/N·/salary/N 정적 격자)의 실제 경로를 유지해
    // page_view·ad_impression 과 같은 Page path 행에 붙는다. 그 외 이벤트는 금액 경로 비식별 유지.
    const urlOptions = { keepPublicAmountPath: PAGE_SCOPED_MEASUREMENT_EVENTS.has(name) };
    window.gtag?.("event", name, {
      ...sanitizeAnalyticsParams(name, params),
      // Event-scoped overrides. Automatic GA history/outbound events are separate.
      page_location: sanitizeAnalyticsUrl(window.location?.href ?? "", undefined, urlOptions),
      page_referrer: typeof document !== "undefined" ? sanitizeAnalyticsUrl(document.referrer, undefined, urlOptions) : "",
    });
  } catch {
    // GA4 push errors are non-fatal
  }
}

/**
 * 수동 광고 요청 시도 — GA4/AdSense의 실제 ad_impression과 구분한다.
 * 광고 계측 5종(ad_request_attempt·ad_request_error·ad_filled·ad_unfilled·ad_unit_click)은
 * nav_type(landing = 문서 첫 로드 / soft = 클라이언트 전환 뒤)을 이벤트 인자로 싣는다(2026-09-25, 측정 전용 —
 * 요청·렌더·dedup 로직 무변경). 값의 정의와 판정 규칙은 src/lib/navType.ts · docs/analytics-measurement.md.
 */
export function trackAdRequestAttempt(slotKind: string, pagePath?: string): void {
  trackEvent("ad_request_attempt", {
    slot_kind: slotKind,
    page_path: pagePath ?? (typeof location !== "undefined" ? location.pathname : ""),
    nav_type: getNavType(),
  });
}

/** push 예외 진단. 오류 원문이나 사용자 입력값은 전송하지 않는다. */
export function trackAdRequestError(slotKind: string, pagePath?: string): void {
  trackEvent("ad_request_error", {
    slot_kind: slotKind,
    error_type: "push_failed",
    page_path: pagePath ?? (typeof location !== "undefined" ? location.pathname : ""),
    nav_type: getNavType(),
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
 * 링크 목적지의 템플릿 묶음 — guide_cta_click 의 dest_tpl 인자 (2026-09-26 RPM-02, 측정 전용).
 * href 자체는 고유값이 하루 500개를 넘어 맞춤 측정기준으로 등록할 수 없다(아래 trackInternalLinkClick 주석).
 * 대신 목적지를 아래 17개 고정값으로 묶어 '어느 모듈이 어떤 템플릿으로 보냈나'를 본다.
 * 값을 늘리거나 이름을 바꾸면 GA4 에 쌓인 과거 행과 이어지지 않으므로 새 값은 추가만 한다.
 */
export const DEST_TEMPLATES = [
  "company",
  "compare",
  "salary-db-hub",
  "ranking",
  "job",
  "job-hub",
  "bonus-calc",
  "samsung-bonus",
  "calc",
  "salary-amount",
  "monthly",
  "pay-table",
  "table",
  "guide",
  "industry",
  "home",
  "other",
] as const;
export type DestTemplate = (typeof DEST_TEMPLATES)[number];

const SITE_HOSTS = new Set(["www.moneysalary.com", "moneysalary.com"]);

/**
 * href → 목적지 템플릿. 순수 함수(브라우저 전역 미사용). 쿼리·해시를 떼고, 끝 슬래시를 무시하며,
 * 같은 사이트의 절대 URL(https://www.moneysalary.com/…)은 경로만 본다. 다른 도메인·상대 경로·빈 값은 other.
 */
export function destTemplate(href: string): DestTemplate {
  let path = (href ?? "").trim().split("#")[0].split("?")[0];
  if (/^(https?:)?\/\//i.test(path)) {
    try {
      const url = new URL(path, "https://www.moneysalary.com");
      if (!SITE_HOSTS.has(url.hostname.toLowerCase())) return "other";
      path = url.pathname;
    } catch {
      return "other";
    }
  }
  if (!path.startsWith("/")) return "other";
  path = path.replace(/\/+$/, "") || "/";

  if (path === "/") return "home";
  if (path === "/salary-db") return "salary-db-hub";
  if (/^\/salary-db\/compare(\/|$)/.test(path)) return "compare";
  if (/^\/salary-db\/ranking(\/|$)/.test(path)) return "ranking";
  // 상장사 공시 트리: 허브는 salary-db-hub, 순위형(top-*·업종별)은 ranking, 종목 코드 페이지는 company
  if (path === "/salary-db/listed") return "salary-db-hub";
  if (/^\/salary-db\/listed\/(top-[a-z-]+|industry)(\/|$)/.test(path)) return "ranking";
  if (/^\/salary-db\/[^/]+/.test(path)) return "company";
  if (/^\/calc\/samsung-bonus(\/|$)/.test(path)) return "samsung-bonus";
  if (/^\/calc\/([a-z0-9-]+-bonus|bonus-calculators)(\/|$)/.test(path)) return "bonus-calc";
  if (/^\/calc(\/|$)/.test(path)) return "calc";
  if (/^\/salary\/[^/]+/.test(path)) return "salary-amount";
  if (/^\/monthly(\/|$)/.test(path)) return "monthly";
  if (/^\/(teacher|police|firefighter|civil-servant)-pay-/.test(path)) return "pay-table";
  if (/^\/table(\/|$)/.test(path)) return "table";
  if (/^\/guides(\/|$)/.test(path)) return "guide";
  if (/^\/industry(\/|$)/.test(path)) return "industry";
  if (path === "/job") return "job-hub";
  if (/^\/job\//.test(path)) return "job";
  return "other";
}

/**
 * 가이드/시즌 페이지 CTA 카드 클릭.
 * position 값: related-calc · next-action · related-guide (onClick 직접 호출)
 *   + InternalLinkTracker 가 보내는 data-msy-module id (industry-rank 등, ≤40종 — internalLinkModules.test).
 * destTpl: 목적지 템플릿(destTemplate). 넘긴 호출만 dest_tpl 을 싣는다 — 직접 호출부는 종전 그대로(미전송).
 */
export function trackGuideCTAClick(
  slug: string,
  position: string,
  pagePath?: string,
  destTpl?: DestTemplate
): void {
  trackEvent("guide_cta_click", {
    slug,
    position,
    page_path: pagePath ?? (typeof location !== "undefined" ? location.pathname : ""),
    ...(destTpl ? { dest_tpl: destTpl } : {}),
  });
}

/**
 * 서버 컴포넌트 링크 모듈 내부 링크 클릭 (InternalLinkTracker 전용).
 * 새 이벤트명 대신 guide_cta_click 을 재사용 — slug=href, position=모듈 id, dest_tpl=목적지 템플릿.
 * 9/7 등록되는 'position' 맞춤 측정기준 하나로 모듈별 클릭이 분해된다.
 * href 는 측정기준으로 등록하지 않는다(일 500 고유값 한도 초과 → 절삭). 목적지 분해는 17값 dest_tpl 로 본다.
 */
export function trackInternalLinkClick(href: string, moduleId: string): void {
  trackGuideCTAClick(href, moduleId, undefined, destTemplate(href));
}

/**
 * 회사 비교/탐색 — /company, /company/compare, /salary-db 진입 시
 * 진입 맥락은 ui_source 로 보낸다 — 'source' 는 GA4 가 세션 소스로 읽어 채널을 덮어쓴다
 * ("compare-page / (not set)" 세션, 2026-09-25 수정. analyticsPrivacy RESERVED_TRAFFIC_SOURCE_PARAMS 참고).
 */
export function trackCompareView(
  companyIds: string[],
  source?: string
): void {
  trackEvent("compare_view", {
    company_ids: companyIds.join(","),
    company_count: companyIds.length,
    ui_source: source ?? "",
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

/**
 * Result-share funnel before a channel is chosen: preview opened -> content approved
 * (OG-13). The channel step is the existing share/share_outcome with share_mode=result.
 * Fixed enum fields only; no URL, title, image, result key or user amounts.
 */
export function trackSharePreview(step: "open" | "approve", contentType: string): void {
  trackEvent(step === "open" ? "share_preview_open" : "share_preview_approve", {
    content_type: SHARE_TYPES.has(contentType) ? contentType : "page",
    share_mode: "result",
    event_version: 2,
  });
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

/**
 * 즐겨찾기/북마크 클릭 — 재방문률 향상 측정
 * 동작 구분(add·remove·toast_dashboard·header_badge)은 ui_source — 'source' 로 보내면 GA4 가
 * 세션 소스를 "add / (not set)" 등으로 덮어써 실제 유입 채널이 사라졌다(2026-09-25 수정).
 */
export function trackBookmarkClick(
  targetPath: string,
  source?: string
): void {
  trackEvent("bookmark_click", {
    target_path: targetPath,
    ui_source: source ?? "",
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
    nav_type: getNavType(),
  });
}

/**
 * 광고 채움 결과 — AdSlot 의 data-ad-status 가 filled/unfilled 로 전이될 때 슬롯당 1회.
 * ad_request_attempt는 adsbygoogle.push() 시점의 진단 요청 수이며 실노출이 아니다.
 * 이 두 이벤트로 슬롯별 채움률(ad_filled ÷ (ad_filled+ad_unfilled))과
 * '요청은 됐는데 채움 상태가 영영 안 잡히는' 죽은 유닛(27a692c 유형)을 GA4 에서 찾는다.
 * (2026-09-05 운영자 승인 — 광고 컴포넌트 내부 계측 2줄 예외)
 *
 * + S1-6(2026-09-11) 필드 확장 — 승인②(2026-09-05 계측 예외)의 확장으로 분류, 요청·렌더·dedup 로직 무변경:
 *   extra.ad_height = 채움 시 크리에이티브(iframe) 높이(px 정수), 미채움은 0 — <ins> 는 예약 minHeight 로 바닥이 깔려 쓰지 않는다,
 *   extra.viewport  = 뷰포트 폭 버킷 m(<768) / t(<1024) / d(그 외).
 *   슬롯·뷰포트별 예약 높이(minHeight) 자료용(S3-3, 2027-02 승인 상정). 사용자 입력·금액·URL 은 받지 않고,
 *   유효하지 않은 값은 생략한다. GA4 보고서에 보이려면 맞춤 측정기준(이벤트 범위) ad_height·viewport 를 콘솔에 등록할 것.
 * + nav_type(2026-09-25) — trackAdRequestAttempt 주석 참조. 인자 추가뿐, 호출 시점·횟수 무변경.
 */
export type AdFillExtra = { ad_height?: number; viewport?: "m" | "t" | "d" };

export function trackAdFillStatus(
  slotKind: string,
  position: string,
  status: "filled" | "unfilled",
  pagePath?: string,
  extra?: AdFillExtra
): void {
  const height = extra?.ad_height;
  const viewport = extra?.viewport;
  trackEvent(status === "filled" ? "ad_filled" : "ad_unfilled", {
    slot_kind: slotKind,
    position,
    page_path:
      pagePath ?? (typeof location !== "undefined" ? location.pathname : ""),
    ...(typeof height === "number" && Number.isFinite(height) && height >= 0
      ? { ad_height: Math.round(height) }
      : {}),
    ...(viewport === "m" || viewport === "t" || viewport === "d" ? { viewport } : {}),
    nav_type: getNavType(),
  });
}

/**
 * 제휴 오퍼 배치 — GA4 맞춤 측정기준 'position'(제휴 배치, Slot03)의 값.
 *   offer-slot  = OfferSlot(결과 연동 CTA 옆 병기, 쿠팡 폴백 없음)
 *   banner-slot = CoupangBanner 호출부를 오퍼 카드가 대체한 자리
 * 종전에는 position 을 보내지 않아 affiliate_impression 2,233건 전부 (not set) 이었다(2026-09-25 수정).
 */
export type AffiliatePlacement = "offer-slot" | "banner-slot";

function affiliateParams(offerId: string, page: string, vertical: string, placement?: AffiliatePlacement) {
  return {
    offer_id: offerId,
    page, // 기존 보고서 키 유지
    page_path: page, // 다른 광고·제휴 이벤트와 같은 키로 페이지 조인
    vertical,
    ...(placement === "offer-slot" || placement === "banner-slot" ? { position: placement } : {}),
  };
}

/**
 * 제휴 오퍼 클릭 — AffiliateSlot 전용 (지시서 §TASK-3-5)
 * 링크가 새 탭(target=_blank)으로 나가므로 GA4 배치 큐(최대 약 5초)에서 기다리는 동안
 * 인앱 브라우저 창 전환·종료로 유실되지 않도록 beacon 전송을 명시한다(측정 전용, 링크·파라미터 무변경).
 */
export function trackAffiliateClick(
  offerId: string,
  page: string,
  vertical: string,
  placement?: AffiliatePlacement
): void {
  trackEvent("affiliate_click", {
    ...affiliateParams(offerId, page, vertical, placement),
    transport_type: "beacon",
  });
}

/** 제휴 오퍼 노출 — CTR 분모용 (IntersectionObserver 1회 발화, AffiliateSlot 전용) */
export function trackAffiliateImpression(
  offerId: string,
  page: string,
  vertical: string,
  placement?: AffiliatePlacement
): void {
  trackEvent("affiliate_impression", affiliateParams(offerId, page, vertical, placement));
}
