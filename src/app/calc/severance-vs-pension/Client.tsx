"use client";

import { useState, useMemo } from "react";

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

function toEok(n: number): string {
  if (n >= 100_000_000) {
    const eok = Math.floor(n / 100_000_000);
    const man = Math.floor((n % 100_000_000) / 10_000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (n >= 10_000) return `${Math.floor(n / 10_000).toLocaleString()}만원`;
  return `${n.toLocaleString()}원`;
}

function formatInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}
function parseInput(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}

// 퇴직소득세 간이 추정 (근속 N년 시 평균 세율)
function estimateRetirementTax(severance: number, years: number): number {
  // 근속연수공제
  let yearsDeduction: number;
  if (years <= 5) yearsDeduction = years * 1_000_000;
  else if (years <= 10) yearsDeduction = 5_000_000 + (years - 5) * 2_000_000;
  else if (years <= 20) yearsDeduction = 15_000_000 + (years - 10) * 2_500_000;
  else yearsDeduction = 40_000_000 + (years - 20) * 3_000_000;

  // 환산급여
  const adjustedIncome = Math.max(0, severance - yearsDeduction);
  const annualEquivalent = (adjustedIncome * 12) / Math.max(years, 1);

  // 환산급여공제
  let conversionDeduction: number;
  if (annualEquivalent <= 8_000_000) conversionDeduction = annualEquivalent;
  else if (annualEquivalent <= 70_000_000)
    conversionDeduction = 8_000_000 + (annualEquivalent - 8_000_000) * 0.6;
  else if (annualEquivalent <= 100_000_000)
    conversionDeduction = 45_200_000 + (annualEquivalent - 70_000_000) * 0.55;
  else if (annualEquivalent <= 300_000_000)
    conversionDeduction = 61_700_000 + (annualEquivalent - 100_000_000) * 0.45;
  else conversionDeduction = 151_700_000 + (annualEquivalent - 300_000_000) * 0.35;

  const taxBase = Math.max(0, annualEquivalent - conversionDeduction);

  // 누진세율
  let tax: number;
  if (taxBase <= 14_000_000) tax = taxBase * 0.06;
  else if (taxBase <= 50_000_000) tax = 840_000 + (taxBase - 14_000_000) * 0.15;
  else if (taxBase <= 88_000_000) tax = 6_240_000 + (taxBase - 50_000_000) * 0.24;
  else if (taxBase <= 150_000_000) tax = 15_360_000 + (taxBase - 88_000_000) * 0.35;
  else tax = 37_060_000 + (taxBase - 150_000_000) * 0.38;

  // 최종 퇴직소득세 = 산출세액 × 근속연수 / 12
  const incomeTax = (tax * years) / 12;
  const localTax = incomeTax * 0.1;
  return Math.round(incomeTax + localTax);
}

// 연금 수령 세금 (저율 분리과세 평균 4.4%)
function pensionTax(severance: number): number {
  return Math.round(severance * 0.044);
}

export default function SeveranceClient() {
  const [salaryFmt, setSalaryFmt] = useState("60,000,000");
  const [yearsFmt, setYearsFmt] = useState("10");
  const [growthRate, setGrowthRate] = useState("3");
  const [dcReturn, setDcReturn] = useState("4");

  const salary = parseInput(salaryFmt);
  const years = Math.max(1, Number(yearsFmt) || 1);
  const growth = Number(growthRate) / 100 || 0;
  const dcRet = Number(dcReturn) / 100 || 0;

  const result = useMemo(() => {
    const monthlyPay = salary / 12;
    // DB형 퇴직금 = 마지막 월급 × 근속 (미래 가치)
    const finalMonthlyPay = monthlyPay * Math.pow(1 + growth, years);
    const dbAmount = finalMonthlyPay * years;

    // DC형 = 매년 연봉의 1/12를 적립, 운용 수익 적용
    let dcAmount = 0;
    for (let y = 0; y < years; y++) {
      const yearSalary = salary * Math.pow(1 + growth, y);
      const yearContribution = yearSalary / 12;
      // 남은 기간 운용
      dcAmount += yearContribution * Math.pow(1 + dcRet, years - y);
    }

    // 일시 수령 세금
    const dbTax = estimateRetirementTax(dbAmount, years);
    const dcTax = estimateRetirementTax(dcAmount, years);

    // 연금 수령 시 (3.3~5.5% 평균 4.4%)
    const dbAsAnnuityTax = pensionTax(dbAmount);
    const dcAsAnnuityTax = pensionTax(dcAmount);

    return {
      dbAmount,
      dcAmount,
      dbNet: dbAmount - dbTax,
      dcNet: dcAmount - dcTax,
      dbTax,
      dcTax,
      dbAnnuityNet: dbAmount - dbAsAnnuityTax,
      dcAnnuityNet: dcAmount - dcAsAnnuityTax,
      dbAnnuityTax: dbAsAnnuityTax,
      dcAnnuityTax: dcAsAnnuityTax,
    };
  }, [salary, years, growth, dcRet]);

  return (
    <div className="space-y-5 mb-10">
      {/* 입력 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          id="salary"
          label="현재 연봉 (세전)"
          value={salaryFmt}
          onChange={setSalaryFmt}
          unit="원"
        />
        <Field
          id="years"
          label="근속 예상 (년)"
          value={yearsFmt}
          onChange={setYearsFmt}
          unit="년"
          plain
        />
        <Field
          id="growth"
          label="연봉 상승률 (%/년)"
          value={growthRate}
          onChange={setGrowthRate}
          unit="%"
          plain
        />
        <Field
          id="dcReturn"
          label="DC 운용 수익률 (%/년)"
          value={dcReturn}
          onChange={setDcReturn}
          unit="%"
          plain
        />
      </div>

      {/* 결과 4가지 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ResultCard
          label="① 법정/DB 일시 수령"
          subLabel="평균임금 × 근속연수, 퇴직소득세 분리과세"
          gross={result.dbAmount}
          tax={result.dbTax}
          net={result.dbNet}
          accent="#0145F2"
        />
        <ResultCard
          label="② DC 일시 수령"
          subLabel="매년 적립 + 운용 수익, 퇴직소득세 분리과세"
          gross={result.dcAmount}
          tax={result.dcTax}
          net={result.dcNet}
          accent="#3B82F6"
        />
        <ResultCard
          label="③ DB IRP 연금 수령"
          subLabel="연 1,500만원 이하 저율 분리과세 (3.3~5.5%)"
          gross={result.dbAmount}
          tax={result.dbAnnuityTax}
          net={result.dbAnnuityNet}
          accent="#10B981"
          highlight
        />
        <ResultCard
          label="④ DC IRP 연금 수령"
          subLabel="DC + IRP 이전 후 분할 수령"
          gross={result.dcAmount}
          tax={result.dcAnnuityTax}
          net={result.dcAnnuityNet}
          accent="#10B981"
          highlight
        />
      </div>

      {/* 인사이트 */}
      <div className="rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
        <p className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2">
          IRP 연금 수령 절세 효과
        </p>
        <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mb-1">
          최대 +{toEok(Math.max(result.dbAnnuityNet - result.dbNet, result.dcAnnuityNet - result.dcNet))}
        </p>
        <p className="text-xs text-emerald-800 dark:text-emerald-300">
          IRP 이전 후 만 55세 이후 10년 이상 분할 수령 시 일시 수령 대비 위 금액만큼 더 받습니다.
        </p>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  subLabel,
  gross,
  tax,
  net,
  accent,
  highlight = false,
}: {
  label: string;
  subLabel: string;
  gross: number;
  tax: number;
  net: number;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: highlight ? accent : "#FFFFFF",
        border: highlight ? "none" : "1.5px solid #DDE4EC",
        color: highlight ? "#FFFFFF" : "#0A1829",
        boxShadow: highlight ? `0 8px 24px ${accent}30` : "none",
      }}
    >
      <p
        className="text-xs font-black uppercase tracking-widest mb-1"
        style={{ color: highlight ? "rgba(255,255,255,0.7)" : "#7A9AB5" }}
      >
        {label}
      </p>
      <p
        className="text-[10px] mb-3"
        style={{ color: highlight ? "rgba(255,255,255,0.6)" : "#94A3B8" }}
      >
        {subLabel}
      </p>
      <p className="text-2xl sm:text-3xl font-black tabular-nums mb-1">
        {fmt(net)}원
      </p>
      <div
        className="text-xs flex justify-between mt-3 pt-2"
        style={{
          color: highlight ? "rgba(255,255,255,0.7)" : "#7A9AB5",
          borderTop: highlight ? "1px solid rgba(255,255,255,0.2)" : "1px solid #EDF1F5",
        }}
      >
        <span>세전 {toEok(gross)}</span>
        <span>세금 -{toEok(tax)}</span>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  unit,
  plain = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  plain?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode={plain ? "decimal" : "numeric"}
          value={value}
          onChange={(e) =>
            onChange(plain ? e.target.value.replace(/[^0-9.]/g, "") : formatInput(e.target.value))
          }
          className="w-full rounded-xl px-4 py-3 text-base font-black focus:outline-none focus:ring-2 focus:ring-electric/50 transition pr-10 bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50"
          placeholder="0"
          aria-label={label}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">
          {unit}
        </span>
      </div>
    </div>
  );
}
