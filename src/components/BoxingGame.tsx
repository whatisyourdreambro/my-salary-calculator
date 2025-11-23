"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CompanyProfile } from "@/types/company";
import { ComparisonResult } from "@/lib/versusEngine";
import { Trophy, Zap, Star } from "lucide-react";

interface BoxingGameProps {
    companyA: CompanyProfile;
    companyB: CompanyProfile;
    result: ComparisonResult;
    onFinish: () => void;
}

export default function BoxingGame({
    companyA,
    companyB,
    result,
    onFinish,
}: BoxingGameProps) {
    const [hpA, setHpA] = useState(100);
    const [hpB, setHpB] = useState(100);
    const [winner, setWinner] = useState<"A" | "B" | null>(null);
    const [log, setLog] = useState<string[]>([]);
    const [attacker, setAttacker] = useState<"A" | "B" | null>(null);
    const [cameraShake, setCameraShake] = useState(0);

    // Determine stats based on salary data
    // The winner is PRE-DETERMINED by the comparison result to ensure accuracy
    const trueWinner = result.metrics.totalComp.winner === "a" ? "A" : "B";
    const damageA = trueWinner === "A" ? 15 : 8;
    const damageB = trueWinner === "B" ? 15 : 8;

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (!winner) {
            interval = setInterval(() => {
                // Logic: The winner attacks more often and hits harder
                const roll = Math.random();
                // 65% chance for the true winner to attack
                const isATurn = trueWinner === "A" ? roll < 0.65 : roll > 0.65;

                if (isATurn) {
                    setAttacker("A");
                    setHpB((prev) => {
                        const newHp = Math.max(0, prev - damageA);
                        if (newHp === 0) setWinner("A");
                        return newHp;
                    });
                    setLog((prev) => [`${companyA.name.ko}의 강력한 펀치!`, ...prev.slice(0, 2)]);
                    setCameraShake(5);
                } else {
                    setAttacker("B");
                    setHpA((prev) => {
                        const newHp = Math.max(0, prev - damageB);
                        if (newHp === 0) setWinner("B");
                        return newHp;
                    });
                    setLog((prev) => [`${companyB.name.ko}의 반격!`, ...prev.slice(0, 2)]);
                    setCameraShake(5);
                }

                // Reset attacker animation after a short delay
                setTimeout(() => {
                    setAttacker(null);
                    setCameraShake(0);
                }, 300);

            }, 600); // Faster pace
        }

        return () => clearInterval(interval);
    }, [winner, companyA, companyB, damageA, damageB, trueWinner]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
            <motion.div
                className="w-full max-w-5xl p-4 relative overflow-hidden rounded-3xl border-4 border-yellow-600/50 bg-zinc-900 shadow-2xl"
                animate={{ x: [0, -cameraShake, cameraShake, -cameraShake, cameraShake, 0] }}
                transition={{ duration: 0.3 }}
            >
                {/* Ring Ropes Background */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="w-full h-1/4 border-b-4 border-red-900/50 mt-12"></div>
                    <div className="w-full h-1/4 border-b-4 border-red-900/50"></div>
                    <div className="w-full h-1/4 border-b-4 border-red-900/50"></div>
                    {/* Spotlights */}
                    <div className="absolute top-0 left-1/4 w-32 h-full bg-white/5 blur-3xl transform -skew-x-12"></div>
                    <div className="absolute top-0 right-1/4 w-32 h-full bg-white/5 blur-3xl transform skew-x-12"></div>
                </div>

                {/* Health Bars */}
                <div className="relative z-10 flex justify-between items-center mb-16 px-8 pt-8">
                    <div className="flex-1">
                        <div className="flex justify-between text-blue-400 font-black text-xl mb-2 uppercase tracking-tighter">
                            <span>{companyA.name.ko}</span>
                            <span>{hpA}%</span>
                        </div>
                        <div className="h-8 bg-zinc-950 rounded-lg overflow-hidden border-2 border-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                                initial={{ width: "100%" }}
                                animate={{ width: `${hpA}%` }}
                                transition={{ type: "spring", stiffness: 100 }}
                            />
                        </div>
                    </div>

                    <div className="mx-8 text-center">
                        <div className="text-6xl font-black text-yellow-500 italic drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">VS</div>
                        <div className="text-xs text-zinc-500 font-bold tracking-widest mt-1">SALARY DEATHMATCH</div>
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between text-red-400 font-black text-xl mb-2 uppercase tracking-tighter">
                            <span>{hpB}%</span>
                            <span>{companyB.name.ko}</span>
                        </div>
                        <div className="h-8 bg-zinc-950 rounded-lg overflow-hidden border-2 border-red-900/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                            <motion.div
                                className="h-full bg-gradient-to-l from-red-600 to-orange-500"
                                initial={{ width: "100%" }}
                                animate={{ width: `${hpB}%` }}
                                transition={{ type: "spring", stiffness: 100 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Arena */}
                <div className="flex justify-between items-center h-80 relative px-12 sm:px-32">
                    {/* Fighter A */}
                    <motion.div
                        className="relative"
                        animate={{
                            x: attacker === "A" ? 150 : 0,
                            rotate: attacker === "A" ? 25 : 0,
                            scale: attacker === "B" ? 0.8 : 1, // Get hit effect
                            filter: attacker === "B" ? "brightness(2) sepia(1) hue-rotate(-50deg)" : "none" // Flash red when hit
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                        <div className="text-[140px] filter drop-shadow-2xl transform scale-x-[-1] transition-all duration-100">
                            {companyA.logo}
                        </div>
                        {/* Gloves */}
                        <div className="absolute top-1/2 -right-8 w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full border-4 border-red-950 shadow-lg" />
                        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full border-4 border-red-950 shadow-lg" />

                        {/* Hit Effect */}
                        <AnimatePresence>
                            {attacker === "B" && (
                                <motion.div
                                    initial={{ opacity: 1, scale: 0.5, rotate: -20 }}
                                    animate={{ opacity: 0, scale: 2.5, rotate: 20 }}
                                    className="absolute inset-0 flex items-center justify-center z-20"
                                >
                                    <Star className="w-32 h-32 text-yellow-400 fill-yellow-400 stroke-black stroke-2" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Fighter B */}
                    <motion.div
                        className="relative"
                        animate={{
                            x: attacker === "B" ? -150 : 0,
                            rotate: attacker === "B" ? -25 : 0,
                            scale: attacker === "A" ? 0.8 : 1,
                            filter: attacker === "A" ? "brightness(2) sepia(1) hue-rotate(-50deg)" : "none"
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                        <div className="text-[140px] filter drop-shadow-2xl transition-all duration-100">
                            {companyB.logo}
                        </div>
                        {/* Gloves */}
                        <div className="absolute top-1/2 -left-8 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full border-4 border-blue-950 shadow-lg" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full border-4 border-blue-950 shadow-lg" />

                        {/* Hit Effect */}
                        <AnimatePresence>
                            {attacker === "A" && (
                                <motion.div
                                    initial={{ opacity: 1, scale: 0.5, rotate: 20 }}
                                    animate={{ opacity: 0, scale: 2.5, rotate: -20 }}
                                    className="absolute inset-0 flex items-center justify-center z-20"
                                >
                                    <Zap className="w-32 h-32 text-yellow-400 fill-yellow-400 stroke-black stroke-2" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Combat Log */}
                <div className="text-center mt-8 h-12 relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={log[0]}
                            initial={{ opacity: 0, y: 20, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.5 }}
                            className="text-2xl font-black text-white italic drop-shadow-md"
                        >
                            {log[0]}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Winner Overlay */}
                <AnimatePresence>
                    {winner && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-50"
                        >
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Trophy className="w-32 h-32 text-yellow-400 mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]" />
                            </motion.div>
                            <h2 className="text-8xl font-black text-white mb-4 italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600">
                                KO!
                            </h2>
                            <p className="text-3xl text-white font-bold mb-12">
                                <span className={winner === "A" ? "text-blue-400" : "text-red-400"}>
                                    {winner === "A" ? companyA.name.ko : companyB.name.ko}
                                </span>
                                {" "}WIN!
                            </p>
                            <button
                                onClick={onFinish}
                                className="px-10 py-4 bg-white text-black font-black text-xl rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                            >
                                결과 확인하기
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
