"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, RefreshCw, Share2, Heart } from "lucide-react";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { CompanyProfile } from "@/types/company";
import confetti from "canvas-confetti";
import AdUnit from "@/components/AdUnit";

// Shuffle array helper
const shuffle = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

export default function IdealTypeWorldCup() {
    const [candidates, setCandidates] = useState<CompanyProfile[]>([]);
    const [currentRound, setCurrentRound] = useState<CompanyProfile[]>([]);
    const [nextRound, setNextRound] = useState<CompanyProfile[]>([]);
    const [currentPairIndex, setCurrentPairIndex] = useState(0);
    const [winner, setWinner] = useState<CompanyProfile | null>(null);
    const [roundName, setRoundName] = useState("16강");
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Initialize Game
    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        const allCompanies = companyRepository.getAll();
        // Pick 16 random companies
        const selected = shuffle(allCompanies).slice(0, 16);
        setCandidates(selected);
        setCurrentRound(selected);
        setNextRound([]);
        setCurrentPairIndex(0);
        setWinner(null);
        setRoundName("16강");
        setIsTransitioning(false);
    };

    const handleSelect = (selected: CompanyProfile) => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        // Add winner to next round
        const newNextRound = [...nextRound, selected];
        setNextRound(newNextRound);

        setTimeout(() => {
            // Check if round is finished
            if (currentPairIndex + 2 >= currentRound.length) {
                // Round Finished
                if (newNextRound.length === 1) {
                    // Game Over - We have a winner!
                    setWinner(newNextRound[0]);
                    fireConfetti();
                } else {
                    // Proceed to next round
                    setCurrentRound(newNextRound);
                    setNextRound([]);
                    setCurrentPairIndex(0);

                    // Set Round Name
                    if (newNextRound.length === 8) setRoundName("8강");
                    else if (newNextRound.length === 4) setRoundName("4강 (준결승)");
                    else if (newNextRound.length === 2) setRoundName("결승전 (Final)");
                }
            } else {
                // Next Pair
                setCurrentPairIndex(prev => prev + 2);
            }
            setIsTransitioning(false);
        }, 600); // Transition delay
    };

    const fireConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ["#10b981", "#3b82f6", "#f59e0b"]
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ["#10b981", "#3b82f6", "#f59e0b"]
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    };

    if (candidates.length === 0) return null;

    const leftContender = currentRound[currentPairIndex];
    const rightContender = currentRound[currentPairIndex + 1];

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-pink-500/10 text-pink-500 text-sm font-bold mb-4 border border-pink-500/20">
                    <Heart size={14} className="fill-current" />
                    Ideal Type World Cup
                </div>
                <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-2">
                    기업 이상형 월드컵 🏆
                </h1>
                <p className="text-muted-foreground">
                    당신의 마음속 1위 기업은 어디인가요?
                </p>
            </div>

            {/* Game Area */}
            <div className="relative min-h-[600px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {winner ? (
                        // Winner View
                        <motion.div
                            key="winner"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center space-y-8 py-12"
                        >
                            <div className="relative">
                                <Crown className="w-24 h-24 text-yellow-400 absolute -top-16 left-1/2 -translate-x-1/2 animate-bounce" />
                                <div className="text-[120px] leading-none filter drop-shadow-2xl">
                                    {winner.logo}
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400">
                                    {winner.name.ko}
                                </h2>
                                <p className="text-xl text-muted-foreground">{winner.industry}</p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={startNewGame}
                                    className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
                                >
                                    <RefreshCw size={20} />
                                    다시 하기
                                </button>
                                <button className="flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-bold text-lg hover:bg-secondary/80 transition-all">
                                    <Share2 size={20} />
                                    공유하기
                                </button>
                            </div>

                            {/* Ad Unit */}
                            <div className="w-full max-w-md mt-8">
                                <AdUnit slotId="8888888888" format="rectangle" label="World Cup Result" />
                            </div>
                        </motion.div>
                    ) : (
                        // Match View
                        <div className="w-full">
                            {/* Round Indicator */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-white font-bold text-xl shadow-xl">
                                {roundName}
                                <span className="text-sm text-zinc-400 ml-2 font-normal">
                                    ({(currentPairIndex / 2) + 1} / {currentRound.length / 2})
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 h-[600px]">
                                {/* Left Card */}
                                <ContenderCard
                                    company={leftContender}
                                    onClick={() => handleSelect(leftContender)}
                                    position="left"
                                />

                                {/* VS Badge (Desktop) */}
                                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-red-600 rounded-full items-center justify-center z-30 font-black italic text-2xl text-white border-4 border-background shadow-xl transform rotate-12">
                                    VS
                                </div>

                                {/* Right Card */}
                                <ContenderCard
                                    company={rightContender}
                                    onClick={() => handleSelect(rightContender)}
                                    position="right"
                                />
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ContenderCard({ company, onClick, position }: { company: CompanyProfile, onClick: () => void, position: "left" | "right" }) {
    if (!company) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: position === "left" ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
        relative h-full rounded-3xl overflow-hidden cursor-pointer group
        ${position === "left" ? "bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20" : "bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20"}
        border-2 hover:border-primary transition-colors
      `}
        >
            {/* Background Effect */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            <div className={`absolute inset-0 bg-gradient-to-t ${position === "left" ? "from-blue-900/80" : "from-red-900/80"} via-transparent to-transparent opacity-60`} />

            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                    className="text-8xl mb-8 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-2xl"
                >
                    {company.logo}
                </motion.div>

                <h3 className="text-3xl md:text-4xl font-black mb-2 text-foreground group-hover:text-primary transition-colors">
                    {company.name.ko}
                </h3>

                <p className="text-lg text-muted-foreground font-medium mb-6">
                    {company.industry}
                </p>

                <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                    <div className="bg-background/50 backdrop-blur-sm p-3 rounded-xl border border-border/50">
                        <div className="text-xs text-muted-foreground uppercase mb-1">평균 연봉</div>
                        <div className="font-bold text-lg">
                            {(company.salary.entry.base / 10000).toLocaleString()}만원~
                        </div>
                    </div>
                    <div className="bg-background/50 backdrop-blur-sm p-3 rounded-xl border border-border/50">
                        <div className="text-xs text-muted-foreground uppercase mb-1">워라밸</div>
                        <div className="font-bold text-lg flex items-center justify-center gap-1">
                            <span className="text-yellow-500">★</span>
                            {company.culture.score}
                        </div>
                    </div>
                </div>

                <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0">
                    <span className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold shadow-lg">
                        선택하기 👆
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
