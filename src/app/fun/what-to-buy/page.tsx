"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Share2, PlusCircle } from "lucide-react";
import AdUnit from "@/components/AdUnit";
import { Slider } from "@/components/ui/slider";

export default function WhatToBuyPage() {
  const [budget, setBudget] = useState(100000);
  const [result, setResult] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const ITEMS = [
    { name: "치킨", price: 20000, desc: "오늘 저녁은 치킨이닭!" },
    { name: "커피", price: 5000, desc: "스타벅스 아메리카노" },
    { name: "넷플릭스 1년 구독", price: 150000, desc: "1년간의 여가 보장" },
    { name: "아이패드", price: 1000000, desc: "생산성 향상을 위한 투자" },
    { name: "맥북 프로", price: 3000000, desc: "전문가를 위한 궁극의 머신" },
    { name: "롤렉스 시계", price: 15000000, desc: "시간 그 이상의 가치" },
    { name: "포르쉐 911", price: 200000000, desc: "드림카의 대명사" },
    { name: "강남 꼬마빌딩", price: 5000000000, desc: "이제 당신도 건물주!" },
  ];

  const search = () => {
    setIsSearching(true);
    setResult(null);

    setTimeout(() => {
      const affordable = ITEMS.filter(item => item.price <= budget);
      if (affordable.length > 0) {
        const item = affordable[affordable.length - 1];
        const quantity = Math.floor(budget / item.price);
        setResult({ ...item, quantity });
      } else {
        setResult({ name: "아무것도 못 삼", price: 0, desc: "예산이 부족합니다.", quantity: 0 });
      }
      setIsSearching(false);
    }, 800);
  };

  return (
    <main className="w-full min-h-screen bg-white dark:bg-black px-4 pt-28 pb-20 font-sans">
      <div className="text-center mb-12 border-b border-gray-100 dark:border-gray-900 pb-10">
        <ShoppingBag className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-900 mb-3">
          플렉스(FLEX) 계산기
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          이 돈으로 무엇을 살 수 있을까요?
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <div className="toss-card p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-8">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                예산 (BUDGET)
              </span>
              <span className="text-3xl font-black text-slate-900 dark:text-slate-900 tabular-nums">
                {budget.toLocaleString()}<span className="text-lg text-slate-400 ml-1">원</span>
              </span>
            </div>
            <Slider
              min={1000}
              max={100000000}
              step={1000}
              value={[budget]}
              onValueChange={(v) => setBudget(v[0])}
              className="py-4"
            />
          </div>

          <div className="flex gap-4 mb-4">
            <button onClick={() => setBudget(b => b + 10000)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 rounded-sm font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">+1만</button>
            <button onClick={() => setBudget(b => b + 100000)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 rounded-sm font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">+10만</button>
            <button onClick={() => setBudget(b => b + 1000000)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 rounded-sm font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">+100만</button>
            <button onClick={() => setBudget(b => b + 10000000)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 rounded-sm font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">+1000만</button>
          </div>

          <button
            onClick={search}
            disabled={isSearching}
            className="w-full py-4 bg-primary hover:bg-primary/90 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Search className={isSearching ? "animate-pulse" : ""} size={18} />
            {isSearching ? "계산 중..." : "무엇을 살 수 있을까?"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="toss-card p-10 text-center border-t-4 border-t-primary shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">구매 가능 품목</p>
              <h2 className="text-4xl font-black text-primary mb-2">
                {result.name}
              </h2>
              {result.quantity > 1 && (
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 tabular-nums">
                  무려 {result.quantity}개!
                </p>
              )}
              <p className="text-slate-500 font-medium">{result.desc}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AdUnit slotId="5544332211" format="auto" label="What To Buy Ad" />
      </div>
    </main>
  );
}