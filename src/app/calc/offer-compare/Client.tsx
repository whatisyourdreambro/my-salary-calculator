// /calc/offer-compare 클라이언트 셸 (2026-08-31 신설)
// ★비교 엔진은 src/components/SalaryComparator.tsx 정본을 그대로 임베드한다.
//   (2026-08-30 계산기 정본 수렴 원칙 — 신규 비교 로직·병렬 계산식 절대 금지.
//    실수령 계산은 SalaryComparator 내부의 calculateNetSalary 단일 엔진 사용)
// 홈 CalculatorTabs.tsx:14 패턴: react-countup·html2canvas가 딸린 무거운
// 클라이언트 컴포넌트라 dynamic import로 초기 번들에서 분리한다.

"use client";

import dynamic from "next/dynamic";
import { CalcResultAd } from "@/components/AdPlacement";

const SalaryComparator = dynamic(() => import("@/components/SalaryComparator"), {
  loading: () => (
    <div className="rounded-2xl border border-canvas-200 dark:border-canvas-800 bg-white dark:bg-canvas-900 p-10 text-center text-sm font-bold text-faint-blue">
      오퍼 비교 계산기를 불러오는 중…
    </div>
  ),
});

export default function OfferCompareClient() {
  return (
    <div className="space-y-5 mb-10">
      <SalaryComparator />
      {/* 결과 직하 광고 — 참조 페이지(/calc/ordinary-wage) 표준 배치 복제 (운영자 승인 2026-08-31) */}
      <CalcResultAd />
    </div>
  );
}
