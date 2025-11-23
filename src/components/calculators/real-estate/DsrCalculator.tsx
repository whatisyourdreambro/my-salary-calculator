"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Calculator, Info } from "lucide-react";
import AdUnit from "@/components/AdUnit";

export default function DsrCalculator() {
    const [income, setIncome] = useState("");
    const [principal, setPrincipal] = useState(""); // Total annual principal repayment
    const [interest, setInterest] = useState(""); // Total annual interest repayment
    const [dsr, setDsr] = useState<number | null>(null);

    const calculateDSR = () => {
        const annualIncome = Number(income.replace(/[^0-9]/g, ""));
        const annualPrincipal = Number(principal.replace(/[^0-9]/g, ""));
        const annualInterest = Number(interest.replace(/[^0-9]/g, ""));

        if (annualIncome > 0) {
            const totalRepayment = annualPrincipal + annualInterest;
            const dsrValue = (totalRepayment / annualIncome) * 100;
            setDsr(dsrValue);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    DSR (총부채원리금상환비율) 계산기
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                    연소득 대비 연간 대출 원리금 상환액 비율을 계산합니다.
                </p>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-bold mb-2">연소득 (원)</label>
                    <input
                        type="text"
                        value={income}
                        onChange={(e) => setIncome(Number(e.target.value.replace(/[^0-9]/g, "")).toLocaleString())}
                        className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-lg font-bold"
                        placeholder="50,000,000"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">연간 원금 상환액</label>
                        <input
                            type="text"
                            value={principal}
                            onChange={(e) => setPrincipal(Number(e.target.value.replace(/[^0-9]/g, "")).toLocaleString())}
                            className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent"
                            placeholder="10,000,000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">연간 이자 상환액</label>
                        <input
                            type="text"
                            value={interest}
                            onChange={(e) => setInterest(Number(e.target.value.replace(/[^0-9]/g, "")).toLocaleString())}
                            className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent"
                            placeholder="2,000,000"
                        />
                    </div>
                </div>

                <button
                    onClick={calculateDSR}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <Calculator className="w-5 h-5" /> 계산하기
                </button>

                {dsr !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center border border-blue-100 dark:border-blue-800"
                    >
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">당신의 DSR은</p>
                        <p className="text-4xl font-black text-blue-600 dark:text-blue-400">
                            {dsr.toFixed(2)}%
                        </p>
                        <div className="mt-4 text-xs text-zinc-500 text-left bg-white dark:bg-black/20 p-3 rounded-lg">
                            <p className="font-bold mb-1 flex items-center gap-1"><Info className="w-3 h-3" /> 참고</p>
                            <p>일반적으로 DSR 40% (은행권), 50% (제2금융권) 규제가 적용됩니다.</p>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                <AdUnit slotId="1231231234" format="horizontal" label="DSR Calculator Ad" />
            </div>
        </div>
    );
}
