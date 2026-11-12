// src/app/tools/layout.tsx
//
// 모든 /tools/* 페이지 하단에 광고 + RelatedCalculators + 쿠팡 일괄 노출.

import TopicNextSteps from '@/components/TopicNextSteps';
import ToolExplainerSection from "@/components/ToolExplainerSection";
import RelatedCalculators from "@/components/RelatedCalculators";
import { HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import AutoShareSection from "@/components/AutoShareSection";
import FloatingShareBar from "@/components/FloatingShareBar";

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
      {/* 공유 fallback은 광고 블록 아래 — 광고 밀림 방지 (2026-08-16 수익 대응) */}
      <AutoShareSection contentType="tool" maxWidth="5xl" className="pb-16" />
      <FloatingShareBar />
      <TopicNextSteps />
      {/* lens-meta-F10 (2026-11-13): /tools/math 설명 글 — 레이아웃 마지막 광고(HomeTopAd) 아래, 등록 경로에서만 렌더 */}
      <ToolExplainerSection />
    </>
  );
}
