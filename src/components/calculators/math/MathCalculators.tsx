"use client";

import { useId, useState } from "react";
import { Calculator, Dices } from "lucide-react";
import NumberInput from "@/components/NumberInput";
// --- Percent Calculator ---
export function PercentCalculator() {
 const inputId = useId();
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
 // 표시용 반올림 — 종전에는 부동소수점 원본을 그대로 출력해
 // "3000의 7%는 210.00000000000003" 같은 결과가 나왔다.
 const res = Math.round(v2 * (v1 / 100) * 100) / 100;
 setResult(
 `${v2.toLocaleString("ko-KR")}의 ${v1}%는 ${res.toLocaleString("ko-KR", {
 maximumFractionDigits: 2,
 })} 입니다.`
 );
 } else {
 // X is what % of Y = (X/Y) * 100
 const res = (v1 / v2) * 100;
 setResult(`${v1}은(는) ${v2}의 ${res.toFixed(2)}% 입니다.`);
 }
 };

 return (
 <div className="bg-white rounded-3xl p-8 border border-canvas shadow-xl">
 <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
 <Calculator className="text-electric" /> 퍼센트 계산기
 </h2>
 <div className="space-y-6">
 <div className="flex gap-4 p-1 bg-electric rounded-xl border border-canvas">
 <button
 onClick={() => { setMode("of"); setResult(null); }}
 className={`flex-1 py-2 rounded-lg font-bold transition-colors ${mode === "of" ? "bg-primary text-white" : "text-faint-blue hover:text-white"}`}
 >
 비율 계산 (X% of Y)
 </button>
 <button
 onClick={() => { setMode("is"); setResult(null); }}
 className={`flex-1 py-2 rounded-lg font-bold transition-colors ${mode === "is" ? "bg-primary text-white" : "text-faint-blue hover:text-white"}`}
 >
 비중 계산 (X is ?% of Y)
 </button>
 </div>

 <div className="grid grid-cols-2 gap-4 items-center">
 {mode === "of" ? (
 <>
 <div>
 <label htmlFor={`${inputId}-whole`} className="block text-sm font-bold text-muted-blue mb-2">전체값 (Y)</label>
 <NumberInput id={`${inputId}-whole`} type="number" inputMode="numeric" value={val2} onChange={(e) => setVal2(e.target.value)} className="w-full p-4 bg-electric border border-canvas rounded-xl text-white outline-none" />
 </div>
 <div>
 <label htmlFor={`${inputId}-part`} className="block text-sm font-bold text-muted-blue mb-2">비율 (X%)</label>
 <NumberInput id={`${inputId}-part`} type="number" inputMode="numeric" value={val1} onChange={(e) => setVal1(e.target.value)} className="w-full p-4 bg-electric border border-canvas rounded-xl text-white outline-none" />
 </div>
 </>
 ) : (
 <>
 <div>
 <label htmlFor={`${inputId}-part`} className="block text-sm font-bold text-muted-blue mb-2">일부값 (X)</label>
 <NumberInput id={`${inputId}-part`} type="number" inputMode="numeric" value={val1} onChange={(e) => setVal1(e.target.value)} className="w-full p-4 bg-electric border border-canvas rounded-xl text-white outline-none" />
 </div>
 <div>
 <label htmlFor={`${inputId}-whole`} className="block text-sm font-bold text-muted-blue mb-2">전체값 (Y)</label>
 <NumberInput id={`${inputId}-whole`} type="number" inputMode="numeric" value={val2} onChange={(e) => setVal2(e.target.value)} className="w-full p-4 bg-electric border border-canvas rounded-xl text-white outline-none" />
 </div>
 </>
 )}
 </div>

 <button
 onClick={calculate}
 className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/100 transition-colors"
 >
 계산하기
 </button>
 {result && (
 <div className="mt-6 p-6 bg-electric rounded-xl border border-canvas text-center">
 <p className="text-xl font-bold text-navy">{result}</p>
 </div>
 )}
 </div>
 <div className="mt-8">
 </div>
 </div>
 );
}

// --- Number Generator ---
export function NumberGenerator() {
 const inputId = useId();
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
 <div className="bg-white rounded-3xl p-8 border border-canvas shadow-xl">
 <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
 <Dices className="text-primary" /> 랜덤 숫자 생성기
 </h2>
 <div className="space-y-6">
 <div className="grid grid-cols-3 gap-4">
 <div>
 <label htmlFor={`${inputId}-min`} className="block text-sm font-bold text-muted-blue mb-2">최소값</label>
 <NumberInput id={`${inputId}-min`} type="number" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} className="w-full p-4 bg-electric border border-canvas rounded-xl text-white outline-none" />
 </div>
 <div>
 <label htmlFor={`${inputId}-max`} className="block text-sm font-bold text-muted-blue mb-2">최대값</label>
 <NumberInput id={`${inputId}-max`} type="number" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} className="w-full p-4 bg-electric border border-canvas rounded-xl text-white outline-none" />
 </div>
 <div>
 <label htmlFor={`${inputId}-count`} className="block text-sm font-bold text-muted-blue mb-2">개수</label>
 <NumberInput id={`${inputId}-count`} type="number" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} className="w-full p-4 bg-electric border border-canvas rounded-xl text-white outline-none" />
 </div>
 </div>

 <button
 onClick={generate}
 className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary transition-colors"
 >
 생성하기
 </button>
 {result.length > 0 && (
 <div className="mt-6 p-6 bg-electric rounded-xl border border-canvas text-center">
 <div className="flex flex-wrap justify-center gap-3">
 {result.map((n) => (
 <div key={n} className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center font-black text-navy shadow-lg">
 {n}
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 <div className="mt-8">
 </div>
 </div>
 );
}
