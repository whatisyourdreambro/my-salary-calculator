// src/components/SalaryResultCard.tsx

"use client";

import React from "react";
import Link from "@/components/AppLink";
import { ChevronRight, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";
import { InArticleAd } from "./AdPlacement";
interface DeductionItemProps {
 label: string;
 value: number;
 iconBg: string;
 iconColor: string;
}

const DeductionItem = ({ label, value, iconBg, iconColor }: DeductionItemProps) => (
 <div className="flex flex-wrap items-center justify-between gap-3 py-4">
 <dt className="flex items-center gap-3">
 <div className={cn("w-10 h-10 rounded-[14px] flex items-center justify-center transition-colors", iconBg)}>
 <ReceiptText size={20} className={iconColor} aria-hidden="true" />
 </div>
 <span className="font-medium text-muted-foreground text-[15px]">{label}</span>
 </dt>
 <dd className="ml-auto">
 <div className="font-semibold text-foreground font-mono-tabular text-[15px]">
 <span>{value.toLocaleString("ko-KR")}</span>
 <span className="text-sm font-medium ml-0.5 text-muted-foreground">원</span>
 </div>
 </dd>
 </div>
);

interface SalaryResultCardProps {
 monthlyNet: number;
 totalDeduction: number;
 breakdown: {
 pension: number;
 health: number;
 longTermCare: number;
 employment: number;
 incomeTax: number;
 localTax: number;
 };
 // 홈 연봉 계산기 전용. 입력을 고친 뒤 아직 다시 계산하지 않은 이전 결과면 true.
 // 안내는 아래 제목 한 줄의 글자와 색만 바꾼다. 카드 위에 안내문을 따로 넣으면 입력을 고칠 때마다
 // 카드 안 InArticleAd 와 아래 ResultAd 가 그 높이만큼 오르내린다(IVT-03, 2026-11-01 승인 B07).
 // 이 값을 넘기지 않는 서버 렌더 화면(/salary/[amount], /monthly/[amount])은 role 없이 종전 HTML 그대로다.
 stale?: boolean;
}

export default function SalaryResultCard({
 monthlyNet,
 totalDeduction,
 breakdown,
 stale,
}: SalaryResultCardProps) {
 return (
 <div className="w-full max-w-lg mx-auto space-y-4">
 <div className="ms-panel">
 <div className="flex justify-between items-center mb-2">
 {/* 이전 결과 문구는 320px 폭에서도 한 줄(14px 굵게 약 166px)이라 광고 위 줄 수가 그대로다. 두 줄이 되는 문구로 바꾸지 말 것. */}
 <span
 role={stale === undefined ? undefined : "status"}
 className={cn("text-sm font-semibold", stale ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground")}
 >
 {stale ? "이전 결과 · 다시 계산해 주세요" : "예상 월 실수령액"}
 </span>
 </div>

 <div className="flex flex-wrap items-baseline gap-1 mb-6">
 <h2 data-salary-result-summary tabIndex={-1} aria-label={`예상 월 실수령액 ${monthlyNet.toLocaleString("ko-KR")}원`}
 className="scroll-mt-24 text-[clamp(1.75rem,6vw,2.75rem)] leading-tight font-bold text-foreground font-mono-tabular tracking-tight break-all">
 <span>{monthlyNet.toLocaleString("ko-KR")}</span>
 </h2>
 <span className="text-xl font-semibold text-foreground">원</span>
 </div>

 <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-secondary rounded-xl">
 <span className="text-[15px] font-medium text-muted-foreground">월 공제 합계</span>
 <span className="font-semibold text-[15px] text-foreground font-mono-tabular">
 -<span>{totalDeduction.toLocaleString("ko-KR")}</span>원
 </span>
 </div>
 </div>

 {/* 결과 직하 광고 — viewability 가장 높은 위치 */}
 <InArticleAd />

 {/* 상세 공제 내역 리스트 */}
 <div className="ms-panel">
 <div className="flex items-center justify-between px-2 mb-2">
 <h3 className="text-base font-semibold text-foreground">월 공제 상세</h3>
 </div>

 <dl className="divide-y divide-border">
 <DeductionItem label="국민연금" value={breakdown.pension} iconBg="bg-secondary" iconColor="text-link" />
 <DeductionItem label="건강보험" value={breakdown.health} iconBg="bg-secondary" iconColor="text-link" />
 {/* 장기요양보험 행 — 누락 시 항목 합 ≠ 총 공제액 (2026-08-30 감사 수정) */}
 <DeductionItem label="장기요양보험" value={breakdown.longTermCare} iconBg="bg-secondary" iconColor="text-link" />
 <DeductionItem label="고용보험" value={breakdown.employment} iconBg="bg-secondary" iconColor="text-link" />
 <DeductionItem label="소득세·지방소득세" value={breakdown.incomeTax + breakdown.localTax} iconBg="bg-secondary" iconColor="text-link" />
 </dl>

 {/* 국민연금 공제액 → 예상수령액 페이지 동선 (2026-07-16 — 7월 상한 재산정 시즌 갭 해소) */}
 <Link
 href="/national-pension-estimate-2026"
 className="ms-button ms-button-ghost mt-3 w-full justify-between text-sm"
 >
 <span>이 국민연금, 나중에 얼마나 돌려받을까? 예상수령액 확인</span>
 <ChevronRight size={15} className="flex-shrink-0" />
 </Link>
 </div>

 {/* 안내 문구 */}
 <div className="rounded-xl border border-border bg-secondary/50 p-4">
 <p className="text-sm text-muted-foreground leading-6">
 입력한 조건을 기준으로 산출한 예상 금액입니다. 비과세 항목·부양가족·감면 적용 여부와 실제 급여 정산 방식에 따라 지급액은 달라질 수 있습니다.
 </p>
 </div>
 </div>
 );
}
