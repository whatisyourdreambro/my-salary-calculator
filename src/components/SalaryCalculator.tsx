"use client";

import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { calculateNetSalary } from "@/lib/calculator";
import CurrencyInput from "./CurrencyInput";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

export default function SalaryCalculator() {
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [payBasis, setPayBasis] = useState<"annual" | "monthly">("annual");
  const [severanceType, setSeveranceType] = useState<"separate" | "included">(
    "separate"
  );
  const [salaryInput, setSalaryInput] = useState("");
  const [nonTaxableAmount, setNonTaxableAmount] = useState("200,000");
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);
  const [result, setResult] = useState({
    monthlyNet: 0,
    totalDeduction: 0,
    pension: 0,
    health: 0,
    longTermCare: 0,
    employment: 0,
    incomeTax: 0,
    localTax: 0,
  });

  useEffect(() => {
    const salary = parseNumber(salaryInput);
    const nonTaxable = parseNumber(nonTaxableAmount) * 12;
    let annualSalary = payBasis === "annual" ? salary : salary * 12;
    if (severanceType === "included" && annualSalary > 0) {
      annualSalary = (annualSalary / 13) * 12;
    }
    const newResult = calculateNetSalary(
      annualSalary,
      nonTaxable,
      dependents,
      children
    );
    setResult(newResult);
  }, [
    payBasis,
    severanceType,
    salaryInput,
    nonTaxableAmount,
    dependents,
    children,
  ]);

  const handleReset = () => {
    setPayBasis("annual");
    setSeveranceType("separate");
    setSalaryInput("");
    setNonTaxableAmount("200,000");
    setDependents(1);
    setChildren(0);
  };

  const handleCapture = () => {
    if (resultCardRef.current) {
      html2canvas(resultCardRef.current, {
        backgroundColor: null,
        useCORS: true,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.download = "salary_result.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <div className="space-y-8">
        {/* ... 입력 섹션 코드는 이전 답변과 동일 ... */}
      </div>

      <div
        ref={resultCardRef}
        className="bg-gradient-to-br from-signature-blue to-blue-800 dark:bg-dark-card text-white dark:text-dark-text p-6 rounded-xl flex flex-col h-full shadow-lg"
      >
        <div className="flex-grow">
          <p className="font-semibold text-blue-200 dark:text-dark-text-secondary text-sm">
            월 예상 실수령액
          </p>
          <p className="text-4xl sm:text-5xl font-bold my-2 text-white dark:text-dark-text">
            {formatNumber(result.monthlyNet)} 원
          </p>
          <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700 space-y-3 text-sm">
            {Object.entries({
              국민연금: result.pension,
              건강보험: result.health,
              장기요양: result.longTermCare,
              고용보험: result.employment,
              소득세: result.incomeTax,
              지방소득세: result.localTax,
            }).map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-blue-200 dark:text-dark-text-secondary">
                  {label}
                </span>
                <span className="text-white dark:text-dark-text font-medium">
                  {formatNumber(value)} 원
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700 flex justify-between font-bold text-white dark:text-dark-text">
            <span>총 공제액 합계</span>
            <span>{formatNumber(result.totalDeduction)} 원</span>
          </div>
        </div>
        {/* [수정] 캡쳐하기 버튼을 다시 추가합니다. */}
        <div className="mt-6 flex space-x-2">
          <button
            onClick={handleCapture}
            className="flex-1 py-3 bg-white/20 hover:bg-white/30 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold text-white dark:text-gray-300 transition"
          >
            캡쳐하기
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-3 bg-white/20 hover:bg-white/30 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold text-white dark:text-gray-300 transition"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}
