"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Calculator, Info } from "lucide-react";
import AdUnit from "@/components/AdUnit";

export default function LtvCalculator() {
    const [price, setPrice] = useState("");
    const [loan, setLoan] = useState("");
    const [ltv, setLtv] = useState<number | null>(null);

    const calculateLTV = () => {
        const housePrice = Number(price.replace(/[^0-9]/g, ""));
        const loanAmount = Number(loan.replace(/[^0-9]/g, ""));

        if (housePrice > 0) {
            const ltvValue = (loanAmount / housePrice) * 100;
            setLtv(ltvValue);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Home className="w-5 h-5 text-green-600" />
                    LTV (주택담보대출비율) 계산기
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                    주택 가격 대비 대출 금액의 비율을 계산합니다.
                </p>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-bold mb-2">주택 가격 (원)</label>
                    <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value.replace(/[^0-9]/g, "")).toLocaleString())}
                        className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-lg font-bold"
                        placeholder="500,000,000"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">대출 금액 (원)</label>
                    <input
                        type="text"
                        value={loan}
                        onChange={(e) => setLoan(Number(e.target.value.replace(/[^0-9]/g, "")).toLocaleString())}
                        className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-lg font-bold"
                        placeholder="300,000,000"
                    />
                </div>

                <button
                    onClick={calculateLTV}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <Calculator className="w-5 h-5" /> 계산하기
                </button>

                {ltv !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-center border border-green-100 dark:border-green-800"
                    >
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">당신의 LTV는</p>
                        <p className="text-4xl font-black text-green-600 dark:text-green-400">
                            {ltv.toFixed(2)}%
                        </p>
                        <div className="mt-4 text-xs text-zinc-500 text-left bg-white dark:bg-black/20 p-3 rounded-lg">
                            <p className="font-bold mb-1 flex items-center gap-1"><Info className="w-3 h-3" /> 참고</p>
                            <p>지역 및 주택 가격에 따라 LTV 한도가 다를 수 있습니다 (예: 투기과열지구 40~50%).</p>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                <AdUnit slotId="1231231234" format="horizontal" label="LTV Calculator Ad" />
            </div>
        </div>
    );
}
