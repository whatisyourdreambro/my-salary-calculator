// src/app/fun/lunch-roulette/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pizza, Sandwich, Fish, Beef, UtensilsCrossed, ChefHat } from "lucide-react";

const normalMenu = [
  { name: "국밥", icon: UtensilsCrossed },
  { name: "제육볶음", icon: UtensilsCrossed },
  { name: "돈까스", icon: UtensilsCrossed },
  { name: "김치찌개", icon: UtensilsCrossed },
  { name: "서브웨이", icon: Sandwich },
  { name: "짜장면", icon: UtensilsCrossed },
  { name: "편의점 도시락", icon: UtensilsCrossed },
  { name: "피자", icon: Pizza },
];

const corporateCardMenu = [
  { name: "한우 오마카세", icon: Beef },
  { name: "스시 오마카세", icon: Fish },
  { name: "평양냉면", icon: UtensilsCrossed },
  { name: "스테이크", icon: Beef },
  { name: "파인 다이닝", icon: ChefHat },
  { name: "양갈비", icon: UtensilsCrossed },
  { name: "랍스터", icon: UtensilsCrossed },
];

export default function LunchRoulettePage() {
  const [isCorporate, setIsCorporate] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ name: string; icon: React.ElementType } | null>(null);

  const spinRoulette = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    const menu = isCorporate ? corporateCardMenu : normalMenu;
    const randomIndex = Math.floor(Math.random() * menu.length);
    const selectedMenu = menu[randomIndex];

    // Animate for a few seconds
    setTimeout(() => {
      setResult(selectedMenu);
      setIsSpinning(false);
    }, 3000); // 3 seconds of spinning
  };

  const ResultIcon = result?.icon;

  return (
    <main className="w-full max-w-2xl mx-auto px-4 py-12 sm:py-16 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          오늘 점심 뭐 먹지?
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          점심 메뉴, 더 이상 고민하지 마세요! 룰렛을 돌려 운명에 맡겨보세요.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <span className="font-semibold">내 카드</span>
        <div 
            onClick={() => setIsCorporate(!isCorporate)}
            className={`relative w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isCorporate ? 'bg-primary' : 'bg-secondary'}`}>
            <motion.div 
                className="w-6 h-6 bg-white rounded-full shadow-md" 
                layout 
                transition={{ type: "spring", stiffness: 700, damping: 30 }} 
            />
        </div>
        <span className="font-bold text-primary">법인 카드 💳</span>
      </div>

      <div className="relative w-80 h-80 rounded-full border-8 border-border shadow-2xl flex items-center justify-center overflow-hidden">
        <AnimatePresence>
        {isSpinning ? (
            <motion.div
                className="text-4xl font-bold text-muted-foreground"
                animate={{ rotate: 3600, scale: [1, 1.2, 1] }}
                transition={{ duration: 3, ease: "linear" }}
            >
                🤔
            </motion.div>
        ) : result && ResultIcon ? (
            <motion.div
                key={result.name}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
            >
                <ResultIcon className="w-24 h-24 mx-auto text-primary" />
                <p className="text-4xl font-bold mt-4">{result.name}</p>
            </motion.div>
        ) : (
            <p className="text-2xl font-semibold text-muted-foreground">룰렛을 돌려주세요!</p>
        )}
        </AnimatePresence>
      </div>

      <div className="mt-8">
        <button 
            onClick={spinRoulette} 
            disabled={isSpinning}
            className="px-12 py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-wait"
        >
            {isSpinning ? '돌아가는 중...' : '점심 룰렛 돌리기!'}
        </button>
      </div>
    </main>
  );
}
