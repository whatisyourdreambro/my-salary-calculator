"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Briefcase, Calculator, RefreshCw, CheckCircle2 } from "lucide-react";
import AdUnit from "@/components/AdUnit";

// --- D-Day Calculator ---
export function DDayCalculator() {
    const [targetDate, setTargetDate] = useState("");
    const [result, setResult] = useState<string | null>(null);

    const calculate = () => {
        if (!targetDate) return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(targetDate);
        target.setHours(0, 0, 0, 0);

        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) setResult("D-Day");
        else if (diffDays > 0) setResult(`D-${diffDays}`);
        else setResult(`D+${Math.abs(diffDays)}`);
    };

    return (
        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="text-rose-500" /> D-Day 계산기
            </h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">목표 날짜</label>
                    <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white focus:border-rose-500 outline-none"
                    />
                </div>
                <button
                    onClick={calculate}
                    className="w-full py-4 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition-colors"
                >
                    계산하기
                </button>
                {result && (
                    <div className="mt-6 p-6 bg-black rounded-xl border border-zinc-800 text-center">
                        <p className="text-zinc-400 mb-2">결과</p>
                        <p className="text-5xl font-black text-rose-500">{result}</p>
                    </div>
                )}
            </div>
            <div className="mt-8">
                <AdUnit slotId="1112223333" format="rectangle" label="D-Day Ad" />
            </div>
        </div>
    );
}

// --- Age Calculator ---
export function AgeCalculator() {
    const [birthDate, setBirthDate] = useState("");
    const [result, setResult] = useState<{ intl: number; korean: number } | null>(null);

    const calculate = () => {
        if (!birthDate) return;
        const today = new Date();
        const birth = new Date(birthDate);

        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        // Korean Age (Traditional: Year - Year + 1) - Note: Korea officially adopted international age, but people still check 'Man-nai'
        // Actually, let's show 'Man-nai' (International) and 'Yeon-nai' (Year Age)
        const yearAge = today.getFullYear() - birth.getFullYear();

        setResult({ intl: age, korean: yearAge });
    };

    return (
        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="text-blue-500" /> 만 나이 계산기
            </h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">생년월일</label>
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white focus:border-blue-500 outline-none"
                    />
                </div>
                <button
                    onClick={calculate}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors"
                >
                    계산하기
                </button>
                {result && (
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="p-6 bg-black rounded-xl border border-zinc-800 text-center">
                            <p className="text-zinc-400 mb-2">만 나이</p>
                            <p className="text-4xl font-black text-blue-500">{result.intl}세</p>
                        </div>
                        <div className="p-6 bg-black rounded-xl border border-zinc-800 text-center">
                            <p className="text-zinc-400 mb-2">연 나이</p>
                            <p className="text-4xl font-black text-zinc-300">{result.korean}세</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-8">
                <AdUnit slotId="2223334444" format="rectangle" label="Age Ad" />
            </div>
        </div>
    );
}

// --- Work Day Calculator ---
export function WorkDayCalculator() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [result, setResult] = useState<number | null>(null);

    const calculate = () => {
        if (!startDate || !endDate) return;
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Ensure start <= end
        if (start > end) {
            alert("종료일이 시작일보다 빨라야 합니다.");
            return;
        }

        let count = 0;
        let cur = new Date(start);
        while (cur <= end) {
            const dayOfWeek = cur.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0=Sun, 6=Sat
                count++;
            }
            cur.setDate(cur.getDate() + 1);
        }
        setResult(count);
    };

    return (
        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Briefcase className="text-green-500" /> 영업일(평일) 계산기
            </h2>
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">시작일</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white focus:border-green-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">종료일</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white focus:border-green-500 outline-none"
                        />
                    </div>
                </div>
                <button
                    onClick={calculate}
                    className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 transition-colors"
                >
                    계산하기
                </button>
                {result !== null && (
                    <div className="mt-6 p-6 bg-black rounded-xl border border-zinc-800 text-center">
                        <p className="text-zinc-400 mb-2">주말 제외 영업일수</p>
                        <p className="text-5xl font-black text-green-500">{result}일</p>
                    </div>
                )}
            </div>
            <div className="mt-8">
                <AdUnit slotId="3334445555" format="rectangle" label="Work Day Ad" />
            </div>
        </div>
    );
}
