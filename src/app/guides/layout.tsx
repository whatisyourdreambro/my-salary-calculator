import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import PageFooterAds from "@/components/PageFooterAds";
import AutoShareSection from "@/components/AutoShareSection";
import GuideSupplement from "@/components/GuideSupplement";
import { guideSupplements } from "@/lib/guides/supplements";

// /guides 허브 페이지 전용 메타데이터.
// /guides/[slug] 글 페이지는 자체 generateMetadata 가 우선 적용된다.
export const metadata: Metadata = buildPageMetadata({
  title: "금융·연봉 가이드 — 연말정산·재테크·세금 절약 실전 가이드",
  description:
    "연봉 협상, 연말정산, 4대보험, 재테크까지 직장인이 꼭 알아야 할 금융 지식을 쉽게 풀어낸 가이드 모음입니다. 2026년 최신 세법 기준으로 업데이트됩니다.",
  path: "/guides",
  keywords: [
    "금융 가이드",
    "연봉 가이드",
    "연말정산 가이드",
    "재테크 가이드",
    "직장인 재무 가이드",
  ],
});

// hreflang 상호성 보정 (2026-09-06 전수검사).
// /en/guides 는 ko-KR → /guides 를 선언하는데 /guides 쪽에는 en 선언이 없어
// 단방향이었다. 구글은 상호 참조가 없는 hreflang 주석을 무시하므로 영문 허브가
// 영어권 SERP 에서 한국어 허브와 묶이지 못했다. (/guides/[slug] 는 이미
// 영문판 존재 여부에 따라 en 을 선언한다 — 허브만 누락)
metadata.alternates = {
  ...metadata.alternates,
  languages: {
    "ko-KR": "https://www.moneysalary.com/guides",
    en: "https://www.moneysalary.com/en/guides",
    "x-default": "https://www.moneysalary.com/guides",
  },
};

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* 308개 가이드 글 + 메인 = 광고 부재 시 수익 누수 큼. layout 자동 광고. */}
      <PageFooterAds maxWidth="3xl" />
      {/* 글별 보강 섹션(S3-4, 2026-09-12) — 반드시 PageFooterAds 아래(광고 위 UI 금지). layout 에는 params 가 없어
          서버가 supplements 맵을 넘기고 클라가 pathname 으로 슬러그를 고른다(CompanyRelatedJobs 패턴). 항목 없는 글은 null. */}
      <GuideSupplement map={guideSupplements} maxWidth="3xl" />
      {/* 공유 fallback은 광고 아래 — 광고 밀림 방지 (2026-08-16 수익 대응) */}
      <AutoShareSection contentType="guide" maxWidth="3xl" className="pb-16" />
    </>
  );
}
