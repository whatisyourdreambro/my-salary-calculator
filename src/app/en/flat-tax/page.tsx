"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Info, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import AdUnit from "@/components/AdUnit";

export default function FlatTaxPage() {
    const [annualSalary, setAnnualSalary] = useState(60000000);

    // Simplified Tax Logic
    const calculateTaxes = (gross: number) => {
        // 1. Progressive Tax (Standard)
        // Deductions (Approximate)
        const insurance = gross * (0.045 + 0.03545 + 0.0046 + 0.009);
        const standardDeduction = 1500000; // Basic
        const taxableProgressive = gross - insurance - standardDeduction;

        let taxProgressive = 0;
        if (taxableProgressive > 0) {
            if (taxableProgressive <= 14000000) taxProgressive = taxableProgressive * 0.06;
            else if (taxableProgressive <= 50000000) taxProgressive = 840000 + (taxableProgressive - 14000000) * 0.15;
            else if (taxableProgressive <= 88000000) taxProgressive = 6240000 + (taxableProgressive - 50000000) * 0.24;
            else taxProgressive = 15360000 + (taxableProgressive - 88000000) * 0.35;
        }

        // 2. Flat Tax (19%)
        // No deductions allowed for flat tax
        const taxFlat = gross * 0.19;

        return {
            progressive: {
                tax: taxProgressive,
                net: gross - insurance - taxProgressive,
                rate: (taxProgressive / gross) * 100
            },
            flat: {
                tax: taxFlat,
                net: gross - insurance - taxFlat, // Insurance is still deducted? Actually Flat Tax usually replaces Income Tax, insurance is separate. Assuming insurance applies to both.
                rate: 19
            }
        };
    };

    const result = calculateTaxes(annualSalary);
    const isFlatBetter = result.flat.net > result.progressive.net;
    const savings = Math.abs(result.flat.net - result.progressive.net);

    const formatCurrency = (val: number) => Math.round(val).toLocaleString();

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/en" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to English Hub
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                        19% Flat Tax Calculator
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Should you choose the 19% Flat Tax rate? Find out now.
                    </p>
                </div>

                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 mb-8">
                    <div className="mb-8">
                        <label className="block text-lg font-bold mb-4">Annual Gross Salary (KRW)</label>
                        <input
                            type="range"
                            min="30000000"
                            max="300000000"
                            step="1000000"
                            value={annualSalary}
                            onChange={(e) => setAnnualSalary(Number(e.target.value))}
                            className="w-full accent-blue-500 mb-4"
                        />
                        <div className="flex items-center justify-between">
                            <input
                                type="number"
                                value={annualSalary}
                                onChange={(e) => setAnnualSalary(Number(e.target.value))}
                                className="bg-secondary/50 border border-border rounded-lg p-2 text-xl font-bold w-48"
                            />
                            <span className="text-2xl font-bold text-primary">{formatCurrency(annualSalary / 10000)} Man Won</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Progressive Tax Card */}
                        <div className={`p-6 rounded-2xl border-2 transition-all ${!isFlatBetter ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-secondary/20'}`}>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                Standard Progressive Tax
                                {!isFlatBetter && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Estimated Tax</span>
                                    <span>{formatCurrency(result.progressive.tax)} KRW</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Effective Rate</span>
                                    <span>{result.progressive.rate.toFixed(1)}%</span>
                                </div>
                                <div className="pt-4 border-t border-white/10 mt-4">
                                    <div className="text-sm text-muted-foreground mb-1">Annual Net Pay</div>
                                    <div className="text-2xl font-black">{formatCurrency(result.progressive.net)} KRW</div>
                                </div>
                            </div>
                        </div>

                        {/* Flat Tax Card */}
                        <div className={`p-6 rounded-2xl border-2 transition-all ${isFlatBetter ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-secondary/20'}`}>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                19% Flat Tax
                                {isFlatBetter && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Fixed Tax</span>
                                    <span>{formatCurrency(result.flat.tax)} KRW</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Fixed Rate</span>
                                    <span>19.0%</span>
                                </div>
                                <div className="pt-4 border-t border-white/10 mt-4">
                                    <div className="text-sm text-muted-foreground mb-1">Annual Net Pay</div>
                                    <div className="text-2xl font-black">{formatCurrency(result.flat.net)} KRW</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        {isFlatBetter ? (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-block bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
                            >
                                🎉 The Flat Tax saves you {formatCurrency(savings)} KRW per year!
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
                            >
                                👍 Stick with the Standard Tax! You save {formatCurrency(savings)} KRW.
                            </motion.div>
                        )}
                        <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto">
                            * This is a simplified estimation. The Flat Tax (19%) generally benefits high earners (usually above ~140M KRW gross). Consult a tax professional for exact figures.
                        </p>
                    </div>
                </div>

                <AdUnit
                    slotId="9988776655"
                    format="auto"
                    responsive={true}
                    label="Flat Tax Bottom"
                />
            </div>
        </div>
    );
}
