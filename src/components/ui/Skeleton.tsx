// 무료 Skeleton 컴포넌트 — Tailwind shimmer keyframe만 사용 (dependency 0)

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  ariaLabel?: string;
}

export function Skeleton({
  className = "",
  width,
  height,
  rounded = "lg",
  ariaLabel = "콘텐츠 로딩 중",
}: SkeletonProps) {
  const roundedClass = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
      className={`skeleton-shimmer ${roundedClass} ${className}`}
      style={{
        width: width ?? "100%",
        height: height ?? "1rem",
      }}
    />
  );
}

// 조합 패턴: 페이지 로드 fallback에 즉시 사용
export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-4">
      <Skeleton height="2rem" width="60%" />
      <Skeleton height="1rem" />
      <Skeleton height="1rem" width="80%" />
      <div className="flex gap-2 pt-2">
        <Skeleton height="2.5rem" width="6rem" rounded="xl" />
        <Skeleton height="2.5rem" width="6rem" rounded="xl" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="space-y-2">
      <Skeleton height="0.875rem" width="40%" />
      <Skeleton height="2rem" width="70%" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
      <Skeleton height="1.25rem" width="40%" />
      <Skeleton className="mt-4" height="240px" rounded="2xl" />
    </div>
  );
}

export default Skeleton;
