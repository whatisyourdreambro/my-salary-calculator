"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CompanyProfile } from "@/types/company";
import { ComparisonResult } from "@/lib/versusEngine";
import { Trophy, Skull } from "lucide-react";

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

    // Determine stats based on salary data
    const damageA = Math.max(10, Math.round(result.metrics.totalComp.a / 2000000)); // e.g., 60m -> 30 dmg
    const damageB = Math.max(10, Math.round(result.metrics.totalComp.b / 2000000));

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (!winner) {
            interval = setInterval(() => {
                // Randomly decide who attacks, but weighted slightly by speed (real hourly wage?)
                // For simplicity, 50/50 chance + slight bias
                const roll = Math.random();
                const bias = result.metrics.realHourlyWage.a > result.metrics.realHourlyWage.b ? 0.4 : 0.6;

                const isATurn = roll < bias;

                if (isATurn) {
                    setAttacker("A");
                    setHpB((prev) => {
                        const newHp = Math.max(0, prev - damageA);
                        if (newHp === 0) setWinner("A");
                        return newHp;
                    });
                    setLog((prev) => [`${companyA.name.ko} throws a punch!`, ...prev.slice(0, 2)]);
                } else {
                    setAttacker("B");
                    setHpA((prev) => {
                        const newHp = Math.max(0, prev - damageB);
                        if (newHp === 0) setWinner("B");
                        return newHp;
                    });
                    setLog((prev) => [`${companyB.name.ko} throws a punch!`, ...prev.slice(0, 2)]);
                }

                // Reset attacker animation after a short delay
                setTimeout(() => setAttacker(null), 300);

            }, 800);
        }

        return () => clearInterval(interval);
    }, [winner, companyA, companyB, damageA, damageB, result]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
            <div className="w-full max-w-4xl p-8 relative">
                {/* Health Bars */}
                <div className="flex justify-between items-center mb-12 gap-8">
                    <div className="flex-1">
                        <div className="flex justify-between text-blue-400 font-bold mb-2">
                            <span>{companyA.name.ko}</span>
                            <span>{hpA}%</span>
                        </div>
                        <div className="h-6 bg-zinc-800 rounded-full overflow-hidden border border-blue-900">
                            <motion.div
                                className="h-full bg-blue-500"
                                initial={{ width: "100%" }}
                                animate={{ width: `${hpA}%` }}
                                transition={{ type: "spring" }}
                            />
                        </div>
                    </div>
                    <div className="text-4xl font-black text-red-600 italic">VS</div>
                    <div className="flex-1">
                        <div className="flex justify-between text-red-400 font-bold mb-2">
                            <span>{hpB}%</span>
                            <span>{companyB.name.ko}</span>
                        </div>
                        <div className="h-6 bg-zinc-800 rounded-full overflow-hidden border border-red-900">
                            <motion.div
                                className="h-full bg-red-500"
                                initial={{ width: "100%" }}
                                animate={{ width: `${hpB}%` }}
                                transition={{ type: "spring" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Arena */}
                <div className="flex justify-between items-center h-64 relative px-20">
                    {/* Fighter A */}
                    <motion.div
                        className="relative"
                        animate={{
                            x: attacker === "A" ? 100 : 0,
                            rotate: attacker === "A" ? 15 : 0,
                            scale: attacker === "B" ? 0.9 : 1, // Get hit effect
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                        <div className="text-[120px] filter drop-shadow-2xl transform scale-x-[-1]">
                            {companyA.logo}
                        </div>
                        {/* Gloves */}
                        <div className="absolute top-1/2 -right-4 w-12 h-12 bg-red-600 rounded-full border-4 border-red-800" />
                        <div className="absolute bottom-0 right-0 w-12 h-12 bg-red-600 rounded-full border-4 border-red-800" />

                        {/* Hit Effect */}
                        <AnimatePresence>
                            {attacker === "B" && (
                                <motion.div
                                    initial={{ opacity: 1, scale: 0.5 }}
                                    animate={{ opacity: 0, scale: 2 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <span className="text-6xl font-black text-yellow-400 stroke-black">POW!</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Fighter B */}
                    <motion.div
                        className="relative"
                        animate={{
                            x: attacker === "B" ? -100 : 0,
                            rotate: attacker === "B" ? -15 : 0,
                            scale: attacker === "A" ? 0.9 : 1,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                        <div className="text-[120px] filter drop-shadow-2xl">
                            {companyB.logo}
                        </div>
                        {/* Gloves */}
                        <div className="absolute top-1/2 -left-4 w-12 h-12 bg-blue-600 rounded-full border-4 border-blue-800" />
                        <div className="absolute bottom-0 left-0 w-12 h-12 bg-blue-600 rounded-full border-4 border-blue-800" />

                        {/* Hit Effect */}
                        <AnimatePresence>
                            {attacker === "A" && (
                                <motion.div
                                    initial={{ opacity: 1, scale: 0.5 }}
                                    animate={{ opacity: 0, scale: 2 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <span className="text-6xl font-black text-yellow-400 stroke-black">BAM!</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Combat Log */}
                <div className="text-center mt-12 h-8">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={log[0]}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-xl font-bold text-zinc-300"
                        >
                            {log[0]}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Winner Overlay */}
                <AnimatePresence>
                    {winner && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-3xl z-50"
                        >
                            <Trophy className="w-24 h-24 text-yellow-400 mb-4 animate-bounce" />
                            <h2 className="text-5xl font-black text-white mb-2">KO!</h2>
                            <p className="text-2xl text-zinc-300 mb-8">
                                {winner === "A" ? companyA.name.ko : companyB.name.ko} Wins!
                            </p>
                            <button
                                onClick={onFinish}
                                className="px-8 py-4 bg-white text-black font-bold text-xl rounded-full hover:scale-110 transition-transform"
                            >
                                결과 자세히 보기
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
