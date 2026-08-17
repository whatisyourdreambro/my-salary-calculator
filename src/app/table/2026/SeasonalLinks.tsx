// src/app/table/2026/SeasonalLinks.tsx
//
// 실수령액 표 4종(연봉·월급·주급·시급) 공용 시즌 크로스링크 블록 (서버 컴포넌트).
// 배경: 표 페이지는 사이트 트래픽 최상위인데 시즌 피크 페이지로 가는 링크가
// 0건이었음(2026-07 감사). 기존 유입을 시즌 페이지로 라우팅 + 신규 페이지 색인 가속.
// ★시즌마다 목록·제목을 교체할 것 (2026-08-17 감사에서 7월 세트 만료 방치 적발 —
//   재산세 1기 종료, 하이닉스 PI "발표 예정" 등 만료 문구가 최상위 트래픽에 노출됨).
// 주의: 광고 슬롯(layout GuideMidAd·페이지 내 CalcResultAd·PageFooterAds)과 겹치지 않는
// 본문 콘텐츠 영역에만 배치할 것. 광고 위치는 절대 이동 금지.

import Link from "@/components/AppLink";
import { ArrowRight, Flame } from "lucide-react";

// 9월 추석 시즌 세트 (2026-08-17 교체). 다음 교체 시점: 10월 초(연말정산 예열).
const SEASONAL_LINKS = [
  {
    href: "/chuseok-bonus-2026",
    title: "추석 상여금·명절휴가비 총정리",
    description: "우리 회사는 얼마 줄까? 평균 지급액·세금 한눈에",
  },
  {
    href: "/calc/holiday-bonus",
    title: "명절 상여금 세후 계산기",
    description: "상여금에서 세금 떼면 실수령 얼마인지 바로 확인",
  },
  {
    href: "/property-holding-tax-2026",
    title: "9월 재산세 2기분 납부 (9/16~30)",
    description: "주택분 나머지 50% + 토지분 — 내 재산세 확인",
  },
  {
    href: "/civil-servant-pay-2027",
    title: "2027 공무원 봉급 인상 전망",
    description: "인상률 권고안 반영 — 내년 호봉표 미리보기",
  },
  {
    href: "/minimum-wage-2027",
    title: "2027 최저임금 10,700원 확정",
    description: "내년 시급·월급 얼마나 오르나 미리보기",
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
          추석 전에 꼭 확인할 것들 — 9월 시즌 체크리스트
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
