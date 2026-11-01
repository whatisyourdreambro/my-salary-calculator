import { GuideMidAd } from "@/components/AdPlacement";
import PageFooterAds from "@/components/PageFooterAds";
import AutoShareSection from "@/components/AutoShareSection";
import SalaryTableNextStepsFromPath from "@/components/SalaryTableNextStepsFromPath";
import EditorialTrustNoteFromPath from "@/components/EditorialTrustNoteFromPath";
import TableTabsNav from "./TableTabsNav";

export default function Table2026Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 연봉|월급|주급|시급 상호 링크 탭 + 표 위 광고 — 4개 표 페이지 공통.
          GuideMidAd 는 하단 PageFooterAds(InArticleAd·HomeTopAd)와 슬롯이 달라 dedup 충돌 없음. */}
      <div className="bg-background pt-24 sm:pt-28">
        <TableTabsNav />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <GuideMidAd />
        </div>
      </div>
      {children}
      <PageFooterAds maxWidth="5xl" />
      {/* 공유 fallback은 광고 아래 — 광고 밀림 방지 (2026-08-16 수익 대응) */}
      <AutoShareSection contentType="page" maxWidth="5xl" className="pb-16" />
      {/* 급여 단위·적용 연도 비교 상자 — 반드시 맨 끝(모든 광고·공유 아래 + 기존 형제의 자동광고 CSS 경로 불변).
          각 표 page.tsx 의 <main> 끝에 있던 것을 옮김(B12, 운영자 승인 2026-11-01). 4개 표 밖의 경로는 null. */}
      <SalaryTableNextStepsFromPath />
      {/* 만든 사람과 확인 방법(G4, 운영자 승인 2026-11-01 구글 개선 5번) — 비교 상자 뒤 맨 끝(모든 광고·공유 아래 + 기존 형제의
          자동광고 CSS 경로 불변). 4개 표 밖의 경로는 null (src/lib/editorialTrust.ts) */}
      <EditorialTrustNoteFromPath className="mx-auto my-10 max-w-5xl px-4 sm:px-6 lg:px-8" />
    </>
  );
}
