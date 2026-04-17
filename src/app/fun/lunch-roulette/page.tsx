"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ChefHat } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const MENU_ITEMS = [
  { name: "짜장면", emoji: "🍜", color: "#2d3748" },
  { name: "짬뽕", emoji: "🌶️", color: "#c53030" },
  { name: "김치찌개", emoji: "🍲", color: "#9c4221" },
  { name: "제육볶음", emoji: "🥩", color: "#744210" },
  { name: "된장찌개", emoji: "🫕", color: "#6b5b35" },
  { name: "순대국밥", emoji: "🥣", color: "#4a5568" },
  { name: "삼겹살", emoji: "🥓", color: "#e53e3e" },
  { name: "냉면", emoji: "🍱", color: "#2b6cb0" },
  { name: "도시락", emoji: "🍱", color: "#276749" },
  { name: "편의점", emoji: "🏪", color: "#553c9a" },
  { name: "샐러드", emoji: "🥗", color: "#2f855a" },
  { name: "라면", emoji: "🍜", color: "#b7791f" },
];

export default function LunchRoulettePage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<typeof MENU_ITEMS[0] | null>(null);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomOffset = Math.floor(Math.random() * 360);
    const newRotation = rotation + extraSpins * 360 + randomOffset;
    setRotation(newRotation);

    setTimeout(() => {
      const idx = Math.floor(Math.random() * MENU_ITEMS.length);
      setResult(MENU_ITEMS[idx]);
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <main className="w-full min-h-screen bg-slate-50 dark:bg-[#191F28] pt-28 pb-20">
      {/* Hero */}
      <section className="text-center pb-12 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 mb-5">
          <ChefHat className="w-8 h-8 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
          점심 <span className="text-yellow-500">뭐 먹지?</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          메뉴 고민은 이제 그만! 룰렛이 결정해드립니다.
        </p>
      </section>

      <div className="max-w-2xl mx-auto px-4">
        <AdUnit slotId="1122334455" format="auto" label="Lunch Roulette Top Ad" />

        <div className="toss-card p-10 mt-8 text-center">
          {/* Roulette Visual */}
          <div className="relative w-64 h-64 mx-auto mb-10">
            <motion.div
              className="w-full h-full rounded-full border-8 border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 shadow-2xl text-7xl"
              animate={{ rotate: rotation }}
              transition={{ duration: 3, ease: "easeOut" }}
            >
              {result ? result.emoji : "🎰"}
            </motion.div>
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 rounded-full shadow-lg z-10" />
            {/* Pointer */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-red-500" />
          </div>

          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <p className="text-6xl mb-3">{result.emoji}</p>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white">{result.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">오늘의 런치 픽!</p>
              </motion.div>
            ) : (
              <motion.div key="idle" className="mb-8 h-28 flex items-center justify-center">
                <p className="text-lg text-slate-400 font-medium">
                  {isSpinning ? "돌리는 중..." : "버튼을 눌러 오늘의 메뉴를 뽑으세요!"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={spin}
            disabled={isSpinning}
            className="toss-button-primary disabled:opacity-60 disabled:cursor-not-allowed max-w-sm mx-auto"
          >
            {isSpinning ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 돌리는 중...</>
            ) : (
              <><RefreshCw className="w-5 h-5" /> {result ? "다시 뽑기" : "메뉴 뽑기"}</>
            )}
          </button>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-8">
          {MENU_ITEMS.map((item) => (
            <div key={item.name} className={"toss-card p-3 text-center cursor-pointer hover:-translate-y-0.5 transition-transform" + (result?.name === item.name ? " border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "")}>
              <p className="text-2xl mb-1">{item.emoji}</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.name}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <AdUnit slotId="9988776655" format="auto" label="Lunch Roulette Bottom Ad" />
        </div>
      </div>
    </main>
  );
}