// salary-db/[id] 로딩 스켈레톤 — 헤비 동적 라우트 체감 속도 개선
// 다크 대응은 Skeleton/SkeletonCard가 자체 보유 (skeleton-shimmer + dark: 클래스)
import { Skeleton, SkeletonCard, SkeletonStat } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="w-full min-h-screen pb-20">
      {/* Hero 자리 */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <Skeleton width="6rem" height="6rem" rounded="2xl" ariaLabel="회사 정보 로딩 중" />
          <div className="w-full max-w-md space-y-3">
            <Skeleton height="2.25rem" width="60%" />
            <Skeleton height="1rem" width="40%" />
          </div>
        </div>
      </div>

      {/* 핵심 통계 자리 */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
      </div>

      {/* 본문 카드 자리 */}
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </main>
  );
}
