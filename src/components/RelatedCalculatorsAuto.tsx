// src/components/RelatedCalculatorsAuto.tsx
//
// 2026-11-15 N2-perf-02 (lens-perf-F10): 경로를 prop 으로 받을 수 없는 레이아웃(src/app/tools/layout.tsx) 전용.
// usePathname 으로 현재 경로를 읽어 서버 컴포넌트 RelatedCalculators 에 넘긴다 — 예전 RelatedCalculators 의
// currentPath 생략 동작(pathname || "/")과 같다. 다른 호출부는 currentPath 를 직접 넘기고 이 래퍼를 쓰지 않는다
// (쓰면 그 페이지에 추천 목록 JS 가 다시 실린다). tools/layout 은 이 래퍼를 RelatedCalculators 라는 이름으로 가져와
// 광고 사이 JSX 줄을 바이트 그대로 둔다(ad-audit --diff 의 광고 위 새 UI 검사 대상이 아님).

"use client";

import { usePathname } from "next/navigation";
import RelatedCalculators from "./RelatedCalculators";

export default function RelatedCalculatorsAuto() {
  const pathname = usePathname();
  return <RelatedCalculators currentPath={pathname || "/"} />;
}
