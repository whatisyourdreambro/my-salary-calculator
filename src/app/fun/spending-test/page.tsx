// src/app/fun/spending-test/page.tsx
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Turtle, Squirrel, Zap, Rabbit, Download } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";

const questions = [
  {
    question: "월급날, 가장 먼저 하는 일은?",
    answers: [
      { text: "고생한 나를 위한 선물! 바로 쇼핑한다", type: "yolo" },
      { text: "각종 공과금, 카드값을 먼저 이체한다", type: "plan" },
      { text: "적금, 투자 계좌에 먼저 돈을 넣는다", type: "save" },
      { text: "친구들과의 약속을 잡는다", type: "social" },
    ],
  },
  {
    question: "갖고 싶던 비싼 물건이 세일한다면?",
    answers: [
      { text: "이건 못 참지! 바로 구매한다", type: "yolo" },
      { text: "계획에 없던 지출은 하지 않는다", type: "plan" },
      { text: "더 싼 곳이 있는지 가격 비교부터 한다", type: "save" },
      { text: "친구에게 이 소식을 알리고 같이 사자고 한다", type: "social" },
    ],
  },
  {
    question: "친구의 갑작스러운 여행 제안, 당신의 반응은?",
    answers: [
      { text: "'어디로?' 당장 짐부터 싼다", type: "yolo" },
      { text: "'음...' 예산을 먼저 계산해본다", type: "plan" },
      { text: "'돈 없는데...' 일단 거절한다", type: "save" },
      { text: "'콜!' 다른 친구들도 모아보자고 한다", type: "social" },
    ],
  },
  {
    question: "당신에게 '돈'이란?",
    answers: [
      { text: "인생을 즐기기 위한 수단", type: "yolo" },
      { text: "미래를 위한 안정적인 계획", type: "plan" },
      { text: "차곡차곡 모으는 재미", type: "save" },
      { text: "함께 나눌 때 더 커지는 행복", type: "social" },
    ],
  },
];

const resultTypes = {
  yolo: {
    title: "욜로족 라이언",
    emoji: "⚡",
    icon: Zap,
    description:
      "'인생은 한 번뿐!' 현재의 행복을 가장 중시하는 당신. 화끈한 소비로 스트레스를 풀지만, 가끔은 텅장이 될 수 있어요. 멋진 인생을 살지만, 작은 계획이라도 세워보면 어떨까요?",
    gradient: "from-orange-500 to-pink-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    textColor: "text-orange-400",
    tip: "💡 TIP: 월급의 10%만 자동이체 저축해도 연간 큰 돈이 모여요!",
  },
  plan: {
    title: "계획적인 거북이",
    emoji: "🐢",
    icon: Turtle,
    description:
      "한 걸음 한 걸음, 목표를 향해 나아가는 당신. 모든 소비는 계획 안에서 이루어져야 직성이 풀립니다. 안정적인 미래가 보장되지만, 가끔은 즉흥적인 소비로 작은 행복을 느껴보는 것도 좋아요!",
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    textColor: "text-emerald-400",
    tip: "💡 TIP: 계획된 '용돈' 항목을 만들어 죄책감 없이 쓰는 돈을 확보하세요!",
  },
  save: {
    title: "알뜰살뜰 다람쥐",
    emoji: "🐿️",
    icon: Squirrel,
    description:
      "도토리를 모으듯 차곡차곡 쌓이는 통장 잔고를 보며 행복을 느끼는 당신. 절약과 저축의 신이지만, 가끔은 모은 돈으로 자신에게 큰 선물을 해주는 건 어떨까요?",
    gradient: "from-sky-500 to-indigo-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    textColor: "text-sky-400",
    tip: "💡 TIP: 모은 돈을 ETF 투자로 굴려보면 복리의 마법을 경험할 수 있어요!",
  },
  social: {
    title: "인싸 토끼",
    emoji: "🐰",
    icon: Rabbit,
    description:
      "혼자보다는 함께일 때 더 큰 행복을 느끼는 당신. 주변 사람들을 챙기느라 지출이 많지만, 그만큼 행복한 추억도 많아요. 하지만 나의 재무 상태도 잊지 말고 챙겨주세요!",
    gradient: "from-violet-500 to-pink-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    textColor: "text-violet-400",
    tip: "💡 TIP: 더치페이 문화를 도입하면 관계는 유지하면서 지출을 줄일 수 있어요!",
  },
};

export default function SpendingTestPage() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ yolo: 0, plan: 0, save: 0, social: 0 });
  const [toast, setToast] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleAnswer = (type: keyof typeof scores) => {
    setScores(prev => ({ ...prev, [type]: prev[type] + 1 }));
    setStep(prev => prev + 1);
  };

  const getResultType = () => {
    const maxScore = Math.max(...Object.values(scores));
    return (Object.keys(scores) as (keyof typeof scores)[]).find(k => scores[k] === maxScore) || "plan";
  };

  const resetTest = () => {
    setStep(0);
    setScores({ yolo: 0, plan: 0, save: 0, social: 0 });
  };

  const result = step === questions.length ? resultTypes[getResultType()] : null;

  const captureResultImage = async (): Promise<Blob | null> => {
    if (!resultRef.current) return null;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(resultRef.current, { backgroundColor: "#0D1117", scale: 2 });
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  };

  const handleSaveImage = async () => {
    if (!resultRef.current) return;
    showToast("📸 이미지 저장 중...");
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(resultRef.current, { backgroundColor: "#0D1117", scale: 2 });
    const link = document.createElement("a");
    link.download = `소비성향_${result?.title ?? "결과"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("✅ 이미지가 저장됐어요!");
  };

  const progress = (step / questions.length) * 100;

  return (
    <main className="w-full min-h-screen bg-[#0D1117] pb-20 relative">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: "linear-gradient(#8b5cf6 1px, transparent 1px), linear-gradient(90deg, #8b5cf6 1px, transparent 1px)", backgroundSize: "50px 50px" }}
      />

      {/* Hero */}
      <section className="relative pt-24 pb-10 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-bold mb-4"
        >
          🐾 소비 성향 분석
        </motion.div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-3">
          소비 성향 테스트
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          나의 소비 습관은 어떤 동물과 닮았을까요?
        </p>
      </section>

      {/* Progress bar — only during quiz */}
      {step < questions.length && (
        <div className="max-w-2xl mx-auto px-4 mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>질문 {step + 1} / {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {step < questions.length ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50, rotate: 1 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -50, rotate: -1 }}
              transition={{ duration: 0.35, ease: "backOut" }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="mb-2">
                <span className="text-xs font-bold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
                  질문 {step + 1}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-8 leading-tight text-white mt-4">
                {questions[step].question}
              </h2>

              <div className="space-y-3">
                {questions[step].answers.map((answer, idx) => (
                  <motion.button
                    key={answer.text}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    onClick={() => handleAnswer(answer.type as keyof typeof scores)}
                    className="w-full text-left p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-violet-500/10 hover:border-violet-500/40 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-base font-medium text-gray-300 group-hover:text-white transition-colors">
                        {answer.text}
                      </span>
                      <div className="w-5 h-5 rounded-full border-2 border-white/20 group-hover:border-violet-400 group-hover:bg-violet-400/20 transition-colors flex-shrink-0" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Capture target */}
                <div ref={resultRef} className="bg-[#0D1117] rounded-3xl border border-white/10 p-8 mb-4">
                  <p className="text-center text-xs font-bold tracking-widest text-gray-500 mb-6 uppercase">나의 소비 성향</p>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    className={`w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br ${result.gradient} shadow-2xl`}
                  >
                    <span className="text-5xl">{result.emoji}</span>
                  </motion.div>

                  <h2 className={`text-4xl sm:text-5xl font-black mb-6 text-center ${result.textColor}`}>
                    {result.title}
                  </h2>

                  <div className={`${result.bg} border ${result.border} rounded-2xl p-5 mb-5`}>
                    <p className="text-base leading-relaxed text-gray-300 text-center keep-all">
                      {result.description}
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-400 text-center">
                    {result.tip}
                  </div>
                </div>

                {/* Share buttons */}
                <div className="mb-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleSaveImage}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-black bg-gradient-to-r ${result.gradient} shadow-lg`}
                  >
                    <Download size={18} /> 이미지 저장
                  </motion.button>
                  <ShareButtons
                    title={`나의 소비 성향은 '${result.title}' ${result.emoji}`}
                    description="소비 성향 테스트 - 나의 소비 습관은 어떤 동물과 닮았을까?"
                    getShareImage={captureResultImage}
                    className="justify-center mt-4"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={resetTest}
                  className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-bold text-gray-400 hover:text-white transition-colors"
                >
                  다시하기
                </motion.button>
              </motion.div>
            )
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
