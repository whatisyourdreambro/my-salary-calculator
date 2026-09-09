"use client";

import { useState, useEffect } from "react";
import { PiggyBank, TrendingUp } from "lucide-react";
import SegmentedControl from "@/components/ui/SegmentedControl";

type SavingsType = "deposit" | "savings"; // 예금(Lump sum) vs 적금(Monthly)
type TaxType = "normal" | "preferential" | "none"; // 일반(15.4), 우대(9.5), 비과세(0)

interface DepositResults {
 principal: number;
 interest: number;
 taxAmount: number;
 afterTaxInterest: number;
 total: number;
}

export default function DepositCalculator() {
 const [type, setType] = useState<SavingsType>("deposit");
 const [amount, setAmount] = useState(10000000); // Principal or Monthly
 const [rate, setRate] = useState(3.5);
 const [term, setTerm] = useState(12); // Months
 const [taxType, setTaxType] = useState<TaxType>("normal");
 const [results, setResults] = useState<DepositResults | null>(null);
 const validInputs = Number.isFinite(amount) && amount >= 0 && Number.isFinite(rate) && rate >= 0 && Number.isInteger(term) && term >= 1 && term <= 600;

 useEffect(() => {
 if (!validInputs) { setResults(null); return; }
 let principal = 0;
 let interest = 0;

 if (type === "deposit") {
 // 예금 (거치식)
 principal = amount;
 interest = principal * (rate / 100) * (term / 12);
 } else {
 // 적금 (적립식) - 단리 가정 (월복리는 복잡해서 일단 단리로)
 // Formula: Monthly * Months + Monthly * Rate * (Months + 1) * Months / 24
 principal = amount * term;
 interest = amount * (rate / 100) * (term + 1) * term / 24;
 }

 let taxRate = 0.154;
 if (taxType === "preferential") taxRate = 0.095;
 if (taxType === "none") taxRate = 0;

 const taxAmount = interest * taxRate;
 const afterTaxInterest = interest - taxAmount;
 const total = principal + afterTaxInterest;

 if (![principal, interest, taxAmount, afterTaxInterest, total].every(Number.isFinite)) { setResults(null); return; }
 setResults({
 principal: Math.round(principal),
 interest: Math.round(interest),
 taxAmount: Math.round(taxAmount),
 afterTaxInterest: Math.round(afterTaxInterest),
 total: Math.round(total),
 });
 }, [type, amount, rate, term, taxType, validInputs]);

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
 <PiggyBank className="w-5 h-5 text-primary" />
 저축 조건 설정
 </h2>
 <p className="mb-6 text-sm leading-6 text-muted-foreground">금액은 원 단위이며 고정 금리·단리로 계산합니다. 적금은 매달 같은 금액을 납입하는 예시로, 실제 납입일과 금융기관의 계산 방식에 따라 달라질 수 있습니다.</p>

 <div className="space-y-6">
 <SegmentedControl label="저축 방식" value={type} onChange={setType} options={[
 { value: "deposit", label: "예금 · 목돈 예치" },
 { value: "savings", label: "적금 · 매월 납입" },
 ]} />

 <div>
 <label htmlFor="deposit-amount" className="block text-sm font-medium text-muted-foreground mb-2">
 {type === "deposit" ? "예치 금액" : "월 납입 금액"}
 </label>
 <div className="relative">
 <input
 id="deposit-amount"
 type="number"
 inputMode="numeric"
 min="0"
 value={amount}
 onChange={(e) => setAmount(Number(e.target.value))}
 className="ms-field w-full tabular-nums"
 />
 </div>
 </div>

 <div>
 <label htmlFor="deposit-rate" className="block text-sm font-medium text-muted-foreground mb-2">
 연 이자율 (%)
 </label>
 <div className="relative">
 <input
 id="deposit-rate"
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
 <label htmlFor="deposit-term" className="block text-sm font-medium text-muted-foreground mb-2">
 저축 기간 (개월)
 </label>
 <div className="relative">
 <input
 id="deposit-term"
 type="number"
 inputMode="numeric"
 min="1"
 max="600"
 value={term}
 onChange={(e) => setTerm(Number(e.target.value))}
 className="ms-field w-full tabular-nums"
 />
 </div>
 </div>

 <SegmentedControl label="과세 구분" value={taxType} onChange={setTaxType} options={[
 { value: "normal", label: "일반 15.4%" },
 { value: "preferential", label: "세금우대 9.5%" },
 { value: "none", label: "비과세 0%" },
 ]} description="세율은 비교용 선택값입니다. 실제 세금우대·비과세 적용 여부는 가입 상품과 자격을 확인하세요." />
 {!validInputs && <p role="status" className="ms-status-error rounded-lg p-3 text-sm">금액과 금리는 0 이상, 기간은 1~600개월의 정수로 입력해 주세요.</p>}
 </div>
 </section>

 {/* Summary */}
 <section
 className="ms-panel flex flex-col justify-center"
 >
 <div className="text-center mb-8">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-link mb-4">
 <TrendingUp className="w-8 h-8" />
 </div>
 <h3 className="text-muted-foreground font-medium">만기 수령액 (세후)</h3>
 <div className="text-3xl sm:text-4xl font-black text-foreground mt-2 tracking-tight tabular-nums break-words">
 {results ? formatMoney(results.total) : "-"}
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex justify-between items-center gap-2 p-3 bg-secondary/50 rounded-xl border border-border min-w-0">
 <span className="text-muted-foreground">원금 합계</span>
 <span className="font-bold text-foreground tabular-nums break-words">{results ? formatMoney(results.principal) : "-"}</span>
 </div>
 <div className="flex justify-between items-center gap-2 p-3 bg-secondary/50 rounded-xl border border-border min-w-0">
 <span className="text-muted-foreground">세전 이자</span>
 <span className="font-bold text-foreground tabular-nums break-words">+{results ? formatMoney(results.interest) : "-"}</span>
 </div>
 <div className="flex justify-between items-center gap-2 p-3 bg-secondary/50 rounded-xl border border-border min-w-0">
 <span className="text-muted-foreground">이자 과세 ({taxType === "normal" ? "15.4%" : taxType === "preferential" ? "9.5%" : "0%"})</span>
 <span className="font-bold text-link tabular-nums break-words">-{results ? formatMoney(results.taxAmount) : "-"}</span>
 </div>
 </div>
 </section>
 </div>
 </div>
 );
}
