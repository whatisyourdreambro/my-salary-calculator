"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Share2, Target } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const questions = [
  {
    axis: 'EI',
    question: "금융 정보를 주로 어디서 얻나요?",
    answers: [
      { text: "전문가 또는 타인과의 정보 교류", value: 'E' },
      { text: "독자적인 리포트 분석 및 리서치", value: 'I' },
    ],
  },
  {
    axis: 'SN',
    question: "새로운 투자 상품을 마주했을 때, 당신의 판단 기준은?",
    answers: [
      { text: "과거 실적 데이터 및 구체적인 수치", value: 'S' },
      { text: "미래 성장 가능성 및 거시경제 흐름", value: 'N' },
    ],
  },
  {
    axis: 'TF',
    question: "투자 결정을 내릴 때 가장 중요하게 생각하는 것은?",
    answers: [
      { text: "논리적 분석과 객관적 모델링", value: 'T' },
      { text: "기업의 사회적 영향과 개인의 가치관", value: 'F' },
    ],
  },
  {
    axis: 'JP',
    question: "투자 포트폴리오를 구성할 때 당신의 스타일은?",
    answers: [
      { text: "사전 계획에 따른 체계적인 자산 배분", value: 'J' },
      { text: "시장 상황에 따른 유연한 투자 비중 조절", value: 'P' },
    ],
  },
];

const MBTI_RESULTS: Record<string, { title: string; desc: string; strategy: string; }> = {
  ENTJ: { title: "공격적 성장 투자자", desc: "대담하고 진취적인 전략가입니다.", strategy: "성장주, 나스닥 ETF, 혁신 기술 섹터" },
  INTJ: { title: "퀀트 전략가", desc: "정밀한 데이터로 시장을 개척합니다.", strategy: "팩터 투자, 알고리즘 매매, 섹터 ETF" },
  ENTP: { title: "트렌드 선도 투자자", desc: "새로운 시장 기회를 가장 먼저 포착합니다.", strategy: "이머징 테크, 암호화폐, 신규 상장주" },
  INTP: { title: "가치 분석 투자자", desc: "합리적 가치와 내재적 성장을 중시합니다.", strategy: "가치주, 저평가 우량주 발굴" },
  ESTJ: { title: "안정 추구 투자자", desc: "안전하고 체계적으로 자산을 축적합니다.", strategy: "우량 배당주, 안정형 펀드, 국채" },
  ISTJ: { title: "장기 적립식 투자자", desc: "꾸준한 복리의 마법을 신뢰합니다.", strategy: "S&P500 중심의 인덱스 펀드" },
  ESFJ: { title: "사회적 가치 투자자", desc: "사회적 책임을 다하는 기업에 투자합니다.", strategy: "ESG 펀드, 친환경 에너지 섹터" },
  ISFJ: { title: "보수적 자산 보호자", desc: "자산의 변동성을 최소화하고 가치를 보존합니다.", strategy: "금, 우량 채권, 부동산 리츠" },
  ENFJ: { title: "임팩트 투자자", desc: "세상의 긍정적 변화를 주도하는 투자자입니다.", strategy: "스타트업 펀드, 글로벌 임팩트 투자" },
  INFJ: { title: "철학적 가치 투자자", desc: "본인의 확고한 신념에 부합하는 자산에 투자합니다.", strategy: "윤리적 투자, 친환경 우량 기업" },
  ENFP: { title: "테마 투자 선구자", desc: "패러다임의 변화를 읽어내는 통찰력을 지녔습니다.", strategy: "미래 지향적 테마 ETF, AI" },
  INFP: { title: "의미 중심 투자자", desc: "가치와 의미를 부여할 수 있는 투자처를 찾습니다.", strategy: "장기 비전 기반의 포트폴리오 다각화" },
  ESTP: { title: "단기 모멘텀 투자자", desc: "빠른 판단으로 단기적 시장 차익을 극대화합니다.", strategy: "단기 스윙 매매, 추세 추종" },
  ISTP: { title: "기술적 분석 투자자", desc: "정교한 차트 분석을 통한 기술적 우위를 점합니다.", strategy: "시스템 트레이딩, 고빈도 매매" },
  ESFP: { title: "트렌드 소비 투자자", desc: "라이프스타일과 소비 트렌드를 투자와 접목합니다.", strategy: "글로벌 소비재, K-테크, 엔터테인먼트" },
  ISFP: { title: "대체 자산 투자자", desc: "전통적 자산을 넘어 아름다움과 희소성에 투자합니다.", strategy: "아트, 명품 등 실물 기반 자산" },
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
    <main className="w-full min-h-screen bg-white dark:bg-black px-4 pt-28 pb-20 font-sans">
      <div className="text-center mb-12 border-b border-gray-100 dark:border-gray-900 pb-10">
        <Target className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-900 mb-3">
          투자 성향 분석 (MBTI)
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          귀하의 투자 성향을 체계적으로 분석합니다.
        </p>
      </div>

      <div className="max-w-3xl mx-auto relative min-h-[500px]">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key={"question-" + step}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="toss-card p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-sm uppercase tracking-widest">
                  STEP {step + 1} / {questions.length}
                </span>
                <div className="w-32 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: ((step + 1) / questions.length * 100) + "%" }}
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-900 mb-10">
                {questions[step].question}
              </h2>

              <div className="grid gap-3">
                {questions[step].answers.map((answer, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(questions[step].axis, answer.value)}
                    className="w-full text-left p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-900 font-medium text-slate-700 dark:text-slate-300 transition-all"
                  >
                    {answer.text}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="toss-card p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-t-4 border-t-primary">
                <div className="inline-block px-4 py-1.5 bg-gray-100 dark:bg-gray-900 text-slate-600 dark:text-slate-300 text-sm font-bold tracking-widest uppercase mb-4 rounded-sm">
                  {result} TYPE
                </div>
                <h2 className="text-3xl font-black mb-4 text-primary">{resultData?.title}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 font-medium">{resultData?.desc}</p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 text-left border border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Recommended Strategy</p>
                  <p className="font-bold text-slate-900 dark:text-slate-900">{resultData?.strategy}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={reset} className="toss-button-secondary flex-1 rounded-sm border-none shadow-sm">
                  <RefreshCw size={18} /> Re-test
                </button>
                <button
                  onClick={() => navigator.share ? navigator.share({ title: "투자 성향 분석 결과", text: "나의 투자 성향은 " + result + "!", url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}
                  className="flex-1 py-4 bg-primary hover:bg-primary/90 text-white rounded-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Share2 size={18} /> Share Result
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