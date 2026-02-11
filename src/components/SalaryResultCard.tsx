// src/components/SalaryResultCard.tsx

"use client";

import React from "react";
import CountUp from "react-countup";
import { Info, ChevronRight, PieChart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeductionItemProps {
  label: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
}

const DeductionItem = ({ label, value, color, icon }: DeductionItemProps) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
    <div className="flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", color)}>
        {icon || label[0]}
      </div>
      <span className="font-bold text-slate-600">{label}</span>
    </div>
    <div className="text-right">
      <div className="font-black text-slate-800 font-mono-tabular">
        <CountUp end={value} separator="," duration={1} />
        <span className="text-xs ml-0.5 text-slate-400">원</span>
      </div>
      <ChevronRight size={14} className="ml-auto text-slate-200 group-hover:text-slate-400 transition-colors" />
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
    <div className="space-y-6 w-full max-w-lg mx-auto p-4 sm:p-0">
      {/* Massive Result Card - Glassmorphism */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0F4C81] to-[#0c406e] rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#FFD700]/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Estimated Monthly Net</span>
            <Sparkles size={16} className="text-[#FFD700] animate-pulse" />
          </div>
          
          <div className="flex items-baseline gap-2">
            <h2 className="text-5xl sm:text-6xl font-black font-mono-tabular tracking-tighter">
              <CountUp end={monthlyNet} separator="," duration={1.5} />
            </h2>
            <span className="text-2xl font-bold opacity-60">원</span>
          </div>
          
          <div className="mt-8 flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <span className="text-xs font-bold text-blue-100">공제액 합계</span>
            </div>
            <span className="font-black text-sm">
              -<CountUp end={totalDeduction} separator="," duration={1} />원
            </span>
          </div>
        </div>
      </div>

      {/* Deduction List - Card Style */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Deduction Details</h3>
          <Info size={14} className="text-slate-300" />
        </div>
        
        <DeductionItem label="국민연금" value={breakdown.pension} color="bg-blue-500" icon={<PieChart size={18}/>} />
        <DeductionItem label="건강보험" value={breakdown.health} color="bg-emerald-500" icon={<PieChart size={18}/>} />
        <DeductionItem label="고용보험" value={breakdown.employment} color="bg-indigo-500" icon={<PieChart size={18}/>} />
        <DeductionItem label="소득세" value={breakdown.incomeTax + breakdown.localTax} color="bg-orange-500" icon={<PieChart size={18}/>} />
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 flex gap-3 border border-slate-100 italic">
          <div className="text-xl">💡</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            비과세 식대 20만원 및 본인 1인 공제가 적용된 결과입니다. 
            부양가족이나 중소기업 감면 혜택에 따라 금액이 달라질 수 있습니다.
          </p>
      </div>
    </div>
  );
}
