// src/components/SiblingHubsNav.tsx
//
// 트래픽 엔진 허브(/salary-db, /job, /industry, /region) 간 형제 진입로.
// 현재 경로(currentPath)는 자동으로 제외해 자기 자신을 가리키는 dead link를 피한다.
//
// 사이트 유입의 대부분이 "{회사}/{직업}/{지역} 연봉" 검색이라, 한 허브에 들어온
// 사용자를 다른 차원으로 분기시켜 PageRank 양방향 흐름 + 체류시간을 늘린다.

import Link from "next/link";
import { Building2, Briefcase, MapPin, Factory, GitCompare } from "lucide-react";

const HUBS: Array<{
  href: string;
  label: string;
  sub: string;
  icon: React.ElementType;
}> = [
  { href: "/salary-db", label: "회사별 연봉", sub: "200+ 기업 신입 초봉·직급별 평균", icon: Building2 },
  { href: "/job", label: "직업별 연봉", sub: "100+ 직종 평균·실수령액", icon: Briefcase },
  { href: "/industry", label: "산업별 연봉", sub: "15개 업종 순위·동종사 비교", icon: Factory },
  { href: "/region", label: "지역별 연봉", sub: "17개 시도 + 판교·여의도 분포", icon: MapPin },
  { href: "/company/compare", label: "회사 비교", sub: "두 회사 정밀 1:1 비교", icon: GitCompare },
];

interface Props {
  /** 현재 페이지 경로 — 자기 자신을 카드 목록에서 제외 (예: "/job") */
  currentPath: string;
  /** 섹션 제목 */
  title?: string;
  /** 섹션 설명 */
  subtitle?: string;
}

export default function SiblingHubsNav({
  currentPath,
  title = "다른 차원으로 보기",
  subtitle = "회사 · 직업 · 산업 · 지역 — 트래픽 엔진 4종을 한 곳에서",
}: Props) {
  const siblings = HUBS.filter((h) => h.href !== currentPath);

  return (
    <nav aria-label="연봉 데이터 형제 허브" className="mt-2 mb-6">
      <div className="text-center mb-4">
        <h2 className="text-base sm:text-lg font-black text-navy dark:text-canvas-50 mb-1">
          {title}
        </h2>
        <p className="text-xs text-faint-blue dark:text-canvas-400">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {siblings.map((h) => {
          const Icon = h.icon;
          return (
            <Link
              key={h.href}
              href={h.href}
              className="group flex items-center gap-3 p-3.5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 rounded-2xl hover:border-electric hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-electric-10 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-electric" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-navy dark:text-canvas-100 text-[13px] group-hover:text-electric transition-colors leading-tight">
                  {h.label}
                </p>
                <p className="text-[10.5px] text-faint-blue dark:text-canvas-400 truncate mt-0.5">
                  {h.sub}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
