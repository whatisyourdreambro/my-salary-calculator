"use client";

import { useState, useEffect } from "react";
import CurrencyInput from "@/components/CurrencyInput";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Globe2, Crown, Briefcase, Zap, Skull, RefreshCw, Share2, Dna
} from "lucide-react";
import AdUnit from "@/components/AdUnit";

// --- Data & Types ---

type Rarity = "S" | "A" | "B" | "C" | "F";

interface LifeAttribute {
  name: string;
  rarity: Rarity;
  description?: string;
}

const COUNTRIES: LifeAttribute[] = [
  { name: "아랍에미리트 (석유왕국)", rarity: "S", description: "태어나니 마당에서 석유가 솟구칩니다." },
  { name: "스위스", rarity: "S", description: "알프스 산맥을 보며 평화롭게 자랍니다." },
  { name: "미국 (뉴욕)", rarity: "A", description: "세계의 중심에서 기회를 잡으세요." },
  { name: "대한민국", rarity: "B", description: "치열하지만 역동적인 삶. 치킨은 맛있습니다." },
  { name: "일본", rarity: "B", description: "장인 정신과 편의점의 나라." },
  { name: "브라질", rarity: "C", description: "열정적인 삼바와 축구의 나라." },
  { name: "인도", rarity: "C", description: "IT 강국, 하지만 경쟁은 상상을 초월합니다." },
  { name: "북한", rarity: "F", description: "아... 탈출 계획부터 세우셔야겠습니다." },
  { name: "소말리아", rarity: "F", description: "해적왕이 될 자질이 있으신가요?" },
];

const SPOONS: LifeAttribute[] = [
  { name: "비브라늄 수저", rarity: "S", description: "재산 측정 불가. 세계를 움직이는 가문." },
  { name: "다이아 수저", rarity: "A", description: "평생 놀고 먹어도 3대가 풍족합니다." },
  { name: "금수저", rarity: "B", description: "부모님의 지원으로 편안한 출발." },
  { name: "은수저", rarity: "C", description: "부족함 없이 자랐습니다." },
  { name: "흙수저", rarity: "F", description: "맨주먹으로 세상을 헤쳐나가야 합니다." },
];

const TALENTS: LifeAttribute[] = [
  { name: "초능력 (염력)", rarity: "S", description: "세상에 이런 일이! 당신은 초능력자입니다." },
  { name: "천재적인 두뇌", rarity: "A", description: "3살 때 미적분을 풀었습니다." },
  { name: "압도적 비주얼", rarity: "A", description: "얼굴이 복지입니다. 걸어다니는 기업." },
  { name: "절대미각", rarity: "B", description: "요리계의 혁명가." },
  { name: "강철 체력", rarity: "C", description: "3일 밤을 새워도 멀쩡합니다." },
  { name: "무능력", rarity: "F", description: "평범함이 가장 큰 무기일지도..." },
];

const OCCUPATIONS: LifeAttribute[] = [
  { name: "우주 정복자", rarity: "S", description: "지구를 넘어 우주를 지배합니다." },
  { name: "글로벌 기업 CEO", rarity: "A", description: "당신의 결정 하나에 세계 경제가 흔들립니다." },
  { name: "월드스타", rarity: "A", description: "전 세계가 당신의 이름을 외칩니다." },
  { name: "건물주", rarity: "B", description: "조물주 위에 건물주." },
  { name: "공무원", rarity: "C", description: "안정적인 삶의 대명사." },
  { name: "편의점 알바", rarity: "F", description: "폐기 도시락으로 끼니를 때웁니다." },
];

// --- Helper Functions ---

const getRarityColor = (rarity: Rarity) => {
  switch (rarity) {
    case "S": return "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]";
    case "A": return "text-purple-400";
    case "B": return "text-blue-400";
    case "C": return "text-green-400";
    case "F": return "text-slate-500";
    default: return "text-white";
  }
};

const getRarityBg = (rarity: Rarity) => {
  switch (rarity) {
    case "S": return "bg-yellow-500/20 border-yellow-500/50";
    case "A": return "bg-purple-500/20 border-purple-500/50";
    case "B": return "bg-blue-500/20 border-blue-500/50";
    case "C": return "bg-green-500/20 border-green-500/50";
    case "F": return "bg-slate-500/20 border-slate-500/50";
    default: return "bg-slate-800 border-slate-700";
  }
};

const pickRandom = (items: LifeAttribute[], karmaMultiplier: number): LifeAttribute => {
  // Higher karma = higher chance of better rarity
  // Karma 1.0 = normal weights
  // Karma 2.0 = S/A tier weights doubled

  const weightedItems = items.map(item => {
    let weight = 1;
    if (item.rarity === "S") weight = 1 * karmaMultiplier;
    if (item.rarity === "A") weight = 3 * karmaMultiplier;
    if (item.rarity === "B") weight = 10;
    if (item.rarity === "C") weight = 20;
    if (item.rarity === "F") weight = 20 / karmaMultiplier;
    return { item, weight };
  });

  const totalWeight = weightedItems.reduce((a, b) => a + b.weight, 0);
  let random = Math.random() * totalWeight;

  for (const { item, weight } of weightedItems) {
    random -= weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
};

// --- Component ---

export default function ReincarnationPage() {
  const [salary, setSalary] = useState("50000000");
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{
    country: LifeAttribute;
    spoon: LifeAttribute;
    talent: LifeAttribute;
    occupation: LifeAttribute;
    lifeSpan: number;
  } | null>(null);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    const annualSalary = Number(salary.replace(/,/g, ""));
    // Karma calculation: 50m = 1.0, 100m = 1.5, 200m = 2.0...
    const karma = Math.max(0.5, Math.min(3.0, 0.5 + (annualSalary / 100000000)));

    setTimeout(() => {
      setResult({
        country: pickRandom(COUNTRIES, karma),
        spoon: pickRandom(SPOONS, karma),
        talent: pickRandom(TALENTS, karma),
        occupation: pickRandom(OCCUPATIONS, karma),
        lifeSpan: Math.floor(60 + Math.random() * 40 + (karma * 5)), // 60 ~ 100+
      });
      setIsSpinning(false);
    }, 3000);
  };

  const handleShare = async () => {
    if (!result) return;
    const text = `[인생 2회차 결과]\n국적: ${result.country.name}\n계급: ${result.spoon.name}\n직업: ${result.occupation.name}\n\n당신의 다음 생이 궁금하다면?`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "인생 2회차 시뮬레이터",
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(text).then(() => alert("결과가 복사되었습니다!"));
    }
  };

  return (
    <main className="w-full min-h-screen bg-black text-white font-sans overflow-hidden relative flex flex-col items-center py-12 px-4">
      {/* Premium Aurora Background (Consistent with Home) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block mb-4 p-4 rounded-full bg-indigo-500/10 border border-indigo-500/30"
          >
            <Dna className="w-10 h-10 text-indigo-400 animate-spin-slow" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            LIFE GACHA
          </h1>
          <p className="mt-4 text-indigo-200/60 text-lg font-light tracking-wide">
            당신의 현생 연봉이 다음 생의 <span className="text-indigo-400 font-bold">운명(Karma)</span>을 결정합니다.
          </p>
        </div>

        {/* Ad Unit */}
        {/* Ad Unit: Top - REMOVED */}

        {/* Input Section */}
        <AnimatePresence mode="wait">
          {!isSpinning && !result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md space-y-8"
            >
              <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CurrencyInput
                  label="현생의 연봉 (Karma Point)"
                  value={salary}
                  onValueChange={setSalary}
                  quickAmounts={[30000000, 50000000, 100000000]}
                  className="text-center text-3xl font-black bg-black/30 border-white/20 text-indigo-300 focus:border-indigo-500 h-16"
                />
                <button
                  onClick={handleSpin}
                  className="w-full mt-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xl font-black rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-6 h-6" />
                  환생 가챠 돌리기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spinning Animation */}
        <AnimatePresence>
          {isSpinning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative w-48 h-48 mb-8">
                <motion.div
                  className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"
                />
                <motion.div
                  className="absolute inset-0 border-4 border-t-indigo-400 border-r-purple-400 border-b-pink-400 border-l-transparent rounded-full"
                  animate={{ rotate: 1080 }}
                  transition={{ duration: 3, ease: "circOut" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl animate-pulse">🧬</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">영혼 데이터 재구성 중...</h2>
              <p className="text-indigo-300">당신의 카르마를 분석하고 있습니다.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Display */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-lg"
            >
              <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

                <div className="text-center mb-8 relative z-10">
                  <div className="inline-block px-4 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 text-sm font-bold mb-4">
                    REINCARNATION COMPLETE
                  </div>
                  <h2 className="text-3xl font-bold text-white">당신의 다음 생은?</h2>
                </div>

                <div className="space-y-4 relative z-10">
                  {/* Country */}
                  <div className={`p-4 rounded-2xl border ${getRarityBg(result.country.rarity)} flex items-center gap-4`}>
                    <div className="p-3 rounded-xl bg-black/30">
                      <Globe2 className={`w-6 h-6 ${getRarityColor(result.country.rarity)}`} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Nationality</p>
                      <h3 className={`text-lg font-bold ${getRarityColor(result.country.rarity)}`}>{result.country.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{result.country.description}</p>
                    </div>
                    <div className="ml-auto text-xl font-black italic opacity-50">{result.country.rarity}</div>
                  </div>

                  {/* Spoon */}
                  <div className={`p-4 rounded-2xl border ${getRarityBg(result.spoon.rarity)} flex items-center gap-4`}>
                    <div className="p-3 rounded-xl bg-black/30">
                      <Crown className={`w-6 h-6 ${getRarityColor(result.spoon.rarity)}`} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Class</p>
                      <h3 className={`text-lg font-bold ${getRarityColor(result.spoon.rarity)}`}>{result.spoon.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{result.spoon.description}</p>
                    </div>
                    <div className="ml-auto text-xl font-black italic opacity-50">{result.spoon.rarity}</div>
                  </div>

                  {/* Talent */}
                  <div className={`p-4 rounded-2xl border ${getRarityBg(result.talent.rarity)} flex items-center gap-4`}>
                    <div className="p-3 rounded-xl bg-black/30">
                      <Zap className={`w-6 h-6 ${getRarityColor(result.talent.rarity)}`} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Talent</p>
                      <h3 className={`text-lg font-bold ${getRarityColor(result.talent.rarity)}`}>{result.talent.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{result.talent.description}</p>
                    </div>
                    <div className="ml-auto text-xl font-black italic opacity-50">{result.talent.rarity}</div>
                  </div>

                  {/* Occupation */}
                  <div className={`p-4 rounded-2xl border ${getRarityBg(result.occupation.rarity)} flex items-center gap-4`}>
                    <div className="p-3 rounded-xl bg-black/30">
                      <Briefcase className={`w-6 h-6 ${getRarityColor(result.occupation.rarity)}`} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Occupation</p>
                      <h3 className={`text-lg font-bold ${getRarityColor(result.occupation.rarity)}`}>{result.occupation.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{result.occupation.description}</p>
                    </div>
                    <div className="ml-auto text-xl font-black italic opacity-50">{result.occupation.rarity}</div>
                  </div>

                  {/* Life Span */}
                  <div className="p-4 rounded-2xl border border-slate-700 bg-slate-800/50 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-black/30">
                      <Skull className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Life Span</p>
                      <h3 className="text-lg font-bold text-white">{result.lifeSpan}세</h3>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8 relative z-10">
                  <button
                    onClick={() => {
                      setResult(null);
                    }}
                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={20} /> 다시 하기
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30"
                  >
                    <Share2 size={20} /> 결과 공유
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <AdUnit slotId="0099887766" format="auto" label="Reincarnation Result Ad" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
