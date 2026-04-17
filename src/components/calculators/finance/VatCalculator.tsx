"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Percent, ArrowRight } from "lucide-react";

export default function VatCalculator() {
    const [amount, setAmount] = useState<number | "">("");
    const [type, setType] = useState<"supply" | "total">("total"); // 공급가액 기준 vs 합계금액 기준

    const rate = 0.1; // 10%

    let supplyValue = 0;
    let vatValue = 0;
    let totalValue = 0;

    if (amount) {
        const val = Number(amount);
        if (type === "supply") {
            // 입력값이 공급가액
            supplyValue = val;
            vatValue = val * rate;
            totalValue = val + vatValue;
        } else {
            // 입력값이 합계금액 (공급대가)
            // Total = Supply * 1.1 => Supply = Total / 1.1
            supplyValue = val / 1.1;
            vatValue = val - supplyValue;
            totalValue = val;
        }
    }

    const formatMoney = (val: number) => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Percent className="w-6 h-6 text-slate-800" />
                부가세(VAT) 계산기
            </h2>

            <div className="space-y-6">
                {/* Type Selector */}
                <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
                    <button
                        onClick={() => setType("total")}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${type === "total"
                                ? "bg-primary text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        합계금액 기준 (부가세 포함)
                    </button>
                    <button
                        onClick={() => setType("supply")}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${type === "supply"
                                ? "bg-primary text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        공급가액 기준 (부가세 별도)
                    </button>
                </div>

                {/* Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                        금액 입력
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder={type === "total" ? "부가세 포함 금액" : "부가세 별도 금액"}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-xl text-white font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                </div>

                {/* Result */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600">공급가액</span>
                        <span className="text-xl font-bold text-white">{formatMoney(supplyValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600">부가세 (10%)</span>
                        <span className="text-xl font-bold text-slate-800">+{formatMoney(vatValue)}</span>
                    </div>
                    <div className="h-px bg-slate-100 my-2" />
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">합계금액</span>
                        <span className="text-2xl font-black text-white">{formatMoney(totalValue)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
