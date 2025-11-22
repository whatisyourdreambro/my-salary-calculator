"use client";

import Link from "next/link";
import { ArrowRight, Calculator, Globe, DollarSign, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export default function EnglishLandingPage() {
    return (
        <div className="min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4 inline-block">
                            Welcome to Korea 🇰🇷
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                            Salary in Korea
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                            The ultimate guide to understanding your paycheck in South Korea.
                            Calculate net pay, taxes, and discover the 19% Flat Tax benefit.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/en/flat-tax"
                                className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                <Calculator className="w-5 h-5" />
                                Flat Tax Calculator
                            </Link>
                            <Link
                                href="/global"
                                className="px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
                            >
                                <Globe className="w-5 h-5" />
                                Global Comparison
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8"
                    >
                        <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <DollarSign className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">19% Flat Tax Rate</h3>
                        <p className="text-muted-foreground mb-4">
                            Foreign workers in Korea can choose a flat 19% tax rate instead of the progressive tax rate for their first 20 years.
                        </p>
                        <Link href="/en/flat-tax" className="text-primary font-bold hover:underline flex items-center">
                            Check if you save <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8"
                    >
                        <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <Building2 className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Corporate Database</h3>
                        <p className="text-muted-foreground mb-4">
                            Explore salaries at top Korean companies like Samsung, SK, and Hyundai. (Currently in Korean)
                        </p>
                        <Link href="/company" className="text-primary font-bold hover:underline flex items-center">
                            View Companies <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8"
                    >
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <Globe className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Global Comparison</h3>
                        <p className="text-muted-foreground mb-4">
                            See how your Korean salary compares to what you might earn in the US, Japan, or Singapore.
                        </p>
                        <Link href="/global" className="text-primary font-bold hover:underline flex items-center">
                            Compare Now <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
