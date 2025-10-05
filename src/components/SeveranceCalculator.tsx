// src/components/SeveranceCalculator.tsx

"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { calculateSeverancePay } from "@/lib/severanceCalculator";
import CurrencyInput from "./CurrencyInput";
import type { StoredFinancialData, StoredSeveranceData } from "@/app/types";
import { Save, RotateCcw } from "lucide-react";
import CountUp from "react-countup";

const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

const toInputDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Accordion = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <h3 className="text-md font-semibold">{title}</h3>
        <span
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="p-4 space-y-4 bg-white dark:bg-dark-card">
          {children}
        </div>
      )}
    </div>
  );
};

export default function SeveranceCalculator() {
  const router = useRouter();

  const today = useMemo(() => new Date(), []);
  const oneYearAgo = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date;
  }, []);

  const [startDate, setStartDate] = useState<string>(
    toInputDateString(oneYearAgo)
  );
  const [endDate, setEndDate] = useState<string>(toInputDateString(today));

  const [salaries, setSalaries] = useState(["", "", ""]);
  const [annualBonus, setAnnualBonus] = useState("");
  const [annualLeavePay, setAnnualLeavePay] = useState("");

  const result = useMemo(() => {
    const numericSalaries = salaries.map((s) => parseNumber(s));
    return calculateSeverancePay(
      startDate,
      endDate,
      numericSalaries,
      parseNumber(annualBonus),
      parseNumber(annualLeavePay)
    );
  }, [startDate, endDate, salaries, annualBonus, annualLeavePay]);

  const handleSalaryChange = (index: number, value: string) => {
    const newSalaries = [...salaries];
    newSalaries[index] = value;
    setSalaries(newSalaries);
  };

  const handleReset = useCallback(() => {
    setStartDate(toInputDateString(oneYearAgo));
    setEndDate(toInputDateString(today));
    setSalaries(["", "", ""]);
    setAnnualBonus("");
    setAnnualLeavePay("");
  }, [oneYearAgo, today]);

  const handleSaveData = () => {
    if (result.estimatedSeverancePay <= 0) {
      alert("퇴직금이 계산되지 않았습니다. 정보를 먼저 입력해주세요.");
      return;
    }
    try {
      const existingDataJSON = localStorage.getItem(
        "moneysalary-financial-data"
      );
      const existingData: StoredFinancialData = existingDataJSON
        ? JSON.parse(existingDataJSON)
        : { lastUpdated: new Date().toISOString() };
      const severanceDataToStore: StoredSeveranceData = {
        estimatedSeverancePay: result.estimatedSeverancePay,
      };
      const updatedData: StoredFinancialData = {
        ...existingData,
        severance: severanceDataToStore,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        "moneysalary-financial-data",
        JSON.stringify(updatedData)
      );
      alert("예상 퇴직금 정보가 대시보드에 저장되었습니다!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
      alert("데이터 저장에 실패했습니다.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border">
          <h2 className="text-xl font-bold mb-4">근무 정보</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="text-sm font-medium">
                입사일
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg dark:bg-dark-card dark:border-gray-700"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="text-sm font-medium">
                퇴사일 (마지막 근무일)
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg dark:bg-dark-card dark:border-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border">
          <h2 className="text-xl font-bold mb-4">
            급여 정보 (퇴사일 이전 3개월)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[2, 1, 0].map((i) => (
              <CurrencyInput
                key={i}
                label={`퇴사 ${i + 1}개월 전 급여`}
                value={salaries[2 - i]}
                onValueChange={(v) => handleSalaryChange(2 - i, v)}
                quickAmounts={[1000000, 100000]}
              />
            ))}
          </div>
        </div>

        <Accordion title="상여금, 연차수당 등 추가 입력 (선택)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CurrencyInput
              label="연간 상여금 총액"
              value={annualBonus}
              onValueChange={setAnnualBonus}
              quickAmounts={[1000000, 500000]}
            />
            <CurrencyInput
              label="미사용 연차수당"
              value={annualLeavePay}
              onValueChange={setAnnualLeavePay}
              quickAmounts={[500000, 100000]}
            />
          </div>
        </Accordion>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="sticky top-24 bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border">
          <h2 className="text-2xl font-bold text-center mb-4">
            💰 예상 퇴직금 결과
          </h2>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg text-center mb-4">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              총 재직일수
            </p>
            <p className="text-xl font-bold">
              <CountUp end={result.totalDaysOfEmployment} separator="," />일 (
              {result.yearsOfService.years}년 {result.yearsOfService.months}
              개월)
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-md font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                세전 퇴직금
              </span>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text">
                <CountUp end={result.estimatedSeverancePay} separator="," /> 원
              </p>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-md font-semibold text-danger">
                퇴직 소득세
              </span>
              <p className="text-2xl font-bold text-danger">
                -{" "}
                <CountUp
                  end={result.incomeTax + result.localTax}
                  separator=","
                />{" "}
                원
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-dashed">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">세후 실수령액</span>
              <p className="text-4xl font-bold text-primary">
                <CountUp end={result.netSeverancePay} separator="," /> 원
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              onClick={handleReset}
              className="w-full py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> 초기화
            </button>
            <button
              onClick={handleSaveData}
              className="w-full py-3 bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <Save size={16} /> 대시보드 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
