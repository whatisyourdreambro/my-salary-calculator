"use client";

// 페이지 본문 끝에 광고 3개(InArticleAd + CoupangBanner + HomeTopAd) 일괄 노출.
// 단일 페이지(/home-loan, /car-loan, /fire-calculator 등) 광고 누락 해소용 공통 슬롯.
// 쿠팡 카테고리는 CoupangBanner 가 pathname 기반 자동 추론 (별도 prop 불필요).

import { HomeTopAd, InArticleAd } from "./AdPlacement";
import CoupangBanner from "./CoupangBanner";

interface Props {
  /** 컨테이너 max-width 조정 */
  maxWidth?: "3xl" | "4xl" | "5xl";
}

export default function PageFooterAds({ maxWidth = "3xl" }: Props) {
  const maxWidthClass = {
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  }[maxWidth];

  return (
    <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 my-10 space-y-6`}>
      <InArticleAd />
      <CoupangBanner
        responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
      />
      <HomeTopAd />
    </div>
  );
}
