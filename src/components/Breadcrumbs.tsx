// src/components/Breadcrumbs.tsx
//
// 눈에 보이는 이동 경로(breadcrumb).
// structuredData.ts의 buildBreadcrumbTrail을 공유해 JSON-LD와 항상 일치.
// 순수 의존성만 사용 — 서버·클라이언트 컴포넌트 양쪽에서 사용 가능.

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buildBreadcrumbTrail, type Breadcrumb } from "@/lib/structuredData";

interface BreadcrumbsProps {
  /** 현재 페이지 경로 — 단계 자동 생성 (items와 둘 중 하나 사용) */
  path?: string;
  /** 명시적 단계 배열 — JSON-LD와 동일 배열을 공유할 때 사용 */
  items?: Breadcrumb[];
  /** 마지막 단계 한글 라벨 (path 모드) */
  leafName?: string;
  /** 중간 단계 라벨 강제 지정 (path 모드) */
  overrides?: Record<string, string>;
  /** 가운데 정렬 hero에서는 "center" */
  align?: "left" | "center";
  className?: string;
}

export default function Breadcrumbs({
  path,
  items,
  leafName,
  overrides,
  align = "left",
  className = "",
}: BreadcrumbsProps) {
  const trail =
    items ?? (path ? buildBreadcrumbTrail(path, { leafName, overrides }) : []);
  if (trail.length < 2) return null;

  return (
    <nav aria-label="이동 경로" className={className}>
      <ol
        className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:text-sm text-muted-blue ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li
              key={`${crumb.path}-${i}`}
              className="flex items-center gap-x-1.5 min-w-0"
            >
              {i > 0 && (
                <ChevronRight
                  className="w-3.5 h-3.5 text-faint-blue shrink-0"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  className="font-bold text-navy dark:text-canvas-100 truncate max-w-[60vw] sm:max-w-md"
                  aria-current="page"
                >
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.path}
                  className="hover:text-electric transition-colors whitespace-nowrap"
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
