"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Share2, RefreshCw, Scroll, Calendar, Clock, User, ChevronRight } from "lucide-react";
import AdUnit from "@/components/AdUnit";

// --- Constants & Data ---

const YEARS = Array.from({ length: 80 }, (_, i) => 2025 - i); // 2025 down to 1946
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const TIMES = [
    { label: "자시 (23:30 ~ 01:29)", value: "ja" },
    { label: "축시 (01:30 ~ 03:29)", value: "chuk" },
    { label: "인시 (03:30 ~ 05:29)", value: "in" },
    { label: "묘시 (05:30 ~ 07:29)", value: "myo" },
    { label: "진시 (07:30 ~ 09:29)", value: "jin" },
    { label: "사시 (09:30 ~ 11:29)", value: "sa" },
    { label: "오시 (11:30 ~ 13:29)", value: "o" },
    { label: "미시 (13:30 ~ 15:29)", value: "mi" },
    { label: "신시 (15:30 ~ 17:29)", value: "shin" },
    { label: "유시 (17:30 ~ 19:29)", value: "yu" },
    { label: "술시 (19:30 ~ 21:29)", value: "sul" },
    { label: "해시 (21:30 ~ 23:29)", value: "hae" },
    { label: "모름", value: "unknown" },
];

// Mock Data for Deterministic Generation
const SAJU_TITLES = [
    "비상하는 붉은 말", "고요한 숲의 현자", "거침없는 개척자", "지혜로운 전략가",
    "황금 들판의 수확자", "새벽을 여는 선구자", "깊은 바다의 잠룡", "태양을 품은 해바라기"
];

const TOTAL_LUCK_TEXTS = [
    "2026년 병오년은 당신에게 있어 '도약'의 해입니다. 그동안 준비해온 것들이 빛을 발하며, 주변의 인정을 받게 됩니다. 특히 상반기보다는 하반기에 운의 흐름이 더욱 강력해지니, 조급해하지 말고 꾸준히 정진하세요.",
    "올해는 '변화'의 바람이 강하게 부는 시기입니다. 익숙한 곳을 떠나 새로운 도전을 하게 될 수도 있습니다. 두려워하지 마세요. 이 변화는 당신을 더 높은 곳으로 이끌어줄 발판이 될 것입니다.",
    "안정과 평화가 깃드는 한 해입니다. 큰 굴곡 없이 평온한 나날이 이어지며, 내실을 다지기에 최적의 시기입니다. 새로운 일을 벌이기보다는 기존의 것을 지키고 가꾸는 데 집중하는 것이 좋습니다.",
    "귀인의 도움으로 어려움을 극복하는 형국입니다. 혼자 해결하려 끙끙대지 말고 주변에 손을 내미세요. 뜻밖의 인연이 당신에게 큰 행운을 가져다줄 것입니다.",
    "재물운이 폭발하는 시기입니다. 투자나 사업에서 좋은 성과를 거둘 수 있으며, 생각지 못한 횡재수도 있습니다. 다만, 들어오는 만큼 나가는 돈도 많을 수 있으니 지출 관리에 유의하세요."
];

const WEALTH_TEXTS = [
    "재물운이 상승 곡선을 그립니다. 작은 투자로 큰 이익을 얻을 수 있는 기회가 찾아옵니다. 다만, 과도한 욕심은 화를 부를 수 있으니 적절한 선에서 만족하는 지혜가 필요합니다.",
    "성실함이 곧 돈이 되는 해입니다. 요행을 바라기보다는 땀 흘려 일한 만큼 정직한 보상이 따를 것입니다. 저축을 생활화하면 연말에는 두둑한 목돈을 쥐게 될 것입니다.",
    "돈이 들어왔다 나갔다 하는 흐름이 빠릅니다. 현금 유동성은 좋으나 실속이 없을 수 있습니다. 충동구매를 자제하고, 장기적인 관점에서 자산 관리를 해야 합니다.",
    "문서운이 좋습니다. 부동산이나 주식 등 문서와 관련된 투자에서 이익을 볼 수 있습니다. 계약을 할 때는 꼼꼼히 따져보고 신중하게 결정하세요.",
    "주변 사람으로 인해 돈이 나갈 수 있습니다. 보증이나 돈 거래는 절대 금물입니다. 지갑을 닫고 내 것을 지키는 데 주력해야 합니다."
];

const CAREER_TEXTS = [
    "승진이나 이직 등 직장에서 좋은 소식이 들려옵니다. 당신의 능력을 인정받고 더 큰 책임을 맡게 될 것입니다. 리더십을 발휘하여 팀을 이끌어보세요.",
    "새로운 프로젝트나 업무를 맡게 되어 바쁜 나날을 보내게 됩니다. 몸은 고되지만 그만큼 배우는 것도 많고 성취감도 클 것입니다. 동료들과의 협업이 중요합니다.",
    "현재의 위치에서 묵묵히 최선을 다하는 것이 좋습니다. 섣불리 움직이면 오히려 손해를 볼 수 있습니다. 때를 기다리며 실력을 갈고닦으세요.",
    "창업이나 부업을 시작하기에 좋은 시기입니다. 평소 생각만 했던 아이디어가 있다면 과감하게 실행에 옮겨보세요. 철저한 준비가 성공의 열쇠입니다.",
    "직장 내 인간관계로 인해 스트레스를 받을 수 있습니다. 감정적으로 대응하기보다는 유연하게 대처하는 것이 현명합니다. 구설수에 오르지 않도록 언행을 조심하세요."
];

// --- Helper Functions ---

const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

// --- Component ---

export default function FortunePage() {
    const [step, setStep] = useState<"input" | "loading" | "result">("input");

    // Input State
    const [name, setName] = useState("");
    const [gender, setGender] = useState<"male" | "female">("male");
    const [year, setYear] = useState(1990);
    const [month, setMonth] = useState(1);
    const [day, setDay] = useState(1);
    const [time, setTime] = useState("unknown");
    const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");

    // Result State
    const [resultData, setResultData] = useState<any>(null);

    const handleAnalyze = () => {
        if (!name) return;
        setStep("loading");

        // Generate Deterministic Result
        const inputString = `${name}-${gender}-${year}-${month}-${day}-${time}-${calendar}`;
        const hash = getHash(inputString);

        setTimeout(() => {
            setResultData({
                title: SAJU_TITLES[hash % SAJU_TITLES.length],
                totalLuck: TOTAL_LUCK_TEXTS[hash % TOTAL_LUCK_TEXTS.length],
                wealthLuck: WEALTH_TEXTS[(hash + 1) % WEALTH_TEXTS.length],
                careerLuck: CAREER_TEXTS[(hash + 2) % CAREER_TEXTS.length],
                score: 70 + (hash % 30), // 70 ~ 99
                luckyColor: ["Red", "Blue", "Green", "Gold", "White"][hash % 5],
                luckyNumber: (hash % 9) + 1,
            });
            setStep("result");
        }, 3000);
    };

    const handleShare = async () => {
        const text = `[2026년 신년운세] ${name}님의 운세: ${resultData.title}\n점수: ${resultData.score}점\n\n지금 바로 확인해보세요!`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "2026년 병오년 신년운세",
                    text: text,
                    url: window.location.href,
                });
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            navigator.clipboard.writeText(text).then(() => alert("결과가 복사되었습니다!"));
        }
    };

    return (
        <main className="w-full min-h-screen bg-[#1a1a1a] text-[#e5e5e5] pb-20 overflow-hidden relative font-serif">
            {/* Traditional Pattern Background */}
            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/korean-pattern.png')]" />

            <div className="max-w-xl mx-auto px-4 py-12 relative z-10">
                <AnimatePresence mode="wait">
                    {step === "input" && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-4 mb-12">
                                <div className="inline-block p-4 rounded-full bg-red-900/20 border border-red-800/50 mb-4">
                                    <Scroll className="w-10 h-10 text-red-500" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-700 tracking-tight">
                                    2026 병오년<br />정통 신년운세
                                </h1>
                                <p className="text-zinc-400 text-lg">
                                    붉은 말의 해, 당신의 운명을 미리 확인하세요.
                                </p>
                            </div>

                            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                                        <User size={16} /> 이름
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="이름을 입력하세요"
                                        className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Gender & Calendar Type */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">성별</label>
                                        <div className="flex bg-black/30 rounded-xl p-1 border border-zinc-700">
                                            {(["male", "female"] as const).map((g) => (
                                                <button
                                                    key={g}
                                                    onClick={() => setGender(g)}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${gender === g ? "bg-zinc-700 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"
                                                        }`}
                                                >
                                                    {g === "male" ? "남성" : "여성"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">양력/음력</label>
                                        <div className="flex bg-black/30 rounded-xl p-1 border border-zinc-700">
                                            {(["solar", "lunar"] as const).map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => setCalendar(c)}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${calendar === c ? "bg-zinc-700 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"
                                                        }`}
                                                >
                                                    {c === "solar" ? "양력" : "음력"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Date of Birth */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                                        <Calendar size={16} /> 생년월일
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <select
                                            value={year}
                                            onChange={(e) => setYear(Number(e.target.value))}
                                            className="bg-black/30 border border-zinc-700 rounded-xl px-3 py-3 text-center outline-none focus:border-red-500"
                                        >
                                            {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                                        </select>
                                        <select
                                            value={month}
                                            onChange={(e) => setMonth(Number(e.target.value))}
                                            className="bg-black/30 border border-zinc-700 rounded-xl px-3 py-3 text-center outline-none focus:border-red-500"
                                        >
                                            {MONTHS.map(m => <option key={m} value={m}>{m}월</option>)}
                                        </select>
                                        <select
                                            value={day}
                                            onChange={(e) => setDay(Number(e.target.value))}
                                            className="bg-black/30 border border-zinc-700 rounded-xl px-3 py-3 text-center outline-none focus:border-red-500"
                                        >
                                            {DAYS.map(d => <option key={d} value={d}>{d}일</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Time of Birth */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                                        <Clock size={16} /> 태어난 시간
                                    </label>
                                    <select
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                                    >
                                        {TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>

                                <button
                                    onClick={handleAnalyze}
                                    disabled={!name}
                                    className="w-full py-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold text-xl rounded-xl shadow-lg shadow-red-900/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    운세 확인하기
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
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="relative w-40 h-40 mb-12">
                                <motion.div
                                    className="absolute inset-0 border-4 border-red-900/30 rounded-full"
                                />
                                <motion.div
                                    className="absolute inset-0 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-4xl">🔮</span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-white">사주명식을 분석하고 있습니다...</h2>
                            <p className="text-zinc-500 animate-pulse">
                                {year}년 {month}월 {day}일의 기운을 읽는 중
                            </p>

                            <div className="mt-12 w-full max-w-sm bg-zinc-900/50 p-4 rounded-xl">
                                <AdUnit slotId="0987654321" format="rectangle" label="Fortune Loading Ad" />
                            </div>
                        </motion.div>
                    )}

                    {step === "result" && resultData && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            {/* Result Paper */}
                            <div className="bg-[#f5f5f0] text-zinc-900 rounded-sm p-8 shadow-2xl relative overflow-hidden min-h-[600px] border-l-8 border-red-800">
                                {/* Paper Texture Overlay */}
                                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none" />

                                {/* Stamp */}
                                <div className="absolute top-6 right-6 w-20 h-20 border-4 border-red-600 rounded-lg flex items-center justify-center opacity-80 rotate-[-10deg] mix-blend-multiply pointer-events-none">
                                    <span className="text-red-600 font-serif font-black text-2xl">大吉</span>
                                </div>

                                <div className="relative z-10">
                                    <div className="text-center border-b-2 border-zinc-300 pb-8 mb-8">
                                        <p className="text-zinc-500 font-serif mb-2">2026 병오년(丙午年)</p>
                                        <h2 className="text-3xl md:text-4xl font-black mb-4 font-serif text-zinc-800">
                                            {resultData.title}
                                        </h2>
                                        <div className="inline-flex items-center gap-2 px-4 py-1 bg-zinc-200 rounded-full text-sm text-zinc-600">
                                            <span>{name}님 ({gender === 'male' ? '남' : '여'})</span>
                                            <span>|</span>
                                            <span>{year}.{month}.{day} ({calendar === 'solar' ? '양' : '음'})</span>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <section>
                                            <h3 className="flex items-center gap-2 text-xl font-bold text-red-800 mb-3 font-serif">
                                                <Sparkles size={20} /> 총운 (Total Luck)
                                            </h3>
                                            <p className="text-lg leading-relaxed text-zinc-700 text-justify">
                                                {resultData.totalLuck}
                                            </p>
                                        </section>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <section>
                                                <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-800 mb-3 font-serif">
                                                    💰 재물운
                                                </h3>
                                                <p className="text-zinc-600 text-justify text-sm leading-relaxed">
                                                    {resultData.wealthLuck}
                                                </p>
                                            </section>
                                            <section>
                                                <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-800 mb-3 font-serif">
                                                    💼 직장/사업운
                                                </h3>
                                                <p className="text-zinc-600 text-justify text-sm leading-relaxed">
                                                    {resultData.careerLuck}
                                                </p>
                                            </section>
                                        </div>

                                        <div className="bg-zinc-100 p-6 rounded-xl border border-zinc-200">
                                            <h4 className="font-bold text-center text-zinc-800 mb-4">행운의 아이템</h4>
                                            <div className="flex justify-around text-center">
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-1">행운의 색</p>
                                                    <p className="font-bold text-red-600">{resultData.luckyColor}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-1">행운의 숫자</p>
                                                    <p className="font-bold text-blue-600">{resultData.luckyNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-1">총점</p>
                                                    <p className="font-bold text-purple-600 text-xl">{resultData.score}점</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setStep("input");
                                        setName("");
                                    }}
                                    className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={20} /> 다시 하기
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex-1 py-4 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-900/30"
                                >
                                    <Share2 size={20} /> 결과 공유
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
