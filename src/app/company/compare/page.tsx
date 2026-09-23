// src/app/company/compare/page.tsx
// 서버 래퍼 — 순수 클라이언트 선택 UI(CompareSelectionClient)를 감싸 세그먼트 설정을 제공.
//
// 2026-09-23 CPU 한도(1102) 대응: edge SSR → 빌드 타임 정적 생성. 매 요청 루트 레이아웃
// (헤더 메가메뉴+푸터 ~375KB)을 React 로 다시 그려 Worker CPU 10ms 를 넘기고 3/8 이 503 이었다.
// 2026-08-08 "Unable to find lambda for route: /company/compare" 사건은 "use client" 페이지가
// 정적으로 분류되지 않아 Node 람다가 된 증상 — 지금은 서버 래퍼라 형제 /company/simulator
// 와 같이 프리렌더된다(simulator.html). 배포 전 next build 라우트 표에서 ○ 확인이 게이트.
export const dynamic = "force-static";

import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import CompareSelectionClient from "./CompareSelectionClient";
// 부활 팩 P2-B (운영자 승인 2026-08-31) — 2유닛 박약 해소: GuideMid 1개 추가
import { GuideMidAd } from "@/components/AdPlacement";

// 카니발 해소 정책(2026-06)에 따라 compare 트리는 noindex.
// (종전에는 company/layout의 canonical=/company(301 URL)를 상속받던 것을 정정, 2026-08-24)
export const metadata: Metadata = buildPageMetadata({
  title: "회사 연봉 비교 — 두 회사 선택",
  description:
    "비교할 두 회사를 선택하면 신입 초봉·평균 연봉·복지 혜택을 나란히 비교해 드립니다.",
  path: "/company/compare",
  noIndex: true,
});

export default function CompareSelectionPage() {
  return (
    <>
      <CompareSelectionClient />
      {/* 부활 팩 P2-B (운영자 승인 2026-08-31): 선택 UI와 layout 푸터 광고 사이 */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <GuideMidAd />
      </div>
    </>
  );
}
