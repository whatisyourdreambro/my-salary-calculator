// src/components/SalaryResultCard.tsx

"use client";

import React from "react";
import CountUp from "react-countup";
import { Info, ChevronRight, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";
import AdUnit from "./AdUnit";

interface DeductionItemProps {
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
}

const DeductionItem = ({ label, value, iconBg, iconColor }: DeductionItemProps) => (
  <div className="flex items-center justify-between py-4 group cursor-pointer active:scale-[0.98] transition-transform">
    <div className="flex items-center gap-4">
      <div className={cn("w-10 h-10 rounded-[14px] flex items-center justify-center transition-colors", iconBg)}>
        <ReceiptText size={20} className={iconColor} />
      </div>
      <span className="font-semibold text-slate-700 text-[15px]">{label}</span>
    </div>
    <div className="flex items-center gap-1">
      <div className="font-bold text-slate-900 font-mono-tabular text-[15px]">
        <CountUp end={value} separator="," duration={1} />
        <span className="text-sm font-medium ml-0.5 text-slate-500">원</span>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors ml-1" />
    </div>
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
}

export default function SalaryResultCard({
  monthlyNet,
  totalDeduction,
  breakdown,
}: SalaryResultCardProps) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* 메인 결과 카드 - Toss Style White Card */}
      <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-slate-500">예상 월 실수령액</span>
        </div>

        <div className="flex items-baseline gap-1 mb-8">
          <h2 className="text-[2.75rem] leading-none font-extrabold text-slate-900 font-mono-tabular tracking-tight">
            <CountUp end={monthlyNet} separator="," duration={1.5} />
          </h2>
          <span className="text-2xl font-bold text-slate-900">원</span>
        </div>

        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[20px]">
          <span className="text-[15px] font-semibold text-slate-600">총 공제액</span>
          <span className="font-bold text-[15px] text-blue-600 font-mono-tabular">
            -<CountUp end={totalDeduction} separator="," duration={1} />원
          </span>
        </div>
      </div>

      {/* 내부 Native In-feed 광고 */}
      <div className="w-full bg-slate-50 border border-slate-200/60 rounded-[24px] p-4 flex justify-center mb-4">
        <AdUnit
          slotId="4093821736"
          format="fluid"
          layoutKey="-fb+5w+4e-db+86"
          label="Native Salary Result Ad"
        />
      </div>

      {/* 상세 공제 내역 리스트 */}
      <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-sm font-bold text-slate-800">공제 상세 내역</h3>
          <Info size={18} className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
        </div>

        <div className="divide-y divide-slate-100">
          <DeductionItem label="국민연금" value={breakdown.pension} iconBg="bg-blue-50" iconColor="text-blue-500" />
          <DeductionItem label="건강보험" value={breakdown.health} iconBg="bg-primary/5" iconColor="text-primary" />
          <DeductionItem label="고용보험" value={breakdown.employment} iconBg="bg-primary/10" iconColor="text-indigo-500" />
          <DeductionItem label="소득세" value={breakdown.incomeTax + breakdown.localTax} iconBg="bg-slate-50" iconColor="text-primary" />
        </div>
      </div>

      {/* 안내 문구 */}
      <div className="px-6 py-4 flex gap-3">
        <span className="text-lg leading-none">💡</span>
        <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
          비과세 식대 20만원 및 본인 1인 공제가 적용된 결과입니다.
          부양가족이나 중소기업 감면 혜택에 따라 실제 금액은 다를 수 있습니다.
        </p>
      </div>
    </div>
  );
}