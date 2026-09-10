"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Calculator, Info } from "lucide-react";
import NumberInput from "@/components/NumberInput";
export default function DsrCalculator() {
 const fieldId = useId();
 const [income, setIncome] = useState("");
 const [principal, setPrincipal] = useState(""); // Total annual principal repayment
 const [interest, setInterest] = useState(""); // Total annual interest repayment
 const [dsr, setDsr] = useState<number | null>(null);

 const calculateDSR = () => {
 const annualIncome = Number(income.replace(/[^0-9]/g, ""));
 const annualPrincipal = Number(principal.replace(/[^0-9]/g, ""));
 const annualInterest = Number(interest.replace(/[^0-9]/g, ""));

 if (annualIncome > 0) {
 const totalRepayment = annualPrincipal + annualInterest;
 const dsrValue = (totalRepayment / annualIncome) * 100;
 setDsr(dsrValue);
 }
 };

 return (
 <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-canvas overflow-hidden">
 <div className="p-6 border-b border-canvas bg-canvas ">
 <h2 className="text-xl font-bold flex items-center gap-2">
 <Building2 className="w-5 h-5 text-electric" />
 DSR (총부채원리금상환비율) 계산기
 </h2>
 <p className="text-sm text-faint-blue mt-1">
 연소득 대비 연간 대출 원리금 상환액 비율을 계산합니다.
 </p>
 </div>

 <div className="p-6 space-y-6">
 <div>
 <label htmlFor={`${fieldId}-income`} className="block text-sm font-bold mb-2">연소득 (원)</label>
 <NumberInput
 id={`${fieldId}-income`}
 type="text"
 value={income}
 onChange={(e) => setIncome(Number(e.target.value.replace(/[^0-9]/g, "")).toLocaleString('ko-KR'))}
 className="w-full p-3 rounded-xl border border-canvas bg-transparent text-foreground text-lg font-bold"
 placeholder="50,000,000"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label htmlFor={`${fieldId}-principal`} className="block text-sm font-bold mb-2">연간 원금 상환액</label>
 <NumberInput
 id={`${fieldId}-principal`}
 type="text"
 value={principal}
 onChange={(e) => setPrincipal(Number(e.target.value.replace(/[^0-9]/g, "")).toLocaleString('ko-KR'))}
 className="w-full p-3 rounded-xl border border-canvas bg-transparent text-foreground"
 placeholder="10,000,000"
 />
 </div>
 <div>
 <label htmlFor={`${fieldId}-interest`} className="block text-sm font-bold mb-2">연간 이자 상환액</label>
 <NumberInput
 id={`${fieldId}-interest`}
 type="text"
 value={interest}
 onChange={(e) => setInterest(Number(e.target.value.replace(/[^0-9]/g, "")).toLocaleString('ko-KR'))}
 className="w-full p-3 rounded-xl border border-canvas bg-transparent text-foreground"
 placeholder="2,000,000"
 />
 </div>
 </div>

 <button
 onClick={calculateDSR}
 className="w-full py-4 bg-primary hover:bg-electric text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
 >
 <Calculator className="w-5 h-5" /> 계산하기
 </button>

 {dsr !== null && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-canvas 900/20 rounded-xl p-6 text-center border border-electric "
 >
 <p className="text-sm text-faint-blue mb-1">당신의 DSR은</p>
 <p className="text-4xl font-black text-electric">
 {dsr.toFixed(2)}%
 </p>
 <div className="mt-4 text-xs text-faint-blue text-left bg-white/20 p-3 rounded-lg">
 <p className="font-bold mb-1 flex items-center gap-1"><Info className="w-3 h-3" /> 참고</p>
 <p>입력한 연간 원금·이자의 합계를 연소득으로 나눈 비율입니다. 대출별 산입 기준·규제 상한·승인 한도는 자동 판정하지 않습니다.</p>
 </div>
 </motion.div>
 )}
 </div>

 <div className="p-4 bg-canvas border-t border-canvas ">
 </div>
 </div>
 );
}
