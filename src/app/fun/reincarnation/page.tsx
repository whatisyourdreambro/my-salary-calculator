"use client";

import { useState, useRef } from "react";
import CurrencyInput from "@/components/CurrencyInput";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Globe2, Crown, Briefcase, Zap, Skull, RefreshCw, Download, Dna } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";

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

const RARITY_STYLE: Record<Rarity, { color: string; bg: string; border: string; label: string }> = {
  S: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/40", label: "전설" },
  A: { color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/40", label: "희귀" },
  B: { color: "text-sky-400",    bg: "bg-sky-500/10",    border: "border-sky-500/40",    label: "고급" },
  C: { color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/40",label: "일반" },
  F: { color: "text-gray-500",   bg: "bg-gray-500/10",   border: "border-gray-500/40",   label: "꽝" },
};

const pickRandom = (items: LifeAttribute[], karmaMultiplier: number): LifeAttribute => {
  const weighted = items.map(item => {
    let w = 1;
    if (item.rarity === "S") w = 1 * karmaMultiplier;
    if (item.rarity === "A") w = 3 * karmaMultiplier;
    if (item.rarity === "B") w = 10;
    if (item.rarity === "C") w = 20;
    if (item.rarity === "F") w = 20 / karmaMultiplier;
    return { item, w };
  });
  const total = weighted.reduce((a, b) => a + b.w, 0);
  let rand = Math.random() * total;
  for (const { item, w } of weighted) {
    rand -= w;
    if (rand <= 0) return item;
  }
  return items[items.length - 1];
};

export default function ReincarnationPage() {
  const [salary, setSalary] = useState("50,000,000");
  const [isSpinning, setIsSpinning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [result, setResult] = useState<{
    country: LifeAttribute;
    spoon: LifeAttribute;
    talent: LifeAttribute;
    occupation: LifeAttribute;
    lifeSpan: number;
  } | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    const annualSalary = Number(salary.replace(/,/g, ""));
    const karma = Math.max(0.5, Math.min(3.0, 0.5 + annualSalary / 100000000));

    setTimeout(() => {
      setResult({
        country: pickRandom(COUNTRIES, karma),
        spoon: pickRandom(SPOONS, karma),
        talent: pickRandom(TALENTS, karma),
        occupation: pickRandom(OCCUPATIONS, karma),
        lifeSpan: Math.floor(60 + Math.random() * 40 + karma * 5),
      });
      setIsSpinning(false);
    }, 3000);
  };

  const captureResultImage = async (): Promise<Blob | null> => {
    if (!resultRef.current) return null;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(resultRef.current, { backgroundColor: "#0D1117", scale: 2 });
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  };

  const handleDownload = async () => {
    if (!resultRef.current) return;
    showToast("📸 이미지 저장 중...");
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(resultRef.current, { backgroundColor: "#0D1117", scale: 2 });
    const link = document.createElement("a");
    link.download = "인생2회차_결과.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("✅ 이미지가 저장됐어요!");
  };

  const attrRows = result
    ? [
        { icon: Globe2, label: "국적",  attr: result.country    },
        { icon: Crown,  label: "계급",  attr: result.spoon      },
        { icon: Zap,    label: "재능",  attr: result.talent     },
        { icon: Briefcase, label: "직업", attr: result.occupation },
      ]
    : [];

  return (
    <main className="w-full min-h-screen bg-[#0D1117] font-sans pb-20 relative">
      {/* Starfield background */}
      <div className="fixed inset-0 pointer-events-none opacity-10"
        style={{ backgroundImage: "radial-gradient(circle, #a855f7 1px, transparent 1px)", backgroundSize: "60px 60px" }}
      />

      {/* Hero */}
      <section className="relative pt-24 pb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/30 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block mb-5 p-4 rounded-[20px] bg-violet-500/20 border border-violet-500/40"
          >
            <Dna className="w-10 h-10 text-violet-400" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4">
            인생 가챠{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
              2회차
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            당신의 현생 연봉이 다음 생의{" "}
            <span className="text-violet-400 font-bold">카르마(Karma)</span>를 결정합니다.
          </p>
        </div>
      </section>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 flex flex-col items-center">
        {/* Input Section */}
        <AnimatePresence mode="wait">
          {!isSpinning && !result && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md space-y-6"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <CurrencyInput
                  label="현생의 연봉 (Karma Point)"
                  value={salary}
                  onValueChange={setSalary}
                  quickAmounts={[30000000, 50000000, 100000000]}
                />

                {/* Karma preview */}
                <div className="mt-4 text-center">
                  <div className="text-xs text-gray-500 mb-1">카르마 레벨</div>
                  <div className="flex gap-1 justify-center">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const karma = Math.max(0.5, Math.min(3.0, 0.5 + Number(salary.replace(/,/g, "")) / 100000000));
                      const filled = i < Math.round(karma / 0.6);
                      return (
                        <div key={i} className={`w-6 h-6 rounded-full border-2 transition-all ${filled ? "bg-violet-500 border-violet-500" : "bg-white/5 border-white/20"}`} />
                      );
                    })}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSpin}
                  className="w-full mt-8 py-5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-2xl font-black text-xl shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-6 h-6" />
                  환생 가챠 돌리기
                </motion.button>
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
                  className="absolute inset-0 border-4 border-violet-500/30 rounded-full"
                />
                <motion.div
                  className="absolute inset-0 border-4 border-t-violet-400 border-r-pink-400 border-b-violet-600 border-l-transparent rounded-full"
                  animate={{ rotate: 1080 }}
                  transition={{ duration: 3, ease: "circOut" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl animate-pulse">🧬</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">영혼 데이터 재구성 중...</h2>
              <p className="text-violet-400 font-medium">당신의 카르마를 분석하고 있습니다.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              {/* Capture target */}
              <div ref={resultRef} className="bg-[#0D1117] rounded-3xl border border-white/10 p-8 mb-4">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm font-bold mb-4">
                    <Sparkles size={14} /> 환생 완료
                  </div>
                  <h2 className="text-3xl font-black text-white">당신의 다음 생은?</h2>
                </div>

                <div className="space-y-3">
                  {attrRows.map(({ icon: Icon, label, attr }) => {
                    const style = RARITY_STYLE[attr.rarity];
                    return (
                      <div key={label} className={`p-4 rounded-2xl border ${style.bg} ${style.border} flex items-center gap-4`}>
                        <div className="p-3 rounded-xl bg-black/30">
                          <Icon className={`w-5 h-5 ${style.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-0.5">{label}</p>
                          <h3 className={`text-base font-bold truncate ${style.color}`}>{attr.name}</h3>
                          {attr.description && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{attr.description}</p>
                          )}
                        </div>
                        <div className={`text-sm font-black italic px-2 py-1 rounded-lg ${style.bg} ${style.color} border ${style.border} flex-shrink-0`}>
                          {attr.rarity} <span className="text-[10px] font-normal">{style.label}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Life Span */}
                  <div className="p-4 rounded-2xl border border-gray-500/30 bg-gray-500/10 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-black/30">
                      <Skull className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-0.5">수명</p>
                      <h3 className="text-base font-bold text-gray-300">{result.lifeSpan}세</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share buttons */}
              <div className="mb-3">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-500 to-pink-500 shadow-lg shadow-violet-500/20"
                >
                  <Download size={18} /> 이미지 저장
                </motion.button>
                <ShareButtons
                  title={`[인생 2회차 가챠] 나의 다음 생은 ${result.country.name}, ${result.occupation.name} 🧬`}
                  description="현생 연봉이 다음 생의 카르마를 결정한다 - 인생 가챠 2회차"
                  getShareImage={captureResultImage}
                  className="justify-center mt-4"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setResult(null)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-bold text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw size={16} /> 다시 하기
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/20 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl z-[100] whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
