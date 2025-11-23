"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PiggyBank, Calendar, Percent, TrendingUp } from "lucide-react";

type SavingsType = "deposit" | "savings"; // 예금(Lump sum) vs 적금(Monthly)
type TaxType = "normal" | "preferential" | "none"; // 일반(15.4), 우대(9.5), 비과세(0)

export default function DepositCalculator() {
    const [type, setType] = useState<SavingsType>("deposit");
    const [amount, setAmount] = useState(10000000); // Principal or Monthly
    const [rate, setRate] = useState(3.5);
    const [term, setTerm] = useState(12); // Months
    const [taxType, setTaxType] = useState<TaxType>("normal");
    const [results, setResults] = useState<any>(null);

    useEffect(() => {
        calculate();
    }, [type, amount, rate, term, taxType]);

    const calculate = () => {
        let principal = 0;
        let interest = 0;

        if (type === "deposit") {
            // 예금 (거치식)
            principal = amount;
            interest = principal * (rate / 100) * (term / 12);
        } else {
            // 적금 (적립식) - 단리 가정 (월복리는 복잡해서 일단 단리로)
            // Formula: Monthly * Months + Monthly * Rate * (Months + 1) * Months / 24
            principal = amount * term;
            interest = amount * (rate / 100) * (term + 1) * term / 24;
        }

        let taxRate = 0.154;
        if (taxType === "preferential") taxRate = 0.095;
        if (taxType === "none") taxRate = 0;

        const taxAmount = interest * taxRate;
        const afterTaxInterest = interest - taxAmount;
        const total = principal + afterTaxInterest;

        setResults({
            principal: Math.round(principal),
            interest: Math.round(interest),
            taxAmount: Math.round(taxAmount),
            afterTaxInterest: Math.round(afterTaxInterest),
            total: Math.round(total),
        });
    };

    const formatMoney = (val: number) => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl shadow-xl"
                >
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <PiggyBank className="w-5 h-5 text-pink-400" />
                        저축 조건 설정
                    </h2>

                    <div className="space-y-6">
                        {/* Type Selector */}
                        <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                            <button
                                onClick={() => setType("deposit")}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${type === "deposit"
                                        ? "bg-zinc-800 text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                예금 (목돈 굴리기)
                            </button>
                            <button
                                onClick={() => setType("savings")}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${type === "savings"
                                        ? "bg-zinc-800 text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                적금 (목돈 만들기)
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                {type === "deposit" ? "예치 금액" : "월 납입 금액"}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₩</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                연 이자율 (%)
                            </label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <input
                                    type="number"
                                    step="0.1"
                                    value={rate}
                                    onChange={(e) => setRate(Number(e.target.value))}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                저축 기간 (개월)
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <input
                                    type="number"
                                    value={term}
                                    onChange={(e) => setTerm(Number(e.target.value))}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                과세 구분
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: "normal", label: "일반 (15.4%)" },
                                    { id: "preferential", label: "세금우대 (9.5%)" },
                                    { id: "none", label: "비과세 (0%)" },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTaxType(t.id as TaxType)}
                                        className={`py-2 text-xs sm:text-sm rounded-lg transition-all ${taxType === t.id
                                                ? "bg-pink-500 text-white font-bold shadow-lg shadow-pink-500/20"
                                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Summary */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col justify-center"
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/20 text-pink-400 mb-4">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <h3 className="text-zinc-400 font-medium">만기 수령액 (세후)</h3>
                        <div className="text-4xl sm:text-5xl font-black text-white mt-2 tracking-tight">
                            {results ? formatMoney(results.total) : "-"}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                            <span className="text-zinc-400">원금 합계</span>
                            <span className="font-bold text-white">{results ? formatMoney(results.principal) : "-"}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                            <span className="text-zinc-400">세전 이자</span>
                            <span className="font-bold text-emerald-400">+{results ? formatMoney(results.interest) : "-"}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                            <span className="text-zinc-400">이자 과세 ({taxType === "normal" ? "15.4%" : taxType === "preferential" ? "9.5%" : "0%"})</span>
                            <span className="font-bold text-red-400">-{results ? formatMoney(results.taxAmount) : "-"}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
