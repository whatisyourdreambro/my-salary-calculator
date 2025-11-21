"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Share2, Download, RefreshCw } from "lucide-react";
import CountUp from "react-countup";
import AdUnit from "@/components/AdUnit";
import { generateAnnualSalaryTableData } from "@/lib/generateData";

// Utility to find closest salary data
const getSalaryData = (annualSalary: number) => {
    const data = generateAnnualSalaryTableData();
    // Find closest match
    return data.reduce((prev, curr) => {
        return Math.abs(curr.preTax - annualSalary) < Math.abs(prev.preTax - annualSalary)
            ? curr
            : prev;
    });
};

export default function SalarySlipPage() {
    const [salaryInput, setSalaryInput] = useState("60,000,000");
    const [isPrinting, setIsPrinting] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const salary = Number(salaryInput.replace(/,/g, ""));
        if (salary > 0) {
            setIsPrinting(true);
            const data = getSalaryData(salary);

            // Simulate printing delay
            setTimeout(() => {
                setReceiptData(data);
                setIsPrinting(false);
            }, 1500);
        }
    };

    const handleReset = () => {
        setReceiptData(null);
        setSalaryInput("");
    };

    return (
        <main className="w-full min-h-screen bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center py-12 px-4">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-medium text-sm mb-4">
                    <Receipt className="w-4 h-4" />
                    <span>월급 영수증 발급기</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    내 월급, <span className="text-primary">영수증</span>으로 확인하기
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    세금으로 얼마가 나가는지, 실제 내 돈은 얼마인지 영수증으로 뽑아보세요.
                </p>
            </div>

            {/* Input Section */}
            <AnimatePresence mode="wait">
                {!receiptData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-700 relative z-10"
                    >
                        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                            연봉을 입력하세요
                        </label>
                        <div className="relative mb-6">
                            <input
                                type="text"
                                value={salaryInput}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                    setSalaryInput(Number(val).toLocaleString());
                                }}
                                className="w-full p-4 text-2xl font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-center"
                                placeholder="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">
                                원
                            </span>
                        </div>

                        <button
                            onClick={handlePrint}
                            disabled={isPrinting || !salaryInput}
                            className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isPrinting ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    영수증 출력 중...
                                </>
                            ) : (
                                <>
                                    <Receipt className="w-5 h-5" />
                                    영수증 발급받기
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Receipt Display */}
            <AnimatePresence>
                {receiptData && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className="relative mt-8 perspective-1000"
                    >
                        {/* Receipt Paper */}
                        <div
                            ref={receiptRef}
                            className="w-[380px] bg-white text-zinc-900 shadow-2xl relative overflow-hidden font-mono text-sm leading-relaxed transform-gpu origin-top"
                            style={{
                                filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.15))",
                            }}
                        >
                            {/* Jagged Top */}
                            <div className="absolute top-0 left-0 w-full h-4 bg-zinc-100 dark:bg-zinc-900 z-10"
                                style={{
                                    clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)"
                                }}
                            />

                            <div className="p-8 pt-12">
                                {/* Header */}
                                <div className="text-center border-b-2 border-dashed border-zinc-300 pb-6 mb-6">
                                    <h2 className="text-2xl font-black tracking-tighter mb-1">MONEY SALARY</h2>
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Official Salary Receipt</p>
                                    <p className="text-xs text-zinc-400 mt-2">{new Date().toLocaleString()}</p>
                                </div>

                                {/* Content */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-lg">세전 월급</span>
                                        <span className="font-bold text-lg">{receiptData.preTax.toLocaleString()}</span>
                                    </div>

                                    <div className="border-t border-dashed border-zinc-300 my-4" />

                                    <div className="space-y-2 text-zinc-600">
                                        <div className="flex justify-between">
                                            <span>국민연금 (4.5%)</span>
                                            <span>-{receiptData.pension.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>건강보험 (3.545%)</span>
                                            <span>-{receiptData.health.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>장기요양 (12.95%)</span>
                                            <span>-{receiptData.care.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>고용보험 (0.9%)</span>
                                            <span>-{receiptData.employment.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>근로소득세 (간이)</span>
                                            <span>-{receiptData.incomeTax.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>지방소득세 (10%)</span>
                                            <span>-{receiptData.localIncomeTax.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="border-t-2 border-zinc-900 my-4" />

                                    <div className="flex justify-between items-end text-xl font-black">
                                        <span>실수령액</span>
                                        <span>{receiptData.monthlyNet.toLocaleString()} 원</span>
                                    </div>

                                    <div className="mt-2 text-right text-xs text-zinc-400">
                                        * 비과세 식대 20만원 포함 가정
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-12 text-center space-y-4">
                                    <div className="w-full h-12 bg-zinc-900 flex items-center justify-center text-white font-mono text-xs tracking-widest">
                                        ||| || ||| || |||| |||
                                    </div>
                                    <p className="text-xs text-zinc-400">
                                        Thank you for working hard!
                                        <br />
                                        www.moneysalary.com
                                    </p>
                                </div>
                            </div>

                            {/* Jagged Bottom */}
                            <div className="absolute bottom-0 left-0 w-full h-4 bg-zinc-100 dark:bg-zinc-900 z-10"
                                style={{
                                    clipPath: "polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)"
                                }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 mt-8">
                            <button
                                onClick={handleReset}
                                className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-lg hover:scale-110 transition-transform text-zinc-600 dark:text-zinc-300"
                                title="다시 하기"
                            >
                                <RefreshCw className="w-6 h-6" />
                            </button>
                            {/* Note: Real share/download would require html2canvas */}
                            <button
                                className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
                                title="공유하기 (준비중)"
                            >
                                <Share2 className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ad Unit */}
            <div className="mt-12 w-full max-w-md">
                <AdUnit slotId="7778889990" format="rectangle" label="Receipt Page Ad" />
            </div>
        </main>
    );
}
