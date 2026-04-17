"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Share2, Brain } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const questions = [
  {
    axis: 'EI',
    question: "금융 정보를 주로 어디서 얻나요?",
    answers: [
      { text: "친구, 가족, 전문가 등 다른 사람과의 대화", value: 'E' },
      { text: "뉴스, 리포트, 나만의 리서치", value: 'I' },
    ],
  },
  {
    axis: 'SN',
    question: "새로운 투자 상품을 마주했을 때, 당신의 판단 기준은?",
    answers: [
      { text: "과거 데이터, 수익률, 구체적인 숫자와 실적", value: 'S' },
      { text: "미래 성장 가능성, 시장의 흐름, 직감", value: 'N' },
    ],
  },
  {
    axis: 'TF',
    question: "투자 결정을 내릴 때 가장 중요하게 생각하는 것은?",
    answers: [
      { text: "논리적 분석과 데이터, 객관적인 수치", value: 'T' },
      { text: "내 가치관에 부합하는지, 사회적 영향", value: 'F' },
    ],
  },
  {
    axis: 'JP',
    question: "투자 포트폴리오를 구성할 때 당신의 스타일은?",
    answers: [
      { text: "계획을 세우고 규칙적으로 관리, 체계적인 접근", value: 'J' },
      { text: "시장 상황에 유연하게 대응, 기회가 생기면 빠르게 행동", value: 'P' },
    ],
  },
];

const MBTI_RESULTS: Record<string, { title: string; emoji: string; desc: string; strategy: string; color: string }> = {
  ENTJ: { title: "공격적 성장 투자자", emoji: "🚀", desc: "당신은 대담한 전략가입니다.", strategy: "성장주, 나스닥 ETF, VC 투자", color: "text-red-500" },
  INTJ: { title: "퀀트 전략가", emoji: "📊", desc: "데이터로 시장을 정복합니다.", strategy: "팩터 투자, 알고리즘, 섹터 ETF", color: "text-purple-500" },
  ENTP: { title: "트렌드 선도 투자자", emoji: "⚡", desc: "새로운 기회를 가장 먼저 포착합니다.", strategy: "테크 주식, 암호화폐, IPO", color: "text-orange-500" },
  INTP: { title: "가치 분석 투자자", emoji: "🔍", desc: "숨겨진 가치를 발굴하는 연구자입니다.", strategy: "가치주, 워렌버핏 방식, 저PER", color: "text-blue-500" },
  ESTJ: { title: "안정 추구 투자자", emoji: "🏛️", desc: "안전하고 체계적으로 부를 쌓습니다.", strategy: "배당주, 국채, 정기예금", color: "text-green-500" },
  ISTJ: { title: "장기 적립식 투자자", emoji: "🌱", desc: "꾸준함이 최고의 전략임을 압니다.", strategy: "S&P500 ETF, 인덱스 펀드", color: "text-teal-500" },
  ESFJ: { title: "사회적 가치 투자자", emoji: "🤝", desc: "세상을 바꾸는 투자를 합니다.", strategy: "ESG 펀드, 사회적 기업", color: "text-pink-500" },
  ISFJ: { title: "보수적 자산 보호자", emoji: "🛡️", desc: "자산을 지키는 것이 최우선입니다.", strategy: "예금, 금, 채권, 부동산", color: "text-slate-500" },
  ENFJ: { title: "임팩트 투자자", emoji: "🌟", desc: "사람과 세상에 투자합니다.", strategy: "스타트업, 임팩트 펀드", color: "text-yellow-500" },
  INFJ: { title: "철학적 가치 투자자", emoji: "♻️", desc: "신념에 따라 투자합니다.", strategy: "친환경, 윤리적 투자", color: "text-emerald-500" },
  ENFP: { title: "테마 투자 선구자", emoji: "🎯", desc: "트렌드를 읽고 기회를 잡습니다.", strategy: "테마 ETF, 신재생에너지, AI", color: "text-cyan-500" },
  INFP: { title: "의미 중심 투자자", emoji: "💫", desc: "나만의 투자 철학이 있습니다.", strategy: "개인화된 포트폴리오, ESG", color: "text-violet-500" },
  ESTP: { title: "단기 트레이더", emoji: "⚔️", desc: "빠른 판단으로 수익을 냅니다.", strategy: "스윙, 단기 매매, 선물", color: "text-red-600" },
  ISTP: { title: "기술적 분석 투자자", emoji: "📈", desc: "차트와 기술로 시장을 읽습니다.", strategy: "기술적 분석, 고빈도 매매", color: "text-indigo-500" },
  ESFP: { title: "트렌디 소비 투자자", emoji: "🛍️", desc: "트렌드를 소비하고 투자합니다.", strategy: "소비재 주식, 유통, 엔터", color: "text-rose-500" },
  ISFP: { title: "감성 가치 투자자", emoji: "🎨", desc: "아름다움과 가치를 동시에 추구합니다.", strategy: "아트, 명품, 실물 자산", color: "text-amber-500" },
};

export default function FinancialMBTIPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);

  const handleAnswer = (axis: string, value: string) => {
    const newAnswers = { ...answers, [axis]: value };
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(prev => prev + 1);
    } else {
      const mbti = 
        (newAnswers.EI || 'E') + 
        (newAnswers.SN || 'S') + 
        (newAnswers.TF || 'T') + 
        (newAnswers.JP || 'J');
      setResult(mbti);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  const resultData = result ? (MBTI_RESULTS[result] || MBTI_RESULTS.INTJ) : null;

  return (
    <main className="w-full max-w-4xl mx-auto px-4 pt-28 pb-20">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/50 mb-5">
          <Brain className="w-8 h-8 text-purple-500" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
          파이낸셜 <span className="text-purple-600">MBTI</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          나의 투자 성향을 MBTI로 알아보세요.
        </p>
      </div>

      <div className="max-w-3xl mx-auto relative min-h-[500px]">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key={"question-" + step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="toss-card p-8 sm:p-12"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="text-sm font-bold text-purple-500 bg-purple-500/10 px-4 py-1.5 rounded-full">
                  Q{step + 1} / {questions.length}
                </span>
                <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: ((step + 1) / questions.length * 100) + "%" }}
                  />
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-10">
                {questions[step].question}
              </h2>

              <div className="grid gap-4">
                {questions[step].answers.map((answer, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(questions[step].axis, answer.value)}
                    className="w-full text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 transition-all group"
                  >
                    {answer.text}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="toss-card p-10 text-center">
                <p className="text-7xl mb-6">{resultData?.emoji}</p>
                <div className="inline-block px-4 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 text-purple-600 dark:text-purple-400 text-sm font-bold mb-4">
                  {result} 투자자
                </div>
                <h2 className={"text-3xl font-black mb-4 " + resultData?.color}>{resultData?.title}</h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg mb-6">{resultData?.desc}</p>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                  <p className="text-sm font-bold text-slate-500 mb-2">추천 투자 전략</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">{resultData?.strategy}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={reset} className="toss-button-secondary flex-1">
                  <RefreshCw size={18} /> 다시 하기
                </button>
                <button
                  onClick={() => navigator.share ? navigator.share({ title: "파이낸셜 MBTI", text: "나의 투자 MBTI는 " + result + "!", url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}
                  className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-[16px] font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={18} /> 공유하기
                </button>
              </div>

              <AdUnit slotId="9988776655" format="auto" label="Financial MBTI Result Ad" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}