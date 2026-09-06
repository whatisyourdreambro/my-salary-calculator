import { HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import CalcFunnelTracker from "@/components/CalcFunnelTracker";
import AutoShareSection from "@/components/AutoShareSection";
import FloatingShareBar from "@/components/FloatingShareBar";
import CalcRelatedGuides from "./CalcRelatedGuides";
import { getCalcRelatedGuideSlugs } from "@/lib/crossLink";
import { getRelatedGuides, type RelatedGuideItem } from "@/lib/relatedGuides";

// 정적 /calc 라우트 중 crossLink 의 CALC_TO_GUIDES 에 큐레이션 항목이 있는 slug.
// 동적 /calc/[slug](simpleCalculators)는 page 가 이미 RelatedGuides 를 렌더하므로
// 제외한다 — 넣으면 같은 페이지에 두 번 나온다.
// 큐레이션이 없는 나머지 정적 라우트(성과급 계열 대부분)는 일부러 비워 둔다:
// category/tags 없이 부르면 전 라우트가 같은 상위 스코어 가이드 3장을 받아
// 관련성 없는 중복 링크가 된다. 큐레이션 추가는 CALC_TO_GUIDES 쪽 작업.
// ★이 배열은 파일시스템·CALC_TO_GUIDES 와 어긋나면 안 된다 —
//   src/lib/__tests__/calcRelatedGuides.test.ts 가 양방향으로 검사한다.
const CURATED_STATIC_CALC_SLUGS = [
  "annual-leave-days",
  "child-deduction",
  "dependent-check",
  "dual-income-year-end",
  "holiday-bonus",
  "housing-subscription",
  "incentive-tax",
  "january-bonus",
  "jeonse-loan",
  "offer-compare",
  "ordinary-wage",
  "samsung-bonus",
  "severance-vs-pension",
  "sk-hynix-bonus",
  "smb-income-tax-break",
  "vacation-pay",
  "voluntary-retirement",
  "year-end-bonus",
  "year-end-bonus-tax",
] as const;

// 서버 모듈 스코프에서 1회 계산 — /calc 하위 전체가 공유한다.
// getRelatedGuides 는 가이드 본문(~888KB)을 import 하는 서버 헬퍼이고,
// 클라이언트로는 content 가 제거된 경량 메타(RelatedGuideItem)만 넘어간다.
const CALC_GUIDE_MAP: Record<string, RelatedGuideItem[]> = Object.fromEntries(
  CURATED_STATIC_CALC_SLUGS.map((slug) => [
    slug,
    getRelatedGuides({
      currentSlug: `__calc-${slug}`,
      explicitSlugs: getCalcRelatedGuideSlugs(slug),
      limit: 3,
    }),
  ])
);

export default function CalcLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* calc_start → calc_submit 퍼널 계측 (전체 /calc/* 공통, 문서 레벨 입력 감지) */}
      <CalcFunnelTracker />
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
      {/* 가이드 링크 모듈 — 반드시 위 HomeTopAd 아래(광고 위 UI 삽입 금지).
          큐레이션이 있는 정적 /calc 라우트에서만 렌더된다. */}
      <CalcRelatedGuides map={CALC_GUIDE_MAP} />
      {/* 공유 fallback은 광고 블록 아래 — 광고 밀림 방지 (2026-08-16 수익 대응) */}
      <AutoShareSection contentType="calc_result" maxWidth="4xl" className="pb-10" />
      <FloatingShareBar />
    </>
  );
}
