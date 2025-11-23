"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Share2, Printer, RefreshCw } from "lucide-react";
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
    // Input State
    const [salaryInput, setSalaryInput] = useState("60,000,000");
    const [companyName, setCompanyName] = useState("");
    const [userName, setUserName] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [department, setDepartment] = useState("");
    const [date, setDate] = useState(new Date().toLocaleDateString());

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
            }, 2000);
        }
    };

    const handleReset = () => {
        setReceiptData(null);
        setSalaryInput("");
        setCompanyName("");
        setUserName("");
        setEmployeeId("");
        setDepartment("");
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: '내 월급 영수증',
                text: `연봉 ${salaryInput}원의 실수령액은 얼마일까요? #Moneysalary #월급영수증`,
                url: window.location.href,
            });
        } else {
            alert("공유하기 기능이 지원되지 않는 브라우저입니다.");
        }
    };

    return (
        <main className="w-full min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center py-12 px-4 font-sans">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium text-sm mb-4">
                    <Receipt className="w-4 h-4" />
                    <span>월급 영수증 발급기</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">
                    내 월급, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">영수증</span>으로 확인하기
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                    회사명, 이름 등을 입력하여 나만의 영수증을 만들어보세요.
                </p>
            </div>

            {/* Ad Unit: Top */}
            <div className="mb-8 w-full max-w-md">
                <AdUnit slotId="7778889990" format="auto" label="Receipt Page Top Ad" />
            </div>

            {/* Input Section */}
            <AnimatePresence mode="wait">
                {!receiptData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800 relative z-10"
                    >
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                                    연봉 (원) *
                                </label>
                                <input
                                    type="text"
                                    value={salaryInput}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                        setSalaryInput(Number(val).toLocaleString());
                                    }}
                                    className="w-full p-3 text-xl font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-blue-500 outline-none transition-colors"
                                    placeholder="0"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                                        회사명
                                    </label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full p-3 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-blue-500 outline-none transition-colors"
                                        placeholder="(주)머니샐러리"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                                        성명
                                    </label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="w-full p-3 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-blue-500 outline-none transition-colors"
                                        placeholder="홍길동"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                                        사원번호
                                    </label>
                                    <input
                                        type="text"
                                        value={employeeId}
                                        onChange={(e) => setEmployeeId(e.target.value)}
                                        className="w-full p-3 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-blue-500 outline-none transition-colors"
                                        placeholder="2025001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                                        부서
                                    </label>
                                    <input
                                        type="text"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full p-3 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-blue-500 outline-none transition-colors"
                                        placeholder="경영지원팀"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                                    지급일자
                                </label>
                                <input
                                    type="text"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full p-3 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-blue-500 outline-none transition-colors"
                                    placeholder="2025. 11. 25"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handlePrint}
                            disabled={isPrinting || !salaryInput}
                            className="w-full mt-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-lg rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                        >
                            {isPrinting ? (
                                <>
                                    <Printer className="w-6 h-6 animate-pulse" />
                                    영수증 출력 중...
                                </>
                            ) : (
                                <>
                                    <Receipt className="w-6 h-6" />
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
                        initial={{ y: -100, opacity: 0, rotateX: -15 }}
                        animate={{ y: 0, opacity: 1, rotateX: 0 }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
                        className="relative mt-8 perspective-1000"
                    >
                        {/* Receipt Paper */}
                        <div
                            ref={receiptRef}
                            className="w-[360px] sm:w-[400px] bg-[#fffdf5] text-zinc-900 shadow-2xl relative overflow-hidden font-mono text-sm leading-relaxed transform-gpu origin-top"
                            style={{
                                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4d4d4' fill-opacity='0.1'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' /%3E%3C/g%3E%3C/svg%3E\")",
                                boxShadow: "0 1px 1px rgba(0,0,0,0.1), 0 2px 2px rgba(0,0,0,0.1), 0 4px 4px rgba(0,0,0,0.1), 0 8px 8px rgba(0,0,0,0.1), 0 16px 16px rgba(0,0,0,0.1)"
                            }}
                        >
                            {/* Jagged Top */}
                            <div className="absolute top-0 left-0 w-full h-3 bg-zinc-100 dark:bg-zinc-950 z-10"
                                style={{
                                    clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)"
                                }}
                            />

                            <div className="p-8 pt-12 relative">
                                {/* Stamp Effect */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 2, rotate: -30 }}
                                    animate={{ opacity: 0.8, scale: 1, rotate: -15 }}
                                    transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                                    className="absolute top-16 right-8 w-24 h-24 border-4 border-red-600 rounded-full flex items-center justify-center text-red-600 font-black text-xl rotate-[-15deg] opacity-80 z-0 pointer-events-none mix-blend-multiply"
                                >
                                    <div className="text-center leading-none">
                                        PAID<br />
                                        <span className="text-xs">APPROVED</span>
                                    </div>
                                </motion.div>

                                {/* Header */}
                                <div className="text-center border-b-2 border-dashed border-zinc-300 pb-6 mb-6 relative z-10">
                                    <h2 className="text-2xl font-black tracking-tighter mb-1">
                                        {companyName ? companyName : "MONEY SALARY"}
                                    </h2>
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Official Salary Receipt</p>
                                    <p className="text-xs text-zinc-400 mt-2">{date}</p>
                                </div>

                                {/* User Info */}
                                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 mb-6 border-b border-dashed border-zinc-300 pb-4">
                                    <div>성명: <span className="text-zinc-900 font-bold">{userName || "-"}</span></div>
                                    <div>사원번호: <span className="text-zinc-900 font-bold">{employeeId || "-"}</span></div>
                                    <div className="col-span-2">부서: <span className="text-zinc-900 font-bold">{department || "-"}</span></div>
                                </div>

                                {/* Content */}
                                <div className="space-y-4 relative z-10">
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
                                        <span className="bg-yellow-200 px-1">{receiptData.monthlyNet.toLocaleString()} 원</span>
                                    </div>

                                    <div className="mt-2 text-right text-xs text-zinc-400">
                                        * 비과세 식대 20만원 포함 가정
                                    </div>
                                </div>

                                {/* Footer with Seal */}
                                <div className="mt-12 text-center relative z-10">
                                    <p className="text-sm font-bold text-zinc-800 mb-8">
                                        위와 같이 급여를 정히 영수함.
                                    </p>

                                    <div className="relative inline-block py-4 px-8">
                                        <p className="text-lg font-black text-zinc-900 relative z-10">
                                            (주) {companyName || "머니샐러리"} 대표이사
                                        </p>

                                        {/* Official Seal (Red Stamp) */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-4 border-red-600 rounded-lg flex items-center justify-center opacity-80 mix-blend-multiply rotate-3 z-0">
                                            <div className="w-14 h-14 border border-red-600 rounded flex items-center justify-center">
                                                <span className="text-red-600 font-serif font-bold text-xs writing-vertical-rl">
                                                    {companyName ? companyName.slice(0, 4) : "머니샐러리"}
                                                    <br />
                                                    직인
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-zinc-400 mt-8">
                                        www.moneysalary.com
                                    </p>
                                </div>
                            </div>

                            {/* Jagged Bottom */}
                            <div className="absolute bottom-0 left-0 w-full h-3 bg-zinc-100 dark:bg-zinc-950 z-10"
                                style={{
                                    clipPath: "polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)"
                                }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 mt-8">
                            <button
                                onClick={handleReset}
                                className="p-4 bg-white dark:bg-zinc-800 rounded-full shadow-lg hover:scale-110 transition-transform text-zinc-600 dark:text-zinc-300"
                                title="다시 하기"
                            >
                                <RefreshCw className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform shadow-blue-600/30"
                                title="공유하기"
                            >
                                <Share2 className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ad Unit: Bottom */}
            <div className="mt-12 w-full max-w-md">
                <AdUnit slotId="7778889990" format="auto" label="Receipt Page Bottom Ad" />
            </div>
        </main>
    );
}
