"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, RefreshCw, TrendingUp } from "lucide-react";
import AdUnit from "@/components/AdUnit";
import ShareButtons from "@/components/ShareButtons";
import Link from "next/link";

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
        question: "어제는 내일의 모레 전날이다. 오늘은 무슨 요일인가? (가정: 어제는 월요일)",
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
        question: "의사가 당신에게 알약 3개를 주며 30분마다 하나씩 먹으라고 했다. 약을 다 먹는 데 걸리는 시간은?",
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
        question: "철수의 아빠는 5명의 딸이 있다. 일순, 이순, 삼순, 사순... 막내의 이름은?",
        options: ["오순", "육순", "철수", "막순"],
        answer: 2,
        explanation: "문제에 '철수의 아빠'라고 명시되어 있습니다."
    },
    {
        id: 9,
        question: "사각형의 모서리 하나를 자르면 모서리는 몇 개가 되는가?",
        options: ["3개", "4개", "5개", "6개"],
        answer: 2,
        explanation: "직선으로 자르면 모서리가 하나 더 생깁니다."
    },
    {
        id: 10,
        question: "1=5, 2=25, 3=125, 4=625, 5=?",
        options: ["3125", "1", "5", "0"],
        answer: 1,
        explanation: "1=5라면 역으로 5=1입니다."
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
        question: "다음 단어들의 공통점은? (칼, 불, 물, 풀)",
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

    const handleAnswer = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = optionIndex;
        setAnswers(newAnswers);

        if (currentQuestion < questions.length - 1) {
            setTimeout(() => setCurrentQuestion(curr => curr + 1), 300);
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
        setCurrentQuestion(0);
        setAnswers(Array(questions.length).fill(-1));
        setShowResult(false);
        setScore(0);
    };

    return (
        <main className="w-full min-h-screen bg-zinc-950 py-12 px-4 font-sans relative">
            {/* Simple Grid Background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 text-emerald-500 mb-6 shadow-2xl shadow-emerald-500/10">
                        <Brain size={32} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-4">
                        멘사급 <span className="text-emerald-500">IQ 테스트</span>
                    </h1>
                    <p className="text-lg text-zinc-400">
                        상위 1%에 도전하세요.<br />
                        15개의 논리 문제가 당신을 기다립니다.
                    </p>
                </div>

                {/* Ad Unit: Top */}
                <div className="mb-8">
                    <AdUnit slotId="1122334455" format="auto" label="IQ Test Top Ad" />
                </div>

                <AnimatePresence mode="wait">
                    {!showResult ? (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-zinc-900/50 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 p-8"
                        >
                            {/* Progress Bar */}
                            <div className="mb-8">
                                <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                                    <span>Question {currentQuestion + 1}</span>
                                    <span>{questions.length} Total</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-emerald-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Question */}
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
                                {questions[currentQuestion].question}
                            </h2>

                            {/* Options */}
                            <div className="space-y-3">
                                {questions[currentQuestion].options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(index)}
                                        className="w-full p-5 text-left rounded-xl border border-white/5 bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all font-medium text-zinc-300 active:scale-[0.98] group"
                                    >
                                        <span className="inline-block w-6 h-6 rounded-full bg-black/40 text-xs text-center leading-6 mr-3 text-zinc-500 group-hover:text-emerald-400">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span className="group-hover:text-white transition-colors">
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
                            <div className="bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 relative z-10">
                                {/* Header Background */}
                                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-emerald-900/50 via-zinc-900 to-zinc-900 opacity-50" />

                                <div className="relative pt-20 px-6 pb-10 text-center">
                                    {/* Score Badge */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring" }}
                                        className="w-48 h-48 mx-auto bg-black/50 rounded-full shadow-2xl flex flex-col items-center justify-center mb-8 border-4 border-emerald-500/30 backdrop-blur-xl relative z-20 ring-4 ring-black/20"
                                    >
                                        <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">IQ Score</span>
                                        <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-400 tracking-tighter">
                                            {score}
                                        </span>
                                        <div className="absolute -bottom-4 bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-white/10">
                                            {score > 130 ? "MENSA LEVEL" : score > 110 ? "HIGH IQ" : "NORMAL"}
                                        </div>
                                    </motion.div>

                                    <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                                        Test Certified
                                    </h2>
                                    <p className="text-zinc-500 mb-10 font-medium">
                                        Official Result • {new Date().toLocaleDateString()}
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-4 max-w-sm mx-auto mb-12">
                                        <button
                                            onClick={resetTest}
                                            className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 font-bold text-zinc-300 transition-all flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw size={18} /> 다시 도전하기
                                        </button>
                                        {/* Fun Hub Link */}
                                        <Link
                                            href="/fun"
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                                        >
                                            <TrendingUp size={18} /> 다른 테스트 하러가기
                                        </Link>
                                    </div>

                                    <div className="flex justify-center mb-12">
                                        <ShareButtons
                                            title={`나의 멘사급 IQ 테스트 결과: ${score}점`}
                                            description={`상위 1%에 도전해보세요! #MoneySalary #IQTest`}
                                        />
                                    </div>

                                    {/* Answers Section */}
                                    <div className="text-left bg-black/30 p-6 rounded-3xl border border-white/5">
                                        <button
                                            onClick={() => document.getElementById('answers-list')?.classList.toggle('hidden')}
                                            className="w-full flex items-center justify-between font-bold text-zinc-300 mb-2 group"
                                        >
                                            <span className="flex items-center gap-2 group-hover:text-white transition-colors">
                                                <CheckCircle2 className="text-emerald-500" size={20} /> 정답 및 해설 보기
                                            </span>
                                            <span className="text-xs text-zinc-600">Click to toggle</span>
                                        </button>

                                        <div id="answers-list" className="hidden space-y-6 mt-6 border-t border-white/5 pt-6">
                                            {questions.map((q, idx) => (
                                                <div key={q.id} className="border-b border-white/5 last:border-0 pb-4 last:pb-0">
                                                    <p className="font-bold text-sm mb-2 text-zinc-200">Q{idx + 1}. {q.question}</p>
                                                    <p className="text-xs text-zinc-500 mb-2">정답: <span className="font-bold text-emerald-400">{q.options[q.answer]}</span></p>
                                                    <p className="text-xs text-zinc-400 bg-white/5 p-3 rounded-xl">
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

                {/* Ad Unit: Bottom */}
                <div className="mt-12">
                    <AdUnit slotId="9988776655" format="auto" label="IQ Test Bottom Ad" />
                </div>
            </div>
        </main>
    );
}
