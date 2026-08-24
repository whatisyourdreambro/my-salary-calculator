// company/compare/[slug] 로딩 스켈레톤 — 헤비 동적 라우트 체감 속도 개선
// 다크 대응은 Skeleton/SkeletonCard가 자체 보유 (skeleton-shimmer + dark: 클래스)
import { Skeleton, SkeletonCard, SkeletonStat } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="w-full min-h-screen pb-20 pt-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 타이틀 자리 */}
        <div className="text-center space-y-3 mb-10">
          <Skeleton height="2.5rem" width="70%" className="mx-auto" ariaLabel="기업 비교 로딩 중" />
          <Skeleton height="1rem" width="45%" className="mx-auto" />
        </div>

        {/* 두 회사 비교 카드 자리 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* 비교 지표 자리 */}
        <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>
      </div>
    </main>
  );
}
