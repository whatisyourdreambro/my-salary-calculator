"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

const COLORS = ["#007FFF", "#FF8042"];

export default function HomeLoanSimulator() {
  const [homePrice, setHomePrice] = useState("600000000");
  const [downPayment, setDownPayment] = useState("120000000");
  const [loanTerm, setLoanTerm] = useState(30);
  const [interestRate, setInterestRate] = useState(4.5);
  const [annualIncome, setAnnualIncome] = useState("60000000");
  const [otherDebtPayment, setOtherDebtPayment] = useState("0");

  const {
    monthlyPayment,
    totalInterest,
    totalPayment,
    dsr,
    dsrStatus,
    dsrMessage,
  } = useMemo(() => {
    const principal = parseNumber(homePrice) - parseNumber(downPayment);
    if (principal <= 0 || interestRate <= 0) {
      return {
        monthlyPayment: 0,
        totalInterest: 0,
        totalPayment: 0,
        dsr: 0,
        dsrStatus: "safe",
        dsrMessage: "대출 원금을 확인해주세요.",
      };
    }

    const monthlyRate = interestRate / 100 / 12;
    const numberOfMonths = loanTerm * 12;
    const income = parseNumber(annualIncome);
    const otherDebt = parseNumber(otherDebtPayment);

    const monthly =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths))) /
      (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    const total = monthly * numberOfMonths;
    const interest = total - principal;

    const annualRepayment = monthly * 12 + otherDebt;
    const calculatedDsr = income > 0 ? (annualRepayment / income) * 100 : 0;

    let status = "safe";
    let message = "안정적인 상환 능력을 가지고 있습니다.";
    if (calculatedDsr > 70) {
      status = "danger";
      message =
        "위험 수준입니다. 대출 실행이 어려울 수 있으며, 원리금 상환에 큰 부담을 느낄 수 있습니다.";
    } else if (calculatedDsr > 40) {
      status = "warning";
      message =
        "주의가 필요한 수준입니다. 추가적인 소비나 예기치 못한 지출에 취약할 수 있습니다.";
    }

    return {
      monthlyPayment: Math.round(monthly),
      totalInterest: Math.round(interest),
      totalPayment: Math.round(total),
      dsr: parseFloat(calculatedDsr.toFixed(2)),
      dsrStatus: status,
      dsrMessage: message,
    };
  }, [
    homePrice,
    downPayment,
    loanTerm,
    interestRate,
    annualIncome,
    otherDebtPayment,
  ]);

  const pieData = [
    {
      name: "총 대출 원금",
      value: parseNumber(homePrice) - parseNumber(downPayment),
    },
    { name: "총 예상 이자", value: totalInterest },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* 입력 섹션 */}
      <div className="space-y-6 bg-light-card dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold">대출 정보 입력</h2>
        <CurrencyInput
          label="주택 가격"
          value={homePrice}
          onValueChange={setHomePrice}
          quickAmounts={[100000000, 50000000, 10000000]}
        />
        <CurrencyInput
          label="자기 자본 (계약금+중도금+잔금)"
          value={downPayment}
          onValueChange={setDownPayment}
          quickAmounts={[10000000, 5000000, 1000000]}
        />

        <div>
          <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            대출 기간: <strong>{loanTerm}년</strong>
          </label>
          <input
            type="range"
            min="5"
            max="40"
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            대출 금리: <strong>{interestRate}%</strong>
          </label>
          <input
            type="range"
            min="2"
            max="8"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        <h2 className="text-xl font-bold pt-4 border-t dark:border-gray-700">
          DSR 계산을 위한 추가 정보
        </h2>
        <CurrencyInput
          label="나의 세전 연소득"
          value={annualIncome}
          onValueChange={setAnnualIncome}
          quickAmounts={[10000000, 5000000, 1000000]}
        />
        <CurrencyInput
          label="다른 대출 연간 원리금 상환액"
          value={otherDebtPayment}
          onValueChange={setOtherDebtPayment}
          quickAmounts={[1000000, 500000, 100000]}
        />
      </div>

      {/* 결과 섹션 */}
      <div className="space-y-6 bg-signature-blue text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">📊 시뮬레이션 결과</h2>

        <div className="bg-white/20 p-6 rounded-lg text-center">
          <p className="font-semibold text-blue-200 text-lg">
            매달 내야하는 원리금은
          </p>
          <p className="text-4xl sm:text-5xl font-bold my-2">
            <CountUp end={monthlyPayment} separator="," /> 원
          </p>
        </div>

        <div className="bg-white/20 p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-4 text-center">
            총 상환 금액 분석
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                // [수정] entry.value가 숫자인지, totalPayment가 0이 아닌지 확인하는 안전장치를 추가했습니다.
                label={({ name, value }) => {
                  if (typeof value !== "number" || totalPayment === 0) {
                    return name; // 예외 상황에서는 이름만 표시
                  }
                  const percent = (value / totalPayment) * 100;
                  return `${percent.toFixed(0)}%`;
                }}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${formatNumber(value)}원`}
              />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-sm space-y-2 mt-4">
            <div className="flex justify-between">
              <span className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2 bg-[#007FFF]"></span>
                총 대출 원금
              </span>
              <strong>
                {formatNumber(
                  parseNumber(homePrice) - parseNumber(downPayment)
                )}{" "}
                원
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2 bg-[#FF8042]"></span>
                총 예상 이자
              </span>
              <strong>{formatNumber(totalInterest)} 원</strong>
            </div>
            <hr className="border-white/30 my-2" />
            <div className="flex justify-between font-bold">
              <span>총 상환 금액</span>
              <span>{formatNumber(totalPayment)} 원</span>
            </div>
          </div>
        </div>

        <div className="bg-white/20 p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-4 text-center">
            DSR (총부채원리금상환비율)
          </h3>
          <div className="text-center">
            <div
              className={`text-4xl font-bold ${
                dsrStatus === "danger"
                  ? "text-red-400"
                  : dsrStatus === "warning"
                  ? "text-yellow-300"
                  : "text-green-300"
              }`}
            >
              <CountUp end={dsr} decimals={2} />%
            </div>
            <p className="text-xs mt-2 text-blue-200">{dsrMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
