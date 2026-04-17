"use client";

import { useState } from "react";
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

const getRarityColor = (rarity: Rarity) => {
  switch (rarity) {
    case "S": return "text-primary font-black";
    case "A": return "text-primary font-black";
    case "B": return "text-blue-500 font-bold";
    case "C": return "text-primary font-bold";
    case "F": return "text-slate-400 font-medium";
    default: return "text-slate-700 dark:text-slate-300";
  }
};

const getRarityBg = (rarity: Rarity) => {
  switch (rarity) {
    case "S": return "bg-primary/10 dark:bg-primary/20 border-primary dark:border-primary/50";
    case "A": return "bg-primary/10 dark:bg-primary/20 border-primary dark:border-primary/50";
    case "B": return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50";
    case "C": return "bg-primary/10 dark:bg-primary/20 border-primary dark:border-primary/50";
    case "F": return "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700";
    default: return "bg-slate-100 border-slate-200";
  }
};

const pickRandom = (items: LifeAttribute[], karmaMultiplier: number): LifeAttribute => {
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
    const karma = Math.max(0.5, Math.min(3.0, 0.5 + (annualSalary / 100000000)));

    setTimeout(() => {
      setResult({
        country: pickRandom(COUNTRIES, karma),
        spoon: pickRandom(SPOONS, karma),
        talent: pickRandom(TALENTS, karma),
        occupation: pickRandom(OCCUPATIONS, karma),
        lifeSpan: Math.floor(60 + Math.random() * 40 + (karma * 5)),
      });
      setIsSpinning(false);
    }, 3000);
  };

  const handleShare = async () => {
    if (!result) return;
    const text = `[인생 2회차 결과]\n국적: ${result.country.name}\n계급: ${result.spoon.name}\n직업: ${result.occupation.name}\n\n당신의 다음 생이 궁금하다면?`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "인생 2회차 시뮬레이터", text, url: window.location.href });
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(text).then(() => alert("결과가 복사되었습니다!"));
    }
  };

  return (
    <main className="w-full min-h-screen bg-slate-50 dark:bg-[#191F28] font-sans pb-20">
      {/* Hero Section */}
      <section className="relative pt-28 pb-14 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-primary/80 dark:from-[#0f1623] dark:via-[#191F28] dark:to-[#1a2035] -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 dark:bg-primary/15 rounded-full blur-[120px] -z-10" />
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-block mb-5 p-4 rounded-[20px] bg-primary/10 dark:bg-primary/30 border border-indigo-200 dark:border-primary/50">
            <Dna className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-slate-900 mb-4">
            LIFE <span className="text-primary">GACHA</span>
          </h1>
          <p className="mt-2 text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
            당신의 현생 연봉이 다음 생의 <span className="text-primary font-bold">운명(Karma)</span>을 결정합니다.
          </p>
        </div>
      </section>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 flex flex-col items-center">
        {/* Input Section */}
        <AnimatePresence mode="wait">
          {!isSpinning && !result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md space-y-8"
            >
              <div className="toss-card p-8">
                <CurrencyInput
                  label="현생의 연봉 (Karma Point)"
                  value={salary}
                  onValueChange={setSalary}
                  quickAmounts={[30000000, 50000000, 100000000]}
                />
                <button
                  onClick={handleSpin}
                  className="toss-button-primary mt-8"
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
                  className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"
                />
                <motion.div
                  className="absolute inset-0 border-4 border-t-indigo-500 border-r-purple-500 border-b-pink-500 border-l-transparent rounded-full"
                  animate={{ rotate: 1080 }}
                  transition={{ duration: 3, ease: "circOut" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl animate-pulse">🧬</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-900 mb-2">영혼 데이터 재구성 중...</h2>
              <p className="text-primary dark:text-primary font-medium">당신의 카르마를 분석하고 있습니다.</p>
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
              <div className="toss-card p-8 relative overflow-hidden">
                <div className="text-center mb-8">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-primary text-sm font-bold mb-4">
                    REINCARNATION COMPLETE
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-slate-900">당신의 다음 생은?</h2>
                </div>

                <div className="space-y-3">
                  {/* Country */}
                  <div className={`p-4 rounded-2xl border ${getRarityBg(result.country.rarity)} flex items-center gap-4`}>
                    <div className="p-3 rounded-xl bg-white/60 dark:bg-black/20">
                      <Globe2 className={`w-5 h-5 ${getRarityColor(result.country.rarity)}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Nationality</p>
                      <h3 className={`text-base font-bold ${getRarityColor(result.country.rarity)}`}>{result.country.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{result.country.description}</p>
                    </div>
                    <div className={`text-lg font-black italic ${getRarityColor(result.country.rarity)}`}>{result.country.rarity}</div>
                  </div>

                  {/* Spoon */}
                  <div className={`p-4 rounded-2xl border ${getRarityBg(result.spoon.rarity)} flex items-center gap-4`}>
                    <div className="p-3 rounded-xl bg-white/60 dark:bg-black/20">
                      <Crown className={`w-5 h-5 ${getRarityColor(result.spoon.rarity)}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Class</p>
                      <h3 className={`text-base font-bold ${getRarityColor(result.spoon.rarity)}`}>{result.spoon.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{result.spoon.description}</p>
                    </div>
                    <div className={`text-lg font-black italic ${getRarityColor(result.spoon.rarity)}`}>{result.spoon.rarity}</div>
                  </div>

                  {/* Talent */}
                  <div className={`p-4 rounded-2xl border ${getRarityBg(result.talent.rarity)} flex items-center gap-4`}>
                    <div className="p-3 rounded-xl bg-white/60 dark:bg-black/20">
                      <Zap className={`w-5 h-5 ${getRarityColor(result.talent.rarity)}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Talent</p>
                      <h3 className={`text-base font-bold ${getRarityColor(result.talent.rarity)}`}>{result.talent.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{result.talent.description}</p>
                    </div>
                    <div className={`text-lg font-black italic ${getRarityColor(result.talent.rarity)}`}>{result.talent.rarity}</div>
                  </div>

                  {/* Occupation */}
                  <div className={`p-4 rounded-2xl border ${getRarityBg(result.occupation.rarity)} flex items-center gap-4`}>
                    <div className="p-3 rounded-xl bg-white/60 dark:bg-black/20">
                      <Briefcase className={`w-5 h-5 ${getRarityColor(result.occupation.rarity)}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Occupation</p>
                      <h3 className={`text-base font-bold ${getRarityColor(result.occupation.rarity)}`}>{result.occupation.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{result.occupation.description}</p>
                    </div>
                    <div className={`text-lg font-black italic ${getRarityColor(result.occupation.rarity)}`}>{result.occupation.rarity}</div>
                  </div>

                  {/* Life Span */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/60 dark:bg-black/20">
                      <Skull className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Life Span</p>
                      <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">{result.lifeSpan}세</h3>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setResult(null)}
                    className="toss-button-secondary flex-1"
                  >
                    <RefreshCw size={18} /> 다시 하기
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-4 bg-primary hover:bg-primary text-white rounded-[16px] font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Share2 size={18} /> 결과 공유
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
