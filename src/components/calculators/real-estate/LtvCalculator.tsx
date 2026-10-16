"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { Home, Calculator, Info } from "lucide-react";
import NumberInput from "@/components/NumberInput";
export default function LtvCalculator() {
 const fieldId = useId();
 const [price, setPrice] = useState("");
 const [loan, setLoan] = useState("");
 const [ltv, setLtv] = useState<number | null>(null);

 const calculateLTV = () => {
 const housePrice = Number(price.replace(/[^0-9]/g, ""));
 const loanAmount = Number(loan.replace(/[^0-9]/g, ""));

 if (housePrice > 0) {
 const ltvValue = (loanAmount / housePrice) * 100;
 setLtv(ltvValue);
 }
 };

 return (
 <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-canvas overflow-hidden">
 <div className="p-6 border-b border-canvas bg-canvas ">
 <h2 className="text-xl font-bold flex items-center gap-2">
 <Home className="w-5 h-5 text-primary" />
 LTV (주택담보대출비율) 계산기
 </h2>
 <p className="text-sm text-faint-blue mt-1">
 주택 가격 대비 대출 금액의 비율을 계산합니다.
 </p>
 </div>

 <div className="p-6 space-y-6">
 <div>
 <label htmlFor={`${fieldId}-price`} className="block text-sm font-bold mb-2">주택 가격 (원)</label>
 <NumberInput
 id={`${fieldId}-price`}
 type="text"
 value={price}
 onChange={(e) => setPrice(Number(e.target.value.replace(/[^0-9]/g, "")).toLocaleString('ko-KR'))}
 className="w-full p-3 rounded-xl border border-canvas bg-transparent text-lg font-bold"
 placeholder="500,000,000"
 />
 </div>

 <div>
 <label htmlFor={`${fieldId}-loan`} className="block text-sm font-bold mb-2">대출 금액 (원)</label>
 <NumberInput
 id={`${fieldId}-loan`}
 type="text"
 value={loan}
 onChange={(e) => setLoan(Number(e.target.value.replace(/[^0-9]/g, "")).toLocaleString('ko-KR'))}
 className="w-full p-3 rounded-xl border border-canvas bg-transparent text-lg font-bold"
 placeholder="300,000,000"
 />
 </div>

 <button
 onClick={calculateLTV}
 className="w-full py-4 bg-primary hover:bg-primary text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
 >
 <Calculator className="w-5 h-5" /> 계산하기
 </button>

 {ltv !== null && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-primary/5 rounded-xl p-6 text-center border border-primary "
 >
 <p className="text-sm text-faint-blue mb-1">당신의 LTV는</p>
 <p className="text-4xl font-black text-primary ">
 {ltv.toFixed(2)}%
 </p>
 <div className="mt-4 text-xs text-faint-blue text-left bg-white/20 p-3 rounded-lg">
 <p className="font-bold mb-1 flex items-center gap-1"><Info className="w-3 h-3" /> 참고</p>
 <p>입력 금액의 비율이며 지역 규정·자격·대출 상한·DSR을 자동 판정하지 않습니다. 실제 승인 조건은 금융기관에 확인하세요.</p>
 </div>
 </motion.div>
 )}
 </div>

 <div className="p-4 bg-canvas border-t border-canvas ">
 </div>
 </div>
 );
}
