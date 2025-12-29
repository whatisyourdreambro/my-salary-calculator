"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Castle, Rocket, Factory, Gem, ArrowRight, RefreshCw, TrendingUp } from "lucide-react";
import AdUnit from "@/components/AdUnit";
import Link from 'next/link';

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
        subtitle: "가치 투자의 현인",
        icon: Castle,
        description: "당신은 기업의 내재 가치를 보고, 시장의 소음에도 흔들리지 않는 강철 멘탈의 소유자입니다. '복리'라는 눈덩이를 굴려 거대한 부를 쌓을 '시간의 마법사' 타입입니다.",
        color: "text-blue-400",
        gradient: "from-blue-500 to-cyan-500",
        bg: "bg-blue-900/20",
        borderColor: "border-blue-500/30",
    },
    musk: {
        title: "일론 머스크",
        subtitle: "미래의 설계자",
        icon: Rocket,
        description: "당신은 리스크를 두려워하지 않으며, 미래에 대한 확신과 대담한 상상력으로 세상을 놀라게 합니다. 불가능에 도전하여 인류의 역사를 바꿀 '혁신가' 타입입니다.",
        color: "text-red-400",
        gradient: "from-red-500 to-orange-500",
        bg: "bg-red-900/20",
        borderColor: "border-red-500/30",
    },
    rockefeller: {
        title: "존 D. 록펠러",
        subtitle: "시스템의 지배자",
        icon: Factory,
        description: "당신은 압도적인 시장 지배력과 독점적 지위를 통해 부를 축적하는 능력이 탁월합니다. 경쟁자를 압도하고, 거대한 부의 제국을 건설할 '제국 건설자' 타입입니다.",
        color: "text-emerald-400",
        gradient: "from-emerald-600 to-teal-600",
        bg: "bg-emerald-900/20",
        borderColor: "border-emerald-500/30",
    },
    templeton: {
        title: "존 템플턴",
        subtitle: "역발상의 대가",
        icon: Gem,
        description: "당신은 비관론이 극에 달했을 때가 최고의 기회임을 알고 있습니다. 남들이 공포에 떨 때 과감히 투자하고, 위기 속에서 숨겨진 보석을 찾아내는 '영적 투자자' 타입입니다.",
        color: "text-purple-400",
        gradient: "from-purple-500 to-pink-500",
        bg: "bg-purple-900/20",
        borderColor: "border-purple-500/30",
    },
};

export default function RichDNAClient() {
    const [step, setStep] = useState(0);
    const [scores, setScores] = useState({ buffett: 0, musk: 0, rockefeller: 0, templeton: 0 });
    const [showResult, setShowResult] = useState(false);

    const handleAnswer = (type: keyof typeof scores) => {
        const newScores = { ...scores, [type]: scores[type] + 1 };
        setScores(newScores);

        if (step < questions.length - 1) {
            setStep(prev => prev + 1);
        } else {
            setShowResult(true);
        }
    };

    const getResultType = () => {
        const maxScore = Math.max(...Object.values(scores));
        return (Object.keys(scores) as (keyof typeof scores)[]).find(key => scores[key] === maxScore) || 'buffett';
    };

    const resetTest = () => {
        setStep(0);
        setScores({ buffett: 0, musk: 0, rockefeller: 0, templeton: 0 });
        setShowResult(false);
    };

    const resultKey = getResultType();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = resultTypes[resultKey];
    const ResultIcon = result.icon;

    const handleShare = () => {
        const shareUrl = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: "부자 DNA 테스트",
                text: `나의 부자 DNA는 '${result.title}' 타입! 당신의 DNA도 확인해보세요!`,
                url: shareUrl,
            });
        } else {
            navigator.clipboard.writeText(`나의 부자 DNA는 '${result.title}' 타입! 당신의 DNA도 확인해보세요!\n${shareUrl}`)
                .then(() => alert("결과가 클립보드에 복사되었습니다!"))
                .catch(err => console.error("Share failed", err));
        }
    };

    return (
        <main className="w-full min-h-screen bg-zinc-950 px-4 py-12 sm:py-16 relative overflow-hidden font-sans">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-zinc-900 border border-yellow-500/20 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)] animate-float">
                        <Gem className="w-10 h-10 text-yellow-500" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl mb-4">
                        부자 DNA <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400">테스트</span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        당신 안에 잠든 억만장자의 본능을 깨우세요.<br />
                        세계적인 부호들과 당신의 싱크로율은?
                    </p>
                </div>

                {/* Ad Unit: Top */}
                {/* Ad Unit: Top - REMOVED */}

                <div className="max-w-3xl mx-auto relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {!showResult ? (
                            <motion.div
                                key="question"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-10">
                                        <span className="text-sm font-bold text-yellow-400 bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20">
                                            QUESTION {step + 1}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-yellow-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-zinc-500">
                                                {step + 1} / {questions.length}
                                            </span>
                                        </div>
                                    </div>

                                    <h2 className="text-3xl sm:text-4xl font-bold mb-10 leading-tight text-white">
                                        {questions[step].question}
                                    </h2>

                                    <div className="grid gap-4">
                                        {questions[step].answers.map((answer, idx) => (
                                            <motion.button
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                onClick={() => handleAnswer(answer.type as keyof typeof scores)}
                                                className="w-full text-left p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all duration-300 group relative overflow-hidden active:scale-[0.99]"
                                            >
                                                <div className="flex items-center justify-between relative z-10">
                                                    <span className="text-lg font-medium text-zinc-300 group-hover:text-yellow-400 transition-colors">
                                                        {answer.text}
                                                    </span>
                                                    <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-8"
                            >
                                {/* Certificate Card */}
                                <div className={`bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border-2 ${result.borderColor} overflow-hidden relative`}>

                                    {/* Decorative Background */}
                                    <div className={`absolute top-0 left-0 w-full h-48 bg-gradient-to-b ${result.gradient} opacity-20`} />
                                    <div className="absolute -top-24 -right-24 opacity-5 rotate-12">
                                        <ResultIcon className="w-96 h-96 text-white" />
                                    </div>

                                    <div className="p-8 sm:p-16 text-center relative z-10">
                                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-zinc-900 shadow-xl mb-8 border-4 border-white/5 ring-4 ring-black/20">
                                            <ResultIcon className={`w-12 h-12 ${result.color}`} />
                                        </div>

                                        <div className="mb-8">
                                            <p className="text-xs font-bold tracking-[0.3em] uppercase text-zinc-500 mb-3">
                                                CERTIFICATE OF WEALTH DNA
                                            </p>
                                            <h2 className={`text-5xl sm:text-6xl font-black mb-4 tracking-tight ${result.color} drop-shadow-lg`}>
                                                {result.title}
                                            </h2>
                                            <div className="flex items-center justify-center gap-4">
                                                <div className="h-px w-12 bg-white/10" />
                                                <p className="text-xl font-serif italic text-zinc-300">
                                                    {result.subtitle}
                                                </p>
                                                <div className="h-px w-12 bg-white/10" />
                                            </div>
                                        </div>

                                        <div className="bg-white/5 rounded-2xl p-8 mb-10 border border-white/5">
                                            <p className="text-lg leading-relaxed text-zinc-200 font-medium keep-all">
                                                {result.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-zinc-500 font-mono border-t border-white/10 pt-6">
                                            <div className="flex gap-4">
                                                <span>ISSUED: {new Date().toLocaleDateString()}</span>
                                                <span>NO: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gold Foil Effect Bottom */}
                                    <div className="h-2 bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500" />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-4 max-w-sm mx-auto">
                                    <button
                                        onClick={resetTest}
                                        className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 font-bold text-zinc-300 transition-all flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw size={18} /> 다시 테스트하기
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className={`w-full py-4 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r ${result.gradient} hover:brightness-110`}
                                    >
                                        <Share2 size={18} /> 결과 공유하기
                                    </button>
                                    {/* Fun Hub Link */}
                                    <Link
                                        href="/fun"
                                        className="w-full py-4 rounded-xl bg-zinc-900 border border-white/10 hover:border-yellow-500/30 text-zinc-400 hover:text-yellow-400 font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <TrendingUp size={18} /> 다른 테스트 보러가기
                                    </Link>
                                </div>

                                {/* Bottom Ad */}
                                <div className="mt-8">
                                    <AdUnit slotId="9988776655" format="auto" label="DNA Bottom Ad" />
                                </div>

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
