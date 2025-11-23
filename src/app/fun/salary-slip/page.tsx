"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Share2, Printer, RefreshCw, Eye } from "lucide-react";
import AdUnit from "@/components/AdUnit";
import { calculateNetSalary } from "@/lib/calculator";

export default function SalarySlipPage() {
    // Input State
    const [salaryInput, setSalaryInput] = useState("60,000,000");
    const [companyName, setCompanyName] = useState("");
    const [userName, setUserName] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [department, setDepartment] = useState("");
    const [date, setDate] = useState("");

    const [isPrinting, setIsPrinting] = useState(false);
    const [showOfficial, setShowOfficial] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    // Hydration fix for date
    useEffect(() => {
        setDate(new Date().toLocaleDateString());
    }, []);

    // Real-time calculation
    const salary = Number(salaryInput.replace(/[^0-9]/g, ""));
    const receiptData = calculateNetSalary(salary, 0, 1, 0, {
        isSmeYouth: false,
        disabledDependents: 0,
        seniorDependents: 0
    });
    // Add preTax manually since calculateNetSalary doesn't return it
    const fullReceiptData = { ...receiptData, preTax: salary };

    const handlePrint = () => {
        if (salary > 0) {
            setIsPrinting(true);
            // Simulate printing delay
            setTimeout(() => {
                setShowOfficial(true);
                setIsPrinting(false);
            }, 2000);
        }
    };

    const handleReset = () => {
        setShowOfficial(false);
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
        <main className="w-full min-h-screen bg-zinc-950 flex flex-col items-center py-12 px-4 font-sans text-zinc-100">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 shadow-sm border border-zinc-800 text-zinc-400 font-medium text-sm mb-4">
                    <Receipt className="w-4 h-4" />
                    <span>월급 영수증 발급기</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                    내 월급, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">영수증</span>으로 확인하기
                </h1>
                <p className="text-zinc-400 text-lg">
                    회사명, 이름 등을 입력하여 나만의 영수증을 만들어보세요.
                </p>
            </div>

            {/* Ad Unit: Top */}
            <div className="mb-8 w-full max-w-md">
                <AdUnit slotId="7778889990" format="auto" label="Receipt Page Top Ad" />
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Inputs */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-zinc-800 relative z-10"
                >
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                                연봉 (원) *
                            </label>
                            <input
                                type="text"
                                value={salaryInput}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                    setSalaryInput(Number(val).toLocaleString());
                                }}
                                className="w-full p-4 text-2xl font-bold bg-black border border-zinc-800 rounded-xl focus:border-blue-500 outline-none transition-colors text-white placeholder-zinc-700"
                                placeholder="0"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                                    회사명
                                </label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full p-3 text-sm bg-black border border-zinc-800 rounded-xl focus:border-blue-500 outline-none transition-colors text-white placeholder-zinc-700"
                                    placeholder="(주)머니샐러리"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                                    성명
                                </label>
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full p-3 text-sm bg-black border border-zinc-800 rounded-xl focus:border-blue-500 outline-none transition-colors text-white placeholder-zinc-700"
                                    placeholder="홍길동"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                                    사원번호
                                </label>
                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    className="w-full p-3 text-sm bg-black border border-zinc-800 rounded-xl focus:border-blue-500 outline-none transition-colors text-white placeholder-zinc-700"
                                    placeholder="2025001"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                                    부서
                                </label>
                                <input
                                    type="text"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full p-3 text-sm bg-black border border-zinc-800 rounded-xl focus:border-blue-500 outline-none transition-colors text-white placeholder-zinc-700"
                                    placeholder="경영지원팀"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                                지급일자
                            </label>
                            <input
                                type="text"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-3 text-sm bg-black border border-zinc-800 rounded-xl focus:border-blue-500 outline-none transition-colors text-white placeholder-zinc-700"
                                placeholder="2025. 11. 25"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handlePrint}
                        disabled={isPrinting || !salaryInput || showOfficial}
                        className="w-full mt-8 py-4 bg-white text-black font-bold text-lg rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-white/10"
                    >
                        {isPrinting ? (
                            <>
                                <Printer className="w-6 h-6 animate-pulse" />
                                영수증 출력 중...
                            </>
                        ) : showOfficial ? (
                            <>
                                <Receipt className="w-6 h-6" />
                                발급 완료
                            </>
                        ) : (
                            <>
                                <Receipt className="w-6 h-6" />
                                영수증 발급받기
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Right Column: Preview/Result */}
                <div className="flex flex-col items-center justify-start min-h-[700px] relative perspective-1000">
                    {/* Printer Slot Effect */}
                    <div className="absolute top-0 w-[380px] h-4 bg-zinc-800 rounded-full shadow-inner z-30 border border-zinc-700" />

                    <AnimatePresence>
                        <motion.div
                            initial={{ y: -300, opacity: 0 }}
                            animate={{
                                y: showOfficial ? 0 : isPrinting ? [-300, 0] : -20,
                                opacity: 1,
                                transition: {
                                    y: { duration: isPrinting ? 2 : 0.5, ease: "linear" }
                                }
                            }}
                            className={`relative transition-all duration-500 ${!showOfficial && !isPrinting ? 'opacity-70 scale-95 blur-[1px]' : 'opacity-100 scale-100'}`}
                        >
                            {/* Receipt Paper */}
                            <div
                                ref={receiptRef}
                                className="w-[360px] sm:w-[380px] bg-[#fffdf5] text-zinc-900 shadow-2xl relative overflow-hidden font-mono text-sm leading-relaxed transform-gpu origin-top"
                                style={{
                                    // Thermal Paper Texture
                                    backgroundImage: `
                                        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E"),
                                        linear-gradient(to bottom, #fffdf5, #f0f0e0)
                                    `,
                                    boxShadow: "0 1px 1px rgba(0,0,0,0.1), 0 2px 2px rgba(0,0,0,0.1), 0 4px 4px rgba(0,0,0,0.1), 0 8px 8px rgba(0,0,0,0.1), 0 16px 16px rgba(0,0,0,0.1)"
                                }}
                            >
                                {/* Jagged Top */}
                                <div className="absolute top-0 left-0 w-full h-3 bg-zinc-950 z-10"
                                    style={{
                                        clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)"
                                    }}
                                />

                                <div className="p-8 pt-12 relative">
                                    {/* Stamp Effect */}
                                    <AnimatePresence>
                                        {showOfficial && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 2, rotate: -30 }}
                                                animate={{ opacity: 0.8, scale: 1, rotate: -15 }}
                                                transition={{ type: "spring", bounce: 0.5, delay: 0.5 }}
                                                className="absolute top-20 right-8 w-24 h-24 border-4 border-red-600 rounded-full flex items-center justify-center text-red-600 font-black text-xl rotate-[-15deg] opacity-80 z-0 pointer-events-none mix-blend-multiply"
                                                style={{ maskImage: "url(https://grainy-gradients.vercel.app/noise.svg)" }} // Rough stamp look
                                            >
                                                <div className="text-center leading-none">
                                                    PAID<br />
                                                    <span className="text-xs">APPROVED</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Header */}
                                    <div className="text-center border-b-2 border-dashed border-zinc-400 pb-6 mb-6 relative z-10">
                                        <h2 className="text-2xl font-black tracking-tighter mb-1 uppercase">
                                            {companyName ? companyName : "MONEY SALARY"}
                                        </h2>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Official Salary Receipt</p>
                                        <div className="flex justify-between text-[10px] text-zinc-400 mt-4 font-mono">
                                            <span>DATE: {date}</span>
                                            <span>TIME: {new Date().toLocaleTimeString()}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                                            <span>TERM: #0025</span>
                                            <span>AUTH: {Math.floor(Math.random() * 999999)}</span>
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 mb-6 border-b border-dashed border-zinc-400 pb-4 font-mono">
                                        <div>NAME : <span className="text-zinc-900 font-bold">{userName || "-"}</span></div>
                                        <div>ID NO: <span className="text-zinc-900 font-bold">{employeeId || "-"}</span></div>
                                        <div className="col-span-2">DEPT : <span className="text-zinc-900 font-bold">{department || "-"}</span></div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-3 relative z-10 font-mono text-sm">
                                        <div className="flex justify-between items-end">
                                            <span className="font-bold">GROSS PAY</span>
                                            <span className="font-bold text-lg">{Math.floor(fullReceiptData.preTax / 12).toLocaleString()}</span>
                                        </div>

                                        <div className="border-t border-dashed border-zinc-300 my-2" />

                                        <div className="space-y-1 text-zinc-600 text-xs">
                                            <div className="flex justify-between">
                                                <span>NATIONAL PENSION</span>
                                                <span>-{fullReceiptData.pension.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>HEALTH INS</span>
                                                <span>-{fullReceiptData.health.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>LONG-TERM CARE</span>
                                                <span>-{fullReceiptData.longTermCare.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>EMPLOYMENT INS</span>
                                                <span>-{fullReceiptData.employment.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>INCOME TAX</span>
                                                <span>-{fullReceiptData.incomeTax.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>LOCAL TAX</span>
                                                <span>-{fullReceiptData.localTax.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="border-t-4 border-double border-zinc-900 my-4" />

                                        <div className="flex justify-between items-end text-xl font-black">
                                            <span>NET PAY</span>
                                            <span className="bg-black text-white px-2 py-1 transform -rotate-1">
                                                ₩{fullReceiptData.monthlyNet.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="mt-2 text-right text-[10px] text-zinc-400">
                                            * INCLUDES NON-TAXABLE MEAL ALLOWANCE
                                        </div>
                                    </div>

                                    {/* Footer with Seal */}
                                    <div className="mt-8 text-center relative z-10">
                                        <div className="relative inline-block py-4 px-8">
                                            <p className="text-sm font-black text-zinc-900 relative z-10 uppercase">
                                                (SIGNED) {companyName || "MONEYSALARY"} CEO
                                            </p>

                                            {/* Official Seal (Red Stamp) */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border-2 border-red-600 rounded-sm flex items-center justify-center opacity-70 mix-blend-multiply rotate-3 z-0">
                                                <div className="w-12 h-12 border border-red-600 rounded-sm flex items-center justify-center">
                                                    <span className="text-red-600 font-serif font-bold text-[10px] writing-vertical-rl">
                                                        OFFICIAL<br />SEAL
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Barcode */}
                                        <div className="mt-6 flex flex-col items-center">
                                            <div className="h-12 w-full max-w-[200px] bg-zinc-900"
                                                style={{
                                                    maskImage: "repeating-linear-gradient(90deg, black, black 2px, transparent 2px, transparent 4px)"
                                                }}
                                            />
                                            <p className="text-[10px] font-mono mt-1 tracking-widest">
                                                {Math.random().toString().slice(2, 14)}
                                            </p>
                                        </div>

                                        <p className="text-[10px] text-zinc-400 mt-4">
                                            www.moneysalary.com
                                        </p>
                                        <p className="text-[8px] text-zinc-300 mt-1 opacity-50">
                                            * FOR ENTERTAINMENT PURPOSES ONLY
                                        </p>
                                    </div>
                                </div>

                                {/* Jagged Bottom */}
                                <div className="absolute bottom-0 left-0 w-full h-3 bg-zinc-950 z-10"
                                    style={{
                                        clipPath: "polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)"
                                    }}
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Action Buttons */}
                    {showOfficial && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center gap-4 mt-8"
                        >
                            <button
                                onClick={handleReset}
                                className="p-4 bg-zinc-800 rounded-full shadow-lg hover:scale-110 transition-transform text-zinc-300"
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
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Ad Unit: Bottom */}
            <div className="mt-12 w-full max-w-md">
                <AdUnit slotId="7778889990" format="auto" label="Receipt Page Bottom Ad" />
            </div>
        </main>
    );
}
