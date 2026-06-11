"use client";

import { useState } from "react";
import Link from "next/link";
import { CalcResultAd } from "@/components/AdPlacement";
import {
 earnedIncomeDeduction,
 calcKrProgressiveTax,
 krSocialInsurance,
} from "@/lib/global/taxEngine";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
export default function FlatTaxPage() {
 const [annualSalary, setAnnualSalary] = useState(60000000);

 // Simplified Tax Logic (2026) — taxEngine 의 KR 누진 전 구간(6~45%) 재사용
 const calculateTaxes = (gross: number) => {
 // 1. Progressive Tax (Standard)
 // Insurance: pension 4.75% (monthly cap 6.37M KRW) + health 3.595% + LTC + employment 0.9%
 const insurance = krSocialInsurance(gross);
 const standardDeduction = 1500000; // Basic personal deduction
 // Earned-income deduction (2026 standard brackets, capped at 20M KRW)
 const taxableProgressive =
 gross - earnedIncomeDeduction(gross) - insurance - standardDeduction;

 const taxProgressive = calcKrProgressiveTax(taxableProgressive);

 // 2. Flat Tax (19%)
 // No deductions allowed for flat tax
 const taxFlat = gross * 0.19;

 return {
 progressive: {
 tax: taxProgressive,
 net: gross - insurance - taxProgressive,
 rate: (taxProgressive / gross) * 100
 },
 flat: {
 tax: taxFlat,
 net: gross - insurance - taxFlat, // Insurance is still deducted? Actually Flat Tax usually replaces Income Tax, insurance is separate. Assuming insurance applies to both.
 rate: 19
 }
 };
 };

 const result = calculateTaxes(annualSalary);
 const isFlatBetter = result.flat.net > result.progressive.net;
 const savings = Math.abs(result.flat.net - result.progressive.net);

 const formatCurrency = (val: number) => Math.round(val).toLocaleString('ko-KR');

 return (
 <div className="min-h-screen py-12">
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <Link href="/en" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
 <ArrowLeft className="w-4 h-4 mr-2" />
 Back to English Hub
 </Link>

 

 <div className="text-center mb-12">
 <h1 className="text-3xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-primary/80">
 19% Flat Tax Calculator
 </h1>
 <p className="text-xl text-muted-foreground">
 Should you choose the 19% Flat Tax rate? Find out now.
 </p>
 </div>

 <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 mb-8">
 <div className="mb-8">
 <label className="block text-lg font-bold mb-4">Annual Gross Salary (KRW)</label>
 <input
 type="range"
 min="30000000"
 max="300000000"
 step="1000000"
 value={annualSalary}
 onChange={(e) => setAnnualSalary(Number(e.target.value))}
 className="w-full accent-blue-500 mb-4"
 />
 <div className="flex items-center justify-between">
 <input
 type="number"
 value={annualSalary}
 onChange={(e) => setAnnualSalary(Number(e.target.value))}
 className="bg-secondary/50 border border-border rounded-lg p-2 text-xl font-bold w-48"
 />
 <span className="text-2xl font-bold text-primary">{formatCurrency(annualSalary / 10000)} Man Won</span>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Progressive Tax Card */}
 <div className={`p-6 rounded-2xl border-2 transition-all ${!isFlatBetter ? 'border-primary bg-primary/10' : 'border-white/10 bg-secondary/20'}`}>
 <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
 Standard Progressive Tax
 {!isFlatBetter && <CheckCircle className="w-5 h-5 text-primary" />}
 </h3>
 <div className="space-y-2">
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Estimated Tax</span>
 <span>{formatCurrency(result.progressive.tax)} KRW</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Effective Rate</span>
 <span>{result.progressive.rate.toFixed(1)}%</span>
 </div>
 <div className="pt-4 border-t border-white/10 mt-4">
 <div className="text-sm text-muted-foreground mb-1">Annual Net Pay</div>
 <div className="text-2xl font-black">{formatCurrency(result.progressive.net)} KRW</div>
 </div>
 </div>
 </div>

 {/* Flat Tax Card */}
 <div className={`p-6 rounded-2xl border-2 transition-all ${isFlatBetter ? 'border-primary bg-primary/10' : 'border-white/10 bg-secondary/20'}`}>
 <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
 19% Flat Tax
 {isFlatBetter && <CheckCircle className="w-5 h-5 text-primary" />}
 </h3>
 <div className="space-y-2">
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Fixed Tax</span>
 <span>{formatCurrency(result.flat.tax)} KRW</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Fixed Rate</span>
 <span>19.0%</span>
 </div>
 <div className="pt-4 border-t border-white/10 mt-4">
 <div className="text-sm text-muted-foreground mb-1">Annual Net Pay</div>
 <div className="text-2xl font-black">{formatCurrency(result.flat.net)} KRW</div>
 </div>
 </div>
 </div>
 </div>

 <div className="mt-8 text-center">
 {isFlatBetter ? (
 <motion.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 className="inline-block bg-primary/50 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
 >
 🎉 The Flat Tax saves you {formatCurrency(savings)} KRW per year!
 </motion.div>
 ) : (
 <motion.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg"
 >
 👍 Stick with the Standard Tax! You save {formatCurrency(savings)} KRW.
 </motion.div>
 )}
 <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto">
 * This is a simplified estimation. The Flat Tax (19%) generally benefits high earners (usually above ~140M KRW gross). Consult a tax professional for exact figures.
 </p>
 </div>
 </div>

 {/* Ad: right below the comparison result */}
 <CalcResultAd />

 </div>
 {/* page-end ads are provided by en/layout.tsx (PageFooterAds) — 페이지 자체 중복 제거 */}
 </div>
 );
}
