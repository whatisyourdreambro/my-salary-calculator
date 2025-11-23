"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Divide, ArrowRightLeft, Percent } from "lucide-react";

export default function MathCalculators() {
    const [activeTab, setActiveTab] = useState<"percent" | "unit">("percent");

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-zinc-900 p-1 rounded-xl border border-zinc-800 flex gap-1">
                    <button
                        onClick={() => setActiveTab("percent")}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "percent"
                                ? "bg-indigo-500 text-white shadow-lg"
                                : "text-zinc-400 hover:text-white"
                            }`}
                    >
                        퍼센트 계산기
                    </button>
                    <button
                        onClick={() => setActiveTab("unit")}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "unit"
                                ? "bg-indigo-500 text-white shadow-lg"
                                : "text-zinc-400 hover:text-white"
                            }`}
                    >
                        단위 변환기
                    </button>
                </div>
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === "percent" ? <PercentCalculator /> : <UnitConverter />}
            </motion.div>
        </div>
    );
}

function PercentCalculator() {
    const [val1, setVal1] = useState<number | "">("");
    const [val2, setVal2] = useState<number | "">("");

    // 1. What is X% of Y?
    const res1 = val1 && val2 ? (Number(val1) / 100) * Number(val2) : 0;

    // 2. X is what % of Y?
    const res2 = val1 && val2 ? (Number(val1) / Number(val2)) * 100 : 0;

    // 3. Percentage change from X to Y
    const res3 = val1 && val2 ? ((Number(val2) - Number(val1)) / Number(val1)) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Case 1 */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-indigo-400" /> 비율 계산
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="전체값"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white"
                            onChange={(e) => setVal2(Number(e.target.value))}
                        />
                        <span className="text-zinc-400">의</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="비율(%)"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white"
                            onChange={(e) => setVal1(Number(e.target.value))}
                        />
                        <span className="text-zinc-400">% 는?</span>
                    </div>
                    <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-center">
                        <span className="text-2xl font-black text-indigo-400">{res1.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Case 2 */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Divide className="w-4 h-4 text-indigo-400" /> 비중 계산
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="일부값"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white"
                            onChange={(e) => setVal1(Number(e.target.value))}
                        />
                        <span className="text-zinc-400">은</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="전체값"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white"
                            onChange={(e) => setVal2(Number(e.target.value))}
                        />
                        <span className="text-zinc-400">의 몇 %?</span>
                    </div>
                    <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-center">
                        <span className="text-2xl font-black text-indigo-400">{res2.toFixed(2)}%</span>
                    </div>
                </div>
            </div>

            {/* Case 3 */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-indigo-400" /> 증감율 계산
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="기존값"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white"
                            onChange={(e) => setVal1(Number(e.target.value))}
                        />
                        <span className="text-zinc-400">에서</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="변경값"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white"
                            onChange={(e) => setVal2(Number(e.target.value))}
                        />
                        <span className="text-zinc-400">으로 변하면?</span>
                    </div>
                    <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-center">
                        <span className={`text-2xl font-black ${res3 > 0 ? "text-red-400" : "text-blue-400"}`}>
                            {res3 > 0 ? "+" : ""}{res3.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UnitConverter() {
    // Simple implementation for length and weight
    const [category, setCategory] = useState("length");
    const [value, setValue] = useState<number>(1);

    // Length: m to ...
    // Weight: kg to ...

    const lengthUnits = {
        m: 1,
        cm: 100,
        mm: 1000,
        km: 0.001,
        inch: 39.3701,
        ft: 3.28084,
        yd: 1.09361,
        pyeong: 0.3025 // 1m2 = 0.3025 pyeong approx? No, 1 pyeong = 3.3058 m2. So 1 m2 = 1/3.3058 pyeong. 
        // Let's stick to Length (Linear) not Area for now.
    };

    // Area
    const areaUnits = {
        m2: 1,
        pyeong: 0.3025, // 1 m2 = 0.3025 pyeong
        ft2: 10.7639,
    }

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl text-center">
            <p className="text-zinc-400">단위 변환기는 준비 중입니다...</p>
        </div>
    )
}
