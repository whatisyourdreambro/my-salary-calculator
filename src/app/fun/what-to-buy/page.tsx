"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Film, Pizza, Dumbbell, ShoppingBag, Car, Home, Plane, RefreshCw } from "lucide-react";
import CurrencyInput from "@/components/CurrencyInput";
import AdUnit from "@/components/AdUnit";

const items = [
  { name: "스타벅스 아메리카노", price: 4500, icon: Coffee, unit: "잔" },
  { name: "애플TV+ 프리미엄 구독", price: 17000, icon: Film, unit: "개월" },
  { name: "배달 한 끼", price: 25000, icon: Pizza, unit: "회" },
  { name: "헬스장 1개월 회원권", price: 50000, icon: Dumbbell, unit: "개월" },
  { name: "백화점 쇼핑백", price: 100000, icon: ShoppingBag, unit: "회" },
  { name: "주유 1회", price: 80000, icon: Car, unit: "회" },
  { name: "서울 월세 (평균)", price: 800000, icon: Home, unit: "개월" },
  { name: "제주도 왕복 항공권", price: 150000, icon: Plane, unit: "회" },
];

export default function WhatToBuyPage() {
  const [salary, setSalary] = useState("50000000");

  const monthlyNet = useMemo(() => {
    const annual = Number(salary.replace(/,/g, ""));
    return Math.round(annual * 0.75 / 12);
  }, [salary]);

  return (
    <main className="w-full min-h-screen bg-slate-50 dark:bg-[#191F28] pt-28 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden text-center pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-[#0f1623] dark:via-[#191F28] dark:to-[#1a2035] -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-400/10 dark:bg-orange-500/15 rounded-full blur-[100px] -z-10" />
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            내 월급으로 <span className="text-orange-500">뭘 살 수 있을까?</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto mb-8">
            연봉을 입력하면 월 실수령액으로 살 수 있는 것들을 알려드립니다.
          </p>
          <div className="max-w-md mx-auto">
            <CurrencyInput
              label="나의 연봉"
              value={salary}
              onValueChange={setSalary}
              quickAmounts={[30000000, 50000000, 80000000, 100000000]}
            />
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4">
        <div className="toss-card p-6 mb-8">
          <p className="text-sm font-bold text-slate-500 mb-1">월 예상 실수령액</p>
          <p className="text-3xl font-black text-blue-600">{monthlyNet.toLocaleString()}<span className="text-xl text-slate-500 font-medium ml-1">원</span></p>
        </div>

        <AdUnit slotId="1122334455" format="auto" label="WhatToBuy Top Ad" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {items.map((item, idx) => {
            const count = Math.floor(monthlyNet / item.price);
            const IconComp = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="toss-card p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-[16px] bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                  <IconComp className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-500 truncate">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.price.toLocaleString()}원/{item.unit}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{count.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{item.unit}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8">
          <AdUnit slotId="9988776655" format="auto" label="WhatToBuy Bottom Ad" />
        </div>
      </div>
    </main>
  );
}