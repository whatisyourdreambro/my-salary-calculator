// src/app/table/2026/SeasonalLinks.tsx
//
// 실수령액 표 4종(연봉·월급·주급·시급) 공용 7월 시즌 크로스링크 블록 (서버 컴포넌트).
// 배경: 표 페이지는 사이트 트래픽 최상위인데 시즌 피크 페이지로 가는 링크가
// 0건이었음(2026-07 감사). 기존 유입을 시즌 페이지로 라우팅 + 신규 페이지 색인 가속.
// 주의: 광고 슬롯(layout GuideMidAd·페이지 내 CalcResultAd·PageFooterAds)과 겹치지 않는
// 본문 콘텐츠 영역에만 배치할 것. 광고 위치는 절대 이동 금지.

import Link from "@/components/AppLink";
import { ArrowRight, Flame } from "lucide-react";

const SEASONAL_LINKS = [
  {
    href: "/calc/samsung-bonus",
    title: "삼성전자 성과급 계산기",
    description: "OPI·TAI 세후 실수령액 시뮬레이션",
  },
  {
    href: "/calc/sk-hynix-bonus",
    title: "SK하이닉스 성과급 계산기",
    description: "7월 하순 상반기 PI 발표 예정 — 미리 계산",
  },
  {
    href: "/property-holding-tax-2026",
    title: "7월 재산세 납부 (7/16~31)",
    description: "1기분 납부 기간 — 내 재산세·보유세 확인",
  },
  {
    href: "/minimum-wage-2027",
    title: "2027 최저임금 10,700원 확정",
    description: "내년 시급·월급 얼마나 오르나 미리보기",
  },
  {
    href: "/national-pension-estimate-2026",
    title: "7월 국민연금 상한 조정",
    description: "기준소득월액 상한 변경 — 내 보험료 변화 확인",
  },
];

interface SeasonalLinksProps {
  /** 페이지별 여백 보정용 (예: page-width 밖에서 쓸 때 px-4 sm:px-6) */
  className?: string;
}

export default function SeasonalLinks({ className = "" }: SeasonalLinksProps) {
  return (
    <section className={`max-w-4xl mx-auto mt-12 mb-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4 px-1">
        <Flame className="w-5 h-5 text-electric" aria-hidden="true" />
        <h2 className="text-lg font-black text-navy">
          7월에 꼭 확인할 것들 — 시즌 체크리스트
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SEASONAL_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-canvas-200 hover:border-electric transition-colors"
          >
            <span className="min-w-0">
              <span className="block text-sm font-bold text-navy leading-snug">
                {item.title}
              </span>
              <span className="block text-xs text-faint-blue mt-1 leading-snug">
                {item.description}
              </span>
            </span>
            <ArrowRight className="w-4 h-4 text-electric shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </div>
    </section>
  );
}
