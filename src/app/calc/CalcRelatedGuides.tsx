"use client";

// /calc/* 마지막 광고(layout 의 HomeTopAd) 아래 가이드 링크 모듈 (2026-09-06).
//
// 배경: 삼성 계산기는 사이트 단일 최대 자산인데(GA4 조회 1위 · 최근 순증 구글
// 클릭의 58.8%) 가이드 링크가 한 방향으로만 흐르고 있었다 — 삼성 가이드 12편이
// 계산기로 11개 본문 링크를 보내는 동안 계산기가 돌려주는 가이드 링크는 1개뿐이고,
// crossLink 의 CALC_TO_GUIDES 가 공식 파트너로 선언한 4편은 직접 링크가 0이었다.
// 가이드 페이지는 AdSense 유닛이 계산기보다 많아 PV/세션(현재 1.16) 관점에서도
// 좋은 목적지다.
//
// 위치 규칙: 반드시 layout 의 <HomeTopAd /> **아래**. /calc 라우트에서 마지막
// 광고 아래는 이 자리뿐이고(페이지 하단 RelatedCalculators 도 layout 광고보다
// 위다), 광고 위 UI 삽입은 금지다(2026-08-16 수익 급락 규칙).
//
// 배선: layout 은 서버 컴포넌트이고 params 가 없다 — salary-db layout 의
// CompanyRelatedJobs(100배 계획 B10)와 같은 패턴으로 서버가 경량 맵만 계산해
// 넘기고 여기서 pathname 으로 고른다. RelatedGuides 는 자체 onClick 으로
// guide_cta_click 을 보내므로 data-msy-module 을 주지 않는다(2중 집계 방지).

import { usePathname } from "next/navigation";
import RelatedGuides from "@/components/RelatedGuides";
import type { RelatedGuideItem } from "@/lib/relatedGuides";

interface Props {
  /** 정적 /calc 라우트 slug → 가이드 카드(서버 계산, content 제거된 경량 메타) */
  map: Record<string, RelatedGuideItem[]>;
}

export default function CalcRelatedGuides({ map }: Props) {
  const pathname = usePathname() ?? "";
  const m = /^\/calc\/([^/]+)\/?$/.exec(pathname);
  const items = m ? map[m[1]] : undefined;
  if (!items || items.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <RelatedGuides items={items} title="이 계산기와 함께 보면 좋은 가이드" />
    </div>
  );
}
