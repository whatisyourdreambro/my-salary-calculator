"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { CalcResultAd } from "@/components/AdPlacement";
import { GlobalTaxEngine, COUNTRY_NAMES, CountryCode, PPP_INDEX, TaxResult } from "@/lib/global/taxEngine";
import { Globe, TrendingUp, Info } from "lucide-react";

// PPP BarChart(recharts)는 지연 로드 — recharts가 무거워 First Load 에서 제외.
const SalaryConverterChart = dynamic(() => import("@/components/charts/SalaryConverterChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-canvas-100" />,
});

interface ConvertedResult extends TaxResult {
  netInUSD: number;
  pppAdjustedNetUSD: number;
  countryName: string;
  flag: string;
}

export default function SalaryConverterPage() {
  const [salaryKRW, setSalaryKRW] = useState<number>(60000000);

  // 입력에서 파생되는 결과 — useState(() => {...}) 변칙 호출 대신 useMemo 로 계산
  const results = useMemo<ConvertedResult[]>(() => {
    const countries: CountryCode[] = ['KR', 'US', 'JP', 'SG', 'UK'];
    return countries.map(code => {
      const taxResult = GlobalTaxEngine.calculate(salaryKRW, code);
      let netInUSD = 0;
      if (code === 'KR') netInUSD = taxResult.net * 0.00075;
      else if (code === 'US') netInUSD = taxResult.net;
      else if (code === 'JP') netInUSD = taxResult.net * (0.00075 / 0.11);
      else if (code === 'SG') netInUSD = taxResult.net * 0.75;
      else if (code === 'UK') netInUSD = taxResult.net * 1.25;
      const pppAdjustedNetUSD = netInUSD / PPP_INDEX[code];
      return {
        ...taxResult,
        netInUSD,
        pppAdjustedNetUSD,
        countryName: COUNTRY_NAMES[code].name,
        flag: COUNTRY_NAMES[code].flag,
      };
    });
  }, [salaryKRW]);

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalaryKRW(Number(e.target.value));
  };

  return (
    <main className="w-full min-h-screen bg-canvas pb-20">
      {/* Hero */}
      <div className="relative bg-primary py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/10 rounded-full blur-[120px]" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white/90 text-sm font-bold mb-6">
            <Globe className="w-4 h-4" />
            Global Salary Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white">
            Global Salary Converter
            <span className="block text-white/80 text-3xl md:text-4xl mt-2">
              Real Purchasing Power (PPP)
            </span>
          </h1>
          <p className="text-white/75 text-lg max-w-2xl mx-auto">
            Compare your salary against the world. We calculate taxes and cost of living to show you the "Real Feel" value of your income in Silicon Valley, Tokyo, and London.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        {/* Input Section */}
        <div className="bg-white border border-canvas-200 rounded-2xl p-8 shadow-card mb-10">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-canvas-600 font-medium mb-2 text-sm">
                Annual Salary (KRW)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={salaryKRW}
                  onChange={handleSalaryChange}
                  className="w-full bg-canvas border border-canvas-200 rounded-xl py-4 px-4 text-2xl font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-canvas-500 font-bold text-sm">KRW</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-canvas-500">
            <span className="flex items-center gap-1"><Info className="w-4 h-4" /> 1 USD ≈ 1,330 KRW</span>
            <span className="flex items-center gap-1"><Info className="w-4 h-4" /> Results update as you type</span>
            <span className="flex items-center gap-1"><Info className="w-4 h-4" /> Simplified estimate (2026 rates)</span>
          </div>
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white border border-canvas-200 rounded-2xl p-6 shadow-card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Real Purchasing Power (Net USD)
            </h3>
            <div className="h-[300px] w-full">
              <SalaryConverterChart data={results} />
            </div>
            <p className="text-center text-sm text-canvas-500 mt-4">
              * Adjusted for Cost of Living (PPP). Higher is better.
            </p>
          </div>
          <div className="bg-white border border-canvas-200 rounded-2xl p-6 shadow-card flex flex-col justify-center">
            <h3 className="text-lg font-bold mb-4 text-foreground">What is PPP?</h3>
            <p className="text-canvas-600 text-sm leading-relaxed">
              Purchasing Power Parity (PPP) adjusts income for the cost of living in each country. A $50,000 salary in Seoul goes further than the same amount in San Francisco.
            </p>
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-primary text-sm font-semibold">Korea&apos;s Hidden Advantage</p>
              <p className="text-canvas-600 text-xs mt-1">Low housing costs, subsidized healthcare, and affordable dining make Korean salaries stretch further than raw numbers suggest.</p>
            </div>
          </div>
        </div>

        {/* Detailed Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((res) => (
            <motion.div
              key={res.country}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative p-6 rounded-2xl border bg-white shadow-card ${res.country === 'KR' ? 'border-primary/30 ring-1 ring-primary/20' : 'border-canvas-200'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-4xl mb-2">{res.flag}</div>
                  <h3 className="text-lg font-bold text-foreground">{res.countryName}</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${res.effectiveRate > 30 ? 'bg-canvas-100 text-canvas-700' : 'bg-primary/10 text-primary'}`}>
                  Tax {res.effectiveRate.toFixed(1)}%
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-canvas-500">Gross Income</span>
                  <span className="font-mono text-foreground">{Math.round(res.gross).toLocaleString('ko-KR')} {res.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-canvas-500">Net Income</span>
                  <span className="font-mono font-bold text-foreground">{Math.round(res.net).toLocaleString('ko-KR')} {res.currency}</span>
                </div>
                <div className="pt-3 border-t border-canvas-100 flex justify-between items-center">
                  <span className="text-sm text-primary font-bold">Real Value (PPP)</span>
                  <span className="text-xl font-black text-primary">
                    ${Math.round(res.pppAdjustedNetUSD).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
              {res.country === 'KR' && (
                <div className="absolute top-3 right-3 text-xs bg-primary text-white px-2 py-0.5 rounded-full font-bold">YOU</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Ad: right below the result cards */}
        <CalcResultAd />
      </div>
      {/* page-end ads are provided by en/layout.tsx (PageFooterAds) — 페이지 자체 중복 제거 */}
    </main>
  );
}
