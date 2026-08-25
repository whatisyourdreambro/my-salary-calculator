"use client";

// src/components/affiliate/AffiliateSlot.tsx
//
// 금융 CPA 오퍼 슬롯 — 사이트 수익화의 단일 진입점.
//
//   [~84개 기존 호출부] → @/components/CoupangBanner (re-export 심) → AffiliateSlot
//     ├─ offers.json 활성 오퍼 매칭 시 → 오퍼 카드 (+고지문·GA4 계측·QA 훅)
//     └─ 매칭 없음/전부 inactive     → CoupangBannerCore 폴백 (픽셀·subId 현행 동일)
//
// 오퍼 전환은 src/data/offers.json 의 url/active 수정만으로 이뤄진다(코드 무변경).
// vertical:"none" 보호 경로(BLOCKED_PATHS)에서는 어떤 오퍼도 렌더되지 않는다.
//
// ⚠️ ad-audit 주의: 호출부 JSX 태그명은 <CoupangBanner> 그대로다(심 경유).
//    이 파일 내부에서는 태그명을 CoupangBannerCore 로만 렌더해
//    scripts/ad-audit.mjs 의 재귀 import 추적이 COUPANG 을 이중 집계하지 않게 한다.
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import CoupangBannerCore, {
  type CoupangBannerProps,
} from "./CoupangBannerCore";
import {
  AFFILIATE_DISCLOSURE_TEXT,
  interpolate,
  matchOffers,
  type Offer,
  type OfferVertical,
} from "@/lib/affiliateOffers";
import { trackAffiliateClick, trackAffiliateImpression } from "@/lib/analytics";

export type AffiliateSlotProps = CoupangBannerProps & {
  /** 버티컬 명시 오버라이드 — 미지정 시 pathname 으로 자동 추론 */
  vertical?: OfferVertical;
  /** 계산 결과 보간 값 — 오퍼 template 의 {key} 치환 (예: { amount: 3200 }) */
  calcResult?: Record<string, string | number>;
  /**
   * true: 활성 오퍼가 없으면 아무것도 렌더하지 않음 (쿠팡 폴백도 없음).
   * 결과 연동 CTA 옆 병기 슬롯용 — 오퍼 승인 전 외관 불변 보장.
   */
  offerOnly?: boolean;
};

// 페이지당 동일 오퍼 중복 노출 방지 (쿠팡 dedup 패턴 준용)
const renderedOffersByPath = new Map<string, Set<string>>();

function OfferCard({
  offer,
  pathname,
  calcResult,
}: {
  offer: Offer;
  pathname: string;
  calcResult?: Record<string, string | number>;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const impressionSent = useRef(false);

  // 노출 계측 — 뷰포트 진입 1회 (CTR 분모)
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !impressionSent.current) {
            impressionSent.current = true;
            trackAffiliateImpression(offer.id, pathname, offer.vertical);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px", threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [offer.id, offer.vertical, pathname]);

  const description =
    offer.template && calcResult
      ? interpolate(offer.template, calcResult)
      : offer.description;
  const disclosure = offer.disclosure ?? AFFILIATE_DISCLOSURE_TEXT;

  return (
    <div
      ref={cardRef}
      data-affiliate-offer={offer.id}
      data-affiliate-vertical={offer.vertical}
      className="w-full max-w-[640px] mx-auto my-6"
    >
      <a
        href={offer.url}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        onClick={() => trackAffiliateClick(offer.id, pathname, offer.vertical)}
        className="block rounded-2xl border-2 border-electric/30 bg-electric-5 p-5 hover:border-electric transition-colors no-underline"
      >
        <p className="font-bold text-navy text-[15px] mb-1">{offer.label}</p>
        <p className="text-sm text-muted-blue leading-relaxed">{description}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-electric">
          바로 확인하기 →
        </span>
      </a>
      <p className="mt-2 text-[11px] text-faint-blue text-center leading-relaxed font-medium">
        {disclosure}
      </p>
    </div>
  );
}

/**
 * AffiliateSlot — 기존 CoupangBanner props 의 상위집합.
 * 오퍼 매칭 실패 시 CoupangBannerCore 로 완전 폴백(현행 subId·dedup·고지 동일).
 */
export default function AffiliateSlot({
  vertical,
  calcResult,
  offerOnly = false,
  ...coupangProps
}: AffiliateSlotProps) {
  const pathname = usePathname();
  // 오퍼 매칭은 순수 함수라 렌더 시 동기 계산 — SSR HTML 에 오퍼가 그대로 실려
  // 크롤러(qa-crawl)가 검증할 수 있고, 쿠팡→오퍼 전환 플래시도 없다.
  const candidate: Offer | null = pathname
    ? (matchOffers(pathname, vertical)[0] ?? null)
    : null;

  // 페이지당 동일 오퍼 중복 노출 방지 — 등록만 마운트 후(모듈 상태 렌더 중 변경 금지).
  // 한 페이지에 슬롯이 2개 이상이고 오퍼가 활성인 드문 경우, 뒤 슬롯이 마운트 후
  // 폴백으로 강등된다 (쿠팡 코어의 effect dedup 과 동일한 방식).
  const [demoted, setDemoted] = useState(false);
  useEffect(() => {
    if (!pathname || !candidate) return;
    const shown = renderedOffersByPath.get(pathname) ?? new Set<string>();
    if (shown.has(candidate.id)) {
      setDemoted(true);
      return;
    }
    shown.add(candidate.id);
    renderedOffersByPath.set(pathname, shown);
    setDemoted(false);
    return () => {
      const current = renderedOffersByPath.get(pathname);
      current?.delete(candidate.id);
      if (current && current.size === 0) renderedOffersByPath.delete(pathname);
    };
  }, [pathname, candidate]);

  if (candidate && !demoted && pathname) {
    return (
      <OfferCard offer={candidate} pathname={pathname} calcResult={calcResult} />
    );
  }

  // offerOnly 슬롯: 오퍼 없으면 무렌더 (기존 CTA 옆 병기 — 승인 전 외관 불변)
  if (offerOnly) return null;

  // 폴백 — 기존 쿠팡 배너 그대로
  return <CoupangBannerCore {...coupangProps} />;
}

/**
 * OfferSlot — 오퍼 전용 슬롯(쿠팡 폴백 없음). 결과 연동 CTA 옆 병기용.
 * 오퍼 승인 전(전부 inactive)에는 아무것도 렌더하지 않아 외관이 불변이다.
 * 태그명을 AffiliateSlot 과 분리한 이유: scripts/ad-audit.mjs 가 AffiliateSlot 을
 * COUPANG 슬롯으로 계상하는데, 이 슬롯은 쿠팡을 절대 렌더하지 않으므로
 * 감사 대상에서 제외되어야 한다.
 */
export function OfferSlot(props: Omit<AffiliateSlotProps, "offerOnly">) {
  return <AffiliateSlot {...props} offerOnly />;
}
