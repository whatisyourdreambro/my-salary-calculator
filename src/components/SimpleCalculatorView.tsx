// src/components/SimpleCalculatorView.tsx
//
// 100가지 단순 계산기 공통 UI.
// slug props 받아 client에서 직접 calculator 정의 import (function 직렬화 회피).

"use client";

import { useState, useMemo, useRef, useEffect, useId } from "react";
import Link from "@/components/AppLink";
import { Calculator, ArrowRight, AlertTriangle, HelpCircle, Sigma } from "lucide-react";
import { getCalculatorBySlug } from "@/lib/simpleCalculators";
import { CalcResultAd, GuideMidAd, InArticleAd } from "./AdPlacement";
import JsonLd from "./JsonLd";
import ShareSection from "./ShareSection";
import FavoritesButton from "./FavoritesButton";
import Breadcrumbs from "./Breadcrumbs";
import { faqLd } from "@/lib/structuredData";
import { SITE_CONFIG } from "@/lib/seo";

interface Props {
 slug: string;
}

const formatNumber = (v: number, suffix?: string): string => {
 if (!Number.isFinite(v)) return "—"; // NaN/Infinity 공통 가드 (0 나눗셈·로그 등)
 if (suffix === "%") return `${v.toFixed(2)}%`;
 // 금액(원)은 반드시 원 단위 정확값으로 — 이 사이트의 계산기는 "정확한 금액"이
 // 존재 이유다. 종전 구현은 1만~1억 구간을 `(v/10000).toFixed(0)만` 으로 압축해
 // 환산 시급 23,974원을 "2만원"(-16.6%), 주휴수당 82,560원을 "8만원"으로 표시했다
 // (2026-09-06 전수검사 실브라우저 실측). 1억 이상도 억 단위 2자리라 ±50만원까지
 // 어긋났다. 압축 표기는 아래 compact 로 옮겨 보조 표기로만 쓴다.
 if (suffix === "원") return `${Math.round(v).toLocaleString("ko-KR")}원`;
 if (suffix) return `${Math.round(v).toLocaleString("ko-KR")}${suffix}`;
 return v.toLocaleString("ko-KR");
};

/** 큰 금액의 보조 표기 — "3억 85만" 처럼 감을 잡아 주되 정확값을 대체하지 않는다. */
const compactKo = (v: number): string | null => {
 if (!Number.isFinite(v)) return null;
 const abs = Math.abs(Math.round(v));
 if (abs < 10000) return null;
 const sign = v < 0 ? "-" : "";
 const eok = Math.floor(abs / 100000000);
 const man = Math.floor((abs % 100000000) / 10000);
 if (eok > 0) return `${sign}${eok}억${man > 0 ? ` ${man.toLocaleString("ko-KR")}만` : ""}`;
 return `${sign}${man.toLocaleString("ko-KR")}만`;
};

export default function SimpleCalculatorView({ slug }: Props) {
 const calc = getCalculatorBySlug(slug);
 // label htmlFor ↔ input id 연결용 인스턴스 고유 접두사 (간이 계산기 ~100종 일괄)
 const fieldIdPrefix = useId();
 const resultCardRef = useRef<HTMLElement | null>(null);
 const [inputs, setInputs] = useState<Record<string, number>>(() => {
 if (!calc) return {};
 const init: Record<string, number> = {};
 calc.fields.forEach((f) => {
 init[f.name] = f.defaultValue;
 });
 return init;
 });

 // 입력창에 실제로 찍힌 문자열. 숫자 state 와 분리해야 소수점을 입력할 수 있다.
 // 종전에는 value 를 inputs[name].toLocaleString() 으로 되돌렸기 때문에,
 // "3." 을 치는 순간 Number("3.")=3 → 리렌더로 DOM 이 "3" 으로 복구되어
 // 소수점이 사라졌다. 금리 3.5% 를 입력하면 35% 가 확정돼 월 상환액이 6배로
 // 계산됐다(2026-09-06 전수검사 실브라우저 실측: 143만원 → 875만원).
 const [rawInputs, setRawInputs] = useState<Record<string, string>>(() => {
 if (!calc) return {};
 const init: Record<string, string> = {};
 calc.fields.forEach((f) => {
 init[f.name] = String(f.defaultValue);
 });
 return init;
 });

 // 결과 재현 링크(?v=base64) 복원 — 공유받은 사람이 보낸 사람과 같은 결과를 봄.
 // SSR 프리렌더는 기본값으로 렌더하고 마운트 후 적용 (hydration mismatch 회피).
 useEffect(() => {
 if (!calc) return;
 try {
 const v = new URLSearchParams(window.location.search).get("v");
 if (!v) return;
 const data = JSON.parse(atob(v)) as Record<string, unknown>;
 const restored: Record<string, number> = {};
 let valid = false;
 calc.fields.forEach((f) => {
 const n = Number(data[f.name]);
 if (Number.isFinite(n) && n >= 0) {
 restored[f.name] = n;
 valid = true;
 }
 });
 if (valid) {
 setInputs((prev) => ({ ...prev, ...restored }));
 setRawInputs((prev) => {
 const next = { ...prev };
 for (const [k, n] of Object.entries(restored)) next[k] = String(n);
 return next;
 });
 }
 } catch {
 // 잘못된 공유 링크 — 기본값 유지
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [slug]);

 const result = useMemo(() => {
 if (!calc) return null;
 return calc.compute(inputs);
 }, [calc, inputs]);

 // 입력이 기본값 그대로면 깔끔한 canonical, 바꿨으면 결과 재현 링크로 공유
 // 채널 귀속 utm 은 ShareSection→ShareButtons 가 채널별 withUtm 으로 부여(`?v=` 뒤에 `&utm_…` 결합).
 const shareUrl = useMemo(() => {
 const base = `${SITE_CONFIG.url}/calc/${slug}`;
 if (!calc) return base;
 const isDefault = calc.fields.every((f) => inputs[f.name] === f.defaultValue);
 if (isDefault) return base;
 try {
 return `${base}?v=${btoa(JSON.stringify(inputs))}`;
 } catch {
 return base;
 }
 }, [calc, slug, inputs]);

 // 결과 카드 캡처 → 인스타·시스템 공유에서 이미지 파일로 전송
 const getShareImage = async (): Promise<Blob | null> => {
 if (!resultCardRef.current) return null;
 try {
 const { default: html2canvas } = await import("html2canvas");
 const canvas = await html2canvas(resultCardRef.current, {
 backgroundColor: "#0145F2",
 scale: 2,
 });
 return await new Promise<Blob | null>((resolve) =>
 canvas.toBlob((blob) => resolve(blob), "image/png")
 );
 } catch {
 return null;
 }
 };

 if (!calc || !result) {
 return (
 <main className="min-h-screen bg-canvas dark:bg-canvas-950 pt-28">
 <div className="max-w-3xl mx-auto px-4">
 <p className="text-center text-muted-blue dark:text-canvas-300">계산기를 불러올 수 없습니다.</p>
 </div>
 </main>
 );
 }

 // 표시용 문자열은 사용자가 친 그대로 두고(소수점 입력 중 상태 포함),
 // 계산에는 파싱된 숫자만 쓴다. 숫자·소수점·선행 부호 외 입력은 무시한다.
 const handleChange = (name: string, value: string) => {
 const cleaned = value.replace(/,/g, "");
 if (cleaned !== "" && !/^-?\d*\.?\d*$/.test(cleaned)) return;
 setRawInputs((prev) => ({ ...prev, [name]: cleaned }));
 const num =
 cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-."
 ? 0
 : Number(cleaned);
 if (Number.isFinite(num)) {
 setInputs((prev) => ({ ...prev, [name]: num }));
 }
 };

 /** 정수부만 천단위 구분 — 입력 중인 소수부("3." · "3.5")를 보존한다. */
 const displayValue = (rawValue: string): string => {
 if (rawValue === "" || rawValue === "-") return rawValue;
 const negative = rawValue.startsWith("-");
 const body = negative ? rawValue.slice(1) : rawValue;
 const [intPart, fracPart] = body.split(".");
 const grouped = intPart === "" ? "" : Number(intPart).toLocaleString("ko-KR");
 const decimals = body.includes(".") ? `.${fracPart ?? ""}` : "";
 return `${negative ? "-" : ""}${grouped}${decimals}`;
 };

 return (
 <main className="min-h-screen bg-canvas dark:bg-canvas-950 pb-20 pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <Breadcrumbs path={`/calc/${slug}`} leafName={calc.title} className="mb-6" />
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
 <div className="mt-4 flex justify-center">
 <FavoritesButton path={`/calc/${slug}`} title={calc.title} />
 </div>
 </div>

 <section className="p-6 sm:p-8 bg-white dark:bg-canvas-900 rounded-3xl border border-canvas-200 dark:border-canvas-800 mb-6">
 <h2 className="text-sm font-black text-navy dark:text-canvas-50 mb-6 flex items-center gap-2">
 <Calculator className="w-4 h-4 text-electric" />
 입력값
 </h2>
 <div className="space-y-5">
 {calc.fields.map((field) => (
 <div key={field.name}>
 <label
 htmlFor={`${fieldIdPrefix}${field.name}`}
 className="block text-sm font-bold text-navy mb-2"
 >
 {field.label}
 {field.suffix && (
 <span className="text-xs text-faint-blue font-medium ml-1">
 ({field.suffix})
 </span>
 )}
 </label>
 <input
 id={`${fieldIdPrefix}${field.name}`}
 type="text"
 // decimal: 모바일 키패드에 소수점 키가 나온다(numeric 은 정수 전용이라
 // 금리 3.5 를 입력할 방법이 아예 없었다).
 inputMode="decimal"
 value={displayValue(rawInputs[field.name] ?? "")}
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

 <section ref={resultCardRef} className="p-6 sm:p-8 bg-electric rounded-3xl text-white mb-6">
 <p className="text-xs font-bold opacity-90 mb-2">{result.primary.label}</p>
 <p className="text-3xl sm:text-5xl font-black tracking-tight tabular-nums break-keep">
 {formatNumber(result.primary.value, result.primary.suffix)}
 </p>
 {/* 정확값 아래에 억/만 감각 표기 — 정확값을 대체하지 않는 보조 표기 */}
 {result.primary.suffix === "원" &&
 typeof result.primary.value === "number" &&
 compactKo(result.primary.value) && (
 <p className="text-sm font-bold opacity-80 mt-1">
 ≈ {compactKo(result.primary.value)}원
 </p>
 )}
 <div className="mb-6" />
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

 {/* ★수익 우선: CalcResultAd는 "결과 직하 viewability 최상위" 슬롯 —
     반드시 결과 바로 아래 유지. 공유 섹션은 광고 아래 배치 (2026-08-16
     광고 수익 급락 대응 — 공유 섹션이 광고를 밀어내면 RPM 하락) */}
 <CalcResultAd />

 <ShareSection
 contentType="calc_result"
 title={`${calc.title} — ${result.primary.label} ${formatNumber(result.primary.value, result.primary.suffix)}`}
 description={calc.description}
 url={shareUrl}
 getShareImage={getShareImage}
 className="mb-6"
 />

 {calc.explanation && (
 <section className="p-6 bg-white rounded-2xl border border-canvas-200 mb-6">
 <h3 className="text-sm font-black text-navy mb-3">계산 방식</h3>
 <p className="text-sm text-muted-blue leading-relaxed whitespace-pre-line">
 {calc.explanation}
 </p>
 </section>
 )}

 {/* 계산 방식 ↔ 공식 사이 — 이 페이지에서 유일하게 GUIDE_MID 슬롯 미사용이었음 (Phase 1) */}
 {calc.explanation && <GuideMidAd />}

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
 <section className="p-6 bg-amber-50 rounded-2xl border border-amber-200 mb-6">
 <h3 className="text-sm font-black text-navy mb-3 flex items-center gap-2">
 <AlertTriangle className="w-4 h-4 text-amber-600" />
 유의사항
 </h3>
 <ul className="space-y-2 text-sm text-muted-blue leading-relaxed">
 {calc.caveats.map((item, idx) => (
 <li key={idx} className="flex gap-2">
 <span className="text-amber-600 font-bold">·</span>
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
