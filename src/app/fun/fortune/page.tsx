"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Share2, RefreshCw, Scroll, Coins, TrendingUp, Wallet } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const fortunes = [
    {
        score: 98,
        title: "황금의 손",
        keyword: "대박",
        description: "2025년은 당신의 해입니다! 손대는 것마다 황금으로 변할 기세군요. 투자, 사업, 승진 무엇이든 도전해보세요. 재물운이 폭포수처럼 쏟아집니다.",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500",
        talisman: "💰",
    },
    {
        score: 85,
        title: "성실한 부자",
        keyword: "결실",
        description: "꾸준히 뿌려온 씨앗들이 드디어 열매를 맺습니다. 횡재보다는 노력에 대한 보상이 큰 해입니다. 성실함이 곧 최고의 무기가 될 것입니다.",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500",
        talisman: "🌳",
    },
    {
        score: 72,
        title: "숨은 귀인",
        keyword: "인연",
        description: "뜻밖의 곳에서 귀인을 만나게 됩니다. 사람을 통해 재물이 들어오는 형국이니, 대인 관계에 신경 쓰세요. 좋은 정보가 당신을 부자로 이끌어 줄 것입니다.",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500",
        talisman: "🤝",
    },
    {
        score: 60,
        title: "신중한 관리자",
        keyword: "수성",
        description: "공격적인 투자보다는 지키는 것이 중요한 해입니다. 새어나가는 돈을 막으면 자연스럽게 부가 쌓입니다. 가계부를 쓰고 지출을 통제하면 연말에 웃게 될 것입니다.",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500",
        talisman: "🛡️",
    },
    {
        score: 92,
        title: "역전의 명수",
        keyword: "반전",
        description: "지금까지의 어려움은 잊으세요. 인생 역전의 기회가 찾아옵니다. 위기가 기회로 바뀌는 마법 같은 순간을 놓치지 마세요. 과감한 결단이 필요할 때입니다.",
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500",
        talisman: "🔥",
    },
];

export default function FortunePage() {
    const [step, setStep] = useState("input"); // input, loading, result
    const [name, setName] = useState("");
    const [result, setResult] = useState<typeof fortunes[0] | null>(null);

    const handleAnalyze = () => {
        if (!name) return;
        setStep("loading");

        // Simulate analysis time
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * fortunes.length);
            setResult(fortunes[randomIndex]);
            setStep("result");
        }, 3000);
    };

    const handleShare = () => {
        const shareUrl = window.location.href;
        const text = `[2025년 재물운] ${name}님의 결과는 '${result?.title}' (점수: ${result?.score}점)\n행운의 부적을 확인해보세요!\n${shareUrl}`;

        if (navigator.share) {
            navigator.share({
                title: "2025년 재물운 테스트",
                text: text,
                url: shareUrl,
            });
        } else {
            navigator.clipboard.writeText(text)
                .then(() => alert("결과가 복사되었습니다! 친구들에게 공유해보세요."))
                .catch(console.error);
        }
    };

    return (
        <main className="w-full min-h-screen bg-slate-950 text-white pb-20 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-md mx-auto px-4 py-12 relative z-10">
                <AnimatePresence mode="wait">
                    {step === "input" && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="inline-block p-3 rounded-full bg-purple-500/20 mb-4">
                                    <Sparkles className="w-8 h-8 text-purple-400" />
                                </div>
                                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                    2025년<br />나의 재물운은?
                                </h1>
                                <p className="text-slate-400">
                                    이름을 입력하고 2025년 당신에게 찾아올<br />
                                    부의 기운을 미리 확인해보세요.
                                </p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 text-left">이름</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="이름을 입력하세요"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-center text-lg"
                                    />
                                </div>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!name}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg shadow-lg shadow-purple-900/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    재물운 확인하기
                                </button>
                            </div>

                            <div className="mt-8">
                                <AdUnit slotId="1234567890" format="rectangle" label="Fortune Input Ad" />
                            </div>
                        </motion.div>
                    )}

                    {step === "loading" && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-20"
                        >
                            <div className="relative w-32 h-32 mx-auto mb-8">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Scroll className="w-12 h-12 text-purple-400" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">운세를 분석중입니다...</h2>
                            <p className="text-slate-400 mb-8">2025년의 기운을 읽어들이고 있습니다.</p>

                            <div className="bg-white/5 p-4 rounded-xl">
                                <p className="text-xs text-slate-500 mb-2">잠시 광고를 보고 가실게요</p>
                                <AdUnit slotId="0987654321" format="rectangle" label="Fortune Loading Ad" />
                            </div>
                        </motion.div>
                    )}

                    {step === "result" && result && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            {/* Talisman Card */}
                            <div className={`relative bg-slate-900 border-2 ${result.border} rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/20`}>
                                <div className={`absolute inset-0 bg-gradient-to-b ${result.bg} opacity-20`} />

                                <div className="relative z-10 p-8 text-center">
                                    <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-medium mb-4 border border-white/10">
                                        2025년 {name}님의 재물운
                                    </div>

                                    <div className="text-6xl mb-4 animate-bounce">{result.talisman}</div>

                                    <h2 className={`text-3xl font-black mb-2 ${result.color}`}>{result.title}</h2>
                                    <div className="flex justify-center items-center gap-2 mb-6">
                                        <span className="text-slate-400">재물운 점수</span>
                                        <span className={`text-2xl font-bold ${result.color}`}>{result.score}점</span>
                                    </div>

                                    <div className="w-full h-px bg-white/10 mb-6" />

                                    <p className="text-lg leading-relaxed text-slate-200 mb-6 keep-all">
                                        {result.description}
                                    </p>

                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                                            <Coins className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                                            <span>금전운</span>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                                            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-red-400" />
                                            <span>투자운</span>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                                            <Wallet className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                                            <span>저축운</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleShare}
                                    className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Share2 className="w-5 h-5" />
                                    부적 공유하고 복채내기
                                </button>
                                <button
                                    onClick={() => {
                                        setName("");
                                        setStep("input");
                                    }}
                                    className="w-full py-4 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    다른 이름으로 다시보기
                                </button>
                            </div>

                            <div className="mt-8">
                                <AdUnit slotId="5566778899" format="auto" label="Fortune Result Ad" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
