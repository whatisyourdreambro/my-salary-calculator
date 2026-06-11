// src/components/YearEndTaxCluster.tsx
//
// 연말정산 관련 4페이지 cross-link cluster.
// 같은 도메인(연말정산·종소세)의 다른 의도 페이지를 명확히 안내해
// 검색엔진과 사용자 모두에게 카니발이 아닌 의도 차이임을 신호.
//
//   /year-end-tax                       : 계산기 도구 (시즌 무관)
//   /year-end-tax-settlement-2026       : 근로자 12월 시즌 가이드
//   /year-end-tax-checklist             : 12월 마감 전 체크리스트
//   /year-end-tax-2026                  : 프리랜서 5월 종소세 가이드
//   /income-tax-2026                    : 종소세 계산기 (누진세율 산출)

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = [
 { path: "/year-end-tax", label: "계산기", hint: "도구·즉시 계산" },
 { path: "/year-end-tax-settlement-2026", label: "근로자 12월", hint: "성과급·절세 전략" },
 { path: "/year-end-tax-checklist", label: "12월 체크리스트", hint: "마감 전 40+ 항목" },
 { path: "/year-end-tax-2026", label: "프리랜서 5월", hint: "종소세 신고" },
 { path: "/income-tax-2026", label: "종소세 계산기", hint: "누진세율 즉시 산출" },
];

export default function YearEndTaxCluster({ className = "" }: { className?: string }) {
 const pathname = usePathname();
 return (
 <nav
 className={`mt-4 mb-2 inline-flex flex-wrap items-center gap-x-1 gap-y-1 px-4 py-2 bg-canvas-100 dark:bg-canvas-800 rounded-xl border border-canvas-200 dark:border-canvas-700 text-xs ${className}`}
 aria-label="연말정산 시즌 페이지 모음"
 >
 <span className="text-canvas-600 dark:text-canvas-400 mr-1">📍 연말정산 시리즈:</span>
 {PAGES.map((page, i) => {
 const isCurrent = pathname === page.path;
 return (
 <span key={page.path} className="inline-flex items-center">
 {i > 0 && <span className="mx-1 text-canvas-400">·</span>}
 {isCurrent ? (
 <span className="font-bold text-navy dark:text-canvas-50" aria-current="page">
 {page.label}
 </span>
 ) : (
 <Link
 href={page.path}
 className="text-electric font-bold hover:underline"
 title={page.hint}
 >
 {page.label}
 </Link>
 )}
 </span>
 );
 })}
 </nav>
 );
}
