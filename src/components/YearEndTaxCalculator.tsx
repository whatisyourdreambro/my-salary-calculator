"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { calculateYearEndTax, TaxInputs } from "@/lib/yearEndTaxCalculator";

const formatNumber = (num: number) => num.toLocaleString();

const Accordion = ({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
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

const NumberInput = ({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
}) => (
  <div>
    <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
      {label}
    </label>
    <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        -
      </button>
      <span className="font-bold text-lg">{value} 명</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        +
      </button>
    </div>
  </div>
);

// [추가] 시뮬레이션을 위한 슬라이더 컴포넌트
const OptimizationSlider = ({
  label,
  tip,
  value,
  max,
  onChange,
}: {
  label: string;
  tip: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <label className="text-sm font-medium">{label}</label>
      <span className="text-sm font-bold text-signature-blue">
        {formatNumber(value)}원
      </span>
    </div>
    <input
      type="range"
      min="0"
      max={max}
      step={100000}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
    />
    <p className="text-xs text-gray-500 mt-1">{tip}</p>
  </div>
);

export default function YearEndTaxCalculator() {
  const [inputs, setInputs] = useState<TaxInputs>({
    grossSalary: 50000000,
    prepaidTax: 2500000,
    nationalPension: 2250000,
    healthInsurance: 1772500,
    employmentInsurance: 450000,
    dependents: 1,
    disabledDependents: 0,
    seniorDependents: 0,
    housingSubscription: 0,
    mortgageInterest: 0,
    creditCard: 15000000,
    debitCardAndCash: 5000000,
    traditionalMarket: 1000000,
    publicTransport: 500000,
    children: 0,
    birthsOrAdoptions: 0,
    pensionSavings: 0,
    irp: 0,
    lifeInsurance: 0,
    medicalExpenses: 0,
    educationExpenses: 0,
    donation: 0,
    monthlyRent: 0,
  });

  const result = useMemo(() => calculateYearEndTax(inputs), [inputs]);
  const initialRefund = result.finalRefund;

  const handleInputChange = (field: keyof TaxInputs, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [field]: Number(value.replace(/,/g, "")) || 0,
    }));
  };

  const handleNumberChange = (field: keyof TaxInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const chartData = [
    { name: "기납부세액", value: inputs.prepaidTax },
    { name: "결정세액", value: result.determinedTax },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      {/* 입력 섹션 */}
      <div className="lg:col-span-2 space-y-6">
        <Accordion title="1. 기본 정보" defaultOpen={true}>
          <CurrencyInput
            label="총급여액 (연봉)"
            value={inputs.grossSalary.toLocaleString()}
            onValueChange={(v) => handleInputChange("grossSalary", v)}
            quickAmounts={[10000000, 5000000]}
          />
          <CurrencyInput
            label="기납부세액 (원천징수된 세금 총액)"
            value={inputs.prepaidTax.toLocaleString()}
            onValueChange={(v) => handleInputChange("prepaidTax", v)}
            quickAmounts={[100000, 50000]}
          />
        </Accordion>

        <Accordion title="2. 소득 공제 항목">
          <div className="grid md:grid-cols-3 gap-4">
            <NumberInput
              label="부양가족(본인포함)"
              value={inputs.dependents}
              onChange={(v) => handleNumberChange("dependents", v)}
              min={1}
            />
            <NumberInput
              label="만 70세 이상"
              value={inputs.seniorDependents}
              onChange={(v) => handleNumberChange("seniorDependents", v)}
            />
            <NumberInput
              label="장애인"
              value={inputs.disabledDependents}
              onChange={(v) => handleNumberChange("disabledDependents", v)}
            />
          </div>
          <CurrencyInput
            label="국민연금 납부액"
            value={inputs.nationalPension.toLocaleString()}
            onValueChange={(v) => handleInputChange("nationalPension", v)}
            quickAmounts={[]}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <CurrencyInput
              label="신용카드"
              value={inputs.creditCard.toLocaleString()}
              onValueChange={(v) => handleInputChange("creditCard", v)}
              quickAmounts={[]}
            />
            <CurrencyInput
              label="체크카드·현금영수증"
              value={inputs.debitCardAndCash.toLocaleString()}
              onValueChange={(v) => handleInputChange("debitCardAndCash", v)}
              quickAmounts={[]}
            />
          </div>
        </Accordion>

        <Accordion title="3. 세액 공제 항목">
          <div className="grid md:grid-cols-2 gap-4">
            <NumberInput
              label="자녀 (만 8세 이상)"
              value={inputs.children}
              onChange={(v) => handleNumberChange("children", v)}
            />
            <NumberInput
              label="올해 출생/입양 자녀"
              value={inputs.birthsOrAdoptions}
              onChange={(v) => handleNumberChange("birthsOrAdoptions", v)}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <CurrencyInput
              label="연금저축/IRP 납입액"
              value={inputs.pensionSavings.toLocaleString()}
              onValueChange={(v) => handleInputChange("pensionSavings", v)}
              quickAmounts={[]}
            />
            <CurrencyInput
              label="월세액"
              value={inputs.monthlyRent.toLocaleString()}
              onValueChange={(v) => handleInputChange("monthlyRent", v)}
              quickAmounts={[]}
            />
            <CurrencyInput
              label="의료비"
              value={inputs.medicalExpenses.toLocaleString()}
              onValueChange={(v) => handleInputChange("medicalExpenses", v)}
              quickAmounts={[]}
            />
            <CurrencyInput
              label="기부금"
              value={inputs.donation.toLocaleString()}
              onValueChange={(v) => handleInputChange("donation", v)}
              quickAmounts={[]}
            />
          </div>
        </Accordion>
      </div>

      {/* 결과 및 시뮬레이션 섹션 */}
      <div className="lg:col-span-1 space-y-6">
        <div className="sticky top-24 bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-center mb-4">
            💸 연말정산 예상 결과
          </h2>
          <div
            className={`p-4 rounded-lg text-center transition-colors duration-300 ${
              result.finalRefund >= 0
                ? "bg-blue-100 dark:bg-blue-900/50"
                : "bg-red-100 dark:bg-red-900/50"
            }`}
          >
            <p className="font-semibold">
              {result.finalRefund >= 0 ? "예상 환급액" : "예상 추가 납부액"}
            </p>
            <p
              className={`text-4xl font-bold my-1 transition-colors duration-300 ${
                result.finalRefund >= 0
                  ? "text-signature-blue"
                  : "text-brand-red"
              }`}
            >
              <CountUp
                end={Math.abs(result.finalRefund)}
                separator=","
                duration={0.5}
              />{" "}
              원
            </p>
          </div>

          <div className="mt-6">
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={chartData} layout="vertical" barGap={5}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip
                  formatter={(value: number) => `${formatNumber(value)}원`}
                />
                <Legend iconType="circle" />
                <Bar dataKey="value" stackId="a" barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? "#3B82F6" : "#EF4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 pt-6 border-t dark:border-gray-700">
            <h3 className="text-lg font-bold text-center mb-4">
              절세 최적화 시뮬레이터
            </h3>
            <div className="space-y-4">
              <OptimizationSlider
                label="연금저축/IRP"
                tip="연 900만원까지 세액공제 혜택을 최대로 받을 수 있어요!"
                value={inputs.pensionSavings}
                max={9000000}
                onChange={(v) => handleNumberChange("pensionSavings", v)}
              />
              <OptimizationSlider
                label="신용카드"
                tip="총급여의 25% 초과 사용분부터 공제 대상이 됩니다."
                value={inputs.creditCard}
                max={inputs.grossSalary}
                onChange={(v) => handleNumberChange("creditCard", v)}
              />
              <OptimizationSlider
                label="기부금"
                tip="기부금액에 따라 15~30% 세액공제를 받을 수 있습니다."
                value={inputs.donation}
                max={inputs.grossSalary * 0.3} // 예시 한도
                onChange={(v) => handleNumberChange("donation", v)}
              />
            </div>
            {result.finalRefund > initialRefund && (
              <div className="mt-4 text-center p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <p className="text-sm font-bold text-green-600">
                  환급액 {formatNumber(result.finalRefund - initialRefund)}원
                  증가!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
