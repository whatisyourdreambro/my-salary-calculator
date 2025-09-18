// src/components/YearEndTaxCalculator.tsx

"use client";

// [수정] 사용하지 않는 useMemo를 제거했습니다.
import { useState } from "react";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

// [수정] inputs 타입을 명확하게 정의했습니다.
interface TaxInputs {
  annualSalary: string;
  alreadyPaidTax: string;
  dependents: string;
  pension: string;
  creditCard: string;
  cash: string;
  medical: string;
  education: string;
}

// 연말정산 계산 로직 (간소화 버전)
const calculateYearEndTax = (inputs: TaxInputs) => {
  const annualSalary = parseNumber(inputs.annualSalary);
  if (annualSalary <= 0)
    return { finalTax: 0, determinedTax: 0, totalDeduction: 0, totalCredit: 0 };

  // 1. 근로소득공제
  let incomeDeduction = 0;
  if (annualSalary <= 5000000) incomeDeduction = annualSalary * 0.7;
  else if (annualSalary <= 15000000)
    incomeDeduction = 3500000 + (annualSalary - 5000000) * 0.4;
  else if (annualSalary <= 45000000)
    incomeDeduction = 7500000 + (annualSalary - 15000000) * 0.15;
  else if (annualSalary <= 100000000)
    incomeDeduction = 12000000 + (annualSalary - 45000000) * 0.05;
  else incomeDeduction = 14750000 + (annualSalary - 100000000) * 0.02;

  const incomeAmount = annualSalary - incomeDeduction;

  // 2. 소득공제
  const personalDeduction = (parseNumber(inputs.dependents) || 1) * 1500000;
  const pensionDeduction = Math.min(
    parseNumber(inputs.pension) || 0,
    annualSalary * 0.09
  );

  // 신용카드 등 사용액 공제 (복잡한 로직 간소화)
  const creditCardUsage = parseNumber(inputs.creditCard) || 0;
  const cashUsage = parseNumber(inputs.cash) || 0;
  const totalUsage = creditCardUsage + cashUsage;
  const minUsage = annualSalary * 0.25;
  const creditCardDeductible =
    totalUsage > minUsage ? (totalUsage - minUsage) * 0.15 : 0;

  const totalIncomeDeduction =
    personalDeduction + pensionDeduction + creditCardDeductible;

  // 3. 과세표준 & 산출세액
  const taxBase = Math.max(0, incomeAmount - totalIncomeDeduction);
  let calculatedTax = 0;
  if (taxBase <= 14000000) calculatedTax = taxBase * 0.06;
  else if (taxBase <= 50000000)
    calculatedTax = 840000 + (taxBase - 14000000) * 0.15;
  else if (taxBase <= 88000000)
    calculatedTax = 6240000 + (taxBase - 5000000) * 0.24;
  else calculatedTax = 15360000 + (taxBase - 88000000) * 0.35; // 이후 구간 생략

  // 4. 세액공제
  let taxCredit = 0;
  if (calculatedTax <= 1300000) taxCredit = calculatedTax * 0.55;
  else taxCredit = 715000 + (calculatedTax - 1300000) * 0.3;

  const medicalCredit =
    Math.max(0, (parseNumber(inputs.medical) || 0) - annualSalary * 0.03) *
    0.15;
  const educationCredit = (parseNumber(inputs.education) || 0) * 0.15;

  const totalTaxCredit = taxCredit + medicalCredit + educationCredit;

  const determinedTax = Math.max(0, calculatedTax - totalTaxCredit);
  const alreadyPaidTax = parseNumber(inputs.alreadyPaidTax);

  return {
    finalTax: Math.round(alreadyPaidTax - determinedTax),
    determinedTax: Math.round(determinedTax),
    totalDeduction: Math.round(totalIncomeDeduction + incomeDeduction),
    totalCredit: Math.round(totalTaxCredit),
  };
};

export default function YearEndTaxCalculator() {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<TaxInputs>({
    annualSalary: "60000000",
    alreadyPaidTax: "3000000",
    dependents: "1",
    pension: "5400000",
    creditCard: "15000000",
    cash: "5000000",
    medical: "2000000",
    education: "1000000",
  });
  const [result, setResult] = useState({
    finalTax: 0,
    determinedTax: 0,
    totalDeduction: 0,
    totalCredit: 0,
  });

  const handleInputChange = (field: keyof TaxInputs, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    const res = calculateYearEndTax(inputs);
    setResult(res);
    setStep(4);
  };

  const chartData = [
    { name: "총급여", value: parseNumber(inputs.annualSalary) },
    {
      name: "총공제",
      value: result.totalDeduction + result.totalCredit,
      fill: "#FF8042",
    },
    { name: "결정세액", value: result.determinedTax, fill: "#FFBB28" },
    {
      name: "기납부세액",
      value: parseNumber(inputs.alreadyPaidTax),
      fill: "#00C49F",
    },
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-center">
              Step 1: 기본 정보 입력
            </h3>
            <CurrencyInput
              label="총급여액 (연봉)"
              value={inputs.annualSalary}
              onValueChange={(v) => handleInputChange("annualSalary", v)}
              quickAmounts={[10000000, 5000000]}
            />
            <CurrencyInput
              label="기납부세액 (올해 미리 낸 세금)"
              value={inputs.alreadyPaidTax}
              onValueChange={(v) => handleInputChange("alreadyPaidTax", v)}
              quickAmounts={[100000, 50000]}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-center">
              Step 2: 소득 공제 항목
            </h3>
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                부양가족 수 (본인 포함)
              </label>
              <input
                type="number"
                min="1"
                value={inputs.dependents}
                onChange={(e) =>
                  handleInputChange("dependents", e.target.value)
                }
                className="w-full mt-1 p-3 border dark:border-gray-700 rounded-lg"
              />
            </div>
            <CurrencyInput
              label="국민연금 납부액 (연)"
              value={inputs.pension}
              onValueChange={(v) => handleInputChange("pension", v)}
              quickAmounts={[1000000, 500000]}
            />
            <CurrencyInput
              label="신용카드 사용액 (연)"
              value={inputs.creditCard}
              onValueChange={(v) => handleInputChange("creditCard", v)}
              quickAmounts={[1000000, 500000]}
            />
            <CurrencyInput
              label="현금영수증/체크카드 사용액 (연)"
              value={inputs.cash}
              onValueChange={(v) => handleInputChange("cash", v)}
              quickAmounts={[1000000, 500000]}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-center">
              Step 3: 세액 공제 항목
            </h3>
            <CurrencyInput
              label="의료비 (연)"
              value={inputs.medical}
              onValueChange={(v) => handleInputChange("medical", v)}
              quickAmounts={[100000, 50000]}
            />
            <CurrencyInput
              label="교육비 (연)"
              value={inputs.education}
              onValueChange={(v) => handleInputChange("education", v)}
              quickAmounts={[100000, 50000]}
            />
          </div>
        );
      case 4:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-center mb-6">
              💸 연말정산 최종 결과
            </h2>
            <div
              className={`p-6 rounded-lg ${
                result.finalTax >= 0
                  ? "bg-blue-100 dark:bg-blue-900/50"
                  : "bg-red-100 dark:bg-red-900/50"
              }`}
            >
              <p className="font-semibold text-lg">
                {result.finalTax >= 0 ? "예상 환급액" : "예상 추가 납부액"}
              </p>
              <p
                className={`text-5xl font-bold my-2 ${
                  result.finalTax >= 0
                    ? "text-signature-blue"
                    : "text-brand-red"
                }`}
              >
                <CountUp end={Math.abs(result.finalTax)} separator="," /> 원
              </p>
            </div>
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) =>
                      `${formatNumber(value as number)}`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => `${formatNumber(value)}원`}
                  />
                  <Legend />
                  <Bar dataKey="value" name="금액" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-8">
        <div
          className="bg-signature-blue h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${(step / 4) * 100}%` }}
        ></div>
      </div>

      {renderStep()}

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center">
        {step > 1 && step < 4 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg"
          >
            이전
          </button>
        )}
        {step < 3 && (
          <button
            onClick={() => setStep(step + 1)}
            className="px-6 py-2 bg-signature-blue text-white font-bold rounded-lg ml-auto"
          >
            다음
          </button>
        )}
        {step === 3 && (
          <button
            onClick={handleCalculate}
            className="w-full py-3 bg-signature-blue text-white font-bold rounded-lg text-lg"
          >
            결과 보기
          </button>
        )}
        {step === 4 && (
          <button
            onClick={() => setStep(1)}
            className="w-full py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg"
          >
            다시 계산하기
          </button>
        )}
      </div>
    </div>
  );
}
