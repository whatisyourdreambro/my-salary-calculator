// src/app/fun/spending-test/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Turtle, Squirrel, Zap, Rabbit, Share2 } from "lucide-react";
import AdUnit from "@/components/AdUnit";

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
    icon: Zap,
    description: "'인생은 한 번뿐!' 현재의 행복을 가장 중시하는 당신. 화끈한 소비로 스트레스를 풀지만, 가끔은 텅장이 될 수 있어요. 멋진 인생을 살지만, 작은 계획이라도 세워보면 어떨까요?",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    bgColor: "bg-orange-500",
  },
  plan: {
    title: "계획적인 거북이",
    icon: Turtle,
    description: "한 걸음 한 걸음, 목표를 향해 나아가는 당신. 모든 소비는 계획 안에서 이루어져야 직성이 풀립니다. 안정적인 미래가 보장되지만, 가끔은 즉흥적인 소비로 작은 행복을 느껴보는 것도 좋아요!",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    bgColor: "bg-blue-500",
  },
  save: {
    title: "알뜰살뜰 다람쥐",
    icon: Squirrel,
    description: "도토리를 모으듯 차곡차곡 쌓이는 통장 잔고를 보며 행복을 느끼는 당신. 절약과 저축의 신이지만, 가끔은 모은 돈으로 자신에게 큰 선물을 해주는 건 어떨까요?",
    color: "text-green-500",
    bg: "bg-green-500/10",
    bgColor: "bg-green-500",
  },
  social: {
    title: "인싸 토끼",
    icon: Rabbit,
    description: "혼자보다는 함께일 때 더 큰 행복을 느끼는 당신. 주변 사람들을 챙기느라 지출이 많지만, 그만큼 행복한 추억도 많아요. 하지만 나의 재무 상태도 잊지 말고 챙겨주세요!",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    bgColor: "bg-pink-500",
  },
};

export default function SpendingTestPage() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ yolo: 0, plan: 0, save: 0, social: 0 });

  const handleAnswer = (type: keyof typeof scores) => {
    setScores(prev => ({ ...prev, [type]: prev[type] + 1 }));
    setStep(prev => prev + 1);
  };

  const getResultType = () => {
    const maxScore = Math.max(...Object.values(scores));
    return (Object.keys(scores) as (keyof typeof scores)[]).find(key => scores[key] === maxScore) || 'plan';
  };

  const resetTest = () => {
    setStep(0);
    setScores({ yolo: 0, plan: 0, save: 0, social: 0 });
  };

  const result = step === questions.length ? resultTypes[getResultType()] : null;
  const ResultIcon = result?.icon;

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(`나의 소비 성향은 '${result?.title}'! 당신의 유형도 알아보세요!\n${shareUrl}`)
      .then(() => alert("결과가 클립보드에 복사되었습니다! 친구들에게 공유해보세요."))
      .catch(err => console.error("Share failed", err));
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          소비 성향 테스트
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          나의 소비 습관은 어떤 동물과 닮았을까요?<br />
          숨겨진 부자 DNA를 찾아보세요.
        </p>
      </div>

      {/* Ad Unit: Top */}
      <div className="mb-12 max-w-2xl mx-auto">
        <AdUnit slotId="7788990011" format="auto" label="Spending Test Top Ad" />
      </div>

      <div className="max-w-2xl mx-auto relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {step < questions.length ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -50, rotate: -2 }}
              transition={{ duration: 0.4, ease: "backOut" }}
              className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                  QUESTION {step + 1}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {step + 1} / {questions.length}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-8 leading-tight text-foreground">
                {questions[step].question}
              </h2>

              <div className="space-y-4">
                {questions[step].answers.map((answer, idx) => (
                  <motion.button
                    key={answer.text}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleAnswer(answer.type as keyof typeof scores)}
                    className="w-full text-left p-6 rounded-2xl border-2 border-border bg-background/50 hover:bg-primary/5 hover:border-primary transition-all duration-200 group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium group-hover:text-primary transition-colors">
                        {answer.text}
                      </span>
                      <div className="w-6 h-6 rounded-full border-2 border-border group-hover:border-primary group-hover:bg-primary transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            result && ResultIcon && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`text-center p-10 rounded-3xl shadow-2xl border-4 ${result.bg} ${result.color.replace('text', 'border').replace('600', '200')} relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${result.bg} opacity-50`} />

                <div className="relative z-10">
                  <p className="font-bold text-lg mb-6 tracking-widest opacity-80">MY SPENDING TYPE</p>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-32 h-32 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-xl"
                  >
                    <ResultIcon className={`w-16 h-16 ${result.color}`} />
                  </motion.div>

                  <h2 className={`text-4xl sm:text-5xl font-black mb-6 ${result.color}`}>{result.title}</h2>

                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-inner">
                    <p className="text-lg leading-relaxed text-slate-800 font-medium keep-all">
                      {result.description}
                    </p>
                  </div>

                  {/* Ad Unit: Result Middle */}
                  <div className="my-8 bg-white/50 p-4 rounded-xl">
                    <AdUnit slotId="1100998877" format="rectangle" label="Spending Test Result Ad" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={resetTest}
                      className="py-4 px-8 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-lg"
                    >
                      다시하기
                    </button>
                    <button
                      onClick={handleShare}
                      className={`py-4 px-8 text-white font-bold rounded-xl transition-all shadow-lg ${result.bgColor} hover:brightness-110 flex items-center justify-center gap-2`}
                    >
                      <Share2 className="w-5 h-5" />
                      결과 공유하기
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
