// src/components/SimpleCalculatorView.tsx
//
// 100가지 단순 계산기 공통 UI.
// slug props 받아 client에서 직접 calculator 정의 import (function 직렬화 회피).

"use client";

import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";
import { getCalculatorBySlug } from "@/lib/simpleCalculators";

interface Props {
 slug: string;
}

const formatNumber = (v: number, suffix?: string): string => {
 if (suffix === "%") return `${v.toFixed(2)}%`;
 if (Math.abs(v) >= 100000000) return `${(v / 100000000).toFixed(2)}억${suffix || ""}`;
 if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(0)}만${suffix || ""}`;
 if (suffix) return `${Math.round(v).toLocaleString("ko-KR")}${suffix}`;
 return v.toLocaleString("ko-KR");
};

export default function SimpleCalculatorView({ slug }: Props) {
 const calc = getCalculatorBySlug(slug);
 const [inputs, setInputs] = useState<Record<string, number>>(() => {
 if (!calc) return {};
 const init: Record<string, number> = {};
 calc.fields.forEach((f) => {
 init[f.name] = f.defaultValue;
 });
 return init;
 });

 const result = useMemo(() => {
 if (!calc) return null;
 return calc.compute(inputs);
 }, [calc, inputs]);

 if (!calc || !result) {
 return (
 <main className="min-h-screen bg-canvas pt-28">
 <div className="max-w-3xl mx-auto px-4">
 <p className="text-center text-muted-blue">계산기를 불러올 수 없습니다.</p>
 </div>
 </main>
 );
 }

 const handleChange = (name: string, value: string) => {
 const num = Number(value.replace(/,/g, ""));
 if (!isNaN(num)) {
 setInputs((prev) => ({ ...prev, [name]: num }));
 }
 };

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-4">
 {calc.categoryLabel}
 </p>
 <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy mb-3">
 {calc.title}
 </h1>
 <p className="text-base text-muted-blue leading-relaxed max-w-2xl mx-auto">
 {calc.description}
 </p>
 </div>

 <section className="p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200 mb-6">
 <h2 className="text-sm font-black text-navy mb-6 flex items-center gap-2">
 <Calculator className="w-4 h-4 text-electric" />
 입력값
 </h2>
 <div className="space-y-5">
 {calc.fields.map((field) => (
 <div key={field.name}>
 <label className="block text-sm font-bold text-navy mb-2">
 {field.label}
 {field.suffix && (
 <span className="text-xs text-faint-blue font-medium ml-1">
 ({field.suffix})
 </span>
 )}
 </label>
 <input
 type="text"
 inputMode="numeric"
 value={inputs[field.name]?.toLocaleString("ko-KR") || ""}
 onChange={(e) => handleChange(field.name, e.target.value)}
 className="w-full px-4 py-3 bg-canvas rounded-xl text-base font-bold text-navy border border-transparent focus:border-electric focus:outline-none transition-colors"
 placeholder={field.defaultValue.toLocaleString("ko-KR")}
 />
 {field.hint && (
 <p className="text-xs text-faint-blue mt-2">{field.hint}</p>
 )}
 </div>
 ))}
 </div>
 </section>

 <section className="p-6 sm:p-8 bg-electric rounded-3xl text-white mb-6">
 <p className="text-xs font-bold opacity-90 mb-2">{result.primary.label}</p>
 <p className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums mb-6">
 {formatNumber(result.primary.value, result.primary.suffix)}
 </p>
 {result.secondary && result.secondary.length > 0 && (
 <div className="border-t border-white/20 pt-5 space-y-2">
 {result.secondary.map((item, idx) => (
 <div key={idx} className="flex justify-between items-center">
 <span className="text-sm text-white/80">{item.label}</span>
 <span className="font-bold tabular-nums text-white">
 {formatNumber(item.value, item.suffix)}
 </span>
 </div>
 ))}
 </div>
 )}
 {result.note && (
 <p className="mt-5 pt-5 border-t border-white/20 text-xs text-white/85 leading-relaxed">
 💡 {result.note}
 </p>
 )}
 </section>

 {calc.explanation && (
 <section className="p-6 bg-white rounded-2xl border border-canvas-200 mb-6">
 <h3 className="text-sm font-black text-navy mb-3">계산 방식</h3>
 <p className="text-sm text-muted-blue leading-relaxed">
 {calc.explanation}
 </p>
 </section>
 )}
 </div>
 </main>
 );
}
