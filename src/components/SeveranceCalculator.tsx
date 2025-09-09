"use client";

import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { calculateSeverancePay } from "@/lib/severanceCalculator";
import CurrencyInput from "./CurrencyInput";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ko } from "date-fns/locale";
import { format } from "date-fns";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

export default function SeveranceCalculator() {
  const resultCardRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [startDate, setStartDate] = useState<Date | undefined>(oneYearAgo);
  const [endDate, setEndDate] = useState<Date | undefined>(today);
  const [monthlySalary, setMonthlySalary] = useState("");
  const [annualBonus, setAnnualBonus] = useState("");
  const [annualLeavePay, setAnnualLeavePay] = useState("");
  const [result, setResult] = useState({
    averageDailyWage: 0,
    estimatedSeverancePay: 0,
  });

  useEffect(() => {
    const newResult = calculateSeverancePay(
      startDate ? format(startDate, "yyyy-MM-dd") : "",
      endDate ? format(endDate, "yyyy-MM-dd") : "",
      parseNumber(monthlySalary),
      parseNumber(annualBonus),
      parseNumber(annualLeavePay)
    );
    setResult(newResult);
  }, [startDate, endDate, monthlySalary, annualBonus, annualLeavePay]);

  const handleReset = () => {
    setStartDate(oneYearAgo);
    setEndDate(today);
    setMonthlySalary("");
    setAnnualBonus("");
    setAnnualLeavePay("");
  };

  const handleCapture = async () => {
    const element = resultCardRef.current;
    if (!element) return;

    const watermark = document.createElement("div");
    watermark.innerText = "https://www.moneysalary.com";
    watermark.style.position = "absolute";
    watermark.style.bottom = "10px";
    watermark.style.right = "10px";
    watermark.style.color = "rgba(255, 255, 255, 0.5)";
    watermark.style.fontSize = "12px";
    watermark.style.fontFamily = "sans-serif";
    element.appendChild(watermark);

    const canvas = await html2canvas(element, {
      backgroundColor: null,
      useCORS: true,
    });
    element.removeChild(watermark);

    const link = document.createElement("a");
    link.download = "severance_pay_result.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleShareLink = () => {
    const stateToShare = {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      monthlySalary,
      annualBonus,
      annualLeavePay,
    };
    const encodedState = btoa(JSON.stringify(stateToShare));
    const shareUrl = `${window.location.origin}/?tab=severance&data=${encodedState}`;
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        alert("결과가 포함된 링크가 클립보드에 복사되었습니다.");
      },
      () => {
        alert("링크 복사에 실패했습니다.");
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <div className="space-y-8">
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            필수 입력
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* ... 달력 UI 부분은 react-day-picker를 활용한 고급 UI로 교체 ... */}
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                입사일
              </label>
              <DayPicker
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                locale={ko}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                퇴사일 (마지막 근무일)
              </label>
              <DayPicker
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                locale={ko}
              />
            </div>
          </div>
          <CurrencyInput
            label="월급 (세전, 3개월 평균)"
            value={monthlySalary}
            onValueChange={setMonthlySalary}
            quickAmounts={[1000000, 100000, 10000]}
          />
        </div>
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            선택 입력 (1년치 총액)
          </h2>
          {/* ... 선택 입력 UI 부분은 이전과 동일 ... */}
        </div>
      </div>

      <div
        ref={resultCardRef}
        className="bg-signature-blue dark:bg-dark-card text-white dark:text-dark-text p-6 rounded-xl flex flex-col h-full shadow-lg relative overflow-hidden"
      >
        <div className="flex-grow">
          <p className="font-semibold text-blue-200 dark:text-dark-text-secondary text-sm">
            예상 퇴직금
          </p>
          <p className="text-4xl sm:text-5xl font-bold my-2 text-white dark:text-dark-text">
            {formatNumber(result.estimatedSeverancePay)} 원
          </p>
          <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700 flex justify-between text-sm">
            <span className="text-blue-200 dark:text-dark-text-secondary">
              1일 평균 임금
            </span>
            <span className="text-white dark:text-dark-text font-medium">
              {formatNumber(result.averageDailyWage)} 원
            </span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button onClick={handleCapture} className="...">
            캡쳐하기
          </button>
          <button onClick={handleShareLink} className="...">
            링크 공유
          </button>
          <button onClick={handleReset} className="...">
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}
