"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Utensils, RefreshCw, Share2 } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const MENUS = [
  "김치찌개", "된장찌개", "제육볶음", "돈까스", "햄버거", 
  "짜장면", "짬뽕", "마라탕", "초밥", "국밥", "샐러드", "샌드위치"
];

export default function LunchRoulettePage() {
  const [result, setResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const spin = () => {
    setIsSpinning(true);
    setResult(null);

    let count = 0;
    const interval = setInterval(() => {
      setResult(MENUS[Math.floor(Math.random() * MENUS.length)]);
      count++;
      if (count > 20) {
        clearInterval(interval);
        setResult(MENUS[Math.floor(Math.random() * MENUS.length)]);
        setIsSpinning(false);
      }
    }, 50);
  };

  return (
    <main className="w-full min-h-screen bg-white dark:bg-black px-4 pt-28 pb-20 font-sans">
      <div className="text-center mb-12 border-b border-gray-100 dark:border-gray-900 pb-10">
        <Utensils className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-900 mb-3">
          점심 메뉴 추천기
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          직장인의 최대 난제, 오늘 점심 뭐 먹지?
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="toss-card p-10 text-center mb-6 min-h-[250px] flex flex-col items-center justify-center border-t-4 border-t-primary">
          <motion.div
            key={result || "empty"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
          >
            {result ? (
              <>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">RECOMMENDED MENU</p>
                <h2 className={`text-4xl font-black ${isSpinning ? 'text-slate-300' : 'text-primary'}`}>
                  {result}
                </h2>
              </>
            ) : (
              <p className="text-xl font-medium text-slate-400">버튼을 눌러 추천을 받아보세요.</p>
            )}
          </motion.div>
        </div>

        <div className="flex gap-3 mb-8">
          <button
            onClick={spin}
            disabled={isSpinning}
            className="flex-1 py-4 bg-primary hover:bg-primary/90 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <RefreshCw className={isSpinning ? "animate-spin" : ""} size={18} /> 
            {isSpinning ? "추천 중..." : "메뉴 추천받기"}
          </button>
          {result && !isSpinning && (
            <button
              onClick={() => navigator.share ? navigator.share({ title: "오늘의 점심 메뉴", text: "오늘 점심은 " + result + " 어때요?", url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}
              className="px-6 toss-button-secondary rounded-sm border"
            >
              <Share2 size={18} />
            </button>
          )}
        </div>

        <AdUnit slotId="1122334455" format="auto" label="Lunch Roulette Ad" />
      </div>
    </main>
  );
}