// src/app/fun/financial-mbti/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2 } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const questions = [
  // E/I: 에너지 방향 (External/Internal)
  { axis: 'EI', question: "금융 정보를 주로 어디서 얻나요?", answers: [{ text: "친구, 동료, 전문가 등 다른 사람과의 대화", value: 'E' }, { text: "책, 뉴스, 리포트 등 혼자만의 리서치", value: 'I' }] },
  // S/N: 인식 기능 (Sensing/iNtuition)
  { axis: 'SN', question: "새로운 투자 상품을 접했을 때, 당신의 판단 기준은?", answers: [{ text: "과거 데이터, 수익률 등 구체적인 숫자와 사실", value: 'S' }, { text: "미래 성장 가능성, 시장의 흐름, 직감", value: 'N' }] },
  // T/F: 판단 기능 (Thinking/Feeling)
  { axis: 'TF', question: "친구가 수익률 100%라며 투자를 권한다면?", answers: [{ text: "'왜?' 논리적으로 이해될 때까지 원리부터 파고든다", value: 'T' }, { text: "'그래?' 친구를 믿고 일단 소액이라도 투자해본다", value: 'F' }] },
  // J/P: 생활 양식 (Judging/Perceiving)
  { axis: 'JP', question: "한 달 예산을 어떻게 관리하나요?", answers: [{ text: "매달 예산을 세우고, 계획에 맞춰 지출한다", value: 'J' }, { text: "특별한 계획 없이, 필요할 때마다 쓴다", value: 'P' }] },
  // E/I
  { axis: 'EI', question: "성공적인 투자 후, 당신의 행동은?", answers: [{ text: "주변 사람들에게 나의 성공 스토리를 공유한다", value: 'E' }, { text: "조용히 다음 투자처를 물색한다", value: 'I' }] },
  // S/N
  { axis: 'SN', question: "부동산(집)을 볼 때, 더 중요하게 생각하는 것은?", answers: [{ text: "현재의 교통, 학군, 인프라 등 실용적인 가치", value: 'S' }, { text: "미래의 개발 호재, 발전 가능성 등 잠재적인 가치", value: 'N' }] },
  // T/F
  { axis: 'TF', question: "돈 문제로 친구와 다퉜을 때, 당신의 해결 방식은?", answers: [{ text: "누가 옳고 그른지, 사실 관계부터 명확히 따진다", value: 'T' }, { text: "일단 친구의 감정을 풀어주고, 관계 회복에 집중한다", value: 'F' }] },
  // J/P
  { axis: 'JP', question: "해외 여행 경비는 어떻게 마련하나요?", answers: [{ text: "여행 6개월 전부터 계획을 세워 돈을 모은다", value: 'J' }, { text: "항공권 특가가 뜨면 일단 지르고 본다", value: 'P' }] },
];

const resultTypes: { [key: string]: { title: string; description: string; keywords: string[] } } = {
  ESTJ: { title: "엄격한 자산 관리자", description: "현실적인 데이터를 기반으로 철저한 계획을 세워 자산을 관리합니다. 리스크를 최소화하고 안정적인 부를 축적하는 데 능숙하지만, 때로는 과감한 결단이 더 큰 기회를 가져올 수 있습니다.", keywords: ["현실주의", "체계적", "리더십"] },
  ISTJ: { title: "신중한 재무 설계사", description: "조용하지만 꼼꼼하게 자신의 재무 포트폴리오를 설계합니다. 모든 투자는 검증된 데이터를 기반으로 하며, 충동적인 결정을 내리는 법이 없습니다. 안정성은 최고지만, 새로운 기회를 놓칠 수도 있습니다.", keywords: ["신중함", "데이터 기반", "안정성"] },
  ESFJ: { title: "사교적인 투자 클럽장", description: "주변 사람들과 금융 정보를 나누며 함께 부자가 되길 꿈꿉니다. 다른 사람의 성공에 기뻐하고, 위험에 처한 사람을 보면 그냥 지나치지 못합니다. 따뜻한 마음씨를 가졌지만, 귀가 얇아 손해를 볼 수도 있습니다.", keywords: ["사교적", "조화로움", "동반성장"] },
  ISFJ: { title: "믿음직한 자산가", description: "가족과 주변 사람들의 재정적 안정을 자신의 가장 큰 목표로 삼습니다. 위험한 투자는 멀리하고, 검증된 안전 자산에 꾸준히 투자하여 모두의 든든한 버팀목이 되어주는 타입입니다.", keywords: ["헌신적", "안정 추구", "책임감"] },
  ESTP: { title: "대담한 승부사", description: "시장의 흐름을 본능적으로 읽고, 기회가 왔을 때 과감하게 베팅할 줄 아는 승부사 기질을 가졌습니다. 단기간에 큰 수익을 얻을 수 있지만, 한 번의 실수로 모든 것을 잃을 수도 있는 하이리스크 하이리턴 타입입니다.", keywords: ["모험가", "순발력", "리스크 감수"] },
  ISTP: { title: "냉철한 분석가", description: "복잡한 시장 상황 속에서도 감정에 휘둘리지 않고, 필요한 데이터만으로 최적의 결정을 내립니다. 최소한의 노력으로 최대의 효율을 추구하며, 조용히 높은 수익률을 기록하는 숨은 고수 타입입니다.", keywords: ["효율성", "논리적", "개인주의"] },
  ESFP: { title: "플렉스하는 인플루언서", description: "돈은 인생을 즐기기 위해 버는 것이라고 생각합니다. 현재의 만족을 위해 과감히 소비하며, 그 모습을 공유하며 다른 사람들에게 영감을 줍니다. 멋진 인생이지만, 노후 준비는 미리 해두는 게 어떨까요?", keywords: ["욜로(YOLO)", "즉흥적", "인싸"] },
  ISFP: { title: "감각적인 아티스트", description: "자신만의 확고한 취향과 감각을 투자에도 적용합니다. 남들이 보지 못하는 가치를 발견하는 능력이 뛰어나지만, 때로는 그 가치를 너무 오래 기다려야 할 수도 있습니다. 마이웨이를 걷는 투자계의 예술가 타입입니다.", keywords: ["예술가 기질", "개성", "마이웨이"] },
  ENTJ: { title: "거침없는 정복자", description: "미래를 예측하고, 거대한 부의 제국을 건설하려는 야망가입니다. 목표 달성을 위해 모든 수단을 동원하며, 과감한 결단력으로 시장을 이끌어갑니다. 크게 성공하거나, 크게 실패할 수 있는 '왕좌의 게임' 플레이어입니다.", keywords: ["야망", "통솔력", "전략가"] },
  INTJ: { title: "완벽주의 전략가", description: "혼자만의 시간 속에서 완벽한 투자 전략을 설계합니다. 미래를 예측하는 통찰력과 치밀한 계획으로 시장을 내려다보며, 자신의 시나리오대로 움직이지 않으면 절대 투자하지 않는 완벽주의자입니다.", keywords: ["전략가", "독립적", "통찰력"] },
  ENFJ: { title: "선한 영향력의 멘토", description: "자신의 성공뿐만 아니라, 모든 사람이 경제적으로 풍요로워지길 바랍니다. 금융 지식을 나누고, 다른 사람의 재정적 성장을 도우며 보람을 느낍니다. 이상적인 리더지만, 때로는 냉정한 판단이 필요합니다.", keywords: ["이타주의", "리더십", "멘토"] },
  INFJ: { title: "신념의 예언가", description: "자신이 믿는 가치와 비전에 모든 것을 겁니다. 당장의 이익보다는, 세상을 더 나은 곳으로 만들 수 있는 투자인지에 더 큰 의미를 둡니다. 깊은 통찰력을 가졌지만, 너무 이상적일 수 있습니다.", keywords: ["신념", "통찰력", "이상주의"] },
  ENTP: { title: "뜨거운 토론가", description: "새로운 투자 아이디어를 발견하고, 다른 사람들과 토론하는 것을 즐깁니다. 끊임없이 새로운 가능성에 도전하지만, 하나의 투자에 오래 집중하지 못하는 경향이 있습니다. 아이디어는 넘치지만, 실행은 한 걸음 부족할 수 있습니다.", keywords: ["지적 호기심", "도전적", "유연함"] },
  INTP: { title: "논리적인 발명가", description: "세상의 모든 금융 모델과 투자 이론을 분석하고, 자신만의 새로운 투자 공식을 발명해냅니다. 논리와 분석에 기반한 투자를 하지만, 때로는 너무 복잡하게 생각하는 경향이 있습니다.", keywords: ["논리", "분석", "지적 탐구"] },
  ENFP: { title: "열정적인 탐험가", description: "새롭고 흥미로운 투자처를 발견하면 즉시 뛰어드는 열정적인 탐험가입니다. 긍정적인 에너지로 주변 사람들에게도 투자 열기를 전파하지만, 금방 싫증을 느끼고 새로운 탐험을 떠날 수 있습니다.", keywords: ["열정", "긍정적", "탐험가"] },
  INFP: { title: "낭만적인 이상가", description: "자신의 신념과 가치에 부합하는 '착한 투자'를 지향합니다. 돈 자체보다는, 그 돈이 어디에 쓰이는지에 더 큰 의미를 둡니다. 아름다운 이상을 가졌지만, 현실적인 수익률은 낮을 수 있습니다.", keywords: ["이상주의", "가치지향", "낭만"] },
};

export default function FinancialMbtiPage() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });

  const handleAnswer = (axis: string, value: string) => {
    const key = value as keyof typeof scores; // Cast the string to a key of the scores object
    setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
    setStep(prev => prev + 1);
  };

  const getResultType = () => {
    const ei = scores.E > scores.I ? 'E' : 'I';
    const sn = scores.S > scores.N ? 'S' : 'N';
    const tf = scores.T > scores.F ? 'T' : 'F';
    const jp = scores.J > scores.P ? 'J' : 'P';
    return `${ei}${sn}${tf}${jp}`;
  };

  const resetTest = () => {
    setStep(0);
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
  };

  const resultKey = step === questions.length ? getResultType() : null;
  const result = resultKey ? resultTypes[resultKey] : null;

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(`나의 금융 MBTI는 '${resultKey} - ${result?.title}'! 당신의 유형도 알아보세요!\n${shareUrl}`)
      .then(() => alert("결과가 클립보드에 복사되었습니다! 친구들에게 공유해보세요."))
      .catch(err => console.error("Share failed", err));
  };

  return (
    <main className="w-full max-w-2xl mx-auto px-4 py-12 sm:py-16">
      <AnimatePresence mode="wait">
        {step < questions.length ? (
          <motion.div key={step} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
            <div className="text-center mb-10">
              <p className="text-lg font-semibold text-primary">MBTI Test</p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mt-2">{questions[step].question}</h1>
            </div>
            <div className="space-y-4">
              {questions[step].answers.map((answer) => (
                <button key={answer.text} onClick={() => handleAnswer(questions[step].axis, answer.value)} className="w-full text-center p-6 rounded-xl border border-border bg-card hover:bg-primary/10 hover:border-primary transition-all duration-200 shadow-sm">
                  <p className="text-xl font-medium text-foreground">{answer.text}</p>
                </button>
              ))}
            </div>
            <div className="mt-8 text-center text-sm text-muted-foreground">{step + 1} / {questions.length}</div>
          </motion.div>
        ) : (
          result && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center">
              <div className="p-8 rounded-2xl shadow-2xl border border-border bg-card">
                <p className="font-semibold text-primary">나의 금융 MBTI 결과</p>
                <h2 className="text-5xl font-bold text-primary my-2">{resultKey}</h2>
                <h3 className="text-2xl font-semibold text-foreground">{result.title}</h3>
                <div className="my-6 space-x-2">
                  {result.keywords.map(kw => <span key={kw} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold">#{kw}</span>)}
                </div>
                <p className="mt-4 max-w-md mx-auto text-muted-foreground leading-relaxed text-left bg-secondary/50 p-4 rounded-lg">{result.description}</p>

                {/* Ad Unit: Result Middle */}
                <div className="my-8">
                  <AdUnit slotId="9988776655" format="auto" label="Financial MBTI Result Ad" />
                </div>

                <div className="mt-8 flex gap-4 justify-center">
                  <button onClick={resetTest} className="py-2 px-6 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-colors">다시하기</button>
                  <button onClick={handleShare} className="py-2 px-6 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-95 transition-all shadow-lg">
                    <Share2 className="inline-block w-4 h-4 mr-2" />결과 공유하기
                  </button>
                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </main>
  );
}
