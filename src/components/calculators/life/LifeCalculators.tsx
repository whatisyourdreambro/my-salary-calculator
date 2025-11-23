"use client";

import { useState } from "react";
import { Users, Fuel, Ruler, ArrowRight, RefreshCw } from "lucide-react";
import AdUnit from "@/components/AdUnit";

// --- Dutch Pay Calculator ---
export function DutchPayCalculator() {
    const [amount, setAmount] = useState("");
    const [people, setPeople] = useState("");
    const [result, setResult] = useState<number | null>(null);

    const calculate = () => {
        const total = Number(amount.replace(/[^0-9]/g, ""));
        const count = Number(people);
        if (total > 0 && count > 0) {
            setResult(Math.ceil(total / count / 10) * 10); // Round up to nearest 10 won
        }
    };

    return (
        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="text-purple-500" /> N빵 (더치페이) 계산기
            </h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">총 금액 (원)</label>
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value.replace(/[^0-9]/g, "")).toLocaleString())}
                        className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white focus:border-purple-500 outline-none"
                        placeholder="0"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">인원 수 (명)</label>
                    <input
                        type="number"
                        value={people}
                        onChange={(e) => setPeople(e.target.value)}
                        className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white focus:border-purple-500 outline-none"
                        placeholder="0"
                    />
                </div>
                <button
                    onClick={calculate}
                    className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors"
                >
                    계산하기
                </button>
                {result !== null && (
                    <div className="mt-6 p-6 bg-black rounded-xl border border-zinc-800 text-center">
                        <p className="text-zinc-400 mb-2">1인당 부담금 (10원 단위 올림)</p>
                        <p className="text-5xl font-black text-purple-500">{result.toLocaleString()}원</p>
                    </div>
                )}
            </div>
            <div className="mt-8">
                <AdUnit slotId="4445556666" format="rectangle" label="Dutch Pay Ad" />
            </div>
        </div>
    );
}

// --- Fuel Cost Calculator ---
export function FuelCostCalculator() {
    const [distance, setDistance] = useState("");
    const [efficiency, setEfficiency] = useState("");
    const [price, setPrice] = useState("");
    const [result, setResult] = useState<number | null>(null);

    const calculate = () => {
        const d = Number(distance);
        const e = Number(efficiency);
        const p = Number(price);
        if (d > 0 && e > 0 && p > 0) {
            setResult(Math.round((d / e) * p));
        }
    };

    return (
        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Fuel className="text-orange-500" /> 유류비 계산기
            </h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">이동 거리 (km)</label>
                    <input
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white focus:border-orange-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">연비 (km/L)</label>
                    <input
                        type="number"
                        value={efficiency}
                        onChange={(e) => setEfficiency(e.target.value)}
                        className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white focus:border-orange-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">리터당 가격 (원)</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white focus:border-orange-500 outline-none"
                    />
                </div>
                <button
                    onClick={calculate}
                    className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-500 transition-colors"
                >
                    계산하기
                </button>
                {result !== null && (
                    <div className="mt-6 p-6 bg-black rounded-xl border border-zinc-800 text-center">
                        <p className="text-zinc-400 mb-2">예상 유류비</p>
                        <p className="text-5xl font-black text-orange-500">{result.toLocaleString()}원</p>
                    </div>
                )}
            </div>
            <div className="mt-8">
                <AdUnit slotId="5556667777" format="rectangle" label="Fuel Cost Ad" />
            </div>
        </div>
    );
}

// --- Unit Converter ---
export function UnitConverter() {
    const [value, setValue] = useState("");
    const [type, setType] = useState<"length" | "weight">("length");
    const [result, setResult] = useState<string | null>(null);

    const calculate = () => {
        const val = Number(value);
        if (!val) return;

        if (type === "length") {
            // cm -> inch, feet
            const inch = val * 0.393701;
            const feet = val * 0.0328084;
            setResult(`${inch.toFixed(2)} inch / ${feet.toFixed(2)} feet`);
        } else {
            // kg -> lb
            const lb = val * 2.20462;
            setResult(`${lb.toFixed(2)} lb`);
        }
    };

    return (
        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Ruler className="text-cyan-500" /> 단위 변환기
            </h2>
            <div className="space-y-6">
                <div className="flex gap-4 p-1 bg-black rounded-xl border border-zinc-800">
                    <button
                        onClick={() => { setType("length"); setResult(null); }}
                        className={`flex-1 py-2 rounded-lg font-bold transition-colors ${type === "length" ? "bg-cyan-600 text-white" : "text-zinc-500 hover:text-white"}`}
                    >
                        길이 (cm)
                    </button>
                    <button
                        onClick={() => { setType("weight"); setResult(null); }}
                        className={`flex-1 py-2 rounded-lg font-bold transition-colors ${type === "weight" ? "bg-cyan-600 text-white" : "text-zinc-500 hover:text-white"}`}
                    >
                        무게 (kg)
                    </button>
                </div>
                <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">
                        {type === "length" ? "센티미터 (cm)" : "킬로그램 (kg)"}
                    </label>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white focus:border-cyan-500 outline-none"
                    />
                </div>
                <button
                    onClick={calculate}
                    className="w-full py-4 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 transition-colors"
                >
                    변환하기
                </button>
                {result && (
                    <div className="mt-6 p-6 bg-black rounded-xl border border-zinc-800 text-center">
                        <p className="text-zinc-400 mb-2">변환 결과</p>
                        <p className="text-3xl font-black text-cyan-500">{result}</p>
                    </div>
                )}
            </div>
            <div className="mt-8">
                <AdUnit slotId="6667778888" format="rectangle" label="Unit Converter Ad" />
            </div>
        </div>
    );
}
