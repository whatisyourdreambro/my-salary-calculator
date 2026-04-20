"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PiggyBank, TrendingUp, Info, ChevronDown } from "lucide-react";
const FAQ = [
 { q: "IRP와 연금저축 뭐가 다른가요?", a: "연금저축은 증권사·보험사·은행에서 가입 가능한 세액공제 상품이며, IRP(개인형퇴직연금)는 퇴직급여를 포함하여 본인이 추가 납입도 가능한 계좌입니다. 둘을 합산하여 연 900만원(IRP 최대 900만원, 연금저축 최대 600만원)까지 세액공제 받습니다. 자영업자·프리랜서는 IRP만 가능합니다." },
 { q: "세액공제율 16.5%와 13.2%는 어떻게 나뉘나요?", a: "총급여 5,500만원(종합소득 4,500만원) 이하면 세액공제율 16.5%, 초과면 13.2%가 적용됩니다. 지방소득세(10%)까지 포함된 최종 공제율입니다." },
 { q: "55세 전에 해지하면 어떻게 되나요?", a: "중도해지 시 기타소득세 16.5%가 부과됩니다. 단, '부득이한 인출 사유(의료비, 천재지변 등)'에 해당하면 3.3~5.5%의 연금소득세만 납부합니다." },
 { q: "투자 상품은 어떻게 고르나요?", a: "IRP 내에서는 위험자산(주식형 ETF 등) 70%, 안전자산(채권, 예금) 30% 이상 유지를 권장합니다. 30대는 S&P500 ETF 중심의 공격적 포트폴리오가, 50대 이상은 채권 혼합형이 일반적으로 유리합니다." },
];

export default function IRPCalculatorClient() {
 const [salary, setSalary] = useState(50000000);
 const [irpAmount, setIrpAmount] = useState(9000000);
 const [pensionAmount, setPensionAmount] = useState(0);
 const [openFaq, setOpenFaq] = useState<number | null>(null);

 const result = useMemo(() => {
 const totalContrib = Math.min(irpAmount, 9000000) + Math.min(pensionAmount, 6000000);
 const deductibleBase = Math.min(totalContrib, 9000000);
 const rate = salary <= 55000000 ? 0.165 : 0.132;
 const taxCredit = Math.round(deductibleBase * rate);
 return { totalContrib, deductibleBase, taxCredit, rate };
 }, [salary, irpAmount, pensionAmount]);

 return (
 <main className="w-full min-h-screen bg-white px-4 pt-28 pb-20 font-sans">
 <div className="max-w-3xl mx-auto">
 {/* Hero */}
 <div className="text-center mb-12 pb-10 border-b border-canvas">
 <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-sm mb-5 uppercase tracking-widest">
 2026 기준
 </div>
 <h1 className="text-3xl font-black text-navy mb-3">IRP·연금저축 세액공제 계산기</h1>
 <p className="text-faint-blue font-medium">납입액 입력 시 즉시 환급 세금액을 계산합니다.</p>
 </div>

 {/* Calculator */}
 <div className="bg-white border border-canvas rounded-2xl p-8 my-8 shadow-sm">
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

 {/* FAQ */}
 <div className="my-10">
 <h2 className="text-xl font-black text-navy mb-6 pb-3 border-b-2 border-primary">자주 묻는 질문 (FAQ)</h2>
 <div className="space-y-3">
 {FAQ.map((faq, i) => (
 <div key={i} className="border border-canvas rounded-xl overflow-hidden">
 <button
 onClick={() => setOpenFaq(openFaq === i ? null : i)}
 className="w-full flex justify-between items-center p-5 text-left hover:bg-canvas transition-colors"
 >
 <span className="font-bold text-navy text-sm pr-4">{faq.q}</span>
 <ChevronDown size={18} className={`text-faint-blue flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180 text-primary" : ""}`} />
 </button>
 {openFaq === i && (
 <div className="px-5 pb-5 text-sm text-muted-blue leading-relaxed border-t border-canvas">
 {faq.a}
 </div>
 )}
 </div>
 ))}
 </div>
 </div>

 </div>
 </main>
 );
}