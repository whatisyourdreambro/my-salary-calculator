"use client";

// src/app/tools/tax/savings-checkup/page.tsx
// 세금 절세 진단 — 본인 데이터 → 누락된 공제·세제 혜택 발견.

import { useState, useMemo } from "react";
import Link from "next/link";
import { Receipt, AlertTriangle, CheckCircle2 } from "lucide-react";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

interface Checkup {
 hasIRP: boolean;
 hasISA: boolean;
 cardSpending: number;
 medicalExpense: number;
 donationAmount: number;
 hasMonthlyRent: boolean;
 hasChildren: boolean;
 isMarriedThisYear: boolean;
 isUnder35Newcomer: boolean;
 hasNoranUmbrella: boolean;
}

export default function TaxSavingsCheckupPage() {
 const [annualIncome, setAnnualIncome] = useState(60_000_000);
 const [c, setC] = useState<Checkup>({
 hasIRP: false,
 hasISA: false,
 cardSpending: 18_000_000,
 medicalExpense: 1_500_000,
 donationAmount: 500_000,
 hasMonthlyRent: false,
 hasChildren: false,
 isMarriedThisYear: false,
 isUnder35Newcomer: false,
 hasNoranUmbrella: false,
 });

 const result = useMemo(() => {
 const refundRate = annualIncome <= 55_000_000 ? 0.165 : 0.132;
 const opportunities: { title: string; potential: number; reason: string }[] = [];

 if (!c.hasIRP) {
 opportunities.push({ title: "IRP·연금저축 가입", potential: Math.round(9_000_000 * refundRate), reason: "최대 900만 한도 × 환급률 = 최대 148만 환급. 노후 자금 + 절세." });
 }
 if (!c.hasISA) {
 opportunities.push({ title: "ISA 계좌 가입", potential: Math.round(2_000_000 * 0.055), reason: "5년 후 200만 비과세 (서민형 400만). 일반 계좌 대비 절세 약 11만/년." });
 }

 // 신용카드 공제 점검
 const cardThreshold = annualIncome * 0.25;
 if (c.cardSpending < cardThreshold) {
 opportunities.push({ title: "신용카드 사용액 점검", potential: 0, reason: `총급여 25% (${fmt(cardThreshold)}원) 미달. 초과분만 공제. 12월에 추가 사용 검토.` });
 } else {
 const cardDeductible = (c.cardSpending - cardThreshold) * 0.15;
 const cardRefund = Math.round(cardDeductible * refundRate);
 if (cardRefund > 0) opportunities.push({ title: "신용카드 공제 충분 활용", potential: cardRefund, reason: `현재 약 ${fmt(cardRefund)}원 환급. 체크카드·현금영수증 비중 늘리면 30% 공제 (체크카드)로 더 환급.` });
 }

 // 의료비
 const medThreshold = annualIncome * 0.03;
 if (c.medicalExpense > medThreshold) {
 const medRefund = Math.round((c.medicalExpense - medThreshold) * refundRate);
 opportunities.push({ title: "의료비 영수증 정리", potential: medRefund, reason: `총급여 3% 초과분만 공제 (${fmt(medThreshold)}원 임계). 본인 의료비는 한도 X. 안경·렌즈비 1인 50만 별도.` });
 }

 // 기부금
 if (c.donationAmount > 0) {
 const donationRefund = Math.round(c.donationAmount * 0.15);
 opportunities.push({ title: "기부금 세액공제", potential: donationRefund, reason: `15% 세액공제. 1천만 초과 30%. 정치자금 10만 100% 환급. 고향사랑기부 10만 100%.` });
 }

 // 월세 공제
 if (!c.hasMonthlyRent && annualIncome <= 70_000_000) {
 opportunities.push({ title: "월세 공제 신청 가능?", potential: Math.round(7_500_000 * 0.17), reason: `무주택 + 총급여 7천만 이하. 월세 영수증 + 임대차계약서. 한도 750만의 17% = 약 127만 환급.` });
 }

 // 결혼세액공제
 if (c.isMarriedThisYear) {
 opportunities.push({ title: "결혼세액공제 50만", potential: 500_000, reason: "혼인 신고한 해 또는 다음 해 1회 50만 세액공제 (총급여 7천만 이하). 부부 모두 신청 시 합 100만." });
 }

 // 자녀세액공제
 if (c.hasChildren) {
 opportunities.push({ title: "자녀세액공제 활용", potential: 800_000, reason: "1자녀 30만, 2자녀 50만(합), 3자녀 70만(합). 6세 이하 추가 100만 소득공제 별도." });
 }

 // 청년 중소기업 감면
 if (c.isUnder35Newcomer) {
 opportunities.push({ title: "중소기업 청년 취업자 감면", potential: 2_000_000, reason: "만 34세 이하 + 중소기업 5년간 90% 세액 감면. 한도 200만/년. 회사에 신청서 제출." });
 }

 // 노란우산 (사업자만)
 if (!c.hasNoranUmbrella) {
 opportunities.push({ title: "노란우산공제 (사업자)", potential: Math.round(5_000_000 * refundRate), reason: "사업자 전용. 연 500만 한도 소득공제. 최대 약 82만 절세 + 노후 자금. 직장인은 미적용." });
 }

 const totalPotential = opportunities.reduce((sum, o) => sum + o.potential, 0);
 opportunities.sort((a, b) => b.potential - a.potential);

 return { totalPotential, opportunities: opportunities.slice(0, 7) };
 }, [annualIncome, c]);

 const setField = (k: keyof Checkup, v: any) => setC((prev) => ({ ...prev, [k]: v }));

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-8">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Receipt className="w-4 h-4" /> 세금 절세 진단
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 <span className="text-electric">절세</span> 기회 진단
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">놓치고 있는 공제·세제 혜택 자동 발견</p>
 </div>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <label className="text-xs font-bold text-muted-blue uppercase tracking-widest block mb-2">총급여 (연)</label>
 <input type="number" value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-3 mb-4 font-black text-navy outline-none focus:border-primary" step={1_000_000} />

 <h3 className="text-sm font-black text-navy mt-4 mb-3">현재 절세 상태</h3>
 <div className="space-y-2">
 {[
 { key: "hasIRP" as const, label: "IRP·연금저축 가입", desc: "최대 900만 세액공제" },
 { key: "hasISA" as const, label: "ISA 계좌 가입", desc: "200만 비과세 (5년)" },
 { key: "hasMonthlyRent" as const, label: "월세 공제 신청", desc: "한도 750만 17%" },
 { key: "isMarriedThisYear" as const, label: "올해 혼인 신고", desc: "결혼세액공제 50만" },
 { key: "hasChildren" as const, label: "자녀 있음", desc: "자녀세액공제" },
 { key: "isUnder35Newcomer" as const, label: "만 34세 이하 중소기업 신입", desc: "5년 90% 감면" },
 { key: "hasNoranUmbrella" as const, label: "사업자 + 노란우산공제", desc: "사업자 전용" },
 ].map((opt) => (
 <label key={opt.key} className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition ${c[opt.key] ? "border-success bg-success/5" : "border-canvas hover:border-electric"}`}>
 <input type="checkbox" checked={c[opt.key] as boolean} onChange={(e) => setField(opt.key, e.target.checked)} className="w-5 h-5 mt-0.5" />
 <div>
 <p className="font-black text-navy text-sm">{opt.label}</p>
 <p className="text-xs text-muted-blue">{opt.desc}</p>
 </div>
 </label>
 ))}
 </div>

 <h3 className="text-sm font-black text-navy mt-6 mb-3">올해 지출</h3>
 <label className="text-xs font-bold text-muted-blue block mb-1">연 신용카드 사용액</label>
 <input type="number" value={c.cardSpending} onChange={(e) => setField("cardSpending", Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-2 mb-3 font-black text-navy outline-none focus:border-primary" step={1_000_000} />
 <label className="text-xs font-bold text-muted-blue block mb-1">연 의료비</label>
 <input type="number" value={c.medicalExpense} onChange={(e) => setField("medicalExpense", Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-2 mb-3 font-black text-navy outline-none focus:border-primary" step={100_000} />
 <label className="text-xs font-bold text-muted-blue block mb-1">연 기부금</label>
 <input type="number" value={c.donationAmount} onChange={(e) => setField("donationAmount", Number(e.target.value) || 0)} className="w-full border border-canvas rounded-xl px-4 py-2 font-black text-navy outline-none focus:border-primary" step={100_000} />
 </section>

 <section className="bg-primary p-6 rounded-3xl text-center mb-4">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-1">잠재 환급액 (모든 기회 활용 시)</p>
 <p className="text-4xl font-black text-navy">{fmt(result.totalPotential)}원</p>
 </section>

 <section className="bg-white p-6 rounded-2xl border border-canvas">
 <h2 className="text-base font-black text-navy mb-3 flex items-center gap-2">
 <AlertTriangle className="w-5 h-5 text-electric" /> 우선 액션
 </h2>
 <div className="space-y-3">
 {result.opportunities.map((o, i) => (
 <div key={i} className="flex gap-3">
 <div className="flex-shrink-0 w-7 h-7 bg-electric text-white rounded-full flex items-center justify-center font-black text-xs">{i + 1}</div>
 <div className="flex-1">
 <div className="flex justify-between items-start">
 <p className="font-black text-navy text-sm">{o.title}</p>
 {o.potential > 0 && <p className="text-sm font-black text-electric">+{fmt(o.potential)}원</p>}
 </div>
 <p className="text-xs text-muted-blue mt-1">{o.reason}</p>
 </div>
 </div>
 ))}
 </div>
 </section>

 <section className="grid grid-cols-3 gap-2 mt-4">
 <Link href="/year-end-tax" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">연말정산</p>
 </Link>
 <Link href="/tools/finance/irp" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">IRP 시뮬</p>
 </Link>
 <Link href="/year-end-tax-checklist" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">체크리스트</p>
 </Link>
 </section>
 </div>
 </main>
 );
}
