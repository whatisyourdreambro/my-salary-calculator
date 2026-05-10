// src/components/SocialProof.tsx
//
// 메인 페이지 신뢰 시그널 (E-E-A-T 강화).
// 가짜 데이터는 절대 금지 — AdSense 정책·사용자 신뢰도 측면에서 매우 위험.
// 실제로 측정 가능한 정량 지표만 표시.

import { CheckCircle2, FileText, Shield, Calendar } from "lucide-react";

const TRUST_SIGNALS = [
 {
 icon: Calendar,
 highlight: "2026",
 highlightSuffix: "년",
 title: "최신 세법 100% 반영",
 description: "근로소득세·4대보험 요율 자동 업데이트",
 },
 {
 icon: FileText,
 highlight: "공식",
 title: "공식 데이터 기반",
 description: "국세청·국민연금·건강보험·근로복지공단 자료",
 },
 {
 icon: Shield,
 highlight: "0",
 highlightSuffix: "건",
 title: "개인정보 0건 수집",
 description: "계산 결과는 사용자 브라우저에만 저장",
 },
 {
 icon: CheckCircle2,
 highlight: "100",
 highlightSuffix: "%",
 title: "100% 무료",
 description: "회원가입 없이 모든 계산기 무제한 이용",
 },
];

export default function SocialProof() {
 return (
 <section className="py-section-md px-4 bg-white border-y border-canvas-200 dark:bg-canvas-950 dark:border-canvas-800">
 <div className="max-w-5xl mx-auto">
 <h2 className="text-center text-[11px] font-black text-faint-blue uppercase tracking-[0.2em] mb-2">
 Trust Signals
 </h2>
 <p className="text-center text-[clamp(1.125rem,2.2vw,1.5rem)] font-extrabold text-navy dark:text-canvas-50 tracking-tight mb-10">
 머니샐러리를 신뢰할 수 있는 이유
 </p>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
 {TRUST_SIGNALS.map((signal) => {
 const Icon = signal.icon;
 return (
 <div
 key={signal.title}
 className="group relative flex flex-col items-start text-left p-5 sm:p-6 bg-canvas dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-800 transition-all duration-200 hover:border-electric hover:-translate-y-0.5 hover:shadow-card-hover"
 >
 <div className="w-11 h-11 rounded-xl bg-white dark:bg-canvas-950 border border-canvas-200 dark:border-canvas-700 flex items-center justify-center mb-4 group-hover:bg-electric group-hover:border-electric group-hover:text-white text-electric transition-colors duration-200">
 <Icon className="w-5 h-5" aria-hidden="true" />
 </div>
 <p className="font-black text-navy dark:text-canvas-50 text-[clamp(1.5rem,2.5vw,1.875rem)] leading-none mb-1 tabular-nums tracking-tight">
 {signal.highlight}
 {signal.highlightSuffix && (
 <span className="text-[0.5em] font-bold ml-0.5 text-muted-blue dark:text-canvas-300">
 {signal.highlightSuffix}
 </span>
 )}
 </p>
 <p className="font-bold text-navy dark:text-canvas-100 text-[13.5px] mb-1 leading-tight">
 {signal.title}
 </p>
 <p className="text-[12px] text-faint-blue leading-relaxed">
 {signal.description}
 </p>
 </div>
 );
 })}
 </div>
 </div>
 </section>
 );
}
