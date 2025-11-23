"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlobalTaxEngine, COUNTRY_NAMES, CountryCode, PPP_INDEX, TaxResult } from "@/lib/global/taxEngine";
import { Calculator, Globe, TrendingUp, Info } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import AdUnit from "@/components/AdUnit";

export default function SalaryConverterPage() {
    const [salaryKRW, setSalaryKRW] = useState<number>(60000000); // Default 60M KRW
    const [results, setResults] = useState<any[]>([]);

    const calculate = () => {
        const countries: CountryCode[] = ['KR', 'US', 'JP', 'SG', 'UK'];
        const data = countries.map(code => {
            const taxResult = GlobalTaxEngine.calculate(salaryKRW, code);
            // PPP Adjustment: How much is this Net worth in US terms?
            // Formula: Net / PPP_INDEX
            // If PPP is 0.75 (KR), and Net is 1000, Real Value is 1333 (It buys more)
            // We normalize everything to USD PPP for comparison

            // First convert Net to USD
            let netInUSD = 0;
            if (code === 'KR') netInUSD = taxResult.net * 0.00075;
            else if (code === 'US') netInUSD = taxResult.net;
            else if (code === 'JP') netInUSD = taxResult.net * (0.00075 / 0.11); // Approx
            else if (code === 'SG') netInUSD = taxResult.net * 0.75; // 1 SGD ~ 0.75 USD
            else if (code === 'UK') netInUSD = taxResult.net * 1.25; // 1 GBP ~ 1.25 USD

            const pppAdjustedNetUSD = netInUSD / PPP_INDEX[code];

            return {
                ...taxResult,
                netInUSD,
                pppAdjustedNetUSD,
                countryName: COUNTRY_NAMES[code].name,
                flag: COUNTRY_NAMES[code].flag,
            };
        });
        setResults(data);
    };

    // Initial calc
    useState(() => {
        calculate();
    });

    const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSalaryKRW(Number(e.target.value));
        // Debounce could be added here, but for now direct update
    };

    // Re-calc when salary changes (useEffect would be better but simple logic here)
    const onCalculateClick = () => {
        calculate();
    };

    return (
        <main className="w-full min-h-screen bg-slate-950 text-white pb-20">
            {/* Hero */}
            <div className="relative bg-slate-900 py-16 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />

                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-6">
                        <Globe className="w-4 h-4" />
                        Global Salary Intelligence
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                        Global Salary Converter <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            Real Purchasing Power (PPP)
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Compare your salary against the world. We calculate taxes and cost of living to show you the "Real Feel" value of your income in Silicon Valley, Tokyo, and London.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
                {/* Input Section */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl mb-12">
                    <div className="flex flex-col md:flex-row items-end gap-4">
                        <div className="flex-1 w-full">
                            <label className="block text-slate-300 font-medium mb-2">Annual Salary (KRW)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={salaryKRW}
                                    onChange={handleSalaryChange}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-4 px-4 text-2xl font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">KRW</span>
                            </div>
                        </div>
                        <button
                            onClick={onCalculateClick}
                            className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <Calculator className="w-5 h-5" />
                            Calculate
                        </button>
                    </div>
                    <div className="mt-4 flex gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1"><Info className="w-4 h-4" /> 1 USD ≈ 1,330 KRW</span>
                        <span className="flex items-center gap-1"><Info className="w-4 h-4" /> Tax rules updated 2024</span>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-3xl p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            Real Purchasing Power (Net USD)
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={results} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                    <XAxis type="number" stroke="#94a3b8" tickFormatter={(val) => `$${val / 1000}k`} />
                                    <YAxis dataKey="country" type="category" stroke="#fff" width={40} />
                                    <Tooltip
                                        cursor={{ fill: '#334155', opacity: 0.4 }}
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                        formatter={(val: number) => [`$${Math.round(val).toLocaleString()}`, 'Real Value (USD)']}
                                    />
                                    <Bar dataKey="pppAdjustedNetUSD" radius={[0, 4, 4, 0]}>
                                        {results.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.country === 'KR' ? '#3b82f6' : '#10b981'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-center text-sm text-slate-400 mt-4">
                            * Adjusted for Cost of Living (PPP). Higher is better.
                        </p>
                    </div>

                    {/* Ad Unit */}
                    <div className="flex items-center justify-center bg-slate-800/30 rounded-3xl border border-slate-700/50">
                        <AdUnit slotId="1122334455" format="rectangle" label="Global Side" />
                    </div>
                </div>

                {/* Detailed Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((res) => (
                        <motion.div
                            key={res.country}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative p-6 rounded-2xl border ${res.country === 'KR' ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-800 border-slate-700'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-4xl mb-2">{res.flag}</div>
                                    <h3 className="text-lg font-bold">{res.countryName}</h3>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${res.effectiveRate > 30 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                    Tax {res.effectiveRate.toFixed(1)}%
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Gross Income</span>
                                    <span className="font-mono">{Math.round(res.gross).toLocaleString()} {res.currency}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Net Income</span>
                                    <span className="font-mono font-bold text-white">{Math.round(res.net).toLocaleString()} {res.currency}</span>
                                </div>
                                <div className="pt-3 border-t border-slate-600/50 flex justify-between items-center">
                                    <span className="text-sm text-emerald-400 font-bold">Real Value (PPP)</span>
                                    <span className="text-xl font-black text-emerald-400">
                                        ${Math.round(res.pppAdjustedNetUSD).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
