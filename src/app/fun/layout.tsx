// src/app/fun/layout.tsx
//
// /fun/* 페이지(20+ 게임/재미 도구) 공통 푸터.
// 결과 화면 후 광고 + 쿠팡 배너 일괄 노출.
//
// noindex 처리: /fun 페이지들은 세션 단위 결과(공유링크 등)가 많아
// thin content 정책에 걸리기 쉬움. 카테고리 인덱스나 공유 링크 라우트는
// 각 page.tsx에서 개별 metadata로 noindex 결정 (이 layout은 가시성에만 관여).

import type { Metadata } from "next";
import { CalcResultAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata: Metadata = {
  // 카테고리 단위 robots 기본값 — 개별 page.tsx에서 override 가능
  robots: {
    index: true,
    follow: true,
  },
};

export default function FunLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="my-6">
          <CalcResultAd />
        </div>
        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />
        <div className="mt-6">
          <HomeTopAd />
        </div>
      </div>
    </>
  );
}
