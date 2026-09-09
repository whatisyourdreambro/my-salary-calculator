"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PieChart, Calculator } from "lucide-react";
import SegmentedControl from "@/components/ui/SegmentedControl";

// 잔액 추이 차트(recharts)는 지연 로드 — recharts가 무거워 First Load 에서 제외.
const LoanChart = dynamic(() => import("@/components/charts/LoanChart"), {
 ssr: false,
 loading: () => <div className="h-full w-full rounded-xl bg-secondary motion-safe:animate-pulse" />,
});

type RepaymentMethod = "level-payment" | "level-principal" | "bullet";

interface ScheduleRow {
 month: number;
 payment: number;
 principal: number;
 interest: number;
 balance: number;
}

interface LoanResults {
 monthlyPayment: number;
 totalInterest: number;
 totalPayment: number;
 schedule: ScheduleRow[];
}

export default function LoanCalculator() {
 const [amount, setAmount] = useState(100000000); // 1億
 const [rate, setRate] = useState(3.5);
 const [term, setTerm] = useState(10); // Years
 const [method, setMethod] = useState<RepaymentMethod>("level-payment");
 const [results, setResults] = useState<LoanResults | null>(null);
 const validInputs = Number.isFinite(amount) && amount >= 0 && Number.isFinite(rate) && rate >= 0 && Number.isInteger(term) && term >= 1 && term <= 50;

 useEffect(() => {
 if (!validInputs) { setResults(null); return; }
 const monthlyRate = rate / 100 / 12;
 const totalMonths = term * 12;

 // 기간 0/음수/빈 입력(Number("")=0) 가드 — schedule[0]·schedule[totalMonths-1]
 // 접근 크래시와 0으로 나누기(₩NaN) 방지
 if (totalMonths < 1) {
 setResults(null);
 return;
 }

 let monthlyPayment = 0;
 let totalInterest = 0;
 const schedule = [];

 let balance = amount;

 if (method === "level-payment") {
 // 원리금균등 — 이자율 0%면 공식이 0/0=NaN이 되므로 원금 균등 분할 특수식
 monthlyPayment =
 monthlyRate === 0
 ? amount / totalMonths
 : (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
 (Math.pow(1 + monthlyRate, totalMonths) - 1);

 for (let i = 1; i <= totalMonths; i++) {
 const interest = balance * monthlyRate;
 const principal = monthlyPayment - interest;
 balance -= principal;
 totalInterest += interest;
 schedule.push({
 month: i,
 payment: Math.round(monthlyPayment),
 principal: Math.round(principal),
 interest: Math.round(interest),
 balance: Math.max(0, Math.round(balance)),
 });
 }
 } else if (method === "level-principal") {
 // 원금균등
 const principalPayment = amount / totalMonths;

 for (let i = 1; i <= totalMonths; i++) {
 const interest = balance * monthlyRate;
 const payment = principalPayment + interest;
 balance -= principalPayment;
 totalInterest += interest;
 schedule.push({
 month: i,
 payment: Math.round(payment),
 principal: Math.round(principalPayment),
 interest: Math.round(interest),
 balance: Math.max(0, Math.round(balance)),
 });
 }
 monthlyPayment = schedule[0].payment; // Initial payment
 } else {
 // 만기일시
 monthlyPayment = amount * monthlyRate;
 totalInterest = monthlyPayment * totalMonths;
 for (let i = 1; i <= totalMonths; i++) {
 schedule.push({
 month: i,
 payment: Math.round(monthlyPayment),
 principal: 0,
 interest: Math.round(monthlyPayment),
 balance: amount
 });
 }
 // Last month pay full principal
 schedule[totalMonths - 1].payment += amount;
 schedule[totalMonths - 1].principal = amount;
 schedule[totalMonths - 1].balance = 0;
 }

 if (![monthlyPayment, totalInterest, amount + totalInterest].every(Number.isFinite)) { setResults(null); return; }
 setResults({
 monthlyPayment: Math.round(monthlyPayment),
 totalInterest: Math.round(totalInterest),
 totalPayment: Math.round(amount + totalInterest),
 schedule,
 });
 }, [amount, rate, term, method, validInputs]);

 const formatMoney = (val: number) => {
 return new Intl.NumberFormat("ko-KR", {
 style: "currency",
 currency: "KRW",
 maximumFractionDigits: 0,
 }).format(val);
 };

 return (
 <div className="w-full max-w-4xl mx-auto space-y-8">
 <div className="grid grid-cols-1 gap-6">
 {/* Inputs */}
 <section
 className="ms-panel"
 >
 <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
 <Calculator className="w-5 h-5 text-foreground" />
 대출 조건 설정
 </h2>
 <p className="mb-6 text-sm leading-6 text-muted-foreground">금액은 원 단위로 입력하세요. 입력한 연 이자율이 전 기간 유지되는 예시이며, 수수료와 거치기간은 포함하지 않습니다.</p>

 <div className="space-y-6">
 <div>
 <label htmlFor="loan-amount" className="block text-sm font-medium text-muted-foreground mb-2">
 대출 금액
 </label>
 <div className="relative">
 <input
 id="loan-amount"
 type="number"
 inputMode="numeric"
 min="0"
 value={amount}
 onChange={(e) => setAmount(Number(e.target.value))}
 className="ms-field w-full tabular-nums"
 />
 </div>
 <div className="flex flex-wrap gap-2 mt-2">
 {[10000000, 50000000, 100000000].map((val) => (
 <button
 key={val}
 type="button"
 onClick={() => setAmount(val)}
 className="ms-button ms-button-secondary text-sm"
 aria-label={`대출 금액 ${val / 10000}만원으로 설정`}
 >
 {val / 10000}만
 </button>
 ))}
 </div>
 </div>

 <div>
 <label htmlFor="loan-rate" className="block text-sm font-medium text-muted-foreground mb-2">
 연 이자율 (%)
 </label>
 <div className="relative">
 <input
 id="loan-rate"
 type="number"
 inputMode="decimal"
 step="0.1"
 min="0"
 value={rate}
 onChange={(e) => setRate(Number(e.target.value))}
 className="ms-field w-full tabular-nums"
 />
 </div>
 </div>

 <div>
 <label htmlFor="loan-term" className="block text-sm font-medium text-muted-foreground mb-2">
 대출 기간 (년)
 </label>
 <div className="relative">
 <input
 id="loan-term"
 type="number"
 inputMode="numeric"
 min="1"
 max="50"
 value={term}
 onChange={(e) => setTerm(Number(e.target.value))}
 className="ms-field w-full tabular-nums"
 />
 </div>
 </div>

 <SegmentedControl label="상환 방식" value={method} onChange={setMethod} options={[
 { value: "level-payment", label: "원리금균등" },
 { value: "level-principal", label: "원금균등" },
 { value: "bullet", label: "만기일시" },
 ]} />
 {!validInputs && <p role="status" className="ms-status-error rounded-lg p-3 text-sm">금액과 금리는 0 이상, 대출 기간은 1~50년의 정수로 입력해 주세요.</p>}
 </div>
 </section>

 {/* Summary */}
 <section
 className="ms-panel flex flex-col justify-between"
 >
 <div>
 <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
 <PieChart className="w-5 h-5 text-link" />
 상환 요약
 </h2>

 <div className="space-y-6">
 <div className="p-4 bg-secondary/50 rounded-xl border border-border">
 <div className="text-sm text-muted-foreground mb-1">총 상환 금액</div>
 <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight tabular-nums break-words">
 {results ? formatMoney(results.totalPayment) : "-"}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="p-4 bg-secondary/50 rounded-xl border border-border">
 <div className="text-sm text-muted-foreground mb-1">총 이자</div>
 <div className="text-lg sm:text-xl font-bold text-link tracking-tight tabular-nums break-words">
 {results ? formatMoney(results.totalInterest) : "-"}
 </div>
 </div>
 <div className="p-4 bg-secondary/50 rounded-xl border border-border">
 <div className="text-sm text-muted-foreground mb-1">{method === "level-principal" ? "첫 달 납입금" : method === "bullet" ? "매월 이자 · 만기 전" : "매월 납입금"}</div>
 <div className="text-lg sm:text-xl font-bold text-foreground tracking-tight tabular-nums break-words">
 {results ? formatMoney(results.monthlyPayment) : "-"}
 </div>
 </div>
 {method === "bullet" && <p className="mt-4 text-sm leading-6 text-muted-foreground">만기에는 표시한 이자와 함께 대출 원금 {formatMoney(amount)}을 상환합니다.</p>}
 </div>
 </div>
 </div>

 {/* Chart */}
 <div className="h-56 sm:h-64 md:h-72 mt-8">
 {results && (
 <LoanChart schedule={results.schedule} formatMoney={formatMoney} />
 )}
 </div>
 </section>
 </div>
 </div>
 );
}
