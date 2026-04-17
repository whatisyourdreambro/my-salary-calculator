"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";

export default function CagrCalculator() {
    const [startValue, setStartValue] = useState<number | "">("");
    const [endValue, setEndValue] = useState<number | "">("");
    const [years, setYears] = useState<number | "">("");

    let cagr = 0;
    if (startValue && endValue && years) {
        // CAGR = (End / Start)^(1/n) - 1
        cagr = (Math.pow(Number(endValue) / Number(startValue), 1 / Number(years)) - 1) * 100;
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                CAGR (연평균 성장률) 계산기
            </h2>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">시작 금액</label>
                        <input
                            type="number"
                            value={startValue}
                            onChange={(e) => setStartValue(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">종료 금액</label>
                        <input
                            type="number"
                            value={endValue}
                            onChange={(e) => setEndValue(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">기간 (년)</label>
                    <input
                        type="number"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-slate-600 mb-2">연평균 성장률 (CAGR)</div>
                    <div className="text-4xl font-black text-blue-400">
                        {cagr ? cagr.toFixed(2) : "0.00"}%
                    </div>
                </div>
            </div>
        </div>
    );
}
