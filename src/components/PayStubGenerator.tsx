"use client";

import { useState, useRef, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import { calculateNetSalary } from "@/lib/calculator";
import type { CalculationResult } from "@/lib/calculator";
import html2canvas from "html2canvas";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

export default function PayStubGenerator() {
  const [salaryInput, setSalaryInput] = useState("50,000,000");
  const payStubRef = useRef<HTMLDivElement>(null);

  const result: CalculationResult = useMemo(() => {
    const annualSalary = parseNumber(salaryInput);
    if (annualSalary <= 0) {
      // Return a zeroed-out structure if salary is invalid
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
    // 기본값: 비과세 20만원, 부양가족 1인, 자녀 0인
    return calculateNetSalary(annualSalary, 2400000, 1, 0, 0, {
      isSmeYouth: false,
      disabledDependents: 0,
      seniorDependents: 0,
    });
  }, [salaryInput]);

  const annualSalary = useMemo(() => parseNumber(salaryInput), [salaryInput]);
  const monthlyGross = useMemo(
    () => Math.round(annualSalary / 12),
    [annualSalary]
  );

  const handleDownload = () => {
    const element = payStubRef.current;
    if (!element) return;

    html2canvas(element, {
      backgroundColor: null,
      scale: 2, // 해상도 2배로 캡쳐
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `급여명세서_${salaryInput}원_Moneysalary.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border">
          <h2 className="text-2xl font-bold mb-4">급여명세서 생성</h2>
          <CurrencyInput
            label="세전 연봉 입력"
            value={salaryInput}
            onValueChange={setSalaryInput}
            quickAmounts={[10000000, 1000000]}
          />
          <button
            onClick={handleDownload}
            className="w-full mt-6 py-3 bg-signature-blue text-white font-bold rounded-lg hover:bg-blue-700 transition"
          >
            PNG 이미지로 다운로드
          </button>
        </div>

        {/* Pay Stub Section */}
        <div
          ref={payStubRef}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border relative"
        >
          <h3 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
            급 여 명 세 서
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <strong>성명:</strong> 홍길동
            </div>
            <div>
              <strong>지급일:</strong> 2025-10-25
            </div>
          </div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-black dark:border-white">
                <th className="p-2 text-left">지급내역</th>
                <th className="p-2 text-right">금액</th>
                <th className="p-2 text-left pl-4">공제내역</th>
                <th className="p-2 text-right">금액</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-600">
                <td className="p-2">기본급</td>
                <td className="p-2 text-right">{formatNumber(monthlyGross)}</td>
                <td className="p-2 pl-4">국민연금</td>
                <td className="p-2 text-right">
                  {formatNumber(result.pension)}
                </td>
              </tr>
              <tr className="border-b dark:border-gray-600">
                <td className="p-2"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 pl-4">건강보험</td>
                <td className="p-2 text-right">
                  {formatNumber(result.health)}
                </td>
              </tr>
              <tr className="border-b dark:border-gray-600">
                <td className="p-2"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 pl-4">장기요양</td>
                <td className="p-2 text-right">
                  {formatNumber(result.longTermCare)}
                </td>
              </tr>
              <tr className="border-b dark:border-gray-600">
                <td className="p-2"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 pl-4">고용보험</td>
                <td className="p-2 text-right">
                  {formatNumber(result.employment)}
                </td>
              </tr>
              <tr className="border-b-2 border-black dark:border-white">
                <td className="p-2"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 pl-4">소득세</td>
                <td className="p-2 text-right">
                  {formatNumber(result.incomeTax)}
                </td>
              </tr>
              <tr className="border-b-2 border-black dark:border-white">
                <td className="p-2 font-bold">지급총액</td>
                <td className="p-2 text-right font-bold">
                  {formatNumber(monthlyGross)}
                </td>
                <td className="p-2 pl-4">지방소득세</td>
                <td className="p-2 text-right">
                  {formatNumber(result.localTax)}
                </td>
              </tr>
              <tr>
                <td className="p-2"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 pl-4 font-bold">공제총액</td>
                <td className="p-2 text-right font-bold">
                  {formatNumber(result.totalDeduction)}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 p-4 border-t-4 border-double border-black dark:border-white text-right">
            <span className="font-bold text-lg">
              실 지급액: {formatNumber(result.monthlyNet)} 원
            </span>
          </div>
          <div className="absolute bottom-2 right-4 text-xs text-gray-400 dark:text-gray-500 font-bold">
            Moneysalary.com
          </div>
        </div>
      </div>
    </div>
  );
}
