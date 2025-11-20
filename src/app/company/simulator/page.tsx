"use client";

import { useState } from "react";
import { ArrowLeft, Building2, Building, Calculator, Info } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AdUnit from "@/components/AdUnit";

export default function SimulatorPage() {
    const [smeSalary, setSmeSalary] = useState(35000000);
    const [largeSalary, setLargeSalary] = useState(45000000);
    const [isYouth, setIsYouth] = useState(true); // SME Youth Tax Exemption (90% reduction up to 2M)

    // Simplified Tax Calculation Logic (Approximation)
    const calculateNetPay = (gross: number, isSmeYouth: boolean) => {
        // Deductions (National Pension 4.5%, Health 3.545%, Care 0.46%, Employment 0.9%)
        const insurance = gross * (0.045 + 0.03545 + 0.0046 + 0.009);

        // Income Tax (Simplified Progressive Tax)
        let taxable = gross - insurance - 1500000; // Basic deduction approximation
        let tax = 0;
        if (taxable <= 14000000) tax = taxable * 0.06;
        else if (taxable <= 50000000) tax = 840000 + (taxable - 14000000) * 0.15;
        else tax = 6240000 + (taxable - 50000000) * 0.24;

        // Apply SME Youth Exemption (90% reduction, max 2M)
        if (isSmeYouth) {
            const reduction = Math.min(tax * 0.9, 2000000);
            tax -= reduction;
        }

        return Math.floor((gross - insurance - tax) / 12); // Monthly Net
    };

    const smeNet = calculateNetPay(smeSalary, isYouth);
    const largeNet = calculateNetPay(largeSalary, false);

    const data = [
        { name: "중소기업 (David)", net: smeNet, gross: smeSalary, color: "#10B981" },
        { name: "대기업 (Goliath)", net: largeNet, gross: largeSalary, color: "#3B82F6" },
    ];

    const formatCurrency = (val: number) => Math.round(val / 10000).toLocaleString();

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/company" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    기업 데이터베이스로
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-600">
                        David vs. Goliath
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        "연봉이 전부가 아닙니다."<br />
                        중소기업 청년 소득세 감면 혜택을 적용하면 실수령액은 어떻게 달라질까요?
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Controls */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-primary" />
                                시뮬레이션 설정
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        중소기업 연봉 (David)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min="24000000"
                                            max="60000000"
                                            step="1000000"
                                            value={smeSalary}
                                            onChange={(e) => setSmeSalary(Number(e.target.value))}
                                            className="w-full accent-emerald-500"
                                        />
                                    </div>
                                    <div className="text-right font-bold text-emerald-500 text-lg mt-1">
                                        {formatCurrency(smeSalary)}만원
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        대기업 연봉 (Goliath)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min="30000000"
                                            max="80000000"
                                            step="1000000"
                                            value={largeSalary}
                                            onChange={(e) => setLargeSalary(Number(e.target.value))}
                                            className="w-full accent-blue-500"
                                        />
                                    </div>
                                    <div className="text-right font-bold text-blue-500 text-lg mt-1">
                                        {formatCurrency(largeSalary)}만원
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                            청년 소득세 감면 (90%)
                                            <div className="group relative">
                                                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 text-xs text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    중소기업에 취업한 만 15~34세 청년에게 소득세의 90%를 감면해주는 제도입니다.
                                                </div>
                                            </div>
                                        </label>
                                        <input
                                            type="checkbox"
                                            checked={isYouth}
                                            onChange={(e) => setIsYouth(e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <AdUnit
                            slotId="3344556677"
                            format="rectangle"
                            label="Simulator Sidebar"
                        />
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 min-h-[500px] flex flex-col">
                            <h3 className="text-xl font-bold mb-8 text-center">월 실수령액 비교</h3>

                            <div className="flex-1 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 14, fontWeight: 'bold' }} />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px' }}
                                            formatter={(value: number) => [`${value.toLocaleString()}원`, '월 실수령액']}
                                        />
                                        <Bar dataKey="net" radius={[10, 10, 0, 0]} barSize={80}>
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                                    <div className="text-sm text-emerald-500 font-bold mb-1">David (중소기업)</div>
                                    <div className="text-2xl font-black text-foreground">
                                        {smeNet.toLocaleString()}원
                                    </div>
                                    {isYouth && <div className="text-xs text-emerald-400 mt-1">✨ 세금 감면 적용됨</div>}
                                </div>
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center">
                                    <div className="text-sm text-blue-500 font-bold mb-1">Goliath (대기업)</div>
                                    <div className="text-2xl font-black text-foreground">
                                        {largeNet.toLocaleString()}원
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-lg">
                                    실수령액 차이: <span className="font-bold text-red-500">{Math.abs(largeNet - smeNet).toLocaleString()}원</span>
                                </p>
                                {Math.abs(largeNet - smeNet) < 300000 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-2 text-sm text-muted-foreground bg-secondary/50 inline-block px-4 py-2 rounded-full"
                                    >
                                        💡 차이가 크지 않네요! 워라밸이나 성장성을 고려해보세요.
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
