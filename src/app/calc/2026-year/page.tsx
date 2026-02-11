// src/app/calc/2026-year/page.tsx

import { Metadata } from "next";
import SalaryCalculator from "@/components/SalaryCalculator";
import { Info, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "2026년 연봉계산기 - 최신 세법 및 실수령액 분석 | 머니샐러리",
  description: "2026년 변경되는 국민연금, 건강보험 요율이 적용된 최신 연봉계산기입니다. 실수령액뿐만 아니라 연봉 티어 카드와 미래 자산 시뮬레이션까지 무료로 확인하세요.",
  keywords: ["2026 연봉계산기", "2026 실수령액", "연봉 1억 실수령액", "머니샐러리", "2026년 세법"],
};

export default function Calc2026Page() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <div className="bg-[#0F4C81] py-12 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold mb-4">
            <Sparkles size={14} className="text-[#FFD700]" /> 2026년형 업그레이드 완료
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            2026년 연봉계산기 <span className="text-[#FFD700]">PRO</span>
          </h1>
          <p className="text-blue-100 text-lg">
            단순한 계산을 넘어, 당신의 미래 가치를 시뮬레이션합니다.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-10">
        <div className="bg-white rounded-3xl shadow-2xl p-2 sm:p-4 mb-12">
            <SalaryCalculator />
        </div>

        {/* 2026 Changes Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-[#0F4C81]">
                    <ShieldCheck size={24} />
                </div>
                <h3 className="font-bold text-gray-800">최신 보험 요율</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                    2026년 예상 건강보험(3.545%) 및 장기요양보험 요율 변화를 선제적으로 반영하여 가장 정확한 실수령액을 산출합니다.
                </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600">
                    <Sparkles size={24} />
                </div>
                <h3 className="font-bold text-gray-800">연봉 티어 시스템</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                    단순 금액 확인에서 끝내지 마세요. 내 연봉이 대한민국 상위 몇 %인지 티어 카드로 확인하고 소셜 미디어에 공유해보세요.
                </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                    <Info size={24} />
                </div>
                <h3 className="font-bold text-gray-800">자산 성장 경로</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                    복리 수익률을 적용한 미래 자산 시뮬레이션을 통해 100억 자산가(Mung)가 되는 시점을 예측해 드립니다.
                </p>
            </div>
        </div>
      </div>
    </main>
  );
}
