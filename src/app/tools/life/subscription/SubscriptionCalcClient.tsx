"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, PlusCircle, Trash2, BarChart3 } from "lucide-react";
type Subscription = { name: string; amount: number; period: "monthly" | "yearly" };

const PRESETS: Subscription[] = [
 { name: "넷플릭스 (스탠다드)", amount: 13500, period: "monthly" },
 { name: "유튜브 프리미엄", amount: 14900, period: "monthly" },
 { name: "멜론", amount: 10900, period: "monthly" },
 { name: "쿠팡로켓와우", amount: 7890, period: "monthly" },
 { name: "ChatGPT Plus", amount: 27000, period: "monthly" },
 { name: "네이버 플러스", amount: 4900, period: "monthly" },
 { name: "Spotify", amount: 10900, period: "monthly" },
];

export default function SubscriptionCalcClient() {
 const [subs, setSubs] = useState<Subscription[]>([]);
 const [newName, setNewName] = useState("");
 const [newAmount, setNewAmount] = useState("");
 const [newPeriod, setNewPeriod] = useState<"monthly" | "yearly">("monthly");

 const monthlyTotal = subs.reduce((sum, s) => sum + (s.period === "monthly" ? s.amount : s.amount / 12), 0);
 const yearlyTotal = monthlyTotal * 12;

 const addPreset = (p: Subscription) => {
 if (!subs.find(s => s.name === p.name)) setSubs([...subs, p]);
 };

 const addCustom = () => {
 if (newName && Number(newAmount) > 0) {
 setSubs([...subs, { name: newName, amount: Number(newAmount), period: newPeriod }]);
 setNewName("");
 setNewAmount("");
 }
 };

 const remove = (i: number) => setSubs(subs.filter((_, idx) => idx !== i));

 return (
 <main className="w-full min-h-screen bg-white px-4 pt-28 pb-20 font-sans">
 <div className="max-w-3xl mx-auto">
 <div className="text-center mb-12 pb-10 border-b border-canvas">
 <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
 <h1 className="text-3xl font-black text-navy mb-3">구독 서비스 지출 계산기</h1>
 <p className="text-faint-blue font-medium">매월 나도 모르게 빠져나가는 구독료를 한눈에 파악하세요.</p>
 </div>

 <div className="grid md:grid-cols-2 gap-8 mt-8">
 {/* Left: Add Section */}
 <div className="space-y-6">
 <div className="border border-canvas rounded-2xl p-6">
 <h2 className="font-black text-navy mb-4 flex items-center gap-2"><PlusCircle size={18} className="text-primary" /> 빠른 추가</h2>
 <div className="grid grid-cols-2 gap-2">
 {PRESETS.map((p, i) => (
 <button key={i} onClick={() => addPreset(p)}
 className={`text-left p-3 rounded-xl text-xs font-bold border transition-all ${subs.find(s => s.name === p.name) ? "bg-primary/10 border-primary text-primary" : "border-canvas text-muted-blue hover:border-primary hover:bg-canvas"}`}
 >
 {p.name}<br /><span className="font-normal text-faint-blue">{p.amount.toLocaleString('ko-KR')}원/월</span>
 </button>
 ))}
 </div>
 </div>
 <div className="border border-canvas rounded-2xl p-6">
 <h2 className="font-black text-navy mb-4">직접 입력</h2>
 <div className="space-y-3">
 <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="서비스명" className="w-full border border-canvas rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
 <input value={newAmount} onChange={e => setNewAmount(e.target.value)} type="number" placeholder="금액 (원)" className="w-full border border-canvas rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
 <div className="grid grid-cols-2 gap-2">
 <button onClick={() => setNewPeriod("monthly")} className={`py-2 rounded-xl text-xs font-bold border transition-all ${newPeriod === "monthly" ? "bg-primary text-white border-primary" : "border-canvas text-muted-blue"}`}>월간</button>
 <button onClick={() => setNewPeriod("yearly")} className={`py-2 rounded-xl text-xs font-bold border transition-all ${newPeriod === "yearly" ? "bg-primary text-white border-primary" : "border-canvas text-muted-blue"}`}>연간</button>
 </div>
 <button onClick={addCustom} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">추가하기</button>
 </div>
 </div>
 </div>

 {/* Right: Results */}
 <div className="space-y-6">
 <div className="bg-primary rounded-2xl p-6 text-center">
 <BarChart3 className="w-8 h-8 text-navy/70 mx-auto mb-3" />
 <p className="text-navy/70 text-xs font-bold uppercase tracking-widest mb-1">월 구독 총액</p>
 <p className="text-4xl font-black text-navy">{Math.round(monthlyTotal).toLocaleString('ko-KR')}원</p>
 <div className="mt-4 pt-4 border-t border-white/20">
 <p className="text-navy/70 text-xs">연간 환산</p>
 <p className="text-xl font-black text-navy">{Math.round(yearlyTotal).toLocaleString('ko-KR')}원</p>
 </div>
 </div>

 <div className="border border-canvas rounded-2xl overflow-hidden">
 {subs.length === 0 ? (
 <div className="p-8 text-center text-faint-blue text-sm">구독 서비스를 추가해보세요</div>
 ) : (
 subs.map((s, i) => (
 <div key={i} className="flex justify-between items-center p-4 border-b border-canvas last:border-0">
 <div>
 <p className="font-bold text-navy text-sm">{s.name}</p>
 <p className="text-xs text-faint-blue">{s.period === "monthly" ? "월간" : "연간"}</p>
 </div>
 <div className="flex items-center gap-3">
 <span className="font-black text-primary text-sm">{s.amount.toLocaleString('ko-KR')}원</span>
 <button onClick={() => remove(i)} className="text-faint-blue hover:text-electric transition-colors"><Trash2 size={14} /></button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>

 <div className="mt-8">
 </div>
 </div>
 </main>
 );
}