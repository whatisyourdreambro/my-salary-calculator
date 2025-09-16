"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { calculateNetSalary, AdvancedSettings } from "@/lib/calculator";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import Link from "next/link";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

type CalculationResult = ReturnType<typeof calculateNetSalary>;

export default function SalaryCalculator() {
  const resultCardRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [payBasis, setPayBasis] = useState<"annual" | "monthly">("annual");
  const [severanceType, setSeveranceType] = useState<"separate" | "included">(
    "separate"
  );
  const [salaryInput, setSalaryInput] = useState("");
  const [nonTaxableAmount, setNonTaxableAmount] = useState("200,000");
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);
  const [overtimePay, setOvertimePay] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    isSmeYouth: false,
    disabledDependents: 0,
    seniorDependents: 0,
  });
  const [taxSavingTip, setTaxSavingTip] = useState("");
  const prevResultRef = useRef<CalculationResult | null>(null);

  const [result, setResult] = useState<CalculationResult>({
    monthlyNet: 0,
    totalDeduction: 0,
    pension: 0,
    health: 0,
    longTermCare: 0,
    employment: 0,
    incomeTax: 0,
    localTax: 0,
  });

  const runCalculation = useCallback(() => {
    const salary = parseNumber(salaryInput);
    const nonTaxable = parseNumber(nonTaxableAmount) * 12;
    let annualSalary = payBasis === "annual" ? salary : salary * 12;
    if (severanceType === "included" && annualSalary > 0) {
      annualSalary = (annualSalary / 13) * 12;
    }
    const annualOvertime = parseNumber(overtimePay);

    // prevResultRef.current를 업데이트하기 위해 현재 result 상태를 가져옵니다.
    setResult((prevResult) => {
      prevResultRef.current = prevResult;
      return calculateNetSalary(
        annualSalary,
        nonTaxable,
        dependents,
        children,
        annualOvertime,
        advancedSettings
      );
    });
  }, [
    // [핵심 수정] 무한 루프를 유발하던 'result'를 의존성 배열에서 제거했습니다.
    payBasis,
    severanceType,
    salaryInput,
    nonTaxableAmount,
    dependents,
    children,
    overtimePay,
    advancedSettings,
  ]);

  // 최초 마운트 및 URL 데이터 파싱 로직
  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        const decodedState = JSON.parse(atob(data));
        setPayBasis(decodedState.payBasis || "annual");
        setSeveranceType(decodedState.severanceType || "separate");
        setSalaryInput(decodedState.salaryInput || "");
        setNonTaxableAmount(decodedState.nonTaxableAmount || "200,000");
        setDependents(decodedState.dependents || 1);
        setChildren(decodedState.children || 0);
        setOvertimePay(decodedState.overtimePay || "");
      } catch (error) {
        console.error("Failed to parse shared data:", error);
      }
    }
  }, [searchParams]);

  // 입력값이 변경될 때마다 계산을 실행합니다.
  useEffect(() => {
    runCalculation();
  }, [runCalculation]);

  useEffect(() => {
    if (payBasis === "monthly") {
      setSeveranceType("separate");
    }
  }, [payBasis]);

  const handleDependentChange = (
    field: "dependents" | "children",
    delta: number
  ) => {
    const currentVal = field === "dependents" ? dependents : children;
    const newVal = Math.max(field === "dependents" ? 1 : 0, currentVal + delta);

    const salary = parseNumber(salaryInput);
    let annualSalary = payBasis === "annual" ? salary : salary * 12;
    if (severanceType === "included") annualSalary = (annualSalary / 13) * 12;
    const annualOvertime = parseNumber(overtimePay);
    const nonTaxable = parseNumber(nonTaxableAmount) * 12;

    const currentResult = calculateNetSalary(
      annualSalary,
      nonTaxable,
      dependents,
      children,
      annualOvertime,
      advancedSettings
    );
    const newResult = calculateNetSalary(
      annualSalary,
      nonTaxable,
      field === "dependents" ? newVal : dependents,
      field === "children" ? newVal : children,
      annualOvertime,
      advancedSettings
    );

    const taxDiff = Math.round(
      (currentResult.incomeTax - newResult.incomeTax) * 12
    );

    if (delta > 0 && taxDiff > 0) {
      const tip = `${
        field === "children" ? "자녀" : "부양가족"
      } 추가로 연간 약 ${formatNumber(taxDiff)}원 절세 효과가 있어요!`;
      setTaxSavingTip(tip);
      setTimeout(() => setTaxSavingTip(""), 4000);
    }

    if (field === "dependents") setDependents(newVal);
    else setChildren(newVal);
  };

  const handleReset = () => {
    setPayBasis("annual");
    setSeveranceType("separate");
    setSalaryInput("");
    setNonTaxableAmount("200,000");
    setDependents(1);
    setChildren(0);
    setOvertimePay("");
    setAdvancedSettings({
      isSmeYouth: false,
      disabledDependents: 0,
      seniorDependents: 0,
    });
    setShowAdvanced(false);
  };

  const handleShareLink = () => {
    const stateToShare = {
      payBasis,
      severanceType,
      salaryInput,
      nonTaxableAmount,
      dependents,
      children,
      overtimePay,
      advancedSettings,
    };
    const encodedState = btoa(JSON.stringify(stateToShare));
    const shareUrl = `${window.location.origin}/?tab=salary&data=${encodedState}`;

    if (window.gtag) {
      window.gtag("event", "share", {
        method: "clipboard",
        content_type: "salary_calculator_result",
        content_id: salaryInput,
      });
    }

    navigator.clipboard.writeText(shareUrl).then(
      () => alert("결과가 포함된 링크가 클립보드에 복사되었습니다."),
      () => alert("링크 복사에 실패했습니다.")
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <div className="space-y-8">
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            필수 입력
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                급여 기준
              </label>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setPayBasis("annual")}
                  className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                    payBasis === "annual"
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  연봉
                </button>
                <button
                  onClick={() => setPayBasis("monthly")}
                  className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                    payBasis === "monthly"
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  월급
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                퇴직금
              </label>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setSeveranceType("separate")}
                  disabled={payBasis === "monthly"}
                  className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                    severanceType === "separate"
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  } ${
                    payBasis === "monthly"
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  별도
                </button>
                <button
                  onClick={() => setSeveranceType("included")}
                  disabled={payBasis === "monthly"}
                  className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${
                    severanceType === "included"
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  } ${
                    payBasis === "monthly"
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  포함
                </button>
              </div>
            </div>
          </div>
          <CurrencyInput
            label={payBasis === "annual" ? "연봉" : "월급"}
            value={salaryInput}
            onValueChange={setSalaryInput}
            quickAmounts={[10000000, 1000000, 100000]}
          />
        </div>
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            선택 입력
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                부양 가족 수 (본인포함)
              </label>
              <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => handleDependentChange("dependents", -1)}
                  className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  -
                </button>
                <span className="font-bold text-lg text-light-text dark:text-dark-text">
                  {dependents} 명
                </span>
                <button
                  onClick={() => handleDependentChange("dependents", 1)}
                  className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                20세 이하 자녀 수
              </label>
              <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => handleDependentChange("children", -1)}
                  className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  -
                </button>
                <span className="font-bold text-lg text-light-text dark:text-dark-text">
                  {children} 명
                </span>
                <button
                  onClick={() => handleDependentChange("children", 1)}
                  className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              비과세액 (월 기준)
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                value={nonTaxableAmount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setNonTaxableAmount(v ? formatNumber(Number(v)) : "");
                }}
                className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text"
              />
              <span className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400">
                원
              </span>
            </div>
          </div>
        </div>

        {taxSavingTip && (
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-signature-blue text-sm rounded-lg text-center transition-opacity duration-300 animate-pulse">
            {taxSavingTip}
          </div>
        )}

        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex justify-between items-center text-left font-bold text-lg text-light-text dark:text-dark-text"
          >
            <span>상세 설정</span>
            <span
              className={`transform transition-transform duration-200 ${
                showAdvanced ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </button>
          {showAdvanced && (
            <div className="space-y-4 pt-4 mt-4 border-t dark:border-gray-700">
              <label className="flex items-center gap-3 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={advancedSettings.isSmeYouth}
                  onChange={(e) =>
                    setAdvancedSettings({
                      ...advancedSettings,
                      isSmeYouth: e.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-signature-blue focus:ring-signature-blue"
                />
                <span>
                  중소기업 취업자 소득세 감면 적용 (연 200만원 한도, 90% 감면)
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    장애인 (1인당 200만 추가공제)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={advancedSettings.disabledDependents}
                    onChange={(e) =>
                      setAdvancedSettings({
                        ...advancedSettings,
                        disabledDependents: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    70세 이상 (1인당 100만 추가공제)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={advancedSettings.seniorDependents}
                    onChange={(e) =>
                      setAdvancedSettings({
                        ...advancedSettings,
                        seniorDependents: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        ref={resultCardRef}
        className="bg-signature-blue dark:bg-dark-card text-white dark:text-dark-text p-6 rounded-xl flex flex-col h-full shadow-lg relative overflow-hidden"
      >
        <div className="flex-grow">
          <p className="font-semibold text-blue-200 dark:text-dark-text-secondary text-sm">
            월 예상 실수령액
          </p>
          <p className="text-4xl sm:text-5xl font-bold my-2 text-white dark:text-dark-text">
            <CountUp
              start={prevResultRef.current?.monthlyNet || 0}
              end={result.monthlyNet}
              duration={0.5}
              separator=","
            />{" "}
            원
          </p>
          <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700 space-y-3 text-sm">
            {[
              {
                label: "국민연금",
                value: result.pension,
                prevValue: prevResultRef.current?.pension,
              },
              {
                label: "건강보험",
                value: result.health,
                prevValue: prevResultRef.current?.health,
              },
              {
                label: "장기요양",
                value: result.longTermCare,
                prevValue: prevResultRef.current?.longTermCare,
              },
              {
                label: "고용보험",
                value: result.employment,
                prevValue: prevResultRef.current?.employment,
              },
              {
                label: "소득세",
                value: result.incomeTax,
                prevValue: prevResultRef.current?.incomeTax,
              },
              {
                label: "지방소득세",
                value: result.localTax,
                prevValue: prevResultRef.current?.localTax,
              },
            ].map(({ label, value, prevValue }) => (
              <div key={label} className="flex justify-between">
                <span className="text-blue-200 dark:text-dark-text-secondary">
                  {label}
                </span>
                <span className="text-white dark:text-dark-text font-bold">
                  <CountUp
                    start={prevValue || 0}
                    end={value}
                    duration={0.5}
                    separator=","
                  />{" "}
                  원
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700 flex justify-between font-bold text-white dark:text-dark-text">
            <span>총 공제액 합계</span>
            <span>
              <CountUp
                start={prevResultRef.current?.totalDeduction || 0}
                end={result.totalDeduction}
                duration={0.5}
                separator=","
              />{" "}
              원
            </span>
          </div>
        </div>

        {result.monthlyNet > 0 && (
          <div className="mt-6">
            <Link
              href="/guides/2025-salary-guide"
              className="block w-full py-3 text-center bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold text-white transition"
            >
              내 연봉, 더 자세히 분석하기 🧐
            </Link>
          </div>
        )}

        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleShareLink}
            className="py-3 bg-white/20 hover:bg-white/30 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold text-white dark:text-gray-300 transition"
          >
            링크 공유
          </button>
          <button
            onClick={handleReset}
            className="py-3 bg-white/20 hover:bg-white/30 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold text-white dark:text-gray-300 transition"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}
