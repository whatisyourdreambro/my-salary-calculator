// src/components/SocialProof.tsx
//
// 메인 페이지 신뢰 시그널 (E-E-A-T 강화).
// 가짜 데이터는 절대 금지 — AdSense 정책·사용자 신뢰도 측면에서 매우 위험.
// 실제로 측정 가능한 정량 지표만 표시.

import { CheckCircle2, FileText, Shield, Calendar } from "lucide-react";

const TRUST_SIGNALS = [
 {
 icon: Calendar,
 title: "2026 세법 100% 반영",
 description: "근로소득세·4대보험 요율 자동 업데이트",
 },
 {
 icon: FileText,
 title: "공식 데이터 기반",
 description: "국세청·국민연금·건강보험·근로복지공단 자료",
 },
 {
 icon: Shield,
 title: "개인정보 0건 수집",
 description: "계산 결과는 사용자 브라우저에만 저장",
 },
 {
 icon: CheckCircle2,
 title: "100% 무료",
 description: "회원가입 없이 모든 계산기 무제한 이용",
 },
];

export default function SocialProof() {
 return (
 <section className="py-12 px-4 bg-white border-y border-canvas-200">
 <div className="max-w-5xl mx-auto">
 <h2 className="text-center text-sm font-black text-faint-blue uppercase tracking-widest mb-8">
 머니샐러리를 신뢰할 수 있는 이유
 </h2>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {TRUST_SIGNALS.map((signal) => {
 const Icon = signal.icon;
 return (
 <div
 key={signal.title}
 className="flex flex-col items-center text-center p-4"
 >
 <div className="w-12 h-12 rounded-2xl bg-electric-10 flex items-center justify-center mb-3">
 <Icon className="w-6 h-6 text-electric" />
 </div>
 <p className="font-bold text-navy text-sm mb-1">
 {signal.title}
 </p>
 <p className="text-xs text-muted-blue leading-relaxed">
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
