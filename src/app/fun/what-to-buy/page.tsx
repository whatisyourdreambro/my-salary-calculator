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
  { name: "?¤í?ë²…ìŠ¤ ?„ë©”ë¦¬ì¹´??, price: 4500, icon: Coffee, unit: "?? },
  { name: "?·í”Œë¦?Š¤ ?„ë¦¬ë¯¸ì—„ êµ¬ë…", price: 17000, icon: Film, unit: "ê°œì›”" },
  { name: "ë°°ë‹¬ ?¼ìž", price: 25000, icon: Pizza, unit: "?? },
  { name: "?¬ìŠ¤??1ê°œì›” ?Œì›ê¶?, price: 50000, icon: Dumbbell, unit: "ê°œì›”" },
  { name: "?ë§¥ì£?500cc", price: 4000, icon: Beer, unit: "?? },
  { name: "ìµœì‹  ê²Œìž„ ?€?´í?", price: 80000, icon: Gamepad2, unit: "ê°? },
  { name: "?¸í…” ë·”íŽ˜ 2??, price: 350000, icon: UtensilsCrossed, unit: "?? },
  { name: "?ì–´??ë§¥ìŠ¤", price: 769000, icon: Headphones, unit: "ê°? },
  { name: "?„ì´??16 Pro", price: 1800000, icon: Smartphone, unit: "?€" },
  { name: "ìµœì‹  ê·¸ëž˜?½ì¹´??(5090)", price: 2500000, icon: Cpu, unit: "ê°? },
  { name: "ë®¤ì?ì»?VIP???°ì¼“", price: 180000, icon: Theater, unit: "?? },
  { name: "?œì£¼???•ë³µ ??³µê¶?, price: 100000, icon: Plane, unit: "?? },
  { name: "?¤ë„¬ ?´ëž˜???Œëž©ë°?, price: 15000000, icon: ShoppingBag, unit: "ê°? },
  { name: "?„ë? ?„ë°˜??(ê¹¡í†µ)", price: 19000000, icon: Car, unit: "?€" },
  { name: "?œìš¸ ?„íŒŒ??1??, price: 40000000, icon: Home, unit: "?? },
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
      <p className="text-xs text-muted-foreground">ê°œë‹¹ {item.price.toLocaleString()}??/p>
    </motion.div>
  );
};

export default function WhatToBuyPage() {
  const [salary, setSalary] = useState("3000000");
  const monthlySalary = useMemo(() => Number(salary.replace(/,/g, "")), [salary]);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          ???”ê¸‰?¼ë¡œ ?????ˆëŠ” ê²?
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          ?¹ì‹ ???”ê¸‰ ê°€ì¹˜ë? ?¬ë??ˆëŠ” ê¸°ì??¼ë¡œ ?˜ì‚°??ë³´ì„¸??
        </p>
      </div>

      {/* Ad Unit: Top */}
      <div className="mb-8">
        <AdUnit slotId="4433221100" format="auto" label="What To Buy Top Ad" />
      </div>

      <div className="max-w-md mx-auto mb-12">
        <CurrencyInput
          label="?”ê¸‰ ?…ë ¥ (?¸í›„)"
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
