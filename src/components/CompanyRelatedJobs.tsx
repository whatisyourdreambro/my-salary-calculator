"use client";

// 회사 페이지 하단 "업계 주요 직업 연봉" 링크 블록 (google-clusters-2).
// - 회사 650곳·상장 lite 219곳 → /job/[slug] 로 가는 컨텍스트 내부링크가 0건이던 결핍 해소.
// - 배치: salary-db/layout.tsx 에서 PageFooterAds(푸터 광고 묶음) 뒤 — 광고 위 UI 삽입 금지(2026-08-16) 준수.
//   페이지(page.tsx)에는 절대 넣지 말 것 — PageFooterAds 위에 놓이게 된다.
// - layout 에는 params 가 없어 usePathname 으로 현재 회사를 판별한다.
// - 데이터는 서버(layout)가 계산한 경량 맵(companyJobsMap, ~15KB)만 props 로 받는다.
//   dartLite/dartDisclosed/CompanyRepository 는 이 파일에서 import 금지(클라 번들 오염).
//   companyJobsMap 은 순수 모듈(industriesData·jobsData 만 참조)이라 resolveHub 런타임 import 가능.
// - SSR 에도 포함(usePathname 은 서버 렌더에서도 동작) → 크롤러가 링크를 본다.

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Briefcase, ArrowRight } from "lucide-react";
import Link from "@/components/AppLink";
import { resolveHub, type CompanyJobsMap } from "@/lib/companyJobsMap";

const MAX_WIDTH_CLASS = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "7xl": "max-w-7xl",
} as const;

interface CompanyRelatedJobsProps {
  map: CompanyJobsMap;
  /** 소속 layout 컨테이너 폭과 맞출 것 (salary-db 는 5xl) */
  maxWidth?: keyof typeof MAX_WIDTH_CLASS;
  className?: string;
}

/** 만원 단위 → "1억 2,000만원" / "4,500만원" */
function formatManwon(manwon: number): string {
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  if (eok > 0 && rest > 0) return `${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
  if (eok > 0) return `${eok}억원`;
  return `${rest.toLocaleString("ko-KR")}만원`;
}

export default function CompanyRelatedJobs({
  map,
  maxWidth = "5xl",
  className = "",
}: CompanyRelatedJobsProps) {
  const pathname = usePathname();
  const hub = useMemo(() => resolveHub(pathname, map), [pathname, map]);

  if (!hub || hub.jobs.length === 0) return null;

  return (
    <section
      data-msy-module="job-related"
      className={`${MAX_WIDTH_CLASS[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 mt-10 ${className}`}
    >
      <h2 className="flex items-center gap-2 text-base font-black text-navy dark:text-canvas-50 mb-3">
        <Briefcase size={18} className="text-electric flex-shrink-0" />
        {hub.name} 업계 주요 직업 연봉
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {hub.jobs.map((job) => (
          <Link
            key={job.slug}
            href={`/job/${job.slug}`}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 hover:border-electric transition-colors text-sm group"
          >
            <span className="flex-1 font-medium text-navy dark:text-canvas-100">
              {job.name} 연봉
            </span>
            <span className="text-xs text-muted-blue dark:text-canvas-300">
              평균 {formatManwon(job.avg)}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-electric flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-blue dark:text-canvas-400">
        <Link href={`/industry/${hub.id}`} className="underline underline-offset-2 hover:text-electric">
          {hub.name} 업계 연봉 전체 보기
        </Link>
      </p>
    </section>
  );
}
