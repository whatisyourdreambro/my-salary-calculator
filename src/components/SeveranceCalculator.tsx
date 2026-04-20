// src/components/SeveranceCalculator.tsx

"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
 calculateSeverancePay,
 calculateDCseverance,
} from "@/lib/severanceCalculator";
import CurrencyInput from "./CurrencyInput";
import type { StoredFinancialData, StoredSeveranceData } from "@/app/types";
import { Save, RotateCcw, ChevronDown } from "lucide-react";
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
 <div className="border border-border rounded-lg overflow-hidden">
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="w-full flex justify-between items-center p-4 bg-card hover:bg-secondary/50 transition-colors"
 >
 <h3 className="text-md font-semibold">{title}</h3>
 <ChevronDown
 className={`transform transition-transform duration-200 ${ isOpen ? "rotate-180" : "rotate-0" }`}
 />
 </button>
 {isOpen && <div className="p-4 space-y-4 bg-card border-t border-border">{children}</div>}
 </div>
 );
};

export default function SeveranceCalculator() {
 const [pensionType, setPensionType] = useState<"severance" | "db" | "dc">(
 "severance"
 );
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

 // DC형 계산을 위한 상태
 const [annualSalaryForDC, setAnnualSalaryForDC] = useState("");
 const [dcReturnRate, setDcReturnRate] = useState("5");

 const getTotalDays = (start: string, end: string) => {
 if (!start || !end) return 0;
 const startDate = new Date(start);
 const endDate = new Date(end);
 if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) return 0;
 return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
 };

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

 const dcResult = useMemo(() => {
 const totalDays = getTotalDays(startDate, endDate);
 return calculateDCseverance(
 parseNumber(annualSalaryForDC),
 totalDays,
 parseNumber(dcReturnRate)
 );
 }, [startDate, endDate, annualSalaryForDC, dcReturnRate]);

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
 setAnnualSalaryForDC("");
 setDcReturnRate("5");
 }, [oneYearAgo, today]);

 const handleSaveData = () => {
 if (result.estimatedSeverancePay <= 0 && pensionType !== "dc") {
 alert("퇴직금이 계산되지 않았습니다. 정보를 먼저 입력해주세요.");
 return;
 }
 if (pensionType === "dc") {
 alert("DC형 퇴직연금 정보는 대시보드에 저장되지 않습니다.");
 return;
 }
 try {
 const existingDataJSON = localStorage.getItem("moneysalary-financial-data");
 const existingData: StoredFinancialData = existingDataJSON ? JSON.parse(existingDataJSON) : { lastUpdated: new Date().toISOString() };
 const severanceDataToStore: StoredSeveranceData = { estimatedSeverancePay: result.estimatedSeverancePay };
 const updatedData: StoredFinancialData = { ...existingData, severance: severanceDataToStore, lastUpdated: new Date().toISOString() };
 localStorage.setItem("moneysalary-financial-data", JSON.stringify(updatedData));
 alert("예상 퇴직금 정보가 대시보드에 저장되었습니다!");
 router.push("/dashboard");
 } catch (error) {
 console.error("Failed to save data to localStorage:", error);
 alert("데이터 저장에 실패했습니다.");
 }
 };

 const inputStyle = "w-full mt-2 p-3 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition";

 return (
 <div className="w-full max-w-5xl mx-auto">
 <div className="mb-6 bg-secondary p-1.5 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-1">
 {[
 { id: "severance", label: "퇴직금" },
 { id: "db", label: "DB형" },
 { id: "dc", label: "DC형" },
 ].map((item) => (
 <button
 key={item.id}
 onClick={() => setPensionType(item.id as "severance" | "db" | "dc")}
 className={`w-full py-2.5 text-sm font-bold rounded-lg transition-colors ${
 pensionType === item.id
 ? "bg-card text-primary shadow"
 : "text-muted-foreground hover:bg-secondary/50"
 }`}
 >
 {item.label}
 </button>
 ))}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
 <div className="lg:col-span-3 space-y-6">
 {pensionType === "severance" || pensionType === "db" ? (
 <>
 <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
 <h2 className="text-lg sm:text-xl font-bold mb-4">근무 정보</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label htmlFor="startDate" className="text-sm font-medium text-muted-foreground">입사일</label>
 <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputStyle} />
 </div>
 <div>
 <label htmlFor="endDate" className="text-sm font-medium text-muted-foreground">퇴사일 (마지막 근무일)</label>
 <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputStyle} />
 </div>
 </div>
 </div>

 <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
 <h2 className="text-lg sm:text-xl font-bold mb-4">급여 정보 (퇴사일 이전 3개월)</h2>
 <div className="space-y-4">
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
 <div className="space-y-4">
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
 </>
 ) : (
 <>
 <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
 <h2 className="text-lg sm:text-xl font-bold mb-4">근무 정보</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label htmlFor="startDate" className="text-sm font-medium text-muted-foreground">입사일</label>
 <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputStyle} />
 </div>
 <div>
 <label htmlFor="endDate" className="text-sm font-medium text-muted-foreground">퇴사일 (마지막 근무일)</label>
 <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputStyle} />
 </div>
 </div>
 </div>
 <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
 <h2 className="text-lg sm:text-xl font-bold mb-4">급여 정보</h2>
 <div className="space-y-4">
 <CurrencyInput
 label="연간 총 급여"
 value={annualSalaryForDC}
 onValueChange={setAnnualSalaryForDC}
 quickAmounts={[10000000, 1000000]}
 />
 <div>
 <label htmlFor="dcReturnRate" className="text-sm font-medium text-muted-foreground">연평균 예상 투자수익률 (%)</label>
 <input type="number" id="dcReturnRate" value={dcReturnRate} onChange={(e) => setDcReturnRate(e.target.value)} className={inputStyle} placeholder="예: 5" />
 </div>
 </div>
 </div>
 </>
 )}
 </div>

 <div className="lg:col-span-2 space-y-6">
 <div className="sticky top-24 bg-card p-4 sm:p-6 rounded-2xl shadow-lg border border-border">
 {pensionType === "dc" ? (
 <>
 <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">💰 예상 DC형 적립금</h2>
 <div className="bg-secondary p-4 rounded-lg text-center mb-4">
 <p className="text-sm font-semibold text-muted-foreground">총 재직일수</p>
 <p className="text-lg sm:text-xl font-bold"><CountUp end={getTotalDays(startDate, endDate)} separator="," /> 일</p>
 </div>
 <div className="mt-4 pt-4 border-t-2 border-dashed border-border">
 <div className="flex justify-between items-center">
 <span className="text-base sm:text-lg font-bold">예상 적립금</span>
 <p className="text-3xl sm:text-4xl font-bold text-primary"><CountUp end={dcResult.estimatedDCseverance} separator="," /> 원</p>
 </div>
 </div>
 <div className="mt-2 text-xs text-center text-muted-foreground">* DC형은 개인의 투자 수익에 따라 결과가 달라지며, 세금은 연금 수령 시점에 별도 부과됩니다.</div>
 </>
 ) : (
 <>
 <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">💰 예상 퇴직금 결과</h2>
 <div className="bg-secondary p-4 rounded-lg text-center mb-4">
 <p className="text-sm font-semibold text-muted-foreground">총 재직일수</p>
 <p className="text-lg sm:text-xl font-bold"><CountUp end={result.totalDaysOfEmployment} separator="," /> 일 ({result.yearsOfService.years}년 {result.yearsOfService.months}개월)</p>
 </div>
 <div className="space-y-3">
 <div className="flex justify-between items-baseline">
 <span className="text-md font-semibold text-muted-foreground">세전 퇴직금</span>
 <p className="text-xl sm:text-2xl font-bold text-foreground"><CountUp end={result.estimatedSeverancePay} separator="," /> 원</p>
 </div>
 <div className="flex justify-between items-baseline">
 <span className="text-md font-semibold text-destructive">퇴직 소득세</span>
 <p className="text-xl sm:text-2xl font-bold text-destructive">- <CountUp end={result.incomeTax + result.localTax} separator="," /> 원</p>
 </div>
 </div>
 <div className="mt-4 pt-4 border-t-2 border-dashed border-border">
 <div className="flex justify-between items-center">
 <span className="text-lg font-bold">세후 실수령액</span>
 <p className="text-3xl sm:text-4xl font-bold text-primary"><CountUp end={result.netSeverancePay} separator="," /> 원</p>
 </div>
 </div>
 <div className="mt-6">
 <Accordion title="세금 계산 과정 & IRP 혜택 보기">
 <div className="text-xs space-y-2 text-muted-foreground">
 <div className="flex justify-between"><span>과세대상 퇴직금:</span><span className="font-mono">{result.details?.retirementIncome.toLocaleString('ko-KR')}원</span></div>
 <div className="flex justify-between"><span>└ 근속연수공제:</span><span className="font-mono">-{result.details?.serviceYearDeduction.toLocaleString('ko-KR')}원</span></div>
 <div className="flex justify-between"><span>환산급여:</span><span className="font-mono">{result.details?.convertedSalary.toLocaleString('ko-KR')}원</span></div>
 <div className="flex justify-between"><span>└ 환산급여공제:</span><span className="font-mono">-{result.details?.convertedSalaryDeduction.toLocaleString('ko-KR')}원</span></div>
 <div className="flex justify-between font-bold"><span>과세표준:</span><span className="font-mono">{result.details?.taxBase.toLocaleString('ko-KR')}원</span></div>
 <div className="flex justify-between"><span>산출세액:</span><span className="font-mono">{result.details?.calculatedTax.toLocaleString('ko-KR')}원</span></div>
 </div>
 <div className="mt-4 pt-4 border-t border-dashed border-border">
 <h4 className="font-bold text-sm mb-2 text-center text-foreground">💡 IRP 계좌로 이전 시 혜택</h4>
 <p className="text-xs text-center text-muted-foreground mb-2">퇴직금을 IRP 계좌로 이전하여 연금으로 수령 시, 퇴직소득세의 30%를 감면받을 수 있습니다.</p>
 <div className="p-3 bg-primary/10 rounded-lg text-center">
 <p className="text-sm font-semibold">감면 후 예상 세금</p>
 <p className="text-lg font-bold text-primary"><CountUp end={(result.incomeTax + result.localTax) * 0.7} separator="," /> 원</p>
 </div>
 </div>
 </Accordion>
 </div>
 </>
 )}
 <div className="mt-6 grid grid-cols-2 gap-2">
 <button onClick={handleReset} className="w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors">
 <RotateCcw size={16} /> 초기화
 </button>
 <button onClick={handleSaveData} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg flex items-center justify-center gap-2 hover:brightness-95 transition-all disabled:opacity-50" disabled={pensionType === "dc"}>
 <Save size={16} /> 대시보드 저장
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}