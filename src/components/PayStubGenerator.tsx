"use client";

import { useState, useRef, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import { calculateNetSalary } from "@/lib/calculator";
import type { CalculationResult } from "@/lib/calculator";
import html2canvas from "html2canvas";
import { Download, HelpCircle, Info, Stamp } from "lucide-react";
import { motion } from "framer-motion";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

export default function PayStubGenerator() {
  const [salaryInput, setSalaryInput] = useState("50,000,000");
  const [nonTaxableInput, setNonTaxableInput] = useState("200,000");
  const [dependents, setDependents] = useState(1);
  const payStubRef = useRef<HTMLDivElement>(null);

  const result: CalculationResult = useMemo(() => {
    const annualSalary = parseNumber(salaryInput);
    const nonTaxable = parseNumber(nonTaxableInput) * 12; // Monthly input to annual

    if (annualSalary <= 0) {
      return {
        monthlyNet: 0,
        totalDeduction: 0,
        pension: 0,
        health: 0,
        longTermCare: 0,
        employment: 0,
        incomeTax: 0,
        localTax: 0,
      };
    }
    return calculateNetSalary(annualSalary, nonTaxable, dependents, 0, {
      isSmeYouth: false,
      disabledDependents: 0,
      seniorDependents: 0,
    });
  }, [salaryInput, nonTaxableInput, dependents]);

  const annualSalary = useMemo(() => parseNumber(salaryInput), [salaryInput]);
  const monthlyGross = useMemo(() => Math.round(annualSalary / 12), [annualSalary]);
  const monthlyNonTaxable = useMemo(() => parseNumber(nonTaxableInput), [nonTaxableInput]);
  const monthlyTaxable = monthlyGross - monthlyNonTaxable;

  const handleDownload = () => {
    const element = payStubRef.current;
    if (!element) return;

    html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `급여명세서_${salaryInput}원_Moneysalary.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  const DeductionItem = ({ label, amount, tooltip }: { label: string; amount: number; tooltip: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-300 last:border-0 group relative">
      <div className="flex items-center gap-1">
        <span className="text-gray-600">{label}</span>
        <div className="relative">
          <HelpCircle className="w-3 h-3 text-gray-400 cursor-help opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
            {tooltip}
          </div>
        </div>
      </div>
      <span className="font-medium">{formatNumber(amount)}</span>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              급여 정보 입력
            </h2>
            <div className="space-y-6">
              <CurrencyInput
                label="세전 연봉"
                value={salaryInput}
                onValueChange={setSalaryInput}
                quickAmounts={[10000000, 5000000, 1000000]}
              />
              <CurrencyInput
                label="월 비과세액 (식대 등)"
                value={nonTaxableInput}
                onValueChange={setNonTaxableInput}
                quickAmounts={[100000, 200000]}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">부양가족 수 (본인 포함)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="11"
                    value={dependents}
                    onChange={(e) => setDependents(Number(e.target.value))}
                    className="flex-1 accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="font-bold w-8 text-center">{dependents}명</span>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                명세서 이미지 저장
              </button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            💡 <strong>Tip:</strong> 비과세액이 높을수록 세금이 줄어들어 실수령액이 늘어납니다. 식대(월 20만원), 자가운전보조금(월 20만원) 등이 대표적입니다.
          </div>
        </div>

        {/* Pay Stub Preview Section */}
        <div className="lg:col-span-8 flex justify-center bg-gray-100 dark:bg-gray-900/50 p-4 sm:p-8 rounded-3xl border border-border overflow-x-auto">
          <div
            ref={payStubRef}
            className="w-[600px] min-w-[600px] bg-white text-gray-900 p-8 shadow-2xl relative overflow-hidden"
            style={{ fontFamily: "'Noto Serif KR', serif" }} // 명조체 느낌
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-9xl font-black rotate-[-30deg]">MONEYSALARY</span>
            </div>

            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-4 mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black tracking-widest text-gray-900">급여명세서</h1>
                <p className="text-xs text-gray-500 mt-1">PAYMENT SPECIFICATION</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">2026년 11월분</p>
                <p className="text-sm text-gray-600">지급일: 2025.11.25</p>
              </div>
            </div>

            {/* User Info Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm border border-gray-200 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-500">사원번호</span>
                <span className="font-bold">2025001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">성명</span>
                <span className="font-bold">김머니</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">부서</span>
                <span className="font-bold">재무기획팀</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">직위</span>
                <span className="font-bold">책임</span>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              {/* Income Section */}
              <div>
                <h3 className="font-bold border-b-2 border-gray-800 pb-2 mb-3 flex justify-between items-center">
                  지급 내역 <span className="text-xs font-normal text-gray-500">(Income)</span>
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between py-2 border-b border-dashed border-gray-300">
                    <span className="text-gray-600">기본급</span>
                    <span className="font-medium">{formatNumber(monthlyTaxable)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed border-gray-300">
                    <span className="text-gray-600">비과세 수당</span>
                    <span className="font-medium">{formatNumber(monthlyNonTaxable)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed border-gray-300">
                    <span className="text-gray-600">직책수당</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed border-gray-300">
                    <span className="text-gray-600">식대</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>
                <div className="mt-4 pt-2 border-t border-gray-800 flex justify-between font-bold text-blue-600">
                  <span>지급 총액</span>
                  <span>{formatNumber(monthlyGross)}</span>
                </div>
              </div>

              {/* Deduction Section */}
              <div>
                <h3 className="font-bold border-b-2 border-gray-800 pb-2 mb-3 flex justify-between items-center">
                  공제 내역 <span className="text-xs font-normal text-gray-500">(Deduction)</span>
                </h3>
                <div className="space-y-1 text-sm">
                  <DeductionItem label="국민연금" amount={result.pension} tooltip="월 소득의 4.5% (상한액 적용)" />
                  <DeductionItem label="건강보험" amount={result.health} tooltip="월 소득의 3.545%" />
                  <DeductionItem label="장기요양" amount={result.longTermCare} tooltip="건강보험료의 12.95%" />
                  <DeductionItem label="고용보험" amount={result.employment} tooltip="월 소득의 0.9%" />
                  <DeductionItem label="소득세" amount={result.incomeTax} tooltip="간이세액표 기준" />
                  <DeductionItem label="지방소득세" amount={result.localTax} tooltip="소득세의 10%" />
                </div>
                <div className="mt-4 pt-2 border-t border-gray-800 flex justify-between font-bold text-red-600">
                  <span>공제 총액</span>
                  <span>{formatNumber(result.totalDeduction)}</span>
                </div>
              </div>
            </div>

            {/* Net Pay Section */}
            <div className="bg-gray-900 text-white p-6 rounded-xl flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 z-0" />
              <div className="relative z-10">
                <p className="text-gray-400 text-sm mb-1">실 수령액 (Net Pay)</p>
                <p className="text-xs text-gray-500">귀하의 노고에 감사드립니다.</p>
              </div>
              <div className="relative z-10 text-right">
                <span className="text-3xl font-black tracking-tight text-yellow-400">
                  {formatNumber(result.monthlyNet)}
                </span>
                <span className="text-lg font-medium ml-1 text-gray-300">원</span>
              </div>
            </div>

            {/* Footer & Stamp */}
            <div className="mt-8 flex justify-between items-end relative">
              <div className="text-xs text-gray-400">
                <p>Moneysalary.com Official Document</p>
                <p>본 명세서는 참고용이며 법적 효력이 없습니다.</p>
              </div>
              <div className="flex flex-col items-center relative">
                <span className="font-serif font-bold text-lg text-gray-800 mb-2 z-10">(주) 머니샐러리 대표</span>
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-red-600 rounded-full flex items-center justify-center opacity-80 rotate-[-15deg] mask-image:url('/grunge.png')">
                    <span className="text-red-600 font-serif font-black text-sm">머니<br />샐러리<br />인</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}