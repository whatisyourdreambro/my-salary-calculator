import { HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export default function CalcLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* 하단은 HOME_TOP 슬롯 사용 — CALC_RESULT 슬롯은 각 페이지의 "결과 직하" 배치 전용으로 비워둠
          (dedup: layout 이 CalcResultAd 를 쓰면 슬롯을 선점해 페이지 쪽 결과 직하 광고가 죽음) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 my-10 space-y-6">
        <InArticleAd />
        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />
        <HomeTopAd />
      </div>
    </>
  );
}
