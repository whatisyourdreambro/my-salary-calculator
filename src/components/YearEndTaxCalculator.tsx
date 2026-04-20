"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import CountUp from "react-countup";
import {
 calculateYearEndTax,
 TaxInputs,
 TaxResult,
} from "@/lib/yearEndTaxCalculator";
import NumberStepper from "./NumberStepper";
import { ChevronDown } from "lucide-react";

const formatNumber = (num: number) => num.toLocaleString('ko-KR');

const AnalysisReport = ({ inputs, result }: { inputs: TaxInputs; result: TaxResult; }) => {
 const earnedIncomeDeduction = inputs.grossSalary - result.taxBase - result.determinedTax > 0
 ? inputs.grossSalary - result.taxBase - result.determinedTax
 : 0;
 const earnedIncomeAmount = inputs.grossSalary - earnedIncomeDeduction;
 const incomeDeductionTotal = earnedIncomeAmount - result.taxBase;
 const calculatedTax = result.determinedTax + (inputs.prepaidTax - result.finalRefund - result.determinedTax);
 const taxCreditTotal = calculatedTax - result.determinedTax;

 const calculationSteps = [
 { label: "총급여액 (A)", value: inputs.grossSalary, isBold: true },
 { label: "(-) 근로소득공제", value: earnedIncomeDeduction },
 { label: "(=) 근로소득금액 (B)", value: earnedIncomeAmount },
 { label: "(-) 소득공제 합계", value: incomeDeductionTotal },
 { label: "(=) 과세표준 (C)", value: result.taxBase, isBold: true },
 { label: "산출세액 (D)", value: calculatedTax },
 { label: "(-) 세액공제 합계", value: taxCreditTotal },
 { label: "(=) 결정세액 (E)", value: result.determinedTax, isBold: true },
 { label: "기납부세액 (F)", value: inputs.prepaidTax, isBold: true },
 { label: "(=) 최종 환급/납부액 (F-E)", value: result.finalRefund, isFinal: true },
 ];

 return (
 <div className="mt-6 p-4 border border-border rounded-lg bg-secondary/30">
 <h4 className="text-lg font-bold text-center mb-4">상세 분석 리포트</h4>
 <div className="space-y-2 text-xs sm:text-sm">
 {calculationSteps.map((step, index) => (
 <div
 key={index}
 className={`flex justify-between items-center py-1.5 ${
 step.isBold ? "border-t border-border mt-1 pt-1.5" : ""
 }`}
 >
 <span className={`${step.isFinal ? "font-bold text-base sm:text-lg" : "text-muted-foreground"}`}>
 {step.label}
 </span>
 <span
 className={`font-mono text-sm sm:text-base ${
 step.isFinal && step.value >= 0 ? "text-primary" : ""
 } ${step.isFinal && step.value < 0 ? "text-destructive" : ""} ${
 step.isBold ? "font-bold text-foreground" : "text-muted-foreground"
 }`}
 >
 {formatNumber(Math.round(step.value))} 원
 </span>
 </div>
 ))}
 </div>
 </div>
 );
};

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
 <div className="border border-border rounded-lg overflow-hidden">
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="w-full flex justify-between items-center p-4 bg-card hover:bg-secondary/50 transition-colors"
 >
 <h3 className="text-lg font-semibold">{title}</h3>
 <ChevronDown className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`} />
 </button>
 {isOpen && <div className="p-4 space-y-4 bg-card border-t border-border">{children}</div>}
 </div>
 );
};

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
 <div className="flex justify-between items-center mb-2">
 <label className="text-sm font-medium text-muted-foreground">{label}</label>
 <span className="text-sm font-bold text-primary">{formatNumber(value)}원</span>
 </div>
 <input
 type="range"
 min="0"
 max={max}
 step={100000}
 value={value}
 onChange={(e) => onChange(Number(e.target.value))}
 className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
 />
 <p className="text-xs text-muted-foreground mt-2">{tip}</p>
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

 const [showReport, setShowReport] = useState(false);

 const result = useMemo(() => calculateYearEndTax(inputs), [inputs]);

 const initialRefund = useMemo(
 () =>
 calculateYearEndTax({
 ...inputs,
 pensionSavings: 0,
 creditCard: 0,
 donation: 0,
 }).finalRefund,
 [inputs]
 );

 const handleInputChange = (field: keyof TaxInputs, value: string) => {
 setInputs((prev) => ({ ...prev, [field]: Number(value.replace(/,/g, "")) || 0 }));
 };

 const handleNumberChange = (field: keyof TaxInputs, value: number) => {
 setInputs((prev) => ({ ...prev, [field]: value }));
 };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-6">
 <Accordion title="1. 기본 정보" defaultOpen={true}>
 <CurrencyInput
 label="총급여액 (연봉)"
 value={inputs.grossSalary.toLocaleString('ko-KR')}
 onValueChange={(v) => handleInputChange("grossSalary", v)}
 quickAmounts={[10000000, 5000000, 1000000]}
 />
 <CurrencyInput
 label="기납부세액 (원천징수된 세금 총액)"
 value={inputs.prepaidTax.toLocaleString('ko-KR')}
 onValueChange={(v) => handleInputChange("prepaidTax", v)}
 quickAmounts={[500000, 100000, 50000]}
 />
 </Accordion>

 <Accordion title="2. 소득 공제 항목">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <NumberStepper label="부양가족(본인포함)" value={inputs.dependents} onValueChange={(v) => handleNumberChange("dependents", v)} min={1} unit="명" />
 <NumberStepper label="만 70세 이상" value={inputs.seniorDependents} onValueChange={(v) => handleNumberChange("seniorDependents", v)} unit="명" />
 <NumberStepper label="장애인" value={inputs.disabledDependents} onValueChange={(v) => handleNumberChange("disabledDependents", v)} unit="명" />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
 <CurrencyInput
 label="신용카드"
 value={inputs.creditCard.toLocaleString('ko-KR')}
 onValueChange={(v) => handleInputChange("creditCard", v)}
 quickAmounts={[5000000, 1000000, 500000]}
 />
 <CurrencyInput
 label="체크카드·현금영수증"
 value={inputs.debitCardAndCash.toLocaleString('ko-KR')}
 onValueChange={(v) => handleInputChange("debitCardAndCash", v)}
 quickAmounts={[5000000, 1000000, 500000]}
 />
 </div>
 </Accordion>

 <Accordion title="3. 세액 공제 항목">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <CurrencyInput
 label="연금저축/IRP 납입액"
 value={inputs.pensionSavings.toLocaleString('ko-KR')}
 onValueChange={(v) => handleInputChange("pensionSavings", v)}
 quickAmounts={[3000000, 1000000, 500000]}
 />
 <CurrencyInput
 label="기부금"
 value={inputs.donation.toLocaleString('ko-KR')}
 onValueChange={(v) => handleInputChange("donation", v)}
 quickAmounts={[100000, 50000, 10000]}
 />
 </div>
 </Accordion>
 </div>

 <div className="lg:col-span-1 space-y-6">
 <div className="sticky top-24 bg-card p-4 sm:p-6 rounded-xl shadow-lg border border-border">
 <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">💸 연말정산 예상 결과</h2>
 <div
 className={`p-4 rounded-lg text-center transition-colors duration-300 ${
 result.finalRefund >= 0 ? "bg-primary/10" : "bg-destructive/10"
 }`}
 >
 <p className="font-semibold text-muted-foreground">
 {result.finalRefund >= 0 ? "예상 환급액" : "예상 추가 납부액"}
 </p>
 <p
 className={`text-3xl sm:text-4xl font-bold my-1 transition-colors duration-300 ${
 result.finalRefund >= 0 ? "text-primary" : "text-destructive"
 }`}
 >
 <CountUp end={Math.abs(result.finalRefund)} separator="," duration={0.5} /> 원
 </p>
 </div>

 <div className="mt-4">
 <button
 onClick={() => setShowReport(!showReport)}
 className="w-full text-sm text-center text-muted-foreground hover:text-primary transition-colors"
 >
 {showReport ? "리포트 숨기기 ▲" : "상세 분석 리포트 보기 ▼"}
 </button>
 {showReport && <AnalysisReport inputs={inputs} result={result} />}
 </div>

 <div className="mt-6 pt-6 border-t border-border">
 <h3 className="text-lg font-bold text-center mb-4">절세 최적화 시뮬레이터</h3>
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
 </div>
 {result.finalRefund > initialRefund && (
 <div className="mt-4 text-center p-2 bg-primary/10 rounded-lg">
 <p className="text-sm font-bold text-primary">
 환급액 {formatNumber(result.finalRefund - initialRefund)}원 증가!
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
