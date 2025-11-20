"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AdUnit from "@/components/AdUnit";

export default function GlobalTaxPage() {
    const [salaryKRW, setSalaryKRW] = useState(60000000);

    // Exchange Rates (Simplified)
    const RATES = {
        USD: 1350,
        JPY: 9,
        SGD: 1000,
    };

    // Simplified Tax Logic for Comparison (Effective Tax Rates Approximation)
    const calculateGlobalNet = (grossKRW: number) => {
        // Korea (Standard)
        const krNet = grossKRW * 0.84; // Approx 16% effective tax + insurance for 60M

        // USA (California - Federal + State + FICA) ~ Approx 25-30% effective
        const usGross = grossKRW / RATES.USD;
        const usNetUSD = usGross * 0.72;
        const usNetKRW = usNetUSD * RATES.USD;

        // Japan (Income + Resident + Social) ~ Approx 20-25% effective
        const jpGross = (grossKRW / RATES.JPY) * 100; // JPY is usually per 100 KRW calculation
        // Actually let's just do direct conversion
        // 1 KRW = 0.11 JPY approx. Let's use the rate defined.
        // 60M KRW / 9 * 100 = 6.6M JPY? No. 
        // 1000 KRW = 110 JPY. 
        // 60,000,000 KRW = 6,600,000 JPY approx.
        // Let's stick to the defined rate: 1 JPY = 9 KRW.
        // So 60M KRW = 6,666,666 JPY.
        const jpGrossJPY = grossKRW / RATES.JPY;
        const jpNetJPY = jpGrossJPY * 0.78;
        const jpNetKRW = jpNetJPY * RATES.JPY;

        // Singapore (Very low tax) ~ Approx 5-10% effective
        const sgGrossSGD = grossKRW / RATES.SGD;
        const sgNetSGD = sgGrossSGD * 0.92;
        const sgNetKRW = sgNetSGD * RATES.SGD;

        return [
            { name: "South Korea 🇰🇷", net: krNet, gross: grossKRW, color: "#10B981" },
            { name: "USA (CA) 🇺🇸", net: usNetKRW, gross: grossKRW, color: "#3B82F6" },
            { name: "Japan 🇯🇵", net: jpNetKRW, gross: grossKRW, color: "#F59E0B" },
            { name: "Singapore 🇸🇬", net: sgNetKRW, gross: grossKRW, color: "#8B5CF6" },
        ];
    };

    const data = calculateGlobalNet(salaryKRW);
    const formatCurrency = (val: number) => Math.round(val / 10000).toLocaleString();

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/en" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to English Hub
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                        Global Salary Comparison
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        How much is your Korean salary worth globally? <br />
                        Comparing purchasing power and tax efficiency.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Controls */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary" />
                                Settings
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        Annual Gross Salary (KRW)
                                    </label>
                                    <input
                                        type="range"
                                        min="30000000"
                                        max="200000000"
                                        step="1000000"
                                        value={salaryKRW}
                                        onChange={(e) => setSalaryKRW(Number(e.target.value))}
                                        className="w-full accent-indigo-500 mb-4"
                                    />
                                    <div className="text-right font-bold text-indigo-500 text-2xl">
                                        {formatCurrency(salaryKRW)} Man Won
                                    </div>
                                </div>

                                <div className="p-4 bg-secondary/30 rounded-xl text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">USD Rate</span>
                                        <span>1 USD = {RATES.USD} KRW</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">JPY Rate</span>
                                        <span>100 JPY = {RATES.JPY * 100} KRW</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">SGD Rate</span>
                                        <span>1 SGD = {RATES.SGD} KRW</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <AdUnit
                            slotId="4455667788"
                            format="rectangle"
                            label="Global Sidebar"
                        />
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 min-h-[500px] flex flex-col">
                            <h3 className="text-xl font-bold mb-8 text-center">Estimated Annual Net Pay (Converted to KRW)</h3>

                            <div className="flex-1 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.8)" tick={{ fontSize: 12, fontWeight: 'bold' }} width={100} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px' }}
                                            formatter={(value: number) => [`${Math.round(value).toLocaleString()} KRW`, 'Net Pay']}
                                        />
                                        <Bar dataKey="net" radius={[0, 10, 10, 0]} barSize={40}>
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-6 text-center text-sm text-muted-foreground">
                                * This is a rough estimation assuming standard single-person tax rates in each country. <br />
                                Actual take-home pay varies significantly by state/prefecture and individual deductions.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
