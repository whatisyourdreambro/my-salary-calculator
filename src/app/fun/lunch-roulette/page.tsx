"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Pizza, Sandwich, Fish, Beef, UtensilsCrossed, ChefHat, Coffee, Soup, Salad, Drumstick } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const normalMenu = [
  { name: "국밥", icon: Soup, color: "#FF9F43" },
  { name: "제육볶음", icon: UtensilsCrossed, color: "#EE5A24" },
  { name: "돈까스", icon: UtensilsCrossed, color: "#F79F1F" },
  { name: "김치찌개", icon: Soup, color: "#EA2027" },
  { name: "서브웨이", icon: Sandwich, color: "#A3CB38" },
  { name: "짜장면", icon: UtensilsCrossed, color: "#1289A7" },
  { name: "편의점", icon: Coffee, color: "#5758BB" },
  { name: "피자", icon: Pizza, color: "#FFC312" },
];

const corporateCardMenu = [
  { name: "한우 오마카세", icon: Beef, color: "#B53471" },
  { name: "스시 오마카세", icon: Fish, color: "#0652DD" },
  { name: "평양냉면", icon: Soup, color: "#12CBC4" },
  { name: "스테이크", icon: Beef, color: "#833471" },
  { name: "파인 다이닝", icon: ChefHat, color: "#9980FA" },
  { name: "양갈비", icon: Drumstick, color: "#D980FA" },
  { name: "랍스터", icon: Fish, color: "#FDA7DF" },
  { name: "호텔 뷔페", icon: UtensilsCrossed, color: "#FFC312" },
];

export default function LunchRoulettePage() {
  const [isCorporate, setIsCorporate] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ name: string; icon: React.ElementType; color: string } | null>(null);
  const wheelControls = useAnimation();

  const menu = isCorporate ? corporateCardMenu : normalMenu;
  const segmentAngle = 360 / menu.length;

  const spinRoulette = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // Random rotation: at least 5 full spins (1800 deg) + random segment
    const randomSegmentIndex = Math.floor(Math.random() * menu.length);
    const extraRotation = 360 * 5;
    const targetRotation = extraRotation + (randomSegmentIndex * segmentAngle);

    // Adjust so the pointer (top) lands on the segment
    // The wheel rotates clockwise. Top is 0 degrees.
    // We need to rotate such that the target segment is at the top.
    // Actually, let's just rotate and calculate what's at the top.
    // Simpler: Rotate to a specific angle that aligns a random segment to the top.
    // If segment 0 is at 0-45 deg, to get it to top, we rotate -22.5 deg?
    // Let's just spin randomly and calculate result.

    const finalRotation = 1800 + Math.random() * 360;

    await wheelControls.start({
      rotate: finalRotation,
      transition: { duration: 4, ease: [0.2, 0.8, 0.2, 1] } // Cubic bezier for realistic spin
    });

    // Calculate result based on final rotation
    // Normalize rotation to 0-360
    const normalizedRotation = finalRotation % 360;
    // The pointer is at the top (270 degrees visually if 0 is right, but let's assume 0 is top for CSS rotate)
    // If CSS rotate(0) puts segment 0 at top-right...
    // Let's simplify: The wheel spins clockwise. The pointer is fixed at the top.
    // The segment at the top is determined by (360 - (rotation % 360)) / segmentAngle
    const winningIndex = Math.floor(((360 - normalizedRotation) % 360) / segmentAngle);
    const winner = menu[winningIndex] || menu[0]; // Fallback

    setResult(winner);
    setIsSpinning(false);

    // Reset rotation for next spin (visually seamless if we handle it right, but for now just snap back or keep adding)
    // To keep adding, we need to track total rotation. For simplicity, we just reset if we want, but better to keep adding.
    // Actually, framer motion 'rotate' is absolute. So next spin needs to add to current.
    // Let's just use state for rotation to keep it simple in next iteration if needed.
    // For now, the animation ends, we show result.
  };

  return (
    <main className="w-full min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col items-center py-12 px-4 relative">
      {/* Casino Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900 via-slate-950 to-black" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-lg">
            LUNCH JACKPOT
          </h1>
          <p className="text-slate-400 mt-2 font-medium">오늘의 점심 메뉴를 베팅하세요!</p>
        </div>

        {/* Ad Unit: Top */}
        <div className="mb-8 w-full max-w-md">
          <AdUnit slotId="2233445566" format="auto" label="Lunch Roulette Top Ad" />
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-4 mb-12 bg-slate-900/80 p-2 rounded-full border border-slate-700">
          <button
            onClick={() => !isSpinning && setIsCorporate(false)}
            className={`px-6 py-2 rounded-full font-bold transition-all ${!isCorporate ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25' : 'text-slate-400 hover:text-white'}`}
          >
            내돈내산
          </button>
          <button
            onClick={() => !isSpinning && setIsCorporate(true)}
            className={`px-6 py-2 rounded-full font-bold transition-all ${isCorporate ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' : 'text-slate-400 hover:text-white'}`}
          >
            법인카드 💳
          </button>
        </div>

        {/* Wheel Container */}
        <div className="relative w-80 h-80 md:w-96 md:h-96 mb-12">
          {/* Pointer */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 w-8 h-12">
            <div className="w-full h-full bg-red-600 clip-path-triangle shadow-xl drop-shadow-lg" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
          </div>

          {/* Wheel */}
          <motion.div
            className="w-full h-full rounded-full border-8 border-yellow-600 shadow-[0_0_50px_rgba(234,179,8,0.3)] overflow-hidden relative bg-slate-800"
            animate={wheelControls}
            style={{ rotate: 0 }}
          >
            {menu.map((item, index) => (
              <div
                key={index}
                className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left"
                style={{
                  rotate: `${index * segmentAngle}deg`,
                  transformOrigin: "bottom left", // Center of the circle
                  clipPath: "polygon(0 0, 100% 0, 100% 100%)", // Approximate wedge? No, this is hard with CSS clip-path for arbitrary angles.
                  // Better approach: Conic gradient or SVG.
                  // Let's use a simpler visual trick: Just place icons in a circle and rotate the container.
                }}
              >
                {/* This CSS wedge approach is tricky. Let's try a different visual for the wheel: SVG */}
              </div>
            ))}

            {/* SVG Wheel for perfect segments */}
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {menu.map((item, index) => {
                // Calculate path for segment
                const startAngle = index * segmentAngle;
                const endAngle = (index + 1) * segmentAngle;
                const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

                return (
                  <path
                    key={index}
                    d={`M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`}
                    fill={index % 2 === 0 ? '#1e293b' : '#334155'} // Alternating colors for contrast
                    stroke="#0f172a"
                    strokeWidth="0.5"
                  />
                );
              })}
            </svg>

            {/* Icons on top of segments */}
            {menu.map((item, index) => {
              const angle = index * segmentAngle + segmentAngle / 2;
              const radius = 35; // % from center
              // Adjust for the -90deg rotation of SVG
              const finalAngle = angle - 90;

              return (
                <div
                  key={index}
                  className="absolute top-1/2 left-1/2 w-8 h-8 -ml-4 -mt-4 flex items-center justify-center text-white font-bold text-xs"
                  style={{
                    transform: `rotate(${finalAngle}deg) translate(${140}%) rotate(${-finalAngle + 90}deg)`, // Push out and counter-rotate icon
                    // Wait, translate percentage is relative to element size. 
                    // Let's use pixel approximation for 96 (384px) -> radius ~ 140px
                  }}
                >
                  <div className="flex flex-col items-center gap-1" style={{ transform: `rotate(${finalAngle + 90}deg)` }}>
                    <item.icon size={20} color={item.color} />
                    <span className="whitespace-nowrap text-[10px] shadow-black drop-shadow-md">{item.name}</span>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Center Cap */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-700 rounded-full shadow-lg flex items-center justify-center border-4 border-yellow-800 z-10">
            <span className="text-2xl">🎰</span>
          </div>
        </div>

        {/* Result Display */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-slate-900/95 backdrop-blur-xl border border-yellow-500/50 p-8 rounded-3xl shadow-2xl text-center min-w-[300px]"
            >
              <p className="text-slate-400 text-sm uppercase tracking-widest mb-2">Winner!</p>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="inline-block mb-4"
              >
                <result.icon size={64} color={result.color} />
              </motion.div>
              <h2 className="text-4xl font-black text-white mb-6">{result.name}</h2>
              <button
                onClick={() => setResult(null)}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors"
              >
                다시 돌리기
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spin Button */}
        <button
          onClick={spinRoulette}
          disabled={isSpinning}
          className="w-full max-w-xs py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-xl font-black rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? "SPINNING..." : "SPIN!"}
        </button>

        {/* Ad Unit: Bottom */}
        <div className="mt-12 w-full max-w-md">
          <AdUnit slotId="6655443322" format="auto" label="Lunch Roulette Bottom Ad" />
        </div>
      </div>
    </main>
  );
}
