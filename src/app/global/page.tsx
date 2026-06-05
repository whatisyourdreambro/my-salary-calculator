"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import PageFooterAds from "@/components/PageFooterAds";
import { ArrowLeft, Globe } from "lucide-react";

// 국가별 실수령액 BarChart(recharts)는 지연 로드 — recharts가 무거워 First Load 에서 제외.
const GlobalChart = dynamic(() => import("@/components/charts/GlobalChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-canvas-100" />,
});

export default function GlobalTaxPage() {
  const [salaryKRW, setSalaryKRW] = useState(60000000);

  const RATES = {
    USD: 1350,
    JPY: 9,
    SGD: 1000,
  };

  const calculateGlobalNet = (grossKRW: number) => {
    const krNet = grossKRW * 0.84;
    const usNetKRW = (grossKRW / RATES.USD) * 0.72 * RATES.USD;
    const jpNetKRW = (grossKRW / RATES.JPY) * 0.78 * RATES.JPY;
    const sgNetKRW = (grossKRW / RATES.SGD) * 0.92 * RATES.SGD;

    return [
      { name: "한국 🇰🇷",      net: krNet,    gross: grossKRW, color: "#10B981" },
      { name: "미국(CA) 🇺🇸",  net: usNetKRW, gross: grossKRW, color: "#3B82F6" },
      { name: "일본 🇯🇵",      net: jpNetKRW, gross: grossKRW, color: "#F59E0B" },
      { name: "싱가포르 🇸🇬",  net: sgNetKRW, gross: grossKRW, color: "#8B5CF6" },
    ];
  };

  const data = calculateGlobalNet(salaryKRW);
  const fmt = (val: number) => Math.round(val / 10000).toLocaleString("ko-KR");

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          홈으로 돌아가기
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#0145F2] to-primary/80">
            국가별 연봉 비교
          </h1>
          <p className="text-xl text-muted-foreground">
            내 한국 연봉, 해외에서는 얼마나 받는 걸까요? <br />
            실수령액과 세금 효율을 국가별로 비교해보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 설정 */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                설정
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    세전 연간 소득 (원)
                  </label>
                  <input
                    type="range"
                    min="30000000"
                    max="200000000"
                    step="1000000"
                    value={salaryKRW}
                    onChange={(e) => setSalaryKRW(Number(e.target.value))}
                    className="w-full accent-[#0145F2] mb-4"
                  />
                  <div className="text-right font-bold text-electric text-2xl">
                    {fmt(salaryKRW)}만원
                  </div>
                </div>

                <div className="p-4 bg-secondary/30 rounded-xl text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">달러 환율</span>
                    <span>1 USD = {RATES.USD}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">엔화 환율</span>
                    <span>100 JPY = {RATES.JPY * 100}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">싱가포르달러</span>
                    <span>1 SGD = {RATES.SGD}원</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 결과 */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-8 text-center">예상 연간 실수령액 (원화 환산)</h3>

              <div className="w-full h-[350px]">
                <GlobalChart data={data} />
              </div>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                * 각국 단일 납세자 기준 평균 유효세율 추정치입니다. <br />
                실제 실수령액은 지역·공제항목에 따라 크게 달라질 수 있습니다.
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {data.map((item) => (
                <div key={item.name} className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
                  <div className="text-base font-bold mb-1" style={{ color: item.color }}>{item.name}</div>
                  <div className="text-xs text-muted-foreground mb-1">실수령액</div>
                  <div className="font-bold text-foreground text-lg">{fmt(item.net)}만원</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    세후 {Math.round((item.net / item.gross) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <PageFooterAds maxWidth="4xl" />
    </div>
  );
}
