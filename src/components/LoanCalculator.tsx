"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, DollarSign, Percent, Calendar } from "lucide-react";

export default function LoanCalculator() {
    const [amount, setAmount] = useState(100000000); // 1억
    const [rate, setRate] = useState(4.5);
    const [period, setPeriod] = useState(30); // 30년
    const [type, setType] = useState<"equal_payment" | "equal_principal">("equal_payment");
    const [result, setResult] = useState<{ monthly: number; totalInterest: number; totalPayment: number } | null>(null);

    useEffect(() => {
        calculateLoan();
    }, [amount, rate, period, type]);

    const calculateLoan = () => {
        const monthlyRate = rate / 100 / 12;
        const months = period * 12;

        let monthlyPayment = 0;
        let totalInterest = 0;

        if (type === "equal_payment") {
            // 원리금균등상환
            monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
            totalInterest = (monthlyPayment * months) - amount;
        } else {
            // 원금균등상환 (첫달 기준 대략적 계산 for simple view)
            // 정확한 월별 상환표는 복잡하므로 여기서는 평균 월 상환액으로 근사치 제공
            const monthlyPrincipal = amount / months;
            const totalInterestCalc = amount * (rate / 100) * period / 2; // Rough estimate
            totalInterest = totalInterestCalc; // This is simplified
            monthlyPayment = monthlyPrincipal + (amount * monthlyRate); // First month
        }

        setResult({
            monthly: Math.round(monthlyPayment),
            totalInterest: Math.round(totalInterest),
            totalPayment: Math.round(amount + totalInterest),
        });
    };

    const formatMoney = (val: number) => {
        return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(val);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">대출 이자 계산기</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">대출 금액</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">연 이자율 (%)</label>
                        <div className="relative">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="number"
                                step="0.1"
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">대출 기간 (년)</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="number"
                                value={period}
                                onChange={(e) => setPeriod(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 flex flex-col justify-center space-y-6">
                    <div className="space-y-1">
                        <p className="text-sm text-slate-500 dark:text-slate-400">월 예상 상환액</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {result ? formatMoney(result.monthly) : "-"}
                        </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">총 이자액</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {result ? formatMoney(result.totalInterest) : "-"}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">총 상환금액</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {result ? formatMoney(result.totalPayment) : "-"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                    💡 <strong>Tip:</strong> 대출 금리가 1%만 낮아져도 총 이자가 수천만 원 절약됩니다.
                </p>
            </div>
        </div>
    );
}
