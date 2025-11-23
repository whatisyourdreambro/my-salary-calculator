"use client";

import { useState } from "react";
import { Calculator, Dices, RefreshCw } from "lucide-react";
import AdUnit from "@/components/AdUnit";

// --- Percent Calculator ---
export function PercentCalculator() {
    const [val1, setVal1] = useState("");
    const [val2, setVal2] = useState("");
    const [mode, setMode] = useState<"of" | "is">("of"); // of: X% of Y, is: X is what % of Y
    const [result, setResult] = useState<string | null>(null);

    const calculate = () => {
        const v1 = Number(val1);
        const v2 = Number(val2);
        if (!v1 || !v2) return;

        if (mode === "of") {
            // X% of Y = Y * (X/100)
            const res = v2 * (v1 / 100);
            setResult(`${v2}의 ${v1}%는 ${res} 입니다.`);
        } else {
            // X is what % of Y = (X/Y) * 100
            const res = (v1 / v2) * 100;
            setResult(`${v1}은(는) ${v2}의 ${res.toFixed(2)}% 입니다.`);
        }
    };

    return (
        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calculator className="text-indigo-500" /> 퍼센트 계산기
            </h2>
            <div className="space-y-6">
                <div className="flex gap-4 p-1 bg-black rounded-xl border border-zinc-800">
                    <button
                        onClick={() => { setMode("of"); setResult(null); }}
                        className={`flex-1 py-2 rounded-lg font-bold transition-colors ${mode === "of" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white"}`}
                    >
                        비율 계산 (X% of Y)
                    </button>
                    <button
                        onClick={() => { setMode("is"); setResult(null); }}
                        className={`flex-1 py-2 rounded-lg font-bold transition-colors ${mode === "is" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white"}`}
                    >
                        비중 계산 (X is ?% of Y)
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                    {mode === "of" ? (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-zinc-400 mb-2">전체값 (Y)</label>
                                <input type="number" value={val2} onChange={(e) => setVal2(e.target.value)} className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-400 mb-2">비율 (X%)</label>
                                <input type="number" value={val1} onChange={(e) => setVal1(e.target.value)} className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white outline-none" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-zinc-400 mb-2">일부값 (X)</label>
                                <input type="number" value={val1} onChange={(e) => setVal1(e.target.value)} className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-400 mb-2">전체값 (Y)</label>
                                <input type="number" value={val2} onChange={(e) => setVal2(e.target.value)} className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white outline-none" />
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={calculate}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors"
                >
                    계산하기
                </button>
                {result && (
                    <div className="mt-6 p-6 bg-black rounded-xl border border-zinc-800 text-center">
                        <p className="text-xl font-bold text-white">{result}</p>
                    </div>
                )}
            </div>
            <div className="mt-8">
                <AdUnit slotId="7778889999" format="rectangle" label="Percent Ad" />
            </div>
        </div>
    );
}

// --- Number Generator ---
export function NumberGenerator() {
    const [min, setMin] = useState("1");
    const [max, setMax] = useState("45");
    const [count, setCount] = useState("6");
    const [result, setResult] = useState<number[]>([]);

    const generate = () => {
        const mn = Number(min);
        const mx = Number(max);
        const c = Number(count);

        if (mx - mn + 1 < c) {
            alert("범위가 너무 좁습니다.");
            return;
        }

        const nums = new Set<number>();
        while (nums.size < c) {
            nums.add(Math.floor(Math.random() * (mx - mn + 1)) + mn);
        }
        setResult(Array.from(nums).sort((a, b) => a - b));
    };

    return (
        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Dices className="text-pink-500" /> 랜덤 숫자 생성기
            </h2>
            <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">최소값</label>
                        <input type="number" value={min} onChange={(e) => setMin(e.target.value)} className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">최대값</label>
                        <input type="number" value={max} onChange={(e) => setMax(e.target.value)} className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">개수</label>
                        <input type="number" value={count} onChange={(e) => setCount(e.target.value)} className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white outline-none" />
                    </div>
                </div>

                <button
                    onClick={generate}
                    className="w-full py-4 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-500 transition-colors"
                >
                    생성하기
                </button>
                {result.length > 0 && (
                    <div className="mt-6 p-6 bg-black rounded-xl border border-zinc-800 text-center">
                        <div className="flex flex-wrap justify-center gap-3">
                            {result.map((n) => (
                                <div key={n} className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg">
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-8">
                <AdUnit slotId="8889990000" format="rectangle" label="Number Gen Ad" />
            </div>
        </div>
    );
}
