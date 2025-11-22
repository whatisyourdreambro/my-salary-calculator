"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "@/components/CurrencyInput";
import { motion, AnimatePresence } from "framer-motion";
import {
  Feather, Wheat, Hammer, Shield, Scroll, Gem, Crown, Flame, Sparkles, Sword, Wand
} from "lucide-react";
import AdUnit from "@/components/AdUnit";

const tiers = [
  { limit: 28000000, title: "자유로운 영혼의 음유시인", rank: "F", icon: Feather, color: "text-green-400", bg: "from-green-900 to-slate-900", description: "바람 따라 구름 따라 떠도는 영혼. 주머니는 가볍지만 낭만은 가득합니다." },
  { limit: 35000000, title: "성실한 마을 청년", rank: "E", icon: Wheat, color: "text-amber-400", bg: "from-amber-900 to-slate-900", description: "마을의 든든한 일꾼. 축제 때 춤추는 것을 좋아하며 소박한 행복을 누립니다." },
  { limit: 45000000, title: "왕국의 숙련된 대장장이", rank: "D", icon: Hammer, color: "text-orange-500", bg: "from-orange-900 to-slate-900", description: "당신의 망치질 소리는 왕국의 자랑입니다. 명검을 만들기 위해 밤을 지새웁니다." },
  { limit: 60000000, title: "왕실 근위대 기사", rank: "C", icon: Shield, color: "text-blue-400", bg: "from-blue-900 to-slate-900", description: "왕을 지키는 명예로운 검. 빛나는 갑옷만큼이나 당신의 충성심은 빛납니다." },
  { limit: 80000000, title: "고위 마법사", rank: "B", icon: Wand, color: "text-purple-400", bg: "from-purple-900 to-slate-900", description: "진리를 탐구하는 현자. 손짓 한 번으로 전장을 뒤집는 강력한 힘을 가졌습니다." },
  { limit: 120000000, title: "대륙의 거상", rank: "A", icon: Gem, color: "text-emerald-400", bg: "from-emerald-900 to-slate-900", description: "돈으로 살 수 없는 건 없습니다. 당신의 상단은 대륙의 경제를 지배합니다." },
  { limit: 200000000, title: "제국의 대공", rank: "S", icon: Crown, color: "text-yellow-400", bg: "from-yellow-900 to-slate-900", description: "황제 다음가는 권력자. 당신의 영지에서는 해가 지지 않습니다." },
  { limit: Infinity, title: "에인션트 드래곤", rank: "SSS", icon: Flame, color: "text-red-500", bg: "from-red-900 to-slate-900", description: "필멸자들의 삶을 관조하는 초월적 존재. 금은보화는 그저 침대일 뿐입니다." },
];

const getTier = (salary: number) => {
  return tiers.find(tier => salary < tier.limit) || tiers[tiers.length - 1];
};

export default function ReincarnationPage() {
  const [salary, setSalary] = useState("50000000");
  const annualSalary = useMemo(() => Number(salary.replace(/,/g, "")), [salary]);

  const result = getTier(annualSalary);
  const ResultIcon = result.icon;

  return (
    <main className="w-full min-h-screen bg-slate-950 text-slate-100 font-serif overflow-hidden relative flex flex-col items-center py-12 px-4">
      {/* Mystical Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full blur-sm"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-8 h-8 text-yellow-400 mx-auto animate-pulse" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]">
            이세계 환생 시뮬레이터
          </h1>
          <p className="mt-4 text-lg text-slate-400 font-light italic">
            "당신의 연봉이 이세계에서의 운명을 결정합니다..."
          </p>
        </div>

        {/* Ad Unit: Top */}
        <div className="mb-12 w-full max-w-md">
          <AdUnit slotId="3322110099" format="auto" label="Reincarnation Top Ad" />
        </div>

        {/* Input Section */}
        <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-xl mb-12">
          <CurrencyInput
            label="현생의 연봉을 입력하시오"
            value={salary}
            onValueChange={setSalary}
            quickAmounts={[30000000, 50000000, 100000000]}
            className="text-center text-2xl font-bold bg-slate-800 border-slate-600 text-yellow-100 focus:border-yellow-500"
          />
        </div>

        {/* Result Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={result.title}
            initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="perspective-1000"
          >
            <div className={`relative w-[320px] md:w-[380px] bg-gradient-to-br ${result.bg} p-[2px] rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group`}>
              {/* Card Border Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />

              <div className="relative bg-slate-950 h-full rounded-[calc(2rem-2px)] p-8 flex flex-col items-center text-center overflow-hidden">
                {/* Rank Badge */}
                <div className="absolute top-6 right-6 w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm">
                  <span className={`font-black text-xl ${result.color} drop-shadow-glow`}>{result.rank}</span>
                </div>

                {/* Icon Container */}
                <motion.div
                  className={`w-32 h-32 rounded-full bg-gradient-to-br ${result.bg} flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] border-4 border-slate-800 relative group-hover:scale-110 transition-transform duration-500`}
                >
                  <ResultIcon className={`w-16 h-16 ${result.color} drop-shadow-lg`} />
                  <div className="absolute inset-0 rounded-full border border-white/10" />
                </motion.div>

                <h3 className="text-sm text-slate-400 uppercase tracking-[0.2em] mb-2">Class</h3>
                <h2 className={`text-3xl font-bold ${result.color} mb-6 drop-shadow-md leading-tight`}>
                  {result.title}
                </h2>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-6" />

                <p className="text-slate-300 leading-relaxed font-light">
                  {result.description}
                </p>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Ad Unit: Bottom */}
        <div className="mt-16 w-full max-w-md">
          <AdUnit slotId="0099887766" format="auto" label="Reincarnation Bottom Ad" />
        </div>
      </div>
    </main>
  );
}
