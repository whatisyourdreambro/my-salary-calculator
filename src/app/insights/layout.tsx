import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import PageFooterAds from "@/components/PageFooterAds";
import AutoShareSection from "@/components/AutoShareSection";

// /insights 인덱스 전용 메타데이터.
// /insights/<slug> 리포트 페이지는 자체 metadata 가 우선 적용된다.
export const metadata: Metadata = buildPageMetadata({
  title: "머니샐러리 데이터 리포트 — 연봉·성과급 데이터 분석",
  description:
    "국내 400여 개사 연봉 DB와 공시·정부 통계를 집계한 머니샐러리의 데이터 리포트. 업종별 초봉 순위, 성과급 실지급률 등 출처 표기 시 자유롭게 인용할 수 있습니다.",
  path: "/insights",
  keywords: [
    "연봉 데이터",
    "업종별 연봉",
    "연봉 리포트",
    "초봉 순위",
    "머니샐러리 데이터 리포트",
  ],
});

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <PageFooterAds maxWidth="3xl" />
      {/* 공유 fallback은 광고 아래 — 광고 밀림 방지 (2026-08-16 수익 대응) */}
      <AutoShareSection contentType="report" maxWidth="3xl" className="pb-16" />
    </>
  );
}
