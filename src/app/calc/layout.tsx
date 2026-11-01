import { HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import AutoShareSection from "@/components/AutoShareSection";
import FloatingShareBar from "@/components/FloatingShareBar";
import CalcNewsNote from "@/components/CalcNewsNote";
import TopicNextSteps from "@/components/TopicNextSteps";
import EditorialTrustNoteFromPath from "@/components/EditorialTrustNoteFromPath";

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
      {/* 공유 fallback은 광고 블록 아래 — 광고 밀림 방지 (2026-08-16 수익 대응) */}
      <AutoShareSection contentType="calc_result" maxWidth="4xl" className="pb-10" />
      <FloatingShareBar />
      {/* 계산기별 보도 요약(2026-10-09 삼성 DS 특별성과급 세부안) — 반드시 맨 끝(모든 광고 아래 + 기존 형제의 자동광고 CSS 경로 불변).
          맵에 없는 경로는 null (CalcNewsNote.tsx) */}
      <CalcNewsNote />
      {/* '이어서 확인할 내용' 상자 — 보도 요약 뒤 맨 끝(B12, 운영자 승인 2026-11-01). 2026-10-19 에 /calc/2026-year·
          bonus-home-plan·samsung-bonus page.tsx 의 <main> 끝에 들어가 위 광고 블록을 밀던 것을 옮겼다.
          path 없이 usePathname 으로 고르고, src/lib/topicNextSteps.ts 맵에 없는 계산기 경로는 null (TopicNextSteps.tsx) */}
      <TopicNextSteps />
      {/* 만든 사람과 확인 방법(G4, 운영자 승인 2026-11-01 구글 개선 5번) — 위 상자들 뒤 맨 끝(모든 광고 아래 + 기존 형제의
          자동광고 CSS 경로 불변). 삼성전자·SK하이닉스 성과급 계산기에서만 그리고 다른 계산기는 null (src/lib/editorialTrust.ts) */}
      <EditorialTrustNoteFromPath className="mx-auto my-10 max-w-4xl px-4 sm:px-6 lg:px-8" />
    </>
  );
}
