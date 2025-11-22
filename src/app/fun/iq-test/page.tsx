"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Share2, CheckCircle2, XCircle, RefreshCw, Lightbulb } from "lucide-react";
import AdUnit from "@/components/AdUnit";

// 15 Logic Questions
const questions = [
    {
        id: 1,
        question: "다음 수열의 빈칸에 들어갈 숫자는? 2, 4, 8, 16, (?)",
        options: ["24", "30", "32", "64"],
        answer: 2, // 32
        explanation: "이전 숫자에 2를 곱하는 규칙입니다."
    },
    {
        id: 2,
        question: "어제는 내일의 모레 전날이다. 오늘은 무슨 요일인가? (가정: 어제는 월요일)",
        options: ["월요일", "화요일", "수요일", "목요일"],
        answer: 1, // 화요일
        explanation: "어제가 월요일이면 오늘은 화요일입니다. 내일(수)의 모레(금) 전날(목)은 어제(월)와 관계없는 문장 함정입니다. 단순히 어제가 월요일이면 오늘은 화요일입니다."
    },
    {
        id: 3,
        question: "어떤 달에는 30일이 있고, 어떤 달에는 31일이 있다. 28일이 있는 달은 몇 개인가?",
        options: ["1개", "6개", "11개", "12개"],
        answer: 3, // 12개
        explanation: "모든 달에는 28일이 포함되어 있습니다."
    },
    {
        id: 4,
        question: "의사가 당신에게 알약 3개를 주며 30분마다 하나씩 먹으라고 했다. 약을 다 먹는 데 걸리는 시간은?",
        options: ["30분", "60분", "90분", "120분"],
        answer: 1, // 60분
        explanation: "0분(1개), 30분(2개), 60분(3개). 총 60분입니다."
    },
    {
        id: 5,
        question: "달리기 경주에서 2등을 추월했다. 당신의 등수는?",
        options: ["1등", "2등", "3등", "탈락"],
        answer: 1, // 2등
        explanation: "2등을 추월하면 당신이 2등이 됩니다."
    },
    {
        id: 6,
        question: "다음 중 성격이 다른 하나는?",
        options: ["사과", "배", "포도", "당근"],
        answer: 3, // 당근
        explanation: "당근은 채소이고 나머지는 과일입니다."
    },
    {
        id: 7,
        question: "1부터 100까지의 숫자에 9는 몇 번 들어가는가?",
        options: ["10번", "11번", "19번", "20번"],
        answer: 3, // 20번
        explanation: "9, 19, 29... 89 (9개) + 90~99 (11개) = 20번."
    },
    {
        id: 8,
        question: "철수의 아빠는 5명의 딸이 있다. 일순, 이순, 삼순, 사순... 막내의 이름은?",
        options: ["오순", "육순", "철수", "막순"],
        answer: 2, // 철수
        explanation: "문제에 '철수의 아빠'라고 명시되어 있습니다."
    },
    {
        id: 9,
        question: "사각형의 모서리 하나를 자르면 모서리는 몇 개가 되는가?",
        options: ["3개", "4개", "5개", "6개"],
        answer: 2, // 5개
        explanation: "사각형 모서리를 직선으로 자르면 모서리가 하나 더 생겨 5개가 됩니다."
    },
    {
        id: 10,
        question: "물음표에 들어갈 숫자는? 1=5, 2=25, 3=125, 4=625, 5=?",
        options: ["3125", "1", "5", "0"],
        answer: 1, // 1
        explanation: "문제 처음에 1=5라고 했으므로 5=1입니다."
    },
    {
        id: 11,
        question: "A는 B보다 키가 크고, B는 C보다 키가 작다. D는 A보다 크고 C보다 작다. 가장 키가 작은 사람은?",
        options: ["A", "B", "C", "D"],
        answer: 1, // B
        explanation: "D < C, B < C, A > B, D > A. 순서대로 나열하면 C > D > A > B. 따라서 B가 가장 작습니다."
    },
    {
        id: 12,
        question: "다음 단어들의 공통점은? (칼, 불, 물, 풀)",
        options: ["받침이 ㄹ이다", "위험하다", "자연물이다", "한 글자이다"],
        answer: 0, // 받침이 ㄹ이다
        explanation: "모두 'ㄹ' 받침을 가지고 있습니다."
    },
    {
        id: 13,
        question: "빈칸에 들어갈 알파벳은? A, C, F, J, O, (?)",
        options: ["S", "T", "U", "V"],
        answer: 2, // U
        explanation: "+2(C), +3(F), +4(J), +5(O), +6(U) 순서로 건너뜁니다."
    },
    {
        id: 14,
        question: "성냥개비 6개로 정삼각형 4개를 만드는 방법은?",
        options: ["평면으로 만든다", "입체(피라미드)로 만든다", "성냥을 쪼갠다", "불가능하다"],
        answer: 1, // 입체(피라미드)로 만든다
        explanation: "정사면체(삼각뿔)를 만들면 됩니다."
    },
    {
        id: 15,
        question: "당신은 어두운 방에 성냥 하나를 들고 들어갔다. 방에는 양초, 난로, 가스버너가 있다. 무엇을 먼저 켜야 하는가?",
        options: ["양초", "난로", "가스버너", "성냥"],
        answer: 3, // 성냥
        explanation: "성냥을 먼저 켜야 다른 것을 켤 수 있습니다."
    }
];

export default function IQTestPage() {
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
        setScore(Math.round((correctCount / questions.length) * 100) + 50); // Mock IQ calculation: Base 50 + score
        setShowResult(true);
    };

    const resetTest = () => {
        setCurrentQuestion(0);
        setAnswers(Array(questions.length).fill(-1));
        setShowResult(false);
        setScore(0);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: '나의 IQ 테스트 결과',
                text: `제 IQ는 ${score}입니다! 당신의 IQ는 얼마인가요? #Moneysalary #IQTest`,
                url: window.location.href,
            });
        } else {
            alert("공유하기를 지원하지 않는 브라우저입니다.");
        }
    };

    return (
        <main className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 font-sans">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white mb-6 shadow-lg shadow-indigo-500/30">
                        <Brain size={32} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
                        멘사급 <span className="text-indigo-500">IQ 테스트</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        15개의 논리 문제를 풀어 당신의 지능 지수를 확인하세요.
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
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8"
                        >
                            {/* Progress Bar */}
                            <div className="mb-8">
                                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                                    <span>Question {currentQuestion + 1}</span>
                                    <span>{questions.length} Total</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-indigo-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Question */}
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-relaxed">
                                {questions[currentQuestion].question}
                            </h2>

                            {/* Options */}
                            <div className="space-y-3">
                                {questions[currentQuestion].options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(index)}
                                        className="w-full p-4 text-left rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-medium text-slate-700 dark:text-slate-300 active:scale-[0.98]"
                                    >
                                        <span className="inline-block w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs text-center leading-6 mr-3 text-slate-500">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center"
                        >
                            <div className="mb-8">
                                <div className="inline-block p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
                                    <Lightbulb size={48} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">테스트 완료!</h2>
                                <p className="text-slate-500">당신의 추정 IQ는...</p>
                            </div>

                            <div className="mb-12">
                                <span className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                                    {score}
                                </span>
                                <div className="mt-4 inline-block px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    상위 {score > 130 ? "1%" : score > 110 ? "15%" : "50%"} 수준
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button
                                    onClick={resetTest}
                                    className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={20} /> 다시하기
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-4 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
                                >
                                    <Share2 size={20} /> 결과 공유
                                </button>
                            </div>

                            <div className="text-left bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="text-green-500" size={20} /> 정답 및 해설
                                </h3>
                                <div className="space-y-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {questions.map((q, idx) => (
                                        <div key={q.id} className="border-b border-slate-200 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
                                            <p className="font-medium text-sm mb-1">Q{idx + 1}. {q.question}</p>
                                            <p className="text-xs text-slate-500 mb-2">정답: {q.options[q.answer]}</p>
                                            <p className="text-xs text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">💡 {q.explanation}</p>
                                        </div>
                                    ))}
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
