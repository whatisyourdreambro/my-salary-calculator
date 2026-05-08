"use client";

// src/app/tools/family/child-cost-projection/page.tsx
// 자녀 양육비 시뮬 — 출생부터 대학 졸업까지 22년 누적.

import { useState, useMemo } from "react";
import Link from "next/link";
import { Baby, AlertTriangle } from "lucide-react";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

const MONTHLY_BY_AGE: { age: number; monthly: number; note: string }[] = [
 { age: 0, monthly: 800_000, note: "신생아·영아" },
 { age: 3, monthly: 600_000, note: "어린이집·유치원" },
 { age: 7, monthly: 700_000, note: "초등학생" },
 { age: 13, monthly: 1_000_000, note: "중·고등 사교육" },
 { age: 19, monthly: 1_500_000, note: "대학 등록금·생활비" },
];

export default function ChildCostProjectionPage() {
 const [childCount, setChildCount] = useState(1);
 const [eduStyle, setEduStyle] = useState<"public" | "moderate" | "premium">("moderate");
 const [includesUniversity, setIncludesUniversity] = useState(true);
 const [governmentSupport, setGovernmentSupport] = useState(true);

 const result = useMemo(() => {
 // 교육 스타일에 따른 배수
 const eduMultiplier = eduStyle === "public" ? 0.7 : eduStyle === "premium" ? 1.6 : 1.0;

 // 정부 지원 차감 (월 약 30만 — 0~7세)
 const governmentDeduction = governmentSupport ? 300_000 * 12 * 8 : 0;

 // 출생~22세 또는 18세
 const endAge = includesUniversity ? 22 : 18;

 let totalPerChild = 0;
 const breakdown: { phase: string; total: number }[] = [];

 for (let yearOffset = 0; yearOffset < MONTHLY_BY_AGE.length; yearOffset++) {
 const segment = MONTHLY_BY_AGE[yearOffset];
 const nextSegment = MONTHLY_BY_AGE[yearOffset + 1];
 const startAge = segment.age;
 const segmentEnd = nextSegment ? Math.min(nextSegment.age, endAge) : endAge;
 const years = Math.max(0, segmentEnd - startAge);
 const monthly = segment.monthly * eduMultiplier;
 const phaseTotal = monthly * 12 * years;
 totalPerChild += phaseTotal;
 if (years > 0) breakdown.push({ phase: `${startAge}~${segmentEnd - 1}세 (${segment.note})`, total: phaseTotal });
 if (segmentEnd >= endAge) break;
 }

 // 정부 지원 차감
 totalPerChild = Math.max(0, totalPerChild - governmentDeduction);

 const totalAllChildren = totalPerChild * childCount;
 const monthlyAvg = totalPerChild / (endAge * 12);

 return { totalPerChild, totalAllChildren, monthlyAvg, breakdown, endAge, governmentDeduction };
 }, [childCount, eduStyle, includesUniversity, governmentSupport]);

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-8">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Baby className="w-4 h-4" /> 자녀 양육비 시뮬
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 <span className="text-electric">자녀 양육비</span> 시뮬레이터
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">출생~대학 졸업까지 22년 누적</p>
 </div>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <label className="text-xs font-bold text-muted-blue block mb-2">자녀 수</label>
 <div className="flex gap-2 mb-4">
 {[1, 2, 3].map((n) => (
 <button key={n} onClick={() => setChildCount(n)} className={`flex-1 py-3 rounded-xl font-black ${childCount === n ? "bg-primary text-navy" : "bg-canvas-dark text-muted-blue"}`}>
 {n}자녀
 </button>
 ))}
 </div>

 <label className="text-xs font-bold text-muted-blue block mb-2">교육 스타일</label>
 <div className="grid grid-cols-3 gap-2 mb-4">
 {[
 { v: "public" as const, label: "🟢 검소", desc: "공립 위주" },
 { v: "moderate" as const, label: "🟡 보통", desc: "평균" },
 { v: "premium" as const, label: "🔴 프리미엄", desc: "사립·고급" },
 ].map((opt) => (
 <button key={opt.v} onClick={() => setEduStyle(opt.v)} className={`py-3 rounded-xl text-sm font-black ${eduStyle === opt.v ? "bg-primary text-navy" : "bg-canvas-dark text-muted-blue"}`}>
 <div>{opt.label}</div>
 <div className="text-[10px] opacity-70">{opt.desc}</div>
 </button>
 ))}
 </div>

 <label className="flex items-center gap-2 mb-2">
 <input type="checkbox" checked={includesUniversity} onChange={(e) => setIncludesUniversity(e.target.checked)} className="w-4 h-4" />
 <span className="text-sm text-navy font-bold">대학 등록금 포함 (4년)</span>
 </label>
 <label className="flex items-center gap-2">
 <input type="checkbox" checked={governmentSupport} onChange={(e) => setGovernmentSupport(e.target.checked)} className="w-4 h-4" />
 <span className="text-sm text-navy font-bold">정부 지원 차감 (아동수당 등)</span>
 </label>
 </section>

 <section className="bg-primary p-8 rounded-3xl text-center mb-4">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">자녀 1명 양육비 ({result.endAge}년)</p>
 <p className="text-5xl font-black text-navy">{fmt(result.totalPerChild / 10000)}만원</p>
 <p className="text-sm text-navy/70 mt-2">월 평균 {fmt(result.monthlyAvg)}원</p>
 </section>

 {childCount > 1 && (
 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-4 text-center">
 <p className="text-xs font-black text-navy uppercase tracking-widest mb-1">{childCount}자녀 총 양육비</p>
 <p className="text-3xl font-black text-electric">{fmt(result.totalAllChildren / 10000)}만원</p>
 </section>
 )}

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <h2 className="text-base font-black text-navy mb-3">📊 단계별 누적</h2>
 <div className="space-y-2 text-sm">
 {result.breakdown.map((b) => (
 <div key={b.phase} className="flex justify-between border-b border-canvas pb-2">
 <span className="text-muted-blue">{b.phase}</span>
 <span className="font-black text-navy">{fmt(b.total / 10000)}만</span>
 </div>
 ))}
 {governmentSupport && (
 <div className="flex justify-between text-success">
 <span>정부 지원 차감</span>
 <span className="font-black">-{fmt(result.governmentDeduction / 10000)}만</span>
 </div>
 )}
 </div>
 </section>

 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-4">
 <h2 className="text-sm font-black text-navy mb-2 flex items-center gap-2">
 <AlertTriangle className="w-4 h-4 text-electric" /> 절감 포인트
 </h2>
 <ul className="text-xs text-muted-blue space-y-1 leading-relaxed">
 <li>• 국공립 어린이집·유치원 → 사립 대비 50% 절감</li>
 <li>• 사교육 1과목 줄이면 월 20~30만 절약</li>
 <li>• 국가장학금 + 학자금 대출 활용 (대학 비용)</li>
 <li>• 자녀 적금 + 청년·신혼희망 주택 활용 (장기 자산)</li>
 </ul>
 </section>

 <section className="grid grid-cols-3 gap-2 mb-4">
 <Link href="/calc/child-savings-target" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">자녀 적금</p>
 </Link>
 <Link href="/calc/child-tax-credit" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">자녀 세액공제</p>
 </Link>
 <Link href="/calc/birth-allowance" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">아동수당</p>
 </Link>
 </section>
 </div>
 </main>
 );
}
