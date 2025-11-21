// src/app/fun/what-to-buy/page.tsx
"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "@/components/CurrencyInput";
import { motion } from "framer-motion";
import {
  Coffee, Smartphone, Car, Plane, Home, Pizza, Film, Gamepad2, Dumbbell, Beer, UtensilsCrossed, Headphones, Cpu, ShoppingBag, Theater
} from "lucide-react";
import AdUnit from "@/components/AdUnit";

const items = [
  { name: "스타벅스 아메리카노", price: 4500, icon: Coffee, unit: "잔" },
  { name: "넷플릭스 프리미엄 구독", price: 17000, icon: Film, unit: "개월" },
  { name: "배달 피자", price: 25000, icon: Pizza, unit: "판" },
  { name: "헬스장 1개월 회원권", price: 50000, icon: Dumbbell, unit: "개월" },
  { name: "생맥주 500cc", price: 4000, icon: Beer, unit: "잔" },
  { name: "최신 게임 타이틀", price: 80000, icon: Gamepad2, unit: "개" },
  { name: "호텔 뷔페 2인", price: 350000, icon: UtensilsCrossed, unit: "회" },
  { name: "에어팟 맥스", price: 769000, icon: Headphones, unit: "개" },
  { name: "아이폰 16 Pro", price: 1800000, icon: Smartphone, unit: "대" },
  { name: "최신 그래픽카드 (5090)", price: 2500000, icon: Cpu, unit: "개" },
  { name: "뮤지컬 VIP석 티켓", price: 180000, icon: Theater, unit: "장" },
  { name: "제주도 왕복 항공권", price: 100000, icon: Plane, unit: "장" },
  { name: "샤넬 클래식 플랩백", price: 15000000, icon: ShoppingBag, unit: "개" },
  { name: "현대 아반떼 (깡통)", price: 19000000, icon: Car, unit: "대" },
  { name: "서울 아파트 1평", price: 40000000, icon: Home, unit: "평" },
];

const formatNumber = (num: number) => {
  if (num < 1) return num.toFixed(2);
  return Math.floor(num).toLocaleString();
}

const ResultCard = ({ item, salary }: { item: typeof items[0], salary: number }) => {
  const quantity = salary > 0 && item.price > 0 ? salary / item.price : 0;
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card p-6 rounded-2xl border border-border shadow-lg flex flex-col items-center justify-center text-center h-full"
    >
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="font-bold text-lg text-foreground">{item.name}</h3>
      <p className="text-3xl font-bold text-primary my-2">
        {formatNumber(quantity)} <span className="text-xl font-medium">{item.unit}</span>
      </p>
      <p className="text-xs text-muted-foreground">개당 {item.price.toLocaleString()}원</p>
    </motion.div>
  );
};

export default function WhatToBuyPage() {
  const [salary, setSalary] = useState("3000000");
  const monthlySalary = useMemo(() => Number(salary.replace(/,/g, "")), [salary]);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          내 월급으로 살 수 있는 것?
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          당신의 월급 가치를 재미있는 기준으로 환산해 보세요!
        </p>
      </div>

      {/* Ad Unit: Top */}
      <div className="mb-8">
        <AdUnit slotId="4433221100" format="auto" label="What To Buy Top Ad" />
      </div>

      <div className="max-w-md mx-auto mb-12">
        <CurrencyInput
          label="월급 입력 (세후)"
          value={salary}
          onValueChange={setSalary}
          quickAmounts={[]}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {items.map((item) => (
          <ResultCard key={item.name} item={item} salary={monthlySalary} />
        ))}
      </div>

      {/* Ad Unit: Bottom */}
      <div className="mt-12">
        <AdUnit slotId="0011223344" format="auto" label="What To Buy Bottom Ad" />
      </div>
    </main>
  );
}
