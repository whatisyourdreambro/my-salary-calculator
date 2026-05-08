"use client";

// src/app/tools/career/global-job-compare/page.tsx
// 글로벌 직업 비교 — 한국 vs 미국 vs 일본 vs 싱가포르 연봉·세금·생활비.

import { useState, useMemo } from "react";
import Link from "next/link";
import { Globe } from "lucide-react";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

interface CountryData {
 name: string;
 flag: string;
 currency: string;
 toKrw: number; // 1 단위 → 원
 taxRate: number; // 평균 실효세율
 livingCost: number; // 월 1인 가구 비용 (원 환산)
 socialSecurity: number; // 본인 부담 사회보험 비율
}

const COUNTRIES: Record<string, CountryData> = {
 korea: { name: "🇰🇷 한국", flag: "🇰🇷", currency: "KRW", toKrw: 1, taxRate: 0.15, livingCost: 2_000_000, socialSecurity: 0.094 },
 usa: { name: "🇺🇸 미국 (실리콘밸리)", flag: "🇺🇸", currency: "USD", toKrw: 1380, taxRate: 0.30, livingCost: 5_500_000, socialSecurity: 0.0765 },
 japan: { name: "🇯🇵 일본 (도쿄)", flag: "🇯🇵", currency: "JPY", toKrw: 8.8, taxRate: 0.20, livingCost: 2_500_000, socialSecurity: 0.15 },
 singapore: { name: "🇸🇬 싱가포르", flag: "🇸🇬", currency: "SGD", toKrw: 1020, taxRate: 0.10, livingCost: 4_000_000, socialSecurity: 0.20 },
 germany: { name: "🇩🇪 독일", flag: "🇩🇪", currency: "EUR", toKrw: 1480, taxRate: 0.32, livingCost: 3_200_000, socialSecurity: 0.20 },
 uk: { name: "🇬🇧 영국 (런던)", flag: "🇬🇧", currency: "GBP", toKrw: 1745, taxRate: 0.28, livingCost: 4_500_000, socialSecurity: 0.12 },
};

const JOB_SALARIES_BY_COUNTRY: Record<string, Record<string, number>> = {
 "backend-developer": {
 korea: 65_000_000, usa: 180_000, japan: 8_500_000, singapore: 95_000, germany: 70_000, uk: 65_000,
 },
 "data-scientist": {
 korea: 80_000_000, usa: 200_000, japan: 9_500_000, singapore: 110_000, germany: 80_000, uk: 75_000,
 },
 "doctor": {
 korea: 200_000_000, usa: 350_000, japan: 13_000_000, singapore: 180_000, germany: 110_000, uk: 100_000,
 },
 "marketing-manager": {
 korea: 65_000_000, usa: 130_000, japan: 7_000_000, singapore: 80_000, germany: 60_000, uk: 55_000,
 },
 "product-manager": {
 korea: 75_000_000, usa: 200_000, japan: 9_000_000, singapore: 110_000, germany: 80_000, uk: 75_000,
 },
 "designer": {
 korea: 55_000_000, usa: 140_000, japan: 6_500_000, singapore: 75_000, germany: 60_000, uk: 55_000,
 },
};

export default function GlobalJobComparePage() {
 const [job, setJob] = useState("backend-developer");
 const [selectedCountries, setSelectedCountries] = useState<string[]>(["korea", "usa", "japan"]);

 const result = useMemo(() => {
 return selectedCountries.map((countryKey) => {
 const country = COUNTRIES[countryKey];
 const salary = JOB_SALARIES_BY_COUNTRY[job][countryKey];
 const salaryKrw = countryKey === "korea" ? salary : Math.round(salary * country.toKrw);
 const annualLocalSalary = salary;
 const annualSalaryKrw = countryKey === "korea" ? salary : Math.round(salary * country.toKrw);
 const taxAmount = annualSalaryKrw * country.taxRate;
 const socialSecurityAmount = annualSalaryKrw * country.socialSecurity;
 const annualNet = annualSalaryKrw - taxAmount - socialSecurityAmount;
 const monthlyNet = annualNet / 12;
 const monthlySaving = monthlyNet - country.livingCost;
 return {
 country,
 countryKey,
 annualLocalSalary,
 annualSalaryKrw,
 monthlyNetKrw: monthlyNet,
 monthlySavingKrw: monthlySaving,
 livingCost: country.livingCost,
 taxAmount,
 socialSecurityAmount,
 annualNet,
 };
 });
 }, [job, selectedCountries]);

 const toggleCountry = (key: string) => {
 setSelectedCountries((prev) =>
 prev.includes(key) ? prev.filter((c) => c !== key) : prev.length < 4 ? [...prev, key] : prev
 );
 };

 const sortedResult = [...result].sort((a, b) => b.monthlySavingKrw - a.monthlySavingKrw);

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-8">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Globe className="w-4 h-4" /> 글로벌 직업 비교
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 <span className="text-electric">글로벌</span> 직업 비교
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">한국 vs 미국·일본·싱가포르·독일·영국</p>
 </div>

 <section className="bg-white p-6 rounded-2xl border border-canvas mb-4">
 <label className="text-xs font-bold text-muted-blue block mb-2">직업 선택</label>
 <select value={job} onChange={(e) => setJob(e.target.value)} className="w-full border border-canvas rounded-xl px-4 py-3 mb-4 font-black text-navy outline-none focus:border-primary">
 <option value="backend-developer">백엔드 개발자</option>
 <option value="data-scientist">데이터 사이언티스트</option>
 <option value="doctor">의사 (전문의)</option>
 <option value="marketing-manager">마케팅 매니저</option>
 <option value="product-manager">프로덕트 매니저</option>
 <option value="designer">디자이너</option>
 </select>

 <label className="text-xs font-bold text-muted-blue block mb-2">비교 국가 (최대 4개)</label>
 <div className="grid grid-cols-3 gap-2">
 {Object.entries(COUNTRIES).map(([key, c]) => (
 <button key={key} onClick={() => toggleCountry(key)} className={`py-3 rounded-xl text-sm font-black ${selectedCountries.includes(key) ? "bg-primary text-navy" : "bg-canvas-dark text-muted-blue"}`}>
 {c.name}
 </button>
 ))}
 </div>
 </section>

 <section className="space-y-3 mb-4">
 {sortedResult.map((r, i) => (
 <div key={r.countryKey} className={`p-5 rounded-2xl border-2 ${i === 0 ? "border-success bg-success/5" : "border-canvas bg-white"}`}>
 <div className="flex items-center justify-between mb-2">
 <p className="text-base font-black text-navy">{i === 0 && "👑 "}{r.country.name}</p>
 <p className="text-xs text-electric font-black">{i + 1}위</p>
 </div>
 <div className="grid grid-cols-2 gap-3 text-sm">
 <div>
 <p className="text-xs text-muted-blue">연봉 (현지)</p>
 <p className="font-black text-navy">{r.country.currency === "KRW" ? `${fmt(r.annualLocalSalary / 10000)}만원` : `${fmt(r.annualLocalSalary)} ${r.country.currency}`}</p>
 </div>
 <div>
 <p className="text-xs text-muted-blue">원화 환산</p>
 <p className="font-black text-navy">{fmt(r.annualSalaryKrw / 10000)}만원</p>
 </div>
 <div>
 <p className="text-xs text-muted-blue">세후 월 실수령</p>
 <p className="font-black text-electric">{fmt(r.monthlyNetKrw)}원</p>
 </div>
 <div>
 <p className="text-xs text-muted-blue">월 가용 (생활비 차감)</p>
 <p className={`font-black ${r.monthlySavingKrw > 0 ? "text-success" : "text-electric"}`}>
 {r.monthlySavingKrw > 0 ? "+" : ""}{fmt(r.monthlySavingKrw)}원
 </p>
 </div>
 </div>
 <div className="mt-3 pt-3 border-t border-canvas">
 <p className="text-xs text-muted-blue">세금 약 {(r.country.taxRate * 100).toFixed(0)}% + 사회보험 {(r.country.socialSecurity * 100).toFixed(0)}% + 생활비 {fmt(r.livingCost)}원</p>
 </div>
 </div>
 ))}
 </section>

 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-4">
 <h2 className="text-sm font-black text-navy mb-2">💡 글로벌 이주 고려사항</h2>
 <ul className="text-xs text-muted-blue space-y-1 leading-relaxed">
 <li>• 미국: 연봉 최고지만 의료비·교육비·렌트 매우 높음</li>
 <li>• 일본: 연봉 한국과 유사하지만 사회보험 부담 큼 (15%+)</li>
 <li>• 싱가포르: 세금 낮음 (10%) + 영어 가능 + 생활비 매우 높음</li>
 <li>• 독일: 세금 매우 높음 (32%) + 의료·교육 무료 + 안정성</li>
 <li>• 영국: 세금 + 런던 렌트 매우 높음. 비EU 비자 어려움</li>
 </ul>
 </section>

 <section className="grid grid-cols-3 gap-2 mb-4">
 <Link href="/digital-nomad-2026" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">디지털 노마드</p>
 </Link>
 <Link href="/job/backend-developer/salary" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">한국 직업 평균</p>
 </Link>
 <Link href="/fx-dashboard" className="bg-white p-3 rounded-xl border border-canvas hover:border-electric transition text-center">
 <p className="text-xs font-black text-navy">환율</p>
 </Link>
 </section>

 <section className="bg-white p-5 rounded-2xl border border-canvas">
 <p className="text-xs text-muted-blue leading-relaxed">
 ※ 본 시뮬은 추정값입니다. 환율·세제·생활비는 실시간 변동. 실제 이주 결정은 본인 직군의 현지 채용 시장·비자·언어·문화 종합 검토 필요.
 </p>
 </section>
 </div>
 </main>
 );
}
