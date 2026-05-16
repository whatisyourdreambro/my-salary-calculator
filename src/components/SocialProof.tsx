// src/components/SocialProof.tsx
//
// 메인 페이지 E-E-A-T 신뢰 시그널.
// 실제 측정 가능한 데이터만 표시 — 가짜 수치 절대 금지.

import { CheckCircle2, FileText, Shield, Zap } from "lucide-react";

const TRUST_SIGNALS = [
  {
    icon: Zap,
    stat: "5초",
    title: "즉시 계산",
    description: "입력하는 즉시 실시간 결과",
  },
  {
    icon: FileText,
    stat: "100+",
    title: "금융 계산기",
    description: "연봉·대출·세금·부동산 전 분야",
  },
  {
    icon: CheckCircle2,
    stat: "2026",
    title: "세법 완벽 반영",
    description: "국세청·4대보험 공식 요율 기준",
  },
  {
    icon: Shield,
    stat: "0건",
    title: "개인정보 미수집",
    description: "회원가입 없이 완전 무료 이용",
  },
];

export default function SocialProof() {
  return (
    <section className="py-10 px-4 bg-white border-y border-canvas-200">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-[11px] font-extrabold text-faint-blue uppercase tracking-[0.12em] mb-8">
          머니샐러리를 신뢰할 수 있는 이유
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-canvas-200">
          {TRUST_SIGNALS.map((signal) => {
            const Icon = signal.icon;
            return (
              <div
                key={signal.title}
                className="flex flex-col items-center text-center px-4 py-6 bg-white"
              >
                <div className="w-11 h-11 rounded-2xl bg-electric-10 border border-electric/20 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-electric" />
                </div>
                <p className="text-[1.5rem] font-black text-electric tracking-tight leading-none mb-1">
                  {signal.stat}
                </p>
                <p className="font-bold text-navy text-[13.5px] mb-1">
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
