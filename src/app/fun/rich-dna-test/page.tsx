"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Castle, Rocket, Factory, Gem } from "lucide-react";

const questions = [
  {
    question: "1억의 여유자금이 생겼다. 당신의 선택은?",
    answers: [
      { text: "안전한 우량주에 장기 투자한다", type: "buffett" },
      { text: "미래를 바꿀 혁신 기술 스타트업에 과감히 베팅한다", type: "musk" },
      { text: "안정적인 현금 흐름을 위해 부동산(상가)을 알아본다", type: "rockefeller" },
      { text: "아무도 모르는 숨겨진 가치주(보석)를 찾아 나선다", type: "templeton" },
    ],
  },
  {
    question: "시장이 50% 폭락했을 때, 당신의 행동은?",
    answers: [
      { text: "'지금이 기회다' 오히려 빚을 내서 추가 매수한다", type: "buffett" },
      { text: "두렵지만, 나의 선택을 믿고 묵묵히 버틴다", type: "musk" },
      { text: "일단 현금화하고, 시장이 안정될 때까지 기다린다", type: "rockefeller" },
      { text: "남들이 주목하지 않는 다른 나라, 다른 자산에서 기회를 찾는다", type: "templeton" },
    ],
  },
  {
    question: "투자에 있어 당신에게 가장 중요한 원칙은?",
    answers: [
      { text: "'잃지 않는 투자' 원금 보존이 최우선이다", type: "buffett" },
      { text: "'세상을 바꾸는 기술' 미래에 대한 비전과 믿음이다", type: "musk" },
      { text: "'독점적 지위' 경쟁자가 없는 강력한 해자를 구축하는 것이다", type: "rockefeller" },
      { text: "'역발상 투자' 위기 속에서 기회를 포착하는 것이다", type: "templeton" },
    ],
  },
  {
    question: "부를 이룬 후, 당신의 최종 목표는?",
    answers: [
      { text: "'조용한 기부' 부의 대부분을 사회에 환원한다", type: "buffett" },
      { text: "'인류의 발전' 화성 개척, 뇌 과학 등 인류의 미래에 투자한다", type: "musk" },
      { text: "'지속가능한 유산' 후대가 이어갈 수 있는 거대한 시스템을 구축한다", type: "rockefeller" },
      { text: "'새로운 지평' 아무도 가보지 못한 새로운 투자 영역을 개척한다", type: "templeton" },
    ],
  },
];

const resultTypes = {
  buffett: {
    title: "워렌 버핏",
    icon: Castle,
    description: "가치 투자의 살아있는 전설. 당신은 기업의 내재 가치를 보고, 시장의 소음에도 흔들리지 않는 강철 멘탈의 소유자입니다. '복리'라는 눈덩이를 굴려 거대한 부를 쌓을 '시간의 마법사' 타입입니다.",
    color: "text-blue-600",
    bg: "bg-blue-600/10",
  },
  musk: {
    title: "일론 머스크",
    icon: Rocket,
    description: "세상을 바꾸는 혁신가. 당신은 리스크를 두려워하지 않으며, 미래에 대한 확신과 대담한 상상력으로 세상을 놀라게 합니다. '하이 리스크, 하이 리턴'을 추구하며, 불가능에 도전하는 '미래의 설계자' 타입입니다.",
    color: "text-red-600",
    bg: "bg-red-600/10",
  },
  rockefeller: {
    title: "존 D. 록펠러",
    icon: Factory,
    description: "석유의 왕, 부의 시스템을 만든 거인. 당신은 압도적인 시장 지배력과 독점적 지위를 통해 부를 축적하는 능력이 탁월합니다. 경쟁자를 압도하고, 거대한 부의 제국을 건설할 '시스템의 지배자' 타입입니다.",
    color: "text-gray-700",
    bg: "bg-gray-700/10",
  },
  templeton: {
    title: "존 템플턴",
    icon: Gem,
    description: "월가의 영적 투자자. 당신은 비관론이 극에 달했을 때가 최고의 기회임을 알고 있습니다. 남들이 공포에 떨 때 과감히 투자하고, 위기 속에서 숨겨진 보석을 찾아내는 '역발상의 대가' 타입입니다.",
    color: "text-purple-600",
    bg: "bg-purple-600/10",
  },
};

export default function RichDnaTestPage() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ buffett: 0, musk: 0, rockefeller: 0, templeton: 0 });

  const handleAnswer = (type: keyof typeof scores) => {
    setScores(prev => ({ ...prev, [type]: prev[type] + 1 }));
    setStep(prev => prev + 1);
  };

  const getResultType = () => {
    const maxScore = Math.max(...Object.values(scores));
    return (Object.keys(scores) as (keyof typeof scores)[]).find(key => scores[key] === maxScore) || 'buffett';
  };

  const resetTest = () => {
    setStep(0);
    setScores({ buffett: 0, musk: 0, rockefeller: 0, templeton: 0 });
  };

  const result = step === questions.length ? resultTypes[getResultType()] : null;
  const ResultIcon = result?.icon;

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(`나의 부자 DNA는 '${result?.title}' 타입! 당신의 DNA도 확인해보세요!\n${shareUrl}`)
      .then(() => alert("결과가 클립보드에 복사되었습니다! 친구들에게 공유해보세요."))
      .catch(err => console.error("Share failed", err));
  };

  return (
    <main className="w-full max-w-2xl mx-auto px-4 py-12 sm:py-16">
      <AnimatePresence mode="wait">
        {step < questions.length ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-10">
              <p className="text-lg font-semibold text-primary">Question {step + 1}</p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mt-2">
                {questions[step].question}
              </h1>
            </div>
            <div className="space-y-4">
              {questions[step].answers.map((answer) => (
                <button
                  key={answer.text}
                  onClick={() => handleAnswer(answer.type as keyof typeof scores)}
                  className="w-full text-left p-5 rounded-xl border border-border bg-card hover:bg-secondary hover:border-primary transition-all duration-200 shadow-sm"
                >
                  <p className="text-lg font-medium text-foreground">{answer.text}</p>
                </button>
              ))}
            </div>
            <div className="mt-8 text-center text-sm text-muted-foreground">
              {step + 1} / {questions.length}
            </div>
          </motion.div>
        ) : (
          result && ResultIcon && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`text-center p-8 rounded-2xl shadow-2xl border ${result.bg} border-current`}
            >
              <p className="font-semibold">당신의 부자 DNA는...</p>
              <div className="w-24 h-24 mx-auto my-4 bg-background rounded-full flex items-center justify-center shadow-inner">
                  <ResultIcon className={`w-12 h-12 ${result.color}`} />
              </div>
              <h2 className={`text-4xl font-bold ${result.color}`}>{result.title} 타입</h2>
              <p className="mt-4 max-w-md mx-auto text-foreground/80 leading-relaxed">{result.description}</p>
              <div className="mt-8 flex gap-4 justify-center">
                <button
                  onClick={resetTest}
                  className="py-2 px-6 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  다시하기
                </button>
                <button
                  onClick={handleShare}
                  className={`py-2 px-6 text-white font-bold rounded-lg transition-all shadow-lg ${result.color.replace('text-', 'bg-')} hover:brightness-110`}
                >
                  <Share2 className="inline-block w-4 h-4 mr-2"/>
                  결과 공유하기
                </button>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </main>
  );
}
