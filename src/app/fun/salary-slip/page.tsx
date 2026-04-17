"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Share2, Printer, RefreshCw, Eye } from "lucide-react";
import AdUnit from "@/components/AdUnit";
import { calculateNetSalary } from "@/lib/calculator";

export default function SalarySlipPage() {
    const [salaryInput, setSalaryInput] = useState("60,000,000");
    const [companyName, setCompanyName] = useState("");
    const [userName, setUserName] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [department, setDepartment] = useState("");
    const [date, setDate] = useState("");
    const [isPrinting, setIsPrinting] = useState(false);
    const [showOfficial, setShowOfficial] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setDate(new Date().toLocaleDateString());
    }, []);

    const salary = Number(salaryInput.replace(/[^0-9]/g, ""));
    const receiptData = calculateNetSalary(salary, 0, 1, 0, {
        isSmeYouth: false,
        disabledDependents: 0,
        seniorDependents: 0
    });
    const fullReceiptData = { ...receiptData, preTax: salary };

    const handlePrint = () => {
        if (salary > 0) {
            setIsPrinting(true);
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
                title: "가상 급여명세서",
                text: `연봉 ${salaryInput}원의 가상 급여명세서! #Moneysalary #급여명세서`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert("링크가 클립보드에 복사되었습니다.");
            });
        }
    };

    const monthly = Math.round(salary / 12);
    const netMonthly = Math.round((receiptData.monthlyNet || salary * 0.75) / 12);

    return (
        <main className="w-full min-h-screen bg-slate-50 dark:bg-[#191F28] pt-28 px-4 pb-20 font-sans">
            {/* Hero */}
            <div className="text-center mb-10 max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 mb-5">
                    <Receipt className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-900 mb-3">
                    가상 <span className="text-blue-600">급여명세서</span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                    연봉을 입력하면 실제 급여명세서 형태로 계산해드립니다.
                </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* Ad Top */}
                <AdUnit slotId="1122334455" format="auto" label="Salary Slip Top Ad" />

                {/* Input Card */}
                <AnimatePresence mode="wait">
                    {!showOfficial ? (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="toss-card p-8 space-y-5"
                        >
                            <h2 className="text-xl font-black text-slate-900 dark:text-slate-900 mb-2">
                                정보 입력
                            </h2>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-500">연봉 (세전)</label>
                                <input
                                    type="text"
                                    value={salaryInput}
                                    onChange={(e) => {
                                        const num = e.target.value.replace(/[^0-9]/g, "");
                                        setSalaryInput(Number(num).toLocaleString('ko-KR'));
                                    }}
                                    className="toss-input"
                                    placeholder="60,000,000"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500">회사명 (선택)</label>
                                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="toss-input text-base py-3" placeholder="(주)머니샐러리" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500">성명 (선택)</label>
                                    <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="toss-input text-base py-3" placeholder="홍길동" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500">사번 (선택)</label>
                                    <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="toss-input text-base py-3" placeholder="2024001" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500">부서 (선택)</label>
                                    <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="toss-input text-base py-3" placeholder="개발팀" />
                                </div>
                            </div>

                            <button
                                onClick={handlePrint}
                                disabled={salary === 0 || isPrinting}
                                className="toss-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPrinting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        생성 중...
                                    </>
                                ) : (
                                    <>
                                        <Printer className="w-5 h-5" />
                                        급여명세서 생성하기
                                    </>
                                )}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            ref={receiptRef}
                        >
                            {/* Official Receipt */}
                            <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                                {/* Header */}
                                <div className="bg-blue-600 text-white p-6 text-center">
                                    <p className="text-sm font-bold opacity-80 mb-1">SALARY STATEMENT</p>
                                    <h2 className="text-2xl font-black">급여명세서</h2>
                                    <p className="text-sm opacity-80 mt-1">{date}</p>
                                </div>

                                {/* Info */}
                                <div className="p-6 grid grid-cols-2 gap-4 border-b border-slate-100">
                                    <div><p className="text-xs text-slate-400 font-bold">회사명</p><p className="font-bold text-slate-800">{companyName || "(주)머니샐러리"}</p></div>
                                    <div><p className="text-xs text-slate-400 font-bold">성명</p><p className="font-bold text-slate-800">{userName || "홍길동"}</p></div>
                                    <div><p className="text-xs text-slate-400 font-bold">사번</p><p className="font-bold text-slate-800">{employeeId || "2024001"}</p></div>
                                    <div><p className="text-xs text-slate-400 font-bold">부서</p><p className="font-bold text-slate-800">{department || "개발팀"}</p></div>
                                </div>

                                {/* Amounts */}
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 font-medium">기본급 (세전)</span>
                                        <span className="font-bold text-slate-900">{monthly.toLocaleString('ko-KR')}원</span>
                                    </div>
                                    <div className="flex justify-between items-center text-primary">
                                        <span className="font-medium">총 공제액</span>
                                        <span className="font-bold">-{(monthly - netMonthly).toLocaleString('ko-KR')}원</span>
                                    </div>
                                    <div className="h-px bg-slate-200" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-black text-slate-900">실수령액</span>
                                        <span className="text-2xl font-black text-blue-600">{netMonthly.toLocaleString('ko-KR')}원</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 text-center text-xs text-slate-400 border-t border-slate-100">
                                    이 명세서는 MoneySalary에서 자동 생성된 가상 문서입니다.
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button onClick={handleReset} className="toss-button-secondary flex-1"><RefreshCw size={18} /> 다시 만들기</button>
                                <button onClick={handleShare} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[16px] font-bold transition-colors flex items-center justify-center gap-2"><Share2 size={18} /> 공유하기</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Ad Bottom */}
                <AdUnit slotId="9988776655" format="auto" label="Salary Slip Bottom Ad" />
            </div>
        </main>
    );
}