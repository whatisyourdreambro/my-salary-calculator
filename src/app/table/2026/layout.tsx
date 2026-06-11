import { GuideMidAd } from "@/components/AdPlacement";
import PageFooterAds from "@/components/PageFooterAds";
import TableTabsNav from "./TableTabsNav";

export default function Table2026Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 연봉|월급|주급|시급 상호 링크 탭 + 표 위 광고 — 4개 표 페이지 공통.
          GuideMidAd 는 하단 PageFooterAds(InArticleAd·HomeTopAd)와 슬롯이 달라 dedup 충돌 없음. */}
      <div className="bg-white pt-24 sm:pt-28">
        <TableTabsNav />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <GuideMidAd />
        </div>
      </div>
      {children}
      <PageFooterAds maxWidth="5xl" />
    </>
  );
}
