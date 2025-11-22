"use client";

import { useState, useEffect } from "react";
import { PiggyBank, TrendingUp, Calendar, DollarSign } from "lucide-react";

export default function DepositCalculator() {
    const [monthlyAmount, setMonthlyAmount] = useState(1000000); // 100만원
    const [rate, setRate] = useState(3.5);
    const [period, setPeriod] = useState(12); // 12개월
    const [isCompound, setIsCompound] = useState(true);
    const [result, setResult] = useState<{ principal: number; interest: number; total: number; tax: number } | null>(null);

    useEffect(() => {
        calculateDeposit();
    }, [monthlyAmount, rate, period, isCompound]);

    const calculateDeposit = () => {
        const principal = monthlyAmount * period;
        let interest = 0;

        if (isCompound) {
            // 월복리
            const monthlyRate = rate / 100 / 12;
            interest = monthlyAmount * ((Math.pow(1 + monthlyRate, period + 1) - (1 + monthlyRate)) / monthlyRate) - principal;
        } else {
            // 단리
            interest = monthlyAmount * (period * (period + 1) / 2) * (rate / 100 / 12);
        }

        const tax = interest * 0.154; // 15.4%
        const afterTaxInterest = interest - tax;

        setResult({
            principal,
            interest: Math.round(interest),
            tax: Math.round(tax),
            total: Math.round(principal + afterTaxInterest),
        });
    };

    const formatMoney = (val: number) => {
        return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(val);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <PiggyBank className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">적금 이자 계산기</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">월 적립액</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="number"
                                value={monthlyAmount}
                                onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">연 이자율 (%)</label>
                        <div className="relative">
                            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="number"
                                step="0.1"
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">적립 기간 (개월)</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="number"
                                value={period}
                                onChange={(e) => setPeriod(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <button
                            onClick={() => setIsCompound(true)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${isCompound ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}
                        >
                            월복리
                        </button>
                        <button
                            onClick={() => setIsCompound(false)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${!isCompound ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}
                        >
                            단리
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 flex flex-col justify-center space-y-6">
                    <div className="space-y-1">
                        <p className="text-sm text-slate-500 dark:text-slate-400">세후 만기 수령액</p>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            {result ? formatMoney(result.total) : "-"}
                        </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">원금 합계</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {result ? formatMoney(result.principal) : "-"}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">세전 이자</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {result ? formatMoney(result.interest) : "-"}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">이자 과세 (15.4%)</span>
                            <span className="font-semibold text-red-500">
                                -{result ? formatMoney(result.tax) : "-"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
