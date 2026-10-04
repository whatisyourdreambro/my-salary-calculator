"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, RefreshCw, TrendingUp } from "lucide-react";
import ResultSharePanel from "@/components/ResultSharePanel";
import Link from "@/components/AppLink";
import { InArticleAd } from "@/components/AdPlacement";

// 15 Logic Questions (Preserved)
const questions = [
 {
 id: 1,
 question: "다음 수열의 빈칸에 들어갈 숫자는? 2, 4, 8, 16, (?)",
 options: ["24", "30", "32", "64"],
 answer: 2,
 explanation: "이전 숫자에 2를 곱하는 규칙입니다."
 },
 {
 id: 2,
 question: "어제가 월요일이라면, 오늘은 무슨 요일인가?",
 options: ["월요일", "화요일", "수요일", "목요일"],
 answer: 1,
 explanation: "어제가 월요일이면 오늘은 화요일입니다."
 },
 {
 id: 3,
 question: "어떤 달에는 30일이 있고, 어떤 달에는 31일이 있다. 28일이 있는 달은 몇 개인가?",
 options: ["1개", "6개", "11개", "12개"],
 answer: 3,
 explanation: "모든 달에는 28일이 포함되어 있습니다."
 },
 {
 id: 4,
 question: "알약 3개를 지금 첫 번째부터 30분 간격으로 하나씩 먹는다고 가정하면, 세 번째까지 걸리는 시간은?",
 options: ["30분", "60분", "90분", "120분"],
 answer: 1,
 explanation: "0분(1개), 30분(2개), 60분(3개). 총 60분입니다."
 },
 {
 id: 5,
 question: "달리기 경주에서 2등을 추월했다. 당신의 등수는?",
 options: ["1등", "2등", "3등", "탈락"],
 answer: 1,
 explanation: "2등을 추월하면 당신이 2등이 됩니다."
 },
 {
 id: 6,
 question: "다음 중 성격이 다른 하나는?",
 options: ["사과", "배", "포도", "당근"],
 answer: 3,
 explanation: "당근은 채소이고 나머지는 과일입니다."
 },
 {
 id: 7,
 question: "1부터 100까지의 숫자에 9는 몇 번 들어가는가?",
 options: ["10번", "11번", "19번", "20번"],
 answer: 3,
 explanation: "9, 19... 89 (9개) + 90~99 (11개) = 20번."
 },
 {
 id: 8,
 question: "철수의 아빠에게 자녀가 모두 5명 있다. 그중 네 자녀의 이름은 일순, 이순, 삼순, 사순이다. 나머지 한 자녀의 이름은?",
 options: ["오순", "육순", "철수", "막순"],
 answer: 2,
 explanation: "철수의 아빠이므로 철수도 다섯 자녀 중 한 명입니다. 다른 네 자녀가 모두 제시되어 남은 이름은 철수입니다."
 },
 {
 id: 9,
 question: "정사각형의 한 꼭짓점에서 만나는 두 변을 직선으로 잘라 작은 삼각형만 떼어낸다면, 남은 도형의 변은 몇 개인가?",
 options: ["3개", "4개", "5개", "6개"],
 answer: 2,
 explanation: "직선으로 자르면 모서리가 하나 더 생깁니다."
 },
 {
 id: 10,
 question: "다음은 양방향 짝짓기 규칙입니다: 1↔5, 2↔25, 3↔125, 4↔625. 5의 짝은? (거듭제곱 수열 문제가 아닙니다.)",
 options: ["3125", "1", "5", "0"],
 answer: 1,
 explanation: "양방향 짝짓기에서 1과 5는 서로 짝이므로, 5의 짝은 1입니다."
 },
 {
 id: 11,
 question: "A>B, C>B, D>A, D<C. 가장 키가 작은 사람은?",
 options: ["A", "B", "C", "D"],
 answer: 1,
 explanation: "C > D > A > B 순서입니다."
 },
 {
 id: 12,
 question: "다음 단어들의 공통된 받침에 대한 설명은? (칼, 불, 물, 풀)",
 options: ["받침이 ㄹ이다", "위험하다", "자연물이다", "한 글자이다"],
 answer: 0,
 explanation: "모두 'ㄹ' 받침을 가지고 있습니다."
 },
 {
 id: 13,
 question: "A, C, F, J, O, (?)",
 options: ["S", "T", "U", "V"],
 answer: 2,
 explanation: "+2, +3, +4, +5 이므로 다음은 +6(U)입니다."
 },
 {
 id: 14,
 question: "성냥개비 6개로 정삼각형 4개를 만드는 방법은?",
 options: ["평면", "입체(피라미드)", "쪼개기", "불가능"],
 answer: 1,
 explanation: "정사면체(삼각뿔)를 만들면 됩니다."
 },
 {
 id: 15,
 question: "어두운 방, 성냥 1개. 양초/난로/버너 중 무엇을 먼저?",
 options: ["양초", "난로", "버너", "성냥"],
 answer: 3,
 explanation: "성냥을 켜야 불을 붙일 수 있습니다."
 }
];

export default function IQTestClient() {
 const [currentQuestion, setCurrentQuestion] = useState(0);
 const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
 const [showResult, setShowResult] = useState(false);
 const [score, setScore] = useState(0);
 const [pending, setPending] = useState(false);
 const pendingRef = useRef(false);
 const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

 useEffect(() => () => {
 if (advanceTimer.current !== null) clearTimeout(advanceTimer.current);
 advanceTimer.current = null;
 pendingRef.current = false;
 }, []);

 const handleAnswer = (optionIndex: number) => {
 if (pendingRef.current || showResult) return;
 pendingRef.current = true;
 setPending(true);
 const newAnswers = [...answers];
 newAnswers[currentQuestion] = optionIndex;
 setAnswers(newAnswers);

 if (currentQuestion < questions.length - 1) {
 advanceTimer.current = setTimeout(() => {
 setCurrentQuestion(curr => curr + 1);
 advanceTimer.current = null;
 pendingRef.current = false;
 setPending(false);
 }, 300);
 } else {
 calculateResult(newAnswers);
 }
 };

 const calculateResult = (finalAnswers: number[]) => {
 let correctCount = 0;
 finalAnswers.forEach((ans, idx) => {
 if (ans === questions[idx].answer) correctCount++;
 });
 setScore(Math.round((correctCount / questions.length) * 100) + 50);
 setShowResult(true);
 };

 const resetTest = () => {
 if (advanceTimer.current !== null) clearTimeout(advanceTimer.current);
 advanceTimer.current = null;
 pendingRef.current = false;
 setPending(false);
 setCurrentQuestion(0);
 setAnswers(Array(questions.length).fill(-1));
 setShowResult(false);
 setScore(0);
 };

 return (
 <main className="w-full min-h-screen bg-canvas font-sans relative">

 {/* Hero Section */}
 <section className="relative pt-28 pb-14 text-center overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-primary via-white to-primary/80 -z-10" />
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/15 rounded-full blur-[120px] -z-10" />
 <div className="max-w-4xl mx-auto px-4">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-primary/30 border border-primary/50 text-primary mb-6 shadow-md">
 <Brain size={32} />
 </div>
 <h1 className="text-4xl font-black tracking-tight text-navy mb-4">
 직장인 <span className="text-primary">논리 퀴즈</span>
 </h1>
 <p className="text-lg text-faint-blue font-medium">
 재미로 푸는 참고용 퀴즈입니다.<br />
 15개의 논리 문제가 당신을 기다립니다.
 </p>
 </div>
 </section>

 {/* Ad Unit: Top - REMOVED */}

 <div className="max-w-2xl mx-auto px-4 pb-20 relative z-10">
 <AnimatePresence mode="wait">
 {!showResult ? (
 <motion.div
 key="question"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="duotone-card p-8"
 >
 {/* Progress Bar */}
 <div className="mb-8">
 <div className="flex justify-between text-xs font-bold text-faint-blue mb-2 uppercase tracking-wider">
 <span>Question {currentQuestion + 1}</span>
 <span>{questions.length} Total</span>
 </div>
 <div className="h-2 bg-canvas-dark rounded-full overflow-hidden">
 <motion.div
 className="h-full bg-primary"
 initial={{ width: 0 }}
 animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
 />
 </div>
 </div>

 {/* Question */}
 <h2 className="text-xl md:text-2xl font-bold text-navy mb-8 leading-relaxed">
 {questions[currentQuestion].question}
 </h2>

 {/* Options */}
 <div className="space-y-3">
 {questions[currentQuestion].options.map((option, index) => (
 <button
 key={index}
 onClick={() => handleAnswer(index)}
 disabled={pending}
 className="w-full p-5 text-left rounded-xl border border-white/5 bg-white/5 hover:bg-primary/20 hover:border-primary/50 transition-all font-medium text-muted-blue active:scale-[0.98] group"
 >
 <span className="inline-block w-6 h-6 rounded-full bg-electric/40 text-xs text-center leading-6 mr-3 text-faint-blue group-hover:text-primary">
 {String.fromCharCode(65 + index)}
 </span>
 <span className="group-hover:text-navy transition-colors">
 {option}
 </span>
 </button>
 ))}
 </div>
 </motion.div>
 ) : (
 <motion.div
 key="result"
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 transition={{ duration: 0.5, ease: "backOut" }}
 className="relative"
 >
 {/* Result Card */}
 <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 relative z-10">
 {/* Header Background */}
 <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-primary/50 via-primary/50 to-primary/80 opacity-50" />

 <div className="relative pt-20 px-6 pb-10 text-center">
 {/* Score Badge */}
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 0.2, type: "spring" }}
 className="w-48 h-48 mx-auto bg-electric/50 rounded-full shadow-2xl flex flex-col items-center justify-center mb-8 border-4 border-primary/30 backdrop-blur-xl relative z-20 ring-4 ring-black/20"
 >
 <span className="text-sm font-bold text-faint-blue uppercase tracking-widest mb-1">퀴즈 참고 점수</span>
 <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/80 tracking-tighter">
 {score}
 </span>
 <div className="absolute -bottom-4 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-white/10">
 {score > 130 ? "높은 퀴즈 점수" : score > 110 ? "좋은 퀴즈 점수" : "참고 점수"}
 </div>
 </motion.div>

 <h2 className="text-3xl md:text-4xl font-black text-navy mb-2 tracking-tight">
 퀴즈 결과
 </h2>
 <p className="text-faint-blue mb-10 font-medium">
 참고 결과 • {new Date().toLocaleDateString()}<br />
 표준화된 지능검사나 공식 IQ 결과가 아닙니다.
 </p>

 {/* Action Buttons */}
 <div className="flex flex-col gap-4 max-w-sm mx-auto mb-12">
 <button
 onClick={resetTest}
 className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 font-bold text-muted-blue transition-all flex items-center justify-center gap-2"
 >
 <RefreshCw size={18} /> 다시 도전하기
 </button>
 {/* Fun Hub Link */}
 <Link
 href="/fun"
 className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/80 text-white font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
 >
 <TrendingUp size={18} /> 다른 테스트 하러가기
 </Link>
 </div>

 <div className="flex justify-center mb-12">
 <ResultSharePanel resultKey={JSON.stringify([answers, score])}
 title={`나의 논리 퀴즈 참고 점수: ${score}점`}
 description={`재미로 푸는 논리 퀴즈 #MoneySalary`}
 />
 </div>

 {/* 결과 인접 광고 */}
 <div className="mb-12">
 <InArticleAd />
 </div>

 {/* Answers Section */}
 <div className="text-left bg-electric/30 p-6 rounded-3xl border border-white/5">
 <button
 onClick={() => document.getElementById('answers-list')?.classList.toggle('hidden')}
 className="w-full flex items-center justify-between font-bold text-muted-blue mb-2 group"
 >
 <span className="flex items-center gap-2 group-hover:text-navy transition-colors">
 <CheckCircle2 className="text-primary" size={20} /> 정답 및 해설 보기
 </span>
 <span className="text-xs text-muted-blue">Click to toggle</span>
 </button>

 <div id="answers-list" className="hidden space-y-6 mt-6 border-t border-white/5 pt-6">
 {questions.map((q, idx) => (
 <div key={q.id} className="border-b border-white/5 last:border-0 pb-4 last:pb-0">
 <p className="font-bold text-sm mb-2 text-muted-blue">Q{idx + 1}. {q.question}</p>
 <p className="text-xs text-faint-blue mb-2">정답: <span className="font-bold text-primary">{q.options[q.answer]}</span></p>
 <p className="text-xs text-faint-blue bg-white/5 p-3 rounded-xl">
 💡 {q.explanation}
 </p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 
 </div>
 </main>
 );
}
