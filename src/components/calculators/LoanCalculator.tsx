"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Calendar, Percent, PieChart, Calculator } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";

type RepaymentMethod = "level-payment" | "level-principal" | "bullet";

export default function LoanCalculator() {
    const [amount, setAmount] = useState(100000000); // 1億
    const [rate, setRate] = useState(3.5);
    const [term, setTerm] = useState(10); // Years
    const [method, setMethod] = useState<RepaymentMethod>("level-payment");
    const [results, setResults] = useState<any>(null);

    useEffect(() => {
        calculateLoan();
    }, [amount, rate, term, method]);

    const calculateLoan = () => {
        const monthlyRate = rate / 100 / 12;
        const totalMonths = term * 12;
        let monthlyPayment = 0;
        let totalInterest = 0;
        let schedule = [];

        let balance = amount;

        if (method === "level-payment") {
            // 원리금균등
            monthlyPayment =
                (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
                (Math.pow(1 + monthlyRate, totalMonths) - 1);

            for (let i = 1; i <= totalMonths; i++) {
                const interest = balance * monthlyRate;
                const principal = monthlyPayment - interest;
                balance -= principal;
                totalInterest += interest;
                schedule.push({
                    month: i,
                    payment: Math.round(monthlyPayment),
                    principal: Math.round(principal),
                    interest: Math.round(interest),
                    balance: Math.max(0, Math.round(balance)),
                });
            }
        } else if (method === "level-principal") {
            // 원금균등
            const principalPayment = amount / totalMonths;

            for (let i = 1; i <= totalMonths; i++) {
                const interest = balance * monthlyRate;
                const payment = principalPayment + interest;
                balance -= principalPayment;
                totalInterest += interest;
                schedule.push({
                    month: i,
                    payment: Math.round(payment),
                    principal: Math.round(principalPayment),
                    interest: Math.round(interest),
                    balance: Math.max(0, Math.round(balance)),
                });
            }
            monthlyPayment = schedule[0].payment; // Initial payment
        } else {
            // 만기일시
            monthlyPayment = amount * monthlyRate;
            totalInterest = monthlyPayment * totalMonths;
            for (let i = 1; i <= totalMonths; i++) {
                schedule.push({
                    month: i,
                    payment: Math.round(monthlyPayment),
                    principal: 0,
                    interest: Math.round(monthlyPayment),
                    balance: amount
                });
            }
            // Last month pay full principal
            schedule[totalMonths - 1].payment += amount;
            schedule[totalMonths - 1].principal = amount;
            schedule[totalMonths - 1].balance = 0;
        }

        setResults({
            monthlyPayment: Math.round(monthlyPayment),
            totalInterest: Math.round(totalInterest),
            totalPayment: Math.round(amount + totalInterest),
            schedule,
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
                        <Calculator className="w-5 h-5 text-emerald-400" />
                        대출 조건 설정
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                대출 금액
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div className="flex gap-2 mt-2">
                                {[10000000, 50000000, 100000000].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val)}
                                        className="px-3 py-1 text-xs bg-zinc-800 text-zinc-400 rounded-full hover:bg-zinc-700 transition-colors"
                                    >
                                        {val / 10000}만
                                    </button>
                                ))}
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
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                대출 기간 (년)
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <input
                                    type="number"
                                    value={term}
                                    onChange={(e) => setTerm(Number(e.target.value))}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                상환 방식
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: "level-payment", label: "원리금균등" },
                                    { id: "level-principal", label: "원금균등" },
                                    { id: "bullet", label: "만기일시" },
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMethod(m.id as RepaymentMethod)}
                                        className={`py-2 text-sm rounded-lg transition-all ${method === m.id
                                                ? "bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20"
                                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                            }`}
                                    >
                                        {m.label}
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
                    className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between"
                >
                    <div>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-blue-400" />
                            상환 요약
                        </h2>

                        <div className="space-y-6">
                            <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                                <div className="text-sm text-zinc-400 mb-1">총 상환 금액</div>
                                <div className="text-3xl font-black text-white tracking-tight">
                                    {results ? formatMoney(results.totalPayment) : "-"}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                                    <div className="text-sm text-zinc-400 mb-1">총 이자</div>
                                    <div className="text-xl font-bold text-red-400">
                                        {results ? formatMoney(results.totalInterest) : "-"}
                                    </div>
                                </div>
                                <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                                    <div className="text-sm text-zinc-400 mb-1">월 평균 납입금</div>
                                    <div className="text-xl font-bold text-emerald-400">
                                        {results ? formatMoney(results.monthlyPayment) : "-"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-48 mt-8">
                        {results && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={results.schedule}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="month" hide />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}
                                        formatter={(value: number) => formatMoney(value)}
                                        labelFormatter={(label) => `${label}개월차`}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#10b981"
                                        fillOpacity={1}
                                        fill="url(#colorBalance)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
