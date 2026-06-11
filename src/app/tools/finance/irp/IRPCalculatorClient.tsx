"use client";

// 계산기 폼 + 결과만 담당하는 클라이언트 컴포넌트.
// 제목·FAQ·JSON-LD·가이드 본문은 서버 컴포넌트인 page.tsx가 보유한다 (이중 H1/FAQ 방지).
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

export default function IRPCalculatorClient() {
 const [salary, setSalary] = useState(50000000);
 const [irpAmount, setIrpAmount] = useState(9000000);
 const [pensionAmount, setPensionAmount] = useState(0);

 const result = useMemo(() => {
 const totalContrib = Math.min(irpAmount, 9000000) + Math.min(pensionAmount, 6000000);
 const deductibleBase = Math.min(totalContrib, 9000000);
 const rate = salary <= 55000000 ? 0.165 : 0.132;
 const taxCredit = Math.round(deductibleBase * rate);
 return { totalContrib, deductibleBase, taxCredit, rate };
 }, [salary, irpAmount, pensionAmount]);

 return (
 <div className="bg-white border border-canvas rounded-2xl p-8 shadow-sm">
 <div className="space-y-6">
 <div>
 <label className="block text-xs font-bold text-faint-blue mb-2 uppercase tracking-widest">연간 총급여 (원)</label>
 <input
 type="number"
 value={salary}
 onChange={e => setSalary(Number(e.target.value))}
 className="w-full border border-canvas rounded-xl px-4 py-3 text-navy font-bold text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
 />
 <p className="text-xs text-faint-blue mt-1">
 세액공제율: <strong className="text-primary">{salary <= 55000000 ? "16.5%" : "13.2%"}</strong> ({salary <= 55000000 ? "총급여 5,500만원 이하" : "총급여 5,500만원 초과"})
 </p>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-faint-blue mb-2 uppercase tracking-widest">IRP 납입액 (최대 900만원)</label>
 <input
 type="number"
 value={irpAmount}
 max={9000000}
 onChange={e => setIrpAmount(Math.min(9000000, Number(e.target.value)))}
 className="w-full border border-canvas rounded-xl px-4 py-3 text-navy font-bold focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-faint-blue mb-2 uppercase tracking-widest">연금저축 납입액 (최대 600만원)</label>
 <input
 type="number"
 value={pensionAmount}
 max={6000000}
 onChange={e => setPensionAmount(Math.min(6000000, Number(e.target.value)))}
 className="w-full border border-canvas rounded-xl px-4 py-3 text-navy font-bold focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
 />
 </div>
 </div>
 </div>

 {/* Result */}
 <motion.div
 key={result.taxCredit}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="mt-8 p-8 bg-primary rounded-xl text-center"
 >
 <p className="text-primary-foreground/70 text-sm font-bold uppercase tracking-widest mb-2">예상 세액공제 환급액</p>
 <p className="text-5xl font-black text-navy tracking-tight">
 {result.taxCredit.toLocaleString('ko-KR')}원
 </p>
 <p className="text-primary-foreground/70 text-sm mt-2">
 공제 대상 납입액: {result.deductibleBase.toLocaleString('ko-KR')}원 × {(result.rate * 100).toFixed(1)}%
 </p>
 </motion.div>

 {/* 안내 */}
 <div className="mt-6 p-4 bg-canvas border border-canvas rounded-xl flex gap-3">
 <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
 <p className="text-xs text-muted-blue leading-relaxed">
 본 계산기는 참고용이며, 실제 환급액은 다른 공제 항목과 합산하여 결정됩니다. 정확한 세액은 국세청 홈택스에서 확인하세요.
 </p>
 </div>
 </div>
 );
}
