// src/components/SimpleCalculatorView.tsx
//
// 100가지 단순 계산기 공통 UI.
// slug props 받아 client에서 직접 calculator 정의 import (function 직렬화 회피).

"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Calculator, ArrowRight, AlertTriangle, HelpCircle, Sigma, Share2 } from "lucide-react";
import { getCalculatorBySlug } from "@/lib/simpleCalculators";
import { CalcResultAd, InArticleAd } from "./AdPlacement";
import JsonLd from "./JsonLd";
import { faqLd } from "@/lib/structuredData";
import ShareButtons from "./ShareButtons";
import { haptic } from "@/lib/haptic";

// 차트는 결과 카드 진입 시점에만 로드 (recharts ~95KB 지연 로드)
const ResultBreakdown = dynamic(() => import("./calc/ResultBreakdown"), {
 ssr: false,
 loading: () => null,
});

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
 <main className="min-h-screen bg-canvas dark:bg-canvas-950 pt-28">
 <div className="max-w-3xl mx-auto px-4">
 <p className="text-center text-muted-blue dark:text-canvas-300">계산기를 불러올 수 없습니다.</p>
 </div>
 </main>
 );
 }

 const handleChange = (name: string, value: string) => {
 const num = Number(value.replace(/,/g, ""));
 if (!isNaN(num)) {
 setInputs((prev) => ({ ...prev, [name]: num }));
 haptic("light");
 }
 };

 // secondary 항목들이 모두 같은 단위(suffix)일 때만 차트 의미 있음.
 const breakdownItems = useMemo(() => {
 const sec = result?.secondary;
 if (!sec || sec.length < 2) return null;
 const firstSuffix = sec[0].suffix;
 if (!sec.every((s) => s.suffix === firstSuffix)) return null;
 // 음수 값이 섞여 있으면 차트 의미 모호 → 제외
 if (sec.some((s) => s.value < 0)) return null;
 return sec.map((s) => ({ label: s.label, value: s.value, suffix: s.suffix }));
 }, [result]);

 return (
 <main className="min-h-screen bg-canvas dark:bg-canvas-950 pb-20 pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-4">
 {calc.categoryLabel}
 </p>
 <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 mb-3">
 {calc.title}
 </h1>
 <p className="text-base text-muted-blue dark:text-canvas-300 leading-relaxed max-w-2xl mx-auto">
 {calc.description}
 </p>
 </div>

 <section className="p-6 sm:p-8 bg-white dark:bg-canvas-900 rounded-3xl border border-canvas-200 dark:border-canvas-800 mb-6">
 <h2 className="text-sm font-black text-navy dark:text-canvas-50 mb-6 flex items-center gap-2">
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
 className="w-full px-4 py-3 bg-canvas rounded-xl text-base font-bold text-navy border-2 border-transparent focus:border-electric focus:outline-none focus:ring-4 focus:ring-primary-10 transition-all duration-150"
 placeholder={field.defaultValue.toLocaleString("ko-KR")}
 aria-label={field.label}
 />
 {field.hint && (
 <p className="text-xs text-faint-blue mt-2">{field.hint}</p>
 )}
 </div>
 ))}
 </div>
 </section>

 <section
 className="p-6 sm:p-8 bg-electric rounded-3xl text-white mb-6 shadow-primary-lg"
 aria-live="polite"
 aria-atomic="true"
 >
 <p className="text-xs font-bold opacity-90 mb-2">{result.primary.label}</p>
 <p className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums mb-6">
 {formatNumber(result.primary.value, result.primary.suffix)}
 </p>

 {/* 시각화 차트 — 같은 단위의 보조 항목이 2개 이상일 때만 자동 노출 */}
 {breakdownItems && (
 <div className="mb-5 -mx-1">
 <ResultBreakdown items={breakdownItems} surface="onDark" />
 </div>
 )}

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

 {/* 결과 공유 — 토스/네이버 스타일: 결과 직후 강조 */}
 <section className="p-5 bg-white rounded-2xl border border-canvas-200 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 dark:bg-canvas-900 dark:border-canvas-800">
 <div className="flex items-start gap-3">
 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-electric-10 text-electric flex-shrink-0">
 <Share2 className="h-4 w-4" aria-hidden="true" />
 </div>
 <div>
 <p className="text-sm font-bold text-navy dark:text-canvas-50">결과를 공유해 보세요</p>
 <p className="text-xs text-faint-blue mt-0.5">친구·가족·SNS로 빠르게 전송</p>
 </div>
 </div>
 <ShareButtons
 title={`${calc.title} 결과 — Moneysalary`}
 description={`${calc.title}: ${formatNumber(result.primary.value, result.primary.suffix)}`}
 />
 </section>

 <CalcResultAd />

 {calc.explanation && (
 <section className="p-6 bg-white rounded-2xl border border-canvas-200 mb-6">
 <h3 className="text-sm font-black text-navy mb-3">계산 방식</h3>
 <p className="text-sm text-muted-blue leading-relaxed whitespace-pre-line">
 {calc.explanation}
 </p>
 </section>
 )}

 {calc.formula && (
 <section className="p-6 bg-canvas-100 rounded-2xl border border-canvas-200 mb-6">
 <h3 className="text-sm font-black text-navy mb-3 flex items-center gap-2">
 <Sigma className="w-4 h-4 text-electric" />
 계산 공식
 </h3>
 <code className="block text-sm text-navy font-mono bg-white p-3 rounded-lg border border-canvas-200 leading-relaxed">
 {calc.formula}
 </code>
 </section>
 )}

 {calc.faqs && calc.faqs.length > 0 && (
 <>
 <JsonLd
 data={faqLd(
 calc.faqs.map((f) => ({ question: f.q, answer: f.a }))
 )}
 />
 {/* FAQ 직전 추가 광고 — 결과~FAQ 사이 viewability 최상위 */}
 <InArticleAd />
 <section className="p-6 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-800 mb-6">
 <h3 className="text-sm font-black text-navy dark:text-canvas-50 mb-4 flex items-center gap-2">
 <HelpCircle className="w-4 h-4 text-electric" />
 자주 묻는 질문
 </h3>
 <div className="space-y-3">
 {calc.faqs.map((item) => (
 <details
 key={item.q}
 className="group p-4 bg-canvas-50 rounded-xl border border-canvas-200"
 >
 <summary className="flex items-start justify-between gap-3 cursor-pointer text-sm font-bold text-navy">
 <span>{item.q}</span>
 <ArrowRight className="w-4 h-4 text-electric flex-shrink-0 mt-0.5 transition-transform group-open:rotate-90" />
 </summary>
 <p className="mt-3 text-sm text-muted-blue leading-relaxed whitespace-pre-line">
 {item.a}
 </p>
 </details>
 ))}
 </div>
 </section>
 </>
 )}

 {calc.caveats && calc.caveats.length > 0 && (
 <section className="p-6 bg-warning-50 rounded-2xl border border-warning-20 mb-6">
 <h3 className="text-sm font-black text-warning-700 mb-3 flex items-center gap-2">
 <AlertTriangle className="w-4 h-4 text-warning" aria-hidden="true" />
 유의사항
 </h3>
 <ul className="space-y-2 text-sm text-warning-700/85 leading-relaxed">
 {calc.caveats.map((item, idx) => (
 <li key={idx} className="flex gap-2">
 <span className="text-warning font-bold">·</span>
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </section>
 )}

 {calc.relatedSlugs && calc.relatedSlugs.length > 0 && (
 <section className="p-6 bg-white rounded-2xl border border-canvas-200 mb-6">
 <h3 className="text-sm font-black text-navy mb-4">관련 계산기</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {calc.relatedSlugs
 .map((s) => getCalculatorBySlug(s))
 .filter((c): c is NonNullable<typeof c> => Boolean(c))
 .map((rel) => (
 <Link
 key={rel.slug}
 href={`/calc/${rel.slug}`}
 className="group flex items-start gap-2 p-3 bg-canvas-50 rounded-xl border border-canvas-200 hover:border-electric transition-all"
 >
 <ArrowRight className="w-4 h-4 text-electric flex-shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
 <div>
 <p className="text-sm font-bold text-navy group-hover:text-electric transition-colors">
 {rel.title}
 </p>
 <p className="text-xs text-faint-blue mt-1 line-clamp-1">
 {rel.description}
 </p>
 </div>
 </Link>
 ))}
 </div>
 </section>
 )}
 </div>
 </main>
 );
}
