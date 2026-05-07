// src/app/tools/layout.tsx
//
// 모든 /tools/* 페이지 하단에 광고 + RelatedCalculators + 쿠팡 일괄 노출.

import RelatedCalculators from "@/components/RelatedCalculators";
import { HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="my-6">
          <InArticleAd />
        </div>
        <RelatedCalculators />
        <div className="my-6">
          <CoupangBanner
            responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
          />
        </div>
        <HomeTopAd />
      </div>
    </>
  );
}
